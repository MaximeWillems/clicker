# L'outil de sprites — brief de session

Tu ouvres une session dédiée à un seul chantier : **rendre les sprites d'Éclosion corrigibles**.
Lis ce fichier, puis `art/LISEZMOI.md`, `tools/pixels.js`, `tools/styles.js`,
`tools/formes-crapaud.js`, `tools/rendu.js` et `tools/decouper.py` avant d'écrire une ligne.

## Le problème

27 lignées × 5 formes = **135 sprites, 50 faits**. `MERVEILLES.md` en ajoute une dizaine, avec
des **animations**. Deux pipelines existent aujourd'hui, et ils ne se parlent pas.

**A · Le générateur, dans `tools/`.** Une créature est décrite en primitives géométriques
(`ellipse`, `rect`, `poly`, `arc`) dans un repère de 32 unités, rastérisée sur une grille,
contournée automatiquement, sortie en SVG `shape-rendering="crispEdges"`. La silhouette et le
style sont séparés : `formes-*.js` ne contient pas une couleur, `styles.js` porte la palette, le
mode de contour et la taille de grille. `P.apercu(g)` imprime la grille **en texte, un caractère
par pixel**.

C'est du vrai pixel art, déterministe, et corrigible en éditant six nombres. **Il n'existe que
pour le crapaud.**

**B · Le modèle d'images.** Un prompt par lignée dans `prompts/`, une planche générée à
l'extérieur (ChatGPT), découpée par `tools/decouper.py`. Les 50 dessins livrés viennent de là.
Trois défauts :

- **ce n'est pas du pixel art.** `decouper.py` redimensionne en LANCZOS à 256 px, et la planche
  arrive anti-aliasée en centaines de couleurs — alors que le prompt exige *« TRUE 32x32 pixel
  art, upscaled with nearest-neighbor only »* et *« maximum 6 flat colors »* ;
- **le style dérive** d'une séance à l'autre, ce qui a déjà conduit à demander les cinq formes
  dans une seule image puis plusieurs lignées dans une seule séance ;
- **une correction demande de tout regénérer**, et le modèle se trompe souvent.

## Ce qu'il faut construire

**Le pont entre les deux.** Un outil qui transforme une planche générée en **grille de
caractères** — la représentation du pipeline A — pour que le résultat soit enfin du vrai pixel
art, corrigible cellule par cellule dans une conversation, et animable.

Le format de fichier existe déjà : c'est la sortie de `P.apercu()`, un caractère par pixel, dont
les clés sont celles des palettes de `styles.js` (`o` contour, `v V c b` corps, `n` blanc,
`p` pupille, `r` rouge, `t` terre, `.` vide). Garde-le, et garde la séparation silhouette/style —
c'est ce qui permet de rhabiller tout le bestiaire d'un coup.

### Les commandes

```
node tools/pixel.js importer art/source-tortue.png tortue --grille 32 --couleurs 6
    planche générée → art/grilles/tortue.txt (les 5 stades, en caractères) + sa palette

node tools/pixel.js texte tortue [--stade 3]
    imprime la ou les grilles dans le terminal — c'est ce qu'on lit pour corriger

node tools/pixel.js rendre tortue [style]
    grilles → art/tortue-N-nom.svg, par le chemin existant de pixels.js

node tools/pixel.js verifier tortue
    le contrôle de charte, détaillé plus bas

node tools/pixel.js planche tortue
    art/apercu-tortue.png : les 5 stades en 160 px, doublés de leur vignette de 24 px

node tools/pixel.js diff tortue --de 4 --a 5
    liste les cellules qui changent d'un stade à l'autre

node tools/pixel.js anim tortue --stade 5 --images 6
    construit la planche d'animation, et REFUSE si une image change plus de cellules
    que déclaré
```

### `importer` est le cœur, et le seul morceau difficile

L'image d'entrée est une illustration agrandie, pas une grille. Il faut :

1. **détourer** — reprendre tel quel le remplissage depuis les bords de `decouper.py`. Ne jamais
   effacer par couleur : ça perce les reflets dans les yeux et laisse un regard mort. Reprendre
   aussi le rebouchage des pixels quasi transparents (alpha 1 à 8, résidus de compression) ;
