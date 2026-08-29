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

   Les nombres, eux, continuent : `alpha` n'a jamais été un quatrième nombre, et la bêta ne
   remet rien à zéro. La pension est le majeur qui ouvrira la série 3. */
const VERSION = 'beta 1.1.0';

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
const SLOT_MULT  = 1.6;

/* Deux axes indépendants, à ne pas confondre :
   l'ÂGE est la progression d'une bête au fil de sa vie (têtard → crapaud → …),
   la RARETÉ est la lignée dont elle est issue et ne change jamais.

   Les deux axes sont calés pour s'ENCHAÎNER plutôt que se concurrencer : le multiplicateur
   d'une rareté fait sauter à peu près deux âges, et le coût d'évolution suit le même
   multiplicateur. Monter une rare coûte donc vingt-cinq fois ce que coûte une commune —
   on ne s'y met qu'une fois la ferme commune arrivée à maturité. Chaque rareté est une ère,
   pas un bonus.

   `plafond` ne sert qu'aux cartes de l'album : c'est ce qu'une capsule de cette rareté peut
   donner au mieux. Il monte bien plus doucement que `mult` — une carte mythique doit valoir
   mieux qu'une commune, pas quinze mille fois mieux. */
const RARITY = {
  commune:  { name: 'commune',  plur: 'communes',  mult: 1,     rank: 0, plafond: 1 },
  rare:     { name: 'rare',     plur: 'rares',     mult: 25,    rank: 1, plafond: 1.6 },
  epique:   { name: 'épique',   plur: 'épiques',   mult: 600,   rank: 2, plafond: 2.5 },
  mythique: { name: 'mythique', plur: 'mythiques', mult: 15000, rank: 3, plafond: 4 },
  /* LA MERVEILLEUSE VAUT EXACTEMENT CE QUE VAUT UNE MYTHIQUE, et c'est la décision la plus
     importante du rang. Elle est un cran de RARETÉ, pas un cran de PUISSANCE : elle ne rapporte
     pas plus, ne se vend pas plus cher, et sa carte ne plafonne pas plus haut.

     Sans cette règle, la pension redeviendrait une stratégie d'argent — tout le travail de la
     3.0.0 pour qu'elle n'en soit pas une tomberait sur la première merveille éclose. Et le rang
     le plus haut du jeu se mettrait à peser sur l'équilibrage de tout le reste.

     Ce qu'elle a que les autres n'ont pas tient en une phrase : AUCUN ŒUF NE LA DONNE. */
  merveilleuse: { name: 'merveilleuse', plur: 'merveilleuses', mult: 15000, rank: 4, plafond: 4,
                  secret: true },
};

/* ── UN RANG SECRET N'EXISTE PAS TANT QU'ON N'EN A PAS VU UN ───────────────────
   La cinquième rareté fuitait par cinq endroits à la fois : une section de collection vide
   avec dix cases grises, un dénominateur à 145 au lieu de 135, un trophée qui expliquait la
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
const rareteConnue = cle =>
  !RARITY[cle].secret ||
  LINES.some(l => l.rarity === cle && AGES.some((a, i) => state.seen[l.key + ':' + (i + 1)]));

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
function liste(mots) {
  if (mots.length <= 1) return mots[0] || '';
  return mots.slice(0, -1).join(', ') + ' et ' + mots[mots.length - 1];
}

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
  { key: 'rare', name: 'Œuf rare', price: 300000, glyph: '🥚', rarity: 'rare',
    hatch: 180, odds: { rare: 0.999, epique: 0.001 },
    dit: 'Le premier qui se réfléchit avant de l’acheter.' },
  { key: 'epique', name: 'Œuf épique', price: 7500000, glyph: '🥚', rarity: 'epique',
    hatch: 720, odds: { epique: 0.999, mythique: 0.001 },
    dit: 'On n’en achète pas par distraction.' },
  { key: 'mythique', name: 'Œuf mythique', price: 180000000, glyph: '🥚', rarity: 'mythique',
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

   Elle s'ouvre à L'ÂGE ADULTE — niveau 36 — et vaut la valeur de la bête étalée sur une
   heure. Elle était auparavant branchée sur l'embonpoint (« énorme »), c'est-à-dire sur la
   mauvaise échelle : un seuil que personne ne devine, et qui obligeait à comprendre la
   mangeoire avant de toucher le premier revenu passif. L'âge ouvre la rente, la taille
   l'augmente — l'embonpoint est déjà dans la valeur de vente, donc il la pousse tout seul.

   C'est peu : un enclos qui enchaîne les cycles rapporte deux à trois fois plus. Au moment
   où elle s'ouvre, elle pèse environ 2 % du revenu du joueur, qui vient justement de payer
   3 200 pièces d'évolutions pour ce premier adulte — elle arrive comme une confirmation,
   pas comme un raccourci. Elle ne remplace jamais l'élevage : elle récompense la poignée de
   bêtes qu'on avait de toute façon décidé de ne pas vendre.

   Ses facteurs sont déjà ceux du prix de vente — niveau, âge, rareté, teinte et taille —
   si bien qu'une bête rapporte à proportion exacte de ce qu'elle vaut. Le chromatique est
   le seul à recevoir un bonus par-dessus : c'est LA bête qu'un joueur garde. */
const AGE_RENTE     = 3;      // âge minimal : adulte. En deçà, rien du tout.
const NIV_RENTE     = AGES[AGE_RENTE - 2].niv + 1;   // le niveau 36, qu'on annonce d'avance
const RENTE_H       = 3600;   // une bête rapporte sa propre valeur en une heure
const RENTE_PRODIGE = 2;      // un chromatique double la sienne

/* ── Variantes ────────────────────────────────────────────────────────────────
   Tirées à l'éclosion et gardées À VIE, contrairement à la taille qu'une évolution
   remet à zéro : ce sont des identités, pas des états. C'est ce qui en fait une
   collection, et le brouillon direct des gènes du jalon 4.

   La TEINTE se voit — un filtre CSS recolore l'emoji, ce qui multiplie le bestiaire
   visible sans un seul dessin. Le TEMPÉRAMENT et le MOTIF ne sont que du texte : ils
   donnent une identité à chaque bête sans rien demander aux graphismes. */

const TINTS = [
  { key: 'ordinaire', name: '',          fem: '',          filter: '',                                                 mult: 1,    poids: 100 },
  { key: 'cendre',    name: 'cendré',    fem: 'cendrée',   filter: 'saturate(.3) brightness(.88)',                     mult: 1.10, poids: 22 },
  { key: 'ecarlate',  name: 'écarlate',  fem: 'écarlate',  filter: 'hue-rotate(-40deg) saturate(1.7)',                 mult: 1.15, poids: 18 },
  { key: 'azur',      name: 'azur',      fem: 'azur',      filter: 'hue-rotate(150deg) saturate(1.4)',                 mult: 1.15, poids: 18 },
  { key: 'jade',      name: 'jade',      fem: 'jade',      filter: 'hue-rotate(80deg) saturate(1.5)',                  mult: 1.20, poids: 14 },
  { key: 'amethyste', name: 'améthyste', fem: 'améthyste', filter: 'hue-rotate(230deg) saturate(1.5)',                 mult: 1.25, poids: 10 },
  { key: 'dore',      name: 'doré',      fem: 'dorée',     filter: 'hue-rotate(25deg) saturate(2.2) brightness(1.15)', mult: 1.30, poids: 6 },
  { key: 'albatre',   name: 'albâtre',   fem: 'albâtre',   filter: 'saturate(0) brightness(1.4)',                      mult: 1.40, poids: 3 },
];

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
const PRODIGE_MULT  = 25;
const PRODIGE_FILTER = 'saturate(2.4) brightness(1.3) drop-shadow(0 0 14px #E4A63E)';

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
   teintes. En insérer un au milieu redistribuerait les effets de tout l'album déjà gagné. */
