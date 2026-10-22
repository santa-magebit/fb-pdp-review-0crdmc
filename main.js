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
// Copy: Estate and Modern Emulsion text from the Figma file; the other finishes' info, "Suitable for" lists and
// sizes from the live farrow-ball.com/paint/incarnadine finish selector.
const FINISHES = [
  {
    id: 'estate-emulsion', group: 'walls', name: 'Estate Emulsion', desc: 'Chalky matt for walls & ceilings', sheen: 2,
    text: 'Estate Emulsion is our classic matt finish for interior walls and ceilings. Its soft, chalky look gives colour real depth and works beautifully in living rooms, bedrooms and dining rooms.',
    suitable: ['Interior Walls & Ceilings', 'Low-traffic Areas'],
    sizes: '2.5L, 5L',
  },
  {
    id: 'modern-emulsion', group: 'walls', name: 'Modern Emulsion', desc: 'Washable matt for walls & ceilings', sheen: 7,
    text: 'Modern Emulsion is our super-tough, easy to clean finish for interior walls and ceilings. Washable and protected against mould, it’s ideal for busy spaces, including kitchens and bathrooms.',
    suitable: ['Interior Walls & Ceilings', 'Kitchens', 'Bathrooms'],
    sizes: '2.5L, 5L',
  },
  {
    id: 'dead-flat', group: 'walls', name: 'Dead Flat', desc: 'Ultra-matt for walls, wood & metal', sheen: 2,
    text: 'Our most matt, multi-surface finish with added toughness. Perfect for busy spaces, including hallways, living and dining rooms, kitchens and bathrooms.',
    suitable: ['Interior Walls & Ceilings - including kitchens & bathrooms', 'Interior Woodwork', 'Interior Metalwork & Radiators'],
    sizes: '750ml, 2.5L, 5L',
  },
  {
    id: 'casein-distemper', group: 'walls', name: 'Casein Distemper', desc: 'Traditional finish for walls & ceilings', sheen: 2,
    text: 'This strengthened distemper is for use on low-traffic walls and ceilings. Casein Distemper offers a very flat matt finish with a breathable, permeable structure.',
    suitable: ['Specialist Finish', 'Period Properties', 'Interior Plaster & Ceilings'],
    sizes: '2.5L, 5L',
  },
  {
    id: 'flat-eggshell', group: 'wood', name: 'Flat Eggshell', desc: 'Low sheen for interior wood & metal', sheen: 20,
    text: 'Flat Eggshell is our low sheen, super-tough finish for interior wood, metal and concrete. Scrubbable, stain-resistant and scuff-resistant, it’s even tough enough for floors and kitchen cabinets.',
    suitable: ['Interior Wood', 'Interior Metal & Radiators', 'Interior Concrete'],
    sizes: '750ml, 2.5L, 5L',
  },
  {
    id: 'modern-eggshell', group: 'wood', name: 'Modern Eggshell', desc: 'Hard-wearing for wood, metal & floors', sheen: 40,
    text: 'Modern Eggshell is our mid-sheen, super-tough finish adding lasting colour and protection to interior wood, metal and concrete. It’s even tough enough for floors and kitchen cabinets.',
    suitable: ['Interior Woodwork', 'Interior Furniture', 'Kitchen Cabinets', 'Interior Metal & Radiators', 'Interior Floors & Concrete'],
    sizes: '750ml, 2.5L, 5L',
  },
  {
    id: 'full-gloss', group: 'wood', name: 'Full Gloss', desc: 'High shine for wood & metal', sheen: 95,
    text: 'Full Gloss is an ultra-high-gloss water based finish suitable for both interior and exterior wood and metal, as well as bringing a touch of glamour to walls and ceilings. Our highest-shine finish, it’s resistant to water, flaking, peeling, and fading for up to six years.',
    suitable: ['Interior Walls & Ceilings', 'Interior & Exterior Woodwork', 'Interior & Exterior Metal, Including Radiators', 'Exterior Doors & Furniture'],
    sizes: '750ml, 2.5L',
  },
  {
    id: 'exterior-masonry', group: 'exterior', name: 'Exterior Masonry', desc: 'For exterior walls', sheen: 2,
    text: 'For brick, render and concrete, Exterior Masonry brings super matt, long-lasting colour to exterior walls. Its water-resistant formula protects walls, while also offering the highest level of water vapour permeability to allow them to breathe. Applied in line with our Product Advice Sheets, it resists flaking, peeling, and fading for up to 15 years.',
    suitable: ['Brickwork', 'Exterior Render', 'Exterior Concrete'],
  },
  {
    id: 'exterior-eggshell', group: 'exterior', name: 'Exterior Eggshell', desc: 'For exterior wood & metal', sheen: 20,
    text: 'Exterior Eggshell brings long-lasting, rich colour to exterior wood and metal. The low sheen finish remains flexible once dry, protecting wood and metal surfaces through changing weather, while preservatives help prevent the growth of algae and fungi. The resin-rich formula resists flaking, peeling, and fading for up to six years.',
    suitable: ['Exterior Woodwork', 'Window Frames & Shutters', 'Exterior Metal', 'Railings & Metal Guttering'],
    sizes: '750ml, 2.5L',
  },
];
// Every row shares one style (the user dropped Figma's per-row differences as a mistake).
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
  if (typeof updateTotal === 'function' && steppers) updateTotal();
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
      <button class="finish-info-toggle" type="button" aria-expanded="false" aria-controls="info-${f.id}"><span>Show info</span><img class="chev-lg" src="assets/icons/chevron-down.svg" width="24" height="24" alt=""><img class="chev-sm" src="assets/icons/chevron-down-16.svg" width="16" height="16" alt=""></button>
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
  // 24px chevron swaps to Figma's "up" asset; the 16px one (Exterior rows, mobile sheet) is flipped as in Figma
  btn.querySelector('.chev-lg').src = `assets/icons/chevron-${open ? 'up' : 'down'}.svg`;
  btn.querySelector('.chev-sm').style.transform = open ? 'rotate(180deg)' : '';
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
// Nothing is preselected. Add to Basket buttons stay clickable while empty (aria-disabled) so a press
// can show a tooltip asking for a quantity.
const QTY_TIP = 'Add a quantity to continue';
const tip = document.getElementById('tip');
let tipTimer;
function showTip(target, text) {
  tip.textContent = text;
  tip.hidden = false;
  const r = target.getBoundingClientRect();
  const w = tip.offsetWidth;
  const left = Math.min(Math.max(16, r.left + r.width / 2 - w / 2), innerWidth - 16 - w);
  tip.style.left = `${left}px`;
  tip.style.top = `${r.top - tip.offsetHeight - 10}px`;
  tip.style.setProperty('--arrow-x', `${r.left + r.width / 2 - left}px`);
  requestAnimationFrame(() => tip.classList.add('is-shown'));
  clearTimeout(tipTimer);
  tipTimer = setTimeout(hideTip, 2500);
}
function hideTip() {
  tip.classList.remove('is-shown');
  tip.hidden = true;
}
addEventListener('scroll', hideTip, { passive: true });
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
  addButton.setAttribute('aria-disabled', String(total === 0));
  if (total > 0) hideTip();
  updateBasketBar(total);
}

