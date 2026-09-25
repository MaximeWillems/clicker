/* ── LE SOCLE — le démarrage, les noms, les pages d’outil, la mise en page */

'use strict';
const fs = require('fs');
const path = require('path');
const { scenario, ok, eq, neuf, noeuds, inconnus, RACINE, lire, brut, bete, seule } = require('./_aides.js');

scenario('démarrage — chaque id demandé existe dans index.html', () => {
  const jeu = neuf();
  ok('aucun id manquant', inconnus.length === 0, inconnus.join(', '));
  ok('version au format « mot X.Y.Z »', /^(alpha|beta) \d+\.\d+\.\d+$/.test(jeu.VERSION), jeu.VERSION);
  ok('numéro de sauvegarde entier', Number.isInteger(jeu.SAVE_V));
});

scenario('la boucle — œuf, éclosion, croissance, maturité, vente', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  eq('un œuf offert au départ', s.incub.filter(Boolean).length, 1);
  s.incub[0].p = 9999; jeu.hatchAll();
  eq('une bête après éclosion', s.pen.length, 1);
  const c = s.pen[0];
  eq('elle naît au niveau 1', jeu.niveau(c), 1);
  ok('elle n’est pas mûre', !jeu.estMur(c));
  c.p = jeu.bandTo(c);
  ok('au bout de sa tranche elle est mûre', jeu.estMur(c));
  const avant = s.coins;
  jeu.sell(c);
  ok('la vente rapporte', s.coins > avant, s.coins);
  eq('l’enclos se vide', s.pen.length, 0);
});

scenario('noms — aucun ne reprend un mot d’âge ni de taille', () => {
  const jeu = neuf();
  const mots = new Set();
  jeu.AGES.forEach(a => mots.add(a.nom));
  jeu.RANKS.forEach(r => { if (r.name) mots.add(r.name); if (r.fem) mots.add(r.fem); });
  const racine = m => m.replace(/(esque|ale?|es?|s)$/, '').slice(0, 6).toLowerCase();
  const sansAccent = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const racines = [...mots].map(racine).map(sansAccent);
  let noms = 0;
  for (const l of jeu.LINES) l.forms.forEach((f, i) => {
    noms++;
    for (const mot of sansAccent(f[0]).split(/[^a-z]+/)) {
      if (mot.length < 4) continue;
      const heurt = racines.find(r => mot.startsWith(r) || r.startsWith(mot));
      ok('« ' + f[0] + ' » (' + l.name + ', âge ' + (i + 1) + ') reprend « ' + heurt + ' »', !heurt);
    }
  });
  eq('noms vérifiés', noms, jeu.LINES.length * jeu.AGES.length);
});

scenario('illustrations — chaque fichier cité par ART existe', () => {
  const src = lire('game.js');
  const fichiers = [...src.matchAll(/'([a-z0-9-]+-[1-5]-[a-z0-9-]+\.png)'/g)].map(m => m[1]);
  ok('la table ART n’est pas vide', fichiers.length > 0, fichiers.length);
  for (const f of fichiers) {
    ok('art/' + f + ' manque', fs.existsSync(path.join(RACINE, 'art', f)));
  }
});

