/* ── L’ENCYCLOPÉDIE — ce qu’elle apprend, et quand */

'use strict';
const { scenario, ok, eq, neuf, noeuds, poserJetons, bete, seule, couple, fiche } = require('./_aides.js');

scenario('encyclopédie — une carte par lignée, et deux vues qui se répondent', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false;
  s.seen = { 'crapaud:1': 1, 'crapaud:2': 1, 'crabe:1': 1, 'loup:1': 1 };
  jeu.refresh();

  const host = noeuds.get('collection');
  const cartes = () => host.children.filter(n => (n.className || '').includes('dex-carte'));
  const sections = () => host.children.filter(n => (n.className || '').includes('coll-head'));
  const nom = c => c.children.map(x => x.textContent + x.children.map(y => y.textContent).join('')).join(' ');
  const onglet = v => document.querySelectorAll('.onglet').find(b => b.dataset.vue === v);

  /* UNE CARTE PAR LIGNÉE, ET NON PLUS UNE CASE PAR FORME. La grille de cent cinquante cases
     répondait bien à « combien m'en manque-t-il », mais elle ne se cliquait pas : cinq cases
     voisines menaient à la même fiche, et aucune ne portait de nom. */
  eq('une carte par lignée connue', cartes().length,
     jeu.LINES.filter(l => jeu.rareteConnue(l.rarity)).length);
  eq('un intertitre par rareté', sections().length, jeu.raretesConnues().length);
  ok('le compteur compte les formes', /4 \/ 160 formes/.test(noeuds.get('coll-meta').textContent),
     noeuds.get('coll-meta').textContent);

  const crapaud = cartes().find(c => c.dataset.lignee === 'crapaud');
  ok('une lignée croisée porte son nom', /Crapaud/.test(nom(crapaud)), nom(crapaud));
  eq('et ses cinq pastilles d’âge',
     crapaud.children.filter(x => (x.className || '').includes('dex-txt'))[0]
            .children.filter(x => (x.className || '').includes('dex-pips'))[0].children.length, 5);
  const kraken = cartes().find(c => c.dataset.lignee === 'kraken');
  ok('une lignée jamais vue n’a pas de nom', /？/.test(nom(kraken)), nom(kraken));
  ok('et se marque inconnue', kraken.className.includes('inconnue'));

  /* LES FILTRES REMPLACENT LE PLIAGE. Replier une rareté cachait ce qu'on ne voulait pas
     voir ; un filtre montre ce qu'on cherche, ce qui n'est pas la même chose. */
  const chips = () => noeuds.get('dex-filtres').children;
  eq('deux filtres, plus un par rareté connue',
     chips().length, 2 + jeu.raretesConnues().length);
  eq('« tout » est actif au départ', chips()[0].getAttribute('aria-pressed'), 'true');

  jeu.dexFiltre = 'rare';
  jeu.refresh();
  ok('le filtre ne garde que sa rareté',
     cartes().every(c => jeu.LINE_BY_KEY[c.dataset.lignee].rarity === 'rare'));
  eq('et un seul intertitre', sections().length, 1);

  jeu.dexFiltre = 'reste';
  jeu.refresh();
  ok('« incomplètes » écarte ce qui est plein',
     cartes().every(c => jeu.formesVues(c.dataset.lignee) < jeu.AGES.length));
  ok('et garde ce qui manque', cartes().some(c => c.dataset.lignee === 'crapaud'));

  jeu.dexFiltre = 'tout';
  jeu.refresh();

  /* LES DEUX VUES. La ferme d'un côté, l'encyclopédie de l'autre, et l'onglet ne se
     sauvegarde pas : on ouvre le jeu sur sa ferme, toujours. */
  eq('on démarre sur la ferme', jeu.vue, 'ferme');
  eq('et la vue de l’encyclopédie est cachée', noeuds.get('vue-dex').hidden, true);
  jeu.ouvrirVue('dex');
  eq('la bascule marche', jeu.vue, 'dex');
  eq('la vue s’ouvre', noeuds.get('vue-dex').hidden, false);
  eq('l’onglet se marque', onglet('dex').getAttribute('aria-pressed'), 'true');
  eq('et l’autre se relâche', onglet('ferme').getAttribute('aria-pressed'), 'false');
  jeu.ouvrirVue('ferme');
  eq('et retour', noeuds.get('vue-dex').hidden, true);

  /* CLIQUER UNE CARTE DÉPLACE LE REGARD, elle n'ouvre plus un écran modal : la fiche vit à
     côté de la liste. */
  jeu.encyLignee = 'crapaud';
  jeu.refresh();
  eq('la fiche suit', noeuds.get('ency-title').textContent, 'Crapaud');
  ok('et la carte se marque choisie',
     cartes().find(c => c.dataset.lignee === 'crapaud').className.includes('choisie'));

  // la collection n'est plus un panneau de la colonne : elle ne se replie plus
  ok('elle a quitté la liste des panneaux', !jeu.PANNEAUX.includes('collection'));
});

