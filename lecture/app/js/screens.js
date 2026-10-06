// Écrans : accueil, unité, séance, progrès, réglages.
import { D, at, unitOf } from './data.js';
import { state, setProfile, setSettings, resetAll, stageInfo, stagePassed, isUnlocked, nextStage, dueCount, mastered, setStage, save, PASS } from './store.js';
import { play, sayText, sfx, stop, unlockAudio, hasVoice } from './audio.js';
import { EX } from './exercises.js';
import { STAGES, buildStage, buildRevision } from './lessons.js';
import { h, mascot, confetti, toast, sleep, rnd, PRAISE } from './ui.js';

const app = () => document.getElementById('app');
export const go = (hash) => { location.hash = hash; };
const stars = (n, max = 3) => '★'.repeat(n) + '☆'.repeat(max - n);

function shell(...kids) {
  const a = app();
  a.replaceChildren(...kids);
  a.scrollTop = 0;
  window.scrollTo(0, 0);
}
const topbar = (title, { back = '#/', right } = {}) => h('header', { class: 'topbar' },
  h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Retour', onclick: () => go(back) }, '←'),
  h('h1', {}, title),
  right || h('span', { class: 'spacer' }));

const unitLocked = (u) => !isUnlocked(D.units, u.id, u.stages[0]);
const unitStars = (u) => u.stages.reduce((n, s) => n + stageInfo(u.id, s).stars, 0);

