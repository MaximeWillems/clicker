/* ── LA CONSTELLATION — le ciel, ses nœuds, ses jetons */

'use strict';
const { scenario, ok, eq, neuf, noeuds, lire, poserJetons, bete, seule, pave } = require('./_aides.js');

scenario('ciel — trois états : acquise, ouverte, devinée', () => {
  /* « ON DÉCOUVRE LES CONSTELLATIONS PETIT À PETIT. » Une étoile dont le parent n'est pas pris
     ne montre que sa place et son lien : pas de nom, pas de glyphe, pas de prix. `chère` n'est
     qu'une nuance d'ouverte — la porte est là, il manque des jetons.

     UNE SEULE PORTE DÉCIDE, et c'est ce que ce scénario garde vraiment : le dessin et la carte
     de détail passent tous deux par `etatEtoile`. Deux façons de décider qu'un nœud est caché
     finiraient par diverger, et la fuite serait invisible — elle ne se verrait que dans ce qui
     est révélé, jamais dans ce qui est tu. */
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const par = Object.fromEntries(jeu.CIEL.map(n => [n.cle, n]));
  const etat = cle => jeu.etatEtoile(par[cle]);

  eq('le moyeu est acquis par nature', etat('etincelle'), 'prise');
  eq('les six premiers s’ouvrent sur lui', etat('poing'), 'chere');
  eq('et tout le reste se devine', etat('doigts'), 'devinee');
  eq('même loin sur la branche', etat('serie-3'), 'devinee');

  poserJetons(jeu, 500);
  eq('avec des jetons, le premier devient ouvert', etat('poing'), 'ouverte');
  eq('mais le suivant se devine toujours', etat('doigts'), 'devinee');

  /* LE CRAN SUIVANT S'ÉCLAIRE EN PRENANT CELUI D'AVANT, et lui seul : la découverte avance
     d'un pas, jamais de deux. */
  jeu.acheterEtoile('poing');
  eq('le poing est acquis', etat('poing'), 'prise');
  eq('les doigts s’ouvrent', etat('doigts'), 'ouverte');
  eq('la série aussi, c’est une fourche', etat('serie-1'), 'ouverte');
  eq('mais la ferveur attend encore', etat('ferveur'), 'devinee');
  eq('et le second cran de la série aussi', etat('serie-2'), 'devinee');

  /* CE QUI SE DESSINE SUIT CE QUE L'ÉTAT DIT. Une devinée n'écrit ni nom ni prix dans le SVG :
     c'est là que la fuite se produirait, et nulle part ailleurs. */
  jeu.cielSig = ''; jeu.refresh();
  const tous = cls => {
    const t = [];
    const m = x => { if (x.classList && x.classList.contains(cls)) t.push(x); x.children.forEach(m); };
    noeuds.get('ciel-arbre').children.forEach(m);
    return t;
  };
  const devinees = jeu.CIEL.filter(n => jeu.etatEtoile(n) === 'devinee');
  eq('autant de points que d’étoiles devinées', tous('devinee').length, devinees.length);
  eq('et le SVG n’écrit que les noms qu’il a le droit d’écrire',
     tous('etoile-nom').length, jeu.CIEL.length - devinees.length);
  const ecrits = tous('etoile-nom').map(t => t.textContent);
  ok('aucun nom d’étoile devinée n’a fui',
     !devinees.some(n => ecrits.includes(n.nom)),
     devinees.filter(n => ecrits.includes(n.nom)).map(n => n.cle).join(' '));

  /* LE LIEN, LUI, RESTE : on ignore le contenu, jamais le chemin. Sans cela ce ne serait plus
     une découverte mais une énigme, et l'arbre cesserait d'être une carte. */
  eq('tous les liens sont tracés', tous('lien').length, jeu.CIEL.length - 1);

  /* ET AUCUNE COORDONNÉE N'EST VIDE. Le libellé d'un axe prenait son rayon sur le NOMBRE de
     ses étoiles au lieu de sa profondeur : la pension en comptait neuf depuis la `4.28.0`, la
     main sept depuis la `4.30.0`, la table des rayons n'en a que cinq — et les deux libellés
     se dessinaient à `NaN`, donc nulle part. Rien ne le disait. */
  const vides = [];
  const fouiller = x => {
    for (const k of ['x', 'y', 'cx', 'cy', 'r', 'd']) {
      const v = x.getAttribute && x.getAttribute(k);
      if (v !== null && v !== undefined && /NaN|undefined/.test(String(v))) vides.push(k + '=' + v);
    }
    x.children.forEach(fouiller);
  };
  noeuds.get('ciel-arbre').children.forEach(fouiller);
  eq('aucune coordonnée du ciel n’est vide', vides.join(' '), '');
});

