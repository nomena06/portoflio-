# Portfolio Nomena — site statique, une page, sans build

| Fichier | Rôle |
|---|---|
| `index.html` | contenu, sections, SEO (390 l.) |
| `css/style.css` | styles ; tokens couleur dans `:root` en haut (445 l.) |
| `js/main.js` | thème, EN/FR (objet `FR` en haut), nav, formulaire (287 l.) |
| `assets/img/` | 2 captures PNG, 3 illustrations SVG |

Traductions : objet `FR` dans `main.js` ↔ attributs `data-i18n` du HTML.
Déploiement : Netlify sur push vers `main` → https://ramananarivo.netlify.app/

## Règles

- Lire ciblé (`grep -n` puis `sed -n`), jamais un fichier entier. Éditer en
  place, ne pas relire pour vérifier. Grouper les appels d'outils.
- Sub-agents : non. Dépôt trop petit, un agent repart de zéro et coûte plus.
- Réponses courtes : ce qui a changé, où, ce qui demande une décision.
- Français en conversation, anglais dans le code et les commits.
- Jamais de push sur `main` sans accord : `main` = production.
- Les chiffres du site (6+ ans, 80 %, 48h, résultats) sont des estimations
  à valider. Ne pas en inventer d'autres.
