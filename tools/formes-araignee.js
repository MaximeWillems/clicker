/* Les cinq formes de l'Araignée, dans un repère de 32 unités.

   REGISTRE MASCOTTE, comme les communes et les rares. Ce qui distingue cette lignée de toutes
   les autres n'est pas une couleur : c'est qu'elle a HUIT PATTES, et que huit pattes fines
   deviennent du bruit à vingt-quatre pixels. On en trace donc QUATRE PAR CÔTÉ, épaisses, en
   éventail — et surtout APRÈS l'abdomen, sinon le corps les recouvre et il ne reste qu'une
   boule. C'est la leçon du crapaud appliquée à un corps qui n'a presque que ça.

   LE SABLIER EST LA CONSTANTE. Il est là aux cinq stades, il grossit avec l'abdomen, et il
   est la seule marque intérieure autorisée : une bête que l'on reconnaît par son dos plutôt
   que par sa silhouette n'existe pas en vignette, mais celui-ci est GRAND et centré, donc il
   survit à la réduction. Au dernier stade il déborde en fils d'or, et c'est la seule chose
   qui change de nature dans toute la lignée.

   L'ARC EST CELUI DE L'ABDOMEN QUI AVALE LES PATTES :
     nymphe      presque tout abdomen, huit moignons
     araignée    les mêmes pattes, allongées, le corps encore petit
     veuve       les pattes épaissies, l'abdomen rond et plein
     tisseuse    les pattes repliées SOUS un abdomen bien plus gros, un flocon de soie au dos
     arachné     un dôme qui remplit le cadre, des pattes courtes, une face minuscule devant */
'use strict';

/* QUATRE PATTES PAR CÔTÉ, en éventail depuis un même point d'attache. Chacune est un
   triangle plein plutôt qu'un trait : un trait d'un pixel disparaît au premier contour, et
   deux traits collés font une tache. `ouv` écarte l'éventail, `l` donne l'allonge. */
function pattes(P, g, cx, cy, sens, l, ouv, c) {
  const angles = [-0.95, -0.32, 0.32, 0.95].map(a => a * ouv);
  for (const a of angles) {
    const dx = sens * Math.cos(a), dy = Math.sin(a);
    const x = cx + dx * l, y = cy + dy * l;
    /* UNE PATTE EST UN QUADRILATÈRE, PAS UN TRIANGLE, et c'est la deuxième version. Un
       triangle s'affine jusqu'au sous-pixel : le bout n'a plus de corps, le contour
       automatique le remplit entièrement, et il reste une poussière de points noirs autour
       de la bête. Elle avait huit pattes et on lisait une boule sale.

       On garde donc une épaisseur JUSQU'AU BOUT — perpendiculaire à la patte, plus fine à
       l'extrémité qu'à l'attache, mais jamais nulle. C'est la même règle que la bouche droite
       du crapaud : à cette taille, tout ce qui s'affine disparaît. */
    const px = -dy, py = dx;
    P.poly(g, [[cx - px * 2, cy - py * 2], [cx + px * 2, cy + py * 2],
               [x + px * 1.3, y + py * 1.3], [x - px * 1.3, y - py * 1.3]], c || 'v');
  }
}

/* LE SABLIER : deux triangles pointe contre pointe. En une seule forme il devient une tache
   ronde dès que le contour passe ; en deux, la taille se lit encore à vingt-quatre pixels. */
function sablier(P, g, x, y, l, h, c) {
  P.poly(g, [[x - l, y - h], [x + l, y - h], [x, y]], c || 'r');
  P.poly(g, [[x - l, y + h], [x + l, y + h], [x, y]], c || 'r');
}

// Un gros œil rond, et c'est voulu : le registre mascotte tient dans ce rond-là.
function oeil(P, g, x, y, r) {
  P.ellipse(g, x, y, r, r, 'n');
  P.ellipse(g, x, y + r * 0.25, r * 0.45, r * 0.5, 'p');
}

/* L'ORDRE EST LA MOITIÉ DU DESSIN, et la première passe l'a payé : les pattes tracées AVANT
   l'abdomen disparaissent sous lui, et il ne reste qu'une boule à visage. C'est mot pour mot
   la leçon écrite en tête de ce fichier et en tête de celui du crapaud — « ce qui distingue la
   bête doit dépasser, donc être tracé après le corps » — et l'avoir écrite n'a pas suffi à ne
   pas la refaire. L'ordre est donc : ABDOMEN, puis PATTES, puis le sablier et la face.

   Et « dépasser » est une mesure, pas une intention : une patte plus courte que le rayon de
   l'abdomen reste dedans, quel que soit l'ordre. L'allonge est comptée depuis le bord. */
