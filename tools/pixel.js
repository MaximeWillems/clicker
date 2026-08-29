/* ── LE PONT ENTRE LES DEUX PIPELINES ─────────────────────────────────────────
   D'un côté un générateur qui décrit les bêtes en formes géométriques, déterministe et
   corrigible en éditant six nombres — mais qui n'existe que pour le crapaud. De l'autre
   cinquante dessins livrés par un modèle d'images, qui ne sont pas du pixel art et qu'il
   faut regénérer en entier pour corriger une patte.

   Cet outil transforme une planche générée en GRILLE DE CARACTÈRES, la représentation du
   premier pipeline. À partir de là une correction est une édition de trois caractères, et
   une animation est possible : mille cellules restent figées pendant qu'on en bouge vingt,
   ce qu'aucun modèle d'images ne sait faire.

     node tools/pixel.js importer art/source-crapaud.png crapaud --couleurs 6
     node tools/pixel.js texte crapaud --stade 3
     node tools/pixel.js rendre crapaud [style] [--png]
     node tools/pixel.js verifier crapaud
     node tools/pixel.js planche crapaud
     node tools/pixel.js diff crapaud --de 4 --a 5
     node tools/pixel.js anim crapaud --stade 5 --images 6
     node tools/pixel.js formes crapaud [style]

   Le projet n'ouvre JAMAIS de navigateur : tout sort en texte dans le terminal, ou en PNG
   qu'on ouvre soi-même. */
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const P = require('./pixels.js');
const G = require('./grilles.js');
const Q = require('./quantifier.js');
const { STYLES } = require('./styles.js');

const RACINE = G.RACINE;
const art = f => path.join(RACINE, 'art', f);
const rel = f => path.relative(RACINE, f).split(path.sep).join('/');

// ── le bras d'image ───────────────────────────────────────────────────────
/* Pillow fait le travail de pixels, Node celui de grille. On cherche l'interpréteur une
   fois : sur Windows c'est souvent `py` et jamais `python3`, ailleurs l'inverse. */
let PYTHON = null;
/* On cherche l'interpréteur sur un import de Pillow plutôt que sur son seul nom : `python`
   existe sur toutes les machines Windows sans forcément rien contenir, et une planche mesurée
   pendant une minute avant d'échouer sur un import est une minute perdue trois fois. */
function interprete() {
  if (PYTHON) return PYTHON;
  for (const cmd of ['python', 'py', 'python3']) {
    const r = spawnSync(cmd, ['-c', 'import PIL'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) return (PYTHON = cmd);
  }
  throw new Error('Python + Pillow introuvables — c\'est la dépendance de decouper.py, rien de plus.');
}

function python(quoi, tache) {
  const r = spawnSync(interprete(), [path.join(__dirname, 'pixel.py'), quoi],
    { input: JSON.stringify(tache), encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`tools/pixel.py a échoué :\n${(r.stderr || '').trim()}`);
  return JSON.parse(r.stdout);
}

// ── arguments ─────────────────────────────────────────────────────────────
function options(argv) {
  const opt = {}, libres = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { libres.push(a); continue; }
    const [nom, val] = a.slice(2).split('=');
    if (val !== undefined) opt[nom] = val;
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) opt[nom] = argv[++i];
    else opt[nom] = true;
  }
  return { opt, libres };
}

const entier = (v, defaut) => (v === undefined || v === true ? defaut : Number(v));

// pixel.py ne connaît pas les clés : il ne reçoit jamais qu'une grille de couleurs et de vides
const enCouleurs = (blocs, imposee) => blocs.map(b =>
  b.g.map(l => l.map(c => (c === '.' ? null : (imposee || b.palette)[c] || null))));

// ── importer ──────────────────────────────────────────────────────────────
/* Le seul morceau difficile. L'entrée est une illustration agrandie et anti-aliasée, pas
   une grille : cinq bêtes sur un fond blanc, en centaines de couleurs, alors que le prompt
   en demandait six à plat.

   L'ordre des opérations n'est pas négociable, et le point 4 a été vérifié à la dure :
     1. détourer depuis les bords (decouper.py) ;
     2. séparer les stades aux N−1 plus grands écarts (decouper.py) ;
     3. ramener à la grille par le mode de chaque bloc (pixel.py) ;
     4. quantifier, puis RECONSTRUIRE le contour — jamais tenter de garder celui de la
        planche. Réduire une illustration anti-aliasée à six couleurs DÉTRUIT le trait : le
        noir ne survit que dans les zones les plus sombres et le reste se fond dans le corps.
        Sur art/crabe-2-crabe.png, la grille sortait avec cent cellules de contour ouvert —
        la bête n'avait plus de trait du tout. On jette le trait d'origine et on le repose
        sur la silhouette quantifiée, exactement comme le fait le générateur. */
