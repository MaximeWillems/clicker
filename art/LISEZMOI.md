# Illustrations

Les sprites sont **générés**, pas dessinés à la main. Chaque créature est décrite en formes
géométriques dans `tools/`, rastérisée sur une grille, puis contournée automatiquement — le
contour est ce qui fait qu'un pixel art simple a l'air fini plutôt que bâclé.

```bash
node tools/rendu.js                # regénère la lignée dans le style actif
node tools/rendu.js ombre          # …dans un autre style
node tools/rendu.js --apercu       # affiche les grilles en texte
node tools/rendu.js --planche      # écrit la planche de comparaison des styles
```

`--apercu` affiche la grille en texte dans le terminal : c'est là qu'on juge une silhouette
avant de l'écrire.

**La description d'une créature et son style sont séparés.** Les silhouettes vivent dans
`tools/formes-crapaud.js`, sans une seule couleur ; les styles — palette, contour, taille de
grille — dans `tools/styles.js`. On peut donc rhabiller toute la lignée sans toucher à une
silhouette, et comparer des styles plutôt que des créatures différentes.

Une leçon des premières passes : **ce qui distingue une créature est sa silhouette**, pas ses
taches de couleur intérieures. Une crête ou une pointe doit dépasser du corps, et donc être
tracée *après* lui — sinon le corps la recouvre.


Ce dossier remplace les emoji, **une lignée à la fois**. Tant qu'un dessin n'est pas là,
le jeu affiche l'emoji : rien ne casse jamais, et on peut s'arrêter à tout moment.

## Ajouter un dessin

1. Poser le fichier ici, par exemple `crapaud-tetard.png`.
2. Ajouter une ligne dans la table `ART`, en haut de `game.js` :

```js
const ART = {
  crapaud: { 1: 'crapaud-tetard.png', 3: 'crapaud-buffle.png', 5: 'crapaud-gama.png' },
};
```

C'est tout.

## Trois dessins suffisent pour une lignée

Un palier sans dessin prend **celui du palier le plus proche en dessous**. Avec les trois
fichiers de l'exemple :

| Palier | Dessin utilisé |
|---|---|
| 1 | têtard |
| 2 | têtard |
| 3 | buffle |
| 4 | buffle |
| 5 | gama |

Et un seul dessin fonctionne aussi : `{ 1: 'crapaud.png' }` couvre les cinq paliers.

Un **juvénile** — enfant ou adolescent — porte toujours le dessin du **palier précédent**.
C'est ce qui fait qu'une wyverne grandit en lézard avant de devenir wyverne. Ça marche
automatiquement, il n'y a rien à déclarer.

## Ce que doit être un fichier

| | |
|---|---|
| Format | **SVG** de préférence, sinon **PNG** avec transparence |
| Taille si PNG | **512 × 512** — la scène peut monter à 300 px, il faut de la marge |
| Cadrage | créature centrée, occupant ~85 % du carré |
| Fond | **transparent**, jamais de fond peint |
| Orientation | toujours du même côté, pour toute la lignée |

## Deux pièges

**Les teintes passent par un filtre de couleur.** Une bête presque blanche ou presque grise
ne se teintera pas visiblement. Garde des couleurs franches si tu veux voir la différence
entre un spécimen écarlate et un azur.

**La vignette fait 24 pixels.** Un dessin trop détaillé y devient une tache. La silhouette
compte plus que le détail — vérifie ton dessin en tout petit avant de le considérer fini.

## Pixel art

Décommenter la règle `image-rendering: pixelated` dans `style.css`. Attention : l'échelle
d'affichage varie en continu, donc les pixels ne tomberont pas toujours juste. Un dessin
en 64 × 64 minimum limite la casse.
