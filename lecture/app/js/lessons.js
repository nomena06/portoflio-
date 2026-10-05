// Construit les séquences d'exercices (étapes) à partir de la base de contenu.
// Tout le contenu vient de data/*.json : ici on ne code que la pédagogie (ordre, répétition).
import { D, at, upTo } from './data.js';
import { dueIds, state } from './store.js';
import { shuffle, sample, uniq } from './ui.js';

export const STAGES = {
  lettres: { title: 'Découvrir les lettres', icon: '🔤', short: 'Lettres' },
  syllabes: { title: 'Lire les syllabes', icon: '🧩', short: 'Syllabes' },
  mots: { title: 'Lire des mots', icon: '🏷️', short: 'Mots' },
  phrases: { title: 'Lire des phrases', icon: '💬', short: 'Phrases' },
  textes: { title: 'Lire une histoire', icon: '📖', short: 'Histoire' },
  ecriture: { title: 'Écrire et dicter', icon: '✏️', short: 'Écrire' },
};

const flen = (x) => (x.forms[0] || '').length;
const simL = (t, x) => (t.kind === x.kind ? 1 : 0) + (flen(t) === flen(x) ? 0.5 : 0);
const simS = (t, x) => (t.content[0] === x.content[0] ? 1 : 0) + (t.content.slice(-1) === x.content.slice(-1) ? 1 : 0);
const simW = (t, x) => (t.syllables[0] === x.syllables[0] ? 1.5 : 0) + (t.syllables.length === x.syllables.length ? 0.5 : 0) + (t.content[0] === x.content[0] ? 0.5 : 0);
const simP = (t, x) => (Math.abs(t.words.length - x.words.length) <= 1 ? 1 : 0) + (t.words[0] === x.words[0] ? 1 : 0);

function distract(target, pool, n, sim, same = (x) => x.content) {
  const cand = uniq(pool.filter((x) => x.id !== target.id && same(x) !== same(target)), same);
  const ranked = sim
    ? cand.map((x) => [sim(target, x) + Math.random() * 1.2, x]).sort((a, b) => b[0] - a[0]).map((x) => x[1])
    : shuffle(cand);
  return ranked.slice(0, n);
}

const lettersUpTo = (u) => D.letters.filter((l) => l.level <= u);
const hearStep = (target, pool, sim, n) => ({ ex: 'hear_choose', target, options: [target, ...distract(target, pool, n, sim)] });

function extraLetters(pieces, unit, n = 2) {
  const forms = uniq(lettersUpTo(unit).filter((l) => l.kind !== 'r').map((l) => l.forms[0]));
  return sample(forms.filter((f) => !pieces.includes(f)), n);
}
function extraSyllables(word, unit, n = 2) {
  const own = new Set(word.syllables.map((s) => s.toLowerCase()));
  const first = word.syllables[0][0].toLowerCase();
  const pool = upTo('syllables', unit).filter((s) => !own.has(s.content));
  const near = pool.filter((s) => s.content[0] === first);
  return uniq([...sample(near, 1), ...sample(pool, 4)].map((s) => s.content)).slice(0, n);
}

// Éléments déjà vus à revoir (répétition espacée), tirés des unités précédentes.
function reviewSteps(prefix, unit, n, pool, sim) {
  const ids = dueIds(prefix).map((id) => D.byId.get(id)).filter((it) => it && it.level < unit);
  let picks = ids.slice(0, n);
  if (picks.length < n) {
    // pas assez d'éléments "dus" : on complète avec des éléments déjà vus, les plus fragiles d'abord
    const seen = Object.entries(state.items)
      .filter(([id, it]) => id.startsWith(prefix) && it.seen > 0)
      .sort((a, b) => a[1].box - b[1].box)
      .map(([id]) => D.byId.get(id))
      .filter((it) => it && it.level < unit && !picks.includes(it));
    picks = [...picks, ...seen.slice(0, n - picks.length)];
  }
  return picks.map((t) => hearStep(t, pool, sim, 2));
}

// ---------- étapes ----------
function stageLettres(unit) {
  const news = at('letters', unit);
  const pool = lettersUpTo(unit);
  const steps = news.map((item) => ({ ex: 'card_letter', item }));
  news.forEach((t) => {
    steps.push(hearStep(t, pool, simL, 2));
    steps.push({ ex: 'see_choose_sound', target: t, options: [t, ...distract(t, pool, 2, simL)] });
  });
  steps.push(...shuffle(news).map((t) => hearStep(t, pool, simL, 2)));
  steps.push(...reviewSteps('L-', unit, 3, pool, simL));
  return steps;
}

function stageSyllabes(unit) {
  if (unit === 1) {
    const vow = at('letters', 1);
    return [
      { ex: 'read_tap_list', items: shuffle(vow), title: 'Je lis les voyelles' },
      { ex: 'read_tap_list', items: shuffle(vow), title: 'Je lis encore, plus vite !' },
      ...vow.flatMap((v) => [hearStep(v, vow, simL, 2)]),
      ...shuffle(vow).map((v) => hearStep(v, vow, simL, 2)),
    ];
  }
  const all = at('syllables', unit);
  const mine = all.length > 12 ? sample(all, 12) : all;
  const pool = upTo('syllables', unit);
  const steps = [];
  mine.slice(0, 4).forEach((s) => steps.push({ ex: 'build_syllable', target: s, show: true, extra: [] }));
  steps.push({ ex: 'read_tap_list', items: shuffle(mine).slice(0, 8), title: 'Je lis les syllabes' });
  mine.slice(4, 8).forEach((s) => steps.push({ ex: 'build_syllable', target: s, show: false, extra: extraLetters(s.graphemes, unit, 2) }));
  shuffle(mine).slice(0, 6).forEach((s) => steps.push(hearStep(s, pool, simS, 2)));
  steps.push({ ex: 'read_tap_list', items: shuffle(upTo('syllables', unit)).slice(0, 8), title: 'Je mélange tout !' });
  steps.push(...reviewSteps('S-', unit, 3, pool, simS));
  return steps;
}

