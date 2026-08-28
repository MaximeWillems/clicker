/* Les cinq formes de la lignée du crapaud, dans un repère de 32 unités.

   Leçon des passes précédentes, payée cher : à cette taille, AJOUTER DU DÉTAIL DÉGRADE.
   Doigts, mouchetures, crêtes en cinq pointes — tout se transforme en bruit dès que le
   contour automatique passe. La règle est donc : six formes par créature au maximum,
   toutes grandes, et ce qui distingue la bête doit DÉPASSER de sa silhouette.

   Ce qui différencie les cinq n'est pas le décor mais les PROPORTIONS :
     têtard   tête énorme, pas de pattes
     crapaud  tête et corps à parts égales
     buffle   corps large et bas, yeux écartés très haut
     colosse  dos qui surplombe la tête, hérissé
     gama     tête minuscule au ras du sol sous une montagne */
'use strict';

/* Une bouche DROITE. En arc, la parabole traverse trois rangées et se fragmente en
   escalier, qui se lit comme des points éparpillés — surtout par-dessus le ventre. */
function bouche(P, g, x0, x1, y) { P.rect(g, x0, y, x1 - x0, 1, 'r'); }

// Un œil : le blanc, la pupille. Rien d'autre — un anneau de plus et tout se brouille.
function oeil(P, g, x, y, r) {
  P.ellipse(g, x, y, r, r, 'n');
  P.ellipse(g, x, y + r * 0.25, r * 0.45, r * 0.5, 'p');
}

const FORMES = {
  tetard: (P, g) => {
    P.poly(g, [[13, 13], [25, 7], [30, 15], [25, 24], [13, 20]], 'v');
    P.ellipse(g, 11, 16, 8.5, 8, 'V');
    P.ellipse(g, 11, 12, 6, 3, 'c');
    P.ellipse(g, 11, 20, 6, 3.5, 'b');
    oeil(P, g, 8, 14, 2); oeil(P, g, 14, 14, 2);
    bouche(P, g, 7, 15, 19);
  },

  crapaud: (P, g) => {
    P.ellipse(g, 7, 26, 4.2, 3, 'v');          // pattes : elles doivent TOUCHER le corps,
    P.ellipse(g, 25, 26, 4.2, 3, 'v');         // sinon elles flottent à côté
    P.ellipse(g, 16, 20, 10.5, 7.5, 'V');      // corps
    P.ellipse(g, 16, 13.5, 8.5, 5.5, 'V');     // tête, fondue dans le corps
    P.ellipse(g, 16, 11.5, 6, 3, 'c');
    P.ellipse(g, 16, 23, 7.5, 3.5, 'b');
    oeil(P, g, 10, 11, 2.2); oeil(P, g, 22, 11, 2.2);
    bouche(P, g, 10, 22, 16);
  },

  buffle: (P, g) => {
    P.ellipse(g, 5.5, 26.5, 4.6, 3.2, 'v');
    P.ellipse(g, 26.5, 26.5, 4.6, 3.2, 'v');
    P.ellipse(g, 16, 20.5, 14, 8.5, 'V');      // corps très large et bas
    P.ellipse(g, 16, 11, 9, 5.5, 'V');         // tête haute et étroite
    P.ellipse(g, 16, 22.5, 8.5, 4.5, 'c');     // gorge gonflée, en avant
    P.ellipse(g, 16, 27, 6, 2, 'b');
    oeil(P, g, 9, 8.5, 2.2); oeil(P, g, 23, 8.5, 2.2);   // écartés et hauts, sans déborder
    bouche(P, g, 9, 23, 14);
  },

  colosse: (P, g) => {
    P.ellipse(g, 6, 26.5, 4.8, 3.4, 'v');
    P.ellipse(g, 26, 26.5, 4.8, 3.4, 'v');
    P.ellipse(g, 16, 15, 13, 9, 'v');          // dos massif et sombre
    P.poly(g, [[5, 12], [10, 4], [16, 11], [22, 4], [27, 12]], 't');   // crête, une seule pièce
    P.ellipse(g, 16, 23.5, 10.5, 6, 'V');      // tête basse, poussée en avant
    P.ellipse(g, 16, 27, 7, 2.5, 'b');
    oeil(P, g, 10.5, 21, 2.2); oeil(P, g, 21.5, 21, 2.2);
    bouche(P, g, 10, 22, 25);
  },

  gama: (P, g) => {
    P.ellipse(g, 5, 27.5, 5.2, 3.6, 'v');
    P.ellipse(g, 27, 27.5, 5.2, 3.6, 'v');
    P.ellipse(g, 16, 21, 15, 10, 'v');
    P.poly(g, [[2, 17], [9, 5], [15, 13], [21, 2], [27, 11], [30, 17]], 't');  // massif, une pièce
    P.poly(g, [[21, 2], [25, 8], [17, 8]], 'b');                                // neige
    P.ellipse(g, 16, 26, 11, 5, 'V');          // tête minuscule au ras du sol
    P.ellipse(g, 16, 28.5, 7.5, 2, 'b');
    oeil(P, g, 10, 24, 2.2); oeil(P, g, 22, 24, 2.2);
    bouche(P, g, 10, 22, 27);
  },
};

const ORDRE = [
  ['tetard', 'Têtard'], ['crapaud', 'Crapaud'], ['buffle', 'Crapaud-buffle'],
  ['colosse', 'Crapaud-tourbière'], ['gama', 'Gama'],
];

module.exports = { FORMES, ORDRE };