// Mobile sticky basket bar (Figma 151:2107): finish · sizes × qty, and the running total
const basketSummary = document.getElementById('m-basket-summary');
const basketTotal = document.getElementById('m-basket-total');
const basketAdd = document.getElementById('m-basket-add');
function updateBasketBar(total) {
  const parts = steppers
    .map((s) => [s.closest('.size-row').querySelector('.size-row__size').textContent, parseInt(s.querySelector('.stepper__value').value, 10) || 0])
    .filter(([, qty]) => qty > 0)
    .map(([size, qty]) => `${size} × ${qty}`);
  basketSummary.textContent = `${byId(currentFinish).name} · ${parts.length ? parts.join(', ') : 'Choose a pack size'}`;
  basketTotal.textContent = money(total);
  basketAdd.setAttribute('aria-disabled', String(total === 0));
}
basketAdd.addEventListener('click', () => {
  if (basketAdd.getAttribute('aria-disabled') === 'true') showTip(basketAdd, QTY_TIP);
  else addButton.click();
});

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

// ---------- Paint calculator drawer (Figma 274:603, notes 274:753) ----------
// Walls minus windows & doors, 1 coat. Tins are the cheapest mix of the PDP pack sizes that covers the area,
// read from the size rows (size, "Covers approx." m² and price), so the calculator follows the buy box.
const calc = document.getElementById('calc-drawer');
const calcRowTpl = document.getElementById('calc-row');
const calcLists = { wall: document.getElementById('calc-walls'), opening: document.getElementById('calc-openings') };
const calcNames = { wall: 'Wall', opening: 'Window or door' };
const calcArea = document.getElementById('calc-area');
const calcHint = document.getElementById('calc-hint');
const calcTins = document.getElementById('calc-tins');
const calcTotal = document.getElementById('calc-total');
const calcBuy = document.getElementById('calc-buy');
const packs = steppers.map((s) => {
  const row = s.closest('.size-row');
  return {
    stepper: s,
    size: row.querySelector('.size-row__size').textContent,
    covers: parseFloat(row.querySelector('.size-row__cover').textContent.match(/\d+(\.\d+)?/)[0]),
    price: Number(s.dataset.price),
  };
});
let calcUnit = 'm';
let calcLastFocus = null;
let calcTinQty = [];

