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
const TIER_SCALE = [1, 1.1, 1.22, 1.35, 1.5];                 // grossissement visuel par palier

const EGG_PRICE  = 12;
const INCUB_BASE = 150;
const PEN_BASE   = 400;
const SLOT_MULT  = 1.6;

const FEED_CHUNK = 60;      // secondes ajoutées par ration
const FEED_RATIO = 0.8;     // une ration coûte 80 % de ce qu'elle fait gagner
const AUTOFEED_X = 2;       // la mangeoire ajoute 2 s par seconde (croissance ×3)

/* Croissance après l'âge adulte — elle ne s'arrête jamais.
   Un clic vaut toujours une seconde de vie, avant comme après l'âge adulte ; c'est le
   rendement qui s'essouffle (OVER_GAIN, logarithmique) pendant que le coût de la nourriture
   reste linéaire (OVER_COST). Faire un animal énorme est donc un vrai effort, et jamais
   un moyen de gagner sa vie. Le rapport est le même à tous les paliers. */
const OVER_CHUNK = 60;      // secondes d'engraissement par ration
const OVER_COST  = 0.5;     // ce que coûte une seconde d'engraissement
const OVER_GAIN  = 0.55;    // ce qu'elle rapporte, en rendement décroissant
const SIZE_VIS   = 1.5;     // grossissement visuel maximal, pour ne pas crever la scène

// Les rangs de taille qualifient l'adulte : « adulte », puis « adulte grand », « adulte
// énorme »… Ils donnent un cap à viser une fois la croissance terminée.
const RANKS = [
  { at: 1.00, name: '' },
  { at: 1.30, name: 'grand' },
  { at: 1.70, name: 'énorme' },
  { at: 2.30, name: 'colossal' },
  { at: 3.20, name: 'titanesque' },
  { at: 4.50, name: 'démesuré' },
];

/* Étapes de vie, traversées à l'intérieur de chaque palier.
   ENFANT_JUSQU / ADO_JUSQU découpent la barre de croissance ; l'échelle visuelle, elle,
   est continue — l'animal grossit à chaque clic plutôt que de sauter d'un cran à l'autre. */
const ENFANT_JUSQU = 0.40;
const LIFE_MIN     = 0.5;   // taille d'un nouveau-né, en fraction de sa taille adulte

const UPGRADES = [
  { key: 'couveuse',  name: 'Couveuse automatique', cost: 120,
    desc: 'Les œufs couvent tout seuls, même quand tu n’es pas là.' },
  { key: 'eleveur',   name: 'Éleveur automatique', cost: 500,
    desc: 'Les créatures grandissent toutes seules jusqu’à l’âge adulte.' },
  { key: 'acheteur',  name: 'Acheteur automatique', cost: 2000,
    desc: 'Achète et place un œuf dès qu’un incubateur se libère.' },
  { key: 'mangeoire', name: 'Mangeoire automatique', cost: 15000,
    desc: 'Nourrit en continu pour accélérer la croissance, tant qu’il reste des pièces.' },
  { key: 'marchand',  name: 'Marchand automatique', cost: 100000,
    desc: 'Vend les adultes selon la règle que tu définis.' },
];

/* Chaque forme : [nom, glyphe adulte, glyphe juvénile].
   Le juvénile sert pendant l'enfance et l'adolescence — c'est ce qui fait qu'une wyverne
   commence sa vie en lézard et qu'un léviathan commence en serpent de mer. Là où les emoji
   n'offrent aucune variante (toute la lignée du crapaud), les deux sont identiques et seule
   l'échelle raconte la croissance : ce sont ces cases-là qui réclament de vrais dessins. */
