# Les merveilles

Ce document est la route de la **cinquième rareté**. [PLAN.md](PLAN.md) porte la route du jeu,
[REFONTE.md](REFONTE.md) celle de l'écran ; celui-ci ne parle que des bêtes qui n'existent pas
encore.

Il part d'une ligne de `PLAN.md` — *« Les merveilleuses — la rareté, les recettes, trois lignées
dessinées »* — et n'en gardait au départ que le milieu, les recettes étant écartées tant qu'on
ne savait pas quelles bêtes on dessine. **Deux d'entre elles ont éclos depuis** : voir
[les recettes](#les-recettes), en fin de document, qui n'est plus une mise de côté.

    aujourd'hui : 30 lignées · 150 formes · 50 dessins · 5 raretés

**Les huit merveilles du casting sont arrêtées**, plus la Tarasque venue après coup, plus deux lignées qui rejoignent le rang mythique. Il ne
reste aucune décision de casting : ce qui suit est une liste de travail, pas une sélection.

**La Kitsune et Sun Wukong sont dans le jeu depuis la 3.1.0**, en glyphe — 🦊 et 🗿🐒🐵⛰️☁️ — avec
leurs cinq formes, leurs recettes et leur rang. Les six autres n'attendent que leurs dessins :
la rareté, la sorte d'œuf qui ne s'achète pas et la table des recettes sont posées, et en
ajouter une coûte cinq PNG et une ligne.

---

## Ce qu'est une merveille

La charte n'est pas à inventer : elle a été écrite pour l'Ouroboros en 2.7.1, quand l'Ouroboros
mignon a été rejeté. `prompts/ouroboros.txt` en porte le texte intégral, et le commentaire de
`game.js` le désigne déjà comme *« première lignée de l'arc de la révélation »*. Les fiches
ci-dessous s'y adossent mot pour mot.

### Ce qui ne se négocie pas

**1 · Un être nommé, pas une espèce.** Surtr, Tiamat, Polyphème. Jamais « dragon », jamais
« ver ». C'est ce qui distingue une merveille de l'épithète mythologique que porte déjà le
cinquième âge de vingt-sept lignées — Fenrir, Karkinos, Camazotz sont des *noms de fin de vie*.

**2 · Le registre idole, et un plan de corps que rien d'autre n'occupe.** Pas seulement une
silhouette lisible à 32 px : une *anatomie* que le bestiaire n'a pas. C'est la règle qui a failli
sauter, et qui a coûté deux tours de sélection.

**3 · Le cinquième âge bouge.** L'animation n'est pas un bonus qu'on ajoutera si on a le temps :
c'est la signature du rang, et la seule chose du jeu entier qui bouge.

### Le parti pris de chacune

C'est le seul endroit du bestiaire où la question « comment cette bête traverse-t-elle ses cinq
âges » se pose bête par bête. Mais ce sont des **partis pris de dessin, pas des mécaniques** :
chacun se livre en cinq PNG, et le moteur n'apprend rien.

| Merveille | Ce qui change d'un âge à l'autre |
|---|---|
| **Surtr** | rien chez lui — seulement ce que sa lame éclaire |
| **Catoblépas** | l'herbe morte autour, jusqu'au geste final |
| **Nuckelavee** | la terre qui flétrit derrière lui |
| **Sun Wukong** | lui-même — le seul du rang qui ait une enfance |
| **Kitsune** | le nombre de queues qu'elle montre |
| **Olgoï-Khorkhoï** | le ver lui-même — sa taille et sa pose |
| **Tiamat** | ce qui nage en elle |
| **Typhon** | le nombre de gueules, jamais la montagne |

La réponse par défaut — *ce qui grandit n'est jamais la bête* — vient de l'Ouroboros, et sept des
huit la reprennent parce qu'elle marche. Sun Wukong s'en passe, et ça ne coûte rien : c'est une
lignée qui grandit normalement, dessinée en registre idole.

Deux vraies dérogations en revanche, et elles portent sur la **charte graphique**, jamais sur le
jeu : le Nuckelavee contre *« flat and bloodless »*, et le Catoblépas contre *« no ground line »*
— son herbe morte est le sujet, elle a besoin d'un sol. Ce sont les deux seules lignes de
`prompts/ouroboros.txt` qu'il faudra réécrire.

### La frontière avec le mythique

Elle tient en deux faits, et il n'y en a pas d'autres :

> Une merveille **ne s'achète pas** — aucun œuf ne la donne, seule une recette de pension.
> Et **son cinquième âge bouge.**

Un troisième s'y est ajouté à l'usage, et il porte sur ce que le joueur SAIT plutôt que sur ce
qu'il obtient : **le rang n'existe pas tant qu'on n'en a pas vu une.** Ni section de
collection, ni compteur, ni trophée annoncé, ni consigne de marchand. On ne cache pas la
récompense, on cache la question — un jeu qui affiche dix cases vides transforme une trouvaille
en case à cocher.

Tout le reste est du métier, pas de la règle. Le registre idole n'est pas réservé aux merveilles :
l'Ouroboros est un mythique et il l'applique déjà. Un mythique peut être aussi grandiose, aussi
immobile, aussi bien raconté — ce qu'il ne peut pas être, c'est introuvable en boutique.

**Et il ne doit pas y avoir de troisième fait.** Une merveille qui gèlerait ses voisines, dont la
rente exploserait au dernier âge ou qui compterait double dans un enclos serait un jalon déguisé,
et `PLAN.md` l'interdit d'une phrase : *« Un trophée ne donne jamais de puissance. Une prime en
pièces à la rigueur, jamais un multiplicateur. »* Le rang le plus haut du jeu est **du signal
pur**, et c'est ce qui l'empêche de peser sur l'équilibrage.

Conséquence pratique, et elle est bonne : **les merveilles ne coûtent aucun code.** Cinq PNG, une
planche d'animation et une règle CSS chacune, plus une entrée dans `RARITY` et une ligne de
recette. Rien à écrire à la main, bête par bête.

---

## Les huit

| Nom | Origine | Plan de corps | Ce qui grandit |
|---|---|---|---|
| **Tarasque** | Provence | six bêtes en une | le nombre qu'on en reconnaît |
| **Surtr** | nordique | un être de feu | ce que sa lame éclaire |
| **Catoblépas** | Éthiopie de Pline | un bovidé | ce qui meurt autour |
| **Nuckelavee** | Orcades | un cavalier d'une seule chair | ce qui flétrit devant lui |
| **Sun Wukong** | chinoise | un simien | lui-même |
| **Kitsune** | japonaise | un éventail de queues | ce qu'elle cesse de cacher |
| **Olgoï-Khorkhoï** | mongole | un tube sans tête | sa taille et sa pose |
| **Tiamat** | mésopotamienne | un contenant | ce qui nage en elle |
| **Typhon** | grecque | une foule de gueules | leur nombre |
| ~~Kumbhakarna~~ | inde | un géant endormi | *écarté* |

### Tarasque — celle qu'on compte

**Elle n'était pas dans le casting**, et c'est la seule du document dans ce cas. Elle est
arrivée par le besoin : quand la Chimère est devenue un joker en `beta 1.1.0`, ce joker n'avait
pas de prix à donner. Une loterie qui ne rend que ce qu'on peut acheter n'est pas une loterie.

Six bêtes en une — tête de lion, six pattes d'ours, carapace de tortue, queue de scorpion,
écailles, et elle sort du Rhône. Elle a dévoré les voyageurs jusqu'à ce que sainte Marthe
l'apaise d'un cantique ; les gens de Tarascon l'ont tuée pendant qu'elle se laissait faire,
puis ont donné son nom à leur ville.

**Elle est la fille des chimères, littéralement.** Là où la Chimère mythique est un composite
qu'on *regarde*, la Tarasque est un composite qu'on **compte** : à chaque âge on reconnaît une
bête de plus en elle. C'est le seul arc du bestiaire dont le sujet soit un *nombre de parties*
plutôt qu'une taille ou un décor.

| Âge | Forme |
|---|---|
| 1 | Tarasque |
| 2 | Tarasque à six pattes |
| 3 | Tarasque écaillée |
| 4 | Tarasque du Rhône |
| 5 | Tarasque, la bête de Tarascon |

**Le cinquième âge ne porte pas sa taille mais les armes de la ville** — c'est le seul du rang
dont la forme finale soit un emblème humain, et c'est fidèle : son histoire ne finit pas par
elle, elle finit par ceux qui se sont nommés d'après elle.

Ce qui bouge au dernier âge : **les six bêtes, chacune à son rythme** — la queue de scorpion,
la tête de lion, les pattes. Le corps, lui, ne bouge pas, comme partout ailleurs dans le rang.

**Sa dérogation à la règle 2** est assumée : « un plan de corps que rien d'autre n'occupe » —
or la Chimère mythique occupe déjà le composite. C'est précisément le point. Ce qui l'en
sépare tient au dessin : la Chimère se lit d'un coup, la Tarasque se lit en comptant.

### Surtr — celui qui attend la fin

Il garde le Muspellheim depuis avant les dieux, avec une épée plus brillante que le soleil. Il
ne combat personne, il n'a pas d'ennemi, il n'a pas d'histoire : **il attend.** Au Ragnarök il
traverse le pont, tue le dernier dieu et met le feu au monde entier.

C'est l'application la plus pure de la règle 3 de tout le document, parce que le mythe lui-même
est une immobilité. Rien n'est fait de feu dans le bestiaire — l'Ifrit est un cinquième âge de
salamandre. Ce qui grandit : **ce que sa lame éclaire**, du noir complet au monde entier.

| Âge | Forme |
|---|---|
| 1 | Surtr |
| 2 | Surtr en faction |
| 3 | Surtr à la lame nue |
| 4 | Surtr au seuil de Bifröst |
| 5 | Surtr, le feu qui traverse le pont |

### Catoblépas — celui qui ne regarde pas devant lui

Une masse de buffle dont la tête est **si lourde qu'elle traîne au sol en permanence**. C'est une
chance : quiconque croise son regard meurt sur place. On ne l'a jamais tué, on l'a seulement
évité.

Aucun bovidé dans les 27 lignées, et c'est **la seule bête du bestiaire qui ne regarde pas
devant elle** — une silhouette qu'on identifie à sa posture avant même de voir sa forme. Ce qui
grandit : l'herbe morte autour, puis ce qui a essayé d'approcher.

| Âge | Forme |
|---|---|
| 1 | Catoblépas |
| 2 | Catoblépas encorné |
| 3 | Catoblépas des herbes mortes |
| 4 | Catoblépas que rien n'approche |
| 5 | Catoblépas, celui qui lève la tête |

Le cinquième âge est le seul de tout le bestiaire qui soit un **geste** plutôt qu'une taille :
la tête est levée, enfin, et c'est une catastrophe.

### Nuckelavee — le cavalier d'une seule chair

Un cheval et un cavalier qui ne font qu'un seul corps, et sans peau ni l'un ni l'autre : on voit
le sang noir circuler dans les veines jaunes. Son souffle flétrit les récoltes et tue le bétail.
Une seule chose l'arrête : **il ne peut pas traverser l'eau douce.**

Plan de corps totalement libre — rien n'est monté, rien n'a deux torses. Ce qui grandit : la
terre morte derrière lui, qui finit par occuper toute la case.

| Âge | Forme |
|---|---|
| 1 | Nuckelavee |
| 2 | Nuckelavee écorché |
| 3 | Nuckelavee des grèves noires |
| 4 | Nuckelavee que l'eau douce arrête |
| 5 | Nuckelavee, le cavalier d'une seule chair |

### Sun Wukong — celui qui a le droit de grandir

Né d'un **œuf de pierre**, ce qui dans un jeu qui s'appelle Éclosion n'est pas un détail : c'est
la seule légende du monde dont l'ouverture soit une éclosion. Il apprend soixante-douze
métamorphoses, vole les pêches d'immortalité, **raye son nom du registre des morts**, et affronte
l'armée entière du Ciel. Il gagne. Il faut le Bouddha en personne pour l'arrêter, sous une
montagne, pour cinq cents ans.

Aucun primate dans le bestiaire, et la Chine en reste le plus gros trou.

**Son exception, c'est de grandir pour de vrai.** Il est le seul du rang à avoir une enfance —
et loin d'affaiblir la charte, c'est une déclaration : parmi cinq dieux qui sont finis d'avance,
un seul naît, et c'est celui qui finira égal au Ciel.

Il devait porter un second arc — *ce qui se dresse en face*, des rangs de silhouettes plates
grandissant derrière lui. **Essayé et abandonné** : à pleine taille c'est de l'encombrement, en
vignette c'est de la saleté, et ça vole l'œil à la seule chose qui compte. Sa fiche l'interdit
maintenant en toutes lettres. Il n'a qu'un arc, et c'est lui-même.

| Âge | Forme |
|---|---|
| 1 | Singe de pierre |
| 2 | Roi des singes |
| 3 | Sun Wukong |
| 4 | Sun Wukong sous la montagne |
| 5 | Sun Wukong, l'égal du Ciel |

**Le titre complet est inutilisable, et c'est le piège de la 2.15.0.** « Le Grand Sage égal du
Ciel » contient *grand*, qui est un rang de taille : la ligne afficherait « Le Grand Sage égal du
Ciel · taille normale », et le scénario `noms` de `tools/test.js` le rejetterait. « L'égal du
Ciel » dit la même chose et passe.

#### Ce que chaque âge raconte

| | | |
|---|---|---|
| 1 | Singe de pierre | il naît de rien, sans parents |
| 2 | Roi des singes | il règne — sur des singes |
| 3 | Sun Wukong | il reçoit un nom et apprend à voler |
| 4 | Sous la montagne | il perd, et il attend cinq cents ans |
| 5 | L'égal du Ciel | il est enfin ce qu'il prétendait être |

**Le rocher n'est pas un rocher : c'est la main du Bouddha.** Wukong bat l'armée du Ciel au
complet, et le Bouddha lui propose un pari — saute hors de ma main. Il bondit cinquante-quatre
mille kilomètres, arrive devant cinq piliers au bout du monde, y écrit son nom pour prouver son
passage, revient réclamer son dû. Le Bouddha ouvre la main : les cinq piliers étaient ses doigts.
Il n'était jamais sorti de la paume. La main se referme, devient montagne, et un **sceau de
papier portant un mantra** la tient fermée cinq cents ans.

Le sceau d'or que la fiche demande sur la pierre est donc ce talisman. Ce n'est pas un ornement,
c'est la serrure.

#### Pourquoi le quatrième âge est celui-là

Trois raisons, et la troisième est la vraie.

**Le quatrième âge du jeu s'appelle « ancien ».** Sous la montagne est le seul moment de tout son
mythe où du temps passe en bloc — tout le reste est de l'action. C'est l'épisode de la durée, et
il n'a pas de second candidat.

**Le cinquième âge n'existe que grâce au quatrième.** Sans la montagne, la légende est un singe
en armure debout sur un nuage : joli, mais rien ne s'est passé. Avec elle, c'est la libération.
Il vole le titre par orgueil, le paie cinq cents ans, et en ressort digne — le dernier âge n'est
pas le moment où il se proclame, c'est celui où c'est devenu vrai.

**Et c'est le seul dessin du bestiaire qui dise la même chose que la règle.** Le quatrième âge
est le dernier péage : la bête se bloque et ne repart qu'en payant 600 000 × son multiplicateur.
Le joueur reste devant ce sprite pendant qu'il hésite entre payer et vendre. Une bête coincée
sous une pierre en train de pousser, affichée au moment exact où l'on décide de la libérer ou
non — dans trente lignées, c'est la seule case où le dessin et la mécanique racontent la même
histoire. **Le péage est la montagne**, et le joueur paie pour la soulever.

D'où la seule ligne qui compte dans sa fiche : *« if a viewer reads this as a rock with something
under it, the stage has failed »*. Enseveli, tout s'effondre — un rocher ne pousse pas, ne dure
pas cinq cents ans et ne demande rien. **Coincé**, tout tient.

### Kitsune — les neuf queues

Un **éventail de queues** : des formes plates, les moins chères à dessiner de tout le document,
et lisibles à 24 px.

Sa règle propre tient en une lecture du mythe, et c'est la plus fidèle : **elle en a neuf depuis
toujours, elle les cache.** Les kitsune dissimulent leurs queues pour passer pour humaines. « Une
queue par siècle » devient alors ce qu'elle montre, pas ce qu'elle acquiert.

Effet de bord précieux : 1, 3, 5, 7, 9. C'est **la seule créature du jeu dont on lit l'âge sur le
dessin**, sans étiquette et sans barre. C'est aussi la seule merveille qui ne fasse pas peur, et
ça vaut d'être gardé.

| Âge | Forme |
|---|---|
| 1 | Kitsune |
| 2 | Kitsune à trois queues |
| 3 | Kitsune à cinq queues |
| 4 | Kitsune à sept queues |
| 5 | Kitsune, la neuvième queue |

### Olgoï-Khorkhoï — le ver du Gobi

Le point factuel d'abord, parce qu'il change le dessin : dans la légende mongole
l'olgoï-khorkhoï (« ver-intestin ») fait **un mètre**. Il est rouge, sans tête ni yeux visibles,
et il tue à distance. Le ver des sables *géant*, c'est Herbert, pas la Mongolie. Le gigantisme
est une invention du jeu — et c'est très bien, puisque c'est le travail que l'arc doit faire.

**C'est le seul du lot qui applique la charte au pied de la lettre** : il grossit, et surtout
**sa pose change à chaque âge et devient de plus en plus imposante**. Lové bas et presque à plat
au premier, une boucle qui se soulève au deuxième, dressé sur un tiers de sa longueur au
troisième, la masse au-dessus de sa propre spirale au quatrième, et occupant toute la hauteur du
cadre au cinquième, gueule radiale ouverte au sommet.

C'est mot pour mot ce que `prompts/ouroboros.txt` demande — *« the pose changes at every stage,
and visibly »*, *« what the being gains is [...] sheer size »* — et il n'a donc besoin d'aucune
dérogation.

| Âge | Forme |
|---|---|
| 1 | Olgoï-Khorkhoï |
| 2 | Olgoï-Khorkhoï enroulé |
| 3 | Olgoï-Khorkhoï dressé |
| 4 | Olgoï-Khorkhoï déployé |
| 5 | Olgoï-Khorkhoï, le désert qui se lève |

**Ce qui le sépare des sept serpents du bestiaire, c'est qu'il n'a pas de tête.** Ni yeux, ni
mâchoire, ni cou : un tube épais, segmenté, rouge uni, qui ne s'effile pas, et dont la bouche est
un anneau radial et non une gueule. Quetzalcóatl, l'Ouroboros et l'Amphithère ont tous une tête
de serpent. C'est le seul écart qui compte, et il tient à n'importe quelle pose — donc c'est la
ligne à écrire en gras dans sa fiche de prompt.

### Tiamat — la mer d'avant le ciel

L'eau salée primordiale faite dragonne, mère des onze monstres. Marduk la fend en deux : une
moitié devient le ciel, l'autre la terre. C'est le seul mythe du lot où **le monde est fait du
corps de la bête**.

Au premier âge son corps est vide ; au cinquième on distingue **onze petites silhouettes à
l'intérieur**, en formes plates. Elle n'a pas grossi, elle s'est peuplée.

| Âge | Forme |
|---|---|
| 1 | Tiamat |
| 2 | Tiamat féconde |
| 3 | Tiamat des eaux mêlées |
| 4 | Tiamat aux onze |
| 5 | Tiamat, la mer d'avant le ciel |

### Typhon — la multiplicité

Cent gueules de serpent jaillissant d'une masse, des vipères en guise de jambes, des ailes. Zeus
l'enterre sous l'Etna, et c'est le seul qu'il ait craint.

**Typhon n'est pas un serpent : c'est une foule de serpents.** Rien dans le bestiaire n'est une
multiplicité — à condition que le dessin s'y tienne. Ce qui l'empêche de doubler l'arc du ver,
qui sort de terre lui aussi : **la montagne ne bouge pas.** L'Etna posé sur lui est identique aux
cinq âges, comme l'anneau de l'Ouroboros.

| Âge | Forme |
|---|---|
| 1 | Typhon |
| 2 | Typhon enchaîné |
| 3 | Typhon aux cent gueules |
| 4 | Typhon jusqu'aux astres |
| 5 | Typhon, le dernier fils de la terre |

---

## Le rang mythique

Deux bêtes magnifiques qu'il n'y a **aucune raison de rendre introuvables**. Une merveille est
définie par le fait qu'on ne peut pas l'acheter ; ces deux-là ne perdent rien à sortir d'un œuf,
et elles vont là où le jeu en a besoin.

Et ça répare une dette : **l'ère mythique n'a que trois lignées** — Chimère, Béhémoth, Ouroboros
— alors que l'ère rare est passée de quatre à dix en 2.3.0 précisément parce qu'elle se répétait.
Un œuf à 180 M qui tire dans un sac de trois est du contenu mort. Ces deux-là la portent à cinq,
et l'ère cesse de se répéter.

**Ammit** — *Égypte.* Gueule de crocodile, avant-train de lion, arrière-train d'hippopotame,
accroupie près de la balance où l'on pèse le cœur des morts. Si le cœur est plus lourd que la
plume, elle le mange, et l'âme **cesse d'exister**. Ce n'est pas la mort, c'est la seconde mort.

| Âge | Forme |
|---|---|
| 1 | Gueule d'ivoire |
| 2 | Croqueuse de cœurs |
| 3 | Ammit |
| 4 | Ammit de la balance |
| 5 | Ammit, la seconde mort |

**Polyphème** — *Grèce, l'Odyssée.* Fils de Poséidon. Il vit seul dans sa grotte avec ses
troupeaux, et il mange les hommes qui y entrent. Ulysse l'aveugle avec un pieu et lui dit
s'appeler Personne, si bien que ses frères accourus n'entendent que *« Personne me tue ! »* et
repartent. Le vrai coup vient après : aveugle, Polyphème **prie son père**, et c'est cette prière
qui coûte dix ans de mer à Ulysse.

Le cinquième âge ne devrait donc pas nommer sa taille mais **sa prière** — c'est la seule chose
qu'il ait réussie, et c'est celle qui décide de toute l'Odyssée.

| Âge | Forme |
|---|---|
| 1 | Cyclopeau |
| 2 | Cyclope |
| 3 | Berger des cavernes |
| 4 | Polyphème |
| 5 | Polyphème, la prière au père |

Deux notes. C'est **un éleveur** — un géant qui garde des troupeaux dans une grotte, dans un jeu
de ferme, ce qui n'est pas rien. Et la Grèce est déjà servie cinq fois (Karkinos, Arachné, Psyché,
Pégase, Chimère) : ce n'est pas un veto, mais c'est le panthéon le plus chargé du bestiaire.

