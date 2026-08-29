/* ── LE SIMULATEUR DE RYTHME ──────────────────────────────────────────────────
       node tools/rythme.js            les quarante-cinq premières minutes
       node tools/rythme.js 180        les trois premières heures

   Un joueur modèle : quatre clics par seconde, il mène ses bêtes jusqu'à l'âge adulte en
   payant les péages qu'il peut, revend le reste, et prend toujours l'achat le moins cher à sa
   portée — en gardant toujours de quoi racheter un œuf, la discipline qui évite l'impasse.

   C'EST LE SEUL MOYEN DE VOIR UNE COURBE ICI, puisqu'on n'ouvre jamais de navigateur et qu'on
   ne va pas jouer trois heures à la main à chaque retouche d'équilibrage. Il a tranché deux
   fois en 2.29.0 : le début était trois fois trop rapide, et resserrer aussi l'adolescent le
   rendait trois fois trop lent.

   CE QU'IL NE DIT PAS : rien sur le plaisir. Il mesure un débit, pas un rythme ressenti — un
   joueur qui s'ennuie et un joueur qui s'amuse produisent exactement la même courbe. */
'use strict';
const path = require('path');
const { neuf } = require(path.join(__dirname, 'banc.js'));

const CPS = 4;                 // clics par seconde
const PAS = 0.25;              // un clic par pas
const CIBLE = 3;               // on mène les bêtes jusqu'à l'âge adulte, puis on vend

function simuler(minutes) {
  const j = neuf(); const s = j.state;
  s.tuto = false;              // pas de dialogue qui retienne l'écran
  const jalons = {};
  const marque = (nom, t) => { if (jalons[nom] === undefined) jalons[nom] = t; };
  const courbe = [];
  let t = 0, clics = 0;

  for (let pas = 0; pas < minutes * 60 / PAS; pas++) {
    t += PAS;
    j.advance(PAS);
    j.runAutomations(PAS);
    j.hatchAll();

    // le joueur clique
    j.tapStage(); clics++;

    /* Il paie le péage tant qu'il peut se le permettre — c'est ce que fait un joueur, et sans
       ça la simulation ne mesure qu'une boucle de communes vendues à l'âge enfant. Il garde
       toujours de quoi racheter un œuf. */
    const garde = j.prixOeuf(j.EGG_BY_KEY.commun);
    for (const c of s.pen.slice()) {
      if (!j.estMur(c)) continue;
      const cout = j.evoCost(c);
      if (c.age < CIBLE && cout !== null && s.coins - cout >= garde) {
        j.evolve(c); marque('1re évolution', t);
      } else { j.sell(c); marque('1re vente', t); }
    }

    // il replace un œuf s'il en a un, sinon il en achète un
    for (let i = 0; i < s.incub.length; i++) {
      if (s.incub[i]) continue;
      if (j.totalEggs()) j.placeEgg(i);
      else if (s.coins >= j.prixOeuf(j.EGG_BY_KEY.commun)) j.buyEgg('commun');
    }

    /* Puis il achète le moins cher de ce qui l'aide, en gardant toujours de quoi racheter un
       œuf : c'est exactement la discipline qui évite l'impasse. */
    const reserve = j.prixOeuf(j.EGG_BY_KEY.commun);
    let encore = true;
    while (encore) {
      encore = false;
      const options = [];
      for (const u of j.UPGRADES) options.push({ nom: u.name, prix: j.upCost(u), prendre: () => j.buyUpgrade(u) });
      options.push({ nom: 'Incubateur', prix: j.incubCost(), prendre: () => j.buyIncubator() });
      options.push({ nom: 'Enclos', prix: j.penCost(), prendre: () => j.buyPen() });
      for (const p of j.PRIMES) if (!j.prime(p.cle)) options.push({ nom: p.nom, prix: p.prix, prendre: () => j.buyPrime(p) });
      options.sort((a, b) => a.prix - b.prix);
      const meilleur = options[0];
      if (meilleur && s.coins - meilleur.prix >= reserve) {
        meilleur.prendre();
        marque(meilleur.nom, t);
        encore = true;
      }
    }

    if (Math.abs(t % 60) < PAS / 2) courbe.push([t / 60, s.coins, clics]);
  }
  return { jalons, courbe, clics, coins: s.coins, seen: j.seenCount(), etat: s };
}

const mm = t => Math.floor(t / 60) + ' m ' + String(Math.round(t % 60)).padStart(2, '0') + ' s';
const r = simuler(Number(process.argv[2] || 30));

console.log();
console.log('  ── premiers achats ──');
const ordre = Object.entries(r.jalons).sort((a, b) => a[1] - b[1]);
for (const [nom, t] of ordre.slice(0, 14)) console.log('   ' + mm(t).padStart(9) + '   ' + nom);
console.log();
console.log('  ── la bourse ──');
console.log('   minute   pièces        clics');
for (const [m, c, k] of r.courbe.filter((x, i) => [0, 1, 2, 4, 9, 14, 19, 29].includes(i)))
  console.log('   ' + String(Math.round(m)).padStart(6) + '   ' + String(Math.round(c)).padStart(10) + '   ' + String(k).padStart(6));
console.log();
console.log('   au bout : ' + Math.round(r.coins) + ' pièces · ' + r.clics + ' clics · ' +
  r.etat.pen.length + ' bêtes · ' + r.etat.pens + ' enclos · ' + r.etat.incubators + ' incubateurs');
