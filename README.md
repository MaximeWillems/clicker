# Éclosion — jalon 0

Prototype jouable du clicker d'élevage. **Site statique pur** : trois fichiers, aucune
dépendance, aucun build, aucun serveur applicatif. La partie est sauvegardée dans le
`localStorage` du navigateur.

> Ce code est un prototype de sensation, pas une fondation. Son seul but est de répondre à
> une question : est-ce que les dix premières minutes sont agréables ? Le vrai jeu aura un
> serveur qui fait autorité, et ce fichier `game.js` sera jeté.

## Lancer en local

Ouvrir `index.html` directement dans le navigateur suffit. Pour servir proprement :

```bash
python -m http.server 5291
```

## Déployer

N'importe quel hébergement statique convient — GitHub Pages, Netlify, Cloudflare Pages,
ou un simple dossier derrière nginx/Apache. Pas de build, pas de variables d'environnement :
il suffit de publier la racine du dépôt.

La page porte déjà `<meta name="robots" content="noindex, nofollow">`, elle ne sera donc pas
indexée par les moteurs de recherche. Elle reste accessible à qui connaît l'URL — ce n'est
pas une protection, juste une discrétion suffisante pour un test privé.

## Ce qui est dans le jalon 0

- 19 lignées et leurs 95 formes, du têtard à l'Ouroboros éternel
- **Variantes** : teinte, motif, tempérament, et un prodige sur cinq cents
- **Quatre raretés** et trois sortes d'œufs, dont un coup de chance possible dès la première minute
- Œuf → clic → éclosion → croissance → **vendre ou faire évoluer**
- **Rien n'avance tout seul au départ** : seul le clic fait éclore et grandir. Le temps ne se
  met à travailler qu'une fois les automatisations achetées
- **Rien ne se nourrit contre des pièces** : une bête grandit au clic et au temps, jamais à
  l'argent. Un adulte continue de grossir indéfiniment
- Incubateurs et enclos, à prix croissant
- Sept améliorations : force du clic, couveuse, éleveur, acheteur, mangeoire, marchand, évolution
- Progression hors ligne, plafonnée à 24 h — et seulement pour ce qui est automatisé
- Collection des 25 formes découvertes

Absent volontairement : gènes, reproduction, fusion, lignées cachées, comptes, marché entre
joueurs. Tout cela demande le serveur.

## Boutons de test (en haut à droite)

| Bouton | Effet |
|---|---|
| `×1` | Cycle ×1 → ×10 → ×100. Accélère toute la simulation pour tester une progression complète en quelques minutes. |
| `♪` | Coupe le son. |
| `⟲` | Efface la partie et repart de zéro. |

## Équilibrage

Toutes les valeurs sont regroupées en haut de `game.js`, entre les commentaires
« Données ». Rien n'est en dur ailleurs. Les chiffres actuels sont un point de départ
crédible, pas une vérité — ils sont faits pour être retouchés en jouant.

| Palier | Croissance | Coût d'évolution | Valeur |
|---|---|---|---|
| 1 | 45 s | — | 40 |
| 2 | 3 min | 200 | 500 |
| 3 | 15 min | 3 000 | 6 000 |
| 4 | 1 h | 40 000 | 80 000 |
| 5 | 6 h | 600 000 | 1 500 000 |

### Raretés

Deux axes indépendants, à ne pas confondre : le **palier** est la progression d'une bête au
fil de sa vie, la **rareté** est la lignée dont elle est issue et ne change jamais. Le palier,
c'est le travail ; la rareté, c'est la chance.

| Rareté | Lignées | Valeur | Adulte palier 1 → palier 5 |
|---|---|---|---|
| commune | crapaud, poisson, lézard, oiseau, crocodile | ×1 | 40 → 1 500 000 |
| rare | salamandre, serpent-plume | ×3 | 120 → 4 500 000 |
| épique | kraken, golem | ×10 | 400 → 15 000 000 |
| mythique | chimère, béhémoth | ×40 | 1 600 → 60 000 000 |

**Le coût d'évolution ne dépend pas de la rareté.** Monter une mythique au palier 5 coûte les
mêmes 643 200 pièces qu'une commune et en rapporte quarante fois plus : une lignée rare n'est
pas un lot à encaisser, c'est un investissement qui ne paie que si on la mène au bout.

### Les quatre œufs

