# Ouvrir une séance de génération

Ce fichier n'est pas un prompt d'image : c'est le message qui **ouvre une conversation**
dédiée à la génération des planches. Les prompts d'image, eux, sont dans
`prompts/<lignée>.txt` et sont produits par `node tools/prompt.js`.

À copier tel quel dans une nouvelle conversation, avec **une illustration déjà validée en
pièce jointe** — `art/crabe-2-crabe.png` fait très bien l'affaire. Le style se montre mieux
qu'il ne se décrit.

Le bloc ci-dessous couvre les six lignées rares ajoutées en alpha 2.3.0. Pour les épiques et
les mythiques plus tard, on remplace la section « Les six lignées » par la sortie de
`node tools/prompt.js <clé>` et on garde tout le reste.

---

Tu m'aides à produire six planches de sprites en pixel art pour un jeu d'élevage de
créatures. Dix lignées sont déjà dessinées et validées : elles donnent le style, et ces six
doivent s'y fondre sans qu'on voie la couture. L'image jointe en est un exemple.

## Comment on travaille

Une planche à la fois, dans l'ordre que je donne. Pour chacune : tu me proposes le prompt
final, je le passe au générateur, je te montre le résultat, tu me dis ce qui cloche au regard
des règles ci-dessous, et on recommence jusqu'à ce que ça passe. **Tu ne passes à la lignée
suivante que quand j'ai validé la précédente** — le style dérive d'une séance à l'autre, et
c'est précisément ce qu'on essaie d'éviter en les faisant toutes d'affilée.

Commence par la tortue, puis le papillon : ce sont les deux silhouettes les plus éloignées de
ce qui existe, donc celles qui diront le plus vite si le style tient sur des formes nouvelles.

## Le format

Une seule image par lignée : les **cinq stades côte à côte sur une rangée**, régulièrement
espacés, fond transparent, chaque créature de face, centrée, corps entier. Pas d'ombre, pas de
ligne de sol, pas de cadre, pas de texte. Les cinq stades doivent occuper des hauteurs
croissantes — c'est une bête qui grandit.

## La charte, qui ne change jamais

    TRUE 32x32 pixel art, upscaled with nearest-neighbor only. Readable at 24 pixels tall.

    CUTE MASCOT STYLE — this is the most important instruction:
    - baby proportions: the head is at least half the whole creature
    - huge round eyes, set low and wide apart, each about one third of the face width,
      with one single white highlight dot
    - tiny simple smiling mouth, never a wide slit, never fangs
    - small pink blush oval on each cheek
    - everything rounded and soft, no sharp angles, no spikes, no horns, no talons
    - chubby bean-shaped or egg-shaped bodies, tiny stubby feet
    - friendly, sleepy, harmless expression on every stage

    STRICT: maximum 6 flat colors per creature including the outline.
    No texture, no dithering, no noise, no gradients, no glow. Simple geometric shapes.

## Les trois règles qui font rater une planche

**1. Les cinq stades sont UNE bête qui grandit, pas cinq bêtes.** Même palette, même couleur
de contour, même forme d'œil du premier au dernier. Ce qu'un stade gagne, tous les suivants le
gardent et l'agrandissent. Un stade n'ajoute jamais qu'il ne retire. On doit pouvoir montrer
du doigt, sur le stade 5, ce qu'il a gardé du stade 1.

**2. Ce qui distingue une créature est sa silhouette, pas son décor.** Cinq bêtes qui ne
diffèrent que par leurs motifs se ressemblent toutes, quelle que soit la qualité du dessin.
C'est la masse et la posture qui changent — une crête ou une pointe doit *dépasser* du corps
pour compter.

**3. Les six lignées doivent se distinguer entre elles.** Elles seront vues côte à côte dans
une grille de collection, en vignettes de 32 pixels. Deux lignées qu'on confond à cette taille
sont deux lignées pour le prix d'une. Chacune a ci-dessous une contrainte de silhouette au
stade 5 : elle prime sur tout le reste.

## Les six lignées

Chaque lignée porte un **fil conducteur** : un trait présent dès le stade 1, jamais perdu, qui
grossit avec la bête. C'est lui qui tient la continuité.

### Tortue — fil : les hexagones de la carapace
Silhouette au stade 5 : **reste BASSE et très large**. C'est ce qui la sépare de l'escargot,
dont la coquille monte.
1. tortue nouveau-née, tête énorme et grands yeux ronds, petite carapace molle à motif
   hexagonal simple, quatre petites nageoires
2. petite tortue ronde, la même carapace hexagonale maintenant ferme et basse, les mêmes
   quatre nageoires
3. tortue centenaire, le même motif hexagonal sur une carapace beaucoup plus LARGE et toujours
   basse, pattes courtes et épaisses, visage calme et ridé
4. tortue-île, le même motif, la carapace maintenant très large et plate, taches de mousse
   rondes et un arbuste minuscule dessus, pattes courtes, yeux ensommeillés
5. Kurma, tortue énorme, le même motif hexagonal sur une carapace immense et BASSE qui occupe
   toute la largeur du cadre, plaques vertes douces sur le dessus, tout petit visage endormi
   à l'avant

### Papillon — fil : le même ocelle sur les ailes
Silhouette au stade 5 : **la masse est faite par l'aile, le corps reste minuscule**.
1. petite chenille dodue, corps rond segmenté, grands yeux ronds, deux antennes minuscules à
   bout rond, un petit ocelle pâle sur le flanc
2. petit papillon, corps rond minuscule, deux paires de petites ailes arrondies portant le même
   ocelle pâle, les mêmes antennes à bout rond
