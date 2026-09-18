/* ── LA PLONGE ET LES TROPHÉES — l’impasse, et ce qui se décroche */

'use strict';
const { scenario, ok, eq, neuf, noeuds, poserJetons, bete, seule, dialOuvert, impasse, pave,
  parfaite, equiper } = require('./_aides.js');

scenario('plonge — c’est elle qui ouvre la porte, pas le moteur', () => {
  /* L'évier ne se montre pas tout seul : être dans l'impasse et voir la vaisselle sont deux
     choses. La professeure constate, nomme la bêtise, propose — et l'évier n'apparaît qu'après.
     C'est tout ce qui sépare un mécanisme d'un moment. */
  const jeu = seule('plonge', (j, s) => {
    s.coins = 5; s.pen = []; s.incub = [null];
    s.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0 };
  });
  const s = jeu.state;
  ok('on est bien dans l’impasse', jeu.enPlonge());
  ok('mais l’évier reste fermé', !jeu.plongeOuverte());
  eq('la scène ne montre pas la vaisselle',
     (noeuds.get('stage-name').textContent || '').trim(), 'Plus rien');
  ok('elle renvoie à la professeure',
     /professeure/.test(noeuds.get('stage-hint').textContent || ''));

  jeu.tapStage();
  eq('et cliquer ne lave rien', s.stats.assiettes || 0, 0);
  eq('ni ne rapporte quoi que ce soit', s.coins, 5);

  // on l'écoute jusqu'au bout
  let garde = 0;
  while (dialOuvert() && garde++ < 20) jeu.replique(false);
  jeu.refresh();
  ok('la porte s’ouvre quand elle a fini', jeu.plongeOuverte());
  eq('et l’évier se montre', (noeuds.get('stage-name').textContent || '').trim(), 'La plonge');
  for (let i = 0; i < jeu.ASSIETTE_CLICS; i++) jeu.tapStage();
  eq('maintenant on lave', s.stats.assiettes, 1);

  /* DEUX PORTES DE SECOURS : une impasse ne doit jamais dépendre d'un dialogue. */
  const eteint = neuf();
  eteint.state.tuto = false;
  eteint.state.coins = 5; eteint.state.pen = []; eteint.state.incub = [null];
  eteint.state.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0 };
  eteint.refresh();
  ok('mode histoire éteint : l’évier est là tout de suite', eteint.plongeOuverte());

  const revenu = neuf();
  revenu.state.vu.plonge = true;
  revenu.state.coins = 5; revenu.state.pen = []; revenu.state.incub = [null];
  revenu.state.eggs = { commun: 0, rare: 0, epique: 0, mythique: 0 };
  revenu.refresh();
  ok('scène déjà jouée : on ne raconte pas deux fois', revenu.plongeOuverte());
});

scenario('plonge — elle ne s’ouvre que dans l’impasse, et se referme en sortant', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  ok('fermée au démarrage, il y a un œuf en couvaison', !jeu.enPlonge());

  impasse(jeu);
  ok('ouverte quand il ne reste rien', jeu.enPlonge());
  eq('la scène montre l’évier', (noeuds.get('stage-name').textContent || '').trim(), 'La plonge');
  eq('et le compte des assiettes', jeu.assiettesRestantes(), jeu.oeufPlancher() - 5);

  // chacune des quatre conditions suffit à la refermer
  impasse(jeu); s.pen = [{ id: 99, line: 'crapaud', age: 1, p: 1, kind: 'commun' }];
  ok('une bête en enclos la referme', !jeu.enPlonge());
  impasse(jeu); s.incub = [{ line: 'crapaud', p: 0, kind: 'commun' }];
  ok('un œuf en couvaison la referme', !jeu.enPlonge());
  impasse(jeu); s.eggs.commun = 1;
  ok('un œuf en réserve la referme', !jeu.enPlonge());
  impasse(jeu, jeu.oeufPlancher());
  ok('de quoi acheter la referme', !jeu.enPlonge());
});