Un œuf par rareté. Chacun donne surtout la sienne, avec une **chance de tomber au-dessus qui
grandit avec le prix** — 3,5 % pour un commun, 12 % pour un rare, 25 % pour un épique.
L'œuf mythique n'a rien au-dessus de lui : il garantit.

| Œuf | Prix | commune | rare | épique | mythique | chance de monter |
|---|---|---|---|---|---|---|
| Œuf commun | 12 | 96,5 % | 3 % | 0,45 % | **0,05 %** | 3,5 % |
| Œuf rare | 3 000 | — | 88 % | 10 % | 2 % | 12 % |
| Œuf épique | 40 000 | — | — | 75 % | 25 % | 25 % |
| Œuf mythique | 200 000 | — | — | — | 100 % | — |

L'œuf commun garde sa chance sur deux mille de donner une mythique : le coup de chance doit
rester possible dès la première minute, c'est ce qui rend chaque éclosion tendue. Les œufs
chers n'achètent pas la possibilité, ils achètent la **régularité**.

L'œuf mythique est volontairement plus cher que son espérance : passer par des œufs épiques
revient à 160 000 par mythique contre 200 000 pour la garantie. On paie 25 % de prime pour
supprimer la variance, ce qui est le bon prix d'une certitude.

### Un œuf cher est un investissement, pas un lot

**Tous les œufs payants se remboursent au palier 3, jamais avant.** Une mythique payée
200 000 ne vaut que 1 600 à l'âge adulte de son premier palier — la vendre là serait ruineux.

| Œuf | p1 | p2 | **p3** | p4 |
|---|---|---|---|---|
| commun (12) | +28 | +288 | +2 788 | +36 788 |
| rare (3 000) | −2 880 | −1 700 | **+11 800** | +193 800 |
| épique (40 000) | −39 600 | −35 200 | **+16 800** | +716 800 |
| mythique (200 000) | −198 400 | −180 200 | **+36 800** | +2 956 800 |

C'est la mécanique voulue : ce qu'on achète avec un œuf cher, c'est le droit d'investir, pas
un gain immédiat. Elle demande de rester attentif, et c'est très bien — mais elle ne doit
jamais être **silencieuse**. Deux garde-fous :

- Chaque bête retient **le prix de l'œuf dont elle sort**. Tant qu'elle vaut moins que lui, la
  scène l'annonce en rouge — « son œuf a coûté 200 000, elle en vaut 1 600, elle le
  remboursera au palier 3 » — et le bouton *Vendre* passe en rouge.
- **Le marchand automatique ne touche qu'aux communes par défaut.** Un troisième réglage
  élargit sa portée rareté par rareté ; tant qu'on ne le fait pas, il ne peut pas brader un
  mythique à 1 600. Le réglage prévient quand on lui ouvre les mythiques.

La lignée est tirée **à la mise en couvaison**, pas à l'éclosion — c'est ce qui permet de
recalculer une absence sans rejouer le hasard. Le joueur, lui, ne la découvre qu'à l'éclosion,
et une lignée non commune déclenche gerbe, accord et mise en scène immédiate.

**L'acheteur automatique se règle** sur la sorte d'œuf à racheter. Il écoule d'abord la
réserve, en commençant par les plus rares — un œuf cher acheté exprès ne doit pas dormir en
stock — puis rachète la sorte demandée. S'il n'a pas de quoi la payer il laisse l'incubateur
vide : rabattre sur du commun trahirait la consigne.

### Variantes

Une variante est une **identité**, tirée à l'éclosion et gardée à vie — contrairement à la
taille, qu'une évolution remet à zéro. C'est ce qui en fait une collection, et le brouillon
direct des gènes du jalon 4 : le jour où la reproduction arrive, tout ça s'hérite.

**La teinte** est la seule qui se voit. Un `filter: hue-rotate()` recolore vraiment l'emoji,
ce qui multiplie le bestiaire visible sans un seul dessin — et règle le problème des lignées
où les cinq formes partagent le même glyphe.

| Teinte | Fréquence | Valeur |
|---|---|---|
| ordinaire | 52 % | ×1 |
| cendré | 11,5 % | ×1,10 |
| écarlate / azur | 9,5 % chacun | ×1,15 |
| jade | 7 % | ×1,20 |
| améthyste | 5 % | ×1,25 |
| doré | 3 % | ×1,30 |
| albâtre | 1,6 % | ×1,40 |

