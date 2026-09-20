'use strict';

/* ── LES CONSTANTES DU JEU ───────────────────────────────────
   Les valeurs qu’on règle et rééquilibre, sorties de game.js pour se trouver et se
   modifier d’un coup d’œil. Ce fichier se charge AVANT game.js (voir index.html), et le banc
   d’essai le colle en tête de game.js (tools/banc.js) : tout ce qu’on déclare ici au premier
   niveau (const/let au ras de la marge) est visible du jeu comme s’il y était.

   On y déplace les constantes PETIT À PETIT, au fil des modifications, jamais d’un bloc. */

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
/* UN CHROMATIQUE NE REND PLUS PLUS DE POUSSIÈRE, IL EN REND UNE AUTRE. Il donnait ×3 de poussière
   bleue ; il donne désormais de la poussière DORÉE — une ressource à part, la matière des
   chromatiques. Le montant suit la même règle que la bleue (la rareté), c'est le BASSIN qui
   change : être doré est la récompense, pas un multiplicateur. */
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

/* ── LE MARCHAND DE SABLE ───────────────────────────────────────────────────────
   Un rendez-vous, pas un robinet. Il paraît à l'heure RÉELLE, quelques fois par jour, à des
   instants tirés au sort, et son étal reste ouvert un quart d'heure. Une venue ratée pendant
   qu'on ne joue pas est simplement MANQUÉE — un rendez-vous se manque, on n'en parle plus.

   Il pose `offres` marchandises et on ne peut en prendre que `achats` : le reste part avec lui,
   ce qui force à choisir. Le tirage est FIGÉ dans la sauvegarde (comme la main de la pension),
   pour qu'un rechargement ne rebatte pas l'étal. */
const MARCHAND = {
  parJour:  3.5,          // apparitions par jour, en moyenne (l'écart réel est tiré au sort)
  ecart:    0.5,          // l'écart entre deux venues varie de ±50 % autour de la moyenne
  fenetre:  15 * 60,      // secondes : le temps que l'étal reste ouvert une fois paru
  offres:   3,            // ce qu'il pose à chaque venue
  achats:   2,            // ce qu'on peut prendre (la troisième part avec lui)
};

/* LE CHANGEUR — les deux conversions, seule marchandise prête tant que les boosters n'existent
   pas. Les montants sont tirés au sort à chaque venue (un marché qui bouge). À ÉQUILIBRER.
   - bleue → or : l'or ne vient sinon que des chromatiques (1/8192). Le change est donc CHER,
     ~20 000 bleues pour 1 or, pour que l'or reste précieux ; c'est du bonus, pas la source.
   - argent → bleue : rend un usage aux pièces qui ne servent plus à rien en fin de partie. */
const CHANGE_OR    = { ratio: 20000, orMin: 1, orMax: 5, variance: 0.35 };
/* argent → bleue : le prix est une PART de la bourse du joueur au moment de la venue, pas un
   montant fixe (qui deviendrait dérisoire dès que la fortune monte). Il doit coûter quelque chose
   qu'on a farmé : ~un tiers du magot, avec un plancher pour qu'une bourse vide ne l'offre pas. */
const CHANGE_BLEUE = { part: 0.35, variance: 0.35, bleueMin: 500, bleueMax: 5000, prixPlancher: 200 };

/* LES CARTES, LES PAQUETS ET LES RECETTES — les marchandises qui remplissent l'album et le carnet.
   La MONNAIE décide de la QUALITÉ : payé en poussière BLEUE (abondante), le tirage est basique ;
   payé en poussière DORÉE (rare), il vise plus haut. Un paquet, c'est cinq cartes, une rare+
   garantie. Un paquet doré peut être un GOD PACK : cinq cartes épique+, chromatisme doublé. */
const TIRAGE = {                       // rareté d'une carte tirée, par qualité (somme = 1)
  bleu: [['commune', 0.70], ['rare', 0.25], ['epique', 0.045], ['mythique', 0.005]],
  or:   [['commune', 0.20], ['rare', 0.40], ['epique', 0.30], ['mythique', 0.09], ['merveilleuse', 0.01]],
};
const PAQUET_N       = 5;              // cartes par paquet
const CARTE_CHROMA   = 0.01;           // 1 % qu'une carte tirée soit chromatique (donne de l'or à la fonte)
const GODPACK_ODDS   = 1 / 500;        // un paquet doré sur 500 est un god pack
const GODPACK_CHROMA = 0.02;           // chromatisme doublé dans un god pack
const GODPACK_SOL    = 'epique';       // le plancher de rareté d'un god pack

/* Les prix, en poussière (bleue pour la qualité bleu, dorée pour la qualité or), tirés au sort par
   venue comme le changeur. À ÉQUILIBRER. */
const PRIX_CARTE  = { bleu: 400,  or: 12, variance: 0.3 };
const PRIX_PAQUET = { bleu: 1600, or: 45, variance: 0.3 };
/* La recette se paie en OR (une marchandise premium), à un prix qui suit la rareté de la créature
   au bout : base × le multiplicateur de rareté (1 / 3 / 10 / 30 / 90). Aujourd'hui toutes les
   recettes donnent une merveille, donc toutes coûtent base × 90 ; le barème s'ouvrira de lui-même
   le jour où des recettes d'autres raretés existeront. */
const RECETTE_BASE = 1;
const RECETTE_VARIANCE = 0.3;

/* Le poids de chaque marchandise dans le tirage d'une offre. La recette ne paraît que s'il reste
   une recette à apprendre ; sinon son poids se reporte sur le reste. */
const MARCHANDISES = { change: 3, carte: 3, paquet: 2, recette: 2 };