scenario('ciel — la carte de détail dit ce qu’une étoile fait, et c’est elle qui l’achète', () => {
  /* « QUAND ON CLIQUE DESSUS ÇA OUVRE UNE CARTE SUR LE CÔTÉ. » Un clic sur une étoile ne
     l'achète plus. Acheter d'un clic sur un canevas qu'on fait glisser du même doigt était une
     faute qui attendait — et surtout, une dépense définitive se prenait sans rien lire : le nom
     et le prix tenaient sous le rond, la phrase était dans une infobulle de survol, et au doigt
     il n'y a pas de survol. */
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  poserJetons(jeu, 500);
  const lu = id => noeuds.get('ciel-carte-' + id).textContent;

  ok('la carte est fermée tant qu’on n’a rien regardé', noeuds.get('ciel-carte').hidden);

  jeu.voirEtoile('poing');
  ok('elle s’ouvre sur l’étoile lue', !noeuds.get('ciel-carte').hidden);
  eq('elle la nomme', lu('nom'), 'Le poing');
  eq('elle dit de quel axe elle vient', lu('axe'), jeu.NOM_BRANCHE.main);
  ok('elle porte la phrase', lu('dit').indexOf('deux fois plus loin') >= 0, lu('dit'));
  ok('et l’effet chiffré quand il se déduit de la table',
     lu('effet').indexOf('force de ta main') >= 0, lu('effet'));
  eq('le prix est annoncé', lu('prix'), '✦ 4');
  eq('et le bouton propose de la prendre', lu('prendre'), 'Prendre · ✦ 4');

  /* LE BOUTON EST LE SEUL CHEMIN D'ACHAT, et il passe par `acheterEtoile`, qui garde ses trois
     refus. La carte n'a pas sa propre règle : elle a un bouton. */
  const avant = jeu.jetonsEnMain();
  ok('il achète', jeu.prendreEtoileVue());
  ok('le poing est pris', jeu.etoilePrise('poing'));
  eq('et les jetons sont partis', jeu.jetonsEnMain(), avant - 4);
  eq('la carte le dit', lu('prix'), 'acquis');
  ok('et n’a plus rien à vendre', noeuds.get('ciel-carte-prendre').hidden);

  /* UNE DEVINÉE NE DIT RIEN D'ELLE-MÊME — mais elle dit par où passer. On ignore le contenu,
     jamais le chemin. */
  jeu.voirEtoile('serie-3');
  eq('elle ne se nomme pas', lu('nom'), 'Encore dans l’ombre');
  ok('son effet se tait', noeuds.get('ciel-carte-effet').hidden);
  eq('son prix aussi', lu('prix'), '✦ ?');
  ok('elle montre le chemin', lu('dit').indexOf('Prends d’abord') >= 0, lu('dit'));
  ok('on ne peut pas la prendre', noeuds.get('ciel-carte-prendre').disabled);
  ok('et la tenter ne fait rien', !jeu.prendreEtoileVue());
  ok('elle n’est toujours pas prise', !jeu.etoilePrise('serie-3'));

  /* ELLE NE NOMME LE PARENT QUE S'IL EST LUI-MÊME RÉVÉLÉ : nommer le parent d'une devinée dont
     le parent est devinée aussi ferait fuir, de proche en proche, tout l'arbre qu'on cache. */
  ok('le parent caché ne se nomme pas', lu('dit').indexOf('La chauffe') < 0, lu('dit'));
  jeu.acheterEtoile('serie-1');
  jeu.voirEtoile('serie-3');
  ok('une fois son parent révélé, il se nomme', lu('dit').indexOf('La chauffe') >= 0, lu('dit'));

  /* CE QU'ON NE PEUT PAS ENCORE PAYER LE DIT EN CHIFFRES, plutôt que de rester muet. */
  jeu.state.asc.depense = (jeu.state.asc.depense || 0) + jeu.jetonsEnMain();
  jeu.cielSig = ''; jeu.voirEtoile('serie-2');
  ok('sans jetons le bouton dit ce qui manque', lu('prendre').indexOf('Il te manque') >= 0, lu('prendre'));
  ok('et il est éteint', noeuds.get('ciel-carte-prendre').disabled);

  jeu.fermerCarteCiel();
  ok('la carte se ferme', noeuds.get('ciel-carte').hidden);

  /* LE CLIC NE DOIT PLUS PASSER PAR L'ACHAT. Le banc ne simule pas d'événement, donc c'est la
     source qui répond : `cielClic` ouvre, il n'achète pas. */
  const src = lire('game.js');
  const bloc = src.slice(src.indexOf('function cielClic('), src.indexOf('function bindTools('));
  ok('un clic sur une étoile l’ouvre', bloc.indexOf('voirEtoile(') >= 0, bloc);
  ok('et n’achète rien', bloc.indexOf('acheterEtoile') < 0, bloc);
});

