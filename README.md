# Éclosion — jalon 0

Prototype jouable du clicker d'élevage. **Site statique pur** : trois fichiers, aucune
dépendance, aucun build, aucun serveur applicatif. La partie est sauvegardée dans le
`localStorage` du navigateur.

> Ce code est un prototype de sensation, pas une fondation. Son seul but est de répondre à
> une question : est-ce que les dix premières minutes sont agréables ? Le vrai jeu aura un
> serveur qui fait autorité, et ce fichier `game.js` sera jeté.

## Version

Le numéro s'affiche en haut à gauche, à côté du nom. Il n'est écrit qu'une seule fois dans
tout le projet — `VERSION`, en haut de `game.js` — et la page le recopie au démarrage.

    MOT MAJEUR.MINEUR.CORRECTIF           aujourd'hui : beta 1.13.0

| Nombre | Ce qui le fait monter | Exemple |
|---|---|---|
| **correctif** | un sprite de plus, un bug corrigé, un chiffre d'équilibrage retouché | 1.0.0 → 1.0.1 |
| **mineur** | une nouveauté franche, mais qui tient dans le jeu tel qu'il est | 1.0.1 → 1.1.0 |
| **majeur** | un morceau de jeu qui n'existait pas, et qui rebat les cartes du reste | 1.1.0 → 2.0.0 |

Un nombre qui monte remet à zéro ceux qui le suivent. On le change **dans le commit qui
apporte la modification**, jamais après coup : c'est ce qui permet de savoir, devant une page
laissée ouverte, si elle est à jour ou s'il faut la recharger.

### Quand le mot change

Le mot **alpha** n'était pas un quatrième nombre : `alpha 2.0.0` était toujours une alpha. Il
devait tomber le jour où **trois choses seraient en place ensemble** :

1. **la pension** — deux bêtes parquées, une durée, un œuf ;
2. **la fusion des cartes** — les paliers de l'album, qui donnent une raison de garder les
   doublons ;
3. **les premières merveilleuses** — la cinquième rareté, celle qui ne s'achète pas.

Ce n'est pas une date, c'est une définition, et elle tient parce que ces trois-là **forment
une boucle** : on élève pour reproduire, on reproduit pour obtenir ce qui ne s'achète nulle
part, et l'album donne enfin une raison de garder ce qu'on a en double. Tant qu'il en manque
une, le jeu est un très bon prototype de sa moitié d'avant.

Les nombres continuent — la bêta ne remet rien à zéro. La pension est le **majeur** qui
ouvre la série 3.

