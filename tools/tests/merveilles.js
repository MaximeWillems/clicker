/* ── LES MERVEILLES — la cinquième rareté, ses recettes, ce qu’elle ne donne pas */

'use strict';
const { scenario, ok, eq, neuf, noeuds, bete, seule, couple, ditPension } = require('./_aides.js');

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

scenario('roster — les créatures ajoutées, leurs rangs et leurs routes', () => {
  const jeu = neuf();
  const rang = k => (jeu.LINE_BY_KEY[k] || {}).rarity;

  // les rangs demandés
  eq('tricératops rare', rang('triceratops'), 'rare');
  eq('spinosaure épique', rang('spinosaure'), 'epique');
  eq('vélociraptor épique', rang('velociraptor'), 'epique');
  eq('tyrannosaure mythique', rang('tyrannosaure'), 'mythique');
  eq('charybde mythique', rang('charybde'), 'mythique');
  eq('scylla mythique', rang('scylla'), 'mythique');
  eq('dragon ancien mythique', rang('dragon-ancien'), 'mythique');
  eq('béhémoth passe merveille', rang('behemoth'), 'merveilleuse');
  eq('ouroboros passe merveille', rang('ouroboros'), 'merveilleuse');
  eq('dragon prismatique merveille', rang('dragon-prismatique'), 'merveilleuse');
  eq('charybde et scylla merveille', rang('charybde-scylla'), 'merveilleuse');

  // chacune a ses étiquettes et ses cinq formes, sinon la pension et la scène cassent
  for (const k of ['triceratops', 'spinosaure', 'velociraptor', 'tyrannosaure', 'charybde',
                   'scylla', 'dragon-ancien', 'dragon-prismatique', 'charybde-scylla']) {
    ok(k + ' a ses étiquettes', !!jeu.ETIQUETTES[k]);
    eq(k + ' a cinq formes', jeu.LINE_BY_KEY[k].forms.length, jeu.AGES.length);
  }

  /* BÉHÉMOTH ET OUROBOROS NE SORTENT PLUS DE L'ŒUF MYTHIQUE : ils sont passés merveille, donc
     le tirage d'un œuf mythique ne les propose plus. */
  const mythiquesOeuf = jeu.LINES.filter(l => l.rarity === 'mythique').map(l => l.key);
  ok('l’œuf mythique ne donne plus béhémoth', !mythiquesOeuf.includes('behemoth'));
  ok('ni ouroboros', !mythiquesOeuf.includes('ouroboros'));

  /* LES QUATRE ROUTES LOGIQUES : deux dinos → béhémoth, deux dragons anciens → prismatique,
     serpent + dragon ancien → ouroboros, Charybde + Scylla → leur monstre à deux têtes. */
  const donne = (a, b) => { const r = jeu.recetteDe({ line: a }, { line: b }); return r && r.donne; };
  eq('tyrannosaure × tricératops → béhémoth', donne('tyrannosaure', 'triceratops'), 'behemoth');
  eq('dragon ancien × dragon ancien → prismatique', donne('dragon-ancien', 'dragon-ancien'), 'dragon-prismatique');
  eq('serpent × dragon ancien → ouroboros', donne('serpent', 'dragon-ancien'), 'ouroboros');
  eq('charybde × scylla → charybde et scylla', donne('charybde', 'scylla'), 'charybde-scylla');
  /* ET OUROBOROS RESTE LE PARENT DE LA KITSUNE : la chaîne de fin de partie est assumée. */
  ok('ouroboros reste parent de la kitsune',
     jeu.RECETTES.some(r => r.donne === 'kitsune' && (r.a === 'ouroboros' || r.b === 'ouroboros')));
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
  /* LA RECETTE (le sphinx) EST PLUS GÉNÉREUSE QUE L'ACCIDENT (le chat) — on compare les deux
     routes entre elles, sans coller à un chiffre : les chances ont bougé avec le plafond d'une
     heure, la hiérarchie non. */
  const parSphinx = kitsune.find(r => r.b === 'sphinx' || r.a === 'sphinx');
  const parChat = kitsune.find(r => r.b === 'chat' || r.a === 'chat');
  ok('la recette est plus généreuse que l’accident', parSphinx.chance > parChat.chance,
     parSphinx.chance + ' vs ' + parChat.chance);

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
  s.tuto = false; s.coins = 1e12; s.pens = 8; s.ciel = Object.assign(s.ciel || {}, { nid: 1 });
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
  eq('et le compte s’arrête aux formes non secrètes', jeu.formesVisibles(), 160);
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
  eq('le compte monte avec le rang secret', jeu.formesVisibles(), 195);
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
  ok('et la durée est celle de la recette', /1 h/.test(dit()), dit());

  jeu.pensionB = loup.id; jeu.refresh();
  ok('un couple ordinaire ne promet rien', !/autre chose/.test(dit()), dit());

  s.seen['kitsune:1'] = true;
  jeu.pensionA = a.id; jeu.pensionB = b.id; jeu.refresh();
  ok('une fois rencontrée, la phrase la nomme', /2 % Kitsune/.test(dit()), dit());
});

