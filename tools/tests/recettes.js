/* ── LES RECETTES — apprendre une recette, la lire dans l'encyclopédie, garder le secret */

'use strict';
const { scenario, ok, eq, neuf, poserJetons, couple, pageRecettes } = require('./_aides.js');

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

scenario('recettes — la page ne montre que l’acquis, et masque la créature non découverte', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.ciel = Object.assign(s.ciel || {}, { nid: 1 });   // les recettes se lisent avec la pension
  // la recette du Wukong, apprise à la main : ni la bête ni ses parents n'ont été vus
  s.recettes = { 'golem×golem': true };
  const nom = jeu.LINE_BY_KEY.wukong.name;      // « Sun Wukong »

  /* LE CHEMIN SE LIT, LA RÉCOMPENSE SE TAIT : la recette se range sous « Encore inconnues »,
     avec ses parents et ses chances, sans rien dire de ce qu'elle donne. */
  const t = pageRecettes(jeu);
  ok('la recette se range parmi les inconnues', /Encore inconnues/.test(t) && /Golem × Golem/.test(t), t);
  ok('la chance et la durée se lisent', /2,0 %/.test(t) && /1 h/.test(t), t);
  ok('le nom de la créature ne fuit pas', t.indexOf(nom) < 0, t);
  // UN COMPTE « x / y » TRAHIRAIT QU'IL EN RESTE : on compte l'acquis, jamais le total
  ok('aucun total', t.indexOf('/') < 0, t);

  // une fois vue, elle a son bloc et quitte les inconnues
  s.seen['wukong:1'] = 1;
  const t2 = pageRecettes(jeu);
  ok('découverte, elle se nomme', t2.indexOf(nom) >= 0, t2);
  ok('et quitte les inconnues', !/Encore inconnues/.test(t2), t2);
  ok('marquée comme recette', /recette/.test(t2), t2);
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
