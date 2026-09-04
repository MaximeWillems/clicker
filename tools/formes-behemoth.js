/* Les cinq formes du Béhémoth, dans un repère de 32 unités.

   REGISTRE IDOLE, et il se joue dans les PROPORTIONS, pas dans le décor. La règle du crapaud
   vaut ici aussi — six formes au maximum, toutes grandes, et ce qui distingue la bête doit
   DÉPASSER de sa silhouette, donc être tracé après le corps. Ce qui change d'un registre à
   l'autre n'est pas la technique, c'est la posture : rien de mignon, aucun grand œil rond,
   une paupière basse et une bouche fermée.

   L'ARC EST CELUI DE LA MASSE QUI MANGE LA TÊTE :
     ossement     rien qu'un éclat d'os et deux yeux — déjà un dieu, en tout petit
     saurien      un corps rond sur quatre pattes courtes, la tête encore haute
     béhémoth     le corps l'emporte, la tête a rapetissé et descendu
     éternel      le dos se voûte au-dessus de la tête, plaques comprises
     primordial   une montagne qui remplit le cadre, une tête minuscule au ras du sol

   Le premier stade est le piège de la lignée : « déjà accompli » veut dire qu'un éclat d'os
   doit se tenir comme un dieu, pas comme un débris. Il est donc DEBOUT, posé bien au centre,
   et ses deux yeux sont la seule chose vive de la grille. */
'use strict';

/* UN ŒIL DE PAUPIÈRE BASSE : un bandeau, jamais un rond. Le rond est ce qui rend une bête
   attendrissante, et c'est exactement ce que ce registre refuse. La paupière est tracée
   PAR-DESSUS le blanc, sur sa moitié haute — un œil mi-clos se lit à vingt-quatre pixels,
   une pupille de deux pixels ne se lit pas. */
function oeilBas(P, g, x, y, l, c) {
  /* IL FAUT AU MOINS DEUX CELLULES DE BLANC DE CHAQUE CÔTÉ DE LA PUPILLE, sans quoi le
     contrôle de charte relève des « cellules isolées » — et il a raison : un pixel blanc seul
     entre du noir et de la couleur n'est pas un reflet, c'est du bruit de quantification. La
     largeur minimale d'un œil n'est donc pas un goût, c'est une contrainte de la grille. */
  const L = Math.max(3, l);
  P.rect(g, x - L, y, L * 2, 2, c || 'n');
  P.rect(g, x - L, y, L * 2, 1, 'V');
  P.rect(g, x - 1, y, 2, 2, 'p');
}

/* LES PLAQUES DU DOS. Trois, et elles dépassent : posées à l'intérieur de la ligne du dos
   elles deviennent des taches, et le contour automatique les avale. */
function plaques(P, g, xs, y, r) {
  for (const x of xs) P.ellipse(g, x, y, r, r * 0.72, 'c');
}

const FORMES = {
  ossement: (P, g) => {
    /* UN OS EST UNE HAMPE ÉTROITE ENTRE DEUX RENFLEMENTS, et la première passe l'avait perdu :
       une ellipse de plus au milieu bouchait la taille, si bien que la silhouette rendait une
       gélule. C'est la même faute que les cinq crapauds qui ne différaient que par le décor —
       ce qui fait l'os est sa TAILLE, pas ses bosses. */
    P.ellipse(g, 16, 22.5, 5.5, 4, 'n');          // le renflement du bas
    P.rect(g, 13, 12, 6, 11, 'n');                // la hampe, étroite mais franche
    P.ellipse(g, 12.5, 11, 4, 3.6, 'n');          // le renflement du haut, en deux lobes
    P.ellipse(g, 19.5, 11, 4, 3.6, 'n');
    /* LES DEUX YEUX SONT LA SEULE CHOSE VIVE, donc ils vont sur le haut, là où un regard se
       cherche — au milieu de la hampe ils se lisaient comme deux taches sur un manche. */
    // deux blocs francs plutôt que deux ellipses : un rond de deux pixels de rayon laisse
    // quatre coins isolés, et quatre coins isolés ne font pas un regard
    P.rect(g, 11, 10, 3, 3, 'r');
    P.rect(g, 18, 10, 3, 3, 'r');
  },

  saurien: (P, g) => {
    P.ellipse(g, 27, 22, 5, 2.6, 'v');            // la queue, courte et basse
    P.ellipse(g, 9.5, 26, 3.4, 2.6, 'v');         // les pattes, trapues, sous le corps
    P.ellipse(g, 18, 26, 3.4, 2.6, 'v');
    P.ellipse(g, 15.5, 20, 10, 7.5, 'V');         // le corps, rond
    P.ellipse(g, 9, 12.5, 6, 5, 'V');             // la tête, encore haute et nette
    P.ellipse(g, 14, 22, 7, 4, 'c');              // le ventre
    oeilBas(P, g, 7, 12, 2.4);
  },

  behemoth: (P, g) => {
    P.ellipse(g, 29, 21, 4.5, 2.4, 'v');
    P.ellipse(g, 10, 27, 4, 2.8, 'v');
    P.ellipse(g, 20, 27, 4, 2.8, 'v');
    P.ellipse(g, 16.5, 18.5, 12.5, 9.5, 'V');     // le corps l'emporte
    P.ellipse(g, 7.5, 14, 5.5, 4.5, 'V');         // la tête a rapetissé et descendu
    P.ellipse(g, 16, 22, 9, 4.5, 'c');
    oeilBas(P, g, 7, 13.5, 3);
  },

  'behemoth-eternel': (P, g) => {
    P.ellipse(g, 30, 22, 4, 2.2, 'v');
    P.ellipse(g, 11, 28, 4.6, 2.8, 'v');
    P.ellipse(g, 21.5, 28, 4.6, 2.8, 'v');
    P.ellipse(g, 17, 18.5, 14, 10.5, 'V');        // le dos surplombe désormais la tête
    P.ellipse(g, 6.5, 19, 5, 4.4, 'V');           // la tête est passée sous la masse
    P.ellipse(g, 16.5, 22.5, 10, 4.5, 'c');
    plaques(P, g, [10, 16, 22], 8.5, 3.4);        // les plaques dépassent du dos
    oeilBas(P, g, 6, 18.5, 3);
  },

  'behemoth-primordial': (P, g) => {
    P.ellipse(g, 17, 19, 16, 13, 'V');            // la montagne remplit le cadre
    P.ellipse(g, 16.5, 24, 13, 6.5, 'c');
    plaques(P, g, [8, 15, 22, 28], 7, 3.8);
    P.ellipse(g, 7, 27, 4.4, 3.4, 'V');           // la tête, minuscule, au ras du sol
    P.rect(g, 12, 29, 6, 3, 'v');                 // ce qui reste des pattes : deux socles
    P.rect(g, 21, 29, 6, 3, 'v');
    oeilBas(P, g, 7, 26.5, 3);
  },
};

const ORDRE = [
  ['ossement',             'Ossement'],
  ['saurien',              'Saurien'],
  ['behemoth',             'Béhémoth'],
  ['behemoth-eternel',     'Béhémoth éternel'],
  ['behemoth-primordial',  'Béhémoth primordial'],
];

module.exports = { FORMES, ORDRE };
