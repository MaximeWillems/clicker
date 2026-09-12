/* ── LES LIGNÉES, VUES DES OUTILS ─────────────────────────────────────────────
   La table `LINES` du jeu, et la règle qui transforme le nom d'une forme en suffixe de
   fichier — `art/ouroboros-5-boucle-du-monde.png`.

   ELLE ÉTAIT ÉCRITE DEUX FOIS, et les deux copies ont dérivé sans que rien ne le dise :
   `tools/grilles.js` et `tools/prompt.js` portaient chacun son `sansAccents`, sa descente sur
   l'épithète, son `-bis`, et jusqu'à son commentaire expliquant pourquoi. Deux outils qui
   fabriquent le MÊME nom de fichier par deux chemins différents finissent par ne plus
   fabriquer le même nom, et c'est la table `ART` qui l'apprend en cherchant une image absente.

   ET ELLES LISAIENT `game.js` COMME UN TEXTE. Chacune découpait la source entre
   `const LINES = [` et le `];` suivant, puis passait le morceau à `eval` — une lecture que la
   moindre accolade déplacée casse, et qui ne saurait rien d'une lignée calculée. Le banc, lui,
   FAIT TOURNER le jeu : la table qu'il rend est celle que le joueur voit. On le charge à la
   première question, jamais au chargement du module, pour que `pixel.js` reste immédiat quand
   il ne demande aucun nom. */

'use strict';

let _lines = null;
const LINES = () => (_lines || (_lines = require('./banc.js').neuf().LINES));

// `ligneeDe` existe déjà dans game.js, où elle dit tout autre chose : ici, ce sera `parCle`.
const parCle = cle => LINES().find(l => l.key === cle) || null;

const sansAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* LE SUFFIXE VIENT DU NOM, mais l'arc de la révélation garde le MÊME nom aux cinq âges :
   « Ouroboros » et « Ouroboros, la boucle du monde » donnaient deux fois `ouroboros`, et la
   commande de découpe annonçait des fichiers en double. Quand le premier bout est déjà pris on
   descend sur l'ÉPITHÈTE — ce qui suit la virgule est justement ce qui distingue — et le `-bis`
   ne reste que pour le cas où même l'épithète se répète. */
function suffixes(ligne) {
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

// les suffixes d'une lignée désignée par sa clé, ou null si la clé n'existe pas
const nomsDeLignee = cle => {
  const ligne = parCle(cle);
  return ligne ? suffixes(ligne) : null;
};

module.exports = { LINES, parCle, sansAccents, suffixes, nomsDeLignee };
