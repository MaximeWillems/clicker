/* ── L'ATELIER ─────────────────────────────────────────────────────────────────
       node tools/atelier.js        → tools/atelier.html

   Une page pour REGARDER une lignée dans toutes ses variantes — les trente-six couleurs, les
   cinq âges, les huit fonds, les six tailles. Elle répond à la seule question qu'aucun
   scénario ne peut poser : est-ce que ça se distingue à l'œil, et à vingt-quatre pixels ?

   ELLE EST GÉNÉRÉE, ET C'EST L'INVERSE DE LA PLANCHE. La planche est écrite à la main parce
   qu'elle montre du BALISAGE — ce que `game.js` produit, et qu'il faut pouvoir comparer à ce
   qu'il produit vraiment. L'atelier montre des DONNÉES : trente-six couleurs, trente lignées,
   huit fonds. Les recopier à la main serait garantir qu'elles dérivent au premier ajout, et
   personne ne s'en apercevrait — un tableau de couleurs périmé ressemble à un tableau de
   couleurs.

   Elle passe donc par le banc, qui fait tourner `game.js` sous Node : les tables lues sont
   les VRAIES, jusqu'au filtre CSS de chaque couleur, calculé par la fonction du jeu. */

'use strict';
const fs = require('fs');
const path = require('path');
const { neuf } = require('./banc.js');

const jeu = neuf();
const { LINES, CHROMAS, FONDS, RANKS, AGES, RARITY } = jeu;

/* ON EMPORTE LE FICHIER DE DESSIN DE CHAQUE ÂGE, pas la table `ART` : `artAt` porte la règle
   du repli — un âge sans dessin reprend celui du précédent, sauf si un `null` écrit dit
   « celui-là, on ne l'a pas dessiné ». Recopier la table perdrait la règle. */
const lignees = LINES.map(l => ({
  key: l.key, nom: l.name, rarete: l.rarity,
  formes: l.forms.map((f, i) => ({
    nom: f[0], emoji: f[1], art: jeu.artAt(l.key, i + 1),
  })),
}));

const couleurs = CHROMAS.map(c => ({
  nom: c.name,
  famille: c.hue === null ? 'gris' : c.ton === 'vif' ? 'roue' : 'recette',
  filtre: jeu.filtreCouleur(c) + ' ' + jeu.PRODIGE_FILTER,
}));

const fonds = FONDS.map(f => ({ key: f.key, nom: f.nom, sens: f.sens, n: f.n }));
const tailles = RANKS.map((r, i) => ({ nom: r.name || 'ordinaire', at: r.at, i }));
const ages = AGES.map(a => a.nom);

const donnees = JSON.stringify({ lignees, couleurs, fonds, tailles, ages }, null, 0);

const page = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Éclosion — l'atelier</title>

