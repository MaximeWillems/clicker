/* ── LA BÊTE — ses trois axes, son échelle de valeur, le clic qui la pousse, l’enclos */

'use strict';
const { scenario, ok, eq, neuf, noeuds, lire, bete, saturerCombo, seule } = require('./_aides.js');

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

scenario('échelle des rangs — une bête achetée est à l’équilibre à l’âge adulte', () => {
  const jeu = neuf(); const s = jeu.state;
  const ligne = {};
  for (const l of jeu.LINES) if (!ligne[l.rarity]) ligne[l.rarity] = l.key;

  /* LA RÈGLE : l'œuf plus les deux premiers péages valent exactement ce que la bête se vend
     une fois mûre à l'âge adulte. C'est `mult` qui la tient — il porte la revente ET le péage,
     donc un seul nombre par rareté suffit. La commune joue sur l'autre échelle et la rare
     garde son prix de la 4.8.0 : toutes deux sont bénéficiaires, et c'est écrit dans game.js. */
  for (const rar of ['epique', 'mythique']) {
    const oeuf = jeu.EGG_KINDS.find(e => e.rarity === rar);
    const c = { id: 1, line: ligne[rar], age: 1, p: 0, over: 0, cost: 0 };
    let peages = 0;
    s.pen = [c];
    for (let a = 1; a <= 2; a++) { c.age = a; peages += jeu.evoCost(c); }
    c.age = 3; c.p = jeu.bandTo(c);
    const cout = oeuf.price + peages, vaut = jeu.sellValue(c);
    ok(rar + ' est à l’équilibre à l’âge adulte mûr',
       Math.abs(vaut - cout) / cout < 0.001, ((vaut - cout) / cout * 100).toFixed(3) + ' %');
  }
  eq('l’œuf épique vaut un billion', jeu.EGG_BY_KEY.epique.price, 1e12);

  // l'escalier ne se retourne pas : ni les multiplicateurs, ni les prix
  let m = 0;
  for (const cle of Object.keys(jeu.RARITY).sort((a, b) => jeu.RARITY[a].rank - jeu.RARITY[b].rank)) {
    ok('le multiplicateur monte avec le rang (' + cle + ')', jeu.RARITY[cle].mult >= m,
       jeu.RARITY[cle].mult);
    m = jeu.RARITY[cle].mult;
  }
  let prix = 0;
  for (const e of jeu.OEUFS_VENDUS) { ok('le prix des œufs monte (' + e.key + ')', e.price > prix, e.price); prix = e.price; }

  /* LES MENUS DU MARCHAND LISENT LA BONNE ÉCHELLE. Ils lisaient celle des communes pour toutes
     les raretés — cinq cents fois à côté sur une épique adulte, sur le chiffre même qui sert à
     régler la consigne. */
  eq('une épique adulte mûre vaut ce que dit valeurBase',
     jeu.valeurMure('epique', 3), jeu.VALEURS_RANG[2] * jeu.RARITY.epique.mult);
  ok('et non l’échelle des communes',
     jeu.valeurMure('epique', 3) !== jeu.VALUE[2] * jeu.RARITY.epique.mult);
  eq('les péages jusqu’à l’âge adulte suivent la même échelle',
     jeu.peagesJusque('epique', 3),
     (jeu.PEAGES_RANG[0] + jeu.PEAGES_RANG[1]) * jeu.RARITY.epique.mult);
  eq('une commune garde l’échelle des âges',
     jeu.valeurMure('commune', 3), jeu.VALUE[2]);

  /* LE SEUIL DE REMBOURSEMENT LIT LA MÊME ÉCHELLE — c'était le quatrième site de la faute, et
     le pire : il rendait `null` pour les quatre raretés payantes, c'est-à-dire « elle ne
     rembourse jamais », sur une bête qu'on vient de payer un billion. Le seuil d'une rare est
     l'âge adulte, et ce n'est pas un réglage : c'est la règle du multiplicateur qui retombe
     sur ses pieds — l'œuf et ses deux premiers péages valent la bête mûre à cet âge-là. */
  const s2 = jeu.state; s2.tuto = false; s2.pens = 8;
  const seuil = (ligne, rar) => {
    const oeuf = jeu.EGG_KINDS.find(e => e.rarity === rar);
    s2.incub[0] = { line: ligne, p: 9999, kind: oeuf.key };
    jeu.hatchAll();
    const c = s2.pen[s2.pen.length - 1];
    c.chroma = 0; c.rank = 0; c.motif = 0; c.temper = 0; c.prodige = false; c.fond = null;
    c.cost = oeuf.price || 0;
    return jeu.seuilRentable(c);
  };
  /* ── LA GARDE ────────────────────────────────────────────────────────────────
     Une seule faute, quatre sites, deux versions pour la voir : choisir entre l'échelle des
     communes et celle des rangs a été écrit à la main quatre fois, et faux quatre fois. Ce
     bloc interdit la cinquième. Toute indexation de `VALUE[`, `EVOLVE[`, `VALEURS_RANG[` ou
     `PEAGES_RANG[` en dehors des deux portes fait échouer le scénario.

     On lit la SOURCE et non le comportement, parce que c'est la recopie qu'on veut interdire,
     pas son résultat : un cinquième site copié serait juste le jour où on l'écrit, et faux au
     premier changement d'échelle — c'est exactement ce qui est arrivé aux quatre autres. */
  const portes = ['const echelleDe', 'const peagesDe'];
  /* ON NE SCANNE QUE DU CODE. Les commentaires de `game.js` CITENT les tables pour expliquer
     la règle — c'est même là qu'elle est écrite — et une prose qui explique n'applique rien.
     Un état de bloc plutôt qu'un `replace` global : on garde les numéros de ligne, sans quoi
     le message d'échec désignerait une ligne qui n'existe pas. */
  let dansBloc = false;
  const fautes = [];
  lire('game.js').split(/\r?\n/).forEach((l, i) => {
    const t = l.trim();
    if (dansBloc) { if (t.indexOf('*/') >= 0) dansBloc = false; return; }
    if (t.indexOf('/*') === 0) { if (t.indexOf('*/') < 0) dansBloc = true; return; }
    if (t.indexOf('//') === 0) return;
    if (!/(VALUE|EVOLVE|VALEURS_RANG|PEAGES_RANG)\s*\[/.test(l)) return;
    if (portes.some(q => l.indexOf(q) === 0)) return;
    fautes.push((i + 1) + ' : ' + t.slice(0, 60));
  });
  ok('les quatre tables ne se lisent que par leurs deux portes',
     fautes.length === 0, fautes.join('  |  '));

  eq('une commune rembourse dès l’enfance', seuil('crapaud', 'commune'), 1);
  eq('une rare rembourse à l’âge adulte', seuil('loup', 'rare'), 3);
  eq('une épique à l’âge ancien', seuil('golem', 'epique'), 4);
  eq('une mythique aussi', seuil('tyrannosaure', 'mythique'), 4);
});

scenario('clic — une bête menée au bout paie, et seulement sous ta main', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 8; s.coins = 0;
  const c = bete(jeu, 'golem', 5, 0);
  c.p = jeu.bandTo(c);

  /* TROIS PLAFONDS À LA FOIS, jamais un seul : une commune mûre à l'âge enfant est déjà « au
     max de sa tranche », et si elle comptait, c'est toute la ferme qui compterait. */
  eq('au niveau cent mais pas au dernier rang', jeu.estFinie(c), false);
  ok('et le clic la fait encore grossir',
     (jeu.select('c:' + c.id), jeu.tapStage(), (c.over || 0) > 0));

  c.over = jeu.ageGrow(c) * 580;
  eq('au dernier rang, elle est finie', jeu.estFinie(c), true);
  ok('rankOf le dit déjà', jeu.rankOf(jeu.sizeFactor(c)).next === null);

  // un âge plus bas ne compte pas, quel que soit l'embonpoint
  const jeune = bete(jeu, 'golem', 4, 0);
  jeune.p = jeu.bandTo(jeune);
  jeune.over = jeu.ageGrow(jeune) * 580;
  eq('un âge en dessous n’est jamais fini', jeu.estFinie(jeune), false);

  /* CE QU'UN CLIC REND ALORS : de la monnaie, et plus de l'embonpoint. */
  jeu.select('c:' + c.id);
  saturerCombo(jeu);
  const avant = s.coins, gras = c.over;
  jeu.tapStage();
  ok('le clic paie', s.coins > avant, s.coins - avant);
  eq('et n’engraisse plus', c.over, gras);
  eq('c’est bien le montant annoncé', s.coins - avant,
     jeu.gainClicFini(c, { kind: 'creature', c }));

  /* IL RESTE UNE RÉCOMPENSE DE PRÉSENCE : de l'ordre de mille cinq cents clics pour égaler
     une vente. S'il en fallait dix, vendre n'aurait plus de sens. */
  ok('mille clics ne valent pas une vente',
     (s.coins - avant) * 1000 < jeu.sellValue(c),
     Math.round(jeu.sellValue(c) / (s.coins - avant)) + ' clics par vente');

  /* ET SEULEMENT SOUS LA MAIN DU JOUEUR. La carte ocellée clique à ta place : si elle
     encaissait, elle deviendrait une machine à monnaie automatique, et la mécanique
     produirait l'inverse de son intention. */
  const avant2 = s.coins, gras2 = c.over;
  jeu.mainDeCarte = true;
  jeu.tapStage();
  jeu.mainDeCarte = false;
  eq('l’ocellée n’encaisse rien', s.coins, avant2);
  ok('elle retombe sur l’embonpoint', c.over > gras2);
});