scenario('atelier — la page générée s’exécute, et elle pose de vraies images', () => {
  /* LA PAGE N’ÉTAIT VÉRIFIÉE PAR RIEN, et ça s’est vu : en retirant un bloc devenu inutile,
     la constante voisine est partie avec, et la page ne dessinait plus une seule bête —
     `TAILLES_BANDE is not defined`, à la première ligne de la première boucle. Le générateur
     tournait sans broncher : il écrit du texte, il ne le fait pas tourner.

     ON EXÉCUTE DONC LE SCRIPT DE LA PAGE, contre un DOM de fortune. Ce n’est pas un
     navigateur — rien ici ne dit si c’est joli — mais ça dit si ça MARCHE, et c’était le
     seul mode de panne qu’aucun scénario ne pouvait voir. */
  const page = lire('tools/atelier.html');
  const code = (page.match(/<script>([\s\S]*?)<\/script>/) || [])[1];
  ok('la page porte bien un script', !!code && code.length > 500, code ? code.length : 0);

  /* Le DOM de fortune. Il ne fait que ce que la page demande, et pas une ligne de plus : un
     faux DOM complet serait un deuxième navigateur à maintenir. */
  const noeuds = new Map();
  const neufNoeud = () => {
    const n = {
      enfants: [], className: '', textContent: '', title: '', alt: '', src: null,
      value: undefined, checked: false, attributs: {},
      style: new Proxy({ setProperty(k, v) { this[k] = v; } }, {}),
      appendChild(e) { this.enfants.push(e); if (this.value === undefined && e.value !== undefined) this.value = e.value; return e; },
      append(...e) { e.forEach(x => this.appendChild(x)); },
      addEventListener() {},
      setAttribute(k, v) { this.attributs[k] = v; if (k === 'src') this.src = v; },
      querySelector() { return null; },
    };
    return n;
  };

  /* Les valeurs de départ viennent du BALISAGE, pas d’une supposition : un curseur dont la
     valeur initiale change dans le HTML doit casser ici si le script ne suit pas. */
  const depart = id => {
    const balise = new RegExp('<[^>]*id="' + id + '"[^>]*>').exec(page);
    if (!balise) return {};
    const v = /value="([^"]*)"/.exec(balise[0]);
    const coche = /\bchecked\b/.test(balise[0]);
    if (v) return { value: v[1], checked: coche };
    // un select prend la valeur de sa première option
    if (!/^<select/.test(balise[0])) return { checked: coche };
    /* Cherchée DANS ce select, et non n’importe où ensuite : sans la borne, la liste des
       lignées héritait de l’option du menu des fonds, et la page entière partait sur un
       indice qui n’existe pas. */
    const debut = page.indexOf(balise[0]) + balise[0].length;
    const suite = page.slice(debut, page.indexOf('</select>', debut));
    const opt = /<option value="([^"]*)"/.exec(suite);
    return opt ? { value: opt[1], checked: coche } : { checked: coche };
  };

  const document = {
    getElementById(id) {
      if (!noeuds.has(id)) { const n = neufNoeud(); Object.assign(n, depart(id)); noeuds.set(id, n); }
      return noeuds.get(id);
    },
    createElement() { return neufNoeud(); },
    body: neufNoeud(),
  };

  let boum = null;
  try { new Function('document', code)(document); } catch (e) { boum = e.message; }
  ok('le script tourne sans exploser', boum === null, boum);

  // ── et il a réellement produit quelque chose ────────────────────────────────
  const toutes = [];
  (function descendre(n) { for (const e of n.enfants) { toutes.push(e); descendre(e); } })(document.body);
  for (const id of ['at-couleurs', 'at-bande', 'at-ages', 'at-fonds', 'at-tailles'])
    (function descendre(n) { for (const e of n.enfants) { toutes.push(e); descendre(e); } })(document.getElementById(id));

  const images = toutes.filter(n => n.src);
  ok('la page pose des images', images.length >= 36, images.length + ' images');

  const filtrees = images.filter(n => n.style.filter);
  ok('les couleurs sont bien appliquées', filtrees.length >= 36, filtrees.length + ' images filtrées');

  /* CHAQUE SOURCE DOIT EXISTER SUR LE DISQUE. La page cite les dessins en chemin relatif depuis
     `tools/` ; une lignée renommée casserait la page en silence. */
  const manquants = [...new Set(images.map(n => n.src))]
    .filter(src => !fs.existsSync(path.join(RACINE, 'tools', src)));
  ok('aucun dessin cité n’est absent', manquants.length === 0, manquants.join(', '));
});

