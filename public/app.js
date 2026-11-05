const state = {
  user: null,
  role: null,
  currentView: null,
  doctors: [],
  exams: [],
  appointments: [],
  examBookings: [],
  surgeries: [],
  donations: [],
  patients: [],
  queue: [],
  triage: [],
  prescriptions: [],
  stats: null,
  notifications: []
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  lock: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  'eye-off': '<path d="m3 3 18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 4.24A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a18.4 18.4 0 0 1-2.1 3.2M6.6 6.6C3.6 8.4 2 12 2 12s3.5 8 10 8c1.6 0 3-.4 4.2-1"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  moon: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  'arrow-left': '<path d="m15 18-6-6 6-6"/><path d="M20 12H9"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/>',
  activity: '<path d="M3 12h4l2-7 4 14 2-7h6"/>',
  stethoscope: '<path d="M4 2v6a4 4 0 0 0 8 0V2M2 2h4M10 2h4"/><path d="M12 12v2a5 5 0 0 0 10 0v-1"/><circle cx="22" cy="10" r="2"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M8 14h8"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
  scissors: '<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="m8.7 8.3 11.6 6.4M8.7 15.7 20.3 9.3"/>',
  tv: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m8 2 4 3 4-3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4h-.1a1.7 1.7 0 0 0-1.7.6Z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  alert: '<path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
  map: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>'
};

function icon(name, cls = '') {
  const path = ICONS[name] || ICONS.file;
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
}

function applyIcons(root = document) {
  $$('[data-icon]', root).forEach(el => {
    const name = el.getAttribute('data-icon');
    el.innerHTML = icon(name);
  });
  $$('[data-icon-button]', root).forEach(el => {
    const name = el.getAttribute('data-icon-button');
    const extra = el.querySelector('.notification-dot')?.outerHTML || '';
    el.innerHTML = icon(name) + extra;
  });
}

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[ch]));
}

function formatDate(date) {
  if (!date) return '—';
  const [y,m,d] = date.split('-');
  if (!y || !m || !d) return date;
  return `${d}/${m}/${y}`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

function roleLabel(role) {
  return ({ medico:'Médico', atendimento:'Atendimento', triagem:'Triagem', almoxarifado:'Almoxarifado', admin:'Administrador' })[role] || role;
}

function statusLabel(status = '') {
  const map = {
    confirmada:'Confirmada', solicitado:'Solicitado', aguardando_avaliacao:'Aguardando avaliação',
    agendada:'Agendada', concluida:'Concluída', cancelada:'Cancelada', aguardando_triagem:'Aguardando triagem',
    em_triagem:'Em triagem', aguardando_medico:'Aguardando médico', chamado:'Chamado', em_consulta:'Em consulta', finalizado:'Finalizado',
    autorizada:'Autorizada', agendamento_hospitalar:'Agendamento hospitalar', exames_pre_operatorios:'Exames pré-operatórios',
    pendente:'Pendente', em_analise:'Em análise', aprovada:'Aprovada', entregue:'Entregue', recusada:'Recusada',
    aguardando_autorizacao:'Aguardando autorização', autorizado:'Autorizado', parcialmente_autorizado:'Parcialmente autorizado',
    negado:'Negado', aguardando_pagamento:'Aguardando pagamento', pago:'Pago', pagamento_parcial:'Pagamento parcial'
  };
  return map[status] || status.replaceAll('_',' ');
}

function badgeForStatus(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('cancel') || s.includes('vermelho')) return 'red';
  if (s.includes('confirm') || s.includes('conclu') || s.includes('agendada') || s.includes('verde')) return 'green';
  if (s.includes('aguard') || s.includes('solicit') || s.includes('amarelo')) return 'yellow';
  if (s.includes('consulta') || s.includes('chamado') || s.includes('azul')) return 'blue';
  return 'gray';
}

function toast(message, type = '') {
  const root = $('#toast-root');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

async function api(url, options = {}) {
  const opts = { ...options, headers: { ...(options.headers || {}) } };
  if (opts.body && typeof opts.body !== 'string') {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, opts);
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  if (res.status === 401 && state.user) {
    resetToLogin();
    throw new Error(data?.error || 'Sua sessão expirou.');
  }
  if (!res.ok) throw new Error(data?.error || 'Não foi possível concluir a operação.');
  return data;
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('sentinela-theme', theme);
  const btn = $('#theme-toggle');
  if (btn) {
    btn.setAttribute('data-icon-button', theme === 'dark' ? 'sun' : 'moon');
    applyIcons(btn.parentElement || document);
  }
}

function openModal(title, body, eyebrow = 'HMV') {
  $('#modal-title').textContent = title;
  $('#modal-eyebrow').textContent = eyebrow;
  $('#modal-body').innerHTML = body;
  $('#modal-backdrop').classList.remove('hidden');
  applyIcons($('#modal'));
}

function closeModal() {
  $('#modal-backdrop').classList.add('hidden');
  $('#modal-body').innerHTML = '';
}

function initials(name = 'HMV') {
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join('').toUpperCase();
}

function showAuth() {
  $('#auth-screen').classList.remove('hidden');
  $('#app-screen').classList.add('hidden');
  $('.login-tab').textContent = 'Acesso profissional';
}

function showApp() {
  $('#auth-screen').classList.add('hidden');
  $('#app-screen').classList.remove('hidden');
  $('#user-name').textContent = state.user.name || state.user.displayName || state.user.username || 'Usuário HMV';
  $('#user-role').textContent = state.role === 'medico' && state.user.specialty ? `Médico • ${state.user.specialty}` : roleLabel(state.role);
  $('#user-avatar').textContent = initials(state.user.name || state.user.displayName || state.user.username);
  buildMenu();
}

function resetToLogin() {
  state.user = null;
  state.role = null;
  state.currentView = null;
  showAuth();
}

const menuByRole = {
  medico: [
    ['doctor-home','Visão geral','home'], ['doctor-agenda','Agenda de consultas','calendar'], ['patients','Pacientes','users'],
    ['doctor-triage','Triagem','activity'], ['doctor-prescriptions','Prescrições','file'], ['doctor-exams','Exames','flask'],
    ['doctor-surgeries','Cirurgias','scissors'], ['request-material','Solicitar material','clipboard']
  ],
  triagem: [
    ['triage-home','Fila de triagem','activity'], ['triage-new','Registrar triagem','clipboard'], ['triage-history','Histórico','file'],
    ['request-material','Solicitar material','clipboard']
  ],
  atendimento: [
    ['service-home','Fila de pacientes','users'], ['service-patients','Cadastrar pacientes','plus'], ['service-new','Novo atendimento','clipboard'], ['service-calls','Chamada / TV','tv'],
    ['request-material','Solicitar material','clipboard']
  ],
  almoxarifado: [
    ['inventory-home','Visão geral','home'], ['inventory-stock','Estoque','clipboard'], ['inventory-entry','Entrada de materiais','plus'],
    ['inventory-exit','Saída de materiais','arrow-left'], ['inventory-requests','Solicitações','file'], ['inventory-suppliers','Fornecedores','users'],
    ['inventory-history','Histórico','clock']
  ],
  admin: [
    ['admin-home','Dashboard','home'], ['admin-patients','Pacientes','users'], ['admin-professionals','Profissionais','user'], ['admin-appointments','Consultas','calendar'],
    ['admin-exams','Exames','flask'], ['admin-surgeries','Cirurgias','scissors'], ['admin-queue','Fila hospitalar','activity'],
    ['inventory-home','Almoxarifado','clipboard'], ['admin-audit','Logs','file']
  ]
};

function buildMenu() {
  const items = menuByRole[state.role] || [];
  $('#sidebar-menu').innerHTML = items.map(([view,label,ico]) => `
    <button type="button" class="menu-item" data-view="${view}">
      <span class="menu-icon">${icon(ico)}</span><span>${label}</span>
    </button>`).join('');
  const fallback = items[0]?.[0];
  navigate(state.currentView && items.some(i => i[0] === state.currentView) ? state.currentView : fallback);
}

function setPageTitle(title, eyebrow = 'SENTINELA HMV') {
  $('#page-title').textContent = title;
  $('#page-eyebrow').textContent = eyebrow;
}

async function preloadCommon() {
  const [doctors, exams] = await Promise.all([api('/api/doctors'), api('/api/exams')]);
  state.doctors = doctors;
  state.exams = exams;
}

async function navigate(view) {
  if (!view) return;
  state.currentView = view;
  $$('.menu-item').forEach(x => x.classList.toggle('active', x.dataset.view === view));
  $('#sidebar').classList.remove('open');
  $('#mobile-overlay').classList.add('hidden');
  $('#main-content').innerHTML = `<div class="page-stack"><div class="skeleton" style="height:120px"></div><div class="skeleton" style="height:260px"></div></div>`;
  const renderers = {
    'doctor-home': renderDoctorHome,
    'doctor-agenda': renderDoctorAgenda,
    patients: renderPatients,
    'doctor-triage': renderDoctorTriage,
    'doctor-prescriptions': renderDoctorPrescriptions,
    'doctor-exams': renderDoctorExams,
    'doctor-surgeries': renderDoctorSurgeries,
    'triage-home': renderTriageHome,
    'triage-new': renderTriageNew,
    'triage-history': renderTriageHistory,
    'service-home': renderServiceHome,
    'service-patients': renderPatients,
    'service-new': renderServiceNew,
    'service-calls': renderServiceCalls,
    'request-material': renderMaterialRequest,
    'inventory-home': renderInventoryHome,
    'inventory-stock': renderInventoryStock,
    'inventory-entry': renderInventoryEntry,
    'inventory-exit': renderInventoryExit,
    'inventory-requests': renderInventoryRequests,
    'inventory-suppliers': renderInventorySuppliers,
    'inventory-history': renderInventoryHistory,
    'admin-home': renderAdminHome,
    'admin-patients': renderAdminPatients,
    'admin-professionals': renderAdminProfessionals,
    'admin-appointments': renderAdminAppointments,
    'admin-exams': renderAdminExams,
    'admin-surgeries': renderAdminSurgeries,
    'admin-queue': renderAdminQueue,
    'admin-audit': renderAdminAudit
  };
  try {
    await (renderers[view] || renderNotFound)();
    applyIcons($('#main-content'));
  } catch (err) {
    $('#main-content').innerHTML = `<div class="panel"><div class="empty-state"><h3>Não foi possível carregar esta área</h3><p>${esc(err.message)}</p><button class="primary-button" data-action="retry-view">Tentar novamente</button></div></div>`;
  }
}

function statCard(label, value, ico = 'activity') {
  return `<div class="stat-card"><div><div class="stat-label">${esc(label)}</div><strong>${esc(value)}</strong></div><span class="stat-icon">${icon(ico)}</span></div>`;
}

function emptyState(title, text, actionHtml = '') {
  return `<div class="empty-state"><h3>${esc(title)}</h3><p>${esc(text)}</p>${actionHtml}</div>`;
}

async function loadPatientData() {
  const [appointments, examBookings, surgeries, donations, prescriptions, results] = await Promise.all([
    api('/api/appointments'), api('/api/exam-bookings'), api('/api/surgery-requests'), api('/api/blood-donations'), api('/api/prescriptions'), api('/api/results')
  ]);
  Object.assign(state, { appointments, examBookings, surgeries, donations, prescriptions, results });
}

async function renderPatientHome() {
  setPageTitle('Início', 'Portal do Paciente');
  await loadPatientData();
  const upcoming = [...state.appointments].filter(a => a.status !== 'cancelada').sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];
  const nextExam = [...state.examBookings].filter(x => x.status !== 'cancelada').sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];
  $('#main-content').innerHTML = `
    <div class="page-stack">
      <div class="page-head"><div><h2>Olá, ${esc((state.user.name || '').split(' ')[0] || 'paciente')}</h2><p>Acompanhe seus próximos atendimentos e serviços do HMV.</p></div></div>
      <div class="stats-grid">
        ${statCard('Consultas agendadas', state.appointments.filter(a => a.status !== 'cancelada').length, 'calendar')}
        ${statCard('Exames', state.examBookings.length, 'flask')}
        ${statCard('Cirurgias em avaliação', state.surgeries.filter(x => !['concluida','cancelada'].includes(x.status)).length, 'scissors')}
        ${statCard('Receitas', state.prescriptions.length, 'file')}
      </div>
      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel-head"><div><h3>Próximos atendimentos</h3><p>Consultas e exames que estão mais próximos.</p></div></div>
          <div class="panel-body">
            ${upcoming ? `<div class="service-item"><div><h3>${esc(upcoming.doctor?.specialty || 'Consulta')}</h3><p>${esc(upcoming.doctor?.name || '')} • ${formatDate(upcoming.date)} às ${esc(upcoming.time)}</p></div><span class="badge green">${statusLabel(upcoming.status)}</span></div>` : emptyState('Nenhuma consulta agendada','Quando você marcar uma consulta, ela aparecerá aqui.')}
            ${nextExam ? `<div class="service-item" style="margin-top:10px"><div><h3>${esc(nextExam.exam?.name || 'Exame')}</h3><p>${formatDate(nextExam.date)} às ${esc(nextExam.time || '—')}</p></div><span class="badge ${badgeForStatus(nextExam.status)}">${statusLabel(nextExam.status)}</span></div>` : ''}
          </div>
        </section>
        <section class="panel">
          <div class="panel-head"><div><h3>Acesso rápido</h3><p>Serviços mais utilizados.</p></div></div>
          <div class="panel-body quick-grid" style="grid-template-columns:1fr 1fr">
            <button class="quick-action" data-view-jump="consultations"><span class="quick-icon">${icon('calendar')}</span><strong>Marcar consulta</strong><span>Escolha médico e horário.</span></button>
            <button class="quick-action" data-view-jump="exams"><span class="quick-icon">${icon('flask')}</span><strong>Exames</strong><span>Consulte opções disponíveis.</span></button>
            <button class="quick-action" data-view-jump="surgeries"><span class="quick-icon">${icon('scissors')}</span><strong>Cirurgias</strong><span>Solicite avaliação.</span></button>
            <button class="quick-action" data-view-jump="donations"><span class="quick-icon">${icon('heart')}</span><strong>Doação</strong><span>Agende uma doação.</span></button>
          </div>
        </section>
      </div>
      <div class="info-note">Este projeto é um protótipo demonstrativo. Recursos de saúde, disponibilidade, profissionais e documentos devem ser validados antes de uso real.</div>
    </div>`;
}

