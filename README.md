# Éclosion — jalon 0

Prototype jouable du clicker d'élevage. **Site statique pur** : trois fichiers, aucune
dépendance, aucun build, aucun serveur applicatif. La partie est sauvegardée dans le
`localStorage` du navigateur.

> Ce code est un prototype de sensation, pas une fondation. Son seul but est de répondre à
> une question : est-ce que les dix premières minutes sont agréables ? Le vrai jeu aura un
> serveur qui fait autorité, et ce fichier `game.js` sera jeté.

## Version

Le numéro s'affiche en haut à gauche, à côté du nom. Il n'est écrit qu'une seule fois dans
tout le projet — `VERSION`, en haut de `game.js` — et la page le recopie au démarrage.

    alpha MAJEUR.MINEUR.CORRECTIF          aujourd'hui : alpha 2.3.2

| Nombre | Ce qui le fait monter | Exemple |
|---|---|---|
| **correctif** | un sprite de plus, un bug corrigé, un chiffre d'équilibrage retouché | 1.0.0 → 1.0.1 |
| **mineur** | une nouveauté franche, mais qui tient dans le jeu tel qu'il est | 1.0.1 → 1.1.0 |
| **majeur** | un morceau de jeu qui n'existait pas, et qui rebat les cartes du reste | 1.1.0 → 2.0.0 |

Un nombre qui monte remet à zéro ceux qui le suivent. On le change **dans le commit qui
apporte la modification**, jamais après coup : c'est ce qui permet de savoir, devant une page
laissée ouverte, si elle est à jour ou s'il faut la recharger.

Le mot **alpha** reste devant tant que le jeu n'est pas sorti. Ce n'est pas un quatrième
nombre : `alpha 2.0.0` est toujours une alpha.

À ne pas confondre avec le `v` de la sauvegarde (`v: 8` aujourd'hui), qui numérote le *format*
des données rangées dans le navigateur et ne bouge que lorsque ce format change. Les deux
avancent à leur rythme : `alpha 1.2.0` n'a pas touché au format, `alpha 1.3.0` l'a fait passer
de 4 à 5.

### Ce qui est sorti

| Version | Ce qu'elle apporte |
|---|---|
| **2.3.2** | un brief de séance, pour générer plusieurs planches d'affilée sans dérive de style |
| 2.3.1 | les prompts d'illustration des six nouvelles rares |
| 2.3.0 | six lignées rares de plus — l'ère rare passe de 4 à 10 lignées |
| 2.2.3 | un jeton dépensé = un emplacement de carte — il en offrait trois avant le premier saut |
| 2.2.2 | la montée d'un cran passe à **1 sur 1 000**, la même à toutes les raretés |
| 2.2.1 | le marchand automatique garde la case, comme une vente à la main |
| 2.2.0 | l'ascension se paie en **jetons**, gagnés à chaque palier de fortune ×1 000 000 |
| 2.1.1 | la couveuse n'a plus de plafond — l'œuf mythique couve quarante-cinq minutes |
| 2.1.0 | les améliorations s'achètent par lots — ×1, ×10, ×100 ou *max* |
| 2.0.6 | le chromatique passe de 1 sur 500 à **1 sur 8 192** — un coup de chance, plus une variante fréquente |
| 2.0.5 | le marchand n'a plus d'exception : il vend aussi la bête en scène, ☆ *Garder* restant la seule protection |
| 2.0.4 | le crabe entre en jeu — ses cinq dessins attendaient depuis août d'être branchés |
| 2.0.3 | le marchand ne vend plus la bête qu'on regarde — la présence se lit sur l'onglet, plus sur les clics |
| 2.0.2 | l'écran d'ascension ne s'affiche plus par-dessus le jeu, et le premier jalon passe au milieu de partie |
| 2.0.1 | les deux derniers âges renommés — *géant* devient *ancien*, *titan* devient *légende* |
| 2.0.0 | **l'album et l'ascension** — les bêtes gardées deviennent des cartes, tout le reste repart |
| 1.5.0 | les œufs payants divisés par deux — chaque ère s'ouvre deux fois plus tôt |
| 1.4.0 | une taille minimale de vente par rareté — engraisser une commune ne rapporte rien, une mythique rapporte des milliards |
| 1.3.0 | un plafond d'évolution par rareté — le péage ne coûte pas la même chose selon la lignée |
| 1.2.0 | le seuil de rentabilité cantonné au début de la vie, le chromatique redescendu à un cran de rareté |
| 1.1.2 | la bête en scène n’est plus protégée pour toujours, seulement dix secondes (retiré en 2.0.5) |
| 1.1.1 | le marchand dit pourquoi il ne vend pas |
| 1.1.0 | les améliorations se montent en tiers de palier |
| 1.0.1 | la jauge ne se laisse plus écraser par la scène |
| **1.0.0** | une seule vie de cent niveaux et cinq âges — le numéro commence ici |

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

- 27 lignées et leurs 135 formes, du têtard à l'Ouroboros éternel
- **Cent niveaux et cinq âges** — enfant, adolescent, adulte, ancien, légende — sur une seule
  vie qui ne repart jamais de zéro
- **Variantes** : teinte, motif, tempérament, et un prodige sur 8 192
- **Quatre raretés** et quatre sortes d'œufs, dont un coup de chance possible dès la première minute
- Œuf → clic → éclosion → niveaux → **vendre, ou payer le péage de l'âge suivant**
- **Rien n'avance tout seul au départ** : seul le clic fait éclore et grandir. Le temps ne se
  met à travailler qu'une fois les automatisations achetées
- **Rien ne se nourrit contre des pièces** : une bête grandit au clic et au temps, jamais à
  l'argent. Une bête mûre continue de grossir indéfiniment
- Incubateurs et enclos, à prix croissant
- Huit améliorations : force du clic, couveuse, éleveur, acheteur, mangeoire, marchand, évolution, intendant
- **Rente** : une bête de l'âge adulte ou plus rapporte toute seule, à proportion de ce
  qu'elle vaut — la seule règle du jeu qui paie pour ne pas vendre
- Progression hors ligne, plafonnée à 24 h — et seulement pour ce qui est automatisé
- Collection des 135 formes découvertes
- **L'album et l'ascension** : les bêtes gardées deviennent des cartes, le motif décide
  du bonus, et tout le reste repart de zéro

Absent volontairement : gènes, reproduction, pension, fusion des cartes, lignées cachées,
comptes, marché entre joueurs. Tout cela demande le serveur, ou attend la pension.

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

### Cent niveaux, cinq âges

**Une bête a une vie et un seul compteur.** Le niveau court de 1 à 100 et ne redescend jamais.
Les cinq âges sont des tranches sur cette échelle, et l'évolution est le **péage** entre deux
tranches : arrivée au dernier niveau de son âge la bête est *mûre*, son niveau se bloque là,
et seul le paiement le débloque.

| Âge | Niveaux | Croissance | Un niveau dure | Valeur par niveau | Péage | Vaut, mûre |
|---|---|---|---|---|---|---|
| enfant | 1 → **15** | 45 s | 3 s | +14 % | — | 40 |
| adolescent | 16 → **35** | 3 min | 9 s | +10,5 % | 200 | 500 |
| adulte | 36 → **65** | 15 min | 30 s | +6,8 % | 3 000 | 6 000 |
| ancien | 66 → **85** | 1 h | 3 min | +10,5 % | 40 000 | 80 000 |
| légende | 86 → **100** | 6 h | 24 min | +14 % | 600 000 | 1 500 000 |

15 · 20 · 30 · 20 · 15, et les péages tombent pile sur 15, 35, 65, 85. Le coût du péage comme
la valeur se multiplient ensuite par la rareté (×25 rare, ×600 épique, ×15 000 mythique) ; les
durées, elles, ne bougent jamais.

**Le temps par niveau triple à chaque âge** — 3 s, 9 s, 30 s, 3 min, 24 min. C'est ce qui fait
que l'enfance défile (trois clics par niveau au tout début, sans rien avoir acheté) pendant que
la légende se mérite. Sans aucune automatisation : mûre à 45 s, adulte à 3 min 45, ancienne à
18 min, légende à 1 h 19, niveau 100 à 7 h 19. C'est exactement le rythme d'avant, redécoupé.

**Chaque niveau paie.** Le multiplicateur de valeur suit une courbe géométrique de 0,15 à 1,00
à l'intérieur de chaque tranche : un niveau vaut donc entre +7 % et +14 % de prix de vente. Il
n'y a plus un seul palier mort, la barre qui se remplit rapporte toujours quelque chose. Les
bornes ne bougent pas — une bête mûre vaut toujours la valeur de son âge, une bête fraîchement
évoluée toujours 15 % de la sienne.

#### Ce que ça corrige

Avant, une bête traversait trois échelles empilées qui racontaient trois histoires
différentes : le palier (1 → 5), l'étape de vie (enfant → ado → adulte) et la taille (grand →
démesuré). Les deux dernières étaient **remises à zéro à chaque évolution**. Le badge affichait
donc `enfant`, `ado`, `p.2`, puis `enfant` à nouveau — et ce n'était pas qu'un mot : la bête
rétrécissait vraiment de moitié à l'écran, jusqu'à ×0,37 si elle avait été engraissée.