scenario('pages d’outil — celle qui cite style.css reprend son défilement', () => {
  /* LA FAUTE DE LA PLANCHE ET DE L’ATELIER, DEUX FOIS DE SUITE. `style.css` pose une mise en
     page « application » sur le `body` — `height: 100vh`, `overflow: hidden`, une grille à
     deux colonnes — pour que le jeu ne défile pas sous la barre espace. Une page d’outil qui
     cite cette feuille hérite du cadre : tout ce qui suit le premier écran devient
     inatteignable, et les sections se rangent en silence dans la colonne de 21 rem.

     ET ÇA NE SE VOIT QU’AU-DESSUS DE 62 REM DE LARGE, parce qu’en dessous `style.css` rend
     lui-même le défilement pour son affichage étroit. Une page coupée sur grand écran et
     correcte sur petit : personne ne va chercher ça dans une feuille qu’il ne fait que lier.
     D’où ce scénario plutôt qu’un troisième oubli. */
  const pages = fs.readdirSync(path.join(RACINE, 'tools')).filter(f => f.endsWith('.html'));
  ok('il y a des pages d’outil à vérifier', pages.length > 0, pages.join(', '));
  for (const f of pages) {
    const h = lire('tools/' + f);
    if (!/href="\.\.\/style\.css"/.test(h)) continue;   // une page qui ne cite rien n’hérite de rien
    ok(f + ' lie le filet', /href="outil\.css"/.test(h));
    ok(f + ' porte la classe outil sur son body', /<body class="[^"]*\boutil\b/.test(h));
  }

  /* ET LE FILET DIT BIEN LES TROIS CHOSES QU’IL DOIT DIRE. Le lier sans qu’il rende le
     défilement ne servirait à rien, et c’est le genre de fichier qu’on vide en le rangeant. */
  const filet = lire('tools/outil.css');
  for (const regle of ['display: block', 'height: auto', 'overflow: visible'])
    ok('outil.css rend « ' + regle + ' »', filet.includes(regle));
});

scenario('style — la feuille tient debout, et la carte flotte sans rien pousser', () => {
  /* RIEN NE RELISAIT LE CSS. C'est le seul fichier du dépôt qu'aucun scénario n'ouvrait, et
     une accolade fermante orpheline y dormait depuis la `beta 2.0.0` — une de trop, juste
     après un bloc `@media`. Un navigateur la saute sans rien dire ; c'est exactement le genre
     de faute qui ne se voit que le jour où elle emporte la règle suivante.

     LA GARDE EST BÊTE ET C'EST SA FORCE : on compte les accolades hors commentaires, et le
     compte ne doit jamais passer sous zéro en chemin — un solde final nul se laisserait berner
     par une fermante de trop suivie d'une ouvrante de trop. */
  const brut = lire('style.css');
  const css = brut.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  let n = 0, plancher = 0, ligne = 1, coupable = 0;
  for (const c of css) {
    if (c === '\n') ligne++;
    else if (c === '{') n++;
    else if (c === '}') { n--; if (n < plancher) { plancher = n; coupable = ligne; } }
  }
  eq('autant d’ouvrantes que de fermantes', n, 0);
  eq('et jamais une fermante en avance', plancher, 0, coupable ? 'ligne ' + coupable : '');

  /* LA CARTE DE DÉTAIL FLOTTE AU-DESSUS DU CIEL. Posée en colonne à côté de l'arbre, elle
     prenait dix-neuf rems au canevas à chaque ouverture : la constellation se rétrécissait
     sous l'œil au moment précis où on la lisait, et tout ce qu'on visait glissait de place.
     Un panneau de lecture ne déplace pas ce qu'on lit. */
  const bloc = cle => {
    const i = css.indexOf(cle + ' {');
    ok(cle + ' a une règle', i >= 0);
    return i < 0 ? '' : css.slice(i, css.indexOf('}', i));
  };
  ok('la carte est en surimpression', /position:\s*absolute/.test(bloc('.ciel-carte')),
     bloc('.ciel-carte'));
  ok('le plan lui sert de repère', /position:\s*relative/.test(bloc('.ciel-plan')),
     bloc('.ciel-plan'));
  ok('et elle passe par-dessus le ciel', /z-index:\s*[1-9]/.test(bloc('.ciel-carte')));
  /* SI ELLE REDEVENAIT UN ÉLÉMENT DE FLUX, le plan la remettrait en colonne : c'est cette
     ligne-là qu'il ne faut pas laisser revenir. */
  ok('le plan ne lui réserve aucune largeur',
     !/\.ciel-plan\s*\{[^}]*grid-template-columns/.test(css));

  /* L'ARBRE GARDE SON PROPRE `relative` : le canevas SVG se place dedans en absolu, et le lui
     retirer ferait tomber tout le ciel dans le coin de la page. */
  ok('l’arbre reste le repère de son canevas', /position:\s*relative/.test(bloc('.ciel-arbre')));

  /* ET TOUT IDENTIFIANT POSÉ DANS LA PAGE EXISTE DANS LA FEUILLE, pour la carte au moins :
     une classe écrite dans `index.html` et jamais stylée est une boîte blanche sur fond noir. */
  const html = lire('index.html');
  const classes = [...html.matchAll(/class="(ciel-carte[^"]*)"/g)].map(m => m[1].split(/\s+/)[0]);
  for (const c of [...new Set(classes)]) {
    ok('« ' + c + ' » est stylée', css.indexOf('.' + c) >= 0);
  }
});