**Le prodige** ignore la lignée : une bête sur cinq cents naît *chromatique*, quelle que soit
sa rareté — on peut avoir un têtard chromatique. Halo doré battant, valeur **×5**, et elle
naît **protégée d'office** : perdre une bête sur cinq cents parce qu'un automate l'a vendue
avant qu'on l'ait vue serait impardonnable.

**Le tempérament** ne se lit qu'en texte, mais il agit : `grow` raccourcit la croissance,
`fat` accélère l'engraissement. Docile (neutre), nerveux (croissance ×1,25 / engraissement
×0,85), placide (l'inverse), glouton (engraissement ×1,4), farouche, rêveur. L'effet est
confiné à la phase de croissance — la durée de référence des rangs de taille reste celle du
palier, sinon un tempérament vif cumulerait deux bonus.

**Le motif** — uni, tacheté, rayé, moucheté, marbré, tigré, zébré, constellé — n'a aucun
effet. C'est de l'identité pure : « un Ouroboros chromatique doré marbré placide » se
reconnaît entre mille.

### Garder une bête

Le bouton **☆ Garder** met une créature hors de portée des automates : ni vendue par le
marchand, ni faite évoluer — évoluer lui ferait perdre sa taille. La mangeoire continue de
l'engraisser, elle. Le bouton *Vendre* se verrouille tant qu'elle est gardée.

Ce que ça coûte est une place d'enclos immobilisée, et c'est tout l'intérêt : on choisit de
continuer l'aventure avec une bête plutôt que de la faire entrer dans la chaîne.

### Automatisations

Le jeu commence entièrement à la main : un œuf ne couve pas et une créature ne grandit pas
tant qu'on ne clique pas dessus.

**Les compteurs suivent une règle unique** : des secondes quand quelque chose fait avancer la
chose tout seul, des clics sinon — annoncer « 15 s » alors que rien ne s'écoule serait un
mensonge. Quand les deux valent, ils s'affichent ensemble : `15 s ou 15 clics`. Le raccourci
au clic disparaît au-delà de soixante clics, là où marteler ne sert plus à rien.

La règle vaut aussi pour un adulte qui s'engraisse : `33 clics → grand` sans mangeoire,
`17 s ou 33 clics → grand` avec.

Les deux premiers achats n'accélèrent pas la partie, ils **mettent le temps au travail** —
c'est le moment précis où le jeu bascule de clicker à idle.

Quatre améliorations sur sept se montent **niveau par niveau, sans plafond**. Le prix du
prochain niveau vaut `base × mult^niveau` : l'effet monte linéairement pendant que le prix
double presque, donc chaque palier se mérite et les rendements décroissent d'eux-mêmes.

| Amélioration | Base | Mult. | Effet au niveau *n* |
|---|---|---|---|
| Force du clic | 60 | ×1,6 | *n*+1 secondes de vie par clic |
| Couveuse automatique | 120 | ×1,9 | ×*n* sur la vitesse de couvaison |
| Éleveur automatique | 500 | ×1,9 | ×*n* sur la vitesse de croissance |
| Acheteur automatique | 2 000 | — | achat unique |
| Mangeoire automatique | 6 000 | ×2,0 | *n*×2 s d'engraissement par seconde |
| Marchand automatique | 15 000 | — | achat unique |
| Évolution automatique | 50 000 | — | achat unique |

L'échelle est calée pour qu'une partie **bascule en pilote automatique en une demi-heure**
plutôt qu'en une heure et demie. Simulation d'un joueur cliquant quatre fois par seconde,
achetant toujours l'option la moins chère à sa portée et menant ses bêtes au palier 3 :
couveuse à 1 min, éleveur à 6 min, acheteur à 14 min, mangeoire à 24 min, marchand à 35 min.
Aux anciens prix, le marchand tombait à 78 min.

**L'éleveur et la mangeoire se partagent la vie de la bête** : l'éleveur pousse les jeunes
jusqu'à l'âge adulte, la mangeoire prend le relais et engraisse les adultes. Aucune des deux
ne dépense de pièces.

**Le marchand attend deux conditions : le palier et la taille.** Sans la seconde il vendait
tout dès l'âge adulte, et la mangeoire n'avait jamais le temps d'engraisser quoi que ce soit :
les deux automates se marchaient dessus. On règle donc « jusqu'au palier N » **et** « pas
avant la taille R ». Au palier 1 : vendue tout de suite elle rapporte 40, à *grand* 52 après
18 secondes, à *énorme* 68 après 59 secondes.

**L'évolution passe avant la vente**, pour qu'une bête qu'on peut faire monter ne parte jamais
au prix de son palier actuel. L'enchaînement complet se règle donc en trois cases — évoluer
jusqu'au palier 3, engraisser jusqu'à *énorme*, vendre — et la ferme tourne seule : couver,
élever, faire monter, engraisser, vendre, racheter.

La force du clic vaut aussi pour l'engraissement d'un adulte, et les compteurs en tiennent
compte : « 2 clics » plutôt que « 15 clics » une fois le clic monté à 7 secondes.

Les sauvegardes d'avant les niveaux sont converties au chargement : `true` devient niveau 1.

La progression hors ligne suit la même règle : sans couveuse ni éleveur, une absence ne
produit rien, et le bandeau de retour ne s'affiche pas.

### Interface

L'écran n'a **qu'un seul sujet à la fois**, en grand au centre : l'œuf qu'on fait éclore ou
l'animal qu'on fait grandir. C'est lui qu'on clique. La bande en dessous liste les autres
œufs et créatures en vignettes ; on clique une vignette pour la mettre en scène.

**La scène suit l'animal, jamais l'œuf.** Acheter un œuf, le placer, le voir arriver par
l'acheteur automatique ou en voir un autre éclore ne détourne jamais le regard de la bête en
cours d'élevage. Quand la bête en scène est vendue, c'est une autre bête qui prend le relais
— la plus avancée, celle qui demande une décision. Un œuf ne passe au premier plan que s'il
n'y a plus rien de vivant à regarder, et c'est alors le plus avancé.

Dès que la couveuse automatique est achetée, les œufs cessent d'être le sujet : les créatures
passent devant eux dans la bande, pour rester à portée de clic même avec dix incubateurs.

**La page ne défile jamais** sur écran large : elle occupe exactement la fenêtre, et seules les
deux colonnes défilent en interne. Ce n'est pas cosmétique — une barre de défilement rend le
martèlement à la **barre espace** impraticable, puisque l'espace ferait avancer la page au
lieu de cliquer. L'espace est d'ailleurs branché sur la scène, avec `preventDefault`, sauf
quand le focus est sur un vrai contrôle : un menu déroulant garde son comportement normal, et
se relâche après usage pour ne pas détourner les touches suivantes. Sur mobile la page défile
normalement — le clavier n'y est pas le sujet.

**Les réglages ont leur propre panneau**, séparé des sept boutons d'amélioration sous lesquels
ils étaient noyés. Ils y sont présentés comme la chaîne qu'ils forment vraiment :
1 · l'acheteur rachète, 2 · l'évolution fait monter, 3 · le marchand vend. Le panneau
n'apparaît que lorsqu'on possède au moins un automate à régler, et la consigne du marchand
affiche sa conséquence en clair plutôt que de la laisser deviner.

### Étapes de vie

Une créature traverse cinq états visibles, et l'échelle est **continue** — elle grossit à
chaque clic plutôt que de sauter d'un cran à l'autre.

| État | Quand | Échelle | Valeur | Silhouette |
|---|---|---|---|---|
| œuf | en couvaison | 0,80 → 1,05 | — | 🥚, halo qui bat après 65 % |
| enfant | 0 – 40 % de la croissance | 0,50 | 15 % | forme juvénile |
| adolescent | 40 – 100 % | 0,50 → 1,00 | 40 % | forme juvénile |
| adulte | croissance terminée | 1,00 | 100 % | forme définitive |
| adulte grand… | engraissement | jusqu'à 1,50 | 130 % → 450 % | forme définitive |

**La valeur est plate à l'intérieur d'une étape et saute d'un coup au passage.** Au palier 1 :
6 pièces pendant toute l'enfance, puis **16 sur le clic qui fait passer adolescent** (×2,7),
puis **40 sur celui qui fait passer adulte** (×2,5). C'est ce clic-là qui paie, pas les
quarante d'avant — et la barre de progression vise la prochaine étape, plus l'âge adulte.

Vendre est possible à toute étape, au prix de l'étape. Ça ne devient jamais une stratégie :
0,19 pièce par clic en vendant un enfant, 0,27 un adolescent, 0,67 en menant la bête à terme.
C'est une porte de sortie quand un enclos bloque. Le marchand automatique, lui, n'achète que
des adultes — brader un juvénile ne doit jamais arriver tout seul.

Les rangs de taille comptent aussi comme des étapes : au palier 1, *grand* tombe à 32 clics
après l'âge adulte, *énorme* à 115, *colossal* à 433.

Le tout est multiplié par l'échelle du palier (×1 à ×1,5), donc un nouveau-né de palier 1
fait 0,50 et un légendaire engraissé 2,25 : un rapport de 4,5 entre les deux extrêmes.

**La forme juvénile d'une créature est la forme précédente de sa propre lignée.** Une wyverne
grandit en lézard puis devient wyverne ; un léviathan grandit en serpent de mer puis devient
dragon. C'est le moment fort du jeu, et ça ne coûte **aucun dessin supplémentaire** — le
budget graphique reste à 25 illustrations, une par forme.

Chaque forme est déclarée `[nom, glyphe adulte, glyphe juvénile]` en haut de `game.js`. La
lignée du crapaud est la seule où les emoji n'offrent aucune variante : c'est là que de vrais
dessins manquent le plus.

### Croissance sans fin

Un clic vaut toujours **une seconde de vie**, avant comme après l'âge adulte : l'animal ne
cesse jamais de grandir. Ce qui s'essouffle, c'est le rendement — la taille suit un
logarithme, donc chaque rang coûte bien plus cher que le précédent.

**Le seuil d'un rang est aussi son multiplicateur de valeur**, et la valeur reste plate entre
deux rangs : comme pour les juvéniles, c'est le clic qui franchit le rang qui paie.

| Rang | À partir de | Valeur | Clics au palier 1 | Vente (base 40) |
|---|---|---|---|---|
| adulte | ×1,00 | ×1,00 | — | 40 |
| adulte grand | ×1,30 | ×1,30 | 33 | 52 (+30 %) |
| adulte énorme | ×1,70 | ×1,70 | 116 | 68 (+31 %) |
| adulte colossal | ×2,30 | ×2,30 | 434 | 92 (+35 %) |
| adulte titanesque | ×3,20 | ×3,20 | 2 412 | 128 (+39 %) |
| adulte démesuré | ×4,50 | ×4,50 | ~28 000 | 180 (+41 %) |

La barre de progression vise le rang suivant une fois l'animal adulte, et l'animal grossit
vraiment à l'écran — jusqu'à `SIZE_VIS` (×1,5) de grossissement visuel, cumulé avec l'échelle
du palier, soit ×2,25 au maximum.

### Engraissement

Une bête ne se nourrit **jamais contre des pièces** : elle grandit au clic et au temps. Un
adulte continue donc de grossir indéfiniment, gratuitement, et sa valeur monte de rang en
rang (`OVER_GAIN`, rendement logarithmique).

Ce que coûte un animal énorme n'est pas de l'argent mais **du temps et une place d'enclos** :
une bête qu'on engraisse est une bête qu'on ne vend pas, et l'enclos qu'elle occupe ne
produit rien pendant ce temps. Au palier 1, avec une mangeoire de niveau 1 :

| Rang atteint | Temps d'engraissement | Valeur | Rendement de l'enclos |
|---|---|---|---|
| grand | 16 s | 40 → 52 | 0,75 pièce/s — **mieux que recycler** |
| énorme | 58 s | 52 → 68 | 0,48 pièce/s |
| colossal | 217 s | 68 → 92 | 0,24 pièce/s |
| titanesque | 1 206 s | 92 → 128 | 0,07 pièce/s |

À comparer aux 0,67 pièce/s d'un enclos qui enchaîne les bêtes jusqu'à l'âge adulte et les
vend. Il existe donc une fenêtre étroite où engraisser jusqu'à *grand* bat le recyclage, et
tout ce qui va au-delà est du plaisir payé en temps. C'est une vraie décision, et elle se
règle par le marchand automatique : allumé il vend avant que la mangeoire ait le temps
d'agir, éteint il laisse grossir.

Un garde-fou reste nécessaire : **l'évolution remet la taille à ×1.** Sans ça, engraisser au
palier 1 puis évoluer rapporterait des dizaines de fois la mise, la valeur montant ×12 par
palier quand la croissance ne monte que ×4. Le bouton *Évoluer* passe en rouge quand la
créature a de la valeur à perdre.

## À vérifier en jouant

1. La première évolution tombe-t-elle avant la dixième minute ?
2. Le clic est-il agréable, ou juste fonctionnel ?
3. Le choix vendre / faire évoluer est-il une vraie hésitation, ou la réponse est-elle
   toujours évidente ?
4. À quel moment s'ennuie-t-on ?

Les créatures sont des emoji : ce sont des placeholders assumés, en attendant les 25 dessins.
