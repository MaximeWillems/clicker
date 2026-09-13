/* ── L’ASCENSION — le saut, ce qu’on emporte, ce qui demeure */

'use strict';
const { scenario, ok, eq, neuf, noeuds, poserJetons, bete, seule } = require('./_aides.js');

scenario('ascension — un jeton, des cartes, et tout le reste repart de zéro', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 6; s.incubators = 3;
  s.up.clic = 5; s.up.couveuse = 5;
  const gardee = bete(jeu, 'crapaud', 3, 3000);
  bete(jeu, 'crabe', 2, 400);
  bete(jeu, 'crapaud', 2, 400);
  poserJetons(jeu, 1);
  ok('le bouton d’ascension s’ouvre', jeu.peutAscensionner());

  jeu.ouvrirAscension();
  ok('l’écran s’ouvre', !noeuds.get('ascension').hidden);
  const ap = jeu.apercuAscension();
  eq('les trois bêtes sont proposées', ap.neuves.length, 3);
  eq('un jeton n’emporte qu’une carte', ap.max, 1);

  jeu.state.vu.oeuf = true;                 // une scène jouée, pour vérifier qu'elle traverse
  jeu.ascChoix = [ap.neuves.find(k => k.id === -gardee.id).id];
  jeu.ascensionner();
  eq('une seule carte gardée', jeu.state.album.length, 1);
  eq('c’est la bonne', jeu.state.album[0].line, gardee.line);
  eq('l’enclos repart vide', jeu.state.pen.length, 0);
  eq('les pièces repartent de zéro', jeu.state.coins, 0);
  eq('les améliorations aussi', jeu.state.up.clic, 0);
  eq('le jeton est consommé', jeu.state.asc.jetons, 0);
  eq('les consignes de ferme sont remises à plat', jeu.state.sellAt.commune, 0);
  ok('la collection traverse', Object.keys(jeu.state.seen).length > 0);
  ok('les scènes déjà jouées traversent', Object.keys(jeu.state.vu).length > 0);
});

scenario('ascension — les meilleures se prennent d’un geste', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  s.coins = 1e12; jeu.crediterJetons();

  /* CHOISIR À LA MAIN QUINZE FOIS EST UNE CORVÉE, PAS UNE DÉCISION. Neuf fois sur dix la
     réponse à « lesquelles » est « les meilleures ». */
  const faible = bete(jeu, 'crapaud', 1, 10);
  const moyenne = bete(jeu, 'crapaud', 3, 3000);
  const forte = bete(jeu, 'loup', 5, 9999);
  jeu.ouvrirAscension();

  const rafle = noeuds.get('asc-rafle');
  eq('le raccourci est là', rafle.hidden, false);
  ok('et il annonce combien', /meilleures/.test(rafle.textContent), rafle.textContent);

  const ap = jeu.apercuAscension();
  jeu.ascChoix = jeu.meilleuresCartes(ap.neuves, 2);
  eq('deux prises', jeu.ascChoix.length, 2);

  /* LE TRI VA DU PLUS RARE AU MOINS RARE, puis de l'âge au niveau : une carte ne se vend pas,
     elle s'équipe, donc c'est ce qu'elle vaudra à l'usage qui compte. */
  const pris = ap.neuves.filter(k => jeu.ascChoix.indexOf(k.id) !== -1);
  ok('la rare est dedans', pris.some(k => k.line === 'loup'), pris.map(k => k.line).join(' '));
  ok('la plus jeune est dehors', !pris.some(k => k.age === 1),
     pris.map(k => k.line + ':' + k.age).join(' '));

  // et le même bouton vide la sélection quand elle est pleine
  jeu.ascChoix = jeu.meilleuresCartes(ap.neuves, ap.max);
  jeu.renderAscension();
  ok('plein, il propose de tout enlever', /enlever/.test(rafle.textContent), rafle.textContent);
});

