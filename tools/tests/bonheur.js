/* ── LE BONHEUR, LA FRÉNÉSIE ET LE COMBO — ce qui multiplie un clic */

'use strict';
const { scenario, ok, eq, neuf, RACINE, lire, bete, saturerCombo, seule, equiper } = require('./_aides.js');

scenario('écran — un compteur de clics annonce le nombre de clics qu’il faudra', () => {
  /* IL ANNONÇAIT QUARANTE-CINQ CLICS POUR UN ŒUF QUI EN DEMANDAIT VINGT-SEPT, et sur la fin il
     baissait de deux par clic — « beaucoup de clics valent toujours 2 clics ». Il était déjà
     tombé de quarante-cinq à trente-sept au premier coup, et la correction d'alors n'avait
     soigné que le saut : le compteur divisait le travail restant par la force d'UN clic.

     LA FAUTE ÉTAIT DANS L'IDÉE MÊME DE MULTIPLICATEUR. Les clics à venir n'ont pas tous la même
     force : le combo monte à chaque coup, de ×1 à ×3. Diviser par la force d'aujourd'hui, c'est
     compter une série qui n'aura pas lieu — qu'on prenne la force du moment (il saute) ou celle
     du repos (il compte double).

     IL COMPTE MAINTENANT LA SÉRIE, terme à terme. Et le « un de moins par clic » n'est pas un
     réglage heureux : le clic consomme exactement le premier terme de la somme qu'on vient de
     calculer, et avance le combo d'un cran. Il reste la même somme, moins son premier terme. */
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const suj = jeu.current();
  const dure = jeu.hatchTime(suj.slot);
  const lire = () => parseInt(jeu.remaining(dure - suj.slot.p, 0, suj), 10);

  /* LA PROMESSE SE VÉRIFIE EN LA TENANT : on lit le nombre, on clique jusqu'à l'éclosion, on
     compare. C'est la seule vérification qui compte, et aucune formule ne s'interpose. */
  const promis = lire();
  let donnes = 0;
  while (jeu.current() && jeu.current().kind === 'egg' && donnes < 200) { jeu.tapStage(); donnes++; }
  eq('l’œuf demande exactement ce qui était annoncé', donnes, promis);
  /* CINQUANTE, ET LE NOMBRE EST ICI PARCE QU'IL N'EST NULLE PART AILLEURS. La table des œufs
     écrit une couvaison en SECONDES ; ce qu'on veut tenir est un nombre de CLICS, et le combo
     sépare les deux. Quarante-cinq secondes voulaient dire quarante-cinq clics et en coûtaient
     vingt-sept — l'intention était écrite dans le fichier et rien ne la vérifiait. */
  eq('et un œuf commun se paie cinquante clics de la main', promis, 50);

  /* UN DE MOINS PAR CLIC, EXACTEMENT — ni zéro, ni deux. Sur un second œuf, combo déjà chaud :
     le compteur doit partir de là où la main en est, pas de zéro. */
  const jeu2 = neuf(); const s2 = jeu2.state;
  s2.tuto = false;
  const suj2 = jeu2.current();
  const dure2 = jeu2.hatchTime(suj2.slot);
  const lire2 = () => parseInt(jeu2.remaining(dure2 - suj2.slot.p, 0, suj2), 10);

  let avant = lire2();
  for (let i = 0; i < 15; i++) {
    jeu2.tapStage();
    const apres = lire2();
    eq('le clic ' + (i + 1) + ' le fait baisser d’exactement un', apres, avant - 1);
    avant = apres;
  }
  eq('et à main nue le combo n’y est pour rien', jeu2.comboMult(), 1);

  /* ET IL FINIT SUR « 1 clic », jamais sur deux : le dernier clic est annoncé comme le dernier. */
  while (jeu2.current() && jeu2.current().kind === 'egg' && lire2() > 1) jeu2.tapStage();
  eq('le dernier coup s’annonce au singulier', jeu2.remaining(dure2 - suj2.slot.p, 0, suj2), '1 clic');

  /* LE COMPTEUR ET LE CLIC PASSENT PAR LA MÊME LIGNE, au combo et à la frénésie près. Ils
     divergeaient : le compteur divisait par la force de la main, le clic appliquait en plus la
     vitesse de l'album et la part automatique. Sur un œuf nu les deux coïncidaient, ce qui est
     la pire façon pour une faute de passer — elle attend la première carte de vitesse. */
  eq('au repos, le clic vaut ce que le compteur annonce',
     jeu2.clicAuRepos(suj2), jeu2.clickGain(suj2) / jeu2.comboMult());

  /* ── ET AVEC LA BRANCHE DE LA SÉRIE, LÀ OÙ LE COMPTE EST DIFFICILE ──
     À main nue le compteur n'a rien à calculer : une seconde vaut un clic, et n'importe quelle
     division juste tombe dessus. C'est une fois le combo acheté qu'il doit compter une somme
     dont chaque terme est plus grand que le précédent — et c'est pour CE cas-là qu'il existe.
     Le vérifier seulement à main nue reviendrait à ne pas le vérifier du tout. */
  const jeu3 = neuf(); jeu3.state.tuto = false;
  jeu3.state.ciel = { poing: true, 'serie-1': true, 'serie-2': true, 'serie-3': true };
  const suj3 = jeu3.current();
  const dure3 = jeu3.hatchTime(suj3.slot);
  const lire3 = () => parseInt(jeu3.remaining(dure3 - suj3.slot.p, 0, suj3), 10);
  const promis3 = lire3();
  let av3 = promis3, donnes3 = 0;
  while (jeu3.current() && jeu3.current().kind === 'egg' && donnes3 < 200) {
    jeu3.tapStage(); donnes3++;
    if (!jeu3.current() || jeu3.current().kind !== 'egg') break;
    const ap = lire3();
    eq('sous le combo aussi, un clic le fait baisser d’exactement un', ap, av3 - 1);
    av3 = ap;
  }
  eq('et la promesse tient sous le combo', donnes3, promis3);
  ok('le combo a bien raccourci l’ouvrage', promis3 < promis, promis3 + ' contre ' + promis);

  /* LA BOUCLE EST BORNÉE : un ouvrage démesuré ne doit pas faire tourner cent mille tours. */
  const t0 = Date.now();
  const enorme = jeu2.clicsPour(1e18, suj2);
  ok('un ouvrage démesuré se compte quand même', enorme > 1e17, enorme);
  ok('et il se compte tout de suite', Date.now() - t0 < 50, (Date.now() - t0) + ' ms');
});

