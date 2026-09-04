# Le plan

Ce document est la mémoire longue du projet : ce qu'on a décidé de construire, dans quel
ordre, et pourquoi. Le [README](README.md) décrit le jeu tel qu'il est aujourd'hui ; celui-ci
décrit la route.

Deux plans se superposent, et il faut les lire ensemble. Le **plan des jalons** a été posé le
18 août 2026, avant la première ligne de code : il dit ce que le jeu sera. Le **plan de
versions** a été écrit après coup, quand le prototype a débordé de son cadre : il dit ce qui
tombe dans quel ordre, et c'est celui qu'on suit au jour le jour.

    aujourd'hui : beta 4.10.1 · sauvegarde v24 · 12 lignées illustrées sur 30 · 5 œufs sur 5

---

## Le plan de versions — ce qu'on fait maintenant

**Comment lire ce document.** Ce qui est à faire vient en premier : où on en est, ce qui tombe
ensuite, puis les analyses qui portent chacun de ces chantiers. Ce qui est livré est gardé plus
bas, sous « Ce qui est derrière » — non par nostalgie, mais parce que la moitié des décisions
du jeu ne se comprennent qu'en sachant contre quoi elles ont été prises, et que deux d'entre
elles ont déjà été renversées.

Le numéro suit la règle écrite en haut de `game.js` : majeur pour un morceau de jeu qui
n'existait pas, mineur pour une nouveauté qui tient dans le jeu tel qu'il est, correctif pour
le reste. Chaque version répond à une question, et c'est la question qui décide si elle est
réussie.

**Ce qui reste à venir ne porte pas de numéro**, seulement un ordre : trois fois de suite une
idée non prévue s'est glissée devant, et il a fallu renuméroter la moitié de la table. Le
numéro se décide au moment du commit, là où la règle sait quoi en faire.

### Ce qui est tombé

Le détail version par version est dans le [README](README.md#ce-qui-est-sorti). Ce tableau
regroupe par chantier, parce que c'est ainsi qu'on s'en souvient.

| Chantier | Versions | La question qu'il posait | Réponse |
|---|---|---|---|
| **Les cinq âges** | 1.0 → 1.4 | est-ce que la progression cesse de reculer ? | oui — plus rien ne redescend, par construction |
| **Les prix de moitié** | 1.5 | est-ce que la partie compressée se joue mieux ? | à mesurer encore |
| **L'album et l'ascension** | 2.0 → 2.5 | est-ce qu'on veut recommencer ? | jouée plusieurs fois ; la question de fond reste ouverte |
| **Les achats par lots** | 2.1 | est-ce que la fin de partie cesse d'être une paperasse ? | oui |
| **Les jetons de fortune** | 2.2, 2.9, 2.30 | est-ce que l'ascension se mérite ? | oui — mais les deux moitiés de la réponse d'alors sont tombées : une carte coûte le prix doré depuis la `4.0.0`, et ce qu'on n'emploie pas reste en bourse |
| **Dix lignées rares** | 2.3 | est-ce que l'ère rare cesse de se répéter ? | oui sur le papier — six lignées sans dessin |
| **Le glisser-déposer des cartes** | 2.7 | est-ce que l'album se manipule ? | non vérifié : rien de visuel ne l'est |
| **L'ergonomie du clic** | 2.7.2 → 2.7.3 | est-ce que la barre espace se comporte ? | oui |
| **La charte « idole »** | 2.6, 2.7.1 | est-ce qu'une mythique impressionne ? | oui — validé sur l'Ouroboros |
| **Le mode histoire** | 2.8, 2.11 → 2.12 | est-ce qu'on se sent accompagné ? | à voir en jouant |
| **Les trois axes** | 2.13 | est-ce qu'on comprend ce qui monte ? | oui — âge, niveau, taille, chacun sa colonne |
| **Le confort de la ferme** | 2.14 | est-ce que l'achat par lots tient sa promesse ? | oui — la réserve se vide seule |
| **Le vocabulaire** | 2.15 | est-ce qu'un nom peut contredire une colonne ? | plus maintenant, et c'est vérifié |
| **Le bonheur** | 2.16 | est-ce qu'être présent paie ? | un peu, enfin |
| **La sauvegarde** | 2.17 | la partie peut-elle survivre au navigateur ? | oui — fichier ou texte |
| **Le clic** | 2.18 | un achat de clic se sent-il ? | oui — une seconde entière, et le premier âge ne s'évapore plus |
| **Les compteurs** | 2.19 | le jeu se souvient-il de quelque chose ? | dix-sept nombres, cumulés sur le fichier |
| **Les cartes** | 2.20 | l'ascension donne-t-elle envie ? | deux effets qui se voient dès la première seconde du cycle |
| **Les primes** | 2.21, beta 1.6 | acheter peut-il cesser d'être « niv. 5 → niv. 6 » ? | trente-six achats uniques, et la grille n'en montre que cinq à la fois |
| **La collection** | 2.22 | 135 cases peuvent-elles se ranger ? | elle se replie, section par section |
| **Le socle de la pension** | 2.23–2.24.1 | les cinq pièces s'emboîtent-elles ? | oui — écrites scellées, puis ouvertes sans une ligne à reprendre |
| **Les écrans bas** | 2.24 | le jeu tient-il sur un portable ? | tout se replie, et deux ruptures en hauteur |
| **La plonge** | 2.25, 2.27 | peut-on rendre le jeu injouable ? | non — dix clics l'assiette, et elle se raconte avant de s'ouvrir |
| **Les trophées** | 2.25 | reste-t-il un objectif nommé ? | douze, dont six qu'on ne voit qu'en les décrochant |
| **Le dialogue** | 2.12, 2.26, 2.28 | la professeure regarde-t-elle ce qu'on fait ? | oui, et elle peut retenir : trois passages obligés éteignent l'écran |
| **L'ouverture** | 2.29 | le début est-il trop facile ? | il l'était — trois fois plus long désormais, mesuré |
| **La fusion et la poussière** | 2.30 → 2.32 | est-ce qu'une carte ratée vaut d'être gardée ? | oui — dix cartes font une étoile |
| **Les automates par âge** | 1.0 → 1.4 | est-ce que l'ordre des achats suit la vie de la bête ? | oui, depuis les cinq âges — la ligne avait survécu à sa propre livraison |
| **La pension** | 3.0 | est-ce que parquer deux bêtes est un sacrifice qui se sent ? | oui, et mesuré : jamais le centième de ce qu'elles rapporteraient |
| **Les merveilleuses** | 3.1 | est-ce qu'une merveilleuse se raconte ? | trois écrites — kitsune, wukong, tarasque — dont deux dessinées ; la réponse est dans le dessin, pas dans le code |
| **Le nid et la pause** | beta 1.0, 1.8 | confier une bête est-il un geste ? | oui — et la pause n'est plus nécessaire depuis qu'une bête confiée quitte la bande |
| **Le rang secret** | beta 1.0.1 | la cinquième rareté se découvre-t-elle, ou s'annonce-t-elle ? | elle se découvre : cinq fuites fermées, et la règle est portée par la table |
| **La production** | beta 1.7 | la pension peut-elle concurrencer l'acheteur ? | oui, du même ordre qu'un acheteur de milieu de partie — et toujours perdante en argent |
| **L'encyclopédie** | beta 1.9, 1.10 | la collection peut-elle dire autre chose que « combien m'en manque-t-il » ? | oui — une fiche par lignée, dans une vue à elle |

### Ce qui vient ensuite

La colonne du milieu dit **ce qu'il faut avoir fait avant**, ce qui est plus utile qu'un ordre :
la moitié de ces lignes ne dépendent de rien et peuvent tomber n'importe quand.

**Cette table était incomplète, et c'est le pire défaut qu'elle pouvait avoir** : elle portait
sept lignes quand le fichier en analysait dix-sept. Les analyses vivaient plus bas sans jamais
remonter ici, si bien que la seule table qui dit « ce qui vient ensuite » ne le disait plus.

**Ce qui barre la route à d'autres choses** — à faire d'abord si on veut débloquer le reste :

| Ce qui tombe | Ce qu'il faut d'abord | La question qu'elle pose au joueur |
|---|---|---|
| **La rente** — elle est perpétuelle, gratuite et trop forte | rien | garder une bête doit-il rester le meilleur coup à tous les coups ? |
| **L'absence** — l'équilibrage du hors-ligne, plus doux | la rente | revenir doit-il valoir plus qu'être resté ? |
| **L'hérédité** — teintes, tempérament, motif transmis par les parents | rien | est-ce qu'on a envie de sélectionner ? |
| **Les dix-huit dessins** | rien | — |
| **L'écran au doigt** — voir plus bas, six marches | la planche, pour les cinq autres | est-ce que le jeu répond quand on le touche ? |

**Ce qui ne dépend que de soi** :

| Ce qui tombe | Ce qu'il faut d'abord | La question qu'elle pose au joueur |
|---|---|---|
| **Les six merveilles restantes** — cinq PNG et une recette chacune | leurs dessins | est-ce que le rang tient sur neuf bêtes ? |
| **Yggdrasil** — l'arbre-monde, et le sujet le moins cher à dessiner | sa recette | une merveille peut-elle ne pas être un animal ? |
| **L'animation du cinquième âge** — une planche par merveille | les dessins et `tools/pixel.js` | est-ce qu'une bête qui bouge se raconte toute seule ? |
| **L'équilibrage des rares** — l'œuf rare vers 30 M, et un péage à l'évolution | une partie menée jusqu'à l'ère rare | la deuxième ère se sent-elle comme une ère ? |
| **Les chromatismes** — plusieurs, là où il n'y a qu'un prodige | rien | une couleur rare peut-elle se chasser ? |
| **Les tempéraments à second effet** — précoce, difficile, gourmand, précieux | rien | un tempérament peut-il se choisir plutôt que se subir ? |
| **Cliquer pour aider la pension** | rien | la présence peut-elle servir là où elle ne sert à rien ? |
| **Le tri du nid** — désigner un couple par sa lignée plutôt qu'en cherchant deux bêtes dans la bande | rien | huit couples se composent-ils encore à la main ? |
| **Ce que la pension a rendu** — un journal des pontes, par lignée | rien | sait-on ce qu'on a produit sans compter les œufs ? |
| **Les fonds à la pension** — au hasard comme les teintes, ET transmis par les parents | rien pour le hasard, l'hérédité pour le reste | est-ce qu'un fond se chasse, ou seulement se rencontre ? |
| **L'idle et le combo** — les deux bouts du même réglage | la refonte du bonheur et de la frénésie | s'arrêter et s'acharner peuvent-ils tous deux valoir quelque chose ? |
| **Couper les automates** — un interrupteur général qui lit les consignes | rien | peut-on arrêter le marchand sans aller le chercher ? |
| **La taille des menus** — densité et ordre, sauvés | rien | la ferme peut-elle se ranger comme on la regarde ? |

### Le chantier qui barre la route : les dessins

C'est redevenu une voie de fond : la pension a ouvert sans attendre le bestiaire, et le jeu
affiche un glyphe pour toute lignée sans dessin. Rien n'en dépend, tout en bénéficie.

**18 lignées sur 30 n'ont pas de dessin** — les dix rares (loup, méduse, salamandre,
serpent, araignée, cerf, ours, papillon, tortue, chat), les quatre épiques (kraken, golem,
sphinx, cheval), les trois mythiques (chimère, béhémoth, ouroboros) et la tarasque. Ce n'est
pas une version, c'est une voie de fond qui avance entre les autres. Rien n'en dépend, tout en
bénéficie.

