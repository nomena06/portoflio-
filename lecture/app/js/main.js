import { loadData } from './data.js';
import { initAudio } from './audio.js';
import { state } from './store.js';
import { home, unit, lesson, revision, progress, settings, welcome, go } from './screens.js';
import { h, mascot } from './ui.js';

const routes = {
  '': () => home(),
  unit: (id) => unit(id),
  lesson: (u, s) => lesson(u, s),
  revision: () => revision(),
  progress: () => progress(),
  settings: () => settings(),
};

function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const fn = routes[parts[0] || ''];
  if (!fn) return go('#/');
  fn(...parts.slice(1));
}

async function boot() {
  const app = document.getElementById('app');
  app.replaceChildren(h('div', { class: 'center' }, mascot(110), h('p', {}, 'Chargement…')));
  try {
    await Promise.all([loadData(), initAudio()]);
  } catch (e) {
    app.replaceChildren(h('div', { class: 'center' }, h('h2', {}, 'Oups !'), h('p', {}, 'Impossible de charger le contenu : ' + e.message)));
    return;
  }
  window.addEventListener('hashchange', route);
  if (!state.profile.name && !localStorage.getItem('pio-welcomed')) {
    welcome(() => { try { localStorage.setItem('pio-welcomed', '1'); } catch { /* ignore */ } route(); });
  } else {
    route();
  }
  if ('serviceWorker' in navigator && !(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
boot();
