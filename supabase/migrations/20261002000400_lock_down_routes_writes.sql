-- Security hardening 4/6: the unused `routes` table no longer accepts writes from the API.
--
-- The app never reads or writes `routes` (no from('routes') anywhere in js/), but the policy "signed-in users can add
-- routes" let any signed-in user insert rows (with free text and no limits) and the submitter/moderator policies let
-- them change them. Writes are removed for anon and authenticated: the insert policy is dropped and INSERT/UPDATE/
-- DELETE (and TRUNCATE etc.) are revoked. The submitter/moderator UPDATE and DELETE policies stay in place but are
-- inert without the privilege; the service role (which bypasses RLS) can still manage the table.
-- SELECT stays public ("routes are publicly readable"): routes are public by design for a future feature, the table is
-- unused today, and keeping it readable means session_climbs.route_id and any future read-only use keep working.
-- Revoke SELECT too if you would rather expose nothing until routes are built.

begin;

drop policy if exists "signed-in users can add routes" on public.routes;
revoke all on table public.routes from anon, authenticated;
grant select on table public.routes to anon, authenticated;

commit;