Le plus révélateur, c'est que **les dessins disaient déjà le contraire du texte**. Chaque forme
portait un glyphe juvénile qui était exactement le glyphe adulte de la forme précédente (Alevin
🐟 → Carpe 🐟 → Centenaire 🐠 → Serpent 🐍 → Léviathan 🐉), et le code affichait littéralement
le dessin du palier `n − 1` tant que la bête n'était pas adulte. Les images formaient déjà une
seule croissance continue ; seul le vocabulaire bouclait sur lui-même.

Les quatre-vingt-quinze glyphes juvéniles sont partis avec le problème. Une forme par âge, et
la silhouette change **au moment où l'on paie** — pas trois niveaux plus tard.

#### Rien ne recule, jamais

C'est la règle qui tient tout le reste, et elle est vérifiée par construction :

- **le niveau** ne dépend que de la croissance avalée, qui ne fait que monter ;
- **la taille à l'écran** ne se lit ni sur l'âge ni sur l'embonpoint séparément — l'un monte
  au moment où l'autre se dégonfle — mais sur le total de croissance avalé, plus un petit bond
  fixe à chaque évolution pour qu'on voie ce qu'on vient de payer ;
- **la valeur** monte à chaque niveau, et l'évolution la multiplie par 1,8 à 2,8 sur le coup.

L'embonpoint aussi survit désormais à l'évolution. Ça ne donne rien de plus : la taille divise
les secondes de mangeoire par la durée de l'âge **courant**, quatre à six fois plus longue à
chaque cran. Engraisser tôt puis évoluer rend donc exactement ce que les mêmes secondes
auraient rendu plus tard. L'épithète se dégonfle d'elle-même — un *adulte démesuré* fait un
*ancien colossal* — sans qu'on ait à confisquer quoi que ce soit.

### Raretés

**La pyramide compte 27 lignées : 10 communes, 10 rares, 4 épiques, 3 mythiques.** L'ère rare
est passée de quatre à dix en alpha 2.3.0 — les communes avaient été étoffées au fil du temps
pendant que les autres ères restaient à leur compte d'origine, si bien qu'on voyait la même
bête un œuf sur quatre à l'ère rare contre une sur dix à l'ère commune, alors que la rare dure
plus longtemps.

Les six nouvelles — araignée, cerf, ours, papillon, tortue, chat — ont été choisies sur la
**silhouette** et non sur le thème : huit pattes, une ramure, une masse, des ailes larges, une
carapace basse, un félin. Deux lignées qu'on distingue mal en vignette de 32 pixels sont deux
lignées pour le prix d'une.

Deux axes indépendants, à ne pas confondre : l'**âge** est la progression d'une bête au fil de
sa vie, la **rareté** est la lignée dont elle est issue et ne change jamais. L'âge, c'est le
travail ; la rareté, c'est la chance.

Les deux axes sont calés pour **s'enchaîner** plutôt que se concurrencer. Chaque rareté est
une ère, pas un bonus : on épuise ce que les communes peuvent donner avant que les rares
n'ouvrent.

| Rareté | Valeur | Mûre enfant → mûre légende | Coût des quatre péages |
|---|---|---|---|
| commune | ×1 | 40 → 1,5 M | 643 200 |
| rare | ×25 | 1 000 → 37,5 M | 16,1 M |
| épique | ×600 | 24 000 → 900 M | 385,9 M |
| mythique | ×15 000 | 600 000 → 22,5 Md | 9,65 Md |

**Le coût du péage suit la rareté.** C'est le pivot de tout l'équilibrage : sans lui, une rare
tombée par chance atteignait l'âge légende pour le prix d'une commune et court-circuitait toute
la progression.

**Chaque œuf coûte 0,35 bête de l'ère précédente menée au bout** — la même proportion sur les
trois transitions. On ne s'offre donc un œuf rare qu'après avoir mené des communes à la légende,
un épique qu'après des rares, et ainsi de suite.

**Tous les œufs payants se remboursent à l'âge ancien**, jamais avant : une règle unique, quelle
que soit l'ère.

Rythme mesuré sur une partie simulée de quatre heures, joueur cliquant quatre fois par
seconde : couveuse à 2 min, éleveur à 3 min, acheteur à 9 min, mangeoire à 10 min, marchand à
28 min, évolution automatique à 64 min, **ère rare à 3 h 34**.

⚠ Cette mesure date d'**avant la baisse des prix de l'alpha 1.5.0**. L'œuf rare coûtant
désormais 300 000 au lieu de 600 000, l'ère rare s'ouvre nettement plus tôt — mais le chiffre
exact n'a pas été remesuré, et il ne se déduit pas d'une division par deux : le revenu
n'est pas constant pendant les trois heures et demie. À refaire tourner.

### Les quatre œufs

Un œuf par rareté. Chacun donne surtout la sienne, avec une **chance de tomber au-dessus de
1 sur 1 000**, la même à toutes les raretés. L'œuf mythique n'a rien au-dessus de lui : il
garantit.

| Œuf | Prix | Couvaison | commune | rare | épique | mythique | chance de monter |
|---|---|---|---|---|---|---|---|
| Œuf commun | 12 | 30 s | 99,9 % | 0,1 % | — | — | 1 sur 1 000 |
| Œuf rare | 300 000 | 3 min | — | 99,9 % | 0,1 % | — | 1 sur 1 000 |
| Œuf épique | 7,50 M | 12 min | — | — | 99,9 % | 0,1 % | 1 sur 1 000 |
| Œuf mythique | 180 M | 45 min | — | — | — | 100 % | — |

**La couvaison s'allonge avec la rareté.** Une bête précieuse doit se faire attendre, sinon la
rareté n'a pas de poids : un mythique qui éclosait en quinze secondes comme un têtard ne
valait rien à regarder. Ça donne aussi enfin une raison de monter la couveuse — elle divise la
durée par son niveau.

**La couveuse n'a plus de plafond.** Elle s'arrêtait à 5, parce que sur du commun la couvaison
ne pèse qu'un millième du cycle et qu'un incubateur suffit à nourrir vingt enclos. L'argument
ne valait que pour la première ère : un œuf mythique couve quarante-cinq minutes, et c'est la
seule file du jeu qui reste manuelle quand tout le reste est automatisé. Les incubateurs
restent le meilleur achat tant qu'on couve du commun — ils montent en 1,6 par cran au lieu de
1,9 — mais la couveuse redevient le bon levier quand ce qu'on couve est cher.

Débit mesuré, par incubateur et par heure, avec une couveuse de niveau 3 : 327 communs,
59 rares, 14 épiques, 3 mythiques.

**Un œuf ne peut donner que sa rareté ou celle juste au-dessus.** Pas de raccourci : on
n'atteint une mythique qu'avec des œufs épiques, qu'on ne s'offre qu'avec l'argent des rares.
L'œuf mythique, n'ayant rien au-dessus de lui, garantit.

**La montée est passée de 3,5 / 12 / 25 % à 1 sur 1 000.** À l'ancien taux, quatre œufs
épiques suffisaient à sortir une mythique : la montée n'était plus un coup de chance mais la
façon normale de changer d'ère, et l'échelle des prix ne servait à rien. Elle redevient un
cadeau — et **le vrai chemin vers l'ère suivante est la bourse**, pas la loterie : on s'offre
un œuf plus rare quand on peut se le payer.

Ce que ça coûte, et c'est assumé : on ne voit presque plus de montée. Avec 327 œufs communs
par heure et par incubateur, elle tombe une fois toutes les trois heures au lieu d'une fois
toutes les deux minutes.

