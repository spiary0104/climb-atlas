// Supabase Edge Function: delete-account. Deploy (owner): supabase functions deploy delete-account
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided to Edge Functions by Supabase; no key is stored in the repo.
// The gateway verifies the caller's JWT (verify_jwt, the default); handler.js checks it again with Auth and deletes
// only that user. Logic and tests: handler.js, tests/delete-account.test.js.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { handle } from './handler.js';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(req => handle(req, {
  getUser: async (jwt: string) => {
    const { data, error } = await admin.auth.getUser(jwt);
    return { user: data?.user ?? null, error };
  },
  deleteUser: async (id: string) => {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) console.error('delete-account failed', error.message);
    return { error };
  },
}));
