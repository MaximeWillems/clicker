/* ── LE MODE HISTOIRE — la professeure, ce qu’elle dit et ce qu’elle retient */

'use strict';
const { scenario, ok, eq, neuf, noeuds, bete, seule, ditDial, dialOuvert, impasse } = require('./_aides.js');

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