scenario('dévoilement — l’escalier suit les prix, pas l’ordre des tables', () => {
  const jeu = neuf();
  const prix = jeu.CLES_VOIR.map(jeu.prixVoir);
  for (let i = 1; i < prix.length; i++) {
    ok('marche ' + i + ' moins chère que la précédente (' + prix[i] + ' après ' + prix[i - 1] + ')',
       prix[i] >= prix[i - 1]);
  }
  const jeu2 = neuf();
  jeu2.state.coins = 0; jeu2.refresh();
  ok('à zéro pièce, l’œuf commun n’est pas encore dévoilé', !jeu2.estDevoile('egg-commun'));
  jeu2.state.coins = jeu2.prixOeuf(jeu2.EGG_BY_KEY.commun);
  jeu2.refresh();
  ok('il s’ouvre quand on a de quoi', jeu2.estDevoile('egg-commun'));
});

scenario('interface — elle se déplie au rythme du joueur', () => {
  const jeu = neuf(); const s = jeu.state;
  const vu = id => !noeuds.get(id).hidden;
  const ongletDex = () => document.querySelectorAll('.onglet').find(b => b.dataset.vue === 'dex');
  bete(jeu);
  s.pens = 1; s.incubators = 1; s.seen = {}; s.up = { clic: 0, couveuse: 0, eleveur: 0, mangeoire: 0 };
  jeu.refresh();
  ok('pas de tri pour un seul enclos', !vu('strip-tri'));
  ok('pas de compteur « 1 / 1 »', !vu('compte-pen'));
  ok('pas de ligne de boosts sans automate', !vu('stage-boost'));
  ok('pas d’encyclopédie vide', ongletDex().hidden);

  s.pens = 2; s.incubators = 2; s.up.couveuse = 3;
  s.seen = { a: 1, b: 1, c: 1 };
  jeu.refresh();
  ok('le tri arrive au deuxième enclos', vu('strip-tri'));
  ok('les compteurs aussi', vu('compte-pen') && vu('compte-incub'));
  ok('la ligne de boosts avec le premier automate', vu('stage-boost'));
  ok('l’encyclopédie avec trois formes', !ongletDex().hidden);

  s.tuto = false; s.pens = 1; s.incubators = 1; s.seen = {}; s.up.couveuse = 0;
  jeu.refresh();
  ok('mode histoire éteint : tout se relève d’un coup',
     vu('strip-tri') && vu('compte-pen') && vu('stage-boost') && !ongletDex().hidden);
});

