// SafarX - main JS
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// Demo data
const DESTINATIONS = [
  { name:'Munnar', tag:'Tea Gardens', img:'munnar.jpeg' },
  { name:'Jaipur', tag:'Heritage', img:'jaipur.jpeg' },
  { name:'Goa', tag:'Beaches', img:'goa.jpeg' }
];
const ROOMS = [
  { name:'Valley Suite', tag:'Suite', img:'valley.jpeg' },
  { name:'Forest Cottage', tag:'Cottage', img:'forest cottage.jpeg' }
];

// Load guides from localStorage
const GUIDES = () => JSON.parse(localStorage.getItem('safarx_guides') || '[]');

// Render grids
function renderGrid(){
  $('#destGrid').innerHTML = DESTINATIONS.map(d => `
    <div class="card-mini">
      <img src="${d.img}" alt="${d.name}" style="width:100%; height:140px; object-fit:cover; border-radius:8px; margin-bottom:8px" />
      <strong>${d.name}</strong>
      <div class="muted">${d.tag}</div>
      <div style="margin-top:8px; display:flex; gap:8px">
        <button class="btn" data-add="${d.name}">Add to Trip</button>
        <button class="btn outline" data-view="${d.name}">View</button>
      </div>
    </div>
  `).join('');

  $('#roomGrid').innerHTML = ROOMS.map(r => `
    <div class="card-mini">
      <img src="${r.img}" alt="${r.name}" style="width:100%; height:140px; object-fit:cover; border-radius:8px; margin-bottom:8px" />
      <strong>${r.name}</strong>
      <div class="muted">${r.tag}</div>
      <div style="margin-top:8px; display:flex; gap:8px">
        <button class="btn" data-3d>3D</button>
        <button class="btn outline" data-add="${r.name}">Add</button>
      </div>
    </div>
  `).join('');

  const sample = [
    { name:'Asha Menon', city:'Alappuzha', langs:'Malayalam, English' },
    { name:'Ravi Singh', city:'Jaipur', langs:'Hindi, English' },
    ...GUIDES().map(g => ({ name: g.name, city: g.city || '', langs: g.langs || '' }))
  ];
  $('#guideGrid').innerHTML = sample.map(g => `
    <div class="card-mini">
      <strong>${g.name}</strong>
      <div class="muted">${g.city}</div>
      <div class="muted small">Langs: ${g.langs}</div>
      <div style="margin-top:8px"><button class="btn">Contact</button></div>
    </div>
  `).join('');

  // Wire up 3D buttons
  $$('[data-3d]').forEach(btn => btn.addEventListener('click', open3d));
  $$('[data-add]').forEach(btn => btn.addEventListener('click', e => {
    const name = e.currentTarget.dataset.add;
    $('#placeName').value = name;
    $('#placeDay').value = 1;
    addPlace();
    openTrip();
  }));
}

// Chat subsystem (simple rule-based demo)
function botReply(text){
  const t = text.toLowerCase();
  if(/hi|hello|hey/.test(t)) return "Hello! Where would you like to travel?";
  if(t.includes('budget')) return "Open the Trip Manager (top-left) to set a target budget and track spending.";
  if(t.includes('jaipur')) return "Jaipur 3-day: Day1 Palace & Hawa Mahal, Day2 Amber Fort, Day3 markets & street food.";
  if(t.includes('3d') || t.includes('ar') || t.includes('vr')) return "Use the AR/VR icon to preview rooms. On mobile, try 'View in AR'.";
  return "I can help with itineraries, budgets and local tips. Try: '3-day Munnar plan' or 'Budget 15k for Goa'.";
}

// Chat UI
$('#chatFab').addEventListener('click', openChat);
$('#open-chat').addEventListener('click', openChat);
$('#closeChat').addEventListener('click', closeChat);
$('#minChat').addEventListener('click', () => {
  const w = $('#chatWidget');
  w.style.height = (w.style.height === '40px') ? '' : '40px';
});
$('#sendMsg').addEventListener('click', () => {
  const v = $('#chatInput').value.trim();
  if(!v) return;
  $('#chatBody').innerHTML += `<div class="msg user">${escapeHtml(v)}</div>`;
  $('#chatInput').value = '';
  setTimeout(() => { $('#chatBody').innerHTML += `<div class="msg bot">${botReply(v)}</div>`; }, 300);
});
function openChat(){ $('#chatWidget').style.display = 'flex'; $('#chatWidget').setAttribute('aria-hidden','false'); }
function closeChat(){ $('#chatWidget').style.display = 'none'; $('#chatWidget').setAttribute('aria-hidden','true'); }

// Auth (localStorage demo)
$('#open-auth').addEventListener('click', openAuth);
$('#closeAuth').addEventListener('click', closeAuth);
function openAuth(){ $('#authModal').style.display = 'flex'; $('#authModal').setAttribute('aria-hidden','false'); }
function closeAuth(){ $('#authModal').style.display = 'none'; $('#authModal').setAttribute('aria-hidden','true'); }

