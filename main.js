// Interactions for the PDP: gallery, finish choice + finish drawer, fact strip, quantity steppers, primer picker,
// favourite, chapters accordion, carousels.

const money = (n) => `$${n.toFixed(2)}`;
const esc = (s) => s.replace(/&/g, '&amp;');

// Gallery thumbnails swap the main image
const galleryMain = document.getElementById('gallery-main');
document.querySelectorAll('.gallery__thumb').forEach((thumb) => {
  thumb.addEventListener('click', () => {
    document.querySelectorAll('.gallery__thumb').forEach((t) => t.classList.toggle('is-active', t === thumb));
    galleryMain.src = thumb.dataset.src;
  });
});

// Single-select groups (aria-checked + .is-active)
function singleSelect(items, onSelect) {
  items.forEach((item) => {
    item.addEventListener('click', () => {
      items.forEach((i) => {
        i.classList.toggle('is-active', i === item);
        i.setAttribute('aria-checked', String(i === item));
      });
      if (onSelect) onSelect(item);
    });
  });
}

// Primer type picker updates the price label
const primerLabel = document.getElementById('primer-label');
singleSelect([...document.querySelectorAll('.primer-type')], (btn) => {
  primerLabel.textContent = `${btn.textContent} Primer`;
});

// ---------- Finishes (order card, fact strip 137:558, drawer 124:578) ----------
// Copy comes from the Figma file; info/sizes only exist for the finishes the design documents.
const FINISHES = [
  {
    id: 'estate-emulsion', group: 'walls', name: 'Estate Emulsion', desc: 'Chalky matt for walls & ceilings', sheen: 2,
    text: 'Estate Emulsion is our classic matt finish for interior walls and ceilings. Its soft, chalky look gives colour real depth and works beautifully in living rooms, bedrooms and dining rooms.',
    sizes: '2.5L, 5L',
  },
  {
    id: 'modern-emulsion', group: 'walls', name: 'Modern Emulsion', desc: 'Washable matt for walls & ceilings', sheen: 7,
    text: 'Modern Emulsion is our super-tough, easy to clean finish for interior walls and ceilings. Washable and protected against mould, it’s ideal for busy spaces, including kitchens and bathrooms.',
    suitable: ['Interior Walls & Ceilings', 'Kitchens', 'Bathrooms'],
    sizes: '2.5L, 5L',
  },
  { id: 'dead-flat', group: 'walls', name: 'Dead Flat', desc: 'Ultra-matt for walls, wood & metal', sheen: 2 },
  { id: 'casein-distemper', group: 'walls', name: 'Casein Distemper', desc: 'Traditional finish for walls & ceilings', sheen: 2 },
  { id: 'flat-eggshell', group: 'wood', name: 'Flat Eggshell', desc: 'Low sheen for interior wood & metal', sheen: 20 },
  { id: 'modern-eggshell', group: 'wood', name: 'Modern Eggshell', desc: 'Hard-wearing for wood, metal & floors', sheen: 40 },
  { id: 'full-gloss', group: 'wood', name: 'Full Gloss', desc: 'High shine for wood & metal', sheen: 95 },
  { id: 'exterior-masonry', group: 'exterior', name: 'Exterior Masonry', desc: 'For exterior walls', sheen: 2 },
  { id: 'exterior-eggshell', group: 'exterior', name: 'Exterior Eggshell', desc: 'For exterior wood & metal', sheen: 20 },
];
const byId = (id) => FINISHES.find((f) => f.id === id);
// "Chalky matt for walls & ceilings" -> look "Chalky matt", use on "Walls & ceilings"
const lookOf = (f) => (/^for /i.test(f.desc) ? f.desc : f.desc.split(' for ')[0]);
const useOf = (f) => { const u = f.desc.split(/for /i)[1] || ''; return u.charAt(0).toUpperCase() + u.slice(1); };

let currentFinish = 'estate-emulsion';
const finishCards = [...document.querySelectorAll('.finish-card')];
const fact = (id) => document.getElementById(id);

function renderFactStrip(f) {
  fact('fact-name').textContent = f.name;
  fact('fact-text').textContent = f.text || '';
  fact('fact-text').hidden = !f.text;
  fact('fact-sheen').textContent = `${f.sheen}%`;
  fact('fact-look').textContent = lookOf(f);
  fact('fact-use').textContent = useOf(f);
  fact('fact-sizes').textContent = f.sizes || '';
  fact('fact-sizes-wrap').hidden = !f.sizes;
}