const fmtArea = (a) => `${Number(a.toFixed(2))} m²`;
const toMetres = (v) => (calcUnit === 'cm' ? v / 100 : v);
const readDim = (input) => toMetres(parseFloat(input.value.replace(',', '.')) || 0);
const rowArea = (row) => readDim(row.querySelector('[data-dim="w"]')) * readDim(row.querySelector('[data-dim="h"]'));

// Cheapest pack mix with coverage >= area (ties go to fewer tins)
function cheapestMix(area) {
  const [small, ...rest] = [...packs].sort((a, b) => a.covers - b.covers);
  let best = null;
  const tryMix = (counts, covered, cost, i) => {
    if (i === rest.length) {
      const n = Math.max(0, Math.ceil((area - covered) / small.covers - 1e-9));
      const total = cost + n * small.price;
      const tins = n + counts.reduce((a, b) => a + b, 0);
      if (!best || total < best.total || (total === best.total && tins < best.tins)) best = { counts: [n, ...counts], total, tins };
      return;
    }
    const p = rest[i];
    for (let c = 0; c <= Math.ceil(area / p.covers); c++) tryMix([...counts, c], covered + c * p.covers, cost + c * p.price, i + 1);
  };
  tryMix([], 0, 0, 0);
  const order = [small, ...rest];
  return packs.map((p) => best.counts[order.indexOf(p)]);
}

function renderCalc() {
  let walls = 0;
  let openings = 0;
  Object.entries(calcLists).forEach(([kind, list]) => {
    list.querySelectorAll('.calc__row').forEach((row) => {
      const a = rowArea(row);
      row.querySelector('.calc__tag').textContent = fmtArea(a);
      if (kind === 'wall') walls += a; else openings += a;
    });
  });
  const area = Math.max(0, walls - openings);
  calcArea.textContent = fmtArea(area);
  calcArea.classList.toggle('has-value', area > 0);
  calcHint.textContent = area > 0 ? 'Based on 1 coat' : 'Add your walls to calculate';
  // Until something is measured, the pack sizes already chosen on the page are carried in
  calcTinQty = area > 0 ? cheapestMix(area) : packs.map((p) => parseInt(p.stepper.querySelector('.stepper__value').value, 10) || 0);
  let total = 0;
  calcTins.innerHTML = packs
    .map((p, i) => {
      const qty = calcTinQty[i];
      if (!qty) return '';
      total += qty * p.price;
      return `<div class="calc__tin"><span>${qty} × ${p.size}</span><span>${money(qty * p.price)}</span></div>`;
    })
    .join('');
  calcTotal.textContent = money(total);
  calcBuy.textContent = total > 0 ? `Add to Basket ${money(total)}` : 'Add to Basket';
  calcBuy.setAttribute('aria-disabled', String(total === 0));
}

