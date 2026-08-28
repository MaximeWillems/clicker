# Le plan

Ce document est la mémoire longue du projet : ce qu'on a décidé de construire, dans quel
ordre, et pourquoi. Le [README](README.md) décrit le jeu tel qu'il est aujourd'hui ; celui-ci
décrit la route.

Le plan a été posé le 18 août 2026, avant la première ligne de code. Il tient toujours, à un
écart près — le jalon 0 a été poussé bien plus loin que prévu.

## Les six jalons

Les estimations sont en **jours de travail concentré**, pas en jours calendaires.

| Jalon | Ce qu'il apporte | Estimation | État |
|---|---|---|---|
| **0** | Prototype de sensation : un fichier, tout en mémoire, aucun compte | 1–2 j | **livré, et dépassé** |
| **1** | La boucle réelle : comptes, base de données, serveur faisant autorité | 8–12 j | pas commencé |
| **2** | L'idle : incubateurs, calcul à la lecture, progression hors ligne | 4–6 j | fait côté navigateur |
| **3** | Les automatisations, une par une | 4–6 j | fait côté navigateur |
| **4** | Reproduction et gènes | 8–12 j | pas commencé |
| **5** | Marché entre joueurs | 10–15 j | pas commencé |

**Total : 35 à 55 jours**, plus 3 à 5 pour les évolutions ajoutées en cours de route au
jalon 1. À raison de quelques soirées par semaine, c'est un projet de plusieurs mois. La
plupart des projets de ce type meurent au jalon 4, quand la nouveauté est passée et qu'il
reste le gros du travail.

### Jalon 0 — le prototype de sensation

Un seul but : répondre à la question *est-ce que ces dix minutes-là sont agréables ?* Aucun
compte, aucune base, tout en mémoire. **Ce code est à jeter**, et ça se décide avant de
l'écrire, pas après.

### Jalon 1 — la boucle réelle

Comptes, base de données, les lignées, les stades, vendre, acheter des œufs, évoluer. Le
serveur fait autorité. C'est la fondation : le modèle de données ne se bâcle pas, il se
rattrape mal.

### Jalon 2 — l'idle

Incubateurs, calcul à la lecture, progression hors ligne. C'est ici que le jeu devient
vraiment un jeu idle, et que revenir le lendemain devient un plaisir.

### Jalon 3 — les automatisations

Nourrissage, vente, achat. Chacune est une amélioration achetable, et l'instant de l'achat
doit être un moment fort. À livrer **une par une, avec du temps entre** : tout sortir d'un
coup brûle la courbe de progression en une soirée.

La vente automatique n'est pas un interrupteur, c'est un **réglage de stratégie** — « vendre
tout ce qui est en dessous du palier 3, garder le reste ». Une automatisation qu'on configure
garde le joueur impliqué ; une automatisation qu'on allume le met dehors.

### Jalon 4 — la reproduction et les gènes

La vraie profondeur, et ce qui empêche le jeu de finir au jalon 3. Deux adultes donnent un œuf
dont les gènes mélangent ceux des parents. Une créature aux bons gènes vaut cent fois une
créature ordinaire de la même espèce — et c'est ce qui alimentera le marché : on n'échange pas
« un lézard », on échange *ce* lézard-là.

La partie chère n'est pas le code, c'est l'affichage : il faut des dessins en calques
(silhouette + couleur + motif) pour que les gènes se voient.

### Jalon 5 — le marché entre joueurs

Mise en vente, offres, échange tout-ou-rien, historique, modération. À faire quand il y a des
joueurs, pas avant.

C'est aussi le seul jalon où la triche devient un problème : les fermes de clics feront gonfler
les prix. La parade la moins coûteuse est de garder un acheteur automatique à prix fixe pour
les créatures ordinaires, et de réserver le marché aux créatures uniques — celles dont les
gènes ne se fabriquent pas à la chaîne.

## Les décisions structurantes

Elles ont été prises une fois, elles engagent tout le reste.

**Le serveur ne fait jamais tourner de boucle.** On stocke une date de début sur chaque chose
en cours, et on calcule ce qui s'est passé quand le joueur revient. Rien ne tourne tant que
personne ne regarde, et la progression hors ligne est gratuite : c'est le même code.

**Le hasard est tiré à l'avance.** Conséquence directe de la règle précédente : quand un œuf
est mis en couvaison, on tire immédiatement ce qui en sortira (lignée, variantes) et on le
range, caché. Le joueur ne le découvre qu'à l'éclosion. Sans ça, huit heures d'absence sont
incalculables.

**Le même calcul tourne à deux endroits** — sur le serveur pour la vérité, dans le navigateur
pour que les nombres montent joliment. Écrit deux fois dans deux langages, il divergera et
coûtera des mois de bugs d'affichage. C'est le seul vrai argument technique du projet, et il
pousse vers un module de calcul partagé entre les deux.

**Un œuf et une créature sont la même ligne** à des stades différents. Sinon toute la logique
se duplique.

**Un seul dessin par forme**, agrandi au fil de la croissance. C'est l'évolution qui change
l'image, jamais la croissance — autrement le nombre d'illustrations est multiplié par quatre
et le projet meurt là.

**Tous les nombres d'équilibrage vivent au même endroit**, jamais en dur dans le code. Ils
seront retouchés cinquante fois.

## Ce qui coûte plus cher qu'on croit

**Les dessins.** 21 lignées × 5 formes = 105 illustrations, avant même les gènes. Le style
devait être simple et lisible dès le départ — aplats de couleur, formes rondes.

**La sensation du clic.** Un jeu de clic dont le clic n'est pas jouissif est mort, quels que
soient les systèmes derrière. C'est le meilleur rapport effort/résultat de tout le projet, et
il ne se remet pas à la fin.

**L'équilibrage.** Il prendra plus de temps que les automatisations.

## Où on en est

Le jalon 0 est livré en **alpha 1.4.0**, et il déborde largement de son cadre : 21 lignées au
lieu de 5, une vie de cent niveaux en cinq âges, les variantes, quatre raretés, sept
améliorations, la rente, la collection. Une partie des jalons 2 et 3 est donc déjà jouable —
mais **entièrement dans le navigateur**, dans un fichier qu'on a décidé de jeter.

**10 lignées sur 21 sont illustrées** : crabe, chiroptère, crapaud, crocodile, escargot,
insecte, lézard, oiseau, poisson, rongeur. Les autres restent en emoji, et c'est assumé — un
dessin manquant ne casse rien.

Deux écarts avec le plan d'origine, tous les deux volontaires :

- **Les cinq paliers sont devenus cent niveaux en cinq âges.** L'évolution n'est plus une
  transition, c'est un **péage** : arrivée au dernier niveau de son âge la bête se bloque, et
  seul le paiement la débloque. La décision « je vends ou je paie » revient donc cinq fois par
  bête au lieu d'une.
- **Rien ne se nourrit contre des pièces.** Une bête grandit au clic et au temps, jamais à
  l'argent.

## Ce qui vient ensuite

Le jalon 0 a répondu à sa question. Ce qui reste à trancher n'est pas quoi construire, mais
quand arrêter d'ajouter au prototype :

1. **Finir les 11 lignées sans dessin**, ou s'arrêter là et passer au serveur. Chaque lignée
   illustrée rend le prototype plus agréable et le code à jeter plus lourd à jeter.
2. **Choisir la pile technique du jalon 1**, avec la contrainte du calcul partagé en tête.
3. **Reprendre les questions du README** (« À vérifier en jouant ») avant de figer
   l'équilibrage dans une base de données.
