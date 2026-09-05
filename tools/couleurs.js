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
const AVANT = 0.7;   // la même descente que `AVANT_TEINTE` dans le jeu
const chaine = (a, s, c, b) =>
  'grayscale(1) brightness(' + AVANT + ') sepia(1) hue-rotate(' + a + 'deg) saturate(' + s +
  ') contrast(' + c + ') brightness(' + b + ')';
const rendu = (a, s, c, b) => passe(chaine(a, s, c, b), [.5, .5, .5]);
// l'œil pardonne moins un écart de vert : on le pèse plus lourd
const ecart = (a, b) => Math.sqrt(2*(a[0]-b[0])**2 + 4*(a[1]-b[1])**2 + (a[2]-b[2])**2);

/* CE QU'ON SURVEILLE : LA TEINTE TIENT-ELLE SUR TOUTE LA BÊTE ?
   Un dessin porte des clartés du contour au reflet, et le filtre les traverse toutes. Si la
   teinte tourne en chemin, le corps sort bordeaux et le ventre kaki — c'était le cas de tous
   les tons sombres, à 67° d'écart.

   ET ELLE NE COMPTE QUE LÀ OÙ LA COULEUR SE VOIT. Un presque-blanc n'a pas de teinte : la
   sienne a le droit de partir, personne ne la lit. C'est exactement ce qui sépare le rose —
   60° de dérive brute, mais 0° là où il a de la couleur, et il est joli — du bordeaux, qui
   dérive autant mais en plein dans sa matière. Mesurer la dérive brute condamnerait le
   premier avec le second. */
const RAMPE = [0.12, 0.25, 0.40, 0.55, 0.70, 0.884];   // du contour au plus clair d'un dessin
const gris = g => '#' + Array(3).fill(Math.round(g*255).toString(16).padStart(2,'0')).join('');
const chroma = p => Math.max(p[0], p[1], p[2]) - Math.min(p[0], p[1], p[2]);
const teinte = p => {
  const h = Math.max(p[0], p[1], p[2]), l = Math.min(p[0], p[1], p[2]);
  if (h - l < 1e-9) return null;
  const d = h - l;
  const t = p[0] === h ? (p[1]-p[2])/d : p[1] === h ? 2+(p[2]-p[0])/d : 4+(p[0]-p[1])/d;
  return ((t*60) % 360 + 360) % 360;
};
const angle = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

function deriveVue(ch) {
  const pts = RAMPE.map(g => passe(ch, hexP(gris(g))))
    .map(p => ({ h: teinte(p), c: chroma(p) }))
    .filter(p => p.h !== null && p.c > 0.12);
  let d = 0;
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) d = Math.max(d, angle(pts[i].h, pts[j].h));
  return d;
}

const SEUIL = 8;       // au-delà, on voit la teinte tourner d'une zone à l'autre
const PEINE = 0.010;   // ce que coûte un degré de dérive, en unités d'écart de couleur

/* UN SEUL OBJECTIF : L'ÉCART À LA CIBLE, PLUS UNE PEINE PAR DEGRÉ DE DÉRIVE.
   Deux objectifs enchaînés — « atteins la couleur, puis si tu peux tiens la teinte » — donnent
   une bascule et non un compromis : le solveur trouvait des couleurs délavées à dérive nulle,
   ou des couleurs justes qui tournaient de soixante degrés. Un coût unique les met sur la même
   échelle, et le réglage du compromis tient dans `PEINE`.

   ET ON MINIMISE L'ÉCART RÉEL, non la teinte puis la vivacité puis la clarté. Tant que rien ne
   bute, les trois se règlent séparément ; dès qu'un canal touche 0 ou 1, monter la force ne
   change plus la vivacité mais déplace encore la clarté, et les réglages se battent. Mesuré :
   les rouges et les magentas rataient leur cible de 0,40 ainsi, de 0,02 par une descente sur
   le coût. */
/* ET LE BLANCHIMENT RESTE INTERDIT DANS LA PLAGE DES DESSINS. Un ton qui envoie plusieurs
   clartés sur le même blanc pur perd du modelé, et aucune dérive nulle ne rachète ça.

   IL SE CALCULE, IL NE SE CHERCHE PAS. Tant que rien n'écrête, la chaîne est LINÉAIRE en la
   clarté d'entrée : chaque canal sort à b(c·v·g + 0,5(1−c)), où v est le gain que les matrices
   donnent à ce canal. Le seuil s'inverse donc à la main, et cinquante passes de filtre par
   évaluation deviennent trois divisions — ce qui compte, dans une descente qui en fait des
   centaines de milliers. */
const mulBrut = (m, p) => [m[0]*p[0] + m[1]*p[1] + m[2]*p[2],
                           m[3]*p[0] + m[4]*p[1] + m[5]*p[2],
                           m[6]*p[0] + m[7]*p[1] + m[8]*p[2]];
function blanchitDes(a, s, c, b) {
  const v = mulBrut(sat(s), mulBrut(rot(a), mulBrut(sepia(1), [AVANT, AVANT, AVANT])));
  let seuil = -Infinity;
  for (const vi of v) {
    if (vi <= 0) return null;                    // ce canal ne montera jamais jusqu'au blanc
    seuil = Math.max(seuil, (0.99 / b - 0.5 * (1 - c)) / (c * vi));
  }
  return seuil > 1 ? null : Math.max(0, seuil);
}