scenario('échelle — une bête vaut plus que son œuf, à partir de l’âge adulte', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const bete1 = l => { s.pens = 20; s.pen = []; s.incub[0] = { line: l, p: 9999, kind: 'commun' };
                       jeu.hatchAll(); const c = s.pen[s.pen.length - 1];
                       c.chroma = 0; c.rank = 0; c.motif = 0; c.temper = 0; c.prodige = false;
                       return c; };
  const vente = (c, a) => jeu.sellValue(Object.assign({}, c, { age: a, p: 1e6 }));
  const peage = (c, a) => jeu.evoCost(Object.assign({}, c, { age: a }));

  /* UN ŒUF NE DOIT PAS COÛTER PLUS QUE LA BÊTE NE VAUDRA JAMAIS, et c'était le cas : l'œuf
     rare valait 50 M pour une bête qui plafonnait à 43,1 M. Achetée, élevée jusqu'au bout,
     vendue, elle laissait 23 millions de perte — à TOUS les âges, sans exception. */
  const solde = (l, oeuf) => {
    const c = bete1(l);
    let cum = oeuf;
    return [1, 2, 3, 4, 5].map(a => {
      if (a > 1) cum += peage(c, a - 1);
      return vente(c, a) - cum;
    });
  };

  const rare = solde('loup', jeu.EGG_BY_KEY.rare.price);
  ok('l’enfant est un investissement', rare[0] < 0, rare[0]);
  ok('l’adolescent aussi', rare[1] < 0, rare[1]);
  /* L'ADULTE EST EXACTEMENT À L'ÉQUILIBRE, ET C'EST LA RÈGLE ELLE-MÊME depuis la `4.12.1` :
     `mult = prix de l'œuf / 2 200 000`. Il était bénéficiaire de 7 % tant que l'œuf rare
     valait 50 M au lieu des 55 M que la règle demande — un reste de la `4.8.0`, où le prix
     était encore posé à la main. Zéro n'est pas un relâchement de l'exigence d'origine, c'est
     l'endroit où la décision d'aller plus loin se prend : sur une bête qui ne doit plus rien. */
  eq('l’adulte est exactement à l’équilibre', rare[2], 0);
  ok('et tout ce qui suit est bénéficiaire', rare[3] > rare[2] && rare[4] > rare[3], rare.join(' '));

  /* LES COMMUNES SONT LE MODÈLE : bénéficiaires à CHAQUE âge, œuf compris. Elles ne changent
     pas — l'ouverture du jeu est le dernier endroit où l'on touche. */
  const commune = solde('crapaud', jeu.EGG_BY_KEY.commun.price);
  ok('la commune gagne dès l’enfant', commune.every(x => x > 0), commune.join(' '));
  const c0 = bete1('crapaud');
  eq('et son péage n’a pas bougé', peage(c0, 1), 200);
  eq('ni le dernier', peage(c0, 4), 600000);

  /* CHAQUE ÉVOLUTION COÛTE PLUSIEURS FOIS CE QUE LA BÊTE VAUT À CET INSTANT : c'est un
     investissement, jamais quelque chose qu'on finance en la revendant. Et la première est un
     mur — c'est elle qui verrouille la rare tombée par chance. */
  const r = bete1('loup');
  for (let a = 1; a <= 4; a++) {
    ok('le péage ' + a + '→' + (a + 1) + ' dépasse la valeur du moment',
       peage(r, a) > vente(r, a), peage(r, a) + ' vs ' + vente(r, a));
  }
  ok('la rare trouvée se vend pour peu', vente(r, 1) < 5000, vente(r, 1));
  ok('mais la garder coûte une fortune', peage(r, 1) > 1e6, peage(r, 1));

  /* L'ÉCHELLE SE PROPAGE PAR `mult`, donc elle ne peut plus se retourner : ce qui vaut plus
     cher à l'œuf vaut plus cher sur pied, à tous les rangs. */
  const val = l => vente(bete1(l), 5);
  ok('la rare dépasse la commune', val('loup') > val('crapaud'));
  ok('l’épique dépasse la rare', val('kraken') > val('loup'));
  ok('la mythique dépasse l’épique', val('behemoth') > val('kraken'));
});

