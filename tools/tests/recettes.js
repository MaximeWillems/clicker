/* ── LE CARNET DES RECETTES — apprendre une recette, la lire, garder le secret */

'use strict';
const { scenario, ok, eq, neuf, noeuds, poserJetons, bete, couple } = require('./_aides.js');

const onglet = v => [...document.querySelectorAll('.onglet')].find(b => b.dataset.vue === v);
const cartesRecette = () => noeuds.get('recettes-liste').children
  .filter(n => (n.className || '').includes('recette'));

scenario('recettes — réussir une ponte apprend la recette, jamais avant', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const [g1, g2] = couple(jeu, 'golem', 'golem');   // porte la recette du Wukong
  jeu.accoupler(g1, g2);
  jeu.refresh();

  eq('rien d’appris au départ', jeu.recettesConnues(), 0);
  eq('et l’onglet est caché', onglet('recettes').hidden, true);

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
  eq('la recette réussie entre au carnet', jeu.recettesConnues(), 1);
  ok('c’est bien le couple de la recette',
     jeu.recetteConnue(jeu.RECETTES.find(r => r.donne === 'wukong')));

  jeu.refresh();
  eq('et l’onglet paraît', onglet('recettes').hidden, false);
});

scenario('recettes — le carnet ne montre que l’acquis, et masque la créature non découverte', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  // on apprend la recette du Wukong à la main, sans avoir vu la bête
  s.recettes = { 'golem×golem': true };
  jeu.recettesSig = '';
  jeu.ouvrirVue('recettes');

  eq('une seule entrée au carnet', cartesRecette().length, 1);

  /* UN COMPTE « x / y » TRAHIRAIT QU'IL EN RESTE. Le carnet ne dit jamais combien de recettes
     existent, seulement combien on en connaît. */
  const dit = noeuds.get('recettes-dit').textContent;
  ok('il compte l’acquis, pas le total', dit.indexOf('/') < 0, dit);
  ok('et il dit une recette apprise', /1 recette apprise/.test(dit), dit);

  // la créature au bout se tait tant qu'on ne l'a pas vue
  const nom = jeu.LINE_BY_KEY.wukong.name;      // « Sun Wukong »
  const donne = () => cartesRecette()[0].children.find(x => (x.className || '').includes('recette-donne'));
  const nomDonne = () => donne().children.map(x => x.textContent).join(' ');
  ok('la créature reste inconnue', (donne().className || '').includes('inconnue'));
  ok('et son nom ne fuite pas', nomDonne().indexOf(nom) < 0, nomDonne());

  // une fois vue, elle se montre
  s.seen['wukong:1'] = 1;
  jeu.recettesSig = ''; jeu.renderRecettes();
  ok('découverte, elle n’est plus masquée', !(donne().className || '').includes('inconnue'));
  ok('et elle se nomme', nomDonne().indexOf(nom) >= 0, nomDonne());
});

scenario('recettes — le couple et les chances se lisent, même créature cachée', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.recettes = { 'golem×golem': true };
  jeu.recettesSig = '';
  jeu.ouvrirVue('recettes');

  const carte = cartesRecette()[0];
  const profond = n => (n.children && n.children.length)
    ? n.children.map(profond).join(' ')
    : (n.textContent || '');
  const tout = profond(carte);
  /* LE CHEMIN N'EST PAS SECRET : les parents et les chances se voient toujours. C'est la
     récompense qu'on cache, pas la question. */
  ok('les parents se nomment', /Golem/.test(tout), tout);
  ok('la chance se lit', /0,1 %|0.1 %/.test(tout), tout);
  ok('la durée se lit', /1 h/.test(tout), tout);
});

scenario('recettes — le carnet traverse l’ascension', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  s.recettes = { 'golem×golem': true };
  poserJetons(jeu, 1);
  jeu.ascensionner();
  eq('la recette apprise demeure', jeu.recettesConnues(), 1);
  ok('c’est la même', jeu.state.recettes['golem×golem']);
});
