// Audio : fichiers enregistrés (audio/manifest.json) en priorité,
// sinon synthèse vocale native (Android) ou du navigateur.
import { state } from './store.js';

let TTS = null; // plugin Capacitor Text-to-Speech (APK)
try {
  const cap = window.Capacitor;
  if (cap && cap.isNativePlatform && cap.isNativePlatform() && cap.registerPlugin) TTS = cap.registerPlugin('TextToSpeech');
} catch { /* navigateur */ }

let manifest = {};
let voice = null;
let ttsFrench = true; // l'appareil a-t-il une voix française ?
let current = null; // lecture en cours
let ctx = null; // WebAudio pour les effets sonores
let token = 0;

export async function initAudio() {
  try { manifest = await (await fetch('audio/manifest.json')).json(); } catch { manifest = {}; }
  if (TTS) {
    try { ttsFrench = !!(await TTS.isLanguageSupported({ lang: 'fr-FR' })).supported; } catch { ttsFrench = true; }
  }
  if ('speechSynthesis' in window) {
    const pick = () => {
      const vs = speechSynthesis.getVoices();
      voice = vs.find((v) => v.lang === 'fr-FR') || vs.find((v) => v.lang && v.lang.toLowerCase().startsWith('fr')) || null;
    };
    pick();
    speechSynthesis.onvoiceschanged = pick;
  }
}

export const hasVoice = () => (TTS ? ttsFrench : 'speechSynthesis' in window && (!!voice || speechSynthesis.getVoices().length === 0));

export function stop() {
  token++;
  try { if (TTS) TTS.stop(); } catch { /* ignore */ }
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch { /* ignore */ }
  if (current) { try { current.pause(); } catch { /* ignore */ } current = null; }
}

function playFile(path) {
  return new Promise((resolve) => {
    const a = new Audio(path);
    current = a;
    a.onended = () => resolve();
    a.onerror = () => resolve();
    a.play().catch(() => resolve());
  });
}

export function speak(text, { slow = 1 } = {}) {
  stop();
  const my = token;
  const rate = Math.max(0.3, Math.min(1.2, state.settings.rate * slow));
  if (TTS) {
    return TTS.speak({ text, lang: 'fr-FR', rate, pitch: 1.1, volume: 1.0, category: 'ambient', queueStrategy: 0 }).catch(() => {});
  }
  if (!('speechSynthesis' in window)) return Promise.resolve();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    if (voice) u.voice = voice;
    u.rate = rate;
    u.pitch = 1.1;
    let done = false;
    const end = () => { if (!done) { done = true; clearTimeout(t); resolve(); } };
    u.onend = end;
    u.onerror = end;
    const t = setTimeout(end, 1500 + text.length * 140 / rate);
    if (my === token) speechSynthesis.speak(u);
  });
}

// item = élément des données (letters, syllables, words, sentences…)
export function play(item, opts = {}) {
  if (!item) return Promise.resolve();
  if (item.audio && manifest[item.audio]) { stop(); return playFile(item.audio); }
  const slow = item.id && item.id.startsWith('L-') ? 0.8 : 1;
  return speak(item.say || item.content, { slow, ...opts });
}
export const sayText = (t, o) => speak(t, o);

// ---------- effets sonores ----------
function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (C) ctx = new C();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function tone(freq, t0, dur, type = 'sine', vol = 0.12) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, c.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + t0);
  o.stop(c.currentTime + t0 + dur + 0.05);
}
export const sfx = {
  ok() { if (state.settings.sfx) { tone(660, 0, 0.12); tone(880, 0.1, 0.18); } },
  ko() { if (state.settings.sfx) { tone(220, 0, 0.18, 'triangle'); tone(180, 0.14, 0.22, 'triangle'); } },
  pop() { if (state.settings.sfx) tone(520, 0, 0.07, 'square', 0.05); },
  win() { if (state.settings.sfx) [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25)); },
};
export const unlockAudio = () => { ac(); };
