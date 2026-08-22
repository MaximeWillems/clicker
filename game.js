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
const VERSION = 'alpha 1.0.0';

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
   C'est ce qui fait que l'enfance défile pendant que le titan se mérite. */
const AGES = [
  { nom: 'enfant',     niv: 15,  grow: 45,    value: 40 },
  { nom: 'adolescent', niv: 35,  grow: 180,   value: 500 },
  { nom: 'adulte',     niv: 65,  grow: 900,   value: 6000 },
  { nom: 'géant',      niv: 85,  grow: 3600,  value: 80000 },
  { nom: 'titan',      niv: 100, grow: 21600, value: 1500000 },
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
   pas un bonus. */
const RARITY = {
  commune:  { name: 'commune',  plur: 'communes',  mult: 1,     rank: 0 },
  rare:     { name: 'rare',     plur: 'rares',     mult: 25,    rank: 1 },
  epique:   { name: 'épique',   plur: 'épiques',   mult: 600,   rank: 2 },
  mythique: { name: 'mythique', plur: 'mythiques', mult: 15000, rank: 3 },
};

// « a, b et c » plutôt que « a, b, c » : les notes doivent se lire à voix haute.
function liste(mots) {
  if (mots.length <= 1) return mots[0] || '';
  return mots.slice(0, -1).join(', ') + ' et ' + mots[mots.length - 1];
}

/* Un œuf par rareté, et chacun ne peut donner QUE sa rareté ou celle juste au-dessus.
   C'est ce qui rend la progression séquentielle : on n'atteint une mythique qu'en achetant
   des œufs épiques, qu'on ne s'offre qu'avec l'argent des rares. Pas de raccourci.
   La chance de monter d'un cran, elle, grandit avec le prix : 3,5 % · 12 % · 25 %. */
const EGG_KINDS = [
  { key: 'commun', name: 'Œuf commun', price: 12, glyph: '🥚', rarity: 'commune',
    up: '3,5 %', hatch: 30,
    odds: { commune: 0.965, rare: 0.035 } },
  { key: 'rare', name: 'Œuf rare', price: 600000, glyph: '🥚', rarity: 'rare',
    up: '12 %', hatch: 180,
    odds: { rare: 0.88, epique: 0.12 } },
  { key: 'epique', name: 'Œuf épique', price: 15000000, glyph: '🥚', rarity: 'epique',
    up: '25 %', hatch: 720,
    odds: { epique: 0.75, mythique: 0.25 } },
  { key: 'mythique', name: 'Œuf mythique', price: 375000000, glyph: '🥚', rarity: 'mythique',
    up: null, hatch: 2700,
    odds: { mythique: 1 } },
];

const EGG_BY_KEY = Object.fromEntries(EGG_KINDS.map(e => [e.key, e]));

/* Plus l'œuf est rare, plus il couve longtemps : 30 s pour un commun, 45 minutes pour un
   mythique. Une bête précieuse doit se faire attendre, sinon la rareté n'a pas de poids.

   Mais la couvaison ne pèse jamais lourd dans la vie d'une bête : 30 s de coquille contre
   sept heures de croissance jusqu'à l'âge titan, soit un millième du cycle. Un incubateur au
   niveau 1 nourrit vingt enclos, et les niveaux de couveuse au-delà s'achetaient pour ne
   jamais servir. La couveuse est donc plafonnée à 5 : passé ce point, c'est en incubateurs
   qu'on élargit la couvaison — ils montent en 1,6 par cran au lieu de 1,9, et seuls les
   œufs mythiques en réclament vraiment. */
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
   dégonfle d'elle-même — un adulte démesuré fait un géant colossal — sans qu'on ait à
   confisquer quoi que ce soit. */
const FATTEN_X  = 6;        // secondes d'engraissement par seconde et par niveau de mangeoire
const OVER_GAIN = 0.55;     // rendement décroissant de la taille

/* La taille à l'écran ne redescend JAMAIS. Elle ne se lit donc pas sur l'âge et l'embonpoint
   séparément — l'un monte au moment où l'autre se dégonfle — mais sur le total de croissance
   avalé, qui ne fait que monter. Chaque évolution ajoute par-dessus un petit bond fixe, pour
   qu'on VOIE ce qu'on vient de payer. */
const SCALE_MIN  = 0.55;    // taille d'un nouveau-né
const SCALE_MAX  = 1.75;    // taille d'un titan mûr, avant le bonus d'âge
const SCALE_GRAS = 1.10;    // ce que l'engraissement peut ajouter au-delà du titan mûr
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

   Il vaut exactement DEUX CRANS DE RARETÉ — 25², puisque chaque rareté vaut vingt-cinq fois
   la précédente. À âge et taille égaux, une commune chromatique passe donc devant une
   rare ordinaire (×125 contre ×25) et reste derrière une épique ordinaire (×600). La règle
   se propage d'elle-même : une rare chromatique se glisse entre l'épique et la mythique,
   une épique chromatique dépasse la mythique.

   À ×5, un chromatique commun valait cinq fois une commune ordinaire et restait cinq fois
   sous la moindre rare : la plus belle bête du jeu ne pesait rien face à un tirage banal,
   et le seul coup de chance qui se voit à l'écran ne se sentait pas dans la bourse. */
const PRODIGE_ODDS  = 1 / 500;
const PRODIGE_MULT  = 125;
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

// Purement descriptif : aucun effet, juste de quoi reconnaître une bête entre mille.
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
   débloquent une capacité sans avoir de puissance, à 5 pour la couveuse.

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
  { key: 'couveuse', name: 'Couveuse automatique', base: 120, mult: 1.9, max: 5,
    desc: 'Les œufs couvent tout seuls, même quand tu n’es pas là. Au-delà du niveau 5, c’est en incubateurs qu’on couve plus vite.',
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

/* Chaque forme : [nom, glyphe, genre]. Une forme par âge, dans l'ordre : enfant,
   adolescent, adulte, géant, titan. La silhouette change au moment où l'on paie
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
  { key: 'ouroboros', name: 'Ouroboros', rarity: 'mythique', forms: [
    ['Anneau de mue', '🐛'], ['Serpent gris', '🐍'], ['Serpent-monde', '🐍'],
    ['Ouroboros', '🐉'], ['Ouroboros éternel', '♾️'] ] },
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
const SAVE_V = 4;          // le numéro de ce que le fichier sait produire aujourd'hui
const OFFLINE_CAP = 24 * 3600;

let state, nextId = 1, lastFrame = Date.now(), isNewGame = false, stopSaving = false;

/* Vrai pendant qu'on rejoue une absence. Les automates tournent alors des milliers de fois
   d'affilée : ni son, ni étincelles, ni redessin à chaque tour — on n'affiche que le résultat.
   Le marchand s'en sert aussi pour lever sa règle « on ne vend pas la bête en scène » :
   personne ne regardait l'écran, la protéger n'aurait fait que bloquer un enclos. */
let rattrapage = false;
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
       titan : une consigne unique forçait à choisir entre les deux. */
    sellAt: { commune: 0, rare: 0, epique: 0, mythique: 0 },
    sellRank: 0,        // taille minimale exigée avant la vente (0 = dès la maturité)
    tri: 'arrivee',     // l'ordre de la bande — voir TRIS
    evolveUpTo: 0,
    seen: {},
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
  if (v >= 0.1) return v.toFixed(1).replace('.', ',') + ' %';
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
    /* v3 → v4 : les améliorations se montent en tiers de palier. Un niveau d'avant en vaut
       donc trois, sans quoi une partie en cours verrait sa ferme divisée par trois. */
    if ((s.v || 0) < 4) {
      for (const u of UPGRADES) if (u.grain) merged.up[u.key] = (merged.up[u.key] || 0) * GRAIN;
    }
    /* Le numéro de ce que la sauvegarde contient, pas celui d'où elle vient. On ne peut PAS
       le relire dans `base` : Object.assign mute sa cible, donc `base` et `merged` sont le
       même objet et `base.v` porte déjà l'ancien numéro. */
    merged.v = SAVE_V;
    nextId = merged.pen.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1;
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

const variantMult = c => tintOf(c).mult * (c.prodige ? PRODIGE_MULT : 1);
const baseValue = c => VALUE[c.age - 1] * rarityOf(c).mult * variantMult(c);

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
    prodige: Math.random() < PRODIGE_ODDS,
  };
}

