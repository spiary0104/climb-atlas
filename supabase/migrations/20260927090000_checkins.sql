-- Check-ins (docs/DESIGN.md sec. 11.2, sec. 17 Phase 5; owner decisions 2026-09-27: local migration, note only, 500 m
-- geofence with an "I'm here" fallback enforced in the client). Additive: one new table, no change to existing ones.
--   * Owner-only, like marks: a person reads, adds and deletes only their own check-ins. No updates (a check-in is a
--     dated record; delete and check in again).
--   * user_id and checked_at are pinned server-side (trigger), so a check-in cannot be attributed to someone else or
--     backdated; the passport and milestones are computed from these rows.
--   * Only approved gyms; note <= 140 characters; photo reserved for later (null or an https link).
--   * At most one check-in per gym per 12 hours and 30 per day per person (spam guard; the UI shows "Checked in today").
--     Enforced in the insert trigger under a per-person transaction lock, so simultaneous requests are checked one after
--     another and cannot slip past either limit (a plain check-then-insert let 4 of 8 simultaneous requests through).
--   * A check-in also records the `climbed` mark (sec. 11.2), in the same transaction, with the person's own rights.

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  spot_id text not null references public.spots(id) on delete cascade,
  checked_at timestamptz not null default now(),
  note text,
  photo text,
  created_at timestamptz not null default now(),
  constraint checkins_note_check check (note is null or char_length(note) <= 140),
  constraint checkins_photo_check check (photo is null or photo ~ '^https://')
);
create index if not exists checkins_user_checked_idx on public.checkins (user_id, checked_at desc);
create index if not exists checkins_spot_idx on public.checkins (spot_id);

alter table public.checkins enable row level security;
create policy "users view their own check-ins" on public.checkins for select using (auth.uid() = user_id);
create policy "users check in at approved gyms, rate-limited" on public.checkins for insert with check (
  auth.uid() is not null
  and user_id = auth.uid()
  and exists (select 1 from public.spots s where s.id = spot_id and s.status = 'approved')
  and (select count(*) from public.checkins c where c.user_id = auth.uid() and c.checked_at > now() - interval '1 day') < 30
);
create policy "users delete their own check-ins" on public.checkins for delete using (auth.uid() = user_id);
revoke all on public.checkins from anon;
grant select, insert, delete on public.checkins to authenticated;

-- Pin who and when, then enforce the limits. pg_advisory_xact_lock serialises one person's check-ins until their
-- transaction ends; each query below runs after the lock with a fresh snapshot (READ COMMITTED, PostgREST's default), so
-- it sees any check-in a simultaneous request has just committed. Other people's check-ins are never blocked.
-- The specific messages let the app tell "not eligible", "already here today" and "daily limit" apart.
create or replace function public.pin_checkin()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.user_id := auth.uid();
  new.checked_at := now();
  new.created_at := now();
  if new.user_id is null then
    raise exception 'sign in to check in' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('checkins:' || new.user_id::text, 0));
  if not exists (select 1 from public.spots s where s.id = new.spot_id and s.status = 'approved') then
    raise exception 'this gym is not open for check-ins' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.checkins c
    where c.user_id = new.user_id and c.spot_id = new.spot_id and c.checked_at > now() - interval '12 hours'
  ) then
    raise exception 'already checked in here today' using errcode = 'P0001';
  end if;
  if (select count(*) from public.checkins c where c.user_id = new.user_id and c.checked_at > now() - interval '1 day') >= 30 then
    raise exception 'daily check-in limit reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create or replace trigger checkins_pin before insert on public.checkins
  for each row execute function public.pin_checkin();

-- The climbed mark (sec. 11.2). SECURITY INVOKER: it runs as the person checking in, so the marks RLS still applies.
create or replace function public.checkin_marks_climbed()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.marks (user_id, spot_id, mark_type) values (new.user_id, new.spot_id, 'climbed')
  on conflict (user_id, spot_id, mark_type) do nothing;
  return new;
end;
$$;
create or replace trigger checkins_mark_climbed after insert on public.checkins
  for each row execute function public.checkin_marks_climbed();
