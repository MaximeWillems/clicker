# Le plan

Ce document est la mémoire longue du projet : ce qu'on a décidé de construire, dans quel
ordre, et pourquoi. Le [README](README.md) décrit le jeu tel qu'il est aujourd'hui ; celui-ci
décrit la route.

Deux plans se superposent, et il faut les lire ensemble. Le **plan des jalons** a été posé le
18 août 2026, avant la première ligne de code : il dit ce que le jeu sera. Le **plan de
versions** a été écrit après coup, quand le prototype a débordé de son cadre : il dit ce qui
tombe dans quel ordre, et c'est celui qu'on suit au jour le jour.

    aujourd'hui : alpha 2.24.1 · sauvegarde v14 · 10 lignées illustrées sur 27

---

## Le plan de versions — ce qu'on fait maintenant

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
| **Les jetons de fortune** | 2.2, 2.9 | est-ce que l'ascension se mérite ? | le pas de mille tient |
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
| **Les primes** | 2.21 | acheter peut-il cesser d'être « niv. 5 → niv. 6 » ? | vingt achats uniques, chacun disant une seule chose |
| **La collection** | 2.22 | 135 cases peuvent-elles se ranger ? | elle se replie, section par section |
| **Le socle de la pension** | 2.23–2.24.1 | les cinq pièces s'emboîtent-elles ? | écrites et scellées : on attend le bestiaire |
| **Les écrans bas** | 2.24 | le jeu tient-il sur un portable ? | tout se replie, et deux ruptures en hauteur |

### Ce qui vient ensuite

| Ce qui tombe | Sauv. | La question qu'elle pose au joueur |
|---|---|---|
| **La plonge** — laver des assiettes quand il ne reste rien, une pièce chacune | 14 | est-ce qu'on peut rendre un jeu injouable ? (non) |
| La fusion — les paliers, et le repère sur les capsules | 11 | est-ce que les doublons valent d'être gardés ? |
| Les automates par âge — l'éleveur aux jeunes, la mangeoire aux grandes bêtes | 11 | est-ce que l'ordre des achats suit la vie de la bête ? |
| La pension, **ouvrir la porte** — l'écran, le plafond de la réserve d'œufs, le drapeau | 14 | est-ce que parquer deux bêtes est un sacrifice qui se sent ? |
| La compatibilité — étiquettes, stérilité, durée par distance | 12 | est-ce que la règle se devine sans wiki ? |
| L'hérédité — les quatre issues, les fusions, les teintes exclusives | 12 | est-ce qu'on a envie de sélectionner ? |
| La rareté de l'enfant — le tirage entre parents, la montée par âge | 12 | est-ce que la montée reste un cadeau et non une voie ? |
| Les merveilleuses — la rareté, les recettes, trois lignées dessinées | 12 | est-ce qu'une merveilleuse se raconte ? |

L'ordre a été **inversé en cours de route** : la pension devait venir avant l'album, elle
passe après. L'album est la clé de voûte vers laquelle les deux autres chantiers pointent, et
le construire d'abord leur donne un endroit où atterrir. Le prix de l'inversion est connu et
accepté : l'album est sorti sans son cran le plus haut, la merveilleuse ne s'obtenant qu'en
pension.

### Sortir de l'impasse — la plonge

**Décidé.** Quand il ne reste plus rien — pas de bête, pas d'œuf, et moins que le prix d'un
œuf commun — on va faire la plonge. **Une assiette lavée, une pièce.** Douze assiettes pour un
œuf commun.

**C'est une punition, et elle est assumée comme telle.** Une punition pour avoir mal géré, mais
rattrapable : on ne perd pas sa partie, on perd du temps. C'est exactement le bon dosage pour
un idle — le jeu ne doit jamais pouvoir se rendre injouable, mais il n'a aucune raison de
faire semblant qu'une erreur n'en était pas une.

C'est aussi la seule sortie qui rende l'état vide **jouable** au lieu de le rendre impossible,
et elle raconte quelque chose : on repart de rien, à la main, comme au premier jour.

#### La règle qui la borne

**Elle ne s'ouvre que dans l'impasse, et se referme dès qu'on en sort.** C'est-à-dire :
zéro bête, zéro œuf en réserve, aucun œuf en couvaison, et moins que le prix de l'œuf le
moins cher. Dès que la douzième pièce tombe, l'évier disparaît.

Cette condition n'est pas un détail d'équilibrage, c'est **ce qui rend les garde-fous
inutiles** : une plonge qui ne s'ouvre que là où rien d'autre n'existe ne peut par
construction pas devenir un revenu alternatif, ni une stratégie de début de partie. Rien à
doser, rien à surveiller. Une plonge disponible en permanence aurait demandé un débit
soigneusement mauvais, ce qui est toujours un mauvais signe.

