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
     jeu.niveau(c) + ' / ' + jeu.nivFin(1));

  c.p = jeu.bandTo(c); jeu.refresh();
  ok('mûre, la barre vise la TAILLE', T('timer-axe') === 'taille', T('timer-axe'));
  ok('la colonne taille est active', noeuds.get('axe-taille').classList.contains('actif'));
  ok('la colonne niveau est marquée mûre', noeuds.get('axe-niv').classList.contains('mur'));
  eq('les deux nombres se rejoignent', T('axe-niv-val').split(' / ')[0], T('axe-niv-val').split(' / ')[1]);
  eq('taille sans embonpoint', T('axe-taille-val'), 'normale');

  s.sel = 'i:0'; jeu.refresh();
  ok('un œuf n’a pas de colonnes', noeuds.get('stage-axes').hidden);
});

scenario('barème — la rare sert de modèle, et chaque rang au-dessus vaut la rare × 25', () => {
  const jeu = neuf(); const s = jeu.state;
  const ligne = {};
  for (const l of jeu.LINES) if (!ligne[l.rarity]) ligne[l.rarity] = l.key;

  /* LA RÈGLE : reventes et péages d'un rang payant sont ceux de la rare, multipliés par `mult`,
     et `mult` monte de ×25 d'un rang au suivant. Vingt-cinq n'est pas choisi : c'est le dernier
     péage de la rare divisé par son œuf. */
  const pas = jeu.peageDe('rare', 4) / jeu.EGG_BY_KEY.rare.price;
  eq('le pas vaut le dernier péage rare sur l’œuf rare', pas, 25);
  ['rare', 'epique', 'mythique', 'merveilleuse'].forEach((cle, i) => {
    const fois = Math.pow(pas, i);
    eq(cle + ' : ×25 par rang', jeu.RARITY[cle].mult, fois);
    for (let a = 1; a <= jeu.AGES.length; a++) {
      eq(cle + ' : revente à l’âge ' + a, jeu.valeurMure(cle, a), jeu.valeurMure('rare', a) * fois);
      if (a < jeu.AGES.length)
        eq(cle + ' : péage de l’âge ' + a, jeu.peageDe(cle, a), jeu.peageDe('rare', a) * fois);
    }
  });

  /* CHAQUE ŒUF COÛTE LE DERNIER PÉAGE DE L'ÈRE D'AVANT, et c'était déjà vrai de l'œuf rare, qui
     vaut le dernier péage commun : mener un ancien à la légende ou ouvrir l'ère suivante coûtent
     la même chose, et il faut choisir. */
  const ordre = ['commune', 'rare', 'epique', 'mythique'];
  for (let i = 1; i < ordre.length; i++) {
    const oeuf = jeu.EGG_KINDS.find(e => e.rarity === ordre[i]);
    eq('l’œuf ' + ordre[i] + ' vaut le dernier péage ' + ordre[i - 1],
       oeuf.price, jeu.peageDe(ordre[i - 1], jeu.AGES.length - 1));
  }

  /* LES MARGES SONT CELLES DE LA RARE, À TOUS LES RANGS PAYANTS : −20 % vendue enfant, puis de
     5 à 9 % au bout de chaque âge, œuf et péages compris — et un péage se paie en quinze à
     vingt-cinq ventes de l'âge qu'on quitte. La commune a les siennes, plus larges, et neuf
     ventes seulement pour sa toute première évolution. */
  const vie = (cle, oeuf) => {
    let cout = oeuf;
    return jeu.AGES.map((a, i) => {
      const v = jeu.valeurMure(cle, i + 1), gain = v - cout;
      const p = i + 1 < jeu.AGES.length ? jeu.peageDe(cle, i + 1) : 0;
      const r = { marge: gain / cout, ventes: p && gain > 0 ? Math.ceil(p / gain) : null };
      cout += p;
      return r;
    });
  };
  for (const cle of ['rare', 'epique', 'mythique']) {
    const v = vie(cle, jeu.EGG_KINDS.find(e => e.rarity === cle).price);
    ok(cle + ' vendue enfant perd un cinquième', Math.abs(v[0].marge + 0.2) < 1e-9, v[0].marge);
    for (let a = 1; a < v.length; a++)
      ok(cle + ' : de 5 à 9 % au bout de l’âge ' + (a + 1), v[a].marge >= 0.05 && v[a].marge < 0.095,
         (v[a].marge * 100).toFixed(1) + ' %');
    for (let a = 1; a < v.length - 1; a++)
      ok(cle + ' : le péage ' + (a + 1) + '→' + (a + 2) + ' se paie en 15 à 25 ventes',
         v[a].ventes >= 15 && v[a].ventes <= 25, v[a].ventes);
  }
  const com = vie('commune', jeu.EGG_BY_KEY.commun.price);
  ok('la commune gagne plus de 10 % à chaque âge', com.every(x => x.marge > 0.1),
     com.map(x => x.marge.toFixed(2)).join(' '));
  eq('sa toute première évolution demande neuf ventes', com[0].ventes, 9);
  for (let a = 1; a < com.length - 1; a++)
    ok('commune : le péage ' + (a + 1) + '→' + (a + 2) + ' se paie en 15 à 25 ventes',
       com[a].ventes >= 15 && com[a].ventes <= 25, com[a].ventes);

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
     rembourse jamais », sur une bête qu'on vient de payer. Depuis le barème unique le seuil est
     le même à tous les rangs payants, puisque la marge l'est : le bout de l'adolescence. */
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
  eq('une rare rembourse au bout de l’adolescence', seuil('loup', 'rare'), 2);
  eq('une épique aussi', seuil('golem', 'epique'), 2);
  eq('et une mythique', seuil('tyrannosaure', 'mythique'), 2);
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
     (jeu.select('c:' + c.id), jeu.tapStage(), (c.gras || 0) > 0));

  // les cinq rangs au niveau cent : 210 + 320 + 430 + 540 + 650
  const bout = [1, 2, 3, 4, 5].reduce((n, r) => n + jeu.coutRang(jeu.NIV_MAX, r), 0);
  eq('les cinq rangs coûtent deux mille cent cinquante au niveau cent', bout, 2150);
  c.gras = bout;
  eq('au dernier rang, elle est finie', jeu.estFinie(c), true);
  ok('rangDe le dit déjà', jeu.rangDe(c).next === null);

  // un âge plus bas ne compte pas, quel que soit l'embonpoint
  const jeune = bete(jeu, 'golem', 4, 0);
  jeune.p = jeu.bandTo(jeune);
  jeune.gras = 1e6;
  eq('un âge en dessous n’est jamais fini', jeu.estFinie(jeune), false);

  /* CE QU'UN CLIC REND ALORS : de la monnaie, et plus de l'embonpoint. */
  jeu.select('c:' + c.id);
  saturerCombo(jeu);
  const avant = s.coins, gras = c.gras;
  jeu.tapStage();
  ok('le clic paie', s.coins > avant, s.coins - avant);
  eq('et n’engraisse plus', c.gras, gras);
  eq('c’est bien le montant annoncé', s.coins - avant,
     jeu.gainClicFini(c, { kind: 'creature', c }));

  /* IL RESTE UNE RÉCOMPENSE DE PRÉSENCE, loin d'une vente : s'il suffisait de dix clics pour en
     égaler une, vendre n'aurait plus de sens. */
  ok('mille clics ne valent pas une vente',
     (s.coins - avant) * 1000 < jeu.sellValue(c),
     Math.round(jeu.sellValue(c) / (s.coins - avant)) + ' clics par vente');

  /* ET SEULEMENT SOUS LA MAIN DU JOUEUR. La carte ocellée clique à ta place : si elle
     encaissait, elle deviendrait une machine à monnaie automatique, et la mécanique
     produirait l'inverse de son intention. */
  const avant2 = s.coins, gras2 = c.gras;
  jeu.mainDeCarte = true;
  jeu.tapStage();
  jeu.mainDeCarte = false;
  eq('l’ocellée n’encaisse rien', s.coins, avant2);
  ok('elle retombe sur l’embonpoint', c.gras > gras2);
});