scenario('ciel — la série est une branche, et une branche se voit', () => {
  /* LE COMBO EST DEVENU UNE VOIE QU'ON CHOISIT. Trois crans accrochés au poing, qui portent le
     plafond de 1 à 1,5, 2,2 puis 3 — le dernier rendant exactement ce qui était donné à tous. */
  const jeu = neuf();
  const par = Object.fromEntries(jeu.CIEL.map(n => [n.cle, n]));
  for (const cle of ['serie-1', 'serie-2', 'serie-3']) {
    ok(cle + ' existe', !!par[cle]);
    eq(cle + ' tient à la main', par[cle].axe, 'main');
    eq(cle + ' est sur la branche de la série', par[cle].branche, 'serie');
    ok(cle + ' dit ce qu’il fait', (par[cle].dit || '').length > 30);
  }
  eq('la série s’accroche au poing', par['serie-1'].parent, 'poing');
  eq('puis s’enchaîne', par['serie-2'].parent, 'serie-1');
  eq('jusqu’au bout', par['serie-3'].parent, 'serie-2');
  eq('et la branche entière coûte vingt-huit jetons',
     par['serie-1'].prix + par['serie-2'].prix + par['serie-3'].prix, 28);

  /* ── UNE FOURCHE QUI NE SE VOIT PAS N'EST PAS UNE FOURCHE ──
     Les étoiles tombaient par leur INDICE DANS LA LISTE de l'axe : deux nœuds de branches
     différentes prenaient deux indices consécutifs et se dessinaient l'un derrière l'autre.
     `place-1` et `hate-1` se superposaient depuis que la pension s'ouvre en fourche.

     Le rayon se lit maintenant sur la chaîne des parents, l'angle sur la branche. Deux nœuds
     du même rang tombent au même anneau, écartés de part et d'autre du tronc. */
  const loin = (a, b) => {
    const p = jeu.cieuxXY(par[a]), q = jeu.cieuxXY(par[b]);
    return Math.hypot(p.x - q.x, p.y - q.y);
  };
  ok('les deux premiers crans de la pension ne se superposent plus',
     loin('place-1', 'hate-1') > 3 * jeu.CIEL_VUE.r, Math.round(loin('place-1', 'hate-1')));
  ok('et le tronc ne passe pas dessus non plus',
     loin('place-1', 'sang-epais') > 3 * jeu.CIEL_VUE.r, Math.round(loin('place-1', 'sang-epais')));
  ok('la série s’écarte du tronc de la main',
     loin('serie-1', 'doigts') > 3 * jeu.CIEL_VUE.r, Math.round(loin('serie-1', 'doigts')));

  /* AUCUNE ÉTOILE N'EN RECOUVRE UNE AUTRE, nulle part dans le ciel. C'est la seule garde qui
     tienne : une paire vérifiée à la main laisse passer la suivante. */
  let pire = Infinity, coupable = '';
  for (let i = 0; i < jeu.CIEL.length; i++) {
    for (let k = i + 1; k < jeu.CIEL.length; k++) {
      const d = loin(jeu.CIEL[i].cle, jeu.CIEL[k].cle);
      if (d < pire) { pire = d; coupable = jeu.CIEL[i].cle + ' / ' + jeu.CIEL[k].cle; }
    }
  }
  ok('la paire la plus serrée du ciel garde trois rayons d’écart',
     pire > 3 * jeu.CIEL_VUE.r, coupable + ' à ' + Math.round(pire) + ' px');

  /* ET LE RANG SE LIT SUR LES PARENTS, PAS SUR LA LISTE : un nœud ajouté au milieu de la table
     ne doit déplacer personne. */
  eq('le poing est au premier anneau', jeu.profondeurEtoile(par.poing), 1);
  eq('la série aussi est au deuxième', jeu.profondeurEtoile(par['serie-1']), 2);
  eq('comme les doigts', jeu.profondeurEtoile(par.doigts), 2);
});

scenario('jetons — le prix d’une carte monte par le nombre d’or', () => {
  const jeu0 = neuf();
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
     borne que les cinq cartes qui agissent. Ce qui borne ce qui ENTRE DANS L'ALBUM, c'est la
     bourse — et depuis la 4.0.0, le PRIX DORÉ.

     UN JETON N'ACHÈTE PLUS UNE CARTE. Chaque carte prise dans la même ascension renchérit la
     suivante d'un facteur φ : 1, 2, 3, 5, 7, 12 — cumul 1, 3, 6, 11, 18, 30. Sans cette
     escalade, les jetons regagnés à chaque cycle depuis la 3.0.0 auraient donné cinq cartes à
     chaque saut, indéfiniment, et l'album se serait rempli sans qu'aucune décision ne soit
     prise. */
  eq('le coût de la première carte', jeu0.coutCarte(0), 1);
  eq('puis deux', jeu0.coutCarte(1), 2);
  eq('puis trois', jeu0.coutCarte(2), 3);
  eq('puis cinq', jeu0.coutCarte(3), 5);
  eq('puis sept', jeu0.coutCarte(4), 7);
  eq('cinq cartes coûtent dix-huit jetons', jeu0.coutCartes(5), 18);

  for (const [n, cartes] of [[1, 1], [2, 1], [3, 2], [5, 2], [9, 3], [11, 4], [18, 5]]) {
    const jeu = neuf(); const s = jeu.state;
    s.tuto = false; s.coins = 5e6; s.pens = 20;
    for (let i = 0; i < 16; i++) bete2(jeu, i % 2 ? 'crabe' : 'crapaud', 3, 3000);
    poserJetons(jeu, n);
    eq(n + ' jeton(s) → ' + cartes + ' carte(s)', jeu.apercuAscension().max, cartes);
  }

  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 10;
  for (let i = 0; i < 6; i++) bete2(jeu, 'crapaud', 3, 3000);
  poserJetons(jeu, 5);
  const ap = jeu.apercuAscension();
  jeu.ascChoix = [ap.neuves[0].id, ap.neuves[1].id];   // il n'en emploie que deux
  jeu.ascensionner();
  eq('le sommet repart à zéro', jeu.state.asc.sommet, 0);
  eq('deux cartes emportées', jeu.state.album.length, 2);
  /* LE RESTE DE LA BOURSE DEMEURE. Les jetons partaient tous, employés ou non ; ils ont
     désormais un second emploi — la constellation — donc en garder EST une décision. Deux
     cartes coûtent trois jetons sur cinq : il en reste deux. */
  eq('et il reste ce qu’on n’a pas dépensé', jeu.state.asc.jetons, 5 - jeu.coutCartes(2));
  /* L'ASCENSION NE SE REFERME PLUS. Elle demandait un jeton NON DÉPENSÉ, si bien qu'un joueur
     qui venait de sauter devait multiplier sa fortune par mille pour pouvoir sauter à
     nouveau — le mur rencontré en jouant à mille milliards. La porte est désormais un
     déblocage : ce qui varie, c'est le nombre de cartes emportées. */
  ok('mais la porte reste ouverte', jeu.peutAscensionner());
  eq('et les deux jetons restants valent encore une carte', jeu.apercuAscension().max, 1);
  eq('les paliers déjà franchis restent franchis', jeu.state.asc.paliers, jeu.RANG_PREMIER);
});

