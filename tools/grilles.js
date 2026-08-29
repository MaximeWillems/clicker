/* Le format de grille, et le contrôle de charte qui va avec.

   Une grille est un fichier texte : un caractère par pixel, les clés de styles.js. C'est le
   format que `P.apercu()` imprime depuis toujours — on ne l'a pas inventé, on lui a donné un
   fichier. Tout son intérêt tient dans une propriété : ce qu'on lit dans le terminal est
   exactement ce qu'on peut coller dans une conversation, corriger à la main et renvoyer.

   D'où deux choix qui semblent des détails et n'en sont pas :
     — le vide s'écrit « . » et jamais une espace. Un éditeur, un client de messagerie ou un
       copier-coller mangent les espaces de fin, et la grille revient avec des lignes courtes ;
     — la palette est écrite DANS le fichier, à chaque stade. Sans elle, une grille est une
       suite de lettres qu'on ne peut plus relire six mois plus tard, et la comparaison des
       palettes d'un stade à l'autre — la dérive de style — n'aurait rien à comparer. */
'use strict';
const fs = require('fs'), path = require('path');
const { clarte, versRVB } = require('./quantifier.js');

/* Les clés sont rangées du sombre au clair et pas dans l'ordre d'apparition : deux palettes
   identiques doivent s'écrire pareil, sinon le contrôle de dérive se met à signaler des
   différences qui n'en sont pas. */
const ordreCles = pal => Object.keys(pal).sort((a, b) =>
  clarte(versRVB(pal[a])) - clarte(versRVB(pal[b])) || (a < b ? -1 : 1));
const signature = pal => ordreCles(pal).map(k => `${k} ${pal[k]}`).join(' ');

const RACINE = path.resolve(__dirname, '..');
const DOSSIER = path.join(RACINE, 'art', 'grilles');
const chemin = cle => path.join(DOSSIER, cle + '.txt');

const ENTETE = `# Éclosion — grille de sprites, un caractère par pixel.
# Les clés sont celles des palettes de tools/styles.js :
#   o contour · v V c b corps · n blanc · p pupille · r rouge · t terre · . vide
# Corriger une bête, c'est éditer des caractères ici puis relancer « rendre ».`;

// ── lecture ───────────────────────────────────────────────────────────────
function lire(cle) {
  const f = chemin(cle);
  if (!fs.existsSync(f)) throw new Error(`grille introuvable : ${path.relative(RACINE, f)}`);
  return analyser(fs.readFileSync(f, 'utf8'), cle);
}

