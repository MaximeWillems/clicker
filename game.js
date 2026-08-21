/* Éclosion — jalon 0
   Prototype jetable : tout tourne dans le navigateur, sauvegarde en localStorage.
   Le vrai jeu aura un serveur qui fait autorité — ce fichier n'est pas destiné à grandir. */

'use strict';

/* ─────────────────────────────────────────────
   Données — tout ce qui s'équilibre est ici.
   ───────────────────────────────────────────── */

const GROW       = [45, 180, 900, 3600, 21600];               // croissance par palier
const VALUE      = [40, 500, 6000, 80000, 1500000];           // valeur à la vente
const EVOLVE     = [200, 3000, 40000, 600000, null];          // coût pour passer au palier suivant
const TIER_SCALE = [1, 1.1, 1.22, 1.35, 1.5];                 // grossissement visuel par palier

const INCUB_BASE = 150;
const PEN_BASE   = 400;
const SLOT_MULT  = 1.6;

/* Deux axes indépendants, à ne pas confondre :
   le PALIER est la progression d'une bête au fil de sa vie (têtard → crapaud → …),
   la RARETÉ est la lignée dont elle est issue et ne change jamais.

   Les deux axes sont calés pour s'ENCHAÎNER plutôt que se concurrencer : le multiplicateur
   d'une rareté fait sauter à peu près deux paliers, et le coût d'évolution suit le même
   multiplicateur. Monter une rare coûte donc vingt-cinq fois ce que coûte une commune —
   on ne s'y met qu'une fois la ferme commune arrivée à maturité. Chaque rareté est une ère,
   pas un bonus. */
const RARITY = {
  commune:  { name: 'commune',  plur: 'communes',  mult: 1,     rank: 0 },
  rare:     { name: 'rare',     plur: 'rares',     mult: 25,    rank: 1 },
  epique:   { name: 'épique',   plur: 'épiques',   mult: 600,   rank: 2 },
  mythique: { name: 'mythique', plur: 'mythiques', mult: 15000, rank: 3 },
};

// « a, b et c » plutôt que « a, b, c » : les notes doivent se lire à voix haute.
function liste(mots) {
  if (mots.length <= 1) return mots[0] || '';
  return mots.slice(0, -1).join(', ') + ' et ' + mots[mots.length - 1];
}

/* Un œuf par rareté, et chacun ne peut donner QUE sa rareté ou celle juste au-dessus.
   C'est ce qui rend la progression séquentielle : on n'atteint une mythique qu'en achetant
   des œufs épiques, qu'on ne s'offre qu'avec l'argent des rares. Pas de raccourci.
   La chance de monter d'un cran, elle, grandit avec le prix : 3,5 % · 12 % · 25 %. */
const EGG_KINDS = [
  { key: 'commun', name: 'Œuf commun', price: 12, glyph: '🥚', rarity: 'commune',
    up: '3,5 %', hatch: 30,
    odds: { commune: 0.965, rare: 0.035 } },
  { key: 'rare', name: 'Œuf rare', price: 600000, glyph: '🥚', rarity: 'rare',
    up: '12 %', hatch: 180,
    odds: { rare: 0.88, epique: 0.12 } },
  { key: 'epique', name: 'Œuf épique', price: 15000000, glyph: '🥚', rarity: 'epique',
    up: '25 %', hatch: 720,
    odds: { epique: 0.75, mythique: 0.25 } },
  { key: 'mythique', name: 'Œuf mythique', price: 375000000, glyph: '🥚', rarity: 'mythique',
    up: null, hatch: 2700,
    odds: { mythique: 1 } },
];

const EGG_BY_KEY = Object.fromEntries(EGG_KINDS.map(e => [e.key, e]));

/* Plus l'œuf est rare, plus il couve longtemps : 30 s pour un commun, 45 minutes pour un
   mythique. Une bête précieuse doit se faire attendre, sinon la rareté n'a pas de poids —
   et ça donne enfin une raison de monter la couveuse au-delà du niveau 2. */
const hatchTime = slot => (EGG_BY_KEY[slot.kind] || EGG_BY_KEY.commun).hatch;

/* Une bête ne se nourrit jamais contre des pièces : elle grandit au clic et au temps.
   L'éleveur pousse les jeunes jusqu'à l'âge adulte, la mangeoire prend le relais ensuite
   et engraisse les adultes sans fin. Le prix d'un animal énorme n'est donc pas en pièces
   mais en temps et en place d'enclos — une bête qu'on engraisse est une bête qu'on ne
   vend pas, et l'enclos qu'elle occupe ne produit rien pendant ce temps. */
const FATTEN_X  = 3;        // secondes d'engraissement par seconde et par niveau de mangeoire
const OVER_GAIN = 0.55;     // rendement décroissant de la taille
const SIZE_VIS  = 1.5;      // grossissement visuel maximal, pour ne pas crever la scène

/* ── Variantes ────────────────────────────────────────────────────────────────
   Tirées à l'éclosion et gardées À VIE, contrairement à la taille qu'une évolution
   remet à zéro : ce sont des identités, pas des états. C'est ce qui en fait une
   collection, et le brouillon direct des gènes du jalon 4.

   La TEINTE se voit — un filtre CSS recolore l'emoji, ce qui multiplie le bestiaire
   visible sans un seul dessin. Le TEMPÉRAMENT et le MOTIF ne sont que du texte : ils
   donnent une identité à chaque bête sans rien demander aux graphismes. */

const TINTS = [
  { key: 'ordinaire', name: '',           filter: '',                                             mult: 1,    poids: 100 },
  { key: 'cendre',    name: 'cendré',     filter: 'saturate(.3) brightness(.88)',                 mult: 1.10, poids: 22 },
  { key: 'ecarlate',  name: 'écarlate',   filter: 'hue-rotate(-40deg) saturate(1.7)',             mult: 1.15, poids: 18 },
  { key: 'azur',      name: 'azur',       filter: 'hue-rotate(150deg) saturate(1.4)',             mult: 1.15, poids: 18 },
  { key: 'jade',      name: 'jade',       filter: 'hue-rotate(80deg) saturate(1.5)',              mult: 1.20, poids: 14 },
  { key: 'amethyste', name: 'améthyste',  filter: 'hue-rotate(230deg) saturate(1.5)',             mult: 1.25, poids: 10 },
  { key: 'dore',      name: 'doré',       filter: 'hue-rotate(25deg) saturate(2.2) brightness(1.15)', mult: 1.30, poids: 6 },
  { key: 'albatre',   name: 'albâtre',    filter: 'saturate(0) brightness(1.4)',                  mult: 1.40, poids: 3 },
];

// Le prodige ignore la lignée : on peut avoir un têtard chromatique. C'est la seule
// raison de regarder encore chaque éclosion quand on enchaîne les œufs mythiques.
const PRODIGE_ODDS  = 1 / 500;
const PRODIGE_MULT  = 5;
const PRODIGE_FILTER = 'saturate(2.4) brightness(1.3) drop-shadow(0 0 14px #E4A63E)';

// grow : divise la durée de croissance. fat : multiplie la vitesse d'engraissement.
const TEMPERS = [
  { key: 'docile',   name: 'docile',   grow: 1.00, fat: 1.00 },
  { key: 'nerveux',  name: 'nerveux',  grow: 1.25, fat: 0.85 },
  { key: 'placide',  name: 'placide',  grow: 0.85, fat: 1.25 },
  { key: 'glouton',  name: 'glouton',  grow: 1.00, fat: 1.40 },
  { key: 'farouche', name: 'farouche', grow: 1.15, fat: 0.95 },
  { key: 'rêveur',   name: 'rêveur',   grow: 0.90, fat: 1.15 },
];

// Purement descriptif : aucun effet, juste de quoi reconnaître une bête entre mille.
const MOTIFS = ['uni', 'tacheté', 'rayé', 'moucheté', 'marbré', 'tigré', 'zébré', 'constellé'];

/* Les rangs de taille qualifient l'adulte : « adulte », puis « adulte grand », « adulte
   énorme »… Le seuil d'un rang est aussi son multiplicateur de valeur : franchir un rang
   fait donc bondir le prix de vente, exactement comme passer d'enfant à adolescent.
   Ces seuils valent ce que valait l'ancienne courbe continue au même point — l'engraissement
   coûte toujours plus qu'il ne rapporte, il paie juste par à-coups au lieu de goutte à goutte. */
const RANKS = [
  // name sert à qualifier un adulte (masculin), fem à qualifier une taille (féminin)
  { at: 1.00, name: '',           fem: '' },
  { at: 1.30, name: 'grand',      fem: 'grande' },
  { at: 1.70, name: 'énorme',     fem: 'énorme' },
  { at: 2.30, name: 'colossal',   fem: 'colossale' },
  { at: 3.20, name: 'titanesque', fem: 'titanesque' },
  { at: 4.50, name: 'démesuré',   fem: 'démesurée' },
];

