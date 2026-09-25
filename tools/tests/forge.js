/* ── LA FORGE ET LA POUSSIÈRE — fondre, fusionner, ce qu’une carte ratée vaut */

'use strict';
const { scenario, ok, eq, neuf, noeuds, poserJetons, beteNeutre, seule, pave,
  parfaite } = require('./_aides.js');

scenario('poussière — la rareté s’annule des deux côtés', () => {
  const jeu = neuf();
  /* LA RARETÉ MULTIPLIE CE QU'UNE CARTE REND ET CE QU'UNE FUSION COÛTE. Elle s'annule donc :
     monter une commune ou une mythique demande le MÊME nombre de cartes de sa propre rareté.
     Sans ça, une rareté deviendrait la monnaie des autres. */
  for (const ligne of ['crapaud', 'loup', 'golem', 'ouroboros']) {
    const k1 = pave(jeu, 1, ligne, 1), k2 = pave(jeu, 1, ligne, 2);
    eq(ligne + ' : dix cartes pour la deuxième étoile',
       jeu.coutFusion(k1) / jeu.poussiereDe(k1), 10);
    eq(ligne + ' : quarante pour la troisième',
       jeu.coutFusion(k2) / jeu.poussiereDe(k1), 40);
  }
  /* UN CHROMATIQUE REND DE L'OR, PAS DU BLEU. Le montant suit la même règle que le tout-venant
     de sa rareté — c'est le BASSIN qui change, pas la quantité. On le fond et on regarde où la
     poussière tombe. */
  const nu = pave(jeu, 1, 'crapaud');
  const chroma = Object.assign(pave(jeu, 2, 'crapaud'), { prodige: true });
  eq('même montant qu’un tout-venant de sa rareté', jeu.poussiereDe(chroma), jeu.poussiereDe(nu));
  const jeu2 = neuf(); const s2 = jeu2.state;
  s2.album = [Object.assign(pave(jeu2, 7, 'crapaud'), { prodige: true })];
  s2.slots = []; s2.poussiere = 0; s2.poussiereOr = 0;
  jeu2.desintegrer(7);
  eq('rien dans le bassin bleu', s2.poussiere, 0);
  ok('tout dans le bassin doré', s2.poussiereOr > 0, s2.poussiereOr);

  /* LA QUALITÉ N'ENTRE PAS : niveau, teinte et rang décident déjà de la puissance. */
  const bacle = Object.assign(pave(jeu, 3, 'crapaud'), { niv: 1, chroma: 0, rank: 0 });
  eq('une carte bâclée rend autant qu’une parfaite', jeu.poussiereDe(bacle), jeu.poussiereDe(nu));
  ok('mais elle est bien plus faible', jeu.puissanceDe(bacle) < jeu.puissanceDe(nu));
});

scenario('poussière — fondre, et ne jamais défaire une fusion', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.album = [pave(jeu, 1), pave(jeu, 2), pave(jeu, 3)];
  s.slots = [1];
  s.poussiere = 0;

  ok('une carte équipée ne se fond pas', !jeu.desintegrer(1));
  eq('elle est toujours là', s.album.length, 3);
  ok('une carte libre se fond', jeu.desintegrer(2));
  eq('et rend sa poussière', s.poussiere, jeu.poussiereDe(pave(jeu, 9)));
  eq('l’album en perd une', s.album.length, 2);
  eq('le compteur suit', s.stats.fondues, 1);

  /* ON NE DÉFAIT PAS UNE FUSION : les étoiles n'entrent pas dans ce qu'une carte rend. Sinon
     forger puis fondre rendrait une partie de ce qu'on vient de payer — et depuis que trois
     cartes entrent pour une, ce serait bien pire qu'une fuite de monnaie. */
  s.album = [pave(jeu, 1, 'crapaud', 3)];
  s.slots = [];
  const avant = s.poussiere;
  jeu.desintegrer(1);
  eq('une carte à trois étoiles rend autant qu’une neuve',
     s.poussiere - avant, jeu.poussiereDe(pave(jeu, 9)));
});

