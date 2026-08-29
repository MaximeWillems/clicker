# -*- coding: utf-8 -*-
"""Le bras d'image de tools/pixel.js — tout ce qui touche à un PNG passe par ici.

Node ne sait pas ouvrir un PNG sans dépendance, et Pillow ne sait pas poser un contour :
l'outil est donc coupé en deux, et les deux moitiés se parlent en JSON par l'entrée et la
sortie standard. Aucune dépendance nouvelle des deux côtés.

Le détourage et la séparation des stades sont IMPORTÉS de decouper.py, jamais recopiés.
Ces deux fonctions ont coûté cher — ne jamais effacer par couleur, sous peine de percer les
reflets dans les yeux ; couper aux N−1 plus grands écarts, sous peine de fusionner le roc et
le phénix — et deux copies auraient divergé à la première correction.

    python tools/pixel.py mesurer < tache.json    → les cellules de chaque stade, en JSON
    python tools/pixel.py ecrire  < tache.json    → une planche PNG
"""
import json, os, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from decouper import transparent, colonnes_pleines, blocs


def mode_du_bloc(im, x0, y0, x1, y1):
    """La couleur d'une cellule est le MODE de son bloc, jamais la moyenne.

    Une moyenne fabrique des couleurs qui n'existaient pas dans la planche — c'est
    exactement le défaut qu'on cherche à éliminer, et il ressort ensuite comme une
    septième couleur au contrôle de charte.

    Le vide est un candidat comme un autre dans le vote : c'est lui qui décide qu'une patte
    trop fine pour la grille disparaît proprement au lieu d'épaissir toute la bête."""
    total = (x1 - x0) * (y1 - y0)
    couleurs = im.crop((x0, y0, x1, y1)).getcolors(1 << 20) or []
    vide, meilleur, rang = 0, None, None
    for n, c in couleurs:
        if c[3] <= 8:
            vide += n
            continue
        # égalité départagée par la couleur elle-même : deux exécutions, même octet
        ordre = (-n, c[0], c[1], c[2])
        if rang is None or ordre < rang:
            rang, meilleur = ordre, c
    if meilleur is None or vide * 2 >= total:
        return None
    return '#%02x%02x%02x' % (meilleur[0], meilleur[1], meilleur[2])


def a_la_grille(im, n):
    """Ramène une bête détourée sur une grille de n×n cellules.

    La bête remplit sa plus grande dimension — comme dans decouper.py, c'est le JEU qui
    gère la croissance, et conserver les tailles relatives de la planche rendrait le têtard
    invisible. Le centrage se fait en CELLULES ENTIÈRES et pas en pixels : c'est ce qui rend
    l'aller-retour exact, une grille rendue puis réimportée retombant sur les mêmes blocs."""
    bbox = im.getbbox()
    if not bbox:
        return [[None] * n for _ in range(n)]
    d = im.crop(bbox)
    w, h = d.size
    cote = max(w, h) / n
    nx = max(1, min(n, round(w / cote)))
    ny = max(1, min(n, round(h / cote)))
    ox, oy = (n - nx) // 2, (n - ny) // 2
    g = [[None] * n for _ in range(n)]
    for i in range(ny):
        y0, y1 = round(i * h / ny), round((i + 1) * h / ny)
        for j in range(nx):
            x0, x1 = round(j * w / nx), round((j + 1) * w / nx)
            g[oy + i][ox + j] = mode_du_bloc(d, x0, y0, max(x1, x0 + 1), max(y1, y0 + 1))
    return g


