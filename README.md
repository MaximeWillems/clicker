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

- Les 5 lignées et leurs 25 formes, du têtard au Léviathan
- Œuf → clic → éclosion → croissance → **vendre ou faire évoluer**
- **Rien n'avance tout seul au départ** : seuls le clic (+1 s) et la nourriture (payante) font
  éclore et grandir. Le temps ne se met à travailler qu'une fois les automatisations achetées
- **Engraissement sans limite** : un adulte se nourrit indéfiniment et grossit à vue d'œil
- Incubateurs et enclos, à prix croissant
- Cinq automatisations, dans cet ordre : couveuse, éleveur, acheteur, mangeoire, marchand
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

### Automatisations

Le jeu commence entièrement à la main : un œuf ne couve pas et une créature ne grandit pas
tant qu'on ne clique pas dessus. Les compteurs affichent donc `15 clics` et non `15 s`, parce
qu'annoncer des secondes quand rien ne s'écoule serait un mensonge.

Les deux premiers achats n'accélèrent pas la partie, ils **mettent le temps au travail** —
c'est le moment précis où le jeu bascule de clicker à idle.

| Achat | Coût | Effet |
|---|---|---|
| Couveuse automatique | 120 | Les œufs couvent tout seuls |
| Éleveur automatique | 500 | Les créatures grandissent toutes seules |
| Acheteur automatique | 2 000 | Rachète et place un œuf dès qu'un incubateur se libère |
| Mangeoire automatique | 15 000 | Nourrit en continu pour dépasser la vitesse passive |
| Marchand automatique | 100 000 | Vend les adultes selon une règle réglable |

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

### Étapes de vie

Une créature traverse cinq états visibles, et l'échelle est **continue** — elle grossit à
chaque clic plutôt que de sauter d'un cran à l'autre.

| État | Quand | Échelle | Valeur | Silhouette |
|---|---|---|---|---|
| œuf | en couvaison | 0,80 → 1,05 | — | 🥚, halo qui bat après 65 % |
| enfant | 0 – 40 % de la croissance | 0,50 | 15 % | forme juvénile |
| adolescent | 40 – 100 % | 0,50 → 1,00 | 40 % | forme juvénile |
| adulte | croissance terminée | 1,00 | 100 % | forme définitive |
| adulte grand… | engraissement | jusqu'à 1,50 | ×taille | forme définitive |

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

| Rang | À partir de | Clics cumulés au palier 1 |
|---|---|---|
| taille normale | ×1,00 | — |
| grand | ×1,30 | ~30 |
| énorme | ×1,70 | ~110 |
| colossal | ×2,30 | ~390 |
| titanesque | ×3,20 | ~2 400 |
| démesuré | ×4,50 | ~28 000 |

La barre de progression vise le rang suivant une fois l'animal adulte, et l'animal grossit
vraiment à l'écran — jusqu'à `SIZE_VIS` (×1,5) de grossissement visuel, cumulé avec l'échelle
du palier, soit ×2,25 au maximum.

### Engraissement

Un adulte peut aussi être nourri à l'infini contre des pièces. Sa taille et sa valeur montent
au même rythme décroissant (`OVER_GAIN`, logarithmique) pendant que la nourriture coûte
toujours le même prix à la seconde (`OVER_COST`, linéaire). Le rapport est identique à tous
les paliers.

| Taille atteinte | Valeur gagnée | Résultat net |
|---|---|---|
| ×1,05 | +5 % | **+0,24 %** — le maximum possible |
| ×1,22 | +22 % | −2,7 % |
| ×1,38 | +38 % | −11,9 % |
| ×1,99 | +99 % | −151 % |
| ×3,92 | +292 % | −9 700 % |

Autrement dit : grossir est un plaisir et un puits à pièces, jamais une stratégie. Le meilleur
coup possible rapporte 0,24 % — trop peu pour valoir le clic, même automatisé.

Deux garde-fous en découlent :

- **L'évolution remet la taille à ×1.** Sans ça, engraisser au palier 1 — où la nourriture
  est dérisoire — puis évoluer rapporterait des dizaines de fois la mise, la valeur montant
  ×12 par palier quand la croissance ne monte que ×4. Le bouton *Évoluer* passe en rouge
  quand la créature est engraissée.
- **La mangeoire automatique s'arrête à l'âge adulte.** Elle ne doit jamais dépenser les
  pièces du joueur dans une opération perdante.

Pour rendre l'engraissement plus gratifiant, augmenter `OVER_GAIN` ou baisser `OVER_COST` —
mais tant que `OVER_GAIN` dépasse `OVER_COST`, les premières bouchées redeviennent rentables
et l'optimum se met à valoir le détour.

## À vérifier en jouant

1. La première évolution tombe-t-elle avant la dixième minute ?
2. Le clic est-il agréable, ou juste fonctionnel ?
3. Le choix vendre / faire évoluer est-il une vraie hésitation, ou la réponse est-elle
   toujours évidente ?
4. À quel moment s'ennuie-t-on ?

Les créatures sont des emoji : ce sont des placeholders assumés, en attendant les 25 dessins.
