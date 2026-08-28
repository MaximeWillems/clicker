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
   dans tout le projet : on la change dans le commit qui apporte la modification. */
const VERSION = 'alpha 2.8.1';

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
const AGES = [
  { nom: 'enfant',     niv: 15,  grow: 45,    value: 40 },
  { nom: 'adolescent', niv: 35,  grow: 180,   value: 500 },
  { nom: 'adulte',     niv: 65,  grow: 900,   value: 6000 },
  { nom: 'ancien',     niv: 85,  grow: 3600,  value: 80000 },
  { nom: 'légende',    niv: 100, grow: 21600, value: 1500000, fem: true },
];
const NIV_MAX = AGES[AGES.length - 1].niv;

const GROW       = AGES.map(a => a.grow);                     // croissance d'une tranche entière
const VALUE      = AGES.map(a => a.value);                    // ce que vaut une bête mûre de cet âge
const EVOLVE     = [200, 3000, 40000, 600000, null];          // le péage vers l'âge suivant
const EVO_RABAIS = 0.10;                                      // remise d'évolution par niveau d'intendant

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
};

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
  { key: 'commun', name: 'Œuf commun', price: 12, glyph: '🥚', rarity: 'commune',
    hatch: 30, odds: { commune: 0.999, rare: 0.001 } },
  { key: 'rare', name: 'Œuf rare', price: 300000, glyph: '🥚', rarity: 'rare',
    hatch: 180, odds: { rare: 0.999, epique: 0.001 } },
  { key: 'epique', name: 'Œuf épique', price: 7500000, glyph: '🥚', rarity: 'epique',
    hatch: 720, odds: { epique: 0.999, mythique: 0.001 } },
  { key: 'mythique', name: 'Œuf mythique', price: 180000000, glyph: '🥚', rarity: 'mythique',
    hatch: 2700, odds: { mythique: 1 } },
];

const EGG_BY_KEY = Object.fromEntries(EGG_KINDS.map(e => [e.key, e]));

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
const MOTIFS = ['uni', 'tacheté', 'rayé', 'moucheté', 'marbré', 'tigré', 'zébré', 'constellé'];

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

/* Le palier vient de la fusion, qui arrive en 2.1 : une capsule naît au palier 1 et y reste
   pour l'instant. La table est là dès maintenant parce que la puissance la lit déjà. */
