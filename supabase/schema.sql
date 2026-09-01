-- Climb Atlas — Supabase schema
-- ------------------------------------------------------------
-- Run this once in your Supabase project's SQL Editor (Dashboard > SQL Editor > New query),
-- before running supabase/seed.html. Safe to re-run — every statement is idempotent.
--
-- This replaces the old localStorage-based storage.js shim. Approved spots (seed +
-- community additions) live in `spots`. New submissions and proposed edits sit in a
-- moderation queue until a moderator (listed in `moderators`) approves them — see
-- "Moderation model" below. Per-user "climbed" / "bookmarked" marks live in a separate
-- `marks` table locked down so each signed-in user only ever sees or changes their own.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- moderators: accounts allowed to approve/reject submissions.
-- No one can add themselves — you add the first moderator yourself via the SQL
-- editor after signing in once (see README "Setup").
-- ---------------------------------------------------------------------------
create table if not exists public.moderators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.moderators enable row level security;

-- Deliberately narrow: a user can only check whether *they themselves* are a
-- moderator. This is also what makes `auth.uid() in (select user_id from
-- moderators)` work correctly elsewhere in this file — under RLS, that subquery
-- only ever returns the calling user's own row (if any), which is exactly the
-- "am I a moderator" check every other policy below relies on.
drop policy if exists "users can check their own moderator status" on public.moderators;
create policy "users can check their own moderator status"
  on public.moderators for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- spots: every gym/crag pin on the live map (seed data + approved submissions)