function analyser(texte, cle) {
  const doc = { cle, lignee: cle, taille: 32, couleurs: 0, extra: new Map(), blocs: [] };
  const lignes = texte.split(/\r?\n/);
  let bloc = null;
  lignes.forEach((brut, i) => {
    const l = brut.trimEnd();
    if (!l || l.startsWith('#')) return;
    const entete = /^(stade|image)\s+(\d+)\s*(.*)$/.exec(l);
    if (entete) {
      bloc = { type: entete[1], num: Number(entete[2]), nom: entete[3].trim(), palette: {}, g: [] };
      doc.blocs.push(bloc);
      return;
    }
    const champ = /^([a-zé]+)\s*:\s*(.*)$/.exec(l);
    if (champ) {
      const [, nom, val] = champ;
      if (nom === 'palette') {
        const pal = {};
        for (const m of val.matchAll(/(\S)\s+(#[0-9a-fA-F]{6})/g)) pal[m[1]] = m[2].toLowerCase();
        if (bloc) bloc.palette = pal; else doc.palette = pal;
      } else if (nom === 'lignee') doc.lignee = val;
      else if (nom === 'grille') doc.taille = Number(val);
      else if (nom === 'couleurs') doc.couleurs = Number(val);
      else doc.extra.set(nom, val);
      return;
    }
    if (!bloc) throw new Error(`ligne ${i + 1} hors de tout stade : « ${l} »`);
    // une ligne raccourcie par un copier-coller se rallonge en vide, jamais l'inverse
    if (l.length > doc.taille) throw new Error(`ligne ${i + 1} : ${l.length} caractères pour une grille de ${doc.taille}`);
    bloc.g.push([...l.replace(/ /g, '.').padEnd(doc.taille, '.')]);
  });
  for (const b of doc.blocs)
    if (b.g.length !== doc.taille)
      throw new Error(`${b.type} ${b.num} : ${b.g.length} lignes pour une grille de ${doc.taille}`);
  return doc;
}

// ── écriture ──────────────────────────────────────────────────────────────
function texteBloc(bloc) {
  const cles = ordreCles(bloc.palette);
  return [
    `${bloc.type} ${bloc.num}${bloc.nom ? ' ' + bloc.nom : ''}`,
    'palette: ' + cles.map(k => `${k} ${bloc.palette[k]}`).join('  '),
    ...bloc.g.map(r => r.join('')),
  ].join('\n');
}

function texteDoc(doc) {
  const l = [ENTETE, '', `lignee: ${doc.lignee}`, `grille: ${doc.taille}`, `couleurs: ${doc.couleurs}`];
  for (const [k, v] of doc.extra) l.push(`${k}: ${v}`);
  for (const b of doc.blocs) l.push('', texteBloc(b));
  return l.join('\n') + '\n';
}

function ecrire(cle, doc) {
  fs.mkdirSync(DOSSIER, { recursive: true });
  fs.writeFileSync(chemin(cle), texteDoc(doc));
  return path.relative(RACINE, chemin(cle)).split(path.sep).join('/');
}

// ── outils de grille ──────────────────────────────────────────────────────
const clesUtilisees = g => [...new Set(g.flat().filter(c => c !== '.'))].sort();

const voisins8 = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
const voisins4 = [[0,-1],[0,1],[-1,0],[1,0]];
const en = (g, x, y) => (g[y] && g[y][x] !== undefined) ? g[y][x] : '.';

/* Le bruit de quantification : une cellule seule de sa couleur, sans aucune voisine de la
   même clé, même en diagonale. Elle ne se lit pas comme un détail, elle se lit comme une
   poussière — et à 24 pixels de haut elle disparaît de toute façon.

   La règle est délibérément posée sur les HUIT voisins, pas quatre : deux cellules en
   diagonale forment un reflet d'œil parfaitement légitime, et une règle à quatre voisins
   les aurait effacées. C'est la même leçon que le détourage — on ne perce pas les yeux. */
function debruiter(g) {
  const src = g.map(r => r.slice());
  const touchees = [];
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g.length; x++) {
    const c = src[y][x];
    if (c === '.') continue;
    if (voisins8.some(([dx, dy]) => en(src, x + dx, y + dy) === c)) continue;
    const compte = new Map();
    for (const [dx, dy] of voisins8) {
      const v = en(src, x + dx, y + dy);
      if (v !== '.') compte.set(v, (compte.get(v) || 0) + 1);
    }
    if (!compte.size) { g[y][x] = '.'; touchees.push([x, y]); continue; }
    g[y][x] = [...compte.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];
    touchees.push([x, y]);
  }
  return touchees;
}

function ilots(g) {
  const vu = g.map(r => r.map(() => false));
  const parts = [];
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g.length; x++) {
    if (vu[y][x] || g[y][x] === '.') continue;
    const pile = [[x, y]], cellules = [];
    vu[y][x] = true;
    while (pile.length) {
      const [cx, cy] = pile.pop();
      cellules.push([cx, cy]);
      for (const [dx, dy] of voisins8) {
        const nx = cx + dx, ny = cy + dy;
        if (g[ny] && g[ny][nx] !== undefined && !vu[ny][nx] && g[ny][nx] !== '.') {
          vu[ny][nx] = true; pile.push([nx, ny]);
        }
      }
    }
    parts.push(cellules);
  }
  return parts.sort((a, b) => b.length - a.length);
}

const ecarts = (a, b) => {
  const l = [];
  for (let y = 0; y < a.length; y++) for (let x = 0; x < a.length; x++)
    if (a[y][x] !== b[y][x]) l.push({ x, y, de: a[y][x], vers: b[y][x] });
  return l;
};

// ── le contrôle de charte ─────────────────────────────────────────────────
/* Six défauts, tous vus en vrai sur des planches générées. Le plus coûteux est le dernier :
   une palette qui bouge d'un stade à l'autre, c'est la lignée qui cesse d'être une bête qui
   grandit pour devenir cinq bêtes différentes — et ça ne se voit pas stade par stade. */
function charte(doc) {
  const soucis = [];
  const dit = (bloc, titre, cellules) =>
    soucis.push({ bloc: `${bloc.type} ${bloc.num}${bloc.nom ? ' ' + bloc.nom : ''}`, titre, cellules: cellules || [] });

  for (const b of doc.blocs) {
    const utilisees = clesUtilisees(b.g);
    const hors = utilisees.filter(k => !b.palette[k]);
    if (hors.length) dit(b, `clé hors palette : ${hors.join(' ')}`,
      cellulesDe(b.g, c => hors.includes(c)));
    if (utilisees.length > doc.couleurs)
      dit(b, `${utilisees.length} couleurs pour ${doc.couleurs} déclarées (${utilisees.join(' ')})`);

    const ouvert = cellulesDe(b.g, (c, x, y) =>
      c !== '.' && c !== 'o' && voisins4.some(([dx, dy]) => en(b.g, x + dx, y + dy) === '.'));
    if (ouvert.length) dit(b, `contour ouvert sur ${ouvert.length} cellule(s)`, ouvert);

    const parts = ilots(b.g);
    if (parts.length > 1)
      dit(b, `fond non vide : ${parts.length - 1} îlot(s) détaché(s) de la bête`,
        parts.slice(1).flat());

    const seules = cellulesDe(b.g, (c, x, y) =>
      c !== '.' && !voisins8.some(([dx, dy]) => en(b.g, x + dx, y + dy) === c));
    if (seules.length) dit(b, `${seules.length} cellule(s) isolée(s) — bruit de quantification`, seules);
  }

  const refs = doc.blocs.map(b => signature(b.palette));
  doc.blocs.forEach((b, i) => {
    if (i && refs[i] !== refs[0])
      dit(b, `palette différente du ${doc.blocs[0].type} ${doc.blocs[0].num} — dérive de style\n`
            + `      ${doc.blocs[0].type} ${doc.blocs[0].num} : ${refs[0]}\n      ici : ${refs[i]}`);
  });
  return soucis;
}

function cellulesDe(g, f) {
  const l = [];
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g.length; x++)
    if (f(g[y][x], x, y)) l.push([x, y]);
  return l;
}

