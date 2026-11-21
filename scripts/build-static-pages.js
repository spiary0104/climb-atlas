#!/usr/bin/env node
// Builds About, Privacy and Terms for every language from scripts/static-pages/<code>.js (English is the source).
//   English:  /about.html /privacy.html /terms.html          (served as /about /privacy /terms, vercel.json)
//   Others:   /<prefix>/about.html ...  e.g. /ja/about.html    (served as /ja/about ...)
// Every page links its translations (hreflang + a language list), carries structured data (JSON-LD) for search engines and
// AI assistants, and uses root-absolute assets. Generated files are committed; tests/static-pages.test.js checks they match.
//   node scripts/build-static-pages.js          write the pages
//   node scripts/build-static-pages.js --check  exit 1 if any page is out of date (no writes)
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://www.bouldeer.com';
// code: source file; prefix: URL folder ('' = root); html: <html lang>; hreflang: alternate link; name: endonym.
const LANGS = [
  { code: 'en', prefix: '', html: 'en', hreflang: 'en', name: 'English', og: 'en_US' },
  { code: 'zh-CN', prefix: 'zh-cn', html: 'zh-Hans-CN', hreflang: 'zh-Hans', name: '简体中文', og: 'zh_CN' },
  { code: 'zh-TW', prefix: 'zh-tw', html: 'zh-Hant-TW', hreflang: 'zh-Hant', name: '繁體中文', og: 'zh_TW' },
  { code: 'ja', prefix: 'ja', html: 'ja', hreflang: 'ja', name: '日本語', og: 'ja_JP' },
  { code: 'ko', prefix: 'ko', html: 'ko', hreflang: 'ko', name: '한국어', og: 'ko_KR' },
  { code: 'de', prefix: 'de', html: 'de', hreflang: 'de', name: 'Deutsch', og: 'de_DE' },
  { code: 'fr', prefix: 'fr', html: 'fr', hreflang: 'fr', name: 'Français', og: 'fr_FR' },
  { code: 'es', prefix: 'es', html: 'es', hreflang: 'es', name: 'Español', og: 'es_ES' },
  { code: 'pt-BR', prefix: 'pt-br', html: 'pt-BR', hreflang: 'pt-BR', name: 'Português (Brasil)', og: 'pt_BR' },
];
const PAGES = ['about', 'privacy', 'terms'];

const urlPath = (lang, page) => (lang.prefix ? '/' + lang.prefix : '') + '/' + page;   // clean URL
const filePath = (lang, page) => path.join(ROOT, lang.prefix, page + '.html');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const text = html => String(html).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, '’').replace(/&ldquo;/g, '“')
  .replace(/&rdquo;/g, '”').replace(/&hellip;/g, '…').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const jsonLd = obj => '<script type="application/ld+json">' + JSON.stringify(obj).replace(/</g, '\\u003c') + '</script>';
const fill = (html, lang) => html.replace(/\{(about|privacy|terms)\}/g, (m, p) => urlPath(lang, p));

function load(code){
  const file = path.join(__dirname, 'static-pages', code + '.js');
  delete require.cache[require.resolve(file)];
  return require(file);
}