/* À partir de quel âge la bête rembourse l'œuf dont elle sort. Un œuf cher n'est pas un lot
   à encaisser : enfant, une mythique payée 200 000 ne vaut que 1 600. Tous les œufs payants
   se remboursent à l'âge géant, jamais avant — autant le dire plutôt que de laisser le
   joueur le découvrir en perdant sa mise. */
function seuilRentable(c) {
  const rar = rarityOf(c).mult;
  const mult = rar * variantMult(c);
  let cumul = 0;
  for (let a = 1; a <= AGES.length; a++) {
    if (a > 1) cumul += (EVOLVE[a - 2] || 0) * rar;
    if (VALUE[a - 1] * mult - cumul >= (c.cost || 0)) return a;
  }
  return null;
}

const aPerte = c => (c.cost || 0) > sellValue(c);

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
// l'âge titan pour le prix d'une commune, et toute la progression se court-circuitait.
// L'intendant s'applique par-dessus, en remise qui approche la moitié sans jamais l'atteindre :
// une évolution ne devient donc jamais gratuite, quel que soit le nombre de niveaux achetés.
const evoRemise = () => 1 / (1 + EVO_RABAIS * force('intendant'));
const evoCost   = c => EVOLVE[c.age - 1] === null ? null
                     : Math.round(EVOLVE[c.age - 1] * rarityOf(c).mult * evoRemise());
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
const clickPower  = () => 1 + force('clic');