function importer(libres, opt) {
  const [source, lignee] = libres;
  if (!source || !lignee) return aide('importer demande une source et une lignée.');
  const taille = entier(opt.grille, 32);
  const cible = entier(opt.couleurs, 6);
  /* Neuf clés, pas dix. Au-delà, la table ECHELLES de quantifier.js n'a plus de lettre à
     donner et la dixième valait `undefined` — écrit tel quel dans la grille, neuf caractères
     d'un coup au milieu d'une ligne. Le fichier sortait corrompu sans que rien ne le dise,
     et seul « planche » s'en apercevait plus tard. Le plafond n'est pas arbitraire : les
     palettes de styles.js ne définissent que ces neuf clés, donc une dixième ne se rendrait
     dans aucun style. */
  if (cible < 1 || cible > 9)
    return aide(`--couleurs ${cible} : le format n'a que neuf clés (o p t v r V c b n).`);
  const noms = opt.noms && opt.noms !== true ? String(opt.noms).split(',')
             : (G.nomsDeLignee(lignee) || []);
  const stades = entier(opt.stades, noms.length || 5);

  const mesure = python('mesurer', { source, stades, grille: taille });
  const brutes = mesure.grilles;
  console.log(`\n${brutes.length} stade(s) détecté(s) dans ${source}`);
  if (brutes.length !== stades)
    console.log(`  ATTENTION : ${stades} attendus. Colonnes occupées : `
              + mesure.blocs.map(([a, b]) => `${a}–${b}`).join(', '));

  // La palette est calculée sur les CINQ stades ensemble. Une palette par stade laisserait
  // passer la dérive de style, qui est précisément le défaut le plus fréquent des planches.
  let palette;
  if (opt.palette && opt.palette !== true) {
    const style = STYLES[opt.palette];
    if (!style) return aide(`style « ${opt.palette} » inconnu : ${Object.keys(STYLES).join(', ')}`);
    palette = style.palette;
  } else {
    const comptes = new Map();
    for (const g of brutes) for (const ligne of g) for (const c of ligne)
      if (c) comptes.set(c, (comptes.get(c) || 0) + 1);
    console.log(`  ${comptes.size} couleurs sur la planche → ${cible} demandées`);
    palette = Q.palette(comptes, cible);
  }
  const versCle = Q.rapprocher(palette);

  const blocs = brutes.map((brute, i) => {
    const g = brute.map(ligne => ligne.map(c => (c ? versCle(c) : '.')));
    P.contour(g, 'o');
    const lisses = G.debruiter(g);
    P.contour(g, 'o');          // reposé après le lissage : un contour doit rester fermé
    return { type: 'stade', num: i + 1, nom: noms[i] || String(i + 1), g, lisses: lisses.length };
  });

  // La palette écrite est réduite aux clés réellement posées : déclarer une couleur qu'on
  // n'emploie pas ferait échouer le compte du contrôle de charte pour rien.
  const utilisees = new Set(blocs.flatMap(b => G.clesUtilisees(b.g)));
  const reduite = {};
  for (const k of G.ordreCles(palette)) if (utilisees.has(k)) reduite[k] = palette[k];

  for (const b of blocs) b.palette = reduite;
  const doc = {
    lignee, taille, couleurs: Object.keys(reduite).length,
    extra: new Map([['source', rel(path.resolve(source))]]), blocs,
  };
  const cle = opt.vers && opt.vers !== true ? opt.vers : lignee;
  const ecrit = G.ecrire(cle, doc);

  console.log(`  palette : ${G.signature(reduite)}`);
  blocs.forEach(b => {
    const pleines = b.g.flat().filter(c => c !== '.').length;
    console.log(`  stade ${b.num} ${b.nom.padEnd(20)} ${String(pleines).padStart(4)} cellules pleines,`
              + ` ${G.clesUtilisees(b.g).length} couleurs, ${b.lisses} lissées`);
  });
  console.log(`\n  ${ecrit}\n  node tools/pixel.js texte ${cle}   pour la lire, `
            + `verifier ${cle} pour le contrôle de charte\n`);
}

