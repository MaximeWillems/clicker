/* ── LES PRIMES, LES CARREFOURS ET LES FAVEURS — les achats uniques */

'use strict';
const { scenario, ok, eq, neuf, noeuds, lire, poserJetons, emporter, bete, seule } = require('./_aides.js');

scenario('primes — la grille ne montre que les cinq prochaines', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const cases = () => noeuds.get('primes').children.filter(b => !b.hidden);
  const nom = b => b.children.map(x => x.textContent).join(' ');

  s.coins = 1e15;
  jeu.refresh();
  eq('cinq cases, pas trente-six', cases().length, jeu.PRIMES_VUES);
  const attendues = jeu.PRIMES.slice(0, jeu.PRIMES_VUES).map(p => p.nom);
  ok('et ce sont les cinq moins chères',
     attendues.every(n => cases().some(b => nom(b).includes(n))),
     cases().map(nom).join(' | '));

  /* ACHETER LA PREMIÈRE FAIT MONTER LA SIXIÈME : la grille suit toujours la prochaine
     décision, elle ne garde pas ce qui est derrière. */
  jeu.buyPrime(jeu.PRIMES[0]);
  jeu.refresh();
  eq('toujours cinq', cases().length, jeu.PRIMES_VUES);
  ok('la prise a disparu', !cases().some(b => nom(b).includes(jeu.PRIMES[0].nom)),
     cases().map(nom).join(' | '));
  ok('et la suivante est entrée',
     cases().some(b => nom(b).includes(jeu.PRIMES[jeu.PRIMES_VUES].nom)));

  /* LE BOUTON BASCULE SUR CE QU'ON A DÉJÀ PRIS — une consultation, pas un choix. */
  const bouton = noeuds.get('primes-voir');
  eq('le bouton apparaît dès la première prise', bouton.hidden, false);
  ok('et il compte', /1/.test(bouton.textContent), bouton.textContent);
  jeu.primesPrises = true;
  jeu.refresh();
  eq('la grille bascule', cases().length, 1);
  ok('sur la prime prise', nom(cases()[0]).includes(jeu.PRIMES[0].nom));
  eq('le bouton se marque', bouton.getAttribute('aria-pressed'), 'true');
  jeu.primesPrises = false;
  jeu.refresh();
  eq('et il revient', cases().length, jeu.PRIMES_VUES);

  // une prime conditionnée n'entre pas dans le compte des cinq
  const conditionnees = jeu.PRIMES.filter(p => p.si);
  ok('il en existe', conditionnees.length > 0);
  ok('aucune n’est montrée sans sa condition',
     !cases().some(b => conditionnees.some(p => nom(b).includes(p.nom))),
     cases().map(nom).join(' | '));

  /* TOUT PRIS : la grille bascule d'elle-même, sinon elle serait vide.
     Un CARREFOUR ne se prend pas par sa propre clé — c'est une de ses routes qu'on retient, et
     elle est rangée sous la sienne. C'est ce qui permet au reste du jeu de lire `prime('...')`
     sans rien savoir des carrefours. */
  for (const p of jeu.PRIMES) s.primes[p.choix ? p.choix[0].cle : p.cle] = true;
  jeu.oublierPrimes();
  jeu.refresh();
  eq('elle montre tout ce qu’on a', cases().length, jeu.PRIMES.length);
  eq('et le compteur est plein', noeuds.get('primes-meta').textContent,
     jeu.PRIMES.length + ' / ' + jeu.PRIMES.length);
});