scenario('poussière dorée — l’enclos se partage en deux bassins au saut', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.pens = 20;
  poserJetons(jeu, 1);                     // de quoi ouvrir la porte du saut

  const nu = beteNeutre(jeu, 'crapaud', 3, 3000);
  const chroma = beteNeutre(jeu, 'crapaud', 3, 3000); chroma.prodige = true;
  jeu.refresh();

  jeu.ascensionner();
  const t = jeu.state;
  /* LE TOUT-VENANT LAISSE DU BLEU, LE CHROMATIQUE DE L'OR — deux bassins qui ne se mélangent
     pas, et les deux traversent le saut comme l'album. */
  ok('du bleu, du tout-venant', t.poussiere > 0, t.poussiere);
  ok('de l’or, du chromatique', t.poussiereOr > 0, t.poussiereOr);
});

scenario('forge — trois entrent, une sort, et les trois disparaissent', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  // des numéros hauts EXPRÈS : le compteur des cartes neuves part de 1, et une carte forgée
  // qui reprendrait le numéro d'une mangée rendrait l'assertion d'en dessous muette
  s.album = [pave(jeu, 11), pave(jeu, 12), pave(jeu, 13)];
  s.slots = [];
  s.poussiere = 0;
  const trio = [11, 12, 13];
  const cout = jeu.coutFusion(s.album[0]);

  ok('sans poussière, la forge refuse', !jeu.forger(trio));
  eq('et rien n’a disparu', s.album.length, 3);

  s.poussiere = cout;
  ok('avec juste assez, elle passe', jeu.forger(trio));
  /* C'EST TOUTE LA DIFFÉRENCE AVEC L'ANCIEN GESTE : trois cartes entraient dans le compte et
     aucune n'en sortait. « Fusionner » montait une étoile contre de la monnaie, sans rien
     consommer — le mot mentait sur ce qu'il faisait. */
  eq('trois cartes n’en font qu’une', s.album.length, 1);
  eq('elle porte deux étoiles', s.album[0].etoiles, 2);
  eq('et la poussière est dépensée', s.poussiere, 0);
  ok('la carte qui sort est neuve', trio.indexOf(s.album[0].id) === -1, s.album[0].id);
  eq('le compteur suit', s.stats.fusions, 1);
  eq('et le choix en cours est oublié', jeu.forgeBase, null);
});

scenario('forge — même lignée, même motif, même rang, et rien d’équipé', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.poussiere = 1e9; s.slots = [];

  // LA LIGNÉE : elle décide du plafond de puissance
  s.album = [pave(jeu, 1, 'crapaud'), pave(jeu, 2, 'crapaud'), pave(jeu, 3, 'loup')];
  ok('trois lignées mêlées : refusé', !jeu.forger([1, 2, 3]));

  // LE MOTIF : il décide de ce que la carte FAIT ; les mélanger fabriquerait un effet choisi
  // par personne
  s.album = [pave(jeu, 1), pave(jeu, 2), Object.assign(pave(jeu, 3), { motif: 1 })];
  ok('un motif différent : refusé', !jeu.forger([1, 2, 3]));

  // LE RANG D'ÉTOILES : une trois-étoiles avalée par une fusion de une-étoile serait un
  // gâchis invisible
  s.album = [pave(jeu, 1), pave(jeu, 2), pave(jeu, 3, 'crapaud', 2)];
  ok('un rang différent : refusé', !jeu.forger([1, 2, 3]));

  /* L'ÂGE, LUI, N'EN EST PAS : il ne dit que la puissance, et la puissance se moyenne. Sans
     ça il faudrait trois bêtes menées au même âge, et l'atelier ne s'ouvrirait qu'à qui joue
     déjà parfaitement. */
  s.album = [Object.assign(pave(jeu, 1), { age: 2, niv: 30 }),
             Object.assign(pave(jeu, 2), { age: 4, niv: 80 }),
             pave(jeu, 3)];
  ok('trois âges différents se marient', jeu.forger([1, 2, 3]));

  /* UNE CARTE ÉQUIPÉE N'ENTRE PAS DANS LA FORGE, comme elle ne se fond pas : elle
     s'évaporerait d'un emplacement et changerait le build en silence. */
  s.album = [pave(jeu, 1), pave(jeu, 2), pave(jeu, 3)];
  s.slots = [2];
  ok('une équipée : refusé', !jeu.forger([1, 2, 3]));
  eq('l’album est intact', s.album.length, 3);
  ok('et elle n’est pas proposée',
     jeu.compagnes(s.album[0]).every(k => k.id !== 2),
     jeu.compagnes(s.album[0]).map(k => k.id).join(' '));

  // la même carte trois fois ne fait pas trois cartes
  s.slots = [];
  ok('un trio de doublons : refusé', !jeu.forger([1, 1, 1]));
  ok('deux cartes ne suffisent pas', !jeu.forger([1, 2]));

  // une carte au bout n'a plus d'étoile à gagner
  s.album = [pave(jeu, 1, 'crapaud', 3), pave(jeu, 2, 'crapaud', 3), pave(jeu, 3, 'crapaud', 3)];
  ok('trois étoiles est le bout', !jeu.forger([1, 2, 3]));
  ok('et rien de tout ça n’est forgeable', s.album.every(k => !jeu.forgeable(k)));
});

