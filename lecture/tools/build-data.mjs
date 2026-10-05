// Valide la source pédagogique (curriculum.mjs) puis génère app/data/*.json
// Usage : node tools/build-data.mjs
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LETTERS, UNITS } from './curriculum.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'app', 'data');
mkdirSync(OUT, { recursive: true });

const CLUSTERS = new Set(['bl', 'cl', 'fl', 'gl', 'pl', 'br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr', 'vr']);
const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

// ---------- graphèmes connus à l'unité u ----------
const setsCache = new Map();
function sets(u) {
  if (setsCache.has(u)) return setsCache.get(u);
  const V = [], C = [];
  for (const L of LETTERS) {
    if (L.unit > u) continue;
    for (const f of L.forms) (L.kind === 'c' ? C : V).push({ form: f, id: L.id });
  }
  V.sort((a, b) => b.form.length - a.form.length);
  C.sort((a, b) => b.form.length - a.form.length);
  const r = { V, C };
  setsCache.set(u, r);
  return r;
}

// ---------- analyse d'une syllabe ----------
// onset? + voyelle + (e muet)? + (coda)?
function parseSyllable(syl, u) {
  const s = syl.toLowerCase();
  const { V, C } = sets(u);
  function* onsets() {
    yield { on: [], p: 0 };
    for (const f of C) {
      if (!s.startsWith(f.form, 0)) continue;
      yield { on: [f], p: f.form.length };
      if (u >= 14) {
        for (const g of C) {
          if (s.startsWith(g.form, f.form.length) && CLUSTERS.has(f.form + g.form)) {
            yield { on: [f, g], p: f.form.length + g.form.length };
          }
        }
      }
    }
  }
  for (const { on, p } of onsets()) {
    for (const v of V) {
      if (!s.startsWith(v.form, p)) continue;
      const p2 = p + v.form.length;
      const tails = [{ silentE: false, p: p2 }];
      if (u >= 7 && v.id !== 'e' && s[p2] === 'e') tails.push({ silentE: true, p: p2 + 1 });
      for (const t of tails) {
        if (t.p === s.length) return { on, v, coda: null, silentE: t.silentE };
        if (u >= 13) {
          for (const f of C) {
            if (!s.startsWith(f.form, t.p)) continue;
            const e1 = t.p + f.form.length;
            if (e1 === s.length) return { on, v, coda: f, silentE: t.silentE };
            // coda double : consonne + lettre finale muette (part, dort…)
            for (const g of C) {
              if (['t', 'd', 's', 'p'].includes(g.form) && s.startsWith(g.form, e1) && e1 + g.form.length === s.length) {
                return { on, v, coda: f, silentE: t.silentE };
              }
            }
          }
        }
      }
    }
  }
  return null;
}

// c/g : dur devant a o u (+ sons), doux devant e i é è ê ; ç seulement devant a o u
function checkHardSoft(parsed, u, label) {
  const last = parsed.on[parsed.on.length - 1];
  if (!last) return;
  const vf = parsed.v.form;
  const soft = /^[eéèêi]/.test(vf);
  if ((last.form === 'c' || last.form === 'g') && soft && u < 16) {
    err(`${label}: "${last.form}" doux avant l'unité 16 (${parsed.v.form})`);
  }
  if (last.form === 'ç' && soft) err(`${label}: ç devant e/i`);
}

function analyseWord(syls, u, label) {
  const parsed = [];
  for (const [i, syl] of syls.entries()) {
    const p = parseSyllable(syl, u);
    if (!p) { err(`${label}: syllabe "${syl}" non décodable à l'unité ${u}`); return null; }
    checkHardSoft(p, u, `${label}/${syl}`);
    const prev = parsed[i - 1];
    const nasal = prev && ['on', 'an', 'in', 'en'].includes(prev.v.id);
    if (prev && !prev.coda && !nasal && u < 15 && p.on.length === 1 && p.on[0].form === 's') {
      err(`${label}: s entre deux voyelles (= z) avant l'unité 15`);
    }
    parsed.push(p);
  }
  return parsed;
}

