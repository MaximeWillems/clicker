/* ── LA SUITE DE TESTS ────────────────────────────────────────────────────────
       node tools/test.js              tout
       node tools/test.js bonheur      seulement les scénarios dont le nom contient « bonheur »

   Le projet n'ouvre jamais de navigateur : ces scénarios sont la seule chose qui dise si le
   jeu marche encore. Ils ont été écrits au fil des versions, chacun le jour où quelque chose
   s'est cassé — c'est pourquoi ils visent des endroits précis plutôt que de couvrir
   uniformément.

   CE QU’ILS NE PROUVENT PAS : rien de visuel. Le DOM du banc ne met rien en page. Un panneau
   superposé, un texte illisible ou une couleur ratée passent tous les tests.

   UN FICHIER PAR SUJET, ET CE N’EST PAS DU RANGEMENT. Les six mille lignes d’un seul fichier
   ont fini par contenir cent cinquante-deux lignes recopiées mot pour mot — quatre scénarios
   et une aide, écrits deux fois, qui passaient deux fois et ne prouvaient rien de plus. Les
   titres de section, eux, avaient dérivé : « la poussière et la forge » annonçait un scénario
   de clic, et les vrais scénarios de forge vivaient sous « la constellation ». Un nom de
   fichier ne dérive pas, et on ne recopie pas dans un fichier ce qu’on voit déjà dedans. */

'use strict';
const { compte } = require('./tests/_aides.js');

const SUJETS = [
  'socle', 'bete', 'oeufs', 'ferme',
  'bonheur', 'histoire', 'plonge', 'pension',
  'merveilles', 'encyclopedie', 'globales', 'primes',
  'constellation', 'ascension', 'forge', 'album',
  'couleurs', 'recettes', 'sauvegarde',
];

for (const s of SUJETS) require('./tests/' + s + '.js');

/* ───────────────────────────── le verdict ───────────────────────────── */

console.log();
if (compte.ratees.length) {
  console.log('  ' + compte.ratees.length + ' vérification(s) en échec :');
  for (const [nom, quoi] of compte.ratees) console.log('    · ' + nom + ' — ' + quoi);
  console.log();
  console.log('  ' + compte.scenarios + ' scénarios, ' + compte.verifs +
              ' vérifications, ' + compte.ratees.length + ' ÉCHECS');
  process.exit(1);
}
console.log('  ' + compte.scenarios + ' scénarios, ' + compte.verifs + ' vérifications, tout passe');
