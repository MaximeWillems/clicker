/* ── L’ASCENSION — le saut, l’investissement dans la constellation, ce qui demeure */

'use strict';
const { scenario, ok, eq, neuf, noeuds, poserJetons, emporter, bete, seule } = require('./_aides.js');

scenario('ascension — plus de sélection : l’enclos se défait, l’album ne bouge pas', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 6;
  const carte = emporter(jeu, [bete(jeu, 'crapaud', 3, 3000)])[0];   // une carte dans l'album
  bete(jeu, 'crabe', 2, 400);
  bete(jeu, 'crapaud', 2, 400);
  poserJetons(jeu, 1);
  ok('le bouton d’ascension s’ouvre', jeu.peutAscensionner());

  jeu.state.vu.oeuf = true;                 // une scène jouée, pour vérifier qu'elle traverse
  const albumAvant = jeu.state.album.length;
  jeu.ascensionner();

  eq('l’album ne gagne aucune carte au saut', jeu.state.album.length, albumAvant);
  ok('et il garde ce qu’il avait', jeu.state.album.some(k => k.id === carte.id));
  eq('l’enclos repart vide', jeu.state.pen.length, 0);
  eq('les pièces repartent de zéro', jeu.state.coins, 0);
  ok('les bêtes défaites laissent de la poussière', jeu.state.poussiere > 0);
  eq('les consignes de ferme sont remises à plat', jeu.state.sellAt.commune, 0);
  ok('la collection traverse', Object.keys(jeu.state.seen).length > 0);
  ok('les scènes déjà jouées traversent', Object.keys(jeu.state.vu).length > 0);
});

scenario('ascension — on ouvre la constellation, on n’investit qu’au saut', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 8;
  poserJetons(jeu, 500);

  /* HORS DU SAUT, ON CONSULTE MAIS ON N'ACHÈTE PAS. La carte de détail montre le nœud, son
     bouton dit où le geste se fait — il ne le fait pas. */
  jeu.voirEtoile('nid');
  eq('le bouton renvoie au saut', noeuds.get('ciel-carte-prendre').textContent, 'À l’ascension');
  ok('et il est éteint', noeuds.get('ciel-carte-prendre').disabled);
  ok('le tenter ne fait rien', !jeu.prendreEtoileVue());
  ok('rien n’est pris', !jeu.etoilePrise('nid'));

  /* LE SAUT OUVERT, LA CONSTELLATION S'ACHÈTE. Le bouton d'ascension y mène. */
  jeu.ouvrirAscension();
  ok('on est en mode saut', jeu.enAscension);
  eq('la vue est la constellation', jeu.vue, 'ciel');
  jeu.voirEtoile('nid');
  ok('le bouton propose de prendre', noeuds.get('ciel-carte-prendre').textContent.indexOf('Prendre') >= 0);
  const avant = jeu.jetonsEnMain();
  ok('et il achète', jeu.prendreEtoileVue());
  ok('le nid est pris', jeu.etoilePrise('nid'));
  eq('les jetons sont partis', jeu.jetonsEnMain(), avant - 3);
});

scenario('ascension — quitter sans valider ne dépense rien', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 8;
  poserJetons(jeu, 500);
  const reserve = s.asc.jetons;

  jeu.ouvrirAscension();
  jeu.voirEtoile('nid'); jeu.prendreEtoileVue();
  ok('le nœud est pris pendant le saut', jeu.etoilePrise('nid'));
  ok('et la bourse a fondu', jeu.jetonsEnMain() < reserve);

  /* SORTIE « PAR LA BANDE » : changer d'onglet sans valider. Tout est rendu, rien n'a été
     dépensé, et la ferme n'a pas sauté. */
  jeu.ouvrirVue('ferme');
  ok('le mode s’éteint', !jeu.enAscension);
  ok('le nœud est rendu', !jeu.etoilePrise('nid'));
  eq('la réserve est intacte', jeu.state.asc.jetons, reserve);
  eq('et rien n’a été sauvegardé', jeu.state.asc.n, 0);
});

