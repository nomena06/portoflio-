# Lire avec Pio — méthode de lecture pour le CP

Application web (HTML/CSS/JS, sans framework) emballée en application Android (APK) avec Capacitor.
Méthode **originale**, inspirée de la logique phonétique et syllabique classique : tout le contenu
(mots, phrases, textes, illustrations, animations) est écrit pour cette application.

```
lettre → son → syllabe → mot → phrase → petit texte → lecture autonome
```

## Parcours

16 unités, chacune avec jusqu'à six étapes **verrouillées** (l'étape suivante s'ouvre à 70 % de réussite) :

| Étape | Ce que fait l'enfant |
|---|---|
| Lettres | majuscule / minuscule / cursive, son, image « M comme maman », reconnaissance, « quel son fait cette lettre ? » |
| Syllabes | M + A → MA (fabrication à la touche), lecture, mélange, reconnaissance à l'oreille |
| Mots | carte-mot (mot / syllabes / lettres), animation de **fusion**, reconstruction, mot → image |
| Phrases | mots-outils, phrase décomposable (chaque mot cliquable), remise en ordre, reconnaissance |
| Histoire | lecture, questions de compréhension, texte → image, remise en ordre |
| Écrire | tracé au doigt (script ou cursive), dictée « j'écoute → j'écris », dictée de phrase |

Unités : voyelles → m l → r p → t d → s f v → n b → e → c g → ch j z → ou → on an → in en →
syllabes fermées → groupes de consonnes → au eau eu ai oi → ce ci ge gi gn ph qu ill.

**Répétition** : chaque réponse alimente un système à boîtes (Leitner). Les éléments ratés reviennent
dans les leçons suivantes et dans l'écran « Réviser ». Une réponse fausse est reposée en fin de séance.

## Base de contenu (pas de contenu dans les composants)

`tools/curriculum.mjs` est la source ; `node tools/build-data.mjs` la **valide** puis génère
`app/data/*.json` :

- un mot n'emploie que des graphèmes déjà appris (syllabes ouvertes jusqu'à l'unité 12, `c`/`g` durs avant
  l'unité 16, `s` entre deux voyelles à partir de l'unité 15…) ;
- une phrase n'emploie que des mots ou mots-outils déjà vus.

Chaque élément porte : `level`, `difficulty`, `content`, `syllables`, `audio`, `image`, `skills`.
Pour enrichir l'application : ajouter une ligne dans `curriculum.mjs`, lancer `npm run data`. Si un mot
n'est pas décodable à cette unité, la commande l'indique.

## Audio

Par défaut la voix vient de la synthèse vocale française (native sur Android). Les sons isolés des
consonnes (« meu », « leu »…) sont approximatifs. Pour de vraies voix : `npm run audio-list` donne la liste des
fichiers attendus ; déposer les `.mp3` dans `app/audio/…` et les déclarer dans `app/audio/manifest.json`
(`{"audio/words/papa.mp3": true}`) — ils remplacent alors la synthèse, élément par élément.

## Lancer en local

```bash
cd lecture && npm run serve      # puis http://localhost:8080
```

## Fabriquer l'APK

Le workflow `.github/workflows/android-apk.yml` construit un **APK debug** installable directement
(« sources inconnues ») : onglet *Actions* de GitHub → dernier run → *Artifacts* → `lire-avec-pio-apk`.
Pour publier sur le Google Play Store il faudra un APK/AAB **signé** (clé à créer), non inclus.

Polices incluses sous licence SIL OFL : Andika, Playwrite FR Moderne.
Les données de l'enfant restent sur l'appareil.