scenario('jetons — un palier de fortune tous les ×1000, à partir du premier million', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const premier = jeu.JETON_PALIERS[jeu.RANG_PREMIER - 1];
  eq('la première ascension se mérite au million', premier, 1e6);

  s.coins = premier - 1; jeu.crediterJetons();
  const avant = jeu.jetonsDus();
  ok('sous le million on a déjà des jetons', avant > 0, avant);
  ok('mais on ne peut pas encore ascensionner', !jeu.peutAscensionner());

  s.coins = premier; jeu.crediterJetons();
  eq('le million en donne un de plus', jeu.jetonsDus(), avant + 1);
  eq('et c’est le troisième', jeu.jetonsDus(), 3);
  ok('l’ascension s’ouvre alors', jeu.peutAscensionner());

  /* LE COMPTE SE LIT, IL NE S'ACCUMULE PAS : il vient du sommet de fortune du cycle, donc
     repasser sur le même palier ne donne rien de plus. */
  const apres = jeu.jetonsDus();
  jeu.crediterJetons();
  eq('un palier ne paie qu’une fois', jeu.jetonsDus(), apres);

  /* ET IL SE REFAIT À CHAQUE CYCLE. C'est tout le changement de la 3.0.0 : le sommet repart à
     zéro avec la ferme, et le prochain saut se paie sur ce qu'on aura regagné. */
  s.asc.sommet = 0;
  eq('après un saut, le compte est à refaire', jeu.jetonsDus(), 0);
  ok('mais la porte reste ouverte', jeu.peutAscensionner());
});

scenario('constellation — un nœud s’ouvre avec son parent, jamais avant', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  poserJetons(jeu, 500);

  /* LE MOYEU NE S'ACHÈTE PAS, et c'est ce qui ouvre les six axes d'emblée. Il coûtait un
     jeton : le premier jeton d'une partie servait donc à obtenir le DROIT de choisir, et non
     à choisir. Maintenant il est acquis par nature — prix zéro — et le premier jeton est une
     direction. */
  const moyeu = jeu.ETOILE_BY_KEY.etincelle;
  eq('le moyeu ne coûte rien', moyeu.prix, 0);
  ok('il n’a rien à dire non plus', !moyeu.dit);
  ok('il est acquis sans rien faire', jeu.etoilePrise('etincelle'));
  ok('et ne s’achète donc pas', !jeu.acheterEtoile('etincelle'));

  ok('les six premiers sont ouverts d’emblée', jeu.etoileOuverte(jeu.ETOILE_BY_KEY.nid));
  ok('mais pas le second de l’axe', !jeu.etoileOuverte(jeu.ETOILE_BY_KEY['place-1']));
  ok('donc il ne s’achète pas', !jeu.acheterEtoile('place-1'));

  // la chaîne se remonte un maillon à la fois
  jeu.acheterEtoile('nid');
  ok('puis la branche s’ouvre', jeu.acheterEtoile('place-1'));

  /* SIX DIRECTIONS DEPUIS LE CENTRE, et chacune part du moyeu. */
  eq('six axes', jeu.AXES.length, 6);
  for (const a of jeu.AXES) {
    ok(a.cle + ' part du centre', jeu.PAR_AXE[a.cle][0].parent === 'etincelle');
    ok(a.cle + ' porte au moins quatre nœuds', jeu.PAR_AXE[a.cle].length >= 4);
  }

  /* UNE BRANCHE EST UNE SUITE DE FRÈRES QUI SE SUIVENT, pas un éventail : chaque nœud d'une
     branche a pour parent le précédent de la MÊME branche, sauf le premier qui s'accroche au
     tronc. Sans cette règle, deux nœuds d'une branche s'ouvriraient ensemble et le cran ne
     voudrait plus rien dire. */
  const fautes = [];
  for (const n of jeu.CIEL) {
    if (!n.branche) continue;
    const p = jeu.ETOILE_BY_KEY[n.parent];
    if (p && p.branche && p.branche !== n.branche) fautes.push(n.cle + ' ← ' + p.cle);
  }
  ok('aucune branche n’en croise une autre', fautes.length === 0, fautes.join(', '));
});