function renumber(kind) {
  const rows = [...calcLists[kind].querySelectorAll('.calc__row')];
  rows.forEach((row, i) => {
    row.querySelector('.calc__row-name').textContent = `${calcNames[kind]} ${i + 1}`;
    row.querySelectorAll('input').forEach((input) => {
      input.setAttribute('aria-label', `${calcNames[kind]} ${i + 1} ${input.dataset.dim === 'w' ? 'width' : 'height'} in ${calcUnit}`);
    });
    row.querySelector('.calc__remove').setAttribute('aria-label', `Remove ${calcNames[kind].toLowerCase()} ${i + 1}`);
  });
}

function addCalcRow(kind, removable = true) {
  const row = calcRowTpl.content.firstElementChild.cloneNode(true);
  row.querySelectorAll('input').forEach((input) => {
    input.placeholder = calcUnit === 'cm' ? '0' : '0.00';
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^\d.,]/g, '');
      renderCalc();
    });
  });
  row.querySelectorAll('.calc__unit-label').forEach((u) => { u.textContent = calcUnit; });
  const remove = row.querySelector('.calc__remove');
  remove.hidden = !removable;
  remove.addEventListener('click', () => {
    row.remove();
    renumber(kind);
    renderCalc();
    calc.querySelector(`[data-add="${kind}"]`).focus();
  });
  calcLists[kind].appendChild(row);
  renumber(kind);
  return row;
}
addCalcRow('wall', false);

calc.querySelectorAll('[data-add]').forEach((btn) => {
  btn.addEventListener('click', () => {
    addCalcRow(btn.dataset.add).querySelector('input').focus();
    renderCalc();
  });
});

// m / cm applies to every field and converts what's already entered
const unitBtns = [...calc.querySelectorAll('.calc__unit')];
singleSelect(unitBtns, (btn) => {
  if (btn.dataset.unit === calcUnit) return;
  const factor = btn.dataset.unit === 'cm' ? 100 : 0.01;
  calcUnit = btn.dataset.unit;
  calc.querySelectorAll('.calc__row input').forEach((input) => {
    input.placeholder = calcUnit === 'cm' ? '0' : '0.00';
    if (input.value.trim() === '') return;
    const v = (parseFloat(input.value.replace(',', '.')) || 0) * factor;
    input.value = calcUnit === 'cm' ? String(Number(v.toFixed(1))) : v.toFixed(2);
  });
  calc.querySelectorAll('.calc__unit-label').forEach((u) => { u.textContent = calcUnit; });
  Object.keys(calcLists).forEach(renumber);
  renderCalc();
});

function openCalc() {
  calcLastFocus = document.activeElement;
  renderCalc();
  calc.inert = false;
  calc.setAttribute('aria-hidden', 'false');
  calc.classList.add('is-open');
  document.body.classList.add('drawer-open');
  // Figma's "on open" state has Wall 1's width focused; on phones that would pop the keyboard, so focus the panel
  const target = matchMedia('(min-width: 768px)').matches ? calcLists.wall.querySelector('input') : calc.querySelector('.drawer__panel');
  target.focus({ preventScroll: true });
}
function closeCalc() {
  calc.classList.remove('is-open');
  calc.setAttribute('aria-hidden', 'true');
  calc.inert = true;
  document.body.classList.remove('drawer-open');
  if (calcLastFocus) calcLastFocus.focus({ preventScroll: true });
}
document.querySelectorAll('[data-open-calc]').forEach((b) => b.addEventListener('click', openCalc));
calc.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeCalc));
// Add to Basket puts the listed tins in the buy box and closes the drawer
calcBuy.addEventListener('click', () => {
  if (calcBuy.getAttribute('aria-disabled') === 'true') { showTip(calcBuy, 'Add your walls to work out the tins'); return; }
  packs.forEach((p, i) => { p.stepper.querySelector('.stepper__value').value = calcTinQty[i]; });
  updateTotal();
  closeCalc();
});
calc.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeCalc(); return; }
  if (e.key !== 'Tab') return;
  const focusable = [...calc.querySelectorAll('button, a[href], input')].filter((b) => !b.disabled && b.offsetParent);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