// ── texte ─────────────────────────────────────────────────────────────────
/* La finalité de tout l'outil : une grille qu'on colle dans une conversation, qu'on corrige
   à la main et qu'on renvoie. Les lignes de contexte commencent donc toutes par « # » —
   elles font partie du format et repassent sans bruit par l'analyseur au retour. */
function texte(libres, opt) {
  const cle = libres[0];
  if (!cle) return aide('texte demande une lignée.');
  const doc = G.lire(cle);
  if (opt.stade === undefined) { process.stdout.write(G.texteDoc(doc)); return; }
  const num = entier(opt.stade, 1);
  const bloc = doc.blocs.find(b => b.num === num);
  if (!bloc) return aide(`${cle} n'a pas de stade ${num}.`);
  console.log(`# ${doc.lignee} — grille ${doc.taille} — ${doc.couleurs} couleurs`);
  console.log(G.texteBloc(bloc));
}

// ── rendre ────────────────────────────────────────────────────────────────
function rendre(libres, opt) {
  const [cle, styleCle] = libres;
  if (!cle) return aide('rendre demande une lignée.');
  const doc = G.lire(cle);
  const style = styleCle ? STYLES[styleCle] : null;
  if (styleCle && !style) return aide(`style « ${styleCle} » inconnu : ${Object.keys(STYLES).join(', ')}`);
  console.log('');
  for (const b of doc.blocs) {
    const palette = style ? style.palette : b.palette;
    // les fichiers portent le nom du FICHIER de grille, pas celui de la lignée : deux passes
    // de la même planche comparées par --vers ne doivent pas s'écraser l'une l'autre
    const f = art(`${cle}-${b.num}-${b.nom || b.num}.svg`);
    fs.writeFileSync(f, P.versSVG(b.g, palette));
    console.log(`  ${rel(f)}`);
  }
  if (opt.png) {
    /* La planche réimportable, et c'est sa seule raison d'être : au plus proche voisin, à
       échelle entière, avec une gouttière franche entre les stades. Elle referme
       l'aller-retour — importer, rendre, réimporter doit rendre la même grille à l'octet. */
    const r = python('ecrire', {
      chemin: art(`apercu-${cle}-rendu.png`), grilles: enCouleurs(doc.blocs, style && style.palette),
      cellules: 8, gouttiere: 32, fond: 'vide',
    });
    console.log(`  ${rel(r.chemin)}  ${r.largeur}×${r.hauteur}`);
  }
  console.log(`\n  ${doc.blocs.length} sprites en style « ${style ? style.nom : 'palette du fichier'} »\n`);
}

// ── verifier ──────────────────────────────────────────────────────────────
function verifier(libres) {
  const cle = libres[0];
  if (!cle) return aide('verifier demande une lignée.');
  const doc = G.lire(cle);
  const soucis = G.charte(doc);
  console.log(`\n${doc.lignee} — ${doc.blocs.length} ${doc.blocs[0] ? doc.blocs[0].type : 'stade'}s,`
            + ` grille ${doc.taille}, ${doc.couleurs} couleurs déclarées`);
  if (!soucis.length) { console.log('  charte respectée.\n'); return; }
  for (const s of soucis) {
    console.log(`\n  ✗ ${s.bloc} : ${s.titre}`);
    if (s.cellules.length) console.log('      ' + listeCellules(s.cellules));
  }
  console.log(`\n  ${soucis.length} défaut(s).\n`);
  process.exitCode = 1;
}

/* Les cellules fautives sont données en (colonne, ligne) et coupées à trente : au-delà on
   ne lit plus une liste, on lit un mur, et le nombre suffit à savoir que c'est grave. */
function listeCellules(cellules) {
  const l = cellules.slice(0, 30).map(([x, y]) => `${x},${y}`).join('  ');
  return l + (cellules.length > 30 ? `  … +${cellules.length - 30}` : '');
}

// ── planche ───────────────────────────────────────────────────────────────
function planche(libres) {
  const cle = libres[0];
  if (!cle) return aide('planche demande une lignée.');
  const doc = G.lire(cle);
  const r = python('ecrire', {
    chemin: art(`apercu-${cle}-grille.png`), grilles: enCouleurs(doc.blocs),
    cellules: Math.max(1, Math.round(160 / doc.taille)), vignette: 24, fond: 'blanc',
  });
  console.log(`\n  ${rel(r.chemin)}  ${r.largeur}×${r.hauteur}`);
  console.log('  Juge TOUJOURS sur cette image : le défaut d\'une silhouette n\'apparaît que'
            + ' dans la vignette de 24 px.\n');
}