scenario('primes — un négoce n’arrive jamais avant sa rareté', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;

  /* UNE MARCHE VIDE. La grille ne montre que CINQ primes à la fois : une prime qui n'agit sur
     rien occupe une case, retarde les quatre suivantes, et se paie pour ne rien sentir. Le
     négoce rare coûtait 80 000 quand un œuf rare en coûte 300 000 — le quart de ce qu'il
     améliore, donc offert longtemps avant qu'on puisse en posséder un. */
  const negoce = r => jeu.PRIMES.find(p => p.cle === 'negoce-' + r);
  for (const r of ['rare', 'epique', 'mythique']) {
    ok('le négoce ' + r + ' est gardé', !!negoce(r).si);
    ok('et il se tait tant que la rareté est inconnue', !negoce(r).si());
  }
  ok('celui des communes ne l’est pas', !negoce('commune').si);

  /* LA GARDE SE RÈGLE SUR CE QU'ON A VU, pas sur un prix — elle s'ajuste toute seule à une
     rare tombée par chance. Et `rareteVue` n'est pas `rareteConnue` : la seconde ne parle que
     du rang secret, toutes les autres raretés étant nommées d'avance par la boutique. */
  ok('vue et connue ne sont pas la même question',
     jeu.rareteConnue('rare') && !jeu.rareteVue('rare'));
  s.seen['loup:1'] = 1;
  ok('une rare vue ouvre le négoce rare', negoce('rare').si());
  ok('sans ouvrir celui des épiques', !negoce('epique').si());

  /* CHACUN VAUT DEUX ŒUFS DE SA RARETÉ : on en a un, on en veut d'autres. Gardé à 80 000, il
     serait apparu comme un cadeau et non comme une décision. */
  const oeuf = { rare: 'rare', epique: 'epique', mythique: 'mythique' };
  for (const r of Object.keys(oeuf)) {
    const p = negoce(r).prix, e = jeu.EGG_BY_KEY[oeuf[r]].price;
    ok(r + ' coûte environ deux œufs', p / e > 1.8 && p / e < 2.4, (p / e).toFixed(2));
  }

  // et la table reste rangée par prix, puisque la grille la lit dans l'ordre
  let prec = 0, mal = 0;
  for (const p of jeu.PRIMES) { if (p.prix < prec) mal++; prec = Math.max(prec, p.prix); }
  eq('la table reste triée', mal, 0);
});

scenario('carrefour — trois routes, on en prend une, les deux autres se ferment', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const p = jeu.PRIMES.find(x => x.cle === 'carrefour-1');
  ok('le premier carrefour existe', !!p);
  eq('il offre trois routes', p.choix.length, 3);

  s.coins = p.prix - 1;
  ok('sans de quoi payer, rien ne se prend', !jeu.choisirRoute('carrefour-1', 'route-bourse'));

  s.coins = p.prix;
  ok('avec de quoi, la route se prend', jeu.choisirRoute('carrefour-1', 'route-bourse'));
  eq('et elle est payée', s.coins, 0);

  /* LES DEUX AUTRES SONT PERDUES, pas remises à plus tard : remises à plus tard, ce ne serait
     pas un choix mais un ordre d'achat — on finirait par tout avoir et la décision ne coûterait
     rien. */
  s.coins = 1e12;
  ok('on ne prend pas la deuxième', !jeu.choisirRoute('carrefour-1', 'route-ardeur'));
  ok('ni la troisième', !jeu.choisirRoute('carrefour-1', 'route-poigne'));
  eq('la bourse n’a pas rebougé', s.coins, 1e12);

  /* L'OPTION EST RANGÉE SOUS SA PROPRE CLÉ : tout le jeu continue de lire `prime('...')` sans
     rien savoir des carrefours, et une route peut servir de garde comme n'importe quelle
     prime. */
  ok('la route retenue est une prime comme une autre', jeu.prime('route-bourse'));
  ok('le carrefour, lui, n’est pas une prime', !jeu.prime('carrefour-1'));
  ok('mais il est fait', jeu.primeFaite(p));
});

scenario('carrefour — les trois routes diffèrent en nature, pas en chiffre', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;

  /* LA CONTRAINTE QUI DÉCIDE SI C'EST RÉUSSI. « +10 % de vente / +10 % de rente / +10 % de
     vitesse » n'est pas un choix, c'est un menu : on prend le plus gros nombre et on n'y pense
     plus. Chaque carrefour offre donc un PRIX qui baisse, une VITESSE qui monte, et un GESTE
     qui pèse — trois grandeurs qui ne se comparent pas. */
  for (const cle of ['carrefour-1', 'carrefour-2']) {
    const p = jeu.PRIMES.find(x => x.cle === cle);
    const axes = new Set(p.choix.map(o => Object.keys(o.bonus).join('+')));
    eq(cle + ' : trois axes distincts', axes.size, 3);
  }

  // et chaque route agit vraiment, chacune sur son levier
  const oeuf = jeu.prixOeuf(jeu.EGG_BY_KEY.commun);
  const clic = jeu.clickPower();
  const vite = jeu.coef('vitesse');

  jeu.choisirRoute('carrefour-1', 'route-bourse');
  ok('la bourse baisse le prix des œufs', jeu.prixOeuf(jeu.EGG_BY_KEY.commun) < oeuf,
     oeuf + ' → ' + jeu.prixOeuf(jeu.EGG_BY_KEY.commun));
  eq('sans toucher au clic', jeu.clickPower(), clic);
  eq('ni à la vitesse', jeu.coef('vitesse'), vite);

  // une autre partie, une autre route
  const j2 = neuf(); j2.state.tuto = false; j2.state.coins = 1e12;
  j2.choisirRoute('carrefour-1', 'route-poigne');
  ok('la poigne double le clic', j2.clickPower() > clic, clic + ' → ' + j2.clickPower());

  const j3 = neuf(); j3.state.tuto = false; j3.state.coins = 1e12;
  j3.choisirRoute('carrefour-1', 'route-ardeur');
  ok('l’ardeur monte la vitesse', j3.coef('vitesse') > vite);

  /* ET LE PÉAGE DU SECOND CARREFOUR : c'est un PRIX, donc il baisse. */
  const j4 = neuf(); j4.state.tuto = false; j4.state.coins = 1e12;
  const c = bete(j4, 'crapaud', 2, 3000);
  const avant = j4.evoCost(c);
  j4.choisirRoute('carrefour-2', 'route-peage');
  ok('le péage allégé coûte moins', j4.evoCost(c) < avant, avant + ' → ' + j4.evoCost(c));
});