// ── les noms des stades ───────────────────────────────────────────────────
/* Lus dans game.js, jamais recopiés à la main : c'est la règle de prompt.js, et les noms de
   fichiers doivent tomber sur les mêmes suffixes que ceux que la table ART attend. La
   descente sur l'épithète vient de là aussi — « Ouroboros » et « Ouroboros, la boucle du
   monde » donnaient deux fois le même fichier. */
function nomsDeLignee(cle) {
  const src = fs.readFileSync(path.join(RACINE, 'game.js'), 'utf8');
  const debut = src.indexOf('const LINES = [');
  const bloc = src.slice(debut, src.indexOf('\n];', debut) + 3);
  const LINES = eval('(' + bloc.replace('const LINES =', '').replace(/;\s*$/, '') + ')');
  const ligne = LINES.find(l => l.key === cle);
  if (!ligne) return null;
  const sansAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const vus = new Set();
  return ligne.forms.map(f => {
    const bouts = f[0].split(',').map(x => x.trim());
    let su = sansAccents(bouts[0]);
    if (vus.has(su) && bouts[1]) su = sansAccents(bouts[1]);
    while (vus.has(su)) su += '-bis';
    vus.add(su);
    return su;
  });
}

module.exports = {
  RACINE, DOSSIER, chemin, lire, analyser, ecrire, texteDoc, texteBloc,
  charte, ecarts, debruiter, ilots, clesUtilisees, ordreCles, signature, nomsDeLignee,
};