/* La vitesse à laquelle le sujet avance sans toi : l'automate qui s'en occupe à cet
   instant précis, et 0 tant qu'aucun n'est acheté. */
const autoRate = s => s.kind === 'egg' ? force('couveuse')
                    : estMur(s.c) ? FATTEN_X * force('mangeoire') * temperOf(s.c).fat
                    : force('eleveur');

/* Un clic vaut toujours le même temps réel, quoi qu'on ait automatisé. Sans ça les
   automates nerfaient le clic au moment même où on payait pour aller plus vite :
   à éleveur ×7, un « +14 s » n'avançait la bête que de deux secondes de ce que la
   machine faisait déjà. Le clic apporte donc clickPower secondes d'automate — il reste
   un raccourci qui se sent, du premier œuf au centième niveau. */
const clickGain = s => clickPower() * Math.max(1, autoRate(s));

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
                   : 0;
const renteTotale = () => state.pen.reduce((n, c) => n + renteOf(c), 0);

/* La consigne du marchand pour CETTE bête : l'âge à partir duquel il la vend, 0 s'il n'y
   touche jamais. Chaque rareté a la sienne — c'est ce qui permet d'écouler les communes
   dès l'âge adulte pendant qu'on mène les mythiques jusqu'au titan. */
const venteAu = c => (state.sellAt && state.sellAt[lineOf(c).rarity]) || 0;

/* La taille minimale exigée par le marchand n'existe QUE si une mangeoire tourne. Sans
   automate qui engraisse, elle bloquerait l'enclos sans que rien ne puisse jamais l'en
   sortir — et surtout elle obligerait à comprendre l'embonpoint pour vendre, alors que la
   vente doit rester la chose la plus simple du jeu. */
const tailleExigee = () => (lvl('mangeoire') ? state.sellRank : 0);

/* Jusqu'où l'évolution automatique a le droit de pousser cette bête. Le vendeur commande :
   inutile de payer une évolution vers un âge auquel on a demandé de vendre avant. */
const plafondEvolution = c => {
  const vise = venteAu(c);
  return vise ? Math.min(state.evolveUpTo, vise) : state.evolveUpTo;
};

function rankOf(sf) {
  let i = 0;
  while (i + 1 < RANKS.length && sf >= RANKS[i + 1].at) i++;
  return { i, name: RANKS[i].name, from: RANKS[i].at, next: RANKS[i + 1] || null };
}

/* Comment l'annoncer : son âge, et le rang de taille quand on l'a engraissée au-delà de ce
   que son âge demandait. « adulte », « adulte énorme », « titan titanesque ». */
function etatOf(c) {
  const rang = rankOf(sizeFactor(c)).name;
  return rang ? AGES[c.age - 1].nom + ' ' + rang : AGES[c.age - 1].nom;
}

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
                              cost: (EGG_BY_KEY[slot.kind] || EGG_BY_KEY.commun).price },
                           rollVariants());
    // un prodige est protégé d'office : on ne perd pas une bête sur cinq cents
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
   jusqu'au titan. C'est le prix d'une place d'enclos immobilisée, et c'est ce qui permet de
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
  if (!e || state.coins < e.price) return;
  state.coins -= e.price;
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
  const cost = upCost(u);
  if (state.coins < cost) return;
  state.coins -= cost;
  state.up[u.key] = lvl(u.key) + 1;
  chord([523, 659, 784, 1046], 80);
  refresh();
}

