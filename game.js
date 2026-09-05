/* Éclosion — jalon 0
   Prototype jetable : tout tourne dans le navigateur, sauvegarde en localStorage.
   Le vrai jeu aura un serveur qui fait autorité — ce fichier n'est pas destiné à grandir. */

'use strict';

/* ── Version ─────────────────────────────────────────────────────────────────────
   Trois nombres, et le mot « alpha » devant tant que le jeu n'est pas sorti :

     alpha MAJEUR.MINEUR.CORRECTIF

   CORRECTIF  un sprite de plus, un bug corrigé, un chiffre d'équilibrage retouché
   MINEUR     une nouveauté franche, mais qui tient dans le jeu tel qu'il est
   MAJEUR     un morceau de jeu qui n'existait pas, et qui rebat les cartes du reste

   Un nombre qui monte remet à zéro ceux qui le suivent. C'est l'unique copie du numéro
   dans tout le projet : on la change dans le commit qui apporte la modification.

   QUAND LE MOT CHANGE. « alpha » tombe le jour où TROIS choses sont en place ensemble :
   la pension, la fusion des cartes, et les premières merveilleuses. Ce n'est pas une date,
   c'est une définition — et elle tient parce que ces trois-là forment une boucle complète :
   on élève pour reproduire, on reproduit pour obtenir ce qui ne s'achète pas, et l'album
   donne enfin une raison de garder les doublons.

   Tant qu'il en manque une, le jeu est un très bon prototype de sa moitié avant.

   `alpha` n'a jamais été un quatrième nombre. Les nombres sont repartis de 1 avec la bêta —
   une seule fois, et le README dit pourquoi. La série 2 est ouverte par L'ATELIER DE FORGE :
   une pièce de plus dans le jeu, et une règle qui rebat l'album entier puisqu'une carte à
   trois étoiles y coûte désormais neuf cartes au lieu de la seule poussière. */
const VERSION = 'beta 4.23.1';

/* ─────────────────────────────────────────────
   Données — tout ce qui s'équilibre est ici.
   ───────────────────────────────────────────── */

/* ── Les cinq âges ────────────────────────────────────────────────────────────
   Une bête a UNE vie et un seul compteur : le niveau, de 1 à 100, qui ne redescend
   jamais. Les âges sont des tranches sur cette échelle et l'évolution est le péage
   entre deux tranches : arrivée au dernier niveau de son âge, la bête est MÛRE, son
   niveau se bloque là, et seul le paiement le débloque.

   Rien ne repart donc jamais de zéro — ni le niveau, ni le nom, ni la taille à l'écran.
   Avant, une bête adulte redevenait un enfant au palier suivant et rétrécissait de moitié
   à l'écran, alors que les cinq formes d'une lignée racontaient déjà une seule croissance
   continue : le juvénile d'une forme était le dessin de la précédente. C'était le
   vocabulaire qui bouclait, pas les images.

   Le temps par niveau triple à peu près à chaque âge — 3 s, 9 s, 30 s, 3 min, 24 min.
   C'est ce qui fait que l'enfance défile pendant que la légende se mérite. */
/* Les cinq noms disent UNE SEULE CHOSE : le temps qui passe. Les deux derniers parlaient
   auparavant de taille — « géant », « titan » — et entraient en collision avec les rangs
   d'engraissement, qui parlent de taille eux aussi : d'où le « titan titanesque », qui
   demandait une note pour s'expliquer. Une bête vieillit, elle ne grossit pas d'un âge.

   `fem` marque le genre du NOM D'ÂGE, pas celui de la bête : « légende » est féminin, donc
   son rang de taille s'accorde — une légende démesurée, un ancien démesuré. */
/* L'OUVERTURE ÉTAIT EXPÉDIÉE. Mesuré au banc sur un joueur qui clique quatre fois par
   seconde : première vente à trente secondes, force du clic à une minute, couveuse à une
   minute vingt. Le jeu passait en pilote automatique avant qu'on ait compris ce qu'on
   automatisait, et les cent premiers clics — les seuls où l'on regarde vraiment une bête —
   duraient une demi-minute.

   Deux leviers, tirés ensemble : ON GAGNE MOINS, ET ON CLIQUE PLUS.

   L'âge enfant passe de quatre-vingt-dix à cent cinquante secondes — dix clics par niveau au
   lieu de six — et une commune mûre ne vaut plus quarante pièces mais trente. Avec l'œuf à
   dix-huit, la marge d'un cycle tombe de vingt-huit à douze : deux fois et demie moins, pour
   une fois et demie plus de travail.

RIEN D'AUTRE NE BOUGE, et c'est délibéré. Une première version resserrait aussi l'adolescent,
   et la mesure a tranché : au bout d'une demi-heure le joueur n'avait toujours qu'un enclos.
   Ces tables se multiplient entre elles — ralentir deux âges ne ralentit pas deux fois, ça
   ralentit tout ce qui suit, indéfiniment. L'adolescent demandait déjà neuf clics par niveau
   et l'adulte trente : le problème n'était que dans les cent premiers clics.

   Ce qu'on ne touche pas, et pourquoi : le PRIX DES AUTOMATES. Ils ne sont pas trop bon marché
   en eux-mêmes — c'est le revenu qui arrivait trop vite. Les monter en plus aurait déplacé le
   mur sans changer le rythme. */
const AGES = [
  { nom: 'enfant',     niv: 15,  grow: 150,   value: 30 },
  { nom: 'adolescent', niv: 35,  grow: 180,   value: 500 },
  { nom: 'adulte',     niv: 65,  grow: 900,   value: 6000 },
  { nom: 'ancien',     niv: 85,  grow: 3600,  value: 80000 },
  { nom: 'légende',    niv: 100, grow: 21600, value: 1500000, fem: true },
];
const NIV_MAX = AGES[AGES.length - 1].niv;

const GROW       = AGES.map(a => a.grow);                     // croissance d'une tranche entière
const VALUE      = AGES.map(a => a.value);                    // ce que vaut une bête mûre de cet âge
const EVOLVE     = [200, 3000, 40000, 600000, null];          // le péage vers l'âge suivant

// Croissance cumulée au bout de chaque âge : c'est la borne où le niveau se bloque.
const CUM = GROW.reduce((a, g) => a.concat([(a[a.length - 1] || 0) + g]), []);

/* Le premier niveau d'un âge vaut 15 % d'une bête mûre, et la valeur monte géométriquement
   d'un niveau au suivant — entre +7 % et +14 % selon la longueur de la tranche. Aucun
   niveau n'est mort : la barre qui se remplit rapporte toujours quelque chose. */
const NIV_MIN_MULT = 0.15;

const INCUB_BASE = 150;
const PEN_BASE   = 400;
/* ── CE QUE COÛTE UNE PLACE DE PLUS ────────────────────────────────────────────
   1,6 RENDAIT LES PLACES GRATUITES, ET C'ÉTAIT MESURABLE : un enclos se remboursait en une
   FRACTION DE SECONDE à tous les paliers. Le vingt-quatrième coûtait 19,8 millions quand une
   rare légende en rapporte douze milliards l'heure — trois secondes de rente. Une ressource
   qu'on rachète plus vite qu'on ne clique n'est pas une ressource, c'est une formalité.

   À 2,1, le premier enclos ne bouge pas d'une pièce, le cinquième coûte trois fois plus, et le
   vingt-quatrième cinq cents fois plus. C'est la forme que demande le défaut : ce n'est pas le
   début qui était trop bon marché, c'est la suite qui ne montait pas.

   CE QUE ÇA NE RÈGLE PAS, et il faut l'écrire ici pour ne pas y revenir en croyant à un
   oubli : la rente suit la RARETÉ, qui multiplie par 450 000 de la commune à l'épique, quand
   le prix d'une place suit une géométrique de 2,1. Aucun multiplicateur ne rattrape ça — au
   mieux on rend la place chère DANS UNE ÈRE. Le vrai correctif serait de borner la rente, et
   il a été refusé au plan le 5 septembre 2026, en connaissance de cause. */
const SLOT_MULT  = 2.1;

/* Deux axes indépendants, à ne pas confondre :
   l'ÂGE est la progression d'une bête au fil de sa vie (têtard → crapaud → …),
   la RARETÉ est la lignée dont elle est issue et ne change jamais.

   Les deux axes sont calés pour s'ENCHAÎNER plutôt que se concurrencer : le multiplicateur
   d'une rareté fait sauter à peu près deux âges, et le coût d'évolution suit le même
   multiplicateur. Monter une rare coûte donc vingt-cinq fois ce que coûte une commune —
   on ne s'y met qu'une fois la ferme commune arrivée à maturité. Chaque rareté est une ère,
   pas un bonus.

   ── LE MULTIPLICATEUR N'EST PLUS CHOISI, IL SE DÉDUIT DU PRIX DE L'ŒUF ──
   `mult` porte À LA FOIS la revente et le péage — `valeurBase` et `peageBase` le lisent tous
   les deux. C'est ce qui permet de tenir une ère entière avec un seul nombre : changer le prix
   de l'œuf sans toucher au reste ferait mentir la moitié de l'échelle.

   La règle qui le fixe tient en une phrase : UNE BÊTE ACHETÉE EST À L'ÉQUILIBRE QUAND ELLE
   EST MÛRE À L'ÂGE ADULTE. On a payé l'œuf et les deux premiers péages ; elle vaut exactement
   ça. Ni perte ni gain — la décision d'aller plus loin se prend là, sur une bête qui ne doit
   plus rien.

       mult = prix de l'œuf / (VALEURS_RANG[2] − PEAGES_RANG[0] − PEAGES_RANG[1])
            = prix de l'œuf / 2 200 000

   L'ÉPIQUE VAUT UN BILLION, et c'est de là que tout part : 1 000 000 000 000 / 2 200 000
   donne 454 545. La mythique suit d'un cran de ×25, comme les crans précédents, ce qui pose
   son œuf à vingt-cinq billions. La merveilleuse vaut exactement ce que vaut une mythique —
   c'est un cran de rareté, pas de puissance, et la règle est écrite plus bas.

   UNE SEULE EXCEPTION, ET ELLE EST VOULUE : la COMMUNE ne joue pas sur la même échelle
   (`VALUE`/`EVOLVE` et non `VALEURS_RANG`) et son œuf à dix-huit pièces la laisse largement
   bénéficiaire dès l'âge adulte. C'est l'ère d'apprentissage : on n'y apprend pas à perdre de
   l'argent. La RARE en était une seconde — son œuf à cinquante millions, hérité de la `4.8.0`,
   la laissait bénéficiaire de 7 % — et elle est tombée en `4.12.1` : 25 × 2 200 000 = 55 M.

   CE QUE ÇA FAIT AU SAUT D'ÈRE, et c'est le but : de la rare à l'épique, le multiplicateur
   passe de 25 à 454 545. Une épique tombée par chance d'un œuf rare — une sur mille — naît
   donc dans une ère qu'elle ne peut pas payer. Son premier péage vaut 22,7 milliards quand une
   rare légende s'en vend un seul : vingt-trois bêtes de l'ère précédente, menées au bout,
   pour la faire passer de l'enfance à l'adolescence. Le mur est là, et il est voulu.

   `plafond` ne sert qu'aux cartes de l'album : c'est ce qu'une capsule de cette rareté peut
   donner au mieux. Il monte bien plus doucement que `mult` — une carte mythique doit valoir
   mieux qu'une commune, pas quinze mille fois mieux. */
const RARITY = {
  commune:  { name: 'commune',  plur: 'communes',  mult: 1,     rank: 0, plafond: 1 },
  rare:     { name: 'rare',     plur: 'rares',     mult: 25,    rank: 1, plafond: 1.6 },
  epique:   { name: 'épique',   plur: 'épiques',   mult: 454545,   rank: 2, plafond: 2.5 },
  mythique: { name: 'mythique', plur: 'mythiques', mult: 11363636, rank: 3, plafond: 4 },
  /* LA MERVEILLEUSE VAUT EXACTEMENT CE QUE VAUT UNE MYTHIQUE, et c'est la décision la plus
     importante du rang. Elle est un cran de RARETÉ, pas un cran de PUISSANCE : elle ne rapporte
     pas plus, ne se vend pas plus cher, et sa carte ne plafonne pas plus haut.

     Sans cette règle, la pension redeviendrait une stratégie d'argent — tout le travail de la
     3.0.0 pour qu'elle n'en soit pas une tomberait sur la première merveille éclose. Et le rang
     le plus haut du jeu se mettrait à peser sur l'équilibrage de tout le reste.

     Ce qu'elle a que les autres n'ont pas tient en une phrase : AUCUN ŒUF NE LA DONNE. */
  merveilleuse: { name: 'merveilleuse', plur: 'merveilleuses', mult: 11363636, rank: 4, plafond: 4,
                  secret: true },
};

/* ── UN RANG SECRET N'EXISTE PAS TANT QU'ON N'EN A PAS VU UN ───────────────────
   La cinquième rareté fuitait par cinq endroits à la fois : une section de collection vide
   avec ses cases grises, un dénominateur gonflé de quinze formes, un trophée qui expliquait la
   recette en toutes lettres, une ligne de statistiques « 0 / 2 », et trois menus du marchand
   qui parlaient de bêtes que personne n'avait jamais vues.

   Aucun de ces cinq n'est un spoiler grave pris seul. Ensemble ils disent tout : qu'il existe
   un cinquième rang, qu'il compte deux lignées, qu'il ne s'achète pas, et qu'il passe par la
   pension. Il ne restait à découvrir que le nom des bêtes.

   ON NE CACHE PAS LA RÉCOMPENSE, ON CACHE LA QUESTION. Un jeu qui affiche dix cases vides
   transforme une trouvaille en case à cocher : le joueur sait qu'il lui manque quelque chose
   et cherche comment l'obtenir. Un jeu qui n'affiche rien laisse la première Kitsune arriver
   sans prévenir — et c'est le seul moment que ce rang a à offrir.

   Ce qui reste visible, et qui suffit : la phrase du nid dit « et peut-être autre chose » sur
   un couple qui porte une recette. Elle ne nomme rien, ne compte rien, ne promet rien.

   La règle est portée par la TABLE et non par un `if` sur « merveilleuse » : un rang secret
   futur sera secret sans qu'on ait à retrouver les cinq endroits. */
/* AVOIR VU UNE RARETÉ, ET LA CONNAÎTRE, SONT DEUX QUESTIONS DIFFÉRENTES. `rareteConnue` ne
   parle que du rang SECRET : toutes les autres raretés sont connues d'avance, puisque la
   boutique les nomme. `rareteVue` demande si l'on en a réellement croisé une, et c'est ce
   qu'il faut pour garder une prime qui n'agit que sur elle. */
const rareteVue = cle =>
  LINES.some(l => l.rarity === cle && AGES.some((a, i) => state.seen[l.key + ':' + (i + 1)]));
const rareteConnue = cle => !RARITY[cle].secret || rareteVue(cle);

const raretesConnues = () => Object.keys(RARITY).filter(rareteConnue);
// les formes que la collection a le droit de compter : celles des rangs qu'on connaît
const formesVisibles = () =>
  LINES.filter(l => rareteConnue(l.rarity)).length * AGES.length;

// du plus rare au plus commun — l'ordre du tirage, et il se refait seul si un rang s'ajoute
const RARETES_HAUT_EN_BAS = Object.keys(RARITY).sort((a, b) => RARITY[b].rank - RARITY[a].rank);

/* UNE VALEUR PAR RARETÉ, LA TABLE FAISANT FOI. Les trois consignes du marchand — l'âge de
   vente, la taille exigée, l'âge d'évolution — étaient écrites en clair à sept endroits, avec
   les quatre raretés en dur à chaque fois. Ajouter la cinquième laissait donc `undefined`
   partout où l'un des sept avait été oublié : un menu vide, une consigne muette, et rien qui
   lève. Un rang ajouté à RARITY se propage maintenant tout seul. */
const parRarete = v => Object.fromEntries(Object.keys(RARITY).map(k => [k, v]));

// « a, b et c » plutôt que « a, b, c » : les notes doivent se lire à voix haute.

/* Un œuf par rareté, et chacun ne peut donner QUE sa rareté ou celle juste au-dessus.
   C'est ce qui rend la progression séquentielle : on n'atteint une mythique qu'en achetant
   des œufs épiques, qu'on ne s'offre qu'avec l'argent des rares. Pas de raccourci.

   LA MONTÉE D'UN CRAN EST À 1 SUR 1 000, la même à toutes les raretés. Elle valait 3,5 %,
   12 % et 25 % : à ce compte-là, quatre œufs épiques suffisaient à sortir une mythique, et
   la montée n'était plus un coup de chance mais la façon normale de changer d'ère. Elle
   redevient un cadeau. Le vrai chemin vers l'ère suivante est donc la BOURSE — on s'offre
   un œuf plus rare quand on peut se le payer — et non la loterie.

   LE PRIX SUIT UNE RÈGLE, il n'est pas choisi : un œuf coûte une fraction du bénéfice net
   d'une bête de l'ère précédente menée à la légende — sa valeur, moins tous ses péages. Le
   coefficient était de 0,7 ; il est passé à 0,35, c'est-à-dire que chaque œuf payant a été
   divisé par deux.

   La raison n'est pas dans l'ère elle-même mais dans l'ascension : une partie ne se joue
   plus une fois, elle se rejoue. L'ère commune tenait trois heures et demie — un tempo qui
   passe une fois et devient une corvée à la deuxième. Diviser les prix par deux ouvre
   chaque ère à peu près deux fois plus tôt, sans toucher à aucune mécanique.

   L'ŒUF COMMUN NE BOUGE PAS. Il se revend 40 à maturité, et cette marge de 3,3× est le
   moteur des dix premières minutes — la seule chose du jeu qui fonctionne sans rien avoir
   acheté. La règle d'or tient toujours : tous les œufs payants se remboursent à l'âge
   ancien, jamais avant. */
const EGG_KINDS = [
  /* Dix-huit et non douze : c'est l'autre moitié du resserrement de l'ouverture. Une commune
     mûre en rend trente, donc un cycle laisse douze pièces au lieu de vingt-huit. La couvaison
     passe à quarante-cinq secondes pour la même raison — quarante-cinq clics avant de voir
     ce qui sort, au lieu de trente. */
  { key: 'commun', name: 'Œuf commun', price: 18, glyph: '🥚', rarity: 'commune',
    hatch: 45, odds: { commune: 0.999, rare: 0.001 },
    dit: 'C’est par là que tout le monde commence.' },
  /* ── L'ESCALIER DES ŒUFS A ÉTÉ REMONTÉ D'UN CRAN ──
     L'œuf rare valait 300 000, soit SIX MINUTES d'une ferme commune mûre — mesuré. À ce
     prix-là il ne se réfléchissait pas, il s'achetait par distraction, et l'ère commune
     s'arrêtait le jour où elle commençait à fonctionner : UNE seule commune menée à l'âge 5
     se vend 371 644, donc une bête suffisait à ouvrir l'ère rare.

     Il vaut cinquante-cinq millions, soit une quinzaine d'heures de cette même ferme.

     CINQUANTE-CINQ ET NON CINQUANTE, DEPUIS QUE LA RÈGLE EXISTE. Le prix a été posé à la main
     en `4.8.0`, avant que le multiplicateur ne se déduise du prix de l'œuf ; il laissait donc
     la rare bénéficiaire de 7 % à l'âge adulte là où toutes les autres sont à l'équilibre.
     Sept pour cent ne se voient pas en jouant, mais une règle qui souffre une exception cesse
     d'en être une : le prochain à lire la table ne saurait plus si 2 200 000 est la règle ou
     une coïncidence. 25 × 2 200 000 = 55 000 000, et la table n'a plus d'exception qu'à
     l'ère commune, qui ne joue pas sur la même échelle. */
  { key: 'rare', name: 'Œuf rare', price: 55000000, glyph: '🥚', rarity: 'rare',
    hatch: 180, odds: { rare: 0.999, epique: 0.001 },
    dit: 'Le premier qui se réfléchit avant de l’acheter.' },
  /* UN BILLION, ET C'EST LE PRIX QUI COMMANDE L'ÈRE. Il valait 1,25 milliard, soit une
     poignée de rares légendes : l'ère épique s'ouvrait avant que l'ère rare ait été jouée.
     À mille milliards, elle demande une ferme rare entière qui tourne — et le multiplicateur
     de la rareté se déduit de ce prix, si bien que la bête achetée est exactement à
     l'équilibre le jour où elle est mûre à l'âge adulte. Voir la règle sous `RARITY`. */
  { key: 'epique', name: 'Œuf épique', price: 1000000000000, glyph: '🥚', rarity: 'epique',
    hatch: 720, odds: { epique: 0.999, mythique: 0.001 },
    dit: 'On n’en achète pas par distraction.' },
  // vingt-cinq billions : le cran de ×25 de l'échelle, appliqué au prix comme au reste
  { key: 'mythique', name: 'Œuf mythique', price: 25000000000000, glyph: '🥚', rarity: 'mythique',
    hatch: 2700, odds: { mythique: 1 },
    dit: 'Il en sort des dieux. Prends ton après-midi.' },
  /* CELUI-CI NE S'ACHÈTE PAS, et c'est toute la définition du rang. Il n'a pas de prix, donc il
     ne paraît ni en boutique, ni dans le menu de l'acheteur, ni dans l'escalier des
     dévoilements — trois listes qui se filtrent sur `price` et non sur une liste d'exceptions.

     Il existe quand même comme sorte d'œuf, parce que la pension dépose ce qu'elle pond dans la
     RÉSERVE ORDINAIRE : le plafond, le placement automatique et l'incubateur n'ont ainsi rien à
     apprendre. Une merveille couve comme le reste, seulement plus longtemps. */
  { key: 'merveille', name: 'Œuf de merveille', price: null, glyph: '🥚', rarity: 'merveilleuse',
    hatch: 5400, odds: { merveilleuse: 1 },
    dit: 'Aucune boutique n’en vend. Celui-là, tu l’as fait naître.' },
];

const EGG_BY_KEY = Object.fromEntries(EGG_KINDS.map(e => [e.key, e]));
// les quatre qu'on peut acheter : la boutique, l'acheteur et les dévoilements ne voient qu'eux
const OEUFS_VENDUS = EGG_KINDS.filter(e => e.price);
const EN_VENTE = Object.fromEntries(OEUFS_VENDUS.map(e => [e.key, e]));
/* LA RÉSERVE, ELLE, LES CONNAÎT TOUS. `OEUFS_VENDUS` répond à « qu'est-ce qui s'achète » et
   n'a rien à dire sur « qu'est-ce qui couve ensuite » : la merveille n'a pas de prix, donc
   elle en sortait, donc la file et la priorité ne la voyaient pas. Le rang le plus haut du
   jeu passait derrière du commun, et une réserve qui n'en contenait que des merveilles
   désignait un œuf INEXISTANT. Du plus rare au plus commun, et par le rang plutôt que par
   l'ordre de déclaration : un rang ajouté se range tout seul. */
const OEUFS_HAUT_EN_BAS = EGG_KINDS.slice()
  .sort((a, b) => RARITY[b.rarity].rank - RARITY[a.rarity].rank);

/* Plus l'œuf est rare, plus il couve longtemps : 30 s pour un commun, 45 minutes pour un
   mythique. Une bête précieuse doit se faire attendre, sinon la rareté n'a pas de poids.

   Sur une bête commune la couvaison ne pèse rien : 30 s de coquille contre sept heures de
   croissance jusqu'à l'âge légende, soit un millième du cycle. C'est ce qui avait fait
   plafonner la couveuse à 5 — au-delà, on achetait des niveaux pour ne jamais les voir.

   LE PLAFOND EST LEVÉ, parce que l'argument ne vaut que pour l'œuf commun. Un œuf mythique
   couve quarante-cinq minutes, et une ferme de fin de partie n'attend plus que ça : c'est la
   seule file du jeu qui reste manuelle quand tout le reste est automatisé. Un plafond qui
   n'était juste qu'à la première ère n'avait rien à faire dans la table.

   Les incubateurs restent le bon levier tant qu'on couve du commun — ils montent en 1,6 par
   cran au lieu de 1,9, donc ils distancent la couveuse en prix. La couveuse redevient
   intéressante quand ce qu'on couve est cher, pas quand on en couve beaucoup. */
const hatchTime = slot => (EGG_BY_KEY[slot.kind] || EGG_BY_KEY.commun).hatch;

/* Une bête ne se nourrit jamais contre des pièces : elle grandit au clic et au temps.
   L'éleveur la pousse jusqu'à sa maturité, la mangeoire prend le relais ensuite et
   l'engraisse sans fin. Le prix d'un animal énorme n'est donc pas en pièces mais en temps
   et en place d'enclos — une bête qu'on engraisse est une bête qu'on ne vend pas.

   L'EMBONPOINT EST LE SEUL AXE FACULTATIF DU JEU. Il ne débloque plus rien : la rente
   s'ouvre à l'âge adulte, et le marchand ne réclame une taille minimale que si on possède
   une mangeoire. Ce que fait vraiment la mangeoire, c'est remplir l'attente au péage — la
   bête est mûre, les pièces de l'évolution ne sont pas encore là, elle grossit en attendant.

   Et ce temps-là n'est jamais perdu : l'évolution ne remet plus l'embonpoint à zéro. Elle
   n'en a pas besoin, car sizeFactor divise les secondes de mangeoire par la durée de l'âge
   COURANT, quatre à six fois plus longue à chaque cran. Engraisser tôt puis évoluer rend
   donc exactement ce que les mêmes secondes auraient rendu plus tard : l'épithète se
   dégonfle d'elle-même — un adulte démesuré fait un ancien colossal — sans qu'on ait à
   confisquer quoi que ce soit. */
const FATTEN_X  = 6;        // secondes d'engraissement par seconde et par niveau de mangeoire
/* ── CE QU'UNE UNITÉ D'ÉLEVEUR POUSSE, ET POURQUOI CE N'EST PLUS UN ──────────────
   La montée en niveau venait trop du doigt et pas assez de la machine. Un âge se traverse en
   quelques minutes de clic acharné là où l'éleveur, lui, met des heures : on ne l'achetait
   pas pour aller plus vite, on l'achetait pour ne pas avoir à rester. Un automate qu'on paie
   doit être le chemin normal, pas la consolation de celui qui s'absente.

   L'éleveur triple donc, et le clic tombe au tiers de ce qu'il valait — deux gestes, pas un :
   monter la machine sans baisser la main aurait monté les deux ensemble, puisqu'un clic vaut
   des SECONDES D'AUTOMATE (voir `clickGain`) et suit tout ce que l'automate gagne. */
const ELEVEUR_X = 3;        // multiplicateur de croissance par unité d'éleveur
const OVER_GAIN = 0.55;     // rendement décroissant de la taille

/* La taille à l'écran ne redescend JAMAIS. Elle ne se lit donc pas sur l'âge et l'embonpoint
   séparément — l'un monte au moment où l'autre se dégonfle — mais sur le total de croissance
   avalé, qui ne fait que monter. Chaque évolution ajoute par-dessus un petit bond fixe, pour
   qu'on VOIE ce qu'on vient de payer. */
const SCALE_MIN  = 0.55;    // taille d'un nouveau-né
const SCALE_MAX  = 1.75;    // taille d'une légende mûre, avant le bonus d'âge
const SCALE_GRAS = 1.10;    // ce que l'engraissement peut ajouter au-delà de la légende mûre
const AGE_SCALE  = [1, 1.06, 1.12, 1.18, 1.25];   // le bond visible à chaque évolution

/* ── La rente ─────────────────────────────────────────────────────────────────
   Tout le reste du jeu pousse à vendre : l'enclos est la ressource rare, et une bête qu'on
   garde est un enclos qui ne tourne pas. La rente est la seule règle qui paie pour NE PAS
   vendre — sans elle, garder une mythique chromatique était un pur sacrifice sentimental.

   Elle s'ouvre à L'ÂGE ADULTE — niveau 36 — et vaut la valeur de la bête étalée sur cinq
   minutes. Elle était auparavant branchée sur l'embonpoint (« énorme »), c'est-à-dire sur la
   mauvaise échelle : un seuil que personne ne devine, et qui obligeait à comprendre la
   mangeoire avant de toucher le premier revenu passif. L'âge ouvre la rente, la taille
   l'augmente — l'embonpoint est déjà dans la valeur de vente, donc il la pousse tout seul.

   CE PARAGRAPHE DISAIT « C'EST PEU », ET CE N'EST PLUS VRAI DEPUIS LONGTEMPS. Il datait de
   l'heure, où un enclos qui enchaînait les cycles rapportait deux à trois fois plus que la
   même case gardée. Mesuré aujourd'hui, à cinq minutes : garder rapporte QUATRE-VINGT-DIX
   FOIS le débit d'un cycle élevage-et-vente, à toutes les raretés — et l'écart se creuse
   encore si l'on déduit du cycle le prix de l'œuf et les péages. La rente ne récompense donc
   plus « la poignée de bêtes qu'on avait décidé de ne pas vendre » : elle EST la ferme, et
   l'élevage n'est plus qu'un moyen de la peupler.

   Ses facteurs sont déjà ceux du prix de vente — niveau, âge, rareté, teinte et taille —
   si bien qu'une bête rapporte à proportion exacte de ce qu'elle vaut. Le chromatique est
   le seul à recevoir un bonus par-dessus : c'est LA bête qu'un joueur garde. */
const AGE_RENTE     = 3;      // âge minimal : adulte. En deçà, rien du tout.
const NIV_RENTE     = AGES[AGE_RENTE - 2].niv + 1;   // le niveau 36, qu'on annonce d'avance
/* UNE BÊTE RAPPORTE SA PROPRE VALEUR EN CINQ MINUTES. C'était une heure, puis vingt minutes.

   Le défaut se voyait au sommet : une commune légende vaut 1,5 million, on manie des millions
   pour l'élever — six cent mille de péages rien que pour sa dernière évolution — et elle
   rendait QUATRE CENT SEIZE PIÈCES PAR SECONDE. Huit d'entre elles, une ferme entière menée
   au bout, faisaient trois mille pièces la seconde. L'échelle de ce qu'on manipule et celle
   de ce qu'on gagne n'étaient pas la même, et c'est ce décalage qui se sent, pas le nombre.

   CINQ MINUTES, PARCE QU'UNE DÉCISION DE GARDE DOIT SE PAYER DANS LA SÉANCE. Vingt minutes,
   c'est plus long que ce qu'on passe devant l'écran entre deux gestes : on gardait une bête
   sans jamais voir le moment où le pari devient gagnant, et un pari dont on ne voit pas le
   terme ne se prend pas — il se subit. Cinq minutes, on le voit.

   CE QUE ÇA NE RÈGLE PAS, et il faut l'écrire ici parce que le plan dit l'inverse : la rente
   reste PERPÉTUELLE ET GRATUITE, donc garder bat toujours vendre à l'infini, et ce chiffre-ci
   rend l'écart quatre fois plus grand. Le chantier de la rente porte sur sa NATURE — coût
   d'entretien, tarissement ou plafond — et il reste entier. On règle ici le débit, pas la
   règle. Voir PLAN.md, « La garde illimitée est trop forte ». */
const RENTE_H       = 300;
const RENTE_PRODIGE = 2;      // un chromatique double la sienne

/* ── Variantes ────────────────────────────────────────────────────────────────
   Tirées à l'éclosion et gardées À VIE, contrairement à la taille qu'une évolution
   remet à zéro : ce sont des identités, pas des états. C'est ce qui en fait une
   collection, et le brouillon direct des gènes du jalon 4.

   La TEINTE se voit — un filtre CSS recolore l'emoji, ce qui multiplie le bestiaire
   visible sans un seul dessin. Le TEMPÉRAMENT et le MOTIF ne sont que du texte : ils
   donnent une identité à chaque bête sans rien demander aux graphismes. */

/* ── LA COULEUR D'UNE BÊTE ─────────────────────────────────────────────────────
   IL Y AVAIT DEUX SYSTÈMES DE COULEUR, ET ILS NE SE PARLAIENT PAS. Les TEINTES donnaient une
   nuance à quarante-sept pour cent des bêtes, avec un multiplicateur de valeur de 1,10 à 1,40 ;
   le PRODIGE, une sur huit mille, en donnait une autre à ×25. Une bête pouvait être azur ET
   chromatique, et rien ne disait ce que ça faisait — sauf une ligne de rendu, tout au fond,
   qui tranchait en silence : le prodige écrasait la teinte. Le jeu avait donc déjà décidé
   qu'il n'y avait qu'une couleur par bête, sans que la règle soit écrite nulle part.

   ELLE EST ÉCRITE ICI, ET LES TEINTES DISPARAISSENT. Une bête est grise, ou elle est
   CHROMATIQUE — une sur huit mille cent quatre-vingt-douze, et c'est tout. La couleur cesse
   d'être un ornement fréquent pour devenir un événement.

   CE QUE ÇA COÛTE, ET IL FAUT LE SAVOIR EN OUVRANT LE JEU : une bête sur deux avait une
   couleur, une sur huit mille en aura une. Au plafond de la pension c'est un chromatique
   toutes les quatre heures ; sans pension ni acheteur, jamais. Les premières heures de jeu
   n'ont plus une seule bête colorée. C'est le prix d'un trophée, et il est assumé.

   LA ROUE, ET POURQUOI IL EN FAUT UNE. Le chromatisme n'est plus un booléen mais une TEINTE
   SUR UN CERCLE, à intervalles réguliers. C'est l'hérédité qui l'exige : deux parents ne
   peuvent donner « un mélange des deux » et « un voisin » que si les couleurs sont placées
   les unes par rapport aux autres. Un jeu de noms sans géométrie ne saurait mélanger un rouge
   et un bleu.

   TOUTES LES COULEURS SE VALENT. Aucune ne rapporte plus qu'une autre — seul le fait d'être
   chromatique paie, et il paie ×25. Donner un multiplicateur par couleur recréerait l'échelle
   de rareté des teintes qu'on vient de retirer, et ferait d'une couleur un chiffre à
   optimiser au lieu d'une identité à chasser. */
/* SEIZE ET NON HUIT, ET C'EST L'HÉRÉDITÉ QUI L'EXIGE. Le modèle d'héritage pose cinq
   positions sur l'axe qui relie deux parents — le mélange, deux intérieurs, deux extérieurs.
   À huit couleurs, deux parents voisins sont à UN SEUL CRAN l'un de l'autre : le mélange, les
   intérieurs et les parents tombent tous sur la même case, et quatre branches sur cinq ne
   produisent rien de distinct. La distribution ne se dépliait que sur des parents éloignés.

   À seize, l'écart moyen double et les cinq positions ont de quoi exister. C'est la seule
   raison de doubler, et elle suffit.

   CE QU'ELLE COÛTE, MESURÉ : par le calcul du collectionneur, il faut environ vingt-deux
   chromatiques pour voir huit couleurs et CINQUANTE-QUATRE pour en voir seize. À une éclosion
   sur 8 192, cela fait 443 000 éclosions au lieu de 178 000 — deux cent trente heures au
   plafond absolu de la pension, contre quatre-vingt-treize.

   LE RISQUE À SURVEILLER : 22,5° d'écart se voit moins que 45°, et les couleurs ne sont pas
   peintes — c'est une rotation de teinte appliquée à un sprite dont la palette est déjà
   étroite. Si vermillon et écarlate se confondent en vignette, nommer les deux promet une
   collection qu'on ne peut pas trier. À vérifier sur la planche, et non de tête.

   LE REGISTRE NE VARIE PAS : des matières, des pigments et des pierres. Jamais « bleu clair »
   ni « rouge foncé » — un nom de couleur qui décrit sa position sur une échelle est un nom
   qu'on oublie. Le grenat referme le cercle en ramenant vers l'écarlate. */
/* ── LE MOTEUR DES ACHROMATIQUES ───────────────────────────────────────────────
   Les quatre gris ne sont pas des teintes de la roue : ils se fabriquent autrement, et cette
   fonction est le seul endroit qui sait comment.

   IL COMMENCE PAR TOUT EFFACER, ET C'EST LE POINT. Ils s'écrivaient `saturate(.12)`, ce qui ne
   POSE pas une teinte : ça en GARDE un huitième — celle du dessin. La perle d'un kitsune
   écarlate et la perle d'un wukong sortaient donc à 0,207 l'une de l'autre, soit plus loin que
   deux crans voisins de l'échelle. Un nom de couleur qui rend deux choses selon la bête n'est
   pas un nom de couleur. Après `grayscale(1)`, la suite ne voit plus qu'une clarté, et la
   perle est la même perle partout.

   PUIS IL COMPRIME AU LIEU DE MULTIPLIER. Le blanc était `brightness(1.95)` : une
   multiplication envoie à un blanc PUR tout ce qui dépasse 0,51, et sur le wukong ça faisait
   43 % du dessin — le nuage entier et toutes les mèches claires, aplatis sur une seule valeur.
   C'est ça, la sur-exposition : pas « trop clair », mais plusieurs clartés d'entrée pour une
   seule de sortie, donc du modelé perdu qu'aucun réglage ne rend. `contrast()` en dessous de 1
   RESSERRE la plage, `brightness()` la replace : ensemble ils tiennent les deux bouts, le
   contour et le point le plus clair, sans jamais buter.

     teinte   la dose de sépia — la matière de la teinte, avant qu'on la tourne
     angle    où on l'emmène : 175° pour un gris froid, 335° pour une nacre chaude
     force    combien on la voit ; au-delà, un « gris » cesse d'être gris
     serre    le resserrement de la plage — c'est lui qui empêche de brûler
     niveau   où le cran se pose sur l'échelle du clair au sombre

   L'ONYX RESTE AU-DESSUS DE LA PIÈCE, et c'est chiffré : son point le plus clair sort à 0,24
   de clarté quand le fond `#0E1310` est à 0,07. Une bête vraiment noire y serait un trou
   cerclé d'un halo ; celle-ci se lit. */
const filtreGris = (teinte, angle, force, serre, niveau) =>
  'grayscale(1) sepia(' + teinte + ') hue-rotate(' + angle + 'deg) saturate(' + force + ') '
  + 'contrast(' + serre + ') brightness(' + niveau + ')';

const CHROMAS = [
  // ── LA ROUE · seize teintes à 22,5°, et leurs indices ne bougent jamais ──
  { key: 'ecarlate',  name: 'écarlate',  fem: 'écarlate',  hue:   0,   ton: 'vif' },
  { key: 'vermillon', name: 'vermillon', fem: 'vermillon', hue:  22.5, ton: 'vif' },
  { key: 'ambre',     name: 'ambre',     fem: 'ambre',     hue:  45,   ton: 'vif' },
  { key: 'safran',    name: 'safran',    fem: 'safran',    hue:  67.5, ton: 'vif' },
  { key: 'dore',      name: 'doré',      fem: 'dorée',     hue:  90,   ton: 'vif' },
  { key: 'olivine',   name: 'olivine',   fem: 'olivine',   hue: 112.5, ton: 'vif' },
  { key: 'jade',      name: 'jade',      fem: 'jade',      hue: 135,   ton: 'vif' },
  { key: 'celadon',   name: 'céladon',   fem: 'céladon',   hue: 157.5, ton: 'vif' },
  { key: 'azur',      name: 'azur',      fem: 'azur',      hue: 180,   ton: 'vif' },
  { key: 'cobalt',    name: 'cobalt',    fem: 'cobalt',    hue: 202.5, ton: 'vif' },
  { key: 'indigo',    name: 'indigo',    fem: 'indigo',    hue: 225,   ton: 'vif' },
  { key: 'violine',   name: 'violine',   fem: 'violine',   hue: 247.5, ton: 'vif' },
  { key: 'amethyste', name: 'améthyste', fem: 'améthyste', hue: 270,   ton: 'vif' },
  { key: 'pourpre',   name: 'pourpre',   fem: 'pourpre',   hue: 292.5, ton: 'vif' },
  { key: 'magenta',   name: 'magenta',   fem: 'magenta',   hue: 315,   ton: 'vif' },
  { key: 'grenat',    name: 'grenat',    fem: 'grenat',    hue: 337.5, ton: 'vif' },

  /* ── LES ACHROMATIQUES · hors de la roue, sur une droite à quatre crans ──
     Elles n'ont pas de teinte, donc pas de place sur le cercle : « l'arc court entre
     l'écarlate et le blanc » n'existe pas, et le calculer quand même ferait tomber leur
     mélange sur du jade. Elles vivent sur une droite qui leur est propre.

     ONYX PORTE LE RÔLE DU NOIR SANS ÊTRE NOIR, et c'est une contrainte du fond : la pièce
     d'incubation est à #0E1310. Une bête vraiment noire y serait un trou cerclé d'un halo
     doré — on verrait le contour et rien d'autre. Onyx est donc un gris très sombre, et son
     nom l'assume : un onyx est noir sans être un vide. */
  { key: 'blanc',   name: 'blanc',   fem: 'blanche', hue: null, gris: 0, filtre: filtreGris(.15, 175, 1.2, .62, 1.28) },
  { key: 'perle',   name: 'perle',   fem: 'perle',   hue: null, gris: 1, filtre: filtreGris(.15, 335, 2.6, .66, 1.02) },
  { key: 'ardoise', name: 'ardoise', fem: 'ardoise', hue: null, gris: 2, filtre: filtreGris(.15, 175, 2.6, .76, .56) },
  { key: 'onyx',    name: 'onyx',    fem: 'onyx',    hue: null, gris: 3, filtre: filtreGris(.15, 175, 1.2, .86, .28) },

  /* ── LES RECETTES · ce qu'une teinte donne croisée avec un blanc ou un onyx ──
     ELLES NE PORTENT QUE SUR UN CRAN SUR DEUX DE LA ROUE, et c'est délibéré à deux titres.
     Elles rendent les huit teintes CARDINALES désirables — seules elles donnent quelque chose
     de neuf avec un achromatique. Et elles écartent les pastels de 45° au lieu de 22,5°, ce
     qui est la seule protection contre le défaut que cette roue traîne depuis le début : deux
     couleurs voisines qu'on ne distingue pas en vignette de vingt-quatre pixels.

     ARGENT EST UNE EXCEPTION ASSUMÉE. Par la règle du ton, un doré éclairci donne un jaune
     pâle et devrait s'appeler lin. Il s'appelle argent parce que l'or blanc EST de l'argent —
     et c'est le FILTRE qui plie, pas le nom : il désature presque tout. Un nom qui décrit mal
     le pixel est un nom qui ment ; on a donc changé le pixel. */
  { key: 'rose',       name: 'rose',       fem: 'rose',       hue:   0, ton: 'clair' },
  { key: 'bordeaux',   name: 'bordeaux',   fem: 'bordeaux',   hue:   0, ton: 'sombre' },
  { key: 'beige',      name: 'beige',      fem: 'beige',      hue:  45, ton: 'clair' },
  { key: 'sepia',      name: 'sépia',      fem: 'sépia',      hue:  45, ton: 'sombre' },
  { key: 'argent',     name: 'argent',     fem: 'argent',     hue:  90, ton: 'clair',
    filtre: 'hue-rotate(90deg) saturate(.22) contrast(.52) brightness(1.4)' },
  { key: 'bronze',     name: 'bronze',     fem: 'bronze',     hue:  90, ton: 'sombre' },
  { key: 'menthe',     name: 'menthe',     fem: 'menthe',     hue: 135, ton: 'clair' },
  { key: 'malachite',  name: 'malachite',  fem: 'malachite',  hue: 135, ton: 'sombre' },
  { key: 'turquoise',  name: 'turquoise',  fem: 'turquoise',  hue: 180, ton: 'clair' },
  { key: 'marine',     name: 'marine',     fem: 'marine',     hue: 180, ton: 'sombre' },
  { key: 'lavande',    name: 'lavande',    fem: 'lavande',    hue: 225, ton: 'clair' },
  { key: 'encre',      name: 'encre',      fem: 'encre',      hue: 225, ton: 'sombre' },
  { key: 'lilas',      name: 'lilas',      fem: 'lilas',      hue: 270, ton: 'clair' },
  { key: 'obsidienne', name: 'obsidienne', fem: 'obsidienne', hue: 270, ton: 'sombre' },
  { key: 'quartz',     name: 'quartz',     fem: 'quartz',     hue: 315, ton: 'clair' },
  { key: 'cassis',     name: 'cassis',     fem: 'cassis',     hue: 315, ton: 'sombre' },
];

/* LES SEIZE PREMIERS INDICES SONT LA ROUE, ET ILS NE BOUGERONT PLUS. Une sauvegarde stocke un
   INDICE : réordonner la table repeindrait toutes les bêtes du monde en silence. Les
   achromatiques et les recettes s'ajoutent donc APRÈS, jamais au milieu — c'est la règle que
   les motifs portent depuis l'album, et elle vaut ici pour la même raison. */
const ROUE = CHROMAS.filter(c => c.ton === 'vif');
const GRIS = CHROMAS.filter(c => c.hue === null);
const estGris = i => CHROMAS[i] && CHROMAS[i].hue === null;

// Le ton donne le filtre ; un `filtre` écrit à la main l'emporte, pour l'argent et les gris.
/* LE TON PLACE LA COULEUR SUR L'ÉCHELLE DU CLAIR AU SOMBRE, ET IL COMPRIME AU LIEU DE
   MULTIPLIER. `brightness()` seul multiplie : au-delà de `1/valeur`, toutes les clartés
   sortent au même blanc pur. Le ton `clair` était `brightness(1.72)`, donc il blanchissait
   tout ce qui dépassait 0,576 — sur un crapaud, déjà pâle, ça faisait 60 % du dessin, et les
   huit recettes claires rendaient huit fois la même grenouille blanche à liseré coloré. Le
   `vif` blanchissait 32 % du même crapaud.

   `contrast()` en dessous de 1 RESSERRE la plage avant que `brightness()` ne la remonte : les
   deux ensemble tiennent le sommet sous le blanc pur, et le corps garde sa couleur. Le seuil
   de blanchiment passe de 0,576 à 0,912 pour le clair et de 0,762 à 0,991 pour le vif — dans
   les deux cas au-delà de ce que les dessins montent (0,884).

   LE SOMBRE NE COMPRIME PAS, ET C'EST VOULU : il descend, donc il ne peut pas brûler. Lui
   ajouter un `contrast()` par symétrie ne ferait que lui retirer de la vivacité.

   CE N'EST PAS LE MOTEUR DES GRIS, ET LA DIFFÉRENCE COMPTE. Les gris commencent par
   `grayscale(1)`, ce qui rend leur couleur indépendante du dessin. Les teintes gardent
   `hue-rotate`, qui déplace CHAQUE couleur de la bête : c'est lui qui fait que seize teintes
   restent seize teintes distinctes. Le prix est connu et non payé ici — le nom ne dit pas la
   couleur obtenue, puisqu'on tourne la teinte du dessin au lieu de la remplacer. */
const TON_FILTRE = {
  vif:    'saturate(2.6) contrast(.72) brightness(1.16)',
  clair:  'saturate(1.6) contrast(.52) brightness(1.4)',
  sombre: 'saturate(1.9) brightness(.62)',
};
const filtreCouleur = k => k.filtre || 'hue-rotate(' + k.hue + 'deg) ' + TON_FILTRE[k.ton];

/* CE QU'UNE TEINTE DONNE DANS UN TON, ou la teinte pure quand la recette n'existe pas. Les
   huit crans intercalaires n'en ont aucune : un vermillon clair n'est pas une couleur du jeu,
   et le croisement retombe donc sur le vermillon. */
const recetteCouleur = (hue, ton) => {
  const i = CHROMAS.findIndex(c => c.hue === hue && c.ton === ton);
  return i >= 0 ? i : CHROMAS.findIndex(c => c.hue === hue && c.ton === 'vif');
};


/* Le prodige ignore la lignée : on peut avoir un têtard chromatique. C'est la seule
   raison de regarder encore chaque éclosion quand on enchaîne les œufs mythiques.

   Il vaut exactement UN CRAN DE RARETÉ : une commune chromatique vaut une rare ordinaire,
   une rare chromatique vaut une épique, et ainsi de suite jusqu'en haut. La règle se lit en
   une phrase et se propage d'elle-même.

   À ×5 il ne pesait rien : la plus belle bête du jeu restait cinq fois sous le moindre
   tirage rare, et le seul coup de chance qui se voit à l'écran ne se sentait pas dans la
   bourse. Mais à ×125 il cassait la partie, et pour une raison qui n'est pas le chiffre
   lui-même : LE COÛT D'ÉVOLUTION NE SUIT QUE LA LIGNÉE. Mener n'importe quelle bête au bout
   rend 2,3 fois ses péages ; un chromatique rend 2,3 × son multiplicateur, puisqu'il paie
   les péages de sa lignée pour la valeur d'une autre. À ×125, une commune chromatique
   rapportait donc 291 fois sa mise quand tout le reste du jeu en rapporte 2,3.

   À ×25 l'affaire reste excellente — c'est bien ce qu'on veut d'un coup de chance — sans être
   la meilleure ligne de jeu à elle seule. Si ça pèse encore trop à l'essai, le levier suivant
   n'est plus ce chiffre mais les péages.

   LA CHANCE EST PASSÉE DE 1/500 À 1/8192. À une bête sur cinq cents, le chromatique tombait
   toutes les demi-heures sur une ferme automatisée : c'était une variante fréquente, pas un
   coup de chance, et on finissait par en vendre. À 1/8192 il redevient ce qu'il doit être —
   quelque chose qu'on raconte, et qu'on garde.

   Une conséquence à connaître : la carte d'album CONSTELLÉE prend toute sa valeur : plafonnée à ×2
   sur tout l'album, elle ramène la chance à 1/4096 — un doublement qui se sent enfin, là où
   il n'était qu'un confort. */
const PRODIGE_ODDS  = 1 / 8192;
/* ── LES FONDS ─────────────────────────────────────────────────────────────────
   Un décor derrière la bête, tiré à l'éclosion et gardé à vie. Il se voit sur la scène et sur
   la carte, et il fait monter un peu le prix de vente.

   POURQUOI C'EST LE MEILLEUR RAPPORT DESSIN / VARIÉTÉ DU JEU. Les dix-sept lignées sans image
   demandent cinq dessins chacune, et chaque dessin ne sert qu'à une forme. Un fond sert aux
   CENT CINQUANTE FORMES à la fois : huit fonds multiplient par neuf le nombre d'images
   différentes qu'on peut croiser, pour zéro fichier — ils sont en CSS.

   IL N'ENTRE PAS DANS LE NOM, et c'est tranché depuis la note d'origine. Un fond SE VOIT : le
   dire en plus serait une redite, et le jeu n'affiche qu'une seule épithète exprès, pour
   qu'une bête reste une bête et pas une fiche technique.

   PRESTIGIEUX VEUT DIRE RARE : un sur huit cents, et SEULEMENT dans les œufs de la boutique.
   Un fond fréquent devient un décor et cesse d'être une rencontre — même règle que le
   chromatique.

   LA PENSION N'EN DONNE AUCUN, ET ÇA VA CHANGER : le plan lui en fait donner par deux voies,
   au hasard comme les teintes et par hérédité. Le chiffre qui justifiait ce garde était faux —
   il annonçait « un toutes les cinq minutes » pour mille œufs l'heure, ce qui en fait 1,25 par
   heure, un toutes les quarante-huit minutes ; et le plafond réel de la pension est de 1 920
   œufs l'heure, soit un toutes les vingt-cinq minutes au sommet. Beaucoup, mais pas ce qui
   avait été annoncé.

   LE FOND ET LE MOTIF NE FONT PAS LE MÊME MÉTIER : le motif décide de l'EFFET d'une carte, le
   fond de sa VALEUR. Ils coexistent sur la même bête sans se marcher dessus.

   `mult` reste dans la fourchette des teintes — de 1,10 à 1,20 — pour ne pas avoir à reprendre
   l'équilibrage des variantes en entier. `sens` dit d'où partent les particules, `n` combien il
   y en a : tout le reste est dans la feuille de style, une classe par fond. */
const FONDS = [
  { key: 'braise',  nom: 'braise',   mult: 1.14, sens: 'monte',  n: 9 },
  { key: 'givre',   nom: 'givre',    mult: 1.14, sens: 'tombe',  n: 11 },
  { key: 'nuee',    nom: 'nuée',      mult: 1.10, sens: 'derive', n: 10 },
  { key: 'abysse',  nom: 'abysse',   mult: 1.16, sens: 'monte',  n: 8 },
  { key: 'orage',   nom: 'orage',    mult: 1.12, sens: 'tombe',  n: 14 },
  { key: 'pollen',  nom: 'pollen',   mult: 1.10, sens: 'derive', n: 12 },
  { key: 'cendre',  nom: 'cendre',   mult: 1.12, sens: 'tombe',  n: 9 },
  { key: 'aurore',  nom: 'aurore',   mult: 1.20, sens: 'derive', n: 7 },
];
const FOND_BY_KEY = Object.fromEntries(FONDS.map(f => [f.key, f]));
// une bête sur huit cents en a un, et il se tire alors uniformément parmi les huit
const FOND_ODDS = 1 / 800;
const fondDe = c => (c && c.fond && FOND_BY_KEY[c.fond]) || null;

const PRODIGE_MULT  = 25;
/* LE HALO DIT « CHROMATIQUE », LA ROTATION DIT LAQUELLE. Le halo ne bouge pas d'une couleur à
   l'autre : c'est lui qu'on reconnaît de loin dans une bande de quarante vignettes, et le
   faire varier rendrait le rang lui-même illisible.

   IL NE PORTE QUE LE HALO, ET C'EST TOUT LE CORRECTIF DE LA 4.22.1. Il a longtemps commencé
   par `saturate(2.4) brightness(1.3)` — mot pour mot le `TON_FILTRE.vif` de la table juste
   au-dessus. Comme `filtreDe` colle les deux bouts, toute teinte vive partait en saturate
   5,76 et brightness 1,69 : sur le Sun Wukong, 76 % des pixels butaient contre le blanc ou le
   magenta purs, et sa robe rouge, son brun sombre et son brun clair tombaient tous les trois
   sur le même #ff00ff. La bête n'avait plus de modelé, juste une silhouette fluo.

   C'ÉTAIT DEUX ENDROITS POUR UNE MÊME VÉRITÉ, la faute que ce dépôt poursuit partout ailleurs.
   Le ton se dit dans la table, une fois ; le halo se dit ici, une fois. */
const PRODIGE_FILTER = 'drop-shadow(0 0 14px #E4A63E)';
const chromaOf   = c => CHROMAS[c && c.chroma] || null;

/* LE MILIEU DE DEUX COULEURS EST UN PROBLÈME DE CERCLE, PAS DE MOYENNE. Entre l'écarlate (0)
   et le magenta (7), la moyenne arithmétique donne 3,5 — du jade, à l'exact opposé de ces
   deux-là. Sur une roue, ils sont VOISINS : leur milieu est écarlate. On moyenne donc des
   VECTEURS et non des indices, ce qui revient à prendre le milieu de l'arc COURT — celui que
   l'œil appelle « un mélange ». Un rouge et un bleu donnent du violet, jamais du vert. */
function milieuRoue(indices) {
  if (!indices || !indices.length) return 0;
  const n = CHROMAS.length, pas = 2 * Math.PI / n;
  let x = 0, y = 0;
  for (const i of indices) { x += Math.cos(i * pas); y += Math.sin(i * pas); }
  // deux couleurs diamétralement opposées s'annulent : aucun milieu ne les départage,
  // et on rend la première plutôt qu'un zéro qui serait de l'écarlate arbitraire
  if (Math.abs(x) < 1e-9 && Math.abs(y) < 1e-9) return indices[0];
  return ((Math.round(Math.atan2(y, x) / pas) % n) + n) % n;
}
const filtreDe   = c => !c || !c.prodige ? ''
                      : filtreCouleur(chromaOf(c) || CHROMAS[0]) + ' ' + PRODIGE_FILTER;

// grow : divise la durée de croissance. fat : multiplie la vitesse d'engraissement.
const TEMPERS = [
  { key: 'docile',   name: 'docile',   fem: 'docile',    grow: 1.00, fat: 1.00 },
  { key: 'nerveux',  name: 'nerveux',  fem: 'nerveuse',  grow: 1.25, fat: 0.85 },
  { key: 'placide',  name: 'placide',  fem: 'placide',   grow: 0.85, fat: 1.25 },
  { key: 'glouton',  name: 'glouton',  fem: 'gloutonne', grow: 1.00, fat: 1.40 },
  { key: 'farouche', name: 'farouche', fem: 'farouche',  grow: 1.15, fat: 0.95 },
  { key: 'rêveur',   name: 'rêveur',   fem: 'rêveuse',   grow: 0.90, fat: 1.15 },
];

/* Le motif était purement descriptif jusqu'à l'album : il n'avait aucun effet, il servait
   seulement à reconnaître une bête entre mille. C'est justement ce qui en fait le bon
   support pour le bonus d'une carte — voir MOTIF_BONUS plus bas. */
/* Une bête stocke son motif PAR INDICE : les nouveaux s'ajoutent donc à la fin, comme les
   teintes. En insérer un au milieu redistribuerait les effets de tout l'album déjà gagné.

   `constellé` S'EST APPELÉ AINSI JUSQU'À LA 3.1.2, et il a été renommé `nacré` pour libérer le
   mot : la CONSTELLATION est le nom de l'arbre d'ascension à venir, et deux choses qui portent
   la même racine dans le même jeu finissent par se confondre. Le fichier a déjà payé ce prix
   avec « palier », qui désignait trois objets différents à quelques lignes d'écart.

   Renommer le MOTIF plutôt que l'arbre était le moindre coût : un motif parmi dix est une
   étiquette, un pan de jeu entier ne l'est pas. Et rien à migrer — une bête stocke un INDICE,
   pas un nom, et l'indice n'a pas bougé. */
const MOTIFS = ['uni', 'tacheté', 'rayé', 'moucheté', 'marbré', 'tigré', 'zébré', 'nacré',
                'ocellé', 'martelé'];

/* Les rangs de taille qualifient une bête MÛRE qu'on n'a pas fait évoluer : « adulte »,
   puis « adulte grand », « adulte énorme »… Le seuil d'un rang est aussi son multiplicateur
   de valeur : franchir un rang fait donc bondir le prix de vente, comme un niveau.

   Ils ne disent pas une taille absolue mais À QUEL POINT LA BÊTE EST GROSSE POUR SON ÂGE.
   C'est ce qui leur permet de survivre à l'évolution sans se contredire, et ce qui donne un
   sens à « titan titanesque » : un titan hors-norme parmi les titans. */
const RANKS = [
  // name sert à qualifier une bête mûre (masculin), fem à qualifier une taille (féminin)
  { at: 1.00, name: '',           fem: '' },
  { at: 1.30, name: 'grand',      fem: 'grande' },
  { at: 1.70, name: 'énorme',     fem: 'énorme' },
  { at: 2.30, name: 'colossal',   fem: 'colossale' },
  { at: 3.20, name: 'titanesque', fem: 'titanesque' },
  { at: 4.50, name: 'démesuré',   fem: 'démesurée' },
];

/* ── L'album et l'ascension ───────────────────────────────────────────────────
   Le jeu s'arrêtait sur une fin sèche : légendes mythiques, ferme pleine, plus rien.
   L'ascension lui donne un deuxième tour, et l'album est la seule chose qu'on emporte.

   LE CYCLE TIENT EN CINQ TEMPS. On joue. On gagne un jeton en franchissant un palier de
   fortune. On ascensionne, ce qui dépense le jeton : les bêtes
   de l'enclos deviennent des CAPSULES — la bête figée telle qu'elle était. On équipe
   quelques cartes. Tout le reste repart de zéro.

   Une bête ne devient jamais une carte en cours de partie : la transformation n'a lieu qu'au
   moment du saut, sur ce qu'il reste dans l'enclos. Il n'y a donc aucun arbitrage à faire
   devant chaque animal — la question devient « lesquelles je garde en vie pour le saut ? »,
   posée une fois sur une ferme entière plutôt que trente fois sur trente bêtes.

   L'ALBUM GARDE TOUT, CINQ CARTES AGISSENT. Les capsules qu'on n'équipe pas attendent en
   réserve d'une ascension à l'autre, et l'on échange à volonté entre les deux — au doigt, en
   glissant une carte d'un bloc à l'autre. C'est la limite de CINQ SIMULTANÉES qui borne la
   puissance, plus le nombre de cartes possédées : sans elle, vingt-sept cartes se composent
   et l'album n'a plus de plafond.

   Le build n'est donc plus figé pour la partie. On peut mettre la couvaison au début et la
   valeur à la fin, ce qui revient à disposer de toutes ses cartes en cinq exemplaires à la
   fois — la limite borne la puissance instantanée, pas la stratégie.

   CINQ EMPLACEMENTS, TOUJOURS. L'album est exactement ces cinq cartes : il n'y a pas de
   réserve derrière, rien n'attend son tour. Ce qu'on ne retient pas au moment du saut est
   détruit avec la ferme.

   Le compte a été mobile — trois plus un par ascension, puis un par jeton dépensé — et les
   deux versions avaient le même défaut : un premier saut à une seule carte ne donne pas un
   build, il donne un chiffre. Cinq d'emblée, c'est une décision dès la première ascension, et
   un plafond qu'on peut calculer sans savoir combien de sauts la partie contiendra. */

const SLOTS = 5;

/* LES ÉTOILES D'UNE CARTE. Une capsule naît à UNE étoile ; la fusion la monte à deux, puis à
   trois, et ça s'arrête là. Deux fusions au plus dans la vie d'une carte.

   Le mot « palier » désignait ça avant, et il désignait déjà deux autres choses dans ce
   fichier — les paliers de fortune qui donnent les jetons, et les paliers d'améliorations qui
   se montent en tiers. Trois sens pour un mot, dans un fichier qui parle des trois à quelques
   lignes d'écart : « étoiles » lève l'ambiguïté et se dit mieux à l'écran.

   La table s'arrête à trois entrées, et c'est ce qui règle une vieille question restée
   ouverte : un quatrième cran valait ×5, mais les plafonds des familles de motifs le mangeaient
   presque entièrement — le tigré plafonne à +200 % et l'atteignait déjà, le perlé plafonne à
   trois enclos et les atteignait dès la deuxième étoile. On payait très cher un cran qui, selon
   le motif, ne donnait rien. Il n'existe plus.

   La table est là avant la fusion parce que la puissance la lit déjà. */
const ETOILES = [1, 1.8, 3];

/* ── LA POUSSIÈRE DE CARTE ─────────────────────────────────────────────────────
   Une monnaie qui n'existe que pour l'album. On l'obtient en DÉSINTÉGRANT une carte, un peu à
   chaque ascension pour les bêtes qu'on n'emporte pas, et elle ne sert qu'à FUSIONNER.

   LA POUSSIÈRE SEULE NE FAISAIT PAS UNE FUSION. Pendant vingt versions, « fusionner » voulait
   dire payer une étoile avec de la monnaie : rien ne disparaissait, rien ne se mariait, et le
   mot mentait sur ce qu'il faisait. Une fusion, c'est des cartes QUI FUSIONNENT — elles entrent
   à trois et il en sort une.

   L'OBJECTION D'ORIGINE ÉTAIT MAL POSÉE, et c'est ce qui avait fait naître la monnaie seule :
   « une fusion classique demande deux cartes IDENTIQUES, or une carte porte une lignée, un âge,
   un niveau, un motif, une teinte, un rang et un chromatique — treize millions de combinaisons,
   deux exemplaires identiques n'arriveront jamais. » C'est vrai, et ça ne conclut rien :
   SIMILAIRE N'EST PAS IDENTIQUE.

   Deux cartes se marient quand elles partagent LA LIGNÉE ET LE MOTIF — exactement les deux
   champs qui décident de CE QUE la carte fait. Tout le reste — âge, niveau, teinte, rang — ne
   dit que COMBIEN, et se moyenne. Trois béhémoths unis se réunissent donc, quel que soit leur
   âge, et le résultat vaut ce que valaient les trois, plus une étoile.

   La poussière ne disparaît pas pour autant, et son barème ne bouge pas : une fusion coûte
   TROIS CARTES ET DE LA POUSSIÈRE. Ce qu'on fond sert toujours à ça, et le problème que la
   monnaie résolvait reste résolu — une ferme de vingt bêtes rend vingt cartes par saut, dont
   trois valent la peine, et les dix-sept autres redeviennent du carburant.

   LA RARETÉ EST DU MÊME CÔTÉ DES DEUX ÉQUATIONS, et c'est délibéré : elle multiplie ce qu'une
   carte rend ET ce qu'une fusion coûte, donc elle s'annule. Monter une commune ou une mythique
   demande le même nombre de cartes DE SA PROPRE RARETÉ — dix pour la deuxième étoile, quarante
   pour la troisième. Personne n'a intérêt à fondre ses mythiques pour nourrir ses communes.

   LA QUALITÉ N'ENTRE PAS. Niveau, teinte et rang décident déjà de la puissance : les faire
   entrer aussi punirait deux fois d'avoir une bonne carte, et rendrait « garder ou fondre »
   insoluble. Une carte vaut sa puissance, OU sa poussière, et les deux ne se ressemblent pas.

   ET ON NE DÉFAIT PAS UNE FUSION : les étoiles n'entrent pas dans ce qu'une carte rend. Sinon
   fusionner puis désintégrer fabriquerait de la poussière à l'infini. La règle vaut d'autant
   plus maintenant que trois cartes entrent pour une : sans elle, forger puis fondre rendrait
   une partie de ce qu'on vient de payer. */
const POUSSIERE_BASE    = 10;
const POUSSIERE_RARETE  = { commune: 1, rare: 3, epique: 10, mythique: 30, merveilleuse: 90 };
const POUSSIERE_PRODIGE = 3;
const POUSSIERE_FOND    = 2;      // les fonds n'existent pas encore : le facteur dort
// ce qu'une bête sacrifiée à l'ascension laisse, en fraction de ce que sa carte aurait rendu
const POUSSIERE_SAUT    = 0.1;
// pour aller à la deuxième étoile, puis à la troisième — multiplié par la rareté
const FUSION_COUT       = [0, 100, 400];

/* TROIS ENTRENT, UNE SORT. Le compte décide de tout le reste : neuf cartes d'une même lignée
   et d'un même motif pour une seule à trois étoiles, contre trois si le compte était deux.
   Deux rendait la troisième étoile presque gratuite pour qui joue une lignée ; quatre la
   rendait inatteignable avant la dixième ascension. Trois est le seul compte qui fasse de la
   deuxième étoile une décision et de la troisième un objectif.

   C'EST LE JOUEUR QUI DÉSIGNE LES TROIS. La forge a d'abord pris les trois plus fortes toute
   seule, au motif qu'une fusion doit rendre la meilleure carte possible ; c'était décider à sa
   place ce qu'il perd. Une teinte se DILUE dans une fusion, une bête menée à l'âge légende ne
   se remplace pas en une ascension : quelles trois cartes entrent est la seule vraie question
   de l'atelier, et une machine ne peut pas y répondre.

   D'où le geste en deux temps : on choisit LA CARTE À FAIRE MONTER, et l'atelier ne montre
   plus alors que celles qui peuvent la rejoindre. C'est ce qui rend la règle de mariage
   visible sans l'énoncer — on ne lit pas « même lignée, même motif », on voit la grille se
   réduire.

   UNE CARTE ÉQUIPÉE N'ENTRE PAS DANS LA FORGE, comme elle ne se fond pas : elle s'évaporerait
   d'un emplacement et changerait le build en silence. */
const FUSION_N          = 3;

/* LE MOTIF DÉCIDE DE CE QUE LA CARTE ACCÉLÈRE. Il ne servait à rien, il est déjà tiré à
   l'éclosion et gardé à vie : lui confier le bonus ne demande aucune mécanique neuve, et il
   devient chassable. Faire dire le bonus par la LIGNÉE aurait figé vingt-et-un bonus dans la
   pierre et rendu une lignée entière inintéressante le jour où le sien l'est.

   Deux familles baissent des PRIX au lieu d'augmenter des vitesses. C'est ce qui empêche la
   deuxième partie d'être la première en accéléré : une ferme menée au zébré ne se joue pas
   comme une ferme menée au tacheté.

   `pas` est ce qu'un point de puissance ajoute, `cap` le plafond de la famille. Le prodige
   fait exception et s'exprime EN MULTIPLICATEUR DE LA BASE, jamais en points : la base est à
   1/8192, soit 0,012 %, et un demi-point la multiplierait par plus de quarante. Le bonus
   d'élevage a été coupé de ×25 à ×4 pour protéger cette rareté ; une carte ne doit pas la
   défaire non plus — d'où le plafond à ×2, qui ramène au mieux la chance à 1/4096.

   LES DEUX COLONNES DOIVENT SE RÉPONDRE, et la première version ne le faisait pas. Un `pas`
   deux à trois fois plus petit rendait les plafonds INATTEIGNABLES : six cartes parfaites
   restaient sous chacun d'eux, ce qui veut dire qu'aucun n'était un plafond. À l'autre bout,
   une première ascension réaliste — trois légendes communes ordinaires — rendait +1,4 % de
   valeur et +2,8 % de couvaison en échange de TOUT ce qu'on possédait. Personne n'aurait
   ascensionné deux fois.

   Les plafonds n'ont pas bougé : la puissance maximale de l'album est exactement celle
   annoncée. Seule la pente change, de sorte qu'un album mûr — six emplacements bien remplis,
   autour de quatorze points — vienne buter contre ses plafonds au lieu de les frôler.

   La conséquence est qu'un album se CONCENTRE. Trois cartes d'une même famille rendent trois
   fois plus que trois familles différentes : le joueur choisit un build, il ne ramasse pas. */
/* CE QU'UNE CARTE FAIT, ET CE QUE ÇA VEUT DIRE. `quoi` tient sur la carte, `dit` explique au
   survol — parce qu'un joueur qui lit « rente +140 % » n'apprend rien s'il ignore ce qu'est
   une rente, et que c'était le cas de la moitié de cette table.

   DEUX EFFETS NE SONT PAS DES POURCENTAGES, et c'est délibéré. Une carte qui rend une ferme
   4 % plus rentable ne se sent pas au début du cycle suivant, qui est justement le moment où
   l'ascension doit donner envie : on repart avec un œuf et zéro pièce, et +40 % sur une vente
   à 40 pièces font seize pièces. Une règle, elle, se voit tout de suite — l'ocellé clique
   avant qu'on ait posé le doigt, le perlé donne un enclos qu'on n'a pas payé.

   Les deux comblent aussi les deux trous de la table : RIEN ne touchait au clic, qui est
   pourtant le verbe du joueur, et rien ne touchait à la place, qui est la vraie limite de la
   fin de partie. */
const MOTIF_BONUS = {
  'uni':       { key: 'valeur',  quoi: 'prix de vente',         pas: 0.04, cap: 0.60, signe: 1,
                 dit: 'Tes bêtes se vendent plus cher.' },
  'tacheté':   { key: 'couvee',  quoi: 'vitesse de couvaison',  pas: 0.10, cap: 1.50, signe: 1,
                 dit: 'Tes œufs éclosent plus vite.' },
  'moucheté':  { key: 'pousse',  quoi: 'vitesse de croissance', pas: 0.10, cap: 1.50, signe: 1,
                 dit: 'Tes bêtes montent de niveau plus vite.' },
  'rayé':      { key: 'gras',    quoi: 'prise de taille',       pas: 0.10, cap: 1.50, signe: 1,
                 dit: 'Une fois mûres, tes bêtes grossissent plus vite — et une grosse bête vaut plus cher.' },
  'tigré':     { key: 'rente',   quoi: 'rente',                 pas: 0.14, cap: 2.00, signe: 1,
                 dit: 'La rente, c’est ce qu’une bête adulte rapporte par seconde en restant simplement dans son enclos, même quand tu n’es pas là.' },
  'marbré':    { key: 'peage',   quoi: 'prix des évolutions',   pas: 0.03, cap: 0.40, signe: -1,
                 dit: 'Faire passer une bête à l’âge suivant coûte moins cher.' },
  'zébré':     { key: 'oeuf',    quoi: 'prix des œufs',         pas: 0.03, cap: 0.40, signe: -1,
                 dit: 'Les œufs de la boutique coûtent moins cher.' },
  'nacré':     { key: 'prodige', quoi: 'chance de chromatique', pas: 0.07, cap: 1.00, signe: 1,
                 dit: 'Une bête chromatique naît une fois sur 8 192. Cette carte améliore ce tirage.' },

  'ocellé':    { key: 'clicAuto', quoi: 'clics automatiques',   pas: 0.10, cap: 1.00, signe: 1,
                 unite: ' clic / s', dec: 1,
                 dit: 'Elle clique à ta place sur ce que tu regardes, tant que la page est ouverte. Elle ne clique pas pendant ton absence : ce qui dépend de ta présence ne se rattrape pas.' },
  /* LE PERLÉ DONNAIT DES ENCLOS, et c'était une mauvaise idée pour trois raisons. Il
     plafonnait dès la DEUXIÈME étoile — la fusion n'avait plus rien à lui offrir. La place
     était déjà servie trois fois par les primes (Paille fraîche, Pâturage, Étable). Et surtout
     il dissolvait la seule tension de la fin de partie, celle que la professeure annonce
     elle-même : « bientôt ce ne sera plus l'argent qui te limitera, mais la place ».

     Le martelé prend l'axe que personne ne touchait : CE QUE VAUT UN CLIC. Deux primes et une
     amélioration s'en occupent, aucune carte. Et il ne double pas l'ocellé — celui-là dit
     combien de clics tombent, celui-ci ce que chacun rapporte. Les deux se multiplient, ce qui
     en fait le premier vrai duo de l'album.

     Le pas est calé pour que la troisième étoile compte : 0,08 × 12 fait 0,96, juste sous le
     plafond. C'est exactement ce qui manquait au perlé. */
  'martelé':   { key: 'clic',     quoi: 'force du clic',        pas: 0.08, cap: 1.00, signe: 1,
                 dit: 'Chacun de tes clics porte plus loin. Elle ne fait pas cliquer à ta place — ça, c’est l’ocellé — elle rend chaque coup plus lourd, y compris ceux qu’une carte ocellée donne pour toi.' },
};

/* LES JETONS D'ASCENSION. Un jeton s'obtient en franchissant un palier de fortune, et
   l'ascension les dépense TOUS. Les paliers montent de MILLE à chaque cran — `JETON_PAS` —
   soit 1, mille, un million, un milliard, mille milliards, et ainsi de suite jusqu'à 10^30.

   CE PARAGRAPHE ANNONÇAIT « UN MILLION À CHAQUE CRAN » et le README avec lui. C'était faux
   d'un facteur mille, et ça n'a pas eu l'air grave tant que personne n'était monté assez
   haut : le mur ne se voit qu'en le heurtant. Il se heurte vers mille milliards.

LES JETONS SE REGAGNENT À CHAQUE CYCLE, et c'est la 3.0.0 qui l'a changé. Ils étaient
   crédités UNE FOIS par palier, pour toute la partie : sauter avec cinq jetons en poche
   laissait à zéro, et il fallait alors multiplier sa fortune par mille pour pouvoir sauter à
   nouveau. Le mur a été rencontré en jouant, à mille milliards de pièces — plus de jeton, et
   le palier suivant à 10^15, soit de l'ordre de mille huit cents ventes maximales.

   Le compte se refait donc à chaque cycle, sur le SOMMET de fortune atteint depuis la
   dernière ascension : `asc.sommet`. Un cycle mené au milliard rend quatre cartes, un cycle
   mené à mille milliards en rend cinq, et repartir n'efface plus rien de définitif.

   CE QUE ÇA COÛTE, ET C'EST ASSUMÉ : le nombre d'ascensions d'une partie n'est plus borné, et
   la puissance de l'album n'est donc plus un nombre calculable avant d'avoir joué. Elle reste
   BORNÉE, mais par les cinq emplacements et les trois étoiles, pas par l'échelle — ce que
   l'échelle bornait vraiment, c'était le temps qu'il fallait pour y arriver, et ce n'était pas
   une borne, c'était un mur.

   `asc.paliers` continue de compter l'échelle franchie pour toute la partie. Il ne donne plus
   de jeton : il sert au déblocage — voir plus bas — et à la ligne de statistiques.

   RIEN N'OBLIGE JAMAIS À ASCENSIONNER. C'est un sacrifice qu'on choisit : on perd sa ferme
   entière contre quelques cartes. Un jeton en poche ne réclame rien, ne clignote pas et
   n'expire pas — il attend.

LE PREMIER SAUT TOMBE EN MILIEU DE PARTIE, pas avant. Un million de pièces suppose d'avoir mené
   des bêtes au bout et d'en avoir vendu ; on n'y arrive pas en cliquant des têtards. La
   version d'avant ouvrait l'ascension sur « mener une bête à l'âge ancien », soit dix-huit
   minutes sans rien avoir automatisé : elle arrivait avant qu'on ait une ferme à sacrifier.

   Cinq paliers sont déclarés. Les derniers sont sans doute hors d'atteinte — une légende
   mythique chromatique vaut environ 5,6·10^11, donc le troisième palier demanderait d'en
   vendre un million. C'est voulu : l'échelle ne s'arrête pas avant l'économie, c'est
   l'économie qui s'arrête avant l'échelle. */
/* ── LA PLONGE ─────────────────────────────────────────────────────────────────
   Le jeu pouvait se rendre INJOUABLE, et c'était à deux minutes du début : zéro bête, zéro œuf,
   et moins que le prix d'un œuf commun — plus de rente, plus rien à cliquer, plus rien à
   vendre. Le seul geste restant était d'effacer la partie. Le chemin le plus court passait par
   le conseil de la professeure : on vend sa première bête pour quarante pièces, elle annonce
   qu'il y a des choses à acheter qui ne sont pas des œufs, la Force du clic en coûte trente.

   Alors on lave des assiettes. DIX CLICS PAR ASSIETTE, UNE PIÈCE PAR ASSIETTE. Cent vingt
   clics pour un œuf commun.

   TOUT EST PLAT ICI, ET RIEN N'Y TOUCHE. Ni la Force du clic, ni la frénésie, ni la Poigne,
   ni la Main preste, ni la carte ocellée : dix clics font une assiette, qu'on ait tout acheté
   ou rien du tout. C'est la seule mécanique du jeu qui ignore volontairement tout ce qu'on a
   construit — parce qu'une punition qui s'achète n'en est pas une, et que celui qui a le plus
   d'améliorations est aussi celui qui aurait dû le moins se retrouver là.

   C'EST UNE PUNITION, ET ELLE EST ASSUMÉE. Une punition pour avoir mal géré, mais rattrapable :
   on ne perd pas sa partie, on perd du temps. Un idle ne doit jamais pouvoir se rendre
   injouable, mais il n'a aucune raison de faire semblant qu'une erreur n'en était pas une.

   ELLE NE S'OUVRE QUE DANS L'IMPASSE, ET SE REFERME DÈS QU'ON EN SORT. Ce n'est pas un détail
   d'équilibrage, c'est ce qui rend tout garde-fou inutile : une plonge qui n'existe que là où
   rien d'autre n'existe ne peut pas devenir un revenu alternatif ni une stratégie d'ouverture.
   Rien à doser, rien à surveiller.

   NI FRÉNÉSIE, NI AUTO-CLIC. Une assiette vaut une pièce quoi qu'on ait acheté : le doublement
   de la frénésie passe par clickPower, qui n'entre pas ici, et la carte ocellée est refusée
   explicitement. Doubler les assiettes récompenserait l'erreur chez le joueur le mieux équipé ;
   laisser la carte les laver ferait que l'erreur ne coûte rien à qui a déjà un album. La
   punition est la même pour tout le monde, sinon elle n'en est plus une pour personne.

   Et rien hors ligne : la plonge est un geste, pas une production.

   C'EST UN ÉTAT DU JEU, PAS UN SUJET DE LA SCÈNE. `subjects()` liste toujours les incubateurs,
   même vides, donc il y a toujours quelque chose en scène et `current()` ne rend jamais null.
   `renderStage` et `tapStage` regardent donc la plonge AVANT de regarder le sujet. */
const ASSIETTE = 1;              // ce que rapporte une assiette lavée
const ASSIETTE_CLICS = 10;       // et ce qu'elle coûte : dix clics, quoi qu'on possède

// Le prix plancher du jeu : l'œuf le moins cher, quoi qu'on ait réglé ailleurs.
const oeufPlancher = () => prixOeuf(EGG_BY_KEY.commun);

/* L'impasse : rien en enclos, rien en couvaison, rien en réserve, et pas de quoi acheter. Les
   quatre ensemble — il suffit d'un œuf qui couve pour qu'il reste quelque chose à faire. */
const enPlonge = () => !state.pen.length && !totalEggs()
                    && !state.incub.some(Boolean)
                    && state.coins < oeufPlancher();

/* L'ÉVIER NE SE MONTRE PAS TOUT SEUL. Être dans l'impasse et voir la vaisselle sont deux
   choses : la première fois, la professeure parle d'abord — elle constate, elle nomme la
   bêtise, elle propose. L'évier n'apparaît qu'après, et c'est tout ce qui sépare un mécanisme
   d'un moment.

   DEUX PORTES DE SECOURS, parce qu'une impasse ne doit jamais dépendre d'un dialogue. Le mode
   histoire éteint ouvre l'évier immédiatement, et une scène déjà jouée aussi : on ne raconte
   la même histoire qu'une fois, et la deuxième fois on a juste besoin de l'évier. */
const plongeOuverte = () => enPlonge() && (!state.tuto || !!(state.vu && state.vu.plonge));

// Combien d'assiettes avant de pouvoir racheter un œuf.
const assiettesRestantes = () =>
  Math.max(0, Math.ceil((oeufPlancher() - state.coins) / ASSIETTE));

/* ── LA PENSION ────────────────────────────────────────────────────────────────
   Deux bêtes désignées, une attente, un œuf dont on connaît déjà la lignée.

   La porte est ouverte depuis la 3.0.0. Elle est restée scellée deux versions, le temps que
   la compatibilité et le drop soient écrits — et c'était le bon ordre : ce sont eux qui
   décident si la pension est un jeu ou une imprimante. La première table de durées en donnait
   une, et la mesure l'a trouvée avant le joueur (voir PENSION_MULT plus bas).

   CE QU'ELLE DONNE, ET CE QU'ELLE NE DONNE PAS. Sans les merveilleuses, la pension est un
   OUTIL DE COLLECTION et non une porte vers l'inaccessible : elle ne rend aucune lignée
   qu'on ne pourrait pas acheter. Ce qu'elle rend, c'est de VISER — un œuf mythique acheté
   donne une mythique au hasard parmi trois, et la collection en demande cent trente-cinq
   formes. Croiser deux loups rend un loup ; c'est tout, et c'est déjà beaucoup quand il
   manque le dernier âge d'une seule lignée.

   CE QUI N'Y EST PAS ENCORE. L'HÉRÉDITÉ : une bête née en pension prend la lignée d'un
   parent, et rien d'autre. Teintes, tempérament et motif se tirent comme pour n'importe quel
   œuf, et les teintes exclusives viendront avec leur propre version.

   LE SACRIFICE EST DANS LES ENCLOS. Les parents ne quittent pas la ferme : ils gardent leur
   case, cessent de rapporter, et n'avancent plus — ni au clic, ni à l'éleveur, ni à la
   mangeoire, et le marchand ne les voit pas. Parquer deux bêtes doit se sentir, et ça ne se
   sent que si ça coûte la seule chose qui manque vraiment en fin de partie : la place. */
/* ELLE S'ACHÈTE. La pension était offerte au deuxième enclos, ce qui la posait au milieu de
   la colonne à un moment où l'on n'a ni bêtes adultes ni enclos à immobiliser : un panneau
   dont chaque bouton refuse. C'est une prime comme les autres désormais — un achat unique, qui
   ne traverse pas l'ascension, et qui tombe dans l'ère rare, là où l'on commence à garder des
   bêtes plutôt que les vendre. */
const PENSION = {
  places: 1,           // combien de couples à la fois, au départ
  base: 900,           // secondes pour deux bêtes qui se ressemblent en tout
  parDistance: 600,    // ce que chaque étiquette non partagée ajoute
  parRarete: 1800,     // ce que chaque cran d'écart de rareté ajoute
  plafond: 24 * 3600,  // au-delà on refuse : une attente de deux jours n'est pas un choix
  ageMin: 3,           // il faut être adulte pour être parent
};

/* LES ÉTIQUETTES — deux axes, un MILIEU et un CORPS, une valeur de chacun par lignée.

   Deux axes et pas un seul, parce qu'un seul ne donne qu'un oui ou non. Deux donnent trois
   crans — tout en commun, la moitié, rien — et la règle reste devinable sans wiki : DEUX BÊTES
   SE REPRODUISENT D'AUTANT PLUS VITE QU'ELLES SE RESSEMBLENT. Loup et ours, c'est évident ;
   oiseau et crabe aussi.

   Mesuré sur les 351 paires possibles : 11 % à distance 0, 37 % à distance 1, 44 % à
   distance 2, et 7 % stériles. La plupart des couples sont donc médiocres, et le dixième qui
   ne l'est pas se mérite — ce qui est exactement ce qu'on veut d'un système de sélection.

   LA PIERRE NE SE CROISE AVEC RIEN. Le golem est seul de son corps, et c'est délibéré : une
   règle de stérilité doit se raconter en cinq mots, et « on ne croise pas la pierre » les tient.

   L'oiseau et le papillon partagent « plume » — un papillon n'a pas de plumes, mais il a des
   ailes couvertes d'écailles poudreuses, et le rapprochement dit quelque chose de vrai sur ce
   que ces deux-là ont en commun. Le mot compte moins que la paire qu'il autorise. */
const ETIQUETTES = {
  crapaud:    ['terre', 'nu'],       poisson:    ['eau',   'écaille'],
  lezard:     ['terre', 'écaille'],  oiseau:     ['ciel',  'plume'],
  crocodile:  ['eau',   'écaille'],  insecte:    ['terre', 'carapace'],
  rongeur:    ['terre', 'poil'],     chiroptere: ['ciel',  'poil'],
  escargot:   ['terre', 'carapace'], crabe:      ['eau',   'carapace'],
  loup:       ['terre', 'poil'],     meduse:     ['eau',   'nu'],
  salamandre: ['terre', 'nu'],       serpent:    ['ciel',  'écaille'],
  araignee:   ['terre', 'carapace'], cerf:       ['terre', 'poil'],
  ours:       ['terre', 'poil'],     papillon:   ['ciel',  'plume'],
  tortue:     ['eau',   'carapace'], chat:       ['terre', 'poil'],
  kraken:     ['eau',   'nu'],       golem:      ['terre', 'pierre'],
  sphinx:     ['terre', 'poil'],     cheval:     ['terre', 'poil'],
  chimere:    ['terre', 'poil'],     behemoth:   ['terre', 'écaille'],
  ouroboros:  ['terre', 'écaille'],
  /* LES DEUX MERVEILLES ONT LEURS ÉTIQUETTES, comme tout le monde : une merveille peut être
     parent. Wukong est de PIERRE — né d'un œuf de pierre, il ne se croise donc avec rien
     d'autre que la pierre, exactement comme le golem dont il sort. La règle qui l'a fait naître
     est celle qui l'isole ensuite, et c'est bien. */
  kitsune:    ['terre', 'poil'],     wukong:     ['terre', 'pierre'],
  tarasque:   ['eau',   'écaille'],
};

/* CE QUI RALENTIT UNE COUVAISON, ET POURQUOI CE FACTEUR-LÀ.

   La première version ne pénalisait que l'écart de rareté, et la mesure a trouvé le trou tout
   de suite : deux mythiques de même corps sont à écart NUL, donc à durée minimale, alors que
   ce qui en sort vaut cent quatre-vingts millions. Quinze minutes pour un œuf mythique — sept
   cent vingt millions l'heure, une imprimante à billets.

   Le facteur manquant est la RICHESSE, pas l'écart. La durée se multiplie donc par la rareté
   du parent le MOINS rare — le moins rare et non le plus, parce que c'est sa lignée qui sort
   dans quatre-vingt-dix-neuf pour cent des cas quand l'écart est grand. Deux mythiques passent
   ainsi de quinze minutes à seize heures. */
const PENSION_MULT = { commune: 1, rare: 4, epique: 16, mythique: 64, merveilleuse: 256 };

/* LA CHANCE QUE L'ENFANT PRENNE LA LIGNÉE DU PARENT LE PLUS RARE, selon l'écart. À égalité
   c'est un tirage à pile ou face ; au-delà, ça devient une loterie et non un robinet. Un
   pour cent sur trois crans d'écart : croiser une commune avec une mythique reste un pari, pas
   une stratégie. */
const PENSION_CHANCE = [0.5, 0.20, 0.05, 0.01];

/* ── LES RECETTES ──────────────────────────────────────────────────────────────
   Un couple précis, une durée à lui, et une chance sur cent ou sur mille de rendre autre chose
   que ce que la pension rend d'habitude. C'est la seule façon d'obtenir une merveilleuse.

   UNE RECETTE N'EST PAS UNE PORTE, C'EST UN TIRAGE. Le couple pond normalement — la lignée
   d'un des deux parents, comme n'importe quel couple — et la merveille sort par-dessus, de
   temps en temps. Rien à débloquer, rien à cocher : on peut tomber dessus sans savoir, ce qui
   fait qu'une merveille EXISTE dans le monde avant que quiconque sache la fabriquer.

   CHACUNE PORTE SA PROPRE DURÉE, et n'emprunte rien à la formule ordinaire. Celle-ci est
   calibrée pour l'élevage — durée × richesse des parents — et une merveille n'est pas de
   l'élevage. Deux pierres, notamment, ne couvent pas : rien n'est élevé là-dedans, il y a une
   pierre qui finit par se fendre, et c'est la plus courte attente du jeu.

   POURQUOI DEUX ROUTES PAR MERVEILLE, ET POURQUOI ELLES NE DISENT PAS LA MÊME CHOSE :

   • L'ACCIDENT — des parents qu'on a déjà, un pour mille. Personne ne le vise. C'est ce qui
     fait qu'une merveille se rencontre avant de se chercher.
   • LA RECETTE — le couple exact, un pour cent. C'est la route.

   L'exact doit toujours écraser l'accident en rendement, sinon il ne sert à rien. Mesuré :
   0,083 %/h contre 0,020 pour la Kitsune, 0,100 contre rien pour Wukong. Un facteur quatre :
   l'accident n'est jamais une stratégie, seulement une histoire.

   CE QUE ÇA COÛTE EN TEMPS RÉEL, la pension tournant jour et nuit (elle avance hors ligne) :
   trente-quatre jours de médiane pour la Kitsune par sa recette, vingt-neuf pour Wukong. Un
   mois chacune, par deux chemins qui n'ont rien à voir — l'une se trouve, l'autre se cherche.

   UN MYTHIQUE PAR FAMILLE, ET LA CHIMÈRE N'EN EST PAS UNE. Elle était le carrefour de la
   moitié des recettes, au motif qu'elle est faite d'autres bêtes — mais c'était lui prêter le
   rôle inverse du sien. Une chimère ne CONCENTRE pas, elle DISPERSE : deux chimères donnent
   n'importe quoi, et c'est tout ce qu'elles font. Le carrefour d'une merveille doit dire de
   quoi elle est faite, pas seulement qu'elle est composite.

   Chaque mythique porte donc un axe, et ses merveilles s'y rattachent :

     Ouroboros   ce qui gagne avec le temps        Kitsune
     Golem       ce qui naît de la pierre          Sun Wukong
     Béhémoth    ce qui sort de la terre           l'Olgoï-Khorkhoï, Typhon
     Chimère     rien — elle est le joker

   Ça donne au joueur une carte mentale au lieu d'une liste, et ça laisse la Chimère faire la
   seule chose qu'elle sache faire. */
const RECETTES = [
  /* KITSUNE. Elle n'a pas neuf queues parce qu'elle est composite : elle en a neuf DEPUIS
     TOUJOURS et les montre une par siècle. Son axe est le temps, donc l'Ouroboros.

     La recette : celui qui pose une énigme pour dévorer, et celui qui ne finit jamais. Ce qui
     en sort cache neuf queues et mille ans. L'accident : Bastet et le temps — le félin donne
     la silhouette, l'anneau donne les siècles, et il manque l'énigme. */
  { a: 'ouroboros', b: 'sphinx', donne: 'kitsune', duree: 12 * 3600, chance: 0.01 },
  { a: 'ouroboros', b: 'chat',   donne: 'kitsune', duree:  5 * 3600, chance: 0.001 },

  /* SUN WUKONG. Il naît d'un œuf de pierre, sur une montagne, sans parents : le mythe ne
     demande pas de singe, il demande une pierre qui s'ouvre. Or « on ne croise pas la pierre »
     laisse passer exactement un couple, et personne n'a de raison de l'essayer. Une
     interdiction devient un secret, et il n'y a pas de seconde route. */
  { a: 'golem',   b: 'golem',  donne: 'wukong',  duree:  1 * 3600, chance: 0.001 },
];

/* CE QUI SE PASSE APRÈS LA PREMIÈRE, et c'est voulu : une merveille se reproduit comme le
   reste. Elle n’a pas de règle à part — `ligneeDe` la traite comme n’importe quel parent,
   et la recette n'est le passage obligé que pour la PREMIÈRE. Ce que ça donne, mesuré :

     Wukong × golem     20 h   5 %    il retourne à la pierre dont il sort
     Kitsune × sphinx   20 h   5 %    par la même famille que sa recette
     Kitsune × loup      7 h   1 %    la route pauvre, plus lente en rendement
     Kitsune × chimère  48 h   —      refusé : au-delà du plafond

   La seconde est donc plus facile que la première, et c'est la bonne asymétrie : elle donne
   une raison de GARDER une merveille plutôt que de la vendre, ce qui est exactement ce qu'on
   veut d'une bête de collection. Le rang reste tenu par la seule règle qui compte — aucun œuf
   n'en donne — et la première coûte un mois. */

/* La recette de ce couple, ou null. L'ordre des deux parents n'entre jamais en compte : on
   désigne deux bêtes, pas un père et une mère. */
function recetteDe(a, b) {
  if (!a || !b) return null;
  const x = lineOf(a).key, y = lineOf(b).key;
  return RECETTES.find(r => (r.a === x && r.b === y) || (r.a === y && r.b === x)) || null;
}

/* LE PLAFOND DE LA RÉSERVE D'ŒUFS. Le plan le réclamait AVANT la pension et jamais après :
   c'est le seul frein du hors-ligne, et une partie qui tournerait déjà sans lui rentrerait sur
   des centaines d'œufs le jour où on l'ajouterait. Il borne l'achat par lots comme la ponte :
   un couple dont la sorte est pleine garde son œuf et attend. */
const PLAFOND_OEUFS = 50;

/* ── LES PRIMES ────────────────────────────────────────────────────────────────
   Des achats UNIQUES, en petites cases, qui s'allument dès qu'on a de quoi. Une amélioration
   à niveaux dit toujours la même chose — « couveuse niv. 5 → niv. 6 » — et cinquante achats
   plus tard elle la dit encore. Une prime dit une chose et une seule, puis se tait : c'est ce
   qui permet d'en écrire vingt différentes plutôt qu'une répétée vingt fois.

   ELLES NE TRAVERSENT PAS L'ASCENSION. Ce sont des améliorations comme les autres — la ferme
   repart de zéro, et les primes avec elle. Seul l'album voyage.

   Les quatre premières étaient déjà là, au milieu de la liste à niveaux où elles n'avaient
   rien à faire : l'acheteur, le marchand et l'évolution ne montent pas, ils s'allument. Et
   l'intendant, qui montait, se dit mieux en deux crans nommés qu'en trente niveaux.

   L'ordre de la table EST l'ordre des prix : c'est lui qui dessine la grille, et un prix
   déplacé déplace la case toute seule. */
const PRIMES = [
  { cle: 'soin',      prix: 250,       glyphe: '💗', nom: 'Soins attentifs',
    dit: 'Le bonheur de la bête que tu regardes monte deux fois plus vite — donc deux fois plus de cadeaux.' },
  { cle: 'nichoir',   prix: 600,       glyphe: '🪺', nom: 'Nichoir',
    dit: 'Deux incubateurs de plus, offerts. Ils ne font pas monter le prix des suivants.' },
  { cle: 'paille',    prix: 1200,      glyphe: '🌾', nom: 'Paille fraîche',
    dit: 'Deux enclos de plus, offerts. Ils ne font pas monter le prix des suivants.' },
  { cle: 'acheteur',  prix: 2000,      glyphe: '🥚', glyphe: '🥚', nom: 'Acheteur automatique',
    dit: 'Rachète un œuf dès qu’un incubateur se libère et que ta réserve est vide.' },
  { cle: 'negoce-commune', prix: 4000, glyphe: '🪙', nom: 'Négoce commun',
    dit: 'Les communes se vendent un quart plus cher.' },
  { cle: 'poigne',    prix: 8000,      glyphe: '✊', nom: 'Poigne',
    dit: 'Trois secondes de plus à chaque clic, quoi que tu aies acheté par ailleurs.' },
  { cle: 'marchand',  prix: 15000,     glyphe: '🤝', glyphe: '🤝', nom: 'Marchand automatique',
    dit: 'Vend les bêtes mûres tout seul, à l’âge que tu règles pour chaque rareté.' },
  { cle: 'grossiste', prix: 30000,     glyphe: '📦', nom: 'Grossiste',
    dit: 'Les œufs de la boutique coûtent un cinquième de moins.' },
  { cle: 'evolution', prix: 50000,     glyphe: '🧬', glyphe: '🧬', nom: 'Évolution automatique',
    dit: 'Fait passer les bêtes mûres d’un âge au suivant, jusqu’où tu décides. Elle agit avant le marchand.' },
  /* ── LES NÉGOCES ARRIVENT AVEC LEUR RARETÉ ──
     Ils étaient posés BIEN AVANT elle, et le compte était clair : le négoce rare coûtait
     80 000 quand un œuf rare en coûte 300 000, l'épique 2 M pour un œuf à 7,5 M, le mythique
     80 M pour un œuf à 180 M. Chacun valait le QUART de l'œuf de sa rareté — donc chacun
     s'offrait longtemps avant qu'on puisse posséder ce qu'il améliore.

     C'était pire qu'inutile : la grille ne montre que CINQ primes à la fois, donc une prime
     qui n'agit sur rien occupe une case, retarde les quatre qui la suivent, et se paie pour ne
     rien sentir. Le plan appelle ça une MARCHE VIDE, et c'est le premier défaut qu'il demande
     de chercher quand on révise les primes.

     Deux corrections, et il faut les deux. LA GARDE d'abord : la prime n'apparaît pas tant
     qu'on n'a pas VU la rareté — c'est la doctrine du rang secret, appliquée ici. Elle se
     règle toute seule sur une rare tombée par chance, ce qu'un prix ne saurait pas faire.
     LE PRIX ensuite : gardé à 80 000, le négoce rare apparaîtrait le jour où l'on a de quoi
     acheter un œuf à 300 000, c'est-à-dire comme un cadeau et non comme une décision. Chacun
     vaut donc DEUX ŒUFS de sa rareté — on en a un, on en veut d'autres. */
  { cle: 'intendance', prix: 250000,   glyphe: '📋', nom: 'Intendance',
    dit: 'Chaque évolution coûte un quart de moins. Passé l’ère commune, ce n’est plus la vitesse qui freine mais la mise de fonds.' },
  { cle: 'pension',   prix: 400000,    glyphe: '🛖', glyphe: '🛖', nom: 'La pension',
    dit: 'Un bâtiment où confier deux bêtes adultes. Elles gardent leur enclos, cessent de rapporter, et pondent un œuf dont tu connais déjà la lignée.' },
  { cle: 'oeil',      prix: 500000,    glyphe: '👁️', nom: 'Œil exercé',
    dit: 'Une chance sur deux de plus de voir naître un chromatique — de 1 sur 8 192 à 1 sur 5 461.' },
  { cle: 'valeur-1', prix: 600000, glyphe: '🗣️', nom: 'Bouche à oreille',
    dit: 'On parle de ta ferme au marché. Cinq pour cent de valeur en plus sur tout ce que tu élèves — à la vente comme à la rente.',
    bonus: { valeur: 0.05 } },
  /* PREMIER CARREFOUR. Trois routes qui ne se comparent pas : un PRIX qui baisse, une VITESSE
     qui monte, un GESTE qui pèse. C'est ce qui en fait un choix plutôt qu'un menu — on ne peut
     pas dire laquelle est « la plus grosse », il faut dire comment on joue. */
  { cle: 'carrefour-1', prix: 700000, glyphe: '🜁', nom: 'Le premier carrefour',
    dit: 'Trois routes. Tu en prends une, les deux autres se ferment jusqu’à la prochaine ascension.',
    choix: [
      { cle: 'route-bourse', glyphe: '🪙', nom: 'La bourse',
        dit: 'Les œufs de la boutique coûtent un quart de moins. Tu achètes plus, tu couves plus.',
        bonus: { oeuf: 0.25 } },
      { cle: 'route-ardeur', glyphe: '⚡', nom: 'L’ardeur',
        dit: 'Tout ce qui pousse va un tiers plus vite — couvaison, croissance, engraissement.',
        bonus: { vitesse: 0.33 } },
      { cle: 'route-poigne', glyphe: '✊', nom: 'La poigne',
        dit: 'Chacun de tes clics porte deux fois plus loin. C’est ta main qu’on récompense, pas ta ferme.',
        bonus: { clic: 1 } },
    ] },
  { cle: 'generosite', prix: 1000000,  glyphe: '🎁', nom: 'Générosité',
    dit: 'Les cadeaux de frénésie durent deux fois plus longtemps, et le plafond suit.' },
  { cle: 'vitesse-1', prix: 1500000, glyphe: '🐓', nom: 'Réveil matinal',
    dit: 'Tout ce qui pousse tout seul pousse cinq pour cent plus vite : la couvaison, la croissance, l’engraissement.',
    bonus: { vitesse: 0.05 } },
  { cle: 'rente-1', prix: 2500000, glyphe: '🛏️', nom: 'Litière profonde',
    dit: 'Cinq pour cent de rente en plus. Ne touche pas au prix de vente : ça ne paie que si tu gardes.',
    bonus: { rente: 0.05 } },
  { cle: 'intendance2', prix: 5000000, glyphe: '📜', nom: 'Grande intendance',
    dit: 'Encore un quart de moins sur chaque évolution, par-dessus l’Intendance.' },
  { cle: 'valeur-2', prix: 8000000, glyphe: '🪧', nom: 'Enseigne peinte',
    dit: 'Dix pour cent de valeur en plus. Une ferme qui a une enseigne est une ferme dont on retient le nom.',
    bonus: { valeur: 0.10 } },
  { cle: 'couvoir',   prix: 12000000,  glyphe: '🏠', nom: 'Couvoir',
    dit: 'Trois incubateurs de plus, offerts.' },
  { cle: 'vitesse-2', prix: 15000000, glyphe: '⚡', nom: 'Ardeur',
    dit: 'Dix pour cent de vitesse en plus sur tout ce qui pousse. Elle ne remplace aucun automate, elle les multiplie.',
    bonus: { vitesse: 0.10 } },
  /* SECOND CARREFOUR, même règle et trois natures différentes : un péage qui baisse, une
     valeur qui monte, une rente qui porte. Il tombe assez tard pour que les trois routes
     décrivent des fins de partie distinctes, et pas trois façons d'aller au même endroit. */
  { cle: 'carrefour-2', prix: 25000000, glyphe: '🜃', nom: 'Le second carrefour',
    dit: 'Trois routes, encore. Ce que tu choisis ici dit comment tu finiras ce cycle.',
    choix: [
      { cle: 'route-peage', glyphe: '🧬', nom: 'Le péage allégé',
        dit: 'Faire monter une bête d’un âge coûte un tiers de moins. Tu mènes plus loin, plus souvent.',
        bonus: { peage: 0.33 } },
      { cle: 'route-negoce', glyphe: '🏷️', nom: 'Le grand négoce',
        dit: 'Vingt pour cent de valeur en plus sur tout ce que tu élèves — vente comme rente.',
        bonus: { valeur: 0.20 } },
      { cle: 'route-repos', glyphe: '🛏️', nom: 'Le long repos',
        dit: 'Trente pour cent de rente en plus. Ta ferme travaille pendant que tu regardes ailleurs.',
        bonus: { rente: 0.30 } },
    ] },
  { cle: 'paturage',  prix: 30000000,  glyphe: '🏞️', nom: 'Pâturage',
    dit: 'Trois enclos de plus, offerts.' },
  { cle: 'rente-2', prix: 40000000, glyphe: '💧', nom: 'Abreuvoir',
    dit: 'Dix pour cent de rente en plus. Une bête qui boit à sa soif rapporte sans qu’on la touche.',
    bonus: { rente: 0.10 } },
  { cle: 'negoce-rare', prix: 110000000, glyphe: '🔷', nom: 'Négoce rare',
    dit: 'Les rares se vendent un quart plus cher.',
    si: () => rareteVue('rare') },
  { cle: 'valeur-3', prix: 120000000, glyphe: '📯', nom: 'Renom',
    dit: 'Quinze pour cent de valeur en plus. À ce stade, ce n’est plus toi qui cherches des acheteurs.',
    bonus: { valeur: 0.15 } },
  { cle: 'main',      prix: 200000000, glyphe: '🖐️', nom: 'Main preste',
    dit: 'Chacun de tes clics compte double. Le plus cher, et le seul qui touche à ce que tu fais de tes mains.' },
  { cle: 'vitesse-3', prix: 300000000, glyphe: '👟', nom: 'Bon pied',
    dit: 'Quinze pour cent de vitesse en plus. Le temps ne se rattrape pas, mais il se serre.',
    bonus: { vitesse: 0.15 } },
  { cle: 'rente-3', prix: 800000000, glyphe: '🛋️', nom: 'Patience',
    dit: 'Quinze pour cent de rente en plus. La seule prime du jeu qui paie uniquement pour ne rien faire.',
    bonus: { rente: 0.15 } },
  { cle: 'valeur-4', prix: 2000000000, glyphe: '🏆', nom: 'On vient de loin',
    dit: 'Vingt pour cent de valeur en plus, et le compte est bon : cinquante pour cent en tout si tu as pris les quatre.',
    bonus: { valeur: 0.20 } },
  { cle: 'vitesse-4', prix: 5000000000, glyphe: '🌪️', nom: 'Sans relâche',
    dit: 'Vingt pour cent de vitesse en plus. La dernière du lot, et la quatrième qui compte.',
    bonus: { vitesse: 0.20 } },
  { cle: 'rente-4', prix: 15000000000, glyphe: '🌝', nom: 'Rien ne presse',
    dit: 'Vingt pour cent de rente en plus. La prime la plus chère du jeu, pour la façon de jouer la plus lente.',
    bonus: { rente: 0.20 } },

  /* ── LA FIN DE PARTIE CESSAIT D'ÊTRE UN CHOIX ─────────────────────────────────
     Mesuré sur la table : DES DIX DERNIÈRES PRIMES, NEUF ÉTAIENT DE LA PENSION. Un joueur qui
     ne l'élève pas n'avait plus rien à acheter passé quinze milliards — les trois familles
     globales s'arrêtent là, et tout le reste améliorait des nids.

     Le défaut n'était pas des marches vides : l'échelle des prix est saine, ses rapports
     tiennent entre 1,2 et 2,7 d'un bout à l'autre. Le défaut était MONOTHÉMATIQUE.

     Les quatre primes qui suivent prennent les trois leviers que rien ne touchait après le
     milieu de partie — le PÉAGE, le PRIX DES ŒUFS, le CLIC — plus un troisième carrefour. Ils
     existaient déjà comme familles de motifs d'album ; c'est la 4.1.0 qui a appris aux primes
     à s'en servir, et c'est ce qui rend cette révision possible sans inventer une mécanique.

     LES FAMILLES GLOBALES N'ONT PAS GAGNÉ DE CINQUIÈME CRAN, et c'était tentant : quatre crans
     à 5, 10, 15 et 20 % font cinquante pour cent par famille, un chiffre annoncé et tenu
     ailleurs dans ce fichier. L'étirer aurait réglé la variété en cassant une règle. */
  { cle: 'peage-1', prix: 20000000000, glyphe: '🗝️', nom: 'Le grand œuvre',
    dit: 'Faire monter une bête d’un âge coûte un quart de moins. Le péage se paie à chaque évolution : c’est là qu’une fin de partie se joue.',
    bonus: { peage: 0.25 } },
  { cle: 'oeuf-1', prix: 50000000000, glyphe: '🛒', nom: 'Marché de gros',
    dit: 'Les œufs de la boutique coûtent un quart de moins, quelle que soit leur rareté. Un mythique à cent trente-cinq millions au lieu de cent quatre-vingts.',
    bonus: { oeuf: 0.25 } },
  { cle: 'clic-1', prix: 120000000000, glyphe: '🤜', nom: 'Poing d’acier',
    dit: 'Chacun de tes clics porte deux fois plus loin. En fin de partie, une bête menée au bout paie au clic — et c’est ce qui rend ce poing utile.',
    bonus: { clic: 1 } },
  /* TROISIÈME CARREFOUR, et il arrive assez tard pour que les trois routes décrivent trois
     fins de partie et non trois façons d'aller au même endroit. Même règle que les deux
     autres : un prix, une vitesse, un geste — trois grandeurs qui ne se comparent pas. */
  { cle: 'carrefour-3', prix: 400000000000, glyphe: '🜄', nom: 'Le dernier carrefour',
    dit: 'Trois routes, une dernière fois. Celle-ci décide de ce que ta ferme aura été.',
    choix: [
      { cle: 'route-couvee', glyphe: '🔥', nom: 'La grande couvée',
        dit: 'Les œufs coûtent moitié moins. Tu en achètes deux fois plus, tu en éclos deux fois plus.',
        bonus: { oeuf: 0.50 } },
      { cle: 'route-lignee', glyphe: '👑', nom: 'La lignée',
        dit: 'Trente pour cent de valeur en plus. Ce que tu élèves vaut ce qu’il n’a jamais valu.',
        bonus: { valeur: 0.30 } },
      { cle: 'route-fureur', glyphe: '💥', nom: 'La fureur',
        dit: 'Tes clics portent trois fois plus loin. La ferme travaille, mais c’est ta main qui frappe.',
        bonus: { clic: 2 } },
    ] },
  /* LES DEUX DERNIERS NÉGOCES FERMENT LA LISTE, et ils ne l'ont pas toujours fermée : ils
     vivaient au milieu, à 2,5 et 60 milliards. Un négoce vaut DEUX ŒUFS DE SA RARETÉ — c'est
     ce qui en fait une décision plutôt qu'un cadeau — donc le prix de l'œuf épique les a
     emportés avec lui. La table est un escalier de prix : ils prennent la marche qui leur
     revient, tout en bas de la liste au lieu du milieu. */
  { cle: 'negoce-epique', prix: 2200000000000, glyphe: '🔮', nom: 'Négoce épique',
    dit: 'Les épiques se vendent un quart plus cher.',
    si: () => rareteVue('epique') },

  { cle: 'negoce-mythique', prix: 50000000000000, glyphe: '👑', nom: 'Négoce mythique',
    dit: 'Les mythiques se vendent un quart plus cher.',
    si: () => rareteVue('mythique') },
];
/* COMBIEN DE PRIMES LA GRILLE MONTRE À LA FOIS. Cinq : c'est ce qu'on peut comparer d'un
   coup d'œil sans faire d'arbitrage, et ça tient sur une ligne de grille aux tailles usuelles.
   La bascule ne se sauvegarde pas — c'est un coup d'œil, pas un réglage. */
const PRIMES_VUES = 5;

/* ── LES FAVEURS ───────────────────────────────────────────────────────────────
   Un tirage de trois cartes, on en prend UNE, et un nouveau tirage prend sa place. Sans fin.

   C'EST LA RÉPONSE À UNE LISTE QUI SE TERMINE. Les primes sont cinquante et une, et les dix
   dernières sont presque toutes de pension : arrivé là, il n'y a plus rien à acheter et plus
   rien à décider. Une queue infinie de petites faveurs rend au dernier tiers de partie ce que
   le premier avait — un prochain achat.

   DIX CARTES, DIX LEVIERS, UNE CARTE PAR LEVIER. Le carrefour l'avait déjà écrit : « +10 % de
   vente / +10 % de rente / +10 % de vitesse » est un menu, pas un choix — on prend le plus
   gros nombre. La règle tient ici aussi, mais elle se respecte AUTREMENT : les trois cartes
   tirées portent forcément trois leviers différents, donc trois grandeurs qui ne se comparent
   pas. Deux tailles du même levier dans le sac auraient ramené le menu.

   ELLES SONT FAIBLES, ET C'EST LE POINT. Cinq pour cent ne se sent pas ; c'est la soixantième
   qui se sent. Une faveur forte serait un carrefour de plus, et le carrefour existe déjà.

   LE TIRAGE EST RANGÉ DANS L'ÉTAT, JAMAIS RECALCULÉ À L'AFFICHAGE. Un tirage qui se refait à
   chaque image, c'est une machine à sous qu'on regarde tourner en attendant le bon lot — et
   la même faute que les étoiles du ciel qui scintillaient. Il ne bouge qu'en prenant une carte.

   L'AUTO-CLIC N'EST PAS DANS LE SAC. Il est l'identité d'un motif de carte, l'ocellé, et une
   identité qu'on distribue au hasard n'en est plus une. */
const FAVEURS = [
  { cle: 'renommee',  glyphe: '📯', nom: 'La renommée', levier: 'valeur',
    bonus: { valeur: 0.05 },   dit: 'Tes bêtes se vendent 5 % plus cher.' },
  { cle: 'habitude',  glyphe: '🪙', nom: 'La bonne habitude', levier: 'rente',
    bonus: { rente: 0.05 },    dit: 'Tes enclos rapportent 5 % de plus.' },
  { cle: 'entrain',   glyphe: '💨', nom: 'L’entrain', levier: 'vitesse',
    bonus: { vitesse: 0.05 },  dit: 'Tout ce qui pousse, couve et engraisse va 5 % plus vite.' },
  { cle: 'adresse',   glyphe: '🏷', nom: 'La bonne adresse', levier: 'oeuf', remise: true,
    bonus: { oeuf: 0.05 },     dit: 'Les œufs coûtent 5 % de moins. La remise se rapproche de son mur sans jamais l’atteindre.' },
  { cle: 'passe',     glyphe: '🎟', nom: 'Le laissez-passer', levier: 'peage', remise: true,
    bonus: { peage: 0.05 },    dit: 'Les évolutions coûtent 5 % de moins. La remise se rapproche de son mur sans jamais l’atteindre.' },
  { cle: 'doigte',    glyphe: '👆', nom: 'Le doigté', levier: 'clic',
    bonus: { clic: 0.08 },     dit: 'Chaque clic pèse 8 % de plus.' },
  { cle: 'couvaison', glyphe: '🔥', nom: 'La bonne couvaison', levier: 'couvee',
    bonus: { couvee: 0.06 },   dit: 'Les œufs couvent 6 % plus vite.' },
  { cle: 'fourrage',  glyphe: '🌾', nom: 'Le bon fourrage', levier: 'pousse',
    bonus: { pousse: 0.06 },   dit: 'Les jeunes grandissent 6 % plus vite.' },
  { cle: 'ration',    glyphe: '🥣', nom: 'La ration double', levier: 'gras',
    bonus: { gras: 0.06 },     dit: 'Les bêtes mûres engraissent 6 % plus vite.' },
  { cle: 'oeil-neuf', glyphe: '👁', nom: 'L’œil neuf', levier: 'prodige',
    bonus: { prodige: 0.10 },  dit: 'Un dixième de chance en plus de voir naître un chromatique.' },
];
const FAVEUR_BY_KEY = Object.fromEntries(FAVEURS.map(f => [f.cle, f]));
const FAVEUR_MAIN = 3;

/* LE PRIX MONTE, SINON LA QUEUE DEVIENT LE JEU. À ×1,4 la faveur suit à peu près l'échelle des
   primes : la première coûte cent mille, la vingtième quatre-vingt-trois millions, la
   cinquantième deux mille milliards — soit le prix de la toute dernière prime. Au-delà, elle
   monte plus vite que la ferme, ce qui est exactement ce qu'on veut d'une chose infinie. */
const FAVEUR_BASE = 100000, FAVEUR_MULT = 1.4;
const faveurEtat  = () => (state.faveurs = state.faveurs || { pris: 0, acquis: {}, main: [] });
const faveursPris = () => faveurEtat().pris || 0;
const prixFaveur  = () => Math.round(FAVEUR_BASE * Math.pow(FAVEUR_MULT, faveursPris()));
const faveurCombien = cle => faveurEtat().acquis[cle] || 0;

/* ELLES S'OUVRENT AU PREMIER CARREFOUR, et pas avant. Un tirage aléatoire posé sous le nez
   d'un joueur qui n'a pas encore choisi une seule fois entre deux primes ne s'explique pas
   tout seul ; passé le carrefour, il n'a plus rien à expliquer. */
const faveursOuvertes = () => primeFaite(PRIMES.find(p => p.cle === 'carrefour-1'));

/* LES TROIS CARTES PORTENT TROIS LEVIERS DIFFÉRENTS — c'est le sac qui le garantit, une carte
   par levier, mais on tire quand même sans remise pour que la règle survive à une table qui
   grandirait. */
function mainFaveurs() {
  const e = faveurEtat();
  if (e.main && e.main.length === FAVEUR_MAIN) return e.main;
  const sac = FAVEURS.slice();
  const main = [];
  while (main.length < FAVEUR_MAIN && sac.length) {
    main.push(sac.splice(Math.floor(Math.random() * sac.length), 1)[0].cle);
  }
  e.main = main;
  return main;
}

function prendreFaveur(cle) {
  if (!faveursOuvertes()) return false;
  const f = FAVEUR_BY_KEY[cle];
  const e = faveurEtat();
  if (!f || e.main.indexOf(cle) < 0 || state.coins < prixFaveur()) return false;
  state.coins -= prixFaveur();
  e.acquis[cle] = (e.acquis[cle] || 0) + 1;
  e.pris = (e.pris || 0) + 1;
  e.main = [];                       // le tirage suivant se fera à la prochaine lecture
  oublierPrimes();
  annoncerAchat(f, [440, 587, 740]);
  refresh();
  save();
  return true;
}
let primesPrises = false;

// Le jeu n'en a pas besoin — il parcourt PRIMES — mais le banc d'essai désigne les primes
// par leur clé, et une table de correspondance vaut mieux qu'un find() dans chaque scénario.
const PRIME_BY_CLE = Object.fromEntries(PRIMES.map(p => [p.cle, p]));

/* ── LE DÉVOILEMENT ────────────────────────────────────────────────────────────
   Un joueur qui ouvre le jeu possède zéro pièce et un œuf, et on lui montrait au même
   instant quatorze boutons dont treize inachetables. La seule chose qui compte à cette
   seconde-là — SEUL LE CLIC FAIT QUELQUE CHOSE — se noyait sous une boutique.

   Un achat n'apparaît donc qu'à 60 % de son prix. Le seuil est CALCULÉ, jamais recopié :
   un prix qui change déplace son seuil tout seul. Et les prix de base sont déjà ordonnés —
   60, 120, 150, 400, 500, 1 000, 2 000, 15 000, 50 000, 250 000 — si bien que l'escalier
   d'apprentissage sort des prix eux-mêmes, sans qu'on écrive nulle part « après celui-ci,
   celui-là ».

   ON VOIT TOUJOURS LA MARCHE SUIVANTE, JAMAIS L'ESCALIER. Le premier achat non dévoilé
   reste affiché, éteint, avec son prix : cacher purement enlèverait la notion d'échelle,
   et voir une chose hors de prix est ce qui fait avancer un joueur d'idle.

   Une fois dévoilé, RIEN NE SE RECACHE. Le prix d'un incubateur monte à chaque achat ; sans
   cette mémoire, il disparaîtrait juste après avoir été acheté. */
const SEUIL_VOIR = 0.6;

/* Les notes du mode histoire. Une par étape, dans l'ordre, chacune à usage unique — c'est la
   même forme que les jalons d'ascension, et pour la même raison : une table se relit, une
   cascade de `if` se perd.

   `dit` s'affiche une seule fois, dans le bandeau du haut, et ne revient jamais. Aucune ne
   bloque : on peut toutes les ignorer et jouer. Elles s'arrêtent pour l'instant à l'enclos —
   la suite s'écrira en jouant, quand on saura lesquelles manquent vraiment. */
/* ── LA PROFESSEURE ────────────────────────────────────────────────────────────
   Le mode histoire ne récite plus des consignes : quelqu'un les dit. C'est toute la
   différence entre « clique sur l'œuf » et « il ne demande qu'une chose, et rien d'autre ne
   la fera à ta place ».

   Elle n'a pas encore de portrait. Le glyphe tient la place exactement comme les emoji
   tiennent celle des créatures : le jour où le dessin arrive, on pose un fichier dans `art/`
   et on remplit `portrait` — rien d'autre ne bouge.

   Un seul endroit à changer pour la renommer ou changer de personne. */
const PROF = {
  nom: 'Professeure Aubier',
  glyphe: '🔬',
  portrait: null,          // 'art/prof-aubier.png' le jour venu
};

/* Les SCÈNES du mode histoire. Chacune a une condition et plusieurs répliques, et la scène
   n'est marquée jouée qu'à la dernière — un rechargement au milieu la reprend où on l'a
   laissée plutôt que d'avaler le reste.

   UNE RÉPLIQUE EST UNE PHRASE, OU UNE PHRASE ET UNE ACTION :

     'Ah, te voilà.'                                    on avance d'un clic
     { dit: 'Clique dessus.', fait: () => …            }  FAIRE la chose avance aussi
     { dit: 'Clique dessus.', fait: () => …, tient: 1 }  et seule la chose avance

   `fait` est la règle générale : obéir à la professeure vaut mieux qu'un clic sur son texte,
   et cliquer deux fois — une fois pour elle, une fois pour l'œuf — n'a aucun sens.

   `tient` s'y ajoute quand la phrase est un passage obligé. LA BOÎTE NE S'AVANCE PLUS DU
   TOUT — ni par un clic sur le texte, ni par la croix, qui disparaît. Le reste de l'écran
   s'éteint avec elle : la boutique, la bande, les réglages et les outils deviennent inertes,
   et il ne reste que le geste demandé. C'est la seule façon d'obtenir qu'on le fasse.

   Tenir sans éteindre le reste ne bloquait rien : on lisait la consigne, on allait cliquer
   ailleurs, et la scène restait plantée là. Tenir en laissant la croix ne bloquait rien non
   plus — deux clics suffisaient à traverser tout le mode histoire sans rien apprendre.

   LA SORTIE EXISTE, ET ELLE EST FRANCHE : le bouton 📖 reste vivant et éteint le mode histoire
   d'un coup. On peut refuser le tutoriel ; on ne peut pas le suivre à moitié.

   TROIS RÈGLES POUR CHOISIR OÙ TENIR. L'action doit être POSSIBLE tout de suite — tenir sur
   « achète une couveuse » condamnerait qui n'a pas les pièces. Elle doit être GRATUITE, ou
   avoir une porte gratuite : on tient sur « vends ou paie le péage » parce que vendre est
   toujours possible. Et elle doit être INDISPENSABLE à la suite : le reste du mode histoire
   n'a pas de sens si on ne l'a pas faite.

   ET UNE SCÈNE PEUT SE PÉRIMER. `perime` dit quand ce dont elle parle n'existe plus : l'œuf
   dont elle annonçait le craquement a éclos, la bête mûre dont elle expliquait le choix est
   vendue, l'évier devant lequel elle plaisantait est vide. La scène se ferme alors où qu'elle
   en soit, et se marque jouée.

   C'est la moitié qui manquait à `fait`. Une réplique qui sait qu'on l'a écoutée, c'est bien ;
   une scène qui continue d'expliquer un choix qu'on vient de faire est simplement fausse, et
   c'est ce que le joueur remarque en premier. `perime` est toujours la négation exacte du
   `test` qui a ouvert la scène — jamais une condition inventée, sinon une scène pourrait
   naître et mourir dans la même image.

   La croix « passer » lève tout, y compris un `tient` : personne ne doit rester coincé.

   Elles s'arrêtent à l'enclos. La suite s'écrira en jouant, quand on saura ce qui manque. */
const NOTES = [
  { cle: 'oeuf', test: () => true, repliques: [
    'Ah, te voilà. Entre — il fait meilleur ici qu’au dehors.',
    'Je suis la professeure Aubier. J’étudie les lignées : ces bêtes qui, d’une forme à l’autre, deviennent tout autre chose sans jamais cesser d’être elles-mêmes.',
    'Cet œuf est pour toi. Il ne demande qu’une chose, et rien d’autre ne la fera à ta place.',
    { dit: 'Clique dessus.', tient: 1,
      fait: () => state.incub.some(o => o && o.p > 0) },
    'Voilà. Encore, et encore — il n’avancera pas sans toi.',
  ] },
  { cle: 'craque', test: () => state.incub.some(o => o && o.p >= hatchTime(o) * 2 / 3),
    perime: () => !state.incub.some(o => o && o.p >= hatchTime(o) * 2 / 3), repliques: [
    'Tu entends ? Elle pousse contre la coquille.',
    'Ne t’arrête pas maintenant. Ici, rien n’avance sans toi — pas encore.',
  ] },
  { cle: 'bete', test: () => state.pen.length > 0, perime: () => !state.pen.length, repliques: [
    'La voilà. Regarde-la bien : c’est la seule fois où tu la verras si petite.',
    { dit: 'Elle grandit comme l’œuf a éclos : au clic. Essaie.', tient: 1,
      fait: () => state.pen.some(c => c.p > 0) },
    'Son niveau montera jusqu’à cent, et il ne redescendra jamais — quoi qu’il lui arrive.',
    'Je te laisse faire connaissance.',
  ] },
  /* Pas de `perime` ici, ni sur le péage, et c'est un arbitrage : vendre ou évoluer fait
     disparaître la bête mûre dont elle parle, mais les répliques qui suivent sont la LEÇON —
     ce que le péage garde, pourquoi la question n'a pas de bonne réponse. Fermer sur l'action
     ferait rater l'explication à qui a agi vite, c'est-à-dire à qui joue bien. `fait` suffit :
     on avance, on n'efface pas. */
  { cle: 'mure', test: () => state.pen.some(estMur), repliques: [
    'Son niveau s’est bloqué. On dit qu’elle est mûre : elle a fini l’âge où elle était.',
    /* Le troisième et dernier passage obligé. Vendre est toujours possible et ne coûte rien,
       donc la porte est ouverte même sans un sou ; et tout ce que le mode histoire raconte
       ensuite suppose qu'on a tranché une fois. */
    { dit: 'C’est ici que le métier commence. Tu peux la vendre, ou payer son péage pour qu’elle passe à l’âge suivant. Décide.',
      tient: 1,
      fait: () => state.stats.vendues > 0 || state.stats.evolutions > 0 },
    'Il n’y a pas de bonne réponse à cette question. Il y en a une pour aujourd’hui.',
  ] },
  { cle: 'boutique', test: () => state.coins >= prixOeuf(EGG_BY_KEY.commun) * SEUIL_VOIR, repliques: [
    'Voilà tes premières pièces. La boutique s’ouvre à toi.',
    { dit: 'Un œuf commun coûte dix-huit pièces et s’en revend trente une fois la bête mûre. Ce n’est pas grand-chose ; c’est ce qui fait tout. Reprends-en un.',
      fait: () => state.incub.some(o => o) || totalEggs() > 0 },
    'Vends, rachète, recommence. C’est la boucle qui te nourrira longtemps.',
  ] },
  { cle: 'peage', test: () => state.coins >= peagesJusque('commune', 2) && state.pen.some(estMur), repliques: [
    { dit: 'Tu as de quoi payer un péage, maintenant.',
      fait: () => state.stats.evolutions > 0 },
    'Une bête qui le franchit garde tout — son niveau, sa taille, son nom — et vaudra douze fois plus. Mais elle t’immobilise un enclos pendant ce temps.',
    'Vendre tout de suite, ou attendre davantage. Toute la partie tient dans cette hésitation-là.',
  ] },
  { cle: 'clic', test: () => state.coins >= UP_BY_KEY.clic.base * SEUIL_VOIR, repliques: [
    { dit: 'Il y a des choses à acheter qui ne sont pas des œufs.',
      fait: () => lvl('clic') > 0 },
    'Aucune ne jouera à ta place. Elles changent la façon dont le temps passe, c’est tout — mais c’est beaucoup.',
  ] },
  { cle: 'couveuse', test: () => state.coins >= UP_BY_KEY.couveuse.base * SEUIL_VOIR, repliques: [
    { dit: 'Une couveuse. Achète-la dès que tu peux.',
      fait: () => lvl('couveuse') > 0 },
    'À partir de là, les œufs éclosent sans toi. Même la nuit, même quand tu fermes la page.',
    'C’est le moment où ce jeu cesse de dépendre de tes doigts. Tu me diras si ça te manque.',
  ] },
  { cle: 'incubateur', test: () => state.coins >= INCUB_BASE * SEUIL_VOIR, repliques: [
    { dit: 'Un incubateur de plus, c’est un œuf de plus à couver en même temps.',
      fait: () => state.incubators > 1 },
    'Ils ne coûtent pas cher au début. Ils doublent presque de prix à chaque fois — profite-en tant qu’ils sont donnés.',
  ] },
  { cle: 'enclos', test: () => state.coins >= PEN_BASE * SEUIL_VOIR, repliques: [
    { dit: 'Et un enclos de plus, c’est une bête de plus à la fois.',
      fait: () => state.pens > 1 },
    'Retiens ceci : bientôt, ce ne sera plus l’argent qui te limitera, mais la place. Une bête que tu gardes est un enclos qui ne tourne pas.',
    'Voilà. Tu sais tout ce que je sais. Le reste, tu vas me l’apprendre.',
  ] },
  /* Pas de `fait` sur cette scène : ce qu'elle propose n'existe pas encore. L'évier n'ouvre
     qu'à la dernière réplique, quand `vu.plonge` se marque — c'est elle qui ouvre la porte,
     littéralement, et c'est tout ce qui sépare un mécanisme d'un moment. */
  { cle: 'plonge', test: () => enPlonge(), perime: () => !enPlonge(), repliques: [
    'Attends. Ne clique pas — il n’y a plus rien à cliquer.',
    'Pas une bête dans tes enclos. Pas un œuf en couvaison, pas un en réserve. Et dans ta bourse, moins que ce qu’un œuf coûte.',
    'Tu as tout dépensé, y compris ce qu’il te fallait pour recommencer. C’est la seule erreur de ce métier dont on ne se relève pas tout seul.',
    'Ne fais pas cette tête. Je n’ai pas dit qu’on ne s’en relevait pas.',
    'Il y a une porte au fond du couloir. Je n’y emmène pas les visiteurs.',
    'Derrière, il y a du travail. Ce n’est pas glorieux, c’est long, et ça ne paie presque rien — une pièce l’assiette. Douze et tu repars avec un œuf.',
    'Et ne compte pas sur ce que tu as acheté : là-dedans, une assiette demande dix coups d’éponge à tout le monde.',
    'Vas-y. Je ne le ferai pas à ta place : tu as pris la décision, tu prends ce qui vient avec.',
  ] },
  { cle: 'cadeau', test: () => (state.dons || 0) > 0, repliques: [
    'Tu as vu ? Elle vient de t’offrir quelque chose.',
    'Une bête qu’on garde sous les yeux finit par s’attacher. Ça ne s’achète pas et ça ne se force pas — il faut rester, simplement.',
    'Ce n’est pas grand-chose : tes clics comptent double, le temps de quelques secondes. Mais c’est elle qui te le donne, et ça, aucune amélioration ne le fera.',
  ] },
];

const JETON_PAS = 1000;
const JETON_PALIERS = Array.from({ length: 11 }, (v, n) => Math.pow(JETON_PAS, n));

/* LE PREMIER SAUT NE S'OUVRE QU'AU MILLION, troisième palier de l'échelle. Les deux premiers
   — une pièce, mille pièces — créditent bien leur jeton mais ne débloquent rien : ils sont là
   pour qu'on arrive au million avec TROIS jetons en poche, donc trois cycles d'avance, plutôt
   qu'avec un seul.

   Sans ce plancher, le pas de mille ouvrirait l'ascension à la première pièce vendue : on
   sacrifierait une ferme de trois têtards pour une carte qui ne vaut rien, ce qu'on a passé
   plusieurs versions à empêcher. Le plancher ne vaut que pour le PREMIER saut ; ensuite chaque
   jeton en poche donne droit au sien. */
const JETON_PREMIER = 1e6;
const RANG_PREMIER = JETON_PALIERS.indexOf(JETON_PREMIER) + 1;

/* ── LE PRIX DORÉ D'UNE CARTE ──────────────────────────────────────────────────
   Chaque carte emportée dans une même ascension renchérit la suivante d'un facteur φ.

   POURQUOI IL FALLAIT L'ÉCRIRE. La 3.0.0 a fait REGAGNER les jetons à chaque cycle, ce qui a
   abattu le mur de fin de partie — et ouvert un trou dans le même geste : si les jetons
   reviennent et qu'une carte en coûte un, on emporte cinq cartes à chaque ascension,
   indéfiniment. L'album se remplit alors sans qu'aucune décision ne soit prise, et la forge,
   qui demande neuf cartes pour une seule trois-étoiles, devient triviale.

   φ plutôt que ×2 : le doublement écrase trop vite — la quatrième carte coûterait huit jetons
   quand la première en coûte un, et on n'en prendrait jamais plus de trois. Le nombre d'or
   monte assez pour qu'on hésite, assez peu pour qu'on puisse viser la cinquième.

       carte    1    2    3    4    5    6
       coût     1    2    3    5    7   12
       cumul    1    3    6   11   18   30

   Un cycle mené à mille milliards crédite cinq jetons : deux cartes, et il en reste deux pour
   la constellation. C'est là qu'est l'arbitrage — une carte de plus, ou une étoile de plus. */
const NOMBRE_OR = (1 + Math.sqrt(5)) / 2;
/* `or-doux` recule l'escalade d'un cran : la deuxième carte coûte le prix de la première, et
   ainsi de suite. C'est le seul achat du jeu qui change la valeur de tous les achats suivants,
   d'où son prix et son rang. */
const adoucis = () => (etoilePrise('or-doux') ? 1 : 0) + (etoilePrise('or-doux-2') ? 1 : 0);
const coutCarte = n => Math.ceil(Math.pow(NOMBRE_OR, Math.max(0, n - adoucis())));
function coutCartes(k) {
  let t = 0;
  for (let i = 0; i < k; i++) t += coutCarte(i);
  return t;
}
// combien de cartes une bourse permet d'emporter
function cartesAbordables(jetons) {
  let k = 0;
  while (coutCartes(k + 1) <= jetons) k++;
  return k;
}

/* ── LA CONSTELLATION ──────────────────────────────────────────────────────────
   Le second évier des jetons, et le seul objet du jeu — avec l'album — qui traverse
   l'ascension. Deux mots, deux endroits, aucun recouvrement :

     LES PRIMES           en jeu, en pièces, effacées au saut, elles POUSSENT ce qu'on a
     LA CONSTELLATION     à l'ascension, en jetons, acquise pour toujours, elle OUVRE ce
                          qu'on n'a pas

   ELLE PARTAIT D'UN TRONC, ET LE TRONC ÉTAIT UNE FAUTE. Vingt rangs de « +2 % » servaient de
   chemin vers les branches : un chemin fait de marches vides, vingt achats qui ne se sentent
   pas pour atteindre celui qui compte. Le remède valait moins que le mal qu'il corrigeait.

   CHAQUE NŒUD FAIT QUELQUE CHOSE, et cette règle a tout redessiné. Il n'y a plus de chemin
   séparé du contenu : le chemin EST le contenu, puisqu'un nœud s'ouvre avec son parent. Six
   directions depuis un centre, vingt-sept nœuds, aucun remplissage.

   PAS DE RENTE ICI. Elle est déjà perpétuelle et déjà trop forte ; un multiplicateur permanent
   par-dessus aggraverait exactement ce que le plan dit qu'il faut corriger. */
/* SIX DIRECTIONS DEPUIS LE CENTRE, et pas un tronc. La première version montait en colonne
   avec vingt rangs de « +2 % » qui servaient de chemin vers les branches — un chemin fait de
   marches vides. Le remède valait moins que le mal : vingt achats qui ne se sentent pas pour
   atteindre celui qui compte.

   CHAQUE NŒUD FAIT QUELQUE CHOSE. C'est la règle qui a tout redessiné, et elle interdit le
   remplissage : un nœud ouvre un bâtiment, change une règle, ou pousse un levier assez fort
   pour qu'on le sente. Il n'y a plus de « chemin » séparé du contenu — le chemin EST le
   contenu, puisqu'un nœud s'ouvre avec son parent.

   LE PARENT REMPLACE LE RANG. « Demande le rang 8 du tronc » demandait de compter ; « demande
   la pension » se voit sur le trait qui les relie. La géométrie porte la règle, et cette
   fois-ci sans intermédiaire. */
const AXES = [
  { cle: 'sang',      angle: -90, nom: 'Le sang · ce que tu emportes' },
  { cle: 'main',      angle: -30, nom: 'La main · ce que vaut ta présence' },
  { cle: 'negoce',    angle:  30, nom: 'Le négoce · ce que valent tes bêtes' },
  { cle: 'couvee',    angle:  90, nom: 'La couvée · ce qui pousse' },
  { cle: 'pension',   angle: 150, nom: 'La pension · ce que tu produis' },
  { cle: 'album',     angle: 210, nom: 'L’album · ce qui traverse' },
];
const NOM_BRANCHE = Object.fromEntries(AXES.map(a => [a.cle, a.nom]));

/* L'ÉTINCELLE est au centre, et elle ne coûte qu'un jeton : c'est la porte, pas un péage. Tout
   le reste s'accroche à elle, directement ou par un parent. */
/* ⚠ `CIEL` ET NON `ETOILES` : `ETOILES` désigne déjà les multiplicateurs d'étoiles d'une carte,
   `[1, 1.8, 3]`. Deux tables sous un même nom dans un même fichier, c'est la faute que
   « palier » a déjà coûtée ici — il désignait les paliers de fortune, ceux d'amélioration et
   les crans d'une carte. C'est LA NOUVELLE qui cède le nom, toujours : l'ancienne est lue par
   du code qui marche. */
const CIEL = [
  { cle: 'etincelle', axe: null, parent: null, prix: 1, glyphe: '✦', nom: 'L’étincelle',
    dit: 'Le premier jeton dépensé. Il n’achète rien qu’un droit : celui de dépenser les suivants.' },

  // ── LE SANG · l'ascension elle-même ──
  { cle: 'or-doux', axe: 'sang', parent: 'etincelle', prix: 8, glyphe: '🌀',
    nom: 'Le prix doré s’adoucit',
    dit: 'Chaque carte emportée coûte un cran de moins : la deuxième au prix de la première.' },
  { cle: 'sommet', axe: 'sang', parent: 'or-doux', prix: 12, glyphe: '⛰',
    nom: 'Le sommet compte plus',
    dit: 'Ton sommet de fortune vaut un palier de plus. Un jeton de plus à chaque cycle, pour toujours.' },
  { cle: 'or-doux-2', axe: 'sang', parent: 'sommet', prix: 22, glyphe: '🜚',
    nom: 'L’or coule',
    dit: 'Un second cran d’adoucissement. Cinq cartes coûtent alors ce que trois coûtaient.' },
  { cle: 'sommet-2', axe: 'sang', parent: 'or-doux-2', prix: 30, glyphe: '🏔',
    nom: 'Le second sommet',
    dit: 'Encore un palier. Deux jetons de plus par cycle que ta fortune seule ne donnerait.' },

  // ── LA MAIN · ce que vaut ta présence ──
  { cle: 'poing', axe: 'main', parent: 'etincelle', prix: 4, glyphe: '✊',
    nom: 'Le poing', dit: 'Chacun de tes clics porte deux fois plus loin.',
    bonus: { clic: 1 } },
  { cle: 'doigts', axe: 'main', parent: 'poing', prix: 8, glyphe: '👆',
    nom: 'Les doigts agiles', dit: 'Un demi-clic par seconde, sans que tu touches à rien.',
    bonus: { clicAuto: 0.5 } },
  { cle: 'ferveur', axe: 'main', parent: 'doigts', prix: 14, glyphe: '⚡',
    nom: 'La ferveur', dit: 'Les cadeaux de frénésie durent deux fois plus longtemps, et le plafond suit.' },
  { cle: 'fracas', axe: 'main', parent: 'ferveur', prix: 24, glyphe: '💥',
    nom: 'Le fracas', dit: 'Tes clics portent deux fois plus loin encore. En fin de partie, une bête menée au bout paie au clic.',
    bonus: { clic: 2 } },

  // ── LE NÉGOCE · ce que valent tes bêtes ──
  { cle: 'renom', axe: 'negoce', parent: 'etincelle', prix: 4, glyphe: '🏷️',
    nom: 'Le renom', dit: 'Dix pour cent de valeur en plus sur tout ce que tu élèves — vente comme rente.',
    bonus: { valeur: 0.10 } },
  { cle: 'marche', axe: 'negoce', parent: 'renom', prix: 9, glyphe: '🛒',
    nom: 'Le marché', dit: 'Les œufs de la boutique coûtent un cinquième de moins, quelle que soit leur rareté.',
    bonus: { oeuf: 0.20 } },
  { cle: 'passage', axe: 'negoce', parent: 'marche', prix: 15, glyphe: '🗝️',
    nom: 'Le passage', dit: 'Faire monter une bête d’un âge coûte un quart de moins. Le péage se paie à chaque évolution.',
    bonus: { peage: 0.25 } },
  { cle: 'fortune', axe: 'negoce', parent: 'passage', prix: 26, glyphe: '👑',
    nom: 'La fortune', dit: 'Vingt pour cent de valeur de plus. Ce que tu élèves vaut ce qu’il n’a jamais valu.',
    bonus: { valeur: 0.20 } },

  // ── LA COUVÉE · ce qui pousse ──
  { cle: 'ardeur', axe: 'couvee', parent: 'etincelle', prix: 4, glyphe: '🐓',
    nom: 'L’ardeur', dit: 'Dix pour cent de vitesse en plus sur tout ce qui pousse.',
    bonus: { vitesse: 0.10 } },
  { cle: 'chaleur', axe: 'couvee', parent: 'ardeur', prix: 9, glyphe: '🔥',
    nom: 'La chaleur', dit: 'Les œufs éclosent trente pour cent plus vite.',
    bonus: { couvee: 0.30 } },
  { cle: 'sève', axe: 'couvee', parent: 'chaleur', prix: 15, glyphe: '🌱',
    nom: 'La sève', dit: 'Les bêtes montent de niveau trente pour cent plus vite.',
    bonus: { pousse: 0.30 } },
  { cle: 'torrent', axe: 'couvee', parent: 'sève', prix: 26, glyphe: '🌊',
    nom: 'Le torrent', dit: 'Vingt-cinq pour cent de vitesse de plus. Toute la ferme accélère d’un cran.',
    bonus: { vitesse: 0.25 } },

  // ── LES BÂTIMENTS · ce que ta ferme contient ──
/* ── LA PENSION · ce que tu produis ──
     ELLE PORTAIT « LES BÂTIMENTS », ET C'ÉTAIT UNE FAUTE. On y trouvait l'acheteur, le
     marchand, l'évolution et la pension, rendus définitifs — six nœuds sur vingt-sept occupés
     à ne PLUS RACHETER quelque chose.

     L'AUTOMATISATION EST DU JEU DE BASE. Elle doit être là dès la première boucle, sinon la
     première heure se joue au poignet. Une constellation qui la possède — même seulement pour
     la rendre permanente — la déplace hors de la partie où elle appartient, et fait dépendre
     d'une ascension ce qui doit soulager AVANT la première. La forge est du même bois : c'est
     là que va la poussière, elle s'ouvre à la première carte, rien ne doit s'interposer.

     CE QUI RESTE ICI EST CE QU'UN CYCLE NE PEUT PAS ACHETER. Huit nids étaient le plafond des
     primes ; le neuvième ne s'achetait nulle part ailleurs. C'était la différence entre ouvrir
     un pan de jeu — qui était déjà ouvert — et le pousser au-delà de son mur.

     ── ET LA PENSION EST PASSÉE DE L'AUTRE CÔTÉ DE CETTE LIGNE, LE 5 SEPTEMBRE 2026 ──
     Les douze primes qui la réglaient sont montées ici. La règle du dessus n'est pas abrogée,
     elle est PRÉCISÉE : ce qui doit rester dans le cycle, c'est ce qui SOULAGE LA PREMIÈRE
     HEURE — l'acheteur, le marchand, l'évolution, la forge, sans quoi l'ouverture se joue au
     poignet. La pension n'est pas de ce bois : elle est ce qu'on fait QUAND on n'a plus rien à
     acheter, et ses douze primes occupaient les dix dernières marches de l'escalier, si bien
     que la fin de partie n'avait plus qu'un seul sujet.

     LE BÂTIMENT RESTE UNE PRIME, en pièces, et c'est ce qui empêche le renversement d'aller
     trop loin : la pension s'ouvre toujours dans le premier cycle. Ce qui monte ici est son
     ESCALADE, et chaque nœud la lève d'un cran entier — places, portée, vitesse et richesse
     ensemble. On n'achète pas un nid, puis une couveuse, puis un régime : on agrandit la
     pension. */
  { cle: 'nid-plus', axe: 'pension', parent: 'etincelle', prix: 6, glyphe: '🪹',
    nom: 'Le second nid',
    dit: 'Deux couples à la fois, deux œufs par ponte, et les couvaisons moitié plus rapides.' },
  { cle: 'ponte-plus', axe: 'pension', parent: 'nid-plus', prix: 12, glyphe: '🥚',
    nom: 'La rangée de nids',
    dit: 'Quatre couples, trois œufs par ponte, quatre fois plus vite — et la richesse d’un couple pèse quatre fois moins sur sa durée.' },
  { cle: 'sang-epais', axe: 'pension', parent: 'ponte-plus', prix: 20, glyphe: '🩸',
    nom: 'Le sang épais',
    dit: 'Huit couples, cinq œufs par ponte, douze fois plus vite. La lignée du parent le plus rare sort deux fois plus souvent.' },
  { cle: 'nid-vif', axe: 'pension', parent: 'sang-epais', prix: 30, glyphe: '🌡',
    nom: 'Le bâtiment entier',
    dit: 'Neuf couples, six œufs, dix-huit fois plus vite, et le sang ne pèse plus. Deux mythiques couvent en dix minutes.' },

  // ── L'ALBUM · ce qui traverse ──
/* L'ATELIER DE FORGE A ÉTÉ UN NŒUD PENDANT DEUX VERSIONS, et c'était la même faute : c'est
     là que va la poussière, donc du jeu de base. Il se rouvre à la première carte, comme
     avant. Ce qui reste ici est ce qui le DÉPASSE. */
  { cle: 'cendres', axe: 'album', parent: 'etincelle', prix: 5, glyphe: '✧',
    nom: 'Les cendres', dit: 'Fondre une carte rend deux fois plus de poussière.' },
  { cle: 'creuset', axe: 'album', parent: 'cendres', prix: 16, glyphe: '⚒',
    nom: 'Le creuset', dit: 'La forge accepte les cartes équipées : plus besoin de les retirer avant de forger.' },
  { cle: 'braise-douce', axe: 'album', parent: 'creuset', prix: 22, glyphe: '⚖',
    nom: 'La braise douce',
    dit: 'Forger coûte moitié moins de poussière : neuf cartes pour une trois-étoiles, mais deux fois moins de cendres.' },
  { cle: 'prisme', axe: 'album', parent: 'braise-douce', prix: 30, glyphe: '🌈',
    nom: 'Le prisme', dit: 'Une bête chromatique naît une fois sur 8 192. Ce nœud améliore ce tirage de moitié.',
    bonus: { prodige: 0.5 } },
];

const ETOILE_BY_KEY = Object.fromEntries(CIEL.map(n => [n.cle, n]));
// ce que chaque axe porte, dans l'ordre où on le parcourt
const PAR_AXE = Object.fromEntries(AXES.map(a =>
  [a.cle, CIEL.filter(n => n.axe === a.cle)]));

const etoilePrise = cle => !!(state.ciel && state.ciel[cle]);

/* UN NŒUD S'OUVRE AVEC SON PARENT, et c'est tout. « Demande le rang 8 du tronc » demandait de
   compter ; « demande la pension » se voit sur le trait qui les relie. */
const etoileOuverte = n => !n.parent || etoilePrise(n.parent);

function acheterEtoile(cle) {
  const n = ETOILE_BY_KEY[cle];
  if (!n || etoilePrise(cle) || !etoileOuverte(n)) return false;
  if (jetonsEnMain() < n.prix) return false;
  /* ON COMPTE CE QU'ON DÉPENSE, ON NE TOUCHE PAS AU SOMMET.

     La version d'avant convertissait : elle écrivait le total dans la bourse et remettait le
     sommet à zéro. Or `crediterJetons` tourne DIX FOIS PAR SECONDE et relève le sommet sur
     `state.coins` — donc le crédit du cycle revenait entier au tour suivant, en plus de la
     bourse qui le contenait déjà. Chaque achat rendait tout le crédit du cycle. Quatre jetons,
     un achat à un, et sept jetons un dixième de seconde plus tard.

     LA LEÇON, ET ELLE VAUT AU-DELÀ D'ICI : `sommet` n'est pas une réserve, c'est une MESURE —
     le plus haut que la bourse ait atteint ce cycle. Une mesure que la boucle refait ne peut
     pas servir de compteur ; le mettre à zéro ne retire rien, ça efface une observation que la
     boucle refera aussitôt. Ce qu'on dépense se compte à part. */
  state.asc.depense = (state.asc.depense || 0) + n.prix;
  state.ciel = state.ciel || {};
  state.ciel[cle] = true;
  oublierPrimes();
  cielSig = '';
  chord([523, 659, 784, 1046], 80);
  refresh();
  save();
  return true;
}

/* ── LA REPRISE ────────────────────────────────────────────────────────────────
   On défait toute sa constellation et on retrouve ses jetons, à l'unité près.

   LE PLAN L'AVAIT LAISSÉE OUVERTE, et écrivait pourquoi : « dans un jeu à une seule
   sauvegarde, un nœud pris par erreur se subit pour toujours. La reprise ne rend pas les choix
   gratuits, elle les rend RÉVISABLES. » C'est la différence qui compte — on ne peut toujours
   pas tout avoir, on peut seulement changer d'avis.

   LE COMPTE EST EXACT, ET IL FAUT VOIR POURQUOI. Ce qu'on a en main vaut
   `bourse + crédit du cycle − dépense`, et la dépense n'est PAS remise à zéro : elle enregistre
   ce qui a été payé ce cycle, ce qui reste vrai. On ajoute donc le total à la bourse, et la
   soustraction d'un côté est compensée par l'addition de l'autre. Remettre la dépense à zéro EN
   PLUS rembourserait deux fois les nœuds pris ce cycle — c'est la même faute que le sommet
   remis à zéro en 4.6.1, et elle se reproduit exactement de la même façon. */
const prixDuCiel = () => Object.keys(state.ciel || {})
  .reduce((n, cle) => n + ((ETOILE_BY_KEY[cle] || {}).prix || 0), 0);

function reprendreCiel() {
  const rendu = prixDuCiel();
  if (!rendu) return false;
  state.ciel = {};
  state.asc.jetons = (state.asc.jetons || 0) + rendu;
  oublierPrimes();
  cielSig = '';
  chord([784, 659, 523, 392], 90);
  refresh();
  save();
  return rendu;
}

/* Ce que le tronc ajoute aux deux coefficients globaux. Une quatrième source à côté des
   primes, et elle traverse l'ascension — c'est toute la différence. */
/* CE QUE LA CONSTELLATION AJOUTE, tous leviers confondus. Les clés sont celles que l'album
   porte déjà : rien de neuf à brancher, seulement une source de plus aux endroits où elles se
   consomment. */
function bonusCiel() {
  const b = { valeur: 0, rente: 0, vitesse: 0, oeuf: 0, peage: 0, clic: 0,
              clicAuto: 0, couvee: 0, pousse: 0, prodige: 0 };
  for (const n of CIEL) {
    if (!n.bonus || !etoilePrise(n.cle)) continue;
    for (const k of Object.keys(n.bonus)) b[k] += n.bonus[k];
  }
  return b;
}

/* ── La granularité des améliorations ─────────────────────────────────────────
   Un niveau qui double presque de prix et ne rend qu'un cran d'effet, c'est deux décroissances
   qui se cumulent : chaque achat coûte plus et pèse moins. À l'essai, la cadence des
   récompenses est trop lente bien avant que le rythme du jeu ne le soit.

   Les améliorations se montent donc en TIERS de palier. L'astuce est qu'on ne change rien à
   l'équilibrage : si l'effet est divisé par GRAIN et que le multiplicateur devient sa racine
   GRAIN-ième, alors m^GRAIN = mult — trois achats coûtent exactement ce qu'un achat coûtait,
   et rendent exactement le même effet. La base se rajuste pour que la somme géométrique
   tombe juste. C'est une pure re-granulation : trois fois plus de « ça monte », pour le même
   argent et la même puissance.

   Baisser le seul multiplicateur ne marcherait PAS : l'éleveur passerait sous l'enclos (1,6)
   et deviendrait le meilleur achat du jeu, ce que l'enclos doit rester. C'est parce que
   l'effet baisse en même temps que le prix par unité de débit ne bouge pas. */
const GRAIN = 3;
const grainMult = mult => Math.pow(mult, 1 / GRAIN);
const grainBase = (base, mult) => base * (grainMult(mult) - 1) / (mult - 1);

/* Améliorations à niveaux, déclarées en paliers ENTIERS — ceux dont parle l'équilibrage.
   La boucle sous la table les convertit en tiers. Le coût du prochain niveau est base × mult^niveau : l'effet
   monte linéairement pendant que le prix double presque, donc chaque niveau se mérite.
   `max` borne celles qui ne doivent pas monter indéfiniment — à 1 pour les trois achats qui
   débloquent une capacité sans avoir de puissance. Aucune autre n'est bornée.

   Le multiplicateur dit surtout à quelle vitesse une amélioration meurt. Les enclos montent
   en 1,6 ; tout ce qui est en 1,9 se fait distancer par eux — au niveau 10 l'éleveur coûtait
   déjà onze fois l'enclos pour le même gain de débit, et cent quarante-sept fois au niveau 25.
   Ce qui produit du débit est donc calé en 1,65 : à peine plus cher que l'enclos, qui reste le
   meilleur achat du jeu comme il se doit. Restent en 1,9 le clic et la couveuse, l'un marginal
   et l'autre borné, à qui cette pente ne coûte rien. */
const UPGRADES = [
  /* La seule amélioration à puissance qui ne se granule PAS. Un tiers de seconde ne se sent
     pas : on achetait trois fois pour voir bouger un chiffre, et le premier achat du jeu —
     celui qui doit apprendre qu'acheter change quelque chose — ne changeait presque rien.
     Un achat, une seconde. Le prix suit : c'est le palier entier qu'on paie, donc le rapport
     pièce/seconde est exactement celui d'avant. */
  { key: 'clic', name: 'Force du clic', base: 30, mult: 1.6, grain: false,
    desc: 'Chaque clic fait gagner une seconde de plus — une seconde de ce que tes automates produisent, pas une seconde de vie brute.',
    value: n => 1 + n, unit: ' s gagnées par clic' },
  { key: 'couveuse', name: 'Couveuse automatique', base: 120, mult: 1.9,
    desc: 'Les œufs couvent tout seuls, même quand tu n’es pas là. Sur du commun l’incubateur est le meilleur achat ; sur du mythique, qui couve quarante-cinq minutes, c’est elle.',
    value: n => n / GRAIN, unit: '× la vitesse de couvaison' },
  { key: 'eleveur', name: 'Éleveur automatique', base: 500, mult: 1.65,
    desc: 'Les bêtes grandissent toutes seules jusqu’à leur maturité, âge après âge.',
    value: n => n * ELEVEUR_X / GRAIN, unit: '× la vitesse de croissance' },
  { key: 'mangeoire', name: 'Mangeoire automatique', base: 1000, mult: 1.65,
    desc: 'Prend le relais de l’éleveur : engraisse les bêtes mûres sans fin, sans rien coûter.',
    value: n => n * FATTEN_X / GRAIN, unit: ' s d’engraissement par seconde' },

];

/* Les trois déblocages à un seul niveau (acheteur, marchand, évolution) n'ont pas de
   puissance : ils ne se granulent pas. Tous les autres passent en tiers ici, et nulle part
   ailleurs — c'est le seul endroit du fichier qui connaisse GRAIN avec les tables. */
for (const u of UPGRADES) {
  if (u.mult === 1 || u.grain === false) continue;
  u.grain = true;
  u.base = grainBase(u.base, u.mult);
  u.mult = grainMult(u.mult);
  if (u.max) u.max *= GRAIN;
}

const UP_BY_KEY = Object.fromEntries(UPGRADES.map(u => [u.key, u]));

/* Combien de niveaux s'achètent d'un clic. Passé l'ère commune, une amélioration se monte de
   cinquante niveaux d'affilée : les acheter un par un, c'est cinquante clics qui ne décident
   de rien, et le jeu n'est plus un clicker à ce moment-là mais une paperasse.

   `max` prend tout ce que la bourse permet ; les nombres fixes achètent EXACTEMENT ce qu'ils
   annoncent, ou rien. Un ×100 qui n'en achèterait que trente ferait douter du prix affiché. */
const ACHATS = [1, 10, 100, 'max'];
const ACHAT_MAX_PAS = 2000;    // garde-fou : une boucle bornée, même à bourse démesurée

/* Chaque forme : [nom, glyphe, genre]. Une forme par âge, dans l'ordre : enfant,
   adolescent, adulte, ancien, légende. La silhouette change au moment où l'on paie
   l'évolution — c'est le seul instant où elle change.

   Chaque forme portait auparavant un SECOND glyphe, dit juvénile, qui était presque
   toujours le glyphe de la forme précédente : le pansement sur une bête qui redevenait
   enfant à chaque palier. Les images racontaient donc déjà une croissance continue que le
   vocabulaire contredisait. Quatre-vingt-quinze glyphes sont partis avec le problème.

   Le genre n'est noté que pour les formes féminines ('f') : l'épithète du nom doit
   s'accorder, et « Carpe gloutonne » ne s'écrit pas comme « Varan glouton ». */
const LINES = [
  // ── communes ────────────────────────────────────────────────────────────
  { key: 'crapaud', name: 'Crapaud', rarity: 'commune', forms: [
    ['Têtard', '🐸'], ['Crapaud', '🐸'], ['Crapaud-buffle', '🐸'],
    ['Crapaud-tourbière', '🐸'], ['Gama, crapaud-montagne', '🐸'] ] },
  { key: 'poisson', name: 'Poisson', rarity: 'commune', forms: [
    ['Alevin', '🐟'], ['Carpe', '🐟', 'f'], ['Carpe centenaire', '🐠', 'f'],
    ['Serpent de mer', '🐍'], ['Léviathan', '🐉'] ] },
  { key: 'lezard', name: 'Lézard', rarity: 'commune', forms: [
    ['Lézardeau', '🦎'], ['Lézard', '🦎'], ['Varan', '🦎'],
    ['Wyverne', '🐲', 'f'], ['Dragon de terre', '🐉'] ] },
  { key: 'oiseau', name: 'Oiseau', rarity: 'commune', forms: [
    ['Oisillon', '🐤'], ['Passereau', '🐦'], ['Rapace', '🦅'],
    ['Roc', '🦅'], ['Phénix', '🔥'] ] },
  { key: 'crocodile', name: 'Crocodile', rarity: 'commune', forms: [
    ['Crocodillon', '🐊'], ['Crocodile', '🐊'], ['Sarcosuche', '🐊'],
    ['Draco-saurien', '🐲'], ['Dragon-tonnerre', '🐉'] ] },

  { key: 'insecte', name: 'Insecte', rarity: 'commune', forms: [
    ['Larve', '🐛', 'f'], ['Scarabée', '🪲'], ['Lucane', '🪲'],
    ['Scarabée-hercule', '🪲'], ['Khépri, porteur du soleil', '🌞'] ] },
  { key: 'rongeur', name: 'Rongeur', rarity: 'commune', forms: [
    ['Souriceau', '🐁'], ['Rat', '🐀'], ['Ragondin', '🦫'],
    ['Castoroïde', '🦫'], ['Ratatosk, messager des cimes', '🐿️'] ] },
  { key: 'chiroptere', name: 'Chauve-souris', rarity: 'commune', forms: [
    ['Chiroptère', '🦇'], ['Chauve-souris', '🦇', 'f'], ['Roussette', '🦇', 'f'],
    ['Buveur de nuit', '🧛'], ['Camazotz, l’éclipse', '🌑'] ] },
  { key: 'escargot', name: 'Escargot', rarity: 'commune', forms: [
    ['Naissain', '🐌'], ['Escargot', '🐌'], ['Achatine', '🐌', 'f'],
    ['Porte-tour', '🐌'], ['Ammon, la spirale sans fin', '🌀'] ] },
  { key: 'crabe', name: 'Crabe', rarity: 'commune', forms: [
    ['Zoé', '🦐', 'f'], ['Crabe', '🦀'], ['Tourteau', '🦀'],
    ['Crabe-récif', '🦀'], ['Karkinos, l’étoile des fonds', '⭐'] ] },

  // ── rares ───────────────────────────────────────────────────────────────
  { key: 'loup', name: 'Loup', rarity: 'rare', forms: [
    ['Louveteau', '🐕'], ['Loup', '🐺'], ['Loup des steppes', '🐺'],
    ['Garou', '🧌'], ['Fenrir, dévoreur', '🌘'] ] },
  { key: 'meduse', name: 'Méduse', rarity: 'rare', forms: [
    ['Éphyrule', '🫧', 'f'], ['Méduse', '🪼', 'f'], ['Méduse abyssale', '🪼', 'f'],
    ['Cyanée', '🪼', 'f'], ['Physalie-monde', '🌊', 'f'] ] },
  { key: 'salamandre', name: 'Salamandre', rarity: 'rare', forms: [
    ['Larve ardente', '🐛', 'f'], ['Salamandre', '🦎', 'f'], ['Salamandre de braise', '🦎', 'f'],
    ['Salamandre de cendre', '🔥', 'f'], ['Ifrit', '👹'] ] },
  { key: 'serpent', name: 'Serpent-plume', rarity: 'rare', forms: [
    ['Vermisseau', '🐛'], ['Couleuvre', '🐍', 'f'], ['Serpent-plume', '🐍'],
    ['Amphithère', '🐲'], ['Quetzalcóatl', '🐉'] ] },
  /* Les six suivantes portent l'ère rare de quatre à dix lignées. Les communes étaient
     passées de huit à dix au fil du temps pendant que les autres ères restaient à leur
     compte d'origine : on voyait la même bête un œuf sur quatre à l'ère rare, contre une
     sur dix à l'ère commune, alors que la rare dure plus longtemps.

     Le critère de choix est la SILHOUETTE, pas le thème : huit pattes, une ramure, une
     masse, des ailes larges, une carapace basse, un félin. Deux lignées qu'on distingue
     mal en vignette de 32 pixels sont deux lignées pour le prix d'une. */
  { key: 'araignee', name: 'Araignée', rarity: 'rare', forms: [
    ['Nymphe', '🕸️', 'f'], ['Araignée', '🕷️', 'f'], ['Veuve noire', '🕷️', 'f'],
    ['Tisseuse d’ombre', '🕷️', 'f'], ['Arachné, fileuse du sort', '🕸️', 'f'] ] },
  { key: 'cerf', name: 'Cerf', rarity: 'rare', forms: [
    ['Faon', '🦌'], ['Cerf', '🦌'], ['Dix-cors', '🦌'],
    ['Cerf des brumes', '🦌'], ['Cernunnos, roi des bois', '🌿'] ] },
  { key: 'ours', name: 'Ours', rarity: 'rare', forms: [
    ['Ourson', '🐻'], ['Ours', '🐻'], ['Ours des cavernes', '🐻'],
    ['Gardien sylvestre', '🐻'], ['Artio, l’ourse des bois', '🌲', 'f'] ] },
  { key: 'papillon', name: 'Papillon', rarity: 'rare', forms: [
    ['Chenille', '🐛', 'f'], ['Papillon', '🦋'], ['Papillon de lune', '🦋'],
    ['Aile-de-brume', '🦋', 'f'], ['Psyché, souffle ailé', '✨', 'f'] ] },
  { key: 'tortue', name: 'Tortue', rarity: 'rare', forms: [
    ['Tortillon', '🐢'], ['Tortue', '🐢', 'f'], ['Tortue centenaire', '🐢', 'f'],
    ['Tortue-île', '🐢', 'f'], ['Kurma, socle du monde', '🏝️'] ] },
  { key: 'chat', name: 'Chat', rarity: 'rare', forms: [
    ['Chaton', '🐈'], ['Chat', '🐈'], ['Lynx', '🐈'],
    ['Panthère des brumes', '🐆', 'f'], ['Bastet, gardienne', '🐈‍⬛', 'f'] ] },

  // ── épiques ─────────────────────────────────────────────────────────────
  { key: 'kraken', name: 'Kraken', rarity: 'epique', forms: [
    ['Nauplius', '🦐'], ['Poulpe', '🐙'], ['Poulpe abyssal', '🐙'],
    ['Poulpe des fosses', '🦑'], ['Kraken', '🦑'] ] },
  { key: 'golem', name: 'Golem', rarity: 'epique', forms: [
    ['Éclat', '🪨'], ['Gravier animé', '🪨'], ['Golem', '🗿'],
    ['Monolithe', '🗿'], ['Ymir de granit', '🏔️'] ] },
  { key: 'sphinx', name: 'Sphinx', rarity: 'epique', forms: [
    ['Chaton sans poil', '🐈'], ['Sphinx', '🐈‍⬛'], ['Sphinx royal', '🦁'],
    ['Gardien de tombeau', '🗿'], ['Harmakhis, l’horizon', '🏜️'] ] },
  { key: 'cheval', name: 'Cheval', rarity: 'epique', forms: [
    ['Poulain', '🐴'], ['Cheval', '🐎'], ['Destrier', '🐎'],
    ['Licorne', '🦄', 'f'], ['Pégase', '🌠'] ] },

  // ── mythiques ───────────────────────────────────────────────────────────
  /* LA SEULE LIGNÉE JOKER. Une chimère est faite de morceaux d'autres bêtes : deux chimères
     ne donnent donc pas une chimère, elles donnent N'IMPORTE QUOI. Le drapeau est posé sur la
     table plutôt que dans le moteur, pour que la règle se lise là où vit la bête. */
  { key: 'chimere', name: 'Chimère', rarity: 'mythique', joker: true, forms: [
    ['Avorton', '🐁'], ['Chimèreau', '🐐'], ['Chimère', '🦁', 'f'],
    ['Chimère royale', '🦁', 'f'], ['Chimère primordiale', '👹', 'f'] ] },
  { key: 'behemoth', name: 'Béhémoth', rarity: 'mythique', forms: [
    ['Ossement', '🦴'], ['Saurien', '🦕'], ['Béhémoth', '🦖'],
    ['Béhémoth éternel', '🦖'], ['Béhémoth primordial', '☄️'] ] },
  /* PREMIÈRE LIGNÉE DE L'ARC DE LA RÉVÉLATION. Elle ne commence pas petite : au premier âge
     c'est déjà un serpent qui se mord la queue, anneau fermé et complet. Le nom ne change
     jamais, seule l'épithète pousse — on ne rencontre pas cinq bêtes, on regarde le même dieu
     se réveiller.

     Elle naissait en « Anneau de mue », une dépouille, avec un glyphe de ver : le contraire de
     ce qu'elle est. Un dieu qui commence en ver n'est plus un dieu.

     L'anneau, lui, est identique du premier au dernier âge. CE QUI GRANDIT EST CE QU'IL
     CONTIENT — rien, puis une lueur, puis un monde. C'est ce qui donne du grandiose sans
     rien casser de la charte : la bête reste ronde et endormie, c'est le cadre qui devient
     immense. */
  { key: 'ouroboros', name: 'Ouroboros', rarity: 'mythique', forms: [
    ['Ouroboros', '🐍'], ['Ouroboros éveillé', '🐍'], ['Ouroboros clos', '🐍'],
    ['Ouroboros sans fin', '🌀'], ['Ouroboros, la boucle du monde', '♾️'] ] },

  /* ── LES MERVEILLEUSES ────────────────────────────────────────────────────
     Aucun œuf ne les donne. On ne les rencontre qu'en pension, par un couple précis, et le
     couple ne les rend qu'une fois de temps en temps : voir RECETTES.

     KITSUNE reprend le traitement de l'Ouroboros — le nom ne change pas, l'épithète pousse —
     mais pour une raison qui lui est propre : ELLE A NEUF QUEUES DEPUIS TOUJOURS, ET ELLE LES
     CACHE. « Une queue par siècle » devient ce qu'elle montre, pas ce qu'elle acquiert. Effet
     de bord : 1, 3, 5, 7, 9 — c'est la seule bête du jeu dont on lise l'âge sur le dessin.

     SUN WUKONG est l'exception du rang : il grandit pour de vrai, parce qu'il est le seul dieu
     du lot à avoir une enfance. Né d'un œuf de pierre — la seule légende du monde dont
     l'ouverture soit une éclosion, ce qui dans ce jeu-ci n'est pas un détail.

     Son titre complet est inutilisable et c'est le piège de la 2.15.0 : « Le Grand Sage égal du
     Ciel » contient « grand », qui est un rang de taille, et la ligne afficherait « Le Grand
     Sage égal du Ciel · taille normale ». « L'égal du Ciel » dit la même chose et passe. */
  { key: 'kitsune', name: 'Kitsune', rarity: 'merveilleuse', forms: [
    ['Kitsune', '🦊', 'f'], ['Kitsune à trois queues', '🦊', 'f'],
    ['Kitsune à cinq queues', '🦊', 'f'], ['Kitsune à sept queues', '🦊', 'f'],
    ['Kitsune, la neuvième queue', '⛩️', 'f'] ] },
  { key: 'wukong', name: 'Sun Wukong', rarity: 'merveilleuse', forms: [
    ['Singe de pierre', '🗿'], ['Roi des singes', '🐒'], ['Sun Wukong', '🐵'],
    ['Sun Wukong sous la montagne', '⛰️'], ['Sun Wukong, l’égal du Ciel', '☁️'] ] },

  /* LA TARASQUE — LA SEULE MERVEILLE SANS RECETTE. Les deux autres se cherchent : on compose
     un couple précis et on attend. Celle-ci ne se cherche pas, elle ARRIVE — deux chimères
     confiées pour voir ce qui sort, et un jour c'est elle. C'est la seule porte qu'elle ait, et
     `poolJoker` est le seul endroit du code qui la connaisse.

     Elle est la fille des chimères au sens le plus littéral : tête de lion, six pattes d'ours,
     carapace de tortue, queue de scorpion, écailles, et elle sort du Rhône. Là où la Chimère
     mythique est un composite qu'on regarde, la Tarasque est un composite qu'on COMPTE — et
     c'est son arc : à chaque âge on reconnaît une bête de plus en elle.

     Son histoire finit mal et bien à la fois, ce qui est rare : sainte Marthe l'apaise d'un
     cantique, les gens de la ville la tuent pendant qu'elle se laisse faire, puis rebaptisent
     la ville de son nom. Le dernier âge ne porte donc pas sa taille mais LEURS ARMES. */
  { key: 'tarasque', name: 'Tarasque', rarity: 'merveilleuse', forms: [
    ['Tarasque', '🐾', 'f'], ['Tarasque à six pattes', '🦂', 'f'],
    ['Tarasque écaillée', '🐢', 'f'], ['Tarasque du Rhône', '🌊', 'f'],
    ['Tarasque, la bête de Tarascon', '⚜️', 'f'] ] },
];

const LINE_BY_KEY = Object.fromEntries(LINES.map(l => [l.key, l]));

/* ── Illustrations ────────────────────────────────────────────────────────────
   Une lignée n'a PAS besoin de ses cinq dessins.    On déclare les âges dessinés,
   et un âge sans dessin prend celui de l'âge le plus proche en dessous ; s'il n'y
   en a aucun, on retombe sur l'emoji. Trois dessins couvrent donc une lignée entière,
   et on peut n'en avoir qu'un pour commencer.

   Ajouter un dessin = poser le fichier dans art/ et ajouter une ligne ici. Rien d'autre.
   Le format et les dimensions attendus sont décrits dans art/LISEZMOI.md.

   Exemple, une fois les fichiers en place :
     crapaud: { 1: 'crapaud-tetard.png', 3: 'crapaud-buffle.png', 5: 'crapaud-gama.png' },
*/
const ART = {
  araignee: {
    1: 'araignee-1-nymphe.png',              // Nymphe
    2: 'araignee-2-araignee.png',            // Araignée
    3: 'araignee-3-veuve-noire.png',         // Veuve noire
    4: 'araignee-4-tisseuse-d-ombre.png',    // Tisseuse d’ombre
    5: 'araignee-5-arachne.png',             // Arachné, fileuse du sort
  },
  crapaud: {
    1: 'crapaud-1-tetard.png',
    2: 'crapaud-2-crapaud.png',
    3: 'crapaud-3-buffle.png',
    4: 'crapaud-4-crapaud-tourbiere.png',
    5: 'crapaud-5-gama.png',
  },
  poisson: {
    1: 'poisson-1-alevin.png',
    2: 'poisson-2-carpe.png',
    3: 'poisson-3-centenaire.png',
    4: 'poisson-4-serpent.png',
    5: 'poisson-5-leviathan.png',
  },
  lezard: {
    1: 'lezard-1-lezardeau.png',
    2: 'lezard-2-lezard.png',
    3: 'lezard-3-varan.png',
    4: 'lezard-4-wyverne.png',
    5: 'lezard-5-dragon-de-terre.png',
  },
  oiseau: {
    1: 'oiseau-1-oisillon.png',
    2: 'oiseau-2-passereau.png',
    3: 'oiseau-3-rapace.png',
    4: 'oiseau-4-roc.png',
    5: 'oiseau-5-phenix.png',
  },
  crocodile: {
    1: 'crocodile-1-crocodillon.png',
    2: 'crocodile-2-crocodile.png',
    3: 'crocodile-3-sarcosuche.png',
    4: 'crocodile-4-draco-saurien.png',
    5: 'crocodile-5-dragon-tonnerre.png',
  },
  insecte: {
    1: 'insecte-1-larve.png',
    2: 'insecte-2-scarabee.png',
    3: 'insecte-3-lucane.png',
    4: 'insecte-4-scarabee-hercule.png',
    5: 'insecte-5-khepri.png',
  },
  rongeur: {
    1: 'rongeur-1-souriceau.png',
    2: 'rongeur-2-rat.png',
    3: 'rongeur-3-ragondin.png',
    4: 'rongeur-4-castoroide.png',
    5: 'rongeur-5-ratatosk.png',
  },
  chiroptere: {
    1: 'chiroptere-1-chiroptere.png',
    2: 'chiroptere-2-chauve-souris.png',
    3: 'chiroptere-3-roussette.png',
    4: 'chiroptere-4-buveur-de-nuit.png',
    5: 'chiroptere-5-camazotz.png',
  },
  escargot: {
    1: 'escargot-1-naissain.png',
    2: 'escargot-2-escargot.png',
    3: 'escargot-3-achatine.png',
    4: 'escargot-4-porte-tour.png',
    5: 'escargot-5-ammon.png',
  },
  crabe: {
    1: 'crabe-1-zoe.png',
    2: 'crabe-2-crabe.png',
    3: 'crabe-3-tourteau.png',
    4: 'crabe-4-crabe-recif.png',
    5: 'crabe-5-karkinos.png',
  },
  /* Première lignée en SVG, et la première passée par tools/pixel.js : la planche générée
     est ramenée sur une grille de 64 en 8 couleurs, puis rendue. Le SVG sort en
     `shape-rendering: crispEdges`, donc l'anti-aliasing y est impossible par construction —
     c'est le seul chemin du projet qui produise du vrai pixel art. */
  /* LE KITSUNE N'A QUE QUATRE DESSINS, ET LE CINQUIÈME EST UN `null` ÉCRIT. Sans lui, la
     règle de repli rendrait le dessin du quatrième âge — sept queues — pour la forme qui en a
     neuf, et le joueur verrait sa légende ressembler à ce qu'elle vient de quitter. Un emoji
     dit mieux « pas encore dessiné » qu'un dessin qui ment. */
  kitsune: {
    1: 'kitsune-1-kitsune.svg',
    2: 'kitsune-2-kitsune-a-trois-queues.svg',
    3: 'kitsune-3-kitsune-a-cinq-queues.svg',
    4: 'kitsune-4-kitsune-a-sept-queues.svg',
    5: null,
  },
  wukong: {
    1: 'wukong-1-pierre.svg',
    2: 'wukong-2-roi.svg',
    3: 'wukong-3-nuage.svg',
    4: 'wukong-4-montagne.svg',
    5: 'wukong-5-egal-du-ciel.svg',
  },
};

/* La règle de repli, écrite une seule fois : un âge sans dessin prend celui de l'âge le
   plus proche en dessous. La scène, les vignettes et la collection s'en servent toutes,
   sinon la collection montrerait autre chose que le jeu.

   UN `null` ÉCRIT ARRÊTE LE REPLI, et c'est la seule façon de dire « celui-là, on ne l'a pas
   dessiné » quand les précédents le sont. Le repli est bon quand un âge n'a pas encore SA
   variante d'un dessin qui existe ; il ment quand la forme est autre chose — une kitsune à
   neuf queues n'est pas une kitsune à sept, et montrer l'une pour l'autre fait croire au
   joueur que sa légende n'a rien changé. L'emoji, lui, dit la vérité : rien ici. */
function artAt(lineKey, age) {
  const table = ART[lineKey];
  if (!table) return null;
  for (let a = age; a >= 1; a--) if (a in table) return table[a] ? 'art/' + table[a] : null;
  return null;
}

// Un âge, une forme, un dessin. Le détour par « le dessin du palier précédent » n'existe
// plus : c'était le pansement sur une bête qui redevenait enfant à chaque évolution.
const artFor = c => artAt(c.line, c.age);

/* LES CINQ ŒUFS. Ils étaient le même 🥚 tous les cinq, et c'était le pire endroit du jeu où
   économiser un dessin : un œuf est l'objet qu'on REGARDE LE PLUS LONGTEMPS. Une bête reste
   à l'écran le temps de la vendre ; un mythique couve quarante-cinq minutes.

   La coquille sort donc de la même filière que les bêtes — une grille dans `art/grilles/`,
   `rendre` produit le SVG — et les cinq se distinguent par DEUX choses à la fois, la couleur
   de la rareté et un motif propre : des taches, des bandes, des losanges, une couronne, une
   spirale. Une forme se lit là où une couleur ne se lit pas, de loin ou pour qui distingue
   mal le violet du bleu.

   L'emoji reste en repli, comme partout ailleurs : `setCreature` le repose si le fichier
   manque, et rien dans le jeu ne dépend de la présence du dossier `art/`. */
const ART_OEUFS = {
  commun:    'art/oeufs-1-commun.svg',
  rare:      'art/oeufs-2-rare.svg',
  epique:    'art/oeufs-3-epique.svg',
  mythique:  'art/oeufs-4-mythique.svg',
  merveille: 'art/oeufs-5-merveille.svg',
};
const artOeuf = sorte => ART_OEUFS[sorte] || null;

/* Pose un dessin ou un emoji dans le même élément, et par le même chemin de taille :
   l'image fait 1em, donc tout ce qui pilotait la taille de l'emoji pilote la sienne. */
function setCreature(el, fichier, emoji) {
  const cle = fichier || emoji;
  if (el.__art === cle) return;
  el.__art = cle;
  if (fichier) {
    let img = el.firstElementChild;
    if (!img || img.tagName !== 'IMG') { el.textContent = ''; img = document.createElement('img'); el.appendChild(img); }
    if (img.getAttribute('src') !== fichier) img.setAttribute('src', fichier);
    img.alt = '';
  } else {
    el.textContent = emoji;
  }
}

/* ─────────────────────────────────────────────
   État
   ───────────────────────────────────────────── */

const SAVE_KEY = 'eclosion.jalon0';
const SAVE_V = 29;          // le numéro de ce que le fichier sait produire aujourd'hui
/* ── CE QUE VAUT UNE ABSENCE ───────────────────────────────────────────────────
   Elle valait la présence, à la seconde près — mesuré : une heure d'absence rendait ×1,000
   d'une heure passée devant l'écran, et huit heures en rendaient DOUZE, parce que la ferme
   grossit pendant qu'on dort et que le tout compose. Le plafond de vingt-quatre heures valait
   donc une trentaine d'heures de jeu. Sur un joueur qui joue une demi-heure par jour, l'absence
   faisait quatre-vingt-dix-huit pour cent du revenu, et son clic un pour cent d'une nuit.

   Ce n'est pas un bonus, c'est le jeu — et un jeu qui se joue mieux fermé n'en est pas un.

   DEUX BORNES ET UNE SEULE FORMULE : on raccourcit l'absence au lieu de bricoler le rendement
   de ce qui la rejoue. Tout ce qui est en aval — éclosions, ventes, rente, pension, et la
   composition des trois — reste exact sans qu'une ligne de `runAutomations` ne change.

       rejoué = min(réel, OFFLINE_CAP) × OFFLINE_PART       soit trente minutes au plus

   Une nuit rend donc une demi-heure, un week-end aussi. Revenir ne vaut plus qu'être resté. */
const OFFLINE_CAP  = 2 * 3600;
const OFFLINE_PART = 0.25;

let state, nextId = 1, nextCard = 1, lastFrame = Date.now(), isNewGame = false, stopSaving = false;

/* Vrai pendant qu'on rejoue une absence. Les automates tournent alors des milliers de fois
   d'affilée : ni son, ni étincelles, ni redessin à chaque tour — on n'affiche que le résultat.
   Le marchand s'en sert aussi pour lever sa règle « on ne vend pas la bête en scène » :
   personne ne regardait l'écran, la protéger n'aurait fait que bloquer un enclos. */
let rattrapage = false;

/* LE MARCHAND N'A PAS D'EXCEPTION. Il vend tout ce que la consigne désigne, y compris la bête
   en scène : une automatisation qu'on règle doit faire exactement ce qu'on a réglé.

   Deux exceptions ont été essayées, et les deux ramenaient le même défaut. Une immunité à vie
   pour la bête en scène laissait celle qu'on venait d'évoluer à la main invendue pour toujours,
   avec pour seul symptôme « le marchand ne vend pas ». Un sursis de dix secondes depuis le
   dernier clic protégeait mal — regarder une bête n'est pas la cliquer — puis une protection
   tant que l'onglet reste visible rendait la première : page ouverte, bête jamais vendue.

   ☆ Garder est la seule protection, et c'est le bon endroit : explicite, visible sur la
   vignette, posée par le joueur. */
const bilanAuto = { vendus: 0, gagne: 0, evolues: 0, depense: 0 };

function freshState() {
  return {
    v: SAVE_V,
    coins: 0,
    eggs: Object.fromEntries(EGG_KINDS.map(e => [e.key, 0])),
    /* Ce que rachète l'acheteur automatique. La chaîne vide l'ARRÊTE : c'est le seul des
       trois automates qui n'avait pas de « jamais », alors qu'il est le seul à dépenser. */
    buyKind: 'commun',
    incubators: 1,
    pens: 1,
    incub: [{ line: rollLine('commun'), p: 0, kind: 'commun' }],   // le premier œuf est offert
    pen: [],
    sel: 'i:0',
    up: { clic: 0, couveuse: 0, eleveur: 0, mangeoire: 0 },
    // les primes achetées, par clé. Elles ne traversent pas l'ascension.
    primes: {},
    /* LES FAVEURS, ET LE TIRAGE EN COURS. Elles sont des primes : elles se paient en pièces et
       elles tombent à l'ascension, ce qui les met du côté du cycle et non du côté de ce qu'on
       emporte. `main` est le tirage POSÉ — il vit dans la sauvegarde pour qu'il soit le même
       après un rechargement, sinon fermer l'onglet serait une relance gratuite. */
    faveurs: { pris: 0, acquis: {}, main: [] },
    /* CE QUE L'ENCYCLOPÉDIE A APPRIS, lignée par lignée. Elle ne connaît RIEN d'avance :
       chaque case se remplit en rencontrant la chose, jamais en la déduisant d'une table.
       C'est la différence entre un carnet et un manuel — un manuel dit ce qui existe, un
       carnet dit ce qu'on a vu, et seul le second se remplit.

       Par lignée : `teintes`, `caracteres` et `motifs` comptent ce qu'on a croisé (indice →
       nombre de fois), `prodiges` et `nes` comptent les éclosions, et `couples` retient quels
       parents ont DÉJÀ donné cette lignée à la pension — la clé est la paire triée, la valeur
       le nombre de fois. Les pourcentages, eux, ne sont pas stockés : ils se recalculent à
       l'affichage, sinon une prime achetée après coup laisserait des chiffres périmés.

       Elle traverse l'ascension, comme la collection : c'est une mémoire de fichier. */
    dex: {},
    /* Ce qui est replié dans la collection : la clé `tout` pour la section entière, une clé
       par rareté pour les groupes. Du confort d'affichage, donc ça traverse l'ascension —
       comme l'ordre de la bande et la taille des lots. */
    plie: {},
    /* LA PENSION. `places` est le nombre de couples simultanés, `couples` la liste de ce
       qui couve — chacun `{ a, b, t, duree }`, où a et b sont les identifiants de deux bêtes
       QUI RESTENT DANS L'ENCLOS. `dus` est la file des lignées promises, par sorte d'œuf, et
       `nes` le compte de ce qui est sorti. Tout repart de zéro à l'ascension, comme la ferme
       dont la pension fait partie. */
    pension: { places: PENSION.places, couples: [], dus: {}, nes: 0 },
    /* Un âge de vente PAR RARETÉ, 0 = le marchand n'y touche pas. C'est ce qui permet
       d'écouler les communes dès l'âge adulte pendant qu'on mène les mythiques jusqu'au
       bout : une consigne unique forçait à choisir entre les deux. */
    sellAt: parRarete(0),
    /* Une taille minimale PAR RARETÉ. Engraisser une commune, c'est immobiliser un enclos
       pour quelques pièces ; engraisser une mythique, c'est en gagner des milliards. Un
       réglage unique obligeait à trancher pour tout le monde. 0 = dès la maturité. */
    sellRank: parRarete(0),
    tri: 'arrivee',     // l'ordre de la bande — voir TRIS
    triOeuf: 'arrivee', // l'ordre de la file des œufs — voir TRIS_OEUF
    file: [],           // les sortes en réserve, dans l'ordre où elles sont arrivées
    /* Le mode histoire. `tuto` l'allume, `vu` retient ce qui a déjà été dit ET ce qui a déjà
       été dévoilé — les deux se marquent une fois pour toutes, et rien ne revient en arrière.
       Ils traversent l'ascension : on ne réapprend pas le jeu au deuxième cycle. */
    /* LES COMPTEURS SONT CUMULÉS SUR LA VIE DU FICHIER, PAS SUR LA PARTIE. C'est la seule
       règle qui compte ici : l'ascension efface la ferme, les pièces et les améliorations,
       et si elle effaçait aussi les compteurs, le seul endroit qui garde la mémoire du
       joueur deviendrait le seul qui l'oublie. Ils voyagent donc avec la collection. */
    stats: {
      debut: Date.now(),   // la date de la toute première partie, jamais retouchée
      temps: 0,            // secondes de boucle, absences comprises
      clics: 0,            // clics qui ont réellement fait avancer quelque chose
      eclos: 0, vendues: 0, evolutions: 0,
      fondues: 0, fusions: 0, pension: 0,
      assiettes: 0,        // le seul aveu de la page de statistiques
      gagne: 0,            // toutes les pièces encaissées : ventes et rente
      prodiges: 0,
      fortune: 0,          // la plus grosse bourse jamais tenue
      record: 0,           // la plus grosse vente
    },
    // les trophées décrochés, par clé. Ils traversent l'ascension, comme les compteurs.
    trophees: {},
    /* La poussière de carte. Elle traverse l'ascension comme l'album : la remettre à zéro
       obligerait à tout fondre avant chaque saut, une corvée déguisée en décision. */
    poussiere: 0,
    /* Les clics déjà donnés sur l'assiette en cours, de 0 à neuf. Dans la sauvegarde : perdre
       neuf clics parce qu'on a rechargé la page ajouterait une punition à la punition. */
    frotte: 0,
    frenesie: 0,        // secondes de clic double encore en réserve
    dons: 0,            // combien de cadeaux reçus en tout — sert aussi de test au tutoriel
    tuto: true,
    vu: {},
    /* La scène en cours, `{ cle, i }`, ou null. Elle est DANS LA SAUVEGARDE : une scène de
       quatre répliques interrompue par un rechargement reprend où on l'avait laissée, au lieu
       de disparaître avec le reste de ce que la professeure avait à dire. */
    dial: null,
    achat: 1,           // combien de niveaux d'amélioration par clic — voir ACHATS
    /* Un âge d'évolution PAR RARETÉ. Un péage ne coûte pas la même chose selon la lignée —
       mener une ancienne à la légende coûte 600 000 en commune et 9 milliards en mythique — donc
       ce n'est pas la même décision, et un réglage unique ne pouvait pas l'exprimer. On
       pousse les communes jusqu'au bout pendant qu'on arrête les mythiques à l'âge adulte. */
    evolveUpTo: parRarete(0),
    seen: {},
    /* Ce qui traverse l'ascension. `album` garde TOUTES les capsules, `slots` ne porte que
       les identifiants des cartes équipées — seules celles-là agissent. `asc` compte les
       ascensions faites, les paliers de fortune déjà crédités et les jetons non dépensés.
       Ces trois-là et `seen` sont recopiés tels quels au moment du saut. */
    album: [],
    slots: [],
    /* `sommet` : la plus grosse bourse tenue DEPUIS la dernière ascension. C'est lui qui dit
       combien de jetons le prochain saut crédite, et il repart à zéro avec la ferme.
       `jetons` : ce qui reste en bourse, et qui ne repart JAMAIS à zéro. */
    /* `sommet` est une MESURE (le plus haut que la bourse ait atteint ce cycle), `depense`
       est un COMPTEUR (ce que la constellation a coûté ce cycle). Les confondre a fait une
       imprimante à jetons ; ils ne se mélangent plus. */
    asc: { n: 0, paliers: 0, jetons: 0, sommet: 0, depense: 0 },
    /* LA CONSTELLATION. Elle traverse l'ascension comme l'album, et pour la même raison : elle
       est ce qu'on a appris, pas ce qu'on possède. `ciel` plutôt que `constellation` — le
       champ se lit cent fois dans le fichier. */
    ciel: {},
    speed: 1,
    sound: true,
    t: Date.now(),
  };
}

// Le tirage se fait à la mise en couvaison, pas à l'éclosion : c'est ce qui permet de
// recalculer une absence sans rejouer le hasard. Le joueur ne le découvre qu'à l'éclosion.
function pickLine(rarityKey) {
  const pool = LINES.filter(l => l.rarity === rarityKey);
  return pool[Math.floor(Math.random() * pool.length)].key;
}

/* LA LIGNÉE PROMISE. Un œuf de pension entre dans la RÉSERVE ORDINAIRE — il profite ainsi du
   placement automatique, du plafond, de l'incubateur et de tout le reste sans qu'aucun de ces
   mécanismes ait à le connaître. Ce qu'il emporte en plus, c'est sa lignée, gardée dans une
   file par sorte : on la sert avant de tirer au hasard.

   Sans cette file la pension ne viserait rien du tout — deux loups pondraient un « œuf
   commun », et l'œuf commun rendrait un crapaud. C'est la seule ligne qui fait la différence
   entre un système de sélection et une machine à œufs gratuits. */
function tireLigne(kind) {
  const file = (state.pension && state.pension.dus && state.pension.dus[kind]) || [];
  /* ELLE DIT AUSSI D'OÙ VIENT L'ŒUF. Un œuf de pension et un œuf acheté sont indiscernables
     une fois dans la réserve — c'était voulu, tout le reste du jeu n'a pas à les distinguer.
     Les fonds, si : eux ne se tirent que sur ce qui vient de la boutique. */
  if (!file.length) return { line: rollLine(kind), pension: false };
  const du = file.shift();
  // une chaîne : une promesse d'avant l'hérédité, qui n'emportait que la lignée
  return typeof du === 'string' ? { line: du, pension: true }
                                : { line: du.ligne, pension: true, herite: du.herite };
}

function rollLine(kindKey) {
  const odds = (EGG_BY_KEY[kindKey] || EGG_BY_KEY.commun).odds;
  let r = Math.random(), base = 'commune';
  // du plus rare au plus commun ; en cas d'arrondi, on retombe sur la rareté de base de l'œuf
  for (const key of RARETES_HAUT_EN_BAS) {
    const p = odds[key] || 0;
    if (p > 0) base = key;
    r -= p;
    if (r < 0) return pickLine(key);
  }
  return pickLine(base);
}

// Le libellé d'un œuf en boutique : sa rareté de base, puis ce qu'il peut donner au-dessus.
/* CE QUE DIT UN ŒUF DANS LA BOUTIQUE — une phrase, et rien d'autre.

   Il en récitait trois : la durée de couvaison, la rareté garantie, et la chance de monter
   d'un cran. Trois chiffres pour un bouton dont le nom dit déjà l'essentiel, et le troisième
   était le pire — annoncer « 1 sur 1 000 de rare » transforme la seule vraie surprise de
   l'éclosion en statistique qu'on regarde tomber. Une chose qu'on chasse ne s'affiche pas.

   Ce qui a été retiré n'est perdu nulle part : la durée se lit sur la scène dès qu'un œuf
   couve, et la rareté est dans le nom du bouton. La phrase qui reste ne donne pas un chiffre,
   elle donne une raison — et la durée d'un mythique s'y devine sans être écrite. */
function eggDesc(e) { return e.dit; }

// « de rare » mais « d'épique »


function load() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { /* mode privé */ }
  if (!raw) { isNewGame = true; return freshState(); }
  try {
    const s = JSON.parse(raw);
    const base = freshState();
    const merged = Object.assign(base, s, {
      up: Object.assign(base.up, s.up || {}),
      primes: Object.assign({}, s.primes || {}),
      // fusionné et non remplacé : un compteur ajouté après coup doit trouver son zéro
      stats: Object.assign(base.stats, s.stats || {}),
    });
    // les améliorations étaient des booléens avant de devenir des niveaux
    for (const k of Object.keys(merged.up)) {
      if (merged.up[k] === true) merged.up[k] = 1;
      else if (merged.up[k] === false || merged.up[k] == null) merged.up[k] = 0;
    }
    // la réserve d'œufs était un simple compteur avant qu'il n'y ait plusieurs sortes
    const vide = Object.fromEntries(EGG_KINDS.map(e => [e.key, 0]));
    merged.eggs = typeof merged.eggs === 'number'
      ? Object.assign({}, vide, { commun: merged.eggs })
      : Object.assign({}, vide, merged.eggs || {});
    /* L'ÉTABLE A ÉTÉ RETIRÉE, ET CE QU'ELLE A COÛTÉ EST RENDU. Une prime achetée qui cesse
       d'exister est une dépense confisquée : cent cinquante mille pièces, dérisoires au moment
       où on les récupère, mais le principe ne l'est pas. On ne reprend pas ce qu'un joueur a
       payé parce qu'on a changé d'avis sur la règle. */
    if (merged.primes && merged.primes.etable) {
      merged.coins = (merged.coins || 0) + 150000;
      delete merged.primes.etable;
    }

    /* LES BÊTES D'AVANT N'AVAIENT PAS DE STATS. On leur en tire, pour que la ferme soit
       homogène : sans ça, une bête d'hier ferait toujours une carte moyenne et une bête de
       demain une carte qui varie, sans que rien ne l'explique. Les CARTES déjà dans l'album,
       elles, n'en reçoivent pas — `ivPart` leur rend la moyenne, donc leur qualité ne bouge
       pas d'un centième. On tire pour ce qui est encore vivant, jamais pour ce qui est figé. */
    for (const c of merged.pen || []) if (!c.iv) c.iv = rollIV();
    /* LES TEINTES ONT DISPARU, ET AVEC ELLES `tint`. Chaque bête reçoit une COULEUR LATENTE —
       celle qu'elle montrerait si elle était chromatique, et celle que ses petits pourront
       hériter. C'est ce qui permet à deux bêtes grises de donner un chromatique coloré : sans
       couleur latente, l'hérédité n'aurait rien à transmettre tant qu'aucun parent n'est
       chromatique lui-même, et la chasse d'une couleur précise serait fermée. */
    /* LA ROUE EST PASSÉE DE HUIT À SEIZE CRANS, donc l'indice 1 ne désigne plus la même
       couleur : ambre était à 45°, il est maintenant en position 2. Sans ce doublement, toutes
       les bêtes d'une sauvegarde changeraient de couleur en silence — ce qui, pour un trophée
       qu'on collectionne, serait la pire chose à faire. On double l'indice, la teinte ne bouge
       pas d'un degré. */
    if ((s.v || 0) < 27) {
      for (const x of (merged.pen || []).concat(merged.album || []))
        if (x.chroma !== undefined) x.chroma *= 2;
    }
    for (const c of merged.pen || []) {
      if (c.chroma === undefined) c.chroma = Math.floor(Math.random() * CHROMAS.length);
      delete c.tint;
    }
    for (const k of merged.album || []) {
      if (k.chroma === undefined) k.chroma = Math.floor(Math.random() * CHROMAS.length);
      delete k.tint;
    }

    /* ── LES DOUZE PRIMES DE PENSION SONT DEVENUES QUATRE NŒUDS ──
       Une sauvegarde d'avant la `4.15.0` porte des primes qui n'existent plus. Les laisser
       inertes reviendrait à confisquer quatre mille milliards de pièces sans un mot ; on rend
       donc le cran équivalent dans la constellation. C'est généreux — un nœud est PERMANENT
       là où une prime tombait à l'ascension — et c'est le bon sens de l'erreur : on ne
       dépossède pas un joueur pour une décision de conception.

       Le cran est le plus haut des quatre cadrans, pas leur somme : quelqu'un qui n'avait
       monté que la vitesse récupère la vitesse, et le reste avec. C'est ce que le nœud fait
       désormais, et on ne peut pas rendre un demi-nœud. */
    const CRANS_PENSION = ['nid-plus', 'ponte-plus', 'sang-epais', 'nid-vif'];
    const combien = prefixe => [1, 2, 3].filter(i => merged.primes[prefixe + i]).length;
    const rang = Math.min(4, Math.max(
      combien('pension-place-'), combien('pension-portee-'), combien('pension-vite-'),
      merged.primes['pension-riche-2'] ? 4 : merged.primes['pension-riche-1'] ? 2 : 0,
      merged.primes['pension-sang'] ? 3 : 0));
    if (rang) {
      merged.ciel = merged.ciel || {};
      for (let i = 0; i < rang; i++) merged.ciel[CRANS_PENSION[i]] = true;
    }
    for (const k of Object.keys(merged.primes)) {
      if (k.startsWith('pension-')) delete merged.primes[k];
    }

    /* '' est une consigne valable — l'acheteur arrêté — et ne doit pas se faire corriger.
       Tout le reste se vérifie contre ce qui SE VEND, et non contre les sortes d'œufs : l'œuf de
       merveille en est une, il n'a pas de prix, et le faire racheter rendrait NaN de pièces. */
    if (merged.buyKind !== '' && !EN_VENTE[merged.buyKind]) merged.buyKind = 'commun';
    /* Le marchand n'avait qu'un palier unique et un plafond de rareté. On les convertit en
       consignes par rareté : celles que le plafond couvrait gardent le palier, les autres
       passent à « jamais » — exactement ce que la sauvegarde faisait déjà. */
    if (s.sellFrom !== undefined && !s.sellAt) {
      merged.sellAt = parRarete(0);
      for (const [cle, r] of Object.entries(RARITY)) {
        if (r.rank <= (s.sellRarity || 0)) merged.sellAt[cle] = s.sellFrom || 0;
      }
    }
    merged.sellAt = Object.assign(parRarete(0), merged.sellAt || {});
    delete merged.sellFrom; delete merged.sellRarity;
    // les œufs déjà en couvaison n'avaient pas de sorte
    for (const slot of merged.incub || []) if (slot && !slot.kind) slot.kind = 'commun';
    // l'array des incubateurs doit toujours suivre le nombre acheté
    merged.incub = (merged.incub || []).slice(0, merged.incubators);
    while (merged.incub.length < merged.incubators) merged.incub.push(null);
    merged.pen = merged.pen || [];
    /* v2 → v3 : le palier devient l'âge, et la croissance devient un total qui ne repart
       jamais de zéro. L'avancement dans l'ancien palier devient l'avancement dans la
       tranche correspondante — une bête à mi-croissance reste à mi-croissance, et une
       adulte engraissée garde ses secondes de mangeoire. */
    for (const c of merged.pen) {
      if (c.age !== undefined) continue;
      c.age = Math.min(AGES.length, Math.max(1, c.tier || 1));
      const avant = GROW[c.age - 1] / (TEMPERS[c.temper] || TEMPERS[0]).grow;
      const ratio = Math.min(1, (c.p || 0) / avant);
      c.p = (c.age > 1 ? CUM[c.age - 2] : 0) + ratio * GROW[c.age - 1];
      delete c.tier;
    }
    if (merged.tri === 'palier') merged.tri = 'age';
    /* v4 → v5 : l'évolution automatique avait un plafond unique. On le recopie sur les quatre
       raretés — c'est exactement ce que la consigne faisait, en quatre exemplaires. */
    if (typeof merged.evolveUpTo === 'number') {
      const avant = merged.evolveUpTo;
      merged.evolveUpTo = parRarete(avant);
    }
    merged.evolveUpTo = Object.assign(parRarete(0),
                                      merged.evolveUpTo || {});
    // v5 → v6 : la taille minimale suit le même chemin, un nombre unique devient quatre
    if (typeof merged.sellRank === 'number') {
      const avant = merged.sellRank;
      merged.sellRank = parRarete(avant);
    }
    merged.sellRank = Object.assign(parRarete(0),
                                    merged.sellRank || {});
    /* v3 → v4 : les améliorations se montent en tiers de palier. Un niveau d'avant en vaut
       donc trois, sans quoi une partie en cours verrait sa ferme divisée par trois. */
    if ((s.v || 0) < 4) {
      for (const u of UPGRADES) if (u.grain) merged.up[u.key] = (merged.up[u.key] || 0) * GRAIN;
    }
    /* v6 → v7 : l'album et le cycle d'ascension. La migration est purement additive — une
       partie en cours ne perd rien et devient ascensionnable dès son premier jalon franchi.
       On nettoie seulement les emplacements qui pointeraient vers une carte absente. */
    merged.album = Array.isArray(merged.album) ? merged.album : [];
    /* v7 → v8 : les jalons variés deviennent une échelle de fortune. `done` listait des clés
       de jalons qui n'existent plus ; on le jette et on repart de paliers vides. Le nombre
       d'ascensions déjà faites, lui, ne bouge pas — c'est lui qui porte les emplacements.
       Une partie en cours regagnera son premier jeton dès qu'elle repassera le million. */
    merged.asc = Object.assign({ n: 0, paliers: 0, jetons: 0, sommet: 0 }, merged.asc || {});
    merged.ciel = merged.ciel || {};
    delete merged.asc.done;
    merged.asc.n = merged.asc.n || 0;
    merged.asc.paliers = merged.asc.paliers || 0;
    merged.asc.sommet = merged.asc.sommet || 0;
    /* Les capsules d'avant portaient `palier`. Aucune n'a jamais dépassé 1 — la fusion n'existe
       pas encore — donc la conversion ne peut rien perdre, et `|| 1` suffirait ; on nettoie
       quand même pour qu'aucune sauvegarde ne traîne les deux noms. */
    for (const k of merged.album) {
      if (k.etoiles === undefined) k.etoiles = k.palier || 1;
      delete k.palier;
    }
    merged.slots = (Array.isArray(merged.slots) ? merged.slots : [])
      .filter(id => merged.album.some(k => k.id === id))
      .slice(0, SLOTS);

    /* Le numéro de ce que la sauvegarde contient, pas celui d'où elle vient. On ne peut PAS
       le relire dans `base` : Object.assign mute sa cible, donc `base` et `merged` sont le
       même objet et `base.v` porte déjà l'ancien numéro. */
    /* v9 → v10 : le mode histoire. EN DERNIER, une fois tout normalisé — les conditions des
       notes lisent l'enclos, les incubateurs et la bourse, et elles liraient des champs à
       moitié convertis si on les évaluait plus haut.

       Une partie DÉJÀ EN COURS ne doit pas recevoir dix bandeaux pour des choses apprises il y
       a des heures : tout ce dont la condition est remplie est marqué lu en silence, et tout
       est dévoilé d'office. Une partie neuve arrive avec `vu` vide et découvre le jeu pas à pas.

       On se fie au NUMÉRO DE LA SAUVEGARDE, jamais à la présence de `vu` : `freshState` en pose
       un vide, et un objet vide est vrai en JavaScript — le test « si vu manque » n'était donc
       jamais vrai, et la migration ne tournait pas du tout. */
    /* v10 → v11 : l'échelle des jetons passe d'un pas de un million à un pas de mille, et
       `asc.paliers` — un simple compte — ne veut donc plus dire la même chose. Un ancien palier
       franchi valait 10^6n ; il en couvre désormais 2n + 1 dans la nouvelle échelle. On prend
       le plus grand des deux comptes, l'ancien converti et celui que la bourse actuelle
       justifie, pour ne jamais retirer à un joueur un palier qu'il avait. */
    if ((s.v || 0) < 11 && merged.asc) {
      const ancien = merged.asc.paliers || 0;
      const converti = ancien ? 2 * ancien + 1 : 0;
      let selonBourse = 0;
      while (selonBourse < JETON_PALIERS.length &&
             merged.coins >= JETON_PALIERS[selonBourse]) selonBourse++;
      merged.asc.paliers = Math.min(JETON_PALIERS.length, Math.max(converti, selonBourse));
    }
    /* v11 → v12 : la force du clic quitte les tiers. Un joueur qui avait neuf achats avait
       trois secondes ; sans conversion il en aurait neuf, soit trois fois sa puissance. On
       divise donc par le grain, ce qui est exact et non pénalisant : le palier suivant coûte
       précisément ce que les trois tiers suivants coûtaient. Le reste de la division est
       perdu — au plus deux tiers de seconde, jamais entamés. */
    if ((s.v || 0) < 12) merged.up.clic = Math.floor((merged.up.clic || 0) / GRAIN);

    /* v19 → v20 : les jetons cessent d'être un crédit unique et deviennent le compte des
       paliers franchis DANS LE CYCLE. Une partie d'avant n'a pas de sommet enregistré : on
       prend la bourse actuelle, ce qui rend immédiatement à qui était riche les cartes que sa
       fortune justifie. On ne retire donc rien à personne, et le joueur bloqué contre le mur
       — plus de jeton, palier suivant mille fois trop haut — peut sauter à la prochaine
       image. */
    if ((s.v || 0) < 20 && merged.asc) {
      merged.asc.sommet = Math.max(merged.asc.sommet || 0, merged.coins || 0);
    }

    /* v21 → v22 : l'atelier de forge migrait dans la constellation, et rendait le nœud à qui
       avait déjà des cartes. CE BLOC A ÉTÉ SUPPRIMÉ AVEC LE NŒUD : accorder gratuitement une
       chose que le bloc suivant rembourse, c'est créditer quatre jetons à quelqu'un qui n'a
       jamais rien payé. Une migration qu'on annule s'efface, elle ne se laisse pas tourner à
       vide. */

    /* v23 → v24 : LA BOURSE DÉGONFLE.

       `acheterEtoile` remettait `asc.sommet` à zéro en croyant convertir le crédit du cycle en
       bourse. Mais `crediterJetons` tourne dix fois par seconde et relève le sommet sur
       `state.coins` : le crédit revenait entier au tour suivant, EN PLUS de la bourse qui le
       contenait déjà. Chaque achat rendait tout le crédit du cycle.

       ON NE PEUT PAS RECALCULER LA VÉRITÉ : les sommets des cycles passés ne sont pas gardés.
       On pose donc un PLAFOND que rien de légitime ne peut dépasser — ce que toutes les
       ascensions faites ont pu créditer au mieux, moins ce que l'arbre a coûté :

           n ascensions × (11 paliers + les deux nœuds « sommet »)  −  le prix des nœuds pris

       Le plafond est large exprès, et il ignore les cartes emportées, qui l'abaisseraient
       encore : personne ne perd un jeton gagné. Ce qui tombe, c'est la monnaie de singe. */
    if ((s.v || 0) < 24 && merged.asc) {
      merged.asc.depense = 0;
      const parCycle = JETON_PALIERS.length + 2;
      const arbre = Object.keys(merged.ciel || {})
        .reduce((n, cle) => n + ((ETOILE_BY_KEY[cle] || {}).prix || 0), 0);
      const plafond = Math.max(0, (merged.asc.n || 0) * parCycle - arbre);
      merged.asc.jetons = Math.min(merged.asc.jetons || 0, plafond);
    }

    /* v22 → v23 : L'AUTOMATISATION DE BASE SORT DE LA CONSTELLATION. L'acheteur, le marchand,
       l'évolution, la pension et la forge y étaient des nœuds « est à toi » ; ils appartiennent
       au jeu de base, où ils étaient déjà. Ce bloc vient APRÈS celui du dessus exprès : une
       partie en v21 y reçoit `forge`, et doit le reperdre ici.

       ON NE RETIRE RIEN À PERSONNE : les jetons dépensés sur ces cinq nœuds sont RENDUS, à
       l'unité près, et les nœuds effacés. Les nœuds qui en descendaient ne sont pas orphelins :
       leur parent est devenu l'étincelle dans la table, et `etoileOuverte` les rouvre seule. */
    if ((s.v || 0) < 23 && merged.ciel) {
      const rendus = { acheteur: 3, marchand: 5, evolution: 7, pension: 11, forge: 4 };
      let rendu = 0;
      for (const cle of Object.keys(rendus)) {
        if (merged.ciel[cle]) { rendu += rendus[cle]; delete merged.ciel[cle]; }
      }
      if (rendu && merged.asc) merged.asc.jetons = (merged.asc.jetons || 0) + rendu;
    }

    /* v20 → v21 : le jeton redevient une bourse, et une carte coûte le prix doré. Une partie
       d'avant a un `jetons` qui ne voulait plus rien dire depuis la 3.0.0 — il était remis à
       zéro à chaque saut et jamais lu. On le laisse tel quel : ce que le cycle en cours a
       gagné se lit sur le sommet, et s'y ajoutera. Rien à convertir, rien à rendre. */

    /* v12 → v13 : quatre améliorations quittent la liste à niveaux pour devenir des primes.
       On ne retire jamais rien à qui avait payé — les trois achats uniques se transposent tels
       quels, et l'intendant, qui montait, donne son premier cran dès le premier achat et le
       second à partir du quinzième. La conversion est GÉNÉREUSE par principe : mal convertir
       vers le bas, c'est reprendre des heures de jeu à quelqu'un qui n'a rien demandé. */
    if ((s.v || 0) < 13) {
      const vieux = s.up || {};
      for (const cle of ['acheteur', 'marchand', 'evolution']) {
        if (vieux[cle]) merged.primes[cle] = true;
      }
      if (vieux.intendant >= 1) merged.primes.intendance = true;
      if (vieux.intendant >= 15) merged.primes.intendance2 = true;
      for (const cle of ['acheteur', 'marchand', 'evolution', 'intendant']) delete merged.up[cle];
    }

    /* v13 → v14 : la pension apparaît, fermée. Une partie d'avant n'a pas de champ `pension` ;
       on lui en pose un vide plutôt que de la laisser tomber sur `undefined`.
       v14 → v15 : la porte s'ouvre, et deux champs arrivent avec elle — la file des lignées
       promises et le compte des naissances. Une partie de v14 n'a jamais pu pondre, donc les
       deux partent à vide sans rien perdre. */
    if (!merged.pension || !Array.isArray(merged.pension.couples)) {
      merged.pension = { places: PENSION.places, couples: [] };
    }
    merged.pension.dus = merged.pension.dus || {};
    merged.pension.nes = merged.pension.nes || 0;

    /* v16 → v17 : les trois coefficients globaux quittent les améliorations à niveaux pour
       devenir douze primes. Une partie qui avait monté le Renom, la Patience ou l'Ardeur perdrait
       tout ce qu'elle y a mis ; on convertit donc en primes, et GÉNÉREUSEMENT — mal convertir
       vers le bas, c'est reprendre des heures de jeu à quelqu'un qui n'a rien demandé.

       Les seuils sont ceux qu'une prime coûte en pour-cent cumulés : 5, 15, 30, 50. Une Ardeur
       montée à 30 % donne donc les trois premières vitesses, et la quatrième reste à acheter. */
    if ((s.v || 0) < 17) {
      const paliers = [5, 15, 30, 50];
      for (const [vieux, famille] of [['renom', 'valeur'], ['patience', 'rente'], ['ardeur', 'vitesse']]) {
        const pourCent = (merged.up[vieux] || 0) / GRAIN;
        paliers.forEach((seuil, i) => {
          if (pourCent >= seuil) merged.primes[famille + '-' + (i + 1)] = true;
        });
        delete merged.up[vieux];
      }
    }

    /* v15 → v16 : la cinquième rareté arrive. Une sorte d'œuf et trois consignes du marchand
       naissent avec elle, à zéro pour tout le monde — personne n'a jamais pu en tenir une. Rien
       à écrire ici : la normalisation de la réserve et les trois `parRarete(0)` plus haut
       fabriquent leurs clés depuis les tables, et une partie de v15 les reçoit au chargement. */

    merged.tuto = merged.tuto !== false;
    merged.vu = merged.vu || {};
    if ((s.v || 0) < 10) {
      /* On marque TOUTES les notes lues, sans en évaluer aucune. La première version ne
         marquait que celles dont la condition passait à l'instant du chargement, et laissait
         donc armées les conditions TRANSITOIRES : « il craque » veut un œuf à deux tiers de
         couvaison, « elle est mûre » veut une bête mûre en enclos. Une ferme à cinquante
         millions rouvrait sans, puis recevait trente secondes plus tard « Ta première bête.
         Elle grandit au clic » — exactement les bandeaux que la migration devait supprimer.

         Les notes ne parlent que du tout début du jeu : une partie déjà enregistrée les a
         toutes dépassées par construction. Marquer sans évaluer supprime du même coup
         l'échange temporaire de `state` et sa dépendance à l'ordre des normalisations. */
      for (const n of NOTES) merged.vu[n.cle] = true;
      for (const c of CLES_VOIR) merged.vu['voir:' + c] = true;
    }

    merged.v = SAVE_V;
    nextId = merged.pen.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1;
    nextCard = merged.album.reduce((m, k) => Math.max(m, k.id || 0), 0) + 1;
    return merged;
  } catch (e) {
    isNewGame = true;
    return freshState();
  }
}

function save() {
  if (stopSaving) return;          // le bouton ⟲ coupe la sauvegarde avant de recharger
  state.t = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* quota / privé */ }
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

const $ = id => document.getElementById(id);

const lineOf    = c => LINE_BY_KEY[c.line];
const rarityOf  = c => RARITY[lineOf(c).rarity];
const temperOf  = c => TEMPERS[c.temper] || TEMPERS[0];
const motifOf   = c => MOTIFS[c.motif] || MOTIFS[0];

/* Une bête porte UN compteur de croissance, `p`, qui ne repart jamais de zéro : il court de
   0 à 26 325 secondes, du premier niveau au centième. Son âge y découpe une tranche, et `p`
   se bloque au bout de la sienne tant qu'on n'a pas payé le péage. */
const ageGrow   = c => GROW[c.age - 1];                     // largeur de sa tranche
const bandFrom  = c => (c.age > 1 ? CUM[c.age - 2] : 0);    // là où sa tranche commence
const bandTo    = c => CUM[c.age - 1];                      // là où son niveau se bloque
const bandRatio = c => Math.min(1, Math.max(0, (c.p - bandFrom(c)) / ageGrow(c)));
const estMur    = c => c.p >= bandTo(c);

// Combien de niveaux dans une tranche : 15, 20, 30, 20, 15 — cent en tout.
const nivDansAge = age => AGES[age - 1].niv - (age > 1 ? AGES[age - 2].niv : 0);
const nivBase    = age => (age > 1 ? AGES[age - 2].niv : 0);

/* Le niveau, de 1 à 100. Il ne redescend jamais : il ne dépend que de `p`, qui ne fait que
   monter, et de l'âge, qui ne fait que monter aussi. */
function niveau(c) {
  const k = nivDansAge(c.age);
  return nivBase(c.age) + Math.min(k, 1 + Math.floor(bandRatio(c) * k));
}
// Son rang dans sa propre tranche : 0 fraîchement évoluée, k−1 mûre.
const nivDansTranche = c => niveau(c) - nivBase(c.age) - 1;

// Le tempérament ne touche QUE la vitesse de croissance. La durée de référence des rangs de
// taille reste la valeur brute de l'âge, sinon un tempérament vif cumulerait deux bonus.
const growRate = c => temperOf(c).grow;

/* ── L'album, côté calcul ─────────────────────────────────────────────────────
   Une capsule est la bête figée : sa lignée dit son plafond, son motif dit CE QUE la carte
   accélère, et le reste dit COMBIEN. Quatre axes pour la qualité, tous déjà stockés sur la
   bête, et le niveau domine — c'est le seul qui demande du temps plutôt que de la chance. */
const carteDe    = id => state.album.find(k => k.id === id) || null;
const plafondDe  = k => RARITY[LINE_BY_KEY[k.line].rarity].plafond;
const motifBonus = k => MOTIF_BONUS[MOTIFS[k.motif]] || MOTIF_BONUS.uni;

/* LES STATS SONT LE CINQUIÈME AXE, ET ELLES N'AJOUTENT PAS DE PUISSANCE — elles prennent leur
   poids aux autres. Le niveau descend de 0,50 à 0,40, la teinte et la taille de 0,20 à 0,15,
   et les vingt centièmes libérés vont aux stats.

   LA MOYENNE NE BOUGE PAS D'UN CENTIÈME, et c'est ce qui rend le changement sûr : des stats
   moyennes valent 0,5, donc 0,20 × 0,5 = 0,10 — exactement ce qu'on a repris au niveau. Une
   carte type (niveau cent, rien d'autre) valait 0,50 et vaut 0,50 ; une carte parfaite valait
   1,00 et vaut 1,00. Ce qu'on ajoute n'est pas de la valeur, c'est de la VARIANCE : deux
   bêtes menées au même bout ne font plus la même carte, et il devient possible d'en préférer
   une sans que le jeu ait besoin de le dire. */
/* L'AXE DE LA TEINTE A DISPARU AVEC LES TEINTES, et son poids se reverse sur les axes que
   TOUTE bête possède — niveau, taille, stats. Le chromatique garde le sien.

   ON NE PEUT PAS TENIR LES DEUX PROMESSES À LA FOIS, et c'est la seule chose à comprendre ici.
   La teinte pesait 0,15 mais ne rapportait que 0,031 en moyenne, parce qu'une bête sur deux
   était « ordinaire ». Garder la moyenne exactement constante demanderait de la remplacer par
   une constante de 0,031 — et un trophée plafonnerait alors à 0,93 au lieu de 1,00. On garde
   donc le TROPHÉE À UN, et la carte moyenne monte d'environ trois pour cent. Le mouvement est
   entièrement vers le haut : aucune carte d'album n'est dépréciée par le changement, ce qui
   compense à peu près exactement la teinte que ces cartes viennent de perdre. */
function qualiteDe(k) {
  const q = 0.45 * ((k.niv || 1) / NIV_MAX)
          + 0.20 * ((k.rank || 0) / (RANKS.length - 1))
          + 0.10 * (k.prodige ? 1 : 0)
          + 0.25 * ivPart(k);
  return 0.4 + 0.6 * q;      // de 0,40 pour une carte bâclée à 1,00 pour un trophée
}
const puissanceDe = k => plafondDe(k) * ETOILES[(k.etoiles || 1) - 1] * qualiteDe(k);

/* CE QUI REND DEUX CARTES MARIABLES : la lignée, le motif, et le nombre d'étoiles. Les deux
   premiers sont ce qui décide de CE QUE la carte fait — sa famille de bonus et son plafond ;
   les mélanger fabriquerait une carte que personne n'a choisie. Le troisième tient l'escalier :
   une trois-étoiles avalée par une fusion de une-étoile serait un gâchis invisible.

   L'ÂGE N'EN EST PAS, et c'est délibéré. Il ne dit que la puissance, et la puissance se
   moyenne : trois béhémoths unis se réunissent, qu'ils soient enfants ou primordiaux, et le
   résultat vaut exactement leur moyenne. Sans quoi il faudrait trois bêtes menées au même âge,
   et la forge ne s'ouvrirait qu'à qui joue déjà parfaitement. */
const cleForge = k => k.line + ':' + k.motif + ':' + (k.etoiles || 1);

const rareteDe    = k => LINE_BY_KEY[k.line].rarity;
// Ce qu'une carte rend si on la fond. Les étoiles n'entrent pas : on ne défait pas une fusion.
const poussiereDe = k => Math.round((etoilePrise('cendres') ? 2 : 1)
                                    * POUSSIERE_BASE * POUSSIERE_RARETE[rareteDe(k)]
                                    * (k.prodige ? POUSSIERE_PRODIGE : 1)
                                    * (k.fond ? POUSSIERE_FOND : 1));
// Ce que coûte l'étoile suivante, ou null quand la carte est au bout.
const coutFusion  = k => (k.etoiles || 1) >= ETOILES.length ? null
                       : Math.round(FUSION_COUT[k.etoiles || 1] * POUSSIERE_RARETE[rareteDe(k)]
                                    * (etoilePrise('braise-douce') ? 0.5 : 1));

/* Ce que l'album ajoute, famille par famille. Recalculé seulement quand les cartes équipées
   changent — c'est-à-dire à l'ascension et au chargement : baseValue l'appelle une fois par
   bête et par image, et refaire la somme à chaque appel se paierait à l'écran. */
let bonusCache = null, primeCache = null;
const oublierAlbum = () => { bonusCache = null; };
const oublierPrimes = () => { primeCache = null; };

/* ── LES TROIS COEFFICIENTS GLOBAUX ────────────────────────────────────────────
   La VALEUR (vente, et rente qui en découle), la RENTE seule, la VITESSE de tout ce qui
   pousse. Trois axes qui ne se recouvrent pas — trois façons de gagner, trois façons de jouer.

   ILS ONT ÉTÉ DES AMÉLIORATIONS À NIVEAUX PENDANT UNE VERSION, et c'était le mauvais objet.
   Une amélioration dit toujours la même chose : « Renom niv. 12 → niv. 13 », et cinquante
   achats plus tard elle la dit encore — le défaut exact qui avait fait naître les primes.
   Un coefficient global n'a pas besoin de cent niveaux, il a besoin de QUATRE MOMENTS : quatre
   primes nommées, réparties sur toute la fin de partie, chacune disant une chose et se taisant.

   Cumulés, les quatre d'une famille font cinquante pour cent. C'est peu, et c'est voulu : ce
   sont des puits, pas des raccourcis, et leur intérêt vient du fait qu'ils se cumulent avec
   absolument tout — teinte, taille, négoce, cartes de l'album.

   La table décide de tout : une prime qui porte un `bonus` entre ici sans qu'on touche à
   cette fonction. */
/* TROIS CLÉS DE PLUS, ET CE SONT CELLES DE L'ALBUM. `oeuf`, `peage` et `clic` existaient déjà
   comme familles de motifs ; les primes ne savaient pas les toucher. Les carrefours en ont
   besoin — c'est ce qui leur permet d'offrir un PRIX qui baisse et un GESTE qui pèse, et non
   trois fois le même multiplicateur sous trois noms. */
function bonusPrimes() {
  if (primeCache) return primeCache;
  const b = { valeur: 0, rente: 0, vitesse: 0, oeuf: 0, peage: 0, clic: 0,
              couvee: 0, pousse: 0, gras: 0, prodige: 0 };
  for (const p of PRIMES) {
    /* UN CARREFOUR PORTE SON BONUS DANS L'OPTION RETENUE, pas sur lui-même : c'est la seule
       chose qui distingue une prime à choix d'une prime, et tout le reste en découle. */
    const source = p.choix ? choixPris(p) : (prime(p.cle) ? p : null);
    if (!source || !source.bonus) continue;
    for (const k of Object.keys(source.bonus)) b[k] = (b[k] || 0) + source.bonus[k];
  }
  /* LES FAVEURS S'EMPILENT ICI, et deux façons de les empiler cohabitent.

     CE QUI MULTIPLIE S'ADDITIONNE : dix « +5 % de vente » font +50 %, sans plafond, parce
     qu'une valeur qui double n'a rien de dangereux dans une économie qui se compte en
     milliards.

     CE QUI REMISE S'USE : dix « −5 % sur les œufs » additionnés feraient −50 %, vingt feraient
     −100 %, et l'œuf serait GRATUIT POUR TOUJOURS — une queue infinie finit toujours par
     atteindre un plafond additif.

     La remise se COMPOSE donc, et elle se compose SUR CE QUE LES PRIMES ONT DÉJÀ MIS : les
     primes portent elles aussi des remises d'œuf, additives, et composer la faveur dans son
     coin avant de l'ajouter aurait laissé la somme repasser au-dessus de un. On enlève cinq
     pour cent de ce qui RESTE, n fois — la remise s'approche du mur sans jamais y toucher,
     quoi qu'il y ait déjà, et la carte reste utile au vingtième exemplaire. C'est déjà la
     règle de l'intendance, quelques lignes plus bas. */
  const e = state.faveurs;
  for (const f of (e && e.acquis ? FAVEURS : [])) {
    const n = e.acquis[f.cle] || 0;
    if (!n) continue;
    for (const k of Object.keys(f.bonus)) {
      b[k] = f.remise ? 1 - (1 - (b[k] || 0)) * Math.pow(1 - f.bonus[k], n)
                      : (b[k] || 0) + f.bonus[k] * n;
    }
  }
  return (primeCache = b);
}
const coef = quoi => 1 + bonusPrimes()[quoi] + bonusCiel()[quoi];
function bonusAlbum() {
  if (bonusCache) return bonusCache;
  const b = { valeur: 0, couvee: 0, pousse: 0, gras: 0, rente: 0, peage: 0, oeuf: 0, prodige: 0,
              clicAuto: 0, clic: 0 };
  for (const id of state.slots || []) {
    const k = carteDe(id);
    if (!k) continue;
    const m = motifBonus(k);
    b[m.key] = Math.min(m.cap, b[m.key] + m.pas * puissanceDe(k));
  }
  return (bonusCache = b);
}

const variantMult = c => (c.prodige ? PRODIGE_MULT : 1) *
                         (fondDe(c) ? fondDe(c).mult : 1);
// Une prime de négoce par rareté : c'est le seul bonus du jeu qui ne vaut que pour une
// partie du bestiaire, et c'est ce qui lui donne un sens de choix plutôt que de cumul.
const negoce    = c => prime('negoce-' + lineOf(c).rarity) ? 1.25 : 1;
const baseValue = c => valeurBase(c) * variantMult(c)
                     * (1 + bonusAlbum().valeur) * negoce(c) * coef('valeur');

function pickWeighted(list) {
  let total = list.reduce((s, x) => s + x.poids, 0), r = Math.random() * total;
  for (let i = 0; i < list.length; i++) { r -= list[i].poids; if (r < 0) return i; }
  return 0;
}

/* ── L'ENCYCLOPÉDIE : CE QU'ELLE APPREND, ET QUAND ─────────────────────────────
   Trois moments, et trois seulement : une éclosion apprend une variante, une ponte apprend un
   couple, et rien d'autre n'écrit ici. Aucune fonction de cette section ne consulte une table
   de règles — c'est ce qui garantit qu'une fiche ne montre jamais ce qu'on n'a pas vu. */
const dexDe = cle => {
  state.dex = state.dex || {};
  return (state.dex[cle] = state.dex[cle] ||
    { chromas: {}, caracteres: {}, motifs: {}, fonds: {}, prodiges: 0, nes: 0, couples: {} });
};
const dexVu = cle => (state.dex && state.dex[cle]) || null;

// Ce qu'une éclosion apprend. Une fois par bête, au moment où elle sort de l'œuf.
function noterEclosion(c) {
  const d = dexDe(c.line);
  d.nes++;
  if (c.prodige) d.chromas[c.chroma || 0] = (d.chromas[c.chroma || 0] || 0) + 1;
  d.caracteres[c.temper] = (d.caracteres[c.temper] || 0) + 1;
  d.motifs[c.motif] = (d.motifs[c.motif] || 0) + 1;
  if (c.fond) { d.fonds = d.fonds || {}; d.fonds[c.fond] = (d.fonds[c.fond] || 0) + 1; }
  if (c.prodige) d.prodiges++;
}

/* Ce qu'une ponte apprend : que CE couple peut donner CETTE lignée. On ne retient que le
   fait, jamais le chiffre — le pourcentage et la durée se recalculent à l'affichage, sinon
   une prime achetée après coup laisserait dans le carnet des nombres qui ne sont plus vrais. */
function noterPonte(a, b, ligne) {
  const d = dexDe(ligne);
  const cle = [lineOf(a).key, lineOf(b).key].sort().join('×');
  d.couples[cle] = (d.couples[cle] || 0) + 1;
}

/* Tiré une fois, à l'éclosion, et jamais retouché ensuite.

   `achete` dit si l'œuf vient de la BOUTIQUE. Seul un œuf acheté peut porter un fond
   aujourd'hui ; le plan ouvre les deux voies à la pension, au hasard et par hérédité. Le
   garde reste tant que les taux ne sont pas mesurés en jeu — pas parce qu'il casserait
   quelque chose, mais parce que personne n'a encore décidé à partir de quel rythme un fond
   cesse d'être une rencontre. */
/* ── LES QUATRE STATS ──────────────────────────────────────────────────────────
   Quatre nombres tirés à l'éclosion, de 0 à 25, et gardés à vie comme la teinte et le
   tempérament. Ce sont des IV au sens strict : ils ne montent pas, ils ne s'achètent pas,
   ils ne se soignent pas. Deux crapauds nés le même jour ne sont pas la même bête.

   ILS NE SE VOIENT PAS ENCORE, et c'est délibéré. Un nombre affiché est un nombre qu'on
   optimise : montrer les stats avant qu'elles aient une lecture — une fiche, une comparaison,
   un endroit où le choix se fait — apprendrait au joueur à relancer des œufs pour un chiffre
   qu'il ne peut pas encore employer. Elles agissent d'abord, elles se montreront ensuite.

   POURQUOI CES QUATRE-LÀ. Ce sont celles que la TOUR DE COMBAT demandera — le plan la décrit
   comme le second mode de jeu, et note que la moitié de ses statistiques existe déjà : le
   martelé est la frappe, l'ocellé la cadence. `force` et `vivacité` sont ces deux-là, nommées ;
   `souffle` est ce qui tient, `instinct` ce qui arrive quand la chance s'en mêle. Les poser
   maintenant coûte quatre nombres et évite de retirer une éclosion à toutes les bêtes du jeu
   le jour où la tour ouvrira.

   `fond` étant déjà pris par les décors, aucun de ces quatre noms n'entre en collision. */
const IV_MAX  = 25;
const IV_NOMS = ['force', 'vivacité', 'souffle', 'instinct'];
const rollIV = () => IV_NOMS.map(() => Math.floor(Math.random() * (IV_MAX + 1)));

/* CE QUE LES STATS VALENT POUR UNE CARTE, de 0 à 1. UNE ABSENCE VAUT LA MOYENNE, et c'est
   toute la migration : une carte d'avant lit 0,5 et garde donc exactement la qualité qu'elle
   avait hier. On ne déprécie pas en silence ce qui est déjà dans un album. */
const ivPart = k => !k.iv || !k.iv.length ? 0.5
                  : k.iv.reduce((n, v) => n + v, 0) / (IV_NOMS.length * IV_MAX);

/* ── L'HÉRÉDITÉ ────────────────────────────────────────────────────────────────
   CE N'EST PAS UNE LISTE DE CAS, C'EST UNE DISTRIBUTION posée sur l'axe qui relie les deux
   parents. Le mélange est au milieu et c'est le résultat le plus probable ; on s'en éloigne
   par crans, de moins en moins souvent.

       extérieur  parent  intérieur  MÉLANGE  intérieur  parent  extérieur
     ←————|——————————|—————————|—————————|—————————|—————————|——————————|————→
        −2         −1       −0,5        0       +0,5      +1         +2
       2,5 %      10 %      16 %      26 %      16 %      10 %      2,5 %
                    └─ 6 % ─┘                    └─ 6 % ─┘

   INTÉRIEUR ET EXTÉRIEUR NE SONT PAS LE MÊME « PROCHE », et c'est la distinction qui fait
   tout le modèle. Sur deux parents écarlate et azur : l'intérieur est le magenta — proche
   d'un parent EN ALLANT VERS l'autre ; l'extérieur est l'ambre — proche du même parent en
   s'en ÉLOIGNANT. Le premier reste entre les deux, le second sort du segment.

   L'EXTÉRIEUR EST LE MOTEUR DE LA SÉLECTION. C'est la seule branche qui peut dépasser les
   deux parents : sans elle, une lignée converge vers la moyenne de ce qu'on lui donne et ne
   s'améliore jamais. Elle remplace le « soixante pour cent de chances de faire mieux » que le
   plan proposait — la largeur de la queue règle la vitesse de la montée, et il n'y a plus de
   pourcentage arbitraire à justifier.

   RIEN N'EST INTERDIT : cinq pour cent des tirages ignorent les parents et repartent du
   hasard, AUX POIDS D'ORIGINE. Hériter ne regarde pas la rareté, tirer au hasard la regarde —
   sans quoi la pension deviendrait la façon normale d'obtenir ce qui est rare à l'éclosion.

   DEUX PARENTS IDENTIQUES ONT UN AXE DE LONGUEUR NULLE, et sans garde-fou ils ne donneraient
   que des clones : « l'hérédité n'invente rien » deviendrait « l'hérédité ne fait rien ». Le
   demi-écart a donc un PLANCHER, si bien que deux écarlates donnent de l'écarlate très
   souvent et un voisin parfois. */
const HERITAGE = [[0, 26], [-0.5, 16], [0.5, 16], [-1, 10], [1, 10],
                  [-1.5, 6], [1.5, 6], [-2, 2.5], [2, 2.5]];
const HERITAGE_LIBRE = 5;
const HERITAGE_TOTAL = HERITAGE.reduce((n, b) => n + b[1], 0) + HERITAGE_LIBRE;

// La position tirée sur l'axe, ou null quand le hasard reprend la main.
function brancheHeritee() {
  let r = Math.random() * HERITAGE_TOTAL;
  for (const [pos, poids] of HERITAGE) { r -= poids; if (r < 0) return pos; }
  return null;
}

/* SUR UNE DROITE — les quatre statistiques. `plancher` est le demi-écart minimal : c'est lui
   qui permet à deux parents identiques de produire mieux qu'eux, donc à une population
   uniforme de démarrer sa montée. */
function heriteNombre(a, b, min, max, plancher) {
  const pos = brancheHeritee();
  if (pos === null) return min + Math.floor(Math.random() * (max - min + 1));
  let demi = (b - a) / 2;
  if (Math.abs(demi) < plancher) demi = plancher * (Math.random() < 0.5 ? -1 : 1);
  return Math.max(min, Math.min(max, Math.round((a + b) / 2 + pos * demi)));
}

/* SUR UNE ROUE — la couleur. On déroule d'abord le second parent sur l'ARC COURT, sinon
   l'écarlate (0) et le grenat (15), qui sont voisins, se verraient attribuer un mélange à
   l'exact opposé de tous les deux. */
/* LE MÉLANGE DE DEUX COULEURS, SANS HASARD. Une porte, deux lecteurs : l'hérédité l'emploie
   comme centre de sa distribution, et le nid l'affiche pour dire ce qu'un couple donnera le
   plus souvent. Le recopier des deux côtés donnerait deux règles qui divergeraient — c'est la
   faute que la `4.13.2` a fermée sur les échelles de valeur, et elle avait vécu à quatre
   endroits avant qu'on la voie. */
/* LA ROUE COMPTE SEIZE CRANS, PAS TRENTE-SIX. La table en porte trente-six depuis que les gris
   et les recettes s'y sont ajoutés, mais les vingt derniers ne sont PAS sur le cercle : un gris
   n'a pas de teinte, et une recette partage la sienne avec la teinte pure dont elle sort. Ces
   fonctions travaillent donc en INDICES DE ROUE — zéro à quinze — et jamais en indices de
   table. Confondre les deux ferait tourner l'arc court sur une roue deux fois trop grande. */
const ecartRoue  = (a, b) => ((b - a + ROUE.length * 1.5) % ROUE.length) - ROUE.length / 2;
const melangeRoue = (a, b) => {
  const n = ROUE.length;
  return ((Math.round(a + ecartRoue(a, b) / 2) % n) + n) % n;
};

// L'indice de roue d'une couleur : elle-même si elle est pure, sa teinte si c'est une recette.
const roueDe = i => CHROMAS[i] && CHROMAS[i].hue !== null
                  ? ROUE.findIndex(c => c.hue === CHROMAS[i].hue) : 0;
const TONS = ['sombre', 'vif', 'clair'];

/* LE MÉLANGE DE DEUX TEMPÉRAMENTS est le point du plan (croissance, engraissement) le plus
   proche du milieu des deux. Nerveux × placide donne DOCILE, et ce n'est pas un choix : c'est
   le centre exact de la table. */
/* CE QUE DEUX COULEURS DONNENT LE PLUS SOUVENT, sans hasard : le nid l'affiche, l'hérédité le
   prend pour centre. Une porte, deux lecteurs — la règle de la `4.13.2`. */
const melangeCouleur = (a, b) => {
  const ga = CHROMAS[a].hue === null, gb = CHROMAS[b].hue === null;
  if (ga && gb) return CHROMAS.indexOf(GRIS[Math.round((CHROMAS[a].gris + CHROMAS[b].gris) / 2)]);
  if (ga || gb) {
    const teint = ga ? b : a, gris = ga ? a : b;
    return recetteCouleur(CHROMAS[teint].hue, CHROMAS[gris].gris <= 1 ? 'clair' : 'sombre');
  }
  const h = melangeRoue(roueDe(a), roueDe(b));
  const t = Math.round((TONS.indexOf(CHROMAS[a].ton) + TONS.indexOf(CHROMAS[b].ton)) / 2);
  return recetteCouleur(ROUE[h].hue, TONS[t]);
};

const melangeTemper = (a, b) => {
  const cx = (TEMPERS[a].grow + TEMPERS[b].grow) / 2;
  const cy = (TEMPERS[a].fat + TEMPERS[b].fat) / 2;
  let best = 0, d0 = Infinity;
  TEMPERS.forEach((t, i) => {
    const d = (t.grow - cx) ** 2 + (t.fat - cy) ** 2;
    if (d < d0) { d0 = d; best = i; }
  });
  return best;
};

function heriteRoue(a, b) {
  const n = ROUE.length;
  const pos = brancheHeritee();
  if (pos === null) return Math.floor(Math.random() * n);
  const d = ecartRoue(a, b);                    // l'écart signé le plus court
  /* LE MILIEU ET L'ÉTALEMENT SONT DEUX CHOSES, et les confondre déplace le centre. Le
     plancher n'existe que pour donner une LARGEUR à deux parents identiques ; l'appliquer au
     milieu faisait tomber le mélange de deux écarlates à mi-chemin de leur voisin, si bien
     que l'écarlate ne ressortait que d'une fois sur deux au lieu des deux tiers attendus. */
  const milieu = a + d / 2;
  const etale = Math.max(0.5, Math.abs(d) / 2) * (d < 0 ? -1 : d > 0 ? 1
                                                 : Math.random() < 0.5 ? -1 : 1);
  return ((Math.round(milieu + pos * etale) % n) + n) % n;
}

/* ── TROIS CAS, PARCE QUE TROIS GÉOMÉTRIES ────────────────────────────────────
   La roue ne sait relier que des teintes. Les achromatiques n'en ont pas, et « l'arc court
   entre l'écarlate et le blanc » n'existe pas — le calculer quand même ferait tomber leur
   mélange sur du jade, ce qui n'a aucun sens pour l'œil. Chaque couple a donc sa géométrie :

     teinte × teinte          la ROUE pour la teinte, une droite pour le ton
     teinte × achromatique    la RECETTE — c'est elle qui définit ce que la roue ignore
     gris × gris              une DROITE à quatre crans, blanc à onyx

   LA RECETTE EST LE PLUS PROBABLE, PAS LE CERTAIN. Écarlate × blanc donne rose six fois sur
   dix ; le reste du temps l'un des deux parents ressort, ou l'on sort du segment — le rose
   devient un écarlate vif d'un côté, un perle de l'autre. Une recette qui tomberait à tous les
   coups ferait de ce couple le seul déterminé du jeu, et l'élevage y perdrait sa tension. */
function heriteGris(a, b) {
  const g = heriteNombre(CHROMAS[a].gris, CHROMAS[b].gris, 0, GRIS.length - 1, 1);
  return CHROMAS.indexOf(GRIS[g]);
}

function heriteCouleur(a, b) {
  const ga = CHROMAS[a].hue === null, gb = CHROMAS[b].hue === null;
  if (ga && gb) return heriteGris(a, b);

  if (ga || gb) {
    const teint = ga ? b : a, gris = ga ? a : b;
    const clair = CHROMAS[gris].gris <= 1;
    const pos = brancheHeritee();
    if (pos === null) return Math.floor(Math.random() * CHROMAS.length);
    // au centre du segment : la recette. Aux bouts : les parents. Au-delà : on en sort.
    if (Math.abs(pos) <= 0.5) return recetteCouleur(CHROMAS[teint].hue, clair ? 'clair' : 'sombre');
    const versGris = (pos < 0) === (gris === a);
    if (Math.abs(pos) === 1) return versGris ? gris : teint;
    return versGris ? heriteGris(gris, gris)
                    : recetteCouleur(CHROMAS[teint].hue, clair ? 'sombre' : 'clair');
  }

  const h = heriteRoue(roueDe(a), roueDe(b));
  const t = heriteNombre(TONS.indexOf(CHROMAS[a].ton), TONS.indexOf(CHROMAS[b].ton), 0, 2, 1);
  return recetteCouleur(ROUE[h].hue, TONS[t]);
}

/* SANS AXE — le motif et le fond. Rien ne relie « tigré » à « nacré » : pas de mélange, pas
   d'intérieur, pas d'extérieur. Les soixante pour cent des branches géométriques reviennent
   aux deux parents, et le reste au hasard. Inventer un voisinage pour ces deux-là donnerait
   une règle que personne ne pourrait deviner en jouant. */
function heriteNominal(a, b, tirage) {
  const r = Math.random() * HERITAGE_TOTAL;
  if (r < HERITAGE_LIBRE) return tirage();
  return Math.random() < 0.5 ? a : b;
}

/* LE TEMPÉRAMENT VIT DANS UN PLAN — chacun porte un couple (croissance, engraissement), et
   nerveux × placide donne DOCILE, le milieu exact, calculé et non décrété. Mais six points
   épars dans un plan n'ont pas d'« intérieur » ni d'« extérieur » : il n'y a rien entre le
   mélange et un parent. On garde donc le mélange, les parents, et le hasard. */
function heriteTemper(a, b) {
  const r = Math.random() * HERITAGE_TOTAL;
  if (r < HERITAGE_LIBRE) return Math.floor(Math.random() * TEMPERS.length);
  if (r < HERITAGE_LIBRE + 26) return melangeTemper(a, b);
  return Math.random() < 0.5 ? a : b;
}

/* CE QU'UN ŒUF DE PENSION EMPORTE DE SES PARENTS. Calculé À LA PONTE et non à l'éclosion :
   les parents sont sûrs d'être là au moment où l'œuf tombe, ils peuvent avoir été vendus
   quand il éclôt. C'est aussi ce qui est juste — une bête vendue après la ponte a quand même
   transmis ce qu'elle portait. */
/* CE QUE LE NID ANNONCE D'UN COUPLE. L'hérédité était invisible : on composait deux parents
   sans rien savoir de ce qui en sortirait, donc on ne les composait pas EXPRÈS — et une
   mécanique qu'on ne peut pas viser n'est pas une mécanique, c'est une décoration.

   ELLE DIT LE PLUS PROBABLE, JAMAIS LE CERTAIN, et la nuance tient dans deux mots. Le mélange
   n'est que le sommet d'une distribution : à vingt-six pour cent il sort plus souvent que tout
   le reste, mais trois pontes sur quatre donnent autre chose. Annoncer « ambre » sans réserve
   ferait de chaque écart un bug ; « le plus souvent » dit exactement ce qui se passe.

   LES STATISTIQUES N'Y SONT PAS. Elles agissent depuis la `4.16.0` et ne se montrent nulle
   part : les afficher ici et pas ailleurs apprendrait un chiffre qu'on ne peut comparer à rien.
   Elles entreront quand elles auront une lecture, et par la même porte que le reste.

   LA COULEUR PORTE SA CONDITION. Une bête est grise à moins d'être chromatique — une sur huit
   mille — donc annoncer une couleur sans le dire promettrait un petit ambre à chaque ponte.
   La phrase dit « au premier chromatique », qui est la vérité exacte. */
function ditDeLHeritage(a, b) {
  const fem = form(a.line, a.age)[2] === 'f';
  const bouts = [accord(TEMPERS[melangeTemper(a.temper || 0, b.temper || 0)], a)];
  const ma = MOTIFS[a.motif || 0], mb = MOTIFS[b.motif || 0];
  bouts.push(ma === mb ? ma + (fem ? 'e' : '') : ma + ' ou ' + mb);
  bouts.push(CHROMAS[melangeCouleur(a.chroma || 0, b.chroma || 0)].name + ' au premier chromatique');
  const fond = a.fond || b.fond;
  if (fond) bouts.push('fond ' + FOND_BY_KEY[fond].nom);
  return 'Le plus souvent : ' + bouts.join(' · ');
}

function heritageDe(a, b) {
  return {
    chroma: heriteCouleur(a.chroma || 0, b.chroma || 0),
    temper: heriteTemper(a.temper || 0, b.temper || 0),
    motif: heriteNominal(a.motif || 0, b.motif || 0,
                         () => Math.floor(Math.random() * MOTIFS.length)),
    /* LE FOND ENTRE À LA PENSION PAR DEUX VOIES QUI SE CUMULENT, et c'est ce qui débloque un
       chantier en attente depuis la `1.13.0`. Si aucun parent n'en porte, l'œuf tire quand
       même au taux de la boutique : sans ça, la pension d'un joueur qui n'a aucun fond n'en
       produirait jamais, et la voie serait fermée à celui qui en a le plus besoin. */
    fond: a.fond || b.fond
        ? heriteNominal(a.fond || b.fond, b.fond || a.fond, () => null)
        : null,
    iv: IV_NOMS.map((n, i) => heriteNombre((a.iv || [])[i] || 0, (b.iv || [])[i] || 0,
                                           0, IV_MAX, 1)),
  };
}

/* CE QU'UNE BÊTE REÇOIT EN NAISSANT : ce que ses parents lui ont laissé, ou le hasard.

   LE CHROMATISME NE S'HÉRITE PAS, SA COULEUR SI. C'est la règle qui garde le trophée : le
   tirage à une sur huit mille décide SI la bête est chromatique, les parents décident
   LAQUELLE. Deux chromatiques ne font donc pas des chromatiques — ils font des bêtes qui,
   le jour où le tirage tombe, porteront leur couleur plutôt qu'une autre. */
function variantsDe(slot) {
  const h = slot && slot.herite;
  const v = rollVariants(!slot.pension);
  if (!h) return v;
  return Object.assign(v, {
    chroma: h.chroma, temper: h.temper, motif: h.motif, iv: h.iv,
    fond: h.fond || v.fond,
  });
}

function rollVariants(achete) {
  return {
    iv: rollIV(),
    // la couleur ne se tire que si le chromatisme tombe : une bête grise n'en a pas
    chroma: Math.floor(Math.random() * CHROMAS.length),
    temper: Math.floor(Math.random() * TEMPERS.length),
    motif: Math.floor(Math.random() * MOTIFS.length),
    fond: achete && Math.random() < FOND_ODDS
      ? FONDS[Math.floor(Math.random() * FONDS.length)].key : null,
    // le nacré pousse la base, il ne s'y ajoute pas : ×2 au plus sur tout l'album
    prodige: Math.random() < PRODIGE_ODDS * (1 + bonusAlbum().prodige + bonusCiel().prodige
                                             + bonusPrimes().prodige) *
                             (prime('oeil') ? 1.5 : 1),
  };
}

/* À partir de quel âge la bête rembourse l'œuf dont elle sort. Un œuf cher n'est pas un lot
   à encaisser : enfant, une épique payée un billion n'en vaut que trente-six millions — autant
   le dire plutôt que de laisser le joueur le découvrir en perdant sa mise.

   ELLE LISAIT L'ÉCHELLE DES COMMUNES POUR TOUTES LES RARETÉS, quatrième site de la faute que
   la `4.12.0` avait corrigée à trois endroits et manquée ici. `VALUE` et `EVOLVE` ne valent que
   pour le rang zéro ; les autres ont `VALEURS_RANG` et `PEAGES_RANG`, cinq cents fois plus
   hauts. Elle calculait donc une valeur cinq cents fois trop basse et rendait `null` — « elle
   ne rembourse jamais » — pour LES QUATRE raretés payantes, alors qu'une rare rembourse à
   l'âge adulte et une épique à l'âge ancien.

   Ce n'est pas un détail d'affichage : c'est la phrase qui dit au joueur quand il peut vendre
   sans perdre, sur une bête qu'il vient de payer un billion.

   Et le seuil d'une rare est maintenant l'ÂGE ADULTE et non l'ancien, parce que c'est
   exactement ce que la règle de la `4.12.1` construit — l'œuf et ses deux premiers péages
   valent ce que la bête se vend une fois mûre à cet âge-là. Les deux se répondent, et cette
   fonction le vérifie sur les nombres au lieu de le répéter. */
function seuilRentable(c) {
  const cle = lineOf(c).rarity, b = bonusAlbum();
  const gain = variantMult(c) * (1 + b.valeur);
  for (let a = 1; a <= AGES.length; a++) {
    const cumul = peagesJusque(cle, a) * (1 - b.peage);
    if (valeurMure(cle, a) * gain - cumul >= (c.cost || 0)) return a;
  }
  return null;
}

// Sous le prix de son œuf : un fait, pas une alarme.
const sousLePrix = c => (c.cost || 0) > sellValue(c);

/* Jusqu'à quel âge on ALERTE sur ce fait, rareté par rareté. Une bête chère passe le plus
   clair de sa vie sous le prix de son œuf — une rare ne le repasse qu'en pleine tranche
   ancienne. Un bouton rouge qui reste rouge pendant les trois quarts d'une vie cesse d'être
   un avertissement pour devenir un décor, et on finit par vendre à perte en l'ignorant.

   L'alerte se cantonne donc au début de la vie, et chaque rareté a droit à un âge de plus
   que la précédente : c'est là que la méprise est possible, et seulement là. Ailleurs, la
   bête reste affichée sous son prix — sans rouge, sans vert, sans commentaire. */
const ALERTE_JUSQU = { commune: 0, rare: 1, epique: 2, mythique: 3, merveilleuse: 4 };
const aPerte = c => sousLePrix(c) && c.age <= ALERTE_JUSQU[lineOf(c).rarity];

/* Une bête porte UNE épithète, jamais quatre. « chromatique · écarlate · rayé · placide »
   sous chaque nom, c'était une fiche technique à déchiffrer ; « Varan cendré » se retient et
   se raconte. On garde donc ce qui distingue le plus : le prodige d'abord, puis la teinte —
   c'est elle qu'on voit à l'écran —, puis le tempérament, et le motif quand la bête n'a
   rien d'autre à montrer. Les traits écartés du nom restent lisibles là où ils comptent :
   le tempérament dans la ligne des boosts, la teinte dans le multiplicateur de valeur. */
// Un trait dit au genre de la bête qui le porte : « Carpe gloutonne », « glouton ×1,40 »
// sous un varan. Les traits invariables portent la même forme dans les deux cases.
const accord = (trait, c) => form(c.line, c.age)[2] === 'f' ? trait.fem : trait.name;

/* CE QU'UNE BÊTE EST, EN TOUTES LETTRES. Le nom n'en dit qu'UNE chose, et la règle de
   l'épithète unique est bonne : « Louve écarlate » se lit, « Louve écarlate farouche tigrée
   géante » ne se lit plus.

   MAIS LA PENSION N'EST PAS UN NOM, C'EST UN INVENTAIRE. On y confie deux bêtes pour cinq
   heures, et il faut pouvoir dire LAQUELLE des trois louves de l'enclos on a prise — la rouge,
   la chromatique, la farouche. Le panneau montrait deux emoji nus et deux noms de lignée : on
   ne pouvait ni le savoir ni le vérifier.

   La ligne dit donc tout ce que le nom a laissé de côté, et rien de ce qu'il a déjà dit :
   l'épithète retenue est retirée de la liste, sinon « Louve écarlate · écarlate ». */
function signesDe(c) {
  const ep = epithetOf(c);
  const fem = form(c.line, c.age)[2] === 'f';
  return [etatOf(c),
          c.prodige ? 'chromatique' : '',
          c.prodige && chromaOf(c) ? accord(chromaOf(c), c) : '',
          accord(temperOf(c), c),
          motifOf(c) + (fem ? 'e' : ''),
          c.fond ? FOND_BY_KEY[c.fond].nom : '']
    .filter(x => x && x !== ep)
    .join(' · ');
}

/* L'ÉPITHÈTE D'UN CHROMATIQUE EST SA COULEUR, ET NON LE MOT « CHROMATIQUE ». Deux raisons.
   Le halo dit déjà le rang — c'est ce qu'on voit de loin, et le nom n'a pas à le répéter ;
   et « Louve écarlate » distingue deux chromatiques l'un de l'autre là où « Louve
   chromatique » les confond. Le mot reste dans la ligne des signes, où il n'est pas perdu.

   Cette fonction portait ici deux lignes dont la seconde était morte — `if (c.prodige)` puis
   `if (c.prodige && …)`. C'est le genre de branche que la disparition des teintes laisse
   derrière elle : elle testait un cas qui n'existe plus. */
function epithetOf(c) {
  if (c.prodige) return accord(chromaOf(c) || CHROMAS[0], c);
  if (temperOf(c).key !== 'docile') return accord(temperOf(c), c);
  const motif = motifOf(c);
  return motif === 'uni' ? '' : motif + (form(c.line, c.age)[2] === 'f' ? 'e' : '');
}

/* Les noms à titre reçoivent leur épithète sur le nom propre, pas à la fin :
   « Khépri doré, porteur du soleil » et non « Khépri, porteur du soleil doré ». */
function fullName(c) {
  const nom = form(c.line, c.age)[0], ep = epithetOf(c);
  if (!ep) return nom;
  const virgule = nom.indexOf(', ');
  return virgule < 0 ? nom + ' ' + ep
                     : nom.slice(0, virgule) + ' ' + ep + nom.slice(virgule);
}
const eggStock  = k => (state.eggs && state.eggs[k]) || 0;
const totalEggs = () => EGG_KINDS.reduce((n, e) => n + eggStock(e.key), 0);
// la plus rare d'abord : un œuf cher acheté exprès ne doit pas dormir en réserve
/* ── L'ORDRE DE LA FILE DES ŒUFS ───────────────────────────────────────────────
   Les mêmes deux ordres que l'enclos, et pas d'autres : par ARRIVÉE, ou par RARETÉ. C'est le
   même geste sur la même page, il ne doit pas avoir deux vocabulaires.

   « La plus rare d'abord » était écrit en dur, avec une bonne raison : un œuf cher acheté
   exprès ne doit pas attendre derrière du commun. Mais c'est UNE façon de jouer — on peut
   vouloir vider sa réserve dans l'ordre où elle s'est remplie, et c'est exactement le débat
   que le tri de l'enclos a déjà tranché en le rendant réglable.

   L'ARRIVÉE A DEMANDÉ UNE FILE, parce que la réserve ne gardait que des COMPTES : trois
   communs et deux rares, sans savoir lesquels sont arrivés en premier. `state.file` retient
   donc les sortes dans l'ordre où elles entrent. Elle se répare toute seule si elle diverge
   des comptes — une sauvegarde d'avant n'en a pas, et un bogue ne doit pas bloquer la
   réserve. */
const TRIS_OEUF = { arrivee: null, rarete: true };

/* LA FILE SE RECONSTRUIT PLUTÔT QUE DE SE PLAINDRE. On ne peut pas retrouver l'ordre d'une
   réserve qu'on n'a jamais enregistré : on repart des comptes, du plus commun au plus rare,
   ce qui est l'ordre dans lequel on les a très probablement achetés. */
function fileOeufs() {
  const f = (state.file || []).filter(k => EGG_BY_KEY[k]);
  const compte = {}, voulu = {};
  for (const k of f) compte[k] = (compte[k] || 0) + 1;
  for (const e of EGG_KINDS) voulu[e.key] = eggStock(e.key);
  const juste = EGG_KINDS.every(e => (compte[e.key] || 0) === voulu[e.key]);
  if (juste) return (state.file = f);
  const neuve = [];
  for (const e of EGG_KINDS) for (let i = 0; i < voulu[e.key]; i++) neuve.push(e.key);
  return (state.file = neuve);
}
const poserFile = kind => { fileOeufs().push(kind); };

/* LA RÉSERVE, DANS L'ORDRE OÙ ELLE SE VIDERA. C'est le défaut que le joueur a fini par
   nommer : « la réserve ne se vide pas dans l'ordre affiché ». Elle ne s'affichait qu'en
   BOUTIQUE, une case par sorte, rangée par PRIX — et elle se vide par arrivée ou par rareté.
   Deux ordres pour une seule chose : on lit l'un, le jeu applique l'autre, et le réglage passe
   pour cassé alors qu'il fait exactement ce qu'il dit.

   La boutique ne peut pas se réordonner : elle est un escalier de prix, et c'est ce qui lui
   permet de désigner « la marche suivante ». La réserve a donc son propre affichage, sous la
   bande de couvaison, à côté du réglage qui la gouverne. Par construction, l'ordre lu est
   l'ordre appliqué — il sort de la même fonction. */
function reserveEnOrdre() {
  if (state.triOeuf === 'arrivee') return fileOeufs().slice();
  const out = [];
  for (const e of OEUFS_HAUT_EN_BAS) {
    for (let i = 0; i < eggStock(e.key); i++) out.push(e.key);
  }
  return out;
}

/* On compacte les suites : « commun ×3 · rare · commun ×2 » se lit, douze mots ne se lisent
   pas. Au-delà de cinq groupes on coupe — la fin d'une file de quarante œufs n'apprend rien
   que le total ne dise déjà. */
function reserveDite() {
  const file = reserveEnOrdre();
  if (!file.length) return '';
  const nom = k => (EGG_BY_KEY[k] || {}).name ? EGG_BY_KEY[k].name.replace(/^Œuf (de )?/, '') : k;
  const groupes = [];
  for (const k of file) {
    const d = groupes[groupes.length - 1];
    if (d && d.k === k) d.n++; else groupes.push({ k, n: 1 });
  }
  const vus = groupes.slice(0, 5).map(g => nom(g.k) + (g.n > 1 ? ' ×' + g.n : ''));
  if (groupes.length > 5) vus.push('…');
  return file.length + ' en réserve · ' + vus.join(' · ');
}
const retirerFile = kind => {
  const f = fileOeufs(), i = f.indexOf(kind);
  if (i >= 0) f.splice(i, 1);
};

/* CE QUI PART LE PREMIER. Par rareté : la plus rare en réserve. Par arrivée : la tête de file,
   quelle que soit sa sorte. */
const bestStocked = () => {
  if (state.triOeuf === 'arrivee') return fileOeufs()[0];
  return (OEUFS_HAUT_EN_BAS.find(e => eggStock(e.key)) || {}).key;
};
// Le coût d'évolution suit la rareté : sans ça, une rare obtenue par chance se montait au
// l'âge légende pour le prix d'une commune, et toute la progression se court-circuitait.
// L'intendant s'applique par-dessus, en remise qui approche la moitié sans jamais l'atteindre :
// une évolution ne devient donc jamais gratuite, quel que soit le nombre de niveaux achetés.
const evoRemise = () => (prime('intendance') ? 0.75 : 1) * (prime('intendance2') ? 0.75 : 1);

/* ── OÙ SE TIENT LE MUR ────────────────────────────────────────────────────────
   Le péage d'une bête se répartissait sur ses quatre évolutions comme ceci :

       1→2  0,0 %     2→3  0,5 %     3→4  6,2 %     4→5  93,3 %

   Quatre-vingt-treize pour cent sur la DERNIÈRE marche, rien sur la première. C'est le pire
   endroit possible : on investit, on monte trois âges sans rien décider, et on découvre le
   mur à l'arrivée — quand on a déjà tout payé et qu'on ne peut plus reculer. Une dépense
   qu'on ne peut plus refuser n'est pas une décision, c'est une facture.

   LE MUR SE MET DONC À LA PREMIÈRE ÉVOLUTION, où il pose la seule question qui compte :
   « celle-là, je m'y engage ou je la revends ? » Et il répond du même coup à la rare tombée
   par chance — elle se vend pour un joli petit gain, ou elle se garde pour un prix qu'on n'a
   pas encore.

   LE TOTAL NE BOUGE PAS D'UNE PIÈCE, et c'est ce qui rend la redistribution sûre : le rapport
   entre ce que coûtent les péages et ce que la bête vaut à l'âge 5 vaut ×1,90 à toutes les
   raretés, et c'est LUI qui tient la règle « faire grandir perd toujours à la vente, seule la
   rente rembourse ». On déplace le poids, on n'en ajoute ni n'en retire.

   MAIS LA COURBE NE DOIT PAS DÉCROÎTRE POUR AUTANT, et la première version le faisait :
   60 / 15 / 15 / 10. Le passage à l'âge 5 — celui qui fait passer une rare de 2 M à 8,45 M,
   le plus gros saut de valeur de toute sa vie — y coûtait MOINS que le passage précédent.
   Indéfendable : ce qu'une marche coûte doit suivre ce qu'elle ouvre.

   La forme retenue tient les deux : un mur d'engagement à l'entrée, un palier presque gratuit
   juste derrière pour atteindre vite l'âge où la rente commence, puis une remontée qui suit
   la valeur.

       1→2  40 %   le mur — je m'engage, ou je la revends
       2→3   5 %   le souffle — on atteint vite l'âge qui rapporte
       3→4  20 %   la valeur monte, le péage suit
       4→5  35 %   le plus gros saut de valeur, le second plus gros péage

   LES COMMUNES GARDENT LEUR COURBE. Elles vont bien, c'est mesuré, et l'ouverture du jeu est
   le dernier endroit où l'on veut poser un mur. */
/* ── CE QU'UNE BÊTE VAUT, AU-DESSUS DE LA COMMUNE ──────────────────────────────
   UN ŒUF NE DOIT PAS COÛTER PLUS QUE LA BÊTE NE VAUDRA JAMAIS, et c'était le cas : l'œuf rare
   valait 50 M pour une bête qui plafonnait à 43,1 M. Achetée, élevée jusqu'au bout, vendue,
   elle laissait 23 millions de perte — à TOUS les âges, sans exception.

   Les communes, elles, sont bénéficiaires à CHAQUE âge, œuf compris : +12 dès l'enfant,
   +856 782 à la légende. C'est le modèle, et les raretés ne le suivaient pas.

   LA COURBE EST DONC REFAITE POUR TOUT CE QUI EST AU-DESSUS DE LA COMMUNE, et elle se lit
   d'une seule façon : chaque évolution coûte plusieurs fois ce que la bête vaut à l'instant
   où on la paie, et la vente qui suit dépasse le cumul. Pour une rare, œuf à 50 M :

       fin d'âge      vente        évolution       cumul       solde
       enfant     15   2,00 M        1,25 M       51,3 M     −49,3 M
       adolescent 35   5,00 M       18,75 M       70,0 M     −65,0 M
       adulte     65  75,0 M       200,0 M       70,0 M      +5,0 M   ← elle devient rentable
       ancien     85 280,0 M       700,0 M      270,0 M     +10,0 M
       légende   100   1,00 Md         —         970,0 M     +30,0 M

   ELLE DEVIENT RENTABLE À L'ÂGE ADULTE, et pas avant : les deux premiers âges sont un
   investissement, ce qui donne son sens au mur. Le reste de sa vie est du bénéfice.

   LES CHIFFRES SONT PAR UNITÉ DE `mult`, donc l'échelle se propage seule : l'œuf épique vaut
   600 unités comme la lignée épique, le mythique 15 000. Le rapport œuf/valeur est le même à
   tous les rangs, et l'escalier ne peut plus se retourner.

   LES COMMUNES GARDENT TOUT — valeurs ET péages. Elles vont bien, c'est mesuré, et l'ouverture
   du jeu ne se touche pas. */
const VALEURS_RANG = [80, 200000, 3000000, 11200000, 40000000];
const PEAGES_RANG  = [50000, 750000, 8000000, 28000000];
const echelleHaute = c => rarityOf(c).rank > 0;

/* CES DEUX-LÀ PRENNENT UNE CLÉ DE RARETÉ, ET NON UNE BÊTE, parce que les menus du marchand
   parlent d'une rareté entière — « toutes les épiques mûres à l'âge adulte » — et n'ont aucune
   bête sous la main. Ils calculaient donc à côté : `AGES[v].value * mult` et
   `EVOLVE[…] * mult`, c'est-à-dire l'échelle DES COMMUNES appliquée à un rang qui a la sienne.
   Le menu annonçait 3,6 millions pour une épique adulte qui en valait 1,8 milliard — cinq
   cents fois moins, et le réglage le plus important du marchand se prenait sur ce chiffre-là.
   Une seule échelle, lue à un seul endroit. */
/* DEUX PORTES, ET ELLES SONT LES SEULES. Quatre tables décrivent ce que vaut une bête et ce que
   coûtent ses péages — `VALUE`/`EVOLVE` pour l'ère commune, `VALEURS_RANG`/`PEAGES_RANG` pour
   les rangs — et CHOISIR LA BONNE EST UNE RÈGLE, pas une évidence. Elle a été écrite à la main
   à quatre endroits, et elle y a été fausse quatre fois : le menu du marchand, le menu de
   l'évolution, la note de valeur future et le seuil de remboursement lisaient tous l'échelle
   DES COMMUNES pour les quatre raretés payantes — cinq cents fois à côté. Trois ont été
   corrigés en `4.12.0`, le quatrième en `4.13.1`, et personne n'avait vu qu'ils étaient la même
   faute recopiée.

   Le remède n'est pas d'être plus attentif, c'est qu'il n'y ait plus qu'un endroit où se
   tromper. Ces deux fonctions sont désormais les SEULES à indexer les quatre tables, et le
   scénario `échelle` de `tools/test.js` monte la garde : toute autre lecture le fait échouer. */
const echelleDe = cle => RARITY[cle].rank > 0 ? VALEURS_RANG : VALUE;
const peagesDe  = cle => RARITY[cle].rank > 0 ? PEAGES_RANG  : EVOLVE;

const valeurMure   = (cle, age) => echelleDe(cle)[age - 1] * RARITY[cle].mult;
const peageDe      = (cle, age) => (peagesDe(cle)[age - 1] || 0) * RARITY[cle].mult;
const peagesJusque = (cle, age) => peagesDe(cle).slice(0, age - 1)
                                 .reduce((n, x) => n + (x || 0), 0) * RARITY[cle].mult;
const valeurBase   = c => valeurMure(lineOf(c).rarity, c.age);
const peageBase    = c => peageDe(lineOf(c).rarity, c.age);
const evoCost   = c => {
  /* LE DERNIER ÂGE N'A PAS DE PÉAGE, et on le lit sur les âges plutôt que sur un `null` posé
     au bout d'une table : `PEAGES_RANG` n'a que quatre entrées et rendrait `undefined`, donc
     un NaN, si la garde tombait. La règle est « il n'y a rien après la légende », pas « la
     case cinq de ce tableau-ci vaut null ». */
  if (c.age >= AGES.length) return null;
  return Math.round(peageBase(c) * evoRemise() * (1 - bonusAlbum().peage)
                    * (1 - bonusPrimes().peage) * (1 - bonusCiel().peage));
};

/* Le prix d'un œuf passe toujours par ici : le zébré de l'album le baisse, et un prix qui
   s'afficherait ailleurs qu'à l'endroit où il se paie finirait par mentir. */
const prixOeuf  = e => Math.max(1, Math.round(e.price * (1 - bonusAlbum().oeuf)
                                              * (1 - bonusPrimes().oeuf) * (1 - bonusCiel().oeuf)
                                              * (prime('grossiste') ? 0.8 : 1)));
const form      = (lineKey, age) => LINE_BY_KEY[lineKey].forms[age - 1];
/* Les enclos des primes s'ajoutent au compte, JAMAIS au prix : `penCost` continue de se
   fonder sur `state.pens`, ce qu'on a réellement acheté. Sinon une prime rendrait le prochain
   enclos plus cher, ce qui reviendrait à le faire payer deux fois.

   L'album n'entre plus ici : la carte perlée qui donnait des enclos a laissé la place au
   martelé. Trois sources pour un même axe, c'était deux de trop. */
const pensTotal = () => state.pens
                      + (prime('paille') ? 2 : 0) + (prime('paturage') ? 3 : 0);
/* ── CE QUI OCCUPE UN ENCLOS, ET CE QUI N'EN OCCUPE PAS ────────────────────────
   UNE BÊTE GARDÉE COMPTE, ET LA PRIME QUI L'EN DISPENSAIT A ÉTÉ RETIRÉE. L'Étable sortait les
   bêtes ☆ du compte, et c'était une porte de sortie qui vidait la seule contrainte de la
   ferme : garder ne coûtait plus rien, donc on gardait tout, donc l'enclos cessait d'être une
   place à arbitrer. Une collection DOIT coûter — c'est ce qui fait qu'on choisit ce qu'on
   collectionne.

   UNE BÊTE CONFIÉE À LA PENSION N'EN OCCUPE PLUS. Elle en occupait un, et le plan appelait ça
   « tout le prix de la pension ». Ce prix reste, il change seulement de nature : une bête
   confiée ne rente plus, ne grandit plus, ne s'engraisse plus et ne se vend pas. Ce qu'on paie
   n'est plus une PLACE, c'est un DÉBIT — et c'est plus juste, parce qu'une place se rachète
   pour quelques pièces alors qu'une rente perdue se compte en heures.

   `enPension` est déclarée plus bas, avec la pension : cette fonction n'est appelée qu'en
   cours de partie, jamais au chargement du fichier. C'est le même arrangement que `sellValue`
   avec `nivMult`, et il est noté là-bas. */
const penUsed   = () => state.pen.filter(c => !enPension(c)).length;
const penFull   = () => penUsed() >= pensTotal();
const incubTotal = () => state.incubators + (prime('nichoir') ? 2 : 0) + (prime('couvoir') ? 3 : 0);
/* Le tableau des incubateurs EST le stockage : il doit suivre le compte, sinon une prime
   donne des cases que rien ne parcourt. Appelé au chargement et à chaque achat. */
function syncIncub() {
  const n = incubTotal();
  state.incub = state.incub.slice(0, n);
  while (state.incub.length < n) state.incub.push(null);
}

const incubCost = () => Math.round(INCUB_BASE * Math.pow(SLOT_MULT, state.incubators - 1));
const penCost   = () => Math.round(PEN_BASE   * Math.pow(SLOT_MULT, state.pens - 1));

// Une prime achetée, ou non. Toute la table passe par ici.
/* UNE PRIME S'ACHÈTE EN PIÈCES, POUR CE CYCLE, ET C'EST TOUT. La constellation en a tenu
   quatre pour toujours pendant deux versions ; elles sont reparties d'où elles venaient. */
const prime       = cle => !!(state.primes && state.primes[cle]);

/* ── LES CARREFOURS ────────────────────────────────────────────────────────────
   Une prime à choix : trois routes, on en prend UNE, et les deux autres sont perdues pour ce
   cycle. Perdues, et pas remises à plus tard — remises à plus tard, ce n'est pas un choix mais
   un ordre d'achat : on finirait par tout avoir et la décision ne coûterait rien.

   ELLES SE REJOUENT À CHAQUE CYCLE, puisque les primes repartent de zéro à l'ascension. C'est
   ce qui les sauve de l'usure : un choix définitif à l'échelle de la partie se regrette, un
   choix qu'on refait tous les cycles s'expérimente.

   LA CONTRAINTE QUI DÉCIDE SI C'EST RÉUSSI : les trois routes doivent différer EN NATURE, pas
   en chiffre. « +10 % de vente / +10 % de rente / +10 % de vitesse » n'est pas un choix, c'est
   un menu — on prend le plus gros nombre et on n'y pense plus. Chaque carrefour offre donc un
   PRIX qui baisse, une VITESSE qui monte, et un GESTE qui pèse : trois grandeurs qui ne se
   comparent pas, donc trois façons de jouer.

   L'option retenue est rangée dans `state.primes` sous SA PROPRE CLÉ. Tout le jeu continue
   donc de lire `prime('...')` sans rien savoir des carrefours, et une option peut servir de
   garde comme n'importe quelle prime. */
const choixPris = p => p.choix ? (p.choix.find(o => prime(o.cle)) || null) : null;
const primeFaite = p => p.choix ? !!choixPris(p) : prime(p.cle);

function choisirRoute(cleCarrefour, cleRoute) {
  const p = PRIMES.find(x => x.cle === cleCarrefour);
  if (!p || !p.choix || choixPris(p)) return false;
  const o = p.choix.find(x => x.cle === cleRoute);
  if (!o || state.coins < p.prix) return false;
  state.coins -= p.prix;
  state.primes[o.cle] = true;
  oublierPrimes();
  annoncerAchat(o, [392, 523, 659, 784]);
  refresh();
  save();
  return true;
}

const lvl         = key => state.up[key] || 0;
/* Le NIVEAU est ce qui s'achète, la PUISSANCE est ce que ce niveau produit. Depuis que les
   améliorations se montent en tiers, les deux ne sont plus le même nombre : tout ce qui
   CALCULE passe par force(), tout ce qui compte des achats reste sur lvl(). Confondre les
   deux ferait annoncer « éleveur ×9 » pour un ×3 réel. */
// Combien de niveaux achetés font une unité de puissance : trois pour presque tout, un pour
// la force du clic, qui est déclarée sans grain.
const grainDe     = key => (UP_BY_KEY[key] && UP_BY_KEY[key].grain) ? GRAIN : 1;
const force       = key => (state.up[key] || 0) / grainDe(key);
const upCost      = u => Math.round(u.base * Math.pow(u.mult, lvl(u.key)));
const upMaxed     = u => !!u.max && lvl(u.key) >= u.max;

/* Le prix de n niveaux d'un coup. On additionne les prix ARRONDIS un à un, pas la somme
   géométrique : upCost arrondit chaque niveau, et une formule fermée rendrait un total
   légèrement différent de dix achats successifs. Un lot doit coûter exactement ce que
   coûterait la même chose achetée à la main, sinon le lot devient une remise cachée. */
function coutPaliers(u, n) {
  const L = lvl(u.key);
  let total = 0;
  for (let i = 0; i < n; i++) total += Math.round(u.base * Math.pow(u.mult, L + i));
  return total;
}

// Ce qui reste à monter avant le plafond, Infinity pour celles qui n'en ont pas.
const paliersRestants = u => (u.max ? Math.max(0, u.max - lvl(u.key)) : Infinity);

/* Combien de niveaux le réglage courant achèterait, ici et maintenant. En `max` on empile
   tant que la bourse suit ; sur un nombre fixe on rend le nombre demandé, quitte à ce qu'il
   soit hors de prix — c'est tickView qui éteint le bouton, pas cette fonction. */
function paliersVises(u) {
  const reste = paliersRestants(u);
  if (state.achat !== 'max') return Math.min(state.achat, reste);
  const L = lvl(u.key);
  let n = 0, total = 0;
  while (n < reste && n < ACHAT_MAX_PAS) {
    const suivant = total + Math.round(u.base * Math.pow(u.mult, L + n));
    if (suivant > state.coins) break;
    total = suivant;
    n++;
  }
  return n;
}
/* ── LE BONHEUR ET LA FRÉNÉSIE ────────────────────────────────────────────────
   Une bête gagne du bonheur QUAND ELLE EST EN SCÈNE, et elle seule. C'est ce qui rend la
   chose bornée : une ferme de quarante enclos n'en tire pas quarante fois plus qu'un enclos
   unique, puisqu'on ne regarde jamais qu'une bête à la fois. Sans cette règle, la frénésie
   serait permanente passé le milieu de partie, ce qui est exactement ce qu'on ne veut pas.

   Chaque palier de présence tire au sort un cadeau. Il ne donne qu'une chose : LE CLIC
   COMPTE DOUBLE, dix, vingt ou trente secondes selon le palier atteint. Rien sur les
   automates, rien sur les prix, rien sur la rente — le clic est ce que le joueur fait de ses
   mains, et c'est la seule chose qu'un cadeau doit récompenser.

   Elle reste petite par construction : un cadeau tous les quatre à cinq minutes environ,
   d'au plus trente secondes, soit moins d'un dixième du temps passé à ×2. Et elle ne monte
   pas pendant une absence — elle est heureuse parce que tu es là. */
const JOIE_PALIER  = 90;            // secondes de présence avant un tirage
const JOIE_CHANCE  = 0.35;          // ce que vaut un palier : un cadeau une fois sur trois
const FRENESIE     = [10, 20, 30];  // paliers 1, 2, puis 3 et au-delà
const FRENESIE_MAX = 60;            // jamais plus d'une minute d'avance
const FRENESIE_X   = 2;             // le clic compte double, et c'est tout

const enFrenesie = () => (state.frenesie || 0) > 0;

/* ── LES DEUX BOUTS DU MÊME CADRAN ─────────────────────────────────────────────
   S'ARRÊTER ET S'ACHARNER DOIVENT TOUS DEUX VALOIR QUELQUE CHOSE, et le jeu ne payait ni
   l'un ni l'autre : cliquer pesait un pour cent d'une heure de ferme, et poser le doigt ne
   changeait rien du tout. Deux états, donc, et ils sont EXCLUSIFS PAR CONSTRUCTION — on ne
   peut pas cliquer et ne pas cliquer en même temps, si bien qu'ils n'ont pas à s'équilibrer
   l'un contre l'autre.

       COMBO   chaque clic le monte, quinze secondes sans clic le perdent
               il multiplie la force du clic, plafonnée
       IDLE    une minute sans un seul clic l'allume, le premier clic l'éteint
               il multiplie tout ce qui tourne : couvaison, croissance, engraissement, ponte

   LE GAIN DU COMBO SUIT UNE RACINE, et le motif n'est pas « rendements décroissants » — c'est
   la LISIBILITÉ. En pente droite, cent clics mènent au plafond et les vingt premiers ne se
   voient pas : ×1,18 sur un clic qui ne pèse déjà rien, personne ne découvre que la mécanique
   existe. En racine, trois clics donnent déjà ×1,35 et neuf donnent ×1,60. Une mécanique
   qu'on ne remarque pas n'existe pas. C'est aussi l'idiome de la maison — `sizeFactor` est
   logarithmique pour la même raison.

   Ce que la racine déplace, et c'est voulu : le dixième clic vaut trois fois le quatre-vingt-
   dixième, donc le combo cesse de dire « plus tu enchaînes, mieux c'est » et dit « atteins le
   plateau vite, puis TIENS-LE ». C'est exactement ce que la règle des quinze secondes décrit
   déjà : un mécanisme de maintien, pas de croissance. Les deux vont ensemble.

   NI L'UN NI L'AUTRE NE SE SAUVEGARDE. Un rechargement est une absence : le combo tombe, et
   l'idle repart de zéro. Les garder aurait fait d'un aller-retour un raccourci.

   LA CARTE OCELLÉE EST NEUTRE AUX DEUX. Elle clique à ta place : sans règle, elle monterait
   le combo toute seule et empêcherait l'idle à vie — la carte deviendrait une malédiction, et
   la mécanique une automatisation de plus. La doctrine existe déjà dans ce fichier, écrite
   pour la bête finie et pour la plonge : CE QUI RÉCOMPENSE LA PRÉSENCE NE S'AUTOMATISE PAS.
   Ses clics ne montent donc pas le combo, et ne cassent pas l'idle. */
const COMBO_MAX    = 3;      // le plafond du multiplicateur
const COMBO_PLEIN  = 100;    // les clics qui y mènent
const COMBO_FIN    = 15;     // secondes sans clic avant de tout perdre
const IDLE_SEUIL   = 60;     // secondes sans clic avant que la ferme se mette au calme
const IDLE_X       = 1.5;    // ce que le calme vaut sur tout ce qui tourne

let combo = 0, dernierClic = 0;

const comboMult = () => 1 + (COMBO_MAX - 1) * Math.sqrt(Math.min(1, combo / COMBO_PLEIN));

/* LE CLIC QUI COMPTE EST CELUI DE LA MAIN, et il ne compte que sur un SUJET — une bête ou un
   œuf. Acheter une amélioration, régler le marchand, ouvrir un panneau : rien de tout cela ne
   monte le combo, et rien ne casse l'idle. C'est la demande telle qu'elle a été posée, et elle
   est juste : gérer sa ferme n'est pas s'acharner dessus. */
function noterClic() {
  dernierClic = Date.now();
  if (combo < COMBO_PLEIN) combo++;
}

const enIdle = () => !rattrapage && dernierClic > 0 &&
                     Date.now() - dernierClic >= IDLE_SEUIL * 1000;

/* L'IDLE NE S'APPLIQUE PAS AU RATTRAPAGE, et c'est la distinction que ces deux états posent :
   s'arrêter n'est pas partir. Une absence est le cas idle parfait — une minute sans clic, par
   définition — donc sans cette garde elle aurait repris d'une main ce que la `4.12.3` venait
   de borner de l'autre. */
const coefIdle = () => enIdle() ? IDLE_X : 1;

/* Il commence ARRÊTÉ et non plein : `dernierClic` vaut zéro tant qu'on n'a pas cliqué une
   première fois, sinon le jeu s'ouvrirait en idle sur un joueur qui n'a encore rien fait —
   une récompense de présence donnée avant la présence. */
function tickCombo() {
  if (combo && Date.now() - dernierClic >= COMBO_FIN * 1000) combo = 0;
}

/* Le doublement se pose ICI, à la source : clickGain en découle, et `remaining()` compte
   déjà en clics à partir de la même fonction — la frénésie annonce donc toute seule qu'il
   reste deux fois moins de clics à donner, sans une ligne de plus. */
const clickPower  = () => (1 + force('clic') + (prime('poigne') ? 3 : 0)) *
                          (prime('main') ? 2 : 1) * (enFrenesie() ? FRENESIE_X : 1) *
                          comboMult() *
                          (1 + bonusAlbum().clic + bonusPrimes().clic + bonusCiel().clic);

/* La vitesse à laquelle le sujet avance sans toi : l'automate qui s'en occupe à cet
   instant précis, et 0 tant qu'aucun n'est acheté. */
const autoRate = s => s.kind === 'egg' ? force('couveuse')
                    : estMur(s.c) ? FATTEN_X * force('mangeoire') * temperOf(s.c).fat
                    : force('eleveur') * ELEVEUR_X;

/* Ce que l'album ajoute à CE sujet-là, selon ce qu'il est en train de faire : un œuf couve,
   une bête grandit, une bête mûre engraisse. Trois familles de motifs, une seule fonction. */
const albumVitesse = s => {
  const b = bonusAlbum(), p = bonusPrimes();
  return 1 + (s.kind === 'egg' ? b.couvee + p.couvee
            : estMur(s.c) ? b.gras + p.gras : b.pousse + p.pousse);
};

// La vitesse réellement observée : celle des automates, poussée par l'album. C'est elle
// qu'il faut afficher, sinon le panneau annonce une durée que la barre ne tient pas.
/* La vitesse RÉELLEMENT observée : les automates, poussés par l'album — et par le calme, sinon
   le panneau annonce une durée que la barre ne tient pas dès que la ferme se met en idle. */
const autoReel = s => autoRate(s) * albumVitesse(s) * coefIdle();

/* Un clic vaut toujours le même temps réel, quoi qu'on ait automatisé. Sans ça les
   automates nerfaient le clic au moment même où on payait pour aller plus vite :
   à éleveur ×7, un « +14 s » n'avançait la bête que de deux secondes de ce que la
   machine faisait déjà. Le clic apporte donc clickPower secondes d'automate — il reste
   un raccourci qui se sent, du premier œuf au centième niveau. */
/* L'album multiplie le clic AVANT le plancher, pas après : c'est ce qui le fait sentir dès
   la première seconde d'une nouvelle partie, quand plus aucun automate n'est acheté. Une fois
   un automate en route, le produit redonne exactement la vitesse réelle de la machine. */
/* ── LE CLIC PÈSE MOINS SUR LA CROISSANCE, ET SUR ELLE SEULE ───────────────────
   Un tiers de ce qu'il valait, et rien ne change ailleurs : une coquille se casse au doigt
   comme avant, une bête mûre s'engraisse comme avant. Seule LA MONTÉE EN NIVEAU passe la main
   à l'éleveur, parce que c'est le seul endroit où le doigt battait la machine.

   LE DIVISEUR EST 3 × ELEVEUR_X, ET LES DEUX TIERS NE DISENT PAS LA MÊME CHOSE. Le premier
   annule le triplement de l'éleveur, qui remonterait sinon dans le clic par `autoRate` — un
   clic vaut des secondes d'automate, donc il gagne tout ce que l'automate gagne. Le second est
   la baisse voulue. Sans le premier, tripler la machine aurait rendu le doigt trois fois plus
   fort au lieu de trois fois moins.

   IL S'APPLIQUE DEDANS LE PLANCHER, ET C'EST TOUTE L'OUVERTURE DU JEU. Tant qu'aucun éleveur
   n'est acheté, `autoRate` vaut zéro, le plancher rend 1, et le clic vaut exactement ce qu'il
   valait hier : la première bête se monte au doigt à la même vitesse. La baisse n'apparaît
   qu'une fois la machine assez forte pour dépasser ce plancher — c'est-à-dire au moment précis
   où elle est censée prendre le relais. Appliqué DEHORS, il aurait divisé par neuf le seul
   moyen de jouer les dix premières minutes. */
const CLIC_POUSSE = 1 / (3 * ELEVEUR_X);
const partClic  = s => s.kind === 'creature' && !estMur(s.c) ? CLIC_POUSSE : 1;
const clickGain = s => clickPower() * albumVitesse(s) * Math.max(1, autoRate(s) * partClic(s));

/* ── UNE BÊTE FINIE ────────────────────────────────────────────────────────────
   TROIS PLAFONDS À LA FOIS : l'âge légende, le niveau cent, et le dernier rang de taille.
   Les trois ensemble, jamais un seul — une commune mûre à l'âge enfant est déjà « au max de
   sa tranche », et si elle comptait, c'est toute la ferme qui compterait.

   LE TROISIÈME EST UN VRAI BOUT, et c'est ce qui rend la notion honnête. L'embonpoint est
   logarithmique donc il ne sature jamais en théorie, mais l'échelle des rangs, elle, s'arrête :
   atteindre `démesuré` demande 579 fois la croissance d'un âge, et le cran suivant — s'il
   existait — en demanderait 7 400, treize fois plus. Personne n'irait. `rankOf` le dit déjà en
   ne rendant plus de suivant.

   CE QUI MANQUAIT : rien ne le disait. Au dernier rang le nom cesse de changer, la taille à
   l'écran est plafonnée, et la valeur continue de grimper de façon imperceptible. La bête était
   finie et le jeu ne le reconnaissait pas — on cliquait dessus sans que rien n'arrive. */
const estFinie = c => c.age === AGES.length && niveau(c) === NIV_MAX &&
                      rankOf(sizeFactor(c)).next === null;

/* CE QU'UN CLIC REND ALORS : les secondes qu'il aurait fait grandir, converties en rente, au
   cinq-centième. Le taux n'est pas décoratif, il est calé sur un rapport :

   Sans lui, un clic de fin de partie — 408 secondes, primes et martelé compris — vaudrait
   408 secondes de rente, soit ONZE POUR CENT de la valeur de la bête. Neuf clics égaleraient
   une vente, et vendre n'aurait plus de sens.

   MESURÉ AU BANC, au cinq-centième, sur une légende mythique chromatique menée au dernier
   rang : un clic vaut 2,45 secondes de sa rente, et il faut environ MILLE CINQ CENTS clics
   pour égaler une vente — trois minutes de clic continu. Cliquer cette seule bête rapporte
   alors à peu près autant que la rente passive de vingt enclos pleins : l'actif égale le
   passif sans l'écraser, ce qui est exactement le point visé.

   IL PASSE PAR `clickGain`, donc la force du clic, le martelé et la frénésie le nourrissent
   tous les trois — c'est précisément ce qui leur manquait en fin de partie, où le clic cessait
   de peser. Et par `renteOf`, donc le tigré et les primes de rente aussi. */
const RENTE_CLIC = 1 / 500;
const gainClicFini = (c, s) => Math.max(1, Math.round(renteOf(c) * clickGain(s) * RENTE_CLIC));

/* La taille se mesure en durées de croissance avalées EN PLUS de ce que son âge demandait.
   Le diviseur est la tranche courante, quatre à six fois plus longue à chaque cran : c'est
   ce qui fait qu'on peut conserver l'embonpoint à travers l'évolution sans rien offrir. */
const sizeFactor = c => 1 + OVER_GAIN * Math.log(1 + (c.over || 0) / ageGrow(c));
// nivMult est défini plus bas : sellValue n'est appelée qu'une fois le fichier chargé.
const sellValue  = c => Math.max(1, Math.round(baseValue(c) * nivMult(c)));

/* Ce qu'une bête rapporte par seconde en restant simplement là. La valeur de vente porte
   déjà le niveau, l'âge, la rareté, la teinte et la taille : la rente en découle
   directement, et une bête rapporte à proportion exacte de ce qu'elle vaut. */
/* LA RENTE EST SUSPENDUE POUR UN PARENT. C'est là qu'est tout le prix de la pension : la
   bête garde sa case et cesse de payer le loyer. Une bête qui couve est gelée partout
   ailleurs de la même façon — clic, éleveur, mangeoire, évolution et marchand la sautent. */
const renteOf = c => enPension(c) ? 0
                   : c.age >= AGE_RENTE
                   ? sellValue(c) / RENTE_H * (c.prodige ? RENTE_PRODIGE : 1)
                     * (1 + bonusAlbum().rente) * coef('rente')
                   : 0;
const renteTotale = () => state.pen.reduce((n, c) => n + renteOf(c), 0);

/* La consigne du marchand pour CETTE bête : l'âge à partir duquel il la vend, 0 s'il n'y
   touche jamais. Chaque rareté a la sienne — c'est ce qui permet d'écouler les communes
   dès l'âge adulte pendant qu'on mène les mythiques jusqu'à la légende. */
const venteAu = c => (state.sellAt && state.sellAt[lineOf(c).rarity]) || 0;

/* La taille minimale exigée par le marchand n'existe QUE si une mangeoire tourne. Sans
   automate qui engraisse, elle bloquerait l'enclos sans que rien ne puisse jamais l'en
   sortir — et surtout elle obligerait à comprendre l'embonpoint pour vendre, alors que la
   vente doit rester la chose la plus simple du jeu. */
const tailleExigee = c => tailleDe(lineOf(c).rarity);
const tailleDe = cle => (lvl('mangeoire') ? (state.sellRank[cle] || 0) : 0);

// La consigne d'évolution pour CETTE bête, 0 si sa rareté ne doit pas monter.
const evolueJusqu = c => (state.evolveUpTo && state.evolveUpTo[lineOf(c).rarity]) || 0;

/* Jusqu'où l'évolution automatique a le droit de pousser cette bête. Le vendeur commande :
   inutile de payer une évolution vers un âge auquel on a demandé de vendre avant. */
const plafondEvolution = c => {
  const monte = evolueJusqu(c), vise = venteAu(c);
  return vise ? Math.min(monte, vise) : monte;
};

// Y a-t-il seulement une rareté à faire monter ? Sinon la boucle d'évolution ne tourne pas.
const evolueQuelqueChose = () => Object.keys(RARITY).some(cle => (state.evolveUpTo[cle] || 0) > 1);

function rankOf(sf) {
  let i = 0;
  while (i + 1 < RANKS.length && sf >= RANKS[i + 1].at) i++;
  return { i, name: RANKS[i].name, fem: RANKS[i].fem, from: RANKS[i].at, next: RANKS[i + 1] || null };
}

/* Comment l'annoncer : son âge, et le rang de taille quand on l'a engraissée au-delà de ce
   que son âge demandait. « adulte », « adulte énorme », « légende démesurée ».

   L'adjectif s'accorde avec le NOM D'ÂGE, jamais avec la bête : c'est l'âge qu'il qualifie.
   Une seule fonction pour ça, parce que l'album fabrique la même étiquette de son côté et que
   deux copies finiraient par se contredire. */
function nomAge(age, rangIdx) {
  const a = AGES[age - 1], r = RANKS[rangIdx || 0];
  const adj = a.fem ? r.fem : r.name;
  return adj ? a.nom + ' ' + adj : a.nom;
}
const etatOf = c => nomAge(c.age, rankOf(sizeFactor(c)).i);

/* Ce que vaut le niveau où elle en est, en fraction d'une bête mûre de son âge : 0,15 au
   premier niveau de la tranche, 1 au dernier, et une montée géométrique entre les deux —
   entre +7 % et +14 % par niveau. La valeur est PLATE à l'intérieur d'un niveau et saute au
   passage : c'est le clic qui fait changer de niveau qui paie, pas les vingt d'avant.
   L'embonpoint, lui, se multiplie par-dessus. */
function nivMult(c) {
  const k = nivDansAge(c.age);
  const dans = Math.pow(NIV_MIN_MULT, (k - 1 - nivDansTranche(c)) / (k - 1));
  return dans * rankOf(sizeFactor(c)).from;
}

// Une forme par âge : la silhouette change au moment où l'on paie, pas trois niveaux plus
// tard. C'est ce qui a rendu les quatre-vingt-quinze glyphes juvéniles inutiles.
const glyphOf = c => form(c.line, c.age)[1];

/* Échelle visuelle, monotone PAR CONSTRUCTION : elle ne lit que le total de croissance
   avalé — qui ne fait que monter — et l'âge, qui ne fait que monter aussi. Une bête ne
   rétrécit donc jamais, quoi qu'on lui fasse. */
const PLEINE_VIE = CUM[CUM.length - 1];
function visualScale(c) {
  const tot = c.p + (c.over || 0);
  const r = Math.min(SCALE_GRAS,
                     Math.log(1 + tot / GROW[0]) / Math.log(1 + PLEINE_VIE / GROW[0]));
  return (SCALE_MIN + (SCALE_MAX - SCALE_MIN) * r) * AGE_SCALE[c.age - 1];
}

/* L'économie court maintenant de 40 à des dizaines de milliards : au-delà du million on
   abrège, sinon les boutons débordent et plus personne ne lit les chiffres. */
function fmt(n) {
  n = Math.floor(n);
  const signe = n < 0 ? '-' : '', a = Math.abs(n);
  const court = (v, u) => signe + v.toFixed(v < 10 ? 2 : 1).replace('.', ',') + ' ' + u;
  /* Les paliers de jetons montent jusqu'à 10^30 : sans ces trois crans, le panneau
     d'ascension annoncerait « 1 000 000 000 000 000 000,0 Bn » pour le prochain. */
  if (a >= 1e30) return court(a / 1e30, 'Qi');
  if (a >= 1e24) return court(a / 1e24, 'Qa');
  if (a >= 1e18) return court(a / 1e18, 'Tn');
  if (a >= 1e12) return court(a / 1e12, 'Bn');
  if (a >= 1e9)  return court(a / 1e9, 'Md');
  if (a >= 1e6)  return court(a / 1e6, 'M');
  return signe + a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function dec(n, d) { return n.toFixed(d === undefined ? 2 : d).replace('.', ','); }

// Une rente commence à deux centièmes de pièce par seconde : fmt l'arrondirait à zéro et
// donnerait l'impression que rien ne tombe. On garde donc les décimales tant qu'il en faut.
const fmtRente = n => n < 10 ? dec(n) : n < 1000 ? dec(n, 1) : fmt(n);

function fmtTime(s) {
  s = Math.max(0, Math.ceil(s));
  if (s < 60) return s + ' s';
  if (s < 3600) return Math.floor(s / 60) + ' m ' + String(s % 60).padStart(2, '0') + ' s';
  return Math.floor(s / 3600) + ' h ' + String(Math.floor((s % 3600) / 60)).padStart(2, '0') + ' m';
}

/* Deux compteurs, jamais les deux à la fois. Tant que rien ne pousse tout seul, annoncer
   des secondes serait un mensonge : ce qui reste à faire se mesure en clics. Dès qu'un
   automate tourne, c'est le temps qui compte — et lui seul. Afficher « ou n clics » à
   côté donnait deux unités pour une même attente, et invitait à marteler une barre qui
   avançait déjà. */
function remaining(left, speed) {
  if (speed > 0) return fmtTime(left / speed);
  const n = Math.max(1, Math.ceil(left / clickPower()));
  return n + (n > 1 ? ' clics' : ' clic');
}

function markSeen(lineKey, age) { state.seen[lineKey + ':' + age] = true; }
const seenCount = () => Object.keys(state.seen).length;

/* ─────────────────────────────────────────────
   Le sujet à l'écran — un seul à la fois
   ───────────────────────────────────────────── */

/* L'ordre de la bande, et donc celui des cases. Dès que les œufs couvent seuls ils cessent
   d'être le sujet : les bêtes passent devant, pour rester à portée de clic même avec dix
   incubateurs. Dans les deux ordres, les bêtes forment un bloc d'un seul tenant — c'est ce
   qui permet de raisonner en « case » sans que les œufs s'intercalent. */
/* Trois façons de ranger l'enclos, et une seule règle : la clé de tri ne doit jamais bouger
   toute seule. Trier par avancement de la barre serait le classement le plus parlant, mais
   la bande se réordonnerait dix fois par seconde et la vignette visée fuirait sous le doigt.
   Rareté et âge ne changent qu'à l'éclosion et à l'évolution : la bande tient en place.
   Le NIVEAU, lui, ne peut pas servir de clé : il monte cent fois par vie, et la bande se
   réordonnerait sous le doigt.

   Le chromatique passe devant tout le reste. Il ignore la lignée — on peut avoir un têtard
   chromatique — donc aucun tri par rareté ne le remonterait, alors que c'est précisément la
   bête qu'on cherche des yeux. */
const TRIS = {
  arrivee: null,
  rarete: (a, b) => (b.c.prodige ? 1 : 0) - (a.c.prodige ? 1 : 0)
                 || RARITY[lineOf(b.c).rarity].rank - RARITY[lineOf(a.c).rarity].rank
                 || b.c.age - a.c.age || a.c.id - b.c.id,
  age: (a, b) => b.c.age - a.c.age
                 || RARITY[lineOf(b.c).rarity].rank - RARITY[lineOf(a.c).rarity].rank
                 || a.c.id - b.c.id,
};

/* UNE BÊTE CONFIÉE QUITTE LA BANDE. Elle reste dans `state.pen` — elle occupe toujours son
   enclos, et c'est tout le prix de la pension — mais elle n'est plus un SUJET : on ne la
   sélectionne plus, on ne clique plus dessus, on ne la vend plus, et elle ne se traîne plus
   dans une bande de quarante vignettes dont seize seraient inertes.

   Elle est visible ailleurs, et mieux : la ligne de son couple, au panneau de la pension, dit
   ce qu'elle fait et depuis combien de temps. La bande montre ce sur quoi on peut agir, le
   panneau montre ce qui travaille.

   C'est aussi ce qui rend la pause inutile pour composer un couple. Avant, on déposait une
   bête dans le nid et elle continuait de vieillir, d'être vendue et de bouger dans la bande
   sous la main ; maintenant elle en sort au moment du dépôt. Si le marchand l'attrape entre
   le geste et le clic, elle disparaît simplement — et le nid le dit à la ligne suivante.

   ET ÇA VAUT DÈS LE NID, PAS SEULEMENT UNE FOIS LE COUPLE PARTI. Ce paragraphe le promettait
   depuis la 1.8.0 et le filtre ne portait que sur les couples EN COURS : une bête posée au nid
   restait dans la bande, si bien qu'on la reprenait pour l'autre case sans s'en apercevoir, ou
   qu'on cherchait dans quarante vignettes celle qu'on venait d'y mettre. Le nid est un
   engagement en cours, pas un brouillon — et on peut toujours le défaire en cliquant la case,
   ce qui la fait réapparaître. */
/* L'ORDRE DES ŒUFS SUR LA BANDE, et pourquoi il compte autant que celui de la file.

   Le réglage vit sur la bande de couvaison. Le poser là et ne trier QUE la file invisible,
   c'était promettre une chose et en faire une autre : on clique « rareté », on regarde la
   bande, et rien ne bouge. Un tri qui ne trie pas ce qu'il surplombe n'est pas un tri.

   Il fait donc les deux, exactement comme celui de l'enclos : il range ce qu'on VOIT couver,
   et il décide de ce qui SORT ensuite de la réserve. Une seule règle, deux endroits où elle
   se lit.

   PAR ARRIVÉE, ON NE TOUCHE À RIEN : les incubateurs sont déjà dans l'ordre où on les a
   remplis. Et les cases VIDES vont au bout — c'est là qu'on clique pour poser un œuf, elles
   n'ont rien à faire au milieu de ce qui couve. */
const TRI_COUVEE = (a, b) => {
  if (!a.slot || !b.slot) return (a.slot ? 0 : 1) - (b.slot ? 0 : 1);
  const ra = RARITY[(EGG_BY_KEY[a.slot.kind] || {}).rarity || 'commune'].rank;
  const rb = RARITY[(EGG_BY_KEY[b.slot.kind] || {}).rarity || 'commune'].rank;
  return rb - ra || b.slot.p - a.slot.p;
};

function subjects() {
  const list = state.incub.map((slot, i) => ({ key: 'i:' + i, kind: 'egg', i, slot }));
  if (state.triOeuf === 'rarete') list.sort(TRI_COUVEE);
  const betes = state.pen.filter(c => !enPension(c) && !surLeNid(c.id))
                         .map(c => ({ key: 'c:' + c.id, kind: 'creature', c }));
  const tri = TRIS[state.tri];
  if (tri) betes.sort(tri);
  /* Les bêtes d'abord : la bande les montre dans deux groupes séparés, mais tenirLaCase et
     fallback lisent cette liste-ci, et pour eux c'est le vivant qui compte. */
  return betes.concat(list);
}

const caseCourante = () => subjects().findIndex(s => s.key === state.sel);

/* Vendre ne doit pas déplacer le regard. Si on était sur la case 6, on reste sur la case 6 :
   c'est la voisine qui glisse dedans, exactement comme dans une liste dont on retire une
   ligne. Sauter à « la bête la plus avancée » faisait traverser la bande à chaque vente,
   et rendait impossible d'écouler un enclos case par case.

   Seule entorse : on ne quitte jamais le vivant pour un œuf. Si la case libérée retombe sur
   une coquille alors qu'il reste des bêtes, on s'arrête au bord du bloc vivant. */
function tenirLaCase(place) {
  const list = subjects();
  if (!list.length) { state.sel = null; return; }
  const vivants = list.filter(s => s.kind === 'creature');
  if (!vivants.length) {
    state.sel = list[Math.min(place, list.length - 1)].key;
    return;
  }
  const debut = list.indexOf(vivants[0]);
  const dans = Math.min(Math.max(place - debut, 0), vivants.length - 1);
  state.sel = vivants[dans].key;
}

/* Ce qu'on met en scène quand la sélection a disparu sans qu'on sache d'où — une sauvegarde
   rechargée, un état incohérent. Toujours du vivant en priorité, et le plus avancé : c'est
   lui qui demande une décision. Un œuf ne passe au premier plan que s'il n'y a rien d'autre
   à regarder. Une vente, elle, ne passe jamais par ici : elle tient sa case. */
function fallback(list) {
  const vivants = list.filter(s => s.kind === 'creature');
  if (vivants.length) {
    return vivants.sort((a, b) => b.c.p - a.c.p)[0];
  }
  const oeufs = list.filter(s => s.kind === 'egg' && s.slot);
  if (oeufs.length) return oeufs.sort((a, b) => b.slot.p - a.slot.p)[0];
  return list[0] || null;
}

function current() {
  const list = subjects();
  return list.find(s => s.key === state.sel) || fallback(list);
}

/* REGARDER UNE BÊTE LA PROTÈGE TROIS SECONDES. En ×100 le marchand vide un enclos plus vite
   qu'on ne vise : on clique une bête pour la garder ou la vendre soi-même, et elle est déjà
   partie. Trois secondes suffisent à faire le geste d'après.

   TROIS EXCEPTIONS AVAIENT DÉJÀ ÉTÉ ESSAYÉES ET RETIRÉES, et celle-ci n'est aucune des trois.
   L'immunité à vie pour la bête en scène laissait invendue pour toujours celle qu'on venait
   d'évoluer à la main ; la protection tant que l'onglet est visible revenait au même ; et le
   sursis de dix secondes depuis le dernier CLIC protégeait mal, parce que regarder une bête
   n'est pas la cliquer.

   Ici le déclencheur est la SÉLECTION — c'est-à-dire précisément le geste de regarder — et le
   sursis EXPIRE. Aucune bête ne peut donc rester invendue, ce qui était le défaut commun aux
   deux premières, et il se déclenche sur le bon geste, ce qui était le défaut de la troisième.

   Le compte est en temps RÉEL et non en temps de jeu : c'est le temps de réaction du joueur
   qu'on protège, et il ne va pas cent fois plus vite parce que la ferme, elle, y va. */
const SURSIS_FOCUS = 3000;
let focusJusqu = 0, focusQui = null;

const protegee = c => !rattrapage && c.id === focusQui && Date.now() < focusJusqu;

function select(key) {
  state.sel = key;
  if (String(key).startsWith('c:')) {
    focusQui = parseInt(String(key).slice(2), 10);
    focusJusqu = Date.now() + SURSIS_FOCUS;
  }
  refresh();
}

/* ─────────────────────────────────────────────
   Effets — le clic doit être agréable
   ───────────────────────────────────────────── */

/* CE QU'UN ACHAT UNIQUE ANNONCE. Trois endroits le disaient à l'identique — une faveur, une
   route de carrefour, une prime — et les trois allaient chercher `$('subject')` eux-mêmes pour
   trois lignes de mise en scène. Ce sont des RÈGLES D'ACHAT : elles décident d'une dépense,
   elles n'ont pas à connaître le centre de l'écran. */
function annoncerAchat(quoi, accord) {
  chord(accord, accord.length > 3 ? 80 : 70);
  const pt = centerOf($('subject'));
  floatText(pt.x, pt.y - 60, quoi.glyphe + ' ' + quoi.nom, 'gain');
}

const fxLayer = $('fx');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let audioCtx = null;

function blip(freq, dur, type, vol) {
  if (!state.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.025, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.06));
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + (dur || 0.06));
  } catch (e) { /* pas de son, pas grave */ }
}

function chord(freqs, gap) {
  freqs.forEach((f, i) => setTimeout(() => blip(f, 0.12, 'triangle', 0.035), i * (gap || 70)));
}

function floatText(x, y, text, cls) {
  if (reduceMotion) return;
  const el = document.createElement('span');
  el.className = 'float ' + (cls || '');
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  fxLayer.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function burst(x, y, glyph, count) {
  if (reduceMotion) return;
  for (let i = 0; i < (count || 8); i++) {
    const el = document.createElement('span');
    const a = (Math.PI * 2 * i) / (count || 8) + Math.random() * 0.5;
    const d = 55 + Math.random() * 60;
    el.className = 'spark';
    el.textContent = glyph;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--dx', Math.cos(a) * d + 'px');
    el.style.setProperty('--dy', Math.sin(a) * d + 'px');
    fxLayer.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function flash(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;   // force le redémarrage de l'animation
  el.classList.add(cls);
}

// Le coup de grossissement, réservé au changement d'étape.
function pulse() {
  const el = document.querySelector('.subject-scale');
  if (el) flash(el, 'grew');
}

/* Trois échelles d'événement, sinon cent niveaux par vie deviennent cent fanfares : la
   maturité et le rang de taille se fêtent, un simple niveau se contente d'un à-coup. */
function celebrate(c, valueBefore, pt, quoi) {
  refresh();                                   // la nouvelle échelle avant l'animation
  const gain = sellValue(c) - valueBefore;
  burst(pt.x, pt.y, '✦', 12);
  floatText(pt.x, pt.y - 70, quoi || etatOf(c), 'gain');
  if (gain > 0) floatText(pt.x, pt.y - 100, '+' + fmt(gain) + ' à la vente', 'gain');
  chord([523, 659, 784, 1046], 70);
  pulse();
}

// Un niveau de plus : le numéro s'envole, l'animal tressaille, une note. Rien de plus.
function monteeNiveau(c, valueBefore, pt) {
  refresh();
  const gain = sellValue(c) - valueBefore;
  floatText(pt.x, pt.y - 70, 'niv. ' + niveau(c), 'gain');
  if (gain > 0) floatText(pt.x, pt.y - 96, '+' + fmt(gain), 'gain');
  blip(760, 0.07, 'triangle', 0.03);
  pulse();
}

/* ─────────────────────────────────────────────
   Actions
   ───────────────────────────────────────────── */

function tapStage() {
  // une ferme arrêtée l'est pour tout le monde, la main du joueur comprise
  if (enPause) { blip(300, 0.05, 'sine', 0.03); return; }
  // tant qu'elle n'a pas ouvert la porte, il n'y a rien à laver
  if (enPlonge()) { if (plongeOuverte()) laverAssiette(); return; }
  const s = current();
  if (!s) return;
  const el = $('subject');
  const pt = centerOf(el);
  const jitter = () => pt.x + (Math.random() * 60 - 30);

  const power = clickGain(s);

  if (s.kind === 'egg') {
    if (!s.slot) { placeEgg(s.i); return; }
    const dure = hatchTime(s.slot);
    if (s.slot.p >= dure) return;
    s.slot.p = Math.min(dure, s.slot.p + power);
    /* LE COMBO SE NOTE APRÈS COUP, jamais avant : `power` est déjà pris, donc un clic ne se
       paie pas lui-même. C'est ce que « une série de clics donne un boost » veut dire — le
       boost vient de la série DÉJÀ faite. Et il se note exactement là où le compteur de clics
       se note, parce que ces lignes disent déjà « la main du joueur a cliqué ». */
    if (!mainDeCarte) { state.stats.clics++; noterClic(); }
    flash(el, 'shake');
    floatText(jitter(), pt.y - 20, '+' + fmt(power) + ' s');
    blip(220 + Math.random() * 60, 0.035, 'square', 0.02);
    if (s.slot.p >= dure) hatchAll(); else refresh();
    return;
  }

  const c = s.c;
  /* UNE BÊTE QUI COUVE NE GRANDIT PAS. Le dire plutôt que ne rien faire : un clic sans effet
     et sans explication est la première chose qu'on prend pour un bug. */
  if (enPension(c)) {
    floatText(jitter(), pt.y - 20, 'elle couve');
    flash(el, 'shake');
    return;
  }
  /* UNE BÊTE FINIE PAIE, ET SEULEMENT SOUS LA MAIN DU JOUEUR. La carte ocellée clique à ta
     place : si elle encaissait, elle deviendrait une machine à monnaie automatique et cette
     mécanique produirait l'inverse de son intention — au lieu de pousser à cliquer, elle
     rendrait le clic inutile en le déléguant. `mainDeCarte` est déjà levé pendant ses clics,
     et la plonge s'en sert déjà pour se refuser à elle : le précédent existe.

     Sous sa main à elle, on retombe donc sur l'embonpoint, comme avant. Ce n'est pas perdu,
     c'est seulement imperceptible — et c'était déjà le cas. */
  if (estFinie(c) && !mainDeCarte) {
    const gain = gainClicFini(c, s);
    state.coins += gain;
    state.stats.gagne += gain;
    state.stats.clics++;
    noterClic();
    flash(el, 'shake');
    floatText(jitter(), pt.y - 20, '+' + fmt(gain), 'gain');
    blip(180 + Math.random() * 50, 0.035, 'square', 0.02);
    refresh();
    return;
  }

  const avantNiv = niveau(c), avantMur = estMur(c);
  const avantRang = rankOf(sizeFactor(c)).i, avantValeur = sellValue(c);
  /* Un clic ajoute de la vie avant comme après la maturité : la créature ne cesse jamais de
     grandir. Mûre, elle ne monte plus de niveau tant que le péage n'est pas payé — ce
     qu'elle avale part alors dans l'embonpoint, et n'y sera pas perdu. */
  if (avantMur) c.over = (c.over || 0) + power;
  else c.p = Math.min(bandTo(c), c.p + power * growRate(c));
  if (!mainDeCarte) { state.stats.clics++; noterClic(); }
  flash(el, 'shake');
  floatText(jitter(), pt.y - 20, '+' + fmt(power) + ' s');
  blip(180 + Math.random() * 50, 0.035, 'square', 0.02);
  if (estMur(c) && !avantMur) { celebrate(c, avantValeur, pt, 'mûre — prête à évoluer'); return; }
  if (rankOf(sizeFactor(c)).i !== avantRang) { celebrate(c, avantValeur, pt); return; }
  if (niveau(c) !== avantNiv) { monteeNiveau(c, avantValeur, pt); return; }
  refresh();
}

/* Laver une assiette. Refusée à la carte ocellée : `mainDeCarte` est levé pendant ses clics,
   et c'est le seul endroit du jeu où l'on distingue la main du joueur de celle d'une carte. */
/* Un coup d'éponge. Dix en font une assiette, et une assiette fait une pièce — aucun
   multiplicateur n'entre nulle part dans cette fonction, et c'est délibéré. */
function laverAssiette() {
  if (mainDeCarte || !plongeOuverte()) return;
  state.stats.clics++;
  const el = $('subject'), pt = centerOf(el);
  flash(el, 'shake');
  state.frotte = (state.frotte || 0) + 1;

  if (state.frotte < ASSIETTE_CLICS) {
    blip(240 + state.frotte * 12, 0.025, 'triangle', 0.015);
    refresh();
    return;
  }

  // l'assiette est propre
  state.frotte = 0;
  state.coins += ASSIETTE;
  state.stats.assiettes = (state.stats.assiettes || 0) + 1;
  state.stats.gagne += ASSIETTE;
  floatText(pt.x + (Math.random() * 40 - 20), pt.y - 20, '+' + ASSIETTE);
  blip(520, 0.05, 'sine', 0.03);
  // la dernière sonne autrement : c'est le moment où l'on redevient éleveur
  if (!enPlonge()) chord([392, 523, 659], 60);
  refresh();
}

/* LA RÈGLE SEULE : sortir un œuf de la réserve et le poser. Ni son, ni redessin, ni sélection
   — trois choses qui n'ont rien à faire dans une boucle d'automate, et c'est bien pourquoi la
   boucle de vidage recopiait ce corps au lieu d'appeler `placeEgg`. Une recopie qui a coûté :
   la garde `!kind` ne vivait que dans l'original, si bien que la copie inscrivait un NaN dans
   les comptes et remplissait chaque case d'un œuf fantôme dès que la réserve ne désignait plus
   rien. La règle est ici, une fois ; ce qui se voit et s'entend reste chez l'appelant.

   ON RETIRE DE LA FILE AVANT DE DÉCOMPTER, pour la même raison qu'on y pousse avant de
   compter : `fileOeufs` RÉCONCILIE la file avec les comptes. Décompter d'abord la laissait
   plus longue d'un cran, donc jugée fausse, donc RECONSTRUITE — et l'ordre d'arrivée était
   perdu à chaque œuf posé, silencieusement. */
function poserOeuf(i, kind) {
  if (state.incub[i] || !kind || !eggStock(kind)) return false;
  retirerFile(kind);
  state.eggs[kind]--;
  state.incub[i] = Object.assign({ p: 0, kind }, tireLigne(kind));
  return true;
}

function placeEgg(i, kind) {
  if (!poserOeuf(i, kind || bestStocked())) return;
  // On ne quitte jamais une bête vivante pour un œuf : le joueur veut voir son animal.
  // Si le joueur regardait justement cet incubateur, il y reste — sa sélection n'a pas bougé.
  if (!state.pen.length) state.sel = 'i:' + i;
  blip(330, 0.05, 'sine', 0.03);
  refresh();
}

function hatchAll() {
  let hatched = 0, lastKey = null, best = null, bestCreature = null;
  for (let i = 0; i < state.incub.length; i++) {
    const slot = state.incub[i];
    if (!slot || slot.p < hatchTime(slot)) continue;
    if (penFull()) continue;
    // on retient le prix de l'œuf : c'est la seule façon de dire au joueur, plus tard,
    // qu'il est en train de vendre à perte
    const c = Object.assign({ id: nextId++, line: slot.line, age: 1, p: 0, over: 0,
                              cost: prixOeuf(EGG_BY_KEY[slot.kind] || EGG_BY_KEY.commun) },
                           variantsDe(slot));
    // un prodige est protégé d'office : on ne perd pas une bête sur huit mille
    // parce que le marchand l'a vendue avant qu'on l'ait vue
    if (c.prodige) { c.keep = true; state.stats.prodiges++; }
    state.pen.push(c);
    state.incub[i] = null;
    markSeen(slot.line, 1);
    noterEclosion(c);
    state.stats.eclos++;
    lastKey = 'c:' + c.id;
    // on retient la plus rare de la fournée pour la mettre en avant
    const line = LINE_BY_KEY[slot.line];
    if (!best || RARITY[line.rarity].rank > RARITY[best.rarity].rank) { best = line; bestCreature = c; }
    hatched++;
  }
  if (hatched) {
    /* Une éclosion ne prend jamais la scène à une bête vivante. Le joueur qui clique sur sa
       créature doit pouvoir la mener au bout sans qu'un œuf la lui enlève des mains — même
       un œuf rare, et même s'il vient d'une lignée qu'il n'a jamais vue. On ne bascule donc
       que si la scène montrait une coquille ou rien du tout. */
    const libre = !state.sel || state.sel.startsWith('i:');
    const rare = best && RARITY[best.rarity].rank > 0;
    if (libre) state.sel = rare ? 'c:' + bestCreature.id : lastKey;
    // Un coup de chance doit s'entendre : c'est le seul moment de loterie du jeu. Il ne se
    // voit en revanche que si la nouvelle venue est bien celle qu'on a sous les yeux —
    // annoncer « lignée rare ! » au-dessus d'une autre bête serait un contresens.
    if (rattrapage) { /* rien à faire entendre ni voir : l'absence se résume à la fin */ }
    else if (rare) chord([523, 659, 784, 1046, 1319], 90);
    else chord([523, 659, 784]);
    if (libre && !rattrapage) {
      const pt = centerOf($('subject'));
      burst(pt.x, pt.y, '✦', rare ? 10 + RARITY[best.rarity].rank * 8 : 12);
      if (rare) floatText(pt.x, pt.y - 90, 'lignée ' + RARITY[best.rarity].name + ' !', 'gain');
      popNext = true;
    }
  }
  if (!rattrapage) refresh();
  return hatched;
}

// Vendre est possible à tout niveau — au prix du niveau. Aucune condition de taille ne s'y
// ajoute jamais : c'est la porte de sortie quand un enclos bloque, elle doit rester simple.
// Le marchand automatique, lui, n'achète que des bêtes mûres.
// Un seul endroit pour compter une vente : elle part de deux fonctions, la main et le marchand.
function compterVente(gain) {
  state.stats.vendues++;
  state.stats.gagne += gain;
  if (gain > state.stats.record) state.stats.record = gain;
}

function sell(c) {
  const gain = sellValue(c);
  compterVente(gain);
  // la case se relève AVANT le retrait : après, la bête n'est plus dans la bande
  const place = state.sel === 'c:' + c.id ? caseCourante() : -1;
  state.coins += gain;
  state.pen = state.pen.filter(x => x.id !== c.id);
  if (place >= 0) tenirLaCase(place);
  const pt = centerOf($('subject'));
  floatText(pt.x, pt.y, '+' + fmt(gain), 'gain');
  burst(pt.x, pt.y, '🪙', 8);
  chord([392, 523], 55);
  refresh();
}

/* Évoluer, c'est franchir le péage — et c'est TOUT ce que ça fait. On ne remet rien à
   zéro : ni la croissance, ni le niveau, ni l'embonpoint. La bête change de nom, de
   silhouette et de tranche, puis repart exactement d'où elle en était. */
function evolve(c) {
  if (!estMur(c) || c.age >= AGES.length) return;
  const cost = evoCost(c);
  if (state.coins < cost) return;
  state.coins -= cost;
  c.age++;
  state.stats.evolutions++;
  markSeen(c.line, c.age);
  const pt = centerOf($('subject'));
  burst(pt.x, pt.y, c.age === AGES.length ? '✦' : '✧', 14);
  floatText(pt.x, pt.y - 80, fullName(c), 'gain');
  floatText(pt.x, pt.y - 112, AGES[c.age - 1].nom + ' · niv. ' + niveau(c), 'gain');
  chord([440, 554, 659, 880], 80);
  popNext = true;
  refresh();
}

/* Protéger une bête, c'est refuser qu'un automate décide de sa vie : ni vendue par le
   marchand, ni fait évoluer — on veut parfois garder une forme précise, et non la pousser
   jusqu'à la légende. C'est le prix d'une place d'enclos immobilisée, et c'est ce qui permet de
   garder un prodige et de continuer l'aventure avec lui. */
function toggleKeep(c) {
  c.keep = !c.keep;
  const pt = centerOf($('subject'));
  floatText(pt.x, pt.y - 40, c.keep ? 'gardée' : 'relâchée', c.keep ? 'gain' : '');
  chord(c.keep ? [523, 784] : [440, 330], 60);
  refresh();
}

function buyEgg(kind) {
  const e = EGG_BY_KEY[kind];
  // une merveille n'a pas de prix : trois listes la cachent déjà, celle-ci ferme la porte
  if (!e || !e.price) return;
  const prix = prixOeuf(e);
  if (state.coins < prix) return;
  // le plafond de réserve vaut pour l'achat comme pour la ponte
  if (eggStock(kind) >= PLAFOND_OEUFS) return;
  state.coins -= prix;
  /* ON POUSSE DANS LA FILE AVANT DE COMPTER, et l'ordre n'est pas anodin : `poserFile` passe
     par `fileOeufs`, qui RÉCONCILIE la file avec les comptes. Compter d'abord lui faisait voir
     le nouvel œuf comme un manquant, elle le rajoutait, puis on le poussait une seconde fois.
     Deux entrées pour un œuf, et la file dérivait à chaque achat. */
  poserFile(kind);
  state.eggs[kind] = eggStock(kind) + 1;
  const free = state.incub.indexOf(null);
  /* ON POSE CE QUE LA FILE DÉSIGNE, PAS CE QU'ON VIENT D'ACHETER, et c'est tout le bogue du
     tri par arrivée : `placeEgg(free, kind)` passait la sorte achetée, donc elle doublait
     toute la réserve et partait en couvaison immédiatement. Acheter un rare le mettait devant
     dix communs qui attendaient depuis dix minutes — exactement ce que « par arrivée » promet
     de ne pas faire.

     Sans sorte, `placeEgg` demande à `bestStocked`, donc au réglage. Réserve vide, le nouvel
     œuf est de toute façon le seul en file : rien ne change pour qui n'a rien en attente. */
  if (free !== -1) placeEgg(free); else { blip(300, 0.04, 'sine', 0.03); refresh(); }
}

/* Une prime s'achète une fois, ne se revend pas, et n'a pas de niveau. La seule chose à
   surveiller est le tableau des incubateurs, qui doit suivre quand la prime en donne. */
function buyPrime(p) {
  if (prime(p.cle) || state.coins < p.prix) return;
  state.coins -= p.prix;
  state.primes[p.cle] = true;
  oublierPrimes();
  if (p.cle === 'nichoir' || p.cle === 'couvoir') syncIncub();
  annoncerAchat(p, [392, 523, 659]);
  refresh();
  save();
}

function buyIncubator() {
  const cost = incubCost();
  if (state.coins < cost) return;
  state.coins -= cost;
  state.incubators++;
  state.incub.push(null);
  chord([330, 494], 60);
  refresh();
}

function buyPen() {
  const cost = penCost();
  if (state.coins < cost) return;
  state.coins -= cost;
  state.pens++;
  chord([330, 494], 60);
  refresh();
}

function buyUpgrade(u) {
  if (upMaxed(u)) return;
  const n = paliersVises(u);
  if (!n) return;
  const cost = coutPaliers(u, n);
  if (state.coins < cost) return;
  state.coins -= cost;
  state.up[u.key] = lvl(u.key) + n;
  chord([523, 659, 784, 1046], 80);
  refresh();
}

// Ce qu'on lit sous le nom de l'amélioration : ce qu'elle fait, ou ce que le prochain
// niveau va changer.
// Un tiers de palier ne tombe pas rond : « ×1,33 » plutôt que « ×1.3333333333 ».
const nb = v => (Number.isInteger(v) ? String(v) : dec(v, 2));

function upLabel(u, lot) {
  const n = lvl(u.key), pas = Math.max(1, lot || 1);
  if (!u.value) return u.desc;
  if (upMaxed(u)) return 'Au maximum · ' + nb(u.value(n)) + u.unit + '.';
  // la toute première fois, on présente l'amélioration avant de parler de niveaux
  if (n === 0 && pas === 1) return u.desc + ' Niveau 1 : ' + nb(u.value(1)) + u.unit + '.';
  return 'Niveau ' + n + ' → ' + (n + pas) + ' · ' +
         nb(u.value(n)) + ' → ' + nb(u.value(n + pas)) + u.unit;
}

/* ─────────────────────────────────────────────
   Simulation
   ───────────────────────────────────────────── */

// Le temps ne fait avancer que ce qui a été automatisé. Tant que rien n'est acheté,
// seuls le clic et la nourriture font bouger quoi que ce soit.
function advance(dt) {
  const b = bonusAlbum();
  const ardeur = coef('vitesse');
  const cl = bonusCiel();
  const bp = bonusPrimes();
  /* L'IDLE PASSE PAR LE MÊME CHEMIN QUE L'ARDEUR, et c'est voulu : il pousse ce qui TOURNE,
     jamais ce qu'on fait à la main. Un bonus au clic ne survit pas à la partie — la ferme
     finit aux automates, à la rente et à la pension — donc récompenser le calme par un clic
     plus fort n'aurait rien récompensé du tout passé la première heure. */
  const calme = coefIdle();
  const couve = force('couveuse') * (1 + b.couvee + cl.couvee + bp.couvee) * ardeur * calme;
  const eleve = force('eleveur') * ELEVEUR_X * (1 + b.pousse + cl.pousse + bp.pousse) * ardeur * calme;
  if (couve) {
    for (const slot of state.incub) {
      if (!slot) continue;
      const dure = hatchTime(slot);
      if (slot.p < dure) slot.p = Math.min(dure, slot.p + dt * couve);
    }
  }
  /* L'éleveur pousse jusqu'à la maturité et s'arrête là : le niveau se bloque au bout de la
     tranche tant que le péage n'est pas payé. C'est ce blocage qui interdit à la mangeoire,
     six fois plus rapide, de servir de raccourci vers l'âge suivant. */
  if (eleve) {
    for (const c of state.pen) {
      if (enPension(c)) continue;
      const fin = bandTo(c);
      if (c.p < fin) c.p = Math.min(fin, c.p + dt * eleve * growRate(c));
    }
  }
  /* La rente ne s'achète pas, elle se mérite en gardant : elle tombe donc ici, avec ce que
     le temps fait tout seul, et non parmi les automates. Elle tombe aussi pendant une
     absence — une bête qu'on garde travaille, présent ou pas. */
  const rente = renteTotale();
  if (rente) { state.coins += rente * dt; state.stats.gagne += rente * dt; }
  /* La pension avance ICI et non dans la boucle : elle tourne aussi pendant une absence. Une
     couvaison est une attente, pas un geste — c'est la différence avec le bonheur. */
  avancePension(dt * calme);
  /* La frénésie s'écoule ICI et non dans tickJoie : advance tourne aussi pendant un
     rattrapage, si bien qu'une frénésie en cours au moment où l'on ferme la page a bien
     brûlé ses trente secondes quand on revient. Trente secondes de clic double ne doivent
     pas attendre six heures dans un tiroir. */
  if (state.frenesie) state.frenesie = Math.max(0, state.frenesie - dt);
  // un palier de fortune franchi pendant une absence est franchi quand même
  crediterJetons();
}

function runAutomations(dt) {
  /* L'évolution automatique passe avant la vente : une bête qu'on peut faire monter ne doit
     pas partir au prix de son âge actuel. Elle ne monte que d'un âge par passage — la
     tranche suivante est plus longue que ce que la bête a avalé, donc elle n'est jamais
     mûre juste après.

     Mais elle s'arrête à l'âge où le marchand doit prendre le relais. Sans ce frein, régler
     « vendre les communes à l'âge adulte » ne servait à rien : l'évolution les poussait
     jusqu'à la légende avant que le vendeur n'ait son mot à dire, et la consigne de vente était
     muette. C'est le vendeur qui commande le plafond, rareté par rareté. */
  if (prime('evolution') && evolueQuelqueChose()) {
    for (const c of state.pen) {
      if (c.keep || enPension(c) || !estMur(c) || c.age >= plafondEvolution(c)) continue;
      const cost = evoCost(c);
      if (state.coins < cost) continue;
      state.coins -= cost;
      bilanAuto.depense += cost;
      c.age++;
      state.stats.evolutions++;
      bilanAuto.evolues++;
      markSeen(c.line, c.age);
    }
  }
  /* Le marchand attend l'âge réglé pour SA rareté, sur une bête mûre. La taille minimale
     n'est qu'un supplément, et le réglage ne s'affiche même pas tant qu'aucune mangeoire
     n'existe : sans automate qui engraisse, la notion n'a pas à encombrer l'écran. */
  if (prime('marchand')) {
    /* LA CONSIGNE NE FAIT AUCUNE EXCEPTION, pas même pour la bête en scène. Une automatisation
       qu'on configure doit faire exactement ce qu'on a réglé : si elle épargne la case qu'on
       regarde, le compte ne tombe jamais juste et le joueur ne peut plus prévoir sa ferme.

       Deux exceptions ont été essayées et retirées. Une immunité à vie pour la bête en scène,
       qui laissait celle qu'on venait d'évoluer à la main invendue pour toujours — symptôme
       visible : « le marchand ne vend pas ». Puis une protection tant que l'onglet est
       visible, qui ramenait le même défaut dès qu'on laissait la page ouverte.

       IL EN EXISTE UNE DEPUIS LA 2.5.0, et elle tient précisément parce qu'elle EXPIRE :
       trois secondes de sursis sur la bête qu'on vient de désigner. Le défaut commun aux deux
       exceptions retirées était l'immunité PERMANENTE ; un sursis qui s'éteint tout seul ne
       peut laisser aucune bête invendue. Voir `protegee`.

       ☆ Garder reste la seule protection DURABLE, et c'est le bon endroit : elle est
       explicite, elle se voit sur la vignette, et c'est le joueur qui la pose. */
    const ready = state.pen.filter(c => !c.keep && !enPension(c) && !protegee(c) &&
                                        estMur(c) && venteAu(c) > 0 && c.age >= venteAu(c) &&
                                        rankOf(sizeFactor(c)).i >= tailleExigee(c));
    /* Le marchand ne déplace pas le regard, exactement comme une vente à la main : si on
       était sur la case 2, on reste sur la case 2 et c'est la voisine qui glisse dedans.
       La case se relève AVANT le retrait — après, la bête n'est plus dans la bande et son
       rang est perdu. Sans ça, `current` retombait sur `fallback`, qui saute à la bête la
       plus avancée : on traversait l'enclos à chaque vente automatique.

       Pendant un rattrapage, on n'y touche pas : la sélection se résout une fois à la fin,
       et tenirLaCase reconstruit la bande à chaque appel — vingt mille fois pour rien. */
    const place = rattrapage || !ready.some(c => 'c:' + c.id === state.sel)
                ? -1 : caseCourante();
    for (const c of ready) {
      const gain = sellValue(c);
      compterVente(gain);
      state.coins += gain;
      bilanAuto.vendus++;
      bilanAuto.gagne += gain;
      state.pen = state.pen.filter(x => x.id !== c.id);
    }
    if (place >= 0) tenirLaCase(place);
  }
  // La mangeoire prend le relais de l'éleveur : elle n'engraisse que les bêtes mûres,
  // gratuitement et sans jamais s'arrêter. Ce qu'elle coûte, c'est la place d'enclos.
  if (lvl('mangeoire')) {
    const debit = dt * FATTEN_X * force('mangeoire')
                * (1 + bonusAlbum().gras + bonusPrimes().gras) * coef('vitesse') * coefIdle();
    for (const c of state.pen) {
      if (estMur(c) && !enPension(c)) c.over = (c.over || 0) + debit * temperOf(c).fat;
    }
  }
  /* LA RÉSERVE SE VIDE TOUTE SEULE, ET C'EST GRATUIT. Un œuf en réserve est déjà payé :
     le laisser dormir pendant qu'un incubateur tourne à vide n'est pas une décision, c'est
     un clic à répétition. L'achat par lots l'avait rendu franc — dix œufs pris d'un coup se
     replaçaient un par un, et « max » rendait le confort qu'il promettait plus pénible que
     l'achat à l'unité.

     La plus rare d'abord : un œuf cher acheté exprès ne doit pas attendre derrière du commun. */
  /* ELLE NE RECOPIE PLUS `placeEgg`, elle appelle la règle que les deux partagent. Le `break`
     dit « la réserve ne désigne plus rien » : `totalEggs` peut compter une sorte que
     `bestStocked` ne sait pas servir, et c'est exactement le cas qui fabriquait des œufs
     fantômes avant la `4.11.4`. */
  for (let i = 0; i < state.incub.length && totalEggs(); i++) {
    if (state.incub[i]) continue;
    if (!poserOeuf(i, bestStocked())) break;
  }

  /* L'acheteur prend le relais quand la réserve est sèche. C'est la seule moitié qui se paie,
     et c'est la bonne : DÉPENSER à ta place est une décision, poser un œuf déjà acheté n'en
     est pas une. */
  /* L'ACHETEUR SE COUPE. C'est le seul des trois automates qui DÉPENSE, et le seul qui n'avait
     pas de « jamais » : le marchand et l'évolution en ont un par rareté depuis toujours.

     Ça ne manquait pas tant que la boutique était la seule source d'œufs. Depuis que la pension
     en produit, l'acheteur devient une fuite — il rachète ce qu'on fabrique déjà, au prix fort,
     pendant qu'on regarde ailleurs. Et une prime ne se revend pas : sans interrupteur, l'avoir
     achetée devenait irréversible. */
  if (prime('acheteur') && EN_VENTE[state.buyKind]) {
    const voulu = EN_VENTE[state.buyKind];
    for (let i = 0; i < state.incub.length; i++) {
      if (state.incub[i]) continue;
      const prix = prixOeuf(voulu);
      if (state.coins < prix) break;   // incubateur vide plutôt que consigne bradée
      state.coins -= prix;
      bilanAuto.depense += prix;
      // acheté, donc tiré — et donc éligible à un fond
      state.incub[i] = { line: rollLine(voulu.key), p: 0, kind: voulu.key, pension: false };
    }
  }
}

/* Appelé PAR LA BOUCLE SEULE, jamais par le rattrapage : une absence ne fabrique ni bonheur
   ni cadeaux — vingt frénésies gagnées pendant la nuit expireraient toutes avant qu'on ait
   posé un doigt sur l'écran, et elle est heureuse parce que tu es là, pas parce que le temps
   passe. Le compte à rebours d'une frénésie déjà en cours, lui, tombe dans advance : il
   s'écoule pendant l'absence comme tout le reste. */
/* L'AUTO-CLIC DE LA CARTE OCELLÉE. Appelé par la boucle seule, comme le bonheur : un clic
   vaut « une seconde de ce que tes automates produisent », si bien qu'une nuit d'absence à un
   clic par seconde injecterait vingt-huit mille fois ce débit d'un coup. Ce n'est pas un
   automate de plus, c'est une main qui reste — et une main ne travaille pas quand on dort.

   Le reste s'accumule entre deux tours : à un clic par seconde et dix tours par seconde, on
   ne peut pas cliquer à chaque tour, et arrondir ferait rendre zéro ou dix fois trop. */
let ocelleReste = 0, mainDeCarte = false;
function tickOcelle(dt) {
  const par = bonusAlbum().clicAuto + bonusCiel().clicAuto;
  if (!par) { ocelleReste = 0; return; }
  ocelleReste += par * dt;
  let garde = 0;
  /* Le drapeau plutôt qu'un paramètre : `tapStage` est branché directement sur l'écouteur
     de clic, qui lui passerait l'événement en premier argument — donc toujours vrai. */
  mainDeCarte = true;
  try { while (ocelleReste >= 1 && garde++ < 200) { ocelleReste--; tapStage(); } }
  finally { mainDeCarte = false; }
}

function tickJoie(dt) {
  const s = current();
  if (!s || s.kind !== 'creature') return;
  const c = s.c;
  const avant = Math.floor((c.bonheur || 0) / JOIE_PALIER);
  c.bonheur = (c.bonheur || 0) + dt * (prime('soin') ? 2 : 1);
  // en ×100 on peut franchir plusieurs paliers d'un coup : chacun a droit à son tirage
  for (let n = avant + 1; n <= Math.floor(c.bonheur / JOIE_PALIER); n++) {
    if (Math.random() < JOIE_CHANCE) offrirFrenesie(n);
  }
}

function offrirFrenesie(palier) {
  const large = (prime('generosite') ? 2 : 1) * (etoilePrise('ferveur') ? 2 : 1);
  const duree = FRENESIE[Math.min(palier, FRENESIE.length) - 1] * large;
  // les cadeaux s'ajoutent sans jamais dépasser la minute : deux ×2 ne feront pas un ×4
  state.frenesie = Math.min(FRENESIE_MAX * large, (state.frenesie || 0) + duree);
  state.dons = (state.dons || 0) + 1;
  const pt = centerOf($('subject'));
  floatText(pt.x, pt.y - 90, '⚡ cadeau · clic ×2 pendant ' + duree + ' s', 'gain');
  chord([523, 659, 784, 1046], 70);
}

/* ── LA PAUSE ──────────────────────────────────────────────────────────────────
   Un bouton qui arrête la ferme.

   ELLE N'EST PLUS NÉCESSAIRE À LA PENSION, et c'était pourtant sa raison d'être : arranger
   deux parents pendant que le marchand vend et que les bêtes bougent sous la main. Depuis
   qu'une bête confiée QUITTE LA BANDE au moment du dépôt, le geste ne court plus après une
   cible mouvante — et si le marchand attrape la seconde entre le premier dépôt et le second,
   elle disparaît simplement, ce qui se lit.

   Elle reste, parce qu'arrêter sa ferme est utile pour tout le reste : relire un réglage,
   compter ses enclos, regarder une bête sans la voir vieillir.

   ELLE NE SE SAUVEGARDE PAS, et c'est délibéré. Une pause est un moment, pas un réglage :
   fermer l'onglet en pause puis revenir le lendemain sur une ferme gelée serait une partie
   cassée, sans rien pour dire pourquoi. Au rechargement, la ferme tourne.

   Elle ne gèle pas non plus le temps hors ligne : `save` continue de poser `state.t`, donc
   une pause de deux heures ne se rattrape pas au retour. Mettre en pause n'est pas mettre de
   côté — c'est arrêter, et le temps arrêté est perdu. C'est ce qui l'empêche de devenir une
   façon de jouer. */
let enPause = false;

function basculerPause(v) {
  enPause = v === undefined ? !enPause : !!v;
  lastFrame = Date.now();          // le temps de la pause ne se rattrape pas
  const b = $('btn-pause');
  b.setAttribute('aria-pressed', String(enPause));
  b.textContent = enPause ? '▶' : '⏸';
  b.title = enPause ? 'Reprendre la ferme'
                    : 'Arrêter la ferme — rien ne pousse, rien ne se vend, rien ne couve';
  const note = $('pause-note');
  note.hidden = !enPause;
  setText(note, 'La ferme est arrêtée. Rien ne pousse, rien ne se vend, rien ne couve, ' +
                'et le clic ne fait rien non plus.');
  document.body.classList.toggle('en-pause', enPause);
  refresh();
}

/* ── UN ONGLET DERRIÈRE EST UNE ABSENCE ────────────────────────────────────────
   Sans ça, le nerf de l'absence n'aurait porté que sur les joueurs qui FERMENT leur
   navigateur. Un onglet caché continue de recevoir ses minuteries — une par seconde au lieu
   de dix, mais `loop` compte en `Date.now()` et rattrape le retard tout seul — donc la ferme
   tournait à plein régime derrière, sans plafond et sans quart. Laisser l'onglet ouvert serait
   devenu strictement meilleur que de revenir jouer, ce qui est exactement ce qu'on corrige.

   La règle devient donc une : CE QUI COMPTE, C'EST LE TEMPS OÙ L'ÉCRAN EST DEVANT TOI. Le
   reste passe par la même porte que le rechargement, plafond et quart compris. */
let veilleDepuis = 0;

function loop() {
  const now = Date.now();
  if (document.hidden) { veilleDepuis = veilleDepuis || now; lastFrame = now; return; }
  // la ferme s'arrête aussi quand on le demande, et pour les mêmes raisons que l'ascension
  if (enPause) { lastFrame = now; return; }
  /* LA FERME S'ARRÊTE PENDANT L'ÉCRAN D'ASCENSION. On y décide du sort de bêtes précises ;
     les laisser vieillir, évoluer ou se faire vendre sous les yeux du joueur rendrait le
     panneau menteur au moment même où il demande une décision irréversible. On recale
     l'horloge à chaque tour pour qu'aucune dette de temps ne s'accumule derrière. */
  if (!$('ascension').hidden) { lastFrame = now; return; }
  const dt = Math.min(5, (now - lastFrame) / 1000) * state.speed;
  lastFrame = now;
  if (dt <= 0) return;
  advance(dt);
  runAutomations(dt);
  tickCombo();
  tickJoie(dt);
  tickOcelle(dt);
  verifierTrophees();
  state.stats.temps += dt / state.speed;   // du temps vécu, pas du temps simulé
  if (state.coins > state.stats.fortune) state.stats.fortune = state.coins;
  hatchAll();          // hatchAll rafraîchit déjà l'affichage
  renderTuto();        // les seuils se franchissent aussi entre deux redessins
}

/* CE QU'UNE ABSENCE REND, une fois les deux bornes appliquées. Une seule fonction pour les
   deux portes : le rechargement de la page, et le retour sur un onglet qu'on avait laissé
   derrière. Sans ça, le nerf n'aurait porté que sur ceux qui ferment leur navigateur. */
const absenceRejouee = depuis =>
  Math.min(OFFLINE_CAP, (Date.now() - (depuis || Date.now())) / 1000) * OFFLINE_PART;

/* En deçà, la ferme rattrape SANS LE DIRE. Un bandeau « pendant ton absence » pour un
   alt-tab de deux minutes est du bruit, et le joueur apprend à le fermer sans le lire — donc
   à ne pas le lire le jour où il compte. */
const SILENCE_ABSENCE = 5 * 60;

/* `depuis` vaut `state.t` au rechargement, et l'instant où l'onglet est passé derrière quand
   on y revient. Le SEUIL DE TRENTE SECONDES SE LIT SUR LE TEMPS RÉEL et non sur le temps
   rejoué : sinon la borne le déplacerait à deux minutes d'absence sans que personne l'ait
   décidé, et un aller-retour d'une minute serait purement perdu. */
function catchUp(depuis) {
  const origine = depuis || state.t;
  const reel = (Date.now() - (origine || Date.now())) / 1000;
  const elapsed = absenceRejouee(origine);
  lastFrame = Date.now();
  // une première partie ne doit pas s'ouvrir sur « pendant ton absence », et tant que rien
  // n'est automatisé il ne s'est effectivement rien passé pendant l'absence
  if (isNewGame || reel < 30) return;
  // une bête assez grosse pour renter travaille même sans le moindre automate acheté
  if (!state.up.couveuse && !state.up.eleveur && !renteTotale()) return;

  /* Le temps passé se rejoue par PAS, et non d'un bloc. Un seul advance() de huit heures ne
     faisait avancer que la couvaison, la croissance et la rente : runAutomations n'était
     jamais appelé, donc pendant une absence rien n'évoluait, rien ne se vendait, rien ne se
     rachetait et la mangeoire ne servait à rien. On rentrait sur une ferme figée, pleine
     d'adultes que personne n'avait vendus — et sur deux heures d'une ferme entièrement
     automatisée, pas une pièce gagnée.

     Le nombre de pas est borné : une absence d'un jour ne doit pas coûter une seconde de
     calcul au démarrage. Les pas trop larges perdent du débit — Math.min plafonne la
     croissance à sa cible et le surplus est perdu — donc on rend toujours un peu moins que
     ce que la présence aurait donné. C'est le bon sens de l'erreur : jamais de cadeau. */
  const coinsBefore = state.coins;
  bilanAuto.vendus = 0; bilanAuto.gagne = 0; bilanAuto.evolues = 0; bilanAuto.depense = 0;
  let hatched = 0;

  rattrapage = true;
  try {
    const pas = Math.max(1, elapsed / 20000);
    for (let passe = 0; passe < elapsed; passe += pas) {
      const dt = Math.min(pas, elapsed - passe);
      advance(dt);
      runAutomations(dt);
      hatched += hatchAll();
    }
    /* Les seuils franchis pendant l'absence sont marqués LUS EN SILENCE, tant que le drapeau
       de rattrapage est encore levé. Sans cet appel, la branche silencieuse de suivreTuto
       n'était jamais atteinte — catchUp ne passe pas par la boucle de jeu — et le joueur qui
       revient au lendemain enchaînait six bandeaux pour des choses qu'il n'a pas vues arriver. */
    suivreTuto(false);
  } finally {
    // le drapeau coupe le son et le redessin : le laisser levé figerait l'affichage
    rattrapage = false;
  }

  /* Ce que le temps a rapporté sans rien vendre. Il faut retirer les ventes ET remettre ce
     que les automates ont dépensé en évolutions et en œufs, sinon la ligne « tes bêtes gardées
     ont rapporté » annonce en fait la rente moins les frais de la ferme. */
  const rente = state.coins - coinsBefore - bilanAuto.gagne + bilanAuto.depense;

  const bits = [];
  if (hatched) bits.push(hatched + (hatched > 1 ? ' œufs ont éclos' : ' œuf a éclos'));
  if (bilanAuto.evolues) bits.push(bilanAuto.evolues + (bilanAuto.evolues > 1 ? ' évolutions' : ' évolution'));
  if (bilanAuto.vendus) bits.push('ton marchand a vendu ' + bilanAuto.vendus +
    (bilanAuto.vendus > 1 ? ' bêtes pour ' : ' bête pour ') + fmt(bilanAuto.gagne) + ' pièces');
  if (rente >= 1) bits.push('tes bêtes gardées ont rapporté ' + fmt(rente) + ' pièces');
  const note = $('offline-note');
  /* IL SE FERME. Il s'affichait et n'était plus jamais caché — aucun bouton, aucun
     écouteur — donc il restait à l'écran jusqu'au rechargement, à raconter une absence
     vieille de trois heures. La croix est dans le HTML du bandeau et non à côté : le
     contenu est réécrit à chaque retour, et un bouton posé une fois disparaîtrait avec. */
  /* IL DIT CE QUI A ÉTÉ REJOUÉ, ET NON CE QUI S'EST ÉCOULÉ. Annoncer « pendant ton absence
     (8 h) » pour trente minutes de ferme, c'est promettre huit heures de gains et en livrer
     une demi-heure : le joueur ne conclut pas « l'absence est bornée », il conclut que le jeu
     a perdu sa nuit. La borne se dit donc à l'endroit exact où elle se subit. */
  if (reel < SILENCE_ABSENCE) return;
  const plafonne = reel > OFFLINE_CAP;
  note.innerHTML = '<span><b>Pendant ton absence</b> — ta ferme a tourné ' + fmtTime(elapsed) +
    (plafonne ? ' (le maximum)' : '') + ' : ' +
    (bits.length ? bits.join(', ') + '.' : 'rien de neuf, tout tournait déjà.') + '</span>' +
    '<button type="button" class="note-x" title="Fermer">✕</button>';
  note.hidden = false;
}

/* ─────────────────────────────────────────────
   Rendu
   ───────────────────────────────────────────── */

const refs = {};           // éléments de la boutique et des actions, construits une fois
const thumbs = new Map();
let stripSig = '', collSig = '', popNext = false;

/* La scène se redessine dix fois par seconde. Réécrire une propriété avec la même valeur
   n'est pas neutre : sur une propriété animée, chaque écriture relance la transition, qui
   n'atteint donc jamais sa cible — c'est ce qui empêchait la créature de grossir à l'écran.
   Ces trois helpers ne touchent au DOM que si la valeur a réellement changé. */
function setText(el, v) { if (el.textContent !== v) el.textContent = v; }
function setHtml(el, v) { if (el.__html !== v) { el.__html = v; el.innerHTML = v; } }
function setVar(el, name, v) { if (el.__var !== v) { el.__var = v; el.style.setProperty(name, v); } }
function setWidth(el, v) { if (el.__w !== v) { el.__w = v; el.style.width = v; } }
function setFilter(el, v) { if (el.__f !== v) { el.__f = v; el.style.filter = v; } }
function setFont(el, v) { if (el.__fs !== v) { el.__fs = v; el.style.fontSize = v; } }

// La scène porte une seule classe de rareté à la fois — elle teinte le halo et la jauge.
const RAR_CLASSES = ['rar-commune', 'rar-rare', 'rar-epique', 'rar-mythique', 'rar-merveilleuse',
                     'egg-commun', 'egg-rare', 'egg-epique', 'egg-mythique', 'egg-merveille'];
/* Remplit les trois colonnes d'axes, et marque celle que la grande barre est en train de
   remplir — c'est le lien qui manquait le plus : la barre vise le niveau tant que la bête
   grandit, puis la taille une fois qu'elle est mûre, sans que rien ne le dise. */
function peindreAxes(c, mur, rank, niv, dernier, mult) {
  $('stage-axes').hidden = false;

  setText($('axe-age-val'), AGES[c.age - 1].nom);
  // cinq pastilles : on voit d'un coup qu'il y a cinq âges, et lequel est atteint
  setHtml($('axe-age-plus'), AGES.map((a, i) =>
    '<i class="axe-pip' + (i < c.age ? ' on' : '') + '"></i>').join(''));

  /* « 15 / 15 » DIT la maturité : le niveau a touché le plafond de son âge et n'ira pas plus
     loin sans un péage. C'était un mot de plus dans la ligne à points, alors que l'égalité
     des deux nombres le montre déjà. */
  setText($('axe-niv-val'), niv + ' / ' + dernier);
  setText($('axe-niv-plus'), mur ? 'mûre' : '×' + dec(mult / rank.from));
  $('axe-niv').classList.toggle('mur', mur);

  setText($('axe-taille-val'), rank.fem || 'normale');
  setText($('axe-taille-plus'), '×' + dec(rank.from));

  $('axe-niv').classList.toggle('actif', !mur);
  $('axe-taille').classList.toggle('actif', mur);
  setText($('timer-axe'), mur ? 'taille' : 'niveau');
  $('timer-axe').hidden = false;
}

/* La ligne du bonheur. Pendant le mode histoire elle attend qu'il y ait quelque chose à
   voir — un tiers de palier, une trentaine de secondes — pour ne pas arriver dans la même
   seconde que la bête elle-même et les trois colonnes. */
function peindreJoie(c) {
  const j = c.bonheur || 0, n = Math.floor(j / JOIE_PALIER);
  $('stage-joie').hidden = state.tuto && j < JOIE_PALIER / 3 && !(state.dons || 0);
  setWidth($('joie-fill'), ((j % JOIE_PALIER) / JOIE_PALIER * 100).toFixed(1) + '%');
  setText($('joie-n'), n ? n + ' palier' + (n > 1 ? 's' : '') : '');
  $('joie-fren').hidden = !enFrenesie();
  if (enFrenesie()) setText($('joie-fren'), '⚡ ×2 · ' + Math.ceil(state.frenesie) + ' s');
}

// Un œuf n'a ni âge ni taille ni bonheur : tout ce bloc s'efface.
function cacherAxes() {
  $('stage-axes').hidden = true;
  $('timer-axe').hidden = true;
  $('stage-joie').hidden = true;
}

function setStageRarity(stage, cls) {
  if (stage.__rar === cls) return;
  stage.__rar = cls;
  stage.classList.remove.apply(stage.classList, RAR_CLASSES);
  if (cls) stage.classList.add(cls);
}

/* Les menus qui listent des données du jeu sont construits depuis ces données, jamais
   écrits à la main : c'est la seule façon qu'ils ne mentent pas le jour où un prix bouge. */
/* ── LES CONSIGNES DE LA FERME, EN SEGMENTS ────────────────────────────────────
   Seize menus déroulants sont devenus seize rangées de boutons, comme le tri de l'enclos.

   POURQUOI. Un menu CACHE ses options : il faut l'ouvrir pour savoir ce qu'on peut choisir, et
   le refermer pour voir ce qu'on a choisi. Deux gestes, et rien de visible entre les deux. Un
   segment montre les six possibilités et le choix actuel d'un seul coup d'œil — c'est ce qui
   avait fait remplacer le menu de tri par le sien, et l'argument valait pareil ici.

   CE QUE LE MENU PORTAIT ET QUE LE SEGMENT NE PEUT PAS : le prix. « Mûres à l'âge adulte —
   6 000 » ne tient pas sur une pastille. Le chiffre passe donc SOUS le segment, pour le seul
   choix actif : six prix affichés d'un coup n'aidaient personne, celui qu'on vient de choisir
   aide vraiment.

   LA TABLE DÉCIDE DE TOUT, et c'est le second gain. Les libellés par rareté étaient écrits en
   dur dans `index.html`, quinze fois ; ajouter la cinquième rareté avait demandé d'y revenir à
   la main. Un rang de plus ne coûte plus rien. */
const REGLAGES = [
  { cle: 'vente', hote: 'reg-vente', champ: 'sellAt',
    mot: (cle, i) => (i ? 'les ' : 'Il vend les ') + RARITY[cle].plur,
    options: () => [{ v: 0, nom: 'jamais' }]
      .concat(AGES.map((a, i) => ({ v: i + 1, nom: a.nom }))),
    /* « dès l'âge adolescent » se lit comme « dès qu'elle est adolescente », alors que le
       marchand attend qu'elle soit MÛRE de cet âge — sinon il la braderait à 15 % de son prix.
       Le montant affiché est justement celui d'une bête mûre. */
    dit: (cle, v) => !v ? 'Il n’y touche pas : tu les gardes.'
      : 'Mûres à l’âge ' + AGES[v - 1].nom +
        (v < AGES.length ? ' et au-dessus' : ', la forme finale') +
        /* LE PRIX EST CELUI D'AUJOURD'HUI, primes et cartes comprises — c'est le chiffre
           qu'on compare pour décider. Le menu déroulant annonçait la valeur de base et ne
           bougeait jamais ; une consigne qui ment de trente pour cent ne se règle pas. */
        ' — ' + fmt(valeurMure(cle, v) * (1 + bonusAlbum().valeur) *
                     (prime('negoce-' + cle) ? 1.25 : 1) * coef('valeur')) },

  { cle: 'taille', hote: 'reg-taille', champ: 'sellRank',
    mot: (cle, i) => (i ? 'des ' : 'Taille exigée des ') + RARITY[cle].plur,
    options: () => [{ v: 0, nom: 'toutes' }]
      .concat(RANKS.slice(1).map((r, i) => ({ v: i + 1, nom: r.fem }))),
    dit: (cle, v) => !v ? 'N’importe quelle taille fait l’affaire.'
      : RANKS[v].fem[0].toUpperCase() + RANKS[v].fem.slice(1) +
        (v < RANKS.length - 1 ? ' ou plus' : '') + ' — vaut ×' + dec(RANKS[v].at) },

  { cle: 'evolution', hote: 'reg-evolution', champ: 'evolveUpTo',
    mot: (cle, i) => (i ? 'les ' : 'Il fait monter les ') + RARITY[cle].plur,
    // pas de premier âge : on ne fait pas monter une bête JUSQU'À l'âge où elle naît
    options: () => [{ v: 0, nom: 'jamais' }]
      .concat(AGES.slice(1).map((a, i) => ({ v: i + 2, nom: a.nom }))),
    dit: (cle, v) => !v ? 'Il n’y touche pas : c’est toi qui décides.'
      : 'Jusqu’à l’âge ' + AGES[v - 1].nom +
        (v === AGES.length ? ', la forme finale' : '') + ' — ' +
        fmt(peagesJusque(cle, v) *
            evoRemise() * (1 - bonusAlbum().peage) * (1 - bonusPrimes().peage)) },
];

/* Une rangée : son intitulé, son segment, et la phrase du choix actif. Les identifiants
   restent ceux d'avant — `vente-commune` désigne le segment, `vente-commune-d` sa phrase —
   pour que `syncReglages` et le banc s'y retrouvent. */
function batirSegment(hote, id, options, groupe) {
  const ligne = document.createElement('div');
  ligne.className = 'cond-ligne';
  ligne.id = id + '-r';           // la rangée entière, pour la cacher d'un bloc

  const mot = document.createElement('span');
  mot.className = 'cond-mot';
  mot.textContent = groupe;
  ligne.appendChild(mot);

  const seg = document.createElement('div');
  seg.className = 'seg';
  seg.id = id;
  seg.setAttribute('role', 'group');
  seg.setAttribute('aria-label', groupe);
  for (const o of options) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'seg-opt';
    b.dataset.v = String(o.v);
    b.textContent = o.nom;
    seg.appendChild(b);
  }
  ligne.appendChild(seg);

  const dit = document.createElement('p');
  dit.className = 'cond-dit';
  dit.id = id + '-d';
  ligne.appendChild(dit);

  hote.appendChild(ligne);
}

function remplirMenus() {
  for (const r of REGLAGES) {
    const hote = $(r.hote);
    hote.textContent = '';
    Object.keys(RARITY).forEach((cle, i) => {
      batirSegment(hote, r.cle + '-' + cle, r.options(), r.mot(cle, i));
    });
  }

  /* L'ACHETEUR N'A PAS DE RARETÉ : une seule rangée, dont les choix sont les sortes d'œufs
     qu'on peut acheter. « Jamais » en tête, à la place où les deux autres automates ont la
     leur — c'est le seul des trois qui dépense. */
  const ach = $('reg-acheteur');
  ach.textContent = '';
  batirSegment(ach, 'sel-acheteur',
    [{ v: '', nom: 'jamais' }]
      .concat(OEUFS_VENDUS.map(e => ({ v: e.key, nom: e.name.replace('Œuf ', '') }))),
    'Ce qu’il rachète');
}

function buildChrome() {
  remplirMenus();
  // les actions de la scène : construites une fois, montrées selon le sujet
  const host = $('stage-acts');
  host.textContent = '';
  refs.acts = {};
  const defs = [
    { key: 'place', cls: 'grow', run: () => { const s = current(); if (s && s.kind === 'egg') placeEgg(s.i); } },
    { key: 'sell',  cls: 'sell', run: () => { const s = current(); if (s && s.c) sell(s.c); } },
    { key: 'evo',   cls: 'evo',  run: () => { const s = current(); if (s && s.c) evolve(s.c); } },
    { key: 'keep',  cls: 'keep', run: () => { const s = current(); if (s && s.c) toggleKeep(s.c); } },
  ];
  for (const d of defs) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'act ' + d.cls;
    b.addEventListener('click', d.run);
    host.appendChild(b);
    refs.acts[d.key] = b;
  }

  const items = OEUFS_VENDUS.map(e => ({
    key: 'egg-' + e.key, title: e.name, desc: eggDesc(e), rarity: e.key,
    cost: () => prixOeuf(e), run: () => buyEgg(e.key),
  })).concat([
    { key: 'incub', title: 'Incubateur', desc: 'Un œuf de plus en couvaison.',        cost: incubCost, run: buyIncubator },
    { key: 'pen',   title: 'Enclos',     desc: 'Une créature de plus en croissance.', cost: penCost,   run: buyPen },
  ]);
  refs.shop = {};
  const shop = $('shop');
  shop.textContent = '';
  for (const it of items) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'buy';
    /* LA RÉSERVE A SA PROPRE CASE. Elle vivait au bout de la description — « … En réserve :
       3. » — et la description est une ligne QUI SE REPLIE : passer de 2 à 3 œufs pouvait
       faire gagner ou perdre une ligne au bouton, donc décaler tout ce qui est en dessous.
       Le compte change plusieurs fois par minute, si bien que la colonne clignotait toute
       seule. Une case à part, en chiffres tabulaires, ne pousse plus rien. */
    b.innerHTML = '<span class="t"></span><span class="s"></span>' +
                  '<span class="p"></span><span class="d"></span>';
    b.querySelector('.t').textContent = it.title;
    b.querySelector('.d').textContent = it.desc;
    b.addEventListener('click', it.run);
    if (it.rarity) b.classList.add('egg-' + it.rarity);
    li.appendChild(b);
    shop.appendChild(li);
    refs.shop[it.key] = { li, el: b, price: b.querySelector('.p'), desc: b.querySelector('.d'),
                          reserve: b.querySelector('.s'),
                          cost: it.cost, base: it.desc, stock: it.rarity };
  }

  /* Les cases se construisent UNE FOIS, dans l'ordre de la table — qui est celui des prix.
     Seules leur classe et leur disponibilité changent ensuite, ce que tickView repasse. */
  refs.primes = {};
  const grille = $('primes');
  grille.textContent = '';
  for (const p of PRIMES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'prime';
    b.innerHTML = '<span class="prime-glyphe"></span><span class="prime-nom"></span>' +
                  '<span class="prime-prix"></span>';
    b.querySelector('.prime-glyphe').textContent = p.glyphe;
    b.querySelector('.prime-nom').textContent = p.nom;
    b.querySelector('.prime-prix').textContent = fmt(p.prix);
    b.title = p.nom + ' · ' + fmt(p.prix) + '\n\n' + p.dit;
    b.addEventListener('click', () => {
      if (p.choix) { if (!ouvrirCarrefour(p.cle)) blip(300, 0.05, 'sine', 0.03); }
      else buyPrime(p);
    });
    grille.appendChild(b);
    refs.primes[p.cle] = { el: b, prime: p };
  }

  refs.up = {};
  const autos = $('autos');
  autos.textContent = '';
  for (const u of UPGRADES) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'buy';
    /* LA RÉSERVE A SA PROPRE CASE. Elle vivait au bout de la description — « … En réserve :
       3. » — et la description est une ligne QUI SE REPLIE : passer de 2 à 3 œufs pouvait
       faire gagner ou perdre une ligne au bouton, donc décaler tout ce qui est en dessous.
       Le compte change plusieurs fois par minute, si bien que la colonne clignotait toute
       seule. Une case à part, en chiffres tabulaires, ne pousse plus rien. */
    b.innerHTML = '<span class="t"></span><span class="s"></span>' +
                  '<span class="p"></span><span class="d"></span>';
    b.addEventListener('click', () => buyUpgrade(u));
    li.appendChild(b);
    autos.appendChild(li);
    refs.up[u.key] = { li, el: b, title: b.querySelector('.t'),
                       price: b.querySelector('.p'), desc: b.querySelector('.d'), up: u };
  }
}

function renderStrip() {
  // subjects() porte déjà l'ordre de la bande : c'est ce qui garantit que « la case 6 »
  // désigne la même chose ici et dans tenirLaCase.
  const list = subjects();
  /* Seul l'ÂGE entre dans la signature : une vignette ne se reconstruit qu'à l'évolution,
     quatre fois par vie. Le niveau, lui, monte cent fois — le mettre ici ferait redessiner
     la bande sans arrêt. Ce qui bouge à chaque niveau (le numéro, la taille du glyphe, la
     barre) est repeint par tickView, qui ne touche au DOM que si la valeur a changé. */
  /* LA SORTE DE L'ŒUF ENTRE DANS LA SIGNATURE depuis que les cinq coquilles sont dessinées.
     Elle n'y était pas, et ça ne se voyait pas : les cinq sortes partageaient le même emoji.
     Deux œufs de suite de la MÊME LIGNÉE mais de sortes différentes — un commun puis un
     épique de crapaud — laissaient donc la vignette sur le dessin du premier. */
  /* LE RETASSAGE ENTRE DANS LA SIGNATURE, sans quoi il n'aurait jamais lieu : rien d'autre
     ne change au moment où le délai expire, la signature resterait identique et la bande ne
     se repeindrait pas. Le drapeau bascule une fois, l'enclos se remet dans l'ordre, et il
     rebascule à l'image suivante — deux redessins par retassage, et aucun entre-temps. */
  const vivants = list.filter(s => s.kind === 'creature');
  const retasser = casesARetasser(vivants);
  const sig = list.map(s => s.kind === 'egg'
    ? 'i' + s.i + (s.slot ? ':' + s.slot.kind + ':' + s.slot.line : ':-')
    : 'c' + s.c.id + ':' + s.c.age + (s.c.keep ? ':k' : '')).join(',') +
    (retasser ? '|R' : '') +
    /* LE NOMBRE D'ENCLOS ENTRE DANS LA SIGNATURE depuis que la bande en dessine les cases :
       acheter un enclos n'ajoute aucune bête, donc rien d'autre ne changerait, et la case
       neuve n'apparaîtrait qu'à la prochaine éclosion. */
    '|' + state.pens + '|' + state.tri + '|' + state.triOeuf;
  if (sig === stripSig) return;
  stripSig = sig;

  /* La bande se met à jour vignette par vignette, jamais en la vidant. Tout reconstruire
     détruisait le bouton sous le doigt entre l'appui et le relâchement : le navigateur
     n'émet alors aucun « click », et la sélection ne se faisait pas. Sur une ferme de vingt
     enclos, une éclosion, une vente ou une évolution suffit à redessiner la bande — près
     d'un clic sur cinq se perdait, et d'autant plus souvent que la ferme tournait bien. */
  /* Retirer d'abord, replacer ensuite. Dans l'autre sens, vendre la première bête décalait
     toutes les suivantes d'un cran et la bande entière se faisait déplacer ; une vignette
     qui bouge sous le doigt fait retomber le clic sur sa voisine, ce qui est le même défaut
     sous une autre forme. En vidant les places libérées avant de comparer, il ne reste à
     déplacer que ce qui a réellement changé d'ordre — une vignette, pas vingt-huit. */
  const vivantes = new Set(list.map(s => s.key));
  for (const key of [...thumbs.keys()]) {
    if (vivantes.has(key)) continue;
    thumbs.get(key).el.remove();
    thumbs.delete(key);
  }

  peuplerEnclos($('strip-pen'), vivants, retasser);
  peupler($('strip-incub'), list.filter(s => s.kind === 'egg'));
}

// Le segment de tri ne change qu'au clic : pas la peine de le repasser à chaque image.
/* IL NE TOUCHE PAS À LA BOUTIQUE. La boutique est un ESCALIER DE PRIX — c'est écrit plus haut,
   et c'est ce qui lui permet de désigner « la marche suivante ». La réordonner selon une
   préférence de file aurait cassé ce repère pour régler autre chose. Ce tri-là ne parle que de
   l'ordre dans lequel la réserve se vide, et il se lit sur la bande de couvaison, à l'endroit
   même où le résultat se voit. */
function syncTriOeuf() {
  for (const b of $('tri-oeuf').children) {
    b.setAttribute('aria-pressed', String(b.dataset.tri === state.triOeuf));
  }
}

function syncTri() {
  for (const b of $('tri').children) b.setAttribute('aria-pressed', String(b.dataset.tri === state.tri));
}

function syncAchat() {
  for (const b of $('achat').children) {
    b.setAttribute('aria-pressed', String(b.dataset.achat === String(state.achat)));
  }
}

/* ── LES CASES DE L'ENCLOS ─────────────────────────────────────────────────────
   UNE VENTE LAISSE UN TROU À SA PLACE, et ne fait plus glisser tout le reste d'un cran.

   Le défaut se voyait en ×100 : le marchand vide un enclos plus vite qu'on ne vise, et
   entre le moment où l'œil choisit une vignette et celui où le doigt appuie, deux ventes
   ont eu lieu et la bête sous le curseur n'est plus la même. On clique alors sur une bête
   qu'on n'a pas choisie — et sur une ferme qui tourne bien, ça arrive tout le temps.

   La bande cesse donc d'être une LISTE et devient un ENCLOS : autant de cases que d'enclos
   possédés, chacune gardée par sa bête tant qu'elle vit. Une case libérée reste vide et
   attend la prochaine éclosion. Rien ne se déplace jamais tout seul.

   CHANGER LE TRI REDISTRIBUE, et c'est la seule chose qui le fasse : trier est un geste
   explicite, on s'attend à ce que tout bouge. Le reste du temps, l'enclos est stable.

   `subjects()` n'a pas de trous, lui, et c'est voulu : tout le jeu — la sélection, le
   marchand, l'évolution — raisonne sur des bêtes, pas sur des places. Les trous n'existent
   qu'à l'affichage. */
/* LA CASE TIENT UNE SECONDE, PUIS L'ENCLOS SE RETASSE. La 2.5.0 figeait les cases pour de
   bon, et c'était une seconde faute après celle qu'elle corrigeait : le TRI n'était plus
   jamais rétabli. Une bête vendue laissait un trou définitif, la suivante le reprenait, et
   au bout de dix ventes l'enclos ne ressemblait plus à rien de trié.

   Les deux besoins sont réels et se contredisent seulement DANS L'INSTANT : il faut que rien
   ne bouge sous le curseur pendant qu'on vise, et il faut que l'ordre revienne. Une seconde
   sépare les deux — assez pour faire le geste, assez peu pour que l'enclos ne dérive pas.

   Le délai court depuis l'instant où l'affectation CESSE DE SUIVRE LE TRI, pas depuis la
   dernière vente. Sinon un marchand qui vend en continu — c'est le cas en ×100, et c'est
   justement là qu'on s'en plaint — repousserait le retassage indéfiniment. */
const DELAI_CASES = 1000;
let casesPar = new Map(), triCases = null, casesDepuis = 0;
const casesVides = [];

/* Vrai quand il est temps de tout remettre dans l'ordre du tri. Rend `false` tant que le délai
   court : c'est pendant cette fenêtre que la case est figée sous le doigt. */
function casesARetasser(list) {
  if (triCases !== state.tri) return true;
  if (list.every((s, i) => casesPar.get(s.c.id) === i)) { casesDepuis = 0; return false; }
  if (!casesDepuis) { casesDepuis = Date.now(); return false; }
  return Date.now() - casesDepuis >= DELAI_CASES;
}

function casesDe(list, retasser) {
  if (retasser || triCases !== state.tri) {
    casesPar.clear();
    triCases = state.tri;
    casesDepuis = 0;
  }
  const vivants = new Set(list.map(s => s.c.id));
  for (const id of [...casesPar.keys()]) if (!vivants.has(id)) casesPar.delete(id);
  const prises = new Set(casesPar.values());
  for (const s of list) {
    if (casesPar.has(s.c.id)) continue;
    let n = 0;
    while (prises.has(n)) n++;
    prises.add(n);
    casesPar.set(s.c.id, n);
  }
  return casesPar;
}

function peuplerEnclos(host, sujets, retasser) {
  const defilement = host.scrollTop;
  const cases = casesDe(sujets, retasser);
  let n = state.pens || 0;
  for (const v of cases.values()) n = Math.max(n, v + 1);

  const place = new Array(n).fill(null);
  for (const s of sujets) {
    let t = thumbs.get(s.key);
    if (!t) { t = creerVignette(s.key); thumbs.set(s.key, t); }
    peindreVignette(t, s);
    place[cases.get(s.c.id)] = t.el;
  }
  for (let i = 0; i < n; i++) {
    if (!place[i]) {
      if (!casesVides[i]) {
        const v = document.createElement('span');
        v.className = 'thumb thumb-vide';
        casesVides[i] = v;
      }
      place[i] = casesVides[i];
    }
    if (host.children[i] !== place[i]) host.insertBefore(place[i], host.children[i] || null);
  }
  while (host.children.length > n) host.children[host.children.length - 1].remove();
  host.scrollTop = defilement;
}

// Poser les vignettes d'un groupe dans l'ordre voulu, en ne touchant qu'à ce qui a bougé.
function peupler(host, sujets) {
  // Retirer des vignettes déplace la barre de défilement. Sans ce report, la bête qu'on
  // suivait en bas de la bande sautait en haut — au moment précis où on la regardait grandir.
  const defilement = host.scrollTop;
  sujets.forEach((s, i) => {
    let t = thumbs.get(s.key);
    if (!t) {
      t = creerVignette(s.key);
      thumbs.set(s.key, t);
    }
    peindreVignette(t, s);
    if (host.children[i] !== t.el) host.insertBefore(t.el, host.children[i] || null);
  });
  host.scrollTop = defilement;
}

// La coquille d'une vignette, créée une fois et gardée tant que le sujet existe. C'est
// l'élément lui-même qui porte le clic, donc c'est lui qu'il ne faut jamais recréer.
function creerVignette(key) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'thumb';
  /* LA VIGNETTE EST UNE POIGNÉE. C'est elle qu'on attrape pour la déposer dans le nid de la
     pension — la clé du sujet suffit à la retrouver, et le clic continue de sélectionner. Le
     navigateur distingue seul les deux gestes : un glisser demande du mouvement. */
  b.dataset.cle = key;
  b.addEventListener('click', () => select(key));

  const glyph = document.createElement('span');
  glyph.className = 'thumb-glyph';
  const bar = document.createElement('span');
  bar.className = 'thumb-bar';
  const fill = document.createElement('i');
  bar.appendChild(fill);
  const tag = document.createElement('span');
  tag.className = 'thumb-tag';

  b.append(glyph, bar, tag);
  return { el: b, glyph, bar: fill, tag };
}

// Le contenu, lui, se repeint à chaque évolution. Les classes sont remises à plat d'abord :
// une vignette qui a vécu porte celles de son état précédent.
// 'done' et 'aria-current' appartiennent à tickView, qui les repose juste après.
function peindreVignette(t, s) {
  const b = t.el, garder = b.classList.contains('done');
  b.className = 'thumb';
  if (garder) b.classList.add('done');

  // seules les bêtes se confient : un œuf n'a pas d'âge, et la pension en demande deux
  b.draggable = s.kind === 'creature';
  if (s.kind === 'egg') {
    const k = s.slot ? EGG_BY_KEY[s.slot.kind] || EGG_BY_KEY.commun : null;
    /* Par `setCreature` et non par `textContent` : le raccourci écrivait l'emoji par-dessus
       une image sans prévenir le cache de `setCreature`, qui refusait ensuite de reposer
       cette image-là. Une case qui passait de la bête à l'œuf gardait l'œuf pour toujours.
       Le filtre se remet à zéro pour la même raison : une teinte de bête ne doit pas
       repeindre une coquille. */
    t.glyph.style.filter = '';
    setCreature(t.glyph, s.slot ? artOeuf(k.key) : null, s.slot ? k.glyph : '◌');
    if (!s.slot) b.classList.add('empty'); else b.classList.add('egg-' + k.key);
    t.tag.textContent = s.slot ? (k.key === 'commun' ? 'œuf' : k.key) : 'libre';
  } else {
    b.classList.add('rar-' + lineOf(s.c).rarity);
    if (s.c.prodige) b.classList.add('prodige');
    if (s.c.keep) b.classList.add('gardee');
    t.glyph.style.filter = filtreDe(s.c);
    setCreature(t.glyph, artFor(s.c), glyphOf(s.c));
    /* L'ÂGE d'une vignette ne se lit que dans la forme du dessin, ce qui suppose de connaître
       la lignée. Le survol le nomme. Il est posé ici et non dans tickView : l'âge ne change
       que quatre fois dans une vie, alors que la boucle passe dix fois par seconde. */
    b.title = fullName(s.c) + ' — ' + AGES[s.c.age - 1].nom +
              ' · ' + rarityOf(s.c).name.toLowerCase();
    if (s.c.age === AGES.length) b.classList.add('apex');
  }
}

/* Plie ou déplie un panneau de la colonne. La collection n'en fait plus partie depuis qu'elle
   a sa propre vue : ses raretés se filtrent au lieu de se replier. */
function plier(cle) {
  state.plie[cle] = !state.plie[cle];
  refresh();
  save();
}
const estPlie = cle => !!(state.plie && state.plie[cle]);


/* ── L'ENCYCLOPÉDIE : LA LISTE ─────────────────────────────────────────────────
   UNE CARTE PAR LIGNÉE, ET NON PLUS UNE CASE PAR FORME. La grille de cent cinquante cases
   répondait à une seule question — « combien m'en manque-t-il » — et le faisait bien, mais
   elle ne se cliquait pas : cinq cases voisines menaient à la même fiche, et aucune ne portait
   de nom.

   Trente cartes nommées, chacune avec ses cinq pastilles d'âge, répondent aux deux : la texture
   du remplissage se lit toujours d'un coup d'œil, et chaque carte est une destination.

   LES FILTRES REMPLACENT LE PLIAGE. Replier une rareté cachait ce qu'on ne voulait pas voir ;
   un filtre montre ce qu'on cherche, ce qui n'est pas la même chose. « Incomplètes » est celui
   qui sert vraiment — c'est la question qu'on se pose en ouvrant cette page. */
let dexFiltre = 'tout';

const DEX_FILTRES = () => [{ cle: 'tout', nom: 'tout' }, { cle: 'reste', nom: 'incomplètes' }]
  .concat(raretesConnues().map(r => ({ cle: r, nom: RARITY[r].plur })));

const formesVues = cle => AGES.reduce((n, a, i) => n + (state.seen[cle + ':' + (i + 1)] ? 1 : 0), 0);

function renderCollection() {
  const filtres = DEX_FILTRES();
  if (!filtres.some(f => f.cle === dexFiltre)) dexFiltre = 'tout';

  const visibles = LINES.filter(l => rareteConnue(l.rarity))
    .filter(l => dexFiltre === 'tout' ? true
               : dexFiltre === 'reste' ? formesVues(l.key) < AGES.length
               : l.rarity === dexFiltre);

  const sig = seenCount() + '|' + dexFiltre + '|' + raretesConnues().join(',') + '|' + encyLignee;
  if (sig === collSig) return;
  collSig = sig;

  // les chips de filtre, rebâties avec la liste : un rang secret peut en ajouter une
  const bandeau = $('dex-filtres');
  bandeau.textContent = '';
  for (const f of filtres) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dex-filtre' + (f.cle === dexFiltre ? ' actif' : '');
    b.dataset.filtre = f.cle;
    b.setAttribute('aria-pressed', String(f.cle === dexFiltre));
    b.textContent = f.nom;
    bandeau.appendChild(b);
  }

  const host = $('collection');
  host.textContent = '';
  let rarity = null;
  for (const line of visibles) {
    // un intertitre à chaque changement de rareté : c'est la hiérarchie, rendue lisible
    if (line.rarity !== rarity) {
      rarity = line.rarity;
      const h = document.createElement('p');
      h.className = 'coll-head rar-' + rarity;
      /* LE TITRE DIT CE QUI DISTINGUE LA SECTION, pas ce qu'elle a en commun avec la voisine.
         La merveilleuse vaut autant qu'une mythique : afficher « ×15000 » deux fois de suite
         ressemble à un bug, alors que ce qui la sépare tient en trois mots. */
      const achetable = EGG_KINDS.some(e => e.price && e.rarity === rarity);
      h.textContent = RARITY[rarity].name +
        (achetable ? ' · ×' + RARITY[rarity].mult : ' · ne s’achète pas');
      host.appendChild(h);
    }

    const vus = formesVues(line.key);
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.lignee = line.key;
    b.className = 'dex-carte rar-' + line.rarity + (vus ? ' connue' : ' inconnue') +
                  (line.key === encyLignee ? ' choisie' : '') +
                  (vus === AGES.length ? ' pleine' : '');
    b.title = vus ? line.name + ' — ' + vus + ' / ' + AGES.length + ' formes'
                  : 'Jamais rencontrée (' + RARITY[line.rarity].name + ')';

    const g = document.createElement('span');
    g.className = 'dex-glyphe';
    /* LE GLYPHE EST CELUI DE LA DERNIÈRE FORME VUE, et non du premier âge : c'est celle qu'on
       a le plus de mal à obtenir, donc celle dont on se souvient. */
    if (vus) {
      let dernier = 0;
      AGES.forEach((a, i) => { if (state.seen[line.key + ':' + (i + 1)]) dernier = i; });
      setCreature(g, artAt(line.key, dernier + 1), line.forms[dernier][1]);
    } else g.textContent = '·';

    const t = document.createElement('span');
    t.className = 'dex-txt';
    const n = document.createElement('b');
    n.className = 'dex-nom';
    n.textContent = vus ? line.name : '？';
    const pips = document.createElement('i');
    pips.className = 'dex-pips';
    AGES.forEach((a, i) => {
      const p = document.createElement('span');
      p.className = 'dex-pip' + (state.seen[line.key + ':' + (i + 1)] ? ' on' : '');
      pips.appendChild(p);
    });
    t.append(n, pips);
    b.append(g, t);
    host.appendChild(b);
  }

  if (!visibles.length) {
    const v = document.createElement('p');
    v.className = 'ency-vide';
    v.textContent = dexFiltre === 'reste'
      ? 'Tout est complet. Il ne te manque rien.' : 'Rien à montrer ici.';
    host.appendChild(v);
  }

  setText($('coll-meta'), seenCount() + ' / ' + formesVisibles() + ' formes');
}

/* ─────────────────────────────────────────────
   L'album et l'ascension
   ───────────────────────────────────────────── */

/* Ce que coûte la première unité d'un achat — c'est sur ce prix que porte le seuil des 60 %.
   Pour une amélioration, la boucle sous UPGRADES a déjà converti `base` en TIERS de palier :
   c'est donc bien le prix du premier niveau, celui que le joueur verra affiché. */
const prixVoir = cle => cle.startsWith('up:') ? UP_BY_KEY[cle.slice(3)].base
                      : cle === 'incub' ? INCUB_BASE
                      : cle === 'pen' ? PEN_BASE
                      : EGG_BY_KEY[cle.slice(4)].price;

/* Tout ce qui se dévoile, RANGÉ PAR PRIX et non par table. L'ordre décide de « la marche
   suivante », et la table mettait les quatre œufs devant : la marche de la boutique était donc
   l'œuf rare dès les premières pièces — des millions de fois la bourse d'un débutant —
   pendant que l'incubateur à 150 et l'enclos à 400, les vraies marches, ne pouvaient JAMAIS
   être désignés. Deux branches mortes et un repère absurde.

   Trié par prix, l'escalier redevient un escalier : œuf commun, incubateur, enclos, puis les
   raretés. Et le tri se refait tout seul le jour où un prix change. */
const CLES_VOIR = OEUFS_VENDUS.map(e => 'egg-' + e.key)
  .concat(['incub', 'pen'])
  .concat(UPGRADES.map(u => 'up:' + u.key))
  .sort((a, b) => prixVoir(a) - prixVoir(b));

const estDevoile = cle => !state.tuto || !!state.vu['voir:' + cle];

/* Dévoile pour de bon. On ne repasse jamais en arrière : le prix d'un incubateur monte à
   chaque achat, et sans cette mémoire il disparaîtrait juste après avoir été acheté. */
function devoiler(cle) {
  if (state.vu['voir:' + cle]) return false;
  state.vu['voir:' + cle] = true;
  return true;
}

/* Ce qui doit être visible maintenant, calculé depuis les prix en vigueur. Une rareté d'œuf
   s'ouvre aussi à la PREMIÈRE RENCONTRE : on peut tomber sur une rare bien avant d'avoir de
   quoi s'en offrir une, et la boutique ne doit pas faire semblant de l'ignorer. */
function meriteDevoilement(cle) {
  if (state.coins >= prixVoir(cle) * SEUIL_VOIR) return true;
  if (cle.startsWith('up:')) return lvl(cle.slice(3)) > 0;
  if (cle === 'incub') return state.incubators > 1;
  if (cle === 'pen') return state.pens > 1;
  const e = EGG_BY_KEY[cle.slice(4)];
  if (!e) return true;
  if (eggStock(e.key)) return true;
  return LINES.some(l => l.rarity === e.rarity &&
                         AGES.some((a, i) => state.seen[l.key + ':' + (i + 1)]));
}

/* Passe en revue les dévoilements et les notes. Rend la note à afficher, ou null.

   PENDANT UN RATTRAPAGE, ON MARQUE SANS RIEN DIRE : une absence de huit heures franchit cinq
   seuils en quelques secondes, et le joueur qui revient recevrait cinq bandeaux à la file
   pour des choses qu'il n'a pas vues arriver. Seule la dernière note d'un même passage
   s'affiche. */
function suivreTuto(libre) {
  if (!state.tuto) return null;
  for (const cle of CLES_VOIR) if (meriteDevoilement(cle)) devoiler(cle);

  /* PENDANT UN RATTRAPAGE on marque tout sans rien dire : une absence de huit heures franchit
     cinq seuils en quelques secondes, et le joueur qui revient recevrait cinq bandeaux à la
     file pour des choses qu'il n'a pas vues arriver. */
  if (rattrapage) {
    for (const n of NOTES) if (!state.vu[n.cle] && essaiNote(n)) state.vu[n.cle] = true;
    state.dial = null;
    return null;
  }

  /* ON NE CONSOMME RIEN TANT QUE LE BANDEAU EST OCCUPÉ. Le dévoilement, lui, vient de tourner
     — il n'a pas à attendre qu'on ait fini de lire.

     C'est le même piège deux fois : marquer une note lue sans l'avoir montrée l'efface. La
     boucle passe ici dix fois par seconde ; sans ce garde-fou, les notes en attente étaient
     consommées entre deux battements de cils pendant qu'on lisait la précédente. */
  if (!libre) return null;

  /* On n'en rend qu'UNE, la première, et on ne marque que celle-là. Les suivantes attendent
     leur tour. Marquer tout d'un coup pour n'afficher que la dernière les avalait : en vendant
     sa première bête on franchit trois seuils, et deux explications disparaissaient. */
  /* On rend la scène sans la marquer : c'est `replique()` qui la marquera à sa dernière
     phrase. Une scène sortie mais non finie reste donc à rejouer, ce qui est exactement ce
     qu'on veut d'un rechargement au milieu d'un dialogue. Elle ne peut pas ressortir en
     double : `state.dial` la retient tant qu'elle est à l'écran. */
  for (const n of NOTES) {
    if (state.vu[n.cle] || !essaiNote(n)) continue;
    return n;
  }
  return null;
}

// Une note dont la condition plante ne doit ni s'afficher ni bloquer les suivantes.
function essaiNote(n) {
  try { return !!n.test(); } catch (e) { return false; }
}

/* La seule porte de l'ascension. Un jeton en poche, et — pour le tout premier saut — le
   million déjà franchi. Tout ce qui montre ou ouvre l'écran passe par ici. */
/* LA PORTE EST UN DÉBLOCAGE, PLUS UNE MONNAIE. Elle demandait un jeton NON DÉPENSÉ, si bien
   qu'un joueur qui venait de sauter ne pouvait plus jamais sauter avant d'avoir multiplié sa
   fortune par mille. Elle ne demande plus que d'avoir atteint le million une fois dans la
   partie : après quoi l'ascension est toujours possible, et c'est le SOMMET du cycle qui
   décide de ce qu'on emporte. Sauter tôt reste permis, et rend peu. */
const peutAscensionner = () => (state.asc.n || 0) > 0 ||
  (state.asc.paliers || 0) >= RANG_PREMIER;

// Le prochain palier à franchir, null quand l'échelle est épuisée.
const prochainPalier = () => (state.asc.paliers < JETON_PALIERS.length
                              ? JETON_PALIERS[state.asc.paliers] : null);

/* Crédite les paliers que la bourse vient de dépasser. Appelée dans la boucle ET pendant le
   rattrapage d'une absence : un palier franchi pendant qu'on n'était pas là est franchi quand
   même. La boucle `while` traite le cas d'une vente qui saute deux paliers d'un coup. */
function crediterJetons() {
  /* LE SOMMET DU CYCLE VIT ICI, avec l'échelle qu'il sert à lire : c'est la seule fonction qui
     compare déjà la bourse aux paliers, et deux endroits qui la comparent finiraient par
     diverger. Le sommet, et non la bourse du moment — ce qu'on emporte se décide sur ce qu'on
     a SU gagner, pas sur ce qu'il en reste : sans ça, acheter un enclos juste avant de sauter
     coûterait une carte. */
  if (state.coins > (state.asc.sommet || 0)) state.asc.sommet = state.coins;
  let seuil;
  // le compteur d'échelle avance encore : c'est lui qui ouvre l'ascension la première fois
  while ((seuil = prochainPalier()) !== null && state.coins >= seuil) state.asc.paliers++;
}

/* CE QUE LE CYCLE CRÉDITE : un jeton par palier franchi DEPUIS LA DERNIÈRE ASCENSION. Le
   compte se lit sur le sommet du cycle, donc il se refait entièrement à chaque fois — c'est ce
   qui remplace le crédit unique et supprime le mur de la 3.0.0. */
function jetonsDus() {
  let n = 0;
  while (n < JETON_PALIERS.length && (state.asc.sommet || 0) >= JETON_PALIERS[n]) n++;
  // `sommet` : un palier de plus, à chaque cycle et pour toujours — mais jamais sur zéro,
  // sinon un cycle où l'on n'a pas tenu une seule pièce créditerait quand même un jeton
  if (!n) return 0;
  return n + (etoilePrise('sommet') ? 1 : 0) + (etoilePrise('sommet-2') ? 1 : 0);
}

/* CE QU'ON A EN MAIN : ce que le cycle vient de créditer, PLUS ce qui n'a pas été dépensé
   auparavant. Le jeton redevient donc une BOURSE, et non plus une lecture.

   C'est le prix doré et la constellation qui l'exigent : deux éviers qui puisent au même
   endroit ne peuvent pas se partager un nombre calculé — il faut un solde. Sauter en
   n'emportant qu'une carte laisse les autres jetons pour la constellation, et c'est
   exactement l'arbitrage qu'on cherchait à créer. */
const jetonsEnMain = () =>
  Math.max(0, (state.asc.jetons || 0) + jetonsDus() - (state.asc.depense || 0));



/* La bête telle qu'elle était, figée. `capsuleBrute` ne consomme pas d'identifiant : l'écran
   d'ascension en fabrique une par bête pour montrer ce que le saut donnera, et ces
   aperçus-là sont jetés si le joueur referme sans valider. */
function capsuleBrute(c) {
  return { line: c.line, age: c.age, niv: niveau(c), motif: c.motif, chroma: c.chroma,
           temper: c.temper, rank: rankOf(sizeFactor(c)).i, prodige: !!c.prodige,
           fond: c.fond || null, iv: (c.iv || rollIV()).slice(), etoiles: 1 };
}

/* PEINDRE UN FOND. Le décor est une classe et des particules : le dégradé vit dans la feuille
   de style, les particules sont des `span` vides que le CSS anime. Chacune reçoit sa position
   et son retard — sans quoi les neuf braises monteraient ensemble, ce qui n'est pas une
   braise mais un rideau.

   RIEN N'EST ALLÉ DANS UN CANVAS, et c'est un choix : cinq cartes équipées plus la scène font
   six surfaces animées à la fois, et six contextes 2D redessinés en boucle coûteraient plus
   que tout le reste du jeu réuni. Une dizaine de `span` en `transform` ne coûte rien, et
   `prefers-reduced-motion` les fige d'une seule règle.

   L'ALÉATOIRE EST TIRÉ DE LA BÊTE, pas de `Math.random` : deux redessins de la même carte
   doivent rendre le même décor, sinon les particules sautent à chaque rafraîchissement. */
function peindreFond(hote, c) {
  const f = fondDe(c);
  hote.className = hote.className.split(' ').filter(x => !x.startsWith('fond-')).join(' ');
  hote.textContent = '';
  if (!f) { hote.hidden = true; return; }
  hote.hidden = false;
  /* `fond` PORTE LE DÉCOR, `fond-<clé>` ses couleurs, `fond-<sens>` la direction. On repose la
     première à chaque fois plutôt que de compter sur le HTML : la carte, elle, est créée en JS
     et ne l'a jamais eue. */
  hote.classList.add('fond', 'fond-' + f.key, 'fond-' + f.sens);
  // un générateur simple et stable, semé par l'identifiant de la bête
  let g = (c.id || 1) * 2654435761 % 4294967296;
  const suivant = () => ((g = (g * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = 0; i < f.n; i++) {
    const p = document.createElement('span');
    p.className = 'fond-p';
    p.style.setProperty('--x', (suivant() * 100).toFixed(1) + '%');
    p.style.setProperty('--d', (-suivant() * 9).toFixed(2) + 's');
    p.style.setProperty('--t', (5 + suivant() * 7).toFixed(2) + 's');
    p.style.setProperty('--s', (0.6 + suivant() * 0.9).toFixed(2));
    hote.appendChild(p);
  }
}

const nomCarte = k => form(k.line, k.age)[0];

// Ce qu'une carte annonce en une ligne. Un pourcentage qu'on ne relie pas à un motif ne se
// chasse pas : le motif vient donc en premier, et l'effet derrière.
function effetCarte(k) {
  const m = motifBonus(k), v = Math.min(m.cap, m.pas * puissanceDe(k));
  // les deux effets qui ne sont pas des pourcentages s'annoncent dans leur propre unité
  const montant = m.unite ? '+' + dec(v, m.dec || 1) + m.unite
                          : (m.signe < 0 ? '−' : '+') + Math.round(v * 100) + ' %';
  return MOTIFS[k.motif] + ' · ' + m.quoi + ' ' + montant;
}

/* ── UNE CARTE RESSEMBLE À UNE CARTE ──────────────────────────────────────────
   C'était une LIGNE : vignette à gauche, deux lignes de texte à droite, bordure teintée. Ça se
   lisait, ça se triait, ça se glissait — et ça n'avait rien d'une carte. Le mot est employé
   partout dans le jeu, y compris par les mécaniques qui en dépendent — les étoiles, la
   poussière, la fusion — et l'objet ne le tenait pas.

   QUATRE CHOSES FONT UNE CARTE, et aucune n'était là :

   • UN CADRE. Un rapport hauteur/largeur assumé, trois quarts, et non une bande qui s'étire.
     C'est lui qui fait qu'on reconnaît l'objet avant de lire quoi que ce soit.
   • UNE ZONE D'ILLUSTRATION, séparée du texte par une règle. La bête y est grande — trois
     rem, contre une et demie — parce qu'une carte se regarde d'abord.
   • UNE SIGNATURE DE RARETÉ QUI SE VOIT DE LOIN : un bandeau coloré en haut, un halo derrière
     la bête, et le mot en bas. Trois redondances plutôt qu'une, parce que cinq cartes côte à
     côte se distinguent au coup d'œil ou pas du tout.
   • UNE PLACE POUR LE FOND. `.carte-fond` est vide aujourd'hui et couvre exactement la zone
     d'illustration : c'est là que les particules viendront, DERRIÈRE la bête et au-dessus de
     rien d'autre. Le texte vit en dehors, donc rien de ce qui bougera ne peut le rendre
     illisible — c'est la contrainte qui a dessiné ce découpage, et non l'inverse. */
/* `actes` : la forge montre des cartes qu'on ne peut ni fondre ni déplacer — celles qui vont
   entrer, et celle qui va sortir et n'existe pas encore. Des boutons y seraient des mensonges
   cliquables. */
function carteEl(k, actes) {
  const rarete = LINE_BY_KEY[k.line].rarity;
  const el = document.createElement('div');
  el.className = 'carte rar-' + rarete;
  el.dataset.id = k.id;
  el.innerHTML =
    '<span class="carte-bande"></span>' +
    '<span class="carte-haut">' +
      '<span class="carte-fond"></span>' +
      '<span class="carte-bete"></span>' +
      '<i class="carte-etoiles"></i>' +
    '</span>' +
    '<span class="carte-bas">' +
      '<b class="carte-nom"></b>' +
      '<i class="carte-eff"></i>' +
      '<i class="carte-rar"></i>' +
    '</span>' +
    (actes === false ? '' :
    '<span class="carte-actes">' +
      '<button type="button" class="carte-acte fondre"></button>' +
    '</span>');

  peindreFond(el.querySelector('.carte-fond'), k);
  if (fondDe(k)) el.classList.add('a-fond');

  const bete = el.querySelector('.carte-bete');
  setCreature(bete, artAt(k.line, k.age), form(k.line, k.age)[1]);
  bete.style.filter = filtreDe(k);

  el.querySelector('.carte-nom').textContent = nomCarte(k);
  el.querySelector('.carte-eff').textContent = effetCarte(k);
  el.querySelector('.carte-rar').textContent = RARITY[rarete].name;
  /* L'INFOBULLE DIT CE QUE L'EFFET FAIT, en mots. « rente +140 % » n'apprend rien à qui
     ignore ce qu'est une rente, et c'était le cas de la moitié de la table. */
  el.title = nomCarte(k) + ' — niveau ' + k.niv + ', ' + nomAge(k.age, k.rank) +
             ' · puissance ' + dec(puissanceDe(k), 2) + '\n\n' + motifBonus(k).dit;

  const e = k.etoiles || 1;
  el.querySelector('.carte-etoiles').textContent = '★'.repeat(e) + '☆'.repeat(ETOILES.length - e);

  /* IL NE RESTE QU'UN GESTE SUR LA CARTE. « Fusionner » y était un bouton qui montait une
     étoile contre de la monnaie, sans rien consommer ; la vraie fusion demande trois cartes et
     ne peut donc pas tenir sur une seule — elle a son atelier. Fondre reste ici, parce que
     fondre est bien une décision qui ne regarde qu'une carte. */
  if (actes !== false) {
    const fondre = el.querySelector('.fondre');
    const equipee = state.slots.indexOf(k.id) !== -1;
    fondre.textContent = '✧ ' + fmt(poussiereDe(k));
    fondre.disabled = equipee;
    fondre.title = equipee ? 'Retire-la de tes cartes actives avant de la fondre.'
                           : 'Fondre : + ' + fmt(poussiereDe(k)) + ' de poussière. Sans retour.';
  }
  return el;
}

/* L'ATELIER, EN PLEINE PAGE. Un groupe par mariage possible : ce qui entre à gauche, ce qui
   sort à droite, le prix sur le bouton. Le résultat se voit AVANT d'être fabriqué — c'est la
   seule façon de rendre « la moyenne des trois » lisible sans l'expliquer, et sans ça un
   joueur qui perd une belle teinte dans une fusion ne comprendrait qu'après coup.

   Signature, comme partout : l'écran se rebâtit quand l'album, les emplacements ou la
   poussière changent, et pas dix fois par seconde. Un bouton détruit entre l'appui et le
   relâchement n'émet aucun « click » — la bande et le nid l'ont appris avant lui. */
/* ── L'ARBRE, DEPUIS LE CENTRE ─────────────────────────────────────────────────
   Six directions, et le premier nœud au milieu. Un arbre qui monte a un sens de lecture ; une
   constellation n'en a pas, et c'est ce qui la rend consultable — on part du centre vers ce
   qu'on vise, pas du bas vers le haut.

   LE PARENT SE VOIT SUR LE TRAIT. Un nœud s'ouvre avec le sien, donc la ligne qui les relie
   dit la règle : plus besoin d'écrire « demande le rang 8 », ni de le compter.

   IL EST PLUS GRAND QUE L'ÉCRAN, EXPRÈS. On le tire pour s'y déplacer, comme une carte. Un
   arbre qu'on voit entier d'un coup n'a pas de profondeur, et ce qu'on vise à trente jetons
   doit être loin.

   LE CIEL EST SEMÉ, ET LE SEMIS EST STABLE : les étoiles de fond viennent d'un générateur
   graine, pas de `Math.random`. Sinon elles sauteraient à chaque redessin, et un fond qui
   scintille sans raison est un fond qui fatigue. */
const CIEL_VUE = { l: 1700, h: 1700, r: 22, rayon: [175, 320, 470, 630, 790] };
const cieuxXY = n => {
  if (!n.axe) return { x: CIEL_VUE.l / 2, y: CIEL_VUE.h / 2 };
  const axe = AXES.find(a => a.cle === n.axe);
  const i = PAR_AXE[n.axe].indexOf(n);
  // un léger balancement : trois nœuds parfaitement alignés font une règle, pas une branche
  const ang = (axe.angle + (i % 2 ? 6 : -6)) * Math.PI / 180;
  const r = CIEL_VUE.rayon[Math.min(i, CIEL_VUE.rayon.length - 1)];
  return { x: CIEL_VUE.l / 2 + Math.cos(ang) * r, y: CIEL_VUE.h / 2 + Math.sin(ang) * r };
};
const SVG_NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs) => {
  const n = document.createElementNS(SVG_NS, tag);
  for (const k of Object.keys(attrs || {})) n.setAttribute(k, attrs[k]);
  return n;
};

let cielSig = '';
function renderCiel() {
  const jetons = jetonsEnMain();
  const sig = Object.keys(state.ciel || {}).sort().join(',') + '|' + jetons;
  if (sig === cielSig) return;
  cielSig = sig;

  setText($('ciel-jetons'), '✦ ' + fmt(jetons) + (jetons > 1 ? ' jetons' : ' jeton'));

  /* LE BOUTON N'EXISTE QUE S'IL Y A QUELQUE CHOSE À DÉFAIRE. Un « tout reprendre » sur un ciel
     vide est un bouton qui ment sur ce qu'il fait. */
  const pris = prixDuCiel();
  const bout = $('ciel-reprendre');
  bout.hidden = !pris;
  if (pris) setText(bout, 'Tout reprendre · ✦ ' + fmt(pris));

  const hote = $('ciel-arbre');
  hote.textContent = '';
  const svg = svgEl('svg', {
    class: 'ciel-svg', viewBox: '0 0 ' + CIEL_VUE.l + ' ' + CIEL_VUE.h,
    preserveAspectRatio: 'xMidYMid meet',
  });

  // le semis, semé une fois pour toutes
  let g = 20250903;
  const suivant = () => ((g = (g * 1103515245 + 12345) % 2147483648) / 2147483648);
  const fond = svgEl('g', { class: 'ciel-semis' });
  for (let i = 0; i < 220; i++) {
    fond.appendChild(svgEl('circle', {
      cx: (suivant() * CIEL_VUE.l).toFixed(1), cy: (suivant() * CIEL_VUE.h).toFixed(1),
      r: (0.7 + suivant() * 1.8).toFixed(2), opacity: (0.15 + suivant() * 0.5).toFixed(2),
    }));
  }
  svg.appendChild(fond);

  const xy = {};
  for (const n of CIEL) xy[n.cle] = cieuxXY(n);

  // les liens d'abord : un trait ne passe jamais par-dessus un cercle
  for (const n of CIEL) {
    if (!n.parent) continue;
    const a = xy[n.parent], b = xy[n.cle];
    svg.appendChild(svgEl('path', {
      class: 'lien ' + (n.axe || 'centre') + (etoilePrise(n.cle) ? ' pris' : ''),
      d: 'M ' + a.x + ' ' + a.y + ' L ' + b.x + ' ' + b.y,
    }));
  }

  const etat = n => etoilePrise(n.cle) ? 'prise'
               : !etoileOuverte(n) ? 'close'
               : jetons < n.prix ? 'chere' : 'ouverte';

  for (const n of CIEL) {
    const p = xy[n.cle];
    const cl = 'etoile ' + (n.axe || 'centre') + ' ' + etat(n);
    const g2 = svgEl('g', { class: cl, 'data-etoile': n.cle, tabindex: '0', role: 'button' });
    g2.dataset.etoile = n.cle;
    g2.appendChild(svgEl('circle', { class: 'etoile-rond', cx: p.x, cy: p.y, r: CIEL_VUE.r }));
    const ic = svgEl('text', { class: 'etoile-icone', x: p.x, y: p.y + 7, 'text-anchor': 'middle' });
    ic.textContent = n.glyphe || '';
    g2.appendChild(ic);
    /* LE NOM SE LIT SANS SURVOL : un arbre dont il faut survoler chaque nœud pour savoir ce
       qu'il fait n'est pas une carte qu'on lit, c'est une devinette. */
    const nom = svgEl('text', { class: 'etoile-nom', x: p.x, y: p.y + CIEL_VUE.r + 20, 'text-anchor': 'middle' });
    nom.textContent = n.nom;
    const prix = svgEl('text', { class: 'etoile-prix', x: p.x, y: p.y + CIEL_VUE.r + 36, 'text-anchor': 'middle' });
    prix.textContent = etoilePrise(n.cle) ? 'acquis' : '✦ ' + n.prix;
    const t = svgEl('title');
    t.textContent = etoilePrise(n.cle) ? n.nom + ' — acquis pour toujours.'
      : !etoileOuverte(n) ? n.nom + ' — demande « ' + (ETOILE_BY_KEY[n.parent] || {}).nom + ' ».'
      : n.nom + ' — ✦ ' + n.prix + '. ' + (n.dit || '');
    g2.appendChild(t);
    svg.appendChild(nom);
    svg.appendChild(prix);
    svg.appendChild(g2);
  }

  // le nom d'un axe et son compte, au bout de sa direction
  for (const a of AXES) {
    const liste = PAR_AXE[a.cle];
    if (!liste.length) continue;
    const p = xy[liste[liste.length - 1].cle];
    const ang = a.angle * Math.PI / 180;
    const t = svgEl('text', {
      class: 'branche-nom ' + a.cle, 'text-anchor': 'middle',
      x: CIEL_VUE.l / 2 + Math.cos(ang) * (CIEL_VUE.rayon[liste.length - 1] + 105),
      y: CIEL_VUE.h / 2 + Math.sin(ang) * (CIEL_VUE.rayon[liste.length - 1] + 105),
    });
    t.textContent = a.nom.split(' · ')[0].toUpperCase() + '  ' +
                    liste.filter(n => etoilePrise(n.cle)).length + ' / ' + liste.length;
    svg.appendChild(t);
  }

  hote.appendChild(svg);
  cielCadrer();
}

/* LE DÉPLACEMENT. Le canevas est plus grand que l'écran, donc on le tire — et le glisser ne
   doit pas déclencher un achat : on ne compte un clic que si la main n'a presque pas bougé.
   Trois pixels de tolérance, ce qui laisse passer un doigt qui tremble et arrête un geste. */
let cielVue = { x: 0, y: 0 }, cielTire = null, cielGlisse = false;
const CIEL_LIMITE = CIEL_VUE.l / 2;
const borne = (v, max) => Math.max(-max, Math.min(max, v));

function cielCadrer() {
  const svg = $('ciel-arbre').firstElementChild;
  if (svg) svg.style.transform =
    'translate(' + cielVue.x.toFixed(0) + 'px,' + cielVue.y.toFixed(0) + 'px)';
}

function cielDebutTire(e) {
  /* LE DRAPEAU SE LÈVE ICI, ET NON AU CLIC QUI SUIT. Il ne se baissait qu'en cliquant l'arbre :
     un glisser qui se termine HORS de l'arbre — ce qui arrive tout le temps, le canevas déborde
     — ne produisait aucun clic, le drapeau restait levé, et le prochain vrai clic sur un nœud
     était avalé. On repart de zéro à chaque geste, ce qui est la seule façon de ne rien laisser
     traîner entre deux. */
  cielGlisse = false;
  const p = e.touches ? e.touches[0] : e;
  cielTire = { x: p.clientX, y: p.clientY, ox: cielVue.x, oy: cielVue.y, bouge: 0 };
}
function cielBouge(e) {
  if (!cielTire) return;
  const p = e.touches ? e.touches[0] : e;
  const dx = p.clientX - cielTire.x, dy = p.clientY - cielTire.y;
  cielTire.bouge = Math.max(cielTire.bouge, Math.abs(dx) + Math.abs(dy));
  /* ON NE PEUT PAS PERDRE L'ARBRE. Le glisser n'avait aucune borne : trois mille pixels vers la
     droite et la constellation quittait l'écran, sans rien pour la ramener — une carte qu'on
     peut faire tomber du bureau. La borne vaut la moitié du canevas, ce qui suffit à amener
     n'importe quel nœud au centre de la vue et jamais à le pousser dehors. */
  cielVue.x = borne(cielTire.ox + dx, CIEL_LIMITE);
  cielVue.y = borne(cielTire.oy + dy, CIEL_LIMITE);
  cielCadrer();
  if (e.cancelable) e.preventDefault();
}
function cielFinTire() {
  const bouge = cielTire ? cielTire.bouge : 0;
  cielTire = null;
  return bouge;
}

let forgeSig = '';

/* L'ATELIER, EN DEUX TEMPS. D'abord l'album entier : on choisit LA CARTE À FAIRE MONTER.
   Ensuite la grille ne montre plus que celles qui peuvent la rejoindre — c'est ce qui rend la
   règle de mariage visible sans l'énoncer. On ne lit pas « même lignée, même motif, même rang
   d'étoiles » : on voit quarante cartes devenir deux.

   LE PLAN DE TRAVAIL MONTRE LE RÉSULTAT AVANT DE LE FABRIQUER, et c'est ce qui compte le plus
   ici : une teinte se DILUE dans une fusion. Sans cet aperçu, un joueur qui vient de perdre son
   albâtre ne le comprend qu'après coup, et il n'a aucun moyen de le défaire.

   Signature, comme partout — et elle porte le choix en cours, sinon désigner une carte ne
   repeindrait rien. Un bouton détruit entre l'appui et le relâchement n'émet aucun « click » :
   la bande, le nid et l'album l'ont appris avant elle. */
function renderForge() {
  elaguerForge();
  const sig = state.album.map(k => k.id + ':' + (k.etoiles || 1)).join(',') + '|' +
              state.slots.join(',') + '|' + (state.poussiere || 0) + '|' +
              forgeBase + ':' + forgeAmies.join('.');
  if (sig === forgeSig) return;
  forgeSig = sig;

  setText($('forge-poussiere'), '\u2727 ' + fmt(state.poussiere || 0));

  const base = forgeBase === null ? null : carteDe(forgeBase);
  const trou = (texte, cls) => {
    const t = document.createElement('div');
    t.className = 'carte carte-trou' + (cls ? ' ' + cls : '');
    t.textContent = texte;
    return t;
  };

  // ── le plan de travail ────────────────────────────────────────────────────
  const plan = $('forge-plan');
  plan.textContent = '';
  plan.hidden = !base;
  if (base) {
    const trio = trioForge().map(carteDe);
    const cout = coutFusion(base);
    const pret = trio.length === FUSION_N && (state.poussiere || 0) >= cout;

    const entrees = document.createElement('div');
    entrees.className = 'forge-in';
    for (const k of trio) entrees.appendChild(carteEl(k, false));
    for (let i = trio.length; i < FUSION_N; i++) entrees.appendChild(trou('?'));
    plan.appendChild(entrees);

    const fleche = document.createElement('span');
    fleche.className = 'forge-fleche';
    fleche.textContent = '\u2192';
    plan.appendChild(fleche);

    const sortie = document.createElement('div');
    sortie.className = 'forge-out';
    sortie.appendChild(trio.length === FUSION_N
      ? carteEl(fusionDe(trio), false)
      : trou('\u2605'.repeat((base.etoiles || 1) + 1), 'attente'));
    plan.appendChild(sortie);

    /* PAS « forge-actes » : le nom contenait « forge-acte » en entier, et tout ce qui
       cherche une classe par sous-chaîne attrapait le conteneur avant le bouton. */
    const actes = document.createElement('div');
    actes.className = 'forge-boutons';
    const forger = document.createElement('button');
    forger.type = 'button';
    forger.className = 'forge-acte';
    forger.disabled = !pret;
    forger.textContent = trio.length === FUSION_N
      ? 'Forger  \u00b7  \u2727 ' + fmt(cout)
      : 'Encore ' + (FUSION_N - trio.length) + ' carte' + (FUSION_N - trio.length > 1 ? 's' : '');
    forger.title = trio.length < FUSION_N
      ? 'Choisis ' + (FUSION_N - trio.length) + ' carte(s) de plus dans la grille.'
      : pret ? 'Les trois disparaissent. Il en sort une, d\u2019une \u00e9toile de plus.'
             : 'Il te faut ' + fmt(cout) + ' de poussi\u00e8re. Tu en as ' +
               fmt(state.poussiere || 0) + '.';
    actes.appendChild(forger);

    const annuler = document.createElement('button');
    annuler.type = 'button';
    annuler.className = 'forge-annule';
    annuler.textContent = 'Changer de carte';
    actes.appendChild(annuler);
    plan.appendChild(actes);
  }

  /* LA PHRASE DIT OÙ ON EN EST, et elle change avec l'étape : une consigne qui ne bouge pas
     pendant qu'on agit cesse d'être lue au bout de deux visites. */
  setText($('forge-dit'), !base
    ? 'Choisis la carte \u00e0 faire monter d\u2019une \u00e9toile. Il en faudra trois en tout \u2014 m\u00eame lign\u00e9e, ' +
      'm\u00eame motif, m\u00eame rang d\u2019\u00e9toiles. L\u2019\u00e2ge, lui, n\u2019a pas d\u2019importance : il se moyenne.'
    : 'Voil\u00e0 celles qui peuvent la rejoindre. Ce que les trois valent se moyenne \u2014 \u00e2ge, niveau, ' +
      'teinte, taille \u2014 et la carte de droite montre ce qui sortira.');

  // ── la grille ─────────────────────────────────────────────────────────────
  const grille = $('forge-grille');
  grille.textContent = '';

  /* RANGÉES PAR MARIAGE POSSIBLE et non par arrivée : deux cartes qui peuvent se joindre se
     retrouvent côte à côte, ce qui répond tout seul à « qu'est-ce que je peux forger ? ». Les
     éteintes tombent en fin de grille — elles s'expliquent, elles ne se cherchent pas. */
  const liste = (base ? compagnes(base) : state.album.slice()).sort((a, b) =>
    (forgeable(b) - forgeable(a)) ||
    (cleForge(a) < cleForge(b) ? -1 : cleForge(a) > cleForge(b) ? 1 : 0) ||
    (puissanceDe(b) - puissanceDe(a)));

  if (!liste.length) {
    const vide = document.createElement('p');
    vide.className = 'forge-vide';
    vide.textContent = base
      ? 'Aucune autre carte ne peut la rejoindre. Il en faut deux de plus, m\u00eame lign\u00e9e et m\u00eame ' +
        'motif \u2014 garde les doublons que l\u2019ascension te donne au lieu de les fondre.'
      : 'Ton album est vide. Les cartes viennent de l\u2019ascension.';
    grille.appendChild(vide);
    return;
  }

  for (const k of liste) {
    const el = carteEl(k, false);
    const hs = !forgeable(k);
    if (hs) { el.classList.add('forge-hs'); el.title = refusForge(k); }
    if (forgeAmies.indexOf(k.id) !== -1) el.classList.add('choisie');
    grille.appendChild(el);
  }
}

let albumSig = '';
function renderAlbum() {
  /* Les ÉTOILES entrent dans la signature : sans elles, une fusion ne repeignait rien. Le
     champ s'appelait `palier` et le renommage de la 2.30.2 avait laissé cette ligne derrière —
     elle lisait donc `undefined` pour toutes les cartes. */
  const sig = state.album.map(k => k.id + ':' + (k.etoiles || 1)).join(',') + '|' +
              state.slots.join(',') + '|' + state.asc.n + '|' + (state.poussiere || 0);
  if (sig === albumSig) return;
  albumSig = sig;

  $('panel-album').hidden = !state.album.length && !state.asc.n;
  const host = $('album');
  host.textContent = '';
  $('album-meta').textContent = state.album.length +
    (state.album.length > 1 ? ' cartes' : ' carte') +
    '  ·  ✧ ' + fmt(state.poussiere || 0);

  if (!state.album.length) {
    $('album-intro').textContent = 'Aucune carte pour l’instant. Les bêtes présentes dans ' +
      'ton enclos au moment de l’ascension deviendront des capsules.';
    return;
  }
  $('album-intro').textContent = state.asc.n +
    (state.asc.n > 1 ? ' ascensions' : ' ascension') + '. Seules les cartes équipées agissent ; ' +
    'glisse-les d’un bloc à l’autre pour changer de build. Un clic fait la même chose.';

  const equipees = state.slots.map(carteDe).filter(Boolean);
  const reste = state.album.filter(k => state.slots.indexOf(k.id) === -1);

  /* Deux ZONES distinctes, et non une liste continue : il faut pouvoir déposer une carte dans
     un bloc vide, ce qu'un simple enchaînement de vignettes ne permet pas. */
  const zone = (titre, cartes, cle, actif) => {
    const h = document.createElement('p');
    h.className = 'album-head';
    h.textContent = titre;
    host.appendChild(h);
    const z = document.createElement('div');
    z.className = 'album-zone';
    z.dataset.zone = cle;
    for (const k of cartes) {
      const el = carteEl(k);
      el.draggable = true;
      if (actif) el.classList.add('active');
      z.appendChild(el);
    }
    if (!cartes.length) {
      const vide = document.createElement('p');
      vide.className = 'album-vide';
      vide.textContent = actif ? 'Aucune carte équipée — dépose-en une ici.' : 'Rien en réserve.';
      z.appendChild(vide);
    }
    host.appendChild(z);
  };
  zone('Équipées — ' + equipees.length + ' / ' + SLOTS, equipees, 'slots', true);
  zone('En réserve — gardées d’une ascension à l’autre', reste, 'reserve', false);
}

/* Fondre une carte. REFUSÉE SUR UNE CARTE ÉQUIPÉE : une carte qui s'évapore d'un emplacement
   changerait le build en silence, et le joueur découvrirait la perte à l'effet, pas au geste.
   Il faut la retirer d'abord — un geste de plus, mais délibéré. */
function desintegrer(id) {
  const k = carteDe(id);
  if (!k || state.slots.indexOf(id) !== -1) return false;
  state.poussiere = (state.poussiere || 0) + poussiereDe(k);
  state.stats.fondues = (state.stats.fondues || 0) + 1;
  state.album = state.album.filter(x => x.id !== id);
  oublierAlbum();
  albumSig = '';
  chord([392, 330], 70);
  refresh();
  save();
  return true;
}

/* ── L'ATELIER DE FORGE ────────────────────────────────────────────────────────
   Trois cartes de la même lignée, du même motif et du même rang d'étoiles entrent ; une seule
   en sort, une étoile de plus. Les trois disparaissent — c'est ce que « fusionner » veut dire,
   et ce que le geste ne faisait pas.

   CE QUE LA CARTE HÉRITE. Tout ce qui ne dit que la puissance se MOYENNE : l'âge, le niveau,
   la teinte, le rang. C'est la règle la plus simple qui soit juste dans les deux sens — elle
   ne punit pas de sacrifier une bonne carte, et elle n'efface pas non plus le prix d'en
   sacrifier une mauvaise. Trois primordiaux donnent un primordial ; deux primordiaux et un
   enfant donnent une bête entre les deux, et le joueur l'a vu venir puisque la forge montre
   le résultat avant de le fabriquer.

   LA TEINTE SE MOYENNE COMME LE RESTE, ce qui la DILUE : albâtre plus deux ordinaires ne
   redonne pas albâtre. C'est la seule façon de garder une belle teinte rare — il faut trois
   belles teintes pour en sortir une — et ça fait de la forge une décision au lieu d'un
   automatisme.

   LE CHROMATIQUE ET LE FOND SE DÉCIDENT À LA MAJORITÉ, deux sur trois. Ils ne sont pas des
   nombres : on ne peut pas être aux deux tiers chromatique. La majorité est la seule
   traduction honnête d'une moyenne pour ce qui n'a que deux états, et elle dit la bonne chose
   — un chromatique perdu au milieu de deux ordinaires ne se transmet pas. */
function fusionDe(cartes) {
  const moy = f => cartes.reduce((n, k) => n + f(k), 0) / cartes.length;
  const majorite = f => cartes.filter(f).length * 2 > cartes.length;
  const base = cartes[0];

  const age = Math.max(1, Math.min(AGES.length, Math.round(moy(k => k.age))));
  /* Le niveau se replie DANS SA TRANCHE : la moyenne de trois âges différents tombe volontiers
     hors des bornes de l'âge retenu, et une bête de niveau 12 à l'âge légende n'existe pas. */
  const niv = Math.max(nivBase(age) + 1,
                       Math.min(AGES[age - 1].niv, Math.round(moy(k => k.niv || 1))));

  // le fond ne survit que si deux cartes portent LE MÊME : deux fonds différents n'en font pas un
  const fonds = {};
  for (const k of cartes) if (k.fond) fonds[k.fond] = (fonds[k.fond] || 0) + 1;
  const fond = Object.keys(fonds).find(f => fonds[f] * 2 > cartes.length) || null;

  const temps = {};
  for (const k of cartes) temps[k.temper] = (temps[k.temper] || 0) + 1;
  const temper = +Object.keys(temps).sort((a, b) => temps[b] - temps[a])[0];

  return {
    line: base.line, motif: base.motif, age, niv, temper, fond,
    /* LA COULEUR SE MOYENNE SUR LA ROUE, et seules les cartes CHROMATIQUES y participent :
       une carte grise n'a pas de couleur à donner, elle a une couleur latente. Si aucune des
       trois n'est chromatique, on garde celle de la base — elle ressortira le jour où une
       fusion tombera sur un chromatique. */
    chroma: milieuRoue(cartes.filter(k => k.prodige).map(k => k.chroma || 0)) ||
            (base.chroma || 0),
    rank: Math.round(moy(k => k.rank || 0)),
    /* Les stats se moyennent stat par stat : trois cartes fortes en font une forte.
       UNE STAT NULLE N'EST PAS UNE STAT ABSENTE, et `|| IV_MAX / 2` confondait les deux : un
       zéro est faux en JavaScript, donc la pire carte du jeu se voyait rendre la moyenne à sa
       place. C'est exactement la valeur qu'on veut pouvoir fondre — celle dont on se débarrasse. */
    iv: IV_NOMS.map((n, i) => Math.round(moy(k => {
      const v = (k.iv || [])[i];
      return v === undefined ? IV_MAX / 2 : v;
    }))),
    prodige: majorite(k => k.prodige),
    etoiles: (base.etoiles || 1) + 1,
  };
}

/* CE QU'UNE CARTE PEUT FAIRE À LA FORGE. Deux refus, et ils ne se disent pas pareil : une
   carte au bout n'a plus d'étoile à gagner, une carte équipée en aurait mais on ne la touche
   pas. L'atelier montre les deux, éteintes, avec leur raison — les cacher ferait chercher une
   carte qu'on possède. */
/* LE CREUSET LÈVE L'INTERDIT SUR LES CARTES ÉQUIPÉES. Il tenait à ce qu'une carte qui
   s'évapore d'un emplacement change le build en silence — mais la forge DÉSIGNE ses trois
   cartes et montre le résultat : rien n'y est silencieux, et l'interdit n'obligeait qu'à un
   aller-retour sans décision. Il reste par défaut, et se lève par un nœud. */
const forgeable = k => (k.etoiles || 1) < ETOILES.length &&
                       (etoilePrise('creuset') || state.slots.indexOf(k.id) === -1);
const refusForge = k => (k.etoiles || 1) >= ETOILES.length
  ? 'Elle est au bout : trois étoiles.'
  : state.slots.indexOf(k.id) !== -1
    ? 'Elle est équipée. Retire-la de tes cartes actives pour la forger.' : '';

// Celles qui peuvent rejoindre une base : même lignée, même motif, même rang d'étoiles.
const compagnes = base => state.album.filter(k =>
  k.id !== base.id && forgeable(k) && cleForge(k) === cleForge(base));

/* CE QU'ON A DÉSIGNÉ. Deux identifiants et une liste, et rien de tout ça ne se sauvegarde :
   c'est un geste en cours, pas un état de partie. Un joueur qui ferme l'onglet au milieu d'un
   choix ne doit pas le retrouver le lendemain — il ne saurait plus pourquoi il l'avait fait. */
let forgeBase = null, forgeAmies = [];

/* Un choix se périme tout seul : une carte peut être fondue, équipée ou emportée par une
   ascension pendant qu'elle est désignée. On élague avant de dessiner plutôt que de garder des
   identifiants morts — sinon le plan de travail montre des trous sans le dire. */
function elaguerForge() {
  const vivante = id => { const k = carteDe(id); return k && forgeable(k); };
  if (forgeBase !== null && !vivante(forgeBase)) { forgeBase = null; forgeAmies = []; return; }
  if (forgeBase === null) { forgeAmies = []; return; }
  const base = carteDe(forgeBase);
  forgeAmies = forgeAmies.filter(id => vivante(id) && cleForge(carteDe(id)) === cleForge(base))
                         .slice(0, FUSION_N - 1);
}

/* Le clic de la grille : il désigne, il ajoute, il retire. Un seul geste pour les trois, parce
   qu'un joueur qui vient de poser une carte par erreur cherche à la reprendre au même endroit
   où il l'a posée. */
function choisirForge(id) {
  const k = carteDe(id);
  if (!k || !forgeable(k)) return false;
  if (forgeBase === null) { forgeBase = id; forgeAmies = []; }
  else if (id === forgeBase) { forgeBase = null; forgeAmies = []; }
  else if (forgeAmies.indexOf(id) !== -1) forgeAmies = forgeAmies.filter(x => x !== id);
  else {
    if (cleForge(k) !== cleForge(carteDe(forgeBase))) return false;
    if (forgeAmies.length >= FUSION_N - 1) return false;
    forgeAmies.push(id);
  }
  forgeSig = '';
  refresh();
  return true;
}

const oublierForge = () => { forgeBase = null; forgeAmies = []; forgeSig = ''; };

// Ce que le plan de travail porte en ce moment, base d'abord.
const trioForge = () => forgeBase === null ? [] : [forgeBase].concat(forgeAmies);

// Forger. Trois cartes et de la poussière entrent, une carte sort.
function forger(ids) {
  if (!Array.isArray(ids) || ids.length !== FUSION_N) return false;
  if (new Set(ids).size !== FUSION_N) return false;
  const cartes = ids.map(carteDe);
  if (cartes.some(k => !k || !forgeable(k))) return false;
  if (new Set(cartes.map(cleForge)).size !== 1) return false;

  const cout = coutFusion(cartes[0]);
  if (cout === null || (state.poussiere || 0) < cout) return false;

  state.poussiere -= cout;
  state.album = state.album.filter(k => ids.indexOf(k.id) === -1);
  state.album.push(Object.assign(fusionDe(cartes), { id: nextCard++ }));
  state.stats.fusions = (state.stats.fusions || 0) + 1;

  oublierAlbum();
  oublierForge();
  albumSig = '';
  chord([523, 659, 784, 1046], 80);
  refresh();
  save();
  return true;
}

/* Déplacer une carte entre le build et la réserve. Rend false quand le geste ne peut pas
   aboutir — cinq emplacements pleins, ou carte déjà du bon côté — pour que l'appelant puisse
   le signaler au lieu de laisser croire que ça a marché. */
function deplacerCarte(id, versBuild) {
  if (!carteDe(id)) return false;
  const i = state.slots.indexOf(id);
  if (versBuild) {
    if (i !== -1) return false;
    if (state.slots.length >= SLOTS) return false;
    state.slots.push(id);
  } else {
    if (i === -1) return false;
    state.slots.splice(i, 1);
  }
  oublierAlbum();
  albumSig = '';
  refresh();
  save();
  return true;
}

/* Ce que le saut produira, calculé sans rien changer : les capsules d'aperçu portent
   l'identifiant de leur bête, EN NÉGATIF — il ne peut donc se confondre avec aucune carte de
   l'album, et il désigne un animal précis. Elles reçoivent leur vrai numéro à la validation.

   L'aperçu était numéroté par POSITION — la première, la deuxième — et l'enclos bougeait sous
   les pieds du joueur pendant qu'il choisissait : une vente automatique décalait tout, et « la
   troisième » n'était plus la même bête entre le clic et la confirmation. On gardait une carte
   qu'on n'avait pas choisie, et depuis que les autres sont détruites, on perdait la bonne. */
let ascChoix = [];

/* Ce que le saut produira. L'ordre est CELUI DE LA BANDE, pas celui du tableau interne :
   `subjects()` porte déjà le tri choisi par le joueur — arrivée, rareté ou âge — et une liste
   qui contredirait la bande obligerait à chercher deux fois la même bête. */
/* UN JETON, UNE CARTE — et le saut les prend TOUS.

   Deux défauts se cachaient ici, et le second masquait le premier. `max` valait SLOTS : le
   nombre de jetons n'entrait nulle part, si bien qu'un seul jeton laissait choisir cinq
   cartes. Et l'ascension n'en consommait qu'un, donc les autres restaient en poche — on
   sautait avec cinq jetons et on en retrouvait quatre de l'autre côté.

   La règle est maintenant celle qu'on voulait depuis le début : chaque jeton vaut une carte
   qu'on emporte, et SAUTER LES DÉPENSE TOUS, y compris ceux qu'on n'a pas employés. C'est ce
   qui donne un sens à l'attente — sauter au premier jeton n'emporte qu'une carte, en attendre
   trois en emporte trois — et c'est ce qui empêche une réserve de jetons de rendre les
   ascensions suivantes gratuites.

   ⚠ L'ALBUM ET LES CARTES ACTIVES SONT DEUX CHOSES. L'ALBUM N'A PAS DE LIMITE : il garde tout
   ce qu'on possède, ascension après ascension. SLOTS ne borne que les CARTES ACTIVES — les
   cinq qui agissent, qu'on échange avec le reste de l'album au glisser-déposer.

   Le jeton borne donc ce qui ENTRE DANS L'ALBUM, et rien d'autre. Neuf jetons emportent neuf
   cartes ; cinq d'entre elles s'équipent, les quatre autres attendent leur tour. Plafonner à
   SLOTS revenait à jeter quatre cartes gagnées, et confondait la vitrine avec la collection. */
function apercuAscension() {
  const jetons = jetonsEnMain();
  const neuves = subjects().filter(s => s.kind === 'creature')
    .map(s => Object.assign(capsuleBrute(s.c), { id: -s.c.id }));
  /* `max` n'est plus le nombre de jetons mais ce que la bourse PERMET : le prix d'une carte
     monte, donc cinq jetons n'achètent plus cinq cartes. */
  return { jetons, neuves, max: cartesAbordables(jetons) };
}

function ouvrirAscension() {
  if (!peutAscensionner()) return;
  /* On repart d'une ardoise vide : l'écran ne propose QUE les bêtes de l'enclos, et une
     sélection héritée des cartes déjà équipées n'y aurait aucun repère à l'écran. */
  ascChoix = [];
  $('ascension').hidden = false;
  renderAscension();
}

function fermerAscension() { $('ascension').hidden = true; }

function renderAscension() {
  const ap = apercuAscension();
  if (!peutAscensionner()) { fermerAscension(); return; }

  const suivant = prochainPalier();
  setText($('asc-jalon'),
    ap.jetons + ' jeton' + (ap.jetons > 1 ? 's' : '') + ' d’ascension, donc ' +
    ap.max + ' carte' + (ap.max > 1 ? 's' : '') + ' à emporter dans ton album' +
    (ap.max > SLOTS ? ' — cinq s’équipent, le reste attend en réserve' : '') + '. ' +
    /* IL DISAIT « Sauter les dépense tous, employés ou non ». C'ÉTAIT VRAI JUSQU'À LA
       4.0.0 ET FAUX DEPUIS : le reste de la bourse demeure, et c'est même toute la raison
       d'être du second évier. La phrase poussait donc à brûler ses jetons en cartes qu'on ne
       veut pas, c'est-à-dire exactement contre l'arbitrage qu'on voulait créer. */
    'Ce que tu n’emploies pas reste en bourse pour la constellation — rien ne t’oblige à sauter, ni maintenant ni jamais.' +
    (suivant ? ' Le prochain se gagne à ' + fmt(suivant) + ' pièces.'
             : ' C’était le dernier palier de l’échelle.'));

  /* Une ascension sans carte à naître est une perte sèche, pas un choix : on la refuse
     plutôt que de laisser le joueur se saborder d'un clic. Le jeton, lui, reste en poche. */
  /* Sauter sans avoir rien retenu, c'est tout perdre pour rien : on le refuse, comme on refuse
     de sauter sur un enclos vide. */
  $('asc-go').disabled = !ap.neuves.length || !ascChoix.length;
  setText($('asc-go'), !ap.neuves.length ? 'Enclos vide'
                     : !ascChoix.length ? 'Choisis une bête'
                     : 'Ascensionner');

  /* Le marchand vide l'enclos en continu, absences comprises — et les cartes viennent de ce
     qui reste dedans. Sans cet avertissement, un joueur ascensionne après des heures de jeu
     et repart avec zéro carte. C'est le seul piège que la règle crée. */
  const vend = prime('marchand') &&
               Object.keys(RARITY).some(cle => (state.sellAt[cle] || 0) > 0);
  $('asc-warn').hidden = !vend;
  if (vend) setText($('asc-warn'),
    '⚠ Ton marchand vend encore. Tant qu’il tourne il vide l’enclos, et les cartes viennent ' +
    'de ce qu’il y reste au moment du saut. Passe ses consignes sur « jamais » avant.');

  /* La perte tient en une ligne. Elle annonçait « les bêtes non transformées », ce qui était
     faux depuis que TOUTES les bêtes de l'enclos deviennent des capsules : il n'en reste
     aucune. Un récap qui invente une perte qui n'existe pas discrédite le reste. */
  const eggs = totalEggs(), autos = UPGRADES.filter(u => lvl(u.key)).length;
  setText($('asc-perte'), 'Tu perds ' + fmt(state.coins) + ' pièces, ' +
    (eggs ? eggs + ' œuf' + (eggs > 1 ? 's' : '') + ' non éclos, ' : '') +
    state.incubators + ' incubateur' + (state.incubators > 1 ? 's' : '') + ', ' +
    state.pens + ' enclos et ' +
    autos + ' amélioration' + (autos > 1 ? 's' : '') + ' sur ' + UPGRADES.length +
    '. Ta collection et tes cartes restent.');

  /* Une bête vendue ou une carte disparue ne doit pas rester cochée en fantôme : le compte
     d'emplacements mentirait, et la confirmation promettrait ce qu'elle ne peut pas tenir. */
  /* SEULES LES BÊTES DE L'ENCLOS, jamais les cartes de l'album. L'écran mélangeait les deux,
     et la question qu'il pose n'est pas « quel build veux-tu ? » — celui-là se règle à tout
     moment dans l'album, en glissant les cartes d'un bloc à l'autre — mais « laquelle de tes
     bêtes veux-tu voir agir tout de suite ? ». Les cartes déjà équipées ne bougent pas d'un
     écran auquel elles n'appartiennent plus. */
  const dispo = ap.neuves;
  ascChoix = ascChoix.filter(id => dispo.some(k => k.id === id));

  const choix = $('asc-choix');
  choix.textContent = '';
  for (const k of dispo) {
    const el = carteEl(k);
    el.classList.add('choisir');
    if (ascChoix.indexOf(k.id) !== -1) el.classList.add('active');
    el.addEventListener('click', () => {
      const i = ascChoix.indexOf(k.id);
      if (i !== -1) ascChoix.splice(i, 1);
      else if (ascChoix.length < ap.max) ascChoix.push(k.id);
      else return;                       // plein : on ne remplace pas au hasard
      renderAscension();
    });
    choix.appendChild(el);
  }
  const perdues = ap.neuves.length - Math.min(ascChoix.length, ap.max);
  const garde = Math.max(0, ap.max - ascChoix.length);
  const bouts = ['Choisis jusqu’à ' + ap.max + ' bête' + (ap.max > 1 ? 's' : '') +
                 ' à garder en cartes — ' + ascChoix.length +
                 ' retenue' + (ascChoix.length > 1 ? 's' : '') + '.'];
  if (perdues) bouts.push('⚠ ' + (perdues > 1 ? 'Les ' + perdues + ' autres sont perdues'
                                              : 'L’autre est perdue') + ' avec la ferme.');
  const gardees = Math.min(garde, state.slots.length);
  if (gardees) bouts.push(gardees + ' de tes cartes actuelles garde' + (gardees > 1 ? 'nt' : '') +
                          ' sa place.'.replace('sa', gardees > 1 ? 'leur' : 'sa'));
  setText($('asc-slots'), bouts.join(' '));

  /* CHOISIR À LA MAIN QUINZE FOIS EST UNE CORVÉE, PAS UNE DÉCISION. La décision, c'est
     « lesquelles » — et neuf fois sur dix la réponse est « les meilleures ». Le bouton la donne
     d'un geste ; le choix fin reste possible en cliquant les cartes, comme avant. */
  const plein = ascChoix.length >= Math.min(ap.max, dispo.length);
  const rafle = $('asc-rafle');
  rafle.hidden = dispo.length < 2;
  setText(rafle, plein ? 'Tout enlever'
                       : 'Prendre les ' + Math.min(ap.max, dispo.length) + ' meilleures');
}

/* LES MEILLEURES, ET SUR QUEL CRITÈRE. On trie sur ce que la carte VAUDRA — la rareté
   d'abord, l'âge ensuite, le niveau pour départager. Trier sur le prix de vente serait faux :
   une carte ne se vend pas, elle s'équipe, et deux cartes de même rareté ne diffèrent à
   l'usage que par ce qu'elles portent. */
const rangCarte = k => [rarityOf(k).rank, k.age || 0, k.niv || 0, k.etoiles || 1];
const meilleuresCartes = (liste, n) => liste.slice()
  .sort((a, b) => {
    const x = rangCarte(b), y = rangCarte(a);
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i];
    return 0;
  })
  .slice(0, n).map(k => k.id);

function ascensionner() {
  const ap = apercuAscension();
  if (!peutAscensionner()) return;

  /* SEULES LES BÊTES RETENUES DEVIENNENT DES CAPSULES. Les autres partent avec la ferme :
     elles ne rejoignent pas la réserve, elles n'existent tout simplement pas.

     La réserve garde les CARTES qu'on possède déjà et qu'on n'équipe pas — c'est son rôle, et
     le glisser-déposer de l'album en dépend. Elle n'a jamais eu à recueillir tout un enclos :
     une ferme de vingt bêtes y versait vingt cartes d'un coup, et le choix qu'on venait de
     faire ne coûtait rien. */
  /* On borne par les JETONS, pas par SLOTS. L'écrêtage à cinq datait d'avant que l'album et
     les cartes actives soient deux choses : il jetait les cartes gagnées au-delà de la
     cinquième, alors que l'album n'a pas de limite et que c'est justement lui qui les garde. */
  const vrai = {};
  const neuves = ap.neuves
    .filter(k => ascChoix.indexOf(k.id) !== -1)
    .map(k => {
      const c = Object.assign({}, k, { id: nextCard++ });
      vrai[k.id] = c.id;
      return c;
    })
    .slice(0, ap.max);
  /* Ce qui entre dans l'album, ce sont les bêtes RETENUES, et rien d'autre : le filtre juste
     au-dessus a déjà écarté les autres. Ce commentaire disait l'inverse — « rien ne se perd,
     les capsules qu'on n'équipe pas rejoignent la réserve » — et décrivait l'ascension d'avant
     la 2.10, quand tout un enclos y était versé. Ce qui glisse en réserve aujourd'hui, ce sont
     les cartes DÉJÀ POSSÉDÉES qu'un nouveau choix déloge de leurs emplacements. */
  /* CE QU'ON N'EMPORTE PAS LAISSE UN PEU DE POUSSIÈRE. Les bêtes non retenues disparaissaient
     sans rien laisser : un dixième de ce que leur carte aurait rendu ne rend pas le sacrifice
     indolore, mais il récompense d'ascensionner sur une ferme pleine plutôt que sur trois
     têtards — ce que le jeu voulait déjà encourager sans avoir de moyen de le dire. */
  const laisse = ap.neuves
    .filter(k => ascChoix.indexOf(k.id) === -1)
    .reduce((n, k) => n + Math.round(poussiereDe(k) * POUSSIERE_SAUT), 0);

  const album = state.album.concat(neuves);
  /* Les bêtes retenues d'abord, puis les cartes déjà équipées pour combler ce qui reste : ne
     rien choisir ne doit pas vider son build. Le joueur réarrangera dans l'album s'il veut. */
  const slots = ascChoix.map(id => vrai[id])
                        .concat(state.slots)
                        .filter((id, i, t) => id !== undefined && t.indexOf(id) === i)
                        .filter(id => album.some(k => k.id === id))
                        .slice(0, SLOTS);

  /* TOUT REPART DE ZÉRO SAUF QUATRE CHOSES : l'album, les emplacements, le compte
     d'ascensions et la collection. Le reste de la liste n'est que du confort d'affichage —
     l'ordre de la bande, la taille des lots, le son — qui n'agit sur rien.

     LES CONSIGNES DE LA FERME NE TRAVERSENT PLUS. Elles le faisaient, au motif que les refaire
     rareté par rareté serait une corvée. C'était un mauvais calcul sur deux points.

     D'abord elles deviennent fausses : on finit une partie sur « ne vends jamais les
     mythiques, monte les communes jusqu'à la légende », consignes qui n'ont aucun sens sur une
     ferme qui recommence avec un œuf commun et zéro pièce. Les objectifs d'un cycle ne sont
     pas ceux du suivant.

     Ensuite, et c'est plus grave, elles étaient INVISIBLES. Les trois panneaux de réglage ne
     s'affichent qu'avec l'automate correspondant, et une ferme neuve n'en possède aucun : les
     consignes gouvernaient donc en silence, et tombaient d'un coup sur la ferme à l'instant du
     rachat du marchand. Un réglage qu'on ne peut pas voir ne doit pas agir. */
  oublierPrimes();
  state = Object.assign(freshState(), {
    album, slots,
    // la constellation traverse le saut, comme l'album : c'est ce qu'on a appris
    ciel: state.ciel || {},
    /* Les paliers déjà franchis ne reviennent pas : la bourse repart de zéro, l'échelle non.
       C'est ce qui fait qu'une partie a un nombre fini d'ascensions. */
    /* LE RESTE DE LA BOURSE DEMEURE. Les jetons partaient tous, employés ou non — c'était le
       prix de sauter trop tôt, et ça n'a plus de sens depuis qu'ils ont un second emploi :
       garder ses jetons pour la constellation EST une décision, pas un gâchis. Ce qui se paie
       ici, c'est le prix doré des cartes emportées, et rien d'autre. */
    /* LA DÉPENSE DU CYCLE SE SOLDE ICI. `ap.jetons` est déjà ce qu'on a en main, dépense
       déduite — la bourse du cycle suivant repart donc d'un nombre net, et le compteur avec
       elle. Le laisser courir referait payer les nœuds du cycle précédent. */
    asc: { n: (state.asc.n || 0) + 1, paliers: state.asc.paliers,
           jetons: Math.max(0, ap.jetons - coutCartes(neuves.length)),
           sommet: 0, depense: 0 },
    seen: state.seen, dex: state.dex, tri: state.tri, triOeuf: state.triOeuf,
    achat: state.achat, sound: state.sound,
    poussiere: (state.poussiere || 0) + laisse,
    // on ne réapprend pas le jeu au deuxième cycle : les notes voyagent avec la collection
    tuto: state.tuto, vu: state.vu, dial: state.dial,
    // et les compteurs aussi : ils comptent une vie de fichier, pas une partie
    stats: state.stats, dons: state.dons, trophees: state.trophees,
  });
  nextId = 1;

  /* DEUX REMISES À ZÉRO QUI NE SONT PAS DANS L'ÉTAT, et sans lesquelles le saut ne se voit pas.

     `lastFrame` d'abord. La boîte de confirmation gèle le minuteur pendant qu'on la lit : au
     clic suivant, la boucle rattrape le temps écoulé — plafonné à cinq secondes, mais
     MULTIPLIÉ PAR LA VITESSE. À ×100, une confirmation lue en vingt secondes injectait cinq
     cents secondes de jeu dans la partie qui vient de naître : couvaison, croissance, rente,
     ventes et rachats d'un coup. La ferme neuve semblait n'avoir jamais été remise à zéro.

     `speed` ensuite. Elle traversait le saut, alors que le bouton ⟲ la rend à ×1 : on
     ascensionnait en accéléré — c'est comme ça qu'on atteint un jeton pour essayer — et la
     partie suivante démarrait à ×100, illisible. Une ascension doit se regarder à vitesse
     réelle ; le bouton est à un clic si on veut réaccélérer. */
  lastFrame = Date.now();
  state.speed = 1;
  $('btn-speed').textContent = '×1';
  bilanAuto.vendus = bilanAuto.gagne = bilanAuto.evolues = bilanAuto.depense = 0;

  oublierAlbum();
  albumSig = collSig = '';
  fermerAscension();
  remplirMenus();          // les prix des œufs bougent avec le zébré
  syncReglages();
  syncTri();
  syncTriOeuf();
  refresh();
  save();
  chord([392, 523, 659, 784], 90);
}

/* LA SCÈNE A TROIS CAS QUI N'ONT RIEN EN COMMUN : une case vide, un œuf qui couve, une bête
   qui vit. Ils tenaient dans une seule fonction de deux cent vingt lignes où trois jeux de
   variables se croisaient sans jamais se servir les uns des autres — `stage` et `subject` ne
   servaient qu'aux deux derniers, `slot` qu'au deuxième, la moitié du reste qu'au troisième. */
/* Le fond ne suit que les bêtes : un œuf n'en a pas, et l'écran de plonge encore moins. On
   l'éteint donc en tête, et seule la branche « créature » le rallume. */
function renderStage() {
  $('stage-fond').hidden = true;
  // la plonge passe avant tout : c'est un état du jeu, pas un sujet en scène
  if (enPlonge()) return plongeOuverte() ? renderPlonge() : renderRien();
  const s = current();
  if (!s) return renderRien();
  /* Les deux seules lignes que le cas plein partage : la sélection se recale sur ce qui est
     réellement en scène, et la ligne des boosts se lit d'un œuf comme d'une bête. */
  if (state.sel !== s.key) state.sel = s.key;
  setText($('stage-boost'), ligneBoosts(s));
  return s.kind === 'egg' ? renderOeuf(s) : renderBete(s);
}

/* L'ÉVIER. Le seul écran du jeu où le clic ne fait rien grandir : la barre monte vers le prix
   d'un œuf, et le compte des assiettes descend. */
function renderPlonge() {
  const acts = refs.acts, stage = document.querySelector('.stage');
  cacherAxes();
  setText($('stage-boost'), '');
  ['place', 'sell', 'evo', 'keep'].forEach(k => { acts[k].hidden = true; });

  /* LA BARRE SUIT L'ASSIETTE EN COURS, pas la sortie de l'impasse. Cent vingt clics pour un
     œuf, c'est moins d'un pour cent par clic sur une barre globale — invisible. Sur l'assiette,
     chaque clic vaut dix pour cent, et la barre se remplit douze fois. Même règle que la scène
     d'une bête : la jauge vise le prochain palier, le texte dit la distance au but. */
  const reste = assiettesRestantes(), frotte = state.frotte || 0;
  stage.classList.remove('apex', 'ready', 'cracking', 'prodige');
  setStageRarity(stage, null);
  setVar($('subject'), '--sz', '1');
  setCreature($('stage-glyph'), null, '🍽️');
  setFilter($('stage-glyph'), '');
  setText($('stage-name'), 'La plonge');
  setHtml($('stage-meta'), ASSIETTE_CLICS + ' clics l’assiette, une pièce l’assiette');
  setWidth($('stage-fill'), (frotte / ASSIETTE_CLICS * 100).toFixed(1) + '%');
  setText($('stage-timer'), frotte + ' / ' + ASSIETTE_CLICS + ' · ' +
    reste + ' assiette' + (reste > 1 ? 's' : '') + ' avant un œuf');
  $('stage-timer').classList.remove('done');
  setText($('stage-hint'), 'Rien ne compte double ici. Ni la force du clic, ni la frénésie, ' +
    'ni tes cartes : dix clics font une assiette, comme pour tout le monde.');
}

/* Rien en scène. Cette fonction n'était atteignable par personne — `subjects()` liste les
   incubateurs même vides, donc `current()` ne rend jamais null — et c'est exactement l'écran
   qu'il fallait pour l'impasse AVANT que la professeure parle : rien, et quelqu'un qui a
   quelque chose à dire. On n'y montre pas la vaisselle : elle n'existe pas encore pour le
   joueur, et c'est tout l'intérêt. */
function renderRien() {
  const acts = refs.acts, stage = document.querySelector('.stage');
  cacherAxes();
  setText($('stage-boost'), '');
  ['place', 'sell', 'evo', 'keep'].forEach(k => { acts[k].hidden = true; });
  stage.classList.remove('apex', 'ready', 'cracking', 'prodige');
  setStageRarity(stage, null);
  setVar($('subject'), '--sz', '1');
  setCreature($('stage-glyph'), null, '◌');
  setFilter($('stage-glyph'), '');
  setWidth($('stage-fill'), '0%');
  setText($('stage-timer'), '');
  $('stage-timer').classList.remove('done');

  if (!enPlonge()) {
    setText($('stage-name'), 'Rien en vue');
    setHtml($('stage-meta'), '');
    setText($('stage-hint'), 'Achète un œuf pour recommencer.');
    return;
  }
  setText($('stage-name'), 'Plus rien');
  setHtml($('stage-meta'), 'l’enclos est vide, la bourse aussi');
  setText($('stage-hint'), 'La professeure a quelque chose à te dire.');
}

// Un œuf, placé ou non. Il n'a ni âge, ni niveau, ni taille, ni bonheur : tout ce bloc-là
// s'efface, et la scène se réduit à une couvaison qui avance.
function renderOeuf(s) {
  const stage = document.querySelector('.stage');
  const subject = $('subject');
  const acts = refs.acts;
  const hide = k => { acts[k].hidden = true; };
  const slot = s.slot;
  cacherAxes();
  stage.classList.remove('apex');
  // l'œuf gonfle doucement à mesure qu'il couve
  const ratio = slot ? Math.min(1, slot.p / hatchTime(slot)) : 0;
  const kind = slot ? EGG_BY_KEY[slot.kind] || EGG_BY_KEY.commun : null;
  setVar(subject, '--sz', slot ? (0.8 + 0.25 * ratio).toFixed(3) : '0.9');
  setCreature($('stage-glyph'), slot ? artOeuf(kind.key) : null, slot ? kind.glyph : '◌');
  setFilter($('stage-glyph'), '');
  stage.classList.remove('prodige');
  setText($('stage-name'), slot ? kind.name : 'Incubateur libre');
  setStageRarity(stage, slot ? 'egg-' + kind.key : null);
  stage.classList.toggle('cracking', !!slot && ratio > 0.65);

  if (slot) {
    const ready = slot.p >= hatchTime(slot);
    stage.classList.toggle('ready', ready);
    setHtml($('stage-meta'), ready ? 'ça sort !' : (ratio > 0.65 ? 'ça craque' : 'en couvaison'));
    setWidth($('stage-fill'), Math.min(100, (slot.p / hatchTime(slot)) * 100) + '%');
    setText($('stage-timer'), ready
      ? (penFull() ? 'enclos plein — vends ou achète un enclos' : 'ça sort !')
      : remaining(hatchTime(slot) - slot.p, autoReel(s)));
    $('stage-timer').classList.toggle('done', ready);
    setText($('stage-hint'), state.up.couveuse
      ? '' : 'Clique sur l’œuf pour le faire éclore. Rien n’avance tout seul au début.');
    ['place', 'sell', 'evo', 'keep'].forEach(hide);
  } else {
    stage.classList.remove('ready');
    setHtml($('stage-meta'), 'vide');
    setWidth($('stage-fill'), '0%');
    setText($('stage-timer'), '');
    $('stage-timer').classList.remove('done');
    const stock = totalEggs();
    setText($('stage-hint'), stock
      ? 'Tu as ' + stock + ' œuf' + (stock > 1 ? 's' : '') + ' en réserve.'
      : 'Achète un œuf dans la boutique.');
    ['sell', 'evo', 'keep'].forEach(hide);
    acts.place.hidden = false;
    const best = bestStocked();
    setText(acts.place, best ? 'Placer un ' + EGG_BY_KEY[best].name.toLowerCase() : 'Placer un œuf');
    acts.place.disabled = !best;
  }
}

// Une bête : le seul cas qui remplisse les trois colonnes et la ligne du bonheur.
function renderBete(s) {
  const stage = document.querySelector('.stage');
  const subject = $('subject');
  const acts = refs.acts;
  const c = s.c;
  const mur = estMur(c);
  const sf = sizeFactor(c);
  const rank = rankOf(sf);
  const niv = niveau(c);
  const dernier = nivBase(c.age) + nivDansAge(c.age);   // le niveau où elle sera mûre

  const rar = rarityOf(c);
  stage.classList.remove('cracking');
  stage.classList.toggle('apex', c.age === AGES.length);
  stage.classList.toggle('ready', mur);
  setStageRarity(stage, 'rar-' + lineOf(c).rarity);
  peindreFond($('stage-fond'), c);
  // point décimal obligatoire : le CSS ne sait pas lire « 1,5 »
  setVar(subject, '--sz', visualScale(c).toFixed(3));
  setFilter($('stage-glyph'), filtreDe(c));
  stage.classList.toggle('prodige', !!c.prodige);
  setCreature($('stage-glyph'), artFor(c), glyphOf(c));
  setText($('stage-name'), fullName(c));

  /* Sous le nom, la RARETÉ seule. Elle ne bouge jamais de toute la vie de la bête, alors que
     les trois autres montent — les mêler dans la même ligne à points était le nœud du
     problème. Le reste part dans les colonnes juste en dessous. */
  const mult = nivMult(c);
  setHtml($('stage-meta'),
    '<span class="rar rar-' + lineOf(c).rarity + '">' + rar.name + '</span>');
  peindreAxes(c, mur, rank, niv, dernier, mult);
  peindreJoie(c);

  /* La rente s'annonce AVANT d'exister : sans ça, personne ne devine qu'une bête se met à
     payer toute seule à l'âge adulte. Une fois ouverte, c'est le montant qu'on affiche. */
  const r = renteOf(c);
  const paie = r
    ? 'Elle rapporte ' + fmtRente(r) + ' pièce' + (r >= 2 ? 's' : '') +
      ' par seconde rien qu’en restant là. La garder paie.'
    : 'À l’âge ' + AGES[AGE_RENTE - 1].nom + ' — niveau ' + NIV_RENTE +
      ' — elle se mettra à rapporter toute seule, même absent.';

  if (!mur) {
    /* La barre vise le PROCHAIN NIVEAU, jamais la maturité : cent niveaux dans une vie, donc
       cent barres qui se remplissent. Où en est la bête dans son âge se lit juste au-dessus,
       « mûre au niv. 65 » — deux informations, deux endroits, aucune redite. */
    const pas = ageGrow(c) / nivDansAge(c.age);
    const dedans = (c.p - bandFrom(c)) - nivDansTranche(c) * pas;
    setWidth($('stage-fill'), Math.min(100, (dedans / pas) * 100).toFixed(1) + '%');
    setText($('stage-timer'), remaining((pas - dedans) / growRate(c), autoReel(s)) +
      ' → niv. ' + (niv + 1) + (niv + 1 === dernier ? ' · mûre' : ''));
    $('stage-timer').classList.remove('done');
    setText($('stage-hint'), state.up.eleveur
      ? paie : 'Clique dessus pour la faire grandir. Elle ne pousse pas toute seule sans éleveur.');
  } else {
    // mûre : son niveau se bloque là, et ce qu'elle avale part dans l'embonpoint
    if (rank.next) {
      const span = rank.next.at - rank.from;
      setWidth($('stage-fill'), Math.min(100, ((sf - rank.from) / span) * 100).toFixed(1) + '%');
      // Ce qu'il reste avant le prochain rang. Même règle que partout ailleurs : en secondes
      // si la mangeoire engraisse toute seule, en clics si c'est à toi de le faire.
      const cible = (Math.exp((rank.next.at - 1) / OVER_GAIN) - 1) * ageGrow(c);
      setText($('stage-timer'),
        remaining(cible - (c.over || 0), autoReel(s)) + ' → ' + rank.next.fem +
        ' (' + fmt(baseValue(c) * rank.next.at) + ')');
    } else {
      setWidth($('stage-fill'), '100%');
      setText($('stage-timer'), estFinie(c) ? 'menée au bout' : 'plus aucun rang au-dessus');
    }
    $('stage-timer').classList.add('done');
    /* LA BÊTE FINIE LE DIT, et dit ce que le clic lui rapporte. C'est le seul endroit du jeu
       où l'on n'a plus rien à faire grandir : sans cette phrase, on clique sur une bête au
       bout en croyant qu'il ne se passe rien. */
    setText($('stage-hint'), estFinie(c)
      ? 'Elle est au bout : plus de niveau, plus de rang. Chaque clic te rapporte ' +
        fmt(gainClicFini(c, s)) + ' — c’est ta main seule qui compte, pas une carte ocellée.'
      : c.age < AGES.length
      ? 'Elle est mûre : son niveau ne montera plus tant que tu ne l’auras pas fait évoluer. ' +
        (r ? 'En attendant, elle rapporte ' + fmtRente(r) + ' / s et s’engraisse.'
           : 'En attendant, ce qu’elle avale part dans sa taille — et ce n’est pas perdu.')
      : paie);
  }

  // Un œuf cher ne se rembourse qu'en menant la bête assez haut : on le dit, plutôt que
  // de laisser le marchand la brader en silence.
  /* Une bête vaut moins que son œuf tant qu'elle n'est pas montée assez haut. Ce n'est
     alarmant que si rien n'est prévu pour l'y mener : quand l'évolution automatique est
     réglée au-delà du seuil, la ferme fait déjà le travail et le rouge ne ferait que
     faire peur à un joueur qui a tout bien réglé. */
  if (aPerte(c)) {
    const seuil = seuilRentable(c);
    /* Une bête sous le prix de son œuf n'est alarmante que si rien ne va l'en sortir :
       soit il lui suffit de finir de grandir à son âge actuel, soit l'évolution
       automatique est réglée assez haut. Dans les deux cas, pas de rouge. */
    // Deux façons de ne pas s'alarmer, et elles ne se racontent pas pareil : ou la bête est
    // déjà à l'âge qu'il faut et n'a plus qu'à finir de grandir, ou c'est l'évolution
    // automatique qui va l'y mener. La seconde n'a de sens que si elle est branchée — sans
    // ça on annonçait « l'âge undefined », et la scène ne s'affichait plus du tout.
    const dejaLa = !!seuil && c.age >= seuil;
    // le plafond qui compte est celui de SA rareté : une consigne de vente précoce arrête
    // l'évolution avant, et la bête ne remboursera peut-être jamais son œuf
    const menee = !!seuil && !dejaLa && !c.keep && prime('evolution') &&
                  plafondEvolution(c) >= seuil;
    const prisEnCharge = dejaLa || menee;
    setText($('stage-hint'),
      dejaLa
        ? 'Son œuf a coûté ' + fmt(c.cost) + '. Elle le remboursera en finissant de grandir : ' +
          'mûre, elle vaudra ' + fmt(valeurAu(c, c.age)) + '.'
      : menee
        ? 'Son œuf a coûté ' + fmt(c.cost) + '. Ton évolution la mènera à l’âge ' +
          AGES[plafondEvolution(c) - 1].nom + ', où elle vaudra ' +
          fmt(valeurAu(c, plafondEvolution(c))) + '.'
      : 'Son œuf a coûté ' + fmt(c.cost) + ', elle en vaut ' + fmt(sellValue(c)) + '. ' +
        (seuil ? 'Elle le remboursera à l’âge ' + AGES[seuil - 1].nom + '.'
               : 'Elle ne le remboursera jamais.'));
    $('stage-hint').classList.toggle('alerte', !prisEnCharge);
    acts.sell.classList.toggle('perte', !prisEnCharge && !c.keep);
    acts.sell.classList.remove('bon');
  } else {
    $('stage-hint').classList.remove('alerte');
    acts.sell.classList.remove('perte');
    /* Trois états, pas deux. Le rouge est réservé aux âges où la méprise est possible ; le
       vert exige que la vente rembourse vraiment l'œuf. Entre les deux — sous le prix mais
       passé l'âge d'alerte — le bouton reste neutre. Le peindre en vert mentirait. */
    acts.sell.classList.toggle('bon', !c.keep && !sousLePrix(c));
  }

  acts.place.hidden = true;
  acts.sell.hidden = false;
  setText(acts.sell, 'Vendre ' + fmt(sellValue(c)));
  /* L'infobulle suit les mêmes trois états que la couleur : alerte, fait, bonne affaire.
     Annoncer « vente au prix fort » sur une bête encore sous le prix de son œuf serait le
     seul mensonge du panneau. */
  acts.sell.title = c.keep ? 'Elle est gardée : relâche-la d’abord.'
    : aPerte(c) ? 'Elle vaut moins que son œuf, qui a coûté ' + fmt(c.cost) + '.'
    : sousLePrix(c) ? 'Elle est mûre, mais encore sous le prix de son œuf — ' +
      fmt(c.cost) + ' contre ' + fmt(sellValue(c)) + '. À toi de voir.'
    : mur ? 'Vente au prix fort : elle est mûre.'
    : 'Au niveau ' + niv + ' elle ne vaut qu’une fraction de ce qu’elle vaudra mûre — mais ' +
      'ça libère la place, et c’est possible à tout moment.';
  acts.sell.disabled = !!c.keep;

  acts.keep.hidden = false;
  setText(acts.keep, c.keep ? '★ Gardée' : '☆ Garder');
  acts.keep.title = c.keep
    ? 'Aucun automate n’y touchera. Clique pour la relâcher.'
    : 'Ni vendue ni faite évoluer par les automates : elle reste avec toi.';
  acts.keep.classList.toggle('on', !!c.keep);
  acts.keep.disabled = false;

  acts.evo.hidden = false;
  if (c.age >= AGES.length) {
    setText(acts.evo, 'Forme finale');
    acts.evo.title = 'Plus rien au-dessus — il ne reste qu’à la faire grossir.';
    acts.evo.disabled = true;
  } else {
    setText(acts.evo, 'Évoluer ' + fmt(evoCost(c)));
    acts.evo.title = mur
      ? 'Passe à l’âge ' + AGES[c.age].nom + '. Elle garde son niveau, sa taille et tout ce ' +
        'qu’elle a avalé : rien ne repart de zéro.'
      : 'Il faut d’abord qu’elle soit mûre, au niveau ' + dernier + '.';
    acts.evo.disabled = !mur || state.coins < evoCost(c);
  }
}

/* Ce que valent les améliorations, en clair et à l'instant : la durée de base, ce qu'elle
   devient avec ce qu'on possède, et ce qu'un clic apporte. Sans ça on achète des niveaux
   sans jamais voir ce qu'ils changent. */
function ligneBoosts(sujet) {
  const bouts = [], alb = albumVitesse(sujet);
  if (sujet.kind === 'egg') {
    if (!sujet.slot) return '';
    const base = hatchTime(sujet.slot), brut = force('couveuse'), n = brut * alb;
    bouts.push('Couvaison ' + fmtTime(base) + ' → ' + (n ? fmtTime(base / n) : 'rien sans toi'));
    if (brut) bouts.push('couveuse ×' + dec(brut, 2));
  } else {
    const c = sujet.c, t = temperOf(c);
    if (!estMur(c)) {
      // la durée annoncée est celle d'UN NIVEAU : c'est l'attente que le joueur vit
      const pas = ageGrow(c) / nivDansAge(c.age), brut = force('eleveur') * ELEVEUR_X, n = brut * alb;
      bouts.push('Croissance ' + fmtTime(pas) + ' par niveau → ' +
                 (n ? fmtTime(pas / (n * t.grow)) : 'rien sans toi'));
      if (t.grow !== 1) bouts.push(accord(t, c) + ' ×' + dec(t.grow));
      if (brut) bouts.push('éleveur ×' + dec(brut, 2));
    } else {
      const brut = force('mangeoire'), n = brut * alb;
      bouts.push('Engraissement ' + (n ? '+' + dec(FATTEN_X * n * t.fat, 1) + ' s par seconde'
                                       : 'rien sans toi'));
      if (n && t.fat !== 1) bouts.push(accord(t, c) + ' ×' + dec(t.fat));
      if (brut) bouts.push('mangeoire ×' + dec(brut, 2));
    }
    // la rente ne dépend plus de la maturité mais de l'âge : elle se lit dans les deux cas
    const r = renteOf(c);
    if (r) bouts.push('rente +' + fmtRente(r) + ' / s' + (c.prodige ? ' (chromatique ×2)' : ''));
  }
  /* CE QUE LES PRIMES ET LA CONSTELLATION AJOUTENT SE VOIT ENFIN. On achetait « +2 % de
     valeur » et rien à l'écran ne bougeait — le même défaut que la bête menée au bout, qui
     absorbait les clics sans rien dire. Un achat qui ne se sent pas est un achat qu'on
     regrette. */
  const cv = coef('valeur'), cvit = coef('vitesse');
  if (cv > 1) bouts.push('valeur ×' + dec(cv, 2));
  if (cvit > 1) bouts.push('vitesse ×' + dec(cvit, 2));
  if (alb > 1) bouts.push('album ×' + dec(alb, 2));
  if (enFrenesie()) bouts.push('frénésie ×' + FRENESIE_X);
  /* LES DEUX ÉTATS SE LISENT ICI, sur la ligne qui dit déjà ce qui multiplie quoi. Un état
     invisible n'existe pas : le joueur ne peut ni le viser, ni comprendre pourquoi sa ferme
     vient de changer de vitesse. Le compte des clics accompagne le combo — sans lui, on voit
     un nombre monter sans savoir ce qui le fait monter, ni ce qu'il reste avant le plafond. */
  if (combo) bouts.push('combo ×' + dec(comboMult(), 2) +
                        ' (' + combo + (combo >= COMBO_PLEIN ? ', au max' : '/' + COMBO_PLEIN) + ')');
  if (enIdle()) bouts.push('calme ×' + dec(IDLE_X, 2) + ' — la ferme tourne mieux sans toi');
  bouts.push('un clic vaut ' + fmt(clickGain(sujet)) + ' s');
  return bouts.join('  ·  ');
}

// ce que la bête vaudra une fois mûre à tel âge, taille ordinaire
function valeurAu(c, age) {
  return Math.round(valeurMure(lineOf(c).rarity, age) * variantMult(c)
                    * (1 + bonusAlbum().valeur));
}

/* LES TROIS NOTES CALCULÉES ONT ÉTÉ RETIRÉES. Elles disaient, sous chaque consigne, ce que
   le réglage en cours allait produire — « environ 80 éclosions par heure », « il vend aussi
   celles qui rapportaient ». C'était juste, et c'était trois paragraphes de plus dans une
   colonne qu'on voulait calme : le panneau des réglages garde ses trois titres, ses segments,
   et la seule explication qui ne se devine pas — celle de la revente. */

function tickView() {
  $('coins').textContent = fmt(state.coins);

  const rente = renteTotale();
  $('rente').hidden = !rente;
  if (rente) setText($('rente'), '+' + fmtRente(rente) + ' / s');

  for (const s of subjects()) {
    const t = thumbs.get(s.key);
    if (!t) continue;
    t.el.setAttribute('aria-current', String(s.key === state.sel));
    if (s.kind === 'egg') {
      const ready = s.slot && s.slot.p >= hatchTime(s.slot);
      setWidth(t.bar, s.slot ? Math.min(100, (s.slot.p / hatchTime(s.slot)) * 100).toFixed(1) + '%' : '0%');
      t.el.classList.toggle('done', !!ready);
      if (s.slot) setText(t.tag, ready ? 'prêt' : 'œuf');
    } else {
      /* La vignette montre le niveau et la distance à la maturité — c'est-à-dire à la
         décision. Tout passe par les setters mémorisés : rien ne touche au DOM tant que
         rien n'a bougé, ce qui permet de suivre cent niveaux sans reconstruire la bande. */
      const mur = estMur(s.c);
      setWidth(t.bar, (bandRatio(s.c) * 100).toFixed(1) + '%');
      t.el.classList.toggle('done', mur);
      /* « 7/15 » plutôt que « niv. 7 » : le même idiome que la colonne NIVEAU de la scène,
         et le plafond de l'âge — donc la distance à la maturité — tient dans le même espace
         que le mot « niv. » qu'il remplace. */
      setText(t.tag, niveau(s.c) + '/' + (nivBase(s.c.age) + nivDansAge(s.c.age)) +
                     (estFinie(s.c) ? ' ✹' : mur ? ' ✦' : ''));
      t.el.classList.toggle('finie', estFinie(s.c));
      setFont(t.glyph, (0.9 + 0.75 * Math.min(2.25, visualScale(s.c))).toFixed(2) + 'rem');
    }
  }

  /* Le bouton n'apparaît qu'avec un jeton en poche, et il ne presse RIEN : il a le
     même gris que les outils, il ne clignote pas, il n'expire pas. Ascensionner est un
     sacrifice qu'on choisit — on perd sa ferme entière — et un bouton qui réclame ferait
     croire à une étape obligatoire. Son infobulle dit ce qui l'a ouvert, et qu'on peut
     l'ignorer. */
  /* IL LISAIT `jetonsDus`, LE CRÉDIT DU CYCLE, ET NON LA BOURSE. Deux conséquences, et la
     seconde remettait debout le mur qu'on avait abattu : le bouton annonçait un nombre qui
     ignore ce qui reste des cycles passés, et il DISPARAISSAIT quand le cycle en cours n'avait
     rien crédité — donc juste après un saut, quand `sommet` repart de zéro. On pouvait avoir
     quatre jetons en poche, le droit de sauter, et aucun bouton.

     Ce qui décide de la porte, c'est `peutAscensionner` et lui seul. Le nombre montré est ce
     qu'on a EN MAIN, puisque c'est lui qui achète les cartes. */
  const jetons = jetonsEnMain();
  $('btn-asc').hidden = !peutAscensionner();
  if (!$('btn-asc').hidden) {
    setText($('btn-asc'), 'Ascension' + (jetons ? ' · ' + jetons : ''));
    $('btn-asc').title = (jetons ? jetons + ' jeton' + (jetons > 1 ? 's' : '') + ' en bourse — '
                                 : 'Bourse vide, et ce n’est pas un obstacle — ') +
      'tu peux sauter quand tu veux, ou jamais.';
  }

  /* Le panneau s'ouvre quand la première prime est à portée, comme la boutique : voir une
     chose hors de prix fait avancer un joueur d'idle, ne rien voir du tout ne fait rien. */
  /* ── LA GRILLE NE MONTRE QUE LES CINQ PROCHAINES ────────────────────────────
     Trente-six cases affichées d'un bloc, c'est un mur : les premières sont prises depuis
     longtemps et ne décident plus de rien, les dernières coûtent des milliards et ne décident
     pas encore. Ce qui compte tient toujours dans les cinq suivantes.

     C'est la même idée que « la marche suivante » de la boutique, poussée d'un cran : on ne
     montre pas tout ce qui existe, on montre ce sur quoi porte la prochaine décision.

     CE QUI EST PRIS N'EST PAS PERDU — le bouton du bandeau bascule la grille sur les primes
     déjà achetées. C'est une consultation, pas un choix : on va y relire ce qu'on a, jamais
     décider quoi que ce soit. D'où le bouton plutôt qu'une seconde grille toujours ouverte. */
  /* UN CARREFOUR EST « FAIT » quand une de ses routes est prise, jamais par sa propre clé :
     l'option retenue est rangée sous SA clé à elle, pour que tout le jeu continue de lire
     `prime('...')` sans rien savoir des carrefours. */
  const prises = PRIMES.filter(primeFaite);
  const aPrendre = PRIMES.filter(p => !primeFaite(p) && (!p.si || p.si()));
  // plus rien à prendre : la grille bascule d'elle-même sur ce qu'on a, sinon elle serait vide
  const versPrises = primesPrises || !aPrendre.length;
  const montrees = new Set((versPrises ? prises : aPrendre.slice(0, PRIMES_VUES)).map(p => p.cle));

  $('panel-primes').hidden = state.tuto && !prises.length &&
                             state.coins < PRIMES[0].prix * SEUIL_VOIR;
  setText($('primes-meta'), prises.length + ' / ' + PRIMES.length);

  const bouton = $('primes-voir');
  bouton.hidden = !prises.length;
  bouton.setAttribute('aria-pressed', String(versPrises));
  setText(bouton, versPrises ? 'les prochaines' : 'voir les ' + prises.length + ' prises');
  bouton.title = versPrises ? 'Revenir aux primes qui restent à prendre'
                            : 'Voir les primes déjà achetées';
  setText($('primes-vide'), versPrises ? 'Rien de pris pour l’instant.'
                                      : 'Tout est pris. La ferme n’a plus rien à t’offrir.');
  $('primes-vide').hidden = versPrises ? !!prises.length : !!aPrendre.length;

  for (const p of PRIMES) {
    const r = refs.primes[p.cle], pris = primeFaite(p);
    r.el.hidden = !montrees.has(p.cle);
    r.el.classList.toggle('prise', pris);
    r.el.classList.toggle('prete', !pris && state.coins >= p.prix);
    /* UNE PRIME TENUE PAR LA CONSTELLATION SE DIT. Elle sort d'elle-même de « ce qui reste à
       prendre » — `prime()` la donne pour acquise, donc elle n'occupe plus une des cinq cases,
       ce qui était toute la question. Mais elle ressemblerait sinon à une prime achetée, et le
       joueur ne saurait pas pourquoi elle est là dès la première seconde du cycle. */
    /* La case d'un carrefour porte le NOM DE LA ROUTE une fois choisie : « Le premier
       carrefour » ne dirait plus rien, et c'est justement ce qu'on veut relire plus tard. */
    if (p.choix) {
      const o = choixPris(p);
      setText(r.el.querySelector('.prime-nom'), o ? o.nom : p.nom);
      setText(r.el.querySelector('.prime-glyphe'), o ? o.glyphe : p.glyphe);
    }
    r.el.disabled = pris || state.coins < p.prix;
  }

  /* LA RANGÉE DE FAVEUR. Elle dit le prix et rien d'autre : les trois cartes sont derrière le
     clic, parce qu'une rangée qui les résumerait ferait choisir sans les lire. */
  const mise = $('faveur-mise');
  mise.hidden = !faveursOuvertes();
  if (!mise.hidden) {
    const prix = prixFaveur();
    mise.disabled = state.coins < prix;
    setText(mise, '❖ Une faveur — ' + fmt(prix) +
                  (faveursPris() ? '  ·  ' + faveursPris() + ' prise' + (faveursPris() > 1 ? 's' : '') : ''));
    mise.title = 'Trois cartes tirées au sort, une seule à prendre. Le tirage ne change qu’en prenant.';
  }

  const stock = totalEggs();
  /* LE COMPTEUR D'ENCLOS COMPTE LES BÊTES CONFIÉES, puisqu'elles occupent leur case. Sans
     cette mention, la pension ferait disparaître des bêtes ET des places sans rien dire, et le
     joueur chercherait longtemps où sont passés ses enclos. */
  const parquees = state.pen.filter(c => enPension(c)).length;
  setText($('compte-pen'), penUsed() + ' / ' + pensTotal() +
    (parquees ? ' · ' + parquees + ' en pension' : ''));
  setText($('compte-incub'), state.incubators + (state.incubators > 1 ? ' incubateurs' : ' incubateur'));
  // La réserve n'existe que si on a acheté des œufs d'avance : pas de ligne vide sinon.
  $('strip-meta').hidden = !stock;
  if (stock) setText($('strip-meta'), reserveDite());

  /* LA MARCHE SUIVANTE, ÉTEINTE. On affiche tout ce qui est dévoilé, plus le PREMIER achat
     qui ne l'est pas — grisé, avec son prix, sans sa description. Ce qui vient après lui
     n'existe pas encore à l'écran. Deux marches suivantes : une par liste, sinon la boutique
     et les améliorations se voleraient l'unique repère. */
  const marche = { shop: null, up: null };
  for (const cle of CLES_VOIR) {
    if (estDevoile(cle)) continue;
    const ou = cle.startsWith('up:') ? 'up' : 'shop';
    if (!marche[ou]) marche[ou] = cle;
  }

  for (const key of Object.keys(refs.shop)) {
    const r = refs.shop[key];
    const verrou = !estDevoile(key);
    r.li.hidden = verrou && marche.shop !== key;
    r.el.classList.toggle('verrou', verrou);
    if (r.li.hidden) continue;
    const cost = r.cost();
    setText(r.price, fmt(cost));
    r.el.disabled = verrou || state.coins < cost;
    /* CE QU'UN ŒUF RACONTE NE SE RACONTE QU'UNE FOIS. « C'est par là que tout le monde
       commence » est une jolie phrase, et elle occupe une ligne de la colonne pour toujours.
       Elle passe à l'infobulle ; la rangée d'un œuf tient alors sur une seule ligne — le nom,
       ce qu'on en a, le prix — et se lit d'un coup d'œil au lieu de se lire. */
    if (r.reserve) {
      const n = r.stock ? eggStock(r.stock) : 0;
      setText(r.reserve, n ? '×' + n : '');
    }
    setText(r.desc, verrou ? 'Bientôt.' : r.stock ? '' : r.base);
    r.el.title = r.base;
  }

  for (const u of UPGRADES) {
    const r = refs.up[u.key];
    const verrou = !estDevoile('up:' + u.key);
    r.li.hidden = verrou && marche.up !== 'up:' + u.key;
    r.el.classList.toggle('verrou', verrou);
    if (r.li.hidden) continue;
    const n = lvl(u.key), maxed = upMaxed(u);
    /* `vise` est ce que le bouton achèterait ; `montre` ce qu'il affiche. Les deux ne
       coïncident pas quand `max` n'a pas les moyens d'un seul niveau : on montre alors le
       prix du prochain, sans quoi le bouton annoncerait « 0 » et n'apprendrait rien. */
    const vise = maxed ? 0 : paliersVises(u);
    const montre = Math.max(1, vise);
    const cout = coutPaliers(u, montre);
    r.el.classList.toggle('owned', n > 0);
    setText(r.title, u.name + (n > 0 && u.max !== 1 ? ' · niv. ' + n : '') +
                     (montre > 1 ? ' → ' + (n + montre) : ''));
    setText(r.price, maxed ? 'acquis' : fmt(cout));
    setText(r.desc, verrou ? 'Bientôt.' : upLabel(u, montre));
    r.el.disabled = verrou || maxed || !vise || state.coins < coutPaliers(u, vise);
  }


  /* Le réglage de taille n'apparaît qu'avec une mangeoire. Sans automate qui engraisse, la
     notion n'a rien à faire à l'écran : la vente doit rester la chose la plus simple du jeu,
     surtout au début, et une condition de taille qu'on ne peut pas remplir engorge l'enclos. */
  $('cond-taille').hidden = !lvl('mangeoire');
  /* LES CONSIGNES D'UN RANG SECRET SE CACHENT AVEC LUI. Trois menus qui disent « les
     merveilleuses » à quelqu'un qui n'en a jamais vu, c'est le rang annoncé par la porte de
     service. Ils reviennent seuls à la première éclosion, réglés sur « jamais » comme le
     reste — et une consigne cachée ne gouverne rien, puisqu'elle vaut zéro. */
  for (const cle of Object.keys(RARITY)) {
    if (!RARITY[cle].secret) continue;
    const cache = !rareteConnue(cle);
    // la rangée entière — son intitulé, son segment et sa phrase — disparaît d'un bloc
    for (const quoi of ['vente', 'taille', 'evolution']) $(quoi + '-' + cle + '-r').hidden = cache;
  }
  $('cfg-marchand').hidden = !prime('marchand');
  $('cfg-evolution').hidden = !prime('evolution');
  $('cfg-acheteur').hidden = !prime('acheteur');
  $('panel-reglages').hidden = !prime('marchand') && !prime('evolution') && !prime('acheteur');

}

/* Le bandeau des notes. Il ne remplace jamais une note non lue par une autre : si le joueur
   n'a pas encore chassé la précédente, la nouvelle attend — elle est déjà marquée lue dans
   l'état, donc rien ne se perd, mais on ne lui écrase pas son texte sous les yeux. */
/* La scène décrite par `state.dial`, ou null si elle ne veut plus rien dire. */
const scene = () => state.dial && NOTES.find(n => n.cle === state.dial.cle) || null;

// Une réplique est une chaîne ou un objet : ici, toujours un objet.
const ligne = (n, i) => {
  const l = n.repliques[Math.min(i, n.repliques.length - 1)];
  return typeof l === 'string' ? { dit: l } : l;
};

/* Fait avancer la scène tant que la réplique courante demande une action DÉJÀ FAITE. C'est ce
   qui permet à « clique sur l'œuf » de disparaître au moment où l'on clique, sans rien
   demander de plus — et à un rechargement de ne pas rejouer une consigne déjà exécutée.

   La boucle est bornée : une condition mal écrite ferait défiler la scène entière, pas geler
   la page. */
function avanceSeule() {
  let garde = 0;
  while (state.dial && garde++ < 40) {
    const n = scene();
    if (!n) { state.dial = null; return; }
    // ce dont elle parlait n'existe plus : on ferme, où qu'on en soit
    let mort = false;
    try { mort = !!(n.perime && n.perime()); } catch (e) { mort = false; }
    if (mort) { state.vu[n.cle] = true; state.dial = null; return; }
    const l = ligne(n, state.dial.i);
    let ok = false;
    try { ok = !!(l.fait && l.fait()); } catch (e) { ok = false; }
    if (!ok) return;
    if (state.dial.i + 1 >= n.repliques.length) { state.vu[n.cle] = true; state.dial = null; }
    else state.dial.i++;
  }
}

/* Avance d'une réplique. À la dernière, la scène se ferme et n'est marquée jouée QU'ICI :
   tant qu'elle n'est pas allée au bout, elle peut reprendre après un rechargement. */
function replique(saut) {
  const n = scene();
  if (!n) { state.dial = null; return; }
  // une réplique qui tient n'avance QUE par l'action — la croix n'y peut rien non plus
  if (ligne(n, state.dial.i).tient) return;
  if (saut || state.dial.i + 1 >= n.repliques.length) {
    state.vu[n.cle] = true;
    state.dial = null;
  } else {
    state.dial.i++;
  }
  refresh();
  save();
}

function renderTuto() {
  const boite = $('dial');

  // une scène en cours occupe la boîte ; sinon on demande la suivante
  if (!state.dial) {
    const n = suivreTuto(true);
    if (n) state.dial = { cle: n.cle, i: 0 };
  } else {
    suivreTuto(false);            // le dévoilement continue pendant qu'elle parle
  }

  avanceSeule();

  const n = scene();
  if (n && state.tuto) {
    const i = Math.min(state.dial.i, n.repliques.length - 1);
    const l = ligne(n, i);
    setCreature($('dial-face'), PROF.portrait, PROF.glyphe);
    setText($('dial-nom'), PROF.nom);
    setText($('dial-dit'), l.dit);
    setText($('dial-suite'), l.tient ? '●' : i + 1 < n.repliques.length ? '▸' : '✓');
    $('dial-boite').classList.toggle('tient', !!l.tient);
    // la croix disparaît : rien ne doit laisser croire qu'on peut passer outre
    $('dial-passer').hidden = !!l.tient;
    boite.hidden = false;
  } else {
    boite.hidden = true;
  }

  /* LA VUE DE L'ŒUF. Avant la toute première éclosion, l'écran ne montre que l'œuf : pas de
     bande, pas de colonne latérale. On n'a alors rien à désigner du doigt, puisqu'il n'y a
     qu'une chose à faire — la contrainte enseigne mieux qu'une consigne, et l'ouverture de
     l'écran à l'éclosion est la première récompense du jeu.

     La condition est `seen` : elle dit si une forme a DÉJÀ été rencontrée, elle survit à
     l'ascension, et elle ne peut pas revenir en arrière. */
  /* L'ÉCRAN S'ÉTEINT PENDANT QU'ELLE TIENT. Tout devient inerte sauf le sujet — l'œuf ou la
     bête qu'elle demande de toucher — et le bouton 📖, qui est la seule sortie. */
  const n2 = scene();
  const tenu = !!(n2 && state.tuto && ligne(n2, Math.min(state.dial.i, n2.repliques.length - 1)).tient);
  document.body.classList.toggle('tenu', tenu);

  document.body.classList.toggle('debut', state.tuto && !seenCount());

  /* ── CE QUI N'A PAS ENCORE DE SENS NE S'AFFICHE PAS ────────────────────────
     La vue de l'œuf tombe à la première éclosion, et tout le reste arrivait d'un coup : trois
     boutons de tri pour une seule bête, une encyclopédie de trente fiches vides, une ligne de boosts
     qui annonce « rien sans toi » pendant que la professeure vient de le dire, et un pied de
     page sur la sauvegarde locale. Beaucoup de détails, aucun utilisable.

     Chacun attend le moment où il commence à vouloir dire quelque chose. Tout se lève d'un
     coup si l'on éteint le mode histoire. */
  const jeune = state.tuto;

  // trier n'a de sens qu'à partir de deux enclos
  $('strip-tri').hidden = jeune && state.pens <= 1;

  // les compteurs « 1 / 1 » et « 1 incubateur » ne comptent rien
  $('compte-pen').hidden = jeune && state.pens <= 1;
  $('compte-incub').hidden = jeune && state.incubators <= 1;

  /* La ligne des boosts détaille des multiplicateurs qu'on n'a pas. Elle apparaît avec le
     premier automate — c'est-à-dire au moment exact où elle a quelque chose à multiplier. */
  $('stage-boost').hidden = jeune && !lvl('couveuse') && !lvl('eleveur') && !lvl('mangeoire');

  /* L'ONGLET DE L'ENCYCLOPÉDIE MONTRE L'ÉCHELLE DU JEU — trente lignées dont une rencontrée —
     et c'est sa valeur. Mais à la première seconde il n'ouvre que sur du vide : on attend
     d'avoir croisé de quoi voir une progression. Et s'il disparaît sous les pieds du joueur,
     on le ramène à sa ferme plutôt que de le laisser sur une page qui n'existe plus. */
  const dexPret = !jeune || seenCount() >= 3;
  /* LA FORGE N'EXISTE PAS AVANT LA PREMIÈRE CARTE. Elle ne s'achète pas — c'est un atelier,
     pas un bâtiment — mais elle suit la même règle que tout le reste : on ne montre pas la
     porte d'une pièce vide. La première ascension l'ouvre. */
  const forgePret = state.album.length > 0;
  /* LA CONSTELLATION S'OUVRE AVEC LE PREMIER JETON, et pas avec la première ascension : on
     gagne des jetons AVANT de sauter, et c'est justement en les voyant qu'on comprend qu'il y
     a deux façons de les dépenser. */
  const cielPret = jetonsEnMain() > 0 || Object.keys(state.ciel || {}).length > 0;
  for (const b of document.querySelectorAll('.onglet')) {
    if (b.dataset.vue === 'dex') b.hidden = !dexPret;
    if (b.dataset.vue === 'forge') b.hidden = !forgePret;
    if (b.dataset.vue === 'ciel') b.hidden = !cielPret;
  }
  if (!dexPret && vue === 'dex') ouvrirVue('ferme');
  if (!forgePret && vue === 'forge') ouvrirVue('ferme');
  if (!cielPret && vue === 'ciel') ouvrirVue('ferme');

  // le pied de page parle du prototype, pas du jeu : il attend qu'on ait de quoi acheter
  $('foot').hidden = jeune && !estDevoile('egg-commun');
}

function refresh() {
  renderTuto();
  renderStrip();
  renderCollection();
  renderAlbum();
  renderForge();
  renderCiel();
  renderStage();
  syncReglages();
  renderEncyclopedie();
  renderPension();
  syncPanneaux();
  tickView();
  if (popNext) { popNext = false; flash($('subject'), 'pop'); }
}

/* ─────────────────────────────────────────────
   La pension — squelette
   ───────────────────────────────────────────── */

/* Toutes les fonctions de cette section sont écrites et vérifiées, et AUCUNE n'est appelée
   par le jeu. Elles décrivent la forme du socle, pas encore son comportement. */

/* LES PANNEAUX SE REPLIENT TOUS. Sur un portable — 768 pixels de haut — la colonne latérale
   fait trois écrans à elle seule : boutique, améliorations, les primes, pension, réglages,
   album. Aucune compaction ne rattrape ça, parce que le problème n'est pas la
   densité mais le NOMBRE de choses affichées en même temps.

   Fermer ce qu'on ne regarde pas est la seule réponse qui tienne à toutes les tailles d'écran,
   et elle a un second mérite : c'est le joueur qui décide, pas un point de rupture. */
const PANNEAUX = ['boutique', 'autos', 'primes', 'pension', 'reglages', 'album'];

function syncPanneaux() {
  for (const cle of PANNEAUX) {
    const p = $('panel-' + cle);
    p.classList.toggle('plie', estPlie(cle));
    const b = p.querySelector('.panel-plier');
    if (b) {
      setText(b.querySelector('.plier'), estPlie(cle) ? '▸' : '▾');
      b.setAttribute('aria-expanded', String(!estPlie(cle)));
    }
  }
}

const couples    = () => (state.pension && state.pension.couples) || [];
// le second nid s'ajoute au compte de base : la prime ne remplace pas la place, elle en pose une
/* CE QUE LA PENSION DEVIENT QUAND ON Y MET TOUT. Trois échelles, et chacune se lit comme
   un palier remplaçant le précédent — jamais comme une somme : « quatre fois plus vite »
   veut dire quatre fois plus vite qu'à l'origine, pas quatre fois plus que le cran d'avant.
   C'est la seule façon d'annoncer un multiplicateur sans que le joueur ait à multiplier.

   L'ÉCHELLE EST CE QUI PERMET À LA PENSION DE CONCURRENCER L'ACHETEUR. Nue, elle rend un œuf
   toutes les seize heures ; complète, huit couples pondent cinq œufs toutes les quatre-vingts
   minutes. Sur du commun elle dépasse largement ce qu'une boutique peut servir, et elle le
   fait GRATUITEMENT — ce qu'elle coûte, ce sont seize enclos qui ne rapportent plus rien, et
   c'est la seule monnaie qui manque vraiment à ce stade.

   Sur du mythique elle reste loin derrière, et c'est voulu : la durée se multiplie par la
   richesse du couple, et c'est ce multiplicateur qui empêche la pension de redevenir
   l'imprimante à billets qu'elle était sur le papier avant la 3.0.0. */
const echelle = (paliers, prefixe) => {
  let v = paliers[0];
  for (let i = 1; i < paliers.length; i++) if (prime(prefixe + i)) v = paliers[i];
  return v;
};
/* ── LA PENSION MONTE D'UN CRAN ENTIER, ET ELLE MONTE DANS LA CONSTELLATION ────
   Douze primes la réglaient — trois de places, trois de portée, trois de vitesse, deux de
   richesse, une de sang — et elles occupaient les DIX DERNIÈRES MARCHES de l'escalier des
   primes. Arrivé là, il n'y avait plus rien à acheter qui ne soit de la pension, et plus rien
   à viser : une liste de cinquante et un achats qui se termine sur une monoculture.

   Elles sont maintenant les quatre nœuds de l'axe pension, et chaque nœud lève LES QUATRE
   CADRANS D'UN CRAN. C'est aussi ce que le bâtiment raconte mieux : on n'achète pas un nid,
   puis une couveuse, puis un régime — on agrandit la pension.

       cran        places   portée   vitesse   richesse
       aucun          1        1        ×1        ×1
       1er nœud       2        2       ×1,5       ×1
       2e             4        3        ×4        ×4
       3e             8        5       ×12        ×8      (et le sang dominant)
       4e             9        6       ×18       ×16

   Le plafond ne bouge pas d'un cran : c'est exactement ce que les douze primes et les quatre
   nœuds donnaient ensemble. Ce qui change est la MONNAIE et la PERMANENCE.

   ── CE QUE ÇA RENVERSE, ET IL FAUT L'ÉCRIRE ──
   La `4.5.0` avait posé l'inverse, et le commentaire de `CIEL` le disait ainsi : « une
   constellation qui possède un pan de jeu — même seulement pour le rendre permanent — le
   déplace hors de la partie où il appartient, et fait dépendre d'une ascension ce qui doit
   soulager AVANT la première ». La règle valait pour l'automatisation, qui doit être là dès la
   première boucle sinon l'heure d'ouverture se joue au poignet.

   ELLE NE VAUT PAS POUR LA PENSION, et c'est la décision du 5 septembre 2026 : la pension
   n'est pas ce qui soulage la première heure, c'est ce qu'on fait QUAND on n'a plus rien à
   acheter. Le bâtiment lui-même reste une prime en pièces — il s'ouvre donc dans le premier
   cycle, comme avant. Ce qui monte, c'est son escalade.

   Le prix en jetons n'a pas bougé — 6, 12, 20, 30 — alors que chaque nœud porte trois fois
   plus qu'avant. C'est un réglage à part, et un seul chiffre à tourner le jour où la mesure
   dira que la pension s'ouvre trop vite. */
const rangPension = () => ['nid-plus', 'ponte-plus', 'sang-epais', 'nid-vif']
                          .filter(etoilePrise).length;

const cranPension = paliers => paliers[Math.min(rangPension(), paliers.length - 1)];

const placesPension  = () => cranPension([1, 2, 4, 8, 9]);
const vitessePension = () => cranPension([1, 1.5, 4, 12, 18]);
const porteePension  = () => cranPension([1, 2, 3, 5, 6]);
/* LA RICHESSE, ET POURQUOI ELLE SE DESSERRE SANS SE LEVER. Le multiplicateur de rareté — ×64
   pour deux mythiques — est ce qui empêche la pension d'être une imprimante à billets, et
   c'était mesuré avant de l'ouvrir. Mais c'est aussi ce qui la laissait à trente œufs
   mythiques l'heure quand la boutique en sert des milliers.

   On le divise, on ne le supprime pas. À huit, deux mythiques couvent en dix minutes : la
   pension rend alors 240 œufs mythiques l'heure, contre 480 pour un acheteur de douze
   incubateurs. Elle devient un vrai choix. Le compte reste perdant — 43 Md/h de valeur
   produite contre 396 Md/h de rente abandonnée par seize enclos — et c'est ce qui tient. */
const richessePension = () => cranPension([1, 1, 4, 8, 16]);

/* CE QUE LES PRIMES CHANGENT À LA PENSION.

   La VITESSE s'applique à la durée au moment où le couple se forme, et pas après : un couple
   déjà parti garde la sienne, écrite dans `duree`. Acheter un nid plus chaud ne doit pas
   rattraper une attente commencée — sinon la prime devient un bouton « finis ma couvaison »,
   ce qui est une autre chose, et une moins bonne.

   Le SANG double la chance que la lignée du parent le plus rare l'emporte, sans jamais
   dépasser une fois sur deux : au-delà, le parent le moins rare cesserait d'être celui qui
   sort d'habitude, et c'est sur lui que repose le multiplicateur de durée.

   AUCUNE NE TOUCHE AUX RECETTES. Une prime qui ferait tomber les merveilles plus souvent
   devrait le dire pour se vendre, et dirait donc qu'elles existent. La vitesse et les places
   les servent quand même, par la bande — plus de pontes dans le même temps. LA PORTÉE, ELLE,
   NE LES SERT PAS : le tirage se fait par PONTE et non par œuf, parce qu'une nichée est un
   événement et non cinq. Sans cette règle, la dernière prime du jeu multiplierait par cinq la
   chance de toutes les merveilles d'un coup. */
const chancePension = ecart =>
  Math.min(0.5, PENSION_CHANCE[Math.min(ecart, PENSION_CHANCE.length - 1)] *
                (rangPension() >= 3 ? 2 : 1));

// Une bête parquée : elle est dans un couple, donc dans la pension.
const enPension  = c => couples().some(k => k.a === c.id || k.b === c.id);

const etiqDe = c => ETIQUETTES[lineOf(c).key] || ['terre', 'nu'];

/* LA DISTANCE : deux moins ce qu'elles ont en commun. Zéro quand tout concorde, deux quand
   rien ne concorde, et `null` quand la pierre est d'un seul côté — le golem ne se croise pas. */
function distanceDe(a, b) {
  const A = etiqDe(a), B = etiqDe(b);
  if ((A[1] === 'pierre') !== (B[1] === 'pierre')) return null;
  return 2 - (A[0] === B[0] ? 1 : 0) - (A[1] === B[1] ? 1 : 0);
}

const ecartRarete = (a, b) =>
  Math.abs(RARITY[lineOf(a).rarity].rank - RARITY[lineOf(b).rarity].rank);
// la rareté du parent le MOINS rare : c'est sa lignée qui sort presque toujours
const rareteBasse = (a, b) =>
  RARITY[lineOf(a).rarity].rank <= RARITY[lineOf(b).rarity].rank ? lineOf(a).rarity : lineOf(b).rarity;

// Ce que coûte l'attente. Bornée : au-delà du plafond, le couple est refusé plutôt que subi.
function dureePension(a, b) {
  const rec = recetteDe(a, b);
  if (rec) return Math.round(rec.duree / vitessePension());
  const d = distanceDe(a, b);
  if (d === null) return null;
  // la richesse se desserre mais ne descend jamais sous un : sinon les communes iraient plus
  // vite que la boucle de jeu, et le plafond de réserve serait le seul reste du système
  const riche = Math.max(1, PENSION_MULT[rareteBasse(a, b)] / richessePension());
  return Math.round((PENSION.base + PENSION.parDistance * d + PENSION.parRarete * ecartRarete(a, b))
                    * riche / vitessePension());
}

/* Pourquoi ce couple ne peut pas se former — une phrase, ou null s'il le peut. Rendre la
   RAISON et non un booléen : un bouton grisé sans explication est la première chose qu'un
   joueur ne comprend pas, et cette fonction est ce que l'écran affichera. */
function refusPension(a, b) {
  if (!prime('pension')) return 'La pension n’est pas encore construite.';
  if (!a || !b || a.id === b.id) return 'Il faut deux bêtes différentes.';
  if (couples().length >= placesPension()) return 'Toutes les places sont prises.';
  if (enPension(a) || enPension(b)) return 'Une de ces deux bêtes est déjà en pension.';
  if (a.age < PENSION.ageMin || b.age < PENSION.ageMin)
    return 'Il faut deux bêtes d’au moins l’âge ' + AGES[PENSION.ageMin - 1].nom + '.';
  if (distanceDe(a, b) === null) return 'On ne croise pas la pierre.';
  if (dureePension(a, b) > PENSION.plafond) return 'Ces deux-là mettraient trop longtemps.';
  return null;
}
const peutAccoupler = (a, b) => refusPension(a, b) === null;

/* Parque deux bêtes. Elles NE QUITTENT PAS L'ENCLOS : elles gardent leur case et cessent de
   rapporter, ce qui est tout le prix de l'opération. */
function accoupler(a, b) {
  if (!peutAccoupler(a, b)) return false;
  state.pension.couples.push({ a: a.id, b: b.id, t: 0, duree: dureePension(a, b) });
  return true;
}

/* CE QUI SORT DU COUPLE. L'enfant prend la LIGNÉE d'un des deux parents — celle du moins rare
   presque toujours, celle du plus rare selon la chance de son écart. Il ne prend rien d'autre :
   teinte, tempérament et motif se tirent comme pour n'importe quel œuf, et c'est ce qui reste
   à écrire avec l'hérédité.

   On rend la LIGNÉE et non la sorte d'œuf, parce que la pension sert justement à VISER une
   lignée précise — sans les merveilleuses, c'est tout ce qu'elle a d'unique. */
/* CE QUE DEUX JOKERS DONNENT : n'importe quoi, SAUF un joker. « Deux chimères ne font jamais
   une chimère » est une règle qui tient en six mots, et c'est la chose la plus chimérique
   qu'elles puissent faire.

   DE LA PLUS COMMUNE DES BÊTES JUSQU'À UNE MERVEILLE. Le sac s'ouvre sur le rang secret une
   fois sur cinquante — assez bas pour que ça n'arrive jamais quand on l'attend, assez haut
   pour que ça finisse par arriver. Deux mythiques immobilisées seize heures est le couple le
   plus cher du jeu ; il n'aurait aucun sens qu'il ne puisse rendre que du crapaud.

   LA ROUTE RESTE PIRE QUE N'IMPORTE QUELLE RECETTE, et c'est la condition pour que les
   recettes gardent un sens : 0,031 %/h par le joker contre 0,083 pour la Kitsune et 0,100
   pour Wukong. On ne CHASSE pas une merveille aux chimères, on en trouve une.

   LA TARASQUE FAIT EXCEPTION : elle prend la moitié du sac secret à elle seule, parce que
   c'est sa seule porte. Elle est la fille des chimères, et rien d'autre ne la donne. */
const JOKER_MERVEILLE = 0.02;
const poolJoker = LINES.filter(l => !RARITY[l.rarity].secret && !l.joker);
const poolSecret = LINES.filter(l => RARITY[l.rarity].secret);
const EXCLUSIVE_JOKER = 'tarasque';

function ligneeAuHasard() {
  if (Math.random() < JOKER_MERVEILLE) {
    // une fois sur deux la Tarasque, sinon l'une des autres merveilles au hasard
    if (Math.random() < 0.5) return EXCLUSIVE_JOKER;
    const autres = poolSecret.filter(l => l.key !== EXCLUSIVE_JOKER);
    if (autres.length) return autres[Math.floor(Math.random() * autres.length)].key;
    return EXCLUSIVE_JOKER;
  }
  return poolJoker[Math.floor(Math.random() * poolJoker.length)].key;
}
const couple2Jokers = (a, b) => !!(a && b && lineOf(a).joker && lineOf(b).joker);

function ligneeDe(a, b) {
  if (couple2Jokers(a, b)) return ligneeAuHasard();
  const haut = RARITY[lineOf(a).rarity].rank >= RARITY[lineOf(b).rarity].rank ? a : b;
  const bas  = haut === a ? b : a;
  return (Math.random() < chancePension(ecartRarete(a, b)) ? haut : bas).line;
}

/* LA CHANCE QU'AVAIT CE RÉSULTAT-LÀ, pour ce couple-là. C'est ce que l'encyclopédie affiche
   sous un couple appris, et c'est calculé et non stocké : une prime achetée après coup ne
   doit pas laisser dans le carnet un nombre qui n'est plus vrai.

   Elle DOUBLE la logique de `ligneeDe` et de `ligneeAuHasard`, ce qui est le vrai risque de
   cette fonction : les deux peuvent diverger en silence. Un scénario du banc tire donc dix
   mille pontes et compare la fréquence observée à ce que celle-ci annonce, pour chaque forme
   de couple — ordinaire, joker, recette. C'est la seule garde qui tienne. */
const stubLignee = k => ({ line: k });
function chanceDe(x, y, resultat) {
  const a = stubLignee(x), b = stubLignee(y);
  const rec = recetteDe(a, b);
  if (rec && rec.donne === resultat) return rec.chance;
  const reste = rec ? 1 - rec.chance : 1;   // ce qui n'est pas la merveille se partage le reste

  if (couple2Jokers(a, b)) {
    if (!RARITY[LINE_BY_KEY[resultat].rarity].secret)
      return reste * (1 - JOKER_MERVEILLE) / poolJoker.length;
    const autres = poolSecret.length - 1;
    return reste * JOKER_MERVEILLE *
           (resultat === EXCLUSIVE_JOKER ? 0.5 : autres > 0 ? 0.5 / autres : 0.5);
  }
  if (x === y) return reste;
  const haut = RARITY[LINE_BY_KEY[x].rarity].rank >= RARITY[LINE_BY_KEY[y].rarity].rank ? x : y;
  const c = chancePension(ecartRarete(a, b));
  return reste * (resultat === haut ? c : 1 - c);
}

// La sorte d'œuf que cette lignée demande, pour la réserve.
const sorteDe = ligne => {
  const r = LINE_BY_KEY[ligne].rarity;
  return (EGG_KINDS.find(e => e.rarity === r) || EGG_BY_KEY.commun).key;
};

/* Fait avancer les couples. Un couple arrivé au bout dépose son œuf dans la réserve et libère
   ses parents. Appelée par `advance`, donc elle tourne aussi pendant une absence : une
   couvaison est une attente et non un geste. */
/* Un œuf dans la réserve, avec sa lignée promise. Rend false si le plafond est atteint —
   c'est le seul frein de la pension, et il tient parce que la réserve se vide toute seule
   dans les incubateurs libres. */
function pondre(ligne, herite) {
  const sorte = sorteDe(ligne);
  if (eggStock(sorte) >= PLAFOND_OEUFS) return false;
  poserFile(sorte);
  state.eggs[sorte] = eggStock(sorte) + 1;
  state.pension.dus = state.pension.dus || {};
  /* LA FILE PORTAIT UNE CHAÎNE, ELLE PORTE MAINTENANT UN OBJET. Une sauvegarde d'avant en a
     encore de l'ancienne forme : `tireLigne` accepte les deux, et une chaîne veut dire « une
     lignée promise, sans héritage » — ce qui est exactement ce que la pension faisait. */
  (state.pension.dus[sorte] = state.pension.dus[sorte] || []).push({ ligne, herite });
  state.pension.nes = (state.pension.nes || 0) + 1;
  state.stats.pension = (state.stats.pension || 0) + 1;
  return true;
}

/* Combien de pontes une absence peut rattraper d'un coup. Le plafond de la réserve borne déjà
   ce qui rentre, mais la boucle, elle, doit se terminer : vingt-quatre heures hors ligne sur
   un couple de deux minutes, c'est sept cents tours pour rien. */
const PONTES_MAX = 200;

/* UN COUPLE DONT UNE SORTIE EST PLEINE EST BLOQUÉ, et il l'est AVANT de tirer.

   C'est le correctif d'un défaut qui a rendu Sun Wukong trivial. Le test de plafond vivait
   après le tirage de recette : un couple bloqué relançait donc sa recette À CHAQUE TOUR DE
   BOUCLE — dix fois par seconde — et comme la merveille a sa PROPRE réserve, jamais pleine,
   elle était la seule chose que le couple pouvait encore pondre. Une réserve d'œufs épiques
   pleine transformait deux golems en machine à sous tournant à dix hertz : mesuré, huit
   Wukong en une minute là où la médiane est de dix-neuf heures.

   La leçon générale, et elle vaut pour tout ce qui viendra : **un tirage ne doit jamais avoir
   lieu dans une branche qui ne peut pas aboutir.** Le hasard consommé pour rien n'est pas
   neutre quand une seule de ses issues, elle, aboutit.

   ON BLOQUE SUR L'UNE DES DEUX SORTIES, pas sur les deux. Un couple de raretés différentes a
   deux sorties possibles ; s'arrêter dès que l'une déborde est plus simple à raconter — « un
   couple attend que sa réserve se vide » — et c'est le seul choix qui garantisse qu'un couple
   bloqué reste bloqué. */
const sortesDe = (a, b) => [sorteDe(a.line), sorteDe(b.line)];
const reservePleine = (a, b) => sortesDe(a, b).some(s => eggStock(s) >= PLAFOND_OEUFS);

/* Fait avancer les couples.

   LE COUPLE NE SE DÉFAIT PAS QUAND L'ŒUF TOMBE. Il se défaisait, et c'était le geste de trop :
   on venait retirer deux bêtes d'un nid vide, les reposer, revalider — toutes les seize heures,
   pour rien. Un couple confié RESTE confié jusqu'à ce qu'on le rompe soi-même, et la pension
   devient une ligne de production plutôt qu'une commande à repasser.

   Ce que ça change au prix : rien, et c'est ce qui le rend juste. Les deux parents continuent
   de ne pas rapporter, indéfiniment. On ne paie pas la ponte, on paie l'OCCUPATION.

   Appelée par `advance`, donc elle tourne aussi pendant une absence — d'où la boucle. */
function avancePension(dt) {
  if (!prime('pension')) return 0;
  let nes = 0;
  const portee = porteePension();
  state.pension.couples = couples().filter(k => {
    k.t += dt;
    const a = state.pen.find(c => c.id === k.a), b = state.pen.find(c => c.id === k.b);
    // un parent vendu pendant la couvaison annule le couple sans rien rendre
    if (!a || !b) return false;

    let tours = 0;
    while (k.t >= k.duree && tours++ < PONTES_MAX) {
      /* LE PLAFOND SE TESTE AVANT LE TIRAGE. Le couple GARDE sa ponte et attend : la jeter
         punirait une absence, et c'est précisément ce que le plafond doit éviter de faire. */
      if (reservePleine(a, b)) { k.t = k.duree; break; }

      /* LA RECETTE SE TIRE UNE FOIS PAR PONTE, ET NON PAR ŒUF. Une nichée est un événement,
         pas cinq — sans cette règle, la dernière prime du jeu multiplierait par cinq la chance
         de toutes les merveilles d'un coup. */
      const rec = recetteDe(a, b);
      const rare = rec && Math.random() < rec.chance ? rec.donne : null;

      for (let i = 0; i < portee; i++) {
        // la merveille occupe UNE place de la nichée, les autres se tirent normalement
        const ligne = i === 0 && rare ? rare : ligneeDe(a, b);
        if (!pondre(ligne, heritageDe(a, b))) continue;
        nes++;
        // le carnet n'apprend que ce qui est VRAIMENT sorti, jamais ce qui aurait pu sortir
        noterPonte(a, b, ligne);
      }
      k.t -= k.duree;
    }
    return true;
  });
  return nes;
}

/* Rompre un couple. Le seul moyen de récupérer deux parents, et il est délibérément manuel :
   une ferme qui rendrait les bêtes toute seule redemanderait le geste à chaque ponte. */
function romprePension(id) {
  const avant = couples().length;
  state.pension.couples = couples().filter(k => k.a !== id && k.b !== id);
  return couples().length < avant;
}

/* ── LES TROPHÉES ──────────────────────────────────────────────────────────────
   Le jeu comptait sans jamais rien attendre : dix-sept nombres qui montent, et pas un seul
   objectif nommé depuis que les jalons ont laissé la place aux jetons. Un nombre qui monte
   sans que rien ne l'attende reste un nombre.

   UN TROPHÉE NE DONNE JAMAIS DE PUISSANCE. Ni multiplicateur, ni prime, ni pièce. C'est la
   règle qui les sépare des jalons qu'on vient justement de démonter : un trophée qui pèse sur
   l'équilibrage redevient un jalon déguisé, et il faudrait alors le viser plutôt que le
   rencontrer. Ils ne paient qu'en reconnaissance, et c'est assez.

   DEUX SORTES. Ceux qui se voient toujours, décrochés ou non, sont des OBJECTIFS : ils disent
   au joueur où va le jeu, ce que plus rien ne faisait. Ceux qui restent cachés jusqu'à leur
   décrochage sont des SURPRISES : les annoncer les tuerait, puisque leur seul contenu est
   qu'on ne les attendait pas. Le compte « 8 / 12 » s'affiche quand même — savoir qu'il en
   reste ne dit pas lesquels.

   ILS TRAVERSENT L'ASCENSION, comme les compteurs : ils comptent une vie de fichier, pas une
   partie. Un trophée qu'on perdrait en ascensionnant punirait le geste que le jeu demande.

   Chaque test se lit sur l'état, jamais sur un événement : c'est ce qui permet de les vérifier
   dix fois par seconde sans rien mémoriser, et de rattraper ceux qu'une version précédente
   aurait manqués. */
const TROPHEES = [
  // ── les objectifs, toujours visibles ──
  { cle: 'premiere', glyphe: '🥚', montre: true, nom: 'Première éclosion',
    dit: 'Faire éclore un œuf.',
    test: () => state.stats.eclos > 0 },
  { cle: 'naturaliste', glyphe: '📖', montre: true, nom: 'Naturaliste',
    dit: 'Rencontrer cinquante formes différentes.',
    test: () => seenCount() >= 50 },
  { cle: 'legende', glyphe: '✦', montre: true, nom: 'Une légende',
    dit: 'Mener une bête jusqu’au dernier âge.',
    test: () => Object.keys(state.seen || {}).some(k => k.endsWith(':' + AGES.length)) },
  { cle: 'million', glyphe: '🪙', montre: true, nom: 'Le premier million',
    dit: 'Tenir un million de pièces à la fois.',
    test: () => state.stats.fortune >= 1e6 },
  { cle: 'saut', glyphe: '🌀', montre: true, nom: 'Recommencer',
    dit: 'Ascensionner une fois — tout perdre, et garder une carte.',
    test: () => (state.asc.n || 0) > 0 },
  { cle: 'equipe', glyphe: '🃏', montre: true, nom: 'Main pleine',
    dit: 'Équiper cinq cartes en même temps.',
    test: () => (state.slots || []).length >= SLOTS },

  // ── les surprises, invisibles tant qu'on ne les a pas ──
  { cle: 'vaisselle', glyphe: '🍽️', nom: 'La plonge',
    dit: 'Laver sa première assiette. Ça arrive à tout le monde, et à personne deux fois.',
    test: () => (state.stats.assiettes || 0) > 0 },
  /* IL EST DANS LES SURPRISES, ET C'EST TOUT LE PROPOS. Annoncé, il disait la recette
     entière — « aucun œuf n'en donne, il faut la pension et le bon couple » — à quelqu'un qui
     n'avait aucune raison de savoir que la cinquième rareté existe. */
  { cle: 'merveille', glyphe: '✨', nom: 'Une merveille',
    dit: 'Faire naître une merveilleuse. Aucun œuf n’en donne — il faut la pension, et le bon couple.',
    test: () => LINES.some(l => l.rarity === 'merveilleuse' && state.seen[l.key + ':1']) },
  { cle: 'fond', glyphe: '🌌', nom: 'Un décor',
    dit: 'Croiser une bête née avec un fond. Une sur huit cents, et seulement dans les œufs de la boutique.',
    test: () => Object.values(state.dex || {}).some(d => Object.keys(d.fonds || {}).length) },
  { cle: 'chromatique', glyphe: '🌈', nom: 'Coup d’œil',
    dit: 'Voir naître un chromatique. Une chance sur huit mille cent quatre-vingt-douze.',
    test: () => state.stats.prodiges > 0 },
  { cle: 'demesure', glyphe: '🫧', nom: 'Démesuré',
    dit: 'Engraisser une bête jusqu’au dernier rang de taille.',
    test: () => state.pen.some(c => rankOf(sizeFactor(c)).i >= RANKS.length - 1) },
  { cle: 'mythe', glyphe: '👑', nom: 'Sang de mythe',
    dit: 'Faire éclore une lignée mythique.',
    test: () => LINES.some(l => l.rarity === 'mythique' && state.seen[l.key + ':1']) },
  { cle: 'complicite', glyphe: '💗', nom: 'Complicité',
    dit: 'Recevoir dix cadeaux d’une bête qu’on garde en scène.',
    test: () => (state.dons || 0) >= 10 },
  { cle: 'couvee', glyphe: '🪺', montre: true, nom: 'Une première couvée',
    dit: 'Faire naître un œuf en pension. Il faut deux bêtes adultes, un enclos de libre, et du temps.',
    test: () => (state.stats.pension || 0) > 0 },
  { cle: 'assorti', glyphe: '🪶', nom: 'Bien assortis',
    dit: 'Confier deux bêtes qui se ressemblent en tout. C’est là que la pension va le plus vite.',
    test: () => couples().some(k => {
      const a = state.pen.find(c => c.id === k.a), b = state.pen.find(c => c.id === k.b);
      return a && b && distanceDe(a, b) === 0;
    }) },
  { cle: 'emplettes', glyphe: '🧾', nom: 'Tout acheté',
    dit: 'Prendre toutes les primes dans une même partie, sans en oublier une seule.',
    test: () => PRIMES.every(p => prime(p.cle)) },

  // ── l'album, et ce qu'on en fait ──
  { cle: 'deuxEtoiles', glyphe: '★', montre: true, nom: 'Deux étoiles',
    dit: 'Forger une carte. Trois de la même lignée et du même motif, et la poussière avec.',
    test: () => state.album.some(k => (k.etoiles || 1) >= 2) || state.stats.fusions > 0 },
  { cle: 'troisEtoiles', glyphe: '✦', montre: true, nom: 'Trois étoiles',
    dit: 'Mener une carte au bout. Neuf cartes d’une même lignée, et il n’y a pas de quatrième.',
    test: () => state.album.some(k => (k.etoiles || 1) >= ETOILES.length) },
  { cle: 'poussiere', glyphe: '✧', nom: 'Poussière',
    dit: 'Fondre sa première carte. Une carte ratée n’est pas une carte perdue.',
    test: () => (state.stats.fondues || 0) > 0 },
  { cle: 'fondeur', glyphe: '🔥', nom: 'Fondeur',
    dit: 'En fondre cinquante. À ce stade, l’album n’est plus une collection mais une fonderie.',
    test: () => (state.stats.fondues || 0) >= 50 },
];

const trophee = cle => !!(state.trophees && state.trophees[cle]);
const tropheesPris = () => TROPHEES.filter(t => trophee(t.cle)).length;

/* Passe la table en revue. Appelée par la boucle : douze prédicats sur l'état, dix fois par
   seconde, coûtent moins qu'un seul rendu — et lire l'état plutôt que guetter un événement
   permet de rattraper ce qu'une version précédente n'avait pas encore su compter. */
function verifierTrophees() {
  for (const t of TROPHEES) {
    if (trophee(t.cle)) continue;
    let pris = false;
    try { pris = !!t.test(); } catch (e) { pris = false; }
    if (!pris) continue;
    state.trophees[t.cle] = true;
    if (rattrapage) continue;         // une absence ne se célèbre pas douze fois de suite
    const pt = centerOf($('subject'));
    floatText(pt.x, pt.y - 130, t.glyphe + '  ' + t.nom, 'gain');
    chord([523, 659, 784, 1046, 1319], 80);
  }
}

/* ─────────────────────────────────────────────
   Les statistiques
   ───────────────────────────────────────────── */

/* Un début : dix-sept nombres en quatre groupes. La table décide de tout — le rendu la
   parcourt sans rien savoir — donc ajouter un compteur est une ligne ici et une seule.

   Chaque valeur est une fonction, pas un nombre : l'écran se relit à chaque ouverture, et
   rien n'est calculé tant qu'il est fermé. */
const dateCourte = t => t ? new Date(t).toLocaleDateString('fr-FR',
  { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const STATS = [
  ['Le temps', () => [
    ['Première partie', dateCourte(state.stats.debut)],
    ['Temps de jeu', fmtTime(state.stats.temps)],
    ['Clics donnés', fmt(state.stats.clics)],
    ['Assiettes lavées', fmt(state.stats.assiettes || 0)],
  ]],
  ['La ferme', () => [
    ['Œufs éclos', fmt(state.stats.eclos)],
    ['Bêtes vendues', fmt(state.stats.vendues)],
    ['Évolutions payées', fmt(state.stats.evolutions)],
    ['Pièces gagnées', fmt(state.stats.gagne)],
  ]],
  ['Les rencontres', () => [
    ['Nés en pension', fmt(state.stats.pension || 0)],
    // la ligne n'apparaît qu'une fois le rang connu : un « 0 / 2 » annonce ce qu'il compte
    ...(rareteConnue('merveilleuse') ? [['Merveilles rencontrées',
        LINES.filter(l => l.rarity === 'merveilleuse' && state.seen[l.key + ':1']).length +
        ' / ' + LINES.filter(l => l.rarity === 'merveilleuse').length]] : []),
    ['Formes rencontrées', seenCount() + ' / ' + formesVisibles()],
    ['Chromatiques', fmt(state.stats.prodiges)],
    ['Fonds croisés', (() => {
      const vus = new Set();
      for (const d of Object.values(state.dex || {}))
        for (const k of Object.keys(d.fonds || {})) vus.add(k);
      return vus.size + ' / ' + FONDS.length;
    })()],
    ['Cadeaux reçus', fmt(state.dons || 0)],
  ]],
  ['L’album', () => [
    ['Poussière en poche', fmt(state.poussiere || 0)],
    ['Cartes fondues', fmt(state.stats.fondues || 0)],
    ['Fusions', fmt(state.stats.fusions || 0)],
  ]],
  ['Les records', () => [
    ['Plus grosse fortune', fmt(state.stats.fortune)],
    ['Plus grosse vente', fmt(state.stats.record)],
    ['Paliers de fortune franchis', (state.asc.paliers || 0) + ' / ' + JETON_PALIERS.length],
    ['Ascensions', fmt(state.asc.n || 0)],
  ]],
];

function renderStats() {
  const hote = $('stats');
  hote.textContent = '';
  renderTrophees();
  for (const [titre, lignes] of STATS) {
    const h = document.createElement('h3');
    h.className = 'stats-titre';
    h.textContent = titre;
    hote.appendChild(h);
    for (const [nom, valeur] of lignes()) {
      const l = document.createElement('div');
      l.className = 'stats-ligne';
      const g = document.createElement('span'); g.className = 'stats-nom'; g.textContent = nom;
      const d = document.createElement('span'); d.className = 'stats-val'; d.textContent = valeur;
      l.append(g, d);
      hote.appendChild(l);
    }
  }
}

/* LA PENSION À L'ÉCRAN — UN NID OÙ L'ON DÉPOSE DEUX BÊTES.

   La première version désignait les parents dans deux menus déroulants. Ça marchait et ça
   n'allait pas : on ne CONFIE pas une bête en la choisissant dans une liste, et le nom complet
   d'une bête — « Châtaigne marbrée · adulte » — ne dit rien de ce qu'elle a l'air. Le geste
   juste est celui de l'album : on attrape ce qu'on voit, on le pose là où ça va.

   ELLE EMPRUNTE TOUT À L'ALBUM, et ce n'est pas de la parure : les deux écrans font la même
   chose — déplacer une pièce d'un endroit vers un autre — et les apprendre deux fois serait un
   coût inutile. Mêmes zones en pointillés, même surlignage au survol, même vignette, et surtout
   la même règle : LE CLIC FAIT CE QUE FAIT LE GLISSER. Un geste qui n'a qu'une seule façon de
   s'exécuter est un geste que la moitié des joueurs ne peut pas faire — ni au doigt, ni au
   clavier. Ici le clic sur une case vide y met la bête EN SCÈNE, et le clic sur une case pleine
   la retire.

   LA PHRASE SOUS LE NID est le cœur de l'écran : elle dit la distance, la durée et ce qui peut
   sortir. Sans elle on confie deux bêtes à l'aveugle et on attend cinq heures pour découvrir la
   règle. */
let pensionA = null, pensionB = null;

// La bête d'un côté du nid, ou null : elle doit être encore là, et pas déjà partie couver.
const auNid = id => state.pen.find(c => c.id === id && !enPension(c)) || null;

/* Déclaré en fonction et non en flèche : `subjects` s'en sert trois mille lignes plus haut, et
   une fonction se hisse là où une constante laisserait un trou. */
function surLeNid(id) { return id === pensionA || id === pensionB; }

/* ANNULER. Depuis que le dépôt retire la bête de la bande, ce geste est ce qui l'y remet — il
   méritait un nom plutôt que deux lignes au fond d'un écouteur, ne serait-ce que pour être
   vérifiable : le banc ne clique pas. */
function retirerDuNid(cote) {
  if (cote === 'a') { if (pensionA === null) return false; pensionA = null; }
  else { if (pensionB === null) return false; pensionB = null; }
  return true;
}

/* LE NID NE S'OUVRE QUE S'IL RESTE UNE PLACE. Il acceptait les bêtes en toutes circonstances
   et ne refusait qu'au bouton : on composait tranquillement un couple, on lisait « la place est
   prise », et il fallait ressortir les deux bêtes une par une. Un écran qui laisse faire un
   geste qu'il refusera ensuite ment deux fois — d'abord en acceptant, ensuite en refusant. */
const nidOuvert = () => prime('pension') && couples().length < placesPension();

/* Poser une bête dans le nid.

   LA MÊME BÊTE DES DEUX CÔTÉS N'A PAS DE SENS, et refuser demanderait au joueur de deviner
   laquelle des deux cases elle occupe déjà. On ÉCHANGE donc : glisser le parent de gauche sur
   celui de droite les intervertit, au lieu de laisser un trou à gauche. C'est le geste qu'on
   fait sans y penser quand on veut relire un couple dans l'autre sens.

   Venue de la bande, elle prend simplement la place, et l'occupant sort. */
function poserAuNid(id, cote) {
  if (!nidOuvert() || !auNid(id)) return false;
  /* La case se relève AVANT le dépôt, comme à la vente : après, la bête n'est plus dans la
     bande et `caseCourante` ne la trouverait plus. Sans ça, confier la bête en scène renvoyait
     le regard n'importe où. */
  const place = state.sel === 'c:' + id ? caseCourante() : -1;
  const venait = pensionA === id ? 'a' : pensionB === id ? 'b' : null;
  const occupant = cote === 'a' ? pensionA : pensionB;
  const pose = (ou, v) => { if (ou === 'a') pensionA = v; else pensionB = v; };
  pose(cote, id);
  if (venait && venait !== cote) pose(venait, occupant);
  if (place >= 0) tenirLaCase(place);
  return true;
}

/* ── LES DEUX VUES ─────────────────────────────────────────────────────────────
   La collection a quitté la colonne latérale. Cent cinquante cases n'ont jamais eu leur place
   dans une colonne de vingt et un rem : elles y tenaient repliées, ce qui revient à dire
   qu'elles n'y étaient pas. Et depuis la 1.9.0, chaque lignée a une FICHE — un objet qu'on
   lit, pas une case qu'on compte, et qui n'entre dans aucune colonne.

   D'où deux vues et un onglet. La ferme d'un côté, l'encyclopédie de l'autre, en pleine
   largeur toutes les deux.

   L'ONGLET NE SE SAUVEGARDE PAS. On ouvre le jeu sur sa ferme, toujours : revenir le lendemain
   sur une page de collection serait revenir à côté de sa partie. */
/* TROIS VUES DEPUIS L'ATELIER DE FORGE, et la règle ne change pas : chacune prend toute la
   page, aucune ne se sauvegarde. La forge a la même raison d'être pleine page que
   l'encyclopédie — elle montre des cartes côte à côte, six à la fois, et six cartes n'entrent
   pas dans une colonne de vingt et un rem. */
const VUES = ['ferme', 'dex', 'forge', 'ciel'];
let vue = 'ferme';

function ouvrirVue(v) {
  vue = VUES.indexOf(v) === -1 ? 'ferme' : v;
  document.body.classList.toggle('vue-dex', vue === 'dex');
  document.body.classList.toggle('vue-forge', vue === 'forge');
  document.body.classList.toggle('vue-ciel', vue === 'ciel');
  $('vue-dex').hidden = vue !== 'dex';
  $('vue-forge').hidden = vue !== 'forge';
  $('vue-ciel').hidden = vue !== 'ciel';
  for (const b of document.querySelectorAll('.onglet'))
    b.setAttribute('aria-pressed', String(b.dataset.vue === vue));
  refresh();
}

let pensionSig = '', refsPension = null;

/* LE PANNEAU SE BÂTIT UNE FOIS, ET SE REPEINT ENSUITE. Il se reconstruisait à chaque `refresh`,
   c'est-à-dire DIX FOIS PAR SECONDE, et c'était le même défaut que la bande avait avant la
   2.14.0 — le commentaire de `renderStrip` le raconte déjà :

   • le bouton disparaît entre l'appui et le relâchement, le navigateur n'émet alors AUCUN
     « click », et retirer une bête du nid ne marchait qu'un coup sur deux ;
   • la cible d'un dépôt est détruite sous le curseur pendant qu'on la survole, si bien que le
     glisser-déposer scintillait et manquait sa case.

   D'où une SIGNATURE, comme partout ailleurs dans ce fichier : on ne rebâtit que si la
   structure a changé. Ce qui bouge à chaque tour — la barre, le temps restant, la phrase — se
   repeint sans toucher au DOM. */
function batirPension(a, b, ouvert, portee) {
  const hote = $('pension');
  hote.textContent = '';
  refsPension = { couples: [], go: null, dit: null };

  /* ── LES COUPLES EN COURS ──
     En haut, comme les cartes équipées de l'album : c'est le seul bloc qui agit déjà. */
  for (const k of couples()) {
    const pa = state.pen.find(c => c.id === k.a), pb = state.pen.find(c => c.id === k.b);
    /* LA LIGNE EST UN BOUTON : c'est le seul moyen de récupérer deux parents, puisqu'un couple
       ne se défait plus tout seul. Manuel par principe — une ferme qui rendrait les bêtes à
       chaque ponte redemanderait le geste indéfiniment. */
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'couple';
    el.dataset.rompre = String(k.a);
    el.title = !pa || !pb ? 'Rompre ce couple'
      : 'Rompre le couple — ' + fullName(pa) + ' et ' + fullName(pb) + ' retrouvent leur rente';

    /* UNE LIGNE PAR PARENT, et pas deux emoji côte à côte. La ligne disait
       « Crapaud × Loup » : la lignée, et rien d'autre. On confie deux bêtes pour cinq heures
       sans pouvoir dire lesquelles — ni si la chromatique qu'on cherchait est déjà dedans.

       Chaque parent porte donc son DESSIN, teinté comme dans la bande, son nom complet, et la
       ligne de signes qui dit tout ce que le nom a laissé de côté. C'est le même vocabulaire
       visuel que l'enclos : une bête doit se reconnaître partout de la même façon. */
    const parents = document.createElement('span');
    parents.className = 'couple-parents';
    for (const p of [pa, pb]) {
      const ligne = document.createElement('span');
      ligne.className = 'couple-p' + (p ? ' rar-' + lineOf(p).rarity : '');
      const g = document.createElement('span');
      g.className = 'couple-bete';
      if (p) {
        setCreature(g, artFor(p), glyphOf(p));
        g.style.filter = filtreDe(p);
      } else g.textContent = '—';
      const t = document.createElement('span');
      t.className = 'couple-txt';
      const nom = document.createElement('b');
      nom.className = 'couple-nom';
      nom.textContent = p ? fullName(p) : 'Partie';
      const sg = document.createElement('i');
      sg.className = 'couple-signes';
      sg.textContent = p ? signesDe(p) : 'vendue depuis';
      t.append(nom, sg);
      ligne.append(g, t);
      parents.appendChild(ligne);
    }

    const bas = document.createElement('span');
    bas.className = 'couple-bas';
    const barre = document.createElement('span');
    barre.className = 'couple-bar';
    const jauge = document.createElement('i');
    barre.appendChild(jauge);
    const reste = document.createElement('span');
    reste.className = 'couple-reste';
    bas.append(barre, reste);
    el.append(parents, bas);
    hote.appendChild(el);
    refsPension.couples.push({ k, vivant: !!(pa && pb), jauge, reste });
  }

  /* ── LE NID ──
     Deux cases côte à côte, et un signe entre les deux. Chacune est à la fois une zone de
     dépôt, une poignée et un bouton : c'est ce qui donne les trois gestes sur un seul élément.

     IL N'EXISTE PAS QUAND IL N'Y A PLUS DE PLACE. Il s'affichait alors en grisé, avec « le nid
     est occupé » et « attends que le couple ait fini » : un emplacement proposé qu'on ne peut
     pas remplir, et deux phrases pour s'en excuser. Une place qui n'existe pas ne se dessine
     pas — les lignes de couples au-dessus disent déjà pourquoi. */
  if (!ouvert) return;
  const nid = document.createElement('div');
  nid.className = 'nid';
  const case_ = (cote, c) => {
    const z = document.createElement('button');
    z.type = 'button';
    z.className = 'nid-case' + (c ? ' pleine rar-' + lineOf(c).rarity : ' vide');
    z.dataset.cote = cote;
    if (c) {
      /* UNE BÊTE POSÉE SE REPREND À LA MAIN. La case pleine est une poignée : on la glisse
         sur l'autre côté pour échanger les deux parents, ou on la clique pour la sortir. Sans
         ça, composer un couple était un aller simple. */
      z.draggable = true;
      z.dataset.cle = 'c:' + c.id;
      const g = document.createElement('span');
      g.className = 'nid-bete';
      setCreature(g, artFor(c), glyphOf(c));
      g.style.filter = filtreDe(c);
      const t = document.createElement('span');
      t.className = 'nid-txt';
      const n = document.createElement('b');
      n.className = 'nid-nom';
      n.textContent = fullName(c);
      const d = document.createElement('i');
      d.className = 'nid-dit';
      /* Les ÉTIQUETTES restent en bout de ligne : c'est ce qui décide de la distance, donc
         de la durée — la seule information de cette case qui serve à choisir un couple. */
      d.textContent = signesDe(c) + ' · ' + etiqDe(c).join(', ');
      t.append(n, d);
      z.append(g, t);
      z.title = 'Clique pour retirer ' + fullName(c) + ' du nid, ou glisse-la sur l’autre case';
    } else {
      const v = document.createElement('span');
      v.className = 'nid-vide-mot';
      v.textContent = 'glisse une bête ici';
      const v2 = document.createElement('i');
      v2.className = 'nid-vide-sous';
      v2.textContent = 'ou clique pour y mettre celle en scène';
      z.append(v, v2);
    }
    return z;
  };
  const signe = document.createElement('span');
  signe.className = 'nid-signe';
  signe.textContent = '×';
  nid.append(case_('a', a), signe, case_('b', b));
  hote.appendChild(nid);

  const dit = document.createElement('p');
  dit.className = 'pension-dit';
  hote.appendChild(dit);
  refsPension.dit = dit;

  /* UNE SECONDE LIGNE, ET NON UNE LIGNE PLUS LONGUE. La première dit ce que le couple COÛTE
     et ce qu'il DONNE comme lignée — distance, durée, pourcentages, recette. La seconde dit
     ce qu'il TRANSMET. Ce sont deux questions différentes, et les fondre en une phrase de
     quinze mots ferait qu'on ne lirait plus ni l'une ni l'autre. */
  const her = document.createElement('p');
  her.className = 'pension-dit pension-herite';
  hote.appendChild(her);
  refsPension.herite = her;

  const go = document.createElement('button');
  go.type = 'button';
  go.className = 'asc-go';
  go.id = 'pension-go';
  go.textContent = 'Confier';
  hote.appendChild(go);
  refsPension.go = go;
}

function renderPension() {
  const p = $('panel-pension');
  /* LE PANNEAU EST UN BÂTIMENT : il n'existe pas tant qu'on ne l'a pas acheté. Un couple en
     cours le garde à l'écran même après une ascension, le temps qu'il se vide — sans quoi deux
     bêtes resteraient parquées derrière un panneau disparu. */
  p.hidden = !prime('pension') && !couples().length;
  if (p.hidden) { pensionSig = ''; return; }

  const a = auNid(pensionA), b = auNid(pensionB);
  if (!a) pensionA = null;
  if (!b) pensionB = null;
  const ouvert = nidOuvert();
  const portee = porteePension();

  /* LA SIGNATURE PORTE TOUT CE QUI DESSINE, et rien de ce qui coule. L'ÂGE des deux bêtes du
     nid en fait partie : elles continuent de grandir tant qu'on ne les a pas confiées, et leur
     nom change avec. LE RANG DE TAILLE aussi, depuis que la ligne de signes le dit — une bête
     qui passe de « moyenne » à « géante » au nid l'aurait annoncé une fois sur deux. Les bêtes
     d'un couple PARTI, elles, ne bougent plus du tout : la croissance et la mangeoire les
     sautent toutes les deux. */
  const carte = c => c ? c.id + ':' + c.age + ':' + rankOf(sizeFactor(c)).i : '-';
  const sig = couples().map(k => k.a + '×' + k.b).join(',') + '|' +
              carte(a) + '/' + carte(b) + '|' + (ouvert ? 'o' : 'f') + '|' +
              portee + '|' + placesPension();
  if (sig !== pensionSig) { pensionSig = sig; batirPension(a, b, ouvert, portee); }

  // ── ce qui coule : la barre et le temps restant, repeints sans rien reconstruire ──
  for (const r of refsPension.couples) {
    setWidth(r.jauge, Math.min(100, r.k.t / r.k.duree * 100).toFixed(1) + '%');
    setText(r.reste, !r.vivant ? 'perdu'
      : r.k.t >= r.k.duree ? 'réserve pleine'
      : fmtTime(r.k.duree - r.k.t) + (portee > 1 ? ' · ×' + portee : ''));
  }

  /* ── CE QUE LE COUPLE DONNERAIT ──
     Rien à dire quand le nid n'est pas là : il n'y a plus de place, donc plus de couple à
     composer, donc plus de phrase à écrire sous une chose qui n'existe pas. */
  if (!refsPension.dit) return;
  const dit = refsPension.dit;
  dit.classList.remove('refus', 'recette');
  const refus = refusPension(a, b);
  if (!a || !b) {
    setText(dit, 'Deux bêtes adultes. Elles garderont leur enclos et cesseront de rapporter.');
  } else if (refus) {
    setText(dit, refus);
    dit.classList.add('refus');
  } else {
    const d = distanceDe(a, b), t = dureePension(a, b);
    const ecart = ecartRarete(a, b);
    const chance = chancePension(ecart);
    const haut = RARITY[lineOf(a).rarity].rank >= RARITY[lineOf(b).rarity].rank ? a : b;
    const bas = haut === a ? b : a;
    /* CE QUE LA PHRASE DIT D'UNE RECETTE, ET CE QU'ELLE TAIT. Tant qu'on n'a jamais vu la
       merveille, elle ne la nomme pas : « et peut-être autre chose » suffit à dire qu'il y a
       quelque chose ici, et rien de plus. Composer des couples au nid est gratuit ; les
       essayer coûte des jours. C'est la fouille qu'on récompense, pas la lecture d'un wiki.

       Une fois la bête rencontrée, la phrase la nomme et donne son pourcentage : le mystère a
       servi une fois, et le garder ensuite ne serait plus du mystère mais de la rétention. */
    const rec = recetteDe(a, b);
    const su = rec && state.seen[rec.donne + ':1'];
    setText(dit,
      (d === 0 ? 'Elles se ressemblent en tout' : d === 1 ? 'Elles ont une chose en commun'
                                                          : 'Elles n’ont rien en commun') +
      ' · ' + fmtTime(t) + ' · ' +
      (couple2Jokers(a, b)
        ? 'n’importe quelle lignée du bestiaire, sauf la leur' +
          (rareteConnue('merveilleuse')
            ? ' — et ' + dec(JOKER_MERVEILLE * 100, 0) + ' % de merveilleuse' : '')
        : ecart === 0 ? 'un œuf de l’une ou de l’autre, à pile ou face'
                   : Math.round((1 - chance) * 100) + ' % ' + LINE_BY_KEY[bas.line].name.toLowerCase() +
                     ', ' + Math.round(chance * 100) + ' % ' + LINE_BY_KEY[haut.line].name.toLowerCase()) +
      (!rec ? '' : su ? ' · ' + dec(rec.chance * 100, rec.chance < 0.01 ? 1 : 0) + ' % ' + LINE_BY_KEY[rec.donne].name
                      : ' · et peut-être autre chose'));
    if (rec) dit.classList.add('recette');
  }
  if (refsPension.herite) {
    const montre = a && b && !refus;
    refsPension.herite.hidden = !montre;
    if (montre) setText(refsPension.herite, ditDeLHeritage(a, b));
  }
  refsPension.go.disabled = !!refus || !a || !b;

  /* LE COMPTEUR ET LA PHRASE D'INTRODUCTION ONT ÉTÉ RETIRÉS. Le premier disait « 1 / 4 » dans
     l'en-tête, le second annonçait ce qui attendait en réserve : deux chiffres de plus à
     surveiller dans une colonne qu'on voulait calme, et le second changeait à chaque ponte.

     Ce qui les remplace était déjà là : les lignes de couples disent ce qui travaille, le nid
     dit ce qu'on peut encore composer, et la réserve d'œufs se lit en boutique. */
}

/* ── LA FICHE D'UNE LIGNÉE ─────────────────────────────────────────────────────
   Un carnet, jamais un manuel. Elle ne montre QUE ce qu'on a rencontré : les âges vus, les
   teintes croisées, les caractères, les motifs, et les couples de pension qui ont déjà donné
   cette lignée. Une teinte qu'on n'a jamais vue sur un loup n'apparaît pas — pas même en
   silhouette, pas même en compte total.

   C'est le choix qui coûte le plus et qui rapporte le plus : une fiche à moitié vide ne dit
   pas s'il reste quelque chose à trouver, et c'est exactement ce qui donne envie de faire
   éclore un œuf de plus. Un manuel répond une fois ; un carnet se remplit.

   LES POURCENTAGES DE LA PENSION SE CALCULENT, ILS NE SE STOCKENT PAS. Le carnet retient
   qu'un couple a donné cette lignée ; le chiffre affiché est celui d'aujourd'hui, primes
   comprises. Un joueur qui achète le Sang dominant voit ses fiches se mettre à jour, ce qui
   est vrai — et il ne voit rien pour un couple qu'il n'a jamais essayé, ce qui l'est aussi. */
let encyLignee = null, encySig = '';

// Une rangée de pastilles : ce qu'on a croisé, et combien de fois. Rien d'autre.
function encyRangee(hote, titre, table, noms, vus) {
  const cles = Object.keys(vus || {}).map(Number).filter(i => (vus[i] || 0) > 0)
                     .sort((a, b) => vus[b] - vus[a]);
  const h = document.createElement('p');
  h.className = 'ency-titre';
  h.textContent = titre + ' — ' + cles.length + ' / ' + table.length;
  hote.appendChild(h);
  const z = document.createElement('div');
  z.className = 'ency-pastilles';
  if (!cles.length) {
    const v = document.createElement('i');
    v.className = 'ency-vide';
    v.textContent = 'rien de croisé pour l’instant';
    z.appendChild(v);
  }
  for (const i of cles) {
    const p = document.createElement('span');
    p.className = 'ency-pastille';
    const n = document.createElement('b');
    n.textContent = noms(i);
    const c = document.createElement('i');
    c.textContent = '×' + vus[i];
    p.append(n, c);
    z.appendChild(p);
  }
  hote.appendChild(z);
}

function renderEncyclopedie() {
  const cle = encyLignee;
  if (!cle || !LINE_BY_KEY[cle]) { setText($('ency-title'), ''); setText($('ency-dit'), ''); return; }

  /* MAÎTRE-DÉTAIL VEUT UNE SIGNATURE, comme partout ailleurs. La fiche vit dans la page depuis
     qu'elle a quitté l'écran modal : sans garde, elle se rebâtirait dix fois par seconde — le
     défaut de la 1.8.2, qu'on ne refait pas deux fois. Le carnet de la lignée y entre en
     entier, ce qui est peu de chose pour une seule entrée, et le compte des primes avec :
     les pourcentages de la pension se recalculent, donc ils bougent quand on achète.

     LA CONSTELLATION Y EST ENTRÉE AVEC LA PENSION. Cette ligne comptait les primes parce que
     c'est là que vivaient les douze réglages de la pension ; depuis qu'ils sont des nœuds, une
     signature qui ne regarde que les primes fige le pourcentage sur sa valeur d'avant l'achat.
     La fiche annonçait donc 99 % pour un couple qui en était à 98, jusqu'au prochain
     dévoilement. La règle est plus courte que l'oubli : ce que la fiche CALCULE doit être dans
     ce qu'elle SIGNE. */
  const sig = cle + '|' + seenCount() + '|' + Object.keys(state.primes || {}).length +
              '|' + Object.keys(state.ciel || {}).length +
              '|' + JSON.stringify(dexVu(cle) || 0);
  if (sig === encySig) return;
  encySig = sig;
  const ligne = LINE_BY_KEY[cle];
  const d = dexVu(cle);
  const ages = AGES.map((a, i) => !!state.seen[cle + ':' + (i + 1)]);
  const vus = ages.filter(Boolean).length;

  setText($('ency-title'), vus ? ligne.name : '？');
  setText($('ency-dit'), !vus
    ? 'Tu n’as jamais rencontré cette lignée. Cette page se remplira toute seule.'
    : RARITY[ligne.rarity].name + ' · ' + vus + ' forme' + (vus > 1 ? 's' : '') +
      ' sur ' + AGES.length + ' rencontrée' + (vus > 1 ? 's' : '') +
      (d && d.nes ? ' · ' + fmt(d.nes) + ' éclose' + (d.nes > 1 ? 's' : '') : ''));

  const hote = $('ency');
  hote.textContent = '';

  /* ── LES CINQ ÂGES ──
     Ceux qu'on n'a pas vus restent des silhouettes SANS NOM : le nom d'une forme est la
     moitié de la trouvaille, et l'annoncer d'avance la dépenserait pour rien. */
  const rangee = document.createElement('div');
  rangee.className = 'ency-ages';
  AGES.forEach((age, i) => {
    const a = i + 1, got = ages[i];
    const el = document.createElement('div');
    el.className = 'ency-age rar-' + ligne.rarity + (got ? ' got' : ' locked');
    const g = document.createElement('span');
    g.className = 'ency-glyphe';
    if (got) setCreature(g, artAt(cle, a), ligne.forms[i][1]); else g.textContent = '·';
    const n = document.createElement('b');
    n.className = 'ency-nom';
    n.textContent = got ? ligne.forms[i][0] : '？';
    const t = document.createElement('i');
    t.className = 'ency-age-nom';
    t.textContent = age.nom;
    el.append(g, n, t);
    rangee.appendChild(el);
  });
  hote.appendChild(rangee);

  if (!vus) return;

  // ── ce qu'on a croisé sur cette lignée, et seulement sur elle ──
  encyRangee(hote, 'Chromatismes', CHROMAS, i => CHROMAS[i].name, d && d.chromas);
  encyRangee(hote, 'Caractères', TEMPERS, i => TEMPERS[i].name, d && d.caracteres);
  encyRangee(hote, 'Motifs', MOTIFS, i => MOTIFS[i], d && d.motifs);
  /* UN OBJET DE COLLECTION A BESOIN D'UN ENDROIT OÙ ÊTRE COLLECTIONNÉ. Sans cette rangée,
     « collectionnable » n'était qu'un mot : les fonds se croisaient et se revendaient sans
     laisser de trace nulle part. Elle se lit par clé et non par indice, comme la table. */
  const vusFonds = {};
  for (const k of Object.keys((d && d.fonds) || {})) {
    const i = FONDS.findIndex(f => f.key === k);
    if (i >= 0) vusFonds[i] = d.fonds[k];
  }
  encyRangee(hote, 'Fonds', FONDS, i => FONDS[i].nom, vusFonds);
  if (d && d.prodiges) {
    const p = document.createElement('p');
    p.className = 'ency-titre';
    p.textContent = 'Chromatiques — ' + fmt(d.prodiges);
    hote.appendChild(p);
  }

  /* ── LA PENSION, APPRISE PONTE PAR PONTE ──
     On ne liste pas ce qui POURRAIT la donner : on liste ce qui l'a DÉJÀ donnée. La table se
     découvre en élevant, et le pourcentage à côté est celui d'aujourd'hui. */
  const h = document.createElement('p');
  h.className = 'ency-titre';
  const appris = Object.entries((d && d.couples) || {}).sort((x, y) => y[1] - x[1]);
  h.textContent = 'À la pension — ' + appris.length +
                  (appris.length > 1 ? ' couples connus' : ' couple connu');
  hote.appendChild(h);

  if (!appris.length) {
    const v = document.createElement('p');
    v.className = 'ency-vide';
    v.textContent = prime('pension')
      ? 'Aucun couple ne t’a encore donné cette lignée. Confie-en deux pour voir.'
      : 'Tu n’as pas encore de pension.';
    hote.appendChild(v);
  }
  for (const [paire, combien] of appris) {
    const [x, y] = paire.split('×');
    const el = document.createElement('div');
    el.className = 'ency-couple';
    const qui = document.createElement('b');
    qui.textContent = LINE_BY_KEY[x].name + ' × ' + LINE_BY_KEY[y].name;
    const dit = document.createElement('i');
    const pc = chanceDe(x, y, cle) * 100;
    const t = dureePension(stubLignee(x), stubLignee(y));
    dit.textContent = dec(pc, pc < 1 ? 2 : pc < 10 ? 1 : 0) + ' %' +
                      (t === null ? '' : ' · ' + fmtTime(t)) +
                      ' · sorti ' + fmt(combien) + (combien > 1 ? ' fois' : ' fois');
    el.append(qui, dit);
    hote.appendChild(el);
  }
}

/* Les trophées, sous les compteurs. Un décroché montre son nom et ce qu'il a fallu faire ;
   un objectif non décroché montre les deux aussi, c'est tout son intérêt ; une surprise non
   décrochée ne montre RIEN — l'annoncer la tuerait. */
function renderTrophees() {
  const hote = $('trophees');
  hote.textContent = '';
  setText($('trophees-meta'), tropheesPris() + ' / ' + TROPHEES.length);
  for (const t of TROPHEES) {
    const pris = trophee(t.cle);
    if (!pris && !t.montre) continue;
    const l = document.createElement('div');
    l.className = 'trophee' + (pris ? ' pris' : '');
    l.innerHTML = '<span class="trophee-glyphe"></span><span class="trophee-txt">' +
                  '<b class="trophee-nom"></b><i class="trophee-dit"></i></span>';
    l.querySelector('.trophee-glyphe').textContent = t.glyphe;
    l.querySelector('.trophee-nom').textContent = t.nom;
    l.querySelector('.trophee-dit').textContent = t.dit;
    hote.appendChild(l);
  }
}

/* ─────────────────────────────────────────────
   La sauvegarde, en clair
   ───────────────────────────────────────────── */

/* Le jeu tient dans le stockage local d'un navigateur. Le vider, changer de machine, ouvrir
   en navigation privée : la partie disparaît, et c'est la seule perte du jeu qui ne se
   rattrape par rien. Une copie hors du navigateur est la réponse, et elle tient en deux
   fonctions — en fabriquer une, en relire une. */

// Ce qu'on exporte, c'est l'état vivant, pas ce que localStorage porte : les deux peuvent
// différer de cinq secondes, et c'est toujours le premier qui a raison.
const texteSauvegarde = () => JSON.stringify(state);

/* Lit un texte et dit ce qu'il contient, SANS RIEN ÉCRIRE. C'est ce résumé qui protège du
   vrai risque de la restauration : écraser une bonne partie avec le mauvais fichier. On
   refuse aussi un format plus récent que celui qu'on sait lire — migrer vers l'avant est
   impossible, et charger quand même donnerait une partie silencieusement abîmée. */
function lireSauvegarde(texte) {
  let d;
  try { d = JSON.parse(texte); }
  catch (e) { return { ok: false, dit: 'Ce texte n’est pas une sauvegarde : il ne se lit pas.' }; }
  if (!d || typeof d !== 'object' || Array.isArray(d))
    return { ok: false, dit: 'Ce texte n’est pas une sauvegarde.' };
  if (typeof d.coins !== 'number' || !Array.isArray(d.pen) || !Array.isArray(d.incub))
    return { ok: false, dit: 'Sauvegarde incomplète : la ferme manque.' };
  if (typeof d.v !== 'number')
    return { ok: false, dit: 'Sauvegarde sans numéro de format.' };
  if (d.v > SAVE_V)
    return { ok: false, dit: 'Cette sauvegarde vient d’une version plus récente du jeu ' +
                             '(format v' + d.v + ', ici v' + SAVE_V + ').' };

  const cartes = (d.album || []).length, sauts = (d.asc && d.asc.n) || 0;
  const quand = d.t ? new Date(d.t) : null;
  return { ok: true, data: d, dit:
    d.pen.length + ' bête' + (d.pen.length > 1 ? 's' : '') + ' en enclos · ' +
    fmt(d.coins) + ' pièce' + (d.coins >= 2 ? 's' : '') +
    (cartes ? ' · ' + cartes + ' carte' + (cartes > 1 ? 's' : '') : '') +
    (sauts ? ' · ' + sauts + ' ascension' + (sauts > 1 ? 's' : '') : '') +
    ' · format v' + d.v +
    (quand && !isNaN(quand) ? ' · ' + quand.toLocaleString('fr-FR') : '') };
}

/* Pose la sauvegarde lue et recharge. Recharger plutôt que rebrancher l'état à chaud : le
   démarrage refait la boutique, les menus, les intervalles et le rattrapage dans le bon
   ordre, et une restauration doit ressembler exactement à une ouverture de page. */
function restaurer(texte) {
  const lu = lireSauvegarde(texte);
  if (!lu.ok) return lu;
  /* La date repart à maintenant. Restaurer une copie n'est pas rentrer d'une absence : sans
     ça, un fichier vieux d'une semaine offrirait au chargement les huit heures de ferme
     automatique que le plafond hors-ligne autorise, ce qui serait un cadeau pour un geste
     qui n'en est pas un. */
  lu.data.t = Date.now();
  // couper la sauvegarde AVANT de recharger, sinon beforeunload réécrit ce qu'on vient de poser
  stopSaving = true;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(lu.data)); }
  catch (e) {
    stopSaving = false;
    return { ok: false, dit: 'Le navigateur a refusé d’écrire la sauvegarde.' };
  }
  location.reload();
  return lu;
}

// Dit à l'écran ce que vaut le texte en cours de saisie, et n'ouvre le bouton que s'il tient.
function jugerSav(texte) {
  if (!texte.trim()) { setText($('sav-resume'), ''); $('sav-go').disabled = true; return; }
  const lu = lireSauvegarde(texte);
  setText($('sav-resume'), lu.ok ? '→ ' + lu.dit : '✕ ' + lu.dit);
  $('sav-resume').classList.toggle('sav-non', !lu.ok);
  $('sav-go').disabled = !lu.ok;
}

// Un nom de fichier qui se range tout seul par ordre chronologique.
function nomFichierSauvegarde() {
  const d = new Date(), n = x => String(x).padStart(2, '0');
  return 'eclosion-' + d.getFullYear() + n(d.getMonth() + 1) + n(d.getDate()) +
         '-' + n(d.getHours()) + n(d.getMinutes()) + '.json';
}

/* ─────────────────────────────────────────────
   Démarrage
   ───────────────────────────────────────────── */

/* Les menus reprennent leur valeur depuis l'état. Appelé au démarrage, et de nouveau après
   une ascension : les réglages traversent le saut, les éléments du DOM non. */
/* Marque la pastille choisie et écrit la phrase sous le segment. Rien ne se reconstruit :
   les rangées sont bâties une fois, et seul l'attribut bouge. */
function poserSegment(id, valeur, phrase) {
  const seg = $(id);
  for (const b of seg.children)
    b.setAttribute('aria-pressed', String(b.dataset.v === String(valeur)));
  setText($(id + '-d'), phrase);
}

let reglagesSig = '';

/* ELLE TOURNE AVEC LA BOUCLE, et se garde d'une signature. Avec des menus, la valeur affichée
   ne bougeait qu'au geste du joueur ; un segment porte aussi la PHRASE du choix, dont le prix
   dépend des primes de négoce et du Renom — elle doit donc suivre l'état, pas seulement le
   clic. Cent pastilles repeintes dix fois par seconde ne coûteraient rien de visible, mais
   c'est le genre de dépense qu'on ne remarque qu'une fois qu'il y en a dix. */
function syncReglages() {
  const sig = REGLAGES.map(r => Object.keys(RARITY).map(c => state[r.champ][c] || 0).join()).join('|') +
              '|' + state.buyKind + '|' + Object.keys(state.primes || {}).length;
  if (sig === reglagesSig) return;
  reglagesSig = sig;

  for (const r of REGLAGES)
    for (const cle of Object.keys(RARITY)) {
      const v = state[r.champ][cle] || 0;
      poserSegment(r.cle + '-' + cle, v, r.dit(cle, v));
    }
  const e = EN_VENTE[state.buyKind];
  poserSegment('sel-acheteur', state.buyKind, e
    ? e.name + ' — ' + fmt(prixOeuf(e)) + ', couve en ' + fmtTime(e.hatch)
    : 'Il est arrêté : il ne dépense rien.');
}

/* L'ÉCRAN D'UN CARREFOUR. Il s'ouvre au clic sur la case de la grille, et il s'arrête là :
   les trois routes ne tiennent pas dans une case de quatre centimètres, et surtout un choix
   définitif ne doit pas se prendre d'un clic distrait au milieu de quarante-cinq primes.

   IL SE FERME SANS CHOISIR. Rien ne presse — la case reste, l'argent aussi, et le carrefour se
   rouvre quand on veut. C'est la même règle que le jeton d'ascension : un choix qu'on peut
   remettre ne réclame rien. */
let carrefourOuvert = null;

function ouvrirCarrefour(cle) {
  const p = PRIMES.find(x => x.cle === cle);
  if (!p || !p.choix || choixPris(p)) return false;
  carrefourOuvert = cle;
  const boite = $('carrefour');
  setText($('carrefour-titre'), p.nom);
  setText($('carrefour-dit'), p.dit + ' Elles coûtent ' + fmt(p.prix) + ' chacune.');
  const hote = $('carrefour-routes');
  hote.textContent = '';
  for (const o of p.choix) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'route';
    b.dataset.route = o.cle;
    b.disabled = state.coins < p.prix;
    b.innerHTML = '<span class="route-glyphe"></span><b class="route-nom"></b>' +
                  '<i class="route-dit"></i>';
    b.querySelector('.route-glyphe').textContent = o.glyphe;
    b.querySelector('.route-nom').textContent = o.nom;
    b.querySelector('.route-dit').textContent = o.dit;
    hote.appendChild(b);
  }
  boite.hidden = false;
  return true;
}

function fermerCarrefour() {
  carrefourOuvert = null;
  faveurOuverte = false;
  $('carrefour').hidden = true;
}

/* LES FAVEURS EMPRUNTENT L'ÉCRAN DU CARREFOUR, et c'est la bonne dette : trois cartes côte à
   côte, un titre, une phrase, une croix pour partir sans rien prendre. Deux écrans identiques
   à un drapeau près auraient été deux écrans à maintenir.

   IL SE FERME SANS CHOISIR, comme le carrefour — et surtout SANS RETIRER LE TIRAGE. Rouvrir
   rend les mêmes trois cartes : sinon fermer serait relancer, et un tirage qu'on relance
   gratuitement n'est plus un tirage. */
let faveurOuverte = false;

function ouvrirFaveurs() {
  if (!faveursOuvertes()) return false;
  const prix = prixFaveur();
  faveurOuverte = true;
  carrefourOuvert = null;
  setText($('carrefour-titre'), 'Une faveur');
  setText($('carrefour-dit'), 'Trois cartes tirées au sort, une seule à prendre — le tirage ' +
    'ne bouge qu’en prenant. Elles coûtent ' + fmt(prix) + ' chacune.');
  const hote = $('carrefour-routes');
  hote.textContent = '';
  for (const cle of mainFaveurs()) {
    const f = FAVEUR_BY_KEY[cle];
    const n = faveurCombien(cle);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'route';
    b.dataset.faveur = cle;
    b.disabled = state.coins < prix;
    b.innerHTML = '<span class="route-glyphe"></span><b class="route-nom"></b>' +
                  '<i class="route-dit"></i>';
    b.querySelector('.route-glyphe').textContent = f.glyphe;
    /* CE QU'ON EN A DÉJÀ SE DIT SUR LA CARTE. Une faveur se reprend sans limite, donc « déjà
       prise trois fois » est la seule information qui décide vraiment entre deux cartes. */
    b.querySelector('.route-nom').textContent = n ? f.nom + ' ×' + (n + 1) : f.nom;
    b.querySelector('.route-dit').textContent = f.dit;
    hote.appendChild(b);
  }
  $('carrefour').hidden = false;
  return true;
}

function cielClic(e) {
  const b = e.target.closest && e.target.closest('.etoile');
  if (!b) return;
  if (!acheterEtoile(b.dataset.etoile)) blip(300, 0.05, 'sine', 0.03);
}

function bindTools() {
  $('subject').addEventListener('click', tapStage);
  $('offline-note').addEventListener('click', e => {
    if (e.target.closest && e.target.closest('.note-x')) $('offline-note').hidden = true;
  });

  $('btn-asc').addEventListener('click', ouvrirAscension);
  $('asc-close').addEventListener('click', fermerAscension);
  $('ascension').addEventListener('click', e => {
    if (e.target === $('ascension')) fermerAscension();     // clic sur le fond
  });
  $('asc-rafle').addEventListener('click', () => {
    const ap = apercuAscension();
    const plein = ascChoix.length >= Math.min(ap.max, ap.neuves.length);
    ascChoix = plein ? [] : meilleuresCartes(ap.neuves, ap.max);
    renderAscension();
  });
  $('asc-go').addEventListener('click', () => {
    const n = state.pen.length;
    if (!n) return;                       // pas d'ascension à vide, même par un clic égaré
    const ap = apercuAscension();
    const prises = Math.min(ascChoix.length, ap.max);
    const perdues = n - prises;
    /* L'AVERTISSEMENT EST TOMBÉ, ET IL ÉTAIT FAUX DEUX FOIS. Il annonçait que les jetons
       inemployés « partaient avec » — ils restent en bourse depuis la 4.0.0. Et il les comptait
       en soustrayant un NOMBRE DE CARTES à un nombre de jetons, alors que trois cartes coûtent
       six jetons depuis que le prix est doré. Un avertissement faux est pire qu'aucun : il
       fait prendre des cartes dont on ne veut pas. */
    const reste = Math.max(0, jetonsEnMain() - coutCartes(prises));
    if (!confirm('Ascensionner ?\n\n' + prises + ' bête' + (prises > 1 ? 's deviennent' : ' devient') +
        ' une carte.' +
        (perdues ? '\nLes ' + perdues + ' autre' + (perdues > 1 ? 's sont perdues' : ' est perdue') + '.' : '') +
        (reste ? '\n✦ ' + reste + ' jeton' + (reste > 1 ? 's restent' : ' reste') +
                 ' en bourse pour la constellation.' : '') +
        '\nTout le reste repart de zéro. C’est irréversible.')) return;
    ascensionner();
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('ascension').hidden) fermerAscension();
    if (e.key === 'Escape' && !$('carrefour').hidden) fermerCarrefour();
  });

  /* LA BARRE ESPACE APPARTIENT À LA SCÈNE, et à rien d'autre. Elle ne fait jamais défiler.

     L'exception ne vaut plus que pour les champs et les menus, où l'espace a un sens propre :
     il ouvre une liste déroulante, il tape une lettre. Les BOUTONS en étaient exclus eux
     aussi, et c'est ce qui cassait le martèlement — un bouton gardé sous le focus après un
     clic à la souris détournait chaque espace suivant, tantôt pour se réactiver, tantôt pour
     faire défiler la colonne qui le contient. Voir le relâchement du focus juste en dessous.

     Pendant l'écran d'ascension, l'espace ne fait rien : marteler une bête à travers une
     boîte modale qui demande son sort n'a aucun sens. */
  /* MAINTENIR LA BARRE NE VAUT QU'UN CLIC. Le système répète l'événement des dizaines de fois
     par seconde tant que la touche est enfoncée : sans ce verrou, poser un livre sur le
     clavier jouait la partie à notre place, et le clic cessait d'être un geste.

     Le verrou se lève au relâchement, et aussi quand la FENÊTRE perd le focus : une touche
     relâchée pendant qu'on est ailleurs n'envoie pas de keyup à cette page, et le verrou
     resterait fermé pour toujours — la barre ne répondrait plus du tout. */
  let espaceTenue = false;
  window.addEventListener('keyup', e => {
    if (e.code === 'Space' || e.key === ' ') espaceTenue = false;
  });
  window.addEventListener('blur', () => { espaceTenue = false; });

  window.addEventListener('keydown', e => {
    if (e.code !== 'Space' && e.key !== ' ') return;
    const t = e.target;
    if (t && /^(SELECT|INPUT|TEXTAREA)$/.test(t.tagName)) return;
    e.preventDefault();          // le défilement est bloqué même sur une répétition
    if (espaceTenue || e.repeat) return;
    espaceTenue = true;
    if (!$('ascension').hidden) return;
    tapStage();
  });

  /* Un bouton cliqué à la SOURIS ne garde pas le focus : sinon il capte les espaces suivants,
     et le joueur martèle un bouton au lieu de sa bête. `e.detail > 0` distingue le vrai clic
     du clic synthétique d'une activation au clavier — celle-là doit garder son focus, sans
     quoi on ne peut plus naviguer au Tab. */
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button');
    if (b && e.detail > 0) b.blur();
  });

  $('btn-speed').addEventListener('click', () => {
    state.speed = state.speed === 1 ? 10 : state.speed === 10 ? 100 : 1;
    $('btn-speed').textContent = '×' + state.speed;
  });

  /* L'interrupteur du mode histoire. Éteint : tout est visible, plus aucune note. Rallumé :
     on OUBLIE ce qui a été lu, pour que les notes rejouent — c'est ce qui permet de les
     vérifier sans effacer sa partie, et un joueur qui rallume veut précisément les revoir. */
  $('btn-tuto').addEventListener('click', () => {
    state.tuto = !state.tuto;
    if (state.tuto) state.vu = {};
    state.dial = null;
    $('btn-tuto').setAttribute('aria-pressed', String(state.tuto));
    refresh();
    blip(state.tuto ? 660 : 330, 0.05, 'triangle', 0.03);
  });

  /* Un clic n'importe où dans la boîte avance d'une réplique — c'est le geste qu'on connaît
     de tous les jeux à dialogue, et il évite d'avoir à viser une petite flèche. La croix, elle,
     passe la scène entière. */
  $('dial-boite').addEventListener('click', e => {
    if (e.target.closest('#dial-passer')) return;
    replique(false);
    blip(520, 0.03, 'triangle', 0.02);
  });
  $('dial-passer').addEventListener('click', () => replique(true));

  $('btn-sound').addEventListener('click', () => {
    state.sound = !state.sound;
    $('btn-sound').setAttribute('aria-pressed', String(state.sound));
    if (state.sound) blip(660, 0.06, 'triangle', 0.03);
  });

  /* L'ÉCRAN DE SAUVEGARDE. Le presse-papier n'est pas garanti — il demande un contexte
     sécurisé, ce qu'une page ouverte en `file://` n'est pas — donc le téléchargement reste
     le chemin principal et la copie un raccourci qui peut échouer sans conséquence. */
  const ouvrirSav = (v) => {
    $('sauvegarde').hidden = !v;
    if (!v) return;
    setText($('sav-etat'), 'Ta partie actuelle : ' + lireSauvegarde(texteSauvegarde()).dit);
    $('sav-colle').value = '';
    jugerSav('');
  };
  const ouvrirStats = v => { $('statistiques').hidden = !v; if (v) renderStats(); };
  /* CHOISIR UNE LIGNÉE, PLUTÔT QU'OUVRIR UNE FICHE. La fiche vivait dans un écran modal ; elle
     vit maintenant à côté de la liste, et cliquer une carte ne fait que déplacer le regard.
     C'est la différence entre feuilleter et ouvrir-refermer trente fois. */
  const choisirLignee = cle => { encyLignee = cle || null; refresh(); };
  /* Un seul écouteur pour les six : le bouton porte sa clé, ce qui évite six lignes qui
     disent la même chose et une septième oubliée le jour où un panneau s'ajoute. */
  for (const b of document.querySelectorAll('.panel-plier')) {
    b.addEventListener('click', () => plier(b.dataset.plie));
  }

  /* ── LA PENSION : glisser une bête de la bande jusqu'au nid ──────────────────
     Mêmes écouteurs que l'album, et pour la même raison : renderPension reconstruit tout à
     chaque changement, donc les écouteurs vivent sur le panneau et jamais sur les cases.

     La SOURCE est la bande, la CIBLE est le nid : c'est le seul glisser du jeu qui traverse
     deux panneaux, et c'est ce qui le rend lisible — on prend la bête où elle vit. */
  const bandes = [$('strip-pen'), $('strip-incub')];
  for (const bande of bandes) {
    bande.addEventListener('dragstart', e => {
      const t = e.target.closest && e.target.closest('.thumb');
      if (!t || !t.draggable) return;
      e.dataTransfer.setData('text/plain', t.dataset.cle);
      e.dataTransfer.effectAllowed = 'copy';
      t.classList.add('porte');
      document.body.classList.add('glisse');   // le nid s'allume pendant qu'on porte
    });
    bande.addEventListener('dragend', e => {
      const t = e.target.closest && e.target.closest('.thumb');
      if (t) t.classList.remove('porte');
      document.body.classList.remove('glisse');
      for (const z of $('pension').querySelectorAll('.nid-case')) z.classList.remove('survol');
    });
  }

  const nidHote = $('pension');

  /* UNE BÊTE POSÉE EST UNE POIGNÉE, ELLE AUSSI. Composer un couple était un aller simple : une
     fois la bête dans le nid, seul le clic la ressortait. Maintenant on la glisse sur l'autre
     case pour échanger les deux parents — et comme elle porte la même clé qu'une vignette de
     la bande, le dépôt n'a rien de particulier à savoir. */
  nidHote.addEventListener('dragstart', e => {
    const z = e.target.closest && e.target.closest('.nid-case');
    if (!z || !z.draggable || !z.dataset.cle) return;
    e.dataTransfer.setData('text/plain', z.dataset.cle);
    e.dataTransfer.effectAllowed = 'copy';
    z.classList.add('porte');
    document.body.classList.add('glisse');
  });
  nidHote.addEventListener('dragend', e => {
    const z = e.target.closest && e.target.closest('.nid-case');
    if (z) z.classList.remove('porte');
    document.body.classList.remove('glisse');
    for (const c of nidHote.querySelectorAll('.nid-case')) c.classList.remove('survol');
  });

  nidHote.addEventListener('dragover', e => {
    const z = e.target.closest && e.target.closest('.nid-case');
    if (!z || z.disabled) return;      // une case fermée ne fait pas semblant d'accepter
    e.preventDefault();                       // sans ça, le navigateur refuse le dépôt
    e.dataTransfer.dropEffect = 'copy';
    z.classList.add('survol');
  });
  nidHote.addEventListener('dragleave', e => {
    const z = e.target.closest && e.target.closest('.nid-case');
    if (z && !z.contains(e.relatedTarget)) z.classList.remove('survol');
  });
  nidHote.addEventListener('drop', e => {
    const z = e.target.closest && e.target.closest('.nid-case');
    if (!z) return;
    e.preventDefault();
    z.classList.remove('survol');
    // la clé d'un sujet, « c:12 » : seules les bêtes sont attrapables, mais on revérifie
    const cle = e.dataTransfer.getData('text/plain') || '';
    const id = parseInt(cle.slice(2), 10);
    // reposée sur sa propre case : rien à faire, et surtout pas un refus qui grince
    if (id === (z.dataset.cote === 'a' ? pensionA : pensionB)) return;
    if (!poserAuNid(id, z.dataset.cote)) {
      blip(300, 0.05, 'sine', 0.03);
      return;
    }
    chord([523, 659], 55);
    refresh();
  });

  /* LE CLIC FAIT CE QUE FAIT LE GLISSER, comme dans l'album. Sur une case pleine il retire ;
     sur une case vide il y met la bête EN SCÈNE — celle qu'on regarde, donc celle à laquelle
     on pense. C'est le chemin de ceux qui jouent au doigt ou au clavier, et il n'ajoute aucun
     bouton à l'écran. */
  nidHote.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('#pension-go')) {
      const a = auNid(pensionA), b = auNid(pensionB);
      if (!accoupler(a, b)) { blip(300, 0.05, 'sine', 0.03); return; }
      pensionA = pensionB = null;
      chord([392, 523, 659], 70);
      refresh();
      save();
      return;
    }
    const ligne = e.target.closest && e.target.closest('.couple');
    if (ligne) {
      if (romprePension(parseInt(ligne.dataset.rompre, 10))) {
        chord([392, 330], 70);
        refresh();
        save();
      }
      return;
    }
    const z = e.target.closest && e.target.closest('.nid-case');
    if (!z) return;
    const cote = z.dataset.cote;
    if (z.classList.contains('pleine')) {
      retirerDuNid(cote);
      blip(330, 0.05, 'sine', 0.03);
      refresh();
      return;
    }
    const s = current();
    if (!s || s.kind !== 'creature' || !poserAuNid(s.c.id, cote)) {
      blip(300, 0.05, 'sine', 0.03);
      return;
    }
    chord([523, 659], 55);
    refresh();
  });

  $('primes-voir').addEventListener('click', () => {
    primesPrises = !primesPrises;
    blip(440, 0.04, 'sine', 0.03);
    refresh();
  });

  $('btn-pause').addEventListener('click', () => basculerPause());

  /* LA GRILLE OUVRE LES FICHES. L'écouteur vit sur le panneau et non sur les cases :
     renderCollection les reconstruit dès qu'une forme est rencontrée, et rattacher cent
     cinquante écouteurs à chaque redessin les multiplierait sans jamais les retirer. */
  $('collection').addEventListener('click', e => {
    const c = e.target.closest && e.target.closest('.dex-carte');
    if (c && c.dataset.lignee) choisirLignee(c.dataset.lignee);
  });
  $('dex-filtres').addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.dex-filtre');
    if (!b) return;
    dexFiltre = b.dataset.filtre;
    blip(440, 0.04, 'sine', 0.03);
    refresh();
  });
  for (const b of document.querySelectorAll('.onglet'))
    b.addEventListener('click', () => ouvrirVue(b.dataset.vue));

  $('btn-stat').addEventListener('click', () => ouvrirStats(true));
  $('stat-close').addEventListener('click', () => ouvrirStats(false));
  $('statistiques').addEventListener('click', e => {
    if (e.target === $('statistiques')) ouvrirStats(false);
  });

  $('btn-sav').addEventListener('click', () => ouvrirSav(true));
  $('sav-close').addEventListener('click', () => ouvrirSav(false));
  $('sauvegarde').addEventListener('click', e => { if (e.target === $('sauvegarde')) ouvrirSav(false); });

  $('sav-fichier').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([texteSauvegarde()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = nomFichierSauvegarde();
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    chord([523, 784], 60);
  });

  $('sav-copier').addEventListener('click', () => {
    const dire = ok => setText($('sav-etat'), ok
      ? 'Copié. Colle-le où tu veux — un fichier texte, une note, un mail à toi-même.'
      : 'Le navigateur a refusé le presse-papier. Passe par le téléchargement.');
    try {
      navigator.clipboard.writeText(texteSauvegarde()).then(() => dire(true), () => dire(false));
    } catch (e) { dire(false); }
  });

  $('sav-choix').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const lecteur = new FileReader();
    lecteur.onload = () => { $('sav-colle').value = String(lecteur.result); jugerSav($('sav-colle').value); };
    lecteur.onerror = () => { setText($('sav-resume'), 'Ce fichier ne se lit pas.'); $('sav-go').disabled = true; };
    lecteur.readAsText(f);
  });

  $('sav-colle').addEventListener('input', e => jugerSav(e.target.value));

  $('sav-go').addEventListener('click', () => {
    const texte = $('sav-colle').value;
    const lu = lireSauvegarde(texte);
    if (!lu.ok) return;
    if (!confirm('Restaurer cette sauvegarde ?\n\n' + lu.dit +
                 '\n\nTa partie actuelle sera remplacée. C’est irréversible.')) return;
    const r = restaurer(texte);
    if (!r.ok) setText($('sav-resume'), r.dit);
  });

  $('btn-reset').addEventListener('click', () => {
    if (!confirm('Effacer la partie et repartir de zéro ?')) return;
    // couper la sauvegarde AVANT de recharger : sinon le beforeunload réécrit
    // aussitôt ce qu'on vient d'effacer, et le bouton semble ne rien faire.
    stopSaving = true;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
    location.reload();
  });

  /* UN SEUL ÉCOUTEUR PAR BLOC, posé sur l'hôte et non sur les cent pastilles : elles sont
     bâties une fois pour toutes, mais un rang de rareté ajouté en poserait vingt de plus, et
     une délégation ne se périme jamais.

     LE FOCUS SE RELÂCHE APRÈS LE CLIC. Un bouton qui garde le focus détourne la barre espace,
     et la barre espace est le clic du jeu — c'était déjà vrai des menus qu'il remplace. */
  const choisir = (hote, quoi) => {
    $(hote).addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('.seg-opt');
      if (!b) return;
      const seg = b.closest('.seg');
      quoi(seg.id, b.dataset.v);
      b.blur();
      blip(440, 0.04, 'sine', 0.03);
      syncReglages();
      refresh();
      save();
    });
  };

  for (const r of REGLAGES)
    choisir(r.hote, (id, v) => {
      state[r.champ][id.slice(r.cle.length + 1)] = parseInt(v, 10) || 0;
    });

  choisir('reg-acheteur', (id, v) => {
    state.buyKind = v === '' || EN_VENTE[v] ? v : 'commun';
  });

  $('tri').addEventListener('click', e => {
    const b = e.target.closest('.tri-opt');
    if (!b || b.dataset.tri === state.tri) return;
    state.tri = b.dataset.tri in TRIS ? b.dataset.tri : 'arrivee';
    syncTri();
    refresh();
    blip(440, 0.04, 'sine', 0.03);
  });

  /* ── L'album : glisser une carte d'un bloc à l'autre ────────────────────────
     Les écouteurs vivent sur le panneau, pas sur les cartes : renderAlbum reconstruit tout à
     chaque changement, et rattacher trois écouteurs par carte à chaque redessin les
     multiplierait sans jamais les retirer.

     Le CLIC fait la même chose que le glisser. Ce n'est pas un doublon de confort : le
     glisser-déposer n'existe pas au doigt sur un téléphone, et pas davantage au clavier. Un
     geste qui n'a qu'une seule façon de s'exécuter est un geste que la moitié des joueurs
     ne peut pas faire. */
  /* LE BOUTON PORTE SA CLÉ DE GROUPE et non un identifiant de carte : c'est le groupe qui
     est forgé, pas une carte, et les trois qui entrent sont recalculées au moment du clic.
     Une liste d'identifiants figée dans le DOM aurait vieilli entre deux images — il suffit
     d'équiper une carte pour que le trio change. */
  /* UN SEUL ÉCOUTEUR POUR L'ATELIER. Les cartes du plan de travail et celles de la grille
     répondent au même geste — cliquer prend, cliquer reprend — et c'est voulu : un joueur qui
     vient de poser une carte par erreur la reprend là où il l'a posée. */
  $('vue-forge').addEventListener('click', e => {
    if (!e.target.closest) return;
    if (e.target.closest('.forge-annule')) { oublierForge(); refresh(); return; }
    if (e.target.closest('.forge-acte')) {
      if (!forger(trioForge())) blip(300, 0.05, 'sine', 0.03);
      return;
    }
    const carte = e.target.closest('.carte');
    if (!carte || !carte.dataset.id) return;
    if (!choisirForge(parseInt(carte.dataset.id, 10))) blip(300, 0.05, 'sine', 0.03);
  });

  $('tri-oeuf').addEventListener('click', e => {
    const b = e.target.closest('.tri-opt');
    if (!b || b.dataset.tri === state.triOeuf) return;
    state.triOeuf = b.dataset.tri in TRIS_OEUF ? b.dataset.tri : 'arrivee';
    syncTriOeuf();
    refresh();
    save();
  });
  $('carrefour-close').addEventListener('click', fermerCarrefour);
  $('carrefour').addEventListener('click', e => {
    if (e.target === $('carrefour')) fermerCarrefour();     // clic sur le fond
  });
  $('faveur-mise').addEventListener('click', () => {
    if (!ouvrirFaveurs()) blip(300, 0.05, 'sine', 0.03);
  });
  $('carrefour-routes').addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.route');
    if (!b) return;
    if (faveurOuverte) {
      /* ON REFERME APRÈS AVOIR PRIS. Le tirage suivant existe déjà — le rouvrir aussitôt
         donnerait une roue qu'on fait tourner, et non une décision qu'on prend. */
      if (prendreFaveur(b.dataset.faveur)) fermerCarrefour();
      return;
    }
    if (!carrefourOuvert) return;
    if (choisirRoute(carrefourOuvert, b.dataset.route)) fermerCarrefour();
    else blip(300, 0.05, 'sine', 0.03);
  });

  /* LE GLISSER NE DOIT PAS ACHETER. On tire le canevas pour s'y déplacer, et le même geste
     finit sur un nœud : sans ce garde, traverser l'écran achèterait ce qu'on relâche. */
  const arbre = $('ciel-arbre');
  arbre.addEventListener('mousedown', cielDebutTire);
  arbre.addEventListener('touchstart', cielDebutTire, { passive: true });
  window.addEventListener('mousemove', cielBouge);
  window.addEventListener('touchmove', cielBouge, { passive: false });
  window.addEventListener('mouseup', () => { if (cielFinTire() > 3) cielGlisse = true; });
  window.addEventListener('touchend', () => { if (cielFinTire() > 3) cielGlisse = true; });

  arbre.addEventListener('click', e => {
    if (cielGlisse) { cielGlisse = false; return; }
    cielClic(e);
  });

  $('ciel-reprendre').addEventListener('click', () => {
    const rendu = prixDuCiel();
    if (!rendu) return;
    if (!confirm('Reprendre toute ta constellation ?\n\n' + rendu + ' jeton' +
        (rendu > 1 ? 's te sont rendus' : ' t’est rendu') +
        ', et tous les nœuds redeviennent à prendre.')) return;
    reprendreCiel();
  });
  /* AU CLAVIER AUSSI. Les nœuds sont des `g` SVG, donc ni boutons ni liens : sans ceci, tout
     l'écran serait inatteignable sans souris. */
  arbre.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cielClic(e); }
  });

  const albumHote = $('album');

  albumHote.addEventListener('dragstart', e => {
    const c = e.target.closest && e.target.closest('.carte');
    if (!c) return;
    e.dataTransfer.setData('text/plain', c.dataset.id);
    e.dataTransfer.effectAllowed = 'move';
    c.classList.add('porte');
  });
  albumHote.addEventListener('dragend', e => {
    const c = e.target.closest && e.target.closest('.carte');
    if (c) c.classList.remove('porte');
    for (const z of albumHote.querySelectorAll('.album-zone')) z.classList.remove('survol');
  });
  albumHote.addEventListener('dragover', e => {
    const z = e.target.closest && e.target.closest('.album-zone');
    if (!z) return;
    e.preventDefault();                       // sans ça, le navigateur refuse le dépôt
    e.dataTransfer.dropEffect = 'move';
    z.classList.add('survol');
  });
  albumHote.addEventListener('dragleave', e => {
    const z = e.target.closest && e.target.closest('.album-zone');
    if (z && !z.contains(e.relatedTarget)) z.classList.remove('survol');
  });
  albumHote.addEventListener('drop', e => {
    const z = e.target.closest && e.target.closest('.album-zone');
    if (!z) return;
    e.preventDefault();
    z.classList.remove('survol');
    const id = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (deplacerCarte(id, z.dataset.zone === 'slots')) chord([523, 659], 55);
    else blip(300, 0.05, 'sine', 0.03);       // cinq emplacements pleins, ou déjà du bon côté
  });

  // le clic bascule la carte vers l'autre bloc — même effet, sans le geste
  albumHote.addEventListener('click', e => {
    /* Les deux boutons d'une carte passent AVANT le basculement : ils sont dans la carte, donc
       sans cette sortie un clic sur « fondre » déplacerait aussi la carte. */
    const acte = e.target.closest && e.target.closest('.carte-acte');
    if (acte) {
      const carte = acte.closest('.carte');
      const quoi = parseInt(carte.dataset.id, 10);
      if (!desintegrer(quoi)) blip(300, 0.05, 'sine', 0.03);
      return;
    }
    const c = e.target.closest && e.target.closest('.carte');
    if (!c) return;
    const id = parseInt(c.dataset.id, 10);
    if (deplacerCarte(id, state.slots.indexOf(id) === -1)) chord([523, 659], 55);
    else blip(300, 0.05, 'sine', 0.03);
  });

  $('achat').addEventListener('click', e => {
    const b = e.target.closest('.tri-opt');
    if (!b) return;
    const v = b.dataset.achat === 'max' ? 'max' : parseInt(b.dataset.achat, 10);
    if (v === state.achat || ACHATS.indexOf(v) === -1) return;
    state.achat = v;
    syncAchat();
    refresh();
    blip(440, 0.04, 'sine', 0.03);
  });
}

function start() {
  state = load();
  oublierPrimes();
  syncIncub();          // les primes peuvent donner des incubateurs : le tableau doit suivre
  buildChrome();
  bindTools();

  $('version').textContent = VERSION;
  $('btn-speed').textContent = '×' + state.speed;
  $('btn-sound').setAttribute('aria-pressed', String(state.sound));
  $('btn-tuto').setAttribute('aria-pressed', String(state.tuto));
  syncReglages();
  if (!(state.tri in TRIS)) state.tri = 'arrivee';
  if (!(state.triOeuf in TRIS_OEUF)) state.triOeuf = 'arrivee';
  if (ACHATS.indexOf(state.achat) === -1) state.achat = 1;
  syncTri();
  syncTriOeuf();
  syncAchat();

  catchUp();
  refresh();

  setInterval(loop, 100);
  setInterval(save, 5000);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { veilleDepuis = veilleDepuis || Date.now(); save(); return; }
    /* On revient : l'onglet caché s'est comporté comme une page fermée, et il se rattrape
       par le même chemin. `loop` a laissé `lastFrame` à l'heure à chaque tour passé derrière,
       donc rien ne s'est accumulé en double. */
    if (!veilleDepuis) return;
    catchUp(veilleDepuis);
    veilleDepuis = 0;
    refresh();
  });
}

start();