scenario('constellation — elle ne possède rien du jeu de base', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;

  /* L'AUTOMATISATION EST DU JEU DE BASE. Elle doit être là dès la PREMIÈRE boucle, sinon la
     première heure se joue au poignet. Quatre nœuds « est à toi » l'ont tenue pendant deux
     versions ; ce scénario est là pour qu'aucun ne revienne. */
  for (const cle of ['acheteur', 'marchand', 'evolution', 'pension', 'forge']) {
    ok(cle + ' n’est pas un nœud', !jeu.ETOILE_BY_KEY[cle]);
  }
  ok('aucun nœud ne tient une prime', jeu.CIEL.every(n => !n.prime));

  // et la boutique les vend toujours, sans rien demander au ciel
  s.coins = 1e6;
  jeu.buyPrime(jeu.PRIMES.find(p => p.cle === 'acheteur'));
  ok('l’acheteur s’achète en pièces, dès le premier cycle', jeu.prime('acheteur'));
  ok('sans un seul jeton', jeu.jetonsEnMain() === 0);
});

scenario('constellation — elle paie en jetons, et chaque nœud agit', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 8;
  poserJetons(jeu, 500);


  eq('le moyeu n’a rien coûté', jeu.jetonsEnMain(), 500);

  /* CHAQUE NŒUD FAIT QUELQUE CHOSE : c'est la règle qui a supprimé le tronc de vingt rangs de
     « +2 % », un chemin fait de marches vides. Douze nœuds portent un nombre, douze changent
     une règle — et ce scénario touche chacun des seconds. */
  eq('douze nœuds portent un nombre', jeu.CIEL.filter(n => n.bonus).length, 12);

  // le négoce : une valeur, un prix d'œuf
  const v = jeu.coef('valeur');
  jeu.acheterEtoile('renom');
  ok('le renom monte la valeur', jeu.coef('valeur') > v);
  const oe = jeu.prixOeuf(jeu.EGG_BY_KEY.commun);
  jeu.acheterEtoile('marche');
  ok('le marché baisse le prix des œufs', jeu.prixOeuf(jeu.EGG_BY_KEY.commun) < oe);

  // la main : le clic
  const cp = jeu.clickPower();
  jeu.acheterEtoile('poing');
  ok('le poing double le clic', jeu.clickPower() > cp, cp + ' → ' + jeu.clickPower());

  /* LA PENSION EST TOUT ENTIÈRE ICI, ET SON AXE S'EST OUVERT EN FOURCHE. Elle se réglait en
     douze primes, puis en quatre crans qui levaient LES QUATRE CADRANS ensemble. Le tronc
     donne maintenant trois choses différentes, et chaque branche un seul cadran. */
  eq('sans un nœud, la pension est au plus bas', jeu.placesPension(), 1);
  ok('et plus aucune prime ne la touche',
     !jeu.PRIMES.some(p => p.cle.startsWith('pension')));

  jeu.acheterEtoile('nid');
  eq('le bâtiment seul : une place', jeu.placesPension(), 1);

  jeu.acheterEtoile('place-1');
  eq('un cran de places : deux nids', jeu.placesPension(), 2);
  eq('et la hâte n’a pas bougé', jeu.vitessePension(), 1);

  jeu.acheterEtoile('hate-1');
  eq('un cran de hâte : moitié plus vite', jeu.vitessePension(), 1.5);
  eq('et les places n’ont pas bougé', jeu.placesPension(), 2);

  jeu.acheterEtoile('sang-epais');
  eq('le sang épais porte à trois œufs', jeu.porteePension(), 3);
  eq('et le sang dominant arrive', jeu.chancePension(1), 0.4);

  jeu.acheterEtoile('nid-riche');
  eq('et le sang ne pèse plus', jeu.richessePension(), 8);

  // l'album : la poussière double, puis la forge coûte moitié moins
  const d0 = jeu.poussiereDe(pave(jeu, 1));
  jeu.acheterEtoile('cendres');
  eq('les cendres doublent la poussière', jeu.poussiereDe(pave(jeu, 1)), d0 * 2);

  /* LE CREUSET LÈVE L'INTERDIT SUR LES CARTES ÉQUIPÉES : la forge DÉSIGNE ses trois cartes et
     montre le résultat, donc rien n'y est silencieux. */
  s.album = [pave(jeu, 1)]; s.slots = [1];
  ok('une équipée reste hors forge', !jeu.forgeable(s.album[0]));
  jeu.acheterEtoile('creuset');
  ok('le creuset l’y fait entrer', jeu.forgeable(s.album[0]));

  const f0 = jeu.coutFusion(s.album[0]);
  jeu.acheterEtoile('braise-douce');
  eq('la braise douce halve le coût', jeu.coutFusion(s.album[0]), Math.round(f0 / 2));
});