#### Ni frénésie, ni auto-clic — tranché

**Un clic de frénésie ne lave qu'une assiette, et une carte ocellée ne fait pas la plonge.**
Rien de ce qui multiplie la ferme ne s'applique à l'évier.

C'est la conséquence directe de ce qu'est la plonge : une punition rattrapable. Laisser la
frénésie doubler les assiettes reviendrait à récompenser l'erreur chez le joueur le mieux
équipé, et laisser l'ocellé les laver reviendrait à ce que l'erreur ne coûte rien du tout à
qui a déjà un album. La punition doit être la même pour tout le monde, sinon elle n'en est
plus une pour personne.

Elle porte aussi une règle plus large, à retenir pour la suite : **la plonge est un geste, pas
une production.** Tout ce qui multiplie la ferme s'arrête à la porte de la cuisine.

#### Ce qui reste à trancher

- **Le seuil exact.** « Moins que l'œuf le moins cher » vaut toujours l'œuf commun, quel que
  soit le réglage de l'acheteur : c'est le prix plancher du jeu.
- **Ce que la scène montre.** La pile d'assiettes prend la place du sujet, et le compte
  descend. C'est le seul écran du jeu où le clic ne fait pas grandir quelque chose.
- **Ce que la professeure en dit.** C'est un moment de tutoriel évident, et elle n'a pas
  encore de scène pour les mauvais jours.
- **Les compteurs.** Une assiette est un clic du joueur : elle compte dans « clics donnés ».
  Un compteur d'assiettes lavées serait un joli aveu à laisser dans les statistiques.
- **Hors ligne : non.** Même raison que le bonheur — c'est une main qui travaille, et une main
  ne travaille pas quand on dort.

#### Les trois sorties écartées, et pourquoi

- **Le filet muet** — la boutique refuse l'achat qui condamne. La moins chère et la plus sûre,
  mais elle grise un bouton sans rien expliquer et retire au joueur une décision qu'il avait
  le droit de prendre. Reste en réserve si la plonge tarde.
- **L'œuf de secours** — un œuf offert quand on n'a plus rien. Une ligne, aucun système. Mais
  un cadeau qui tombe du ciel ne se raconte pas, et le jeu a toujours préféré une règle à une
  exception.
- **Le prêt** — le plus intéressant sur le papier, et le plus dangereux : **une dette peut
  fabriquer une impasse pire que celle qu'elle répare**, sans bête ET endetté. Il pourra
  revenir plus tard comme vraie mécanique d'économie, jamais comme filet de sécurité.

**La règle qui vaut au-delà de ce choix :** un idle ne doit jamais pouvoir se rendre
injouable. C'est la seule faute dont un joueur ne revient pas, et elle ne se rattrape pas par
un bon équilibrage ailleurs.

### Ce qui se livre en petit paquet

**La fusion** est presque gratuite : le champ `palier` existe déjà sur chaque capsule et
la table `PALIERS` est écrite. Une question y reste ouverte — est-ce que le palier 4
transforme un cadran en *règle* (+1 enclos, +1 clic automatique) plutôt qu'en plus gros
pourcentage ? Une règle se raconte, un pourcentage s'oublie.

**Le socle de la pension est l'atome** : emplacements, parents, durée, œuf et rente
suspendue tombent ensemble ou ne tombent pas. Retirer n'importe lequel des cinq laisse un jeu
incohérent — une pension sans rente suspendue est gratuite, une pension sans plafond de
réserve déborde à la première absence.

**Les cinq sont écrites depuis la 2.23.0, et la porte est SCELLÉE depuis la 2.24.1** —
`PENSION_OUVERTE` est une constante que même le banc ne peut pas forcer.

**Elle ne s'ouvrira pas avant le bestiaire.** C'est l'ordre qui compte ici : la compatibilité
demande des étiquettes posées sur des lignées dont dix-sept n'ont pas encore de dessin, et
l'hérédité vise les merveilleuses, une cinquième rareté qui n'existe pas du tout. Ouvrir avant
reviendrait à régler une mécanique sur un bestiaire qui va changer sous elle — et un cycle
qu'on peut faire tourner est un cycle qu'on finit par croire réglé.

Ce qu'il restera à faire le jour venu tient en quatre choses : finir les dessins, poser le
plafond de la réserve d'œufs, écrire l'écran qui désigne deux bêtes, et remplacer les deux
bouchons `distanceDe` et `oeufDe` par la compatibilité et l'hérédité.

