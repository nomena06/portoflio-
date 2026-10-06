// Petits utilitaires d'interface.
import { play, sfx } from './audio.js';

export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === false || v == null) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const shuffle = (a) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};
export const sample = (a, n) => shuffle(a).slice(0, n);
export const uniq = (a, key = (x) => x) => {
  const seen = new Set();
  return a.filter((x) => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; });
};

// Élément cliquable qui se prononce : lettre, syllabe, mot, phrase.
export function speakable(item, { tag = 'button', cls = '', label, text } = {}) {
  const el = h(tag, {
    class: 'spk ' + cls,
    type: tag === 'button' ? 'button' : null,
    'aria-label': 'Écouter ' + (text || item.content),
    onclick: async (e) => {
      e.stopPropagation();
      el.classList.add('speaking');
      sfx.pop();
      await play(item);
      el.classList.remove('speaking');
    },
  }, label ?? text ?? item.content);
  return el;
}

export function bounce(el, cls = 'pulse') {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

export function confetti(n = 46) {
  const colors = ['#ff6b6b', '#ffd43b', '#51cf66', '#4dabf7', '#9775fa', '#ff922b'];
  const root = h('div', { class: 'confetti', 'aria-hidden': 'true' });
  for (let i = 0; i < n; i++) {
    root.append(h('i', {
      style: `left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * 0.6}s;animation-duration:${1.6 + Math.random() * 1.4}s;transform:rotate(${Math.random() * 360}deg)`,
    }));
  }
  document.body.append(root);
  setTimeout(() => root.remove(), 3400);
}

let toastTimer;
export function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// Mascotte "Pio" (illustration originale).
export function mascot(size = 96, mood = 'happy') {
  const mouth = mood === 'sad'
    ? '<path d="M44 66 q6 -5 12 0" fill="none" stroke="#7a4a1d" stroke-width="2.5" stroke-linecap="round"/>'
    : '';
  const brows = mood === 'sad' ? '<path d="M30 34 l10 4 M70 34 l-10 4" stroke="#5c3a14" stroke-width="3" stroke-linecap="round"/>' : '';
  return h('span', {
    class: 'mascot', role: 'img', 'aria-label': 'Pio le hibou', html:
    `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">
      <path d="M22 28 L30 10 L42 24 Z M78 28 L70 10 L58 24 Z" fill="#8a5a2b"/>
      <ellipse cx="50" cy="58" rx="34" ry="36" fill="#a8723a"/>
      <ellipse cx="50" cy="66" rx="22" ry="24" fill="#f6dfb4"/>
      <path d="M38 62 q6 5 12 0 q6 5 12 0 M38 72 q6 5 12 0 q6 5 12 0" fill="none" stroke="#d9b87a" stroke-width="2" stroke-linecap="round"/>
      <circle cx="36" cy="42" r="14" fill="#fff"/><circle cx="64" cy="42" r="14" fill="#fff"/>
      <circle cx="36" cy="43" r="7" fill="#2b2118" class="pupil"/><circle cx="64" cy="43" r="7" fill="#2b2118" class="pupil"/>
      <circle cx="38.5" cy="40.5" r="2.4" fill="#fff"/><circle cx="66.5" cy="40.5" r="2.4" fill="#fff"/>
      <path d="M45 52 L55 52 L50 62 Z" fill="#ff9f1c"/>
      ${mouth}${brows}
      <path d="M16 56 q-6 18 8 28 q2 -14 -8 -28 Z M84 56 q6 18 -8 28 q-2 -14 8 -28 Z" fill="#8a5a2b"/>
      <path d="M40 92 l-4 6 M60 92 l4 6 M44 92 l-1 6 M56 92 l1 6" stroke="#ff9f1c" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  });
}

export const PRAISE = ['Bravo !', 'Super !', 'Génial !', 'Bien joué !', 'Excellent !', "Tu y es arrivé(e) !", 'Magnifique !'];
export const RETRY = ['Écoute encore.', 'Essaie encore !', 'Presque !', 'Regarde bien.'];
export const rnd = (a) => a[Math.floor(Math.random() * a.length)];