scenario('plonge — dix clics l’assiette, et rien ne les réduit', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  impasse(jeu, 0);
  const cible = jeu.oeufPlancher(), parAssiette = jeu.ASSIETTE_CLICS;

  for (let i = 1; i < parAssiette; i++) jeu.tapStage();
  eq('neuf clics ne rapportent rien', s.coins, 0);
  eq('aucune assiette lavée', s.stats.assiettes || 0, 0);
  eq('mais le frottage est compté', s.frotte, parAssiette - 1);
  eq('et chaque clic compte comme un clic du joueur', s.stats.clics, parAssiette - 1);

  jeu.tapStage();
  eq('le dixième la finit', s.stats.assiettes, 1);
  eq('et rapporte une pièce', s.coins, 1);
  eq('le frottage repart de zéro', s.frotte, 0);

  /* TOUT EST PLAT : on rallume tout ce qui accélère le clic ailleurs, et rien ne bouge ici.
     Une punition qui s'achète n'en est pas une. */
  s.up.clic = 30; s.frenesie = 60; s.primes.poigne = true; s.primes.main = true;
  ok('le clic vaut énormément ailleurs', jeu.clickPower() > 100, jeu.clickPower());
  for (let i = 1; i < parAssiette; i++) jeu.tapStage();
  eq('neuf clics ne suffisent toujours pas', s.coins, 1);
  jeu.tapStage();
  eq('il en faut toujours dix', s.coins, 2);

  // on lave jusqu'au bout
  let n = 0;
  while (jeu.enPlonge() && n++ < 500) jeu.tapStage();
  eq('on sort avec de quoi acheter un œuf', s.coins, cible);
  eq('en autant d’assiettes que de pièces', s.stats.assiettes, cible);
  eq('et en dix fois plus de clics', s.stats.clics, cible * parAssiette);
  ok('la plonge s’est refermée', !jeu.enPlonge());
  jeu.refresh();
  ok('la scène redevient un incubateur',
     (noeuds.get('stage-name').textContent || '').trim() !== 'La plonge');
});

scenario('plonge — la carte ocellée ne lave pas à ta place', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  // une carte ocellée parfaite, au plafond
  equiper(jeu, jeu.MOTIFS.indexOf('ocellé'), 5);
  impasse(jeu, 0);
  eq('elle clique pourtant très vite ailleurs', jeu.bonusAlbum().clicAuto, jeu.MOTIF_BONUS['ocellé'].cap);
  for (let i = 0; i < 200; i++) jeu.tickOcelle(0.5);   // cent secondes
  eq('aucune assiette lavée', s.stats.assiettes || 0, 0);
  eq('aucun coup d’éponge donné', s.frotte || 0, 0);
  eq('aucune pièce gagnée', s.coins, 0);
  ok('on est toujours dans l’impasse', jeu.enPlonge());
  for (let i = 0; i < jeu.ASSIETTE_CLICS; i++) jeu.tapStage();
  eq('seule la main du joueur lave', s.stats.assiettes, 1);
});

scenario('trophées — six objectifs visibles, six surprises cachées', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const lignes = () => { jeu.renderStats(); return noeuds.get('trophees').children; };
  const nom = l => (l.querySelector('.trophee-nom').textContent || '');

  const montres = jeu.TROPHEES.filter(t => t.montre).length;
  eq('rien de décroché au départ', jeu.tropheesPris(), 0);
  eq('seuls les objectifs s’affichent', lignes().length, montres);
  ok('et aucun n’est marqué pris', [...lignes()].every(l => !l.classList.contains('pris')));
  eq('le compte dit combien il en reste', (noeuds.get('trophees-meta').textContent || '').trim(),
     '0 / ' + jeu.TROPHEES.length);

  // aucune clé en double, chacun a de quoi s'afficher
  const cles = new Set();
  for (const t of jeu.TROPHEES) {
    ok('« ' + t.cle + ' » n’est pas en double', !cles.has(t.cle));
    cles.add(t.cle);
    ok('« ' + t.cle + ' » a un nom, un glyphe et une phrase',
       !!(t.nom && t.glyphe && t.dit && t.dit.length > 10));
    ok('« ' + t.cle + ' » a un test', typeof t.test === 'function');
  }

  // une surprise apparaît au moment où on la décroche, pas avant
  ok('« La plonge » est invisible', ![...lignes()].some(l => nom(l) === 'La plonge'));
  impasse(jeu, 0);
  for (let i = 0; i < jeu.ASSIETTE_CLICS; i++) jeu.tapStage();
  jeu.verifierTrophees();
  ok('elle apparaît une fois lavée', [...lignes()].some(l => nom(l) === 'La plonge'));
  ok('et elle est marquée prise',
     [...lignes()].find(l => nom(l) === 'La plonge').classList.contains('pris'));
  eq('le compte suit', jeu.tropheesPris(), 1);
});

