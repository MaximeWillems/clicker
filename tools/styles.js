/* Cinq façons d'habiller les mêmes silhouettes. Un style = une palette, un mode de contour,
   et une taille de grille. Rien d'autre : c'est ce qui rend la comparaison honnête, on
   compare bien des styles et pas des créatures différentes. */
'use strict';

const STYLES = {
  // ── Ce qui est en jeu aujourd'hui ────────────────────────────────────────
  contour: {
    nom: 'Contour',
    dit: 'Contour sombre, quatre tons de corps. Lisible, un peu classique.',
    taille: 32, contour: 'plein',
    palette: { o:'#16240f', v:'#3a7030', V:'#57a044', c:'#78c25e', b:'#b3dd93',
               n:'#f7f4e6', p:'#16240f', r:'#8d4038', t:'#59503f' },
  },

  // ── Une seule couleur : la forme fait tout le travail ────────────────────
  ombre: {
    nom: 'Ombre',
    dit: 'Une seule couleur, les yeux pour seul détail. Impeccable en vignette, et la teinte devient exacte.',
    taille: 32, contour: 'aucun',
    palette: { o:'#1a3016', v:'#1a3016', V:'#1a3016', c:'#1a3016', b:'#1a3016',
               n:'#8fd97a', p:'#1a3016', r:'#1a3016', t:'#1a3016' },
  },

  // ── Corps sombre, lumière rasante venue du haut ──────────────────────────
  rasante: {
    nom: 'Lumière rasante',
    dit: 'Corps sombre, arête éclairée par le haut. Tire parti du fond noir du jeu.',
    taille: 32, contour: 'haut',
    palette: { o:'#a8e88a', v:'#1f3a1a', V:'#2a4d23', c:'#335c2b', b:'#3d6b33',
               n:'#f7f4e6', p:'#0c150a', r:'#5a2822', t:'#3a352b' },
  },

  // ── Aplats doux, aucun trait ─────────────────────────────────────────────
  aplats: {
    nom: 'Aplats',
    dit: 'Aucun contour, palette adoucie. Plus moderne, plus fade en tout petit.',
    taille: 32, contour: 'aucun',
    palette: { o:'#4f8f52', v:'#4a8446', V:'#69a95c', c:'#8bc878', b:'#c2e0a4',
               n:'#fffdf2', p:'#2a3a22', r:'#b06258', t:'#7a7160' },
  },

  // ── Deux couleurs, gros pixels ───────────────────────────────────────────
  retro: {
    nom: 'Rétro 16',
    dit: 'Grille 16×16, deux couleurs. Franc et nostalgique, mais on perd les détails.',
    taille: 16, contour: 'plein',
    palette: { o:'#14260f', v:'#4c8a3e', V:'#4c8a3e', c:'#4c8a3e', b:'#4c8a3e',
               n:'#ecefd8', p:'#14260f', r:'#14260f', t:'#14260f' },
  },
};

module.exports = { STYLES };