scenario('carrefour — il ouvre un écran, et se referme sans rien prendre', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  jeu.refresh();

  eq('l’écran est fermé au départ', noeuds.get('carrefour').hidden, true);
  ok('la case l’ouvre', jeu.ouvrirCarrefour('carrefour-1'));
  eq('il s’affiche', noeuds.get('carrefour').hidden, false);
  eq('avec ses trois routes', noeuds.get('carrefour-routes').children.length, 3);

  /* IL SE FERME SANS CHOISIR. Rien ne presse — la case reste, l'argent aussi. Un choix
     définitif ne doit pas se prendre d'un clic distrait au milieu de quarante-sept primes. */
  jeu.fermerCarrefour();
  eq('refermé', noeuds.get('carrefour').hidden, true);
  ok('et rien n’a été pris', !jeu.primeFaite(jeu.PRIMES.find(x => x.cle === 'carrefour-1')));
  eq('la bourse est intacte', s.coins, 1e12);

  // une fois choisi, il ne se rouvre plus
  jeu.choisirRoute('carrefour-1', 'route-ardeur');
  ok('le carrefour est clos', !jeu.ouvrirCarrefour('carrefour-1'));
});

scenario('faveur — trois cartes, une prise, et le tirage ne bouge qu’en prenant', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;

  /* ELLES S'OUVRENT AU PREMIER CARREFOUR. Un tirage aléatoire posé sous le nez d'un joueur qui
     n'a jamais choisi entre deux primes ne s'explique pas tout seul. */
  ok('rien avant le premier carrefour', !jeu.faveursOuvertes());
  ok('et rien ne se prend', !jeu.prendreFaveur('renommee'));

  s.coins = 1e6;
  jeu.choisirRoute('carrefour-1', 'route-bourse');
  ok('le carrefour passé, elles s’ouvrent', jeu.faveursOuvertes());

  const main = jeu.mainFaveurs();
  eq('trois cartes', main.length, 3);
  eq('trois cartes différentes', new Set(main).size, 3);
  /* TROIS LEVIERS DIFFÉRENTS : « +10 % de vente / +10 % de rente / +10 % de vitesse » est un
     menu, pas un choix. Ici les trois grandeurs ne se comparent pas. */
  eq('trois leviers différents',
     new Set(main.map(c => jeu.FAVEUR_BY_KEY[c].levier)).size, 3);

  /* LE TIRAGE EST RANGÉ DANS L'ÉTAT. Un tirage qui se refait à chaque lecture, c'est une
     machine à sous qu'on regarde tourner en attendant le bon lot. */
  eq('il ne bouge pas d’une lecture à l’autre', jeu.mainFaveurs().join(), main.join());
  eq('ni de dix', [0,1,2,3,4,5,6,7,8,9].map(() => jeu.mainFaveurs().join()).join('|').split('|')
     .filter(x => x !== main.join()).length, 0);

  // il faut de quoi payer
  s.coins = jeu.prixFaveur() - 1;
  ok('sans de quoi, rien ne se prend', !jeu.prendreFaveur(main[0]));
  // et il faut que la carte soit sur la table
  const dehors = jeu.FAVEURS.map(f => f.cle).filter(c => main.indexOf(c) < 0)[0];
  s.coins = 1e12;
  ok('une carte hors tirage ne se prend pas', !jeu.prendreFaveur(dehors));

  const avant = s.coins, prix = jeu.prixFaveur();
  ok('la carte du tirage se prend', jeu.prendreFaveur(main[0]));
  eq('elle est payée', s.coins, avant - prix);
  eq('elle est comptée', jeu.faveurCombien(main[0]), 1);
  ok('le prix monte', jeu.prixFaveur() > prix);
  ok('et un tirage neuf prend la place', jeu.mainFaveurs().join() !== main.join() ||
     jeu.faveursPris() === 1);
  eq('trois cartes à nouveau', jeu.mainFaveurs().length, 3);

  /* ELLES SE REPRENNENT SANS LIMITE : c'est ce qui les distingue d'une prime. */
  const encore = jeu.mainFaveurs()[0];
  const n0 = jeu.faveurCombien(encore);
  jeu.prendreFaveur(encore);
  eq('la même carte se reprend', jeu.faveurCombien(encore), n0 + 1);
});

