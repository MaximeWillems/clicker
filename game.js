/* Éclosion — jalon 0
   Prototype jetable : tout tourne dans le navigateur, sauvegarde en localStorage.
   Le vrai jeu aura un serveur qui fait autorité — ce fichier n'est pas destiné à grandir. */

'use strict';

/* ─────────────────────────────────────────────
   Données — tout ce qui s'équilibre est ici.
   ───────────────────────────────────────────── */

const HATCH      = 15;                                        // secondes de couvaison
const GROW       = [45, 180, 900, 3600, 21600];               // croissance par palier
const VALUE      = [40, 500, 6000, 80000, 1500000];           // valeur à la vente
const EVOLVE     = [200, 3000, 40000, 600000, null];          // coût pour passer au palier suivant
const GLYPH_REM  = [2, 2.45, 2.95, 3.5, 4.2];

const EGG_PRICE  = 12;
const INCUB_BASE = 150;
const PEN_BASE   = 400;
const SLOT_MULT  = 1.6;

const FEED_CHUNK = 60;      // secondes ajoutées par ration
const FEED_RATIO = 0.8;     // une ration coûte 80 % de ce qu'elle fait gagner
const AUTOFEED_X = 2;       // la mangeoire ajoute 2 s par seconde (croissance ×3)

/* Engraissement — nourrir un adulte le fait grossir, sans limite.
   La valeur suit un logarithme (OVER_GAIN) pendant que le coût reste linéaire (OVER_COST).
   Comme OVER_GAIN dépasse à peine OVER_COST, la toute première bouchée est
   marginalement gagnante puis ça devient une perte : grossir est un plaisir,
   jamais une stratégie. Le rapport est le même à tous les paliers. */
const OVER_CHUNK = 60;      // secondes d'engraissement par ration
const OVER_COST  = 0.5;     // ce que coûte une seconde d'engraissement
const OVER_GAIN  = 0.55;    // ce qu'elle rapporte, en rendement décroissant
const OVER_VIS   = 1.5;     // grossissement visuel maximal, pour ne pas casser les cartes

const UPGRADES = [
  { key: 'couveuse',  name: 'Couveuse automatique', cost: 2000,
    desc: "Achète et place un œuf dès qu'un incubateur se libère." },
  { key: 'mangeoire', name: 'Mangeoire automatique', cost: 15000,
    desc: 'Nourrit les créatures en continu, tant qu’il reste des pièces.' },
  { key: 'marchand',  name: 'Marchand automatique', cost: 100000,
    desc: 'Vend les adultes selon la règle que tu définis.' },
];

const LINES = [
  { key: 'crapaud', name: 'Crapaud', forms: [
    ['Têtard', '🐸'], ['Crapaud', '🐸'], ['Crapaud-buffle', '🐸'],
    ['Colosse fangeux', '🐸'], ['Gama, crapaud-montagne', '🐸'] ] },
  { key: 'poisson', name: 'Poisson', forms: [
    ['Alevin', '🐟'], ['Carpe', '🐟'], ['Carpe centenaire', '🐠'],
    ['Serpent de mer', '🐍'], ['Léviathan', '🐉'] ] },
  { key: 'lezard', name: 'Lézard', forms: [
    ['Lézardeau', '🦎'], ['Lézard', '🦎'], ['Varan', '🦎'],
    ['Wyverne', '🐲'], ['Dragon de terre', '🐉'] ] },
  { key: 'oiseau', name: 'Oiseau', forms: [
    ['Oisillon', '🐣'], ['Passereau', '🐦'], ['Rapace', '🦅'],
    ['Roc', '🦅'], ['Phénix', '🔥'] ] },
  { key: 'crocodile', name: 'Crocodile', forms: [
    ['Crocodillon', '🐊'], ['Crocodile', '🐊'], ['Crocodile ancien', '🐊'],
    ['Draco-saurien', '🐲'], ['Dragon-tonnerre', '🐉'] ] },
];

const LINE_BY_KEY = Object.fromEntries(LINES.map(l => [l.key, l]));

/* ─────────────────────────────────────────────
   État
   ───────────────────────────────────────────── */

const SAVE_KEY = 'eclosion.jalon0';
const OFFLINE_CAP = 24 * 3600;

let state, nextId = 1, lastFrame = Date.now(), isNewGame = false;

