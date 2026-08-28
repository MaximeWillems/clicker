# Le plan

Ce document est la mémoire longue du projet : ce qu'on a décidé de construire, dans quel
ordre, et pourquoi. Le [README](README.md) décrit le jeu tel qu'il est aujourd'hui ; celui-ci
décrit la route.

Deux plans se superposent, et il faut les lire ensemble. Le **plan des jalons** a été posé le
18 août 2026, avant la première ligne de code : il dit ce que le jeu sera. Le **plan de
versions** a été écrit après coup, quand le prototype a débordé de son cadre : il dit ce qui
tombe dans quel ordre, et c'est celui qu'on suit au jour le jour.

    aujourd'hui : alpha 2.1.0 · sauvegarde v7 · 10 lignées illustrées sur 21

---

## Le plan de versions — ce qu'on fait maintenant

Le numéro suit la règle écrite en haut de `game.js` : majeur pour un morceau de jeu qui
n'existait pas, mineur pour une nouveauté qui tient dans le jeu tel qu'il est, correctif pour
le reste. Chaque version répond à une question, et c'est la question qui décide si elle est
réussie.

| Ver. | Ce qui tombe | Sauv. | La question qu'elle pose au joueur |
|---|---|---|---|
| 1.0 → 1.4 | Les cinq âges, les tiers de palier, les consignes par rareté | 3 → 6 | est-ce que la progression cesse de reculer ? |
| **1.5** ✓ | Les prix — les œufs payants divisés par deux | 6 | est-ce que la partie compressée se joue mieux ? |
| **2.0** ✓ | L'album et l'ascension — capsules, motifs, emplacements, jalons, reset | 7 | est-ce qu'on veut recommencer ? |
| **2.0.1 → 2.0.6** ✓ | Les âges renommés, l'écran d'ascension réparé, le marchand sans exception, le crabe, le chromatique à 1/8192 | 7 | — |
| **2.1** ✓ | Les achats par lots — ×1, ×10, ×100, max | 7 | est-ce que la fin de partie cesse d'être une paperasse ? |
| **2.2** | La fusion — les paliers, et le repère sur les capsules | 7 | est-ce que les doublons valent d'être gardés ? |
| **2.3** | Les automates par âge — l'éleveur aux jeunes, la mangeoire aux grandes bêtes | 7 | est-ce que l'ordre des achats suit la vie de la bête ? |
| **3.0** | La pension, socle — emplacements, deux parents, une durée, un œuf, rente suspendue | 8 | est-ce que parquer deux bêtes est un sacrifice qui se sent ? |
| **3.1** | La compatibilité — étiquettes, stérilité, durée par distance | 8 | est-ce que la règle se devine sans wiki ? |
| **3.2** | L'hérédité — les quatre issues, les fusions, les teintes exclusives | 8 | est-ce qu'on a envie de sélectionner ? |
| **3.3** | La rareté de l'enfant — le tirage entre parents, la montée par âge | 8 | est-ce que la montée reste un cadeau et non une voie ? |
| **3.4** | Les merveilleuses — la rareté, les recettes, trois lignées dessinées | 8 | est-ce qu'une merveilleuse se raconte ? |

L'ordre a été **inversé en cours de route** : la pension devait venir avant l'album, elle
passe après. L'album est la clé de voûte vers laquelle les deux autres chantiers pointent, et
le construire d'abord leur donne un endroit où atterrir. Le prix de l'inversion est connu et
accepté : l'album est sorti sans son cran le plus haut, la merveilleuse ne s'obtenant qu'en
pension.

### Ce qui se livre en petit paquet

**2.2, la fusion** est presque gratuite : le champ `palier` existe déjà sur chaque capsule et
la table `PALIERS` est écrite. Une question y reste ouverte — est-ce que le palier 4
transforme un cadran en *règle* (+1 enclos, +1 clic automatique) plutôt qu'en plus gros
pourcentage ? Une règle se raconte, un pourcentage s'oublie.