scenario('ascension — la porte, le nombre et la phrase disent tous la bourse', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  const bouton = () => noeuds.get('btn-asc');

  s.coins = 1e12; jeu.crediterJetons();
  s.pen = [bete(jeu, 'crapaud', 3, 3000)];
  jeu.ascChoix = [-s.pen[0].id];
  jeu.ascensionner();

  /* LE MUR REMONTAIT ICI, SOUS UNE AUTRE FORME. Le bouton lisait `jetonsDus`, le crédit du
     CYCLE, et se cachait quand il valait zéro — c'est-à-dire juste après un saut, quand
     `sommet` repart de zéro. On pouvait avoir quatre jetons en poche, le droit de sauter, et
     aucun bouton. */
  s.coins = 100; jeu.crediterJetons();
  eq('le cycle neuf ne crédite rien', jeu.jetonsDus(), 0);
  ok('mais la bourse n’est pas vide', jeu.jetonsEnMain() > 0);
  ok('et on peut sauter', jeu.peutAscensionner());

  jeu.refresh();
  eq('donc le bouton est là', bouton().hidden, false);
  ok('et il annonce la bourse, pas le crédit',
     bouton().textContent.indexOf(String(jeu.jetonsEnMain())) >= 0, bouton().textContent);

  /* LA PHRASE DE L'ÉCRAN DISAIT LE CONTRAIRE DE CE QUE LE CODE FAIT. « Sauter les dépense
     tous, employés ou non » était vrai jusqu'à la 4.0.0 et faux depuis : le reste demeure. La
     phrase poussait à brûler ses jetons en cartes qu'on ne veut pas — exactement contre
     l'arbitrage qu'elle était censée servir. */
  s.pen = [bete(jeu, 'crapaud', 3, 3000)];
  jeu.ouvrirAscension();
  const dit = noeuds.get('asc-jalon').textContent;
  ok('elle ne promet plus de tout dépenser', dit.indexOf('dépense tous') < 0, dit);
  ok('elle dit ce qui reste', dit.indexOf('reste en bourse') >= 0, dit);
});

scenario('ascension — rien ne survit au saut que ce qui est nommé', () => {
  /* « LE RESET N'A PAS TOUT REMIS À ZÉRO » EST UNE PHRASE QU'ON NE PEUT PAS VÉRIFIER À L'ŒIL.
     L'ascension recopie une liste de champs par-dessus un état frais, et cette liste est
     écrite à un seul endroit. Ce scénario la relit autrement : il compare l'état d'après-saut
     à celui d'une partie neuve, CLÉ PAR CLÉ, et exige que tout écart soit dans la liste.

     Un champ oublié dans la recopie est invisible — il ressemble à du progrès. Un champ ajouté
     par erreur l'est encore plus : il ressemble à une récompense. */
  const frais = neuf();
  frais.state.tuto = false;
  const temoin = JSON.parse(JSON.stringify(frais.state));

  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e13; s.pens = 20; s.incubators = 6;
  for (const u of Object.keys(s.up)) s.up[u] = 14;
  for (const p of jeu.PRIMES) s.primes[p.cle] = true;
  s.ciel = { poing: true, fracas: true, ferveur: true, nid: true };
  jeu.oublierPrimes();
  jeu.crediterJetons();

  const avant = jeu.clickPower();
  ok('la partie montée frappe fort', avant > 20, avant);

  s.pen = [];
  jeu.ascChoix = [];
  jeu.ascensionner();

  /* CE QUE LE SAUT EMPORTE EXPRÈS. Trois natures : ce qui se collectionne (l'album, le carnet,
     les trophées), ce qui s'apprend (le tutoriel, les réglages), et ce qui est permanent par
     décision (la constellation). `incub` en est parce que l'œuf de départ est tiré au hasard :
     deux parties neuves n'ont pas la même lignée dedans. */
  const VOULUS = new Set(['album', 'slots', 'ciel', 'asc', 'seen', 'dex', 'tri', 'triOeuf',
    'achat', 'sound', 'poussiere', 'tuto', 'vu', 'dial', 'stats', 'dons', 'trophees',
    't', 'v', 'incub']);
  const restes = [];
  for (const k of new Set(Object.keys(temoin).concat(Object.keys(jeu.state)))) {
    if (VOULUS.has(k)) continue;
    const a = JSON.stringify(temoin[k]), b = JSON.stringify(jeu.state[k]);
    if (a !== b) restes.push(k + ' : ' + String(a).slice(0, 30) + ' → ' + String(b).slice(0, 30));
  }
  ok('rien d’autre ne traverse le saut', restes.length === 0, restes.join('  |  '));

  /* ET LE CLIC RETOMBE EXACTEMENT À CE QUE LA CONSTELLATION LUI DONNE, ni plus ni moins. C'est
     le nombre que le joueur voit, et le seul qui doive s'expliquer sans le code : un plus ce
     que les nœuds de la main ajoutent. */
  const duCiel = jeu.bonusCiel().clic;
  eq('le clic ne garde que ce que le ciel lui donne', jeu.clickPower(), frais.clickPower() + duCiel);
  ok('et le ciel lui en donne bien', duCiel > 0, duCiel);
});

