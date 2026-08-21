/* Générateur de sprites pixel → SVG.
   Les créatures sont décrites en formes géométriques, rastérisées sur une grille, puis
   contournées automatiquement. Le contour est ce qui fait qu'un pixel art simple a l'air
   fini plutôt que bâclé — et il est trop pénible à poser à la main.

   node tools/pixels.js          écrit les SVG dans art/
   node tools/pixels.js --apercu affiche aussi l'aperçu texte de chaque sprite
*/
'use strict';
const fs = require('fs'), path = require('path');

// ── rastérisation ─────────────────────────────────────────────────────────
function grille(n) { return Array.from({ length: n }, () => Array(n).fill('.')); }

function ellipse(g, cx, cy, rx, ry, c) {
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g.length; x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
    if (dx * dx + dy * dy <= 1) g[y][x] = c;
  }
}

function rect(g, x0, y0, w, h, c) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++)
    if (g[y] && g[y][x] !== undefined) g[y][x] = c;
}

function poly(g, pts, c) {
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g.length; x++) {
    const px = x + 0.5, py = y + 0.5;
    let dedans = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) dedans = !dedans;
    }
    if (dedans) g[y][x] = c;
  }
}

function gomme(g, forme) { forme(g, '.'); }

/* Contour automatique : tout pixel plein bordé de vide devient contour. On travaille sur
   une copie, sinon le contour se propagerait vers l'intérieur. */
function contour(g, c) {
  const src = g.map(r => r.slice());
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g.length; x++) {
    if (src[y][x] === '.') continue;
    const bord = [[0,-1],[0,1],[-1,0],[1,0]].some(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      return !src[ny] || src[ny][nx] === undefined || src[ny][nx] === '.';
    });
    if (bord) g[y][x] = c;
  }
}

// ── sortie ────────────────────────────────────────────────────────────────
function versSVG(g, palette) {
  const n = g.length, out = [];
  for (let y = 0; y < n; y++) {
    let x = 0;
    while (x < n) {
      const c = g[y][x];
      if (c === '.' || !palette[c]) { x++; continue; }
      let w = 1;
      while (x + w < n && g[y][x + w] === c) w++;
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${palette[c]}"/>`);
      x += w;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" `
       + `shape-rendering="crispEdges">\n${out.join('\n')}\n</svg>\n`;
}

function apercu(g) {
  return g.map(r => r.map(c => c === '.' ? ' ' : c).join('')).join('\n');
}

module.exports = { grille, ellipse, rect, poly, contour, versSVG, apercu, gomme };
