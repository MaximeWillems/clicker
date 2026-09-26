# Le changelog

Ce qui est sorti, version par version, et les chantiers livrés avec le raisonnement qui les a
portés. Le [plan](PLAN.md) ne dit que ce qui vient ; le [README](README.md) décrit le jeu tel
qu'il est.

    aujourd'hui : beta 5.10.1 · sauvegarde v38 · 13 lignées illustrées sur 42 · 5 œufs sur 5

**À chaque version**, une ligne en tête de la table des versions — en gras, et la précédente
perd le sien — et la ligne « aujourd'hui » ci-dessus. **À chaque chantier livré**, sa ligne
quitte « Ce qui vient ensuite », dans le plan, pour « Les chantiers livrés », ici, et son
analyse le suit.

## Les versions

| Version | Ce qu'elle apporte |
|---|---|
| **beta 5.10.1** | l'onglet de la pension cache les enclos : on compose les couples depuis la ferme. L'écran ne dit plus que la main fait la moitié d'une ponte — un clic de trop affiche « +0 s », et c'est tout |
| beta 5.10.0 | la **pension se clique** : elle prend son onglet, où un couple remplace la bête en scène et les couples remplacent les incubateurs. Un clic avance la ponte de la force du clic, sans jamais faire plus de la moitié d'une ponte — le temps fait le reste, et rester devant le nid va au mieux deux fois plus vite. La carte ocellée clique l'onglet ouvert |
| beta 5.9.2 | rien ne change en jeu : les **réglages de l'économie** quittent `game.js` pour `constantes.js`, rangés par thème — le barème des bêtes (valeurs, péages, multiplicateur de chaque rang, prix des œufs), la rente, la croissance, les places, les faveurs, les jetons, l'absence et la plonge. Les tables gardent leur forme dans `game.js` et lisent leurs nombres dans `constantes.js` ; quatre commentaires périmés par le barème unique sont corrigés au passage
| beta 5.9.1 | le marchand pose **plus de recettes et moins de change** : le poids de la recette dans le tirage d'une offre passe de 2 à 3, celui du change de 3 à 2 (cartes et paquets ne bougent pas)
| beta 5.9.0 | deux lignées de plus. **Le tréant**, rare, l'arbre qui marche — brindille, souche, tréant, tréant moussu, berger des forêts — : de bois comme Yggdrasil, il ne se croise qu'avec un autre tréant ou avec l'arbre-monde. **Cthulhu**, merveille, le dieu qui dort — idole de Cthulhu, rejeton des étoiles, Cthulhu, le dormeur de R'lyeh, Cthulhu qui ne dort plus — : un **kraken** et un **dragon ancien** confiés à la pension le donnent une fois sur cinquante, la tête de pieuvre et les ailes de Lovecraft. Dessins à venir, fiches prêtes (`prompts/treant.txt`, `prompts/cthulhu.txt`)
| beta 5.8.0 | **Yggdrasil, l'arbre-monde** — la huitième merveille, et la première lignée qui n'est pas un animal : graine de frêne, pousse de frêne, frêne sacré, Yggdrasil, Yggdrasil l'arbre-monde. Aucun œuf ne le donne ; deux **chevaux** confiés à la pension, oui, une fois sur cinquante — son nom est le cheval d'Ygg, l'un des noms d'Odin, et c'est la route de Wukong, une non-recette. **Le bois ne se croise qu'avec le bois**, comme la pierre : la pension le dit. Dessin à venir, sa fiche est prête (`prompts/yggdrasil.txt`)
| beta 5.7.0 | **un seul barème pour tous les œufs**. Un niveau coûte (niveau max de l'âge + n) clics — de 16 à 199, 11 010 pour une vie —, et **l'évolution ne donne plus de niveau** : une bête évoluée reste au 15 et paie 50 clics pour le 16. **La rare sert de modèle et chaque rang au-dessus vaut la rare × 25** : œufs à 18, 10 000, 250 000 et 6,25 M, chacun au prix du dernier péage de l'ère d'avant ; reventes un peu au-dessus de ce que la bête a coûté (−20 % vendue enfant, puis 5 à 9 %), péages payés en quinze à vingt-cinq ventes. **La taille devient une marche** qui repart de zéro à l'évolution et **ne se vend plus** : elle multiplie la poussière du saut, jusqu'à ×4,5 (la taille exigée du marchand disparaît). La marge mince a demandé **la rente à quatre heures**. Tout ce qui se paie en pièces est recalé — premiers prix inchangés, pentes adoucies, primes de 100 à 12,5 M, faveurs, paliers de jetons ×25 (premier saut à 15 625) —, et la sauvegarde v38 convertit une partie en cours sans lui retirer un palier. L'ouverture est deux à trois fois plus lente : à juger en jouant
| beta 5.6.2 | le change **argent → poussière bleue** ne coûte plus un montant fixe (dérisoire une fois riche) mais une **part de la bourse du joueur** au moment de la venue — un prix qui reste quelque chose qu’on a dû farmer, avec un plancher pour qu’une bourse vide ne l’offre pas |
| beta 5.6.1 | le **fond animé** des créatures est mis en veille (un interrupteur `FONDS_ACTIFS`) — il ne convainquait pas, on le retravaillera ; aucune bête neuve n’en reçoit, aucun ne s’affiche. Et l’**échelle des grands nombres** monte bien plus haut : de « Qid » (quintilliard, 10³³) jusqu’à « Dud » (duodécilliard, 10⁷⁵) |
| beta 5.6.0 | l’étal du marchand se remplit : en plus du changeur, il vend maintenant des **cartes**, des **paquets** et des **recettes**. Une carte tirée est une capsule neuve (jeune, une étoile, motif et teinte au hasard, 1 % chromatique) qui rejoint l’album ; un paquet en donne cinq, une rare+ garantie, et un paquet doré peut être un **god pack** (≈ 1/500, cinq cartes épique+, chromatisme doublé) ; une recette apprend un couple encore inconnu. La monnaie décide de la qualité — poussière **bleue** pour le tirage basique, **dorée** pour viser plus haut. Barèmes dans `constantes.js` |
| beta 5.5.2 | le marchand et l’éditeur de sauvegarde deviennent de **vraies pages pleines** (plus des popups) : la ferme s’efface, on ne regarde qu’elles. Le marchand a droit à une vraie mise en scène — héros doré 🧞 qui flotte, nappe ambrée, cartes d’échange soignées avec icônes. Et il **ne s’ouvre plus tout seul** : sa pastille clignote, on y va d’un clic. *(au passage : la vue Recettes, oubliée des règles plein écran, s’affiche enfin comme les autres)* |
| beta 5.5.1 | deux écrans du mode dev refaits : l’**étal du marchand** devient une page pleine, chaque échange une carte imagée (émojis 🧞 🪙 ✧ ❂, ce qu’on paie → ce qu’on gagne) ; l’**éditeur de sauvegarde** devient un écran à part, un champ par clé du `localStorage`, qu’on modifie, ajoute ou retire à la main |
| beta 5.5.0 | un **mode développeur**, ouvert par `?userType=Dev` dans l’URL : outils d’administration réservés, et droits retirés au joueur ordinaire. La vitesse ×10/×100 devient un outil de test (le joueur ne l’a plus) ; un bouton 🛠 ouvre un panneau pour créditer/récupérer des jetons d’ascension, faire venir ou renvoyer le marchand, et éditer à la main la sauvegarde du `localStorage` |
| beta 5.4.0 | **le marchand de sable** paraît — une pastille dorée à côté de la marque, avec un minuteur : il vient à l’heure réelle, ≈ 3,5 fois par jour, et son étal reste ouvert un quart d’heure (une venue ratée pendant qu’on ne joue pas est simplement manquée). Il pose trois offres, on n’en prend que deux, la troisième part avec lui. Première marchandise : le **changeur** de poussière (bleue → or ≈ 20 000:1, argent → bleue), montants tirés au sort à chaque venue. Cartes, paquets et recettes suivront avec les boosters |
| beta 5.3.5 | les constantes de réglage commencent à quitter `game.js` pour un fichier à elles, `constantes.js` — chargé avant le jeu, collé en tête par le banc d’essai. Première salve : la poussière de carte et le coût de fusion. Aucun changement de jeu, c’est de la mise en place ; le reste suivra petit à petit |
| beta 5.3.4 | les deux poussières (bleue ✧ et dorée ❂) se lisent en permanence en haut, à côté des pièces, dès qu’on en a — la forge, seul endroit qui les montrait, reste cachée tant que l’album est vide |
| beta 5.3.3 | les grands nombres s’affichent en milliers, nommés sur l’échelle longue : million, milliard, billion, billiard, trillion, trilliard… Chaque cran vaut mille fois le précédent (`Bd`, `Td`, `Qd` comblent les crans qui manquaient) |
| beta 5.3.2 | la pastille de combo n’affiche plus le plafond « / 100 » — juste le compte et le multiplicateur (`🔥 47 · ×1,34`). Le bonus reste, lui, accordé par la seule série de la constellation |
| beta 5.3.1 | la pastille de combo se voit **dès qu’on cliote**, comme le calme — avec son compteur et son multiplicateur. Elle ne paraissait qu’une fois la série de la constellation prise (sans elle le plafond vaut 1), si bien qu’on voyait le calme au repos mais jamais le combo à l’effort. Quand la série n’est pas prise, il affiche ×1 et l’infobulle dit où il se muscle |
| beta 5.3.0 | huit créatures de plus (dessins à venir) : **Tricératops** (rare), **Spinosaure** et **Vélociraptor** (épiques), **Tyrannosaure**, **Charybde**, **Scylla**, **Dragon ancien** (mythiques), et deux merveilles, **Dragon prismatique** et **Charybde et Scylla**. Le **Béhémoth** et l’**Ouroboros passent en merveille** — plus dans l’œuf mythique, on ne les rencontre qu’en pension. Chaque merveille a sa route : deux dinos → Béhémoth, deux dragons anciens → Prismatique, serpent + dragon ancien → Ouroboros, Charybde + Scylla → leur monstre. Ouroboros reste le parent de la Kitsune — une chaîne de fin de partie |
| beta 5.2.4 | une fois **toutes les primes prises**, le bouton du panneau devient une bascule **masquer / afficher** : trente-six cases achetées ne décident plus de rien, on peut les ranger. Le choix se retient et traverse l’ascension |
| beta 5.2.3 | la pension **plafonnée à une heure** de temps de base. Deux mythiques montaient à seize heures, la recette de la Kitsune à douze : un mur, pas un choix. Tout ce qui dépasse une heure y est ramené, les hâtes de la constellation descendent encore, et plus aucun couple n’est refusé « trop long ». Les recettes remontent à 2 % (l’accident reste à 0,1 %) pour rester la bonne route face au joker maintenant que tous couvent aussi vite. L’équilibrage de ce que la pension rend est à reprendre |
| beta 5.2.2 | le combo et le calme quittent la ligne des boosts pour une **pastille dans le coin de la scène** — « 🔥 47/100 · ×1,34 » ou « 🌙 calme ×1,5 », avec le compteur qu’on cherchait. Et la ligne des boosts se **dégonfle** : elle empilait une douzaine de « ×1,2 » sans contexte, dont l’effet était déjà dans le temps effectif de l’action ; il ne reste que ce temps, la rente, et ce qu’un clic vaut |
| beta 5.2.1 | trois réglages en vrac : une bête à fond est **gardée d’office** (comme un chromatique) ; l’**album ne s’affiche plus sans carte** (le saut ne le remplit plus, seuls les boosters le feront) ; et la faveur « L’œil neuf » disparaît — **plus aucune faveur ne buffe les chromatiques**, cette voie n’existe que dans la constellation |
| beta 5.2.0 | le carnet des recettes : réussir la ponte d’un couple à recette l’apprend, et une vue à elle rassemble les recettes acquises — les parents et les chances, toujours ; la créature au bout seulement si on l’a découverte. Il ne montre que l’acquis, jamais un total ni une case vide : on apprend le chemin, pas la récompense. C’est le préalable au marchand de sable |
| beta 5.1.1 | le fond des boîtes modales tient au défilement : les statistiques, plus hautes que l’écran une fois assez de compteurs, débordaient de leur fond et s’étalaient sur le voile sombre. La boîte défile désormais à l’intérieur, fond compris — même correctif pour la sauvegarde et le carrefour |
| beta 5.1.0 | la poussière dorée : un chromatique (un prodige) fondu ou défait au saut ne rend plus de poussière bleue en plus grande quantité, mais une ressource à part — la poussière **dorée**, dans l’ambre réservé aux prodiges. La forge montre les deux bassins. Elle n’a pas encore d’emploi : l’évier viendra avec les boosters |
| **beta 5.0.0** | la refonte de l’ascension : on ne choisit plus de bêtes à emporter, le saut ne fabrique plus de cartes. Son seul objet devient d’investir ses jetons dans la constellation, **et seulement à ce moment-là** — le reste du temps, elle se consulte. L’enclos entier se défait en poussière, le bouton sépare la réserve du gain du cycle (« 1 (+4) »), et l’axe du sang perd ses deux « bagage » avec le prix des cartes qu’ils adoucissaient. Les cartes viendront des boosters, à venir |
| beta 4.32.1 | la dernière barre de chaque âge disparaît : elle affichait « 15 / 15 » en annonçant un niveau 16, ne rapportait rien et ne servait qu’à mûrir. Les âges raccourcissent d’autant — un niveau dure toujours dix secondes à l’enfance — et l’équilibrage est à reprendre |
| beta 4.32.0 | la main tenue : chaque geste s’ouvre le jour où il sert — vendre quand la bête paie un œuf, la taille à la maturité, le bonheur après le premier rachat, évoluer quand le péage est payable, garder avec le premier automate. Et le voile ne cache plus le bouton qu’elle demande |
| beta 4.31.3 | les descriptions ne disent plus que ce qu’un achat fait — ni jugement, ni calcul, ni règle à lire. Le moyeu se tait, deux nœuds du sang changent de nom, et seul le tutoriel reste bavard |
| beta 4.31.2 | la chasse aux doublons : cent cinquante-deux lignes de test recopiées mot pour mot, une classe de carte déclarée deux fois avec des valeurs qui se contredisaient, la racine du dépôt calculée de quatre façons, et le nom d’un fichier de dessin fabriqué par deux chemins différents |
| beta 4.31.1 | la carte de détail flotte au-dessus du ciel au lieu de le rétrécir de dix-neuf rems — et la feuille de style, que rien ne relisait, perd une accolade orpheline qui dormait depuis la 2.0.0 |
| beta 4.31.0 | la constellation se découvre : une étoile dont le parent n’est pas pris ne montre que sa place et son lien. Et un clic ne l’achète plus — il ouvre une carte, à côté, qui dit ce qu’elle fait |
| beta 4.30.0 | le combo quitte le socle pour devenir une branche de la main : une première partie se joue à main nue, où une seconde de couvaison vaut un clic. Et la fourche se voit enfin dans le ciel |
| beta 4.29.0 | l’œuf commun coûte enfin les cinquante clics qu’il annonce : sa couvaison était écrite en secondes, vécue en clics, et le combo mangeait la différence |
| beta 4.28.4 | le compteur annonçait 45 clics pour un œuf qui en demandait 27, et baissait de deux par clic : il compte maintenant la série, terme à terme, et tombe d’exactement un par clic |
| beta 4.28.3 | le compteur « il reste n clics » tombait de 45 à 37 au premier clic : il comptait le combo que ce clic venait d’ouvrir |
| beta 4.28.2 | « effacer la partie » pose un état neuf AVANT d’effacer, et remet ce qui ne vit pas dans la sauvegarde — le geste devient une fonction, donc il se vérifie |
| beta 4.28.1 | un scénario compare l’état d’après-saut à une partie neuve, clé par clé : un champ oublié dans la recopie ressemble à du progrès |
| beta 4.28.0 | la pension quitte les primes et entre dans la constellation, dont l’axe s’ouvre en fourche : un tronc et deux branches, chacune son cadran |
| beta 4.27.0 | chaque évolution devient un mur, la merveille prend un cran de puissance au-dessus de la mythique, et garder ne vaut plus 740 fois vendre mais 2,3 |
| beta 4.26.0 | l’œuf mythique demandait dix-sept légendes épiques quand l’œuf épique en demandait douze mille cinq cents : l’ère la plus rare s’ouvrait avant la première ascension |
| beta 4.25.1 | la teinte tient sur toute la bête : le corps sortait bordeaux et le ventre kaki, parce que `sepia` écrêtait avant même la rotation |
| beta 4.25.0 | trente-deux couleurs choisies à la main : les 22,5° n’étaient qu’un quadrillage, et un écarlate qui n’est pas rouge n’est pas un écarlate |
| beta 4.24.1 | l’atelier redessine : un bloc retiré avait emporté la constante voisine, et la page ne posait plus une image. Un scénario exécute désormais le script de la page contre un DOM de fortune |
| beta 4.24.0 | le nom décrit enfin le pixel : `hue-rotate` TOURNAIT la couleur du dessin au lieu de la remplacer, donc l’écarlate d’un crapaud était verte. On efface avant de peindre, et l’angle est résolu pour tomber sur la teinte annoncée |
| beta 4.23.1 | les tons cessent de blanchir : le `clair` aplatissait 60 % d’un crapaud sur du blanc pur, et ses huit recettes rendaient huit fois la même bête |
| beta 4.23.0 | les quatre achromatiques cessent d’être de l’exposition : le blanc ne brûle plus la moitié du dessin, et blanc, perle, ardoise et onyx portent chacun sa teinte, la même sur toute lignée |
| beta 4.22.2 | les pages d’outil reprennent leur défilement — elles héritaient du cadre « application » de `style.css` et se coupaient au premier écran ; l’atelier gagne la bande des trente-six, une taille réglable et un fond au choix |
| beta 4.22.1 | la couleur des chromatiques n’est plus appliquée deux fois : le ton se dit dans la table, le halo dans le halo |
| beta 4.22.0 | l’atelier : une lignée dans toutes ses variantes, pour juger à l’œil ce qu’aucun scénario ne peut poser |
| beta 4.21.0 | trente-six couleurs : quatre gris hors de la roue, et seize recettes pour ce que la roue ne sait pas mélanger |
| beta 4.20.0 | l’enclos redevient une place qu’on arbitre : une gardée compte, une confiée non, et une place de plus coûte enfin quelque chose |
| beta 4.19.1 | le nid dit ce qu’un couple transmet — sans ça l’hérédité était invisible et personne ne composait un couple exprès |
| beta 4.19.0 | l’hérédité : un petit reçoit une distribution centrée sur le mélange de ses parents — couleur, caractère, motif, fond et statistiques |
| beta 4.18.1 | seize couleurs au lieu de huit : l’hérédité a besoin de place entre deux parents |
| beta 4.18.0 | une bête est grise ou chromatique : les teintes disparaissent, la couleur devient un événement et se place sur une roue |
| beta 4.17.2 | l’Araignée entre en jeu, cinq stades dessinés — la treizième lignée illustrée |
| beta 4.17.1 | le Béhémoth et l’Arachné ressortent : décrits en formes plutôt que dessinés, ils ne tenaient pas au regard |
| beta 4.16.0 | les stats de créature : quatre nombres tirés à l’éclosion, invisibles, qui décident de la qualité d’une carte |
| beta 4.15.0 | la pension monte dans la constellation : douze primes deviennent quatre crans, et la liste des primes cesse de finir en monoculture |
| beta 4.14.0 | la planche : chaque composant dans chaque état, contre le vrai `style.css` — la première des six marches de l’écran |
| beta 4.13.2 | une porte par règle : les quatre tables d’échelle ne se lisent plus qu’à deux endroits, et un scénario refuse la cinquième recopie |
| beta 4.13.1 | « elle ne rembourse jamais » était faux pour les quatre raretés payantes |
| beta 4.13.0 | l’idle et le combo : une minute sans clic met la ferme au calme, une série de clics monte en racine et tombe à quinze secondes |
| beta 4.12.3 | l’absence devient un petit bonus : bornée à deux heures, rendue au quart, et un onglet caché compte comme une absence |
| beta 4.12.2 | la montée en niveau passe du doigt à la machine : l’éleveur triple, le clic tombe au tiers sur la croissance seule |
| beta 4.12.1 | l’œuf rare passe à 55 M : la règle du multiplicateur n’a plus d’exception hors de l’ère commune |
| beta 4.12.0 | l’œuf épique vaut un billion : le multiplicateur d’une rareté se déduit de son prix, et une bête achetée est à l’équilibre à l’âge adulte |
| beta 4.11.5 | la rente passe à cinq minutes : une décision de garde se paie dans la séance |
| beta 4.11.4 | l’œuf de merveille entre dans la réserve comme les autres, et passe devant tout le reste |
| beta 4.11.3 | la réserve s’affiche dans l’ordre où elle se vide |
| beta 4.11.0 → 4.11.2 | le tri des œufs prend les options de l’enclos, range la bande et la file — arrivée ou rareté — et la réserve garde sa file |
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
| beta 4.0.0 | la constellation : le jeton devient une monnaie à deux éviers, et chaque carte emportée coûte plus que la précédente |
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

## Les chantiers livrés

Le détail version par version est [plus haut](#les-versions). Ce tableau
regroupe par chantier, parce que c'est ainsi qu'on s'en souvient.

**IL S'ÉTAIT ARRÊTÉ À LA `beta 1.10`**, c'est-à-dire trente-cinq versions plus tôt, et ce
n'était pas un oubli isolé : chaque version se notait au README, où la liste est plate et
chronologique, et personne ne remontait ensuite au chantier auquel elle appartenait. Une liste
plate dit ce qui a été fait ; elle ne dit pas ce qu'on a CHERCHÉ à faire, ni si on l'a obtenu.
C'est la seule chose que ce tableau-ci apporte, et c'est pour ça qu'il doit se tenir à jour :
sa dernière colonne est un jugement, et un jugement qu'on porte deux ans après ne vaut rien.

La règle est donc la même que pour le numéro de version — **on regroupe au moment du commit**,
dans la ligne du chantier en cours si elle existe, dans une ligne neuve sinon.

| Chantier | Versions | La question qu'il posait | Réponse |
|---|---|---|---|
| **Les cinq âges** | 1.0 → 1.4 | est-ce que la progression cesse de reculer ? | oui — plus rien ne redescend, par construction |
| **Les prix de moitié** | 1.5 | est-ce que la partie compressée se joue mieux ? | à mesurer encore |
| **L'album et l'ascension** | 2.0 → 2.5 | est-ce qu'on veut recommencer ? | jouée plusieurs fois ; la question de fond reste ouverte |
| **Les achats par lots** | 2.1 | est-ce que la fin de partie cesse d'être une paperasse ? | oui |
| **Les jetons de fortune** | 2.2, 2.9, 2.30 | est-ce que l'ascension se mérite ? | oui — mais les deux moitiés de la réponse d'alors sont tombées : chaque carte emportée coûte plus que la précédente depuis la `4.0.0`, et ce qu'on n'emploie pas reste en bourse |
| **Dix lignées rares** | 2.3 | est-ce que l'ère rare cesse de se répéter ? | oui sur le papier — six lignées sans dessin |
| **Le glisser-déposer des cartes** | 2.7 | est-ce que l'album se manipule ? | non vérifié : rien de visuel ne l'est |
| **L'ergonomie du clic** | 2.7.2 → 2.7.3 | est-ce que la barre espace se comporte ? | oui |
| **La charte « idole »** | 2.6, 2.7.1 | est-ce qu'une mythique impressionne ? | oui — validé sur l'Ouroboros |
| **Le mode histoire** | 2.8, 2.11 → 2.12, 4.32 | est-ce qu'on se sent accompagné ? | en partie : la main tenue ouvre chaque geste le jour où il sert, et la professeure ne retient plus sur un bouton éteint. Le reste, à voir en jouant |
| **Les trois axes** | 2.13, 4.32.1 | est-ce qu'on comprend ce qui monte ? | oui — âge, niveau, taille, chacun sa colonne. Et depuis la `4.32.1` le dernier niveau d'un âge tombe à la maturité : une barre entière affichait « 15 / 15 » en annonçant un niveau 16, et les âges ont raccourci d'autant — l'équilibrage est à reprendre |
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
| **Les merveilleuses** | 3.1 | est-ce qu'une merveilleuse se raconte ? | trois écrites — kitsune, wukong, tarasque — dont deux dessinées ; la réponse est dans le dessin, pas dans le code |
| **Le nid et la pause** | beta 1.0, 1.8 | confier une bête est-il un geste ? | oui — et la pause n'est plus nécessaire depuis qu'une bête confiée quitte la bande |
| **Le rang secret** | beta 1.0.1 | la cinquième rareté se découvre-t-elle, ou s'annonce-t-elle ? | elle se découvre : cinq fuites fermées, et la règle est portée par la table |
| **La production** | beta 1.7 | la pension peut-elle concurrencer l'acheteur ? | oui, du même ordre qu'un acheteur de milieu de partie — et toujours perdante en argent |
| **L'encyclopédie** | beta 1.9, 1.10 | la collection peut-elle dire autre chose que « combien m'en manque-t-il » ? | oui — une fiche par lignée, dans une vue à elle |
| **Les merveilles jouables** | beta 1.1 → 1.5 | une merveille peut-elle se viser plutôt que se rencontrer ? | oui — la chimère devient un joker, la tarasque n'a pas de recette, et `tools/pixel.js` sert les planches |
| **Le rabot de l'interface** | beta 1.11, 2.3, 2.4, 4.31.3 | un réglage se prend-il d'un coup d'œil ? | oui — seize menus deviennent des segments, et deux passages de rabot sur le texte. La `4.31.3` en passe un troisième et pose la règle : **une description dit ce qu'un achat fait, rien d'autre** — ni ce qu'il vaut, ni son calcul, ni sa règle, que le joueur trouve en jouant. Le tutoriel est le seul endroit où le texte a le droit d'expliquer |
| **Le chantier graphique** | beta 1.12 → 1.14, 2.4.1 | une carte, un œuf, une bête ressemblent-ils à quelque chose ? | oui — cadre et illustration, huit fonds animés, cinq coquilles, et le Kitsune ouvre les merveilleuses |
| **L'atelier de forge** | beta 2.0, 2.1 | trois cartes ratées peuvent-elles en faire une bonne ? | oui — et l'atelier se désigne carte par carte |
| **Les cases fixes** | beta 2.2, 2.5, 3.1.1 | peut-on viser une vignette pendant que le marchand vend ? | oui — l'enclos devient des cases, et le tri revient une seconde après |
| **Le mur de l'ascension** | beta 3.0, 3.1.0 | l'ascension peut-elle se rejouer ? | oui — les jetons se regagnent, et une bête menée au bout paie encore au clic |
| **La constellation** | beta 4.0 → 4.7 | le jeton peut-il être autre chose qu'une carte ? | oui — un arbre à six directions et vingt-cinq nœuds, une reprise à l'unité près, et les faveurs quand la liste se termine |
| **L'échelle des rangs** | beta 4.8, 4.9.0, 4.12.0 → 4.12.1 | une bête vaut-elle ce qu'elle coûte ? | oui, ET PAR UNE RÈGLE : `mult = prix de l'œuf / 2 200 000`, donc une bête achetée est exactement à l'équilibre une fois mûre à l'âge adulte. Plus d'exception hors de l'ère commune. **Renversée en `5.7.0`** par le barème unique : chaque rang payant est la rare × 25, et chaque âge laisse un peu de marge |
| **Le débit de la rente** | beta 4.9.1, 4.11.5 | une décision de garde se paie-t-elle dans la séance ? | oui — 3600 s, puis 1200, puis 300. Mais c'est le DÉBIT et non la règle : le chantier de la rente perpétuelle est plus bas, et ces deux réglages l'ont agrandi. Depuis la `5.7.0`, **quatre heures** : la marge du barème unique, plus mince, faisait rapporter à la garde cinq fois la vente |
| **Le tri des œufs** | beta 4.10 → 4.11.4 | la réserve se vide-t-elle dans l'ordre qu'on lit ? | oui — arrivée ou rareté, et la bande, la file et l'affichage sortent tous de la même fonction, merveille comprise |
| **Le doigt et la machine** | beta 4.12.2 | l'éleveur est-il le chemin normal, ou la consolation de celui qui s'absente ? | le chemin normal — il triple, et le clic tombe au tiers sur la croissance seule, sans toucher à l'ouverture |
| **Les stats de créature** | beta 4.16.0 | deux bêtes menées au même bout font-elles la même carte ? | non — quatre stats tirées à l'éclosion, de 0 à 25, gardées à vie. Elles sont le cinquième axe de la qualité d'une carte et prennent leur poids aux quatre autres : la moyenne ne bouge pas d'un centième, seule la variance est neuve. Invisibles pour l'instant, et ce sont celles que la tour de combat demandera |
| **L'enclos, une place qu'on arbitre** | beta 4.20.0 | garder une bête doit-il coûter quelque chose ? | oui. L'Étable sortait les gardées du compte : garder ne coûtait rien, donc on gardait tout, donc la place cessait d'être un arbitrage. Elle est retirée et remboursée. Une bête CONFIÉE, elle, libère son enclos — le prix de la pension passe d'une place à un débit. Et l'escalier des places monte de 1,6 à 2,1 : le 24e enclos se remboursait en trois secondes de rente |
| **L'hérédité** | beta 4.19.0, 4.19.1 | est-ce qu'on a envie de sélectionner ? | oui — un petit reçoit une DISTRIBUTION centrée sur le mélange de ses parents, pas une loterie parmi leurs traits. Intérieur et extérieur sont deux « proches » différents, et l'extérieur est le moteur de la sélection : c'est la seule branche qui dépasse les deux parents. Le nid annonce ce qu'un couple transmet, sans quoi rien de tout ça ne serait visible. Les fonds entrent à la pension du même coup, chantier en attente depuis la `1.13.0` |
| **L’escalier des ères** | beta 4.26.0 | combien de temps une rareté doit-elle durer ? | autant que la précédente. Le dernier barreau était sept cents fois plus court : l’œuf rare demandait 64 légendes communes, l’œuf épique 12 500 légendes rares, et l’œuf mythique **dix-sept** légendes épiques — l’ère la plus rare du jeu s’ouvrait le lendemain de la précédente, et avant la première ascension. Elle en demande maintenant 12 375, comme l’ère d’avant. Le prix brut ne disait rien : il faut lire un barreau en LÉGENDES DE L’ÈRE PRÉCÉDENTE, et c’est ce que le scénario mesure. Au passage, le commentaire qui annonçait un coefficient de 0,35 décrivait une règle que la table n’a jamais suivie. **Renversé en `5.7.0`** : l'œuf coûte moins d'une légende de l'ère d'avant, et c'est dans les péages que l'ère se paie |
| **Une seule couleur par bête** | beta 4.18.0, 4.18.1, 4.21.0, 4.22.1, 4.23.0, 4.23.1, 4.24.0, 4.25.0, 4.25.1 | la couleur est-elle un ornement ou un trophée ? | un trophée. Il y avait DEUX systèmes de couleur qui ne se parlaient pas — les teintes sur 47 % des bêtes, le prodige sur une sur huit mille — et une ligne de rendu tranchait déjà en silence. Les teintes disparaissent ; le chromatisme devient une couleur sur une ROUE, ce que l'hérédité exigeait. Prix assumé : les premières heures n'ont plus une bête colorée. Trente-six couleurs en `4.21.0` — la roue, quatre achromatiques sur une droite à part, et seize recettes qui définissent ce que la roue ne sait pas mélanger. La `4.22.1` répare le rendu : `PRODIGE_FILTER` commençait par le `TON_FILTRE.vif` de la table, mot pour mot, et `filtreDe` collait les deux bouts — toute teinte vive partait en `saturate(5,76)`, 76 % des pixels d’une bête butaient contre du blanc ou du magenta purs, et trois bruns différents ressortaient identiques. Deux endroits pour une même vérité, encore. La `4.23.0` refait les quatre achromatiques : ils n’étaient que de la saturation et de l’exposition, donc le blanc brûlait 43 % du dessin et la perle d’un kitsune n’était pas celle d’un wukong. Ils partent maintenant de `grayscale(1)` — donc du même gris sur toute lignée — et portent une teinte franche plutôt qu’un résidu. La `4.23.1` étend le même correctif aux trente-deux teintes : le ton `clair` blanchissait 60 % d’un crapaud, si bien que ses huit recettes claires rendaient huit fois la même grenouille blanche. **Reste ouvert :** `hue-rotate` TOURNE la teinte du dessin au lieu de la remplacer, donc le nom ment de 33° en moyenne et jusqu’à 86° sur le crocodile. Mesuré : effacer la teinte d’abord rend le nom exact mais réduit la bête à une silhouette monochrome, et le recalage par lignée échoue sur deux d’entre elles. La `4.24.0` tranche : on EFFACE la teinte du dessin avant de peindre, comme les gris depuis la `4.23.0`, et l’angle est RÉSOLU pour que la teinte obtenue soit celle qu’annonce le nom. Les deux rattrapages moins coûteux ont été mesurés et écartés : tourner de `cible − teinte du dessin` laisse 27° d’écart, et résoudre l’angle par lignée tasse la roue — cinq crans dans dix-huit degrés sur le crapaud. **Prix assumé :** la bête ne garde plus ses couleurs propres, elle prend une teinte et son modelé. Le chromatisme par ZONE rendra les deux à la fois. La `4.25.0` abandonne les 22,5° comme COULEUR : une couleur n’est pas qu’un angle, c’est aussi une clarté et une vivacité — l’or est clair, le grenat est sombre — et seize teintes posées mécaniquement sortaient toutes à la même clarté, donc timides. Les trente-deux portent désormais leur hexadécimal, choisi à la main ; `tools/couleurs.js` résout les quatre leviers qui y arrivent, et un scénario vérifie qu’ils ne dérivent pas. Le champ `hue` ne décrit plus une couleur : il reste l’identité du cran, dont l’hérédité et les recettes se servent. La `4.25.1` tient la teinte sur TOUTE la bête : `sepia(1)` multiplie le rouge par 1,351, donc au-dessus de 0,74 il écrêtait, et le corps sortait bordeaux pendant que le ventre partait en kaki — 67° d’écart. On descend sous le seuil avant de teinter. Le solveur pese maintenant trois choses d’un seul coût : la justesse, la dérive de teinte là où la couleur SE VOIT, et le modelé |
| **La pension monte dans la constellation** | beta 4.15.0 | la fin de partie peut-elle parler d'autre chose que de la pension ? | oui — ses douze primes occupaient les dix dernières marches de l'escalier ; l'axe la porte maintenant en quatre crans, chacun levant les quatre cadrans d'un coup. Le bâtiment reste une prime, donc elle s'ouvre toujours au premier cycle. **Renverse la `4.5.0`**, qui refusait qu'un pan de jeu quitte le cycle |
| **L'écran et le doigt** | beta 4.14.0, 4.22.0, 4.22.2 | peut-on voir ce qu'on change, avant de changer quoi que ce soit ? | la première marche sur six. La planche est posée ; les cinq autres sont du CSS et se jugent dessus. Le chantier reste OUVERT — 48 `:hover` pour 2 `:active`, zéro garde `@media (hover: hover)`, 30 informations qui n'existent que dans une infobulle. La `4.22.0` ajoute l’atelier, qui montre les DONNÉES là où la planche montre le BALISAGE ; la `4.22.2` répare les deux — elles citaient `style.css` et héritaient sans le savoir de sa mise en page « application », donc se coupaient au premier écran au-dessus de 62 rem de large. Le filet est désormais dans `tools/outil.css`, en un seul endroit, et un scénario le vérifie |
| **Une porte par règle** | beta 4.13.1, 4.13.2, 4.31.2 | une même faute peut-elle vivre à quatre endroits ? | plus maintenant. Choisir entre l'échelle des communes et celle des rangs était écrit à la main quatre fois, et faux quatre fois — jusqu'à annoncer « elle ne rembourse jamais » sur une bête payée un billion. Deux portes, et un scénario qui refuse la cinquième recopie. La `4.31.2` passe le même rabot sur tout le dépôt et trouve que la recopie coûte davantage quand elle est INVISIBLE : `tools/test.js` portait **cent cinquante-deux lignes écrites deux fois** — quatre scénarios et une aide — qui passaient deux fois et ne prouvaient rien de plus ; `.carte-etoiles` était déclarée deux fois dans `style.css` avec des valeurs contraires, si bien que ce qui s'affichait n'était écrit nulle part en entier ; la racine du dépôt se calculait de quatre façons, dont une qui dépendait du dossier d'où l'on tapait la commande ; et la règle qui fait un nom de fichier de dessin vivait dans `grilles.js` ET dans `prompt.js`, chacune avec sa copie de `sansAccents` et son commentaire. Trois fichiers neufs répondent chacun à une question — `tools/depot.js` où sont les fichiers, `tools/lignees.js` comment s'appelle un dessin, `tools/tests/_aides.js` ce que douze fichiers de scénarios refont — et les scénarios se rangent par sujet, un fichier chacun, parce qu'un titre de section dérive et qu'un nom de fichier non |
| **L'absence, l'idle et le combo** | beta 4.12.3, 4.13.0 | s'arrêter et s'acharner peuvent-ils tous deux valoir quelque chose, et revenir doit-il valoir plus qu'être resté ? | oui, et non. L'absence est bornée à deux heures rendues au quart — un onglet caché compris. Le calme pousse ce qui tourne, le combo pousse le clic, et les deux s'excluent par construction |
| **L'arche des dinosaures et des monstres** | beta 5.3.0 | le bestiaire peut-il grandir sans casser les rangs ? | oui, à données seules (dessins à venir). Huit lignées entrent — Tricératops (rare), Spinosaure et Vélociraptor (épiques), Tyrannosaure, Charybde, Scylla, Dragon ancien (mythiques), et deux merveilles neuves (Dragon prismatique, Charybde et Scylla) — et **Béhémoth et Ouroboros passent en merveille** : ils ne sortent plus de l'œuf mythique, on ne les rencontre qu'en pension. Chaque merveille a sa route logique (deux dinos → Béhémoth, deux dragons anciens → Prismatique, serpent + dragon ancien → Ouroboros, Charybde + Scylla → leur monstre à deux têtes). Ouroboros **reste** parent de la Kitsune : la faire devient une chaîne de fin de partie, assumée |
| **Le carnet des recettes** | beta 5.2.0 | sait-on par quoi passe une merveille, une fois qu'on en a fait une ? | oui, et sans casser le secret. Réussir la ponte d'un couple à recette APPREND la recette ; elle entre dans un carnet — une vue à elle, sœur de l'encyclopédie — qui ne montre QUE l'acquis, jamais un total ni une case vide. Chaque entrée dit les parents et les chances ; la créature au bout ne se montre que si on l'a découverte, sinon « Encore inconnue ». On apprend le chemin, pas la récompense. C'est le préalable autonome au marchand de sable, qui vendra plus tard une recette non encore faite (parents + chances visibles, bête masquée) |
| **La poussière dorée** | beta 5.1.0 | la couleur d'un chromatique laisse-t-elle une trace ? | oui, une ressource à elle. Un chromatique (un prodige) fondu ou défait au saut ne rend plus de poussière bleue en plus grande quantité, mais de la poussière **dorée** — un second bassin, à part, qui porte l'ambre réservé aux prodiges. La forge montre les deux. Elle n'a pas encore d'emploi : c'est la mise en place, l'évier viendra avec les boosters et le marchand de sable |
| **La refonte de l'ascension** | beta 5.0.0 | à quoi sert le saut, une fois qu'il ne fabrique plus de cartes ? | à investir. La sélection de créatures disparaît — on ne choisit plus quelles bêtes emporter — et le saut n'a plus qu'un objet : dépenser ses jetons dans la constellation, **et seulement à ce moment-là**. Le jeton passe de deux éviers à un ; l'axe du sang perd ses deux « bagage » (le prix des cartes emportées n'existe plus) ; l'enclos entier se défait en poussière ; et le bouton sépare la réserve du gain du cycle — « 1 (+4) ». Les cartes viendront des BOOSTERS, l'album se remplit désormais par là, pas par le saut. **Renverse** tout l'arbitrage « une carte de plus ou une étoile de plus » de la `4.0.0` : il n'y a plus de carte à mettre en balance. L'équilibrage de la constellation est donc à reprendre — un axe a rétréci |
| **Le marchand de sable** | beta 5.4.0, 5.6.0, 5.6.2, 5.9.1 | la poussière peut-elle avoir un rendez-vous plutôt qu'un robinet ? | oui, par construction : il vient à l'heure réelle ≈ 3,5 fois par jour, pose trois offres et n'en laisse prendre que deux. Le changeur d'abord (`5.4.0`), puis cartes, paquets et recettes (`5.6.0`) — les boosters remplissent l'album que le saut ne remplit plus depuis la `5.0.0`. La `5.6.2` fait payer le change argent → bleue en part de la bourse : un prix fixe devenait dérisoire une fois riche. Les barèmes restent à juger en jouant. La `5.9.1` pose plus de recettes et moins de change : poids 3 et 2 au lieu de 2 et 3 |
| **Le mode développeur** | beta 5.5.0 → 5.5.2 | peut-on tester le jeu sans donner les outils au joueur ? | oui — `?userType=Dev` ouvre la vitesse ×10/×100, les jetons, le marchand à la demande et l'éditeur de sauvegarde ; le joueur ordinaire perd la vitesse |
| **Le découpage en fichiers** | beta 5.3.5, 5.9.2 | un fichier de dix mille lignes peut-il redevenir lisible ? | commencé : `constantes.js` porte les réglages, chargé avant le jeu et collé en tête par le banc. Le reste suit zone par zone, jamais d'un bloc. La `5.9.2` y range toute l'économie — barème des bêtes, rente, croissance, places, faveurs, jetons, absence et plonge — : les tables gardent leur forme dans `game.js` et y lisent leurs nombres |
| **Le barème unique** | beta 5.7.0 | chaque œuf se joue-t-il de la même façon, à une autre échelle ? | oui, par construction. La rare sert de modèle et chaque rang au-dessus vaut la rare × 25, un pas qui sort de ses propres chiffres — son dernier péage divisé par son œuf. Chaque œuf coûte donc le dernier péage de l'ère d'avant, les marges sont les mêmes à tous les rangs payants, et un péage se paie en quinze à vingt-cinq ventes de l'âge qu'on quitte. Un niveau coûte (niveau max de l'âge + n) clics, l'évolution ne donne plus de niveau, et la taille devient une marche qui repart de zéro à l'évolution et ne se vend plus : elle multiplie la poussière du saut. La marge mince a demandé la rente à quatre heures. Tout ce qui se paie en pièces est recalé sur la correspondance des bêtes mûres, paliers de jetons compris (×25), et la sauvegarde v38 convertit une partie en cours sans lui retirer un palier. **Renverse** l'échelle des rangs, les murs de la `4.27.0` et l'escalier des ères. **Prix à juger en jouant** : la première heure est deux à trois fois plus longue, et une rare tombée d'un œuf commun décide du rythme de la partie |
| **Yggdrasil** | beta 5.8.0 | une merveille peut-elle ne pas être un animal ? | oui — un frêne, de la graine au monde, et la première forme du jeu qui soit un lieu. Ses parents devaient être une source ou un jardin, que la table n'a pas ; il prend la route de Wukong, une non-recette : deux chevaux, parce que son nom est le cheval d'Ygg. Le bois ne se croise qu'avec le bois, et `CORPS_SEULS` remplace le `if` de la pierre. Reste le dessin — le sujet le moins cher de tous, et sa fiche est prête |
| **Le tréant et Cthulhu** | beta 5.9.0 | le bestiaire peut-il grandir à la demande, sans casser une règle ? | oui — deux lignées de plus, demandées le 26 septembre. **Le tréant**, rare, l'arbre qui marche : de la brindille au berger des forêts, et de bois comme Yggdrasil, si bien qu'il ne se croise qu'avec un autre tréant ou avec l'arbre-monde. **Cthulhu**, merveille, le seul dieu du lot qui dort : de l'idole de pierre à l'éveil, par le kraken et le dragon ancien — la pieuvre et l'aile de Lovecraft. Leurs fiches de dessin sont prêtes ; le dragon ancien devient parent de trois merveilles, à surveiller |
| **Cliquer pour aider la pension** | beta 5.10.0 | la présence peut-elle servir là où elle ne sert à rien ? | oui, à moitié — et c'est voulu. La pension prend son onglet : un couple en scène à la place d'une bête, les couples dans la bande à la place des incubateurs. Un clic avance la ponte de la force du clic, mais la main ne fait jamais plus de la moitié d'une ponte : rester devant le nid va au mieux deux fois plus vite, et les merveilles, tirées par ponte, suivent sans s'emballer. La carte ocellée clique l'onglet ouvert |

## Les analyses des chantiers livrés

Elles restent parce qu'elles portent le raisonnement, et parce que plusieurs décisions ont été
renversées depuis : on ne comprend une règle du jeu qu'en sachant ce qu'elle a remplacé.

### Cliquer pour aider la pension — livré en beta 5.10.0

**La pension est le seul bâtiment où la présence ne sert à rien.** On y dépose deux bêtes, on
attend, on revient. Tout le reste du jeu répond au clic — l'œuf couve plus vite, la bête grandit,
et depuis la `3.1.0` la bête finie paie.

Le geste juste existe déjà ailleurs : **cliquer un œuf avance sa couvaison de `clickGain`
secondes.** Un couple a exactement la même forme — un `t` qui monte vers une `duree`. La règle
s'écrirait donc sans rien inventer : *un clic sur un couple avance sa ponte comme un clic sur un
œuf avance son éclosion.*

**Deux garde-fous, et le premier est déjà connu.**

- **La carte ocellée ne doit pas y toucher.** C'est la troisième fois que cette contrainte
  décide d'une mécanique — la plonge, la bête finie, et maintenant la pension. `mainDeCarte`
  existe pour ça.
- **Les chances de merveille sont PAR PONTE.** Accélérer les pontes accélère donc les
  merveilles dans la même proportion, et le jeu a déjà connu ce défaut sous une autre forme :
  la `beta 1.8.1` corrigeait un couple bloqué qui retirait sa recette à chaque tour — huit
  Wukong en une minute. Une pension qu'on peut cliquer en ×100 doit être mesurée au banc
  AVANT d'être écrite, pas après.

**« Rentrer dans » la pension pose une autre question** : elle vit aujourd'hui dans la colonne
de droite, celle qu'on a passé quatre versions à vider. En faire une vue à part entière — un
quatrième onglet après la ferme, l'encyclopédie et la forge — lui donnerait la place que le nid
à huit couples réclame déjà dans le tableau de route. Les deux chantiers se rejoignent.

**Livré en `beta 5.10.0`, tranché ainsi :**

- **Un onglet, qui garde la structure de la ferme.** La pension prend l'onglet qui suit la
  ferme : la scène montre un couple à la place d'une bête, la bande montre les couples à la
  place des incubateurs, et les enclos se cachent (`5.10.1`) : on compose les couples au nid
  depuis la ferme.
- **La main fait au plus la moitié d'une ponte** (`CLIC_PENSION`, dans `constantes.js`). Un
  clic vaut la force du clic, combo et frénésie comprises, comme sur un œuf ; sans plafond, un
  clic de fin de partie (400 s) bouclait une ponte d'une heure en neuf coups — une merveille
  toutes les deux minutes de clic au lieu d'une toutes les cinquante heures. Le plafond borne
  le gain à ×2, et la main repart de zéro à chaque ponte.
- **La carte ocellée clique l'onglet ouvert**, contrairement au garde-fou prévu plus haut : le
  couple sur la pension, la ferme partout ailleurs. Le plafond suffit à la tenir — elle ne
  peut pas faire plus que la main.
- **Le bonheur ne monte pas dans l'onglet de la pension** : il récompense une bête qu'on
  regarde, et un couple n'en est pas une.

### Yggdrasil, l'arbre-monde — la quatrième merveille — **livrée en `beta 5.8.0`**

> **Tranché et livré le 26 septembre 2026, sur la deuxième des trois sorties ci-dessous** : Yggdrasil
> n'a pas de parents, comme Sun Wukong. La non-recette est **cheval × cheval**, et c'est son nom
> qui la donne : « Yggdrasil », c'est le cheval d'Ygg, l'un des noms d'Odin — le dieu s'y est pendu
> neuf nuits, et les poètes appelaient le gibet le cheval du pendu. Deux chevaux ne font donc pas
> un cheval : ils font l'arbre qui en porte le nom. Deux épiques, comme les deux golems de Wukong,
> à 2 % comme toutes les recettes. **Le bois ne se croise qu'avec le bois**, la règle de la pierre
> étendue : un arbre ne fait pas de louveteaux. Ses cinq formes : graine de frêne, pousse de frêne,
> frêne sacré, Yggdrasil, Yggdrasil l'arbre-monde. Le dessin reste à faire ; sa fiche, sans visage
> ni membres, est dans `prompts/yggdrasil.txt`.

Trois merveilles existent : **kitsune**, **wukong**, **tarasque**. Yggdrasil serait la quatrième,
et elle apporte quelque chose qu'aucune des trente lignées n'a : **ce n'est pas un animal.**

**C'est un avantage, pas un problème, et il tombe pile où ça fait mal.** Le chantier qui barre
la route, c'est le dessin — dix-sept lignées manquent, et chacune demande cinq formes qui
doivent se ressembler ET se distinguer. Or *un arbre est le seul sujet dont les cinq âges se
lisent par la seule taille et la seule ramification* : graine, pousse, arbrisseau, arbre, monde.
Un crapaud qui devient légende doit changer d'anatomie sans changer d'espèce, ce qui est
difficile ; un arbre qui grandit ne fait que grandir. C'est la merveille la moins chère à
dessiner de toutes celles qui restent, et la seule dont l'arc de croissance EST le sujet.

**La recette.** Deux pistes, à trancher :

- **Béhémoth + tortue** — les deux bêtes qui portent un monde sur leur dos. C'est la lecture du
  jeu, et elle évite l'ouroboros qui sert déjà dans deux recettes sur trois.
- **Ouroboros + oiseau** — la lecture du mythe : le serpent qui ronge la racine, l'aigle au
  sommet. Plus juste, mais elle charge encore l'ouroboros.

**AUCUNE DES DEUX N'EST RETENUE, ET LA RAISON EST PLUS INTÉRESSANTE QUE LES DEUX PISTES.** Ce
qu'on veut pour parents, c'est une **fontaine de jouvence**, un **jardin**, une **source** —
des choses qui ne sont pas des bêtes, et qui n'existent pas dans la table.

C'est le même écart que l'arbre lui-même : Yggdrasil serait la première lignée qui n'est pas un
animal, et ses parents veulent l'être aussi. **Croiser deux bêtes pour obtenir un lieu ne se
raconte pas** — c'est là que les deux pistes ci-dessus coincent, et pas sur le choix des
espèces.

Trois façons d'en sortir, aucune tranchée :

- **Ouvrir une famille de lieux** — la source, le jardin, la montagne. C'est un pan de bestiaire
  neuf, donc cher, et il changerait ce que « lignée » veut dire.
- **Yggdrasil n'a pas de parents** — comme Sun Wukong, qui naît d'un œuf de pierre sans père ni
  mère. Le jeu sait déjà faire : `golem + golem` est une non-recette déguisée en recette.
- **Elle arrive sans qu'on la cherche**, comme la tarasque, qui n'a aucune recette et prend
  pour cette raison la moitié du sac secret.

La recette attend cette décision ; le dessin, lui, ne l'attend pas.

**Ce qu'il faut vérifier avant de l'écrire** : une merveille ne doit pas rendre un motif ou un
temperament illisible. Un arbre qui ne bouge pas dans l'enclos poserait la question de
l'animation du cinquième âge — déjà au plan — d'une façon différente : ce qui bouge chez un
arbre, ce sont les feuilles et la lumière, pas le corps.

### Un seul barème pour tous les œufs — **livré en `beta 5.7.0`**

> **Demandé le 21 septembre 2026, livré le 26.** Maxime voulait que tous les œufs suivent le même
> schéma d'achat, de revente et d'évolution, et l'avait chiffré sur la commune et la rare. « Si ça
> devient ingérable, on fera des adaptations. » La rare est devenue le modèle des rangs du dessus,
> les cinq questions sont tranchées plus bas, et deux réglages ont suivi — la rente et la taille —
> parce que la marge mince du barème les rendait faux.

Il y avait **deux échelles** : la commune avait la sienne (`VALUE`, `EVOLVE`), toutes les autres
raretés partageaient `VALEURS_RANG` et `PEAGES_RANG`, multipliées par `mult`. **Il en reste deux,
et c'est voulu** : la commune garde ses chiffres, parce que Maxime ne l'a pas chiffrée comme la
rare — elle est l'ère d'apprentissage, bénéficiaire dès l'enfance —, et `VALEURS_RANG` et
`PEAGES_RANG` sont désormais les chiffres de la rare elle-même, que `mult` porte aux rangs du
dessus. Ce qui est commun à tous, c'est le **schéma** : la même formule de clics, la même formule
d'engraissement, des reventes un peu au-dessus de ce que la bête a coûté, et des péages qui se
paient en ventes.

#### Les clics

**Monter du niveau n au niveau n + 1 coûte (niveau max de l'âge + n) clics**, comptés à force de
base : la Force du clic et l'éleveur les multiplient comme avant. Et **l'évolution ne fait plus
monter de niveau** : une commune évoluée reste au 15, et son passage au 16 coûte 35 + 15 = 50
clics — là où le jeu la posait directement au 16. Chaque âge après le premier y gagne une marche :
99 pas au lieu de 95.

| âge | niveaux | clics par pas | clics de l'âge | avant |
|---|---|---|---|---|
| enfant | 1 → 15 | 16 → 29 | 315 | 140 |
| adolescent | 15 → 35 | 50 → 69 | 1 190 | 171 |
| adulte | 35 → 65 | 100 → 129 | 3 435 | 870 |
| ancien | 65 → 85 | 150 → 169 | 3 190 | 3 420 |
| légende | 85 → 100 | 185 → 199 | 2 880 | 20 160 |
| **total** | | | **11 010** | **24 761** |

- **Seize clics au niveau 1, et non quinze.** Les exemples de Maxime en donnaient 15 au niveau 1
  et 28 au 14 ; la formule en donne 16 et 29. La formule est retenue : une règle qui se recopie
  sans exception vaut mieux qu'un exemple arrondi.
- **Les âges s'égalisent.** Chacun était bien plus long que le précédent, et la légende faisait
  81 % du trajet. L'adulte — trente niveaux — devient le plus long et la légende tombe à 26 %.
- **La rareté ne multiplie pas les clics** — voir les questions tranchées, plus bas.

#### L'engraissement

**Même logique** : passer d'un rang de taille au suivant coûte **(niveau × (s + 1) + 10 × s)
secondes d'engraissement**, avec s = 1 pour la taille normale → grande, jusqu'à 5 (titanesque →
démesurée).

| au niveau | → grande | → énorme | → colossale | → titanesque | → démesurée | en tout |
|---|---|---|---|---|---|---|
| 15 | 40 | 65 | 90 | 115 | 140 | 450 |
| 35 | 80 | 125 | 170 | 215 | 260 | 850 |
| 65 | 140 | 215 | 290 | 365 | 440 | 1 450 |
| 85 | 180 | 275 | 370 | 465 | 560 | 1 850 |
| 100 | 210 | 320 | 430 | 540 | 650 | 2 150 |

La taille devient une marche, comme le niveau : l'embonpoint continu, qui rapportait de moins en
moins (`OVER_GAIN`), a disparu. Une bête ne s'engraisse que mûre — son niveau ne bouge plus, donc
le prix d'un rang non plus — et **son rang repart de zéro à chaque évolution**. La taille à
l'écran, elle, ne redescend jamais : deux compteurs, `c.gras` pour le rang de l'âge en cours et
`c.over` pour tout ce que la bête a avalé en plus depuis sa naissance.

#### La revente et les péages

**Commune** — œuf à 18 :

| au bout de l'âge | revente | ce que la bête a coûté | gain | péage suivant | ventes pour le payer |
|---|---|---|---|---|---|
| niveau 15 | 30 | 18 | +12 | 100 | 9 |
| niveau 35 | 150 | 118 | +32 | 750 | 24 |
| niveau 65 | 1 000 | 868 | +132 | 2 500 | 19 |
| niveau 85 | 4 000 | 3 368 | +632 | 10 000 | 16 |
| niveau 100 | 15 000 | 13 368 | +1 632 | — | — |

**Rare** — œuf à 10 000 :

| au bout de l'âge | revente | ce que la bête a coûté | gain | péage suivant | ventes pour le payer |
|---|---|---|---|---|---|
| niveau 15 | 8 000 | 10 000 | −2 000 — ou +7 982, sortie d'un œuf commun | 30 000 | — |
| niveau 35 | 42 000 | 40 000 | +2 000 | 50 000 | 25 |
| niveau 65 | 95 000 | 90 000 | +5 000 | 75 000 | 15 |
| niveau 85 | 180 000 | 165 000 | +15 000 | 250 000 | 17 |
| niveau 100 | 450 000 | 415 000 | +35 000 | — | — |

**La règle qu'on en tire**, et que le code tient :

- à chaque bout d'âge, une bête se revend un peu plus que ce qu'elle a coûté — l'œuf et les
  péages payés. Seule exception : une bête payante vendue enfant, qui perd 20 % ;
- **un péage se paie en quinze à vingt-cinq ventes** de l'âge qu'on quitte — la toute première
  évolution commune en demande neuf ;
- la rare n'est pas la commune multipliée : ×267 à l'enfance, ×30 à la légende, et sa marge est
  plus mince — 5 à 9 % contre 12 à 67 %.

#### Les rangs du dessus : la rare × 25

**Chaque rang au-dessus de la rare vaut la rare × 25** — œuf, reventes et péages, d'un seul bloc.
**Vingt-cinq n'est pas choisi** : c'est le dernier péage de la rare divisé par son œuf,
250 000 / 10 000. Du coup **chaque œuf coûte exactement le dernier péage de l'ère d'avant**, et
c'était déjà vrai de l'œuf rare, qui vaut le dernier péage commun : au moment de payer pour mener
un ancien à la légende, on peut à la place ouvrir l'ère suivante, au même prix.

Les marges restent celles de la rare, à tous les rangs payants — c'est la règle « même marge pour
tous les rangs payants » que le code tenait déjà, et qu'un scénario garde. **Des marges plus minces
aux rangs hauts auraient aplati la vie de la bête** : avec 15 à 25 ventes par péage, une marge
divisée par deux fait valoir une légende quatre fois un adolescent, au lieu de onze.

**Revente au bout de chaque âge** (`mult` : rare 1, épique 25, mythique 625, merveilleuse 15 625)

| | œuf | enfant | ado | adulte | ancien | légende |
|---|---|---|---|---|---|---|
| rare | 10 000 | 8 000 | 42 000 | 95 000 | 180 000 | 450 000 |
| épique | 250 000 | 200 000 | 1,05 M | 2,375 M | 4,5 M | 11,25 M |
| mythique | 6,25 M | 5 M | 26,25 M | 59,375 M | 112,5 M | 281,25 M |
| merveille | — | 125 M | 656,25 M | 1,48 Md | 2,81 Md | 7,03 Md |

**Péages**

| | → ado | → adulte | → ancien | → légende |
|---|---|---|---|---|
| rare | 30 000 | 50 000 | 75 000 | 250 000 |
| épique | 750 000 | 1,25 M | 1,875 M | 6,25 M |
| mythique | 18,75 M | 31,25 M | 46,875 M | 156,25 M |
| merveille | 468,75 M | 781,25 M | 1,17 Md | 3,91 Md |

#### Les cinq questions, tranchées

1. **Le multiplicateur de rareté des clics et de l'engraissement vaut 1** : même nombre de clics
   pour toutes les raretés, comme avant. Une bête plus longue à élever est une bête qu'on a plus
   intérêt à garder qu'à vendre, puisque la rente ne dépend que de sa valeur : un doublement par
   rang faisait rapporter à la garde trente-six fois la vente chez les mythiques.
2. **Les barèmes épique, mythique et merveilleuse** : la rare × 25, × 625, × 15 625 — ci-dessus.
3. **La taille est une marche, repart de zéro à l'évolution, et ne se vend plus.** Elle multiplie la
   poussière qu'une bête laisse au saut, du ×1,3 de la grande au ×4,5 de la démesurée ; elle ne
   touche plus ni la revente ni la rente. La raison est chiffrée juste en dessous.
4. **Seize clics au niveau 1** : la formule, pas l'exemple.
5. **L'ère rare s'ouvre avec une seule légende commune : oui.** L'œuf ne fait plus le mur, les
   péages le font. L'œuf rare coûte moins qu'une légende commune ; mener la rare au bout demande
   415 000 pièces, le prix de 27,7 légendes communes (23 légendes rares pour une épique). On
   découvre l'ère tôt, on la joue plus tard — et une épique tombée par chance d'un œuf rare se
   revend vingt fois cet œuf dès l'enfance : une bonne surprise ne coûte jamais plus qu'elle ne
   rapporte.

#### Les deux réglages que la marge mince demandait

La marge au bout tombe de 52 % à 8–12 %, et deux réglages faits pour l'ancienne marge devenaient
faux.

- **La rente passe de deux à quatre heures.** Une bête gardée rendait sa valeur en deux heures,
  réglage calé sur une bête finie qui rapportait 52 % de ce qu'elle avait coûté. Avec la marge du
  barème, garder aurait rapporté cinq fois la vente au lieu de 2,3 — le joueur arrêtait de vendre,
  le défaut même que la `4.27.0` avait réglé. Quatre heures ramènent le rapport entre 2,3 et 2,7, à
  toutes les raretés.
- **La taille quitte les pièces.** Avec l'ancien ×4,5 sur la revente, engraisser une légende
  jusqu'à démesurée — 2 150 secondes d'engraissement — aurait rapporté de 165 à 230 fois plus par
  clic qu'élever la bête entière. À égalité, les cinq rangs n'auraient valu qu'environ 2 % en tout,
  c'est-à-dire rien. D'où la poussière au saut : on engraisse ce qu'on garde, avant de sauter. **La
  consigne « taille exigée » du marchand est partie avec**, puisqu'attendre qu'une bête grossisse
  avant de la vendre ne rapporte plus rien.

#### Ce qui a suivi : tout ce qui se paie en pièces

**Les pièces se sont tassées** — une légende merveilleuse vaut sept milliards, et non plus un
quadrillion — et tout ce qui était calé sur l'ancienne échelle l'a été de nouveau, sur une seule
règle : **la correspondance des bêtes mûres**. Un prix qui valait une commune adulte d'avant vaut
une commune adulte d'aujourd'hui, un prix de rare légende un prix de rare légende, et entre deux
bouts la conversion suit une pente régulière. Un script l'a appliquée ; les chiffres sont écrits en
dur dans `game.js`, pas convertis à la volée.

- **Les premiers prix ne bougent pas** — Force du clic 30, couveuse 120, éleveur 500, mangeoire
  1 000, incubateur 150, enclos 400 : l'enfance se paie toujours dix-huit et se revend trente, et
  l'ouverture se joue sur les mêmes pièces. **Les pentes sont recalées** pour qu'au bout de chaque
  ère on puisse s'offrir à peu près autant de niveaux qu'avant : 1,2 pour le clic, 1,26 pour la
  couveuse, 1,18 pour l'éleveur et la mangeoire, 1,3 pour les enclos et les incubateurs.
- **Les primes** vont de 100 (Soins attentifs) à 12,5 millions (Négoce mythique). **Chaque négoce
  vaut toujours deux œufs de sa rareté** — 20 000, 500 000 et 12,5 M —, si bien que le négoce
  épique quitte la fin de la liste pour le milieu. Les faveurs partent de 4 400 et montent de ×1,12.
- **Les paliers de jetons montent de ×25** et non plus de ×1 000 : le pas même qui sépare deux ères.
  Un cycle mené au bout de chaque ère rend 3, 5, 6, 7 et 8 jetons, contre 3, 4, 6, 7 et 9 avant. Le
  premier saut s'ouvre au quatrième palier, 15 625 pièces : à peu près la première légende commune.
- **La sauvegarde passe en v38.** Les bêtes gardent leur niveau — relu sur les anciennes barres,
  reposé sur les marches —, une bête mûre garde son rang de taille, et les pièces se convertissent
  sur la même correspondance : une bourse de rare légende reste une bourse de rare légende. Le prix
  payé pour un œuf suit son œuf. Les paliers franchis restent franchis, et la porte du saut reste
  ouverte à qui l'avait ouverte.

#### Ce que ça renverse

Quatre décisions déjà prises, réécrites dans la même version :

- **L'échelle des rangs** (`4.8.0` → `4.12.1`) : `mult = prix de l'œuf / 2 200 000`, une bête
  achetée pile à l'équilibre à l'âge adulte. Ici chaque âge laisse un peu de marge, et `mult` vaut
  ×25 d'un rang au suivant.
- **Les murs de la `4.27.0`** — un péage valait ×625, ×40, ×20, ×20 la revente de l'âge qu'on
  quitte. Il en vaut de 0,8 à 5 : le mur se compte en ventes, pas en multiple.
- **L'escalier des ères** (`4.26.0`) : un œuf valait 12 375 légendes de l'ère d'avant. L'œuf
  coûte maintenant moins qu'une seule légende, et le mur est dans les péages.
- **Le multiplicateur de valeur des rangs de taille** (×1,3 à ×4,5 sur la revente) : il porte
  désormais sur la poussière du saut.

Ce qu'il reste à juger en jouant, et les enclos qui se calent dessus, sont dans le
[plan](PLAN.md#le-barème-unique--ce-quil-reste-à-juger-en-jouant).

### La main tenue — **livrée en `beta 4.32.0`**

> **Livrée en entier**, avec les deux recommandations : le rachat retient, et le bonheur attend
> le premier rachat. En la posant, le vrai défaut de l'ancienne scène s'est montré : le voile
> éteignait aussi le bouton Vendre pendant qu'elle disait « vends-la », si bien que le seul
> geste possible était de cliquer la bête. Le scénario qui vérifiait la scène appelait `sell()`
> directement, et ne pouvait pas le voir.

**Le constat, mesuré au banc sur une partie neuve en mode histoire :**

- **À l'éclosion, Vendre, Évoluer et Garder arrivent ensemble.** Vendre tout de suite rapporte
  5 pièces, pour un œuf qui en coûte 18 : c'est l'impasse, dès la première minute.
- **Entre « Essaie » et la bête mûre, 120 clics sans une phrase**, et un bouton Vendre qui ne
  dit pas qu'il est trop tôt.
- **La bête mûre retient sur « vends-la, ou paie son péage — décide »**, mais le péage coûte 200
  et la bourse est vide : il n'y a rien à décider. Au banc, la première évolution devient
  possible à la 34ᵉ minute.
- **Évoluer reste affiché, éteint, pendant ces 34 minutes.** Garder ne protège de rien tant
  qu'aucun automate ne décide à ta place — le marchand, à 15 000 pièces.
- **La colonne taille s'affiche dès l'éclosion**, alors qu'une bête ne grossit qu'une fois mûre.

**La règle :** un geste n'apparaît que le jour où il sert, et c'est la professeure qui l'ouvre.
C'est le dévoilement de la boutique, étendu à la scène.

#### L'escalier

| | Ce qui s'ouvre | Quand | Ce qu'elle dit | Elle retient ? |
|---|---|---|---|---|
| 1 | le clic sur l'œuf | au départ | « Clique dessus » *(existe)* | oui |
| 2 | la bête et son niveau | à l'éclosion — 50 clics | « Elle grandit au clic. Essaie » *(existe)* | oui |
| 3 | **Vendre** | quand sa vente paie un œuf — niveau 12, 88 clics plus tard, 20 pièces | elle vaut un œuf : la vendre maintenant, ou la laisser monter | non, c'est un vrai choix |
| 4 | **la taille** | à la première maturité — niveau 15, 120 clics, 30 pièces | son niveau s'est bloqué, ce qu'elle mange part dans sa taille | « Vends-la », si rien n'est encore vendu |
| 5 | **racheter** | à la première vente | « Reprends-en un » *(existe)* | à trancher |
| 6 | **le bonheur** | après le premier rachat, à 30 s de présence | elle s'attache à qui reste ; puis le premier cadeau *(existe)* | non |
| 7 | **Évoluer**, et l'âge | une bête mûre et de quoi payer son péage — 34 min | « vends-la, ou fais-la évoluer : décide » — la réplique de la bête mûre, déplacée là où elle devient vraie | oui |
| 8 | **Garder** | au marchand automatique — 15 000 pièces | il vend tout ce qui est mûr ; ce que tu gardes, il n'y touche pas | non |

Les scènes des achats — force du clic, couveuse, incubateur, enclos — ne bougent pas : les prix
les ordonnent déjà, et elles s'intercalent entre ces marches comme aujourd'hui.

#### Comment ça s'écrit

- **Une table `GESTES`, sœur de `CLES_VOIR`** : une clé, une condition. `suivreTuto` la passe
  en revue, et `estDevoile('geste:vendre')` décide du bouton. Même mémoire, même règle : rien
  ne se recache, et le 📖 lève tout d'un coup.
- **Les conditions comptent ce qui a déjà été fait** — `stats.vendues`, `stats.evolutions`, une
  bête gardée. Une partie en cours retrouve donc tous ses boutons, sans toucher au format de
  sauvegarde.
- `renderBete`, `peindreAxes` et `peindreJoie` lisent la table au lieu de tout montrer.
- **Une phrase de scène ne nomme pas un geste fermé** : « tant que tu ne l'auras pas fait
  évoluer » attend la marche 7.
- **Le voile d'une réplique qui retient n'épargne que le sujet.** Retenir sur le rachat demande
  qu'il épargne aussi le bouton de l'œuf.

Côté scénarios : « trois passages obligés » devient cinq — quatre sans le rachat ; « l'interface
se déplie » gagne un geste par marche — absent avant, présent après, tout présent sans le mode
histoire ; et une vente au niveau 1 devient impossible en mode histoire.

#### Tranché

1. **Retenir sur le rachat ?** Oui. Vendue mûre, la bête rapporte 30 pièces — le
   prix exact de la Force du clic. L'acheter à la place de l'œuf vide la bourse, et c'est
   l'impasse.
2. **Le bonheur après le premier rachat, ou au premier cadeau ?** Après le rachat.
   Il arrive comme une marche, et non comme une surprise au milieu de la première bête.

### La constellation remaniée — **la mécanique est livrée en `beta 4.28.0`**

> **Livré en entier.** Le moyeu gratuit, la prime de pension retirée, l’axe de la pension
> ouvert en fourche et le compteur de branche (`beta 4.28.0`) ; la disposition en arbre et le
> combo devenu branche de la main (`beta 4.30.0`) ; les trois états et la carte de détail
> (`beta 4.31.0`). Restent les quatre axes encore en ligne droite — du sang, du négoce, de la
> couvée et de l’album — qui ne sont plus que de la table à écrire.

La devise : **plus pour moins.** Plus de nœuds, moins chers, et plus clairs. **Aucune branche
n'est exclusive** — on peut tout prendre, un jour. Ce qui rationne, c'est le jeton, donc le
temps, et rien d'autre : la décision n'est pas *quoi abandonner*, elle est *dans quel ordre*.

#### Ce qui est là aujourd'hui

Vingt-cinq nœuds, **372 jetons**, six axes de quatre nœuds en ligne droite plus l'étincelle.

Trois choses sont déjà en place et ne demandent rien :

- **`parent` décrit déjà un arbre.** Rien dans le modèle n'impose la ligne droite ; c'est le
  DESSIN qui l'impose, et lui seul.
- **`etoileOuverte(n)` porte déjà le prérequis.** Aujourd'hui un nœud fermé est *visible et
  verrouillé* ; le cacher est un filtre au dessin, pas une règle neuve.
- **Le motif de la branche existe déjà, et il tourne.** L'axe de la pension ne lit pas ses nœuds
  un par un : `rangPension()` COMPTE combien de ses quatre nœuds sont pris, et `cranPension`
  indexe une table avec ce nombre — `[1, 2, 4, 8, 9]` pour les places, `[1, 1.5, 4, 12, 18]` pour
  la vitesse. C'est exactement ce qu'une branche de crans demande, et c'est déjà écrit.

#### 1 · L'étincelle devient un point de départ

Elle coûte un jeton et porte une phrase. Elle ne coûte plus rien et n'en porte plus : **c'est le
moyeu, pas un achat.** Prix zéro, pas de `dit`, pas de carte au clic — on ne clique pas sur le
centre d'une roue.

**Ce que ça ouvre, et c'est le vrai effet :** les six premiers nœuds ont `parent: 'etincelle'`,
donc les six axes sont ouverts dès la première ascension. Le premier jeton devient un choix entre
six directions au lieu d'un péage à payer avant de choisir.

#### 2 · La prime de pension disparaît

`{ cle: 'pension', prix: 400 000 }` sort de `PRIMES`. `prime('pension')` est lu à **cinq
endroits** : le refus de couple, le compte de places, le nid ouvert, l'affichage du bâtiment et sa
phrase. Tous liront la constellation.

Le premier nœud de l'axe *pension* devient **la construction du bâtiment**. La pension cesse
d'être une prime qu'on achète au passage pour devenir une décision de cycle.

**Migration obligatoire.** Une partie qui a payé la prime doit recevoir le nœud, sinon elle perd
sa pension et ses couples en cours deviennent illisibles.

*Trouvé en passant :* cette prime déclare `glyphe: '🛖'` **deux fois** dans le même objet. Sans
effet, mais c'est une clé en double, et elle part avec.

#### 3 · Trois états, pour garder la profondeur en cachant le contenu

Demandé : un nœud est caché tant que le précédent n'est pas acheté. Pris au pied de la lettre,
ça contredit une doctrine écrite — *« un arbre qu'on voit entier d'un coup n'a pas de profondeur,
et ce qu'on vise à trente jetons doit être loin »*. Si tout ce qui est loin disparaît, l'arbre
paraît minuscule et on ne vise plus rien.

**La distinction est entre « voir qu'il y a quelque chose » et « savoir ce que c'est ».**

| état | ce qu'on voit | ce qu'on sait |
|---|---|---|
| **acquis** | l'étoile allumée, son nom | tout |
| **ouvert** — son parent est pris | l'étoile, son nom, son prix, sa carte au clic | tout |
| **deviné** — plus loin | un point sourd et le trait qui l'y relie | qu'il existe, et où il mène |

Dessiné, sur une branche de trois :

```
   ●━━━━━●━━━━━·━━━━━·
  acquis ouvert  devinés
         ↑ nommé, chiffré, achetable
                 ↑ un point et un trait : on voit qu'il y en a deux de plus,
                   et qu'ici la branche bifurque — sans savoir vers quoi
```

On garde l'horizon — on VOIT qu'il reste deux crans et qu'une fourche arrive — et on découvre CE
QUE C'EST en arrivant dessus. Avec des bifurcations ça compte double : la surprise n'est plus
« il y a quelque chose », elle devient « lequel des deux ».

#### 4 · Les bifurcations — la seule vraie difficulté

**Le blocage tient dans une fonction.** `cieuxXY` place un nœud ainsi :

```js
const i = PAR_AXE[n.axe].indexOf(n);          // son rang dans la LISTE de l'axe
const r = CIEL_VUE.rayon[Math.min(i, 4)];     // un rayon fixe par rang
```

La position vient de l'INDICE DANS LA LISTE, pas de la profondeur dans l'arbre. **Deux frères
tomberaient exactement au même point.** C'est là, et nulle part ailleurs, que se joue la
bifurcation. Deux règles la débloquent :

- **le rayon vient de la profondeur** — le nombre de `parent` à remonter jusqu'au moyeu ;
- **l'angle se partage entre frères** — chaque nœud reçoit un secteur, et le divise entre ses
  enfants. Le balancement de ±6° qui empêche aujourd'hui trois nœuds alignés de faire une règle
  devient inutile : l'arbre s'écarte tout seul.

**La forme, par axe :**

```
   tronc  ──●────●────●          trois augments DIFFÉRENTES, de plus en plus chères
              ├── ●──●──●        une branche : un effet, par crans
              └── ●──●──●        l'autre branche : un autre effet, par crans
```

Sur la couvée : le tronc donne trois choses distinctes, une branche monte la vitesse de couvaison
cran par cran, l'autre ajoute des emplacements.

**Neuf nœuds par axe × six axes + le moyeu = 55**, dont **54 payants**, contre 25.

#### 5 · La carte de détail

Le détail d'un nœud est aujourd'hui un `<title>` SVG — une infobulle. C'est l'une des *« trente
informations qui n'existent que dans une infobulle »* déjà comptées au chantier de l'écran : elle
ne s'ouvre pas au doigt, ne se lit pas à la voix, et ne peut pas porter de bouton.

Au clic, une **carte latérale** : nom, glyphe, phrase, effet chiffré, prix, bouton d'achat. Elle
reste ouverte pendant qu'on regarde l'arbre, donc on compare deux branches avant de choisir.

C'est aussi ce qui rend l'achat sûr : aujourd'hui un clic sur une étoile l'achète. Sans
exclusivité le risque est moindre — rien n'est perdu pour toujours — mais un clic qui dépense
sans montrer reste une faute, et le jeton est la monnaie la plus rare du jeu.

#### 6 · Ce qu'on convertit, et pourquoi

Douze nœuds sur vingt-cinq portent un champ `bonus` générique que `bonusCiel()` additionne seul.
Les treize autres sont câblés à la main. **La conversion suit la forme de l'arbre, et non
l'inverse :**

- **Un nœud de BRANCHE est un cran**, donc il ne se lit jamais seul : la branche compte ses nœuds
  pris et indexe une table. C'est `rangPension` généralisé — `rangBranche('couvee-vitesse')` — et
  ajouter un cran devient **une entrée de plus dans une table**, pas une ligne de code. C'est ce
  qui rend « plus de nœuds » presque gratuit.
- **Un nœud de TRONC est une chose distincte**, donc il garde son `bonus` quand la clé existe, ou
  son câblage quand il change une règle et non un nombre — le prix des cartes, le sommet de fortune, la
  poussière de l'album. Ceux-là ne se rangent dans aucune table, et il ne faut pas les y forcer.

Les quatre nœuds de pension sont déjà des crans : ils deviennent deux branches de trois en
partageant `cranPension` en deux compteurs, un par branche. Les tables `[1, 2, 4, 8, 9]` et
`[1, 1.5, 4, 12, 18]` se rallongent d'un cran chacune au lieu d'avancer ensemble.

#### « Plus pour moins » — la forme chiffrée

| | aujourd'hui | proposé |
|---|---|---|
| nœuds payants | 25 | **54** |
| coût total | 372 jetons | **≈ 234** |
| prix moyen | 14,9 | **4,3** |
| le plus cher | 30 | **10** |
| cycles pour tout prendre, au débit actuel | 54 | **34** |
| idem avec l'échelle de jetons ×10 | 31 | **20** |

Barème par axe : **tronc 3 / 6 / 10**, **branches 2 / 3 / 5** chacune — 39 par axe, 234 pour six.

Rien ne dépasse dix jetons. Un nœud se paie en un cycle, parfois deux, et l'arbre entier reste
l'affaire de plusieurs dizaines d'ascensions. **C'est la cadence qui change, pas l'horizon.**

Ce qu'il reste à trancher est dans le [plan](PLAN.md#la-constellation-remaniée--ce-quil-reste-à-trancher).

### Une mesure n'est pas un compteur — corrigé en `beta 4.6.1`

**La constellation imprimait des jetons, et le défaut est une confusion de nature.**
`acheterEtoile` remettait `asc.sommet` à zéro en croyant convertir le crédit du cycle en
bourse. Or `crediterJetons` tourne **dix fois par seconde** et relève le sommet sur
`state.coins` : le crédit revenait entier au tour suivant, EN PLUS de la bourse qui le
contenait déjà. Quatre jetons, un achat à un, et **sept jetons** un dixième de seconde plus
tard.

> `sommet` n'est pas une réserve, c'est une **mesure** — le plus haut que la bourse ait atteint
> ce cycle. Une mesure que la boucle refait ne peut pas servir de compteur : la mettre à zéro
> n'enlève rien, ça efface une observation que la boucle refera aussitôt.

Ce qu'on dépense se compte à part, dans `asc.depense`, soldé à l'ascension. **La règle vaut
au-delà d'ici** : partout où la boucle recalcule une valeur, cette valeur est en lecture seule
pour tout le reste du fichier.

**Les bourses gonflées dégonflent à la migration `v24`.** On ne peut pas recalculer la vérité —
les sommets des cycles passés ne sont pas gardés — donc on pose un plafond que rien de
légitime ne peut dépasser : `n ascensions × (11 paliers + les deux nœuds « sommet »)` moins le
prix des nœuds pris. Large exprès, et il ignore les cartes emportées qui l'abaisseraient
encore : personne ne perd un jeton gagné.

### Le mur de l'ascension — **abattu en `beta 3.0.0`**

> Les jetons se regagnent désormais à chaque cycle, sur le sommet de fortune atteint depuis la
> dernière ascension, et la porte n'est plus qu'un déblocage. Ce qui suit décrit le mur tel
> qu'il a été rencontré, et reste écrit parce qu'il explique la règle qui l'a remplacé.

**Constaté à mille milliards de pièces : plus de jeton, et le palier suivant à 10¹⁵.** Ce n'est
pas un défaut de code — c'est l'échelle qui fait ce qu'elle a été écrite pour faire — mais c'est
le point où la partie s'arrête, et personne n'y était encore monté.

Le mécanisme, en trois lignes :

- les paliers de fortune vont **de mille en mille** : 1, 10³, 10⁶, 10⁹, 10¹², … jusqu'à 10³⁰ ;
- chaque palier franchi crédite **un** jeton, une fois pour toutes dans la partie ;
- **ascensionner dépense tous les jetons en poche** — c'est voulu, chaque jeton est une carte
  qu'on emporte, et attendre trois jetons pour en emporter trois est la décision du système.

La conséquence n'avait pas été tirée : celui qui saute avec plusieurs jetons repart à zéro
jeton, et doit alors **multiplier sa fortune par mille** pour pouvoir sauter à nouveau. Entre
10¹² et 10¹⁵, avec une légende mythique chromatique à 5,6·10¹¹ l'unité, il faut de l'ordre de
**mille huit cents ventes maximales** — ou l'équivalent en rente. C'est un mur, pas une pente.

**Le chiffre était faux partout où il était écrit.** Le code et le README annonçaient « un
million à chaque cran » quand `JETON_PAS` vaut mille. Corrigé. Ça n'avait l'air de rien tant
que personne n'était monté assez haut : *un mur ne se voit qu'en le heurtant.*

#### La sortie retenue

Une quatrième, qui n'était dans aucune des trois envisagées : **le compte se refait à chaque
cycle**. Ce qu'on emporte n'est plus un crédit qu'on dépense mais une lecture du sommet de
fortune atteint depuis la dernière ascension. La porte, elle, devient un simple déblocage —
avoir atteint le million une fois.

Les deux problèmes tombent ensemble : on peut toujours sauter, et ce qu'on gagne à attendre
reste entier puisque le sommet monte avec le cycle. Ce qui disparaît, c'est la borne sur le
nombre d'ascensions — assumé : elle ne bornait pas la puissance de l'album, qui tient aux cinq
emplacements, mais le temps qu'il fallait pour l'atteindre.

À traiter avec la **rente** et l'**absence** : les trois décident ensemble de ce que vaut une
fin de partie, et la rente perpétuelle est précisément ce qui permet d'atteindre 10¹² sans
jamais rien décider.

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

### Le chantier graphique — **livré en beta 1.12.0, 1.13.0 et 1.14.0**

Trois demandes, et elles allaient ensemble : c'est **le même écran** qu'elles habillaient. Le
jeu a été construit en supposant que le dessin viendrait après ; il est venu pour dix lignées,
et tout le reste — cartes, œufs, fonds — n'était encore que de la typographie et des bordures.

Les trois sont tombées à la file, et dans cet ordre exprès : la carte d'abord parce que les
deux autres se posent dessus, le fond ensuite parce qu'il avait besoin d'une zone
d'illustration où tenir, l'œuf en dernier parce qu'il ne dépendait de rien.

Ce qui suit est la note d'intention d'origine, gardée telle quelle, avec ce que chacune est
devenue.

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

**Devenu la `beta 1.12.0`** : un cadre en 3/4, une zone d'illustration séparée du bas de carte,
une bande de rareté en haut. Fondre et fusionner ont disparu de l'écran d'ascension au
passage — on y choisit des bêtes, pas de la poussière.

#### Les fonds, animés

Les [fonds](#les-fonds--faits-en-beta-1130) étaient prévus comme une variante *visuelle et
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

**Devenu la `beta 1.13.0`**, et en CSS pur : cinq cartes plus la scène font six surfaces animées
à la fois, et six contextes 2D redessinés en boucle auraient coûté plus que tout le reste du jeu
réuni. Huit fonds, un sur huit cents, et **seulement dans les œufs de la boutique** — la pension
n'en donne aucun tant qu'elle ne sait pas les hériter.

#### Un dessin pour les œufs

Les cinq sortes d'œufs partagent le même glyphe 🥚 et se distinguent par leur nom et leur
couleur de bordure. C'est le seul objet du jeu qu'on regarde **pendant des minutes** — la
couvaison est une attente — et il n'a pas d'image.

Cinq dessins : commun, rare, épique, mythique, merveille. Ils profitent du même outillage que
les créatures (`tools/pixel.js`), et ils sont **le meilleur rapport travail/visibilité du
projet** : cinq images pour l'écran que tout le monde voit en premier.

**Devenu la `beta 1.14.0`.** Une décision s'est ajoutée en dessinant : les cinq se distinguent
par **deux signes et non un** — la couleur de la rareté, et un motif propre à chacun (taches,
bandes, losanges, couronne, spirale). Une forme se lit là où une couleur ne se lit pas, de loin
ou pour qui distingue mal le violet du bleu ; le second signe ne coûtait rien à dessiner.

Deux enseignements d'outillage en sont sortis :

- la silhouette est **calculée et non tapée**. Trente-deux lignes de trente-deux caractères
  écrites à la main se décalent d'un pixel sans qu'on le voie, et cinq fois de suite ce sont
  cinq œufs qui n'ont plus la même forme ;
- le générateur **reprend mot pour mot la règle des « cellules isolées »** de `vérifier` et les
  absorbe avant d'écrire. Corriger à la source ce qu'un contrôle sait nommer vaut mieux que
  chasser les pixels un par un — la quantification de l'ombrage en fabrique autant que les
  motifs. Reste la « dérive de style », signalée et voulue : le contrôle est écrit pour les cinq
  âges d'une lignée, or ces cinq stades sont cinq objets distincts.

### L'atelier de forge — **livré en beta 2.0.0**

La section suivante décrit la fusion telle qu'elle a été conçue en 2.30, et **elle a été
renversée**. Elle reste écrite parce qu'elle explique pourquoi le jeu a vécu vingt versions
avec une fusion qui ne fusionnait rien, et parce que l'erreur qu'elle contient est instructive.

**Ce qui n'allait pas : le mot mentait.** « Fusionner » désignait un bouton qui montait une
étoile contre de la monnaie. Rien ne disparaissait, rien ne se mariait. Une fusion, ce sont des
cartes **qui fusionnent** — elles entrent à trois et il en sort une.

**L'objection d'origine était mal posée**, et c'est elle qui avait fait naître la monnaie
seule : *« une fusion classique demande deux cartes identiques, or treize millions de
combinaisons — deux exemplaires identiques n'arriveront jamais »*. C'est exact, et ça ne
conclut rien. **Similaire n'est pas identique.** Il suffisait de choisir quels champs doivent
correspondre :

| Ce qui doit correspondre | Pourquoi |
|---|---|
| **la lignée** | elle décide du plafond de puissance |
| **le motif** | il décide de la famille de bonus |
| **le rang d'étoiles** | une trois-étoiles avalée par une fusion de une-étoile serait un gâchis invisible |

L'**âge n'en est pas** : il ne dit que la puissance, et la puissance se moyenne. C'est ce qui
rend la forge atteignable — sinon il faudrait trois bêtes menées au même âge, et l'atelier ne
s'ouvrirait qu'à qui joue déjà parfaitement.

**Trois entrent, une sort**, et ce compte décide de tout : neuf cartes d'une même lignée pour
une seule à trois étoiles. Deux rendait la troisième étoile presque gratuite ; quatre la
rendait inatteignable avant la dixième ascension.

**Ce que la carte hérite se moyenne** — âge, niveau, teinte, rang — et la teinte s'en trouve
diluée : albâtre plus deux ordinaires ne redonne pas albâtre. C'est ce qui fait de la forge une
décision. Le chromatique et le fond, qui n'ont que deux états, se décident à la majorité.

**La poussière ne bouge pas d'un chiffre**, et c'était la consigne. Elle aurait pu baisser
puisqu'une fusion coûte désormais trois cartes en plus ; elle ne l'a pas fait, parce que ce
qu'elle mesure n'a pas changé — c'est le prix de l'étoile, pas celui du mariage.

**Un atelier, en pleine page**, troisième vue après la ferme et l'encyclopédie. La raison est
la même que pour l'encyclopédie : sept cartes côte à côte n'entrent pas dans une colonne de
vingt et un rem. Il montre les trois cartes qui vont entrer, une flèche, et **la carte qui va
sortir avant qu'elle existe** — c'est la seule façon de rendre « la moyenne des trois » lisible
sans l'expliquer.

**Une carte équipée n'entre pas dans la forge**, exactement comme elle ne se fond pas : elle
s'évaporerait d'un emplacement et changerait le build en silence. La règle existait, elle n'a
eu qu'à s'étendre.

#### Le choix, en deux temps — **2.1.0**

La 2.0.0 prenait **les trois plus fortes** toute seule, au motif qu'une fusion doit rendre la
meilleure carte possible. C'était décider à la place du joueur ce qu'il perd, et une fusion
fait perdre : une teinte s'y dilue, une bête menée à l'âge légende ne se remplace pas en une
ascension. **Quelles trois cartes entrent est la seule vraie question de l'atelier**, et une
machine ne peut pas y répondre.

D'où le geste en deux temps : l'album entier, puis la grille qui **se réduit aux semblables**
de la carte désignée. C'est la réduction elle-même qui enseigne la règle du mariage — on ne lit
pas « même lignée, même motif », on voit quarante cartes devenir deux.

Trois décisions de détail sont tombées avec :

- **cliquer reprend ce qu'on vient de poser**, au même endroit où on l'a posé, et cliquer la
  carte de base annule tout ;
- **ce qu'on ne peut pas forger reste montré**, éteint et avec sa raison : cacher une carte
  qu'on possède ferait chercher ce qu'on a déjà ;
- **le choix ne se sauvegarde pas.** C'est un geste en cours, pas un état de partie : un joueur
  qui ferme l'onglet au milieu ne saurait plus, le lendemain, pourquoi il avait désigné ces
  cartes-là. Il se périme aussi tout seul si une carte est fondue, équipée ou emportée par une
  ascension pendant qu'elle est désignée.

---

### La fusion et la poussière de carte

> *Renversée en `beta 2.0.0`, gardée pour mémoire.* Le titre ne porte pas la mention : un
> intitulé qui bouge casse les liens qui pointent dessus, et celui du README l'était depuis.

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

### Les fonds — faits en `beta 1.13.0`

> **Cette section est la note d'avant.** Elle est gardée telle quelle parce qu'elle dit ce qui a
> été tranché et pourquoi ; ce qui a été construit vit dans le [README](README.md#les-fonds).
> Ce qui reste à faire tient en un mot : **l'hérédité**. La pension n'en donne aucun, exprès,
> jusqu'à ce qu'elle sache les transmettre.

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
