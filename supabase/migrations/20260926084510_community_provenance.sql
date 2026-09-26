-- Community and provenance (docs/DESIGN.md sec. 10, sec. 17 Phase 4; owner decisions 2026-09-26):
--   * NOTHING publishes without review (decision 9: "nothing live yet"): users still only propose; no new write path to
--     live gym rows.
--   * Minimal columns (decision 10): no hours/price/facility columns yet.
--   * Profiles carry a display name only, no handles (decision 6); never an email.
-- Additive except two behaviour changes the product needs: rejected gyms and decided edits are KEPT (status + reason)
-- instead of deleted, so submitters see why and contributor history survives.

-- ===== profiles: public display names for attribution ================================================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- 2-40 visible characters; no '@' (an email is never a display name, sec. 10.2) and no angle brackets.
  constraint profiles_display_name_check check (
    display_name is null or (char_length(btrim(display_name)) between 2 and 40 and display_name !~ '[@<>]')
  )
);
alter table public.profiles enable row level security;
create policy "display names are public" on public.profiles for select using (true);
create policy "users create their own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "users update their own profile" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
create or replace trigger profiles_touch_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ===== spots: verification and kept rejections ========================================================================
alter table public.spots add column if not exists verified_at timestamptz;
alter table public.spots add column if not exists rejection_reason text;
alter table public.spots drop constraint if exists spots_status_check;
alter table public.spots add constraint spots_status_check check (status = any (array['pending', 'approved', 'rejected']));
alter table public.spots drop constraint if exists spots_rejection_reason_check;
alter table public.spots add constraint spots_rejection_reason_check check (rejection_reason is null or char_length(rejection_reason) <= 200);
-- (Visibility is unchanged: the public sees approved rows only; a submitter sees their own rows, now including a
-- rejected one and its reason; moderators see all. Only moderators can update, so only they set status/reason/verified_at.)

-- ===== pending_edits: who, why, and the decision ======================================================================
alter table public.pending_edits add column if not exists submitted_by uuid;
alter table public.pending_edits add column if not exists edit_note text;
alter table public.pending_edits add column if not exists review_requested boolean not null default false;
alter table public.pending_edits add column if not exists status text not null default 'pending';
alter table public.pending_edits add column if not exists decided_at timestamptz;
alter table public.pending_edits add column if not exists rejection_reason text;
alter table public.pending_edits drop constraint if exists pending_edits_status_check;
alter table public.pending_edits add constraint pending_edits_status_check check (status = any (array['pending', 'approved', 'rejected']));
alter table public.pending_edits drop constraint if exists pending_edits_text_lengths_check;
alter table public.pending_edits add constraint pending_edits_text_lengths_check check (
  (edit_note is null or char_length(edit_note) <= 200) and (rejection_reason is null or char_length(rejection_reason) <= 200)
);
create index if not exists pending_edits_spot_status_idx on public.pending_edits (spot_id, status);
create index if not exists pending_edits_submitted_by_idx on public.pending_edits (submitted_by);

-- A proposal is always a fresh, undecided proposal by whoever is signed in (null when signed out): the client cannot
-- forge the submitter, pre-approve itself or attach a decision.
create or replace function public.pin_edit_proposal() returns trigger
  language plpgsql
  set search_path = public
  as $$
begin
  new.submitted_by     := auth.uid();
  new.status           := 'pending';
  new.decided_at       := null;
  new.rejection_reason := null;
  new.submitted_at     := now();
  return new;
end;
$$;
create or replace trigger pending_edits_pin_proposal before insert on public.pending_edits
  for each row execute function public.pin_edit_proposal();

create policy "submitters can view their own edits" on public.pending_edits for select
  using (submitted_by is not null and submitted_by = auth.uid());
create policy "moderators can decide pending edits" on public.pending_edits for update
  using (auth.uid() in (select moderators.user_id from public.moderators))
  with check (auth.uid() in (select moderators.user_id from public.moderators));

-- ===== read-only summaries (SECURITY DEFINER, return no private text) =================================================
-- Provenance line for an approved gym: the adder's display name (null -> "a climber"), distinct contributors (the adder
-- plus authors of approved edits) and the last approved edit. Nothing for pending/rejected gyms.
create or replace function public.spot_provenance(p_spot_id text)
  returns table (added_by text, contributors integer, last_edited timestamptz, verified_at timestamptz)
  language sql stable security definer
  set search_path = public
  as $$
  select
    (select p.display_name from public.profiles p where p.user_id = s.submitted_by),
    (select count(distinct u)::integer from (
       select s.submitted_by as u where s.submitted_by is not null
       union
       select e.submitted_by from public.pending_edits e
        where e.spot_id = s.id and e.status = 'approved' and e.submitted_by is not null) c),
    (select max(e.decided_at) from public.pending_edits e where e.spot_id = s.id and e.status = 'approved'),
    s.verified_at
  from public.spots s
  where s.id = p_spot_id and s.status = 'approved'
$$;

-- Approved gyms with two or more distinct contributors ("community-verified" candidates), for list ring-dots in one call.
create or replace function public.spot_contributor_counts()
  returns table (spot_id text, contributors integer)
  language sql stable security definer
  set search_path = public
  as $$
  select s.id, count(distinct u)::integer
  from public.spots s
  cross join lateral (
    select s.submitted_by as u where s.submitted_by is not null
    union
    select e.submitted_by from public.pending_edits e
     where e.spot_id = s.id and e.status = 'approved' and e.submitted_by is not null
  ) c
  where s.status = 'approved'
  group by s.id
  having count(distinct u) >= 2
$$;

-- Contribution points (sec. 10.6): 15 per approved new gym, 5 per approved edit (a photo is an edit); rejected or
-- removed content scores nothing. Callers get their own points; moderators may ask for any contributors.
create or replace function public.contribution_points(p_users uuid[])
  returns table (user_id uuid, points integer, gyms integer, edits integer)
  language sql stable security definer
  set search_path = public
  as $$
  select u.id,
         (15 * (select count(*) from public.spots s where s.submitted_by = u.id and s.status = 'approved')
          + 5 * (select count(*) from public.pending_edits e where e.submitted_by = u.id and e.status = 'approved'))::integer,
         (select count(*) from public.spots s where s.submitted_by = u.id and s.status = 'approved')::integer,
         (select count(*) from public.pending_edits e where e.submitted_by = u.id and e.status = 'approved')::integer
  from unnest(p_users) as u(id)
  where u.id = auth.uid() or auth.uid() in (select moderators.user_id from public.moderators)
$$;

revoke all on function public.spot_provenance(text) from public;
revoke all on function public.spot_contributor_counts() from public;
revoke all on function public.contribution_points(uuid[]) from public;
-- Supabase's default privileges also grant EXECUTE to anon directly; points are for signed-in users only.
revoke execute on function public.contribution_points(uuid[]) from anon;
grant execute on function public.spot_provenance(text) to anon, authenticated;
grant execute on function public.spot_contributor_counts() to anon, authenticated;
grant execute on function public.contribution_points(uuid[]) to authenticated;
