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
  s.asc.jetons = 1; s.asc.paliers = jeu.RANG_PREMIER;
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

scenario('jetons — un jeton une carte, et le saut les prend tous', () => {
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
     borne que les cinq cartes qui agissent. Le jeton borne donc ce qui ENTRE DANS L'ALBUM, et
     neuf jetons emportent bien neuf cartes. */
  for (const n of [1, 2, 3, 5, 9, 14]) {
    const jeu = neuf(); const s = jeu.state;
    s.tuto = false; s.coins = 5e6; s.pens = 20;
    for (let i = 0; i < 16; i++) bete2(jeu, i % 2 ? 'crabe' : 'crapaud', 3, 3000);
    s.asc.jetons = n; s.asc.paliers = jeu.RANG_PREMIER;
    eq(n + ' jeton(s) → ' + n + ' carte(s), sans plafond', jeu.apercuAscension().max, n);
  }

  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 10;
  for (let i = 0; i < 6; i++) bete2(jeu, 'crapaud', 3, 3000);
  s.asc.jetons = 5; s.asc.paliers = jeu.RANG_PREMIER;
  const ap = jeu.apercuAscension();
  jeu.ascChoix = [ap.neuves[0].id, ap.neuves[1].id];   // il n'en emploie que deux
  jeu.ascensionner();
  eq('les cinq jetons partent, employés ou non', jeu.state.asc.jetons, 0);
  eq('deux cartes emportées', jeu.state.album.length, 2);
  ok('et l’ascension se referme', !jeu.peutAscensionner());
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
  s.asc.jetons = 9; s.asc.paliers = jeu.RANG_PREMIER;

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

  /* ──────────────────────────────── les fonds ──────────────────────────────── */

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

  s.asc.jetons = 1; s.asc.paliers = jeu.RANG_PREMIER;
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
  s.asc.jetons = 1; s.asc.paliers = jeu.RANG_PREMIER;
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
  eq('la lignée attend en réserve', (s.pension.dus.rare || []).join(), 'loup,loup');
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
  ok('et il dit ce qui attend', /loup|ours/.test(noeuds.get('pension-intro').textContent),
     noeuds.get('pension-intro').textContent);
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

  const bande = () => noeuds.get('strip-pen').children.length;
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

  /* MAIS ELLE N'A PAS QUITTÉ SON ENCLOS — c'est tout le prix de la pension. */
  eq('l’enclos reste occupé', jeu.penUsed(), enclos);
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
  const reste = () => ligne().children.find(c => c.classList.contains('couple-reste')).textContent;
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

  jeu.refresh();
  const cases = casesNid(jeu);
  ok('les deux cases sont fermées', cases.every(z => z.classList.contains('fermee')));
  ok('et désactivées', cases.every(z => z.disabled));
  ok('elles disent pourquoi',
     cases.every(z => /occupé/.test(z.children.map(x => x.textContent).join(' '))),
     cases.map(z => z.children.map(x => x.textContent).join(' ')).join(' | '));

  // la place ne se libère plus toute seule : il faut rompre le couple
  jeu.avancePension(1e6);
  eq('le couple tient bon', jeu.couples().length, 1);
  ok('on le rompt', jeu.romprePension(a.id));
  jeu.refresh();
  ok('le nid se rouvre', jeu.nidOuvert());
  ok('et poser remarche', jeu.poserAuNid(c.id, 'a'));
  jeu.refresh();
  ok('les cases aussi', casesNid(jeu).every(z => !z.classList.contains('fermee')));

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

scenario('pension — les échelles du bâtiment, et ce qu’elles ne touchent pas', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [a, b] = couple(jeu, 'crapaud', 'ouroboros');

  /* LES TROIS N'EXISTENT PAS SANS LE BÂTIMENT : trois cases qui parlent d'un panneau qu'on
     n'a pas encore encombrent la grille pour rien. */
  const miennes = jeu.PRIMES.filter(p => p.cle.startsWith('pension-'));
  eq('douze primes de pension', miennes.length, 12);
  ok('toutes conditionnées', miennes.every(p => !!p.si));
  s.primes = {};
  ok('et aucune n’apparaît sans le bâtiment', miennes.every(p => !p.si()));
  s.primes.pension = true;
  /* CHAQUE ÉCHELLE S'OUVRE UN CRAN À LA FOIS : le second nid ne se propose pas avant le
     premier. C'est ce qui rend la grille des cinq prochaines lisible en fin de partie. */
  const premiers = miennes.filter(p => p.si());
  eq('quatre crans ouverts d’emblée', premiers.length, 4);
  for (const pref of ['pension-place-', 'pension-vite-', 'pension-portee-']) {
    eq(pref + '1 s’ouvre', !!jeu.PRIME_BY_CLE[pref + '1'].si(), true);
    eq(pref + '2 attend', !!jeu.PRIME_BY_CLE[pref + '2'].si(), false);
    s.primes[pref + '1'] = true;
    eq(pref + '2 s’ouvre alors', !!jeu.PRIME_BY_CLE[pref + '2'].si(), true);
    delete s.primes[pref + '1'];
  }

  /* LE NID TIÈDE raccourcit d'un tiers, RECETTES COMPRISES — c'est la seule chose du jeu qui
     rende une merveille plus rapide, et elle le fait sans jamais la nommer. */
  const avant = jeu.dureePension(a, b);
  /* L'ÉCHELLE SE LIT COMME UN PALIER QUI REMPLACE LE PRÉCÉDENT, jamais comme une somme :
     « quatre fois plus vite » veut dire quatre fois plus vite QU'À L'ORIGINE. */
  for (const [n, x] of [[1, 1.5], [2, 4], [3, 12]]) {
    s.primes['pension-vite-' + n] = true;
    eq('cran ' + n + ' : ×' + x, jeu.dureePension(a, b), Math.round(avant / x));
  }
  eq('l’échelle plafonne à douze', jeu.vitessePension(), 12);

  const g1 = bete(jeu, 'golem', 4, 20000), g2 = bete(jeu, 'golem', 4, 20000);
  eq('la recette raccourcit aussi', jeu.dureePension(g1, g2),
     Math.round(jeu.recetteDe(g1, g2).duree / 12));

  /* MAIS PAS UN COUPLE DÉJÀ PARTI : sinon la prime devient un bouton « finis ma couvaison ». */
  for (let n = 1; n <= 3; n++) delete s.primes['pension-vite-' + n];
  jeu.accoupler(a, b);
  const fige = jeu.couples()[0].duree;
  s.primes['pension-vite-1'] = true;
  eq('la durée du couple en cours ne bouge pas', jeu.couples()[0].duree, fige);
  delete s.primes['pension-vite-1'];
  s.pension.couples = [];

  /* LE SANG double la chance du parent le plus rare, sans passer une fois sur deux. */
  eq('sans lui', jeu.chancePension(1), 0.2);
  s.primes['pension-sang'] = true;
  eq('avec lui', jeu.chancePension(1), 0.4);
  eq('et le plus petit écart reste à pile ou face', jeu.chancePension(0), 0.5);
  ok('il se voit dans la lignée tirée', (() => {
    let hauts = 0;
    for (let i = 0; i < 4000; i++) if (jeu.ligneeDe(a, b) === 'ouroboros') hauts++;
    return hauts / 4000 > 0.01;               // 2 % attendu, 1 % sans la prime
  })());
  s.primes['pension-sang'] = false;

  /* LES PLACES MONTENT PAR CRANS : 1, 2, 4, 8. */
  eq('une place au départ', jeu.placesPension(), 1);
  s.primes['pension-place-1'] = true;
  eq('deux avec le second nid', jeu.placesPension(), 2);
  s.primes['pension-place-2'] = true;
  eq('quatre avec la rangée', jeu.placesPension(), 4);
  s.primes['pension-place-3'] = true;
  eq('huit avec le bâtiment entier', jeu.placesPension(), 8);
  delete s.primes['pension-place-2']; delete s.primes['pension-place-3'];
  jeu.accoupler(a, b);
  ok('le nid reste ouvert après le premier couple', jeu.nidOuvert());
  const c = bete(jeu, 'cerf', 4, 20000), d = bete(jeu, 'chat', 4, 20000);
  ok('et un second couple se forme', jeu.accoupler(c, d));
  ok('le troisième, non', !jeu.nidOuvert());

  /* AUCUNE NE TOUCHE AUX RECETTES : une prime qui ferait tomber les merveilles plus souvent
     devrait le dire pour se vendre, et dirait donc qu'elles existent. */
  for (const p of miennes) ok(p.nom + ' ne parle pas des merveilles', !/erveille/.test(p.dit));
  s.primes['pension-sang'] = true; s.primes['pension-vite-1'] = true;
  eq('et la chance d’une recette ne bouge pas', jeu.recetteDe(g1, g2).chance, 0.001);

  /* LA RICHESSE SE DESSERRE MAIS NE SE LÈVE PAS. Le multiplicateur de rareté est ce qui
     empêche la pension d'être une imprimante à billets ; on le divise, on ne le supprime pas. */
  s.primes = { pension: true };
  const myth1 = bete(jeu, 'ouroboros', 4, 20000), myth2 = bete(jeu, 'behemoth', 4, 20000);
  const plein = jeu.dureePension(myth1, myth2);
  eq('la richesse vaut un au départ', jeu.richessePension(), 1);
  s.primes['pension-riche-1'] = true;
  eq('quatre fois moins', jeu.dureePension(myth1, myth2), Math.round(plein / 4));
  s.primes['pension-riche-2'] = true;
  eq('huit fois moins', jeu.dureePension(myth1, myth2), Math.round(plein / 8));
  ok('mais deux mythiques restent plus lentes que deux communes',
     jeu.dureePension(myth1, myth2) > jeu.dureePension(a, b), jeu.dureePension(myth1, myth2));
  /* Elle ne descend jamais sous un : sinon une commune irait plus vite que la boucle de jeu,
     et le plafond de réserve serait le seul reste du système. */
  s.pens = 40;
  const com1 = bete(jeu, 'crapaud', 4, 20000), com2 = bete(jeu, 'crapaud', 4, 20000);
  s.primes = { pension: true };
  const nue = jeu.dureePension(com1, com2);
  s.primes['pension-riche-1'] = true; s.primes['pension-riche-2'] = true;
  eq('deux communes ne gagnent rien à desserrer la richesse',
     jeu.dureePension(com1, com2), nue);
});

scenario('pension — la portée multiplie les œufs, jamais les merveilles', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15;
  const [g1, g2] = couple(jeu, 'golem', 'golem');

  eq('une portée d’un au départ', jeu.porteePension(), 1);
  for (const [n, x] of [[1, 2], [2, 3], [3, 5]]) {
    s.primes['pension-portee-' + n] = true;
    eq('cran ' + n + ' : ' + x + ' œufs', jeu.porteePension(), x);
  }

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
  eq('et elle ne contient qu’une merveille', dus.filter(l => l === 'wukong').length, 1);
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

  // et une lignée promise en réserve ne se nomme pas non plus
  s.pension.dus = { merveille: ['wukong'] };
  jeu.refresh();
  ok('la réserve reste muette', !/[Ww]ukong/.test(noeuds.get('pension-intro').textContent),
     noeuds.get('pension-intro').textContent);

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
  ok('la réserve nomme enfin', /[Ww]ukong/.test(noeuds.get('pension-intro').textContent),
     noeuds.get('pension-intro').textContent);
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
  eq('et sa lignée est promise', (s.pension.dus.merveille || []).join(), 'wukong');
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
  eq('de golem', (s.pension.dus.epique || []).join(), 'golem');
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
  w.tint = o.tint; w.niv = o.niv; w.over = o.over = 0; w.temper = o.temper; w.prodige = o.prodige = false;
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
  jeu.refresh();
  ok('la note le dit', /arrêté/.test(noeuds.get('note-acheteur').textContent),
     noeuds.get('note-acheteur').textContent);

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
  const familles = { valeur: [], rente: [], vitesse: [] };
  for (const p of jeu.PRIMES) for (const k of Object.keys(p.bonus || {})) familles[k].push(p);
  for (const k of Object.keys(familles)) {
    eq(k + ' — quatre primes', familles[k].length, 4);
    eq(k + ' — cinquante pour cent en tout',
       Math.round(familles[k].reduce((n, p) => n + p.bonus[k], 0) * 100), 50);
    ok(k + ' — réparties sur toute la fin de partie',
       Math.max(...familles[k].map(p => p.prix)) / Math.min(...familles[k].map(p => p.prix)) > 1000);
    for (const p of familles[k]) eq(p.nom + ' ne porte qu’un axe', Object.keys(p.bonus).length, 1);
  }
  for (const k of Object.keys(familles)) eq(k + ' — coefficient neutre au départ', jeu.coef(k), 1);

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
  const pousse = () => {
    s.incub[0] = { line: 'ouroboros', p: 0, kind: 'mythique' };
    jeune.p = 0; jeune.age = 1; jeune.over = 0;
    jeu.advance(10);
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

  /* TOUT PRIS : la grille bascule d'elle-même, sinon elle serait vide. */
  for (const p of jeu.PRIMES) s.primes[p.cle] = true;
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
  eq('sa teinte est notée', d.teintes[c.tint], 1);
  eq('son caractère aussi', d.caracteres[c.temper], 1);
  eq('son motif aussi', d.motifs[c.motif], 1);
  eq('et rien d’autre en teintes', Object.keys(d.teintes).length, 1);

  const f = fiche(jeu, 'loup');
  eq('la lignée a un nom', f.titre, 'Loup');
  ok('une seule forme rencontrée', /1 forme sur 5/.test(f.dit), f.dit);
  ok('les quatre autres restent des points d’interrogation',
     (f.tout.match(/？/g) || []).length >= 4, f.tout);
  ok('la teinte croisée s’affiche',
     f.tout.indexOf(jeu.TINTS[c.tint].name || 'sans teinte') !== -1, f.tout);
  ok('et le compte des teintes dit ce qui manque', /Teintes — 1 \/ 8/.test(f.tout), f.tout);

  /* DEUX ÉCLOSIONS DE LA MÊME TEINTE COMPTENT DEUX FOIS, elles ne se dédoublent pas. */
  const avant = d.teintes[c.tint];
  jeu.noterEclosion({ line: 'loup', tint: c.tint, temper: c.temper, motif: c.motif });
  eq('le compte monte', jeu.dexVu('loup').teintes[c.tint], avant + 1);
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

  /* LE POURCENTAGE SE CALCULE, IL NE SE STOCKE PAS : une prime achetée après coup ne doit
     pas laisser dans le carnet un nombre qui n'est plus vrai. */
  const cr = bete(jeu, 'crapaud', 4, 20000), ou = bete(jeu, 'ouroboros', 4, 20000);
  jeu.dexDe('crapaud').couples['crapaud×ouroboros'] = 1;
  ok('sans le sang, la commune sort presque toujours',
     /99 %/.test(fiche(jeu, 'crapaud').tout), fiche(jeu, 'crapaud').tout);
  s.primes['pension-sang'] = true;
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

  s.asc.jetons = 1; s.asc.paliers = jeu.RANG_PREMIER;
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

/* ────────────────────────── la poussière et la fusion ────────────────────────── */

// une carte quelconque, pour peupler un album
function pave(jeu, id, ligne, etoiles) {
  return { id, line: ligne || 'crapaud', age: 5, niv: 100, tint: 7, rank: 5,
           prodige: false, etoiles: etoiles || 1, motif: 0, temper: 0 };
}

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
  const bacle = Object.assign(pave(jeu, 3, 'crapaud'), { niv: 1, tint: 0, rank: 0 });
  eq('une carte bâclée rend autant qu’une parfaite', jeu.poussiereDe(bacle), jeu.poussiereDe(nu));
  ok('mais elle est bien plus faible', jeu.puissanceDe(bacle) < jeu.puissanceDe(nu));
});

scenario('poussière — fondre, fusionner, et ne jamais défaire', () => {
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

  const cout = jeu.coutFusion(s.album[0]);
  ok('sans poussière, pas de fusion', !jeu.fusionner(1));
  s.poussiere = cout;
  ok('avec juste assez, elle passe', jeu.fusionner(1));
  eq('la carte gagne une étoile', s.album[0].etoiles, 2);
  eq('et la poussière est dépensée', s.poussiere, 0);

  s.poussiere = 1e6;
  ok('la deuxième fusion passe', jeu.fusionner(1));
  eq('trois étoiles', s.album[0].etoiles, jeu.ETOILES.length);
  eq('il n’y a pas de quatrième', jeu.coutFusion(s.album[0]), null);
  ok('et fusionner encore est refusé', !jeu.fusionner(1));

  /* ON NE DÉFAIT PAS UNE FUSION : les étoiles n'entrent pas dans ce qu'une carte rend. Sinon
     fusionner puis fondre fabriquerait de la poussière à l'infini. */
  jeu.deplacerCarte(1, false);
  const avant = s.poussiere;
  jeu.desintegrer(1);
  eq('une carte à trois étoiles rend autant qu’une neuve',
     s.poussiere - avant, jeu.poussiereDe(pave(jeu, 9)));
});

scenario('poussière — l’ascension laisse ce qu’on n’emporte pas', () => {
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
  for (let i = 0; i < 10; i++) bete3(jeu, 'crapaud', 3, 3000);
  s.asc.jetons = 2; s.asc.paliers = jeu.RANG_PREMIER;

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

  jeu.fusionner(1); jeu.verifierTrophees();
  ok('« Deux étoiles » tombe à la première fusion', pris('deuxEtoiles'));
  ok('« Trois étoiles » pas encore', !pris('troisEtoiles'));
  jeu.fusionner(1); jeu.verifierTrophees();
  ok('et tombe à la seconde', pris('troisEtoiles'));

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

/* Une carte au sommet de ce que le jeu peut produire : c'est là que les bornes se testent.
   Déclarée en `function` et non en `const` : les scénarios s'exécutent dans l'ordre du
   fichier, et celui de la plonge s'en sert avant d'arriver ici. */
function parfaite(jeu, motif, id) {
  return {
    id, line: 'ouroboros', age: 5, niv: 100, tint: jeu.TINTS.length - 1,
    rank: jeu.RANKS.length - 1, prodige: true, etoiles: 1, motif, temper: 0,
  };
}
function equiper(jeu, motif, n) {
  jeu.state.album = []; jeu.state.slots = [];
  for (let i = 1; i <= n; i++) { jeu.state.album.push(parfaite(jeu, motif, i)); jeu.state.slots.push(i); }
  jeu.oublierAlbum();
}

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
  ok('fusionner annonce son coût', /★/.test(p('fusion').textContent), p('fusion').textContent);
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
