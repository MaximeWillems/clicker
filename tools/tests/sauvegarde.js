/* ── LA SAUVEGARDE — le format, la copie, la restauration, l’effacement */

'use strict';
const { scenario, ok, eq, neuf, noeuds, lire, brut, rechargements, bete, seule } = require('./_aides.js');

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

scenario('sauvegarde — qui avait pris le poing garde une série', () => {
  /* Le combo était donné à tous. Personne ne l'avait payé, donc il n'y a rien à rembourser —
     mais une partie qui a déjà acheté la main a choisi la présence, et lui couper net ce qui
     la récompensait serait reprendre d'une main ce qu'on lui a vendu de l'autre. */
  const avec = neuf({ v: 30, ciel: { poing: true, renom: true } });
  ok('elle reçoit le premier cran', avec.state.ciel['serie-1'], JSON.stringify(avec.state.ciel));
  eq('et son plafond n’est plus un', avec.plafondCombo(), 1.5);
  ok('rien d’autre ne lui est donné', !avec.state.ciel['serie-2'] && !avec.state.ciel['serie-3']);

  const sans = neuf({ v: 30, ciel: { renom: true } });
  ok('une partie qui n’avait pas la main repart à main nue', !sans.state.ciel['serie-1'],
     JSON.stringify(sans.state.ciel));
  eq('son plafond vaut un', sans.plafondCombo(), 1);
});

scenario('sauvegarde — les bagage retirés rendent leurs jetons', () => {
  /* L'ASCENSION NE FABRIQUE PLUS DE CARTES : les deux « bagage » qui adoucissaient leur prix
     s'en vont avec lui. On ne dépossède personne — leur prix (8 et 22) revient en réserve, comme
     au retrait de l'automatisation. Le « sommet » qui les séparait reste, lui. */
  const vieux = neuf({
    v: 33, coins: 0, asc: { n: 2, paliers: 4, jetons: 1, sommet: 0 },
    ciel: { bagage: true, sommet: true, 'bagage-2': true },
  });
  ok('le premier bagage a quitté le ciel', !vieux.state.ciel.bagage, JSON.stringify(vieux.state.ciel));
  ok('le second aussi', !vieux.state.ciel['bagage-2']);
  ok('mais le sommet reste', vieux.etoilePrise('sommet'));
  eq('et les trente jetons sont rendus', vieux.state.asc.jetons, 1 + 8 + 22);
});

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

scenario('sauvegarde — les bourses gonflées par le bug dégonflent', () => {
  /* ON NE PEUT PAS RECALCULER LA VÉRITÉ : les sommets des cycles passés ne sont pas gardés. On
     pose donc un plafond que rien de légitime ne peut dépasser — ce que les ascensions faites
     ont pu créditer au mieux, moins ce que l'arbre a coûté. */
  const gonflee = neuf({
    v: 23, coins: 0, asc: { n: 3, paliers: 11, jetons: 4000, sommet: 0 },
    ciel: { etincelle: true, poing: true },
  });
  const parCycle = gonflee.JETON_PALIERS.length + 2;
  eq('la bourse tombe au plafond', gonflee.state.asc.jetons, 3 * parCycle - 4);
  eq('et le compteur de dépense repart de zéro', gonflee.state.asc.depense, 0);

  /* LE PLAFOND EST LARGE EXPRÈS : personne ne perd un jeton gagné. */
  const honnete = neuf({
    v: 23, coins: 0, asc: { n: 3, paliers: 11, jetons: 7, sommet: 0 }, ciel: {},
  });
  eq('une bourse plausible ne bouge pas', honnete.state.asc.jetons, 7);

  const neuve = neuf({ v: 23, coins: 0, asc: { n: 0, paliers: 0, jetons: 900, sommet: 0 } });
  eq('sans ascension, rien ne peut avoir été mis de côté', neuve.state.asc.jetons, 0);
});

