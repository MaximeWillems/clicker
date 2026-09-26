/* ── LA PENSION — le nid, le couple, la ponte, la pause */

'use strict';
const { scenario, ok, eq, neuf, noeuds, lire, bete, seule, couple, sousArbre, ditPension,
  casesNid } = require('./_aides.js');

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

  /* LE TEMPS DE BASE EST PLAFONNÉ À UNE HEURE. Deux mythiques à écart nul valaient seize heures
     par le multiplicateur de rareté — un mur, pas un choix. Elles sont désormais ramenées au
     plafond comme tout le reste. Le multiplicateur joue encore en dessous ; au-delà, il ne fait
     plus qu'atteindre le plafond. L'imprimante à billets que ce ralenti bornait est donc à
     resurveiller — l'équilibrage se reprend avec ce plafond. */
  const behe = bete(jeu, 'behemoth', 4, 20000);
  eq('deux mythiques se ressemblent', jeu.distanceDe(ouro, behe), 0);
  eq('mais leur couvaison est plafonnée à une heure', jeu.dureePension(ouro, behe),
     jeu.PENSION.plafond);
  eq('et le plafond vaut bien une heure', jeu.PENSION.plafond, 3600);

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

scenario('pension — c’est un nœud de constellation, plus une prime', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 8;
  const a = bete(jeu, 'loup', 4, 20000), b = bete(jeu, 'ours', 4, 20000);

  jeu.refresh();
  eq('le panneau n’existe pas', noeuds.get('panel-pension').hidden, true);
  ok('et le refus dit pourquoi', /construite/.test(jeu.refusPension(a, b)), jeu.refusPension(a, b));
  ok('accoupler est refusé', !jeu.accoupler(a, b));
  eq('la pension n’avance pas', jeu.avancePension(1e6), 0);

  /* ELLE NE S'ACHÈTE PLUS EN PIÈCES. Elle valait 400 000 dans l'escalier des primes, donc elle
     s'ouvrait au passage dans le premier cycle et la constellation ne faisait que l'agrandir.
     Un bâtiment qu'on ouvre sans y penser n'est pas une décision : il coûte maintenant trois
     jetons, et trois jetons sont un cycle. */
  ok('elle a quitté la table des primes', !jeu.PRIMES.some(x => x.cle === 'pension'));
  const n = jeu.ETOILE_BY_KEY.nid;
  ok('et elle est le premier nœud de son axe', n && n.axe === 'pension' && n.parent === 'etincelle');
  eq('à trois jetons', n.prix, 3);

  s.asc.jetons = n.prix;
  ok('le nœud s’achète', jeu.acheterEtoile('nid'));
  eq('et il est payé', jeu.jetonsEnMain(), 0);

  jeu.refresh();
  eq('le panneau apparaît', noeuds.get('panel-pension').hidden, false);
  ok('et le couple se forme', jeu.accoupler(a, b));

  /* UN COUPLE EN COURS GARDE LE PANNEAU À L'ÉCRAN même sans le nœud : sinon deux bêtes
     resteraient parquées derrière un panneau disparu. Le cas ne peut plus venir d'une
     ascension — la constellation la traverse — mais il vient d'une reprise. */
  s.ciel = {};
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
  jeu.engraisser(a, 1e6);
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

  // sans le nœud non plus, le nid ne se remplit pas
  s.ciel = {};
  eq('pas de bâtiment, pas de nid', jeu.nidOuvert(), false);
});

scenario('pension — une partie de v14 se relit sans rien perdre', () => {
  const j = neuf(); const s = j.state;
  s.coins = 5e6; s.pens = 4; s.stats.eclos = 12;
  const vieux = JSON.parse(JSON.stringify(s));
  // la même partie, du format d'avant le barème unique : ses pièces s'y convertissent pareil
  const ref = neuf(Object.assign(JSON.parse(JSON.stringify(s)), { v: 37 }));
  vieux.v = 14;
  /* Une v14 n a jamais pu pondre : ni file de lignées, ni compteur de naissances. */
  delete vieux.pension.dus; delete vieux.pension.nes; delete vieux.stats.pension;

  const k = neuf(vieux);
  eq('le format monte', k.state.v, k.SAVE_V);
  eq('la file naît vide', JSON.stringify(k.state.pension.dus), '{}');
  eq('le compteur aussi', k.state.pension.nes, 0);
  eq('et la ferme est intacte, au barème près', k.state.coins, ref.state.coins);
  eq('avec ses enclos', k.state.pens, 4);

  // et une partie plus vieille encore, sans champ pension du tout
  delete vieux.pension;
  const m = neuf(vieux);
  eq('un champ pension est posé', m.state.pension.couples.length, 0);
  eq('avec sa file', JSON.stringify(m.state.pension.dus), '{}');
  eq('et la pension tourne à vide sans lever', m.avancePension(1e5), 0);
});