const LINES = [
  { key: 'crapaud', name: 'Crapaud', forms: [
    ['Têtard', '🐸', '🐸'], ['Crapaud', '🐸', '🐸'], ['Crapaud-buffle', '🐸', '🐸'],
    ['Colosse fangeux', '🐸', '🐸'], ['Gama, crapaud-montagne', '🐸', '🐸'] ] },
  { key: 'poisson', name: 'Poisson', forms: [
    ['Alevin', '🐟', '🐟'], ['Carpe', '🐟', '🐟'], ['Carpe centenaire', '🐠', '🐟'],
    ['Serpent de mer', '🐍', '🐠'], ['Léviathan', '🐉', '🐍'] ] },
  { key: 'lezard', name: 'Lézard', forms: [
    ['Lézardeau', '🦎', '🦎'], ['Lézard', '🦎', '🦎'], ['Varan', '🦎', '🦎'],
    ['Wyverne', '🐲', '🦎'], ['Dragon de terre', '🐉', '🐲'] ] },
  { key: 'oiseau', name: 'Oiseau', forms: [
    ['Oisillon', '🐤', '🐣'], ['Passereau', '🐦', '🐤'], ['Rapace', '🦅', '🐦'],
    ['Roc', '🦅', '🦅'], ['Phénix', '🔥', '🦅'] ] },
  { key: 'crocodile', name: 'Crocodile', forms: [
    ['Crocodillon', '🐊', '🐊'], ['Crocodile', '🐊', '🐊'], ['Crocodile ancien', '🐊', '🐊'],
    ['Draco-saurien', '🐲', '🐊'], ['Dragon-tonnerre', '🐉', '🐲'] ] },
];

const LINE_BY_KEY = Object.fromEntries(LINES.map(l => [l.key, l]));

/* ─────────────────────────────────────────────
   État
   ───────────────────────────────────────────── */

const SAVE_KEY = 'eclosion.jalon0';
const OFFLINE_CAP = 24 * 3600;

let state, nextId = 1, lastFrame = Date.now(), isNewGame = false, stopSaving = false;

function freshState() {
  return {
    v: 2,
    coins: 0,
    eggs: 0,
    incubators: 1,
    pens: 1,
    incub: [{ line: randomLine(), p: 0 }],   // le premier œuf est offert, déjà en place
    pen: [],
    sel: 'i:0',
    up: { couveuse: false, eleveur: false, acheteur: false, mangeoire: false, marchand: false },
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
    isNewGame = true;
    return freshState();
  }
}

