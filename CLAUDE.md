# Portfolio Nomena Ramananarivo

Site vitrine statique d'une seule page. Freelance Odoo / Excel VBA / .NET.
Pas de build, pas de framework, pas de dépendances npm. On ouvre `index.html`
et ça marche.

## Carte du dépôt

| Fichier | Rôle | Taille |
|---|---|---|
| `index.html` | tout le contenu, sections sémantiques, SEO + JSON-LD | ~390 l. |
| `css/style.css` | design system maison, tokens, thèmes clair/sombre | ~445 l. |
| `js/main.js` | thème, bascule EN/FR, nav, reveal, formulaire | ~287 l. |
| `assets/img/` | 2 captures PNG réelles + 3 illustrations SVG | — |
| `netlify.toml` | publication racine, cache, en-têtes sécurité | ~45 l. |

Repères pour éviter d'explorer : les **tokens de couleur** sont dans `:root` et
`html[data-theme="dark"]` en haut de `style.css`. Les **traductions** sont dans
l'objet `FR` en haut de `main.js`, appariées aux attributs `data-i18n` du HTML
(clé absente = texte anglais conservé). Le **responsive** tient dans trois
media queries en fin de `style.css`.

## Règles d'économie de contexte

1. **Ne jamais lire un fichier en entier** s'il fait plus de 100 lignes. Cibler :
   `grep -n "motif" fichier` puis `sed -n 'début,finp' fichier`.
2. **Modifier par `sed`, `python3` ou Edit ciblé**, jamais en réécrivant un
   fichier complet pour changer trois lignes.
3. **Grouper les appels d'outils indépendants** dans une seule réponse.
4. **Ne pas relire un fichier après l'avoir édité** pour vérifier : l'édition
   échoue bruyamment si elle rate.
5. **Captures d'écran seulement si le rendu visuel change.** Une correction de
   texte ou de SEO ne justifie pas un lancement de Chromium.
6. **Pas de résumé de fin de tâche à rallonge.** Ce qui a changé, où, et les
   points qui demandent une décision. Rien d'autre.

## Sub-agents : quand, et surtout quand pas

Un sub-agent démarre sans contexte : il paie à nouveau la découverte du projet.
Il fait donc **augmenter** le total de tokens. Son seul intérêt est de garder la
session principale légère quand une tâche produit beaucoup de lecture pour peu
de conclusion.

**Déléguer** (agent `Explore`) uniquement si :
- la recherche balaie de nombreux fichiers et seule la conclusion compte ;
- la tâche est isolable, sans allers-retours avec le reste de la conversation.

**Ne pas déléguer** — faire soi-même :
- toute tâche sur ce dépôt qui touche moins de 5 fichiers (donc : presque tout) ;
- une modification de contenu, de style ou de texte ;
- une tâche où il faudrait expliquer à l'agent autant de contexte que
  d'exécuter la tâche.

Sur un dépôt de cette taille, le cas « déléguer » est rare. Par défaut : non.

## Conventions

- **Conversation en français**, code / commentaires / commits en anglais.
- **Commits** : titre impératif, corps expliquant le pourquoi, pas le quoi.
- **Branche** : développer sur la branche désignée, jamais de push direct
  sur `main` sans accord explicite. `main` est la branche de production
  Netlify — y pousser met le site en ligne.
- **Déploiement** : Netlify redéploie sur chaque push vers `main`. Site en
  ligne : https://ramananarivo.netlify.app/
- **URL publique** présente en 5 endroits (`og:url`, `og:image`, `canonical`,
  `robots.txt`, `sitemap.xml`). La changer partout d'un coup, sinon les
  aperçus de partage cassent.

## Contenu à ne pas inventer

Les chiffres du site (« 6+ années », « 80 % », « 48h », les résultats des
études de cas) sont des estimations à valider par Nomena. Ne pas en ajouter
de nouveaux sans demander.