const PALIERS = [1, 1.8, 3, 5];

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
const MOTIF_BONUS = {
  'uni':       { key: 'valeur',  quoi: 'valeur de vente',       pas: 0.04, cap: 0.60, signe: 1 },
  'tacheté':   { key: 'couvee',  quoi: 'vitesse de couvaison',  pas: 0.10, cap: 1.50, signe: 1 },
  'moucheté':  { key: 'pousse',  quoi: 'vitesse de croissance', pas: 0.10, cap: 1.50, signe: 1 },
  'rayé':      { key: 'gras',    quoi: 'engraissement',         pas: 0.10, cap: 1.50, signe: 1 },
  'tigré':     { key: 'rente',   quoi: 'rente',                 pas: 0.14, cap: 2.00, signe: 1 },
  'marbré':    { key: 'peage',   quoi: 'prix des évolutions',   pas: 0.03, cap: 0.40, signe: -1 },
  'zébré':     { key: 'oeuf',    quoi: 'prix des œufs',         pas: 0.03, cap: 0.40, signe: -1 },
  'constellé': { key: 'prodige', quoi: 'chance de prodige',     pas: 0.07, cap: 1.00, signe: 1 },
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
const NOTES = [
  { cle: 'oeuf', test: () => true,
    dit: 'Clique sur l’œuf. Rien d’autre ne le fera éclore — dans ce jeu, rien n’avance tout seul au départ.' },
  { cle: 'craque', test: () => state.incub.some(o => o && o.p >= hatchTime(o) * 2 / 3),
    dit: 'Il craque. Continue.' },
  { cle: 'bete', test: () => state.pen.length > 0,
    dit: 'Ta première bête. Elle grandit au clic, exactement comme l’œuf a éclos — et son niveau ne redescendra jamais.' },
  { cle: 'mure', test: () => state.pen.some(estMur),
    dit: 'Son niveau se bloque : elle est mûre. C’est le moment de décider quoi en faire.' },
  { cle: 'boutique', test: () => state.coins >= prixOeuf(EGG_BY_KEY.commun) * SEUIL_VOIR,
    dit: 'Vends une bête mûre, rachète un œuf : voilà la boucle du jeu. Un œuf commun coûte 12 et se revend 40 à maturité.' },
  { cle: 'peage', test: () => state.coins >= EVOLVE[0] && state.pen.some(estMur),
    dit: 'Ou paie le péage plutôt que de vendre. La bête garde son niveau, sa taille et son nom, et vaudra douze fois plus. C’est la seule vraie décision du jeu.' },
  { cle: 'clic', test: () => state.coins >= UP_BY_KEY.clic.base * SEUIL_VOIR,
    dit: 'Une boutique d’améliorations s’ouvre. Ce qui s’y achète ne joue pas à ta place : ça change la façon dont le temps passe.' },
  { cle: 'couveuse', test: () => state.coins >= UP_BY_KEY.couveuse.base * SEUIL_VOIR,
    dit: 'La couveuse fait éclore les œufs sans toi. C’est le moment où le jeu bascule : à partir d’ici, le temps travaille même quand tu n’es pas là.' },
  { cle: 'incubateur', test: () => state.coins >= INCUB_BASE * SEUIL_VOIR,
    dit: 'Un incubateur de plus, c’est un œuf de plus à couver en même temps.' },
  { cle: 'enclos', test: () => state.coins >= PEN_BASE * SEUIL_VOIR,
    dit: 'Un enclos de plus, c’est une bête de plus à la fois. C’est la place, et non l’argent, qui limitera bientôt ta ferme.' },
];

const JETON_PAS = 1e6;
const JETON_PALIERS = [1, 2, 3, 4, 5].map(n => Math.pow(JETON_PAS, n));

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
  { key: 'clic', name: 'Force du clic', base: 60, mult: 1.6,
    desc: 'Chaque clic fait gagner une seconde de plus — une seconde de ce que tes automates produisent, pas une seconde de vie brute.',
    value: n => 1 + n / GRAIN, unit: ' s gagnées par clic' },
  { key: 'couveuse', name: 'Couveuse automatique', base: 120, mult: 1.9,
    desc: 'Les œufs couvent tout seuls, même quand tu n’es pas là. Sur du commun l’incubateur est le meilleur achat ; sur du mythique, qui couve quarante-cinq minutes, c’est elle.',
    value: n => n / GRAIN, unit: '× la vitesse de couvaison' },
  { key: 'eleveur', name: 'Éleveur automatique', base: 500, mult: 1.65,
    desc: 'Les bêtes grandissent toutes seules jusqu’à leur maturité, âge après âge.',
    value: n => n / GRAIN, unit: '× la vitesse de croissance' },
  { key: 'mangeoire', name: 'Mangeoire automatique', base: 1000, mult: 1.65,
    desc: 'Prend le relais de l’éleveur : engraisse les bêtes mûres sans fin, sans rien coûter.',
    value: n => n * FATTEN_X / GRAIN, unit: ' s d’engraissement par seconde' },
  { key: 'acheteur', name: 'Acheteur automatique', base: 2000, mult: 1, max: 1,
    desc: 'Rachète un œuf et le met à couver dès qu’un incubateur se libère.' },
  { key: 'marchand', name: 'Marchand automatique', base: 15000, mult: 1, max: 1,
    desc: 'Vend les bêtes mûres tout seul, à l’âge que tu règles pour chaque rareté.' },
  { key: 'evolution', name: 'Évolution automatique', base: 50000, mult: 1, max: 1,
    desc: 'Fait passer les bêtes mûres d’un âge au suivant, jusqu’où tu décides. Elle agit avant le marchand.' },
  /* Passé l'ère commune, ce n'est plus la vitesse qui freine mais la mise de fonds : un cycle
     épique immobilise 401 M et un cycle mythique 10 Md, quand la boutique entière n'en coûte
     que 50. Rien n'agissait sur ce mur-là — l'intendant est la seule amélioration qui attaque
     le coût au lieu du temps, et la seule qui ait de quoi grandir avec l'économie. */
  { key: 'intendant', name: 'Intendant', base: 250000, mult: 1.65,
    desc: 'Négocie chaque passage d’âge : toutes les évolutions coûtent moins cher, à toutes les raretés.',
    value: n => Math.round(100 - 100 / (1 + EVO_RABAIS * n / GRAIN)), unit: ' % de moins sur chaque évolution' },
];

/* Les trois déblocages à un seul niveau (acheteur, marchand, évolution) n'ont pas de
   puissance : ils ne se granulent pas. Tous les autres passent en tiers ici, et nulle part
   ailleurs — c'est le seul endroit du fichier qui connaisse GRAIN avec les tables. */