Les prix suivent la règle des ères : **chaque œuf coûte 0,35 bête de l'ère précédente menée à
l'âge légende**, à l'identique sur les trois transitions. C'est ce qui interdit de sauter une ère.

### Un œuf cher est un investissement, pas un lot

**Tous les œufs payants se remboursent à l'âge ancien, jamais avant.** Une mythique payée 180 M
ne vaut que 600 000 mûre à l'âge enfant — la vendre là serait ruineux.

Résultat net, œuf et péages déduits, à chaque âge mûr :

| Œuf | enfant | adolescent | adulte | **ancien** | légende |
|---|---|---|---|---|---|
| commun (12) | +28 | +288 | +2 788 | +36 788 | +856 788 |
| rare (300 000) | −299 000 | −292 500 | −230 000 | **+620 000** | +21,1 M |
| épique (7,50 M) | −7,48 M | −7,32 M | −5,82 M | **+14,6 M** | +506,6 M |
| mythique (180 M) | −179,4 M | −175,5 M | −138,0 M | **+372,0 M** | +12,7 Md |

### Le rouge se cantonne au début de la vie

Une bête chère passe le plus clair de son existence sous le prix de son œuf : une rare ne le
repasse qu'en pleine tranche ancienne. Un bouton rouge qui reste rouge pendant les trois quarts
d'une vie cesse d'être un avertissement pour devenir un décor — et on finit par vendre à perte
en l'ignorant.

L'alerte se cantonne donc au **début** de la vie, et chaque rareté a droit à un âge de plus
que la précédente : c'est là que la méprise est possible, et seulement là.

| Rareté | enfant | adolescent | adulte | ancien | légende |
|---|---|---|---|---|---|
| commune | vert | vert | vert | vert | vert |
| rare | **rouge** | neutre | neutre | vert | vert |
| épique | **rouge** | **rouge** | neutre | vert | vert |
| mythique | **rouge** | **rouge** | **rouge** | vert | vert |

Le vert tombe pile à l'âge ancien, à toutes les raretés — c'est la règle de remboursement
énoncée plus haut, rendue visible sans un mot.

C'est la mécanique voulue : ce qu'on achète avec un œuf cher, c'est le droit d'investir, pas
un gain immédiat. Elle demande de rester attentif, et c'est très bien — mais elle ne doit
jamais être **silencieuse**. Deux garde-fous :

- Chaque bête retient **le prix de l'œuf dont elle sort**, et le bouton *Vendre* a trois états
  au lieu de deux : **rouge** tant que la méprise est possible, **neutre** quand la bête vaut
  encore moins que son œuf mais qu'on est censé le savoir, **vert** quand la vente rembourse
  vraiment. Le rouge ne dure donc plus toute la vie — voir « Le rouge se cantonne au début »
  plus bas — et il ne s'allume que **si rien n'est prévu pour l'y mener**. Deux façons de ne pas s'alarmer, et elles ne se racontent pas pareil : ou
  la bête est déjà à l'âge qu'il faut et n'a plus qu'à finir de grandir, ou c'est l'évolution
  automatique qui va l'y mener — « son œuf a coûté 180,0 M, ton évolution la mènera à l'âge
  ancien, où elle vaudra 1,20 Md ». Alarmer un joueur qui a tout bien réglé serait le pire des
  deux mondes.
- **Le marchand automatique ne touche qu'aux communes par défaut.** Un troisième réglage
  élargit sa portée rareté par rareté ; tant qu'on ne le fait pas, il ne peut pas brader un
  mythique à 600 000. Le réglage prévient quand on lui ouvre les mythiques.

La lignée est tirée **à la mise en couvaison**, pas à l'éclosion — c'est ce qui permet de
recalculer une absence sans rejouer le hasard. Le joueur, lui, ne la découvre qu'à l'éclosion,
et une lignée non commune déclenche un accord qui la distingue. Elle prend aussi la scène —
mais **seulement si la scène était libre** : voir la règle de l'interface plus bas.

**L'acheteur automatique se règle** sur la sorte d'œuf à racheter. Il écoule d'abord la
réserve, en commençant par les plus rares — un œuf cher acheté exprès ne doit pas dormir en
stock — puis rachète la sorte demandée. S'il n'a pas de quoi la payer il laisse l'incubateur
vide : rabattre sur du commun trahirait la consigne.

### Variantes

Une variante est une **identité**, tirée à l'éclosion et gardée à vie. C'est ce qui en fait une
collection, et le brouillon direct des gènes du jalon 4 : le jour où la reproduction arrive,
tout ça s'hérite.

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

**Le prodige** ignore la lignée : une bête sur **8 192** naît *chromatique*, quelle que soit
sa rareté — on peut avoir un têtard chromatique. Halo doré battant, et elle naît **protégée
d'office** : perdre une bête sur huit mille parce qu'un automate l'a vendue avant qu'on l'ait
vue serait impardonnable.

**La chance est passée de 1 sur 500 à 1 sur 8 192.** À une bête sur cinq cents, le chromatique
tombait toutes les demi-heures sur une ferme automatisée : c'était une variante fréquente, pas
un coup de chance, et on finissait par en vendre. Il redevient quelque chose qu'on raconte, et
qu'on garde.

Deux conséquences à connaître. Le jalon d'ascension *avoir un chromatique en enclos* devient un
objectif de longue haleine plutôt qu'une étape — il reste franchissable, mais il ne se planifie
plus. Et la carte d'album **constellée** prend enfin sa valeur : plafonnée à ×2 sur tout
l'album, elle ramène la chance à 1 sur 4 096.

**Un chromatique vaut exactement un cran de rareté** : ×25. Une commune chromatique vaut une
rare ordinaire, une rare chromatique vaut une épique, et ainsi de suite jusqu'en haut. La
règle tient en une phrase et se propage d'elle-même à toute l'échelle.

| Mûre à l'âge enfant | Valeur |
|---|---|
| commune | 40 |
| **commune chromatique** = rare | **1 000** |
| **rare chromatique** = épique | **25 000** |
| **épique chromatique** = mythique | **600 000** |
| **mythique chromatique** | **15 M** |

À ×5 il ne pesait rien : la plus belle bête du jeu restait cinq fois sous le moindre tirage
rare, et le seul coup de chance qui se voit à l'écran ne se sentait pas dans la bourse. Mais à
×125 il cassait la partie — et pour une raison qui n'est pas le chiffre lui-même.

**Le coût d'évolution ne suit que la lignée.** Mener n'importe quelle bête à la légende rend 2,3
fois ses péages, à toutes les raretés. Un chromatique, lui, paie les péages de sa lignée pour
la valeur d'une autre : il rend donc 2,3 × son multiplicateur.

| Menée à la légende | Ce qu'elle rend par pièce de péage |
|---|---|
| commune | ×2,3 |
| rare | ×2,3 |
| commune chromatique à ×125 | **×291** |
| commune chromatique à ×25 | ×58 |

À ×125, une commune chromatique rapportait 291 fois sa mise quand tout le reste du jeu en
rapporte 2,3 : ce n'était plus un coup de chance, c'était la meilleure ligne de jeu, et de
loin. À ×25 l'affaire reste excellente — c'est bien ce qu'on attend d'un tirage sur cinq
cents — sans écraser le reste. Si elle pèse encore trop à l'essai, le levier suivant n'est
plus ce chiffre mais les péages.

