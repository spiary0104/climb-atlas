-- Data that exists BEFORE the hardening migrations run (inserted as superuser, after baseline + 3 later migrations).
-- It models legacy production rows that the new migrations must tolerate.

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.test'),
  ('00000000-0000-0000-0000-0000000000cc', 'c@example.test'),   -- the account that gets deleted at the end
  ('00000000-0000-0000-0000-0000000000dd', 'd@example.test'),   -- a second account with only a pending edit
  ('00000000-0000-0000-0000-0000000000ee', 'mod@example.test');
insert into public.moderators (user_id) values ('00000000-0000-0000-0000-0000000000ee');

-- Legacy approved gyms (the second one has a 300-character name: over the new 200 cap, must NOT block the migration).
insert into public.spots (id, name, suburb, state, country, lat, lng, types, status) values
  ('seed-1', 'Legacy Gym', 'Sydney', 'NSW', 'AU', -33.8, 151.2, '{indoor-bouldering}', 'approved'),
  ('seed-2', repeat('L', 300), 'Sydney', 'NSW', 'AU', -33.9, 151.1, '{indoor-bouldering}', 'approved');

-- A gym submitted by user C (this row blocked account deletion before migration 5) and one approved gym added by C.
insert into public.spots (id, name, suburb, state, country, lat, lng, types, status, submitted_by) values
  ('community-cccccccc-cccc-cccc-cccc-cccccccccccc', 'C Pending Gym', 'Perth', 'WA', 'AU', -31.9, 115.8, '{top-rope}', 'pending', '00000000-0000-0000-0000-0000000000cc'),
  ('community-c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0', 'C Approved Gym', 'Perth', 'WA', 'AU', -31.95, 115.85, '{top-rope}', 'approved', '00000000-0000-0000-0000-0000000000cc');

-- C's personal rows, and a route C submitted (routes.submitted_by had no ON DELETE action either).
insert into public.profiles (user_id, display_name) values ('00000000-0000-0000-0000-0000000000cc', 'Cee');
insert into public.marks (user_id, spot_id, mark_type) values ('00000000-0000-0000-0000-0000000000cc', 'seed-1', 'climbed');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000cc', false);   -- pin_checkin takes the user from the JWT
insert into public.checkins (user_id, spot_id) values ('00000000-0000-0000-0000-0000000000cc', 'seed-1');
select set_config('request.jwt.claim.sub', '', false);
insert into public.sessions (id, user_id, spot_id, session_date) values ('5e5e5e5e-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000cc', 'seed-1', current_date);
insert into public.session_climbs (session_id, climb_type, grade) values ('5e5e5e5e-0000-0000-0000-000000000001', 'indoor-bouldering', 'V3');
insert into public.routes (id, spot_id, climb_type, grade, submitted_by) values ('0a0a0a0a-0000-0000-0000-000000000001', 'seed-1', 'indoor-bouldering', 'V2', '00000000-0000-0000-0000-0000000000cc');

-- A proposed edit and a report from C, an edit by D, and an ORPHAN edit pointing at a user that no longer exists
-- (possible before migration 5 because pending_edits.submitted_by had no foreign key).
alter table public.pending_edits disable trigger pending_edits_pin_proposal;   -- keep the seeded submitter
insert into public.pending_edits (id, spot_id, name, suburb, state, country, lat, lng, submitted_by) values
  ('e0000000-0000-0000-0000-00000000000c', 'seed-1', 'Edit by C', 'Sydney', 'NSW', 'AU', 1, 1, '00000000-0000-0000-0000-0000000000cc'),
  ('e0000000-0000-0000-0000-00000000000d', 'seed-1', 'Edit by D', 'Sydney', 'NSW', 'AU', 1, 1, '00000000-0000-0000-0000-0000000000dd'),
  ('e0000000-0000-0000-0000-0000000000f0', 'seed-1', 'Orphan edit', 'Sydney', 'NSW', 'AU', 1, 1, 'ffffffff-ffff-ffff-ffff-fffffffffff0');
alter table public.pending_edits enable trigger pending_edits_pin_proposal;
insert into public.reports (id, spot_id, message) values ('b0000000-0000-0000-0000-000000000001', 'seed-1', 'anonymous legacy report');