function structuredData(lang, page, c){
  const url = SITE + urlPath(lang, page);
  const org = { '@type': 'Organization', '@id': SITE + '/#org', name: 'Bouldeer', url: SITE + '/', logo: SITE + '/icons/icon-512.png', email: 'hello@bouldeer.com' };
  const site = { '@type': 'WebSite', '@id': SITE + '/#website', name: 'Bouldeer', url: SITE + '/', publisher: { '@id': SITE + '/#org' },
    inLanguage: LANGS.map(l => l.hreflang), potentialAction: { '@type': 'SearchAction', target: SITE + '/?q={search_term_string}', 'query-input': 'required name=search_term_string' } };
  const webPage = { '@type': page === 'about' ? 'AboutPage' : 'WebPage', '@id': url, url, name: c[page].metaTitle, description: c[page].description,
    inLanguage: lang.hreflang, isPartOf: { '@id': SITE + '/#website' }, about: { '@id': SITE + '/#org' } };
  const graph = [org, site, webPage];
  if(page === 'about') graph.push({ '@type': 'FAQPage', '@id': url + '#faq', inLanguage: lang.hreflang,
    mainEntity: c.about.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  return jsonLd({ '@context': 'https://schema.org', '@graph': graph });
}

function render(lang, page, c){
  const p = c[page], ui = c.ui;
  const alternates = LANGS.map(l => `<link rel="alternate" hreflang="${l.hreflang}" href="${SITE + urlPath(l, page)}">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${SITE + urlPath(LANGS[0], page)}">`;
  const faq = page === 'about'
    ? `\n    <h2 id="faq">${esc(c.about.faqTitle)}</h2>\n    <dl class="faq">\n${c.about.faq.map(([q, a]) => `      <dt>${esc(q)}</dt>\n      <dd>${esc(a)}</dd>`).join('\n')}\n    </dl>\n` + fill(c.about.contact, lang)
    : '';
  const updated = p.updated ? `\n    <p class="updated">${esc(p.updated)}</p>` : '';
  const note = ui.translationNote ? `\n    <p class="updated">${esc(ui.translationNote)} <a href="${urlPath(LANGS[0], page)}" hreflang="en" lang="en">English</a></p>` : '';
  const footer = PAGES.map(x => `      <a href="${urlPath(lang, x)}"${x === page ? ' aria-current="page"' : ''}>${esc(ui[x])}</a>`).join('\n')
    + `\n      <a href="mailto:hello@bouldeer.com">${esc(ui.contact)}</a>`;
  const languages = LANGS.map(l => l === lang
    ? `        <li><span lang="${l.html}" aria-current="true">${esc(l.name)}</span></li>`
    : `        <li><a href="${urlPath(l, page)}" hreflang="${l.hreflang}" lang="${l.html}">${esc(l.name)}</a></li>`).join('\n');
  return `<!DOCTYPE html>
<html lang="${lang.html}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.metaTitle)}</title>
<meta name="description" content="${esc(p.description)}">
<meta name="theme-color" content="#F6F0E3">
<link rel="canonical" href="${SITE + urlPath(lang, page)}">
${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Bouldeer">
<meta property="og:title" content="${esc(p.metaTitle)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${SITE + urlPath(lang, page)}">
<meta property="og:locale" content="${lang.og}">
<meta property="og:image" content="${SITE}/icons/icon-512.png">
<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,500..600,50..100&family=Inter:wght@400;500;600&display=swap" crossorigin="anonymous">
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/components.css">
<link rel="stylesheet" href="/css/style.css">
${structuredData(lang, page, c)}
</head>
<body>

<a class="skip-link" href="#main">${esc(ui.skip)}</a>
<div class="static-page" data-theme="paper">
  <header class="static-header">
    <a class="wordmark" href="/"><img class="wordmark-mark" src="/assets/mascot/head.svg" alt="" width="28" height="28">Bouldeer</a>
    <a class="btn btn-secondary" href="/"><svg class="icon" aria-hidden="true" focusable="false"><use href="/assets/icons.svg#i-arrow-left"/></svg>${esc(ui.back)}</a>
  </header>

  <main class="info-modal static-content" id="main" tabindex="-1">
    <h1 class="t-display-lg">${esc(p.title)}</h1>${updated}${note}
${fill(p.body, lang).replace(/^\n/, '')}${faq}
    <div class="close-row"><a class="btn btn-primary" href="/">${esc(ui.back)}</a></div>

    <nav class="static-languages" aria-label="${esc(ui.languages)}">
      <ul>
${languages}
      </ul>
    </nav>

    <nav class="static-footer" aria-label="Site">
${footer}
    </nav>
  </main>
</div>

</body>
</html>
`;
}

function build({ check = false } = {}){
  const stale = [];
  for(const lang of LANGS){
    let c;
    try { c = load(lang.code); } catch(e){ if(lang.code === 'en') throw e; continue; }   // a language without a source yet
    for(const page of PAGES){
      const out = render(lang, page, c), file = filePath(lang, page);
      const now = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null;
      if(now === out) continue;
      stale.push(path.relative(ROOT, file));
      if(!check){ fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, out); }
    }
  }
  return stale;
}

if(require.main === module){
  const check = process.argv.includes('--check');
  const stale = build({ check });
  if(check && stale.length){ console.error('out of date (run node scripts/build-static-pages.js):\n  ' + stale.join('\n  ')); process.exit(1); }
  console.log(check ? 'static pages up to date' : stale.length ? 'wrote ' + stale.join(', ') : 'nothing to write');
}
module.exports = { LANGS, PAGES, urlPath, build, render, load, text };