Les douze faites : les dix communes, plus le kitsune et le wukong.

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
| **1** | **La planche** — chaque composant dans chaque état, contre le vrai `style.css`, en une page | est-ce qu'on peut enfin *voir* ce qu'on change ? | une soirée |
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

### Le mur de l'ascension — **abattu en `beta 3.0.0`**

> Les jetons se regagnent désormais à chaque cycle, sur le sommet de fortune atteint depuis la
> dernière ascension, et la porte n'est plus qu'un déblocage. Ce qui suit décrit le mur tel
> qu'il a été rencontré, et reste écrit parce qu'il explique la règle qui l'a remplacé.

**Constaté à mille milliards de pièces : plus de jeton, et le palier suivant à 10¹⁵.** Ce n'est
pas un défaut de code — c'est l'échelle qui fait ce qu'elle a été écrite pour faire — mais c'est
le point où la partie s'arrête, et personne n'y était encore monté.

Le mécanisme, en trois lignes :

- les paliers de fortune vont **de mille en mille** : 1, 10³, 10⁶, 10⁹, 10¹², … jusqu'à 10³⁰ ;
- chaque palier franchi crédite **un** jeton, une fois pour toutes dans la partie ;
- **ascensionner dépense tous les jetons en poche** — c'est voulu, chaque jeton est une carte
  qu'on emporte, et attendre trois jetons pour en emporter trois est la décision du système.

La conséquence n'avait pas été tirée : celui qui saute avec plusieurs jetons repart à zéro
jeton, et doit alors **multiplier sa fortune par mille** pour pouvoir sauter à nouveau. Entre
10¹² et 10¹⁵, avec une légende mythique chromatique à 5,6·10¹¹ l'unité, il faut de l'ordre de
**mille huit cents ventes maximales** — ou l'équivalent en rente. C'est un mur, pas une pente.

**Le chiffre était faux partout où il était écrit.** Le code et le README annonçaient « un
million à chaque cran » quand `JETON_PAS` vaut mille. Corrigé. Ça n'avait l'air de rien tant
que personne n'était monté assez haut : *un mur ne se voit qu'en le heurtant.*

#### La sortie retenue

Une quatrième, qui n'était dans aucune des trois envisagées : **le compte se refait à chaque
cycle**. Ce qu'on emporte n'est plus un crédit qu'on dépense mais une lecture du sommet de
fortune atteint depuis la dernière ascension. La porte, elle, devient un simple déblocage —
avoir atteint le million une fois.

Les deux problèmes tombent ensemble : on peut toujours sauter, et ce qu'on gagne à attendre
reste entier puisque le sommet monte avec le cycle. Ce qui disparaît, c'est la borne sur le
nombre d'ascensions — assumé : elle ne bornait pas la puissance de l'album, qui tient aux cinq
emplacements, mais le temps qu'il fallait pour l'atteindre.

À traiter avec la **rente** et l'**absence** : les trois décident ensemble de ce que vaut une
fin de partie, et la rente perpétuelle est précisément ce qui permet d'atteindre 10¹² sans
jamais rien décider.

### Le jeton devient une monnaie — trois idées qui n'en font qu'une

