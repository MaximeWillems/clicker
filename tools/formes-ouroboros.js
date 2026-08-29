/* Les cinq formes de l'Ouroboros, dans un repère de 32 unités.

   LA RÈGLE DE LA LIGNÉE, et tout le fichier en découle : l'anneau est IDENTIQUE du premier
   au dernier âge. Ce qui grandit est CE QU'IL CONTIENT — rien, une lueur, un monde. La bête
   ne grossit pas, le cadre devient immense.

   C'est pour ça que `anneau()` et `tete()` sont écrits une fois et appelés cinq fois avec
   les mêmes proportions : la continuité n'est pas une discipline de dessin ici, elle est
   structurelle. On ne PEUT pas dériver.

   Deux leçons reprises du crapaud, et une payée sur la planche générée :
     - six formes par créature au maximum, toutes grandes ; le détail devient du bruit
       dès que le contour automatique passe ;
     - ce qui distingue la bête doit DÉPASSER de sa silhouette, donc être tracé après ;
     - LA TÊTE DOIT ÊTRE GROSSE. Sur la planche générée elle faisait douze pixels de large,
       le contour en prenait un de chaque côté et la gueule ouverte en reprenait autour de
       son ouverture : il ne restait rien à l'intérieur, et la tête sortait en pâté noir. */
'use strict';

/* Le corps du serpent, vu de l'extérieur : le dos sombre, le ventre clair sur la courbe
   intérieure. Trois ellipses concentriques, la dernière creusant le vide. */
function anneau(P, g, cx, cy, rx, ry) {
  P.ellipse(g, cx, cy, rx, ry, 't');
  P.ellipse(g, cx, cy, rx - 2.6, ry - 2.6, 'b');
  P.ellipse(g, cx, cy, rx - 5.2, ry - 5.2, '.');
}

/* Les bandes d'or sont l'INSIGNE, pas la décoration : peu nombreuses et larges. On les pose
   sur le chemin de l'anneau, à des angles choisis, puis on recreuse le vide — sinon elles
   bavent vers le centre et l'anneau se referme. */
function bandes(P, g, cx, cy, rx, ry, angles) {
  for (const a of angles) {
    const t = a * Math.PI / 180;
    P.ellipse(g, cx + (rx - 2.6) * Math.cos(t), cy + (ry - 2.6) * Math.sin(t), 2.1, 2.1, 'c');
  }
  P.ellipse(g, cx, cy, rx - 5.2, ry - 5.2, '.');
}

/* La tête. `ouverture` va de 0 — la mâchoire simplement fermée sur la queue — à 1, la
   gueule décrochée plus large que le cou.

   Elle est volontairement DISPROPORTIONNÉE par rapport à l'anneau. À l'échelle où le jeu
   affiche une vignette, une tête « juste » disparaît. */
function tete(P, g, x, y, ouverture) {
  const ecart = 1.0 + 4.2 * ouverture;        // l'écartement des deux mâchoires

  /* Le crâne d'abord, et il domine. Premier essai raté à ne pas refaire : la gueule était
     tracée aussi large que le crâne, si bien que la tête sortait en PAVÉ NOIR — le défaut
     exact qu'on reprochait à la planche générée. Le sombre de la gueule ne doit jamais être
     que la MOITIÉ de la tête. */
  P.poly(g, [[x - 5.0, y - 2.6], [x + 1.4, y - 4.2], [x + 5.6, y - 1.0],
             [x + 5.2, y + 2.0], [x - 1.0, y + 3.4], [x - 5.2, y + 1.0]], 't');

  // la mâchoire haute, qui dépasse en pointe vers la droite
  P.poly(g, [[x + 1.0, y - 2.0], [x + 7.6, y - 1.4 - ecart * 0.5],
             [x + 7.4, y - 0.2 - ecart * 0.4], [x + 1.2, y + 0.6]], 't');

  // l'intérieur : UNE forme plate sombre, jamais de dents. Étroite, coincée entre les deux.
  P.poly(g, [[x + 1.6, y + 0.2], [x + 7.2, y - 0.4 - ecart * 0.35],
             [x + 7.0, y + 0.9 + ecart * 0.45], [x + 1.6, y + 1.6]], 'o');

  // la mâchoire basse, CRÈME : c'est elle qui fait lire la gueule quand tout le sombre
  // s'écrase sur la même valeur. Sans ce contraste clair-contre-sombre, la tête est un pâté.
  P.poly(g, [[x + 1.4, y + 1.2], [x + 7.0, y + 0.8 + ecart * 0.5],
             [x + 6.4, y + 2.2 + ecart * 0.6], [x + 1.2, y + 2.6]], 'n');

  // l'œil : une fente mi-close, jamais un rond — c'est la ligne du registre idole.
  P.rect(g, x - 2.6, y - 1.2, 3.0, 0.9, 'n');
  P.rect(g, x - 1.4, y - 1.2, 1.2, 0.9, 'o');
}

