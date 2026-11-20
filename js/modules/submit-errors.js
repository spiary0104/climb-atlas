// Pure: readable messages for the errors the server returns when a signed-in person proposes an edit, files a report or
// adds a gym (migrations 20261002000100 daily caps + sign-in, 20261002000200 text length limits, 20261003000100 gym cap). No DOM.

// Character limits enforced by the database (the *_len_check constraints). Keep in sync with the migration.
export const TEXT_LIMITS = { name: 200, suburb: 200, state: 100, country: 100, address: 300, notes: 2000, photo: 1000, message: 2000 };
import { t } from './i18n.js';
const FIELD_KEY = { name: 'err.field.name', suburb: 'err.field.suburb', state: 'err.field.state', country: 'err.field.country', address: 'err.field.address',
  notes: 'err.field.notes', photo: 'err.field.photoLink', message: 'err.field.message' };

// err: the Supabase/PostgREST error (has .message). fallback: what to say for anything else.
export function submitErrorMessage(err, fallback){
  const msg = String((err && err.message) || '');
  const cap = /daily (edit|report) limit reached/i.exec(msg);
  if(cap) return t(cap[1].toLowerCase() === 'edit' ? 'err.dailyEdits' : 'err.dailyReports');
  if(/daily gym limit reached/i.test(msg)) return t('err.dailyGyms');
  const len = /_(name|suburb|state|country|address|notes|photo|message)_len_check/.exec(msg);
  if(len) return t('err.tooLong', { field: t(FIELD_KEY[len[1]]), max: String(TEXT_LIMITS[len[1]]) });
  if(/violates check constraint|value too long/i.test(msg)) return t('err.someTooLong');
  if(/row-level security|permission denied|jwt|not authenticated/i.test(msg)) return t('err.signInAgain');
  return fallback;
}
