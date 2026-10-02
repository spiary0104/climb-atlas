// Pure: readable messages for the errors the server returns when a signed-in person proposes an edit, files a report or
// adds a gym (migrations 20261002000100 daily caps + sign-in, 20261002000200 text length limits). No DOM.

// Character limits enforced by the database (the *_len_check constraints). Keep in sync with the migration.
export const TEXT_LIMITS = { name: 200, suburb: 200, state: 100, country: 100, address: 300, notes: 2000, photo: 1000, message: 2000 };
const FIELD_LABEL = { name: 'name', suburb: 'suburb', state: 'region', country: 'country', address: 'address', notes: 'notes', photo: 'photo link', message: 'message' };

// err: the Supabase/PostgREST error (has .message). fallback: what to say for anything else.
export function submitErrorMessage(err, fallback){
  const msg = String((err && err.message) || '');
  const cap = /daily (edit|report) limit reached/i.exec(msg);
  if(cap) return `You've reached today's limit of 20 ${cap[1].toLowerCase()}s. Try again tomorrow.`;
  const len = /_(name|suburb|state|country|address|notes|photo|message)_len_check/.exec(msg);
  if(len) return `The ${FIELD_LABEL[len[1]]} is too long (at most ${TEXT_LIMITS[len[1]]} characters). Shorten it and try again.`;
  if(/violates check constraint|value too long/i.test(msg)) return 'Some of the text is too long. Shorten it and try again.';
  if(/row-level security|permission denied|jwt|not authenticated/i.test(msg)) return 'Please sign in again to send this.';
  return fallback;
}
