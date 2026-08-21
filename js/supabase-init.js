/*
 * supabase-init.js — creates the shared Supabase client.
 * ------------------------------------------------------------
 * Fill in SUPABASE_URL and SUPABASE_ANON_KEY below with the values from your
 * Supabase project: Dashboard > Project Settings > API. The "anon public" key
 * is safe to ship in client-side code — it's designed to be public, access is
 * enforced by the row-level security policies in supabase/schema.sql, not by
 * keeping this key secret.
 *
 * See README.md for the full setup walkthrough (creating the project, enabling
 * Google + magic-link sign-in, running schema.sql and seed.html).
 */

const SUPABASE_URL = 'https://thayxaampaelvntoaido.supabase.co'; // e.g. https://abcdefghijk.supabase.co
const SUPABASE_ANON_KEY = 'sb_publishable_cmlk7P6iQxxDjLppONd6kw_bD9anbUT';

window.SUPABASE_CONFIGURED = !SUPABASE_URL.startsWith('YOUR_') && !SUPABASE_ANON_KEY.startsWith('YOUR_');

window.sb = window.SUPABASE_CONFIGURED
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!window.SUPABASE_CONFIGURED) {
  console.warn('Supabase is not configured yet — fill in js/supabase-init.js with your project URL and anon key. See README.md.');
}