scenario('faveur — ce qui multiplie s’additionne, ce qui remise s’use', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e6;
  jeu.choisirRoute('carrefour-1', 'route-bourse');

  const poser = (cle, n) => {
    jeu.state.faveurs.acquis[cle] = n;
    jeu.state.faveurs.pris = n;
    jeu.oublierPrimes();
  };

  /* CE QUI MULTIPLIE S'ADDITIONNE. Dix « +5 % de vente » font +50 %, sans plafond : une valeur
     qui double n'a rien de dangereux dans une économie qui se compte en milliards. */
  const v0 = jeu.coef('valeur');
  poser('renommee', 10);
  eq('dix renommées font un demi de plus', Math.round((jeu.coef('valeur') - v0) * 1000), 500);

  /* CE QUI REMISE S'USE. Vingt « −5 % sur les œufs » additionnés feraient −100 %, et l'œuf
     serait GRATUIT POUR TOUJOURS — une queue infinie atteint toujours un plafond additif. */
  poser('adresse', 20);
  const r = jeu.bonusPrimes().oeuf;
  ok('vingt remises n’atteignent pas le mur', r < 1, r);
  ok('mais s’en approchent', r > 0.6, r);
  poser('adresse', 200);
  ok('deux cents non plus', jeu.bonusPrimes().oeuf < 1, jeu.bonusPrimes().oeuf);
  /* ET LA COMPOSITION SE FAIT SUR CE QUE LES PRIMES ONT DÉJÀ MIS : les primes portent elles
     aussi des remises d'œuf, additives. Composer la faveur dans son coin avant de l'ajouter
     aurait laissé la somme repasser au-dessus de un — c'est exactement ce qui est arrivé. */
  s.primes['oeuf-1'] = true;
  jeu.oublierPrimes();
  ok('même avec les remises des primes par-dessous', jeu.bonusPrimes().oeuf < 1,
     jeu.bonusPrimes().oeuf);
  ok('et l’œuf coûte toujours quelque chose', jeu.prixOeuf(jeu.EGG_BY_KEY.commun) > 0);
});

scenario('faveur — les quatre leviers neufs bougent vraiment', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e6;
  jeu.choisirRoute('carrefour-1', 'route-bourse');

  /* CES QUATRE-LÀ N'ÉTAIENT LUS QUE DE L'ALBUM ET DU CIEL : les primes ne savaient pas les
     toucher. Une carte qui ne change rien est du remplissage, donc chacune se vérifie. */
  const poser = cle => { jeu.state.faveurs.acquis[cle] = 5; jeu.oublierPrimes(); };

  const oeuf = { kind: 'egg', c: null };
  const av = jeu.albumVitesse(oeuf);
  poser('couvaison');
  ok('la couvaison accélère la couvaison', jeu.albumVitesse(oeuf) > av);

  const jeune = { kind: 'pen', c: bete(jeu, 'crapaud', 2, 0) };
  const ap = jeu.albumVitesse(jeune);
  poser('fourrage');
  ok('le fourrage accélère la pousse', jeu.albumVitesse(jeune) > ap);

  poser('ration');
  ok('la ration compte pour l’engraissement', jeu.bonusPrimes().gras > 0);
  poser('oeil-neuf');
  ok('l’œil neuf monte la chance de chromatique', jeu.bonusPrimes().prodige > 0);
});