---

## Ce que ça coûte

Les huit sont retenues, et rien n'est coupé. Les chiffres, sans les déguiser :

| | Lignées | Formes | Dessins restants | Planches d'animation |
|---|---|---|---|---|
| aujourd'hui | 27 | 135 | **85** | 0 |
| + Ammit et Polyphème | 29 | 145 | 95 | 0 |
| + les 8 merveilles | **37** | **185** | **135** | **8** |

Cent trente-cinq dessins restants, c'est près de trois fois tout ce qui a été produit depuis le
début du projet — les dix communes, et rien d'autre. C'est le seul chiffre qui puisse encore
faire revenir sur le compte, et il ne se réglera pas par une décision : il se réglera en
dessinant la première planche et en mesurant ce qu'elle a coûté.

### La question du reptile est tranchée

Le bestiaire compte déjà sept serpentiformes, et trois des huit merveilles en sont — Tiamat,
Typhon, l'Olgoï-Khorkhoï. **Ce n'est pas un motif de coupe.** Une majorité de reptiles est
acceptée ; la diversité est une préférence, pas un veto. Ce qui avait été rejeté en cours de
conception, ce n'était pas le résultat, c'étaient des *propositions* qui se répétaient.

Ce que ça laisse, c'est une exigence de dessin, et elle est absolue :

