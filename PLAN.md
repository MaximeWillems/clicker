# Le plan

Ce document est la mémoire longue du projet : ce qu'on a décidé de construire, dans quel
ordre, et pourquoi. Le [README](README.md) décrit le jeu tel qu'il est aujourd'hui ; celui-ci
décrit la route.

Deux plans se superposent, et il faut les lire ensemble. Le **plan des jalons** a été posé le
18 août 2026, avant la première ligne de code : il dit ce que le jeu sera. Le **plan de
versions** a été écrit après coup, quand le prototype a débordé de son cadre : il dit ce qui
tombe dans quel ordre, et c'est celui qu'on suit au jour le jour.

    aujourd'hui : beta 1.11.0 · sauvegarde v18 · 10 lignées illustrées sur 30

---

## Le plan de versions — ce qu'on fait maintenant

Le numéro suit la règle écrite en haut de `game.js` : majeur pour un morceau de jeu qui
n'existait pas, mineur pour une nouveauté qui tient dans le jeu tel qu'il est, correctif pour
le reste. Chaque version répond à une question, et c'est la question qui décide si elle est
réussie.

**Ce qui reste à venir ne porte pas de numéro**, seulement un ordre : trois fois de suite une
idée non prévue s'est glissée devant, et il a fallu renuméroter la moitié de la table. Le
numéro se décide au moment du commit, là où la règle sait quoi en faire.

### Ce qui est tombé