/* Le monde du dernier âge : un disque plat, deux ou trois taches de continent, deux lunes.
   Jamais un globe réaliste — la charte l'interdit et le pixel ne le rendrait pas. */
function monde(P, g, cx, cy, r) {
  P.ellipse(g, cx, cy, r, r, 'r');
  P.ellipse(g, cx - r * 0.35, cy - r * 0.25, r * 0.42, r * 0.30, 'V');
  P.ellipse(g, cx + r * 0.30, cy + r * 0.30, r * 0.38, r * 0.34, 'V');
  P.ellipse(g, cx + r * 0.20, cy - r * 0.45, r * 0.22, r * 0.18, 'V');
}

const FORMES = {
  // ── 1 · déjà un anneau fermé. Pas un petit, pas une mue : un dieu complet, et vide. ──
  ouroboros: (P, g) => {
    anneau(P, g, 16, 17.5, 10.5, 11.5);
    bandes(P, g, 16, 17.5, 10.5, 11.5, [35, 130, 250]);
    tete(P, g, 10.0, 9.0, 0);
  },

  /* ── 2 · LE MÊME anneau, tordu. UNE seule boucle, pincée d'un côté et large de l'autre.
     Jamais deux boucles : le huit appartient au troisième âge, et c'est l'erreur exacte
     qu'il a fallu corriger sur la planche générée. Le pincement se creuse au lieu de se
     dessiner — on retire une ellipse sur le flanc gauche. */
  eveille: (P, g) => {
    anneau(P, g, 17, 17.5, 10.5, 11.5);
    P.ellipse(g, 6.5, 17.5, 5.2, 4.0, '.');       // le pincement
    P.ellipse(g, 9.8, 17.5, 3.2, 2.6, 't');       // le corps se resserre, il ne se coupe pas
    bandes(P, g, 17, 17.5, 10.5, 11.5, [40, 145, 265]);
    tete(P, g, 11.0, 8.5, 0.25);
  },

  // ── 3 · le corps est assez long pour boucler DEUX fois : un huit, une boucle devant. ──
  clos: (P, g) => {
    anneau(P, g, 15.5, 23, 8.6, 7.6);             // la boucle du bas, DERRIÈRE
    anneau(P, g, 16.5, 11.5, 9.4, 8.4);           // celle du haut, devant, tracée après
    bandes(P, g, 16.5, 11.5, 9.4, 8.4, [55, 200]);
    bandes(P, g, 15.5, 23, 8.6, 7.6, [340]);
    tete(P, g, 10.5, 6.5, 0.6);
  },

  /* ── 4 · trois boucles, et dans l'espace qu'elles enferment une LUEUR : une seule forme
     plate pâle, à bord net. Jamais un flou — la charte n'autorise la lumière que comme
     une couleur de plus. C'est le premier âge où l'anneau contient quelque chose. */
  'sans-fin': (P, g) => {
    anneau(P, g, 16, 24.5, 9.0, 6.8);
    anneau(P, g, 15.5, 17, 10.2, 7.4);
    anneau(P, g, 16.5, 9.5, 8.8, 6.6);
    bandes(P, g, 15.5, 17, 10.2, 7.4, [15, 165]);
    bandes(P, g, 16, 24.5, 9.0, 6.8, [300]);
    // La lueur vient APRÈS les bandes : `bandes` recreuse le centre en finissant, et
    // effacerait ce que l'anneau contient. Ce qu'il contient se pose toujours en dernier.
    P.ellipse(g, 15.5, 17, 3.4, 2.6, 'n');
    tete(P, g, 10.5, 5.5, 0.85);
  },

  /* ── 5 · les boucles balaient le cadre comme une orbite, et au centre un monde. La bête
     n'a pas grossi d'un pixel : c'est ce qu'elle entoure qui est devenu immense. */
  'boucle-du-monde': (P, g) => {
    anneau(P, g, 16, 26, 10.0, 6.0);              // la boucle du bas, derrière
    anneau(P, g, 16, 16, 13.5, 11.0);             // l'orbite, tracée après pour passer devant
    bandes(P, g, 16, 16, 13.5, 11.0, [30, 150, 210, 330]);
    // Ce que l'anneau contient se pose en dernier, après les bandes qui recreusent le centre.
    monde(P, g, 16, 16, 5.6);
    P.ellipse(g, 25.5, 22.5, 1.7, 1.7, 'c');      // deux lunes, deux ronds simples
    P.ellipse(g, 7.5, 10.5, 1.2, 1.2, 'n');
    tete(P, g, 8.5, 6.0, 1);
  },
};

const ORDRE = [
  ['ouroboros',       'Ouroboros'],
  ['eveille',         'Ouroboros éveillé'],
  ['clos',            'Ouroboros clos'],
  ['sans-fin',        'Ouroboros sans fin'],
  ['boucle-du-monde', 'Ouroboros, la boucle du monde'],
];

module.exports = { FORMES, ORDRE };
