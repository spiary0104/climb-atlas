/*
 * auth.js — thin wrapper around Supabase Auth (magic link + Google).
 * ------------------------------------------------------------
 * Exposes window.auth with the current user and a subscribe/notify pattern so
 * app.js can re-render whenever sign-in state changes, without app.js needing
 * to know anything about Supabase directly.
 */

window.auth = (function () {
  let currentUser = null;
  const listeners = [];

  function notify() {
    listeners.forEach(fn => fn(currentUser));
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  async function init() {
    if (!window.sb) return;
    const { data } = await window.sb.auth.getSession();
    currentUser = data.session ? data.session.user : null;
    notify();
    window.sb.auth.onAuthStateChange((_event, session) => {
      currentUser = session ? session.user : null;
      notify();
    });
  }

  async function signInWithEmail(email) {
    if (!window.sb) throw new Error('Supabase is not configured');
    const { error } = await window.sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href }
    });
    if (error) throw error;
  }

  async function signInWithGoogle() {
    if (!window.sb) throw new Error('Supabase is not configured');
    const { error } = await window.sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href }
    });
    if (error) throw error;
  }

  async function signOut() {
    if (!window.sb) return;
    await window.sb.auth.signOut();
  }

  return {
    get user() { return currentUser; },
    onChange,
    init,
    signInWithEmail,
    signInWithGoogle,
    signOut
  };
})();