Trois demandes séparées, et elles se répondent : **une constellation, acquise à l'ascension**, un
**prix des cartes qui monte par le nombre d'or**, et — ailleurs — **cliquer pour aider la
pension**. Les deux premières forment un système ; la troisième vit à part, plus bas.

#### Ce que la 3.0.0 a ouvert, et qu'il faut refermer

La `beta 3.0.0` a fait regagner les jetons à chaque cycle. C'était la bonne réponse au mur, et
elle laisse une porte ouverte : **si les jetons reviennent et que chaque carte en coûte un, on
emporte cinq cartes à chaque ascension, indéfiniment.** L'album se remplit alors sans décision,
et le seul frein restant est le nombre d'emplacements.

**Le prix doré est exactement le contrepoids qui manquait.** Chaque carte prise dans une même
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
**La constellation est le second évier**, et c'est lui qui transforme le prix doré en
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
mieux avec le prix doré, qui est déjà une décision par cycle.

#### LA CONSTELLATION — **le socle est livré en `beta 4.0.0`**

> Le tronc, les quatre nœuds de bâtiments, le prix doré et la bourse de jetons sont écrits.
> Ce qui suit reste la feuille de route des branches — un nœud par fonctionnalité, le jour
> où elle existe.

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
| **le sang** | l'ascension elle-même — prix doré, paliers de jetons | 4 | 72 |
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

Le prix doré et l'arbre **retirent tous les deux des cartes à l'album**. Trois cartes de moins
par ascension, sur dix ascensions, c'est trente cartes — et la forge en demande neuf pour une
seule trois-étoiles. Il y a un risque réel que l'album cesse de se remplir assez vite pour que
la forge existe. **À chiffrer sur une partie simulée avant de figer φ**, et φ n'est peut-être pas
le bon facteur : c'est un joli nombre, ce n'est pas une raison.

### Cliquer pour aider la pension

**La pension est le seul bâtiment où la présence ne sert à rien.** On y dépose deux bêtes, on
attend, on revient. Tout le reste du jeu répond au clic — l'œuf couve plus vite, la bête grandit,
et depuis la `3.1.0` la bête finie paie.

Le geste juste existe déjà ailleurs : **cliquer un œuf avance sa couvaison de `clickGain`
secondes.** Un couple a exactement la même forme — un `t` qui monte vers une `duree`. La règle
s'écrirait donc sans rien inventer : *un clic sur un couple avance sa ponte comme un clic sur un
œuf avance son éclosion.*

**Deux garde-fous, et le premier est déjà connu.**

- **La carte ocellée ne doit pas y toucher.** C'est la troisième fois que cette contrainte
  décide d'une mécanique — la plonge, la bête finie, et maintenant la pension. `mainDeCarte`
  existe pour ça.
- **Les chances de merveille sont PAR PONTE.** Accélérer les pontes accélère donc les
  merveilles dans la même proportion, et le jeu a déjà connu ce défaut sous une autre forme :
  la `beta 1.8.1` corrigeait un couple bloqué qui retirait sa recette à chaque tour — huit
  Wukong en une minute. Une pension qu'on peut cliquer en ×100 doit être mesurée au banc
  AVANT d'être écrite, pas après.

**« Rentrer dans » la pension pose une autre question** : elle vit aujourd'hui dans la colonne
de droite, celle qu'on a passé quatre versions à vider. En faire une vue à part entière — un
quatrième onglet après la ferme, l'encyclopédie et la forge — lui donnerait la place que le nid
à huit couples réclame déjà dans le tableau de route. Les deux chantiers se rejoignent.

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

#### La forge prend aussi les cartes équipées

**La règle s'inverse.** « Une carte équipée n'entre pas dans la forge, exactement comme elle ne
se fond pas » : c'était faux par analogie. Les deux gestes ne se ressemblent pas.

*Fondre* est un bouton sur une carte : un clic, et elle disparaît. Une carte équipée qui
s'évapore ainsi change le build en silence, et le joueur découvre la perte à l'effet. D'où
l'interdiction, qui est bonne.

*Forger* est un geste en deux temps où l'on DÉSIGNE les trois cartes et où l'on voit le
résultat avant de le fabriquer. Rien n'y est silencieux. Interdire les cartes équipées n'y
protège de rien — ça oblige seulement à les déséquiper d'abord, un aller-retour sans décision.

Ce qu'il faut prévoir : la carte qui sort **reprend l'emplacement libéré**. Forger trois cartes
dont une était équipée doit rendre le build immédiatement complet, sinon on a déplacé la
corvée au lieu de la supprimer.

**Le verrou reste, mais il ne sert qu'à fondre.** Un cran sur une carte pour dire « celle-là,
jamais » — contre le geste irréversible d'un clic, pas contre un atelier qui montre tout.

#### La garde illimitée est trop forte, et le vivier l'aggraverait

Le constat vient du jeu : une bête gardée rapporte **sa propre valeur de vente toutes les
heures, indéfiniment, sans rien coûter** (`renteOf`, `RENTE_H = 3600`). Une mythique à
180 millions rend donc 180 millions par heure, pour toujours, et `☆ garder` la met à l'abri du
marchand. La stratégie optimale de fin de partie est donc : remplir tous les enclos de bêtes
gardées et ne plus jamais rien vendre. **La seule limite est le nombre d'enclos.**

C'est ce qui condamne le **vivier** — garer une bête hors enclos contre un coût. L'idée
supprimerait précisément la seule limite qui tient encore le système. Elle est donc EN ATTENTE,
pas rejetée : elle redeviendra bonne le jour où la rente ne sera plus une rente perpétuelle.

Trois pistes pour la rente, à mesurer avant de choisir :

- **un coût d'entretien** par bête gardée, qui monte avec la rareté — garder devient une
  décision qu'on refait, pas un état acquis ;
- **une rente qui décroît** avec le temps passé dans l'enclos — la bête « produit » puis se
  tarit, et vendre redevient la sortie normale ;
- **un plafond de rente par enclos**, indépendant de la valeur de la bête — la place cesse
  d'être le seul arbitrage.

La première est la plus lisible, la deuxième la plus juste, la troisième la plus brutale.

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

#### Yggdrasil, l'arbre-monde — la quatrième merveille

Trois merveilles existent : **kitsune**, **wukong**, **tarasque**. Yggdrasil serait la quatrième,
et elle apporte quelque chose qu'aucune des trente lignées n'a : **ce n'est pas un animal.**

**C'est un avantage, pas un problème, et il tombe pile où ça fait mal.** Le chantier qui barre
la route, c'est le dessin — dix-sept lignées manquent, et chacune demande cinq formes qui
doivent se ressembler ET se distinguer. Or *un arbre est le seul sujet dont les cinq âges se
lisent par la seule taille et la seule ramification* : graine, pousse, arbrisseau, arbre, monde.
Un crapaud qui devient légende doit changer d'anatomie sans changer d'espèce, ce qui est
difficile ; un arbre qui grandit ne fait que grandir. C'est la merveille la moins chère à
dessiner de toutes celles qui restent, et la seule dont l'arc de croissance EST le sujet.

**La recette.** Deux pistes, à trancher :

- **Béhémoth + tortue** — les deux bêtes qui portent un monde sur leur dos. C'est la lecture du
  jeu, et elle évite l'ouroboros qui sert déjà dans deux recettes sur trois.
