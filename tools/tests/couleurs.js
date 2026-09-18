/* ── LES COULEURS ET LES FONDS — ce que rend chaque teinte */

'use strict';
const { scenario, ok, eq, neuf, noeuds, poserJetons, bete, seule, fiche } = require('./_aides.js');

scenario('fonds — un sur huit cents, et seulement à la boutique', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15; s.pens = 20;

  eq('huit fonds', jeu.FONDS.length, 8);
  eq('chacun sa clé', new Set(jeu.FONDS.map(f => f.key)).size, 8);
  ok('tous dans la fourchette des teintes',
     jeu.FONDS.every(f => f.mult >= 1.10 && f.mult <= 1.20),
     jeu.FONDS.map(f => f.mult).join(' '));

  /* PRESTIGIEUX VEUT DIRE RARE, et « seulement dans les œufs de la boutique » compte autant
     que le chiffre : une pension à mille œufs l'heure en sortirait un toutes les cinq
     minutes, et le mot ne voudrait plus rien dire. */
  const N = 300000;
  let achetes = 0, pondus = 0;
  for (let i = 0; i < N; i++) if (jeu.rollVariants(true).fond) achetes++;
  for (let i = 0; i < N; i++) if (jeu.rollVariants(false).fond) pondus++;
  ok('un sur huit cents à l’achat',
     Math.abs(achetes / N - jeu.FOND_ODDS) < jeu.FOND_ODDS * 0.3,
     (achetes / N * 800).toFixed(2) + ' fois la cible');
  eq('aucun à la pension', pondus, 0);

  /* L'ŒUF DE PENSION ET L'ŒUF ACHETÉ SONT INDISCERNABLES dans la réserve — c'était voulu.
     `tireLigne` est le seul endroit qui sache les distinguer, et il le dit à l'éclosion. */
  s.pension.dus = { commun: ['loup'] };
  const promis = jeu.tireLigne('commun');
  eq('la lignée promise vient de la pension', promis.line, 'loup');
  eq('et elle se dit telle', promis.pension, true);
  eq('un tirage ordinaire ne l’est pas', jeu.tireLigne('commun').pension, false);
});

scenario('fonds — il vaut, il se peint, il se retient, il ne se nomme pas', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15; s.pens = 20;
  const c = bete(jeu, 'loup', 3, 20000);

  const nu = jeu.sellValue(c), nom = jeu.fullName(c);
  c.fond = 'aurore';
  const f = jeu.FOND_BY_KEY.aurore;

  /* IL ENTRE DANS LA VALEUR, dans la fourchette des teintes — au-delà il faudrait reprendre
     l'équilibrage des variantes en entier. */
  ok('la bête vaut plus', jeu.sellValue(c) > nu, nu + ' → ' + jeu.sellValue(c));
  ok('exactement son multiplicateur',
     Math.abs(jeu.sellValue(c) / nu - f.mult) < 0.01, jeu.sellValue(c) / nu);

  /* ET IL N'ENTRE PAS DANS LE NOM. Un fond SE VOIT : le dire en plus serait une redite, et le
     jeu n'affiche qu'une seule épithète exprès. */
  eq('le nom ne bouge pas', jeu.fullName(c), nom);
  ok('et il ne dit pas le fond', !/aurore/i.test(jeu.fullName(c)), jeu.fullName(c));

  // il se peint, sur la scène
  s.sel = 'c:' + c.id;
  jeu.refresh();
  const scene = noeuds.get('stage-fond');
  eq('la scène le montre', scene.hidden, false);
  ok('avec sa classe', scene.className.includes('fond-aurore'), scene.className);
  eq('et ses particules', scene.children.length, f.n);
  eq('un redessin n’en ajoute pas', (jeu.refresh(), noeuds.get('stage-fond').children.length), f.n);

  // une bête sans fond n'en peint aucun, et un œuf non plus
  c.fond = null;
  jeu.refresh();
  eq('rien à montrer', noeuds.get('stage-fond').hidden, true);

  /* IL SE RETIENT AU CARNET : un objet de collection a besoin d'un endroit où être
     collectionné, sinon « collectionnable » n'est qu'un mot. */
  c.fond = 'braise';
  jeu.noterEclosion(c);
  eq('le carnet le compte', jeu.dexVu('loup').fonds.braise, 1);
  jeu.encyLignee = 'loup';
  jeu.encySig = '';
  jeu.renderEncyclopedie();
  const plat = noeuds.get('ency').children
    .map(e => (e.textContent || '') + e.children.map(x => ' ' + x.textContent +
              x.children.map(y => ' ' + y.textContent).join('')).join('')).join(' | ');
  ok('la fiche a sa rangée', /Fonds . 1 . 8/.test(plat), plat);
  ok('et nomme celui qu’on a croisé', /braise/.test(plat), plat);

  jeu.verifierTrophees();
  ok('le trophée tombe', !!s.trophees.fond);
});

