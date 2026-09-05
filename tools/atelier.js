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
const { LINES, CHROMAS, FONDS, RANKS, AGES } = jeu;

/* ON EMPORTE LE FICHIER DE DESSIN DE CHAQUE ÂGE, pas la table `ART` : `artAt` porte la règle
   du repli — un âge sans dessin reprend celui du précédent, sauf si un `null` écrit dit
   « celui-là, on ne l'a pas dessiné ». Recopier la table perdrait la règle. */
const lignees = LINES.map(l => ({
  key: l.key, nom: l.name, rarete: l.rarity,
  formes: l.forms.map((f, i) => ({
    nom: f[0], emoji: f[1], art: jeu.artAt(l.key, i + 1),
  })),
}));

/* ON DEMANDE LE FILTRE À `filtreDe`, LA PORTE DU JEU, plutôt que de recoller le ton et le halo
   nous-mêmes. C'est ce recollage-là qui a produit le doublon de la 4.22.0 : une page d'atelier
   qui referait le même geste dans son coin ne montrerait pas le bogue, elle l'imiterait. */
const couleurs = CHROMAS.map((c, i) => ({
  nom: c.name,
  famille: c.hue === null ? 'gris' : c.ton === 'vif' ? 'roue' : 'recette',
  ton: c.ton || null,
  hue: c.hue,
  gris: c.gris === undefined ? null : c.gris,
  filtre: jeu.filtreDe({ prodige: true, chroma: i }),
}));

/* ── L'ORDRE DE LA BANDE, QUI N'EST PAS CELUI DE LA TABLE ──────────────────────
   La bande sert à trancher « ces deux-là sont-elles le même pixel ? », et une question pareille
   ne se pose qu'entre VOISINES. On range donc les couleurs pour que les plus menacées se
   touchent : les seize teintes de la roue par angle croissant — 22,5° d'écart, le cas le plus
   serré du jeu — puis les quatre gris, puis les huit CLAIRES entre elles, puis les huit
   SOMBRES entre elles.

   L'ordre de la table ferait le contraire : elle alterne clair et sombre à chaque hue, donc
   chaque recette y côtoie son opposé, ce qui est facile et ne prouve rien. Une comparaison
   qu'on est sûr de réussir n'est pas une vérification. */
const rang = c => c.famille === 'roue' ? [0, c.hue]
              : c.famille === 'gris' ? [1, c.gris]
              : c.ton === 'clair' ? [2, c.hue] : [3, c.hue];
const bande = couleurs.map((c, i) => ({ i, r: rang(c) }))
  .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1])
  .map(x => x.i);

const fonds = FONDS.map(f => ({ key: f.key, nom: f.nom, sens: f.sens, n: f.n }));
const tailles = RANKS.map((r, i) => ({ nom: r.name || 'ordinaire', at: r.at, i }));
const ages = AGES.map(a => a.nom);

const donnees = JSON.stringify({ lignees, couleurs, bande, fonds, tailles, ages }, null, 0);

const page = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Éclosion — l'atelier</title>