Le détail version par version est dans le [README](README.md#ce-qui-est-sorti). Ce tableau
regroupe par chantier, parce que c'est ainsi qu'on s'en souvient.

| Chantier | Versions | La question qu'il posait | Réponse |
|---|---|---|---|
| **Les cinq âges** | 1.0 → 1.4 | est-ce que la progression cesse de reculer ? | oui — plus rien ne redescend, par construction |
| **Les prix de moitié** | 1.5 | est-ce que la partie compressée se joue mieux ? | à mesurer encore |
| **L'album et l'ascension** | 2.0 → 2.5 | est-ce qu'on veut recommencer ? | jouée plusieurs fois ; la question de fond reste ouverte |
| **Les achats par lots** | 2.1 | est-ce que la fin de partie cesse d'être une paperasse ? | oui |
| **Les jetons de fortune** | 2.2, 2.9, 2.30 | est-ce que l'ascension se mérite ? | oui — un jeton une carte, et sauter les dépense tous |
| **Dix lignées rares** | 2.3 | est-ce que l'ère rare cesse de se répéter ? | oui sur le papier — six lignées sans dessin |
| **Le glisser-déposer des cartes** | 2.7 | est-ce que l'album se manipule ? | non vérifié : rien de visuel ne l'est |
| **L'ergonomie du clic** | 2.7.2 → 2.7.3 | est-ce que la barre espace se comporte ? | oui |
| **La charte « idole »** | 2.6, 2.7.1 | est-ce qu'une mythique impressionne ? | oui — validé sur l'Ouroboros |
| **Le mode histoire** | 2.8, 2.11 → 2.12 | est-ce qu'on se sent accompagné ? | à voir en jouant |
| **Les trois axes** | 2.13 | est-ce qu'on comprend ce qui monte ? | oui — âge, niveau, taille, chacun sa colonne |
| **Le confort de la ferme** | 2.14 | est-ce que l'achat par lots tient sa promesse ? | oui — la réserve se vide seule |
| **Le vocabulaire** | 2.15 | est-ce qu'un nom peut contredire une colonne ? | plus maintenant, et c'est vérifié |
| **Le bonheur** | 2.16 | est-ce qu'être présent paie ? | un peu, enfin |
| **La sauvegarde** | 2.17 | la partie peut-elle survivre au navigateur ? | oui — fichier ou texte |
| **Le clic** | 2.18 | un achat de clic se sent-il ? | oui — une seconde entière, et le premier âge ne s'évapore plus |
| **Les compteurs** | 2.19 | le jeu se souvient-il de quelque chose ? | dix-sept nombres, cumulés sur le fichier |
| **Les cartes** | 2.20 | l'ascension donne-t-elle envie ? | deux effets qui se voient dès la première seconde du cycle |
| **Les primes** | 2.21, beta 1.6 | acheter peut-il cesser d'être « niv. 5 → niv. 6 » ? | trente-six achats uniques, et la grille n'en montre que cinq à la fois |
| **La collection** | 2.22 | 135 cases peuvent-elles se ranger ? | elle se replie, section par section |
| **Le socle de la pension** | 2.23–2.24.1 | les cinq pièces s'emboîtent-elles ? | oui — écrites scellées, puis ouvertes sans une ligne à reprendre |
| **Les écrans bas** | 2.24 | le jeu tient-il sur un portable ? | tout se replie, et deux ruptures en hauteur |
| **La plonge** | 2.25, 2.27 | peut-on rendre le jeu injouable ? | non — dix clics l'assiette, et elle se raconte avant de s'ouvrir |
| **Les trophées** | 2.25 | reste-t-il un objectif nommé ? | douze, dont six qu'on ne voit qu'en les décrochant |
| **Le dialogue** | 2.12, 2.26, 2.28 | la professeure regarde-t-elle ce qu'on fait ? | oui, et elle peut retenir : trois passages obligés éteignent l'écran |
| **L'ouverture** | 2.29 | le début est-il trop facile ? | il l'était — trois fois plus long désormais, mesuré |
| **La fusion et la poussière** | 2.30 → 2.32 | est-ce qu'une carte ratée vaut d'être gardée ? | oui — dix cartes font une étoile |
| **Les automates par âge** | 1.0 → 1.4 | est-ce que l'ordre des achats suit la vie de la bête ? | oui, depuis les cinq âges — la ligne avait survécu à sa propre livraison |
| **La pension** | 3.0 | est-ce que parquer deux bêtes est un sacrifice qui se sent ? | oui, et mesuré : jamais le centième de ce qu'elles rapporteraient |
| **Les merveilleuses** | 3.1 | est-ce qu'une merveilleuse se raconte ? | deux écloses sur huit écrites — la réponse est dans le dessin, pas dans le code |
| **Le nid et la pause** | beta 1.0, 1.8 | confier une bête est-il un geste ? | oui — et la pause n'est plus nécessaire depuis qu'une bête confiée quitte la bande |
| **Le rang secret** | beta 1.0.1 | la cinquième rareté se découvre-t-elle, ou s'annonce-t-elle ? | elle se découvre : cinq fuites fermées, et la règle est portée par la table |
| **La production** | beta 1.7 | la pension peut-elle concurrencer l'acheteur ? | oui, du même ordre qu'un acheteur de milieu de partie — et toujours perdante en argent |
| **L'encyclopédie** | beta 1.9, 1.10 | la collection peut-elle dire autre chose que « combien m'en manque-t-il » ? | oui — une fiche par lignée, dans une vue à elle |

### La ligne d'arrivée de l'alpha

**Le mot « alpha » tombe quand la pension, la fusion des cartes et les premières merveilleuses
sont en place ensemble.** C'est la seule définition de la bêta qu'on se donne, et elle a le
mérite de ne dépendre d'aucune date.

Elle tient parce que ces trois-là **forment une boucle**, ce qu'aucune ne fait seule :

- la **pension** donne une raison d'élever plutôt que de vendre ;
- les **merveilleuses** donnent une raison d'utiliser la pension — c'est la seule rareté qui
  ne s'achète pas, et elle n'existe nulle part ailleurs ;
- la **fusion** donne une raison de garder les doublons que tout ça produit, au lieu de les
  laisser dormir en réserve.

Sans la fusion, l'album se remplit de cartes qu'on n'équipera jamais. Sans les merveilleuses,
la pension n'offre qu'un raccourci vers ce qu'on pouvait déjà acheter. Sans la pension, les
merveilleuses n'ont pas de porte. **Le jeu est aujourd'hui un très bon prototype de sa moitié
d'avant**, et ces trois pièces sont ce qui manque pour qu'il soit un jeu.

**Les trois sont tombés.** La fusion en 2.32.0, la pension en 3.0.0, les merveilleuses en
3.1.0 — et la boucle est fermée : on élève pour reproduire, on reproduit pour obtenir ce qui ne
s'achète nulle part, l'album donne une raison de garder les doublons.

L'ordre a changé deux fois en route, et les deux fois pour la même raison : **ne pas rester
bloqué derrière les dessins.** La pension a ouvert sur les vingt-sept lignées existantes,
dessinées ou non — le jeu n'en montre que le glyphe. Les merveilleuses ont suivi à deux sur
huit, par les deux seules dont les recettes se lisaient sans rien ajouter au bestiaire.

Ce que ça coûte, et il faut le dire : **six merveilles sur huit sont écrites et pas écloses**,
et le rang le plus haut du jeu tient aujourd'hui sur deux bêtes en glyphe. Ce n'est pas une
dette de code — il n'y a rien à écrire pour les six autres, seulement des recettes et des PNG.

**Le mot « alpha » est tombé avec la `beta 1.0.0`** : la définition demandait « les premières
merveilleuses », elle ne disait pas combien.

**Et les nombres sont repartis de 1**, contre ce que ce document annonçait. Le raisonnement
d'origine — « la bêta ne remet rien à zéro » — traitait le mot comme une étiquette posée sur
une série continue. Mais la série `alpha 3.x` racontait l'histoire de l'alpha : ses trois
majeurs sont les trois chantiers qui manquaient au prototype. `beta 1.0.0` dit ce que la
version est, une première version d'un jeu complet, là où `beta 3.2.0` aurait continué à
compter les corrections d'un prototype. Le mot et le nombre repartent ensemble, une seule fois
— il n'y aura pas de `gamma`.

### Ce qui vient ensuite

La colonne du milieu dit **ce qu'il faut avoir fait avant**, ce qui est plus utile qu'un ordre :
deux de ces lignes ne dépendent de rien et peuvent tomber n'importe quand.

| Ce qui tombe | Ce qu'il faut d'abord | La question qu'elle pose au joueur |
|---|---|---|
| **Les dix-sept dessins** | rien | — |
| **Les six merveilles restantes** — cinq PNG et une recette chacune | leurs dessins | est-ce que le rang tient sur neuf bêtes ? |
| **L'animation du cinquième âge** — une planche par merveille | les dessins et `tools/pixel.js` | est-ce qu'une bête qui bouge se raconte toute seule ? |
| **L'hérédité** — teintes, tempérament, motif transmis par les parents | rien | est-ce qu'on a envie de sélectionner ? |
| **Le tri du nid** — désigner un couple par sa lignée plutôt qu'en cherchant deux bêtes dans la bande | rien | huit couples se composent-ils encore à la main ? |
| **Ce que la pension a rendu** — un journal des pontes, par lignée | rien | sait-on ce qu'on a produit sans compter les œufs ? |
| **Les fonds** — 1 sur 800, héréditaires, visibles sur les cartes | l'hérédité | est-ce qu'un fond se chasse ? |

### Le chantier graphique

Trois demandes, et elles vont ensemble : c'est **le même écran** qu'elles habillent. Le jeu a
été construit en supposant que le dessin viendrait après ; il est venu pour dix lignées, et
tout le reste — cartes, œufs, fonds — est encore de la typographie et des bordures.

#### Les cartes doivent ressembler à des cartes

Aujourd'hui une carte d'album est **une ligne** : une vignette à gauche, deux lignes de texte à
droite, une bordure teintée à la rareté. Ça se lit, ça se trie, ça se glisse — et ça n'a
strictement rien d'une carte. Le mot est employé partout dans le jeu, y compris dans les
mécaniques qui en dépendent (les étoiles, la poussière, la fusion), et l'objet ne le tient pas.

Ce qu'une carte demande, et qui n'existe nulle part :

- un **cadre** — un rapport hauteur/largeur assumé, pas une bande ;
- une **zone d'illustration** distincte de la zone de texte ;
- un **dos** ou une signature de rareté qui se voit à distance ;
- de quoi supporter le fond animé ci-dessous sans devenir illisible.

C'est le plus gros morceau de CSS du projet, et il touche trois écrans : l'album, l'écran
d'ascension, et le choix des cartes actives.

#### Les fonds, animés

Les [fonds](#les-fonds--à-développer) étaient prévus comme une variante *visuelle et
collectionnable* de plus, au même rang que les teintes. La demande les précise : **animés, de
particules et de couleurs**, et visibles à la fois **sur la créature en scène et sur sa carte**.

Deux conséquences qui n'étaient pas dans la note d'origine :

- ils deviennent le **premier élément animé du jeu** hors du cinquième âge des merveilles, ce
  qui pose la même question de coût — et la même réponse : `prefers-reduced-motion` fige tout ;
- ils doivent tenir **derrière un sprite de 32 px** sans le manger, et **derrière une carte**
  sans en rendre le texte illisible. C'est la contrainte qui décidera de leur forme, pas
  l'inverse.

À faire en canvas ou en CSS pur ? La réponse dépend du nombre de fonds visibles à la fois : un
seul en scène, mais potentiellement cinq cartes équipées côte à côte.

#### Un dessin pour les œufs

Les cinq sortes d'œufs partagent le même glyphe 🥚 et se distinguent par leur nom et leur
couleur de bordure. C'est le seul objet du jeu qu'on regarde **pendant des minutes** — la
couvaison est une attente — et il n'a pas d'image.

Cinq dessins : commun, rare, épique, mythique, merveille. Ils profitent du même outillage que
les créatures (`tools/pixel.js`), et ils sont **le meilleur rapport travail/visibilité du
projet** : cinq images pour l'écran que tout le monde voit en premier.

### Ce que la 1.7 laisse derrière elle

Trois choses sont apparues en mesurant la pension contre l'acheteur, et aucune n'est réglée :

- **Huit couples se composent à la main, un par un.** Le nid marche pour un couple et pour deux ;
  à huit, désigner seize bêtes dans une bande de quarante devient la corvée que le glisser-déposer
  devait supprimer. La `beta 1.8.0` a retiré les confiées de la bande, ce qui l'allège à mesure
  qu'on remplit la pension — mais ne règle pas le problème : c'est le CHOIX des seize qui est
  long, pas leur affichage.
- **Le panneau de pension a coûté deux défauts d'affichage en deux versions**, et les deux
  étaient déjà documentés ailleurs dans le fichier : un tirage dans une branche morte
  (`beta 1.8.1`) et un DOM rebâti sous le curseur (`beta 1.8.2`, le même défaut que la bande
  avant la 2.14.0). **Tout écran neuf doit être relu contre les commentaires de `renderStrip`
  avant d'être écrit**, pas après.
- **Le plafond de la réserve n'est pas un problème, vérifié en jouant.** Cinquante œufs par
  sorte se remplissent en trois minutes quand la pension tourne à mille œufs l'heure, et le
  couplage avec le nombre d'incubateurs est donc réel — mais il se joue bien. Il reste écrit
  ici comme un fait à connaître, plus comme une inquiétude.
- **La pension ne dit pas ce qu'elle a produit *cette nuit*.** La `beta 1.9.0` règle la moitié
  de la dette : la fiche d'une lignée dit désormais quels couples l'ont donnée et combien de
  fois, depuis toujours. Ce qui manque encore est le **journal récent** — « pendant ton absence,
  la pension a sorti quarante loups » — qui relève du bandeau de retour, pas du carnet.

**La compatibilité et la rareté de l'enfant ont été absorbées par la 3.0.0** : les étiquettes,
la stérilité de la pierre, la durée par distance et le tirage entre parents sont tombés avec la
pension, parce qu'aucune d'elles n'avait de sens séparément — une pension sans règle de
compatibilité, c'est un bouton qui attend.

**Les six merveilles restantes ne coûtent aucun code.** La 3.1.0 a posé la rareté, la sorte
d'œuf qui ne s'achète pas, la table `RECETTES` et la phrase qui les annonce sans les nommer.
Ajouter Surtr, c'est cinq PNG et une ligne de recette. C'est le meilleur endroit où la dette du
projet pouvait se déplacer : elle est entièrement dans le dessin.

**La place unique n'a pas tenu, et c'était le bon abandon.** Elle était là pour forcer à choisir
*quel* couple confier, et l'argument valait tant que la pension était un outil de collection.
Du jour où elle a dû concurrencer l'acheteur, une place unique ne posait plus une question mais
un plafond : on ne choisissait pas mieux, on produisait moins. Les huit places se paient
maintenant six cent milliards, et seize enclos qui ne rapportent plus rien — le choix a
simplement changé de monnaie.

**Une ligne a disparu sans être faite, parce qu'elle l'était déjà.** « Les automates par âge —
l'éleveur aux jeunes, la mangeoire aux grandes bêtes » décrivait mot pour mot ce que le jeu
fait depuis les cinq âges : l'éleveur pousse jusqu'à `bandTo` et s'arrête à la maturité, la
mangeoire ne touche qu'aux bêtes mûres. Vérifié au banc — avec les deux à fond, une jeune gagne
de la croissance et zéro embonpoint ; une fois mûre, l'inverse exactement.

La ligne avait survécu à sa propre implémentation, et personne ne l'avait rayée. C'est le
risque d'un plan qui décrit une intention plutôt qu'un état : **une ligne qu'on n'a pas
rayée finit par ressembler à du travail restant.** Il vaut la peine, de temps en temps, de
relire ce qui reste en se demandant non pas « est-ce qu'on veut le faire ? » mais « est-ce que
ce n'est pas déjà fait ? ».

L'ordre a été **inversé en cours de route** : la pension devait venir avant l'album, elle
passe après. L'album est la clé de voûte vers laquelle les deux autres chantiers pointent, et
le construire d'abord leur donne un endroit où atterrir. Le prix de l'inversion est connu et
accepté : l'album est sorti sans son cran le plus haut, la merveilleuse ne s'obtenant qu'en
pension.

### La fusion et la poussière de carte

Une carte porte des **étoiles**. Elle naît à **une**, la fusion la monte à **deux**, puis à
**trois**, et ça s'arrête là — `ETOILES = [1, 1.8, 3]`, deux fusions au plus dans la vie d'une
carte. Chaque étoile multiplie toute sa puissance.

Ce qui manquait, c'était **ce qu'on paie pour le faire**. La réponse est une monnaie propre aux
cartes : la **poussière**.

#### Pourquoi une monnaie, et pas des doublons

Une fusion classique demande deux cartes identiques. Ici c'est impossible, et le calcul le dit
sans appel : une carte porte une lignée, un âge, un niveau, un motif, une teinte, un rang et
un chromatique, soit **près de treize millions de cartes distinctes**. Deux exemplaires
identiques n'arriveront jamais.

Le problème réel n'est donc pas le doublon, c'est **la carte médiocre**. Une ferme de vingt
bêtes en produit vingt à chaque ascension, dont trois valent la peine. La poussière transforme
les dix-sept autres en carburant, et la question du plan — *« est-ce que les doublons valent
d'être gardés ? »* — devient **« est-ce qu'une carte ratée vaut d'être gardée ? »**, à quoi la
réponse est oui : elle vaut ce qu'on en tire.

#### Les trois robinets, et le seul évier

| | |
|---|---|
| **désintégrer une carte** | la source principale — c'est le geste qu'on répète |
| **l'ascension** | un peu de poussière par bête sacrifiée : ce qu'on jette cesse d'être une perte sèche |
| **fusionner** | le seul évier, et il doit tout absorber |

Le deuxième mérite un mot : aujourd'hui les bêtes qu'on n'emporte pas **disparaissent sans
rien laisser**. Leur donner un peu de poussière ne rend pas le sacrifice indolore — « pas
beaucoup » est la consigne — mais il récompense d'ascensionner sur une ferme pleine plutôt que
sur trois têtards, ce que le jeu voulait déjà encourager sans avoir de moyen de le dire.

#### Ce qu'une carte rend, quand on la désintègre

Les mêmes axes que sa puissance, pour qu'une bonne carte fasse mal à détruire :

    poussière = BASE × rareté × chromatique × fond

| Axe | Proposition | Pourquoi |
|---|---|---|
| **base** | 10 | de quoi compter en dizaines, pas en unités |
| **rareté** | ×1 · ×3 · ×10 · ×30 | plus raide que le plafond de puissance (1 / 1,6 / 2,5 / 4) — la poussière est une ressource, pas un multiplicateur |
| **chromatique** | ×3 | une bête sur 8 192 |
| **fond** | ×2 | quand les fonds existeront ; sans eux le facteur vaut 1 |

**La qualité n'entre pas.** Niveau, teinte et rang décident déjà de la puissance de la carte :
les faire entrer aussi dans la poussière punirait deux fois d'avoir une bonne carte, et
rendrait la décision « garder ou fondre » insoluble. On veut au contraire qu'elle soit
lisible — *une carte vaut sa puissance, ou sa poussière, et les deux ne se ressemblent pas.*

#### Ce qu'une fusion coûte

    coût = COÛT[étoile visée] × rareté

avec `COÛT = [—, 100, 400]`, soit ×4 pour la seconde fusion.

**Le facteur de rareté est le même des deux côtés**, et c'est délibéré : il s'annule. Monter
une commune ou une mythique d'un cran demande **le même nombre de cartes de sa propre
rareté** — dix pour la deuxième étoile, quarante pour la troisième, cinquante en tout. Un
joueur n'a donc jamais intérêt à fondre ses mythiques pour nourrir ses communes, ni l'inverse :
chaque rareté se nourrit d'elle-même, et l'arbitrage reste dans la lignée qu'on aime.

#### La règle qui protège tout

**Fusionner puis désintégrer ne doit jamais rendre plus qu'on n'a mis.** C'est la seule façon
de fabriquer de la poussière à l'infini, et elle suffirait à vider le système de son sens.
Deux façons de s'en assurer, à trancher :

- le palier **n'entre pas** dans la poussière rendue — une carte fusionnée rend autant qu'une
  carte neuve, et le dernier cran est un aller sans retour ;
- ou il entre, mais en rendant strictement moins que le coût cumulé.

La première est plus simple et se raconte mieux : **on ne défait pas une fusion.**

#### Ce qui reste à trancher

- **La poussière traverse-t-elle l'ascension ?** Oui, sûrement : c'est une monnaie de cartes,
  et l'album traverse. La remettre à zéro obligerait à tout fondre avant chaque saut — une
  corvée déguisée en décision.
- **Peut-on désintégrer une carte équipée ?** Non. Une carte qui s'évapore d'un emplacement
  change le build en silence ; il faudra la retirer d'abord.
- **Où s'affiche la poussière ?** Dans l'en-tête de l'album, à côté du compte de cartes. Et
  chaque carte doit dire ce qu'elle rendrait — sinon la décision se prend à l'aveugle.
- **Les dix familles rendent maintenant quelque chose à la troisième étoile**, et un scénario
  du banc le garde. C'est le perlé qui posait le problème — il plafonnait dès la deuxième — et
  il a été remplacé en 2.31.0 par le martelé, calé pour atteindre 96 % de son plafond à la
  troisième exactement. La règle à retenir pour toute famille future : **`pas × 12` doit rester
  juste sous `cap`**, puisque 12 est la puissance d'une carte parfaite à trois étoiles.
- **Faut-il un plafond de poussière ?** Probablement pas : elle se dépense par centaines et
  s'obtient par dizaines, l'accumulation est lente par construction.

**Le socle de la pension était l'atome, et il a tenu.** Emplacements, parents, durée, œuf et
rente suspendue ont été écrits ensemble en 2.23.0, scellés en 2.24.1, ouverts en 3.0.0 — et
**pas une des cinq pièces n'a eu à être reprise**. Seuls les deux bouchons annoncés comme tels
ont été remplacés : `distanceDe` par les étiquettes, `oeufDe` par la lignée promise.

C'est le seul retour d'expérience qui vaille sur la méthode « écrire scellé » : elle coûte une
version, et elle rend le jour de l'ouverture entièrement disponible pour les questions
d'équilibrage — qui sont, elles, celles qu'on ne peut pas trancher sur le papier. La table de
durées écrite au moment du socle était une imprimante à billets, et la mesure l'a montrée en
deux minutes le jour où on l'a branchée.

Ce qui a changé dans l'ordre : **on n'a pas attendu le bestiaire.** Le raisonnement d'origine
tenait — régler une mécanique sur un bestiaire qui va changer sous elle est un piège — mais il
supposait que la pension ait besoin des merveilleuses pour valoir quelque chose. Elle vaut sans
elles, à condition de dire ce qu'elle est : un outil pour **viser** une lignée, pas une porte.
Les dessins manquants ne la gênent pas ; le jeu affiche un glyphe et joue pareil.

### Le chantier qui barre la route : les dessins

C'est redevenu une voie de fond : la pension a ouvert sans attendre le bestiaire, et le jeu
affiche un glyphe pour toute lignée sans dessin. Rien n'en dépend, tout en bénéficie.

**17 lignées sur 27 n'ont pas de dessin** — les dix rares (loup, méduse, salamandre,
serpent, araignée, cerf, ours, papillon, tortue, chat), les quatre épiques (kraken, golem,
sphinx, cheval) et les trois mythiques (chimère, béhémoth, ouroboros). Ce n'est pas une
version, c'est une voie de fond qui avance entre les autres. Rien n'en dépend, tout en
bénéficie.

C'est aussi **la seule partie du prototype qui ne sera pas jetée** : `game.js` partira à la
poubelle au jalon 1, les PNG resteront tels quels dans le vrai jeu. Chaque heure passée là est
acquise, contrairement à tout le reste.

Les 28 fiches de `prompts/` portent chacune le brief, la commande de découpe et la ligne à
coller dans la table `ART`. La charte a deux registres : **mascotte** pour les communes, les
rares et les épiques, **idole** pour les mythiques et les merveilleuses — le second est né en
2.7.1, quand l'Ouroboros mignon a été rejeté.

Deux leçons payées cher, à ne pas réapprendre :

- Le crabe a dormi cinq jours dans `art/` sans être branché dans la table `ART`, et la lignée
  s'affichait en emoji alors qu'elle était prête. **Poser les fichiers ne suffit pas.**
- Un nom de forme ne doit reprendre **aucun des cinq noms d'âge ni des six noms de taille** :
  ils s'affichent à un centimètre du nom, et « Rongeur colossal · taille normale » se
  contredit tout seul. Neuf formes ont dû être renommées en 2.15.0. Le scénario
  `noms` de `tools/test.js` monte la garde.

### Deux pièges de migration à ne pas oublier

Les nouvelles teintes s'ajoutent **à la fin** de `TINTS`. Une bête stocke sa teinte par
indice ; en insérer une au milieu repeindrait tout le bestiaire déjà éclos.

La réserve d'œufs devait prendre son plafond **avant** la pension, et elle l'a pris : cinquante
par sorte, posés dans la même version. C'était le seul frein du hors-ligne, et une partie qui
aurait déjà tourné sans lui serait rentrée sur des centaines d'œufs le jour de l'ajout. Le
piège reste écrit ici parce qu'il vaut pour tout robinet futur : **le plafond se pose avec le
robinet, jamais après.**

---

## L'outillage

Le projet n'ouvre jamais de navigateur. Tout ce qui n'est pas lu à l'œil passe par le banc
d'essai, qui a longtemps vécu dans un dossier temporaire et se refabriquait de mémoire à
chaque session. Il est dans le dépôt depuis la revue de structure.

```
node tools/test.js              les 48 scénarios
node tools/test.js bonheur      seulement ceux dont le nom contient « bonheur »
```

- **`tools/banc.js`** fait tourner `game.js` sous Node : un DOM minimal, les identifiants lus
  dans `index.html`, et **tout ce que `game.js` déclare au premier niveau exposé
  automatiquement**. La liste d'exports était écrite à la main et se périmait à chaque
  fonction ajoutée — un test échouait alors pour une raison qui ressemblait à un bug du jeu.
- **`tools/test.js`** porte les scénarios. Ils ont été écrits au fil des versions, chacun le
  jour où quelque chose s'est cassé : ils visent des endroits précis plutôt que de couvrir
  uniformément.

**Ce qu'ils ne prouvent pas : rien de visuel.** Le DOM du banc ne met rien en page. Un panneau
superposé, un texte illisible, une couleur ratée passent tous les tests. C'est la première
dette du projet, et elle ne se réglera pas ici.

Les autres outils servent aux dessins : `decouper.py` découpe une planche source en cinq PNG,
`prompt.js` fabrique les fiches de `prompts/`, et `rendu.js` / `formes-*.js` / `styles.js`
sont les restes d'une exploration de formes procédurales abandonnée au profit des PNG.

---

## Le vivier — idées non tranchées

Rien de tout ça n'est décidé : c'est un stock de candidats, pas une file d'attente. Le
raisonnement complet est dans la note [Ce qui manque à
Éclosion](https://claude.ai/code/artifact/5b0057d3-2083-44dc-933c-b9da51b648cd) ; ce qui suit
est ce qu'il faut avoir en tête pour choisir.

| L'idée | Ce que ça règle | Coût |
|---|---|---|
| **Les fonds** | dix-sept lignées manquent, et huit fonds habilleraient les 135 formes | à chiffrer |
| **Filtre de l'enclos par trait** | on chasse un motif que le jeu ne permet pas de chercher | une soirée |
| **Événements courts** | l'éclosion ne surprend plus | deux soirées |
| **Interface au pouce** | un clicker se joue au téléphone, pas au bureau | un week-end |

La 2.24.0 a réglé la moitié « écran bas » du problème — pliage des panneaux et deux ruptures en
hauteur — mais **rien de ce qui touche au doigt** : c'est le sujet de `REFONTE.md`, écrit en
parallèle. Les deux se rejoignent sur `style.css`.

**Les compteurs sont sortis du vivier** : livrés en 2.19.0, sous le bouton `📊`.

**L'export / import est sorti du vivier** : livré en 2.17.0. La partie se télécharge en
fichier ou se copie en texte, et se relit dans l'autre sens — avec un résumé de ce que le
fichier contient affiché *avant* d'écraser quoi que ce soit, parce que le vrai risque de la
restauration n'est pas de rater le geste, c'est de restaurer le mauvais fichier.

**La frénésie de clic est sortie du vivier** : livrée en 2.16.0, sous une forme plus douce que
prévu. Elle ne s'achète pas et ne se déclenche pas — une bête qu'on garde en scène l'offre
d'elle-même, tous les quatre à cinq cents secondes de présence, et ne double que le clic. Neuf
pour cent du temps à ×2, mesuré : c'est un cadeau, pas une amélioration.

### Les fonds — à développer

Une bête pourrait naître avec un **fond** : un décor derrière elle, tiré à l'éclosion et gardé
à vie. Il se voit sur la scène et **sur la carte d'album**, et il fait monter un peu le prix
de vente. Il **s'hérite**, comme les teintes, le jour où la pension existera.

**Il est visuel, collectionnable et prestigieux — et il n'entre pas dans le nom.** C'est
tranché. Un fond SE VOIT : le dire en plus serait une redite, et le jeu n'affiche qu'une seule
épithète exprès, pour qu'une bête reste une bête et pas une fiche technique. `Têtard farouche`
garde son nom, et son décor par-dessus le marché.

Deux conséquences à ne pas perdre :

- **Un objet de collection a besoin d'un endroit où être collectionné.** La collection suit
  aujourd'hui 135 formes ; les fonds y ajouteraient un second axe, avec son propre compteur.
  Sans ça, « collectionnable » n'est qu'un mot.
- **Prestigieux veut dire rare.** La plupart des bêtes n'en ont aucun. Un fond fréquent
  devient un décor et cesse d'être une rencontre — c'est la même règle que le chromatique.

Rien n'est écrit ; ce qui suit est ce qu'il faut avoir en tête avant de commencer.

#### Pourquoi c'est le meilleur rapport dessin / variété du jeu

Les dix-sept lignées sans image demandent **cinq dessins chacune**, et chaque dessin ne sert
qu'à une forme. Un fond, lui, sert **aux 135 formes à la fois** : huit fonds multiplient par
neuf le nombre d'images différentes qu'on peut croiser, pour huit fichiers. C'est l'inverse
exact du coût des créatures, et c'est l'argument principal en faveur de l'idée.

#### Ce qu'il faut décider avant d'écrire

- **La fréquence est tranchée : 1 sur 800, et seulement dans les œufs de la boutique.** Le
  qualificatif compte autant que le chiffre — voir plus bas.
- **Ce que « un peu plus cher » veut dire.** L'échelle existe déjà : la teinte va de ×1,10 à
  ×1,20. Un fond dans cette fourchette s'intègre sans rien déranger ; au-delà il faudrait
  reprendre l'équilibrage des variantes en entier.
- **Le fond et le motif ne font pas le même métier.** Le motif décide de l'EFFET d'une carte,
  le fond de sa VALEUR. Les deux peuvent coexister sur la même bête sans se marcher dessus,
  mais la carte d'album devra montrer les deux sans devenir illisible.
- **L'hérédité.** La pension existe depuis la 3.0.0, mais elle ne transmet que la LIGNÉE :
  teinte, tempérament et motif se tirent encore au hasard. Le fond suivra la règle des teintes,
  quelle qu'elle soit — une raison de plus de ne pas écrire cette règle à la légère.

#### Un sur huit cents, et seulement à la boutique

**Le tirage se fait sur les œufs achetés, à 1 sur 800.** Les œufs qui viendront de la pension
ne tirent pas : ils **héritent**. C'est la même frontière que pour les teintes, et elle donne
sa place à chacune des deux voies — on achète pour tomber dessus, on élève pour en obtenir un
précis.

**Ce que 1/800 donne vraiment**, mesuré au banc sur le débit d'éclosions à différents moments
de la partie :

| Moment | Éclosions par heure | Un fond tous les |
|---|---|---|
| au tout début, au clic | 120 | 6 h 40 |
| première demi-heure | 240 | 3 h 20 |
| ère rare | 1 400 | 33 min |
| ère épique | 5 800 | 8 min |
| fin de partie | 19 000 | 3 min |
| très fin de partie | 43 000 | 1 min |

**Le chiffre est calé là où le joueur regarde encore ses bêtes.** Dans les premières heures —
celles où l'on ouvre chaque œuf, où l'on lit chaque nom — un fond est un événement de session.
C'est exactement ce qu'on veut d'une chose prestigieuse.

**Il se dilue ensuite, et c'est la nature de tout tirage par œuf.** Le débit d'éclosions du
jeu va de 120 à 43 000 par heure, un facteur trois cent soixante : aucune probabilité fixe ne
peut rester rare aux deux bouts. Le chromatique a exactement le même défaut à 1 sur 8 192 — en
fin de partie il tombe toutes les dix minutes. Ce n'est donc pas un problème des fonds, c'est
la forme du système de variantes, et il faudra un jour se demander si la rareté doit se
mesurer en œufs ou en temps.

En attendant, la dilution est moins grave qu'elle n'en a l'air : en fin de partie tout part au
marchand automatique sans qu'on le regarde, et les fonds qui comptent sont ceux des bêtes
qu'on **garde**. La pension, elle, rendra le fond chassable au lieu d'attendu.

#### Le piège de migration, le même que pour les teintes

Une bête stockera son fond **par indice**. Les nouveaux fonds s'ajoutent donc **à la fin** de
la table, jamais au milieu : en insérer un redécorerait tout le bestiaire déjà éclos. C'est
exactement la règle qui protège déjà `TINTS` et `MOTIFS`, et elle a déjà failli être oubliée
une fois.

### Le diagnostic en trois phrases

**Le jeu se souvient, et il attend quelque chose.** Dix-huit compteurs cumulés sur la vie du
fichier depuis la 2.19.0, et douze trophées accrochés dessus depuis la 2.25.0 — six objectifs
nommés, six surprises. Le diagnostic « un nombre qui monte sans que rien ne l'attende reste un
nombre » est réglé.

**Il a de nouveau des objectifs nommés**, depuis la 2.25.0 : six trophées visibles disent où
va le jeu. Les douze jalons d'origine, eux, restent écrits et inutilisés — ils ne reviendront
pas tels quels, puisqu'un trophée ne doit jamais donner de puissance.

**Être présent paie un peu, depuis peu.** Le chromatique à 1/8 192 et la montée à 1/1 000 sont
deux décisions justes qui se sont additionnées la même semaine, et les deux surprises de
l'éclosion sont parties ensemble. Le bonheur de la 2.16.0 rend quelque chose à la présence,
mais il récompense de rester *devant une bête*, pas d'ouvrir la page : la surprise de
l'éclosion, elle, n'a toujours rien qui la remplace.

### Trois règles à ne pas perdre en chemin

**Un trophée ne donne jamais de puissance.** Une prime en pièces à la rigueur, jamais un
multiplicateur : un trophée qui pèse sur l'équilibrage redevient un jalon déguisé, et c'est
exactement ce qu'on vient de démêler en passant aux jetons.

**Un événement ne donne jamais ce qui se chasse.** Ni chromatique offert, ni montée de rareté,
ni carte d'album — seulement des pièces, du temps ou de la rente. Sans cette règle, on refait
ce qu'on vient de défaire en portant le prodige à 1/8 192. Et il ne doit rien coûter à qui
n'est pas là : un événement manqué qui pénalise transforme un idle en corvée d'assiduité.

**Les compteurs sont cumulés sur la vie du fichier, pas sur la partie.** Sinon l'ascension les
efface, et le seul endroit qui garde la mémoire du joueur devient le seul qui l'oublie.

### Ce qu'on a décidé de ne pas faire

- **Mettre la merveilleuse en boutique.** Elle tient toute sa valeur du fait qu'elle ne
  s'achète pas, et c'est vérifié des deux côtés depuis la 3.1.0 : aucun œuf vendu ne la cote,
  et `buyEgg` refuse ce qui n'a pas de prix.
- **Lui donner plus de valeur qu'une mythique.** Même multiplicateur, même plafond de carte,
  même rente. Si elle rapportait davantage, la pension redeviendrait une stratégie d'argent et
  tout le travail de la 3.0.0 tomberait sur la première éclose. Un cran de rareté, jamais un
  cran de puissance.
- **Réserver la merveille à sa recette une fois qu'on en a une.** Elle se reproduit comme le
  reste — Wukong × golem rend 5 % de Wukong. La seconde est plus facile que la première, et
  c'est la bonne asymétrie : ça donne une raison de garder une merveille plutôt que de la
  vendre.
- **De nouvelles lignées au-delà des vingt-sept.** L'ère rare a été portée à dix en 2.3.0
  parce qu'elle se répétait ; les épiques et les mythiques, elles, se traversent trop vite
  pour que le compte se voie. Au-delà, le contenu qui manque n'est pas le nombre de lignées,
  c'est le nombre de dessins — dix-sept sur vingt-sept n'en ont pas.
- **Un deuxième axe de prestige.** L'argument d'origine — le premier cycle n'a pas encore été
  rejoué après une ascension — est tombé : elle donne envie de recommencer, c'est vérifié. Il
  reste écarté pour la seule raison qui vaille encore : rien ne le demande.
- **Remonter les taux pour compenser.** Si l'éclosion paraît plate, la réponse est la couche
  d'événements, pas un retour en arrière qui redonnerait aux surprises leur banalité.
- **Découper `game.js` en modules.** Le fichier fait 3 800 lignes et part à la poubelle au
  jalon 1 : le scinder coûterait une demi-journée pour un confort qui ne survivrait pas au
  serveur. Ses dix sections commentées suffisent à s'y retrouver.

---

## Le plan des jalons — ce que le jeu sera

Les estimations sont en **jours de travail concentré**, pas en jours calendaires.

| Jalon | Ce qu'il apporte | Estimation | État |
|---|---|---|---|
| **0** | Prototype de sensation : un fichier, tout en mémoire, aucun compte | 1–2 j | **livré, et très dépassé** |
| **1** | La boucle réelle : comptes, base de données, serveur faisant autorité | 8–12 j | pas commencé |
| **2** | L'idle : incubateurs, calcul à la lecture, progression hors ligne | 4–6 j | fait côté navigateur |
| **3** | Les automatisations, une par une | 4–6 j | fait côté navigateur |
| **4** | Reproduction et gènes | 8–12 j | la pension le prépare |
| **5** | Marché entre joueurs | 10–15 j | pas commencé |

**Total : 35 à 55 jours**, plus 3 à 5 pour les évolutions ajoutées en cours de route. La
plupart des projets de ce type meurent au jalon 4, quand la nouveauté est passée et qu'il
reste le gros du travail.

Le jalon 1 est **le seul qui n'a pas commencé du tout**, et c'est celui qui décide de tout le
reste : comptes, base de données, serveur qui fait autorité. Tout tourne encore dans le
navigateur, dans un fichier qu'on a décidé de jeter.

### Les décisions structurantes

Elles ont été prises une fois, elles engagent tout le reste.

**Le serveur ne fait jamais tourner de boucle.** On stocke une date de début sur chaque chose
en cours, et on calcule ce qui s'est passé quand le joueur revient. Rien ne tourne tant que
personne ne regarde, et la progression hors ligne est gratuite : c'est le même code.

**Le hasard est tiré à l'avance.** Conséquence directe : quand un œuf est mis en couvaison, on
tire immédiatement ce qui en sortira et on le range, caché. Sans ça, huit heures d'absence
sont incalculables. C'est déjà le cas dans le prototype — la lignée se tire à la mise en
couvaison, pas à l'éclosion.

**Ce qui dépend de la présence ne se rattrape pas.** Le bonheur de la 2.16.0 est le premier
morceau de jeu qui ne tourne PAS pendant une absence, et c'est délibéré : vingt frénésies
gagnées pendant la nuit expireraient toutes avant qu'on ait posé un doigt sur l'écran. La
règle vaudra pour tout ce qui viendra ensuite — un événement, une caresse, un soin.

**Le même calcul tourne à deux endroits** — sur le serveur pour la vérité, dans le navigateur
pour que les nombres montent joliment. Écrit deux fois dans deux langages, il divergera et
coûtera des mois de bugs d'affichage. C'est le seul vrai argument technique du projet, et il
pousse vers un module de calcul partagé. **C'est la question à trancher avant d'écrire une
ligne de serveur**, et elle n'est pas tranchée.

**Un œuf et une créature sont la même ligne** à des stades différents.

**Un seul dessin par forme**, agrandi au fil de la croissance. C'est l'évolution qui change
l'image, jamais la croissance.

**Tous les nombres d'équilibrage vivent au même endroit**, jamais en dur dans le code.

---

## Où on en est

Le jalon 0 est livré en **alpha 2.16.0**, et il déborde largement de son cadre : 27 lignées au
lieu de 5, une vie de cent niveaux en cinq âges, les variantes, quatre raretés, huit
améliorations, la rente, la collection, l'album, l'ascension, un mode histoire avec une
professeure, et le bonheur des bêtes. Une partie des jalons 2 et 3 est donc jouable — mais
**entièrement dans le navigateur**.

Quatre écarts avec le plan d'origine, tous volontaires :

- **Les cinq paliers sont devenus cent niveaux en cinq âges.** L'évolution n'est plus une
  transition, c'est un **péage** : arrivée au dernier niveau de son âge la bête se bloque, et
  seul le paiement la débloque. La décision « je vends ou je paie » revient cinq fois par bête
  au lieu d'une.
- **Rien ne se nourrit contre des pièces.** Une bête grandit au clic et au temps.
- **L'album et l'ascension sont arrivés avant la pension**, alors qu'ils étaient prévus après.
  La pension a suivi en 3.0.0, mais sans les merveilleuses : elle sert à viser une lignée, pas
  encore à débloquer une rareté.
- **Un mode histoire est apparu**, qui n'était nulle part au plan. Le jeu ouvrait sur quatorze
  boutons dont treize inachetables ; il ouvre maintenant sur un œuf et quelqu'un qui parle.

### Les dettes

**LE JEU A UNE IMPASSE SÈCHE, ET ELLE EST À DEUX MINUTES DU DÉBUT.** Zéro bête, zéro œuf en
réserve, et moins que le prix d'un œuf commun : plus rien ne peut rentrer. Pas de rente sans
bête, pas de clic sans sujet, pas de vente sans rien à vendre. Le seul geste possible est
d'effacer la partie.

Ce n'est pas un cas de coin. Le chemin le plus court passe par **le conseil du tutoriel** :
on vend sa première bête pour 40 pièces, la professeure annonce qu'« il y a des choses à
acheter qui ne sont pas des œufs », la Force du clic en coûte 30 — et il en reste 10 pour un
œuf qui en vaut 12. Cinq minutes de boucle plus tard, toujours 10.

**Elle est bouchée depuis la 2.25.0** : c'est [la plonge](#sortir-de-limpasse--la-plonge), une
pièce par assiette, dix clics l'assiette, aucun multiplicateur. Un idle ne doit jamais pouvoir
se rendre injouable — c'est la seule faute dont un joueur ne revient pas. La dette reste écrite
ici parce que la règle vaut pour tout ce qu'on ajoutera : **chaque nouvelle façon de dépenser
doit être relue en se demandant si elle peut assécher la partie.**

**Le visuel est vérifié en permanence — dette close.** Elle a été ouverte pendant vingt
versions au motif que le banc ne met rien en page et ne le dira jamais. C'est toujours vrai du
banc, et c'est faux du projet : **le jeu est joué en continu, et pas de nouvelle vaut bonne
nouvelle.** Ce qui remonte, remonte vite — les huit Wukong d'une minute et le nid qui ne se
laissait pas cliquer sont arrivés par là, pas par un scénario.

Ce qui reste vrai, et qu'il faut garder : le banc ne peut PAS voir une mise en page. Tout ce
qui touche au CSS se vérifie en jouant, et c'est le seul endroit du projet où ça se passe
comme ça.

**L'ascension ne donnait pas envie**, et la 2.20.0 attaque la moitié qu'on savait nommer : ses
récompenses étaient huit pourcentages, invisibles au moment précis où elles devraient
convaincre — le début du cycle suivant, avec un œuf et zéro pièce. L'ocellé et le martelé se
voient à la première seconde. Reste à jouer un cycle entier pour savoir si ça suffit.

**L'ascension donne envie de recommencer — question tranchée.** C'était la seule question du
projet qu'aucune mesure ne pouvait résoudre : elle demandait de jouer le cycle d'après, et la
réponse est venue en le jouant. La 2.20.0 avait attaqué la moitié qu'on savait nommer — des
récompenses qui se voient à la première seconde plutôt que huit pourcentages — et ça a suffi.

Ce que ça libère : **le second axe de prestige n'est plus bloqué.** Il était écarté au motif
qu'empiler un second prestige avant de savoir si le premier donne envie est la façon classique
dont un idle devient illisible. On sait maintenant. Ce n'est pas une raison de le faire, c'en
est une de pouvoir en parler.

**La mesure du rythme est périmée — et elle l'a toujours été.** Ce n'est pas un retard qu'on
rattrape, c'est l'état normal d'un chiffre d'équilibrage dans un jeu qui bouge : chaque version
qui touche à un prix la périme. La noter comme une dette permanente vaut mieux que la refaire
en croyant en avoir fini.

L'outil vit dans `tools/rythme.js` : `node tools/rythme.js 180` rend les trois premières heures.
Ce qu'il ne dira jamais : rien sur le plaisir. Il mesure un débit, pas un rythme ressenti — un
joueur qui s'ennuie et un joueur qui s'amuse produisent exactement la même courbe.

**Deux cibles sont posées, et elles ne le sont pas au hasard :**

- **L'œuf rare doit s'acheter vers trente millions**, et non vers ses trois cent mille. Le prix
  n'est pas la question — la question est à quelle FORTUNE le joueur franchit l'ère. Trois cent
  mille tombent trop tôt pour que le passage se sente, et l'ère commune n'a alors pas eu le
  temps de dire ce qu'elle avait à dire.
- **Le péage d'évolution des rares doit être FORT sans casser une partie chanceuse.** Une rare
  tirée à un sur mille dans un œuf commun ne doit pas se retrouver bloquée derrière un péage
  que le joueur ne peut pas payer avant des heures : elle occuperait un enclos sans rien
  rapporter, et le cadeau deviendrait une punition. C'est la même famille de faute que
  l'impasse sèche, sous une autre forme — **une bonne surprise ne doit jamais coûter plus
  qu'elle ne rapporte.**

Les deux se tiennent : si le passage à l'ère rare est reculé à trente millions, une rare
précoce arrive encore plus tôt par rapport à la courbe, et le second point devient plus aigu.
À traiter ensemble, jamais l'un sans l'autre.

Ce qu'il ne dira jamais : rien sur le plaisir. Il mesure un débit, pas un rythme ressenti — un
joueur qui s'ennuie et un joueur qui s'amuse produisent exactement la même courbe.

**Deux lignes du tableau de puissance du README sont hors d'atteinte.** Elles décrivent ce que
six cartes équipées rendraient, alors que l'album n'a que cinq emplacements. À retrancher.

**Les cinq questions du README** (« À vérifier en jouant ») restent ouvertes. Quatre se
répondront en jouant. La cinquième — la durée de la dernière tranche — coûtera plus cher après
le jalon 1 : tant que les nombres sont dans `game.js`, c'est une ligne ; en base de données
avec des parties en cours, c'est une migration.

### La note de conception

Le détail de l'album, de l'ascension et de la pension vit dans trois artifacts, qui portent
les tableaux, les formules et les arbitrages que ce document résume :

- **Album et ascension** — https://claude.ai/code/artifact/037135da-4a26-4745-b37d-fd0e8990d396
- **Pension, album, ascension** — https://claude.ai/code/artifact/d2577c90-6db3-41e6-b82d-611a0df96e3c
- **Ce qui manque à Éclosion** — https://claude.ai/code/artifact/5b0057d3-2083-44dc-933c-b9da51b648cd
