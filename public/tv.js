let lastCallId = null;

function updateClock() {
  document.getElementById('clock').textContent = new Intl.DateTimeFormat('pt-BR', { dateStyle:'short', timeStyle:'medium' }).format(new Date());
}

async function loadCalls() {
  try {
    const res = await fetch('/api/calls/latest');
    const calls = await res.json();
    const current = calls[0];
    if (current) {
      document.getElementById('call-name').textContent = current.patientName;
      document.getElementById('call-code').textContent = current.code;
      document.getElementById('call-destination').textContent = current.destination;
      if (lastCallId && lastCallId !== current.id) {
        const box = document.getElementById('current-call');
        box.classList.remove('flash'); void box.offsetWidth; box.classList.add('flash');
      }
      lastCallId = current.id;
    }
    const recent = calls.slice(1,5);
    document.getElementById('recent-list').innerHTML = recent.length ? recent.map(c => `<div class="recent-item"><strong>${escapeHtml(c.code)}</strong><span>${escapeHtml(c.patientName)}</span><b>${escapeHtml(c.destination)}</b></div>`).join('') : '<div class="recent-item"><span>Nenhuma chamada anterior.</span></div>';
  } catch {}
}

function escapeHtml(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
setInterval(updateClock, 1000);
setInterval(loadCalls, 2500);
updateClock();
loadCalls();