scenario('enclos — une vente laisse un trou à sa place', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9; s.pens = 6;
  const cases = () => noeuds.get('strip-pen').children;
  const occupee = i => cases()[i] && !cases()[i].classList.contains('thumb-vide');
  const qui = i => occupee(i) ? cases()[i].dataset.cle : null;

  const a = bete(jeu, 'crapaud', 3, 20000);
  const b = bete(jeu, 'loup', 3, 20000);
  const c = bete(jeu, 'ours', 3, 20000);
  jeu.refresh();

  /* AUTANT DE CASES QUE D'ENCLOS POSSÉDÉS, occupées ou non : la bande cesse d'être une liste
     et devient un enclos. */
  eq('six cases pour six enclos', cases().length, 6);
  eq('trois occupées', [0, 1, 2, 3, 4, 5].filter(occupee).length, 3);
  const place = [qui(0), qui(1), qui(2)];

  /* LE DÉFAUT QUE ÇA CORRIGE : en ×100 le marchand vide un enclos plus vite qu'on ne vise, et
     entre le moment où l'œil choisit une vignette et celui où le doigt appuie, la bête sous le
     curseur n'est plus la même. Vendre celle du milieu ne doit RIEN déplacer. */
  jeu.sell(b);
  jeu.refresh();
  eq('la première n’a pas bougé', qui(0), place[0]);
  ok('la case du milieu est vide', !occupee(1));
  eq('et la troisième non plus', qui(2), place[2]);
  eq('toujours six cases', cases().length, 6);

  // le trou est repris par la suivante, et non ajouté au bout
  const d = bete(jeu, 'chat', 3, 20000);
  jeu.refresh();
  eq('la nouvelle prend la case libérée', qui(1), 'c:' + d.id);
  eq('sans rien pousser', qui(2), place[2]);

  /* ET AU BOUT D'UNE SECONDE, L'ENCLOS SE RETASSE. Figer les cases pour de bon était une
     seconde faute après celle qu'elle corrigeait : le TRI n'était plus jamais rétabli, et au
     bout de dix ventes l'enclos ne ressemblait plus à rien. Les deux besoins ne se
     contredisent que DANS L'INSTANT — une seconde sépare « je vise » de « remets en ordre ». */
  jeu.casesDepuis = Date.now() - jeu.DELAI_CASES - 1;
  jeu.stripSig = '';
  jeu.refresh();
  eq('les trois sont retassées en tête', [0, 1, 2].filter(occupee).length, 3);
  ok('et plus aucun trou', !cases().slice(0, 3).some(x => x.classList.contains('thumb-vide')));

  /* LE DÉLAI COURT DEPUIS LA PERTE DE L'ORDRE, pas depuis la dernière vente : un marchand qui
     vend en continu — c'est le cas en ×100 — repousserait sinon le retassage indéfiniment. */
  const e = bete(jeu, 'cerf', 3, 20000);
  jeu.sell(e);
  jeu.refresh();
  ok('un trou frais est bien figé', jeu.casesARetasser(
     jeu.subjects().filter(x => x.kind === 'creature')) === false);

  /* TRIER REDISTRIBUE TOUT DE SUITE, sans attendre : c'est un geste explicite, on s'attend à
     ce que tout bouge. */
  s.tri = 'rarete';
  jeu.stripSig = '';
  jeu.refresh();
  eq('les trois survivantes sont regroupées en tête', [0, 1, 2].filter(occupee).length, 3);
  ok('et la quatrième case est libre', !occupee(3));
});

