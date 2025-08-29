// ===== Theme boot (same logic as index) =====
(function () {
  try {
    const saved = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (systemDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch {}
})();

// ==== Helpers ====
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ==== Department map ====
const DEP_NAMES = {
  'garde-manger':'Garde-Manger',
  'cuisine-centrale':'Cuisine Centrale',
  'petit-dejeuner':'Petit Déjeuner (PDJ)',
  'snack-bar':'Snack Bar',
  'bar-windsor':'Bar Windsor',
  'spagos':'Spagos',
  'mille-et-une-nuits':'Mille et une Nuits',
  'patisserie':'Pâtisserie / Croissanterie',
  'etages-menage':'Étages / Ménage',
  'cafeteria':'Cafétéria',
  'cave':'Cave',
  'reception':'Réception',
  'comptabilite':'Comptabilité',
  'administration':'Administration',
  'direction':'Direction'
};

// ==== Read dep from URL ====
const params = new URLSearchParams(location.search);
const depId = (params.get('dep') || '').toLowerCase();
if (!depId) location.replace('index.html');

// ==== UI header ====
$('.title').textContent = `Demande – ${DEP_NAMES[depId] || depId}`;
$('#today').textContent = new Date().toLocaleDateString('fr-FR');

// ==== Storage (per dep) ====
const storeKey = `demande-items:${depId}`;
let items = [];
try { items = JSON.parse(localStorage.getItem(storeKey) || '[]'); } catch { items = []; }
const persist = () => localStorage.setItem(storeKey, JSON.stringify(items));

// ==== CSV → datalist (supports catalog.csv or catakog.csv) ====
const productInput = $('#product');
const codeInput    = $('#code');
const datalist     = $('#suggestions');

(async function loadCatalog() {
  const candidates = ['catalog.csv', 'catakog.csv'];
  for (const url of candidates) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) continue;
      const text = await r.text();
      const rows = csvToRows(text);
      // find header
      let codeIdx = 0, nameIdx = 1;
      const head = rows[0]?.map(x => (x||'').toLowerCase().trim()) || [];
      const hasHeader = head.includes('code') || head.includes('libelle') || head.includes('name');
      if (hasHeader) {
        codeIdx = head.indexOf('code'); if (codeIdx < 0) codeIdx = 0;
        nameIdx = head.indexOf('libelle'); if (nameIdx < 0) nameIdx = head.indexOf('name'); if (nameIdx < 0) nameIdx = 1;
      }
      const data = rows.slice(hasHeader ? 1 : 0).map(r => ({ code: (r[codeIdx]||'').trim(), name: (r[nameIdx]||'').trim() }))
                      .filter(x => x.code || x.name);
      datalist.innerHTML = data.map(x => `<option value="${escapeHtml(`${x.code} ${x.name}`)}"></option>`).join('');
      // auto-fill code when user picks a suggestion
      productInput.addEventListener('change', fillCodeFromProduct);
      return;
    } catch {}
  }
})();

function csvToRows(text) {
  const rows = [];
  let cur = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (q && text[i+1] === '"') { cell += '"'; i++; }
      else { q = !q; }
    } else if (ch === ',' && !q) { cur.push(cell); cell = ''; }
    else if ((ch === '\n' || ch === '\r') && !q) {
      if (cell.length || cur.length) { cur.push(cell); rows.push(cur); cur = []; cell = ''; }
      // swallow \r\n pairs
      if (ch === '\r' && text[i+1] === '\n') i++;
    } else {
      cell += ch;
    }
  }
  if (cell.length || cur.length) { cur.push(cell); rows.push(cur); }
  return rows;
}
function escapeHtml(s){return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));}

function fillCodeFromProduct(){
  const s = productInput.value.trim();
  // from "CODE NAME"
  const m = /^([0-9A-Z]{3,})\s+(.+)$/i.exec(s);
  if (m) { codeInput.value = m[1]; return; }
  // from "... [CODE]"
  const b = /(.*)\[(\w+)\]\s*$/.exec(s);
  if (b) { codeInput.value = b[2]; productInput.value = b[1].trim(); }
}

// ==== Parse product input → {code,name} ====
function parseProduct(input){
  const s = input.trim();
  // "CODE NAME"
  let m = /^([0-9A-Z]{3,})\s+(.+)$/i.exec(s);
  if (m) return { code: m[1], name: m[2] };
  // "NAME [CODE]"
  m = /(.*)\[(\w+)\]\s*$/.exec(s);
  if (m) return { code: m[2], name: m[1].trim() };
  return { code: codeInput.value.trim(), name: s };
}

// ==== Render list ====
const listEl  = $('#items');
const emptyEl = $('#emptyHint');
const sendBtn = $('#sendBtn');

