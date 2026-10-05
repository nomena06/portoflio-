// Progression de l'enfant (stockée sur l'appareil) + répétition espacée (Leitner).
const KEY = 'pio-lecture-v1';
const HOURS = [0, 4, 24, 72, 168, 336]; // délai avant de revoir un élément, selon sa boîte (1..5)
export const PASS = 0.7; // score minimal pour valider une étape

const defaults = () => ({
  v: 1,
  profile: { name: '', avatar: '🦉' },
  settings: { writing: 'script', rate: 0.85, sfx: true, unlockAll: false },
  stages: {},
  items: {},
  streak: { days: 0, last: null },
  stars: 0,
});

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!s) return defaults();
    const d = defaults();
    return { ...d, ...s, settings: { ...d.settings, ...(s.settings || {}) }, profile: { ...d.profile, ...(s.profile || {}) } };
  } catch {
    return defaults();
  }
}

export const state = load();
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* stockage indisponible */ }
}

// ---------- éléments (lettres, syllabes, mots…) ----------
export function record(id, ok) {
  if (!id) return;
  const it = (state.items[id] ||= { box: 0, seen: 0, ok: 0, ko: 0, due: 0 });
  it.seen += 1;
  if (ok) {
    it.ok += 1;
    it.box = Math.min(5, it.box + 1);
    it.due = Date.now() + HOURS[it.box] * 3600e3;
  } else {
    it.ko += 1;
    it.box = 1;
    it.due = Date.now();
  }
  save();
}
export const mastered = (id) => {
  const it = state.items[id];
  return !!it && it.box >= 3 && it.ok / it.seen >= 0.6;
};
export function dueIds(prefix, exclude = new Set()) {
  const now = Date.now();
  return Object.entries(state.items)
    .filter(([id, it]) => id.startsWith(prefix) && it.seen > 0 && it.due <= now && !exclude.has(id))
    .sort((a, b) => a[1].box - b[1].box || a[1].due - b[1].due)
    .map(([id]) => id);
}
export const dueCount = () => Object.values(state.items).filter((it) => it.seen > 0 && it.due <= Date.now()).length;

// ---------- étapes ----------
const key = (unit, stage) => `${unit}:${stage}`;
export const stageInfo = (unit, stage) => state.stages[key(unit, stage)] || { best: 0, stars: 0, plays: 0 };
export const stagePassed = (unit, stage) => stageInfo(unit, stage).best >= PASS;

export function setStage(unit, stage, score) {
  const s = (state.stages[key(unit, stage)] ||= { best: 0, stars: 0, plays: 0 });
  s.plays += 1;
  s.best = Math.max(s.best, score);
  const stars = score >= 0.95 ? 3 : score >= 0.85 ? 2 : score >= PASS ? 1 : 0;
  s.stars = Math.max(s.stars, stars);
  state.stars = Object.values(state.stages).reduce((n, x) => n + x.stars, 0);
  touchStreak();
  save();
  return stars;
}

function touchStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  if (state.streak.last === today) return;
  state.streak = { days: state.streak.last === y ? state.streak.days + 1 : 1, last: today };
}

// Parcours verrouillé : une étape s'ouvre quand la précédente est réussie.
export function sequence(units) {
  return units.flatMap((u) => u.stages.map((st) => ({ unit: u.id, stage: st })));
}
export function isUnlocked(units, unit, stage) {
  if (state.settings.unlockAll) return true;
  const seq = sequence(units);
  const i = seq.findIndex((s) => s.unit === unit && s.stage === stage);
  if (i <= 0) return i === 0;
  return stagePassed(seq[i - 1].unit, seq[i - 1].stage);
}
export function nextStage(units) {
  const seq = sequence(units);
  return seq.find((s) => !stagePassed(s.unit, s.stage)) || seq[seq.length - 1];
}

export function setProfile(p) { Object.assign(state.profile, p); save(); }
export function setSettings(p) { Object.assign(state.settings, p); save(); }
export function resetAll() {
  Object.assign(state, defaults());
  save();
}
