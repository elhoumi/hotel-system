(function(){
  const $ = s => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const id = params.get('bon') || '';

  
  let data = {
    bonId: id || '0000000',
    departmentName: '—',
    date: new Date().toISOString(),
    lignes: [],
    signatures: {}
  };

  
  if (id) {
    try {
      const raw = localStorage.getItem(`bon:${id}`);
      if (raw) {
        const d = JSON.parse(raw);
        data = {
          bonId: d.bonId || id,
          departmentName: d.departmentName || d.dep || '—',
          date: d.date || new Date().toISOString(),
          lignes: Array.isArray(d.lignes) ? d.lignes.map(x=>({
            code: x.code || '',
            name: x.name || x.designation || '',
            qty:  x.qty  || x.qty_dem || '',
            livr: x.livr || x.qty_livr || ''
          })) : [],
          signatures: { chef: (d.signatures && d.signatures.chef) || d.chefSignature || d.sign || null }
        };
      }
    } catch(e){}
  }

  
  function draw(){
    $('#bonNumber').textContent = data.bonId || '0000000';
    $('#pv').textContent = data.departmentName || '—';
    const dd = data.date ? new Date(data.date) : new Date();
    $('#date').textContent = dd.toLocaleDateString('fr-FR');

    const tbody = $('#rows');
    tbody.innerHTML = '';
    const L = data.lignes || [];
    L.forEach(x=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${x.code||''}</td>
        <td>${x.name||''}</td>
        <td>${x.qty||''}</td>
        <td>${x.livr||''}</td>`;
      tbody.appendChild(tr);
    });
    
    for (let i=L.length; i<16; i++){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td></td><td></td><td></td><td></td>';
      tbody.appendChild(tr);
    }

    
    const chefBox = document.getElementById('sigChefBox');
    chefBox.querySelectorAll('img').forEach(n=>n.remove());
    if (data.signatures && data.signatures.chef){
      const img = new Image();
      img.src = data.signatures.chef;
      chefBox.appendChild(img);
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    draw();
    document.getElementById('printBtn').addEventListener('click', ()=> window.print());
  });
})();