3. papillon de lune, les mêmes antennes maintenant plumeuses, le même ocelle plus grand sur des
   ailes arrondies plus larges, corps duveteux
4. aile-de-brume, les mêmes antennes, le même ocelle maintenant grand et pâle sur des ailes
   très LARGES aux bords nuageux, petit corps, yeux ensommeillés
5. Psyché, papillon de nuit énorme, les mêmes antennes plumeuses, le même ocelle devenu un
   immense anneau doux et lumineux sur des ailes immenses qui remplissent le cadre, tout petit
   visage endormi au centre

### Araignée — fil : le sablier pâle sur l'abdomen
Silhouette au stade 5 : **c'est l'abdomen qui remplit le cadre, les pattes deviennent courtes
à côté**.
1. minuscule araignée naissante, presque tout en abdomen, huit pattes très courtes et rondes,
   deux grands yeux ronds avec quatre yeux-points au-dessus, un sablier pâle sur le dos
2. petite araignée ronde, les mêmes huit pattes plus longues et toujours arrondies, le même
   abdomen bulbeux au même sablier pâle, corps duveteux
3. veuve noire dodue, les mêmes huit pattes arrondies plus épaisses, le même sablier maintenant
   vif et plus grand sur un abdomen rond et luisant, visage calme
4. tisseuse d'ombre, les mêmes huit pattes repliées sous un abdomen bien plus GROS, le même
   sablier, une touffe de soie nuageuse sur le dos, yeux ensommeillés
5. Arachné, araignée énorme, les mêmes huit pattes arrondies devenues courtes contre un abdomen
   en dôme immense qui remplit le cadre, le même sablier devenu des fils dorés, tout petit
   visage endormi en bas à l'avant

### Cerf — fil : les taches pâles du faon, et une ramure qui pousse par branches arrondies
Silhouette au stade 5 : **couché, la ramure forme une large canopée**. Jamais de pointes.
1. faon minuscule, tête énorme et grands yeux ronds, quatre pattes fines et hésitantes, taches
   pâles sur le dos, deux petites bosses rondes là où la ramure poussera
2. petit cerf rond, les mêmes taches pâles, les mêmes bosses devenues de courts bois arrondis,
   pattes plus épaisses, regard doux
3. grand cerf, les mêmes taches, les mêmes bois devenus une petite couronne arrondie ramifiée,
   poitrail large, yeux calmes
4. cerf des brumes, les mêmes taches, les mêmes bois devenus une large couronne arrondie
   couverte de mousse douce, corps plus lourd, pattes courtes, yeux ensommeillés
5. Cernunnos, cerf énorme couché, les mêmes taches pâles, la même ramure arrondie devenue une
   immense canopée douce avec de minuscules feuilles, tout petit visage endormi dessous

### Ours — fil : une tache pâle en croissant sur la poitrine, et rien d'autre
Silhouette au stade 5 : **c'est la seule lignée qui ne gagne aucun ornement, seulement du
volume**. Une masse couchée qui remplit le cadre.
1. ourson minuscule, tête ronde énorme, petites oreilles rondes, quatre pattes trapues, une
   tache pâle en croissant sur la poitrine
2. petit ours rond assis, les mêmes petites oreilles rondes, le même croissant pâle, fourrure
   épaisse et douce, regard amical
3. ours des cavernes, les mêmes oreilles et le même croissant, épaules bien plus larges, corps
   rond et lourd, yeux calmes
4. gardien sylvestre, les mêmes oreilles et le même croissant, corps rond énorme sur pattes
   courtes, touffes de mousse sur les épaules, yeux ensommeillés
5. Artio, ours colossal couché qui remplit le cadre, les mêmes oreilles rondes, le même
   croissant devenu doré et lumineux, tout petit visage endormi posé sur d'énormes pattes avant

### Chat — fil : de grandes oreilles triangulaires arrondies, et trois rayures sur la queue
Silhouette au stade 5 : **couché, la queue enroulée autour du corps**.
1. chaton minuscule, tête ronde énorme, deux grandes oreilles triangulaires arrondies, grands
   yeux ronds, queue courte à trois rayures pâles
2. petit chat rond assis, les mêmes grandes oreilles arrondies, la même queue à trois rayures
   plus longue et touffue, corps rond et doux
3. lynx, les mêmes oreilles arrondies avec de petites touffes douces au bout, la même queue à
   trois rayures courte et épaisse, poitrail plus large, yeux calmes
4. panthère des brumes, les mêmes oreilles arrondies à touffes, les mêmes trois rayures sur une
   longue queue lourde, corps bas bien plus gros, marques nuageuses douces, yeux ensommeillés
5. Bastet, chat énorme couché, les mêmes oreilles arrondies à touffes, la même queue à trois
   rayures enroulée autour du corps, anneaux dorés doux sur les épaules, tout petit visage
   endormi sur les pattes repliées

## Le contrôle avant que je valide

Quatre questions, dans cet ordre. Si l'une échoue, on refait la planche.

1. Sur le stade 5, peut-on **montrer du doigt** ce qui vient du stade 1 ?
2. Réduite à 24 pixels de haut, la lignée se reconnaît-elle **sans lire son nom** ?
3. Les stades 5 des six lignées, côte à côte, se distinguent-ils **par la silhouette seule** ?
4. Six couleurs à plat au maximum, aucun dégradé, aucun bruit, aucune lueur ?

## Ce que je récupère

Un PNG par lignée, fond transparent, nommé exactement :

    source-tortue.png · source-papillon.png · source-araignee.png
    source-cerf.png · source-ours.png · source-chat.png