**Le tempérament** ne se lit qu'en texte, mais il agit : `grow` accélère la montée en niveau,
`fat` accélère l'engraissement. Docile (neutre), nerveux (croissance ×1,25 / engraissement
×0,85), placide (l'inverse), glouton (engraissement ×1,4), farouche, rêveur. L'effet porte sur
la **vitesse** de croissance, pas sur les bornes — les seuils de niveau sont les mêmes pour
tout le monde, et la durée de référence des rangs de taille reste celle de l'âge, sinon un
tempérament vif cumulerait deux bonus.

**Le motif** — uni, tacheté, rayé, moucheté, marbré, tigré, zébré, constellé — n'a aucun
effet. C'est de l'identité pure.

### Une seule épithète, accolée au nom

Les variantes ne s'affichent pas en liste sous le nom. La bête porte **un seul mot en plus
du sien** : `Varan cendré`, `Carpe gloutonne`, `Wyverne dorée`. Empiler
`chromatique · écarlate · rayé · placide` donnait une fiche technique à déchiffrer sous
chaque animal ; un nom composé se retient et se raconte.

L'épithète retenue est **celle qui distingue le plus** : le prodige d'abord, puis la teinte —
c'est elle qu'on voit à l'écran —, puis le tempérament, et le motif quand la bête n'a rien
d'autre à montrer. Une bête ordinaire, docile et unie garde son nom nu.

Ce qui est écarté du nom **reste lisible là où ça compte** : le tempérament dans la ligne des
boosts (`gloutonne ×1,40`), la teinte dans le multiplicateur de valeur. Rien ne se perd, tout
se lit au bon endroit.

L'épithète **s'accorde en genre**. Chaque forme féminine est marquée `'f'` dans sa
déclaration (18 des 95 : carpe, wyverne, méduse, salamandre, licorne, chimère…), et chaque
teinte et tempérament porte sa forme féminine à côté de la masculine. Sans ça, la moitié du
bestiaire se serait appelée « Carpe cendré ».

Les noms à titre reçoivent leur épithète **sur le nom propre**, pas à la fin :
`Khépri doré, porteur du soleil` — jamais `Khépri, porteur du soleil doré`.

### Ce que vaut la mangeoire

**L'embonpoint est le seul axe facultatif du jeu.** Il ne débloque plus rien : la rente s'ouvre
à l'âge adulte, et le marchand ne réclame une taille minimale que si on possède une mangeoire.
Ce que fait vraiment la mangeoire, c'est **remplir l'attente au péage** — la bête est mûre, les
pièces de l'évolution ne sont pas encore là, elle grossit en attendant. Et ce temps n'est pas
perdu : l'évolution ne remet plus l'embonpoint à zéro.

Le rendement de l'engraissement ne dépend **pas de l'âge** — 0,83 à l'enfance comme à la légende
avec les mêmes niveaux. Il ne dépend que du **rapport entre le niveau de mangeoire et celui
d'éleveur** : l'un fait tourner l'enclos, l'autre l'immobilise pour grossir.

À niveaux égaux, en rendement d'enclos comparé à y enchaîner des bêtes :

| Rang visé | Rendement |
|---|---|
| grand | **1,24** — vaut mieux que recycler |
| énorme | 0,82 |
| colossal | 0,41 |
| titanesque | 0,12 |
| démesuré | 0,02 |

Il y a donc un optimum net à *grand*, puis une longue traîne de plaisir payé en temps. C'est
la décision qu'on veut, et elle se règle une fois pour toutes dans la taille exigée par le
marchand — un réglage qui n'apparaît qu'une fois la mangeoire achetée.

La mangeoire était auparavant à 2 500 × 2,0 avec un débit de ×2 : monter au niveau 5 coûtait
**quatorze fois** le prix de l'éleveur, pour un rendement de 0,83 à niveaux égaux — donc
jamais rentable, et en pratique 0,17 puisqu'on ne pouvait s'offrir que le niveau 1. Elle suit
maintenant la même courbe de prix que l'éleveur, à cinq fois le total : elle reste un
supplément, elle n'est plus un piège.

### Garder une bête

Le bouton **☆ Garder** met une créature hors de portée des automates : ni vendue par le
marchand, ni faite évoluer — on veut parfois garder une forme précise, et non la pousser
jusqu'à la légende. La mangeoire continue de l'engraisser, elle. Le bouton *Vendre* se verrouille
tant qu'elle est gardée.

Ce que ça coûte est une place d'enclos immobilisée, et c'est tout l'intérêt : on choisit de
continuer l'aventure avec une bête plutôt que de la faire entrer dans la chaîne.

### La rente

Tout le reste du jeu pousse à vendre : l'enclos est la ressource rare, et une bête gardée est
un enclos qui ne tourne pas. **La rente est la seule règle qui paie pour ne pas vendre.**

**La rente s'ouvre à l'âge adulte — niveau 36.** Une bête de cet âge ou plus rapporte toute
seule, sans rien faire, même absent : sa propre valeur de vente **étalée sur une heure**.

Elle était auparavant branchée sur l'embonpoint (*énorme* ou plus), c'est-à-dire sur la
mauvaise échelle. C'était un seuil que personne ne devine, qui obligeait à comprendre la
mangeoire avant de toucher le premier revenu passif, et qui coûtait des dizaines de milliers de
secondes d'enclos avant de rapporter la première pièce. **L'âge ouvre la rente, la taille
l'augmente** — l'embonpoint est déjà dans la valeur de vente, donc il la pousse tout seul, sans
qu'on ait besoin d'une règle de plus.

Ses facteurs sont exactement ceux du prix de vente — **niveau, âge, rareté, teinte, taille** —
si bien qu'une bête rapporte à proportion de ce qu'elle vaut. Le **chromatique** est le seul à
recevoir un bonus par-dessus : sa rente est **doublée**, en plus du ×25 que sa valeur porte
déjà. C'est la bête qu'un joueur garde, c'est elle qu'on récompense.

| Bête commune | Valeur | Rente |
|---|---|---|
| adulte fraîche, niv. 36 | 900 | 0,25 / s |
| adulte mûre, niv. 65 | 6 000 | 1,67 / s |
| ancienne mûre, niv. 85 | 80 000 | 22,2 / s |
| légende mûre, niv. 100 | 1,5 M | 417 / s |
| légende mûre **rare** | 37,5 M | 10 417 / s |
| légende mûre **mythique** | 22,5 Md | 6,25 M / s |
| légende mûre **mythique chromatique** | 2,81 Bn | 1,56 Md / s |

Le montant baisse (417 / s au lieu de 708 pour une commune au bout), mais le **volume** monte :
toutes les bêtes de l'âge adulte et au-dessus rapportent, là où seules les engraissées le
faisaient. C'est le vrai changement, et il tient dans les clous :

- **au moment où elle s'ouvre**, elle pèse environ 2 % du revenu du joueur — qui vient
  justement de payer 200 + 3 000 pièces de péages pour ce premier adulte. Elle arrive comme
  une confirmation, pas comme un raccourci ;
- **sur une ferme qui tourne** — dix enclos étalés de l'enfance à l'ancien, éleveur 10 — elle
  pèse 1,1 % du débit.

Elle ne remplace jamais l'élevage, et le rapport se calcule d'une ligne : un enclos qui
recommence rapporte `valeur / (croissance / éleveur)`, un enclos qui garde `valeur / 3600`.
**Cycler gagne dès que le niveau d'éleveur dépasse la croissance divisée par 3 600** — soit
0,3 à l'âge adulte, 1,3 à l'ancien, 7,3 à la légende. Un joueur qui produit des légendes a un éleveur
autour de 15 : cycler lui rapporte alors le double de garder, exactement comme avant. L'ancien
seuil à *énorme* était 1,7 fois plus haut, donc la rente d'aujourd'hui laisse **plus** de place
à l'élevage que celle d'hier, pas moins.

Pousser la taille rapporte, mais bien moins vite que ça ne coûte. La rente prolonge donc la
longue traîne de la mangeoire sans la rendre optimale : elle **console** le joueur qui pousse
une bête pour le plaisir.

**Le marchand vise la même bête que la rente.** Réglé à partir de l'âge adulte, il vend celles
qui rapportaient déjà ; sa note le dit alors, et ☆ *Garder* est la parade.

Un effet secondaire heureux : le seuil devient **annonçable**. « À l'âge adulte — niveau 36 —
elle se mettra à rapporter toute seule » se lit sous la barre. « Encore 12 000 secondes de
mangeoire pour atteindre *énorme* » ne se lisait nulle part.

La rente s'affiche à trois endroits : `+1,67 / s` à côté de la bourse pour le total,
`rente +1,67 / s` dans la ligne des boosts de la bête en scène, et le bandeau de retour compte
les pièces gagnées pendant l'absence.

### Automatisations

Le jeu commence entièrement à la main : un œuf ne couve pas et une créature ne grandit pas
tant qu'on ne clique pas dessus.

**Les compteurs suivent une règle unique, et n'affichent jamais deux unités à la fois** :
des clics tant que rien n'avance tout seul — annoncer « 15 s » alors qu'aucune seconde ne
s'écoule serait un mensonge — et des secondes dès qu'un automate tourne. Faire cohabiter les
deux (`30 s ou 30 clics`) donnait deux mesures pour une même attente et invitait à marteler
une barre qui montait déjà sans nous.

La règle vaut aussi pour une bête mûre qui s'engraisse : `33 clics → grand` sans mangeoire,
`17 s → grand` avec.

**Une ligne détaille les boosts en cours**, sous le compteur : la durée de base, ce qu'elle
devient avec ce qu'on possède, et chaque facteur qui y contribue.

> `Croissance 30 s par niveau → 8 s · nerveux ×1,25 · éleveur ×3 · un clic vaut 9 s`
> `Engraissement +12,6 s par seconde · glouton ×1,40 · mangeoire ×3 · rente +1,67 / s`
> `Couvaison 30 s → rien sans toi · un clic vaut 1 s`

La durée annoncée pour la croissance est celle d'**un niveau**, pas de la tranche entière :
c'est l'attente que le joueur vit réellement, et c'est elle que les automates raccourcissent.

Sans elle, on achetait des niveaux sans jamais voir ce qu'ils changeaient.

Les deux premiers achats n'accélèrent pas la partie, ils **mettent le temps au travail** —
c'est le moment précis où le jeu bascule de clicker à idle.

Quatre améliorations sur sept se montent **niveau par niveau, sans plafond**. Le prix du
prochain niveau vaut `base × mult^niveau` : l'effet monte linéairement pendant que le prix
double presque, donc chaque niveau se mérite et les rendements décroissent d'eux-mêmes.

| Amélioration | Base | Mult. | Effet au niveau *n* |
|---|---|---|---|
| Force du clic | 60 | ×1,6 | *n*+1 secondes gagnées par clic, à la vitesse des automates |
| Couveuse automatique | 120 | ×1,9 | ×*n* sur la vitesse de couvaison |
| Éleveur automatique | 500 | ×1,9 | ×*n* sur la vitesse de croissance |
| Acheteur automatique | 2 000 | — | achat unique |
| Mangeoire automatique | 2 500 | ×1,9 | *n*×3 s d'engraissement par seconde |
| Marchand automatique | 15 000 | — | achat unique |
| Évolution automatique | 50 000 | — | achat unique |

L'échelle est calée pour qu'une partie **bascule en pilote automatique en une demi-heure**
plutôt qu'en une heure et demie. Simulation d'un joueur cliquant quatre fois par seconde,
achetant toujours l'option la moins chère à sa portée et menant ses bêtes à l'âge adulte :
couveuse à 1 min, éleveur à 6 min, acheteur à 14 min, mangeoire à 24 min, marchand à 35 min.
Aux anciens prix, le marchand tombait à 78 min.

**L'éleveur et la mangeoire se partagent la vie de la bête** : l'éleveur pousse les jeunes
jusqu'à sa maturité, la mangeoire prend le relais et engraisse les bêtes mûres. Aucune des deux
ne dépense de pièces.

#### Acheter par lots

Un sélecteur en haut du panneau — **×1, ×10, ×100, max** — dit combien de niveaux part d'un
clic. Passé l'ère commune une amélioration se monte de cinquante niveaux d'affilée : les
acheter un par un, c'est cinquante clics qui ne décident de rien, et le jeu cesse d'être un
clicker à ce moment-là pour devenir une paperasse.

**Un lot coûte exactement ce que coûteraient les achats un par un.** Le prix est la somme des
prix arrondis niveau par niveau, pas une formule fermée : un lot qui reviendrait moins cher
serait une remise cachée, et l'équilibrage n'en sait rien.

**Les nombres fixes achètent tout ou rien.** Un ×100 qui n'en achèterait que trente ferait
douter du prix affiché ; le bouton s'éteint tant que la bourse ne suit pas. **`max`, lui, prend
tout ce que la bourse permet** et pas un niveau de plus — mesuré : avec un million de pièces,
la force du clic monte de 58 niveaux et laisse 116 372 pièces, quand le suivant en coûterait
149 887.

Les plafonds sont respectés comme partout ailleurs : les trois achats uniques — acheteur,
marchand, évolution — ne débordent pas de leur niveau 1, quel que soit le lot demandé. Et le
bouton annonce ce qu'il fera — `Force du clic · niv. 12 → 22`, avec l'effet de départ et celui
d'arrivée.

### L'album et l'ascension

Le jeu s'arrêtait sur une fin sèche : légendes mythiques, ferme pleine, plus rien. L'ascension
lui donne un deuxième tour, et **l'album est la seule chose qu'on emporte**.

Le cycle tient en cinq temps. On joue. On franchit un **jalon**. On ascensionne : les bêtes
présentes dans l'enclos deviennent des **capsules** — la bête figée telle qu'elle était. On
choisit les cartes à équiper. Tout le reste repart de zéro.

**Une bête ne devient jamais une carte en cours de partie.** La transformation n'a lieu qu'au
moment du saut, sur ce qu'il reste dans l'enclos. Il n'y a donc aucun arbitrage à faire devant
chaque animal — la question devient « lesquelles je garde en vie pour le saut ? », posée une
fois sur une ferme entière plutôt que trente fois sur trente bêtes.

| Ce qui traverse | Ce qui repart de zéro |
|---|---|
| L'album — toutes les capsules | Les pièces |
| Les emplacements, et les cartes équipées | Les œufs en réserve |
| La collection des formes vues | Incubateurs et enclos |
| Les jalons déjà dépensés | Les huit améliorations |
| Les réglages : tri, consignes, son | Les bêtes non transformées |

La collection survit : c'est un musée de ce qu'on a rencontré, pas une ressource. Elle ne
donne aucun bonus — **seules les cartes équipées en donnent** — donc la garder ne déséquilibre
rien, et la remettre à zéro ne ferait que forcer à redécouvrir ce qu'on a déjà vu.

#### Le motif décide ce que la carte accélère

Le motif ne servait à rien : tiré à l'éclosion, gardé à vie, purement décoratif. Lui confier
le bonus ne demande aucune mécanique neuve, et il devient chassable. Faire dire le bonus par
la *lignée* aurait figé vingt-et-un bonus dans la pierre, et rendu une lignée entière
inintéressante le jour où le sien l'est.

| Motif | Ce que la carte touche | Par point | Plafond |
|---|---|---|---|
| uni | valeur de vente | +4 % | +60 % |
| tacheté | vitesse de couvaison | +10 % | +150 % |
| moucheté | vitesse de croissance | +10 % | +150 % |
| rayé | engraissement | +10 % | +150 % |
| tigré | rente | +14 % | +200 % |
| marbré | prix des évolutions | −3 % | −40 % |
| zébré | prix des œufs | −3 % | −40 % |
| constellé | chance de prodige | ×1,07 | ×2 |

**Deux familles baissent des prix au lieu d'augmenter des vitesses.** C'est ce qui empêche la
deuxième partie d'être la première en accéléré : une ferme menée au zébré ne se joue pas comme
une ferme menée au tacheté.

Le constellé s'exprime **en multiplicateur de la base, jamais en points** : le prodige est à
1 sur 8 192, soit 0,012 %, et un demi-point le multiplierait par plus de quarante. Le bonus
d'élevage a été coupé de ×25 à ×4 pour protéger cette rareté ; le plafond à ×2 fait le reste,
et ramène au mieux la chance à 1 sur 4 096.

#### Ce qui décide de la puissance d'une carte

Le motif dit *quoi*. Trois facteurs disent *combien*, et ils sont tous bornés — c'est ce qui
permet de dire à l'avance ce que vaudra la dixième ascension.

    puissance = plafond(rareté) × palier × qualité(spécimen)

Le plafond vient de la rareté de la lignée : ×1 en commune, ×1,6 en rare, ×2,5 en épique,
×4 en mythique. Le palier vient de la fusion, qui n'existe pas encore — toute capsule naît au
palier 1. La qualité, elle, se mérite :

    qualité = 0,4 + 0,6 × ( 0,50 × niveau/100
                          + 0,20 × teinte/7
                          + 0,20 × rang de taille/5
                          + 0,10 × chromatique )

| La bête transformée | Qualité | Puissance |
|---|---|---|
| Têtard commun, niveau 15, ordinaire | 0,45 | 0,45 |
| Légende commune, niveau 100, ordinaire | 0,70 | 0,70 |
| Légende mythique, dorée, énorme | 0,85 | 3,40 |
| Légende mythique, albâtre, démesurée, chromatique | 1,00 | 4,00 |

Le niveau domine : c'est le seul axe qui demande du temps plutôt que de la chance.

#### Les emplacements : un build, pas une collection

**L'album garde toutes les capsules, seules celles qu'on équipe agissent.** Sans limite,
vingt-sept cartes se composent et la puissance de l'album n'a plus de plafond — c'est de ça
que meurent les jeux idle.

**Un jeton dépensé ouvre un emplacement, et c'est tout.** La première ascension en donne un,
la deuxième un second, et ainsi de suite : la puissance de l'album ne dépasse jamais le nombre
de sauts qu'on a payés. Le compte partait auparavant de trois plus un par ascension, ce qui en
donnait **quatre avant même d'avoir sauté une seule fois** — trois emplacements offerts pour
un jeton dépensé, alors que le jeton est justement ce qui se mérite.

Une conséquence utile : **un album se concentre**. Trois cartes d'une même famille rendent
trois fois plus que trois familles différentes — le jour où l'on a trois emplacements.

| L'album | Ce qu'il rend |
|---|---|
| 3 légendes communes, motifs éparpillés | +3 % valeur, +7 % couvaison, +7 % engraissement |
| 3 légendes communes, toutes tachetées | **+21 % de couvaison** |
| 3 légendes communes, toutes unies | +8 % de valeur |
| 6 légendes mythiques dorées tachetées | +150 % — le plafond |
| 6 mythiques albâtre chromatiques, tigrés | +200 % de rente — le plafond |

Les deux dernières lignes disent ce que six emplacements rendraient. **Elles sont hors
d'atteinte aujourd'hui** : six emplacements demandent six ascensions, donc six paliers de
fortune, alors que l'échelle n'en compte que cinq et que les derniers dépassent l'économie.
Elles restent dans la table parce qu'elles bornent le calcul — et parce que la fusion, en 2.3,
attaquera ce plafond par l'autre bout.

Le build se choisit sur l'écran d'ascension et **reste verrouillé pour toute la partie**. S'il
se permutait librement, on mettrait la couvaison au début et la valeur à la fin : on aurait de
fait toutes les cartes, et la limite ne limiterait rien.

#### Les jetons d'ascension

**Un jeton s'obtient en franchissant un palier de fortune, et l'ascension en dépense un.** Les
paliers montent d'un million à chaque cran :

| # | Palier | Ce qu'il faut avoir en poche |
|---|---|---|
| 1 | 10⁶ | 1 M de pièces |
| 2 | 10¹² | 1,00 Bn |
| 3 | 10¹⁸ | 1,00 Tn |
| 4 | 10²⁴ | 1,00 Qa |
| 5 | 10³⁰ | 1,00 Qi |

**Un palier franchi est franchi pour toujours.** Il crédite son jeton une fois, puis il est
mort : l'ascension remet la bourse à zéro, mais elle ne rend pas les paliers déjà passés. Le
nombre total d'ascensions d'une partie est donc borné par cette échelle, et par elle seule —
et comme les emplacements le sont aussi, la puissance maximale de l'album reste un nombre
qu'on peut calculer avant d'avoir joué.

Le pas de ×1 000 000 fait que **le palier suivant ne se rattrape jamais par accident** : il
demande de refaire toute l'économie une fois de plus. Une légende mythique chromatique vaut
environ 5,6·10¹¹, donc le deuxième jeton demande d'en vendre deux, et le troisième un million.
L'échelle ne s'arrête pas avant l'économie ; c'est l'économie qui s'arrête avant l'échelle.

**Le premier jeton tombe en milieu de partie.** Un million de pièces suppose d'avoir mené des
bêtes au bout et d'en avoir vendu — on n'y arrive pas en cliquant des têtards.

**Les emplacements suivent le nombre d'ascensions** : un par jeton dépensé, pas un de plus.

**Rien n'oblige jamais à ascensionner.** C'est un sacrifice qu'on choisit : on perd sa ferme
entière contre quelques cartes. Un jeton en poche ne réclame rien, ne clignote pas et n'expire
pas — il attend. Le bouton porte le gris des outils plutôt qu'une couleur d'appel, pour ne pas
faire croire à une étape obligatoire.

Et **une ascension sans carte est refusée** : sauter avec un enclos vide serait une perte sèche,
pas un choix. Le panneau le dit et le bouton reste éteint, le jeton restant en poche.

**On ne peut pas enchaîner deux sauts** sans avoir rejoué : l'ascension vide la bourse, et le
palier suivant est un million de fois plus haut.

#### Le piège du marchand

C'est la conséquence la moins évidente de la règle. **Les cartes viennent des bêtes présentes
dans l'enclos au moment du saut** — or le marchand automatique vide l'enclos en continu,
absences comprises. Un joueur qui ascensionne sans y penser trouve une ferme vide et repart
avec zéro carte, après des heures de jeu.

L'écran d'ascension annonce donc combien de cartes le saut produira, et **prévient quand le
marchand est encore actif**. Préparer une ascension, c'est passer ses consignes sur « jamais » —
ce qui donne enfin un usage stratégique à un réglage qui n'était qu'un confort.

Effet de bord heureux : garder une bête vivante rapporte maintenant deux fois, en rente pendant
la partie et en carte au moment du saut.

#### Ce qui n'est pas encore là

**La fusion** — trois capsules d'une même lignée en forgeraient une supérieure, et la carte
forgée garderait le meilleur des trois spécimens. Elle vient en 2.1, et elle n'a rien à faire
avant : à la première ascension on n'a aucun doublon. Le champ `palier` existe déjà sur chaque
capsule et la table `PALIERS` est écrite, si bien que 2.1 sera purement additive.

**La merveilleuse**, cinquième rareté, ne s'obtiendra qu'en pension : l'album sort donc avec
quatre plafonds au lieu de cinq.

### Le code couleur

Une couleur ne doit vouloir dire qu'une chose. L'or, notamment, servait partout — bourse,
jauges, prix, focus, sélection — ce qui vidait de son sens le rang des mythiques.

| Couleur | Sens, et rien d'autre |
|---|---|
| gris-vert, bleu, violet, **or** | les quatre raretés, et le prodige pour l'or |
| beige `--coin` | la monnaie et les prix |
| vert `--accent` | la progression, la sélection, le focus |
| vert `--good` | une vente rentable |
| rouge | une vente à perte que rien ne va corriger |

Deux conséquences :

**L'âge légende n'a pas de couleur à lui.** Il fait briller plus fort la teinte de sa propre
rareté — la teinte dit la rareté, l'intensité dit l'âge. Une légende commune reste donc gris-vert,
seul un mythique brille en or.

**Le bouton *Vendre* est vert quand la vente est rentable et rouge quand elle ne l'est pas.**
Il était rouge dans un cas et doré dans l'autre, ce qui donnait deux alarmes et aucune bonne
nouvelle. Et le rouge tient compte de ce qui est prévu : une bête qui n'a qu'à finir de
grandir, ou que l'évolution automatique va mener au-delà du seuil, reste neutre.

### Un panneau qui s'explique

Les réglages se lisaient comme des phrases à trous — un bout de texte, un menu, un autre bout
de texte — et rien ne disait que les conditions du marchand se **cumulent**. Le panneau est
donc réécrit sur trois principes :

- **Chaque étape est titrée et numérotée** dans l'ordre où les automates s'exécutent, avec une
  ligne qui dit ce qu'elle fait avant de montrer le menu.
- **Le marchand a une ligne étiquetée par rareté**, plus une pour la taille — et cette
  dernière **n'apparaît qu'une fois la mangeoire achetée**. Sans automate qui engraisse, la
  notion n'a rien à faire à l'écran : vendre doit rester la chose la plus simple du jeu.
- **Chaque réglage écrit ce qu'il produit**, et se réécrit dès qu'on bouge un menu. « En clair :
  il vend les communes dès l'âge adulte, les rares dès l'âge légende. Les mythiques restent dans
  l'enclos. » L'acheteur annonce son débit à l'heure, l'évolution le coût total du chemin
  qu'elle va financer.

Une phrase qu'on relit après avoir bougé un menu vaut mieux qu'un mode d'emploi qu'on lit une
seule fois.

Les menus qui listent des données du jeu — prix des œufs, rangs de taille, raretés — sont
**construits depuis ces données** plutôt qu'écrits à la main. C'est la seule façon qu'ils ne
mentent pas le jour où un prix bouge, et ils avaient déjà menti une fois.

### Tout se règle rareté par rareté

Les trois consignes de la ferme ont chacune quatre valeurs, une par rareté :

> Il fait monter les **communes jusqu'à la légende** et arrête les **mythiques à l'âge adulte**.
> Il vend les **communes mûres dès l'âge adulte**, les **rares mûres à l'âge légende et grandes
> ou plus**, et ne touche **jamais** aux mythiques.

C'est la consigne qu'on veut vraiment donner. Une valeur unique pour tout le monde forçait à
choisir un compromis, et le compromis n'est bon pour personne : on écoule le tout-venant tôt
pendant qu'on mène le précieux jusqu'au bout, parce que ce ne sont pas les mêmes sommes.

| Ce qui se règle | Pourquoi par rareté |
|---|---|
| **jusqu'où la faire monter** | d'ancienne à légende : 600 000 en commune, 9,00 Md en mythique |
| **à partir de quel âge la vendre** | on écoule tôt ce qui ne vaut rien, on garde le reste |
| **à quelle taille la vendre** | engraisser une commune immobilise un enclos pour quelques pièces ; une mythique, pour des milliards |

**Le marchand n'attend qu'une condition par défaut** : la bête est mûre, et son âge est celui
qu'on a réglé pour sa rareté. Les quatre menus de taille sont un supplément, et le bloc
**n'apparaît qu'une fois la mangeoire achetée** — avant, la notion n'existe pas à l'écran.
C'est ce qui garde la revente simple en early game : rien n'oblige jamais à comprendre
l'embonpoint pour vendre, et le bouton *Vendre* marche à tous les niveaux, au prix du niveau.

Les menus se dévoilent au rythme des automates : quatre avec le marchand, huit avec
l'évolution, douze avec la mangeoire. Aucun n'apparaît avant d'avoir quelque chose à commander.

### Un plafond d'évolution par rareté, lui aussi

**Chaque rareté a son propre plafond d'évolution**, pour la même raison que chacune a son âge
de vente : ce n'est pas la même décision. Le péage suit la rareté, et l'écart est brutal.

| Faire monter une bête | commune | rare | épique | mythique |
|---|---|---|---|---|
| d'adulte à ancienne | 40 000 | 1,00 M | 24,0 M | 600 M |
| d'ancienne à légende | 600 000 | 15,0 M | 360 M | **9,00 Md** |

Pousser un seul mythique d'ancien à légende coûte quinze mille fois ce que coûte une commune.
Un réglage unique forçait à choisir un compromis pour tout le monde : on pousse maintenant les
communes jusqu'au bout pendant qu'on arrête les mythiques à l'âge adulte, en attendant d'avoir
les moyens. Chaque menu affiche la facture complète du chemin qu'il finance.

**L'évolution automatique s'arrête quand même à l'âge où le vendeur doit prendre le relais.**
Sans ce frein, la consigne de vente serait muette : régler « vendre les communes dès l'âge
adulte » ne servirait à rien, puisque l'évolution les pousserait jusqu'à la légende avant que le
vendeur n'ait son mot à dire. Des deux plafonds, c'est le plus bas qui commande.

Un réglage incohérent est signalé, et **les raretés en cause sont nommées** : si l'évolution
des rares s'arrête à l'adolescence pendant que le vendeur les attend à l'âge ancien, la note dit
lesquelles n'y arriveront jamais, avant que les enclos ne s'engorgent.

**L'évolution passe avant la vente**, pour qu'une bête qu'on peut faire monter ne parte jamais
au prix de l'âge d'en dessous. L'enchaînement complet se règle donc rareté par rareté — jusqu'où
la faire monter, à partir de quel âge la vendre, et à quelle taille — et la ferme tourne seule :
couver, élever, faire monter, engraisser, vendre, racheter.

La force du clic vaut aussi pour l'engraissement, et le compteur en clics en tient compte :
« 4 clics » plutôt que « 30 clics » une fois le clic monté à 8 secondes.

Les sauvegardes d'avant les niveaux sont converties au chargement : `true` devient niveau 1.

La progression hors ligne suit la même règle : sans couveuse ni éleveur, une absence ne
produit rien, et le bandeau de retour ne s'affiche pas.

### Interface

L'écran n'a **qu'un seul sujet à la fois**, en grand au centre : l'œuf qu'on fait éclore ou
l'animal qu'on fait grandir. C'est lui qu'on clique. La bande en dessous liste les autres
œufs et créatures en vignettes ; on clique une vignette pour la mettre en scène.

**La scène suit l'animal, jamais l'œuf.** Acheter un œuf, le placer, le voir arriver par
l'acheteur automatique ou en voir un autre éclore ne détourne jamais le regard de la bête en
cours d'élevage. Un œuf ne passe au premier plan que s'il n'y a plus rien de vivant à
regarder, et c'est alors le plus avancé.

**Le marchand n'a aucune exception, pas même la bête en scène.** Si la consigne dit de vendre
les communes mûres dès l'âge adulte, il vend toutes les communes mûres — y compris celle qu'on
est en train de regarder. Une automatisation qu'on règle doit faire exactement ce qu'on a réglé,
sans quoi le compte ne tombe jamais juste et la ferme cesse d'être prévisible.

**Deux exceptions ont été essayées, et retirées.** Une immunité à vie pour la bête en scène
laissait celle qu'on venait d'évoluer à la main invendue pour toujours — le symptôme visible
était « le marchand ne vend pas ». Un sursis de dix secondes depuis le dernier *clic* protégeait
mal, puisque regarder une bête n'est pas la cliquer, et une bête arrivée en scène toute seule
n'était jamais protégée. Une protection tant que l'onglet reste visible a ramené le premier
défaut : page ouverte, bête jamais vendue.

**☆ *Garder* est donc la seule protection**, et c'est le bon endroit : elle est explicite, elle
se voit sur la vignette, et c'est le joueur qui la pose. Ce qu'on perd, c'est qu'une bête peut
partir à l'instant où on la regarde ; ce qu'on gagne, c'est une consigne qui ne ment pas.

**Vendre ne déplace pas le regard : on garde sa case.** Si on était sur la case 6, on reste
sur la case 6 — c'est la voisine qui glisse dedans, exactement comme dans une liste dont on
retire une ligne. Sauter « à la bête la plus avancée » faisait traverser la bande à chaque
vente et rendait impossible d'écouler un enclos case par case.

**Le marchand automatique obéit à la même règle.** Elle ne valait d'abord que pour les ventes
à la main, et l'automate, lui, laissait la sélection retomber sur le repli — donc sur la bête
la plus avancée, à l'autre bout de la bande. On regardait la case 2, une vente tombait, et on
se retrouvait ailleurs sans avoir rien fait. La case se relève désormais avant le retrait,
dans les deux cas.

Seule entorse, celle de la règle du dessus : on ne quitte jamais le vivant pour un œuf. Si la
case libérée retombe sur une coquille alors qu'il reste des bêtes, on s'arrête au bord du bloc
vivant. Les bêtes forment toujours un bloc d'un seul tenant dans la bande, avant ou après les
œufs selon que la couveuse est achetée — c'est ce qui permet de raisonner en « case » sans
que les incubateurs s'intercalent.

**Rien ne prend la scène à une bête vivante — pas même une éclosion rare.** L'éclosion d'une
lignée précieuse mérite une fanfare, mais pas au prix d'arracher au joueur l'animal qu'il est
en train de cliquer. Elle ne bascule donc que si la scène montrait une coquille ou rien du
tout ; sinon elle se contente de son accord, et sa vignette porte déjà sa couleur de rareté
dans la bande. Afficher « lignée rare ! » au-dessus d'une *autre* bête serait un contresens.

Dès que la couveuse automatique est achetée, les œufs cessent d'être le sujet : les créatures
passent devant eux dans la bande, pour rester à portée de clic même avec dix incubateurs. Cet
ordre vit dans `subjects()`, pas dans le rendu : c'est ce qui garantit que « la case 6 »
désigne la même vignette pour l'affichage et pour la sélection.

**La bande garde sa position de défilement** quand elle se redessine. Vider un conteneur remet
sa barre horizontale à zéro : la bête qu'on suivait à droite sautait à gauche au moment précis
où on la regardait grandir. La position est donc relevée avant, reposée après.

**Seul l'âge déclenche une reconstruction de vignette** — quatre fois par vie. Le niveau, lui,
monte cent fois : le mettre dans la signature ferait redessiner la bande sans arrêt. Ce qui
bouge à chaque niveau — le numéro, la taille du glyphe, la barre — est repeint par des setters
qui ne touchent au DOM que si la valeur a réellement changé.

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

### Illustrations

Les emoji sont des bouche-trous, et le dossier `art/` sert à les remplacer **une lignée à la
fois**. Tant qu'un dessin n'est pas là, l'emoji reste : rien ne casse jamais, et on peut
s'arrêter n'importe quand.

Ajouter un dessin, c'est poser le fichier dans `art/` et ajouter une ligne à la table `ART`
en haut de `game.js`. Rien d'autre — pas de build, pas de manifeste à régénérer.

**Trois dessins suffisent pour une lignée entière.** Un âge sans dessin prend celui de l'âge le
plus proche en dessous. Avec `{ 1: 'tetard.png', 4: 'colosse.png' }`, les trois premiers âges
montrent le têtard et les deux derniers le colosse. Un seul fichier fonctionne aussi.

Une image fait exactement `1em`, donc **tout ce qui pilotait la taille de l'emoji pilote la
sienne** — niveau, âge, engraissement, teinte. Un dessin remplace un emoji sans qu'aucun autre
calcul ne bouge, du nouveau-né à 52 px à la légende démesurée à 220 px.

Le détail du format attendu est dans [`art/LISEZMOI.md`](art/LISEZMOI.md).

### Ce que le niveau pilote à l'écran

| Ce qu'on voit | Au niveau 1 | Au niveau 100 | Comment ça monte |
|---|---|---|---|
| l'échelle | 0,55 | 2,19 | continue, plus un bond fixe à chaque évolution |
| la valeur | 15 % de son âge | 100 % du sien | par paliers, un saut par niveau |
| la silhouette | forme 1 | forme 5 | change au moment où l'on paie le péage |
| le badge | `niv. 1` | `niv. 100 ✦` | le ✦ marque la maturité |

**La valeur est plate à l'intérieur d'un niveau et saute au passage** : c'est le clic qui fait
changer de niveau qui paie, pas les vingt d'avant. La barre de la scène vise donc le prochain
niveau, jamais la maturité — cent niveaux dans une vie, donc cent barres qui se remplissent.
Où en est la bête dans son âge se lit juste au-dessus, « mûre au niv. 65 » : deux informations,
deux endroits, aucune redite. La vignette de la bande, elle, montre la distance à la maturité —
c'est-à-dire à la décision.

Vendre est possible à tout niveau, au prix du niveau, et **aucune condition de taille ne s'y
ajoute jamais**. C'est la porte de sortie quand un enclos bloque, elle doit rester simple. Le
marchand automatique, lui, n'achète que des bêtes mûres — brader une bête à moitié grandie ne
doit jamais arriver tout seul.

**Trois échelles d'événement**, sinon cent niveaux par vie deviennent cent fanfares :

- un **niveau** : le numéro s'envole, l'animal tressaille, une note ;
- la **maturité** ou un **rang de taille** franchi : étincelles, accord, et le gain de valeur
  affiché ;
- une **évolution** : nouveau nom, nouvelle silhouette, et le niveau réaffiché sous le nom.

### Croissance sans fin

Un clic fait gagner du temps avant comme après la maturité : l'animal ne cesse jamais de
grandir. Mûre, la bête ne monte plus de niveau tant que le péage n'est pas payé — ce qu'elle
avale part alors dans l'embonpoint, et n'y sera pas perdu. Ce qui s'essouffle, c'est le
rendement : la taille suit un logarithme, donc chaque rang coûte bien plus cher que le
précédent.

### Le clic gagne du temps, il n'ajoute pas des secondes brutes

Un clic apporte **la force du clic en secondes de ce que tes automates produisent** : à
éleveur ×7 et force du clic 14, il ajoute 98 secondes de croissance, c'est-à-dire quatorze
secondes gagnées sur la machine.

Sans cette règle, chaque automate acheté nerfait le clic au moment même où on payait pour
aller plus vite : le « +14 s » affiché ne représentait plus que deux secondes de ce que
l'éleveur faisait déjà tout seul, et cliquer devenait dérisoire. La même règle vaut pour la
couveuse et pour la mangeoire — le clic reste un raccourci qui se sent, du premier œuf au
centième niveau.

**Le seuil d'un rang est aussi son multiplicateur de valeur**, et la valeur reste plate entre
deux rangs : comme pour les niveaux, c'est le clic qui franchit le rang qui paie.

Les rangs ne disent pas une taille absolue mais **à quel point la bête est grosse pour son
âge**. C'est ce qui leur permet de survivre à l'évolution sans se contredire : une
« légende titanesque » est une légende hors-norme parmi les légendes, pas une bête plus
vieille. C'est aussi pourquoi les âges ne parlent plus de taille — ils l'ont fait
jusqu'à l'alpha 2.0.1, et « titan titanesque » demandait alors une note pour s'expliquer.

| Rang | À partir de | Valeur | Clics à l'âge enfant | Vente (base 40) |
|---|---|---|---|---|
| mûre | ×1,00 | ×1,00 | — | 40 |
| grand | ×1,30 | ×1,30 | 33 | 52 (+30 %) |
| énorme | ×1,70 | ×1,70 | 116 | 68 (+31 %) |
| colossal | ×2,30 | ×2,30 | 434 | 92 (+35 %) |
| titanesque | ×3,20 | ×3,20 | 2 412 | 128 (+39 %) |
| démesuré | ×4,50 | ×4,50 | ~28 000 | 180 (+41 %) |

La barre de progression vise le rang suivant une fois la bête mûre, et l'animal grossit
vraiment à l'écran — de 0,55 nouveau-né à 2,19 légende mûre, et 2,34 légende bien grasse.

### Engraissement

Une bête ne se nourrit **jamais contre des pièces** : elle grandit au clic et au temps. Une
bête mûre continue donc de grossir indéfiniment, gratuitement, et sa valeur monte de rang en
rang (`OVER_GAIN`, rendement logarithmique).

Ce que coûte un animal énorme n'est pas de l'argent mais **du temps et une place d'enclos** :
une bête qu'on engraisse est une bête qu'on ne vend pas, et l'enclos qu'elle occupe ne
produit rien pendant ce temps. À l'âge enfant, avec une mangeoire de niveau 1 :

| Rang atteint | Temps d'engraissement | Valeur | Rendement de l'enclos |
|---|---|---|---|
| grand | 16 s | 40 → 52 | 0,75 pièce/s — **mieux que recycler** |
| énorme | 58 s | 52 → 68 | 0,48 pièce/s |
| colossal | 217 s | 68 → 92 | 0,24 pièce/s |
| titanesque | 1 206 s | 92 → 128 | 0,07 pièce/s |

À comparer aux 0,67 pièce/s d'un enclos qui enchaîne les bêtes jusqu'à maturité et les vend. Il
existe donc une fenêtre étroite où engraisser jusqu'à *grand* bat le recyclage, et tout ce qui
va au-delà est du plaisir payé en temps. C'est une vraie décision, et elle se règle par le
marchand automatique : allumé il vend avant que la mangeoire ait le temps d'agir, éteint il
laisse grossir.

**Aucun garde-fou n'est nécessaire à l'évolution.** L'ancienne version confisquait la taille en
évoluant, de peur qu'engraisser au premier âge — où la nourriture est dérisoire — puis évoluer
ne rapporte des dizaines de fois la mise. La peur était infondée : `sizeFactor` divise les
secondes de mangeoire par la durée de l'âge **courant**, quatre à six fois plus longue à chaque
cran. Les mêmes secondes rendent donc exactement la même chose, qu'on les dépense tôt ou tard.
La confiscation ne protégeait rien — elle punissait seulement le joueur qui avait engraissé
avant de changer d'avis.

## À vérifier en jouant

1. La première évolution tombe-t-elle avant la dixième minute ?
2. Le clic est-il agréable, ou juste fonctionnel ?
3. Le choix vendre / payer le péage est-il une vraie hésitation, ou la réponse est-elle
   toujours évidente ?
4. À quel moment s'ennuie-t-on ?
5. **Le pari du découpage** : 65 des 100 niveaux se traversent dans les quatre premières
   minutes de la vie d'une bête, et les 15 derniers demandent six heures. Est-ce que la légende
   paraît longue ? Si oui, le levier n'est pas le découpage des niveaux mais la durée de la
   dernière tranche — `AGES[4].grow`, six heures aujourd'hui.

Les créatures sans dessin sont des emoji : des placeholders assumés, en attendant que les
135 illustrations soient toutes là.
