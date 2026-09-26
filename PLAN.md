# Le plan

Ce document est la mémoire longue du projet : ce qu'on a décidé de construire, dans quel
ordre, et pourquoi. Le [README](README.md) décrit le jeu tel qu'il est aujourd'hui ; celui-ci
décrit la route.

Deux plans se superposent, et il faut les lire ensemble. Le **plan des jalons** a été posé le
18 août 2026, avant la première ligne de code : il dit ce que le jeu sera. Le **plan de
versions** a été écrit après coup, quand le prototype a débordé de son cadre : il dit ce qui
tombe dans quel ordre, et c'est celui qu'on suit au jour le jour.

Ce qui est sorti, et où en est le jeu aujourd'hui : le [changelog](CHANGELOG.md).

---

## Le plan de versions — ce qu'on fait maintenant

**Comment lire ce document.** Il ne dit que ce qui vient : ce qui tombe ensuite, puis les
analyses qui portent chacun de ces chantiers. Ce qui est livré part dans le
[changelog](CHANGELOG.md) avec son analyse — non par nostalgie, mais parce que la moitié des
décisions du jeu ne se comprennent qu'en sachant contre quoi elles ont été prises.

Le numéro suit la règle écrite en haut de `game.js` : majeur pour un morceau de jeu qui
n'existait pas, mineur pour une nouveauté qui tient dans le jeu tel qu'il est, correctif pour
le reste. Chaque version répond à une question, et c'est la question qui décide si elle est
réussie.

**Ce qui reste à venir ne porte pas de numéro**, seulement un ordre : trois fois de suite une
idée non prévue s'est glissée devant, et il a fallu renuméroter la moitié de la table. Le
numéro se décide au moment du commit, là où la règle sait quoi en faire.

### Ce qui vient ensuite

La colonne du milieu dit **ce qu'il faut avoir fait avant**, ce qui est plus utile qu'un ordre :
la moitié de ces lignes ne dépendent de rien et peuvent tomber n'importe quand.

**Cette table était incomplète, et c'est le pire défaut qu'elle pouvait avoir** : elle portait
sept lignes quand le fichier en analysait dix-sept. Les analyses vivaient plus bas sans jamais
remonter ici, si bien que la seule table qui dit « ce qui vient ensuite » ne le disait plus.

**Ce qui barre la route à d'autres choses** — à faire d'abord si on veut débloquer le reste :

| Ce qui tombe | Ce qu'il faut d'abord | La question qu'elle pose au joueur |
|---|---|---|
| **Les vingt-neuf dessins** — Yggdrasil, le tréant et Cthulhu compris : leurs fiches sont prêtes dans `prompts/` | rien | — |
| **L'écran au doigt** — voir plus bas, six marches | la planche, pour les cinq autres | est-ce que le jeu répond quand on le touche ? |

**Ce qui ne dépend que de soi** :