scenario('vente — regarder une bête la protège trois secondes', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e9; s.pens = 8;
  s.primes.marchand = true;
  const c = bete(jeu, 'crapaud', 3, 20000);
  for (const cle of Object.keys(jeu.RARITY)) s.sellAt[cle] = 1;

  /* EN ×100 LE MARCHAND VIDE UN ENCLOS PLUS VITE QU'ON NE VISE : on clique une bête pour la
     garder ou la vendre soi-même, et elle est déjà partie. */
  jeu.select('c:' + c.id);
  jeu.runAutomations(1);
  ok('celle qu’on vient de désigner tient', s.pen.some(x => x.id === c.id));

  /* ET LE SURSIS EXPIRE — c'était le défaut commun aux deux exceptions retirées avant : une
     immunité permanente laissait invendue pour toujours la bête qu'on venait d'évoluer. */
  jeu.focusJusqu = Date.now() - 1;
  jeu.runAutomations(1);
  ok('trois secondes plus tard, elle part', !s.pen.some(x => x.id === c.id));

  // et une bête qu'on ne regarde pas n'est jamais protégée
  const d = bete(jeu, 'crapaud', 3, 20000);
  jeu.select('c:' + d.id);
  const e = bete(jeu, 'crapaud', 3, 20000);
  jeu.select('c:' + e.id);
  jeu.runAutomations(1);
  ok('la précédente n’est plus couverte', !s.pen.some(x => x.id === d.id));
  ok('seule la dernière désignée l’est', s.pen.some(x => x.id === e.id));
});

