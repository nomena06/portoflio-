// SOURCE PÉDAGOGIQUE ORIGINALE — progression phonétique et syllabique pour le CP.
// Tout le contenu (mots, phrases, textes) est écrit pour cette application.
// `node tools/build-data.mjs` valide cette source puis génère app/data/*.json.
//
// Notation des mots : "syl-la-bes|emoji"  (les majuscules marquent un prénom)
//
// Règles vérifiées automatiquement (voir build-data.mjs) :
//  - un mot n'utilise que des graphèmes déjà appris (unité <= unité du mot) ;
//  - syllabes ouvertes (consonne+voyelle) jusqu'à l'unité 12 ;
//  - c/g durs (ca co cu, ga go gu) avant l'unité 16, s entre deux voyelles (= z) à partir de 15 ;
//  - une phrase n'utilise que des mots/mots-outils déjà vus.

// kind : v = voyelle/son-voyelle, c = consonne, r = règle (affichage seulement)
export const LETTERS = [
  { id: 'a', unit: 1, kind: 'v', forms: ['a'], upper: 'A', lower: 'a', say: 'a', sound: 'a', kw: 'avion', e: '✈️' },
  { id: 'i', unit: 1, kind: 'v', forms: ['i'], upper: 'I', lower: 'i', say: 'i', sound: 'i', kw: 'île', e: '🏝️' },
  { id: 'o', unit: 1, kind: 'v', forms: ['o'], upper: 'O', lower: 'o', say: 'o', sound: 'o', kw: 'orange', e: '🍊' },
  { id: 'u', unit: 1, kind: 'v', forms: ['u'], upper: 'U', lower: 'u', say: 'u', sound: 'u', kw: 'usine', e: '🏭' },
  { id: 'é', unit: 1, kind: 'v', forms: ['é'], upper: 'É', lower: 'é', say: 'é', sound: 'é', kw: 'école', e: '🏫' },

  { id: 'm', unit: 2, kind: 'c', forms: ['m'], upper: 'M', lower: 'm', say: 'meu', sound: 'mmm', kw: 'maman', e: '👩' },
  { id: 'l', unit: 2, kind: 'c', forms: ['l'], upper: 'L', lower: 'l', say: 'leu', sound: 'lll', kw: 'lune', e: '🌙' },

  { id: 'r', unit: 3, kind: 'c', forms: ['r'], upper: 'R', lower: 'r', say: 'reu', sound: 'rrr', kw: 'robe', e: '👗' },
  { id: 'p', unit: 3, kind: 'c', forms: ['p'], upper: 'P', lower: 'p', say: 'peu', sound: 'p', kw: 'papa', e: '👨' },

  { id: 't', unit: 4, kind: 'c', forms: ['t'], upper: 'T', lower: 't', say: 'teu', sound: 't', kw: 'tortue', e: '🐢' },
  { id: 'd', unit: 4, kind: 'c', forms: ['d'], upper: 'D', lower: 'd', say: 'deu', sound: 'd', kw: 'dé', e: '🎲' },

  { id: 's', unit: 5, kind: 'c', forms: ['s'], upper: 'S', lower: 's', say: 'seu', sound: 'sss', kw: 'singe', e: '🐒' },
  { id: 'f', unit: 5, kind: 'c', forms: ['f'], upper: 'F', lower: 'f', say: 'feu', sound: 'fff', kw: 'fleur', e: '🌸' },
  { id: 'v', unit: 5, kind: 'c', forms: ['v'], upper: 'V', lower: 'v', say: 'veu', sound: 'vvv', kw: 'vélo', e: '🚲' },

  { id: 'n', unit: 6, kind: 'c', forms: ['n'], upper: 'N', lower: 'n', say: 'neu', sound: 'nnn', kw: 'nez', e: '👃' },
  { id: 'b', unit: 6, kind: 'c', forms: ['b'], upper: 'B', lower: 'b', say: 'beu', sound: 'b', kw: 'bateau', e: '⛵' },

  { id: 'e', unit: 7, kind: 'v', forms: ['e'], upper: 'E', lower: 'e', say: 'eu', sound: 'e', kw: 'cheval', e: '🐴' },

  { id: 'c', unit: 8, kind: 'c', forms: ['c'], upper: 'C', lower: 'c', say: 'keu', sound: 'k', kw: 'canard', e: '🦆' },
  { id: 'g', unit: 8, kind: 'c', forms: ['g'], upper: 'G', lower: 'g', say: 'gueu', sound: 'g', kw: 'gorille', e: '🦍' },

  { id: 'ch', unit: 9, kind: 'c', forms: ['ch'], upper: 'Ch', lower: 'ch', say: 'cheu', sound: 'chhh', kw: 'chat', e: '🐱' },
  { id: 'j', unit: 9, kind: 'c', forms: ['j'], upper: 'J', lower: 'j', say: 'jeu', sound: 'jjj', kw: 'judo', e: '🥋' },
  { id: 'z', unit: 9, kind: 'c', forms: ['z'], upper: 'Z', lower: 'z', say: 'zeu', sound: 'zzz', kw: 'zèbre', e: '🦓' },

  { id: 'ou', unit: 10, kind: 'v', forms: ['ou'], upper: 'Ou', lower: 'ou', say: 'ou', sound: 'ou', kw: 'loup', e: '🐺' },

  { id: 'on', unit: 11, kind: 'v', forms: ['on', 'om'], upper: 'On', lower: 'on', say: 'on', sound: 'on', kw: 'ballon', e: '⚽' },
  { id: 'an', unit: 11, kind: 'v', forms: ['an', 'am'], upper: 'An', lower: 'an', say: 'an', sound: 'an', kw: 'panda', e: '🐼' },

  { id: 'in', unit: 12, kind: 'v', forms: ['in', 'im', 'ain'], upper: 'In', lower: 'in', say: 'in', sound: 'in', kw: 'lapin', e: '🐰' },
  { id: 'en', unit: 12, kind: 'v', forms: ['en', 'em'], upper: 'En', lower: 'en', say: 'an', sound: 'en = an', kw: 'tente', e: '⛺' },

  { id: 'au', unit: 15, kind: 'v', forms: ['au', 'eau'], upper: 'Au', lower: 'au', say: 'o', sound: 'o', kw: 'auto', e: '🚗' },
  { id: 'eu', unit: 15, kind: 'v', forms: ['eu'], upper: 'Eu', lower: 'eu', say: 'eu', sound: 'eu', kw: 'feu', e: '🔥' },
  { id: 'ai', unit: 15, kind: 'v', forms: ['ai', 'ei'], upper: 'Ai', lower: 'ai', say: 'è', sound: 'è', kw: 'lait', e: '🥛' },
  { id: 'è', unit: 15, kind: 'v', forms: ['è', 'ê'], upper: 'È', lower: 'è', say: 'è', sound: 'è', kw: 'règle', e: '📏' },
  { id: 'oi', unit: 15, kind: 'v', forms: ['oi'], upper: 'Oi', lower: 'oi', say: 'oua', sound: 'oi', kw: 'oiseau', e: '🐦' },
  { id: 'ss', unit: 15, kind: 'c', forms: ['ss'], upper: 'Ss', lower: 'ss', say: 'sseu', sound: 'ss', kw: 'poisson', e: '🐟' },

  { id: 'ç', unit: 16, kind: 'c', forms: ['ç'], upper: 'Ç', lower: 'ç', say: 'seu', sound: 'ç = s', kw: 'garçon', e: '👦' },
  { id: 'gn', unit: 16, kind: 'c', forms: ['gn'], upper: 'Gn', lower: 'gn', say: 'gneu', sound: 'gn', kw: 'montagne', e: '⛰️' },
  { id: 'ph', unit: 16, kind: 'c', forms: ['ph'], upper: 'Ph', lower: 'ph', say: 'feu', sound: 'ph = f', kw: 'éléphant', e: '🐘' },
  { id: 'qu', unit: 16, kind: 'c', forms: ['qu'], upper: 'Qu', lower: 'qu', say: 'keu', sound: 'qu = k', kw: 'requin', e: '🦈' },
  { id: 'ill', unit: 16, kind: 'v', forms: ['ill', 'eill', 'eil'], upper: 'Ill', lower: 'ill', say: 'ille', sound: 'ill', kw: 'abeille', e: '🐝' },
  { id: 'ci', unit: 16, kind: 'r', forms: [], upper: 'Ce Ci', lower: 'ce ci', say: 'si', sound: 'ce, ci = s', kw: 'citron', e: '🍋' },
  { id: 'gi', unit: 16, kind: 'r', forms: [], upper: 'Ge Gi', lower: 'ge gi', say: 'ji', sound: 'ge, gi = j', kw: 'girafe', e: '🦒' },
];