function freshState() {
  return {
    v: 1,
    coins: 0,
    eggs: 0,
    incubators: 1,
    pens: 1,
    incub: [{ line: randomLine(), p: 0 }],   // le premier œuf est offert, déjà en couvaison
    pen: [],
    up: { couveuse: false, mangeoire: false, marchand: false },
    sellUpTo: 0,
    autoFeed: true,
    seen: {},
    speed: 1,
    sound: true,
    t: Date.now(),
  };
}

function randomLine() {
  return LINES[Math.floor(Math.random() * LINES.length)].key;
}

function load() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { /* mode privé */ }
  if (!raw) { isNewGame = true; return freshState(); }
  try {
    const s = JSON.parse(raw);
    const base = freshState();
    const merged = Object.assign(base, s, { up: Object.assign(base.up, s.up || {}) });
    // l'array des incubateurs doit toujours suivre le nombre acheté
    merged.incub = (merged.incub || []).slice(0, merged.incubators);
    while (merged.incub.length < merged.incubators) merged.incub.push(null);
    merged.pen = merged.pen || [];
    nextId = merged.pen.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1;
    return merged;
  } catch (e) {
    return freshState();
  }
}

function save() {
  state.t = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* quota / privé */ }
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

const $ = id => document.getElementById(id);

const growTime  = c => GROW[c.tier - 1];
const baseValue = c => VALUE[c.tier - 1];
const evoCost   = c => EVOLVE[c.tier - 1];

// La taille se mesure en durées de croissance avalées en plus, et l'évolution la remet
// à zéro : un têtard bien gras donne un crapaud de taille ordinaire. On engraisse donc
// une créature qu'on garde ou qu'on vend telle quelle, jamais une qu'on va faire évoluer.
const sizeFactor = c => 1 + OVER_GAIN * Math.log(1 + (c.over || 0) / growTime(c));
const isFat      = c => sizeFactor(c) > 1.005;
const sellValue  = c => Math.round(baseValue(c) * sizeFactor(c));
const isAdult   = c => c.p >= growTime(c);
const form      = (lineKey, tier) => LINE_BY_KEY[lineKey].forms[tier - 1];
const penFull   = () => state.pen.length >= state.pens;

const incubCost = () => Math.round(INCUB_BASE * Math.pow(SLOT_MULT, state.incubators - 1));
const penCost   = () => Math.round(PEN_BASE   * Math.pow(SLOT_MULT, state.pens - 1));

// prix d'une ration : proportionnel au temps réellement gagné
function feedQuote(c) {
  const left = growTime(c) - c.p;
  if (left <= 0) return null;
  const seconds = Math.min(FEED_CHUNK, left);
  const rate = baseValue(c) / growTime(c);
  return { seconds, cost: Math.max(1, Math.ceil(seconds * rate * FEED_RATIO)) };
}

// prix d'une ration donnée à un adulte : le tarif ne dépend jamais de la taille déjà atteinte,
// donc engraisser reste au même prix à l'infini pendant que le gain, lui, s'essouffle.
function overfeedQuote(c) {
  const rate = baseValue(c) / growTime(c);
  return { seconds: OVER_CHUNK, cost: Math.max(1, Math.ceil(OVER_CHUNK * rate * OVER_COST)) };
}

function fmt(n) {
  n = Math.floor(n);
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace('.', ',') + ' Md';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function fmtTime(s) {
  s = Math.max(0, Math.ceil(s));
  if (s < 60) return s + ' s';
  if (s < 3600) return Math.floor(s / 60) + ' m ' + String(s % 60).padStart(2, '0') + ' s';
  return Math.floor(s / 3600) + ' h ' + String(Math.floor((s % 3600) / 60)).padStart(2, '0') + ' m';
}

function markSeen(lineKey, tier) { state.seen[lineKey + ':' + tier] = true; }
const seenCount = () => Object.keys(state.seen).length;

/* ─────────────────────────────────────────────
   Effets — le clic doit être agréable
   ───────────────────────────────────────────── */

const fxLayer = $('fx');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let audioCtx = null;

function blip(freq, dur, type, vol) {
  if (!state.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.025, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.06));
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + (dur || 0.06));
  } catch (e) { /* pas de son, pas grave */ }
}

function chord(freqs, gap) {
  freqs.forEach((f, i) => setTimeout(() => blip(f, 0.12, 'triangle', 0.035), i * (gap || 70)));
}