- **Ouroboros + oiseau** — la lecture du mythe : le serpent qui ronge la racine, l'aigle au
  sommet. Plus juste, mais elle charge encore l'ouroboros.

**AUCUNE DES DEUX N'EST RETENUE, ET LA RAISON EST PLUS INTÉRESSANTE QUE LES DEUX PISTES.** Ce
qu'on veut pour parents, c'est une **fontaine de jouvence**, un **jardin**, une **source** —
des choses qui ne sont pas des bêtes, et qui n'existent pas dans la table.

C'est le même écart que l'arbre lui-même : Yggdrasil serait la première lignée qui n'est pas un
animal, et ses parents veulent l'être aussi. **Croiser deux bêtes pour obtenir un lieu ne se
raconte pas** — c'est là que les deux pistes ci-dessus coincent, et pas sur le choix des
espèces.

Trois façons d'en sortir, aucune tranchée :

- **Ouvrir une famille de lieux** — la source, le jardin, la montagne. C'est un pan de bestiaire
  neuf, donc cher, et il changerait ce que « lignée » veut dire.
- **Yggdrasil n'a pas de parents** — comme Sun Wukong, qui naît d'un œuf de pierre sans père ni
  mère. Le jeu sait déjà faire : `golem + golem` est une non-recette déguisée en recette.
- **Elle arrive sans qu'on la cherche**, comme la tarasque, qui n'a aucune recette et prend
  pour cette raison la moitié du sac secret.

La recette attend cette décision ; le dessin, lui, ne l'attend pas.

**Ce qu'il faut vérifier avant de l'écrire** : une merveille ne doit pas rendre un motif ou un
temperament illisible. Un arbre qui ne bouge pas dans l'enclos poserait la question de
l'animation du cinquième âge — déjà au plan — d'une façon différente : ce qui bouge chez un
arbre, ce sont les feuilles et la lumière, pas le corps.

#### La tour de combat — le second mode de jeu

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

### Une mesure n'est pas un compteur — corrigé en `beta 4.6.1`

**La constellation imprimait des jetons, et le défaut est une confusion de nature.**
`acheterEtoile` remettait `asc.sommet` à zéro en croyant convertir le crédit du cycle en
bourse. Or `crediterJetons` tourne **dix fois par seconde** et relève le sommet sur
`state.coins` : le crédit revenait entier au tour suivant, EN PLUS de la bourse qui le
contenait déjà. Quatre jetons, un achat à un, et **sept jetons** un dixième de seconde plus
tard.

> `sommet` n'est pas une réserve, c'est une **mesure** — le plus haut que la bourse ait atteint
> ce cycle. Une mesure que la boucle refait ne peut pas servir de compteur : la mettre à zéro
> n'enlève rien, ça efface une observation que la boucle refera aussitôt.

Ce qu'on dépense se compte à part, dans `asc.depense`, soldé à l'ascension. **La règle vaut
au-delà d'ici** : partout où la boucle recalcule une valeur, cette valeur est en lecture seule
pour tout le reste du fichier.

**Les bourses gonflées dégonflent à la migration `v24`.** On ne peut pas recalculer la vérité —
les sommets des cycles passés ne sont pas gardés — donc on pose un plafond que rien de
légitime ne peut dépasser : `n ascensions × (11 paliers + les deux nœuds « sommet »)` moins le
prix des nœuds pris. Large exprès, et il ignore les cartes emportées qui l'abaisseraient
encore : personne ne perd un jeton gagné.

### Deux pièges de migration à ne pas oublier

Les nouvelles teintes s'ajoutent **à la fin** de `TINTS`. Une bête stocke sa teinte par
indice ; en insérer une au milieu repeindrait tout le bestiaire déjà éclos.

La réserve d'œufs devait prendre son plafond **avant** la pension, et elle l'a pris : cinquante
par sorte, posés dans la même version. C'était le seul frein du hors-ligne, et une partie qui
aurait déjà tourné sans lui serait rentrée sur des centaines d'œufs le jour de l'ajout. Le
piège reste écrit ici parce qu'il vaut pour tout robinet futur : **le plafond se pose avec le
robinet, jamais après.**

---

## Ce qui est derrière

Les sections qui suivent décrivent des chantiers **livrés**. Elles restent parce qu'elles
portent le raisonnement, et parce que deux d'entre elles ont été renversées depuis : on ne
comprend une règle du jeu qu'en sachant ce qu'elle a remplacé.

### La ligne d'arrivée de l'alpha

**Le mot « alpha » tombe quand la pension, la fusion des cartes et les premières merveilleuses
sont en place ensemble.** C'est la seule définition de la bêta qu'on se donne, et elle a le
mérite de ne dépendre d'aucune date.

Elle tient parce que ces trois-là **forment une boucle**, ce qu'aucune ne fait seule :

- la **pension** donne une raison d'élever plutôt que de vendre ;
- les **merveilleuses** donnent une raison d'utiliser la pension — c'est la seule rareté qui
  ne s'achète pas, et elle n'existe nulle part ailleurs ;
- la **fusion** donne une raison de garder les doublons que tout ça produit, au lieu de les
  laisser dormir en réserve.

Sans la fusion, l'album se remplit de cartes qu'on n'équipera jamais. Sans les merveilleuses,
la pension n'offre qu'un raccourci vers ce qu'on pouvait déjà acheter. Sans la pension, les
merveilleuses n'ont pas de porte. **Le jeu est aujourd'hui un très bon prototype de sa moitié
d'avant**, et ces trois pièces sont ce qui manque pour qu'il soit un jeu.

**Les trois sont tombés.** La fusion en 2.32.0, la pension en 3.0.0, les merveilleuses en
3.1.0 — et la boucle est fermée : on élève pour reproduire, on reproduit pour obtenir ce qui ne
s'achète nulle part, l'album donne une raison de garder les doublons.

L'ordre a changé deux fois en route, et les deux fois pour la même raison : **ne pas rester
bloqué derrière les dessins.** La pension a ouvert sur les vingt-sept lignées existantes,
dessinées ou non — le jeu n'en montre que le glyphe. Les merveilleuses ont suivi à deux sur
huit, par les deux seules dont les recettes se lisaient sans rien ajouter au bestiaire.

Ce que ça coûte, et il faut le dire : **six merveilles sur huit sont écrites et pas écloses**,
et le rang le plus haut du jeu tient aujourd'hui sur deux bêtes en glyphe. Ce n'est pas une
dette de code — il n'y a rien à écrire pour les six autres, seulement des recettes et des PNG.

**Le mot « alpha » est tombé avec la `beta 1.0.0`** : la définition demandait « les premières
merveilleuses », elle ne disait pas combien.

**Et les nombres sont repartis de 1**, contre ce que ce document annonçait. Le raisonnement
d'origine — « la bêta ne remet rien à zéro » — traitait le mot comme une étiquette posée sur
une série continue. Mais la série `alpha 3.x` racontait l'histoire de l'alpha : ses trois
majeurs sont les trois chantiers qui manquaient au prototype. `beta 1.0.0` dit ce que la
version est, une première version d'un jeu complet, là où `beta 3.2.0` aurait continué à
compter les corrections d'un prototype. Le mot et le nombre repartent ensemble, une seule fois
— il n'y aura pas de `gamma`.

### Le chantier graphique — **livré en beta 1.12.0, 1.13.0 et 1.14.0**

