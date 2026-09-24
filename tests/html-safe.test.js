// node --test tests/    (no dependencies; Node >= 22)
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const load = () => import('../js/modules/html-safe.js');

test('escapeHtml escapes every HTML-special character, including quotes and backtick', async () => {
  const { escapeHtml } = await load();
  assert.equal(escapeHtml(`<script>alert("x")</script>`), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  assert.equal(escapeHtml(`Tom & Jerry's`), 'Tom &amp; Jerry&#39;s');
  assert.equal(escapeHtml('`'), '&#96;');
  assert.equal(escapeHtml('a&b<c>d"e\'f'), 'a&amp;b&lt;c&gt;d&quot;e&#39;f');
});

test('escapeHtml: an attribute-breakout payload can no longer close the attribute', async () => {
  const { escapeHtml } = await load();
  // the old textContent->innerHTML implementation left both quote characters untouched
  const payload = `x" onerror="alert(1)`;
  const html = `<img src="${escapeHtml(payload)}">`;
  assert.equal(html, '<img src="x&quot; onerror=&quot;alert(1)">');
  assert.ok(!/"[^"]*"\s+onerror=/.test(html));
  const single = `<a title='${escapeHtml(`x' onmouseover='alert(1)`)}'>`;
  assert.equal(single, `<a title='x&#39; onmouseover=&#39;alert(1)'>`);
});

test('escapeHtml: null / undefined become empty, other types are stringified, no double escaping surprises', async () => {
  const { escapeHtml } = await load();
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(0), '0');
  assert.equal(escapeHtml(12.5), '12.5');
  assert.equal(escapeHtml('plain text 日本語 Ñ'), 'plain text 日本語 Ñ');
  assert.equal(escapeHtml('&amp;'), '&amp;amp;');            // escaping is applied once, to raw input
});

test('safeUrl accepts ordinary http(s) links and normalises them', async () => {
  const { safeUrl } = await load();
  assert.equal(safeUrl('https://example.com/a.jpg'), 'https://example.com/a.jpg');
  assert.equal(safeUrl('http://example.com/a b'.replace(' ', '%20')), 'http://example.com/a%20b');
  assert.equal(safeUrl('  https://example.com/x  '), 'https://example.com/x');        // trimmed
  assert.equal(safeUrl('HTTPS://EXAMPLE.COM/x'), 'https://example.com/x');
  assert.equal(safeUrl('https://cdn.example.com/img.png?w=200&h=100#frag'), 'https://cdn.example.com/img.png?w=200&h=100#frag');
  assert.equal(safeUrl('https://例え.jp/画像.png'), 'https://xn--r8jz45g.jp/%E7%94%BB%E5%83%8F.png');
});

test('safeUrl rejects javascript: in every spelling (the moderator-panel XSS vector)', async () => {
  const { safeUrl } = await load();
  for (const bad of [
    'javascript:alert(1)', 'JavaScript:alert(1)', 'JAVASCRIPT:alert(document.domain)', ' javascript:alert(1)',
    'java\nscript:alert(1)', 'java\tscript:alert(1)', 'jav&#x61;script:alert(1)', 'javascript://%0Aalert(1)',
    '\u0000javascript:alert(1)', 'javascript&colon;alert(1)', 'jAvAsCrIpT:void(0)',
  ]) assert.equal(safeUrl(bad), null, JSON.stringify(bad));
});

test('safeUrl rejects every other non-http(s) or unsafe form', async () => {
  const { safeUrl } = await load();
  for (const bad of [
    'data:text/html,<script>alert(1)</script>', 'data:image/svg+xml;base64,PHN2Zz4=', 'vbscript:msgbox(1)', 'file:///etc/passwd',
    'blob:https://example.com/uuid', 'ftp://example.com/x', 'about:blank', 'mailto:a@b.c', 'tel:+123',
    '//evil.example/x.png', '/relative/path.png', 'relative.png', 'example.com/photo.jpg', 'www.example.com',
    'https://user:pw@example.com/', 'https://user@example.com/', 'https://',
    'https://exa mple.com', 'https://example.com/a b', 'https://example.com/\u0000',
    `https://x"onerror=alert(1)`, '', '   ', null, undefined, 42, {}, [],
  ]) assert.equal(safeUrl(bad), null, JSON.stringify(bad));
  assert.equal(safeUrl('https://example.com/' + 'a'.repeat(3000)), null);      // over 2048 chars
});

test('safeUrl percent-encodes quotes that appear in a URL path instead of passing them through', async () => {
  const { safeUrl } = await load();
  assert.equal(safeUrl('https://example.com/"onerror="x'), 'https://example.com/%22onerror=%22x');
  assert.ok(!/["<>]/.test(safeUrl('https://example.com/a"b<c>d')));
});

test('safeUrl output, once escaped, contains nothing that can leave an attribute', async () => {
  const { safeUrl, escapeHtml } = await load();
  const u = safeUrl(`https://example.com/p?q='x'&r="y"<z>`);
  const inAttr = escapeHtml(u);
  assert.ok(!/["'<>]/.test(inAttr), inAttr);
});