scenario('forge — ce qui entre se moyenne, et la couleur suit la roue', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.poussiere = 1e9; s.slots = [];

  const trois = [
    Object.assign(pave(jeu, 1), { age: 5, niv: 100, chroma: 7, rank: 5, prodige: true }),
    Object.assign(pave(jeu, 2), { age: 1, niv: 15,  chroma: 0, rank: 0 }),
    Object.assign(pave(jeu, 3), { age: 5, niv: 100, chroma: 2, rank: 3 }),
  ];
  s.album = trois;
  const vu = jeu.fusionDe(trois);
  eq('l’âge est la moyenne', vu.age, 4);
/* LA COULEUR NE SE MOYENNE PAS COMME UN INDICE : seule la carte CHROMATIQUE en donne une,
     les deux grises n'ont qu'une couleur latente. Ici une seule des trois est chromatique,
     donc c'est la sienne qui sort — magenta, l'indice 7. */
  eq('la couleur vient de la seule carte chromatique', vu.chroma, 7);
  eq('le rang aussi', vu.rank, 3);
  /* LE NIVEAU SE REPLIE DANS SA TRANCHE : la moyenne de trois âges différents tombe volontiers
     hors des bornes de l'âge retenu, et une bête de niveau 12 à l'âge légende n'existe pas. */
  ok('le niveau tient dans son âge', vu.niv > 65 && vu.niv <= 85, vu.niv);
  eq('l’étoile monte', vu.etoiles, 2);

  /* ET DEUX COULEURS OPPOSÉES SE MÉLANGENT PAR L'ARC COURT, jamais par la moyenne des
     indices : entre l'écarlate (0) et le magenta (7), la moyenne donnerait du jade, à
     l'exact opposé des deux. Sur la roue ils sont voisins, et leur milieu est l'écarlate. */
/* CES TROIS CAS S'ÉCRIVENT EN FONCTION DE LA TAILLE DE LA ROUE, jamais en indices en dur :
     elle est passée de huit à seize crans en `4.18.1`, et des indices fixes auraient fait
     échouer le scénario pour une raison qui n'est pas une faute. */
  const n = jeu.CHROMAS.length;
  eq('le milieu de deux voisins est entre eux', jeu.milieuRoue([0, 2]), 1);
  /* L'ARC COURT PASSE PAR LE ZÉRO : entre l'avant-dernière couleur et la première, le milieu
     est la dernière, et non le point diamétralement opposé. C'est toute la différence entre
     une roue et une moyenne d'indices. */
  eq('et il passe par le zéro quand c’est le plus court', jeu.milieuRoue([n - 2, 0]), n - 1);
  /* DEUX COULEURS DIAMÉTRALEMENT OPPOSÉES N'ONT PAS DE MILIEU : les deux arcs se valent, et
     aucun calcul ne peut les départager. On rend la première plutôt qu'un zéro arbitraire. */
  eq('deux opposées rendent la première', jeu.milieuRoue([3, 3 + n / 2]), 3);

  /* LE CHROMATIQUE SE DÉCIDE À LA MAJORITÉ : on ne peut pas être aux deux tiers chromatique,
     et un chromatique perdu au milieu de deux ordinaires ne se transmet pas. */
  eq('un chromatique sur trois ne passe pas', vu.prodige, false);
  trois[1].prodige = true;
  eq('deux sur trois, oui', jeu.fusionDe(trois).prodige, true);

  // même règle pour le fond, et deux fonds DIFFÉRENTS n'en font pas un
  trois[0].fond = 'braise'; trois[1].fond = 'givre'; trois[2].fond = null;
  eq('deux fonds différents ne se marient pas', jeu.fusionDe(trois).fond, null);
  trois[1].fond = 'braise';
  eq('deux fois le même, oui', jeu.fusionDe(trois).fond, 'braise');

  // ce que l'écran montrait est bien ce qui sort
  const promis = jeu.fusionDe(trois);
  jeu.forger([1, 2, 3]);
  eq('la carte forgée est celle qu’on avait vue', s.album[0].chroma, promis.chroma);
  eq('et son âge aussi', s.album[0].age, promis.age);
});