$('#registerBtn').addEventListener('click', () => {
  const name = $('#regName').value.trim();
  const email = $('#regEmail').value.trim();
  const pass = $('#regPass').value;
  const city = $('#regCity').value.trim();
  const langs = $('#regLang').value.trim();
  if(!name || !email || !pass){ alert('Please fill name, email and password'); return; }
  const guides = GUIDES();
  if(guides.some(g => g.email === email)){ alert('Email already registered'); return; }
  guides.push({ name, email, pass, city, langs });
  localStorage.setItem('safarx_guides', JSON.stringify(guides));
  alert('Registered as guide!'); renderGrid(); closeAuth();
});

$('#loginBtn').addEventListener('click', () => {
  const email = $('#logEmail').value.trim();
  const pass = $('#logPass').value;
  const guides = GUIDES();
  const ok = guides.find(g => g.email === email && g.pass === pass);
  $('#authStatus').textContent = ok ? `Welcome, ${ok.name}!` : 'Invalid credentials';
});

// 3D modal
$('#btn-3d').addEventListener('click', open3d);
$('#view-3d-hero').addEventListener('click', open3d);
$('#close3d').addEventListener('click', () => { $('#roomModal').style.display = 'none'; $('#roomModal').setAttribute('aria-hidden','true'); });
function open3d(){ $('#roomModal').style.display = 'flex'; $('#roomModal').setAttribute('aria-hidden','false'); }
$('#swap-min').addEventListener('click', () => $('#roomViewer').setAttribute('src', 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'));
$('#swap-suite').addEventListener('click', () => $('#roomViewer').setAttribute('src', 'https://modelviewer.dev/assets/ShopifyModels/Chair/glTF/Chair.gltf'));

// Trip manager (localStorage)
$('#btn-trip').addEventListener('click', openTrip);
$('#closeTrip').addEventListener('click', closeTrip);
$('#addPlace').addEventListener('click', addPlace);
$('#saveTrip').addEventListener('click', saveTrip);
$('#clearTrip').addEventListener('click', clearTrip);
$('#add-to-trip-hero').addEventListener('click', () => {
  $('#placeName').value = 'Valley View Suite';
  $('#placeDay').value = 1;
  addPlace();
  openTrip();
});

function openTrip(){ $('#tripModal').style.display = 'flex'; $('#tripModal').setAttribute('aria-hidden','false'); renderItinerary(); updateBudgetSummary(); }
function closeTrip(){ $('#tripModal').style.display = 'none'; $('#tripModal').setAttribute('aria-hidden','true'); }

function addPlace(){
  const name = $('#placeName').value.trim();
  const day = parseInt($('#placeDay').value || '1', 10);
  if(!name) return alert('Add a place name');
  const trip = JSON.parse(localStorage.getItem('safarx_trip') || '{"places":[],"budget":{}}');
  trip.places = trip.places || [];
  trip.places.push({ name, day });
  localStorage.setItem('safarx_trip', JSON.stringify(trip));
  $('#placeName').value = ''; $('#placeDay').value = '';
  renderItinerary(); updateBudgetSummary();
}

function renderItinerary(){
  const trip = JSON.parse(localStorage.getItem('safarx_trip') || '{"places":[]}');
  const list = $('#itinerary'); list.innerHTML = '';
  (trip.places || []).forEach((p, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>Day ${escapeHtml(String(p.day))} — ${escapeHtml(p.name)}</span><button class="btn" data-remove="${i}">Remove</button>`;
    list.appendChild(li);
  });
  $$('[data-remove]').forEach(btn => btn.addEventListener('click', e => {
    const idx = +e.currentTarget.dataset.remove;
    const trip = JSON.parse(localStorage.getItem('safarx_trip') || '{"places":[]}');
    trip.places.splice(idx, 1);
    localStorage.setItem('safarx_trip', JSON.stringify(trip));
    renderItinerary(); updateBudgetSummary();
  }));
}

function saveTrip(){
  const target = parseFloat($('#targetBudget').value || 0);
  const spent = parseFloat($('#spentBudget').value || 0);
  const trip = JSON.parse(localStorage.getItem('safarx_trip') || '{"places":[]}');
  trip.budget = { target, spent };
  localStorage.setItem('safarx_trip', JSON.stringify(trip));
  alert('Trip saved locally!');
  updateBudgetSummary();
}

function clearTrip(){
  if(!confirm('Clear saved trip?')) return;
  localStorage.removeItem('safarx_trip');
  renderItinerary(); updateBudgetSummary();
}

function updateBudgetSummary(){
  const trip = JSON.parse(localStorage.getItem('safarx_trip') || '{"places":[]}');
  const target = (trip.budget && trip.budget.target) || 0;
  const spent = (trip.budget && trip.budget.spent) || 0;
  const remaining = target - spent;
  $('#budgetSummary').textContent = target ? `Remaining: ₹${remaining.toLocaleString()} (Target ₹${target.toLocaleString()}, Spent ₹${spent.toLocaleString()})` : 'No budget set';
  $('#targetBudget').value = target || '';
  $('#spentBudget').value = spent || '';
}

// Utility
function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// Search demo
$('#searchBtn').addEventListener('click', () => {
  const where = $('#where').value || 'somewhere beautiful';
  alert(`Searching for ${where} — demo mode (no backend)`);
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  renderGrid();
  const trip = JSON.parse(localStorage.getItem('safarx_trip') || '{"places":[]}');
  if(trip && trip.places && trip.places.length) renderItinerary();
  updateBudgetSummary();
});