function setFinish(id) {
  currentFinish = id;
  const f = byId(id);
  let card = finishCards.find((c) => c.dataset.finish === id);
  if (!card) {
    // A finish outside the cards shown takes the last card's slot
    card = finishCards[finishCards.length - 1];
    card.dataset.finish = id;
    card.querySelector('.finish-card__name').textContent = f.name;
    card.querySelector('.finish-card__desc').textContent = lookOf(f);
    card.querySelector('.tag').textContent = `${f.sheen}% sheen`;
  }
  finishCards.forEach((c) => {
    c.classList.toggle('is-active', c === card);
    c.setAttribute('aria-checked', String(c === card));
  });
  renderFactStrip(f);
}
finishCards.forEach((card) => card.addEventListener('click', () => setFinish(card.dataset.finish)));

// Drawer list
const drawer = document.getElementById('finish-drawer');
const list = document.getElementById('finish-list');
const selectBtn = document.getElementById('finish-select');
let pending = currentFinish;
let lastFocus = null;

const infoPanel = (f) => {
  if (!f.text) return '';
  const points = (f.suitable || []).map((s) => `<p class="finish-info__point"><img src="assets/icons/bullet.svg" width="5" height="5" alt="">${esc(s)}</p>`).join('');
  return `
    <div class="finish-info" id="info-${f.id}" hidden>
      <p class="finish-info__text">${esc(f.text)}</p>
      ${points ? `<p class="finish-info__label">Suitable for:</p>${points}` : ''}
      ${f.sizes ? `<p class="finish-info__sizes">Available in ${f.sizes}</p>` : ''}
    </div>`;
};

list.innerHTML = FINISHES.map((f) => `
  <div class="finish-item" data-id="${f.id}" data-group="${f.group}">
    <div class="finish-row">
      <button class="finish-option" type="button" role="radio" aria-checked="false">
        <span class="finish-option__radio" aria-hidden="true"></span>
        <span class="finish-option__text">
          <span class="finish-option__title"><span class="finish-option__name">${f.name}</span><span class="finish-option__sheen">${f.sheen}% sheen</span></span>
          <span class="finish-option__desc">${esc(f.desc)}</span>
        </span>
      </button>
      ${f.text ? `<button class="finish-info-toggle" type="button" aria-expanded="false" aria-controls="info-${f.id}"><span>Show info</span><img src="assets/icons/chevron-down.svg" width="24" height="24" alt=""></button>` : ''}
    </div>${infoPanel(f)}
  </div>`).join('');
const items = [...list.querySelectorAll('.finish-item')];

function markPending(id) {
  pending = id;
  items.forEach((item) => {
    const on = item.dataset.id === id;
    item.classList.toggle('is-selected', on);
    const opt = item.querySelector('.finish-option');
    opt.setAttribute('aria-checked', String(on));
    opt.tabIndex = on ? 0 : -1;
  });
  selectBtn.textContent = `Select ${byId(id).name}`;
}

function toggleInfo(item, open) {
  const btn = item.querySelector('.finish-info-toggle');
  if (!btn) return;
  btn.setAttribute('aria-expanded', String(open));
  btn.querySelector('span').textContent = open ? 'Hide info' : 'Show info';
  btn.querySelector('img').src = `assets/icons/chevron-${open ? 'up' : 'down'}.svg`;
  item.querySelector('.finish-info').hidden = !open;
}

items.forEach((item) => {
  item.querySelector('.finish-row').addEventListener('click', (e) => {
    const toggle = e.target.closest('.finish-info-toggle');
    if (toggle) toggleInfo(item, toggle.getAttribute('aria-expanded') !== 'true');
    else markPending(item.dataset.id);
  });
});

