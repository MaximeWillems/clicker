/* ── LES AIDES DES SCÉNARIOS ──────────────────────────────────────────────────
   Le compteur du verdict, les trois mots qui écrivent un scénario, et les gestes
   qu’une douzaine de fichiers refont : poser une bête, saturer le combo, composer
   un couple.

   ELLES VIVENT ICI PARCE QU’ELLES SERVENT PARTOUT. `seule` était déclarée au milieu
   du mode histoire et servait dix-sept sections ; `pave` a fini écrite deux fois, à
   mille lignes d’écart, parce que personne ne pouvait voir qu’elle existait déjà.
   Une aide qui n’a pas de maison se recopie. */

'use strict';
const { neuf, noeuds, inconnus, RACINE, lire, brut, rechargements } = require('../banc.js');

/* ── LE VERDICT ────────────────────────────────────────────────────────────────
   Les compteurs sont tenus ici et lus par le lanceur : chaque fichier de scénarios
   ajoute au même total, et personne n’a besoin de les faire remonter. */
const filtre = process.argv[2];
const compte = { scenarios: 0, verifs: 0, ratees: [] };
let courant = '';

function scenario(nom, f) {
  if (filtre && !nom.toLowerCase().includes(filtre.toLowerCase())) return;
  courant = nom; compte.scenarios++;
  const avant = compte.ratees.length;
  try { f(); } catch (e) { compte.ratees.push([nom, 'a levé : ' + e.message]); }
  console.log((compte.ratees.length === avant ? '  ✓ ' : '  ✗ ') + nom);
}
function ok(quoi, vrai, detail) {
  compte.verifs++;
  if (!vrai) compte.ratees.push([courant, quoi + (detail === undefined ? '' : '  → ' + detail)]);
}
const eq = (quoi, a, b) => ok(quoi + ' (' + a + ' attendu ' + b + ')', a === b);

/* POSER N JETONS, c'est remplir la BOURSE depuis la 4.0.0 — et non plus poser une fortune qui
   aurait franchi n paliers. L'échelle n'a que onze crans, donc au-delà elle ne savait plus
   représenter la demande ; la bourse, elle, n'a pas de plafond. `paliers` reste ce qui a ouvert
   l'ascension une première fois. */
function poserJetons(jeu, n) {
  jeu.state.asc.jetons = n;
  jeu.state.asc.sommet = 0;
  jeu.state.asc.paliers = jeu.RANG_PREMIER;
}

// une bête posée dans l'enclos, sans passer par la couvaison
function bete(jeu, ligne, age, p) {
  const s = jeu.state;
  s.incub[0] = { line: ligne || 'crapaud', p: 9999, kind: 'commun' };
  jeu.hatchAll();
  const c = s.pen[s.pen.length - 1];
  if (age) c.age = age;
  if (p !== undefined) c.p = p;
  s.sel = 'c:' + c.id;
  jeu.refresh();
  return c;
}

/* UNE BÊTE SANS HASARD, POSÉE EN SÉRIE. `bete` ci-dessus sélectionne et rafraîchit, ce qui
   coûte cher quand on en pose douze d'affilée ; celle-ci pose, règle l'âge et la croissance,
   et s'en va. Elle était écrite deux fois — dans un scénario d'album et dans un de forge —
   et les deux copies ne faisaient déjà plus la même chose.

   ON ÉGALISE LES STATISTIQUES, et il a fallu une trentaine de passes pour voir pourquoi :
   depuis la `4.16.0` elles pèsent un quart de la qualité d'une carte, donc de la poussière
   qu'elle laisse. Une bête bien née rendait deux poussières au lieu d'une, et le total de
   huit devenait neuf une fois sur trente. Un test qui échoue sans qu'aucun code ne soit
   fautif apprend à ignorer les échecs — et c'est toujours la même raison : on assertait
   sur du hasard. La copie de l'album ne le faisait pas ; elle tirait juste sur des mesures
   que le hasard n'atteignait pas, ce qui est une chance et non une propriété. */
function beteNeutre(j, ligne, age, p) {
  const st = j.state;
  st.incub[0] = { line: ligne, p: 9999, kind: 'commun' };
  j.hatchAll();
  const c = st.pen[st.pen.length - 1];
  c.age = age; c.p = p;
  c.iv = j.IV_NOMS.map(() => j.IV_MAX / 2);
  c.prodige = false; c.fond = null; c.rank = 0;
  return c;
}

/* SATURER LE COMBO AVANT DE MESURER AUTRE CHOSE. Depuis qu'un clic monte le combo, deux clics
   consécutifs ne valent plus la même chose — c'est le but de la mécanique, et c'est un poison
   pour tout scénario qui compare un clic à un autre. Au plafond, `comboMult` ne bouge plus :
   les deux clics redeviennent comparables. On repose ensuite ce que les clics ont poussé. */
function saturerCombo(jeu) {
  const s = jeu.state, sujet = jeu.current();
  const p = sujet && sujet.c ? sujet.c.p : 0, over = sujet && sujet.c ? sujet.c.over : 0;
  const oeuf = s.incub[0] ? s.incub[0].p : null;
  for (let i = 0; i < jeu.COMBO_PLEIN; i++) jeu.tapStage();
  if (sujet && sujet.c) { sujet.c.p = p; sujet.c.over = over; }
  if (oeuf !== null && s.incub[0]) s.incub[0].p = oeuf;
}