| Ce qui tombe | Ce qu'il faut d'abord | La question qu'elle pose au joueur |
|---|---|---|
| **Les six merveilles restantes** — cinq PNG et une recette chacune | leurs dessins | est-ce que le rang tient sur neuf bêtes ? |
| **L'animation du cinquième âge** — une planche par merveille | les dessins et `tools/pixel.js` | est-ce qu'une bête qui bouge se raconte toute seule ? |
| **Les stats se voient** — elles agissent depuis la `4.16.0` et rien ne les montre : une lecture sur la fiche, et la planche pour la vérifier | rien, les deux moitiés sont posées | peut-on préférer une bête à une autre ? |
| **Les tempéraments à second effet** — précoce, difficile, gourmand, précieux | rien | un tempérament peut-il se choisir plutôt que se subir ? |
| **Le tri du nid** — désigner un couple par sa lignée plutôt qu'en cherchant deux bêtes dans la bande | rien | huit couples se composent-ils encore à la main ? |
| **Ce que la pension a rendu** — un journal des pontes, par lignée | rien | sait-on ce qu'on a produit sans compter les œufs ? |
| **Couper les automates** — un interrupteur général qui lit les consignes | rien | peut-on arrêter le marchand sans aller le chercher ? |
| **L'interface modulable** — densité et ordre des panneaux, sauvés, et au-delà (presque) comme on veut. Voir [plus bas](#la-taille-des-menus-et-quelle-se-retienne) | rien | la ferme peut-elle se ranger comme on la regarde ? |
| **Le charme chroma** — les cinq âges de toutes les lignées, vus, doublent la chance de chromatique. Voir [plus bas](#compléter-une-lignée-donne-un-bonus) | rien ; le sac, pour le montrer | la collection a-t-elle un bout qui vaut d'être atteint ? |
| **Le sac** — un onglet qui montre toutes les ressources et tous les objets spéciaux | rien | sait-on ce qu'on possède sans ouvrir cinq écrans ? |

**Le second mode de jeu** — seul de sa taille, donc seul dans son bloc : le mettre parmi les
lignes ci-dessus, qui tiennent en une soirée chacune, mentirait sur ce qu'il demande.

| Ce qui tombe | Ce qu'il faut d'abord | La question qu'elle pose au joueur |
|---|---|---|
| **La tour de combat** — une tour qu'on monte, un minuteur, un seul combattant, et des boosts qui n'existent que là. Analysée [plus bas](#la-tour-de-combat--le-second-mode-de-jeu) | **les quatre stats sont posées depuis la `4.16.0`** ; restent les tempéraments à second effet et un septième axe dans la constellation | peut-on jouer à autre chose qu'à sa ferme, avec la bête qu'on y a élevée ? |

**Le barème des bêtes** — livré en `beta 5.7.0` ; reste à le juger en jouant, et les enclos, qui se calent
dessus.

| Ce qui tombe | Ce qu'il faut d'abord | La question qu'elle pose au joueur |
|---|---|---|
| **Juger le barème en jouant** — l'ouverture deux à trois fois plus lente, la rare chanceuse qui décide du rythme, la merveille qui ne coûte rien. Voir [plus bas](#le-barème-unique--ce-quil-reste-à-juger-en-jouant) | rien | la première heure tient-elle, et la chance pèse-t-elle trop ? |
| **Des enclos plus chers** — leur nombre décide de tout : le garder au plus bas. La pente est déjà recalée à 1,3 sur le barème, et le 24ᵉ enclos vaut une heure et demie de la rente d'une rare légende | un nombre cible d'enclos en fin de partie | chaque enclos de plus est-il une vraie décision ? |

**La nouvelle source des cartes** — ouverte par la refonte de l'ascension en `5.0.0`, qui a coupé
l'ancienne. L'album ne se remplit plus au saut ; ces pièces le remplissent depuis la `5.6.0`, et
la poussière en est la monnaie.

| Ce qui tombe | Ce qu'il faut d'abord | La question qu'elle pose au joueur |
|---|---|---|
| **Les nœuds « bagage »** — les deux de l'axe du sang, retirés en `5.0.0`, qui devaient revenir sur ce que coûte une carte tirée | rien | — |
| **Équilibrer le marchand** — la rareté d'une recette quand le carnet s'élargira, et les prix, dans `constantes.js`. Analysé [plus bas](#le-marchand-de-sable--lanalyse) | rien | — |

### Le barème unique — ce qu'il reste à juger en jouant

**L'ouverture ralentit nettement, et c'est le premier point à juger.** Le cycle d'enfance laisse
toujours douze pièces, mais il demande 315 clics au lieu de 140, et une adolescente mûre se revend
150 au lieu de 500. Mesuré au banc, joueur à quatre clics par seconde qui mène ses bêtes à l'âge
adulte, en médiane de huit parties de trois heures en `5.6.2` et de douze en `5.7.0` :

| | 5.6.2 | 5.7.0 |
|---|---|---|
| première vente | 45 s | 1 min 31 |
| Force du clic | 3 min 09 | 6 min 01 |
| Couveuse | 4 min 20 | 10 min 22 |
| première évolution | 31 min 50 | 42 min |
| Éleveur | 18 min 06 | 54 min |
| Acheteur automatique | 51 min 36 | 2 h 01 |
| au bout de trois heures | 15 bêtes, 13 enclos, 14 incubateurs | 8 bêtes, 7 enclos, 10 incubateurs |

**C'est la chance qui écarte les parties** : une rare tombée d'un œuf commun se revend 8 000
pièces dès l'enfance — 444 œufs communs —, et dix parties sur douze en ont vu une, vers une heure
et demie en médiane. Sans elle, une partie finit ses trois heures à 5 ou 6 bêtes et 3 ou 4 enclos ;
avec une rare précoce, jusqu'à 15 enclos. La `5.6.2` finissait à 13 enclos à chaque fois.

La première heure est donc deux à trois fois plus longue, et le rythme dépend beaucoup plus du
hasard. **Si l'ouverture traîne, le levier est le prix des premiers achats** (éleveur, primes du
début), pas le barème ; **si la rare chanceuse pèse trop**, c'est sa revente à l'enfance.

**Trois points à surveiller :**

- **La merveille ne coûte rien.** Née en pension, elle se revend 125 millions dès l'enfance — près
  d'une demi-légende mythique. Si la pension en pond souvent, c'est par là que l'argent fuira.
- **« Vendre ou payer » devient une question de trésorerie.** Dès qu'on peut payer, mener la bête
  à la légende rapporte de 1,7 à 7 fois plus par clic que la vendre avant : les âges du milieu sont
  des passages, pas des arrêts.
- **La poussière du saut** : ×4,5 pour une ferme démesurée. Le barème de la poussière n'a pas
  bougé, et le jugement se fera avec celui du marchand.

#### Et les enclos avec lui

**Demandé le même jour : des enclos plus chers**, parce que leur nombre décide de tout. C'est
écrit depuis que la rente est sortie du plan : le nombre d'enclos est la dernière limite de la
fin de partie. **Il reste à faire, et il se cale maintenant sur le barème** : le n-ième enclos
coûte `400 × 1,3^(n−1)`, 1 142 le cinquième, 4 242 le dixième, 20 474 le seizième, 167 016 le
vingt-quatrième — une heure et demie de la rente d'une rare légende, contre sept minutes avant.
Les places sont donc déjà plus chères qu'avant, parce que la rareté multiplie moins (×750 de la
commune à l'épique, au lieu de ×450 000). Ce qu'il faut encore fixer : **un nombre d'enclos visé
en fin de partie**, et monter la pente dessus. `SLOT_MULT` sert aussi aux incubateurs : monter l'un
monte l'autre, à moins de les séparer.

### Le chantier qui barre la route : les dessins

C'est redevenu une voie de fond : la pension a ouvert sans attendre le bestiaire, et le jeu
affiche un glyphe pour toute lignée sans dessin. Rien n'en dépend, tout en bénéficie.

**29 lignées sur 42 n'ont pas de dessin** — les neuf rares d'origine (loup, méduse, salamandre,
serpent, cerf, ours, papillon, tortue, chat) plus le tricératops, les épiques (kraken, golem,
sphinx, cheval, spinosaure, vélociraptor), les mythiques (chimère, tyrannosaure, charybde,
scylla, dragon ancien), et les merveilles sans dessin (béhémoth, ouroboros, dragon prismatique,
Charybde et Scylla, tarasque, yggdrasil, cthulhu), et le tréant, rare ajouté en `5.9.0`. L'ajout de contenu de la `5.3.0` — huit lignées et deux passages
en merveille — a rouvert ce chantier d'autant : tout tourne en glyphes en attendant les dessins.

**LA VOIE DES FORMES GÉOMÉTRIQUES A ÉTÉ ESSAYÉE ET REFUSÉE, en `4.17.0` puis retirée.** Le
béhémoth et l'arachné ont été décrits en ellipses et polygones plutôt que générés, rastérisés
par la filière ordinaire, et le résultat n'a pas passé le seul contrôle qui compte : le regard.
Ils sont retirés du jeu, qui réaffiche ses emoji — c'est exactement la promesse de ce dossier,
« tant qu'un dessin n'est pas là, rien ne casse ».

**Ce que l'essai a montré, et il vaut d'être gardé** : six formes géométriques savent rendre
une MASSE — un béhémoth est une montagne, une araignée un corps et huit pattes — et ne savent
pas rendre un CONTOUR. Un cerf, un papillon, une chimère, un sphinx ont leur identité dans une
silhouette que des ellipses n'atteignent pas. La voie n'est donc pas une alternative à la
planche générée : c'est, au mieux, un outil de retouche une fois la grille importée.

**Les quatre leçons de pixel restent vraies, elles**, et elles vaudront pour les retouches :

- **l'ordre est la moitié du dessin.** Huit pattes tracées avant l'abdomen disparaissent sous
  lui. La règle était écrite en tête du fichier, et l'avoir écrite n'a pas suffi ;
- **tout ce qui s'affine disparaît.** Une patte en triangle s'amincit jusqu'au sous-pixel, le
  contour remplit le bout, et il reste une poussière de points noirs ;
- **un œil a une largeur minimale** : moins de deux cellules de blanc de chaque côté de la
  pupille et c'est du bruit, pas un reflet ;
- **une silhouette coupée par le bord** se lit comme un cadrage raté, jamais comme une bête
  qui déborde.

Les treize faites : les dix communes, le kitsune, le wukong, et l'araignée depuis la `4.17.2`.

C'est aussi **la seule partie du prototype qui ne sera pas jetée** : `game.js` partira à la
poubelle au jalon 1, les PNG resteront tels quels dans le vrai jeu. Chaque heure passée là est
acquise, contrairement à tout le reste.

Les 31 fiches de `prompts/` portent chacune le brief, la commande de découpe et la ligne à
coller dans la table `ART`. La charte a deux registres : **mascotte** pour les communes, les
rares et les épiques, **idole** pour les mythiques et les merveilleuses — le second est né en
2.7.1, quand l'Ouroboros mignon a été rejeté.

Deux leçons payées cher, à ne pas réapprendre :

- Le crabe a dormi cinq jours dans `art/` sans être branché dans la table `ART`, et la lignée
  s'affichait en emoji alors qu'elle était prête. **Poser les fichiers ne suffit pas.**
- Un nom de forme ne doit reprendre **aucun des cinq noms d'âge ni des six noms de taille** :
  ils s'affichent à un centimètre du nom, et « Rongeur colossal · taille normale » se
  contredit tout seul. Neuf formes ont dû être renommées en 2.15.0. Le scénario
  `noms` de `tools/test.js` monte la garde.

### L'autre chantier de fond : l'écran, et le doigt

Cette section vient de `REFONTE.md`, écrit en parallèle et jamais versionné. **Deux mémoires
longues divergent toujours**, et celle-ci l'avait déjà fait : ses chiffres dataient d'`alpha
2.16.0`. Elle est ici, remesurée.

Le point de départ est une dette que ce fichier porte déjà — *« le rendu visuel n'a jamais été
regardé »* — plus sa seconde moitié : le jeu n'a jamais été regardé **au doigt** non plus.

#### Ce que la mesure dit aujourd'hui, et elle dit pire qu'avant

    au départ (alpha 2.16.0)     22 :hover · 1 :active · 1 rupture · 14 infos en survol
    aujourd'hui (beta 4.6.2)     46 :hover · 2 :active · 6 ruptures · 30 infos en survol

**La dette a doublé pendant qu'on regardait ailleurs.** Un `:active` pour vingt-trois `:hover`,
et **toujours zéro `@media (hover: hover)`** — c'est le chiffre qui compte le plus, parce que
sans cette garde un navigateur tactile GARDE l'état de survol sur le dernier élément touché :
la vignette qu'on vient de quitter reste allumée comme si le doigt y était encore.

Sur un téléphone, appuyer sur « Acheter », sur une vignette ou sur une action ne produit donc
**aucun signal** tant que l'état du jeu n'a pas changé. Un achat refusé faute de pièces est
indiscernable d'un appui qui n'a pas été pris.

**Trente informations ne vivent que dans un survol** — 12 `title` dans `index.html`, 18 posés
en JS. Ce ne sont pas des ornements : c'est là que vivent le nom de la rareté d'une vignette,
le nom de son âge, et les trois états du bouton « Vendre ». Au doigt, il n'y a pas de survol :
l'information disparaît purement et simplement.

**La mise en page, elle, s'est améliorée** : six ruptures au lieu d'une, dix-huit `min-height`.
Ce n'est plus « la boutique est sous tout le reste », c'est « rien ne répond au toucher ».

#### Ce qui a été livré depuis, et qui sort de la liste

- **Sauver dans un fichier** — livré en `2.17.0`. Export, import, et le passage par le même
  chemin de migration que `load()`. **Il en reste une moitié** : le `catch` de `save()` est
  toujours vide, donc un quota plein ou une navigation privée fait perdre la partie **en
  silence**. C'est une dizaine de lignes, et c'est la seule marche dont l'absence détruit
  quelque chose.
- **Les treize `<select>` des réglages** — il n'y en a plus **aucun** dans `index.html`. Le
  panneau a été refait entre-temps. La marche 6 change donc d'objet : ce n'est plus « sortir
  treize sélecteurs d'une colonne étroite », c'est la demande neuve d'un **interrupteur général
  des automates**, analysée plus bas.

#### L'ordre, et pourquoi

| | Ce qui tombe | La question qu'elle pose | Coût |
|---|---|---|---|
| **1** | ~~**La planche**~~ — **posée en `beta 4.14.0`** : `tools/planche.html`, et `node tools/planche.js` pour la liste de ses trous | est-ce qu'on peut enfin *voir* ce qu'on change ? | ✔ |
| **2** | **Le doigt** — un `:active` partout où il y a un `:hover`, les survols sous garde, 44 px minimum | est-ce que le jeu répond quand on le touche ? | une soirée |
| **3** | **Le survol qui cache** — la rareté, l'âge, l'état d'un bouton sortent des infobulles | l'information survit-elle au retrait de la souris ? | une soirée |
| **4** | **L'échec de sauvegarde qui se voit** — remplir le `catch` de `save()` | perdre sa partie en silence redevient-il impossible ? | une heure |
| **5** | **Le pouce** — la colonne latérale devient un tiroir, la scène redescend à portée | est-ce que ça se joue d'une main, debout ? | un week-end |
| **6** | **Les trois `confirm()`** — ascension, effacement, et le troisième venu depuis | la décision irréversible est-elle posée dans la langue du jeu ? | une soirée |

**La planche d'abord, et ce n'est pas négociable.** Les cinq autres marches sont du CSS. Sans
elle, elles seront livrées comme l'album et l'écran d'ascension l'ont été — vérifiées par la
seule lecture — et la dette sera creusée au lieu d'être comblée. `tools/planche.html` : une
page statique qui charge le **vrai** `style.css` et pose à la main le balisage que le rendu
produit. Aucun JS de jeu, aucun état. En pied de page, la même planche dans trois `<iframe>`
de 375, 768 et 1400 px, pour que le responsive se juge sans redimensionner quoi que ce soit.

Son risque connu est la **dérive** — montrer un balisage que `game.js` ne produit plus. La
parade est courte : un `tools/planche.js` qui relève toutes les classes posées par `game.js`
et liste celles que la planche ne montre jamais. Ce n'est pas un test, c'est une liste de trous.

**L'échec de sauvegarde peut passer devant.** Il ne dépend de rien, il coûte une heure, et
c'est la seule marche dont l'absence détruit quelque chose.

#### Trois règles à ne pas perdre en chemin

**Un `:hover` sans `:active` est un bug.** À partir de la marche 2, c'est la règle : tout ce
qui s'allume au survol s'enfonce à l'appui, et la planche montre les deux côte à côte.

**La couleur ne porte jamais seule ce que le survol était seul à nommer.** Si l'information
disparaît quand on retire la souris, elle n'est pas affichée.

**La scène reste la plus grande chose de la page**, au téléphone comme sur écran large. Le
tiroir s'ouvre par-dessus la ferme, jamais par-dessus la bête.

#### Ce qu'on a décidé de ne pas faire

- **Pas de thème clair.** Un seul thème assumé — la pièce d'incubation. Doubler la palette
  double chaque décision de couleur, pour un jeu qui se joue le soir.
- **Pas de framework, pas de build.** Le jeu est trois fichiers sans dépendance.
- **Pas de nouvelle direction artistique.** Ce n'est pas une refonte du goût, c'est la même
  charte rendue utilisable.
- **Pas d'animation de plus.** `prefers-reduced-motion` est déjà traité six fois ; ajouter du
  mouvement, c'est ajouter six fois le travail de le retirer.
- **Pas de passe d'accessibilité large.** Le seul angle mort réel — ce que seul le survol
  nomme — est la marche 3.
- `-webkit-tap-highlight-color: transparent` **reste** : il est nécessaire au martèlement de la
  scène. Ce qu'on lui substitue, c'est un `:active` explicite, qu'on maîtrise.

### Le jeton devient une monnaie — trois idées qui n'en font qu'une

Trois demandes séparées, et elles se répondent : **une constellation, acquise à l'ascension**, un
**prix des cartes qui monte par le nombre d'or**, et — ailleurs — **cliquer pour aider la
pension**. Les deux premières forment un système ; la troisième vit à part, plus bas.

#### Ce que la 3.0.0 a ouvert, et qu'il faut refermer

La `beta 3.0.0` a fait regagner les jetons à chaque cycle. C'était la bonne réponse au mur, et
elle laisse une porte ouverte : **si les jetons reviennent et que chaque carte en coûte un, on
emporte cinq cartes à chaque ascension, indéfiniment.** L'album se remplit alors sans décision,
et le seul frein restant est le nombre d'emplacements.

**Un prix qui monte est exactement le contrepoids qui manquait.** Chaque carte prise dans une même
ascension renchérit la suivante d'un facteur φ ≈ 1,618 :

| Carte | Coût | Cumul |
|---|---|---|
| 1ʳᵉ | 1 | 1 |
| 2ᵉ | 2 | 3 |
| 3ᵉ | 3 | 6 |
| 4ᵉ | 5 | 11 |
| 5ᵉ | 7 | 18 |

*(φ⁰ à φ⁴, arrondis au supérieur.)*

Avec la réserve actuelle — cinq jetons à mille milliards de fortune — on emporte **deux cartes
et il en reste deux**, là où on en prenait cinq. Le geste redevient un arbitrage, et il se pose
à chaque cycle : *une carte de plus, ou je garde mes jetons ?*

#### La constellation est ce qui donne un sens au « je garde »

Sans autre emploi, garder un jeton ne serait qu'un gaspillage — la question ne se poserait pas.
**La constellation est le second évier**, et c'est lui qui transforme le prix des cartes en
décision plutôt qu'en taxe.

Trois choses le distinguent de tout ce qui existe déjà, et il faut que les trois tiennent :

- **il TRAVERSE l'ascension**, là où les primes repartent de zéro et où l'album seul voyage. Le
  jeu n'a aujourd'hui qu'un objet permanent, l'album ; il en aurait deux, de natures
  différentes — l'un se collectionne, l'autre se planifie ;
- **il se dépense en jetons**, pas en pièces. Un arbre payé en pièces ne serait qu'une boutique
  de plus, et le jeton n'aurait toujours qu'un seul emploi ;
- **il est un ARBRE**, donc des branches qu'on ne prendra pas. Sans exclusivité, il redevient
  une liste de courses qu'on finit par épuiser — la même faute que les primes à choix
  éviteraient, et le même remède : *ce qu'on ne prend pas doit être perdu pour ce cycle.*

Reste ouvert, et c'est ce qui décidera de sa forme : **l'arbre se remet-il à zéro à chaque
ascension, ou s'accumule-t-il ?** S'il s'accumule, c'est un cliquet permanent et il doit être
petit ; s'il se rejoue, c'est un build par cycle et il peut être ambitieux. La seconde forme va
mieux avec le prix des cartes, qui est déjà une décision par cycle.

#### LA CONSTELLATION — **le socle est livré en `beta 4.0.0`**

> Le tronc, les quatre nœuds de bâtiments, le prix des cartes et la bourse de jetons sont écrits.
> Ce qui suit reste la feuille de route des branches — un nœud par fonctionnalité, le jour
> où elle existe.

### Le robinet à jetons — à ouvrir

> **Depuis [le barème unique](CHANGELOG.md#un-seul-barème-pour-tous-les-œufs--livré-en-beta-570) (`beta 5.7.0`), l'échelle monte de ×25**, dans une
> économie tassée : un palier par ère, et le compte d'un cycle mené au bout de chaque ère est celui
> d'avant à un jeton près (3, 5, 6, 7, 8 contre 3, 4, 6, 7, 9). Le constat ci-dessous tient donc
> toujours ; les tableaux se relisent en ×25, et resserrer voudrait dire descendre sous ×25.

**Le constat tient en une phrase :** le jeton n'a qu'une source, indexée sur une échelle qui ne
coule que trois fois par cycle, et deux éviers puisent dedans.

**Ce n'est pas un bug**, et il fallait le vérifier avant de proposer quoi que ce soit : au banc,
les jetons tombent bien PENDANT le cycle, à chaque palier de fortune franchi. Le défaut est de
RYTHME. Un jeton par multiplication de la fortune par mille se remarque trois fois dans une
partie, et trois fois, ça se vit comme « on n'en gagne qu'à l'ascension ».

#### Ce qui est mesuré

La constellation coûtait **372 jetons** — vingt-cinq nœuds, de 1 à 30 pièces. *(Le remaniement l’a portée à 32 nœuds pour 370 jetons : la pension ouverte en fourche en `beta 4.28.0`, la série du combo en `beta 4.30.0`. Le tableau ci-dessous est celui d’avant, qui est la mesure dont part le raisonnement.)*

| axe | nœuds | coût |
|---|---|---|
| le tronc | 1 | 1 |
| le sang | 4 | 72 |
| la main | 4 | 50 |
| le négoce | 4 | 54 |
| la couvée | 4 | 54 |
| la pension | 4 | 68 |
| l'album | 4 | 73 |

L'échelle monte de ×1000 : 1, 10³, 10⁶, 10⁹, 10¹². Un cycle mené à mille milliards franchit
**cinq paliers** — dont les deux premiers, une pièce et mille pièces, tombent dans la première
minute et ne se remarquent pas. **Le revenu réel d'un cycle est de trois jetons**, plus deux si
l'on a déjà pris les deux nœuds « sommet », qui coûtent eux-mêmes 12 et 30.

Et les cartes puisent au même robinet : deux cartes coûtent 3 jetons, trois en coûtent 6.

| ce qu'on emporte | jetons nets par cycle | ascensions pour toute la constellation |
|---|---|---|
| aucune carte | 7 | **54** |
| deux cartes | 4 | **93** |
| trois cartes | 1 | **372** |

Ce n'est pas l'arbitrage qu'on cherchait à créer, c'est une famine. Le dernier nœud d'un axe
coûte 26 à 30 jetons : **quatre à six cycles entiers sans rien emporter**, pour un seul nœud.

#### Le levier principal : resserrer l'échelle

| échelle | paliers franchis à 10⁹ / 10¹² / 10¹⁵ | cycles pour la constellation, deux cartes prises |
|---|---|---|
| ×1000 — aujourd'hui | 4 / 5 / 6 | 93 |
| ×100 | 5 / 7 / 8 | 62 |
| ×32 | 6 / 8 / 10 | 54 |
| **×10** | **10 / 13 / 16** | **31** |

À ×10, un jeton tombe chaque fois que la fortune est multipliée par dix — donc régulièrement, en
jouant, et non trois fois par cycle. C'est exactement le reproche qu'on répare : le joueur voit
le compteur bouger sans avoir à sauter. Et la constellation devient l'affaire d'une trentaine
d'ascensions, ce qui est un arc de partie plutôt qu'un mur.

**Ce que ça touche, et c'est peu.** `JETON_PAS`, et la longueur de `JETON_PALIERS` — onze crans
aujourd'hui, trente-et-un pour couvrir la même fortune. Rien d'autre : `RANG_PREMIER` se déduit
de `JETON_PREMIER`, qui reste au million et garde le premier saut où il est. Une migration
convertit `asc.paliers`, qui compte des crans pour toute la partie : k crans de mille valent
3k−2 crans de dix.

#### Trois autres leviers, et pourquoi ils viennent après

- **Baisser le prix de la constellation** — 372 → 150. Même effet sur le volume, aucun sur le
  rythme, et c'est le rythme que le reproche vise. À garder comme second tour de vis si trente
  cycles restent trop : c'est un fichier à éditer, pas un système à refaire.
- **Un second robinet, indexé sur la collection** — un jeton par lignée découverte, par
  merveille, par trophée. Il coule pendant le cycle et récompense l'autre moitié du jeu, celle
  qui ne fait pas de pièces. Mais c'est un revenu UNIQUE par accomplissement : bon pour
  l'amorçage des dix premiers cycles, sans effet sur les quarante suivants. C'est un
  assaisonnement, pas une source.
- **Séparer les deux éviers** — les cartes cesseraient de coûter des jetons. Ça supprimerait la
  concurrence, qui est la moitié du problème. Mais le prix des cartes EST la décision par cycle que la
  `3.0.0` avait laissée ouverte, et le retirer rouvrirait la porte qu'il a fermée. À ne faire que
  si l'échelle resserrée ne suffit pas.

**Ordre proposé : l'échelle d'abord, seule, et remesurer.** Un seul nombre, une migration, et le
reste du système intact — c'est le changement qui répare le plus en touchant le moins.

**Ce qui reste à trancher :** faut-il que l'échelle démarre plus haut ? À ×10, les quatre
premiers paliers — 1, 10, 100, 1000 — tombent dans la première minute et ne se remarqueront pas
davantage qu'aujourd'hui. Les faire commencer au millier rendrait chaque jeton visible, au prix
de retarder le tout premier ; il faudrait alors décider si le compteur d'ouverture de
l'ascension suit ou non.

### La constellation remaniée — ce qu'il reste à trancher

1. **Le « Tout reprendre » survit-il ?** Sans exclusivité, il ne rattrape plus une erreur — il ne
   sert qu'à se replier temporairement sur une autre branche. Utile, mais plus indispensable.
2. **Six axes ouverts d'emblée, ou le moyeu en ouvre-t-il moins ?** Le premier jeton devient un
   choix entre six directions ; c'est beaucoup pour une première ascension.

### Les faveurs, ou ce qu'on fait quand la liste se termine

Les primes sont cinquante et une, et **les dix dernières sont presque toutes de pension** —
c'est la mesure qui a lancé la révision. Arrivé là, il n'y a plus rien à acheter et plus rien à
décider : le dernier tiers de partie perd ce que le premier avait, un prochain achat.

**Les faveurs sont une queue infinie.** Un tirage de trois cartes, on en prend une, un nouveau
tirage prend sa place. Le prix monte de 40 % à chaque fois : la première coûte cent mille, la
vingtième quatre-vingt-trois millions, la cinquantième deux mille milliards — le prix de la
toute dernière prime. Au-delà, elles montent plus vite que la ferme, ce qui est exactement ce
qu'on veut d'une chose sans fin.

**Dix cartes, dix leviers, une carte par levier.** Le carrefour l'avait déjà écrit : « +10 % de
vente / +10 % de rente / +10 % de vitesse » est un menu, pas un choix — on prend le plus gros
nombre. La règle tient ici, mais elle se respecte AUTREMENT : les trois cartes tirées portent
forcément trois leviers différents, donc trois grandeurs qui ne se comparent pas. Deux tailles
du même levier dans le sac auraient ramené le menu.

| | **Un carrefour** | **Une faveur** |
|---|---|---|
| quand | trois moments écrits | sans fin |
| les trois options | écrites d'avance | tirées au sort |
| ce qu'elles pèsent | un tournant | 5 % qui ne se sent pas |
| se reprend | jamais | autant de fois qu'on veut |

**Elles sont faibles, et c'est le point.** Cinq pour cent ne se sent pas ; c'est la soixantième
qui se sent. Une faveur forte serait un carrefour de plus, et le carrefour existe déjà.

**Deux façons d'empiler cohabitent, et la seconde est une nécessité, pas une finesse.** Ce qui
multiplie s'additionne : dix « +5 % de vente » font +50 %, sans plafond. Mais ce qui REMISE ne
peut pas s'additionner — vingt « −5 % sur les œufs » feraient −100 %, et l'œuf serait gratuit
pour toujours. Une queue infinie atteint toujours un plafond additif. La remise se compose donc,
et **sur ce que les primes ont déjà mis** : les primes portent elles aussi des remises d'œuf,
additives, et composer la faveur dans son coin avant de l'ajouter laissait la somme repasser
au-dessus de un. C'est un scénario qui l'a montré.

**L'auto-clic n'est pas dans le sac.** Il est l'identité d'un motif de carte, l'ocellé, et une
identité qu'on distribue au hasard n'en est plus une.

---

**Le vocabulaire est fixé, et c'est ce qui compte le plus dans cette section.** Trois mots, trois
endroits, aucun recouvrement :

| | **Les primes** | **Les faveurs** | **La constellation** |
|---|---|---|---|
| où | en jeu | en jeu, après le premier carrefour | à l'ascension |
| payées en | pièces | pièces | jetons |
| combien | 51, écrites | sans fin, tirées au sort | 25, écrites |
| durée | le cycle, puis effacées | le cycle, puis effacées | acquises pour toujours |
| ce qu'elles font | pousser ce qu'on a | pousser un peu, encore | pousser au-delà de ce qu'un cycle peut acheter |

**Une ligne de cette table a été corrigée en `beta 4.5.0`, et la correction est importante.**
Elle disait « ouvrir ce qu'on n'a pas », et c'est ce qui a produit quatre nœuds « L'acheteur est
à toi », « Le marchand est à toi », « L'évolution est à toi », « La pension est à toi » — plus
un cinquième pour l'atelier de forge.

**L'automatisation est du jeu de base.** Elle doit être là dès la PREMIÈRE boucle : sans
acheteur ni marchand, la première heure se joue au poignet, et c'est exactement ce qu'un jeu de
clics ne doit jamais demander. Une constellation qui la possède — même seulement pour la rendre
permanente, ce qui était le cas — déplace hors de la partie une chose qui doit soulager AVANT la
première ascension. La forge relevait de la même faute : c'est là que va la poussière, une
monnaie qu'on gagne dès le premier enclos.

**Ce qui reste dans la constellation est ce qu'un cycle ne peut PAS acheter.** Huit nids sont le
plafond des primes ; le neuvième ne s'achète nulle part ailleurs. La différence tient en une
phrase : la constellation ne DÉVERROUILLE pas un pan de jeu — elle le pousse au-delà de son mur.

Les cinq nœuds retirés remboursent leurs jetons à la migration `v23`. Et la migration `v21→v22`,
qui donnait le nœud `forge` à qui avait déjà des cartes, a été SUPPRIMÉE en même temps :
accorder gratuitement une chose que le bloc suivant rembourse aurait crédité quatre jetons à
quelqu'un qui n'avait jamais rien payé. Une migration qu'on annule s'efface, elle ne se laisse
pas tourner à vide.

Sans ces deux mots, tout ce qui suit se serait dit avec le même — « une amélioration » — et le
fichier a déjà payé ce prix une fois : « palier » désignait les paliers de fortune, les paliers
d'amélioration ET les crans d'une carte, dans le même fichier et à quelques lignes d'écart. Il
a fallu renommer les troisièmes en ÉTOILES pour s'en sortir.

**La collision a été levée avant d'exister** : `constellé` était déjà un MOTIF de carte — celui
qui améliore la chance de chromatique. Il s'appelle **`nacré`** depuis la `beta 3.1.2`.

C'est le MOTIF qui a changé de nom, et pas l'inverse : un motif parmi dix est une étiquette, un
pan de jeu entier ne l'est pas. Et le renommage n'a rien coûté — une bête stocke un INDICE de
motif, pas un nom, donc aucune sauvegarde à migrer.

**Trois décisions sont prises**, et elles créent ensemble une tension qu'il faut résoudre plutôt
que subir :

| | Retenu | Ce que ça implique |
|---|---|---|
| permanence | **acquis pour toujours, tout atteignable** | l'arbre finit par s'épuiser |
| contenu | **des règles ET des nombres** | les nombres écraseront les règles |
| reprise | **aucune, pour l'instant** | un achat se subit longtemps |

Un joueur prend toujours le `+20 %` avant le nœud subtil : c'est lisible, c'est immédiat, et
ça ne demande pas de comprendre. Si les deux sont côte à côte au même prix, les règles ne
seront jamais achetées — ou seulement quand il ne restera qu'elles.

**La réponse d'alors — et elle a été jetée depuis, voir la section suivante. Elle reste ici
parce qu'elle porte la tension, qui est réelle, et que le remplaçant se comprend contre
elle** : le tronc porte les nombres, les branches portent les règles, et le tronc est le CHEMIN
vers les branches.

    ┌─ LE TRONC ─────────────────────────────────────────────┐
    │  vingt rangs, des multiplicateurs permanents           │
    │  chaque rang atteint OUVRE les nœuds de son niveau     │
    └────────────────────────────────────────────────────────┘
         │                    │                    │
      LE SANG             LA TERRE             LE TEMPS
    l'ascension       ce avec quoi on       ce qui tourne
      elle-même          repart               sans toi

On n'achète donc plus « le nombre OU la règle » : le nombre est ce qui donne accès à la règle.
La tension disparaît sans qu'on ait eu à rendre les multiplicateurs faibles — ce qui n'aurait
fait que les rendre inutiles au lieu de les rendre secondaires.

#### Le tronc — **abandonné en `beta 4.4.0`**, et il faut savoir pourquoi

La forme spécifiée ici pendant trois versions était un **tronc de vingt rangs** — des crans de
+2 % sur valeur et vitesse — servant de **chemin** vers trois branches. L'argument tenait
debout : côte à côte au même prix, un joueur prend toujours le « +2 % » lisible avant le nœud
subtil, donc on fait du nombre le péage de la règle.

**Le remède valait moins que le mal.** Vingt rangs de « +2 % » sont vingt achats qui ne se
sentent pas, alignés devant celui qui compte. On avait réglé une tension en fabriquant une
corvée, et une corvée se sent tout de suite quand une tension ne se sent qu'à la longue.

**La règle qui l'a remplacé tient en une phrase : chaque nœud fait quelque chose.** Il n'y a
plus de chemin séparé du contenu — le chemin EST le contenu, puisqu'un nœud s'ouvre avec son
PARENT. La tension d'origine disparaît d'elle-même : on ne compare plus un nombre à une règle
au même prix, on remonte une chaîne où les deux alternent.

**Ce qui a été jeté avec le tronc, et qui mérite de rester ici comme contre-exemple** : une
première liste de branches offrait *repartir avec trois enclos*, *une bourse de départ*, *un
incubateur*. Du CONFORT. Un enclos gratuit ne fait rien décider — il fait souffler.

Et une seconde faute a tenu deux versions de plus : la branche **« les bâtiments »** contenait
*L'acheteur est à toi*, *Le marchand est à toi*, *L'évolution est à toi*, *La pension est à toi*,
plus l'atelier de forge. Six nœuds sur vingt-sept occupés à **ne plus racheter** quelque chose.
Corrigé en `beta 4.5.0` : l'automatisation est du jeu de base, elle doit être là dès la première
boucle, sinon la première heure se joue au poignet.

#### La forme actuelle — six directions depuis un centre

    25 nœuds  ·  358 jetons  ·  aucun remplissage

| Axe | Ce qu'il pousse | Nœuds | Jetons |
|---|---|---|---|
| **le sang** | l'ascension elle-même — prix des cartes, paliers de jetons | 4 | 72 |
| **la main** | ce que vaut ta présence — clic, frénésie | 4 | 50 |
| **le négoce** | ce que valent tes bêtes — valeur, œufs, péage | 4 | 54 |
| **la couvée** | ce qui pousse — couvaison, croissance | 4 | 54 |
| **la pension** | ce que tu produis, au-delà du plafond des primes | 4 | 72 |
| **l'album** | ce qui traverse — poussière, forge, chromatique | 4 | 55 |

**Le parent remplace le rang.** « Demande le rang 8 du tronc » demandait de compter ; « demande
le nid de plus » se voit sur le trait qui les relie. La géométrie porte la règle, sans
intermédiaire.

**Une constellation n'a pas de sens de lecture, et c'est ce qui la rend consultable** — on part
du centre vers ce qu'on vise, pas du bas vers le haut. Le canevas est plus grand que l'écran
exprès : ce qu'on vise à trente jetons doit être loin.

#### Le dimensionnement, contre l'épuisement

« Tout atteignable » veut dire qu'un arbre trop petit devient décoratif. Il se taille donc
contre le DÉBIT DE JETONS :

    par cycle          4 à 6 jetons (les paliers franchis par le sommet)
    moins les cartes   1, 2, 3, 5, 7 — cumul 1, 3, 6, 11, 18
    reste pour l'arbre 2 à 4 jetons par ascension

Sur trente ascensions, **soixante à cent vingt jetons** atteignent l'arbre, contre **358** qu'il
demande. Il ne se termine donc jamais tout à fait, ce qui est le but : « tout atteignable » veut
dire qu'aucune porte n'est fermée, pas qu'on verra le bout.

**La conséquence de séquencement tient toujours**, et elle est lourde : une partie des nœuds
qu'on voudrait écrire ouvre des choses qui n'existent pas encore — l'hérédité, le marché, l'œuf
mystère, les chromatismes, les tempéraments à double effet. Un nœud apparaît le jour où sa
fonctionnalité existe, jamais avant. **C'est d'ailleurs le meilleur argument pour la
constellation** : elle donne un endroit où arriver à tout ce qui reste à écrire, au lieu que
chaque système nouveau soit posé à côté des autres.

#### Ce qui reste ouvert

- ~~**Où il vit.**~~ **Tranché** : un onglet à lui, qui paraît au premier jeton. L'ouvrir
  seulement depuis l'ascension l'aurait lié à son moment, mais enterré le reste du temps.
- **Ce qu'on voit avant de pouvoir l'acheter.** Le jeu a une doctrine là-dessus : la boutique
  montre « la marche suivante », les primes n'en montrent que cinq, les merveilles ne se nomment
  pas avant d'être vues. Un arbre qui montre tout d'un coup contredirait tout le reste.
- ~~**L'absence de reprise.**~~ **Livrée en `beta 4.7.0`**, et pour la raison écrite ici : dans
  un jeu à une seule sauvegarde, un nœud pris par erreur se subissait pour toujours. Elle ne
  rend pas les choix gratuits, elle les rend RÉVISABLES. **Ce qui reste ouvert, c'est sa
  limite** : elle est aujourd'hui gratuite et sans compteur, ce qui convient pour essayer le
  jeu mais retire tout poids à l'arbre si ça reste. Une reprise par ascension est la borne la
  plus naturelle — à poser le jour où l'équilibrage viendra.

#### Ce qu'il faut mesurer avant d'écrire une ligne

Le prix des cartes et l'arbre **retirent tous les deux des cartes à l'album**. Trois cartes de moins
par ascension, sur dix ascensions, c'est trente cartes — et la forge en demande neuf pour une
seule trois-étoiles. Il y a un risque réel que l'album cesse de se remplir assez vite pour que
la forge existe. **À chiffrer sur une partie simulée avant de figer φ**, et φ n'est peut-être pas
le bon facteur : c'est un joli nombre, ce n'est pas une raison.

### Les teintes deviennent des chromatismes — à analyser

**Une seule échelle de couleur au lieu de deux, et plusieurs chromatismes en haut.**

#### Deux systèmes qui font déjà le même métier

Le jeu porte aujourd'hui **deux axes de couleur qui ne se distinguent que par leurs chiffres** :

| | Teintes | Chromatique |
|---|---|---|
| ce que c'est | huit crans, `TINTS` | un booléen, `prodige` |
| tiré | à l'éclosion, gardé à vie | à l'éclosion, gardé à vie |
| montré par | un filtre CSS | un filtre CSS |
| entre dans | `variantMult` | `variantMult` |
| fréquence | 52 % ordinaire, jusqu'à 1,6 % albâtre | 1 sur 8 192, soit 0,012 % |
| vaut | ×1,10 à ×1,40 | ×25, et double la rente |

Tout est commun sauf l'ordre de grandeur. Ce ne sont pas deux mécaniques, c'est **une mécanique
et une exception** — et l'exception a fini par prendre le nom de la famille : « chromatique ».

#### Ce que la fusion des deux change vraiment

**Le plafond d'une bête.** Aujourd'hui les deux se MULTIPLIENT : un albâtre chromatique vaut
×35. Sur une seule échelle on ne peut plus être les deux, donc le haut de la nouvelle échelle
doit absorber ce que la combinaison donnait — sinon la meilleure bête possible du jeu perd un
tiers de sa valeur, et tout l'équilibrage de la fin de partie bouge avec elle.

**Ce qui améliore les chances.** Le chromatique a ses propres tirages améliorables — la carte
nacrée, la prime *Œil exercé*, le bonus d'élevage. Les teintes, elles, n'ont rien : leur
tirage est un `pickWeighted` fixe. S'il n'y a plus qu'une échelle, il faut décider **ce que ces
bonus poussent** : le rang le plus rare seulement, ou toute l'échelle vers le haut. Le second
est plus intéressant — il rend le nacré utile bien avant d'espérer le rang ultime — et c'est
aussi le plus délicat à équilibrer.

**Le carnet.** L'encyclopédie compte déjà les teintes croisées par lignée, et les prodiges à
part. Une seule échelle donne une seule rangée, et le compteur de prodiges rejoint la rangée
des teintes. C'est une simplification franche.

**La sauvegarde.** `tint` (un indice) et `prodige` (un booléen) deviennent un champ. La
migration est simple et doit être GÉNÉREUSE dans un seul sens : un chromatique d'avant doit
ressortir au moins aussi haut qu'avant, jamais en dessous.

#### La question qui décide de la forme

**Un chromatisme est-il un cran de l'échelle, ou une couche par-dessus ?**

Un cran : on est écarlate OU chromatique-de-feu, jamais les deux. L'échelle est simple, elle se
lit d'un nombre, et le plafond est net.

Une couche : un doré peut en plus être chromatique. C'est ce que fait le jeu aujourd'hui, et
c'est ce qui produit le ×35. Ça garde deux tirages à équilibrer, donc les deux systèmes qu'on
cherchait à réunir.

La demande — « les variantes de couleur SERONT considérées comme chromatique » — penche vers le
cran : une seule échelle, dont les derniers rangs sont les chromatismes. Reste alors à trancher
combien il y en a, et ce qui les distingue **autrement que par un chiffre** : trois chromatismes
qui ne diffèrent que par leur multiplicateur ne sont pas trois choses, c'est un menu — la même
faute que celle écrite plus haut à propos des primes à choix.

#### Ce qui ne bouge pas

**Les fonds restent dehors.** Ils sont un décor DERRIÈRE la bête, pas une couleur DE la bête, et
le fichier le dit déjà : le motif décide de l'effet d'une carte, le fond de sa valeur, la teinte
de son prix. Trois métiers, et seuls deux d'entre eux fusionnent ici.

### Le bonheur et la frénésie, à revoir

Le seul système du jeu qui récompense la **présence** plutôt qu'une décision. Il marche, et
trois choses ne vont pas.

**Il récompense de ne rien faire.** Le bonheur monte sur la bête EN SCÈNE — `tickJoie` lit
`current()`. Autrement dit il s'accumule sur celle qu'on regarde, et changer de bête remet le
compteur de celle qu'on quitte à l'arrêt. Le geste récompensé est donc « ne touche à rien »,
ce qui est l'inverse de ce qu'un jeu veut encourager.

**La récompense s'éteint au moment où on la mérite.** Un cadeau donne `clic ×2` pendant dix à
trente secondes. Or plus la partie avance, moins le clic pèse : la ferme tourne aux automates,
à la rente et à la pension. Les deux primes qui nourrissent le système — *Soins attentifs* et
*Générosité* — s'achètent donc pour un bonus qui vaut de moins en moins, et le plafond d'une
minute (`FRENESIE_MAX`) empêche même de compenser par le volume.

**Le système est presque invisible.** Quatre-vingt-dix secondes de présence, un tirage à 35 %,
et le bonheur d'une bête disparaît avec elle quand on la vend. Rien ne s'accumule, rien ne se
collectionne, rien ne se vise.

#### Au niveau max, le clic devrait payer — **fait en `beta 3.1.0`**

> *L'embonpoint logarithmique décrit ici n'existe plus depuis la `5.7.0` : la taille est une
> marche, elle repart de zéro à l'évolution, et elle ne se vend plus — elle multiplie la
> poussière du saut. Le clic sur une bête finie, lui, paie toujours.*

L'idée : **une bête arrivée au bout rend des pièces à chaque clic**, pour qu'on ait encore une
raison de cliquer sur un rentier en fin de partie.

**Ce que fait un clic aujourd'hui, et ce n'est pas rien.** Sur une bête mûre il ne se perd pas :
il part dans l'EMBONPOINT, qui monte la taille, qui monte la valeur, qui monte la rente. Le
geste paie donc déjà — sauf que `sizeFactor` est **logarithmique** :

    sizeFactor = 1 + OVER_GAIN × ln(1 + over / croissance de l'âge)

Chaque clic vaut donc strictement moins que le précédent, et le rendement tend vers zéro sans
jamais l'atteindre. Le problème n'est pas que le clic ne serve à rien, c'est **qu'il ne se sent
plus** — ce qui, pour le joueur, revient au même et est plus déroutant.

#### La contrainte qui décide de tout : la carte ocellée

**Une carte ocellée clique à ta place.** Si un clic rapporte des pièces, elle devient une
machine à monnaie automatique, et l'idée produit exactement l'inverse de son intention : au lieu
de pousser à cliquer, elle rend le clic inutile en le déléguant. Trois issues, à choisir :

- **le gain ne vaut que pour la main du joueur** — `mainDeCarte` est déjà levé pendant les clics
  de l'ocellé, et la plonge s'en sert déjà pour se refuser à elle. Le précédent existe ;
- **l'ocellé rapporte moins**, une fraction du clic manuel ;
- **l'ocellé change de nature** et cesse de cliquer sur ce qui paie.

La première est la plus simple et la plus honnête : *ce qui récompense la présence ne doit pas
s'automatiser.*

#### Le seuil : trois plafonds à la fois

**Âge légende, niveau cent, ET dernier rang de taille.** Les trois ensemble, pas le premier
seul : une commune mûre à l'âge enfant est déjà « au max de sa tranche », et si elle paie, c'est
toute la ferme qui paie — la mécanique deviendrait le cœur du jeu au lieu d'en être la fin.

Le code sait déjà dire les trois : `c.age === AGES.length`, `niveau(c) === NIV_MAX`, et
`rankOf(sizeFactor(c)).next === null`.

**Et ce troisième plafond est un vrai bout.** L'embonpoint est logarithmique, donc il ne sature
jamais en théorie — mais l'échelle des rangs, elle, s'arrête :

    grand        0,7 × la croissance de l'âge
    énorme       2,6 ×
    colossal     9,6 ×
    titanesque    54 ×
    démesuré     579 ×
    (le cran suivant, s'il existait)   7 400 ×

Atteindre *démesuré* demande cinq cent soixante-dix-neuf fois la croissance d'un âge ; le cran
d'après en demanderait treize fois plus. Personne n'ira. C'est donc bien la fin de la
progression d'une bête, et pas une étape.

**Ce qui manque aujourd'hui, c'est que rien ne le dit.** Au dernier rang, le nom cesse de
changer, la taille à l'écran est plafonnée, et la valeur continue de grimper de façon
imperceptible. La bête est finie et le jeu ne le reconnaît pas — c'est exactement ce que le
clic payant viendrait réparer : **une récompense qui dit « celle-là, tu l'as menée au bout ».**

**Le gain ne doit pas battre la rente ni la vente**, sinon l'optimum devient « garde une légende
et clique pour toujours » — la même faute que la rente perpétuelle, sous une autre forme.

#### Ce que ça répare ailleurs

C'est la pièce qui manquait à la frénésie. Son défaut est écrit plus haut : la récompense est un
`clic ×2` qui s'éteint au moment où on a les primes pour la nourrir, parce que le clic cesse de
peser. **Si le clic paie en fin de partie, la frénésie, *Soins attentifs* et *Générosité*
redeviennent tous les trois utiles d'un coup**, sans qu'on touche à aucun des trois.

Les deux chantiers n'en font donc qu'un.

#### Les trois directions possibles

- **Rendre le bonheur collectif** — il monte sur l'enclos entier plutôt que sur la bête
  regardée. La présence reste récompensée, mais on redevient libre de bouger.
- **Changer la nature de la récompense** — le `×2` sur le clic ne survit pas à la partie ; un
  bonus qui touche ce qui tourne (couvaison, croissance, ponte) survit. Le clic reste le verbe
  du joueur au début, il ne l'est plus à la fin, et la récompense devrait suivre.
- **Lui donner une trace** — le bonheur d'une bête gardée pourrait devenir un attachement qui
  se voit : un compteur, un titre, un petit bonus permanent à cette bête. C'est le seul moyen
  que le système existe pour le joueur autrement que par un éclair toutes les quatre minutes.

**À traiter avec la rente**, pas avant : les deux répondent à la même question — qu'est-ce
qu'on gagne à garder une bête plutôt qu'à la vendre — et les corriger séparément reviendrait à
tirer sur les deux bouts de la même corde.

### Les fonds à la pension — les deux voies, et non plus aucune

**La règle change.** La pension ne donnait aucun fond, et devait en donner le jour où elle
saurait les *hériter*. Elle en donnera par **deux voies à la fois** :

1. **au hasard, exactement comme les teintes** — chaque œuf pondu tire son fond comme il tire
   déjà sa teinte, son caractère et son motif ;
2. **par hérédité** — les parents transmettent le leur.

Les deux ne font pas double emploi : la première fait qu'on en *rencontre* en élevant, la
seconde qu'on peut en *viser* un précis. C'est la même frontière qu'avant, mais elle passe
désormais à l'intérieur de la pension au lieu de la séparer de la boutique.

#### Le chiffre qui justifiait le garde était faux

Le code et le README disaient la même chose : « une ligne de production à mille œufs l'heure
en sortirait un toutes les cinq minutes ». Mille œufs l'heure à un sur huit cents font **1,25
fond par heure**, soit un toutes les *quarante-huit* minutes — pas cinq.

Et mille œufs l'heure n'est pas le plafond : le vrai maximum est de **1 920 œufs l'heure**
(huit couples, portée 5, 900 s de base divisées par la vitesse 12, deux communes identiques).
Ce qui donne **2,4 fonds l'heure, un toutes les vingt-cinq minutes** — au sommet absolu d'une
partie parfaitement optimisée, pas en jeu ordinaire.

Le garde a donc été posé sur un chiffre cinq à dix fois trop alarmant. Ça ne le rendait pas
absurde — un fond toutes les vingt-cinq minutes reste beaucoup pour un objet dit prestigieux —
mais ça change la question : elle n'est plus « est-ce que ça casse ? », elle est **« à partir
de quel rythme un fond cesse d'être une rencontre ? »**

#### Ce qui est proposé, à trancher en jouant

- **Le hasard au même taux qu'à la boutique**, un sur huit cents. Rien ne justifie deux
  chiffres tant que le plafond réel est de un toutes les vingt-cinq minutes, et deux taux
  différents demanderaient d'expliquer pourquoi.
- **L'hérédité n'invente rien** : elle ne peut transmettre que ce que les parents portent.
  Deux parents du même fond le passent souvent ; un seul parent le passe rarement ; deux fonds
  différents donnent l'un des deux, jamais un troisième. C'est ce qui fait qu'on *chasse* un
  fond précis en composant un couple, au lieu de l'attendre.
- **Les deux tirages sont indépendants et se cumulent** : un œuf sans parent doué peut quand
  même en sortir un, sinon la pension d'un joueur qui n'en a aucun n'en produirait jamais et la
  première voie serait fermée à celui qui en a le plus besoin.

À mesurer avant de figer les taux : le débit réel d'une pension de milieu de partie, qui est
très loin du plafond théorique — c'est lui qui décide, pas le sommet.

### Les primes, et les rares

#### Les primes à choix — le plus important des trois

**Trois options, on en prend une.** La question qui décide de tout le reste : les deux autres
sont-elles PERDUES, ou seulement remises à plus tard ?

**Perdues.** Remises à plus tard, ce n'est pas un choix, c'est un ordre d'achat — on finit par
tout avoir et la décision ne coûte rien. Perdues, c'est une décision de build.

Et c'est là que ça se marie à ce qui existe déjà : **les primes ne traversent pas l'ascension**
— la ferme repart de zéro et les primes avec elle, seul l'album voyage. Le choix se REFAIT donc
à chaque cycle. C'est exactement ce qui manque au jeu aujourd'hui : une raison de rejouer
*autrement*, et pas seulement plus vite.

**La contrainte qui décide si c'est réussi** : les trois options doivent pousser des jeux
différents, pas le même bonus décliné. « +10 % de vente / +10 % de rente / +10 % de vitesse »
n'est pas un choix, c'est un menu. Le modèle existe déjà dans le jeu — les familles de motifs
de l'album font précisément ça, et deux d'entre elles baissent des PRIX au lieu d'augmenter des
vitesses, ce qui est ce qui empêche la seconde partie d'être la première en accéléré.

**Conséquence d'écran, à ne pas découvrir en codant** : la grille des primes montre les cinq
prochaines en petites cases. Une prime à choix n'entre pas dans ce format. Il lui faut trois
cartes côte à côte et un moment où le jeu s'arrête pour demander — c'est un écran, pas une case.

#### Le système entier est à revoir, au moment de l'équilibrage

Quarante-cinq primes, de 250 à 2 000 milliards : quinze sous le million, dix-huit entre le
million et le milliard, douze au-delà. Comme la grille ne montre que les cinq prochaines, **la
prime suivante EST l'objectif du moment** — il n'y en a jamais d'autre à l'écran.

Ce qui veut dire que réviser les primes n'est pas retoucher des chiffres : **c'est réécrire la
courbe de progression du jeu.** Deux choses à regarder quand ce sera le moment :

- **les marches vides** — une prime qui ne se sent pas quand on l'achète est une marche qu'on
  monte sans rien gagner, et elle coûte d'autant plus cher qu'elle occupe une des cinq cases ;
- **la densité de la fin de partie** — douze primes pour tout ce qui est au-delà du milliard,
  contre quinze pour la première tranche, alors que la fin de partie dure bien plus longtemps.

#### Les rares sont le prochain palier

> **Renversé par [le barème unique](CHANGELOG.md#un-seul-barème-pour-tous-les-œufs--livré-en-beta-570)**, livré en `beta 5.7.0` : l'œuf
> rare coûte 10 000, moins qu'une légende commune, et le mur de l'ère rare est dans ses péages —
> mener une rare au bout demande 27,7 légendes communes. Gardé pour le raisonnement.

**Les communes sont jugées bien équilibrées, en jouant.** Le chantier suivant est l'ère rare, et
il n'est pas neuf : les deux cibles déjà posées plus haut en sont le contenu.

- l'**œuf rare vers trente millions** et non ses trois cent mille ;
- le **péage d'évolution des rares**, fort sans bloquer une rare tombée par chance.

Elles cessent donc d'être deux notes isolées : ce sont les deux moitiés d'un même palier, et
elles se traitent ensemble — reculer l'ère rare rend une rare précoce encore plus précoce.

**L'ordre de travail compte** : équilibrer une ère demande de l'avoir jouée. Le chantier commence
par une partie menée jusqu'à l'ère rare, pas par une table de chiffres — c'est ce qui a permis
de dire que les communes vont bien.

#### La mesure, faite au banc — et elle dit autre chose

    ce que coûte l'œuf de l'ère suivante, en temps de la ferme courante
    (huit bêtes de l'ère, à l'âge 5, rente seule)

    ère courante    rente/h de huit    œuf suivant    temps pour le payer
    commune               3,24 M          300 000           6 min
    rare                  77,7 M           7,50 M           6 min
    épique                1,86 Md         180,0 M           6 min

**SIX MINUTES, TROIS FOIS.** Ce n'est pas l'ère rare qui est mal placée, c'est **l'échelle
entière qui est plate** : chaque marche coûte exactement la même fraction de la précédente, et
cette fraction est minuscule. Reculer le seul œuf rare ferait de l'ère rare la seule ère longue
du jeu, avec les deux suivantes traversées en six minutes chacune — on aurait déplacé le
défaut, pas corrigé.

**Et le tout premier pas est pire encore** : une commune menée à l'âge 5 se vend **371 644**,
l'œuf rare en coûte **300 000**. UNE bête suffit à ouvrir l'ère rare — pas une ferme, pas une
heure, une bête.

Ce que coûterait l'œuf pour une durée d'ère visée :

    durée visée     œuf rare     œuf épique    œuf mythique
    6 min            310 830        6,76 M        162,2 M      ← aujourd'hui
    30 min            1,55 M        33,8 M        810,9 M
    1 h               3,11 M        67,6 M        1,62 Md
    2 h               6,22 M       135,1 M        3,24 Md
    4 h               12,4 M       270,3 M        6,49 Md
    8 h               24,9 M       540,6 M        13,0 Md

**La cible « vers 30 millions » vaut 9,7 heures de ferme commune mûre** — dix fois la marche de
huit heures, et cent fois la marche actuelle. Elle n'est pas absurde pour un idle, mais elle
n'a jamais été posée contre un chiffre : elle se décide maintenant, et **elle se décide pour
les trois marches à la fois**.

#### Les deux ères, jouées bout à bout — et le verdict s'inverse

La première mesure comparait des ŒUFS. C'était regarder la mauvaise ligne du budget. Voici les
deux ères jouées au banc, une politique simple — cliquer sur ce qui n'est pas mûr, monter les
automates, payer les péages qu'on peut, recycler ce qui bloque, ne jamais vendre ce qui rente —
jusqu'à **huit bêtes de l'ère menées à l'âge 5** :

    ère commune      86 min
    ère rare        249 min       ×2,9

**L'ÈRE RARE EST DÉJÀ TROIS FOIS PLUS LONGUE QUE L'ÈRE COMMUNE.** Renchérir l'œuf rare
l'allongerait encore, alors que le critère retenu est que les deux durent pareil. La cible
« vers 30 millions » aurait donc poussé dans le mauvais sens.

#### Pourquoi : l'œuf ne pèse rien, le péage pèse tout

    ce que coûte une bête menée à l'âge 5

    rareté        œuf        péages 1→5      total     part de l'œuf
    commune            18       643 200      643 218       0,00 %
    rare          300 000        16,1 M       16,4 M       1,83 %
    épique         7,50 M       385,9 M       393,4 M      1,91 %
    mythique      180,0 M        9,65 Md      9,83 Md      1,83 %

**L'œuf est un huitantième du prix d'une bête finie. Le péage est tout le reste**, et à un
rapport remarquablement constant — 1,8 % dans les trois ères hautes. Le prix de l'œuf n'est pas
le levier de la durée d'une ère : c'est le prix d'entrée, pas le prix du voyage.

**Ce qui rend la seconde ère plus lente, c'est que le clic cesse d'y peser.** L'ère commune est
portée par la main — on clique, on vend, on rachète, et les péages de 200 et 3 000 pièces
tombent vite. À partir de la rare, un péage se compte en millions : plus aucun clic ne le paie,
et l'ère entière devient de l'attente de rente. **Les deux ères ne se jouent pas au même jeu**,
et c'est ça qu'il faut corriger, pas trois nombres dans une table.

> **Le levier est donc le péage, pas l'œuf.** Ce qui découle du critère « la rare doit durer
> comme la commune » : diviser les péages rares par environ trois, ou rendre au clic un poids
> qui suit l'échelle. La seconde piste est la meilleure des deux — elle répare la cause au lieu
> du symptôme — mais elle touche la même mécanique que le chantier de la rente.

#### Les trois leviers mesurés — et le verdict

**D'ABORD UNE CORRECTION : LE BANC NE JOUAIT PAS LE JEU.** La première version de la simulation
n'achetait **aucune prime** — elle mesurait donc une partie que personne ne joue. Avec les
primes achetées (vingt-cinq sur la course), le rapport entre les deux ères tombe de **×2,70 à
×1,89**. Tout ce qui suit est mesuré sur la version corrigée.

**LE PÉAGE EST DÉJÀ CALIBRÉ.** Le rapport entre ce que coûtent les péages d'une bête et ce
qu'elle vaut une fois grandie :

    commune    643 200  →     371 644     ×1,73
    rare        16,1 M  →      8,45 M     ×1,90
    épique     385,9 M  →     202,7 M     ×1,90
    mythique    9,65 Md →      5,07 Md    ×1,90

Le même nombre à toutes les raretés, et c'est ce qui tient la règle du jeu : faire grandir une
bête PERD toujours de l'argent à la vente, seule la rente rembourse. Baisser le péage des rares
seules en ferait la première bête qu'on élève pour revendre. **Le péage n'est pas un levier
libre, il est porteur.**

**L'ŒUF NE PÈSE RIEN** : 300 000 contre 16,1 M de péages, soit **1,8 %** du coût d'une rare
menée à l'âge 5. Le balayage l'a confirmé — de 300 k à 30 M, le rapport EMPIRE.

**LE RARE GRATUIT EST DÉJÀ TENU, ET C'EST LE PÉAGE QUI LE TIENT.** Un œuf commun donne une rare
une fois sur mille. Deux mesures :

    rendement par pièce investie en péages (rente/h ÷ péages payés)
      âge 3     commune 1,88     rare 2,25
      âge 4     commune 2,04     rare 2,22
      âge 5     commune 0,53     rare 0,53

**Le rendement est le même.** Une rare tombée par chance n'est pas plus RENTABLE qu'une commune,
elle est seulement plus GROSSE — et pour en profiter il faut lui payer **1,08 M de péages**
rien que pour l'amener à l'âge 4. Une ferme commune mûre rend 3,24 M/h ; tant qu'on ne l'a pas
bâtie, on ne peut pas payer. Le verrou tient tout seul, et c'est une troisième raison de ne pas
toucher au péage.

> **CORRECTION — LE VERDICT « ON NE CHANGE RIEN » ÉTAIT PRÉMATURÉ.** Il reposait sur un
> balayage fait AVANT que le banc n'achète des primes, et ce balayage disait que renchérir
> l'œuf empirait le rapport entre les deux ères. Refait avec les primes, il dit l'inverse :

    œuf rare 300 000  →  ×1,89        œuf rare 50 M  →  ×1,79

**L'ŒUF RARE VAUT DONC CINQUANTE MILLIONS depuis la `beta 4.8.0`**, et les deux étages du
dessus suivent du même facteur — l'épique à 1,25 Md, le mythique à 30 Md. Sans ça l'œuf rare
aurait coûté plus cher que l'épique et l'escalier se serait retourné.

Ce que ça change, et c'est ce qui était demandé : **une seule commune menée à l'âge 5 se vend
371 644**. À 300 000, une bête suffisait à ouvrir l'ère rare — l'ère commune s'arrêtait le jour
où elle commençait à fonctionner. À 50 M il faut une quinzaine d'heures de ferme commune mûre,
et l'œuf rare redevient ce que sa fiche annonce : « le premier qui se réfléchit avant de
l'acheter ».

**Ce qui ne bouge pas** : les communes, et le péage. Les trois mesures qui suivent restent
vraies, et deux d'entre elles expliquent pourquoi le péage n'a pas été touché.

### Vingt idées relues, huit retenues

Ce qui suit vient d'une passe où vingt propositions hors plan ont été mises sur la table. Huit
ont été retenues, et deux d'entre elles RENVERSENT une règle déjà écrite — c'est pour ça
qu'elles sont analysées ici plutôt que listées dans le tableau.

#### Le prix d'une évolution — plan de prix

> **Renversé par [le barème unique](CHANGELOG.md#un-seul-barème-pour-tous-les-œufs--livré-en-beta-570)**, livré en `beta 5.7.0` : les murs
> ×625 / ×40 / ×20 / ×20 sont devenus des péages qui se paient en quinze à vingt-cinq ventes de
> l'âge qu'on quitte. Gardé pour le raisonnement.

**Une seule évolution sur quatre est un mur.** Le péage, rapporté à ce que vaut la bête à l'âge
qu'elle quitte :

| évolution | aujourd'hui |
|---|---|
| enfant → adolescent | **×625** |
| adolescent → adulte | ×4 |
| adulte → ancien | ×3 |
| ancien → légende | ×3 |

La première porte est une muraille ; les trois autres se paient en vendant deux ou trois bêtes du
même âge. Une fois le premier péage franchi, le reste suit tout seul — et c'est exactement ce
qu'on ne veut pas d'une mythique tombée à la loterie.

**Et la forme est la même à toutes les raretés**, parce que c'est UNE table multipliée par `mult` :
`VALEURS_RANG` et `PEAGES_RANG`. La merveilleuse partageant le `mult` de la mythique, elle
partage aussi ses péages — elle ne coûte pas un sou de plus à mener au bout.

##### La contrainte qui a figé ce réglage

La règle vivante veut qu'une bête achetée n'ait PAS remboursé son œuf à l'âge adulte et l'ait
remboursé à l'âge ancien. Écrite en clair :

> `v(adulte) − (p1 + p2) ≤ prix de l'œuf`, donc **`p2 ≥ v(adulte) − p1 − œuf`**

Avec `v(adulte) = 3 000 000`, `p1 = 50 000` et un œuf à `2 200 000`, il vient **`p2 ≥ 750 000`** —
exactement la valeur d'aujourd'hui. **Le deuxième mur ne peut pas grandir sans que la valeur de
l'adulte grandisse.** Les deux sont liés, et c'est pour ça que cette table n'a jamais bougé : on
ne peut pas la toucher par un bout.

##### Les prix proposés

```
VALEURS_RANG   [80, 200 000, 10 000 000,  220 000 000, 7 000 000 000]
PEAGES_RANG    [50 000,  8 000 000, 200 000 000, 4 400 000 000]
```

| évolution | aujourd'hui | proposé |
|---|---|---|
| enfant → adolescent | ×625 | ×625 |
| adolescent → adulte | ×4 | **×40** |
| adulte → ancien | ×3 | **×20** |
| ancien → légende | ×3 | **×20** |

Les quatre deviennent des murs. Le remboursement tombe toujours à l'âge ancien — la règle tient.
Et la marge au bout passe de 3 % à 52 % : mener une bête à la légende cesse d'être une formalité
pour devenir un investissement qui rapporte vraiment.

Ce que ça coûte de mener une bête au bout, en pièces :

| rareté | aujourd'hui | proposé |
|---|---|---|
| rare | 9,2·10⁸ | 1,15·10¹¹ |
| épique | 1,67·10¹³ | 2,09·10¹⁵ |
| mythique | 3,01·10¹⁷ | 3,77·10¹⁹ |

##### CE QUI NE PEUT PLUS SE RÉGLER À PART : la rente

**Une légende gardée rembourse son propre œuf en dix-sept secondes**, à toutes les raretés —
mesuré, et c'est vrai aujourd'hui, avant tout changement. C'est là qu'est la somme *broken*, et
elle ne vient pas des péages : la rente lit la VALEUR de la bête, pas ce qu'elle a coûté.

Or la table proposée multiplie la valeur d'une légende par **175**. Une légende gardée
rapporterait donc 175 fois plus. Pour qu'une garde se rembourse dans le même temps
qu'aujourd'hui, `RENTE_H` devrait passer de **300 s à 14,6 h** — ce qui contredit frontalement la
décision du 5 septembre, juste au-dessus : *une décision de garde doit se payer dans la séance.*

**Monter les murs sans toucher à la rente rend donc la garde 175 fois plus forte.** Les deux
réglages étaient séparables tant que les valeurs ne bougeaient pas ; ils ne le sont plus. Il faut
choisir l'une des trois sorties déjà listées — **plafonner, tarir ou facturer** — et ce plan de
prix ne tient que si l'une des trois est faite dans la même version.

##### Les merveilles, et le mur qu'on ne voit qu'en calculant

Leur donner leurs propres péages est simple : une table à part, `PEAGES_MERVEILLE`. Mais il y a
un seuil qu'il faut connaître avant de choisir le facteur.

Avec les prix proposés, mener une mythique au bout coûte 3,77·10¹⁹ et elle vaut 5,73·10¹⁹.
**Au-delà de ×1,52 sur les péages, mener une merveille au bout devient une PERTE en pièces.** À
×25 — « très éloignées », comme demandé — elle coûterait 9,4·10²⁰ pour valoir 5,7·10¹⁹ : seize
fois plus cher que ce qu'elle rapporte.

Ce n'est pas forcément une objection. C'est même cohérent avec ce que la table dit déjà d'elle :
*« elle est un cran de RARETÉ, pas un cran de PUISSANCE »*. À ×25, la merveille devient un
**trophée qu'on paie** — le sommet du jeu, et une chose qu'on ne fait pas pour l'argent.

Mais alors il faut trancher, parce que les deux lectures s'excluent :

- **La merveille reste un trophée.** Ses péages montent, sa valeur ne bouge pas. La doctrine tient
  et se renforce ; la pension ne redevient pas une stratégie d'argent. Prix à payer : personne ne
  mène une merveille au bout pour gagner des pièces, il faut donc qu'elle rapporte AUTRE CHOSE —
  une carte, une entrée d'encyclopédie, un trophée.
- **La merveille devient une puissance.** Ses péages ET sa valeur montent. Elle redevient
  rentable — et la pension redevient la meilleure façon de faire de l'argent, ce que la table
  interdit explicitement et pour une raison écrite.

##### Ce qui a été tranché — livré en `beta 4.27.0`

**1. Les murs.** Retenus tels quels : ×625 / ×40 / ×20 / ×20. Le deuxième péage vaut 7 750 000 et
non 8 000 000, et ce n'est pas un arrondi : la contrainte `v(adulte) − p1 − p2 = prix de l'œuf`
le fixe à l'unité près. Il n'est pas choisi, il est déduit.

**2. La rente : aucune des trois sorties.** Les mots étaient du jargon, et la mesure les a rendus
inutiles. Le vrai rapport n'est pas le délai de remboursement d'une garde, c'est **garder contre
vendre**, par case d'enclos et par seconde :

| | garder vaut |
|---|---|
| avant | **×740** vendre |
| avec les nouveaux péages, rente inchangée | ×54 |
| avec `RENTE_H = 7200` | **×2,3** |

**Les péages ont fait les trois quarts du travail à eux seuls.** Ce n'était pas la rente qui était
trop forte, c'était la vente qui ne rapportait rien — 3 % de marge. À 52 %, élever pour vendre
redevient un métier, et il ne restait qu'un nombre à tourner.

> **Quatre heures depuis la `5.7.0`** : [le barème unique](CHANGELOG.md#un-seul-barème-pour-tous-les-œufs--livré-en-beta-570) ramène la marge au
> bout à 8–12 %, et `RENTE_H = 14 400` rend le même rapport, entre 2,3 et 2,7.

`RENTE_H` passe donc de 300 s à 7 200 s. Une garde se rembourse en deux heures, une nuit de huit
heures rend quatre fois la valeur de la bête gardée. **L'absence reste nettement le meilleur
emploi d'une case** — c'était la demande — mais vendre cesse d'être une perte de temps.

*Ce que ça révise :* la `4.11.5` posait qu'une garde doit se payer DANS LA SÉANCE. Deux heures ne
le garantissent plus au même sens. En échange, la décision existe : à 740 contre 1, il n'y avait
pas de décision, il y avait une évidence.

*Ce que ça ne règle toujours pas :* la rente reste perpétuelle et gratuite. On a réglé le DÉBIT,
pas la NATURE — mais le chantier change de taille, il ne s'agit plus de sauver le jeu d'un
optimum unique.

**3. La merveille : les deux.** Elle prend un cran de puissance au-dessus de la mythique —
multiplicateur 147 000 000 000 000, soit ×18 000, le même cran qui sépare l'épique de la mythique.
Ses péages montent du même cran, puisqu'ils sortent des mêmes tables.

**Sa marge est donc exactement celle d'une mythique, et d'une rare.** C'est ce qui désarme
l'objection qui avait figé la règle d'avant : la pension ne devient pas un raccourci vers
l'argent, elle est la seule PORTE vers un barreau de plus — et il faut déjà une fortune de ce
barreau-là pour l'emprunter. Un scénario garde l'égalité de pente sur les quatre rangs payants :
le multiplicateur a le droit de bouger, la pente n'a pas le droit de changer.

##### Une décision écrite que ce chantier renverse

La doctrine disait : *« la merveilleuse est un cran de RARETÉ, pas un cran de PUISSANCE »*, et
elle donnait sa raison. Elle est réécrite dans `game.js`, raison comprise, parce qu'un
commentaire qui garde l'ancienne règle à côté de la nouvelle table est exactement ce qui a caché
pendant plusieurs versions un escalier des œufs qui n'en était pas un.

Et la répartition du péage repasse à 95 % sur la dernière marche — ce que la version d'avant
avait corrigé. **C'est assumé, et c'est arithmétique :** la valeur d'une bête est multipliée par
trente entre deux âges, donc ×20 à la fin pèse plus que ×40 au début. Les deux unités — part du
total, et nombre de bêtes à vendre — ne peuvent pas être satisfaites ensemble. On a choisi celle
qui décrit ce que le joueur vit.

#### La garde illimitée est trop forte — ET ON LA GARDE AINSI, décidé le 5 septembre 2026

Le constat vient du jeu : une bête gardée rapporte **sa propre valeur de vente toutes les
cinq minutes, indéfiniment, sans rien coûter** (`renteOf`, `RENTE_H = 300`). Une mythique
légende vaut 600 milliards : elle en rend 7 200 par heure, pour toujours, et `☆ garder` la met
à l'abri du marchand.

**DEUX RÉGLAGES DE NIVEAU ONT DÉJÀ EU LIEU, ET AUCUN N'EST CE CHANTIER — ils l'ont agrandi.**
`RENTE_H` valait 3600 jusqu'à la `4.9.0`, 1200 depuis la `4.9.1`, 300 depuis la `4.11.5`. Ce
qui se joue là est le DÉBIT de la rente ; ce qui suit porte sur sa NATURE : perpétuelle et
gratuite. Les deux se règlent séparément.

**Le choix de la `4.11.5` est délibéré et assumé** : une décision de garde doit se payer dans
la séance, et vingt minutes dépassaient ce qu'on passe devant l'écran entre deux gestes. Le
prix à payer est mesuré et il est lourd — **garder une case rapporte quatre-vingt-dix fois le
débit d'un cycle élevage-et-vente**, à toutes les raretés, contre vingt-deux fois avant. Le
chantier ci-dessous n'en devient que plus nécessaire : tant que la rente reste perpétuelle et
gratuite, monter le débit ne fait que rigidifier l'optimum de fin de partie. La stratégie optimale de fin de partie est donc : remplir tous les enclos de bêtes
gardées et ne plus jamais rien vendre. **La seule limite est le nombre d'enclos.**

C'est ce qui condamne le **vivier** — garer une bête hors enclos contre un coût. L'idée
supprimerait précisément la seule limite qui tient encore le système. Elle était EN ATTENTE et
non rejetée, parce qu'elle redevenait bonne le jour où la rente cesserait d'être perpétuelle.
Ce jour n'arrivera pas — voir juste en dessous — donc elle est refusée pour de bon.

Trois pistes avaient été écrites, et aucune ne sera prise :

- **un coût d'entretien** par bête gardée, qui monte avec la rareté ;
- **une rente qui décroît** avec le temps passé dans l'enclos ;
- **un plafond de rente par enclos**, indépendant de la valeur de la bête.

**LA RENTE SORT DU PLAN.** Ce n'est pas un report, c'est un refus : le constat ci-dessus reste
vrai — garder bat vendre à tous les coups, et le débit à cinq minutes a rendu l'écart
quatre-vingt-dix fois plus grand — et il est accepté tel quel. Un clicker a le droit d'avoir
une fin de partie où l'on empile ; ce qui coûte cher, c'est de faire semblant d'en douter à
chaque relecture du plan.

Deux conséquences, qui ne sont pas des regrets mais des choses à savoir :

- **Le vivier est refusé pour de bon**, et non plus « en attente ». Il supprimait la seule
  limite qui tient encore le système — le nombre d'enclos. Cette limite est désormais la
  DERNIÈRE, et rien ne doit y toucher : c'est elle, seule, qui borne la fin de partie.
- **L'absence ne dépend plus de rien** et se traite pour elle-même. L'ordre écrit ici était
  « la rente d'abord, l'absence ensuite, parce qu'un plafond posé sur l'absence ne corrigerait
  qu'un symptôme ». Il n'y a plus de rente à traiter : le symptôme EST le sujet, et
  `OFFLINE_CAP` se règle sans rien attendre.

#### L'absence est trop généreuse, et son bandeau ne se ferme pas

Deux choses distinctes, et la seconde est un défaut simple : `#offline-note` est affiché et
**plus jamais caché** — aucun bouton, aucun écouteur. Il reste à l'écran jusqu'au rechargement.

Le fond est plus sérieux. Une absence de vingt-quatre heures (`OFFLINE_CAP`) rejoue à plein
régime la rente, la pension et l'éclosion automatique. Comme la rente est déjà perpétuelle, une
nuit vaut vingt-quatre fois une heure de jeu — et le joueur qui revient n'a rien à décider.
**Le rééquilibrage de l'absence et celui de la rente sont le même chantier**, dans cet ordre :
la rente d'abord, l'absence ensuite, parce qu'un plafond posé sur l'absence ne corrigerait
qu'un symptôme.

#### Compléter une lignée donne un bonus

Les cinq âges d'une lignée rencontrés donnent un petit bonus permanent. Ça donne
**rétroactivement une raison à tout ce qui est déjà construit** : l'encyclopédie cesse d'être
décorative, et les lignées qu'on ne croise jamais deviennent des objectifs.

Le point de vigilance est le seul qui compte : la collection TRAVERSE l'ascension. Le bonus est
donc un cliquet permanent qui ne redescend jamais — il doit être petit, et se cumuler de façon
à ce que trente lignées complètes ne rendent pas la deuxième partie triviale.

**Le charme chroma en est le bout — demandé le 21 septembre 2026.** Avoir vu les cinq âges de
TOUTES les lignées — 195 formes, merveilles comprises — double la chance de chromatique :
1/8 192 devient 1/4 096, avant le nacré, l'œil exercé et le reste, qui se multiplient par-dessus.
Deux choses à tenir :

- **ce n'est pas un trophée**, puisqu'« un trophée ne donne jamais de puissance » : c'est un
  objet, et le sac est l'endroit où il se voit ;
- **une lignée ajoutée ne le reprend pas** — proposé, à confirmer : plus rien ne redescend, et la
  collection grandit à chaque ajout de contenu.

#### Les tempéraments méritent mieux qu'un seul effet

Six caractères pour une seule statistique — la vitesse de croissance, plus la prise de taille.
Ce qui a été évoqué : **précoce** (grandit plus vite), **difficile** (exigeant sur quelque
chose), **gourmand** (mange beaucoup), **précieux** (vaut plus cher).

La contrainte qui décide de tout : **un tempérament ne se choisit pas**, il se tire à
l'éclosion. Un effet purement négatif est donc une punition pour un coup de malchance, sur une
bête qu'on a déjà payée. Chacun doit être un ÉCHANGE — gourmand grossit vite et coûte, difficile
rapporte plus mais refuse quelque chose, précieux vaut plus et pousse lentement.

C'est aussi ce qui donnerait aux tempéraments une place dans la pension, où ils n'en ont
aucune aujourd'hui.

#### Trois autres, sans discussion

- **Les raccourcis clavier** — suivante, précédente, vendre, faire monter. C'est un clicker et
  il n'y en a aucun. Attention à la zone de collage de la sauvegarde, qui ne doit pas les voir.
- **Les recettes découvertes, dans l'encyclopédie** — on croyait que ça existait, ce qui est le
  meilleur argument possible. Même règle que le reste du carnet : seulement ce qu'on a
  découvert.
- **Un marché qui fluctue** — un multiplicateur du jour par rareté, qui récompense de vendre au
  bon moment. Une seule contrainte, et elle est absolue : ça ne doit pas punir l'absent. Un
  jeu d'attente où il faut être là à la bonne heure est un piège, pas une mécanique.

#### Les douze autres, notées sans être tranchées

Filtrer l'enclos · vente en lot · un chemin tactile pour le glisser-déposer · une ligne « ce
qui bloque » · les cartes équipées visibles depuis la ferme · une courbe des gains · nommer une
bête · un tableau d'honneur des ventes · un journal des ascensions · l'œuf mystère · un effet
aux teintes · le clic maintenu.

### Quatre idées de plus

#### Le marchand de sable — l'analyse

**Ce n'est pas encore écrit — c'est le cadrage avant de l'écrire.** Le marchand est le second
évier des deux poussières (le premier est la forge), et le premier endroit qui les fasse
CIRCULER plutôt que s'accumuler. Il vit dans le bloc « La nouvelle source des cartes » ; ceci
en est l'analyse, mise à jour avec les réponses de Maxime.

**LA FORME, TRANCHÉE.** Un événement TEMPORAIRE — un rendez-vous, pas un robinet. À chaque
apparition il pose **trois échanges**, et **on ne peut en faire que deux** : le troisième reste
sur l'étal. Ce n'est PAS une affaire de prix — les trois peuvent être payables — c'est un
**plafond de deux achats par venue**, qui force à choisir lesquels laisser. Et **rien n'oblige à
acheter** : zéro, un ou deux, jamais trois. Le troisième non pris part avec le marchand ; c'est
ce qui rend le choix vif et donne une raison de revenir.

**LES CINQ MARCHANDISES**, dont trois sont tirées à chaque venue :

| Marchandise | Ce qu'elle donne |
|---|---|
| **Une carte** | une carte, rareté tirée |
| **Un paquet** | cinq cartes d'un coup |
| **Une recette** | une recette non encore connue (voir plus bas) |
| **De la poussière dorée** | de l'or, contre de la poussière bleue |
| **De la poussière bleue** | du bleu, contre de l'argent (pièces) |

**LES DEUX MONNAIES ACHÈTENT TOUT, MAIS PAS LA MÊME CHOSE — TRANCHÉ.** La poussière bleue et la
dorée peuvent chacune payer n'importe quelle marchandise ; ce qui change, c'est la QUALITÉ. Un
achat en bleu est **basique** — une carte de rareté modeste, une recette commune, un petit lot ;
le même en or vise **plus haut** — meilleure rareté, meilleure recette. La bleue coule (toute
carte fondue en donne), l'or est rare (les seuls chromatiques) : le prix en or est donc l'accès
au meilleur, le prix en bleu la consolation abondante. L'argent, lui, n'achète que de la bleue —
il n'entre dans l'étal que par le bas de l'échelle, et c'est ce qui redonne un usage aux pièces
qui ne servent plus à rien en fin de partie. **Reste à caler :** les barèmes, et jusqu'où le bleu
peut monter (peut-il, en payant très cher, atteindre ce que l'or atteint, ou y a-t-il un plafond
que seul l'or franchit ?).

**LA CADENCE, TRANCHÉE ET LIVRÉE (beta 5.4.0).** Le marchand apparaît **à l'heure réelle**, à des
moments tirés au sort, **≈ 3,5 fois par jour** (l'écart entre deux venues varie de ±50 %). L'étal
reste ouvert **un quart d'heure** ; une venue tombée pendant qu'on ne joue pas est **simplement
manquée** — un rendez-vous se manque, on n'en parle plus, la suivante est reprogrammée. L'étal se
fige dans la sauvegarde (`state.marchand` : `prochain`, `paru`, `offres`, `achats`) exactement
comme la main de la pension, pour qu'un rechargement ne rebatte pas les offres. Tout cela tourne
sur l'horloge dans `tickMarchand`, appelé par la boucle. Les barèmes sont dans `constantes.js`
(`MARCHAND`, `CHANGE_OR`, `CHANGE_BLEUE`).

**LES RECETTES DEVIENNENT UN CARNET — ET C'EST UN CHANTIER À PART, PRÉALABLE.** Une recette
(`RECETTES`) est une PAIRE de parents et le **pourcentage** qu'elle donne une créature précise à
la pension. Aujourd'hui elle est délibérément cachée : on rencontre une merveille avant de la
chercher. La demande de Maxime fait évoluer cela SANS casser le secret :

- **Une recette se DÉBLOQUE** de deux façons : en faisant NAÎTRE la créature d'un couple (le fait
  d'y arriver révèle la recette), ou en l'ACHETANT au marchand.
- **Une recette d'une créature non encore découverte se lit à moitié** : on voit les **parents**
  et les **pourcentages**, mais pas la créature au bout — juste qu'il y a quelque chose. Le
  secret tient donc toujours : on apprend le CHEMIN sans apprendre la RÉCOMPENSE. C'est
  exactement « on cache la question, pas la réponse », retourné d'un cran — ici on montre la
  question (le couple) et on cache la réponse (la bête) jusqu'à ce qu'on l'ait faite.
- **Il faut un endroit pour lire les recettes acquises** — un carnet, une vue à elle, comme
  l'encyclopédie l'est pour les formes. C'est là que vivent les couples connus et leurs
  pourcentages ; la case d'une créature non découverte y reste muette sur ce qu'elle donne.

Ce carnet — l'état des recettes connues, le déblocage à la naissance, la vue — **ne dépend de
rien** et se tient debout seul. Il doit exister AVANT que le marchand puisse en vendre une : on
ne vend pas une entrée d'un carnet qui n'existe pas. *Note :* « recettes de différentes rareté »
demandera plus que les deux paires actuelles (qui ne donnent que des merveilleuses) — soit
d'autres recettes, soit une rareté lue sur la valeur du couple. À préciser quand le carnet
s'écrit.

**CE DONT LE RESTE DÉPEND.** Les **cartes et le paquet attendent les boosters** : « tirer une
carte » (quelle rareté, quelles stats) est la primitive que ce chantier doit poser ; le marchand
la consomme, il ne la définit pas. Un paquet, c'est cinq tirages ou un booster ouvert — à décider
là-bas. En revanche les **deux conversions de poussière ne dépendent de rien** : un premier
marchand « changeur » (argent → bleue, bleue → or) est livrable avant les boosters comme avant le
carnet, et il suffit déjà à faire circuler les deux poussières.

**CE QUI EXISTE DÉJÀ, ET SUR QUOI S'APPUYER.** Les deux poussières (`poussiere`, `poussiereOr`)
et l'argent (`coins`) sont là. Le tirage-figé-en-sauvegarde existe (la main de la pension). La
grille des primes (cinq à la fois, ce qui est pris se relit) donne un modèle d'écran. Et le
carnet des recettes est le frère de l'encyclopédie, qui sait déjà présenter une collection dont
certaines cases sont vides.

**L'ORDRE DE LIVRAISON QUE L'ANALYSE DESSINE :**

1. ~~**Le carnet des recettes**~~ — **livré en `beta 5.2.0`.**
2. ~~**Le changeur**~~ — **livré en `beta 5.4.0`.** Le marchand paraît (pastille dorée, minuteur,
   étal de trois offres, deux prises), et vend les deux conversions de poussière. C'est aussi son
   ossature entière — apparition, cadence, sauvegarde, plafond d'achats — sur laquelle les
   marchandises suivantes viendront se brancher comme offres de plus.
3. ~~**Les boosters**~~ — **livré en `beta 5.6.0`.** La primitive « tirer une carte »
   (`carteBooster`, `tirerRarete`, `tirerUnPaquet`) fabrique une capsule neuve — jeune, une étoile,
   motif et teinte au hasard, peut-être chromatique — de la même forme qu'une carte de fusion, et
   la pose dans l'album.
4. ~~**Le marchand complet**~~ — **livré en `beta 5.6.0`.** Les cinq marchandises sont là : le
   changeur (2), plus la **carte seule**, le **paquet** (cinq cartes, une rare+ garantie, god pack
   ≈ 1/500 sur un paquet doré) et la **recette** (une inconnue au hasard, jamais deux fois la même
   sur un étal, apprise à l'achat). La monnaie décide de la qualité : bleu basique, or premium.
   *Reste ouvert :* la rareté d'une recette une fois le carnet élargi (toutes donnent une merveille
   aujourd'hui, donc toutes coûtent le tarif merveille), et l'équilibrage des prix (dans `constantes.js`).

**LES BARÈMES CALÉS (avec Maxime), en attente des boosters :**

- **Chromatisme d'une carte achetée** : **1 %** sur une carte, **2 %** en god pack (le sauvage est
  1/8192, trop rare pour un produit qu'on paie).
- **Rareté dans un paquet** (5 cartes, 1 rare+ garantie) — paquet bleu : commune 70 %, rare 25 %,
  épique 4,5 %, mythique 0,5 % ; paquet or : commune 20 %, rare 40 %, épique 30 %, mythique 9 %,
  merveilleuse 1 %.
- **God pack** : ≈ **1/500** paquets or, cinq cartes épique+, merveilleuse possible — la merveille
  ne s'achète pas *en créature* (ça reste la pension), mais une **carte** merveilleuse au god pack
  est assumée.
- **Recettes par rareté**, prix = barème de la poussière (×1 / 3 / 10 / 30 / 90), fréquence
  décroissante ; **aléatoire à 20** (bon marché, mais on ne choisit pas ce qu'on tire).
- **Changeur (livré)** : bleue → or ≈ **20 000 : 1** (± variance) ; argent → bleue coûte une **part
  de la bourse du joueur** au moment de la venue (~un tiers, ± variance, avec un plancher) — un prix
  fixe deviendrait dérisoire dès que la fortune monte, et le change doit coûter quelque chose qu'on
  a farmé. Montants tirés au sort à chaque venue, comme un marché qui bouge.

#### La tour de combat — le second mode de jeu

**Elle a vécu ici sans être dans aucune table pendant tout ce temps**, et c'est le plus gros
morceau à qui ce soit arrivé : un SECOND MODE DE JEU, invisible dans la seule table qui dit ce
qui vient. Elle y est maintenant, dans un bloc à elle. Le reste de cette section est l'analyse ;
la table dit seulement qu'elle existe et ce qu'elle attend.

Une tour qu'on monte le plus haut possible. Chaque étage est plus dur que le précédent. **Un
minuteur.** On choisit **UN seul combattant** au départ, on commence avec **zéro boost**, et
tout le jeu tient dans le CHOIX DES BOOSTS, qui n'existent que dans la tour. L'ascension en
donne ; **la ferme ne donne rien.**

**« LA FERME NE DONNE RIEN » EST LA DÉCISION QUI PORTE TOUT LE RESTE**, et c'est aussi la plus
difficile à tenir quand viendra l'équilibrage. Sans elle, la tour n'est pas un jeu : c'est un
tableau d'affichage où gagne celui qui a la plus grosse mythique, et la montée ne décide de
rien. Avec elle, la tour est une partie neuve à chaque fois — ce que la ferme n'est plus après
le premier cycle.

**LA LIGNE N'EST PAS ENTRE LA BÊTE ET LA FERME, ELLE EST ENTRE CE QU'ON EST ET CE QU'ON A
ACCUMULÉ.** La rareté de la bête et ses statistiques comptent dans ses dégâts. En revanche
**aucune amélioration de la ferme n'entre dans la tour** : ni la force du clic, ni les
auto-clics, ni les automates. C'est la formulation juste, et elle est meilleure que « la ferme
ne donne rien » : une bête est ce qu'on a ÉLEVÉ, une boutique est ce qu'on a EMPILÉ. La
première mérite d'être emmenée, la seconde non — sinon la tour se gagne au portefeuille.

**LES STATISTIQUES SONT « À INVENTER », MAIS LA MOITIÉ EXISTE DÉJÀ**, et c'est une trouvaille :
deux motifs de carte parlent DÉJÀ en termes de combat. Le **martelé** augmente ce que vaut un
clic — c'est la frappe. L'**ocellé** clique tout seul — c'est la cadence. Les six tempéraments
(docile, nerveux, placide, glouton, farouche, rêveur) portent déjà `grow` et `fat` ; il leur
manque un troisième champ, pas une table neuve. Le chantier « tempéraments à second effet »,
déjà au plan, devient donc **le socle des statistiques de combat** au lieu d'une idée isolée.

Reste à trancher ce que la rareté vaut : le multiplicateur de valeur va de ×1 à ×15 000, ce qui
est un écart impossible à porter tel quel dans un combat. Il faudra une échelle À PART — le
rang (0 à 4), pas le multiplicateur.

**LES BOOSTS SONT DES FAVEURS À L'ENVERS, et il ne faut surtout pas leur donner les mêmes
nombres.** La forme existe déjà — un tirage, on en prend un, ça recommence : l'écran des
faveurs peut servir tel quel. Mais les faveurs sont FAIBLES ET RÉPÉTABLES par construction, et
c'est écrit noir sur blanc dans leur section : « cinq pour cent ne se sent pas ; c'est la
soixantième qui se sent ». Un boost de tour doit être l'inverse — **fort, définissant, et rare
sur une montée qui dure quelques minutes**. Même écran, réglage opposé. Copier les valeurs des
faveurs ferait une tour où rien ne se sent.

**LE MINUTEUR EST CE QUI DONNE UN PRIX AU BOOST.** Sans lui, on prend toujours le plus puissant
et on monte lentement ; avec lui, la vitesse devient une monnaie et « +40 % de dégâts » se
compare enfin à « chaque étage prend cinq secondes de moins ». Reste à trancher : un minuteur
pour toute la montée, ou un par étage. Le premier fait une course, le second fait une pression
constante.

**LES BOOSTS D'ASCENSION SONT UNE BRANCHE DE PLUS DANS LA CONSTELLATION**, et cela règle d'un
coup le danger que j'avais soulevé : ce n'est pas un TROISIÈME évier pour les jetons, c'est un
septième axe du second. Rien à recalculer, l'arbitrage reste entre les cartes et l'arbre — la
tour entre simplement en concurrence avec les six autres directions, ce qui est exactement le
genre de décision que l'arbre est fait pour porter.

Deux conséquences concrètes, à ne pas découvrir en codant :

- **La géométrie de l'écran change.** Six axes tiennent à 60° l'un de l'autre ; sept demandent
  51,4°, donc un recalcul des angles dans `AXES` et un semis d'étoiles qui reste lisible entre
  des branches plus serrées.
- **Le budget de l'arbre monte d'un sixième.** Vingt-cinq nœuds coûtent 358 jetons pour un
  débit de deux à quatre par ascension ; quatre nœuds de plus ne cassent rien, mais la section
  du dimensionnement doit être refaite avec le nouveau total.

**ET LA BÊTE PEUT RESSORTIR DE LA TOUR AVEC DES BOOSTS**, en cas de bonne performance — à
imaginer. C'est le seul chemin de retour vers la ferme, et il est bien orienté : ce n'est pas
la ferme qui alimente la tour, c'est la tour qui récompense la bête. Une carte gagnée à l'étage
trente vaut alors quelque chose qu'aucun élevage ne donne.

**CE QU'EST « COMBATTRE » ICI, ET IL FAUT LE DIRE TÔT** : le jeu n'a aucun système de combat et
n'a pas besoin d'en avoir un. Un étage peut être un SEUIL — un nombre à dépasser dans le temps
imparti — et la tour reste alors un jeu de clic et de choix, ce qu'elle doit être. Écrire un
vrai combat, c'est écrire un second jeu.

**ET C'EST LA TOUR QUI RÉVEILLE L'HYDRE.** La question laissée ouverte plus bas — d'où vient la
blessure, dans un jeu sans combat — trouve ici sa réponse : la tour EST l'endroit où l'on prend
des coups. L'hydre n'est donc pas une lignée de plus, c'est la bête du second mode, et les deux
idées se tiennent debout ensemble ou pas du tout.

#### Les statistiques — la bête devient un individu

**Deux couches, et c'est la seconde qui fait le jeu.** Chaque famille porte ses statistiques de
base — attaque, défense, vie, vitesse : tous les béhémoths se ressemblent. Par-dessus, un
système d'INDIVIDUALITÉ, à la manière des IV : chaque bête a les siennes. Le but devient la
créature parfaite.

**ET ÇA DONNE ENFIN SA RAISON D'ÊTRE À LA PENSION.** Le plan écrit noir sur blanc que la
pension est « toujours perdante en argent » et qu'elle ne sert qu'à viser une lignée. Avec les
statistiques individuelles, elle devient le seul endroit où l'on SÉLECTIONNE. La règle
proposée : l'enfant hérite de statistiques proches de celles des parents, un peu meilleures —
**40 % moins bien, 60 % mieux**.

Le chantier « l'hérédité », déjà au plan, et celui-ci **sont le même chantier**. Il faut les
fusionner : transmettre teinte, tempérament et motif, c'est le même mécanisme que transmettre
quatre nombres, et l'écrire deux fois donnerait deux règles d'héritage qui divergeront.

> **UN CLIQUET SANS BUTÉE MONTE POUR TOUJOURS.** 60 % de chances de faire mieux à chaque
> génération, c'est une dérive positive garantie : la statistique moyenne monte de 0,2 cran par
> ponte, indéfiniment. Il faut un PLAFOND par statistique — et mieux qu'un plafond sec, un
> progrès qui se resserre en approchant : les derniers crans doivent coûter des dizaines de
> pontes, sinon la créature parfaite s'obtient en une soirée et le jeu s'arrête. C'est
> exactement la faute qui a fait de la pension une imprimante à billets, et elle a été mesurée
> avant d'être corrigée. **À chiffrer avant d'écrire une ligne.**

**CENT VINGT NOMBRES À INVENTER — OU HUIT RÈGLES.** Trente lignées × quatre statistiques, c'est
un travail d'auteur ingrat et une table que personne ne saura rééquilibrer. Or `ETIQUETTES`
donne déjà à chaque lignée un couple **milieu / peau** :

    terre eau ciel                    nu · poil · plume · écaille · carapace · pierre

Une écaille défend, une carapace défend plus et ralentit, une plume est rapide et fragile, la
pierre encaisse tout et ne bouge pas. **La peau distribue, le milieu module, et le rang donne
le budget total** — quatre stats déduites de deux étiquettes et d'un rang, au lieu de cent
vingt valeurs à la main. La table reste modifiable au cas par cas pour les exceptions.

**Le rang, pas le multiplicateur** : la rareté vaut de ×1 à ×15 000 en valeur marchande, ce qui
ne peut pas porter un combat. C'est le rang (0 à 4) qui donne le budget.

**Ce que ça coûte en sauvegarde** : quatre nombres de plus par bête ET par carte d'album, donc
une migration. Les bêtes existantes n'ont pas d'individualité — il faudra décider si elles en
reçoivent une au hasard (elles deviennent jouables mais moyennes) ou une parfaite (cadeau
d'ancienneté). La première, par cohérence avec toutes les migrations de ce fichier.

**Où les stats se montrent, et où elles ne se montrent pas.** Quatre nombres par bête sur un
écran qu'on vient d'alléger, c'est le chemin le plus court pour le réencombrer. Elles n'ont
leur place qu'à deux endroits : **la tour**, où elles décident, et **l'écran de la pension**, où
l'on compare deux parents. Nulle part ailleurs — surtout pas sur la vignette.

**La constellation peut aussi en vendre**, ce qui lui donne un contenu naturel pour son
septième axe, celui de la tour.

#### L'hydre de Lerne — la première bête qui grandit par le mal qu'on lui fait

**Merveille, et le rang se décide sur la mécanique.** J'avais recommandé mythique pour soulager
le goulot des parents de recette — l'ouroboros est dans deux recettes sur trois. L'argument
tombe : le rang mythique se tire à l'œuf, donc une lignée mythique n'a pas de mécanique à elle.
Le rang secret, lui, est le seul endroit du jeu où une lignée peut avoir sa propre règle. Une
bête qui se joue autrement n'a rien à faire ailleurs.

**LE CONCEPT : ELLE GRANDIT PAR LES BLESSURES.** Plus elle est blessée, plus elle « évolue » et
gagne ses têtes, comme dans la légende. C'est la première inversion de la boucle du jeu, et
c'est ce qui la justifie : partout ailleurs une bête grandit parce qu'on s'en occupe.

**D'où vient la blessure — c'est la seule question qui compte, et elle n'est pas tranchée.**
Le jeu n'a aucun combat, donc rien qui blesse aujourd'hui. Trois sources possibles, par ordre
de force :

- **Ce que tu perds ailleurs.** Une bête vendue, une bête abandonnée à l'ascension — l'écran
  d'ascension dit déjà « les N autres sont perdues ». Une créature qui se nourrit de ces
  pertes-là est un vrai renversement : le pire moment du jeu devient le meilleur pour elle.
- **Le clic lui-même, retourné.** Le même geste qui nourrit toutes les autres la frappe. Rien
  de neuf à brancher, mais mécaniquement identique à la croissance ordinaire : ça ne raconte
  que par le texte, et le texte ne suffit pas.
- **L'impasse et la plonge.** Le fond du trou du jeu la nourrit. Joli, mais trop rare pour
  porter une lignée.

La première est la bonne, et elle a l'avantage d'exister déjà : il y a un endroit du code où
des bêtes disparaissent.

**IL LUI FAUT UN CONTRE-FEU.** Héraclès ne l'a pas tuée en coupant — il a cautérisé. Une bête
qui ne fait que monter sans qu'on puisse arrêter le compte est une bête qu'on ne décide jamais
de vendre. Le geste qui FIGE la repousse est la moitié de la mécanique, pas un détail : sans
lui, l'hydre est une rente de plus.

**LA COLLISION AVEC LA KITSUNE SE DISSOUT**, et c'est un bon signe. Les deux comptent des
appendices avec l'âge, mais les queues de la kitsune sont une HORLOGE — une par siècle — et les
têtes de l'hydre sont un COMPTE DE CICATRICES. La forme est la même, la cause se lit, et c'est
la cause qu'on retient.

**Le risque technique, à savoir avant de s'y mettre** : ce serait la première lignée dont la
progression ne passe pas par le chemin commun. `advance`, `estMur`, `evolve` et `autoRate`
supposent tous un seul modèle de croissance — le temps et le clic vers un plafond. Une bête qui
monte sur un autre compteur les traverse tous. **À écrire après le chantier de la rente**, qui
touche déjà la vente, c'est-à-dire la source de blessure retenue.

Le couple `ETIQUETTES` va de soi : `['eau', 'écaille']`, comme la tarasque — le marais de Lerne.

#### Mimi et Mila — les deux merveilles qui ne sont pas des dieux

**Mimi**, la chatte noire aux yeux verts. **Mila**, la carline. Pas des divinités : deux
animaux réels, ceux qui donnent beaucoup d'amour à leur propriétaire.

**Elles renversent ce que le rang veut dire, et c'est tout leur intérêt.** Les trois merveilles
écrites — kitsune, wukong, tarasque — sont mythologiques, et Yggdrasil le serait aussi. Le rang
secret signifie donc aujourd'hui « le divin ». Avec ces deux-là il signifie **« ce à quoi on
tient »**, ce qui est plus juste pour un jeu dont le sujet est d'élever une bête et de s'y
attacher. Un jeu où l'on hésite à vendre place très bien un chat au sommet de sa table.

**La charte les traite en idoles, exactement comme les autres, et il ne faut pas reculer
là-dessus.** Le registre « idole » — celui de l'Ouroboros, né en 2.7.1 quand l'Ouroboros mignon
a été rejeté — appliqué à un carlin, c'est là qu'est la force de l'idée. Un carlin dessiné en
mascotte serait une commune de plus ; un carlin dessiné en idole dit ce que le joueur ressent
vraiment. **Aucune concession de style**, sinon les deux ne sont qu'une blague.

**Les cinq âges d'un animal réel sont sa vie**, et c'est la lignée la plus facile à écrire de
toutes : chaton, jeune chat, chat, vieux chat, et le cinquième — celui qui doit être stylé.
C'est le seul endroit où le cinquième âge n'est pas une montée en puissance mais une montée en
présence, et il faut le décider avant de dessiner.

**Deux choses restent ouvertes :**

- **La recette.** `chat` existe déjà (rare) et `loup` est le plus proche d'un chien ; aucune
  lignée n'est un carlin. Croiser deux bêtes pour obtenir SON animal se raconte mal — c'est la
  même gêne qu'Yggdrasil, pour une raison différente. La sortie propre est peut-être qu'elles
  n'aient pas de recette du tout, comme la tarasque : on ne les cherche pas, elles arrivent.
  Ce serait d'ailleurs le bon sens de la chose.
- **Le nom propre.** Toutes les lignées portent un nom d'espèce ; « Mimi » et « Mila » sont des
  noms de personne. Le précédent existe — `wukong` s'appelle « Sun Wukong » — mais ici c'est
  systématique, et l'épithète du jeu viendrait se coller derrière : « Mimi la farouche ». À
  vérifier contre le scénario `noms`, qui interdit déjà qu'une forme reprenne un nom d'âge ou
  de taille.

Ce qu'il faut pour chacune : cinq formes dans `LINES`, une entrée `ETIQUETTES` (le couple
milieu/peau), une entrée dans la table `ART`, cinq dessins, et une recette — ou l'absence
assumée d'une recette.

#### L'état idle et le combo — deux forces qui tirent en sens contraire

Les deux tiennent dans la même section parce qu'ils sont **le même réglage vu des deux bouts** :
l'un paie l'absence, l'autre paie la présence intense. Les traiter séparément, c'est se
condamner à les rééquilibrer l'un contre l'autre à chaque passe.

**L'absence est DÉJÀ trop payante**, et le plan le dit ailleurs. Un « état idle » qui donnerait
un bonus de plus pour ne pas être là aggraverait exactement ce qu'il faut corriger. Donc :

> **L'idle ne doit pas être un bonus d'absence. Il doit changer CE QUE la ferme fait, pas
> COMBIEN elle rend.**

Une piste qui respecte ça : au bout de quelques minutes sans clic, la ferme passe en régime
lent — elle cesse de vendre, ou elle ne fait plus que couver, ou elle accumule au lieu de
produire. Le retour du joueur déclenche alors une *reprise* qui vaut le coup d'être regardée.
Le gain ne vient pas de l'absence, il vient du geste qui la termine.

**Le combo est le partenaire naturel d'une chose déjà livrée** : depuis la `beta 3.1.0`, cliquer
une bête au niveau et à l'engraissement maximum paie. Ce clic-là n'a pour l'instant aucun
plafond à viser. Un combo — des clics rapprochés qui montent un multiplicateur, et qui retombe
dès qu'on s'arrête — lui en donne un.

**Le piège du combo, et il est sérieux** : un multiplicateur qui récompense la cadence
récompense aussi les macros, et il fait mal aux mains. La frénésie existante contourne déjà ça
en donnant une *fenêtre* plutôt qu'une *cadence*. Le combo doit se monter en quelques clics et
se tenir plusieurs secondes, jamais demander dix clics par seconde pendant une minute.

À traiter **avec** la refonte du bonheur et de la frénésie, jamais avant.

#### Voir les automates, et les couper vite

**Le besoin est réel et il vient d'un vrai désagrément** : le marchand vend ce qu'on voulait
garder, l'acheteur vide la bourse au mauvais moment, et la seule façon de les arrêter est
d'aller changer une consigne dans un panneau replié.

**Ce n'est pas un réglage de plus, c'est un raccourci vers un réglage existant.** La distinction
compte : ajouter un troisième endroit où l'acheteur se règle créerait deux vérités. Le
bandeau doit lire l'état des consignes et le basculer, jamais tenir son propre état.

Ce qu'il montre, dans une bande compacte, en pictogrammes et sans phrase :

| | ce qu'on coupe |
|---|---|
| l'acheteur | il cesse d'acheter des œufs |
| le marchand | il cesse de vendre |
| l'évolution | elle cesse de faire monter les raretés |
| l'auto-clic | la main de la carte ocellée s'arrête |

**Une contrainte de forme** : la consigne de l'écran doit rester la commande fine — « vends à
partir de l'âge légende, les rares seulement ». Le bandeau est un interrupteur général, et un
interrupteur général qui perd le réglage fin en le coupant serait pire que rien. Couper puis
rallumer doit **retrouver la consigne exacte**, ce qui veut dire la garder de côté et non
l'écraser.

#### La taille des menus, et qu'elle se retienne

> **La demande s'élargit le 21 septembre 2026 : moduler l'interface (presque) comme on veut.** La
> densité et l'ordre ci-dessous en restent le cœur. Le « presque » est ce que ce fichier a déjà
> écrit : la scène reste la plus grande chose de la page, et un ordre qui change le DOM entre
> dans la signature. Reste à dire avec Maxime ce que « comme on veut » ajoute — masquer un
> panneau, le changer de colonne ?

Le pliage existe déjà et il se sauve — `state.plie`, un booléen par panneau. Ce qui manque, ce
sont **les panneaux qu'on ne peut pas replier parce qu'on s'en sert, mais qui prennent trop de
place**.

**Le tirer-pour-redimensionner n'est pas la bonne réponse**, et il vaut mieux l'écrire tout de
suite : sur une colonne de panneaux empilés, une poignée de redimensionnement se bat contre le
défilement, demande un état par panneau en pixels, et casse au premier changement de fenêtre.
Ce qu'on ressent n'est pas « ce panneau fait trente pixels de trop », c'est « ce panneau me
prend de la place pour des choses que je ne regarde pas ».

**Deux réglages valent mieux qu'une poignée**, tous deux rangés à côté de `plie` :

- **Une densité par panneau** — normal ou compact. Compact retire les libellés secondaires et
  resserre les lignes ; le panneau reste utilisable, il tient en deux fois moins de haut.
- **L'ordre des panneaux** — glisser un panneau pour le remonter. C'est ça, la vraie demande de
  « gérer les menus » : mettre en haut ce qu'on regarde, et non rétrécir ce qu'on ignore.

**Ce qu'il faut se rappeler avant de coder l'un ou l'autre** : les panneaux se redessinent à dix
images par seconde derrière une signature. Un ordre qui change l'ordre du DOM doit entrer dans
la signature, sinon il se perdra au premier rafraîchissement — c'est la même leçon que
`renderStrip`, et elle se relit avant tout écran neuf.

### Deux pièges de migration à ne pas oublier

Les nouvelles teintes s'ajoutent **à la fin** de `TINTS`. Une bête stocke sa teinte par
indice ; en insérer une au milieu repeindrait tout le bestiaire déjà éclos.

La réserve d'œufs devait prendre son plafond **avant** la pension, et elle l'a pris : cinquante
par sorte, posés dans la même version. C'était le seul frein du hors-ligne, et une partie qui
aurait déjà tourné sans lui serait rentrée sur des centaines d'œufs le jour de l'ajout. Le
piège reste écrit ici parce qu'il vaut pour tout robinet futur : **le plafond se pose avec le
robinet, jamais après.**

---

## L'outillage

Le projet n'ouvre jamais de navigateur. Tout ce qui n'est pas lu à l'œil passe par le banc
d'essai, qui a longtemps vécu dans un dossier temporaire et se refabriquait de mémoire à
chaque session. Il est dans le dépôt depuis la revue de structure.

```
node tools/test.js              les 159 scénarios, 2275 vérifications
node tools/test.js bonheur      seulement ceux dont le nom contient « bonheur »
```

- **`tools/banc.js`** fait tourner `game.js` sous Node : un DOM minimal, les identifiants lus
  dans `index.html`, et **tout ce que `game.js` déclare au premier niveau exposé
  automatiquement**. La liste d'exports était écrite à la main et se périmait à chaque
  fonction ajoutée — un test échouait alors pour une raison qui ressemblait à un bug du jeu.
- **`tools/planche.html`** est la planche : le vrai `style.css`, le balisage du jeu écrit à la
  main, aucun script de jeu. C'est le seul outil du dépôt qui se REGARDE au lieu de se lire, et
  la seule réponse à la dette du rendu — cinq des six marches de l'écran sont du CSS, et on ne
  corrige pas du CSS qu'on ne peut pas voir. Son risque est la dérive : `node tools/planche.js`
  relève les classes que le jeu pose et liste celles qu'elle ne montre jamais. Au premier
  relevé, 109 montrées sur 266 — les écrans entiers manquent (ascension, forge, encyclopédie,
  constellation), les composants de la ferme y sont.
- **`tools/atelier.html`**, écrite par `node tools/atelier.js`, montre les BÊTES là où la
  planche montre les composants : une lignée au choix dans ses trente-six couleurs, ses cinq
  âges, ses huit fonds et ses six tailles, chacune doublée d'une vignette de 24 px. Elle est
  GÉNÉRÉE, et c'est l'inverse de la planche à dessein : la planche montre du balisage, qu'il
  faut pouvoir comparer à ce que le jeu produit ; l'atelier montre des données, et les recopier
  à la main serait garantir qu'elles dérivent au premier ajout — un tableau de couleurs périmé
  ressemble à un tableau de couleurs.
- **`tools/test.js`** est le lanceur, et **`tools/tests/`** porte les scénarios — un fichier par
  sujet, plus `_aides.js` pour le compteur du verdict et les gestes que douze fichiers refont.
  Ils ont été écrits au fil des versions, chacun le jour où quelque chose s'est cassé : ils
  visent des endroits précis plutôt que de couvrir uniformément. Le découpage n'est pas du
  rangement : les six mille lignes d'un seul fichier avaient fini par contenir **cent
  cinquante-deux lignes recopiées mot pour mot** — quatre scénarios et une aide, écrits deux
  fois, qui passaient deux fois et ne prouvaient rien de plus. Les titres de section, eux,
  avaient dérivé : « la poussière et la forge » annonçait un scénario de clic, et les vrais
  scénarios de forge vivaient sous « la constellation ». Un nom de fichier ne dérive pas.
- **`tools/depot.js`** dit où sont les fichiers, et **`tools/lignees.js`** donne la table des
  lignées et la règle qui fait un nom de fichier à partir d'un nom de forme. Les deux existent
  pour la même raison : la racine du dépôt se calculait de quatre façons, dont une qui ne
  marchait que si l'on lançait l'outil depuis le bon dossier, et la règle des suffixes était
  écrite deux fois — dans `grilles.js` et dans `prompt.js`, avec son commentaire. Deux outils
  qui fabriquent le MÊME nom de fichier par deux chemins finissent par ne plus le fabriquer
  pareil, et c'est la table `ART` qui l'apprend en cherchant une image absente.

**Ce qu'ils ne prouvent pas : rien de visuel.** Le DOM du banc ne met rien en page. Un panneau
superposé, un texte illisible, une couleur ratée passent tous les tests. C'est la première
dette du projet, et elle ne se réglera pas ici.

Les autres outils servent aux dessins. **La chaîne vivante** : `prompt.js` fabrique les fiches
de `prompts/`, `decouper.py` découpe une planche source en cinq PNG, `pixel.js` et `grilles.js`
transforment un fichier de grille en caractères en SVG, et `oeufs.js` est le seul générateur
de grille calculée — les cinq œufs.

**Les restes**, gardés sans être entretenus : `rendu.js`, `formes-*.js`, `styles.js`,
`pixels.js`, `pixel.py`, `quantifier.js` et `rythme.js` viennent d'explorations de formes
procédurales abandonnées au profit des PNG. Ils ne sont branchés sur rien.

---

## Le vivier — idées non tranchées

Rien de tout ça n'est décidé : c'est un stock de candidats, pas une file d'attente. Le
raisonnement complet est dans la note [Ce qui manque à
Éclosion](https://claude.ai/code/artifact/5b0057d3-2083-44dc-933c-b9da51b648cd) ; ce qui suit
est ce qu'il faut avoir en tête pour choisir.

| L'idée | Ce que ça règle | Coût |
|---|---|---|
| **Filtre de l'enclos par trait** | on chasse un motif que le jeu ne permet pas de chercher | une soirée |
| **Événements courts** | l'éclosion ne surprend plus | deux soirées |
| **Interface au pouce** | un clicker se joue au téléphone, pas au bureau | un week-end |

La 2.24.0 a réglé la moitié « écran bas » du problème — pliage des panneaux et deux ruptures en
hauteur — mais **rien de ce qui touche au doigt** : c'est le chantier de
[l'écran et du doigt](#lautre-chantier-de-fond--lécran-et-le-doigt), plus haut. Il vivait dans
un `REFONTE.md` séparé, jamais versionné ; il est remonté ici parce que deux mémoires longues
finissent toujours par diverger — celle-là l'avait déjà fait.

**Les fonds sont sortis du vivier** : livrés en `beta 1.13.0`, et le [changelog](CHANGELOG.md#les-fonds--faits-en-beta-1130) dit
comment. Ce qui reste ouvert n'est plus le fond lui-même mais **comment on l'obtient** — au
hasard à la pension, et transmis par les parents.

**Les compteurs sont sortis du vivier** : livrés en 2.19.0, sous le bouton `📊`.

**L'export / import est sorti du vivier** : livré en 2.17.0. La partie se télécharge en
fichier ou se copie en texte, et se relit dans l'autre sens — avec un résumé de ce que le
fichier contient affiché *avant* d'écraser quoi que ce soit, parce que le vrai risque de la
restauration n'est pas de rater le geste, c'est de restaurer le mauvais fichier.

**La frénésie de clic est sortie du vivier** : livrée en 2.16.0, sous une forme plus douce que
prévu. Elle ne s'achète pas et ne se déclenche pas — une bête qu'on garde en scène l'offre
d'elle-même, tous les quatre à cinq cents secondes de présence, et ne double que le clic. Neuf
pour cent du temps à ×2, mesuré : c'est un cadeau, pas une amélioration.

### Le diagnostic en trois phrases

**Le jeu se souvient, et il attend quelque chose.** Dix-huit compteurs cumulés sur la vie du
fichier depuis la 2.19.0, et douze trophées accrochés dessus depuis la 2.25.0 — six objectifs
nommés, six surprises. Le diagnostic « un nombre qui monte sans que rien ne l'attende reste un
nombre » est réglé.

**Il a de nouveau des objectifs nommés**, depuis la 2.25.0 : six trophées visibles disent où
va le jeu. Les douze jalons d'origine, eux, restent écrits et inutilisés — ils ne reviendront
pas tels quels, puisqu'un trophée ne doit jamais donner de puissance.

**Être présent paie un peu, depuis peu.** Le chromatique à 1/8 192 et la montée à 1/1 000 sont
deux décisions justes qui se sont additionnées la même semaine, et les deux surprises de
l'éclosion sont parties ensemble. Le bonheur de la 2.16.0 rend quelque chose à la présence,
mais il récompense de rester *devant une bête*, pas d'ouvrir la page : la surprise de
l'éclosion, elle, n'a toujours rien qui la remplace.

### Trois règles à ne pas perdre en chemin

**Un trophée ne donne jamais de puissance.** Une prime en pièces à la rigueur, jamais un
multiplicateur : un trophée qui pèse sur l'équilibrage redevient un jalon déguisé, et c'est
exactement ce qu'on vient de démêler en passant aux jetons.

**Un événement ne donne jamais ce qui se chasse.** Ni chromatique offert, ni montée de rareté,
ni carte d'album — seulement des pièces, du temps ou de la rente. Sans cette règle, on refait
ce qu'on vient de défaire en portant le prodige à 1/8 192. Et il ne doit rien coûter à qui
n'est pas là : un événement manqué qui pénalise transforme un idle en corvée d'assiduité.

**Les compteurs sont cumulés sur la vie du fichier, pas sur la partie.** Sinon l'ascension les
efface, et le seul endroit qui garde la mémoire du joueur devient le seul qui l'oublie.

### Ce qu'on a décidé de ne pas faire

- **Mettre la merveilleuse en boutique.** Elle tient toute sa valeur du fait qu'elle ne
  s'achète pas, et c'est vérifié des deux côtés depuis la 3.1.0 : aucun œuf vendu ne la cote,
  et `buyEgg` refuse ce qui n'a pas de prix.
- ~~**Lui donner plus de valeur qu'une mythique.**~~ **Renversé en `beta 4.27.0`** : elle vaut
  un cran de plus, et ses péages montent du même cran. Sa marge reste celle d'une mythique, donc
  la pension ne redevient pas une stratégie d'argent — c'était la seule raison du refus.
- **Réserver la merveille à sa recette une fois qu'on en a une.** Elle se reproduit comme le
  reste — Wukong × golem rend 5 % de Wukong. La seconde est plus facile que la première, et
  c'est la bonne asymétrie : ça donne une raison de garder une merveille plutôt que de la
  vendre.
- ~~**De nouvelles lignées au-delà des vingt-sept.**~~ **Renversé en `beta 5.3.0`** : huit de
  plus, trente-neuf en tout. L'argument tient toujours pour les dessins — vingt-six lignées n'en
  ont pas.
- **Un deuxième axe de prestige.** L'argument d'origine — le premier cycle n'a pas encore été
  rejoué après une ascension — est tombé : elle donne envie de recommencer, c'est vérifié. Il
  reste écarté pour la seule raison qui vaille encore : rien ne le demande.
- **Remonter les taux pour compenser.** Si l'éclosion paraît plate, la réponse est la couche
  d'événements, pas un retour en arrière qui redonnerait aux surprises leur banalité.
- **Rendre la rente non perpétuelle.** Coût d'entretien, tarissement, plafond par enclos : les
  trois pistes sont écrites plus haut et aucune ne sera prise. Garder une bête restera le
  meilleur coup à tous les coups, et le nombre d'enclos restera la seule limite de la fin de
  partie — donc la seule chose à laquelle on ne touche pas. Le vivier tombe avec.
- **Optimiser la vitesse du jeu.** Mesuré sur une ferme de vingt-quatre enclos et huit
  incubateurs : une image complète coûte 404 µs, soit **0,40 % d'un cœur** à dix images par
  seconde. `refresh` en prend 158, `advance` 28, `runAutomations` 7 — et `renderStrip` 0,7,
  parce que sa signature court-circuite déjà le redessin. Il n'y a rien à gagner et une
  régression à risquer par ligne déplacée. Ce qui coûte dans ce fichier n'est pas le temps
  machine, c'est **la duplication qui dérive** : voir « Une porte par règle ».
- ~~**Découper `game.js` en modules.**~~ **Renversé le 19 septembre 2026** : le fichier dépasse
  dix mille lignes. On découpe petit à petit, zone par zone, sans modules ni build —
  `constantes.js` depuis la `5.3.5`.

---

## Le plan des jalons — ce que le jeu sera

Les estimations sont en **jours de travail concentré**, pas en jours calendaires.

| Jalon | Ce qu'il apporte | Estimation | État |
|---|---|---|---|
| **0** | Prototype de sensation : un fichier, tout en mémoire, aucun compte | 1–2 j | **livré, et très dépassé** |
| **1** | La boucle réelle : comptes, base de données, serveur faisant autorité | 8–12 j | pas commencé |
| **2** | L'idle : incubateurs, calcul à la lecture, progression hors ligne | 4–6 j | fait côté navigateur |
| **3** | Les automatisations, une par une | 4–6 j | fait côté navigateur |
| **4** | Reproduction et gènes | 8–12 j | la pension le prépare |
| **5** | Marché entre joueurs | 10–15 j | pas commencé |

**Total : 35 à 55 jours**, plus 3 à 5 pour les évolutions ajoutées en cours de route. La
plupart des projets de ce type meurent au jalon 4, quand la nouveauté est passée et qu'il
reste le gros du travail.

Le jalon 1 est **le seul qui n'a pas commencé du tout**, et c'est celui qui décide de tout le
reste : comptes, base de données, serveur qui fait autorité. Tout tourne encore dans le
navigateur, dans un fichier qu'on a décidé de jeter.

### Les décisions structurantes

Elles ont été prises une fois, elles engagent tout le reste.

**Le serveur ne fait jamais tourner de boucle.** On stocke une date de début sur chaque chose
en cours, et on calcule ce qui s'est passé quand le joueur revient. Rien ne tourne tant que
personne ne regarde, et la progression hors ligne est gratuite : c'est le même code.

**Le hasard est tiré à l'avance.** Conséquence directe : quand un œuf est mis en couvaison, on
tire immédiatement ce qui en sortira et on le range, caché. Sans ça, huit heures d'absence
sont incalculables. C'est déjà le cas dans le prototype — la lignée se tire à la mise en
couvaison, pas à l'éclosion.

**Ce qui dépend de la présence ne se rattrape pas.** Le bonheur de la 2.16.0 est le premier
morceau de jeu qui ne tourne PAS pendant une absence, et c'est délibéré : vingt frénésies
gagnées pendant la nuit expireraient toutes avant qu'on ait posé un doigt sur l'écran. La
règle vaudra pour tout ce qui viendra ensuite — un événement, une caresse, un soin.

**Le même calcul tourne à deux endroits** — sur le serveur pour la vérité, dans le navigateur
pour que les nombres montent joliment. Écrit deux fois dans deux langages, il divergera et
coûtera des mois de bugs d'affichage. C'est le seul vrai argument technique du projet, et il
pousse vers un module de calcul partagé. **C'est la question à trancher avant d'écrire une
ligne de serveur**, et elle n'est pas tranchée.

**Un œuf et une créature sont la même ligne** à des stades différents.

**Un seul dessin par forme**, agrandi au fil de la croissance. C'est l'évolution qui change
l'image, jamais la croissance.

**Tous les nombres d'équilibrage vivent au même endroit**, jamais en dur dans le code.

---

## Où on en est

Le jalon 0 est livré en **alpha 2.16.0**, et il déborde largement de son cadre : 27 lignées au
lieu de 5, une vie de cent niveaux en cinq âges, les variantes, quatre raretés, huit
améliorations, la rente, la collection, l'album, l'ascension, un mode histoire avec une
professeure, et le bonheur des bêtes. Une partie des jalons 2 et 3 est donc jouable — mais
**entièrement dans le navigateur**.

Quatre écarts avec le plan d'origine, tous volontaires :

- **Les cinq paliers sont devenus cent niveaux en cinq âges.** L'évolution n'est plus une
  transition, c'est un **péage** : arrivée au dernier niveau de son âge la bête se bloque, et
  seul le paiement la débloque. La décision « je vends ou je paie » revient cinq fois par bête
  au lieu d'une.
- **Rien ne se nourrit contre des pièces.** Une bête grandit au clic et au temps.
- **L'album et l'ascension sont arrivés avant la pension**, alors qu'ils étaient prévus après.
  La pension a suivi en 3.0.0 ; les merveilleuses sont arrivées juste après — Kitsune et Sun
  Wukong en `alpha 3.1.0`, la Tarasque en `beta 1.4.0` — si bien qu'elle fait maintenant les
  deux : viser une lignée, et débloquer la seule rareté qui ne s'achète pas.
- **Un mode histoire est apparu**, qui n'était nulle part au plan. Le jeu ouvrait sur quatorze
  boutons dont treize inachetables ; il ouvre maintenant sur un œuf et quelqu'un qui parle.

### Les dettes

**LE JEU A UNE IMPASSE SÈCHE, ET ELLE EST À DEUX MINUTES DU DÉBUT.** Zéro bête, zéro œuf en
réserve, et moins que le prix d'un œuf commun : plus rien ne peut rentrer. Pas de rente sans
bête, pas de clic sans sujet, pas de vente sans rien à vendre. Le seul geste possible est
d'effacer la partie.

Ce n'est pas un cas de coin. Le chemin le plus court passe par **le conseil du tutoriel** :
on vend sa première bête pour 40 pièces, la professeure annonce qu'« il y a des choses à
acheter qui ne sont pas des œufs », la Force du clic en coûte 30 — et il en reste 10 pour un
œuf qui en vaut 12. Cinq minutes de boucle plus tard, toujours 10.

**Elle est bouchée depuis la 2.25.0** : c'est [la plonge](README.md#la-plonge), une
pièce par assiette, dix clics l'assiette, aucun multiplicateur. Un idle ne doit jamais pouvoir
se rendre injouable — c'est la seule faute dont un joueur ne revient pas. La dette reste écrite
ici parce que la règle vaut pour tout ce qu'on ajoutera : **chaque nouvelle façon de dépenser
doit être relue en se demandant si elle peut assécher la partie.**

**Le visuel est vérifié en permanence — dette close.** Elle a été ouverte pendant vingt
versions au motif que le banc ne met rien en page et ne le dira jamais. C'est toujours vrai du
banc, et c'est faux du projet : **le jeu est joué en continu, et pas de nouvelle vaut bonne
nouvelle.** Ce qui remonte, remonte vite — les huit Wukong d'une minute et le nid qui ne se
laissait pas cliquer sont arrivés par là, pas par un scénario.

Ce qui reste vrai, et qu'il faut garder : le banc ne peut PAS voir une mise en page. Tout ce
qui touche au CSS se vérifie en jouant, et c'est le seul endroit du projet où ça se passe
comme ça.

**L'ascension ne donnait pas envie**, et la 2.20.0 attaque la moitié qu'on savait nommer : ses
récompenses étaient huit pourcentages, invisibles au moment précis où elles devraient
convaincre — le début du cycle suivant, avec un œuf et zéro pièce. L'ocellé et le martelé se
voient à la première seconde. Reste à jouer un cycle entier pour savoir si ça suffit.

**L'ascension donne envie de recommencer — question tranchée.** C'était la seule question du
projet qu'aucune mesure ne pouvait résoudre : elle demandait de jouer le cycle d'après, et la
réponse est venue en le jouant. La 2.20.0 avait attaqué la moitié qu'on savait nommer — des
récompenses qui se voient à la première seconde plutôt que huit pourcentages — et ça a suffi.

Ce que ça libère : **le second axe de prestige n'est plus bloqué.** Il était écarté au motif
qu'empiler un second prestige avant de savoir si le premier donne envie est la façon classique
dont un idle devient illisible. On sait maintenant. Ce n'est pas une raison de le faire, c'en
est une de pouvoir en parler.

**La mesure du rythme est périmée — et elle l'a toujours été.** Ce n'est pas un retard qu'on
rattrape, c'est l'état normal d'un chiffre d'équilibrage dans un jeu qui bouge : chaque version
qui touche à un prix la périme. La noter comme une dette permanente vaut mieux que la refaire
en croyant en avoir fini.

L'outil vit dans `tools/rythme.js` : `node tools/rythme.js 180` rend les trois premières heures.
Ce qu'il ne dira jamais : rien sur le plaisir. Il mesure un débit, pas un rythme ressenti — un
joueur qui s'ennuie et un joueur qui s'amuse produisent exactement la même courbe.

**Deux cibles sont posées, et elles ne le sont pas au hasard :**

> *Tombées depuis — l'œuf rare a valu 55 millions de la `4.12.1` à la `5.6.2`, les péages ont été
> des murs depuis la `4.27.0` — et [le barème unique](CHANGELOG.md#un-seul-barème-pour-tous-les-œufs--livré-en-beta-570) les a
> remplacées en `beta 5.7.0` : l'œuf rare vaut 10 000, et le mur est dans ses péages. Gardées pour
> le raisonnement.*

- **L'œuf rare doit s'acheter vers trente millions**, et non vers ses trois cent mille. Le prix
  n'est pas la question — la question est à quelle FORTUNE le joueur franchit l'ère. Trois cent
  mille tombent trop tôt pour que le passage se sente, et l'ère commune n'a alors pas eu le
  temps de dire ce qu'elle avait à dire.
- **Le péage d'évolution des rares doit être FORT sans casser une partie chanceuse.** Une rare
  tirée à un sur mille dans un œuf commun ne doit pas se retrouver bloquée derrière un péage
  que le joueur ne peut pas payer avant des heures : elle occuperait un enclos sans rien
  rapporter, et le cadeau deviendrait une punition. C'est la même famille de faute que
  l'impasse sèche, sous une autre forme — **une bonne surprise ne doit jamais coûter plus
  qu'elle ne rapporte.**

Les deux se tiennent : si le passage à l'ère rare est reculé à trente millions, une rare
précoce arrive encore plus tôt par rapport à la courbe, et le second point devient plus aigu.
À traiter ensemble, jamais l'un sans l'autre.

**Deux lignes du tableau de puissance du README sont hors d'atteinte.** Elles décrivent ce que
six cartes équipées rendraient, alors que l'album n'a que cinq emplacements. À retrancher.

**Les cinq questions du README** (« À vérifier en jouant ») restent ouvertes. Quatre se
répondront en jouant. La cinquième — la durée de la dernière tranche — coûtera plus cher après
le jalon 1 : tant que les nombres sont dans `game.js`, c'est une ligne ; en base de données
avec des parties en cours, c'est une migration.

### La note de conception

Le détail de l'album, de l'ascension et de la pension vit dans trois artifacts, qui portent
les tableaux, les formules et les arbitrages que ce document résume :

- **Album et ascension** — https://claude.ai/code/artifact/037135da-4a26-4745-b37d-fd0e8990d396
- **Pension, album, ascension** — https://claude.ai/code/artifact/d2577c90-6db3-41e6-b82d-611a0df96e3c
- **Ce qui manque à Éclosion** — https://claude.ai/code/artifact/5b0057d3-2083-44dc-933c-b9da51b648cd

### Idées et ajustements (TODO List)

Dans cette section, je me permet de te donner des informations dès que j'ai des idées. Quand c'est réalisé, tu peux les supprimer d'ici.

*Rangé le 21 septembre 2026. Chaque idée a sa ligne dans [Ce qui vient ensuite](#ce-qui-vient-ensuite),
et son analyse là où le plan en porte une. Les nouvelles s'écrivent en bas, en vrac.*

**La ferme**

- **Des enclos plus chers.** Leur nombre décide de tout : il faut le garder au plus bas. Le barème
  est posé (`beta 5.7.0`) ; reste à fixer un nombre d'enclos visé en fin de partie.

**La collection**

- **Le charme chroma** : avoir vu tous les stades de toutes les créatures double la chance de
  chromatique.

**L'interface**

- **Un sac d'objets**, dans un onglet à lui : toutes les ressources et tous les objets spéciaux
  accumulés.
- **Une interface modulable**, (presque) comme on veut.