scenario('combo — il ne se donne plus, il s’achète, et il monte en racine', () => {
  /* IL ÉTAIT LÀ DÈS LE PREMIER CLIC D'UNE PARTIE NEUVE, et il mangeait l'ouverture en silence.
     Le fichier écrit ses cadences en CLICS — « quarante-cinq clics avant de voir ce qui sort »,
     « dix clics par niveau » — et les range en SECONDES ; le combo coupait la différence.
     L'œuf tombait en vingt-sept clics au lieu de cinquante, le niveau en trois au lieu de dix.
     Deux intentions écrites en toutes lettres dans le fichier, aucune tenue, et rien pour le
     dire : le compteur mentait dans le même sens.

     IL EST MAINTENANT UNE BRANCHE DU CIEL. Une première partie se joue à main nue — une
     seconde vaut un clic — et la deuxième run se sent dans la main, ce qui est exactement ce
     qu'une ascension doit produire. */
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.ciel = s.ciel || {};
  const c = bete(jeu, 'crapaud', 1, 0);
  jeu.select('c:' + c.id);

  eq('à main nue le plafond vaut un', jeu.plafondCombo(), 1);
  for (let i = 0; i < 200; i++) jeu.tapStage();
  eq('et deux cents clics n’y changent rien', jeu.comboMult(), 1);
  eq('la série est bien comptée pour autant', jeu.combo, jeu.COMBO_PLEIN);

  /* LES TROIS CRANS, UN À UN. Le dernier rend ce que le combo valait quand il était donné :
     la branche entière ne fait que ramener au point de départ d'avant, contre vingt-huit
     jetons. C'est la mesure de ce qui était offert. */
  const crans = [['serie-1', 1.5], ['serie-2', 2.2], ['serie-3', 3]];
  for (const [cle, haut] of crans) {
    s.ciel[cle] = true;
    eq('« ' + cle + ' » porte le plafond à ' + haut, jeu.plafondCombo(), haut);
  }
  eq('et le dernier cran rend l’ancien plafond', jeu.plafondCombo(), 3);

  /* LA RACINE PLUTÔT QUE LA PENTE DROITE, ET C'EST UNE QUESTION DE LISIBILITÉ : en pente
     droite, neuf clics donnent ×1,18 sur un clic qui ne pèse déjà rien, et personne ne
     découvre que la mécanique existe. En racine ils donnent ×1,60. */
  const branche = () => {
    const j = neuf(); j.state.tuto = false;
    j.state.ciel = { 'serie-1': true, 'serie-2': true, 'serie-3': true };
    const b = bete(j, 'crapaud', 1, 0); j.select('c:' + b.id);
    return j;
  };
  const j2 = branche();
  const mult = n => { for (let i = 0; i < n; i++) j2.tapStage(); return j2.comboMult(); };
  const a9 = mult(9);
  ok('neuf clics valent déjà 1,60', Math.abs(a9 - 1.6) < 0.01, a9);
  const a25 = mult(16);
  ok('vingt-cinq en valent 2,00', Math.abs(a25 - 2) < 0.01, a25);

  /* LE DIXIÈME CLIC VAUT TROIS FOIS LE QUATRE-VINGT-DIXIÈME : c'est ce que la racine déplace,
     et c'est voulu. Le combo ne dit pas « plus tu enchaînes, mieux c'est », il dit « atteins
     le plateau vite, puis tiens-le » — ce que la règle des quinze secondes décrit déjà. */
  const pente = n => {
    const j = branche();
    for (let i = 0; i < n - 1; i++) j.tapStage();
    const avant = j.comboMult(); j.tapStage();
    return j.comboMult() - avant;
  };
  ok('le dixième clic vaut trois fois le quatre-vingt-dixième',
     Math.abs(pente(10) / pente(90) - 3.1) < 0.2, (pente(10) / pente(90)).toFixed(2));

  mult(200);
  eq('il plafonne, et le compte avec lui', j2.combo, j2.COMBO_PLEIN);
  eq('au plafond exact', j2.comboMult(), 3);

  /* QUINZE SECONDES SANS CLIC ET TOUT TOMBE — pas une décroissance, une chute. On déplace
     l'horloge plutôt que d'attendre. */
  const vrai = Date.now;
  try {
    Date.now = () => vrai() + (j2.COMBO_FIN - 1) * 1000;
    j2.tickCombo();
    eq('quatorze secondes ne suffisent pas', j2.combo, j2.COMBO_PLEIN);
    Date.now = () => vrai() + (j2.COMBO_FIN + 1) * 1000;
    j2.tickCombo();
    eq('quinze secondes emportent tout', j2.combo, 0);
    eq('et le multiplicateur avec', j2.comboMult(), 1);
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