**3.0, le socle de la pension, est l'atome** : emplacements, parents, durée, œuf et rente
suspendue tombent ensemble ou ne tombent pas. Retirer n'importe lequel des cinq laisse un jeu
incohérent — une pension sans rente suspendue est gratuite, une pension sans plafond de
réserve déborde à la première absence.

### Le chantier parallèle : les dessins

**11 lignées sur 21 n'ont pas de dessin** — loup, méduse, salamandre, serpent, kraken, golem,
sphinx, cheval, chimère, béhémoth, ouroboros. Ce n'est pas une version, c'est une voie de fond
qui avance entre les autres. Rien n'en dépend, tout en bénéficie.

C'est aussi **la seule partie du prototype qui ne sera pas jetée** : `game.js` partira à la
poubelle au jalon 1, les PNG resteront tels quels dans le vrai jeu. Chaque heure passée là est
acquise, contrairement à tout le reste.

Le crabe a servi de leçon : ses cinq dessins ont dormi cinq jours dans `art/` sans être
branchés dans la table `ART`, et la lignée s'affichait en emoji alors qu'elle était prête.
Poser les fichiers ne suffit pas.

### Deux pièges de migration à ne pas oublier

Les nouvelles teintes s'ajoutent **à la fin** de `TINTS`. Une bête stocke sa teinte par
indice ; en insérer une au milieu repeindrait tout le bestiaire déjà éclos.

La réserve d'œufs doit prendre son plafond **avant** la pension, pas après. C'est le seul
frein du hors-ligne, et une partie qui tourne déjà sans lui rentrera sur cinquante œufs le
jour où on l'ajoutera.

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

Le jalon 0 est livré en **alpha 2.1.0**, et il déborde largement de son cadre : 21 lignées au
lieu de 5, une vie de cent niveaux en cinq âges, les variantes, quatre raretés, huit
améliorations, la rente, la collection, l'album et l'ascension. Une partie des jalons 2 et 3
est donc jouable — mais **entièrement dans le navigateur**.

Trois écarts avec le plan d'origine, tous volontaires :

- **Les cinq paliers sont devenus cent niveaux en cinq âges.** L'évolution n'est plus une
  transition, c'est un **péage** : arrivée au dernier niveau de son âge la bête se bloque, et
  seul le paiement la débloque. La décision « je vends ou je paie » revient cinq fois par bête
  au lieu d'une.
- **Rien ne se nourrit contre des pièces.** Une bête grandit au clic et au temps.
- **L'album et l'ascension sont arrivés avant la pension**, alors qu'ils étaient prévus après.

### Les dettes

**La mesure du rythme est périmée.** « Ère rare à 3 h 34 » date d'avant la baisse des prix de
la 1.5. Elle ne se déduit pas d'une division par deux — le revenu n'est pas constant sur trois
heures et demie — et elle demande une nouvelle simulation. C'est elle qui dira si la première
ascension tombe bien vers deux heures de jeu, comme prévu.

**Le rendu visuel de l'album et de l'écran d'ascension n'a jamais été regardé.** Le CSS est
neuf et n'a été vérifié que par la lecture.

**Les cinq questions du README** (« À vérifier en jouant ») restent ouvertes. Quatre se
répondront en jouant. La cinquième — la durée de la dernière tranche — coûtera plus cher après
le jalon 1 : tant que les nombres sont dans `game.js`, c'est une ligne ; en base de données
avec des parties en cours, c'est une migration.

### La note de conception

Le détail de l'album, de l'ascension et de la pension vit dans deux artifacts, qui portent les
tableaux, les formules et les arbitrages que ce document résume :

- **Album et ascension** — https://claude.ai/code/artifact/037135da-4a26-4745-b37d-fd0e8990d396
- **Pension, album, ascension** — https://claude.ai/code/artifact/d2577c90-6db3-41e6-b82d-611a0df96e3c
