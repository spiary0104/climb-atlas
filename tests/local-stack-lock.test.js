// The machine-wide lock that makes local-stack test runs take turns (tests/helpers/local-stack.js acquireStackLock). The local
// Supabase database is shared by every checkout and session; a second run must wait, not wipe the first run's rows mid-test.
// No database needed: these tests use a private lock file each.
//   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const { acquireStackLock, lockFile } = require('./helpers/local-stack');

const STACK = { url: 'http://127.0.0.1:54321' };
const tmpLock = name => path.join(os.tmpdir(), `bouldeer-lock-test-${process.pid}-${name}-${Date.now()}.lock`);
const HELPER = path.join(__dirname, 'helpers', 'local-stack.js');

test('one lock file per local stack, shared by every checkout (OS temp dir, keyed by host)', () => {
  assert.equal(path.dirname(lockFile(STACK.url)), os.tmpdir());
  assert.equal(lockFile('http://127.0.0.1:54321'), lockFile('http://127.0.0.1:54321/'), 'the same stack whatever the URL spelling');
  assert.notEqual(lockFile('http://127.0.0.1:54321'), lockFile('http://127.0.0.1:55321'), 'another stack has its own lock');
});

test('a second run in another PROCESS waits until the first releases, then gets the lock', async () => {
  const file = tmpLock('cross');
  const holdMs = 800;
  // the child takes the lock, says so, holds it, then releases and exits
  const child = cp.spawn(process.execPath, ['-e', `
    const { acquireStackLock } = require(${JSON.stringify(HELPER)});
    acquireStackLock(${JSON.stringify(STACK)}, { file: ${JSON.stringify(file)} }).then(release => {
      process.stdout.write('held\\n'); setTimeout(() => { release(); process.exit(0); }, ${holdMs});
    });`], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise(resolve => child.stdout.on('data', d => { if (String(d).includes('held')) resolve(); }));
  const t0 = Date.now();
  const release = await acquireStackLock(STACK, { file, pollMs: 50 });
  const waited = Date.now() - t0;
  assert.ok(waited >= holdMs / 2, `waited for the other process (${waited} ms)`);
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).pid, process.pid, 'now ours');
  release();
  assert.equal(fs.existsSync(file), false, 'released');
});

test('a lock left by a process that is gone (crashed run) is taken over at once', async () => {
  const file = tmpLock('stale');
  const dead = cp.spawnSync(process.execPath, ['-e', 'process.stdout.write(String(process.pid))'], { encoding: 'utf8' });
  fs.writeFileSync(file, JSON.stringify({ pid: Number(dead.stdout), cwd: 'elsewhere', at: '2026-01-01T00:00:00Z' }));
  const t0 = Date.now();
  const release = await acquireStackLock(STACK, { file, pollMs: 50, timeoutMs: 5000 });
  assert.ok(Date.now() - t0 < 2000, 'no waiting for a dead owner');
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).pid, process.pid);
  release();
});

test('a lock held by a live run times out with a clear message; release() never deletes someone else\'s lock', async () => {
  const file = tmpLock('busy');
  const holder = cp.spawn(process.execPath, ['-e', 'setTimeout(() => {}, 30000)'], { stdio: 'ignore' });
  try {
    fs.writeFileSync(file, JSON.stringify({ pid: holder.pid, cwd: 'C:/other/worktree', at: new Date().toISOString() }));
    await assert.rejects(acquireStackLock(STACK, { file, pollMs: 50, timeoutMs: 400 }), /in use by another test run \(pid \d+, C:\/other\/worktree\)/);
    assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).pid, holder.pid, 'the live lock is untouched');
  } finally { holder.kill(); fs.rmSync(file, { force: true }); }
  // our release after someone else took the file over leaves their lock alone
  const mine = tmpLock('mine');
  const release = await acquireStackLock(STACK, { file: mine });
  fs.writeFileSync(mine, JSON.stringify({ pid: process.pid + 1, cwd: 'x', at: 'y' }));
  release();
  assert.equal(fs.existsSync(mine), true, 'not ours any more, so not removed');
  fs.rmSync(mine, { force: true });
});

test('two waiters in one process are served one at a time', async () => {
  const file = tmpLock('serial');
  const order = [];
  const run = async name => { const release = await acquireStackLock(STACK, { file, pollMs: 20 }); order.push(name + ':in'); await new Promise(r => setTimeout(r, 120)); order.push(name + ':out'); release(); };
  await Promise.all([run('a'), run('b')]);
  assert.ok(order[1].endsWith(':out') && order[2].endsWith(':in'), 'never both inside: ' + order.join(' '));
});