> **Aucune des trois n'est dessinée comme un corps de serpent.**
> Tiamat est un **contenant** — on la lit à ce qui nage dedans.
> Typhon est un **nombre** — on le lit à ses gueules.
> L'Olgoï-Khorkhoï est **sans tête** — ni yeux, ni mâchoire, ni cou, et il ne s'effile pas.

Le ver est le plus exposé des trois depuis qu'il se dessine comme un corps qui grandit et se
dresse : son écart n'est plus compositionnel mais anatomique, et il tient entièrement à la
discipline du prompt. C'est la ligne à mettre en gras dans sa fiche.

### Un doublon à surveiller

Typhon et Kitsune ont **le même arc** : quelque chose se compte, et le nombre monte — des
gueules d'un côté, des queues de l'autre. Ce n'est pas non plus un motif de coupe, mais deux
bêtes qui grandissent de la même façon se ressemblent plus qu'elles ne devraient. La parade est
dans le rythme : la Kitsune compte **par pas réguliers et lisibles** (1, 3, 5, 7, 9 — on lit son
âge dessus), Typhon doit donc compter **de façon désordonnée**, une prolifération dont personne
ne tient le compte.

---

## L'animation du dernier âge

Le cinquième âge d'une merveille **bouge**. C'est la seule chose dans tout le jeu qui bouge, et
c'est ce qui fait qu'on la reconnaît sans lire un nombre.

