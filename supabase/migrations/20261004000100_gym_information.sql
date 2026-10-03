-- Phase 4 gym information (DESIGN.md sec. 8.1-8.2, 19 decision 10; final-stage audit 2026-10-03).
--
-- Adds the public gym-information fields to spots and to edit proposals (pending_edits), so a gym page can fill in
-- progressively and the edit form can accept every field the page shows:
--   description  public "About" text (the edit form's free text now lands here)
--   website      the gym's own site, http(s) only
--   hours        weekly opening hours: a JSON object with optional keys mon..sun, each a short text ("6am-10pm", "Closed")
--   day_pass     free-text day-pass price as the gym states it ("A$28 adult, A$22 concession")
--   facilities   a subset of a fixed list (chips on the gym page)
-- `notes` keeps its role as the research/provenance remark written by the import pipeline: it is an input of the import
-- content hash, is not shown to visitors (publicNotes() keeps the few genuine legacy lines), and edits no longer write it.
-- No existing row changes: every new column is null / empty. RLS is unchanged (rows, not columns, are protected):
-- new gyms and edit proposals carrying these fields are still moderated before they go live.
-- Photos stay the existing single `photo` link (unchanged).

begin;

alter table public.spots
  add column if not exists description text,
  add column if not exists website     text,
  add column if not exists hours       jsonb,
  add column if not exists day_pass    text,
  add column if not exists facilities  text[] not null default '{}';

alter table public.pending_edits
  add column if not exists description text,
  add column if not exists website     text,
  add column if not exists hours       jsonb,
  add column if not exists day_pass    text,
  add column if not exists facilities  text[] not null default '{}';

do $$
declare
  t text;
begin
  foreach t in array array['spots', 'pending_edits'] loop
    execute format('alter table public.%I drop constraint if exists %I', t, t || '_description_len_check');
    execute format('alter table public.%I add constraint %I check (description is null or char_length(description) <= 600)',
                   t, t || '_description_len_check');

    execute format('alter table public.%I drop constraint if exists %I', t, t || '_website_check');
    execute format($c$alter table public.%I add constraint %I check (website is null or (char_length(website) <= 300 and website ~ '^https?://[^\s]+$'))$c$,
                   t, t || '_website_check');

    execute format('alter table public.%I drop constraint if exists %I', t, t || '_day_pass_len_check');
    execute format('alter table public.%I add constraint %I check (day_pass is null or char_length(day_pass) <= 120)',
                   t, t || '_day_pass_len_check');

    -- An object whose only keys are weekdays and whose values are strings of at most 40 characters.
    execute format('alter table public.%I drop constraint if exists %I', t, t || '_hours_check');
    execute format($c$alter table public.%I add constraint %I check (hours is null or (
        jsonb_typeof(hours) = 'object'
        and (hours - array['mon','tue','wed','thu','fri','sat','sun']) = '{}'::jsonb
        and not jsonb_path_exists(hours, '$.* ? (@.type() != "string")')
        and not jsonb_path_exists(hours, '$.* ? (@ like_regex "^.{41}")')
      ))$c$, t, t || '_hours_check');

    execute format('alter table public.%I drop constraint if exists %I', t, t || '_facilities_check');
    execute format($c$alter table public.%I add constraint %I check (
        facilities <@ array['cafe','training','kids','shoe-hire','shop','showers','parking','yoga']::text[])$c$,
                   t, t || '_facilities_check');
  end loop;
end;
$$;

commit;
