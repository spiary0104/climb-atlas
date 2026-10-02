-- Security hardening 2/6: length caps on free-text columns of spots, pending_edits and reports.
--
-- Before: only a few columns had a limit, so a signed-in user could store megabytes of text per row.
-- Caps (characters): name 200, suburb 200, state 100, country 100, address 300, notes 2000, photo (URL) 1000,
-- report message 2000. They sit well above the real data (longest seed note: 1,055 characters, longest name: 67).
--
-- Every constraint is added NOT VALID: Postgres checks it for every NEW or UPDATED row from now on, but does not scan
-- or reject the rows that already exist, so this migration can never fail on legacy data. Consequence to know about:
-- NOT VALID is still enforced on UPDATE, so an existing row that is already over a cap can only be updated (e.g. a
-- moderator approving an edit to it) after the text is shortened. Find such rows first with the query in
-- docs/migrations.md; none is expected. Run `alter table ... validate constraint ...` later to make them fully valid.
-- Idempotent: each constraint is dropped and re-added.

begin;

do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('spots',         'name',    200), ('spots',         'suburb',  200), ('spots',         'state',   100),
      ('spots',         'country', 100), ('spots',         'address', 300), ('spots',         'notes',  2000),
      ('spots',         'photo',  1000),
      ('pending_edits', 'name',    200), ('pending_edits', 'suburb',  200), ('pending_edits', 'state',   100),
      ('pending_edits', 'country', 100), ('pending_edits', 'address', 300), ('pending_edits', 'notes',  2000),
      ('pending_edits', 'photo',  1000),
      ('reports',       'message',2000)
    ) as v(tbl, col, lim)
  loop
    execute format('alter table public.%I drop constraint if exists %I', r.tbl, r.tbl || '_' || r.col || '_len_check');
    execute format(
      'alter table public.%I add constraint %I check (%I is null or char_length(%I) <= %s) not valid',
      r.tbl, r.tbl || '_' || r.col || '_len_check', r.col, r.col, r.lim);
  end loop;
end;
$$;

commit;