function save() {
  if (stopSaving) return;          // le bouton ⟲ coupe la sauvegarde avant de recharger
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
const isAdult   = c => c.p >= growTime(c);
const form      = (lineKey, tier) => LINE_BY_KEY[lineKey].forms[tier - 1];
const penFull   = () => state.pen.length >= state.pens;

const incubCost = () => Math.round(INCUB_BASE * Math.pow(SLOT_MULT, state.incubators - 1));
const penCost   = () => Math.round(PEN_BASE   * Math.pow(SLOT_MULT, state.pens - 1));

// La taille se mesure en durées de croissance avalées en plus, et l'évolution la remet
// à zéro : un têtard bien gras donne un crapaud de taille ordinaire. On engraisse donc
// une créature qu'on garde ou qu'on vend telle quelle, jamais une qu'on va faire évoluer.
const sizeFactor = c => 1 + OVER_GAIN * Math.log(1 + (c.over || 0) / growTime(c));
const sellValue  = c => Math.round(baseValue(c) * sizeFactor(c));
const isFat      = c => sizeFactor(c) > 1.005;

function rankOf(sf) {
  let i = 0;
  while (i + 1 < RANKS.length && sf >= RANKS[i + 1].at) i++;
  return { name: RANKS[i].name, from: RANKS[i].at, next: RANKS[i + 1] || null };
}

/* L'étape de vie : ce que le joueur voit changer sous ses clics.
   œuf → enfant → adolescent → adulte → adulte grand (puis énorme, colossal…). */
function stageOf(c) {
  const ratio = c.p / growTime(c);
  if (ratio < ENFANT_JUSQU) return { key: 'enfant', name: 'enfant' };
  if (ratio < 1) return { key: 'ado', name: 'adolescent' };
  const rank = rankOf(sizeFactor(c)).name;
  return { key: rank ? 'grand' : 'adulte', name: rank ? 'adulte ' + rank : 'adulte' };
}

// Juvénile tant qu'il n'est pas adulte, puis la forme définitive.
function glyphOf(c) {
  const f = form(c.line, c.tier);
  return isAdult(c) ? f[1] : (f[2] || f[1]);
}

// Échelle visuelle : continue pendant la croissance, puis prolongée par l'engraissement.
function visualScale(c) {
  const ratio = Math.min(1, c.p / growTime(c));
  const life = LIFE_MIN + (1 - LIFE_MIN) * ratio;
  return TIER_SCALE[c.tier - 1] * life * Math.min(SIZE_VIS, sizeFactor(c));
}

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
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function dec(n, d) { return n.toFixed(d === undefined ? 2 : d).replace('.', ','); }

function fmtTime(s) {
  s = Math.max(0, Math.ceil(s));
  if (s < 60) return s + ' s';
  if (s < 3600) return Math.floor(s / 60) + ' m ' + String(s % 60).padStart(2, '0') + ' s';
  return Math.floor(s / 3600) + ' h ' + String(Math.floor((s % 3600) / 60)).padStart(2, '0') + ' m';
}

// Tant que rien ne pousse tout seul, afficher un compte à rebours en secondes serait un
// mensonge : ce qui reste à faire se mesure en clics.
function remaining(left, automated) {
  if (automated) return fmtTime(left);
  const n = Math.ceil(left);
  return n + (n > 1 ? ' clics' : ' clic');
}

function markSeen(lineKey, tier) { state.seen[lineKey + ':' + tier] = true; }
const seenCount = () => Object.keys(state.seen).length;

/* ─────────────────────────────────────────────
   Le sujet à l'écran — un seul à la fois
   ───────────────────────────────────────────── */

function subjects() {
  const list = state.incub.map((slot, i) => ({ key: 'i:' + i, kind: 'egg', i, slot }));
  for (const c of state.pen) list.push({ key: 'c:' + c.id, kind: 'creature', c });
  return list;
}

function current() {
  const list = subjects();
  return list.find(s => s.key === state.sel)
      || list.find(s => s.kind === 'creature')
      || list.find(s => s.kind === 'egg' && s.slot)
      || list[0]
      || null;
}

function select(key) {
  state.sel = key;
  refresh();
}

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
    const d = 55 + Math.random() * 60;
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

// Le coup de grossissement, réservé au changement de rang de taille.
function pulse() {
  const el = document.querySelector('.subject-scale');
  if (el) flash(el, 'grew');
}

/* ─────────────────────────────────────────────
   Actions
   ───────────────────────────────────────────── */

function tapStage() {
  const s = current();
  if (!s) return;
  const el = $('subject');
  const pt = centerOf(el);
  const jitter = () => pt.x + (Math.random() * 60 - 30);

  if (s.kind === 'egg') {
    if (!s.slot) { placeEgg(s.i); return; }
    if (s.slot.p >= HATCH) return;
    s.slot.p += 1;
    flash(el, 'shake');
    floatText(jitter(), pt.y - 20, '+1 s');
    blip(220 + Math.random() * 60, 0.035, 'square', 0.02);
    if (s.slot.p >= HATCH) hatchAll(); else refresh();
    return;
  }

  const c = s.c;
  const before = isAdult(c) ? sizeFactor(c) : 0;
  // Un clic vaut une seconde de vie, avant comme après l'âge adulte : la créature
  // ne cesse jamais de grandir, seul le rendement diminue.
  if (isAdult(c)) c.over = (c.over || 0) + 1; else c.p += 1;
  flash(el, 'shake');
  floatText(jitter(), pt.y - 20, '+1 s');
  blip(180 + Math.random() * 50, 0.035, 'square', 0.02);
  if (before && rankOf(sizeFactor(c)).name !== rankOf(before).name) {
    refresh();                                  // la nouvelle échelle avant l'animation
    burst(pt.x, pt.y, '✦', 10);
    floatText(pt.x, pt.y - 70, rankOf(sizeFactor(c)).name, 'gain');
    chord([523, 659, 784]);
    pulse();
    return;
  }
  refresh();
}

function placeEgg(i) {
  if (state.incub[i] || state.eggs <= 0) return;
  state.eggs--;
  state.incub[i] = { line: randomLine(), p: 0 };   // la lignée est tirée ici, révélée à l'éclosion
  state.sel = 'i:' + i;
  blip(330, 0.05, 'sine', 0.03);
  refresh();
}

function hatchAll() {
  let hatched = 0, lastKey = null;
  for (let i = 0; i < state.incub.length; i++) {
    const slot = state.incub[i];
    if (!slot || slot.p < HATCH) continue;
    if (penFull()) continue;
    const c = { id: nextId++, line: slot.line, tier: 1, p: 0, over: 0 };
    state.pen.push(c);
    state.incub[i] = null;
    markSeen(slot.line, 1);
    lastKey = 'c:' + c.id;
    hatched++;
  }
  if (hatched) {
    // la bête qui vient de sortir prend la scène
    if (state.sel && state.sel.startsWith('i:')) state.sel = lastKey;
    const pt = centerOf($('subject'));
    burst(pt.x, pt.y, '✦', 12);
    chord([523, 659, 784]);
    popNext = true;
  }
  refresh();
  return hatched;
}

function feed(c) {
  const adult = isAdult(c);
  const q = adult ? overfeedQuote(c) : feedQuote(c);
  if (!q || state.coins < q.cost) return;

  const before = adult ? sellValue(c) : 0;
  const rankBefore = adult ? rankOf(sizeFactor(c)).name : null;
  state.coins -= q.cost;
  if (adult) c.over = (c.over || 0) + q.seconds;
  else c.p = Math.min(growTime(c), c.p + q.seconds);

  const el = $('subject');
  const pt = centerOf(el);
  floatText(pt.x, pt.y, '−' + fmt(q.cost));
  if (adult) {
    floatText(pt.x, pt.y - 40, '+' + fmt(sellValue(c) - before) + ' de valeur', 'gain');
    flash(el, 'shake');
    if (rankOf(sizeFactor(c)).name !== rankBefore) {
      refresh();
      burst(pt.x, pt.y, '✦', 10);
      chord([523, 659, 784]);
      pulse();
      blip(320, 0.05, 'sine', 0.03);
      return;
    }
  }
  blip(adult ? 320 : 400, 0.05, 'sine', 0.03);
  refresh();
}

function sell(c) {
  if (!isAdult(c)) return;
  const gain = sellValue(c);
  state.coins += gain;
  state.pen = state.pen.filter(x => x.id !== c.id);
  if (state.sel === 'c:' + c.id) state.sel = null;
  const pt = centerOf($('subject'));
  floatText(pt.x, pt.y, '+' + fmt(gain), 'gain');
  burst(pt.x, pt.y, '🪙', 8);
  chord([392, 523], 55);
  refresh();
}

function evolve(c) {
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
  const pt = centerOf($('subject'));
  burst(pt.x, pt.y, c.tier === 5 ? '✦' : '✧', 14);
  floatText(pt.x, pt.y - 80, form(c.line, c.tier)[0], 'gain');
  chord([440, 554, 659, 880], 80);
  popNext = true;
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

// Le temps ne fait avancer que ce qui a été automatisé. Tant que rien n'est acheté,
// seuls le clic et la nourriture font bouger quoi que ce soit.
function advance(dt) {
  if (state.up.couveuse) {
    for (const slot of state.incub) {
      if (slot && slot.p < HATCH) slot.p = Math.min(HATCH, slot.p + dt);
    }
  }
  if (state.up.eleveur) {
    for (const c of state.pen) {
      const g = growTime(c);
      if (c.p < g) c.p = Math.min(g, c.p + dt);
    }
  }
}

function runAutomations(dt) {
  if (state.up.mangeoire && state.autoFeed) {
    for (const c of state.pen) {
      // la mangeoire s'arrête à l'âge adulte : engraisser est une décision, pas un automatisme
      const left = growTime(c) - c.p;
      if (left <= 0) continue;
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
  if (state.up.acheteur) {
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
  // une première partie ne doit pas s'ouvrir sur « pendant ton absence », et tant que rien
  // n'est automatisé il ne s'est effectivement rien passé pendant l'absence
  if (isNewGame || elapsed < 30) return;
  if (!state.up.couveuse && !state.up.eleveur) return;

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

const refs = {};           // éléments de la boutique et des actions, construits une fois
const thumbs = new Map();
let stripSig = '', collSig = '', popNext = false;

/* La scène se redessine dix fois par seconde. Réécrire une propriété avec la même valeur
   n'est pas neutre : sur une propriété animée, chaque écriture relance la transition, qui
   n'atteint donc jamais sa cible — c'est ce qui empêchait la créature de grossir à l'écran.
   Ces trois helpers ne touchent au DOM que si la valeur a réellement changé. */
function setText(el, v) { if (el.textContent !== v) el.textContent = v; }
function setHtml(el, v) { if (el.__html !== v) { el.__html = v; el.innerHTML = v; } }
function setVar(el, name, v) { if (el.__var !== v) { el.__var = v; el.style.setProperty(name, v); } }
function setWidth(el, v) { if (el.__w !== v) { el.__w = v; el.style.width = v; } }

function buildChrome() {
  // les actions de la scène : construites une fois, montrées selon le sujet
  const host = $('stage-acts');
  host.textContent = '';
  refs.acts = {};
  const defs = [
    { key: 'place', cls: 'grow', run: () => { const s = current(); if (s && s.kind === 'egg') placeEgg(s.i); } },
    { key: 'grow',  cls: 'grow', run: () => { const s = current(); if (s && s.c) feed(s.c); } },
    { key: 'sell',  cls: 'sell', run: () => { const s = current(); if (s && s.c) sell(s.c); } },
    { key: 'evo',   cls: 'evo',  run: () => { const s = current(); if (s && s.c) evolve(s.c); } },
  ];
  for (const d of defs) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'act ' + d.cls;
    b.addEventListener('click', d.run);
    host.appendChild(b);
    refs.acts[d.key] = b;
  }

  const items = [
    { key: 'egg',   title: 'Œuf',        desc: 'Lignée inconnue jusqu’à l’éclosion.', cost: () => EGG_PRICE, run: buyEgg },
    { key: 'incub', title: 'Incubateur', desc: 'Un œuf de plus en couvaison.',        cost: incubCost,       run: buyIncubator },
    { key: 'pen',   title: 'Enclos',     desc: 'Une créature de plus en croissance.', cost: penCost,         run: buyPen },
  ];
  refs.shop = {};
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
    refs.shop[it.key] = { el: b, price: b.querySelector('.p'), desc: b.querySelector('.d'), cost: it.cost };
  }

  refs.up = {};
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
    refs.up[u.key] = { el: b, price: b.querySelector('.p'), up: u };
  }
}

function renderStrip() {
  const list = subjects();
  // l'étape de vie entre dans la signature : la vignette se redessine quand la bête
  // change de silhouette, soit trois ou quatre fois par créature — c'est négligeable.
  const sig = list.map(s => s.kind === 'egg'
    ? 'i' + s.i + (s.slot ? ':' + s.slot.line : ':-')
    : 'c' + s.c.id + ':' + s.c.tier + ':' + stageOf(s.c).key).join(',');
  if (sig === stripSig) return;
  stripSig = sig;

  const host = $('strip');
  host.textContent = '';
  thumbs.clear();

  for (const s of list) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.addEventListener('click', () => select(s.key));

    const glyph = document.createElement('span');
    glyph.className = 'thumb-glyph';
    const bar = document.createElement('span');
    bar.className = 'thumb-bar';
    const fill = document.createElement('i');
    bar.appendChild(fill);
    const tag = document.createElement('span');
    tag.className = 'thumb-tag';

    if (s.kind === 'egg') {
      glyph.textContent = s.slot ? '🥚' : '◌';
      if (!s.slot) b.classList.add('empty');
      tag.textContent = s.slot ? 'œuf' : 'libre';
    } else {
      glyph.textContent = glyphOf(s.c);
      // la vignette reprend l'échelle de la scène, en réduction
      glyph.style.fontSize = (0.9 + 0.75 * Math.min(2.25, visualScale(s.c))).toFixed(2) + 'rem';
      tag.textContent = stageOf(s.c).key === 'enfant' ? 'enfant'
                      : stageOf(s.c).key === 'ado' ? 'ado' : 'p.' + s.c.tier;
      if (s.c.tier === 5) b.classList.add('apex');
    }

    b.append(glyph, bar, tag);
    host.appendChild(b);
    thumbs.set(s.key, { el: b, bar: fill, tag });
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

function renderStage() {
  const s = current();
  const stage = document.querySelector('.stage');
  const subject = $('subject');
  const acts = refs.acts;
  const hide = k => { acts[k].hidden = true; };

  if (!s) {
    setText($('stage-glyph'), '◌');
    setText($('stage-name'), 'Rien en vue');
    setHtml($('stage-meta'), '');
    setText($('stage-timer'), '');
    setWidth($('stage-fill'), '0%');
    setText($('stage-hint'), 'Achète un œuf pour recommencer.');
    ['place', 'grow', 'sell', 'evo'].forEach(hide);
    return;
  }

  if (state.sel !== s.key) state.sel = s.key;

  if (s.kind === 'egg') {
    const slot = s.slot;
    stage.classList.remove('apex');
    // l'œuf gonfle doucement à mesure qu'il couve
    const ratio = slot ? Math.min(1, slot.p / HATCH) : 0;
    setVar(subject, '--sz', slot ? (0.8 + 0.25 * ratio).toFixed(3) : '0.9');
    setText($('stage-glyph'), slot ? '🥚' : '◌');
    setText($('stage-name'), slot ? 'Œuf' : 'Incubateur libre');
    stage.classList.toggle('cracking', !!slot && ratio > 0.65);

    if (slot) {
      const ready = slot.p >= HATCH;
      stage.classList.toggle('ready', ready);
      setHtml($('stage-meta'), ready ? 'ça sort !' : (ratio > 0.65 ? 'ça craque' : 'en couvaison'));
      setWidth($('stage-fill'), Math.min(100, (slot.p / HATCH) * 100) + '%');
      setText($('stage-timer'), ready
        ? (penFull() ? 'enclos plein — vends ou achète un enclos' : 'ça sort !')
        : remaining(HATCH - slot.p, state.up.couveuse));
      $('stage-timer').classList.toggle('done', ready);
      setText($('stage-hint'), state.up.couveuse
        ? '' : 'Clique sur l’œuf pour le faire éclore. Rien n’avance tout seul au début.');
      ['place', 'grow', 'sell', 'evo'].forEach(hide);
    } else {
      stage.classList.remove('ready');
      setHtml($('stage-meta'), 'vide');
      setWidth($('stage-fill'), '0%');
      setText($('stage-timer'), '');
      $('stage-timer').classList.remove('done');
      setText($('stage-hint'), state.eggs > 0
        ? 'Tu as ' + state.eggs + ' œuf(s) en réserve.'
        : 'Achète un œuf dans la boutique.');
      ['grow', 'sell', 'evo'].forEach(hide);
      acts.place.hidden = false;
      setText(acts.place, 'Placer un œuf');
      acts.place.disabled = state.eggs <= 0;
    }
    return;
  }

  const c = s.c;
  const f = form(c.line, c.tier);
  const adult = isAdult(c);
  const sf = sizeFactor(c);
  const rank = rankOf(sf);
  const stg = stageOf(c);

  stage.classList.remove('cracking');
  stage.classList.toggle('apex', c.tier === 5);
  stage.classList.toggle('ready', adult);
  // point décimal obligatoire : le CSS ne sait pas lire « 1,5 »
  setVar(subject, '--sz', visualScale(c).toFixed(3));
  setText($('stage-glyph'), glyphOf(c));
  setText($('stage-name'), f[0]);

  setHtml($('stage-meta'), 'palier ' + c.tier + (c.tier === 5 ? ' · légendaire' : '') +
    ' · <span class="rank">' + stg.name + '</span>' +
    (isFat(c) ? ' · ×' + dec(sf) : ''));

  if (!adult) {
    setWidth($('stage-fill'), Math.min(100, (c.p / growTime(c)) * 100) + '%');
    setText($('stage-timer'), remaining(growTime(c) - c.p, state.up.eleveur));
    $('stage-timer').classList.remove('done');
    setText($('stage-hint'), state.up.eleveur
      ? '' : 'Clique dessus pour la faire grandir. Elle ne pousse pas toute seule sans éleveur.');
  } else {
    // adulte : la barre vise le rang de taille suivant, la croissance ne s'arrête jamais
    if (rank.next) {
      const span = rank.next.at - rank.from;
      setWidth($('stage-fill'), Math.min(100, ((sf - rank.from) / span) * 100).toFixed(1) + '%');
      setText($('stage-timer'), 'adulte · ' + rank.next.name + ' à ×' + dec(rank.next.at));
    } else {
      setWidth($('stage-fill'), '100%');
      setText($('stage-timer'), 'adulte · plus aucun rang au-dessus');
    }
    $('stage-timer').classList.add('done');
    setText($('stage-hint'), 'Continue à cliquer : elle grandit sans fin, de plus en plus lentement.');
  }

  acts.place.hidden = true;
  const q = adult ? overfeedQuote(c) : feedQuote(c);
  acts.grow.hidden = false;
  setText(acts.grow, 'Nourrir ' + fmt(q ? q.cost : 0));
  acts.grow.title = adult
    ? 'Fait grossir sans limite. La valeur monte un peu moins vite que la nourriture ne coûte.'
    : 'Accélère la croissance et libère la place plus vite.';
  acts.grow.disabled = !q || state.coins < q.cost;

  acts.sell.hidden = false;
  setText(acts.sell, 'Vendre ' + fmt(sellValue(c)));
  acts.sell.disabled = !adult;

  acts.evo.hidden = false;
  if (c.tier >= 5) {
    setText(acts.evo, 'Forme finale');
    acts.evo.title = 'Plus rien au-dessus — il ne reste qu’à la faire grossir.';
    acts.evo.disabled = true;
    acts.evo.classList.remove('warn-evo');
  } else {
    setText(acts.evo, 'Évoluer ' + fmt(evoCost(c)));
    acts.evo.title = isFat(c)
      ? 'Attention : évoluer ramène la taille à ×1. Vends-la d’abord si tu l’as engraissée pour ça.'
      : 'Passe au palier suivant. La croissance repart de zéro.';
    acts.evo.classList.toggle('warn-evo', isFat(c));
    acts.evo.disabled = !adult || state.coins < evoCost(c);
  }
}

function tickView() {
  $('coins').textContent = fmt(state.coins);

  for (const s of subjects()) {
    const t = thumbs.get(s.key);
    if (!t) continue;
    t.el.setAttribute('aria-current', String(s.key === state.sel));
    if (s.kind === 'egg') {
      const ready = s.slot && s.slot.p >= HATCH;
      setWidth(t.bar, s.slot ? Math.min(100, (s.slot.p / HATCH) * 100).toFixed(1) + '%' : '0%');
      t.el.classList.toggle('done', !!ready);
      if (s.slot) setText(t.tag, ready ? 'prêt' : 'œuf');
    } else {
      const adult = isAdult(s.c);
      const k = stageOf(s.c).key;
      setWidth(t.bar, Math.min(100, (s.c.p / growTime(s.c)) * 100).toFixed(1) + '%');
      t.el.classList.toggle('done', adult);
      setText(t.tag, k === 'enfant' ? 'enfant' : k === 'ado' ? 'ado'
              : 'p.' + s.c.tier + (k === 'grand' ? ' ✦' : ''));
    }
  }

  $('strip-meta').textContent =
    state.incubators + (state.incubators > 1 ? ' incubateurs' : ' incubateur') + ' · ' +
    state.pen.length + '/' + state.pens + (state.pens > 1 ? ' enclos' : ' enclos') +
    (state.eggs > 0 ? ' · ' + state.eggs + ' œuf(s) en réserve' : '');

  for (const key of ['egg', 'incub', 'pen']) {
    const r = refs.shop[key];
    const cost = r.cost();
    r.price.textContent = fmt(cost);
    r.el.disabled = state.coins < cost;
  }
  refs.shop.egg.desc.textContent = state.eggs > 0
    ? 'Lignée inconnue jusqu’à l’éclosion. En réserve : ' + state.eggs + '.'
    : 'Lignée inconnue jusqu’à l’éclosion.';

  for (const u of UPGRADES) {
    const r = refs.up[u.key];
    const owned = state.up[u.key];
    r.el.classList.toggle('owned', owned);
    r.price.textContent = owned ? 'acquis' : fmt(u.cost);
    r.el.disabled = owned || state.coins < u.cost;
  }

  $('cfg-marchand').hidden = !state.up.marchand;
  $('cfg-mangeoire').hidden = !state.up.mangeoire;
}

function refresh() {
  renderStrip();
  renderCollection();
  renderStage();
  tickView();
  if (popNext) { popNext = false; flash($('subject'), 'pop'); }
}

/* ─────────────────────────────────────────────
   Démarrage
   ───────────────────────────────────────────── */

function bindTools() {
  $('subject').addEventListener('click', tapStage);

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
    // couper la sauvegarde AVANT de recharger : sinon le beforeunload réécrit
    // aussitôt ce qu'on vient d'effacer, et le bouton semble ne rien faire.
    stopSaving = true;
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
  buildChrome();
  bindTools();

  $('btn-speed').textContent = '×' + state.speed;
  $('btn-sound').setAttribute('aria-pressed', String(state.sound));
  $('sel-marchand').value = String(state.sellUpTo);
  $('chk-mangeoire').checked = !!state.autoFeed;

  catchUp();
  refresh();

  setInterval(loop, 100);
  setInterval(save, 5000);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
}

start();