Trois demandes, et elles allaient ensemble : c'est **le même écran** qu'elles habillaient. Le
jeu a été construit en supposant que le dessin viendrait après ; il est venu pour dix lignées,
et tout le reste — cartes, œufs, fonds — n'était encore que de la typographie et des bordures.

Les trois sont tombées à la file, et dans cet ordre exprès : la carte d'abord parce que les
deux autres se posent dessus, le fond ensuite parce qu'il avait besoin d'une zone
d'illustration où tenir, l'œuf en dernier parce qu'il ne dépendait de rien.

Ce qui suit est la note d'intention d'origine, gardée telle quelle, avec ce que chacune est
devenue.

#### Les cartes doivent ressembler à des cartes

Aujourd'hui une carte d'album est **une ligne** : une vignette à gauche, deux lignes de texte à
droite, une bordure teintée à la rareté. Ça se lit, ça se trie, ça se glisse — et ça n'a
strictement rien d'une carte. Le mot est employé partout dans le jeu, y compris dans les
mécaniques qui en dépendent (les étoiles, la poussière, la fusion), et l'objet ne le tient pas.

Ce qu'une carte demande, et qui n'existe nulle part :

- un **cadre** — un rapport hauteur/largeur assumé, pas une bande ;
- une **zone d'illustration** distincte de la zone de texte ;
- un **dos** ou une signature de rareté qui se voit à distance ;
- de quoi supporter le fond animé ci-dessous sans devenir illisible.

C'est le plus gros morceau de CSS du projet, et il touche trois écrans : l'album, l'écran
d'ascension, et le choix des cartes actives.

**Devenu la `beta 1.12.0`** : un cadre en 3/4, une zone d'illustration séparée du bas de carte,
une bande de rareté en haut. Fondre et fusionner ont disparu de l'écran d'ascension au
passage — on y choisit des bêtes, pas de la poussière.

#### Les fonds, animés

