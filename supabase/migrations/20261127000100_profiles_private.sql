-- Privacy hardening, 2026-11-27: display names are no longer listable by everyone.
-- Before: policy "display names are public" (select using (true)) let anon list every user_id + display_name.
-- After: a profile row is readable by its owner and by moderators (who see submitters' names in /mod).
-- The public "added by" line on a gym page is unaffected: spot_provenance() is SECURITY DEFINER (owner bypasses RLS).
-- Insert and update policies are unchanged. Idempotent.

begin;

drop policy if exists "display names are public" on public.profiles;
drop policy if exists "profiles readable by owner and moderators" on public.profiles;
create policy "profiles readable by owner and moderators" on public.profiles for select
  using (auth.uid() = user_id or auth.uid() in (select m.user_id from public.moderators m));

-- anon has no use for this table any more (the policy would return nothing anyway; the grant is the second lock).
revoke select on public.profiles from anon;

commit;