scenario('constellation — acheter coûte, et la boucle ne rend rien', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.coins = 1e9;
  jeu.crediterJetons();

  /* LE BUG QUE CE SCÉNARIO TIENT. `acheterEtoile` remettait `asc.sommet` à zéro en croyant
     convertir le crédit du cycle en bourse. Or `crediterJetons` tourne DIX FOIS PAR SECONDE et
     relève le sommet sur `state.coins` : le crédit revenait entier au tour suivant, en plus de
     la bourse qui le contenait déjà. Quatre jetons, un achat à un, et sept jetons un dixième
     de seconde plus tard.

     `sommet` N'EST PAS UNE RÉSERVE, C'EST UNE MESURE — le plus haut que la bourse ait atteint.
     Une mesure que la boucle refait ne peut pas servir de compteur. */
  const avant = jeu.jetonsEnMain();
  eq('un milliard crédite quatre jetons', avant, 4);

  /* LE MOYEU NE S'ACHÈTE PLUS : le nid, à trois jetons, sert d’étalon. */
  ok('le nid s’achète', jeu.acheterEtoile('nid'));
  eq('il coûte trois jetons', jeu.jetonsEnMain(), avant - 3);

  jeu.crediterJetons();
  eq('et un tour de boucle ne rend rien', jeu.jetonsEnMain(), avant - 3);
  for (let i = 0; i < 100; i++) jeu.crediterJetons();
  eq('cent tours non plus', jeu.jetonsEnMain(), avant - 3);

  /* CE QU'ON N'A PLUS EN MAIN NE S'ACHÈTE PLUS : sans ça, la bourse se vide dans le rouge et
  eq('il reste un jeton', jeu.jetonsEnMain(), 1);
  ok('un nœud à quatre est hors de portée', !jeu.acheterEtoile('poing'));
  ok('un nœud à deux ne passe pas non plus', !jeu.acheterEtoile('place-1'));
  ok('un nœud à trois passe encore', jeu.acheterEtoile('nid-plus') || jeu.jetonsEnMain() === 3);

  /* LE SOMMET RESTE LA MESURE QU'IL EST : franchir un palier de plus crédite toujours. */
  const enMain = jeu.jetonsEnMain();
  s.coins = 1e12;
  jeu.crediterJetons();
  ok('un palier de plus crédite encore', jeu.jetonsEnMain() > enMain);
});

scenario('constellation — le glisser ne mange plus le clic suivant', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  poserJetons(jeu, 500);

  /* LE DRAPEAU NE SE BAISSAIT QU'EN CLIQUANT L'ARBRE. Or un glisser se termine souvent HORS de
     l'arbre — le canevas déborde de son cadre — et alors aucun clic ne survenait : le drapeau
     restait levé, et le prochain vrai clic sur un nœud était avalé. */
  jeu.cielDebutTire({ clientX: 0, clientY: 0 });
  jeu.cielBouge({ clientX: 200, clientY: 0 });
  ok('le glisser est reconnu', jeu.cielFinTire() > 3);
  jeu.cielGlisse = true;                       // ce que fait le `mouseup` de la fenêtre

  jeu.cielDebutTire({ clientX: 0, clientY: 0 });
  eq('un geste neuf repart d’une ardoise propre', jeu.cielGlisse, false);
  eq('et un clic simple ne bouge rien', jeu.cielFinTire(), 0);
});

scenario('constellation — on ne peut pas perdre l’arbre hors de l’écran', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  poserJetons(jeu, 500);

  /* LE GLISSER N'AVAIT AUCUNE BORNE : trois mille pixels et la constellation quittait l'écran,
     sans rien pour la ramener — une carte qu'on peut faire tomber du bureau. */
  jeu.cielDebutTire({ clientX: 0, clientY: 0 });
  jeu.cielBouge({ clientX: 9000, clientY: 9000 });
  jeu.cielFinTire();
  ok('le déplacement est borné', Math.abs(jeu.cielVue.x) <= jeu.CIEL_LIMITE, jeu.cielVue.x);
  ok('dans les deux axes', Math.abs(jeu.cielVue.y) <= jeu.CIEL_LIMITE, jeu.cielVue.y);

  jeu.cielDebutTire({ clientX: 0, clientY: 0 });
  jeu.cielBouge({ clientX: -9000, clientY: -9000 });
  jeu.cielFinTire();
  ok('et dans l’autre sens', Math.abs(jeu.cielVue.x) <= jeu.CIEL_LIMITE, jeu.cielVue.x);

  /* LA BORNE DOIT RESTER ASSEZ LARGE POUR ATTEINDRE LE NŒUD LE PLUS LOIN, sinon on aurait
     échangé un arbre perdu contre un arbre inaccessible. */
  const loin = Math.max(...jeu.CIEL_VUE.rayon);
  ok('elle laisse amener le nœud le plus loin au centre', jeu.CIEL_LIMITE >= loin,
     jeu.CIEL_LIMITE + ' vs ' + loin);
});

