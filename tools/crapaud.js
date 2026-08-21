/* La lignée du crapaud, cinq formes en 32×32.
   Principe : ce qui distingue une créature est sa SILHOUETTE, pas ses taches intérieures.
   Bosses, crêtes et pattes doivent donc dépasser du corps, jamais être peintes dedans. */
'use strict';
const P = require('./pixels.js');
const fs = require('fs');

const N = 32;

const PALETTE = {
  o: '#16240f',   // contour
  v: '#3a7030',   // corps, ombre
  V: '#57a044',   // corps
  c: '#78c25e',   // corps, lumière
  b: '#b3dd93',   // ventre
  n: '#f7f4e6',   // blanc de l'oeil
  p: '#16240f',   // pupille
  r: '#8d4038',   // bouche
  t: '#59503f',   // pierre, boue
};

function oeil(g, x, y, r) {
  P.ellipse(g, x, y, r, r, 'n');
  P.ellipse(g, x, y + r * 0.2, r * 0.5, r * 0.55, 'p');
}
function fini(g) { P.contour(g, 'o'); return g; }

// ── 1 · Têtard ── une tête, une queue, rien d'autre ───────────────────────
function tetard() {
  const g = P.grille(N);
  P.poly(g, [[16, 14], [26, 9], [29, 16], [26, 23], [16, 18]], 'v');   // queue
  P.ellipse(g, 12, 16, 8.5, 7.5, 'V');
  P.ellipse(g, 12, 19, 6, 3.5, 'b');
  oeil(g, 9, 13, 1.9); oeil(g, 15, 13, 1.9);
  return fini(g);
}

// ── 2 · Crapaud ── trapu, yeux en bosse, quatre pattes qui dépassent ──────
function crapaud() {
  const g = P.grille(N);
  P.ellipse(g, 16, 19, 12, 8, 'V');            // corps
  P.ellipse(g, 4.5, 25, 4, 2.6, 'v');          // pattes avant
  P.ellipse(g, 27.5, 25, 4, 2.6, 'v');
  P.ellipse(g, 7, 14, 3.2, 3, 'V');            // bosses des yeux
  P.ellipse(g, 25, 14, 3.2, 3, 'V');
  P.ellipse(g, 16, 16, 10, 4, 'c');            // lumière sur le dos
  P.ellipse(g, 16, 22, 9, 4.5, 'b');           // ventre
  oeil(g, 7, 13.5, 2); oeil(g, 25, 13.5, 2);
  P.rect(g, 11, 19, 10, 1, 'r');               // bouche
  return fini(g);
}

// ── 3 · Crapaud-buffle ── la gorge gonflée déborde sous la tête ───────────
function buffle() {
  const g = P.grille(N);
  P.ellipse(g, 16, 18, 13, 8.5, 'V');
  P.ellipse(g, 3.5, 25.5, 4.5, 3, 'v');
  P.ellipse(g, 28.5, 25.5, 4.5, 3, 'v');
  P.ellipse(g, 6, 11, 3.6, 3.4, 'V');
  P.ellipse(g, 26, 11, 3.6, 3.4, 'V');
  P.ellipse(g, 16, 14, 11, 4.5, 'c');          // lumière sur le dos
  P.ellipse(g, 16, 25, 10, 5.5, 'b');          // gorge gonflée
  oeil(g, 6, 10.5, 2.3); oeil(g, 26, 10.5, 2.3);
  P.rect(g, 9, 18, 14, 1, 'r');
  return fini(g);
}

// ── 4 · Colosse fangeux ── voûté, dos hérissé, tête basse et en avant ─────
function colosse() {
  const g = P.grille(N);
  P.ellipse(g, 2.5, 26, 4.5, 3.5, 'v');
  P.ellipse(g, 29.5, 26, 4.5, 3.5, 'v');
  P.ellipse(g, 16, 16, 13.5, 9, 'v');          // masse du dos
  P.ellipse(g, 16, 13, 10.5, 5, 'V');          // lumière sur le haut du dos
  for (const [x, y] of [[8, 6], [16, 3], [24, 6]])   // pointes, APRÈS le corps
    P.poly(g, [[x - 4.5, y + 8], [x, y], [x + 4.5, y + 8]], 't');
  P.ellipse(g, 16, 24, 11, 6, 'V');            // tête basse
  P.ellipse(g, 16, 22, 9.5, 3.5, 'c');
  P.ellipse(g, 16, 27, 7.5, 3, 'b');
  oeil(g, 10.5, 22, 2.1); oeil(g, 21.5, 22, 2.1);
  P.rect(g, 11, 27, 10, 1, 'r');
  return fini(g);
}

// ── 5 · Gama ── la montagne : une crête massive posée sur le dos ──────────
function gama() {
  const g = P.grille(N);
  P.ellipse(g, 1.5, 27.5, 4.5, 3.5, 'v');
  P.ellipse(g, 30.5, 27.5, 4.5, 3.5, 'v');
  P.ellipse(g, 16, 21, 15, 10, 'v');
  P.poly(g, [[4, 15], [10, 4], [15, 12], [20, 2], [26, 10], [29, 15]], 't');  // massif
  P.poly(g, [[10, 4], [12.5, 8], [7.5, 8]], 'b');    // neige sur les sommets
  P.poly(g, [[20, 2], [23, 7], [17, 7]], 'b');
  P.ellipse(g, 16, 25, 12, 6, 'V');
  P.ellipse(g, 16, 23, 10, 3, 'c');
  P.ellipse(g, 16, 28, 9, 3, 'b');
  oeil(g, 9.5, 23, 2.3); oeil(g, 22.5, 23, 2.3);
  P.rect(g, 9, 28, 14, 1, 'r');
  return fini(g);
}

const SPRITES = {
  'crapaud-1-tetard': tetard,
  'crapaud-2-crapaud': crapaud,
  'crapaud-3-buffle': buffle,
  'crapaud-4-colosse': colosse,
  'crapaud-5-gama': gama,
};

for (const [nom, f] of Object.entries(SPRITES)) {
  const g = f();
  fs.writeFileSync('art/' + nom + '.svg', P.versSVG(g, PALETTE));
  if (process.argv.includes('--apercu')) {
    console.log('\n── ' + nom + ' ' + '─'.repeat(24));
    console.log(P.apercu(g));
  }
}
console.log('\n' + Object.keys(SPRITES).length + ' sprites écrits');