function render(){
  listEl.innerHTML = '';
  if(!items.length){
    emptyEl.style.display='block';
    sendBtn.disabled = true;
    return;
  }
  emptyEl.style.display='none';
  sendBtn.disabled = false;

  items.forEach((it, idx)=>{
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <div class="left">
        <div class="name" title="${escapeHtml(it.name)}">
          ${escapeHtml(it.name)} ${it.code ? `<small style="opacity:.7">— <b>${escapeHtml(it.code)}</b></small>` : ''}
        </div>
      </div>
      <div class="actions">
        <span class="pill">${escapeHtml(it.qty)}</span>
        <button type="button" class="btn-del" data-index="${idx}">Supprimer</button>
      </div>`;
    listEl.appendChild(li);
  });
}
render();

// ==== Add item ====
$('#addForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const raw = $('#product').value.trim();
  const qty = $('#qty').value.trim();
  if(!raw || !qty) return;

  const p = parseProduct(raw);
  items.push({ code:p.code, name:p.name, qty });
  persist(); render(); e.target.reset(); codeInput.value='';
  toast('Produit ajouté ✅');
});

// ==== Delete one ====
listEl.addEventListener('click', (e)=>{
  const btn = e.target.closest('.btn-del');
  if(!btn) return;
  items.splice(+btn.dataset.index, 1);
  persist(); render();
});

// ==== Clear all ====
$('#clearBtn').addEventListener('click', ()=>{
  if(!items.length) return;
  if(confirm('Vider la liste ?')){
    items=[]; persist(); render();
  }
});

// ==== BON number sequence ====
function nextBonNumber(){
  let n = parseInt(localStorage.getItem('bon_seq') || '2145000', 10);
  n += 1;
  localStorage.setItem('bon_seq', String(n));
  return String(n).padStart(7,'0'); // ex: 0214501
}

// ==== Signature modal (simple) ====
let sig = null;
function openSignatureModal(){
  if($('#sigModal')) return;

  const wrap = document.createElement('div');
  wrap.id = 'sigModal';
  wrap.className = 'modal show';
  wrap.innerHTML = `
    <div class="modal-card">
      <div class="modal-head">
        <h3>توقيع <b>Chef de service</b></h3>
        <button class="icon-btn" id="sigClose">✖</button>
      </div>
      <div>
        <canvas id="sigPad" class="sig-canvas" width="1000" height="300"></canvas>
        <button id="sigClear" class="mini">مسح</button>
      </div>
      <div class="modal-actions">
        <button id="sigCancel" class="btn btn-secondary">إلغاء</button>
        <button id="sigOk" class="btn btn-primary">تأكيد الإرسال</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);

  const canvas = $('#sigPad');
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#222';
  let drawing = false, last=null, signed=false;

  const pos = (e)=>{
    const r = canvas.getBoundingClientRect();
    const x = (e.touches?e.touches[0].clientX:e.clientX) - r.left;
    const y = (e.touches?e.touches[0].clientY:e.clientY) - r.top;
    return { x: x * (canvas.width/r.width), y: y * (canvas.height/r.height) };
  };
  const start = (e)=>{ drawing=true; signed=true; last=pos(e); };
  const move  = (e)=>{
    if(!drawing) return;
    const p = pos(e);
    ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke();
    last=p; e.preventDefault();
  };
  const end   = ()=>{ drawing=false; };

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start,{passive:false});
  canvas.addEventListener('touchmove', move, {passive:false});
  canvas.addEventListener('touchend', end);

  $('#sigClear').onclick = ()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); signed=false; };
  $('#sigCancel').onclick= ()=> wrap.remove();
  $('#sigClose').onclick = ()=> wrap.remove();
  $('#sigOk').onclick    = ()=>{
    if(!signed){ alert('المرجو التوقيع.'); return; }
    sig = canvas.toDataURL('image/png');
    wrap.remove();
    finalizeAndOpenBon();
  };
}

function finalizeAndOpenBon(){
  if(!items.length) return;
  const bonId = nextBonNumber();
  const date  = new Date().toISOString();
  const payload = {
    bonId,
    departmentId: depId,
    departmentName: DEP_NAMES[depId] || depId,
    date,
    lignes: items.slice(),
    signatures: { chef: sig || null }
  };

  localStorage.setItem(`bon:${bonId}`, JSON.stringify(payload));

  let q = [];
  try { q = JSON.parse(localStorage.getItem('queue_control') || '[]'); } catch {}
  q.push({ bonId, departmentName: payload.departmentName, date });
  localStorage.setItem('queue_control', JSON.stringify(q));

  items=[]; persist(); render();
  location.href = `bon.html?bon=${bonId}`;
}

// ==== Send button ====
$('#sendBtn').addEventListener('click', ()=>{
  if(!items.length) return;
  openSignatureModal();
});

// ==== Toast ====
function toast(msg){
  let t = $('#toast');
  if(!t){
    t = document.createElement('div');
    t.id='toast'; t.className='toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._h);
  toast._h = setTimeout(()=> t.classList.remove('show'), 2200);
}