scenario('constellation — chaque nœud change quelque chose de mesurable', () => {
  /* AUCUN REMPLISSAGE : c'est la règle qui a supprimé le tronc de vingt rangs de « +2 % ». Ce
     scénario la tient pour les vingt-cinq nœuds à la fois, en mesurant une sonde par levier —
     un nœud qui ne bougerait aucune d'elles serait du décor. */
  const sondes = [
    j => j.coef('valeur'), j => j.coef('rente'), j => j.coef('vitesse'),
    j => j.prixOeuf(j.EGG_BY_KEY.commun), j => j.clickPower(),
    j => JSON.stringify(j.bonusCiel()),
    j => j.placesPension(), j => j.porteePension(),
    j => j.richessePension(), j => j.vitessePension(),
    j => j.coutCartes(3), j => j.jetonsDus(),
    j => j.state.album[0] ? j.coutFusion(j.state.album[0]) : 0,
    j => j.state.album[0] ? j.forgeable(j.state.album[0]) : 0,
    j => j.state.pen[0] ? j.evoCost(j.state.pen[0]) : 0,
    j => j.state.album[0] ? j.poussiereDe(j.state.album[0]) : 0,
    /* LA FERVEUR NE SE LIT NULLE PART AILLEURS : elle vit dans `offrirFrenesie`, donc on
       l offre pour de vrai et on regarde la duree obtenue. */
    j => { j.state.frenesie = 0; j.offrirFrenesie(1); return j.state.frenesie; },
    j => j.PRIMES.length,          // sentinelle : une sonde qui ne bouge jamais
  ];
  const muets = [];
  for (const n of neuf().CIEL) {
    const jeu = neuf(); const s = jeu.state;
    s.tuto = false; s.pens = 8; s.coins = 1e12;
    jeu.crediterJetons();
    s.pen = [bete(jeu, 'crapaud', 2, 100)];
    s.album = [pave(jeu, 1)]; s.slots = [1];
    const av = sondes.map(f => String(f(jeu)));
    s.ciel[n.cle] = true;
    jeu.oublierPrimes();
    const ap = sondes.map(f => String(f(jeu)));
    /* L'ÉTINCELLE EST LA SEULE EXCEPTION, ET SON EFFET EST STRUCTUREL : elle n'ajoute aucun
       nombre, elle ouvre les six directions. */
    if (n.cle !== 'etincelle' && av.join('|') === ap.join('|')) muets.push(n.cle);
  }
  eq('aucun nœud muet', muets.join(' '), '');

  const j = neuf();
  ok('et l’étincelle ouvre bien les six',
     j.PAR_AXE[j.AXES[0].cle][0].parent === 'etincelle');
});

scenario('constellation — on peut tout reprendre, et le compte est exact', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.coins = 1e12; jeu.crediterJetons();

  /* ELLE NE REND PAS LES CHOIX GRATUITS, ELLE LES REND RÉVISABLES. Dans un jeu à une seule
     sauvegarde, un nœud pris par erreur se subissait pour toujours. */
  eq('rien à reprendre sur un ciel vide', jeu.prixDuCiel(), 0);
  ok('et le bouton ne fait rien', !jeu.reprendreCiel());

  const avant = jeu.jetonsEnMain();
  jeu.acheterEtoile('nid');
  jeu.acheterEtoile('place-1');
  eq('deux nœuds valent cinq jetons', jeu.prixDuCiel(), 5);
  eq('et la bourse a fondu d’autant', jeu.jetonsEnMain(), avant - 5);

  eq('la reprise rend les cinq', jeu.reprendreCiel(), 5);
  eq('la bourse est comme avant', jeu.jetonsEnMain(), avant);
  eq('et le ciel est vide', Object.keys(s.ciel).length, 0);

  /* LE PIÈGE, ET C'EST LE MÊME QU'EN 4.6.1 : la dépense du cycle N'EST PAS remise à zéro. Elle
     enregistre ce qui a été payé, ce qui reste vrai ; le remboursement s'ajoute par-dessus. */
  for (let i = 0; i < 50; i++) jeu.crediterJetons();
  eq('et la boucle ne rend rien de plus', jeu.jetonsEnMain(), avant);

  /* CE QUI A ÉTÉ PRIS AU CYCLE PRÉCÉDENT SE REPREND AUSSI : la constellation traverse
     l'ascension, donc son remboursement doit la traverser également. Le moyeu ne peut plus
     servir d'exemple — il est gratuit — on prend donc un nœud de tronc. */
  jeu.acheterEtoile('nid');
  s.pens = 20;
  s.pen = [bete(jeu, 'crapaud', 3, 3000)];
  jeu.ascChoix = [-s.pen[0].id];
  jeu.ascensionner();
  ok('le nid a franchi le saut', jeu.etoilePrise('nid'));
  const apres = jeu.jetonsEnMain();
  eq('il se reprend quand même', jeu.reprendreCiel(), 3);
  eq('et les trois jetons reviennent', jeu.jetonsEnMain(), apres + 3);
});

scenario('constellation — le bouton de reprise dit ce qu’il rend', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  poserJetons(jeu, 500);
  jeu.cielSig = '';
  jeu.refresh();

  const bout = noeuds.get('ciel-reprendre');
  /* UN « TOUT REPRENDRE » SUR UN CIEL VIDE EST UN BOUTON QUI MENT SUR CE QU'IL FAIT. */
  eq('rien à reprendre, rien à montrer', bout.hidden, true);

  jeu.acheterEtoile('nid');
  jeu.acheterEtoile('place-1');
  jeu.refresh();
  eq('le bouton paraît', bout.hidden, false);
  ok('et il annonce la somme', bout.textContent.indexOf('5') >= 0, bout.textContent);

  jeu.reprendreCiel();
  jeu.refresh();
  eq('il se retire avec le dernier nœud', bout.hidden, true);
});

