# -*- coding: utf-8 -*-
"""Écrit dans tools/planche.html la section des 36 couleurs, à partir de la table de game.js.

   Elle est GÉNÉRÉE une fois et non tenue à la main, contrairement au reste de la planche :
   trente-six pastilles écrites à la main dériveraient de la table au premier ajout, et c'est
   exactement le défaut que planche.js surveille pour les classes. Relancer ce script refait la
   section."""
import io, re

jeu = io.open('C:/Dev/Test/clicker/game.js', encoding='utf-8').read()
deb = jeu.index('const CHROMAS = [')
tab = jeu[deb:jeu.index('];', deb)]

TON = {
    'vif':    'saturate(2.4) brightness(1.3)',
    'clair':  'saturate(1.05) brightness(1.72)',
    'sombre': 'saturate(1.9) brightness(.62)',
}
HALO = 'saturate(2.4) brightness(1.3) drop-shadow(0 0 14px #E4A63E)'

couleurs = []
for m in re.finditer(r"\{ key: '([a-z]+)',\s*name: '([^']+)'.*?\}", tab, re.S):
    bloc = m.group(0)
    filtre = re.search(r"filtre: '([^']+)'", bloc)
    hue = re.search(r'hue:\s*([0-9.]+|null)', bloc)
    ton = re.search(r"ton: '([a-z]+)'", bloc)
    if filtre:
        f = filtre.group(1)
    else:
        f = 'hue-rotate(%sdeg) %s' % (hue.group(1), TON[ton.group(1)])
    famille = 'gris' if hue.group(1) == 'null' else ('roue' if ton and ton.group(1) == 'vif' else 'recette')
    couleurs.append((m.group(1), m.group(2), f, famille))

assert len(couleurs) == 36, len(couleurs)

def bloc(famille, titre):
    out = ['      <h3 class="pl-fam">%s</h3>\n      <div class="pl-grille">' % titre]
    for cle, nom, f, fam in couleurs:
        if fam != famille:
            continue
        out.append(
            '        <figure class="pl-cas pl-teinte">'
            '<img src="../art/araignee-3-veuve-noire.png" alt="" class="pl-gros" style="filter:%s %s">'
            '<img src="../art/araignee-3-veuve-noire.png" alt="" class="pl-petit" style="filter:%s %s">'
            '<figcaption>%s</figcaption></figure>' % (f, HALO, f, HALO, nom))
    out.append('      </div>')
    return '\n'.join(out)

section = """
<section class="pl-sec">
  <h2>9 · Les trente-six couleurs</h2>
  <p>Le chromatisme, rendu sur une vraie bête — chacune en grand et en vignette de 24 px, à la
     taille où le jeu l'affiche dans la bande. <b>C'est la seule question à trancher ici :</b>
     deux couleurs voisines se distinguent-elles à vingt-quatre pixels ? Si non, la table est
     trop dense, et il faut retirer un cran sur deux plutôt que d'y croire.
     Section générée depuis la table <code>CHROMAS</code> de <code>game.js</code>.</p>

%s

%s

%s
</section>
""" % (bloc('roue', 'La roue — seize teintes à 22,5°'),
       bloc('gris', 'Les achromatiques — quatre crans, hors du cercle'),
       bloc('recette', 'Les recettes — une teinte cardinale croisée d’un blanc ou d’un onyx'))

css = """  .pl-fam { font-family: var(--f-num); font-size: .68rem; color: var(--faint);
             text-transform: uppercase; letter-spacing: .06em; margin: 1.1rem 0 .5rem; }
  .pl-cas.pl-teinte { display: flex; flex-direction: column; align-items: center; gap: .3rem; }
  .pl-teinte .pl-gros { width: 72px; height: 72px; image-rendering: pixelated; }
  .pl-teinte .pl-petit { width: 24px; height: 24px; image-rendering: pixelated; }
"""

p = 'C:/Dev/Test/clicker/tools/planche.html'
h = io.open(p, encoding='utf-8').read()

# IDEMPOTENT : on retire la section précédente avant d'écrire la neuve. Sans ça, relancer le
# script empile deux sections et la planche montre deux fois les mêmes trente-six pastilles —
# ce qui est pire qu'une section périmée, parce qu'on ne sait plus laquelle on regarde.
if 'pl-teinte' in h:
    d = h.index('<h2>9 ')
    d = h.rindex('<section class="pl-sec">', 0, d)
    h = h[:d] + h[h.index('<footer class="pl-sec pl-pied">', d):]
else:
    ancre = '  .pl-cas .strip { max-height: 9rem; }'
    h = h.replace(ancre, ancre + '\n' + css)
h = h.replace('<footer class="pl-sec pl-pied">', section.strip() + '\n\n<footer class="pl-sec pl-pied">')
io.open(p, 'w', encoding='utf-8', newline='').write(h)
print('section posée :', len(couleurs), 'couleurs')