<!-- LE VRAI STYLE ET LES VRAIS DESSINS. Les fonds sont des classes de \`style.css\` : les
     reproduire ici les ferait diverger au premier réglage. -->
<link rel="stylesheet" href="../style.css">

<style>
  body.at { margin: 0; padding: 0 0 4rem; background: var(--ground); color: var(--ink);
            font-family: var(--f-ui); }
  .at-tete { position: sticky; top: 0; z-index: 50; background: var(--sunken);
             border-bottom: 1px solid var(--rule); padding: .9rem 1.2rem; }
  .at-tete h1 { margin: 0 0 .25rem; font-family: var(--f-name); font-size: 1.15rem; font-weight: 400; }
  .at-tete p { margin: 0 0 .6rem; color: var(--soft); font-size: .78rem; line-height: 1.6; max-width: 78ch; }
  .at-cmd { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }
  .at-cmd select, .at-cmd label { font-family: var(--f-num); font-size: .74rem; }
  .at-cmd select { background: var(--raised); color: var(--ink); border: 1px solid var(--rule);
                   border-radius: 4px; padding: .25rem .4rem; }
  .at-cmd label { color: var(--faint); display: flex; align-items: center; gap: .3rem; }
  .at-sec { padding: 1.6rem 1.2rem 0; }
  .at-sec > h2 { font-family: var(--f-name); font-weight: 400; font-size: 1rem; margin: 0 0 .2rem; }
  .at-sec > p { margin: 0 0 .9rem; color: var(--soft); font-size: .76rem; max-width: 72ch; line-height: 1.6; }
  .at-grille { display: flex; flex-wrap: wrap; gap: .8rem; align-items: flex-start; }
  .at-cas { border: 1px dashed var(--rule); border-radius: 6px; padding: .5rem; background: var(--sunken);
            display: flex; flex-direction: column; align-items: center; gap: .3rem; margin: 0; }
  .at-cas figcaption { color: var(--faint); font-family: var(--f-num); font-size: .6rem;
                       letter-spacing: .03em; text-align: center; }
  .at-gros, .at-petit { image-rendering: pixelated; display: block; }
  .at-gros { width: 76px; height: 76px; font-size: 58px; line-height: 76px; text-align: center; }
  .at-petit { width: 24px; height: 24px; font-size: 18px; line-height: 24px; text-align: center; }
  .at-scene { position: relative; width: 76px; height: 76px; overflow: hidden; border-radius: 4px; }
  .at-scene .fond { position: absolute; inset: 0; }
  .at-scene .at-gros { position: relative; z-index: 1; }
  .at-vide { color: var(--faint); font-size: .76rem; font-family: var(--f-num); }
</style>
</head>

<body class="at">

<header class="at-tete">
  <h1>L'atelier — Éclosion</h1>
  <p>
    Une lignée dans toutes ses variantes, contre le vrai <code>style.css</code> et les vrais
    dessins. Chaque case est doublée d'une vignette de 24 px — la taille de la bande, et la
    seule où un défaut de lisibilité se voit. Page générée : <code>node tools/atelier.js</code>.
  </p>
  <div class="at-cmd">
    <select id="at-lignee"></select>
    <select id="at-age"></select>
    <label><input type="checkbox" id="at-halo" checked> le halo du chromatique</label>
  </div>
</header>

<section class="at-sec">
  <h2>Les trente-six couleurs</h2>
  <p>Un chromatique sur huit mille, et sa couleur vient de ses parents. <b>La question à
     trancher est en bas de chaque case :</b> deux voisines se distinguent-elles à 24 px ?
     Si non, la table est trop dense.</p>
  <div id="at-couleurs"></div>
</section>

<section class="at-sec">
  <h2>Les cinq âges</h2>
  <p>Ce que la lignée devient. Un âge sans dessin reprend celui du précédent, sauf si un
     <code>null</code> écrit dit « celui-là, on ne l'a pas dessiné » — l'emoji reparaît alors,
     et il dit la vérité.</p>
  <div class="at-grille" id="at-ages"></div>
</section>

<section class="at-sec">
  <h2>Les huit fonds</h2>
  <p>Un décor animé derrière la bête, un sur huit cents à la boutique — et transmis par les
     parents depuis l'hérédité.</p>
  <div class="at-grille" id="at-fonds"></div>
</section>

<section class="at-sec">
  <h2>Les six tailles</h2>
  <p>L'embonpoint change l'échelle à l'écran, plafonnée au dernier rang. C'est le seul axe qui
     se voie sans changer une seule couleur.</p>
  <div class="at-grille" id="at-tailles"></div>
</section>

<script>
const D = ${donnees};

const $ = id => document.getElementById(id);
const el = (t, cls, txt) => { const n = document.createElement(t);
  if (cls) n.className = cls; if (txt !== undefined) n.textContent = txt; return n; };

/* LE DESSIN D'UNE BÊTE, ou son emoji quand la lignée n'est pas illustrée. C'est exactement le
   repli du jeu : rien ne casse jamais, on voit seulement que le dessin manque. */
function bete(forme, taille, gros) {
  const cls = gros ? 'at-gros' : 'at-petit';
  if (forme.art) {
    const i = el('img', cls);
    i.src = '../' + forme.art;
    i.alt = '';
    if (taille) i.style.transform = 'scale(' + taille + ')';
    return i;
  }
  const s = el('span', cls, forme.emoji);
  if (taille) s.style.transform = 'scale(' + taille + ')';
  return s;
}

function cas(forme, filtre, legende, taille) {
  const f = el('figure', 'at-cas');
  const g = bete(forme, taille, true), p = bete(forme, taille, false);
  if (filtre) { g.style.filter = filtre; p.style.filter = filtre; }
  f.append(g, p, el('figcaption', null, legende));
  return f;
}

function forme() {
  const l = D.lignees[+$('at-lignee').value];
  return l.formes[+$('at-age').value];
}

function halo(filtre) {
  if ($('at-halo').checked) return filtre;
  // sans le halo on juge la COULEUR seule : le drop-shadow doré tire tout vers le chaud
  return filtre.replace(/ ?drop-shadow\\([^)]*\\)/, '');
}

function peindre() {
  const f = forme();

  const c = $('at-couleurs');
  c.textContent = '';
  for (const fam of ['roue', 'gris', 'recette']) {
    const titres = { roue: 'La roue — seize teintes à 22,5°',
                     gris: 'Les achromatiques — hors du cercle',
                     recette: 'Les recettes — une cardinale croisée d’un blanc ou d’un onyx' };
    const h = el('p', 'at-vide', titres[fam]);
    h.style.margin = '.9rem 0 .4rem';
    c.appendChild(h);
    const g = el('div', 'at-grille');
    for (const k of D.couleurs) if (k.famille === fam) g.appendChild(cas(f, halo(k.filtre), k.nom));
    c.appendChild(g);
  }

  const a = $('at-ages');
  a.textContent = '';
  const lig = D.lignees[+$('at-lignee').value];
  lig.formes.forEach((x, i) => a.appendChild(cas(x, '', D.ages[i] + ' · ' + x.nom)));

  const fo = $('at-fonds');
  fo.textContent = '';
  for (const d of D.fonds) {
    const fig = el('figure', 'at-cas');
    const scene = el('div', 'at-scene');
    const dec = el('span', 'fond fond-' + d.key + ' fond-' + d.sens);
    for (let i = 0; i < d.n; i++) {
      const p = el('span', 'fond-p');
      p.style.setProperty('--x', (i * 100 / d.n).toFixed(1) + '%');
      p.style.setProperty('--d', (-i * 0.7).toFixed(2) + 's');
      p.style.setProperty('--t', (5 + (i % 5)).toFixed(2) + 's');
      p.style.setProperty('--s', (0.7 + (i % 3) * 0.3).toFixed(2));
      dec.appendChild(p);
    }
    scene.append(dec, bete(f, 0, true));
    fig.append(scene, el('figcaption', null, d.nom));
    fo.appendChild(fig);
  }

  const t = $('at-tailles');
  t.textContent = '';
  for (const r of D.tailles) {
    // la même échelle que la scène : elle plafonne, sinon la dernière déborde de sa case
    const k = Math.min(1.6, 0.6 + 0.22 * r.i);
    t.appendChild(cas(f, '', r.nom + ' ×' + r.at, k));
  }
}

D.lignees.forEach((l, i) => {
  const o = el('option', null, l.nom + ' · ' + l.rarete + (l.formes[0].art ? '' : ' (emoji)'));
  o.value = i;
  $('at-lignee').appendChild(o);
});
D.ages.forEach((a, i) => { const o = el('option', null, a); o.value = i; $('at-age').appendChild(o); });
$('at-age').value = 2;
for (const id of ['at-lignee', 'at-age', 'at-halo']) $(id).addEventListener('change', peindre);
peindre();
</script>
</body>
</html>
`;

const dest = path.join(__dirname, 'atelier.html');
fs.writeFileSync(dest, page);
const dessinees = lignees.filter(l => l.formes.some(f => f.art)).length;
console.log('');
console.log('  tools/atelier.html');
console.log('  ' + lignees.length + ' lignées (' + dessinees + ' illustrées) · ' +
            couleurs.length + ' couleurs · ' + fonds.length + ' fonds · ' + tailles.length + ' tailles');
console.log('');
