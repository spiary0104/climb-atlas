// Static link check for the app's browser ES modules (used by tests/module-imports.test.js).
// A named import that the target module does not export is a link-time SyntaxError in the browser: main.js never runs and the
// whole app is blank. Node's tests never load that graph (they import the pure modules one by one), so check it statically.
// Pure: works on a { 'js/x.js': source } map so tests can feed it fixtures as well as the real tree.
'use strict';
const path = require('path');

const IDENT = '[A-Za-z_$][\\w$]*';
// `import { a, b as c } from './x.js'` and `import d, { a } from './x.js'` (relative specifiers only: CDN globals are not modules here)
const NAMED_IMPORT = new RegExp(`import\\s+(?:${IDENT}\\s*,\\s*)?\\{([^}]*)\\}\\s*from\\s*['"](\\.[^'"]+)['"]`, 'g');
const DEFAULT_IMPORT = new RegExp(`import\\s+(${IDENT})\\s*(?:,\\s*\\{[^}]*\\})?\\s*from\\s*['"](\\.[^'"]+)['"]`, 'g');
const REEXPORT = /export\s*\{([^}]*)\}\s*from\s*['"](\.[^'"]+)['"]/g;
const STAR_REEXPORT = /export\s*\*\s*from\s*['"](\.[^'"]+)['"]/g;

const names = list => list.split(',').map(s => s.trim()).filter(Boolean);
const posix = p => p.split(path.sep).join('/');

// The names a module exports (declarations, export lists, re-exports); `*` when it re-exports a whole module (cannot be listed).
function exportsOf(src) {
  const out = new Set();
  for (const m of src.matchAll(new RegExp(`^\\s*export\\s+(?:async\\s+)?(?:function\\*?|class|const|let|var)\\s+(${IDENT})`, 'gm'))) out.add(m[1]);
  for (const m of src.matchAll(/^\s*export\s*\{([^}]*)\}/gm)) for (const n of names(m[1])) out.add(n.split(/\s+as\s+/).pop());
  if (/^\s*export\s+default\b/m.test(src)) out.add('default');
  if (STAR_REEXPORT.test(src)) out.add('*');
  STAR_REEXPORT.lastIndex = 0;
  return out;
}

// files: { 'js/modules/a.js': source, ... } (posix paths). Returns [{ file, name, from, problem }]; empty when every import resolves.
function checkImports(files) {
  const problems = [];
  const resolve = (from, spec) => posix(path.posix.normalize(path.posix.join(path.posix.dirname(from), spec)));
  const cache = new Map();
  const exp = f => { if (!cache.has(f)) cache.set(f, exportsOf(files[f])); return cache.get(f); };
  for (const [file, src] of Object.entries(files)) {
    const check = (spec, wanted, kind) => {
      const target = resolve(file, spec);
      if (!(target in files)) { problems.push({ file, name: '', from: spec, problem: 'missing module' }); return; }
      const have = exp(target);
      if (have.has('*')) return;
      for (const n of wanted) if (!have.has(n)) problems.push({ file, name: n, from: spec, problem: kind });
    };
    for (const m of src.matchAll(NAMED_IMPORT)) check(m[2], names(m[1]).map(n => n.split(/\s+as\s+/)[0].trim()), 'missing export');
    for (const m of src.matchAll(DEFAULT_IMPORT)) check(m[2], ['default'], 'missing default export');
    for (const m of src.matchAll(REEXPORT)) check(m[2], names(m[1]).map(n => n.split(/\s+as\s+/)[0].trim()), 'missing re-exported name');
  }
  return problems;
}

module.exports = { checkImports, exportsOf };
