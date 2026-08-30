/* ── LES CINQ ŒUFS, CALCULÉS ──────────────────────────────────────────────────
   Écrit `art/grilles/oeufs.txt`, la grille que `tools/pixel.js rendre oeufs` transforme en
   SVG. C'est le seul générateur de grille du projet : les bêtes viennent de planches
   importées, les œufs se calculent.

     node tools/oeufs.js

   POURQUOI CALCULER PLUTÔT QUE TAPER. Trente-deux lignes de trente-deux caractères écrites
   au clavier se décalent d'un pixel sans qu'on le voie, et cinq fois de suite ce sont cinq
   œufs qui n'ont plus la même forme — un défaut qui ne se voit qu'en les posant côte à côte,
   c'est-à-dire jamais, puisqu'on ne les voit qu'un par un dans le jeu. Ici les cinq partagent
   une silhouette au pixel près par construction, et ce qui les sépare est décidé à la main.

   CE QUI LES SÉPARE, ET C'EST DEUX CHOSES : la PALETTE, reprise des couleurs de rareté, et
   le MOTIF — des taches, des bandes, des losanges, une couronne de rayons, une spirale. Une
   forme se lit là où une couleur ne se lit pas : à trente-deux pixels, de loin, ou pour qui
   distingue mal le violet du bleu. Le second signe ne coûtait rien et double ce qui distingue
   les cinq coquilles.

   La grille reste la source éditable : corriger un œuf à la main, c'est éditer des caractères
   dans le .txt puis relancer « rendre ». Ce fichier-ci sert à repartir de zéro, ou à en
   ajouter un sixième. */

'use strict';
const fs = require('fs');
const path = require('path');

const N = 32;
const CX = 15.5, CY = 17.0;   // le centre, un peu bas : il y a plus de coquille dessous
const A = 9.2, B = 12.2;
const POINTE = 0.22;          // ce qui rétrécit le haut : sans lui c'est une bille

const dedans = (x, y) => {
  const t = (y - CY) / B;
  if (t < -1 || t > 1) return false;
  const demi = A * Math.sqrt(Math.max(0, 1 - t * t)) * (1 + POINTE * t);
  return Math.abs(x - CX) / Math.max(demi, 0.001) <= 1;
};

const V4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const V8 = [];
for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) V8.push([dx, dy]);

function silhouette() {
  const g = Array.from({ length: N }, () => Array(N).fill('.'));
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      if (dedans(x + 0.5, y + 0.5)) g[y][x] = ' ';
  // le contour : toute cellule de corps qui touche le vide
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (g[y][x] !== ' ') continue;
      if (V4.some(([dx, dy]) => {
        const nx = x + dx, ny = y + dy;
        return nx < 0 || ny < 0 || nx >= N || ny >= N || g[ny][nx] === '.';
      })) g[y][x] = 'o';
    }
  return g;
}

/* Une seule source de lumière, en haut à gauche, quantifiée en quatre tons. Les seuils sont
   serrés vers le clair : un dégradé réparti également donne une bille grise, une tache de
   lumière étroite donne une coquille. */
function ombrer(g) {
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (g[y][x] !== ' ') continue;
      const dx = (x - (CX - A * 0.45)) / (A * 1.9);
      const dy = (y - (CY - B * 0.5)) / (B * 1.9);
      const d = Math.sqrt(dx * dx + dy * dy);
      g[y][x] = d < 0.17 ? 'n' : d < 0.33 ? 'b' : d < 0.58 ? 'c' : 'V';
    }
  return g;
}

const peindre = (g, x, y, cle) => {
  x = Math.round(x); y = Math.round(y);
  if (x >= 0 && x < N && y >= 0 && y < N && g[y][x] !== '.' && g[y][x] !== 'o') g[y][x] = cle;
};

// une tache, jamais un pixel seul : à trente-deux pixels un point isolé ne se lit pas comme
// un motif, il se lit comme une poussière sur l'écran
const tache = (g, cx, cy, r, cle) => {
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx * dx + dy * dy <= r * r + 1) peindre(g, cx + dx, cy + dy, cle);
};

const MOTIFS = {
  commun: g => [[12, 13, 1], [20, 15, 1], [10, 21, 1], [18, 22, 2], [14, 26, 1], [22, 25, 1]]
    .forEach(([x, y, r]) => tache(g, x, y, r, 'v')),

  rare: g => [13, 19, 25].forEach(y => {
    for (let x = 0; x < N; x++) { peindre(g, x, y, 'v'); peindre(g, x, y + 1, 'V'); }
  }),

  epique: g => [[15, 12], [10, 19], [21, 19], [15, 26]].forEach(([cx, cy]) => {
    for (let dy = -3; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++) {
        const d = Math.abs(dx) + Math.abs(dy);
        if (d <= 3) peindre(g, cx + dx, cy + dy, d === 3 ? 'v' : 'V');
      }
  }),

  /* Tracé pas à pas et non de pixel entier en pixel entier : un rayon oblique tiré tous les
     1,0 laisse des trous, et un trou d'un pixel est exactement ce que « vérifier » appelle
     du bruit. */
  mythique: g => {
    for (let a = 0; a < 360; a += 30) {
      const r = a * Math.PI / 180;
      for (let t = 4; t < 11.5; t += 0.35)
        peindre(g, CX + Math.cos(r) * t * 0.85, CY + Math.sin(r) * t, 'v');
    }
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++)
        if (dx * dx + dy * dy <= 4) peindre(g, CX + dx, CY + dy, 'n');
  },

  // la spirale est GRAVÉE, pas éclairée : en clair elle se noyait dans une coquille déjà pâle
  merveille: g => {
    for (let t = 0; t < Math.PI * 5.2; t += 0.04) {
      const r = 1 + t * 1.15;
      peindre(g, CX + Math.cos(t) * r * 0.72, CY + Math.sin(t) * r, 'v');
    }
  },
};

