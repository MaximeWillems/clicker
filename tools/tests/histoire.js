/* ── LE MODE HISTOIRE — la professeure, ce qu’elle dit et ce qu’elle retient */

'use strict';
const { scenario, ok, eq, neuf, noeuds, bete, seule, ditDial, dialOuvert, impasse } = require('./_aides.js');

const retient = () => noeuds.get('dial-boite').classList.contains('tient');
const acte = (jeu, k) => jeu.refs.acts[k];

// la première bête, obtenue au clic comme un joueur neuf, et mise en scène
function eclore(jeu) {
  const s = jeu.state;
  while (!s.pen.length) { jeu.tapStage(); jeu.hatchAll(); }
  const c = s.pen[0];
  jeu.select('c:' + c.id);
  return c;
}

// lit la scène jusqu'à sa réplique qui retient
function jusquAuTient(jeu) {
  let garde = 0;
  while (!retient() && dialOuvert() && garde++ < 10) jeu.replique(false);
  return retient();
}

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

scenario('dialogue — on ne retient que sur ce qui est possible, et gratuit ou payable à coup sûr', () => {
  const jeu = neuf();
  /* LES TROIS RÈGLES tiennent toujours : l'action doit être possible tout de suite, gratuite ou
     avoir une porte gratuite, et indispensable à la suite. Le rachat est la seule entorse à la
     deuxième, et elle tient parce que la vente ne s'ouvre qu'à la valeur d'un œuf. */
  const tenues = [];
  for (const n of jeu.NOTES) for (const r of n.repliques) if (r && r.tient) tenues.push([n.cle, r]);
  eq('cinq passages obligés, pas un de plus', tenues.length, 5);
  for (const cle of ['oeuf', 'bete', 'mure', 'boutique', 'peage']) {
    ok('« ' + cle + ' » retient', tenues.some(([c]) => c === cle));
  }
  for (const [cle, r] of tenues) {
    ok('« ' + cle + ' » sait quand le geste est fait', typeof r.fait === 'function');
    for (const v of r.vise || []) ok('« ' + cle + ' » vise ce qui existe (' + v + ')', !!jeu.VISEES[v]);
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
  ok('« mure » atteint sa réplique qui retient', jusquAuTient(jeu), ditDial());
  const avantVente = ditDial();
  jeu.sell(jeu.state.pen[0]); jeu.refresh();
  ok('vendre fait avancer « mure »', ditDial() !== avantVente);
  ok('sans fermer la scène', dialOuvert(), 'la leçon a été perdue');

  jeu = seule('peage', (j, s) => {
    s.coins = 1e5; s.incub[0].p = 9999; j.hatchAll(); s.pen[0].p = j.bandTo(s.pen[0]);
  });
  ok('« peage » atteint sa réplique qui retient', jusquAuTient(jeu), ditDial());
  const avantEvo = ditDial();
  jeu.evolve(jeu.state.pen[0]); jeu.refresh();
  ok('évoluer fait avancer « peage »', ditDial() !== avantEvo);
  ok('sans fermer la scène', dialOuvert(), 'la leçon a été perdue');

});

scenario('main tenue — à l’éclosion, la scène ne montre que le niveau', () => {
  const jeu = neuf();
  eclore(jeu); jeu.refresh();
  ok('pas de bouton Vendre', acte(jeu, 'sell').hidden);
  ok('pas de bouton Évoluer', acte(jeu, 'evo').hidden);
  ok('pas de bouton Garder', acte(jeu, 'keep').hidden);
  ok('le niveau est là', !noeuds.get('axe-niv').hidden);
  ok('l’âge attend l’évolution', noeuds.get('axe-age').hidden);
  ok('la taille attend la maturité', noeuds.get('axe-taille').hidden);
  ok('le bonheur attend le premier rachat', noeuds.get('stage-joie').hidden);
});

scenario('main tenue — vendre s’ouvre quand la bête paie un œuf, pas un clic avant', () => {
  const jeu = neuf(); const s = jeu.state;
  const c = eclore(jeu);
  const oeuf = jeu.prixOeuf(jeu.EGG_BY_KEY.commun);
  let tot = false;
  while (!jeu.vautUnOeuf(c)) {
    jeu.refresh();
    if (!acte(jeu, 'sell').hidden) tot = true;
    jeu.tapStage();
  }
  ok('jamais visible tant qu’elle ne vaut pas un œuf', !tot);
  jeu.refresh();
  ok('visible dès qu’elle le vaut', !acte(jeu, 'sell').hidden, jeu.sellValue(c));
  jeu.sell(c);
  ok('et la vendre paie un œuf', s.coins >= oeuf, s.coins);
});

scenario('main tenue — la professeure présente la vente, sans retenir', () => {
  const jeu = seule('vente', j => {
    const c = eclore(j);
    while (!j.vautUnOeuf(c)) j.tapStage();
  });
  ok('« vente » s’ouvre', dialOuvert() && jeu.state.dial.cle === 'vente', ditDial());
  ok('elle ne retient pas', !retient());
  jeu.sell(jeu.state.pen[0]); jeu.refresh();
  ok('vendre la ferme', !dialOuvert(), ditDial());
  ok('et la marque jouée', jeu.state.vu.vente === true);
});

scenario('main tenue — mûre sans rien avoir vendu, elle retient sur Vendre et le laisse vivant', () => {
  const jeu = seule('mure', (j, s) => { s.incub[0].p = 9999; j.hatchAll(); s.pen[0].p = j.bandTo(s.pen[0]); });
  const s = jeu.state;
  ok('on atteint la réplique qui retient', jusquAuTient(jeu), ditDial());
  ok('l’écran s’éteint', document.body.classList.contains('tenu'));
  ok('le bouton Vendre est visible', !acte(jeu, 'sell').hidden);
  ok('et visé : le voile l’épargne', acte(jeu, 'sell').classList.contains('vise'));
  ok('Évoluer reste fermé', acte(jeu, 'evo').hidden);
  ok('la taille s’affiche avec la maturité', !noeuds.get('axe-taille').hidden);
  jeu.sell(s.pen[0]); jeu.refresh();
  ok('vendre relâche', !retient());
  ok('le bouton n’est plus visé', !acte(jeu, 'sell').classList.contains('vise'));
  ok('et la leçon suit', dialOuvert());
});

scenario('main tenue — qui a déjà vendu n’est pas retenu à la maturité', () => {
  const jeu = seule('mure', (j, s) => {
    s.stats.vendues = 1; s.incub[0].p = 9999; j.hatchAll(); s.pen[0].p = j.bandTo(s.pen[0]);
  });
  let aRetenu = false, garde = 0;
  while (dialOuvert() && garde++ < 10) { if (retient()) aRetenu = true; jeu.replique(false); }
  ok('la scène se lit jusqu’au bout', !dialOuvert(), ditDial());
  ok('sans jamais retenir', !aRetenu);
});

scenario('main tenue — racheter retient, et seul l’œuf reste vivant', () => {
  const prep = (j, s) => { s.incub[0].p = 9999; j.hatchAll(); s.pen = []; s.coins = 30; s.plie = { boutique: true }; };
  const jeu = seule('boutique', prep);
  ok('« boutique » s’ouvre et retient', dialOuvert() && retient(), ditDial());
  const oeuf = jeu.refs.shop['egg-commun'];
  ok('le bouton de l’œuf est visé', oeuf.el.classList.contains('vise'));
  ok('sa ligne reste allumée', oeuf.li.classList.contains('vise-dans'));
  ok('la boutique se déplie d’elle-même', !noeuds.get('panel-boutique').classList.contains('plie'));
  jeu.buyEgg('commun'); jeu.refresh();
  ok('acheter l’œuf relâche', !retient());
  ok('plus rien n’est visé', !oeuf.el.classList.contains('vise') && !oeuf.li.classList.contains('vise-dans'));
  ok('et la boutique retrouve son pli', noeuds.get('panel-boutique').classList.contains('plie'));

  // on ne retient pas sur l'impossible : sous le prix d'un œuf, elle lâche
  const pauvre = seule('boutique', prep);
  pauvre.state.coins = 5; pauvre.refresh();
  ok('sans de quoi payer, elle lâche', !retient());
});

scenario('main tenue — le bonheur attend le premier rachat', () => {
  const jeu = neuf(); const s = jeu.state;
  const c = eclore(jeu);
  c.bonheur = jeu.JOIE_PALIER; jeu.refresh();
  ok('la première bête, même heureuse, ne montre pas le cœur', noeuds.get('stage-joie').hidden);
  s.stats.eclos = 2; jeu.refresh();
  ok('après le rachat, il apparaît', !noeuds.get('stage-joie').hidden);
  c.bonheur = 0; jeu.refresh();
  ok('et ne se recache plus', !noeuds.get('stage-joie').hidden);

  const j2 = neuf();
  eclore(j2);
  j2.state.dons = 1; j2.refresh();
  ok('un cadeau tombé avant l’ouvre aussi', !noeuds.get('stage-joie').hidden);
});

scenario('main tenue — évoluer s’ouvre avec le péage payable, et décider retient', () => {
  const j0 = neuf(); const s0 = j0.state;
  const c0 = eclore(j0); c0.p = j0.bandTo(c0); j0.refresh();
  ok('mûre mais sans le péage, pas de bouton Évoluer', acte(j0, 'evo').hidden);
  ok('ni de colonne de l’âge', noeuds.get('axe-age').hidden);
  s0.coins = j0.evoCost(c0); j0.refresh();
  ok('le péage payable l’ouvre', !acte(j0, 'evo').hidden);
  ok('avec l’âge', !noeuds.get('axe-age').hidden);

  const jeu = seule('peage', (j, s) => {
    s.coins = 1e5; s.stats.vendues = 30;
    s.incub[0].p = 9999; j.hatchAll(); s.pen[0].p = j.bandTo(s.pen[0]);
    s.sel = 'i:0';
  });
  const s = jeu.state;
  ok('on atteint le « décide »', jusquAuTient(jeu), ditDial());
  ok('trente ventes d’avant ne la relâchent pas', retient());
  eq('elle met la bête en scène', s.sel, 'c:' + s.pen[0].id);
  ok('Vendre et Évoluer sont visés',
     acte(jeu, 'sell').classList.contains('vise') && acte(jeu, 'evo').classList.contains('vise'));
  jeu.evolve(s.pen[0]); jeu.refresh();
  ok('évoluer relâche', !retient());
  ok('et la leçon suit', dialOuvert());
});

scenario('main tenue — garder s’ouvre avec le premier automate, ou une bête déjà gardée', () => {
  const jeu = neuf(); const s = jeu.state;
  eclore(jeu); jeu.refresh();
  ok('sans automate, garder ne protège de rien : pas de bouton', acte(jeu, 'keep').hidden);
  s.primes.marchand = true; jeu.refresh();
  ok('le marchand l’ouvre', !acte(jeu, 'keep').hidden);

  const j2 = neuf();
  const c2 = eclore(j2);
  c2.keep = true; j2.refresh();
  ok('une bête gardée d’office l’ouvre aussi, sinon elle serait invendable', !acte(j2, 'keep').hidden);
});

scenario('main tenue — sans le mode histoire, ou dans une partie avancée, tout est là', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  eclore(jeu); jeu.refresh();
  for (const k of ['sell', 'evo', 'keep']) ok('mode histoire éteint : ' + k + ' est là', !acte(jeu, k).hidden);
  for (const id of ['axe-age', 'axe-taille', 'stage-joie']) ok('et ' + id, !noeuds.get(id).hidden);

  const j2 = neuf(); const s2 = j2.state;
  s2.stats.vendues = 40; s2.stats.evolutions = 12; s2.primes.marchand = true;
  eclore(j2); j2.refresh();
  for (const k of ['sell', 'evo', 'keep']) ok('partie avancée : ' + k + ' est là', !acte(j2, k).hidden);
  ok('et la présentation de la vente ne se rejoue pas', !(s2.dial && s2.dial.cle === 'vente'));
});
