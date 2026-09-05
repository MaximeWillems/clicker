/* ── LE SOLVEUR DE COULEURS ────────────────────────────────────────────────────
       node tools/couleurs.js            dit ce que rend chaque couleur
       node tools/couleurs.js --ecrire   réécrit les filtres de game.js

   LA TABLE DIT UNE COULEUR, PAS UN ANGLE. Chaque teinte de `CHROMAS` porte un `couleur:`
   en hexadécimal — la couleur qu'un gris moyen doit devenir. Cet outil trouve les quatre
   leviers de `peindre()` qui y arrivent, et les écrit dans la table.

   POURQUOI UN OUTIL ET NON LE JEU. La résolution coûte quelques centaines de milliers
   d'évaluations de filtre : cent millisecondes au démarrage pour un résultat qui ne change
   jamais entre deux parties. On la fait donc une fois, à la main, et un scénario vérifie que
   les nombres écrits rendent bien la couleur annoncée — sans quoi ce seraient quatre nombres
   magiques de plus, et l'hexadécimal à côté deviendrait un commentaire qui ment.

   LES 22,5° NE SONT PLUS UNE COULEUR. Le champ `hue` reste l'IDENTITÉ du cran — l'hérédité
   compte des crans, et les recettes s'y raccrochent — mais il ne décide plus de ce qu'on voit.
   Les seize teintes de la roue étaient posées mécaniquement tous les 22,5°, ce qui donnait des
   couleurs timides et un écarlate qui n'était pas rouge : une couleur n'est pas qu'un angle,
   c'est aussi une clarté et une vivacité. L'or est clair, le grenat est sombre. */

'use strict';
const fs = require('fs');
const path = require('path');
const { neuf } = require('./banc.js');

const RACINE = path.join(__dirname, '..');
const JEU = path.join(RACINE, 'game.js');

/* ── LES MATRICES DU SPEC SVG, telles que le navigateur les applique ───────────
   On les redit ici plutôt que de les prendre au jeu : cet outil doit pouvoir dire que le jeu
   se trompe, et un juge qui emprunte sa règle à l'accusé ne juge rien. */
const cl = v => v < 0 ? 0 : v > 1 ? 1 : v;
const mul = (m, p) => [m[0]*p[0] + m[1]*p[1] + m[2]*p[2],
                       m[3]*p[0] + m[4]*p[1] + m[5]*p[2],
                       m[6]*p[0] + m[7]*p[1] + m[8]*p[2]].map(cl);
const sat = s => [.213+.787*s, .715-.715*s, .072-.072*s,
                  .213-.213*s, .715+.285*s, .072-.072*s,
                  .213-.213*s, .715-.715*s, .072+.928*s];
const sepia = a => { const r = 1 - a; return [
  .393+.607*r, .769-.769*r, .189-.189*r,
  .349-.349*r, .686+.314*r, .168-.168*r,
  .272-.272*r, .534-.534*r, .131+.869*r]; };
const rot = a => { const c = Math.cos(a*Math.PI/180), s = Math.sin(a*Math.PI/180); return [
  .213+c*.787-s*.213, .715-c*.715-s*.715, .072-c*.072+s*.928,
  .213-c*.213+s*.143, .715+c*.285+s*.140, .072-c*.072-s*.283,
  .213-c*.213-s*.787, .715-c*.715+s*.715, .072+c*.928+s*.072]; };

