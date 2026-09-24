// HTML-safety helpers. Pure functions with no imports and no DOM access, so they can be unit-tested in Node
// (tests/html-safe.test.js). Every value that comes from the database or a form and is placed into an HTML
// string must go through escapeHtml() (text AND attribute context) or, for links/images, safeUrl().

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };

// Safe for element text and for double- OR single-quoted (or backtick-ish) attribute values.
// The previous implementation (textContent -> innerHTML) only escaped & < >, so a value like
//   x" onerror="alert(1)
// placed inside src="..." / title="..." / data-id="..." broke out of the attribute.
export function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"'`]/g, ch => HTML_ESCAPES[ch]);
}

const MAX_URL_LENGTH = 2048;

// Returns a normalised absolute http(s) URL, or null. Nothing else is ever rendered as an <img src> or <a href>:
// javascript:, data:, vbscript:, file:, blob:, protocol-relative and relative URLs, URLs with embedded credentials
// and control characters are all rejected. The result still goes through escapeHtml() where it is inserted.
export function safeUrl(value) {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw || raw.length > MAX_URL_LENGTH) return null;
  if (/[\u0000-\u001f\u007f\s]/.test(raw)) return null;           // no whitespace / control chars anywhere
  let url;
  try { url = new URL(raw); } catch (e) { return null; }             // relative and malformed URLs throw
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (!url.hostname) return null;
  // Real hostnames are ASCII letters/digits/dot/hyphen (IDNs arrive already punycoded) or a bracketed IPv6 literal. The URL parser
  // is more lenient than that (it accepts a quote or parentheses in a host), so check it explicitly.
  if (!/^[a-z0-9.-]+$/i.test(url.hostname) && !/^\[[0-9a-f:.]+\]$/i.test(url.hostname)) return null;
  return url.href;
}
