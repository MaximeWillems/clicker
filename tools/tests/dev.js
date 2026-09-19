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

scenario('dev — l’éditeur ouvre un champ par clé de la sauvegarde', () => {
  const jeu = neuf();
  jeu.state.coins = 777; jeu.save();
  jeu.chargerEditeurDepuisSave();
  const coins = jeu.champsSave.find(c => c.cle === 'coins');
  ok('la clé coins a son champ', !!coins);
  eq('avec sa valeur', coins.valeur, '777');
  const album = jeu.champsSave.find(c => c.cle === 'album');
  ok('un objet/tableau passe en champ « gros »', album && album.gros);
});

scenario('dev — modifier, ajouter et retirer des champs, puis appliquer', () => {
  const jeu = neuf();
  jeu.save();
  jeu.chargerEditeurDepuisSave();

  // modifier coins par la saisie du champ
  jeu.champsSave.find(c => c.cle === 'coins').el.value = '99999';
  // ajouter un champ neuf
  jeu.ajouterChamp('marqueTest');
  jeu.champsSave.find(c => c.cle === 'marqueTest').el.value = '"coucou"';
  // en retirer un
  const iPouss = jeu.champsSave.findIndex(c => c.cle === 'poussiere');
  jeu.retirerChamp(iPouss);

  const d = jeu.collecterEditeur();
  eq('la valeur modifiée est un nombre', d.coins, 99999);
  eq('le champ ajouté est lu (chaîne JSON)', d.marqueTest, 'coucou');
  ok('le champ retiré a disparu', !('poussiere' in d));
});

scenario('dev — une valeur de champ se lit en JSON, à défaut en texte', () => {
  const jeu = neuf();
  eq('un nombre', jeu.parseValeurChamp('42'), 42);
  eq('un booléen', jeu.parseValeurChamp('true'), true);
  eq('une chaîne libre reste une chaîne', jeu.parseValeurChamp('bonjour'), 'bonjour');
});

scenario('dev — appliquer l’éditeur écrit dans la sauvegarde et recharge', () => {
  const jeu = neuf();
  const avant = require('../banc.js').rechargements();
  jeu.save();
  jeu.chargerEditeurDepuisSave();
  jeu.champsSave.find(c => c.cle === 'coins').el.value = '4242';
  const r = jeu.devAppliquerEditeur();
  ok('accepté', r.ok);
  ok('la sauvegarde porte la nouvelle valeur', (require('../banc.js').brut() || '').indexOf('4242') >= 0);
  ok('et la page recharge', require('../banc.js').rechargements() > avant);
});