// Ce qu'on lit sous le nom de l'amélioration : ce qu'elle fait, ou ce que le prochain
// niveau va changer.
// Un tiers de palier ne tombe pas rond : « ×1,33 » plutôt que « ×1.3333333333 ».
const nb = v => (Number.isInteger(v) ? String(v) : dec(v, 2));

function upLabel(u) {
  const n = lvl(u.key);
  if (!u.value) return u.desc;
  if (upMaxed(u)) return 'Au maximum · ' + nb(u.value(n)) + u.unit + '.';
  if (n === 0) return u.desc + ' Niveau 1 : ' + nb(u.value(1)) + u.unit + '.';
  return 'Niveau ' + n + ' → ' + (n + 1) + ' · ' + nb(u.value(n)) + ' → ' + nb(u.value(n + 1)) + u.unit;
}

/* ─────────────────────────────────────────────
   Simulation
   ───────────────────────────────────────────── */

// Le temps ne fait avancer que ce qui a été automatisé. Tant que rien n'est acheté,
// seuls le clic et la nourriture font bouger quoi que ce soit.
function advance(dt) {
  const couve = force('couveuse'), eleve = force('eleveur');
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
}

function runAutomations(dt) {
  /* L'évolution automatique passe avant la vente : une bête qu'on peut faire monter ne doit
     pas partir au prix de son âge actuel. Elle ne monte que d'un âge par passage — la
     tranche suivante est plus longue que ce que la bête a avalé, donc elle n'est jamais
     mûre juste après.

     Mais elle s'arrête à l'âge où le marchand doit prendre le relais. Sans ce frein, régler
     « vendre les communes à l'âge adulte » ne servait à rien : l'évolution les poussait
     jusqu'au titan avant que le vendeur n'ait son mot à dire, et la consigne de vente était
     muette. C'est le vendeur qui commande le plafond, rareté par rareté. */
  if (lvl('evolution') && state.evolveUpTo > 1) {
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
    /* Le marchand ne touche jamais à la bête en scène. C'est la même règle que pour les
       éclosions : rien ne prend la scène à une bête vivante, et rien ne l'y enlève non plus.
       Sans ça, le joueur menait une bête à l'âge adulte à la main et se retrouvait, au clic
       suivant, en train de marteler une autre bête — la sienne avait été vendue à l'instant
       précis où elle devenait vendable. Tenir la case ne suffisait pas : la case était bien
       la bonne, c'est l'animal dedans qui avait changé.

       Elle n'est pas protégée pour autant : dès que le joueur regarde ailleurs, elle part au
       tour suivant. Une seule bête échappe au marchand à la fois, l'enclos ne s'engorge pas. */
    const ready = state.pen.filter(c => !c.keep && (rattrapage || 'c:' + c.id !== state.sel) && estMur(c) &&
                                        venteAu(c) > 0 && c.age >= venteAu(c) &&
                                        rankOf(sizeFactor(c)).i >= tailleExigee());
    for (const c of ready) {
      const gain = sellValue(c);
      state.coins += gain;
      bilanAuto.vendus++;
      bilanAuto.gagne += gain;
      state.pen = state.pen.filter(x => x.id !== c.id);
    }
  }
  // La mangeoire prend le relais de l'éleveur : elle n'engraisse que les bêtes mûres,
  // gratuitement et sans jamais s'arrêter. Ce qu'elle coûte, c'est la place d'enclos.
  if (lvl('mangeoire')) {
    const debit = dt * FATTEN_X * force('mangeoire');
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
      else if (state.coins >= voulu.price) {
        state.coins -= voulu.price;
        bilanAuto.depense += voulu.price;
        kind = voulu.key;
      }
      else break;      // on laisse l'incubateur vide plutôt que de brader la consigne
      state.incub[i] = { line: rollLine(kind), p: 0, kind };
    }
  }
}

