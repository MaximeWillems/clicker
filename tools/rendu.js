/* node tools/rendu.js [style]        écrit art/crapaud-N-nom.svg dans le style demandé
   node tools/rendu.js --planche      écrit la planche de comparaison des cinq styles
   node tools/rendu.js --apercu       affiche les grilles en texte
   Le style par défaut est celui déclaré dans STYLE_ACTIF ci-dessous. */
'use strict';
const fs = require('fs');
const P = require('./pixels.js');
const { FORMES, ORDRE } = require('./formes-crapaud.js');
const { STYLES } = require('./styles.js');

const STYLE_ACTIF = 'contour';

function dessine(cle, style) {
  const g = P.grille(style.taille);
  FORMES[cle](P.aLEchelle(style.taille / 32), g);
  if (style.contour === 'plein') P.contour(g, 'o');
  else if (style.contour === 'haut') P.contourHaut(g, 'o');
  return g;
}

const svgDe = (cle, style) => P.versSVG(dessine(cle, style), style.palette);

if (process.argv.includes('--planche')) {
  const teintes = [['ordinaire',''], ['écarlate','hue-rotate(-40deg) saturate(1.7)'],
                   ['azur','hue-rotate(150deg) saturate(1.4)'], ['albâtre','saturate(0) brightness(1.4)']];
  let h = `<!doctype html><meta charset=utf-8><title>Cinq styles</title><style>
body{background:#0E1310;color:#E3E7DD;font:15px/1.55 'IBM Plex Sans',system-ui,sans-serif;margin:0;padding:26px}
h1{font:400 1.5rem Georgia,serif;margin:0 0 6px}
.intro{color:#8C998C;margin:0 0 30px;font-size:.85rem;max-width:62ch}
section{border-top:1px solid #26302A;padding-top:16px;margin-top:30px}
h2{font:400 1.15rem Georgia,serif;margin:0 0 2px}
.dit{color:#8C998C;font-size:.8rem;margin:0 0 16px;max-width:62ch}
.rangee{display:flex;gap:20px;align-items:flex-end;flex-wrap:wrap}
.item{text-align:center}.item span{display:block;font-size:.68rem;color:#5C665C;margin-top:5px}
.petit{gap:10px;margin-top:14px;align-items:center}
.etiq{font:500 .62rem/1 monospace;letter-spacing:.1em;text-transform:uppercase;color:#5C665C;
      width:104px;flex:none}
</style>
<h1>Cinq styles pour la même lignée</h1>
<p class=intro>Les silhouettes sont identiques partout — seules changent la palette, le contour
et la taille de grille. Chaque style est montré en grand, en vignette 26 px comme dans la bande,
et sous quatre teintes.</p>`;

  for (const [cleStyle, style] of Object.entries(STYLES)) {
    h += `<section><h2>${style.nom}</h2><p class=dit>${style.dit}</p>`;
    const ech = [92, 102, 114, 126, 140];
    h += '<div class=rangee>';
    ORDRE.forEach(([cle, titre], i) => {
      h += `<div class=item>${svgDe(cle, style).replace('<svg ', `<svg width=${ech[i]} height=${ech[i]} `)}<span>${titre}</span></div>`;
    });
    h += '</div>';
    h += '<div class="rangee petit"><span class=etiq>vignettes</span>';
    ORDRE.forEach(([cle]) => { h += svgDe(cle, style).replace('<svg ', '<svg width=26 height=26 '); });
    h += '</div>';
    h += '<div class="rangee petit"><span class=etiq>teintes</span>';
    teintes.forEach(([n, f]) => {
      h += `<div class=item style="filter:${f}">${svgDe('gama', style).replace('<svg ', '<svg width=62 height=62 ')}<span style=filter:none>${n}</span></div>`;
    });
    h += '</div></section>';
  }
  fs.writeFileSync('tools/apercu-styles.html', h);
  console.log('planche écrite : tools/apercu-styles.html');
} else {
  const cleStyle = process.argv.find(a => STYLES[a]) || STYLE_ACTIF;
  const style = STYLES[cleStyle];
  ORDRE.forEach(([cle, titre], i) => {
    const g = dessine(cle, style);
    fs.writeFileSync(`art/crapaud-${i + 1}-${cle}.svg`, P.versSVG(g, style.palette));
    if (process.argv.includes('--apercu')) {
      console.log('\n── ' + titre + ' ' + '─'.repeat(20));
      console.log(P.apercu(g));
    }
  });
  console.log(`\n5 sprites écrits en style « ${style.nom} »`);
}