function floatText(x, y, text, cls) {
  if (reduceMotion) return;
  const el = document.createElement('span');
  el.className = 'float ' + (cls || '');
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  fxLayer.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function burst(x, y, glyph, count) {
  if (reduceMotion) return;
  for (let i = 0; i < (count || 8); i++) {
    const el = document.createElement('span');
    const a = (Math.PI * 2 * i) / (count || 8) + Math.random() * 0.5;
    const d = 40 + Math.random() * 45;
    el.className = 'spark';
    el.textContent = glyph;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--dx', Math.cos(a) * d + 'px');
    el.style.setProperty('--dy', Math.sin(a) * d + 'px');
    fxLayer.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function flash(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;   // force le redémarrage de l'animation
  el.classList.add(cls);
}

/* ─────────────────────────────────────────────
   Actions
   ───────────────────────────────────────────── */

function tapIncubator(i, el) {
  const slot = state.incub[i];
  if (!slot) { placeEgg(i); return; }
  if (slot.p >= HATCH) return;
  slot.p += 1;
  flash(el, 'shake');
  const c = centerOf(el);
  floatText(c.x + (Math.random() * 30 - 15), c.y - 10, '+1 s');
  blip(220 + Math.random() * 60, 0.035, 'square', 0.02);
  if (slot.p >= HATCH) hatchAll();
  else refresh();
}

function tapCreature(c, el) {
  if (isAdult(c)) return;
  c.p += 1;
  flash(el, 'shake');
  const pt = centerOf(el);
  floatText(pt.x + (Math.random() * 30 - 15), pt.y - 10, '+1 s');
  blip(180 + Math.random() * 50, 0.035, 'square', 0.02);
  refresh();
}

function placeEgg(i) {
  if (state.incub[i] || state.eggs <= 0) return;
  state.eggs--;
  state.incub[i] = { line: randomLine(), p: 0 };   // la lignée est tirée ici, révélée à l'éclosion
  blip(330, 0.05, 'sine', 0.03);
  refresh();
}

function hatchAll() {
  let hatched = 0;
  for (let i = 0; i < state.incub.length; i++) {
    const slot = state.incub[i];
    if (!slot || slot.p < HATCH) continue;
    if (penFull()) continue;
    state.pen.push({ id: nextId++, line: slot.line, tier: 1, p: 0, over: 0 });
    state.incub[i] = null;
    markSeen(slot.line, 1);
    hatched++;
  }
  if (hatched) {
    const host = $('pen');
    const pt = centerOf(host);
    burst(pt.x, pt.y - 40, '✦', 10);
    chord([523, 659, 784]);
  }
  refresh();
  return hatched;
}

function feed(c, el) {
  const adult = isAdult(c);
  const q = adult ? overfeedQuote(c) : feedQuote(c);
  if (!q || state.coins < q.cost) return;

  const before = adult ? sellValue(c) : 0;
  state.coins -= q.cost;
  if (adult) c.over = (c.over || 0) + q.seconds;
  else c.p = Math.min(growTime(c), c.p + q.seconds);

  const pt = centerOf(el);
  floatText(pt.x, pt.y, '−' + fmt(q.cost));
  if (adult) {
    floatText(pt.x, pt.y - 26, '+' + fmt(sellValue(c) - before) + ' de valeur', 'gain');
    flash(el, 'shake');
  }
  blip(adult ? 320 : 400, 0.05, 'sine', 0.03);
  refresh();
}

function sell(c, el) {
  if (!isAdult(c)) return;
  const gain = sellValue(c);
  state.coins += gain;
  state.pen = state.pen.filter(x => x.id !== c.id);
  if (el) {
    const pt = centerOf(el);
    floatText(pt.x, pt.y, '+' + fmt(gain), 'gain');
    burst(pt.x, pt.y, '🪙', 6);
  }
  chord([392, 523], 55);
  refresh();
}

function evolve(c, el) {
  if (!isAdult(c) || c.tier >= 5) return;
  const cost = evoCost(c);
  if (state.coins < cost) return;
  state.coins -= cost;
  c.tier++;
  c.p = 0;
  // La taille repart de zéro : sans ça, engraisser à bas palier — où la nourriture est
  // dérisoire — puis évoluer rapporterait des dizaines de fois la mise au palier suivant,
  // la valeur montant ×12 par palier quand la croissance ne monte que ×4.
  c.over = 0;
  markSeen(c.line, c.tier);
  if (el) {
    const pt = centerOf(el);
    burst(pt.x, pt.y, c.tier === 5 ? '✦' : '✧', 12);
    floatText(pt.x, pt.y - 30, form(c.line, c.tier)[0], 'gain');
  }
  chord([440, 554, 659, 880], 80);
  refresh();
}

function buyEgg() {
  if (state.coins < EGG_PRICE) return;
  state.coins -= EGG_PRICE;
  state.eggs++;
  const free = state.incub.indexOf(null);
  if (free !== -1) placeEgg(free); else { blip(300, 0.04, 'sine', 0.03); refresh(); }
}

function buyIncubator() {
  const cost = incubCost();
  if (state.coins < cost) return;
  state.coins -= cost;
  state.incubators++;
  state.incub.push(null);
  chord([330, 494], 60);
  refresh();
}

function buyPen() {
  const cost = penCost();
  if (state.coins < cost) return;
  state.coins -= cost;
  state.pens++;
  chord([330, 494], 60);
  refresh();
}

function buyUpgrade(u) {
  if (state.up[u.key] || state.coins < u.cost) return;
  state.coins -= u.cost;
  state.up[u.key] = true;
  chord([523, 659, 784, 1046], 80);
  refresh();
}

/* ─────────────────────────────────────────────
   Simulation
   ───────────────────────────────────────────── */

function advance(dt) {
  for (const slot of state.incub) {
    if (slot && slot.p < HATCH) slot.p = Math.min(HATCH, slot.p + dt);
  }
  for (const c of state.pen) {
    const g = growTime(c);
    if (c.p < g) c.p = Math.min(g, c.p + dt);
  }
}

function runAutomations(dt) {
  if (state.up.mangeoire && state.autoFeed) {
    for (const c of state.pen) {
      const left = growTime(c) - c.p;
      if (left <= 0) continue;
      // la mangeoire s'arrête à l'âge adulte : engraisser est une décision, pas un automatisme
      const extra = Math.min(left, dt * AUTOFEED_X);
      const cost = extra * (baseValue(c) / growTime(c)) * FEED_RATIO;
      if (state.coins < cost) break;
      state.coins -= cost;
      c.p += extra;
    }
  }
  if (state.up.marchand && state.sellUpTo > 0) {
    const ready = state.pen.filter(c => isAdult(c) && c.tier <= state.sellUpTo);
    for (const c of ready) {
      state.coins += sellValue(c);
      state.pen = state.pen.filter(x => x.id !== c.id);
    }
  }
  if (state.up.couveuse) {
    for (let i = 0; i < state.incub.length; i++) {
      if (state.incub[i]) continue;
      if (state.eggs > 0) { state.eggs--; }
      else if (state.coins >= EGG_PRICE) { state.coins -= EGG_PRICE; }
      else break;
      state.incub[i] = { line: randomLine(), p: 0 };
    }
  }
}

function loop() {
  const now = Date.now();
  const dt = Math.min(5, (now - lastFrame) / 1000) * state.speed;
  lastFrame = now;
  if (dt <= 0) return;

  advance(dt);
  runAutomations(dt);
  hatchAll();          // hatchAll rafraîchit déjà l'affichage
}

function catchUp() {
  const elapsed = Math.min(OFFLINE_CAP, (Date.now() - (state.t || Date.now())) / 1000);
  lastFrame = Date.now();
  // une première partie ne doit pas s'ouvrir sur « pendant ton absence »
  if (isNewGame || elapsed < 30) return;

  const adultsBefore = state.pen.filter(isAdult).length;
  advance(elapsed);
  const hatched = hatchAll();
  const grown = state.pen.filter(isAdult).length - adultsBefore;

  const bits = [];
  if (hatched) bits.push(hatched + (hatched > 1 ? ' œufs ont éclos' : ' œuf a éclos'));
  if (grown > 0) bits.push(grown + (grown > 1 ? ' créatures sont devenues adultes' : ' créature est devenue adulte'));
  const note = $('offline-note');
  note.innerHTML = '<b>Pendant ton absence (' + fmtTime(elapsed) + ')</b> — ' +
    (bits.length ? bits.join(', ') + '.' : 'rien de neuf, tout tournait déjà.');
  note.hidden = false;
}

/* ─────────────────────────────────────────────
   Rendu
   ───────────────────────────────────────────── */

const cards = new Map();       // clé -> refs des éléments
const popped = new Set();      // créatures déjà animées à l'apparition
let incubSig = '', penSig = '', shopBuilt = false, collSig = '';

function buildCard(key, opts) {
  const el = document.createElement(opts.tappable ? 'button' : 'div');
  el.className = 'card' + (opts.tappable ? ' tappable' : '');
  if (opts.tappable) el.type = 'button';

  const glyph = document.createElement('div');
  glyph.className = 'glyph';
  el.appendChild(glyph);

  const name = document.createElement('div');
  name.className = 'cname';
  el.appendChild(name);

  const tier = document.createElement('div');
  tier.className = 'ctier';
  el.appendChild(tier);

  const bar = document.createElement('div');
  bar.className = 'bar';
  const fill = document.createElement('i');
  bar.appendChild(fill);
  el.appendChild(bar);

  const timer = document.createElement('div');
  timer.className = 'timer';
  el.appendChild(timer);

  const refs = { el, glyph, name, tier, bar: fill, timer, acts: null, warn: null };
  cards.set(key, refs);
  return refs;
}

function addActions(refs, defs) {
  const row = document.createElement('div');
  row.className = 'acts';
  refs.acts = {};
  for (const d of defs) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'act ' + d.cls;
    b.addEventListener('click', ev => { ev.stopPropagation(); d.run(refs.el); });
    row.appendChild(b);
    refs.acts[d.cls] = b;
  }
  refs.el.appendChild(row);
}

function renderIncubators() {
  const sig = state.incubators + '|' + state.incub
    .map(s => (s ? s.line + (s.p >= HATCH ? 'R' : 'G') : 'E')).join(',');
  if (sig === incubSig) return;
  incubSig = sig;

  const host = $('incubators');
  host.textContent = '';
  for (const k of [...cards.keys()]) if (k.startsWith('i:')) cards.delete(k);

  state.incub.forEach((slot, i) => {
    const refs = buildCard('i:' + i, { tappable: true });
    refs.el.addEventListener('click', () => tapIncubator(i, refs.el));
    if (slot) {
      refs.glyph.textContent = '🥚';
      refs.glyph.style.fontSize = '2.1rem';
      refs.name.textContent = 'Œuf';
      refs.tier.textContent = 'en couvaison';
    } else {
      refs.glyph.textContent = '◌';
      refs.glyph.style.fontSize = '2.1rem';
      refs.glyph.style.opacity = '0.35';
      refs.name.textContent = 'Incubateur libre';
      refs.tier.textContent = state.eggs > 0 ? 'clique pour placer un œuf' : 'achète un œuf';
      refs.bar.parentElement.style.visibility = 'hidden';
    }
    host.appendChild(refs.el);
  });

  $('incub-meta').textContent = state.incubators + (state.incubators > 1 ? ' places' : ' place');
  $('hint-incub').hidden = state.pen.length > 0 || seenCount() > 1;
}

function renderPen() {
  const sig = state.pens + '|' + state.pen
    .map(c => c.id + ':' + c.tier + (isAdult(c) ? 'A' : 'G')).join(',');
  if (sig === penSig) return;
  penSig = sig;

  const host = $('pen');
  host.textContent = '';
  for (const k of [...cards.keys()]) if (k.startsWith('c:')) cards.delete(k);

  for (const c of state.pen) {
    const f = form(c.line, c.tier);
    const refs = buildCard('c:' + c.id, { tappable: true });
    refs.el.addEventListener('click', () => tapCreature(c, refs.el));
    refs.glyph.textContent = f[1];
    refs.glyph.style.fontSize = GLYPH_REM[c.tier - 1] + 'rem';
    refs.name.textContent = f[0];
    refs.tier.textContent = 'palier ' + c.tier + (c.tier === 5 ? ' · légendaire' : '');
    if (c.tier === 5) refs.el.classList.add('apex');
    addActions(refs, [
      { cls: 'feed', run: el => feed(c, el) },
      { cls: 'sell', run: el => sell(c, el) },
      { cls: 'evo',  run: el => evolve(c, el) },
    ]);
    // n'anime que ce qui vient d'arriver, sinon toutes les cartes sautent à chaque redessin
    const stamp = c.id + ':' + c.tier;
    if (!popped.has(stamp)) { popped.add(stamp); flash(refs.el, 'pop'); }
    host.appendChild(refs.el);
  }
  popped.forEach(s => {
    const id = parseInt(s, 10);
    if (!state.pen.some(c => c.id === id)) popped.delete(s);
  });

  $('pen-meta').textContent = state.pen.length + ' / ' + state.pens +
    (state.pens > 1 ? ' places' : ' place');
  $('pen-empty').hidden = state.pen.length > 0;
}

function renderShop() {
  if (shopBuilt) return;
  shopBuilt = true;

  const items = [
    { key: 'egg',   title: 'Œuf',        desc: 'Lignée inconnue jusqu’à l’éclosion.', cost: () => EGG_PRICE,  run: buyEgg },
    { key: 'incub', title: 'Incubateur', desc: 'Un œuf de plus en couvaison.',        cost: incubCost,        run: buyIncubator },
    { key: 'pen',   title: 'Enclos',     desc: 'Une créature de plus en croissance.', cost: penCost,          run: buyPen },
  ];

  const shop = $('shop');
  shop.textContent = '';
  for (const it of items) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'buy';
    b.innerHTML = '<span class="t"></span><span class="p"></span><span class="d"></span>';
    b.querySelector('.t').textContent = it.title;
    b.querySelector('.d').textContent = it.desc;
    b.addEventListener('click', it.run);
    li.appendChild(b);
    shop.appendChild(li);
    cards.set('shop:' + it.key, { el: b, price: b.querySelector('.p'), cost: it.cost });
  }

  const autos = $('autos');
  autos.textContent = '';
  for (const u of UPGRADES) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'buy';
    b.innerHTML = '<span class="t"></span><span class="p"></span><span class="d"></span>';
    b.querySelector('.t').textContent = u.name;
    b.querySelector('.d').textContent = u.desc;
    b.addEventListener('click', () => buyUpgrade(u));
    li.appendChild(b);
    autos.appendChild(li);
    cards.set('up:' + u.key, { el: b, price: b.querySelector('.p'), up: u });
  }
}