async function renderConsultations() {
  setPageTitle('Consultas', 'Portal do Paciente');
  const doctors = state.doctors.filter(d => d.type === 'consulta');
  $('#main-content').innerHTML = `
    <div class="page-stack">
      <div class="page-head"><div><h2>Marcar consulta</h2><p>Escolha uma especialidade e visualize horários disponíveis.</p></div></div>
      <div class="filters"><input id="doctor-search" placeholder="Buscar médico ou especialidade" /></div>
      <div class="doctor-grid" id="doctor-grid">
        ${doctors.map(doctorCard).join('')}
      </div>
    </div>`;
}

function doctorCard(d) {
  return `<article class="doctor-card" data-doctor-search="${esc((d.name+' '+d.specialty).toLowerCase())}">
    <div><span class="doctor-type">${d.type === 'cirurgia' ? 'Cirurgia' : 'Consulta'}</span><h3>${esc(d.name)}</h3></div>
    <div class="doctor-meta"><span>${esc(d.specialty)}</span><span>${esc(d.crm)}</span><span>RQE: ${esc(d.rqe)}</span></div>
    <div class="doctor-actions"><span class="badge green">Agenda disponível</span><button class="small-button primary" data-action="book-doctor" data-doctor-id="${d.id}">Ver horários</button></div>
  </article>`;
}

async function openAppointmentModal(doctorId) {
  const doctor = state.doctors.find(d => d.id === doctorId);
  if (!doctor) return;
  const min = new Date().toISOString().slice(0,10);
  openModal('Agendar consulta', `
    <div class="appointment-builder">
      <div class="info-box"><span>Profissional</span><strong>${esc(doctor.name)}</strong><div class="doctor-meta" style="margin-top:5px">${esc(doctor.specialty)} • ${esc(doctor.crm)}</div></div>
      <div class="field"><label for="appt-date">Escolha a data</label><input id="appt-date" type="date" min="${min}" /></div>
      <div><label style="display:block;font-size:.86rem;font-weight:750;margin-bottom:8px">Horários</label><div id="slot-area" class="slot-grid"><button class="slot-button" disabled>Selecione a data</button></div></div>
      <div class="field"><label for="appt-reason">Motivo da consulta <span class="optional">(opcional)</span></label><textarea id="appt-reason" placeholder="Descreva brevemente o motivo"></textarea></div>
      ${billingFieldsHtml('appt')}
      <div class="form-actions"><button class="secondary-button" type="button" data-action="close-modal">Cancelar</button><button class="primary-button" id="confirm-appointment" type="button" data-doctor-id="${doctor.id}" disabled>Confirmar consulta</button></div>
    </div>`, doctor.specialty);
}

async function loadAvailability(doctorId, date) {
  const area = $('#slot-area');
  area.innerHTML = `<div class="skeleton" style="height:42px"></div><div class="skeleton" style="height:42px"></div>`;
  const data = await api(`/api/availability?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`);
  area.innerHTML = data.slots.map(s => `<button type="button" class="slot-button" data-action="select-slot" data-time="${s.time}" ${s.available ? '' : 'disabled'}>${s.time}</button>`).join('');
}

async function renderPatientExams() {
  setPageTitle('Exames', 'Portal do Paciente');
  const grouped = Object.groupBy ? Object.groupBy(state.exams, e => e.category) : state.exams.reduce((acc,e) => ((acc[e.category] ||= []).push(e), acc), {});
  $('#main-content').innerHTML = `<div class="page-stack">
    <div class="page-head"><div><h2>Exames</h2><p>Consulte exames e solicite horários disponíveis.</p></div></div>
    ${Object.entries(grouped).map(([category,items]) => `<section class="panel"><div class="panel-head"><div><h3>${esc(category)}</h3></div></div><div class="service-list panel-body">${items.map(e => {
      const docs = e.doctorIds.map(id => state.doctors.find(d => d.id === id)?.name).filter(Boolean).join(' ou ');
      return `<div class="service-item"><div><h3>${esc(e.name)}</h3><p>${esc(docs)}${e.requiresMedicalOrder ? ' • Requer pedido médico' : ''}</p></div><button class="small-button primary" data-action="book-exam" data-exam-id="${e.id}">Solicitar</button></div>`;
    }).join('')}</div></section>`).join('')}
  </div>`;
}

function openExamModal(examId) {
  const exam = state.exams.find(e => e.id === examId);
  if (!exam) return;
  const doctors = exam.doctorIds.map(id => state.doctors.find(d => d.id === id)).filter(Boolean);
  const min = new Date().toISOString().slice(0,10);
  openModal('Solicitar exame', `
    <form id="exam-booking-form" class="page-stack" data-exam-id="${exam.id}">
      <div class="info-box"><span>Exame</span><strong>${esc(exam.name)}</strong><div class="doctor-meta" style="margin-top:5px">${esc(exam.category)}</div></div>
      ${exam.requiresMedicalOrder ? `<div class="alert-box">Este exame necessita de solicitação médica. No protótipo, marque a confirmação abaixo apenas para simular que existe um pedido válido no prontuário.</div><label class="service-item"><span>Confirmo que há solicitação médica válida</span><input id="medical-order-confirmed" type="checkbox" style="width:auto;min-height:auto" required /></label>` : ''}
      <div class="field"><label>Profissional relacionado</label><select id="exam-doctor">${doctors.map(d => `<option value="${d.id}">${esc(d.name)} — ${esc(d.specialty)}</option>`).join('')}</select></div>
      <div class="form-grid two-cols"><div class="field"><label>Data</label><input id="exam-date" type="date" min="${min}" required /></div><div class="field"><label>Horário</label><select id="exam-time"><option>08:00</option><option>09:30</option><option>11:00</option><option>14:00</option><option>15:30</option></select></div></div>
      ${billingFieldsHtml('exam')}
      <div class="form-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancelar</button><button type="submit" class="primary-button">Solicitar exame</button></div>
    </form>`, 'Exames HMV');
}

async function renderPatientSurgeries() {
  setPageTitle('Cirurgias', 'Portal do Paciente');
  const surgeons = state.doctors.filter(d => d.type === 'cirurgia');
  $('#main-content').innerHTML = `<div class="page-stack">
    <div class="page-head"><div><h2>Avaliação cirúrgica</h2><p>Solicite avaliação. O envio não confirma automaticamente uma cirurgia.</p></div></div>
    <div class="info-note">Fluxo: solicitação do paciente → avaliação médica → indicação → disponibilidade hospitalar → confirmação do agendamento.</div>
    <div class="doctor-grid">${surgeons.map(d => doctorCard(d).replace('data-action="book-doctor"','data-action="request-surgery"').replace('Ver horários','Solicitar avaliação')).join('')}</div>
  </div>`;
}

function openSurgeryModal(doctorId) {
  const doctor = state.doctors.find(d => d.id === doctorId);
  if (!doctor) return;
  const min = new Date().toISOString().slice(0,10);
  openModal('Solicitar avaliação cirúrgica', `
    <form id="surgery-request-form" class="page-stack" data-doctor-id="${doctor.id}">
      <div class="info-box"><span>Cirurgião</span><strong>${esc(doctor.name)}</strong><div class="doctor-meta" style="margin-top:5px">${esc(doctor.specialty)} • ${esc(doctor.crm)}</div></div>
      <div class="field"><label>Motivo da solicitação</label><textarea id="surgery-reason" required placeholder="Descreva o motivo para avaliação"></textarea></div>
      <div class="field"><label>Data preferencial para avaliação</label><input id="surgery-date" type="date" min="${min}" required /></div>
      ${billingFieldsHtml('surgery')}
      <div class="alert-box">A data é apenas uma preferência para avaliação. Cirurgia somente pode ser confirmada após validação clínica e administrativa.</div>
      <div class="form-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancelar</button><button type="submit" class="primary-button">Enviar solicitação</button></div>
    </form>`, doctor.specialty);
}

async function renderDonations() {
  setPageTitle('Doação de sangue', 'Portal do Paciente');
  const min = new Date().toISOString().slice(0,10);
  const donations = await api('/api/blood-donations');
  state.donations = donations;
  $('#main-content').innerHTML = `<div class="page-stack">
    <div class="page-head"><div><h2>Agendar doação de sangue</h2><p>Escolha uma data e horário para comparecer à unidade.</p></div></div>
    <div class="dashboard-grid">
      <section class="panel"><div class="panel-head"><h3>Novo agendamento</h3></div><div class="panel-body">
        <form id="donation-form" class="page-stack">
          <div class="form-grid two-cols"><div class="field"><label>Data</label><input id="donation-date" type="date" min="${min}" required /></div><div class="field"><label>Horário</label><select id="donation-time"><option>08:00</option><option>09:00</option><option>10:00</option><option>14:00</option><option>15:00</option><option>16:00</option></select></div></div>
          <div class="field"><label>Unidade</label><select id="donation-unit"><option value="HMV">HMV — Hospital Municipal de Valparaíso de Goiás</option></select></div>
          <div class="alert-box">O agendamento não garante aptidão para doação. A decisão final depende da triagem realizada pelo serviço de hemoterapia.</div>
          <button class="primary-button" type="submit">Agendar doação</button>
        </form>
      </div></section>
      <section class="panel"><div class="panel-head"><h3>Meus agendamentos</h3></div><div class="panel-body">${donations.length ? donations.map(d => `<div class="service-item"><div><h3>${formatDate(d.date)} às ${esc(d.time)}</h3><p>${esc(d.unit)}</p></div><span class="badge green">${statusLabel(d.status)}</span></div>`).join('') : emptyState('Nenhuma doação agendada','Seus agendamentos aparecerão aqui.')}</div></section>
    </div>
  </div>`;
}

