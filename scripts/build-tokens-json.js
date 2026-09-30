#!/usr/bin/env node
// Regenerates design/tokens.json (W3C Design Tokens format, the native-app source) from css/tokens.css, the web source of truth.
//
//   node scripts/build-tokens-json.js          write design/tokens.json
//   node scripts/build-tokens-json.js --check  exit 1 if design/tokens.json is out of date (tests do the same)
//
// css/tokens.css stays hand-maintained until a build step exists (docs/DESIGN.md sec. 2.1); this keeps the JSON mirror exact.
// JSON shape: { palette, <categories>..., theme: { paper: {...roles}, rock: {...overrides} } }, two levels (category.name). A token's path joined with "-"
// is its CSS custom-property name (theme tokens: the path after theme.<name>). References are "{palette.paper-2}"; shadows are
// arrays of {offsetX, offsetY, blur, spread, color}. Nothing in the role layer is web-specific except where CSS itself is the value.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CSS_FILE = path.join(ROOT, 'css', 'tokens.css');
const JSON_FILE = path.join(ROOT, 'design', 'tokens.json');

// ---- parse css/tokens.css into { base: {name: value}, paper: {...}, rock: {...} } -------------------------------------------
function parseTokensCss(text) {
  const css = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = { base: {}, paper: {}, rock: {} };
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    let set;
    if (selector === ':root') set = 'base';
    else if (/^:root,\s*\[data-theme="paper"\]/.test(selector)) set = 'paper';
    else if (selector === '[data-theme="rock"]') set = 'rock';
    else throw new Error('unexpected selector in tokens.css: ' + selector);
    for (const d of m[2].split(';')) {
      const i = d.indexOf(':');
      if (i < 0 || !d.trim()) continue;
      const name = d.slice(0, i).trim(), value = d.slice(i + 1).trim();
      if (!name.startsWith('--')) throw new Error('non-custom-property in tokens.css: ' + name);
      if (out[set][name] !== undefined) throw new Error(`duplicate token ${name} in ${set}`);
      out[set][name] = value;
    }
  }
  return out;
}

// --color-text-on-accent -> ['color','text-on-accent'] : category + name. Two levels keep every token name unique and avoid
// leaf/group clashes (e.g. size.tabbar vs size.tabbar-content).
const pathOf = name => {
  const parts = name.replace(/^--/, '').split('-');
  return [parts[0], parts.slice(1).join('-')];
};
const refPath = name => pathOf(name).join('.');

function typeOf(name, value) {
  if (/^--shadow-/.test(name)) return 'shadow';
  if (/^--(ease)-/.test(name)) return 'cubicBezier';
  if (/^--motion-/.test(name)) return 'duration';
  if (/^--font-(display|text)$/.test(name)) return 'fontFamily';
  if (/^--font-weight-|^--type-.*-weight$/.test(name)) return 'fontWeight';
  if (/^--(palette|color|map)-/.test(name)) return 'color';
  if (/^-?[\d.]+(px|em|%|ch)$/.test(value) || /^--(space|radius|size|pin-size|cluster-size|border|focus)/.test(name) && /px|%|ch/.test(value)) return 'dimension';
  if (/^-?[\d.]+$/.test(value)) return 'number';
  return 'string';
}

// "0 2px 8px rgba(...), 0 1px 0 rgba(...)" -> [{offsetX, offsetY, blur, spread, color}, ...]
function parseShadow(value) {
  if (value === 'none') return [];
  return value.split(/,(?![^(]*\))/).map(layer => {
    const color = /(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})/.exec(layer)[1];
    const [x, y, blur, spread = '0px'] = layer.replace(color, '').trim().split(/\s+/).map(v => (v === '0' ? '0px' : v));
    return { offsetX: x, offsetY: y, blur, spread, color };
  });
}
const shadowToCss = arr => (arr.length ? arr.map(s => `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color}`).join(', ') : 'none');

function jsonValue(name, value) {
  const ref = /^var\((--[a-z0-9-]+)\)$/.exec(value);
  if (ref) return `{${refPath(ref[1])}}`;
  if (/^--shadow-/.test(name)) return parseShadow(value);
  if (/^--ease-/.test(name)) return JSON.parse('[' + /cubic-bezier\(([^)]*)\)/.exec(value)[1] + ']');
  return value;
}

function setPath(obj, parts, leaf) {
  let o = obj;
  parts.slice(0, -1).forEach(p => { o[p] = o[p] || {}; if (o[p].$value !== undefined) throw new Error('token/group clash at ' + p); o = o[p]; });
  const k = parts[parts.length - 1];
  if (o[k] !== undefined) throw new Error('path clash at ' + parts.join('.'));
  o[k] = leaf;
}

function buildJson(parsed) {
  const out = {
    $description: 'Bouldeer design tokens (W3C Design Tokens format). GENERATED from css/tokens.css by scripts/build-tokens-json.js -- do not edit by hand. See docs/DESIGN.md sec. 2.',
  };
  const leaf = (name, value) => ({ $type: typeOf(name, value), $value: jsonValue(name, value) });
  for (const [name, value] of Object.entries(parsed.base)) setPath(out, pathOf(name), leaf(name, value));
  out.theme = { paper: {}, rock: {} };
  for (const t of ['paper', 'rock']) for (const [name, value] of Object.entries(parsed[t])) setPath(out.theme[t], pathOf(name), leaf(name, value));
  return out;
}

// ---- flatten JSON back to { set: {cssName: cssValue} } (used by the parity test) ----------------------------------------------
function flattenJson(json) {
  const res = { base: {}, paper: {}, rock: {} };
  const walk = (o, prefix, set) => {
    for (const [k, v] of Object.entries(o)) {
      if (k.startsWith('$')) continue;
      if (v && typeof v === 'object' && '$value' in v) {
        const name = '--' + [...prefix, k].join('-');
        let val = v.$value;
        if (typeof val === 'string' && /^\{[a-z0-9.-]+\}$/.test(val)) val = `var(--${val.slice(1, -1).split('.').join('-')})`;
        else if (v.$type === 'shadow') val = shadowToCss(val);
        else if (v.$type === 'cubicBezier') val = `cubic-bezier(${val.join(', ')})`;
        res[set][name] = val;
      } else if (v && typeof v === 'object') walk(v, [...prefix, k], set);
    }
  };
  const { theme, ...base } = json;
  walk(base, [], 'base');
  for (const t of ['paper', 'rock']) walk(theme[t], [], t);
  return res;
}
// CSS shadows written as "0 2px 8px rgba(...)" normalise to "0px 2px 8px 0px rgba(...)" for comparison.
const normaliseCss = (name, value) => (/^--shadow-/.test(name) ? shadowToCss(parseShadow(value)) : value.replace(/\s+/g, ' '));

function render() {
  return JSON.stringify(buildJson(parseTokensCss(fs.readFileSync(CSS_FILE, 'utf8'))), null, 2) + '\n';
}

module.exports = { parseTokensCss, buildJson, flattenJson, normaliseCss, parseShadow, render, CSS_FILE, JSON_FILE };

if (require.main === module) {
  const next = render();
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(JSON_FILE) ? fs.readFileSync(JSON_FILE, 'utf8').split('\r\n').join('\n') : '';   // checkout may be CRLF
    if (cur !== next) { console.error('design/tokens.json is out of date: run node scripts/build-tokens-json.js'); process.exitCode = 1; }
    else console.log('design/tokens.json is up to date');
  } else {
    fs.mkdirSync(path.dirname(JSON_FILE), { recursive: true });
    fs.writeFileSync(JSON_FILE, next);
    console.log('wrote design/tokens.json');
  }
}
