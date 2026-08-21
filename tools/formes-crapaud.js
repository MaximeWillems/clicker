/* Les CINQ FORMES de la lignée du crapaud, décrites une seule fois dans un repère de
   32 unités. Aucune couleur ici, aucun contour : seulement des volumes et des lettres.
   Le style — palette, contour, taille de grille — est décidé ailleurs, dans styles.js.
   C'est ce qui permet de rhabiller toute la lignée sans retoucher une silhouette. */
'use strict';

function oeil(P, g, x, y, r) {
  P.ellipse(g, x, y, r, r, 'n');
  P.ellipse(g, x, y + r * 0.2, r * 0.5, r * 0.55, 'p');
}

const FORMES = {
  tetard: (P, g) => {
    P.poly(g, [[16, 14], [26, 9], [29, 16], [26, 23], [16, 18]], 'v');
    P.ellipse(g, 12, 16, 8.5, 7.5, 'V');
    P.ellipse(g, 12, 13, 6, 3, 'c');
    P.ellipse(g, 12, 19, 6, 3.5, 'b');
    oeil(P, g, 9, 13, 1.9); oeil(P, g, 15, 13, 1.9);
  },

  crapaud: (P, g) => {
    P.ellipse(g, 16, 19, 12, 8, 'V');
    P.ellipse(g, 4.5, 25, 4, 2.6, 'v');
    P.ellipse(g, 27.5, 25, 4, 2.6, 'v');
    P.ellipse(g, 7, 14, 3.2, 3, 'V');
    P.ellipse(g, 25, 14, 3.2, 3, 'V');
    P.ellipse(g, 16, 16, 10, 4, 'c');
    P.ellipse(g, 16, 22, 9, 4.5, 'b');
    oeil(P, g, 7, 13.5, 2); oeil(P, g, 25, 13.5, 2);
    P.rect(g, 11, 19, 10, 1, 'r');
  },

  buffle: (P, g) => {
    P.ellipse(g, 16, 18, 13, 8.5, 'V');
    P.ellipse(g, 3.5, 25.5, 4.5, 3, 'v');
    P.ellipse(g, 28.5, 25.5, 4.5, 3, 'v');
    P.ellipse(g, 6, 11, 3.6, 3.4, 'V');
    P.ellipse(g, 26, 11, 3.6, 3.4, 'V');
    P.ellipse(g, 16, 14, 11, 4.5, 'c');
    P.ellipse(g, 16, 25, 10, 5.5, 'b');
    oeil(P, g, 6, 10.5, 2.3); oeil(P, g, 26, 10.5, 2.3);
    P.rect(g, 9, 18, 14, 1, 'r');
  },

  colosse: (P, g) => {
    P.ellipse(g, 2.5, 26, 4.5, 3.5, 'v');
    P.ellipse(g, 29.5, 26, 4.5, 3.5, 'v');
    P.ellipse(g, 16, 16, 13.5, 9, 'v');
    P.ellipse(g, 16, 13, 10.5, 5, 'V');
    for (const [x, y] of [[8, 6], [16, 3], [24, 6]])
      P.poly(g, [[x - 4.5, y + 8], [x, y], [x + 4.5, y + 8]], 't');
    P.ellipse(g, 16, 24, 11, 6, 'V');
    P.ellipse(g, 16, 22, 9.5, 3.5, 'c');
    P.ellipse(g, 16, 27, 7.5, 3, 'b');
    oeil(P, g, 10.5, 22, 2.1); oeil(P, g, 21.5, 22, 2.1);
    P.rect(g, 11, 27, 10, 1, 'r');
  },

  gama: (P, g) => {
    P.ellipse(g, 1.5, 27.5, 4.5, 3.5, 'v');
    P.ellipse(g, 30.5, 27.5, 4.5, 3.5, 'v');
    P.ellipse(g, 16, 21, 15, 10, 'v');
    P.poly(g, [[4, 15], [10, 4], [15, 12], [20, 2], [26, 10], [29, 15]], 't');
    P.poly(g, [[10, 4], [12.5, 8], [7.5, 8]], 'b');
    P.poly(g, [[20, 2], [23, 7], [17, 7]], 'b');
    P.ellipse(g, 16, 25, 12, 6, 'V');
    P.ellipse(g, 16, 23, 10, 3, 'c');
    P.ellipse(g, 16, 28, 9, 3, 'b');
    oeil(P, g, 9.5, 23, 2.3); oeil(P, g, 22.5, 23, 2.3);
    P.rect(g, 9, 28, 14, 1, 'r');
  },
};

const ORDRE = [
  ['tetard', 'Têtard'], ['crapaud', 'Crapaud'], ['buffle', 'Crapaud-buffle'],
  ['colosse', 'Colosse fangeux'], ['gama', 'Gama'],
];

module.exports = { FORMES, ORDRE };