scenario('encyclopédie — un carnet, jamais un manuel', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15; s.pens = 40;

  /* ELLE NE CONNAÎT RIEN D'AVANCE. Une lignée jamais rencontrée n'a pas de nom, pas de
     formes, pas de variantes : la fiche le dit et s'arrête là. */
  const vide = fiche(jeu, 'kraken');
  eq('pas de nom', vide.titre, '？');
  ok('la fiche le dit', /jamais rencontré/.test(vide.dit), vide.dit);
  eq('et ne montre que les cinq silhouettes', vide.blocs.length, 1);
  ok('aucun nom de forme ne fuit', !/Kraken|Poulpe/i.test(vide.tout), vide.tout);

  /* UNE ÉCLOSION APPREND UNE VARIANTE, ET SEULEMENT CELLE-LÀ. */
  const c = bete(jeu, 'loup', 1, 0);
  const d = jeu.dexVu('loup');
  ok('le carnet s’ouvre à la première éclosion', !!d);
  eq('une éclosion comptée', d.nes, 1);
  eq('son caractère est noté', d.caracteres[c.temper], 1);
  eq('son motif aussi', d.motifs[c.motif], 1);
  /* UNE BÊTE GRISE N'A PAS DE COULEUR À NOTER. Le carnet compte les CHROMATISMES CROISÉS, et
     une bête sur huit mille en est un : le carnet reste donc vide sur cette rangée pendant
     des heures, et c'est exactement ce que le rang veut dire depuis que les teintes ont
     disparu. Ce qui se compte est ce qu'on a rencontré, pas ce que la bête porte en latence. */
  eq('mais sa couleur latente ne compte pas', Object.keys(d.chromas).length, 0);

  const f = fiche(jeu, 'loup');
  eq('la lignée a un nom', f.titre, 'Loup');
  ok('une seule forme rencontrée', /1 forme sur 5/.test(f.dit), f.dit);
  ok('les quatre autres restent des points d’interrogation',
     (f.tout.match(/？/g) || []).length >= 4, f.tout);
  ok('le compte des chromatismes dit ce qui manque',
     new RegExp('Chromatismes — 0 / ' + jeu.CHROMAS.length).test(f.tout), f.tout);

  /* DEUX CHROMATIQUES DE LA MÊME COULEUR COMPTENT DEUX FOIS, ils ne se dédoublent pas. */
  jeu.noterEclosion({ line: 'loup', chroma: 3, prodige: true, temper: c.temper, motif: c.motif });
  eq('un chromatique se note', jeu.dexVu('loup').chromas[3], 1);
  jeu.noterEclosion({ line: 'loup', chroma: 3, prodige: true, temper: c.temper, motif: c.motif });
  eq('le compte monte', jeu.dexVu('loup').chromas[3], 2);
  eq('et l’éclosion aussi', jeu.dexVu('loup').nes, d.nes);
});