scenario('trophées — ils ne donnent rien, et traversent l’ascension', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 6;
  /* AUCUN TROPHÉE NE DONNE DE PUISSANCE : c'est ce qui les sépare des jalons qu'on vient de
     démonter. On décroche tout et on vérifie que rien n'a bougé. */
  const avantClic = jeu.clickPower(), avantPen = jeu.pensTotal();
  s.stats.eclos = 1; s.stats.fortune = 1e9; s.stats.assiettes = 1; s.stats.prodiges = 1;
  s.dons = 99; s.seen = { 'crapaud:5': 1 };
  const sous = s.coins;
  jeu.verifierTrophees();
  ok('des trophées sont tombés', jeu.tropheesPris() >= 5, jeu.tropheesPris());
  eq('le clic n’a pas bougé', jeu.clickPower(), avantClic);
  eq('les enclos non plus', jeu.pensTotal(), avantPen);
  eq('et pas une pièce n’a été donnée', s.coins, sous);

  bete(jeu, 'crapaud', 3, 3000);
  poserJetons(jeu, 1);
  const pris = jeu.tropheesPris();
  jeu.ascensionner();
  eq('les trophées traversent l’ascension', jeu.tropheesPris(), pris);
});

scenario('trophées — quatre de plus pour l’album', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  const pris = cle => !!s.trophees[cle];
  s.album = [pave(jeu, 1)]; s.slots = []; s.poussiere = 1e6;

  jeu.verifierTrophees();
  ok('rien de décroché au départ', !pris('deuxEtoiles') && !pris('poussiere'));

  /* NEUF CARTES POUR UNE TROIS-ÉTOILES : trois forges à une étoile, puis une à deux. Les
     numéros partent de 11 pour que les cartes forgées, qui prennent 1, 2 puis 3, ne se
     confondent avec aucune des neuf. */
  s.album = [];
  for (let i = 11; i <= 19; i++) s.album.push(pave(jeu, i));
  ok('la première forge passe', jeu.forger([11, 12, 13]));
  jeu.verifierTrophees();
  ok('« Deux étoiles » tombe à la première forge', pris('deuxEtoiles'));
  ok('« Trois étoiles » pas encore', !pris('troisEtoiles'));
  jeu.forger([14, 15, 16]); jeu.forger([17, 18, 19]);
  eq('les neuf ont fait trois cartes', s.album.length, 3);
  ok('toutes à deux étoiles', s.album.every(k => k.etoiles === 2));
  ok('la quatrième forge passe', jeu.forger(s.album.map(k => k.id)));
  jeu.verifierTrophees();
  ok('et « Trois étoiles » tombe à la quatrième', pris('troisEtoiles'));
  eq('il n’en reste qu’une', s.album.length, 1);

  s.album.push(pave(jeu, 2));
  jeu.desintegrer(2); jeu.verifierTrophees();
  ok('« Poussière » tombe à la première fonte', pris('poussiere'));
  ok('« Fondeur » attend cinquante', !pris('fondeur'));
  for (let i = 3; i < 55; i++) { s.album.push(pave(jeu, i)); jeu.desintegrer(i); }
  jeu.verifierTrophees();
  ok('et tombe à la cinquantième', pris('fondeur'));

  // deux objectifs visibles, deux surprises
  const t = cle => jeu.TROPHEES.find(x => x.cle === cle);
  ok('« Deux étoiles » est un objectif', t('deuxEtoiles').montre === true);
  ok('« Trois étoiles » aussi', t('troisEtoiles').montre === true);
  ok('« Poussière » est une surprise', !t('poussiere').montre);
  ok('« Fondeur » aussi', !t('fondeur').montre);
});