2. **séparer les cinq stades** — la fonction `blocs()` de `decouper.py` coupe aux N−1 plus grands
   écarts quand on sait combien de bêtes on attend. Elle a été payée cher (le roc et le phénix
   n'étaient séparés que par cinq colonnes vides). Reprends-la, ne la réinvente pas ;
3. **ramener à la grille** — par le **mode** de chaque bloc, jamais par la moyenne : une moyenne
   fabrique des couleurs qui n'existaient pas, et c'est exactement ce qu'on cherche à éliminer ;
4. **quantifier à N couleurs** — soit vers une palette imposée de `styles.js`, soit en extrayant
   les N dominantes puis en écrivant la palette trouvée à côté de la grille ;
5. **reconstruire le contour**, avec `P.contour()` de `pixels.js`.

**Le point 5 n'est pas une option, et il a été vérifié.** Une réduction à six couleurs d'une
illustration anti-aliasée **détruit le trait** : le noir ne survit que dans les zones les plus
sombres, et le reste du contour se fond dans le corps. Sur un essai réel avec
`art/crabe-2-crabe.png`, la grille sortait avec **cent cellules de contour ouvert** — la bête
n'avait plus de trait du tout. N'essaie pas de préserver le contour d'origine : jette-le, et
repose-le sur la silhouette quantifiée. C'est de toute façon ce que fait le pipeline A, et
`art/LISEZMOI.md` le dit — *« le contour est ce qui fait qu'un pixel art simple a l'air fini
plutôt que bâclé — et il est trop pénible à poser à la main »*.

Sortie **déterministe** : même entrée, fichier identique à l'octet.

### `verifier` — le contrôle de charte

Il échoue, avec la liste des cellules fautives, si :

- le nombre de couleurs dépasse celui déclaré (contour compris) ;
- une cellule porte une clé absente de la palette ;
- le fond n'est pas entièrement vide ;
- le contour n'est pas fermé — un pixel plein bordé de vide sans être `o` ;
- **la palette diffère d'un stade à l'autre de la même lignée** ; c'est la dérive de style, et
  c'est le défaut le plus fréquent des planches générées ;
- une cellule isolée n'a aucun voisin de sa couleur — du bruit de quantification.

## Contraintes

- **Node pour le JS, Python + Pillow pour l'image.** C'est ce qui existe déjà. N'ajoute aucune
  dépendance : pas de canvas, pas d'ImageMagick, pas de bibliothèque de quantification.
- **Aucun navigateur, jamais.** C'est écrit en tête de `tools/banc.js` et c'est une règle du
  projet. La sortie est du texte dans le terminal et des PNG que l'utilisateur ouvre lui-même.
- **Déterministe.** Deux exécutions donnent le même octet.
- **Commentaires en français**, au style de `pixels.js` : on explique *pourquoi*, et on note la
  leçon qui a coûté cher. Pas de commentaire qui répète le nom de la fonction.
- **Ne casse pas `decouper.py` ni `rendu.js`.** Le nouvel outil vit à côté ; on migrera lignée
  par lignée, comme `art/` remplace les emoji une lignée à la fois.

## Critères d'acceptation

1. **Aller-retour.** `importer` puis `rendre` puis `importer` redonne la grille identique.
2. **Non-régression sur le crapaud.** C'est la seule lignée qui existe dans les deux mondes : les
   grilles produites par le nouveau chemin doivent correspondre à ce que `node tools/rendu.js
   --apercu` imprime aujourd'hui.
3. **Une planche générée réelle passe.** Prends `art/source-tortue.png` ou n'importe quelle
   `art/source-*.png` : `importer` puis `verifier` doit sortir une grille propre à 6 couleurs, ou
   dire précisément ce qui cloche.
4. **`anim` refuse ce qu'il doit refuser.** Une image qui bouge plus de cellules que déclaré est
   rejetée avec la liste, pas acceptée en silence.
5. **`texte` est lisible dans une conversation.** C'est la finalité de tout l'outil : une grille
   de 32 lignes qu'on colle dans un chat, qu'on corrige à la main, et qu'on renvoie.

## Pourquoi ça vaut le coup

Trois raisons, dans l'ordre d'importance.

**Les animations des merveilles sont impossibles sans ça.** `MERVEILLES.md` demande 4 à 6 images
par merveille où *« seules quelques formes plates changent d'une image à l'autre ; tout le reste
de la planche est identique »*. Aucun modèle d'images ne garde mille pixels figés pendant qu'on
en bouge vingt. Une grille le fait exactement, et c'est la signature du rang le plus haut du jeu.

**Les corrections deviennent des éditions.** Aujourd'hui, corriger une patte demande de
regénérer la planche entière et d'espérer. Avec une grille en texte, c'est trois caractères.

**Les 50 dessins existants deviendraient enfin du pixel art**, ce qu'ils ne sont pas. C'est
optionnel et ça peut attendre — mais l'outil le permettra.

## Ce qu'on ne te demande pas

- **Pas de génération d'images.** L'outil ne dessine rien et n'appelle aucun modèle. L'invention
  reste au modèle d'images, la discipline revient à l'outil.
- **Pas de refonte de `pixels.js`.** Il marche, il est commenté, il porte des leçons payées. On
  s'y branche.
- **Pas d'éditeur visuel.** Le terminal et un PNG qu'on ouvre suffisent, et le projet n'ouvre
  jamais de navigateur.