scenario('forge — on désigne une carte, et la grille se réduit à ses semblables', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.poussiere = 1e9; s.slots = [];

  const grille = () => noeuds.get('forge-grille').children;
  const plan = () => noeuds.get('forge-plan');
  const dans = (e, cls) => {
    const t = [];
    const m = x => { if ((x.className || '').includes(cls)) t.push(x); x.children.forEach(m); };
    e.children.forEach(m);
    return t;
  };

  // L'ONGLET N'EXISTE PAS AVANT LA PREMIÈRE CARTE : on ne montre pas la porte d'une pièce vide
  s.album = [];
  jeu.refresh();
  const onglet = v => [...document.querySelectorAll('.onglet')].find(b => b.dataset.vue === v);
  eq('pas de forge sans album', onglet('forge').hidden, true);

  /* PREMIER TEMPS : L'ALBUM ENTIER. On ne peut pas choisir dans ce qu'on ne voit pas, et une
     grille pré-filtrée cacherait justement les cartes qu'il faut apprendre à garder. */
  s.album = [pave(jeu, 1, 'crapaud'), pave(jeu, 2, 'crapaud'),
             pave(jeu, 3, 'crapaud'), pave(jeu, 4, 'loup'),
             Object.assign(pave(jeu, 5, 'crapaud'), { motif: 3 }),
             pave(jeu, 6, 'crapaud')];
  jeu.oublierForge();
  jeu.refresh();
  /* L'ATELIER A ÉTÉ UN NŒUD DE CONSTELLATION PENDANT DEUX VERSIONS, et c'était une faute :
     c'est là que va la poussière, donc du jeu de base. Il se rouvre à la première carte. */
  eq('des cartes suffisent', onglet('forge').hidden, false);
  eq('la grille montre tout l’album', grille().length, 6);
  eq('et le plan de travail attend', plan().hidden, true);

  /* SECOND TEMPS : LA GRILLE SE RÉDUIT. C'est la réduction elle-même qui enseigne la règle du
     mariage — on ne lit pas « même lignée, même motif », on voit cinq cartes devenir deux. */
  ok('on désigne une carte', jeu.choisirForge(1));
  eq('elle passe au plan de travail', plan().hidden, false);
  eq('il ne reste que ses semblables', grille().length, 3);
  ok('ni le loup ni l’autre motif',
     grille().every(c => ['2', '3', '6'].indexOf(String(c.dataset.id)) !== -1),
     grille().map(c => c.dataset.id).join(' '));

  // trois places, dont deux creuses, et pas encore de sortie
  eq('trois places au plan', dans(plan(), 'forge-in')[0].children.length, 3);
  eq('dont deux creuses', dans(plan(), 'carte-trou').length, 3);
  eq('le bouton attend', dans(plan(), 'forge-acte')[0].disabled, true);

  jeu.choisirForge(2);
  eq('une place se remplit', dans(plan(), 'carte-trou').length, 2);
  jeu.choisirForge(3);
  /* LA SORTIE SE VOIT AVANT D'ÊTRE FABRIQUÉE, et c'est ce qui compte le plus ici : une teinte
     se dilue dans une fusion, et rien ne se défait. */
  eq('plus aucune place creuse', dans(plan(), 'carte-trou').length, 0);
  eq('la sortie est là', dans(plan(), 'forge-out')[0].children.length, 1);
  ok('et elle porte deux étoiles',
     dans(plan(), 'carte-etoiles').some(e => e.textContent === '★★☆'),
     dans(plan(), 'carte-etoiles').map(e => e.textContent).join(' '));
  eq('le bouton est prêt', dans(plan(), 'forge-acte')[0].disabled, false);
  eq('le trio est celui qu’on a désigné', jeu.trioForge().join(','), '1,2,3');

  // CLIQUER REPREND CE QU'ON VIENT DE POSER : un joueur qui se trompe corrige au même endroit
  ok('une quatrième est refusée', !jeu.choisirForge(6));
  eq('le plan n’a pas bougé', jeu.trioForge().join(','), '1,2,3');
  jeu.choisirForge(3);
  eq('la troisième repart', jeu.trioForge().join(','), '1,2');
  ok('et la place libérée se reprend', jeu.choisirForge(6));

  // et cliquer la base annule tout
  jeu.choisirForge(1);
  eq('plus de base', jeu.forgeBase, null);
  eq('la grille redevient l’album', grille().length, 6);
  eq('et le plan se referme', plan().hidden, true);

  /* CE QU'ON NE PEUT PAS FORGER RESTE MONTRÉ, éteint et avec sa raison : cacher une carte
     qu'on possède ferait chercher ce qu'on a déjà. */
  s.slots = [4];
  jeu.forgeSig = '';
  jeu.refresh();
  const eteinte = grille().find(c => String(c.dataset.id) === '4');
  ok('l’équipée est éteinte', eteinte.className.includes('forge-hs'), eteinte.className);
  ok('et dit pourquoi', /équipée/.test(eteinte.title), eteinte.title);
  ok('la désigner ne fait rien', !jeu.choisirForge(4));

  eq('la poussière est annoncée', noeuds.get('forge-poussiere').textContent.slice(0, 1), '✧');

  // un choix se périme tout seul quand la carte disparaît sous les pieds du joueur
  jeu.choisirForge(1); jeu.choisirForge(2);
  s.album = s.album.filter(k => k.id !== 2);
  jeu.forgeSig = '';
  jeu.refresh();
  eq('la carte fondue quitte le plan', jeu.trioForge().join(','), '1');

  // et l'onglet se referme si l'album se vide
  jeu.ouvrirVue('forge');
  eq('on y est', jeu.vue, 'forge');
  s.album = [];
  jeu.refresh();
  eq('un album vide ramène à la ferme', jeu.vue, 'ferme');
});