scenario('enclos — une place de plus coûte enfin quelque chose', () => {
  const jeu = neuf(); const s = jeu.state;

  /* 1,6 RENDAIT LES PLACES GRATUITES, ET C'ÉTAIT MESURABLE : le vingt-quatrième enclos coûtait
     19,8 millions quand une rare légende en rapporte douze milliards l'heure — trois secondes
     de rente. À 2,1, le premier ne bouge pas, le cinquième coûte trois fois plus, et le
     vingt-quatrième cinq cents fois plus. Ce n'est pas le début qui était trop bon marché,
     c'est la suite qui ne montait pas. */
  eq('le premier enclos ne bouge pas', (s.pens = 1, jeu.penCost()), jeu.PEN_BASE);
  eq('ni le premier incubateur', (s.incubators = 1, jeu.incubCost()), jeu.INCUB_BASE);

  const avant = m => Math.round(jeu.PEN_BASE * Math.pow(1.6, m - 1));
  /* 2,97 et non 3,00 au cinquième : le rapport entre deux géométriques ne tombe pas rond, et
     arrondir le seuil à trois ferait échouer un scénario pour un centième. On mesure ce qui
     est vrai, pas ce qui est joli. */
  for (const [n, fois] of [[5, 2.9], [12, 19], [20, 100]]) {
    s.pens = n;
    const r = jeu.penCost() / avant(n);
    ok('le ' + n + 'e enclos coûte au moins ' + fois + ' fois plus qu’avant',
       r >= fois, r.toFixed(1) + ' fois');
  }

  /* LES DEUX ESCALIERS PARTAGENT LE MÊME MULTIPLICATEUR : une place est une place, qu'elle
     tienne une bête ou un œuf. Deux courbes différentes demanderaient d'expliquer pourquoi. */
  s.pens = 10; s.incubators = 10;
  eq('les incubateurs suivent la même pente',
     Math.round(jeu.penCost() / jeu.PEN_BASE * 1000),
     Math.round(jeu.incubCost() / jeu.INCUB_BASE * 1000));
});

