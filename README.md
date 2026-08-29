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

    alpha MAJEUR.MINEUR.CORRECTIF          aujourd'hui : alpha 2.29.0

| Nombre | Ce qui le fait monter | Exemple |
|---|---|---|
| **correctif** | un sprite de plus, un bug corrigé, un chiffre d'équilibrage retouché | 1.0.0 → 1.0.1 |
| **mineur** | une nouveauté franche, mais qui tient dans le jeu tel qu'il est | 1.0.1 → 1.1.0 |
| **majeur** | un morceau de jeu qui n'existait pas, et qui rebat les cartes du reste | 1.1.0 → 2.0.0 |

Un nombre qui monte remet à zéro ceux qui le suivent. On le change **dans le commit qui
apporte la modification**, jamais après coup : c'est ce qui permet de savoir, devant une page
laissée ouverte, si elle est à jour ou s'il faut la recharger.

Le mot **alpha** reste devant tant que le jeu n'est pas sorti. Ce n'est pas un quatrième
nombre : `alpha 2.0.0` est toujours une alpha.

À ne pas confondre avec le `v` de la sauvegarde (`v: 14` aujourd'hui), qui numérote le *format*
des données rangées dans le navigateur et ne bouge que lorsque ce format change. Les deux
avancent à leur rythme : `alpha 1.2.0` n'a pas touché au format, `alpha 1.3.0` l'a fait passer
de 4 à 5.

### Ce qui est sorti

| Version | Ce qu'elle apporte |
|---|---|
| **2.29.0** | l'ouverture est trois fois plus longue : on gagne moins, on clique plus |
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

Quarante-et-un scénarios, six cent quatre-vingt-douze vérifications. Passer un mot en argument ne joue que
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

- 27 lignées et leurs 135 formes, du têtard à l'Ouroboros éternel
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
- Huit améliorations : force du clic, couveuse, éleveur, acheteur, mangeoire, marchand, évolution, intendant
- **Rente** : une bête de l'âge adulte ou plus rapporte toute seule, à proportion de ce
  qu'elle vaut — la seule règle du jeu qui paie pour ne pas vendre
- Progression hors ligne, plafonnée à 24 h — et seulement pour ce qui est automatisé
- Collection des 135 formes découvertes
- **L'album et l'ascension** : les bêtes gardées deviennent des cartes, le motif décide
  du bonus, et tout le reste repart de zéro

Absent volontairement : gènes, reproduction, fusion des cartes, lignées cachées, comptes,
marché entre joueurs. Tout cela demande le serveur, ou attend la pension — dont **le squelette
est posé mais la porte fermée** : voir plus bas.

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
boutons de tri pour une seule bête, une collection de 135 cases dont une remplie, une ligne de
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

**La pyramide compte 27 lignées : 10 communes, 10 rares, 4 épiques, 3 mythiques.** L'ère rare
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
plus. Et la carte d'album **constellée** prend enfin sa valeur : plafonnée à ×2 sur tout
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

**Le motif** — uni, tacheté, rayé, moucheté, marbré, tigré, zébré, constellé, ocellé, perlé —
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

Quatre améliorations sur sept se montent **niveau par niveau, sans plafond**. Le prix du
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

### La pension — squelette, porte fermée

> **Rien de cette section n'est joignable, et rien ne peut l'ouvrir.** `PENSION_OUVERTE` est
> une **constante** à `false` : aucune boucle n'appelle `avancePension`, aucun bouton ne mène à
> `accoupler`, `state.pension.couples` reste vide pour tout le monde, et le banc d'essai lui-même
> ne peut pas forcer la porte. Une partie jouée aujourd'hui se comporte exactement comme avant
> la 2.23.0.

**Pourquoi poser des os avant d'avoir un corps.** Le socle de la pension est un *atome* de cinq
pièces — des emplacements, deux parents, une durée, un œuf, et la rente suspendue. Les cinq
tombent ensemble ou ne tombent pas : une pension sans rente suspendue est gratuite, une
pension sans emplacements n'a pas de limite, une pension sans durée n'est pas une attente.
Écrire la forme des cinq d'un coup, sans les brancher, permet de vérifier qu'elles s'emboîtent
avant de payer le prix d'une version jouable.

| Pièce | Ce qui est posé |
|---|---|
| **emplacements** | `state.pension.places`, un couple à la fois au départ |
| **deux parents** | `accoupler(a, b)` → `{ a, b, t, duree }`, deux identifiants de bêtes |
| **une durée** | `dureePension` = 900 s + 600 s par cran de distance, plafonnée à 6 h |
| **un œuf** | `avancePension` dépose une sorte dans la réserve au terme |
| **rente suspendue** | `renteOf` rend 0 pour un parent — la seule ligne qui touche au jeu vivant |

**Le sacrifice est dans les enclos.** Les parents ne quittent pas la ferme : ils gardent leur
case, cessent de rapporter, et n'avancent plus. Parquer deux bêtes doit se sentir, et ça ne se
sent que si ça coûte la seule chose qui manque vraiment en fin de partie — la place.

**Pourquoi la porte est scellée et non seulement fermée.** Le drapeau a été `let` le temps
d'une version, pour qu'un scénario puisse faire tourner le cycle entier. C'était une porte de
trop : la pension ne veut rien dire tant que le bestiaire n'est pas fini — la compatibilité
demande des étiquettes sur des lignées qui n'existent pas toutes, et l'hérédité vise une
cinquième rareté qui n'existe pas du tout. **Un cycle qu'on peut faire tourner est un cycle
qu'on finit par croire réglé**, et on bâtit dessus.

**Ce qui reste vérifié l'est sans rien ouvrir.** Deux scénarios du banc : l'un prouve que la
porte tient — deux cents tours de boucle, aucun couple, aucune rente suspendue, et forcer le
drapeau ne change rien puisque c'est une constante ; l'autre exerce les **trois fonctions de
calcul**, qui ne consultent pas le drapeau : la distance entre deux lignées, la durée qui en
découle, et la sorte d'œuf qui sortirait. C'est la forme du socle, vérifiée sans le faire
tourner.

**Ce qui manque encore, et qui ne sera pas deviné ici :**

- **La compatibilité.** `distanceDe` est un bouchon calé sur ce que le jeu sait déjà dire — la
  lignée et la rareté. Le vrai système passera par des *étiquettes* posées sur les lignées
  (aquatique, ailé, minéral…), avec des paires stériles et une durée qui monte avec l'écart.
  Rien de tout ça n'existe, et l'inventer maintenant figerait le bestiaire avant d'avoir joué.
- **L'hérédité.** `oeufDe` rend la sorte la plus modeste des deux parents, le comportement le
  plus prudent qu'on puisse écrire. Les quatre issues, les fusions de teintes et les teintes
  exclusives viendront avec leur propre version.
- **Le plafond de la réserve d'œufs.** Il doit tomber **avant** que la pension serve, jamais
  après : c'est le seul frein du hors-ligne, et une partie qui tourne déjà sans lui rentrerait
  sur cinquante œufs le jour où on l'ajoute. Tant que la porte est fermée, rien ne presse.

### Tout se replie

**Les six panneaux de la colonne latérale se replient par leur titre** : boutique,
améliorations, primes, réglages, collection, album. Et **dans la collection, chaque rareté se
replie séparément**.

C'est la réponse principale au défilement sur un petit écran, et la seule qui tienne à toutes
les tailles : le problème n'est pas la densité mais le **nombre de choses affichées en même
temps**, et aucune compaction ne rattrape six panneaux dont un porte 135 cases. Fermer ce
qu'on ne regarde pas laisse la décision au joueur plutôt qu'à un point de rupture.

Replié, il ne reste que la barre de titre — **et son compteur**, qui est justement ce qu'on
vient lire du coin de l'œil sans ouvrir : `6 / 135` pour la collection, `5 / 20` pour les
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
| constellé | chance de chromatique | ×1,07 | ×2 |
| **ocellé** | **clics automatiques** | **+0,10 / s** | **1 clic / s** |
| **perlé** | **enclos en plus** | **+0,50** | **+3 enclos** |

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

**Le perlé donne des enclos** qu'on n'a pas payés, et qui **ne font pas monter le prix des
suivants** — `penCost` reste calé sur ce qui a été acheté, sinon la carte ferait payer deux
fois ce qu'elle donne. Les fractions de plusieurs cartes s'additionnent, et seul le total
entier compte.

Un piège s'y cachait, attrapé au banc : `qualiteDe` additionne 0,5 + 0,2 + 0,2 + 0,1, ce qui
vaut `0.9999999999999999` en virgule flottante. Une carte perlée parfaite pesait donc 3,999…96
au lieu de 4, son effet 1,999…98 au lieu de 2, et le plancher tombait d'un cran : **la carte
annonçait deux enclos et n'en donnait qu'un.**

#### Ce qu'une carte dit d'elle-même

Une carte annonçait `tigré · rente +140 %`. Un joueur qui ignore ce qu'est une rente n'apprend
rien de cette ligne, et c'était le cas de la moitié de la table — « engraissement », « valeur
de vente », « chance de prodige » quand tout le reste du jeu dit *chromatique*.

Chaque effet porte maintenant **une phrase en clair**, affichée au survol de la carte, en plus
de son nom raccourci sur la ligne. La rente y est définie plutôt que nommée : *« ce qu'une bête
adulte rapporte par seconde en restant simplement dans son enclos, même quand tu n'es pas
là »*.

Le constellé s'exprime **en multiplicateur de la base, jamais en points** : le prodige est à
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

**Un jeton s'obtient en franchissant un palier de fortune, et l'ascension en dépense un.** Les
paliers montent d'un million à chaque cran :

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

**Les emplacements ne dépendent plus des jetons** : ils sont cinq dès la première ascension.

**Rien n'oblige jamais à ascensionner.** C'est un sacrifice qu'on choisit : on perd sa ferme
entière contre quelques cartes. Un jeton en poche ne réclame rien, ne clignote pas et n'expire
pas — il attend. Le bouton porte le gris des outils plutôt qu'une couleur d'appel, pour ne pas
faire croire à une étape obligatoire.

Et **une ascension sans carte est refusée** : sauter avec un enclos vide serait une perte sèche,
pas un choix. Le panneau le dit et le bouton reste éteint, le jeton restant en poche.

**On ne peut pas enchaîner deux sauts** sans avoir rejoué : l'ascension vide la bourse, et le
palier suivant est un million de fois plus haut.

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

**La fusion** — trois capsules d'une même lignée en forgeraient une supérieure, et la carte
forgée garderait le meilleur des trois spécimens. Elle vient en 2.1, et elle n'a rien à faire
avant : à la première ascension on n'a aucun doublon. Le champ `palier` existe déjà sur chaque
capsule et la table `PALIERS` est écrite, si bien que 2.1 sera purement additive.

**La merveilleuse**, cinquième rareté, ne s'obtiendra qu'en pension : l'album sort donc avec
quatre plafonds au lieu de cinq.

### Le code couleur

Une couleur ne doit vouloir dire qu'une chose. L'or, notamment, servait partout — bourse,
jauges, prix, focus, sélection — ce qui vidait de son sens le rang des mythiques.

| Couleur | Sens, et rien d'autre |
|---|---|
| gris-vert, bleu, violet, **or** | les quatre raretés, et le prodige pour l'or |
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
quand le focus est sur un vrai contrôle : un menu déroulant garde son comportement normal, et
se relâche après usage pour ne pas détourner les touches suivantes. Sur mobile la page défile
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