// index.html#calculator opens the calculator straight away
if (location.hash === '#calculator') openCalc();

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
  const goTo = (i, scroll = true) => {
    index = Math.max(0, Math.min(cards.length - 1, i));
    if (scroll) track.scrollTo({ left: cards[index].offsetLeft - track.offsetLeft });
    counter.textContent = index + 1;
    const travel = bar.parentElement.clientWidth - bar.offsetWidth;
    bar.style.transform = `translateX(${(travel * index) / Math.max(1, cards.length - 1)}px)`;
    prev.disabled = index === 0;
    next.disabled = index === cards.length - 1;
  };
  prev.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));
  goTo(0, false);
});

// ---------- Mobile only (Figma 147:585) ----------
const mobile = window.matchMedia('(max-width: 767px)');

// "Read more" under the description: clamped to six lines on mobile (CSS only clamps below 768px)
const descBody = document.querySelector('.pdp-desc__body');
const readMore = document.querySelector('.m-readmore');
descBody.classList.add('is-clamped');
readMore.addEventListener('click', () => {
  const open = descBody.classList.toggle('is-clamped') === false;
  readMore.setAttribute('aria-expanded', String(open));
  readMore.textContent = open ? 'Read less' : 'Read more';
});

// Hero gallery swipe: counter on the first slide and the pager follow the scroll position
const mGallery = document.getElementById('m-gallery');
const mSlides = [...mGallery.children];
const mDots = [...document.querySelectorAll('#m-pager i')];
const mIndex = document.getElementById('m-gallery-index');
mGallery.addEventListener('scroll', () => {
  const step = mSlides[1].offsetLeft - mSlides[0].offsetLeft;
  const i = Math.min(mSlides.length - 1, Math.round(mGallery.scrollLeft / step));
  mDots.forEach((d, n) => d.classList.toggle('is-active', n === i));
  mIndex.textContent = i + 1;
}, { passive: true });

// Sticky compact header and basket bar (Figma 151:1423)
const stickyHeader = document.querySelector('.m-sticky-header');
const mHeader = document.querySelector('.m-header');
const basketBar = document.getElementById('m-basket-bar');
function setVisible(el, on) {
  el.classList.toggle('is-visible', on);
  el.setAttribute('aria-hidden', String(!on));
  el.querySelectorAll('button').forEach((b) => { b.tabIndex = on ? 0 : -1; });
}
function updateSticky() {
  if (!mobile.matches) { setVisible(stickyHeader, false); setVisible(basketBar, false); return; }
  setVisible(stickyHeader, mHeader.getBoundingClientRect().bottom < 0);
  setVisible(basketBar, addButton.getBoundingClientRect().bottom < 0);
}
window.addEventListener('scroll', updateSticky, { passive: true });
mobile.addEventListener('change', updateSticky);
updateSticky();

// ---------- Prototype notice (Figma 281:603 / 283:606) ----------
// Anything that looks clickable but isn't designed in this preview (href="#" links, [data-proto] buttons,
// chapters without copy, the buy box's Add to Basket) opens the notice instead of doing nothing.
const notice = document.getElementById('proto-notice');
let noticeLastFocus = null;
function openNotice() {
  noticeLastFocus = document.activeElement;
  notice.inert = false;
  notice.setAttribute('aria-hidden', 'false');
  notice.classList.add('is-open');
  document.body.classList.add('notice-open');
  notice.querySelector('.notice__back').focus({ preventScroll: true });
}
function closeNotice() {
  notice.classList.remove('is-open');
  notice.setAttribute('aria-hidden', 'true');
  notice.inert = true;
  document.body.classList.remove('notice-open');
  if (noticeLastFocus) noticeLastFocus.focus({ preventScroll: true });
}
notice.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeNotice));
notice.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeNotice(); return; }
  if (e.key !== 'Tab') return;
  const focusable = [...notice.querySelectorAll('button')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
document.addEventListener('click', (e) => {
  const el = e.target.closest('a[href="#"], [data-proto], .chapter__head:not([aria-controls])');
  if (!el) return;
  e.preventDefault();
  openNotice();
});
// Adding to the basket isn't part of the preview either (the mobile basket bar clicks this same button)
addButton.closest('form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (addButton.getAttribute('aria-disabled') === 'true') showTip(addButton, QTY_TIP);
  else openNotice();
});
