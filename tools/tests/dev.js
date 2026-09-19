/* ── LE MODE DÉVELOPPEUR — outils d'administration, et droits retirés au joueur ordinaire */

'use strict';
const { scenario, ok, eq, neuf, noeuds } = require('./_aides.js');

const g = id => noeuds.get(id);

scenario('dev — ?userType=Dev ouvre le mode, rien d’autre ne l’ouvre', () => {
  const jeu = neuf();
  const vrai = global.location.search;
  try {
    global.location.search = '?userType=Dev';
    ok('Dev ouvre', jeu.detecterDev());
    global.location.search = '?userType=dev';
    ok('la casse est ignorée', jeu.detecterDev());
    global.location.search = '?userType=joueur';
    ok('un autre type n’ouvre pas', !jeu.detecterDev());
    global.location.search = '';
    ok('rien n’ouvre pas', !jeu.detecterDev());
  } finally { global.location.search = vrai; }
});

scenario('dev — la vitesse et les outils sont retirés au joueur, rendus au dev', () => {
  const jeu = neuf();
  jeu.modeDev = false; jeu.appliquerModeDev();
  ok('la vitesse est cachée au joueur', g('btn-speed').hidden);
  ok('les outils dev aussi', g('btn-dev').hidden);

  jeu.modeDev = true; jeu.appliquerModeDev();
  ok('le dev retrouve la vitesse', !g('btn-speed').hidden);
  ok('et le bouton des outils', !g('btn-dev').hidden);
});

scenario('dev — créditer des jetons d’ascension, et récupérer ceux investis', () => {
  const jeu = neuf();
  jeu.state.asc = { n: 0, paliers: 0, jetons: 0, sommet: 0, depense: 0 };
  jeu.devAjouterJetons(100);
  eq('cent jetons crédités', jeu.jetonsEnMain(), 100);

  jeu.state.ciel = { a: 1, b: 1 };
  jeu.state.asc.depense = 40;
  jeu.devRendreJetons();
  eq('la constellation est vidée', Object.keys(jeu.state.ciel).length, 0);
  eq('la dépense repart à zéro', jeu.state.asc.depense, 0);
  eq('et tout revient en main', jeu.jetonsEnMain(), 100);
});

scenario('dev — faire venir et renvoyer le marchand', () => {
  const jeu = neuf();
  jeu.devMarchandVenir();
  ok('le marchand est là', jeu.marchandIci());
  eq('avec un étal plein', jeu.state.marchand.offres.length, jeu.MARCHAND.offres);
  ok('et l’étal est ouvert', jeu.etalOuvert);

  jeu.devMarchandPartir();
  ok('le marchand est reparti', !jeu.marchandIci());
  ok('et l’étal refermé', !jeu.etalOuvert);
});

scenario('dev — l’éditeur écrit le texte dans la sauvegarde et recharge', () => {
  const jeu = neuf();
  const avant = require('../banc.js').rechargements();
  const bon = JSON.stringify({ v: jeu.SAVE_V, coins: 4242, pen: [], incub: [] });
  const r = jeu.devAppliquerSave(bon);
  ok('le JSON valide est accepté', r.ok);
  ok('la sauvegarde porte le texte', (require('../banc.js').brut() || '').indexOf('4242') >= 0);
  ok('et la page recharge', require('../banc.js').rechargements() > avant);

  const ko = jeu.devAppliquerSave('{ pas du json');
  ok('un JSON cassé est refusé', !ko.ok);
});

scenario('dev — remplir l’éditeur depuis l’état vivant', () => {
  const jeu = neuf();
  jeu.state.coins = 777;
  jeu.devRelireSave();
  ok('le texte reflète l’état', g('dev-save').value.indexOf('777') >= 0);
});