<!-- LE VRAI STYLE ET LES VRAIS DESSINS. Les fonds sont des classes de \`style.css\` : les
     reproduire ici les ferait diverger au premier réglage. \`outil.css\` vient APRÈS et rend au
     document son défilement — sans lui, \`style.css\` cadre la page à 100 vh en \`overflow:
     hidden\` et tout ce qui suit le premier écran devient inatteignable. -->
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="outil.css">

<style>
  /* \`--px\` est la taille de la grande case, tenue par le curseur ; \`--case\` est le fond sur
     lequel on juge. Les deux vivent sur le \`body\`, donc un seul réglage repeint la page. */
  body.at { --px: 76px; --case: var(--sunken); }

  .at-cmd { display: flex; gap: .5rem 1rem; flex-wrap: wrap; align-items: center; margin-top: .6rem; }
  .at-cmd select, .at-cmd label, .at-cmd output { font-family: var(--f-num); font-size: .74rem; }
  .at-cmd select { background: var(--raised); color: var(--ink); border: 1px solid var(--rule);
                   border-radius: 4px; padding: .25rem .4rem; }
  .at-cmd label { color: var(--faint); display: flex; align-items: center; gap: .35rem; }
  .at-cmd input[type=range] { width: 8rem; accent-color: var(--accent); }
  .at-cmd output { color: var(--accent); min-width: 3.2em; }

  /* LA GRILLE SE TASSE TOUTE SEULE. En \`flex-wrap\`, trente-six cases laissaient une dent de
     scie en fin de rangée et un vide à droite ; en grille auto-remplie, elles se rangent en
     colonnes régulières quelle que soit la largeur, ce qui est la condition pour comparer une
     couleur à celle du dessus autant qu'à sa voisine. */
  .at-grille { display: grid; align-items: start; gap: .5rem;
               grid-template-columns: repeat(auto-fill, minmax(max(var(--px), 5.2rem), 1fr)); }
  .at-cas { border: 1px solid var(--rule); border-radius: 6px; padding: .4rem; background: var(--case);
            display: flex; flex-direction: column; align-items: center; gap: .25rem; margin: 0; }
  .at-cas figcaption { color: var(--faint); font-family: var(--f-num); font-size: .6rem;
                       letter-spacing: .02em; text-align: center; line-height: 1.35;
                       overflow-wrap: anywhere; }

  .at-gros, .at-petit { image-rendering: pixelated; display: block; }
  .at-gros  { width: var(--px); height: var(--px); font-size: calc(var(--px) * .76);
              line-height: var(--px); text-align: center; }
  .at-petit { width: 24px; height: 24px; font-size: 18px; line-height: 24px; text-align: center; }
  .at-scene { position: relative; width: var(--px); height: var(--px); overflow: hidden; border-radius: 4px; }
  .at-scene .fond { position: absolute; inset: 0; }
  .at-scene .at-gros { position: relative; z-index: 1; }

  /* LA BANDE : AUCUN ÉCART, AUCUNE BORDURE. Une case dessinée autour d'une vignette l'aide à
     se distinguer de sa voisine, et c'est exactement l'aide qu'il ne faut pas donner ici — le
     jeu, lui, aligne les bêtes bord à bord. On ne sépare que les familles. */
  .at-bande { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 0;
              background: var(--case); padding: .5rem; border-radius: 6px; }
  .at-bande span { display: block; text-align: center; cursor: crosshair; }
  .at-bande img  { display: block; image-rendering: pixelated; }
  .at-bande .at-coupe { width: .9rem; }
  .at-bande b { display: block; width: 100%; height: 0; }
  .at-lu { font-family: var(--f-num); font-size: .74rem; color: var(--accent); min-height: 1.5em;
           margin: .5rem 0 0; }
  .at-fam { font-family: var(--f-num); font-size: .66rem; color: var(--faint);
            text-transform: uppercase; letter-spacing: .06em; margin: 1rem 0 .4rem; }
</style>
</head>

<body class="outil at">

<header class="outil-tete">
  <h1>L'atelier — Éclosion</h1>
  <p>
    Une lignée dans toutes ses variantes, contre le vrai <code>style.css</code> et les vrais
    dessins. Page générée : <code>node tools/atelier.js</code>.
  </p>
  <div class="at-cmd">
    <select id="at-lignee"></select>
    <select id="at-age"></select>
    <label>taille <input type="range" id="at-px" min="24" max="176" step="4" value="76">
           <output id="at-pxv">76 px</output></label>
    <label>fond
      <select id="at-fond">
        <option value="var(--sunken)">la bande</option>
        <option value="var(--ground)">la pièce</option>
        <option value="var(--raised)">le relief</option>
        <option value="#F6F1E3">l’ivoire</option>
        <option value="#000000">le noir</option>
      </select>
    </label>
    <label><input type="checkbox" id="at-halo" checked> le halo du chromatique</label>
  </div>
</header>

<section class="outil-sec">
  <h2>La bande des trente-six</h2>
  <p>Les trente-six couleurs collées bord à bord, <b>rangées pour que les plus menacées se
     touchent</b> : la roue par angle croissant — 22,5° d'écart, le cas le plus serré du jeu —
     puis les quatre gris, puis les huit claires entre elles, puis les huit sombres entre elles.
     Aucune bordure, aucun écart : une case dessinée autour d'une vignette l'aiderait à se
     distinguer, et c'est l'aide qu'il ne faut pas donner. <b>Survole pour lire un nom.</b></p>
  <div class="at-bande" id="at-bande"></div>
  <p class="at-lu" id="at-lu">&nbsp;</p>
</section>

<section class="outil-sec">
  <h2>Les trente-six couleurs</h2>
  <p>Un chromatique sur huit mille, et sa couleur vient de ses parents. Chaque case porte la
     grande vue et la vignette de 24 px, la taille de la bande du jeu — <b>la question à
     trancher est en bas :</b> deux voisines s'y distinguent-elles encore ?</p>
  <p>Depuis la <code>4.24.0</code> la couleur ne dépend plus du dessin : la chaîne commence par
     <code>grayscale(1)</code>, donc <b>la même couleur rend la même chose sur toutes les
     lignées</b>. Change de lignée dans le menu du haut pour le vérifier.</p>
  <div id="at-couleurs"></div>
</section>

<section class="outil-sec">
  <h2>Les cinq âges</h2>
  <p>Ce que la lignée devient. Un âge sans dessin reprend celui du précédent, sauf si un
     <code>null</code> écrit dit « celui-là, on ne l'a pas dessiné » — l'emoji reparaît alors,
     et il dit la vérité.</p>
  <div class="at-grille" id="at-ages"></div>
</section>

<section class="outil-sec">
  <h2>Les huit fonds</h2>
  <p>Un décor animé derrière la bête, un sur huit cents à la boutique — et transmis par les
     parents depuis l'hérédité.</p>
  <div class="at-grille" id="at-fonds"></div>
</section>

<section class="outil-sec">
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
function bete(forme, taille, cls) {
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

function cas(forme, filtre, legende, taille, sansVignette) {
  const f = el('figure', 'at-cas');
  const g = bete(forme, taille, 'at-gros');
  if (filtre) g.style.filter = filtre;
  f.appendChild(g);
  if (!sansVignette) {
    const p = bete(forme, taille, 'at-petit');
    if (filtre) p.style.filter = filtre;
    f.appendChild(p);
  }
  f.appendChild(el('figcaption', null, legende));
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

const rendu = filtre => halo(filtre);

function peindreBande() {
  const f = forme();
  const b = $('at-bande');
  b.textContent = '';
  for (const px of TAILLES_BANDE) {
    let famille = null;
    for (const i of D.bande) {
      const k = D.couleurs[i];
      if (famille !== null && k.famille + (k.ton || '') !== famille) b.appendChild(el('span', 'at-coupe'));
      famille = k.famille + (k.ton || '');
      const s = el('span');
      s.title = k.nom;
      const img = bete(f, 0, null);
      img.style.width = img.style.height = px + 'px';
      img.style.fontSize = Math.round(px * 0.76) + 'px';
      img.style.lineHeight = px + 'px';
      img.style.filter = rendu(k.filtre);
      s.appendChild(img);
      s.addEventListener('mouseenter', () => { $('at-lu').textContent = k.nom + ' — ' + rendu(k.filtre); });
      b.appendChild(s);
    }
    b.appendChild(el('b'));   // saut de rangée, sans écart vertical
  }
}

function peindre() {
  const f = forme();
  document.body.style.setProperty('--px', $('at-px').value + 'px');
  document.body.style.setProperty('--case', $('at-fond').value);
  $('at-pxv').textContent = $('at-px').value + ' px';

  peindreBande();

  const c = $('at-couleurs');
  c.textContent = '';
  for (const fam of ['roue', 'gris', 'recette']) {
    const titres = { roue: 'La roue — seize teintes à 22,5°',
                     gris: 'Les achromatiques — hors du cercle',
                     recette: 'Les recettes — une cardinale croisée d’un blanc ou d’un onyx' };
    c.appendChild(el('p', 'at-fam', titres[fam]));
    const g = el('div', 'at-grille');
    for (const k of D.couleurs) if (k.famille === fam) g.appendChild(cas(f, rendu(k.filtre), k.nom));
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
    scene.append(dec, bete(f, 0, 'at-gros'));
    fig.append(scene, el('figcaption', null, d.nom));
    fo.appendChild(fig);
  }

  const t = $('at-tailles');
  t.textContent = '';
  for (const r of D.tailles) {
    // la même échelle que la scène : elle plafonne, sinon la dernière déborde de sa case
    const k = Math.min(1.6, 0.6 + 0.22 * r.i);
    t.appendChild(cas(f, '', r.nom + ' ×' + r.at, k, true));
  }
}

D.lignees.forEach((l, i) => {
  const o = el('option', null, l.nom + ' · ' + l.rarete + (l.formes[0].art ? '' : ' (emoji)'));
  o.value = i;
  $('at-lignee').appendChild(o);
});
D.ages.forEach((a, i) => { const o = el('option', null, a); o.value = i; $('at-age').appendChild(o); });
$('at-age').value = 2;
for (const id of ['at-lignee', 'at-age', 'at-halo', 'at-fond']) $(id).addEventListener('change', peindre);
$('at-px').addEventListener('input', peindre);
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
console.log('  bande : ' + bande.map(i => couleurs[i].nom).join(' · '));
console.log('');