scenario('encyclopédie — la pension s’apprend ponte par ponte', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15;
  const [a, b] = couple(jeu, 'loup', 'ours');

  const avant = fiche(jeu, 'loup');
  ok('aucun couple connu au départ', /0 couple connu/.test(avant.tout), avant.tout);
  ok('et la fiche dit quoi faire', /Confie-en deux/.test(avant.tout), avant.tout);

  jeu.accoupler(a, b);
  jeu.avancePension(jeu.dureePension(a, b) * 3);
  const apres = fiche(jeu, 'loup');

  /* ON N'APPREND QUE CE QUI EST VRAIMENT SORTI. Le carnet ne déduit rien d'une table de
     règles : un couple qui n'a jamais donné cette lignée n'y figure pas. */
  const dLoup = jeu.dexVu('loup'), dOurs = jeu.dexVu('ours');
  const total = (dLoup.couples['loup×ours'] || 0) + (dOurs.couples['loup×ours'] || 0);
  eq('les trois pontes sont réparties entre les deux fiches', total, 3);
  ok('la paire est triée, donc écrite une seule fois',
     !dLoup.couples['ours×loup'] && !dOurs.couples['ours×loup']);

  const qui = dLoup.couples['loup×ours'] ? 'loup' : 'ours';
  const vue = fiche(jeu, qui);
  ok('le couple apparaît', /Loup × Ours/.test(vue.tout), vue.tout);
  ok('avec son pourcentage', /50 %/.test(vue.tout), vue.tout);
  ok('sa durée', /1 h/.test(vue.tout), vue.tout);
  ok('et le nombre de fois', /sorti \d+ fois/.test(vue.tout), vue.tout);

  /* LE POURCENTAGE SE CALCULE, IL NE SE STOCKE PAS : un nœud pris après coup ne doit pas
     laisser dans le carnet un nombre qui n'est plus vrai. Le sang dominant est monté dans la
     constellation avec le reste de la pension — c'est le troisième cran de l'axe. */
  const cr = bete(jeu, 'crapaud', 4, 20000), ou = bete(jeu, 'ouroboros', 4, 20000);
  jeu.dexDe('crapaud').couples['crapaud×ouroboros'] = 1;
  ok('sans le sang, la commune sort presque toujours',
     /99 %/.test(fiche(jeu, 'crapaud').tout), fiche(jeu, 'crapaud').tout);
  /* LE SANG DOMINANT TIENT À UN NŒUD DU TRONC, et non plus au troisième cran d'une
     échelle : c'est une chose, pas un degré. */
  s.ciel = { nid: true, 'sang-epais': true };
  jeu.oublierPrimes();
  ok('le sang épais est pris', jeu.etoilePrise('sang-epais'));
  eq('et le sang double la chance', jeu.chancePension(3), 0.02);
  ok('avec, le chiffre a bougé tout seul',
     /98 %/.test(fiche(jeu, 'crapaud').tout), fiche(jeu, 'crapaud').tout);
});

scenario('encyclopédie — la chance annoncée est celle du tirage', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e15; s.pens = 40; s.ciel = Object.assign(s.ciel || {}, { nid: 1 });

  /* `chanceDe` DOUBLE la logique du tirage, et deux copies peuvent diverger en silence.
     On tire donc pour de vrai et on compare, sur les trois formes de couple : ordinaire,
     recette, joker. */
  const N = 60000;
  for (const [x, y] of [['loup', 'ours'], ['crapaud', 'ouroboros'],
                        ['golem', 'golem'], ['chimere', 'chimere']]) {
    const a = bete(jeu, x, 4, 20000), b = bete(jeu, y, 4, 20000);
    const rec = jeu.recetteDe(a, b);
    const compte = {};
    for (let i = 0; i < N; i++) {
      const r = rec && Math.random() < rec.chance ? rec.donne : jeu.ligneeDe(a, b);
      compte[r] = (compte[r] || 0) + 1;
    }
    let somme = 0;
    for (const [r, n] of Object.entries(compte)) {
      const annonce = jeu.chanceDe(x, y, r), observe = n / N;
      somme += annonce;
      ok(x + ' × ' + y + ' → ' + r + ' : ' + (annonce * 100).toFixed(2) + ' % annoncé',
         Math.abs(annonce - observe) < Math.max(0.006, annonce * 0.25),
         'observé ' + (observe * 100).toFixed(2) + ' %');
    }
    ok(x + ' × ' + y + ' : les chances des issues vues font presque un',
       somme > 0.9 && somme <= 1.001, somme.toFixed(3));
  }
});

scenario('encyclopédie — elle traverse l’ascension, et une partie d’avant la reçoit vide', () => {
  const jeu = neuf(); const s = jeu.state;
  s.tuto = false; s.coins = 1e12; s.pens = 8;
  bete(jeu, 'loup', 1, 0);
  eq('le carnet a une entrée', Object.keys(s.dex).length, 1);

  poserJetons(jeu, 1);
  jeu.ascensionner();
  /* C'est une mémoire de FICHIER, comme la collection : l'ascension efface la ferme, jamais
     ce qu'on a appris. */
  eq('elle a traversé', Object.keys(jeu.state.dex).length, 1);
  ok('avec son contenu', jeu.dexVu('loup').nes >= 1);

  // une partie d'avant la 1.9 n'a pas de carnet : il naît vide, sans migration à écrire
  const vieux = JSON.parse(JSON.stringify(jeu.state));
  delete vieux.dex;
  const k = neuf(vieux);
  eq('le carnet naît vide', JSON.stringify(k.state.dex), '{}');
  const c = bete(k, 'crapaud', 1, 0);
  eq('et se remplit dès la première éclosion', k.dexVu('crapaud').nes, 1);
});
