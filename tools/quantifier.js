/* Ramener une planche à N couleurs, sans bibliothèque de quantification.

   Deux règles gouvernent ce fichier, et elles viennent du même constat : une planche
   générée arrive anti-aliasée en centaines de couleurs, alors que le prompt en demandait
   six à plat.

   1. Le représentant d'un groupe est son MODE, jamais sa moyenne. Une moyenne invente une
      couleur qui n'était nulle part sur la planche.
   2. Rien n'est tiré au sort. La coupe médiane est déterministe de bout en bout — égalités
      départagées par la couleur elle-même — parce qu'une palette qui bouge d'une exécution
      à l'autre rend toute correction impossible à relire.

   Les clés sont celles des palettes de styles.js : c'est ce qui permet de rhabiller le
   bestiaire entier en changeant de style, sans toucher à une seule grille. */
'use strict';

/* À quoi ressemble une palette de N couleurs, du plus sombre au plus clair. Le plus sombre
   est TOUJOURS `o` : c'est lui qui portera le contour reconstruit, et le contour compte
   dans les N. Le plus clair est `n` — le blanc de l'œil, la neige, le ventre pâle. */
const ECHELLES = {
  1: ['o'],
  2: ['o', 'n'],
  3: ['o', 'v', 'n'],
  4: ['o', 'v', 'V', 'n'],
  5: ['o', 'v', 'V', 'c', 'n'],
  6: ['o', 'v', 'V', 'c', 'b', 'n'],
  7: ['o', 't', 'v', 'V', 'c', 'b', 'n'],
  8: ['o', 't', 'v', 'r', 'V', 'c', 'b', 'n'],
  9: ['o', 'p', 't', 'v', 'r', 'V', 'c', 'b', 'n'],
};

const versRVB = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const versHex = ([r, g, b]) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
const clarte = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;

/* Distance perceptuelle du pauvre : le vert pèse le double du rouge, le rouge une fois et
   demie le bleu. Assez juste pour ne pas confondre un ventre pâle et un blanc d'œil, et
   assez court pour tourner sur cent mille comparaisons sans y penser. */
function distance(a, b) {
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return 2 * dr * dr + 4 * dg * dg + 3 * db * db;
}

const compare = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

function etendue(boite) {
  const min = [255, 255, 255], max = [0, 0, 0];
  for (const e of boite) for (let k = 0; k < 3; k++) {
    if (e.rvb[k] < min[k]) min[k] = e.rvb[k];
    if (e.rvb[k] > max[k]) max[k] = e.rvb[k];
  }
  let canal = 0;
  for (let k = 1; k < 3; k++) if (max[k] - min[k] > max[canal] - min[canal]) canal = k;
  return [canal, max[canal] - min[canal]];
}

/* Coupe médiane. La boîte qu'on divise est celle qui coûte le plus cher : son étalement
   MULTIPLIÉ par le nombre de cellules qu'elle contient.

   L'étalement seul ne marche pas, et ça s'est vu tout de suite sur les vraies planches. Un
   aplat n'y est pas plat : il arrive avec deux ou trois points de bruit de compression, sur
   des centaines de cellules. Une boîte serrée mais énorme se faisait couper en deux, et la
   palette sortait avec « #fdf0a5 » et « #fdf0a6 » — deux couleurs indiscernables qui
   mangeaient deux des six places, pendant que le contour et le corps se partageaient la
   même. Le produit rétablit l'ordre : une boîte large et peuplée passe devant. */
function medianeCoupe(entrees, cible) {
  let boites = [entrees.slice()];
  while (boites.length < cible) {
    let choix = -1, large = 0;
    boites.forEach((b, i) => {
      if (b.length < 2) return;
      const [, amplitude] = etendue(b);
      const cout = amplitude * b.reduce((s, e) => s + e.n, 0);
      if (cout > large) { large = cout; choix = i; }
    });
    if (choix < 0) break;
    const b = boites[choix], [canal] = etendue(b);
    b.sort((p, q) => p.rvb[canal] - q.rvb[canal] || compare(p.rvb, q.rvb));
    // médiane PONDÉRÉE par les effectifs : sans ça une teinte présente sur deux pixels
    // pèse autant que tout le ventre de la bête, et la coupe tombe n'importe où
    const total = b.reduce((s, e) => s + e.n, 0);
    let cumul = 0, k = 0;
    while (k < b.length - 2 && cumul + b[k].n < total / 2) { cumul += b[k].n; k++; }
    boites.splice(choix, 1, b.slice(0, k + 1), b.slice(k + 1));
  }
  return boites;
}