### Le chantier parallèle : les dessins

**17 lignées sur 27 n'ont pas de dessin** — les dix rares (loup, méduse, salamandre,
serpent, araignée, cerf, ours, papillon, tortue, chat), les quatre épiques (kraken, golem,
sphinx, cheval) et les trois mythiques (chimère, béhémoth, ouroboros). Ce n'est pas une
version, c'est une voie de fond qui avance entre les autres. Rien n'en dépend, tout en
bénéficie.

C'est aussi **la seule partie du prototype qui ne sera pas jetée** : `game.js` partira à la
poubelle au jalon 1, les PNG resteront tels quels dans le vrai jeu. Chaque heure passée là est
acquise, contrairement à tout le reste.

Les 28 fiches de `prompts/` portent chacune le brief, la commande de découpe et la ligne à
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

### Deux pièges de migration à ne pas oublier

Les nouvelles teintes s'ajoutent **à la fin** de `TINTS`. Une bête stocke sa teinte par
indice ; en insérer une au milieu repeindrait tout le bestiaire déjà éclos.

La réserve d'œufs doit prendre son plafond **avant** la pension, pas après. C'est le seul
frein du hors-ligne, et une partie qui tourne déjà sans lui rentrera sur cinquante œufs le
jour où on l'ajoutera. La 2.14.0 a rendu ce piège plus pressant : la réserve se vide
maintenant toute seule dans les incubateurs libres, donc un stock énorme se convertit sans
qu'on ait à cliquer.

---

## L'outillage

Le projet n'ouvre jamais de navigateur. Tout ce qui n'est pas lu à l'œil passe par le banc
d'essai, qui a longtemps vécu dans un dossier temporaire et se refabriquait de mémoire à
chaque session. Il est dans le dépôt depuis la revue de structure.

