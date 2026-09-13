/* ── LA FERME — la réserve, les automates, l’absence et le calme */

'use strict';
const { scenario, ok, eq, neuf, noeuds, brut, bete, seule } = require('./_aides.js');

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
