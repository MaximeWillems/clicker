/* ── LE DÉPÔT ─────────────────────────────────────────────────────────────────
   Où sont les fichiers, et comment on les lit. Rien d'autre.

   IL EXISTE PARCE QUE LA RACINE ÉTAIT CALCULÉE DE QUATRE FAÇONS. `path.resolve(__dirname,
   '..')` dans le banc et les grilles, `path.join(__dirname, '..')` dans les couleurs et la
   planche, `G.RACINE` emprunté aux grilles dans le pixel — et, dans le prompt et le rendu,
   pas de racine du tout : un `fs.readFileSync('game.js')` qui ne marche que si on lance
   l'outil depuis le bon dossier. Quatre réponses à une question qui n'en a qu'une, dont une
   qui se trompe une fois sur deux selon l'endroit d'où l'on tape la commande.

   Un outil qui cite ce fichier tourne depuis n'importe où. C'est la seule chose qu'il
   apporte, et c'est assez pour qu'il existe. */

'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');

/* Un chemin ABSOLU depuis la racine du dépôt. Les bouts se donnent à la mode d'Unix —
   `chemin('art', 'grilles', 'oeufs.txt')` — et ressortent à la mode de la machine. */
const chemin = (...bouts) => path.join(RACINE, ...bouts);

/* Et le chemin à afficher : toujours des barres obliques, sur toutes les machines. Ce qui
   s'imprime dans un message d'erreur doit pouvoir se recopier dans une commande. */
const rel = f => path.relative(RACINE, path.isAbsolute(f) ? f : chemin(f))
  .split(path.sep).join('/');

const art = (...bouts) => chemin('art', ...bouts);
const existe = f => fs.existsSync(path.isAbsolute(f) ? f : chemin(f));
const lire = f => fs.readFileSync(path.isAbsolute(f) ? f : chemin(f), 'utf8');

/* ÉCRIRE CRÉE LE DOSSIER MANQUANT. Sans ça, chaque outil qui pose un fichier dans un dossier
   neuf doit y penser lui-même — et celui qui n'y pense pas échoue le jour où quelqu'un clone
   le dépôt sans ce dossier, jamais avant. */
function ecrire(f, texte) {
  const cible = path.isAbsolute(f) ? f : chemin(f);
  fs.mkdirSync(path.dirname(cible), { recursive: true });
  fs.writeFileSync(cible, texte, 'utf8');
  return rel(cible);
}

module.exports = { RACINE, chemin, rel, art, existe, lire, ecrire };