function renderCollection() {
  const sig = seenCount() + '';
  if (sig === collSig) return;
  collSig = sig;

  const host = $('collection');
  host.textContent = '';
  for (const line of LINES) {
    for (let t = 1; t <= 5; t++) {
      const got = !!state.seen[line.key + ':' + t];
      const cell = document.createElement('div');
      cell.className = 'cell' + (got ? ' got' : ' locked') + (t === 5 ? ' t5' : '');
      cell.title = got ? line.forms[t - 1][0] : line.name + ' — palier ' + t;
      if (got) cell.textContent = line.forms[t - 1][1];
      host.appendChild(cell);
    }
  }
  $('coll-meta').textContent = seenCount() + ' / 25';
}

// Mise à jour rapide : jauges, minuteurs, disponibilité des boutons
function tickView() {
  $('coins').textContent = fmt(state.coins);

  state.incub.forEach((slot, i) => {
    const refs = cards.get('i:' + i);
    if (!refs) return;
    if (slot) {
      const ratio = Math.min(1, slot.p / HATCH);
      refs.bar.style.width = (ratio * 100) + '%';
      const ready = slot.p >= HATCH;
      refs.el.classList.toggle('ready', ready);
      refs.el.classList.toggle('blocked', ready && penFull());
      refs.timer.textContent = ready
        ? (penFull() ? 'enclos plein' : 'ça sort !')
        : fmtTime(HATCH - slot.p);
    } else {
      refs.timer.textContent = '';
    }
  });

  for (const c of state.pen) {
    const refs = cards.get('c:' + c.id);
    if (!refs) continue;
    const g = growTime(c);
    const adult = isAdult(c);
    refs.bar.style.width = Math.min(100, (c.p / g) * 100) + '%';
    refs.el.classList.toggle('ready', adult && c.tier < 5);
    refs.timer.textContent = adult ? 'adulte' : fmtTime(g - c.p);

    // la taille change sans changer la structure : elle se met à jour ici, pas au redessin
    const sf = sizeFactor(c);
    const size = (GLYPH_REM[c.tier - 1] * Math.min(OVER_VIS, sf)).toFixed(2) + 'rem';
    if (refs.lastSize !== size) { refs.glyph.style.fontSize = size; refs.lastSize = size; }
    const label = 'palier ' + c.tier + (c.tier === 5 ? ' · légendaire' : '') +
      (sf > 1.005 ? ' · taille ×' + sf.toFixed(2).replace('.', ',') : '');
    if (refs.lastLabel !== label) { refs.tier.textContent = label; refs.lastLabel = label; }

    const q = adult ? overfeedQuote(c) : feedQuote(c);
    const bFeed = refs.acts.feed, bSell = refs.acts.sell, bEvo = refs.acts.evo;
    bFeed.textContent = (adult ? 'Grossir ' : 'Nourrir ') + fmt(q ? q.cost : 0);
    bFeed.title = adult
      ? 'Fait grossir sans limite. La valeur monte un peu moins vite que la nourriture ne coûte.'
      : 'Accélère la croissance et libère la place plus vite.';
    bFeed.disabled = !q || state.coins < q.cost;
    bSell.textContent = 'Vendre ' + fmt(sellValue(c));
    bSell.disabled = !adult;
    if (c.tier >= 5) {
      bEvo.textContent = 'Forme finale';
      bEvo.title = 'Plus rien au-dessus — il ne reste qu’à la faire grossir.';
      bEvo.disabled = true;
    } else {
      bEvo.textContent = 'Évoluer ' + fmt(evoCost(c));
      bEvo.title = isFat(c)
        ? 'Attention : évoluer ramène la taille à ×1. Vends-la d’abord si tu l’as engraissée pour ça.'
        : 'Passe au palier suivant. La croissance repart de zéro.';
      bEvo.classList.toggle('warn-evo', isFat(c));
      bEvo.disabled = !adult || state.coins < evoCost(c);
    }
  }

  for (const key of ['egg', 'incub', 'pen']) {
    const r = cards.get('shop:' + key);
    if (!r) continue;
    const cost = r.cost();
    r.price.textContent = fmt(cost);
    r.el.disabled = state.coins < cost;
  }
  const eggRef = cards.get('shop:egg');
  if (eggRef) {
    eggRef.el.querySelector('.d').textContent = state.eggs > 0
      ? 'Lignée inconnue jusqu’à l’éclosion. En réserve : ' + state.eggs + '.'
      : 'Lignée inconnue jusqu’à l’éclosion.';
  }

  for (const u of UPGRADES) {
    const r = cards.get('up:' + u.key);
    if (!r) continue;
    const owned = state.up[u.key];
    r.el.classList.toggle('owned', owned);
    r.price.textContent = owned ? 'acquis' : fmt(u.cost);
    r.el.disabled = owned || state.coins < u.cost;
  }

  $('cfg-marchand').hidden = !state.up.marchand;
  $('cfg-mangeoire').hidden = !state.up.mangeoire;
}

