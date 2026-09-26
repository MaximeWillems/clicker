'use strict';

/* ── LES CONSTANTES DU JEU ───────────────────────────────────
   Les valeurs qu’on règle et rééquilibre, sorties de game.js pour se trouver et se
   modifier d’un coup d’œil. Ce fichier se charge AVANT game.js (voir index.html), et le banc
   d’essai le colle en tête de game.js (tools/banc.js) : tout ce qu’on déclare ici au premier
   niveau (const/let au ras de la marge) est visible du jeu comme s’il y était.

   On y déplace les constantes PETIT À PETIT, au fil des modifications, jamais d’un bloc.
   Première salve : la poussière et le marchand. Deuxième, le 26 septembre 2026 : l'économie —
   le barème des bêtes, la rente, la croissance, les places, les faveurs, les jetons, l'absence
   et la plonge. Les RÈGLES qui lisent ces nombres restent dans game.js. */

/* ══════════════════════════════════════════════════════════════════════════════
   LE BARÈME DES BÊTES
   Ce que vaut une bête mûre au bout de chaque âge, ce que coûtent ses péages, le multiplicateur
   de chaque rang et le prix des œufs. Les règles qui tiennent ces chiffres — le même schéma pour
   tous, la rare × 25 à chaque rang, chaque œuf au prix du dernier péage de l'ère d'avant, la
   même marge partout — sont écrites dans game.js, sous `AGES`, `RARITY` et `EGG_KINDS`. Deux
   portes seulement lisent les tables : `echelleDe` et `peagesDe`.
   ══════════════════════════════════════════════════════════════════════════════ */

// LA COMMUNE A SES PROPRES CHIFFRES : l'ère d'apprentissage, bénéficiaire dès l'enfance.
const VALUE  = [30, 150, 1000, 4000, 15000];        // revente d'une commune mûre, âge par âge
const EVOLVE = [100, 750, 2500, 10000, null];       // ses péages vers l'âge suivant

/* ── OÙ SE TIENT LE MUR, ET DANS QUELLE UNITÉ ON LE MESURE ────────────────────
   CE COMMENTAIRE A CHANGÉ D'AVIS DEUX FOIS, et il faut garder les trois raisonnements parce
   que chacun ne s'entend qu'avec le précédent.

   LA PREMIÈRE VERSION MESURAIT EN PART DU PÉAGE TOTAL, et déplaçait le poids vers l'entrée.
   Mauvaise unité : « quelle part du total ? » ne dit pas si une marche est franchissable.

   LA DEUXIÈME MESURAIT EN MULTIPLE DE LA REVENTE : ×625, ×40, ×20 et ×20 la valeur de l'âge
   qu'on quitte. Quatre murs, et la vente redevenait un métier — la marge au bout passait de
   3 % à 52 %. Mais un multiple ne dit pas ce que le joueur fait pour payer.

   LE BARÈME UNIQUE MESURE EN VENTES : CE PÉAGE, COMBIEN DE VENTES DE L'ÂGE QU'ON QUITTE ? De
   quinze à vingt-cinq, à toutes les raretés — la toute première évolution commune en demande
   neuf. Le péage ne vaut plus que de 0,8 à 5 fois la revente, et c'est la marge qui tient le
   mur : de 5 à 9 %, une bête se revend toujours un peu plus que ce qu'elle a coûté, et il faut
   en vendre beaucoup pour payer la marche suivante.

   LE TABLEAU D'UNE RARE, en pièces, œuf à 10 000 compris :

       âge          se vend     a coûté      gain    péage suivant   ventes pour le payer
       enfant          8 000     10 000    −2 000         30 000         —
       adolescent     42 000     40 000    +2 000         50 000        25
       adulte         95 000     90 000    +5 000         75 000        15
       ancien        180 000    165 000   +15 000        250 000        17
       légende       450 000    415 000   +35 000             —          —

   CES CHIFFRES SONT CEUX DE LA RARE, et `mult` les porte aux rangs du dessus : ×25 pour
   l'épique, ×625 pour la mythique, ×15 625 pour la merveilleuse. L'escalier ne peut pas se
   retourner, et la marge est la même à tous les rangs.

   LES COMMUNES ONT LES LEURS (`VALUE`/`EVOLVE`) : 30, 150, 1 000, 4 000 et 15 000 à la
   revente, 100, 750, 2 500 et 10 000 de péages. Plus bénéficiaires — de 12 à 67 % —, parce que
   l'ouverture du jeu est le dernier endroit où l'on veut poser un mur. */