scenario('merveilles — un cran de puissance, mais jamais un raccourci', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12; s.pens = 8; s.ciel = Object.assign(s.ciel || {}, { nid: 1 });

  /* LA RÈGLE A CHANGÉ, ET IL FAUT DIRE LAQUELLE ÉTAIT LÀ AVANT. La merveilleuse partageait le
     multiplicateur de la mythique : elle était « un cran de RARETÉ, pas un cran de PUISSANCE ».
     La raison tenait debout — si une merveille valait plus, la pension redeviendrait la
     meilleure façon de faire de l'argent, et tout le travail de la 3.0.0 tomberait sur la
     première éclose.

     ELLE EST MAINTENANT UN CRAN DE PUISSANCE, et la raison d'avant est désarmée autrement :
     ses PÉAGES montent du même cran que sa valeur. Elle coûte dix-huit mille fois plus à mener
     au bout, et elle vaut dix-huit mille fois plus — donc sa MARGE est exactement celle d'une
     mythique. La pension n'est pas un raccourci vers l'argent : c'est la seule porte vers un
     barreau de plus, et il faut déjà une fortune de ce barreau-là pour l'emprunter.

     C'EST CETTE ÉGALITÉ DE MARGE QUE LE SCÉNARIO GARDE. Le multiplicateur a le droit de
     bouger ; ce qui n'a pas le droit de bouger, c'est qu'un rang rapporte plus PAR PIÈCE
     INVESTIE qu'un autre — ça, ce serait un raccourci. */
  const m = jeu.RARITY.merveilleuse.mult, y = jeu.RARITY.mythique.mult;
  ok('la merveilleuse vaut plus qu’une mythique', m > y, m + ' contre ' + y);
  ok('et d’un cran comparable à celui d’avant', m / y > 1000 && m / y < 100000,
     '×' + Math.round(m / y));
  eq('mais sa carte ne plafonne pas plus haut',
     jeu.RARITY.merveilleuse.plafond, jeu.RARITY.mythique.plafond);

  /* LA MARGE : ce qui reste quand on a mené la bête au bout et payé tous ses péages, rapporté
     à ce qu'on y a mis. Elle se calcule sur les tables, donc sans dépendre d'aucune bête. */
  const marge = cle => {
    const v = jeu.valeurMure(cle, 5), p = jeu.peagesJusque(cle, 5);
    return (v - p) / p;
  };
  const ecart = Math.abs(marge('merveilleuse') - marge('mythique'));
  ok('elle rapporte autant par pièce investie qu’une mythique', ecart < 0.001,
     'merveille ' + marge('merveilleuse').toFixed(4) + ' contre mythique ' + marge('mythique').toFixed(4));

  /* ET LA MÊME CHOSE À TOUS LES RANGS PAYANTS : une seule table de péages et une seule table de
     valeurs, donc une seule pente. Un rang qui s'en écarterait serait un raccourci ou un piège. */
  const marges = ['rare', 'epique', 'mythique', 'merveilleuse'].map(marge);
  ok('tous les rangs ont la même pente',
     Math.max.apply(null, marges) - Math.min.apply(null, marges) < 0.001, marges.join(' · '));

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