for (const u of UPGRADES) {
  if (u.mult === 1) continue;
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
    ['Colosse fangeux', '🐸'], ['Gama, crapaud-montagne', '🐸'] ] },
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
    ['Crocodillon', '🐊'], ['Crocodile', '🐊'], ['Crocodile ancien', '🐊'],
    ['Draco-saurien', '🐲'], ['Dragon-tonnerre', '🐉'] ] },

  { key: 'insecte', name: 'Insecte', rarity: 'commune', forms: [
    ['Larve', '🐛', 'f'], ['Scarabée', '🪲'], ['Lucane', '🪲'],
    ['Scarabée-titan', '🪲'], ['Khépri, porteur du soleil', '🌞'] ] },
  { key: 'rongeur', name: 'Rongeur', rarity: 'commune', forms: [
    ['Souriceau', '🐁'], ['Rat', '🐀'], ['Ragondin', '🦫'],
    ['Rongeur colossal', '🦫'], ['Ratatosk, messager des cimes', '🐿️'] ] },
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
    ['Cnidaire colossal', '🪼'], ['Physalie-monde', '🌊', 'f'] ] },
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
    ['Faon', '🦌'], ['Cerf', '🦌'], ['Grand cerf', '🦌'],
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
    ['Colosse de pierre', '🗿'], ['Titan de granit', '🏔️'] ] },
  { key: 'sphinx', name: 'Sphinx', rarity: 'epique', forms: [
    ['Chaton sans poil', '🐈'], ['Sphinx', '🐈‍⬛'], ['Sphinx royal', '🦁'],
    ['Gardien de tombeau', '🗿'], ['Grand Sphinx', '🏜️'] ] },
  { key: 'cheval', name: 'Cheval', rarity: 'epique', forms: [
    ['Poulain', '🐴'], ['Cheval', '🐎'], ['Destrier', '🐎'],
    ['Licorne', '🦄', 'f'], ['Pégase', '🌠'] ] },

  // ── mythiques ───────────────────────────────────────────────────────────
  { key: 'chimere', name: 'Chimère', rarity: 'mythique', forms: [
    ['Avorton', '🐁'], ['Chimèreau', '🐐'], ['Chimère', '🦁', 'f'],
    ['Chimère royale', '🦁', 'f'], ['Chimère primordiale', '👹', 'f'] ] },
  { key: 'behemoth', name: 'Béhémoth', rarity: 'mythique', forms: [
    ['Ossement', '🦴'], ['Saurien', '🦕'], ['Béhémoth', '🦖'],
    ['Béhémoth ancien', '🦖'], ['Béhémoth primordial', '☄️'] ] },
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
    4: 'crapaud-4-colosse.png',
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
    3: 'crocodile-3-crocodile-ancien.png',
    4: 'crocodile-4-draco-saurien.png',
    5: 'crocodile-5-dragon-tonnerre.png',
  },
  insecte: {
    1: 'insecte-1-larve.png',
    2: 'insecte-2-scarabee.png',
    3: 'insecte-3-lucane.png',
    4: 'insecte-4-scarabee-titan.png',
    5: 'insecte-5-khepri.png',
  },
  rongeur: {
    1: 'rongeur-1-souriceau.png',
    2: 'rongeur-2-rat.png',
    3: 'rongeur-3-ragondin.png',
    4: 'rongeur-4-rongeur-colossal.png',
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
const SAVE_V = 10;          // le numéro de ce que le fichier sait produire aujourd'hui
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
    eggs: { commun: 0, rare: 0, epique: 0, mythique: 0 },
    buyKind: 'commun',      // ce que rachète l'acheteur automatique
    incubators: 1,
    pens: 1,
    incub: [{ line: rollLine('commun'), p: 0, kind: 'commun' }],   // le premier œuf est offert
    pen: [],
    sel: 'i:0',
    up: { clic: 0, couveuse: 0, eleveur: 0, acheteur: 0, mangeoire: 0, marchand: 0, evolution: 0,
          intendant: 0 },
    /* Un âge de vente PAR RARETÉ, 0 = le marchand n'y touche pas. C'est ce qui permet
       d'écouler les communes dès l'âge adulte pendant qu'on mène les mythiques jusqu'au
       bout : une consigne unique forçait à choisir entre les deux. */
    sellAt: { commune: 0, rare: 0, epique: 0, mythique: 0 },
    /* Une taille minimale PAR RARETÉ. Engraisser une commune, c'est immobiliser un enclos
       pour quelques pièces ; engraisser une mythique, c'est en gagner des milliards. Un
       réglage unique obligeait à trancher pour tout le monde. 0 = dès la maturité. */
    sellRank: { commune: 0, rare: 0, epique: 0, mythique: 0 },
    tri: 'arrivee',     // l'ordre de la bande — voir TRIS
    /* Le mode histoire. `tuto` l'allume, `vu` retient ce qui a déjà été dit ET ce qui a déjà
       été dévoilé — les deux se marquent une fois pour toutes, et rien ne revient en arrière.
       Ils traversent l'ascension : on ne réapprend pas le jeu au deuxième cycle. */
    tuto: true,
    vu: {},
    achat: 1,           // combien de niveaux d'amélioration par clic — voir ACHATS
    /* Un âge d'évolution PAR RARETÉ. Un péage ne coûte pas la même chose selon la lignée —
       mener une ancienne à la légende coûte 600 000 en commune et 9 milliards en mythique — donc
       ce n'est pas la même décision, et un réglage unique ne pouvait pas l'exprimer. On
       pousse les communes jusqu'au bout pendant qu'on arrête les mythiques à l'âge adulte. */
    evolveUpTo: { commune: 0, rare: 0, epique: 0, mythique: 0 },
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

function rollLine(kindKey) {
  const odds = (EGG_BY_KEY[kindKey] || EGG_BY_KEY.commun).odds;
  let r = Math.random(), base = 'commune';
  // du plus rare au plus commun ; en cas d'arrondi, on retombe sur la rareté de base de l'œuf
  for (const key of ['mythique', 'epique', 'rare', 'commune']) {
    const p = odds[key] || 0;
    if (p > 0) base = key;
    r -= p;
    if (r < 0) return pickLine(key);
  }
  return pickLine(base);
}

// Le libellé d'un œuf en boutique : sa rareté de base, puis ce qu'il peut donner au-dessus.
function eggDesc(e) {
  const dessus = ['rare', 'epique', 'mythique']
    .filter(k => k !== e.rarity && e.odds[k])
    .map(k => pourcent(e.odds[k]) + ' ' + de(RARITY[k].name));
  const base = RARITY[e.rarity].name.replace(/^./, m => m.toUpperCase());
  const duree = 'Couve en ' + fmtTime(e.hatch) + '. ';
  return duree + (dessus.length ? base + '. Au-dessus : ' + dessus.join(', ') + '.' : base + ' garantie.');
}

// « de rare » mais « d'épique »
function de(mot) { return /^[aeiouéèêà]/i.test(mot) ? 'd’' + mot : 'de ' + mot; }

function pourcent(p) {
  const v = p * 100;
  if (v >= 1) return v.toFixed(v % 1 ? 1 : 0).replace('.', ',') + ' %';
  // sous le pour cent, « 1 sur 1 000 » se lit ; « 0,1 % » se survole
  return '1 sur ' + fmt(Math.round(1 / p));
}

function load() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { /* mode privé */ }
  if (!raw) { isNewGame = true; return freshState(); }
  try {
    const s = JSON.parse(raw);
    const base = freshState();
    const merged = Object.assign(base, s, { up: Object.assign(base.up, s.up || {}) });
    // les améliorations étaient des booléens avant de devenir des niveaux
    for (const k of Object.keys(merged.up)) {
      if (merged.up[k] === true) merged.up[k] = 1;
      else if (merged.up[k] === false || merged.up[k] == null) merged.up[k] = 0;
    }
    // la réserve d'œufs était un simple compteur avant qu'il n'y ait plusieurs sortes
    const vide = { commun: 0, rare: 0, epique: 0, mythique: 0 };
    merged.eggs = typeof merged.eggs === 'number'
      ? Object.assign({}, vide, { commun: merged.eggs })
      : Object.assign({}, vide, merged.eggs || {});
    if (!EGG_BY_KEY[merged.buyKind]) merged.buyKind = 'commun';
    /* Le marchand n'avait qu'un palier unique et un plafond de rareté. On les convertit en
       consignes par rareté : celles que le plafond couvrait gardent le palier, les autres
       passent à « jamais » — exactement ce que la sauvegarde faisait déjà. */
    if (s.sellFrom !== undefined && !s.sellAt) {
      merged.sellAt = { commune: 0, rare: 0, epique: 0, mythique: 0 };
      for (const [cle, r] of Object.entries(RARITY)) {
        if (r.rank <= (s.sellRarity || 0)) merged.sellAt[cle] = s.sellFrom || 0;
      }
    }
    merged.sellAt = Object.assign({ commune: 0, rare: 0, epique: 0, mythique: 0 }, merged.sellAt || {});
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
      merged.evolveUpTo = { commune: avant, rare: avant, epique: avant, mythique: avant };
    }
    merged.evolveUpTo = Object.assign({ commune: 0, rare: 0, epique: 0, mythique: 0 },
                                      merged.evolveUpTo || {});
    // v5 → v6 : la taille minimale suit le même chemin, un nombre unique devient quatre
    if (typeof merged.sellRank === 'number') {
      const avant = merged.sellRank;
      merged.sellRank = { commune: avant, rare: avant, epique: avant, mythique: avant };
    }
    merged.sellRank = Object.assign({ commune: 0, rare: 0, epique: 0, mythique: 0 },
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
const puissanceDe = k => plafondDe(k) * PALIERS[(k.palier || 1) - 1] * qualiteDe(k);

/* Ce que l'album ajoute, famille par famille. Recalculé seulement quand les cartes équipées
   changent — c'est-à-dire à l'ascension et au chargement : baseValue l'appelle une fois par
   bête et par image, et refaire la somme à chaque appel se paierait à l'écran. */
let bonusCache = null;
const oublierAlbum = () => { bonusCache = null; };
function bonusAlbum() {
  if (bonusCache) return bonusCache;
  const b = { valeur: 0, couvee: 0, pousse: 0, gras: 0, rente: 0, peage: 0, oeuf: 0, prodige: 0 };
  for (const id of state.slots || []) {
    const k = carteDe(id);
    if (!k) continue;
    const m = motifBonus(k);
    b[m.key] = Math.min(m.cap, b[m.key] + m.pas * puissanceDe(k));
  }
  return (bonusCache = b);
}

const variantMult = c => tintOf(c).mult * (c.prodige ? PRODIGE_MULT : 1);
const baseValue = c => VALUE[c.age - 1] * rarityOf(c).mult * variantMult(c)
                     * (1 + bonusAlbum().valeur);

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
    prodige: Math.random() < PRODIGE_ODDS * (1 + bonusAlbum().prodige),
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
const ALERTE_JUSQU = { commune: 0, rare: 1, epique: 2, mythique: 3 };
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
const evoRemise = () => 1 / (1 + EVO_RABAIS * force('intendant'));
const evoCost   = c => EVOLVE[c.age - 1] === null ? null
                     : Math.round(EVOLVE[c.age - 1] * rarityOf(c).mult * evoRemise()
                                  * (1 - bonusAlbum().peage));

/* Le prix d'un œuf passe toujours par ici : le zébré de l'album le baisse, et un prix qui
   s'afficherait ailleurs qu'à l'endroit où il se paie finirait par mentir. */
const prixOeuf  = e => Math.max(1, Math.round(e.price * (1 - bonusAlbum().oeuf)));
const form      = (lineKey, age) => LINE_BY_KEY[lineKey].forms[age - 1];
const penFull   = () => state.pen.length >= state.pens;

const incubCost = () => Math.round(INCUB_BASE * Math.pow(SLOT_MULT, state.incubators - 1));
const penCost   = () => Math.round(PEN_BASE   * Math.pow(SLOT_MULT, state.pens - 1));

const lvl         = key => state.up[key] || 0;
/* Le NIVEAU est ce qui s'achète, la PUISSANCE est ce que ce niveau produit. Depuis que les
   améliorations se montent en tiers, les deux ne sont plus le même nombre : tout ce qui
   CALCULE passe par force(), tout ce qui compte des achats reste sur lvl(). Confondre les
   deux ferait annoncer « éleveur ×9 » pour un ×3 réel. */
const force       = key => (state.up[key] || 0) / GRAIN;
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
const clickPower  = () => 1 + force('clic');

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
const renteOf = c => c.age >= AGE_RENTE
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
  return { i, name: RANKS[i].name, from: RANKS[i].at, next: RANKS[i + 1] || null };
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
    flash(el, 'shake');
    floatText(jitter(), pt.y - 20, '+' + fmt(power) + ' s');
    blip(220 + Math.random() * 60, 0.035, 'square', 0.02);
    if (s.slot.p >= dure) hatchAll(); else refresh();
    return;
  }

  const c = s.c;
  const avantNiv = niveau(c), avantMur = estMur(c);
  const avantRang = rankOf(sizeFactor(c)).i, avantValeur = sellValue(c);
  /* Un clic ajoute de la vie avant comme après la maturité : la créature ne cesse jamais de
     grandir. Mûre, elle ne monte plus de niveau tant que le péage n'est pas payé — ce
     qu'elle avale part alors dans l'embonpoint, et n'y sera pas perdu. */
  if (avantMur) c.over = (c.over || 0) + power;
  else c.p = Math.min(bandTo(c), c.p + power * growRate(c));
  flash(el, 'shake');
  floatText(jitter(), pt.y - 20, '+' + fmt(power) + ' s');
  blip(180 + Math.random() * 50, 0.035, 'square', 0.02);
  if (estMur(c) && !avantMur) { celebrate(c, avantValeur, pt, 'mûre — prête à évoluer'); return; }
  if (rankOf(sizeFactor(c)).i !== avantRang) { celebrate(c, avantValeur, pt); return; }
  if (niveau(c) !== avantNiv) { monteeNiveau(c, avantValeur, pt); return; }
  refresh();
}