**Elle obéit à la même règle que le dessin.** L'arc entier disait *ce qui grandit n'est jamais la
bête* ; l'animation dit **ce qui bouge n'est jamais la bête**. Le corps est figé, exactement
comme il l'était sur les cinq âges. C'est ce qui l'empêche de devenir une bête qui gigote.

| Merveille | Ce qui bouge | Ce qui ne bouge pas |
|---|---|---|
| **Surtr** | la lumière de la lame monte et retombe | lui |
| **Catoblépas** | l'herbe flétrit en cercles vers l'extérieur | la bête, tête levée |
| **Nuckelavee** | le sang noir circule dans les veines jaunes | le cavalier et sa monture |
| **Sun Wukong** | le nuage roule sous ses pieds, les plumes du cimier ondulent | lui |
| **Kitsune** | les neuf queues respirent, déphasées | son corps et sa face |
| **Olgoï-Khorkhoï** | les anneaux se contractent en vague le long du corps | sa silhouette |
| **Tiamat** | les onze dérivent en elle | son corps |
| **Typhon** | les gueules s'ouvrent, désynchronisées | la montagne |

Le Nuckelavee est le seul dont l'animation soit **à l'intérieur du corps** — et c'est ce qui le
sauve : un écorché immobile est une image fixe désagréable, un écorché dont le sang circule est
vivant. C'est aussi la seule des sept qui ait besoin de l'animation pour exister.