/* ET LA BÊTE DOIT GARDER SON MODELÉ. Le solveur ne visait que le gris moyen : pour une couleur
   très sombre il trouvait un serrement minuscule qui pose TOUTE la rampe sur la même valeur —
   la cible est atteinte, et la bête est une silhouette plate. On demande donc que le point le
   plus clair d'un dessin ressorte nettement au-dessus du gris moyen, plafonné à 0,95 parce
   qu'une couleur claire ne peut pas monter plus haut sans blanchir.

   C'EST LA TROISIÈME CHOSE QU'UNE COULEUR DOIT TENIR, avec sa teinte et sa justesse, et les
   trois se paient l'une l'autre. Un seul coût les arbitre plutôt que trois passes qui se
   défont mutuellement. */
const clarte = p => 0.213*p[0] + 0.715*p[1] + 0.072*p[2];

function cout(T, a, s, c, b) {
  const ch = chaine(a.toFixed(1), s.toFixed(2), c, b.toFixed(3));
  const milieu = passe(ch, [.5, .5, .5]);
  const e = ecart(milieu, T);
  const d = deriveVue(ch);
  const seuil = blanchitDes(a, s, c, b);
  const brule = seuil === null ? 0 : Math.max(0, 0.90 - seuil);
  const vise = Math.min(0.95, 1.55 * clarte(milieu));
  const plat = Math.max(0, vise - clarte(passe(ch, [0.884, 0.884, 0.884])));
  return { e, d, seuil, plat,
           total: e + PEINE * Math.max(0, d - SEUIL) + 3 * brule + 0.9 * plat };
}

function resoudre(T, c) {
  let best = null;
  for (let a = 0; a < 360; a += 8)
    for (let s = 0.4; s <= 9; s += 0.7)
      for (let b = 0.2; b <= 3.4; b += 0.2) {
        const r = cout(T, a, s, c, b);
        if (!best || r.total < best.total) best = { a, s, b, ...r };
      }
  let pas = [4, 0.35, 0.1];
  for (let tour = 0; tour < 90; tour++) {
    let mieux = false;
    for (const [i, cle] of [[0,'a'], [1,'s'], [2,'b']]) {
      for (const signe of [1, -1]) {
        const v = { a: best.a, s: best.s, b: best.b };
        v[cle] += signe * pas[i];
        if ((cle === 's' || cle === 'b') && v[cle] < 0.02) continue;
        const r = cout(T, v.a, v.s, c, v.b);
        if (r.total < best.total - 1e-9) { best = { ...v, ...r }; mieux = true; }
      }
    }
    if (!mieux) pas = pas.map(p => p / 2);
    if (pas[2] < 1e-4) break;
  }
  return best;
}

/* LE SERREMENT EST UN LEVIER LIBRE, et c'est ce qui rend la chose possible. `contrast(c)` fait
   tourner la rampe AUTOUR de 0,5 : le gris moyen — donc le point visé — ne bouge pas quand on
   le change. Il ne reste qu'à essayer chaque serrement et garder le moins cher : un serrement
   fort garde de l'écart entre les ombres et les lumières, un serrement faible calme la dérive,
   et le coût unique arbitre entre les deux sans qu'on ait à trancher d'avance. */
const SERRES = [1.05, 0.95, 0.85, 0.75, 0.66, 0.58, 0.50, 0.43, 0.37, 0.31, 0.26, 0.21, 0.17];

function viser(hex) {
  const T = hexP(hex);
  let best = null;
  for (const c of SERRES) {
    const r = resoudre(T, c);
    if (!best || r.total < best.total) best = { ...r, c };
  }
  best.ch = chaine(best.a.toFixed(1), best.s.toFixed(2), best.c, best.b.toFixed(3));
  return best;
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
let pires = 0, pireD = 0, changes = 0;

console.log('');
console.log('  couleur        voulue    obtenue   écart   dérive   serre');
for (const c of voulues) {
  const r = viser(c.couleur);
  const p = rendu(+r.a.toFixed(1), +r.s.toFixed(2), r.c, +r.b.toFixed(3));
  pires = Math.max(pires, r.e); pireD = Math.max(pireD, r.d);
  console.log('  ' + (c.name + '              ').slice(0, 14) + c.couleur + '   ' + enHex(p) +
    '   ' + r.e.toFixed(3) + (r.e > 0.03 ? ' ✗' : '  ') +
    '   ' + String(Math.round(r.d)).padStart(4) + '°' + (r.d > 22 ? ' ✗' : '  ') +
    '   ' + r.c.toFixed(2));

  if (!ecrire) continue;
  const appel = 'peindre(1, ' + r.a.toFixed(1) + ', ' + r.s.toFixed(2) + ', ' +
                r.c.toFixed(2) + ', ' + r.b.toFixed(3) + ')';
  const motif = new RegExp("(key: '" + c.key + "'[\\s\\S]{0,240}?filtre: )peindre\\([^)]*\\)");
  if (!motif.test(src)) { console.error('    ✗ ' + c.key + " : pas de `filtre: peindre(...)` à réécrire"); continue; }
  src = src.replace(motif, '$1' + appel);
  changes++;
}
console.log('');
console.log('  pire écart : ' + pires.toFixed(3) + '   ·   pire dérive : ' + Math.round(pireD) + '°');
if (ecrire) {
  fs.writeFileSync(JEU, src);
  console.log('  ' + changes + ' filtres réécrits dans game.js');
}
console.log('');