scenario('pension — une sauvegarde d’avant garde ce qu’elle avait payé', () => {
  /* Les douze primes n'existent plus. Les laisser inertes confisquerait quatre mille
     milliards de pièces sans un mot : on rend le cran équivalent dans la constellation. */
  const vieille = neuf({
    coins: 1e9, primes: { pension: true, 'pension-place-1': true, 'pension-place-2': true,
                          'pension-vite-1': true, 'pension-sang': true },
  });
  /* LE REPORT SE FAIT EN DEUX TEMPS, et il faut le lire ainsi : la v27 a rendu trois crans
     de l’ancienne échelle, la v30 les répartit sur les deux branches. Deux crans de places et
     deux de hâte, plus le sang épais du tronc — personne ne perd rien, et la hâte est rendue
     en prime puisqu’elle était comprise dans l’ancien cran. */
  eq('deux crans de places', vieille.rangBranche('pension', 'places'), 2);
  eq('et deux de hâte', vieille.rangBranche('pension', 'hate'), 2);
  eq('donc quatre nids', vieille.placesPension(), 4);
  ok('et les primes mortes ont disparu de la sauvegarde',
     !Object.keys(vieille.state.primes).some(k => k.startsWith('pension-')),
     Object.keys(vieille.state.primes).join(' '));
  ok('le bâtiment, lui, reste — sous sa forme de nœud', vieille.etoilePrise('nid'));

  // qui n'avait rien n'obtient rien
  const nue = neuf({ coins: 1e9, primes: { pension: true } });
  ok('et le bâtiment payé devient un nœud', nue.etoilePrise('nid'));
  eq('aucun cran offert sans rien', nue.rangBranche('pension', 'places'), 0);
});

scenario('pension — un tronc et deux branches, et chacune son cadran', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;

  /* L'AXE ÉTAIT UNE ÉCHELLE, IL DEVIENT UN ARBRE. Quatre nœuds levaient LES QUATRE CADRANS
     ensemble — places, portée, vitesse et richesse d'un coup — si bien qu'on n'agrandissait
     pas la pension, on l'achetait entière, cran par cran. Maintenant le tronc donne trois
     choses DIFFÉRENTES et chaque branche donne un seul cadran, par crans. On choisit d'abord
     beaucoup de couples lents, ou peu de couples rapides. */
  ok('plus une seule prime de pension', !jeu.PRIMES.some(p => p.cle.startsWith('pension')));
  ok('le bâtiment n’en est plus une non plus', !jeu.PRIME_BY_CLE.pension);

  const axe = jeu.PAR_AXE.pension;
  eq('neuf nœuds sur l’axe', axe.length, 9);
  eq('trois au tronc', axe.filter(n => !n.branche).length, 3);
  eq('trois sur la branche des places', axe.filter(n => n.branche === 'places').length, 3);
  eq('trois sur celle de la hâte', axe.filter(n => n.branche === 'hate').length, 3);

  /* LES DEUX BRANCHES PARTENT DU MÊME NŒUD DE TRONC, et c'est ce qui en fait une fourche :
     prendre l'une n'attend pas l'autre. */
  eq('la fourche est au bâtiment', jeu.ETOILE_BY_KEY['place-1'].parent, 'nid');
  eq('pour les deux branches', jeu.ETOILE_BY_KEY['hate-1'].parent, 'nid');

  const prendre = (...cles) => { s.ciel = {}; for (const c of cles) s.ciel[c] = true; };

  /* CHAQUE BRANCHE NE BOUGE QUE SON CADRAN. C'est toute la différence avec l'échelle : monter
     les places ne donne plus la vitesse au passage. */
  prendre('nid');
  eq('le bâtiment seul : une place', jeu.placesPension(), 1);
  eq('et pas de hâte', jeu.vitessePension(), 1);

  prendre('nid', 'place-1', 'place-2', 'place-3');
  eq('trois crans de places : huit couples', jeu.placesPension(), 8);
  eq('et toujours pas de hâte', jeu.vitessePension(), 1);

  prendre('nid', 'hate-1', 'hate-2', 'hate-3');
  eq('trois crans de hâte : douze fois plus vite', jeu.vitessePension(), 12);
  eq('et toujours une seule place', jeu.placesPension(), 1);

  /* LE TRONC, LUI, SE LIT AU NŒUD. La portée et la richesse sont des CHOSES, pas des crans :
     elles n'ont pas de table, elles tiennent à un nœud précis. */
  prendre('nid');
  eq('sans le sang épais, une portée de un', jeu.porteePension(), 1);
  eq('et la richesse pèse de tout son poids', jeu.richessePension(), 1);
  prendre('nid', 'sang-epais');
  eq('le sang épais porte à trois', jeu.porteePension(), 3);
  prendre('nid', 'nid-riche');
  eq('et le sang léger desserre la richesse', jeu.richessePension(), 8);

  /* CE QUE L'AXE NE TOUCHE PAS : l'enclos. Une bête confiée garde sa case, et le nombre de
     cases ne se joue pas ici. */
  const avant = jeu.state.pens;
  prendre('nid', 'place-1', 'place-2', 'place-3', 'hate-1', 'hate-2', 'hate-3', 'sang-epais', 'nid-riche');
  eq('l’enclos ne bouge pas d’une case', jeu.state.pens, avant);
});