scenario('écran — les six panneaux se replient, et ça tient au rechargement', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  jeu.refresh();
  const plie = cle => noeuds.get('panel-' + cle).classList.contains('plie');

  ok('rien n’est replié au départ', jeu.PANNEAUX.every(c => !plie(c)));
  for (const cle of jeu.PANNEAUX) {
    jeu.plier(cle);
    ok('« ' + cle + ' » se replie', plie(cle));
  }
  ok('les six sont repliés', jeu.PANNEAUX.every(plie));

  jeu.save(); jeu.load(); jeu.refresh();
  ok('et ça tient au rechargement', jeu.PANNEAUX.every(plie));

  jeu.plier('boutique');
  ok('on en rouvre un seul', !plie('boutique'));
  ok('les cinq autres restent fermés', jeu.PANNEAUX.filter(c => c !== 'boutique').every(plie));
});

scenario('réglages — des segments plutôt que des menus', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  s.primes.marchand = true; s.primes.evolution = true; s.primes.acheteur = true;
  jeu.refresh();

  const seg = id => noeuds.get(id);
  const choisi = id => (seg(id).children.find(b => b.getAttribute('aria-pressed') === 'true') || {}).dataset;
  const dit = id => noeuds.get(id + '-d').textContent;

  /* UN MENU CACHE SES OPTIONS : il faut l'ouvrir pour savoir ce qu'on peut choisir, et le
     refermer pour voir ce qu'on a choisi. Un segment montre les deux d'un coup. */
  eq('un segment par rareté et par consigne',
     jeu.REGLAGES.length * Object.keys(jeu.RARITY).length, 10);
  for (const r of jeu.REGLAGES)
    for (const cle of Object.keys(jeu.RARITY)) {
      const id = r.cle + '-' + cle;
      ok(id + ' existe', !!seg(id));
      eq(id + ' — une pastille par option', seg(id).children.length, r.options().length);
      ok(id + ' — la première est « ne rien faire »', seg(id).children[0].dataset.v === '0');
      eq(id + ' — rien de choisi hors zéro au départ', choisi(id).v, '0');
    }

  /* LA TABLE DÉCIDE DE TOUT : les libellés par rareté étaient écrits en dur quinze fois dans
     index.html, et ajouter la cinquième rareté avait demandé d'y revenir à la main. */
  ok('la merveilleuse a ses rangées sans qu’on les ait écrites',
     !!seg('vente-merveilleuse') && !!seg('evolution-merveilleuse'));
  /* LA TAILLE EXIGÉE EST PARTIE AVEC LE BARÈME UNIQUE : la taille ne se vend plus, elle se défait
     en poussière au saut, et attendre qu'une bête grossisse avant de la vendre ne ferait que
     bloquer l'enclos. */
  ok('plus de consigne de taille', !jeu.REGLAGES.some(r => r.cle === 'taille') && !seg('taille-commune'));

  // choisir se fait à l'état, et l'écran suit
  s.sellAt.commune = 3;
  jeu.refresh();
  eq('la pastille suit l’état', choisi('vente-commune').v, '3');
  ok('et la phrase dit le prix', /adulte/.test(dit('vente-commune')) && /1 000/.test(dit('vente-commune')),
     dit('vente-commune'));

  /* LE PRIX EST CELUI D'AUJOURD'HUI, primes comprises. Le menu annonçait la valeur de base et
     ne bougeait jamais : une consigne qui ment de trente pour cent ne se règle pas. */
  s.primes['negoce-commune'] = true; s.primes['valeur-4'] = true;
  jeu.oublierPrimes();
  jeu.refresh();
  ok('le négoce et le renom entrent dans le chiffre', /1 500/.test(dit('vente-commune')),
     dit('vente-commune'));

  s.evolveUpTo.rare = 5;
  jeu.refresh();
  const avant = dit('evolution-rare');
  s.primes.intendance = true;
  jeu.oublierPrimes();
  jeu.refresh();
  ok('l’intendance baisse la facture affichée', dit('evolution-rare') !== avant,
     avant + ' → ' + dit('evolution-rare'));

  // l'acheteur a la sienne, sans rareté, et son « jamais » en tête
  eq('cinq pastilles pour l’acheteur', seg('sel-acheteur').children.length, jeu.OEUFS_VENDUS.length + 1);
  eq('la première est vide', seg('sel-acheteur').children[0].dataset.v, '');
  s.buyKind = '';
  jeu.refresh();
  ok('arrêté, la phrase le dit', /arrêté/.test(dit('sel-acheteur')), dit('sel-acheteur'));
  s.buyKind = 'rare';
  jeu.refresh();
  ok('et sinon elle nomme l’œuf', /rare/.test(dit('sel-acheteur')), dit('sel-acheteur'));

  // plus un seul menu déroulant dans la page
  ok('index.html n’a plus de select', !/<select/.test(lire('index.html')));
});

