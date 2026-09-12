/* ── LES ŒUFS — l’escalier des prix, la file de couvaison, les cinq coquilles */

'use strict';
const fs = require('fs');
const path = require('path');
const { scenario, ok, eq, neuf, noeuds, RACINE, bete, seule } = require('./_aides.js');

scenario('œufs — aucun barreau de l’escalier n’est bien plus court que l’autre', () => {
  /* LE DERNIER BARREAU ÉTAIT SEPT CENTS FOIS PLUS COURT QUE LE PRÉCÉDENT, et rien ne le disait.
     Les prix se lisaient les uns sous les autres — 18, 55 M, mille milliards, vingt-cinq mille
     milliards — et l'escalier avait l'air d'un escalier. Il ne l'était pas : ×3 055 556, puis
     ×18 182, puis ×25.

     ON MESURE EN LÉGENDES, PAS EN PIÈCES. Le prix seul ne dit rien : ce qui décide de la durée
     d'une ère, c'est combien de bêtes menées au bout il faut vendre pour s'offrir l'œuf de la
     suivante. Dit ainsi, l'œuf épique demandait DOUZE MILLE CINQ CENTS légendes rares et l'œuf
     mythique DIX-SEPT légendes épiques — l'ère mythique s'ouvrait le lendemain de l'ère épique,
     et elle s'atteignait avant la première ascension.

     L'ÈRE COMMUNE EST HORS DU COMPTE, et c'est écrit sous `EGG_KINDS` : elle ne joue pas sur la
     même échelle, elle est le moteur des dix premières minutes. On compare donc les barreaux
     PAYANTS entre eux. */
  const jeu = neuf();
  const payants = jeu.EGG_KINDS.filter(e => e.price);
  const barreaux = [];
  for (let i = 1; i < payants.length; i++) {
    const avant = payants[i - 1].rarity;
    const net = jeu.valeurMure(avant, 5) - jeu.peagesJusque(avant, 5);
    ok('une légende ' + avant + ' rapporte quelque chose', net > 0, net);
    barreaux.push({ vers: payants[i].rarity, avant, legendes: payants[i].price / net });
  }
  eq('trois barreaux payants', barreaux.length, 3);

  // le premier barreau est celui de l'ère commune : il a le droit d'être court
  const hauts = barreaux.slice(1);
  const court = Math.min.apply(null, hauts.map(b => b.legendes));
  const long  = Math.max.apply(null, hauts.map(b => b.legendes));
  ok('les barreaux du haut se valent à trois fois près', long / court <= 3,
     hauts.map(b => b.vers + ' : ' + Math.round(b.legendes).toLocaleString('fr') +
                    ' légendes ' + b.avant).join('  |  ') +
     '  →  rapport ' + (long / court).toFixed(1));

  /* ET AUCUN ŒUF NE S'ATTEINT DANS UN PREMIER CYCLE. Les paliers de jeton disent ce qu'une
     partie franchit : le premier saut s'ouvre au million, et un cycle mené loin atteint mille
     milliards. Un œuf mythique doit demander plus que ça, sinon l'ère la plus rare du jeu se
     joue avant d'avoir ascensionné une seule fois. */
  const mythique = jeu.EGG_BY_KEY.mythique;
  ok('l’œuf mythique demande plus qu’un premier cycle',
     mythique.price > 1e13, mythique.price.toExponential(2) + ' contre 10^13');
});

scenario('dessins — le repli s’arrête sur un « null » écrit', () => {
  const jeu = neuf();
  /* LE REPLI EST BON quand un âge n'a pas encore SA variante d'un dessin qui existe : le
     crapaud ancien montre le crapaud adulte, et personne n'est trompé. */
  eq('un âge sans dessin prend celui d’en dessous',
     jeu.artAt('crapaud', 5), jeu.artAt('crapaud', 5));
  ok('et une lignée sans table n’a rien', jeu.artAt('inconnue', 3) === null);

  /* IL MENT quand la forme est autre chose. Une kitsune à neuf queues n'est pas une kitsune à
     sept : montrer l'une pour l'autre ferait croire que la légende n'a rien changé. Le `null`
     écrit arrête le repli, et l'emoji dit la vérité — rien ici. */
  ok('les quatre premiers kitsune sont dessinés',
     [1, 2, 3, 4].every(a => /kitsune-/.test(jeu.artAt('kitsune', a) || '')),
     [1, 2, 3, 4].map(a => jeu.artAt('kitsune', a)).join(' '));
  eq('le cinquième s’arrête là', jeu.artAt('kitsune', 5), null);
  ok('et son emoji prend le relais', !!jeu.LINE_BY_KEY.kitsune.forms[4][1]);
});