/* Étapes de vie, traversées à l'intérieur de chaque palier.
   ENFANT_JUSQU / ADO_JUSQU découpent la barre de croissance ; l'échelle visuelle, elle,
   est continue — l'animal grossit à chaque clic plutôt que de sauter d'un cran à l'autre. */
const ENFANT_JUSQU = 0.40;
const LIFE_MIN     = 0.5;   // taille d'un nouveau-né, en fraction de sa taille adulte

/* Ce que vaut une bête selon son étape, en fraction de la valeur adulte. La valeur est
   PLATE à l'intérieur d'une étape et saute d'un coup au passage : c'est le clic qui fait
   basculer d'enfant à adolescent qui paie, pas les quarante d'avant. Vendre tôt reste
   toujours moins rentable au clic que mener la bête à terme — c'est une porte de sortie
   quand un enclos bloque, jamais une stratégie. */
const STAGE_MULT = { enfant: 0.15, ado: 0.40 };   // 1 par défaut pour tout adulte

/* Améliorations à niveaux. Le coût du prochain niveau est base × mult^niveau : l'effet
   monte linéairement pendant que le prix double presque, donc chaque palier se mérite.
   `max: 1` marque les deux achats qui débloquent une capacité sans avoir de puissance. */
const UPGRADES = [
  { key: 'clic', name: 'Force du clic', base: 60, mult: 1.6,
    desc: 'Chaque clic vaut une seconde de vie de plus.',
    value: n => 1 + n, unit: ' s par clic' },
  { key: 'couveuse', name: 'Couveuse automatique', base: 120, mult: 1.9,
    desc: 'Les œufs couvent tout seuls, même quand tu n’es pas là.',
    value: n => n, unit: '× la vitesse de couvaison' },
  { key: 'eleveur', name: 'Éleveur automatique', base: 500, mult: 1.9,
    desc: 'Les jeunes grandissent tout seuls jusqu’à l’âge adulte.',
    value: n => n, unit: '× la vitesse de croissance' },
  { key: 'acheteur', name: 'Acheteur automatique', base: 2000, mult: 1, max: 1,
    desc: 'Rachète un œuf et le met à couver dès qu’un incubateur se libère.' },
  { key: 'mangeoire', name: 'Mangeoire automatique', base: 2500, mult: 1.9,
    desc: 'Prend le relais de l’éleveur : engraisse les adultes sans fin, sans rien coûter.',
    value: n => n * FATTEN_X, unit: ' s d’engraissement par seconde' },
  { key: 'marchand', name: 'Marchand automatique', base: 15000, mult: 1, max: 1,
    desc: 'Vend les adultes tout seul, selon trois conditions que tu règles : palier, taille et rareté.' },
  { key: 'evolution', name: 'Évolution automatique', base: 50000, mult: 1, max: 1,
    desc: 'Fait monter les adultes de palier en palier, jusqu’où tu décides. Elle agit avant le marchand.' },
];

const UP_BY_KEY = Object.fromEntries(UPGRADES.map(u => [u.key, u]));

/* Chaque forme : [nom, glyphe adulte, glyphe juvénile].
   Le juvénile sert pendant l'enfance et l'adolescence — c'est ce qui fait qu'une wyverne
   commence sa vie en lézard et qu'un léviathan commence en serpent de mer. Là où les emoji
   n'offrent aucune variante (toute la lignée du crapaud), les deux sont identiques et seule
   l'échelle raconte la croissance : ce sont ces cases-là qui réclament de vrais dessins. */
const LINES = [
  // ── communes ────────────────────────────────────────────────────────────
  { key: 'crapaud', name: 'Crapaud', rarity: 'commune', forms: [
    ['Têtard', '🐸', '🐸'], ['Crapaud', '🐸', '🐸'], ['Crapaud-buffle', '🐸', '🐸'],
    ['Colosse fangeux', '🐸', '🐸'], ['Gama, crapaud-montagne', '🐸', '🐸'] ] },
  { key: 'poisson', name: 'Poisson', rarity: 'commune', forms: [
    ['Alevin', '🐟', '🐟'], ['Carpe', '🐟', '🐟'], ['Carpe centenaire', '🐠', '🐟'],
    ['Serpent de mer', '🐍', '🐠'], ['Léviathan', '🐉', '🐍'] ] },
  { key: 'lezard', name: 'Lézard', rarity: 'commune', forms: [
    ['Lézardeau', '🦎', '🦎'], ['Lézard', '🦎', '🦎'], ['Varan', '🦎', '🦎'],
    ['Wyverne', '🐲', '🦎'], ['Dragon de terre', '🐉', '🐲'] ] },
  { key: 'oiseau', name: 'Oiseau', rarity: 'commune', forms: [
    ['Oisillon', '🐤', '🐣'], ['Passereau', '🐦', '🐤'], ['Rapace', '🦅', '🐦'],
    ['Roc', '🦅', '🦅'], ['Phénix', '🔥', '🦅'] ] },
  { key: 'crocodile', name: 'Crocodile', rarity: 'commune', forms: [
    ['Crocodillon', '🐊', '🐊'], ['Crocodile', '🐊', '🐊'], ['Crocodile ancien', '🐊', '🐊'],
    ['Draco-saurien', '🐲', '🐊'], ['Dragon-tonnerre', '🐉', '🐲'] ] },

  { key: 'insecte', name: 'Insecte', rarity: 'commune', forms: [
    ['Larve', '🐛', '🐛'], ['Scarabée', '🪲', '🐛'], ['Lucane', '🪲', '🪲'],
    ['Scarabée-titan', '🪲', '🪲'], ['Khépri, porteur du soleil', '🌞', '🪲'] ] },
  { key: 'rongeur', name: 'Rongeur', rarity: 'commune', forms: [
    ['Souriceau', '🐁', '🐁'], ['Rat', '🐀', '🐁'], ['Ragondin', '🦫', '🐀'],
    ['Rongeur colossal', '🦫', '🦫'], ['Ratatosk, messager des cimes', '🐿️', '🦫'] ] },
  { key: 'chiroptere', name: 'Chauve-souris', rarity: 'commune', forms: [
    ['Chiroptère', '🦇', '🦇'], ['Chauve-souris', '🦇', '🦇'], ['Roussette', '🦇', '🦇'],
    ['Buveur de nuit', '🧛', '🦇'], ['Camazotz, l’éclipse', '🌑', '🧛'] ] },

  // ── rares ───────────────────────────────────────────────────────────────
  { key: 'loup', name: 'Loup', rarity: 'rare', forms: [
    ['Louveteau', '🐕', '🐕'], ['Loup', '🐺', '🐕'], ['Loup des steppes', '🐺', '🐺'],
    ['Garou', '🧌', '🐺'], ['Fenrir, dévoreur', '🌘', '🧌'] ] },
  { key: 'meduse', name: 'Méduse', rarity: 'rare', forms: [
    ['Éphyrule', '🫧', '🫧'], ['Méduse', '🪼', '🫧'], ['Méduse abyssale', '🪼', '🪼'],
    ['Cnidaire colossal', '🪼', '🪼'], ['Physalie-monde', '🌊', '🪼'] ] },
  { key: 'salamandre', name: 'Salamandre', rarity: 'rare', forms: [
    ['Larve ardente', '🐛', '🐛'], ['Salamandre', '🦎', '🐛'], ['Salamandre de braise', '🦎', '🦎'],
    ['Salamandre de cendre', '🔥', '🦎'], ['Ifrit', '👹', '🔥'] ] },
  { key: 'serpent', name: 'Serpent-plume', rarity: 'rare', forms: [
    ['Vermisseau', '🐛', '🐛'], ['Couleuvre', '🐍', '🐛'], ['Serpent-plume', '🐍', '🐍'],
    ['Amphithère', '🐲', '🐍'], ['Quetzalcóatl', '🐉', '🐲'] ] },

  // ── épiques ─────────────────────────────────────────────────────────────
  { key: 'kraken', name: 'Kraken', rarity: 'epique', forms: [
    ['Nauplius', '🦐', '🦐'], ['Poulpe', '🐙', '🦐'], ['Poulpe abyssal', '🐙', '🐙'],
    ['Poulpe des fosses', '🦑', '🐙'], ['Kraken', '🦑', '🦑'] ] },
  { key: 'golem', name: 'Golem', rarity: 'epique', forms: [
    ['Éclat', '🪨', '🪨'], ['Gravier animé', '🪨', '🪨'], ['Golem', '🗿', '🪨'],
    ['Colosse de pierre', '🗿', '🗿'], ['Titan de granit', '🏔️', '🗿'] ] },
  { key: 'sphinx', name: 'Sphinx', rarity: 'epique', forms: [
    ['Chaton sans poil', '🐈', '🐈'], ['Sphinx', '🐈‍⬛', '🐈'], ['Sphinx royal', '🦁', '🐈‍⬛'],
    ['Gardien de tombeau', '🗿', '🦁'], ['Grand Sphinx', '🏜️', '🗿'] ] },
  { key: 'cheval', name: 'Cheval', rarity: 'epique', forms: [
    ['Poulain', '🐴', '🐴'], ['Cheval', '🐎', '🐴'], ['Destrier', '🐎', '🐎'],
    ['Licorne', '🦄', '🐎'], ['Pégase', '🌠', '🦄'] ] },

  // ── mythiques ───────────────────────────────────────────────────────────
  { key: 'chimere', name: 'Chimère', rarity: 'mythique', forms: [
    ['Avorton', '🐁', '🐁'], ['Chimèreau', '🐐', '🐁'], ['Chimère', '🦁', '🐐'],
    ['Chimère royale', '🦁', '🦁'], ['Chimère primordiale', '👹', '🦁'] ] },
  { key: 'behemoth', name: 'Béhémoth', rarity: 'mythique', forms: [
    ['Ossement', '🦴', '🦴'], ['Saurien', '🦕', '🦴'], ['Béhémoth', '🦖', '🦕'],
    ['Béhémoth ancien', '🦖', '🦖'], ['Béhémoth primordial', '☄️', '🦖'] ] },
  { key: 'ouroboros', name: 'Ouroboros', rarity: 'mythique', forms: [
    ['Anneau de mue', '🐛', '🐛'], ['Serpent gris', '🐍', '🐛'], ['Serpent-monde', '🐍', '🐍'],
    ['Ouroboros', '🐉', '🐍'], ['Ouroboros éternel', '♾️', '🐉'] ] },
];

