/* ── LES TROIS GLOBALES — prix, vitesse, geste */

'use strict';
const { scenario, ok, eq, neuf, bete, seule } = require('./_aides.js');

scenario('globales — trois axes qui ne se recouvrent pas', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15; s.pens = 8;
  const c = bete(jeu, 'loup', 4, 20000);

  /* TROIS FAMILLES DE QUATRE PRIMES, et la table décide de tout : une prime qui porte un
     `bonus` entre dans le calcul sans qu'on touche à une ligne de moteur. */
  /* LES TROIS FAMILLES GLOBALES, et elles seules. Depuis la 4.2.0 des primes portent aussi
     `peage`, `oeuf` et `clic` — les leviers que rien ne touchait après le milieu de partie —
     et ce ne sont pas des familles : elles n'ont ni quatre crans ni cinquante pour cent. */
  const familles = { valeur: [], rente: [], vitesse: [] };
  for (const p of jeu.PRIMES)
    for (const k of Object.keys(p.bonus || {})) if (familles[k]) familles[k].push(p);
  for (const k of Object.keys(familles)) {
    eq(k + ' — quatre primes', familles[k].length, 4);
    eq(k + ' — cinquante pour cent en tout',
       Math.round(familles[k].reduce((n, p) => n + p.bonus[k], 0) * 100), 50);
    ok(k + ' — réparties sur toute la fin de partie',
       Math.max(...familles[k].map(p => p.prix)) / Math.min(...familles[k].map(p => p.prix)) > 1000);
    for (const p of familles[k]) eq(p.nom + ' ne porte qu’un axe', Object.keys(p.bonus).length, 1);
  }
  for (const k of Object.keys(familles)) eq(k + ' — coefficient neutre au départ', jeu.coef(k), 1);

  /* LA RÈGLE DES CINQUANTE POUR CENT TIENT ENCORE, et c'est ce qui a interdit d'étirer les
     familles pour régler la variété de fin de partie : quatre crans par famille est un chiffre
     annoncé ailleurs dans le fichier. La 4.2.0 a donc ajouté des AXES, pas des crans. */
  const autres = new Set();
  for (const p of jeu.PRIMES)
    for (const k of Object.keys(p.bonus || {})) if (!familles[k]) autres.add(k);
  ok('des primes touchent d’autres leviers que les trois globales',
     autres.size >= 3, [...autres].join(' '));
  ok('et ce sont ceux de l’album', [...autres].every(k => k in jeu.bonusAlbum()),
     [...autres].join(' '));

  const v0 = jeu.sellValue(c), r0 = jeu.renteOf(c);
  ok('la bête vaut et rapporte', v0 > 0 && r0 > 0);

  /* LA VALEUR PORTE LA VENTE ET LA RENTE QUI EN DÉCOULE. */
  s.primes['valeur-2'] = true; jeu.oublierPrimes();
  ok('la vente monte de dix pour cent',
     Math.abs(jeu.sellValue(c) / v0 - 1.1) < 0.001, jeu.sellValue(c) / v0);
  ok('et la rente suit toute seule',
     Math.abs(jeu.renteOf(c) / r0 - 1.1) < 0.001, jeu.renteOf(c) / r0);
  s.primes = {}; jeu.oublierPrimes();

  /* LA RENTE NE PORTE QU'ELLE-MÊME : c'est le seul axe qui paie uniquement pour ne rien faire,
     et il ne doit rien changer au prix de vente. */
  s.primes['rente-2'] = true; jeu.oublierPrimes();
  eq('la vente ne bouge pas', jeu.sellValue(c), v0);
  ok('la rente monte seule',
     Math.abs(jeu.renteOf(c) / r0 - 1.1) < 0.001, jeu.renteOf(c) / r0);
  s.primes = {}; jeu.oublierPrimes();

  /* LA VITESSE PORTE LE TEMPS : couvaison, croissance, engraissement. */
  s.up.couveuse = 3 * jeu.GRAIN; s.up.eleveur = 3 * jeu.GRAIN; s.up.mangeoire = 3 * jeu.GRAIN;
  const jeune = bete(jeu, 'loup', 1, 0);
  /* TROIS SECONDES ET NON DIX : depuis que l'éleveur triple (`ELEVEUR_X`), dix secondes
     poussent la bête au-delà du bout de sa première tranche, `c.p` bute sur `bandTo` et le
     rapport mesuré n'est plus celui des primes mais celui du plafond. On mesure une pente,
     donc on reste dans la pente. */
  const pousse = () => {
    s.incub[0] = { line: 'ouroboros', p: 0, kind: 'mythique' };
    jeune.p = 0; jeune.age = 1; jeune.over = 0;
    jeu.advance(3);
    return { oeuf: s.incub[0].p, bete: jeune.p };
  };
  const sans = pousse();
  s.primes['vitesse-1'] = true; s.primes['vitesse-2'] = true;
  s.primes['vitesse-3'] = true; s.primes['vitesse-4'] = true;
  jeu.oublierPrimes();
  const avec = pousse();
  ok('la couvaison accélère de moitié',
     Math.abs(avec.oeuf / sans.oeuf - 1.5) < 0.001, avec.oeuf / sans.oeuf);
  ok('la croissance aussi',
     Math.abs(avec.bete / sans.bete - 1.5) < 0.001, avec.bete / sans.bete);
  eq('mais pas la valeur', jeu.sellValue(c), v0);

  /* LES QUATRE D'UNE FAMILLE S'ADDITIONNENT, elles ne se remplacent pas. */
  eq('les quatre vitesses font cinquante pour cent', Math.round((jeu.coef('vitesse') - 1) * 100), 50);
  s.primes = {}; jeu.oublierPrimes();
  eq('et tout retombe à neutre', jeu.coef('vitesse'), 1);

  // elles ne sont plus des améliorations à niveaux : c'était le mauvais objet
  for (const k of ['renom', 'patience', 'ardeur'])
    eq(k + ' n’est plus une amélioration', jeu.UP_BY_KEY[k], undefined);
  eq('il reste les quatre capacités', jeu.UPGRADES.length, 4);
});

scenario('globales — une partie de v16 garde ce qu’elle avait monté', () => {
  const j0 = neuf(); const s0 = j0.state;
  s0.coins = 5e9; s0.pens = 4;
  const vieux = JSON.parse(JSON.stringify(s0));
  vieux.v = 16;
  // ce que valaient les trois améliorations à niveaux : 30 %, 15 %, 2 %
  vieux.up.renom = 30 * j0.GRAIN;
  vieux.up.patience = 15 * j0.GRAIN;
  vieux.up.ardeur = 2 * j0.GRAIN;

  const k = neuf(vieux);
  eq('le format monte', k.state.v, k.SAVE_V);
  /* CONVERSION GÉNÉREUSE PAR PRINCIPE : mal convertir vers le bas, c'est reprendre des heures
     de jeu à quelqu'un qui n'a rien demandé. Les seuils sont les pour-cent cumulés. */
  eq('trente pour cent de valeur rendus', Math.round((k.coef('valeur') - 1) * 100), 30);
  eq('quinze de rente', Math.round((k.coef('rente') - 1) * 100), 15);
  eq('et deux pour cent ne valaient pas une prime', k.coef('vitesse'), 1);
  ok('la quatrième reste à acheter', !k.prime('valeur-4'));

  for (const cle of ['renom', 'patience', 'ardeur'])
    eq(cle + ' a disparu de l’état', k.state.up[cle], undefined);
  eq('et la ferme est intacte', k.state.coins, 5e9);
});