scenario('faveur — elles tombent à l’ascension, comme les primes', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20; s.coins = 1e6;
  jeu.choisirRoute('carrefour-1', 'route-bourse');
  s.coins = 1e12;
  jeu.prendreFaveur(jeu.mainFaveurs()[0]);
  eq('une faveur est prise', jeu.faveursPris(), 1);

  /* ELLES SE PAIENT EN PIÈCES, DONC ELLES TOMBENT. C'est ce qui les range du côté du cycle et
     non du côté de ce qu'on emporte — la constellation est l'autre côté. */
  poserJetons(jeu, 20);
  bete(jeu, 'crapaud', 3, 3000);
  jeu.ascensionner();
  eq('après le saut, plus rien', jeu.faveursPris(), 0);
  eq('et le prix repart du bas', jeu.prixFaveur(), jeu.FAVEUR_BASE);
  ok('la porte s’est refermée avec le carrefour', !jeu.faveursOuvertes());
});

scenario('faveur — la rangée s’ouvre, l’écran donne les trois cartes', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e6;
  jeu.refresh();
  eq('rien à voir avant le carrefour', noeuds.get('faveur-mise').hidden, true);

  jeu.choisirRoute('carrefour-1', 'route-bourse');
  s.coins = jeu.prixFaveur() - 1;
  jeu.refresh();
  eq('la rangée paraît', noeuds.get('faveur-mise').hidden, false);
  ok('elle annonce son prix',
     noeuds.get('faveur-mise').textContent.indexOf(jeu.fmt(jeu.prixFaveur())) >= 0,
     noeuds.get('faveur-mise').textContent);
  eq('sans de quoi payer, elle est fermée', noeuds.get('faveur-mise').disabled, true);

  s.coins = 1e12;
  jeu.refresh();
  eq('avec de quoi, elle s’ouvre', noeuds.get('faveur-mise').disabled, false);

  ok('l’écran s’ouvre', jeu.ouvrirFaveurs());
  const cartes = noeuds.get('carrefour-routes').children;
  eq('trois cartes à l’écran', cartes.length, 3);
  ok('chacune porte sa faveur', cartes.every(b => !!jeu.FAVEUR_BY_KEY[b.dataset.faveur]));

  /* IL SE FERME SANS RETIRER LE TIRAGE : sinon fermer serait relancer, et un tirage qu'on
     relance gratuitement n'est plus un tirage. */
  const main = jeu.mainFaveurs().join();
  jeu.fermerCarrefour();
  jeu.ouvrirFaveurs();
  eq('rouvrir rend les mêmes cartes', jeu.mainFaveurs().join(), main);

  /* CE QU'ON EN A DÉJÀ SE DIT SUR LA CARTE : une faveur se reprend sans limite, donc « déjà
     prise » est la seule chose qui décide vraiment entre deux cartes. */
  const cle = jeu.mainFaveurs()[0];
  jeu.state.faveurs.acquis[cle] = 2;
  jeu.ouvrirFaveurs();
  const carte = noeuds.get('carrefour-routes').children.find(b => b.dataset.faveur === cle);
  const nom = carte.children.find(x => (x.className || '').includes('route-nom'));
  ok('elle dit le rang qu’on prendrait', nom.textContent.indexOf('×3') >= 0, nom.textContent);
});

scenario('primes — la table tient debout et s’allume par paliers', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const cles = new Set();
  let dernier = 0;
  for (const p of jeu.PRIMES) {
    ok('« ' + p.cle + ' » a un nom, un glyphe et une phrase',
       !!(p.nom && p.glyphe && p.dit && p.dit.length > 10));
    ok('« ' + p.cle + ' » n’est pas en double', !cles.has(p.cle));
    cles.add(p.cle);
    ok('les prix montent (' + p.cle + ' à ' + p.prix + ')', p.prix > dernier);
    dernier = p.prix;
  }
  /* Une prime n'est prête que si on peut la payer, jamais avant.

     « UN SOU DE MOINS » N'EXISTE PLUS TOUT EN HAUT DE LA TABLE. Au-delà de 2⁵³ — neuf
     millions de milliards — les entiers de JavaScript ne se suivent plus de un en un : à
     trois cent soixante millions de milliards, deux nombres voisins sont écartés de huit, et
     `prix − 1` vaut exactement `prix`. Le test affirmait donc une chose que la machine ne
     peut plus tenir, et il l'a signalé dès que le négoce mythique est monté là-haut.

     On retire donc un CHEVEU RELATIF plutôt qu'un sou : un millionième de millionième du
     prix, ce qui reste un écart réel à toutes les échelles. La propriété vérifiée est la
     même — il manque quelque chose, la prime reste éteinte — et elle a le mérite d'être
     vraie. Le jeu, lui, ne s'en aperçoit jamais : un sou d'imprécision sur trois cent
     soixante millions de milliards ne se voit pas, et rien ne peut passer sous zéro. */
  for (const p of [jeu.PRIMES[0], jeu.PRIMES[5], jeu.PRIMES[jeu.PRIMES.length - 1]]) {
    s.coins = p.prix - Math.max(1, p.prix * 1e-12); jeu.refresh();
    ok('« ' + p.cle +' » reste éteinte à un cheveu près',
       !noeuds.get('primes').children.find(b => b.title.startsWith(p.nom + ' ')).classList.contains('prete'));
    s.coins = p.prix; jeu.refresh();
    ok('et s’allume au prix juste',
       noeuds.get('primes').children.find(b => b.title.startsWith(p.nom + ' ')).classList.contains('prete'));
  }
});