const LINE_BY_KEY = Object.fromEntries(LINES.map(l => [l.key, l]));

/* ── Illustrations ────────────────────────────────────────────────────────────
   Une lignée n'a PAS besoin de ses cinq dessins. On déclare les paliers dessinés,
   et un palier sans dessin prend celui du palier le plus proche en dessous ; s'il n'y
   en a aucun, on retombe sur l'emoji. Trois dessins couvrent donc une lignée entière,
   et on peut n'en avoir qu'un pour commencer.

   Ajouter un dessin = poser le fichier dans art/ et ajouter une ligne ici. Rien d'autre.
   Le format et les dimensions attendus sont décrits dans art/LISEZMOI.md.

   Exemple, une fois les fichiers en place :
     crapaud: { 1: 'crapaud-tetard.png', 3: 'crapaud-buffle.png', 5: 'crapaud-gama.png' },
*/
const ART = {};

/* La règle de repli, écrite une seule fois : un palier sans dessin prend celui du palier
   le plus proche en dessous. La scène, les vignettes et la collection s'en servent toutes,
   sinon la collection montrerait autre chose que le jeu. */
function artAt(lineKey, tier) {
  const table = ART[lineKey];
  if (!table) return null;
  for (let t = tier; t >= 1; t--) if (table[t]) return 'art/' + table[t];
  return null;
}

// Un juvénile porte le dessin du palier précédent — c'est ce qui fait qu'une wyverne
// grandit en lézard avant de devenir wyverne.
const artFor = c => artAt(c.line, isAdult(c) ? c.tier : Math.max(1, c.tier - 1));

/* Pose un dessin ou un emoji dans le même élément, et par le même chemin de taille :
   l'image fait 1em, donc tout ce qui pilotait la taille de l'emoji pilote la sienne. */
function setCreature(el, fichier, emoji) {
  const cle = fichier || emoji;
  if (el.__art === cle) return;
  el.__art = cle;
  if (fichier) {
    let img = el.firstElementChild;
    if (!img || img.tagName !== 'IMG') { el.textContent = ''; img = document.createElement('img'); el.appendChild(img); }
    if (img.getAttribute('src') !== fichier) img.setAttribute('src', fichier);
    img.alt = '';
  } else {
    el.textContent = emoji;
  }
}

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
    eggs: { commun: 0, rare: 0, epique: 0, mythique: 0 },
    buyKind: 'commun',      // ce que rachète l'acheteur automatique
    incubators: 1,
    pens: 1,
    incub: [{ line: rollLine('commun'), p: 0, kind: 'commun' }],   // le premier œuf est offert
    pen: [],
    sel: 'i:0',
    up: { clic: 0, couveuse: 0, eleveur: 0, acheteur: 0, mangeoire: 0, marchand: 0, evolution: 0 },
    sellFrom: 0,        // palier À PARTIR duquel le marchand vend (0 = il ne vend rien)
    sellRank: 0,        // taille minimale exigée avant la vente (0 = dès l'âge adulte)
    sellRarity: 0,      // le marchand ne touche qu'aux communes tant qu'on ne l'élargit pas
    evolveUpTo: 0,
    seen: {},
    speed: 1,
    sound: true,
    t: Date.now(),
  };
}

// Le tirage se fait à la mise en couvaison, pas à l'éclosion : c'est ce qui permet de
// recalculer une absence sans rejouer le hasard. Le joueur ne le découvre qu'à l'éclosion.
function pickLine(rarityKey) {
  const pool = LINES.filter(l => l.rarity === rarityKey);
  return pool[Math.floor(Math.random() * pool.length)].key;
}

function rollLine(kindKey) {
  const odds = (EGG_BY_KEY[kindKey] || EGG_BY_KEY.commun).odds;
  let r = Math.random(), base = 'commune';
  // du plus rare au plus commun ; en cas d'arrondi, on retombe sur la rareté de base de l'œuf
  for (const key of ['mythique', 'epique', 'rare', 'commune']) {
    const p = odds[key] || 0;
    if (p > 0) base = key;
    r -= p;
    if (r < 0) return pickLine(key);
  }
  return pickLine(base);
}

// Le libellé d'un œuf en boutique : sa rareté de base, puis ce qu'il peut donner au-dessus.
function eggDesc(e) {
  const dessus = ['rare', 'epique', 'mythique']
    .filter(k => k !== e.rarity && e.odds[k])
    .map(k => pourcent(e.odds[k]) + ' ' + de(RARITY[k].name));
  const base = RARITY[e.rarity].name.replace(/^./, m => m.toUpperCase());
  const duree = 'Couve en ' + fmtTime(e.hatch) + '. ';
  return duree + (dessus.length ? base + '. Au-dessus : ' + dessus.join(', ') + '.' : base + ' garantie.');
}

// « de rare » mais « d'épique »
function de(mot) { return /^[aeiouéèêà]/i.test(mot) ? 'd’' + mot : 'de ' + mot; }

function pourcent(p) {
  const v = p * 100;
  if (v >= 1) return v.toFixed(v % 1 ? 1 : 0).replace('.', ',') + ' %';
  if (v >= 0.1) return v.toFixed(1).replace('.', ',') + ' %';
  return '1 sur ' + fmt(Math.round(1 / p));
}

