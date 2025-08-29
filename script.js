// ===== Theme boot (no inline JS) =====
(function bootTheme(){
  try{
    const saved = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (systemDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }catch{
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

// ===== Language =====
if (typeof initializeLanguage === 'function') initializeLanguage();
document.querySelectorAll('.lang-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const lang = btn.getAttribute('data-lang');
    if (typeof changeLanguage === 'function') changeLanguage(lang);
    document.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ===== Theme toggle =====
const themeBtn  = document.getElementById('themeToggle');
const themeIcon = themeBtn.querySelector('i');
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  try{ localStorage.setItem('theme', theme); }catch(e){}
  themeIcon.className = (theme==='dark') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}
applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
themeBtn.addEventListener('click', ()=>{
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(cur === 'light' ? 'dark' : 'light');
});

// ===== Departments → demande.html =====
document.querySelectorAll('.department-card .action-button').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const dep = btn.closest('.department-card')?.getAttribute('data-department') || 'inconnu';
    window.location.href = `demande.html?dep=${encodeURIComponent(dep)}`;
  });
});

// ===== Search filter (center header) =====
const searchInput = document.getElementById('searchInput');
if (searchInput){
  const cards = Array.from(document.querySelectorAll('.department-card'));
  searchInput.addEventListener('input', ()=>{
    const q = searchInput.value.trim().toLowerCase();
    cards.forEach(card=>{
      const key = (card.dataset.department || '') + ' ' + (card.querySelector('h3')?.textContent || '');
      card.style.display = key.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// ===== Service Worker =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('SW scope:', reg.scope))
      .catch(err => console.error('SW error:', err));
  });
}