### Pourquoi c'est le bon endroit

**Ça ne coûte rien au reste du jeu.** Une lignée, un âge : une planche. Animer un cinquième âge
ordinaire en demanderait vingt-sept.

**C'est une récompense qui ne pèse pas sur l'équilibrage.** `PLAN.md` pose la règle — *un trophée
ne donne jamais de puissance*. Une animation est du signal pur : elle ne se convertit en rien,
elle ne se compare à rien, et elle ne peut pas devenir un jalon déguisé.

**Elle répond à la question que le plan pose.** *Est-ce qu'une merveilleuse se raconte ?* Une
bête qui bouge raconte toute seule.

### Comment

Une **seconde planche** par merveille : les N images du cinquième âge côte à côte, au même format
que les planches d'évolution que `tools/decouper.py` découpe déjà. Le rendu ne découpe rien — il
pose la planche entière en `background-image` et fait défiler `background-position` en
`steps(N)`. Une règle CSS, aucun JS, et le fichier suit exactement le chemin des autres PNG.

**Quatre à six images**, pas plus. Seules quelques formes plates changent d'une image à l'autre ;
tout le reste de la planche est identique. C'est nettement moins de travail qu'un sixième dessin.

**Sur la scène et sur la carte d'album. Pas dans les vignettes.** Une bande peut afficher trente
vignettes ; plusieurs merveilles animées côte à côte la transforment en clignotement. Ça donne au
passage une raison de mettre une merveille en scène, ce qui n'en avait aucune jusqu'ici.