export const UNITS = [
  {
    id: 1, title: 'Les voyelles', emoji: '🔤', color: '#ff7a59',
    outils: [], words: [], sentences: [], texts: [],
  },
  {
    id: 2, title: 'M et L', emoji: '🦙', color: '#ff9f1c',
    outils: ['a', 'la', 'ma'],
    words: ['a-mi|🤝', 'la-ma|🦙', 'Mi-mi|🐱', 'Lo-la|👧', 'Li-la|👧', 'Mi-la|👧', 'Lé-o|👦', 'Lé-a|👧', 'lu|📖', 'o-lé|💃', 'mi-mé|🙊'],
    sentences: [
      'Léo a lu.', 'Léa a mimé.', 'Lola a lu.', 'Mila a mimé Léo.', 'Olé, Léo !',
      'Mila a la lama.', 'Léa a mimé Lola.', 'Lila a lu.',
    ],
    texts: [],
  },
  {
    id: 3, title: 'R et P', emoji: '👨', color: '#f4b400',
    outils: ['est', 'et'],
    words: ['pa-pa|👨', 'pa-pi|👴', 'ra-mi|🃏', 'ma-ri|💍', 'Ré-mi|👦', 'po-lo|👕', 'é-pi|🌾', 'o-pé-ra|🎭', 'pu-ma|🐆', 'Mi-ra|👧', 'ri-ra|😄', 'ri|😄'],
    sentences: [
      'Papa a lu.', 'Papi a mimé.', 'Rémi est ami.', 'Léo a ri.', 'Lola et Léa.',
      'Papa et papi.', 'Mira a lu.', 'Rémi a lu.', 'Papi a ri.', 'Mila a ri.',
    ],
    texts: [],
  },
  {
    id: 4, title: 'T et D', emoji: '🏍️', color: '#8ac926',
    outils: ['un', 'une'],
    words: ['tu-tu|🩰', 'ta-ta|👩', 'To-to|👦', 'Ti-mo|👦', 'do-do|😴', 'ra-di-o|📻', 'dé|🎲', 'li-ra|📖', 'di-ra|💬', 'ti-ra|🪢', 'mi-di|🕛', 'pé-da-lo|🚤', 'mo-to|🏍️', 'ti-ré|🪢'],
    sentences: [
      'Tata a une radio.', 'Toto a ri.', 'Timo a un dé.', 'Papa a un pédalo.', 'Léo a une moto.',
      'Lola a un dé.', 'Mira a une moto.', 'Léa a un tutu.', 'Timo a une radio.', 'Rémi a tiré Léo.',
    ],
    texts: [],
  },
  {
    id: 5, title: 'S, F et V', emoji: '🚲', color: '#52b788',
    outils: ['il', 'elle'],
    words: ['sa-li|🧽', 'sa-la-mi|🍖', 'so-fa|🛋️', 'Sa-mi|👦', 'Sa-ra|👧', 'so-da|🥤', 'su-mo|🤼', 'so-lo|🎸', 'fu-mé|💨', 'vé-lo|🚲', 'vu|👀', 'ra-vi|😊', 'vo-la|🕊️', 'fi-la|🏃', 'sa-lu-é|👋'],
    sentences: [
      'Il a un vélo.', 'Elle a une moto.', 'Sami a salué Léo.', 'Sara a un sofa.', 'Il a vu un puma.',
      'Papa a un vélo et une radio.', 'Tata a un soda.', 'Léa a salué Sami.', 'Elle a vu Sara.', 'Il a un solo.',
    ],
    texts: [],
  },
  {
    id: 6, title: 'N et B', emoji: '👶', color: '#2ec4b6',
    outils: ['le', 'les', 'de', 'des', 'du'],
    words: ['mi-ni|🔹', 'Ni-na|👧', 'Na-di-a|👧', 'No-ra|👧', 'Ni-no|👦', 'No-é|👦', 'u-ni|🟦', 'bé-bé|👶', 'bo-bo|🩹', 'tu-ba|🎺', 'dé-bu-té|🏁', 'do-mi-no|🁢'],
    sentences: [
      'Le bébé a un bobo.', 'Nina a un vélo.', 'Le tuba de Noé.', 'Noé a salué Nadia.', 'Nino a une radio.',
      'Le bébé a vu un puma.', 'Nora a un domino.', 'Le bébé a le domino.', 'Nina a salué le bébé.', 'Il a débuté.',
    ],
    texts: [],
  },
  {
    id: 7, title: 'Le E', emoji: '🍌', color: '#3a86ff',
    outils: ['qui', 'me', 'te'],
    words: ['lu-ne|🌙', 'ra-me|🚣', 'ro-be|👗', 'ba-na-ne|🍌', 'to-ma-te|🍅', 'sa-la-de|🥗', 'pi-ra-te|🏴‍☠️', 'pé-da-le|🚲', 'ti-mi-de|😳', 'mi-ne|⛏️', 'pi-le|🔋', 'ma-la-de|🤒', 'mi-nu-te|⏱️', 'tu-be|🧴', 'vi-de|🫙', 'mo-bi-le|📱', 'pa-ra-de|🎉'],
    sentences: [
      'Lola a une robe.', 'Le pirate a une rame.', 'La salade et la tomate.', 'Le bébé est malade.', 'Léo a une banane.',
      'Le vélo a une pédale.', 'Le tube est vide.', 'Le pirate est timide.', 'Une minute, Rémi !', 'La pile est vide.',
      'Léa a une tomate et une banane.',
    ],
    texts: [
      {
        title: 'Le pirate timide', emoji: '🏴‍☠️',
        sentences: ['Léo a une rame.', 'Le pirate a une robe.', 'Le pirate est timide.', 'Léo a une banane.'],
        questions: [
          { q: 'Qui est timide ?', choices: ['Léo', 'Le pirate', 'Papa'], a: 1 },
          { q: 'Qui a une rame ?', choices: ['Léo', 'Le pirate', 'Nina'], a: 0 },
        ],
      },
    ],
  },
  {
    id: 8, title: 'C et G', emoji: '🦆', color: '#7b2cbf',
    outils: ['à', 'au', 'dans', 'où'],
    words: ['ca-ne|🦆', 'ca-na-ri|🐤', 'ca-ba-ne|🛖', 'co-co|🥥', 'cu-be|🧊', 'ca-mé-ra|📷', 'ca-ma-ra-de|🧑‍🤝‍🧑', 'dé-co-ré|🎄', 'ma-ca-ro-ni|🍝', 'ga-la|🎊', 'ga-ré|🅿️', 'ri-go-lo|😄', 'ga-lo-pé|🏇', 'pa-go-de|🏯', 'co-co-ri-co|🐓', 'ca-ca-o|☕'],
    sentences: [
      'Le canari est dans la cabane.', 'Léo a un cube.', 'Nadia a un canari.', 'Le camarade de Léo est rigolo.',
      'Papa a garé la moto.', 'La cane est à Léa.', 'Rémi a une caméra.', 'Le pirate a galopé à la pagode.',
      'Tata a une cabane.', 'Nino a un coco.', 'Il a un macaroni.',
    ],
    texts: [
      {
        title: 'La cabane', emoji: '🛖',
        sentences: ['Léo a une cabane.', 'Le canari est dans la cabane.', 'Léo a vu la cane.', 'La cane est à Léa.'],
        questions: [
          { q: 'Où est le canari ?', choices: ['dans la cabane', 'dans la pagode', 'dans la radio'], a: 0 },
          { q: 'La cane est à qui ?', choices: ['à Léa', 'à Léo', 'à Papa'], a: 0 },
        ],
      },
    ],
  },
  {
    id: 9, title: 'CH, J et Z', emoji: '🥋', color: '#d90368',
    outils: ['je', 'tu', 'suis', 'es'],
    words: ['ma-chi-ne|⚙️', 'ni-che|🐕', 'ca-che|🙈', 'ca-ché|🙈', 'ro-che|🪨', 'chu-te|🍂', 'ju-do|🥋', 'ju-pe|👗', 'jo-li|✨', 'ju-ré|🤞', 'zé-ro|0️⃣', 'zo-o|🦁', 'Zo-é|👧'],
    sentences: [
      'Je suis Zoé.', 'Tu es rigolo.', 'Zoé a une jupe.', 'Léo a une machine.', 'Papa a vu Zoé au zoo.',
      'Je suis au judo.', 'Le judo est rigolo.', 'Je suis rigolo.', 'Le canari est dans la niche.',
      'Zoé a vu la machine.', 'Tu es au zoo.',
    ],
    texts: [
      {
        title: 'Zoé au zoo', emoji: '🦁',
        sentences: ['Zoé est au zoo.', 'Zoé a vu la cane.', 'La cane est dans la niche.', 'Zoé a ri.'],
        questions: [
          { q: 'Où est Zoé ?', choices: ['au zoo', 'au judo', 'à la pagode'], a: 0 },
          { q: 'Qui a vu la cane ?', choices: ['Zoé', 'Léo', 'Papa'], a: 0 },
        ],
      },
    ],
  },
  {
    id: 10, title: 'Le son OU', emoji: '🐺', color: '#ef476f',
    outils: ['sur', 'avec', 'pour'],
    words: ['mou|☁️', 'fou|🤪', 'sou|🪙', 'cou|🦒', 'jou-jou|🧸', 'pou-le|🐔', 'bou-le|⚪', 'sou-pe|🍲', 'lou-pe|🔍', 'roue|🛞', 'mou-che|🪰', 'bou-che|👄', 'dou-che|🚿', 'cou-che|🛏️', 'tou-che|🎹', 'mou-le|🦪', 'fou-le|👥', 'sou-ri-re|😊', 'bi-jou|💎', 'cha-lou-pe|⛵', 'mi-nou|🐱', 'ca-ri-bou|🦌', 'cou-pe|🏆', 'vou-lu|🙏', 'cou-ru|🏃', 'ou|🔀'],
    sentences: [
      'Le minou est sur le sofa.', 'Léa a une poule.', 'La poule est dans la cabane.', 'Nina a une boule.',
      'Je suis dans la douche.', 'Zoé a un bijou.', 'Il a vu la poule sur la roche.', 'Papi a couru avec Nino.',
      'Une mouche est sur la soupe.', 'Le caribou a vu la foule.', 'Léo a voulu la coupe.', 'Papa a une loupe.',
    ],
    texts: [
      {
        title: 'La mouche', emoji: '🪰',
        sentences: ['Une mouche est sur la soupe de Léo.', 'Léo a une loupe.', 'Il a vu la mouche.', 'La mouche a couru sur la roue.'],
        questions: [
          { q: 'Où est la mouche ?', choices: ['sur la soupe', 'sur le sofa', 'dans la douche'], a: 0 },
          { q: 'Qui a une loupe ?', choices: ['Léo', 'Zoé', 'Papi'], a: 0 },
        ],
      },
    ],
  },
  {
    id: 11, title: 'Les sons ON et AN', emoji: '🐼', color: '#06d6a0',
    outils: ['nous', 'vous'],
    words: ['ma-man|👩', 'sa-lon|🛋️', 'me-lon|🍈', 'mou-ton|🐑', 'ca-non|💥', 'pan-ta-lon|👖', 'bon-bon|🍬', 'mon|🙋', 'ton|👉', 'son|🔊', 'non|🙅', 'on|👥', 'co-chon|🐷', 'chan-son|🎵', 'ga-zon|🌱', 'ban-de|🎀', 'pan-da|🐼', 'lam-pe|💡', 'jam-be|🦵', 'ton-ton|👨', 'bou-ton|🔘', 'chan-te|🎤', 'dan-se|💃', 'ram-pe|🛝'],
    sentences: [
      'Maman a un pantalon.', 'Mon papa a une moto.', 'Ton pantalon est sur le sofa.', 'Le mouton est sur le gazon.',
      'Maman chante une chanson.', 'Le panda danse.', 'Le cochon est dans le salon.', 'Léo a mon bonbon.',
      'Maman a une lampe.', 'Tonton a une moto.', 'Nina danse sur le gazon.',
    ],
    texts: [
      {
        title: 'Le mouton', emoji: '🐑',
        sentences: ['Le mouton est sur le gazon.', 'Il a vu un cochon.', 'Le cochon danse.', 'Le mouton chante une chanson.'],
        questions: [
          { q: 'Qui danse ?', choices: ['le cochon', 'le mouton', 'maman'], a: 0 },
          { q: 'Qui chante ?', choices: ['le cochon', 'le mouton', 'le panda'], a: 1 },
        ],
      },
    ],
  },
  {
    id: 12, title: 'Les sons IN et EN', emoji: '🐰', color: '#118ab2',
    outils: ['pas', 'ne', 'bien'],
    words: ['la-pin|🐰', 'ma-tin|🌅', 'mou-lin|🌬️', 'pin|🌲', 'sa-pin|🎄', 'pain|🍞', 'main|✋', 'bain|🛁', 'de-main|📆', 'fin|🏁', 'vin|🍷', 'ten-te|⛺', 'ven-du|💰', 'sen-ti|👃', 'pim-pon|🚒', 'co-pain|🧑‍🤝‍🧑', 'lu-tin|🧝', 'pé-pin|🍎', 'po-ti-ron|🎃', 'ma-lin|😏'],
    sentences: [
      'Le lapin a mon pain.', 'Papa a du pain.', 'Léo a un bobo à la main.', 'Le matin, papa a du pain et du vin.',
      'Le lutin a un sapin.', 'Le lapin ne danse pas.', 'Mon copain a une moto.', 'Le lutin a vendu le sapin.',
      'Maman a senti la soupe.', 'Le potiron est dans le salon.',
    ],
    texts: [
      {
        title: 'Le lutin', emoji: '🧝',
        sentences: ['Un lutin a un sapin.', 'Le lutin a une main sur le sapin.', 'Le lapin ne danse pas.', 'Le lutin chante une chanson.'],
        questions: [
          { q: 'Qui a un sapin ?', choices: ['le lutin', 'le lapin', 'le cochon'], a: 0 },
          { q: 'Qui ne danse pas ?', choices: ['le lutin', 'le lapin', 'maman'], a: 1 },
        ],
      },
    ],
  },
  {
    id: 13, title: 'Les syllabes fermées', emoji: '🐢', color: '#073b4c',
    outils: [],
    words: ['mar-di|📅', 'car-te|🗺️', 'por-te|🚪', 'for-me|🔷', 'tor-tue|🐢', 'bal-con|🏢', 'sa-lut|👋', 'pe-tit|🤏', 'pe-ti-te|🤏', 'dor-mir|😴', 'par-ti|🚶', 'mur|🧱', 'four|🔥', 'tour|🗼', 'jour|☀️', 'mal|🤕', 'bal|💃', 'bol|🥣', 'sel|🧂', 'mer|🌊', 'ver|🪱', 'ta-pis|🧶', 'sou-ris|🐭', 'jar-din|🌳', 'car-ton|📦', 'pi-lo-te|👨‍✈️', 'ma-da-me|👩', 'par-tir|🚶', 'sol|🟫', 'dur|🪨', 'dort|😴', 'part|🚶', 'a-ni-mal|🐾'],
    sentences: [
      'Mardi, papa a une carte.', 'La tortue est sur le tapis.', 'La souris est dans le jardin.', 'Le pilote a une carte.',
      'Madame Sara a un carton.', 'Le mur du jardin est dur.', 'Un jour, le petit lapin dort dans le jardin.',
      'Salut, madame !', 'La porte du balcon est petite.', 'Le bol est sur le four.', 'Papa part à midi.',
    ],
    texts: [
      {
        title: 'La petite souris', emoji: '🐭',
        sentences: ['Un jour, une petite souris est dans le jardin.', 'Elle a vu un carton sur le tapis.', 'La souris est dans le carton.', 'Elle dort.'],
        questions: [
          { q: 'Où est la souris ?', choices: ['dans le carton', 'sur le mur', 'dans le four'], a: 0 },
          { q: 'Qui dort ?', choices: ['la souris', 'le lapin', 'papa'], a: 0 },
        ],
      },
    ],
  },
  {
    id: 14, title: 'Les groupes de consonnes', emoji: '🐉', color: '#9d4edd',
    outils: ['mais', 'comme', 'comment'],
    words: ['li-vre|📖', 'ar-bre|🌳', 'ti-gre|🐅', 'cro-co-di-le|🐊', 'pru-ne|🍑', 'fri-te|🍟', 'clé|🔑', 'clou|🔩', 'plat|🍽️', 'plan-te|🪴', 'ta-ble|🪑', 'sa-ble|🏖️', 'ou-bli-é|🤔', 'grand|📏', 'gros|🐘', 'gran-de|📏', 'pro-pre|🧼', 'bro-co-li|🥦', 'dra-gon|🐉', 'trom-pe|🐘', 'a-bri-cot|🍑'],
    sentences: [
      'Le livre est sur la table.', 'Le tigre est un grand animal.', 'Le crocodile est dans le sable.',
      'Papa a une clé dans la main.', 'Maman a une plante sur la table.', 'Léo a une frite et une prune.',
      'Le dragon est gros mais il est timide.', 'Nina a oublié le livre.', 'Le dragon a une grande trompe.',
      'Papi a un abricot.',
    ],
    texts: [
      {
        title: 'Le dragon timide', emoji: '🐉',
        sentences: ['Le dragon est gros mais il est timide.', 'Il a un grand livre sur la table.', 'Le dragon a oublié la clé.', 'Il dort sur le sable.'],
        questions: [
          { q: 'Comment est le dragon ?', choices: ['timide', 'rigolo', 'petit'], a: 0 },
          { q: 'Qui a oublié la clé ?', choices: ['le dragon', 'le tigre', 'Léo'], a: 0 },
        ],
      },
    ],
  },
  {
    id: 15, title: 'AU, EAU, EU, AI, OI', emoji: '🚗', color: '#e63946',
    outils: ["j'", "l'", "c'", "d'", "n'"],
    words: ['au-to|🚗', 'ba-teau|⛵', 'cha-peau|🎩', 'bu-reau|🖥️', 'tau-reau|🐂', 'oi-seau|🐦', 'moi-neau|🐦', 'jau-ne|💛', 'chaud|🔥', 'roi|👑', 'moi|🙋', 'toi|👉', 'voi-tu-re|🚙', 'poi-re|🍐', 'é-toi-le|⭐', 'fleur|🌸', 'peur|😨', 'bleu|🔵', 'bleue|🔵', 'lait|🥛', 'mai-son|🏠', 'rai-sin|🍇', 'pè-re|👨', 'mè-re|👩', 'frè-re|👦', 'zè-bre|🦓', 'ro-se|🌹', 'va-se|🏺', 'ma-ga-sin|🏪', 'cou-sin|🧒', 'chai-se|🪑', 'poi-sson|🐟', 'ca-ssé|💔', 'pa-ssé|⏪', 'gro-sse|🐘', 'ta-sse|☕', 'cla-sse|🏫', 'eau|💧', 'ai|🙋', 'rê-ve|💭'],
    sentences: [
      "J'ai un chapeau bleu.", 'Mon père a une voiture jaune.', 'Ma mère a une rose.', 'Mon frère a un grand bateau.',
      "L'oiseau est sur la chaise.", "Le poisson est dans l'eau.", 'Le roi a un chapeau jaune.',
      'La maison de Rémi est grande.', 'Zoé a peur du zèbre.', 'Le lait est dans la tasse.', "C'est un raisin.",
      "C'est une étoile.", 'Mon cousin a un bureau.', 'Le vase est cassé.', 'Le taureau est dans le jardin.',
    ],
    texts: [
      {
        title: "Le roi et l'oiseau", emoji: '👑',
        sentences: ['Le roi a un chapeau jaune.', "L'oiseau est sur le chapeau du roi.", 'Le roi a peur.', "L'oiseau chante une chanson.", 'Le roi est ravi.'],
        questions: [
          { q: 'Qui est sur le chapeau ?', choices: ["l'oiseau", 'le roi', 'le zèbre'], a: 0 },
          { q: 'Le chapeau est jaune ou bleu ?', choices: ['jaune', 'bleu'], a: 0 },
        ],
      },
      {
        title: 'Ma famille', emoji: '🏠',
        sentences: ["J'ai une maison.", 'Mon père a une voiture bleue.', 'Ma mère a une rose.', 'Mon frère a un bateau.'],
        questions: [
          { q: 'Qui a une rose ?', choices: ['ma mère', 'mon père', 'mon frère'], a: 0 },
          { q: 'La voiture est jaune ou bleue ?', choices: ['bleue', 'jaune'], a: 0 },
        ],
      },
    ],
  },
  {
    id: 16, title: 'CE CI, GE GI, GN, PH, QU', emoji: '🍋', color: '#fb8500',
    outils: ['quand', 'sont', 'ont'],
    words: ['ci-tron|🍋', 'ci-né-ma|🎬', 'ce-ri-se|🍒', 'ci-ga-le|🦗', 'gi-ra-fe|🦒', 'ba-ga-ge|🧳', 'fro-ma-ge|🧀', 'ga-ra-ge|🏠', 'o-ran-ge|🍊', 'sin-ge|🐒', 'nu-a-ge|☁️', 'vi-sa-ge|🙂', 'man-ge|🍽️', 'gar-çon|👦', 'le-çon|📚', 'ma-çon|👷', 'gla-çon|🧊', 'mon-ta-gne|⛰️', 'ga-gné|🏆', 'si-gne|👍', 'li-gne|📏', 'vi-gne|🍇', 'pei-gne|🪮', 'cham-pi-gnon|🍄', 'té-lé-pho-ne|☎️', 'é-lé-phant|🐘', 'dau-phin|🐬', 'pho-que|🦭', 'que|❓', 'mu-si-que|🎵', 'fa-mille|👪', 'fille|👧', 'co-quille|🐚', 'bille|🔮', 'a-beille|🐝', 'so-leil|☀️', 'o-reille|👂', 'é-cou-te|👂', 'grille|🔲', 'jo-lie|✨'],
    sentences: [
      'Le singe mange une orange.', 'Le soleil est sur la montagne.', 'La girafe mange une cerise.',
      'Le garçon a un téléphone.', 'La fille a vu une abeille.', 'Le dauphin et le phoque sont dans la mer.',
      'Ma famille a un garage.', "L'abeille est sur la fleur.", 'Le champignon est dans le jardin.',
      "Maman a une coquille sur la table.", "J'écoute la musique.",
    ],
    texts: [
      {
        title: 'À la mer', emoji: '🌊',
        sentences: ['Ma famille est à la mer.', 'Papa a un téléphone.', 'Maman a une orange.', 'Mon frère a vu un dauphin.'],
        questions: [
          { q: 'Qui a une orange ?', choices: ['maman', 'papa', 'mon frère'], a: 0 },
          { q: 'Qui a vu un dauphin ?', choices: ['mon frère', 'papa', 'maman'], a: 0 },
        ],
      },
      {
        title: "L'abeille", emoji: '🐝',
        sentences: ["L'abeille est sur la fleur.", 'Elle chante une chanson.', 'La fleur est rose.', 'La fleur est jolie.'],
        questions: [
          { q: "Qui est sur la fleur ?", choices: ["l'abeille", 'le tigre', 'le roi'], a: 0 },
        ],
      },
    ],
  },
];
