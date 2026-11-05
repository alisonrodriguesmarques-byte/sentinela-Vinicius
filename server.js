const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.SENTINELA_DATA_DIR ? path.resolve(process.env.SENTINELA_DATA_DIR) : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'troque-esta-chave-em-producao',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = 'id') {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDb(db) {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

function sanitizeCpf(cpf = '') {
  return String(cpf).replace(/\D/g, '');
}

function sanitizeCep(cep = '') {
  return String(cep).replace(/\D/g, '');
}

function patientFields(body = {}) {
  return {
    name: String(body.name || '').trim().slice(0, 150),
    cpf: sanitizeCpf(body.cpf),
    email: String(body.email || '').trim().toLowerCase().slice(0, 180),
    birthDate: String(body.birthDate || '').trim(),
    gender: ['masculino', 'feminino', 'nao_informado'].includes(body.gender) ? body.gender : 'nao_informado',
    phone: String(body.phone || '').trim().slice(0, 30),
    address: {
      cep: sanitizeCep(body.cep),
      street: String(body.street || '').trim().slice(0, 160),
      number: String(body.number || '').trim().slice(0, 30),
      neighborhood: String(body.neighborhood || '').trim().slice(0, 100),
      city: String(body.city || '').trim().slice(0, 100),
      state: String(body.state || '').trim().toUpperCase().slice(0, 2),
      complement: String(body.complement || '').trim().slice(0, 160)
    }
  };
}

function patientValidationError(db, patient, currentId = null) {
  if (!patient.name || patient.cpf.length !== 11) return 'Informe nome completo e CPF com 11 dígitos.';
  if (patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) return 'E-mail inválido.';
  if (patient.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(patient.birthDate)) return 'Data de nascimento inválida.';
  if (patient.address.cep && patient.address.cep.length !== 8) return 'CEP deve ter 8 dígitos.';
  if (db.patients.some(p => p.id !== currentId && p.cpf === patient.cpf)) return 'Este CPF já está cadastrado.';
  if (patient.email && db.patients.some(p => p.id !== currentId && p.email === patient.email)) return 'Este e-mail já está cadastrado.';
  return null;
}

function publicPatient(patient) {
  if (!patient) return null;
  const { passwordHash, ...safe } = patient;
  return safe;
}

function publicProfessional(prof) {
  if (!prof) return null;
  const { passwordHash, ...safe } = prof;
  return safe;
}

function requireAuth(req, res, next) {
  if (req.session.user?.type !== 'professional') return res.status(401).json({ error: 'Não autenticado.' });
  const professional = readDb().professionals.find(p => p.id === req.session.user.id && p.active !== false);
  if (!professional) return res.status(401).json({ error: 'Conta profissional indisponível.' });
  req.session.user.role = professional.role;
  req.session.user.doctorId = professional.doctorId || null;
  next();
}

function allowRoles(...roles) {
  return (req, res, next) => requireAuth(req, res, () => {
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'Acesso não autorizado para este perfil.' });
    }
    next();
  });
}

function audit(db, req, action, relatedId = null, details = null) {
  db.auditLogs.push({
    id: uid('log'),
    userId: req.session.user?.id || null,
    role: req.session.user?.role || 'public',
    action,
    relatedId,
    details,
    createdAt: nowIso()
  });
}

function makeAttendanceCode(db) {
  let code;
  do {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const number = Math.floor(100 + Math.random() * 900);
    code = `HMV-${letter}${number}`;
  } while (db.queue.some(q => q.code === code) || db.calls.some(c => c.code === code));
  return code;
}

function makeInventoryCode(db) {
  const nums = db.inventoryItems
    .map(x => String(x.code || '').match(/^HMV-ALM-(\d+)$/))
    .filter(Boolean)
    .map(m => Number(m[1]));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `HMV-ALM-${String(next).padStart(4, '0')}`;
}

function normalizeBilling(body = {}) {
  const type = body.attendanceType === 'convenio' ? 'convenio' : 'particular';
  if (type === 'convenio') {
    return {
      type,
      provider: String(body.insuranceProvider || ''),
      planName: String(body.planName || ''),
      cardNumber: String(body.cardNumber || ''),
      holderName: String(body.holderName || ''),
      authorizationNumber: String(body.authorizationNumber || ''),
      authorizationStatus: String(body.authorizationStatus || 'aguardando_autorizacao')
    };
  }
  return {
    type,
    amount: Number(body.amount || 0),
    paymentMethod: String(body.paymentMethod || ''),
    paymentStatus: String(body.paymentStatus || 'aguardando_pagamento')
  };
}

function slotSet() {
  return ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30'];
}

function initializeDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    writeDb({
      professionals: [],
      patients: [],
      doctors: [],
      appointments: [],
      exams: [],
      examBookings: [],
      surgeryRequests: [],
      bloodDonations: [],
      triageRecords: [],
      queue: [],
      calls: [],
      prescriptions: [],
      medicalRecords: [],
      results: [],
      notifications: [],
      auditLogs: []
    });
  }

  const db = readDb();
  const requiredArrays = ['professionals','patients','doctors','appointments','exams','examBookings','surgeryRequests','bloodDonations','triageRecords','queue','calls','prescriptions','medicalRecords','results','notifications','auditLogs','inventoryItems','inventoryBatches','inventoryMovements','inventoryRequests','suppliers','hospitalSectors','insuranceProviders','patientInsurances','billingRecords'];
  for (const key of requiredArrays) if (!Array.isArray(db[key])) db[key] = [];

  const demoUsers = [
    { username: 'MEDICO', role: 'medico', displayName: 'Médico HMV' },
    { username: 'ATENDIMENTO', role: 'atendimento', displayName: 'Atendimento HMV' },
    { username: 'TRIAGEM', role: 'triagem', displayName: 'Triagem HMV' },
    { username: 'ALMOXARIFADO', role: 'almoxarifado', displayName: 'Almoxarifado HMV' },
    { username: 'ADMIN', role: 'admin', displayName: 'Administrador HMV' }
  ];
  for (const u of demoUsers) {
    if (!db.professionals.some(p => p.username === u.username)) {
      db.professionals.push({
        id: uid('prof'),
        username: u.username,
        passwordHash: bcrypt.hashSync('123456', 10),
        role: u.role,
        displayName: u.displayName,
        active: true,
        createdAt: nowIso()
      });
    }
  }

  const doctors = [
    ['doc-carlos','Dr. Carlos Eduardo Menezes','Clínico Geral','CRM/SP 142536','Não aplicável','consulta'],
    ['doc-mariana','Dra. Mariana Souza Ramos','Pediatria','CRM/RJ 653298','45213','consulta'],
    ['doc-roberto','Dr. Roberto Alves Telles','Geriatria','CRM/DF 884321','19543','consulta'],
    ['doc-ricardo','Dr. Ricardo Augusto Vieira','Cardiologia','CRM/RS 341256','27419','consulta'],
    ['doc-juliana','Dra. Juliana Mendes Castro','Neurologia','CRM/PR 908123','51024','consulta'],
    ['doc-fernando','Dr. Fernando Alencar Silva','Psiquiatria','CRM/BA 563412','18963','consulta'],
    ['doc-amanda','Dra. Amanda Borges Lima','Dermatologia','CRM/ES 447812','32115','consulta'],
    ['doc-bruno','Dr. Bruno Fagundes Costa','Endocrinologia e Metabologia','CRM/SC 335412','22698','consulta'],
    ['doc-vanessa','Dra. Vanessa Rocha Pires','Gastroenterologia','CRM/PE 714523','14782','consulta'],
    ['doc-tiago','Dr. Tiago Antunes Neves','Pneumologia','CRM/GO 993412','40593','consulta'],
    ['doc-andre','Dr. André Luiz Carvalho','Cirurgia Geral','CRM/SC 239845','33412','cirurgia'],
    ['doc-paula','Dra. Paula Albuquerque Melo','Cirurgia do Aparelho Digestivo','CRM/SP 156432','41258','cirurgia'],
    ['doc-marcos','Dr. Marcos Vinícius Toledo','Neurocirurgia','CRM/RJ 224466','55190','cirurgia'],
    ['doc-sofia','Dra. Sofia Martins Guerra','Cirurgia Cardiovascular','CRM/MG 887711','30214','cirurgia'],
    ['doc-rodrigo','Dr. Rodrigo Sanches Peres','Cirurgia Oncológica','CRM/PR 113355','47823','cirurgia'],
    ['doc-beatriz','Dra. Beatriz Pinheiro Dias','Ortopedia e Traumatologia','CRM/GO 892345','42109','cirurgia'],
    ['doc-marcelo','Dr. Marcelo Fontes Xavier','Urologia','CRM/RS 664422','19854','cirurgia'],
    ['doc-helena','Dra. Helena Silveira Campos','Cirurgia Plástica','CRM/BA 775533','26411','cirurgia'],
    ['doc-renato','Dr. Renato Custódio Lima','Cirurgia Pediátrica','CRM/PE 991144','38552','cirurgia'],
    ['doc-leticia','Dra. Letícia Malta Freire','Cirurgia de Cabeça e Pescoço','CRM/CE 554411','50921','cirurgia'],
    ['doc-camila','Dra. Camila Fontes Rocha','Ginecologia e Obstetrícia','CRM/DEMO 000001','DEMO','consulta']
  ];
  for (const [id,name,specialty,crm,rqe,type] of doctors) {
    if (!db.doctors.some(d => d.id === id)) db.doctors.push({ id,name,specialty,crm,rqe,type,active:true });
  }

  const exams = [
    ['exam-eco','Ecocardiograma Transtorácico','Imagem e gráficos',['doc-ricardo'],true],
    ['exam-rm','Ressonância Magnética do Encéfalo','Imagem e gráficos',['doc-juliana'],true],
    ['exam-endo','Endoscopia Digestiva Alta','Imagem e gráficos',['doc-paula','doc-vanessa'],true],
    ['exam-raiox','Radiografia (Raio-X) de Tórax / Membros','Imagem e gráficos',['doc-beatriz','doc-tiago'],true],
    ['exam-uspelv','Ultrassonografia Pélvica / Transvaginal','Imagem e gráficos',['doc-camila'],true],
    ['exam-hemo','Hemograma Completo e Bioquímica (Sangue)','Ambulatoriais e rotina',['doc-carlos','doc-mariana'],false],
    ['exam-eeg','Eletroencefalograma (EEG)','Ambulatoriais e rotina',['doc-juliana'],true],
    ['exam-nevos','Mapeamento de Nevos','Ambulatoriais e rotina',['doc-amanda'],true],
    ['exam-espiro','Espirometria','Ambulatoriais e rotina',['doc-tiago'],true],
    ['exam-polis','Polissonografia','Ambulatoriais e rotina',['doc-fernando','doc-juliana'],true]
  ];
  for (const [id,name,category,doctorIds,requiresMedicalOrder] of exams) {
    if (!db.exams.some(e => e.id === id)) db.exams.push({ id,name,category,doctorIds,requiresMedicalOrder,active:true });
  }

  const sectors = ['Atendimento','Triagem','Consultório 01','Consultório 02','Consultório 03','Pediatria','Centro Cirúrgico','Laboratório','Administração','Limpeza','Almoxarifado','Recepção'];
  for (const name of sectors) {
    if (!db.hospitalSectors.some(x => x.name === name)) db.hospitalSectors.push({ id: uid('sector'), name, active: true });
  }

  const seedSuppliers = [
    ['sup-demo-1','MedSuprimentos Demo','00.000.000/0001-00','(61) 0000-0000','contato@exemplo.com'],
    ['sup-demo-2','Hospitalar Goiás Demo','11.111.111/0001-11','(62) 0000-0000','vendas@exemplo.com']
  ];
  for (const [id,name,cnpj,phone,email] of seedSuppliers) {
    if (!db.suppliers.some(x => x.id === id)) db.suppliers.push({ id,name,cnpj,phone,email,address:'',notes:'Dados demonstrativos',active:true,createdAt:nowIso() });
  }

  const seedItems = [
    ['inv-demo-1','HMV-ALM-0001','Luva de procedimento','Material hospitalar','caixa',15,20,100,'Prateleira A-03','sup-demo-1'],
    ['inv-demo-2','HMV-ALM-0002','Gaze estéril','Material hospitalar','pacote',0,15,80,'Prateleira A-04','sup-demo-1'],
    ['inv-demo-3','HMV-ALM-0003','Máscara cirúrgica','EPIs','caixa',42,20,120,'Prateleira B-01','sup-demo-2'],
    ['inv-demo-4','HMV-ALM-0004','Papel A4','Material administrativo','resma',30,10,60,'Prateleira C-02','sup-demo-2']
  ];
  for (const [id,code,name,category,unit,quantity,minStock,maxStock,location,supplierId] of seedItems) {
    if (!db.inventoryItems.some(x => x.id === id)) db.inventoryItems.push({ id,code,name,category,unit,quantity,minStock,maxStock,location,supplierId,active:true,createdAt:nowIso(),updatedAt:nowIso() });
  }

  const insuranceSeed = [
    ['ins-demo-1','Convênio Demonstração A'],
    ['ins-demo-2','Convênio Demonstração B']
  ];
  for (const [id,name] of insuranceSeed) {
    if (!db.insuranceProviders.some(x => x.id === id)) db.insuranceProviders.push({ id,name,active:true,phone:'',email:'',notes:'Convênio demonstrativo' });
  }

  writeDb(db);
}