// Les fonctions de rendu se protègent elles-mêmes par signature :
// elles ne reconstruisent le DOM que si la structure a réellement changé.
function refresh() {
  renderIncubators();
  renderPen();
  renderCollection();
  tickView();
}

/* ─────────────────────────────────────────────
   Démarrage
   ───────────────────────────────────────────── */

function bindTools() {
  $('btn-speed').addEventListener('click', () => {
    state.speed = state.speed === 1 ? 10 : state.speed === 10 ? 100 : 1;
    $('btn-speed').textContent = '×' + state.speed;
  });

  $('btn-sound').addEventListener('click', () => {
    state.sound = !state.sound;
    $('btn-sound').setAttribute('aria-pressed', String(state.sound));
    if (state.sound) blip(660, 0.06, 'triangle', 0.03);
  });

  $('btn-reset').addEventListener('click', () => {
    if (!confirm('Effacer la partie et repartir de zéro ?')) return;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
    location.reload();
  });

  $('sel-marchand').addEventListener('change', e => {
    state.sellUpTo = parseInt(e.target.value, 10) || 0;
  });

  $('chk-mangeoire').addEventListener('change', e => {
    state.autoFeed = e.target.checked;
  });
}

function start() {
  state = load();
  bindTools();

  $('btn-speed').textContent = '×' + state.speed;
  $('btn-sound').setAttribute('aria-pressed', String(state.sound));
  $('sel-marchand').value = String(state.sellUpTo);
  $('chk-mangeoire').checked = !!state.autoFeed;

  // première partie : on note la lignée de l'œuf offert seulement à l'éclosion
  renderShop();
  catchUp();
  refresh();

  setInterval(loop, 100);
  setInterval(save, 5000);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
}

start();