function passe(chaine, p) {
  for (const m of chaine.matchAll(/(hue-rotate|saturate|brightness|contrast|grayscale|sepia)\(([-\d.]+)/g)) {
    const v = parseFloat(m[2]);
    if (m[1] === 'brightness')    p = p.map(x => cl(x * v));
    else if (m[1] === 'contrast') p = p.map(x => cl((x - .5) * v + .5));
    else p = mul(m[1] === 'saturate' ? sat(v) : m[1] === 'grayscale' ? sat(1 - v)
               : m[1] === 'sepia' ? sepia(v) : rot(v), p);
  }
  return p;
}

const hexP  = h => [parseInt(h.slice(1,3),16)/255, parseInt(h.slice(3,5),16)/255, parseInt(h.slice(5,7),16)/255];
const enHex = p => '#' + p.map(x => Math.round(x*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const chaine = (a, s, c, b) =>
  'grayscale(1) sepia(1) hue-rotate(' + a + 'deg) saturate(' + s + ') contrast(' + c + ') brightness(' + b + ')';
const rendu = (a, s, c, b) => passe(chaine(a, s, c, b), [.5, .5, .5]);
// l'œil pardonne moins un écart de vert : on le pèse plus lourd
const ecart = (a, b) => Math.sqrt(2*(a[0]-b[0])**2 + 4*(a[1]-b[1])**2 + (a[2]-b[2])**2);

/* À PARTIR DE QUELLE ENTRÉE LA CHAÎNE REND-ELLE DU BLANC PUR ? C'est la mesure de la
   sur-exposition : au-delà de ce seuil, plusieurs clartés sortent identiques et le modelé
   est perdu. Les dessins montent à 0,884 ; le seuil doit rester au-dessus. */
function blanchitDes(ch) {
  for (let g = 0.40; g <= 1.0001; g += 0.005) {
    if (passe(ch, [g, g, g]).every(v => v > 0.99)) return g;
  }
  return null;
}

/* ON MINIMISE L'ÉCART RÉEL, et non la teinte puis la vivacité puis la clarté. Tant que rien ne
   bute, les trois se règlent séparément ; dès qu'un canal touche 0 ou 1, monter la force ne
   change plus la vivacité mais déplace encore la clarté, et les réglages se battent. Une
   descente sur l'écart de couleur ne peut pas se faire piéger ainsi — mesuré : les rouges et
   les magentas rataient leur cible de 0,4 avec l'autre méthode, de 0,02 avec celle-ci. */
function resoudre(T, c) {
  let best = null;
  for (let a = 0; a < 360; a += 6)
    for (let s = 0.4; s <= 9; s += 0.6)
      for (let b = 0.25; b <= 2.2; b += 0.15) {
        const e = ecart(rendu(a, s, c, b), T);
        if (!best || e < best.e) best = { a, s, b, e };
      }
  let pas = [3, 0.3, 0.08];
  for (let tour = 0; tour < 80; tour++) {
    let mieux = false;
    for (const [i, cle] of [[0,'a'], [1,'s'], [2,'b']]) {
      for (const signe of [1, -1]) {
        const v = { a: best.a, s: best.s, b: best.b };
        v[cle] += signe * pas[i];
        if ((cle === 's' || cle === 'b') && v[cle] < 0.02) continue;
        const e = ecart(rendu(v.a, v.s, c, v.b), T);
        if (e < best.e - 1e-9) { best = { ...v, e }; mieux = true; }
      }
    }
    if (!mieux) pas = pas.map(p => p / 2);
    if (pas[2] < 1e-4) break;
  }
  return best;
}

/* LE SERREMENT EST UN LEVIER LIBRE, et c'est ce qui rend la chose possible. `contrast(c)` fait
   tourner la rampe AUTOUR de 0,5 : le gris moyen — donc le point visé — ne bouge pas quand on
   le change. On prend donc le serrement LE PLUS FORT qui ne blanchit pas, ce qui garde le plus
   d'écart entre les ombres et les lumières, et on ne descend que ce qu'il faut. */
const SERRES = [1.05, 0.95, 0.85, 0.75, 0.66, 0.58, 0.50, 0.43, 0.37, 0.31, 0.26];

function viser(hex) {
  const T = hexP(hex);
  let repli = null;
  for (const c of SERRES) {
    const r = resoudre(T, c);
    const ch = chaine(r.a.toFixed(1), r.s.toFixed(2), c, r.b.toFixed(3));
    const seuil = blanchitDes(ch);
    if (!repli || r.e < repli.e - 0.01) repli = { ...r, c, ch, seuil };
    if (r.e < 0.03 && (seuil === null || seuil >= 0.90)) return { ...r, c, ch, seuil };
  }
  return repli;
}

// ── ce que la table demande ───────────────────────────────────────────────────
const jeu = neuf();
const voulues = jeu.CHROMAS.filter(c => c.couleur);
if (!voulues.length) {
  console.error('\n  aucune couleur ne porte de `couleur:` — rien à résoudre\n');
  process.exit(1);
}

const ecrire = process.argv.includes('--ecrire');
let src = fs.readFileSync(JEU, 'utf8');
let pires = 0, changes = 0;

console.log('');
console.log('  couleur        voulue    obtenue   écart   serre   blanc pur dès');
for (const c of voulues) {
  const r = viser(c.couleur);
  const p = rendu(+r.a.toFixed(1), +r.s.toFixed(2), r.c, +r.b.toFixed(3));
  pires = Math.max(pires, r.e);
  console.log('  ' + (c.name + '              ').slice(0, 14) + c.couleur + '   ' + enHex(p) +
    '   ' + r.e.toFixed(3) + (r.e > 0.03 ? ' ✗' : '  ') + '   ' + r.c.toFixed(2) +
    '    ' + (r.seuil === null ? '—' : r.seuil.toFixed(2) + (r.seuil < 0.90 ? ' ✗' : '')));

  if (!ecrire) continue;
  const appel = 'peindre(1, ' + r.a.toFixed(1) + ', ' + r.s.toFixed(2) + ', ' +
                r.c.toFixed(2) + ', ' + r.b.toFixed(3) + ')';
  const motif = new RegExp("(key: '" + c.key + "'[\\s\\S]{0,240}?filtre: )peindre\\([^)]*\\)");
  if (!motif.test(src)) { console.error('    ✗ ' + c.key + " : pas de `filtre: peindre(...)` à réécrire"); continue; }
  src = src.replace(motif, '$1' + appel);
  changes++;
}
console.log('');
console.log('  pire écart : ' + pires.toFixed(3));
if (ecrire) {
  fs.writeFileSync(JEU, src);
  console.log('  ' + changes + ' filtres réécrits dans game.js');
}
console.log('');