initializeDb();

app.post('/api/auth/professional-login', async (req, res) => {
  const username = String(req.body.username || '').trim().toUpperCase();
  const password = String(req.body.password || '');
  const db = readDb();
  const prof = db.professionals.find(p => p.username === username && p.active !== false);
  if (!prof || !(await bcrypt.compare(password, prof.passwordHash))) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
  }
  req.session.user = { id: prof.id, role: prof.role, type: 'professional' };
  audit(db, req, 'login_profissional', prof.id);
  writeDb(db);
  res.json({ user: publicProfessional(prof) });
});

// Atalho exclusivo do protótipo local. Nunca habilitar em uma implantação pública.
app.post('/api/auth/demo-admin-shortcut', (req, res) => {
  if (process.env.DEMO_ADMIN_SHORTCUT !== '1' || process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Atalho de demonstração indisponível.' });
  }
  const loopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
  const host = String(req.get('host') || '');
  const validHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const origin = req.get('origin');
  const sameOrigin = !origin || origin === `http://${host}`;
  const fetchSite = req.get('sec-fetch-site');
  if (!loopback || !validHost || !sameOrigin || (fetchSite && !['same-origin', 'none'].includes(fetchSite))) {
    return res.status(403).json({ error: 'Atalho permitido apenas no navegador local.' });
  }

  const db = readDb();
  const admin = db.professionals.find(p => p.username === 'ADMIN' && p.role === 'admin' && p.active !== false);
  if (!admin) return res.status(404).json({ error: 'Administrador de demonstração indisponível.' });
  req.session.user = { id: admin.id, role: 'admin', type: 'professional' };
  audit(db, req, 'login_demo_admin_atalho', admin.id);
  writeDb(db);
  res.json({ user: publicProfessional(admin), demo: true });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const db = readDb();
  audit(db, req, 'logout', req.session.user.id);
  writeDb(db);
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', requireAuth, (req, res) => {
  const db = readDb();
  const prof = db.professionals.find(p => p.id === req.session.user.id);
  if (!prof || prof.active === false) return res.status(401).json({ error: 'Conta profissional indisponível.' });
  res.json({ user: publicProfessional(prof), role: prof?.role });
});

app.get('/api/doctors', (req, res) => {
  const db = readDb();
  res.json(db.doctors.filter(d => d.active !== false));
});