scenario('échelle — une bête vaut plus que son œuf et ses péages, dès l’adolescence', () => {
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
  /* LA RARE VENDUE ENFANT PERD UN CINQUIÈME DE SON ŒUF, et c'est la seule perte du barème : au
     bout de chaque âge suivant, elle se revend un peu plus que ce qu'elle a coûté. */
  eq('l’enfant perd deux mille pièces', rare[0], -2000);
  ok('tout ce qui suit est bénéficiaire, et de plus en plus',
     rare.slice(1).every((x, i) => x > 0 && (i === 0 || x > rare[i])), rare.join(' '));
  eq('au bout, trente-cinq mille', rare[4], 35000);

  /* LES COMMUNES SONT L'ÈRE D'APPRENTISSAGE : bénéficiaires à CHAQUE âge, œuf compris. */
  const commune = solde('crapaud', jeu.EGG_BY_KEY.commun.price);
  ok('la commune gagne dès l’enfant', commune.every(x => x > 0), commune.join(' '));
  const c0 = bete1('crapaud');
  eq('son premier péage', peage(c0, 1), 100);
  eq('et le dernier', peage(c0, 4), 10000);

  /* LE PREMIER PÉAGE D'UNE RARE VAUT TROIS ŒUFS : c'est lui qui verrouille la rare tombée par
     chance. Mais elle se revend quand même plus de quatre cents fois l'œuf commun dont elle
     sort — une bonne surprise ne coûte jamais plus qu'elle ne rapporte. */
  const r = bete1('loup');
  eq('le premier péage rare vaut trois œufs rares', peage(r, 1), 3 * jeu.EGG_BY_KEY.rare.price);
  ok('la rare trouvée se vend quatre cents fois son œuf commun',
     vente(r, 1) >= 400 * jeu.EGG_BY_KEY.commun.price, vente(r, 1));

  /* L'ÉCHELLE SE PROPAGE PAR `mult`, donc elle ne peut plus se retourner : ce qui vaut plus
     cher à l'œuf vaut plus cher sur pied, à tous les rangs. */
  const val = l => vente(bete1(l), 5);
  ok('la rare dépasse la commune', val('loup') > val('crapaud'));
  ok('l’épique dépasse la rare', val('kraken') > val('loup'));
  ok('la mythique dépasse l’épique', val('tyrannosaure') > val('kraken'));
  ok('la merveilleuse dépasse la mythique', val('behemoth') > val('tyrannosaure'));
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

scenario('enclos — une place de plus coûte quelque chose', () => {
  const jeu = neuf(); const s = jeu.state;

  /* UNE PLACE SE PAIE EN RENTE, PAS EN SECONDES. À 1,6 le vingt-quatrième enclos se remboursait
     en trois secondes de la rente d'une rare légende, et 2,1 l'avait porté à sept minutes. Le
     barème unique a tassé les pièces et la pente est recalée à 1,3 ; mais la rareté multiplie
     moins qu'avant, si bien que la place est plus chère : le vingt-quatrième enclos vaut plus
     d'une heure de la rente d'une rare légende. */
  eq('le premier enclos ne bouge pas', (s.pens = 1, jeu.penCost()), jeu.PEN_BASE);
  eq('ni le premier incubateur', (s.incubators = 1, jeu.incubCost()), jeu.INCUB_BASE);
  s.pens = 24;
  const rente = jeu.valeurMure('rare', jeu.AGES.length) / jeu.RENTE_H;
  ok('le 24e enclos vaut plus d’une heure de rente d’une rare légende', jeu.penCost() > rente * 3600,
     (jeu.penCost() / rente / 3600).toFixed(2) + ' h');

  /* LES DEUX ESCALIERS PARTAGENT LE MÊME MULTIPLICATEUR : une place est une place, qu'elle
     tienne une bête ou un œuf. Deux courbes différentes demanderaient d'expliquer pourquoi. Au
     millième près : chaque prix s'arrondit à la pièce. */
  s.pens = 10; s.incubators = 10;
  ok('les incubateurs suivent la même pente',
     Math.abs(jeu.penCost() / jeu.PEN_BASE - jeu.incubCost() / jeu.INCUB_BASE) < 1e-3 * jeu.penCost() / jeu.PEN_BASE,
     (jeu.penCost() / jeu.PEN_BASE).toFixed(4) + ' contre ' + (jeu.incubCost() / jeu.INCUB_BASE).toFixed(4));
});

scenario('enclos — l’Étable retirée est remboursée, pas confisquée', () => {
  /* Une prime achetée qui cesse d'exister est une dépense confisquée. Cent cinquante mille
     pièces sont dérisoires au moment où on les récupère ; le principe ne l'est pas. Elles sont
     rendues dans l'échelle d'alors, puis converties au barème unique avec le reste de la
     bourse : on compare donc à la même partie, sans l'Étable. */
  const v = neuf({ coins: 1000, primes: { etable: true, marchand: true } });
  const sans = neuf({ coins: 1000, primes: { marchand: true } });
  ok('le prix est rendu', v.state.coins > sans.state.coins, v.state.coins + ' contre ' + sans.state.coins);
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

scenario('niveau — chaque marche coûte un peu plus, et l’évolution garde le niveau', () => {
  /* LE PRIX D'UNE MARCHE : passer du niveau n au niveau n + 1 coûte (niveau max de l'âge + n)
     clics, comptés à force de base. De 16 à 29 à l'enfance, onze mille dix pour la vie entière. */
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 5;
  eq('le premier niveau coûte seize clics', jeu.coutPas(1, 1), 16);
  eq('le dernier de l’enfance vingt-neuf', jeu.coutPas(1, 14), 29);
  eq('l’enfance entière trois cent quinze', jeu.GROW[0], 315);
  eq('les âges', jeu.GROW.join(' '), '315 1190 3435 3190 2880');
  eq('une vie entière onze mille dix', jeu.CUM[jeu.CUM.length - 1], 11010);

  const c = bete(jeu, 'crapaud', 1, 0);
  for (let age = 1; age <= jeu.AGES.length; age++) {
    c.age = age;
    const nom = jeu.AGES[age - 1].nom, dernier = jeu.nivFin(age);
    const debut = jeu.bandFrom(c), fin = jeu.bandTo(c);
    c.p = debut;
    eq(nom + ' : on entre au dernier niveau de l’âge d’avant', jeu.niveau(c), jeu.nivDebut(age));
    eq(nom + ' : la première marche coûte niveau max + niveau', jeu.dureeNiveau(c), dernier + jeu.nivDebut(age));
    c.p = fin - 0.5;
    eq(nom + ' : juste avant la maturité, l’avant-dernier niveau', jeu.niveau(c), dernier - 1);
    ok(nom + ' : pas encore mûre', !jeu.estMur(c));
    c.p = fin;
    eq(nom + ' : le dernier niveau arrive avec la maturité', jeu.niveau(c), dernier);
    ok(nom + ' : mûre', jeu.estMur(c));
  }

  /* L'ÉVOLUTION NE DONNE PLUS DE NIVEAU : une commune évoluée reste au 15, et son passage au 16
     coûte 35 + 15 = 50 clics. SA TAILLE REPART DE ZÉRO, et pas sa taille à l'écran. */
  c.age = 1; c.p = jeu.bandTo(c); c.gras = 0;
  jeu.engraisser(c, 500);
  s.coins = 1e6; jeu.select('c:' + c.id);
  const echelle = jeu.visualScale(c);
  jeu.evolve(c);
  eq('évoluée, elle a changé d’âge', c.age, 2);
  eq('et reste au niveau 15', jeu.niveau(c), 15);
  eq('son passage au 16 coûte cinquante clics', jeu.dureeNiveau(c), 50);
  eq('sa taille repart de zéro', c.gras, 0);
  ok('mais elle ne rétrécit pas à l’écran', jeu.visualScale(c) >= echelle,
     jeu.visualScale(c) + ' contre ' + echelle);
  c.age = 1; c.p = jeu.bandTo(c) - jeu.dureeNiveau(c) / 2; jeu.refresh();
  const t = noeuds.get('stage-timer').textContent || '';
  ok('la minuterie annonce le niveau 15 avec la maturité, jamais un niveau 16', /niv\. 15 · mûre/.test(t), t);
});
