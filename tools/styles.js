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

  /* ── Le registre idole ────────────────────────────────────────────────────
     Les quatre styles au-dessus habillent des mascottes. La charte en a un second, né
     en 2.7.1 quand l'Ouroboros mignon a été rejeté : sombre, riche, un seul métal.
     Il tourne en 64 parce qu'une gueule ouverte ne survit pas à 32 — le contour seul
     la mange, vérifié sur la planche générée.

     La palette n'est pas inventée : c'est celle de art/source-ouroboros.png, relevée
     par « pixel.js importer ». Le vert ne sert qu'au monde du dernier âge. */
  idole: {
    nom: 'Idole',
    dit: 'Bleu nuit, ventre crème, un seul or. Pour les mythiques et les merveilles.',
    taille: 64, contour: 'plein',
    palette: { o:'#000000', t:'#1f2943', v:'#1a4a5d', r:'#35606f', V:'#5b7e50',
               c:'#e1aa4d', b:'#d1b687', n:'#eedab0', p:'#000000' },
  },

  /* ── Deux palettes de lignée ──────────────────────────────────────────────
     Une palette par lignée est une entorse à la règle du dessus — un style habille TOUTES les
     silhouettes, et c'est ce qui rend la comparaison honnête. `idole` l'avait déjà prise, en
     relevant les couleurs de source-ouroboros.png : une bête dont la couleur EST l'identité
     ne peut pas se peindre en vert de crapaud. Une veuve noire verte n'est pas une veuve.

     Elles ne se comparent donc pas aux quatre autres, elles se lisent avec leur lignée. */
  behemoth: {
    nom: 'Béhémoth',
    dit: 'Ardoise profonde et un seul accent d’or. Le registre idole, pour la lignée du Béhémoth.',
    taille: 32, contour: 'plein',
    palette: { o:'#0d1016', v:'#26323f', V:'#3a4d5f', c:'#556c81', b:'#8296a8',
               n:'#efe3c6', p:'#0d1016', r:'#c9a227', t:'#7d6c48' },
  },

  araignee: {
    nom: 'Araignée',
    dit: 'Noir bleuté, un rouge pour le sablier, un or pour les fils d’Arachné.',
    taille: 32, contour: 'plein',
    palette: { o:'#07070b', v:'#15151f', V:'#242435', c:'#39394f', b:'#57577a',
               n:'#f4efe4', p:'#07070b', r:'#c0392b', t:'#d9b44a' },
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