scenario('pension — la portée multiplie les œufs, jamais les merveilles', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15;
  const [g1, g2] = couple(jeu, 'golem', 'golem');

  /* LA PORTÉE N'EST PLUS UN CRAN, C'EST UNE CHOSE. Elle montait avec l'échelle — deux, trois,
     cinq, six œufs — quand chaque nœud levait les quatre cadrans ensemble. Elle tient
     maintenant à un seul nœud du tronc, le sang épais, et elle vaut un ou trois. */
  const monter = n => { s.ciel = n ? { nid: 1, 'sang-epais': 1 } : { nid: 1 };
                        jeu.oublierPrimes(); };

  monter(0);
  eq('une portée d’un sans le sang épais', jeu.porteePension(), 1);
  monter(1);
  eq('et de trois avec', jeu.porteePension(), 3);

  jeu.accoupler(g1, g2);
  const vrai = Math.random;
  try {
    Math.random = () => 0.99;                    // la recette ne tombe pas
    eq('trois œufs d’un coup', jeu.avancePension(jeu.dureePension(g1, g2) + 1), 3);
  } finally { Math.random = vrai; }
  eq('trois dans la réserve', jeu.eggStock('epique'), 3);
  eq('et trois lignées promises', (s.pension.dus.epique || []).length, 3);

  /* LA RECETTE SE TIRE UNE FOIS PAR PONTE, ET NON PAR ŒUF. Une nichée est un événement, pas
     cinq — sans cette règle la dernière prime du jeu multiplierait par cinq la chance de
     toutes les merveilles d'un coup. */
  s.eggs.epique = 0; s.pension.dus = {};
  try {
    Math.random = () => 0;                       // la recette tombe
    jeu.avancePension(jeu.dureePension(g1, g2) + 1);
  } finally { Math.random = vrai; }
  const dus = [].concat(...Object.values(s.pension.dus));
  eq('la nichée fait toujours trois', dus.length, 3);
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

scenario('pension cliquable — l’onglet s’ouvre avec le nid, et reprend la ferme', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const onglet = () => noeuds.get('pension-onglet') ||
    [...document.querySelectorAll('.onglet')].find(b => b.dataset.vue === 'pension');
  jeu.refresh();
  ok('sans nid, pas d’onglet', onglet().hidden);

  const [a, b] = couple(jeu, 'loup', 'ours');
  jeu.refresh();
  ok('avec le nid, l’onglet paraît', !onglet().hidden);

  jeu.ouvrirVue('pension');
  eq('on y est', jeu.vue, 'pension');
  ok('la bande des couples remplace celle des incubateurs',
     !noeuds.get('strip-couples').hidden && noeuds.get('strip-incub').hidden);
  eq('et le titre suit', noeuds.get('titre-incub').textContent, 'Pension');
  eq('une case libre, aucun couple', noeuds.get('compte-incub').textContent, '0 / 1');
  eq('la scène dit le nid vide', noeuds.get('stage-name').textContent, 'Le nid est vide');

  jeu.accoupler(a, b);
  jeu.refresh();
  eq('le couple a sa vignette', noeuds.get('strip-couples').children.length, 1);
  eq('et le compte le dit', noeuds.get('compte-incub').textContent, '1 / 1');
  ok('la scène montre le couple', / × /.test(noeuds.get('stage-name').textContent),
     noeuds.get('stage-name').textContent);

  jeu.ouvrirVue('ferme');
  ok('revenir à la ferme rend la bande des œufs',
     noeuds.get('strip-couples').hidden && !noeuds.get('strip-incub').hidden);
  eq('et son titre', noeuds.get('titre-incub').textContent, 'Couvaison');
});

