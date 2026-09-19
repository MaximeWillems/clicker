/* ── LE MARCHAND DE SABLE — sa venue à l'heure réelle, son plafond d'achats, le changeur */

'use strict';
const { scenario, ok, eq, neuf, noeuds, poserJetons } = require('./_aides.js');

// force une venue ouverte à l'instant, avec un étal frais
function ouvrir(jeu) {
  const m = jeu.state.marchand;
  m.prochain = Date.now() + 9e9;     // la prochaine est loin, elle ne doit pas interférer
  m.paru = Date.now();
  m.offres = jeu.tirerEtal();
  m.achats = 0;
  return m;
}

scenario('marchand — un tour programme la venue, jamais tout de suite', () => {
  const jeu = neuf();
  eq('rien de programmé au départ', jeu.state.marchand.prochain, 0);
  jeu.tickMarchand();
  ok('la première venue est programmée', jeu.state.marchand.prochain > Date.now());
  ok('mais l’étal reste fermé', !jeu.marchandIci());
});

scenario('marchand — l’heure venue, l’étal s’ouvre avec trois offres', () => {
  const jeu = neuf();
  jeu.state.marchand.prochain = Date.now() - 1000;   // l’instant est juste passé
  jeu.tickMarchand();
  ok('le marchand est là', jeu.marchandIci());
  eq('il pose trois offres', jeu.state.marchand.offres.length, jeu.MARCHAND.offres);
  ok('et un quart d’heure reste devant', jeu.marchandReste() > 0);
  ok('la prochaine venue est reprogrammée', jeu.state.marchand.prochain > Date.now());
});

scenario('marchand — une venue tombée hors du regard est manquée, pas gardée', () => {
  const jeu = neuf();
  const F = jeu.MARCHAND.fenetre * 1000;
  jeu.state.marchand = { prochain: Date.now() - F - 60000, paru: 0, offres: [], achats: 0 };
  jeu.tickMarchand();
  ok('l’étal ne s’ouvre pas au retour', !jeu.marchandIci());
  ok('et la venue suivante est reprogrammée', jeu.state.marchand.prochain > Date.now());
});

scenario('marchand — l’étal se ferme au bout du quart d’heure', () => {
  const jeu = neuf();
  const F = jeu.MARCHAND.fenetre * 1000;
  jeu.state.marchand = { prochain: Date.now() + 9e9, paru: Date.now() - F - 1000,
                         offres: jeu.tirerEtal(), achats: 0 };
  jeu.tickMarchand();
  ok('le marchand est reparti', !jeu.marchandIci());
  eq('l’étal est vidé', jeu.state.marchand.offres.length, 0);
});

scenario('marchand — on ne prend que deux offres sur trois', () => {
  const jeu = neuf();
  const m = ouvrir(jeu);
  jeu.state.coins = 1e15; jeu.state.poussiere = 1e12;   // de quoi tout payer
  ok('la première offre se prend', jeu.acheterMarchand(0));
  ok('la deuxième aussi', jeu.acheterMarchand(1));
  ok('la troisième est refusée : le plafond est atteint', !jeu.acheterMarchand(2));
  eq('deux achats comptés', m.achats, jeu.MARCHAND.achats);
});

scenario('marchand — une offre déjà prise ne se reprend pas', () => {
  const jeu = neuf();
  ouvrir(jeu);
  jeu.state.coins = 1e15; jeu.state.poussiere = 1e12;
  ok('prise une fois', jeu.acheterMarchand(0));
  ok('pas deux', !jeu.acheterMarchand(0));
});

scenario('marchand — le changeur convertit vraiment, et fait payer', () => {
  const jeu = neuf();
  const m = ouvrir(jeu);
  // une offre « or » (bleue → or) et une offre « bleue » (argent → bleue), posées à la main
  m.offres = [
    { type: 'or',    donne: 3,    monnaie: 'poussiere', prix: 60000 },
    { type: 'bleue', donne: 2000, monnaie: 'coins',     prix: 100000 },
    { type: 'or',    donne: 1,    monnaie: 'poussiere', prix: 20000 },
  ];
  jeu.state.coins = 500000; jeu.state.poussiere = 100000; jeu.state.poussiereOr = 0;

  ok('l’or s’achète en bleue', jeu.acheterMarchand(0));
  eq('la bleue est débitée', jeu.state.poussiere, 100000 - 60000);
  eq('l’or est crédité', jeu.state.poussiereOr, 3);

  ok('la bleue s’achète en pièces', jeu.acheterMarchand(1));
  eq('les pièces sont débitées', jeu.state.coins, 500000 - 100000);
  eq('la bleue est créditée', jeu.state.poussiere, 40000 + 2000);
});

scenario('marchand — sans de quoi payer, l’offre est refusée', () => {
  const jeu = neuf();
  const m = ouvrir(jeu);
  m.offres = [{ type: 'or', donne: 5, monnaie: 'poussiere', prix: 90000 }];
  jeu.state.poussiere = 100;                 // trop peu
  ok('l’achat est refusé', !jeu.acheterMarchand(0));
  eq('rien n’a bougé', jeu.state.poussiereOr, 0);
});

scenario('marchand — l’état de l’étal traverse l’ascension', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  const quand = Date.now() + 123456;
  s.marchand.prochain = quand;
  poserJetons(jeu, 1);
  jeu.ascensionner();
  eq('la prochaine venue est gardée', jeu.state.marchand.prochain, quand);
});