def aux_ponts_fins(im, attendu):
    """Couper une planche où les bêtes SE TOUCHENT.

    `blocs()` de decouper.py ne sait couper que dans du vide, et c'est le bon défaut tant
    qu'il y a du vide. Sur la planche de Wukong il n'y en avait plus : la volute de nuage du
    troisième stade rejoignait les rubans du quatrième, et les cinq bêtes sortaient en UNE
    seule. Une planche entière perdue pour trois ponts de huit pixels.

    On ne cherche donc plus des trous mais des ÉTRANGLEMENTS. La planche est découpée en
    `attendu` zones de largeur égale, et près de chaque frontière attendue on prend la colonne
    qui porte le moins d'encre. Chercher les minima sur toute la largeur ne marcherait pas :
    les quatre plus creux se suivent dans le même trou et on couperait quatre fois au même
    endroit. Le voisinage force un écart."""
    px = im.load()
    w, h = im.size
    encre = [sum(1 for y in range(h) if px[x, y][3] > 8) for x in range(w)]
    coupes = []
    for i in range(1, attendu):
        vise = i * w // attendu
        marge = w // (attendu * 2)
        zone = range(max(1, vise - marge), min(w - 1, vise + marge))
        coupes.append(min(zone, key=lambda x: (encre[x], abs(x - vise))))
    bords = [0] + coupes + [w]
    return [(bords[i], bords[i + 1]) for i in range(len(bords) - 1)]


def mesurer(tache):
    im = transparent(Image.open(tache['source']))
    attendu = tache.get('stades')
    parts = blocs(colonnes_pleines(im), attendu=attendu)
    if attendu and len(parts) != attendu:
        parts = aux_ponts_fins(im, attendu)
    n = tache.get('grille', 32)
    return {
        'blocs': [[x0, x1] for x0, x1 in parts],
        'grilles': [a_la_grille(im.crop((x0, 0, x1, im.height)), n) for x0, x1 in parts],
    }


def image_de(g, cellules):
    """Une grille en image, au plus proche voisin : c'est la seule mise à l'échelle qui
    garde des bords francs. LANCZOS ici rendrait la planche impossible à réimporter."""
    n = len(g)
    im = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    px = im.load()
    for y, ligne in enumerate(g):
        for x, c in enumerate(ligne):
            if c:
                px[x, y] = (int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16), 255)
    return im.resize((n * cellules, n * cellules), Image.NEAREST)


def ecrire(tache):
    """Assemble les grilles sur une bande. Trois usages, un seul assembleur :
       — la planche de jugement (grand + vignette, comme decouper.py) ;
       — la planche réimportable, avec gouttière, qui sert d'aller-retour ;
       — la bande d'animation, images jointives, telle que le CSS la fera défiler."""
    grilles = tache['grilles']
    cellules = tache.get('cellules', 8)
    gouttiere = tache.get('gouttiere', 0)
    vignette = tache.get('vignette', 0)
    ims = [image_de(g, cellules) for g in grilles]
    cote = ims[0].width if ims else 1
    bas = (vignette + 4) if vignette else 0
    largeur = cote * len(ims) + gouttiere * max(0, len(ims) - 1)
    fond = (255, 255, 255, 255) if tache.get('fond') == 'blanc' else (0, 0, 0, 0)
    bande = Image.new('RGBA', (largeur, cote + bas), fond)
    for i, im in enumerate(ims):
        x = i * (cote + gouttiere)
        bande.alpha_composite(im, (x, 0))
        if vignette:
            # la vignette est jugée telle que le jeu l'affiche : réduite en douceur, pas au
            # plus proche voisin. Le défaut d'une silhouette n'apparaît QUE là.
            bande.alpha_composite(image_de(grilles[i], 1).resize((vignette, vignette), Image.LANCZOS),
                                  (x + (cote - vignette) // 2, cote + 4))
    chemin = tache['chemin']
    if tache.get('fond') == 'blanc':
        bande.convert('RGB').save(chemin)
    else:
        bande.save(chemin)
    return {'chemin': chemin, 'largeur': bande.width, 'hauteur': bande.height}


if __name__ == '__main__':
    quoi = sys.argv[1] if len(sys.argv) > 1 else ''
    tache = json.loads(sys.stdin.read())
    sortie = {'mesurer': mesurer, 'ecrire': ecrire}[quoi](tache)
    sys.stdout.write(json.dumps(sortie, sort_keys=True))