scenario('sauvegarde — effacer la partie efface aussi ce qui n’est pas dedans', () => {
  /* « LE RESET N'A PAS TOUT REMIS À ZÉRO. » Ce bouton n'était vérifié par rien, et c'est le
     seul des trois chemins de remise à zéro qui passe par `localStorage` et un rechargement de
     page — donc le seul qu'on ne voit pas en jouant au banc.

     IL ÉTAIT CORRECT PAR DISCIPLINE, PAS PAR CONSTRUCTION. Il coupait l'écriture, effaçait le
     fichier, rechargeait. Ça tient tant que TOUTES les écritures passent par `save()` : il
     suffit qu'une seule passe à côté, ou qu'un rechargement tarde, pour que la partie effacée
     soit réécrite par-dessus — et le joueur voit alors un reset qui n'a remis qu'une partie
     des choses à zéro, ce qui est pire que pas de reset du tout, parce qu'il ne sait pas ce
     qu'il a gardé.

     IL POSE MAINTENANT UN ÉTAT NEUF AVANT D'EFFACER : la pire écriture possible écrit une
     partie neuve. Et il remet ce qui ne vit PAS dans la sauvegarde — le combo, l'heure du
     dernier clic, les caches — que l'effacement du fichier ne pouvait pas atteindre. */
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e13; s.pens = 20; s.incubators = 6;
  for (const u of Object.keys(s.up)) s.up[u] = 14;
  for (const p of jeu.PRIMES) s.primes[p.cle] = true;
  s.ciel = { poing: true, fracas: true, nid: true };
  jeu.oublierPrimes();
  jeu.noterClic();
  jeu.save();

  ok('la partie est bien montée', jeu.clickPower() > 20, jeu.clickPower());
  ok('et elle est bien écrite', !!localStorage.getItem('eclosion.jalon0'));

  jeu.effacerLaPartie();

  ok('le fichier est effacé', !localStorage.getItem('eclosion.jalon0'));
  eq('la bourse est à zéro', jeu.state.coins, 0);
  eq('les améliorations aussi', JSON.stringify(jeu.state.up),
     JSON.stringify({ clic: 0, couveuse: 0, eleveur: 0, mangeoire: 0 }));
  eq('plus une seule prime', Object.keys(jeu.state.primes || {}).length, 0);
  eq('et la constellation est vide', Object.keys(jeu.state.ciel || {}).length, 0);

  /* LE CLIC EST LE NOMBRE QUE LE JOUEUR REGARDE, et c'est par lui qu'il a vu le défaut. */
  eq('un clic revaut un', jeu.clickPower(), 1);

  /* ET CE QUI NE VIT PAS DANS LE FICHIER : le combo tenait une série en cours, et un reset
     qui laisserait la série laisserait des clics plus forts que prévu — exactement la forme
     du reproche. */
  eq('le combo est retombé', jeu.comboMult(), 1);
  ok('et la ferme n’est pas au calme', !jeu.enIdle());
  eq('et aucune étoile ne reste ouverte sur le côté', jeu.etoileVue, null);
});

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

scenario('sauvegarde — la barre retirée ne change ni le niveau ni la taille d’une bête', () => {
  /* Le niveau et la taille d'avant se recalculent ICI, avec les durées d'avant : un juge qui
     emprunte sa règle à l'accusé ne juge rien. */
  const AVANT = [150, 180, 900, 3600, 21600], NIV = [15, 20, 30, 20, 15];
  const debutAvant = age => AVANT.slice(0, age - 1).reduce((a, g) => a + g, 0);
  const niveauAvant = (age, p) => NIV.slice(0, age - 1).reduce((a, n) => a + n, 0) +
    Math.min(NIV[age - 1], 1 + Math.floor(Math.min(1, (p - debutAvant(age)) / AVANT[age - 1]) * NIV[age - 1]));

  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 5;
  bete(jeu, 'crapaud', 1, 0); bete(jeu, 'crapaud', 1, 0); bete(jeu, 'crapaud', 2, 0);
  const brut = JSON.parse(JSON.stringify(s));
  brut.v = 32;
  const [a, m, b] = brut.pen;
  a.age = 1; a.p = 75;                       // au milieu de l'enfance
  m.age = 1; m.p = 145;                      // dans la barre retirée : « 15 / 15 », pas mûre
  b.age = 2; b.p = debutAvant(2) + 95; b.over = 90;   // adolescente, un peu engraissée

  const vieux = neuf(brut);
  const lu = id => vieux.state.pen.find(x => x.id === id);
  eq('une enfant garde son niveau', vieux.niveau(lu(a.id)), niveauAvant(1, 75));
  eq('une adolescente aussi', vieux.niveau(lu(b.id)), niveauAvant(2, b.p));
  ok('celle qui était dans la barre retirée devient mûre', vieux.estMur(lu(m.id)));
  eq('au même niveau', vieux.niveau(lu(m.id)), niveauAvant(1, 145));
  const tailleAvant = 1 + vieux.OVER_GAIN * Math.log(1 + 90 / AVANT[1]);
  ok('et personne ne change de taille', Math.abs(vieux.sizeFactor(lu(b.id)) - tailleAvant) < 1e-9,
     vieux.sizeFactor(lu(b.id)) + ' contre ' + tailleAvant);
});