function load() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { /* mode privé */ }
  if (!raw) { isNewGame = true; return freshState(); }
  try {
    const s = JSON.parse(raw);
    const base = freshState();
    const merged = Object.assign(base, s, { up: Object.assign(base.up, s.up || {}) });
    // les améliorations étaient des booléens avant de devenir des niveaux
    for (const k of Object.keys(merged.up)) {
      if (merged.up[k] === true) merged.up[k] = 1;
      else if (merged.up[k] === false || merged.up[k] == null) merged.up[k] = 0;
    }
    // la réserve d'œufs était un simple compteur avant qu'il n'y ait plusieurs sortes
    const vide = { commun: 0, rare: 0, epique: 0, mythique: 0 };
    merged.eggs = typeof merged.eggs === 'number'
      ? Object.assign({}, vide, { commun: merged.eggs })
      : Object.assign({}, vide, merged.eggs || {});
    if (!EGG_BY_KEY[merged.buyKind]) merged.buyKind = 'commun';
    // les œufs déjà en couvaison n'avaient pas de sorte
    for (const slot of merged.incub || []) if (slot && !slot.kind) slot.kind = 'commun';
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

const lineOf    = c => LINE_BY_KEY[c.line];
const rarityOf  = c => RARITY[lineOf(c).rarity];
const tintOf    = c => TINTS[c.tint] || TINTS[0];
const temperOf  = c => TEMPERS[c.temper] || TEMPERS[0];
const motifOf   = c => MOTIFS[c.motif] || MOTIFS[0];

// Le tempérament ne touche QUE la phase de croissance. La durée de référence des rangs de
// taille reste la valeur brute du palier, sinon un tempérament vif cumulerait deux bonus.
const tierTime  = c => GROW[c.tier - 1];
const growTime  = c => GROW[c.tier - 1] / temperOf(c).grow;

const variantMult = c => tintOf(c).mult * (c.prodige ? PRODIGE_MULT : 1);
const baseValue = c => VALUE[c.tier - 1] * rarityOf(c).mult * variantMult(c);

function pickWeighted(list) {
  let total = list.reduce((s, x) => s + x.poids, 0), r = Math.random() * total;
  for (let i = 0; i < list.length; i++) { r -= list[i].poids; if (r < 0) return i; }
  return 0;
}

// Tiré une fois, à l'éclosion, et jamais retouché ensuite.
function rollVariants() {
  return {
    tint: pickWeighted(TINTS),
    temper: Math.floor(Math.random() * TEMPERS.length),
    motif: Math.floor(Math.random() * MOTIFS.length),
    prodige: Math.random() < PRODIGE_ODDS,
  };
}

/* À partir de quel palier la bête rembourse l'œuf dont elle sort. Un œuf cher n'est pas un
   lot à encaisser : à palier 1 une mythique payée 200 000 ne vaut que 1 600. Tous les œufs
   payants se remboursent au palier 4, jamais avant — autant le dire plutôt que de laisser
   le joueur le découvrir en perdant sa mise. */
function seuilRentable(c) {
  const rar = rarityOf(c).mult;
  const mult = rar * variantMult(c);
  let cumul = 0;
  for (let t = 1; t <= 5; t++) {
    if (t > 1) cumul += (EVOLVE[t - 2] || 0) * rar;
    if (VALUE[t - 1] * mult - cumul >= (c.cost || 0)) return t;
  }
  return null;
}

const aPerte = c => (c.cost || 0) > sellValue(c);

// La description d'une bête : ce qui la distingue de toutes les autres de sa forme.
function traitsOf(c) {
  const bouts = [];
  if (c.prodige) bouts.push('chromatique');
  if (tintOf(c).name) bouts.push(tintOf(c).name);
  bouts.push(motifOf(c), temperOf(c).name);
  return bouts.join(' · ');
}
const eggStock  = k => (state.eggs && state.eggs[k]) || 0;
const totalEggs = () => EGG_KINDS.reduce((n, e) => n + eggStock(e.key), 0);
// la plus rare d'abord : un œuf cher acheté exprès ne doit pas dormir en réserve
const bestStocked = () => (EGG_KINDS.slice().reverse().find(e => eggStock(e.key)) || {}).key;
// Le coût d'évolution suit la rareté : sans ça, une rare obtenue par chance se montait au
// palier 5 pour le prix d'une commune, et toute la progression se court-circuitait.
const evoCost   = c => EVOLVE[c.tier - 1] === null ? null
                     : Math.round(EVOLVE[c.tier - 1] * rarityOf(c).mult);
const isAdult   = c => c.p >= growTime(c);
const form      = (lineKey, tier) => LINE_BY_KEY[lineKey].forms[tier - 1];
const penFull   = () => state.pen.length >= state.pens;

const incubCost = () => Math.round(INCUB_BASE * Math.pow(SLOT_MULT, state.incubators - 1));
const penCost   = () => Math.round(PEN_BASE   * Math.pow(SLOT_MULT, state.pens - 1));

const lvl         = key => state.up[key] || 0;
const upCost      = u => Math.round(u.base * Math.pow(u.mult, lvl(u.key)));
const upMaxed     = u => !!u.max && lvl(u.key) >= u.max;
const clickPower  = () => 1 + lvl('clic');

// La taille se mesure en durées de croissance avalées en plus, et l'évolution la remet
// à zéro : un têtard bien gras donne un crapaud de taille ordinaire. On engraisse donc
// une créature qu'on garde ou qu'on vend telle quelle, jamais une qu'on va faire évoluer.
const sizeFactor = c => 1 + OVER_GAIN * Math.log(1 + (c.over || 0) / tierTime(c));
// stageMult est défini plus bas : sellValue n'est appelée qu'une fois le fichier chargé.
// Le multiplicateur d'étape porte déjà la taille — la valeur est donc plate entre deux
// rangs, et c'est le clic qui franchit le rang qui paie.
const sellValue  = c => Math.max(1, Math.round(baseValue(c) * stageMult(c)));

function rankOf(sf) {
  let i = 0;
  while (i + 1 < RANKS.length && sf >= RANKS[i + 1].at) i++;
  return { i, name: RANKS[i].name, from: RANKS[i].at, next: RANKS[i + 1] || null };
}

/* L'étape de vie : ce que le joueur voit changer sous ses clics.
   œuf → enfant → adolescent → adulte → adulte grand (puis énorme, colossal…). */
function stageOf(c) {
  const ratio = c.p / growTime(c);
  if (ratio < ENFANT_JUSQU) return { key: 'enfant', name: 'enfant' };
  if (ratio < 1) return { key: 'ado', name: 'adolescent' };
  // le rang entre dans la clé pour que chaque palier de taille compte aussi comme une étape
  const rank = rankOf(sizeFactor(c)).name;
  return { key: rank ? 'adulte-' + rank : 'adulte', name: rank ? 'adulte ' + rank : 'adulte' };
}

// Multiplicateur de valeur, plat à l'intérieur d'une étape : 0,15 enfant, 0,40 adolescent,
// puis le seuil du rang atteint pour un adulte (1 tant qu'il est de taille normale).
function stageMult(c) {
  const k = stageOf(c).key;
  return STAGE_MULT[k] !== undefined ? STAGE_MULT[k] : rankOf(sizeFactor(c)).from;
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

/* L'économie court maintenant de 40 à des dizaines de milliards : au-delà du million on
   abrège, sinon les boutons débordent et plus personne ne lit les chiffres. */
function fmt(n) {
  n = Math.floor(n);
  const signe = n < 0 ? '-' : '', a = Math.abs(n);
  const court = (v, u) => signe + v.toFixed(v < 10 ? 2 : 1).replace('.', ',') + ' ' + u;
  if (a >= 1e12) return court(a / 1e12, 'Bn');
  if (a >= 1e9)  return court(a / 1e9, 'Md');
  if (a >= 1e6)  return court(a / 1e6, 'M');
  return signe + a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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
function remaining(left, speed) {
  const n = Math.max(1, Math.ceil(left / clickPower()));
  const clics = n + (n > 1 ? ' clics' : ' clic');
  if (speed <= 0) return clics;
  // Automatisé : on annonce le temps, et le raccourci au clic tant qu'il reste à portée
  // de main. Au-delà, cliquer ne sert plus à rien et l'afficher serait du bruit.
  return fmtTime(left / speed) + (n <= 60 ? ' ou ' + clics : '');
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

/* Ce qu'on met en scène quand la sélection a disparu — une bête vendue, un œuf éclos.
   Toujours du vivant en priorité, et le plus avancé : c'est lui qui demande une décision.
   Un œuf ne passe au premier plan que s'il n'y a rien d'autre à regarder. */
function fallback(list) {
  const vivants = list.filter(s => s.kind === 'creature');
  if (vivants.length) {
    return vivants.sort((a, b) => (b.c.p / growTime(b.c)) - (a.c.p / growTime(a.c)))[0];
  }
  const oeufs = list.filter(s => s.kind === 'egg' && s.slot);
  if (oeufs.length) return oeufs.sort((a, b) => b.slot.p - a.slot.p)[0];
  return list[0] || null;
}

function current() {
  const list = subjects();
  return list.find(s => s.key === state.sel) || fallback(list);
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

// Le coup de grossissement, réservé au changement d'étape.
function pulse() {
  const el = document.querySelector('.subject-scale');
  if (el) flash(el, 'grew');
}

// Le passage d'une étape à la suivante : nouvelle silhouette, nouvelle échelle, et un
// bond de valeur qu'il faut voir passer.
function celebrate(c, valueBefore, pt) {
  refresh();                                   // la nouvelle échelle avant l'animation
  const gain = sellValue(c) - valueBefore;
  burst(pt.x, pt.y, '✦', 12);
  floatText(pt.x, pt.y - 70, stageOf(c).name, 'gain');
  if (gain > 0) floatText(pt.x, pt.y - 100, '+' + fmt(gain) + ' à la vente', 'gain');
  chord([523, 659, 784, 1046], 70);
  pulse();
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

  const power = clickPower();

  if (s.kind === 'egg') {
    if (!s.slot) { placeEgg(s.i); return; }
    const dure = hatchTime(s.slot);
    if (s.slot.p >= dure) return;
    s.slot.p = Math.min(dure, s.slot.p + power);
    flash(el, 'shake');
    floatText(jitter(), pt.y - 20, '+' + power + ' s');
    blip(220 + Math.random() * 60, 0.035, 'square', 0.02);
    if (s.slot.p >= dure) hatchAll(); else refresh();
    return;
  }

  const c = s.c;
  const wasStage = stageOf(c).key;
  const wasValue = sellValue(c);
  // Un clic vaut une seconde de vie, avant comme après l'âge adulte : la créature
  // ne cesse jamais de grandir, seul le rendement diminue.
  if (isAdult(c)) c.over = (c.over || 0) + power;
  else c.p = Math.min(growTime(c), c.p + power);
  flash(el, 'shake');
  floatText(jitter(), pt.y - 20, '+' + power + ' s');
  blip(180 + Math.random() * 50, 0.035, 'square', 0.02);
  if (stageOf(c).key !== wasStage) { celebrate(c, wasValue, pt); return; }
  refresh();
}

function placeEgg(i, kind) {
  kind = kind || bestStocked();
  if (state.incub[i] || !kind || !eggStock(kind)) return;
  state.eggs[kind]--;
  state.incub[i] = { line: rollLine(kind), p: 0, kind };
  // On ne quitte jamais une bête vivante pour un œuf : le joueur veut voir son animal.
  // Si le joueur regardait justement cet incubateur, il y reste — sa sélection n'a pas bougé.
  if (!state.pen.length) state.sel = 'i:' + i;
  blip(330, 0.05, 'sine', 0.03);
  refresh();
}

function hatchAll() {
  let hatched = 0, lastKey = null, best = null, bestCreature = null;
  for (let i = 0; i < state.incub.length; i++) {
    const slot = state.incub[i];
    if (!slot || slot.p < hatchTime(slot)) continue;
    if (penFull()) continue;
    // on retient le prix de l'œuf : c'est la seule façon de dire au joueur, plus tard,
    // qu'il est en train de vendre à perte
    const c = Object.assign({ id: nextId++, line: slot.line, tier: 1, p: 0, over: 0,
                              cost: (EGG_BY_KEY[slot.kind] || EGG_BY_KEY.commun).price },
                           rollVariants());
    // un prodige est protégé d'office : on ne perd pas une bête sur cinq cents
    // parce que le marchand l'a vendue avant qu'on l'ait vue
    if (c.prodige) c.keep = true;
    state.pen.push(c);
    state.incub[i] = null;
    markSeen(slot.line, 1);
    lastKey = 'c:' + c.id;
    // on retient la plus rare de la fournée pour la mettre en avant
    const line = LINE_BY_KEY[slot.line];
    if (!best || RARITY[line.rarity].rank > RARITY[best.rarity].rank) { best = line; bestCreature = c; }
    hatched++;
  }
  if (hatched) {
    // la bête qui vient de sortir prend la scène — on ne reste pas devant une coquille vide
    if (!state.sel || state.sel.startsWith('i:')) state.sel = lastKey;
    // un coup de chance doit s'entendre et se voir : c'est le seul moment de loterie du jeu
    if (best && RARITY[best.rarity].rank > 0) {
      state.sel = 'c:' + bestCreature.id;
      const pt = centerOf($('subject'));
      burst(pt.x, pt.y, '✦', 10 + RARITY[best.rarity].rank * 8);
      floatText(pt.x, pt.y - 90, 'lignée ' + RARITY[best.rarity].name + ' !', 'gain');
      chord([523, 659, 784, 1046, 1319], 90);
    } else {
      const pt = centerOf($('subject'));
      burst(pt.x, pt.y, '✦', 12);
      chord([523, 659, 784]);
    }
    popNext = true;
  }
  refresh();
  return hatched;
}

// Vendre est possible à toute étape — au prix de l'étape. Le marchand automatique, lui,
// n'achète que des adultes : brader un enfant ne doit jamais arriver tout seul.
function sell(c) {
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

/* Protéger une bête, c'est refuser qu'un automate décide de sa vie : ni vendue par le
   marchand, ni fait évoluer — évoluer lui ferait perdre sa taille. C'est le prix d'une
   place d'enclos immobilisée, et c'est ce qui permet de garder un prodige et de continuer
   l'aventure avec lui. */
function toggleKeep(c) {
  c.keep = !c.keep;
  const pt = centerOf($('subject'));
  floatText(pt.x, pt.y - 40, c.keep ? 'gardée' : 'relâchée', c.keep ? 'gain' : '');
  chord(c.keep ? [523, 784] : [440, 330], 60);
  refresh();
}

function buyEgg(kind) {
  const e = EGG_BY_KEY[kind];
  if (!e || state.coins < e.price) return;
  state.coins -= e.price;
  state.eggs[kind] = eggStock(kind) + 1;
  const free = state.incub.indexOf(null);
  if (free !== -1) placeEgg(free, kind); else { blip(300, 0.04, 'sine', 0.03); refresh(); }
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
  if (upMaxed(u)) return;
  const cost = upCost(u);
  if (state.coins < cost) return;
  state.coins -= cost;
  state.up[u.key] = lvl(u.key) + 1;
  chord([523, 659, 784, 1046], 80);
  refresh();
}

// Ce qu'on lit sous le nom de l'amélioration : ce qu'elle fait, ou ce que le prochain
// niveau va changer.
function upLabel(u) {
  const n = lvl(u.key);
  if (!u.value || upMaxed(u)) return u.desc;
  if (n === 0) return u.desc + ' Niveau 1 : ' + u.value(1) + u.unit + '.';
  return 'Niveau ' + n + ' → ' + (n + 1) + ' · ' + u.value(n) + ' → ' + u.value(n + 1) + u.unit;
}

/* ─────────────────────────────────────────────
   Simulation
   ───────────────────────────────────────────── */

// Le temps ne fait avancer que ce qui a été automatisé. Tant que rien n'est acheté,
// seuls le clic et la nourriture font bouger quoi que ce soit.
function advance(dt) {
  const couve = lvl('couveuse'), eleve = lvl('eleveur');
  if (couve) {
    for (const slot of state.incub) {
      if (!slot) continue;
      const dure = hatchTime(slot);
      if (slot.p < dure) slot.p = Math.min(dure, slot.p + dt * couve);
    }
  }
  if (eleve) {
    for (const c of state.pen) {
      const g = growTime(c);
      if (c.p < g) c.p = Math.min(g, c.p + dt * eleve);
    }
  }
}

function runAutomations(dt) {
  /* L'évolution automatique passe avant la vente : une bête qu'on peut faire monter ne doit
     pas partir au prix de son palier actuel. Elle ne monte que d'un palier par passage —
     l'évolution remet la croissance à zéro, donc la bête n'est plus adulte juste après. */
  if (lvl('evolution') && state.evolveUpTo > 1) {
    for (const c of state.pen) {
      if (c.keep || !isAdult(c) || c.tier >= state.evolveUpTo) continue;
      const cost = evoCost(c);
      if (state.coins < cost) continue;
      state.coins -= cost;
      c.tier++;
      c.p = 0;
      c.over = 0;
      markSeen(c.line, c.tier);
    }
  }
  /* Le marchand attend deux conditions : le palier ET la taille. Sans la seconde il vendait
     tout dès l'âge adulte, et la mangeoire n'avait jamais le temps d'engraisser quoi que ce
     soit — les deux automates se marchaient dessus. */
  if (state.up.marchand && state.sellFrom > 0) {
    /* Les trois conditions se cumulent, et deux d'entre elles sont des SEUILS BAS : le
       vendeur récolte ce qui a assez monté, pendant que l'évolution pousse vers le haut.
       La rareté, elle, est un plafond : on vend le tout-venant et on garde le précieux. */
    const ready = state.pen.filter(c => !c.keep && isAdult(c) &&
                                        c.tier >= state.sellFrom &&
                                        rankOf(sizeFactor(c)).i >= state.sellRank &&
                                        rarityOf(c).rank <= state.sellRarity);
    for (const c of ready) {
      state.coins += sellValue(c);
      state.pen = state.pen.filter(x => x.id !== c.id);
    }
  }
  // La mangeoire prend le relais de l'éleveur : elle n'engraisse que les adultes,
  // gratuitement et sans jamais s'arrêter. Ce qu'elle coûte, c'est la place d'enclos.
  if (lvl('mangeoire')) {
    const debit = dt * FATTEN_X * lvl('mangeoire');
    for (const c of state.pen) {
      if (isAdult(c)) c.over = (c.over || 0) + debit * temperOf(c).fat;
    }
  }
  // L'acheteur écoule d'abord la réserve — le joueur y a mis ses œufs chers exprès —
  // puis rachète du commun pour que la boucle ne s'arrête jamais.
  if (state.up.acheteur) {
    const voulu = EGG_BY_KEY[state.buyKind] || EGG_BY_KEY.commun;
    for (let i = 0; i < state.incub.length; i++) {
      if (state.incub[i]) continue;
      let kind = bestStocked();
      if (kind) state.eggs[kind]--;
      else if (state.coins >= voulu.price) { state.coins -= voulu.price; kind = voulu.key; }
      else break;      // on laisse l'incubateur vide plutôt que de brader la consigne
      state.incub[i] = { line: rollLine(kind), p: 0, kind };
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
function setFilter(el, v) { if (el.__f !== v) { el.__f = v; el.style.filter = v; } }

// La scène porte une seule classe de rareté à la fois — elle teinte le halo et la jauge.
const RAR_CLASSES = ['rar-commune', 'rar-rare', 'rar-epique', 'rar-mythique',
                     'egg-commun', 'egg-rare', 'egg-epique', 'egg-mythique'];
function setStageRarity(stage, cls) {
  if (stage.__rar === cls) return;
  stage.__rar = cls;
  stage.classList.remove.apply(stage.classList, RAR_CLASSES);
  if (cls) stage.classList.add(cls);
}

/* Les menus qui listent des données du jeu sont construits depuis ces données, jamais
   écrits à la main : c'est la seule façon qu'ils ne mentent pas le jour où un prix bouge. */
function remplirMenus() {
  const option = (v, t) => { const o = document.createElement('option'); o.value = v; o.textContent = t; return o; };

  const ach = $('sel-acheteur');
  ach.textContent = '';
  for (const e of EGG_KINDS) {
    ach.appendChild(option(e.key, e.name.replace('Œuf ', 'Œufs ') + 's — ' +
      fmt(e.price) + ', couve en ' + fmtTime(e.hatch)));
  }

  const rang = $('sel-rank');
  rang.textContent = '';
  rang.appendChild(option(0, 'n’importe laquelle'));
  RANKS.forEach((r, i) => {
    if (!i) return;
    rang.appendChild(option(i, r.fem + (i < RANKS.length - 1 ? ' ou plus' : '') +
      ' — vaut ×' + dec(r.at)));
  });

  const rar = $('sel-rarete');
  rar.textContent = '';
  const noms = Object.values(RARITY);
  noms.forEach((x, i) => {
    rar.appendChild(option(i, i === noms.length - 1
      ? 'toutes, mythiques comprises'
      : liste(noms.slice(0, i + 1).map(y => y.plur)) + (i ? '' : ' seulement')));
  });
}

function buildChrome() {
  remplirMenus();
  // les actions de la scène : construites une fois, montrées selon le sujet
  const host = $('stage-acts');
  host.textContent = '';
  refs.acts = {};
  const defs = [
    { key: 'place', cls: 'grow', run: () => { const s = current(); if (s && s.kind === 'egg') placeEgg(s.i); } },
    { key: 'sell',  cls: 'sell', run: () => { const s = current(); if (s && s.c) sell(s.c); } },
    { key: 'evo',   cls: 'evo',  run: () => { const s = current(); if (s && s.c) evolve(s.c); } },
    { key: 'keep',  cls: 'keep', run: () => { const s = current(); if (s && s.c) toggleKeep(s.c); } },
  ];
  for (const d of defs) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'act ' + d.cls;
    b.addEventListener('click', d.run);
    host.appendChild(b);
    refs.acts[d.key] = b;
  }

  const items = EGG_KINDS.map(e => ({
    key: 'egg-' + e.key, title: e.name, desc: eggDesc(e), rarity: e.key,
    cost: () => e.price, run: () => buyEgg(e.key),
  })).concat([
    { key: 'incub', title: 'Incubateur', desc: 'Un œuf de plus en couvaison.',        cost: incubCost, run: buyIncubator },
    { key: 'pen',   title: 'Enclos',     desc: 'Une créature de plus en croissance.', cost: penCost,   run: buyPen },
  ]);
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
    if (it.rarity) b.classList.add('egg-' + it.rarity);
    li.appendChild(b);
    shop.appendChild(li);
    refs.shop[it.key] = { el: b, price: b.querySelector('.p'), desc: b.querySelector('.d'),
                          cost: it.cost, base: it.desc, stock: it.rarity };
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
    b.addEventListener('click', () => buyUpgrade(u));
    li.appendChild(b);
    autos.appendChild(li);
    refs.up[u.key] = { el: b, title: b.querySelector('.t'),
                       price: b.querySelector('.p'), desc: b.querySelector('.d'), up: u };
  }
}

function renderStrip() {
  const list = subjects();
  // Dès que les œufs couvent seuls, ils cessent d'être le sujet : les bêtes passent devant
  // dans la bande, pour rester à portée de clic même avec dix incubateurs.
  if (state.up.couveuse) {
    list.sort((a, b) => (a.kind === 'creature' ? 0 : 1) - (b.kind === 'creature' ? 0 : 1));
  }
  // l'étape de vie entre dans la signature : la vignette se redessine quand la bête
  // change de silhouette, soit trois ou quatre fois par créature — c'est négligeable.
  const sig = list.map(s => s.kind === 'egg'
    ? 'i' + s.i + (s.slot ? ':' + s.slot.line : ':-')
    : 'c' + s.c.id + ':' + s.c.tier + ':' + stageOf(s.c).key + (s.c.keep ? ':k' : '')).join(',');
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
      const k = s.slot ? EGG_BY_KEY[s.slot.kind] || EGG_BY_KEY.commun : null;
      glyph.textContent = s.slot ? k.glyph : '◌';
      if (!s.slot) b.classList.add('empty'); else b.classList.add('egg-' + k.key);
      tag.textContent = s.slot ? (k.key === 'commun' ? 'œuf' : k.key) : 'libre';
    } else {
      b.classList.add('rar-' + lineOf(s.c).rarity);
      if (s.c.prodige) b.classList.add('prodige');
      if (s.c.keep) b.classList.add('gardee');
      glyph.style.filter = s.c.prodige ? PRODIGE_FILTER : tintOf(s.c).filter;
      setCreature(glyph, artFor(s.c), glyphOf(s.c));
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
  let rarity = null;
  for (const line of LINES) {
    // un intertitre à chaque changement de rareté : c'est la hiérarchie, rendue lisible
    if (line.rarity !== rarity) {
      rarity = line.rarity;
      const h = document.createElement('p');
      h.className = 'coll-head rar-' + rarity;
      h.textContent = RARITY[rarity].name + ' · ×' + RARITY[rarity].mult;
      host.appendChild(h);
    }
    for (let t = 1; t <= 5; t++) {
      const got = !!state.seen[line.key + ':' + t];
      const cell = document.createElement('div');
      cell.className = 'cell rar-' + line.rarity + (got ? ' got' : ' locked') + (t === 5 ? ' t5' : '');
      cell.title = (got ? line.forms[t - 1][0] : line.name + ' — palier ' + t) +
                   ' (' + RARITY[line.rarity].name + ')';
      if (got) setCreature(cell, artAt(line.key, t), line.forms[t - 1][1]);
      host.appendChild(cell);
    }
  }
  $('coll-meta').textContent = seenCount() + ' / ' + (LINES.length * 5);
}

function renderStage() {
  const s = current();
  const stage = document.querySelector('.stage');
  const subject = $('subject');
  const acts = refs.acts;
  const hide = k => { acts[k].hidden = true; };

  if (!s) {
    setCreature($('stage-glyph'), null, '◌');
    setText($('stage-name'), 'Rien en vue');
    setHtml($('stage-meta'), '');
    setText($('stage-timer'), '');
    setWidth($('stage-fill'), '0%');
    setText($('stage-hint'), 'Achète un œuf pour recommencer.');
    setText($('stage-boost'), '');
    ['place', 'sell', 'evo', 'keep'].forEach(hide);
    return;
  }

  if (state.sel !== s.key) state.sel = s.key;
  setText($('stage-boost'), ligneBoosts(s));

  if (s.kind === 'egg') {
    const slot = s.slot;
    stage.classList.remove('apex');
    // l'œuf gonfle doucement à mesure qu'il couve
    const ratio = slot ? Math.min(1, slot.p / hatchTime(slot)) : 0;
    const kind = slot ? EGG_BY_KEY[slot.kind] || EGG_BY_KEY.commun : null;
    setVar(subject, '--sz', slot ? (0.8 + 0.25 * ratio).toFixed(3) : '0.9');
    setCreature($('stage-glyph'), null, slot ? kind.glyph : '◌');
    setFilter($('stage-glyph'), '');
    stage.classList.remove('prodige');
    setText($('stage-name'), slot ? kind.name : 'Incubateur libre');
    $('stage-traits').hidden = true;
    setStageRarity(stage, slot ? 'egg-' + kind.key : null);
    stage.classList.toggle('cracking', !!slot && ratio > 0.65);

    if (slot) {
      const ready = slot.p >= hatchTime(slot);
      stage.classList.toggle('ready', ready);
      setHtml($('stage-meta'), ready ? 'ça sort !' : (ratio > 0.65 ? 'ça craque' : 'en couvaison'));
      setWidth($('stage-fill'), Math.min(100, (slot.p / hatchTime(slot)) * 100) + '%');
      setText($('stage-timer'), ready
        ? (penFull() ? 'enclos plein — vends ou achète un enclos' : 'ça sort !')
        : remaining(hatchTime(slot) - slot.p, state.up.couveuse));
      $('stage-timer').classList.toggle('done', ready);
      setText($('stage-hint'), state.up.couveuse
        ? '' : 'Clique sur l’œuf pour le faire éclore. Rien n’avance tout seul au début.');
      ['place', 'sell', 'evo', 'keep'].forEach(hide);
    } else {
      stage.classList.remove('ready');
      setHtml($('stage-meta'), 'vide');
      setWidth($('stage-fill'), '0%');
      setText($('stage-timer'), '');
      $('stage-timer').classList.remove('done');
      const stock = totalEggs();
      setText($('stage-hint'), stock
        ? 'Tu as ' + stock + ' œuf' + (stock > 1 ? 's' : '') + ' en réserve.'
        : 'Achète un œuf dans la boutique.');
      ['sell', 'evo', 'keep'].forEach(hide);
      acts.place.hidden = false;
      const best = bestStocked();
      setText(acts.place, best ? 'Placer un ' + EGG_BY_KEY[best].name.toLowerCase() : 'Placer un œuf');
      acts.place.disabled = !best;
    }
    return;
  }

  const c = s.c;
  const f = form(c.line, c.tier);
  const adult = isAdult(c);
  const sf = sizeFactor(c);
  const rank = rankOf(sf);
  const stg = stageOf(c);

  const rar = rarityOf(c);
  stage.classList.remove('cracking');
  stage.classList.toggle('apex', c.tier === 5);
  stage.classList.toggle('ready', adult);
  setStageRarity(stage, 'rar-' + lineOf(c).rarity);
  // point décimal obligatoire : le CSS ne sait pas lire « 1,5 »
  setVar(subject, '--sz', visualScale(c).toFixed(3));
  setFilter($('stage-glyph'), c.prodige ? PRODIGE_FILTER : tintOf(c).filter);
  stage.classList.toggle('prodige', !!c.prodige);
  setCreature($('stage-glyph'), artFor(c), glyphOf(c));
  setText($('stage-name'), f[0]);
  setText($('stage-traits'), traitsOf(c));
  $('stage-traits').hidden = false;

  const mult = stageMult(c);
  setHtml($('stage-meta'),
    '<span class="rar rar-' + lineOf(c).rarity + '">' + rar.name + '</span>' +
    ' · palier ' + c.tier + (c.tier === 5 ? ' · légendaire' : '') +
    ' · <span class="rank">' + stg.name + '</span>' +
    (mult > 1 ? ' · valeur ×' + dec(mult) : ''));

  if (!adult) {
    // la barre vise la prochaine étape, pas l'âge adulte : c'est elle qui paie
    const cible = stg.key === 'enfant' ? ENFANT_JUSQU : 1;
    const depuis = stg.key === 'enfant' ? 0 : ENFANT_JUSQU;
    const g = growTime(c);
    setWidth($('stage-fill'),
      Math.min(100, ((c.p / g - depuis) / (cible - depuis)) * 100).toFixed(1) + '%');
    setText($('stage-timer'), remaining(cible * g - c.p, state.up.eleveur) +
      ' → ' + (stg.key === 'enfant' ? 'adolescent' : 'adulte'));
    $('stage-timer').classList.remove('done');
    setText($('stage-hint'), state.up.eleveur
      ? '' : 'Clique dessus pour la faire grandir. Elle ne pousse pas toute seule sans éleveur.');
  } else {
    // adulte : la barre vise le rang de taille suivant, la croissance ne s'arrête jamais
    if (rank.next) {
      const span = rank.next.at - rank.from;
      setWidth($('stage-fill'), Math.min(100, ((sf - rank.from) / span) * 100).toFixed(1) + '%');
      // Ce qu'il reste avant le prochain rang. Même règle que partout ailleurs : en secondes
      // si la mangeoire engraisse toute seule, en clics si c'est à toi de le faire.
      const cible = (Math.exp((rank.next.at - 1) / OVER_GAIN) - 1) * tierTime(c);
      setText($('stage-timer'), 'adulte · ' +
        remaining(cible - (c.over || 0), FATTEN_X * lvl('mangeoire')) + ' → ' + rank.next.name +
        ' (' + fmt(baseValue(c) * rank.next.at) + ')');
    } else {
      setWidth($('stage-fill'), '100%');
      setText($('stage-timer'), 'adulte · plus aucun rang au-dessus');
    }
    $('stage-timer').classList.add('done');
    setText($('stage-hint'), 'Continue à cliquer : elle grandit sans fin, de plus en plus lentement.');
  }

  // Un œuf cher ne se rembourse qu'en menant la bête assez haut : on le dit, plutôt que
  // de laisser le marchand la brader en silence.
  /* Une bête vaut moins que son œuf tant qu'elle n'est pas montée assez haut. Ce n'est
     alarmant que si rien n'est prévu pour l'y mener : quand l'évolution automatique est
     réglée au-delà du seuil, la ferme fait déjà le travail et le rouge ne ferait que
     faire peur à un joueur qui a tout bien réglé. */
  if (aPerte(c)) {
    const seuil = seuilRentable(c);
    /* Une bête sous le prix de son œuf n'est alarmante que si rien ne va l'en sortir :
       soit il lui suffit de finir de grandir à son palier actuel, soit l'évolution
       automatique est réglée assez haut. Dans les deux cas, pas de rouge. */
    const prisEnCharge = !seuil ? false
      : c.tier >= seuil ? true
      : (!c.keep && !!lvl('evolution') && state.evolveUpTo >= seuil);
    setText($('stage-hint'), prisEnCharge
      ? 'Son œuf a coûté ' + fmt(c.cost) + '. Ton évolution la mènera au palier ' +
        state.evolveUpTo + ', où elle vaudra ' + fmt(valeurAu(c, state.evolveUpTo)) + '.'
      : 'Son œuf a coûté ' + fmt(c.cost) + ', elle en vaut ' + fmt(sellValue(c)) + '. ' +
        (seuil ? 'Elle le remboursera au palier ' + seuil + '.' : 'Elle ne le remboursera jamais.'));
    $('stage-hint').classList.toggle('alerte', !prisEnCharge);
    acts.sell.classList.toggle('perte', !prisEnCharge && !c.keep);
    acts.sell.classList.remove('bon');
  } else {
    $('stage-hint').classList.remove('alerte');
    acts.sell.classList.remove('perte');
    acts.sell.classList.toggle('bon', !c.keep);   // vente rentable : c'est vert
  }

  acts.place.hidden = true;
  acts.sell.hidden = false;
  setText(acts.sell, 'Vendre ' + fmt(sellValue(c)));
  const perte = aPerte(c);
  acts.sell.title = c.keep ? 'Elle est gardée : relâche-la d’abord.'
    : perte ? 'Elle vaut moins que son œuf, qui a coûté ' + fmt(c.cost) + '.'
    : adult ? 'Vente rentable, au prix fort.'
    : 'Un ' + stg.name + ' ne vaut qu’une fraction de sa valeur adulte — mais ça libère la place.';
  acts.sell.disabled = !!c.keep;

  acts.keep.hidden = false;
  setText(acts.keep, c.keep ? '★ Gardée' : '☆ Garder');
  acts.keep.title = c.keep
    ? 'Aucun automate n’y touchera. Clique pour la relâcher.'
    : 'Ni vendue ni faite évoluer par les automates : elle reste avec toi.';
  acts.keep.classList.toggle('on', !!c.keep);
  acts.keep.disabled = false;

  acts.evo.hidden = false;
  if (c.tier >= 5) {
    setText(acts.evo, 'Forme finale');
    acts.evo.title = 'Plus rien au-dessus — il ne reste qu’à la faire grossir.';
    acts.evo.disabled = true;
    acts.evo.classList.remove('warn-evo');
  } else {
    // on n'alerte que s'il y a réellement de la valeur à perdre, pas au moindre gramme pris
    const perte = mult > 1;
    setText(acts.evo, 'Évoluer ' + fmt(evoCost(c)));
    acts.evo.title = perte
      ? 'Attention : évoluer ramène la taille à ×1 et fait retomber la valeur. Vends-la d’abord si tu l’as engraissée pour ça.'
      : 'Passe au palier suivant. La croissance repart de zéro.';
    acts.evo.classList.toggle('warn-evo', perte);
    acts.evo.disabled = !adult || state.coins < evoCost(c);
  }
}

/* Ce que valent les améliorations, en clair et à l'instant : la durée de base, ce qu'elle
   devient avec ce qu'on possède, et ce qu'un clic apporte. Sans ça on achète des niveaux
   sans jamais voir ce qu'ils changent. */
function ligneBoosts(sujet) {
  const bouts = [];
  if (sujet.kind === 'egg') {
    if (!sujet.slot) return '';
    const base = hatchTime(sujet.slot), n = lvl('couveuse');
    bouts.push('Couvaison ' + fmtTime(base) + ' → ' + (n ? fmtTime(base / n) : 'rien sans toi'));
    if (n) bouts.push('couveuse ×' + n);
  } else {
    const c = sujet.c, t = temperOf(c);
    if (!isAdult(c)) {
      const base = tierTime(c), n = lvl('eleveur');
      bouts.push('Croissance ' + fmtTime(base) + ' → ' +
                 (n ? fmtTime(growTime(c) / n) : 'rien sans toi'));
      if (t.grow !== 1) bouts.push(t.name + ' ×' + dec(t.grow));
      if (n) bouts.push('éleveur ×' + n);
    } else {
      const n = lvl('mangeoire');
      bouts.push('Engraissement ' + (n ? '+' + dec(FATTEN_X * n * t.fat, 1) + ' s par seconde'
                                       : 'rien sans toi'));
      if (n && t.fat !== 1) bouts.push(t.name + ' ×' + dec(t.fat));
      if (n) bouts.push('mangeoire ×' + n);
    }
  }
  bouts.push('un clic vaut ' + clickPower() + ' s');
  return bouts.join('  ·  ');
}

// ce que la bête vaudra une fois adulte à tel palier, taille ordinaire
function valeurAu(c, tier) {
  return Math.round(VALUE[tier - 1] * rarityOf(c).mult * variantMult(c));
}

function noteAcheteur() {
  const e = EGG_BY_KEY[state.buyKind] || EGG_BY_KEY.commun;
  const parHeure = Math.floor(3600 / (e.hatch / Math.max(1, lvl('couveuse'))));
  return 'Environ ' + parHeure + ' éclosion' + (parHeure > 1 ? 's' : '') +
    ' par heure et par incubateur, à ta couveuse actuelle. ' +
    (e.price > 12
      ? 'S’il ne peut pas payer les ' + fmt(e.price) + ', il laisse l’incubateur vide et attend.'
      : 'Il ne s’arrêtera jamais faute de moyens.');
}

function noteEvolution() {
  if (!state.evolveUpTo) return 'Elle ne touche à rien : c’est toi qui décides quand faire monter.';
  const cumul = EVOLVE.slice(0, state.evolveUpTo - 1).reduce((a, b) => a + (b || 0), 0);
  return 'Chaque bête sera menée au palier ' + state.evolveUpTo + ', ce qui lui coûtera ' +
    fmt(cumul) + ' pièces en tout. Elle passe avant le marchand, donc une bête qui peut ' +
    'encore monter n’est jamais vendue au prix du palier d’en dessous.';
}

function noteMarchand() {
  if (!state.sellFrom) return 'Il ne vend rien : les bêtes s’accumulent dans l’enclos jusqu’à ce que tu les vendes toi-même.';
  const vend = Object.values(RARITY).filter(x => x.rank <= state.sellRarity).map(x => x.plur);
  const garde = Object.values(RARITY).filter(x => x.rank > state.sellRarity).map(x => x.plur);
  const taille = state.sellRank
    ? ', devenues ' + RANKS[state.sellRank].fem + 's ou plus'
    : '';
  let txt = 'En clair : il vend les ' + liste(vend) + ' arrivées au palier ' + state.sellFrom +
            (state.sellFrom < 5 ? ' ou au-dessus' : '') + taille + '. ';
  txt += garde.length
    ? 'Les ' + liste(garde) + ' restent dans l’enclos. '
    : 'Rien n’est épargné : attention, un œuf cher ne se rembourse qu’au palier 4. ';

  // le piège de la combinaison : rien n'atteint jamais le seuil, et l'enclos s'engorge
  const plafond = lvl('evolution') ? state.evolveUpTo : 1;
  if (state.sellFrom > plafond) {
    txt += lvl('evolution') && state.evolveUpTo
      ? '⚠ Ton évolution s’arrête au palier ' + state.evolveUpTo + ' : rien n’atteindra jamais le palier ' +
        state.sellFrom + ', et tes enclos vont s’engorger.'
      : '⚠ Rien ne fait monter tes bêtes de palier : elles n’atteindront jamais le palier ' +
        state.sellFrom + ' toutes seules, et tes enclos vont s’engorger.';
  } else if (!state.sellRank && lvl('mangeoire')) {
    txt += 'Ta mangeoire n’aura jamais le temps de les engraisser.';
  }
  return txt;
}

function tickView() {
  $('coins').textContent = fmt(state.coins);

  for (const s of subjects()) {
    const t = thumbs.get(s.key);
    if (!t) continue;
    t.el.setAttribute('aria-current', String(s.key === state.sel));
    if (s.kind === 'egg') {
      const ready = s.slot && s.slot.p >= hatchTime(s.slot);
      setWidth(t.bar, s.slot ? Math.min(100, (s.slot.p / hatchTime(s.slot)) * 100).toFixed(1) + '%' : '0%');
      t.el.classList.toggle('done', !!ready);
      if (s.slot) setText(t.tag, ready ? 'prêt' : 'œuf');
    } else {
      const adult = isAdult(s.c);
      const k = stageOf(s.c).key;
      setWidth(t.bar, Math.min(100, (s.c.p / growTime(s.c)) * 100).toFixed(1) + '%');
      t.el.classList.toggle('done', adult);
      setText(t.tag, k === 'enfant' ? 'enfant' : k === 'ado' ? 'ado'
              : 'p.' + s.c.tier + (k.indexOf('adulte-') === 0 ? ' ✦' : ''));
    }
  }

  const stock = totalEggs();
  $('strip-meta').textContent =
    state.incubators + (state.incubators > 1 ? ' incubateurs' : ' incubateur') + ' · ' +
    state.pen.length + '/' + state.pens + ' enclos' +
    (stock ? ' · ' + stock + ' œuf' + (stock > 1 ? 's' : '') + ' en réserve' : '');

  for (const key of Object.keys(refs.shop)) {
    const r = refs.shop[key];
    const cost = r.cost();
    setText(r.price, fmt(cost));
    r.el.disabled = state.coins < cost;
    if (r.stock) {
      const n = eggStock(r.stock);
      setText(r.desc, r.base + (n ? ' En réserve : ' + n + '.' : ''));
    }
  }

  for (const u of UPGRADES) {
    const r = refs.up[u.key];
    const n = lvl(u.key), maxed = upMaxed(u), cost = upCost(u);
    r.el.classList.toggle('owned', n > 0);
    setText(r.title, u.name + (n > 0 && !u.max ? ' · niv. ' + n : ''));
    setText(r.price, maxed ? 'acquis' : fmt(cost));
    setText(r.desc, upLabel(u));
    r.el.disabled = maxed || state.coins < cost;
  }

  $('cfg-marchand').hidden = !state.up.marchand;
  $('cfg-evolution').hidden = !state.up.evolution;
  $('cfg-acheteur').hidden = !state.up.acheteur;
  $('panel-reglages').hidden = !state.up.marchand && !state.up.evolution && !state.up.acheteur;

  // Chaque réglage dit en clair ce qu'il produit. Une phrase qu'on relit après avoir
  // bougé un menu vaut mieux qu'un mode d'emploi qu'on lit une fois.
  if (state.up.acheteur) setText($('note-acheteur'), noteAcheteur());
  if (state.up.evolution) setText($('note-evolution'), noteEvolution());
  if (state.up.marchand) setText($('note-marchand'), noteMarchand());
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

  /* La barre espace martèle la scène. Sans ce garde-fou elle ferait défiler la page, ce qui
     rend le martèlement au clavier impraticable. On laisse le navigateur faire son travail
     quand le focus est sur un vrai contrôle — un bouton focalisé s'active déjà à l'espace. */
  window.addEventListener('keydown', e => {
    if (e.code !== 'Space' && e.key !== ' ') return;
    const t = e.target;
    if (t && /^(SELECT|INPUT|TEXTAREA|BUTTON|A)$/.test(t.tagName)) return;
    e.preventDefault();
    tapStage();
  });

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

  // Un menu qui garde le focus détournerait la barre espace : on le relâche après usage.
  for (const id of ['sel-marchand', 'sel-rank', 'sel-rarete', 'sel-evolution', 'sel-acheteur']) {
    $(id).addEventListener('change', e => e.target.blur());
  }

  $('sel-marchand').addEventListener('change', e => {
    state.sellFrom = parseInt(e.target.value, 10) || 0;
  });

  $('sel-rank').addEventListener('change', e => {
    state.sellRank = parseInt(e.target.value, 10) || 0;
  });

  $('sel-rarete').addEventListener('change', e => {
    state.sellRarity = parseInt(e.target.value, 10) || 0;
  });

  $('sel-evolution').addEventListener('change', e => {
    state.evolveUpTo = parseInt(e.target.value, 10) || 0;
  });

  $('sel-acheteur').addEventListener('change', e => {
    state.buyKind = EGG_BY_KEY[e.target.value] ? e.target.value : 'commun';
  });
}

function start() {
  state = load();
  buildChrome();
  bindTools();

  $('btn-speed').textContent = '×' + state.speed;
  $('btn-sound').setAttribute('aria-pressed', String(state.sound));
  $('sel-marchand').value = String(state.sellFrom);
  $('sel-rank').value = String(state.sellRank || 0);
  $('sel-rarete').value = String(state.sellRarity || 0);
  $('sel-evolution').value = String(state.evolveUpTo);
  $('sel-acheteur').value = state.buyKind;

  catchUp();
  refresh();

  setInterval(loop, 100);
  setInterval(save, 5000);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
}

start();
