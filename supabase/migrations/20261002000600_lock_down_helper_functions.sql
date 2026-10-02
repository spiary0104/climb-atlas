-- Security hardening 6/6: helper functions that should not be callable through the API.
--
-- next_spot_slug(text, text) is SECURITY DEFINER and, because Supabase grants EXECUTE on new functions to anon by
-- default, anyone could call it as an RPC and probe which slugs exist, including slugs of pending and rejected gyms
-- that RLS hides. It is only needed by set_spot_slug(), the slug trigger. set_spot_slug() becomes SECURITY DEFINER
-- (search_path pinned to public) so the trigger keeps working while API roles hold no EXECUTE on either function
-- (trigger functions are checked for EXECUTE only when the trigger is created, not when it fires).
-- recent_submission_count() stays SECURITY DEFINER and executable by signed-in users (the spots insert policy uses it)
-- but is no longer executable by anon (harmless: it counts auth.uid()'s rows, i.e. none; flagged by the advisor).

begin;

create or replace function public.set_spot_slug() returns trigger
  language plpgsql security definer
  set search_path = public
  as $$
begin
  if tg_op = 'INSERT' or old.slug is null then
    new.slug := public.next_spot_slug(public.spot_slug_base(new.name, new.suburb, new.id), new.id);
  else
    new.slug := old.slug;
  end if;
  return new;
end;
$$;

revoke all on function public.next_spot_slug(text, text) from public, anon, authenticated;
revoke all on function public.set_spot_slug() from public, anon, authenticated;
revoke execute on function public.recent_submission_count() from anon;

commit;