-- ---------------------------------------------------------------------------
create table if not exists public.spots (
  id text primary key,
  name text not null,
  suburb text not null,
  state text not null,
  country text not null default 'AU',
  lat double precision not null,
  lng double precision not null,
  types text[] not null default '{}',
  notes text,
  photo text,
  address text,
  community boolean not null default false,
  edited boolean not null default false,
  status text not null default 'approved' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If this table already existed (from before multi-country / moderation support),
-- these add the new columns without touching existing rows — they all default to
-- 'AU' / 'approved', i.e. everything already live stays live.
-- `state` values are only unique *within* a country (e.g. AU's "WA" for Western
-- Australia vs US's "WA" for Washington), so country + state together identify
-- a region — never filter or color by `state` alone.
alter table public.spots add column if not exists country text not null default 'AU';
alter table public.spots add column if not exists status text not null default 'approved';
alter table public.spots drop constraint if exists spots_status_check;
alter table public.spots add constraint spots_status_check check (status in ('pending', 'approved'));
alter table public.spots add column if not exists address text;
-- Tracks who proposed a community spot, so the INSERT policy below can require
-- sign-in and rate-limit per account. Null for seed/legacy rows (nobody "submitted"
-- those) and for anything inserted before this column existed.
alter table public.spots add column if not exists submitted_by uuid references auth.users(id);

alter table public.spots enable row level security;

-- Moderation model: the public only ever sees approved spots. Only a signed-in user
-- can propose a brand-new spot (rate-limited to 10 per rolling 24h, below), but it's
-- forced to land as 'pending' regardless — the INSERT policy's WITH CHECK makes it
-- impossible for a client to insert a pre-approved row. Only a moderator can flip it
-- to 'approved' (via UPDATE) or remove it entirely if rejected (via DELETE). Direct
-- UPDATEs to an already-live spot are moderators-only too — a normal user proposing
-- an edit to an existing spot goes through the separate `pending_edits` queue below
-- instead, so the live spot keeps showing its current approved data until that edit
-- is approved.
drop policy if exists "spots are publicly readable" on public.spots;
drop policy if exists "approved spots are publicly readable, moderators see all" on public.spots;
drop policy if exists "approved spots are publicly readable, moderators see all, submitters see their own" on public.spots;
create policy "approved spots are publicly readable, moderators see all, submitters see their own"
  on public.spots for select
  using (
    status = 'approved'
    or auth.uid() in (select user_id from public.moderators)
    or submitted_by = auth.uid()
  );

-- Signed-in only, and capped at 10 proposals per rolling 24h per account -- the
-- subquery counts this same user's own recent submissions (visible to them under
-- the SELECT policy just above) and the new row is rejected once that count already
-- hits 10, same idea as any simple abuse-rate-limit. `submitted_by = auth.uid()`
-- also stops one user from attributing a submission to somebody else's account.
drop policy if exists "anyone can add spots" on public.spots;
drop policy if exists "anyone can propose a new spot as pending" on public.spots;
drop policy if exists "signed-in users can propose a new spot as pending, rate-limited" on public.spots;
create policy "signed-in users can propose a new spot as pending, rate-limited"
  on public.spots for insert
  with check (
    status = 'pending'
    and auth.uid() is not null
    and submitted_by = auth.uid()
    and (
      select count(*) from public.spots
      where submitted_by = auth.uid()
        and created_at > now() - interval '1 day'
    ) < 10
  );

drop policy if exists "anyone can edit spots" on public.spots;
drop policy if exists "moderators can update spots" on public.spots;
create policy "moderators can update spots"
  on public.spots for update
  using (auth.uid() in (select user_id from public.moderators));

drop policy if exists "moderators can delete spots" on public.spots;
create policy "moderators can delete spots"
  on public.spots for delete
  using (auth.uid() in (select user_id from public.moderators));

-- ---------------------------------------------------------------------------
-- pending_edits: proposed changes to an already-live spot, awaiting approval.
-- The target spot in `spots` is untouched (and still publicly visible with its
-- current data) until a moderator approves the proposal, which copies these
-- fields onto the spot and deletes this row. Rejecting just deletes this row.
-- ---------------------------------------------------------------------------
create table if not exists public.pending_edits (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null references public.spots(id) on delete cascade,
  name text not null,
  suburb text not null,
  state text not null,
  country text not null,
  lat double precision not null,
  lng double precision not null,
  types text[] not null default '{}',
  notes text,
  photo text,
  address text,
  submitted_at timestamptz not null default now()
);

-- If this table already existed from before the address field was added:
alter table public.pending_edits add column if not exists address text;

alter table public.pending_edits enable row level security;

drop policy if exists "anyone can propose an edit" on public.pending_edits;
create policy "anyone can propose an edit"
  on public.pending_edits for insert
  with check (true);

drop policy if exists "moderators can view pending edits" on public.pending_edits;
create policy "moderators can view pending edits"
  on public.pending_edits for select
  using (auth.uid() in (select user_id from public.moderators));

drop policy if exists "moderators can remove pending edits" on public.pending_edits;
create policy "moderators can remove pending edits"
  on public.pending_edits for delete
  using (auth.uid() in (select user_id from public.moderators));

-- ---------------------------------------------------------------------------
-- reports: free-text "something's wrong with this spot" flags from anyone,
-- signed in or not (same as adding/editing a spot). Deliberately not a
-- structured edit proposal like pending_edits -- just a message a moderator
-- reads and acts on manually (usually by using the existing "Edit this spot"
-- flow themselves, then dismissing the report).
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null references public.spots(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

drop policy if exists "anyone can submit a report" on public.reports;
create policy "anyone can submit a report"
  on public.reports for insert
  with check (true);

drop policy if exists "moderators can view reports" on public.reports;
create policy "moderators can view reports"
  on public.reports for select
  using (auth.uid() in (select user_id from public.moderators));

drop policy if exists "moderators can dismiss reports" on public.reports;
create policy "moderators can dismiss reports"
  on public.reports for delete
  using (auth.uid() in (select user_id from public.moderators));

-- ---------------------------------------------------------------------------
-- marks: a signed-in user's "climbed" / "bookmarked" flags on a spot
-- ---------------------------------------------------------------------------
create table if not exists public.marks (
  user_id uuid not null references auth.users(id) on delete cascade,
  spot_id text not null references public.spots(id) on delete cascade,
  mark_type text not null check (mark_type in ('climbed', 'bookmarked')),
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id, mark_type)
);

alter table public.marks enable row level security;

drop policy if exists "users can view their own marks" on public.marks;
create policy "users can view their own marks"
  on public.marks for select
  using (auth.uid() = user_id);

drop policy if exists "users can add their own marks" on public.marks;
create policy "users can add their own marks"
  on public.marks for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can remove their own marks" on public.marks;
create policy "users can remove their own marks"
  on public.marks for delete
  using (auth.uid() = user_id);

create index if not exists marks_user_id_idx on public.marks (user_id);