scenario('fonds — la carte emporte celui de la bête', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12; s.pens = 8;
  const c = bete(jeu, 'loup', 3, 20000);
  c.fond = 'givre'; c.keep = true;

  // la capsule est ce qu'une carte garde d'une bête — le geste que fera le booster
  const neuve = Object.assign(jeu.capsuleBrute(c), { id: 1 });
  ok('la capsule existe', neuve.line === 'loup');
  eq('et elle emporte le fond', neuve.fond, 'givre');

  s.album = [neuve]; s.slots = []; s.asc.n = 1;
  jeu.oublierAlbum(); jeu.refresh();
  const cartes = [];
  const m = e => { if (e.classList && e.classList.contains('carte')) cartes.push(e); e.children.forEach(m); };
  noeuds.get('album').children.forEach(m);
  ok('la carte se signale', cartes[0].className.includes('a-fond'), cartes[0].className);
  const zone = cartes[0].children.find(x => (x.className || '').includes('carte-fond'));
  ok('le décor est dans la zone d’illustration', zone.className.includes('fond-givre'), zone.className);
  ok('et il porte des particules', zone.children.length > 0, zone.children.length);
});

scenario('couleurs — chacune rend l’hexadécimal qu’elle annonce', () => {
  /* ON SIMULE LE NAVIGATEUR, parce que la faute était invisible autrement. `brightness(1.95)`
     envoyait à un blanc PUR tout ce qui dépassait 0,51 : sur le wukong, 43 % du dessin — le
     nuage entier et les mèches claires — sortaient à `#ffffff`, une seule valeur pour cinq
     clartés différentes. Rien dans le jeu ne pouvait le dire ; il fallait refaire le calcul.

     ON INTERDIT LE PALIER, PAS UN RÉGLAGE. Un test qui figerait les nombres empêcherait de
     retoucher un gris, ce qui est justement ce qu'on veut pouvoir faire. Ce qu'on interdit,
     c'est qu'une chaîne rende la même sortie pour des entrées différentes : ça, ce n'est
     jamais voulu, quel que soit le réglage. */
  const jeu = neuf();
  const cl = v => Math.max(0, Math.min(1, v));
  const mul = (m, p) => [m[0]*p[0]+m[1]*p[1]+m[2]*p[2],
                         m[3]*p[0]+m[4]*p[1]+m[5]*p[2],
                         m[6]*p[0]+m[7]*p[1]+m[8]*p[2]];
  const sat = s => [0.213+0.787*s, 0.715-0.715*s, 0.072-0.072*s,
                    0.213-0.213*s, 0.715+0.285*s, 0.072-0.072*s,
                    0.213-0.213*s, 0.715-0.715*s, 0.072+0.928*s];
  const sep = a => { const r = 1 - a; return [
    0.393+0.607*r, 0.769-0.769*r, 0.189-0.189*r,
    0.349-0.349*r, 0.686+0.314*r, 0.168-0.168*r,
    0.272-0.272*r, 0.534-0.534*r, 0.131+0.869*r]; };
  const rot = a => { const c = Math.cos(a*Math.PI/180), s = Math.sin(a*Math.PI/180); return [
    0.213+c*0.787-s*0.213, 0.715-c*0.715-s*0.715, 0.072-c*0.072+s*0.928,
    0.213-c*0.213+s*0.143, 0.715+c*0.285+s*0.140, 0.072-c*0.072-s*0.283,
    0.213-c*0.213-s*0.787, 0.715-c*0.715+s*0.715, 0.072+c*0.928+s*0.072]; };

  function passe(chaine, rgb) {
    let p = rgb.slice();
    for (const m of chaine.matchAll(/(hue-rotate|saturate|brightness|contrast|grayscale|sepia)\(([-\d.]+)/g)) {
      const v = parseFloat(m[2]);
      if (m[1] === 'brightness')    p = p.map(x => x * v);
      else if (m[1] === 'contrast') p = p.map(x => (x - 0.5) * v + 0.5);
      else p = mul(m[1] === 'saturate' ? sat(v) : m[1] === 'grayscale' ? sat(1 - v)
                 : m[1] === 'sepia' ? sep(v) : rot(v), p);
      p = p.map(cl);
    }
    return p;
  }
  const clarte = p => 0.213*p[0] + 0.715*p[1] + 0.072*p[2];

  const gris = jeu.CHROMAS.filter(c => c.hue === null);
  eq('quatre crans hors de la roue', gris.length, 4);

  const niveaux = [];
  for (const g of gris) {
    const f = jeu.filtreCouleur(g);

    /* LA TEINTE DU DESSIN DOIT ÊTRE EFFACÉE D'ABORD. Sans ça la chaîne garde un résidu de la
       bête, et le même nom rend deux couleurs selon la lignée — c'était le cas de la perle et
       de l'ardoise, à 0,21 l'une de l'autre entre un wukong et un kitsune. */
    ok(g.name + ' commence par tout effacer', /^grayscale\(1\)/.test(f), f);

    /* UNE COULEUR ET LE GRIS DE MÊME CLARTÉ DOIVENT SORTIR IDENTIQUES : c'est exactement ce
       que veut dire « la teinte du dessin ne compte pas ». Comparer deux couleurs entre elles
       ne dirait rien — n'ayant pas la même clarté, elles ont le droit de différer. */
    let derive = 0;
    for (const c of [[0.80, 0.20, 0.20], [0.20, 0.20, 0.80], [0.25, 0.70, 0.30]]) {
      const L = clarte(c);
      const a = passe(f, c), b = passe(f, [L, L, L]);
      derive = Math.max(derive, ...[0, 1, 2].map(i => Math.abs(a[i] - b[i])));
    }
    ok(g.name + ' rend la même chose quelle que soit la teinte d’origine', derive < 0.02,
       'dérive ' + derive.toFixed(3));

    let seuil = null, palier = 0, avant = null;
    for (let x = 0; x <= 1.0001; x += 0.02) {
      const p = passe(f, [x, x, x]);
      if (seuil === null && p.every(v => v > 0.99)) seuil = x;
      if (avant !== null && Math.abs(clarte(p) - avant) < 0.002) palier++;
      avant = clarte(p);
    }
    /* LA SUR-EXPOSITION SE CHIFFRE : c'est l'entrée à partir de laquelle plusieurs clartés
       différentes sortent au même blanc pur. Le blanc l'atteignait à 0,508 et la perle à
       0,708, quand les dessins montent à 0,884 — d'où 43 % du wukong aplatis sur une seule
       valeur. Au-delà de 0,90 le palier ne touche plus rien de ce qui est dessiné, et un
       sommet qui blanchit tout à fait n'est pas une faute : c'en est un de le faire avant. */
    ok(g.name + ' ne brûle pas dans la plage des dessins', seuil === null || seuil >= 0.90,
       'blanc pur dès ' + (seuil === null ? '—' : seuil.toFixed(2)));
    ok(g.name + ' garde du modelé sur toute la rampe', palier <= 4, palier + ' paliers sur 50');

    niveaux.push({ nom: g.name, l: clarte(passe(f, [0.5, 0.5, 0.5])) });
  }

  /* QUATRE CRANS QUI N'EN MONTRENT QUE TROIS SONT TROIS CRANS AVEC UN NOM DE TROP. Le blanc et
     la perle sortaient à 0,110 l'un de l'autre — quatre fois moins que les deux autres écarts,
     et sans différence de teinte pour rattraper. */
  niveaux.sort((a, b) => b.l - a.l);
  eq('du plus clair au plus sombre', niveaux.map(n => n.nom).join(' '), 'blanc perle ardoise onyx');
  for (let i = 0; i < niveaux.length - 1; i++) {
    const e = niveaux[i].l - niveaux[i+1].l;
    ok(niveaux[i].nom + ' et ' + niveaux[i+1].nom + ' se distinguent', e > 0.08, 'écart ' + e.toFixed(3));
  }

  /* L'ONYX NE DOIT PAS ÊTRE UN TROU. La pièce d'incubation est à `#0E1310`, soit 0,07 de
     clarté : une bête qui passerait entièrement sous ce niveau ne serait qu'un contour cerclé
     d'un halo. On regarde son point le plus clair, pas sa moyenne. */
  const onyx = gris.find(g => g.key === 'onyx');
  const sommet = clarte(passe(jeu.filtreCouleur(onyx), [0.884, 0.884, 0.884]));
  ok('l’onyx se lit encore sur la pièce', sommet > 0.15, 'sommet ' + sommet.toFixed(3) + ' contre 0,07');

  /* ── ET AUCUNE DES TRENTE-SIX NE BLANCHIT ─────────────────────────────────────
     La même faute vivait dans les tons de la roue. `clair` était `brightness(1.72)` : il
     blanchissait tout ce qui dépassait 0,576, et sur un crapaud — déjà pâle — ça faisait 60 %
     du dessin. Les huit recettes claires rendaient donc huit fois la même grenouille blanche à
     liseré coloré, ce qui est la façon la plus coûteuse de n'avoir qu'une couleur. Le `vif`
     blanchissait 32 % du même crapaud.

     LES DESSINS MONTENT À 0,884. Au-delà de 0,90, le palier ne touche plus rien de ce qui est
     peint — c'est le même seuil que pour les gris, et c'est le même défaut. */
  for (const c of jeu.CHROMAS) {
    const f = jeu.filtreCouleur(c);
    let blanchit = null;
    for (let x = 0.40; x <= 1.0001; x += 0.01) {
      if (passe(f, [x, x, x]).every(v => v > 0.99)) { blanchit = x; break; }
    }
    ok(c.name + ' ne blanchit pas dans la plage des dessins',
       blanchit === null || blanchit >= 0.90,
       'blanc pur dès ' + (blanchit === null ? '—' : blanchit.toFixed(2)));
  }

  /* LA TABLE ANNONCE UNE COULEUR, ON VÉRIFIE QU'ELLE LA REND. Les seize teintes de la roue
     étaient posées mécaniquement tous les 22,5°, ce qui donnait des couleurs timides et un
     écarlate qui n'était pas rouge : une couleur n'est pas qu'un angle, c'est aussi une clarté
     et une vivacité — l'or est clair, le grenat est sombre. Chacune porte donc son
     hexadécimal, et `node tools/couleurs.js` résout les quatre leviers qui y arrivent.

     C'EST CE SCÉNARIO QUI EMPÊCHE L'HEXADÉCIMAL DE DEVENIR UN COMMENTAIRE QUI MENT. Sans lui,
     les quatre nombres de `peindre()` seraient magiques et pourraient dériver de la couleur
     écrite à côté sans que rien ne le dise. Le champ `hue`, lui, ne décrit plus une couleur :
     il n'est que l'identité du cran, dont l'hérédité et les recettes se servent. */
  const hexVers = h => [parseInt(h.slice(1,3),16)/255, parseInt(h.slice(3,5),16)/255,
                        parseInt(h.slice(5,7),16)/255];
  const enHex = p => '#' + p.map(x => Math.round(x*255).toString(16).padStart(2,'0')).join('').toUpperCase();
  const distanceRGB = (a, b) => Math.sqrt(2*(a[0]-b[0])**2 + 4*(a[1]-b[1])**2 + (a[2]-b[2])**2);

  let pireEcart = 0, pire = '', comptees = 0;
  const rendues = [];
  for (const c of jeu.CHROMAS) {
    const f = jeu.filtreCouleur(c);
    ok(c.name + ' efface la teinte du dessin avant de peindre', /^grayscale\(1\)/.test(f), f);
    const p = passe(f, [0.5, 0.5, 0.5]);
    rendues.push({ nom: c.name, p });
    // les trente-six passent par la même porte depuis la 4.25.1, gris compris
    comptees++;
    const e = distanceRGB(p, hexVers(c.couleur));
    if (e > pireEcart) { pireEcart = e; pire = c.name + ' vise ' + c.couleur + ' et rend ' + enHex(p); }
  }
  eq('les trente-six portent leur hexadécimal', comptees, 36);
  ok('chacune rend la couleur qu’elle annonce', pireEcart <= 0.04,
     'pire : ' + pire + ' (' + pireEcart.toFixed(3) + ')');

  /* ET DEUX COULEURS DE LA TABLE NE SONT PAS LA MÊME COULEUR. C'est ce que l'écart régulier de
     22,5° garantissait sans le vouloir ; en choisissant les teintes à la main, on perd cette
     garantie mécanique et il faut la redemander. On compare le gris moyen peint, donc sans
     dépendre d'aucun dessin. */
  let plusProches = 99, paire = '';
  for (let i = 0; i < rendues.length; i++)
    for (let j = i + 1; j < rendues.length; j++) {
      const d = distanceRGB(rendues[i].p, rendues[j].p);
      if (d < plusProches) { plusProches = d; paire = rendues[i].nom + ' et ' + rendues[j].nom; }
    }
  ok('deux couleurs de la table ne se confondent pas', plusProches >= 0.10,
     paire + ' à ' + plusProches.toFixed(3));
});

scenario('couleur — la chaîne a une forme, et le halo n’est que le halo', () => {
  /* LA FAUTE DE LA 4.22.0, ET POURQUOI ELLE SE GARDE ICI. `PRODIGE_FILTER` commençait par
     `saturate(2.4) brightness(1.3)` — le `TON_FILTRE.vif` de la table, au mot près — et
     `filtreDe` colle les deux bouts. Chaque teinte vive partait donc au carré : saturate 5,76
     au lieu de 2,4, et les trois bruns du Sun Wukong tombaient sur le même magenta pur.

     ON COMPTE LES PRIMITIVES, PAS LES PIXELS. Un test qui regarderait la couleur de sortie
     figerait un réglage qu'on a le droit de tourner ; ce qu'on interdit, c'est qu'une même
     fonction soit énoncée deux fois dans une seule chaîne — parce que ça, ce n'est jamais
     voulu, quel que soit le réglage. */
  const jeu = neuf();
  /* LA CHAÎNE A UNE FORME, ET ELLE NE VARIE PAS. Ce scénario comptait les primitives et
     refusait qu'une même fonction paraisse deux fois — bonne règle pour la faute qu'il gardait
     (le ton énoncé deux fois, une fois dans la table et une fois dans le halo), mauvaise depuis
     que `peindre` porte DEUX `brightness` voulus : un avant le sépia pour l'empêcher d'écrêter,
     un après pour poser le niveau.

     ON VÉRIFIE DONC LA FORME PLUTÔT QUE LE COMPTE. Sept primitives, dans cet ordre, et rien
     d'autre : un bout recollé par erreur ne passe pas, un ordre inversé non plus — or l'ordre
     est tout, puisque descendre APRÈS avoir teinté ne rattrape aucun écrêtage. */
  const FORME = /^grayscale\(1\) brightness\([\d.]+\) sepia\([\d.]+\) hue-rotate\(-?[\d.]+deg\) saturate\([\d.]+\) contrast\([\d.]+\) brightness\([\d.]+\)$/;
  const informes = jeu.CHROMAS.filter(c => !FORME.test(jeu.filtreCouleur(c)))
                              .map(c => c.name + ' : ' + jeu.filtreCouleur(c));
  ok('les trente-six chaînes ont la même forme, dans le même ordre',
     informes.length === 0, informes.join('  |  '));

  // et le halo, lui, ne porte plus que le halo
  eq('le halo ne porte que le halo', jeu.PRODIGE_FILTER, 'drop-shadow(0 0 14px #E4A63E)');

  /* LE FILTRE D'UNE BÊTE EST LA COULEUR PLUS LE HALO, sans un mot de plus. C'est ce recollage
     qui avait produit le doublon de la `4.22.0` : les deux bouts portaient chacun le ton. */
  const recolle = jeu.CHROMAS.every((c, i) =>
    jeu.filtreDe({ prodige: true, chroma: i }) === jeu.filtreCouleur(c) + ' ' + jeu.PRODIGE_FILTER);
  ok('un chromatique porte sa couleur et son halo, rien d’autre', recolle);

  /* LE HALO RESTE EN DERNIER. `drop-shadow` prend l'alpha de ce qui le précède : placé avant
     la rotation, il serait teinté par elle et cesserait d'être le même halo pour les
     trente-six couleurs — or c'est justement son invariance qui dit « chromatique » de loin. */
  const dernier = jeu.CHROMAS.every((c, i) =>
    /drop-shadow\([^)]*\)$/.test(jeu.filtreDe({ prodige: true, chroma: i })));
  ok('et il ferme la chaîne, pour n’être teinté par rien', dernier);

  eq('une bête ordinaire n’a aucun filtre', jeu.filtreDe({ prodige: false, chroma: 3 }), '');
});