Les [fonds](#les-fonds--à-développer) étaient prévus comme une variante *visuelle et
collectionnable* de plus, au même rang que les teintes. La demande les précise : **animés, de
particules et de couleurs**, et visibles à la fois **sur la créature en scène et sur sa carte**.

Deux conséquences qui n'étaient pas dans la note d'origine :

- ils deviennent le **premier élément animé du jeu** hors du cinquième âge des merveilles, ce
  qui pose la même question de coût — et la même réponse : `prefers-reduced-motion` fige tout ;
- ils doivent tenir **derrière un sprite de 32 px** sans le manger, et **derrière une carte**
  sans en rendre le texte illisible. C'est la contrainte qui décidera de leur forme, pas
  l'inverse.

À faire en canvas ou en CSS pur ? La réponse dépend du nombre de fonds visibles à la fois : un
seul en scène, mais potentiellement cinq cartes équipées côte à côte.

**Devenu la `beta 1.13.0`**, et en CSS pur : cinq cartes plus la scène font six surfaces animées
à la fois, et six contextes 2D redessinés en boucle auraient coûté plus que tout le reste du jeu
réuni. Huit fonds, un sur huit cents, et **seulement dans les œufs de la boutique** — la pension
n'en donne aucun tant qu'elle ne sait pas les hériter.

#### Un dessin pour les œufs

Les cinq sortes d'œufs partagent le même glyphe 🥚 et se distinguent par leur nom et leur
couleur de bordure. C'est le seul objet du jeu qu'on regarde **pendant des minutes** — la
couvaison est une attente — et il n'a pas d'image.

Cinq dessins : commun, rare, épique, mythique, merveille. Ils profitent du même outillage que
les créatures (`tools/pixel.js`), et ils sont **le meilleur rapport travail/visibilité du
projet** : cinq images pour l'écran que tout le monde voit en premier.

**Devenu la `beta 1.14.0`.** Une décision s'est ajoutée en dessinant : les cinq se distinguent
par **deux signes et non un** — la couleur de la rareté, et un motif propre à chacun (taches,
bandes, losanges, couronne, spirale). Une forme se lit là où une couleur ne se lit pas, de loin
ou pour qui distingue mal le violet du bleu ; le second signe ne coûtait rien à dessiner.

Deux enseignements d'outillage en sont sortis :

- la silhouette est **calculée et non tapée**. Trente-deux lignes de trente-deux caractères
  écrites à la main se décalent d'un pixel sans qu'on le voie, et cinq fois de suite ce sont
  cinq œufs qui n'ont plus la même forme ;
- le générateur **reprend mot pour mot la règle des « cellules isolées »** de `vérifier` et les
  absorbe avant d'écrire. Corriger à la source ce qu'un contrôle sait nommer vaut mieux que
  chasser les pixels un par un — la quantification de l'ombrage en fabrique autant que les
  motifs. Reste la « dérive de style », signalée et voulue : le contrôle est écrit pour les cinq
  âges d'une lignée, or ces cinq stades sont cinq objets distincts.

### L'atelier de forge — **livré en beta 2.0.0**

La section suivante décrit la fusion telle qu'elle a été conçue en 2.30, et **elle a été
renversée**. Elle reste écrite parce qu'elle explique pourquoi le jeu a vécu vingt versions
avec une fusion qui ne fusionnait rien, et parce que l'erreur qu'elle contient est instructive.

**Ce qui n'allait pas : le mot mentait.** « Fusionner » désignait un bouton qui montait une
étoile contre de la monnaie. Rien ne disparaissait, rien ne se mariait. Une fusion, ce sont des
cartes **qui fusionnent** — elles entrent à trois et il en sort une.

**L'objection d'origine était mal posée**, et c'est elle qui avait fait naître la monnaie
seule : *« une fusion classique demande deux cartes identiques, or treize millions de
combinaisons — deux exemplaires identiques n'arriveront jamais »*. C'est exact, et ça ne
conclut rien. **Similaire n'est pas identique.** Il suffisait de choisir quels champs doivent
correspondre :

| Ce qui doit correspondre | Pourquoi |
|---|---|
| **la lignée** | elle décide du plafond de puissance |
| **le motif** | il décide de la famille de bonus |
| **le rang d'étoiles** | une trois-étoiles avalée par une fusion de une-étoile serait un gâchis invisible |

L'**âge n'en est pas** : il ne dit que la puissance, et la puissance se moyenne. C'est ce qui
rend la forge atteignable — sinon il faudrait trois bêtes menées au même âge, et l'atelier ne
s'ouvrirait qu'à qui joue déjà parfaitement.

**Trois entrent, une sort**, et ce compte décide de tout : neuf cartes d'une même lignée pour
une seule à trois étoiles. Deux rendait la troisième étoile presque gratuite ; quatre la
rendait inatteignable avant la dixième ascension.

**Ce que la carte hérite se moyenne** — âge, niveau, teinte, rang — et la teinte s'en trouve
diluée : albâtre plus deux ordinaires ne redonne pas albâtre. C'est ce qui fait de la forge une
décision. Le chromatique et le fond, qui n'ont que deux états, se décident à la majorité.

**La poussière ne bouge pas d'un chiffre**, et c'était la consigne. Elle aurait pu baisser
puisqu'une fusion coûte désormais trois cartes en plus ; elle ne l'a pas fait, parce que ce
qu'elle mesure n'a pas changé — c'est le prix de l'étoile, pas celui du mariage.

**Un atelier, en pleine page**, troisième vue après la ferme et l'encyclopédie. La raison est
la même que pour l'encyclopédie : sept cartes côte à côte n'entrent pas dans une colonne de
vingt et un rem. Il montre les trois cartes qui vont entrer, une flèche, et **la carte qui va
sortir avant qu'elle existe** — c'est la seule façon de rendre « la moyenne des trois » lisible
sans l'expliquer.

**Une carte équipée n'entre pas dans la forge**, exactement comme elle ne se fond pas : elle
s'évaporerait d'un emplacement et changerait le build en silence. La règle existait, elle n'a
eu qu'à s'étendre.

#### Le choix, en deux temps — **2.1.0**

La 2.0.0 prenait **les trois plus fortes** toute seule, au motif qu'une fusion doit rendre la
meilleure carte possible. C'était décider à la place du joueur ce qu'il perd, et une fusion
fait perdre : une teinte s'y dilue, une bête menée à l'âge légende ne se remplace pas en une
ascension. **Quelles trois cartes entrent est la seule vraie question de l'atelier**, et une
machine ne peut pas y répondre.

D'où le geste en deux temps : l'album entier, puis la grille qui **se réduit aux semblables**
de la carte désignée. C'est la réduction elle-même qui enseigne la règle du mariage — on ne lit
pas « même lignée, même motif », on voit quarante cartes devenir deux.

Trois décisions de détail sont tombées avec :

- **cliquer reprend ce qu'on vient de poser**, au même endroit où on l'a posé, et cliquer la
  carte de base annule tout ;
- **ce qu'on ne peut pas forger reste montré**, éteint et avec sa raison : cacher une carte
  qu'on possède ferait chercher ce qu'on a déjà ;
- **le choix ne se sauvegarde pas.** C'est un geste en cours, pas un état de partie : un joueur
  qui ferme l'onglet au milieu ne saurait plus, le lendemain, pourquoi il avait désigné ces
  cartes-là. Il se périme aussi tout seul si une carte est fondue, équipée ou emportée par une
  ascension pendant qu'elle est désignée.

---

### La fusion et la poussière de carte

> *Renversée en `beta 2.0.0`, gardée pour mémoire.* Le titre ne porte pas la mention : un
> intitulé qui bouge casse les liens qui pointent dessus, et celui du README l'était depuis.

Une carte porte des **étoiles**. Elle naît à **une**, la fusion la monte à **deux**, puis à
**trois**, et ça s'arrête là — `ETOILES = [1, 1.8, 3]`, deux fusions au plus dans la vie d'une
carte. Chaque étoile multiplie toute sa puissance.

Ce qui manquait, c'était **ce qu'on paie pour le faire**. La réponse est une monnaie propre aux
cartes : la **poussière**.

#### Pourquoi une monnaie, et pas des doublons

Une fusion classique demande deux cartes identiques. Ici c'est impossible, et le calcul le dit
sans appel : une carte porte une lignée, un âge, un niveau, un motif, une teinte, un rang et
un chromatique, soit **près de treize millions de cartes distinctes**. Deux exemplaires
identiques n'arriveront jamais.

Le problème réel n'est donc pas le doublon, c'est **la carte médiocre**. Une ferme de vingt
bêtes en produit vingt à chaque ascension, dont trois valent la peine. La poussière transforme
les dix-sept autres en carburant, et la question du plan — *« est-ce que les doublons valent
d'être gardés ? »* — devient **« est-ce qu'une carte ratée vaut d'être gardée ? »**, à quoi la
réponse est oui : elle vaut ce qu'on en tire.

#### Les trois robinets, et le seul évier

| | |
|---|---|
| **désintégrer une carte** | la source principale — c'est le geste qu'on répète |
| **l'ascension** | un peu de poussière par bête sacrifiée : ce qu'on jette cesse d'être une perte sèche |
| **fusionner** | le seul évier, et il doit tout absorber |

Le deuxième mérite un mot : aujourd'hui les bêtes qu'on n'emporte pas **disparaissent sans
rien laisser**. Leur donner un peu de poussière ne rend pas le sacrifice indolore — « pas
beaucoup » est la consigne — mais il récompense d'ascensionner sur une ferme pleine plutôt que
sur trois têtards, ce que le jeu voulait déjà encourager sans avoir de moyen de le dire.

#### Ce qu'une carte rend, quand on la désintègre

Les mêmes axes que sa puissance, pour qu'une bonne carte fasse mal à détruire :

    poussière = BASE × rareté × chromatique × fond

| Axe | Proposition | Pourquoi |
|---|---|---|
| **base** | 10 | de quoi compter en dizaines, pas en unités |
| **rareté** | ×1 · ×3 · ×10 · ×30 | plus raide que le plafond de puissance (1 / 1,6 / 2,5 / 4) — la poussière est une ressource, pas un multiplicateur |
| **chromatique** | ×3 | une bête sur 8 192 |
| **fond** | ×2 | quand les fonds existeront ; sans eux le facteur vaut 1 |

**La qualité n'entre pas.** Niveau, teinte et rang décident déjà de la puissance de la carte :
les faire entrer aussi dans la poussière punirait deux fois d'avoir une bonne carte, et
rendrait la décision « garder ou fondre » insoluble. On veut au contraire qu'elle soit
lisible — *une carte vaut sa puissance, ou sa poussière, et les deux ne se ressemblent pas.*

#### Ce qu'une fusion coûte

    coût = COÛT[étoile visée] × rareté

avec `COÛT = [—, 100, 400]`, soit ×4 pour la seconde fusion.

**Le facteur de rareté est le même des deux côtés**, et c'est délibéré : il s'annule. Monter
une commune ou une mythique d'un cran demande **le même nombre de cartes de sa propre
rareté** — dix pour la deuxième étoile, quarante pour la troisième, cinquante en tout. Un
joueur n'a donc jamais intérêt à fondre ses mythiques pour nourrir ses communes, ni l'inverse :
chaque rareté se nourrit d'elle-même, et l'arbitrage reste dans la lignée qu'on aime.

#### La règle qui protège tout

**Fusionner puis désintégrer ne doit jamais rendre plus qu'on n'a mis.** C'est la seule façon
de fabriquer de la poussière à l'infini, et elle suffirait à vider le système de son sens.
Deux façons de s'en assurer, à trancher :

- le palier **n'entre pas** dans la poussière rendue — une carte fusionnée rend autant qu'une
  carte neuve, et le dernier cran est un aller sans retour ;
- ou il entre, mais en rendant strictement moins que le coût cumulé.

La première est plus simple et se raconte mieux : **on ne défait pas une fusion.**

#### Ce qui reste à trancher

- **La poussière traverse-t-elle l'ascension ?** Oui, sûrement : c'est une monnaie de cartes,
  et l'album traverse. La remettre à zéro obligerait à tout fondre avant chaque saut — une
  corvée déguisée en décision.
- **Peut-on désintégrer une carte équipée ?** Non. Une carte qui s'évapore d'un emplacement
  change le build en silence ; il faudra la retirer d'abord.
- **Où s'affiche la poussière ?** Dans l'en-tête de l'album, à côté du compte de cartes. Et
  chaque carte doit dire ce qu'elle rendrait — sinon la décision se prend à l'aveugle.
- **Les dix familles rendent maintenant quelque chose à la troisième étoile**, et un scénario
  du banc le garde. C'est le perlé qui posait le problème — il plafonnait dès la deuxième — et
  il a été remplacé en 2.31.0 par le martelé, calé pour atteindre 96 % de son plafond à la
  troisième exactement. La règle à retenir pour toute famille future : **`pas × 12` doit rester
  juste sous `cap`**, puisque 12 est la puissance d'une carte parfaite à trois étoiles.
- **Faut-il un plafond de poussière ?** Probablement pas : elle se dépense par centaines et
  s'obtient par dizaines, l'accumulation est lente par construction.

**Le socle de la pension était l'atome, et il a tenu.** Emplacements, parents, durée, œuf et
rente suspendue ont été écrits ensemble en 2.23.0, scellés en 2.24.1, ouverts en 3.0.0 — et
**pas une des cinq pièces n'a eu à être reprise**. Seuls les deux bouchons annoncés comme tels
ont été remplacés : `distanceDe` par les étiquettes, `oeufDe` par la lignée promise.

C'est le seul retour d'expérience qui vaille sur la méthode « écrire scellé » : elle coûte une
version, et elle rend le jour de l'ouverture entièrement disponible pour les questions
d'équilibrage — qui sont, elles, celles qu'on ne peut pas trancher sur le papier. La table de
durées écrite au moment du socle était une imprimante à billets, et la mesure l'a montrée en
deux minutes le jour où on l'a branchée.

Ce qui a changé dans l'ordre : **on n'a pas attendu le bestiaire.** Le raisonnement d'origine
tenait — régler une mécanique sur un bestiaire qui va changer sous elle est un piège — mais il
supposait que la pension ait besoin des merveilleuses pour valoir quelque chose. Elle vaut sans
elles, à condition de dire ce qu'elle est : un outil pour **viser** une lignée, pas une porte.
Les dessins manquants ne la gênent pas ; le jeu affiche un glyphe et joue pareil.

### Ce que la 1.7 laisse derrière elle

Trois choses sont apparues en mesurant la pension contre l'acheteur, et aucune n'est réglée :

- **Huit couples se composent à la main, un par un.** Le nid marche pour un couple et pour deux ;
  à huit, désigner seize bêtes dans une bande de quarante devient la corvée que le glisser-déposer
  devait supprimer. La `beta 1.8.0` a retiré les confiées de la bande, ce qui l'allège à mesure
  qu'on remplit la pension — mais ne règle pas le problème : c'est le CHOIX des seize qui est
  long, pas leur affichage.
- **Le panneau de pension a coûté deux défauts d'affichage en deux versions**, et les deux
  étaient déjà documentés ailleurs dans le fichier : un tirage dans une branche morte
  (`beta 1.8.1`) et un DOM rebâti sous le curseur (`beta 1.8.2`, le même défaut que la bande
  avant la 2.14.0). **Tout écran neuf doit être relu contre les commentaires de `renderStrip`
  avant d'être écrit**, pas après.
- **Le plafond de la réserve n'est pas un problème, vérifié en jouant.** Cinquante œufs par
  sorte se remplissent en trois minutes quand la pension tourne à mille œufs l'heure, et le
  couplage avec le nombre d'incubateurs est donc réel — mais il se joue bien. Il reste écrit
  ici comme un fait à connaître, plus comme une inquiétude.
- **La pension ne dit pas ce qu'elle a produit *cette nuit*.** La `beta 1.9.0` règle la moitié
  de la dette : la fiche d'une lignée dit désormais quels couples l'ont donnée et combien de
  fois, depuis toujours. Ce qui manque encore est le **journal récent** — « pendant ton absence,
  la pension a sorti quarante loups » — qui relève du bandeau de retour, pas du carnet.

**La compatibilité et la rareté de l'enfant ont été absorbées par la 3.0.0** : les étiquettes,
la stérilité de la pierre, la durée par distance et le tirage entre parents sont tombés avec la
pension, parce qu'aucune d'elles n'avait de sens séparément — une pension sans règle de
compatibilité, c'est un bouton qui attend.

**Les six merveilles restantes ne coûtent aucun code.** La 3.1.0 a posé la rareté, la sorte
d'œuf qui ne s'achète pas, la table `RECETTES` et la phrase qui les annonce sans les nommer.
Ajouter Surtr, c'est cinq PNG et une ligne de recette. C'est le meilleur endroit où la dette du
projet pouvait se déplacer : elle est entièrement dans le dessin.

**La place unique n'a pas tenu, et c'était le bon abandon.** Elle était là pour forcer à choisir
*quel* couple confier, et l'argument valait tant que la pension était un outil de collection.
Du jour où elle a dû concurrencer l'acheteur, une place unique ne posait plus une question mais
un plafond : on ne choisissait pas mieux, on produisait moins. Les huit places se paient
maintenant six cent milliards, et seize enclos qui ne rapportent plus rien — le choix a
simplement changé de monnaie.

**Une ligne a disparu sans être faite, parce qu'elle l'était déjà.** « Les automates par âge —
l'éleveur aux jeunes, la mangeoire aux grandes bêtes » décrivait mot pour mot ce que le jeu
fait depuis les cinq âges : l'éleveur pousse jusqu'à `bandTo` et s'arrête à la maturité, la
mangeoire ne touche qu'aux bêtes mûres. Vérifié au banc — avec les deux à fond, une jeune gagne
de la croissance et zéro embonpoint ; une fois mûre, l'inverse exactement.

La ligne avait survécu à sa propre implémentation, et personne ne l'avait rayée. C'est le
risque d'un plan qui décrit une intention plutôt qu'un état : **une ligne qu'on n'a pas
rayée finit par ressembler à du travail restant.** Il vaut la peine, de temps en temps, de
relire ce qui reste en se demandant non pas « est-ce qu'on veut le faire ? » mais « est-ce que
ce n'est pas déjà fait ? ».

L'ordre a été **inversé en cours de route** : la pension devait venir avant l'album, elle
passe après. L'album est la clé de voûte vers laquelle les deux autres chantiers pointent, et
le construire d'abord leur donne un endroit où atterrir. Le prix de l'inversion est connu et
accepté : l'album est sorti sans son cran le plus haut, la merveilleuse ne s'obtenant qu'en
pension.

## L'outillage

Le projet n'ouvre jamais de navigateur. Tout ce qui n'est pas lu à l'œil passe par le banc
d'essai, qui a longtemps vécu dans un dossier temporaire et se refabriquait de mémoire à
chaque session. Il est dans le dépôt depuis la revue de structure.

```
node tools/test.js              les 128 scénarios, 1882 vérifications
node tools/test.js bonheur      seulement ceux dont le nom contient « bonheur »
```

- **`tools/banc.js`** fait tourner `game.js` sous Node : un DOM minimal, les identifiants lus
  dans `index.html`, et **tout ce que `game.js` déclare au premier niveau exposé
  automatiquement**. La liste d'exports était écrite à la main et se périmait à chaque
  fonction ajoutée — un test échouait alors pour une raison qui ressemblait à un bug du jeu.
- **`tools/test.js`** porte les scénarios. Ils ont été écrits au fil des versions, chacun le
  jour où quelque chose s'est cassé : ils visent des endroits précis plutôt que de couvrir
  uniformément.

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

**Les fonds sont sortis du vivier** : livrés en `beta 1.13.0`, et la section qui suit dit
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

### Les fonds — faits en `beta 1.13.0`

> **Cette section est la note d'avant.** Elle est gardée telle quelle parce qu'elle dit ce qui a
> été tranché et pourquoi ; ce qui a été construit vit dans le [README](README.md#les-fonds).
> Ce qui reste à faire tient en un mot : **l'hérédité**. La pension n'en donne aucun, exprès,
> jusqu'à ce qu'elle sache les transmettre.

Une bête pourrait naître avec un **fond** : un décor derrière elle, tiré à l'éclosion et gardé
à vie. Il se voit sur la scène et **sur la carte d'album**, et il fait monter un peu le prix
de vente. Il **s'hérite**, comme les teintes, le jour où la pension existera.

**Il est visuel, collectionnable et prestigieux — et il n'entre pas dans le nom.** C'est
tranché. Un fond SE VOIT : le dire en plus serait une redite, et le jeu n'affiche qu'une seule
épithète exprès, pour qu'une bête reste une bête et pas une fiche technique. `Têtard farouche`
garde son nom, et son décor par-dessus le marché.

Deux conséquences à ne pas perdre :

- **Un objet de collection a besoin d'un endroit où être collectionné.** La collection suit
  aujourd'hui 135 formes ; les fonds y ajouteraient un second axe, avec son propre compteur.
  Sans ça, « collectionnable » n'est qu'un mot.
- **Prestigieux veut dire rare.** La plupart des bêtes n'en ont aucun. Un fond fréquent
  devient un décor et cesse d'être une rencontre — c'est la même règle que le chromatique.

Rien n'est écrit ; ce qui suit est ce qu'il faut avoir en tête avant de commencer.

#### Pourquoi c'est le meilleur rapport dessin / variété du jeu

Les dix-sept lignées sans image demandent **cinq dessins chacune**, et chaque dessin ne sert
qu'à une forme. Un fond, lui, sert **aux 135 formes à la fois** : huit fonds multiplient par
neuf le nombre d'images différentes qu'on peut croiser, pour huit fichiers. C'est l'inverse
exact du coût des créatures, et c'est l'argument principal en faveur de l'idée.

#### Ce qu'il faut décider avant d'écrire

- **La fréquence est tranchée : 1 sur 800, et seulement dans les œufs de la boutique.** Le
  qualificatif compte autant que le chiffre — voir plus bas.
- **Ce que « un peu plus cher » veut dire.** L'échelle existe déjà : la teinte va de ×1,10 à
  ×1,20. Un fond dans cette fourchette s'intègre sans rien déranger ; au-delà il faudrait
  reprendre l'équilibrage des variantes en entier.
- **Le fond et le motif ne font pas le même métier.** Le motif décide de l'EFFET d'une carte,
  le fond de sa VALEUR. Les deux peuvent coexister sur la même bête sans se marcher dessus,
  mais la carte d'album devra montrer les deux sans devenir illisible.
- **L'hérédité.** La pension existe depuis la 3.0.0, mais elle ne transmet que la LIGNÉE :
  teinte, tempérament et motif se tirent encore au hasard. Le fond suivra la règle des teintes,
  quelle qu'elle soit — une raison de plus de ne pas écrire cette règle à la légère.

#### Un sur huit cents, et seulement à la boutique

**Le tirage se fait sur les œufs achetés, à 1 sur 800.** Les œufs qui viendront de la pension
ne tirent pas : ils **héritent**. C'est la même frontière que pour les teintes, et elle donne
sa place à chacune des deux voies — on achète pour tomber dessus, on élève pour en obtenir un
précis.

**Ce que 1/800 donne vraiment**, mesuré au banc sur le débit d'éclosions à différents moments
de la partie :

| Moment | Éclosions par heure | Un fond tous les |
|---|---|---|
| au tout début, au clic | 120 | 6 h 40 |
| première demi-heure | 240 | 3 h 20 |
| ère rare | 1 400 | 33 min |
| ère épique | 5 800 | 8 min |
| fin de partie | 19 000 | 3 min |
| très fin de partie | 43 000 | 1 min |

**Le chiffre est calé là où le joueur regarde encore ses bêtes.** Dans les premières heures —
celles où l'on ouvre chaque œuf, où l'on lit chaque nom — un fond est un événement de session.
C'est exactement ce qu'on veut d'une chose prestigieuse.

**Il se dilue ensuite, et c'est la nature de tout tirage par œuf.** Le débit d'éclosions du
jeu va de 120 à 43 000 par heure, un facteur trois cent soixante : aucune probabilité fixe ne
peut rester rare aux deux bouts. Le chromatique a exactement le même défaut à 1 sur 8 192 — en
fin de partie il tombe toutes les dix minutes. Ce n'est donc pas un problème des fonds, c'est
la forme du système de variantes, et il faudra un jour se demander si la rareté doit se
mesurer en œufs ou en temps.

En attendant, la dilution est moins grave qu'elle n'en a l'air : en fin de partie tout part au
marchand automatique sans qu'on le regarde, et les fonds qui comptent sont ceux des bêtes
qu'on **garde**. La pension, elle, rendra le fond chassable au lieu d'attendu.

#### Le piège de migration, le même que pour les teintes

Une bête stockera son fond **par indice**. Les nouveaux fonds s'ajoutent donc **à la fin** de
la table, jamais au milieu : en insérer un redécorerait tout le bestiaire déjà éclos. C'est
exactement la règle qui protège déjà `TINTS` et `MOTIFS`, et elle a déjà failli être oubliée
une fois.

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
- **Lui donner plus de valeur qu'une mythique.** Même multiplicateur, même plafond de carte,
  même rente. Si elle rapportait davantage, la pension redeviendrait une stratégie d'argent et
  tout le travail de la 3.0.0 tomberait sur la première éclose. Un cran de rareté, jamais un
  cran de puissance.
- **Réserver la merveille à sa recette une fois qu'on en a une.** Elle se reproduit comme le
  reste — Wukong × golem rend 5 % de Wukong. La seconde est plus facile que la première, et
  c'est la bonne asymétrie : ça donne une raison de garder une merveille plutôt que de la
  vendre.
- **De nouvelles lignées au-delà des vingt-sept.** L'ère rare a été portée à dix en 2.3.0
  parce qu'elle se répétait ; les épiques et les mythiques, elles, se traversent trop vite
  pour que le compte se voie. Au-delà, le contenu qui manque n'est pas le nombre de lignées,
  c'est le nombre de dessins — dix-sept sur vingt-sept n'en ont pas.
- **Un deuxième axe de prestige.** L'argument d'origine — le premier cycle n'a pas encore été
  rejoué après une ascension — est tombé : elle donne envie de recommencer, c'est vérifié. Il
  reste écarté pour la seule raison qui vaille encore : rien ne le demande.
- **Remonter les taux pour compenser.** Si l'éclosion paraît plate, la réponse est la couche
  d'événements, pas un retour en arrière qui redonnerait aux surprises leur banalité.
- **Découper `game.js` en modules.** Le fichier fait 3 800 lignes et part à la poubelle au
  jalon 1 : le scinder coûterait une demi-journée pour un confort qui ne survivrait pas au
  serveur. Ses dix sections commentées suffisent à s'y retrouver.

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
  La pension a suivi en 3.0.0, mais sans les merveilleuses : elle sert à viser une lignée, pas
  encore à débloquer une rareté.
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

**Elle est bouchée depuis la 2.25.0** : c'est [la plonge](#sortir-de-limpasse--la-plonge), une
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

Ce qu'il ne dira jamais : rien sur le plaisir. Il mesure un débit, pas un rythme ressenti — un
joueur qui s'ennuie et un joueur qui s'amuse produisent exactement la même courbe.

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