/* Absorbe les cellules ISOLÉES — celles dont aucune des huit voisines n'a la même couleur.
   C'est mot pour mot le contrôle de « vérifier », et le faire ici plutôt qu'à la main vaut
   mieux : les points isolés ne viennent pas que des motifs, la quantification de l'ombrage en
   fabrique autant, et une passe les prend tous. */
function debruiter(g) {
  for (let passe = 0; passe < 4; passe++) {
    let reste = false;
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const c = g[y][x];
        if (c === '.' || c === 'o') continue;
        const autour = V8
          .map(([dx, dy]) => (g[y + dy] || [])[x + dx])
          .filter(k => k !== undefined);
        if (autour.includes(c)) continue;
        const corps = autour.filter(k => k !== '.' && k !== 'o');
        if (!corps.length) continue;
        const compte = {};
        for (const k of corps) compte[k] = (compte[k] || 0) + 1;
        g[y][x] = Object.keys(compte).sort((a, b) => compte[b] - compte[a])[0];
        reste = true;
      }
    if (!reste) break;
  }
  return g;
}

const PALETTES = {
  commun:    { o: '#2a241c', v: '#6b6155', V: '#8a7e6e', c: '#a99c88', b: '#c7bba6', n: '#e8e0ce' },
  rare:      { o: '#16283a', v: '#2f5f8c', V: '#4b83b8', c: '#6ba4d8', b: '#98c6ea', n: '#d8ecf9' },
  epique:    { o: '#2a1a38', v: '#6b3f92', V: '#8f5cbb', c: '#b07bd8', b: '#cfa6e8', n: '#eddcf7' },
  mythique:  { o: '#3a2a0c', v: '#8a6516', V: '#bb8a24', c: '#e4a63e', b: '#f0c87c', n: '#fae7bd' },
  merveille: { o: '#2e2c26', v: '#8f8a7c', V: '#b8b2a2', c: '#d8d2c2', b: '#eeeade', n: '#f6f1e3' },
};
const ORDRE = ['commun', 'rare', 'epique', 'mythique', 'merveille'];

const ENTETE = `# Éclosion — grille de sprites, un caractère par pixel.
# Les clés sont celles des palettes de tools/styles.js :
#   o contour · v V c b corps · n blanc · p pupille · r rouge · t terre · . vide
# Corriger un œuf, c'est éditer des caractères ici puis relancer « rendre ».
#
# CE FICHIER EST CALCULÉ par tools/oeufs.js — relancer « node tools/oeufs.js » écrase les
# retouches faites à la main. Les cinq œufs partagent une silhouette au pixel près, ce qu'une
# saisie au clavier ne tient pas : un décalage d'un pixel ne se voit qu'en les posant côte à
# côte, c'est-à-dire jamais.
#
# Ce qui les distingue tient en deux choses, et la seconde compte autant que la première : la
# PALETTE, reprise des couleurs de rareté, et le MOTIF — des taches, des bandes, des losanges,
# une couronne de rayons, une spirale. Une forme se lit là où une couleur ne se lit pas : à
# trente-deux pixels, de loin, ou pour qui distingue mal le violet du bleu.
#
# « vérifier » signale ici une DÉRIVE DE STYLE, et c'est voulu : le contrôle est écrit pour
# les cinq âges d'une même lignée, qui doivent se ressembler ; ces cinq stades sont cinq
# objets distincts, et leur couleur est justement ce qui les sépare.

lignee: oeufs
grille: 32
couleurs: 6
style: contour
`;

const rendu = ORDRE.map((cle, i) => {
  const g = ombrer(silhouette());
  MOTIFS[cle](g);
  debruiter(g);
  const p = PALETTES[cle];
  const palette = 'palette: ' + ['o', 'v', 'V', 'c', 'b', 'n'].map(k => k + ' ' + p[k]).join('  ');
  return `stade ${i + 1} ${cle}\n${palette}\n` + g.map(r => r.join('')).join('\n');
});

const cible = path.join(__dirname, '..', 'art', 'grilles', 'oeufs.txt');
fs.writeFileSync(cible, ENTETE + '\n' + rendu.join('\n\n') + '\n', 'utf8');
console.log(`\n  art/grilles/oeufs.txt écrit — ${ORDRE.length} œufs\n` +
            `  ensuite : node tools/pixel.js verifier oeufs\n` +
            `            node tools/pixel.js rendre oeufs\n`);