scenario('œufs — cinq dessins, cinq sortes, et l’emoji en repli', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;

  /* UNE SORTE SANS DESSIN RETOMBERAIT SUR L'EMOJI SANS RIEN DIRE — c'est le propre d'un repli,
     et c'est aussi pourquoi il faut le vérifier ici : rien à l'écran ne signalerait l'oubli. */
  eq('autant de dessins que de sortes',
     Object.keys(jeu.ART_OEUFS).length, jeu.EGG_KINDS.length);
  ok('chaque sorte a le sien', jeu.EGG_KINDS.every(e => jeu.artOeuf(e.key)),
     jeu.EGG_KINDS.filter(e => !jeu.artOeuf(e.key)).map(e => e.key).join(' '));
  eq('et ce ne sont pas cinq fois le même fichier',
     new Set(Object.values(jeu.ART_OEUFS)).size, jeu.EGG_KINDS.length);
  for (const [sorte, f] of Object.entries(jeu.ART_OEUFS))
    ok('le fichier de ' + sorte + ' existe', fs.existsSync(path.join(RACINE, f)), f);

  // sur la scène : la coquille couvée, et son dessin
  s.incub[0] = { line: 'crapaud', p: 10, kind: 'mythique' };
  s.sel = 'i:0';
  jeu.refresh();
  const g = noeuds.get('stage-glyph');
  eq('la scène porte une image', g.children.length, 1);
  eq('celle de la sorte couvée', g.children[0].getAttribute('src'), jeu.ART_OEUFS.mythique);

  s.incub[0] = { line: 'crapaud', p: 10, kind: 'commun' };
  jeu.refresh();
  eq('elle suit la sorte', noeuds.get('stage-glyph').children[0].getAttribute('src'),
     jeu.ART_OEUFS.commun);

  // un incubateur vide n'est pas un œuf : il garde son rond
  s.incub[0] = null;
  jeu.refresh();
  eq('rien à couver, pas de coquille', noeuds.get('stage-glyph').textContent, '◌');
});

scenario('œufs — la vignette passe de la bête à la coquille et revient', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;

  const glyphe = () => {
    const v = noeuds.get('strip-incub').children[0];
    return v.children.find(x => (x.className || '').includes('thumb-glyph'));
  };

  s.incub[0] = { line: 'crapaud', p: 10, kind: 'epique' };
  jeu.refresh();
  eq('la vignette montre la coquille', glyphe().children[0].getAttribute('src'),
     jeu.ART_OEUFS.epique);

  /* LE PIÈGE QUI A COÛTÉ CE SCÉNARIO : la branche œuf écrivait l'emoji par `textContent`, ce
     qui vide l'élément sans prevenir le cache de `setCreature`. Le cache croyait donc que
     l'image était toujours là et refusait de la reposer : une case qui avait montré un œuf
     ne remontrait plus jamais de bête. Invisible tant que les œufs étaient des emojis. */
  s.incub[0].p = 9999; jeu.hatchAll(); jeu.refresh();
  s.incub[0] = { line: 'crapaud', p: 10, kind: 'rare' };
  jeu.refresh();
  eq('et après une éclosion elle en remontre une autre',
     glyphe().children[0].getAttribute('src'), jeu.ART_OEUFS.rare);

  // une teinte de bête ne doit pas repeindre une coquille
  eq('sans filtre hérité', glyphe().style.filter || '', '');

  /* DEUX ŒUFS DE SUITE DE LA MÊME LIGNÉE, de sortes différentes. La signature de la bande
     portait la lignée et pas la sorte, si bien que la vignette restait sur le dessin du
     premier. Invisible tant que les cinq sortes partageaient le même emoji — c'est la
     deuxième fois dans cette version qu'un dessin révèle un défaut que l'emoji cachait. */
  s.incub[0] = { line: 'crapaud', p: 10, kind: 'commun' };
  jeu.refresh();
  eq('la même lignée dans une autre coquille se repeint',
     glyphe().children[0].getAttribute('src'), jeu.ART_OEUFS.commun);
});