function placeEgg(i, kind) {
  kind = kind || bestStocked();
  if (state.incub[i] || !kind || !eggStock(kind)) return;
  state.eggs[kind]--;
  state.incub[i] = { line: rollLine(kind), p: 0, kind };
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
    if (c.prodige) c.keep = true;
    state.pen.push(c);
    state.incub[i] = null;
    markSeen(slot.line, 1);
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
function sell(c) {
  const gain = sellValue(c);
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
  const prix = prixOeuf(e);
  if (!e || state.coins < prix) return;
  state.coins -= prix;
  state.eggs[kind] = eggStock(kind) + 1;
  const free = state.incub.indexOf(null);
  if (free !== -1) placeEgg(free, kind); else { blip(300, 0.04, 'sine', 0.03); refresh(); }
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
      const fin = bandTo(c);
      if (c.p < fin) c.p = Math.min(fin, c.p + dt * eleve * growRate(c));
    }
  }
  /* La rente ne s'achète pas, elle se mérite en gardant : elle tombe donc ici, avec ce que
     le temps fait tout seul, et non parmi les automates. Elle tombe aussi pendant une
     absence — une bête qu'on garde travaille, présent ou pas. */
  const rente = renteTotale();
  if (rente) state.coins += rente * dt;
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
  if (lvl('evolution') && evolueQuelqueChose()) {
    for (const c of state.pen) {
      if (c.keep || !estMur(c) || c.age >= plafondEvolution(c)) continue;
      const cost = evoCost(c);
      if (state.coins < cost) continue;
      state.coins -= cost;
      bilanAuto.depense += cost;
      c.age++;
      bilanAuto.evolues++;
      markSeen(c.line, c.age);
    }
  }
  /* Le marchand attend l'âge réglé pour SA rareté, sur une bête mûre. La taille minimale
     n'est qu'un supplément, et le réglage ne s'affiche même pas tant qu'aucune mangeoire
     n'existe : sans automate qui engraisse, la notion n'a pas à encombrer l'écran. */
  if (state.up.marchand) {
    /* LA CONSIGNE NE FAIT AUCUNE EXCEPTION, pas même pour la bête en scène. Une automatisation
       qu'on configure doit faire exactement ce qu'on a réglé : si elle épargne la case qu'on
       regarde, le compte ne tombe jamais juste et le joueur ne peut plus prévoir sa ferme.

       Deux exceptions ont été essayées et retirées. Une immunité à vie pour la bête en scène,
       qui laissait celle qu'on venait d'évoluer à la main invendue pour toujours — symptôme
       visible : « le marchand ne vend pas ». Puis une protection tant que l'onglet est
       visible, qui ramenait le même défaut dès qu'on laissait la page ouverte.

       ☆ Garder est la seule protection, et c'est le bon endroit : elle est explicite, elle se
       voit sur la vignette, et c'est le joueur qui la pose. */
    const ready = state.pen.filter(c => !c.keep &&
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
      if (estMur(c)) c.over = (c.over || 0) + debit * temperOf(c).fat;
    }
  }
  // L'acheteur écoule d'abord la réserve — le joueur y a mis ses œufs chers exprès —
  // puis rachète du commun pour que la boucle ne s'arrête jamais.
  if (state.up.acheteur) {
    const voulu = EGG_BY_KEY[state.buyKind] || EGG_BY_KEY.commun;
    for (let i = 0; i < state.incub.length; i++) {
      if (state.incub[i]) continue;
      let kind = bestStocked();
      if (kind) state.eggs[kind]--;
      else if (state.coins >= prixOeuf(voulu)) {
        const prix = prixOeuf(voulu);
        state.coins -= prix;
        bilanAuto.depense += prix;
        kind = voulu.key;
      }
      else break;      // on laisse l'incubateur vide plutôt que de brader la consigne
      state.incub[i] = { line: rollLine(kind), p: 0, kind };
    }
  }
}

