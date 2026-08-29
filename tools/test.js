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

/* ───────────────────────────── le socle ───────────────────────────── */

scenario('démarrage — chaque id demandé existe dans index.html', () => {
  const jeu = neuf();
  ok('aucun id manquant', inconnus.length === 0, inconnus.join(', '));
  ok('version au format alpha X.Y.Z', /^alpha \d+\.\d+\.\d+$/.test(jeu.VERSION), jeu.VERSION);
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

/* ────────────────────────── la ferme et ses automates ────────────────────────── */

scenario('réserve d’œufs — elle se vide toute seule, et gratuitement', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e6; s.incubators = 4; s.pens = 8;
  s.incub = [null, null, null, null];
  s.eggs = { commun: 10, rare: 2, epique: 0, mythique: 0 };
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

  // il ne brade jamais la consigne
  s.incub = [null, null, null, null];
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

  // la croix passe toujours, même ce qui tient
  garde = 0;
  while (!tient() && garde++ < 20) { jeu.replique(false); if (noeuds.get('dial').hidden) break; }
  if (tient()) { jeu.replique(true); ok('la croix lève ce qui tient', !tient() || noeuds.get('dial').hidden); }
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
  bete(jeu);
  s.pens = 1; s.incubators = 1; s.seen = {}; s.up = { clic: 0, couveuse: 0, eleveur: 0, mangeoire: 0 };
  jeu.refresh();
  ok('pas de tri pour un seul enclos', !vu('strip-tri'));
  ok('pas de compteur « 1 / 1 »', !vu('compte-pen'));
  ok('pas de ligne de boosts sans automate', !vu('stage-boost'));
  ok('pas de collection vide', !vu('panel-collection'));

  s.pens = 2; s.incubators = 2; s.up.couveuse = 3;
  s.seen = { a: 1, b: 1, c: 1 };
  jeu.refresh();
  ok('le tri arrive au deuxième enclos', vu('strip-tri'));
  ok('les compteurs aussi', vu('compte-pen') && vu('compte-incub'));
  ok('la ligne de boosts avec le premier automate', vu('stage-boost'));
  ok('la collection avec trois formes', vu('panel-collection'));

  s.tuto = false; s.pens = 1; s.incubators = 1; s.seen = {}; s.up.couveuse = 0;
  jeu.refresh();
  ok('mode histoire éteint : tout se relève d’un coup',
     vu('strip-tri') && vu('compte-pen') && vu('stage-boost') && vu('panel-collection'));
});

/* ────────────────────────── l'album et l'ascension ────────────────────────── */

scenario('ascension — un jeton, des cartes, et tout le reste repart de zéro', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 6; s.incubators = 3;
  s.up.clic = 5; s.up.couveuse = 5;
  const gardee = bete(jeu, 'crapaud', 3, 3000);
  bete(jeu, 'crabe', 2, 400);
  bete(jeu, 'crapaud', 2, 400);
  s.asc.jetons = 1; s.asc.paliers = jeu.RANG_PREMIER;
  ok('le bouton d’ascension s’ouvre', jeu.peutAscensionner());

  jeu.ouvrirAscension();
  ok('l’écran s’ouvre', !noeuds.get('ascension').hidden);
  const ap = jeu.apercuAscension();
  eq('les trois bêtes sont proposées', ap.neuves.length, 3);
  eq('l’album a toujours le même nombre d’emplacements', ap.max, jeu.SLOTS);

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

scenario('jetons — un palier de fortune tous les ×1000, à partir du premier million', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const premier = jeu.JETON_PALIERS[jeu.RANG_PREMIER - 1];
  eq('la première ascension se mérite au million', premier, 1e6);

  s.coins = premier - 1; jeu.crediterJetons();
  const avant = s.asc.jetons;
  ok('sous le million on a déjà des jetons', avant > 0, avant);
  ok('mais on ne peut pas encore ascensionner', !jeu.peutAscensionner());

  s.coins = premier; jeu.crediterJetons();
  eq('le million en donne un de plus', s.asc.jetons, avant + 1);
  eq('et c’est le troisième', s.asc.jetons, 3);
  ok('l’ascension s’ouvre alors', jeu.peutAscensionner());

  const apres = s.asc.jetons;
  jeu.crediterJetons();
  eq('un palier ne paie qu’une fois', s.asc.jetons, apres);
});

scenario('collection — tout se replie, et le pliage tient au rechargement', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.seen = { 'crapaud:1': 1, 'crabe:1': 1, 'loup:1': 1 };
  jeu.refresh();
  const coll = noeuds.get('collection');
  const grilles = () => coll.children.filter(n => (n.className || '').includes('coll-grille'));
  const raretes = [...new Set(jeu.LINES.map(l => l.rarity))];

  eq('une grille par rareté', grilles().length, raretes.length);
  eq('toutes les cases sont là', grilles().reduce((n, g) => n + g.children.length, 0),
     jeu.LINES.length * jeu.AGES.length);
  ok('rien n’est replié au départ', grilles().every(g => !g.hidden));

  jeu.plier(raretes[0]);
  eq('le premier groupe se replie', grilles().filter(g => g.hidden).length, 1);
  ok('mais ses cases existent toujours', grilles()[0].children.length > 0);

  jeu.plier('collection');
  ok('le panneau entier se replie', noeuds.get('panel-collection').classList.contains('plie'));
  ok('le compteur reste lisible', (noeuds.get('coll-meta').textContent || '').includes('/'));

  jeu.plier('collection');
  ok('il se rouvre', !noeuds.get('panel-collection').classList.contains('plie'));
  eq('et le pliage du groupe a tenu', grilles().filter(g => g.hidden).length, 1);

  jeu.save(); jeu.load(); jeu.refresh();
  ok('le pliage traverse un rechargement', jeu.state.plie[raretes[0]] === true);
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

/* ────────────────────────── la pension, porte fermée ────────────────────────── */

scenario('pension — la porte est fermée, et rien ne peut l’ouvrir', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9; s.pens = 8;
  eq('le drapeau est à false', jeu.PENSION_OUVERTE, false);
  eq('aucun couple au départ', jeu.state.pension.couples.length, 0);

  const a = bete(jeu, 'crapaud', 4, 20000);
  const b = bete(jeu, 'crabe', 4, 20000);
  ok('accoupler est refusé', !jeu.accoupler(a, b));
  ok('et la raison le dit', /n’ouvre pas/.test(jeu.refusPension(a, b)), jeu.refusPension(a, b));
  eq('rien ne s’est mis en pension', jeu.state.pension.couples.length, 0);
  eq('avancePension ne fait rien', jeu.avancePension(1e6), 0);

  /* LE DRAPEAU EST UNE CONSTANTE : le forcer ne fait rien. C'est ce qui distingue « pas encore
     branché » de « pas encore ouvrable », et c'est la seconde qu'on veut tant que le bestiaire
     n'est pas fini — un cycle qu'on peut faire tourner est un cycle qu'on croit réglé. */
  try { jeu.PENSION_OUVERTE = true; } catch (e) { /* getter sans setter : tant mieux */ }
  eq('forcer le drapeau ne l’ouvre pas', jeu.PENSION_OUVERTE, false);
  ok('et accoupler refuse toujours', !jeu.accoupler(a, b));

  // une ferme entière tourne : la pension ne doit toucher à rien
  const renteAvant = jeu.renteOf(a);
  ok('la rente coule normalement', renteAvant > 0, renteAvant);
  s.up.eleveur = 6; s.up.couveuse = 6;
  for (let i = 0; i < 200; i++) jeu.loop();
  eq('toujours aucun couple après deux cents tours', jeu.state.pension.couples.length, 0);
  eq('et la rente n’a pas été suspendue', jeu.renteOf(a), renteAvant);
});

scenario('pension — les trois calculs tiennent, sans rien ouvrir', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9; s.pens = 8;
  /* Ces trois fonctions ne consultent pas le drapeau : c'est tout ce qu'on peut vérifier d'un
     squelette scellé, et c'est déjà la forme du socle. */
  const a = bete(jeu, 'crapaud', 4, 20000);
  const b = bete(jeu, 'crapaud', 4, 20000);
  const loin = bete(jeu, 'ouroboros', 4, 20000);

  eq('même lignée, distance nulle', jeu.distanceDe(a, b), 0);
  eq('donc la durée de base', jeu.dureePension(a, b), jeu.PENSION.base);
  ok('deux lignées éloignées coûtent plus', jeu.dureePension(a, loin) > jeu.dureePension(a, b));
  ok('et jamais plus que le plafond n’autorise',
     jeu.dureePension(a, loin) <= jeu.PENSION.plafond * 4, jeu.dureePension(a, loin));

  eq('l’œuf suit le parent le plus modeste', jeu.oeufDe(a, loin), 'commun');
  eq('et deux communes donnent du commun', jeu.oeufDe(a, b), 'commun');

  eq('personne n’est en pension', jeu.enPension(a), false);
  eq('il y a une place, inutilisée', jeu.placesPension(), jeu.PENSION.places);
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

scenario('primes — l’étable sort les bêtes gardées du compte', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12; s.pens = 2;
  const a = bete(jeu, 'crapaud', 1, 5);
  const b = bete(jeu, 'crabe', 1, 5);
  eq('deux bêtes dans deux enclos', jeu.penUsed(), 2);
  ok('l’enclos est plein', jeu.penFull());
  a.keep = true;
  ok('garder ne suffit pas sans l’étable', jeu.penFull());
  jeu.buyPrime(jeu.PRIME_BY_CLE.etable);
  eq('avec l’étable, la gardée ne compte plus', jeu.penUsed(), 1);
  ok('et la place se rouvre', !jeu.penFull());
});

scenario('primes — elles ne traversent pas l’ascension, la migration ne perd rien', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 6;
  jeu.buyPrime(jeu.PRIME_BY_CLE.soin);
  jeu.buyPrime(jeu.PRIME_BY_CLE.acheteur);
  bete(jeu, 'crapaud', 3, 3000);
  s.asc.jetons = 1; s.asc.paliers = jeu.RANG_PREMIER;
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

// une carte au sommet de ce que le jeu peut produire : c'est là que les bornes se testent
const parfaite = (jeu, motif, id) => ({
  id, line: 'ouroboros', age: 5, niv: 100, tint: jeu.TINTS.length - 1,
  rank: jeu.RANKS.length - 1, prodige: true, palier: 1, motif, temper: 0,
});
function equiper(jeu, motif, n) {
  jeu.state.album = []; jeu.state.slots = [];
  for (let i = 1; i <= n; i++) { jeu.state.album.push(parfaite(jeu, motif, i)); jeu.state.slots.push(i); }
  jeu.oublierAlbum();
}

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

scenario('album — une carte parfaite donne exactement ce qu’elle annonce', () => {
  const jeu = neuf(); jeu.state.tuto = false; jeu.state.pens = 3;
  /* qualiteDe additionne 0,5 + 0,2 + 0,2 + 0,1, ce qui vaut 0,9999999999999999 : une carte
     parfaite pèse 3,999…96 et non 4. Le plancher des enclos tombait donc d'un cran, et la
     carte annonçait deux enclos pour un seul. */
  equiper(jeu, jeu.MOTIFS.indexOf('perlé'), 1);
  eq('l’effet annoncé', Math.round(jeu.bonusAlbum().place * 10) / 10, 2);
  eq('les enclos réellement ouverts', jeu.pensTotal(), 5);
  equiper(jeu, jeu.MOTIFS.indexOf('perlé'), 3);
  eq('le plafond tient', jeu.pensTotal(), 3 + jeu.MOTIF_BONUS['perlé'].cap);
  eq('et le prix du prochain enclos ne bouge pas', jeu.penCost(),
     Math.round(jeu.PEN_BASE * Math.pow(jeu.SLOT_MULT, 2)));
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