scenario('constellation — le ciel se dessine, et il est plus grand que l’écran', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  poserJetons(jeu, 500);
  jeu.cielSig = '';
  jeu.refresh();

  const onglet = v => [...document.querySelectorAll('.onglet')].find(b => b.dataset.vue === v);
  eq('l’onglet s’ouvre avec le premier jeton', onglet('ciel').hidden, false);

  const tous = cls => {
    const t = [];
    const m = x => {
      if (x.classList && x.classList.contains(cls)) t.push(x);
      x.children.forEach(m);
    };
    noeuds.get('ciel-arbre').children.forEach(m);
    return t;
  };

  eq('tous les nœuds sont dessinés', tous('etoile').length, jeu.CIEL.length);
  /* UN LIEN PAR NŒUD SAUF L'ÉTINCELLE, qui n'a pas de parent : c'est le trait qui porte la
     règle d'ouverture. */
  eq('un lien par nœud, sauf le centre', tous('lien').length, jeu.CIEL.length - 1);

  /* LE SEMIS EST STABLE : les étoiles de fond viennent d'un générateur graine, pas de
     `Math.random`. Sinon elles sauteraient à chaque redessin. */
  const semis = () => tous('ciel-semis')[0].children.map(c => c.getAttribute('cx')).join(',');
  const a = semis();
  jeu.cielSig = '';
  jeu.refresh();
  eq('le ciel ne scintille pas sans raison', semis(), a);

  /* ── UN NŒUD NON OUVERT SE DEVINE, IL NE SE LIT PLUS — ET C'EST UN RENVERSEMENT ──
     Ce scénario tenait l'inverse : « un nœud fermé se montre, il ne se cache pas : on montre
     une carte qu'on lit pour décider où aller ». La demande est venue en sens contraire — « on
     découvre les constellations petit à petit » — et elle a raison contre la ligne d'avant :
     un arbre entièrement déplié se lit une fois, se planifie en trois minutes, et ne se regarde
     plus jamais. Découvert cran par cran, il donne une raison de revenir.

     LE CHEMIN RESTE VISIBLE, ET C'EST CE QUI SÉPARE LA DÉCOUVERTE DE L'ÉNIGME : la place, le
     lien et la couleur de l'axe sont là ; seuls le nom, le glyphe et le prix se taisent. */
  const devinees = tous('etoile').filter(x => x.classList.contains('devinee'));
  /* LE MOYEU ET LES SIX PREMIERS SONT OUVERTS D'EMBLÉE : le moyeu est acquis par nature,
     et les six axes partent de lui. Tout le reste attend son parent. */
  eq('le moyeu et les six premiers se lisent', devinees.length, jeu.CIEL.length - 7);
  ok('et une devinée ne dit ni son nom ni son prix',
     !tous('etoile-nom').some(t => t.textContent === 'Le fracas'),
     tous('etoile-nom').length + ' noms pour ' + jeu.CIEL.length + ' étoiles');
  eq('il n’y a qu’un nom et un prix par étoile lisible',
     tous('etoile-nom').length, jeu.CIEL.length - devinees.length);

  jeu.acheterEtoile('etincelle');
  jeu.refresh();
  ok('le centre se marque', tous('etoile')[0].classList.contains('prise'));
  eq('et six portes s’ouvrent',
     tous('etoile').filter(x => x.classList.contains('ouverte')).length, 6);

  eq('la bourse est annoncée', noeuds.get('ciel-jetons').textContent.slice(0, 1), '✦');
});

scenario('constellation — le sang touche l’ascension elle-même', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;

  /* LE PRIX DORÉ S'ADOUCIT : chaque carte coûte un cran de moins. C'est le seul achat du jeu
     qui change la valeur de tous les achats suivants — d'où son prix et son rang. */
  eq('sans le nœud, la troisième carte coûte trois', jeu.coutCarte(2), 3);
  eq('et cinq cartes en coûtent dix-huit', jeu.coutCartes(5), 18);
  s.ciel['or-doux'] = true;
  eq('avec, la troisième coûte comme la deuxième', jeu.coutCarte(2), 2);
  eq('la première reste à un', jeu.coutCarte(0), 1);
  ok('et cinq cartes coûtent nettement moins', jeu.coutCartes(5) < 18, jeu.coutCartes(5));

  /* LE SOMMET COMPTE PLUS : un jeton de plus par cycle, pour toujours. */
  s.ciel = {};
  s.coins = 1e9; jeu.crediterJetons();
  eq('un milliard vaut quatre paliers', jeu.jetonsDus(), 4);
  s.ciel.sommet = true;
  eq('avec le nœud, cinq', jeu.jetonsDus(), 5);

  /* MAIS JAMAIS SUR ZÉRO : un cycle où l'on n'a pas tenu une seule pièce ne doit rien
     créditer, sinon sauter aussitôt après un saut rapporterait un jeton gratuit. */
  s.asc.sommet = 0;
  eq('un cycle vide ne crédite rien', jeu.jetonsDus(), 0);
});
