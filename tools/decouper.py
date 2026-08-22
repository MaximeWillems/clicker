# -*- coding: utf-8 -*-
"""Découpe une planche de sprites en fichiers séparés, prêts pour art/.

    python tools/decouper.py art/source-crapaud.png crapaud
    python tools/decouper.py art/source-crapaud.png crapaud --apercu

Ce que ça fait, dans l'ordre :
  1. rend transparent le fond blanc (les modèles en peignent un même si on demande l'inverse) ;
  2. repère les créatures par les colonnes vides qui les séparent ;
  3. rogne chacune au plus juste, puis la centre dans un carré ;
  4. écrit art/<lignee>-1-....png … art/<lignee>-5-....png ;
  5. avec --apercu, assemble art/apercu-<lignee>.png pour juger la lignée d'un coup d'œil.

Chaque bête remplit son carré : c'est le JEU qui gère la croissance, via l'échelle du
palier et de l'étape de vie. Conserver les tailles relatives de la planche doublerait
l'effet et rendrait le têtard invisible.
"""
import sys, os
from PIL import Image

SEUIL_BLANC = 232     # au-dessus, on considère que c'est le fond
COTE_MAX = 256        # le jeu n'affiche jamais au-delà de ~211 px : au-dessus c'est du poids mort
MARGE = 2             # pixels de respiration autour de la bête