// Arrow keys move through the visible options, like a native radio group
list.addEventListener('keydown', (e) => {
  if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
  const visible = items.filter((i) => !i.hidden).map((i) => i.querySelector('.finish-option'));
  const i = visible.indexOf(document.activeElement);
  if (i < 0) return;
  e.preventDefault();
  const next = visible[(i + (e.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length];
  markPending(next.closest('.finish-item').dataset.id);
  next.focus();
});

const tabs = [...drawer.querySelectorAll('.drawer__tab')];
function applyFilter(group) {
  tabs.forEach((t) => {
    const on = t.dataset.filter === group;
    t.classList.toggle('is-active', on);
    t.setAttribute('aria-selected', String(on));
  });
  items.forEach((item) => { item.hidden = group !== 'all' && item.dataset.group !== group; });
  list.scrollTop = 0;
}
tabs.forEach((t) => t.addEventListener('click', () => applyFilter(t.dataset.filter)));

function openDrawer() {
  lastFocus = document.activeElement;
  applyFilter('all');
  items.forEach((item) => toggleInfo(item, false));
  markPending(currentFinish);
  drawer.inert = false;
  drawer.setAttribute('aria-hidden', 'false');
  drawer.classList.add('is-open');
  document.body.classList.add('drawer-open');
  drawer.querySelector('.drawer__panel').focus({ preventScroll: true });
}
function closeDrawer() {
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.inert = true;
  document.body.classList.remove('drawer-open');
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}
document.querySelectorAll('[data-open-finishes]').forEach((b) => b.addEventListener('click', openDrawer));
drawer.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeDrawer));
selectBtn.addEventListener('click', () => { setFinish(pending); closeDrawer(); });
drawer.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeDrawer(); return; }
  if (e.key !== 'Tab') return;
  // Keep focus inside the open drawer
  const focusable = [...drawer.querySelectorAll('button, a[href]')].filter((b) => b.tabIndex !== -1 && b.offsetParent);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
// index.html#finishes opens the drawer straight away (handy for sharing the slide-out)
if (location.hash === '#finishes') openDrawer();

// ---------- Quantity steppers drive the Add to Basket total ----------
const steppers = [...document.querySelectorAll('.stepper')];
const addButton = document.getElementById('add-to-basket');

function updateTotal() {
  let total = 0;
  steppers.forEach((s) => {
    const qty = parseInt(s.querySelector('.stepper__value').value, 10) || 0;
    s.classList.toggle('is-active', qty > 0);
    s.querySelector('[data-step="-1"]').disabled = qty === 0;
    total += qty * Number(s.dataset.price);
  });
  addButton.textContent = total > 0 ? `Add to Basket ${money(total)}` : 'Add to Basket';
  addButton.disabled = total === 0;
}

steppers.forEach((s) => {
  const input = s.querySelector('.stepper__value');
  s.querySelectorAll('.stepper__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      input.value = Math.min(99, Math.max(0, (parseInt(input.value, 10) || 0) + Number(btn.dataset.step)));
      updateTotal();
    });
  });
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 2);
    updateTotal();
  });
  input.addEventListener('blur', () => {
    if (input.value === '') input.value = '0';
  });
  input.addEventListener('focus', () => input.select());
});
updateTotal();

// Favourite toggle
const fav = document.querySelector('.fav');
fav.addEventListener('click', () => {
  fav.setAttribute('aria-pressed', String(fav.getAttribute('aria-pressed') !== 'true'));
});

// Chapters accordion: only chapters with copy in the design (aria-controls) can open
document.querySelectorAll('.chapter__head[aria-controls]').forEach((head) => {
  head.addEventListener('click', () => {
    const chapter = head.closest('.chapter');
    const open = !chapter.classList.contains('is-open');
    chapter.classList.toggle('is-open', open);
    head.setAttribute('aria-expanded', String(open));
    head.querySelector('.chapter__sign').textContent = open ? '–' : '+';
  });
});

// ---------- Carousels (similar colours, red inspiration) ----------
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel__track');
  const cards = [...track.children];
  const prev = carousel.querySelector('.carousel__prev');
  const next = carousel.querySelector('.carousel__next');
  const counter = carousel.querySelector('.carousel__index');
  const bar = carousel.querySelector('.carousel__bar');
  carousel.querySelector('.carousel__count').textContent = cards.length;
  let index = 0;
  const goTo = (i) => {
    index = Math.max(0, Math.min(cards.length - 1, i));
    track.scrollTo({ left: cards[index].offsetLeft - track.offsetLeft });
    counter.textContent = index + 1;
    const travel = bar.parentElement.clientWidth - bar.offsetWidth;
    bar.style.transform = `translateX(${(travel * index) / Math.max(1, cards.length - 1)}px)`;
    prev.disabled = index === 0;
    next.disabled = index === cards.length - 1;
  };
  prev.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));
  goTo(0);
});