// ── diff ──────────────────────────────────────────────────────────────────
function diff(libres, opt) {
  const cle = libres[0];
  if (!cle) return aide('diff demande une lignée.');
  const doc = G.lire(cle);
  const de = doc.blocs.find(b => b.num === entier(opt.de, 1));
  const a = doc.blocs.find(b => b.num === entier(opt.a, 2));
  if (!de || !a) return aide('diff demande --de et --a, deux numéros de stade existants.');
  const l = G.ecarts(de.g, a.g);
  console.log(`\n${doc.lignee} : ${l.length} cellules changent du ${de.type} ${de.num} au ${a.num}`
            + ` (${(100 * l.length / (doc.taille * doc.taille)).toFixed(1)} % de la grille)\n`);
  const carte = de.g.map(r => r.map(() => '.'));
  for (const c of l) carte[c.y][c.x] = '#';
  console.log(carte.map(r => r.join('')).join('\n'));
  console.log('');
  for (const c of l.slice(0, 40)) console.log(`  ${c.x},${c.y}  ${c.de} → ${c.vers}`);
  if (l.length > 40) console.log(`  … +${l.length - 40}`);
  console.log('');
}

// ── anim ──────────────────────────────────────────────────────────────────
/* Les animations des merveilles sont la raison d'être de tout l'outil : quatre à six images
   où « seules quelques formes plates changent ; tout le reste de la planche est identique ».
   Aucun modèle d'images ne garde mille pixels figés pendant qu'on en bouge vingt.

   D'où la règle que cette commande fait respecter, et qui n'est pas un avertissement : une
   image qui bouge plus de cellules que déclaré est REFUSÉE, avec la liste. Ce qui bouge
   n'est jamais la bête — si le corps se met à respirer, l'animation est ratée, et le seul
   moment où on peut s'en apercevoir est celui-ci. */
function anim(libres, opt) {
  const cle = libres[0];
  if (!cle) return aide('anim demande une lignée.');
  const stade = entier(opt.stade, 5);
  const cleAnim = `${cle}-anim${stade}`;
  const images = entier(opt.images, 0);

  if (!fs.existsSync(G.chemin(cleAnim))) {
    const doc = G.lire(cle);
    const bloc = doc.blocs.find(b => b.num === stade);
    if (!bloc) return aide(`${cle} n'a pas de stade ${stade}.`);
    const n = images || 5;
    const bouge = entier(opt.bouge, 40);
    const neuf = {
      lignee: doc.lignee, taille: doc.taille, couleurs: doc.couleurs,
      extra: new Map([['stade', String(stade)], ['bouge', String(bouge)]]),
      blocs: Array.from({ length: n }, (_, i) => ({
        type: 'image', num: i + 1, nom: '', palette: bloc.palette, g: bloc.g.map(r => r.slice()),
      })),
    };
    console.log(`\n  ${G.ecrire(cleAnim, neuf)}`);
    console.log(`  ${n} images identiques, ${bouge} cellules de jeu déclarées.`);
    console.log('  Édite les images 2 et suivantes, puis relance la commande : ce qui dépasse'
              + ' est refusé.\n');
    return;
  }

  const doc = G.lire(cleAnim);
  const bouge = entier(doc.extra.get('bouge'), 40);
  console.log(`\n${cle} — animation du stade ${stade} : ${doc.blocs.length} images,`
            + ` ${bouge} cellules autorisées par image`);
  const refus = [];
  if (images && doc.blocs.length !== images)
    refus.push({ titre: `${doc.blocs.length} images dans le fichier, ${images} demandées`, cellules: [] });
  for (const s of G.charte(doc)) refus.push({ titre: `${s.bloc} : ${s.titre}`, cellules: s.cellules });
  // toujours comparée à la PREMIÈRE image : d'une image à l'autre les écarts se compensent,
  // et un corps qui dérive lentement passerait sans qu'aucun pas ne dépasse le seuil
  doc.blocs.slice(1).forEach(b => {
    const l = G.ecarts(doc.blocs[0].g, b.g);
    console.log(`  image ${b.num} : ${l.length} cellules bougent`);
    if (l.length > bouge)
      refus.push({ titre: `image ${b.num} : ${l.length} cellules bougent, ${bouge} déclarées`,
                   cellules: l.map(c => [c.x, c.y]) });
  });

  if (refus.length) {
    for (const r of refus) {
      console.log(`\n  ✗ ${r.titre}`);
      if (r.cellules.length) console.log('      ' + listeCellules(r.cellules));
    }
    console.log('\n  REFUSÉ — aucune planche écrite.\n');
    process.exitCode = 1;
    return;
  }

  /* Images jointives, toutes de la même largeur : le rendu ne découpe rien, il pose la
     bande en background-image et fait défiler background-position en steps(N). */
  const r = python('ecrire', {
    chemin: art(`apercu-${cle}-anim${stade}.png`), grilles: enCouleurs(doc.blocs), cellules: 8, fond: 'vide',
  });
  console.log(`\n  ${rel(r.chemin)}  ${r.largeur}×${r.hauteur}  —  ${doc.blocs.length} images`
            + ` de ${r.hauteur} px, steps(${doc.blocs.length})\n`);
}