```
node tools/test.js              les 31 scénarios
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

Les autres outils servent aux dessins : `decouper.py` découpe une planche source en cinq PNG,
`prompt.js` fabrique les fiches de `prompts/`, et `rendu.js` / `formes-*.js` / `styles.js`
sont les restes d'une exploration de formes procédurales abandonnée au profit des PNG.

---

## Le vivier — idées non tranchées

Rien de tout ça n'est décidé : c'est un stock de candidats, pas une file d'attente. Le
raisonnement complet est dans la note [Ce qui manque à
Éclosion](https://claude.ai/code/artifact/5b0057d3-2083-44dc-933c-b9da51b648cd) ; ce qui suit
est ce qu'il faut avoir en tête pour choisir.

| L'idée | Ce que ça règle | Coût |
|---|---|---|
| **Les fonds** | dix-sept lignées manquent, et huit fonds habilleraient les 135 formes | à chiffrer |
| **Trophées** — les douze jalons rendus au jeu | il ne reste plus un seul objectif nommé | une soirée |
| **Filtre de l'enclos par trait** | on chasse un motif que le jeu ne permet pas de chercher | une soirée |
| **Événements courts** | l'éclosion ne surprend plus | deux soirées |
| **Interface au pouce** | un clicker se joue au téléphone, pas au bureau | un week-end |

La 2.24.0 a réglé la moitié « écran bas » du problème — pliage des panneaux et deux ruptures en
hauteur — mais **rien de ce qui touche au doigt** : c'est le sujet de `REFONTE.md`, écrit en
parallèle. Les deux se rejoignent sur `style.css`.

**Les compteurs sont sortis du vivier** : livrés en 2.19.0, sous le bouton `📊`.

**L'export / import est sorti du vivier** : livré en 2.17.0. La partie se télécharge en
fichier ou se copie en texte, et se relit dans l'autre sens — avec un résumé de ce que le
fichier contient affiché *avant* d'écraser quoi que ce soit, parce que le vrai risque de la
restauration n'est pas de rater le geste, c'est de restaurer le mauvais fichier.

**La frénésie de clic est sortie du vivier** : livrée en 2.16.0, sous une forme plus douce que
prévu. Elle ne s'achète pas et ne se déclenche pas — une bête qu'on garde en scène l'offre
d'elle-même, tous les quatre à cinq cents secondes de présence, et ne double que le clic. Neuf
pour cent du temps à ×2, mesuré : c'est un cadeau, pas une amélioration.

### Les fonds — à développer

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

- **À quelle fréquence il tombe.** « Rare » reste à chiffrer : quelque part entre la teinte
  (une bête sur deux en a une) et le chromatique (une sur 8 192). Le bon repère est sans doute
  le motif — huit possibilités, tirées à l'éclosion.
- **Ce que « un peu plus cher » veut dire.** L'échelle existe déjà : la teinte va de ×1,10 à
  ×1,20. Un fond dans cette fourchette s'intègre sans rien déranger ; au-delà il faudrait
  reprendre l'équilibrage des variantes en entier.
- **Le fond et le motif ne font pas le même métier.** Le motif décide de l'EFFET d'une carte,
  le fond de sa VALEUR. Les deux peuvent coexister sur la même bête sans se marcher dessus,
  mais la carte d'album devra montrer les deux sans devenir illisible.
- **L'hérédité.** Elle attend la pension, donc les quatre issues de l'hérédité des teintes.
  Le fond suivra la même règle, quelle qu'elle soit : c'est une raison de plus de ne pas
  écrire l'hérédité des teintes à la légère.

#### Le piège de migration, le même que pour les teintes

Une bête stockera son fond **par indice**. Les nouveaux fonds s'ajoutent donc **à la fin** de
la table, jamais au milieu : en insérer un redécorerait tout le bestiaire déjà éclos. C'est
exactement la règle qui protège déjà `TINTS` et `MOTIFS`, et elle a déjà failli être oubliée
une fois.

### Le diagnostic en trois phrases

**Le jeu se souvient, depuis la 2.19.0.** Dix-sept compteurs cumulés sur la vie du fichier,
qui traversent l'ascension. Ce qui manque encore, ce sont des objectifs à leur accrocher : un
nombre qui monte sans que rien ne l'attende reste un nombre.

**Il n'a plus un seul objectif nommé.** Les douze jalons ont disparu en 2.2.0 quand les jetons
ont pris leur place. Ils sont écrits, gradués, et inutilisés.

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

- **Une cinquième rareté avant la pension.** La merveilleuse tient sa valeur du fait qu'elle
  ne s'achète pas ; la mettre en boutique la viderait de son sens.
- **De nouvelles lignées au-delà des vingt-sept.** L'ère rare a été portée à dix en 2.3.0
  parce qu'elle se répétait ; les épiques et les mythiques, elles, se traversent trop vite
  pour que le compte se voie. Au-delà, le contenu qui manque n'est pas le nombre de lignées,
  c'est le nombre de dessins — dix-sept sur vingt-sept n'en ont pas.
- **Un deuxième axe de prestige.** Le premier cycle n'a pas encore été rejoué *après* une
  ascension. Empiler un second prestige avant de savoir si le premier donne envie de
  recommencer est la façon classique dont un idle devient illisible.
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

La sortie est choisie et reste à écrire : c'est
[la plonge](#sortir-de-limpasse--la-plonge), une pièce par assiette lavée. Un idle ne doit
jamais pouvoir se rendre injouable — c'est la seule faute dont un joueur ne revient pas.

**Rien de visuel n'a jamais été vérifié.** C'est la dette qui grossit le plus vite : l'album,
l'écran d'ascension, le sélecteur de lots, la boîte de dialogue, les trois colonnes d'axes, la
ligne du bonheur — tout ce CSS n'a été relu qu'à l'œil, dans le code. Le banc d'essai ne met
rien en page et ne le dira jamais. Une demi-heure passée à ouvrir la page pour de vrai
vaudrait plus que dix scénarios de plus.

**L'ascension ne donnait pas envie**, et la 2.20.0 attaque la moitié qu'on savait nommer : ses
récompenses étaient huit pourcentages, invisibles au moment précis où elles devraient
convaincre — le début du cycle suivant, avec un œuf et zéro pièce. L'ocellé et le perlé se
voient à la première seconde. Reste à jouer un cycle entier pour savoir si ça suffit.

**Ce qu'on ne sait toujours pas de l'ascension**, c'est si elle donne envie de recommencer.
Elle a été jouée plusieurs fois — c'est comme ça que cinq de ses défauts sont sortis, de
l'écran vide au mauvais choix de carte — donc la mécanique tient. Mais « est-ce qu'on veut
recommencer ? » ne se répond pas en sautant une fois : il faut jouer le cycle d'après, et voir
si l'album qu'on emporte change quelque chose à la façon dont on rejoue.

**La mesure du rythme est périmée deux fois.** « Ère rare à 3 h 34 » date d'avant la baisse
des prix de la 1.5, et la montée d'un cran passée à 1/1 000 en 2.2.2 l'a déplacée encore : le
changement d'ère ne se fait plus par coup de chance mais uniquement par la bourse. Elle ne se
déduit d'aucune division — le revenu n'est pas constant sur trois heures et demie — et demande
une nouvelle simulation. C'est elle qui dira si le premier jeton tombe bien vers deux heures.

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
