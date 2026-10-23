// Interactions for the PDP: gallery + gallery popup, finish choice + finish drawer, Key features chips + panel, quantity steppers,
// paint calculator, primer picker, favourite, chapters accordion, carousels, sticky strip, prototype notice and the
// colour preview switcher.

const money = (n) => `£${n.toFixed(2)}`;
const esc = (s) => s.replace(/&/g, '&amp;');
const mobile = window.matchMedia('(max-width: 767px)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Overlays (finish drawer, calculator, gallery popup, prototype notice) open and close the same way: inert while
// closed, the body stops scrolling while open, and focus goes back to where it was on close. The body class differs
// (drawer-open / notice-open) because the notice can open on top of a drawer and must not release the drawer's lock.
const returnFocus = new WeakMap();
function openOverlay(el, bodyClass, target) {
  returnFocus.set(el, document.activeElement);
  el.inert = false;
  el.setAttribute('aria-hidden', 'false');
  el.classList.add('is-open');
  document.body.classList.add(bodyClass);
  target.focus({ preventScroll: true });
}
function closeOverlay(el, bodyClass) {
  el.classList.remove('is-open');
  el.setAttribute('aria-hidden', 'true');
  el.inert = true;
  document.body.classList.remove(bodyClass);
  const back = returnFocus.get(el);
  if (back) back.focus({ preventScroll: true });
}
// Keeps Tab inside an open overlay: wraps from its last focusable control to the first and back
function trapTab(e, el, selector) {
  const focusable = [...el.querySelectorAll(selector)].filter((f) => !f.disabled && f.tabIndex !== -1 && f.offsetParent);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

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

// ---------- Finishes (order card, Key features 363:991, drawer 124:578) ----------
// Copy: Estate Emulsion text from the live finish page, Modern Emulsion from the Figma file; the other finishes' info, "Suitable for" lists and
// sizes from the live farrow-ball.com/paint/incarnadine finish selector.
const FINISHES = [
  {
    id: 'estate-emulsion', group: 'walls', name: 'Estate Emulsion', desc: 'Chalky matt for walls & ceilings', sheen: 2,
    text: 'Estate Emulsion is a classic choice for low-traffic interior walls and ceilings. Very matt with a distinctive, chalky finish, it minimises imperfections and creates a beautiful depth of colour.',
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
const byId = (id) => FINISHES.find((f) => f.id === id);
// "Chalky matt for walls & ceilings" -> look "Chalky matt"
const lookOf = (f) => (/^for /i.test(f.desc) ? f.desc : f.desc.split(' for ')[0]);

let currentFinish = 'estate-emulsion';
const finishCards = [...document.querySelectorAll('.finish-card')];

// ---------- Key features chips (Figma 363:991) and their panel (363:1058) ----------
// Finish features and descriptions as listed on the live farrow-ball.com/paint/incarnadine/<finish> pages (2026-10-23).
// Estate Emulsion's first chip carries its sheen, as drawn.
const FINISH_FEATURES = {
  'estate-emulsion': { features: ['Very matt, 2% sheen', 'Classic, chalky look', 'For walls and ceilings in low-traffic areas', 'Water based', 'Toy safe'] },
  'modern-emulsion': {
    about: 'Modern Emulsion is our super-tough, easy to clean finish for interior walls and ceilings. Washable and protected against mould, it’s the best choice for kitchens and bathrooms.',
    features: ['Matt', 'For interior walls and ceilings', 'Best choice for kitchens and bathrooms', 'Tough and easy-to-clean', 'Water based', 'Toy safe'],
  },
  'dead-flat': {
    about: 'Dead Flat is our multi-surface, ultra-matt finish with added toughness. Suitable for walls, it’s ideal for colour drenching. The flat matt look creates richer colour from every angle, while the washable, scuff-resistant finish is more than a match for mess, perfect for hallways, playrooms and other high-traffic areas.',
    features: ['Our most matt finish', 'Multi-surface', 'For walls, interior wood and metal', 'Scrubbable and protected against mould', 'Water based', 'Toy safe'],
  },
  'casein-distemper': {
    about: 'Casein Distemper offers a very flat matt finish with a breathable, permeable structure.',
    features: ['Very matt', 'For interior lime-based plaster', 'Highly breathable', 'Water based'],
  },
  'flat-eggshell': { features: ['Our flattest interior eggshell', 'For interior wood, metal and concrete', 'Tough enough for floors', 'A classic choice', 'Water based', 'Toy safe'] },
  'modern-eggshell': {
    about: 'Modern Eggshell is our toughest interior finish, adding lasting colour and protection to interior wood, metal and concrete.',
    features: ['Mid sheen', 'For interior wood, metal and concrete', 'Tough enough for floors', 'Our most durable finish', 'Water based', 'Toy safe'],
  },
  'full-gloss': { features: ['Our highest shine finish', 'For interior and exterior wood and metal', 'Durable and washable', 'Lasts up to 6 years outside', 'Water based', 'Toy safe'] },
  'exterior-masonry': {
    about: 'Exterior Masonry is our super-matt, long-lasting finish for exterior walls with a 2% sheen.',
    features: ['Very matt', 'For exterior brick and render', 'Weather resistant and breathable', 'Protected from fungi and algae', 'Lasts up to 15 years', 'Water based', 'Toy safe'],
  },
  'exterior-eggshell': { features: ['Low sheen', 'For exterior wood and metal', 'Weather resistant and flexible', 'Protected from fungi and algae', 'Lasts up to 6 years', 'Water based', 'Toy safe'] },
};
// Icon by what the feature is about (Tabler, 20px)
const featureIcon = (label) => {
  const l = label.toLowerCase();
  if (l.includes('water based')) return 'droplet';
  if (l.includes('toy safe')) return 'horse-toy';
  if (/matt|sheen|shine|flattest/.test(l)) return 'sun';
  if (/chalky|classic|multi-surface/.test(l)) return 'brush';
  if (/^for |best choice/.test(l)) return 'home';
  if (/breathable/.test(l)) return 'wind';
  if (/protected|resistant/.test(l)) return 'shield';
  return 'sparkles';
};
const featureKey = (label) => label.toLowerCase().replace(/,.*$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Panel copy and photos from the live key feature drawers on farrow-ball.com/paint/incarnadine/<finish> (2026-10-23).
// Photos are copied into assets/img/kf. Where the live drawer has a video, its poster frame stands in (video: true)
// with a play button; it doesn't play in this preview.
const KF_LIVE = {
 "colour": {
  "depth": {
   "intro": [
    "Packed with pigment for an extraordinary response to every kind of light.",
    "We add generous helpings of rich pigment to create our signature look – deep colours with complex undertones. The same space that feels bright and airy in morning sun, can feel cosy and intimate by evening. Our teams design each shade under every kind of light, so it will be perfectly balanced in every setting."
   ],
   "text": [],
   "img": "assets/img/kf/KF-deeper-richer-colours.jpg"
  },
  "supply": {
   "intro": [
    "Making the very best paint and paper possible starts well before the factory. That’s why we’re meticulous about who we work with. From sourcing raw materials to delivery, all of our suppliers have to follow our strict Code of Conduct.",
    "Being a manufacturer puts us in a privileged position: we know exactly what goes into our products and exactly where it comes from, all the way back to raw materials. Not all paint brands make paint from scratch, they buy a base paint and add a colour tint. These brands are one step further away from the process and have to try and investigate how their suppliers’ suppliers behave."
   ],
   "text": [],
   "img": "assets/img/kf/Aerial-image.jpg"
  },
  "water-a": {
   "intro": [
    "We’re proud to have been the first in the industry to transition to a completely water based range back in 2010. As a result, all of our finishes, including our tough trim and floor paints, are made with a low-odour, low-VOC water base that scores A+ for indoor air quality.",
    "Plus, our water based paint doesn’t discolour over time like solvent based paints can. So your spaces stay beautiful for longer."
   ],
   "text": [],
   "img": "assets/img/kf/Key_features_air_quality_1.jpg"
  },
  "scrub": {
   "intro": [],
   "text": [
    "For more information on individual finishes and their scrub ratings please see our product advice sheets.",
    "*Excludes Estate Emulsion, Exterior Masonry, Soft Distemper, Casein Distemper & Limewash."
   ],
   "img": "assets/img/kf/Key-features-scrub.jpg"
  },
  "surfaces": {
   "intro": [
    "From walls, floors and furniture to radiators, skirtings and sheds, our range of paint finishes can help you transform almost any surface in your home (and outside it, too)."
   ],
   "text": [
    "We even have multi-surface finishes like Dead Flat and Full Gloss, so you can tackle walls, woodwork and metal at the same time.",
    "Our comprehensive range is comprised of paint finishes that not only look beautiful, but offer different practical benefits. Designed for a variety of different surfaces, each finish is compatible with our high-performance Primers & Undercoats to ensure exceptional coverage, adhesion and depth of colour."
   ],
   "img": "assets/img/kf/KF-PDP-int-exterior-finishes_1_.jpg"
  }
 },
 "finish": {
  "estate-emulsion": {
   "Very matt": {
    "intro": [
     "Estate Emulsion is a very matt finish with a chalky 2% sheen."
    ],
    "text": [
     "Our deeper, richer colours are available in a range of finishes with different sheen levels. Sheen always affects how colour appears: the same shade in gloss can look very different in matt. That’s why we specifically adjust the formula for every finish to make sure the balance is exactly right and you get the colour you were expecting. Our colours and finishes are formulated together, so you simply can’t have one without the other."
    ],
    "img": "assets/img/kf/KF-EEM-very-matt_1_.jpeg"
   },
   "Classic, chalky look": {
    "intro": [
     "A true classic, Estate Emulsion is a distinctive, chalky finish that minimises imperfections and creates beautiful depth of colour. Due to this unique texture, it’s best suited to less-busy areas without a lot of traffic."
    ],
    "text": [],
    "img": "assets/img/kf/KF-EEM-chalky-look_1_.jpeg"
   },
   "For walls and ceilings in low-traffic areas": {
    "intro": [
     "Estate Emulsion is our classic finish for interior walls and ceilings in low-traffic areas. Gently wipeable but not washable."
    ],
    "text": [
     "From walls, floors and furniture to radiators, skirtings and sheds, our range of paint finishes can help you transform almost any surface in your home (and outside it, too). Browse our full selection of finishes to find the perfect paint for your project."
    ],
    "img": "assets/img/kf/KF-EEM-wallsandceilings-small.jpg"
   },
   "Water based": {
    "intro": [
     "We’re proud to have been the first in the industry to transition to a completely water based range back in 2010. As a result, all of our finishes, including our tough trim and floor paints, are made with a low-odour, low-VOC water base that scores A+ for indoor air quality.",
     "Plus, our water based paint doesn’t discolour over time like solvent based paints can. So your spaces stay beautiful for longer."
    ],
    "text": []
   },
   "Toy safe": {
    "intro": [
     "This finish is independently tested and certified toy-safe in accordance with Safety of Toys Part 3: Migration of certain elements (EN 71-3:2019+A1:2021). That means you can add a splash of colour to toys, cribs and other surfaces little ones come into contact with. Our paints also have hardly any odour and don’t need any solvents to clean up, so you can breathe easy during application and beyond."
    ],
    "text": [],
    "img": "assets/img/kf/KF-toy-safe_4.jpg"
   }
  },
  "modern-emulsion": {
   "Matt": {
    "intro": [
     "Modern Emulsion is a beautiful, durable matt finish with 7% sheen."
    ],
    "text": [
     "Our deeper, richer colours are available in a range of finishes with different sheen levels. Sheen always affects how colour appears: the same shade in gloss can look very different in matt. That’s why we specifically adjust the formula for every finish to make sure the balance is exactly right and you get the colour you were expecting. Our colours and finishes are formulated together, so you simply can’t have one without the other."
    ],
    "img": "assets/img/kf/KF-MEM-Matt2_1__1.jpeg"
   },
   "For interior walls and ceilings": {
    "intro": [
     "Modern Emulsion is our super-tough, matt finish for interior walls and ceilings."
    ],
    "text": [
     "From walls, floors and furniture to radiators, skirtings and sheds, our range of paint finishes can help you transform almost any surface in your home (and outside it, too). Browse our full selection of finishes to find the perfect paint for your project."
    ],
    "img": "assets/img/kf/KF-MEM-walls-ceilings.jpg"
   },
   "Best choice for kitchens and bathrooms": {
    "intro": [
     "Our expert chemists add a preservative to Modern Emulsion that protects it from mould, keeping moisture-prone kitchens and bathrooms looking fresh. So, although it makes a wonderful addition to every room of your home, it’s the best finish option for these steamy spaces in particular."
    ],
    "text": [],
    "img": "assets/img/kf/KF-MEM-Kitchens-Bathrooms_1_.jpeg"
   },
   "Tough and easy-to-clean": {
    "intro": [
     "Our super-tough superstar for washable walls, Modern Emulsion has a high-performance formula that makes it easy to wipe away spills and marks – not paint. We use high-quality minerals and strong binders to make sure it’s also resistant to knocks and scrapes."
    ],
    "text": [],
    "img": "assets/img/kf/video-youtube-3T6zIYMQ6OY.jpg",
    "video": true
   },
   "Water based": {
    "intro": [
     "We’re proud to have been the first in the industry to transition to a completely water based range back in 2010. As a result, all of our finishes, including our tough trim and floor paints, are made with a low-odour, low-VOC water base that scores A+ for indoor air quality.",
     "Plus, our water based paint doesn’t discolour over time like solvent based paints can. So your spaces stay beautiful for longer."
    ],
    "text": []
   },
   "Toy safe": {
    "intro": [
     "This finish is independently tested and certified toy-safe in accordance with Safety of Toys Part 3: Migration of certain elements (EN 71-3:2019+A1:2021). That means you can add a splash of colour to toys, cribs and other surfaces little ones come into contact with. Our paints also have hardly any odour and don’t need any solvents to clean up, so you can breathe easy during application and beyond."
    ],
    "text": [],
    "img": "assets/img/kf/KF-toy-safe_5.jpg"
   }
  },
  "dead-flat": {
   "Our most matt finish": {
    "intro": [
     "Our most matt finish yet, Dead Flat is ultra-matt from every angle.",
     "With just a 2% sheen level, less light bounces off the surface of the paint, so you can fully enjoy the true depth of colour. Our signature rich colours seem even richer, especially our darker shades. So, you can enjoy the ultimate Farrow & Ball aesthetic. Plus, for the first time, you can achieve an ultra-matt look for your woodwork too."
    ],
    "text": [
     "Our deeper, richer colours are available in a range of finishes with different sheen levels. Sheen always affects how colour appears: the same shade in gloss can look very different in matt. That’s why we specifically adjust the formula for every finish to make sure the balance is exactly right and you get the colour you were expecting. Our colours and finishes are formulated together, so you simply can’t have one without the other."
    ],
    "img": "assets/img/kf/video-vimeo-809114751.jpg",
    "video": true
   },
   "Multi-surface": {
    "intro": [
     "Take Dead Flat across walls, woodwork and metal, for an effortless, full-room transformation with just one finish. Now you can spend less time fiddling with different finishes and more time admiring the finished result."
    ],
    "text": [],
    "img": "assets/img/kf/video-vimeo-809114804.jpg",
    "video": true
   },
   "For walls, interior wood and metal": {
    "intro": [
     "Suitable for use on walls, interior wood and metal."
    ],
    "text": [
     "From walls, floors and furniture to radiators, skirtings and sheds, our range of paint finishes can help you transform almost any surface in your home (and outside it, too). Browse our full selection of finishes to find the perfect paint for your project."
    ],
    "img": "assets/img/kf/video-vimeo-805568116.jpg",
    "video": true
   },
   "Scrubbable and protected against mould": {
    "intro": [
     "Dead Flat creates beautiful spaces that stay beautiful."
    ],
    "text": [
     "It’s scuff-resistant and scrubbable, meaning you can easily wipe off marks without any paint transferring to your cloth. Protected against mould, Dead Flat is ideal for moisture-prone spaces such as kitchens and bathrooms, as well as a hallways, playrooms and other busy areas, so you can enjoy deep, durable colour throughout your home."
    ],
    "img": "assets/img/kf/video-vimeo-809114777.jpg",
    "video": true
   },
   "Water based": {
    "intro": [
     "We’re proud to have been the first in the industry to transition to a completely water based range back in 2010. As a result, all of our finishes, including our tough trim and floor paints, are made with a low-odour, low-VOC water base that scores A+ for indoor air quality.",
     "Plus, our water based paint doesn’t discolour over time like solvent based paints can. So your spaces stay beautiful for longer."
    ],
    "text": []
   },
   "Toy safe": {
    "intro": [
     "This finish is independently tested and certified toy-safe in accordance with Safety of Toys Part 3: Migration of certain elements (EN 71-3:2019+A1:2021). That means you can add a splash of colour to toys, cribs and other surfaces little ones come into contact with. Our paints also have hardly any odour and don’t need any solvents to clean up, so you can breathe easy during application and beyond."
    ],
    "text": [],
    "img": "assets/img/kf/KF-toy-safe_6.jpg"
   }
  },
  "casein-distemper": {
   "Very matt": {
    "intro": [
     "Casein Distemper offers a very flat matt finish with a breathable, permeable structure. 2% sheen."
    ],
    "text": [
     "Our deeper, richer colours are available in a range of finishes with different sheen levels. Sheen always affects how colour appears: the same shade in gloss can look very different in matt. That’s why we specifically adjust the formula for every finish to make sure the balance is exactly right and you get the colour you were expecting. Our colours and finishes are formulated together, so you simply can’t have one without the other."
    ],
    "img": "assets/img/kf/KF-CAS-Verymatt_1_.jpeg"
   },
   "For interior lime-based plaster": {
    "intro": [
     "A traditional specialist finish formulated for use on interior lime-based plaster walls and ceilings in low traffic areas."
    ],
    "text": [
     "From walls, floors and furniture to radiators, skirtings and sheds, our range of paint finishes can help you transform almost any surface in your home (and outside it, too). Browse our full selection of finishes to find the perfect paint for your project."
    ],
    "img": "assets/img/kf/KF-CAS-lime-based-plaster-small.jpg"
   },
   "Highly breathable": {
    "intro": [
     "Carefully sourced casein resins with unique open polymers let moisture pass through this flat matt finish, allowing interior plaster walls and ceiling to breathe."
    ],
    "text": [],
    "img": "assets/img/kf/KF-CAS-Highly-breathable-small.jpg"
   },
   "Water based": {
    "intro": [
     "We’re proud to have been the first in the industry to transition to a completely water based range back in 2010. As a result, all of our finishes, including our tough trim and floor paints, are made with a low-odour, low-VOC water base that scores A+ for indoor air quality.",
     "Plus, our water based paint doesn’t discolour over time like solvent based paints can. So your spaces stay beautiful for longer."
    ],
    "text": []
   }
  },
  "flat-eggshell": {
   "Our flattest interior eggshell": {
    "intro": [
     "With just a 20% sheen, Flat Eggshell makes an understated statement on skirting boards, stairs and more."
    ],
    "text": [
     "Our deeper, richer colours are available in a range of finishes with different sheen levels. Sheen always affects how colour appears: the same shade in gloss can look very different in matt. That’s why we specifically adjust the formula for every finish to make sure the balance is exactly right and you get the colour you were expecting. Our colours and finishes are formulated together, so you simply can’t have one without the other."
    ],
    "img": "assets/img/kf/226MEM_FEG_56FEG.jpg"
   },
   "Tough enough for floors": {
    "intro": [
     "Flat Eggshell is scrubbable, stain resistant and even tough enough for floors. With this super tough finish, you can decorate when you want to, not because you have to."
    ],
    "text": [
     "From walls, floors and furniture to radiators, skirtings and sheds, our range of paint finishes can help you transform almost any surface in your home (and outside it, too). Browse our full selection of finishes to find the perfect paint for your project."
    ],
    "img": "assets/img/kf/2005MEM_318FEG.jpg"
   },
   "A classic choice": {
    "intro": [
     "Flat Eggshell brings a timeless look to skirting boards, door frames, windowsills and other trim. The long-lasting formula won’t yellow over time, so your transformation will stay picture perfect for years to come."
    ],
    "text": [],
    "img": "assets/img/kf/317FEG_314FEG.jpg"
   },
   "Water based": {
    "intro": [
     "We’re proud to have been the first in the industry to transition to a completely water based range back in 2010. As a result, all of our finishes, including our tough trim and floor paints, are made with a low-odour, low-VOC water base that scores A+ for indoor air quality.",
     "Plus, our water based paint doesn’t discolour over time like solvent based paints can. So your spaces stay beautiful for longer."
    ],
    "text": []
   },
   "Toy safe": {
    "intro": [
     "This finish is independently tested and certified toy-safe in accordance with Safety of Toys Part 3: Migration of certain elements (EN 71-3:2019+A1:2021). That means you can add a splash of colour to toys, cribs and other surfaces little ones come into contact with. Our paints also have hardly any odour and don’t need any solvents to clean up, so you can breathe easy during application and beyond."
    ],
    "text": [],
    "img": "assets/img/kf/KF-toy-safe_7.jpg"
   }
  },
  "modern-eggshell": {
   "Mid sheen": {
    "intro": [
     "Our super-tough mid shine finish with a 40% sheen."
    ],
    "text": [
     "Our deeper, richer colours are available in a range of finishes with different sheen levels. Sheen always affects how colour appears: the same shade in gloss can look very different in matt. That’s why we specifically adjust the formula for every finish to make sure the balance is exactly right and you get the colour you were expecting. Our colours and finishes are formulated together, so you simply can’t have one without the other."
    ],
    "img": "assets/img/kf/KF-MEG-Midsheen-small.jpg"
   },
   "Tough enough for floors": {
    "intro": [
     "This ultra-durable eggshell is even tough enough for interior wooden and concrete floors."
    ],
    "text": [
     "From walls, floors and furniture to radiators, skirtings and sheds, our range of paint finishes can help you transform almost any surface in your home (and outside it, too). Browse our full selection of finishes to find the perfect paint for your project."
    ],
    "img": "assets/img/kf/KF-MEG-Floors-small.jpg"
   },
   "Our most durable finish": {
    "intro": [
     "Modern Eggshell is our toughest finish — it’s even suitable for floors. Formulated by our experts using the finest ingredients, it’s washable, wipeable and stands up to scuffs or scrapes."
    ],
    "text": [],
    "img": "assets/img/kf/KF-MEG-toughest-finish.jpg"
   },
   "Water based": {
    "intro": [
     "We’re proud to have been the first in the industry to transition to a completely water based range back in 2010. As a result, all of our finishes, including our tough trim and floor paints, are made with a low-odour, low-VOC water base that scores A+ for indoor air quality.",
     "Plus, our water based paint doesn’t discolour over time like solvent based paints can. So your spaces stay beautiful for longer."
    ],
    "text": []
   },
   "Toy safe": {
    "intro": [
     "This finish is independently tested and certified toy-safe in accordance with Safety of Toys Part 3: Migration of certain elements (EN 71-3:2019+A1:2021). That means you can add a splash of colour to toys, cribs and other surfaces little ones come into contact with. Our paints also have hardly any odour and don’t need any solvents to clean up, so you can breathe easy during application and beyond."
    ],
    "text": [],
    "img": "assets/img/kf/KF-toy-safe_7.jpg"
   }
  },
  "full-gloss": {
   "Our highest shine finish": {
    "intro": [
     "Our Ultra-high-gloss finish with 95% sheen is available in our full range of colours."
    ],
    "text": [
     "Photo credit; Aaron Dougherty",
     "Our deeper, richer colours are available in a range of finishes with different sheen levels. Sheen always affects how colour appears: the same shade in gloss can look very different in matt. That’s why we specifically adjust the formula for every finish to make sure the balance is exactly right and you get the colour you were expecting. Our colours and finishes are formulated together, so you simply can’t have one without the other."
    ],
    "img": "assets/img/kf/KF-FG-highest-shine-small.jpg"
   },
   "For interior and exterior wood and metal": {
    "intro": [
     "Full Gloss is an ultra-high-gloss water based finish suitable for use on both interior and exterior surfaces. It is mostly used on wood and metal trim, but it can also bring a touch of glamour to walls and ceilings, and is a popular choice for front doors."
    ],
    "text": [
     "From walls, floors and furniture to radiators, skirtings and sheds, our range of paint finishes can help you transform almost any surface in your home (and outside it, too). Browse our full selection of finishes to find the perfect paint for your project."
    ],
    "img": "assets/img/kf/KF-FG-interior-exterior-wood-small.jpg"
   },
   "Durable and washable": {
    "intro": [
     "Full Gloss is a durable, washable finish so you can easily wipe away spills and marks – without wiping away paint. We use high-quality minerals and strong binders to make sure it’s also resistant to knocks and scrapes."
    ],
    "text": [],
    "img": "assets/img/kf/KF-FG-washable-durable.jpg"
   },
   "Lasts up to 6 years outside": {
    "intro": [
     "When applied according to our Product Advice Sheets, the resin-rich formula resists flaking, peeling and fading for up to six years. So, your exterior stays beautiful, no matter the weather."
    ],
    "text": [
     "Photo credit; F&B X Collagerie"
    ],
    "img": "assets/img/kf/KF-FG-Lasts-6years-small.jpg"
   },
   "Water based": {
    "intro": [
     "We’re proud to have been the first in the industry to transition to a completely water based range back in 2010. As a result, all of our finishes, including our tough trim and floor paints, are made with a low-odour, low-VOC water base that scores A+ for indoor air quality.",
     "Plus, our water based paint doesn’t discolour over time like solvent based paints can. So your spaces stay beautiful for longer."
    ],
    "text": []
   },
   "Toy safe": {
    "intro": [
     "This finish is independently tested and certified toy-safe in accordance with Safety of Toys Part 3: Migration of certain elements (EN 71-3:2019+A1:2021). That means you can add a splash of colour to toys, cribs and other surfaces little ones come into contact with. Our paints also have hardly any odour and don’t need any solvents to clean up, so you can breathe easy during application and beyond."
    ],
    "text": [],
    "img": "assets/img/kf/KF-toy-safe_3.jpg"
   }
  },
  "exterior-masonry": {
   "Very matt": {
    "intro": [
     "Exterior Masonry is our super-matt, long-lasting finish for exterior walls with a 2% sheen."
    ],
    "text": [
     "Our deeper, richer colours are available in a range of finishes with different sheen levels. Sheen always affects how colour appears: the same shade in gloss can look very different in matt. That’s why we specifically adjust the formula for every finish to make sure the balance is exactly right and you get the colour you were expecting. Our colours and finishes are formulated together, so you simply can’t have one without the other"
    ],
    "img": "assets/img/kf/KF-EXM-verymatt-small.jpg"
   },
   "For exterior brick and render": {
    "intro": [
     "For exterior brick, render and concrete, Exterior Masonry brings super matt, long-lasting colour to exterior walls. Its water-resistant formula protects walls, while also offering the highest level of water vapour permeability to allow them to breathe."
    ],
    "text": [],
    "img": "assets/img/kf/KF-EXM-exterior-brick-render-small.jpg"
   },
   "Weather resistant and breathable": {
    "intro": [
     "The water-resistant formula protects walls from the weather, while also offering the highest level of water vapour permeability to allow them to breathe. So, you can transform your exterior with colour that lasts."
    ],
    "text": [],
    "img": "assets/img/kf/KF-EXM-weatherresistant-breathable-small.jpg"
   },
   "Protected from fungi and algae": {
    "intro": [
     "Our expert chemists have formulated Exterior Masonry with added protection against fungi and algae, so your outdoor spaces stay looking their best."
    ],
    "text": [],
    "img": "assets/img/kf/KF-EXM-fungi-protected-small.jpg"
   },
   "Lasts up to 15 years": {
    "intro": [
     "When applied according to our Product Advice Sheets, the resin-rich formula resists flaking, peeling and fading for up to 15 years. So, your exterior stays beautiful, no matter the weather."
    ],
    "text": [],
    "img": "assets/img/kf/KF-EXM-Lasts-15years_1_.jpg"
   },
   "Water based": {
    "intro": [
     "We’re proud to have been the first in the industry to transition to a completely water based range back in 2010. As a result, all of our finishes, including our tough trim and floor paints, are made with a low-odour, low-VOC water base that scores A+ for indoor air quality.",
     "Plus, our water based paint doesn’t discolour over time like solvent based paints can. So your spaces stay beautiful for longer."
    ],
    "text": []
   },
   "Toy safe": {
    "intro": [
     "This finish is independently tested and certified toy-safe in accordance with Safety of Toys Part 3: Migration of certain elements (EN 71-3:2019+A1:2021). That means you can add a splash of colour to toys, cribs and other surfaces little ones come into contact with. Our paints also have hardly any odour and don’t need any solvents to clean up, so you can breathe easy during application and beyond."
    ],
    "text": [],
    "img": "assets/img/kf/KF-toy-safe_1.jpg"
   }
  },
  "exterior-eggshell": {
   "Low sheen": {
    "intro": [
     "The soft, low sheen satin finish of our Exterior Eggshell brings long-lasting colour to outdoor spaces. 20% sheen."
    ],
    "text": [
     "Our deeper, richer colours are available in a range of finishes with different sheen levels. Sheen always affects how colour appears: the same shade in gloss can look very different in matt. That’s why we specifically adjust the formula for every finish to make sure the balance is exactly right and you get the colour you were expecting. Our colours and finishes are formulated together, so you simply can’t have one without the other."
    ],
    "img": "assets/img/kf/KF-EXE-low-sheen-small.jpg"
   },
   "For exterior wood and metal": {
    "intro": [
     "Suitable for exterior wood and metal, our Exterior Eggshell brings long-lasting colour to outdoor spaces with a finish that remains flexible once dry, protecting wood and metal surfaces through changing weather. Added preservatives help to prevent the growth of algae and fungi, and the resin-rich formula resists flaking, peeling, and fading for up to six years."
    ],
    "text": [
     "From walls, floors and furniture to radiators, skirtings and sheds, our range of paint finishes can help you transform almost any surface in your home (and outside it, too). Browse our full selection of finishes to find the perfect paint for your project."
    ],
    "img": "assets/img/kf/KF-EXE-Exteriorwood-metal-small.jpg"
   },
   "Weather resistant and flexible": {
    "intro": [
     "This finish has been carefully designed to be water resistant and stay flexible once dry, protecting wood and metal surfaces through changing weather. At the same time, it also offers the highest level of water vapour permeability to allow them to breathe. So, you can transform your exterior with colour that lasts."
    ],
    "text": [],
    "img": "assets/img/kf/KF-EXE-weather-resistant-flexible-small.jpg"
   },
   "Protected from fungi and algae": {
    "intro": [
     "Our expert chemists have formulated Exterior Eggshell with added protection against fungi and algae, so your outdoor spaces stay looking their best."
    ],
    "text": [],
    "img": "assets/img/kf/KF-EXE-fungiandalgae-small.jpg"
   },
   "Lasts up to 6 years": {
    "intro": [
     "When applied according to our Product Advice Sheets, the resin-rich formula resists flaking, peeling and fading for up to six years. So, your exterior stays beautiful, no matter the weather."
    ],
    "text": [],
    "img": "assets/img/kf/KF-EXE-lasts-6years-small.jpg"
   },
   "Water based": {
    "intro": [
     "We’re proud to have been the first in the industry to transition to a completely water based range back in 2010. As a result, all of our finishes, including our tough trim and floor paints, are made with a low-odour, low-VOC water base that scores A+ for indoor air quality.",
     "Plus, our water based paint doesn’t discolour over time like solvent based paints can. So your spaces stay beautiful for longer."
    ],
    "text": []
   },
   "Toy safe": {
    "intro": [
     "This finish is independently tested and certified toy-safe in accordance with Safety of Toys Part 3: Migration of certain elements (EN 71-3:2019+A1:2021). That means you can add a splash of colour to toys, cribs and other surfaces little ones come into contact with. Our paints also have hardly any odour and don’t need any solvents to clean up, so you can breathe easy during application and beyond."
    ],
    "text": [],
    "img": "assets/img/kf/KF-toy-safe_2.jpg"
   }
  }
 }
};
// Panel lookup: colour chips by key, finish chips by their live drawer title (Estate Emulsion's "Very matt, 2% sheen"
// is drawn with its sheen, so it falls back to the text before the comma)
function featurePanel(chip) {
  const label = chip.querySelector('span').textContent;
  if (chip.closest('#kf-colour')) return { title: label, ...KF_LIVE.colour[chip.dataset.feature] };
  const live = KF_LIVE.finish[currentFinish] || {};
  const title = live[label] ? label : label.split(',')[0];
  if (live[title]) return { title, ...live[title] };
  const f = byId(currentFinish);
  return { title: label, intro: [(FINISH_FEATURES[f.id] && FINISH_FEATURES[f.id].about) || f.text], text: [] };
}
const chipHtml = (key, icon, label) => `<button class="kf-chip" type="button" aria-haspopup="dialog" aria-controls="kf-panel" data-feature="${key}"><img src="assets/icons/${icon}.svg" width="20" height="20" alt=""><span>${esc(label)}</span></button>`;
const kfFinishChips = document.getElementById('kf-finish');

// Chips too long for one line wrap their text and go full width with a 24px radius
function markWrappedChips() {
  document.querySelectorAll('.kf-chip').forEach((c) => {
    c.classList.remove('is-wrapped');
    if (c.querySelector('span').getClientRects().length && c.offsetHeight > 40) c.classList.add('is-wrapped');
  });
}
addEventListener('resize', markWrappedChips);

function renderFinishFeatures(f) {
  const data = FINISH_FEATURES[f.id];
  document.getElementById('kf-finish-name').textContent = `${f.name} features`;
  document.getElementById('kf-finish-text').textContent = (data && data.about) || f.text;
  if (data) {
    kfFinishChips.innerHTML = data.features.map((label) => chipHtml(featureKey(label), featureIcon(label), label)).join('');
  }
  markWrappedChips();
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
  renderFinishFeatures(f);
  updateTotal(); // the sticky strip's summary names the finish
}
finishCards.forEach((card) => card.addEventListener('click', () => setFinish(card.dataset.finish)));

// Drawer list
const drawer = document.getElementById('finish-drawer');
const finishList = document.getElementById('finish-list');
const selectBtn = document.getElementById('finish-select');
let pending = currentFinish;

const infoPanel = (f) => {
  const points = f.suitable.map((s) => `<p class="finish-info__point"><img src="assets/icons/bullet.svg" width="5" height="5" alt="">${esc(s)}</p>`).join('');
  return `
    <div class="finish-info" id="info-${f.id}" hidden>
      <p class="finish-info__text">${esc(f.text)}</p>
      ${points ? `<p class="finish-info__label">Suitable for:</p>${points}` : ''}
      ${f.sizes ? `<p class="finish-info__sizes">Available in ${f.sizes}</p>` : ''}
    </div>`;
};

finishList.innerHTML = FINISHES.map((f) => `
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
const finishItems = [...finishList.querySelectorAll('.finish-item')];

function markPending(id) {
  pending = id;
  finishItems.forEach((item) => {
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
  btn.setAttribute('aria-expanded', String(open));
  btn.querySelector('span').textContent = open ? 'Hide info' : 'Show info';
  // 24px chevron swaps to Figma's "up" asset; the 16px one (Exterior rows, mobile sheet) is flipped as in Figma
  btn.querySelector('.chev-lg').src = `assets/icons/chevron-${open ? 'up' : 'down'}.svg`;
  btn.querySelector('.chev-sm').style.transform = open ? 'rotate(180deg)' : '';
  item.querySelector('.finish-info').hidden = !open;
}

finishItems.forEach((item) => {
  item.querySelector('.finish-row').addEventListener('click', (e) => {
    const toggle = e.target.closest('.finish-info-toggle');
    if (toggle) toggleInfo(item, toggle.getAttribute('aria-expanded') !== 'true');
    else markPending(item.dataset.id);
  });
});

// Arrow keys move through the visible options, like a native radio group
finishList.addEventListener('keydown', (e) => {
  if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
  const visible = finishItems.filter((i) => !i.hidden).map((i) => i.querySelector('.finish-option'));
  const i = visible.indexOf(document.activeElement);
  if (i < 0) return;
  e.preventDefault();
  const next = visible[(i + (e.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length];
  markPending(next.closest('.finish-item').dataset.id);
  next.focus();
});

const drawerTabs = [...drawer.querySelectorAll('.drawer__tab')];
function applyFilter(group) {
  drawerTabs.forEach((t) => {
    const on = t.dataset.filter === group;
    t.classList.toggle('is-active', on);
    t.setAttribute('aria-selected', String(on));
  });
  finishItems.forEach((item) => { item.hidden = group !== 'all' && item.dataset.group !== group; });
  finishList.scrollTop = 0;
}
drawerTabs.forEach((t) => t.addEventListener('click', () => applyFilter(t.dataset.filter)));

function openDrawer() {
  applyFilter('all');
  finishItems.forEach((item) => toggleInfo(item, false));
  markPending(currentFinish);
  openOverlay(drawer, 'drawer-open', drawer.querySelector('.drawer__panel'));
}
const closeDrawer = () => closeOverlay(drawer, 'drawer-open');
document.querySelectorAll('[data-open-finishes]').forEach((b) => b.addEventListener('click', openDrawer));
drawer.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeDrawer));
selectBtn.addEventListener('click', () => { setFinish(pending); closeDrawer(); });
drawer.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDrawer();
  else if (e.key === 'Tab') trapTab(e, drawer, 'button, a[href]');
});
// Key feature panel (363:1058): titled "Key features" for every chip; the chip's feature name and copy fill the body
const kfPanel = document.getElementById('kf-panel');
function openFeature(chip) {
  const p = featurePanel(chip);
  const paras = (list) => (list || []).map((t) => `<p>${esc(t)}</p>`).join('');
  document.getElementById('kfp-name').textContent = p.title;
  document.getElementById('kfp-intro').innerHTML = paras(p.intro);
  document.getElementById('kfp-text').innerHTML = paras(p.text);
  const media = document.getElementById('kfp-media');
  media.hidden = !p.img;
  media.classList.toggle('is-video', !!p.video);
  if (p.img) document.getElementById('kfp-photo').src = p.img;
  kfPanel.querySelector('.kfp__body').scrollTop = 0;
  openOverlay(kfPanel, 'drawer-open', kfPanel.querySelector('.drawer__panel'));
}
const closeFeature = () => closeOverlay(kfPanel, 'drawer-open');
document.querySelector('.kf').addEventListener('click', (e) => {
  const chip = e.target.closest('.kf-chip');
  if (chip) openFeature(chip);
});
kfPanel.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeFeature));
kfPanel.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeFeature();
  else if (e.key === 'Tab') trapTab(e, kfPanel, 'button, a[href]');
});
renderFinishFeatures(byId(currentFinish));

// index.html#finishes opens the drawer straight away (handy for sharing the slide-out)
if (location.hash === '#finishes') openDrawer();

// ---------- Quantity steppers drive the Add to Basket total ----------
// 2.5 L × 1 is preselected (client brief: Add to Basket works on load). If every quantity goes back to 0, the
// Add to Basket buttons stay clickable (aria-disabled) so a press
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
// Pack sizes as the size rows describe them (size, "Covers approx." m², price). The coverage line, the sticky strip
// and the paint calculator all read from here, so the buy box is the one source.
const packs = [...document.querySelectorAll('.stepper')].map((stepper) => {
  const row = stepper.closest('.size-row');
  return {
    stepper,
    size: row.querySelector('.size-row__size').textContent,
    covers: parseFloat(row.querySelector('.size-row__cover').textContent.match(/\d+(?:\.\d+)?/)[0]),
    price: Number(stepper.dataset.price),
  };
});
const qtyOf = (p) => parseInt(p.stepper.querySelector('.stepper__value').value, 10) || 0;
const addButton = document.getElementById('add-to-basket');
// Total coverage line (Figma 287:603): sums quantity × the "Covers approx." m² of each size row
const coverage = document.getElementById('coverage');
const coverageText = coverage.querySelector('.coverage__text');

function updateTotal() {
  let total = 0;
  let covers = 0;
  packs.forEach((p) => {
    const qty = qtyOf(p);
    p.stepper.classList.toggle('is-active', qty > 0);
    p.stepper.querySelector('[data-step="-1"]').disabled = qty === 0;
    total += qty * p.price;
    covers += qty * p.covers;
  });
  coverage.classList.toggle('is-empty', covers === 0);
  coverageText.innerHTML = covers > 0 ? `Your selection covers approx. <strong>${covers}&nbsp;m²</strong>` : 'Choose a pack size to see how much it covers';
  addButton.textContent = total > 0 ? `Add to Basket ${money(total)}` : 'Add to Basket';
  addButton.setAttribute('aria-disabled', String(total === 0));
  if (total > 0) hideTip();
  updateBasketBar(total);
}

// Sticky strip summary (Figma 340:958): desktop "Finish, N tins, £total"; mobile drops the finish
const stripSumD = document.getElementById('strip-sum-d');
const stripSumM = document.getElementById('strip-sum-m');
function updateBasketBar(total) {
  const tins = packs.reduce((n, p) => n + qtyOf(p), 0);
  const finish = byId(currentFinish).name;
  const tinsText = `${tins} tin${tins === 1 ? '' : 's'}, ${money(total)}`;
  stripSumD.textContent = tins ? `${finish}, ${tinsText}` : `${finish}, no size chosen`;
  stripSumM.textContent = tins ? tinsText : 'No size chosen';
}

packs.forEach(({ stepper }) => {
  const input = stepper.querySelector('.stepper__value');
  stepper.querySelectorAll('.stepper__btn').forEach((btn) => {
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
// Walls minus windows & doors, 1 coat. Tins are the cheapest mix of the buy box's pack sizes (packs, above) that
// covers the area.
const calc = document.getElementById('calc-drawer');
const calcRowTpl = document.getElementById('calc-row');
const calcLists = { wall: document.getElementById('calc-walls'), opening: document.getElementById('calc-openings') };
const calcNames = { wall: 'Wall', opening: 'Window or door' };
const calcArea = document.getElementById('calc-area');
const calcHint = document.getElementById('calc-hint');
const calcTins = document.getElementById('calc-tins');
const calcTotal = document.getElementById('calc-total');
const calcBuy = document.getElementById('calc-buy');
let calcUnit = 'm';
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
      // Openings read as a deduction; an empty row shows a grey 0 m²
      const tag = row.querySelector('.calc__tag');
      tag.textContent = `${a && kind === 'opening' ? '−' : ''}${fmtArea(a)}`;
      tag.classList.toggle('is-empty', !a);
      if (kind === 'wall') walls += a; else openings += a;
    });
  });
  const area = Math.max(0, walls - openings);
  calcArea.textContent = fmtArea(area);
  calcArea.classList.toggle('has-value', area > 0);
  calcHint.textContent = area > 0 ? 'Based on 1 coat' : 'Add your walls to calculate';
  // Until something is measured, the pack sizes already chosen on the page are carried in
  calcTinQty = area > 0 ? cheapestMix(area) : packs.map(qtyOf);
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
    row.querySelector('.calc__row-name').textContent = kind === 'opening' && rows.length === 1 ? 'Window' : `${calcNames[kind]} ${i + 1}`;
    row.querySelectorAll('input').forEach((input) => {
      input.setAttribute('aria-label', `${calcNames[kind]} ${i + 1} ${input.dataset.dim === 'w' ? 'width' : 'height'} in ${calcUnit}`);
    });
    const remove = row.querySelector('.calc__remove');
    remove.setAttribute('aria-label', `Remove ${calcNames[kind].toLowerCase()} ${i + 1}`);
    // Any wall can go while there are two or more; the last one stays. Windows and doors are optional, so all can go.
    remove.hidden = kind === 'wall' && rows.length === 1;
  });
}

function addCalcRow(kind) {
  const row = calcRowTpl.content.firstElementChild.cloneNode(true);
  row.querySelectorAll('input').forEach((input) => {
    input.placeholder = calcUnit === 'cm' ? '0' : '0.00';
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^\d.,]/g, '');
      renderCalc();
    });
  });
  row.querySelectorAll('.calc__unit-label').forEach((u) => { u.textContent = calcUnit; });
  row.querySelector('.calc__remove').addEventListener('click', () => {
    row.remove();
    renumber(kind);
    renderCalc();
    calc.querySelector(`[data-add="${kind}"]`).focus();
  });
  calcLists[kind].appendChild(row);
  renumber(kind);
  return row;
}
addCalcRow('wall');

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
  renderCalc();
  // Figma's "on open" state has Wall 1's width focused; on phones that would pop the keyboard, so focus the panel
  openOverlay(calc, 'drawer-open', mobile.matches ? calc.querySelector('.drawer__panel') : calcLists.wall.querySelector('input'));
}
const closeCalc = () => closeOverlay(calc, 'drawer-open');
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
  if (e.key === 'Escape') closeCalc();
  else if (e.key === 'Tab') trapTab(e, calc, 'button, a[href], input');
});
// index.html#calculator opens the calculator straight away
if (location.hash === '#calculator') openCalc();

// Favourite toggle: the order card's heart and the sticky strip's heart share one state
const favs = [...document.querySelectorAll('.fav')];
favs.forEach((fav) => fav.addEventListener('click', () => {
  const on = fav.getAttribute('aria-pressed') !== 'true';
  favs.forEach((f) => f.setAttribute('aria-pressed', String(on)));
}));

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
  carousel.addEventListener('carousel:reset', () => goTo(0));
  goTo(0, false);
});

// ---------- Mobile only (Figma 147:585) ----------
// "Read more" under the description: clamped to six lines on mobile (CSS only clamps below 768px)
const descBody = document.querySelector('.pdp-desc__body');
const readMore = document.querySelector('.m-readmore');
descBody.classList.add('is-clamped');
readMore.addEventListener('click', () => {
  const open = descBody.classList.toggle('is-clamped') === false;
  readMore.setAttribute('aria-expanded', String(open));
  readMore.textContent = open ? 'Read less' : 'Read more';
});

// Sticky compact header (mobile, Figma 151:1423) and the sticky strip (both breakpoints, Figma 340:958)
const stickyHeader = document.querySelector('.m-sticky-header');
const mHeader = document.querySelector('.m-header');
const strip = document.getElementById('strip');
function setVisible(el, on) {
  el.classList.toggle('is-visible', on);
  el.setAttribute('aria-hidden', String(!on));
  el.querySelectorAll('button').forEach((b) => { b.tabIndex = on ? 0 : -1; });
}
function updateSticky() {
  setVisible(stickyHeader, mobile.matches && mHeader.getBoundingClientRect().bottom < 0);
  setVisible(strip, addButton.getBoundingClientRect().bottom < 0);
}
window.addEventListener('scroll', updateSticky, { passive: true });
mobile.addEventListener('change', updateSticky);
updateSticky(); // a reload can restore the page part-way down
// "Choose finish & size" never adds to basket: it scrolls back to the order card and focuses the chosen finish,
// clear of the mobile sticky header (56px) when that's showing
document.getElementById('strip-go').addEventListener('click', () => {
  const card = document.querySelector('.order-card');
  const offset = mobile.matches ? 56 + 16 : 24;
  window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - offset, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  const first = card.querySelector('.finish-card.is-active') || card.querySelector('button, input');
  if (first) first.focus({ preventScroll: true });
});

// Footer link groups are dropdowns on mobile only; on desktop the titles are plain labels
const footerToggles = [...document.querySelectorAll('.footer__col-title')];
function syncFooterToggles() {
  footerToggles.forEach((b) => {
    b.tabIndex = mobile.matches ? 0 : -1;
    if (mobile.matches) b.setAttribute('aria-expanded', String(b.parentElement.classList.contains('is-open')));
    else b.removeAttribute('aria-expanded');
  });
}
footerToggles.forEach((b) => b.addEventListener('click', () => {
  if (!mobile.matches) return;
  const open = b.parentElement.classList.toggle('is-open');
  b.setAttribute('aria-expanded', String(open));
}));
syncFooterToggles();
mobile.addEventListener('change', syncFooterToggles);

// ---------- Prototype notice (Figma 281:603 / 283:606) ----------
// Anything that looks clickable but isn't designed in this preview (href="#" links, [data-proto] buttons,
// chapters without copy, the buy box's Add to Basket) opens the notice instead of doing nothing.
const notice = document.getElementById('proto-notice');
const openNotice = () => openOverlay(notice, 'notice-open', notice.querySelector('.notice__back'));
const closeNotice = () => closeOverlay(notice, 'notice-open');
notice.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeNotice));
notice.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNotice();
  else if (e.key === 'Tab') trapTab(e, notice, 'button');
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

// ---------- Gallery popup: grid (Figma 255:603) and photo view (257:603) ----------
// Photos as drawn in the grid frame (its last row repeats the first while more photos are to come).
// Room tabs filter the grid; the photo view walks the filtered set with ← →, swipe and thumbnails,
// and Esc or "All photos" goes back to the grid with the filter kept.
// The colour preview switcher swaps this list, the room tabs and the colour name for its other colour.
let GALLERY = [
  { src: 'assets/img/gallery-1.png', room: 'Bedroom' },
  { src: 'assets/img/gallery-2.jpg', room: 'Living Room' },
  { src: 'assets/img/gallery-3.jpg', room: 'Living Room' },
  { src: 'assets/img/gallery-dining.jpg', room: 'Dining Room' },
  { src: 'assets/img/gallery-bathroom.jpg', room: 'Bathroom' },
  { src: 'assets/img/gallery-child.jpg', room: 'Child Room' },
  { src: 'assets/img/gallery-1.png', room: 'Bedroom' },
  { src: 'assets/img/gallery-2.jpg', room: 'Living Room' },
  { src: 'assets/img/gallery-3.jpg', room: 'Living Room' },
];
const lightbox = document.getElementById('gallery-popup');
const lbBox = lightbox.querySelector('.lightbox__box');
const lbGrid = lightbox.querySelector('.lb-grid');
const lbView = lightbox.querySelector('.lb-view');
const lbPhotos = document.getElementById('lb-photos');
const lbEmpty = document.getElementById('lb-empty');
const lbThumbs = document.getElementById('lb-thumbs');
const lbPhoto = document.getElementById('lb-photo');
const lbTabBar = lightbox.querySelector('.lb-tabs');
const lbPos = document.getElementById('lb-pos');
const lbRoomName = document.getElementById('lb-room');
let lbPaintName = 'Incarnadine';
let lbRoom = 'all';
let lbIndex = 0;
const lbItems = () => GALLERY.filter((p) => lbRoom === 'all' || p.room === lbRoom);
// Bottom fade (Figma 293:603) goes away once the grid is scrolled to its last row, or when nothing scrolls
const lbScroller = lightbox.querySelector('.lb-grid__scroll');
function updateLbFade() {
  lbGrid.classList.toggle('is-scroll-end', lbScroller.scrollTop + lbScroller.clientHeight >= lbScroller.scrollHeight - 4);
}
lbScroller.addEventListener('scroll', updateLbFade, { passive: true });
addEventListener('resize', updateLbFade);
// Photo view thumbnail strip (Figma 304:617): edge fades only while there is more to scroll that way
const lbStrip = document.getElementById('lb-strip');
function updateStripFade() {
  const max = lbThumbs.scrollWidth - lbThumbs.clientWidth;
  lbStrip.classList.toggle('has-before', max > 4 && lbThumbs.scrollLeft > 4);
  lbStrip.classList.toggle('has-after', max > 4 && lbThumbs.scrollLeft < max - 4);
}
function centreActiveThumb() {
  const a = lbThumbs.querySelector('.is-active');
  if (a) lbThumbs.scrollLeft = a.offsetLeft - (lbThumbs.clientWidth - a.offsetWidth) / 2;
  updateStripFade();
}
lbThumbs.addEventListener('scroll', updateStripFade, { passive: true });
addEventListener('resize', updateStripFade);

function renderGrid() {
  const items = lbItems();
  lbPhotos.innerHTML = items
    .map((p, i) => `<button class="lb-tile" type="button" data-i="${i}" aria-label="${p.room}, open photo ${i + 1} of ${items.length}">
      <img src="${p.src}" alt="" loading="lazy"><span class="lb-tile__tag">${p.room}</span>
      <span class="lb-tile__open"><img src="assets/icons/gallery-maximize.svg" width="20" height="20" alt=""></span></button>`)
    .join('');
  lbEmpty.hidden = items.length > 0;
  lbPhotos.querySelectorAll('.lb-tile').forEach((t) => t.addEventListener('click', () => showPhoto(Number(t.dataset.i))));
  updateLbFade();
}
function setRoom(room) {
  lbRoom = room;
  lbTabBar.querySelectorAll('.lb-tab').forEach((t) => {
    t.classList.toggle('is-active', t.dataset.room === room);
    t.setAttribute('aria-selected', String(t.dataset.room === room));
  });
  renderGrid();
}
lbTabBar.addEventListener('click', (e) => {
  const tab = e.target.closest('.lb-tab');
  if (tab) setRoom(tab.dataset.room);
});
// Room tabs: the live page's filters, in its order, but only the rooms that have photos here (no empty tabs)
function renderTabs(photos, liveRooms) {
  const rooms = liveRooms.filter((room) => photos.some((p) => p.room === room));
  lbTabBar.innerHTML = ['All', ...rooms]
    .map((room, i) => `<button class="lb-tab${i ? '' : ' is-active'}" type="button" role="tab" aria-selected="${!i}" data-room="${i ? room : 'all'}">${room}</button>`)
    .join('');
}

function showPhoto(i) {
  const items = lbItems();
  lbIndex = (i + items.length) % items.length;
  const p = items[lbIndex];
  lbPhoto.src = p.src;
  lbPhoto.alt = `${lbPaintName} in a ${p.room.toLowerCase()}`;
  lbPos.textContent = `${lbIndex + 1} / ${items.length}`;
  lbRoomName.textContent = p.room;
  lbThumbs.innerHTML = items
    .map((t, j) => `<button class="lb-thumb${j === lbIndex ? ' is-active' : ''}" type="button" data-i="${j}" aria-label="Photo ${j + 1}"${j === lbIndex ? ' aria-current="true"' : ''}><img src="${t.src}" alt=""></button>`)
    .join('');
  lbThumbs.querySelectorAll('.lb-thumb').forEach((t) => t.addEventListener('click', () => showPhoto(Number(t.dataset.i))));
  requestAnimationFrame(centreActiveThumb);
  if (lbView.hidden) {
    lbGrid.hidden = true;
    lbView.hidden = false;
    lbBox.classList.add('is-photo');
    lbView.querySelector('.lb-view__back').focus({ preventScroll: true });
  }
}
function showGrid() {
  lbView.hidden = true;
  lbGrid.hidden = false;
  lbBox.classList.remove('is-photo');
  const tile = lbPhotos.querySelector(`[data-i="${lbIndex}"]`);
  (tile || lbBox).focus();
  updateLbFade();
}
lightbox.querySelector('.lb-view__back').addEventListener('click', showGrid);
lightbox.querySelectorAll('.lb-view__nav').forEach((b) => b.addEventListener('click', () => showPhoto(lbIndex + Number(b.dataset.dir))));

// Swipe between photos on touch screens
let swipeX = null;
const stage = lightbox.querySelector('.lb-view__stage');
stage.addEventListener('pointerdown', (e) => { swipeX = e.clientX; });
stage.addEventListener('pointerup', (e) => {
  if (swipeX === null) return;
  const dx = e.clientX - swipeX;
  swipeX = null;
  if (Math.abs(dx) > 40) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
});

function openGallery(photoSrc) {
  setRoom('all');
  // Always opens on the grid, so --sb (the scrollbar width .lb-grid's padding and fade share) is measured while the
  // grid shows; a photo on the page then goes straight on to its photo view
  lbView.hidden = true;
  lbGrid.hidden = false;
  lbBox.classList.remove('is-photo');
  openOverlay(lightbox, 'drawer-open', lbBox);
  lbGrid.style.setProperty('--sb', `${Math.min(lbScroller.offsetWidth - lbScroller.clientWidth, 20)}px`);
  updateLbFade();
  if (photoSrc) showPhoto(Math.max(0, lbItems().findIndex((p) => photoSrc.endsWith(p.src))));
}
const closeGallery = () => closeOverlay(lightbox, 'drawer-open');
document.querySelectorAll('[data-open-gallery]').forEach((b) => b.addEventListener('click', () => openGallery()));
// A photo on the page opens the photo view at that photo
galleryMain.addEventListener('click', () => openGallery(galleryMain.src));
galleryMain.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGallery(galleryMain.src); }
});
document.querySelectorAll('.m-gallery [data-photo]').forEach((b) => b.addEventListener('click', () => openGallery(b.dataset.photo)));
lightbox.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeGallery));
lightbox.addEventListener('keydown', (e) => {
  const inPhoto = !lbView.hidden;
  if (e.key === 'Escape') { if (inPhoto) showGrid(); else closeGallery(); }
  else if (inPhoto && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); showPhoto(lbIndex + (e.key === 'ArrowRight' ? 1 : -1)); }
  else if (e.key === 'Tab') trapTab(e, lightbox, 'button');
});
// index.html#gallery opens the grid straight away
if (location.hash === '#gallery') openGallery();

// ---------- Colour preview switcher (demo tool, not part of the Figma frame) ----------
// Buttons and bands always take the paint. Text on it stays white while it reads at 4.5:1 (WCAG AA), otherwise it
// goes to ink, as the live site does for pale colours such as Teresa's Green.
const INK = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
const WHITE = '#ffffff';
const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255]
    .map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
function applyPaint(paint) {
  const onWhite = contrast(paint, WHITE);
  const lightText = onWhite >= 4.5 || onWhite >= contrast(paint, INK);
  const root = document.documentElement.style;
  root.setProperty('--paint', paint);
  root.setProperty('--on-paint', lightText ? WHITE : INK);
  root.setProperty('--on-paint-soft', lightText ? 'var(--silver)' : INK);
  document.documentElement.dataset.paintTone = lightText ? 'dark' : 'light';
}

// Content: every [data-slot] on the page takes the matching child of the colour's <template>. Incarnadine is what
// the page ships with, so its slots, photos and room tabs are kept as they are on load.
const GALLERIES = {
  incarnadine: {
    photos: GALLERY,
    // Room filters as on the live page (capture 4:107-4:117); Exterior has no photo here, so it isn't shown
    tabs: ['Bathroom', 'Bedroom', 'Child Room', 'Dining Room', 'Exterior', 'Living Room'],
    hero: ['assets/img/gallery-3.jpg', 'assets/img/gallery-1.png', 'assets/img/gallery-2.jpg'],
    heroAlt: galleryMain.alt,
  },
  'teresas-green': {
    photos: [
      { src: 'assets/img/teresas-green/gallery-living-1.jpg', room: 'Living Room' },
      { src: 'assets/img/teresas-green/gallery-dining.jpg', room: 'Dining Room' },
      { src: 'assets/img/teresas-green/gallery-bathroom.jpg', room: 'Bathroom' },
      { src: 'assets/img/teresas-green/gallery-living-2.jpg', room: 'Living Room' },
      { src: 'assets/img/teresas-green/gallery-bedroom-1.jpg', room: 'Bedroom' },
      { src: 'assets/img/teresas-green/gallery-bedroom-2.jpg', room: 'Bedroom' },
      { src: 'assets/img/teresas-green/gallery-living-3.jpg', room: 'Living Room' },
      { src: 'assets/img/teresas-green/gallery-kitchen.jpg', room: 'Kitchen' },
      { src: 'assets/img/teresas-green/gallery-child-1.jpg', room: 'Child Room' },
      { src: 'assets/img/teresas-green/gallery-child-2.jpg', room: 'Child Room' },
      { src: 'assets/img/teresas-green/gallery-child-3.jpg', room: 'Child Room' },
    ],
    // Room filters as on the live page
    tabs: ['Bathroom', 'Bedroom', 'Child Room', 'Dining Room', 'Kitchen', 'Living Room'],
    hero: ['assets/img/teresas-green/gallery-living-1.jpg', 'assets/img/teresas-green/gallery-bathroom.jpg', 'assets/img/teresas-green/gallery-living-2.jpg'],
    heroAlt: 'Teresa\'s Green on the walls of a living room with a brick gable',
  },
};
renderTabs(GALLERIES.incarnadine.photos, GALLERIES.incarnadine.tabs);
const slotEls = [...document.querySelectorAll('[data-slot]')];
const slotOriginals = {};
slotEls.forEach((el) => {
  if (!(el.dataset.slot in slotOriginals)) slotOriginals[el.dataset.slot] = { html: el.innerHTML, label: el.getAttribute('aria-label') };
});
const pageTitle = document.title;

function applyContent(id) {
  const tpl = document.getElementById(`paint-${id}`);
  slotEls.forEach((el) => {
    const src = tpl && tpl.content.querySelector(`[data-slot="${el.dataset.slot}"]`);
    const c = src ? { html: src.innerHTML, label: src.getAttribute('aria-label') } : slotOriginals[el.dataset.slot];
    el.innerHTML = c.html;
    if (c.label) el.setAttribute('aria-label', c.label);
  });
  document.title = tpl ? tpl.dataset.title : pageTitle;
  lbPaintName = tpl ? tpl.dataset.name : 'Incarnadine';

  const g = GALLERIES[id];
  GALLERY = g.photos;
  renderTabs(g.photos, g.tabs);
  galleryMain.src = g.hero[0];
  galleryMain.alt = g.heroAlt;
  document.querySelectorAll('.gallery__thumb').forEach((t, i) => {
    t.dataset.src = g.hero[i];
    t.querySelector('img').src = g.hero[i];
    t.classList.toggle('is-active', i === 0);
  });
  const mMain = document.querySelector('.m-gallery__main');
  mMain.dataset.photo = g.hero[0];
  mMain.querySelector('img').src = g.hero[0];
  mMain.querySelector('img').alt = g.heroAlt;
  document.querySelectorAll('.m-gallery__thumb').forEach((t, i) => {
    t.dataset.photo = g.hero[i];
    t.querySelector('img').src = g.hero[i];
  });
  // Back to the first card, with each carousel's counter and arrows following
  document.querySelectorAll('[data-carousel]').forEach((c) => c.dispatchEvent(new Event('carousel:reset')));
}

const pswitch = document.getElementById('pswitch');
const pswitchOptions = [...pswitch.querySelectorAll('.pswitch__option')];
pswitchOptions.forEach((opt) => opt.addEventListener('click', () => {
  if (opt.classList.contains('is-active')) return;
  pswitchOptions.forEach((o) => {
    o.classList.toggle('is-active', o === opt);
    o.setAttribute('aria-checked', String(o === opt));
  });
  applyPaint(opt.dataset.paint);
  applyContent(opt.dataset.colour);
}));

// Starts as a small pill so it stays out of the client's way; opens into the panel
const pswitchOpen = document.getElementById('pswitch-open');
function setPswitchOpen(open) {
  pswitch.classList.toggle('is-open', open);
  pswitchOpen.setAttribute('aria-expanded', String(open));
}
pswitchOpen.addEventListener('click', () => { setPswitchOpen(true); document.getElementById('pswitch-close').focus(); });
document.getElementById('pswitch-close').addEventListener('click', () => { setPswitchOpen(false); pswitchOpen.focus(); });
pswitch.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pswitch.classList.contains('is-open')) { setPswitchOpen(false); pswitchOpen.focus(); } });
