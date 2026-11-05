const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdtemp, readFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const net = require('node:net');
const path = require('node:path');

test('atalho entra diretamente no Admin apenas na demonstração local', async t => {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'sentinela-demo-shortcut-'));
  const listener = net.createServer();
  await new Promise(resolve => listener.listen(0, '127.0.0.1', resolve));
  const port = listener.address().port;
  await new Promise(resolve => listener.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['demo.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: String(port), NODE_ENV: 'development', SENTINELA_DATA_DIR: dataDir, SESSION_SECRET: 'test-demo-secret-only' },
    stdio: 'ignore'
  });
  t.after(async () => {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await new Promise(resolve => child.once('exit', resolve));
    }
    await rm(dataDir, { recursive: true, force: true });
  });

  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      ready = (await fetch(`${base}/api/doctors`)).ok;
      if (ready) break;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(ready, true);

  const denied = await fetch(`${base}/api/auth/demo-admin-shortcut`, {
    method: 'POST', headers: { Origin: 'https://site-externo.example', 'Sec-Fetch-Site': 'cross-site' }
  });
  assert.equal(denied.status, 403);

  const shortcut = await fetch(`${base}/api/auth/demo-admin-shortcut`, {
    method:'POST', headers: { Origin: base, 'Sec-Fetch-Site': 'same-origin' }
  });
  assert.equal(shortcut.status, 200);
  const result = await shortcut.json();
  assert.equal(result.user.role, 'admin');
  assert.equal(result.demo, true);
  const cookie = shortcut.headers.get('set-cookie').split(';')[0];

  const me = await fetch(`${base}/api/me`, { headers: { Cookie: cookie } });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).role, 'admin');

  const db = JSON.parse(await readFile(path.join(dataDir, 'db.json'), 'utf8'));
  assert.ok(db.auditLogs.some(x => x.action === 'login_demo_admin_atalho'));
});