scenario('ascension — ce qui n’est pas employé demeure vraiment', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  s.coins = 1e12; jeu.crediterJetons();
  const avant = jeu.jetonsEnMain();
  ok('la bourse est garnie', avant >= 4, avant);

  s.pen = [bete(jeu, 'crapaud', 3, 3000)];
  jeu.ascChoix = [-s.pen[0].id];
  jeu.ascensionner();
  /* UNE CARTE COÛTE UN JETON, ET PAS PLUS : le reste est en bourse, disponible pour l'arbre. */
  eq('une carte a coûté son prix, le reste demeure', jeu.jetonsEnMain(), avant - 1);
});

scenario('ascension — les jetons se regagnent, et le mur tombe', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  for (let i = 0; i < 4; i++) bete(jeu, 'crapaud', 3, 3000);

  /* LE MUR, RENCONTRÉ EN JOUANT À MILLE MILLIARDS : plus de jeton en poche, et le palier
     suivant mille fois plus haut. La porte demandait un jeton NON DÉPENSÉ ; elle ne demande
     plus que d'avoir atteint le million une fois. */
  s.coins = 1e9; jeu.crediterJetons();
  eq('un milliard vaut quatre paliers', jeu.jetonsDus(), 4);
  ok('l’ascension est ouverte', jeu.peutAscensionner());
  /* QUATRE JETONS N'ACHÈTENT PLUS QUATRE CARTES : le prix des cartes monte : 1, 2, 3, 5 — donc
     deux cartes pour trois jetons, et la troisième en coûterait six. */
  eq('mais quatre jetons ne valent que deux cartes', jeu.apercuAscension().max, 2);
  s.asc.jetons = 11;   // de quoi en prendre quatre : 1 + 2 + 3 + 5
  eq('onze jetons en valent quatre', jeu.apercuAscension().max, 4);

  jeu.ascChoix = jeu.apercuAscension().neuves.slice(0, 4).map(k => k.id);
  jeu.ascensionner();
  /* `ascensionner` RÉASSIGNE `state` : tout ce qui suit doit relire `jeu.state`, sinon on
     interroge l'ancienne partie et tout paraît inchangé. */
  const n = jeu.state;
  eq('le saut a eu lieu', n.asc.n, 1);
  eq('quatre cartes dans l’album', n.album.length, 4);

  /* CE QUI A CHANGÉ : la porte reste ouverte, et le compte se refait sur le cycle suivant.
     Avant, il aurait fallu multiplier sa fortune par mille pour pouvoir sauter à nouveau. */
  ok('la porte reste ouverte', jeu.peutAscensionner());
  eq('mais le sommet est reparti à zéro', n.asc.sommet, 0);
  /* La bourse gardait onze jetons, le cycle en créditait quatre de plus, et les quatre cartes
     en ont coûté onze : il en reste quatre. Ce reste EST la décision — il va à la
     constellation. */
  eq('et il reste ce que les cartes n’ont pas mangé', n.asc.jetons, 15 - jeu.coutCartes(4));

  n.coins = 1e9; jeu.crediterJetons();
  eq('refaire le milliard recrédite quatre jetons', jeu.jetonsDus(), 4);
  /* L'ÉCHELLE, ELLE, NE SE REFRANCHIT PAS : `paliers` compte la partie entière et sert au
     déblocage, pas à ce qu'on emporte. */
  eq('sans refranchir l’échelle', n.asc.paliers, 4);

  /* LE SOMMET, ET NON LA BOURSE DU MOMENT : dépenser juste avant de sauter ne coûte pas de
     carte. */
  n.coins = 0;
  eq('dépenser ne retire rien', jeu.jetonsDus(), 4);
});