function stageMots(unit) {
  const mine = shuffle(at('words', unit));
  const poolW = upTo('words', unit);
  const steps = [];
  const cards = mine.slice(0, 5);
  cards.forEach((item) => steps.push({ ex: 'word_card', item }));
  const builders = sample(mine, Math.min(mine.length, 6));
  builders.forEach((target) => {
    const single = target.syllables.length === 1;
    steps.push({ ex: 'build_word', target, extra: single ? extraLetters(target.content.toLowerCase().split(''), unit, 2) : extraSyllables(target, unit, 2) });
  });
  const withImg = mine.filter((w) => w.image);
  sample(withImg, Math.min(4, withImg.length)).forEach((target) => {
    const others = uniq(poolW.filter((w) => w.image && w.image !== target.image), (w) => w.image);
    const opts = sample(others, 3);
    if (opts.length >= 2) steps.push({ ex: 'word_image_choose', target, options: [target, ...opts] });
  });
  sample(mine, Math.min(3, mine.length)).forEach((t) => steps.push(hearStep(t, poolW, simW, 3)));
  steps.push(...reviewSteps('W-', unit, 3, poolW, simW));
  return steps;
}

function stagePhrases(unit) {
  const mine = at('sentences', unit);
  const poolP = upTo('sentences', unit);
  const steps = [];
  const outils = at('outils', unit);
  if (outils.length) steps.push({ ex: 'outil_card', items: outils });
  shuffle(mine).slice(0, 2).forEach((item) => steps.push({ ex: 'sentence_card', item }));
  const orderable = shuffle(mine).filter((s) => s.words.length >= 2 && s.words.length <= 7);
  orderable.slice(0, 4).forEach((item) => steps.push({ ex: 'sentence_order', item }));
  sample(mine, Math.min(3, mine.length)).forEach((target) => steps.push({ ex: 'sentence_hear_choose', target, options: [target, ...distract(target, poolP, 2, simP, (x) => x.content)] }));
  return steps;
}

function stageTextes(unit) {
  const steps = [];
  for (const text of at('texts', unit)) {
    steps.push({ ex: 'text_read', item: text });
    text.questions.forEach((q) => steps.push({ ex: 'text_quiz', text, q }));
    const others = uniq([...D.texts.filter((t) => t.id !== text.id).map((t) => t.image), ...D.words.filter((w) => w.image).map((w) => w.image)].filter((e) => e !== text.image));
    steps.push({ ex: 'text_image', text, options: [text.image, ...sample(others, 3)] });
    if (text.sentences.length >= 3) steps.push({ ex: 'text_order', text });
  }
  return steps;
}

function stageEcriture(unit) {
  const steps = [];
  const letters = at('letters', unit).filter((l) => l.kind !== 'r');
  letters.slice(0, 5).forEach((item) => steps.push({ ex: 'trace', item }));
  const syl = at('syllables', unit);
  sample(syl, Math.min(letters.length ? 2 : 3, syl.length)).forEach((item) => steps.push({ ex: 'trace', item }));
  const words = at('words', unit).filter((w) => w.syllables.length <= 3 && w.graphemes.length);
  sample(words, Math.min(3, words.length)).forEach((item) => steps.push({
    ex: 'dictee', item,
    extraSyl: item.syllables.length > 1 ? extraSyllables(item, unit, 2) : [],
    extraLet: extraLetters(item.content.toLowerCase().split(''), unit, 2),
  }));
  if (unit >= 5) {
    const ph = at('sentences', unit).filter((s) => s.words.length >= 3 && s.words.length <= 5);
    sample(ph, Math.min(1, ph.length)).forEach((item) => steps.push({ ex: 'sentence_order', item, dictation: true }));
  }
  return steps;
}

export function buildStage(unit, stage) {
  const b = { lettres: stageLettres, syllabes: stageSyllabes, mots: stageMots, phrases: stagePhrases, textes: stageTextes, ecriture: stageEcriture }[stage];
  return b(unit);
}

// Séance de révision : éléments dus d'abord, puis les plus fragiles.
export function buildRevision() {
  const maxUnit = Math.max(1, ...Object.keys(state.items).map((id) => (D.byId.get(id) || { level: 1 }).level));
  const take = (prefix, n) => {
    const due = dueIds(prefix).map((id) => D.byId.get(id)).filter(Boolean);
    const weak = Object.entries(state.items)
      .filter(([id, it]) => id.startsWith(prefix) && it.seen > 0)
      .sort((a, b) => a[1].box - b[1].box || a[1].ko - b[1].ko)
      .map(([id]) => D.byId.get(id)).filter(Boolean);
    return uniq([...due, ...weak], (x) => x.id).slice(0, n);
  };
  const steps = [];
  take('L-', 3).forEach((t) => steps.push(hearStep(t, lettersUpTo(maxUnit), simL, 2)));
  take('S-', 4).forEach((t) => steps.push(hearStep(t, upTo('syllables', maxUnit), simS, 2)));
  take('W-', 4).forEach((t) => {
    if (t.syllables.length > 1) steps.push({ ex: 'build_word', target: t, extra: extraSyllables(t, maxUnit, 2) });
    else steps.push(hearStep(t, upTo('words', maxUnit), simW, 3));
  });
  return shuffle(steps);
}