// ── formes ────────────────────────────────────────────────────────────────
/* Le pont dans l'autre sens : une lignée décrite en formes géométriques devient une grille.
   C'est la non-régression du crapaud — la seule lignée qui existe dans les deux mondes — et
   c'est aussi le seul moyen de repartir d'une silhouette générée pour la corriger à la main. */
function formes(libres) {
  const [cle, styleCle] = libres;
  if (!cle) return aide('formes demande une lignée.');
  const f = path.join(__dirname, `formes-${cle}.js`);
  if (!fs.existsSync(f)) return aide(`pas de tools/formes-${cle}.js — seul le crapaud est décrit en formes.`);
  const { FORMES, ORDRE } = require(f);
  const style = STYLES[styleCle || 'contour'];
  if (!style) return aide(`style « ${styleCle} » inconnu : ${Object.keys(STYLES).join(', ')}`);

  const blocs = ORDRE.map(([nom], i) => {
    const g = P.grille(style.taille);
    FORMES[nom](P.aLEchelle(style.taille / 32), g);
    if (style.contour === 'plein') P.contour(g, 'o');
    else if (style.contour === 'haut') P.contourHaut(g, 'o');
    return { type: 'stade', num: i + 1, nom, g };
  });
  const utilisees = new Set(blocs.flatMap(b => G.clesUtilisees(b.g)));
  const palette = {};
  for (const k of G.ordreCles(style.palette)) if (utilisees.has(k)) palette[k] = style.palette[k];
  for (const b of blocs) b.palette = palette;

  const doc = {
    lignee: cle, taille: style.taille, couleurs: Object.keys(palette).length,
    extra: new Map([['formes', `tools/formes-${cle}.js`], ['style', styleCle || 'contour']]),
    blocs,
  };
  console.log(`\n  ${G.ecrire(cle, doc)}  —  ${blocs.length} stades, style « ${style.nom} »`);
  console.log(`  palette : ${G.signature(palette)}\n`);
}

// ── aiguillage ────────────────────────────────────────────────────────────
function aide(erreur) {
  if (erreur) console.error('\n  ' + erreur);
  console.log(`
  node tools/pixel.js importer <planche.png> <lignée> [--grille 32] [--couleurs 6]
                               [--stades 5] [--noms a,b,c] [--palette <style>] [--vers <clé>]
      une planche générée → art/grilles/<lignée>.txt, cinq stades en caractères

  node tools/pixel.js texte <lignée> [--stade 3]
      imprime la ou les grilles — c'est ce qu'on colle dans une conversation pour corriger

  node tools/pixel.js rendre <lignée> [style] [--png]
      grilles → art/<lignée>-N-nom.svg ; --png ajoute la planche réimportable

  node tools/pixel.js verifier <lignée>          le contrôle de charte
  node tools/pixel.js planche <lignée>           art/apercu-<lignée>-grille.png
  node tools/pixel.js diff <lignée> --de 4 --a 5 les cellules qui changent
  node tools/pixel.js anim <lignée> --stade 5 --images 6
  node tools/pixel.js formes <lignée> [style]    les formes géométriques → une grille

  styles : ${Object.keys(STYLES).join(', ')}
`);
  if (erreur) process.exitCode = 1;
}

const COMMANDES = { importer, texte, rendre, verifier, planche, diff, anim, formes };
const { opt, libres } = options(process.argv.slice(2));
const quoi = libres.shift();
if (!quoi || !COMMANDES[quoi]) aide(quoi && `commande « ${quoi} » inconnue.`);
else {
  try { COMMANDES[quoi](libres, opt); }
  catch (e) { console.error('\n  ' + e.message + '\n'); process.exitCode = 1; }
}
