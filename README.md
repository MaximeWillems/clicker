# Éclosion — jalon 0

Prototype jouable du clicker d'élevage. **Site statique pur** : trois fichiers, aucune
dépendance, aucun build, aucun serveur applicatif. La partie est sauvegardée dans le
`localStorage` du navigateur.

> Ce code est un prototype de sensation, pas une fondation. Son seul but est de répondre à
> une question : est-ce que les dix premières minutes sont agréables ? Le vrai jeu aura un
> serveur qui fait autorité, et ce fichier `game.js` sera jeté.

## Lancer en local

Ouvrir `index.html` directement dans le navigateur suffit. Pour servir proprement :

```bash
python -m http.server 5291
```

## Déployer

N'importe quel hébergement statique convient — GitHub Pages, Netlify, Cloudflare Pages,
ou un simple dossier derrière nginx/Apache. Pas de build, pas de variables d'environnement :
il suffit de publier la racine du dépôt.

La page porte déjà `<meta name="robots" content="noindex, nofollow">`, elle ne sera donc pas
indexée par les moteurs de recherche. Elle reste accessible à qui connaît l'URL — ce n'est
pas une protection, juste une discrétion suffisante pour un test privé.

## Ce qui est dans le jalon 0

- Les 5 lignées et leurs 25 formes, du têtard au Léviathan
- Œuf → clic → éclosion → croissance → **vendre ou faire évoluer**
- **Rien n'avance tout seul au départ** : seuls le clic (+1 s) et la nourriture (payante) font
  éclore et grandir. Le temps ne se met à travailler qu'une fois les automatisations achetées
- **Engraissement sans limite** : un adulte se nourrit indéfiniment et grossit à vue d'œil
- Incubateurs et enclos, à prix croissant
- Cinq automatisations, dans cet ordre : couveuse, éleveur, acheteur, mangeoire, marchand
- Progression hors ligne, plafonnée à 24 h — et seulement pour ce qui est automatisé
- Collection des 25 formes découvertes

Absent volontairement : gènes, reproduction, fusion, lignées cachées, comptes, marché entre
joueurs. Tout cela demande le serveur.

## Boutons de test (en haut à droite)

| Bouton | Effet |
|---|---|
| `×1` | Cycle ×1 → ×10 → ×100. Accélère toute la simulation pour tester une progression complète en quelques minutes. |
| `♪` | Coupe le son. |
| `⟲` | Efface la partie et repart de zéro. |

## Équilibrage

Toutes les valeurs sont regroupées en haut de `game.js`, entre les commentaires
« Données ». Rien n'est en dur ailleurs. Les chiffres actuels sont un point de départ
crédible, pas une vérité — ils sont faits pour être retouchés en jouant.

| Palier | Croissance | Coût d'évolution | Valeur |
|---|---|---|---|
| 1 | 45 s | — | 40 |
| 2 | 3 min | 200 | 500 |
| 3 | 15 min | 3 000 | 6 000 |
| 4 | 1 h | 40 000 | 80 000 |
| 5 | 6 h | 600 000 | 1 500 000 |

### Automatisations

Le jeu commence entièrement à la main : un œuf ne couve pas et une créature ne grandit pas
tant qu'on ne clique pas dessus. Les compteurs affichent donc `15 clics` et non `15 s`, parce
qu'annoncer des secondes quand rien ne s'écoule serait un mensonge.

Les deux premiers achats n'accélèrent pas la partie, ils **mettent le temps au travail** —
c'est le moment précis où le jeu bascule de clicker à idle.

| Achat | Coût | Effet |
|---|---|---|
| Couveuse automatique | 120 | Les œufs couvent tout seuls |
| Éleveur automatique | 500 | Les créatures grandissent toutes seules |
| Acheteur automatique | 2 000 | Rachète et place un œuf dès qu'un incubateur se libère |
| Mangeoire automatique | 15 000 | Nourrit en continu pour dépasser la vitesse passive |
| Marchand automatique | 100 000 | Vend les adultes selon une règle réglable |

La progression hors ligne suit la même règle : sans couveuse ni éleveur, une absence ne
produit rien, et le bandeau de retour ne s'affiche pas.

### Engraissement

Un adulte peut être nourri à l'infini. Sa taille et sa valeur montent en **rendement
décroissant** (`OVER_GAIN`, logarithmique) pendant que la nourriture coûte toujours le même
prix à la seconde (`OVER_COST`, linéaire). Le rapport est identique à tous les paliers.

| Taille atteinte | Valeur gagnée | Résultat net |
|---|---|---|
| ×1,05 | +5 % | **+0,24 %** — le maximum possible |
| ×1,22 | +22 % | −2,7 % |
| ×1,38 | +38 % | −11,9 % |
| ×1,99 | +99 % | −151 % |
| ×3,92 | +292 % | −9 700 % |

Autrement dit : grossir est un plaisir et un puits à pièces, jamais une stratégie. Le meilleur
coup possible rapporte 0,24 % — trop peu pour valoir le clic, même automatisé.

Deux garde-fous en découlent :

- **L'évolution remet la taille à ×1.** Sans ça, engraisser au palier 1 — où la nourriture
  est dérisoire — puis évoluer rapporterait des dizaines de fois la mise, la valeur montant
  ×12 par palier quand la croissance ne monte que ×4. Le bouton *Évoluer* passe en rouge
  quand la créature est engraissée.
- **La mangeoire automatique s'arrête à l'âge adulte.** Elle ne doit jamais dépenser les
  pièces du joueur dans une opération perdante.

Pour rendre l'engraissement plus gratifiant, augmenter `OVER_GAIN` ou baisser `OVER_COST` —
mais tant que `OVER_GAIN` dépasse `OVER_COST`, les premières bouchées redeviennent rentables
et l'optimum se met à valoir le détour.

## À vérifier en jouant

1. La première évolution tombe-t-elle avant la dixième minute ?
2. Le clic est-il agréable, ou juste fonctionnel ?
3. Le choix vendre / faire évoluer est-il une vraie hésitation, ou la réponse est-elle
   toujours évidente ?
4. À quel moment s'ennuie-t-on ?

Les créatures sont des emoji : ce sont des placeholders assumés, en attendant les 25 dessins.