**`prefers-reduced-motion` fige la première image.** Ce n'est pas une option, et c'est deux
lignes.

---

## Ce qui n'est pas tranché

**Le sol du Catoblépas.** `prompts/ouroboros.txt` impose *« transparent background, no shadow, no
ground line »*, or l'herbe morte est le sujet même de son arc. Soit il obtient une dérogation,
soit **le sol devient une partie de la bête** — une plaque d'herbe qu'elle porte, et non un
terrain sur lequel elle pose. La seconde option est plus propre et vaut d'être essayée en
premier. Le Nuckelavee pose la même question pour sa terre flétrie, en moins aigu : son arc peut
se lire sur sa seule chair.

**Le Nuckelavee demande une dérogation plus grosse que celle de l'Ouroboros.** La charte est
explicite — *« flat and bloodless : no blood, no wound, no gore »* — et un écorché, c'est
exactement ça. L'exception de l'Ouroboros portait sur la *forme* (mâchoire décrochée, ventre
gonflé), pas sur la chair. Faisable en aplats — trois traits jaunes pour les veines, un aplat
sombre pour le muscle — mais c'est le dessin le plus risqué du document. Raté, il devient
répugnant au lieu d'être effrayant. **À dessiner en premier**, pour savoir tout de suite.

**Le nom de la Kitsune.** « Kitsune » veut dire « renard » : c'est une espèce, pas un être nommé,
et c'est la seule à violer la règle 1. Le nom propre existe — **Tamamo-no-Mae**, la renarde à neuf
queues qui faillit renverser le Japon et finit changée en pierre meurtrière. Plus juste, beaucoup
moins reconnu. *La 3.1.0 a tranché par défaut en gardant « Kitsune », parce qu'il fallait un nom
pour l'écrire ; la question reste ouverte et le renommage ne coûte qu'une ligne.*