def transparent(im):
    """Détoure en remplissant depuis les BORDS, jamais en effaçant tout le blanc.

    Effacer tout pixel blanc perce aussi les reflets dans les yeux et la neige des
    sommets : les bêtes se retrouvent avec des trous à la place des reflets, ce qui
    donne un regard mort et franchement inquiétant. Seul le blanc RELIÉ AU BORD est
    du fond ; celui enfermé dans la créature lui appartient."""
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size

    def est_fond(x, y):
        r, g, b, a = px[x, y]
        return a < 8 or (r >= SEUIL_BLANC and g >= SEUIL_BLANC and b >= SEUIL_BLANC)

    vus = bytearray(w * h)
    pile = []
    for x in range(w):
        for y in (0, h - 1):
            if not vus[y * w + x] and est_fond(x, y):
                vus[y * w + x] = 1; pile.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not vus[y * w + x] and est_fond(x, y):
                vus[y * w + x] = 1; pile.append((x, y))

    while pile:
        x, y = pile.pop()
        px[x, y] = (255, 255, 255, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not vus[ny * w + nx] and est_fond(nx, ny):
                vus[ny * w + nx] = 1; pile.append((nx, ny))

    # Les images générées arrivent avec quelques pixels quasi transparents à l'intérieur —
    # des résidus de compression. Ils percent la bête. Tout ce qui est transparent SANS être
    # relié au bord est donc rebouché avec la couleur de ses voisins.
    for _ in range(3):
        reste = 0
        for y in range(1, h - 1):
            for x in range(1, w - 1):
                if vus[y * w + x] or px[x, y][3] > 8:
                    continue
                voisins = [px[x + dx, y + dy] for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))
                           if px[x + dx, y + dy][3] > 8]
                if len(voisins) >= 3:
                    n = len(voisins)
                    px[x, y] = (sum(c[0] for c in voisins) // n, sum(c[1] for c in voisins) // n,
                                sum(c[2] for c in voisins) // n, 255)
                else:
                    reste += 1
        if not reste:
            break
    return im

def colonnes_pleines(im):
    px = im.load()
    return [any(px[x, y][3] > 8 for y in range(im.height)) for x in range(im.width)]

def blocs(pleines, attendu=None, ecart_min=6):
    """Sépare les créatures par les colonnes vides.

    Un seuil fixe ne marche pas : sur la planche des oiseaux, le roc et le phénix n'étaient
    séparés que par cinq colonnes vides et fusionnaient en une seule bête. Baisser le seuil
    au hasard casse l'inverse — une créature avec un élément détaché se scinde en deux.

    Quand on sait combien de bêtes on attend, on coupe donc aux N-1 PLUS GRANDS ÉCARTS,
    quel que soit leur taille. C'est vrai quelle que soit l'irrégularité de l'espacement."""
    debut = None
    plein = []                       # (debut, fin) de chaque zone occupée
    for x, p in enumerate(pleines):
        if p and debut is None:
            debut = x
        elif not p and debut is not None:
            plein.append((debut, x)); debut = None
    if debut is not None:
        plein.append((debut, len(pleines)))
    if not plein:
        return []

    # les trous entre zones occupées, du plus large au plus étroit
    trous = [(plein[i + 1][0] - plein[i][1], i) for i in range(len(plein) - 1)]

    if attendu and 1 < attendu <= len(plein):
        coupures = sorted(i for _, i in sorted(trous, reverse=True)[:attendu - 1])
    else:
        coupures = sorted(i for taille, i in trous if taille >= ecart_min)

    out, depart = [], 0
    for i in coupures:
        out.append((plein[depart][0], plein[i][1]))
        depart = i + 1
    out.append((plein[depart][0], plein[-1][1]))
    return out

def carre(im):
    bbox = im.getbbox()
    if not bbox:
        return im
    d = im.crop(bbox)
    cote = max(d.width, d.height) + MARGE * 2
    fond = Image.new('RGBA', (cote, cote), (0, 0, 0, 0))
    fond.paste(d, ((cote - d.width) // 2, (cote - d.height) // 2))
    if cote > COTE_MAX:
        fond = fond.resize((COTE_MAX, COTE_MAX), Image.LANCZOS)
    return fond

def apercu(lignee, chemins):
    """Assemble les stades sur une bande, et sous chacun sa vignette de 24 px.

    Les deux tailles ensemble sont le seul vrai jury : en grand on lit la continuité d'un
    stade au suivant, en tout petit on voit si deux bêtes se confondent. Le défaut apparaît
    TOUJOURS dans la vignette, jamais dans le grand — le porte-tour et Ammon se ressemblaient
    à 24 px alors qu'ils se distinguaient très bien à 160."""
    COTE, VIG = 160, 24
    ims = [Image.open(c).convert('RGBA') for c in chemins]
    bande = Image.new('RGBA', (COTE * len(ims), COTE + VIG + 4), (255, 255, 255, 255))
    for i, im in enumerate(ims):
        bande.alpha_composite(im.resize((COTE, COTE), Image.LANCZOS), (COTE * i, 0))
        bande.alpha_composite(im.resize((VIG, VIG), Image.LANCZOS),
                              (COTE * i + (COTE - VIG) // 2, COTE + 4))
    chemin = os.path.join('art', 'apercu-' + lignee + '.png')
    bande.convert('RGB').save(chemin)
    return chemin

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) < 2:
        print(__doc__); sys.exit(1)
    source, lignee = args[0], args[1]
    noms = args[2].split(',') if len(args) > 2 else None

    im = transparent(Image.open(source))
    parts = blocs(colonnes_pleines(im), attendu=len(noms) if noms else None)
    print(f'{len(parts)} créatures détectées')
    if noms and len(parts) != len(noms):
        print(f'  ATTENTION : {len(noms)} noms fournis. Vérifie la planche.')

    ecrits = []
    for i, (x0, x1) in enumerate(parts, 1):
        bete = carre(im.crop((x0, 0, x1, im.height)))
        suffixe = noms[i - 1] if noms and len(noms) >= i else str(i)
        chemin = os.path.join('art', f'{lignee}-{i}-{suffixe}.png')
        bete.save(chemin)
        ecrits.append(chemin)
        print(f'  {chemin}  {bete.width}×{bete.height}  {os.path.getsize(chemin)//1024} Ko')

    if '--apercu' in sys.argv and ecrits:
        print(f'  aperçu : {apercu(lignee, ecrits)}')

if __name__ == '__main__':
    main()
