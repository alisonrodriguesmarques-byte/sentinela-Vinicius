const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdtemp, readFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const net = require('node:net');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

test('cadastro hospitalar é exclusivo de Atendimento e Admin', async t => {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'sentinela-access-test-'));
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: projectRoot,
    env: { ...process.env, PORT: String(port), SENTINELA_DATA_DIR: dataDir, SESSION_SECRET: 'test-secret-not-for-production' },
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
  for (let i = 0; i < 100; i++) {
    try {
      const result = await fetch(`${base}/api/doctors`);
      ready = result.ok;
      if (ready) break;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(ready, true, 'Servidor de teste deve iniciar');

  async function request(url, { method = 'GET', body, cookie } = {}) {
    const response = await fetch(`${base}${url}`, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    return {
      status: response.status,
      data: await response.json(),
      cookie: response.headers.get('set-cookie')?.split(';')[0]
    };
  }

  async function login(username) {
    const response = await request('/api/auth/professional-login', { method: 'POST', body: { username, password: '123456' } });
    assert.equal(response.status, 200);
    assert.ok(response.cookie);
    return response.cookie;
  }

  const payload = {
    name: 'Pessoa Teste', cpf: '123.456.789-01', birthDate: '2000-01-15',
    gender: 'nao_informado', phone: '(61) 99999-1234', email: 'teste@example.com',
    cep: '72800-000', state: 'GO', city: 'Valparaíso de Goiás'
  };

  assert.equal((await request('/api/auth/patient-login', { method: 'POST', body: { email: payload.email } })).status, 404);
  assert.equal((await request('/api/auth/patient-register', { method: 'POST', body: payload })).status, 404);
  assert.equal((await request('/api/auth/demo-admin-shortcut', { method: 'POST' })).status, 404);
  assert.equal((await request('/api/patients', { method: 'POST', body: payload })).status, 401);

  const doctor = await login('MEDICO');
  const triage = await login('TRIAGEM');
  const staff = await login('ATENDIMENTO');
  const admin = await login('ADMIN');

  assert.equal((await request('/api/patients', { method: 'POST', body: payload, cookie: doctor })).status, 403);
  assert.equal((await request('/api/patients', { method: 'POST', body: payload, cookie: triage })).status, 403);

  const created = await request('/api/patients', { method: 'POST', body: payload, cookie: staff });
  assert.equal(created.status, 201);
  assert.equal(created.data.name, payload.name);
  assert.equal(created.data.cpf, '12345678901');
  assert.equal(created.data.passwordHash, undefined);
  assert.ok(created.data.createdBy);

  const patientsAsDoctor = await request('/api/patients', { cookie: doctor });
  assert.equal(patientsAsDoctor.status, 200);
  assert.ok(patientsAsDoctor.data.some(p => p.id === created.data.id));

  const duplicate = await request('/api/patients', { method: 'POST', body: payload, cookie: admin });
  assert.equal(duplicate.status, 409);

  const patchUrl = `/api/patients/${created.data.id}`;
  assert.equal((await request(patchUrl, { method: 'PATCH', body: { ...payload, phone: '3333-4444' }, cookie: doctor })).status, 403);
  const edited = await request(patchUrl, { method: 'PATCH', body: { ...payload, phone: '3333-4444' }, cookie: admin });
  assert.equal(edited.status, 200);
  assert.equal(edited.data.phone, '3333-4444');

  const createdByAdmin = await request('/api/patients', {
    method: 'POST', cookie: admin,
    body: { name: 'Outra Pessoa Teste', cpf: '987.654.321-09' }
  });
  assert.equal(createdByAdmin.status, 201);

  const stored = JSON.parse(await readFile(path.join(dataDir, 'db.json'), 'utf8'));
  assert.equal(stored.patients.length, 2);
  assert.equal(stored.patients[0].passwordHash, undefined);
  assert.ok(stored.auditLogs.some(log => log.action === 'cadastro_paciente_profissional'));
  assert.ok(stored.auditLogs.some(log => log.action === 'atualizar_cadastro_paciente'));

  const loginHtml = await (await fetch(`${base}/`)).text();
  assert.match(loginHtml, /id="professional-login-form"/);
  assert.doesNotMatch(loginHtml, /id="patient-login-form"|id="patient-register-form"|id="tab-patient"/);
});
