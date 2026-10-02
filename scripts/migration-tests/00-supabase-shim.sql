-- Minimal stand-in for the parts of a Supabase project that supabase/migrations/ relies on, for a THROWAWAY plain
-- Postgres (never production, never the local Supabase stack). Mirrors what the live introspection shows:
--   * roles anon / authenticated / service_role (service_role bypasses RLS) and the schemas auth + extensions
--   * auth.users (only id + email) and auth.uid() reading the JWT subject, like PostgREST sets it per request
--   * default privileges: objects created by postgres in public are fully granted to anon, authenticated and
--     service_role. This is why new functions are executable by anon unless a migration revokes it.
-- Not shimmed (not used by the migrations): storage, realtime, graphql, vault, pg_net, auth.jwt(), auth.role().

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create schema auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);

create function auth.uid() returns uuid
  language sql stable
  as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

grant usage on schema public, auth, extensions to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

alter default privileges for role postgres in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on sequences to anon, authenticated, service_role;
