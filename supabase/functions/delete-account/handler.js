// Delete the signed-in user's own account (Me page > Delete account). Supabase's documented way: the admin API with the
// service role, on a server, never in the browser (supabase.com/docs/guides/auth/managing-user-data). Deleting the auth
// user cascades by the foreign keys of migration 20261002000500: profile, marks, sessions, check-ins and moderator role
// are deleted; gyms, edits and reports the user sent stay with submitted_by set to NULL (Privacy Policy, "Deleting your
// account"). Bouldeer stores no files in Supabase Storage, which would otherwise block the deletion.
// Plain JS with injected dependencies so tests/delete-account.test.js runs it in Node; index.ts wires it for Deno.

export const ALLOWED_ORIGINS = ['https://www.bouldeer.com', 'https://bouldeer.com', 'http://localhost:8000', 'http://127.0.0.1:8000'];

function cors(origin){
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}
const json = (status, body, origin) => new Response(JSON.stringify(body), { status, headers: { ...cors(origin), 'Content-Type': 'application/json' } });

// deps.getUser(jwt) -> { user } | { error }; deps.deleteUser(id) -> { error? } (both with the service role).
export async function handle(req, deps){
  const origin = req.headers.get('Origin') || '';
  if(req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if(req.method !== 'POST') return json(405, { error: 'method_not_allowed' }, origin);
  const header = req.headers.get('Authorization') || '';
  const jwt = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if(!jwt) return json(401, { error: 'not_signed_in' }, origin);
  const { user, error } = await deps.getUser(jwt);   // verifies the token with Supabase Auth, not just its signature
  if(error || !user || !user.id) return json(401, { error: 'not_signed_in' }, origin);
  const del = await deps.deleteUser(user.id);           // only ever the caller's own id
  if(del && del.error) return json(500, { error: 'delete_failed' }, origin);
  return json(200, { deleted: true }, origin);
}