**La règle « que des bêtes » est levée, et il faut l'écrire.** Zéro humanoïde sur 27 lignées, et
ce n'était probablement pas un hasard : le jeu fait éclore des œufs et élève des bêtes. Or on en
compte maintenant **quatre** — Surtr, Sun Wukong, Polyphème, et le Nuckelavee pour sa moitié
haute. Mieux vaut lever la règle sciemment que la laisser tomber par accident, et l'argument qui
la lève proprement existe : Sun Wukong **naît d'un œuf de pierre**, seule légende du monde dont
l'ouverture soit une éclosion.

Reste la conséquence pratique, qui n'est pas réglée : le registre idole a été écrit pour des
bêtes — *« adult proportions », « the head is a normal head », « narrow half-lidded eyes »*. Un
visage humain à 32 px en six aplats est un autre métier que le museau d'un crapaud. **À
éprouver sur Surtr avant d'en commander quatre.**

---

## Les recettes

Une merveille ne s'achète pas : elle ne s'obtient qu'en pension, par un couple précis. Les deux
premières sont écrites, et elles ont fixé la forme que les six autres suivront.

### Ce qu'une recette porte

**Son couple, sa durée et son pourcentage** — et rien de la formule ordinaire, qui est calibrée
pour l'élevage. Une merveille n'est pas de l'élevage.

| Merveille | Couple | Durée | Chance | Médiane |
|---|---|---|---|---|
| **Kitsune** | Ouroboros × Sphinx | 12 h | 1 % | 34 j |
| | Ouroboros × Chat | 5 h | 0,1 % | 144 j |
| **Sun Wukong** | Golem × Golem | 1 h | 0,1 % | 29 j |
| **Tarasque** | Chimère × Chimère | 16 h | 1 % | 46 j |

**La Tarasque n'a pas de recette**, et c'est ce qui la définit : elle sort du joker, une fois
sur cinquante quand deux chimères pondent, et de rien d'autre. Voir sa fiche plus haut.

**Une recette n'est pas une porte, c'est un tirage.** Le couple pond normalement, et la
merveille sort par-dessus. Rien à débloquer : on peut tomber dessus sans savoir, ce qui fait
qu'une merveille *existe dans le monde avant que quiconque sache la fabriquer*.

### Deux routes, qui ne disent pas la même chose

- **L'accident** — des parents qu'on a déjà, un pour mille. Personne ne le vise.
- **La recette** — le couple exact, un pour cent. C'est la route.

L'exact doit toujours écraser l'accident en rendement, sinon il ne sert à rien : 0,083 %/h
contre 0,020 pour la Kitsune, un facteur quatre.

**Le pourcentage n'est pas la rareté** — un tirage de pension coûte des heures, pas un clic.
Ce qui compte est `chance ÷ durée`, et c'est ce qui a dicté l'heure unique de Wukong : à quatre
heures, 0,1 % faisait 115 jours de médiane. La justification n'est pas arithmétique — **deux
pierres ne couvent pas.** Rien n'est élevé là-dedans, il y a une pierre qui finit par se fendre.

### Un mythique par famille, et la Chimère n'en est pas une

La Chimère a été le carrefour de la moitié des recettes pendant une version, au motif qu'elle
est faite d'autres bêtes. **C'était lui prêter le rôle inverse du sien** : une chimère ne
concentre pas, elle disperse. Depuis la `beta 1.1.0` elle est le **joker** — deux chimères
donnent n'importe quelle lignée, sauf une chimère et sauf une merveilleuse — et elle ne porte
plus aucune recette.

Le carrefour d'une merveille doit dire **de quoi elle est faite**, pas seulement qu'elle est
composite :