// ---------- Accueil ----------
export function home() {
  const nxt = nextStage(D.units);
  const nu = unitOf(nxt.unit);
  const due = dueCount();
  const greeting = state.profile.name ? `Bonjour ${state.profile.name} !` : 'Bonjour !';
  const list = D.units.map((u) => {
    const locked = unitLocked(u);
    const total = u.stages.length * 3;
    const card = h('button', {
      class: 'unit-card' + (locked ? ' locked' : '') + (u.id === nxt.unit ? ' current' : ''), type: 'button',
      style: `--c:${u.color}`,
      onclick: () => (locked ? toast('Termine d\'abord l\'unité précédente 🔒') : go('#/unit/' + u.id)),
    },
      h('span', { class: 'u-num' }, u.id),
      h('span', { class: 'u-emoji' }, locked ? '🔒' : u.emoji),
      h('span', { class: 'u-title' }, u.title),
      h('span', { class: 'u-stars' }, locked ? '' : `${unitStars(u)}/${total} ★`));
    return card;
  });
  shell(
    h('header', { class: 'hero' },
      mascot(84),
      h('div', { class: 'hello' }, h('h1', {}, greeting), h('p', {}, `⭐ ${state.stars}   🔥 ${state.streak.days} jour${state.streak.days > 1 ? 's' : ''}`)),
      h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Réglages', onclick: () => go('#/settings') }, '⚙️')),
    h('main', { class: 'home' },
      h('button', { class: 'btn big primary go', type: 'button', onclick: () => go(`#/lesson/${nxt.unit}/${nxt.stage}`) },
        h('span', { class: 'go-main' }, '▶ Continuer'),
        h('span', { class: 'go-sub' }, `Unité ${nxt.unit} · ${STAGES[nxt.stage].title}`)),
      h('div', { class: 'row2' },
        h('button', { class: 'btn big', type: 'button', onclick: () => go('#/revision') }, '🔁 Réviser', due ? h('span', { class: 'badge' }, due) : null),
        h('button', { class: 'btn big', type: 'button', onclick: () => go('#/progress') }, '📊 Mes progrès')),
      h('h2', { class: 'sect' }, 'Mon parcours'),
      h('div', { class: 'units' }, list)),
  );
  void nu;
}

// ---------- Unité ----------
export function unit(id) {
  const u = unitOf(Number(id));
  if (!u) return go('#/');
  const letters = D.letters.filter((l) => l.level === u.id && l.kind !== 'r');
  const stageBtns = u.stages.map((s) => {
    const locked = !isUnlocked(D.units, u.id, s);
    const info = stageInfo(u.id, s);
    const c = u.counts;
    const sub = { lettres: `${c.lettres} lettre${c.lettres > 1 ? 's' : ''} / sons`, syllabes: u.id === 1 ? 'Lire les voyelles' : `${c.syllabes} syllabes`, mots: `${c.mots} mots`, phrases: `${c.phrases} phrases`, textes: `${c.textes} histoire${c.textes > 1 ? 's' : ''}`, ecriture: 'Tracer, dicter' }[s];
    return h('button', {
      class: 'stage' + (locked ? ' locked' : '') + (stagePassed(u.id, s) ? ' done' : ''), type: 'button',
      onclick: () => (locked ? toast('Réussis l\'étape d\'avant pour ouvrir celle-ci 🔒') : go(`#/lesson/${u.id}/${s}`)),
    },
      h('span', { class: 'st-icon' }, locked ? '🔒' : STAGES[s].icon),
      h('span', { class: 'st-text' }, h('b', {}, STAGES[s].title), h('small', {}, sub)),
      h('span', { class: 'st-stars' }, locked ? '' : stars(info.stars)));
  });
  shell(
    topbar(`Unité ${u.id}`),
    h('main', { class: 'unit', style: `--c:${u.color}` },
      h('div', { class: 'unit-hero' }, h('span', { class: 'u-emoji big' }, u.emoji), h('h2', {}, u.title)),
      letters.length ? h('div', { class: 'new-letters' }, h('small', {}, 'Nouvelles lettres'), h('div', {}, letters.map((l) => h('button', { class: 'nl', type: 'button', onclick: () => play(l) }, l.upper, ' ', l.lower)))) : null,
      h('div', { class: 'stages' }, stageBtns)),
  );
}

// ---------- Séance (leçon ou révision) ----------
export async function lesson(unitId, stage) {
  const u = unitOf(Number(unitId));
  if (!u || !STAGES[stage] || !u.stages.includes(stage)) return go('#/');
  if (!isUnlocked(D.units, u.id, stage)) { toast('Étape verrouillée 🔒'); return go('#/'); }
  const steps = buildStage(u.id, stage);
  await runSession({
    title: `${STAGES[stage].title}`, color: u.color, steps,
    back: '#/unit/' + u.id,
    finish: (score) => {
      const st = setStage(u.id, stage, score);
      return { stars: st, passed: score >= PASS };
    },
    next: () => {
      const nxt = nextStage(D.units);
      return `#/lesson/${nxt.unit}/${nxt.stage}`;
    },
    again: `#/lesson/${u.id}/${stage}`,
  });
}

export async function revision() {
  const steps = buildRevision();
  if (!steps.length) {
    shell(topbar('Révisions'), h('main', { class: 'center' }, mascot(120), h('h2', {}, 'Rien à réviser pour le moment !'), h('p', {}, 'Joue d\'abord une leçon, puis reviens ici.'), h('button', { class: 'btn big primary', type: 'button', onclick: () => go('#/') }, 'Retour')));
    return;
  }
  await runSession({ title: 'Révisions', color: '#7048e8', steps, back: '#/', finish: () => ({ stars: 0, passed: true, review: true }), next: () => '#/', again: '#/revision' });
}

async function runSession({ title, color, steps, back, finish, next, again }) {
  let queue = steps.map((s) => ({ ...s }));
  const total0 = queue.length;
  let scored = 0;
  let okCount = 0;
  let done = 0;
  let aborted = false;
  const bar = h('div', { class: 'bar' }, h('i', {}));
  const area = h('main', { class: 'ex', style: `--c:${color}` });
  const close = h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Quitter', onclick: () => { if (confirm('Quitter la séance ?')) { aborted = true; stop(); go(back); } } }, '✕');
  shell(h('header', { class: 'runner' }, close, bar, mascot(40)), area);
  const mySession = Symbol();
  window.__session = mySession;
  unlockAudio();
  while (queue.length && !aborted && window.__session === mySession) {
    const step = queue.shift();
    area.replaceChildren();
    area.classList.remove('enter');
    void area.offsetWidth;
    area.classList.add('enter');
    window.__pio_step = step;
    let res = null;
    try {
      res = await EX[step.ex]({ area, step });
    } catch (e) {
      console.error('Exercice en erreur', step.ex, e);
      res = null;
    }
    if (aborted || window.__session !== mySession) return;
    if (res === true || res === false) {
      if (!step.retried) { scored += 1; if (res) okCount += 1; }
      if (res === false && !step.retried) queue.push({ ...step, retried: true });
    }
    done += 1;
    bar.firstChild.style.width = `${Math.min(100, (done / (total0 + (done - total0 > 0 ? done - total0 : 0))) * 100)}%`;
    bar.firstChild.style.width = `${Math.min(100, (done / (done + queue.length)) * 100)}%`;
  }
  if (aborted || window.__session !== mySession) return;
  const score = scored ? okCount / scored : 1;
  const r = finish(score);
  sfx.win();
  if (r.passed) confetti();
  const msg = r.review ? 'Bravo pour tes révisions !' : r.passed ? rnd(PRAISE) : 'Encore un essai pour ouvrir la suite !';
  shell(
    h('main', { class: 'result' },
      mascot(130, r.passed ? 'happy' : 'sad'),
      h('h1', {}, msg),
      r.review ? null : h('div', { class: 'big-stars', 'aria-label': `${r.stars} étoiles` }, stars(r.stars)),
      h('p', {}, `${okCount} réussite${okCount > 1 ? 's' : ''} du premier coup sur ${scored}`),
      h('div', { class: 'row' },
        r.passed ? h('button', { class: 'btn big primary', type: 'button', onclick: () => go(next()) }, 'Continuer ➜') : null,
        h('button', { class: 'btn big', type: 'button', onclick: () => { location.hash = again; if (location.hash === again) location.reload(); } }, '↺ Recommencer'),
        h('button', { class: 'btn big', type: 'button', onclick: () => go(back) }, 'Retour'))),
  );
  void title; void sleep; void save;
}

// ---------- Progrès ----------
export function progress() {
  const count = (list, prefix) => {
    const seen = list.filter((x) => state.items[x.id] && state.items[x.id].seen > 0).length;
    const ok = list.filter((x) => mastered(x.id)).length;
    return { seen, ok, total: list.length };
  };
  const rows = [
    ['Lettres et sons', count(D.letters, 'L-')],
    ['Syllabes', count(D.syllables, 'S-')],
    ['Mots', count(D.words, 'W-')],
  ];
  const weak = Object.entries(state.items)
    .filter(([, it]) => it.ko >= 1 && it.box <= 2)
    .sort((a, b) => b[1].ko - a[1].ko)
    .slice(0, 14)
    .map(([id]) => D.byId.get(id))
    .filter(Boolean);
  shell(
    topbar('Mes progrès'),
    h('main', { class: 'progress' },
      h('div', { class: 'stat-row' },
        h('div', { class: 'stat' }, h('b', {}, state.stars), h('small', {}, 'étoiles')),
        h('div', { class: 'stat' }, h('b', {}, state.streak.days), h('small', {}, 'jours de suite')),
        h('div', { class: 'stat' }, h('b', {}, dueCount()), h('small', {}, 'à réviser'))),
      h('h2', { class: 'sect' }, 'Ce que je sais'),
      rows.map(([name, c]) => h('div', { class: 'meter' },
        h('div', { class: 'meter-top' }, h('span', {}, name), h('span', {}, `${c.ok} sus · ${c.seen} vus / ${c.total}`)),
        h('div', { class: 'bar' }, h('i', { style: `width:${(c.seen / c.total) * 100}%` }), h('u', { style: `width:${(c.ok / c.total) * 100}%` })))),
      h('h2', { class: 'sect' }, 'À revoir'),
      weak.length
        ? h('div', { class: 'weak' }, weak.map((it) => h('button', { class: 'nl', type: 'button', onclick: () => play(it) }, it.id.startsWith('L-') ? it.lower : it.content)))
        : h('p', { class: 'muted' }, 'Rien de difficile pour le moment. Bravo !'),
      h('h2', { class: 'sect' }, 'Mes unités'),
      h('div', { class: 'units-prog' }, D.units.map((u) => h('div', { class: 'uprow' },
        h('span', {}, `${u.emoji} ${u.id}. ${u.title}`),
        h('span', { class: 'st' }, stars(Math.min(3, Math.round(unitStars(u) / u.stages.length)))))))),
  );
}

// ---------- Réglages ----------
export function settings() {
  const s = state.settings;
  const name = h('input', { type: 'text', value: state.profile.name, maxlength: 18, placeholder: 'Prénom', class: 'input', 'aria-label': 'Prénom' });
  name.addEventListener('change', () => { setProfile({ name: name.value.trim() }); toast('Prénom enregistré'); });
  const seg = (opts, cur, onPick) => h('div', { class: 'seg' }, opts.map(([v, t]) => h('button', {
    type: 'button', class: 'seg-btn' + (cur === v ? ' active' : ''),
    onclick: (e) => { onPick(v); e.currentTarget.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === e.currentTarget)); },
  }, t)));
  const rate = h('input', { type: 'range', min: 0.5, max: 1.1, step: 0.05, value: s.rate, class: 'range', 'aria-label': 'Vitesse de la voix' });
  rate.addEventListener('input', () => setSettings({ rate: Number(rate.value) }));
  shell(
    topbar('Réglages'),
    h('main', { class: 'settings' },
      h('label', { class: 'field' }, h('span', {}, 'Mon prénom'), name),
      h('div', { class: 'field' }, h('span', {}, 'Mon écriture'), seg([['script', 'Script'], ['cursive', 'Cursive']], s.writing, (v) => setSettings({ writing: v }))),
      h('div', { class: 'field' }, h('span', {}, 'Vitesse de la voix'), rate,
        h('button', { class: 'btn', type: 'button', onclick: () => sayText('Bonjour ! Je suis Pio, le hibou. Lisons ensemble !') }, '🔊 Tester la voix')),
      h('div', { class: 'field' }, h('span', {}, 'Sons de jeu'), seg([[true, 'Oui'], [false, 'Non']], s.sfx, (v) => setSettings({ sfx: v }))),
      hasVoice() ? null : h('p', { class: 'warn' }, "Aucune voix française n'a été trouvée sur cet appareil. Installe une voix française dans les réglages « Synthèse vocale » du téléphone."),
      h('h2', { class: 'sect' }, 'Espace parents'),
      h('div', { class: 'field' }, h('span', {}, 'Parcours'),
        seg([[false, 'Verrouillé'], [true, 'Tout ouvert']], s.unlockAll, (v) => setSettings({ unlockAll: v }))),
      h('button', { class: 'btn danger', type: 'button', onclick: () => {
        if (confirm('Effacer toute la progression ?')) { resetAll(); toast('Progression effacée'); go('#/'); }
      } }, 'Effacer la progression'),
      h('p', { class: 'muted' }, 'Les données restent sur cet appareil. Méthode de lecture originale, inspirée des principes phonétiques et syllabiques classiques.')),
  );
}

// ---------- Premier lancement ----------
export function welcome(done) {
  const name = h('input', { type: 'text', maxlength: 18, placeholder: 'Ton prénom', class: 'input big', 'aria-label': 'Ton prénom' });
  const go1 = () => { setProfile({ name: name.value.trim() }); unlockAudio(); done(); };
  shell(h('main', { class: 'center welcome' },
    mascot(140),
    h('h1', {}, 'Salut ! Je suis Pio.'),
    h('p', {}, 'Je vais t\'aider à apprendre à lire. Comment t\'appelles-tu ?'),
    name,
    h('button', { class: 'btn big primary', type: 'button', onclick: go1 }, 'C\'est parti ! ➜')));
  name.addEventListener('keydown', (e) => { if (e.key === 'Enter') go1(); });
}
