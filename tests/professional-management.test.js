const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdtemp, readFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const net = require('node:net');
const path = require('node:path');

async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

test('Admin gerencia profissionais integrados e revoga acessos', async t => {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'sentinela-prof-test-'));
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: String(port), SENTINELA_DATA_DIR: dataDir, SESSION_SECRET: 'separate-test-only-secret' },
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
      ready = (await fetch(`${base}/api/doctors`)).ok;
      if (ready) break;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Servidor de testes deve iniciar');

  async function request(url, { method = 'GET', body, cookie } = {}) {
    const response = await fetch(`${base}${url}`, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    return { status: response.status, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  async function login(username, password = '123456') {
    return request('/api/auth/professional-login', { method:'POST', body:{ username, password } });
  }

  const adminLogin = await login('ADMIN');
  const staffLogin = await login('ATENDIMENTO');
  assert.equal(adminLogin.status, 200);
  assert.equal(staffLogin.status, 200);
  const admin = adminLogin.cookie;
  const staff = staffLogin.cookie;

  const specialties = await request('/api/medical-specialties', { cookie: admin });
  assert.equal(specialties.status, 200);
  assert.ok(specialties.data.some(x => x.name === 'Pediatria'));
  assert.equal((await request('/api/medical-specialties', { cookie: staff })).status, 403);

  const doctorPayload = {
    displayName:'Dra. Teste da Silva', username:'MEDICA.TESTE', password:'senhaSegura123',
    role:'medico', specialty:'Pediatria', crm:'CRM/GO TESTE', rqe:'RQE TESTE'
  };
  assert.equal((await request('/api/professionals', { method:'POST', body:doctorPayload })).status, 401);
  assert.equal((await request('/api/professionals', { method:'POST', body:doctorPayload, cookie:staff })).status, 403);
  assert.equal((await request('/api/professionals', { method:'POST', body:{ ...doctorPayload, specialty:'Área inventada' }, cookie:admin })).status, 400);

  const created = await request('/api/professionals', { method:'POST', body:doctorPayload, cookie:admin });
  assert.equal(created.status, 201);
  assert.equal(created.data.role, 'medico');
  assert.equal(created.data.specialty, 'Pediatria');
  assert.ok(created.data.doctorId);
  assert.equal(created.data.passwordHash, undefined);
  assert.equal((await request('/api/professionals', { method:'POST', body:doctorPayload, cookie:admin })).status, 409);

  const doctors = await request('/api/doctors');
  assert.ok(doctors.data.some(d => d.id === created.data.doctorId && d.specialty === 'Pediatria' && d.professionalId === created.data.id));

  const newDoctorLogin = await login('medica.teste', doctorPayload.password);
  assert.equal(newDoctorLogin.status, 200);
  const doctorSession = newDoctorLogin.cookie;
  const me = await request('/api/me', { cookie:doctorSession });
  assert.equal(me.status, 200);
  assert.equal(me.data.user.doctorId, created.data.doctorId);
  assert.equal(me.data.role, 'medico');

  const attendant = await request('/api/professionals', {
    method:'POST', cookie:admin,
    body:{ displayName:'Recepcionista Teste', username:'RECEP.TESTE', password:'senhaDeTeste456', role:'atendimento' }
  });
  assert.equal(attendant.status, 201);
  assert.equal(attendant.data.doctorId, undefined);
  const attendantLogin = await login('RECEP.TESTE', 'senhaDeTeste456');
  assert.equal(attendantLogin.status, 200);
  const patient = await request('/api/patients', { method:'POST', cookie:attendantLogin.cookie, body:{ name:'Teste da Recepção', cpf:'12345678910' } });
  assert.equal(patient.status, 201);
  const otherDoctorId = doctors.data.find(d => d.id !== created.data.doctorId && d.type === 'consulta').id;
  const ownAppointment = await request('/api/appointments', {
    method:'POST', cookie:admin,
    body:{ patientId:patient.data.id, doctorId:created.data.doctorId, date:'2026-12-15', time:'08:00' }
  });
  const otherAppointment = await request('/api/appointments', {
    method:'POST', cookie:admin,
    body:{ patientId:patient.data.id, doctorId:otherDoctorId, date:'2026-12-15', time:'08:30' }
  });
  assert.equal(ownAppointment.status, 201);
  assert.equal(otherAppointment.status, 201);
  const doctorAgenda = await request('/api/appointments', { cookie:doctorSession });
  assert.equal(doctorAgenda.status, 200);
  assert.deepEqual(doctorAgenda.data.map(a => a.id), [ownAppointment.data.id]);
  assert.equal((await request(`/api/appointments/${otherAppointment.data.id}/status`, { method:'PATCH', cookie:doctorSession, body:{status:'concluida'} })).status, 403);

  assert.equal((await request(`/api/professionals/${created.data.id}`, { method:'DELETE', cookie:staff })).status, 403);
  const adminMe = await request('/api/me', { cookie:admin });
  assert.equal((await request(`/api/professionals/${adminMe.data.user.id}`, { method:'DELETE', cookie:admin })).status, 403);

  const removed = await request(`/api/professionals/${created.data.id}`, { method:'DELETE', cookie:admin });
  assert.equal(removed.status, 200);
  assert.equal(removed.data.professional.active, false);
  assert.equal((await request('/api/me', { cookie:doctorSession })).status, 401);
  assert.equal((await login('MEDICA.TESTE', doctorPayload.password)).status, 401);
  assert.ok(!(await request('/api/doctors')).data.some(d => d.id === created.data.doctorId));

  const stored = JSON.parse(await readFile(path.join(dataDir, 'db.json'), 'utf8'));
  assert.ok(stored.doctors.some(d => d.id === created.data.doctorId && d.active === false));
  assert.ok(stored.appointments.some(a => a.id === ownAppointment.data.id));
  assert.ok(stored.auditLogs.some(a => a.action === 'criar_profissional' && a.relatedId === created.data.id));
  assert.ok(stored.auditLogs.some(a => a.action === 'excluir_profissional' && a.relatedId === created.data.id));

  const reactivated = await request(`/api/professionals/${created.data.id}/reactivate`, { method:'PATCH', cookie:admin });
  assert.equal(reactivated.status, 200);
  assert.equal(reactivated.data.active, true);
  assert.ok((await request('/api/doctors')).data.some(d => d.id === created.data.doctorId));
  assert.equal((await login('MEDICA.TESTE', doctorPayload.password)).status, 200);
});