const gIds = (p) => [...p.on.map((x) => x.id), p.v.id, ...(p.silentE ? ['e'] : []), ...(p.coda ? [p.coda.id] : [])];

// ---------- mots ----------
const words = [];
const lexicon = new Map(); // forme minuscule -> unité d'introduction
const outils = [];
const SAY_FIX = { "j'": 'je', "l'": 'le', "c'": 'ce', "d'": 'de', "n'": 'ne' };

for (const U of UNITS) {
  for (const o of U.outils) {
    if (lexicon.has(o)) { warn(`outil "${o}" déjà introduit (unité ${lexicon.get(o)})`); continue; }
    lexicon.set(o, U.id);
    outils.push({
      id: 'O-' + o, level: U.id, difficulty: 1, content: o, syllables: [o],
      say: SAY_FIX[o] || o, audio: 'audio/outils/' + o.replace(/'/g, '_') + '.mp3', image: null,
      skills: ['mot_outil', 'lecture_mot'],
    });
  }
  for (const raw of U.words) {
    const [sylPart, emoji] = raw.split('|');
    const syls = sylPart.split('-');
    const content = syls.join('');
    const label = `mot "${content}" (U${U.id})`;
    const key = content.toLowerCase();
    if (lexicon.has(key)) { warn(`${label}: déjà dans le lexique (unité ${lexicon.get(key)})`); continue; }
    const parsed = analyseWord(syls.map((x) => x.toLowerCase()), U.id, label);
    lexicon.set(key, U.id);
    const hasClosed = parsed ? parsed.some((p) => p.coda) : false;
    const diff = Math.min(3, 1 + (syls.length >= 3 ? 1 : 0) + (U.id >= 14 ? 1 : hasClosed ? 1 : 0));
    words.push({
      id: 'W-' + key, level: U.id, difficulty: diff, content, syllables: syls.map((x, i) => (i === 0 ? x : x.toLowerCase())),
      graphemes: parsed ? parsed.map(gIds) : [],
      say: content, audio: 'audio/words/' + key + '.mp3', image: emoji || null,
      name: /^[A-ZÉ]/.test(content),
      skills: ['lecture_mot', 'decomposition', 'fusion', 'dictee', ...(syls.length > 1 ? ['syllabes'] : [])],
    });
  }
}

// ---------- phrases ----------
function tokensOf(text) {
  return text.replace(/[.,!?;:]/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
}
function checkTokens(text, u, label, soft = false) {
  for (const tok of tokensOf(text)) {
    const parts = tok.includes("'") ? [tok.slice(0, tok.indexOf("'") + 1), tok.slice(tok.indexOf("'") + 1)] : [tok];
    for (const part of parts) {
      const k = part.toLowerCase();
      const lvl = lexicon.get(k);
      if (lvl === undefined || lvl > u) (soft ? warn : err)(`${label}: mot inconnu à l'unité ${u} : "${part}"`);
    }
  }
}

const sentences = [];
const texts = [];
for (const U of UNITS) {
  U.sentences.forEach((text, i) => {
    const label = `phrase "${text}" (U${U.id})`;
    checkTokens(text, U.id, label);
    const ws = tokensOf(text);
    sentences.push({
      id: `P-${U.id}-${i + 1}`, level: U.id, difficulty: ws.length <= 4 ? 1 : ws.length <= 6 ? 2 : 3,
      content: text, words: ws, say: text, audio: `audio/sentences/${U.id}-${i + 1}.mp3`, image: null,
      skills: ['lecture_phrase', 'ordre_des_mots'],
    });
  });
  U.texts.forEach((t, i) => {
    const label = `texte "${t.title}" (U${U.id})`;
    t.sentences.forEach((s) => checkTokens(s, U.id, label));
    t.questions.forEach((q) => {
      checkTokens(q.q, U.id, label + ' question', true);
      q.choices.forEach((c) => checkTokens(c, U.id, label + ' choix', true));
      if (q.a < 0 || q.a >= q.choices.length) err(`${label}: réponse hors limites`);
    });
    texts.push({
      id: `T-${U.id}-${i + 1}`, level: U.id, difficulty: Math.min(3, 1 + Math.floor(t.sentences.length / 3)),
      title: t.title, content: t.sentences.join(' '), sentences: t.sentences, questions: t.questions,
      say: t.sentences.join(' '), audio: `audio/texts/${U.id}-${i + 1}.mp3`, image: t.emoji,
      skills: ['comprehension', 'lecture_texte', 'ordre_des_phrases'],
    });
  });
}

// ---------- syllabes (générées à partir des graphèmes) ----------
const HARD_OK = new Set(['a', 'o', 'u', 'ou', 'on', 'an', 'au', 'oi', 'ai']);
const EXTRA_FORMS = { au: ['eau'], ai: ['ei'], è: ['ê'], in: ['ain'] };
const syllables = [];
const seen = new Set();
function addSyl(content, level, diff, skill, parts) {
  if (seen.has(content)) return;
  seen.add(content);
  syllables.push({
    id: 'S-' + content, level, difficulty: diff, content, syllables: [content], graphemes: parts,
    say: content, audio: 'audio/syllables/' + content + '.mp3', image: null,
    skills: ['syllabes', 'lecture_syllabique', skill],
  });
}
const lettersUpTo = (u) => LETTERS.filter((l) => l.unit <= u);
for (const U of UNITS) {
  const u = U.id;
  const known = lettersUpTo(u);
  const cons = known.filter((l) => l.kind === 'c' && !['ss', 'ç', 'gn', 'ph', 'qu'].includes(l.id));
  const vows = known.filter((l) => l.kind === 'v' && l.id !== 'ill');
  const allowed = (c, v) => !((c.id === 'c' || c.id === 'g') && !HARD_OK.has(v.id));
  if (u <= 12 || u === 15) {
    for (const c of cons) {
      for (const v of vows) {
        const level = Math.max(c.unit, v.unit);
        if (level !== u) continue;
        if (!allowed(c, v)) continue;
        const forms = [v.forms[0], ...(EXTRA_FORMS[v.id] || [])];
        for (const f of forms) addSyl(c.lower + f, u, v.kind === 'v' && v.forms[0].length > 1 ? 2 : 1, 'syllabe_cv', [c.id, v.id]);
      }
    }
  }
  if (u === 13) {
    const cs = cons.filter((c) => ['m', 'l', 'p', 't', 'd', 's', 'f', 'v', 'n', 'b', 'c', 'g', 'j'].includes(c.id));
    const vs = ['a', 'i', 'o', 'u', 'e', 'ou'];
    for (const coda of ['r', 'l']) {
      for (const v of vs) {
        if (coda === 'l' && v === 'ou') continue;
        addSyl(v + coda, 13, 2, 'syllabe_fermee', [v, coda]);
        for (const c of cs) {
          if ((c.id === 'c' || c.id === 'g') && !['a', 'o', 'u', 'ou'].includes(v)) continue;
          addSyl(c.lower + v + coda, 13, 2, 'syllabe_fermee', [c.id, v, coda]);
        }
      }
    }
  }
  if (u === 14) {
    for (const cl of CLUSTERS) {
      for (const v of ['a', 'i', 'o', 'u', 'é', 'e', 'ou', 'on', 'an', 'in']) {
        addSyl(cl + v, 14, 3, 'groupe_consonne', [cl[0], cl[1], v]);
      }
    }
  }
  if (u === 16) {
    for (const v of ['a', 'o', 'u', 'ou', 'on', 'an']) addSyl('ç' + v, 16, 3, 'c_cedille', ['ç', v]);
    for (const v of ['e', 'i', 'é']) {
      addSyl('c' + v, 16, 3, 'c_doux', ['c', v]);
      addSyl('g' + v, 16, 3, 'g_doux', ['g', v]);
    }
    for (const v of ['a', 'i', 'o', 'u', 'é', 'e', 'ou', 'on']) addSyl('gn' + v, 16, 3, 'gn', ['gn', v]);
    for (const v of ['a', 'i', 'o', 'u', 'é', 'e', 'on', 'in']) addSyl('ph' + v, 16, 3, 'ph', ['ph', v]);
    for (const v of ['e', 'i', 'é', 'è']) addSyl('qu' + v, 16, 3, 'qu', ['qu', v]);
  }
}

// ---------- lettres ----------
const letters = LETTERS.map((L) => ({
  id: 'L-' + L.id, level: L.unit, difficulty: L.kind === 'r' ? 3 : L.forms[0] && L.forms[0].length > 1 ? 2 : 1,
  content: L.lower, upper: L.upper, lower: L.lower, forms: L.forms, kind: L.kind,
  syllables: [L.lower], say: L.say, sound: L.sound, keyword: L.kw, audio: 'audio/letters/' + L.id + '.mp3', image: L.e,
  skills: ['reconnaitre_lettre', 'associer_son', 'ecriture'],
}));

// ---------- dictées ----------
const dictees = [];
for (const w of words) {
  if (w.syllables.length <= 3) {
    dictees.push({
      id: 'D-' + w.id.slice(2), level: w.level, difficulty: w.difficulty, content: w.content, syllables: w.syllables,
      say: w.say, audio: w.audio, image: w.image, kind: 'mot', skills: ['dictee', 'syllabes', 'orthographe_lexicale'],
    });
  }
}
for (const p of sentences) {
  if (p.words.length <= 4 && p.level >= 5) {
    dictees.push({
      id: 'D-' + p.id.slice(2), level: p.level, difficulty: p.difficulty, content: p.content, syllables: [],
      say: p.say, audio: p.audio, image: null, kind: 'phrase', skills: ['dictee', 'phrase'],
    });
  }
}

// ---------- unités ----------
const units = UNITS.map((U) => {
  const newL = LETTERS.filter((l) => l.unit === U.id).map((l) => 'L-' + l.id);
  const cnt = (arr) => arr.filter((x) => x.level === U.id).length;
  const stages = [];
  if (newL.length) stages.push('lettres');
  if (cnt(syllables) || U.id === 1) stages.push('syllabes');
  if (cnt(words)) stages.push('mots');
  if (cnt(sentences)) stages.push('phrases');
  if (cnt(texts)) stages.push('textes');
  stages.push('ecriture');
  return {
    id: U.id, title: U.title, emoji: U.emoji, color: U.color, newLetters: newL, outils: U.outils, stages,
    counts: { lettres: newL.length, syllabes: cnt(syllables), mots: cnt(words), phrases: cnt(sentences), textes: cnt(texts) },
  };
});

// ---------- écriture ----------
const out = { letters, syllables, words, outils, sentences, texts, dictees, units };
for (const [name, data] of Object.entries(out)) {
  writeFileSync(join(OUT, name + '.json'), JSON.stringify(data));
}
const manifest = join(ROOT, 'app', 'audio', 'manifest.json');
if (!existsSync(manifest)) writeFileSync(manifest, '{}\n');

// ---------- bilan ----------
console.log('Unité | lettres syll. mots phrases textes');
for (const u of units) {
  const c = u.counts;
  console.log(String(u.id).padStart(5), '|', String(c.lettres).padStart(7), String(c.syllabes).padStart(5), String(c.mots).padStart(5), String(c.phrases).padStart(7), String(c.textes).padStart(6));
}
console.log(`Total : ${letters.length} lettres, ${syllables.length} syllabes, ${words.length} mots, ${outils.length} mots-outils, ${sentences.length} phrases, ${texts.length} textes, ${dictees.length} dictées`);
if (warns.length) console.log('\nAvertissements :\n' + warns.map((w) => ' - ' + w).join('\n'));
if (errors.length) {
  console.error('\nERREURS :\n' + errors.map((e) => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log('\nContenu valide.');