const VALEURS_RANG = [8000, 42000, 95000, 180000, 450000];
const PEAGES_RANG  = [30000, 50000, 75000, 250000];

/* LE MULTIPLICATEUR DE CHAQUE RANG : la rare × 25 à chaque cran. Vingt-cinq n'est pas choisi,
   c'est le dernier péage de la rare divisé par son œuf. Le 1 de la commune ne multiplie rien :
   elle lit ses propres tables. */
const MULT_RARETE = { commune: 1, rare: 1, epique: 25, mythique: 625, merveilleuse: 15625 };

/* LE PRIX DES ŒUFS : chacun vaut le dernier péage de l'ère d'avant. L'œuf de merveille ne
   s'achète pas, et n'a donc pas de prix. */
const PRIX_OEUFS = { commun: 18, rare: 10000, epique: 250000, mythique: 6250000 };

/* Le nouveau-né vaut 15 % d'une bête mûre à l'enfance. Aux âges suivants, le premier niveau
   vaut ce que valait la bête mûre de l'âge d'avant : l'évolution ne lui fait rien perdre, le
   péage ne se reprend qu'en grandissant. Entre les deux bouts, la valeur monte
   géométriquement d'une marche à la suivante ; aucune n'est morte. */
const NIV_MIN_MULT = 0.15;

/* ══════════════════════════════════════════════════════════════════════════════
   LA RENTE
   ══════════════════════════════════════════════════════════════════════════════ */
/* ── La rente ─────────────────────────────────────────────────────────────────
   Tout le reste du jeu pousse à vendre : l'enclos est la ressource rare, et une bête qu'on
   garde est un enclos qui ne tourne pas. La rente est la seule règle qui paie pour NE PAS
   vendre — sans elle, garder une mythique chromatique était un pur sacrifice sentimental.

   Elle s'ouvre à L'ÂGE ADULTE et vaut la valeur de la bête étalée sur quatre heures. Elle
   était auparavant branchée sur l'embonpoint (« énorme »), c'est-à-dire sur la mauvaise
   échelle : un seuil que personne ne devine, et qui obligeait à comprendre la mangeoire avant
   de toucher le premier revenu passif. L'âge ouvre la rente ; la taille n'y entre plus depuis
   qu'elle ne se vend plus.

   CE PARAGRAPHE DISAIT « C'EST PEU », ET CE N'EST PLUS VRAI DEPUIS LONGTEMPS. Il datait de
   l'heure, où un enclos qui enchaînait les cycles rapportait deux à trois fois plus que la
   même case gardée. Mesuré aujourd'hui, à cinq minutes : garder rapporte QUATRE-VINGT-DIX
   FOIS le débit d'un cycle élevage-et-vente, à toutes les raretés — et l'écart se creuse
   encore si l'on déduit du cycle le prix de l'œuf et les péages. La rente ne récompense donc
   plus « la poignée de bêtes qu'on avait décidé de ne pas vendre » : elle EST la ferme, et
   l'élevage n'est plus qu'un moyen de la peupler.

   Ses facteurs sont déjà ceux du prix de vente — niveau, âge, rareté et couleur — si bien
   qu'une bête rapporte à proportion exacte de ce qu'elle vaut. Le chromatique est le seul à
   recevoir un bonus par-dessus : c'est LA bête qu'un joueur garde. */