scenario('pension cliquable — un clic avance la ponte, jamais plus de la moitié', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'loup', 'ours');
  jeu.accoupler(a, b);
  jeu.ouvrirVue('pension');
  const k = jeu.couples()[0];
  const force = jeu.clickGain(jeu.sujetCouple(k));
  ok('un clic vaut la force du clic, comme sur un œuf', force === jeu.clickPower(), force);

  jeu.tapStage();
  eq('le clic avance la ponte', k.t, force);
  eq('et se compte', k.clic, force);

  /* LA MAIN FAIT AU PLUS LA MOITIÉ D'UNE PONTE : sans ce plafond, un clic de fin de partie
     bouclait une ponte d'une heure en neuf coups. */
  let garde = 0;
  while (jeu.resteACliquer(k) > 0 && garde++ < 100000) jeu.tapStage();
  eq('la main s’arrête à la moitié', k.clic, k.duree * jeu.CLIC_PENSION);
  const t = k.t;
  jeu.tapStage();
  eq('un clic de plus ne fait plus rien', k.t, t);

  // le temps fait l'autre moitié, et la main repart de zéro à la ponte suivante
  const avant = s.stats.pension || 0;
  eq('le reste vient du temps', jeu.avancePension(k.duree - k.t), 1);
  eq('l’œuf est tombé', s.stats.pension, avant + 1);
  eq('et la main repart de zéro', k.clic, 0);
  ok('elle peut recliquer', jeu.resteACliquer(k) > 0);
});

scenario('pension cliquable — la ponte qui tombe sous le doigt tombe tout de suite', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'loup', 'ours');
  jeu.accoupler(a, b);
  jeu.ouvrirVue('pension');
  const k = jeu.couples()[0];
  k.t = k.duree - 1;                      // le temps a presque tout fait
  const avant = s.stats.pension || 0;
  jeu.tapStage();
  eq('l’œuf tombe au clic', s.stats.pension, avant + 1);
  ok('et la ponte repart', k.t < k.duree);
});

scenario('pension cliquable — la carte ocellée clique l’onglet ouvert', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'loup', 'ours');
  jeu.accoupler(a, b);
  const k = jeu.couples()[0];
  s.incub[0] = { line: 'crapaud', p: 0, kind: 'commun' };
  jeu.select('i:0');

  // sur la pension, elle clique le couple — et ce n'est pas la main du joueur
  jeu.ouvrirVue('pension');
  const clics = s.stats.clics;
  jeu.mainDeCarte = true;
  jeu.tapStage();
  jeu.mainDeCarte = false;
  ok('sur la pension, elle avance le couple', k.t > 0, k.t);
  eq('l’œuf de la ferme n’a pas bougé', s.incub[0].p, 0);
  eq('et ce n’est pas un clic du joueur', s.stats.clics, clics);

  // sur la ferme, elle clique la ferme
  jeu.ouvrirVue('ferme');
  const t = k.t;
  jeu.mainDeCarte = true;
  jeu.tapStage();
  jeu.mainDeCarte = false;
  ok('sur la ferme, elle avance l’œuf', s.incub[0].p > 0, s.incub[0].p);
  eq('et le couple n’a pas bougé', k.t, t);
});

scenario('pension cliquable — le bonheur ne monte que sur une bête en scène', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9;
  const [a, b] = couple(jeu, 'loup', 'ours');
  const c = bete(jeu, 'chat', 3, 20000);
  jeu.select('c:' + c.id);
  jeu.ouvrirVue('pension');
  const avant = c.bonheur || 0;
  jeu.tickJoie(30);
  eq('dans l’onglet de la pension, rien', c.bonheur || 0, avant);
  jeu.ouvrirVue('ferme');
  jeu.tickJoie(30);
  ok('sur la ferme, il monte', (c.bonheur || 0) > avant, c.bonheur);
});