async function renderBookings() {
  setPageTitle('Meus agendamentos', 'Portal do Paciente');
  await loadPatientData();
  const rows = [];
  state.appointments.forEach(a => rows.push({ type:'Consulta', service:a.doctor?.specialty || 'Consulta', professional:a.doctor?.name || '—', date:a.date, time:a.time, status:a.status }));
  state.examBookings.forEach(x => rows.push({ type:'Exame', service:x.exam?.name || 'Exame', professional:x.doctor?.name || '—', date:x.date, time:x.time, status:x.status }));
  state.surgeries.forEach(x => rows.push({ type:'Cirurgia', service:x.specialty, professional:x.doctor?.name || '—', date:x.preferredDate, time:'—', status:x.status }));
  state.donations.forEach(x => rows.push({ type:'Doação', service:'Doação de sangue', professional:x.unit, date:x.date, time:x.time, status:x.status }));
  rows.sort((a,b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Meus agendamentos</h2><p>Consultas, exames, avaliações cirúrgicas e doações em um só lugar.</p></div></div><section class="panel">${rows.length ? `<div class="table-wrap"><table><thead><tr><th>Tipo</th><th>Serviço</th><th>Profissional/Unidade</th><th>Data</th><th>Horário</th><th>Status</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(r.type)}</td><td>${esc(r.service)}</td><td>${esc(r.professional)}</td><td>${formatDate(r.date)}</td><td>${esc(r.time || '—')}</td><td><span class="badge ${badgeForStatus(r.status)}">${esc(statusLabel(r.status))}</span></td></tr>`).join('')}</tbody></table></div>` : emptyState('Nenhum agendamento','Use os menus Consultas, Exames, Cirurgias ou Doação de sangue para começar.')}</section></div>`;
}

async function renderResults() {
  setPageTitle('Resultados', 'Portal do Paciente');
  const items = await api('/api/results');
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Resultados de exames</h2><p>Documentos liberados para seu acesso.</p></div></div><section class="panel">${items.length ? items.map(r => `<div class="service-item"><div><h3>${esc(r.title || 'Resultado')}</h3><p>${formatDateTime(r.createdAt)}</p></div><button class="small-button" disabled>Visualizar</button></div>`).join('') : emptyState('Nenhum resultado disponível','Quando um resultado for liberado, ele aparecerá aqui.')}</section></div>`;
}

async function renderPatientPrescriptions() {
  setPageTitle('Receitas', 'Portal do Paciente');
  const items = await api('/api/prescriptions');
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Receitas e prescrições</h2><p>Consulte prescrições disponibilizadas no seu prontuário.</p></div></div><section class="panel">${items.length ? `<div class="panel-body service-list">${items.map(rx => `<div class="service-item"><div><h3>Prescrição de ${formatDateTime(rx.createdAt)}</h3><p>${rx.items.map(i => `${esc(i.medication)} — ${esc(i.dose)}`).join(' • ')}</p></div><span class="badge blue">Disponível</span></div>`).join('')}</div>` : emptyState('Nenhuma receita disponível','Suas prescrições médicas aparecerão aqui.')}</section></div>`;
}

async function renderProfile() {
  setPageTitle('Meu perfil', state.role === 'patient' ? 'Portal do Paciente' : 'Área profissional');
  const u = state.user;
  if (state.role === 'patient') {
    const a = u.address || {};
    $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Dados cadastrais</h2><p>Informações registradas no SENTINELA.</p></div></div><div class="profile-grid">
      ${infoBox('Nome completo',u.name)}${infoBox('CPF',maskCpf(u.cpf))}${infoBox('E-mail',u.email)}${infoBox('Telefone',u.phone)}${infoBox('Data de nascimento',formatDate(u.birthDate))}${infoBox('Gênero',genderLabel(u.gender))}${infoBox('CEP',a.cep)}${infoBox('Endereço',`${a.street || ''}, ${a.number || ''} — ${a.neighborhood || ''}`)}${infoBox('Cidade/UF',`${a.city || ''}/${a.state || ''}`)}${infoBox('Complemento',a.complement || 'Não informado')}
    </div></div>`;
  } else {
    $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Perfil profissional</h2><p>Informações da conta de demonstração.</p></div></div><div class="profile-grid">${infoBox('Nome',u.displayName)}${infoBox('Usuário',u.username)}${infoBox('Perfil',roleLabel(u.role))}${infoBox('Status',u.active === false ? 'Inativo' : 'Ativo')}</div></div>`;
  }
}

function infoBox(label, value) { return `<div class="info-box"><span>${esc(label)}</span><strong>${esc(value || '—')}</strong></div>`; }
function maskCpf(cpf='') { const x = String(cpf).replace(/\D/g,''); return x.length===11 ? `${x.slice(0,3)}.${x.slice(3,6)}.${x.slice(6,9)}-${x.slice(9)}` : cpf; }
function genderLabel(v) { return ({masculino:'Masculino',feminino:'Feminino',nao_informado:'Prefiro não informar'})[v] || v; }

async function loadProfessionalBase() {
  const promises = [api('/api/admin/stats')];
  if (['medico','triagem','atendimento','admin'].includes(state.role)) promises.push(api('/api/patients'));
  if (['medico','triagem','atendimento','admin'].includes(state.role)) promises.push(api('/api/queue'));
  const res = await Promise.all(promises);
  state.stats = res[0];
  state.patients = res[1] || [];
  state.queue = res[2] || [];
}

async function renderDoctorHome() {
  setPageTitle('Visão geral', 'Área médica');
  await loadProfessionalBase();
  state.appointments = await api('/api/appointments');
  const today = new Date().toISOString().slice(0,10);
  const myAppointments = state.user.doctorId ? state.appointments.filter(a => a.doctorId === state.user.doctorId) : state.appointments;
  const todayItems = myAppointments.filter(a => a.date === today && a.status !== 'cancelada').sort((a,b)=>a.time.localeCompare(b.time));
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Visão geral médica</h2><p>Acompanhe consultas, fila e informações operacionais.</p></div></div>
    <div class="stats-grid">${statCard('Consultas hoje',state.user.doctorId ? todayItems.length : state.stats.appointmentsToday,'calendar')}${statCard('Pacientes aguardando',state.stats.waiting,'users')}${statCard('Em triagem',state.stats.inTriage,'activity')}${statCard('Em consulta',state.stats.inConsultation,'stethoscope')}</div>
    <section class="panel"><div class="panel-head"><div><h3>Agenda de hoje</h3><p>Pacientes com consulta marcada para hoje.</p></div><button class="small-button primary" data-view-jump="doctor-agenda">Ver agenda completa</button></div>${todayItems.length ? appointmentTable(todayItems,true) : emptyState('Sem consultas para hoje','A agenda de hoje não possui consultas cadastradas.')}</section>
    <div class="info-note">O módulo de apoio à prescrição deste protótipo gera apenas alertas simples de preenchimento. Ele não substitui avaliação clínica, referências farmacológicas oficiais nem a decisão do profissional responsável.</div>
  </div>`;
}

function appointmentTable(items, professional = false) {
  return `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Horário</th><th>Paciente</th><th>Médico</th><th>Tipo</th><th>Status</th>${professional ? '<th>Ações</th>' : ''}</tr></thead><tbody>${items.map(a => `<tr><td>${formatDate(a.date)}</td><td>${esc(a.time)}</td><td>${esc(a.patient?.name || '—')}</td><td>${esc(a.doctor?.name || '—')}<br><small>${esc(a.doctor?.specialty || '')}</small></td><td>${esc(a.billing?.type === 'convenio' ? 'Convênio' : 'Particular')}</td><td><span class="badge ${badgeForStatus(a.status)}">${esc(statusLabel(a.status))}</span></td>${professional ? `<td><div class="table-actions"><button class="small-button" data-action="appointment-status" data-id="${a.id}" data-status="em_consulta">Iniciar</button><button class="small-button success" data-action="appointment-status" data-id="${a.id}" data-status="concluida">Concluir</button></div></td>` : ''}</tr>`).join('')}</tbody></table></div>`;
}

async function renderDoctorAgenda() {
  setPageTitle('Agenda de consultas', 'Área médica');
  state.appointments = await api('/api/appointments');
  const visible = state.user.doctorId ? state.appointments.filter(a => a.doctorId === state.user.doctorId) : state.appointments;
  const sorted = [...visible].sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Agenda de consultas</h2><p>${state.user.doctorId ? `Consultas de ${esc(state.user.displayName)} • ${esc(state.user.specialty)}` : 'Consultas cadastradas para os profissionais do protótipo.'}</p></div></div><section class="panel">${sorted.length ? appointmentTable(sorted,true) : emptyState('Agenda vazia','Ainda não há consultas cadastradas.')}</section></div>`;
}

async function renderPatients() {
  const canManage = ['admin','atendimento'].includes(state.role);
  setPageTitle('Pacientes', state.role === 'medico' ? 'Área médica' : state.role === 'admin' ? 'Administração' : 'Atendimento');
  state.patients = await api('/api/patients');
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Pacientes cadastrados</h2><p>${canManage ? 'Cadastre ou atualize os dados dos pacientes atendidos no HMV.' : 'Consulte dados básicos e histórico operacional do protótipo.'}</p></div>${canManage ? `<button class="primary-button" data-action="new-patient">${icon('plus')} Cadastrar paciente</button>` : ''}</div><div class="filters"><input id="patient-search" placeholder="Buscar paciente, CPF ou e-mail" /></div><section class="panel"><div class="table-wrap"><table><thead><tr><th>Paciente</th><th>CPF</th><th>Contato</th><th>Nascimento</th><th>Ações</th></tr></thead><tbody id="patients-table-body">${state.patients.map(patientRow).join('')}</tbody></table></div>${!state.patients.length ? emptyState('Nenhum paciente cadastrado','Cadastros de pacientes aparecerão aqui.') : ''}</section></div>`;
}
function patientRow(p) { return `<tr data-patient-search="${esc((p.name+' '+p.cpf+' '+(p.email||'')).toLowerCase())}"><td><strong>${esc(p.name)}</strong><br><small>${esc(p.email || 'E-mail não informado')}</small></td><td>${esc(maskCpf(p.cpf))}</td><td>${esc(p.phone || '—')}</td><td>${formatDate(p.birthDate)}</td><td><div class="table-actions"><button class="small-button" data-action="view-patient" data-id="${p.id}">Ver dados</button>${['admin','atendimento'].includes(state.role) ? `<button class="small-button" data-action="edit-patient" data-id="${p.id}">Editar</button>` : ''}${state.role === 'medico' || state.role === 'admin' ? `<button class="small-button primary" data-action="new-medical-record" data-id="${p.id}">Registrar consulta</button>` : ''}</div></td></tr>`; }

function openPatientModal(patientId = '') {
  if (!['admin','atendimento'].includes(state.role)) return;
  const patient = state.patients.find(p => p.id === patientId) || {};
  const address = patient.address || {};
  const field = (name, label, value = '', attrs = '') => `<div class="field"><label for="patient-${name}">${label}</label><input id="patient-${name}" name="${name}" value="${esc(value)}" ${attrs} /></div>`;
  openModal(patientId ? 'Editar paciente' : 'Cadastrar paciente', `
    <form id="staff-patient-form" class="page-stack" data-patient-id="${esc(patientId)}">
      <p class="info-note">Cadastro interno realizado por Atendimento ou Admin. O paciente não recebe usuário nem senha.</p>
      <div class="form-grid two-cols">
        <div class="span-2">${field('name', 'Nome completo *', patient.name, 'required maxlength="150" autocomplete="name"')}</div>
        ${field('cpf', 'CPF *', cpfMask(patient.cpf || ''), 'required inputmode="numeric" maxlength="14" placeholder="000.000.000-00"')}
        ${field('birthDate', 'Data de nascimento', patient.birthDate, 'type="date"')}
        <div class="field"><label for="patient-gender">Gênero</label><select id="patient-gender" name="gender"><option value="nao_informado" ${!patient.gender || patient.gender === 'nao_informado' ? 'selected' : ''}>Prefiro não informar</option><option value="masculino" ${patient.gender === 'masculino' ? 'selected' : ''}>Masculino</option><option value="feminino" ${patient.gender === 'feminino' ? 'selected' : ''}>Feminino</option></select></div>
        ${field('phone', 'Telefone', patient.phone, 'inputmode="tel" maxlength="16"')}
        <div class="span-2">${field('email', 'E-mail (opcional)', patient.email, 'type="email" maxlength="180"')}</div>
      </div>
      <div class="section-divider"></div>
      <h3>Endereço</h3><p>O CEP pode preencher os dados automaticamente.</p>
      <div class="form-grid two-cols">
        <div class="field"><label for="patient-cep">CEP</label><input id="patient-cep" name="cep" value="${esc(cepMask(address.cep || ''))}" maxlength="9" inputmode="numeric" placeholder="00000-000" /><small id="patient-cep-status"></small></div>
        ${field('state', 'Estado (UF)', address.state, 'maxlength="2"')}
        <div class="span-2">${field('street', 'Logradouro', address.street, 'maxlength="160"')}</div>
        ${field('number', 'Número', address.number, 'maxlength="30"')}
        ${field('neighborhood', 'Bairro', address.neighborhood, 'maxlength="100"')}
        ${field('city', 'Cidade', address.city, 'maxlength="100"')}
        ${field('complement', 'Complemento', address.complement, 'maxlength="160"')}
      </div>
      <div class="form-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancelar</button><button class="primary-button" type="submit">${patientId ? 'Salvar alterações' : 'Cadastrar paciente'}</button></div>
    </form>`, 'Cadastro hospitalar');
}

async function lookupPatientCep() {
  const cep = ($('#patient-cep')?.value || '').replace(/\D/g,'');
  if (cep.length !== 8) return;
  const status = $('#patient-cep-status');
  status.textContent = 'Buscando endereço...';
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) throw new Error('CEP não encontrado.');
    if (!$('#patient-cep') || $('#patient-cep').value.replace(/\D/g,'') !== cep) return;
    $('#patient-street').value = data.logradouro || '';
    $('#patient-neighborhood').value = data.bairro || '';
    $('#patient-city').value = data.localidade || '';
    $('#patient-state').value = data.uf || '';
    status.textContent = 'Endereço encontrado.';
  } catch {
    if (status.isConnected) status.textContent = 'Não foi possível consultar o CEP. Preencha manualmente.';
  }
}

async function renderDoctorTriage() {
  setPageTitle('Triagem', 'Área médica');
  state.triage = await api('/api/triage');
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Registros de triagem</h2><p>Dados clínicos registrados pela equipe de triagem.</p></div></div><section class="panel">${triageTable(state.triage)}</section></div>`;
}

function triageTable(items) {
  if (!items.length) return emptyState('Nenhuma triagem registrada','Registros de triagem aparecerão aqui.');
  return `<div class="table-wrap"><table><thead><tr><th>Paciente</th><th>Pressão</th><th>FC</th><th>Temp.</th><th>Sat.</th><th>Prioridade</th><th>Data</th></tr></thead><tbody>${items.map(t => `<tr><td>${esc(t.patient?.name || '—')}</td><td>${esc(t.bloodPressure || '—')}</td><td>${esc(t.heartRate || '—')}</td><td>${esc(t.temperature || '—')}</td><td>${esc(t.saturation || '—')}</td><td><span class="badge ${badgeForStatus(t.priority)}">${esc(t.priority)}</span></td><td>${formatDateTime(t.createdAt)}</td></tr>`).join('')}</tbody></table></div>`;
}

async function renderDoctorPrescriptions() {
  setPageTitle('Prescrições', 'Área médica');
  const [patients, prescriptions] = await Promise.all([api('/api/patients'), api('/api/prescriptions')]);
  state.patients = patients; state.prescriptions = prescriptions;
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Prescrições</h2><p>Registre uma prescrição e revise os alertas do protótipo.</p></div><button class="primary-button" data-action="new-prescription">${icon('plus')} Nova prescrição</button></div><div class="alert-box">O verificador desta demonstração não valida dose terapêutica, interação farmacológica real ou adequação ao paciente. Para uso real, seria necessária uma base clínica validada e governança profissional.</div><section class="panel">${prescriptions.length ? `<div class="panel-body service-list">${prescriptions.map(rx => `<div class="service-item"><div><h3>${esc(rx.patient?.name || 'Paciente')}</h3><p>${formatDateTime(rx.createdAt)} • ${rx.items.map(i => `${esc(i.medication)} ${esc(i.dose)}`).join(' | ')}</p></div><span class="badge ${rx.alerts?.length ? 'yellow':'green'}">${rx.alerts?.length ? 'Revisar alerta':'Registrada'}</span></div>`).join('')}</div>` : emptyState('Nenhuma prescrição registrada','Use “Nova prescrição” para criar a primeira.')}</section></div>`;
}

function openMedicalRecordModal(patientId) {
  const patient = state.patients.find(p => p.id === patientId);
  if (!patient) return;
  openModal('Registrar consulta médica', `<form id="medical-record-form" class="page-stack" data-patient-id="${patientId}">
    <div class="info-box"><span>Paciente</span><strong>${esc(patient.name)}</strong><div class="doctor-meta" style="margin-top:5px">${esc(maskCpf(patient.cpf))}</div></div>
    <div class="field"><label>Queixa principal</label><textarea id="record-complaint" required></textarea></div>
    <div class="field"><label>História clínica</label><textarea id="record-history"></textarea></div>
    <div class="field"><label>Exame físico</label><textarea id="record-physical"></textarea></div>
    <div class="form-grid two-cols"><div class="field"><label>Hipótese diagnóstica</label><textarea id="record-hypothesis"></textarea></div><div class="field"><label>Diagnóstico registrado</label><textarea id="record-diagnosis"></textarea></div></div>
    <div class="field"><label>Conduta</label><textarea id="record-conduct"></textarea></div>
    <div class="field"><label>Recomendações</label><textarea id="record-recommendations"></textarea></div>
    <div class="field"><label>Plano de retorno</label><input id="record-return" placeholder="Ex.: retorno em 30 dias" /></div>
    <div class="info-note">Este prontuário é demonstrativo e não substitui documentação clínica oficial nem validação institucional.</div>
    <div class="form-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancelar</button><button type="submit" class="primary-button">Salvar consulta</button></div>
  </form>`, 'Prontuário médico');
}

function openPrescriptionModal() {
  openModal('Nova prescrição', `<form id="prescription-form" class="page-stack">
    <div class="field"><label>Paciente</label><select id="rx-patient" required><option value="">Selecione</option>${state.patients.map(p => `<option value="${p.id}">${esc(p.name)} — ${esc(maskCpf(p.cpf))}</option>`).join('')}</select></div>
    <div class="form-grid two-cols"><div class="field"><label>Medicamento</label><input id="rx-medication" required /></div><div class="field"><label>Dose / apresentação</label><input id="rx-dose" required placeholder="Ex.: 500 mg" /></div><div class="field"><label>Via</label><input id="rx-route" placeholder="Ex.: oral" /></div><div class="field"><label>Frequência</label><input id="rx-frequency" placeholder="Ex.: 8/8 h" /></div><div class="field"><label>Duração</label><input id="rx-duration" placeholder="Ex.: 5 dias" /></div></div>
    <div class="field"><label>Observações</label><textarea id="rx-notes"></textarea></div>
    <div class="form-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancelar</button><button type="submit" class="primary-button">Registrar prescrição</button></div>
  </form>`, 'Apoio à prescrição');
}

async function renderDoctorExams() {
  setPageTitle('Exames', 'Área médica');
  state.examBookings = await api('/api/exam-bookings');
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Exames solicitados/agendados</h2><p>Acompanhe solicitações relacionadas aos pacientes.</p></div></div><section class="panel">${state.examBookings.length ? `<div class="table-wrap"><table><thead><tr><th>Paciente</th><th>Exame</th><th>Data</th><th>Profissional</th><th>Status</th></tr></thead><tbody>${state.examBookings.map(x => `<tr><td>${esc(x.patient?.name || '—')}</td><td>${esc(x.exam?.name || '—')}</td><td>${formatDate(x.date)} ${esc(x.time || '')}</td><td>${esc(x.doctor?.name || '—')}</td><td><span class="badge ${badgeForStatus(x.status)}">${statusLabel(x.status)}</span></td></tr>`).join('')}</tbody></table></div>` : emptyState('Nenhum exame cadastrado','Solicitações de exames aparecerão aqui.')}</section></div>`;
}

async function renderDoctorSurgeries() {
  setPageTitle('Cirurgias', 'Área médica');
  state.surgeries = await api('/api/surgery-requests');
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Avaliações cirúrgicas</h2><p>Analise solicitações e atualize o fluxo administrativo/clínico.</p></div></div><section class="panel">${state.surgeries.length ? `<div class="table-wrap"><table><thead><tr><th>Paciente</th><th>Especialidade</th><th>Cirurgião</th><th>Data preferencial</th><th>Status</th><th>Ações</th></tr></thead><tbody>${state.surgeries.map(s => `<tr><td>${esc(s.patient?.name || '—')}</td><td>${esc(s.specialty)}</td><td>${esc(s.doctor?.name || '—')}</td><td>${formatDate(s.preferredDate)}</td><td><span class="badge ${badgeForStatus(s.status)}">${statusLabel(s.status)}</span></td><td><select class="small-button" data-action="surgery-status" data-id="${s.id}"><option value="">Alterar status</option><option value="aguardando_avaliacao">Aguardando avaliação</option><option value="exames_pre_operatorios">Exames pré-operatórios</option><option value="autorizada">Autorizada</option><option value="agendamento_hospitalar">Agendamento hospitalar</option><option value="agendada">Agendada</option><option value="concluida">Concluída</option><option value="cancelada">Cancelada</option></select></td></tr>`).join('')}</tbody></table></div>` : emptyState('Nenhuma solicitação','Solicitações cirúrgicas aparecerão aqui.')}</section></div>`;
}

async function renderTriageHome() {
  setPageTitle('Fila de triagem', 'Área de Triagem');
  await loadProfessionalBase();
  const waiting = state.queue.filter(q => ['aguardando_triagem','em_triagem'].includes(q.stage));
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Fila de triagem</h2><p>Pacientes encaminhados para classificação e registro inicial.</p></div><button class="primary-button" data-view-jump="triage-new">Registrar triagem</button></div><section class="panel">${queueTable(waiting,'triagem')}</section></div>`;
}

function queueTable(items, mode = 'generic') {
  if (!items.length) return emptyState('Fila vazia','Não há pacientes nesta etapa.');
  return `<div class="table-wrap"><table><thead><tr><th>Código</th><th>Paciente</th><th>Tipo</th><th>Prioridade</th><th>Etapa</th><th>Destino</th><th>Chegada</th>${mode !== 'generic' ? '<th>Ações</th>' : ''}</tr></thead><tbody>${items.map(q => `<tr><td><strong>${esc(q.code)}</strong></td><td>${esc(q.patient?.name || '—')}</td><td>${esc(q.billing?.type === 'convenio' ? 'Convênio' : 'Particular')}</td><td><span class="badge ${badgeForStatus(q.priority)}">${esc(q.priority)}</span></td><td>${esc(statusLabel(q.stage))}</td><td>${esc(q.destination || '—')}</td><td>${formatDateTime(q.createdAt)}</td>${mode !== 'generic' ? `<td><div class="table-actions">${mode==='triagem' ? `<button class="small-button primary" data-action="triage-patient" data-id="${q.patientId}" data-queue-id="${q.id}">Triar</button>` : `<button class="small-button primary" data-action="call-patient" data-id="${q.patientId}" data-destination="${esc(q.destination || 'Consultório')}">Chamar</button>`}</div></td>` : ''}</tr>`).join('')}</tbody></table></div>`;
}

async function renderTriageNew() {
  setPageTitle('Registrar triagem', 'Área de Triagem');
  state.patients = await api('/api/patients');
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Nova triagem</h2><p>Registre sinais, sintomas e classificação de risco.</p></div></div><section class="panel"><div class="panel-body">${triageFormHtml()}</div></section></div>`;
}

function triageFormHtml(selectedPatientId = '') {
  return `<form id="triage-form" class="page-stack">
    <div class="field"><label>Paciente</label><select id="triage-patient" required><option value="">Selecione</option>${state.patients.map(p => `<option value="${p.id}" ${p.id===selectedPatientId?'selected':''}>${esc(p.name)} — ${esc(maskCpf(p.cpf))}</option>`).join('')}</select></div>
    <div class="form-grid two-cols"><div class="field"><label>Pressão arterial</label><input id="triage-bp" placeholder="Ex.: 120/80" /></div><div class="field"><label>Frequência cardíaca</label><input id="triage-hr" placeholder="bpm" /></div><div class="field"><label>Frequência respiratória</label><input id="triage-rr" /></div><div class="field"><label>Temperatura</label><input id="triage-temp" placeholder="°C" /></div><div class="field"><label>Saturação</label><input id="triage-sat" placeholder="%" /></div><div class="field"><label>Peso</label><input id="triage-weight" placeholder="kg" /></div><div class="field"><label>Altura</label><input id="triage-height" placeholder="cm" /></div><div class="field"><label>Alergias</label><input id="triage-allergies" /></div></div>
    <div class="field"><label>Queixa principal</label><textarea id="triage-complaint"></textarea></div>
    <div class="field"><label>Sintomas</label><textarea id="triage-symptoms"></textarea></div>
    <div class="field"><label>Observações</label><textarea id="triage-observations"></textarea></div>
    <div><label style="display:block;font-weight:750;font-size:.86rem;margin-bottom:8px">Classificação de risco</label><div class="priority-grid">
      ${priorityRadio('vermelho','Emergência','red')}${priorityRadio('amarelo','Atenção','yellow')}${priorityRadio('verde','Normal','green',true)}${priorityRadio('azul','Consulta','blue')}
    </div></div>
    <button class="primary-button" type="submit">Salvar triagem</button>
  </form>`;
}
function priorityRadio(value,label,cls,checked=false){return `<label class="priority-option ${cls}"><span><input type="radio" name="priority" value="${value}" ${checked?'checked':''}> <strong>${label}</strong></span><small>${value[0].toUpperCase()+value.slice(1)}</small></label>`;}

async function renderTriageHistory() {
  setPageTitle('Histórico de triagem', 'Área de Triagem');
  state.triage = await api('/api/triage');
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Histórico</h2><p>Triagens registradas no sistema.</p></div></div><section class="panel">${triageTable(state.triage)}</section></div>`;
}

async function renderServiceHome() {
  setPageTitle('Fila de pacientes', 'Atendimento');
  await loadProfessionalBase();
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Fila hospitalar</h2><p>Gerencie fluxo, destino e chamadas.</p></div><div class="page-actions"><button class="secondary-button" data-view-jump="service-calls">Chamada / TV</button><button class="primary-button" data-view-jump="service-new">Novo atendimento</button></div></div><div class="stats-grid">${statCard('Pacientes cadastrados',state.stats.patients,'users')}${statCard('Aguardando',state.stats.waiting,'clock')}${statCard('Em triagem',state.stats.inTriage,'activity')}${statCard('Em consulta',state.stats.inConsultation,'stethoscope')}</div><section class="panel">${queueTable(state.queue,'service')}</section></div>`;
}

async function renderServiceNew() {
  setPageTitle('Novo atendimento', 'Atendimento');
  state.patients = await api('/api/patients');
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Adicionar paciente à fila</h2><p>Selecione um paciente cadastrado e defina a etapa inicial.</p></div><button class="secondary-button" data-action="new-patient">${icon('plus')} Novo paciente</button></div><section class="panel"><div class="panel-body"><form id="queue-form" class="page-stack">
    <div class="field"><label>Paciente</label><select id="queue-patient" required><option value="">Selecione</option>${state.patients.map(p => `<option value="${p.id}">${esc(p.name)} — ${esc(maskCpf(p.cpf))}</option>`).join('')}</select></div>
    <div class="form-grid two-cols"><div class="field"><label>Destino</label><select id="queue-destination"><option>Triagem</option><option>Consultório 01</option><option>Consultório 02</option><option>Pediatria 01</option></select></div><div class="field"><label>Etapa</label><select id="queue-stage"><option value="aguardando_triagem">Aguardando triagem</option><option value="aguardando_medico">Aguardando médico</option></select></div></div>
    <div><label style="display:block;font-weight:750;font-size:.86rem;margin-bottom:8px">Classificação operacional inicial</label><div class="priority-grid">${priorityRadio('vermelho','Emergência','red')}${priorityRadio('amarelo','Alerta','yellow')}${priorityRadio('verde','Normal','green',true)}${priorityRadio('azul','Consulta','blue')}</div></div>
    ${billingFieldsHtml('queue')}
    <div class="info-note">A classificação clínica de risco deve ser confirmada por profissional autorizado na triagem. O atendimento organiza o fluxo e não substitui a avaliação clínica.</div>
    <button class="primary-button" type="submit">Adicionar à fila</button>
  </form></div></section></div>`;
}

async function renderServiceCalls() {
  setPageTitle('Chamada / TV', 'Atendimento');
  state.queue = await api('/api/queue');
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Chamar paciente</h2><p>Envie uma chamada para a TV e atualize o destino.</p></div><a class="primary-button" href="/tv" target="_blank" style="text-decoration:none">${icon('monitor')} Abrir TV</a></div><section class="panel">${queueTable(state.queue.filter(q => q.stage !== 'finalizado'),'service')}</section></div>`;
}


function billingFieldsHtml(prefix) {
  return `<section class="subpanel">
    <div class="panel-head"><div><h3>Tipo de atendimento</h3><p>Defina como este atendimento será registrado.</p></div></div>
    <div class="form-grid two-cols">
      <div class="field"><label>Atendimento</label><select id="${prefix}-attendance-type" data-billing-prefix="${prefix}">
        <option value="particular">Particular</option><option value="convenio">Convênio</option>
      </select></div>
      <div class="field ${prefix}-billing-particular"><label>Status do pagamento</label><select id="${prefix}-payment-status">
        <option value="aguardando_pagamento">Aguardando pagamento</option><option value="pago">Pago</option><option value="pagamento_parcial">Pagamento parcial</option><option value="cancelado">Cancelado</option>
      </select></div>
    </div>
    <div class="${prefix}-billing-particular form-grid two-cols">
      <div class="field"><label>Forma de pagamento</label><select id="${prefix}-payment-method"><option value="">Não informado</option><option>Pix</option><option>Dinheiro</option><option>Cartão de crédito</option><option>Cartão de débito</option><option>Outro</option></select></div>
      <div class="field"><label>Valor registrado</label><input id="${prefix}-amount" type="number" min="0" step="0.01" placeholder="0,00" /></div>
    </div>
    <div class="${prefix}-billing-convenio hidden page-stack">
      <div class="form-grid two-cols">
        <div class="field"><label>Convênio</label><input id="${prefix}-insurance-provider" placeholder="Nome do convênio" /></div>
        <div class="field"><label>Plano</label><input id="${prefix}-plan-name" placeholder="Nome do plano" /></div>
      </div>
      <div class="form-grid two-cols">
        <div class="field"><label>Carteirinha</label><input id="${prefix}-card-number" placeholder="Número da carteirinha" /></div>
        <div class="field"><label>Titular</label><input id="${prefix}-holder-name" placeholder="Nome do titular" /></div>
      </div>
      <div class="form-grid two-cols">
        <div class="field"><label>Nº da autorização</label><input id="${prefix}-authorization-number" placeholder="Opcional" /></div>
        <div class="field"><label>Status da autorização</label><select id="${prefix}-authorization-status"><option value="aguardando_autorizacao">Aguardando autorização</option><option value="autorizado">Autorizado</option><option value="parcialmente_autorizado">Parcialmente autorizado</option><option value="negado">Negado</option></select></div>
      </div>
    </div>
  </section>`;
}

function billingPayload(prefix) {
  const type = $(`#${prefix}-attendance-type`)?.value || 'particular';
  if (type === 'convenio') return {
    attendanceType:type,
    insuranceProvider:$(`#${prefix}-insurance-provider`)?.value || '',
    planName:$(`#${prefix}-plan-name`)?.value || '',
    cardNumber:$(`#${prefix}-card-number`)?.value || '',
    holderName:$(`#${prefix}-holder-name`)?.value || '',
    authorizationNumber:$(`#${prefix}-authorization-number`)?.value || '',
    authorizationStatus:$(`#${prefix}-authorization-status`)?.value || 'aguardando_autorizacao'
  };
  return {
    attendanceType:type,
    paymentStatus:$(`#${prefix}-payment-status`)?.value || 'aguardando_pagamento',
    paymentMethod:$(`#${prefix}-payment-method`)?.value || '',
    amount:$(`#${prefix}-amount`)?.value || 0
  };
}

function toggleBillingFields(prefix) {
  const type = $(`#${prefix}-attendance-type`)?.value || 'particular';
  $$(`.${prefix}-billing-convenio`).forEach(x => x.classList.toggle('hidden', type !== 'convenio'));
  $$(`.${prefix}-billing-particular`).forEach(x => x.classList.toggle('hidden', type === 'convenio'));
}

function inventoryStatus(item) {
  const q = Number(item.quantity || 0), min = Number(item.minStock || 0);
  if (q <= 0) return ['Sem estoque','red'];
  if (q <= min) return ['Estoque baixo','yellow'];
  return ['Normal','green'];
}

async function inventoryBase() {
  const [items,sectors] = await Promise.all([api('/api/inventory/items'), api('/api/inventory/sectors')]);
  let suppliers = [];
  if (['almoxarifado','admin'].includes(state.role)) suppliers = await api('/api/inventory/suppliers');
  return { items,sectors,suppliers };
}

async function renderInventoryHome() {
  setPageTitle('Almoxarifado', state.role === 'admin' ? 'Administração' : 'Almoxarifado HMV');
  const [stats, items, requests] = await Promise.all([
    api('/api/inventory/stats'),
    api('/api/inventory/items'),
    api('/api/inventory/requests')
  ]);
  const attention = items.filter(i => Number(i.quantity || 0) <= Number(i.minStock || 0));
  $('#main-content').innerHTML = `<div class="page-stack">
    <div class="page-head"><div><h2>Visão geral do Almoxarifado</h2><p>Controle de materiais, estoque e solicitações dos setores.</p></div><div class="page-actions"><button class="secondary-button" data-view-jump="inventory-stock">Ver estoque</button><button class="primary-button" data-view-jump="inventory-entry">Registrar entrada</button></div></div>
    <div class="stats-grid">${statCard('Itens cadastrados',stats.totalItems,'clipboard')}${statCard('Estoque baixo',stats.lowStock,'alert')}${statCard('Sem estoque',stats.outOfStock,'alert')}${statCard('Solicitações pendentes',stats.pendingRequests,'file')}${statCard('Entradas hoje',stats.entriesToday,'plus')}${statCard('Saídas hoje',stats.exitsToday,'arrow-left')}</div>
    <section class="panel"><div class="panel-head"><div><h3>Materiais com atenção</h3><p>Itens zerados ou abaixo do estoque mínimo.</p></div></div>${attention.length ? inventoryTable(attention) : emptyState('Estoque em situação normal','Nenhum item está abaixo do estoque mínimo.')}</section>
    <section class="panel"><div class="panel-head"><div><h3>Solicitações recentes</h3><p>Pedidos enviados pelos setores do hospital.</p></div></div>${inventoryRequestTable(requests.slice(0,6), false)}</section>
  </div>`;
}

function inventoryTable(items) {
  if (!items.length) return emptyState('Nenhum material','Cadastre materiais para começar o controle de estoque.');
  return `<div class="table-wrap"><table><thead><tr><th>Código</th><th>Material</th><th>Categoria</th><th>Quantidade</th><th>Mínimo</th><th>Localização</th><th>Status</th></tr></thead><tbody>${items.map(i => {
    const [label,cls]=inventoryStatus(i);
    return `<tr data-inventory-search="${esc((i.code+' '+i.name+' '+i.category+' '+(i.supplier?.name||'')).toLowerCase())}"><td><strong>${esc(i.code)}</strong></td><td>${esc(i.name)}</td><td>${esc(i.category)}</td><td>${esc(i.quantity)} ${esc(i.unit)}</td><td>${esc(i.minStock)}</td><td>${esc(i.location||'—')}</td><td><span class="badge ${cls}">${label}</span></td></tr>`;
  }).join('')}</tbody></table></div>`;
}

async function renderInventoryStock() {
  setPageTitle('Estoque', 'Almoxarifado HMV');
  const {items} = await inventoryBase();
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Estoque</h2><p>Materiais cadastrados e situação atual.</p></div><button class="primary-button" data-action="inventory-new-item">Novo material</button></div><div class="filters"><input id="inventory-search" placeholder="Buscar material, código, categoria ou fornecedor" /></div><section class="panel" id="inventory-table-panel">${inventoryTable(items)}</section></div>`;
}

async function renderInventoryEntry() {
  setPageTitle('Entrada de materiais','Almoxarifado HMV');
  const {items,suppliers}=await inventoryBase();
  $('#main-content').innerHTML=`<div class="page-stack"><div class="page-head"><div><h2>Registrar entrada</h2><p>Adicione materiais recebidos ao estoque e registre lote/validade.</p></div></div><section class="panel"><div class="panel-body"><form id="inventory-entry-form" class="page-stack">
    <div class="field"><label>Material</label><select id="inv-entry-item" required><option value="">Selecione</option>${items.map(i=>`<option value="${i.id}">${esc(i.code)} — ${esc(i.name)} (atual: ${i.quantity})</option>`).join('')}</select></div>
    <div class="form-grid two-cols"><div class="field"><label>Quantidade recebida</label><input id="inv-entry-qty" type="number" min="1" required /></div><div class="field"><label>Fornecedor</label><select id="inv-entry-supplier"><option value="">Não informado</option>${suppliers.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></div></div>
    <div class="form-grid two-cols"><div class="field"><label>Lote</label><input id="inv-entry-lot" /></div><div class="field"><label>Validade</label><input id="inv-entry-expiry" type="date" /></div></div>
    <div class="field"><label>Observações</label><textarea id="inv-entry-notes"></textarea></div>
    <button class="primary-button" type="submit">Registrar entrada</button>
  </form></div></section></div>`;
}

async function renderInventoryExit() {
  setPageTitle('Saída de materiais','Almoxarifado HMV');
  const {items,sectors}=await inventoryBase();
  $('#main-content').innerHTML=`<div class="page-stack"><div class="page-head"><div><h2>Registrar saída</h2><p>Registre a entrega de materiais aos setores.</p></div></div><section class="panel"><div class="panel-body"><form id="inventory-exit-form" class="page-stack">
    <div class="field"><label>Material</label><select id="inv-exit-item" required><option value="">Selecione</option>${items.map(i=>`<option value="${i.id}">${esc(i.code)} — ${esc(i.name)} (disponível: ${i.quantity})</option>`).join('')}</select></div>
    <div class="form-grid two-cols"><div class="field"><label>Quantidade</label><input id="inv-exit-qty" type="number" min="1" required /></div><div class="field"><label>Setor destino</label><select id="inv-exit-sector" required><option value="">Selecione</option>${sectors.map(x=>`<option>${esc(x.name)}</option>`).join('')}</select></div></div>
    <div class="form-grid two-cols"><div class="field"><label>Responsável</label><input id="inv-exit-responsible" required /></div><div class="field"><label>Motivo</label><input id="inv-exit-reason" placeholder="Reposição, uso do setor..." /></div></div>
    <button class="primary-button" type="submit">Registrar saída</button>
  </form></div></section></div>`;
}

function inventoryRequestTable(items, actions=true) {
  if (!items.length) return emptyState('Nenhuma solicitação','As solicitações dos setores aparecerão aqui.');
  return `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Setor</th><th>Material</th><th>Quantidade</th><th>Perfil</th><th>Status</th>${actions?'<th>Ações</th>':''}</tr></thead><tbody>${items.map(r=>`<tr><td>${formatDateTime(r.createdAt)}</td><td>${esc(r.sector||'—')}</td><td>${esc(r.item?.name||'—')}</td><td>${esc(r.quantity)}</td><td>${esc(roleLabel(r.requestedRole))}</td><td><span class="badge ${badgeForStatus(r.status)}">${esc(statusLabel(r.status))}</span></td>${actions?`<td><div class="table-actions">${r.status==='pendente'?`<button class="small-button" data-action="inventory-request-status" data-id="${r.id}" data-status="em_analise">Analisar</button>`:''}${['pendente','em_analise'].includes(r.status)?`<button class="small-button success" data-action="inventory-request-status" data-id="${r.id}" data-status="aprovada">Aprovar</button>`:''}${r.status==='aprovada'?`<button class="small-button primary" data-action="inventory-request-status" data-id="${r.id}" data-status="entregue">Entregar</button>`:''}${!['entregue','recusada'].includes(r.status)?`<button class="small-button danger" data-action="inventory-request-status" data-id="${r.id}" data-status="recusada">Recusar</button>`:''}</div></td>`:''}</tr>`).join('')}</tbody></table></div>`;
}

async function renderInventoryRequests() {
  setPageTitle('Solicitações','Almoxarifado HMV');
  const items=await api('/api/inventory/requests');
  $('#main-content').innerHTML=`<div class="page-stack"><div class="page-head"><div><h2>Solicitações de materiais</h2><p>Analise, aprove e registre a entrega aos setores.</p></div></div><section class="panel">${inventoryRequestTable(items,true)}</section></div>`;
}

async function renderMaterialRequest() {
  setPageTitle('Solicitar material','HMV');
  const [{items,sectors},requests]=await Promise.all([inventoryBase(),api('/api/inventory/requests')]);
  $('#main-content').innerHTML=`<div class="page-stack"><div class="page-head"><div><h2>Solicitar material</h2><p>Envie um pedido ao Almoxarifado. A retirada só ocorre após aprovação e entrega.</p></div></div><section class="panel"><div class="panel-body"><form id="inventory-request-form" class="page-stack">
    <div class="field"><label>Material</label><select id="inv-request-item" required><option value="">Selecione</option>${items.map(i=>`<option value="${i.id}">${esc(i.name)} — disponível: ${i.quantity} ${esc(i.unit)}</option>`).join('')}</select></div>
    <div class="form-grid two-cols"><div class="field"><label>Quantidade</label><input id="inv-request-qty" type="number" min="1" value="1" required /></div><div class="field"><label>Setor</label><select id="inv-request-sector" required><option value="">Selecione</option>${sectors.map(x=>`<option>${esc(x.name)}</option>`).join('')}</select></div></div>
    <div class="field"><label>Motivo</label><textarea id="inv-request-reason" required placeholder="Ex.: reposição da sala de triagem"></textarea></div>
    <button class="primary-button" type="submit">Enviar solicitação</button>
  </form></div></section><section class="panel"><div class="panel-head"><div><h3>Minhas solicitações</h3></div></div>${inventoryRequestTable(requests,false)}</section></div>`;
}

async function renderInventorySuppliers() {
  setPageTitle('Fornecedores','Almoxarifado HMV');
  const suppliers=await api('/api/inventory/suppliers');
  $('#main-content').innerHTML=`<div class="page-stack"><div class="page-head"><div><h2>Fornecedores</h2><p>Cadastre empresas fornecedoras de materiais.</p></div><button class="primary-button" data-action="inventory-new-supplier">Novo fornecedor</button></div><section class="panel">${suppliers.length?`<div class="table-wrap"><table><thead><tr><th>Fornecedor</th><th>CNPJ</th><th>Telefone</th><th>E-mail</th></tr></thead><tbody>${suppliers.map(x=>`<tr><td><strong>${esc(x.name)}</strong></td><td>${esc(x.cnpj||'—')}</td><td>${esc(x.phone||'—')}</td><td>${esc(x.email||'—')}</td></tr>`).join('')}</tbody></table></div>`:emptyState('Nenhum fornecedor','Cadastre o primeiro fornecedor.')}</section></div>`;
}

async function renderInventoryHistory() {
  setPageTitle('Histórico de movimentações','Almoxarifado HMV');
  const items=await api('/api/inventory/movements');
  $('#main-content').innerHTML=`<div class="page-stack"><div class="page-head"><div><h2>Histórico</h2><p>Todas as entradas, saídas, devoluções e ajustes registrados.</p></div></div><section class="panel">${items.length?`<div class="table-wrap"><table><thead><tr><th>Data</th><th>Tipo</th><th>Material</th><th>Quantidade</th><th>Anterior</th><th>Novo</th><th>Destino/Origem</th><th>Motivo</th></tr></thead><tbody>${items.map(x=>`<tr><td>${formatDateTime(x.createdAt)}</td><td>${esc(statusLabel(x.type))}</td><td>${esc(x.item?.name||'—')}</td><td>${esc(x.quantity)}</td><td>${esc(x.previousQuantity)}</td><td>${esc(x.newQuantity)}</td><td>${esc(x.sector||x.supplier?.name||'—')}</td><td>${esc(x.reason||'—')}</td></tr>`).join('')}</tbody></table></div>`:emptyState('Sem movimentações','Entradas e saídas aparecerão aqui.')}</section></div>`;
}

function openInventoryItemModal() {
  api('/api/inventory/suppliers').then(suppliers => openModal('Novo material', `<form id="inventory-item-form" class="page-stack">
    <div class="form-grid two-cols"><div class="field"><label>Nome do material</label><input id="new-inv-name" required /></div><div class="field"><label>Categoria</label><select id="new-inv-category"><option>Material hospitalar</option><option>Equipamentos descartáveis</option><option>Material de limpeza</option><option>Material administrativo</option><option>EPIs</option><option>Rouparia</option><option>Higiene</option><option>Manutenção</option><option>Escritório</option><option>Outros</option></select></div></div>
    <div class="form-grid two-cols"><div class="field"><label>Unidade</label><input id="new-inv-unit" value="unidade" /></div><div class="field"><label>Localização</label><input id="new-inv-location" placeholder="Prateleira A-03" /></div></div>
    <div class="form-grid two-cols"><div class="field"><label>Quantidade inicial</label><input id="new-inv-qty" type="number" min="0" value="0" /></div><div class="field"><label>Estoque mínimo</label><input id="new-inv-min" type="number" min="0" value="0" /></div></div>
    <div class="form-grid two-cols"><div class="field"><label>Estoque máximo</label><input id="new-inv-max" type="number" min="0" value="0" /></div><div class="field"><label>Fornecedor</label><select id="new-inv-supplier"><option value="">Não informado</option>${suppliers.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></div></div>
    <div class="form-grid two-cols"><div class="field"><label>Lote inicial</label><input id="new-inv-lot" /></div><div class="field"><label>Validade</label><input id="new-inv-expiry" type="date" /></div></div>
    <div class="form-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancelar</button><button class="primary-button" type="submit">Cadastrar material</button></div>
  </form>`, 'Almoxarifado'));
}

function openSupplierModal() {
  openModal('Novo fornecedor', `<form id="supplier-form" class="page-stack"><div class="field"><label>Nome da empresa</label><input id="sup-name" required /></div><div class="form-grid two-cols"><div class="field"><label>CNPJ</label><input id="sup-cnpj" /></div><div class="field"><label>Telefone</label><input id="sup-phone" /></div></div><div class="field"><label>E-mail</label><input id="sup-email" type="email" /></div><div class="field"><label>Endereço</label><input id="sup-address" /></div><div class="field"><label>Observações</label><textarea id="sup-notes"></textarea></div><div class="form-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancelar</button><button class="primary-button" type="submit">Cadastrar fornecedor</button></div></form>`, 'Almoxarifado');
}

async function renderAdminHome() {
  setPageTitle('Dashboard', 'Administração');
  await loadProfessionalBase();
  $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Visão administrativa</h2><p>Indicadores operacionais do protótipo SENTINELA HMV.</p></div></div><div class="stats-grid">${statCard('Pacientes',state.stats.patients,'users')}${statCard('Consultas hoje',state.stats.appointmentsToday,'calendar')}${statCard('Fila atual',state.stats.waiting,'activity')}${statCard('Exames cadastrados',state.stats.exams,'flask')}${statCard('Cirurgias/avaliações',state.stats.surgeries,'scissors')}${statCard('Chamadas TV',state.stats.calls,'tv')}${statCard('Em triagem',state.stats.inTriage,'activity')}${statCard('Em consulta',state.stats.inConsultation,'stethoscope')}</div><section class="panel"><div class="panel-head"><div><h3>Fila atual</h3><p>Visão consolidada para administração.</p></div></div>${queueTable(state.queue)}</section><div class="info-note">As contas, profissionais, CRM/RQE, horários e dados clínicos deste projeto são dados de demonstração e não representam cadastro oficial validado do HMV.</div></div>`;
}

async function renderAdminPatients(){setPageTitle('Pacientes','Administração'); await renderPatients(); setPageTitle('Pacientes','Administração');}
async function renderAdminProfessionals() {
  setPageTitle('Profissionais','Administração');
  const items = await api('/api/professionals');
  $('#main-content').innerHTML = `<div class="page-stack">
    <div class="page-head"><div><h2>Gestão de profissionais</h2><p>Cadastre contas, escolha o setor e controle quem pode acessar o SENTINELA.</p></div><button class="primary-button" data-action="new-professional">${icon('plus')} Novo profissional</button></div>
    <div class="stats-grid">${statCard('Profissionais ativos',items.filter(p => p.active !== false).length,'users')}${statCard('Médicos ativos',items.filter(p => p.active !== false && p.role === 'medico').length,'stethoscope')}${statCard('Contas desativadas',items.filter(p => p.active === false).length,'lock')}</div>
    <section class="panel"><div class="table-wrap"><table><thead><tr><th>Nome</th><th>Usuário</th><th>Perfil</th><th>Especialidade</th><th>Status</th><th>Ações</th></tr></thead><tbody>${items.map(p => `<tr><td><strong>${esc(p.displayName)}</strong></td><td>${esc(p.username)}</td><td>${esc(roleLabel(p.role))}</td><td>${esc(p.specialty || '—')}</td><td><span class="badge ${p.active===false?'red':'green'}">${p.active===false?'Inativo':'Ativo'}</span></td><td>${p.active === false ? `<button class="small-button" data-action="restore-professional" data-id="${esc(p.id)}">Reativar</button>` : p.id === state.user.id ? '<small>Sua conta</small>' : `<button class="small-button danger" data-action="delete-professional" data-id="${esc(p.id)}" data-name="${esc(p.displayName)}">Excluir</button>`}</td></tr>`).join('')}</tbody></table></div></section>
    <div class="info-note">Excluir desativa a conta e impede novos acessos, sem apagar o histórico hospitalar. Somente o Admin pode criar, excluir ou reativar profissionais. As credenciais desta demonstração não são adequadas para uso real.</div>
  </div>`;
}

async function openProfessionalModal() {
  if (state.role !== 'admin') return;
  try {
    const specialties = await api('/api/medical-specialties');
    openModal('Novo profissional', `<form id="professional-create-form" class="page-stack">
      <div class="form-grid two-cols">
        <div class="field span-2"><label for="new-prof-name">Nome completo *</label><input id="new-prof-name" name="displayName" maxlength="150" required autocomplete="off" placeholder="Nome do profissional" /></div>
        <div class="field"><label for="new-prof-user">Usuário de login *</label><input id="new-prof-user" name="username" minlength="3" maxlength="32" required autocomplete="off" placeholder="EX.: MARIA.SILVA" /></div>
        <div class="field"><label for="new-prof-password">Senha inicial *</label><input id="new-prof-password" name="password" type="password" minlength="8" maxlength="72" required autocomplete="new-password" placeholder="Mínimo 8 caracteres" /></div>
        <div class="field span-2"><label for="new-prof-role">Perfil de acesso *</label><select id="new-prof-role" name="role" required><option value="">Selecione a função</option><option value="medico">Médico</option><option value="atendimento">Atendimento</option><option value="triagem">Triagem</option><option value="almoxarifado">Almoxarifado</option><option value="admin">Administrador</option></select></div>
      </div>
      <div id="new-prof-medical-fields" class="page-stack hidden">
        <div class="section-divider"></div>
        <h3>Área de atuação médica</h3>
        <div class="form-grid two-cols">
          <div class="field span-2"><label for="new-prof-specialty">Especialidade médica *</label><select id="new-prof-specialty" name="specialty"><option value="">Selecione a área</option>${specialties.map(s => `<option value="${esc(s.name)}">${esc(s.name)}</option>`).join('')}</select></div>
          <div class="field"><label for="new-prof-crm">CRM (demonstração)</label><input id="new-prof-crm" name="crm" maxlength="60" placeholder="CRM/UF 000000" /></div>
          <div class="field"><label for="new-prof-rqe">RQE (opcional)</label><input id="new-prof-rqe" name="rqe" maxlength="40" placeholder="Registro da especialidade" /></div>
        </div>
        <p class="info-note">O médico cadastrado também aparecerá na lista de especialidades e nos agendamentos. Em uso real, CRM e RQE precisam de verificação oficial.</p>
      </div>
      <div class="form-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancelar</button><button class="primary-button" type="submit">Criar profissional</button></div>
    </form>`, 'Administração de acessos');
  } catch (err) { toast(err.message, 'error'); }
}
async function renderAdminAppointments(){setPageTitle('Consultas','Administração'); state.appointments=await api('/api/appointments'); $('#main-content').innerHTML=`<div class="page-stack"><div class="page-head"><div><h2>Consultas</h2><p>Agenda geral do sistema.</p></div></div><section class="panel">${state.appointments.length?appointmentTable(state.appointments,true):emptyState('Nenhuma consulta','Ainda não há consultas cadastradas.')}</section></div>`;}
async function renderAdminExams(){setPageTitle('Exames','Administração'); await renderDoctorExams(); setPageTitle('Exames','Administração');}
async function renderAdminSurgeries(){setPageTitle('Cirurgias','Administração'); await renderDoctorSurgeries(); setPageTitle('Cirurgias','Administração');}
async function renderAdminQueue(){setPageTitle('Fila hospitalar','Administração'); state.queue=await api('/api/queue'); $('#main-content').innerHTML=`<div class="page-stack"><div class="page-head"><div><h2>Fila hospitalar</h2><p>Todos os registros ativos e históricos simples da fila.</p></div></div><section class="panel">${queueTable(state.queue)}</section></div>`;}
async function renderAdminAudit(){setPageTitle('Logs de auditoria','Administração'); const items=await api('/api/admin/audit'); $('#main-content').innerHTML=`<div class="page-stack"><div class="page-head"><div><h2>Logs de auditoria</h2><p>Ações importantes registradas pelo backend.</p></div></div><section class="panel">${items.length?`<div class="table-wrap"><table><thead><tr><th>Data</th><th>Perfil</th><th>Ação</th><th>Relacionado</th></tr></thead><tbody>${items.map(x=>`<tr><td>${formatDateTime(x.createdAt)}</td><td>${esc(roleLabel(x.role))}</td><td>${esc(x.action)}</td><td>${esc(x.relatedId||'—')}</td></tr>`).join('')}</tbody></table></div>`:emptyState('Sem logs','Os registros de auditoria aparecerão aqui.')}</section></div>`;}

function renderNotFound(){setPageTitle('Página não encontrada'); $('#main-content').innerHTML=emptyState('Página não encontrada','Selecione outra opção no menu.');}

function showPatientDetails(patientId) {
  const p = state.patients.find(x => x.id === patientId);
  if (!p) return;
  const a = p.address || {};
  openModal('Dados do paciente', `<div class="profile-grid">${infoBox('Nome',p.name)}${infoBox('CPF',maskCpf(p.cpf))}${infoBox('E-mail',p.email)}${infoBox('Telefone',p.phone)}${infoBox('Nascimento',formatDate(p.birthDate))}${infoBox('Gênero',genderLabel(p.gender))}${infoBox('Endereço',`${a.street||''}, ${a.number||''}`)}${infoBox('Cidade/UF',`${a.city||''}/${a.state||''}`)}</div>`, 'Paciente');
}

async function initAuthenticatedSession(me) {
  state.user = me.user;
  state.role = me.role;
  showApp();
  await preloadCommon();
  // rebuild once data loaded so content has doctor/exam lists
  buildMenu();
}

function bindStaticEvents() {
  document.addEventListener('keydown', async event => {
    if (!event.ctrlKey || !event.altKey || event.shiftKey || event.code !== 'KeyA' || event.repeat) return;
    if (state.role === 'admin' && !$('#app-screen').classList.contains('hidden')) {
      event.preventDefault();
      navigate('admin-home');
      return;
    }
    if ($('#auth-screen').classList.contains('hidden')) return;
    event.preventDefault();
    try {
      await api('/api/auth/demo-admin-shortcut', { method: 'POST' });
      const me = await api('/api/me');
      await initAuthenticatedSession(me);
      await navigate('admin-home');
      toast('Modo de demonstração: acesso Admin aberto.', 'success');
    } catch {
      toast('Acesso direto disponível apenas no computador local, iniciado com npm run demo.', 'error');
    }
  });
  $('#modal-close').addEventListener('click', closeModal);
  $('#modal-backdrop').addEventListener('click', e => { if (e.target === $('#modal-backdrop')) closeModal(); });
  $('#theme-toggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('#mobile-menu-button').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#mobile-overlay').classList.remove('hidden'); });
  $('#mobile-overlay').addEventListener('click', () => { $('#sidebar').classList.remove('open'); $('#mobile-overlay').classList.add('hidden'); });
  $('#user-menu-button').addEventListener('click', () => $('#user-dropdown').classList.toggle('hidden'));
  $('#logout-button').addEventListener('click', doLogout);
  $('#profile-shortcut').addEventListener('click', () => { $('#user-dropdown').classList.add('hidden'); navigate(state.role === 'medico' ? 'patients' : menuByRole[state.role]?.[0]?.[0]); });
  $('#notification-button').addEventListener('click', showNotifications);

  $$('.password-toggle').forEach(btn => btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.setAttribute('data-icon-button', input.type === 'password' ? 'eye' : 'eye-off');
    applyIcons(btn.parentElement);
  }));

  $('#professional-login-form').addEventListener('submit', professionalLogin);

  $('#sidebar-menu').addEventListener('click', e => {
    const btn = e.target.closest('[data-view]');
    if (btn) navigate(btn.dataset.view);
  });

  $('#main-content').addEventListener('click', handleMainClick);
  $('#main-content').addEventListener('input', handleMainInput);
  $('#main-content').addEventListener('change', handleMainChange);
  $('#main-content').addEventListener('submit', handleMainSubmit);
  $('#modal-body').addEventListener('click', handleModalClick);
  $('#modal-body').addEventListener('input', e => {
    if (e.target.id === 'patient-cpf') e.target.value = cpfMask(e.target.value);
    if (e.target.id === 'patient-cep') e.target.value = cepMask(e.target.value);
    if (e.target.id === 'patient-phone') e.target.value = phoneMask(e.target.value);
  });
  $('#modal-body').addEventListener('focusout', e => { if (e.target.id === 'patient-cep') lookupPatientCep(); });
  $('#modal-body').addEventListener('change', handleModalChange);
  $('#modal-body').addEventListener('submit', handleModalSubmit);
}

async function professionalLogin(e) {
  e.preventDefault();
  const btn = e.currentTarget.querySelector('button[type="submit"]');
  btn.disabled = true; btn.textContent = 'Entrando...';
  try {
    await api('/api/auth/professional-login', { method:'POST', body:{ username:$('#professional-user').value, password:$('#professional-password').value } });
    const me = await api('/api/me');
    await initAuthenticatedSession(me);
  } catch (err) { toast(err.message,'error'); }
  finally { btn.disabled = false; btn.textContent = 'Entrar'; }
}


async function doLogout() {
  try { await api('/api/auth/logout', { method:'POST' }); } catch {}
  resetToLogin();
  toast('Sessão encerrada.');
}

function showNotifications() {
  toast('Não há notificações novas neste perfil.');
}

async function handleMainClick(e) {
  const jump = e.target.closest('[data-view-jump]'); if (jump) return navigate(jump.dataset.viewJump);
  const retry = e.target.closest('[data-action="retry-view"]'); if (retry) return navigate(state.currentView);
  const newProfessional = e.target.closest('[data-action="new-professional"]');
  if (newProfessional) return openProfessionalModal();
  const deleteProfessional = e.target.closest('[data-action="delete-professional"]');
  if (deleteProfessional) {
    if (!window.confirm(`Excluir o acesso de ${deleteProfessional.dataset.name}? O histórico será preservado.`)) return;
    try {
      await api(`/api/professionals/${encodeURIComponent(deleteProfessional.dataset.id)}`, { method:'DELETE' });
      toast('Profissional excluído. A conta foi desativada.', 'success');
      await navigate('admin-professionals');
    } catch (err) { toast(err.message, 'error'); }
    return;
  }
  const restoreProfessional = e.target.closest('[data-action="restore-professional"]');
  if (restoreProfessional) {
    try {
      await api(`/api/professionals/${encodeURIComponent(restoreProfessional.dataset.id)}/reactivate`, { method:'PATCH' });
      toast('Acesso profissional reativado.', 'success');
      await navigate('admin-professionals');
    } catch (err) { toast(err.message, 'error'); }
    return;
  }
  const newPatient = e.target.closest('[data-action="new-patient"]'); if (newPatient) return openPatientModal();
  const editPatient = e.target.closest('[data-action="edit-patient"]'); if (editPatient) return openPatientModal(editPatient.dataset.id);
  const doctor = e.target.closest('[data-action="book-doctor"]'); if (doctor) return openAppointmentModal(doctor.dataset.doctorId);
  const exam = e.target.closest('[data-action="book-exam"]'); if (exam) return openExamModal(exam.dataset.examId);
  const surgery = e.target.closest('[data-action="request-surgery"]'); if (surgery) return openSurgeryModal(surgery.dataset.doctorId);
  const patient = e.target.closest('[data-action="view-patient"]'); if (patient) return showPatientDetails(patient.dataset.id);
  const medRecord = e.target.closest('[data-action="new-medical-record"]'); if (medRecord) return openMedicalRecordModal(medRecord.dataset.id);
  const rx = e.target.closest('[data-action="new-prescription"]'); if (rx) return openPrescriptionModal();
  const triage = e.target.closest('[data-action="triage-patient"]'); if (triage) {
    state.patients = state.patients.length ? state.patients : await api('/api/patients');
    setPageTitle('Registrar triagem','Área de Triagem');
    $('#main-content').innerHTML = `<div class="page-stack"><div class="page-head"><div><h2>Nova triagem</h2><p>Paciente selecionado a partir da fila.</p></div></div><section class="panel"><div class="panel-body">${triageFormHtml(triage.dataset.id)}</div></section></div>`;
    return;
  }
  const call = e.target.closest('[data-action="call-patient"]'); if (call) return openCallModal(call.dataset.id, call.dataset.destination);
  const appt = e.target.closest('[data-action="appointment-status"]'); if (appt) {
    try { await api(`/api/appointments/${appt.dataset.id}/status`,{method:'PATCH',body:{status:appt.dataset.status}}); toast('Status atualizado.','success'); await navigate(state.currentView); } catch(err){toast(err.message,'error');}
  }
  const newItem = e.target.closest('[data-action="inventory-new-item"]'); if (newItem) return openInventoryItemModal();
  const newSupplier = e.target.closest('[data-action="inventory-new-supplier"]'); if (newSupplier) return openSupplierModal();
  const reqStatus = e.target.closest('[data-action="inventory-request-status"]'); if (reqStatus) {
    try { await api(`/api/inventory/requests/${reqStatus.dataset.id}/status`, {method:'PATCH', body:{status:reqStatus.dataset.status}}); toast('Solicitação atualizada.','success'); await navigate(state.currentView); } catch(err){toast(err.message,'error');}
  }
}

function handleMainInput(e) {
  if (e.target.id === 'doctor-search') {
    const q = e.target.value.toLowerCase();
    $$('#doctor-grid [data-doctor-search]').forEach(card => card.classList.toggle('hidden', !card.dataset.doctorSearch.includes(q)));
  }
  if (e.target.id === 'patient-search') {
    const q = e.target.value.toLowerCase();
    $$('#patients-table-body [data-patient-search]').forEach(row => row.classList.toggle('hidden', !row.dataset.patientSearch.includes(q)));
  }
  if (e.target.id === 'inventory-search') {
    const q = e.target.value.toLowerCase();
    $$('[data-inventory-search]').forEach(row => row.classList.toggle('hidden', !row.dataset.inventorySearch.includes(q)));
  }
}

async function handleMainChange(e) {
  const billing = e.target.closest('[data-billing-prefix]');
  if (billing) toggleBillingFields(billing.dataset.billingPrefix);
  const select = e.target.closest('[data-action="surgery-status"]');
  if (select && select.value) {
    try { await api(`/api/surgery-requests/${select.dataset.id}/status`, { method:'PATCH', body:{ status:select.value } }); toast('Status cirúrgico atualizado.','success'); await navigate(state.currentView); } catch(err){toast(err.message,'error');}
  }
}

async function handleMainSubmit(e) {
  if (e.target.id === 'donation-form') {
    e.preventDefault();
    try { await api('/api/blood-donations',{method:'POST',body:{date:$('#donation-date').value,time:$('#donation-time').value,unit:$('#donation-unit').value}}); toast('Doação agendada.','success'); await navigate('donations'); } catch(err){toast(err.message,'error');}
  }
  if (e.target.id === 'triage-form') {
    e.preventDefault();
    const priority = $('input[name="priority"]:checked', e.target)?.value || 'verde';
    const body = { patientId:$('#triage-patient').value,bloodPressure:$('#triage-bp').value,heartRate:$('#triage-hr').value,respiratoryRate:$('#triage-rr').value,temperature:$('#triage-temp').value,saturation:$('#triage-sat').value,weight:$('#triage-weight').value,height:$('#triage-height').value,allergies:$('#triage-allergies').value,complaint:$('#triage-complaint').value,symptoms:$('#triage-symptoms').value,observations:$('#triage-observations').value,priority };
    try { await api('/api/triage',{method:'POST',body}); toast('Triagem registrada.','success'); await navigate(state.role==='triagem'?'triage-history':'doctor-triage'); } catch(err){toast(err.message,'error');}
  }
  if (e.target.id === 'queue-form') {
    e.preventDefault();
    const priority = $('input[name="priority"]:checked', e.target)?.value || 'verde';
    try { await api('/api/queue',{method:'POST',body:{patientId:$('#queue-patient').value,destination:$('#queue-destination').value,stage:$('#queue-stage').value,priority,...billingPayload('queue')}}); toast('Paciente adicionado à fila.','success'); await navigate('service-home'); } catch(err){toast(err.message,'error');}
  }
  if (e.target.id === 'inventory-entry-form') {
    e.preventDefault();
    try { await api('/api/inventory/movements',{method:'POST',body:{type:'entrada',itemId:$('#inv-entry-item').value,quantity:$('#inv-entry-qty').value,supplierId:$('#inv-entry-supplier').value,lot:$('#inv-entry-lot').value,expiresAt:$('#inv-entry-expiry').value,notes:$('#inv-entry-notes').value}}); toast('Entrada registrada e estoque atualizado.','success'); await navigate('inventory-stock'); } catch(err){toast(err.message,'error');}
  }
  if (e.target.id === 'inventory-exit-form') {
    e.preventDefault();
    try { await api('/api/inventory/movements',{method:'POST',body:{type:'saida',itemId:$('#inv-exit-item').value,quantity:$('#inv-exit-qty').value,sector:$('#inv-exit-sector').value,responsible:$('#inv-exit-responsible').value,reason:$('#inv-exit-reason').value}}); toast('Saída registrada e estoque atualizado.','success'); await navigate('inventory-stock'); } catch(err){toast(err.message,'error');}
  }
  if (e.target.id === 'inventory-request-form') {
    e.preventDefault();
    try { await api('/api/inventory/requests',{method:'POST',body:{itemId:$('#inv-request-item').value,quantity:$('#inv-request-qty').value,sector:$('#inv-request-sector').value,reason:$('#inv-request-reason').value}}); toast('Solicitação enviada ao Almoxarifado.','success'); await navigate('request-material'); } catch(err){toast(err.message,'error');}
  }
}

async function handleModalClick(e) {
  if (e.target.closest('[data-action="close-modal"]')) return closeModal();
  const slot = e.target.closest('[data-action="select-slot"]');
  if (slot) {
    $$('.slot-button', $('#slot-area')).forEach(x => x.classList.remove('selected'));
    slot.classList.add('selected');
    $('#confirm-appointment').dataset.time = slot.dataset.time;
    $('#confirm-appointment').disabled = false;
    return;
  }
  const confirm = e.target.closest('#confirm-appointment');
  if (confirm) {
    const date = $('#appt-date').value;
    const time = confirm.dataset.time;
    if (!date || !time) return toast('Selecione data e horário.','error');
    confirm.disabled = true; confirm.textContent = 'Confirmando...';
    try {
      await api('/api/appointments',{method:'POST',body:{doctorId:confirm.dataset.doctorId,date,time,reason:$('#appt-reason').value,...billingPayload('appt')}});
      closeModal(); toast('Consulta agendada com sucesso.','success'); await navigate('bookings');
    } catch(err){toast(err.message,'error'); confirm.disabled=false; confirm.textContent='Confirmar consulta';}
  }
}

async function handleModalChange(e) {
  if (e.target.id === 'new-prof-role') {
    const isDoctor = e.target.value === 'medico';
    $('#new-prof-medical-fields').classList.toggle('hidden', !isDoctor);
    $('#new-prof-specialty').required = isDoctor;
  }
  const billing = e.target.closest('[data-billing-prefix]');
  if (billing) toggleBillingFields(billing.dataset.billingPrefix);
  if (e.target.id === 'appt-date') {
    const btn = $('#confirm-appointment'); btn.disabled = true; btn.dataset.time = '';
    await loadAvailability(btn.dataset.doctorId, e.target.value);
  }
}

async function handleModalSubmit(e) {
  if (e.target.id === 'professional-create-form') {
    e.preventDefault();
    const form = e.target;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      await api('/api/professionals', { method:'POST', body:Object.fromEntries(new FormData(form).entries()) });
      closeModal();
      toast('Profissional criado e conectado ao sistema!', 'success');
      await navigate('admin-professionals');
    } catch (err) { toast(err.message, 'error'); }
    finally { button.disabled = false; }
    return;
  }
  if (e.target.id === 'staff-patient-form') {
    e.preventDefault();
    const form = e.target;
    const patientId = form.dataset.patientId;
    const button = form.querySelector('button[type="submit"]');
    const returnView = state.currentView;
    button.disabled = true;
    try {
      const saved = await api(patientId ? `/api/patients/${encodeURIComponent(patientId)}` : '/api/patients', {
        method: patientId ? 'PATCH' : 'POST',
        body: Object.fromEntries(new FormData(form).entries())
      });
      closeModal();
      toast(patientId ? 'Cadastro atualizado com sucesso.' : 'Paciente cadastrado com sucesso.', 'success');
      await navigate(returnView);
      if (returnView === 'service-new' && !patientId && $('#queue-patient')) $('#queue-patient').value = saved.id;
    } catch (err) {
      toast(err.message, 'error');
    } finally { button.disabled = false; }
    return;
  }
  if (e.target.id === 'exam-booking-form') {
    e.preventDefault();
    const exam = state.exams.find(x => x.id === e.target.dataset.examId);
    try {
      await api('/api/exam-bookings',{method:'POST',body:{examId:exam.id,doctorId:$('#exam-doctor').value,date:$('#exam-date').value,time:$('#exam-time').value,medicalOrderConfirmed:exam.requiresMedicalOrder ? $('#medical-order-confirmed').checked : false,...billingPayload('exam')}});
      closeModal(); toast('Exame solicitado.','success'); await navigate('bookings');
    } catch(err){toast(err.message,'error');}
  }
  if (e.target.id === 'surgery-request-form') {
    e.preventDefault();
    try { await api('/api/surgery-requests',{method:'POST',body:{doctorId:e.target.dataset.doctorId,reason:$('#surgery-reason').value,preferredDate:$('#surgery-date').value,...billingPayload('surgery')}}); closeModal(); toast('Solicitação enviada para avaliação.','success'); await navigate('bookings'); } catch(err){toast(err.message,'error');}
  }
  if (e.target.id === 'medical-record-form') {
    e.preventDefault();
    const body = {
      patientId: e.target.dataset.patientId,
      complaint: $('#record-complaint').value,
      history: $('#record-history').value,
      physicalExam: $('#record-physical').value,
      hypothesis: $('#record-hypothesis').value,
      diagnosis: $('#record-diagnosis').value,
      conduct: $('#record-conduct').value,
      recommendations: $('#record-recommendations').value,
      returnPlan: $('#record-return').value
    };
    try { await api('/api/medical-records',{method:'POST',body}); closeModal(); toast('Consulta médica registrada no prontuário.','success'); } catch(err){toast(err.message,'error');}
  }
  if (e.target.id === 'prescription-form') {
    e.preventDefault();
    const item = { medication:$('#rx-medication').value,dose:$('#rx-dose').value,route:$('#rx-route').value,frequency:$('#rx-frequency').value,duration:$('#rx-duration').value };
    try {
      const rx = await api('/api/prescriptions',{method:'POST',body:{patientId:$('#rx-patient').value,items:[item],notes:$('#rx-notes').value}});
      closeModal();
      if (rx.alerts?.length) openModal('Verificação necessária', `<div class="alert-box">${rx.alerts.map(esc).join('<br>')}</div><p>Revise a prescrição antes de qualquer uso clínico. Este alerta é apenas demonstrativo.</p><div class="form-actions"><button class="primary-button" data-action="close-modal">Entendido</button></div>`, 'Apoio à prescrição');
      else toast('Prescrição registrada.','success');
      await renderDoctorPrescriptions();
    } catch(err){toast(err.message,'error');}
  }
  if (e.target.id === 'inventory-item-form') {
    e.preventDefault();
    try { await api('/api/inventory/items',{method:'POST',body:{name:$('#new-inv-name').value,category:$('#new-inv-category').value,unit:$('#new-inv-unit').value,location:$('#new-inv-location').value,quantity:$('#new-inv-qty').value,minStock:$('#new-inv-min').value,maxStock:$('#new-inv-max').value,supplierId:$('#new-inv-supplier').value,lot:$('#new-inv-lot').value,expiresAt:$('#new-inv-expiry').value}}); closeModal(); toast('Material cadastrado.','success'); await navigate('inventory-stock'); } catch(err){toast(err.message,'error');}
  }
  if (e.target.id === 'supplier-form') {
    e.preventDefault();
    try { await api('/api/inventory/suppliers',{method:'POST',body:{name:$('#sup-name').value,cnpj:$('#sup-cnpj').value,phone:$('#sup-phone').value,email:$('#sup-email').value,address:$('#sup-address').value,notes:$('#sup-notes').value}}); closeModal(); toast('Fornecedor cadastrado.','success'); await navigate('inventory-suppliers'); } catch(err){toast(err.message,'error');}
  }
  if (e.target.id === 'call-form') {
    e.preventDefault();
    try { await api('/api/calls',{method:'POST',body:{patientId:e.target.dataset.patientId,destination:$('#call-destination').value}}); closeModal(); toast('Paciente enviado para a TV de chamada.','success'); await navigate(state.currentView); } catch(err){toast(err.message,'error');}
  }
}

function openCallModal(patientId, defaultDestination='Consultório 01') {
  const patient = state.patients.find(p => p.id === patientId) || state.queue.find(q => q.patientId === patientId)?.patient;
  openModal('Chamar paciente', `<form id="call-form" class="page-stack" data-patient-id="${patientId}"><div class="info-box"><span>Paciente</span><strong>${esc(patient?.name || 'Paciente')}</strong></div><div class="field"><label>Destino</label><input id="call-destination" value="${esc(defaultDestination || 'Consultório 01')}" required /></div><div class="form-actions"><button type="button" class="secondary-button" data-action="close-modal">Cancelar</button><button class="primary-button" type="submit">Enviar para TV</button></div></form>`, 'TV de chamada');
}

function cpfMask(v){let x=v.replace(/\D/g,'').slice(0,11);x=x.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');return x;}
function cepMask(v){let x=v.replace(/\D/g,'').slice(0,8);return x.replace(/(\d{5})(\d)/,'$1-$2');}
function phoneMask(v){let x=v.replace(/\D/g,'').slice(0,11); if(x.length<=10)return x.replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{4})(\d)/,'$1-$2'); return x.replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2');}

async function boot() {
  setTheme(localStorage.getItem('sentinela-theme') || 'light');
  applyIcons();
  bindStaticEvents();
  try {
    const me = await api('/api/me');
    await initAuthenticatedSession(me);
  } catch {
    showAuth();
  }
}

document.addEventListener('DOMContentLoaded', boot);