function loop() {
  const now = Date.now();
  const dt = Math.min(5, (now - lastFrame) / 1000) * state.speed;
  lastFrame = now;
  if (dt <= 0) return;
  advance(dt);
  runAutomations(dt);
  hatchAll();          // hatchAll rafraîchit déjà l'affichage
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
      fmt(e.price) + ', couve en ' + fmtTime(e.hatch)));
  }

  const rang = $('sel-rank');
  rang.textContent = '';
  rang.appendChild(option(0, 'n’importe laquelle'));
  RANKS.forEach((r, i) => {
    if (!i) return;
    rang.appendChild(option(i, r.fem + (i < RANKS.length - 1 ? ' ou plus' : '') +
      ' — vaut ×' + dec(r.at)));
  });

  // un menu par rareté : même liste d'âges, réglée séparément
  for (const cle of Object.keys(RARITY)) {
    const sel = $('vente-' + cle);
    sel.textContent = '';
    sel.appendChild(option(0, 'jamais — je les garde'));
    AGES.forEach((a, i) => {
      sel.appendChild(option(i + 1, 'dès l’âge ' + a.nom +
        (i < AGES.length - 1 ? ' et au-dessus' : ', la forme finale') +
        ' — ' + fmt(a.value * RARITY[cle].mult)));
    });
  }

  const evo = $('sel-evolution');
  evo.textContent = '';
  evo.appendChild(option(0, 'Ne rien faire évoluer'));
  AGES.forEach((a, i) => {
    if (!i) return;
    evo.appendChild(option(i + 1, 'Monter jusqu’à l’âge ' + a.nom +
      (i === AGES.length - 1 ? ', la forme finale' : '')));
  });
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
    cost: () => e.price, run: () => buyEgg(e.key),
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
    refs.shop[it.key] = { el: b, price: b.querySelector('.p'), desc: b.querySelector('.d'),
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
    refs.up[u.key] = { el: b, title: b.querySelector('.t'),
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
        : remaining(hatchTime(slot) - slot.p, autoRate(s)));
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
    setText($('stage-timer'), remaining((pas - dedans) / growRate(c), autoRate(s)) +
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
        remaining(cible - (c.over || 0), autoRate(s)) + ' → ' + rank.next.name +
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
    acts.sell.classList.toggle('bon', !c.keep);   // vente rentable : c'est vert
  }

  acts.place.hidden = true;
  acts.sell.hidden = false;
  setText(acts.sell, 'Vendre ' + fmt(sellValue(c)));
  const perte = aPerte(c);
  acts.sell.title = c.keep ? 'Elle est gardée : relâche-la d’abord.'
    : perte ? 'Elle vaut moins que son œuf, qui a coûté ' + fmt(c.cost) + '.'
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
  const bouts = [];
  if (sujet.kind === 'egg') {
    if (!sujet.slot) return '';
    const base = hatchTime(sujet.slot), n = force('couveuse');
    bouts.push('Couvaison ' + fmtTime(base) + ' → ' + (n ? fmtTime(base / n) : 'rien sans toi'));
    if (n) bouts.push('couveuse ×' + dec(n, 2));
  } else {
    const c = sujet.c, t = temperOf(c);
    if (!estMur(c)) {
      // la durée annoncée est celle d'UN NIVEAU : c'est l'attente que le joueur vit
      const pas = ageGrow(c) / nivDansAge(c.age), n = force('eleveur');
      bouts.push('Croissance ' + fmtTime(pas) + ' par niveau → ' +
                 (n ? fmtTime(pas / (n * t.grow)) : 'rien sans toi'));
      if (t.grow !== 1) bouts.push(accord(t, c) + ' ×' + dec(t.grow));
      if (n) bouts.push('éleveur ×' + dec(n, 2));
    } else {
      const n = force('mangeoire');
      bouts.push('Engraissement ' + (n ? '+' + dec(FATTEN_X * n * t.fat, 1) + ' s par seconde'
                                       : 'rien sans toi'));
      if (n && t.fat !== 1) bouts.push(accord(t, c) + ' ×' + dec(t.fat));
      if (n) bouts.push('mangeoire ×' + dec(n, 2));
    }
    // la rente ne dépend plus de la maturité mais de l'âge : elle se lit dans les deux cas
    const r = renteOf(c);
    if (r) bouts.push('rente +' + fmtRente(r) + ' / s' + (c.prodige ? ' (chromatique ×2)' : ''));
  }
  bouts.push('un clic vaut ' + fmt(clickGain(sujet)) + ' s');
  return bouts.join('  ·  ');
}