**Les trois sont tombés**, et le mot a changé. La
[fusion des cartes](#latelier-de-forge) en 2.32.0, la [pension](#la-pension) en 3.0.0,
les [merveilleuses](#les-merveilleuses) en 3.1.0 — puis **`beta 1.0.0`**. La boucle est fermée :
on élève pour reproduire, on reproduit pour obtenir ce qui ne s'achète nulle part, et l'album
donne une raison de garder les doublons.

**Les nombres sont repartis de 1**, contrairement à ce qui était prévu ici. Le document disait
« la bêta ne remet rien à zéro » et il avait tort sur un point de fait : la série `alpha 3.x`
racontait l'histoire de l'alpha, pas celle de la bêta. `beta 1.0.0` dit ce qu'elle est — une
première version d'un jeu complet — là où `beta 3.2.0` aurait continué à compter les
corrections d'un prototype. Le mot et le nombre repartent ensemble, une seule fois.

Deux merveilles sur huit sont écloses, les six autres attendent leurs dessins
([MERVEILLES.md](MERVEILLES.md)). La définition demandait « les premières merveilleuses », elle
ne disait pas combien.

À ne pas confondre avec le `v` de la sauvegarde (`v: 19` aujourd'hui), qui numérote le *format*
des données rangées dans le navigateur et ne bouge que lorsque ce format change. Les deux
avancent à leur rythme, et le passage en bêta n'y a pas touché.

### Ce qui est sorti

| Version | Ce qu'elle apporte |
|---|---|
| **beta 4.11.0** → **4.11.2** | le tri des œufs prend les options de l’enclos, range la bande et la file — arrivée ou rareté — et la réserve garde sa file |
| beta 4.10.0 · 4.10.1 | un tri pour la file des œufs, sur la bande de couvaison |
| beta 4.9.1 | la rente triple : une bête rapporte sa valeur en vingt minutes, et les deux ères s’égalisent |
| beta 4.9.0 | une bête vaut plus que son œuf : l’échelle des raretés refaite, rentable dès l’âge adulte |
| beta 4.8.1 · 4.8.2 | le mur passe à la première évolution, et le péage remonte ensuite avec la valeur |
| beta 4.8.0 | l’escalier des œufs remonte d’un cran : l’œuf rare passe de 300 000 à 50 M |
| beta 4.7.2 | les négoces de rareté arrivent avec leur rareté, et non trois marches avant |
| beta 4.7.1 | l’écran d’ascension : le bouton cesse de fuir, et les meilleures se prennent d’un geste |
| beta 4.7.0 | la reprise : on défait sa constellation et on retrouve ses jetons, à l’unité près |
| beta 4.6.2 | audit de la constellation : trois textes mentaient sur les jetons, deux fautes au glisser |
| beta 4.6.1 | la bourse cessait d’imprimer : chaque achat de nœud rendait tout le crédit du cycle |
| beta 4.6.0 | les faveurs : un tirage de trois, repris sans fin, sur dix leviers distincts |
| beta 4.5.0 | l’automatisation redevient du jeu de base : elle sort de la constellation, la pension y entre |
| beta 4.4.0 | la constellation part du centre : six directions, vingt-cinq nœuds, aucun remplissage |
| beta 4.3.0 | la constellation devient un arbre — la géométrie porte la règle |
| beta 4.2.0 | la fin de partie cesse d'être monothématique, la forge migre dans la constellation |
| beta 4.1.0 | les carrefours : deux primes à choix, trois routes chacune, et les deux autres se ferment |
| beta 4.0.0 | la constellation : le jeton devient une monnaie à deux éviers, et une carte coûte le prix doré |
| beta 3.1.2 | le motif `constellé` devient `nacré` — le mot est rendu à la constellation |
| beta 3.1.1 | l'enclos se retasse au bout d'une seconde — le tri était perdu, pas seulement figé |
| beta 3.1.0 | une bête menée au bout paie au clic — le geste du joueur survit à la fin de partie |
| beta 3.0.0 | les jetons d'ascension se regagnent à chaque cycle — le mur de fin de partie tombe |
| beta 2.5.0 | l'enclos devient des cases fixes : une vente ne fait plus glisser la bande sous le curseur |
| beta 2.4.1 | le Kitsune entre en jeu — quatre âges dessinés, le neuvième queue garde son emoji |
| beta 2.4.0 | second passage de rabot : les réglages n'ont plus que leurs titres, la pension ne compte plus |
| beta 2.3.0 | la colonne se calme : moins de texte, et plus rien qui saute tout seul |
| beta 2.2.0 | la pension dit qui elle garde, et une bête posée au nid quitte la bande aussitôt |
| beta 2.1.0 | l'atelier se choisit : tout l'album, une carte désignée, et la grille se réduit à ses semblables |
| beta 2.0.0 | l'atelier de forge : trois cartes semblables n'en font qu'une, et les trois disparaissent |
| beta 1.14.0 | les cinq œufs cessent d'être le même emoji : une coquille dessinée par sorte |
| beta 1.13.0 | les fonds : huit décors animés, un sur huit cents, derrière la bête et sur sa carte |
| beta 1.12.0 | une carte ressemble enfin à une carte : cadre, illustration, signature de rareté |
| beta 1.11.0 | les seize menus des réglages deviennent des segments de boutons |
| beta 1.10.0 | deux vues et un onglet : l'encyclopédie quitte la colonne et prend toute la page |
| beta 1.9.0 | la collection devient une encyclopédie : une fiche par lignée, qui ne sait que ce qu'on a rencontré |
| beta 1.8.2 | le nid ne se rebâtit plus sous le curseur — le glisser-déposer et le clic redeviennent fiables |
| beta 1.8.1 | un couple bloqué ne tire plus sa recette — une réserve pleine était une machine à merveilles |
| beta 1.8.0 | une bête confiée quitte la bande : la pension ne demande plus de mettre la ferme en pause |
| beta 1.7.1 | l'acheteur automatique peut se taire — le seul des trois qui dépensait n'avait pas de « jamais » |
| beta 1.7.0 | la pension devient une ligne de production : le couple ne se défait plus, et douze primes la portent |
| beta 1.6.0 | les trois globales deviennent douze primes, et la grille ne montre que les cinq prochaines |
| beta 1.5.0 | `tools/pixel.js` : une planche de sprites devient une grille de caractères, corrigeable à la main |
| beta 1.4.0 | la Tarasque : une merveille sans recette, que seules deux chimères peuvent donner |
| beta 1.3.0 | trois améliorations globales : le Renom, la Patience et l'Ardeur |
| beta 1.2.0 | trois primes pour la pension : un nid plus chaud, un sang plus fort, un second nid |
| beta 1.1.0 | la Chimère devient un joker : deux chimères donnent n'importe quoi, et les recettes changent de famille |
| beta 1.0.2 | un nid sans place ne se laisse plus remplir |
| beta 1.0.1 | la cinquième rareté redevient un secret : rien ne l'annonce avant la première éclosion |
| beta 1.0.0 | la pension devient un bâtiment qu'on achète et qu'on remplit au glisser-déposer, et la ferme peut s'arrêter |
| alpha 3.1.0 | la cinquième rareté : Kitsune et Sun Wukong, et les recettes qui les font naître |
| 3.0.0 | la pension ouvre : deux bêtes, une attente, un œuf dont la lignée est promise |
| 2.32.0 | la fusion et la poussière de carte — et quatre trophées pour les accompagner |
| 2.31.0 | le martelé remplace le perlé : la force du clic au lieu d'enclos gratuits |
| 2.30.2 | les cartes portent des étoiles, une à trois — le quatrième cran disparaît |
| 2.30.1 | le jeton borne l'album, pas les cartes actives — quatre cartes cessent d'être jetées |
| 2.30.0 | un jeton vaut une carte, et sauter les dépense tous |
| 2.29.1 | un œuf ne récite plus ses statistiques, il dit une phrase |
| 2.29.0 | l'ouverture est trois fois plus longue : on gagne moins, on clique plus |
| 2.28.0 | trois passages obligés : l'écran s'éteint jusqu'à ce que tu fasses le geste |
| 2.27.0 | la plonge se raconte avant de s'ouvrir, et coûte dix clics l'assiette |
| 2.26.0 | la professeure suit ce que tu fais : six actions de plus, et des scènes qui se périment |
| 2.25.0 | la plonge — le jeu ne peut plus se rendre injouable — et douze trophées |
| 2.24.1 | la pension se scelle : plus rien ne peut l'ouvrir, pas même le banc |
| 2.24.0 | l'écran tient sur un portable : tout se replie, et deux ruptures en hauteur |
| 2.23.0 | le squelette de la pension, porte fermée — rien ne change pour le joueur |
| 2.22.0 | la collection se replie, section par section |
| 2.21.0 | vingt primes en petites cases, et quatre améliorations qui les rejoignent |
| 2.20.0 | l'album gagne l'auto-clic et la place, et dit enfin ce que ses cartes font |
| 2.19.0 | une page de statistiques, et des compteurs qui traversent l'ascension |
| 2.18.0 | un achat de clic vaut une seconde entière, et l'âge enfant ne tombe plus en 45 clics |
| 2.17.0 | la partie se télécharge, se copie et se restaure |
| 2.16.1 | le banc d'essai entre dans le dépôt, la scène se découpe en trois |
| 2.16.0 | le bonheur d'une bête, et la frénésie de clic qu'elle offre |
| 2.15.0 | aucun nom de bête ne reprend un mot d'âge ni de taille |
| 2.14.0 | la réserve d'œufs se vide toute seule, gratuitement |
| 2.13.0 | l'âge, le niveau et la taille prennent chacun leur colonne |
| 2.12.0 | faire ce qu'elle dit fait avancer le dialogue ; l'interface se déplie au rythme du joueur |
| 2.11.0 | une professeure accueille le joueur et l'accompagne, en dialogues |
| 2.10.0 | les bêtes non retenues sont perdues avec la ferme, elles ne vont plus en réserve |
| 2.9.0 | les paliers de jetons passent au pas de mille — trois jetons au premier million |
| 2.8.2 | l'écran d'ascension ne propose que les bêtes de l'enclos, dans l'ordre de la bande |
| 2.8.1 | l'escalier du dévoilement se range par prix, et les deux bandeaux cessent de se recouvrir |
| 2.8.0 | le mode histoire — le jeu se déplie une marche à la fois |
| 2.7.4 | l'écran d'ascension n'a plus qu'une liste, et ne ment plus sur ce qu'on perd |
| 2.7.3 | maintenir la barre espace ne vaut qu'un seul clic |
| 2.7.2 | la barre espace ne fait plus jamais défiler, et plus rien ne se surligne en bleu |
| 2.7.1 | les mythiques passent en charte « idole » — même style, plus mignon du tout |
| 2.7.0 | la réserve revient, et les cartes se déplacent au glisser-déposer |
| 2.6.0 | l'Ouroboros renaît en dieu — première lignée de l'arc de la révélation |
| 2.5.0 | cinq emplacements fixes, et plus aucune réserve — chez personne |
| 2.4.1 | on garde bien la carte qu'on a choisie, et la ferme s'arrête pendant qu'on décide |
| 2.4.0 | l'album ne garde que les cartes retenues — les autres sont détruites au saut |
| 2.3.5 | les consignes de la ferme ne traversent plus l'ascension |
| 2.3.4 | l'ascension rend la vitesse à ×1 et ne traîne plus le temps figé par la confirmation |
| 2.3.3 | l'album passe sous les enclos, et « réserve » ne désigne plus deux choses à la fois |
| 2.3.2 | un brief de séance, pour générer plusieurs planches d'affilée sans dérive de style |
| 2.3.1 | les prompts d'illustration des six nouvelles rares |
| 2.3.0 | six lignées rares de plus — l'ère rare passe de 4 à 10 lignées |
| 2.2.3 | un jeton dépensé = un emplacement de carte — il en offrait trois avant le premier saut |
| 2.2.2 | la montée d'un cran passe à **1 sur 1 000**, la même à toutes les raretés |
| 2.2.1 | le marchand automatique garde la case, comme une vente à la main |
| 2.2.0 | l'ascension se paie en **jetons**, gagnés à chaque palier de fortune ×1 000 000 |
| 2.1.1 | la couveuse n'a plus de plafond — l'œuf mythique couve quarante-cinq minutes |
| 2.1.0 | les améliorations s'achètent par lots — ×1, ×10, ×100 ou *max* |
| 2.0.6 | le chromatique passe de 1 sur 500 à **1 sur 8 192** — un coup de chance, plus une variante fréquente |
| 2.0.5 | le marchand n'a plus d'exception : il vend aussi la bête en scène, ☆ *Garder* restant la seule protection |
| 2.0.4 | le crabe entre en jeu — ses cinq dessins attendaient depuis août d'être branchés |
| 2.0.3 | le marchand ne vend plus la bête qu'on regarde — la présence se lit sur l'onglet, plus sur les clics |
| 2.0.2 | l'écran d'ascension ne s'affiche plus par-dessus le jeu, et le premier jalon passe au milieu de partie |
| 2.0.1 | les deux derniers âges renommés — *géant* devient *ancien*, *titan* devient *légende* |
| 2.0.0 | **l'album et l'ascension** — les bêtes gardées deviennent des cartes, tout le reste repart |
| 1.5.0 | les œufs payants divisés par deux — chaque ère s'ouvre deux fois plus tôt |
| 1.4.0 | une taille minimale de vente par rareté — engraisser une commune ne rapporte rien, une mythique rapporte des milliards |
| 1.3.0 | un plafond d'évolution par rareté — le péage ne coûte pas la même chose selon la lignée |
| 1.2.0 | le seuil de rentabilité cantonné au début de la vie, le chromatique redescendu à un cran de rareté |
| 1.1.2 | la bête en scène n’est plus protégée pour toujours, seulement dix secondes (retiré en 2.0.5) |
| 1.1.1 | le marchand dit pourquoi il ne vend pas |
| 1.1.0 | les améliorations se montent en tiers de palier |
| 1.0.1 | la jauge ne se laisse plus écraser par la scène |
| **1.0.0** | une seule vie de cent niveaux et cinq âges — le numéro commence ici |

## Lancer en local

Ouvrir `index.html` directement dans le navigateur suffit. Pour servir proprement :

```bash
python -m http.server 5291
```

## Vérifier

```bash
node tools/test.js
```

Et pour mesurer une courbe plutôt qu'un état :

```bash
node tools/rythme.js 45
```

Un joueur modèle — quatre clics par seconde, les bêtes menées à l'âge adulte, toujours l'achat
le moins cher à sa portée — et l'heure à laquelle chaque chose tombe. C'est le seul moyen de
voir un rythme sans jouer trois heures à la main à chaque retouche d'équilibrage. Il ne dit
rien du plaisir : un joueur qui s'ennuie et un joueur qui s'amuse produisent la même courbe.

Quarante-huit scénarios, sept cent quatre-vingt-sept vérifications. Passer un mot en argument ne joue que
les scénarios dont le nom le contient : `node tools/test.js frénésie`.

**C'est la seule chose qui dise si le jeu marche encore.** Le projet n'ouvre jamais de
navigateur : `tools/banc.js` fait tourner `game.js` sous Node avec un DOM minimal et les
identifiants lus dans `index.html`, et expose **tout ce que `game.js` déclare au premier
niveau**. Cette liste d'exports était écrite à la main et se périmait à chaque fonction
ajoutée — un test échouait alors pour une raison qui ressemblait exactement à un bug du jeu.

Les scénarios ont été écrits au fil des versions, chacun le jour où quelque chose s'est
cassé : ils visent des endroits précis plutôt que de couvrir uniformément. Trois d'entre eux
gardent des invariants qu'aucune relecture ne tiendrait à la main —

- **chaque `$('id')` de `game.js` existe dans `index.html`** (le banc note ceux qu'il a dû
  inventer) ;
- **chaque fichier cité par la table `ART` est sur le disque** — le crabe a dormi cinq jours
  dans `art/` sans être branché ;
- **aucun des 135 noms de forme ne reprend un mot d'âge ni de taille**, les deux colonnes qui
  s'affichent à un centimètre du nom.

**Ce qu'ils ne prouvent pas : rien de visuel.** Le DOM du banc ne met rien en page. Un panneau
superposé, un texte illisible ou une couleur ratée passent tous les tests.

## Déployer

N'importe quel hébergement statique convient — GitHub Pages, Netlify, Cloudflare Pages,
ou un simple dossier derrière nginx/Apache. Pas de build, pas de variables d'environnement :
il suffit de publier la racine du dépôt.

La page porte déjà `<meta name="robots" content="noindex, nofollow">`, elle ne sera donc pas
indexée par les moteurs de recherche. Elle reste accessible à qui connaît l'URL — ce n'est
pas une protection, juste une discrétion suffisante pour un test privé.

## Ce qui est dans le jalon 0

- 30 lignées et leurs 150 formes, du têtard à la Tarasque
- **Le bonheur d'une bête** : la garder en scène lui fait offrir, de loin en loin, quelques secondes de clic double
- **Un mode histoire** : le jeu se déplie une marche à la fois, et s'explique en dix notes
- **Cent niveaux et cinq âges** — enfant, adolescent, adulte, ancien, légende — sur une seule
  vie qui ne repart jamais de zéro
- **Variantes** : teinte, motif, tempérament, et un prodige sur 8 192
- **Quatre raretés** et quatre sortes d'œufs, dont un coup de chance possible dès la première minute
- Œuf → clic → éclosion → niveaux → **vendre, ou payer le péage de l'âge suivant**
- **Rien n'avance tout seul au départ** : seul le clic fait éclore et grandir. Le temps ne se
  met à travailler qu'une fois les automatisations achetées
- **Rien ne se nourrit contre des pièces** : une bête grandit au clic et au temps, jamais à
  l'argent. Une bête mûre continue de grossir indéfiniment
- Incubateurs et enclos, à prix croissant
- Quatre améliorations à niveaux : force du clic, couveuse, éleveur, mangeoire
- Quarante-cinq primes, achats uniques répartis de 250 pièces à 2 000 milliards
- **Rente** : une bête de l'âge adulte ou plus rapporte toute seule, à proportion de ce
  qu'elle vaut — la seule règle du jeu qui paie pour ne pas vendre
- Progression hors ligne, plafonnée à 24 h — et seulement pour ce qui est automatisé
- Collection des 150 formes découvertes
- **L'album et l'ascension** : les bêtes gardées deviennent des cartes, le motif décide
  du bonus, et tout le reste repart de zéro
- **La pension** : deux bêtes adultes confiées pondent un œuf dont la lignée est promise — et
  cessent de rapporter le temps de la couvaison
- **Les merveilleuses** : une cinquième rareté qu'aucun œuf ne donne, obtenue par des recettes
  de pension

Absent volontairement : gènes, hérédité des teintes, lignées cachées, comptes, marché entre
joueurs. Tout cela demande le serveur, ou attend une version de la pension qui n'existe pas
encore : voir [plus bas](#la-pension).

### Le mode histoire

Un joueur qui ouvrait Éclosion pour la première fois possédait zéro pièce et un œuf, et voyait
au même instant **quatorze boutons** dont treize inachetables — quatre œufs de 12 à 180 M, huit
améliorations, un incubateur, un enclos. La seule chose qui comptait à cette seconde-là, *seul
le clic fait quelque chose*, se noyait sous une boutique.

Le mode histoire n'est pas un tutoriel posé par-dessus : c'est **le jeu qui se déplie**.

#### Le dévoilement

**Un achat n'apparaît qu'à 60 % de son prix.** Le seuil est calculé, jamais recopié : un prix
qui change déplace son seuil tout seul. Et les prix de base sont déjà ordonnés, si bien que
l'escalier d'apprentissage sort des prix eux-mêmes — nulle part on n'écrit « après celui-ci,
celui-là ».

**L'ordre est celui des prix, pas celui des tables.** La liste mettait les quatre œufs
devant : la marche suivante de la boutique était donc l'œuf rare à 300 000 dès les premières
pièces — sept mille fois la bourse d'un débutant — pendant que l'incubateur à 150 et l'enclos à
400, les vraies marches, ne pouvaient jamais être désignés. Trié par prix, l'escalier redevient
un escalier : œuf commun, force du clic, couveuse, éleveur, incubateur, mangeoire, enclos… et
le tri se refait seul le jour où un prix change.

**On voit toujours la marche suivante, jamais l'escalier.** Le premier achat non dévoilé reste
affiché, grisé, avec son prix, et sa description dit seulement *Bientôt*. Cacher purement
enlèverait la notion d'échelle, et voir une chose hors de prix est ce qui fait avancer un
joueur d'idle.

**Rien ne se recache jamais.** Le dévoilement est écrit dans la sauvegarde : sans cette
mémoire, l'incubateur disparaîtrait juste après avoir été acheté, puisque son prix monte.

Une rareté d'œuf s'ouvre aussi **à la première rencontre** — on peut tomber sur une rare bien
avant d'avoir de quoi s'en offrir une, et la boutique ne doit pas faire semblant de l'ignorer.

#### La vue de l'œuf

Avant la toute première éclosion, l'écran ne montre **que l'œuf** : pas de bande, pas de
colonne latérale. On n'a alors rien à désigner du doigt, puisqu'il n'y a qu'une chose à faire —
la contrainte enseigne mieux qu'une consigne. L'ouverture de l'écran à l'éclosion est la
première récompense du jeu.

La condition est `seen` : elle dit si une forme a *déjà* été rencontrée, elle survit à
l'ascension, et elle ne peut pas revenir en arrière.

#### Ce qui n'a pas encore de sens ne s'affiche pas

La vue de l'œuf tombait à la première éclosion et **tout le reste arrivait d'un coup** : trois
boutons de tri pour une seule bête, une encyclopédie de trente fiches dont une remplie, une ligne de
boosts annonçant des multiplicateurs qu'on n'a pas, des compteurs « 1 / 1 » qui ne comptent
rien, et un pied de page sur la sauvegarde locale. Beaucoup de détails, aucun utilisable.

Chacun attend maintenant le moment où il commence à vouloir dire quelque chose — et le moment
est toujours **l'existence de ce dont il parle**, jamais un compteur de temps :

| Ce qu'on cache | Jusqu'à |
|---|---|
| les boutons de tri de l'enclos | le deuxième enclos — trier une bête n'a pas de sens |
| les compteurs d'enclos et d'incubateurs | le deuxième du genre |
| la ligne des boosts | le premier automate, c'est-à-dire ce qu'elle a à multiplier |
| la collection | trois formes rencontrées, de quoi voir une progression plutôt que du vide |
| le pied de page | l'ouverture de la boutique |

Le tout est **conditionné au mode histoire** : le bouton 📖 relève l'interface entière d'un
coup, comme il dévoile la boutique entière. Une partie déjà avancée n'est jamais concernée —
ses compteurs sont à deux et plus depuis longtemps.

#### La professeure

Le mode histoire ne récite plus des consignes : **quelqu'un les dit**. C'est toute la
différence entre « clique sur l'œuf » et *« il ne demande qu'une chose, et rien d'autre ne la
fera à ta place »*.

La **professeure Aubier** étudie les lignées. Elle accueille le joueur, lui donne son premier
œuf, et revient à chaque étape — dix scènes, de l'accueil jusqu'à l'enclos. Elle n'a pas encore
de portrait : le glyphe tient la place exactement comme les emoji tiennent celle des créatures,
et le jour où le dessin arrive, on pose un fichier dans `art/` et on remplit `portrait`. Rien
d'autre ne bouge. Son nom et sa personne vivent dans une seule constante, `PROF`.

Elle parle dans une **boîte de dialogue en bas de l'écran**, qu'on fait avancer d'un clic
n'importe où dedans — le geste qu'on connaît de tous les jeux à dialogue, et qui évite d'avoir
à viser une flèche. Une croix passe la scène entière.

**Elle ne bloque jamais.** La ferme tourne derrière, l'œuf reste cliquable pendant qu'elle
parle. C'est la différence entre être accompagné et être retenu.

**Faire la chose la fait avancer.** Une réplique peut porter une action : « Clique dessus »
disparaît au moment où l'on clique l'œuf, sans qu'on ait à cliquer une deuxième fois pour elle.
C'est la règle générale — obéir à la professeure vaut mieux qu'un clic sur son texte, et
demander les deux gestes pour le même conseil est une taxe qu'on paie à chaque phrase.

**Toute réplique qui demande quelque chose le sait maintenant.** Six l'ignoraient encore : elle
conseillait un incubateur, un enclos, la force du clic ou un péage, on l'achetait sous ses yeux
et elle continuait de le conseiller. Acheter fait désormais passer à ce que l'achat *veut
dire* — « un incubateur de plus » devient « ils doublent presque de prix à chaque fois », et
« tu as de quoi payer un péage » devient « une bête qui le franchit garde tout ». La consigne
laisse la place à la leçon au moment exact où la leçon devient vraie.

**Une scène peut se périmer.** `perime` dit quand ce dont elle parle n'existe plus : l'œuf
dont elle annonçait le craquement a éclos, la bête qu'elle présentait est vendue, l'évier
devant lequel elle plaisantait est vide. La scène se ferme alors où qu'elle en soit, et se
marque jouée.

C'est la moitié qui manquait à `fait`. Une réplique qui sait qu'on l'a écoutée, c'est bien ;
une scène qui continue de commenter une situation disparue est simplement **fausse**, et c'est
ce qu'un joueur remarque en premier.

`perime` est toujours **la négation exacte du `test`** qui a ouvert la scène — jamais une
condition inventée, sinon une scène pourrait naître et mourir dans la même image, un éclair de
texte que personne ne lit. Un scénario du banc vérifie l'invariant sur toutes les scènes.

**Deux scènes n'en ont délibérément pas.** Vendre ou évoluer fait disparaître la bête mûre dont
parlent `mure` et `peage` — mais les répliques qui suivent sont **la leçon** : ce que le péage
garde, pourquoi la question n'a pas de bonne réponse. Fermer sur l'action ferait rater
l'explication à qui a agi vite, c'est-à-dire à qui joue bien. `fait` y suffit : on avance, on
n'efface pas.

#### Trois passages obligés

Une réplique peut **tenir**, et alors elle tient vraiment. **La boîte ne s'avance plus du
tout** — ni par un clic sur le texte, ni par la croix, qui disparaît. Et **le reste de l'écran
s'éteint** : la boutique, la bande, les réglages, les outils, la bourse deviennent inertes et
grisés. Il ne reste que le sujet, qui pulse doucement.

Les deux moitiés étaient nécessaires. Tenir sans éteindre le reste ne bloquait rien : on lisait
la consigne, on allait cliquer ailleurs, et la scène restait plantée là. Tenir en laissant la
croix ne bloquait rien non plus — **deux clics suffisaient à traverser tout le mode histoire
sans rien apprendre**.

**La sortie existe, et elle est franche** : le bouton `📖` reste vivant sous le voile et éteint
le mode histoire d'un coup. On peut refuser le tutoriel ; on ne peut pas le suivre à moitié.

**Trois règles décident où l'on tient**, et elles gardent la liste courte :

- **possible tout de suite** — tenir sur « achète une couveuse » condamnerait qui n'a pas les
  pièces, puisque la scène s'ouvre à 60 % du prix ;
- **gratuite, ou avec une porte gratuite** — on tient sur « vends ou paie le péage » parce que
  vendre est toujours possible, même sans un sou ;
- **indispensable à la suite** — le reste du mode histoire n'a pas de sens sans elle.

Il en reste donc trois, et un scénario du banc vérifie qu'il n'y en a pas une de plus : cliquer
l'œuf, cliquer la bête, et **trancher le premier vrai choix du jeu** — vendre sa première bête
mûre ou payer son péage. Chacune sait aussi reconnaître qu'on l'a faite, ce que le même
scénario vérifie.

La vérification tourne à chaque rendu, ce qui règle aussi le rechargement : une consigne déjà
exécutée avant la fermeture de la page ne se redemande pas à la réouverture. La boucle est
bornée à quarante répliques — une condition mal écrite ferait défiler une scène, pas geler la
page.

**Une scène n'est marquée jouée qu'à sa dernière réplique**, et la position est dans la
sauvegarde : un rechargement au milieu d'un dialogue de quatre phrases le reprend où on l'avait
laissé, au lieu d'avaler le reste de ce qu'elle avait à dire.

Les scènes s'arrêtent à l'enclos — la suite s'écrira en jouant, quand on saura ce qui manque.

Trois règles les gouvernent, et les trois ont été trouvées en les testant plutôt qu'en les
écrivant :

**Une note qu'on n'affiche pas n'est pas lue.** Marquer tout ce qui est satisfait pour ne
montrer que la dernière les avalait : en vendant sa première bête on franchit trois seuils, et
deux explications disparaissaient sans avoir été vues. On n'en consomme donc qu'une, la
première, et seulement **quand le bandeau est libre** — la boucle passe dix fois par seconde,
et sans ce garde-fou les suivantes étaient mangées pendant qu'on lisait la précédente.

**Rien pendant le rattrapage.** Une absence de huit heures franchit cinq seuils en quelques
secondes ; ils sont marqués lus **en silence**, sinon on revient à six bandeaux à la file pour
des choses qu'on n'a pas vues arriver.

**Les notes traversent l'ascension.** On ne réapprend pas le jeu au deuxième cycle : elles
voyagent avec la collection, pas avec la ferme.

#### L'interrupteur

Le bouton 📖 éteint le mode histoire : tout devient visible d'un coup, plus aucune note. Le
rallumer **oublie ce qui a été lu**, pour que les notes rejouent — c'est ce qui permet de les
vérifier sans effacer sa partie, et un joueur qui rallume veut précisément les revoir.

La migration v9 → v10 marque tout lu et tout dévoilé pour les parties déjà en cours. Deux
pièges s'y cachaient. Elle se fie au **numéro de la sauvegarde**, jamais à la présence du champ :
`freshState` en pose un vide, et un objet vide est vrai en JavaScript — le test « si `vu`
manque » n'était jamais vrai, et la migration ne tournait pas du tout. Et elle marque **sans
évaluer** : en ne marquant que les notes dont la condition passait à l'instant du chargement,
elle laissait armées les conditions *transitoires* — « il craque » veut un œuf à deux tiers de
couvaison — et une ferme à cinquante millions recevait trente secondes plus tard « Ta première
bête. Elle grandit au clic ». Les notes ne parlent que du tout début : une partie enregistrée
les a toutes dépassées par construction.

## Les boutons du coin (en haut à droite)

| Bouton | Effet |
|---|---|
| `×1` | Cycle ×1 → ×10 → ×100. Accélère toute la simulation pour tester une progression complète en quelques minutes. **Test.** |
| `📖` | Éteint le mode histoire — tout devient visible. Le rallumer rejoue les notes depuis le début. |
| `♪` | Coupe le son. |
| `📊` | Ce que le fichier a compté depuis le premier jour. |
| `💾` | Garder une copie de la partie, ou en restaurer une. |
| `⟲` | Efface la partie et repart de zéro. |

### La plonge

**Le jeu pouvait se rendre injouable, et c'était à deux minutes du début.** Zéro bête, zéro
œuf, et moins que le prix d'un œuf commun : plus de rente, plus rien à cliquer, plus rien à
vendre. Le seul geste restant était d'effacer la partie. Le chemin le plus court passait par
le conseil de la professeure — on vend sa première bête pour quarante pièces, elle annonce
qu'il y a des choses à acheter qui ne sont pas des œufs, la Force du clic en coûte trente.

Alors on lave des assiettes. **Dix clics l'assiette, une pièce l'assiette.** Cent vingt clics
pour un œuf commun.

**C'est une punition, et elle est assumée.** Une punition pour avoir mal géré, mais
rattrapable : on ne perd pas sa partie, on perd du temps. Un idle ne doit jamais pouvoir se
rendre injouable, mais il n'a aucune raison de faire semblant qu'une erreur n'en était pas une.

**Elle ne s'ouvre que dans l'impasse et se referme dès qu'on en sort** — quatre conditions
ensemble : rien en enclos, rien en couvaison, rien en réserve, et pas de quoi acheter. Ce n'est
pas un détail d'équilibrage, c'est ce qui rend tout garde-fou inutile : une plonge qui n'existe
que là où rien d'autre n'existe ne peut pas devenir un revenu alternatif ni une stratégie
d'ouverture. Rien à doser, rien à surveiller.

**Tout est plat ici, et rien n'y touche.** Ni la Force du clic, ni la frénésie, ni la Poigne,
ni la Main preste, ni la carte ocellée : dix clics font une assiette qu'on ait tout acheté ou
rien du tout. C'est la seule mécanique du jeu qui ignore volontairement tout ce qu'on a
construit — parce qu'**une punition qui s'achète n'en est pas une**, et que celui qui a le plus
d'améliorations est aussi celui qui aurait dû le moins se retrouver là. Un scénario du banc
rallume tout ce qui accélère le clic (`clickPower` à 136 secondes) et vérifie qu'il faut
toujours exactement dix coups d'éponge.

**La barre suit l'assiette en cours, pas la sortie de l'impasse.** Cent vingt clics pour un
œuf, c'est moins d'un pour cent par clic sur une barre globale — invisible. Sur l'assiette,
chaque clic vaut dix pour cent et la barre se remplit douze fois. Même règle que la scène d'une
bête : la jauge vise le prochain palier, le texte dit la distance au but. Le frottage en cours
est **dans la sauvegarde** — perdre neuf clics parce qu'on a rechargé la page ajouterait une
punition à la punition.

**L'évier ne se montre pas tout seul.** Être dans l'impasse et voir la vaisselle sont deux
choses : la première fois, la professeure parle d'abord — elle constate, elle nomme la bêtise,
elle propose. L'écran ne montre alors que `Plus rien · l'enclos est vide, la bourse aussi`, et
un conseil qui renvoie à elle. L'évier n'apparaît qu'à sa dernière réplique. C'est tout ce qui
sépare un mécanisme d'un moment — et c'est elle qui ouvre la porte, littéralement.

**Deux portes de secours**, parce qu'une impasse ne doit jamais dépendre d'un dialogue : le
mode histoire éteint ouvre l'évier immédiatement, et une scène déjà jouée aussi. On ne raconte
la même histoire qu'une fois ; la deuxième fois on a juste besoin de l'évier.

Sa scène ne s'excuse pas, et ne nomme jamais la vaisselle — *« Il y a une porte au fond du
couloir. Je n'y emmène pas les visiteurs. »* La révélation est visuelle : c'est l'écran qui
montre l'évier, pas elle qui le décrit.

Deux détails de structure. La plonge est un **état du jeu, pas un sujet de la scène** :
`subjects()` liste toujours les incubateurs même vides, donc `current()` ne rend jamais `null`
— `renderStage` et `tapStage` regardent la plonge *avant* de regarder le sujet. Et
`renderRien()`, qui n'était **atteignable par personne** pour cette même raison, sert enfin :
c'est l'écran de l'impasse avant qu'elle parle.

### L'atelier de forge

Une carte porte des **étoiles** : elle naît à une, la forge la monte à deux puis à trois, et ça
s'arrête là. **Trois cartes semblables entrent, une seule sort** — et les trois disparaissent.
Ça coûte en plus une monnaie qui n'existe que pour l'album, la **poussière** `✧`.

#### Similaire n'est pas identique

Pendant vingt versions, « fusionner » voulait dire **payer une étoile avec de la monnaie** :
rien ne disparaissait, rien ne se mariait, et le mot mentait sur ce qu'il faisait. Une fusion,
ce sont des cartes **qui fusionnent**.

L'objection qui avait fait naître la monnaie seule était mal posée : « une fusion classique
demande deux cartes *identiques*, or une carte porte une lignée, un âge, un niveau, un motif,
une teinte, un rang et un chromatique — treize millions de combinaisons, deux exemplaires
identiques n'arriveront jamais ». C'est vrai, et **ça ne conclut rien**.

Deux cartes se marient quand elles partagent **la lignée et le motif** — exactement les deux
champs qui décident de *ce que* la carte fait. Tout le reste — âge, niveau, teinte, rang — ne
dit que *combien*, et **se moyenne**. Trois Béhémoths unis se réunissent donc, quel que soit
leur âge.

| Ce qui doit correspondre | Pourquoi |
|---|---|
| **la lignée** | elle décide du plafond de puissance |
| **le motif** | il décide de la famille de bonus — les mélanger fabriquerait un effet choisi par personne |
| **le nombre d'étoiles** | une trois-étoiles avalée par une fusion de une-étoile serait un gâchis invisible |

L'**âge n'en est pas**, et c'est délibéré : il ne dit que la puissance, et la puissance se
moyenne. Sans ça il faudrait trois bêtes menées au même âge, et la forge ne s'ouvrirait qu'à
qui joue déjà parfaitement.

#### Trois entrent, une sort

Le compte décide de tout le reste : **neuf cartes** d'une même lignée et d'un même motif pour
une seule à trois étoiles. Deux rendait la troisième étoile presque gratuite pour qui joue une
lignée ; quatre la rendait inatteignable avant la dixième ascension.

#### C'est le joueur qui désigne les trois

La forge a d'abord pris les **trois plus fortes** toute seule, au motif qu'une fusion doit
rendre la meilleure carte possible. C'était décider à sa place ce qu'il perd — et une fusion
fait perdre : une teinte s'y **dilue**, une bête menée à l'âge légende ne se remplace pas en
une ascension. *Quelles* trois cartes entrent est la seule vraie question de l'atelier, et une
machine ne peut pas y répondre.

D'où **un geste en deux temps** :

1. l'atelier montre **tout l'album**, et on choisit la carte à faire monter ;
2. la grille **ne montre plus alors que celles qui peuvent la rejoindre**.

C'est la réduction elle-même qui enseigne la règle du mariage. On ne lit pas « même lignée,
même motif, même rang d'étoiles » — on voit quarante cartes devenir deux. Cliquer une carte du
plan de travail la reprend, et cliquer la carte de base annule tout : un joueur qui vient de
poser une carte par erreur la reprend **là où il l'a posée**.

**Ce qu'on ne peut pas forger reste montré**, éteint et avec sa raison — « elle est au bout »,
« elle est équipée ». Les cacher ferait chercher une carte qu'on possède.

Une carte **équipée** n'entre pas dans la forge, exactement comme elle ne se fond pas : elle
s'évaporerait d'un emplacement et changerait le build en silence.

#### Ce que la carte hérite

Tout ce qui ne dit que la puissance **se moyenne** : l'âge, le niveau, la teinte, le rang.
C'est la règle la plus simple qui soit juste dans les deux sens — elle ne punit pas de
sacrifier une bonne carte, et elle n'efface pas non plus le prix d'en sacrifier une mauvaise.

**La teinte se moyenne comme le reste, ce qui la dilue** : albâtre plus deux ordinaires ne
redonne pas albâtre. C'est la seule façon de garder une belle teinte rare — il en faut trois
pour en sortir une — et ça fait de la forge une décision au lieu d'un automatisme.

**Le chromatique et le fond se décident à la majorité**, deux sur trois. Ils ne sont pas des
nombres : on ne peut pas être aux deux tiers chromatique. Deux fonds *différents* n'en font
donc aucun.

Et le résultat **se voit avant d'être fabriqué** : le plan de travail montre les trois cartes
qui vont entrer, une flèche, et la carte qui va sortir. C'est ce qui rend « la moyenne des
trois » compréhensible sans l'expliquer — sans quoi un joueur qui perd une belle teinte dans
une fusion ne le comprendrait qu'après coup, et rien ne se défait. Le plan **reste en haut**
pendant qu'on parcourt la grille : c'est lui qu'on regarde pour décider.

#### Ce qu'une carte rend, ce qu'une fusion coûte

    poussière = 10 × rareté(1 / 3 / 10 / 30) × chromatique(×3) × fond(×2)
    fusion    = 100 puis 400, × la même rareté

| Rareté | Une carte rend | ★→★★ | ★★→★★★ |
|---|---|---|---|
| commune | ✧ 10 | 100 | 400 |
| rare | ✧ 30 | 300 | 1 200 |
| épique | ✧ 100 | 1 000 | 4 000 |
| mythique | ✧ 300 | 3 000 | 12 000 |

**La rareté est du même côté des deux équations, et elle s'annule** : monter une commune ou une
mythique coûte le **même nombre de cartes de sa propre rareté** en poussière — dix pour la
deuxième étoile, quarante pour la troisième. Personne n'a intérêt à fondre ses mythiques pour
nourrir ses communes, et l'arbitrage reste dans la lignée qu'on aime.

**Le barème de la poussière n'a pas bougé en passant à la vraie fusion.** Il aurait pu baisser,
puisqu'une fusion coûte désormais trois cartes en plus ; il ne l'a pas fait, parce que ce que
la monnaie mesure n'a pas changé — c'est le prix de l'étoile, pas celui du mariage. Les trois
cartes, elles, mesurent autre chose : la patience de réunir trois fois la même bête.

**La qualité n'entre pas.** Niveau, teinte et rang décident déjà de la puissance : les faire
entrer aussi punirait deux fois d'avoir une bonne carte, et rendrait « garder ou fondre »
insoluble. *Une carte vaut sa puissance, **ou** sa poussière, et les deux ne se ressemblent
pas.*

#### Trois règles qui tiennent le système

**On ne défait pas une fusion.** Les étoiles n'entrent pas dans ce qu'une carte rend : une
carte à trois étoiles fond pour exactement ce que rendrait une carte neuve. Sans cette règle,
fusionner puis fondre fabriquerait de la poussière à l'infini — c'est la seule façon de vider
le système de son sens, et un scénario du banc la garde.

**Une carte équipée ne se fond pas.** Elle s'évaporerait d'un emplacement et changerait le
build en silence ; le joueur découvrirait la perte à l'effet, pas au geste. Il faut la retirer
d'abord — un geste de plus, mais délibéré.

**Ce qu'on n'emporte pas à l'ascension laisse un peu de poussière**, un dixième de ce que sa
carte aurait rendu. Les bêtes non retenues disparaissaient jusque-là sans rien laisser. Ce
n'est pas grand-chose, et c'est voulu : ça récompense d'ascensionner sur une ferme pleine sans
rendre le sacrifice indolore.

#### Il ne reste qu'un geste sur la carte

Chaque carte affiche `✧ 10` : ce qu'elle rend si on la fond. Le bouton `★ 100` a disparu —
il montait une étoile contre de la monnaie sans rien consommer, et **la vraie fusion demande
trois cartes, donc elle ne peut pas tenir sur une seule**. Elle a son atelier.

Fondre reste sur la carte, parce que fondre est bien une décision qui ne regarde qu'une carte.

Deux défauts ont été trouvés en câblant tout ça, à deux versions d'écart. La signature de
`renderAlbum` lisait encore `k.palier`, laissé derrière par le renommage de la 2.30.2 : elle
valait `undefined` pour toutes les cartes, et **l'album ne se serait jamais repeint après une
fusion**. Et la signature de `renderStrip` portait la **lignée** de l'œuf mais pas sa
**sorte** : deux œufs de suite de la même lignée laissaient la vignette sur le dessin du
premier. Invisible tant que les cinq sortes partageaient le même emoji — c'est la deuxième
fois qu'un dessin révèle un défaut que l'emoji cachait.

### Les trois globales

Trois axes qui ne se recouvrent pas, **quatre primes chacun**, réparties sur toute la fin de
partie. Cumulées, les quatre d'une famille font **cinquante pour cent**.

| Axe | Ce qu'il porte | Les quatre primes |
|---|---|---|
| **valeur** | ce qu'une bête se vend, et donc ce qu'elle rapporte | Bouche à oreille · Enseigne peinte · Renom · On vient de loin |
| **rente** | la rente seule — le seul axe qui paie pour ne rien faire | Litière profonde · Abreuvoir · Patience · Rien ne presse |
| **vitesse** | le temps : couvaison, croissance, engraissement | Réveil matinal · Ardeur · Bon pied · Sans relâche |

De 600 000 à 15 milliards, la dernière étant la prime la plus chère du jeu.

**Elles ont été des améliorations à niveaux pendant trois versions, et c'était le mauvais
objet.** Une amélioration dit toujours la même chose — « Renom niv. 12 → niv. 13 » — et
cinquante achats plus tard elle la dit encore : le défaut exact qui avait fait naître les
primes. Un coefficient global n'a pas besoin de cent niveaux, il a besoin de **quatre
moments** : quatre primes nommées, chacune disant une chose et se taisant.

Cinquante pour cent, c'est peu, et c'est voulu : ce sont des puits, pas des raccourcis, et
leur intérêt vient du fait qu'ils se cumulent avec absolument tout — teinte, taille, négoce,
cartes de l'album.

Une partie d'avant ne perd rien : les niveaux se convertissent en primes aux seuils de
pour-cent cumulés (5, 15, 30, 50), **généreusement par principe**.

### La grille ne montre que les cinq prochaines

Trente-six cases affichées d'un bloc, c'est un mur : les premières sont prises depuis
longtemps et ne décident plus de rien, les dernières coûtent des milliards et ne décident pas
encore. **Ce qui compte tient toujours dans les cinq suivantes.**

C'est la même idée que [« la marche suivante »](#la-marche-suivante-éteinte) de la boutique,
poussée d'un cran : on ne montre pas tout ce qui existe, on montre ce sur quoi porte la
prochaine décision. Acheter la première fait monter la sixième.

**Ce qui est pris n'est pas perdu** — un bouton du bandeau bascule la grille sur les primes
déjà achetées. C'est une *consultation*, pas un choix : on va y relire ce qu'on a, jamais
décider quoi que ce soit. D'où le bouton plutôt qu'une seconde grille toujours ouverte.

Une prime conditionnée — les trois de la pension — n'entre pas dans le compte des cinq tant
que son bâtiment n'existe pas. Et quand tout est pris, la grille bascule d'elle-même sur ce
qu'on a, plutôt que de rester vide.

### Les fonds

Une bête peut naître avec un **fond** : un décor derrière elle, tiré à l'éclosion et gardé à
vie. Il se voit sur la scène et sur sa carte, et il fait monter un peu son prix.

| Fond | Sens | Valeur |
|---|---|---|
| **braise** | monte | ×1,14 |
| **givre** | tombe | ×1,14 |
| **nuée** | dérive | ×1,10 |
| **abysse** | monte | ×1,16 |
| **orage** | tombe | ×1,12 |
| **pollen** | dérive | ×1,10 |
| **cendre** | tombe | ×1,12 |
| **aurore** | dérive | ×1,20 |

**Huit décors, zéro fichier.** C'est l'argument principal de l'idée : les dix-sept lignées sans
image demandent cinq dessins chacune, et chaque dessin ne sert qu'à une forme. Un fond sert aux
**cent cinquante formes à la fois** — huit fonds multiplient par neuf le nombre d'images
différentes qu'on peut croiser, et ils sont en CSS.

#### Un sur huit cents, et seulement à la boutique

Le qualificatif compte autant que le chiffre. **La pension n'en donne aucun** — aujourd'hui :
[le plan la fait en donner par deux voies](PLAN.md#les-fonds-à-la-pension--les-deux-voies-et-non-plus-aucune),
au hasard comme les teintes et par hérédité.

*Le chiffre qui justifiait ce garde était faux*, et il est corrigé ici : « mille œufs l'heure
en sortirait un toutes les cinq minutes » — mille à un sur huit cents font 1,25 par heure, soit
un toutes les quarante-huit minutes. Le vrai plafond de la pension est de 1 920 œufs l'heure,
donc un fond toutes les vingt-cinq minutes, au sommet d'une partie parfaitement optimisée.
Beaucoup pour un objet dit prestigieux, mais cinq à dix fois moins que ce qui était annoncé.

C'est aussi la frontière qui donne sa place à chacune des deux voies : **on achète pour tomber
dessus, on élèvera pour en obtenir un précis.**

Techniquement, l'œuf de pension et l'œuf acheté sont indiscernables une fois dans la réserve —
c'était voulu, tout le reste du jeu n'a pas à les distinguer. `tireLigne` est le seul endroit
qui le sache, et il le dit à l'éclosion.

#### Il vaut, il se voit, il ne se nomme pas

Le multiplicateur reste dans la **fourchette des teintes**, de 1,10 à 1,20 : au-delà il faudrait
reprendre l'équilibrage des variantes en entier.

Et **il n'entre pas dans le nom**. Un fond *se voit* : le dire en plus serait une redite, et le
jeu n'affiche qu'une seule épithète exprès, pour qu'une bête reste une bête et pas une fiche
technique. `Têtard farouche` garde son nom, et son décor par-dessus le marché.

**Le fond et le motif ne font pas le même métier** : le motif décide de l'*effet* d'une carte,
le fond de sa *valeur*. Ils coexistent sans se marcher dessus.

#### La contrainte qui a tout dessiné

Tenir **derrière un sprite de 32 px** sans le manger, et **derrière une carte** sans en rendre
le texte illisible. D'où trois décisions :

- le dégradé est **sombre et peu saturé** — il occupe le fond du fond, jamais le premier plan ;
- les particules sont **petites et peu nombreuses**, entre sept et quatorze, et jamais au centre
  plus qu'ailleurs : c'est là qu'est la bête ;
- sur la carte, le fond est enfermé dans la
  [zone d'illustration](#une-carte-ressemble-à-une-carte). Le nom, l'effet et la rareté vivent
  en dehors : aucun texte ne peut être traversé par une particule.

**Rien n'est allé dans un canvas**, et c'est un choix : cinq cartes équipées plus la scène font
six surfaces animées à la fois, et six contextes 2D redessinés en boucle coûteraient plus que
tout le reste du jeu réuni. Une dizaine de `span` en `transform` ne coûte rien.

**L'aléatoire est tiré de la bête**, pas de `Math.random` : deux redessins de la même carte
rendent le même décor, sinon les particules sauteraient à chaque rafraîchissement.

Et `prefers-reduced-motion` **fige tout**. Ce n'est pas une option : c'est le premier élément
animé du jeu hors du cinquième âge des merveilles.

#### Où on les collectionne

Un objet de collection a besoin d'un endroit où être collectionné, sinon « collectionnable »
n'est qu'un mot. La [fiche d'une lignée](#lencyclopédie) a donc sa rangée **Fonds**, au même
titre que les teintes et les caractères — avec la même règle : seuls ceux qu'on a croisés **sur
cette lignée** s'affichent. Les statistiques comptent le total, `3 / 8`.

### Une carte ressemble à une carte

C'était une **ligne** : vignette à gauche, deux lignes de texte à droite, bordure teintée. Ça se
lisait, ça se triait, ça se glissait — et ça n'avait rien d'une carte. Le mot est employé
partout dans le jeu, y compris par les mécaniques qui en dépendent — les étoiles, la poussière,
la fusion — et l'objet ne le tenait pas.

**Quatre choses font une carte, et aucune n'était là :**

- **un cadre** — un rapport hauteur/largeur assumé, trois quarts, et non une bande qui s'étire.
  C'est lui qui fait qu'on reconnaît l'objet avant de lire quoi que ce soit ;
- **une zone d'illustration**, séparée du texte par une règle. La bête y est grande — trois rem
  contre une et demie — parce qu'une carte se regarde d'abord ;
- **une signature de rareté qui se voit de loin** : un bandeau coloré en haut, un halo derrière
  la bête, et le mot en bas. Trois redondances plutôt qu'une, parce que cinq cartes côte à
  côte se distinguent au coup d'œil ou pas du tout ;
- **une place pour le fond.** `.carte-fond` est vide aujourd'hui et couvre exactement la zone
  d'illustration.

**C'est cette dernière contrainte qui a dessiné le découpage, et non l'inverse.** Les particules
viendront **derrière la bête**, dans une zone qui ne contient aucun texte ; le nom, l'effet et
la rareté vivent en dehors. Rien de ce qui bougera ne peut donc rendre quoi que ce soit
illisible — la question ne se posera même pas.

Sur l'écran d'ascension, **fondre et fusionner disparaissent** : on y choisit des bêtes, pas de
la poussière, et leurs boutons y étaient de toute façon inertes puisque l'écouteur vit sur le
panneau de l'album.

### Les cinq œufs

Ils étaient le **même 🥚 tous les cinq**, et c'était le pire endroit du jeu où économiser un
dessin : un œuf est **l'objet qu'on regarde le plus longtemps**. Une bête reste à l'écran le
temps de la vendre ; un œuf mythique couve quarante-cinq minutes, et pendant ces quarante-cinq
minutes il occupe la scène à lui tout seul.

| Œuf | Couleur | Motif |
|---|---|---|
| commun | terre | des taches |
| rare | bleu | trois bandes |
| épique | violet | des losanges |
| mythique | or | une couronne de rayons |
| merveille | ivoire | une spirale gravée |

**Deux signes et non un.** La couleur vient de la rareté, comme partout ailleurs dans le jeu ;
le motif est propre à chaque sorte. Une forme se lit là où une couleur ne se lit pas — à
trente-deux pixels, de loin, ou pour qui distingue mal le violet du bleu. Le second signe ne
coûtait rien à dessiner et double ce qui sépare les cinq coquilles.

Ils sortent de **la même filière que les bêtes** : une grille de caractères dans
`art/grilles/oeufs.txt`, et `node tools/pixel.js rendre oeufs` produit les SVG. La silhouette y
est **calculée et non tapée** — trente-deux lignes de trente-deux caractères écrites à la main
se décalent d'un pixel sans qu'on le voie, et cinq fois de suite ce sont cinq œufs qui n'ont
plus la même forme.

`vérifier` signale sur ce fichier une **« dérive de style » : c'est voulu**. Le contrôle est
écrit pour les cinq âges d'une même lignée, qui doivent se ressembler ; ici les cinq stades sont
cinq objets distincts, et leur couleur est justement ce qui les sépare. Les autres défauts, eux,
ont été corrigés à la source : le générateur reprend mot pour mot la règle des « cellules
isolées » et les absorbe avant d'écrire.

**L'emoji reste en repli**, comme partout : `setCreature` le repose si le fichier manque, et
rien dans le jeu ne dépend de la présence du dossier `art/`.

Un piège a été trouvé en branchant les dessins : la vignette écrivait l'emoji de l'œuf par
`textContent`, ce qui vide l'élément **sans prévenir le cache de `setCreature`**. Le cache
croyait l'image encore là et refusait de la reposer — une case qui avait montré un œuf ne
remontrait plus jamais de bête. Invisible tant que les œufs étaient des emojis, immédiat dès
qu'ils ne l'ont plus été.

### La colonne se calme

Trois défauts se ressemblaient sans qu'on les ait rapprochés : **du texte qui change tout seul
fait sauter ce qui est en dessous.**

    « … En réserve : 3. »        au bout d'une description qui se replie
    « 3 loups, 2 ours, un… »     l'énumération de la pension, à chaque ponte
    « … un clic vaut 8 s »       la ligne des boosts, à chaque image

Aucun de ces textes n'est faux ; ils sont tous **dans un bloc qui se replie**, si bien que
gagner ou perdre un mot fait gagner ou perdre une ligne — et tout ce qui suit descend d'un
cran. La colonne clignotait plusieurs fois par minute, toute seule.

#### Ce qui bouge sort du flux

**La réserve d'œufs a sa propre case**, en chiffres tabulaires, à côté du prix : `×3`,
`×47`. Elle ne pousse plus rien.

**La pension annonce un nombre**, pas une liste : « En réserve : 12 œufs promis. » Le détail
— quelles lignées, en quelles quantités — passe à l'infobulle : il se consulte, il ne se
surveille pas. *La règle du secret a suivi le texte* : une lignée d'un rang jamais rencontré
ne se nomme pas davantage dans une infobulle que dans une ligne.

**La ligne des boosts réserve deux lignes** et n'en change plus.

#### Et beaucoup de texte disparaît

**Une rangée de boutique tient sur une ligne.** « C'est par là que tout le monde commence »
est une jolie phrase, et elle occupait une ligne de la colonne pour toujours. Elle est à
l'infobulle ; la rangée d'un œuf montre son nom, ce qu'on en a, son prix. Les descriptions qui
restent — l'incubateur, l'enclos, les améliorations — tiennent sur **une seule ligne coupée par
des points de suspension**, le reste dans l'infobulle : la colonne devient une liste qu'on
parcourt au lieu d'un texte qu'on relit.

**L'aide des réglages a d'abord été repliée derrière un bouton** — six paragraphes qui
expliquaient les trois automates, une trentaine de lignes en permanence pour des règles qu'on
comprend à la première lecture. La version suivante les a supprimées : voir juste en dessous.

#### Second passage de rabot

La `2.3.0` avait replié l'aide des réglages derrière un bouton. La `2.4.0` la **supprime** —
ainsi que trois autres choses, et le raisonnement est le même à chaque fois : *ce qui ne sert
qu'une fois ne doit pas occuper l'écran pour toujours.*

**Les réglages n'ont plus que leurs titres.** Trois intitulés, trois rangées de segments, et
**une seule explication** — celle de la revente, la seule règle du panneau qui ne se devine pas
en bougeant un bouton. Ont disparu : l'introduction, l'explication de l'acheteur, les deux de
l'évolution, et les **trois notes calculées** qui disaient sous chaque consigne ce qu'elle
allait produire. Elles étaient justes ; elles faisaient trente lignes.

Le bouton « à quoi ça sert ? » disparaît avec elles : il n'avait plus rien à replier.

**Le nid n'existe pas quand il n'y a plus de place.** Il s'affichait en grisé avec « le nid est
occupé » et « attends que le couple ait fini » — un emplacement qu'on propose sans pouvoir le
remplir, et deux phrases pour s'en excuser. Une place qui n'existe pas ne se dessine pas ; les
lignes de couples au-dessus disent déjà pourquoi.

**La pension ne compte plus.** Le « 1 / 4 » de l'en-tête et la ligne qui annonçait la réserve
sont retirés. Ce qu'ils disaient se lit là où on va le chercher : les lignes de couples disent
ce qui travaille, le nid dit ce qu'on peut encore composer, et les œufs produits se comptent en
boutique, dans la case qui leur a été faite en `2.3.0`.

*Une conséquence à connaître* : la ligne de réserve était le seul endroit qui nommait les
lignées promises, et donc la seule surface où s'appliquait la règle « une lignée d'un rang
jamais rencontré ne se nomme pas ». Cette surface n'existe plus ; la règle continue de valoir
partout ailleurs.

#### Le banc ne voyait que les boutons

`querySelectorAll` n'indexait que les `<button>` de `index.html`. La boucle qui repliait l'aide
parcourait des **paragraphes** : elle tournait donc à vide dans le banc, et rien n'aurait
signalé qu'elle ne repliait rien. Le banc indexe maintenant tout ce qui porte une classe — et un
élément qui a déjà un nœud sous son identifiant réutilise celui-là, sans quoi deux objets
décriraient le même élément.

Il lit aussi **ce qu'ils disent**, pour les balises sans enfants de mise en page. Un paragraphe
dont le banc ne lit pas le texte est un paragraphe qu'aucun scénario ne peut vérifier : on
saurait qu'il est là, jamais ce qu'il raconte. C'est ce qui permet au scénario de la `2.4.0`
d'affirmer que la seule explication restante parle bien de vendre.

### Les consignes, en segments

Les seize menus déroulants des réglages sont devenus **seize rangées de boutons**, comme le tri
de l'enclos.

    IL VEND LES COMMUNES
    [ jamais ][ enfant ][ adolescent ][█ adulte █][ ancien ][ légende ]
    Mûres à l'âge adulte et au-dessus — 6 000

**Pourquoi.** Un menu **cache** ses options : il faut l'ouvrir pour savoir ce qu'on peut
choisir, et le refermer pour voir ce qu'on a choisi. Deux gestes, et rien de visible entre les
deux. Un segment montre les six possibilités et le choix actuel d'un seul coup d'œil — c'est
l'argument qui avait déjà fait remplacer le menu de tri par le sien.

**Ce que le menu portait et qu'une pastille ne peut pas : le prix.** « Mûres à l'âge adulte —
6 000 » ne tient pas sur un bouton. Le chiffre passe donc **sous** le segment, pour le seul
choix actif : six prix affichés d'un coup n'aidaient personne, celui qu'on vient de choisir
aide vraiment.

**Et il est enfin juste.** Le menu annonçait la valeur de *base* et ne bougeait jamais ; la
phrase, elle, compte le négoce, le Renom et les cartes de l'album pour la vente, l'intendance
et le péage pour l'évolution. Une consigne qui ment de trente pour cent ne se règle pas.

« Jamais » se marque en **gris** là où les autres choix se marquent en vert : ce n'est pas un
choix comme les autres, c'est l'absence de consigne — rien ne travaille.

**La table décide de tout**, et c'est le second gain. Les libellés par rareté étaient écrits en
dur dans `index.html`, quinze fois ; ajouter la cinquième rareté avait demandé d'y revenir à la
main, ligne par ligne. Un rang de plus ne coûte plus rien, et la page n'a plus un seul
`<select>`.

### Les trophées

Douze, sous les statistiques. Le jeu comptait sans jamais rien attendre — dix-sept nombres qui
montent, et pas un seul objectif nommé depuis que les jalons ont laissé la place aux jetons. Un
nombre qui monte sans que rien ne l'attende reste un nombre.

**Un trophée ne donne jamais de puissance.** Ni multiplicateur, ni prime, ni pièce. C'est la
règle qui les sépare des jalons qu'on vient justement de démonter : un trophée qui pèse sur
l'équilibrage redevient un jalon déguisé, et il faudrait alors le *viser* plutôt que le
rencontrer. Ils ne paient qu'en reconnaissance, et c'est assez. Un scénario du banc le vérifie
— on les décroche tous et on regarde que ni le clic, ni les enclos, ni la bourse n'ont bougé.

**Deux sortes.** Six se voient toujours, décrochés ou non : ce sont des **objectifs**, et ils
disent au joueur où va le jeu — première éclosion, cinquante formes, une légende, le premier
million, une ascension, cinq cartes équipées. Six restent **invisibles** jusqu'à leur
décrochage : ce sont des **surprises**, et les annoncer les tuerait, puisque leur seul contenu
est qu'on ne les attendait pas. Le compte `1 / 12` s'affiche quand même — savoir qu'il en reste
ne dit pas lesquels.

Parmi les cachés : **La plonge**, pour la première assiette. *« Ça arrive à tout le monde, et à
personne deux fois. »*

**Quatre sont venus avec la fusion** en 2.32.0 — deux objectifs, deux surprises : `★ Deux
étoiles` et `✦ Trois étoiles` disent où va l'album ; `✧ Poussière` (fondre sa première carte)
et `🔥 Fondeur` (en fondre cinquante) attendent d'être décrochés. Ils portent le compte à
**seize, dont huit visibles**.

**Ils traversent l'ascension**, comme les compteurs : ils comptent une vie de fichier, pas une
partie. Un trophée qu'on perdrait en ascensionnant punirait le geste que le jeu demande.

Chaque test se lit **sur l'état, jamais sur un événement** : c'est ce qui permet de les vérifier
dix fois par seconde sans rien mémoriser, et de rattraper ceux qu'une version précédente
n'aurait pas encore su compter.

### Les statistiques

Dix-sept nombres en quatre groupes — le temps, la ferme, les rencontres, les records.

**Ils comptent la vie du fichier, pas la partie.** C'est la seule règle qui compte : l'ascension
efface la ferme, les pièces et les améliorations, et si elle effaçait aussi les compteurs, le
seul endroit qui garde la mémoire du joueur deviendrait le seul qui l'oublie.

La table `STATS` décide de tout et le rendu la parcourt sans rien savoir : ajouter un compteur
est une ligne, et la mise en page suit. Chaque valeur est une fonction, pas un nombre — l'écran
se relit à l'ouverture, et rien ne se calcule tant qu'il est fermé.

Un compteur ajouté après coup trouve son zéro : les statistiques sont **fusionnées** à la
relecture, pas remplacées, comme les améliorations.

### La sauvegarde en clair

La partie ne vit que dans le stockage local d'un navigateur. Le vider, changer de machine ou
ouvrir la page en navigation privée l'efface **sans retour** — c'est la seule perte du jeu que
rien ne rattrape, et l'écran `💾` est le seul qui la répare.

**Garder** se fait de deux façons : un fichier `eclosion-AAAAMMJJ-hhmm.json` qui se range tout
seul par ordre chronologique, ou le texte copié au presse-papier — à coller dans une note, un
mail à soi-même, n'importe où hors du navigateur. Le presse-papier peut être refusé (il
demande un contexte sécurisé, ce qu'une page ouverte en `file://` n'est pas) : le
téléchargement reste donc le chemin principal, et la copie un raccourci qui peut échouer sans
conséquence.

**Restaurer** accepte un fichier ou du texte collé, et affiche **ce que le fichier contient
avant d'écraser quoi que ce soit** — nombre de bêtes, pièces, cartes, ascensions, format et
date. C'est la seule protection qui compte : le risque d'une restauration n'est pas de rater
le geste, c'est de restaurer le mauvais fichier sur une bonne partie. Le bouton reste fermé
tant que le texte ne tient pas, et ce qui est refusé dit pourquoi.

Deux règles qui ne se devinent pas :

- **Un format plus récent est refusé.** Migrer vers l'avant est impossible ; charger quand
  même donnerait une partie silencieusement abîmée. Un format plus *ancien* passe, et `load()`
  le migre comme il migre n'importe quelle vieille sauvegarde.
- **La date repart à maintenant.** Restaurer une copie n'est pas rentrer d'une absence : sans
  ça, un fichier vieux d'une semaine offrirait au chargement les huit heures de ferme
  automatique que le plafond hors-ligne autorise — un cadeau pour un geste qui n'en est pas
  un.

La restauration **recharge la page** plutôt que de rebrancher l'état à chaud : le démarrage
refait la boutique, les menus, les intervalles et le rattrapage dans le bon ordre, et une
restauration doit ressembler exactement à une ouverture de page.

## Équilibrage

Toutes les valeurs sont regroupées en haut de `game.js`, entre les commentaires
« Données ». Rien n'est en dur ailleurs. Les chiffres actuels sont un point de départ
crédible, pas une vérité — ils sont faits pour être retouchés en jouant.

### Cent niveaux, cinq âges

**Une bête a une vie et un seul compteur.** Le niveau court de 1 à 100 et ne redescend jamais.
Les cinq âges sont des tranches sur cette échelle, et l'évolution est le **péage** entre deux
tranches : arrivée au dernier niveau de son âge la bête est *mûre*, son niveau se bloque là,
et seul le paiement le débloque.

| Âge | Niveaux | Croissance | Un niveau dure | Valeur par niveau | Péage | Vaut, mûre |
|---|---|---|---|---|---|---|
| enfant | 1 → **15** | 2 min 30 | 10 s | +14 % | — | 30 |
| adolescent | 16 → **35** | 3 min | 9 s | +10,5 % | 200 | 500 |
| adulte | 36 → **65** | 15 min | 30 s | +6,8 % | 3 000 | 6 000 |
| ancien | 66 → **85** | 1 h | 3 min | +10,5 % | 40 000 | 80 000 |
| légende | 86 → **100** | 6 h | 24 min | +14 % | 600 000 | 1 500 000 |

15 · 20 · 30 · 20 · 15, et les péages tombent pile sur 15, 35, 65, 85. Le coût du péage comme
la valeur se multiplient ensuite par la rareté (×25 rare, ×600 épique, ×15 000 mythique) ; les
durées, elles, ne bougent jamais.

**Le temps par niveau monte à chaque âge** — 6 s, 9 s, 30 s, 3 min, 24 min. C'est ce qui fait
que l'enfance défile pendant que la légende se mérite. Sans aucune automatisation : mûre à
1 min 30, adulte à 4 min 30, ancienne à 19 min, légende à 1 h 20, niveau 100 à 7 h 20.

#### Ce que dit un œuf

Un bouton de la boutique récitait trois chiffres : la durée de couvaison, la rareté garantie,
et la chance de monter d'un cran.

> Couve en 45 s. Commune. Au-dessus : 1 sur 1 000 de rare.

Le troisième était le pire. **Annoncer « 1 sur 1 000 de rare » transforme la seule vraie
surprise de l'éclosion en statistique qu'on regarde tomber** — et une chose qu'on chasse ne
s'affiche pas. C'est la même règle que pour les fonds à venir, et que pour la plonge, dont la
professeure ne nomme jamais la vaisselle.

Il en reste une phrase, qui ne donne pas un chiffre mais une raison :

| | |
|---|---|
| Œuf commun | C'est par là que tout le monde commence. |
| Œuf rare | Le premier qui se réfléchit avant de l'acheter. |
| Œuf épique | On n'en achète pas par distraction. |
| Œuf mythique | Il en sort des dieux. Prends ton après-midi. |

**Rien n'est perdu.** La rareté est dans le nom du bouton, la durée se lit sur la scène dès
qu'un œuf couve et dans la ligne des boosts — et celle du mythique se devine dans sa phrase
sans y être écrite.

Cinq fonctions sont mortes avec ce changement et ont été retirées : `pourcent` et `de` ne
servaient qu'à composer ces statistiques, et `EVO_RABAIS`, `primeCout` et `primePrise`
traînaient depuis le passage de l'intendant en prime.

#### L'ouverture, resserrée trois fois

L'âge enfant a été rallongé deux fois : 45 s à l'origine, 90 s en 2.18.0, **150 s depuis la
2.29.0** — dix clics par niveau au lieu de trois. Un niveau qui tombe en trois clics n'est pas
un palier, c'est une case qu'on traverse.

Mais allonger ne suffisait pas. **Mesuré au banc** sur un joueur qui clique quatre fois par
seconde, mène ses bêtes à l'âge adulte et achète toujours le moins cher à sa portée :

| | avant | après |
|---|---|---|
| première vente | 34 s | 49 s |
| Force du clic | 1 min 08 | **3 min 17** |
| Couveuse | 1 min 25 | **4 min 08** |
| Éleveur | 4 min 48 | **15 min 59** |
| Incubateur | 5 min 39 | 18 min 48 |
| première évolution | 7 min 57 | 28 min 30 |
| Acheteur automatique | 14 min 32 | 40 min 56 |

Le jeu passait en pilote automatique **avant qu'on ait compris ce qu'on automatisait** : la
couveuse tombait à une minute vingt-cinq, et les cent premiers clics — les seuls où l'on
regarde vraiment une bête — duraient une demi-minute.

**Deux leviers tirés ensemble : on gagne moins, et on clique plus.** L'œuf commun passe de 12
à 18 et sa couvaison de 30 à 45 secondes ; une commune mûre ne vaut plus 40 mais 30. La marge
d'un cycle tombe de 28 à 12 pièces — deux fois et demie moins — pour une fois et demie plus de
travail. Le tout se multiplie : trois fois plus long sur toute l'ouverture.

**Ce qu'on ne touche pas, et pourquoi.** Le prix des automates : ils n'étaient pas trop bon
marché, c'est le revenu qui arrivait trop vite, et les monter aurait déplacé le mur sans
changer le rythme. Et **l'adolescent** — une première version le resserrait aussi, la mesure a
tranché : au bout d'une demi-heure le joueur n'avait toujours qu'un enclos. Ces tables se
multiplient entre elles, ralentir deux âges ne ralentit pas deux fois mais indéfiniment. Le
problème n'était que dans les cent premiers clics.

**Chaque niveau paie.** Le multiplicateur de valeur suit une courbe géométrique de 0,15 à 1,00
à l'intérieur de chaque tranche : un niveau vaut donc entre +7 % et +14 % de prix de vente. Il
n'y a plus un seul palier mort, la barre qui se remplit rapporte toujours quelque chose. Les
bornes ne bougent pas — une bête mûre vaut toujours la valeur de son âge, une bête fraîchement
évoluée toujours 15 % de la sienne.

#### Ce que ça corrige

Avant, une bête traversait trois échelles empilées qui racontaient trois histoires
différentes : le palier (1 → 5), l'étape de vie (enfant → ado → adulte) et la taille (grand →
démesuré). Les deux dernières étaient **remises à zéro à chaque évolution**. Le badge affichait
donc `enfant`, `ado`, `p.2`, puis `enfant` à nouveau — et ce n'était pas qu'un mot : la bête
rétrécissait vraiment de moitié à l'écran, jusqu'à ×0,37 si elle avait été engraissée.

Le plus révélateur, c'est que **les dessins disaient déjà le contraire du texte**. Chaque forme
portait un glyphe juvénile qui était exactement le glyphe adulte de la forme précédente (Alevin
🐟 → Carpe 🐟 → Centenaire 🐠 → Serpent 🐍 → Léviathan 🐉), et le code affichait littéralement
le dessin du palier `n − 1` tant que la bête n'était pas adulte. Les images formaient déjà une
seule croissance continue ; seul le vocabulaire bouclait sur lui-même.

Les quatre-vingt-quinze glyphes juvéniles sont partis avec le problème. Une forme par âge, et
la silhouette change **au moment où l'on paie** — pas trois niveaux plus tard.

#### Rien ne recule, jamais

C'est la règle qui tient tout le reste, et elle est vérifiée par construction :

- **le niveau** ne dépend que de la croissance avalée, qui ne fait que monter ;
- **la taille à l'écran** ne se lit ni sur l'âge ni sur l'embonpoint séparément — l'un monte
  au moment où l'autre se dégonfle — mais sur le total de croissance avalé, plus un petit bond
  fixe à chaque évolution pour qu'on voie ce qu'on vient de payer ;
- **la valeur** monte à chaque niveau, et l'évolution la multiplie par 1,8 à 2,8 sur le coup.

L'embonpoint aussi survit désormais à l'évolution. Ça ne donne rien de plus : la taille divise
les secondes de mangeoire par la durée de l'âge **courant**, quatre à six fois plus longue à
chaque cran. Engraisser tôt puis évoluer rend donc exactement ce que les mêmes secondes
auraient rendu plus tard. L'épithète se dégonfle d'elle-même — un *adulte démesuré* fait un
*ancien colossal* — sans qu'on ait à confisquer quoi que ce soit.

### Raretés

**La pyramide compte 30 lignées : 10 communes, 10 rares, 4 épiques, 3 mythiques et 3 merveilleuses.** L'ère rare
est passée de quatre à dix en alpha 2.3.0 — les communes avaient été étoffées au fil du temps
pendant que les autres ères restaient à leur compte d'origine, si bien qu'on voyait la même
bête un œuf sur quatre à l'ère rare contre une sur dix à l'ère commune, alors que la rare dure
plus longtemps.

Les six nouvelles — araignée, cerf, ours, papillon, tortue, chat — ont été choisies sur la
**silhouette** et non sur le thème : huit pattes, une ramure, une masse, des ailes larges, une
carapace basse, un félin. Deux lignées qu'on distingue mal en vignette de 32 pixels sont deux
lignées pour le prix d'une.

Deux axes indépendants, à ne pas confondre : l'**âge** est la progression d'une bête au fil de
sa vie, la **rareté** est la lignée dont elle est issue et ne change jamais. L'âge, c'est le
travail ; la rareté, c'est la chance.

Les deux axes sont calés pour **s'enchaîner** plutôt que se concurrencer. Chaque rareté est
une ère, pas un bonus : on épuise ce que les communes peuvent donner avant que les rares
n'ouvrent.

| Rareté | Valeur | Mûre enfant → mûre légende | Coût des quatre péages |
|---|---|---|---|
| commune | ×1 | 40 → 1,5 M | 643 200 |
| rare | ×25 | 1 000 → 37,5 M | 16,1 M |
| épique | ×600 | 24 000 → 900 M | 385,9 M |
| mythique | ×15 000 | 600 000 → 22,5 Md | 9,65 Md |

**Le coût du péage suit la rareté.** C'est le pivot de tout l'équilibrage : sans lui, une rare
tombée par chance atteignait l'âge légende pour le prix d'une commune et court-circuitait toute
la progression.

**Chaque œuf coûte 0,35 bête de l'ère précédente menée au bout** — la même proportion sur les
trois transitions. On ne s'offre donc un œuf rare qu'après avoir mené des communes à la légende,
un épique qu'après des rares, et ainsi de suite.

**Tous les œufs payants se remboursent à l'âge ancien**, jamais avant : une règle unique, quelle
que soit l'ère.

Rythme mesuré sur une partie simulée de quatre heures, joueur cliquant quatre fois par
seconde : couveuse à 2 min, éleveur à 3 min, acheteur à 9 min, mangeoire à 10 min, marchand à
28 min, évolution automatique à 64 min, **ère rare à 3 h 34**.

⚠ Cette mesure date d'**avant la baisse des prix de l'alpha 1.5.0**. L'œuf rare coûtant
désormais 300 000 au lieu de 600 000, l'ère rare s'ouvre nettement plus tôt — mais le chiffre
exact n'a pas été remesuré, et il ne se déduit pas d'une division par deux : le revenu
n'est pas constant pendant les trois heures et demie. À refaire tourner.

### Les quatre œufs

Un œuf par rareté. Chacun donne surtout la sienne, avec une **chance de tomber au-dessus de
1 sur 1 000**, la même à toutes les raretés. L'œuf mythique n'a rien au-dessus de lui : il
garantit.

| Œuf | Prix | Couvaison | commune | rare | épique | mythique | chance de monter |
|---|---|---|---|---|---|---|---|
| Œuf commun | 18 | 45 s | 99,9 % | 0,1 % | — | — | 1 sur 1 000 |
| Œuf rare | 300 000 | 3 min | — | 99,9 % | 0,1 % | — | 1 sur 1 000 |
| Œuf épique | 7,50 M | 12 min | — | — | 99,9 % | 0,1 % | 1 sur 1 000 |
| Œuf mythique | 180 M | 45 min | — | — | — | 100 % | — |

**La couvaison s'allonge avec la rareté.** Une bête précieuse doit se faire attendre, sinon la
rareté n'a pas de poids : un mythique qui éclosait en quinze secondes comme un têtard ne
valait rien à regarder. Ça donne aussi enfin une raison de monter la couveuse — elle divise la
durée par son niveau.

**La couveuse n'a plus de plafond.** Elle s'arrêtait à 5, parce que sur du commun la couvaison
ne pèse qu'un millième du cycle et qu'un incubateur suffit à nourrir vingt enclos. L'argument
ne valait que pour la première ère : un œuf mythique couve quarante-cinq minutes, et c'est la
seule file du jeu qui reste manuelle quand tout le reste est automatisé. Les incubateurs
restent le meilleur achat tant qu'on couve du commun — ils montent en 1,6 par cran au lieu de
1,9 — mais la couveuse redevient le bon levier quand ce qu'on couve est cher.

Débit mesuré, par incubateur et par heure, avec une couveuse de niveau 3 : 327 communs,
59 rares, 14 épiques, 3 mythiques.

**Un œuf ne peut donner que sa rareté ou celle juste au-dessus.** Pas de raccourci : on
n'atteint une mythique qu'avec des œufs épiques, qu'on ne s'offre qu'avec l'argent des rares.
L'œuf mythique, n'ayant rien au-dessus de lui, garantit.

**La montée est passée de 3,5 / 12 / 25 % à 1 sur 1 000.** À l'ancien taux, quatre œufs
épiques suffisaient à sortir une mythique : la montée n'était plus un coup de chance mais la
façon normale de changer d'ère, et l'échelle des prix ne servait à rien. Elle redevient un
cadeau — et **le vrai chemin vers l'ère suivante est la bourse**, pas la loterie : on s'offre
un œuf plus rare quand on peut se le payer.

Ce que ça coûte, et c'est assumé : on ne voit presque plus de montée. Avec 327 œufs communs
par heure et par incubateur, elle tombe une fois toutes les trois heures au lieu d'une fois
toutes les deux minutes.

Les prix suivent la règle des ères : **chaque œuf coûte 0,35 bête de l'ère précédente menée à
l'âge légende**, à l'identique sur les trois transitions. C'est ce qui interdit de sauter une ère.

### Un œuf cher est un investissement, pas un lot

**Tous les œufs payants se remboursent à l'âge ancien, jamais avant.** Une mythique payée 180 M
ne vaut que 600 000 mûre à l'âge enfant — la vendre là serait ruineux.

Résultat net, œuf et péages déduits, à chaque âge mûr :

| Œuf | enfant | adolescent | adulte | **ancien** | légende |
|---|---|---|---|---|---|
| commun (12) | +28 | +288 | +2 788 | +36 788 | +856 788 |
| rare (300 000) | −299 000 | −292 500 | −230 000 | **+620 000** | +21,1 M |
| épique (7,50 M) | −7,48 M | −7,32 M | −5,82 M | **+14,6 M** | +506,6 M |
| mythique (180 M) | −179,4 M | −175,5 M | −138,0 M | **+372,0 M** | +12,7 Md |

### Le rouge se cantonne au début de la vie

Une bête chère passe le plus clair de son existence sous le prix de son œuf : une rare ne le
repasse qu'en pleine tranche ancienne. Un bouton rouge qui reste rouge pendant les trois quarts
d'une vie cesse d'être un avertissement pour devenir un décor — et on finit par vendre à perte
en l'ignorant.

L'alerte se cantonne donc au **début** de la vie, et chaque rareté a droit à un âge de plus
que la précédente : c'est là que la méprise est possible, et seulement là.

| Rareté | enfant | adolescent | adulte | ancien | légende |
|---|---|---|---|---|---|
| commune | vert | vert | vert | vert | vert |
| rare | **rouge** | neutre | neutre | vert | vert |
| épique | **rouge** | **rouge** | neutre | vert | vert |
| mythique | **rouge** | **rouge** | **rouge** | vert | vert |

Le vert tombe pile à l'âge ancien, à toutes les raretés — c'est la règle de remboursement
énoncée plus haut, rendue visible sans un mot.

C'est la mécanique voulue : ce qu'on achète avec un œuf cher, c'est le droit d'investir, pas
un gain immédiat. Elle demande de rester attentif, et c'est très bien — mais elle ne doit
jamais être **silencieuse**. Deux garde-fous :

- Chaque bête retient **le prix de l'œuf dont elle sort**, et le bouton *Vendre* a trois états
  au lieu de deux : **rouge** tant que la méprise est possible, **neutre** quand la bête vaut
  encore moins que son œuf mais qu'on est censé le savoir, **vert** quand la vente rembourse
  vraiment. Le rouge ne dure donc plus toute la vie — voir « Le rouge se cantonne au début »
  plus bas — et il ne s'allume que **si rien n'est prévu pour l'y mener**. Deux façons de ne pas s'alarmer, et elles ne se racontent pas pareil : ou
  la bête est déjà à l'âge qu'il faut et n'a plus qu'à finir de grandir, ou c'est l'évolution
  automatique qui va l'y mener — « son œuf a coûté 180,0 M, ton évolution la mènera à l'âge
  ancien, où elle vaudra 1,20 Md ». Alarmer un joueur qui a tout bien réglé serait le pire des
  deux mondes.
- **Le marchand automatique ne touche qu'aux communes par défaut.** Un troisième réglage
  élargit sa portée rareté par rareté ; tant qu'on ne le fait pas, il ne peut pas brader un
  mythique à 600 000. Le réglage prévient quand on lui ouvre les mythiques.

La lignée est tirée **à la mise en couvaison**, pas à l'éclosion — c'est ce qui permet de
recalculer une absence sans rejouer le hasard. Le joueur, lui, ne la découvre qu'à l'éclosion,
et une lignée non commune déclenche un accord qui la distingue. Elle prend aussi la scène —
mais **seulement si la scène était libre** : voir la règle de l'interface plus bas.

#### La réserve se vide toute seule

**Poser un œuf qu'on a déjà acheté ne s'achète pas.** Un incubateur libre prend l'œuf le plus
rare de la réserve, sans amélioration et sans rien coûter.

C'était le prix caché de l'achat par lots : dix œufs pris d'un coup rentraient en réserve et se
replaçaient un par un, à chaque éclosion, pendant toute leur durée de vie. Le bouton *max*
promettait du confort et rendait la boucle plus pénible que l'achat à l'unité. Et ce n'était
pas une décision qu'on demandait au joueur — l'œuf est payé, l'incubateur tourne à vide, il
n'existe aucune raison de dire non.

**L'acheteur automatique garde la moitié qui se paie : dépenser.** Il se règle sur la sorte
d'œuf à racheter, et n'intervient que **lorsque la réserve est sèche**. S'il n'a pas de quoi
payer la sorte demandée il laisse l'incubateur vide : rabattre sur du commun trahirait la
consigne. C'est le bon partage — dépenser à ta place est une décision, poser un œuf déjà acheté
n'en est pas une.

### Treize mots que les noms n'ont pas le droit d'employer

L'interface affiche l'âge et la taille dans deux colonnes, à un centimètre du nom. Un nom qui
reprend un de ces mots dit donc la même chose deux fois — ou, pire, le contraire :

| Ce qui s'affichait | Le problème |
|---|---|
| `Crocodile ancien` à l'âge **adulte** | le mot désignait l'âge d'après |
| `Béhémoth ancien` à l'âge **ancien** | le nom et la colonne se répétaient |
| `Rongeur colossal` · taille **normale** | le nom contredisait la colonne |
| `Grand Sphinx` · taille **normale** | idem |

La règle est donc : **aucun des cinq noms d'âge ni des six noms de taille** — enfant,
adolescent, adulte, ancien, légende, grand(e), énorme, colossal(e), titanesque, démesuré(e) —
n'apparaît dans le nom d'une forme. Les 135 noms la respectent.

Neuf formes ont changé, et chacune a gagné au change : le mot générique a laissé place à une
espèce réelle ou à un nom propre, ce qui est le registre du reste du bestiaire.

| Lignée | Âge | Avant | Après |
|---|---|---|---|
| Crocodile | adulte | Crocodile ancien | **Sarcosuche** — le crocodilien cuirassé, ce que le dessin montre |
| Crapaud | ancien | Colosse fangeux | **Crapaud-tourbière** — la mousse et le bois sur son dos annoncent `crapaud-montagne` |
| Insecte | ancien | Scarabée-titan | **Scarabée-hercule** — le dessin porte déjà sa corne |
| Rongeur | ancien | Rongeur colossal | **Castoroïde** — le castor géant de la préhistoire, et la lignée passe par 🦫 |
| Méduse | ancien | Cnidaire colossal | **Cyanée** — la plus grande méduse du monde |
| Cerf | adulte | Grand cerf | **Dix-cors** — terme de vénerie pour le cerf enfin adulte |
| Golem | ancien | Colosse de pierre | **Monolithe** |
| Golem | légende | Titan de granit | **Ymir de granit** — le géant dont le corps devint la terre |
| Sphinx | légende | Grand Sphinx | **Harmakhis, l'horizon** — le nom que l'Égypte donnait au Grand Sphinx |
| Béhémoth | ancien | Béhémoth ancien | **Béhémoth éternel** |

**Rien à migrer.** Une sauvegarde ne stocke que des clés de lignée et des numéros d'âge, jamais
un nom affiché : la collection d'une partie en cours traverse le renommage sans rien perdre.

### Une bête menée au bout paie au clic

**Trois plafonds à la fois** : l'âge légende, le niveau cent, et le dernier rang de taille.
Les trois ensemble, jamais un seul — une commune mûre à l'âge enfant est déjà « au max de sa
tranche », et si elle comptait, c'est toute la ferme qui compterait.

Le troisième est un vrai bout. L'embonpoint est logarithmique, donc il ne sature jamais en
théorie ; mais l'échelle des rangs, elle, s'arrête :

| Rang | Ce qu'il coûte |
|---|---|
| grand | 0,7 × la croissance de l'âge |
| énorme | 2,6 × |
| colossal | 9,6 × |
| titanesque | 54 × |
| **démesuré** | **579 ×** |
| *(le cran d'après, s'il existait)* | *7 400 ×* |

Treize fois plus pour un cran de plus : personne n'irait. C'est la fin de la progression d'une
bête, et `rankOf` le dit déjà en ne rendant plus de suivant.

**Ce qui manquait, c'est que rien ne le disait.** Au dernier rang le nom cesse de changer, la
taille à l'écran est plafonnée, et la valeur continue de grimper de façon imperceptible : on
cliquait sur une bête finie sans que rien n'arrive.

#### Ce qu'un clic rend alors

Les secondes qu'il aurait fait grandir, converties en rente, **au cinq-centième**. Le taux n'est
pas décoratif : sans lui, un clic de fin de partie — 408 secondes, primes et martelé compris —
vaudrait onze pour cent de la valeur de la bête, et **neuf clics égaleraient une vente**.

Mesuré au banc sur une légende mythique chromatique menée au dernier rang : un clic vaut
**2,45 secondes de sa rente**, et il faut environ **mille cinq cents clics pour égaler une
vente** — trois minutes de clic continu. Cliquer cette seule bête rapporte alors à peu près
autant que la rente passive de vingt enclos pleins : *l'actif égale le passif sans l'écraser.*

Le gain passe par `clickGain`, donc **la force du clic, le martelé et la frénésie le
nourrissent tous les trois** — c'est précisément ce qui leur manquait en fin de partie, où le
clic cessait de peser. Et par `renteOf`, donc le tigré et les primes de rente aussi.

#### Seulement sous la main du joueur

**La carte ocellée clique à ta place.** Si elle encaissait, elle deviendrait une machine à
monnaie automatique et la mécanique produirait l'inverse de son intention : au lieu de pousser
à cliquer, elle rendrait le clic inutile en le déléguant.

`mainDeCarte` est déjà levé pendant ses clics, et la plonge s'en sert déjà pour se refuser à
elle — le précédent existait. Sous sa main à elle, on retombe sur l'embonpoint, comme avant.

### Le bonheur et la frénésie

Une bête gagne du bonheur **quand elle est en scène**, et elle seule. Chaque palier de présence
tire au sort un cadeau, et le cadeau ne donne qu'une chose : **le clic compte double**, dix,
vingt ou trente secondes selon le palier atteint.

| | |
|---|---|
| un palier | 90 s de présence |
| chance au palier | 35 % |
| durée offerte | 10 s au 1er palier, 20 s au 2e, 30 s ensuite |
| plafond | 60 s en réserve — deux ×2 ne feront jamais un ×4 |

**En scène, et pas dans l'enclos.** C'est la règle qui rend la chose bornée : une ferme de
quarante enclos n'en tire pas quarante fois plus qu'un enclos unique, puisqu'on ne regarde
jamais qu'une bête à la fois. Sans elle, la frénésie serait permanente passé le milieu de
partie — exactement ce qu'on ne veut pas. Elle a aussi le mérite d'être la vraie définition de
« garder » : ce n'est pas posséder, c'est passer du temps avec.

**Mesuré sur une heure devant la même bête** : 11 cadeaux, un toutes les cinq minutes et demie,
**9 % du temps passé à ×2** — soit un clic moyen à ×1,09. C'est un cadeau, pas une amélioration.

**Le clic, et rien d'autre.** Ni les automates, ni les prix, ni la rente. Le clic est ce que le
joueur fait de ses mains, et c'est la seule chose qu'un cadeau doit récompenser. Le doublement
se pose à la source, dans `clickPower()` : tout en découle, y compris les décomptes en clics
(« 12 clics → niv. 8 ») qui annoncent d'eux-mêmes qu'il en reste deux fois moins à donner.

**Rien ne se fabrique pendant une absence.** Ni bonheur ni cadeaux : vingt frénésies gagnées
pendant la nuit expireraient toutes avant qu'on ait posé un doigt sur l'écran, et elle est
heureuse parce que tu es là, pas parce que le temps passe. Le compte à rebours d'une frénésie
déjà en cours, lui, s'écoule pendant l'absence comme tout le reste : on rentre les mains vides.

**Une ligne, pas une colonne.** Le bonheur ne change ni le prix de la bête, ni sa rente, ni sa
taille — lui donner une case dans la grille des trois axes aurait défait ce que cette grille
venait de clarifier. Il vit donc sur une ligne à part, juste en dessous : un cœur, une jauge
fine, le compte des paliers, et la frénésie en cours quand il y en a une.

### Variantes

Une variante est une **identité**, tirée à l'éclosion et gardée à vie. C'est ce qui en fait une
collection, et le brouillon direct des gènes du jalon 4 : le jour où la reproduction arrive,
tout ça s'hérite.

**La teinte** est la seule qui se voit. Un `filter: hue-rotate()` recolore vraiment l'emoji,
ce qui multiplie le bestiaire visible sans un seul dessin — et règle le problème des lignées
où les cinq formes partagent le même glyphe.

| Teinte | Fréquence | Valeur |
|---|---|---|
| ordinaire | 52 % | ×1 |
| cendré | 11,5 % | ×1,10 |
| écarlate / azur | 9,5 % chacun | ×1,15 |
| jade | 7 % | ×1,20 |
| améthyste | 5 % | ×1,25 |
| doré | 3 % | ×1,30 |
| albâtre | 1,6 % | ×1,40 |

**Le prodige** ignore la lignée : une bête sur **8 192** naît *chromatique*, quelle que soit
sa rareté — on peut avoir un têtard chromatique. Halo doré battant, et elle naît **protégée
d'office** : perdre une bête sur huit mille parce qu'un automate l'a vendue avant qu'on l'ait
vue serait impardonnable.

**La chance est passée de 1 sur 500 à 1 sur 8 192.** À une bête sur cinq cents, le chromatique
tombait toutes les demi-heures sur une ferme automatisée : c'était une variante fréquente, pas
un coup de chance, et on finissait par en vendre. Il redevient quelque chose qu'on raconte, et
qu'on garde.

Deux conséquences à connaître. Le jalon d'ascension *avoir un chromatique en enclos* devient un
objectif de longue haleine plutôt qu'une étape — il reste franchissable, mais il ne se planifie
plus. Et la carte d'album **nacrée** prend enfin sa valeur : plafonnée à ×2 sur tout
l'album, elle ramène la chance à 1 sur 4 096.

**Un chromatique vaut exactement un cran de rareté** : ×25. Une commune chromatique vaut une
rare ordinaire, une rare chromatique vaut une épique, et ainsi de suite jusqu'en haut. La
règle tient en une phrase et se propage d'elle-même à toute l'échelle.

| Mûre à l'âge enfant | Valeur |
|---|---|
| commune | 40 |
| **commune chromatique** = rare | **1 000** |
| **rare chromatique** = épique | **25 000** |
| **épique chromatique** = mythique | **600 000** |
| **mythique chromatique** | **15 M** |

À ×5 il ne pesait rien : la plus belle bête du jeu restait cinq fois sous le moindre tirage
rare, et le seul coup de chance qui se voit à l'écran ne se sentait pas dans la bourse. Mais à
×125 il cassait la partie — et pour une raison qui n'est pas le chiffre lui-même.

**Le coût d'évolution ne suit que la lignée.** Mener n'importe quelle bête à la légende rend 2,3
fois ses péages, à toutes les raretés. Un chromatique, lui, paie les péages de sa lignée pour
la valeur d'une autre : il rend donc 2,3 × son multiplicateur.

| Menée à la légende | Ce qu'elle rend par pièce de péage |
|---|---|
| commune | ×2,3 |
| rare | ×2,3 |
| commune chromatique à ×125 | **×291** |
| commune chromatique à ×25 | ×58 |

À ×125, une commune chromatique rapportait 291 fois sa mise quand tout le reste du jeu en
rapporte 2,3 : ce n'était plus un coup de chance, c'était la meilleure ligne de jeu, et de
loin. À ×25 l'affaire reste excellente — c'est bien ce qu'on attend d'un tirage sur cinq
cents — sans écraser le reste. Si elle pèse encore trop à l'essai, le levier suivant n'est
plus ce chiffre mais les péages.

**Le tempérament** ne se lit qu'en texte, mais il agit : `grow` accélère la montée en niveau,
`fat` accélère l'engraissement. Docile (neutre), nerveux (croissance ×1,25 / engraissement
×0,85), placide (l'inverse), glouton (engraissement ×1,4), farouche, rêveur. L'effet porte sur
la **vitesse** de croissance, pas sur les bornes — les seuils de niveau sont les mêmes pour
tout le monde, et la durée de référence des rangs de taille reste celle de l'âge, sinon un
tempérament vif cumulerait deux bonus.

**Le motif** — uni, tacheté, rayé, moucheté, marbré, tigré, zébré, nacré, ocellé, martelé —
n'a aucun effet sur la bête vivante. C'est de l'identité pure, jusqu'au jour où elle devient
une carte : là, il décide de tout.

### Une seule épithète, accolée au nom

Les variantes ne s'affichent pas en liste sous le nom. La bête porte **un seul mot en plus
du sien** : `Varan cendré`, `Carpe gloutonne`, `Wyverne dorée`. Empiler
`chromatique · écarlate · rayé · placide` donnait une fiche technique à déchiffrer sous
chaque animal ; un nom composé se retient et se raconte.

L'épithète retenue est **celle qui distingue le plus** : le prodige d'abord, puis la teinte —
c'est elle qu'on voit à l'écran —, puis le tempérament, et le motif quand la bête n'a rien
d'autre à montrer. Une bête ordinaire, docile et unie garde son nom nu.

Ce qui est écarté du nom **reste lisible là où ça compte** : le tempérament dans la ligne des
boosts (`gloutonne ×1,40`), la teinte dans le multiplicateur de valeur. Rien ne se perd, tout
se lit au bon endroit.

L'épithète **s'accorde en genre**. Chaque forme féminine est marquée `'f'` dans sa
déclaration (18 des 95 : carpe, wyverne, méduse, salamandre, licorne, chimère…), et chaque
teinte et tempérament porte sa forme féminine à côté de la masculine. Sans ça, la moitié du
bestiaire se serait appelée « Carpe cendré ».

Les noms à titre reçoivent leur épithète **sur le nom propre**, pas à la fin :
`Khépri doré, porteur du soleil` — jamais `Khépri, porteur du soleil doré`.

### Ce que vaut la mangeoire

**L'embonpoint est le seul axe facultatif du jeu.** Il ne débloque plus rien : la rente s'ouvre
à l'âge adulte, et le marchand ne réclame une taille minimale que si on possède une mangeoire.
Ce que fait vraiment la mangeoire, c'est **remplir l'attente au péage** — la bête est mûre, les
pièces de l'évolution ne sont pas encore là, elle grossit en attendant. Et ce temps n'est pas
perdu : l'évolution ne remet plus l'embonpoint à zéro.

Le rendement de l'engraissement ne dépend **pas de l'âge** — 0,83 à l'enfance comme à la légende
avec les mêmes niveaux. Il ne dépend que du **rapport entre le niveau de mangeoire et celui
d'éleveur** : l'un fait tourner l'enclos, l'autre l'immobilise pour grossir.

À niveaux égaux, en rendement d'enclos comparé à y enchaîner des bêtes :

| Rang visé | Rendement |
|---|---|
| grand | **1,24** — vaut mieux que recycler |
| énorme | 0,82 |
| colossal | 0,41 |
| titanesque | 0,12 |
| démesuré | 0,02 |

Il y a donc un optimum net à *grand*, puis une longue traîne de plaisir payé en temps. C'est
la décision qu'on veut, et elle se règle une fois pour toutes dans la taille exigée par le
marchand — un réglage qui n'apparaît qu'une fois la mangeoire achetée.

La mangeoire était auparavant à 2 500 × 2,0 avec un débit de ×2 : monter au niveau 5 coûtait
**quatorze fois** le prix de l'éleveur, pour un rendement de 0,83 à niveaux égaux — donc
jamais rentable, et en pratique 0,17 puisqu'on ne pouvait s'offrir que le niveau 1. Elle suit
maintenant la même courbe de prix que l'éleveur, à cinq fois le total : elle reste un
supplément, elle n'est plus un piège.

### Garder une bête

Le bouton **☆ Garder** met une créature hors de portée des automates : ni vendue par le
marchand, ni faite évoluer — on veut parfois garder une forme précise, et non la pousser
jusqu'à la légende. La mangeoire continue de l'engraisser, elle. Le bouton *Vendre* se verrouille
tant qu'elle est gardée.

Ce que ça coûte est une place d'enclos immobilisée, et c'est tout l'intérêt : on choisit de
continuer l'aventure avec une bête plutôt que de la faire entrer dans la chaîne.

### La rente

Tout le reste du jeu pousse à vendre : l'enclos est la ressource rare, et une bête gardée est
un enclos qui ne tourne pas. **La rente est la seule règle qui paie pour ne pas vendre.**

**La rente s'ouvre à l'âge adulte — niveau 36.** Une bête de cet âge ou plus rapporte toute
seule, sans rien faire, même absent : sa propre valeur de vente **étalée sur une heure**.

Elle était auparavant branchée sur l'embonpoint (*énorme* ou plus), c'est-à-dire sur la
mauvaise échelle. C'était un seuil que personne ne devine, qui obligeait à comprendre la
mangeoire avant de toucher le premier revenu passif, et qui coûtait des dizaines de milliers de
secondes d'enclos avant de rapporter la première pièce. **L'âge ouvre la rente, la taille
l'augmente** — l'embonpoint est déjà dans la valeur de vente, donc il la pousse tout seul, sans
qu'on ait besoin d'une règle de plus.

Ses facteurs sont exactement ceux du prix de vente — **niveau, âge, rareté, teinte, taille** —
si bien qu'une bête rapporte à proportion de ce qu'elle vaut. Le **chromatique** est le seul à
recevoir un bonus par-dessus : sa rente est **doublée**, en plus du ×25 que sa valeur porte
déjà. C'est la bête qu'un joueur garde, c'est elle qu'on récompense.

| Bête commune | Valeur | Rente |
|---|---|---|
| adulte fraîche, niv. 36 | 900 | 0,25 / s |
| adulte mûre, niv. 65 | 6 000 | 1,67 / s |
| ancienne mûre, niv. 85 | 80 000 | 22,2 / s |
| légende mûre, niv. 100 | 1,5 M | 417 / s |
| légende mûre **rare** | 37,5 M | 10 417 / s |
| légende mûre **mythique** | 22,5 Md | 6,25 M / s |
| légende mûre **mythique chromatique** | 2,81 Bn | 1,56 Md / s |

Le montant baisse (417 / s au lieu de 708 pour une commune au bout), mais le **volume** monte :
toutes les bêtes de l'âge adulte et au-dessus rapportent, là où seules les engraissées le
faisaient. C'est le vrai changement, et il tient dans les clous :

- **au moment où elle s'ouvre**, elle pèse environ 2 % du revenu du joueur — qui vient
  justement de payer 200 + 3 000 pièces de péages pour ce premier adulte. Elle arrive comme
  une confirmation, pas comme un raccourci ;
- **sur une ferme qui tourne** — dix enclos étalés de l'enfance à l'ancien, éleveur 10 — elle
  pèse 1,1 % du débit.

Elle ne remplace jamais l'élevage, et le rapport se calcule d'une ligne : un enclos qui
recommence rapporte `valeur / (croissance / éleveur)`, un enclos qui garde `valeur / 3600`.
**Cycler gagne dès que le niveau d'éleveur dépasse la croissance divisée par 3 600** — soit
0,3 à l'âge adulte, 1,3 à l'ancien, 7,3 à la légende. Un joueur qui produit des légendes a un éleveur
autour de 15 : cycler lui rapporte alors le double de garder, exactement comme avant. L'ancien
seuil à *énorme* était 1,7 fois plus haut, donc la rente d'aujourd'hui laisse **plus** de place
à l'élevage que celle d'hier, pas moins.

Pousser la taille rapporte, mais bien moins vite que ça ne coûte. La rente prolonge donc la
longue traîne de la mangeoire sans la rendre optimale : elle **console** le joueur qui pousse
une bête pour le plaisir.

**Le marchand vise la même bête que la rente.** Réglé à partir de l'âge adulte, il vend celles
qui rapportaient déjà ; sa note le dit alors, et ☆ *Garder* est la parade.

Un effet secondaire heureux : le seuil devient **annonçable**. « À l'âge adulte — niveau 36 —
elle se mettra à rapporter toute seule » se lit sous la barre. « Encore 12 000 secondes de
mangeoire pour atteindre *énorme* » ne se lisait nulle part.

La rente s'affiche à trois endroits : `+1,67 / s` à côté de la bourse pour le total,
`rente +1,67 / s` dans la ligne des boosts de la bête en scène, et le bandeau de retour compte
les pièces gagnées pendant l'absence.

### Automatisations

Le jeu commence entièrement à la main : un œuf ne couve pas et une créature ne grandit pas
tant qu'on ne clique pas dessus.

**Les compteurs suivent une règle unique, et n'affichent jamais deux unités à la fois** :
des clics tant que rien n'avance tout seul — annoncer « 15 s » alors qu'aucune seconde ne
s'écoule serait un mensonge — et des secondes dès qu'un automate tourne. Faire cohabiter les
deux (`30 s ou 30 clics`) donnait deux mesures pour une même attente et invitait à marteler
une barre qui montait déjà sans nous.

La règle vaut aussi pour une bête mûre qui s'engraisse : `33 clics → grand` sans mangeoire,
`17 s → grand` avec.

**Une ligne détaille les boosts en cours**, sous le compteur : la durée de base, ce qu'elle
devient avec ce qu'on possède, et chaque facteur qui y contribue.

> `Croissance 30 s par niveau → 8 s · nerveux ×1,25 · éleveur ×3 · un clic vaut 9 s`
> `Engraissement +12,6 s par seconde · glouton ×1,40 · mangeoire ×3 · rente +1,67 / s`
> `Couvaison 30 s → rien sans toi · un clic vaut 1 s`

La durée annoncée pour la croissance est celle d'**un niveau**, pas de la tranche entière :
c'est l'attente que le joueur vit réellement, et c'est elle que les automates raccourcissent.

Sans elle, on achetait des niveaux sans jamais voir ce qu'ils changeaient.

Les deux premiers achats n'accélèrent pas la partie, ils **mettent le temps au travail** —
c'est le moment précis où le jeu bascule de clicker à idle.

Les quatre améliorations se montent **niveau par niveau, sans plafond**. Le prix du
prochain niveau vaut `base × mult^niveau` : l'effet monte linéairement pendant que le prix
double presque, donc chaque niveau se mérite et les rendements décroissent d'eux-mêmes.

| Amélioration | Base | Mult. | Effet au niveau *n* |
|---|---|---|---|
| Force du clic | 30 | ×1,6 | *n*+1 secondes gagnées par clic, à la vitesse des automates · **sans tiers** |
| Couveuse automatique | 120 | ×1,9 | ×*n* sur la vitesse de couvaison |
| Éleveur automatique | 500 | ×1,65 | ×*n* sur la vitesse de croissance |
| Mangeoire automatique | 1 000 | ×1,65 | *n*×3 s d'engraissement par seconde |

Il n'en reste que quatre : l'acheteur, le marchand, l'évolution et l'intendant sont passés en
[primes](#les-primes) en 2.21.0. Quatre choses qui montent, vingt qui n'arrivent qu'une fois.

L'échelle est calée pour qu'une partie **bascule en pilote automatique en une demi-heure**
plutôt qu'en une heure et demie. Simulation d'un joueur cliquant quatre fois par seconde,
achetant toujours l'option la moins chère à sa portée et menant ses bêtes à l'âge adulte :
couveuse à 1 min, éleveur à 6 min, acheteur à 14 min, mangeoire à 24 min, marchand à 35 min.
Aux anciens prix, le marchand tombait à 78 min.

**L'éleveur et la mangeoire se partagent la vie de la bête** : l'éleveur pousse les jeunes
jusqu'à sa maturité, la mangeoire prend le relais et engraisse les bêtes mûres. Aucune des deux
ne dépense de pièces.

### Les carrefours — les primes à choix

Une prime à choix : **trois routes, on en prend une, et les deux autres sont perdues** pour ce
cycle.

**Perdues, et pas remises à plus tard.** Remises à plus tard, ce n'est pas un choix mais un
ordre d'achat : on finit par tout avoir et la décision ne coûte rien.

**Elles se rejouent à chaque cycle**, puisque les primes repartent de zéro à l'ascension. C'est
ce qui les sauve de l'usure : un choix définitif à l'échelle de la partie se regrette, un choix
qu'on refait tous les cycles s'expérimente.

#### La fin de partie cessait d'être un choix

**Mesuré sur la table : des dix dernières primes, neuf étaient de la pension.** Un joueur qui
ne l'élève pas n'avait plus rien à acheter passé quinze milliards — les trois familles globales
s'arrêtent là, et tout le reste améliorait des nids.

Le défaut n'était pas des *marches vides* : l'échelle des prix est saine, ses rapports tiennent
entre 1,2 et 2,7 d'un bout à l'autre. Le défaut était **monothématique**.

Quatre primes reprennent les trois leviers que rien ne touchait après le milieu de partie :

| Prix | | Ce qu'elle prend |
|---|---|---|
| 20 Md | 🗝️ **Le grand œuvre** | le péage : évolutions −25 % |
| 50 Md | 🛒 **Marché de gros** | le prix des œufs : −25 % |
| 120 Md | 🤜 **Poing d'acier** | le geste : clic ×2 |
| 400 Md | 🜄 **Le dernier carrefour** | trois routes, une dernière fois |

**Les familles globales n'ont pas gagné de cinquième cran**, et c'était tentant : quatre crans à
5, 10, 15 et 20 % font cinquante pour cent par famille, un chiffre annoncé et tenu ailleurs.
L'étirer aurait réglé la variété en cassant une règle. Un scénario du banc le garde.

#### La contrainte qui décide si c'est réussi

Les trois routes doivent différer **en nature, pas en chiffre**. « +10 % de vente / +10 % de
rente / +10 % de vitesse » n'est pas un choix, c'est un menu : on prend le plus gros nombre et
on n'y pense plus.

Chaque carrefour offre donc **un prix qui baisse, une vitesse qui monte, et un geste qui pèse**
— trois grandeurs qui ne se comparent pas, donc trois façons de jouer.

| Le premier carrefour · 700 000 | |
|---|---|
| 🪙 **La bourse** | les œufs coûtent un quart de moins |
| ⚡ **L'ardeur** | tout ce qui pousse va un tiers plus vite |
| ✊ **La poigne** | chaque clic porte deux fois plus loin |

| Le second carrefour · 25 M | |
|---|---|
| 🧬 **Le péage allégé** | faire monter une bête coûte un tiers de moins |
| 🏷️ **Le grand négoce** | +20 % de valeur, vente comme rente |
| 🛏️ **Le long repos** | +30 % de rente |

Un scénario du banc vérifie que les trois routes d'un carrefour touchent **trois leviers
distincts** : c'est la seule garde contre le retour du menu.

#### L'option est rangée sous sa propre clé

Tout le jeu continue de lire `prime('…')` sans rien savoir des carrefours, et une route peut
servir de garde comme n'importe quelle prime. Un carrefour est « fait » quand une de ses routes
est prise, jamais par sa propre clé — et sa case affiche alors **le nom de la route retenue** :
« Le premier carrefour » ne dirait plus rien, et c'est justement ce qu'on veut relire plus tard.

#### Un carrefour ouvre un écran

Trois routes ne tiennent pas dans une case de la grille des cinq, et surtout **un choix
définitif ne doit pas se prendre d'un clic distrait** au milieu de quarante-sept primes. La case
ouvre donc un écran, et les trois routes y sont **côte à côte, à égalité de place** : c'est la
mise en page qui dit qu'aucune n'est la bonne réponse. Une liste verticale aurait suggéré un
ordre, et un ordre suggère un meilleur choix.

**Il se ferme sans choisir.** Rien ne presse — la case reste, l'argent aussi, et le carrefour se
rouvre quand on veut. Même règle que le jeton d'ascension : *un choix qu'on peut remettre ne
réclame rien.*

### La constellation

**Deux mots, deux endroits, aucun recouvrement.**

| | **Les primes** | **La constellation** |
|---|---|---|
| où | en jeu | à l'ascension |
| payées en | pièces | jetons |
| durée | le cycle, puis effacées | acquises pour toujours |
| ce qu'elles font | pousser ce qu'on a | **ouvrir ce qu'on n'a pas** |

#### Le prix doré d'une carte

Chaque carte emportée dans une même ascension renchérit la suivante d'un facteur **φ ≈ 1,618**.

| Carte | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| coût | 1 | 2 | 3 | 5 | 7 | 12 |
| cumul | 1 | 3 | 6 | 11 | 18 | 30 |

**Pourquoi il fallait l'écrire.** La `beta 3.0.0` a fait *regagner* les jetons à chaque cycle,
ce qui a abattu le mur de fin de partie — et ouvert un trou dans le même geste : si les jetons
reviennent et qu'une carte en coûte un, on emporte cinq cartes à chaque ascension,
indéfiniment. L'album se remplit alors sans qu'aucune décision ne soit prise, et la forge, qui
demande neuf cartes pour une seule trois-étoiles, devient triviale.

φ plutôt que ×2 : le doublement écrase trop vite — la quatrième carte coûterait huit jetons
quand la première en coûte un, et on n'en prendrait jamais plus de trois. Le nombre d'or monte
assez pour qu'on hésite, assez peu pour qu'on puisse viser la cinquième.

#### Le jeton redevient une bourse

Il était devenu une *lecture* en `3.0.0` — le nombre de paliers franchis par le sommet du
cycle. Avec deux éviers qui puisent au même endroit, il faut un **solde** :

    en main  =  ce qui reste en bourse  +  ce que le cycle vient de créditer

Et **le reste demeure au saut**. Les jetons partaient tous, employés ou non ; c'était le prix de
sauter trop tôt, et ça n'a plus de sens depuis qu'ils ont un second emploi. *Garder ses jetons
pour la constellation est une décision, pas un gâchis.*

#### Le tronc porte les nombres, les branches portent les règles

Et **le tronc est le chemin vers les branches** : chaque rang atteint ouvre les nœuds de son
niveau. C'est la seule structure qui règle une tension autrement insoluble — un joueur prend
toujours le `+2 %` avant le nœud subtil, parce que c'est lisible et immédiat. Côte à côte au
même prix, les règles ne seraient jamais achetées. En faisant du tronc le chemin, on n'achète
plus « le nombre *ou* la règle » : le nombre est ce qui **donne accès** à la règle.

**Vingt rangs**, alternant valeur et vitesse, +2 % chacun, de 1 à 4 jetons — cinquante jetons
pour +20 % de chaque. C'est délibérément peu : les primes d'une seule famille en donnent
cinquante à elles seules, et par cycle. Le tronc n'est pas la récompense.

**Ni rente ni chance.** La rente est déjà perpétuelle et déjà trop forte ; un multiplicateur
permanent par-dessus aggraverait ce que le plan dit qu'il faut corriger. La chance a déjà le
nacré et l'*Œil exercé*.

#### Quatre nœuds, et ce qu'ils valent vraiment

| Nœud | Rang | Prix | Ce qu'il ouvre |
|---|---|---|---|
| L'acheteur est à toi | 2 | ✦ 3 | l'acheteur automatique ne se rachète plus |
| Le marchand est à toi | 4 | ✦ 4 | idem |
| L'évolution est à toi | 6 | ✦ 5 | idem |
| La pension est à toi | 8 | ✦ 8 | le bâtiment est acquis |

**« Ne se rachète plus » ne fait pas économiser.** Au dixième cycle, 400 000 pièces se gagnent
en une seconde. Ce que le nœud change, c'est que le bâtiment est là **dès la première seconde**
du cycle suivant — une prime ne se dévoile qu'à l'approche de son prix, cinq à la fois, donc la
pension n'existait pas avant d'avoir grimpé jusqu'à 400 000.

Une prime tenue par la constellation **sort d'elle-même** de « ce qui reste à prendre » : elle
n'occupe plus une des cinq cases de la grille. Elle s'y affiche marquée `✦`, pour qu'on sache
d'où elle vient.

#### Le sang — ce que tu emportes

Deux nœuds qui touchent l'ascension elle-même, et ce sont les seuls du plan qui n'attendent
aucune fonctionnalité manquante :

| Nœud | Rang | Prix | Ce qu'il change |
|---|---|---|---|
| **Le prix doré s'adoucit** | 12 | ✦ 16 | chaque carte coûte un cran de moins — la deuxième au prix de la première |
| **Le sommet compte plus** | 15 | ✦ 20 | un palier de jetons de plus, à chaque cycle |

Ce sont les seuls achats du jeu qui **changent la valeur de tous les achats suivants** : d'où
leur prix et leur rang. Le second ne crédite jamais sur zéro — un cycle où l'on n'a pas tenu une
pièce ne doit rien rapporter, sinon sauter aussitôt après un saut donnerait un jeton gratuit.

#### L'atelier de forge a migré ici

Il s'ouvrait tout seul à la première carte, ce qui était **une non-décision** : un atelier qu'on
n'a jamais choisi d'ouvrir n'est pas un pan de jeu, c'est un écran de plus. Il demande maintenant
un nœud — et le moment tombe juste, puisqu'on gagne ses premiers jetons au premier saut,
celui-là même qui donne les premières cartes.

**On ne retire rien à personne** : la migration donne le nœud à qui avait déjà des cartes ou
avait déjà forgé. C'est la règle de toutes les migrations de ce fichier, et la seule qui rende un
changement de règle acceptable à quelqu'un qui jouait déjà.

#### Ce que la constellation ajoute se voit

On achetait `+2 % de valeur` et **rien à l'écran ne bougeait** : la ligne des boosts sous la
scène montrait l'album et la frénésie, jamais les coefficients globaux. C'est le même défaut que
la bête menée au bout, qui absorbait les clics sans rien dire — *un achat qui ne se sent pas est
un achat qu'on regrette.* La ligne annonce désormais `valeur ×1,04 · vitesse ×1,02`.

#### La géométrie porte la règle

La constellation est un **arbre**, en SVG et sans librairie : le tronc monte du bas en ondulant
légèrement — une colonne droite se lit comme un tableau, une ligne qui ondule se lit comme un
arbre, et c'est tout ce qui sépare les deux.

**Chaque nœud de branche s'accroche au tronc exactement au rang qu'il exige.** « La pension
demande le rang 8 » se voit avant de se lire, et on comprend d'un regard qu'il faut monter pour
l'atteindre. Une liste l'aurait dit en mots ; un arbre le montre.

Le **chemin parcouru** se peint par-dessus le chemin entier : c'est une barre de progression
sans en dessiner une.

Les branches **alternent leur écart** au tronc. Trois nœuds à des rangs voisins — l'acheteur au
2, la forge au 3, le marchand au 4 — se poseraient sinon l'un sur l'autre : quarante-six pixels
séparent deux rangs, et un cercle en fait cinquante-six.

Quatre états qui se distinguent sans les lire : **prise** est pleine, **ouverte** est cerclée
vif, **chère** est cerclée en pointillé — la porte est là, il manque des jetons — et **close**
s'efface. Le nom et le prix sont écrits à côté du nœud, jamais seulement au survol : *un arbre
dont il faut survoler chaque nœud pour savoir ce qu'il fait n'est pas une carte qu'on lit, c'est
une devinette.*

#### Un nœud fermé se montre, il ne se cache pas

C'est l'inverse de la doctrine du dévoilement qui gouverne la boutique et les primes, et c'est
voulu : **là-bas on cache ce qu'un débutant ne peut pas s'offrir, ici on montre une carte qu'on
lit pour décider où aller.** Un arbre dont on ne voit pas les branches n'est pas un arbre, c'est
une file d'attente.

#### Ce qui n'est pas dans cette version

Le plan décrit une vingtaine de nœuds en trois branches. **La moitié ouvre des choses qui
n'existent pas encore** — l'hérédité, le marché, l'œuf mystère, les chromatismes. Un nœud
apparaît le jour où sa fonctionnalité existe : une constellation pleine de portes qui ne mènent
nulle part serait pire que pas de constellation.

Et la **révision des 45 primes** avec les **primes à choix** n'y est pas non plus, pour une
raison de méthode : réviser l'ordre des primes est un travail de *mesure*, et la mesure change
sous les pieds si l'économie de l'ascension bouge dans la même version.

### Les primes

Vingt achats **uniques**, en petites cases, qui s'allument dès qu'on a de quoi les payer.

Une amélioration à niveaux dit toujours la même chose — *« couveuse niv. 5 → niv. 6 »* — et
cinquante achats plus tard elle la dit encore. Une prime dit une chose et une seule, puis se
tait : c'est ce qui permet d'en écrire vingt différentes plutôt qu'une répétée vingt fois.

| Prix | Prime | Ce qu'elle fait |
|---|---|---|
| 250 | 💗 Soins attentifs | le bonheur monte deux fois plus vite |
| 600 | 🪺 Nichoir | +2 incubateurs |
| 1 200 | 🌾 Paille fraîche | +2 enclos |
| 2 000 | 🥚 Acheteur automatique | rachète un œuf quand la réserve est sèche |
| 4 000 | 🪙 Négoce commun | les communes se vendent +25 % |
| 8 000 | ✊ Poigne | +3 secondes par clic |
| 15 000 | 🤝 Marchand automatique | vend les bêtes mûres |
| 30 000 | 📦 Grossiste | les œufs coûtent −20 % |
| 50 000 | 🧬 Évolution automatique | fait monter les bêtes d'âge |
| 80 000 | 🔷 Négoce rare | les rares se vendent +25 % |
| 150 000 | ⭐ Étable | les bêtes gardées ☆ ne comptent plus dans la limite d'enclos |
| 250 000 | 📋 Intendance | les évolutions coûtent −25 % |
| 500 000 | 👁️ Œil exercé | +50 % de chance de chromatique |
| 1 M | 🎁 Générosité | les cadeaux de frénésie durent deux fois plus |
| 2 M | 🔮 Négoce épique | les épiques se vendent +25 % |
| 5 M | 📜 Grande intendance | encore −25 % sur les évolutions |
| 12 M | 🏠 Couvoir | +3 incubateurs |
| 30 M | 🏞️ Pâturage | +3 enclos |
| 80 M | 👑 Négoce mythique | les mythiques se vendent +25 % |
| 200 M | 🖐️ Main preste | chaque clic compte double |

**Elles ne traversent pas l'ascension.** Ce sont des améliorations comme les autres : la ferme
repart de zéro et les primes avec elle. Seul l'album voyage.

**Trois états, trois traitements.** Éteinte, elle est grise et son glyphe est désaturé — mais
elle se voit, avec son prix. Prête, elle s'allume et son prix prend la couleur de la monnaie.
Prise, elle reste dans la grille : une case qui disparaît une fois achetée efface la trace de
ce qu'on a construit, et c'est justement ce qu'on vient voir dans une grille.

**Le négoce est le seul bonus qui ne vaut que pour une partie du bestiaire**, et c'est ce qui
en fait un choix plutôt qu'un cumul : à 4 000 pièces on n'achète pas la même chose selon qu'on
compte écouler des communes ou monter des rares.

#### Quatre améliorations les ont rejointes

L'acheteur, le marchand et l'évolution étaient déclarés dans la liste à niveaux avec un
plafond à 1 : ils ne montent pas, ils s'allument. Ils étaient donc déjà des primes, au mauvais
endroit. Et l'**intendant**, qui montait, se dit mieux en deux crans nommés qu'en trente
niveaux — d'autant qu'il coûtait `250 000 × 1,65^n` pour une remise asymptotique que presque
personne n'a poussée.

Il reste **quatre améliorations à niveaux** : la force du clic, la couveuse, l'éleveur et la
mangeoire. Quatre choses qui montent, vingt qui n'arrivent qu'une fois.

La migration v12 → v13 est **généreuse par principe** : les trois achats uniques se transposent
tels quels, et le premier achat d'intendant donne l'Intendance, le quinzième la Grande. Un cas
limite existe et se dit : un intendant poussé au-delà du niveau 26 offrait plus de 44 % de
remise et retombe à 44 %. En échange, le même effet coûte désormais 5,25 M au lieu de quelques
dizaines de millions.

### La pension

**Deux bêtes désignées, une attente, un œuf dont on connaît déjà la lignée.** La porte s'ouvre
à la 3.0.0, après être restée scellée deux versions le temps que la compatibilité et le drop
soient écrits. C'était le bon ordre : ce sont eux qui décident si la pension est un jeu ou une
imprimante — et la première table de durées en était une (voir plus bas).

**Ce qu'elle donne, et ce qu'elle ne donne pas.** Sans les merveilleuses, la pension est un
**outil de collection** et non une porte vers l'inaccessible : elle ne rend aucune lignée qu'on
ne pourrait pas acheter. Ce qu'elle rend, c'est de **viser** — un œuf mythique acheté donne une
mythique au hasard parmi trois, et la collection en demande cent trente-cinq formes. Croiser
deux loups rend un loup ; c'est tout, et c'est déjà beaucoup quand il manque le dernier âge
d'une seule lignée.

#### Les étiquettes — un milieu, un corps

Deux axes et pas un seul, parce qu'un seul ne donne qu'un oui ou non. Deux donnent **trois
crans** — tout en commun, la moitié, rien — et la règle reste devinable sans wiki : *deux bêtes
se reproduisent d'autant plus vite qu'elles se ressemblent*. Loup et ours, c'est évident ;
oiseau et crabe aussi.

| | terre | eau | ciel |
|---|---|---|---|
| **nu** | crapaud, salamandre | méduse, kraken | — |
| **écaille** | lézard, béhémoth, ouroboros | poisson, crocodile | serpent |
| **carapace** | insecte, escargot, araignée | crabe, tortue | — |
| **poil** | rongeur, loup, cerf, ours, chat, sphinx, cheval, chimère | — | chiroptère |
| **plume** | — | — | oiseau, papillon |
| **pierre** | golem | — | — |

**La pierre ne se croise avec rien.** Le golem est seul de son corps, et c'est délibéré : une
règle de stérilité doit se raconter en cinq mots, et « on ne croise pas la pierre » les tient.

L'oiseau et le papillon partagent *plume* — un papillon n'a pas de plumes, mais il a des ailes
couvertes d'écailles poudreuses, et le rapprochement dit quelque chose de vrai sur ce que ces
deux-là ont en commun. Le mot compte moins que la paire qu'il autorise.

Mesuré sur les **351 paires possibles** : 11 % à distance 0, 37 % à distance 1, 44 % à
distance 2, 7 % stériles. La plupart des couples sont donc médiocres, et le dixième qui ne
l'est pas se mérite — ce qui est exactement ce qu'on veut d'un système de sélection.

#### Ce que coûte une couvaison

    durée = (900 s + 600 s × distance + 1800 s × écart de rareté) × multiplicateur de richesse

| écart de rareté | distance 0 | distance 1 | distance 2 |
|---|---|---|---|
| 0 | 15 min | 25 min | 35 min |
| 1 | 45 min | 55 min | 1 h 05 |
| 2 | 1 h 15 | 1 h 25 | 1 h 35 |
| 3 | 1 h 45 | 1 h 55 | 2 h 05 |

…le tout **multiplié par la rareté du parent le moins rare** : ×1 commune, ×4 rare, ×16
épique, ×64 mythique. Au-delà de **24 h**, le couple est refusé plutôt que subi.

**Pourquoi la richesse et non l'écart.** La première version ne pénalisait que l'écart, et la
mesure a trouvé le trou tout de suite : deux mythiques de même corps sont à écart **nul**, donc
à durée minimale, alors que ce qui en sort vaut 180 M. Quinze minutes pour un œuf mythique —
**720 M l'heure, une imprimante à billets**. Le facteur manquant était la richesse. Le moins
rare et non le plus, parce que c'est *sa* lignée qui sort dans 99 % des cas quand l'écart est
grand. Deux mythiques passent ainsi de quinze minutes à **seize heures**.

#### Ce qui sort du couple

L'enfant prend la **lignée** d'un des deux parents — celle du moins rare presque toujours,
celle du plus rare selon la chance de son écart :

| écart de rareté | chance de prendre la lignée du plus rare |
|---|---|
| 0 | 50 % — pile ou face |
| 1 | 20 % |
| 2 | 5 % |
| 3 | 1 % |

À égalité c'est un tirage à pile ou face ; au-delà, ça devient une loterie et non un robinet.
Un pour cent sur trois crans : croiser une commune avec une mythique reste un pari, pas une
stratégie.

Il ne prend **rien d'autre** : teinte, tempérament et motif se tirent comme pour n'importe quel
œuf. C'est l'hérédité, et elle aura sa propre version.

#### La lignée promise

Un œuf de pension entre dans la **réserve ordinaire** — il profite ainsi du placement
automatique, du plafond, de l'incubateur et de tout le reste sans qu'aucun de ces mécanismes
ait à le connaître. Ce qu'il emporte en plus, c'est sa lignée, gardée dans une file par sorte
(`state.pension.dus`) : on la sert avant de tirer au hasard.

**Sans cette file, la pension ne viserait rien du tout** — deux loups pondraient un « œuf
rare », et l'œuf rare rendrait un chat. C'est la seule ligne qui fait la différence entre un
système de sélection et une machine à œufs gratuits. Le panneau dit d'ailleurs ce qui attend :
*« En réserve : loup. »*

#### Le sacrifice est dans les enclos

Les parents ne quittent pas la ferme : ils gardent leur case et **cessent de rapporter**. Ils
n'avancent plus non plus — ni au clic (qui répond *« elle couve »* plutôt que rien), ni à
l'éleveur, ni à la mangeoire ; l'évolution automatique les saute et le marchand ne les voit
pas. Parquer deux bêtes doit se sentir, et ça ne se sent que si ça coûte la seule chose qui
manque vraiment en fin de partie : **la place**.

Le prix est écrasant, et c'est voulu. Mesuré :

| couple | durée | valeur de l'œuf, par heure | rente perdue, par heure |
|---|---|---|---|
| crapaud × lézard | 25 min | 43 | ~2 M par bête |
| loup × ours | 1 h | 300 k | ~38 M par bête |
| cerf × chimère | 5 h | 1,9 M | ~1 Md par bête |
| ouroboros × béhémoth | 16 h | 11,3 M | ~27 Md par bête |

**La pension ne sera jamais une stratégie d'argent** — à aucune rareté, elle ne rend le
centième de ce que les deux mêmes bêtes rapporteraient en restant simplement là. C'est ce qui
permet de l'ouvrir sans toucher à l'économie : elle n'a qu'un usage, et c'est la collection.

#### Le plafond de la réserve

**Cinquante œufs par sorte.** Le plan le réclamait *avant* la pension et jamais après : c'est
le seul frein du hors-ligne, et une partie qui tournerait déjà sans lui rentrerait sur des
centaines d'œufs le jour où on l'ajouterait. Il borne l'achat par lots comme la ponte — et un
couple dont la sorte est pleine **garde son œuf et attend**. Le jeter punirait une absence, et
c'est précisément ce que le plafond doit éviter de faire.

#### L'écran

Un **nid** de deux cases, qu'on remplit en y glissant des bêtes prises dans la bande. Le détail
du geste et de ce qu'il a remplacé est [plus bas](#le-nid-et-le-geste-qui-le-remplit).

**La phrase sous le nid est le cœur du panneau.** Elle dit la distance, la durée et ce qui peut
sortir :

    Elles se ressemblent en tout · 1 h 00 m · un œuf de l'une ou de l'autre, à pile ou face
    Elles ont une chose en commun · 5 h 40 m · 95 % loup, 5 % ouroboros
    On ne croise pas la pierre.

Sans elle, on confie deux bêtes à l'aveugle et on attend cinq heures pour découvrir la règle.
Le refus rend une **raison** et non un booléen : un bouton grisé sans explication est la
première chose qu'un joueur ne comprend pas.

#### Les cases de l'enclos ne bougent pas

La bande a cessé d'être une **liste** pour devenir un **enclos** : autant de cases que d'enclos
possédés, chacune gardée par sa bête tant qu'elle vit. Une vente laisse un **trou à sa place**,
repris par la prochaine éclosion.

Le défaut se voyait en ×100. Le marchand vide un enclos plus vite qu'on ne vise : entre le
moment où l'œil choisit une vignette et celui où le doigt appuie, deux ventes ont eu lieu et la
bête sous le curseur n'est plus la même. **On clique alors sur une bête qu'on n'a pas choisie**
— et sur une ferme qui tourne bien, ça arrive tout le temps.

**Une case tient une seconde, puis l'enclos se retasse.** La première version figeait les
cases pour de bon, et c'était une seconde faute après celle qu'elle corrigeait : le **tri
n'était plus jamais rétabli**. Une bête vendue laissait un trou définitif, la suivante le
reprenait, et au bout de dix ventes l'enclos ne ressemblait plus à rien de trié.

Les deux besoins sont réels et ne se contredisent que **dans l'instant** : il faut que rien ne
bouge sous le curseur pendant qu'on vise, et il faut que l'ordre revienne. Une seconde sépare
les deux — assez pour faire le geste, assez peu pour que l'enclos ne dérive pas.

Le délai court depuis l'instant où l'affectation **cesse de suivre le tri**, et non depuis la
dernière vente : sinon un marchand qui vend en continu — c'est le cas en ×100, et c'est
justement là qu'on s'en plaint — repousserait le retassage indéfiniment.

**Changer le tri redistribue immédiatement**, sans attendre : c'est un geste explicite, on
s'attend à ce que tout bouge.

`subjects()` n'a pas de trous, lui, et c'est voulu : tout le jeu — la sélection, le marchand,
l'évolution — raisonne sur des bêtes, pas sur des places. Les trous n'existent qu'à l'affichage.

#### Regarder une bête la protège trois secondes

En ×100, on clique une bête pour la garder ou la vendre soi-même, et elle est déjà partie.
Trois secondes suffisent à faire le geste d'après.

**Trois exceptions à la vente avaient déjà été essayées et retirées, et celle-ci n'est aucune
des trois.** L'immunité à vie pour la bête en scène laissait invendue pour toujours celle qu'on
venait d'évoluer à la main ; la protection tant que l'onglet est visible revenait au même ; le
sursis de dix secondes depuis le dernier *clic* protégeait mal, parce que regarder une bête
n'est pas la cliquer.

Ici le déclencheur est la **sélection** — précisément le geste de regarder — et le sursis
**expire**. Aucune bête ne peut donc rester invendue, ce qui était le défaut commun aux deux
premières, et il se déclenche sur le bon geste, ce qui était celui de la troisième.

Le compte est en temps **réel** et non en temps de jeu : c'est le temps de réaction du joueur
qu'on protège, et il ne va pas cent fois plus vite parce que la ferme, elle, y va.

`☆ Garder` reste la seule protection **durable**.

#### Une bête confiée quitte la bande

Elle reste dans son **enclos** — c'est tout le prix de la pension — mais elle cesse d'être un
*sujet* : on ne la sélectionne plus, on ne clique plus dessus, on ne la vend plus, et elle ne
traîne plus dans une bande de quarante vignettes dont seize seraient inertes.

Elle est visible ailleurs, et mieux : **la ligne de son couple** dit ce qu'elle fait et depuis
combien de temps. La bande montre ce sur quoi on peut agir, le panneau montre ce qui travaille.
Et le compteur d'enclos ajoute « *· 2 en pension* », sans quoi la pension ferait disparaître des
bêtes **et** des places sans rien dire.

#### On doit pouvoir dire *laquelle* on a confiée

La ligne d'un couple montrait **deux emoji nus et deux noms de lignée** — « Crapaud × Loup ».
On confiait deux bêtes pour cinq heures sans pouvoir dire lesquelles : la rouge ? la
chromatique ? la farouche ? Et sans pouvoir vérifier que celle qu'on cherchait était bien déjà
dedans.

Depuis la `beta 2.2.0`, **une ligne par parent** : son dessin, teinté comme dans l'enclos, son
nom complet coloré à sa rareté, et une **ligne de signes** dessous.

    🐺  Louve écarlate
        ancienne géante · farouche · tigrée
    🐻  Ours chromatique
        adulte moyen · placide · uni
    ▓▓▓▓▓▓░░░░░░  2 h 14

**Le nom ne dit qu'une chose**, et [la règle de l'épithète unique](#une-seule-épithète-accolée-au-nom)
est bonne : « Louve écarlate » se lit, « Louve écarlate farouche tigrée géante » ne se lit plus.
Mais **la pension n'est pas un nom, c'est un inventaire.** La ligne de signes dit donc tout ce
que le nom a laissé de côté — et rien de ce qu'il a déjà dit : l'épithète retenue est retirée de
la liste, sinon on lirait « Louve écarlate · écarlate ».

Le nid affiche exactement la même chose, plus les **étiquettes** (`terre, poil`) qui décident de
la distance, donc de la durée : une bête doit se reconnaître partout de la même façon.

**C'est aussi ce qui rend la pause inutile pour composer un couple.** Avant, on déposait une
bête dans le nid et elle continuait de vieillir, d'être vendue et de bouger dans la bande sous
la main. Maintenant elle en sort **au moment du dépôt**. Si le marchand attrape la seconde
entre le premier dépôt et le second, **elle disparaît simplement** — et le nid le dit à la
ligne suivante.

Ce paragraphe promettait ça depuis la `beta 1.8.0` et **le code ne le faisait qu'à moitié** :
le filtre ne portait que sur les couples *déjà partis*. Une bête posée au nid restait donc dans
la bande, si bien qu'on la reprenait pour l'autre case sans s'en apercevoir, ou qu'on la
cherchait parmi quarante vignettes. Corrigé en `beta 2.2.0`. **Le nid est un engagement en
cours, pas un brouillon** — et il se défait toujours en cliquant la case, ce qui fait
réapparaître la bête à l'instant.

Le regard suit : confier la bête **en scène** la faisait disparaître de la bande sans que la
sélection bouge, et on se retrouvait à regarder une case qui n'existait plus. Le dépôt tient sa
case comme une vente le fait.

[La pause](#le-bouton-pause) reste, parce qu'arrêter sa ferme est utile pour tout le reste :
relire un réglage, compter ses enclos, regarder une bête sans la voir vieillir.

**Le verrou de la vente tient des deux côtés.** Le marchand automatique sautait déjà les bêtes
confiées depuis la `beta 1.0.0` ; maintenant la vente à la main ne les atteint plus non plus,
puisque rien ne les désigne. Deux protections écrites une seule fois.

#### L'acheteur peut se taire

C'est **le seul des trois automates qui dépense**, et c'était le seul qui n'avait pas de
« jamais » : le marchand et l'évolution en ont un par rareté depuis toujours.

Ça ne manquait pas tant que la boutique était la seule source d'œufs. Depuis que la pension en
produit, l'acheteur devient une **fuite** — il rachète au prix fort ce qu'on fabrique déjà,
pendant qu'on regarde ailleurs. Et une prime ne se revend pas : sans interrupteur, l'avoir
achetée était irréversible.

La consigne s'ajoute en tête de son menu, à la place où les deux autres ont la leur :
*« jamais — je m'en occupe moi-même »*. **La réserve continue de se vider toute seule** dans les
incubateurs libres : elle est déjà payée, et c'est justement ce qu'on veut quand la pension
tourne.

#### Un couple ne se défait plus

**Il se défaisait quand l'œuf tombait, et c'était le geste de trop** : on venait retirer deux
bêtes d'un nid vide, les reposer, revalider — toutes les seize heures, pour rien. Un couple
confié reste confié jusqu'à ce qu'on le rompe soi-même, en cliquant sa ligne.

Ce que ça change au prix : **rien**, et c'est ce qui le rend juste. Les deux parents continuent
de ne pas rapporter, indéfiniment. *On ne paie pas la ponte, on paie l'occupation.*

C'est aussi ce qui fait de la pension une **ligne de production** plutôt qu'une commande à
repasser — et donc ce qui la rend comparable à l'acheteur automatique.

#### Les quatre échelles

| Échelle | Crans | Prix |
|---|---|---|
| **les places** | 1 → 2 → 4 → 8 couples | 500 M · 30 Md · 600 Md |
| **la vitesse** | ×1,5 → ×4 → ×12 | 3 M · 10 Md · 150 Md |
| **la portée** | 2 → 3 → 5 œufs par ponte | 6 Md · 80 Md · 1 000 Md |
| **la richesse** | pèse ÷4 → ÷8 | 250 Md · 2 000 Md |

Chaque cran **remplace** le précédent, il ne s'y ajoute pas : « quatre fois plus vite » veut
dire quatre fois plus vite qu'à l'origine. C'est la seule façon d'annoncer un multiplicateur
sans que le joueur ait à multiplier. Et chaque échelle s'ouvre un cran à la fois, ce qui garde
la [grille des cinq prochaines](#la-grille-ne-montre-que-les-cinq-prochaines) lisible.

**La richesse se desserre sans se lever.** Le multiplicateur de rareté — ×64 pour deux
mythiques — est ce qui empêche la pension d'être une imprimante à billets, et c'était mesuré
avant de l'ouvrir. Mais c'est aussi ce qui la laissait à trente œufs mythiques l'heure quand la
boutique en sert des milliers. On le **divise**, on ne le supprime pas, et il ne descend jamais
sous un.

#### Ce que ça donne, mesuré

En œufs par heure, toutes les places sur le même couple :

| Couple | Pension nue | 1er cran | 2e cran | Complète |
|---|---|---|---|---|
| crapaud × lézard | 2,4 | 14 | 115 | **1 152** |
| loup × ours | 1,0 | 6 | 48 | **1 920** |
| kraken × sphinx | 0,1 | 0,6 | 5 | **411** |
| ouroboros × béhémoth | 0,1 | 0,4 | 3 | **240** |

Contre l'acheteur automatique, sur du mythique : 80 œufs/h à six incubateurs, **480 à douze**,
4 000 à trente. La pension complète est donc **du même ordre qu'un acheteur de milieu de
partie**, et elle dépasse tout le reste sur les raretés basses.

**Ce que chacun coûte, et c'est là qu'est le choix :**

- l'acheteur paie **180 M par œuf mythique**, indéfiniment — 86 Md/h à douze incubateurs ;
- la pension paie **4 000 Md une fois**, puis seize enclos qui ne rapportent plus rien —
  432 Md/h de rente abandonnée.

Le compte reste perdant : 240 œufs mythiques l'heure valent 43 Md, contre 432 Md abandonnés.
**La pension n'est toujours pas une stratégie d'argent**, et c'est ce qui tient tout le reste
en place. Ce qu'elle offre, c'est de produire au lieu d'acheter, et de **choisir la lignée**.

Le [plafond de la réserve](#le-plafond-de-la-réserve) borne les deux de la même façon : au-delà
de cinquante œufs par sorte, ce qui compte est le nombre d'incubateurs qui la vident.

#### Le nid ne se rebâtit plus sous le curseur

**Le même défaut que la bande avait avant la 2.14.0**, et le commentaire de `renderStrip` le
racontait déjà : le panneau se reconstruisait à chaque redessin, c’est-à-dire **dix fois par
seconde**.

- Le bouton disparaît **entre l’appui et le relâchement** : le navigateur n’émet alors aucun
  « click », et retirer une bête du nid ne marchait qu’un coup sur deux.
- La cible d’un dépôt est détruite **sous le curseur** pendant qu’on la survole, si bien que
  le glisser-déposer scintillait et manquait sa case.

D’où une **signature**, comme partout ailleurs dans le fichier : on ne rebâtit que si la
structure a changé — les couples, les deux occupants du nid *et leur âge*, l’ouverture, la
portée. Ce qui coule (la barre, le temps restant, la phrase) se repeint sans toucher au DOM.

**Une bête posée se reprend aussi à la main.** Composer un couple était un aller simple : seul
le clic la ressortait. La case pleine est maintenant une poignée — on la glisse sur l’autre
côté et **les deux s’échangent**, ce qui est le geste qu’on fait sans y penser pour relire un
couple dans l’autre sens.

#### Un couple bloqué ne tire pas

**Le défaut qui a rendu Sun Wukong trivial**, et il vaut d'être écrit parce que la leçon dépasse
la pension.

Le test du plafond de réserve vivait **après** le tirage de recette. Un couple bloqué relançait
donc sa recette à chaque tour de boucle — dix fois par seconde — et comme la merveille a sa
**propre** réserve, jamais pleine, elle était la seule chose que le couple pouvait encore
pondre. Une réserve d'œufs épiques pleine transformait deux golems en machine à sous tournant
à dix hertz : mesuré, **huit Wukong en une minute** de jeu accéléré, là où la médiane est de
dix-neuf heures.

> Un tirage ne doit jamais avoir lieu dans une branche qui ne peut pas aboutir.

Le hasard consommé pour rien n'est pas neutre quand une seule de ses issues, elle, aboutit.

**On bloque sur l'une des deux sorties, pas sur les deux.** Un couple de raretés différentes a
deux sorties possibles ; s'arrêter dès que l'une déborde est plus simple à raconter — *un
couple attend que sa réserve se vide* — et c'est le seul choix qui garantisse qu'un couple
bloqué reste bloqué.

Vérifié après coup sur près de dix mille pontes : 0,110 % de merveilles mesurées pour 0,100 % annoncé.

#### Ce que les primes ne touchent pas

**Aucune ne touche aux recettes**, et c'est une contrainte du
[secret](#le-rang-nexiste-pas-tant-quon-nen-a-pas-vu-une) : une prime qui ferait tomber les
merveilles plus souvent devrait le dire pour se vendre, et dirait donc qu'elles existent.

La vitesse et les places les servent par la bande — plus de pontes dans le même temps. **La
portée, elle, ne les sert pas** : le tirage se fait par *ponte* et non par œuf, parce qu'une
nichée est un événement et non cinq. Sans cette règle, la dernière prime du jeu multiplierait
par cinq la chance de toutes les merveilles d'un coup.

Le **Sang dominant** (20 M) reste à part : il double la chance que la lignée du parent le plus
rare l'emporte, sans jamais passer une fois sur deux — au-delà, le parent le moins rare
cesserait d'être celui qui sort d'habitude, et c'est sur lui que repose le multiplicateur de
durée.

#### La Chimère est un joker

**Deux chimères ne donnent pas une chimère : elles donnent n'importe quoi.** C'est le seul
couple du jeu dont l'enfant n'est ni l'un ni l'autre des parents, et c'est la chose la plus
chimérique qu'elles puissent faire — une chimère est faite de morceaux d'autres bêtes.

**De la plus commune des bêtes jusqu'à une merveille.** Le sac s'ouvre sur le rang secret une
fois sur cinquante : assez bas pour que ça n'arrive jamais quand on l'attend, assez haut pour
que ça finisse par arriver. Deux mythiques immobilisées seize heures est le couple le plus cher
du jeu ; il n'aurait aucun sens qu'il ne puisse rendre que du crapaud.

Une seule exclusion, et c'est la règle qu'on retient : **jamais une chimère.**

**Le joker reste pire que n'importe quelle recette**, et c'est la condition pour que les
recettes gardent un sens — 0,031 %/h par les chimères contre 0,083 pour la Kitsune et 0,100
pour Wukong. *On ne chasse pas une merveille aux chimères, on en trouve une.*

Pour le reste, **c'est une loterie et pas un placement** : la valeur moyenne de ce qui sort est
de l'ordre de vingt millions, contre plus de huit cents milliards de rente abandonnée. La
Chimère ne se croise pas pour gagner de l'argent, elle se croise pour voir ce qui sort.

L'écran l'annonce, contrairement aux recettes : *« n'importe quelle lignée du bestiaire, sauf
la leur »*. Ce n'est pas un secret, c'est la bête. Le pourcentage de merveille, lui, ne
s'affiche qu'une fois le rang connu.

#### La Tarasque — la seule merveille sans recette

Les deux autres se **cherchent** : on compose un couple précis et on attend. Celle-ci ne se
cherche pas, elle **arrive** — deux chimères confiées pour voir ce qui sort, et un jour c'est
elle. Elle prend la moitié du sac secret à elle seule, parce que c'est sa seule porte.

Elle est la fille des chimères au sens le plus littéral : tête de lion, six pattes d'ours,
carapace de tortue, queue de scorpion, écailles, et elle sort du Rhône. Là où la Chimère
mythique est un composite qu'on regarde, **la Tarasque est un composite qu'on compte** — et
c'est son arc : à chaque âge on reconnaît une bête de plus en elle.

| Âge | Forme |
|---|---|
| 1 | Tarasque |
| 2 | Tarasque à six pattes |
| 3 | Tarasque écaillée |
| 4 | Tarasque du Rhône |
| 5 | Tarasque, la bête de Tarascon |

Son histoire finit mal et bien à la fois, ce qui est rare : sainte Marthe l'apaise d'un
cantique, les gens de la ville la tuent pendant qu'elle se laisse faire, puis rebaptisent la
ville de son nom. **Le dernier âge ne porte donc pas sa taille mais leurs armes.**

Ce que ça coûte : 46 jours de médiane, 31 avec le Nid tiède, **15 avec le Second nid en plus**.
C'est la première chose du jeu qui donne une raison d'acheter les deux.

#### Un mythique par famille, et la Chimère n'en est pas une

La Chimère était le carrefour de la moitié des recettes, au motif qu'elle est faite d'autres
bêtes. **C'était lui prêter le rôle inverse du sien** : une chimère ne concentre pas, elle
disperse. Le carrefour d'une merveille doit dire *de quoi elle est faite*, pas seulement
qu'elle est composite.

| Mythique | Son axe | Ses merveilles |
|---|---|---|
| **Ouroboros** | ce qui gagne avec le temps | Kitsune |
| **Golem** | ce qui naît de la pierre | Sun Wukong |
| **Béhémoth** | ce qui sort de la terre | l'Olgoï-Khorkhoï, Typhon *(à venir)* |
| **Chimère** | — | aucune : elle est le joker |

Ça donne au joueur une carte mentale au lieu d'une liste — c'est ce qui permet de deviner une
recette qu'on n'a pas encore vue — et ça laisse la Chimère faire la seule chose qu'elle sache
faire.

#### Le rang n'existe pas tant qu'on n'en a pas vu une

**Rien dans le jeu ne mentionne la cinquième rareté avant la première éclosion.** C'est une
règle sur la table — `RARITY.merveilleuse.secret` — et non un `if` posé à cinq endroits : un
rang secret futur le sera sans qu'on ait à les retrouver.

Elle fuyait par cinq endroits à la fois, et aucun n'est grave pris seul :

| Ce qui fuyait | Ce que ça disait |
|---|---|
| une section de collection vide | qu'il existe un cinquième rang, et qu'il compte dix cases |
| le dénominateur `/ 150` | qu'il manque quinze formes qu'on ne peut pas atteindre |
| le trophée « Une merveille », annoncé | *« Aucun œuf n'en donne — il faut la pension, et le bon couple »* |
| la ligne de statistiques `0 / 2` | qu'il y a exactement deux bêtes à trouver |
| les trois consignes du marchand | « les merveilleuses », à qui n'en a jamais vu |

Ensemble, ils disaient tout : le rang, son compte, son mode d'obtention. Il ne restait à
découvrir que le nom des bêtes.

**On ne cache pas la récompense, on cache la question.** Un jeu qui affiche dix cases vides
transforme une trouvaille en case à cocher : le joueur sait qu'il lui manque quelque chose et
cherche comment l'obtenir. Un jeu qui n'affiche rien laisse la première Kitsune arriver sans
prévenir — et c'est le seul moment que ce rang a à offrir.

Ce qui reste visible avant, et qui suffit : **la phrase du nid**, ci-dessous. Elle ne nomme
rien, ne compte rien, ne promet rien. Et un œuf de merveille dans l'incubateur se nomme, lui —
mais à ce moment-là la pension l'a déjà pondu, et le savoir une heure trente à l'avance fait
partie de la récompense.

À la première éclosion, **tout s'ouvre d'un coup** : la section apparaît avec ses deux lignées,
le compteur passe à `/ 150`, le trophée tombe, la ligne de statistiques arrive et les trois
consignes du marchand reviennent.

#### Ce que la phrase dit, et ce qu'elle tait

Sur un couple qui porte une recette, la ligne du panneau gagne un suffixe :

    Elles se ressemblent en tout · 1 h 00 m · un œuf de l'une ou de l'autre · et peut-être autre chose

Elle ne nomme rien. Composer des couples au nid est gratuit, les essayer coûte des jours :
c'est la fouille qu'on récompense, pas la lecture d'un wiki. **Une fois la bête rencontrée**, la
phrase la nomme et donne son pourcentage — le mystère a servi une fois, et le garder ensuite ne
serait plus du mystère mais de la rétention.

La même règle vaut pour la réserve : un œuf de pension dont la lignée appartient à un rang
inconnu s'annonce comme *« quelque chose que tu n'as jamais vu »*. Lire « sun wukong » dans une
liste, ce serait apprendre la nouvelle par une note de bas de page.

#### La seconde est plus facile que la première

Une merveille se reproduit comme le reste : elle n'a pas de règle à part, et la recette n'est
le passage obligé que pour la **première**.

| Couple | Durée | Ce qui sort |
|---|---|---|
| Wukong × Golem | 20 h | 5 % Wukong — il retourne à la pierre dont il sort |
| Kitsune × Sphinx | 20 h | 5 % Kitsune |
| Kitsune × Loup | 7 h | 1 % Kitsune — la route pauvre |
| Kitsune × Chimère | 48 h | refusé : au-delà du plafond |

C'est la bonne asymétrie : elle donne une raison de **garder** une merveille plutôt que de la
vendre, ce qui est exactement ce qu'on veut d'une bête de collection. Le rang reste tenu par la
seule règle qui compte — aucun œuf n'en donne — et la première coûte un mois.

#### Les deux bêtes

**Kitsune** reprend le traitement de l'Ouroboros — le nom ne change pas, l'épithète pousse —
mais pour une raison qui lui est propre : **elle a neuf queues depuis toujours, et elle les
cache.** « Une queue par siècle » devient ce qu'elle *montre*, pas ce qu'elle acquiert. Effet
de bord : 1, 3, 5, 7, 9 — c'est la seule bête du jeu dont on lise l'âge sur le dessin.

**Sun Wukong** est l'exception du rang : il grandit pour de vrai, parce qu'il est le seul dieu
du lot à avoir une enfance. Son arc va de la pierre au ciel — *Singe de pierre*, *Roi des
singes*, *Sun Wukong*, *sous la montagne*, *l'égal du Ciel*.

Son titre complet est inutilisable, et c'est le piège de la 2.15.0 : « Le Grand Sage égal du
Ciel » contient **grand**, qui est un rang de taille, et la ligne afficherait « Le Grand Sage
égal du Ciel · taille normale ». Le scénario `noms` du banc le rejetterait. « L'égal du Ciel »
dit la même chose et passe.

Les six autres merveilles sont écrites et attendent leurs dessins : voir
[MERVEILLES.md](MERVEILLES.md).

### Le nid, et le geste qui le remplit

La pension se remplissait dans **deux menus déroulants**. Ça marchait et ça n'allait pas : on
ne *confie* pas une bête en la choisissant dans une liste, et le nom complet d'une bête —
« Châtaigne marbrée · adulte » — ne dit rien de ce qu'elle a l'air. Le geste juste est celui
de l'album : **on attrape ce qu'on voit, on le pose là où ça va.**

**Elle emprunte tout à l'album, et ce n'est pas de la parure.** Les deux écrans font la même
chose — déplacer une pièce d'un endroit vers un autre — et les apprendre deux fois serait un
coût pour rien. Mêmes zones en pointillés, même jade au survol, même vignette à gauche et texte
à droite, et surtout la même règle :

> **Le clic fait ce que fait le glisser.**

Un geste qui n'a qu'une seule façon de s'exécuter est un geste que la moitié des joueurs ne
peut pas faire — ni au doigt, ni au clavier. Dans le nid, un clic sur une case vide y met **la
bête en scène**, celle qu'on regarde donc celle à laquelle on pense ; un clic sur une case
pleine la retire. Aucun bouton de plus à l'écran.

La source du glisser est **la bande**, pas un inventaire à part : c'est le seul glisser du jeu
qui traverse deux panneaux, et c'est ce qui le rend lisible — on prend la bête là où elle vit.
Pendant qu'on en porte une, les cases vides s'allument.

### La pension s'achète

C'était un panneau offert au deuxième enclos, ce qui la posait au milieu de la colonne à un
moment où l'on n'a ni bêtes adultes ni enclos à immobiliser : **un écran dont chaque bouton
refuse.** C'est une [prime](#les-primes) désormais — 400 000, entre l'Intendance et l'Œil
exercé, c'est-à-dire dans l'ère rare, là où l'on commence à garder des bêtes plutôt qu'à les
vendre.

Comme toutes les primes, **elle ne traverse pas l'ascension**. Un couple en cours garde
toutefois le panneau à l'écran même sans la prime : sinon deux bêtes resteraient parquées
derrière un panneau disparu.

### Le bouton pause

Une ferme qu'on peut **arrêter**. Il est né pour la pension — arranger deux parents pendant
que le marchand vend, c'est arranger une bande qui bouge sous la main — et il ne lui sert
plus : depuis la `beta 1.8.0`, [une bête confiée quitte la bande](#une-bête-confiée-quitte-la-bande)
au moment du dépôt. Il reste parce qu'arrêter sa ferme est utile pour tout le reste : relire un
réglage, compter ses enclos, regarder une bête sans la voir vieillir.

En pause, rien ne pousse, rien ne rentre, rien ne couve — **et le clic ne fait rien non plus.**
Une ferme arrêtée l'est pour tout le monde, la main du joueur comprise. La scène se désature :
assez pour qu'on le remarque, pas assez pour qu'on ne voie plus ses bêtes, puisque c'est
justement le moment où on les arrange.

**Elle ne se sauvegarde pas**, et c'est délibéré. Une pause est un moment, pas un réglage :
fermer l'onglet en pause puis revenir le lendemain sur une ferme gelée serait une partie
cassée, sans rien pour dire pourquoi. Au rechargement, la ferme tourne.

**Elle ne gèle pas non plus le temps hors ligne.** La sauvegarde continue de poser son horodatage,
donc une pause de deux heures ne se rattrape pas au retour. Mettre en pause n'est pas mettre de
côté — c'est arrêter, et le temps arrêté est perdu. C'est ce qui l'empêche de devenir une façon
de jouer.

### L'encyclopédie

**Un carnet, jamais un manuel.** On clique une case de la collection et la fiche de sa lignée
s'ouvre par-dessus le jeu, comme les statistiques. Elle ne connaît **rien d'avance** : chaque
ligne se remplit en rencontrant la chose.

    LOUP
    rare · 4 formes sur 5 rencontrées · 21 écloses

    🐕 Louveteau  |  🐺 Loup  |  🐺 Loup des steppes  |  · ？  |  🌘 Fenrir, dévoreur

    Teintes — 5 / 8
      sans teinte ×13 · cendré ×3 · azur ×2 · doré ×2 · jade ×1

    Caractères — 6 / 6
      docile ×7 · nerveux ×3 · placide ×3 · farouche ×3 · rêveur ×3 · glouton ×2

    Motifs — 8 / 10
      tacheté ×4 · rayé ×4 · zébré ×3 · ocellé ×3 · uni ×2 · marbré ×2 · martelé ×2 · tigré ×1

    À la pension — 1 couple connu
      Loup × Ours    50 % · 1 h 00 m · sorti 62 fois

#### Trois vues, un onglet

La collection a **quitté la colonne latérale**. Cent cinquante cases n'ont jamais eu leur place
dans une colonne de vingt et un rem : elles y tenaient *repliées*, ce qui revient à dire
qu'elles n'y étaient pas. Et depuis la 1.9.0 chaque lignée a une **fiche** — un objet qu'on
lit, pas une case qu'on compte, et qui n'entre dans aucune colonne.

D'où un onglet dans le bandeau : **Ferme**, **Encyclopédie** et, depuis la 2.0.0,
**Forge** — chacune en pleine largeur. La ferme disparaît entièrement quand on passe à une
autre : pas de demi-écran partagé, on regarde une chose à la fois.

L'atelier de forge a la même raison d'être en pleine page que l'encyclopédie : il montre
**l'album entier** en grille, et un album mûr compte quarante cartes — qui n'entrent pas dans
une colonne de vingt et un rem.

**L'onglet ne se sauvegarde pas** : on ouvre le jeu sur sa ferme, toujours. Revenir le lendemain
sur une page de collection serait revenir à côté de sa partie.

**Aucune des deux n'apparaît avant d'avoir quelque chose à montrer** : l'encyclopédie après
trois formes rencontrées, la forge à la première carte — on ne montre pas la porte d'une pièce
vide. Et si l'une disparaît sous les pieds du joueur, on le ramène à sa ferme plutôt que de le
laisser sur une page qui n'existe plus.

#### Une carte par lignée, et non plus une case par forme

La grille de cent cinquante cases répondait bien à *« combien m'en manque-t-il »*, mais elle ne
se cliquait pas : cinq cases voisines menaient à la même fiche, et **aucune ne portait de nom**.

Trente cartes nommées, chacune avec ses cinq pastilles d'âge, répondent aux deux : la texture du
remplissage se lit toujours d'un coup d'œil, et chaque carte est une destination.

    COMMUNE · ×1
      🐸 Crapaud         ●●●○○
      ·  ？               ○○○○○
      🦎 Lézard          ●○○○○

Le glyphe est celui de la **dernière forme vue**, et non du premier âge : c'est celle qu'on a
le plus de mal à obtenir, donc celle dont on se souvient. Une lignée complète se marque, sans
qu'on ait à compter les pastilles.

#### Les filtres remplacent le pliage

Replier une rareté cachait ce qu'on ne voulait pas voir ; un filtre montre ce qu'on cherche, ce
qui n'est pas la même chose. **« Incomplètes »** est celui qui sert vraiment — c'est la question
qu'on se pose en ouvrant cette page.

Et la fiche vit désormais **à côté de la liste**, en maître-détail : cliquer une carte déplace
le regard au lieu d'ouvrir un écran modal. On ne quitte plus la liste pour lire, et on ne perd
plus sa place. Sous 62 rem les deux s'empilent, la fiche passant devant.

#### Ce qu'elle montre, et ce qu'elle tait

**Une teinte jamais croisée sur un loup n'apparaît pas** — pas même en silhouette. Seul le
dénominateur (`5 / 8`) dit qu'il en reste. C'est le choix qui coûte le plus et qui rapporte le
plus : une fiche à moitié vide ne dit pas *s'il* reste quelque chose à trouver, elle dit
seulement *combien*. Un manuel répond une fois ; un carnet se remplit.

Même règle pour les cinq âges : ceux qu'on n'a pas vus restent des silhouettes **sans nom**.
Le nom d'une forme est la moitié de la trouvaille, et l'annoncer d'avance la dépenserait.

Et une lignée jamais rencontrée n'a même pas de titre : la fiche affiche ？ et une phrase.

#### La pension s'apprend ponte par ponte

La table ne liste pas ce qui *pourrait* donner cette lignée — elle liste ce qui l'a **déjà
donnée**. Chaque ponte inscrit son couple dans la fiche du résultat, et rien d'autre : croiser
un crapaud avec un ouroboros cent fois n'apprend le couple à la fiche de l'ouroboros que le
jour où le un pour cent tombe pour de vrai.

**Les pourcentages se calculent, ils ne se stockent pas.** Le carnet retient *qu'un couple a
donné cette lignée* ; le chiffre affiché est celui d'aujourd'hui, primes comprises. Un joueur
qui achète le Sang dominant voit ses fiches se mettre à jour — ce qui est vrai — et ne voit
toujours rien pour un couple qu'il n'a jamais essayé, ce qui l'est aussi.

`chanceDe` **double** la logique du tirage, et c'est le vrai risque de la fonction : deux
copies peuvent diverger en silence. Un scénario du banc tire donc soixante mille pontes par
forme de couple — ordinaire, recette, joker — et compare la fréquence observée à ce que la
fiche annonce.

### Tout se replie

**Les panneaux de la colonne latérale se replient par leur titre** : boutique, améliorations,
primes, pension, réglages, album. La collection, elle, a quitté la colonne — elle a
[sa propre vue](#trois-vues-un-onglet).

C'est la réponse principale au défilement sur un petit écran, et la seule qui tienne à toutes
les tailles : le problème n'est pas la densité mais le **nombre de choses affichées en même
temps**, et aucune compaction ne rattrape six panneaux d'affilée. Fermer ce
qu'on ne regarde pas laisse la décision au joueur plutôt qu'à un point de rupture.

Replié, il ne reste que la barre de titre — **et son compteur**, qui est justement ce qu'on
vient lire du coin de l'œil sans ouvrir : `5 / 45` pour les
primes.

Deux détails d'implémentation qui se voient dans le code : le bouton n'enveloppe **que le
titre**, parce que le sélecteur de lots vit dans le même en-tête et qu'un bouton dans un
bouton n'est pas du HTML valide ; et replier est une classe sur le panneau
(`.panel.plie > :not(.panel-head) { display: none }`) plutôt qu'un `hidden` posé sur chaque
enfant. Dans la collection, chaque rareté a sa propre grille pour la même raison — replier
devient un `hidden` sur un conteneur au lieu de cacher vingt cases une à une.

Le pliage vit dans la sauvegarde, avec l'ordre de la bande et la taille des lots : du confort
d'affichage, donc il traverse l'ascension.

### Les écrans bas

La seule rupture qui existait regardait la **largeur**, alors qu'un portable est large et
bas : 1366 × 768 tient les deux colonnes sans peine et manque de deux cents pixels en hauteur.

Ce qui déborde n'est donc pas la grille — elle est en `height: 100vh` et ne défile pas — mais
**la scène**, dont l'œuf seul prend un quart de l'écran, et la colonne latérale.

| Rupture | Ce qui se resserre |
|---|---|
| `max-height: 52rem` (832 px) | marges, barre du haut, sujet à `20vh` au lieu de `32vmin`, bande à 9 rem, pied de page retiré |
| `max-height: 40rem` (640 px) | sujet à `16vh`, texte des boosts et du conseil, bande à 6,5 rem |

**Rien ne disparaît sans raison.** On resserre les marges et on rétrécit le sujet, qui est le
seul élément dont la taille est arbitraire — le texte ne bouge qu'au second cran, et la seule
chose retirée est le pied de page, qui parle du prototype et pas du jeu.

Sur un écran de 768 pixels, la scène passe d'environ 630 à 480 pixels de haut : la bande des
enclos rentre sous elle au lieu de demander un défilement.

#### La force du clic ne se granule pas

C'est la seule amélioration à puissance qui s'achète **par paliers entiers**. Un tiers de
seconde ne se sent pas : on achetait trois fois pour voir bouger un chiffre, et le premier
achat du jeu — celui qui doit apprendre qu'acheter change quelque chose — ne changeait presque
rien. Un achat, une seconde.

Le palier est passé de 60 à 30 pour que le rythme suive : le premier achat tombe alors sur la
**deuxième bête**, et il divise par deux le travail de la suivante. À 60, il fallait en élever
trois avant de pouvoir acheter quoi que ce soit.

La migration v11 → v12 divise les achats déjà faits par trois. C'est exact et non pénalisant :
le palier suivant coûte précisément ce que les trois tiers suivants coûtaient. Au plus deux
tiers de seconde se perdent, jamais entamés.

#### Acheter par lots

Un sélecteur en haut du panneau — **×1, ×10, ×100, max** — dit combien de niveaux part d'un
clic. Passé l'ère commune une amélioration se monte de cinquante niveaux d'affilée : les
acheter un par un, c'est cinquante clics qui ne décident de rien, et le jeu cesse d'être un
clicker à ce moment-là pour devenir une paperasse.

**Un lot coûte exactement ce que coûteraient les achats un par un.** Le prix est la somme des
prix arrondis niveau par niveau, pas une formule fermée : un lot qui reviendrait moins cher
serait une remise cachée, et l'équilibrage n'en sait rien.

**Les nombres fixes achètent tout ou rien.** Un ×100 qui n'en achèterait que trente ferait
douter du prix affiché ; le bouton s'éteint tant que la bourse ne suit pas. **`max`, lui, prend
tout ce que la bourse permet** et pas un niveau de plus — mesuré : avec un million de pièces,
la force du clic monte de 58 niveaux et laisse 116 372 pièces, quand le suivant en coûterait
149 887.

Les plafonds sont respectés comme partout ailleurs : les trois achats uniques — acheteur,
marchand, évolution — ne débordent pas de leur niveau 1, quel que soit le lot demandé. Et le
bouton annonce ce qu'il fera — `Force du clic · niv. 12 → 22`, avec l'effet de départ et celui
d'arrivée.

### L'album et l'ascension

Le jeu s'arrêtait sur une fin sèche : légendes mythiques, ferme pleine, plus rien. L'ascension
lui donne un deuxième tour, et **l'album est la seule chose qu'on emporte**.

Le cycle tient en cinq temps. On joue. On franchit un **jalon**. On ascensionne : les bêtes
présentes dans l'enclos deviennent des **capsules** — la bête figée telle qu'elle était. On
choisit les cartes à équiper. Tout le reste repart de zéro.

**Une bête ne devient jamais une carte en cours de partie.** La transformation n'a lieu qu'au
moment du saut, sur ce qu'il reste dans l'enclos. Il n'y a donc aucun arbitrage à faire devant
chaque animal — la question devient « lesquelles je garde en vie pour le saut ? », posée une
fois sur une ferme entière plutôt que trente fois sur trente bêtes.

| Ce qui traverse | Ce qui repart de zéro |
|---|---|
| L'album — toutes les capsules | Les pièces |
| Les emplacements, et **toutes** les cartes | Les œufs non éclos |
| La collection des formes vues | Incubateurs et enclos |
| Les paliers de fortune déjà franchis | Les huit améliorations |
| Le confort d'affichage : tri, taille des lots, son | **Les consignes du marchand, de l'évolution et de l'acheteur** |

La collection survit : c'est un musée de ce qu'on a rencontré, pas une ressource. Elle ne
donne aucun bonus — **seules les cartes équipées en donnent** — donc la garder ne déséquilibre
rien, et la remettre à zéro ne ferait que forcer à redécouvrir ce qu'on a déjà vu.

**Les consignes de la ferme, elles, repartent à zéro.** Elles traversaient le saut au motif que
les refaire rareté par rareté serait une corvée. C'était un mauvais calcul sur deux points.
D'abord elles deviennent fausses : on finit un cycle sur « ne vends jamais les mythiques, monte
les communes jusqu'à la légende », consignes qui n'ont aucun sens sur une ferme qui recommence
avec un œuf commun et zéro pièce — les objectifs d'un cycle ne sont pas ceux du suivant.
Ensuite, et c'est plus grave, elles étaient **invisibles** : les trois panneaux de réglage ne
s'affichent qu'avec l'automate correspondant, et une ferme neuve n'en possède aucun. Les
consignes gouvernaient donc en silence et tombaient d'un coup au rachat du marchand. Un réglage
qu'on ne peut pas voir ne doit pas agir.

Ce qui traverse encore n'agit sur rien : l'ordre de la bande, la taille des lots d'achat, le
son. Du confort d'affichage, pas des décisions.

#### Le motif décide ce que la carte accélère

Le motif ne servait à rien : tiré à l'éclosion, gardé à vie, purement décoratif. Lui confier
le bonus ne demande aucune mécanique neuve, et il devient chassable. Faire dire le bonus par
la *lignée* aurait figé vingt-et-un bonus dans la pierre, et rendu une lignée entière
inintéressante le jour où le sien l'est.

| Motif | Ce que la carte touche | Par point | Plafond |
|---|---|---|---|
| uni | prix de vente | +4 % | +60 % |
| tacheté | vitesse de couvaison | +10 % | +150 % |
| moucheté | vitesse de croissance | +10 % | +150 % |
| rayé | prise de taille | +10 % | +150 % |
| tigré | rente | +14 % | +200 % |
| marbré | prix des évolutions | −3 % | −40 % |
| zébré | prix des œufs | −3 % | −40 % |
| nacré | chance de chromatique | ×1,07 | ×2 |
| **ocellé** | **clics automatiques** | **+0,10 / s** | **1 clic / s** |
| **martelé** | **force du clic** | **+8 %** | **+100 %** |

**Deux familles baissent des prix au lieu d'augmenter des vitesses.** C'est ce qui empêche la
deuxième partie d'être la première en accéléré : une ferme menée au zébré ne se joue pas comme
une ferme menée au tacheté.

#### Deux effets qui ne sont pas des pourcentages

Les huit premiers motifs multiplient une vitesse ou un prix. C'est utile et c'est invisible :
une carte qui rend la ferme 4 % plus rentable ne se sent pas au **début du cycle suivant**,
qui est justement le moment où l'ascension doit donner envie. On repart d'un œuf et de zéro
pièce, et +40 % sur une vente à 40 pièces font seize pièces.

Une règle, elle, se voit tout de suite. Les deux motifs ajoutés en 2.20.0 comblent aussi les
deux trous de la table : **rien ne touchait au clic**, qui est pourtant le verbe du joueur, et
**rien ne touchait à la place**, qui est la vraie limite de la fin de partie.

**L'ocellé clique à ta place**, sur ce que tu regardes, jusqu'à une fois par seconde. Il ne
clique **pas pendant une absence** : un clic vaut « une seconde de ce que tes automates
produisent », si bien qu'une nuit à un clic par seconde injecterait vingt-huit mille fois ce
débit d'un coup. Ce n'est pas un automate de plus, c'est une main qui reste — et une main ne
travaille pas quand on dort. Ses clics ne comptent pas non plus dans les « clics donnés » de
la page de statistiques : le joueur ne les a pas donnés.

**Le martelé alourdit chaque clic** — jusqu'à ×2 pour une carte parfaite à trois étoiles. Il
ne fait pas cliquer à ta place ; c'est l'ocellé qui s'en charge. **Les deux se multiplient**, et
c'est le premier vrai duo de l'album : trois ocellées seules rendent une seconde par seconde,
trois ocellées et deux martelées en rendent deux.

Il a remplacé le **perlé**, qui donnait des enclos, et pour trois raisons :

- **il plafonnait dès la deuxième étoile** — trois enclos étaient atteints à ★★☆, et la
  troisième ne donnait rien. On aurait payé quarante cartes pour un cran vide ;
- **la place était déjà servie trois fois** par les primes *Paille fraîche*, *Pâturage* et
  *Étable* ;
- **il dissolvait la seule tension de la fin de partie**, celle que la professeure annonce
  elle-même : *« bientôt ce ne sera plus l'argent qui te limitera, mais la place. »* Une carte
  qui offre des enclos supprime la question.

Le pas du martelé est calé pour que **la troisième étoile compte** : 0,08 × 12 fait 0,96, juste
sous le plafond de 100 %. Un scénario du banc vérifie maintenant cette propriété sur **les dix
familles** — une famille dont la deuxième étoile plafonne déjà est une famille à revoir.

Et **la plonge reste plate** : elle ne passe pas par `clickPower`, donc aucune carte ne lave
une assiette plus vite.

#### Ce qu'une carte dit d'elle-même

Une carte annonçait `tigré · rente +140 %`. Un joueur qui ignore ce qu'est une rente n'apprend
rien de cette ligne, et c'était le cas de la moitié de la table — « engraissement », « valeur
de vente », « chance de prodige » quand tout le reste du jeu dit *chromatique*.

Chaque effet porte maintenant **une phrase en clair**, affichée au survol de la carte, en plus
de son nom raccourci sur la ligne. La rente y est définie plutôt que nommée : *« ce qu'une bête
adulte rapporte par seconde en restant simplement dans son enclos, même quand tu n'es pas
là »*.

Le nacré s'exprime **en multiplicateur de la base, jamais en points** : le prodige est à
1 sur 8 192, soit 0,012 %, et un demi-point le multiplierait par plus de quarante. Le bonus
d'élevage a été coupé de ×25 à ×4 pour protéger cette rareté ; le plafond à ×2 fait le reste,
et ramène au mieux la chance à 1 sur 4 096.

#### Ce qui décide de la puissance d'une carte

Le motif dit *quoi*. Trois facteurs disent *combien*, et ils sont tous bornés — c'est ce qui
permet de dire à l'avance ce que vaudra la dixième ascension.

    puissance = plafond(rareté) × palier × qualité(spécimen)

Le plafond vient de la rareté de la lignée : ×1 en commune, ×1,6 en rare, ×2,5 en épique,
×4 en mythique. Le palier vient de la fusion, qui n'existe pas encore — toute capsule naît au
palier 1. La qualité, elle, se mérite :

    qualité = 0,4 + 0,6 × ( 0,50 × niveau/100
                          + 0,20 × teinte/7
                          + 0,20 × rang de taille/5
                          + 0,10 × chromatique )

| La bête transformée | Qualité | Puissance |
|---|---|---|
| Têtard commun, niveau 15, ordinaire | 0,45 | 0,45 |
| Légende commune, niveau 100, ordinaire | 0,70 | 0,70 |
| Légende mythique, dorée, énorme | 0,85 | 3,40 |
| Légende mythique, albâtre, démesurée, chromatique | 1,00 | 4,00 |

Le niveau domine : c'est le seul axe qui demande du temps plutôt que de la chance.

#### Les emplacements : un build, pas une collection

**L'album garde tout, cinq cartes agissent.** Les capsules qu'on n'équipe pas attendent en
**réserve** d'une ascension à l'autre, et l'on échange à volonté entre les deux blocs.

**Le déplacement se fait au glisser-déposer** — on prend une carte, on la lâche dans l'autre
bloc — et **un clic fait exactement la même chose**. Ce n'est pas un doublon de confort : le
glisser-déposer n'existe pas au doigt sur un téléphone, ni au clavier. Un geste qui n'a qu'une
seule façon de s'exécuter est un geste que la moitié des joueurs ne peut pas faire. Les deux
zones gardent une hauteur même vides, sans quoi on ne pourrait rien déposer dans un bloc qu'on
vient de vider.

Sans limite, vingt-sept cartes se composeraient et la puissance de l'album n'aurait plus de
plafond — c'est de ça que meurent les jeux idle. La limite de **cinq simultanées** garde ce
rôle, mais elle ne fige plus la partie : le build se change à tout moment, on peut mettre la
couvaison au début et la valeur à la fin. Elle borne la puissance instantanée, pas la
stratégie.

Il vit **sous les enclos**, dans la colonne large, et non dans la colonne latérale : c'est le
prolongement de la ferme — ce que les bêtes deviennent — et non un réglage qu'on consulte une
fois. Les cartes s'y posent en grille, si bien qu'on voit son build d'un coup d'œil.

**« Réserve » ne désigne qu'une seule chose : les cartes qu'on n'a pas équipées**, gardées d'une
ascension à l'autre. Le mot servait aussi à compter les œufs non éclos dans l'écran
d'ascension, ce qui faisait cohabiter deux réserves dans le même panneau — l'une qu'on perd,
l'autre qui traverse. Les œufs y sont désormais dits *non éclos*.

**Cinq emplacements, toujours.** L'album est exactement ces cinq cartes : il n'y a pas de
réserve derrière, rien n'attend son tour.

Le compte a été mobile — trois plus un par ascension, puis un par jeton dépensé — et les deux
versions avaient le même défaut : un premier saut à une seule carte ne donne pas un build, il
donne un chiffre. Cinq d'emblée, c'est une décision dès la première ascension, et un plafond
qu'on peut calculer sans savoir combien de sauts la partie contiendra.

Les sauvegardes d'avant la 2.5.0 traînaient une réserve — toutes les capsules jamais faites,
équipées ou non. **Elle est supprimée au chargement** : sans quoi le panneau afficherait des
cartes qui n'agissent sur rien et qu'aucun écran ne permet plus d'équiper.

Une conséquence utile : **un album se concentre**. Trois cartes d'une même famille rendent
trois fois plus que trois familles différentes — le jour où l'on a trois emplacements.

| L'album | Ce qu'il rend |
|---|---|
| 3 légendes communes, motifs éparpillés | +3 % valeur, +7 % couvaison, +7 % engraissement |
| 3 légendes communes, toutes tachetées | **+21 % de couvaison** |
| 3 légendes communes, toutes unies | +8 % de valeur |
| 6 légendes mythiques dorées tachetées | +150 % — le plafond |
| 6 mythiques albâtre chromatiques, tigrés | +200 % de rente — le plafond |

Les deux dernières lignes disent ce que six emplacements rendraient. **Elles sont hors
d'atteinte aujourd'hui** : six emplacements demandent six ascensions, donc six paliers de
fortune, alors que l'échelle n'en compte que cinq et que les derniers dépassent l'économie.
Elles restent dans la table parce qu'elles bornent le calcul — et parce que la fusion, en 2.3,
attaquera ce plafond par l'autre bout.

Le build se choisit sur l'écran d'ascension et **reste verrouillé pour toute la partie**. S'il
se permutait librement, on mettrait la couvaison au début et la valeur à la fin : on aurait de
fait toutes les cartes, et la limite ne limiterait rien.

#### Les jetons d'ascension

**Un jeton s'obtient en franchissant un palier de fortune. Un jeton vaut une carte à emporter,
et sauter les dépense TOUS.** Les paliers montent d'un facteur mille à chaque cran :

| # | Palier | # | Palier |
|---|---|---|---|
| 1 | 1 pièce | 7 | 10¹⁸ |
| 2 | 1 000 | 8 | 10²¹ |
| **3** | **1 000 000** — *le premier saut* | 9 | 10²⁴ |
| 4 | 10⁹ | 10 | 10²⁷ |
| 5 | 10¹² | 11 | 10³⁰ |
| 6 | 10¹⁵ | | |

**Un palier franchi est franchi pour toujours.** Il crédite son jeton une fois, puis il est
mort : l'ascension remet la bourse à zéro, mais elle ne rend pas les paliers déjà passés. Le
nombre total d'ascensions d'une partie est donc borné par cette échelle, et par elle seule —
et comme les emplacements le sont aussi, la puissance maximale de l'album reste un nombre
qu'on peut calculer avant d'avoir joué.

**Le premier saut ne s'ouvre qu'au million**, troisième palier de l'échelle. Les deux premiers
— une pièce, mille pièces — créditent bien leur jeton mais ne débloquent rien : ils sont là pour
qu'on arrive au million avec **trois jetons en poche**, donc trois cycles d'avance, plutôt
qu'avec un seul.

Sans ce plancher, le pas de mille ouvrirait l'ascension à la première pièce vendue : on
sacrifierait une ferme de trois têtards pour une carte qui ne vaut rien. Le plancher ne vaut que
pour le premier saut ; ensuite chaque jeton en poche donne droit au sien.

Le pas était de ×1 000 000 : l'économie s'arrêtait alors avant l'échelle, et une partie ne
contenait que deux ou trois ascensions. À ×1 000, elle en contient une dizaine — assez pour que
l'album se construise vraiment.

#### Un jeton, une carte — et le saut les prend tous

**Corrigé en 2.30.0, et deux défauts s'y cachaient — le second masquait le premier.**

`apercuAscension` rendait `max: SLOTS` : le nombre de jetons n'entrait nulle part, si bien
qu'**un seul jeton laissait choisir cinq cartes**. Et l'ascension n'en consommait qu'un
(`jetons - 1`), donc les autres restaient en poche : on sautait avec cinq jetons et on en
retrouvait quatre de l'autre côté. Le second défaut rendait le premier invisible — puisqu'on
gardait ses jetons, on ne remarquait pas qu'ils ne servaient à rien.

La règle est maintenant celle qu'on voulait depuis le début :

- **chaque jeton vaut une carte** qu'on emporte dans l'album ;
- **sauter les dépense tous**, y compris ceux qu'on n'a pas employés ;
- **aucun plafond** — neuf jetons emportent neuf cartes.

#### L'album et les cartes actives sont deux choses

Ma première correction plafonnait à cinq ce qui entre dans l'album, et c'était **la même
confusion sous un autre nom**. Les deux ne sont pas la même chose :

| | |
|---|---|
| **l'album** | tout ce qu'on possède, **sans aucune limite**, gardé d'une ascension à l'autre |
| **les cartes actives** | **cinq**, et elles seules agissent — on les échange avec le reste de l'album au glisser-déposer |

`SLOTS` ne borne donc **que les actives**. Le jeton, lui, borne ce qui **entre dans l'album**.
Neuf jetons emportent neuf cartes : cinq s'équipent, les quatre autres attendent en réserve.

L'écrêtage `.slice(0, SLOTS)` de `ascensionner` datait d'avant que les deux soient distinctes,
et il **jetait purement et simplement** les cartes gagnées au-delà de la cinquième. Il porte
maintenant sur les jetons.

C'est ce qui donne enfin un sens à l'attente : **sauter au premier jeton n'emporte qu'une
carte, en attendre trois en emporte trois.** Et c'est ce qui empêche une réserve de jetons de
rendre les ascensions suivantes gratuites — sans quoi on accumulait dix paliers et on
enchaînait dix sauts sans rien mériter.

La confirmation prévient de ce qu'on laisse : *« ⚠ 3 jetons que tu n'emploies pas partent
avec. »*

**Rien n'oblige jamais à ascensionner.** C'est un sacrifice qu'on choisit : on perd sa ferme
entière contre quelques cartes. Un jeton en poche ne réclame rien, ne clignote pas et n'expire
pas — il attend. Le bouton porte le gris des outils plutôt qu'une couleur d'appel, pour ne pas
faire croire à une étape obligatoire.

Et **une ascension sans carte est refusée** : sauter avec un enclos vide serait une perte sèche,
pas un choix. Le panneau le dit et le bouton reste éteint, le jeton restant en poche.

**Les jetons se regagnent à chaque cycle** — c'est la `beta 3.0.0`, et elle remplace une règle
qui posait un mur.

Avant : chaque palier de fortune créditait **un** jeton, **une fois pour toute la partie**, et
sauter les dépensait tous. Celui qui sautait avec cinq jetons repartait à zéro et devait alors
**multiplier sa fortune par mille** pour pouvoir sauter à nouveau. Le mur a été rencontré en
jouant, à mille milliards de pièces : plus de jeton, et le palier suivant à 10¹⁵ — de l'ordre
de mille huit cents ventes maximales.

Maintenant, ce qu'on emporte se lit sur le **sommet de fortune atteint depuis la dernière
ascension**. Un cycle mené au milliard rend quatre cartes, un cycle mené à mille milliards en
rend cinq, et le compte **se refait entièrement** à chaque fois.

**La porte n'est plus une monnaie, c'est un déblocage** : avoir atteint le million une fois
dans la partie ouvre l'ascension pour de bon. Sauter tôt reste permis, et rend peu — c'est le
sommet qui décide, pas la permission.

**Le sommet, et non la bourse du moment** : dépenser tout juste avant de sauter ne coûte aucune
carte. Ce qu'on emporte se décide sur ce qu'on a *su gagner*.

Ce que ça coûte, et c'est assumé : le nombre d'ascensions d'une partie n'est plus borné. La
puissance de l'album reste bornée — par les cinq emplacements et les trois étoiles — mais plus
par l'échelle. *Ce que l'échelle bornait vraiment, c'était le temps qu'il fallait pour y
arriver, et ce n'était pas une borne : c'était un mur.*

**Deux remises à zéro ne sont pas dans l'état sauvegardé**, et sans elles le saut ne se voit
pas. La **vitesse** revient à ×1 : elle traversait le saut, alors que le bouton ⟲ la rend à ×1,
et comme on accélère justement pour atteindre un jeton, la partie suivante démarrait à ×100 —
illisible, et impossible à distinguer d'une remise à zéro ratée. Et l'**horloge de la boucle**
est recalée : la boîte de confirmation gèle le minuteur pendant qu'on la lit, si bien qu'au clic
suivant la boucle rattrapait le temps écoulé, plafonné à cinq secondes mais multiplié par la
vitesse — jusqu'à cinq cents secondes de jeu injectées d'un coup dans une ferme qui vient de
naître.

#### Le piège du marchand

C'est la conséquence la moins évidente de la règle. **Les cartes viennent des bêtes présentes
dans l'enclos au moment du saut** — or le marchand automatique vide l'enclos en continu,
absences comprises. Un joueur qui ascensionne sans y penser trouve une ferme vide et repart
avec zéro carte, après des heures de jeu.

**La ferme s'arrête pendant l'écran d'ascension.** On y décide du sort de bêtes précises ; les
laisser vieillir, évoluer ou se faire vendre sous les yeux du joueur rendrait le panneau menteur
au moment même où il demande une décision irréversible. Et les capsules d'aperçu portent
l'identifiant de leur **bête**, non leur position dans l'enclos : elles étaient numérotées « la
première, la deuxième », si bien qu'une vente automatique décalait tout et qu'on gardait une
carte qu'on n'avait pas choisie.

**L'écran d'ascension ne montre que les bêtes de l'enclos.** Il en a montré deux listes, puis
une seule où les cartes de l'album se mêlaient aux capsules à naître. Ni l'un ni l'autre :
la question qu'il pose n'est pas *quel build veux-tu ?* — celui-là se règle à tout moment dans
l'album, en glissant les cartes d'un bloc à l'autre — mais **laquelle de tes bêtes veux-tu voir
agir tout de suite ?**

Elles sont proposées **dans l'ordre de la bande**, tri compris : une liste qui contredirait
l'enclos obligerait à chercher deux fois la même bête.

**Les bêtes qu'on ne retient pas sont perdues avec la ferme.** Elles ne deviennent pas des
cartes, elles ne rejoignent pas la réserve : elles n'existent tout simplement plus. La réserve
garde les *cartes* qu'on possède déjà et qu'on n'équipe pas — c'est son rôle, et le
glisser-déposer en dépend — mais elle n'a jamais eu à recueillir tout un enclos : une ferme de
vingt bêtes y versait vingt cartes d'un coup, et le choix qu'on venait de faire ne coûtait rien.

Le panneau compte les pertes en direct, la confirmation les redit, et **sauter sans avoir rien
retenu est refusé** — ce serait tout perdre pour rien. Les cartes déjà équipées, elles, comblent
les emplacements laissés libres : on ne perd pas son build en gardant peu de bêtes.

**La ferme s'arrête pendant l'écran.** On y décide du sort de bêtes précises ; les laisser
vieillir, évoluer ou se faire vendre sous les yeux du joueur rendrait le panneau menteur au
moment même où il demande une décision irréversible.

Le récap des pertes annonçait aussi « les bêtes non transformées », ce qui était **faux**
depuis que toutes les bêtes de l'enclos deviennent des capsules : il n'en reste aucune. Un
récap qui invente une perte qui n'existe pas discrédite tout le reste, y compris ce qu'il dit
de juste.

L'écran **prévient quand le marchand est encore actif**. Préparer une ascension, c'est passer ses consignes sur « jamais » —
ce qui donne enfin un usage stratégique à un réglage qui n'était qu'un confort.

Effet de bord heureux : garder une bête vivante rapporte maintenant deux fois, en rente pendant
la partie et en carte au moment du saut.

#### Ce qui n'est pas encore là

**La fusion** se paiera en **poussière de carte**, une monnaie qu'on obtient en désintégrant
ce qu'on ne garde pas. Une carte porte des **étoiles** — elle naît à une, monte à deux, puis à
trois, et ça s'arrête là : `ETOILES = [1, 1.8, 3]` est déjà écrite et `puissanceDe` la lit
déjà, si bien que la fusion sera purement additive. Le détail est dans
[le plan](PLAN.md#la-fusion-et-la-poussière-de-carte).

Le mot **étoiles** a remplacé « palier » en 2.30.2, et pas seulement pour l'écran : « palier »
désignait déjà les paliers de fortune qui donnent les jetons et les paliers d'améliorations qui
se montent en tiers. Trois sens pour un mot, à quelques lignes d'écart dans le même fichier.

Le quatrième cran a disparu avec le renommage. Il valait ×5, mais **les plafonds des familles
de motifs le mangeaient** : le tigré plafonne à +200 % et l'atteignait déjà, et le perlé —
remplacé depuis par le martelé — plafonnait à trois enclos dès la deuxième étoile. On aurait payé très cher un cran qui,
selon le motif, ne donnait rien.

**La merveilleuse**, cinquième rareté, ne s'obtient qu'en pension — et elle partage le plafond
du mythique plutôt que d'en ouvrir un cinquième, pour la même raison qui lui donne la même
valeur marchande : c'est un cran de rareté, pas un cran de puissance.

### Le code couleur

Une couleur ne doit vouloir dire qu'une chose. L'or, notamment, servait partout — bourse,
jauges, prix, focus, sélection — ce qui vidait de son sens le rang des mythiques.

| Couleur | Sens, et rien d'autre |
|---|---|
| gris-vert, bleu, violet, **or**, clarté | les cinq raretés, et le prodige pour l'or |
| beige `--coin` | la monnaie et les prix |
| vert `--accent` | la progression, la sélection, le focus |
| vert `--good` | une vente rentable |
| rouge | une vente à perte que rien ne va corriger |

Deux conséquences :

**L'âge légende n'a pas de couleur à lui.** Il fait briller plus fort la teinte de sa propre
rareté — la teinte dit la rareté, l'intensité dit l'âge. Une légende commune reste donc gris-vert,
seul un mythique brille en or.

**Le bouton *Vendre* est vert quand la vente est rentable et rouge quand elle ne l'est pas.**
Il était rouge dans un cas et doré dans l'autre, ce qui donnait deux alarmes et aucune bonne
nouvelle. Et le rouge tient compte de ce qui est prévu : une bête qui n'a qu'à finir de
grandir, ou que l'évolution automatique va mener au-delà du seuil, reste neutre.

### Un panneau qui s'explique

Les réglages se lisaient comme des phrases à trous — un bout de texte, un menu, un autre bout
de texte — et rien ne disait que les conditions du marchand se **cumulent**. Le panneau est
donc réécrit sur trois principes :

- **Chaque étape est titrée et numérotée** dans l'ordre où les automates s'exécutent, avec une
  ligne qui dit ce qu'elle fait avant de montrer le menu.
- **Le marchand a une ligne étiquetée par rareté**, plus une pour la taille — et cette
  dernière **n'apparaît qu'une fois la mangeoire achetée**. Sans automate qui engraisse, la
  notion n'a rien à faire à l'écran : vendre doit rester la chose la plus simple du jeu.
- **Chaque réglage écrit ce qu'il produit**, et se réécrit dès qu'on bouge un menu. « En clair :
  il vend les communes dès l'âge adulte, les rares dès l'âge légende. Les mythiques restent dans
  l'enclos. » L'acheteur annonce son débit à l'heure, l'évolution le coût total du chemin
  qu'elle va financer.

Une phrase qu'on relit après avoir bougé un menu vaut mieux qu'un mode d'emploi qu'on lit une
seule fois.

Les menus qui listent des données du jeu — prix des œufs, rangs de taille, raretés — sont
**construits depuis ces données** plutôt qu'écrits à la main. C'est la seule façon qu'ils ne
mentent pas le jour où un prix bouge, et ils avaient déjà menti une fois.

### Tout se règle rareté par rareté

Les trois consignes de la ferme ont chacune quatre valeurs, une par rareté :

> Il fait monter les **communes jusqu'à la légende** et arrête les **mythiques à l'âge adulte**.
> Il vend les **communes mûres dès l'âge adulte**, les **rares mûres à l'âge légende et grandes
> ou plus**, et ne touche **jamais** aux mythiques.

C'est la consigne qu'on veut vraiment donner. Une valeur unique pour tout le monde forçait à
choisir un compromis, et le compromis n'est bon pour personne : on écoule le tout-venant tôt
pendant qu'on mène le précieux jusqu'au bout, parce que ce ne sont pas les mêmes sommes.

| Ce qui se règle | Pourquoi par rareté |
|---|---|
| **jusqu'où la faire monter** | d'ancienne à légende : 600 000 en commune, 9,00 Md en mythique |
| **à partir de quel âge la vendre** | on écoule tôt ce qui ne vaut rien, on garde le reste |
| **à quelle taille la vendre** | engraisser une commune immobilise un enclos pour quelques pièces ; une mythique, pour des milliards |

**Le marchand n'attend qu'une condition par défaut** : la bête est mûre, et son âge est celui
qu'on a réglé pour sa rareté. Les quatre menus de taille sont un supplément, et le bloc
**n'apparaît qu'une fois la mangeoire achetée** — avant, la notion n'existe pas à l'écran.
C'est ce qui garde la revente simple en early game : rien n'oblige jamais à comprendre
l'embonpoint pour vendre, et le bouton *Vendre* marche à tous les niveaux, au prix du niveau.

Les menus se dévoilent au rythme des automates : quatre avec le marchand, huit avec
l'évolution, douze avec la mangeoire. Aucun n'apparaît avant d'avoir quelque chose à commander.

### Un plafond d'évolution par rareté, lui aussi

**Chaque rareté a son propre plafond d'évolution**, pour la même raison que chacune a son âge
de vente : ce n'est pas la même décision. Le péage suit la rareté, et l'écart est brutal.

| Faire monter une bête | commune | rare | épique | mythique |
|---|---|---|---|---|
| d'adulte à ancienne | 40 000 | 1,00 M | 24,0 M | 600 M |
| d'ancienne à légende | 600 000 | 15,0 M | 360 M | **9,00 Md** |

Pousser un seul mythique d'ancien à légende coûte quinze mille fois ce que coûte une commune.
Un réglage unique forçait à choisir un compromis pour tout le monde : on pousse maintenant les
communes jusqu'au bout pendant qu'on arrête les mythiques à l'âge adulte, en attendant d'avoir
les moyens. Chaque menu affiche la facture complète du chemin qu'il finance.

**L'évolution automatique s'arrête quand même à l'âge où le vendeur doit prendre le relais.**
Sans ce frein, la consigne de vente serait muette : régler « vendre les communes dès l'âge
adulte » ne servirait à rien, puisque l'évolution les pousserait jusqu'à la légende avant que le
vendeur n'ait son mot à dire. Des deux plafonds, c'est le plus bas qui commande.

Un réglage incohérent est signalé, et **les raretés en cause sont nommées** : si l'évolution
des rares s'arrête à l'adolescence pendant que le vendeur les attend à l'âge ancien, la note dit
lesquelles n'y arriveront jamais, avant que les enclos ne s'engorgent.

**L'évolution passe avant la vente**, pour qu'une bête qu'on peut faire monter ne parte jamais
au prix de l'âge d'en dessous. L'enchaînement complet se règle donc rareté par rareté — jusqu'où
la faire monter, à partir de quel âge la vendre, et à quelle taille — et la ferme tourne seule :
couver, élever, faire monter, engraisser, vendre, racheter.

La force du clic vaut aussi pour l'engraissement, et le compteur en clics en tient compte :
« 4 clics » plutôt que « 30 clics » une fois le clic monté à 8 secondes.

Les sauvegardes d'avant les niveaux sont converties au chargement : `true` devient niveau 1.

La progression hors ligne suit la même règle : sans couveuse ni éleveur, une absence ne
produit rien, et le bandeau de retour ne s'affiche pas.

### Interface

**La barre espace appartient à la scène, et à rien d'autre.** Elle ne fait jamais défiler.
L'exception ne vaut que pour les champs et les menus, où l'espace a un sens propre — il ouvre
une liste déroulante, il tape une lettre. Les **boutons** en étaient exclus eux aussi, et c'est
ce qui cassait le martèlement : un bouton gardé sous le focus après un clic à la souris captait
chaque espace suivant, tantôt pour se réactiver, tantôt pour faire défiler la colonne qui le
contient. Un bouton cliqué **à la souris** relâche donc son focus ; activé **au clavier**, il le
garde, sans quoi on ne pourrait plus naviguer au Tab.

**Maintenir la barre ne vaut qu'un clic.** Le système répète l'événement des dizaines de fois
par seconde tant que la touche est enfoncée : sans verrou, poser un livre sur le clavier jouait
la partie à notre place, et le clic cessait d'être un geste. Le verrou se lève au relâchement,
et aussi quand la **fenêtre** perd le focus — une touche relâchée pendant qu'on est ailleurs
n'envoie pas de `keyup` à la page, et la barre resterait muette pour toujours. Le défilement,
lui, reste bloqué même sur les répétitions.

Pendant l'écran d'ascension, l'espace ne fait rien : marteler une bête à travers une boîte
modale qui demande son sort n'a aucun sens.

**Rien n'est sélectionnable.** Un clicker se martèle : deux clics rapides au même endroit
surlignaient le texte en bleu, et un glisser sur une carte de l'album attrapait sa légende au
lieu de la carte. Il n'y a rien à copier dans ce jeu. Le contour de focus, lui, reste — c'est
la seule façon de jouer au clavier, et il ne s'affiche qu'au clavier.

L'écran n'a **qu'un seul sujet à la fois**, en grand au centre : l'œuf qu'on fait éclore ou
l'animal qu'on fait grandir. C'est lui qu'on clique. La bande en dessous liste les autres
œufs et créatures en vignettes ; on clique une vignette pour la mettre en scène.

**La scène suit l'animal, jamais l'œuf.** Acheter un œuf, le placer, le voir arriver par
l'acheteur automatique ou en voir un autre éclore ne détourne jamais le regard de la bête en
cours d'élevage. Un œuf ne passe au premier plan que s'il n'y a plus rien de vivant à
regarder, et c'est alors le plus avancé.

**Le marchand n'a aucune exception, pas même la bête en scène.** Si la consigne dit de vendre
les communes mûres dès l'âge adulte, il vend toutes les communes mûres — y compris celle qu'on
est en train de regarder. Une automatisation qu'on règle doit faire exactement ce qu'on a réglé,
sans quoi le compte ne tombe jamais juste et la ferme cesse d'être prévisible.

**Deux exceptions ont été essayées, et retirées.** Une immunité à vie pour la bête en scène
laissait celle qu'on venait d'évoluer à la main invendue pour toujours — le symptôme visible
était « le marchand ne vend pas ». Un sursis de dix secondes depuis le dernier *clic* protégeait
mal, puisque regarder une bête n'est pas la cliquer, et une bête arrivée en scène toute seule
n'était jamais protégée. Une protection tant que l'onglet reste visible a ramené le premier
défaut : page ouverte, bête jamais vendue.

**☆ *Garder* est donc la seule protection**, et c'est le bon endroit : elle est explicite, elle
se voit sur la vignette, et c'est le joueur qui la pose. Ce qu'on perd, c'est qu'une bête peut
partir à l'instant où on la regarde ; ce qu'on gagne, c'est une consigne qui ne ment pas.

**Vendre ne déplace pas le regard : on garde sa case.** Si on était sur la case 6, on reste
sur la case 6 — c'est la voisine qui glisse dedans, exactement comme dans une liste dont on
retire une ligne. Sauter « à la bête la plus avancée » faisait traverser la bande à chaque
vente et rendait impossible d'écouler un enclos case par case.

**Le marchand automatique obéit à la même règle.** Elle ne valait d'abord que pour les ventes
à la main, et l'automate, lui, laissait la sélection retomber sur le repli — donc sur la bête
la plus avancée, à l'autre bout de la bande. On regardait la case 2, une vente tombait, et on
se retrouvait ailleurs sans avoir rien fait. La case se relève désormais avant le retrait,
dans les deux cas.

Seule entorse, celle de la règle du dessus : on ne quitte jamais le vivant pour un œuf. Si la
case libérée retombe sur une coquille alors qu'il reste des bêtes, on s'arrête au bord du bloc
vivant. Les bêtes forment toujours un bloc d'un seul tenant dans la bande, avant ou après les
œufs selon que la couveuse est achetée — c'est ce qui permet de raisonner en « case » sans
que les incubateurs s'intercalent.

**Rien ne prend la scène à une bête vivante — pas même une éclosion rare.** L'éclosion d'une
lignée précieuse mérite une fanfare, mais pas au prix d'arracher au joueur l'animal qu'il est
en train de cliquer. Elle ne bascule donc que si la scène montrait une coquille ou rien du
tout ; sinon elle se contente de son accord, et sa vignette porte déjà sa couleur de rareté
dans la bande. Afficher « lignée rare ! » au-dessus d'une *autre* bête serait un contresens.

Dès que la couveuse automatique est achetée, les œufs cessent d'être le sujet : les créatures
passent devant eux dans la bande, pour rester à portée de clic même avec dix incubateurs. Cet
ordre vit dans `subjects()`, pas dans le rendu : c'est ce qui garantit que « la case 6 »
désigne la même vignette pour l'affichage et pour la sélection.

**La bande garde sa position de défilement** quand elle se redessine. Vider un conteneur remet
sa barre horizontale à zéro : la bête qu'on suivait à droite sautait à gauche au moment précis
où on la regardait grandir. La position est donc relevée avant, reposée après.

**Seul l'âge déclenche une reconstruction de vignette** — quatre fois par vie. Le niveau, lui,
monte cent fois : le mettre dans la signature ferait redessiner la bande sans arrêt. Ce qui
bouge à chaque niveau — le numéro, la taille du glyphe, la barre — est repeint par des setters
qui ne touchent au DOM que si la valeur a réellement changé.

**La page ne défile jamais** sur écran large : elle occupe exactement la fenêtre, et seules les
deux colonnes défilent en interne. Ce n'est pas cosmétique — une barre de défilement rend le
martèlement à la **barre espace** impraticable, puisque l'espace ferait avancer la page au
lieu de cliquer. L'espace est d'ailleurs branché sur la scène, avec `preventDefault`, sauf
quand le focus est sur une zone de saisie — le champ où l’on colle une sauvegarde. Tout bouton
cliqué relâche son focus après usage, pour ne pas détourner les touches suivantes : c’était vrai
des menus, ça l’est resté des [segments](#les-consignes-en-segments) qui les remplacent. Sur mobile la page défile
normalement — le clavier n'y est pas le sujet.

**Les réglages ont leur propre panneau**, séparé des sept boutons d'amélioration sous lesquels
ils étaient noyés. Ils y sont présentés comme la chaîne qu'ils forment vraiment :
1 · l'acheteur rachète, 2 · l'évolution fait monter, 3 · le marchand vend. Le panneau
n'apparaît que lorsqu'on possède au moins un automate à régler, et la consigne du marchand
affiche sa conséquence en clair plutôt que de la laisser deviner.

### Deux arcs, deux chartes

Les lignées **communes, rares et épiques** suivent l'arc de la transformation : cinq
silhouettes distinctes, du pitoyable au glorieux. C'est le principe qui rend une évolution
mémorable — ce n'est pas l'évolution, c'est l'écart.

Les **mythiques** suivent l'arc de la révélation. Elles naissent déjà elles-mêmes, complètes
et reconnaissables au premier âge : un dieu qui commence en avorton n'est plus un dieu. Le nom
ne change jamais, seule l'épithète pousse, et la silhouette bouge à peine — ce qui grandit,
ce sont les attributs.

`tools/prompt.js` porte donc **deux chartes**, choisies sur la rareté — *mascotte* et
*idole* — et une **technique commune** : la grille de 32, les six couleurs à plat, le contour,
l'absence de dégradé. C'est elle qui fait que des lignées dessinées à des mois d'écart
appartiennent au même jeu. Ce qui change d'une charte à l'autre est le **registre**, jamais la
grille.

La première tentative se contentait d'ajouter « c'est un dieu » **par-dessus** la charte
mascotte. Ça ne marche pas : les joues roses, les yeux ronds énormes et le petit sourire
gagnent toujours, et on obtenait un dieu adorable — ce qui n'est pas un dieu. Le registre se
remplace donc en entier. La charte idole interdit explicitement les joues roses et le sourire,
demande des **yeux mi-clos en amande**, une expression *composée, ancienne, un peu impérieuse*,
autorise la **netteté** là où elle veut dire quelque chose — une mâchoire, des plaques, une
couronne —, exige la **symétrie d'un emblème frappé sur une pièce**, et remplace la décoration
par de l'**insigne** : anneaux, glyphes, marques concentriques, jamais des pois. La palette est
profonde avec un seul accent métallique, jamais un nuancier de bonbons.

La lueur reste autorisée pour les deux, mais **en aplat seulement** — une forme pâle à bord
net, jamais un dégradé : sinon le pixel art se dissout et la contrainte des six couleurs saute
avec lui.

**L'Ouroboros est la première lignée écrite sous cette charte.** Il naissait en « Anneau de
mue », une dépouille, avec un glyphe de ver. Il est maintenant un serpent qui se mord la queue
dès le premier âge, et **l'anneau ne change plus jamais** : ce qui grandit, c'est ce qu'il
contient — rien, puis une lueur, puis un monde. Le grandiose vient de là, et non d'une créature
devenue menaçante.

| Âge | Ce qu'on voit |
|---|---|
| Ouroboros | un petit serpent qui se mord déjà la queue, anneau fermé, corps mince |
| Ouroboros éveillé | le même anneau, épaissi, écailles hexagonales |
| Ouroboros clos | l'anneau **doublé** — une seconde boucle à l'intérieur |
| Ouroboros sans fin | trois boucles, et le centre s'éclaire pour la première fois |
| **Ouroboros, la boucle du monde** | les boucles emplissent le cadre et **tiennent un monde** |

### Illustrations

Les emoji sont des bouche-trous, et le dossier `art/` sert à les remplacer **une lignée à la
fois**. Tant qu'un dessin n'est pas là, l'emoji reste : rien ne casse jamais, et on peut
s'arrêter n'importe quand.

Ajouter un dessin, c'est poser le fichier dans `art/` et ajouter une ligne à la table `ART`
en haut de `game.js`. Rien d'autre — pas de build, pas de manifeste à régénérer.

**Trois dessins suffisent pour une lignée entière.** Un âge sans dessin prend celui de l'âge le
plus proche en dessous. Avec `{ 1: 'tetard.png', 4: 'tourbiere.png' }`, les trois premiers âges
montrent le têtard et les deux derniers la tourbière. Un seul fichier fonctionne aussi.

Une image fait exactement `1em`, donc **tout ce qui pilotait la taille de l'emoji pilote la
sienne** — niveau, âge, engraissement, teinte. Un dessin remplace un emoji sans qu'aucun autre
calcul ne bouge, du nouveau-né à 52 px à la légende démesurée à 220 px.

Le détail du format attendu est dans [`art/LISEZMOI.md`](art/LISEZMOI.md).

### Ce que le niveau pilote à l'écran

| Ce qu'on voit | Au niveau 1 | Au niveau 100 | Comment ça monte |
|---|---|---|---|
| l'échelle | 0,55 | 2,19 | continue, plus un bond fixe à chaque évolution |
| la valeur | 15 % de son âge | 100 % du sien | par paliers, un saut par niveau |
| la silhouette | forme 1 | forme 5 | change au moment où l'on paie le péage |
| le badge | `1/15` | `100/100 ✦` | le ✦ marque la maturité |

**La valeur est plate à l'intérieur d'un niveau et saute au passage** : c'est le clic qui fait
changer de niveau qui paie, pas les vingt d'avant. La barre de la scène vise donc le prochain
niveau, jamais la maturité — cent niveaux dans une vie, donc cent barres qui se remplissent.
La vignette de la bande, elle, montre la distance à la maturité — c'est-à-dire à la décision.

### Trois axes, trois colonnes

Une bête monte sur **trois échelles qui ne s'obtiennent pas de la même façon** : son âge se
paie, son niveau se clique, sa taille s'engraisse. Les trois tenaient dans une seule ligne à
points sous son nom :

    commune · niv. 15 · enfant énorme · mûre · valeur ×1,70

Cinq fragments séparés par le même signe, sans hiérarchie, et le mélange était réel — pas
seulement visuel :

- **`enfant énorme` soudait deux axes en un mot.** L'âge et la taille ne se distinguaient plus,
  alors que l'un se paie et l'autre se nourrit.
- **`mûre` se disait deux fois** : là, puis à nouveau dans le chrono juste en dessous.
- **`valeur ×1,70` fondait deux facteurs en un.** Le niveau et la taille multiplient chacun de
  leur côté ; un seul nombre ne disait pas lequel avait bougé.
- **La barre changeait de sens sans prévenir.** Elle vise le prochain niveau tant que la bête
  grandit, puis le prochain rang de taille une fois mûre. Rien ne l'indiquait.

Chaque axe a maintenant sa colonne, son intitulé et son facteur :

    ┌─ ÂGE ───────┬─ NIVEAU ────┬─ TAILLE ────┐
    │ adolescent  │ 35 / 35     │ énorme      │
    │ ●●○○○       │ mûre        │ ×1,70       │
    └─────────────┴─────────────┴─────────────┘

**La maturité n'est plus un quatrième axe.** C'est le niveau qui touche le plafond de son
âge — l'égalité des deux nombres le montre, et le mot ne fait que le confirmer. C'était le
vrai nœud : « mûre » se présentait comme une chose de plus à comprendre alors que c'est un
état du niveau.

**Les cinq âges sont des pastilles.** On voit d'un coup qu'il y en a cinq et lequel est
atteint, ce qu'aucun mot seul ne disait. Elles prennent la couleur de la rareté.

**La colonne que la barre remplit est marquée** — liseré vert en haut, intitulé vert, et une
étiquette sous la barre qui la nomme. C'est le lien qui manquait le plus.

Sous le nom ne reste que la **rareté**, la seule chose qui ne bouge jamais de toute la vie de
la bête. Les vignettes de la bande suivent le même vocabulaire : `35/35 ✦` plutôt que
`niv. 35 ✦` — le plafond de l'âge tient dans la place que prenait le mot « niv. » — et le
survol nomme l'âge, que seule la forme du dessin trahissait.

Vendre est possible à tout niveau, au prix du niveau, et **aucune condition de taille ne s'y
ajoute jamais**. C'est la porte de sortie quand un enclos bloque, elle doit rester simple. Le
marchand automatique, lui, n'achète que des bêtes mûres — brader une bête à moitié grandie ne
doit jamais arriver tout seul.

**Trois échelles d'événement**, sinon cent niveaux par vie deviennent cent fanfares :

- un **niveau** : le numéro s'envole, l'animal tressaille, une note ;
- la **maturité** ou un **rang de taille** franchi : étincelles, accord, et le gain de valeur
  affiché ;
- une **évolution** : nouveau nom, nouvelle silhouette, et le niveau réaffiché sous le nom.

### Croissance sans fin

Un clic fait gagner du temps avant comme après la maturité : l'animal ne cesse jamais de
grandir. Mûre, la bête ne monte plus de niveau tant que le péage n'est pas payé — ce qu'elle
avale part alors dans l'embonpoint, et n'y sera pas perdu. Ce qui s'essouffle, c'est le
rendement : la taille suit un logarithme, donc chaque rang coûte bien plus cher que le
précédent.

### Le clic gagne du temps, il n'ajoute pas des secondes brutes

Un clic apporte **la force du clic en secondes de ce que tes automates produisent** : à
éleveur ×7 et force du clic 14, il ajoute 98 secondes de croissance, c'est-à-dire quatorze
secondes gagnées sur la machine.

Sans cette règle, chaque automate acheté nerfait le clic au moment même où on payait pour
aller plus vite : le « +14 s » affiché ne représentait plus que deux secondes de ce que
l'éleveur faisait déjà tout seul, et cliquer devenait dérisoire. La même règle vaut pour la
couveuse et pour la mangeoire — le clic reste un raccourci qui se sent, du premier œuf au
centième niveau.

**Le seuil d'un rang est aussi son multiplicateur de valeur**, et la valeur reste plate entre
deux rangs : comme pour les niveaux, c'est le clic qui franchit le rang qui paie.

Les rangs ne disent pas une taille absolue mais **à quel point la bête est grosse pour son
âge**. C'est ce qui leur permet de survivre à l'évolution sans se contredire : une
« légende titanesque » est une légende hors-norme parmi les légendes, pas une bête plus
vieille. C'est aussi pourquoi les âges ne parlent plus de taille — ils l'ont fait
jusqu'à l'alpha 2.0.1, et « titan titanesque » demandait alors une note pour s'expliquer.

| Rang | À partir de | Valeur | Clics à l'âge enfant | Vente (base 40) |
|---|---|---|---|---|
| mûre | ×1,00 | ×1,00 | — | 40 |
| grand | ×1,30 | ×1,30 | 33 | 52 (+30 %) |
| énorme | ×1,70 | ×1,70 | 116 | 68 (+31 %) |
| colossal | ×2,30 | ×2,30 | 434 | 92 (+35 %) |
| titanesque | ×3,20 | ×3,20 | 2 412 | 128 (+39 %) |
| démesuré | ×4,50 | ×4,50 | ~28 000 | 180 (+41 %) |

La barre de progression vise le rang suivant une fois la bête mûre, et l'animal grossit
vraiment à l'écran — de 0,55 nouveau-né à 2,19 légende mûre, et 2,34 légende bien grasse.

### Engraissement

Une bête ne se nourrit **jamais contre des pièces** : elle grandit au clic et au temps. Une
bête mûre continue donc de grossir indéfiniment, gratuitement, et sa valeur monte de rang en
rang (`OVER_GAIN`, rendement logarithmique).

Ce que coûte un animal énorme n'est pas de l'argent mais **du temps et une place d'enclos** :
une bête qu'on engraisse est une bête qu'on ne vend pas, et l'enclos qu'elle occupe ne
produit rien pendant ce temps. À l'âge enfant, avec une mangeoire de niveau 1 :

| Rang atteint | Temps d'engraissement | Valeur | Rendement de l'enclos |
|---|---|---|---|
| grand | 16 s | 40 → 52 | 0,75 pièce/s — **mieux que recycler** |
| énorme | 58 s | 52 → 68 | 0,48 pièce/s |
| colossal | 217 s | 68 → 92 | 0,24 pièce/s |
| titanesque | 1 206 s | 92 → 128 | 0,07 pièce/s |

À comparer aux 0,67 pièce/s d'un enclos qui enchaîne les bêtes jusqu'à maturité et les vend. Il
existe donc une fenêtre étroite où engraisser jusqu'à *grand* bat le recyclage, et tout ce qui
va au-delà est du plaisir payé en temps. C'est une vraie décision, et elle se règle par le
marchand automatique : allumé il vend avant que la mangeoire ait le temps d'agir, éteint il
laisse grossir.

**Aucun garde-fou n'est nécessaire à l'évolution.** L'ancienne version confisquait la taille en
évoluant, de peur qu'engraisser au premier âge — où la nourriture est dérisoire — puis évoluer
ne rapporte des dizaines de fois la mise. La peur était infondée : `sizeFactor` divise les
secondes de mangeoire par la durée de l'âge **courant**, quatre à six fois plus longue à chaque
cran. Les mêmes secondes rendent donc exactement la même chose, qu'on les dépense tôt ou tard.
La confiscation ne protégeait rien — elle punissait seulement le joueur qui avait engraissé
avant de changer d'avis.

## À vérifier en jouant

1. La première évolution tombe-t-elle avant la dixième minute ?
2. Le clic est-il agréable, ou juste fonctionnel ?
3. Le choix vendre / payer le péage est-il une vraie hésitation, ou la réponse est-elle
   toujours évidente ?
4. À quel moment s'ennuie-t-on ?
5. **Le pari du découpage** : 65 des 100 niveaux se traversent dans les quatre premières
   minutes de la vie d'une bête, et les 15 derniers demandent six heures. Est-ce que la légende
   paraît longue ? Si oui, le levier n'est pas le découpage des niveaux mais la durée de la
   dernière tranche — `AGES[4].grow`, six heures aujourd'hui.

Les créatures sans dessin sont des emoji : des placeholders assumés, en attendant que les
135 illustrations soient toutes là.