const MOTIFS = ['uni', 'tacheté', 'rayé', 'moucheté', 'marbré', 'tigré', 'zébré', 'constellé',
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

   POURQUOI UNE MONNAIE ET PAS DES DOUBLONS. Une fusion classique demande deux cartes
   identiques ; ici c'est impossible. Une carte porte une lignée, un âge, un niveau, un motif,
   une teinte, un rang et un chromatique — près de treize millions de combinaisons. Deux
   exemplaires identiques n'arriveront jamais.

   Le problème réel n'est donc pas le doublon, c'est LA CARTE MÉDIOCRE : une ferme de vingt
   bêtes en produit vingt à chaque saut, dont trois valent la peine. La poussière transforme
   les dix-sept autres en carburant.

   LA RARETÉ EST DU MÊME CÔTÉ DES DEUX ÉQUATIONS, et c'est délibéré : elle multiplie ce qu'une
   carte rend ET ce qu'une fusion coûte, donc elle s'annule. Monter une commune ou une mythique
   demande le même nombre de cartes DE SA PROPRE RARETÉ — dix pour la deuxième étoile, quarante
   pour la troisième. Personne n'a intérêt à fondre ses mythiques pour nourrir ses communes.

   LA QUALITÉ N'ENTRE PAS. Niveau, teinte et rang décident déjà de la puissance : les faire
   entrer aussi punirait deux fois d'avoir une bonne carte, et rendrait « garder ou fondre »
   insoluble. Une carte vaut sa puissance, OU sa poussière, et les deux ne se ressemblent pas.

   ET ON NE DÉFAIT PAS UNE FUSION : les étoiles n'entrent pas dans ce qu'une carte rend. Sinon
   fusionner puis désintégrer fabriquerait de la poussière à l'infini. */
const POUSSIERE_BASE    = 10;
const POUSSIERE_RARETE  = { commune: 1, rare: 3, epique: 10, mythique: 30, merveilleuse: 90 };
const POUSSIERE_PRODIGE = 3;
const POUSSIERE_FOND    = 2;      // les fonds n'existent pas encore : le facteur dort
// ce qu'une bête sacrifiée à l'ascension laisse, en fraction de ce que sa carte aurait rendu
const POUSSIERE_SAUT    = 0.1;
// pour aller à la deuxième étoile, puis à la troisième — multiplié par la rareté
const FUSION_COUT       = [0, 100, 400];

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
  'constellé': { key: 'prodige', quoi: 'chance de chromatique', pas: 0.07, cap: 1.00, signe: 1,
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
   l'ascension en dépense un. Les paliers montent d'un MILLION à chaque cran — un million de
   pièces, puis mille milliards, puis un trillion — de sorte que le suivant ne se rattrape
   jamais par accident : il demande de refaire toute l'économie une fois de plus.

   UN PALIER FRANCHI EST FRANCHI POUR TOUJOURS. Il crédite son jeton une fois, puis il est
   mort : l'ascension remet la bourse à zéro, mais elle ne rend pas les paliers déjà passés.
   Le nombre total d'ascensions d'une partie est donc borné par cette échelle, et par elle
   seule — et comme les emplacements le sont aussi, la puissance maximale de l'album reste un
   nombre qu'on peut calculer avant d'avoir joué.

   RIEN N'OBLIGE JAMAIS À ASCENSIONNER. C'est un sacrifice qu'on choisit : on perd sa ferme
   entière contre quelques cartes. Un jeton en poche ne réclame rien, ne clignote pas et
   n'expire pas — il attend.

   LE PREMIER TOMBE EN MILIEU DE PARTIE, pas avant. Un million de pièces suppose d'avoir mené
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
  { cle: 'acheteur',  prix: 2000,      glyphe: '🥚', nom: 'Acheteur automatique',
    dit: 'Rachète un œuf dès qu’un incubateur se libère et que ta réserve est vide.' },
  { cle: 'negoce-commune', prix: 4000, glyphe: '🪙', nom: 'Négoce commun',
    dit: 'Les communes se vendent un quart plus cher.' },
  { cle: 'poigne',    prix: 8000,      glyphe: '✊', nom: 'Poigne',
    dit: 'Trois secondes de plus à chaque clic, quoi que tu aies acheté par ailleurs.' },
  { cle: 'marchand',  prix: 15000,     glyphe: '🤝', nom: 'Marchand automatique',
    dit: 'Vend les bêtes mûres tout seul, à l’âge que tu règles pour chaque rareté.' },
  { cle: 'grossiste', prix: 30000,     glyphe: '📦', nom: 'Grossiste',
    dit: 'Les œufs de la boutique coûtent un cinquième de moins.' },
  { cle: 'evolution', prix: 50000,     glyphe: '🧬', nom: 'Évolution automatique',
    dit: 'Fait passer les bêtes mûres d’un âge au suivant, jusqu’où tu décides. Elle agit avant le marchand.' },
  { cle: 'negoce-rare', prix: 80000,   glyphe: '🔷', nom: 'Négoce rare',
    dit: 'Les rares se vendent un quart plus cher.' },
  { cle: 'etable',    prix: 150000,    glyphe: '⭐', nom: 'Étable',
    dit: 'Les bêtes que tu gardes ☆ ne comptent plus dans la limite d’enclos. Une ménagerie cesse de coûter du débit.' },
  { cle: 'intendance', prix: 250000,   glyphe: '📋', nom: 'Intendance',
    dit: 'Chaque évolution coûte un quart de moins. Passé l’ère commune, ce n’est plus la vitesse qui freine mais la mise de fonds.' },
  { cle: 'pension',   prix: 400000,    glyphe: '🛖', nom: 'La pension',
    dit: 'Un bâtiment où confier deux bêtes adultes. Elles gardent leur enclos, cessent de rapporter, et pondent un œuf dont tu connais déjà la lignée.' },
  { cle: 'oeil',      prix: 500000,    glyphe: '👁️', nom: 'Œil exercé',
    dit: 'Une chance sur deux de plus de voir naître un chromatique — de 1 sur 8 192 à 1 sur 5 461.' },
  { cle: 'generosite', prix: 1000000,  glyphe: '🎁', nom: 'Générosité',
    dit: 'Les cadeaux de frénésie durent deux fois plus longtemps, et le plafond suit.' },
  { cle: 'negoce-epique', prix: 2000000, glyphe: '🔮', nom: 'Négoce épique',
    dit: 'Les épiques se vendent un quart plus cher.' },
  { cle: 'intendance2', prix: 5000000, glyphe: '📜', nom: 'Grande intendance',
    dit: 'Encore un quart de moins sur chaque évolution, par-dessus l’Intendance.' },
  { cle: 'couvoir',   prix: 12000000,  glyphe: '🏠', nom: 'Couvoir',
    dit: 'Trois incubateurs de plus, offerts.' },
  { cle: 'paturage',  prix: 30000000,  glyphe: '🏞️', nom: 'Pâturage',
    dit: 'Trois enclos de plus, offerts.' },
  { cle: 'negoce-mythique', prix: 80000000, glyphe: '👑', nom: 'Négoce mythique',
    dit: 'Les mythiques se vendent un quart plus cher.' },
  { cle: 'main',      prix: 200000000, glyphe: '🖐️', nom: 'Main preste',
    dit: 'Chacun de tes clics compte double. Le plus cher, et le seul qui touche à ce que tu fais de tes mains.' },
];
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
  { cle: 'peage', test: () => state.coins >= EVOLVE[0] && state.pen.some(estMur), repliques: [
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
    value: n => n / GRAIN, unit: '× la vitesse de croissance' },
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
};

/* La règle de repli, écrite une seule fois : un âge sans dessin prend celui de l'âge le
   plus proche en dessous. La scène, les vignettes et la collection s'en servent toutes,
   sinon la collection montrerait autre chose que le jeu. */
function artAt(lineKey, age) {
  const table = ART[lineKey];
  if (!table) return null;
  for (let a = age; a >= 1; a--) if (table[a]) return 'art/' + table[a];
  return null;
}

// Un âge, une forme, un dessin. Le détour par « le dessin du palier précédent » n'existe
// plus : c'était le pansement sur une bête qui redevenait enfant à chaque évolution.
const artFor = c => artAt(c.line, c.age);

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
const SAVE_V = 16;          // le numéro de ce que le fichier sait produire aujourd'hui
const OFFLINE_CAP = 24 * 3600;

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
    buyKind: 'commun',      // ce que rachète l'acheteur automatique
    incubators: 1,
    pens: 1,
    incub: [{ line: rollLine('commun'), p: 0, kind: 'commun' }],   // le premier œuf est offert
    pen: [],
    sel: 'i:0',
    up: { clic: 0, couveuse: 0, eleveur: 0, mangeoire: 0 },
    // les primes achetées, par clé. Elles ne traversent pas l'ascension.
    primes: {},
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
    asc: { n: 0, paliers: 0, jetons: 0 },
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
const tireLigne = kind => {
  const file = (state.pension && state.pension.dus && state.pension.dus[kind]) || [];
  return file.length ? file.shift() : rollLine(kind);
};

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
    if (!EGG_BY_KEY[merged.buyKind]) merged.buyKind = 'commun';
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
    merged.asc = Object.assign({ n: 0, paliers: 0, jetons: 0 }, merged.asc || {});
    delete merged.asc.done;
    merged.asc.n = merged.asc.n || 0;
    merged.asc.paliers = merged.asc.paliers || 0;
    merged.asc.jetons = merged.asc.jetons || 0;
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
const tintOf    = c => TINTS[c.tint] || TINTS[0];
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

function qualiteDe(k) {
  const q = 0.50 * ((k.niv || 1) / NIV_MAX)
          + 0.20 * ((k.tint || 0) / (TINTS.length - 1))
          + 0.20 * ((k.rank || 0) / (RANKS.length - 1))
          + 0.10 * (k.prodige ? 1 : 0);
  return 0.4 + 0.6 * q;      // de 0,40 pour une carte bâclée à 1,00 pour un trophée
}
const puissanceDe = k => plafondDe(k) * ETOILES[(k.etoiles || 1) - 1] * qualiteDe(k);

const rareteDe    = k => LINE_BY_KEY[k.line].rarity;
// Ce qu'une carte rend si on la fond. Les étoiles n'entrent pas : on ne défait pas une fusion.
const poussiereDe = k => Math.round(POUSSIERE_BASE * POUSSIERE_RARETE[rareteDe(k)]
                                    * (k.prodige ? POUSSIERE_PRODIGE : 1)
                                    * (k.fond ? POUSSIERE_FOND : 1));
// Ce que coûte l'étoile suivante, ou null quand la carte est au bout.
const coutFusion  = k => (k.etoiles || 1) >= ETOILES.length ? null
                       : FUSION_COUT[k.etoiles || 1] * POUSSIERE_RARETE[rareteDe(k)];

/* Ce que l'album ajoute, famille par famille. Recalculé seulement quand les cartes équipées
   changent — c'est-à-dire à l'ascension et au chargement : baseValue l'appelle une fois par
   bête et par image, et refaire la somme à chaque appel se paierait à l'écran. */
let bonusCache = null;
const oublierAlbum = () => { bonusCache = null; };
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

const variantMult = c => tintOf(c).mult * (c.prodige ? PRODIGE_MULT : 1);
// Une prime de négoce par rareté : c'est le seul bonus du jeu qui ne vaut que pour une
// partie du bestiaire, et c'est ce qui lui donne un sens de choix plutôt que de cumul.
const negoce    = c => prime('negoce-' + lineOf(c).rarity) ? 1.25 : 1;
const baseValue = c => VALUE[c.age - 1] * rarityOf(c).mult * variantMult(c)
                     * (1 + bonusAlbum().valeur) * negoce(c);

function pickWeighted(list) {
  let total = list.reduce((s, x) => s + x.poids, 0), r = Math.random() * total;
  for (let i = 0; i < list.length; i++) { r -= list[i].poids; if (r < 0) return i; }
  return 0;
}

// Tiré une fois, à l'éclosion, et jamais retouché ensuite.
function rollVariants() {
  return {
    tint: pickWeighted(TINTS),
    temper: Math.floor(Math.random() * TEMPERS.length),
    motif: Math.floor(Math.random() * MOTIFS.length),
    // le constellé pousse la base, il ne s'y ajoute pas : ×2 au plus sur tout l'album
    prodige: Math.random() < PRODIGE_ODDS * (1 + bonusAlbum().prodige) * (prime('oeil') ? 1.5 : 1),
  };
}

/* À partir de quel âge la bête rembourse l'œuf dont elle sort. Un œuf cher n'est pas un lot
   à encaisser : enfant, une mythique payée 200 000 ne vaut que 1 600. Tous les œufs payants
   se remboursent à l'âge ancien, jamais avant — autant le dire plutôt que de laisser le
   joueur le découvrir en perdant sa mise. */
function seuilRentable(c) {
  const rar = rarityOf(c).mult, b = bonusAlbum();
  const mult = rar * variantMult(c) * (1 + b.valeur);
  let cumul = 0;
  for (let a = 1; a <= AGES.length; a++) {
    if (a > 1) cumul += (EVOLVE[a - 2] || 0) * rar * (1 - b.peage);
    if (VALUE[a - 1] * mult - cumul >= (c.cost || 0)) return a;
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

function epithetOf(c) {
  if (c.prodige) return 'chromatique';
  if (tintOf(c).name) return accord(tintOf(c), c);
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
const bestStocked = () => (EGG_KINDS.slice().reverse().find(e => eggStock(e.key)) || {}).key;
// Le coût d'évolution suit la rareté : sans ça, une rare obtenue par chance se montait au
// l'âge légende pour le prix d'une commune, et toute la progression se court-circuitait.
// L'intendant s'applique par-dessus, en remise qui approche la moitié sans jamais l'atteindre :
// une évolution ne devient donc jamais gratuite, quel que soit le nombre de niveaux achetés.
const evoRemise = () => (prime('intendance') ? 0.75 : 1) * (prime('intendance2') ? 0.75 : 1);
const evoCost   = c => EVOLVE[c.age - 1] === null ? null
                     : Math.round(EVOLVE[c.age - 1] * rarityOf(c).mult * evoRemise()
                                  * (1 - bonusAlbum().peage));

/* Le prix d'un œuf passe toujours par ici : le zébré de l'album le baisse, et un prix qui
   s'afficherait ailleurs qu'à l'endroit où il se paie finirait par mentir. */
const prixOeuf  = e => Math.max(1, Math.round(e.price * (1 - bonusAlbum().oeuf)
                                              * (prime('grossiste') ? 0.8 : 1)));
const form      = (lineKey, age) => LINE_BY_KEY[lineKey].forms[age - 1];
/* Les enclos des primes s'ajoutent au compte, JAMAIS au prix : `penCost` continue de se
   fonder sur `state.pens`, ce qu'on a réellement acheté. Sinon une prime rendrait le prochain
   enclos plus cher, ce qui reviendrait à le faire payer deux fois.

   L'album n'entre plus ici : la carte perlée qui donnait des enclos a laissé la place au
   martelé. Trois sources pour un même axe, c'était deux de trop. */
const pensTotal = () => state.pens
                      + (prime('paille') ? 2 : 0) + (prime('paturage') ? 3 : 0);
/* L'étable sort les bêtes gardées du compte. Garder coûtait un enclos, donc du débit : c'est
   ce qui rendait toute collection payante. Après elle, une ménagerie ne ralentit plus rien. */
const penUsed   = () => prime('etable') ? state.pen.filter(c => !c.keep).length : state.pen.length;
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
const prime       = cle => !!(state.primes && state.primes[cle]);

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

/* Le doublement se pose ICI, à la source : clickGain en découle, et `remaining()` compte
   déjà en clics à partir de la même fonction — la frénésie annonce donc toute seule qu'il
   reste deux fois moins de clics à donner, sans une ligne de plus. */
const clickPower  = () => (1 + force('clic') + (prime('poigne') ? 3 : 0)) *
                          (prime('main') ? 2 : 1) * (enFrenesie() ? FRENESIE_X : 1) *
                          (1 + bonusAlbum().clic);

/* La vitesse à laquelle le sujet avance sans toi : l'automate qui s'en occupe à cet
   instant précis, et 0 tant qu'aucun n'est acheté. */
const autoRate = s => s.kind === 'egg' ? force('couveuse')
                    : estMur(s.c) ? FATTEN_X * force('mangeoire') * temperOf(s.c).fat
                    : force('eleveur');

/* Ce que l'album ajoute à CE sujet-là, selon ce qu'il est en train de faire : un œuf couve,
   une bête grandit, une bête mûre engraisse. Trois familles de motifs, une seule fonction. */
const albumVitesse = s => {
  const b = bonusAlbum();
  return 1 + (s.kind === 'egg' ? b.couvee : estMur(s.c) ? b.gras : b.pousse);
};

// La vitesse réellement observée : celle des automates, poussée par l'album. C'est elle
// qu'il faut afficher, sinon le panneau annonce une durée que la barre ne tient pas.
const autoReel = s => autoRate(s) * albumVitesse(s);

/* Un clic vaut toujours le même temps réel, quoi qu'on ait automatisé. Sans ça les
   automates nerfaient le clic au moment même où on payait pour aller plus vite :
   à éleveur ×7, un « +14 s » n'avançait la bête que de deux secondes de ce que la
   machine faisait déjà. Le clic apporte donc clickPower secondes d'automate — il reste
   un raccourci qui se sent, du premier œuf au centième niveau. */
/* L'album multiplie le clic AVANT le plancher, pas après : c'est ce qui le fait sentir dès
   la première seconde d'une nouvelle partie, quand plus aucun automate n'est acheté. Une fois
   un automate en route, le produit redonne exactement la vitesse réelle de la machine. */
const clickGain = s => clickPower() * albumVitesse(s) * Math.max(1, autoRate(s));

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
                     * (1 + bonusAlbum().rente)
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

function subjects() {
  const list = state.incub.map((slot, i) => ({ key: 'i:' + i, kind: 'egg', i, slot }));
  const betes = state.pen.map(c => ({ key: 'c:' + c.id, kind: 'creature', c }));
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

function select(key) {
  state.sel = key;
  refresh();
}

/* ─────────────────────────────────────────────
   Effets — le clic doit être agréable
   ───────────────────────────────────────────── */

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
    if (!mainDeCarte) state.stats.clics++;
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
  const avantNiv = niveau(c), avantMur = estMur(c);
  const avantRang = rankOf(sizeFactor(c)).i, avantValeur = sellValue(c);
  /* Un clic ajoute de la vie avant comme après la maturité : la créature ne cesse jamais de
     grandir. Mûre, elle ne monte plus de niveau tant que le péage n'est pas payé — ce
     qu'elle avale part alors dans l'embonpoint, et n'y sera pas perdu. */
  if (avantMur) c.over = (c.over || 0) + power;
  else c.p = Math.min(bandTo(c), c.p + power * growRate(c));
  if (!mainDeCarte) state.stats.clics++;
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

function placeEgg(i, kind) {
  kind = kind || bestStocked();
  if (state.incub[i] || !kind || !eggStock(kind)) return;
  state.eggs[kind]--;
  state.incub[i] = { line: tireLigne(kind), p: 0, kind };
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
                           rollVariants());
    // un prodige est protégé d'office : on ne perd pas une bête sur huit mille
    // parce que le marchand l'a vendue avant qu'on l'ait vue
    if (c.prodige) { c.keep = true; state.stats.prodiges++; }
    state.pen.push(c);
    state.incub[i] = null;
    markSeen(slot.line, 1);
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
  state.eggs[kind] = eggStock(kind) + 1;
  const free = state.incub.indexOf(null);
  if (free !== -1) placeEgg(free, kind); else { blip(300, 0.04, 'sine', 0.03); refresh(); }
}

/* Une prime s'achète une fois, ne se revend pas, et n'a pas de niveau. La seule chose à
   surveiller est le tableau des incubateurs, qui doit suivre quand la prime en donne. */
function buyPrime(p) {
  if (prime(p.cle) || state.coins < p.prix) return;
  state.coins -= p.prix;
  state.primes[p.cle] = true;
  if (p.cle === 'nichoir' || p.cle === 'couvoir') syncIncub();
  chord([392, 523, 659], 70);
  const pt = centerOf($('subject'));
  floatText(pt.x, pt.y - 60, p.glyphe + ' ' + p.nom, 'gain');
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
  const couve = force('couveuse') * (1 + b.couvee), eleve = force('eleveur') * (1 + b.pousse);
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
  avancePension(dt);
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

       ☆ Garder est la seule protection, et c'est le bon endroit : elle est explicite, elle se
       voit sur la vignette, et c'est le joueur qui la pose. */
    const ready = state.pen.filter(c => !c.keep && !enPension(c) &&
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
    const debit = dt * FATTEN_X * force('mangeoire') * (1 + bonusAlbum().gras);
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
  for (let i = 0; i < state.incub.length && totalEggs(); i++) {
    if (state.incub[i]) continue;
    const kind = bestStocked();
    state.eggs[kind]--;
    state.incub[i] = { line: tireLigne(kind), p: 0, kind };
  }

  /* L'acheteur prend le relais quand la réserve est sèche. C'est la seule moitié qui se paie,
     et c'est la bonne : DÉPENSER à ta place est une décision, poser un œuf déjà acheté n'en
     est pas une. */
  if (prime('acheteur')) {
    const voulu = EGG_BY_KEY[state.buyKind] || EGG_BY_KEY.commun;
    for (let i = 0; i < state.incub.length; i++) {
      if (state.incub[i]) continue;
      const prix = prixOeuf(voulu);
      if (state.coins < prix) break;   // incubateur vide plutôt que consigne bradée
      state.coins -= prix;
      bilanAuto.depense += prix;
      state.incub[i] = { line: rollLine(voulu.key), p: 0, kind: voulu.key };   // acheté, donc tiré
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
  const par = bonusAlbum().clicAuto;
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
  const large = prime('generosite') ? 2 : 1;
  const duree = FRENESIE[Math.min(palier, FRENESIE.length) - 1] * large;
  // les cadeaux s'ajoutent sans jamais dépasser la minute : deux ×2 ne feront pas un ×4
  state.frenesie = Math.min(FRENESIE_MAX * large, (state.frenesie || 0) + duree);
  state.dons = (state.dons || 0) + 1;
  const pt = centerOf($('subject'));
  floatText(pt.x, pt.y - 90, '⚡ cadeau · clic ×2 pendant ' + duree + ' s', 'gain');
  chord([523, 659, 784, 1046], 70);
}

/* ── LA PAUSE ──────────────────────────────────────────────────────────────────
   Un bouton qui arrête la ferme. Il existe pour une raison précise : la pension se remplit au
   glisser-déposer, et arranger deux parents pendant que le marchand vend, que l'évolution
   monte et que les bêtes grandissent, c'est arranger une bande qui bouge sous la main.

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
  b.title = enPause ? 'Reprendre la ferme' : 'Mettre la ferme en pause — rien ne pousse, rien ne se vend';
  const note = $('pause-note');
  note.hidden = !enPause;
  setText(note, 'La ferme est arrêtée. Rien ne pousse, rien ne se vend, rien ne couve — ' +
                'le moment de composer un couple à la pension.');
  document.body.classList.toggle('en-pause', enPause);
  refresh();
}

function loop() {
  const now = Date.now();
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
  tickJoie(dt);
  tickOcelle(dt);
  verifierTrophees();
  state.stats.temps += dt / state.speed;   // du temps vécu, pas du temps simulé
  if (state.coins > state.stats.fortune) state.stats.fortune = state.coins;
  hatchAll();          // hatchAll rafraîchit déjà l'affichage
  renderTuto();        // les seuils se franchissent aussi entre deux redessins
}

function catchUp() {
  const elapsed = Math.min(OFFLINE_CAP, (Date.now() - (state.t || Date.now())) / 1000);
  lastFrame = Date.now();
  // une première partie ne doit pas s'ouvrir sur « pendant ton absence », et tant que rien
  // n'est automatisé il ne s'est effectivement rien passé pendant l'absence
  if (isNewGame || elapsed < 30) return;
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
  note.innerHTML = '<b>Pendant ton absence (' + fmtTime(elapsed) + ')</b> — ' +
    (bits.length ? bits.join(', ') + '.' : 'rien de neuf, tout tournait déjà.');
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
function remplirMenus() {
  const option = (v, t) => { const o = document.createElement('option'); o.value = v; o.textContent = t; return o; };

  const ach = $('sel-acheteur');
  ach.textContent = '';
  for (const e of OEUFS_VENDUS) {
    ach.appendChild(option(e.key, e.name.replace('Œuf ', 'Œufs ') + 's — ' +
      fmt(prixOeuf(e)) + ', couve en ' + fmtTime(e.hatch)));
  }

  for (const cle of Object.keys(RARITY)) {
    const rang = $('taille-' + cle);
    rang.textContent = '';
    rang.appendChild(option(0, 'n’importe laquelle'));
    RANKS.forEach((r, i) => {
      if (!i) return;
      rang.appendChild(option(i, r.fem + (i < RANKS.length - 1 ? ' ou plus' : '') +
        ' — vaut ×' + dec(r.at)));
    });
  }

  // un menu par rareté : même liste d'âges, réglée séparément
  for (const cle of Object.keys(RARITY)) {
    const sel = $('vente-' + cle);
    sel.textContent = '';
    sel.appendChild(option(0, 'jamais — je les garde'));
    /* « dès l'âge adolescent » se lit comme « dès qu'elle est adolescente », alors que le
       marchand attend qu'elle soit MÛRE de cet âge — sinon il la braderait à 15 % de son
       prix. Le montant affiché est justement celui d'une bête mûre : le libellé doit dire
       la même chose que le chiffre qu'il porte. */
    AGES.forEach((a, i) => {
      sel.appendChild(option(i + 1, 'mûres à l’âge ' + a.nom +
        (i < AGES.length - 1 ? ' et au-dessus' : ', la forme finale') +
        ' — ' + fmt(a.value * RARITY[cle].mult)));
    });
  }

  // un menu par rareté, et le prix du chemin en clair : c'est lui qui fait la décision
  for (const cle of Object.keys(RARITY)) {
    const sel = $('evolution-' + cle);
    sel.textContent = '';
    sel.appendChild(option(0, 'jamais — je les fais monter moi-même'));
    AGES.forEach((a, i) => {
      if (!i) return;
      const facture = EVOLVE.slice(0, i).reduce((n, v) => n + (v || 0), 0) * RARITY[cle].mult;
      sel.appendChild(option(i + 1, 'jusqu’à l’âge ' + a.nom +
        (i === AGES.length - 1 ? ', la forme finale' : '') + ' — ' + fmt(facture)));
    });
  }
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
    b.innerHTML = '<span class="t"></span><span class="p"></span><span class="d"></span>';
    b.querySelector('.t').textContent = it.title;
    b.querySelector('.d').textContent = it.desc;
    b.addEventListener('click', it.run);
    if (it.rarity) b.classList.add('egg-' + it.rarity);
    li.appendChild(b);
    shop.appendChild(li);
    refs.shop[it.key] = { li, el: b, price: b.querySelector('.p'), desc: b.querySelector('.d'),
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
    b.addEventListener('click', () => buyPrime(p));
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
    b.innerHTML = '<span class="t"></span><span class="p"></span><span class="d"></span>';
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
  const sig = list.map(s => s.kind === 'egg'
    ? 'i' + s.i + (s.slot ? ':' + s.slot.line : ':-')
    : 'c' + s.c.id + ':' + s.c.age + (s.c.keep ? ':k' : '')).join(',');
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

  peupler($('strip-pen'), list.filter(s => s.kind === 'creature'));
  peupler($('strip-incub'), list.filter(s => s.kind === 'egg'));
}

// Le segment de tri ne change qu'au clic : pas la peine de le repasser à chaque image.
function syncTri() {
  for (const b of $('tri').children) b.setAttribute('aria-pressed', String(b.dataset.tri === state.tri));
}

function syncAchat() {
  for (const b of $('achat').children) {
    b.setAttribute('aria-pressed', String(b.dataset.achat === String(state.achat)));
  }
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
    t.glyph.textContent = s.slot ? k.glyph : '◌';
    if (!s.slot) b.classList.add('empty'); else b.classList.add('egg-' + k.key);
    t.tag.textContent = s.slot ? (k.key === 'commun' ? 'œuf' : k.key) : 'libre';
  } else {
    b.classList.add('rar-' + lineOf(s.c).rarity);
    if (s.c.prodige) b.classList.add('prodige');
    if (s.c.keep) b.classList.add('gardee');
    t.glyph.style.filter = s.c.prodige ? PRODIGE_FILTER : tintOf(s.c).filter;
    setCreature(t.glyph, artFor(s.c), glyphOf(s.c));
    /* L'ÂGE d'une vignette ne se lit que dans la forme du dessin, ce qui suppose de connaître
       la lignée. Le survol le nomme. Il est posé ici et non dans tickView : l'âge ne change
       que quatre fois dans une vie, alors que la boucle passe dix fois par seconde. */
    b.title = fullName(s.c) + ' — ' + AGES[s.c.age - 1].nom +
              ' · ' + rarityOf(s.c).name.toLowerCase();
    if (s.c.age === AGES.length) b.classList.add('apex');
  }
}

/* Plie ou déplie une partie de la collection. `cle` vaut 'tout' pour la section entière, ou
   une rareté pour un seul groupe. */
function plier(cle) {
  state.plie[cle] = !state.plie[cle];
  collSig = null;               // la signature porte l'état de pliage : on force le redessin
  refresh();
  save();
}
const estPlie = cle => !!(state.plie && state.plie[cle]);

function renderCollection() {
  /* La signature porte AUSSI le pliage : sans ça, replier un groupe ne redessinerait rien,
     puisque le nombre de formes rencontrées n'a pas bougé. */
  const sig = seenCount() + '|' + LINES.map(l => l.rarity)
    .filter((r, i, t) => t.indexOf(r) === i).map(r => estPlie(r) ? 1 : 0).join('') +
    '|' + raretesConnues().join(',');
  if (sig === collSig) return;
  collSig = sig;

  const host = $('collection');
  host.textContent = '';
  let rarity = null, grille = null;
  for (const line of LINES) {
    // un rang secret n'a ni section ni cases tant qu'on n'en a pas rencontré une bête
    if (!rareteConnue(line.rarity)) continue;
    // un intertitre à chaque changement de rareté : c'est la hiérarchie, rendue lisible
    if (line.rarity !== rarity) {
      rarity = line.rarity;
      const cle = rarity;
      const h = document.createElement('button');
      h.type = 'button';
      h.className = 'coll-head rar-' + rarity;
      h.setAttribute('aria-expanded', String(!estPlie(cle)));
      h.innerHTML = '<span class="plier" aria-hidden="true"></span><span class="coll-nom"></span>';
      h.querySelector('.plier').textContent = estPlie(cle) ? '▸' : '▾';
      /* LE TITRE DIT CE QUI DISTINGUE LA SECTION, pas ce qu’elle a en commun avec la
         voisine. La merveilleuse vaut autant qu’une mythique : afficher « ×15000 » deux
         fois de suite ressemble à un bug, alors que ce qui la sépare tient en trois mots. */
      const achetable = EGG_KINDS.some(e => e.price && e.rarity === rarity);
      h.querySelector('.coll-nom').textContent = RARITY[rarity].name +
        (achetable ? ' · ×' + RARITY[rarity].mult : ' · ne s’achète pas');
      h.addEventListener('click', () => plier(cle));
      host.appendChild(h);
      grille = document.createElement('div');
      grille.className = 'coll-grille';
      grille.hidden = estPlie(cle);
      host.appendChild(grille);
    }
    const dedans = grille;
    AGES.forEach((age, i) => {
      const a = i + 1, got = !!state.seen[line.key + ':' + a];
      const cell = document.createElement('div');
      cell.className = 'cell rar-' + line.rarity + (got ? ' got' : ' locked') +
                       (a === AGES.length ? ' t5' : '');
      cell.title = (got ? line.forms[i][0] : line.name + ' — ' + age.nom) +
                   ' (' + RARITY[line.rarity].name + ')';
      if (got) setCreature(cell, artAt(line.key, a), line.forms[i][1]);
      dedans.appendChild(cell);
    });
  }
  $('coll-meta').textContent = seenCount() + ' / ' + formesVisibles();
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
   l'œuf rare à 300 000 dès les premières pièces — sept mille fois la bourse d'un débutant —
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
const peutAscensionner = () => (state.asc.jetons || 0) > 0 &&
  ((state.asc.n || 0) > 0 || (state.asc.paliers || 0) >= RANG_PREMIER);

// Le prochain palier à franchir, null quand l'échelle est épuisée.
const prochainPalier = () => (state.asc.paliers < JETON_PALIERS.length
                              ? JETON_PALIERS[state.asc.paliers] : null);

/* Crédite les paliers que la bourse vient de dépasser. Appelée dans la boucle ET pendant le
   rattrapage d'une absence : un palier franchi pendant qu'on n'était pas là est franchi quand
   même. La boucle `while` traite le cas d'une vente qui saute deux paliers d'un coup. */
function crediterJetons() {
  let seuil;
  while ((seuil = prochainPalier()) !== null && state.coins >= seuil) {
    state.asc.paliers++;
    state.asc.jetons++;
  }
}



/* La bête telle qu'elle était, figée. `capsuleBrute` ne consomme pas d'identifiant : l'écran
   d'ascension en fabrique une par bête pour montrer ce que le saut donnera, et ces
   aperçus-là sont jetés si le joueur referme sans valider. */
function capsuleBrute(c) {
  return { line: c.line, age: c.age, niv: niveau(c), motif: c.motif, tint: c.tint,
           temper: c.temper, rank: rankOf(sizeFactor(c)).i, prodige: !!c.prodige, etoiles: 1 };
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

function carteEl(k) {
  const el = document.createElement('div');
  el.className = 'carte rar-' + LINE_BY_KEY[k.line].rarity;
  el.dataset.id = k.id;
  el.innerHTML = '<span class="carte-bete"></span><span class="carte-txt">' +
                 '<b class="carte-nom"></b><i class="carte-eff"></i>' +
                 '<i class="carte-etoiles"></i></span>' +
                 '<span class="carte-actes">' +
                 '<button type="button" class="carte-acte fondre"></button>' +
                 '<button type="button" class="carte-acte fusion"></button></span>';
  const bete = el.querySelector('.carte-bete');
  setCreature(bete, artAt(k.line, k.age), form(k.line, k.age)[1]);
  bete.style.filter = k.prodige ? PRODIGE_FILTER : (TINTS[k.tint] || TINTS[0]).filter;
  el.querySelector('.carte-nom').textContent = nomCarte(k);
  el.querySelector('.carte-eff').textContent = effetCarte(k);
  /* L'INFOBULLE DIT CE QUE L'EFFET FAIT, en mots. « rente +140 % » n'apprend rien à qui
     ignore ce qu'est une rente, et c'était le cas de la moitié de la table. */
  el.title = nomCarte(k) + ' — niveau ' + k.niv + ', ' + nomAge(k.age, k.rank) +
             ' · puissance ' + dec(puissanceDe(k), 2) + '\n\n' + motifBonus(k).dit;

  const e = k.etoiles || 1;
  el.querySelector('.carte-etoiles').textContent = '★'.repeat(e) + '☆'.repeat(ETOILES.length - e);

  /* Les deux gestes portent leur PRIX sur eux. Une carte se fond ou se fusionne, et les deux
     décisions se prennent en regardant le même nombre : ce qu'elle rend, ce que l'étoile
     suivante coûte. Les cacher derrière un menu rendrait l'arbitrage invisible. */
  const fondre = el.querySelector('.fondre'), fusion = el.querySelector('.fusion');
  const equipee = state.slots.indexOf(k.id) !== -1;
  fondre.textContent = '✧ ' + fmt(poussiereDe(k));
  fondre.disabled = equipee;
  fondre.title = equipee ? 'Retire-la de tes cartes actives avant de la fondre.'
                         : 'Fondre : + ' + fmt(poussiereDe(k)) + ' de poussière. Sans retour.';
  const cout = coutFusion(k);
  fusion.textContent = cout === null ? '★★★' : '★ ' + fmt(cout);
  fusion.disabled = cout === null || (state.poussiere || 0) < cout;
  fusion.title = cout === null ? 'Elle est au bout : trois étoiles.'
               : 'Fusionner : ' + fmt(cout) + ' de poussière pour la ' +
                 (e + 1) + 'e étoile. Tu en as ' + fmt(state.poussiere || 0) + '.';
  return el;
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

// Monter une carte d'une étoile. Deux fusions au plus : ETOILES n'a que trois entrées.
function fusionner(id) {
  const k = carteDe(id);
  if (!k) return false;
  const cout = coutFusion(k);
  if (cout === null || (state.poussiere || 0) < cout) return false;
  state.poussiere -= cout;
  k.etoiles = (k.etoiles || 1) + 1;
  state.stats.fusions = (state.stats.fusions || 0) + 1;
  oublierAlbum();
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
  const jetons = state.asc.jetons || 0;
  const neuves = subjects().filter(s => s.kind === 'creature')
    .map(s => Object.assign(capsuleBrute(s.c), { id: -s.c.id }));
  return { jetons, neuves, max: jetons };
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
    'Sauter les dépense tous, employés ou non — rien ne t’oblige à sauter, ni maintenant ni jamais.' +
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
}

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
  state = Object.assign(freshState(), {
    album, slots,
    /* Les paliers déjà franchis ne reviennent pas : la bourse repart de zéro, l'échelle non.
       C'est ce qui fait qu'une partie a un nombre fini d'ascensions. */
    // tous les jetons partent, employés ou non : c'est le prix de sauter trop tôt
    asc: { n: (state.asc.n || 0) + 1, paliers: state.asc.paliers, jetons: 0 },
    seen: state.seen, tri: state.tri, achat: state.achat, sound: state.sound,
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
  refresh();
  save();
  chord([392, 523, 659, 784], 90);
}

/* LA SCÈNE A TROIS CAS QUI N'ONT RIEN EN COMMUN : une case vide, un œuf qui couve, une bête
   qui vit. Ils tenaient dans une seule fonction de deux cent vingt lignes où trois jeux de
   variables se croisaient sans jamais se servir les uns des autres — `stage` et `subject` ne
   servaient qu'aux deux derniers, `slot` qu'au deuxième, la moitié du reste qu'au troisième. */
function renderStage() {
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
  setCreature($('stage-glyph'), null, slot ? kind.glyph : '◌');
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
  // point décimal obligatoire : le CSS ne sait pas lire « 1,5 »
  setVar(subject, '--sz', visualScale(c).toFixed(3));
  setFilter($('stage-glyph'), c.prodige ? PRODIGE_FILTER : tintOf(c).filter);
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
      setText($('stage-timer'), 'plus aucun rang au-dessus');
    }
    $('stage-timer').classList.add('done');
    setText($('stage-hint'), c.age < AGES.length
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
      const pas = ageGrow(c) / nivDansAge(c.age), brut = force('eleveur'), n = brut * alb;
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
  if (alb > 1) bouts.push('album ×' + dec(alb, 2));
  if (enFrenesie()) bouts.push('frénésie ×' + FRENESIE_X);
  bouts.push('un clic vaut ' + fmt(clickGain(sujet)) + ' s');
  return bouts.join('  ·  ');
}

// ce que la bête vaudra une fois mûre à tel âge, taille ordinaire
function valeurAu(c, age) {
  return Math.round(VALUE[age - 1] * rarityOf(c).mult * variantMult(c)
                    * (1 + bonusAlbum().valeur));
}

function noteAcheteur() {
  const e = EGG_BY_KEY[state.buyKind] || EGG_BY_KEY.commun;
  const parHeure = Math.floor(3600 / (e.hatch / Math.max(1, force('couveuse'))));
  return 'Environ ' + parHeure + ' éclosion' + (parHeure > 1 ? 's' : '') +
    ' par heure et par incubateur, à ta couveuse actuelle. ' +
    (prixOeuf(e) > 12
      ? 'S’il ne peut pas payer les ' + fmt(prixOeuf(e)) + ', il laisse l’incubateur vide et attend.'
      : 'Il ne s’arrêtera jamais faute de moyens.');
}

function noteEvolution() {
  if (!evolueQuelqueChose()) return 'Elle ne touche à rien : c’est toi qui décides quand faire monter.';
  /* Chaque rareté annonce SA facture, calculée là où elle s'arrête vraiment — son propre
     plafond, rabattu sur son âge de vente si le marchand doit prendre le relais avant. */
  const cible = cle => {
    const monte = state.evolveUpTo[cle] || 0;
    return state.sellAt[cle] ? Math.min(monte, state.sellAt[cle]) : monte;
  };
  const facture = cle => EVOLVE.slice(0, cible(cle) - 1).reduce((a, b) => a + (b || 0), 0)
                       * RARITY[cle].mult * evoRemise();
  const phrase = ([cle, r]) => cible(cle) <= 1
    ? 'les ' + r.plur + ' ne montent pas'
    : 'les ' + r.plur + ' montent jusqu’à l’âge ' + AGES[cible(cle) - 1].nom +
      ' pour ' + fmt(facture(cle));
  return 'En clair : ' + liste(Object.entries(RARITY).map(phrase)) +
    '. Elle passe avant le marchand, donc une bête qui peut encore monter n’est jamais ' +
    'vendue au prix de l’âge d’en dessous.';
}

function noteMarchand() {
  const reglees = Object.entries(RARITY).filter(([cle]) => state.sellAt[cle] > 0);
  const gardees = Object.entries(RARITY).filter(([cle]) => !state.sellAt[cle]).map(([, r]) => r.plur);
  if (!reglees.length) return 'Il ne vend rien : les bêtes s’accumulent dans l’enclos jusqu’à ce que tu les vendes toi-même.';

  // la taille s'accroche à la rareté qu'elle concerne, plus à la fin de la phrase entière
  const taille = cle => (tailleDe(cle) ? ' et ' + RANKS[tailleDe(cle)].fem + 's ou plus' : '');
  /* Le menu annonce « dès l'âge adulte et au-dessus » ; cette phrase-ci doit dire la même
     chose. La condition est un seuil : une bête déjà au-dessus part aussi. */
  const seuil = a => 'mûres à l’âge ' + AGES[a - 1].nom;
  let txt = 'En clair : il vend ' +
    liste(reglees.map(([cle, r]) => 'les ' + r.plur + ' ' + seuil(state.sellAt[cle]) + taille(cle))) + '. ';
  txt += gardees.length
    ? 'Les ' + liste(gardees) + ' restent dans l’enclos. '
    : 'Rien n’est épargné : attention, un œuf cher ne se rembourse qu’à l’âge '
      + AGES[3].nom + '. ';

  /* Le piège de la combinaison : une consigne au-dessus de ce que l'évolution sait atteindre,
     et cette rareté-là ne part jamais. On nomme les raretés concernées, sinon le joueur voit
     l'enclos s'engorger sans savoir laquelle de ses quatre consignes est en cause. */
  // le plafond qui compte est celui de SA rareté ; sans évolution du tout, rien ne dépasse l'âge 1
  const plafond = cle => (prime('evolution') ? (state.evolveUpTo[cle] || 0) : 0) || 1;
  const bloquees = reglees.filter(([cle]) => state.sellAt[cle] > plafond(cle)).map(([, r]) => r.plur);
  if (bloquees.length) {
    /* Nommer le blocage ne suffit pas : sans la sortie, le joueur relit la même phrase et
       reste coincé. Chaque avertissement dit donc quoi faire, et l'ordre des remèdes va du
       gratuit au payant. */
    txt += prime('evolution') && evolueQuelqueChose()
      ? '⚠ Ton évolution ne mène pas les ' + liste(bloquees) + ' assez haut : elles ' +
        'n’atteindront jamais leur âge de vente, et tes enclos vont s’engorger. ' +
        'Monte leur plafond d’évolution, ou redescends leur âge de vente.'
      : '⚠ Rien ne fait vieillir tes bêtes : les ' + liste(bloquees) +
        ' n’atteindront jamais leur âge de vente toutes seules, et tes enclos vont s’engorger. ' +
        'Fais-les évoluer à la main avec le bouton Évoluer, redescends-les à l’âge ' +
        AGES[0].nom + ', ou achète l’évolution automatique.';
  } else if (lvl('mangeoire') && !Object.keys(RARITY).some(cle => tailleDe(cle))) {
    txt += 'Ta mangeoire n’aura jamais le temps de les engraisser.';
  }

  /* Un marchand qui ne vend pas est indiscernable d'un marchand cassé. Les avertissements
     ci-dessus sont THÉORIQUES — ils lisent les réglages. Celui-ci lit l'enclos tel qu'il est,
     et nomme ce qui coince vraiment, bête par bête. C'est la question que le joueur se pose,
     et le panneau doit y répondre sans qu'on ait à deviner. */
  let jeunes = 0, petites = 0;
  const parRarete = {};
  for (const c of state.pen) {
    if (c.keep || !venteAu(c) || !estMur(c)) continue;      // gardée, non réglée, ou encore en croissance
    if (c.age < venteAu(c)) jeunes++;
    else if (rankOf(sizeFactor(c)).i < tailleExigee(c)) {
      petites++;
      parRarete[lineOf(c).rarity] = true;
    }
  }
  if (petites) {
    // les seuils diffèrent d'une rareté à l'autre : on nomme les raretés, pas un rang unique
    const noms = Object.keys(parRarete).map(cle => RARITY[cle].plur);
    txt += petites > 1
      ? ' ⚠ ' + petites + ' bêtes sont mûres et assez âgées mais attendent encore leur taille : ' +
        'ce sont les ' + liste(noms) + ' qui sont retenues.'
      : ' ⚠ Une bête est mûre et assez âgée mais attend encore sa taille : c’est une ' +
        RARITY[Object.keys(parRarete)[0]].name + '.';
  } else if (jeunes && !bloquees.length) {
    txt += jeunes > 1
      ? ' ' + jeunes + ' bêtes sont mûres et attendent d’avoir l’âge : c’est l’évolution qui doit les faire monter.'
      : ' Une bête est mûre et attend d’avoir l’âge : c’est l’évolution qui doit la faire monter.';
  }
  // Toute bête vendue à partir de l'âge adulte est une bête qui rapportait déjà : le
  // marchand et la rente visent le même animal, et ☆ Garder est la parade.
  if (reglees.some(([cle]) => state.sellAt[cle] >= AGE_RENTE)) {
    txt += ' À partir de l’âge adulte, il vend aussi celles qui rapportaient : protège ' +
           'celles que tu veux garder.';
  }
  // les clauses se terminent toutes par un point suivi d’une espace : la dernière la garderait
  return txt.trimEnd();
}

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
                     (mur ? ' ✦' : ''));
      setFont(t.glyph, (0.9 + 0.75 * Math.min(2.25, visualScale(s.c))).toFixed(2) + 'rem');
    }
  }

  /* Le bouton n'apparaît qu'avec un jeton en poche, et il ne presse RIEN : il a le
     même gris que les outils, il ne clignote pas, il n'expire pas. Ascensionner est un
     sacrifice qu'on choisit — on perd sa ferme entière — et un bouton qui réclame ferait
     croire à une étape obligatoire. Son infobulle dit ce qui l'a ouvert, et qu'on peut
     l'ignorer. */
  const jetons = peutAscensionner() ? (state.asc.jetons || 0) : 0;
  $('btn-asc').hidden = !jetons;
  if (jetons) {
    setText($('btn-asc'), 'Ascension' + (jetons > 1 ? ' · ' + jetons : ''));
    $('btn-asc').title = jetons + ' jeton' + (jetons > 1 ? 's' : '') +
      ' d’ascension — tu peux sauter quand tu veux, ou jamais.';
  }

  /* Le panneau s'ouvre quand la première prime est à portée, comme la boutique : voir une
     chose hors de prix fait avancer un joueur d'idle, ne rien voir du tout ne fait rien. */
  const prises = PRIMES.filter(p => prime(p.cle)).length;
  $('panel-primes').hidden = state.tuto && !prises && state.coins < PRIMES[0].prix * SEUIL_VOIR;
  setText($('primes-meta'), prises + ' / ' + PRIMES.length);
  for (const p of PRIMES) {
    const r = refs.primes[p.cle], pris = prime(p.cle);
    r.el.classList.toggle('prise', pris);
    r.el.classList.toggle('prete', !pris && state.coins >= p.prix);
    r.el.disabled = pris || state.coins < p.prix;
  }

  const stock = totalEggs();
  setText($('compte-pen'), penUsed() + ' / ' + pensTotal());
  setText($('compte-incub'), state.incubators + (state.incubators > 1 ? ' incubateurs' : ' incubateur'));
  // La réserve n'existe que si on a acheté des œufs d'avance : pas de ligne vide sinon.
  $('strip-meta').hidden = !stock;
  if (stock) setText($('strip-meta'), stock + ' œuf' + (stock > 1 ? 's' : '') + ' en réserve');

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
    if (verrou) setText(r.desc, 'Bientôt.');
    else if (r.stock) {
      const n = eggStock(r.stock);
      setText(r.desc, r.base + (n ? ' En réserve : ' + n + '.' : ''));
    } else setText(r.desc, r.base);
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
    for (const quoi of ['vente', 'taille', 'evolution']) {
      $(quoi + '-' + cle).hidden = cache;
      $(quoi + '-' + cle + '-l').hidden = cache;
    }
  }
  $('cfg-marchand').hidden = !prime('marchand');
  $('cfg-evolution').hidden = !prime('evolution');
  $('cfg-acheteur').hidden = !prime('acheteur');
  $('panel-reglages').hidden = !prime('marchand') && !prime('evolution') && !prime('acheteur');

  // Chaque réglage dit en clair ce qu'il produit. Une phrase qu'on relit après avoir
  // bougé un menu vaut mieux qu'un mode d'emploi qu'on lit une fois.
  if (prime('acheteur')) setText($('note-acheteur'), noteAcheteur());
  if (prime('evolution')) setText($('note-evolution'), noteEvolution());
  if (prime('marchand')) {
    const txt = noteMarchand();
    setText($('note-marchand'), txt);
    // un ⚠ en gris pâle de 0,72 rem ne prévient personne : la note entière passe au rouge
    $('note-marchand').classList.toggle('alerte', txt.indexOf('⚠') !== -1);
  }
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
     boutons de tri pour une seule bête, une collection de 135 cases vides, une ligne de boosts
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

  /* La collection montre l'échelle du jeu — 135 cases dont trois remplies — et c'est sa
     valeur. Mais à la première seconde elle ne montre que du vide : on attend d'avoir
     rencontré de quoi voir une progression. */
  $('panel-collection').hidden = jeune && seenCount() < 3;

  // le pied de page parle du prototype, pas du jeu : il attend qu'on ait de quoi acheter
  $('foot').hidden = jeune && !estDevoile('egg-commun');
}

function refresh() {
  renderTuto();
  renderStrip();
  renderCollection();
  renderAlbum();
  renderStage();
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
   fait trois écrans à elle seule : boutique, améliorations, les primes, réglages, 145 cases
   de collection, album. Aucune compaction ne rattrape ça, parce que le problème n'est pas la
   densité mais le NOMBRE de choses affichées en même temps.

   Fermer ce qu'on ne regarde pas est la seule réponse qui tienne à toutes les tailles d'écran,
   et elle a un second mérite : c'est le joueur qui décide, pas un point de rupture. */
const PANNEAUX = ['boutique', 'autos', 'primes', 'pension', 'reglages', 'collection', 'album'];

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
const placesPension = () => (state.pension && state.pension.places) || 0;

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
  if (rec) return rec.duree;
  const d = distanceDe(a, b);
  if (d === null) return null;
  return (PENSION.base + PENSION.parDistance * d + PENSION.parRarete * ecartRarete(a, b))
         * PENSION_MULT[rareteBasse(a, b)];
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

   LES RANGS SECRETS SONT HORS DU SAC. Une merveille tirée au hasard par un couple générique
   viderait les recettes de leur sens : le rang tient parce qu'il n'y a qu'une porte. */
const poolJoker = LINES.filter(l => !RARITY[l.rarity].secret && !l.joker);
const ligneeAuHasard = () => poolJoker[Math.floor(Math.random() * poolJoker.length)].key;
const couple2Jokers = (a, b) => !!(a && b && lineOf(a).joker && lineOf(b).joker);

function ligneeDe(a, b) {
  if (couple2Jokers(a, b)) return ligneeAuHasard();
  const haut = RARITY[lineOf(a).rarity].rank >= RARITY[lineOf(b).rarity].rank ? a : b;
  const bas  = haut === a ? b : a;
  const chance = PENSION_CHANCE[Math.min(ecartRarete(a, b), PENSION_CHANCE.length - 1)];
  return (Math.random() < chance ? haut : bas).line;
}

// La sorte d'œuf que cette lignée demande, pour la réserve.
const sorteDe = ligne => {
  const r = LINE_BY_KEY[ligne].rarity;
  return (EGG_KINDS.find(e => e.rarity === r) || EGG_BY_KEY.commun).key;
};

/* Fait avancer les couples. Un couple arrivé au bout dépose son œuf dans la réserve et libère
   ses parents. Appelée par `advance`, donc elle tourne aussi pendant une absence : une
   couvaison est une attente et non un geste. */
function avancePension(dt) {
  if (!prime('pension')) return 0;
  let nes = 0;
  state.pension.couples = couples().filter(k => {
    k.t += dt;
    if (k.t < k.duree) return true;
    const a = state.pen.find(c => c.id === k.a), b = state.pen.find(c => c.id === k.b);
    // un parent vendu pendant la couvaison annule le couple sans rien rendre
    if (!a || !b) return false;
    /* LA RECETTE PASSE AVANT. Elle ne remplace pas la ponte ordinaire, elle se pose
       dessus : le couple pond sa lignée habituelle dans quatre-vingt-dix-neuf cas sur cent,
       et la merveille dans le centième. */
    const rec = recetteDe(a, b);
    const ligne = rec && Math.random() < rec.chance ? rec.donne : ligneeDe(a, b);
    const sorte = sorteDe(ligne);
    /* La réserve est pleine : le couple GARDE son œuf et attend. Le jeter punirait une absence,
       et c'est précisément ce que le plafond doit éviter de faire. */
    if (eggStock(sorte) >= PLAFOND_OEUFS) { k.t = k.duree; return true; }
    state.eggs[sorte] = eggStock(sorte) + 1;
    state.pension.dus = state.pension.dus || {};
    (state.pension.dus[sorte] = state.pension.dus[sorte] || []).push(ligne);
    state.pension.nes = (state.pension.nes || 0) + 1;
    state.stats.pension = (state.stats.pension || 0) + 1;
    nes++;
    return false;
  });
  return nes;
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
    dit: 'Prendre toutes les primes dans une même partie. Il y en a vingt et une.',
    test: () => PRIMES.every(p => prime(p.cle)) },

  // ── l'album, et ce qu'on en fait ──
  { cle: 'deuxEtoiles', glyphe: '★', montre: true, nom: 'Deux étoiles',
    dit: 'Fusionner une carte. Il faut dix cartes de sa rareté, fondues pour leur poussière.',
    test: () => state.album.some(k => (k.etoiles || 1) >= 2) || state.stats.fusions > 0 },
  { cle: 'troisEtoiles', glyphe: '✦', montre: true, nom: 'Trois étoiles',
    dit: 'Mener une carte au bout. Cinquante cartes de sa rareté, et il n’y a pas de quatrième.',
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

/* LE NID NE S'OUVRE QUE S'IL RESTE UNE PLACE. Il acceptait les bêtes en toutes circonstances
   et ne refusait qu'au bouton : on composait tranquillement un couple, on lisait « la place est
   prise », et il fallait ressortir les deux bêtes une par une. Un écran qui laisse faire un
   geste qu'il refusera ensuite ment deux fois — d'abord en acceptant, ensuite en refusant. */
const nidOuvert = () => prime('pension') && couples().length < placesPension();

/* Poser une bête dans le nid. La même bête des deux côtés n'a pas de sens : on la déplace
   plutôt que de refuser, parce que refuser demanderait au joueur de deviner laquelle des deux
   cases il occupe déjà. */
function poserAuNid(id, cote) {
  if (!nidOuvert()) return false;
  const c = auNid(id);
  if (!c) return false;
  if (cote === 'a') { if (pensionB === id) pensionB = null; pensionA = id; }
  else              { if (pensionA === id) pensionA = null; pensionB = id; }
  return true;
}

function renderPension() {
  const p = $('panel-pension');
  /* LE PANNEAU EST UN BÂTIMENT : il n'existe pas tant qu'on ne l'a pas acheté. Un couple en
     cours le garde à l'écran même après une ascension, le temps qu'il se vide — sans quoi deux
     bêtes resteraient parquées derrière un panneau disparu. */
  p.hidden = !prime('pension') && !couples().length;
  if (p.hidden) return;

  setText($('pension-meta'), couples().length + ' / ' + placesPension());

  const hote = $('pension');
  hote.textContent = '';

  /* ── LES COUPLES EN COURS ──
     En haut, comme les cartes équipées de l'album : c'est le seul bloc qui agit déjà. */
  for (const k of couples()) {
    const a = state.pen.find(c => c.id === k.a), b = state.pen.find(c => c.id === k.b);
    const el = document.createElement('div');
    el.className = 'couple';
    const qui = document.createElement('span');
    qui.className = 'couple-qui';
    qui.textContent = (a ? glyphOf(a) : '—') + ' ' + (b ? glyphOf(b) : '—');
    const txt = document.createElement('span');
    txt.className = 'couple-txt';
    const nom = document.createElement('b');
    nom.className = 'couple-nom';
    nom.textContent = !a || !b ? 'Couple rompu'
      : LINE_BY_KEY[a.line].name + ' × ' + LINE_BY_KEY[b.line].name;
    const barre = document.createElement('span');
    barre.className = 'couple-bar';
    const jauge = document.createElement('i');
    jauge.style.width = Math.min(100, k.t / k.duree * 100).toFixed(1) + '%';
    barre.appendChild(jauge);
    txt.append(nom, barre);
    const reste = document.createElement('span');
    reste.className = 'couple-reste';
    reste.textContent = !a || !b ? 'perdu'
      : k.t >= k.duree ? 'réserve pleine' : fmtTime(k.duree - k.t);
    el.append(qui, txt, reste);
    hote.appendChild(el);
  }

  /* ── LE NID ──
     Deux cases côte à côte, et un signe entre les deux. Chacune est à la fois une zone de
     dépôt et un bouton : c'est ce qui donne les deux gestes sans dupliquer l'élément. */
  const a = auNid(pensionA), b = auNid(pensionB);
  if (!a) pensionA = null;
  if (!b) pensionB = null;

  const ouvert = nidOuvert();
  const nid = document.createElement('div');
  nid.className = 'nid';
  const case_ = (cote, c) => {
    const z = document.createElement('button');
    z.type = 'button';
    z.className = 'nid-case' + (c ? ' pleine rar-' + lineOf(c).rarity
                                  : ouvert ? ' vide' : ' vide fermee');
    z.dataset.cote = cote;
    // une case qu'on ne peut pas remplir ne se laisse ni cliquer ni survoler
    z.disabled = !c && !ouvert;
    if (c) {
      const g = document.createElement('span');
      g.className = 'nid-bete';
      setCreature(g, artFor(c), glyphOf(c));
      g.style.filter = c.prodige ? PRODIGE_FILTER : tintOf(c).filter;
      const t = document.createElement('span');
      t.className = 'nid-txt';
      const n = document.createElement('b');
      n.className = 'nid-nom';
      n.textContent = fullName(c);
      const d = document.createElement('i');
      d.className = 'nid-dit';
      d.textContent = AGES[c.age - 1].nom + ' · ' + etiqDe(c).join(', ');
      t.append(n, d);
      z.append(g, t);
      z.title = 'Retirer ' + fullName(c) + ' du nid';
    } else {
      const v = document.createElement('span');
      v.className = 'nid-vide-mot';
      v.textContent = ouvert ? 'glisse une bête ici' : 'le nid est occupé';
      const v2 = document.createElement('i');
      v2.className = 'nid-vide-sous';
      v2.textContent = ouvert ? 'ou clique pour y mettre celle en scène'
                              : 'attends que le couple ait fini';
      z.append(v, v2);
    }
    return z;
  };
  const signe = document.createElement('span');
  signe.className = 'nid-signe';
  signe.textContent = '×';
  nid.append(case_('a', a), signe, case_('b', b));
  hote.appendChild(nid);

  /* ── CE QUE LE COUPLE DONNERAIT ── */
  const dit = document.createElement('p');
  dit.className = 'pension-dit';
  const refus = refusPension(a, b);
  if (!a || !b) {
    dit.textContent = couples().length >= placesPension()
      ? 'La place est prise. Attends que le couple ait fini.'
      : 'Deux bêtes adultes. Elles garderont leur enclos et cesseront de rapporter.';
  } else if (refus) {
    dit.textContent = refus;
    dit.classList.add('refus');
  } else {
    const d = distanceDe(a, b), t = dureePension(a, b);
    const ecart = ecartRarete(a, b);
    const chance = PENSION_CHANCE[Math.min(ecart, PENSION_CHANCE.length - 1)];
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
    dit.textContent =
      (d === 0 ? 'Elles se ressemblent en tout' : d === 1 ? 'Elles ont une chose en commun'
                                                          : 'Elles n’ont rien en commun') +
      ' · ' + fmtTime(t) + ' · ' +
      (couple2Jokers(a, b)
        ? 'n’importe quelle lignée du bestiaire, sauf la leur'
        : ecart === 0 ? 'un œuf de l’une ou de l’autre, à pile ou face'
                   : Math.round((1 - chance) * 100) + ' % ' + LINE_BY_KEY[bas.line].name.toLowerCase() +
                     ', ' + Math.round(chance * 100) + ' % ' + LINE_BY_KEY[haut.line].name.toLowerCase()) +
      (!rec ? '' : su ? ' · ' + dec(rec.chance * 100, rec.chance < 0.01 ? 1 : 0) + ' % ' + LINE_BY_KEY[rec.donne].name
                      : ' · et peut-être autre chose');
    if (rec) dit.classList.add('recette');
  }
  hote.appendChild(dit);

  const go = document.createElement('button');
  go.type = 'button';
  go.className = 'asc-go';
  go.id = 'pension-go';
  go.textContent = 'Confier';
  go.disabled = !!refus || !a || !b;
  hote.appendChild(go);

  /* CE QUI ATTEND EN RÉSERVE. Un œuf de pension se range parmi les autres et ne se distingue
     plus de rien : sans cette ligne, on couve cinq heures pour voir un « œuf commun » de plus
     dans la boutique, et la lignée promise n'existe que dans le code. */
  const promis = [].concat(...Object.values((state.pension && state.pension.dus) || {}));
  const nes = state.pension.nes || 0;
  /* UNE LIGNÉE INCONNUE D'UN RANG SECRET NE SE NOMME PAS ICI. Lire « sun wukong » dans une
     liste de réserve, c'est apprendre la nouvelle par une note de bas de page une heure et
     demie avant l'éclosion, qui est le seul moment où elle valait quelque chose. */
  const nommer = l => rareteConnue(LINE_BY_KEY[l].rarity)
    ? LINE_BY_KEY[l].name.toLowerCase() : 'quelque chose que tu n’as jamais vu';
  setText($('pension-intro'), promis.length
    ? 'En réserve : ' + promis.map(nommer).join(', ') + '.'
    : nes
    ? 'Deux bêtes confiées gardent leur enclos et ne rapportent plus. ' +
      nes + (nes > 1 ? ' œufs pondus' : ' œuf pondu') + ' depuis le début.'
    : couples().length
    ? 'Deux bêtes confiées gardent leur enclos et ne rapportent plus.'
    : 'Glisse deux bêtes adultes dans le nid : elles pondront un œuf. Plus elles se ressemblent, ' +
      'plus c’est rapide — et l’œuf prend la lignée de l’une des deux.');
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
function syncReglages() {
  for (const cle of Object.keys(RARITY)) {
    $('vente-' + cle).value = String(state.sellAt[cle] || 0);
    $('taille-' + cle).value = String(state.sellRank[cle] || 0);
    $('evolution-' + cle).value = String(state.evolveUpTo[cle] || 0);
  }
  $('sel-acheteur').value = state.buyKind;
}

function bindTools() {
  $('subject').addEventListener('click', tapStage);

  $('btn-asc').addEventListener('click', ouvrirAscension);
  $('asc-close').addEventListener('click', fermerAscension);
  $('ascension').addEventListener('click', e => {
    if (e.target === $('ascension')) fermerAscension();     // clic sur le fond
  });
  $('asc-go').addEventListener('click', () => {
    const n = state.pen.length;
    if (!n) return;                       // pas d'ascension à vide, même par un clic égaré
    const ap = apercuAscension();
    const prises = Math.min(ascChoix.length, ap.max);
    const perdues = n - prises;
    const dorment = Math.max(0, (state.asc.jetons || 0) - prises);
    if (!confirm('Ascensionner ?\n\n' + prises + ' bête' + (prises > 1 ? 's deviennent' : ' devient') +
        ' une carte.' +
        (perdues ? '\nLes ' + perdues + ' autre' + (perdues > 1 ? 's sont perdues' : ' est perdue') + '.' : '') +
        (dorment ? '\n⚠ ' + dorment + ' jeton' + (dorment > 1 ? 's' : '') +
                   ' que tu n’emploies pas ' + (dorment > 1 ? 'partent' : 'part') + ' avec.' : '') +
        '\nTout le reste repart de zéro. C’est irréversible.')) return;
    ascensionner();
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('ascension').hidden) fermerAscension();
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
    if (!poserAuNid(parseInt(cle.slice(2), 10), z.dataset.cote)) {
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
    const z = e.target.closest && e.target.closest('.nid-case');
    if (!z) return;
    const cote = z.dataset.cote;
    if (z.classList.contains('pleine')) {
      if (cote === 'a') pensionA = null; else pensionB = null;
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

  $('btn-pause').addEventListener('click', () => basculerPause());

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

  // Un menu qui garde le focus détournerait la barre espace : on le relâche après usage.
  for (const id of ['vente-commune', 'vente-rare', 'vente-epique', 'vente-mythique',
                    'evolution-commune', 'evolution-rare', 'evolution-epique',
                    'evolution-mythique', 'taille-commune', 'taille-rare', 'taille-epique',
                    'taille-mythique', 'sel-acheteur']) {
    $(id).addEventListener('change', e => e.target.blur());
  }

  for (const cle of Object.keys(RARITY)) {
    $('vente-' + cle).addEventListener('change', e => {
      state.sellAt[cle] = parseInt(e.target.value, 10) || 0;
    });
  }

  for (const cle of Object.keys(RARITY)) {
    $('taille-' + cle).addEventListener('change', e => {
      state.sellRank[cle] = parseInt(e.target.value, 10) || 0;
    });
  }

  for (const cle of Object.keys(RARITY)) {
    $('evolution-' + cle).addEventListener('change', e => {
      state.evolveUpTo[cle] = parseInt(e.target.value, 10) || 0;
    });
  }

  $('sel-acheteur').addEventListener('change', e => {
    state.buyKind = EGG_BY_KEY[e.target.value] ? e.target.value : 'commun';
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
      const fait = acte.classList.contains('fondre') ? desintegrer(quoi) : fusionner(quoi);
      if (!fait) blip(300, 0.05, 'sine', 0.03);
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
  syncIncub();          // les primes peuvent donner des incubateurs : le tableau doit suivre
  buildChrome();
  bindTools();

  $('version').textContent = VERSION;
  $('btn-speed').textContent = '×' + state.speed;
  $('btn-sound').setAttribute('aria-pressed', String(state.sound));
  $('btn-tuto').setAttribute('aria-pressed', String(state.tuto));
  syncReglages();
  if (!(state.tri in TRIS)) state.tri = 'arrivee';
  if (ACHATS.indexOf(state.achat) === -1) state.achat = 1;
  syncTri();
  syncAchat();

  catchUp();
  refresh();

  setInterval(loop, 100);
  setInterval(save, 5000);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
}

start();
