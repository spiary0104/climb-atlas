-- Gym URL slugs (docs/DESIGN.md sec. 6.2, sec. 19 decision 4, owner decision 2026-09-26: name-suburb, stored).
--   /gym/{slug}: kebab(name) plus the suburb words the name does not already contain, accents folded
--   ("BlocHaus", "Marrickville" -> blochaus-marrickville; "B-PUMP Tokyo Akihabara", "Akihabara, Tokyo" ->
--   b-pump-tokyo-akihabara). A name with no Latin letters or digits falls back to the id. Clashes get -2, -3, ...
--   The slug is STORED: set once on insert (the client value is ignored) and never changed afterwards, so renaming a
--   gym keeps its links. Backfilled for every existing row in (created_at, id) order, so the oldest gym keeps the
--   unsuffixed slug. Additive only: one column, one unique index, helper functions and one trigger.

create extension if not exists unaccent with schema extensions;

-- One slug fragment: lower-case ASCII letters/digits separated by single hyphens.
create or replace function public.slug_part(txt text) returns text
  language sql stable
  set search_path = public, extensions
  as $$
  select trim(both '-' from regexp_replace(lower(extensions.unaccent(coalesce(txt, ''))), '[^a-z0-9]+', '-', 'g'))
$$;

-- The unsuffixed slug for a gym: name words, then suburb words not already in the name, capped at 80 characters.
create or replace function public.spot_slug_base(p_name text, p_suburb text, p_id text) returns text
  language sql stable
  set search_path = public, extensions
  as $$
  with n as (select public.slug_part(p_name) as base),
  s as (
    select string_agg(u.t, '-' order by u.ord) as extra
    from n, unnest(string_to_array(public.slug_part(p_suburb), '-')) with ordinality as u(t, ord)
    where u.t <> '' and not (u.t = any (string_to_array(n.base, '-')))
  )
  select trim(both '-' from left(
    coalesce(nullif(concat_ws('-', nullif(n.base, ''), nullif(s.extra, '')), ''), public.slug_part(p_id)), 80))
  from n, s
$$;

-- First free slug for a base. SECURITY DEFINER so the check sees every row (RLS hides other users' pending spots from
-- the submitter, which would otherwise let two pending submissions collide on the unique index). Returns only a string.
create or replace function public.next_spot_slug(p_base text, p_id text) returns text
  language plpgsql stable security definer
  set search_path = public
  as $$
declare
  candidate text := p_base;
  i integer := 1;
begin
  while exists (select 1 from public.spots where slug = candidate and id is distinct from p_id) loop
    i := i + 1;
    candidate := p_base || '-' || i;
  end loop;
  return candidate;
end;
$$;

alter table public.spots add column if not exists slug text;

-- Backfill without touching updated_at (the backfill is not an edit of the gym).
alter table public.spots disable trigger spots_touch_updated_at;
do $$
declare r record;
begin
  for r in select id, name, suburb from public.spots where slug is null order by created_at, id loop
    update public.spots
       set slug = public.next_spot_slug(public.spot_slug_base(r.name, r.suburb, r.id), r.id)
     where id = r.id;
  end loop;
end;
$$;
alter table public.spots enable trigger spots_touch_updated_at;

alter table public.spots alter column slug set not null;
create unique index if not exists spots_slug_key on public.spots (slug);

-- Set on insert (after spots_pin_community_submission has fixed the id: same-event triggers fire in name order),
-- immutable afterwards.
create or replace function public.set_spot_slug() returns trigger
  language plpgsql
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

create or replace trigger spots_set_slug
  before insert or update on public.spots
  for each row execute function public.set_spot_slug();