scenario('colonne — la réserve ne pousse plus le texte de la boutique', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  jeu.refresh();

  const r = jeu.refs.shop['egg-commun'];
  ok('la rangée existe', !!r);

  /* CE QUI CLIGNOTAIT. « En réserve : 3. » vivait au bout de la DESCRIPTION, une ligne qui se
     replie : passer de 2 à 3 œufs pouvait faire gagner ou perdre une ligne au bouton, donc
     décaler tout ce qui est en dessous. Le compte change plusieurs fois par minute. */
  s.eggs.commun = 0;
  jeu.refresh();
  const desc0 = r.desc.textContent;
  eq('la réserve vide n’affiche rien', r.reserve.textContent, '');

  s.eggs.commun = 3;
  jeu.refresh();
  eq('la réserve a sa propre case', r.reserve.textContent, '×3');
  eq('et la description n’a pas bougé', r.desc.textContent, desc0);

  s.eggs.commun = 47;
  jeu.refresh();
  eq('même à deux chiffres', r.reserve.textContent, '×47');
  eq('la description ne bouge toujours pas', r.desc.textContent, desc0);

  /* CE QU'UN ŒUF RACONTE NE SE RACONTE QU'UNE FOIS : la phrase de saveur occupait une ligne
     de la colonne pour toujours. Elle est à l'infobulle, la rangée tient sur une ligne. */
  eq('la rangée d’un œuf n’a plus de description', desc0, '');
  ok('mais elle est toujours lisible', /commence/.test(r.el.title), r.el.title);

  // une rangée qui n'est pas un œuf garde la sienne : elle ne porte aucun compteur
  const inc = jeu.refs.shop.incub;
  ok('l’incubateur garde sa description', inc.desc.textContent.length > 0, inc.desc.textContent);
  eq('et n’affiche aucune réserve', inc.reserve.textContent, '');
});

scenario('colonne — les réglages gardent leurs titres, et plus une ligne d’explication', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12;
  s.primes.acheteur = true; s.primes.evolution = true; s.primes.marchand = true;
  jeu.refresh();

  /* CE QUI RESTE DANS LE PANNEAU : trois titres et leurs segments. La revente était la dernière
     explication ; elle est tombée avec les autres — ce qu'on règle se lit sur les pastilles. */
  const titres = document.querySelectorAll('.config-step');
  eq('trois titres', titres.length, 3);
  eq('plus une ligne d’explication', document.querySelectorAll('.config-what').length, 0);

  // les segments restent : c'est ce qu'on règle, et ce n'est pas du texte
  ok('l’acheteur garde son segment', noeuds.get('reg-acheteur').children.length > 0);
  ok('l’évolution aussi', noeuds.get('reg-evolution').children.length > 0);
  ok('le marchand aussi', noeuds.get('reg-vente').children.length > 0);
});
