-- Security hardening 1/6: proposing an edit and reporting a gym now REQUIRE SIGN-IN (owner decision 2026-10-02).
--
-- Before: the baseline policies "anyone can propose an edit" (pending_edits) and "anyone can submit a report" (reports)
-- were `WITH CHECK (true)` for every role, including anon, with no size or rate limit, so anyone with the public anon
-- key could flood the moderation queues from a script.
-- After:
--   * INSERT needs a signed-in user (role authenticated) and the row's submitter must be that user.
--   * reports gains submitted_by (pinned to auth.uid() by trigger, like pending_edits already does) so the rows carry
--     an owner; deleting the account later keeps the report but drops the link (ON DELETE SET NULL).
--   * At most 20 edit proposals and 20 reports per user per rolling 24 hours. The count comes from SECURITY DEFINER
--     functions with no arguments (they only ever count auth.uid()'s rows, same pattern as recent_submission_count())
--     and is enforced in the BEFORE INSERT pin triggers, not in the policy: a trigger runs per row with a fresh snapshot
--     under a per-user advisory lock (as pin_checkin does), so neither one multi-row insert nor simultaneous requests can
--     slip past the cap (a policy check sees one statement snapshot, so a single bulk insert would pass it).
--     Over the cap the insert fails with the message 'daily edit limit reached' / 'daily report limit reached'.
-- Moderator reads/deletes/decisions are untouched. Service-role writes (importer) bypass RLS and are untouched.

begin;

-- ===== reports: who submitted ========================================================================================
alter table public.reports add column if not exists submitted_by uuid default auth.uid() references auth.users(id) on delete set null;
create index if not exists reports_submitted_by_created_idx on public.reports (submitted_by, created_at);
create index if not exists pending_edits_submitted_by_at_idx on public.pending_edits (submitted_by, submitted_at);

-- ===== rolling 24 h counters ==========================================================================================
create or replace function public.recent_edit_count() returns integer
  language sql stable security definer
  set search_path = public
  as $$
  select count(*)::integer from public.pending_edits
  where submitted_by = auth.uid()
    and submitted_at > now() - interval '1 day';
$$;
create or replace function public.recent_report_count() returns integer
  language sql stable security definer
  set search_path = public
  as $$
  select count(*)::integer from public.reports
  where submitted_by = auth.uid()
    and created_at > now() - interval '1 day';
$$;
-- Supabase's default privileges grant EXECUTE on new functions to anon directly, so "revoke from public" alone is not enough.
revoke all on function public.recent_edit_count() from public, anon;
revoke all on function public.recent_report_count() from public, anon;
grant execute on function public.recent_edit_count() to authenticated, service_role;
grant execute on function public.recent_report_count() to authenticated, service_role;

-- ===== pin triggers: attribute, time-stamp and cap ====================================================================
-- A report is always attributed to whoever is signed in (null for the service role) and time-stamped by the server.
create or replace function public.pin_report_submission() returns trigger
  language plpgsql
  set search_path = public
  as $$
begin
  new.submitted_by := auth.uid();
  new.created_at   := now();
  if new.submitted_by is not null then
    perform pg_advisory_xact_lock(hashtextextended('reports:' || new.submitted_by::text, 0));
    if public.recent_report_count() >= 20 then
      raise exception 'daily report limit reached' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
create or replace trigger reports_pin_submission before insert on public.reports
  for each row execute function public.pin_report_submission();
-- Trigger functions are never called through the API; do not leave it executable by API roles.
revoke all on function public.pin_report_submission() from public, anon, authenticated;

-- Same body as 20260926084510_community_provenance.sql (a proposal is always a fresh, undecided proposal by whoever is
-- signed in) plus the daily cap.
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
  if new.submitted_by is not null then
    perform pg_advisory_xact_lock(hashtextextended('edits:' || new.submitted_by::text, 0));
    if public.recent_edit_count() >= 20 then
      raise exception 'daily edit limit reached' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

-- ===== policies ======================================================================================================
drop policy if exists "anyone can propose an edit" on public.pending_edits;
drop policy if exists "signed-in users can propose an edit" on public.pending_edits;
create policy "signed-in users can propose an edit" on public.pending_edits for insert to authenticated
  with check (auth.uid() is not null and submitted_by = auth.uid());

drop policy if exists "anyone can submit a report" on public.reports;
drop policy if exists "signed-in users can submit a report" on public.reports;
create policy "signed-in users can submit a report" on public.reports for insert to authenticated
  with check (auth.uid() is not null and submitted_by = auth.uid());

commit;
