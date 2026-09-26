/* ── LES RECETTES — apprendre une recette, la lire dans l'encyclopédie, garder le secret */

'use strict';
const { scenario, ok, eq, neuf, noeuds, poserJetons, couple, fiche } = require('./_aides.js');

scenario('recettes — réussir une ponte apprend la recette, jamais avant', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [g1, g2] = couple(jeu, 'golem', 'golem');   // porte la recette du Wukong
  jeu.accoupler(g1, g2);
  jeu.refresh();

  eq('rien d’appris au départ', jeu.recettesConnues(), 0);

  const vrai = Math.random;
  try {
    Math.random = () => 0.99;                        // le centième ne tombe pas
    jeu.avancePension(3601);
  } finally { Math.random = vrai; }
  eq('une ponte ordinaire n’apprend rien', jeu.recettesConnues(), 0);

  try {
    Math.random = () => 0;                           // le centième tombe : Wukong pondu
    jeu.avancePension(3601);
  } finally { Math.random = vrai; }
  eq('la recette réussie est apprise', jeu.recettesConnues(), 1);
  ok('c’est bien le couple de la recette',
     jeu.recetteConnue(jeu.RECETTES.find(r => r.donne === 'wukong')));
});

scenario('recettes — l’encyclopédie ne montre que l’acquis, et masque la créature non découverte', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  // la recette du Wukong, apprise à la main : ni la bête ni ses parents n'ont été vus
  s.recettes = { 'golem×golem': true };
  const nom = jeu.LINE_BY_KEY.wukong.name;      // « Sun Wukong »

  /* LE CHEMIN SE LIT CHEZ LE PARENT, MÊME JAMAIS RENCONTRÉ : le marchand vend la recette sans
     la rencontre, et le carnet qui la montrait s'est fondu dans l'encyclopédie (5.12.1). */
  const g = fiche(jeu, 'golem', 'recettes');
  ok('l’onglet s’ouvre chez le parent', !noeuds.get('ency-onglets').hidden);
  ok('les parents se nomment', /Golem × Golem → Encore inconnue/.test(g.tout), g.tout);
  ok('la chance et la durée se lisent', /2,0 %/.test(g.tout) && /1 h/.test(g.tout), g.tout);
  ok('le nom de la créature ne fuit pas', g.tout.indexOf(nom) < 0, g.tout);
  // UN COMPTE « x / y » TRAHIRAIT QU'IL EN RESTE : on compte l'acquis, jamais le total
  ok('aucun total', g.tout.indexOf('/') < 0, g.tout);

  // une fois vue, elle se nomme — chez le parent, et sur sa propre fiche
  s.seen['wukong:1'] = 1;
  const g2 = fiche(jeu, 'golem', 'recettes');
  ok('découverte, elle se nomme', g2.tout.indexOf(nom) >= 0, g2.tout);
  const w = fiche(jeu, 'wukong', 'recettes');
  ok('sa fiche dit comment la faire naître', /Golem × Golem/.test(w.tout), w.tout);
  ok('et que c’est une recette', /recette/.test(w.tout), w.tout);
});

scenario('recettes — ce qu’on a appris traverse l’ascension', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  s.recettes = { 'golem×golem': true };
  poserJetons(jeu, 1);
  jeu.ascensionner();
  eq('la recette apprise demeure', jeu.recettesConnues(), 1);
  ok('c’est la même', jeu.state.recettes['golem×golem']);
});
