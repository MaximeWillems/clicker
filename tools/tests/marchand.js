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
  jeu.state.coins = 1e15; jeu.state.poussiere = 1e12; jeu.state.poussiereOr = 1e9;   // de quoi tout payer
  ok('la première offre se prend', jeu.acheterMarchand(0));
  ok('la deuxième aussi', jeu.acheterMarchand(1));
  ok('la troisième est refusée : le plafond est atteint', !jeu.acheterMarchand(2));
  eq('deux achats comptés', m.achats, jeu.MARCHAND.achats);
});

scenario('marchand — une offre déjà prise ne se reprend pas', () => {
  const jeu = neuf();
  ouvrir(jeu);
  jeu.state.coins = 1e15; jeu.state.poussiere = 1e12; jeu.state.poussiereOr = 1e9;
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

scenario('marchand — acheter une carte la pose dans l’album', () => {
  const jeu = neuf();
  const m = ouvrir(jeu);
  jeu.state.poussiere = 1e6;
  m.offres = [{ type: 'carte', qualite: 'bleu', monnaie: 'poussiere', prix: 400 }];
  const n = jeu.state.album.length;
  ok('la carte s’achète', jeu.acheterMarchand(0));
  eq('l’album gagne une carte', jeu.state.album.length, n + 1);
  const k = jeu.state.album[jeu.state.album.length - 1];
  eq('elle est neuve : une étoile', k.etoiles, 1);
  ok('et elle a une lignée', !!k.line);
});

scenario('marchand — un paquet pose cinq cartes', () => {
  const jeu = neuf();
  const m = ouvrir(jeu);
  jeu.state.poussiere = 1e6;
  m.offres = [{ type: 'paquet', qualite: 'bleu', monnaie: 'poussiere', prix: 1600 }];
  const n = jeu.state.album.length;
  jeu.acheterMarchand(0);
  eq('cinq cartes de plus', jeu.state.album.length, n + jeu.PAQUET_N);
});

scenario('marchand — un paquet bleu garantit au moins une rare', () => {
  const jeu = neuf();
  const rang = r => jeu.RARITY[r].rank;
  const vrai = Math.random;
  try {
    Math.random = () => 0.999;                 // tout pousse vers la commune
    const { cartes } = jeu.tirerUnPaquet('bleu');
    ok('pas que du commun', cartes.some(k => rang(jeu.LINE_BY_KEY[k.line].rarity) >= 1),
       cartes.map(k => jeu.LINE_BY_KEY[k.line].rarity).join(','));
  } finally { Math.random = vrai; }
});

scenario('marchand — un god pack ne sort que de l’épique ou mieux', () => {
  const jeu = neuf();
  const rang = r => jeu.RARITY[r].rank, sol = jeu.RARITY[jeu.GODPACK_SOL].rank;
  const vrai = Math.random;
  try {
    Math.random = () => 0.0001;                // sous GODPACK_ODDS
    const paq = jeu.tirerUnPaquet('or');
    ok('c’est bien un god pack', paq.god);
    ok('toutes épique+', paq.cartes.every(k => rang(jeu.LINE_BY_KEY[k.line].rarity) >= sol));
  } finally { Math.random = vrai; }
});

scenario('marchand — acheter une recette l’apprend, et pas deux fois', () => {
  const jeu = neuf();
  const m = ouvrir(jeu);
  jeu.state.poussiereOr = 1e6;
  const r = jeu.recetteInconnue();
  m.offres = [{ type: 'recette', cle: jeu.cleRecette(r), rarete: jeu.LINE_BY_KEY[r.donne].rarity,
                monnaie: 'poussiereOr', prix: 90 }];
  const avant = jeu.recettesConnues();
  ok('la recette s’achète', jeu.acheterMarchand(0));
  eq('le carnet gagne une entrée', jeu.recettesConnues(), avant + 1);
  ok('c’est la bonne', jeu.recetteConnue(r));
});

scenario('marchand — une recette déjà connue n’est plus vendable', () => {
  const jeu = neuf();
  const m = ouvrir(jeu);
  jeu.state.poussiereOr = 1e6;
  const r = jeu.recetteInconnue();
  jeu.apprendreRecette(r);                      // apprise autrement entre-temps
  m.offres = [{ type: 'recette', cle: jeu.cleRecette(r), rarete: jeu.LINE_BY_KEY[r.donne].rarity,
                monnaie: 'poussiereOr', prix: 90 }];
  ok('l’achat est refusé', !jeu.acheterMarchand(0));
});

scenario('marchand — un étal ne pose jamais deux fois la même recette', () => {
  const jeu = neuf();
  const vues = {};
  for (let t = 0; t < 40; t++) {
    for (const o of jeu.tirerEtal()) if (o.type === 'recette') vues[o.cle] = (vues[o.cle] || 0);
    const etal = jeu.tirerEtal();
    const cles = etal.filter(o => o.type === 'recette').map(o => o.cle);
    ok('pas de doublon sur cet étal', new Set(cles).size === cles.length, cles.join(','));
  }
});

scenario('marchand — le prix de argent→bleue suit la bourse du joueur', () => {
  const jeu = neuf();
  const part = jeu.CHANGE_BLEUE.part, v = jeu.CHANGE_BLEUE.variance;

  jeu.state.coins = 1e9;
  let o; for (let i = 0; i < 500 && !(o && o.type === 'bleue'); i++) o = jeu.offreDuChange();
  ok('on obtient une offre bleue', !!(o && o.type === 'bleue'));
  ok('le prix est une part de la bourse',
     o.prix >= 1e9 * part * (1 - v) - 1 && o.prix <= 1e9 * part * (1 + v) + 1, o.prix);

  jeu.state.coins = 0;                       // bourse vide : le plancher protège du cadeau
  let p; for (let i = 0; i < 500 && !(p && p.type === 'bleue'); i++) p = jeu.offreDuChange();
  eq('bourse vide → le plancher', p.prix, jeu.CHANGE_BLEUE.prixPlancher);
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