scenario('enclos — l’Étable retirée est remboursée, pas confisquée', () => {
  /* Une prime achetée qui cesse d'exister est une dépense confisquée. Cent cinquante mille
     pièces sont dérisoires au moment où on les récupère ; le principe ne l'est pas. */
  const v = neuf({ coins: 1000, primes: { etable: true, marchand: true } });
  eq('le prix est rendu', v.state.coins, 1000 + 150000);
  ok('et la prime a disparu', !v.state.primes.etable);
  ok('les autres restent', v.state.primes.marchand);
  ok('elle n’est plus dans la table', !v.PRIME_BY_CLE.etable);
});

scenario('enclos — une bête gardée compte, une bête confiée non', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12; s.pens = 2; s.ciel = Object.assign(s.ciel || {}, { nid: 1 }); jeu.oublierPrimes();
  const a = bete(jeu, 'crapaud', 1, 3);
  const b = bete(jeu, 'crabe', 1, 3);
  eq('deux bêtes dans deux enclos', jeu.penUsed(), 2);
  ok('l’enclos est plein', jeu.penFull());

  /* GARDER NE LIBÈRE RIEN, et la prime qui le faisait a été retirée. L'Étable était une porte
     de sortie qui vidait la seule contrainte de la ferme : garder ne coûtait plus rien, donc
     on gardait tout, donc l'enclos cessait d'être une place à arbitrer. */
  a.keep = true;
  ok('garder n’ouvre aucune place', jeu.penFull());
  ok('et plus aucune prime ne le permet',
     !jeu.PRIMES.some(p => /gardes? ☆|étable/i.test(p.dit + p.nom)),
     jeu.PRIMES.map(p => p.cle).join(' '));

  /* CONFIER, SI. Le prix de la pension n'est plus une place mais un débit. */
  a.age = 4; a.p = jeu.bandTo(a); b.age = 4; b.p = jeu.bandTo(b);
  jeu.accoupler(a, b);
  eq('les deux confiées libèrent leurs enclos', jeu.penUsed(), 0);
  ok('la place se rouvre', !jeu.penFull());
});

scenario('niveau — le dernier niveau d’un âge tombe à la maturité, pas une barre avant', () => {
  /* LA BARRE MORTE. Une tranche de quinze niveaux se découpait en quinze barres, et la dernière
     affichait « 15 / 15 » en annonçant un niveau 16 : elle ne rapportait rien et ne servait qu'à
     mûrir. Quinze niveaux, c'est quatorze barres. */
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 5;
  const c = bete(jeu, 'crapaud', 1, 0);
  for (let age = 1; age <= jeu.AGES.length; age++) {
    c.age = age;
    const nom = jeu.AGES[age - 1].nom, dernier = jeu.nivBase(age) + jeu.nivDansAge(age);
    const debut = jeu.bandFrom(c), fin = jeu.bandTo(c), pas = jeu.dureeNiveau(c);
    c.p = debut;
    eq(nom + ' : on entre à son premier niveau', jeu.niveau(c), jeu.nivBase(age) + 1);
    eq(nom + ' : chaque barre fait gagner un niveau', (fin - debut) / pas, jeu.nivDansAge(age) - 1);
    c.p = fin - pas / 10;
    eq(nom + ' : juste avant la maturité, l’avant-dernier niveau', jeu.niveau(c), dernier - 1);
    ok(nom + ' : pas encore mûre', !jeu.estMur(c));
    c.p = fin;
    eq(nom + ' : le dernier niveau arrive avec la maturité', jeu.niveau(c), dernier);
    ok(nom + ' : mûre', jeu.estMur(c));
  }
  c.age = 1; c.p = jeu.bandTo(c) - jeu.dureeNiveau(c) / 2; jeu.refresh();
  const t = noeuds.get('stage-timer').textContent || '';
  ok('la minuterie annonce le niveau 15 avec la maturité, jamais un niveau 16', /niv\. 15 · mûre/.test(t), t);
});