scenario('ascension — le saut solde ce qu’on a investi, et le reste demeure', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  s.coins = 1e12; jeu.crediterJetons();
  const avant = jeu.jetonsEnMain();
  ok('la bourse est garnie', avant >= 4, avant);

  s.pen = [bete(jeu, 'crapaud', 3, 3000)];
  jeu.ouvrirAscension();
  jeu.voirEtoile('nid'); jeu.prendreEtoileVue();   // trois jetons
  jeu.ascensionner();

  const n = jeu.state;
  eq('le saut a eu lieu', n.asc.n, 1);
  ok('le nœud investi traverse', jeu.etoilePrise('nid'));
  /* CE QUI RESTE EN MAIN DEVIENT LA RÉSERVE : la bourse d'avant, moins les trois jetons du nid.
     Le sommet et la dépense repartent à zéro. */
  eq('la réserve est le net après investissement', n.asc.jetons, avant - 3);
  eq('le sommet est reparti à zéro', n.asc.sommet, 0);
  eq('la dépense aussi', n.asc.depense, 0);
  ok('la porte reste ouverte', jeu.peutAscensionner());
});

scenario('ascension — la porte, le nombre et la phrase disent réserve et gain', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  const bouton = () => noeuds.get('btn-asc');

  s.coins = 1e12; jeu.crediterJetons();
  s.pen = [bete(jeu, 'crapaud', 3, 3000)];
  jeu.ascensionner();
  /* `ascensionner` RÉASSIGNE `state` : tout ce qui suit relit `jeu.state`, sinon on interroge
     l'ancienne partie et rien ne bouge. */
  const n = jeu.state;

  /* APRÈS UN SAUT, LE SOMMET REPART À ZÉRO, mais la porte reste ouverte : on peut resauter sans
     avoir à multiplier sa fortune par mille. */
  eq('le sommet est reparti à zéro', n.asc.sommet, 0);
  eq('le cycle neuf ne crédite rien', jeu.jetonsDus(), 0);
  ok('et on peut sauter', jeu.peutAscensionner());

  jeu.refresh();
  eq('le bouton est là', bouton().hidden, false);

  /* LE NOMBRE SÉPARE LA RÉSERVE DU GAIN DU CYCLE : « 1 (+4) ». */
  n.asc.jetons = 1; n.coins = jeu.JETON_PALIERS[3]; jeu.crediterJetons();
  jeu.refresh();
  eq('le gain du cycle est bien de quatre', jeu.jetonsDus(), 4);
  ok('le bouton montre la réserve et le gain à part',
     bouton().textContent.indexOf('1 (+4)') >= 0, bouton().textContent);
});

scenario('ascension — les jetons se regagnent, et le mur tombe', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  for (let i = 0; i < 4; i++) bete(jeu, 'crapaud', 3, 3000);

  s.coins = jeu.JETON_PALIERS[3]; jeu.crediterJetons();
  eq('le quatrième palier vaut quatre jetons', jeu.jetonsDus(), 4);
  ok('l’ascension est ouverte', jeu.peutAscensionner());

  jeu.ascensionner();
  const n = jeu.state;
  eq('le saut a eu lieu', n.asc.n, 1);
  /* RIEN N'A ÉTÉ INVESTI : toute la bourse passe en réserve. */
  eq('la réserve garde les quatre jetons', n.asc.jetons, 4);
  eq('le sommet est reparti à zéro', n.asc.sommet, 0);
  ok('la porte reste ouverte', jeu.peutAscensionner());

  n.coins = jeu.JETON_PALIERS[3]; jeu.crediterJetons();
  eq('refaire ce palier recrédite quatre jetons', jeu.jetonsDus(), 4);
  /* L'ÉCHELLE NE SE REFRANCHIT PAS : `paliers` compte la partie entière et sert au déblocage. */
  eq('sans refranchir l’échelle', n.asc.paliers, 4);

  n.coins = 0;
  eq('dépenser ne retire rien', jeu.jetonsDus(), 4);
});
