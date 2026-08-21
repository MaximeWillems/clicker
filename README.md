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
- Les trois accélérateurs : le temps (gratuit), le clic (+1 s), la nourriture (payante)
- Incubateurs et enclos, à prix croissant
- Trois automatisations : couveuse, mangeoire (activable), marchand (avec règle de vente)
- Progression hors ligne, plafonnée à 24 h
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

## À vérifier en jouant

1. La première évolution tombe-t-elle avant la dixième minute ?
2. Le clic est-il agréable, ou juste fonctionnel ?
3. Le choix vendre / faire évoluer est-il une vraie hésitation, ou la réponse est-elle
   toujours évidente ?
4. À quel moment s'ennuie-t-on ?

Les créatures sont des emoji : ce sont des placeholders assumés, en attendant les 25 dessins.