const AGE_RENTE     = 3;      // âge minimal : adulte. En deçà, rien du tout.
/* UNE BÊTE RAPPORTE SA PROPRE VALEUR EN QUATRE HEURES. C'était une heure, puis vingt minutes,
   puis cinq, puis deux heures — et cinq était devenu intenable, non pas à cause du chiffre mais
   à cause de ce qu'il y avait en face.

   LE RAPPORT QUI COMMANDE N'EST PAS LE DÉLAI, C'EST « GARDER CONTRE VENDRE ». Une case
   d'enclos ne fait qu'une chose à la fois : porter une bête gardée, qui rend sa valeur
   indéfiniment, ou servir à élever puis vendre, encore et encore. Mesuré par case et par
   seconde, garder valait SEPT CENT QUARANTE FOIS vendre. La fin de partie n'avait donc qu'une
   forme : remplir les enclos, ne plus jamais rien vendre, et regarder.

   LES PÉAGES ONT FAIT LES TROIS QUARTS DU TRAVAIL. En rendant chaque évolution coûteuse, ils
   ont rendu la vente rentable : la marge au bout passe de 3 % à 52 %, et le rapport tombe de
   740 à 54 sans qu'on ait touché à la rente. Ce n'était pas la rente qui était trop forte,
   c'était la vente qui ne rapportait rien.

   DEUX HEURES RAMÈNE LE RAPPORT À 2,3, et c'est le réglage voulu : garder reste le meilleur
   emploi d'une case — l'absence doit payer, c'est une demande explicite — mais vendre cesse
   d'être une perte de temps. Une nuit de huit heures rend quatre fois la valeur d'une bête
   gardée, ce qui est un vrai revenu d'absence et non un doublement du jeu.

   LE CHOIX DE LA `4.11.5` EST DONC RÉVISÉ, et il faut dire pourquoi. Il posait qu'une décision
   de garde doit se payer DANS LA SÉANCE, et cinq minutes le garantissaient. Deux heures ne le
   garantissent plus au même sens ; en échange, la décision existe vraiment — à 740 contre 1,
   il n'y avait pas de décision, il y avait une évidence. Un pari qu'on ne peut pas perdre
   n'est pas un pari.

   CE QUE ÇA NE RÈGLE TOUJOURS PAS : la rente reste PERPÉTUELLE ET GRATUITE. On règle ici le
   DÉBIT, pas la NATURE. Mais le chantier change de taille : il ne s'agit plus de sauver le
   jeu d'un optimum unique, seulement de décider si l'on veut, un jour, que garder coûte
   quelque chose. Voir PLAN.md, « La garde illimitée est trop forte ».

   QUATRE HEURES DEPUIS LE BARÈME UNIQUE, et c'est la même règle qui le demande. Deux heures
   étaient calées sur une bête finie qui rapportait 52 % de ce qu'elle avait coûté ; le barème
   n'en laisse que 8 à 12 %, et à deux heures garder aurait rapporté cinq fois la vente au lieu
   de 2,3. Quatre heures ramènent l'écart entre 2,3 et 2,7, à toutes les raretés — c'est aussi
   pourquoi la rareté ne multiplie pas les clics : une bête deux fois plus longue à élever
   aurait doublé l'avantage de la garder. */
const RENTE_H       = 14400;
const RENTE_PRODIGE = 2;      // un chromatique double la sienne

// Ce qu'un clic rend sur une bête menée au bout, en part de sa rente — voir `gainClicFini`.
const RENTE_CLIC = 1 / 500;

/* ══════════════════════════════════════════════════════════════════════════════
   LA CROISSANCE ET L'ENGRAISSEMENT
   ══════════════════════════════════════════════════════════════════════════════ */
/* ── CE QU'UNE UNITÉ D'ÉLEVEUR POUSSE, ET POURQUOI CE N'EST PLUS UN ──────────────
   La montée en niveau venait trop du doigt et pas assez de la machine. Un âge se traverse en
   quelques minutes de clic acharné là où l'éleveur, lui, met des heures : on ne l'achetait
   pas pour aller plus vite, on l'achetait pour ne pas avoir à rester. Un automate qu'on paie
   doit être le chemin normal, pas la consolation de celui qui s'absente.

   L'éleveur triple donc, et le clic tombe au tiers de ce qu'il valait — deux gestes, pas un :
   monter la machine sans baisser la main aurait monté les deux ensemble, puisqu'un clic vaut
   des SECONDES D'AUTOMATE (voir `clickGain`) et suit tout ce que l'automate gagne. */
const ELEVEUR_X = 3;        // multiplicateur de croissance par unité d'éleveur

/* Le débit de la mangeoire : secondes d'engraissement par seconde et par niveau. Ce que coûte un
   rang de taille, et ce qu'il rapporte, est écrit dans game.js sous `coutRang` et `RANKS`. */
const FATTEN_X  = 6;

/* ══════════════════════════════════════════════════════════════════════════════
   LES PLACES, LES FAVEURS ET LES JETONS
   ══════════════════════════════════════════════════════════════════════════════ */
