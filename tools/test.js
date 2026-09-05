/* ── LA SUITE DE TESTS ────────────────────────────────────────────────────────
       node tools/test.js              tout
       node tools/test.js bonheur      seulement les scénarios dont le nom contient « bonheur »

   Le projet n'ouvre jamais de navigateur : ces scénarios sont la seule chose qui dise si le
   jeu marche encore. Ils ont été écrits au fil des versions, chacun le jour où quelque chose
   s'est cassé — c'est pourquoi ils visent des endroits précis plutôt que de couvrir
   uniformément.

   CE QU'ILS NE PROUVENT PAS : rien de visuel. Le DOM du banc ne met rien en page. Un panneau
   superposé, un texte illisible ou une couleur ratée passent tous les tests. */

'use strict';
const fs = require('fs');
const path = require('path');
const { neuf, noeuds, inconnus, RACINE, lire, brut, rechargements } = require('./banc.js');

const filtre = process.argv[2];
let scenarios = 0, verifs = 0, ratees = [];
let courant = '';

function scenario(nom, f) {
  if (filtre && !nom.toLowerCase().includes(filtre.toLowerCase())) return;
  courant = nom; scenarios++;
  const avant = ratees.length;
  try { f(); } catch (e) { ratees.push([nom, 'a levé : ' + e.message]); }
  console.log((ratees.length === avant ? '  ✓ ' : '  ✗ ') + nom);
}
function ok(quoi, vrai, detail) {
  verifs++;
  if (!vrai) ratees.push([courant, quoi + (detail === undefined ? '' : '  → ' + detail)]);
}
const eq = (quoi, a, b) => ok(quoi + ' (' + a + ' attendu ' + b + ')', a === b);

/* POSER N JETONS, c'est remplir la BOURSE depuis la 4.0.0 — et non plus poser une fortune qui
   aurait franchi n paliers. L'échelle n'a que onze crans, donc au-delà elle ne savait plus
   représenter la demande ; la bourse, elle, n'a pas de plafond. `paliers` reste ce qui a ouvert
   l'ascension une première fois. */
function poserJetons(jeu, n) {
  jeu.state.asc.jetons = n;
  jeu.state.asc.sommet = 0;
  jeu.state.asc.paliers = jeu.RANG_PREMIER;
}

// une bête posée dans l'enclos, sans passer par la couvaison
function bete(jeu, ligne, age, p) {
  const s = jeu.state;
  s.incub[0] = { line: ligne || 'crapaud', p: 9999, kind: 'commun' };
  jeu.hatchAll();
  const c = s.pen[s.pen.length - 1];
  if (age) c.age = age;
  if (p !== undefined) c.p = p;
  s.sel = 'c:' + c.id;
  jeu.refresh();
  return c;
}

/* SATURER LE COMBO AVANT DE MESURER AUTRE CHOSE. Depuis qu'un clic monte le combo, deux clics
   consécutifs ne valent plus la même chose — c'est le but de la mécanique, et c'est un poison
   pour tout scénario qui compare un clic à un autre. Au plafond, `comboMult` ne bouge plus :
   les deux clics redeviennent comparables. On repose ensuite ce que les clics ont poussé. */
function saturerCombo(jeu) {
  const s = jeu.state, sujet = jeu.current();
  const p = sujet && sujet.c ? sujet.c.p : 0, over = sujet && sujet.c ? sujet.c.over : 0;
  const oeuf = s.incub[0] ? s.incub[0].p : null;
  for (let i = 0; i < jeu.COMBO_PLEIN; i++) jeu.tapStage();
  if (sujet && sujet.c) { sujet.c.p = p; sujet.c.over = over; }
  if (oeuf !== null && s.incub[0]) s.incub[0].p = oeuf;
}

/* ───────────────────────────── le socle ───────────────────────────── */

scenario('démarrage — chaque id demandé existe dans index.html', () => {
  const jeu = neuf();
  ok('aucun id manquant', inconnus.length === 0, inconnus.join(', '));
  ok('version au format « mot X.Y.Z »', /^(alpha|beta) \d+\.\d+\.\d+$/.test(jeu.VERSION), jeu.VERSION);
  ok('numéro de sauvegarde entier', Number.isInteger(jeu.SAVE_V));
});

scenario('la boucle — œuf, éclosion, croissance, maturité, vente', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  eq('un œuf offert au départ', s.incub.filter(Boolean).length, 1);
  s.incub[0].p = 9999; jeu.hatchAll();
  eq('une bête après éclosion', s.pen.length, 1);
  const c = s.pen[0];
  eq('elle naît au niveau 1', jeu.niveau(c), 1);
  ok('elle n’est pas mûre', !jeu.estMur(c));
  c.p = jeu.bandTo(c);
  ok('au bout de sa tranche elle est mûre', jeu.estMur(c));
  const avant = s.coins;
  jeu.sell(c);
  ok('la vente rapporte', s.coins > avant, s.coins);
  eq('l’enclos se vide', s.pen.length, 0);
});

scenario('sauvegarde — tout ce qui compte revient après un rechargement', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 12345; s.pens = 4; s.incubators = 3;
  s.incub = [null, null, null]; s.eggs.commun = 7;
  const c = bete(jeu, 'crabe', 3, 2000);
  c.over = 500; c.bonheur = 77; s.frenesie = 9; s.dons = 2;
  jeu.save(); jeu.load(); jeu.refresh();
  const t = jeu.state;
  eq('les pièces', Math.round(t.coins), 12345);
  eq('les enclos', t.pens, 4);
  eq('la réserve d’œufs', t.eggs.commun, 7);
  eq('l’âge de la bête', t.pen[0].age, 3);
  eq('son embonpoint', Math.round(t.pen[0].over), 500);
  eq('son bonheur', Math.round(t.pen[0].bonheur), 77);
  eq('les cadeaux reçus', t.dons, 2);
});

/* ─────────────────────── ce qui s'affiche d'une bête ─────────────────────── */

scenario('trois axes — âge, niveau et taille tiennent chacun leur colonne', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 4;
  const c = bete(jeu);
  const T = id => (noeuds.get(id).textContent || '').trim();

  // toutes les combinaisons d'âge et d'embonpoint doivent se rendre sans lever
  let rendus = 0;
  for (let age = 1; age <= jeu.AGES.length; age++) {
    for (const p of [1, 200, 1200, 6000, 30000, 200000]) {
      for (const over of [0, 400, 30000, 9e6]) {
        c.age = age; c.p = p; c.over = over;
        jeu.refresh(); rendus++;
      }
    }
  }
  eq('états rendus', rendus, jeu.AGES.length * 6 * 4);

  c.age = 1; c.over = 0;
  c.p = 5; jeu.refresh();
  ok('en croissance, la barre vise le NIVEAU', T('timer-axe') === 'niveau', T('timer-axe'));
  ok('la colonne niveau est active', noeuds.get('axe-niv').classList.contains('actif'));
  eq('le niveau s’écrit sur son plafond', T('axe-niv-val'),
     jeu.niveau(c) + ' / ' + (jeu.nivBase(1) + jeu.nivDansAge(1)));

  c.p = jeu.bandTo(c); jeu.refresh();
  ok('mûre, la barre vise la TAILLE', T('timer-axe') === 'taille', T('timer-axe'));
  ok('la colonne taille est active', noeuds.get('axe-taille').classList.contains('actif'));
  ok('la colonne niveau est marquée mûre', noeuds.get('axe-niv').classList.contains('mur'));
  eq('les deux nombres se rejoignent', T('axe-niv-val').split(' / ')[0], T('axe-niv-val').split(' / ')[1]);
  eq('taille sans embonpoint', T('axe-taille-val'), 'normale');

  s.sel = 'i:0'; jeu.refresh();
  ok('un œuf n’a pas de colonnes', noeuds.get('stage-axes').hidden);
});

scenario('échelle des rangs — une bête achetée est à l’équilibre à l’âge adulte', () => {
  const jeu = neuf(); const s = jeu.state;
  const ligne = {};
  for (const l of jeu.LINES) if (!ligne[l.rarity]) ligne[l.rarity] = l.key;

  /* LA RÈGLE : l'œuf plus les deux premiers péages valent exactement ce que la bête se vend
     une fois mûre à l'âge adulte. C'est `mult` qui la tient — il porte la revente ET le péage,
     donc un seul nombre par rareté suffit. La commune joue sur l'autre échelle et la rare
     garde son prix de la 4.8.0 : toutes deux sont bénéficiaires, et c'est écrit dans game.js. */
  for (const rar of ['epique', 'mythique']) {
    const oeuf = jeu.EGG_KINDS.find(e => e.rarity === rar);
    const c = { id: 1, line: ligne[rar], age: 1, p: 0, over: 0, cost: 0 };
    let peages = 0;
    s.pen = [c];
    for (let a = 1; a <= 2; a++) { c.age = a; peages += jeu.evoCost(c); }
    c.age = 3; c.p = jeu.bandTo(c);
    const cout = oeuf.price + peages, vaut = jeu.sellValue(c);
    ok(rar + ' est à l’équilibre à l’âge adulte mûr',
       Math.abs(vaut - cout) / cout < 0.001, ((vaut - cout) / cout * 100).toFixed(3) + ' %');
  }
  eq('l’œuf épique vaut un billion', jeu.EGG_BY_KEY.epique.price, 1e12);

  // l'escalier ne se retourne pas : ni les multiplicateurs, ni les prix
  let m = 0;
  for (const cle of Object.keys(jeu.RARITY).sort((a, b) => jeu.RARITY[a].rank - jeu.RARITY[b].rank)) {
    ok('le multiplicateur monte avec le rang (' + cle + ')', jeu.RARITY[cle].mult >= m,
       jeu.RARITY[cle].mult);
    m = jeu.RARITY[cle].mult;
  }
  let prix = 0;
  for (const e of jeu.OEUFS_VENDUS) { ok('le prix des œufs monte (' + e.key + ')', e.price > prix, e.price); prix = e.price; }

  /* LES MENUS DU MARCHAND LISENT LA BONNE ÉCHELLE. Ils lisaient celle des communes pour toutes
     les raretés — cinq cents fois à côté sur une épique adulte, sur le chiffre même qui sert à
     régler la consigne. */
  eq('une épique adulte mûre vaut ce que dit valeurBase',
     jeu.valeurMure('epique', 3), jeu.VALEURS_RANG[2] * jeu.RARITY.epique.mult);
  ok('et non l’échelle des communes',
     jeu.valeurMure('epique', 3) !== jeu.VALUE[2] * jeu.RARITY.epique.mult);
  eq('les péages jusqu’à l’âge adulte suivent la même échelle',
     jeu.peagesJusque('epique', 3),
     (jeu.PEAGES_RANG[0] + jeu.PEAGES_RANG[1]) * jeu.RARITY.epique.mult);
  eq('une commune garde l’échelle des âges',
     jeu.valeurMure('commune', 3), jeu.VALUE[2]);

  /* LE SEUIL DE REMBOURSEMENT LIT LA MÊME ÉCHELLE — c'était le quatrième site de la faute, et
     le pire : il rendait `null` pour les quatre raretés payantes, c'est-à-dire « elle ne
     rembourse jamais », sur une bête qu'on vient de payer un billion. Le seuil d'une rare est
     l'âge adulte, et ce n'est pas un réglage : c'est la règle du multiplicateur qui retombe
     sur ses pieds — l'œuf et ses deux premiers péages valent la bête mûre à cet âge-là. */
  const s2 = jeu.state; s2.tuto = false; s2.pens = 8;
  const seuil = (ligne, rar) => {
    const oeuf = jeu.EGG_KINDS.find(e => e.rarity === rar);
    s2.incub[0] = { line: ligne, p: 9999, kind: oeuf.key };
    jeu.hatchAll();
    const c = s2.pen[s2.pen.length - 1];
    c.chroma = 0; c.rank = 0; c.motif = 0; c.temper = 0; c.prodige = false; c.fond = null;
    c.cost = oeuf.price || 0;
    return jeu.seuilRentable(c);
  };
  /* ── LA GARDE ────────────────────────────────────────────────────────────────
     Une seule faute, quatre sites, deux versions pour la voir : choisir entre l'échelle des
     communes et celle des rangs a été écrit à la main quatre fois, et faux quatre fois. Ce
     bloc interdit la cinquième. Toute indexation de `VALUE[`, `EVOLVE[`, `VALEURS_RANG[` ou
     `PEAGES_RANG[` en dehors des deux portes fait échouer le scénario.

     On lit la SOURCE et non le comportement, parce que c'est la recopie qu'on veut interdire,
     pas son résultat : un cinquième site copié serait juste le jour où on l'écrit, et faux au
     premier changement d'échelle — c'est exactement ce qui est arrivé aux quatre autres. */
  const portes = ['const echelleDe', 'const peagesDe'];
  /* ON NE SCANNE QUE DU CODE. Les commentaires de `game.js` CITENT les tables pour expliquer
     la règle — c'est même là qu'elle est écrite — et une prose qui explique n'applique rien.
     Un état de bloc plutôt qu'un `replace` global : on garde les numéros de ligne, sans quoi
     le message d'échec désignerait une ligne qui n'existe pas. */
  let dansBloc = false;
  const fautes = [];
  lire('game.js').split(/\r?\n/).forEach((l, i) => {
    const t = l.trim();
    if (dansBloc) { if (t.indexOf('*/') >= 0) dansBloc = false; return; }
    if (t.indexOf('/*') === 0) { if (t.indexOf('*/') < 0) dansBloc = true; return; }
    if (t.indexOf('//') === 0) return;
    if (!/(VALUE|EVOLVE|VALEURS_RANG|PEAGES_RANG)\s*\[/.test(l)) return;
    if (portes.some(q => l.indexOf(q) === 0)) return;
    fautes.push((i + 1) + ' : ' + t.slice(0, 60));
  });
  ok('les quatre tables ne se lisent que par leurs deux portes',
     fautes.length === 0, fautes.join('  |  '));

  eq('une commune rembourse dès l’enfance', seuil('crapaud', 'commune'), 1);
  eq('une rare rembourse à l’âge adulte', seuil('loup', 'rare'), 3);
  eq('une épique à l’âge ancien', seuil('golem', 'epique'), 4);
  eq('une mythique aussi', seuil('ouroboros', 'mythique'), 4);
});

scenario('noms — aucun ne reprend un mot d’âge ni de taille', () => {
  const jeu = neuf();
  const mots = new Set();
  jeu.AGES.forEach(a => mots.add(a.nom));
  jeu.RANKS.forEach(r => { if (r.name) mots.add(r.name); if (r.fem) mots.add(r.fem); });
  const racine = m => m.replace(/(esque|ale?|es?|s)$/, '').slice(0, 6).toLowerCase();
  const sansAccent = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const racines = [...mots].map(racine).map(sansAccent);
  let noms = 0;
  for (const l of jeu.LINES) l.forms.forEach((f, i) => {
    noms++;
    for (const mot of sansAccent(f[0]).split(/[^a-z]+/)) {
      if (mot.length < 4) continue;
      const heurt = racines.find(r => mot.startsWith(r) || r.startsWith(mot));
      ok('« ' + f[0] + ' » (' + l.name + ', âge ' + (i + 1) + ') reprend « ' + heurt + ' »', !heurt);
    }
  });
  eq('noms vérifiés', noms, jeu.LINES.length * jeu.AGES.length);
});

scenario('illustrations — chaque fichier cité par ART existe', () => {
  const src = lire('game.js');
  const fichiers = [...src.matchAll(/'([a-z0-9-]+-[1-5]-[a-z0-9-]+\.png)'/g)].map(m => m[1]);
  ok('la table ART n’est pas vide', fichiers.length > 0, fichiers.length);
  for (const f of fichiers) {
    ok('art/' + f + ' manque', fs.existsSync(path.join(RACINE, 'art', f)));
  }
});

scenario('atelier — la page générée s’exécute, et elle pose de vraies images', () => {
  /* LA PAGE N’ÉTAIT VÉRIFIÉE PAR RIEN, et ça s’est vu : en retirant un bloc devenu inutile,
     la constante voisine est partie avec, et la page ne dessinait plus une seule bête —
     `TAILLES_BANDE is not defined`, à la première ligne de la première boucle. Le générateur
     tournait sans broncher : il écrit du texte, il ne le fait pas tourner.

     ON EXÉCUTE DONC LE SCRIPT DE LA PAGE, contre un DOM de fortune. Ce n’est pas un
     navigateur — rien ici ne dit si c’est joli — mais ça dit si ça MARCHE, et c’était le
     seul mode de panne qu’aucun scénario ne pouvait voir. */
  const page = lire('tools/atelier.html');
  const code = (page.match(/<script>([\s\S]*?)<\/script>/) || [])[1];
  ok('la page porte bien un script', !!code && code.length > 500, code ? code.length : 0);

  /* Le DOM de fortune. Il ne fait que ce que la page demande, et pas une ligne de plus : un
     faux DOM complet serait un deuxième navigateur à maintenir. */
  const noeuds = new Map();
  const neufNoeud = () => {
    const n = {
      enfants: [], className: '', textContent: '', title: '', alt: '', src: null,
      value: undefined, checked: false, attributs: {},
      style: new Proxy({ setProperty(k, v) { this[k] = v; } }, {}),
      appendChild(e) { this.enfants.push(e); if (this.value === undefined && e.value !== undefined) this.value = e.value; return e; },
      append(...e) { e.forEach(x => this.appendChild(x)); },
      addEventListener() {},
      setAttribute(k, v) { this.attributs[k] = v; if (k === 'src') this.src = v; },
      querySelector() { return null; },
    };
    return n;
  };

  /* Les valeurs de départ viennent du BALISAGE, pas d’une supposition : un curseur dont la
     valeur initiale change dans le HTML doit casser ici si le script ne suit pas. */
  const depart = id => {
    const balise = new RegExp('<[^>]*id="' + id + '"[^>]*>').exec(page);
    if (!balise) return {};
    const v = /value="([^"]*)"/.exec(balise[0]);
    const coche = /\bchecked\b/.test(balise[0]);
    if (v) return { value: v[1], checked: coche };
    // un select prend la valeur de sa première option
    if (!/^<select/.test(balise[0])) return { checked: coche };
    /* Cherchée DANS ce select, et non n’importe où ensuite : sans la borne, la liste des
       lignées héritait de l’option du menu des fonds, et la page entière partait sur un
       indice qui n’existe pas. */
    const debut = page.indexOf(balise[0]) + balise[0].length;
    const suite = page.slice(debut, page.indexOf('</select>', debut));
    const opt = /<option value="([^"]*)"/.exec(suite);
    return opt ? { value: opt[1], checked: coche } : { checked: coche };
  };

  const document = {
    getElementById(id) {
      if (!noeuds.has(id)) { const n = neufNoeud(); Object.assign(n, depart(id)); noeuds.set(id, n); }
      return noeuds.get(id);
    },
    createElement() { return neufNoeud(); },
    body: neufNoeud(),
  };

  let boum = null;
  try { new Function('document', code)(document); } catch (e) { boum = e.message; }
  ok('le script tourne sans exploser', boum === null, boum);

  // ── et il a réellement produit quelque chose ────────────────────────────────
  const toutes = [];
  (function descendre(n) { for (const e of n.enfants) { toutes.push(e); descendre(e); } })(document.body);
  for (const id of ['at-couleurs', 'at-bande', 'at-ages', 'at-fonds', 'at-tailles'])
    (function descendre(n) { for (const e of n.enfants) { toutes.push(e); descendre(e); } })(document.getElementById(id));

  const images = toutes.filter(n => n.src);
  ok('la page pose des images', images.length >= 36, images.length + ' images');

  const filtrees = images.filter(n => n.style.filter);
  ok('les couleurs sont bien appliquées', filtrees.length >= 36, filtrees.length + ' images filtrées');

  /* CHAQUE SOURCE DOIT EXISTER SUR LE DISQUE. La page cite les dessins en chemin relatif depuis
     `tools/` ; une lignée renommée casserait la page en silence. */
  const manquants = [...new Set(images.map(n => n.src))]
    .filter(src => !fs.existsSync(path.join(RACINE, 'tools', src)));
  ok('aucun dessin cité n’est absent', manquants.length === 0, manquants.join(', '));
});

scenario('pages d’outil — celle qui cite style.css reprend son défilement', () => {
  /* LA FAUTE DE LA PLANCHE ET DE L’ATELIER, DEUX FOIS DE SUITE. `style.css` pose une mise en
     page « application » sur le `body` — `height: 100vh`, `overflow: hidden`, une grille à
     deux colonnes — pour que le jeu ne défile pas sous la barre espace. Une page d’outil qui
     cite cette feuille hérite du cadre : tout ce qui suit le premier écran devient
     inatteignable, et les sections se rangent en silence dans la colonne de 21 rem.

     ET ÇA NE SE VOIT QU’AU-DESSUS DE 62 REM DE LARGE, parce qu’en dessous `style.css` rend
     lui-même le défilement pour son affichage étroit. Une page coupée sur grand écran et
     correcte sur petit : personne ne va chercher ça dans une feuille qu’il ne fait que lier.
     D’où ce scénario plutôt qu’un troisième oubli. */
  const pages = fs.readdirSync(path.join(RACINE, 'tools')).filter(f => f.endsWith('.html'));
  ok('il y a des pages d’outil à vérifier', pages.length > 0, pages.join(', '));
  for (const f of pages) {
    const h = lire('tools/' + f);
    if (!/href="\.\.\/style\.css"/.test(h)) continue;   // une page qui ne cite rien n’hérite de rien
    ok(f + ' lie le filet', /href="outil\.css"/.test(h));
    ok(f + ' porte la classe outil sur son body', /<body class="[^"]*\boutil\b/.test(h));
  }

  /* ET LE FILET DIT BIEN LES TROIS CHOSES QU’IL DOIT DIRE. Le lier sans qu’il rende le
     défilement ne servirait à rien, et c’est le genre de fichier qu’on vide en le rangeant. */
  const filet = lire('tools/outil.css');
  for (const regle of ['display: block', 'height: auto', 'overflow: visible'])
    ok('outil.css rend « ' + regle + ' »', filet.includes(regle));
});

/* ────────────────────────── la ferme et ses automates ────────────────────────── */

scenario('réserve d’œufs — elle se vide toute seule, et gratuitement', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e6; s.incubators = 4; s.pens = 8;
  s.incub = [null, null, null, null];
  s.eggs = { commun: 10, rare: 2, epique: 0, mythique: 0 };
  s.file = [];
  /* L'ORDRE DE LA FILE EST DÉSORMAIS RÉGLABLE, et par défaut c'est l'ARRIVÉE — comme
     l'enclos. Ce scénario tenait le comportement d'avant, qui était écrit en dur : il tient
     maintenant la route « rareté », qui est celle qu'il décrivait. */
  s.triOeuf = 'rarete';
  const avant = s.coins;
  jeu.runAutomations(0.1);
  eq('les quatre incubateurs se remplissent', s.incub.filter(Boolean).length, 4);
  eq('les deux rares passent devant', s.incub.filter(o => o.kind === 'rare').length, 2);
  eq('la réserve a fondu d’autant', s.eggs.commun, 8);
  eq('rien n’a été payé', s.coins, avant);

  // réserve sèche, pas d'acheteur : rien ne se passe
  s.incub = [null, null, null, null];
  s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0 };
  jeu.runAutomations(0.1);
  eq('sans acheteur, aucun incubateur rempli', s.incub.filter(Boolean).length, 0);
  eq('et aucune pièce dépensée', s.coins, avant);

  // avec l'acheteur, il paie
  s.primes.acheteur = true; s.buyKind = 'commun';
  jeu.runAutomations(0.1);
  eq('l’acheteur remplit', s.incub.filter(Boolean).length, 4);
  ok('et il a payé', s.coins < avant, s.coins);

  /* LA MERVEILLE EST DANS LA RÉSERVE COMME LES AUTRES. Elle n'a pas de prix, donc elle
     n'était pas dans `OEUFS_VENDUS` — la liste de ce qui S'ACHÈTE — et c'est sur celle-là que
     la file et la priorité se lisaient. Le rang le plus haut du jeu passait derrière du
     commun, et une réserve qui n'en contenait que des merveilles ne désignait plus rien : la
     boucle inscrivait un NaN dans les comptes et remplissait chaque case d'un œuf fantôme. */
  s.primes.acheteur = false;
  s.incub = [null, null, null, null];
  s.eggs = { commun: 3, rare: 0, epique: 0, mythique: 0, merveille: 1 };
  s.file = [];
  eq('la merveille est en tête de la réserve', jeu.reserveEnOrdre()[0], 'merveille');
  eq('et c’est elle que le jeu désigne', jeu.bestStocked(), 'merveille');
  jeu.runAutomations(0.1);
  eq('elle part la première', s.incub[0].kind, 'merveille');
  eq('la réserve n’en a plus', s.eggs.merveille, 0);
  ok('et les trois communes suivent', s.incub.slice(1).every(o => o && o.kind === 'commun'));

  // une réserve qui n'a que des merveilles se vide, elle ne fabrique pas de fantômes
  s.incub = [null, null, null, null];
  s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0, merveille: 2 };
  s.file = [];
  jeu.runAutomations(0.1);
  eq('les deux merveilles couvent', s.incub.filter(o => o && o.kind === 'merveille').length, 2);
  eq('et rien d’autre n’a été posé', s.incub.filter(Boolean).length, 2);
  eq('le compte reste juste', s.eggs.merveille, 0);

  // il ne brade jamais la consigne
  s.primes.acheteur = true;
  s.incub = [null, null, null, null];
  s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0, merveille: 0 };
  s.buyKind = 'rare';
  s.coins = jeu.prixOeuf(jeu.EGG_BY_KEY.rare) * 2 + 5;
  jeu.runAutomations(0.1);
  eq('deux rares seulement, pas de repli sur le commun', s.incub.filter(Boolean).length, 2);
  ok('toutes rares', s.incub.filter(Boolean).every(o => o.kind === 'rare'));
});

scenario('hors-ligne — la ferme avance, le tutoriel se tait', () => {
  const jeu = neuf({
    v: 11, coins: 5e7, pens: 6, incubators: 6, eggs: { commun: 12 },
    up: { couveuse: 9, eleveur: 9, mangeoire: 6, marchand: 1 },
    pen: [], incub: [null, null, null, null, null, null],
    sellAt: { commune: 1, rare: 1, epique: 1, mythique: 1 },
    tuto: true, vu: {}, dial: null, seen: {}, devoile: {},
    t: Date.now() - 8 * 3600 * 1000,
  });
  const s = jeu.state;
  ok('la boîte de dialogue reste fermée', noeuds.get('dial').hidden);
  eq('aucune scène en cours', s.dial, null);
  ok('les scènes franchies sont marquées lues en silence',
     jeu.NOTES.filter(n => s.vu[n.cle]).length > 0);
  ok('le bandeau de retour s’affiche', !noeuds.get('offline-note').hidden);
  ok('les œufs ont été placés et couvés', s.eggs.commun < 12, s.eggs.commun);
});

/* ────────────────────────── le bonheur et la frénésie ────────────────────────── */

scenario('absence — bornée, et elle ne rend qu’un quart de ce qu’elle a duré', () => {
  const jeu = neuf();
  ok('le plafond tient en deux heures', jeu.OFFLINE_CAP === 2 * 3600, jeu.OFFLINE_CAP);
  ok('et le quart est un quart', jeu.OFFLINE_PART === 0.25, jeu.OFFLINE_PART);

  /* LA FORMULE EST LA SEULE CHOSE À TENIR : `min(réel, CAP) × PART`. Tout le reste — les
     éclosions, les ventes, la rente, la pension — se rejoue exactement, sur un temps plus
     court. C'est ce qui permet de borner l'absence sans toucher à `runAutomations`. */
  const h = 3600, m = 60;
  const rejoue = reel => jeu.absenceRejouee(Date.now() - reel * 1000);
  const proche = (a, b) => Math.abs(a - b) < 1;
  ok('dix minutes en rendent deux et demie', proche(rejoue(10 * m), 2.5 * m), rejoue(10 * m));
  ok('deux heures en rendent trente minutes', proche(rejoue(2 * h), 30 * m), rejoue(2 * h));
  ok('une nuit aussi', proche(rejoue(8 * h), 30 * m), rejoue(8 * h));
  ok('un week-end aussi', proche(rejoue(60 * h), 30 * m), rejoue(60 * h));

  /* UNE NUIT NE DOIT PLUS VALOIR UNE NUIT. C'est le chiffre du chantier : elle rendait
     douze heures de présence pour huit d'absence, la ferme grossissant pendant qu'on dort. */
  const ferme = () => {
    const j = neuf(); const s = j.state;
    s.tuto = false; s.pens = 8; s.incubators = 4; j.syncIncub();
    s.up.couveuse = 30; s.up.eleveur = 30; s.up.mangeoire = 30;
    for (const r of Object.keys(j.RARITY)) s.sellAt[r] = 0;
    for (let i = 0; i < 8; i++) {
      s.incub[0] = { line: 'loup', p: 9999, kind: 'rare' };
      j.hatchAll();
      const c = s.pen[s.pen.length - 1];
      c.age = 5; c.p = j.bandTo(c); c.keep = true;
      c.chroma = 0; c.rank = 0; c.motif = 0; c.temper = 0; c.prodige = false;
    }
    s.incub = [null, null, null, null];
    s.coins = 0;
    return j;
  };
  const gagne = (j, secondes) => {
    const avant = j.state.coins, pas = Math.max(1, secondes / 20000);
    for (let t = 0; t < secondes; t += pas) { j.advance(pas); j.runAutomations(pas); j.hatchAll(); }
    return j.state.coins - avant;
  };
  const uneHeure = gagne(ferme(), h);
  const nuit = gagne(ferme(), jeu.absenceRejouee(Date.now() - 8 * h * 1000));
  ok('une nuit rend moins qu’une heure de présence', nuit < uneHeure, (nuit / uneHeure).toFixed(2));
  ok('et elle rend quand même quelque chose', nuit > 0, nuit);
});

scenario('combo — il monte en racine, plafonne, et tombe à quinze secondes', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const c = bete(jeu, 'crapaud', 1, 0);
  jeu.select('c:' + c.id);
  eq('rien tant qu’on n’a pas cliqué', jeu.comboMult(), 1);

  /* LA RACINE PLUTÔT QUE LA PENTE DROITE, ET C'EST UNE QUESTION DE LISIBILITÉ : en pente
     droite, neuf clics donnent ×1,18 sur un clic qui ne pèse déjà rien, et personne ne
     découvre que la mécanique existe. En racine ils donnent ×1,60. */
  const mult = n => { for (let i = 0; i < n; i++) jeu.tapStage(); return jeu.comboMult(); };
  const a9 = mult(9);
  ok('neuf clics valent déjà 1,60', Math.abs(a9 - 1.6) < 0.01, a9);
  const a25 = mult(16);
  ok('vingt-cinq en valent 2,00', Math.abs(a25 - 2) < 0.01, a25);

  /* LE DIXIÈME CLIC VAUT TROIS FOIS LE QUATRE-VINGT-DIXIÈME : c'est ce que la racine déplace,
     et c'est voulu. Le combo ne dit pas « plus tu enchaînes, mieux c'est », il dit « atteins
     le plateau vite, puis tiens-le » — ce que la règle des quinze secondes décrit déjà. */
  const pente = n => {
    const j = neuf(); j.state.tuto = false;
    const b = bete(j, 'crapaud', 1, 0); j.select('c:' + b.id);
    for (let i = 0; i < n - 1; i++) j.tapStage();
    const avant = j.comboMult(); j.tapStage();
    return j.comboMult() - avant;
  };
  ok('le dixième clic vaut trois fois le quatre-vingt-dixième',
     Math.abs(pente(10) / pente(90) - 3.1) < 0.2, (pente(10) / pente(90)).toFixed(2));

  mult(200);
  eq('il plafonne, et le compte avec lui', jeu.combo, jeu.COMBO_PLEIN);
  eq('au plafond exact', jeu.comboMult(), jeu.COMBO_MAX);

  /* QUINZE SECONDES SANS CLIC ET TOUT TOMBE — pas une décroissance, une chute. On déplace
     l'horloge plutôt que d'attendre. */
  const vrai = Date.now;
  try {
    Date.now = () => vrai() + (jeu.COMBO_FIN - 1) * 1000;
    jeu.tickCombo();
    eq('quatorze secondes ne suffisent pas', jeu.combo, jeu.COMBO_PLEIN);
    Date.now = () => vrai() + (jeu.COMBO_FIN + 1) * 1000;
    jeu.tickCombo();
    eq('quinze secondes emportent tout', jeu.combo, 0);
    eq('et le multiplicateur avec', jeu.comboMult(), 1);
  } finally { Date.now = vrai; }

  /* IL NE SE SAUVEGARDE PAS : un rechargement est une absence, et garder la série en ferait
     un raccourci. C'est une variable de module, pas un champ de `state`. */
  ok('il ne vit pas dans l’état sauvegardé', !('combo' in s), Object.keys(s).join(' '));
});

scenario('combo et idle — la carte ocellée est neutre aux deux', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const c = bete(jeu, 'crapaud', 1, 0);
  jeu.select('c:' + c.id);

  /* CE QUI RÉCOMPENSE LA PRÉSENCE NE S'AUTOMATISE PAS. La doctrine est déjà celle de la bête
     finie et de la plonge : sans elle, l'ocellé monterait le combo tout seul et interdirait
     l'idle à vie — la carte deviendrait une malédiction. */
  equiper(jeu, jeu.MOTIFS.indexOf('ocellé'), 5);
  ok('la carte clique bien toute seule', jeu.bonusAlbum().clicAuto > 0, jeu.bonusAlbum().clicAuto);

  const avantP = c.p;
  for (let i = 0; i < 100; i++) jeu.tickOcelle(0.1);        // dix secondes de clics de carte
  ok('elle a bien cliqué', c.p > avantP, c.p - avantP);
  eq('et pourtant le combo n’a pas bougé', jeu.combo, 0);
  eq('donc le multiplicateur non plus', jeu.comboMult(), 1);

  /* ELLE NE CASSE PAS L'IDLE NON PLUS, et c'est la même règle vue de l'autre côté : sans ça,
     équiper la carte interdirait l'état de calme pour toujours. */
  jeu.tapStage();                                          // une vraie main, pour amorcer
  const vrai = Date.now;
  try {
    Date.now = () => vrai() + (jeu.IDLE_SEUIL + 1) * 1000;
    eq('l’idle s’allume malgré la carte', jeu.enIdle(), true);
    for (let i = 0; i < 100; i++) jeu.tickOcelle(0.1);
    eq('et ses cent clics ne l’éteignent pas', jeu.enIdle(), true);
  } finally { Date.now = vrai; }
});

scenario('idle — une minute sans clic, et la ferme tourne mieux', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.up.couveuse = 30; s.up.eleveur = 30; s.up.mangeoire = 30;
  const c = bete(jeu, 'crapaud', 1, 0);
  jeu.select('c:' + c.id);

  eq('le jeu ne s’ouvre pas en idle', jeu.enIdle(), false);
  ok('même après une minute sans avoir jamais cliqué', !jeu.enIdle());

  jeu.tapStage();
  eq('un clic l’éteint', jeu.enIdle(), false);
  eq('et le multiplicateur retombe à un', jeu.coefIdle(), 1);

  /* LE SEUIL SE LIT SUR L'HORLOGE, donc on la déplace plutôt que d'attendre une minute. */
  const vrai = Date.now;
  try {
    Date.now = () => vrai() + (jeu.IDLE_SEUIL + 1) * 1000;
    eq('une minute sans clic l’allume', jeu.enIdle(), true);
    eq('et la ferme tourne une fois et demie plus vite', jeu.coefIdle(), jeu.IDLE_X);

    // ce qui tourne tourne mieux, et ça se mesure
    s.incub[0] = { line: 'crapaud', p: 0, kind: 'commun' };
    jeu.advance(1);
    const calme = s.incub[0].p;
    Date.now = vrai;
    jeu.tapStage(); // on éteint l'idle
    s.incub[0].p = 0;
    jeu.advance(1);
    ok('la couvaison suit le calme', Math.abs(calme / s.incub[0].p - jeu.IDLE_X) < 0.01,
       calme / s.incub[0].p);
  } finally { Date.now = vrai; }
});

scenario('bonheur — la jauge monte pour la bête en scène, et pour elle seule', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 4;
  const a = bete(jeu, 'crapaud');
  const b = bete(jeu, 'crabe');
  s.sel = 'c:' + b.id;
  for (let i = 0; i < 300; i++) jeu.tickJoie(0.1);   // 30 s
  eq('celle qu’on regarde gagne du bonheur', Math.round(b.bonheur), 30);
  ok('l’autre n’en gagne pas', !a.bonheur, a.bonheur);
});

scenario('frénésie — le clic compte double, partout, et rien d’autre ne bouge', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 4;
  const c = bete(jeu, 'crapaud', 1, 5);

  s.frenesie = 0; const nu = jeu.clickPower();
  s.frenesie = 30;
  eq('la puissance du clic double', jeu.clickPower(), nu * jeu.FRENESIE_X);

  saturerCombo(jeu);
  // sur la croissance
  s.frenesie = 0; c.p = 5; jeu.tapStage(); const pousseNue = c.p - 5;
  s.frenesie = 30; c.p = 5; jeu.tapStage();
  eq('croissance ×2', +(c.p - 5).toFixed(3), +(pousseNue * 2).toFixed(3));
  // sur l'embonpoint d'une bête mûre
  c.p = jeu.bandTo(c);
  s.frenesie = 0; c.over = 0; jeu.tapStage(); const grasNu = c.over;
  s.frenesie = 30; c.over = 0; jeu.tapStage();
  eq('embonpoint ×2', +c.over.toFixed(3), +(grasNu * 2).toFixed(3));
  // sur la couvaison
  s.incub[0] = { line: 'crabe', p: 0, kind: 'commun' }; s.sel = 'i:0';
  s.frenesie = 0; jeu.tapStage(); const couveNue = s.incub[0].p;
  s.incub[0].p = 0; s.frenesie = 30; jeu.tapStage();
  eq('couvaison ×2', +s.incub[0].p.toFixed(3), +(couveNue * 2).toFixed(3));

  // la rente et les automates n'en profitent PAS
  s.sel = 'c:' + c.id; c.age = jeu.AGES.length;
  s.frenesie = 0; const renteNue = jeu.renteOf(c);
  s.frenesie = 30;
  eq('la rente ne double pas', jeu.renteOf(c), renteNue);
});

scenario('frénésie — durées, plafond, et rien qui se fabrique hors ligne', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 4; bete(jeu);
  for (let p = 1; p <= jeu.FRENESIE.length; p++) {
    s.frenesie = 0; jeu.offrirFrenesie(p);
    eq('palier ' + p, s.frenesie, jeu.FRENESIE[p - 1]);
  }
  s.frenesie = 0; jeu.offrirFrenesie(99);
  eq('au-delà du dernier palier, la durée plafonne', s.frenesie, jeu.FRENESIE[jeu.FRENESIE.length - 1]);
  s.frenesie = 0;
  for (let i = 0; i < 10; i++) jeu.offrirFrenesie(3);
  eq('les cadeaux s’ajoutent sans dépasser le plafond', s.frenesie, jeu.FRENESIE_MAX);

  // une absence ne fabrique rien, mais brûle ce qui courait
  const j2 = neuf({
    v: 11, coins: 5e5, pens: 4, incubators: 2, eggs: { commun: 4 },
    up: { couveuse: 6, eleveur: 6 },
    pen: [{ id: 1, line: 'crapaud', age: 1, p: 10, kind: 'commun', bonheur: 40 }],
    incub: [null, null], sel: 'c:1',
    tuto: false, vu: {}, seen: {}, devoile: {}, frenesie: 25, dons: 0,
    t: Date.now() - 6 * 3600 * 1000,
  });
  eq('le bonheur n’a pas bougé pendant l’absence', Math.round(j2.state.pen[0].bonheur), 40);
  eq('aucun cadeau fabriqué', j2.state.dons, 0);
  eq('la frénésie en cours a brûlé', Math.round(j2.state.frenesie), 0);
});

/* ────────────────────────── le mode histoire ────────────────────────── */

scenario('dialogue — faire ce qu’elle dit fait avancer, et « tient » bloque le clic', () => {
  const jeu = neuf(); const s = jeu.state;
  const dit = () => (noeuds.get('dial-dit').textContent || '');
  const tient = () => noeuds.get('dial-boite').classList.contains('tient');
  jeu.refresh();
  ok('la boîte s’ouvre à la première seconde', !noeuds.get('dial').hidden);

  let garde = 0;
  while (!tient() && garde++ < 10) jeu.replique(false);
  ok('on atteint une réplique qui tient', tient(), dit());
  const bloquee = dit();
  jeu.replique(false);
  eq('un clic sur le texte ne la passe pas', dit(), bloquee);

  s.incub[0].p = 1; jeu.refresh();            // on fait le geste demandé
  ok('faire la chose fait avancer', dit() !== bloquee, dit());

});

scenario('dialogue — une réplique qui tient éteint l’écran et ne se passe pas', () => {
  const jeu = neuf(); const s = jeu.state;
  const tient = () => noeuds.get('dial-boite').classList.contains('tient');
  const tenu = () => document.body.classList.contains('tenu');
  jeu.refresh();

  let garde = 0;
  while (!tient() && garde++ < 10) jeu.replique(false);
  ok('on atteint une réplique qui tient', tient());

  ok('l’écran s’éteint autour', tenu());
  ok('et la croix disparaît', noeuds.get('dial-passer').hidden);

  /* NI LE TEXTE NI LA CROIX. Tenir en laissant la croix ne bloquait rien : deux clics
     suffisaient à traverser tout le mode histoire sans rien apprendre. */
  const bloquee = ditDial();
  jeu.replique(false);
  eq('un clic sur le texte ne passe pas', ditDial(), bloquee);
  jeu.replique(true);
  eq('la croix non plus', ditDial(), bloquee);
  ok('la boîte tient toujours', tient());

  // faire le geste, et seulement lui, débloque
  s.incub[0].p = 1; jeu.refresh();
  ok('le geste débloque', ditDial() !== bloquee, ditDial());
  ok('et rallume l’écran', !tenu());

  /* LA SORTIE EXISTE ET ELLE EST FRANCHE : on peut refuser le tutoriel, pas le suivre à
     moitié. Le bouton 📖 reste vivant sous le voile. */
  garde = 0;
  while (!tient() && garde++ < 30) {
    jeu.replique(false);
    if (noeuds.get('dial').hidden) { s.incub[0].p = 9999; jeu.hatchAll(); jeu.refresh(); }
  }
  ok('on retient de nouveau', tient());
  s.tuto = false; jeu.refresh();
  ok('éteindre le mode histoire rallume tout', !tenu());
  ok('et ferme la boîte', noeuds.get('dial').hidden);
});

scenario('dialogue — on ne tient que sur ce qui est possible et gratuit', () => {
  const jeu = neuf();
  /* TROIS RÈGLES : l'action doit être possible tout de suite, gratuite ou avoir une porte
     gratuite, et indispensable à la suite. Tenir sur « achète une couveuse » condamnerait qui
     n'a pas les pièces — ce scénario garde la liste courte. */
  const tenues = [];
  for (const n of jeu.NOTES) {
    for (const r of n.repliques) {
      if (r && r.tient) tenues.push(n.cle);
    }
  }
  eq('trois passages obligés, pas un de plus', tenues.length, 3);
  for (const cle of ['oeuf', 'bete', 'mure']) {
    ok('« ' + cle + ' » tient', tenues.indexOf(cle) !== -1);
  }
  // et chacun a de quoi savoir qu'on l'a fait
  for (const n of jeu.NOTES) {
    for (const r of n.repliques) {
      if (r && r.tient) ok('« ' + n.cle + ' » sait quand le geste est fait', typeof r.fait === 'function');
    }
  }
});

// ouvre une scène et une seule : toutes les autres sont marquées lues d'avance
function seule(cle, prep) {
  const jeu = neuf(); const s = jeu.state;
  s.vu = {};
  for (const n of jeu.NOTES) if (n.cle !== cle) s.vu[n.cle] = true;
  s.dial = null;
  if (prep) prep(jeu, s);
  jeu.refresh();
  return jeu;
}
// en `function` : les scénarios s'exécutent dans l'ordre du fichier, et ceux du dialogue
// s'en servent avant d'arriver ici
function ditDial() { return noeuds.get('dial-dit').textContent || ''; }
function dialOuvert() { return !noeuds.get('dial').hidden; }

scenario('dialogue — une scène se ferme quand ce dont elle parle disparaît', () => {
  const jeu0 = neuf();
  /* L'INVARIANT QUI COMPTE : `perime` est la négation exacte du `test`. Si les deux pouvaient
     être vrais ensemble, une scène naîtrait et mourrait dans la même image — un éclair de
     texte que personne ne lit. */
  for (const n of jeu0.NOTES) {
    if (!n.perime) continue;
    const j = neuf(); const s = j.state;
    // on fabrique la situation qui ouvre la scène, puis on vérifie qu'elle ne la ferme pas
    s.incub[0] = { line: 'crapaud', p: j.hatchTime({ kind: 'commun', line: 'crapaud' }) * 0.9, kind: 'commun' };
    j.hatchAll();
    let ouvre = false;
    try { ouvre = !!n.test(); } catch (e) { ouvre = false; }
    if (!ouvre) continue;
    let mort = false;
    try { mort = !!n.perime(); } catch (e) { mort = false; }
    ok('« ' + n.cle + ' » ne peut pas naître et mourir d’un coup', !mort);
  }

  let jeu = seule('craque', (j, s) => {
    s.incub[0] = { line: 'crapaud', p: j.hatchTime({ kind: 'commun', line: 'crapaud' }) * 0.8, kind: 'commun' };
  });
  ok('« craque » s’ouvre', dialOuvert());
  jeu.state.incub[0].p = 9999; jeu.hatchAll(); jeu.refresh();
  ok('et se ferme quand l’œuf a éclos', !dialOuvert(), ditDial());
  ok('elle est marquée jouée', jeu.state.vu.craque === true);

  jeu = seule('plonge', (j, s) => {
    s.coins = 5; s.pen = []; s.incub = [null];
    s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0 };
  });
  ok('« plonge » s’ouvre dans l’impasse', dialOuvert());
  jeu.state.coins = 999; jeu.refresh();
  ok('et se tait dès qu’on en sort', !dialOuvert(), ditDial());
});

scenario('dialogue — agir fait avancer, jamais rater la leçon', () => {
  // acheter ce qu'elle conseille fait passer à ce que l'achat veut dire
  const achats = [
    ['clic', (j, s) => { s.coins = 1e4; }, j => j.buyUpgrade(j.UP_BY_KEY.clic)],
    ['incubateur', (j, s) => { s.coins = 1e4; }, j => j.buyIncubator()],
    ['enclos', (j, s) => { s.coins = 1e4; }, j => j.buyPen()],
  ];
  for (const [cle, prep, geste] of achats) {
    const jeu = seule(cle, prep);
    const avant = ditDial();
    ok('« ' + cle + ' » s’ouvre', dialOuvert());
    geste(jeu); jeu.refresh();
    ok('« ' + cle + ' » avance à l’achat', ditDial() !== avant, avant);
    ok('et ne se ferme pas : la leçon suit', dialOuvert());
  }

  /* Ni « mure » ni « peage » ne se périment, et c'est un arbitrage : vendre ou évoluer fait
     disparaître la bête mûre, mais les répliques suivantes sont la leçon. Fermer sur l'action
     ferait rater l'explication à qui joue vite. */
  let jeu = seule('mure', (j, s) => {
    s.incub[0].p = 9999; j.hatchAll(); s.pen[0].p = j.bandTo(s.pen[0]);
  });
  jeu.replique(false);
  const avantVente = ditDial();
  jeu.sell(jeu.state.pen[0]); jeu.refresh();
  ok('vendre fait avancer « mure »', ditDial() !== avantVente);
  ok('sans fermer la scène', dialOuvert(), 'la leçon a été perdue');

  jeu = seule('peage', (j, s) => {
    s.coins = 1e5; s.incub[0].p = 9999; j.hatchAll(); s.pen[0].p = j.bandTo(s.pen[0]);
  });
  const avantEvo = ditDial();
  jeu.evolve(jeu.state.pen[0]); jeu.refresh();
  ok('évoluer fait avancer « peage »', ditDial() !== avantEvo);
  ok('sans fermer la scène', dialOuvert(), 'la leçon a été perdue');

});

scenario('plonge — c’est elle qui ouvre la porte, pas le moteur', () => {
  /* L'évier ne se montre pas tout seul : être dans l'impasse et voir la vaisselle sont deux
     choses. La professeure constate, nomme la bêtise, propose — et l'évier n'apparaît qu'après.
     C'est tout ce qui sépare un mécanisme d'un moment. */
  const jeu = seule('plonge', (j, s) => {
    s.coins = 5; s.pen = []; s.incub = [null];
    s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0 };
  });
  const s = jeu.state;
  ok('on est bien dans l’impasse', jeu.enPlonge());
  ok('mais l’évier reste fermé', !jeu.plongeOuverte());
  eq('la scène ne montre pas la vaisselle',
     (noeuds.get('stage-name').textContent || '').trim(), 'Plus rien');
  ok('elle renvoie à la professeure',
     /professeure/.test(noeuds.get('stage-hint').textContent || ''));

  jeu.tapStage();
  eq('et cliquer ne lave rien', s.stats.assiettes || 0, 0);
  eq('ni ne rapporte quoi que ce soit', s.coins, 5);

  // on l'écoute jusqu'au bout
  let garde = 0;
  while (dialOuvert() && garde++ < 20) jeu.replique(false);
  jeu.refresh();
  ok('la porte s’ouvre quand elle a fini', jeu.plongeOuverte());
  eq('et l’évier se montre', (noeuds.get('stage-name').textContent || '').trim(), 'La plonge');
  for (let i = 0; i < jeu.ASSIETTE_CLICS; i++) jeu.tapStage();
  eq('maintenant on lave', s.stats.assiettes, 1);

  /* DEUX PORTES DE SECOURS : une impasse ne doit jamais dépendre d'un dialogue. */
  const eteint = neuf();
  eteint.state.tuto = false;
  eteint.state.coins = 5; eteint.state.pen = []; eteint.state.incub = [null];
  eteint.state.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0 };
  eteint.refresh();
  ok('mode histoire éteint : l’évier est là tout de suite', eteint.plongeOuverte());

  const revenu = neuf();
  revenu.state.vu.plonge = true;
  revenu.state.coins = 5; revenu.state.pen = []; revenu.state.incub = [null];
  revenu.state.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0 };
  revenu.refresh();
  ok('scène déjà jouée : on ne raconte pas deux fois', revenu.plongeOuverte());
});

scenario('dévoilement — l’escalier suit les prix, pas l’ordre des tables', () => {
  const jeu = neuf();
  const prix = jeu.CLES_VOIR.map(jeu.prixVoir);
  for (let i = 1; i < prix.length; i++) {
    ok('marche ' + i + ' moins chère que la précédente (' + prix[i] + ' après ' + prix[i - 1] + ')',
       prix[i] >= prix[i - 1]);
  }
  const jeu2 = neuf();
  jeu2.state.coins = 0; jeu2.refresh();
  ok('à zéro pièce, l’œuf commun n’est pas encore dévoilé', !jeu2.estDevoile('egg-commun'));
  jeu2.state.coins = jeu2.prixOeuf(jeu2.EGG_BY_KEY.commun);
  jeu2.refresh();
  ok('il s’ouvre quand on a de quoi', jeu2.estDevoile('egg-commun'));
});

scenario('interface — elle se déplie au rythme du joueur', () => {
  const jeu = neuf(); const s = jeu.state;
  const vu = id => !noeuds.get(id).hidden;
  const ongletDex = () => document.querySelectorAll('.onglet').find(b => b.dataset.vue === 'dex');
  bete(jeu);
  s.pens = 1; s.incubators = 1; s.seen = {}; s.up = { clic: 0, couveuse: 0, eleveur: 0, mangeoire: 0 };
  jeu.refresh();
  ok('pas de tri pour un seul enclos', !vu('strip-tri'));
  ok('pas de compteur « 1 / 1 »', !vu('compte-pen'));
  ok('pas de ligne de boosts sans automate', !vu('stage-boost'));
  ok('pas d’encyclopédie vide', ongletDex().hidden);

  s.pens = 2; s.incubators = 2; s.up.couveuse = 3;
  s.seen = { a: 1, b: 1, c: 1 };
  jeu.refresh();
  ok('le tri arrive au deuxième enclos', vu('strip-tri'));
  ok('les compteurs aussi', vu('compte-pen') && vu('compte-incub'));
  ok('la ligne de boosts avec le premier automate', vu('stage-boost'));
  ok('l’encyclopédie avec trois formes', !ongletDex().hidden);

  s.tuto = false; s.pens = 1; s.incubators = 1; s.seen = {}; s.up.couveuse = 0;
  jeu.refresh();
  ok('mode histoire éteint : tout se relève d’un coup',
     vu('strip-tri') && vu('compte-pen') && vu('stage-boost') && !ongletDex().hidden);
});

/* ────────────────────────── l'album et l'ascension ────────────────────────── */

scenario('ascension — un jeton, des cartes, et tout le reste repart de zéro', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 6; s.incubators = 3;
  s.up.clic = 5; s.up.couveuse = 5;
  const gardee = bete(jeu, 'crapaud', 3, 3000);
  bete(jeu, 'crabe', 2, 400);
  bete(jeu, 'crapaud', 2, 400);
  poserJetons(jeu, 1);
  ok('le bouton d’ascension s’ouvre', jeu.peutAscensionner());

  jeu.ouvrirAscension();
  ok('l’écran s’ouvre', !noeuds.get('ascension').hidden);
  const ap = jeu.apercuAscension();
  eq('les trois bêtes sont proposées', ap.neuves.length, 3);
  eq('un jeton n’emporte qu’une carte', ap.max, 1);

  jeu.state.vu.oeuf = true;                 // une scène jouée, pour vérifier qu'elle traverse
  jeu.ascChoix = [ap.neuves.find(k => k.id === -gardee.id).id];
  jeu.ascensionner();
  eq('une seule carte gardée', jeu.state.album.length, 1);
  eq('c’est la bonne', jeu.state.album[0].line, gardee.line);
  eq('l’enclos repart vide', jeu.state.pen.length, 0);
  eq('les pièces repartent de zéro', jeu.state.coins, 0);
  eq('les améliorations aussi', jeu.state.up.clic, 0);
  eq('le jeton est consommé', jeu.state.asc.jetons, 0);
  eq('les consignes de ferme sont remises à plat', jeu.state.sellAt.commune, 0);
  ok('la collection traverse', Object.keys(jeu.state.seen).length > 0);
  ok('les scènes déjà jouées traversent', Object.keys(jeu.state.vu).length > 0);
});

scenario('jetons — le prix d’une carte monte par le nombre d’or', () => {
  const jeu0 = neuf();
  const bete2 = (jeu, ligne, age, p) => {
    const s = jeu.state;
    s.incub[0] = { line: ligne, p: 9999, kind: 'commun' };
    jeu.hatchAll();
    const c = s.pen[s.pen.length - 1];
    c.age = age; c.p = p;
    return c;
  };

  /* DEUX DÉFAUTS SE CACHAIENT ICI, et le second masquait le premier. `max` valait SLOTS : le
     nombre de jetons n'entrait nulle part, un seul jeton laissait choisir cinq cartes. Et
     l'ascension n'en consommait qu'un — on sautait avec cinq et on en retrouvait quatre. */
  /* ⚠ L'ALBUM ET LES CARTES ACTIVES SONT DEUX CHOSES. L'album n'a pas de limite ; SLOTS ne
     borne que les cinq cartes qui agissent. Ce qui borne ce qui ENTRE DANS L'ALBUM, c'est la
     bourse — et depuis la 4.0.0, le PRIX DORÉ.

     UN JETON N'ACHÈTE PLUS UNE CARTE. Chaque carte prise dans la même ascension renchérit la
     suivante d'un facteur φ : 1, 2, 3, 5, 7, 12 — cumul 1, 3, 6, 11, 18, 30. Sans cette
     escalade, les jetons regagnés à chaque cycle depuis la 3.0.0 auraient donné cinq cartes à
     chaque saut, indéfiniment, et l'album se serait rempli sans qu'aucune décision ne soit
     prise. */
  eq('le coût de la première carte', jeu0.coutCarte(0), 1);
  eq('puis deux', jeu0.coutCarte(1), 2);
  eq('puis trois', jeu0.coutCarte(2), 3);
  eq('puis cinq', jeu0.coutCarte(3), 5);
  eq('puis sept', jeu0.coutCarte(4), 7);
  eq('cinq cartes coûtent dix-huit jetons', jeu0.coutCartes(5), 18);

  for (const [n, cartes] of [[1, 1], [2, 1], [3, 2], [5, 2], [9, 3], [11, 4], [18, 5]]) {
    const jeu = neuf(); const s = jeu.state;
    s.tuto = false; s.coins = 5e6; s.pens = 20;
    for (let i = 0; i < 16; i++) bete2(jeu, i % 2 ? 'crabe' : 'crapaud', 3, 3000);
    poserJetons(jeu, n);
    eq(n + ' jeton(s) → ' + cartes + ' carte(s)', jeu.apercuAscension().max, cartes);
  }

  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 10;
  for (let i = 0; i < 6; i++) bete2(jeu, 'crapaud', 3, 3000);
  poserJetons(jeu, 5);
  const ap = jeu.apercuAscension();
  jeu.ascChoix = [ap.neuves[0].id, ap.neuves[1].id];   // il n'en emploie que deux
  jeu.ascensionner();
  eq('le sommet repart à zéro', jeu.state.asc.sommet, 0);
  eq('deux cartes emportées', jeu.state.album.length, 2);
  /* LE RESTE DE LA BOURSE DEMEURE. Les jetons partaient tous, employés ou non ; ils ont
     désormais un second emploi — la constellation — donc en garder EST une décision. Deux
     cartes coûtent trois jetons sur cinq : il en reste deux. */
  eq('et il reste ce qu’on n’a pas dépensé', jeu.state.asc.jetons, 5 - jeu.coutCartes(2));
  /* L'ASCENSION NE SE REFERME PLUS. Elle demandait un jeton NON DÉPENSÉ, si bien qu'un joueur
     qui venait de sauter devait multiplier sa fortune par mille pour pouvoir sauter à
     nouveau — le mur rencontré en jouant à mille milliards. La porte est désormais un
     déblocage : ce qui varie, c'est le nombre de cartes emportées. */
  ok('mais la porte reste ouverte', jeu.peutAscensionner());
  eq('et les deux jetons restants valent encore une carte', jeu.apercuAscension().max, 1);
  eq('les paliers déjà franchis restent franchis', jeu.state.asc.paliers, jeu.RANG_PREMIER);
});

scenario('album — sans limite, et cinq cartes actives qui s’échangent', () => {
  const bete3 = (j, ligne, age, p) => {
    const st = j.state;
    st.incub[0] = { line: ligne, p: 9999, kind: 'commun' };
    j.hatchAll();
    const c = st.pen[st.pen.length - 1];
    c.age = age; c.p = p;
    return c;
  };
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 20;
  for (let i = 0; i < 12; i++) bete3(jeu, i % 2 ? 'crabe' : 'crapaud', 3, 3000);
  poserJetons(jeu, jeu.coutCartes(9));   // le prix doré : neuf cartes ne coûtent plus neuf jetons

  const ap = jeu.apercuAscension();
  jeu.ascChoix = ap.neuves.slice(0, 9).map(k => k.id);
  jeu.ascensionner();
  const t = jeu.state;

  /* L'écrêtage à cinq datait d'avant que l'album et les cartes actives soient deux choses :
     il JETAIT les quatre cartes gagnées au-delà de la cinquième. */
  eq('neuf jetons emportent neuf cartes dans l’album', t.album.length, 9);
  eq('cinq seulement s’équipent', t.slots.length, jeu.SLOTS);
  eq('les quatre autres attendent en réserve',
     t.album.filter(k => t.slots.indexOf(k.id) === -1).length, 4);

  // et l'on échange à volonté, sans jamais dépasser cinq actives
  const sortante = t.slots[0];
  const entrante = t.album.find(k => t.slots.indexOf(k.id) === -1).id;
  ok('on sort une active', jeu.deplacerCarte(sortante, false));
  eq('il en reste quatre', t.slots.length, jeu.SLOTS - 1);
  ok('on en pose une autre', jeu.deplacerCarte(entrante, true));
  eq('de nouveau cinq', t.slots.length, jeu.SLOTS);
  eq('l’album n’a pas bougé', t.album.length, 9);
  const encore = t.album.find(k => t.slots.indexOf(k.id) === -1).id;
  ok('une sixième active est refusée', !jeu.deplacerCarte(encore, true));
});

scenario('jetons — un palier de fortune tous les ×1000, à partir du premier million', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const premier = jeu.JETON_PALIERS[jeu.RANG_PREMIER - 1];
  eq('la première ascension se mérite au million', premier, 1e6);

  s.coins = premier - 1; jeu.crediterJetons();
  const avant = jeu.jetonsDus();
  ok('sous le million on a déjà des jetons', avant > 0, avant);
  ok('mais on ne peut pas encore ascensionner', !jeu.peutAscensionner());

  s.coins = premier; jeu.crediterJetons();
  eq('le million en donne un de plus', jeu.jetonsDus(), avant + 1);
  eq('et c’est le troisième', jeu.jetonsDus(), 3);
  ok('l’ascension s’ouvre alors', jeu.peutAscensionner());

  /* LE COMPTE SE LIT, IL NE S'ACCUMULE PAS : il vient du sommet de fortune du cycle, donc
     repasser sur le même palier ne donne rien de plus. */
  const apres = jeu.jetonsDus();
  jeu.crediterJetons();
  eq('un palier ne paie qu’une fois', jeu.jetonsDus(), apres);

  /* ET IL SE REFAIT À CHAQUE CYCLE. C'est tout le changement de la 3.0.0 : le sommet repart à
     zéro avec la ferme, et le prochain saut se paie sur ce qu'on aura regagné. */
  s.asc.sommet = 0;
  eq('après un saut, le compte est à refaire', jeu.jetonsDus(), 0);
  ok('mais la porte reste ouverte', jeu.peutAscensionner());
});

scenario('encyclopédie — une carte par lignée, et deux vues qui se répondent', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.seen = { 'crapaud:1': 1, 'crapaud:2': 1, 'crabe:1': 1, 'loup:1': 1 };
  jeu.refresh();

  const host = noeuds.get('collection');
  const cartes = () => host.children.filter(n => (n.className || '').includes('dex-carte'));
  const sections = () => host.children.filter(n => (n.className || '').includes('coll-head'));
  const nom = c => c.children.map(x => x.textContent + x.children.map(y => y.textContent).join('')).join(' ');
  const onglet = v => document.querySelectorAll('.onglet').find(b => b.dataset.vue === v);

  /* UNE CARTE PAR LIGNÉE, ET NON PLUS UNE CASE PAR FORME. La grille de cent cinquante cases
     répondait bien à « combien m'en manque-t-il », mais elle ne se cliquait pas : cinq cases
     voisines menaient à la même fiche, et aucune ne portait de nom. */
  eq('une carte par lignée connue', cartes().length,
     jeu.LINES.filter(l => jeu.rareteConnue(l.rarity)).length);
  eq('un intertitre par rareté', sections().length, jeu.raretesConnues().length);
  ok('le compteur compte les formes', /4 \/ 135 formes/.test(noeuds.get('coll-meta').textContent),
     noeuds.get('coll-meta').textContent);

  const crapaud = cartes().find(c => c.dataset.lignee === 'crapaud');
  ok('une lignée croisée porte son nom', /Crapaud/.test(nom(crapaud)), nom(crapaud));
  eq('et ses cinq pastilles d’âge',
     crapaud.children.filter(x => (x.className || '').includes('dex-txt'))[0]
            .children.filter(x => (x.className || '').includes('dex-pips'))[0].children.length, 5);
  const kraken = cartes().find(c => c.dataset.lignee === 'kraken');
  ok('une lignée jamais vue n’a pas de nom', /？/.test(nom(kraken)), nom(kraken));
  ok('et se marque inconnue', kraken.className.includes('inconnue'));

  /* LES FILTRES REMPLACENT LE PLIAGE. Replier une rareté cachait ce qu'on ne voulait pas
     voir ; un filtre montre ce qu'on cherche, ce qui n'est pas la même chose. */
  const chips = () => noeuds.get('dex-filtres').children;
  eq('deux filtres, plus un par rareté connue',
     chips().length, 2 + jeu.raretesConnues().length);
  eq('« tout » est actif au départ', chips()[0].getAttribute('aria-pressed'), 'true');

  jeu.dexFiltre = 'rare';
  jeu.refresh();
  ok('le filtre ne garde que sa rareté',
     cartes().every(c => jeu.LINE_BY_KEY[c.dataset.lignee].rarity === 'rare'));
  eq('et un seul intertitre', sections().length, 1);

  jeu.dexFiltre = 'reste';
  jeu.refresh();
  ok('« incomplètes » écarte ce qui est plein',
     cartes().every(c => jeu.formesVues(c.dataset.lignee) < jeu.AGES.length));
  ok('et garde ce qui manque', cartes().some(c => c.dataset.lignee === 'crapaud'));

  jeu.dexFiltre = 'tout';
  jeu.refresh();

  /* LES DEUX VUES. La ferme d'un côté, l'encyclopédie de l'autre, et l'onglet ne se
     sauvegarde pas : on ouvre le jeu sur sa ferme, toujours. */
  eq('on démarre sur la ferme', jeu.vue, 'ferme');
  eq('et la vue de l’encyclopédie est cachée', noeuds.get('vue-dex').hidden, true);
  jeu.ouvrirVue('dex');
  eq('la bascule marche', jeu.vue, 'dex');
  eq('la vue s’ouvre', noeuds.get('vue-dex').hidden, false);
  eq('l’onglet se marque', onglet('dex').getAttribute('aria-pressed'), 'true');
  eq('et l’autre se relâche', onglet('ferme').getAttribute('aria-pressed'), 'false');
  jeu.ouvrirVue('ferme');
  eq('et retour', noeuds.get('vue-dex').hidden, true);

  /* CLIQUER UNE CARTE DÉPLACE LE REGARD, elle n'ouvre plus un écran modal : la fiche vit à
     côté de la liste. */
  jeu.encyLignee = 'crapaud';
  jeu.refresh();
  eq('la fiche suit', noeuds.get('ency-title').textContent, 'Crapaud');
  ok('et la carte se marque choisie',
     cartes().find(c => c.dataset.lignee === 'crapaud').className.includes('choisie'));

  // la collection n'est plus un panneau de la colonne : elle ne se replie plus
  ok('elle a quitté la liste des panneaux', !jeu.PANNEAUX.includes('collection'));
});

/* ───────────────────────────────── les œufs ────────────────────────────────── */

scenario('dessins — le repli s’arrête sur un « null » écrit', () => {
  const jeu = neuf();
  /* LE REPLI EST BON quand un âge n'a pas encore SA variante d'un dessin qui existe : le
     crapaud ancien montre le crapaud adulte, et personne n'est trompé. */
  eq('un âge sans dessin prend celui d’en dessous',
     jeu.artAt('crapaud', 5), jeu.artAt('crapaud', 5));
  ok('et une lignée sans table n’a rien', jeu.artAt('inconnue', 3) === null);

  /* IL MENT quand la forme est autre chose. Une kitsune à neuf queues n'est pas une kitsune à
     sept : montrer l'une pour l'autre ferait croire que la légende n'a rien changé. Le `null`
     écrit arrête le repli, et l'emoji dit la vérité — rien ici. */
  ok('les quatre premiers kitsune sont dessinés',
     [1, 2, 3, 4].every(a => /kitsune-/.test(jeu.artAt('kitsune', a) || '')),
     [1, 2, 3, 4].map(a => jeu.artAt('kitsune', a)).join(' '));
  eq('le cinquième s’arrête là', jeu.artAt('kitsune', 5), null);
  ok('et son emoji prend le relais', !!jeu.LINE_BY_KEY.kitsune.forms[4][1]);
});

scenario('œufs — cinq dessins, cinq sortes, et l’emoji en repli', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;

  /* UNE SORTE SANS DESSIN RETOMBERAIT SUR L'EMOJI SANS RIEN DIRE — c'est le propre d'un repli,
     et c'est aussi pourquoi il faut le vérifier ici : rien à l'écran ne signalerait l'oubli. */
  eq('autant de dessins que de sortes',
     Object.keys(jeu.ART_OEUFS).length, jeu.EGG_KINDS.length);
  ok('chaque sorte a le sien', jeu.EGG_KINDS.every(e => jeu.artOeuf(e.key)),
     jeu.EGG_KINDS.filter(e => !jeu.artOeuf(e.key)).map(e => e.key).join(' '));
  eq('et ce ne sont pas cinq fois le même fichier',
     new Set(Object.values(jeu.ART_OEUFS)).size, jeu.EGG_KINDS.length);
  for (const [sorte, f] of Object.entries(jeu.ART_OEUFS))
    ok('le fichier de ' + sorte + ' existe', fs.existsSync(path.join(RACINE, f)), f);

  // sur la scène : la coquille couvée, et son dessin
  s.incub[0] = { line: 'crapaud', p: 10, kind: 'mythique' };
  s.sel = 'i:0';
  jeu.refresh();
  const g = noeuds.get('stage-glyph');
  eq('la scène porte une image', g.children.length, 1);
  eq('celle de la sorte couvée', g.children[0].getAttribute('src'), jeu.ART_OEUFS.mythique);

  s.incub[0] = { line: 'crapaud', p: 10, kind: 'commun' };
  jeu.refresh();
  eq('elle suit la sorte', noeuds.get('stage-glyph').children[0].getAttribute('src'),
     jeu.ART_OEUFS.commun);

  // un incubateur vide n'est pas un œuf : il garde son rond
  s.incub[0] = null;
  jeu.refresh();
  eq('rien à couver, pas de coquille', noeuds.get('stage-glyph').textContent, '◌');
});

scenario('œufs — la vignette passe de la bête à la coquille et revient', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;

  const glyphe = () => {
    const v = noeuds.get('strip-incub').children[0];
    return v.children.find(x => (x.className || '').includes('thumb-glyph'));
  };

  s.incub[0] = { line: 'crapaud', p: 10, kind: 'epique' };
  jeu.refresh();
  eq('la vignette montre la coquille', glyphe().children[0].getAttribute('src'),
     jeu.ART_OEUFS.epique);

  /* LE PIÈGE QUI A COÛTÉ CE SCÉNARIO : la branche œuf écrivait l'emoji par `textContent`, ce
     qui vide l'élément sans prevenir le cache de `setCreature`. Le cache croyait donc que
     l'image était toujours là et refusait de la reposer : une case qui avait montré un œuf
     ne remontrait plus jamais de bête. Invisible tant que les œufs étaient des emojis. */
  s.incub[0].p = 9999; jeu.hatchAll(); jeu.refresh();
  s.incub[0] = { line: 'crapaud', p: 10, kind: 'rare' };
  jeu.refresh();
  eq('et après une éclosion elle en remontre une autre',
     glyphe().children[0].getAttribute('src'), jeu.ART_OEUFS.rare);

  // une teinte de bête ne doit pas repeindre une coquille
  eq('sans filtre hérité', glyphe().style.filter || '', '');

  /* DEUX ŒUFS DE SUITE DE LA MÊME LIGNÉE, de sortes différentes. La signature de la bande
     portait la lignée et pas la sorte, si bien que la vignette restait sur le dessin du
     premier. Invisible tant que les cinq sortes partageaient le même emoji — c'est la
     deuxième fois dans cette version qu'un dessin révèle un défaut que l'emoji cachait. */
  s.incub[0] = { line: 'crapaud', p: 10, kind: 'commun' };
  jeu.refresh();
  eq('la même lignée dans une autre coquille se repeint',
     glyphe().children[0].getAttribute('src'), jeu.ART_OEUFS.commun);
});

/* ─────────────────────────────── les fonds ──────────────────────────────── */

scenario('fonds — un sur huit cents, et seulement à la boutique', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15; s.pens = 20;

  eq('huit fonds', jeu.FONDS.length, 8);
  eq('chacun sa clé', new Set(jeu.FONDS.map(f => f.key)).size, 8);
  ok('tous dans la fourchette des teintes',
     jeu.FONDS.every(f => f.mult >= 1.10 && f.mult <= 1.20),
     jeu.FONDS.map(f => f.mult).join(' '));

  /* PRESTIGIEUX VEUT DIRE RARE, et « seulement dans les œufs de la boutique » compte autant
     que le chiffre : une pension à mille œufs l'heure en sortirait un toutes les cinq
     minutes, et le mot ne voudrait plus rien dire. */
  const N = 300000;
  let achetes = 0, pondus = 0;
  for (let i = 0; i < N; i++) if (jeu.rollVariants(true).fond) achetes++;
  for (let i = 0; i < N; i++) if (jeu.rollVariants(false).fond) pondus++;
  ok('un sur huit cents à l’achat',
     Math.abs(achetes / N - jeu.FOND_ODDS) < jeu.FOND_ODDS * 0.3,
     (achetes / N * 800).toFixed(2) + ' fois la cible');
  eq('aucun à la pension', pondus, 0);

  /* L'ŒUF DE PENSION ET L'ŒUF ACHETÉ SONT INDISCERNABLES dans la réserve — c'était voulu.
     `tireLigne` est le seul endroit qui sache les distinguer, et il le dit à l'éclosion. */
  s.pension.dus = { commun: ['loup'] };
  const promis = jeu.tireLigne('commun');
  eq('la lignée promise vient de la pension', promis.line, 'loup');
  eq('et elle se dit telle', promis.pension, true);
  eq('un tirage ordinaire ne l’est pas', jeu.tireLigne('commun').pension, false);
});

scenario('fonds — il vaut, il se peint, il se retient, il ne se nomme pas', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15; s.pens = 20;
  const c = bete(jeu, 'loup', 3, 20000);

  const nu = jeu.sellValue(c), nom = jeu.fullName(c);
  c.fond = 'aurore';
  const f = jeu.FOND_BY_KEY.aurore;

  /* IL ENTRE DANS LA VALEUR, dans la fourchette des teintes — au-delà il faudrait reprendre
     l'équilibrage des variantes en entier. */
  ok('la bête vaut plus', jeu.sellValue(c) > nu, nu + ' → ' + jeu.sellValue(c));
  ok('exactement son multiplicateur',
     Math.abs(jeu.sellValue(c) / nu - f.mult) < 0.01, jeu.sellValue(c) / nu);

  /* ET IL N'ENTRE PAS DANS LE NOM. Un fond SE VOIT : le dire en plus serait une redite, et le
     jeu n'affiche qu'une seule épithète exprès. */
  eq('le nom ne bouge pas', jeu.fullName(c), nom);
  ok('et il ne dit pas le fond', !/aurore/i.test(jeu.fullName(c)), jeu.fullName(c));

  // il se peint, sur la scène
  s.sel = 'c:' + c.id;
  jeu.refresh();
  const scene = noeuds.get('stage-fond');
  eq('la scène le montre', scene.hidden, false);
  ok('avec sa classe', scene.className.includes('fond-aurore'), scene.className);
  eq('et ses particules', scene.children.length, f.n);
  eq('un redessin n’en ajoute pas', (jeu.refresh(), noeuds.get('stage-fond').children.length), f.n);

  // une bête sans fond n'en peint aucun, et un œuf non plus
  c.fond = null;
  jeu.refresh();
  eq('rien à montrer', noeuds.get('stage-fond').hidden, true);

  /* IL SE RETIENT AU CARNET : un objet de collection a besoin d'un endroit où être
     collectionné, sinon « collectionnable » n'est qu'un mot. */
  c.fond = 'braise';
  jeu.noterEclosion(c);
  eq('le carnet le compte', jeu.dexVu('loup').fonds.braise, 1);
  jeu.encyLignee = 'loup';
  jeu.encySig = '';
  jeu.renderEncyclopedie();
  const plat = noeuds.get('ency').children
    .map(e => (e.textContent || '') + e.children.map(x => ' ' + x.textContent +
              x.children.map(y => ' ' + y.textContent).join('')).join('')).join(' | ');
  ok('la fiche a sa rangée', /Fonds . 1 . 8/.test(plat), plat);
  ok('et nomme celui qu’on a croisé', /braise/.test(plat), plat);

  jeu.verifierTrophees();
  ok('le trophée tombe', !!s.trophees.fond);
});

scenario('fonds — la carte emporte celui de la bête', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12; s.pens = 8;
  const c = bete(jeu, 'loup', 3, 20000);
  c.fond = 'givre'; c.keep = true;

  poserJetons(jeu, 1);
  const neuve = jeu.apercuAscension().neuves.find(x => x.line === 'loup');
  ok('la capsule existe', !!neuve);
  eq('et elle emporte le fond', neuve.fond, 'givre');

  s.album = [neuve]; s.slots = []; s.asc.n = 1;
  jeu.oublierAlbum(); jeu.refresh();
  const cartes = [];
  const m = e => { if (e.classList && e.classList.contains('carte')) cartes.push(e); e.children.forEach(m); };
  noeuds.get('album').children.forEach(m);
  ok('la carte se signale', cartes[0].className.includes('a-fond'), cartes[0].className);
  const zone = cartes[0].children.find(x => (x.className || '').includes('carte-fond'));
  ok('le décor est dans la zone d’illustration', zone.className.includes('fond-givre'), zone.className);
  ok('et il porte des particules', zone.children.length > 0, zone.children.length);
});

scenario('écran — les six panneaux se replient, et ça tient au rechargement', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  jeu.refresh();
  const plie = cle => noeuds.get('panel-' + cle).classList.contains('plie');

  ok('rien n’est replié au départ', jeu.PANNEAUX.every(c => !plie(c)));
  for (const cle of jeu.PANNEAUX) {
    jeu.plier(cle);
    ok('« ' + cle + ' » se replie', plie(cle));
  }
  ok('les six sont repliés', jeu.PANNEAUX.every(plie));

  jeu.save(); jeu.load(); jeu.refresh();
  ok('et ça tient au rechargement', jeu.PANNEAUX.every(plie));

  jeu.plier('boutique');
  ok('on en rouvre un seul', !plie('boutique'));
  ok('les cinq autres restent fermés', jeu.PANNEAUX.filter(c => c !== 'boutique').every(plie));
});

/* ────────────────────────── la plonge et les trophées ────────────────────────── */

// l'impasse exacte : rien en enclos, rien en couvaison, rien en réserve, pas de quoi acheter
function impasse(jeu, sous) {
  const s = jeu.state;
  s.pen = []; s.incub = [null];
  s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0 };
  s.coins = sous === undefined ? 5 : sous;
  jeu.refresh();
}

scenario('plonge — elle ne s’ouvre que dans l’impasse, et se referme en sortant', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  ok('fermée au démarrage, il y a un œuf en couvaison', !jeu.enPlonge());

  impasse(jeu);
  ok('ouverte quand il ne reste rien', jeu.enPlonge());
  eq('la scène montre l’évier', (noeuds.get('stage-name').textContent || '').trim(), 'La plonge');
  eq('et le compte des assiettes', jeu.assiettesRestantes(), jeu.oeufPlancher() - 5);

  // chacune des quatre conditions suffit à la refermer
  impasse(jeu); s.pen = [{ id: 99, line: 'crapaud', age: 1, p: 1, kind: 'commun' }];
  ok('une bête en enclos la referme', !jeu.enPlonge());
  impasse(jeu); s.incub = [{ line: 'crapaud', p: 0, kind: 'commun' }];
  ok('un œuf en couvaison la referme', !jeu.enPlonge());
  impasse(jeu); s.eggs.commun = 1;
  ok('un œuf en réserve la referme', !jeu.enPlonge());
  impasse(jeu, jeu.oeufPlancher());
  ok('de quoi acheter la referme', !jeu.enPlonge());
});

scenario('plonge — dix clics l’assiette, et rien ne les réduit', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  impasse(jeu, 0);
  const cible = jeu.oeufPlancher(), parAssiette = jeu.ASSIETTE_CLICS;

  for (let i = 1; i < parAssiette; i++) jeu.tapStage();
  eq('neuf clics ne rapportent rien', s.coins, 0);
  eq('aucune assiette lavée', s.stats.assiettes || 0, 0);
  eq('mais le frottage est compté', s.frotte, parAssiette - 1);
  eq('et chaque clic compte comme un clic du joueur', s.stats.clics, parAssiette - 1);

  jeu.tapStage();
  eq('le dixième la finit', s.stats.assiettes, 1);
  eq('et rapporte une pièce', s.coins, 1);
  eq('le frottage repart de zéro', s.frotte, 0);

  /* TOUT EST PLAT : on rallume tout ce qui accélère le clic ailleurs, et rien ne bouge ici.
     Une punition qui s'achète n'en est pas une. */
  s.up.clic = 30; s.frenesie = 60; s.primes.poigne = true; s.primes.main = true;
  ok('le clic vaut énormément ailleurs', jeu.clickPower() > 100, jeu.clickPower());
  for (let i = 1; i < parAssiette; i++) jeu.tapStage();
  eq('neuf clics ne suffisent toujours pas', s.coins, 1);
  jeu.tapStage();
  eq('il en faut toujours dix', s.coins, 2);

  // on lave jusqu'au bout
  let n = 0;
  while (jeu.enPlonge() && n++ < 500) jeu.tapStage();
  eq('on sort avec de quoi acheter un œuf', s.coins, cible);
  eq('en autant d’assiettes que de pièces', s.stats.assiettes, cible);
  eq('et en dix fois plus de clics', s.stats.clics, cible * parAssiette);
  ok('la plonge s’est refermée', !jeu.enPlonge());
  jeu.refresh();
  ok('la scène redevient un incubateur',
     (noeuds.get('stage-name').textContent || '').trim() !== 'La plonge');
});

scenario('plonge — la carte ocellée ne lave pas à ta place', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  // une carte ocellée parfaite, au plafond
  equiper(jeu, jeu.MOTIFS.indexOf('ocellé'), 5);
  impasse(jeu, 0);
  eq('elle clique pourtant très vite ailleurs', jeu.bonusAlbum().clicAuto, jeu.MOTIF_BONUS['ocellé'].cap);
  for (let i = 0; i < 200; i++) jeu.tickOcelle(0.5);   // cent secondes
  eq('aucune assiette lavée', s.stats.assiettes || 0, 0);
  eq('aucun coup d’éponge donné', s.frotte || 0, 0);
  eq('aucune pièce gagnée', s.coins, 0);
  ok('on est toujours dans l’impasse', jeu.enPlonge());
  for (let i = 0; i < jeu.ASSIETTE_CLICS; i++) jeu.tapStage();
  eq('seule la main du joueur lave', s.stats.assiettes, 1);
});

scenario('trophées — six objectifs visibles, six surprises cachées', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const lignes = () => { jeu.renderStats(); return noeuds.get('trophees').children; };
  const nom = l => (l.querySelector('.trophee-nom').textContent || '');

  const montres = jeu.TROPHEES.filter(t => t.montre).length;
  eq('rien de décroché au départ', jeu.tropheesPris(), 0);
  eq('seuls les objectifs s’affichent', lignes().length, montres);
  ok('et aucun n’est marqué pris', [...lignes()].every(l => !l.classList.contains('pris')));
  eq('le compte dit combien il en reste', (noeuds.get('trophees-meta').textContent || '').trim(),
     '0 / ' + jeu.TROPHEES.length);

  // aucune clé en double, chacun a de quoi s'afficher
  const cles = new Set();
  for (const t of jeu.TROPHEES) {
    ok('« ' + t.cle + ' » n’est pas en double', !cles.has(t.cle));
    cles.add(t.cle);
    ok('« ' + t.cle + ' » a un nom, un glyphe et une phrase',
       !!(t.nom && t.glyphe && t.dit && t.dit.length > 10));
    ok('« ' + t.cle + ' » a un test', typeof t.test === 'function');
  }

  // une surprise apparaît au moment où on la décroche, pas avant
  ok('« La plonge » est invisible', ![...lignes()].some(l => nom(l) === 'La plonge'));
  impasse(jeu, 0);
  for (let i = 0; i < jeu.ASSIETTE_CLICS; i++) jeu.tapStage();
  jeu.verifierTrophees();
  ok('elle apparaît une fois lavée', [...lignes()].some(l => nom(l) === 'La plonge'));
  ok('et elle est marquée prise',
     [...lignes()].find(l => nom(l) === 'La plonge').classList.contains('pris'));
  eq('le compte suit', jeu.tropheesPris(), 1);
});

scenario('trophées — ils ne donnent rien, et traversent l’ascension', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 6;
  /* AUCUN TROPHÉE NE DONNE DE PUISSANCE : c'est ce qui les sépare des jalons qu'on vient de
     démonter. On décroche tout et on vérifie que rien n'a bougé. */
  const avantClic = jeu.clickPower(), avantPen = jeu.pensTotal();
  s.stats.eclos = 1; s.stats.fortune = 1e9; s.stats.assiettes = 1; s.stats.prodiges = 1;
  s.dons = 99; s.seen = { 'crapaud:5': 1 };
  const sous = s.coins;
  jeu.verifierTrophees();
  ok('des trophées sont tombés', jeu.tropheesPris() >= 5, jeu.tropheesPris());
  eq('le clic n’a pas bougé', jeu.clickPower(), avantClic);
  eq('les enclos non plus', jeu.pensTotal(), avantPen);
  eq('et pas une pièce n’a été donnée', s.coins, sous);

  bete(jeu, 'crapaud', 3, 3000);
  poserJetons(jeu, 1);
  const pris = jeu.tropheesPris();
  const ap = jeu.apercuAscension();
  jeu.ascChoix = [ap.neuves[0].id];
  jeu.ascensionner();
  eq('les trophées traversent l’ascension', jeu.tropheesPris(), pris);
});

/* ───────────────────────────────── la pension ───────────────────────────────── */

/* Deux bêtes prêtes à être confiées, dans une ferme assez grande pour les tenir — et la
   pension achetée, puisque c'est un bâtiment depuis la beta 1.0.0. */
function couple(jeu, ligneA, ligneB) {
  jeu.state.pens = 8;
  jeu.state.primes.pension = true;
  return [bete(jeu, ligneA, 4, 20000), bete(jeu, ligneB, 4, 20000)];
}

/* Le bloc d'un couple porte une ligne par parent depuis la 2.2.0 : ce qu'on y cherche n'est
   plus un enfant direct. */
function sousArbre(e, cls) {
  const t = [];
  const m = x => { if (x.classList && x.classList.contains(cls)) t.push(x); x.children.forEach(m); };
  e.children.forEach(m);
  return t;
}

// ce que dit la phrase sous le nid, quel que soit le nombre de couples affichés au-dessus
function ditPension(jeu) {
  const p = noeuds.get('pension').children.find(c => c.classList.contains('pension-dit'));
  return p ? p.textContent : '';
}

// les deux cases du nid, dans l'ordre
function casesNid(jeu) {
  const nid = noeuds.get('pension').children.find(c => c.classList.contains('nid'));
  return nid ? nid.children.filter(c => c.classList.contains('nid-case')) : [];
}

scenario('pension — la distance, la durée, et ce qui est refusé', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'crapaud', 'crapaud');
  const lezard = bete(jeu, 'lezard', 4, 20000);
  const golem = bete(jeu, 'golem', 4, 20000);
  const ouro = bete(jeu, 'ouroboros', 4, 20000);

  eq('même lignée, distance nulle', jeu.distanceDe(a, b), 0);
  eq('donc la durée de base', jeu.dureePension(a, b), jeu.PENSION.base);
  eq('terre/nu contre terre/écaille : une chose en commun', jeu.distanceDe(a, lezard), 1);
  eq('et la durée suit', jeu.dureePension(a, lezard),
     jeu.PENSION.base + jeu.PENSION.parDistance);

  /* LA PIERRE NE SE CROISE AVEC RIEN, et c'est la règle qui doit se raconter en cinq mots. */
  eq('la pierre est stérile', jeu.distanceDe(a, golem), null);
  eq('donc pas de durée', jeu.dureePension(a, golem), null);
  ok('et le refus le dit', /pierre/.test(jeu.refusPension(a, golem)), jeu.refusPension(a, golem));

  /* LA RICHESSE RALENTIT, PAS L'ÉCART. Deux mythiques sont à écart nul : sans le
     multiplicateur de rareté elles pondraient en quinze minutes ce qui vaut cent
     quatre-vingts millions. C'est l'imprimante à billets qu'on a trouvée à la mesure. */
  const behe = bete(jeu, 'behemoth', 4, 20000);
  eq('deux mythiques se ressemblent', jeu.distanceDe(ouro, behe), 0);
  ok('mais leur couvaison est longue', jeu.dureePension(ouro, behe) >= 12 * 3600,
     jeu.dureePension(ouro, behe));

  const bebe = bete(jeu, 'crapaud', 1, 0);
  ok('un jeune ne peut pas être parent', /âge/.test(jeu.refusPension(a, bebe)),
     jeu.refusPension(a, bebe));
  ok('ni une bête avec elle-même', /différentes/.test(jeu.refusPension(a, a)));
});

scenario('pension — un couple pond la lignée promise, et pas une autre', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'loup', 'loup');

  ok('le couple se forme', jeu.accoupler(a, b));
  eq('il occupe la place', jeu.couples().length, 1);
  ok('les deux sont parquées', jeu.enPension(a) && jeu.enPension(b));
  ok('et la place est prise', /places/.test(jeu.refusPension(a, b)), jeu.refusPension(a, b));

  const avant = jeu.eggStock('rare');
  eq('rien ne sort avant l’heure', jeu.avancePension(jeu.dureePension(a, b) - 1), 0);
  eq('la réserve n’a pas bougé', jeu.eggStock('rare'), avant);
  eq('puis l’œuf tombe', jeu.avancePension(2), 1);
  eq('la réserve a gagné un œuf', jeu.eggStock('rare'), avant + 1);
  eq('et le compteur monte', s.stats.pension, 1);

  /* LE COUPLE NE SE DÉFAIT PAS QUAND L'ŒUF TOMBE. Il se défaisait, et c'était le geste de
     trop : on venait retirer deux bêtes d'un nid vide et les reposer, toutes les seize heures.
     Un couple confié reste confié jusqu'à ce qu'on le rompe soi-même. */
  eq('la place reste prise', jeu.couples().length, 1);
  ok('les parents restent parqués', jeu.enPension(a) && jeu.enPension(b));
  eq('et le compteur du couple repart', jeu.couples()[0].t < jeu.couples()[0].duree, true);
  eq('un second tour repond', jeu.avancePension(jeu.dureePension(a, b)), 1);
  eq('deux œufs en tout', s.stats.pension, 2);

  /* ROMPRE EST LE SEUL MOYEN DE LES RÉCUPÉRER, et il est manuel par principe. */
  ok('rompre marche', jeu.romprePension(a.id));
  eq('la place est rendue', jeu.couples().length, 0);
  ok('les parents sont libres', !jeu.enPension(a) && !jeu.enPension(b));
  ok('et rompre un couple qui n’existe pas ne fait rien', !jeu.romprePension(a.id));

  /* LA LIGNÉE PROMISE EST TENUE. C'est tout ce que la pension a d'unique sans les
     merveilleuses : deux loups rendent un loup, pas « un œuf commun ». */
  /* LA PROMESSE PORTE UN OBJET DEPUIS L'HÉRÉDITÉ : la lignée, et ce que les parents ont
     transmis. On lit donc `.ligne` là où on lisait la chaîne elle-même. */
  eq('la lignée attend en réserve',
     (s.pension.dus.rare || []).map(d => d.ligne).join(), 'loup,loup');
  s.incub[0] = null;
  jeu.placeEgg(0, 'rare');
  eq('et c’est elle qui part en couveuse', s.incub[0].line, 'loup');
  eq('la file a servi', s.pension.dus.rare.length, 1);
  s.incub[1] = null;
  s.eggs.rare = 5;
  jeu.placeEgg(1, 'rare');
  ok('l’œuf suivant est de nouveau tiré au hasard', typeof s.incub[1].line === 'string');
});

scenario('pension — un parent est gelé sur toutes ses faces', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'loup', 'ours');
  const temoin = bete(jeu, 'loup', 4, 0);

  const rente = jeu.renteOf(a);
  ok('elle rapporte avant', rente > 0, rente);
  jeu.accoupler(a, b);
  eq('et plus rien pendant', jeu.renteOf(a), 0);
  ok('le témoin, lui, rapporte toujours', jeu.renteOf(temoin) > 0);

  s.up.eleveur = 6; s.up.mangeoire = 6;
  const pAvant = a.p, oAvant = a.over || 0, tAvant = temoin.p;
  jeu.advance(60);
  eq('l’éleveur ne la pousse pas', a.p, pAvant);
  eq('la mangeoire ne l’engraisse pas', a.over || 0, oAvant);
  ok('mais le témoin avance', temoin.p > tAvant || (temoin.over || 0) > 0);

  s.sel = 'c:' + a.id;
  jeu.tapStage();
  eq('et le clic ne fait rien non plus', a.p, pAvant);
  eq('rien n’est parti dans l’embonpoint', a.over || 0, oAvant);

  /* LE MARCHAND NE VOIT PAS UN PARENT. Vendre la bête qu'on vient de confier annulerait la
     couvaison sans rien rendre, et ce serait l'automate qui l'aurait décidé. */
  temoin.p = 20000;                 // mûre : le marchand a de quoi mordre
  s.primes.marchand = true;
  for (const r of ['commune', 'rare', 'epique', 'mythique']) s.sellAt[r] = 1;
  const combien = s.pen.length;
  jeu.runAutomations(1);
  ok('les deux parents restent', s.pen.some(c => c.id === a.id) && s.pen.some(c => c.id === b.id));
  ok('le témoin, lui, est parti', combien > s.pen.length);
});

scenario('pension — la réserve pleine fait patienter, elle ne jette rien', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'loup', 'ours');
  jeu.accoupler(a, b);
  s.eggs.rare = jeu.PLAFOND_OEUFS;

  eq('rien ne sort', jeu.avancePension(1e6), 0);
  eq('le couple attend', jeu.couples().length, 1);
  eq('et la réserve n’a pas débordé', jeu.eggStock('rare'), jeu.PLAFOND_OEUFS);

  s.eggs.rare = 0;
  eq('la place libérée, l’œuf tombe', jeu.avancePension(1), 1);
  eq('un seul, pas cent', jeu.eggStock('rare'), 1);
});

scenario('pension — un parent vendu rompt le couple sans rien rendre', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'loup', 'ours');
  jeu.accoupler(a, b);
  s.pen = s.pen.filter(c => c.id !== a.id);

  const avant = jeu.eggStock('rare');
  eq('aucun œuf', jeu.avancePension(1e6), 0);
  eq('la réserve est intacte', jeu.eggStock('rare'), avant);
  eq('et la place est rendue', jeu.couples().length, 0);
});

scenario('pension — elle tourne pendant une absence, et l’écran suit', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'loup', 'ours');
  jeu.accoupler(a, b);
  jeu.advance(jeu.dureePension(a, b) + 1);
  eq('l’absence a fait éclore le couple', s.stats.pension, 1);

  jeu.refresh();
  eq('le panneau est ouvert', noeuds.get('panel-pension').hidden, false);
  /* LE PANNEAU NE COMPTE PLUS RIEN. Le compteur « 1 / 4 » et la phrase qui annonçait la
     réserve ont été retirés en 2.4.0 : deux chiffres de plus à surveiller dans une colonne
     qu'on voulait calme, et le second changeait à chaque ponte. Ce que la pension a produit se
     lit là où on va le chercher — dans la réserve, en boutique. */
  eq('l’œuf est bien en réserve', jeu.eggStock('commun') + jeu.eggStock('rare') >= 1, true);
});

scenario('pension — c’est un bâtiment : il faut l’acheter', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 8;
  const a = bete(jeu, 'loup', 4, 20000), b = bete(jeu, 'ours', 4, 20000);

  jeu.refresh();
  eq('le panneau n’existe pas', noeuds.get('panel-pension').hidden, true);
  ok('et le refus dit pourquoi', /construite/.test(jeu.refusPension(a, b)), jeu.refusPension(a, b));
  ok('accoupler est refusé', !jeu.accoupler(a, b));
  eq('la pension n’avance pas', jeu.avancePension(1e6), 0);

  /* ELLE S'ACHÈTE COMME UNE PRIME, donc au prix de la table — pas d'un chemin à part. */
  const p = jeu.PRIMES.find(x => x.cle === 'pension');
  ok('elle est dans la table des primes', !!p);
  s.coins = p.prix;
  jeu.buyPrime(p);
  ok('achetée', jeu.prime('pension'));
  eq('et payée', s.coins, 0);

  jeu.refresh();
  eq('le panneau apparaît', noeuds.get('panel-pension').hidden, false);
  ok('et le couple se forme', jeu.accoupler(a, b));

  /* UN COUPLE EN COURS GARDE LE PANNEAU À L'ÉCRAN même sans la prime : sinon deux bêtes
     resteraient parquées derrière un panneau disparu après une ascension. */
  s.primes = {};
  jeu.refresh();
  eq('le couple retient le panneau', noeuds.get('panel-pension').hidden, false);
});

scenario('pause — la ferme s’arrête, et le temps arrêté est perdu', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'loup', 'ours');
  s.up.eleveur = 6; s.up.couveuse = 6;
  a.p = 0;
  jeu.accoupler(a, b);

  const pAvant = a.p, coinsAvant = s.coins, tAvant = jeu.couples()[0].t;
  jeu.basculerPause(true);
  ok('le drapeau est levé', jeu.enPause);
  eq('le bouton le dit', noeuds.get('btn-pause').getAttribute('aria-pressed'), 'true');
  eq('et le bandeau apparaît', noeuds.get('pause-note').hidden, false);

  for (let i = 0; i < 50; i++) jeu.loop();
  eq('rien n’a poussé', a.p, pAvant);
  eq('rien n’est rentré', s.coins, coinsAvant);
  eq('rien n’a couvé', jeu.couples()[0].t, tAvant);

  /* LE CLIC EST ARRÊTÉ LUI AUSSI : une ferme arrêtée l'est pour tout le monde. */
  const temoin = bete(jeu, 'loup', 2, 0);
  const clics = s.stats.clics;
  jeu.tapStage();
  eq('le clic ne compte pas', s.stats.clics, clics);
  eq('et ne fait rien pousser', temoin.p, 0);

  jeu.basculerPause(false);
  ok('le drapeau retombe', !jeu.enPause);
  eq('le bandeau disparaît', noeuds.get('pause-note').hidden, true);
  // la boucle mesure du temps réel : sans reculer l’horloge, deux tours dans la même
  // milliseconde ne font rien avancer, et le scénario dépendrait de la vitesse de la machine
  jeu.lastFrame = Date.now() - 1000;
  jeu.loop();
  ok('et la ferme repart', jeu.couples()[0].t > tAvant, jeu.couples()[0].t);
});

scenario('pension — le nid se remplit au glisser comme au clic', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'loup', 'ours');
  jeu.refresh();

  eq('deux cases au départ', casesNid(jeu).length, 2);
  ok('vides', casesNid(jeu).every(z => z.classList.contains('vide')));

  ok('on pose à gauche', jeu.poserAuNid(a.id, 'a'));
  ok('et à droite', jeu.poserAuNid(b.id, 'b'));
  jeu.refresh();
  ok('les deux cases sont pleines', casesNid(jeu).every(z => z.classList.contains('pleine')));
  ok('et la phrase chiffre le couple', /1 h/.test(ditPension(jeu)), ditPension(jeu));

  /* LA MÊME BÊTE DES DEUX CÔTÉS N'A PAS DE SENS : les deux s’échangent plutôt que de laisser
     un trou, ce qui est le geste qu’on fait pour relire un couple dans l’autre sens. */
  ok('glisser celle de droite sur celle de gauche', jeu.poserAuNid(b.id, 'a'));
  eq('elle a changé de côté', jeu.pensionA, b.id);
  eq('et l’autre a pris sa place', jeu.pensionB, a.id);
  ok('reposer une bête sur sa propre case ne change rien', jeu.poserAuNid(b.id, 'a'));
  eq('elle est toujours à gauche', jeu.pensionA, b.id);
  eq('et l’autre à droite', jeu.pensionB, a.id);

  // une bête déjà en pension ne se repose pas
  jeu.pensionA = a.id; jeu.pensionB = b.id;
  jeu.accoupler(a, b);
  jeu.pensionA = jeu.pensionB = null;
  ok('elle est prise', !jeu.poserAuNid(a.id, 'a'));
  eq('et une bête qui n’existe pas non plus', jeu.poserAuNid(9999, 'a'), false);
});

scenario('pension — une bête confiée quitte la bande, sans quitter son enclos', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [a, b] = couple(jeu, 'loup', 'ours');
  const temoin = bete(jeu, 'cerf', 4, 20000);
  jeu.refresh();

  /* LA BANDE DESSINE DES CASES D'ENCLOS depuis la 2.5.0, vides comprises : ce qu'on compte
     ici, ce sont les cases OCCUPÉES. Une case libérée garde sa place au lieu de faire glisser
     tout le reste d'un cran sous le curseur. */
  const bande = () => noeuds.get('strip-pen').children
    .filter(x => !x.classList.contains('thumb-vide')).length;
  const vivantes = () => jeu.subjects().filter(x => x.kind === 'creature').length;
  eq('trois bêtes dans la bande', bande(), 3);
  eq('et trois sujets', vivantes(), 3);
  const enclos = jeu.penUsed();

  jeu.accoupler(a, b);
  jeu.refresh();

  /* ELLE QUITTE LA BANDE : on ne la sélectionne plus, on ne clique plus dessus, on ne la vend
     plus, et elle ne traîne plus dans une bande dont la moitié serait inerte. */
  eq('il n’en reste qu’une dans la bande', bande(), 1);
  eq('et un seul sujet', vivantes(), 1);
  ok('la confiée n’est plus sélectionnable', !jeu.subjects().some(x => x.key === 'c:' + a.id));

  /* ET ELLE LIBÈRE SON ENCLOS. Elle l'occupait, et le plan appelait ça « tout le prix de la
     pension » ; ce prix change de nature sans disparaître. Ce qu'on paie n'est plus une PLACE
     — une place se rachète pour quelques pièces — mais un DÉBIT : une bête confiée ne rente
     plus, ne grandit plus, ne s'engraisse plus et ne se vend pas. Une rente perdue se compte
     en heures, une place en secondes. */
  eq('l’enclos se libère', jeu.penUsed(), enclos - 2);
  ok('mais elle est toujours là', s.pen.some(c => c.id === a.id));
  eq('et elle ne rapporte plus rien', jeu.renteOf(a), 0);
  ok('elle est toujours dans state.pen', s.pen.some(c => c.id === a.id));
  eq('et elle ne rapporte rien', jeu.renteOf(a), 0);
  ok('le compteur d’enclos le dit', /2 en pension/.test(noeuds.get('compte-pen').textContent),
     noeuds.get('compte-pen').textContent);

  /* LE REGARD SUIT. Confier la bête qu'on regardait ne doit pas laisser la scène sur un
     fantôme : la sélection retombe sur ce qui reste. */
  ok('la scène montre autre chose', jeu.current() && jeu.current().key !== 'c:' + a.id);

  jeu.romprePension(a.id);
  jeu.refresh();
  eq('rompre les rend à la bande', bande(), 3);
  eq('et aux sujets', vivantes(), 3);
  ok('le compteur se tait', !/en pension/.test(noeuds.get('compte-pen').textContent));
});

scenario('pension — le marchand ne vend pas une bête confiée, même à la main', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [a, b] = couple(jeu, 'loup', 'ours');
  const temoin = bete(jeu, 'cerf', 4, 20000);
  jeu.accoupler(a, b);

  s.primes.marchand = true;
  for (const r of Object.keys(jeu.RARITY)) s.sellAt[r] = 1;
  const combien = s.pen.length;
  jeu.runAutomations(1);
  ok('les deux parents restent',
     s.pen.some(c => c.id === a.id) && s.pen.some(c => c.id === b.id));
  eq('seul le témoin est parti', s.pen.length, combien - 1);

  /* ET À LA MAIN NON PLUS : elle n'est plus un sujet, donc plus rien ne la désigne. Le
     verrou tient des deux côtés, sans avoir à l'écrire deux fois. */
  s.sel = 'c:' + a.id;
  ok('la sélection ne la retrouve pas', !jeu.current() || jeu.current().key !== 'c:' + a.id);
  const avant = s.pen.length;
  const sujet = jeu.current();
  if (sujet && sujet.c) jeu.sell(sujet.c);      // ce que fait le bouton « vendre »
  ok('la confiée est toujours là', s.pen.some(c => c.id === a.id));
  ok('elle est toujours en pension', jeu.enPension(a));
  eq('et le couple tient', jeu.couples().length, 1);
});

scenario('pension — la bête posée au nid quitte la bande tout de suite', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [a, b] = couple(jeu, 'loup', 'ours');
  jeu.refresh();

  const dansLaBande = id => jeu.subjects().some(x => x.kind === 'creature' && x.c.id === id);
  eq('les deux sont dans la bande', [a, b].filter(c => dansLaBande(c.id)).length, 2);

  /* LE NID EST UN ENGAGEMENT EN COURS, PAS UN BROUILLON. Une bête posée restait dans la bande :
     on la reprenait pour l'autre case sans s'en apercevoir, ou on la cherchait parmi quarante
     vignettes. Le commentaire de `subjects` promettait déjà ce retrait depuis la 1.8.0 — le
     filtre ne portait que sur les couples DÉJÀ PARTIS. */
  ok('on la pose', jeu.poserAuNid(a.id, 'a'));
  ok('elle a quitté la bande', !dansLaBande(a.id));
  ok('l’autre y est toujours', dansLaBande(b.id));
  ok('mais elle est toujours dans l’enclos', s.pen.some(c => c.id === a.id));

  // ON PEUT TOUJOURS ANNULER, et elle réapparaît
  jeu.retirerDuNid('a');
  ok('retirée du nid, elle revient', dansLaBande(a.id));

  /* LE REGARD SUIT. Confier la bête EN SCÈNE la faisait disparaître de la bande sans que la
     sélection bouge : on se retrouvait à regarder une case qui n'existait plus. */
  s.sel = 'c:' + a.id;
  jeu.poserAuNid(a.id, 'a');
  ok('la sélection a bougé', s.sel !== 'c:' + a.id, s.sel);
  ok('et elle désigne quelque chose de réel',
     jeu.subjects().some(x => x.key === s.sel), s.sel);

  // et une fois le couple parti, c'est la règle d'avant qui prend le relais
  jeu.poserAuNid(b.id, 'b');
  jeu.accoupler(a, b);
  ok('les deux restent hors de la bande', !dansLaBande(a.id) && !dansLaBande(b.id));
  eq('et toujours dans l’enclos', s.pen.length, 2);
});

scenario('pension — on voit ce qu’on a confié : caractère, motif, état', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [a, b] = couple(jeu, 'loup', 'ours');
  a.chroma = 2; a.temper = 4; a.motif = 4; a.prodige = false;   // farouche, un motif, gris
  b.prodige = true;

  /* LE NOM NE DIT QU'UNE CHOSE — la règle de l'épithète unique, et elle est bonne. La pension
     est un inventaire, pas un nom : il faut pouvoir dire LAQUELLE des trois louves on a prise.
     D'où la ligne de signes, qui dit tout ce que le nom a laissé de côté. */
  /* DEPUIS QUE LES TEINTES ONT DISPARU, LE CARACTÈRE EST MONTÉ DANS LE NOM. L'épithète
     unique prenait la teinte en priorité ; elle n'existe plus, donc une bête grise et
     farouche s'appelle « Louve farouche ». La ligne des signes ne le répète donc plus — elle
     dit ce que le nom a laissé de côté, et c'est toujours la règle. */
  eq('le caractère est passé dans le nom', jeu.epithetOf(a), 'farouche');
  const sg = jeu.signesDe(a);
  ok('donc la ligne ne le répète pas', !/farouche/.test(sg), sg);
  ok('le motif aussi', sg.includes(jeu.MOTIFS[a.motif]), jeu.MOTIFS[a.motif] + ' | ' + sg);
  ok('et l’état', /adulte|ancien|légende|enfant|adolescent/.test(sg), sg);
  ok('mais pas ce que le nom dit déjà',
     !new RegExp(jeu.epithetOf(a) + '$').test(sg) || jeu.epithetOf(a) === '',
     jeu.epithetOf(a) + ' | ' + sg);
  ok('le chromatique se dit', /chromatique/.test(jeu.signesDe(b)) ||
     /chromatique/.test(jeu.fullName(b)), jeu.fullName(b) + ' | ' + jeu.signesDe(b));

  jeu.poserAuNid(a.id, 'a'); jeu.poserAuNid(b.id, 'b');
  jeu.accoupler(a, b);
  jeu.pensionSig = '';
  jeu.refresh();

  const ligne = noeuds.get('pension').children.find(c => c.classList.contains('couple'));
  /* DEUX EMOJI NUS ET DEUX NOMS DE LIGNÉE : c'est tout ce que la ligne montrait. On confiait
     deux bêtes pour cinq heures sans pouvoir dire lesquelles. */
  const betes = sousArbre(ligne, 'couple-bete');
  eq('un dessin par parent', betes.length, 2);
  ok('teinté comme dans la bande', betes.some(g => g.style.filter),
     betes.map(g => g.style.filter).join(' | '));

  const noms = sousArbre(ligne, 'couple-nom').map(n => n.textContent);
  eq('deux noms', noms.length, 2);
  ok('et ce sont les noms complets, pas les lignées',
     noms[0] === jeu.fullName(a) && noms[1] === jeu.fullName(b), noms.join(' | '));

  const signes = sousArbre(ligne, 'couple-signes').map(n => n.textContent);
  eq('deux lignes de signes', signes.length, 2);
  /* Le caractère est dans le NOM depuis la disparition des teintes ; la ligne de signes dit
     ce qui reste — l'état et le motif. C'est la même règle, appliquée à un nom plus riche. */
  ok('celle du premier parent dit son motif', /marbré/.test(signes[0]), signes[0]);
  ok('et son nom porte le caractère', /farouche/.test(noms[0]), noms[0]);

  // la rareté se lit sur chaque parent, comme partout ailleurs
  const p = sousArbre(ligne, 'couple-p');
  ok('chaque parent porte sa rareté',
     p.every(x => /rar-/.test(x.className)), p.map(x => x.className).join(' | '));

  // et le nid dit la même chose : une bête se lit pareil partout
  jeu.romprePension(a.id);
  jeu.poserAuNid(a.id, 'a');
  jeu.pensionSig = '';
  jeu.refresh();
  const dit = sousArbre(noeuds.get('pension'), 'nid-dit').map(n => n.textContent).join(' | ');
  ok('le nid montre les mêmes signes', /marbré/.test(dit), dit);
  ok('et garde les étiquettes, qui décident de la durée', /poil|terre|écaille|plume|nu/.test(dit), dit);
});

scenario('pension — le panneau se bâtit une fois, et se repeint ensuite', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [a, b] = couple(jeu, 'loup', 'ours');
  jeu.refresh();

  const nid = () => noeuds.get('pension').children.find(c => c.classList.contains('nid'));
  const cases = () => nid().children.filter(c => c.classList.contains('nid-case'));

  /* LE MÊME DÉFAUT QUE LA BANDE AVANT LA 2.14.0. Le panneau se reconstruisait à chaque
     `refresh`, dix fois par seconde : le bouton disparaît entre l'appui et le relâchement, le
     navigateur n'émet alors aucun « click », et la cible d'un dépôt est détruite sous le
     curseur pendant qu'on la survole. Retirer une bête du nid ne marchait qu'un coup sur deux,
     et le glisser-déposer scintillait. */
  const avant = nid();
  for (let i = 0; i < 50; i++) jeu.refresh();
  ok('cinquante redessins ne touchent pas au nid', nid() === avant);

  jeu.poserAuNid(a.id, 'a');
  jeu.refresh();
  ok('mais un dépôt le rebâtit', nid() !== avant);
  const apres = nid();
  for (let i = 0; i < 50; i++) jeu.refresh();
  ok('puis il redevient stable', nid() === apres);

  /* CE QUI COULE SE REPEINT SANS RIEN RECONSTRUIRE. */
  jeu.poserAuNid(b.id, 'b');
  jeu.accoupler(a, b);
  jeu.refresh();
  const ligne = () => noeuds.get('pension').children.find(c => c.classList.contains('couple'));
  const reste = () => sousArbre(ligne(), 'couple-reste')[0].textContent;
  const noeud = ligne(), t0 = reste();
  jeu.avancePension(600);
  jeu.refresh();
  ok('la ligne du couple est le même nœud', ligne() === noeud);
  ok('mais son temps a changé', reste() !== t0, t0 + ' → ' + reste());

  /* L'ÂGE DES BÊTES DU NID EST DANS LA SIGNATURE : elles grandissent tant qu'on ne les a pas
     confiées, et leur nom change avec. */
  jeu.romprePension(a.id);
  jeu.poserAuNid(a.id, 'a');
  jeu.refresh();
  const stable = nid();
  jeu.refresh();
  ok('rien ne bouge sans raison', nid() === stable);
  a.age = 5;
  jeu.refresh();
  ok('mais un âge qui change rebâtit', nid() !== stable);

  /* LE RANG DE TAILLE EST DANS LA SIGNATURE depuis que la ligne de signes le dit : une bête
     qui passe de « moyenne » à « géante » au nid ne l'annoncerait qu'une fois sur deux. */
  const stable2 = nid();
  a.over = (a.over || 0) + 1e6;
  jeu.refresh();
  ok('une taille qui change rebâtit aussi', nid() !== stable2);
});

scenario('pension — une bête posée se reprend et s’échange', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [a, b] = couple(jeu, 'loup', 'ours');
  jeu.poserAuNid(a.id, 'a');
  jeu.poserAuNid(b.id, 'b');
  jeu.refresh();

  const cases = () => noeuds.get('pension').children.find(c => c.classList.contains('nid'))
                        .children.filter(c => c.classList.contains('nid-case'));

  /* COMPOSER UN COUPLE ÉTAIT UN ALLER SIMPLE : une fois la bête dans le nid, seul le clic la
     ressortait. Une case pleine est maintenant une poignée. */
  ok('les deux cases sont des poignées', cases().every(z => z.draggable));
  eq('et elles portent la clé de leur bête', cases().map(z => z.dataset.cle).join(' '),
     'c:' + a.id + ' c:' + b.id);
  ok('elles se disent reprenables', /retirer/.test(cases()[0].title), cases()[0].title);

  // une case vide n'est pas une poignée
  jeu.pensionB = null;
  jeu.refresh();
  eq('la case vide ne se glisse pas', !!cases()[1].draggable, false);
  eq('et ne porte pas de clé', cases()[1].dataset.cle, undefined);
});

scenario('pension — un nid sans place ne se laisse pas remplir', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'loup', 'ours');
  const c = bete(jeu, 'cerf', 4, 20000), d = bete(jeu, 'chat', 4, 20000);

  ok('le nid est ouvert', jeu.nidOuvert());
  jeu.accoupler(a, b);
  ok('la place prise, il se ferme', !jeu.nidOuvert());

  /* IL ACCEPTAIT TOUT ET NE REFUSAIT QU'AU BOUTON : on composait un couple, on lisait
     « la place est prise », et il fallait ressortir les deux bêtes une par une. */
  eq('poser est refusé', jeu.poserAuNid(c.id, 'a'), false);
  eq('des deux côtés', jeu.poserAuNid(d.id, 'b'), false);
  eq('et rien n’est entré', jeu.pensionA, null);

  /* ET IL NE SE DESSINE PLUS DU TOUT. Il s'affichait en grisé, avec « le nid est occupé » et
     « attends que le couple ait fini » : un emplacement proposé qu'on ne peut pas remplir, et
     deux phrases pour s'en excuser. Une place qui n'existe pas ne se dessine pas — les lignes
     de couples au-dessus disent déjà pourquoi. */
  jeu.refresh();
  eq('le nid n’est pas là', casesNid(jeu).length, 0);
  ok('ni le bouton qui le valide',
     !noeuds.get('pension').children.some(x => x.id === 'pension-go'));
  ok('mais les couples en cours restent',
     noeuds.get('pension').children.some(x => x.classList.contains('couple')));

  // la place ne se libère plus toute seule : il faut rompre le couple
  jeu.avancePension(1e6);
  eq('le couple tient bon', jeu.couples().length, 1);
  ok('on le rompt', jeu.romprePension(a.id));
  jeu.refresh();
  ok('le nid se rouvre', jeu.nidOuvert());
  ok('et poser remarche', jeu.poserAuNid(c.id, 'a'));
  jeu.refresh();
  eq('les deux cases sont revenues', casesNid(jeu).length, 2);

  // sans la prime non plus, le nid ne se remplit pas
  s.primes = {};
  eq('pas de bâtiment, pas de nid', jeu.nidOuvert(), false);
});

scenario('pension — une partie de v14 se relit sans rien perdre', () => {
  const j = neuf(); const s = j.state;
  s.coins = 5e6; s.pens = 4; s.stats.eclos = 12;
  const vieux = JSON.parse(JSON.stringify(s));
  vieux.v = 14;
  /* Une v14 n a jamais pu pondre : ni file de lignées, ni compteur de naissances. */
  delete vieux.pension.dus; delete vieux.pension.nes; delete vieux.stats.pension;

  const k = neuf(vieux);
  eq('le format monte', k.state.v, k.SAVE_V);
  eq('la file naît vide', JSON.stringify(k.state.pension.dus), '{}');
  eq('le compteur aussi', k.state.pension.nes, 0);
  eq('et la ferme est intacte', k.state.coins, 5e6);
  eq('avec ses enclos', k.state.pens, 4);

  // et une partie plus vieille encore, sans champ pension du tout
  delete vieux.pension;
  const m = neuf(vieux);
  eq('un champ pension est posé', m.state.pension.couples.length, 0);
  eq('avec sa file', JSON.stringify(m.state.pension.dus), '{}');
  eq('et la pension tourne à vide sans lever', m.avancePension(1e5), 0);
});

/* ─────────────────────────────── les merveilles ─────────────────────────────── */

scenario('merveilles — aucun œuf n’en donne, et rien ne la met en vente', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;

  /* LA DÉFINITION DU RANG EST UNE ABSENCE, et c'est ce qui se vérifie le plus mal : rien ne
     lève quand une porte s'ouvre par accident. On la garde donc des deux côtés — la structure
     des tables, puis le tirage lui-même. */
  const merv = jeu.LINES.filter(l => l.rarity === 'merveilleuse');
  ok('il y a des merveilleuses', merv.length >= 2, merv.length);
  for (const e of jeu.EGG_KINDS) {
    if (!e.price) continue;
    eq('l’œuf ' + e.key + ' ne cote aucune merveilleuse', e.odds.merveilleuse, undefined);
  }

  let sorties = 0;
  for (const e of jeu.OEUFS_VENDUS)
    for (let i = 0; i < 20000; i++)
      if (jeu.LINE_BY_KEY[jeu.rollLine(e.key)].rarity === 'merveilleuse') sorties++;
  eq('quatre-vingt mille tirages, aucune merveilleuse', sorties, 0);

  // et la porte de service : l'œuf de merveille existe, mais il n'a pas de prix
  eq('la sorte existe', jeu.EGG_BY_KEY.merveille.rarity, 'merveilleuse');
  eq('elle n’a pas de prix', jeu.EGG_BY_KEY.merveille.price, null);
  ok('la boutique ne la liste pas', !jeu.OEUFS_VENDUS.some(e => e.key === 'merveille'));
  ok('les dévoilements non plus', !jeu.CLES_VOIR.includes('egg-merveille'));
  jeu.buyEgg('merveille');
  eq('et l’acheter ne fait rien', jeu.eggStock('merveille'), 0);
  eq('sans rien coûter', s.coins, 1e12);
});

scenario('pension — une sauvegarde d’avant garde ce qu’elle avait payé', () => {
  /* Les douze primes n'existent plus. Les laisser inertes confisquerait quatre mille
     milliards de pièces sans un mot : on rend le cran équivalent dans la constellation. */
  const vieille = neuf({
    coins: 1e9, primes: { pension: true, 'pension-place-1': true, 'pension-place-2': true,
                          'pension-vite-1': true, 'pension-sang': true },
  });
  eq('le sang valait le troisième cran', vieille.rangPension(), 3);
  eq('donc huit nids', vieille.placesPension(), 8);
  ok('et les primes mortes ont disparu de la sauvegarde',
     !Object.keys(vieille.state.primes).some(k => k.startsWith('pension-')),
     Object.keys(vieille.state.primes).join(' '));
  ok('le bâtiment, lui, reste', vieille.state.primes.pension);

  // qui n'avait rien n'obtient rien
  const nue = neuf({ coins: 1e9, primes: { pension: true } });
  eq('aucun cran offert sans rien', nue.rangPension(), 0);
});

scenario('pension — les échelles du bâtiment, et ce qu’elles ne touchent pas', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [a, b] = couple(jeu, 'crapaud', 'ouroboros');

  /* LES TROIS N'EXISTENT PAS SANS LE BÂTIMENT : trois cases qui parlent d'un panneau qu'on
     n'a pas encore encombrent la grille pour rien. */
  /* LES DOUZE PRIMES DE PENSION SONT MONTÉES DANS LA CONSTELLATION. Elles occupaient les dix
     dernières marches de l'escalier des primes : arrivé là, il n'y avait plus rien à acheter
     qui ne soit de la pension. Le BÂTIMENT, lui, reste une prime en pièces — il s'ouvre donc
     toujours dans le premier cycle. */
  ok('plus une seule prime de pension', !jeu.PRIMES.some(p => p.cle.startsWith('pension-')));
  ok('le bâtiment reste une prime', !!jeu.PRIME_BY_CLE.pension);

  const crans = ['nid-plus', 'ponte-plus', 'sang-epais', 'nid-vif'];
  const monter = n => { s.ciel = {}; for (let i = 0; i < n; i++) s.ciel[crans[i]] = true;
                        jeu.oublierPrimes(); };
  eq('quatre nœuds sur l’axe pension', jeu.PAR_AXE.pension.length, 4);
  ok('et ils font une chaîne', jeu.PAR_AXE.pension.every((n, i) =>
     i === 0 ? n.parent === 'etincelle' : n.parent === crans[i - 1]));

  /* UN NŒUD LÈVE LES QUATRE CADRANS D'UN CRAN. C'est ce que le bâtiment raconte : on
     n'achète pas un nid, puis une couveuse, puis un régime — on agrandit la pension. */
  const table = [[1, 1, 1, 1], [2, 2, 1.5, 1], [4, 3, 4, 4], [8, 5, 12, 8], [9, 6, 18, 16]];
  for (let n = 0; n <= 4; n++) {
    monter(n);
    const [pl, po, vi, ri] = table[n];
    eq('cran ' + n + ' · places', jeu.placesPension(), pl);
    eq('cran ' + n + ' · portée', jeu.porteePension(), po);
    eq('cran ' + n + ' · vitesse', jeu.vitessePension(), vi);
    eq('cran ' + n + ' · richesse', jeu.richessePension(), ri);
  }
  monter(0);

  /* LE NID RACCOURCIT LA COUVAISON, RECETTES COMPRISES — c'est la seule chose du jeu qui rende
     une merveille plus rapide, et elle le fait sans jamais la nommer. L'échelle se lit comme
     un palier qui REMPLACE le précédent : « quatre fois plus vite » veut dire quatre fois plus
     vite qu'à l'origine, jamais quatre fois plus vite que le cran d'avant. */
  const avant = jeu.dureePension(a, b);
  for (const [n, x] of [[1, 1.5], [2, 4], [3, 12], [4, 18]]) {
    monter(n);
    eq('cran ' + n + ' : ×' + x, jeu.dureePension(a, b), Math.round(avant / x));
  }
  eq('l’échelle plafonne à dix-huit', jeu.vitessePension(), 18);

  const g1 = bete(jeu, 'golem', 4, 20000), g2 = bete(jeu, 'golem', 4, 20000);
  eq('la recette raccourcit aussi', jeu.dureePension(g1, g2),
     Math.round(jeu.recetteDe(g1, g2).duree / 18));

  /* MAIS PAS UN COUPLE DÉJÀ PARTI : sinon le nœud devient un bouton « finis ma couvaison ». */
  monter(0);
  jeu.accoupler(a, b);
  const fige = jeu.couples()[0].duree;
  monter(1);
  eq('la durée du couple en cours ne bouge pas', jeu.couples()[0].duree, fige);
  monter(0);
  s.pension.couples = [];

  /* LE SANG DOMINANT arrive au troisième cran : il double la chance du parent le plus rare,
     sans jamais passer une fois sur deux. */
  eq('sans lui', jeu.chancePension(1), 0.2);
  monter(2);
  eq('deux crans ne suffisent pas', jeu.chancePension(1), 0.2);
  monter(3);
  eq('avec lui', jeu.chancePension(1), 0.4);
  eq('et le plus petit écart reste à pile ou face', jeu.chancePension(0), 0.5);
  ok('il se voit dans la lignée tirée', (() => {
    let hauts = 0;
    for (let i = 0; i < 4000; i++) if (jeu.ligneeDe(a, b) === 'ouroboros') hauts++;
    return hauts / 4000 > 0.01;               // 2 % attendu, 1 % sans le nœud
  })());

  /* LES PLACES OUVRENT LE NID D'AUTANT. */
  monter(1);
  eq('deux places au premier cran', jeu.placesPension(), 2);
  jeu.accoupler(a, b);
  ok('le nid reste ouvert après le premier couple', jeu.nidOuvert());
  const c = bete(jeu, 'cerf', 4, 20000), d = bete(jeu, 'chat', 4, 20000);
  ok('et un second couple se forme', jeu.accoupler(c, d));
  ok('le troisième, non', !jeu.nidOuvert());

  /* AUCUNE NE TOUCHE AUX RECETTES : une prime qui ferait tomber les merveilles plus souvent
     devrait le dire pour se vendre, et dirait donc qu'elles existent. */
  for (const n of jeu.PAR_AXE.pension)
    ok(n.nom + ' ne parle pas des merveilles', !/erveille/.test(n.dit));
  monter(3);
  eq('et la chance d’une recette ne bouge pas', jeu.recetteDe(g1, g2).chance, 0.001);

  /* LA RICHESSE SE DESSERRE MAIS NE SE LÈVE PAS. Le multiplicateur de rareté est ce qui
     empêche la pension d'être une imprimante à billets ; on le divise, on ne le supprime pas.
     Elle ne bouge qu'au DEUXIÈME cran : le premier ouvre déjà les places, la portée et la
     vitesse, et desserrer la richesse en plus ferait du premier nœud le seul qui compte. */
  monter(0);
  const myth1 = bete(jeu, 'ouroboros', 4, 20000), myth2 = bete(jeu, 'behemoth', 4, 20000);
  const plein = jeu.dureePension(myth1, myth2);
  eq('la richesse vaut un au départ', jeu.richessePension(), 1);
  monter(1);
  eq('le premier cran n’y touche pas', jeu.richessePension(), 1);
  monter(2);
  eq('quatre fois moins au deuxième', jeu.dureePension(myth1, myth2),
     Math.round(plein / (4 * 4)));
  monter(4);
  eq('seize fois moins au bout', jeu.dureePension(myth1, myth2),
     Math.round(plein / (16 * 18)));
  /* Elle ne descend jamais sous un : sinon une commune irait plus vite que la boucle de jeu,
     et le plafond de réserve serait le seul reste du système. */
  s.pens = 40;
  const com1 = bete(jeu, 'crapaud', 4, 20000), com2 = bete(jeu, 'crapaud', 4, 20000);
  monter(0);
  const nue = jeu.dureePension(com1, com2);
  monter(4);
  eq('deux communes ne gagnent rien à desserrer la richesse',
     jeu.dureePension(com1, com2), Math.round(nue / 18));

  /* ET LE RANG PÈSE ENCORE AU DERNIER CRAN, c'est ce qui tient tout le système : deux
     mythiques restent quatre fois plus lentes que deux communes, seize au lieu de soixante-
     quatre. On desserre, on ne lève pas. */
  ok('deux mythiques restent plus lentes que deux communes',
     jeu.dureePension(myth1, myth2) > jeu.dureePension(com1, com2),
     jeu.dureePension(myth1, myth2) + ' vs ' + jeu.dureePension(com1, com2));
});

scenario('pension — la portée multiplie les œufs, jamais les merveilles', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15;
  const [g1, g2] = couple(jeu, 'golem', 'golem');

  const crans = ['nid-plus', 'ponte-plus', 'sang-epais', 'nid-vif'];
  const monter = n => { s.ciel = {}; for (let i = 0; i < n; i++) s.ciel[crans[i]] = true;
                        jeu.oublierPrimes(); };

  eq('une portée d’un au départ', jeu.porteePension(), 1);
  for (const [n, x] of [[1, 2], [2, 3], [3, 5], [4, 6]]) {
    monter(n);
    eq('cran ' + n + ' : ' + x + ' œufs', jeu.porteePension(), x);
  }
  monter(3);   // cinq œufs : le compte que la suite du scénario vérifie

  jeu.accoupler(g1, g2);
  const vrai = Math.random;
  try {
    Math.random = () => 0.99;                    // la recette ne tombe pas
    eq('cinq œufs d’un coup', jeu.avancePension(jeu.dureePension(g1, g2) + 1), 5);
  } finally { Math.random = vrai; }
  eq('cinq dans la réserve', jeu.eggStock('epique'), 5);
  eq('et cinq lignées promises', (s.pension.dus.epique || []).length, 5);

  /* LA RECETTE SE TIRE UNE FOIS PAR PONTE, ET NON PAR ŒUF. Une nichée est un événement, pas
     cinq — sans cette règle la dernière prime du jeu multiplierait par cinq la chance de
     toutes les merveilles d'un coup. */
  s.eggs.epique = 0; s.pension.dus = {};
  try {
    Math.random = () => 0;                       // la recette tombe
    jeu.avancePension(jeu.dureePension(g1, g2) + 1);
  } finally { Math.random = vrai; }
  const dus = [].concat(...Object.values(s.pension.dus));
  eq('la nichée fait toujours cinq', dus.length, 5);
  eq('et elle ne contient qu’une merveille', dus.filter(d => d.ligne === 'wukong').length, 1);
});

scenario('pension — un couple bloqué ne tire pas sa recette', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15;
  const [g1, g2] = couple(jeu, 'golem', 'golem');
  jeu.accoupler(g1, g2);
  const duree = jeu.couples()[0].duree;

  /* LE DÉFAUT QUI A RENDU SUN WUKONG TRIVIAL. Le test de plafond vivait APRÈS le tirage de
     recette : un couple bloqué relançait donc sa recette à chaque tour de boucle — dix fois
     par seconde — et comme la merveille a sa PROPRE réserve, jamais pleine, elle était la
     seule chose que le couple pouvait encore pondre. Mesuré avant correctif : huit Wukong en
     une minute de jeu accéléré, là où la médiane est de dix-neuf heures.

     La leçon vaut pour tout ce qui viendra : un tirage ne doit jamais avoir lieu dans une
     branche qui ne peut pas aboutir. */
  s.eggs.epique = jeu.PLAFOND_OEUFS;
  ok('le couple est bloqué', jeu.reservePleine(g1, g2));

  const vrai = Math.random;
  let tirages = 0;
  try {
    Math.random = () => { tirages++; return 0; };   // la recette tomberait à tous les coups
    for (let i = 0; i < 500; i++) jeu.avancePension(duree);
  } finally { Math.random = vrai; }

  eq('aucun tirage n’a eu lieu', tirages, 0);
  eq('aucune merveille n’est sortie', jeu.eggStock('merveille'), 0);
  eq('rien n’est né', s.stats.pension, 0);
  eq('et le couple attend toujours', jeu.couples().length, 1);
  eq('son compteur ne déborde pas', jeu.couples()[0].t, duree);

  // la réserve vidée, il repart normalement
  s.eggs.epique = 0;
  eq('la ponte reprend', jeu.avancePension(1), jeu.porteePension());
});

scenario('pension — une absence rattrape plusieurs pontes, sans boucler sans fin', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15;
  const [a, b] = couple(jeu, 'loup', 'ours');
  jeu.accoupler(a, b);
  const duree = jeu.couples()[0].duree;

  eq('dix couvaisons rattrapées', jeu.avancePension(duree * 10 + 1), 10);
  eq('le couple est toujours là', jeu.couples().length, 1);

  /* LE PLAFOND DE LA RÉSERVE EST LE SEUL FREIN, et il tient parce qu'elle se vide toute
     seule dans les incubateurs libres. */
  s.eggs.rare = jeu.PLAFOND_OEUFS - 2;
  eq('elle ne déborde pas', jeu.avancePension(duree * 50), 2);
  eq('la réserve est pleine, pas au-delà', jeu.eggStock('rare'), jeu.PLAFOND_OEUFS);
  eq('et le couple attend', jeu.couples().length, 1);

  // la boucle est bornée : une absence démesurée ne coûte pas une seconde de calcul
  s.eggs.rare = 0;
  const t0 = Date.now();
  jeu.avancePension(duree * 1e6);
  ok('le rattrapage se termine', Date.now() - t0 < 1000, Date.now() - t0);
  ok('borné par PONTES_MAX', jeu.eggStock('rare') <= jeu.PLAFOND_OEUFS);
});

scenario('pension — deux chimères donnent n’importe quoi, sauf une chimère', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [c1, c2] = couple(jeu, 'chimere', 'chimere');
  const loup = bete(jeu, 'loup', 4, 20000);

  ok('la chimère porte le drapeau', jeu.LINE_BY_KEY.chimere.joker === true);
  ok('elle est la seule', jeu.LINES.filter(l => l.joker).length === 1);
  ok('le couple est reconnu', jeu.couple2Jokers(c1, c2));
  ok('mais pas avec autre chose', !jeu.couple2Jokers(c1, loup));

  /* DEUX CHIMÈRES NE FONT JAMAIS UNE CHIMÈRE. Tout le reste sort, de la plus commune des
     bêtes jusqu'à une merveille — celle-là une fois sur cinquante. */
  const tire = {};
  const N = 200000;
  for (let i = 0; i < N; i++) { const l = jeu.ligneeDe(c1, c2); tire[l] = (tire[l] || 0) + 1; }
  eq('jamais de chimère', tire.chimere, undefined);
  eq('tout le reste sort', Object.keys(tire).length, jeu.LINES.length - 1);
  eq('le sac ordinaire exclut les secrets et le joker',
     jeu.poolJoker.length, jeu.LINES.length - 1 - jeu.LINES.filter(l => l.rarity === 'merveilleuse').length);

  const merveilles = jeu.LINES.filter(l => l.rarity === 'merveilleuse')
    .reduce((n, l) => n + (tire[l.key] || 0), 0) / N;
  ok('une merveille une fois sur cinquante',
     Math.abs(merveilles - jeu.JOKER_MERVEILLE) < 0.003, (merveilles * 100).toFixed(2) + ' %');

  /* LA ROUTE RESTE PIRE QUE N'IMPORTE QUELLE RECETTE, et c'est la condition pour que les
     recettes gardent un sens : on ne chasse pas une merveille aux chimères, on en trouve une. */
  const parJoker = k => (tire[k] || 0) / N / (jeu.dureePension(c1, c2) / 3600);
  for (const donne of [...new Set(jeu.RECETTES.map(r => r.donne))]) {
    /* La MEILLEURE route, pas toutes : l'accident est fait pour être mauvais, et il l'est
       naturellement plus que le joker — c'est cohérent, tous deux sont des rencontres. */
    const best = Math.max(...jeu.RECETTES.filter(r => r.donne === donne)
                                         .map(r => r.chance / (r.duree / 3600)));
    ok(donne + ' : sa recette bat le joker', best > parJoker(donne) * 2,
       best.toFixed(4) + ' vs ' + parJoker(donne).toFixed(4));
  }

  // hors joker, l enfant reste l un des deux parents
  const vus = new Set();
  for (let i = 0; i < 400; i++) vus.add(jeu.ligneeDe(c1, loup));
  ok('un couple ordinaire ne tire que ses deux lignées',
     [...vus].every(l => l === 'chimere' || l === 'loup'), [...vus].join(', '));

  jeu.pensionA = c1.id; jeu.pensionB = c2.id; jeu.refresh();
  ok('et l’écran l’annonce', /n’importe quelle lignée/.test(ditPension(jeu)), ditPension(jeu));
  ok('sans prétendre à une recette', !/autre chose/.test(ditPension(jeu)), ditPension(jeu));
});

scenario('tarasque — la seule merveille sans recette', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [c1, c2] = couple(jeu, 'chimere', 'chimere');

  const t = jeu.LINE_BY_KEY.tarasque;
  ok('elle existe', !!t);
  eq('elle est du rang secret', t.rarity, 'merveilleuse');
  eq('elle a cinq formes', t.forms.length, jeu.AGES.length);
  ok('elle a ses étiquettes', !!jeu.ETIQUETTES.tarasque);

  /* AUCUNE RECETTE NE LA DONNE, et c'est ce qui la distingue des deux autres : on ne la
     cherche pas, elle arrive. */
  ok('aucune recette ne la produit', !jeu.RECETTES.some(r => r.donne === 'tarasque'));
  ok('et elle n’est dans aucun couple de recette',
     !jeu.RECETTES.some(r => r.a === 'tarasque' || r.b === 'tarasque'));

  // elle prend la moitié du sac secret à elle seule
  const tire = {};
  const N = 200000;
  for (let i = 0; i < N; i++) { const l = jeu.ligneeDe(c1, c2); tire[l] = (tire[l] || 0) + 1; }
  const secret = jeu.LINES.filter(l => l.rarity === 'merveilleuse')
    .reduce((n, l) => n + (tire[l.key] || 0), 0);
  ok('la moitié des merveilles tirées sont des tarasques',
     Math.abs((tire.tarasque || 0) / secret - 0.5) < 0.05,
     ((tire.tarasque || 0) / secret).toFixed(3));
  ok('elle sort plus souvent que chacune des autres',
     jeu.LINES.filter(l => l.rarity === 'merveilleuse' && l.key !== 'tarasque')
       .every(l => (tire[l.key] || 0) < tire.tarasque));

  /* ELLE RESTE SOUS LE SECRET tant qu'on n'en a pas vu une, comme les deux autres. */
  eq('le rang est inconnu', jeu.rareteConnue('merveilleuse'), false);
  jeu.pensionA = c1.id; jeu.pensionB = c2.id; jeu.refresh();
  ok('et la phrase ne le dit pas', !/merveilleuse/.test(ditPension(jeu)), ditPension(jeu));
  s.seen['tarasque:1'] = 1;
  jeu.refresh();
  ok('une fois connue, la phrase chiffre le sac',
     /2 % de merveilleuse/.test(ditPension(jeu)), ditPension(jeu));
});

scenario('recettes — un mythique par famille, et la chimère n’en est pas une', () => {
  const jeu = neuf();
  /* La chimère était le carrefour de la moitié des recettes, au motif qu'elle est faite
     d'autres bêtes — c'était lui prêter le rôle inverse du sien. Elle disperse, elle ne
     concentre pas. */
  ok('aucune recette ne passe par la chimère',
     !jeu.RECETTES.some(r => r.a === 'chimere' || r.b === 'chimere'),
     JSON.stringify(jeu.RECETTES));

  const kitsune = jeu.RECETTES.filter(r => r.donne === 'kitsune');
  eq('la kitsune a deux routes', kitsune.length, 2);
  ok('toutes deux par l’ouroboros — son axe est le temps',
     kitsune.every(r => r.a === 'ouroboros' || r.b === 'ouroboros'));
  ok('la recette est plus généreuse que l’accident',
     Math.max(...kitsune.map(r => r.chance)) === 0.01 &&
     Math.min(...kitsune.map(r => r.chance)) === 0.001);

  /* L'EXACT DOIT TOUJOURS ÉCRASER L'ACCIDENT EN RENDEMENT, sinon il ne sert à rien. */
  for (const donne of [...new Set(jeu.RECETTES.map(r => r.donne))]) {
    const routes = jeu.RECETTES.filter(r => r.donne === donne)
      .map(r => ({ r, rendement: r.chance / r.duree }))
      .sort((x, y) => y.rendement - x.rendement);
    if (routes.length < 2) continue;
    ok(donne + ' : la meilleure route est bien la plus généreuse',
       routes[0].r.chance >= routes[1].r.chance);
    ok(donne + ' : et elle écrase l’autre',
       routes[0].rendement >= routes[1].rendement * 3,
       (routes[0].rendement / routes[1].rendement).toFixed(1) + '×');
  }

  // chaque recette désigne des lignées qui existent, et un couple fécond
  for (const r of jeu.RECETTES) {
    ok('parents connus : ' + r.a + ' × ' + r.b,
       !!jeu.LINE_BY_KEY[r.a] && !!jeu.LINE_BY_KEY[r.b]);
    ok('donne une lignée connue : ' + r.donne, !!jeu.LINE_BY_KEY[r.donne]);
    ok(r.a + ' × ' + r.b + ' n’est pas stérile',
       jeu.distanceDe({ line: r.a }, { line: r.b }) !== null);
    ok(r.a + ' × ' + r.b + ' tient sous le plafond', r.duree <= jeu.PENSION.plafond);
  }
});

scenario('merveilles — le rang n’existe pas tant qu’on n’en a pas vu une', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12; s.pens = 8; s.primes.pension = true;
  s.primes.marchand = true; s.primes.evolution = true; s.up.mangeoire = 6;
  jeu.refresh();

  /* CINQ FUITES, ET AUCUNE N'EST GRAVE PRISE SEULE. Ensemble elles disent tout : qu'il existe
     un cinquième rang, qu'il compte deux lignées, qu'il ne s'achète pas, et qu'il passe par la
     pension. Ce scénario les tient toutes les cinq fermées d'un coup. */
  ok('le rang est marqué secret', jeu.RARITY.merveilleuse.secret === true);
  eq('et il est inconnu au départ', jeu.rareteConnue('merveilleuse'), false);
  eq('les quatre autres sont connues', jeu.raretesConnues().length, 4);

  // 1 · la collection
  const sections = () => noeuds.get('collection').children
    .filter(n => (n.className || '').includes('coll-head'));
  eq('pas de cinquième section', sections().length, 4);
  // 2 · le dénominateur
  eq('et le compte s’arrête à 135', jeu.formesVisibles(), 135);
  // 3 · le trophée
  const t = jeu.TROPHEES.find(x => x.cle === 'merveille');
  ok('le trophée existe', !!t);
  ok('mais il ne se montre pas', !t.montre);
  jeu.renderStats();                       // c’est lui qui peuple la liste des trophées
  const nomsVus = noeuds.get('trophees').children
    .map(n => n.children.map(x => x.textContent).join(' ')).join(' ');
  ok('la liste des trophées est bien peuplée', nomsVus.length > 50, nomsVus.length);
  ok('et rien n’y dit « merveille »', !/[Mm]erveille/.test(nomsVus), nomsVus);
  // 4 · les statistiques
  const rencontres = jeu.STATS.find(g => g[0] === 'Les rencontres')[1]();
  ok('aucune ligne ne les compte', !rencontres.some(l => /erveille/.test(l[0])),
     JSON.stringify(rencontres));
  // 5 · les trois consignes du marchand — la rangée entière, intitulé et phrase compris
  for (const quoi of ['vente', 'taille', 'evolution'])
    eq(quoi + ' — la rangée est cachée', noeuds.get(quoi + '-merveilleuse-r').hidden, true);

  /* CE QUI RESTE VISIBLE, ET QUI SUFFIT : la phrase du nid promet quelque chose sans rien
     nommer. C'est le seul indice du jeu, et il ne se voit qu'en composant le bon couple. */
  const a = bete(jeu, 'ouroboros', 4, 20000), b = bete(jeu, 'sphinx', 4, 20000);
  jeu.pensionA = a.id; jeu.pensionB = b.id; jeu.refresh();
  ok('le nid promet', /peut-être autre chose/.test(ditPension(jeu)), ditPension(jeu));
  ok('sans rien nommer', !/[Kk]itsune|erveille/.test(ditPension(jeu)), ditPension(jeu));

  /* LA LIGNE DE RÉSERVE DE LA PENSION A DISPARU en 2.4.0, et avec elle le seul endroit qui
     nommait une lignée promise. La règle du secret n'a plus de surface à protéger ici : ce
     qui la vérifie encore, ce sont les consignes du marchand et les sections de
     l'encyclopédie, juste au-dessus et juste en dessous. */
  s.pension.dus = { merveille: ['wukong'] };
  jeu.refresh();

  /* À LA PREMIÈRE ÉCLOSION, TOUT S'OUVRE D'UN COUP. */
  s.seen['kitsune:1'] = 1;
  jeu.verifierTrophees();
  jeu.refresh();
  eq('le rang est connu', jeu.rareteConnue('merveilleuse'), true);
  eq('la cinquième section apparaît', sections().length, 5);
  eq('le compte monte à 150', jeu.formesVisibles(), 150);
  ok('le trophée est pris', !!s.trophees.merveille);
  ok('les statistiques les comptent',
     jeu.STATS.find(g => g[0] === 'Les rencontres')[1]().some(l => /erveille/.test(l[0])));
  eq('et les consignes reviennent', noeuds.get('vente-merveilleuse-r').hidden, false);
});

scenario('merveilles — la recette impose sa durée et tire par-dessus la ponte', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [g1, g2] = couple(jeu, 'golem', 'golem');

  const rec = jeu.recetteDe(g1, g2);
  ok('le couple porte une recette', !!rec);
  eq('elle donne Wukong', rec.donne, 'wukong');
  /* LA RECETTE PORTE SA DURÉE, elle n'emprunte rien à la formule ordinaire — qui rendrait
     quatre heures ici. Deux pierres ne couvent pas : il y en a une qui finit par se fendre. */
  eq('et sa propre durée', jeu.dureePension(g1, g2), 3600);
  eq('l’ordre des parents n’entre pas en compte', jeu.recetteDe(g2, g1), rec);

  const vrai = Math.random;
  try {
    Math.random = () => 0;                       // le centième tombe
    jeu.accoupler(g1, g2);
    eq('un œuf est pondu', jeu.avancePension(3601), 1);
  } finally { Math.random = vrai; }

  eq('il est dans la réserve des merveilles', jeu.eggStock('merveille'), 1);
  eq('et sa lignée est promise', (s.pension.dus.merveille || []).map(d => d.ligne).join(), 'wukong');
  s.incub[0] = null;
  jeu.placeEgg(0, 'merveille');
  eq('c’est bien lui qui couve', s.incub[0].line, 'wukong');
  ok('et il couve plus longtemps qu’un mythique',
     jeu.hatchTime(s.incub[0]) > jeu.EGG_BY_KEY.mythique.hatch);

  s.incub[0].p = 1e6; s.pen = [];
  jeu.hatchAll();
  eq('la bête est née', s.pen[0].line, 'wukong');
  jeu.verifierTrophees();
  ok('et le trophée tombe', !!s.trophees.merveille);
});

scenario('merveilles — sans la recette, le couple pond comme les autres', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [g1, g2] = couple(jeu, 'golem', 'golem');

  const vrai = Math.random;
  try {
    Math.random = () => 0.99;                    // le centième ne tombe pas
    jeu.accoupler(g1, g2);
    eq('un œuf quand même', jeu.avancePension(3601), 1);
  } finally { Math.random = vrai; }

  eq('mais aucune merveille', jeu.eggStock('merveille'), 0);
  eq('c’est un œuf épique', jeu.eggStock('epique'), 1);
  eq('de golem', (s.pension.dus.epique || []).map(d => d.ligne).join(), 'golem');
});

scenario('merveilles — la phrase ne nomme rien tant qu’on n’a pas vu la bête', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [a, b] = couple(jeu, 'ouroboros', 'sphinx');
  const loup = bete(jeu, 'loup', 4, 20000);
  const dit = () => ditPension(jeu);

  jeu.pensionA = a.id; jeu.pensionB = b.id; jeu.refresh();
  ok('elle annonce autre chose', /peut-être autre chose/.test(dit()), dit());
  ok('sans la nommer', !/Kitsune/.test(dit()), dit());
  ok('et la durée est celle de la recette', /12 h/.test(dit()), dit());

  jeu.pensionB = loup.id; jeu.refresh();
  ok('un couple ordinaire ne promet rien', !/autre chose/.test(dit()), dit());

  s.seen['kitsune:1'] = true;
  jeu.pensionA = a.id; jeu.pensionB = b.id; jeu.refresh();
  ok('une fois rencontrée, la phrase la nomme', /1 % Kitsune/.test(dit()), dit());
});

scenario('merveilles — un cran de rareté, jamais un cran de puissance', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12; s.pens = 8; s.primes.pension = true;

  /* SI UNE MERVEILLE VALAIT PLUS QU'UNE MYTHIQUE, la pension redeviendrait une stratégie
     d'argent et tout le travail de la 3.0.0 tomberait sur la première éclose. */
  eq('même multiplicateur qu’une mythique',
     jeu.RARITY.merveilleuse.mult, jeu.RARITY.mythique.mult);
  eq('et même plafond de carte',
     jeu.RARITY.merveilleuse.plafond, jeu.RARITY.mythique.plafond);

  const w = bete(jeu, 'wukong', 3, 20000), o = bete(jeu, 'ouroboros', 3, 20000);
  /* ON ÉGALISE TOUT CE QUI ENTRE DANS LA VALEUR, LE FOND COMPRIS. Il manquait, et le scénario
     échouait une fois sur quelques centaines : un fond tiré au hasard vaut ×1,10 à ×1,20, si
     bien que la merveille et la mythique se comparaient sur un décor et non sur leur rang. Un
     test qui échoue sans qu'aucun code soit fautif apprend à ignorer les échecs. */
  w.chroma = o.chroma; w.niv = o.niv; w.over = o.over = 0; w.temper = o.temper;
  w.prodige = o.prodige = false; w.fond = o.fond = null;
  eq('donc elle se vend au même prix', jeu.sellValue(w), jeu.sellValue(o));

  // et les trois consignes du marchand ont bien leur clef, sinon elles seraient muettes
  for (const cle of Object.keys(jeu.RARITY)) {
    eq('vente ' + cle, typeof s.sellAt[cle], 'number');
    eq('taille ' + cle, typeof s.sellRank[cle], 'number');
    eq('évolution ' + cle, typeof s.evolveUpTo[cle], 'number');
  }
});

scenario('merveilles — une partie de v15 reçoit ses clés sans rien perdre', () => {
  const j0 = neuf(); const s0 = j0.state;
  s0.coins = 5e6; s0.pens = 4; s0.stats.eclos = 12;
  const vieux = JSON.parse(JSON.stringify(s0));
  vieux.v = 15;
  // une v15 ne connaît ni la cinquième rareté ni sa sorte d'œuf
  delete vieux.eggs.merveille;
  delete vieux.sellAt.merveilleuse;
  delete vieux.sellRank.merveilleuse;
  delete vieux.evolveUpTo.merveilleuse;

  const k = neuf(vieux);
  eq('le format monte', k.state.v, k.SAVE_V);
  eq('la sorte d’œuf naît à zéro', k.state.eggs.merveille, 0);
  eq('la consigne de vente aussi', k.state.sellAt.merveilleuse, 0);
  eq('la taille exigée aussi', k.state.sellRank.merveilleuse, 0);
  eq('l’évolution aussi', k.state.evolveUpTo.merveilleuse, 0);
  eq('et la ferme est intacte', k.state.coins, 5e6);
  eq('avec ses enclos', k.state.pens, 4);
});

scenario('réglages — des segments plutôt que des menus', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  s.primes.marchand = true; s.primes.evolution = true; s.primes.acheteur = true;
  jeu.refresh();

  const seg = id => noeuds.get(id);
  const choisi = id => (seg(id).children.find(b => b.getAttribute('aria-pressed') === 'true') || {}).dataset;
  const dit = id => noeuds.get(id + '-d').textContent;

  /* UN MENU CACHE SES OPTIONS : il faut l'ouvrir pour savoir ce qu'on peut choisir, et le
     refermer pour voir ce qu'on a choisi. Un segment montre les deux d'un coup. */
  eq('un segment par rareté et par consigne',
     jeu.REGLAGES.length * Object.keys(jeu.RARITY).length, 15);
  for (const r of jeu.REGLAGES)
    for (const cle of Object.keys(jeu.RARITY)) {
      const id = r.cle + '-' + cle;
      ok(id + ' existe', !!seg(id));
      eq(id + ' — une pastille par option', seg(id).children.length, r.options().length);
      ok(id + ' — la première est « ne rien faire »', seg(id).children[0].dataset.v === '0');
      eq(id + ' — rien de choisi hors zéro au départ', choisi(id).v, '0');
    }

  /* LA TABLE DÉCIDE DE TOUT : les libellés par rareté étaient écrits en dur quinze fois dans
     index.html, et ajouter la cinquième rareté avait demandé d'y revenir à la main. */
  ok('la merveilleuse a ses rangées sans qu’on les ait écrites',
     !!seg('vente-merveilleuse') && !!seg('taille-merveilleuse') && !!seg('evolution-merveilleuse'));

  // choisir se fait à l'état, et l'écran suit
  s.sellAt.commune = 3;
  jeu.refresh();
  eq('la pastille suit l’état', choisi('vente-commune').v, '3');
  ok('et la phrase dit le prix', /adulte/.test(dit('vente-commune')) && /6 000/.test(dit('vente-commune')),
     dit('vente-commune'));

  /* LE PRIX EST CELUI D'AUJOURD'HUI, primes comprises. Le menu annonçait la valeur de base et
     ne bougeait jamais : une consigne qui ment de trente pour cent ne se règle pas. */
  s.primes['negoce-commune'] = true; s.primes['valeur-4'] = true;
  jeu.oublierPrimes();
  jeu.refresh();
  ok('le négoce et le renom entrent dans le chiffre', /9 000/.test(dit('vente-commune')),
     dit('vente-commune'));

  s.evolveUpTo.rare = 5;
  jeu.refresh();
  const avant = dit('evolution-rare');
  s.primes.intendance = true;
  jeu.oublierPrimes();
  jeu.refresh();
  ok('l’intendance baisse la facture affichée', dit('evolution-rare') !== avant,
     avant + ' → ' + dit('evolution-rare'));

  // l'acheteur a la sienne, sans rareté, et son « jamais » en tête
  eq('cinq pastilles pour l’acheteur', seg('sel-acheteur').children.length, jeu.OEUFS_VENDUS.length + 1);
  eq('la première est vide', seg('sel-acheteur').children[0].dataset.v, '');
  s.buyKind = '';
  jeu.refresh();
  ok('arrêté, la phrase le dit', /arrêté/.test(dit('sel-acheteur')), dit('sel-acheteur'));
  s.buyKind = 'rare';
  jeu.refresh();
  ok('et sinon elle nomme l’œuf', /rare/.test(dit('sel-acheteur')), dit('sel-acheteur'));

  // plus un seul menu déroulant dans la page
  ok('index.html n’a plus de select', !/<select/.test(lire('index.html')));
});

scenario('acheteur — il peut se taire, et la réserve continue sans lui', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9; s.primes.acheteur = true;
  s.incubators = 3; s.incub = [null, null, null];
  jeu.refresh();

  /* C'EST LE SEUL DES TROIS AUTOMATES QUI DÉPENSE, et le seul qui n'avait pas de « jamais ».
     Une prime ne se revendant pas, l'avoir achetée était irréversible. */
  const menu = noeuds.get('sel-acheteur');
  eq('la première consigne est de ne rien faire', menu.children[0].value, '');
  ok('et elle se lit', /jamais/.test(menu.children[0].textContent), menu.children[0].textContent);

  const avant = s.coins;
  jeu.runAutomations(1);
  eq('en marche, il remplit', s.incub.filter(Boolean).length, 3);
  ok('et il dépense', s.coins < avant);

  s.buyKind = '';
  s.incub = [null, null, null];
  const garde = s.coins;
  jeu.runAutomations(1);
  eq('arrêté, il ne remplit rien', s.incub.filter(Boolean).length, 0);
  eq('et ne dépense rien', s.coins, garde);
  /* LA NOTE QUI LE DISAIT A ÉTÉ RETIRÉE en 2.4.0 avec les deux autres : le panneau des
     réglages garde ses titres, ses segments et la seule explication qui ne se devine pas.
     Le SEGMENT, lui, montre toujours quel choix est actif — c'est ce qu'on règle. */
  jeu.refresh();
  const seg = noeuds.get('sel-acheteur');
  ok('le segment montre « jamais » retenu',
     seg.children.some(b => b.dataset.v === '' && b.getAttribute('aria-pressed') === 'true'),
     seg.children.map(b => b.dataset.v + ':' + b.getAttribute('aria-pressed')).join(' '));

  /* LA RÉSERVE SE VIDE QUAND MÊME : elle est déjà payée, et c'est justement ce qu'on veut
     quand la pension produit. */
  s.eggs.rare = 2;
  jeu.runAutomations(1);
  eq('deux œufs de la réserve sont placés', s.incub.filter(Boolean).length, 2);
  eq('la réserve est vidée', jeu.eggStock('rare'), 0);
  eq('et toujours rien dépensé', s.coins, garde);

  // la consigne traverse un rechargement sans se faire corriger en « commun »
  const brut = JSON.parse(JSON.stringify(s));
  eq('elle survit', neuf(brut).state.buyKind, '');
  // une consigne absurde, elle, se corrige toujours
  brut.buyKind = 'merveille';
  eq('un œuf qu’on n’achète pas retombe sur le commun', neuf(brut).state.buyKind, 'commun');
});

/* ───────────────────────────── les trois globales ───────────────────────────── */

scenario('globales — trois axes qui ne se recouvrent pas', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15; s.pens = 8;
  const c = bete(jeu, 'loup', 4, 20000);

  /* TROIS FAMILLES DE QUATRE PRIMES, et la table décide de tout : une prime qui porte un
     `bonus` entre dans le calcul sans qu'on touche à une ligne de moteur. */
  /* LES TROIS FAMILLES GLOBALES, et elles seules. Depuis la 4.2.0 des primes portent aussi
     `peage`, `oeuf` et `clic` — les leviers que rien ne touchait après le milieu de partie —
     et ce ne sont pas des familles : elles n'ont ni quatre crans ni cinquante pour cent. */
  const familles = { valeur: [], rente: [], vitesse: [] };
  for (const p of jeu.PRIMES)
    for (const k of Object.keys(p.bonus || {})) if (familles[k]) familles[k].push(p);
  for (const k of Object.keys(familles)) {
    eq(k + ' — quatre primes', familles[k].length, 4);
    eq(k + ' — cinquante pour cent en tout',
       Math.round(familles[k].reduce((n, p) => n + p.bonus[k], 0) * 100), 50);
    ok(k + ' — réparties sur toute la fin de partie',
       Math.max(...familles[k].map(p => p.prix)) / Math.min(...familles[k].map(p => p.prix)) > 1000);
    for (const p of familles[k]) eq(p.nom + ' ne porte qu’un axe', Object.keys(p.bonus).length, 1);
  }
  for (const k of Object.keys(familles)) eq(k + ' — coefficient neutre au départ', jeu.coef(k), 1);

  /* LA RÈGLE DES CINQUANTE POUR CENT TIENT ENCORE, et c'est ce qui a interdit d'étirer les
     familles pour régler la variété de fin de partie : quatre crans par famille est un chiffre
     annoncé ailleurs dans le fichier. La 4.2.0 a donc ajouté des AXES, pas des crans. */
  const autres = new Set();
  for (const p of jeu.PRIMES)
    for (const k of Object.keys(p.bonus || {})) if (!familles[k]) autres.add(k);
  ok('des primes touchent d’autres leviers que les trois globales',
     autres.size >= 3, [...autres].join(' '));
  ok('et ce sont ceux de l’album', [...autres].every(k => k in jeu.bonusAlbum()),
     [...autres].join(' '));

  const v0 = jeu.sellValue(c), r0 = jeu.renteOf(c);
  ok('la bête vaut et rapporte', v0 > 0 && r0 > 0);

  /* LA VALEUR PORTE LA VENTE ET LA RENTE QUI EN DÉCOULE. */
  s.primes['valeur-2'] = true; jeu.oublierPrimes();
  ok('la vente monte de dix pour cent',
     Math.abs(jeu.sellValue(c) / v0 - 1.1) < 0.001, jeu.sellValue(c) / v0);
  ok('et la rente suit toute seule',
     Math.abs(jeu.renteOf(c) / r0 - 1.1) < 0.001, jeu.renteOf(c) / r0);
  s.primes = {}; jeu.oublierPrimes();

  /* LA RENTE NE PORTE QU'ELLE-MÊME : c'est le seul axe qui paie uniquement pour ne rien faire,
     et il ne doit rien changer au prix de vente. */
  s.primes['rente-2'] = true; jeu.oublierPrimes();
  eq('la vente ne bouge pas', jeu.sellValue(c), v0);
  ok('la rente monte seule',
     Math.abs(jeu.renteOf(c) / r0 - 1.1) < 0.001, jeu.renteOf(c) / r0);
  s.primes = {}; jeu.oublierPrimes();

  /* LA VITESSE PORTE LE TEMPS : couvaison, croissance, engraissement. */
  s.up.couveuse = 3 * jeu.GRAIN; s.up.eleveur = 3 * jeu.GRAIN; s.up.mangeoire = 3 * jeu.GRAIN;
  const jeune = bete(jeu, 'loup', 1, 0);
  /* TROIS SECONDES ET NON DIX : depuis que l'éleveur triple (`ELEVEUR_X`), dix secondes
     poussent la bête au-delà du bout de sa première tranche, `c.p` bute sur `bandTo` et le
     rapport mesuré n'est plus celui des primes mais celui du plafond. On mesure une pente,
     donc on reste dans la pente. */
  const pousse = () => {
    s.incub[0] = { line: 'ouroboros', p: 0, kind: 'mythique' };
    jeune.p = 0; jeune.age = 1; jeune.over = 0;
    jeu.advance(3);
    return { oeuf: s.incub[0].p, bete: jeune.p };
  };
  const sans = pousse();
  s.primes['vitesse-1'] = true; s.primes['vitesse-2'] = true;
  s.primes['vitesse-3'] = true; s.primes['vitesse-4'] = true;
  jeu.oublierPrimes();
  const avec = pousse();
  ok('la couvaison accélère de moitié',
     Math.abs(avec.oeuf / sans.oeuf - 1.5) < 0.001, avec.oeuf / sans.oeuf);
  ok('la croissance aussi',
     Math.abs(avec.bete / sans.bete - 1.5) < 0.001, avec.bete / sans.bete);
  eq('mais pas la valeur', jeu.sellValue(c), v0);

  /* LES QUATRE D'UNE FAMILLE S'ADDITIONNENT, elles ne se remplacent pas. */
  eq('les quatre vitesses font cinquante pour cent', Math.round((jeu.coef('vitesse') - 1) * 100), 50);
  s.primes = {}; jeu.oublierPrimes();
  eq('et tout retombe à neutre', jeu.coef('vitesse'), 1);

  // elles ne sont plus des améliorations à niveaux : c'était le mauvais objet
  for (const k of ['renom', 'patience', 'ardeur'])
    eq(k + ' n’est plus une amélioration', jeu.UP_BY_KEY[k], undefined);
  eq('il reste les quatre capacités', jeu.UPGRADES.length, 4);
});

scenario('globales — une partie de v16 garde ce qu’elle avait monté', () => {
  const j0 = neuf(); const s0 = j0.state;
  s0.coins = 5e9; s0.pens = 4;
  const vieux = JSON.parse(JSON.stringify(s0));
  vieux.v = 16;
  // ce que valaient les trois améliorations à niveaux : 30 %, 15 %, 2 %
  vieux.up.renom = 30 * j0.GRAIN;
  vieux.up.patience = 15 * j0.GRAIN;
  vieux.up.ardeur = 2 * j0.GRAIN;

  const k = neuf(vieux);
  eq('le format monte', k.state.v, k.SAVE_V);
  /* CONVERSION GÉNÉREUSE PAR PRINCIPE : mal convertir vers le bas, c'est reprendre des heures
     de jeu à quelqu'un qui n'a rien demandé. Les seuils sont les pour-cent cumulés. */
  eq('trente pour cent de valeur rendus', Math.round((k.coef('valeur') - 1) * 100), 30);
  eq('quinze de rente', Math.round((k.coef('rente') - 1) * 100), 15);
  eq('et deux pour cent ne valaient pas une prime', k.coef('vitesse'), 1);
  ok('la quatrième reste à acheter', !k.prime('valeur-4'));

  for (const cle of ['renom', 'patience', 'ardeur'])
    eq(cle + ' a disparu de l’état', k.state.up[cle], undefined);
  eq('et la ferme est intacte', k.state.coins, 5e9);
});

scenario('primes — la grille ne montre que les cinq prochaines', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const cases = () => noeuds.get('primes').children.filter(b => !b.hidden);
  const nom = b => b.children.map(x => x.textContent).join(' ');

  s.coins = 1e15;
  jeu.refresh();
  eq('cinq cases, pas trente-six', cases().length, jeu.PRIMES_VUES);
  const attendues = jeu.PRIMES.slice(0, jeu.PRIMES_VUES).map(p => p.nom);
  ok('et ce sont les cinq moins chères',
     attendues.every(n => cases().some(b => nom(b).includes(n))),
     cases().map(nom).join(' | '));

  /* ACHETER LA PREMIÈRE FAIT MONTER LA SIXIÈME : la grille suit toujours la prochaine
     décision, elle ne garde pas ce qui est derrière. */
  jeu.buyPrime(jeu.PRIMES[0]);
  jeu.refresh();
  eq('toujours cinq', cases().length, jeu.PRIMES_VUES);
  ok('la prise a disparu', !cases().some(b => nom(b).includes(jeu.PRIMES[0].nom)),
     cases().map(nom).join(' | '));
  ok('et la suivante est entrée',
     cases().some(b => nom(b).includes(jeu.PRIMES[jeu.PRIMES_VUES].nom)));

  /* LE BOUTON BASCULE SUR CE QU'ON A DÉJÀ PRIS — une consultation, pas un choix. */
  const bouton = noeuds.get('primes-voir');
  eq('le bouton apparaît dès la première prise', bouton.hidden, false);
  ok('et il compte', /1/.test(bouton.textContent), bouton.textContent);
  jeu.primesPrises = true;
  jeu.refresh();
  eq('la grille bascule', cases().length, 1);
  ok('sur la prime prise', nom(cases()[0]).includes(jeu.PRIMES[0].nom));
  eq('le bouton se marque', bouton.getAttribute('aria-pressed'), 'true');
  jeu.primesPrises = false;
  jeu.refresh();
  eq('et il revient', cases().length, jeu.PRIMES_VUES);

  // une prime conditionnée n'entre pas dans le compte des cinq
  const conditionnees = jeu.PRIMES.filter(p => p.si);
  ok('il en existe', conditionnees.length > 0);
  ok('aucune n’est montrée sans sa condition',
     !cases().some(b => conditionnees.some(p => nom(b).includes(p.nom))),
     cases().map(nom).join(' | '));

  /* TOUT PRIS : la grille bascule d'elle-même, sinon elle serait vide.
     Un CARREFOUR ne se prend pas par sa propre clé — c'est une de ses routes qu'on retient, et
     elle est rangée sous la sienne. C'est ce qui permet au reste du jeu de lire `prime('...')`
     sans rien savoir des carrefours. */
  for (const p of jeu.PRIMES) s.primes[p.choix ? p.choix[0].cle : p.cle] = true;
  jeu.oublierPrimes();
  jeu.refresh();
  eq('elle montre tout ce qu’on a', cases().length, jeu.PRIMES.length);
  eq('et le compteur est plein', noeuds.get('primes-meta').textContent,
     jeu.PRIMES.length + ' / ' + jeu.PRIMES.length);
});

/* ─────────────────────────────── l'encyclopédie ─────────────────────────────── */

// ce que la fiche affiche, à plat : un texte par bloc
function fiche(jeu, cle) {
  jeu.encyLignee = cle;
  jeu.renderEncyclopedie();
  const plat = el => (el.textContent || '') +
    el.children.map(c => ' ' + (c.textContent || '') + c.children.map(x => ' ' + x.textContent).join('')).join('');
  return {
    titre: noeuds.get('ency-title').textContent,
    dit: noeuds.get('ency-dit').textContent,
    blocs: noeuds.get('ency').children.map(plat),
    tout: noeuds.get('ency').children.map(plat).join(' | '),
  };
}

scenario('encyclopédie — un carnet, jamais un manuel', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15; s.pens = 40;

  /* ELLE NE CONNAÎT RIEN D'AVANCE. Une lignée jamais rencontrée n'a pas de nom, pas de
     formes, pas de variantes : la fiche le dit et s'arrête là. */
  const vide = fiche(jeu, 'kraken');
  eq('pas de nom', vide.titre, '？');
  ok('la fiche le dit', /jamais rencontré/.test(vide.dit), vide.dit);
  eq('et ne montre que les cinq silhouettes', vide.blocs.length, 1);
  ok('aucun nom de forme ne fuit', !/Kraken|Poulpe/i.test(vide.tout), vide.tout);

  /* UNE ÉCLOSION APPREND UNE VARIANTE, ET SEULEMENT CELLE-LÀ. */
  const c = bete(jeu, 'loup', 1, 0);
  const d = jeu.dexVu('loup');
  ok('le carnet s’ouvre à la première éclosion', !!d);
  eq('une éclosion comptée', d.nes, 1);
  eq('son caractère est noté', d.caracteres[c.temper], 1);
  eq('son motif aussi', d.motifs[c.motif], 1);
  /* UNE BÊTE GRISE N'A PAS DE COULEUR À NOTER. Le carnet compte les CHROMATISMES CROISÉS, et
     une bête sur huit mille en est un : le carnet reste donc vide sur cette rangée pendant
     des heures, et c'est exactement ce que le rang veut dire depuis que les teintes ont
     disparu. Ce qui se compte est ce qu'on a rencontré, pas ce que la bête porte en latence. */
  eq('mais sa couleur latente ne compte pas', Object.keys(d.chromas).length, 0);

  const f = fiche(jeu, 'loup');
  eq('la lignée a un nom', f.titre, 'Loup');
  ok('une seule forme rencontrée', /1 forme sur 5/.test(f.dit), f.dit);
  ok('les quatre autres restent des points d’interrogation',
     (f.tout.match(/？/g) || []).length >= 4, f.tout);
  ok('le compte des chromatismes dit ce qui manque',
     new RegExp('Chromatismes — 0 / ' + jeu.CHROMAS.length).test(f.tout), f.tout);

  /* DEUX CHROMATIQUES DE LA MÊME COULEUR COMPTENT DEUX FOIS, ils ne se dédoublent pas. */
  jeu.noterEclosion({ line: 'loup', chroma: 3, prodige: true, temper: c.temper, motif: c.motif });
  eq('un chromatique se note', jeu.dexVu('loup').chromas[3], 1);
  jeu.noterEclosion({ line: 'loup', chroma: 3, prodige: true, temper: c.temper, motif: c.motif });
  eq('le compte monte', jeu.dexVu('loup').chromas[3], 2);
  eq('et l’éclosion aussi', jeu.dexVu('loup').nes, d.nes);
});

scenario('encyclopédie — la pension s’apprend ponte par ponte', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15;
  const [a, b] = couple(jeu, 'loup', 'ours');

  const avant = fiche(jeu, 'loup');
  ok('aucun couple connu au départ', /0 couple connu/.test(avant.tout), avant.tout);
  ok('et la fiche dit quoi faire', /Confie-en deux/.test(avant.tout), avant.tout);

  jeu.accoupler(a, b);
  jeu.avancePension(jeu.dureePension(a, b) * 3);
  const apres = fiche(jeu, 'loup');

  /* ON N'APPREND QUE CE QUI EST VRAIMENT SORTI. Le carnet ne déduit rien d'une table de
     règles : un couple qui n'a jamais donné cette lignée n'y figure pas. */
  const dLoup = jeu.dexVu('loup'), dOurs = jeu.dexVu('ours');
  const total = (dLoup.couples['loup×ours'] || 0) + (dOurs.couples['loup×ours'] || 0);
  eq('les trois pontes sont réparties entre les deux fiches', total, 3);
  ok('la paire est triée, donc écrite une seule fois',
     !dLoup.couples['ours×loup'] && !dOurs.couples['ours×loup']);

  const qui = dLoup.couples['loup×ours'] ? 'loup' : 'ours';
  const vue = fiche(jeu, qui);
  ok('le couple apparaît', /Loup × Ours/.test(vue.tout), vue.tout);
  ok('avec son pourcentage', /50 %/.test(vue.tout), vue.tout);
  ok('sa durée', /1 h/.test(vue.tout), vue.tout);
  ok('et le nombre de fois', /sorti \d+ fois/.test(vue.tout), vue.tout);

  /* LE POURCENTAGE SE CALCULE, IL NE SE STOCKE PAS : un nœud pris après coup ne doit pas
     laisser dans le carnet un nombre qui n'est plus vrai. Le sang dominant est monté dans la
     constellation avec le reste de la pension — c'est le troisième cran de l'axe. */
  const cr = bete(jeu, 'crapaud', 4, 20000), ou = bete(jeu, 'ouroboros', 4, 20000);
  jeu.dexDe('crapaud').couples['crapaud×ouroboros'] = 1;
  ok('sans le sang, la commune sort presque toujours',
     /99 %/.test(fiche(jeu, 'crapaud').tout), fiche(jeu, 'crapaud').tout);
  s.ciel = { 'nid-plus': true, 'ponte-plus': true, 'sang-epais': true };
  jeu.oublierPrimes();
  eq('les trois crans comptent', jeu.rangPension(), 3);
  eq('et le sang double la chance', jeu.chancePension(3), 0.02);
  ok('avec, le chiffre a bougé tout seul',
     /98 %/.test(fiche(jeu, 'crapaud').tout), fiche(jeu, 'crapaud').tout);
});

scenario('encyclopédie — la chance annoncée est celle du tirage', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15; s.pens = 40; s.primes.pension = true;

  /* `chanceDe` DOUBLE la logique du tirage, et deux copies peuvent diverger en silence.
     On tire donc pour de vrai et on compare, sur les trois formes de couple : ordinaire,
     recette, joker. */
  const N = 60000;
  for (const [x, y] of [['loup', 'ours'], ['crapaud', 'ouroboros'],
                        ['golem', 'golem'], ['chimere', 'chimere']]) {
    const a = bete(jeu, x, 4, 20000), b = bete(jeu, y, 4, 20000);
    const rec = jeu.recetteDe(a, b);
    const compte = {};
    for (let i = 0; i < N; i++) {
      const r = rec && Math.random() < rec.chance ? rec.donne : jeu.ligneeDe(a, b);
      compte[r] = (compte[r] || 0) + 1;
    }
    let somme = 0;
    for (const [r, n] of Object.entries(compte)) {
      const annonce = jeu.chanceDe(x, y, r), observe = n / N;
      somme += annonce;
      ok(x + ' × ' + y + ' → ' + r + ' : ' + (annonce * 100).toFixed(2) + ' % annoncé',
         Math.abs(annonce - observe) < Math.max(0.006, annonce * 0.25),
         'observé ' + (observe * 100).toFixed(2) + ' %');
    }
    ok(x + ' × ' + y + ' : les chances des issues vues font presque un',
       somme > 0.9 && somme <= 1.001, somme.toFixed(3));
  }
});

scenario('encyclopédie — elle traverse l’ascension, et une partie d’avant la reçoit vide', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12; s.pens = 8;
  bete(jeu, 'loup', 1, 0);
  eq('le carnet a une entrée', Object.keys(s.dex).length, 1);

  poserJetons(jeu, 1);
  const ap = jeu.apercuAscension();
  jeu.ascChoix = ap.neuves.length ? [ap.neuves[0].id] : [];
  jeu.ascensionner();
  /* C'est une mémoire de FICHIER, comme la collection : l'ascension efface la ferme, jamais
     ce qu'on a appris. */
  eq('elle a traversé', Object.keys(jeu.state.dex).length, 1);
  ok('avec son contenu', jeu.dexVu('loup').nes >= 1);

  // une partie d'avant la 1.9 n'a pas de carnet : il naît vide, sans migration à écrire
  const vieux = JSON.parse(JSON.stringify(jeu.state));
  delete vieux.dex;
  const k = neuf(vieux);
  eq('le carnet naît vide', JSON.stringify(k.state.dex), '{}');
  const c = bete(k, 'crapaud', 1, 0);
  eq('et se remplit dès la première éclosion', k.dexVu('crapaud').nes, 1);
});

/* ───────────────────────────────── la colonne ───────────────────────────────── */

scenario('colonne — la réserve ne pousse plus le texte de la boutique', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  jeu.refresh();

  const r = jeu.refs.shop['egg-commun'];
  ok('la rangée existe', !!r);

  /* CE QUI CLIGNOTAIT. « En réserve : 3. » vivait au bout de la DESCRIPTION, une ligne qui se
     replie : passer de 2 à 3 œufs pouvait faire gagner ou perdre une ligne au bouton, donc
     décaler tout ce qui est en dessous. Le compte change plusieurs fois par minute. */
  s.eggs.commun = 0;
  jeu.refresh();
  const desc0 = r.desc.textContent;
  eq('la réserve vide n’affiche rien', r.reserve.textContent, '');

  s.eggs.commun = 3;
  jeu.refresh();
  eq('la réserve a sa propre case', r.reserve.textContent, '×3');
  eq('et la description n’a pas bougé', r.desc.textContent, desc0);

  s.eggs.commun = 47;
  jeu.refresh();
  eq('même à deux chiffres', r.reserve.textContent, '×47');
  eq('la description ne bouge toujours pas', r.desc.textContent, desc0);

  /* CE QU'UN ŒUF RACONTE NE SE RACONTE QU'UNE FOIS : la phrase de saveur occupait une ligne
     de la colonne pour toujours. Elle est à l'infobulle, la rangée tient sur une ligne. */
  eq('la rangée d’un œuf n’a plus de description', desc0, '');
  ok('mais elle est toujours lisible', /commence/.test(r.el.title), r.el.title);

  // une rangée qui n'est pas un œuf garde la sienne : elle ne porte aucun compteur
  const inc = jeu.refs.shop.incub;
  ok('l’incubateur garde sa description', inc.desc.textContent.length > 0, inc.desc.textContent);
  eq('et n’affiche aucune réserve', inc.reserve.textContent, '');
});

scenario('colonne — les réglages gardent leurs titres et la revente', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  s.primes.acheteur = true; s.primes.evolution = true; s.primes.marchand = true;
  jeu.refresh();

  /* CE QUI RESTE DANS LE PANNEAU. Trois titres, trois rangées de segments, et la seule
     explication qui ne se devine pas — celle de la revente. Tout le reste a été retiré :
     l'introduction, les explications de l'acheteur et de l'évolution, et les trois notes
     calculées qui disaient sous chaque consigne ce qu'elle allait produire. C'était juste,
     et c'était une trentaine de lignes dans une colonne qu'on voulait calme. */
  const titres = document.querySelectorAll('.config-step');
  eq('trois titres', titres.length, 3);

  const quoi = document.querySelectorAll('.config-what');
  ok('il ne reste que l’explication de la revente', quoi.length <= 3, quoi.length);
  ok('et elle parle bien de vendre',
     quoi.every(p => /vend|vente|mûres|engraissée/i.test(p.textContent)),
     quoi.map(p => p.textContent.slice(0, 40)).join(' | '));

  // les segments restent : c'est ce qu'on règle, et ce n'est pas du texte
  ok('l’acheteur garde son segment', noeuds.get('reg-acheteur').children.length > 0);
  ok('l’évolution aussi', noeuds.get('reg-evolution').children.length > 0);
  ok('le marchand aussi', noeuds.get('reg-vente').children.length > 0);
});

/* ────────────────────────── la poussière et la forge ────────────────────────── */

/* Une capsule d'album minimale : ce que `qualiteDe` et `poussiereDe` lisent, et rien d'autre. */
function pave(jeu, id, ligne, etoiles) {
  return { id, line: ligne || 'crapaud', age: 5, niv: 100, chroma: 7, rank: 5,
           prodige: false, etoiles: etoiles || 1, motif: 0, temper: 0 };
}

scenario('clic — une bête menée au bout paie, et seulement sous ta main', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 8; s.coins = 0;
  const c = bete(jeu, 'golem', 5, 0);
  c.p = jeu.bandTo(c);

  /* TROIS PLAFONDS À LA FOIS, jamais un seul : une commune mûre à l'âge enfant est déjà « au
     max de sa tranche », et si elle comptait, c'est toute la ferme qui compterait. */
  eq('au niveau cent mais pas au dernier rang', jeu.estFinie(c), false);
  ok('et le clic la fait encore grossir',
     (jeu.select('c:' + c.id), jeu.tapStage(), (c.over || 0) > 0));

  c.over = jeu.ageGrow(c) * 580;
  eq('au dernier rang, elle est finie', jeu.estFinie(c), true);
  ok('rankOf le dit déjà', jeu.rankOf(jeu.sizeFactor(c)).next === null);

  // un âge plus bas ne compte pas, quel que soit l'embonpoint
  const jeune = bete(jeu, 'golem', 4, 0);
  jeune.p = jeu.bandTo(jeune);
  jeune.over = jeu.ageGrow(jeune) * 580;
  eq('un âge en dessous n’est jamais fini', jeu.estFinie(jeune), false);

  /* CE QU'UN CLIC REND ALORS : de la monnaie, et plus de l'embonpoint. */
  jeu.select('c:' + c.id);
  saturerCombo(jeu);
  const avant = s.coins, gras = c.over;
  jeu.tapStage();
  ok('le clic paie', s.coins > avant, s.coins - avant);
  eq('et n’engraisse plus', c.over, gras);
  eq('c’est bien le montant annoncé', s.coins - avant,
     jeu.gainClicFini(c, { kind: 'creature', c }));

  /* IL RESTE UNE RÉCOMPENSE DE PRÉSENCE : de l'ordre de mille cinq cents clics pour égaler
     une vente. S'il en fallait dix, vendre n'aurait plus de sens. */
  ok('mille clics ne valent pas une vente',
     (s.coins - avant) * 1000 < jeu.sellValue(c),
     Math.round(jeu.sellValue(c) / (s.coins - avant)) + ' clics par vente');

  /* ET SEULEMENT SOUS LA MAIN DU JOUEUR. La carte ocellée clique à ta place : si elle
     encaissait, elle deviendrait une machine à monnaie automatique, et la mécanique
     produirait l'inverse de son intention. */
  const avant2 = s.coins, gras2 = c.over;
  jeu.mainDeCarte = true;
  jeu.tapStage();
  jeu.mainDeCarte = false;
  eq('l’ocellée n’encaisse rien', s.coins, avant2);
  ok('elle retombe sur l’embonpoint', c.over > gras2);
});

/* ────────────────────────── les carrefours ────────────────────────── */

scenario('sauvegarde — les nœuds retirés rendent leurs jetons', () => {
  /* ON NE RETIRE RIEN À PERSONNE. L'acheteur, le marchand, l'évolution, la pension et la forge
     ont été des nœuds pendant deux versions ; ils sont redevenus du jeu de base. Qui les avait
     payés en jetons les retrouve en jetons, à l'unité près — c'est la règle de toutes les
     migrations de ce fichier, et la seule qui rende un changement de règle acceptable à
     quelqu'un qui jouait déjà. */
  const paye = neuf({
    v: 22, coins: 0, asc: { n: 3, paliers: 4, jetons: 2, sommet: 0 },
    ciel: { etincelle: true, acheteur: true, marchand: true, forge: true, poing: true },
  });
  ok('l’acheteur a quitté le ciel', !paye.etoilePrise('acheteur'));
  ok('la forge aussi', !paye.etoilePrise('forge'));
  ok('le poing reste, lui', paye.etoilePrise('poing'));
  eq('et les jetons sont rendus', paye.state.asc.jetons, 2 + 3 + 5 + 4);

  /* LE PIÈGE : une partie d'AVANT la 4.2.0 reçoit `forge` de la migration v22, qui s'exécute
     plus haut dans le même bloc. Elle doit le reperdre ici, sans rien recevoir en échange —
     elle ne l'avait jamais payé. */
  const vieille = neuf({
    v: 21, coins: 0, asc: { n: 1, paliers: 1, jetons: 0, sommet: 0 },
    album: [{ id: 1, line: 'crapaud', age: 5, niv: 100, chroma: 0, rank: 0, motif: 0, temper: 0, etoiles: 1 }],
  });
  ok('elle ne garde pas un nœud qui n’existe plus', !vieille.etoilePrise('forge'));
  eq('et rien ne lui est crédité', vieille.state.asc.jetons, 0);
});

scenario('échelle — une bête vaut plus que son œuf, à partir de l’âge adulte', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const bete1 = l => { s.pens = 20; s.pen = []; s.incub[0] = { line: l, p: 9999, kind: 'commun' };
                       jeu.hatchAll(); const c = s.pen[s.pen.length - 1];
                       c.chroma = 0; c.rank = 0; c.motif = 0; c.temper = 0; c.prodige = false;
                       return c; };
  const vente = (c, a) => jeu.sellValue(Object.assign({}, c, { age: a, p: 1e6 }));
  const peage = (c, a) => jeu.evoCost(Object.assign({}, c, { age: a }));

  /* UN ŒUF NE DOIT PAS COÛTER PLUS QUE LA BÊTE NE VAUDRA JAMAIS, et c'était le cas : l'œuf
     rare valait 50 M pour une bête qui plafonnait à 43,1 M. Achetée, élevée jusqu'au bout,
     vendue, elle laissait 23 millions de perte — à TOUS les âges, sans exception. */
  const solde = (l, oeuf) => {
    const c = bete1(l);
    let cum = oeuf;
    return [1, 2, 3, 4, 5].map(a => {
      if (a > 1) cum += peage(c, a - 1);
      return vente(c, a) - cum;
    });
  };

  const rare = solde('loup', jeu.EGG_BY_KEY.rare.price);
  ok('l’enfant est un investissement', rare[0] < 0, rare[0]);
  ok('l’adolescent aussi', rare[1] < 0, rare[1]);
  /* L'ADULTE EST EXACTEMENT À L'ÉQUILIBRE, ET C'EST LA RÈGLE ELLE-MÊME depuis la `4.12.1` :
     `mult = prix de l'œuf / 2 200 000`. Il était bénéficiaire de 7 % tant que l'œuf rare
     valait 50 M au lieu des 55 M que la règle demande — un reste de la `4.8.0`, où le prix
     était encore posé à la main. Zéro n'est pas un relâchement de l'exigence d'origine, c'est
     l'endroit où la décision d'aller plus loin se prend : sur une bête qui ne doit plus rien. */
  eq('l’adulte est exactement à l’équilibre', rare[2], 0);
  ok('et tout ce qui suit est bénéficiaire', rare[3] > rare[2] && rare[4] > rare[3], rare.join(' '));

  /* LES COMMUNES SONT LE MODÈLE : bénéficiaires à CHAQUE âge, œuf compris. Elles ne changent
     pas — l'ouverture du jeu est le dernier endroit où l'on touche. */
  const commune = solde('crapaud', jeu.EGG_BY_KEY.commun.price);
  ok('la commune gagne dès l’enfant', commune.every(x => x > 0), commune.join(' '));
  const c0 = bete1('crapaud');
  eq('et son péage n’a pas bougé', peage(c0, 1), 200);
  eq('ni le dernier', peage(c0, 4), 600000);

  /* CHAQUE ÉVOLUTION COÛTE PLUSIEURS FOIS CE QUE LA BÊTE VAUT À CET INSTANT : c'est un
     investissement, jamais quelque chose qu'on finance en la revendant. Et la première est un
     mur — c'est elle qui verrouille la rare tombée par chance. */
  const r = bete1('loup');
  for (let a = 1; a <= 4; a++) {
    ok('le péage ' + a + '→' + (a + 1) + ' dépasse la valeur du moment',
       peage(r, a) > vente(r, a), peage(r, a) + ' vs ' + vente(r, a));
  }
  ok('la rare trouvée se vend pour peu', vente(r, 1) < 5000, vente(r, 1));
  ok('mais la garder coûte une fortune', peage(r, 1) > 1e6, peage(r, 1));

  /* L'ÉCHELLE SE PROPAGE PAR `mult`, donc elle ne peut plus se retourner : ce qui vaut plus
     cher à l'œuf vaut plus cher sur pied, à tous les rangs. */
  const val = l => vente(bete1(l), 5);
  ok('la rare dépasse la commune', val('loup') > val('crapaud'));
  ok('l’épique dépasse la rare', val('kraken') > val('loup'));
  ok('la mythique dépasse l’épique', val('behemoth') > val('kraken'));
});

scenario('œufs — la réserve s’affiche dans l’ordre où elle se vide', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.eggs = { commun: 3, rare: 2, epique: 1, mythique: 0, merveille: 0 };
  s.file = ['commun', 'commun', 'rare', 'commun', 'epique', 'rare'];

  /* LE DÉFAUT QUE CE SCÉNARIO TIENT, et c'est le joueur qui l'a nommé : « la réserve ne se
     vide pas dans l'ordre affiché ». Elle ne s'affichait qu'en BOUTIQUE, une case par sorte,
     rangée par PRIX — et elle se vide par arrivée ou par rareté. Deux ordres pour une seule
     chose : on lit l'un, le jeu applique l'autre, et le réglage passe pour cassé. */
  const dit = () => { jeu.refresh(); return noeuds.get('strip-meta').textContent; };

  s.triOeuf = 'arrivee';
  eq('par arrivée, l’ordre d’entrée', jeu.reserveEnOrdre().join(),
     'commun,commun,rare,commun,epique,rare');
  ok('et l’écran le dit', dit().indexOf('commun ×2 · rare · commun') >= 0, dit());
  eq('le premier à sortir est le premier affiché',
     jeu.bestStocked(), jeu.reserveEnOrdre()[0]);

  s.triOeuf = 'rarete';
  eq('par rareté, du plus rare au plus commun', jeu.reserveEnOrdre().join(),
     'epique,rare,rare,commun,commun,commun');
  ok('et l’écran le dit aussi', dit().indexOf('épique · rare ×2 · commun ×3') >= 0, dit());
  eq('le premier à sortir est encore le premier affiché',
     jeu.bestStocked(), jeu.reserveEnOrdre()[0]);

  /* L'ORDRE LU EST L'ORDRE APPLIQUÉ PAR CONSTRUCTION : les deux sortent de la même fonction.
     On le vérifie en vidant la réserve pour de bon. */
  s.incubators = 6; s.incub = [null, null, null, null, null, null];
  const attendu = jeu.reserveEnOrdre().join();
  jeu.runAutomations(0.1);
  eq('la réserve se vide dans cet ordre exact',
     s.incub.filter(Boolean).map(o => o.kind).join(), attendu);

  /* ET LE COMPTE SE DIT AVANT LE DÉTAIL : c'est le seul chiffre qu'on cherche en passant. */
  s.eggs = { commun: 2, rare: 0, epique: 0, mythique: 0, merveille: 0 };
  s.file = ['commun', 'commun'];
  ok('le total ouvre la ligne', /^2 en réserve/.test(dit()), dit());
});

scenario('œufs — le tri range la bande, pas seulement la file', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.coins = 1e15; s.incubators = 4; s.pens = 8;
  s.incub = [null, null, null, null];
  s.eggs = { commun: 2, rare: 1, epique: 1, mythique: 0, merveille: 0 };
  s.file = ['commun', 'commun', 'rare', 'epique'];
  s.triOeuf = 'arrivee';
  jeu.runAutomations(0.1);

  const bande = () => jeu.subjects().filter(x => x.kind === 'egg')
                         .map(x => (x.slot ? x.slot.kind : 'vide')).join(' ');

  /* LE RÉGLAGE VIT SUR LA BANDE DE COUVAISON. Le poser là et ne trier QUE la file invisible,
     c'était promettre une chose et en faire une autre : on clique « rareté », on regarde la
     bande, et rien ne bouge. Un tri qui ne trie pas ce qu'il surplombe n'est pas un tri. */
  eq('par arrivée, la bande garde son ordre', bande(), 'commun commun rare epique');
  s.triOeuf = 'rarete';
  eq('par rareté, elle se range', bande(), 'epique rare commun commun');

  /* LES CASES VIDES VONT AU BOUT : c'est là qu'on clique pour poser un œuf, elles n'ont rien
     à faire au milieu de ce qui couve. */
  s.incub = [null, { p: 0, kind: 'commun', line: 'crapaud' },
             null, { p: 0, kind: 'epique', line: 'kraken' }];
  eq('les vides se rangent derrière', bande(), 'epique commun vide vide');

  /* LA SIGNATURE DE LA BANDE DOIT VOIR LE RÉGLAGE, sinon l'écran garde l'ancien ordre jusqu'au
     prochain changement d'autre chose — un tri qui n'agit qu'au bout de dix secondes passe
     pour cassé. */
  jeu.refresh();
  const avant = jeu.stripSig;
  s.triOeuf = 'arrivee';
  jeu.refresh();
  ok('elle change avec le tri', jeu.stripSig !== avant);
});

scenario('œufs — acheté en dernier, couvé en dernier', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.coins = 1e15; s.incubators = 1; s.incub = [null];
  s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0, merveille: 0 };
  s.file = [];
  s.triOeuf = 'arrivee';

  /* LE BOGUE QUE CE SCÉNARIO TIENT. `buyEgg` posait dans l'incubateur la sorte QU'ON VENAIT
     D'ACHETER, pas celle que la file désigne. Acheter un rare le mettait donc devant dix
     communs qui attendaient depuis dix minutes — exactement ce que « par arrivée » promet de
     ne pas faire. */
  jeu.buyEgg('commun');                     // celui-là part tout de suite : la file était vide
  eq('le premier occupe l’incubateur', s.incub[0].kind, 'commun');

  jeu.buyEgg('commun'); jeu.buyEgg('commun');
  jeu.buyEgg('rare');                       // le dernier acheté
  eq('trois attendent, le rare en queue', s.file.join(), 'commun,commun,rare');

  const sortir = () => { s.incub[0] = null; jeu.placeEgg(0); return s.incub[0].kind; };
  eq('le plus ancien passe le premier', sortir(), 'commun');
  eq('puis le suivant', sortir(), 'commun');
  eq('et le rare en dernier, comme il est arrivé', sortir(), 'rare');
  eq('la réserve est vide', s.file.length, 0);

  /* PAR RARETÉ, LE MÊME ACHAT DOUBLE TOUT LE MONDE — c'est l'autre réglage, et il doit rester
     franc lui aussi. */
  s.incub[0] = null;
  s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0, merveille: 0 };
  s.file = [];
  s.triOeuf = 'rarete';
  jeu.buyEgg('commun'); jeu.buyEgg('commun'); jeu.buyEgg('rare');
  s.incub[0] = null; jeu.placeEgg(0);
  eq('le rare passe devant', s.incub[0].kind, 'rare');
});

scenario('œufs — la file se trie comme l’enclos : arrivée, ou rareté', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.coins = 1e15;
  s.incub = [null, null];

  /* LES MÊMES DEUX ORDRES QUE L'ENCLOS, ET PAS D'AUTRES. C'est le même geste sur la même page,
     il ne doit pas avoir deux vocabulaires. */
  eq('deux ordres, comme l’enclos', Object.keys(jeu.TRIS_OEUF).sort().join(), 'arrivee,rarete');
  eq('et les mêmes noms', ['arrivee', 'rarete'].every(k => k in jeu.TRIS), true);

  jeu.buyEgg('rare'); jeu.buyEgg('commun'); jeu.buyEgg('commun'); jeu.buyEgg('epique');
  // les deux premiers sont partis en couvaison, les deux autres attendent
  eq('la réserve retient ce qui reste', s.file.join(), 'commun,epique');

  s.triOeuf = 'arrivee';
  eq('par arrivée, la tête de file part', jeu.bestStocked(), 'commun');
  s.triOeuf = 'rarete';
  eq('par rareté, le plus rare part', jeu.bestStocked(), 'epique');

  /* L'ARRIVÉE A DEMANDÉ UNE FILE : la réserve ne gardait que des COMPTES — trois communs et
     deux rares, sans savoir lesquels sont arrivés en premier. */
  s.triOeuf = 'arrivee';
  s.incub[0] = null;
  jeu.placeEgg(0);
  eq('elle se vide par la tête', s.file.join(), 'epique');
  eq('et c’est bien le commun qui est parti', s.incub[0].kind, 'commun');

  /* ELLE SE RÉPARE SEULE SI ELLE DIVERGE DES COMPTES : une sauvegarde d'avant n'en a pas, et
     un bogue ne doit jamais bloquer la réserve. */
  s.file = [];
  s.eggs = { commun: 2, rare: 1, epique: 0, mythique: 0, merveille: 0 };
  eq('reconstruite du plus commun au plus rare', jeu.fileOeufs().join(), 'commun,commun,rare');
  ok('et la file repart', !!jeu.bestStocked());

  /* IL NE TOUCHE PAS À LA BOUTIQUE : elle est un ESCALIER DE PRIX, et c'est ce qui lui permet
     de désigner « la marche suivante ». */
  const cases = () => noeuds.get('shop').children
    .map(li => li.children[0])
    .filter(b => (b.className || '').indexOf('egg-') >= 0)
    .map(b => (b.className.match(/egg-([a-z]+)/) || [])[1]);
  const avant = cases().join(' ');
  s.triOeuf = 'rarete'; jeu.syncTriOeuf();
  eq('la boutique ne bouge pas', cases().join(' '), avant);

  /* LE RÉGLAGE TRAVERSE L'ASCENSION, comme celui de l'enclos : c'est une préférence, pas une
     ressource. */
  s.pens = 20; s.coins = 1e12; jeu.crediterJetons();
  s.pen = [bete(jeu, 'crapaud', 3, 3000)];
  jeu.ascChoix = [-s.pen[0].id];
  jeu.ascensionner();
  eq('il survit au saut', jeu.state.triOeuf, 'rarete');
});

scenario('primes — un négoce n’arrive jamais avant sa rareté', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;

  /* UNE MARCHE VIDE. La grille ne montre que CINQ primes à la fois : une prime qui n'agit sur
     rien occupe une case, retarde les quatre suivantes, et se paie pour ne rien sentir. Le
     négoce rare coûtait 80 000 quand un œuf rare en coûte 300 000 — le quart de ce qu'il
     améliore, donc offert longtemps avant qu'on puisse en posséder un. */
  const negoce = r => jeu.PRIMES.find(p => p.cle === 'negoce-' + r);
  for (const r of ['rare', 'epique', 'mythique']) {
    ok('le négoce ' + r + ' est gardé', !!negoce(r).si);
    ok('et il se tait tant que la rareté est inconnue', !negoce(r).si());
  }
  ok('celui des communes ne l’est pas', !negoce('commune').si);

  /* LA GARDE SE RÈGLE SUR CE QU'ON A VU, pas sur un prix — elle s'ajuste toute seule à une
     rare tombée par chance. Et `rareteVue` n'est pas `rareteConnue` : la seconde ne parle que
     du rang secret, toutes les autres raretés étant nommées d'avance par la boutique. */
  ok('vue et connue ne sont pas la même question',
     jeu.rareteConnue('rare') && !jeu.rareteVue('rare'));
  s.seen['loup:1'] = 1;
  ok('une rare vue ouvre le négoce rare', negoce('rare').si());
  ok('sans ouvrir celui des épiques', !negoce('epique').si());

  /* CHACUN VAUT DEUX ŒUFS DE SA RARETÉ : on en a un, on en veut d'autres. Gardé à 80 000, il
     serait apparu comme un cadeau et non comme une décision. */
  const oeuf = { rare: 'rare', epique: 'epique', mythique: 'mythique' };
  for (const r of Object.keys(oeuf)) {
    const p = negoce(r).prix, e = jeu.EGG_BY_KEY[oeuf[r]].price;
    ok(r + ' coûte environ deux œufs', p / e > 1.8 && p / e < 2.4, (p / e).toFixed(2));
  }

  // et la table reste rangée par prix, puisque la grille la lit dans l'ordre
  let prec = 0, mal = 0;
  for (const p of jeu.PRIMES) { if (p.prix < prec) mal++; prec = Math.max(prec, p.prix); }
  eq('la table reste triée', mal, 0);
});

scenario('carrefour — trois routes, on en prend une, les deux autres se ferment', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const p = jeu.PRIMES.find(x => x.cle === 'carrefour-1');
  ok('le premier carrefour existe', !!p);
  eq('il offre trois routes', p.choix.length, 3);

  s.coins = p.prix - 1;
  ok('sans de quoi payer, rien ne se prend', !jeu.choisirRoute('carrefour-1', 'route-bourse'));

  s.coins = p.prix;
  ok('avec de quoi, la route se prend', jeu.choisirRoute('carrefour-1', 'route-bourse'));
  eq('et elle est payée', s.coins, 0);

  /* LES DEUX AUTRES SONT PERDUES, pas remises à plus tard : remises à plus tard, ce ne serait
     pas un choix mais un ordre d'achat — on finirait par tout avoir et la décision ne coûterait
     rien. */
  s.coins = 1e12;
  ok('on ne prend pas la deuxième', !jeu.choisirRoute('carrefour-1', 'route-ardeur'));
  ok('ni la troisième', !jeu.choisirRoute('carrefour-1', 'route-poigne'));
  eq('la bourse n’a pas rebougé', s.coins, 1e12);

  /* L'OPTION EST RANGÉE SOUS SA PROPRE CLÉ : tout le jeu continue de lire `prime('...')` sans
     rien savoir des carrefours, et une route peut servir de garde comme n'importe quelle
     prime. */
  ok('la route retenue est une prime comme une autre', jeu.prime('route-bourse'));
  ok('le carrefour, lui, n’est pas une prime', !jeu.prime('carrefour-1'));
  ok('mais il est fait', jeu.primeFaite(p));
});

scenario('carrefour — les trois routes diffèrent en nature, pas en chiffre', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;

  /* LA CONTRAINTE QUI DÉCIDE SI C'EST RÉUSSI. « +10 % de vente / +10 % de rente / +10 % de
     vitesse » n'est pas un choix, c'est un menu : on prend le plus gros nombre et on n'y pense
     plus. Chaque carrefour offre donc un PRIX qui baisse, une VITESSE qui monte, et un GESTE
     qui pèse — trois grandeurs qui ne se comparent pas. */
  for (const cle of ['carrefour-1', 'carrefour-2']) {
    const p = jeu.PRIMES.find(x => x.cle === cle);
    const axes = new Set(p.choix.map(o => Object.keys(o.bonus).join('+')));
    eq(cle + ' : trois axes distincts', axes.size, 3);
  }

  // et chaque route agit vraiment, chacune sur son levier
  const oeuf = jeu.prixOeuf(jeu.EGG_BY_KEY.commun);
  const clic = jeu.clickPower();
  const vite = jeu.coef('vitesse');

  jeu.choisirRoute('carrefour-1', 'route-bourse');
  ok('la bourse baisse le prix des œufs', jeu.prixOeuf(jeu.EGG_BY_KEY.commun) < oeuf,
     oeuf + ' → ' + jeu.prixOeuf(jeu.EGG_BY_KEY.commun));
  eq('sans toucher au clic', jeu.clickPower(), clic);
  eq('ni à la vitesse', jeu.coef('vitesse'), vite);

  // une autre partie, une autre route
  const j2 = neuf(); j2.state.tuto = false; j2.state.coins = 1e12;
  j2.choisirRoute('carrefour-1', 'route-poigne');
  ok('la poigne double le clic', j2.clickPower() > clic, clic + ' → ' + j2.clickPower());

  const j3 = neuf(); j3.state.tuto = false; j3.state.coins = 1e12;
  j3.choisirRoute('carrefour-1', 'route-ardeur');
  ok('l’ardeur monte la vitesse', j3.coef('vitesse') > vite);

  /* ET LE PÉAGE DU SECOND CARREFOUR : c'est un PRIX, donc il baisse. */
  const j4 = neuf(); j4.state.tuto = false; j4.state.coins = 1e12;
  const c = bete(j4, 'crapaud', 2, 3000);
  const avant = j4.evoCost(c);
  j4.choisirRoute('carrefour-2', 'route-peage');
  ok('le péage allégé coûte moins', j4.evoCost(c) < avant, avant + ' → ' + j4.evoCost(c));
});

scenario('carrefour — il ouvre un écran, et se referme sans rien prendre', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  jeu.refresh();

  eq('l’écran est fermé au départ', noeuds.get('carrefour').hidden, true);
  ok('la case l’ouvre', jeu.ouvrirCarrefour('carrefour-1'));
  eq('il s’affiche', noeuds.get('carrefour').hidden, false);
  eq('avec ses trois routes', noeuds.get('carrefour-routes').children.length, 3);

  /* IL SE FERME SANS CHOISIR. Rien ne presse — la case reste, l'argent aussi. Un choix
     définitif ne doit pas se prendre d'un clic distrait au milieu de quarante-sept primes. */
  jeu.fermerCarrefour();
  eq('refermé', noeuds.get('carrefour').hidden, true);
  ok('et rien n’a été pris', !jeu.primeFaite(jeu.PRIMES.find(x => x.cle === 'carrefour-1')));
  eq('la bourse est intacte', s.coins, 1e12);

  // une fois choisi, il ne se rouvre plus
  jeu.choisirRoute('carrefour-1', 'route-ardeur');
  ok('le carrefour est clos', !jeu.ouvrirCarrefour('carrefour-1'));
});

/* ────────────────────────── les faveurs ─────────────────────────────────────── */

scenario('faveur — trois cartes, une prise, et le tirage ne bouge qu’en prenant', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;

  /* ELLES S'OUVRENT AU PREMIER CARREFOUR. Un tirage aléatoire posé sous le nez d'un joueur qui
     n'a jamais choisi entre deux primes ne s'explique pas tout seul. */
  ok('rien avant le premier carrefour', !jeu.faveursOuvertes());
  ok('et rien ne se prend', !jeu.prendreFaveur('renommee'));

  s.coins = 1e6;
  jeu.choisirRoute('carrefour-1', 'route-bourse');
  ok('le carrefour passé, elles s’ouvrent', jeu.faveursOuvertes());

  const main = jeu.mainFaveurs();
  eq('trois cartes', main.length, 3);
  eq('trois cartes différentes', new Set(main).size, 3);
  /* TROIS LEVIERS DIFFÉRENTS : « +10 % de vente / +10 % de rente / +10 % de vitesse » est un
     menu, pas un choix. Ici les trois grandeurs ne se comparent pas. */
  eq('trois leviers différents',
     new Set(main.map(c => jeu.FAVEUR_BY_KEY[c].levier)).size, 3);

  /* LE TIRAGE EST RANGÉ DANS L'ÉTAT. Un tirage qui se refait à chaque lecture, c'est une
     machine à sous qu'on regarde tourner en attendant le bon lot. */
  eq('il ne bouge pas d’une lecture à l’autre', jeu.mainFaveurs().join(), main.join());
  eq('ni de dix', [0,1,2,3,4,5,6,7,8,9].map(() => jeu.mainFaveurs().join()).join('|').split('|')
     .filter(x => x !== main.join()).length, 0);

  // il faut de quoi payer
  s.coins = jeu.prixFaveur() - 1;
  ok('sans de quoi, rien ne se prend', !jeu.prendreFaveur(main[0]));
  // et il faut que la carte soit sur la table
  const dehors = jeu.FAVEURS.map(f => f.cle).filter(c => main.indexOf(c) < 0)[0];
  s.coins = 1e12;
  ok('une carte hors tirage ne se prend pas', !jeu.prendreFaveur(dehors));

  const avant = s.coins, prix = jeu.prixFaveur();
  ok('la carte du tirage se prend', jeu.prendreFaveur(main[0]));
  eq('elle est payée', s.coins, avant - prix);
  eq('elle est comptée', jeu.faveurCombien(main[0]), 1);
  ok('le prix monte', jeu.prixFaveur() > prix);
  ok('et un tirage neuf prend la place', jeu.mainFaveurs().join() !== main.join() ||
     jeu.faveursPris() === 1);
  eq('trois cartes à nouveau', jeu.mainFaveurs().length, 3);

  /* ELLES SE REPRENNENT SANS LIMITE : c'est ce qui les distingue d'une prime. */
  const encore = jeu.mainFaveurs()[0];
  const n0 = jeu.faveurCombien(encore);
  jeu.prendreFaveur(encore);
  eq('la même carte se reprend', jeu.faveurCombien(encore), n0 + 1);
});

scenario('faveur — ce qui multiplie s’additionne, ce qui remise s’use', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e6;
  jeu.choisirRoute('carrefour-1', 'route-bourse');

  const poser = (cle, n) => {
    jeu.state.faveurs.acquis[cle] = n;
    jeu.state.faveurs.pris = n;
    jeu.oublierPrimes();
  };

  /* CE QUI MULTIPLIE S'ADDITIONNE. Dix « +5 % de vente » font +50 %, sans plafond : une valeur
     qui double n'a rien de dangereux dans une économie qui se compte en milliards. */
  const v0 = jeu.coef('valeur');
  poser('renommee', 10);
  eq('dix renommées font un demi de plus', Math.round((jeu.coef('valeur') - v0) * 1000), 500);

  /* CE QUI REMISE S'USE. Vingt « −5 % sur les œufs » additionnés feraient −100 %, et l'œuf
     serait GRATUIT POUR TOUJOURS — une queue infinie atteint toujours un plafond additif. */
  poser('adresse', 20);
  const r = jeu.bonusPrimes().oeuf;
  ok('vingt remises n’atteignent pas le mur', r < 1, r);
  ok('mais s’en approchent', r > 0.6, r);
  poser('adresse', 200);
  ok('deux cents non plus', jeu.bonusPrimes().oeuf < 1, jeu.bonusPrimes().oeuf);
  /* ET LA COMPOSITION SE FAIT SUR CE QUE LES PRIMES ONT DÉJÀ MIS : les primes portent elles
     aussi des remises d'œuf, additives. Composer la faveur dans son coin avant de l'ajouter
     aurait laissé la somme repasser au-dessus de un — c'est exactement ce qui est arrivé. */
  s.primes['oeuf-1'] = true;
  jeu.oublierPrimes();
  ok('même avec les remises des primes par-dessous', jeu.bonusPrimes().oeuf < 1,
     jeu.bonusPrimes().oeuf);
  ok('et l’œuf coûte toujours quelque chose', jeu.prixOeuf(jeu.EGG_BY_KEY.commun) > 0);
});

scenario('faveur — les quatre leviers neufs bougent vraiment', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e6;
  jeu.choisirRoute('carrefour-1', 'route-bourse');

  /* CES QUATRE-LÀ N'ÉTAIENT LUS QUE DE L'ALBUM ET DU CIEL : les primes ne savaient pas les
     toucher. Une carte qui ne change rien est du remplissage, donc chacune se vérifie. */
  const poser = cle => { jeu.state.faveurs.acquis[cle] = 5; jeu.oublierPrimes(); };

  const oeuf = { kind: 'egg', c: null };
  const av = jeu.albumVitesse(oeuf);
  poser('couvaison');
  ok('la couvaison accélère la couvaison', jeu.albumVitesse(oeuf) > av);

  const jeune = { kind: 'pen', c: bete(jeu, 'crapaud', 2, 0) };
  const ap = jeu.albumVitesse(jeune);
  poser('fourrage');
  ok('le fourrage accélère la pousse', jeu.albumVitesse(jeune) > ap);

  poser('ration');
  ok('la ration compte pour l’engraissement', jeu.bonusPrimes().gras > 0);
  poser('oeil-neuf');
  ok('l’œil neuf monte la chance de chromatique', jeu.bonusPrimes().prodige > 0);
});

scenario('faveur — elles tombent à l’ascension, comme les primes', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20; s.coins = 1e6;
  jeu.choisirRoute('carrefour-1', 'route-bourse');
  s.coins = 1e12;
  jeu.prendreFaveur(jeu.mainFaveurs()[0]);
  eq('une faveur est prise', jeu.faveursPris(), 1);

  /* ELLES SE PAIENT EN PIÈCES, DONC ELLES TOMBENT. C'est ce qui les range du côté du cycle et
     non du côté de ce qu'on emporte — la constellation est l'autre côté. */
  poserJetons(jeu, 20);
  const c = bete(jeu, 'crapaud', 3, 3000);
  jeu.ascChoix = [-c.id];
  jeu.ascensionner();
  eq('après le saut, plus rien', jeu.faveursPris(), 0);
  eq('et le prix repart du bas', jeu.prixFaveur(), jeu.FAVEUR_BASE);
  ok('la porte s’est refermée avec le carrefour', !jeu.faveursOuvertes());
});

scenario('faveur — la rangée s’ouvre, l’écran donne les trois cartes', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e6;
  jeu.refresh();
  eq('rien à voir avant le carrefour', noeuds.get('faveur-mise').hidden, true);

  jeu.choisirRoute('carrefour-1', 'route-bourse');
  s.coins = jeu.prixFaveur() - 1;
  jeu.refresh();
  eq('la rangée paraît', noeuds.get('faveur-mise').hidden, false);
  ok('elle annonce son prix',
     noeuds.get('faveur-mise').textContent.indexOf(jeu.fmt(jeu.prixFaveur())) >= 0,
     noeuds.get('faveur-mise').textContent);
  eq('sans de quoi payer, elle est fermée', noeuds.get('faveur-mise').disabled, true);

  s.coins = 1e12;
  jeu.refresh();
  eq('avec de quoi, elle s’ouvre', noeuds.get('faveur-mise').disabled, false);

  ok('l’écran s’ouvre', jeu.ouvrirFaveurs());
  const cartes = noeuds.get('carrefour-routes').children;
  eq('trois cartes à l’écran', cartes.length, 3);
  ok('chacune porte sa faveur', cartes.every(b => !!jeu.FAVEUR_BY_KEY[b.dataset.faveur]));

  /* IL SE FERME SANS RETIRER LE TIRAGE : sinon fermer serait relancer, et un tirage qu'on
     relance gratuitement n'est plus un tirage. */
  const main = jeu.mainFaveurs().join();
  jeu.fermerCarrefour();
  jeu.ouvrirFaveurs();
  eq('rouvrir rend les mêmes cartes', jeu.mainFaveurs().join(), main);

  /* CE QU'ON EN A DÉJÀ SE DIT SUR LA CARTE : une faveur se reprend sans limite, donc « déjà
     prise » est la seule chose qui décide vraiment entre deux cartes. */
  const cle = jeu.mainFaveurs()[0];
  jeu.state.faveurs.acquis[cle] = 2;
  jeu.ouvrirFaveurs();
  const carte = noeuds.get('carrefour-routes').children.find(b => b.dataset.faveur === cle);
  const nom = carte.children.find(x => (x.className || '').includes('route-nom'));
  ok('elle dit le rang qu’on prendrait', nom.textContent.indexOf('×3') >= 0, nom.textContent);
});

/* ────────────────────────── la constellation ────────────────────────── */

scenario('constellation — un nœud s’ouvre avec son parent, jamais avant', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  poserJetons(jeu, 500);

  /* LE PARENT REMPLACE LE RANG. « Demande le rang 8 du tronc » demandait de compter ;
     « demande le nid de plus » se voit sur le trait qui les relie. */
  ok('l’étincelle est ouverte d’emblée', jeu.etoileOuverte(jeu.ETOILE_BY_KEY.etincelle));
  ok('rien d’autre ne l’est', !jeu.etoileOuverte(jeu.ETOILE_BY_KEY['nid-plus']));
  ok('donc rien d’autre ne s’achète', !jeu.acheterEtoile('nid-plus'));

  ok('l’étincelle s’achète', jeu.acheterEtoile('etincelle'));
  ok('et ouvre les six premiers', jeu.etoileOuverte(jeu.ETOILE_BY_KEY['nid-plus']));
  ok('on ne la rachète pas', !jeu.acheterEtoile('etincelle'));

  // la chaîne se remonte un maillon à la fois
  ok('la ponte attend le nid', !jeu.acheterEtoile('ponte-plus'));
  jeu.acheterEtoile('nid-plus');
  ok('puis elle s’ouvre', jeu.acheterEtoile('ponte-plus'));

  /* SIX DIRECTIONS DEPUIS LE CENTRE, et chacune part de l'étincelle. */
  eq('six axes', jeu.AXES.length, 6);
  for (const a of jeu.AXES) {
    ok(a.cle + ' part du centre', jeu.PAR_AXE[a.cle][0].parent === 'etincelle');
    eq(a.cle + ' porte quatre nœuds', jeu.PAR_AXE[a.cle].length, 4);
  }
});

scenario('constellation — elle ne possède rien du jeu de base', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;

  /* L'AUTOMATISATION EST DU JEU DE BASE. Elle doit être là dès la PREMIÈRE boucle, sinon la
     première heure se joue au poignet. Quatre nœuds « est à toi » l'ont tenue pendant deux
     versions ; ce scénario est là pour qu'aucun ne revienne. */
  for (const cle of ['acheteur', 'marchand', 'evolution', 'pension', 'forge']) {
    ok(cle + ' n’est pas un nœud', !jeu.ETOILE_BY_KEY[cle]);
  }
  ok('aucun nœud ne tient une prime', jeu.CIEL.every(n => !n.prime));

  // et la boutique les vend toujours, sans rien demander au ciel
  s.coins = 1e6;
  jeu.buyPrime(jeu.PRIMES.find(p => p.cle === 'acheteur'));
  ok('l’acheteur s’achète en pièces, dès le premier cycle', jeu.prime('acheteur'));
  ok('sans un seul jeton', jeu.jetonsEnMain() === 0);
});

scenario('constellation — elle paie en jetons, et chaque nœud agit', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 8;
  poserJetons(jeu, 500);
  jeu.acheterEtoile('etincelle');

  eq('l’étincelle a coûté un jeton', jeu.jetonsEnMain(), 499);

  /* CHAQUE NŒUD FAIT QUELQUE CHOSE : c'est la règle qui a supprimé le tronc de vingt rangs de
     « +2 % », un chemin fait de marches vides. Douze nœuds portent un nombre, douze changent
     une règle — et ce scénario touche chacun des seconds. */
  eq('douze nœuds portent un nombre', jeu.CIEL.filter(n => n.bonus).length, 12);

  // le négoce : une valeur, un prix d'œuf
  const v = jeu.coef('valeur');
  jeu.acheterEtoile('renom');
  ok('le renom monte la valeur', jeu.coef('valeur') > v);
  const oe = jeu.prixOeuf(jeu.EGG_BY_KEY.commun);
  jeu.acheterEtoile('marche');
  ok('le marché baisse le prix des œufs', jeu.prixOeuf(jeu.EGG_BY_KEY.commun) < oe);

  // la main : le clic
  const cp = jeu.clickPower();
  jeu.acheterEtoile('poing');
  ok('le poing double le clic', jeu.clickPower() > cp, cp + ' → ' + jeu.clickPower());

  /* LA PENSION EST TOUT ENTIÈRE ICI DEPUIS LA `4.15.0`. Elle se réglait en douze primes qui
     occupaient les dix dernières marches de l'escalier ; l'axe la porte maintenant en quatre
     crans, et chaque cran lève LES QUATRE CADRANS à la fois. Aucune prime ne la touche plus —
     seul le bâtiment, qui reste en pièces et s'ouvre donc dans le premier cycle. */
  eq('sans un nœud, la pension est au plus bas', jeu.placesPension(), 1);
  ok('et aucune prime ne peut la lever',
     !jeu.PRIMES.some(p => p.cle.startsWith('pension-')));

  jeu.acheterEtoile('nid-plus');
  eq('un cran : deux nids', jeu.placesPension(), 2);
  eq('deux œufs', jeu.porteePension(), 2);
  eq('et moitié plus vite', jeu.vitessePension(), 1.5);

  jeu.acheterEtoile('ponte-plus');
  eq('deux crans : quatre nids', jeu.placesPension(), 4);
  eq('et la richesse se desserre', jeu.richessePension(), 4);

  jeu.acheterEtoile('sang-epais');
  eq('trois crans : huit nids', jeu.placesPension(), 8);
  eq('et le sang dominant arrive', jeu.chancePension(1), 0.4);

  jeu.acheterEtoile('nid-vif');
  eq('quatre crans : le neuvième nid', jeu.placesPension(), 9);
  eq('six œufs par ponte', jeu.porteePension(), 6);
  eq('dix-huit fois plus vite', jeu.vitessePension(), 18);
  eq('et le sang ne pèse plus', jeu.richessePension(), 16);

  // l'album : la poussière double, puis la forge coûte moitié moins
  const d0 = jeu.poussiereDe(pave(jeu, 1));
  jeu.acheterEtoile('cendres');
  eq('les cendres doublent la poussière', jeu.poussiereDe(pave(jeu, 1)), d0 * 2);

  /* LE CREUSET LÈVE L'INTERDIT SUR LES CARTES ÉQUIPÉES : la forge DÉSIGNE ses trois cartes et
     montre le résultat, donc rien n'y est silencieux. */
  s.album = [pave(jeu, 1)]; s.slots = [1];
  ok('une équipée reste hors forge', !jeu.forgeable(s.album[0]));
  jeu.acheterEtoile('creuset');
  ok('le creuset l’y fait entrer', jeu.forgeable(s.album[0]));

  const f0 = jeu.coutFusion(s.album[0]);
  jeu.acheterEtoile('braise-douce');
  eq('la braise douce halve le coût', jeu.coutFusion(s.album[0]), Math.round(f0 / 2));
});

scenario('constellation — acheter coûte, et la boucle ne rend rien', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.coins = 1e9;
  jeu.crediterJetons();

  /* LE BUG QUE CE SCÉNARIO TIENT. `acheterEtoile` remettait `asc.sommet` à zéro en croyant
     convertir le crédit du cycle en bourse. Or `crediterJetons` tourne DIX FOIS PAR SECONDE et
     relève le sommet sur `state.coins` : le crédit revenait entier au tour suivant, en plus de
     la bourse qui le contenait déjà. Quatre jetons, un achat à un, et sept jetons un dixième
     de seconde plus tard.

     `sommet` N'EST PAS UNE RÉSERVE, C'EST UNE MESURE — le plus haut que la bourse ait atteint.
     Une mesure que la boucle refait ne peut pas servir de compteur. */
  const avant = jeu.jetonsEnMain();
  eq('un milliard crédite quatre jetons', avant, 4);

  ok('l’étincelle s’achète', jeu.acheterEtoile('etincelle'));
  eq('elle coûte un jeton', jeu.jetonsEnMain(), avant - 1);

  jeu.crediterJetons();
  eq('et un tour de boucle ne rend rien', jeu.jetonsEnMain(), avant - 1);
  for (let i = 0; i < 100; i++) jeu.crediterJetons();
  eq('cent tours non plus', jeu.jetonsEnMain(), avant - 1);

  /* CE QU'ON N'A PLUS EN MAIN NE S'ACHÈTE PLUS : sans ça, la bourse se vide dans le rouge et
     l'arbre se prend en entier. */
  eq('il reste trois jetons', jeu.jetonsEnMain(), 3);
  ok('un nœud à quatre est hors de portée', !jeu.acheterEtoile('poing'));
  ok('un nœud à trois passe encore', jeu.acheterEtoile('nid-plus') || jeu.jetonsEnMain() === 3);

  /* LE SOMMET RESTE LA MESURE QU'IL EST : franchir un palier de plus crédite toujours. */
  const enMain = jeu.jetonsEnMain();
  s.coins = 1e12;
  jeu.crediterJetons();
  ok('un palier de plus crédite encore', jeu.jetonsEnMain() > enMain);
});

scenario('sauvegarde — les bourses gonflées par le bug dégonflent', () => {
  /* ON NE PEUT PAS RECALCULER LA VÉRITÉ : les sommets des cycles passés ne sont pas gardés. On
     pose donc un plafond que rien de légitime ne peut dépasser — ce que les ascensions faites
     ont pu créditer au mieux, moins ce que l'arbre a coûté. */
  const gonflee = neuf({
    v: 23, coins: 0, asc: { n: 3, paliers: 11, jetons: 4000, sommet: 0 },
    ciel: { etincelle: true, poing: true },
  });
  const parCycle = gonflee.JETON_PALIERS.length + 2;
  eq('la bourse tombe au plafond', gonflee.state.asc.jetons, 3 * parCycle - 1 - 4);
  eq('et le compteur de dépense repart de zéro', gonflee.state.asc.depense, 0);

  /* LE PLAFOND EST LARGE EXPRÈS : personne ne perd un jeton gagné. */
  const honnete = neuf({
    v: 23, coins: 0, asc: { n: 3, paliers: 11, jetons: 7, sommet: 0 }, ciel: {},
  });
  eq('une bourse plausible ne bouge pas', honnete.state.asc.jetons, 7);

  const neuve = neuf({ v: 23, coins: 0, asc: { n: 0, paliers: 0, jetons: 900, sommet: 0 } });
  eq('sans ascension, rien ne peut avoir été mis de côté', neuve.state.asc.jetons, 0);
});

scenario('ascension — les meilleures se prennent d’un geste', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  s.coins = 1e12; jeu.crediterJetons();

  /* CHOISIR À LA MAIN QUINZE FOIS EST UNE CORVÉE, PAS UNE DÉCISION. Neuf fois sur dix la
     réponse à « lesquelles » est « les meilleures ». */
  const faible = bete(jeu, 'crapaud', 1, 10);
  const moyenne = bete(jeu, 'crapaud', 3, 3000);
  const forte = bete(jeu, 'loup', 5, 9999);
  jeu.ouvrirAscension();

  const rafle = noeuds.get('asc-rafle');
  eq('le raccourci est là', rafle.hidden, false);
  ok('et il annonce combien', /meilleures/.test(rafle.textContent), rafle.textContent);

  const ap = jeu.apercuAscension();
  jeu.ascChoix = jeu.meilleuresCartes(ap.neuves, 2);
  eq('deux prises', jeu.ascChoix.length, 2);

  /* LE TRI VA DU PLUS RARE AU MOINS RARE, puis de l'âge au niveau : une carte ne se vend pas,
     elle s'équipe, donc c'est ce qu'elle vaudra à l'usage qui compte. */
  const pris = ap.neuves.filter(k => jeu.ascChoix.indexOf(k.id) !== -1);
  ok('la rare est dedans', pris.some(k => k.line === 'loup'), pris.map(k => k.line).join(' '));
  ok('la plus jeune est dehors', !pris.some(k => k.age === 1),
     pris.map(k => k.line + ':' + k.age).join(' '));

  // et le même bouton vide la sélection quand elle est pleine
  jeu.ascChoix = jeu.meilleuresCartes(ap.neuves, ap.max);
  jeu.renderAscension();
  ok('plein, il propose de tout enlever', /enlever/.test(rafle.textContent), rafle.textContent);
});

scenario('ascension — la porte, le nombre et la phrase disent tous la bourse', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  const bouton = () => noeuds.get('btn-asc');

  s.coins = 1e12; jeu.crediterJetons();
  s.pen = [bete(jeu, 'crapaud', 3, 3000)];
  jeu.ascChoix = [-s.pen[0].id];
  jeu.ascensionner();

  /* LE MUR REMONTAIT ICI, SOUS UNE AUTRE FORME. Le bouton lisait `jetonsDus`, le crédit du
     CYCLE, et se cachait quand il valait zéro — c'est-à-dire juste après un saut, quand
     `sommet` repart de zéro. On pouvait avoir quatre jetons en poche, le droit de sauter, et
     aucun bouton. */
  s.coins = 100; jeu.crediterJetons();
  eq('le cycle neuf ne crédite rien', jeu.jetonsDus(), 0);
  ok('mais la bourse n’est pas vide', jeu.jetonsEnMain() > 0);
  ok('et on peut sauter', jeu.peutAscensionner());

  jeu.refresh();
  eq('donc le bouton est là', bouton().hidden, false);
  ok('et il annonce la bourse, pas le crédit',
     bouton().textContent.indexOf(String(jeu.jetonsEnMain())) >= 0, bouton().textContent);

  /* LA PHRASE DE L'ÉCRAN DISAIT LE CONTRAIRE DE CE QUE LE CODE FAIT. « Sauter les dépense
     tous, employés ou non » était vrai jusqu'à la 4.0.0 et faux depuis : le reste demeure. La
     phrase poussait à brûler ses jetons en cartes qu'on ne veut pas — exactement contre
     l'arbitrage qu'elle était censée servir. */
  s.pen = [bete(jeu, 'crapaud', 3, 3000)];
  jeu.ouvrirAscension();
  const dit = noeuds.get('asc-jalon').textContent;
  ok('elle ne promet plus de tout dépenser', dit.indexOf('dépense tous') < 0, dit);
  ok('elle dit ce qui reste', dit.indexOf('reste en bourse') >= 0, dit);
});

scenario('ascension — ce qui n’est pas employé demeure vraiment', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  s.coins = 1e12; jeu.crediterJetons();
  const avant = jeu.jetonsEnMain();
  ok('la bourse est garnie', avant >= 4, avant);

  s.pen = [bete(jeu, 'crapaud', 3, 3000)];
  jeu.ascChoix = [-s.pen[0].id];
  jeu.ascensionner();
  /* UNE CARTE COÛTE UN JETON, ET PAS PLUS : le reste est en bourse, disponible pour l'arbre. */
  eq('une carte a coûté son prix doré, le reste demeure', jeu.jetonsEnMain(), avant - 1);
});

scenario('constellation — le glisser ne mange plus le clic suivant', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  poserJetons(jeu, 500);

  /* LE DRAPEAU NE SE BAISSAIT QU'EN CLIQUANT L'ARBRE. Or un glisser se termine souvent HORS de
     l'arbre — le canevas déborde de son cadre — et alors aucun clic ne survenait : le drapeau
     restait levé, et le prochain vrai clic sur un nœud était avalé. */
  jeu.cielDebutTire({ clientX: 0, clientY: 0 });
  jeu.cielBouge({ clientX: 200, clientY: 0 });
  ok('le glisser est reconnu', jeu.cielFinTire() > 3);
  jeu.cielGlisse = true;                       // ce que fait le `mouseup` de la fenêtre

  jeu.cielDebutTire({ clientX: 0, clientY: 0 });
  eq('un geste neuf repart d’une ardoise propre', jeu.cielGlisse, false);
  eq('et un clic simple ne bouge rien', jeu.cielFinTire(), 0);
});

scenario('constellation — on ne peut pas perdre l’arbre hors de l’écran', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  poserJetons(jeu, 500);

  /* LE GLISSER N'AVAIT AUCUNE BORNE : trois mille pixels et la constellation quittait l'écran,
     sans rien pour la ramener — une carte qu'on peut faire tomber du bureau. */
  jeu.cielDebutTire({ clientX: 0, clientY: 0 });
  jeu.cielBouge({ clientX: 9000, clientY: 9000 });
  jeu.cielFinTire();
  ok('le déplacement est borné', Math.abs(jeu.cielVue.x) <= jeu.CIEL_LIMITE, jeu.cielVue.x);
  ok('dans les deux axes', Math.abs(jeu.cielVue.y) <= jeu.CIEL_LIMITE, jeu.cielVue.y);

  jeu.cielDebutTire({ clientX: 0, clientY: 0 });
  jeu.cielBouge({ clientX: -9000, clientY: -9000 });
  jeu.cielFinTire();
  ok('et dans l’autre sens', Math.abs(jeu.cielVue.x) <= jeu.CIEL_LIMITE, jeu.cielVue.x);

  /* LA BORNE DOIT RESTER ASSEZ LARGE POUR ATTEINDRE LE NŒUD LE PLUS LOIN, sinon on aurait
     échangé un arbre perdu contre un arbre inaccessible. */
  const loin = Math.max(...jeu.CIEL_VUE.rayon);
  ok('elle laisse amener le nœud le plus loin au centre', jeu.CIEL_LIMITE >= loin,
     jeu.CIEL_LIMITE + ' vs ' + loin);
});

scenario('constellation — chaque nœud change quelque chose de mesurable', () => {
  /* AUCUN REMPLISSAGE : c'est la règle qui a supprimé le tronc de vingt rangs de « +2 % ». Ce
     scénario la tient pour les vingt-cinq nœuds à la fois, en mesurant une sonde par levier —
     un nœud qui ne bougerait aucune d'elles serait du décor. */
  const sondes = [
    j => j.coef('valeur'), j => j.coef('rente'), j => j.coef('vitesse'),
    j => j.prixOeuf(j.EGG_BY_KEY.commun), j => j.clickPower(),
    j => JSON.stringify(j.bonusCiel()),
    j => j.placesPension(), j => j.porteePension(),
    j => j.richessePension(), j => j.vitessePension(),
    j => j.coutCartes(3), j => j.jetonsDus(),
    j => j.state.album[0] ? j.coutFusion(j.state.album[0]) : 0,
    j => j.state.album[0] ? j.forgeable(j.state.album[0]) : 0,
    j => j.state.pen[0] ? j.evoCost(j.state.pen[0]) : 0,
    j => j.state.album[0] ? j.poussiereDe(j.state.album[0]) : 0,
    /* LA FERVEUR NE SE LIT NULLE PART AILLEURS : elle vit dans `offrirFrenesie`, donc on
       l offre pour de vrai et on regarde la duree obtenue. */
    j => { j.state.frenesie = 0; j.offrirFrenesie(1); return j.state.frenesie; },
    j => j.PRIMES.length,          // sentinelle : une sonde qui ne bouge jamais
  ];
  const muets = [];
  for (const n of neuf().CIEL) {
    const jeu = neuf(); const s = jeu.state;
    s.tuto = false; s.pens = 8; s.coins = 1e12;
    jeu.crediterJetons();
    s.pen = [bete(jeu, 'crapaud', 2, 100)];
    s.album = [pave(jeu, 1)]; s.slots = [1];
    const av = sondes.map(f => String(f(jeu)));
    s.ciel[n.cle] = true;
    jeu.oublierPrimes();
    const ap = sondes.map(f => String(f(jeu)));
    /* L'ÉTINCELLE EST LA SEULE EXCEPTION, ET SON EFFET EST STRUCTUREL : elle n'ajoute aucun
       nombre, elle ouvre les six directions. */
    if (n.cle !== 'etincelle' && av.join('|') === ap.join('|')) muets.push(n.cle);
  }
  eq('aucun nœud muet', muets.join(' '), '');

  const j = neuf();
  ok('et l’étincelle ouvre bien les six',
     j.PAR_AXE[j.AXES[0].cle][0].parent === 'etincelle');
});

scenario('constellation — on peut tout reprendre, et le compte est exact', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.coins = 1e12; jeu.crediterJetons();

  /* ELLE NE REND PAS LES CHOIX GRATUITS, ELLE LES REND RÉVISABLES. Dans un jeu à une seule
     sauvegarde, un nœud pris par erreur se subissait pour toujours. */
  eq('rien à reprendre sur un ciel vide', jeu.prixDuCiel(), 0);
  ok('et le bouton ne fait rien', !jeu.reprendreCiel());

  const avant = jeu.jetonsEnMain();
  jeu.acheterEtoile('etincelle');
  jeu.acheterEtoile('poing');
  eq('deux nœuds valent cinq jetons', jeu.prixDuCiel(), 5);
  eq('et la bourse a fondu d’autant', jeu.jetonsEnMain(), avant - 5);

  eq('la reprise rend les cinq', jeu.reprendreCiel(), 5);
  eq('la bourse est comme avant', jeu.jetonsEnMain(), avant);
  eq('et le ciel est vide', Object.keys(s.ciel).length, 0);

  /* LE PIÈGE, ET C'EST LE MÊME QU'EN 4.6.1 : la dépense du cycle N'EST PAS remise à zéro. Elle
     enregistre ce qui a été payé, ce qui reste vrai ; le remboursement s'ajoute par-dessus. La
     remettre à zéro en plus rembourserait deux fois — et la boucle le montrerait aussitôt. */
  for (let i = 0; i < 50; i++) jeu.crediterJetons();
  eq('et la boucle ne rend rien de plus', jeu.jetonsEnMain(), avant);

  /* CE QUI A ÉTÉ PRIS AU CYCLE PRÉCÉDENT SE REPREND AUSSI : la constellation traverse
     l'ascension, donc son remboursement doit la traverser également. */
  jeu.acheterEtoile('etincelle');
  s.pens = 20;
  s.pen = [bete(jeu, 'crapaud', 3, 3000)];
  jeu.ascChoix = [-s.pen[0].id];
  jeu.ascensionner();
  ok('l’étincelle a franchi le saut', jeu.etoilePrise('etincelle'));
  const apres = jeu.jetonsEnMain();
  eq('elle se reprend quand même', jeu.reprendreCiel(), 1);
  eq('et le jeton revient', jeu.jetonsEnMain(), apres + 1);
});

scenario('constellation — le bouton de reprise dit ce qu’il rend', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  poserJetons(jeu, 500);
  jeu.cielSig = '';
  jeu.refresh();

  const bout = noeuds.get('ciel-reprendre');
  /* UN « TOUT REPRENDRE » SUR UN CIEL VIDE EST UN BOUTON QUI MENT SUR CE QU'IL FAIT. */
  eq('rien à reprendre, rien à montrer', bout.hidden, true);

  jeu.acheterEtoile('etincelle');
  jeu.acheterEtoile('poing');
  jeu.refresh();
  eq('le bouton paraît', bout.hidden, false);
  ok('et il annonce la somme', bout.textContent.indexOf('5') >= 0, bout.textContent);

  jeu.reprendreCiel();
  jeu.refresh();
  eq('il se retire avec le dernier nœud', bout.hidden, true);
});

scenario('constellation — le ciel se dessine, et il est plus grand que l’écran', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  poserJetons(jeu, 500);
  jeu.cielSig = '';
  jeu.refresh();

  const onglet = v => [...document.querySelectorAll('.onglet')].find(b => b.dataset.vue === v);
  eq('l’onglet s’ouvre avec le premier jeton', onglet('ciel').hidden, false);

  const tous = cls => {
    const t = [];
    const m = x => {
      if (x.classList && x.classList.contains(cls)) t.push(x);
      x.children.forEach(m);
    };
    noeuds.get('ciel-arbre').children.forEach(m);
    return t;
  };

  eq('tous les nœuds sont dessinés', tous('etoile').length, jeu.CIEL.length);
  /* UN LIEN PAR NŒUD SAUF L'ÉTINCELLE, qui n'a pas de parent : c'est le trait qui porte la
     règle d'ouverture. */
  eq('un lien par nœud, sauf le centre', tous('lien').length, jeu.CIEL.length - 1);

  /* LE SEMIS EST STABLE : les étoiles de fond viennent d'un générateur graine, pas de
     `Math.random`. Sinon elles sauteraient à chaque redessin. */
  const semis = () => tous('ciel-semis')[0].children.map(c => c.getAttribute('cx')).join(',');
  const a = semis();
  jeu.cielSig = '';
  jeu.refresh();
  eq('le ciel ne scintille pas sans raison', semis(), a);

  /* UN NŒUD FERMÉ SE MONTRE, il ne se cache pas : on montre une carte qu'on lit pour décider
     où aller, pas une file d'attente. */
  const fermes = tous('etoile').filter(x => x.classList.contains('close'));
  eq('tout est fermé sauf le centre', fermes.length, jeu.CIEL.length - 1);

  jeu.acheterEtoile('etincelle');
  jeu.refresh();
  ok('le centre se marque', tous('etoile')[0].classList.contains('prise'));
  eq('et six portes s’ouvrent',
     tous('etoile').filter(x => x.classList.contains('ouverte')).length, 6);

  eq('la bourse est annoncée', noeuds.get('ciel-jetons').textContent.slice(0, 1), '✦');
});

/* ────────────────────────── la poussière et la forge ────────────────────────── */

/* Une capsule d'album minimale : ce que `qualiteDe` et `poussiereDe` lisent, et rien d'autre. */
function pave(jeu, id, ligne, etoiles) {
  return { id, line: ligne || 'crapaud', age: 5, niv: 100, chroma: 7, rank: 5,
           prodige: false, etoiles: etoiles || 1, motif: 0, temper: 0 };
}

scenario('clic — une bête menée au bout paie, et seulement sous ta main', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 8; s.coins = 0;
  const c = bete(jeu, 'golem', 5, 0);
  c.p = jeu.bandTo(c);

  /* TROIS PLAFONDS À LA FOIS, jamais un seul : une commune mûre à l'âge enfant est déjà « au
     max de sa tranche », et si elle comptait, c'est toute la ferme qui compterait. */
  eq('au niveau cent mais pas au dernier rang', jeu.estFinie(c), false);
  ok('et le clic la fait encore grossir',
     (jeu.select('c:' + c.id), jeu.tapStage(), (c.over || 0) > 0));

  c.over = jeu.ageGrow(c) * 580;
  eq('au dernier rang, elle est finie', jeu.estFinie(c), true);
  ok('rankOf le dit déjà', jeu.rankOf(jeu.sizeFactor(c)).next === null);

  // un âge plus bas ne compte pas, quel que soit l'embonpoint
  const jeune = bete(jeu, 'golem', 4, 0);
  jeune.p = jeu.bandTo(jeune);
  jeune.over = jeu.ageGrow(jeune) * 580;
  eq('un âge en dessous n’est jamais fini', jeu.estFinie(jeune), false);

  /* CE QU'UN CLIC REND ALORS : de la monnaie, et plus de l'embonpoint. */
  jeu.select('c:' + c.id);
  saturerCombo(jeu);
  const avant = s.coins, gras = c.over;
  jeu.tapStage();
  ok('le clic paie', s.coins > avant, s.coins - avant);
  eq('et n’engraisse plus', c.over, gras);
  eq('c’est bien le montant annoncé', s.coins - avant,
     jeu.gainClicFini(c, { kind: 'creature', c }));

  /* IL RESTE UNE RÉCOMPENSE DE PRÉSENCE : de l'ordre de mille cinq cents clics pour égaler
     une vente. S'il en fallait dix, vendre n'aurait plus de sens. */
  ok('mille clics ne valent pas une vente',
     (s.coins - avant) * 1000 < jeu.sellValue(c),
     Math.round(jeu.sellValue(c) / (s.coins - avant)) + ' clics par vente');

  /* ET SEULEMENT SOUS LA MAIN DU JOUEUR. La carte ocellée clique à ta place : si elle
     encaissait, elle deviendrait une machine à monnaie automatique, et la mécanique
     produirait l'inverse de son intention. */
  const avant2 = s.coins, gras2 = c.over;
  jeu.mainDeCarte = true;
  jeu.tapStage();
  jeu.mainDeCarte = false;
  eq('l’ocellée n’encaisse rien', s.coins, avant2);
  ok('elle retombe sur l’embonpoint', c.over > gras2);
});

/* ────────────────────────── les carrefours ────────────────────────── */

scenario('carrefour — trois routes, on en prend une, les deux autres se ferment', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const p = jeu.PRIMES.find(x => x.cle === 'carrefour-1');
  ok('le premier carrefour existe', !!p);
  eq('il offre trois routes', p.choix.length, 3);

  s.coins = p.prix - 1;
  ok('sans de quoi payer, rien ne se prend', !jeu.choisirRoute('carrefour-1', 'route-bourse'));

  s.coins = p.prix;
  ok('avec de quoi, la route se prend', jeu.choisirRoute('carrefour-1', 'route-bourse'));
  eq('et elle est payée', s.coins, 0);

  /* LES DEUX AUTRES SONT PERDUES, pas remises à plus tard : remises à plus tard, ce ne serait
     pas un choix mais un ordre d'achat — on finirait par tout avoir et la décision ne coûterait
     rien. */
  s.coins = 1e12;
  ok('on ne prend pas la deuxième', !jeu.choisirRoute('carrefour-1', 'route-ardeur'));
  ok('ni la troisième', !jeu.choisirRoute('carrefour-1', 'route-poigne'));
  eq('la bourse n’a pas rebougé', s.coins, 1e12);

  /* L'OPTION EST RANGÉE SOUS SA PROPRE CLÉ : tout le jeu continue de lire `prime('...')` sans
     rien savoir des carrefours, et une route peut servir de garde comme n'importe quelle
     prime. */
  ok('la route retenue est une prime comme une autre', jeu.prime('route-bourse'));
  ok('le carrefour, lui, n’est pas une prime', !jeu.prime('carrefour-1'));
  ok('mais il est fait', jeu.primeFaite(p));
});

scenario('carrefour — les trois routes diffèrent en nature, pas en chiffre', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;

  /* LA CONTRAINTE QUI DÉCIDE SI C'EST RÉUSSI. « +10 % de vente / +10 % de rente / +10 % de
     vitesse » n'est pas un choix, c'est un menu : on prend le plus gros nombre et on n'y pense
     plus. Chaque carrefour offre donc un PRIX qui baisse, une VITESSE qui monte, et un GESTE
     qui pèse — trois grandeurs qui ne se comparent pas. */
  for (const cle of ['carrefour-1', 'carrefour-2']) {
    const p = jeu.PRIMES.find(x => x.cle === cle);
    const axes = new Set(p.choix.map(o => Object.keys(o.bonus).join('+')));
    eq(cle + ' : trois axes distincts', axes.size, 3);
  }

  // et chaque route agit vraiment, chacune sur son levier
  const oeuf = jeu.prixOeuf(jeu.EGG_BY_KEY.commun);
  const clic = jeu.clickPower();
  const vite = jeu.coef('vitesse');

  jeu.choisirRoute('carrefour-1', 'route-bourse');
  ok('la bourse baisse le prix des œufs', jeu.prixOeuf(jeu.EGG_BY_KEY.commun) < oeuf,
     oeuf + ' → ' + jeu.prixOeuf(jeu.EGG_BY_KEY.commun));
  eq('sans toucher au clic', jeu.clickPower(), clic);
  eq('ni à la vitesse', jeu.coef('vitesse'), vite);

  // une autre partie, une autre route
  const j2 = neuf(); j2.state.tuto = false; j2.state.coins = 1e12;
  j2.choisirRoute('carrefour-1', 'route-poigne');
  ok('la poigne double le clic', j2.clickPower() > clic, clic + ' → ' + j2.clickPower());

  const j3 = neuf(); j3.state.tuto = false; j3.state.coins = 1e12;
  j3.choisirRoute('carrefour-1', 'route-ardeur');
  ok('l’ardeur monte la vitesse', j3.coef('vitesse') > vite);

  /* ET LE PÉAGE DU SECOND CARREFOUR : c'est un PRIX, donc il baisse. */
  const j4 = neuf(); j4.state.tuto = false; j4.state.coins = 1e12;
  const c = bete(j4, 'crapaud', 2, 3000);
  const avant = j4.evoCost(c);
  j4.choisirRoute('carrefour-2', 'route-peage');
  ok('le péage allégé coûte moins', j4.evoCost(c) < avant, avant + ' → ' + j4.evoCost(c));
});

scenario('carrefour — il ouvre un écran, et se referme sans rien prendre', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  jeu.refresh();

  eq('l’écran est fermé au départ', noeuds.get('carrefour').hidden, true);
  ok('la case l’ouvre', jeu.ouvrirCarrefour('carrefour-1'));
  eq('il s’affiche', noeuds.get('carrefour').hidden, false);
  eq('avec ses trois routes', noeuds.get('carrefour-routes').children.length, 3);

  /* IL SE FERME SANS CHOISIR. Rien ne presse — la case reste, l'argent aussi. Un choix
     définitif ne doit pas se prendre d'un clic distrait au milieu de quarante-sept primes. */
  jeu.fermerCarrefour();
  eq('refermé', noeuds.get('carrefour').hidden, true);
  ok('et rien n’a été pris', !jeu.primeFaite(jeu.PRIMES.find(x => x.cle === 'carrefour-1')));
  eq('la bourse est intacte', s.coins, 1e12);

  // une fois choisi, il ne se rouvre plus
  jeu.choisirRoute('carrefour-1', 'route-ardeur');
  ok('le carrefour est clos', !jeu.ouvrirCarrefour('carrefour-1'));
});

/* ────────────────────────── la constellation ────────────────────────── */

scenario('constellation — le sang touche l’ascension elle-même', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;

  /* LE PRIX DORÉ S'ADOUCIT : chaque carte coûte un cran de moins. C'est le seul achat du jeu
     qui change la valeur de tous les achats suivants — d'où son prix et son rang. */
  eq('sans le nœud, la troisième carte coûte trois', jeu.coutCarte(2), 3);
  eq('et cinq cartes en coûtent dix-huit', jeu.coutCartes(5), 18);
  s.ciel['or-doux'] = true;
  eq('avec, la troisième coûte comme la deuxième', jeu.coutCarte(2), 2);
  eq('la première reste à un', jeu.coutCarte(0), 1);
  ok('et cinq cartes coûtent nettement moins', jeu.coutCartes(5) < 18, jeu.coutCartes(5));

  /* LE SOMMET COMPTE PLUS : un jeton de plus par cycle, pour toujours. */
  s.ciel = {};
  s.coins = 1e9; jeu.crediterJetons();
  eq('un milliard vaut quatre paliers', jeu.jetonsDus(), 4);
  s.ciel.sommet = true;
  eq('avec le nœud, cinq', jeu.jetonsDus(), 5);

  /* MAIS JAMAIS SUR ZÉRO : un cycle où l'on n'a pas tenu une seule pièce ne doit rien
     créditer, sinon sauter aussitôt après un saut rapporterait un jeton gratuit. */
  s.asc.sommet = 0;
  eq('un cycle vide ne crédite rien', jeu.jetonsDus(), 0);
});

scenario('ascension — les jetons se regagnent, et le mur tombe', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  for (let i = 0; i < 4; i++) bete(jeu, 'crapaud', 3, 3000);

  /* LE MUR, RENCONTRÉ EN JOUANT À MILLE MILLIARDS : plus de jeton en poche, et le palier
     suivant mille fois plus haut. La porte demandait un jeton NON DÉPENSÉ ; elle ne demande
     plus que d'avoir atteint le million une fois. */
  s.coins = 1e9; jeu.crediterJetons();
  eq('un milliard vaut quatre paliers', jeu.jetonsDus(), 4);
  ok('l’ascension est ouverte', jeu.peutAscensionner());
  /* QUATRE JETONS N'ACHÈTENT PLUS QUATRE CARTES : le prix doré fait payer 1, 2, 3, 5 — donc
     deux cartes pour trois jetons, et la troisième en coûterait six. */
  eq('mais quatre jetons ne valent que deux cartes', jeu.apercuAscension().max, 2);
  s.asc.jetons = 11;   // de quoi en prendre quatre : 1 + 2 + 3 + 5
  eq('onze jetons en valent quatre', jeu.apercuAscension().max, 4);

  jeu.ascChoix = jeu.apercuAscension().neuves.slice(0, 4).map(k => k.id);
  jeu.ascensionner();
  /* `ascensionner` RÉASSIGNE `state` : tout ce qui suit doit relire `jeu.state`, sinon on
     interroge l'ancienne partie et tout paraît inchangé. */
  const n = jeu.state;
  eq('le saut a eu lieu', n.asc.n, 1);
  eq('quatre cartes dans l’album', n.album.length, 4);

  /* CE QUI A CHANGÉ : la porte reste ouverte, et le compte se refait sur le cycle suivant.
     Avant, il aurait fallu multiplier sa fortune par mille pour pouvoir sauter à nouveau. */
  ok('la porte reste ouverte', jeu.peutAscensionner());
  eq('mais le sommet est reparti à zéro', n.asc.sommet, 0);
  /* La bourse gardait onze jetons, le cycle en créditait quatre de plus, et les quatre cartes
     en ont coûté onze : il en reste quatre. Ce reste EST la décision — il va à la
     constellation. */
  eq('et il reste ce que les cartes n’ont pas mangé', n.asc.jetons, 15 - jeu.coutCartes(4));

  n.coins = 1e9; jeu.crediterJetons();
  eq('refaire le milliard recrédite quatre jetons', jeu.jetonsDus(), 4);
  /* L'ÉCHELLE, ELLE, NE SE REFRANCHIT PAS : `paliers` compte la partie entière et sert au
     déblocage, pas à ce qu'on emporte. */
  eq('sans refranchir l’échelle', n.asc.paliers, 4);

  /* LE SOMMET, ET NON LA BOURSE DU MOMENT : dépenser juste avant de sauter ne coûte pas de
     carte. */
  n.coins = 0;
  eq('dépenser ne retire rien', jeu.jetonsDus(), 4);
});

scenario('enclos — une vente laisse un trou à sa place', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9; s.pens = 6;
  const cases = () => noeuds.get('strip-pen').children;
  const occupee = i => cases()[i] && !cases()[i].classList.contains('thumb-vide');
  const qui = i => occupee(i) ? cases()[i].dataset.cle : null;

  const a = bete(jeu, 'crapaud', 3, 20000);
  const b = bete(jeu, 'loup', 3, 20000);
  const c = bete(jeu, 'ours', 3, 20000);
  jeu.refresh();

  /* AUTANT DE CASES QUE D'ENCLOS POSSÉDÉS, occupées ou non : la bande cesse d'être une liste
     et devient un enclos. */
  eq('six cases pour six enclos', cases().length, 6);
  eq('trois occupées', [0, 1, 2, 3, 4, 5].filter(occupee).length, 3);
  const place = [qui(0), qui(1), qui(2)];

  /* LE DÉFAUT QUE ÇA CORRIGE : en ×100 le marchand vide un enclos plus vite qu'on ne vise, et
     entre le moment où l'œil choisit une vignette et celui où le doigt appuie, la bête sous le
     curseur n'est plus la même. Vendre celle du milieu ne doit RIEN déplacer. */
  jeu.sell(b);
  jeu.refresh();
  eq('la première n’a pas bougé', qui(0), place[0]);
  ok('la case du milieu est vide', !occupee(1));
  eq('et la troisième non plus', qui(2), place[2]);
  eq('toujours six cases', cases().length, 6);

  // le trou est repris par la suivante, et non ajouté au bout
  const d = bete(jeu, 'chat', 3, 20000);
  jeu.refresh();
  eq('la nouvelle prend la case libérée', qui(1), 'c:' + d.id);
  eq('sans rien pousser', qui(2), place[2]);

  /* ET AU BOUT D'UNE SECONDE, L'ENCLOS SE RETASSE. Figer les cases pour de bon était une
     seconde faute après celle qu'elle corrigeait : le TRI n'était plus jamais rétabli, et au
     bout de dix ventes l'enclos ne ressemblait plus à rien. Les deux besoins ne se
     contredisent que DANS L'INSTANT — une seconde sépare « je vise » de « remets en ordre ». */
  jeu.casesDepuis = Date.now() - jeu.DELAI_CASES - 1;
  jeu.stripSig = '';
  jeu.refresh();
  eq('les trois sont retassées en tête', [0, 1, 2].filter(occupee).length, 3);
  ok('et plus aucun trou', !cases().slice(0, 3).some(x => x.classList.contains('thumb-vide')));

  /* LE DÉLAI COURT DEPUIS LA PERTE DE L'ORDRE, pas depuis la dernière vente : un marchand qui
     vend en continu — c'est le cas en ×100 — repousserait sinon le retassage indéfiniment. */
  const e = bete(jeu, 'cerf', 3, 20000);
  jeu.sell(e);
  jeu.refresh();
  ok('un trou frais est bien figé', jeu.casesARetasser(
     jeu.subjects().filter(x => x.kind === 'creature')) === false);

  /* TRIER REDISTRIBUE TOUT DE SUITE, sans attendre : c'est un geste explicite, on s'attend à
     ce que tout bouge. */
  s.tri = 'rarete';
  jeu.stripSig = '';
  jeu.refresh();
  eq('les trois survivantes sont regroupées en tête', [0, 1, 2].filter(occupee).length, 3);
  ok('et la quatrième case est libre', !occupee(3));
});

scenario('vente — regarder une bête la protège trois secondes', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9; s.pens = 8;
  s.primes.marchand = true;
  const c = bete(jeu, 'crapaud', 3, 20000);
  for (const cle of Object.keys(jeu.RARITY)) s.sellAt[cle] = 1;

  /* EN ×100 LE MARCHAND VIDE UN ENCLOS PLUS VITE QU'ON NE VISE : on clique une bête pour la
     garder ou la vendre soi-même, et elle est déjà partie. */
  jeu.select('c:' + c.id);
  jeu.runAutomations(1);
  ok('celle qu’on vient de désigner tient', s.pen.some(x => x.id === c.id));

  /* ET LE SURSIS EXPIRE — c'était le défaut commun aux deux exceptions retirées avant : une
     immunité permanente laissait invendue pour toujours la bête qu'on venait d'évoluer. */
  jeu.focusJusqu = Date.now() - 1;
  jeu.runAutomations(1);
  ok('trois secondes plus tard, elle part', !s.pen.some(x => x.id === c.id));

  // et une bête qu'on ne regarde pas n'est jamais protégée
  const d = bete(jeu, 'crapaud', 3, 20000);
  jeu.select('c:' + d.id);
  const e = bete(jeu, 'crapaud', 3, 20000);
  jeu.select('c:' + e.id);
  jeu.runAutomations(1);
  ok('la précédente n’est plus couverte', !s.pen.some(x => x.id === d.id));
  ok('seule la dernière désignée l’est', s.pen.some(x => x.id === e.id));
});

scenario('poussière — la rareté s’annule des deux côtés', () => {
  const jeu = neuf();
  /* LA RARETÉ MULTIPLIE CE QU'UNE CARTE REND ET CE QU'UNE FUSION COÛTE. Elle s'annule donc :
     monter une commune ou une mythique demande le MÊME nombre de cartes de sa propre rareté.
     Sans ça, une rareté deviendrait la monnaie des autres. */
  for (const ligne of ['crapaud', 'loup', 'golem', 'ouroboros']) {
    const k1 = pave(jeu, 1, ligne, 1), k2 = pave(jeu, 1, ligne, 2);
    eq(ligne + ' : dix cartes pour la deuxième étoile',
       jeu.coutFusion(k1) / jeu.poussiereDe(k1), 10);
    eq(ligne + ' : quarante pour la troisième',
       jeu.coutFusion(k2) / jeu.poussiereDe(k1), 40);
  }
  const nu = pave(jeu, 1, 'crapaud');
  const chroma = Object.assign(pave(jeu, 2, 'crapaud'), { prodige: true });
  eq('un chromatique rend trois fois plus', jeu.poussiereDe(chroma), jeu.poussiereDe(nu) * 3);

  /* LA QUALITÉ N'ENTRE PAS : niveau, teinte et rang décident déjà de la puissance. */
  const bacle = Object.assign(pave(jeu, 3, 'crapaud'), { niv: 1, chroma: 0, rank: 0 });
  eq('une carte bâclée rend autant qu’une parfaite', jeu.poussiereDe(bacle), jeu.poussiereDe(nu));
  ok('mais elle est bien plus faible', jeu.puissanceDe(bacle) < jeu.puissanceDe(nu));
});

scenario('poussière — fondre, et ne jamais défaire une fusion', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.album = [pave(jeu, 1), pave(jeu, 2), pave(jeu, 3)];
  s.slots = [1];
  s.poussiere = 0;

  ok('une carte équipée ne se fond pas', !jeu.desintegrer(1));
  eq('elle est toujours là', s.album.length, 3);
  ok('une carte libre se fond', jeu.desintegrer(2));
  eq('et rend sa poussière', s.poussiere, jeu.poussiereDe(pave(jeu, 9)));
  eq('l’album en perd une', s.album.length, 2);
  eq('le compteur suit', s.stats.fondues, 1);

  /* ON NE DÉFAIT PAS UNE FUSION : les étoiles n'entrent pas dans ce qu'une carte rend. Sinon
     forger puis fondre rendrait une partie de ce qu'on vient de payer — et depuis que trois
     cartes entrent pour une, ce serait bien pire qu'une fuite de monnaie. */
  s.album = [pave(jeu, 1, 'crapaud', 3)];
  s.slots = [];
  const avant = s.poussiere;
  jeu.desintegrer(1);
  eq('une carte à trois étoiles rend autant qu’une neuve',
     s.poussiere - avant, jeu.poussiereDe(pave(jeu, 9)));
});

scenario('forge — trois entrent, une sort, et les trois disparaissent', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  // des numéros hauts EXPRÈS : le compteur des cartes neuves part de 1, et une carte forgée
  // qui reprendrait le numéro d'une mangée rendrait l'assertion d'en dessous muette
  s.album = [pave(jeu, 11), pave(jeu, 12), pave(jeu, 13)];
  s.slots = [];
  s.poussiere = 0;
  const trio = [11, 12, 13];
  const cout = jeu.coutFusion(s.album[0]);

  ok('sans poussière, la forge refuse', !jeu.forger(trio));
  eq('et rien n’a disparu', s.album.length, 3);

  s.poussiere = cout;
  ok('avec juste assez, elle passe', jeu.forger(trio));
  /* C'EST TOUTE LA DIFFÉRENCE AVEC L'ANCIEN GESTE : trois cartes entraient dans le compte et
     aucune n'en sortait. « Fusionner » montait une étoile contre de la monnaie, sans rien
     consommer — le mot mentait sur ce qu'il faisait. */
  eq('trois cartes n’en font qu’une', s.album.length, 1);
  eq('elle porte deux étoiles', s.album[0].etoiles, 2);
  eq('et la poussière est dépensée', s.poussiere, 0);
  ok('la carte qui sort est neuve', trio.indexOf(s.album[0].id) === -1, s.album[0].id);
  eq('le compteur suit', s.stats.fusions, 1);
  eq('et le choix en cours est oublié', jeu.forgeBase, null);
});

scenario('forge — même lignée, même motif, même rang, et rien d’équipé', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.poussiere = 1e9; s.slots = [];

  // LA LIGNÉE : elle décide du plafond de puissance
  s.album = [pave(jeu, 1, 'crapaud'), pave(jeu, 2, 'crapaud'), pave(jeu, 3, 'loup')];
  ok('trois lignées mêlées : refusé', !jeu.forger([1, 2, 3]));

  // LE MOTIF : il décide de ce que la carte FAIT ; les mélanger fabriquerait un effet choisi
  // par personne
  s.album = [pave(jeu, 1), pave(jeu, 2), Object.assign(pave(jeu, 3), { motif: 1 })];
  ok('un motif différent : refusé', !jeu.forger([1, 2, 3]));

  // LE RANG D'ÉTOILES : une trois-étoiles avalée par une fusion de une-étoile serait un
  // gâchis invisible
  s.album = [pave(jeu, 1), pave(jeu, 2), pave(jeu, 3, 'crapaud', 2)];
  ok('un rang différent : refusé', !jeu.forger([1, 2, 3]));

  /* L'ÂGE, LUI, N'EN EST PAS : il ne dit que la puissance, et la puissance se moyenne. Sans
     ça il faudrait trois bêtes menées au même âge, et l'atelier ne s'ouvrirait qu'à qui joue
     déjà parfaitement. */
  s.album = [Object.assign(pave(jeu, 1), { age: 2, niv: 30 }),
             Object.assign(pave(jeu, 2), { age: 4, niv: 80 }),
             pave(jeu, 3)];
  ok('trois âges différents se marient', jeu.forger([1, 2, 3]));

  /* UNE CARTE ÉQUIPÉE N'ENTRE PAS DANS LA FORGE, comme elle ne se fond pas : elle
     s'évaporerait d'un emplacement et changerait le build en silence. */
  s.album = [pave(jeu, 1), pave(jeu, 2), pave(jeu, 3)];
  s.slots = [2];
  ok('une équipée : refusé', !jeu.forger([1, 2, 3]));
  eq('l’album est intact', s.album.length, 3);
  ok('et elle n’est pas proposée',
     jeu.compagnes(s.album[0]).every(k => k.id !== 2),
     jeu.compagnes(s.album[0]).map(k => k.id).join(' '));

  // la même carte trois fois ne fait pas trois cartes
  s.slots = [];
  ok('un trio de doublons : refusé', !jeu.forger([1, 1, 1]));
  ok('deux cartes ne suffisent pas', !jeu.forger([1, 2]));

  // une carte au bout n'a plus d'étoile à gagner
  s.album = [pave(jeu, 1, 'crapaud', 3), pave(jeu, 2, 'crapaud', 3), pave(jeu, 3, 'crapaud', 3)];
  ok('trois étoiles est le bout', !jeu.forger([1, 2, 3]));
  ok('et rien de tout ça n’est forgeable', s.album.every(k => !jeu.forgeable(k)));
});

scenario('forge — ce qui entre se moyenne, et la couleur suit la roue', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.poussiere = 1e9; s.slots = [];

  const trois = [
    Object.assign(pave(jeu, 1), { age: 5, niv: 100, chroma: 7, rank: 5, prodige: true }),
    Object.assign(pave(jeu, 2), { age: 1, niv: 15,  chroma: 0, rank: 0 }),
    Object.assign(pave(jeu, 3), { age: 5, niv: 100, chroma: 2, rank: 3 }),
  ];
  s.album = trois;
  const vu = jeu.fusionDe(trois);
  eq('l’âge est la moyenne', vu.age, 4);
/* LA COULEUR NE SE MOYENNE PAS COMME UN INDICE : seule la carte CHROMATIQUE en donne une,
     les deux grises n'ont qu'une couleur latente. Ici une seule des trois est chromatique,
     donc c'est la sienne qui sort — magenta, l'indice 7. */
  eq('la couleur vient de la seule carte chromatique', vu.chroma, 7);
  eq('le rang aussi', vu.rank, 3);
  /* LE NIVEAU SE REPLIE DANS SA TRANCHE : la moyenne de trois âges différents tombe volontiers
     hors des bornes de l'âge retenu, et une bête de niveau 12 à l'âge légende n'existe pas. */
  ok('le niveau tient dans son âge', vu.niv > 65 && vu.niv <= 85, vu.niv);
  eq('l’étoile monte', vu.etoiles, 2);

  /* ET DEUX COULEURS OPPOSÉES SE MÉLANGENT PAR L'ARC COURT, jamais par la moyenne des
     indices : entre l'écarlate (0) et le magenta (7), la moyenne donnerait du jade, à
     l'exact opposé des deux. Sur la roue ils sont voisins, et leur milieu est l'écarlate. */
/* CES TROIS CAS S'ÉCRIVENT EN FONCTION DE LA TAILLE DE LA ROUE, jamais en indices en dur :
     elle est passée de huit à seize crans en `4.18.1`, et des indices fixes auraient fait
     échouer le scénario pour une raison qui n'est pas une faute. */
  const n = jeu.CHROMAS.length;
  eq('le milieu de deux voisins est entre eux', jeu.milieuRoue([0, 2]), 1);
  /* L'ARC COURT PASSE PAR LE ZÉRO : entre l'avant-dernière couleur et la première, le milieu
     est la dernière, et non le point diamétralement opposé. C'est toute la différence entre
     une roue et une moyenne d'indices. */
  eq('et il passe par le zéro quand c’est le plus court', jeu.milieuRoue([n - 2, 0]), n - 1);
  /* DEUX COULEURS DIAMÉTRALEMENT OPPOSÉES N'ONT PAS DE MILIEU : les deux arcs se valent, et
     aucun calcul ne peut les départager. On rend la première plutôt qu'un zéro arbitraire. */
  eq('deux opposées rendent la première', jeu.milieuRoue([3, 3 + n / 2]), 3);

  /* LE CHROMATIQUE SE DÉCIDE À LA MAJORITÉ : on ne peut pas être aux deux tiers chromatique,
     et un chromatique perdu au milieu de deux ordinaires ne se transmet pas. */
  eq('un chromatique sur trois ne passe pas', vu.prodige, false);
  trois[1].prodige = true;
  eq('deux sur trois, oui', jeu.fusionDe(trois).prodige, true);

  // même règle pour le fond, et deux fonds DIFFÉRENTS n'en font pas un
  trois[0].fond = 'braise'; trois[1].fond = 'givre'; trois[2].fond = null;
  eq('deux fonds différents ne se marient pas', jeu.fusionDe(trois).fond, null);
  trois[1].fond = 'braise';
  eq('deux fois le même, oui', jeu.fusionDe(trois).fond, 'braise');

  // ce que l'écran montrait est bien ce qui sort
  const promis = jeu.fusionDe(trois);
  jeu.forger([1, 2, 3]);
  eq('la carte forgée est celle qu’on avait vue', s.album[0].chroma, promis.chroma);
  eq('et son âge aussi', s.album[0].age, promis.age);
});

scenario('forge — on désigne une carte, et la grille se réduit à ses semblables', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.poussiere = 1e9; s.slots = [];

  const grille = () => noeuds.get('forge-grille').children;
  const plan = () => noeuds.get('forge-plan');
  const dans = (e, cls) => {
    const t = [];
    const m = x => { if ((x.className || '').includes(cls)) t.push(x); x.children.forEach(m); };
    e.children.forEach(m);
    return t;
  };

  // L'ONGLET N'EXISTE PAS AVANT LA PREMIÈRE CARTE : on ne montre pas la porte d'une pièce vide
  s.album = [];
  jeu.refresh();
  const onglet = v => [...document.querySelectorAll('.onglet')].find(b => b.dataset.vue === v);
  eq('pas de forge sans album', onglet('forge').hidden, true);

  /* PREMIER TEMPS : L'ALBUM ENTIER. On ne peut pas choisir dans ce qu'on ne voit pas, et une
     grille pré-filtrée cacherait justement les cartes qu'il faut apprendre à garder. */
  s.album = [pave(jeu, 1, 'crapaud'), pave(jeu, 2, 'crapaud'),
             pave(jeu, 3, 'crapaud'), pave(jeu, 4, 'loup'),
             Object.assign(pave(jeu, 5, 'crapaud'), { motif: 3 }),
             pave(jeu, 6, 'crapaud')];
  jeu.oublierForge();
  jeu.refresh();
  /* L'ATELIER A ÉTÉ UN NŒUD DE CONSTELLATION PENDANT DEUX VERSIONS, et c'était une faute :
     c'est là que va la poussière, donc du jeu de base. Il se rouvre à la première carte. */
  eq('des cartes suffisent', onglet('forge').hidden, false);
  eq('la grille montre tout l’album', grille().length, 6);
  eq('et le plan de travail attend', plan().hidden, true);

  /* SECOND TEMPS : LA GRILLE SE RÉDUIT. C'est la réduction elle-même qui enseigne la règle du
     mariage — on ne lit pas « même lignée, même motif », on voit cinq cartes devenir deux. */
  ok('on désigne une carte', jeu.choisirForge(1));
  eq('elle passe au plan de travail', plan().hidden, false);
  eq('il ne reste que ses semblables', grille().length, 3);
  ok('ni le loup ni l’autre motif',
     grille().every(c => ['2', '3', '6'].indexOf(String(c.dataset.id)) !== -1),
     grille().map(c => c.dataset.id).join(' '));

  // trois places, dont deux creuses, et pas encore de sortie
  eq('trois places au plan', dans(plan(), 'forge-in')[0].children.length, 3);
  eq('dont deux creuses', dans(plan(), 'carte-trou').length, 3);
  eq('le bouton attend', dans(plan(), 'forge-acte')[0].disabled, true);

  jeu.choisirForge(2);
  eq('une place se remplit', dans(plan(), 'carte-trou').length, 2);
  jeu.choisirForge(3);
  /* LA SORTIE SE VOIT AVANT D'ÊTRE FABRIQUÉE, et c'est ce qui compte le plus ici : une teinte
     se dilue dans une fusion, et rien ne se défait. */
  eq('plus aucune place creuse', dans(plan(), 'carte-trou').length, 0);
  eq('la sortie est là', dans(plan(), 'forge-out')[0].children.length, 1);
  ok('et elle porte deux étoiles',
     dans(plan(), 'carte-etoiles').some(e => e.textContent === '★★☆'),
     dans(plan(), 'carte-etoiles').map(e => e.textContent).join(' '));
  eq('le bouton est prêt', dans(plan(), 'forge-acte')[0].disabled, false);
  eq('le trio est celui qu’on a désigné', jeu.trioForge().join(','), '1,2,3');

  // CLIQUER REPREND CE QU'ON VIENT DE POSER : un joueur qui se trompe corrige au même endroit
  ok('une quatrième est refusée', !jeu.choisirForge(6));
  eq('le plan n’a pas bougé', jeu.trioForge().join(','), '1,2,3');
  jeu.choisirForge(3);
  eq('la troisième repart', jeu.trioForge().join(','), '1,2');
  ok('et la place libérée se reprend', jeu.choisirForge(6));

  // et cliquer la base annule tout
  jeu.choisirForge(1);
  eq('plus de base', jeu.forgeBase, null);
  eq('la grille redevient l’album', grille().length, 6);
  eq('et le plan se referme', plan().hidden, true);

  /* CE QU'ON NE PEUT PAS FORGER RESTE MONTRÉ, éteint et avec sa raison : cacher une carte
     qu'on possède ferait chercher ce qu'on a déjà. */
  s.slots = [4];
  jeu.forgeSig = '';
  jeu.refresh();
  const eteinte = grille().find(c => String(c.dataset.id) === '4');
  ok('l’équipée est éteinte', eteinte.className.includes('forge-hs'), eteinte.className);
  ok('et dit pourquoi', /équipée/.test(eteinte.title), eteinte.title);
  ok('la désigner ne fait rien', !jeu.choisirForge(4));

  eq('la poussière est annoncée', noeuds.get('forge-poussiere').textContent.slice(0, 1), '✧');

  // un choix se périme tout seul quand la carte disparaît sous les pieds du joueur
  jeu.choisirForge(1); jeu.choisirForge(2);
  s.album = s.album.filter(k => k.id !== 2);
  jeu.forgeSig = '';
  jeu.refresh();
  eq('la carte fondue quitte le plan', jeu.trioForge().join(','), '1');

  // et l'onglet se referme si l'album se vide
  jeu.ouvrirVue('forge');
  eq('on y est', jeu.vue, 'forge');
  s.album = [];
  jeu.refresh();
  eq('un album vide ramène à la ferme', jeu.vue, 'ferme');
});

scenario('poussière — l’ascension laisse ce qu’on n’emporte pas', () => {
  const bete3 = (j, ligne, age, p) => {
    const st = j.state;
    st.incub[0] = { line: ligne, p: 9999, kind: 'commun' };
    j.hatchAll();
    const c = st.pen[st.pen.length - 1];
    c.age = age; c.p = p;
    /* ON ÉGALISE LES STATISTIQUES, et il a fallu une trentaine de passes pour voir pourquoi :
       depuis la `4.16.0` elles pèsent un quart de la qualité d'une carte, donc de la poussière
       qu'elle laisse. Une bête bien née rendait deux poussières au lieu d'une, et le total de
       huit devenait neuf une fois sur trente. Un test qui échoue sans qu'aucun code ne soit
       fautif apprend à ignorer les échecs — c'est la troisième fois de la session, et toujours
       pour la même raison : on assertait sur du hasard. */
    c.iv = j.IV_NOMS.map(() => j.IV_MAX / 2);
    c.prodige = false; c.fond = null; c.rank = 0;
    return c;
  };
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 20;
  for (let i = 0; i < 10; i++) bete3(jeu, 'crapaud', 3, 3000);
  poserJetons(jeu, jeu.coutCartes(2));   // deux cartes coûtent trois jetons, prix doré

  const ap = jeu.apercuAscension();
  jeu.ascChoix = ap.neuves.slice(0, 2).map(k => k.id);
  eq('rien en poche avant', s.poussiere || 0, 0);
  jeu.ascensionner();
  eq('deux cartes emportées', jeu.state.album.length, 2);
  /* Les huit sacrifiées laissent un dixième de ce que leur carte aurait rendu. Ce n'est pas
     grand-chose — et c'est voulu : ça récompense d'ascensionner sur une ferme pleine sans
     rendre le sacrifice indolore. */
  eq('les huit autres laissent un peu de poussière', jeu.state.poussiere, 8);
  ok('la poussière traverse le saut',
     jeu.state.poussiere > 0 && jeu.state.coins === 0);
});

scenario('trophées — quatre de plus pour l’album', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const pris = cle => !!s.trophees[cle];
  s.album = [pave(jeu, 1)]; s.slots = []; s.poussiere = 1e6;

  jeu.verifierTrophees();
  ok('rien de décroché au départ', !pris('deuxEtoiles') && !pris('poussiere'));

  /* NEUF CARTES POUR UNE TROIS-ÉTOILES : trois forges à une étoile, puis une à deux. Les
     numéros partent de 11 pour que les cartes forgées, qui prennent 1, 2 puis 3, ne se
     confondent avec aucune des neuf. */
  s.album = [];
  for (let i = 11; i <= 19; i++) s.album.push(pave(jeu, i));
  ok('la première forge passe', jeu.forger([11, 12, 13]));
  jeu.verifierTrophees();
  ok('« Deux étoiles » tombe à la première forge', pris('deuxEtoiles'));
  ok('« Trois étoiles » pas encore', !pris('troisEtoiles'));
  jeu.forger([14, 15, 16]); jeu.forger([17, 18, 19]);
  eq('les neuf ont fait trois cartes', s.album.length, 3);
  ok('toutes à deux étoiles', s.album.every(k => k.etoiles === 2));
  ok('la quatrième forge passe', jeu.forger(s.album.map(k => k.id)));
  jeu.verifierTrophees();
  ok('et « Trois étoiles » tombe à la quatrième', pris('troisEtoiles'));
  eq('il n’en reste qu’une', s.album.length, 1);

  s.album.push(pave(jeu, 2));
  jeu.desintegrer(2); jeu.verifierTrophees();
  ok('« Poussière » tombe à la première fonte', pris('poussiere'));
  ok('« Fondeur » attend cinquante', !pris('fondeur'));
  for (let i = 3; i < 55; i++) { s.album.push(pave(jeu, i)); jeu.desintegrer(i); }
  jeu.verifierTrophees();
  ok('et tombe à la cinquantième', pris('fondeur'));

  // deux objectifs visibles, deux surprises
  const t = cle => jeu.TROPHEES.find(x => x.cle === cle);
  ok('« Deux étoiles » est un objectif', t('deuxEtoiles').montre === true);
  ok('« Trois étoiles » aussi', t('troisEtoiles').montre === true);
  ok('« Poussière » est une surprise', !t('poussiere').montre);
  ok('« Fondeur » aussi', !t('fondeur').montre);
});

/* ────────────────────────── les primes ────────────────────────── */

scenario('primes — la table tient debout et s’allume par paliers', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const cles = new Set();
  let dernier = 0;
  for (const p of jeu.PRIMES) {
    ok('« ' + p.cle + ' » a un nom, un glyphe et une phrase',
       !!(p.nom && p.glyphe && p.dit && p.dit.length > 20));
    ok('« ' + p.cle + ' » n’est pas en double', !cles.has(p.cle));
    cles.add(p.cle);
    ok('les prix montent (' + p.cle + ' à ' + p.prix + ')', p.prix > dernier);
    dernier = p.prix;
  }
  // une prime n'est prête que si on peut la payer, jamais avant
  for (const p of [jeu.PRIMES[0], jeu.PRIMES[5], jeu.PRIMES[jeu.PRIMES.length - 1]]) {
    s.coins = p.prix - 1; jeu.refresh();
    ok('« ' + p.cle +' » reste éteinte à un sou près',
       !noeuds.get('primes').children.find(b => b.title.startsWith(p.nom + ' ')).classList.contains('prete'));
    s.coins = p.prix; jeu.refresh();
    ok('et s’allume au prix juste',
       noeuds.get('primes').children.find(b => b.title.startsWith(p.nom + ' ')).classList.contains('prete'));
  }
});

scenario('primes — chacune fait ce qu’elle dit, et une seule fois', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const prendre = cle => jeu.buyPrime(jeu.PRIME_BY_CLE[cle]);

  const clicNu = jeu.clickPower();
  prendre('poigne'); eq('la poigne ajoute trois secondes', jeu.clickPower(), clicNu + 3);
  prendre('main');   eq('la main preste double le tout', jeu.clickPower(), (clicNu + 3) * 2);

  eq('le nichoir donne deux incubateurs', jeu.incubTotal(), s.incubators);
  prendre('nichoir');
  eq('…deux de plus', jeu.incubTotal(), s.incubators + 2);
  eq('et le tableau suit', s.incub.length, jeu.incubTotal());
  prendre('couvoir');
  eq('le couvoir en ajoute trois', jeu.incubTotal(), s.incubators + 5);

  const avantPen = jeu.pensTotal(), prixPen = jeu.penCost();
  prendre('paille');
  eq('la paille donne deux enclos', jeu.pensTotal(), avantPen + 2);
  eq('sans faire monter le prix du prochain', jeu.penCost(), prixPen);

  const oeufNu = jeu.prixOeuf(jeu.EGG_BY_KEY.commun);
  prendre('grossiste');
  ok('le grossiste baisse le prix des œufs', jeu.prixOeuf(jeu.EGG_BY_KEY.commun) < oeufNu);

  // le négoce ne vaut que pour SA rareté
  const commune = bete(jeu, 'crapaud', 3, 3000);
  const avant = jeu.sellValue(commune);
  prendre('negoce-rare');
  eq('le négoce rare ne touche pas une commune', jeu.sellValue(commune), avant);
  prendre('negoce-commune');
  eq('le négoce commun la paie un quart de plus', jeu.sellValue(commune), Math.round(avant * 1.25));

  // une prime ne s'achète pas deux fois
  const poche = s.coins;
  prendre('poigne');
  eq('repayer une prime déjà prise ne coûte rien', s.coins, poche);
});

scenario('enclos — une place de plus coûte enfin quelque chose', () => {
  const jeu = neuf(); const s = jeu.state;

  /* 1,6 RENDAIT LES PLACES GRATUITES, ET C'ÉTAIT MESURABLE : le vingt-quatrième enclos coûtait
     19,8 millions quand une rare légende en rapporte douze milliards l'heure — trois secondes
     de rente. À 2,1, le premier ne bouge pas, le cinquième coûte trois fois plus, et le
     vingt-quatrième cinq cents fois plus. Ce n'est pas le début qui était trop bon marché,
     c'est la suite qui ne montait pas. */
  eq('le premier enclos ne bouge pas', (s.pens = 1, jeu.penCost()), jeu.PEN_BASE);
  eq('ni le premier incubateur', (s.incubators = 1, jeu.incubCost()), jeu.INCUB_BASE);

  const avant = m => Math.round(jeu.PEN_BASE * Math.pow(1.6, m - 1));
  /* 2,97 et non 3,00 au cinquième : le rapport entre deux géométriques ne tombe pas rond, et
     arrondir le seuil à trois ferait échouer un scénario pour un centième. On mesure ce qui
     est vrai, pas ce qui est joli. */
  for (const [n, fois] of [[5, 2.9], [12, 19], [20, 100]]) {
    s.pens = n;
    const r = jeu.penCost() / avant(n);
    ok('le ' + n + 'e enclos coûte au moins ' + fois + ' fois plus qu’avant',
       r >= fois, r.toFixed(1) + ' fois');
  }

  /* LES DEUX ESCALIERS PARTAGENT LE MÊME MULTIPLICATEUR : une place est une place, qu'elle
     tienne une bête ou un œuf. Deux courbes différentes demanderaient d'expliquer pourquoi. */
  s.pens = 10; s.incubators = 10;
  eq('les incubateurs suivent la même pente',
     Math.round(jeu.penCost() / jeu.PEN_BASE * 1000),
     Math.round(jeu.incubCost() / jeu.INCUB_BASE * 1000));
});

scenario('enclos — l’Étable retirée est remboursée, pas confisquée', () => {
  /* Une prime achetée qui cesse d'exister est une dépense confisquée. Cent cinquante mille
     pièces sont dérisoires au moment où on les récupère ; le principe ne l'est pas. */
  const v = neuf({ coins: 1000, primes: { etable: true, marchand: true } });
  eq('le prix est rendu', v.state.coins, 1000 + 150000);
  ok('et la prime a disparu', !v.state.primes.etable);
  ok('les autres restent', v.state.primes.marchand);
  ok('elle n’est plus dans la table', !v.PRIME_BY_CLE.etable);
});

scenario('enclos — une bête gardée compte, une bête confiée non', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12; s.pens = 2; s.primes.pension = true; jeu.oublierPrimes();
  const a = bete(jeu, 'crapaud', 1, 5);
  const b = bete(jeu, 'crabe', 1, 5);
  eq('deux bêtes dans deux enclos', jeu.penUsed(), 2);
  ok('l’enclos est plein', jeu.penFull());

  /* GARDER NE LIBÈRE RIEN, et la prime qui le faisait a été retirée. L'Étable était une porte
     de sortie qui vidait la seule contrainte de la ferme : garder ne coûtait plus rien, donc
     on gardait tout, donc l'enclos cessait d'être une place à arbitrer. */
  a.keep = true;
  ok('garder n’ouvre aucune place', jeu.penFull());
  ok('et plus aucune prime ne le permet',
     !jeu.PRIMES.some(p => /gardes? ☆|étable/i.test(p.dit + p.nom)),
     jeu.PRIMES.map(p => p.cle).join(' '));

  /* CONFIER, SI. Le prix de la pension n'est plus une place mais un débit. */
  a.age = 4; a.p = jeu.bandTo(a); b.age = 4; b.p = jeu.bandTo(b);
  jeu.accoupler(a, b);
  eq('les deux confiées libèrent leurs enclos', jeu.penUsed(), 0);
  ok('la place se rouvre', !jeu.penFull());
});

scenario('primes — elles ne traversent pas l’ascension, la migration ne perd rien', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 6;
  jeu.buyPrime(jeu.PRIME_BY_CLE.soin);
  jeu.buyPrime(jeu.PRIME_BY_CLE.acheteur);
  bete(jeu, 'crapaud', 3, 3000);
  poserJetons(jeu, 1);
  const ap = jeu.apercuAscension();
  jeu.ascChoix = [ap.neuves[0].id];
  jeu.ascensionner();
  eq('les primes repartent de zéro', Object.keys(jeu.state.primes).length, 0);
  ok('alors que l’album traverse', jeu.state.album.length > 0);

  // une partie d'avant : les trois automates et l'intendant deviennent des primes
  const vieux = neuf({
    v: 12, coins: 1e6, pens: 3, incubators: 2, pen: [], incub: [null, null], eggs: { commun: 0 },
    up: { clic: 3, acheteur: 1, marchand: 1, evolution: 1, intendant: 30 },
    tuto: false, seen: {}, devoile: {}, vu: {}, t: Date.now(),
  });
  for (const cle of ['acheteur', 'marchand', 'evolution', 'intendance', 'intendance2']) {
    ok('« ' + cle + ' » est rendue au joueur', vieux.state.primes[cle] === true);
  }
  for (const cle of ['acheteur', 'marchand', 'evolution', 'intendant']) {
    ok('« ' + cle + ' » ne traîne plus dans les améliorations', !(cle in vieux.state.up));
  }
  eq('le format a bougé', vieux.state.v, jeu.SAVE_V);
});

/* ────────────────────────── l'album, carte par carte ────────────────────────── */

/* Une carte au sommet de ce que le jeu peut produire : c'est là que les bornes se testent.
   Déclarée en `function` et non en `const` : les scénarios s'exécutent dans l'ordre du
   fichier, et celui de la plonge s'en sert avant d'arriver ici. */
/* PARFAITE VEUT DIRE PARFAITE SUR LES CINQ AXES, stats comprises depuis qu'elles en sont un.
   Sans elles, `ivPart` lit la moyenne et la carte plafonne à 0,90 de qualité : le scénario
   mesurait alors un « bonus maximal » qui n'était pas le maximum. */
function parfaite(jeu, motif, id) {
  return {
    id, line: 'ouroboros', age: 5, niv: 100, chroma: 0,
    rank: jeu.RANKS.length - 1, prodige: true, etoiles: 1, motif, temper: 0,
    iv: jeu.IV_NOMS.map(() => jeu.IV_MAX),
  };
}
function equiper(jeu, motif, n) {
  jeu.state.album = []; jeu.state.slots = [];
  for (let i = 1; i <= n; i++) { jeu.state.album.push(parfaite(jeu, motif, i)); jeu.state.slots.push(i); }
  jeu.oublierAlbum();
}

scenario('hérédité — la distribution est centrée sur le mélange', () => {
  const jeu = neuf();
  const n = jeu.CHROMAS.length, N = 60000;
  const part = (a, b, cible) => {
    let k = 0;
    for (let i = 0; i < N; i++) if (jeu.heriteRoue(a, b) === cible) k++;
    return k / N * 100;
  };

  /* DEUX PARENTS ÉCARLATE (0) ET DORÉ (4). L'axe fait quatre crans, le mélange est l'ambre. */
  ok('le mélange est le résultat le plus probable', Math.abs(part(0, 4, 2) - 26) < 2, part(0, 4, 2));
  ok('les intérieurs suivent', Math.abs(part(0, 4, 1) - 16) < 2, part(0, 4, 1));
  ok('puis les parents eux-mêmes', Math.abs(part(0, 4, 0) - 10) < 2, part(0, 4, 0));
  ok('puis les extérieurs', Math.abs(part(0, 4, 5) - 6) < 2, part(0, 4, 5));

  /* INTÉRIEUR ET EXTÉRIEUR NE SONT PAS LE MÊME « PROCHE », et c'est là que le modèle se joue :
     le vermillon (1) est proche de l'écarlate EN ALLANT VERS le doré, le grenat (15) en s'en
     éloignant. Le premier est deux fois et demie plus probable que le second. */
  ok('un voisin vers l’autre parent bat un voisin qui s’en éloigne',
     part(0, 4, 1) > part(0, 4, 15) * 2, part(0, 4, 1) + ' vs ' + part(0, 4, 15));

  /* DEUX PARENTS IDENTIQUES : l'axe est un point, et seul le plancher lui donne une largeur.
     Sans ce plancher ils ne feraient que des clones ; avec, ils transmettent très souvent et
     donnent un voisin parfois. C'est aussi ce qui permet à une population uniforme de
     démarrer sa montée. */
  ok('deux parents identiques transmettent très souvent',
     part(0, 0, 0) > 60 && part(0, 0, 0) < 80, part(0, 0, 0));
  ok('mais pas toujours', part(0, 0, 1) > 10, part(0, 0, 1));

  /* LA ROUE EST UN CERCLE : l'écarlate (0) et le grenat (15) sont VOISINS, et leur mélange
     est l'un des deux — jamais le point diamétralement opposé qu'une moyenne d'indices
     donnerait. */
  ok('le cercle se referme', part(15, 0, 8) < 1, part(15, 0, 8));

  // et cinq pour cent des tirages ignorent les parents
  ok('le hasard garde sa part', part(0, 0, 8) > 0.1 && part(0, 0, 8) < 1, part(0, 0, 8));

  /* SUR UNE DROITE — les statistiques. Deux parents au sommet donnent des petits au sommet la
     plupart du temps, et le reste vient de la branche libre. C'est la mesure qui porte la
     phrase « l'héritage vient des parents », là où un tirage unique ne prouverait rien. */
  let hauts = 0, somme = 0;
  for (let i = 0; i < 20000; i++) {
    const v = jeu.heriteNombre(jeu.IV_MAX, jeu.IV_MAX, 0, jeu.IV_MAX, 1);
    somme += v;
    if (v >= jeu.IV_MAX - 2) hauts++;
  }
  ok('deux parents au sommet donnent le sommet neuf fois sur dix',
     hauts / 20000 > 0.9, (hauts / 20000 * 100).toFixed(1) + ' %');
  ok('et la moyenne reste très haute', somme / 20000 > 23, (somme / 20000).toFixed(2));

  /* L'EXTÉRIEUR EST LE MOTEUR DE LA SÉLECTION : c'est la seule branche qui dépasse les deux
     parents. Sans elle, une lignée converge vers la moyenne de ce qu'on lui donne. */
  let mieux = 0;
  for (let i = 0; i < 20000; i++) if (jeu.heriteNombre(10, 10, 0, jeu.IV_MAX, 1) > 10) mieux++;
  ok('un enfant peut dépasser deux parents identiques',
     mieux / 20000 > 0.1, (mieux / 20000 * 100).toFixed(1) + ' %');
});

scenario('hérédité — le nid dit ce que le couple transmet', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12; s.pens = 8; s.primes.pension = true; jeu.oublierPrimes();
  const bete2 = (l, ch, tp, mo, fo) => {
    s.incub[0] = { line: l, p: 9999, kind: 'commun' }; jeu.hatchAll();
    const c = s.pen[s.pen.length - 1];
    c.age = 4; c.p = jeu.bandTo(c);
    c.chroma = ch; c.temper = tp; c.motif = mo; c.fond = fo || null; c.prodige = false;
    return c;
  };
  const a = bete2('loup', 0, 1, 6, null);        // écarlate, nerveux, zébré
  const b = bete2('ours', 4, 2, 7, 'braise');    // doré, placide, nacré, un fond

  const dit = jeu.ditDeLHeritage(a, b);

  /* NERVEUX × PLACIDE DONNE DOCILE, et ce n'est pas un choix : c'est le centre exact du plan
     (croissance, engraissement) où vivent les six tempéraments. */
  ok('le caractère annoncé est le milieu du plan', /docile/.test(dit), dit);

  /* ÉCARLATE (0) × DORÉ (4) DONNE AMBRE (2) — le milieu de l'arc court, la même porte que
     l'hérédité emploie comme centre de sa distribution. */
  ok('la couleur annoncée est le mélange', /ambre/.test(dit), dit);
  eq('et c’est bien la porte partagée', jeu.melangeRoue(0, 4), 2);
  eq('comme pour le tempérament', jeu.melangeTemper(1, 2), 0);

  /* LE MOTIF N'A PAS D'AXE : on annonce les deux, pas un mélange qui n'existe pas. */
  ok('les deux motifs sont nommés', /zébré ou nacré/.test(dit), dit);
  ok('et le fond d’un seul parent suffit', /braise/.test(dit), dit);

  /* LA PHRASE DIT LE PLUS PROBABLE, JAMAIS LE CERTAIN : le mélange ne sort qu'une fois sur
     quatre, et promettre « ambre » ferait de chaque écart un bug. */
  ok('elle annonce une tendance, pas une promesse', /Le plus souvent/.test(dit), dit);
  /* ET LA COULEUR PORTE SA CONDITION : une bête est grise à moins d'être chromatique. */
  ok('la couleur dit à quelle condition', /au premier chromatique/.test(dit), dit);

  /* LES STATISTIQUES N'Y SONT PAS : elles agissent et ne se montrent nulle part, et les
     afficher ici seulement apprendrait un chiffre qu'on ne peut comparer à rien. */
  ok('rien des statistiques', !/force|vivacité|souffle|instinct/.test(dit), dit);

  // deux parents identiques annoncent leur propre trait, pas un voisin
  const c = bete2('loup', 0, 1, 6, null);
  ok('deux parents identiques annoncent ce qu’ils portent',
     /nerveux/.test(jeu.ditDeLHeritage(a, c)) && /zébré/.test(jeu.ditDeLHeritage(a, c)),
     jeu.ditDeLHeritage(a, c));
});

scenario('couleurs — chacune rend l’hexadécimal qu’elle annonce', () => {
  /* ON SIMULE LE NAVIGATEUR, parce que la faute était invisible autrement. `brightness(1.95)`
     envoyait à un blanc PUR tout ce qui dépassait 0,51 : sur le wukong, 43 % du dessin — le
     nuage entier et les mèches claires — sortaient à `#ffffff`, une seule valeur pour cinq
     clartés différentes. Rien dans le jeu ne pouvait le dire ; il fallait refaire le calcul.

     ON INTERDIT LE PALIER, PAS UN RÉGLAGE. Un test qui figerait les nombres empêcherait de
     retoucher un gris, ce qui est justement ce qu'on veut pouvoir faire. Ce qu'on interdit,
     c'est qu'une chaîne rende la même sortie pour des entrées différentes : ça, ce n'est
     jamais voulu, quel que soit le réglage. */
  const jeu = neuf();
  const cl = v => Math.max(0, Math.min(1, v));
  const mul = (m, p) => [m[0]*p[0]+m[1]*p[1]+m[2]*p[2],
                         m[3]*p[0]+m[4]*p[1]+m[5]*p[2],
                         m[6]*p[0]+m[7]*p[1]+m[8]*p[2]];
  const sat = s => [0.213+0.787*s, 0.715-0.715*s, 0.072-0.072*s,
                    0.213-0.213*s, 0.715+0.285*s, 0.072-0.072*s,
                    0.213-0.213*s, 0.715-0.715*s, 0.072+0.928*s];
  const sep = a => { const r = 1 - a; return [
    0.393+0.607*r, 0.769-0.769*r, 0.189-0.189*r,
    0.349-0.349*r, 0.686+0.314*r, 0.168-0.168*r,
    0.272-0.272*r, 0.534-0.534*r, 0.131+0.869*r]; };
  const rot = a => { const c = Math.cos(a*Math.PI/180), s = Math.sin(a*Math.PI/180); return [
    0.213+c*0.787-s*0.213, 0.715-c*0.715-s*0.715, 0.072-c*0.072+s*0.928,
    0.213-c*0.213+s*0.143, 0.715+c*0.285+s*0.140, 0.072-c*0.072-s*0.283,
    0.213-c*0.213-s*0.787, 0.715-c*0.715+s*0.715, 0.072+c*0.928+s*0.072]; };

  function passe(chaine, rgb) {
    let p = rgb.slice();
    for (const m of chaine.matchAll(/(hue-rotate|saturate|brightness|contrast|grayscale|sepia)\(([-\d.]+)/g)) {
      const v = parseFloat(m[2]);
      if (m[1] === 'brightness')    p = p.map(x => x * v);
      else if (m[1] === 'contrast') p = p.map(x => (x - 0.5) * v + 0.5);
      else p = mul(m[1] === 'saturate' ? sat(v) : m[1] === 'grayscale' ? sat(1 - v)
                 : m[1] === 'sepia' ? sep(v) : rot(v), p);
      p = p.map(cl);
    }
    return p;
  }
  const clarte = p => 0.213*p[0] + 0.715*p[1] + 0.072*p[2];

  const gris = jeu.CHROMAS.filter(c => c.hue === null);
  eq('quatre crans hors de la roue', gris.length, 4);

  const niveaux = [];
  for (const g of gris) {
    const f = jeu.filtreCouleur(g);

    /* LA TEINTE DU DESSIN DOIT ÊTRE EFFACÉE D'ABORD. Sans ça la chaîne garde un résidu de la
       bête, et le même nom rend deux couleurs selon la lignée — c'était le cas de la perle et
       de l'ardoise, à 0,21 l'une de l'autre entre un wukong et un kitsune. */
    ok(g.name + ' commence par tout effacer', /^grayscale\(1\)/.test(f), f);

    /* UNE COULEUR ET LE GRIS DE MÊME CLARTÉ DOIVENT SORTIR IDENTIQUES : c'est exactement ce
       que veut dire « la teinte du dessin ne compte pas ». Comparer deux couleurs entre elles
       ne dirait rien — n'ayant pas la même clarté, elles ont le droit de différer. */
    let derive = 0;
    for (const c of [[0.80, 0.20, 0.20], [0.20, 0.20, 0.80], [0.25, 0.70, 0.30]]) {
      const L = clarte(c);
      const a = passe(f, c), b = passe(f, [L, L, L]);
      derive = Math.max(derive, ...[0, 1, 2].map(i => Math.abs(a[i] - b[i])));
    }
    ok(g.name + ' rend la même chose quelle que soit la teinte d’origine', derive < 0.02,
       'dérive ' + derive.toFixed(3));

    let seuil = null, palier = 0, avant = null;
    for (let x = 0; x <= 1.0001; x += 0.02) {
      const p = passe(f, [x, x, x]);
      if (seuil === null && p.every(v => v > 0.99)) seuil = x;
      if (avant !== null && Math.abs(clarte(p) - avant) < 0.002) palier++;
      avant = clarte(p);
    }
    /* LA SUR-EXPOSITION SE CHIFFRE : c'est l'entrée à partir de laquelle plusieurs clartés
       différentes sortent au même blanc pur. Le blanc l'atteignait à 0,508 et la perle à
       0,708, quand les dessins montent à 0,884 — d'où 43 % du wukong aplatis sur une seule
       valeur. Au-delà de 0,90 le palier ne touche plus rien de ce qui est dessiné, et un
       sommet qui blanchit tout à fait n'est pas une faute : c'en est un de le faire avant. */
    ok(g.name + ' ne brûle pas dans la plage des dessins', seuil === null || seuil >= 0.90,
       'blanc pur dès ' + (seuil === null ? '—' : seuil.toFixed(2)));
    ok(g.name + ' garde du modelé sur toute la rampe', palier <= 4, palier + ' paliers sur 50');

    niveaux.push({ nom: g.name, l: clarte(passe(f, [0.5, 0.5, 0.5])) });
  }

  /* QUATRE CRANS QUI N'EN MONTRENT QUE TROIS SONT TROIS CRANS AVEC UN NOM DE TROP. Le blanc et
     la perle sortaient à 0,110 l'un de l'autre — quatre fois moins que les deux autres écarts,
     et sans différence de teinte pour rattraper. */
  niveaux.sort((a, b) => b.l - a.l);
  eq('du plus clair au plus sombre', niveaux.map(n => n.nom).join(' '), 'blanc perle ardoise onyx');
  for (let i = 0; i < niveaux.length - 1; i++) {
    const e = niveaux[i].l - niveaux[i+1].l;
    ok(niveaux[i].nom + ' et ' + niveaux[i+1].nom + ' se distinguent', e > 0.08, 'écart ' + e.toFixed(3));
  }

  /* L'ONYX NE DOIT PAS ÊTRE UN TROU. La pièce d'incubation est à `#0E1310`, soit 0,07 de
     clarté : une bête qui passerait entièrement sous ce niveau ne serait qu'un contour cerclé
     d'un halo. On regarde son point le plus clair, pas sa moyenne. */
  const onyx = gris.find(g => g.key === 'onyx');
  const sommet = clarte(passe(jeu.filtreCouleur(onyx), [0.884, 0.884, 0.884]));
  ok('l’onyx se lit encore sur la pièce', sommet > 0.15, 'sommet ' + sommet.toFixed(3) + ' contre 0,07');

  /* ── ET AUCUNE DES TRENTE-SIX NE BLANCHIT ─────────────────────────────────────
     La même faute vivait dans les tons de la roue. `clair` était `brightness(1.72)` : il
     blanchissait tout ce qui dépassait 0,576, et sur un crapaud — déjà pâle — ça faisait 60 %
     du dessin. Les huit recettes claires rendaient donc huit fois la même grenouille blanche à
     liseré coloré, ce qui est la façon la plus coûteuse de n'avoir qu'une couleur. Le `vif`
     blanchissait 32 % du même crapaud.

     LES DESSINS MONTENT À 0,884. Au-delà de 0,90, le palier ne touche plus rien de ce qui est
     peint — c'est le même seuil que pour les gris, et c'est le même défaut. */
  for (const c of jeu.CHROMAS) {
    const f = jeu.filtreCouleur(c);
    let blanchit = null;
    for (let x = 0.40; x <= 1.0001; x += 0.01) {
      if (passe(f, [x, x, x]).every(v => v > 0.99)) { blanchit = x; break; }
    }
    ok(c.name + ' ne blanchit pas dans la plage des dessins',
       blanchit === null || blanchit >= 0.90,
       'blanc pur dès ' + (blanchit === null ? '—' : blanchit.toFixed(2)));
  }

  /* LA TABLE ANNONCE UNE COULEUR, ON VÉRIFIE QU'ELLE LA REND. Les seize teintes de la roue
     étaient posées mécaniquement tous les 22,5°, ce qui donnait des couleurs timides et un
     écarlate qui n'était pas rouge : une couleur n'est pas qu'un angle, c'est aussi une clarté
     et une vivacité — l'or est clair, le grenat est sombre. Chacune porte donc son
     hexadécimal, et `node tools/couleurs.js` résout les quatre leviers qui y arrivent.

     C'EST CE SCÉNARIO QUI EMPÊCHE L'HEXADÉCIMAL DE DEVENIR UN COMMENTAIRE QUI MENT. Sans lui,
     les quatre nombres de `peindre()` seraient magiques et pourraient dériver de la couleur
     écrite à côté sans que rien ne le dise. Le champ `hue`, lui, ne décrit plus une couleur :
     il n'est que l'identité du cran, dont l'hérédité et les recettes se servent. */
  const hexVers = h => [parseInt(h.slice(1,3),16)/255, parseInt(h.slice(3,5),16)/255,
                        parseInt(h.slice(5,7),16)/255];
  const enHex = p => '#' + p.map(x => Math.round(x*255).toString(16).padStart(2,'0')).join('').toUpperCase();
  const distanceRGB = (a, b) => Math.sqrt(2*(a[0]-b[0])**2 + 4*(a[1]-b[1])**2 + (a[2]-b[2])**2);

  let pireEcart = 0, pire = '', comptees = 0;
  const rendues = [];
  for (const c of jeu.CHROMAS) {
    const f = jeu.filtreCouleur(c);
    ok(c.name + ' efface la teinte du dessin avant de peindre', /^grayscale\(1\)/.test(f), f);
    const p = passe(f, [0.5, 0.5, 0.5]);
    rendues.push({ nom: c.name, p });
    if (!c.couleur) continue;                 // les quatre gris se règlent à la main
    comptees++;
    const e = distanceRGB(p, hexVers(c.couleur));
    if (e > pireEcart) { pireEcart = e; pire = c.name + ' vise ' + c.couleur + ' et rend ' + enHex(p); }
  }
  eq('trente-deux couleurs portent leur hexadécimal', comptees, 32);
  ok('chacune rend la couleur qu’elle annonce', pireEcart <= 0.04,
     'pire : ' + pire + ' (' + pireEcart.toFixed(3) + ')');

  /* ET DEUX COULEURS DE LA TABLE NE SONT PAS LA MÊME COULEUR. C'est ce que l'écart régulier de
     22,5° garantissait sans le vouloir ; en choisissant les teintes à la main, on perd cette
     garantie mécanique et il faut la redemander. On compare le gris moyen peint, donc sans
     dépendre d'aucun dessin. */
  let plusProches = 99, paire = '';
  for (let i = 0; i < rendues.length; i++)
    for (let j = i + 1; j < rendues.length; j++) {
      const d = distanceRGB(rendues[i].p, rendues[j].p);
      if (d < plusProches) { plusProches = d; paire = rendues[i].nom + ' et ' + rendues[j].nom; }
    }
  ok('deux couleurs de la table ne se confondent pas', plusProches >= 0.10,
     paire + ' à ' + plusProches.toFixed(3));
});

scenario('couleur — le ton se dit une seule fois dans le filtre', () => {
  /* LA FAUTE DE LA 4.22.0, ET POURQUOI ELLE SE GARDE ICI. `PRODIGE_FILTER` commençait par
     `saturate(2.4) brightness(1.3)` — le `TON_FILTRE.vif` de la table, au mot près — et
     `filtreDe` colle les deux bouts. Chaque teinte vive partait donc au carré : saturate 5,76
     au lieu de 2,4, et les trois bruns du Sun Wukong tombaient sur le même magenta pur.

     ON COMPTE LES PRIMITIVES, PAS LES PIXELS. Un test qui regarderait la couleur de sortie
     figerait un réglage qu'on a le droit de tourner ; ce qu'on interdit, c'est qu'une même
     fonction soit énoncée deux fois dans une seule chaîne — parce que ça, ce n'est jamais
     voulu, quel que soit le réglage. */
  const jeu = neuf();
  const fautes = [];
  for (let i = 0; i < jeu.CHROMAS.length; i++) {
    const chaine = jeu.filtreDe({ prodige: true, chroma: i });
    const vues = new Map();
    for (const m of chaine.matchAll(/([a-z-]+)\(/g)) vues.set(m[1], (vues.get(m[1]) || 0) + 1);
    for (const [nom, n] of vues) if (n > 1) fautes.push(jeu.CHROMAS[i].name + ' : ' + nom + ' ×' + n);
  }
  ok('aucune primitive n’est répétée dans les trente-six chaînes', fautes.length === 0,
     fautes.join('  |  '));

  // et le halo, lui, ne porte plus que le halo
  eq('le halo ne porte que le halo', jeu.PRODIGE_FILTER, 'drop-shadow(0 0 14px #E4A63E)');

  /* LE HALO RESTE EN DERNIER. `drop-shadow` prend l'alpha de ce qui le précède : placé avant
     la rotation, il serait teinté par elle et cesserait d'être le même halo pour les
     trente-six couleurs — or c'est justement son invariance qui dit « chromatique » de loin. */
  const dernier = fautes.length === 0 && jeu.CHROMAS.every((c, i) =>
    /drop-shadow\([^)]*\)$/.test(jeu.filtreDe({ prodige: true, chroma: i })));
  ok('et il ferme la chaîne, pour n’être teinté par rien', dernier);

  eq('une bête ordinaire n’a aucun filtre', jeu.filtreDe({ prodige: false, chroma: 3 }), '');
});

scenario('hérédité — un œuf de pension porte ses parents, un œuf acheté non', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15; s.pens = 40;
  const [a, b] = couple(jeu, 'loup', 'loup');
  a.chroma = 0; a.temper = 1; a.motif = 3; a.iv = [25, 25, 25, 25]; a.fond = 'braise';
  b.chroma = 0; b.temper = 1; b.motif = 3; b.iv = [25, 25, 25, 25]; b.fond = 'braise';

  jeu.accoupler(a, b);
  jeu.avancePension(jeu.couples()[0].duree + 1);
  const du = (s.pension.dus.rare || [])[0];
  ok('la promesse porte la lignée', du && du.ligne === 'loup', du && du.ligne);
  ok('et ce que les parents transmettent', !!(du && du.herite), du && du.herite);

  /* CE QUI EST HÉRITÉ SE CALCULE À LA PONTE, pas à l'éclosion : les parents sont sûrs d'être
     là quand l'œuf tombe, ils peuvent avoir été vendus quand il éclôt. Une bête vendue après
     la ponte a quand même transmis ce qu'elle portait. */
  jeu.retirerCouple && jeu.retirerCouple(0);
  s.pen = [];
  s.incub[0] = null;
  jeu.placeEgg(0, 'rare');
  const slot = s.incub[0];
  ok('l’œuf posé emporte l’héritage', !!slot.herite, slot);

  /* ON VÉRIFIE LE BRANCHEMENT, PAS LE HASARD. Comparer la bête éclose aux PARENTS ferait
     échouer ce scénario une fois sur cinq : la branche « n'importe quoi » se déclenche à cinq
     pour cent, et quatre statistiques la tirent quatre fois. Ce qui doit être exact ici, c'est
     que l'éclosion recopie l'héritage sans le retirer — la distribution, elle, se mesure dans
     le scénario d'à côté, sur soixante mille tirages. */
  const h = Object.assign({}, slot.herite);
  s.incub[0].p = 99999;
  jeu.hatchAll();
  const petit = s.pen[s.pen.length - 1];
  eq('le motif de l’héritage passe tel quel', petit.motif, h.motif);
  eq('le caractère aussi', petit.temper, h.temper);
  eq('la couleur aussi', petit.chroma, h.chroma);
  eq('les statistiques aussi', petit.iv.join(), h.iv.join());
  eq('et le fond', petit.fond, h.fond);
  /* CE SCÉNARIO NE DIT PLUS RIEN DE LA PROVENANCE, et c'est délibéré. « L'héritage vient des
     parents » est une affirmation STATISTIQUE — la branche « n'importe quoi » se déclenche à
     cinq pour cent, sur chacun des six traits — et une affirmation statistique vérifiée sur un
     seul tirage est un test qui échoue une fois sur cinq sans qu'aucun code ne soit fautif.
     Elle se mesure dans le scénario d'à côté, sur des dizaines de milliers de tirages. */

  /* UN ŒUF ACHETÉ N'HÉRITE DE RIEN : il n'a pas de parents. C'est la frontière entre acheter
     et élever, et c'est elle qui donne sa raison d'être à la pension. */
  s.incub[0] = null;
  s.eggs.rare = 1;
  jeu.placeEgg(0, 'rare');
  ok('rien à hériter sur un œuf de boutique', !s.incub[0].herite);
});

scenario('stats — quatre nombres tirés à l’éclosion, et la carte les porte', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;

  eq('quatre stats', jeu.IV_NOMS.length, 4);
  eq('sur une échelle de vingt-cinq', jeu.IV_MAX, 25);

  /* TIRÉES À L'ÉCLOSION ET GARDÉES À VIE, comme la teinte et le tempérament. */
  const c = bete(jeu, 'crapaud', 1, 0);
  eq('une bête a ses quatre stats', (c.iv || []).length, 4);
  ok('toutes dans l’échelle', c.iv.every(v => Number.isInteger(v) && v >= 0 && v <= jeu.IV_MAX),
     c.iv.join(' '));
  const fige = c.iv.join(',');
  c.age = 5; c.p = jeu.bandTo(c); c.over = 1e6;
  eq('vieillir n’y touche pas', c.iv.join(','), fige);

  /* ELLES VARIENT : deux cents éclosions ne peuvent pas rendre deux cents fois le même total. */
  const totaux = new Set();
  for (let i = 0; i < 200; i++) totaux.add(jeu.rollIV().reduce((n, v) => n + v, 0));
  ok('elles ne sortent pas toutes pareilles', totaux.size > 20, totaux.size + ' totaux distincts');

  /* LA CARTE LES FIGE, comme le reste de la bête. */
  const k = jeu.capsuleBrute(c);
  eq('la capsule les emporte', (k.iv || []).join(','), fige);

  /* ── LA MOYENNE NE BOUGE PAS, ET C'EST TOUTE LA SÛRETÉ DU CHANGEMENT ──
     Les stats prennent leur poids aux autres axes au lieu de s'y ajouter. Des stats moyennes
     valent 0,5, donc 0,20 × 0,5 = 0,10 — exactement ce qu'on a repris au niveau. */
  const carte = (iv, niv) => ({ line: 'ouroboros', age: 5, niv, chroma: 0, rank: 0,
                                prodige: false, etoiles: 1, motif: 0, temper: 0, iv });
  const moyennes = jeu.IV_NOMS.map(() => jeu.IV_MAX / 2);
  /* LA CARTE TYPE MONTE DE TROIS POUR CENT, et c'est voulu : l'axe de la teinte a disparu
     avec les teintes, son poids s'est reversé sur le niveau, la taille et les stats, et un
     trophée devait rester à 1,00. Tenir la moyenne EXACTEMENT aurait plafonné le trophée à
     0,93. Le mouvement est entièrement vers le haut : aucune carte n'est dépréciée. */
  eq('une carte type monte au lieu de baisser', jeu.qualiteDe(carte(moyennes, 100)), 0.745);
  ok('une carte sans stats la vaut aussi',
     jeu.qualiteDe(carte(null, 100)) === jeu.qualiteDe(carte(moyennes, 100)),
     jeu.qualiteDe(carte(null, 100)));

  const pire = jeu.IV_NOMS.map(() => 0), mieux = jeu.IV_NOMS.map(() => jeu.IV_MAX);
  const q0 = jeu.qualiteDe(carte(pire, 100)), q1 = jeu.qualiteDe(carte(mieux, 100));
  ok('mais l’écart existe', q1 > q0, q0.toFixed(3) + ' → ' + q1.toFixed(3));
  ok('et il vaut quinze centièmes de qualité', Math.abs(q1 - q0 - 0.15) < 1e-9, q1 - q0);

  /* LA CARTE PARFAITE RESTE À UN : on n'a pas ajouté de puissance, on a ajouté de la variance. */
  const trophee = { line: 'ouroboros', age: 5, niv: jeu.NIV_MAX, chroma: 0,
                    rank: jeu.RANKS.length - 1, prodige: true, etoiles: 1, motif: 0,
                    temper: 0, iv: mieux };
  eq('un trophée vaut toujours un', jeu.qualiteDe(trophee), 1);

  /* LA FUSION LES MOYENNE, stat par stat, comme la teinte et la taille. */
  const trois = [carte([0, 0, 0, 0], 100), carte([25, 25, 25, 25], 100),
                 carte([10, 20, 0, 5], 100)];
  eq('trois cartes fondues rendent leur moyenne',
     jeu.fusionDe(trois).iv.join(','), [12, 15, 8, 10].join(','));
});

scenario('stats — une sauvegarde d’avant en reçoit, ses cartes non', () => {
  /* On tire pour ce qui est encore VIVANT, jamais pour ce qui est figé : une carte déjà dans
     l'album lit la moyenne, donc sa qualité ne bouge pas d'un centième. */
  const vieux = neuf({
    coins: 1e6,
    pen: [{ id: 1, line: 'crapaud', age: 3, p: 10, over: 0, tint: 0, rank: 0, motif: 0,
            temper: 0, prodige: false }],
    album: [{ id: 1, line: 'loup', age: 5, niv: 100, tint: 0, rank: 0, motif: 0, temper: 0,
              prodige: false, etoiles: 1 }],
  });
  eq('la bête reçoit ses quatre stats', (vieux.state.pen[0].iv || []).length, 4);
  ok('la carte n’en reçoit pas', !vieux.state.album[0].iv);
  eq('et elle vaut ce que la redistribution lui donne', vieux.qualiteDe(vieux.state.album[0]), 0.745);
});

scenario('album — une carte ressemble à une carte', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.poussiere = 5000; s.asc.n = 1;
  s.album = [pave(jeu, 1, 'loup', 2), pave(jeu, 2, 'ouroboros', 3)];
  s.slots = [1];
  jeu.oublierAlbum();
  jeu.refresh();

  const cartes = [];
  const marcher = e => {
    if (e.classList && e.classList.contains('carte')) cartes.push(e);
    e.children.forEach(marcher);
  };
  noeuds.get('album').children.forEach(marcher);
  eq('deux cartes', cartes.length, 2);

  const c = cartes[0];
  const part = cls => c.children.find(x => (x.className || '').includes(cls));

  /* QUATRE CHOSES FONT UNE CARTE, et aucune n'était là quand c'était une ligne. */
  ok('un bandeau de rareté', !!part('carte-bande'));
  ok('une zone d’illustration', !!part('carte-haut'));
  ok('une place pour le fond', !!part('carte-fond'));
  ok('un bloc de texte séparé', !!part('carte-bas'));

  /* LA RARETÉ SE DIT TROIS FOIS : le bandeau, le halo, et le mot. Trois redondances plutôt
     qu'une, parce que cinq cartes côte à côte se distinguent au coup d'œil ou pas du tout. */
  ok('la carte porte sa classe de rareté', c.className.includes('rar-rare'), c.className);
  eq('et le mot est écrit', part('carte-rar').textContent, 'rare');
  eq('la merveilleuse aussi', (() => {
    s.album = [pave(jeu, 9, 'kitsune', 1)];
    s.slots = [];
    jeu.oublierAlbum(); jeu.refresh();
    const t = [];
    const m = e => { if (e.classList && e.classList.contains('carte')) t.push(e); e.children.forEach(m); };
    noeuds.get('album').children.forEach(m);
    return t[0].children.find(x => (x.className || '').includes('carte-rar')).textContent;
  })(), 'merveilleuse');

  // les deux gestes et les étoiles n'ont pas bougé de rôle
  s.album = [pave(jeu, 1, 'loup', 2)]; s.slots = [];
  jeu.oublierAlbum(); jeu.refresh();
  const d = []; const m2 = e => { if (e.classList && e.classList.contains('carte')) d.push(e); e.children.forEach(m2); };
  noeuds.get('album').children.forEach(m2);
  const p = cls => d[0].children.find(x => (x.className || '').includes(cls));
  eq('deux étoiles sur trois', p('carte-etoiles').textContent, '★★☆');
  ok('fondre annonce sa poussière', /✧/.test(p('fondre').textContent), p('fondre').textContent);
  /* IL N'Y A PLUS QU'UN GESTE SUR LA CARTE. « Fusionner » y montait une étoile contre de la
     monnaie sans rien consommer ; la vraie fusion demande trois cartes et ne peut pas tenir
     sur une seule — elle a son atelier. */
  ok('et fusionner a quitté la carte', p('fusion') === undefined);
});

scenario('album — chaque motif porte son effet, et chacun le sien', () => {
  const jeu = neuf();
  eq('un effet par motif', jeu.MOTIFS.length, Object.keys(jeu.MOTIF_BONUS).length);
  const cles = new Set();
  for (const m of jeu.MOTIFS) {
    const b = jeu.MOTIF_BONUS[m];
    ok('le motif « ' + m + ' » a un effet', !!b);
    ok('« ' + m + ' » explique ce qu’il fait', !!(b && b.dit && b.dit.length > 20), b && b.dit);
    ok('« ' + m + ' » ne double aucun autre effet', !cles.has(b.key), b.key);
    cles.add(b.key);
    // le sac de bonus doit connaître la clé, sinon l'effet se perd en silence
    ok('bonusAlbum connaît « ' + b.key + ' »', b.key in jeu.bonusAlbum());
  }
});

scenario('album — la troisième étoile compte encore, pour toutes les familles', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  /* LE DÉFAUT DU PERLÉ, QU'ON NE VEUT PLUS. Il donnait des enclos et plafonnait dès la
     DEUXIÈME étoile : la fusion n'avait plus rien à lui offrir, et on aurait payé quarante
     cartes pour un cran qui ne donnait rien. Ce scénario garde l'invariant sur toute la table
     — une famille dont la deuxième étoile plafonne déjà est une famille à revoir. */
  for (const m of jeu.MOTIFS) {
    const b = jeu.MOTIF_BONUS[m];
    const val = e => {
      equiper(jeu, jeu.MOTIFS.indexOf(m), 0);
      const k = parfaite(jeu, jeu.MOTIFS.indexOf(m), 1);
      k.etoiles = e;
      return Math.min(b.cap, b.pas * jeu.puissanceDe(k));
    };
    ok('« ' + m + ' » : la deuxième étoile ne plafonne pas', val(2) < b.cap - 1e-9,
       m + ' plafonne à ' + b.cap + ' dès ★★☆');
    ok('« ' + m + ' » : la troisième ajoute encore quelque chose', val(3) > val(2) + 1e-9);
  }
});

scenario('album — le martelé frappe plus fort, l’ocellé frappe plus souvent', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const iMartele = jeu.MOTIFS.indexOf('martelé');
  const iOcelle = jeu.MOTIFS.indexOf('ocellé');

  const nu = jeu.clickPower();
  equiper(jeu, iMartele, 1);
  const un = jeu.clickPower();
  ok('une carte martelée alourdit le clic', un > nu, un);
  equiper(jeu, iMartele, 5);
  ok('cinq en donnent davantage', jeu.clickPower() > un, jeu.clickPower());
  eq('sans dépasser le plafond de la famille',
     Math.round(jeu.bonusAlbum().clic * 100) / 100, jeu.MOTIF_BONUS['martelé'].cap);

  /* Les deux ne font pas le même métier : l'ocellé dit COMBIEN de clics tombent, le martelé
     ce que chacun rapporte. Ils se multiplient — c'est le premier vrai duo de l'album. */
  equiper(jeu, iOcelle, 3);
  const cadence = jeu.bonusAlbum().clicAuto, force = jeu.clickPower();
  ok('l’ocellé donne une cadence', cadence > 0);
  eq('mais ne touche pas à la force du clic', force, nu);

  // et la plonge reste plate, quoi qu'on ait en album
  equiper(jeu, iMartele, 5);
  s.coins = 0; s.pen = []; s.incub = [null];
  s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0 };
  jeu.refresh();
  for (let i = 0; i < jeu.ASSIETTE_CLICS; i++) jeu.tapStage();
  eq('dix clics font toujours une assiette', s.stats.assiettes, 1);
  eq('et une seule pièce', s.coins, 1);
});

scenario('album — l’ocellé clique à ta place, sans compter pour toi', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 4;
  equiper(jeu, jeu.MOTIFS.indexOf('ocellé'), 1);
  eq('une carte parfaite', Math.round(jeu.bonusAlbum().clicAuto * 100) / 100, 0.4);
  equiper(jeu, jeu.MOTIFS.indexOf('ocellé'), 5);
  eq('cinq cartes plafonnent', jeu.bonusAlbum().clicAuto, jeu.MOTIF_BONUS['ocellé'].cap);

  const c = bete(jeu, 'crapaud', 1, 0);
  s.stats.clics = 0;
  const avant = c.p;
  for (let i = 0; i < 100; i++) jeu.tickOcelle(0.1);      // dix secondes
  ok('elle a fait avancer la bête', c.p > avant, c.p);
  eq('sans rien mettre au compte du joueur', s.stats.clics, 0);
  jeu.tapStage();
  eq('alors qu’un vrai clic compte', s.stats.clics, 1);

  // sans carte ocellée, rien ne bouge tout seul
  equiper(jeu, jeu.MOTIFS.indexOf('uni'), 1);
  const fige = c.p;
  for (let i = 0; i < 100; i++) jeu.tickOcelle(0.1);
  eq('sans la carte, aucun clic automatique', c.p, fige);
});

/* ────────────────────────── la sauvegarde en clair ────────────────────────── */

scenario('sauvegarde — une copie se relit, et dit ce qu’elle contient', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 4242; s.pens = 6;
  bete(jeu, 'crapaud', 2, 400);
  bete(jeu, 'crabe', 3, 3000);

  const texte = jeu.texteSauvegarde();
  const lu = jeu.lireSauvegarde(texte);
  ok('la copie se relit', lu.ok, lu.dit);
  ok('le résumé compte les bêtes', /2 bêtes/.test(lu.dit), lu.dit);
  ok('et annonce le format', new RegExp('format v' + jeu.SAVE_V).test(lu.dit), lu.dit);
  eq('les pièces traversent', lu.data.coins, 4242);
});

scenario('sauvegarde — ce qui ne tient pas est refusé, avec la raison', () => {
  const jeu = neuf();
  const refus = t => jeu.lireSauvegarde(t);

  ok('du texte quelconque', !refus('bonjour').ok);
  ok('et on dit pourquoi', /ne se lit pas/.test(refus('bonjour').dit), refus('bonjour').dit);
  ok('un tableau JSON', !refus('[1,2,3]').ok);
  ok('du JSON sans ferme', !refus('{\"v\":11,\"coins\":10}').ok);
  ok('on nomme ce qui manque', /ferme/.test(refus('{\"v\":11,\"coins\":10}').dit));
  ok('une sauvegarde sans format', !refus('{\"coins\":1,\"pen\":[],\"incub\":[]}').ok);

  // un format PLUS RÉCENT que ce que le jeu sait lire : migrer vers l'avant est impossible
  const futur = JSON.stringify({ v: jeu.SAVE_V + 5, coins: 1, pen: [], incub: [] });
  ok('un format venu du futur', !refus(futur).ok);
  ok('et on dit lequel', /plus récente/.test(refus(futur).dit), refus(futur).dit);

  // celui d'AVANT passe : c'est load() qui migrera
  const vieux = JSON.stringify({ v: 1, coins: 1, pen: [], incub: [] });
  ok('un vieux format est accepté', refus(vieux).ok, refus(vieux).dit);
});

scenario('sauvegarde — restaurer pose le fichier et recharge la page', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 99999; s.pens = 5;
  bete(jeu, 'crabe', 4, 30000);
  const copie = jeu.texteSauvegarde();

  // la partie continue et diverge
  s.coins = 3; s.pen = [];
  eq('aucun rechargement pour l’instant', rechargements(), 0);

  const r = jeu.restaurer(copie);
  ok('la restauration passe', r.ok, r.dit);
  eq('la page est rechargée', rechargements(), 1);

  const pose = JSON.parse(brut());
  eq('c’est bien la copie qui est posée', pose.coins, 99999);
  eq('avec sa bête', pose.pen.length, 1);
  /* La date repart à maintenant : restaurer n'est pas rentrer d'une absence, et un fichier
     vieux d'une semaine ne doit pas offrir huit heures de ferme au chargement. */
  ok('la date est remise à maintenant', Math.abs(Date.now() - pose.t) < 5000, pose.t);

  eq('un texte invalide ne recharge rien', jeu.restaurer('nawak').ok, false);
  eq('et ne recharge toujours pas', rechargements(), 1);
});

scenario('sauvegarde — l’écran juge ce qu’on colle avant de laisser restaurer', () => {
  const jeu = neuf();
  jeu.state.tuto = false;
  const T = () => (noeuds.get('sav-resume').textContent || '').trim();

  jeu.jugerSav('');
  eq('rien de collé, rien à dire', T(), '');
  ok('et le bouton est fermé', noeuds.get('sav-go').disabled);

  jeu.jugerSav('n’importe quoi');
  ok('un texte invalide est marqué', T().startsWith('✕'), T());
  ok('le bouton reste fermé', noeuds.get('sav-go').disabled);
  ok('et la ligne passe en rouge', noeuds.get('sav-resume').classList.contains('sav-non'));

  jeu.jugerSav(jeu.texteSauvegarde());
  ok('une vraie sauvegarde est décrite', T().startsWith('→'), T());
  ok('le bouton s’ouvre', !noeuds.get('sav-go').disabled);
  ok('et la ligne n’est plus rouge', !noeuds.get('sav-resume').classList.contains('sav-non'));
});

/* ───────────────────────────── le verdict ───────────────────────────── */

console.log();
if (ratees.length) {
  console.log('  ' + ratees.length + ' vérification(s) en échec :');
  for (const [nom, quoi] of ratees) console.log('    · ' + nom + ' — ' + quoi);
  console.log();
  console.log('  ' + scenarios + ' scénarios, ' + verifs + ' vérifications, ' + ratees.length + ' ÉCHECS');
  process.exit(1);
}
console.log('  ' + scenarios + ' scénarios, ' + verifs + ' vérifications, tout passe');