scenario('poussière — l’ascension défait tout l’enclos', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 20;
  for (let i = 0; i < 10; i++) beteNeutre(jeu, 'crapaud', 3, 3000);
  poserJetons(jeu, 1);                    // de quoi ouvrir la porte du saut

  eq('rien en poche avant', s.poussiere || 0, 0);
  jeu.ascensionner();
  /* PLUS DE CARTES AU SAUT : l'album ne gagne rien ici, les cartes viennent des boosters. Et
     comme on n'emporte plus rien, l'enclos ENTIER se défait — un dixième de ce que chaque carte
     aurait rendu. Ce n'est pas grand-chose, et c'est voulu : ça récompense d'ascensionner sur
     une ferme pleine sans rendre le sacrifice indolore. */
  eq('l’album ne gagne rien au saut', jeu.state.album.length, 0);
  eq('les dix bêtes laissent leur poussière', jeu.state.poussiere, 10);
  ok('la poussière traverse le saut',
     jeu.state.poussiere > 0 && jeu.state.coins === 0);
});

scenario('poussière — une bête engraissée en laisse davantage au saut', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 5e6; s.pens = 20;
  /* LA TAILLE NE SE VEND PLUS, ELLE SE DÉFAIT. Depuis le barème unique, un rang de taille ne
     touche ni au prix de vente ni à la rente : il multiplie la poussière que la bête laisse au
     saut — ×4,5 pour une démesurée. On engraisse ce qu'on garde, avant de sauter. */
  const c = beteNeutre(jeu, 'crapaud', 5, 1e6);            // une légende mûre
  const valeur = jeu.sellValue(c), rente = jeu.renteOf(c);
  jeu.engraisser(c, 1e6);                                  // bien au-delà du dernier rang
  eq('elle est démesurée', jeu.rangDe(c).i, jeu.RANKS.length - 1);
  eq('sa valeur ne bouge pas', jeu.sellValue(c), valeur);
  eq('sa rente non plus', jeu.renteOf(c), rente);

  for (let i = 0; i < 9; i++) beteNeutre(jeu, 'crapaud', 5, 1e6);
  poserJetons(jeu, 1);
  jeu.ascensionner();
  // neuf bêtes de taille normale à une poussière chacune, et la démesurée à quatre et demie
  eq('la démesurée laisse quatre fois et demie la sienne', jeu.state.poussiere, 9 + Math.round(4.5));
});