scenario('primes — chacune fait ce qu’elle dit, et une seule fois', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  const prendre = cle => jeu.buyPrime(jeu.PRIME_BY_CLE[cle]);

  const clicNu = jeu.clickPower();
  prendre('poigne'); eq('la poigne ajoute trois secondes', jeu.clickPower(), clicNu + 3);
  prendre('main');   eq('la main preste double le tout', jeu.clickPower(), (clicNu + 3) * 2);

  eq('le nichoir donne deux incubateurs', jeu.incubTotal(), s.incubators);
  prendre('nichoir');
  eq('…deux de plus', jeu.incubTotal(), s.incubators + 2);
  eq('et le tableau suit', s.incub.length, jeu.incubTotal());
  prendre('couvoir');
  eq('le couvoir en ajoute trois', jeu.incubTotal(), s.incubators + 5);

  const avantPen = jeu.pensTotal(), prixPen = jeu.penCost();
  prendre('paille');
  eq('la paille donne deux enclos', jeu.pensTotal(), avantPen + 2);
  eq('sans faire monter le prix du prochain', jeu.penCost(), prixPen);

  const oeufNu = jeu.prixOeuf(jeu.EGG_BY_KEY.commun);
  prendre('grossiste');
  ok('le grossiste baisse le prix des œufs', jeu.prixOeuf(jeu.EGG_BY_KEY.commun) < oeufNu);

  // le négoce ne vaut que pour SA rareté
  const commune = bete(jeu, 'crapaud', 3, 3000);
  const avant = jeu.sellValue(commune);
  prendre('negoce-rare');
  eq('le négoce rare ne touche pas une commune', jeu.sellValue(commune), avant);
  prendre('negoce-commune');
  eq('le négoce commun la paie un quart de plus', jeu.sellValue(commune), Math.round(avant * 1.25));

  // une prime ne s'achète pas deux fois
  const poche = s.coins;
  prendre('poigne');
  eq('repayer une prime déjà prise ne coûte rien', s.coins, poche);
});

scenario('primes — elles ne traversent pas l’ascension, la migration ne perd rien', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 6;
  jeu.buyPrime(jeu.PRIME_BY_CLE.soin);
  jeu.buyPrime(jeu.PRIME_BY_CLE.acheteur);
  emporter(jeu, [bete(jeu, 'crapaud', 3, 3000)]);   // une carte, pour vérifier qu'elle traverse
  poserJetons(jeu, 1);
  jeu.ascensionner();
  eq('les primes repartent de zéro', Object.keys(jeu.state.primes).length, 0);
  ok('alors que l’album traverse', jeu.state.album.length > 0);

  // une partie d'avant : les trois automates et l'intendant deviennent des primes
  const vieux = neuf({
    v: 12, coins: 1e6, pens: 3, incubators: 2, pen: [], incub: [null, null], eggs: { commun: 0 },
    up: { clic: 3, acheteur: 1, marchand: 1, evolution: 1, intendant: 30 },
    tuto: false, seen: {}, devoile: {}, vu: {}, t: Date.now(),
  });
  for (const cle of ['acheteur', 'marchand', 'evolution', 'intendance', 'intendance2']) {
    ok('« ' + cle + ' » est rendue au joueur', vieux.state.primes[cle] === true);
  }
  for (const cle of ['acheteur', 'marchand', 'evolution', 'intendant']) {
    ok('« ' + cle + ' » ne traîne plus dans les améliorations', !(cle in vieux.state.up));
  }
  eq('le format a bougé', vieux.state.v, jeu.SAVE_V);
});
