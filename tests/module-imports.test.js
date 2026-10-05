// Every named import between the app's browser modules resolves to a real export. A wrong one (e.g. importing metroPath from
// metros.js when it lives in slug.js) makes the browser reject the whole module graph: main.js never runs and the site is blank,
// while every unit test still passes because none of them loads that graph. This test is the guard.
//   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { checkImports, exportsOf } = require('./helpers/module-imports');

const ROOT = path.resolve(__dirname, '..');
function appModules() {
  const files = {};
  (function walk(dir) {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = dir + '/' + e.name;
      if (e.isDirectory()) walk(rel);
      else if (e.name.endsWith('.js')) files[rel] = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    }
  })('js');
  return files;
}

test('every named import between the browser modules (js/) resolves to an export of the target module', () => {
  const files = appModules();
  assert.ok(Object.keys(files).length > 40, 'the module tree was found');
  assert.ok('js/main.js' in files && 'js/modules/slug.js' in files);
  const problems = checkImports(files);
  assert.deepEqual(problems, [], problems.map(p => `${p.file}: ${p.problem} ${p.name} from ${p.from}`).join('\n'));
});

test('the checker catches the overnight-sprint outage: metroPath imported from metros.js (it lives in slug.js)', () => {
  const files = appModules();
  // The broken line exactly as it shipped on feature/overnight-sprint (passport-page.js), against the real metros.js and slug.js.
  const broken = { ...files, 'js/modules/passport-page.js': "import { metroOf, metroPath } from './metros.js';\nimport { gymPath } from './slug.js';\n" };
  const found = checkImports(broken).filter(p => p.file === 'js/modules/passport-page.js');
  assert.deepEqual(found, [{ file: 'js/modules/passport-page.js', name: 'metroPath', from: './metros.js', problem: 'missing export' }]);
  // and the corrected import passes
  const fixed = { ...files, 'js/modules/passport-page.js': "import { metroOf } from './metros.js';\nimport { gymPath, metroPath } from './slug.js';\n" };
  assert.deepEqual(checkImports(fixed).filter(p => p.file === 'js/modules/passport-page.js'), []);
});

test('the checker understands the forms the app uses: aliases, multi-line imports, re-exports, missing modules', () => {
  const files = {
    'js/a.js': "export const one = 1;\nexport function two(){}\nexport { three as four } from './b.js';\n",
    'js/b.js': 'export const three = 3;\n',
    'js/ok.js': "import {\n  one,\n  two as deux,\n  four,\n} from './a.js';\n",
    'js/bad.js': "import { one, five } from './a.js';\nimport { x } from './missing.js';\nexport { nope } from './b.js';\n",
  };
  assert.deepEqual(exportsOf(files['js/a.js']), new Set(['one', 'two', 'four']));
  const problems = checkImports(files).map(p => `${p.file} ${p.problem} ${p.name}`.trim());
  assert.deepEqual(problems.sort(), ['js/bad.js missing export five', 'js/bad.js missing module', 'js/bad.js missing re-exported name nope'].sort());
});
