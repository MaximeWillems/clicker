/* ── L’ALBUM — la carte, ses étoiles, ses stats, son hérédité */

'use strict';
const { scenario, ok, eq, neuf, noeuds, poserJetons, bete, beteNeutre, seule, couple,
  pave, parfaite, equiper } = require('./_aides.js');

scenario('album — sans limite, et cinq cartes actives qui s’échangent', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 20;
  for (let i = 0; i < 12; i++) beteNeutre(jeu, i % 2 ? 'crabe' : 'crapaud', 3, 3000);
  poserJetons(jeu, jeu.coutCartes(9));   // neuf cartes ne coûtent plus neuf jetons

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
  s.tuto = false; s.coins = 1e12; s.pens = 8; s.ciel = Object.assign(s.ciel || {}, { nid: 1 }); jeu.oublierPrimes();
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
  equiper(jeu, iMartele, 3);
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
