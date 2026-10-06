// Chargement et indexation de la base de contenu (data/*.json).
export const D = {};
const NAMES = ['letters', 'syllables', 'words', 'outils', 'sentences', 'texts', 'dictees', 'units'];

export async function loadData() {
  const parts = await Promise.all(NAMES.map((n) => fetch(`data/${n}.json`).then((r) => r.json())));
  NAMES.forEach((n, i) => { D[n] = parts[i]; });
  D.byId = new Map();
  for (const n of NAMES.slice(0, 7)) for (const it of D[n]) D.byId.set(it.id, it);
  D.letterByG = new Map(D.letters.map((l) => [l.id.slice(2), l])); // 'm' -> lettre m
  return D;
}

export const unitOf = (id) => D.units.find((u) => u.id === id);
export const at = (kind, unit) => D[kind].filter((x) => x.level === unit);
export const upTo = (kind, unit) => D[kind].filter((x) => x.level <= unit);

// Découpe un texte selon la liste de graphèmes : "bain" + ['b','in'] -> ['b','ain']
export function splitByGraphemes(content, ids) {
  const out = [];
  let pos = 0;
  const s = content.toLowerCase();
  for (const id of ids) {
    const L = D.letterByG.get(id);
    const forms = L ? [...L.forms].sort((a, b) => b.length - a.length) : [id];
    const f = forms.find((x) => s.startsWith(x, pos)) || s[pos];
    if (!f) break;
    out.push(f);
    pos += f.length;
  }
  if (pos < s.length) out.push(s.slice(pos));
  return out;
}

export const gFlat = (word) => word.graphemes.flat();
export function wordLetters(word) {
  const parts = [];
  let pos = 0;
  const low = word.content.toLowerCase();
  for (const sylIds of word.graphemes) {
    for (const id of sylIds) {
      const L = D.letterByG.get(id);
      const forms = L ? [...L.forms].sort((a, b) => b.length - a.length) : [id];
      const f = forms.find((x) => low.startsWith(x, pos)) || low[pos];
      if (!f) break;
      parts.push(f);
      pos += f.length;
    }
  }
  if (pos < low.length) parts.push(low.slice(pos));
  return parts;
}