// ouvre une scène et une seule : toutes les autres sont marquées lues d'avance
function seule(cle, prep) {
  const jeu = neuf(); const s = jeu.state;
  s.vu = {};
  for (const n of jeu.NOTES) if (n.cle !== cle) s.vu[n.cle] = true;
  s.dial = null;
  if (prep) prep(jeu, s);
  jeu.refresh();
  return jeu;
}

// en `function` : les scénarios s'exécutent dans l'ordre du fichier, et ceux du dialogue
// s'en servent avant d'arriver ici
function ditDial() { return noeuds.get('dial-dit').textContent || ''; }

function dialOuvert() { return !noeuds.get('dial').hidden; }

// l'impasse exacte : rien en enclos, rien en couvaison, rien en réserve, pas de quoi acheter
function impasse(jeu, sous) {
  const s = jeu.state;
  s.pen = []; s.incub = [null];
  s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0 };
  s.coins = sous === undefined ? 5 : sous;
  jeu.refresh();
}

/* Deux bêtes prêtes à être confiées, dans une ferme assez grande pour les tenir — et la
   pension achetée, puisque c'est un bâtiment depuis la beta 1.0.0. */
function couple(jeu, ligneA, ligneB) {
  jeu.state.pens = 8;
  jeu.state.ciel = Object.assign(jeu.state.ciel || {}, { nid: 1 });
  return [bete(jeu, ligneA, 4, 20000), bete(jeu, ligneB, 4, 20000)];
}

/* Le bloc d'un couple porte une ligne par parent depuis la 2.2.0 : ce qu'on y cherche n'est
   plus un enfant direct. */
function sousArbre(e, cls) {
  const t = [];
  const m = x => { if (x.classList && x.classList.contains(cls)) t.push(x); x.children.forEach(m); };
  e.children.forEach(m);
  return t;
}

// ce que dit la phrase sous le nid, quel que soit le nombre de couples affichés au-dessus
function ditPension(jeu) {
  const p = noeuds.get('pension').children.find(c => c.classList.contains('pension-dit'));
  return p ? p.textContent : '';
}

// les deux cases du nid, dans l'ordre
function casesNid(jeu) {
  const nid = noeuds.get('pension').children.find(c => c.classList.contains('nid'));
  return nid ? nid.children.filter(c => c.classList.contains('nid-case')) : [];
}

// ce que la fiche affiche, à plat : un texte par bloc
function fiche(jeu, cle) {
  jeu.encyLignee = cle;
  jeu.renderEncyclopedie();
  const plat = el => (el.textContent || '') +
    el.children.map(c => ' ' + (c.textContent || '') + c.children.map(x => ' ' + x.textContent).join('')).join('');
  return {
    titre: noeuds.get('ency-title').textContent,
    dit: noeuds.get('ency-dit').textContent,
    blocs: noeuds.get('ency').children.map(plat),
    tout: noeuds.get('ency').children.map(plat).join(' | '),
  };
}

/* Une capsule d'album minimale : ce que `qualiteDe` et `poussiereDe` lisent, et rien d'autre. */
function pave(jeu, id, ligne, etoiles) {
  return { id, line: ligne || 'crapaud', age: 5, niv: 100, chroma: 7, rank: 5,
           prodige: false, etoiles: etoiles || 1, motif: 0, temper: 0 };
}

/* Une carte au sommet de ce que le jeu peut produire : c'est là que les bornes se testent.
   Déclarée en `function` et non en `const` : les scénarios s'exécutent dans l'ordre du
   fichier, et celui de la plonge s'en sert avant d'arriver ici. */
/* PARFAITE VEUT DIRE PARFAITE SUR LES CINQ AXES, stats comprises depuis qu'elles en sont un.
   Sans elles, `ivPart` lit la moyenne et la carte plafonne à 0,90 de qualité : le scénario
   mesurait alors un « bonus maximal » qui n'était pas le maximum. */
function parfaite(jeu, motif, id) {
  return {
    id, line: 'ouroboros', age: 5, niv: 100, chroma: 0,
    rank: jeu.RANKS.length - 1, prodige: true, etoiles: 1, motif, temper: 0,
    iv: jeu.IV_NOMS.map(() => jeu.IV_MAX),
  };
}

function equiper(jeu, motif, n) {
  jeu.state.album = []; jeu.state.slots = [];
  for (let i = 1; i <= n; i++) { jeu.state.album.push(parfaite(jeu, motif, i)); jeu.state.slots.push(i); }
  jeu.oublierAlbum();
}

module.exports = {
  compte, scenario, ok, eq,
  poserJetons, bete, beteNeutre, saturerCombo, seule, ditDial, dialOuvert, impasse,
  couple, sousArbre, ditPension, casesNid, fiche, pave, parfaite, equiper,
  neuf, noeuds, inconnus, RACINE, lire, brut, rechargements,
};
