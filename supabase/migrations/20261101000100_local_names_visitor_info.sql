-- China pilot, Gate 1 PR 1 (plan: https://claude.ai/artifact/GVHNLJWVT6gdQyQCVSM4Lm; owner approval 2026-11-01).
--
-- Adds to spots, all optional, null = unknown (the app shows "Not confirmed yet", never a guess):
--   name_local       the gym's name as it writes it locally ("香蕉攀岩(凯德天府店)"); `name` stays the English/Latin name
--   address_local    the local-language address, for showing to a taxi driver ("天仁路388号天府凯德L5-15号")
--   visitor          traveller facts as the gym states them: a JSON object with optional string keys booking, payment,
--                    english_help, id_required, shoe_hire, note (each at most 160 characters)
--   info_source      where hours / day pass / visitor facts came from: an https URL of the gym's own site or own social account
--   info_source_kind 'official-site' | 'official-social' (RedNote, WeChat, Instagram... accounts the gym controls)
--   info_checked_on  the date that source was read
-- The three provenance columns are all set or all null. Only the import pipeline (service role) records provenance:
-- pin_community_submission() now clears them on community submissions, which stay pending and moderated as before.
-- No existing row changes (every new column is null), RLS is unchanged, and the import content hash (normalize.js) does
-- not include these columns, so no planned or applied batch changes meaning.
begin;

alter table public.spots
  add column if not exists name_local       text,
  add column if not exists address_local    text,
  add column if not exists visitor          jsonb,
  add column if not exists info_source      text,
  add column if not exists info_source_kind text,
  add column if not exists info_checked_on  date;

alter table public.spots drop constraint if exists spots_name_local_check;
alter table public.spots add constraint spots_name_local_check check (name_local is null or (
  char_length(btrim(name_local)) between 1 and 120 and name_local !~ '[[:cntrl:]]'));

alter table public.spots drop constraint if exists spots_address_local_check;
alter table public.spots add constraint spots_address_local_check check (address_local is null or (
  char_length(btrim(address_local)) between 1 and 300 and address_local !~ '[[:cntrl:]]'));

-- An object whose only keys are the six visitor facts and whose values are non-empty strings of at most 160 characters.
alter table public.spots drop constraint if exists spots_visitor_check;
alter table public.spots add constraint spots_visitor_check check (visitor is null or (
  jsonb_typeof(visitor) = 'object'
  and (visitor - array['booking','payment','english_help','id_required','shoe_hire','note']) = '{}'::jsonb
  and not jsonb_path_exists(visitor, '$.* ? (@.type() != "string")')
  and not jsonb_path_exists(visitor, '$.* ? (@ like_regex "^.{161}")')
  and not jsonb_path_exists(visitor, '$.* ? (@ == "")')
));

alter table public.spots drop constraint if exists spots_info_source_check;
alter table public.spots add constraint spots_info_source_check check (
  (info_source is null and info_source_kind is null and info_checked_on is null)
  or (info_source is not null and info_source_kind is not null and info_checked_on is not null
      and char_length(info_source) <= 400 and info_source ~ '^https://[^\s]+$'
      and info_source_kind in ('official-site', 'official-social')
      and info_checked_on >= date '2020-01-01'));

-- The submission trigger from 20261003000100, plus: community submissions never carry provenance.
create or replace function public.pin_community_submission() returns trigger
  language plpgsql
  set search_path = public
  as $$
begin
  if auth.uid() is not null then
    new.created_at       := now();
    new.updated_at       := now();
    new.community        := true;
    new.edited           := false;
    new.status           := 'pending';
    new.submitted_by     := auth.uid();
    new.verified_at      := null;
    new.rejection_reason := null;
    new.info_source      := null;
    new.info_source_kind := null;
    new.info_checked_on  := null;
    -- Client ids must look like our own 'community-<uuid>' scheme; anything
    -- else (an injected string, a spoofed 'seed-N') is replaced server-side.
    if new.id is null or new.id !~ '^community-[0-9a-f-]{36}$' then
      new.id := 'community-' || gen_random_uuid()::text;
    end if;
    -- At most 10 new gyms per user per rolling 24 hours, counted per row (a bulk insert cannot slip past it).
    perform pg_advisory_xact_lock(hashtextextended('spots:' || new.submitted_by::text, 0));
    if public.recent_submission_count() >= 10 then
      raise exception 'daily gym limit reached' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

-- Trigger functions are never called through the API.
revoke all on function public.pin_community_submission() from public, anon, authenticated;

commit;