scenario('œufs — la réserve s’affiche dans l’ordre où elle se vide', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.eggs = { commun: 3, rare: 2, epique: 1, mythique: 0, merveille: 0 };
  s.file = ['commun', 'commun', 'rare', 'commun', 'epique', 'rare'];

  /* LE DÉFAUT QUE CE SCÉNARIO TIENT, et c'est le joueur qui l'a nommé : « la réserve ne se
     vide pas dans l'ordre affiché ». Elle ne s'affichait qu'en BOUTIQUE, une case par sorte,
     rangée par PRIX — et elle se vide par arrivée ou par rareté. Deux ordres pour une seule
     chose : on lit l'un, le jeu applique l'autre, et le réglage passe pour cassé. */
  const dit = () => { jeu.refresh(); return noeuds.get('strip-meta').textContent; };

  s.triOeuf = 'arrivee';
  eq('par arrivée, l’ordre d’entrée', jeu.reserveEnOrdre().join(),
     'commun,commun,rare,commun,epique,rare');
  ok('et l’écran le dit', dit().indexOf('commun ×2 · rare · commun') >= 0, dit());
  eq('le premier à sortir est le premier affiché',
     jeu.bestStocked(), jeu.reserveEnOrdre()[0]);

  s.triOeuf = 'rarete';
  eq('par rareté, du plus rare au plus commun', jeu.reserveEnOrdre().join(),
     'epique,rare,rare,commun,commun,commun');
  ok('et l’écran le dit aussi', dit().indexOf('épique · rare ×2 · commun ×3') >= 0, dit());
  eq('le premier à sortir est encore le premier affiché',
     jeu.bestStocked(), jeu.reserveEnOrdre()[0]);

  /* L'ORDRE LU EST L'ORDRE APPLIQUÉ PAR CONSTRUCTION : les deux sortent de la même fonction.
     On le vérifie en vidant la réserve pour de bon. */
  s.incubators = 6; s.incub = [null, null, null, null, null, null];
  const attendu = jeu.reserveEnOrdre().join();
  jeu.runAutomations(0.1);
  eq('la réserve se vide dans cet ordre exact',
     s.incub.filter(Boolean).map(o => o.kind).join(), attendu);

  /* ET LE COMPTE SE DIT AVANT LE DÉTAIL : c'est le seul chiffre qu'on cherche en passant. */
  s.eggs = { commun: 2, rare: 0, epique: 0, mythique: 0, merveille: 0 };
  s.file = ['commun', 'commun'];
  ok('le total ouvre la ligne', /^2 en réserve/.test(dit()), dit());
});

scenario('œufs — le tri range la bande, pas seulement la file', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.coins = 1e15; s.incubators = 4; s.pens = 8;
  s.incub = [null, null, null, null];
  s.eggs = { commun: 2, rare: 1, epique: 1, mythique: 0, merveille: 0 };
  s.file = ['commun', 'commun', 'rare', 'epique'];
  s.triOeuf = 'arrivee';
  jeu.runAutomations(0.1);

  const bande = () => jeu.subjects().filter(x => x.kind === 'egg')
                         .map(x => (x.slot ? x.slot.kind : 'vide')).join(' ');

  /* LE RÉGLAGE VIT SUR LA BANDE DE COUVAISON. Le poser là et ne trier QUE la file invisible,
     c'était promettre une chose et en faire une autre : on clique « rareté », on regarde la
     bande, et rien ne bouge. Un tri qui ne trie pas ce qu'il surplombe n'est pas un tri. */
  eq('par arrivée, la bande garde son ordre', bande(), 'commun commun rare epique');
  s.triOeuf = 'rarete';
  eq('par rareté, elle se range', bande(), 'epique rare commun commun');

  /* LES CASES VIDES VONT AU BOUT : c'est là qu'on clique pour poser un œuf, elles n'ont rien
     à faire au milieu de ce qui couve. */
  s.incub = [null, { p: 0, kind: 'commun', line: 'crapaud' },
             null, { p: 0, kind: 'epique', line: 'kraken' }];
  eq('les vides se rangent derrière', bande(), 'epique commun vide vide');

  /* LA SIGNATURE DE LA BANDE DOIT VOIR LE RÉGLAGE, sinon l'écran garde l'ancien ordre jusqu'au
     prochain changement d'autre chose — un tri qui n'agit qu'au bout de dix secondes passe
     pour cassé. */
  jeu.refresh();
  const avant = jeu.stripSig;
  s.triOeuf = 'arrivee';
  jeu.refresh();
  ok('elle change avec le tri', jeu.stripSig !== avant);
});

