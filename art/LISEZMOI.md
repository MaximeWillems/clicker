# Illustrations

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