// ce que la bête vaudra une fois mûre à tel âge, taille ordinaire
function valeurAu(c, age) {
  return Math.round(VALUE[age - 1] * rarityOf(c).mult * variantMult(c));
}

function noteAcheteur() {
  const e = EGG_BY_KEY[state.buyKind] || EGG_BY_KEY.commun;
  const parHeure = Math.floor(3600 / (e.hatch / Math.max(1, force('couveuse'))));
  return 'Environ ' + parHeure + ' éclosion' + (parHeure > 1 ? 's' : '') +
    ' par heure et par incubateur, à ta couveuse actuelle. ' +
    (e.price > 12
      ? 'S’il ne peut pas payer les ' + fmt(e.price) + ', il laisse l’incubateur vide et attend.'
      : 'Il ne s’arrêtera jamais faute de moyens.');
}

function noteEvolution() {
  if (!state.evolveUpTo) return 'Elle ne touche à rien : c’est toi qui décides quand faire monter.';
  /* La note annonçait la facture de l'âge maximal pour tout le monde. C'était faux dès qu'une
     rareté se vendait plus tôt : plafondEvolution l'arrête à SON âge de vente, et la note
     démentait son propre chiffre deux phrases plus loin. Chaque rareté annonce donc la sienne,
     calculée là où elle s'arrête vraiment — c'est la seule façon que le chiffre ne mente pas. */
  const cible = cle => Math.min(state.evolveUpTo, state.sellAt[cle] || state.evolveUpTo);
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

  const taille = tailleExigee() ? ', et devenues ' + RANKS[tailleExigee()].fem + 's ou plus' : '';
  /* Le menu annonce « dès l'âge adulte et au-dessus » ; cette phrase-ci doit dire la même
     chose. La condition est un seuil : une bête déjà au-dessus part aussi. */
  const seuil = a => 'dès l’âge ' + AGES[a - 1].nom;
  let txt = 'En clair : il vend ' +
    liste(reglees.map(([cle, r]) => 'les ' + r.plur + ' ' + seuil(state.sellAt[cle]))) +
    taille + '. ';
  txt += gardees.length
    ? 'Les ' + liste(gardees) + ' restent dans l’enclos. '
    : 'Rien n’est épargné : attention, un œuf cher ne se rembourse qu’à l’âge géant. ';

  /* Le piège de la combinaison : une consigne au-dessus de ce que l'évolution sait atteindre,
     et cette rareté-là ne part jamais. On nomme les raretés concernées, sinon le joueur voit
     l'enclos s'engorger sans savoir laquelle de ses quatre consignes est en cause. */
  const plafond = lvl('evolution') ? state.evolveUpTo : 1;
  const bloquees = reglees.filter(([cle]) => state.sellAt[cle] > plafond).map(([, r]) => r.plur);
  if (bloquees.length) {
    txt += lvl('evolution') && state.evolveUpTo
      ? '⚠ Ton évolution s’arrête à l’âge ' + AGES[state.evolveUpTo - 1].nom + ' : les ' +
        liste(bloquees) + ' n’y arriveront jamais, et tes enclos vont s’engorger.'
      : '⚠ Rien ne fait vieillir tes bêtes : les ' + liste(bloquees) +
        ' n’atteindront jamais leur âge de vente toutes seules, et tes enclos vont s’engorger.';
  } else if (!tailleExigee() && lvl('mangeoire')) {
    txt += 'Ta mangeoire n’aura jamais le temps de les engraisser.';
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

  const stock = totalEggs();
  setText($('compte-pen'), state.pen.length + ' / ' + state.pens);
  setText($('compte-incub'), state.incubators + (state.incubators > 1 ? ' incubateurs' : ' incubateur'));
  // La réserve n'existe que si on a acheté des œufs d'avance : pas de ligne vide sinon.
  $('strip-meta').hidden = !stock;
  if (stock) setText($('strip-meta'), stock + ' œuf' + (stock > 1 ? 's' : '') + ' en réserve');

  for (const key of Object.keys(refs.shop)) {
    const r = refs.shop[key];
    const cost = r.cost();
    setText(r.price, fmt(cost));
    r.el.disabled = state.coins < cost;
    if (r.stock) {
      const n = eggStock(r.stock);
      setText(r.desc, r.base + (n ? ' En réserve : ' + n + '.' : ''));
    }
  }

  for (const u of UPGRADES) {
    const r = refs.up[u.key];
    const n = lvl(u.key), maxed = upMaxed(u), cost = upCost(u);
    r.el.classList.toggle('owned', n > 0);
    setText(r.title, u.name + (n > 0 && u.max !== 1 ? ' · niv. ' + n : ''));
    setText(r.price, maxed ? 'acquis' : fmt(cost));
    setText(r.desc, upLabel(u));
    r.el.disabled = maxed || state.coins < cost;
  }

  /* Le réglage de taille n'apparaît qu'avec une mangeoire. Sans automate qui engraisse, la
     notion n'a rien à faire à l'écran : la vente doit rester la chose la plus simple du jeu,
     surtout au début, et une condition de taille qu'on ne peut pas remplir engorge l'enclos. */
  $('lbl-rank').hidden = $('sel-rank').hidden = !lvl('mangeoire');
  $('cfg-marchand').hidden = !state.up.marchand;
  $('cfg-evolution').hidden = !state.up.evolution;
  $('cfg-acheteur').hidden = !state.up.acheteur;
  $('panel-reglages').hidden = !state.up.marchand && !state.up.evolution && !state.up.acheteur;

  // Chaque réglage dit en clair ce qu'il produit. Une phrase qu'on relit après avoir
  // bougé un menu vaut mieux qu'un mode d'emploi qu'on lit une fois.
  if (state.up.acheteur) setText($('note-acheteur'), noteAcheteur());
  if (state.up.evolution) setText($('note-evolution'), noteEvolution());
  if (state.up.marchand) setText($('note-marchand'), noteMarchand());
}

function refresh() {
  renderStrip();
  renderCollection();
  renderStage();
  tickView();
  if (popNext) { popNext = false; flash($('subject'), 'pop'); }
}

/* ─────────────────────────────────────────────
   Démarrage
   ───────────────────────────────────────────── */

function bindTools() {
  $('subject').addEventListener('click', tapStage);

  /* La barre espace martèle la scène. Sans ce garde-fou elle ferait défiler la page, ce qui
     rend le martèlement au clavier impraticable. On laisse le navigateur faire son travail
     quand le focus est sur un vrai contrôle — un bouton focalisé s'active déjà à l'espace. */
  window.addEventListener('keydown', e => {
    if (e.code !== 'Space' && e.key !== ' ') return;
    const t = e.target;
    if (t && /^(SELECT|INPUT|TEXTAREA|BUTTON|A)$/.test(t.tagName)) return;
    e.preventDefault();
    tapStage();
  });

  $('btn-speed').addEventListener('click', () => {
    state.speed = state.speed === 1 ? 10 : state.speed === 10 ? 100 : 1;
    $('btn-speed').textContent = '×' + state.speed;
  });

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
                    'sel-rank', 'sel-evolution', 'sel-acheteur']) {
    $(id).addEventListener('change', e => e.target.blur());
  }

  for (const cle of Object.keys(RARITY)) {
    $('vente-' + cle).addEventListener('change', e => {
      state.sellAt[cle] = parseInt(e.target.value, 10) || 0;
    });
  }

  $('sel-rank').addEventListener('change', e => {
    state.sellRank = parseInt(e.target.value, 10) || 0;
  });

  $('sel-evolution').addEventListener('change', e => {
    state.evolveUpTo = parseInt(e.target.value, 10) || 0;
  });

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
}

function start() {
  state = load();
  buildChrome();
  bindTools();

  $('version').textContent = VERSION;
  $('btn-speed').textContent = '×' + state.speed;
  $('btn-sound').setAttribute('aria-pressed', String(state.sound));
  for (const cle of Object.keys(RARITY)) $('vente-' + cle).value = String(state.sellAt[cle] || 0);
  $('sel-rank').value = String(state.sellRank || 0);
  $('sel-evolution').value = String(state.evolveUpTo);
  $('sel-acheteur').value = state.buyKind;
  if (!(state.tri in TRIS)) state.tri = 'arrivee';
  syncTri();

  catchUp();
  refresh();

  setInterval(loop, 100);
  setInterval(save, 5000);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
}

start();