app.get('/api/medical-specialties', allowRoles('admin'), (req, res) => {
  const db = readDb();
  const byName = new Map(db.doctors.map(d => [d.specialty, { name: d.specialty, type: d.type }]));
  res.json([...byName.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
});

app.get('/api/exams', (req, res) => {
  const db = readDb();
  res.json(db.exams.filter(e => e.active !== false));
});

app.get('/api/availability', (req, res) => {
  const doctorId = String(req.query.doctorId || '');
  const date = String(req.query.date || '');
  if (!doctorId || !date) return res.status(400).json({ error: 'doctorId e date são obrigatórios.' });
  const db = readDb();
  const taken = new Set(db.appointments.filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'cancelada').map(a => a.time));
  const slots = slotSet().map(time => ({ time, available: !taken.has(time) }));
  res.json({ doctorId, date, slots });
});

app.post('/api/appointments', allowRoles('admin','atendimento'), (req, res) => {
  const db = readDb();
  const doctorId = String(req.body.doctorId || '');
  const date = String(req.body.date || '');
  const time = String(req.body.time || '');
  const patientId = String(req.body.patientId || '');
  if (!doctorId || !date || !time || !patientId) return res.status(400).json({ error: 'Dados incompletos.' });
  if (!db.doctors.some(d => d.id === doctorId)) return res.status(404).json({ error: 'Médico não encontrado.' });
  if (!db.patients.some(p => p.id === patientId)) return res.status(404).json({ error: 'Paciente não encontrado.' });
  if (db.appointments.some(a => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'cancelada')) {
    return res.status(409).json({ error: 'Este horário acabou de ser reservado. Escolha outro horário.' });
  }
  const appointment = {
    id: uid('appt'),
    patientId,
    doctorId,
    date,
    time,
    reason: String(req.body.reason || ''),
    billing: normalizeBilling(req.body),
    status: req.body.attendanceType === 'convenio' && String(req.body.authorizationStatus || '') !== 'autorizado' ? 'aguardando_autorizacao' : 'confirmada',
    createdAt: nowIso()
  };
  db.appointments.push(appointment);
  db.notifications.push({ id: uid('not'), patientId, title: 'Consulta confirmada', message: `Consulta marcada para ${date} às ${time}.`, read: false, createdAt: nowIso() });
  audit(db, req, 'criar_consulta', appointment.id);
  writeDb(db);
  res.status(201).json(appointment);
});

app.get('/api/appointments', requireAuth, (req, res) => {
  const db = readDb();
  const items = req.session.user.role === 'medico' && req.session.user.doctorId
    ? db.appointments.filter(a => a.doctorId === req.session.user.doctorId)
    : db.appointments;
  const expanded = items.map(a => ({
    ...a,
    patient: publicPatient(db.patients.find(p => p.id === a.patientId)),
    doctor: db.doctors.find(d => d.id === a.doctorId) || null
  }));
  res.json(expanded);
});

app.patch('/api/appointments/:id/status', allowRoles('medico','admin','atendimento'), (req, res) => {
  const db = readDb();
  const item = db.appointments.find(a => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Consulta não encontrada.' });
  if (req.session.user.role === 'medico' && req.session.user.doctorId && item.doctorId !== req.session.user.doctorId) {
    return res.status(403).json({ error: 'Consulta de outro médico.' });
  }
  item.status = String(req.body.status || item.status);
  item.updatedAt = nowIso();
  audit(db, req, 'alterar_status_consulta', item.id, { status: item.status });
  writeDb(db);
  res.json(item);
});

app.post('/api/exam-bookings', allowRoles('medico','admin'), (req, res) => {
  const db = readDb();
  const patientId = String(req.body.patientId || '');
  if (!db.patients.some(p => p.id === patientId)) return res.status(404).json({ error: 'Paciente não encontrado.' });
  const exam = db.exams.find(e => e.id === req.body.examId);
  if (!exam) return res.status(404).json({ error: 'Exame não encontrado.' });
  const booking = {
    id: uid('exam'),
    patientId,
    examId: exam.id,
    date: req.body.date || '',
    time: req.body.time || '',
    status: 'solicitado',
    doctorId: req.body.doctorId || exam.doctorIds[0] || null,
    billing: normalizeBilling(req.body),
    createdAt: nowIso()
  };
  db.examBookings.push(booking);
  audit(db, req, 'agendar_exame', booking.id);
  writeDb(db);
  res.status(201).json(booking);
});

app.get('/api/exam-bookings', requireAuth, (req, res) => {
  const db = readDb();
  res.json(db.examBookings.map(x => ({
    ...x,
    exam: db.exams.find(e => e.id === x.examId) || null,
    patient: publicPatient(db.patients.find(p => p.id === x.patientId)),
    doctor: db.doctors.find(d => d.id === x.doctorId) || null
  })));
});

app.post('/api/surgery-requests', allowRoles('medico','admin'), (req, res) => {
  const db = readDb();
  const patientId = String(req.body.patientId || '');
  if (!db.patients.some(p => p.id === patientId)) return res.status(404).json({ error: 'Paciente não encontrado.' });
  const doctor = db.doctors.find(d => d.id === req.body.doctorId && d.type === 'cirurgia');
  if (!doctor) return res.status(400).json({ error: 'Selecione um cirurgião válido.' });
  const item = {
    id: uid('surg'),
    patientId,
    doctorId: doctor.id,
    specialty: doctor.specialty,
    reason: String(req.body.reason || ''),
    preferredDate: req.body.preferredDate || '',
    billing: normalizeBilling(req.body),
    status: 'aguardando_avaliacao',
    createdAt: nowIso()
  };
  db.surgeryRequests.push(item);
  audit(db, req, 'solicitar_avaliacao_cirurgica', item.id);
  writeDb(db);
  res.status(201).json(item);
});

app.get('/api/surgery-requests', requireAuth, (req, res) => {
  const db = readDb();
  res.json(db.surgeryRequests.map(x => ({
    ...x,
    patient: publicPatient(db.patients.find(p => p.id === x.patientId)),
    doctor: db.doctors.find(d => d.id === x.doctorId) || null
  })));
});

app.patch('/api/surgery-requests/:id/status', allowRoles('medico','admin'), (req, res) => {
  const db = readDb();
  const item = db.surgeryRequests.find(x => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Solicitação não encontrada.' });
  item.status = String(req.body.status || item.status);
  item.updatedAt = nowIso();
  audit(db, req, 'alterar_status_cirurgia', item.id, { status: item.status });
  writeDb(db);
  res.json(item);
});

app.post('/api/blood-donations', allowRoles('atendimento','admin'), (req, res) => {
  const db = readDb();
  const patientId = String(req.body.patientId || '');
  if (!db.patients.some(p => p.id === patientId)) return res.status(404).json({ error: 'Paciente não encontrado.' });
  const item = {
    id: uid('don'), patientId,
    date: req.body.date || '',
    time: req.body.time || '',
    unit: req.body.unit || 'HMV',
    status: 'agendada',
    createdAt: nowIso()
  };
  db.bloodDonations.push(item);
  audit(db, req, 'agendar_doacao', item.id);
  writeDb(db);
  res.status(201).json(item);
});

app.get('/api/blood-donations', requireAuth, (req, res) => {
  const db = readDb();
  res.json(db.bloodDonations.map(x => ({ ...x, patient: publicPatient(db.patients.find(p => p.id === x.patientId)) })));
});


app.get('/api/professionals', allowRoles('admin'), (req, res) => {
  const db = readDb();
  res.json(db.professionals.map(publicProfessional));
});

app.post('/api/professionals', allowRoles('admin'), async (req, res) => {
  const db = readDb();
  const displayName = String(req.body.displayName || '').trim();
  const username = String(req.body.username || '').trim().toUpperCase();
  const password = String(req.body.password || '');
  const role = String(req.body.role || '').trim();
  const allowedRoles = ['medico', 'atendimento', 'triagem', 'almoxarifado', 'admin'];

  if (displayName.length < 3 || displayName.length > 150) return res.status(400).json({ error: 'Informe o nome completo do profissional.' });
  if (!/^[A-Z0-9._-]{3,32}$/.test(username)) return res.status(400).json({ error: 'Usuário deve ter de 3 a 32 letras, números, pontos, hífens ou sublinhados.' });
  if (password.length < 8 || password.length > 72) return res.status(400).json({ error: 'A senha deve ter de 8 a 72 caracteres.' });
  if (!allowedRoles.includes(role)) return res.status(400).json({ error: 'Perfil profissional inválido.' });
  if (db.professionals.some(p => p.username === username)) return res.status(409).json({ error: 'Este usuário já existe.' });

  let specialty = '';
  let doctorType = null;
  if (role === 'medico') {
    specialty = String(req.body.specialty || '').trim();
    const reference = db.doctors.find(d => d.specialty === specialty);
    if (!reference) return res.status(400).json({ error: 'Selecione uma especialidade médica válida.' });
    doctorType = reference.type;
  }

  const professional = {
    id: uid('prof'), username, displayName,
    passwordHash: await bcrypt.hash(password, 10),
    role, active: true, createdBy: req.session.user.id, createdAt: nowIso()
  };

  if (role === 'medico') {
    const doctor = {
      id: uid('doc'), professionalId: professional.id,
      name: displayName, specialty,
      crm: String(req.body.crm || '').trim().slice(0, 60),
      rqe: String(req.body.rqe || '').trim().slice(0, 40),
      type: doctorType, active: true, createdAt: nowIso()
    };
    professional.doctorId = doctor.id;
    professional.specialty = specialty;
    db.doctors.push(doctor);
  }

  db.professionals.push(professional);
  audit(db, req, 'criar_profissional', professional.id, { role, specialty: specialty || null });
  writeDb(db);
  res.status(201).json(publicProfessional(professional));
});

app.delete('/api/professionals/:id', allowRoles('admin'), (req, res) => {
  const db = readDb();
  const professional = db.professionals.find(p => p.id === req.params.id);
  if (!professional) return res.status(404).json({ error: 'Profissional não encontrado.' });
  if (professional.active === false) return res.status(409).json({ error: 'Profissional já está desativado.' });
  if (professional.id === req.session.user.id) return res.status(403).json({ error: 'Você não pode excluir sua própria conta.' });
  if (professional.role === 'admin' && db.professionals.filter(p => p.role === 'admin' && p.active !== false).length <= 1) {
    return res.status(409).json({ error: 'É necessário manter pelo menos um administrador ativo.' });
  }
  professional.active = false;
  professional.deletedAt = nowIso();
  professional.deletedBy = req.session.user.id;
  if (professional.doctorId) {
    const doctor = db.doctors.find(d => d.id === professional.doctorId);
    if (doctor) doctor.active = false;
  }
  audit(db, req, 'excluir_profissional', professional.id, { role: professional.role });
  writeDb(db);
  res.json({ ok: true, professional: publicProfessional(professional) });
});

app.patch('/api/professionals/:id/reactivate', allowRoles('admin'), (req, res) => {
  const db = readDb();
  const professional = db.professionals.find(p => p.id === req.params.id);
  if (!professional) return res.status(404).json({ error: 'Profissional não encontrado.' });
  if (professional.active !== false) return res.status(409).json({ error: 'Profissional já está ativo.' });
  professional.active = true;
  delete professional.deletedAt;
  delete professional.deletedBy;
  if (professional.doctorId) {
    const doctor = db.doctors.find(d => d.id === professional.doctorId);
    if (doctor) doctor.active = true;
  }
  audit(db, req, 'reativar_profissional', professional.id);
  writeDb(db);
  res.json(publicProfessional(professional));
});

app.post('/api/medical-records', allowRoles('medico','admin'), (req, res) => {
  const db = readDb();
  const patientId = String(req.body.patientId || '');
  if (!db.patients.some(p => p.id === patientId)) return res.status(404).json({ error: 'Paciente não encontrado.' });
  const record = {
    id: uid('record'),
    patientId,
    appointmentId: req.body.appointmentId || null,
    complaint: req.body.complaint || '',
    history: req.body.history || '',
    physicalExam: req.body.physicalExam || '',
    hypothesis: req.body.hypothesis || '',
    diagnosis: req.body.diagnosis || '',
    conduct: req.body.conduct || '',
    recommendations: req.body.recommendations || '',
    returnPlan: req.body.returnPlan || '',
    createdBy: req.session.user.id,
    createdAt: nowIso()
  };
  db.medicalRecords.push(record);
  audit(db, req, 'registrar_consulta_medica', record.id);
  writeDb(db);
  res.status(201).json(record);
});

app.get('/api/medical-records', requireAuth, (req, res) => {
  const db = readDb();
  if (!['medico','admin'].includes(req.session.user.role)) return res.status(403).json({ error: 'Acesso não autorizado.' });
  res.json(db.medicalRecords.map(x => ({ ...x, patient: publicPatient(db.patients.find(p => p.id === x.patientId)) })));
});

app.get('/api/patients', allowRoles('medico','triagem','atendimento','admin'), (req, res) => {
  const db = readDb();
  res.json(db.patients.map(publicPatient));
});

app.post('/api/patients', allowRoles('atendimento','admin'), (req, res) => {
  const db = readDb();
  const fields = patientFields(req.body);
  const error = patientValidationError(db, fields);
  if (error) return res.status(error.includes('já está cadastrado') ? 409 : 400).json({ error });
  const patient = { id: uid('pat'), ...fields, createdBy: req.session.user.id, createdAt: nowIso(), updatedAt: nowIso() };
  db.patients.push(patient);
  audit(db, req, 'cadastro_paciente_profissional', patient.id);
  writeDb(db);
  res.status(201).json(publicPatient(patient));
});

app.patch('/api/patients/:id', allowRoles('atendimento','admin'), (req, res) => {
  const db = readDb();
  const patient = db.patients.find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Paciente não encontrado.' });
  const fields = patientFields(req.body);
  const error = patientValidationError(db, fields, patient.id);
  if (error) return res.status(error.includes('já está cadastrado') ? 409 : 400).json({ error });
  Object.assign(patient, fields, { updatedAt: nowIso() });
  audit(db, req, 'atualizar_cadastro_paciente', patient.id);
  writeDb(db);
  res.json(publicPatient(patient));
});

app.post('/api/queue', allowRoles('atendimento','triagem','medico','admin'), (req, res) => {
  const db = readDb();
  const patientId = String(req.body.patientId || '');
  if (!db.patients.some(p => p.id === patientId)) return res.status(404).json({ error: 'Paciente não encontrado.' });
  const item = {
    id: uid('queue'),
    code: makeAttendanceCode(db),
    patientId,
    priority: req.body.priority || 'verde',
    stage: req.body.stage || 'aguardando_triagem',
    destination: req.body.destination || 'Triagem',
    billing: normalizeBilling(req.body),
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  db.queue.push(item);
  audit(db, req, 'criar_fila', item.id);
  writeDb(db);
  res.status(201).json(item);
});

app.get('/api/queue', allowRoles('medico','triagem','atendimento','admin'), (req, res) => {
  const db = readDb();
  res.json(db.queue.map(q => ({
    ...q,
    patient: publicPatient(db.patients.find(p => p.id === q.patientId))
  })));
});

app.patch('/api/queue/:id', allowRoles('medico','triagem','atendimento','admin'), (req, res) => {
  const db = readDb();
  const item = db.queue.find(q => q.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Registro da fila não encontrado.' });
  for (const key of ['priority','stage','destination']) if (req.body[key] !== undefined) item[key] = req.body[key];
  item.updatedAt = nowIso();
  audit(db, req, 'atualizar_fila', item.id);
  writeDb(db);
  res.json(item);
});

app.post('/api/triage', allowRoles('triagem','medico','admin'), (req, res) => {
  const db = readDb();
  const patientId = String(req.body.patientId || '');
  const record = {
    id: uid('triage'),
    patientId,
    bloodPressure: req.body.bloodPressure || '',
    heartRate: req.body.heartRate || '',
    respiratoryRate: req.body.respiratoryRate || '',
    temperature: req.body.temperature || '',
    saturation: req.body.saturation || '',
    weight: req.body.weight || '',
    height: req.body.height || '',
    allergies: req.body.allergies || '',
    symptoms: req.body.symptoms || '',
    complaint: req.body.complaint || '',
    observations: req.body.observations || '',
    priority: req.body.priority || 'verde',
    createdBy: req.session.user.id,
    createdAt: nowIso()
  };
  db.triageRecords.push(record);
  audit(db, req, 'registrar_triagem', record.id);
  writeDb(db);
  res.status(201).json(record);
});

app.get('/api/triage', allowRoles('triagem','medico','admin'), (req, res) => {
  const db = readDb();
  res.json(db.triageRecords.map(t => ({ ...t, patient: publicPatient(db.patients.find(p => p.id === t.patientId)) })));
});

app.post('/api/calls', allowRoles('medico','atendimento','admin'), (req, res) => {
  const db = readDb();
  const patient = db.patients.find(p => p.id === req.body.patientId);
  if (!patient) return res.status(404).json({ error: 'Paciente não encontrado.' });
  const queueItem = db.queue.find(q => q.patientId === patient.id && q.stage !== 'finalizado');
  const call = {
    id: uid('call'),
    code: queueItem?.code || makeAttendanceCode(db),
    patientId: patient.id,
    patientName: patient.name,
    destination: req.body.destination || queueItem?.destination || 'Consultório',
    calledAt: nowIso()
  };
  db.calls.unshift(call);
  db.calls = db.calls.slice(0, 50);
  if (queueItem) {
    queueItem.stage = 'chamado';
    queueItem.destination = call.destination;
    queueItem.updatedAt = nowIso();
  }
  audit(db, req, 'chamar_paciente_tv', call.id);
  writeDb(db);
  res.status(201).json(call);
});

app.get('/api/calls/latest', (req, res) => {
  const db = readDb();
  res.json(db.calls.slice(0, 8));
});

app.post('/api/prescriptions', allowRoles('medico','admin'), (req, res) => {
  const db = readDb();
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const alerts = [];
  for (const item of items) {
    if (!item.medication || !item.dose) alerts.push('Há medicamento sem nome ou dose preenchida.');
    if (String(item.dose || '').length > 20) alerts.push(`Revise a dose informada para ${item.medication || 'medicamento'}.`);
  }
  const prescription = {
    id: uid('rx'),
    patientId: req.body.patientId,
    items,
    notes: req.body.notes || '',
    alerts: [...new Set(alerts)],
    createdBy: req.session.user.id,
    createdAt: nowIso()
  };
  db.prescriptions.push(prescription);
  audit(db, req, 'criar_prescricao', prescription.id, { alerts: prescription.alerts });
  writeDb(db);
  res.status(201).json(prescription);
});

app.get('/api/prescriptions', requireAuth, (req, res) => {
  const db = readDb();
  res.json(db.prescriptions.map(x => ({ ...x, patient: publicPatient(db.patients.find(p => p.id === x.patientId)) })));
});

app.get('/api/results', requireAuth, (req, res) => {
  const db = readDb();
  res.json(db.results);
});

app.get('/api/admin/stats', allowRoles('admin','medico','atendimento','triagem','almoxarifado'), (req, res) => {
  const db = readDb();
  const today = new Date().toISOString().slice(0,10);
  res.json({
    patients: db.patients.length,
    appointmentsToday: db.appointments.filter(a => a.date === today && a.status !== 'cancelada').length,
    waiting: db.queue.filter(q => !['finalizado','em_consulta'].includes(q.stage)).length,
    inTriage: db.queue.filter(q => q.stage === 'em_triagem').length,
    inConsultation: db.queue.filter(q => q.stage === 'em_consulta').length,
    exams: db.examBookings.length,
    surgeries: db.surgeryRequests.length,
    calls: db.calls.length
  });
});


// -----------------------------
// Convênio / Particular
// -----------------------------
app.get('/api/insurance/providers', requireAuth, (req, res) => {
  const db = readDb();
  res.json(db.insuranceProviders.filter(x => x.active !== false));
});

app.get('/api/patient-insurances', allowRoles('admin','atendimento'), (req, res) => {
  const db = readDb();
  const patientId = String(req.query.patientId || '');
  res.json(db.patientInsurances.filter(x => !patientId || x.patientId === patientId));
});

app.post('/api/patient-insurances', allowRoles('admin','atendimento'), (req, res) => {
  const db = readDb();
  const patientId = String(req.body.patientId || '');
  if (!db.patients.some(p => p.id === patientId)) return res.status(404).json({ error: 'Paciente não encontrado.' });
  const item = {
    id: uid('pins'),
    patientId,
    provider: String(req.body.provider || ''),
    planName: String(req.body.planName || ''),
    cardNumber: String(req.body.cardNumber || ''),
    holderName: String(req.body.holderName || ''),
    holderCpf: sanitizeCpf(req.body.holderCpf || ''),
    expiresAt: String(req.body.expiresAt || ''),
    active: true,
    createdAt: nowIso()
  };
  if (!item.provider || !item.cardNumber) return res.status(400).json({ error: 'Informe convênio e carteirinha.' });
  db.patientInsurances.push(item);
  audit(db, req, 'cadastrar_convenio_paciente', item.id);
  writeDb(db);
  res.status(201).json(item);
});

// -----------------------------
// Almoxarifado
// -----------------------------
app.get('/api/inventory/sectors', allowRoles('almoxarifado','admin','medico','triagem','atendimento'), (req, res) => {
  const db = readDb();
  res.json(db.hospitalSectors.filter(x => x.active !== false));
});

app.get('/api/inventory/suppliers', allowRoles('almoxarifado','admin'), (req, res) => {
  const db = readDb();
  res.json(db.suppliers.filter(x => x.active !== false));
});

app.post('/api/inventory/suppliers', allowRoles('almoxarifado','admin'), (req, res) => {
  const db = readDb();
  const item = {
    id: uid('sup'),
    name: String(req.body.name || '').trim(),
    cnpj: String(req.body.cnpj || '').trim(),
    phone: String(req.body.phone || '').trim(),
    email: String(req.body.email || '').trim(),
    address: String(req.body.address || '').trim(),
    notes: String(req.body.notes || '').trim(),
    active: true,
    createdAt: nowIso()
  };
  if (!item.name) return res.status(400).json({ error: 'Informe o nome do fornecedor.' });
  db.suppliers.push(item);
  audit(db, req, 'cadastrar_fornecedor', item.id);
  writeDb(db);
  res.status(201).json(item);
});

app.get('/api/inventory/items', allowRoles('almoxarifado','admin','medico','triagem','atendimento'), (req, res) => {
  const db = readDb();
  const items = db.inventoryItems
    .filter(x => x.active !== false)
    .map(x => ({
      ...x,
      supplier: db.suppliers.find(s => s.id === x.supplierId) || null,
      batches: db.inventoryBatches.filter(b => b.itemId === x.id && Number(b.quantity || 0) > 0)
    }));
  res.json(items);
});

app.post('/api/inventory/items', allowRoles('almoxarifado','admin'), (req, res) => {
  const db = readDb();
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Informe o nome do material.' });
  const item = {
    id: uid('inv'),
    code: makeInventoryCode(db),
    name,
    category: String(req.body.category || 'Outros'),
    unit: String(req.body.unit || 'unidade'),
    quantity: Math.max(0, Number(req.body.quantity || 0)),
    minStock: Math.max(0, Number(req.body.minStock || 0)),
    maxStock: Math.max(0, Number(req.body.maxStock || 0)),
    location: String(req.body.location || ''),
    supplierId: String(req.body.supplierId || ''),
    notes: String(req.body.notes || ''),
    active: true,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  db.inventoryItems.push(item);
  if (item.quantity > 0) {
    const batch = {
      id: uid('batch'), itemId: item.id, lot: String(req.body.lot || 'INICIAL'),
      quantity: item.quantity, expiresAt: String(req.body.expiresAt || ''), createdAt: nowIso()
    };
    db.inventoryBatches.push(batch);
    db.inventoryMovements.push({
      id: uid('mov'), itemId: item.id, type: 'entrada', quantity: item.quantity,
      previousQuantity: 0, newQuantity: item.quantity, supplierId: item.supplierId || null,
      lot: batch.lot, expiresAt: batch.expiresAt, reason: 'Estoque inicial', createdBy: req.session.user.id, createdAt: nowIso()
    });
  }
  audit(db, req, 'material_criado', item.id);
  writeDb(db);
  res.status(201).json(item);
});

app.post('/api/inventory/movements', allowRoles('almoxarifado','admin'), (req, res) => {
  const db = readDb();
  const item = db.inventoryItems.find(x => x.id === String(req.body.itemId || '') && x.active !== false);
  if (!item) return res.status(404).json({ error: 'Material não encontrado.' });
  const type = String(req.body.type || '');
  const quantity = Math.max(0, Number(req.body.quantity || 0));
  if (!['entrada','saida','devolucao','ajuste'].includes(type)) return res.status(400).json({ error: 'Tipo de movimentação inválido.' });

  const previousQuantity = Number(item.quantity || 0);
  let newQuantity = previousQuantity;
  if (type === 'entrada' || type === 'devolucao') newQuantity = previousQuantity + quantity;
  if (type === 'saida') {
    if (quantity > previousQuantity) return res.status(400).json({ error: 'Quantidade indisponível em estoque.' });
    newQuantity = previousQuantity - quantity;
  }
  if (type === 'ajuste') {
    if (req.body.newQuantity === undefined || req.body.newQuantity === '') return res.status(400).json({ error: 'Informe a quantidade contada no ajuste.' });
    newQuantity = Math.max(0, Number(req.body.newQuantity));
  }

  item.quantity = newQuantity;
  item.updatedAt = nowIso();

  if ((type === 'entrada' || type === 'devolucao') && quantity > 0) {
    db.inventoryBatches.push({
      id: uid('batch'), itemId: item.id, lot: String(req.body.lot || 'SEM LOTE'),
      quantity, expiresAt: String(req.body.expiresAt || ''), createdAt: nowIso()
    });
  }

  if (type === 'saida' && quantity > 0) {
    const batches = db.inventoryBatches.filter(b => b.itemId === item.id && Number(b.quantity || 0) > 0)
      .sort((a,b) => (a.expiresAt || '9999-12-31').localeCompare(b.expiresAt || '9999-12-31'));
    let remaining = quantity;
    for (const b of batches) {
      if (remaining <= 0) break;
      const take = Math.min(Number(b.quantity || 0), remaining);
      b.quantity = Number(b.quantity || 0) - take;
      remaining -= take;
    }
  }

  const movement = {
    id: uid('mov'), itemId: item.id, type, quantity: type === 'ajuste' ? Math.abs(newQuantity - previousQuantity) : quantity,
    previousQuantity, newQuantity,
    sector: String(req.body.sector || ''),
    responsible: String(req.body.responsible || ''),
    supplierId: String(req.body.supplierId || ''),
    lot: String(req.body.lot || ''),
    expiresAt: String(req.body.expiresAt || ''),
    reason: String(req.body.reason || ''),
    notes: String(req.body.notes || ''),
    createdBy: req.session.user.id,
    createdAt: nowIso()
  };
  db.inventoryMovements.push(movement);
  audit(db, req, `estoque_${type}`, item.id, { movementId: movement.id, previousQuantity, newQuantity });
  writeDb(db);
  res.status(201).json(movement);
});

app.get('/api/inventory/movements', allowRoles('almoxarifado','admin'), (req, res) => {
  const db = readDb();
  res.json(db.inventoryMovements.slice().reverse().map(m => ({
    ...m,
    item: db.inventoryItems.find(i => i.id === m.itemId) || null,
    supplier: db.suppliers.find(s => s.id === m.supplierId) || null
  })));
});

app.get('/api/inventory/requests', allowRoles('almoxarifado','admin','medico','triagem','atendimento'), (req, res) => {
  const db = readDb();
  let items = db.inventoryRequests;
  if (!['almoxarifado','admin'].includes(req.session.user.role)) items = items.filter(x => x.requestedBy === req.session.user.id);
  res.json(items.slice().reverse().map(r => ({
    ...r,
    item: db.inventoryItems.find(i => i.id === r.itemId) || null
  })));
});

app.post('/api/inventory/requests', allowRoles('almoxarifado','admin','medico','triagem','atendimento'), (req, res) => {
  const db = readDb();
  const item = db.inventoryItems.find(x => x.id === String(req.body.itemId || '') && x.active !== false);
  if (!item) return res.status(404).json({ error: 'Material não encontrado.' });
  const quantity = Math.max(1, Number(req.body.quantity || 1));
  const request = {
    id: uid('ireq'), itemId: item.id, quantity,
    sector: String(req.body.sector || ''),
    reason: String(req.body.reason || ''),
    status: 'pendente',
    requestedBy: req.session.user.id,
    requestedRole: req.session.user.role,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  db.inventoryRequests.push(request);
  audit(db, req, 'solicitar_material', request.id, { itemId: item.id, quantity });
  writeDb(db);
  res.status(201).json(request);
});

app.patch('/api/inventory/requests/:id/status', allowRoles('almoxarifado','admin'), (req, res) => {
  const db = readDb();
  const request = db.inventoryRequests.find(x => x.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Solicitação não encontrada.' });
  const nextStatus = String(req.body.status || '');
  if (!['em_analise','aprovada','entregue','recusada'].includes(nextStatus)) return res.status(400).json({ error: 'Status inválido.' });

  if (nextStatus === 'entregue' && request.status !== 'entregue') {
    const item = db.inventoryItems.find(x => x.id === request.itemId);
    if (!item) return res.status(404).json({ error: 'Material não encontrado.' });
    if (Number(item.quantity || 0) < Number(request.quantity || 0)) return res.status(400).json({ error: 'Quantidade indisponível em estoque.' });
    const previousQuantity = Number(item.quantity || 0);
    item.quantity = previousQuantity - Number(request.quantity || 0);
    item.updatedAt = nowIso();
    db.inventoryMovements.push({
      id: uid('mov'), itemId: item.id, type: 'saida', quantity: Number(request.quantity || 0),
      previousQuantity, newQuantity: item.quantity, sector: request.sector,
      responsible: 'Solicitação aprovada', reason: request.reason || 'Solicitação de setor',
      requestId: request.id, createdBy: req.session.user.id, createdAt: nowIso()
    });
  }
  request.status = nextStatus;
  request.updatedAt = nowIso();
  request.reviewedBy = req.session.user.id;
  audit(db, req, 'atualizar_solicitacao_material', request.id, { status: nextStatus });
  writeDb(db);
  res.json(request);
});

app.get('/api/inventory/stats', allowRoles('almoxarifado','admin'), (req, res) => {
  const db = readDb();
  const today = new Date().toISOString().slice(0,10);
  const items = db.inventoryItems.filter(x => x.active !== false);
  const expiringLimit = new Date(Date.now() + 30 * 86400000).toISOString().slice(0,10);
  const expiringIds = new Set(db.inventoryBatches.filter(b => b.expiresAt && b.expiresAt >= today && b.expiresAt <= expiringLimit && Number(b.quantity || 0) > 0).map(b => b.itemId));
  res.json({
    totalItems: items.length,
    lowStock: items.filter(x => Number(x.quantity || 0) > 0 && Number(x.quantity || 0) <= Number(x.minStock || 0)).length,
    outOfStock: items.filter(x => Number(x.quantity || 0) <= 0).length,
    expiringSoon: expiringIds.size,
    entriesToday: db.inventoryMovements.filter(x => x.type === 'entrada' && String(x.createdAt).slice(0,10) === today).length,
    exitsToday: db.inventoryMovements.filter(x => x.type === 'saida' && String(x.createdAt).slice(0,10) === today).length,
    pendingRequests: db.inventoryRequests.filter(x => ['pendente','em_analise','aprovada'].includes(x.status)).length
  });
});

app.get('/api/admin/audit', allowRoles('admin'), (req, res) => {
  const db = readDb();
  res.json(db.auditLogs.slice(-200).reverse());
});

app.get('/tv', (req, res) => res.sendFile(path.join(__dirname, 'public', 'tv.html')));
app.use('/api', (req, res) => res.status(404).json({ error: 'Rota da API não encontrada.' }));
app.use((req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`SENTINELA HMV disponível em http://localhost:${PORT}`);
  console.log('Logins demo: MEDICO / 123456 | ATENDIMENTO / 123456 | TRIAGEM / 123456 | ALMOXARIFADO / 123456 | ADMIN / 123456');
});