const representant = boite =>
  boite.slice().sort((a, b) => b.n - a.n || compare(a.rvb, b.rvb))[0].rvb;

/* Sur une vraie planche, un aplat n'est PAS plat : « maximum 6 flat colors » donne six
   nuages serrés de deux ou trois points de large, plus les halos d'anti-aliasing entre eux.
   Le crapaud sort ainsi avec 2073 couleurs pour 3401 cellules.

   Ce bruit-là se recolle AVANT de découper l'espace, faute de quoi la coupe médiane tombe au
   milieu du nuage le plus peuplé et rend deux couleurs indiscernables — « #fdf0a5 » et
   « #fdf0a6 » occupaient deux des six places pendant que le contour et le corps se
   partageaient la même. On parcourt donc les couleurs de la plus fréquente à la moins
   fréquente : chacune rejoint un groupe existant si elle en est assez proche, sinon elle en
   ouvre un. Le représentant d'un groupe est la première couleur rencontrée, donc la plus
   fréquente : c'est bien un mode, et une couleur qui existait vraiment sur la planche.

   Effet de bord voulu : deux couleurs de la palette finale ne peuvent plus être à moins de
   `SERRE` l'une de l'autre, quelle que soit la suite du découpage. */
const SERRE = 900;      // ≈ dix points d'écart par canal — en deçà, deux aplats se confondent

function agreger(comptes) {
  const groupes = [];
  const tri = [...comptes.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  for (const [hex, n] of tri) {
    const rvb = versRVB(hex);
    const proche = groupes.find(g => distance(g.rvb, rvb) < SERRE);
    if (proche) proche.n += n; else groupes.push({ rvb, n });
  }
  return groupes;
}

/* Une palette de `cible` couleurs pour toute la lignée, pas par stade : c'est la seule
   façon d'empêcher la dérive de style d'un stade au suivant, qui est le défaut le plus
   fréquent des planches générées. */
function palette(comptes, cible) {
  const entrees = agreger(comptes).sort((a, b) => compare(a.rvb, b.rvb));
  const boites = medianeCoupe(entrees, cible).filter(b => b.length);
  const couleurs = [...new Set(boites.map(b => versHex(representant(b))))]
    .sort((a, b) => clarte(versRVB(a)) - clarte(versRVB(b)) || (a < b ? -1 : 1));
  const cles = ECHELLES[couleurs.length] || ECHELLES[9].slice(0, couleurs.length);
  const pal = {};
  couleurs.forEach((hex, i) => { pal[cles[i]] = hex; });
  return pal;
}

/* Chaque couleur va vers la plus proche de la palette — pas vers celle de sa boîte. Une
   couleur peut très bien tomber du mauvais côté d'une coupe et se retrouver plus près du
   représentant voisin ; c'est la retouche classique de la coupe médiane, et elle ne coûte
   rien ici vu le nombre de couleurs en jeu. */
function rapprocher(palette) {
  const refs = Object.entries(palette).map(([cle, hex]) => ({ cle, rvb: versRVB(hex) }));
  const cache = new Map();
  return hex => {
    if (!cache.has(hex)) {
      const rvb = versRVB(hex);
      let meilleur = refs[0], d = distance(rvb, refs[0].rvb);
      for (const r of refs.slice(1)) {
        const dd = distance(rvb, r.rvb);
        if (dd < d) { d = dd; meilleur = r; }
      }
      cache.set(hex, meilleur.cle);
    }
    return cache.get(hex);
  };
}

module.exports = { ECHELLES, palette, rapprocher, versRVB, versHex, clarte, distance };
