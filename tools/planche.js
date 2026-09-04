/* ── LA LISTE DES TROUS DE LA PLANCHE ──────────────────────────────────────────
       node tools/planche.js

   `tools/planche.html` est écrite À LA MAIN, et c'est ce qui fait sa valeur : elle montre le
   vrai `style.css` sans une ligne de jeu, donc ce qu'on y voit est ce que le joueur voit.
   C'est aussi son seul défaut, et il est connu depuis le premier jour : ELLE DÉRIVE. Une
   classe ajoutée à `game.js`, un état de plus sur un bouton, et la planche continue d'afficher
   un jeu qui n'existe plus — en silence, ce qui est la pire façon.

   Ce script ne corrige rien et ne juge rien. Il relève les classes que le jeu POSE réellement
   — dans `game.js` et dans `index.html` — et dit lesquelles la planche ne montre jamais.
   Ce n'est pas un test : une classe absente n'est pas une faute, c'est un trou. On le comble
   quand on passe à côté, ou on décide qu'il n'intéresse personne.

   Il ne regarde pas `style.css` : une classe qui a du style mais que rien ne pose est un autre
   problème, et ce n'est pas celui de la planche. */

'use strict';
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');
const lire = f => fs.readFileSync(path.join(RACINE, f), 'utf8');

/* CE QUI COMPTE COMME « POSER UNE CLASSE ». Quatre façons, et il a fallu les quatre :
   `className = '…'`, `classList.add/toggle/remove('…')`, un `class="…"` écrit dans un
   `innerHTML`, et le `class="…"` de `index.html`. Une cinquième apparaîtra ; elle se verra au
   premier trou qui n'a pas de raison d'être là. */
function classesPosees(src) {
  const vues = new Set();
  const garder = t => t.split(/\s+/).forEach(c => {
    // on saute les fragments d'expression : 'rar-' + rarity laisse un 'rar-' qui ne veut rien dire
    if (c && /^[a-z][-a-z0-9_]*$/i.test(c) && !c.endsWith('-')) vues.add(c);
  });
  let m;
  const cn = /className\s*=\s*'([^']*)'/g;
  while ((m = cn.exec(src))) garder(m[1]);
  const cl = /classList\.(?:add|remove|toggle)\(\s*'([^']*)'/g;
  while ((m = cl.exec(src))) garder(m[1]);
  const at = /class="([^"]*)"/g;
  while ((m = at.exec(src))) garder(m[1]);
  return vues;
}

const pose = new Set([...classesPosees(lire('game.js')),
                      ...classesPosees(lire('index.html'))]);
const montre = classesPosees(lire('tools/planche.html'));

/* LES CLASSES DE LA PLANCHE ELLE-MÊME NE COMPTENT PAS. Elles portent toutes le préfixe `pl-`,
   et c'est exactement pour qu'on puisse les écarter d'un mot. */
const trous = [...pose].filter(c => !montre.has(c) && !c.startsWith('pl-')).sort();

console.log('');
console.log('LA PLANCHE — ce que le jeu pose et qu’elle ne montre pas');
console.log('');
console.log('  classes posées par le jeu   ' + pose.size);
console.log('  montrées par la planche     ' + (pose.size - trous.length));
console.log('  jamais montrées             ' + trous.length +
            '   (' + Math.round(trous.length / pose.size * 100) + ' %)');
console.log('');

if (!trous.length) {
  console.log('  Aucun trou. Ça n’arrivera pas deux fois : ajoute une classe et reviens.');
} else {
  /* Regroupées par préfixe : les trous viennent presque toujours par familles — un panneau
     entier, une vue entière — et une liste à plat de deux cents mots ne se lit pas. */
  const familles = new Map();
  for (const c of trous) {
    const f = (c.match(/^[a-z]+/i) || ['divers'])[0];
    if (!familles.has(f)) familles.set(f, []);
    familles.get(f).push(c);
  }
  const rangees = [...familles.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [f, liste] of rangees) {
    console.log('  ' + (f + ' ').padEnd(14, '·') + ' ' + liste.join(' '));
  }
  console.log('');
  console.log('  Un trou n’est pas une faute. C’est une chose qu’on ne pourra pas vérifier');
  console.log('  à l’œil tant qu’elle n’est pas sur la planche.');
}
console.log('');