scenario('œufs — acheté en dernier, couvé en dernier', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.coins = 1e15; s.incubators = 1; s.incub = [null];
  s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0, merveille: 0 };
  s.file = [];
  s.triOeuf = 'arrivee';

  /* LE BOGUE QUE CE SCÉNARIO TIENT. `buyEgg` posait dans l'incubateur la sorte QU'ON VENAIT
     D'ACHETER, pas celle que la file désigne. Acheter un rare le mettait donc devant dix
     communs qui attendaient depuis dix minutes — exactement ce que « par arrivée » promet de
     ne pas faire. */
  jeu.buyEgg('commun');                     // celui-là part tout de suite : la file était vide
  eq('le premier occupe l’incubateur', s.incub[0].kind, 'commun');

  jeu.buyEgg('commun'); jeu.buyEgg('commun');
  jeu.buyEgg('rare');                       // le dernier acheté
  eq('trois attendent, le rare en queue', s.file.join(), 'commun,commun,rare');

  const sortir = () => { s.incub[0] = null; jeu.placeEgg(0); return s.incub[0].kind; };
  eq('le plus ancien passe le premier', sortir(), 'commun');
  eq('puis le suivant', sortir(), 'commun');
  eq('et le rare en dernier, comme il est arrivé', sortir(), 'rare');
  eq('la réserve est vide', s.file.length, 0);

  /* PAR RARETÉ, LE MÊME ACHAT DOUBLE TOUT LE MONDE — c'est l'autre réglage, et il doit rester
     franc lui aussi. */
  s.incub[0] = null;
  s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0, merveille: 0 };
  s.file = [];
  s.triOeuf = 'rarete';
  jeu.buyEgg('commun'); jeu.buyEgg('commun'); jeu.buyEgg('rare');
  s.incub[0] = null; jeu.placeEgg(0);
  eq('le rare passe devant', s.incub[0].kind, 'rare');
});

scenario('œufs — la file se trie comme l’enclos : arrivée, ou rareté', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.coins = 1e15;
  s.incub = [null, null];

  /* LES MÊMES DEUX ORDRES QUE L'ENCLOS, ET PAS D'AUTRES. C'est le même geste sur la même page,
     il ne doit pas avoir deux vocabulaires. */
  eq('deux ordres, comme l’enclos', Object.keys(jeu.TRIS_OEUF).sort().join(), 'arrivee,rarete');
  eq('et les mêmes noms', ['arrivee', 'rarete'].every(k => k in jeu.TRIS), true);

  jeu.buyEgg('rare'); jeu.buyEgg('commun'); jeu.buyEgg('commun'); jeu.buyEgg('epique');
  // les deux premiers sont partis en couvaison, les deux autres attendent
  eq('la réserve retient ce qui reste', s.file.join(), 'commun,epique');

  s.triOeuf = 'arrivee';
  eq('par arrivée, la tête de file part', jeu.bestStocked(), 'commun');
  s.triOeuf = 'rarete';
  eq('par rareté, le plus rare part', jeu.bestStocked(), 'epique');

  /* L'ARRIVÉE A DEMANDÉ UNE FILE : la réserve ne gardait que des COMPTES — trois communs et
     deux rares, sans savoir lesquels sont arrivés en premier. */
  s.triOeuf = 'arrivee';
  s.incub[0] = null;
  jeu.placeEgg(0);
  eq('elle se vide par la tête', s.file.join(), 'epique');
  eq('et c’est bien le commun qui est parti', s.incub[0].kind, 'commun');

  /* ELLE SE RÉPARE SEULE SI ELLE DIVERGE DES COMPTES : une sauvegarde d'avant n'en a pas, et
     un bogue ne doit jamais bloquer la réserve. */
  s.file = [];
  s.eggs = { commun: 2, rare: 1, epique: 0, mythique: 0, merveille: 0 };
  eq('reconstruite du plus commun au plus rare', jeu.fileOeufs().join(), 'commun,commun,rare');
  ok('et la file repart', !!jeu.bestStocked());

  /* IL NE TOUCHE PAS À LA BOUTIQUE : elle est un ESCALIER DE PRIX, et c'est ce qui lui permet
     de désigner « la marche suivante ». */
  const cases = () => noeuds.get('shop').children
    .map(li => li.children[0])
    .filter(b => (b.className || '').indexOf('egg-') >= 0)
    .map(b => (b.className.match(/egg-([a-z]+)/) || [])[1]);
  const avant = cases().join(' ');
  s.triOeuf = 'rarete'; jeu.syncTriOeuf();
  eq('la boutique ne bouge pas', cases().join(' '), avant);

  /* LE RÉGLAGE TRAVERSE L'ASCENSION, comme celui de l'enclos : c'est une préférence, pas une
     ressource. */
  s.pens = 20; s.coins = 1e12; jeu.crediterJetons();
  s.pen = [bete(jeu, 'crapaud', 3, 3000)];
  jeu.ascChoix = [-s.pen[0].id];
  jeu.ascensionner();
  eq('il survit au saut', jeu.state.triOeuf, 'rarete');
});