const INCUB_BASE = 150;
const PEN_BASE   = 400;
/* ── CE QUE COÛTE UNE PLACE DE PLUS ────────────────────────────────────────────
   1,6 RENDAIT LES PLACES GRATUITES, ET C'ÉTAIT MESURABLE : un enclos se remboursait en une
   FRACTION DE SECONDE à tous les paliers. Le vingt-quatrième coûtait 19,8 millions quand une
   rare légende en rapporte douze milliards l'heure — trois secondes de rente. Une ressource
   qu'on rachète plus vite qu'on ne clique n'est pas une ressource, c'est une formalité.

   À 2,1, le premier enclos ne bougeait pas d'une pièce, le cinquième coûtait trois fois plus,
   et le vingt-quatrième cinq cents fois plus. C'est la forme que demandait le défaut : ce n'est
   pas le début qui était trop bon marché, c'est la suite qui ne montait pas.

   1,3 DEPUIS LE BARÈME UNIQUE, et ce n'est pas un rabais. Les pièces se sont tassées — une
   légende merveilleuse vaut sept milliards, et non plus un quadrillion — si bien que 2,1 aurait
   mis le vingt-quatrième enclos à dix milliards, hors de portée de la partie entière. La pente
   est recalée pour qu'au bout de chaque ère on puisse s'offrir à peu près autant de places
   qu'avant. Le premier enclos coûte toujours 400, le vingt-quatrième 167 000 : une heure et
   demie de la rente d'une rare légende, contre sept minutes avant. Les places sont donc PLUS
   chères qu'avant, parce que la rareté multiplie moins : ×750 de la commune à l'épique, au
   lieu de ×450 000.

   CE QUE ÇA NE RÈGLE PAS, et il faut l'écrire ici pour ne pas y revenir en croyant à un
   oubli : la rente suit la RARETÉ, quand le prix d'une place suit une géométrique. Aucun
   multiplicateur ne rattrape ça — au mieux on rend la place chère DANS UNE ÈRE. Le vrai
   correctif serait de borner la rente, et il a été refusé au plan le 5 septembre 2026, en
   connaissance de cause. Les enclos plus chers, demandés le 21 septembre, se calent sur ce
   barème-ci. */
const SLOT_MULT  = 1.3;

/* LE PRIX MONTE, SINON LA QUEUE DEVIENT LE JEU. À ×1,12 la faveur suit à peu près l'échelle des
   primes : la première coûte 4 400, la vingtième 38 000, la cinquantième un peu plus d'un
   million — le double du dernier carrefour. Au-delà, elle monte plus vite que la ferme, ce qui
   est exactement ce qu'on veut d'une chose infinie.

   1,12 ET NON PLUS 1,4 DEPUIS LE BARÈME UNIQUE : les pièces se sont tassées, et la pente est
   recalée pour qu'au bout de chaque ère on puisse s'offrir à peu près autant de faveurs
   qu'avant. */
const FAVEUR_BASE = 4400, FAVEUR_MULT = 1.12;

/* UN PALIER DE JETON TOUS LES ×25, LE PAS MÊME DU BARÈME. Il était de mille quand une ère
   multipliait les pièces par dix-huit mille ; le barème unique ne les multiplie plus que par
   vingt-cinq d'une ère à la suivante, et un pas de mille n'aurait plus laissé que quatre
   jetons à une partie entière. À ×25, chaque ère franchit un palier, et le compte d'un cycle
   mené au bout de chaque ère est à un jeton près celui d'avant : 3, 5, 6, 7 et 8, contre 3,
   4, 6, 7 et 9. */
const JETON_PAS = 25;

/* ══════════════════════════════════════════════════════════════════════════════
   L'ABSENCE ET LA PLONGE
   ══════════════════════════════════════════════════════════════════════════════ */
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

/* La plonge, l'évier de l'impasse : ce que rapporte une assiette lavée, et ce qu'elle coûte —
   dix clics, quoi qu'on possède. La règle est écrite dans game.js, sous `oeufPlancher`. */
const ASSIETTE = 1;
const ASSIETTE_CLICS = 10;

/* ══════════════════════════════════════════════════════════════════════════════
   LA PENSION
   ══════════════════════════════════════════════════════════════════════════════ */

/* CE QUE VAUT UN CLIC SUR LA PENSION, en part d'un clic sur un œuf : un vingtième, sans plafond.
   Un clic entier en aurait fait la meilleure affaire du jeu — en fin de partie, quatre cents
   secondes par clic bouclaient une ponte d'une heure en neuf coups : une merveille toutes les
   deux minutes de clic au lieu d'une toutes les cinquante heures. Au vingtième, à quatre clics
   par seconde, le couple en scène va ×5 à ×21 en milieu de partie (clic de 20 à 100 s) et ×81
   en fin de partie (400 s) ; la carte ocellée seule, au plus ×31. La `5.10.0` plafonnait
   plutôt la main à la moitié d'une ponte : les clics d'après ne servaient à rien, et Maxime a
   préféré un clic plus faible à un clic qui s'arrête. */
const CLIC_PENSION = 0.05;

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
const MARCHANDISES = { change: 2, carte: 3, paquet: 2, recette: 3 };