| Mythique | Son axe | Ses merveilles |
|---|---|---|
| **Ouroboros** | ce qui gagne avec le temps | Kitsune |
| **Golem** | ce qui naît de la pierre | Sun Wukong |
| **Béhémoth** | ce qui sort de la terre | l'Olgoï-Khorkhoï, Typhon |
| **Kraken** | ce qui contient la mer | Tiamat |
| **Chimère** | — | aucune : elle est le joker |

Restent le Catoblépas, le Nuckelavee et Surtr, qui n'ont pas encore d'axe. Un mythique par
famille donne au joueur **une carte mentale au lieu d'une liste**, et c'est ce qui permet de
deviner une recette qu'on n'a pas encore vue.

### Le plancher économique, et son exception

**Au moins un parent mythique, jamais un parent commun.** Le prix d'une pension est la *rente
suspendue* — or deux communes parquées ne coûtent rien, et une recette accessible en bas de
l'échelle rendrait la créature la plus chère du jeu strictement gratuite.

**Wukong y déroge, et c'est la bonne dérogation** : golem × golem est épique × épique, sous le
plancher. Mais deux golems parqués coûtent environ deux milliards l'heure en rente, et le
plancher n'était qu'un raccourci pour dire *cher*. Le raccourci ne doit pas l'emporter sur ce
qu'il abrège.

### Ce qui se passe après la première

Une merveille **se reproduit comme le reste** : elle n'a pas de règle à part, et la recette
n'est le passage obligé que pour la première.

| Couple | Durée | Ce qui sort |
|---|---|---|
| Wukong × Golem | 20 h | 5 % Wukong — il retourne à la pierre dont il sort |
| Kitsune × Sphinx | 20 h | 5 % Kitsune |
| Kitsune × Loup | 7 h | 1 % Kitsune — la route pauvre |
| Kitsune × Chimère | 48 h | refusé : au-delà du plafond |

La seconde est donc plus facile que la première, et c'est la bonne asymétrie : elle donne une
raison de **garder** une merveille plutôt que de la vendre. Le rang reste tenu par la seule
règle qui compte — aucun œuf n'en donne — et la première coûte un mois.

### La règle qui n'a pas bougé

**Une merveilleuse vaut exactement ce que vaut une mythique.** Même multiplicateur de prix, même
plafond de carte, même rente. C'est la traduction en code de ce que ce document demandait déjà :
*le rang le plus haut du jeu est du signal pur*. Si une merveille rapportait davantage, la
pension redeviendrait une stratégie d'argent, et tout ce qui a été fait en 3.0.0 pour qu'elle
n'en soit pas une tomberait sur la première éclose.

---

## Ce qu'on a décidé de ne pas faire

- **Promouvoir l'Ouroboros au rang de merveille.** Il en est la charte, pas un membre : le rang
  mythique tomberait à deux lignées, et l'œuf à 180 M perdrait un tiers de son contenu au moment
  exact où le joueur vient de le payer. Il reste mythique, et il reste le modèle.
- **Une merveille inventée.** Une créature issue d'un mythe se raconte toute seule et arrive avec
  sa forme ; une créature inventée demande qu'on écrive d'abord pourquoi elle existe. La Couronne,
  premier essai de ce document, est morte de ça.
- **Sélectionner sur ce qui manque.** Deux tours de candidates choisies pour combler un trou de
  la carte — un masque de bronze, une vache primordiale, un chien non identifié — n'ont enchanté
  personne. Une merveille se choisit sur sa puissance, pas sur sa case vide.
- **Animer autre chose que le cinquième âge.** Cent quatre-vingt-cinq formes animées est un autre
  jeu ; huit est une récompense.
- **Couper pour cause de reptiles.** Trois merveilles sur huit sont serpentiformes et le bestiaire
  en porte déjà sept. Une majorité de reptiles est acceptée : la diversité est une préférence, pas
  un veto. Ce qui a été rejeté en cours de conception, ce sont des propositions qui se répétaient,
  jamais le résultat.
- **Kumbhakarna.** Le géant qui dort six mois et mange des villages au réveil. Bel arc — il dort
  aux quatre premiers âges — mais c'est l'arc de Surtr, en moins définitif : attendre pour manger
  contre attendre pour brûler le monde.
- **Promouvoir une règle en loi.** *« Déjà accomplie au premier âge »* était l'exception de
  l'Ouroboros, et elle a été prise pour la charte du rang pendant tout un tour de conception.
  C'est ce qui a failli coûter Sun Wukong. C'est une bonne réponse par défaut, pas une loi.
- **Donner une mécanique propre à chaque merveille.** L'idée a été essayée et elle est vide : ce
  qu'on trouve à écrire — une bête qui ne bouge pas, un décor qui grandit, un âge qui se lit sur
  le dessin — ce sont des PNG, pas du code. Et ce qui serait vraiment du code (une rente, une
  aura, un enclos qui compte double) tombe sous l'interdiction du trophée qui donne de la
  puissance. Le rang le plus haut du jeu ne change rien au jeu, et c'est délibéré.