function loop() {
  const now = Date.now();
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
const RAR_CLASSES = ['rar-commune', 'rar-rare', 'rar-epique', 'rar-mythique',
                     'egg-commun', 'egg-rare', 'egg-epique', 'egg-mythique'];
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
  for (const e of EGG_KINDS) {
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

  const items = EGG_KINDS.map(e => ({
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
    if (s.c.age === AGES.length) b.classList.add('apex');
  }
}

function renderCollection() {
  const sig = seenCount() + '';
  if (sig === collSig) return;
  collSig = sig;

  const host = $('collection');
  host.textContent = '';
  let rarity = null;
  for (const line of LINES) {
    // un intertitre à chaque changement de rareté : c'est la hiérarchie, rendue lisible
    if (line.rarity !== rarity) {
      rarity = line.rarity;
      const h = document.createElement('p');
      h.className = 'coll-head rar-' + rarity;
      h.textContent = RARITY[rarity].name + ' · ×' + RARITY[rarity].mult;
      host.appendChild(h);
    }
    AGES.forEach((age, i) => {
      const a = i + 1, got = !!state.seen[line.key + ':' + a];
      const cell = document.createElement('div');
      cell.className = 'cell rar-' + line.rarity + (got ? ' got' : ' locked') +
                       (a === AGES.length ? ' t5' : '');
      cell.title = (got ? line.forms[i][0] : line.name + ' — ' + age.nom) +
                   ' (' + RARITY[line.rarity].name + ')';
      if (got) setCreature(cell, artAt(line.key, a), line.forms[i][1]);
      host.appendChild(cell);
    });
  }
  $('coll-meta').textContent = seenCount() + ' / ' + (LINES.length * AGES.length);
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
const CLES_VOIR = EGG_KINDS.map(e => 'egg-' + e.key)
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
  for (const n of NOTES) {
    if (state.vu[n.cle] || !essaiNote(n)) continue;
    state.vu[n.cle] = true;
    return n;
  }
  return null;
}

// Une note dont la condition plante ne doit ni s'afficher ni bloquer les suivantes.
function essaiNote(n) {
  try { return !!n.test(); } catch (e) { return false; }
}

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
           temper: c.temper, rank: rankOf(sizeFactor(c)).i, prodige: !!c.prodige, palier: 1 };
}
const capsuleDe = c => Object.assign(capsuleBrute(c), { id: nextCard++ });

const nomCarte = k => form(k.line, k.age)[0];

// Ce qu'une carte annonce en une ligne. Un pourcentage qu'on ne relie pas à un motif ne se
// chasse pas : le motif vient donc en premier, et l'effet derrière.
function effetCarte(k) {
  const m = motifBonus(k), v = Math.min(m.cap, m.pas * puissanceDe(k));
  return MOTIFS[k.motif] + ' · ' + m.quoi + ' ' +
         (m.signe < 0 ? '−' : '+') + Math.round(v * 100) + ' %';
}

function carteEl(k) {
  const el = document.createElement('div');
  el.className = 'carte rar-' + LINE_BY_KEY[k.line].rarity;
  el.dataset.id = k.id;
  el.innerHTML = '<span class="carte-bete"></span><span class="carte-txt">' +
                 '<b class="carte-nom"></b><i class="carte-eff"></i></span>';
  const bete = el.querySelector('.carte-bete');
  setCreature(bete, artAt(k.line, k.age), form(k.line, k.age)[1]);
  bete.style.filter = k.prodige ? PRODIGE_FILTER : (TINTS[k.tint] || TINTS[0]).filter;
  el.querySelector('.carte-nom').textContent = nomCarte(k);
  el.querySelector('.carte-eff').textContent = effetCarte(k);
  el.title = nomCarte(k) + ' — niveau ' + k.niv + ', ' + nomAge(k.age, k.rank) +
             ' · puissance ' + dec(puissanceDe(k), 2);
  return el;
}

let albumSig = '';
function renderAlbum() {
  const sig = state.album.map(k => k.id + ':' + k.palier).join(',') + '|' +
              state.slots.join(',') + '|' + state.asc.n;
  if (sig === albumSig) return;
  albumSig = sig;

  $('panel-album').hidden = !state.album.length && !state.asc.n;
  const host = $('album');
  host.textContent = '';
  $('album-meta').textContent = state.album.length +
    (state.album.length > 1 ? ' cartes' : ' carte');

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

function apercuAscension() {
  const jetons = state.asc.jetons || 0;
  const neuves = state.pen.map(c => Object.assign(capsuleBrute(c), { id: -c.id }));
  return { jetons, neuves, max: SLOTS };
}

function ouvrirAscension() {
  if (!(state.asc.jetons > 0)) return;
  ascChoix = state.slots.slice();
  $('ascension').hidden = false;
  renderAscension();
}

function fermerAscension() { $('ascension').hidden = true; }

function renderAscension() {
  const ap = apercuAscension();
  if (!ap.jetons) { fermerAscension(); return; }

  const suivant = prochainPalier();
  setText($('asc-jalon'),
    ap.jetons + ' jeton' + (ap.jetons > 1 ? 's' : '') + ' d’ascension. Ce saut en dépenserait ' +
    'un — mais rien ne t’oblige à sauter, ni maintenant ni jamais.' +
    (suivant ? ' Le prochain se gagne à ' + fmt(suivant) + ' pièces.'
             : ' C’était le dernier palier de l’échelle.'));

  /* Une ascension sans carte à naître est une perte sèche, pas un choix : on la refuse
     plutôt que de laisser le joueur se saborder d'un clic. Le jeton, lui, reste en poche. */
  $('asc-go').disabled = !ap.neuves.length;
  setText($('asc-go'), ap.neuves.length ? 'Ascensionner' : 'Enclos vide');

  /* Le marchand vide l'enclos en continu, absences comprises — et les cartes viennent de ce
     qui reste dedans. Sans cet avertissement, un joueur ascensionne après des heures de jeu
     et repart avec zéro carte. C'est le seul piège que la règle crée. */
  const vend = !!state.up.marchand &&
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
  /* LES CAPSULES À NAÎTRE D'ABORD : ce sont elles qu'on vient de gagner, et c'est sur elles
     que porte la décision. Celles de l'album suivent, pour qu'on puisse garder un ancien
     build si les nouvelles ne valent pas mieux. */
  const dispo = ap.neuves.concat(state.album);
  ascChoix = ascChoix.filter(id => dispo.some(k => k.id === id));

  const choix = $('asc-choix');
  choix.textContent = '';
  for (const k of dispo) {
    const el = carteEl(k);
    el.classList.add('choisir');
    if (k.id < 0) el.classList.add('neuve');       // identifiant négatif = capsule à naître
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
  setText($('asc-slots'), 'Choisis jusqu’à ' + ap.max + ' carte' + (ap.max > 1 ? 's' : '') +
    ' — ' + ascChoix.length + ' retenue' + (ascChoix.length > 1 ? 's' : '') + '. ' +
    (ap.neuves.length ? ap.neuves.length + ' capsule' + (ap.neuves.length > 1 ? 's naissent' : ' naît') +
      ' de ton enclos, en tête de liste. ' : '') +
    'Les autres attendent en réserve — rien ne se perd.');
}

function ascensionner() {
  const ap = apercuAscension();
  if (!ap.jetons) return;

  // les aperçus deviennent de vraies capsules, et les choix suivent leur nouvel identifiant
  const vrai = {};
  const neuves = ap.neuves.map(k => {
    const c = Object.assign({}, k, { id: nextCard++ });
    vrai[k.id] = c.id;
    return c;
  });
  /* RIEN NE SE PERD. Les capsules qu'on n'équipe pas rejoignent la réserve, d'où on pourra
     les sortir quand on voudra. L'écran d'ascension ne choisit donc que le build de départ du
     prochain cycle — un confort, pas un couperet. */
  const album = state.album.concat(neuves);
  const slots = ascChoix.map(id => (id < 0 ? vrai[id] : id))
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
    asc: { n: (state.asc.n || 0) + 1, paliers: state.asc.paliers, jetons: state.asc.jetons - 1 },
    seen: state.seen, tri: state.tri, achat: state.achat, sound: state.sound,
    // on ne réapprend pas le jeu au deuxième cycle : les notes voyagent avec la collection
    tuto: state.tuto, vu: state.vu,
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

function renderStage() {
  const s = current();
  const stage = document.querySelector('.stage');
  const subject = $('subject');
  const acts = refs.acts;
  const hide = k => { acts[k].hidden = true; };

  if (!s) {
    setCreature($('stage-glyph'), null, '◌');
    setText($('stage-name'), 'Rien en vue');
    setHtml($('stage-meta'), '');
    setText($('stage-timer'), '');
    setWidth($('stage-fill'), '0%');
    setText($('stage-hint'), 'Achète un œuf pour recommencer.');
    setText($('stage-boost'), '');
    ['place', 'sell', 'evo', 'keep'].forEach(hide);
    return;
  }

  if (state.sel !== s.key) state.sel = s.key;
  setText($('stage-boost'), ligneBoosts(s));

  if (s.kind === 'egg') {
    const slot = s.slot;
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
    return;
  }

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

  const mult = nivMult(c);
  setHtml($('stage-meta'),
    '<span class="rar rar-' + lineOf(c).rarity + '">' + rar.name + '</span>' +
    ' · <b>niv. ' + niv + '</b>' +
    ' · <span class="rank">' + etatOf(c) + '</span>' +
    (mur ? ' · mûre' : ' · mûre au niv. ' + dernier) +
    (Math.abs(mult - 1) > 0.005 ? ' · valeur ×' + dec(mult) : ''));

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
      setText($('stage-timer'), 'mûre · ' +
        remaining(cible - (c.over || 0), autoReel(s)) + ' → ' + rank.next.name +
        ' (' + fmt(baseValue(c) * rank.next.at) + ')');
    } else {
      setWidth($('stage-fill'), '100%');
      setText($('stage-timer'), 'mûre · plus aucun rang au-dessus');
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
    const menee = !!seuil && !dejaLa && !c.keep && !!lvl('evolution') &&
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
  const plafond = cle => (lvl('evolution') ? (state.evolveUpTo[cle] || 0) : 0) || 1;
  const bloquees = reglees.filter(([cle]) => state.sellAt[cle] > plafond(cle)).map(([, r]) => r.plur);
  if (bloquees.length) {
    /* Nommer le blocage ne suffit pas : sans la sortie, le joueur relit la même phrase et
       reste coincé. Chaque avertissement dit donc quoi faire, et l'ordre des remèdes va du
       gratuit au payant. */
    txt += lvl('evolution') && evolueQuelqueChose()
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
      setText(t.tag, 'niv. ' + niveau(s.c) + (mur ? ' ✦' : ''));
      setFont(t.glyph, (0.9 + 0.75 * Math.min(2.25, visualScale(s.c))).toFixed(2) + 'rem');
    }
  }

  /* Le bouton n'apparaît qu'avec un jeton en poche, et il ne presse RIEN : il a le
     même gris que les outils, il ne clignote pas, il n'expire pas. Ascensionner est un
     sacrifice qu'on choisit — on perd sa ferme entière — et un bouton qui réclame ferait
     croire à une étape obligatoire. Son infobulle dit ce qui l'a ouvert, et qu'on peut
     l'ignorer. */
  const jetons = state.asc.jetons || 0;
  $('btn-asc').hidden = !jetons;
  if (jetons) {
    setText($('btn-asc'), 'Ascension' + (jetons > 1 ? ' · ' + jetons : ''));
    $('btn-asc').title = jetons + ' jeton' + (jetons > 1 ? 's' : '') +
      ' d’ascension — tu peux sauter quand tu veux, ou jamais.';
  }

  const stock = totalEggs();
  setText($('compte-pen'), state.pen.length + ' / ' + state.pens);
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
  $('cfg-marchand').hidden = !state.up.marchand;
  $('cfg-evolution').hidden = !state.up.evolution;
  $('cfg-acheteur').hidden = !state.up.acheteur;
  $('panel-reglages').hidden = !state.up.marchand && !state.up.evolution && !state.up.acheteur;

  // Chaque réglage dit en clair ce qu'il produit. Une phrase qu'on relit après avoir
  // bougé un menu vaut mieux qu'un mode d'emploi qu'on lit une fois.
  if (state.up.acheteur) setText($('note-acheteur'), noteAcheteur());
  if (state.up.evolution) setText($('note-evolution'), noteEvolution());
  if (state.up.marchand) {
    const txt = noteMarchand();
    setText($('note-marchand'), txt);
    // un ⚠ en gris pâle de 0,72 rem ne prévient personne : la note entière passe au rouge
    $('note-marchand').classList.toggle('alerte', txt.indexOf('⚠') !== -1);
  }
}

/* Le bandeau des notes. Il ne remplace jamais une note non lue par une autre : si le joueur
   n'a pas encore chassé la précédente, la nouvelle attend — elle est déjà marquée lue dans
   l'état, donc rien ne se perd, mais on ne lui écrase pas son texte sous les yeux. */
function renderTuto() {
  const boite = $('tuto-note');
  const note = suivreTuto(boite.hidden);
  if (note) {
    setText($('tuto-dit'), note.dit);
    boite.hidden = false;
  }
  if (!state.tuto) boite.hidden = true;

  /* LA VUE DE L'ŒUF. Avant la toute première éclosion, l'écran ne montre que l'œuf : pas de
     bande, pas de colonne latérale. On n'a alors rien à désigner du doigt, puisqu'il n'y a
     qu'une chose à faire — la contrainte enseigne mieux qu'une consigne, et l'ouverture de
     l'écran à l'éclosion est la première récompense du jeu.

     La condition est `seen` : elle dit si une forme a DÉJÀ été rencontrée, elle survit à
     l'ascension, et elle ne peut pas revenir en arrière. */
  document.body.classList.toggle('debut', state.tuto && !seenCount());
}

function refresh() {
  renderTuto();
  renderStrip();
  renderCollection();
  renderAlbum();
  renderStage();
  tickView();
  if (popNext) { popNext = false; flash($('subject'), 'pop'); }
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
    if (!confirm('Ascensionner ?\n\n' + n + ' bête' + (n > 1 ? 's' : '') +
        ' deviendront des cartes ; celles que tu n’équipes pas attendront en réserve.' +
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
    else $('tuto-note').hidden = true;
    $('btn-tuto').setAttribute('aria-pressed', String(state.tuto));
    refresh();
    blip(state.tuto ? 660 : 330, 0.05, 'triangle', 0.03);
  });

  $('tuto-ok').addEventListener('click', () => { $('tuto-note').hidden = true; });

  $('btn-sound').addEventListener('click', () => {
    state.sound = !state.sound;
    $('btn-sound').setAttribute('aria-pressed', String(state.sound));
    if (state.sound) blip(660, 0.06, 'triangle', 0.03);
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