const FORMES = {
  nymphe: (P, g) => {
    P.ellipse(g, 16, 16, 8.5, 8, 'V');            // presque tout abdomen
    pattes(P, g, 10, 18, -1, 9, 1, 'v');
    pattes(P, g, 22, 18, 1, 9, 1, 'v');
    sablier(P, g, 16, 16, 3, 3.5);
    P.ellipse(g, 16, 25, 4.5, 3.5, 'V');          // la face, petite, devant
    oeil(P, g, 13.5, 25, 2); oeil(P, g, 18.5, 25, 2);
  },

  araignee: (P, g) => {
    P.ellipse(g, 16, 14, 8, 7.5, 'V');
    pattes(P, g, 9, 16, -1, 9.5, 1.05, 'v');      // les mêmes pattes, allongées
    pattes(P, g, 23, 16, 1, 9.5, 1.05, 'v');
    sablier(P, g, 16, 14, 3, 3.5);
    P.ellipse(g, 16, 23.5, 5, 4, 'V');
    P.ellipse(g, 16, 21, 3, 2, 'c');              // le duvet entre le corps et la face
    oeil(P, g, 13.5, 23.5, 2.2); oeil(P, g, 18.5, 23.5, 2.2);
  },

  'veuve-noire': (P, g) => {
    P.ellipse(g, 16, 14, 10, 9.5, 'V');           // rond et plein
    /* ONZE ET NON TREIZE : au-delà, les bouts sortent du cadre et se font trancher net.
       Une patte coupée par le bord ne se lit pas comme une patte longue, elle se lit comme un
       dessin mal cadré — et c'est le seul défaut que la vignette de vingt-quatre pixels
       amplifie au lieu de le cacher. */
    pattes(P, g, 8, 15, -1, 11, 1.1, 'v');        // épaissies, elles portent la bête
    pattes(P, g, 24, 15, 1, 11, 1.1, 'v');
    sablier(P, g, 16, 14, 4, 4.5);
    P.ellipse(g, 16, 25, 5.5, 4.2, 'V');
    oeil(P, g, 13.5, 25, 2.2); oeil(P, g, 18.5, 25, 2.2);
  },

  'tisseuse-d-ombre': (P, g) => {
    P.ellipse(g, 16, 15, 12.5, 11.5, 'V');        // un abdomen bien plus gros
    /* LES PATTES SE REPLIENT SOUS LE CORPS : courtes, basses, l'éventail presque fermé.
       Elles dépassent encore — sans quoi la bête cesserait d'être une araignée — mais juste
       assez pour se compter, ce qui est exactement ce que « repliées » veut dire. */
    pattes(P, g, 8, 22, -1, 8, 0.55, 'v');
    pattes(P, g, 24, 22, 1, 8, 0.55, 'v');
    P.ellipse(g, 16, 4.5, 6.5, 3, 'b');           // le flocon de soie, il dépasse du dos
    sablier(P, g, 16, 15, 4.5, 5);
    P.ellipse(g, 16, 27, 5, 3.6, 'V');
    P.rect(g, 12, 26.5, 3, 2, 'n'); P.rect(g, 17, 26.5, 3, 2, 'n');   // paupières basses
    P.rect(g, 13, 26.5, 1, 2, 'p'); P.rect(g, 18, 26.5, 1, 2, 'p');
  },

  arachne: (P, g) => {
    P.ellipse(g, 16, 15, 14, 12.5, 'V');          // le dôme remplit le cadre
    pattes(P, g, 5, 24, -1, 6, 0.5, 'v');         // courtes, en bas, contre la masse
    pattes(P, g, 27, 24, 1, 6, 0.5, 'v');
    /* LES FILS D'OR SONT DEUX TRAITS, PAS UNE TOILE. La première passe en traçait deux grands
       triangles qui barraient tout le dôme : à vingt-quatre pixels ça ne se lisait pas comme
       des fils, ça se lisait comme une avarie. Le sablier grossi porte l'or ; les deux traits
       ne font que le prolonger vers le bas. */
    sablier(P, g, 16, 14, 5.5, 6, 't');
    P.rect(g, 11, 20, 2, 6, 't');                 // les deux fils, francs et non effilés
    P.rect(g, 19, 20, 2, 6, 't');
    P.ellipse(g, 16, 28, 4.5, 3.2, 'V');          // une face minuscule, tout devant
    P.rect(g, 12.5, 27.5, 2.5, 2, 'n'); P.rect(g, 17, 27.5, 2.5, 2, 'n');
    P.rect(g, 13, 27.5, 1, 2, 'p'); P.rect(g, 18, 27.5, 1, 2, 'p');
  },
};

const ORDRE = [
  ['nymphe',            'Nymphe'],
  ['araignee',          'Araignée'],
  ['veuve-noire',       'Veuve noire'],
  ['tisseuse-d-ombre',  'Tisseuse d’ombre'],
  ['arachne',           'Arachné, fileuse du sort'],
];

module.exports = { FORMES, ORDRE };
