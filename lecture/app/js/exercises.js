// Les exercices. Chaque fonction affiche l'exercice dans ctx.area et renvoie
// true / false (réussi du premier coup ou non) ou null (étape sans note).
import { play, sayText, sfx } from './audio.js';
import { D, wordLetters, splitByGraphemes } from './data.js';
import { state, setSettings, record } from './store.js';
import { h, sleep, shuffle, speakable, bounce, mascot, rnd, PRAISE, RETRY } from './ui.js';

const kindOf = (id) => ({ L: 'letter', S: 'syllable', W: 'word', O: 'word', P: 'sentence', T: 'text' }[id[0]]);
const say = (text) => ({ say: text, content: text });
const labelFor = (it) => (it.id.startsWith('L-') ? it.lower : it.content);
const title = (t, sub) => h('div', { class: 'ex-head' }, h('h2', {}, t), sub ? h('p', { class: 'sub' }, sub) : null);

function waitNext(area, label = 'Suivant ➜', disabled = false) {
  return new Promise((resolve) => {
    const b = h('button', { class: 'btn big primary next', type: 'button', disabled, onclick: () => resolve() }, label);
    area.append(b);
    area._next = b;
  });
}

// ---------- briques communes ----------
function chooseUI(area, { head, prompt, choices, cols }) {
  return new Promise((resolve) => {
    let wrong = 0;
    let done = false;
    const grid = h('div', { class: 'choices c' + (cols || Math.min(choices.length, 4)) });
    const buttons = choices.map((c) => {
      const b = h('button', {
        class: 'choice ' + (c.cls || ''), type: 'button', 'data-ok': c.correct ? '1' : null,
        onclick: async () => {
          if (done || b.disabled) return;
          if (c.correct) {
            done = true;
            b.classList.add('right');
            sfx.ok();
            area.querySelector('.mascot-msg')?.replaceChildren(rnd(PRAISE));
            await sleep(650);
            resolve(wrong === 0);
          } else {
            wrong += 1;
            b.classList.add('wrong');
            b.disabled = true;
            sfx.ko();
            area.querySelector('.mascot-msg')?.replaceChildren(rnd(RETRY));
            if (wrong >= 2) {
              done = true;
              buttons.find((x, i) => choices[i].correct)?.classList.add('right');
              await sleep(1100);
              resolve(false);
            }
          }
        },
      }, c.label);
      return b;
    });
    buttons.forEach((b) => grid.append(b));
    area.append(head, prompt, h('div', { class: 'mascot-row' }, mascot(54), h('span', { class: 'mascot-msg' }, '')), grid);
  });
}

// Assemblage par touches : syllabes, lettres, mots d'une phrase…
function assemble(area, { pieces, extras = [], big = false }) {
  return new Promise((resolve) => {
    let wrong = 0;
    const tiles = shuffle([...pieces, ...extras].map((t, i) => ({ t, i })));
    const slotsEl = h('div', { class: 'slots' + (big ? ' big' : '') });
    const poolEl = h('div', { class: 'tiles' + (big ? ' big' : '') });
    const slots = pieces.map(() => ({ tile: null, el: h('button', { class: 'slot', type: 'button', 'aria-label': 'Case vide' }) }));
    slots.forEach((s) => slotsEl.append(s.el));
    const els = new Map();

    const refresh = () => {
      slots.forEach((s) => {
        s.el.textContent = s.tile ? s.tile.t : '';
        s.el.classList.toggle('filled', !!s.tile);
      });
      tiles.forEach((t) => els.get(t).classList.toggle('used', slots.some((s) => s.tile === t)));
    };
    const check = async () => {
      if (slots.some((s) => !s.tile)) return;
      const got = slots.map((s) => s.tile.t);
      if (got.join('\u0001') === pieces.join('\u0001')) {
        sfx.ok();
        slotsEl.classList.add('fuse');
        slots.forEach((s) => s.el.classList.add('right'));
        await sleep(450);
        resolve({ wrong });
      } else {
        wrong += 1;
        sfx.ko();
        slotsEl.classList.add('shake');
        await sleep(520);
        slotsEl.classList.remove('shake');
        slots.forEach((s) => { s.tile = null; });
        refresh();
      }
    };
    tiles.forEach((t) => {
      const b = h('button', {
        class: 'tile', type: 'button', 'data-t': t.t,
        onclick: () => {
          if (b.classList.contains('used')) return;
          const s = slots.find((x) => !x.tile);
          if (!s) return;
          s.tile = t;
          sfx.pop();
          refresh();
          check();
        },
      }, t.t);
      els.set(t, b);
      poolEl.append(b);
    });
    slots.forEach((s) => s.el.addEventListener('click', () => {
      if (!s.tile) return;
      s.tile = null;
      refresh();
    }));
    area.append(slotsEl, poolEl);
  });
}

// ---------- exercices ----------
export const EX = {
  // 1. Découvrir une lettre
  async card_letter({ area, step }) {
    const L = step.item;
    const kw = say(L.keyword);
    const soundBtn = h('button', { class: 'btn sound', type: 'button', onclick: () => play(L) }, '🔊 ', L.sound);
    const big = (cls, txt) => h('button', {
      class: 'bigletter ' + cls, type: 'button',
      onclick: (e) => { bounce(e.currentTarget, 'pop'); play(L); },
    }, txt);
    area.append(
      title('Je découvre'),
      h('div', { class: 'letter-trio' }, big('up', L.upper), big('low', L.lower), big('cursive', L.lower)),
      soundBtn,
      h('div', { class: 'kw' }, h('span', {}, `${L.upper} comme `), speakable(kw, { cls: 'kw-word', text: L.keyword }), h('span', { class: 'kw-img' }, L.image)),
    );
    setTimeout(() => play(L), 350);
    await waitNext(area);
    return null;
  },

  // 2. J'écoute -> je choisis
  async hear_choose({ area, step }) {
    const { target, options } = step;
    const kind = kindOf(target.id);
    const speaker = h('button', { class: 'bigspeaker', type: 'button', 'aria-label': 'Écouter', onclick: () => play(target) }, '🔊');
    const q = kind === 'letter' ? 'Quelle lettre entends-tu ?' : kind === 'syllable' ? 'Quelle syllabe entends-tu ?' : 'Quel mot entends-tu ?';
    setTimeout(() => play(target), 350);
    const ok = await chooseUI(area, {
      head: title(q, 'Appuie sur le haut-parleur pour réécouter'),
      prompt: h('div', { class: 'prompt' }, speaker),
      choices: shuffle(options).map((o) => ({ correct: o.id === target.id, label: labelFor(o), cls: 'k-' + kind })),
    });
    record(target.id, ok);
    return ok;
  },

  // 3. Je vois la lettre -> j'écoute les sons -> je choisis
  async see_choose_sound({ area, step }) {
    const { target, options } = step;
    const opts = shuffle(options);
    let sel = -1;
    let wrong = 0;
    const validate = h('button', { class: 'btn big primary', type: 'button', disabled: true }, 'Valider ✅');
    const btns = opts.map((o, i) => h('button', {
      class: 'choice sound-choice', type: 'button', 'data-ok': o.id === target.id ? '1' : null,
      onclick: () => {
        sel = i;
        btns.forEach((b, j) => b.classList.toggle('sel', j === i));
        validate.disabled = false;
        play(o);
      },
    }, '🔊 ', String(i + 1)));
    area.append(
      title('Quel son fait cette lettre ?', 'Écoute chaque haut-parleur puis choisis'),
      h('div', { class: 'prompt' }, h('div', { class: 'bigletter static' }, target.lower)),
      h('div', { class: 'choices c' + opts.length }, btns),
      validate,
    );
    const ok = await new Promise((resolve) => {
      validate.onclick = async () => {
        if (opts[sel].id === target.id) {
          btns[sel].classList.add('right');
          sfx.ok();
          await sleep(650);
          resolve(wrong === 0);
        } else {
          wrong += 1;
          btns[sel].classList.add('wrong');
          btns[sel].disabled = true;
          validate.disabled = true;
          sfx.ko();
          if (wrong >= 2) {
            btns.forEach((b) => b.dataset.ok && b.classList.add('right'));
            await sleep(1100);
            resolve(false);
          }
        }
      };
    });
    record(target.id, ok);
    return ok;
  },

  // 4. Je combine des lettres pour fabriquer une syllabe
  async build_syllable({ area, step }) {
    const S = step.target;
    const pieces = splitByGraphemes(S.content, S.graphemes);
    area.append(
      title(step.show ? 'Fabrique la syllabe' : 'Écoute et fabrique la syllabe', step.show ? 'Appuie sur les lettres dans l\'ordre' : null),
      h('div', { class: 'prompt' },
        h('button', { class: 'bigspeaker', type: 'button', onclick: () => play(S) }, '🔊'),
        step.show ? h('div', { class: 'model' }, S.content) : null),
    );
    if (!step.show) setTimeout(() => play(S), 350);
    const { wrong } = await assemble(area, { pieces, extras: step.extra || [], big: true });
    await play(S);
    record(S.id, wrong === 0);
    return wrong === 0;
  },

  // 5. Je lis des syllabes / des lettres (je touche pour écouter)
  async read_tap_list({ area, step }) {
    const items = step.items;
    const seen = new Set();
    const next = h('button', { class: 'btn big primary next', type: 'button', disabled: true }, "J'ai tout lu ! ➜");
    const grid = h('div', { class: 'readgrid' }, items.map((it, i) => {
      const b = h('button', {
        class: 'readtile k-' + kindOf(it.id), type: 'button',
        onclick: async () => {
          b.classList.add('speaking');
          seen.add(i);
          b.classList.add('seen');
          if (seen.size === items.length) next.disabled = false;
          await play(it);
          b.classList.remove('speaking');
        },
      }, labelFor(it));
      return b;
    }));
    area.append(title(step.title || 'Je lis', 'Touche chaque case pour écouter'), grid, next);
    await new Promise((r) => { next.onclick = r; });
    return null;
  },

  // 6. Carte-mot : j'écoute, je décompose, je fusionne
  async word_card({ area, step }) {
    const W = step.item;
    let mode = 'syl';
    const view = h('div', { class: 'wc-view' });
    const modeBar = h('div', { class: 'seg' });
    const parts = () => {
      if (mode === 'word') return [{ text: W.content, item: W }];
      if (mode === 'syl') return W.syllables.map((s) => ({ text: s, item: say(s) }));
      return wordLetters(W).map((l) => ({ text: l, item: D.letterByG.get(l) ? D.letterByG.get(l) : say(l) }));
    };
    const render = () => {
      view.replaceChildren();
      view.classList.remove('merged');
      const row = h('div', { class: 'parts m-' + mode }, parts().map((p, i) => h('button', {
        class: 'part', type: 'button', 'data-i': i,
        onclick: async (e) => { const el = e.currentTarget; el.classList.add('on'); await play(p.item); el.classList.remove('on'); },
      }, p.text)));
      view.append(row);
      if (mode === 'syl' && W.syllables.length > 1) {
        view.append(h('div', { class: 'plus' }, W.syllables.map((s) => s.toUpperCase()).join('  +  ')));
      }
      if (mode === 'let') view.append(h('div', { class: 'plus' }, wordLetters(W).map((s) => s.toUpperCase()).join(' + ')));
      modeBar.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.m === mode));
    };
    [['word', 'Mot'], ['syl', 'Syllabes'], ['let', 'Lettres']].forEach(([m, t]) => modeBar.append(h('button', {
      type: 'button', 'data-m': m, class: 'seg-btn', onclick: () => { mode = m; render(); },
    }, t)));
    const fusionBtn = h('button', { class: 'btn fusion', type: 'button', onclick: async () => {
      fusionBtn.disabled = true;
      mode = 'syl';
      render();
      const tiles = [...view.querySelectorAll('.part')];
      for (let i = 0; i < tiles.length; i++) {
        tiles[i].classList.add('on');
        await play(say(W.syllables[i]));
        tiles[i].classList.remove('on');
        await sleep(150);
      }
      view.classList.add('merged');
      await sleep(350);
      await play(W);
      fusionBtn.disabled = false;
    } }, '▶ Fusion');
    area.append(
      title('Je lis le mot'),
      h('div', { class: 'wc-img' }, W.image || '📝'),
      modeBar, view,
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => play(W) }, '🔊 Écouter le mot'), fusionBtn),
    );
    render();
    setTimeout(() => play(W), 350);
    await waitNext(area);
    return null;
  },

  // 7. Je reconstruis un mot avec ses syllabes
  async build_word({ area, step }) {
    const W = step.target;
    const pieces = W.syllables.length > 1 ? W.syllables.map((s) => s.toLowerCase()) : wordLetters(W);
    area.append(
      title('Reconstruis le mot', 'Écoute, regarde l\'image et appuie dans l\'ordre'),
      h('div', { class: 'prompt' },
        h('button', { class: 'bigspeaker', type: 'button', onclick: () => play(W) }, '🔊'),
        h('div', { class: 'wc-img small' }, W.image || '❔')),
    );
    setTimeout(() => play(W), 350);
    const { wrong } = await assemble(area, { pieces, extras: step.extra || [] });
    await play(W);
    record(W.id, wrong === 0);
    return wrong === 0;
  },

  // 8. Mot -> image
  async word_image_choose({ area, step }) {
    const { target, options } = step;
    const ok = await chooseUI(area, {
      head: title('Quelle image correspond au mot ?'),
      prompt: h('div', { class: 'prompt' }, speakable(target, { cls: 'bigword', text: target.content })),
      choices: shuffle(options).map((o) => ({ correct: o.id === target.id, label: o.image, cls: 'k-img' })),
      cols: Math.min(options.length, 4),
    });
    record(target.id, ok);
    return ok;
  },

  // 9. Mots à retenir (mots-outils)
  async outil_card({ area, step }) {
    const seen = new Set();
    const next = h('button', { class: 'btn big primary next', type: 'button', disabled: true }, 'Je les connais ➜');
    area.append(
      title('Mots à retenir', 'Ces mots se lisent tout de suite. Touche-les !'),
      h('div', { class: 'readgrid' }, step.items.map((o, i) => h('button', {
        class: 'readtile k-word', type: 'button',
        onclick: async (e) => {
          const el = e.currentTarget;
          el.classList.add('seen', 'speaking');
          seen.add(i);
          if (seen.size === step.items.length) next.disabled = false;
          await play(o);
          el.classList.remove('speaking');
        },
      }, o.content))),
      next,
    );
    await new Promise((r) => { next.onclick = r; });
    return null;
  },

  // 10. Phrase décomposable
  async sentence_card({ area, step }) {
    const P = step.item;
    const chips = sentenceChips(P.content);
    const line = h('div', { class: 'sentence' }, chips.map((c) => c.el));
    area.append(
      title('Je lis la phrase', 'Touche un mot, ou la phrase entière'),
      line,
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: async (e) => {
        const b = e.currentTarget;
        b.disabled = true;
        await readAloud(P, chips);
        b.disabled = false;
      } }, '▶ Lire la phrase')),
    );
    setTimeout(() => readAloud(P, chips), 350);
    await waitNext(area);
    return null;
  },

  // 11. Je remets les mots dans l'ordre
  async sentence_order({ area, step }) {
    const P = step.item;
    const end = P.content.trim().slice(-1);
    area.append(
      title(step.dictation ? 'Dictée de phrase' : 'Remets les mots dans l\'ordre', 'Écoute la phrase'),
      h('div', { class: 'prompt' }, h('button', { class: 'bigspeaker', type: 'button', onclick: () => play(P) }, '🔊')),
    );
    setTimeout(() => play(P), 350);
    const { wrong } = await assemble(area, { pieces: P.words });
    area.append(h('div', { class: 'endmark' }, /[.!?]/.test(end) ? end : ''));
    await play(P);
    record(P.id, wrong === 0);
    return wrong === 0;
  },

  // 12. J'écoute une phrase -> je choisis la bonne
  async sentence_hear_choose({ area, step }) {
    const { target, options } = step;
    setTimeout(() => play(target), 350);
    const ok = await chooseUI(area, {
      head: title('Quelle phrase entends-tu ?'),
      prompt: h('div', { class: 'prompt' }, h('button', { class: 'bigspeaker', type: 'button', onclick: () => play(target) }, '🔊')),
      choices: shuffle(options).map((o) => ({ correct: o.id === target.id, label: o.content, cls: 'k-sentence' })),
      cols: 1,
    });
    record(target.id, ok);
    return ok;
  },

  // 13. Lire un petit texte
  async text_read({ area, step }) {
    const T = step.item;
    const rows = T.sentences.map((s) => {
      const chips = sentenceChips(s);
      const row = h('div', { class: 'trow' },
        h('button', { class: 'tspk', type: 'button', 'aria-label': 'Écouter la phrase', onclick: () => readAloud(say(s), chips, row) }, '🔊'),
        h('div', { class: 'sentence' }, chips.map((c) => c.el)));
      return { s, chips, row };
    });
    const allBtn = h('button', { class: 'btn', type: 'button', onclick: async () => {
      allBtn.disabled = true;
      for (const r of rows) await readAloud(say(r.s), r.chips, r.row);
      allBtn.disabled = false;
    } }, '▶ Tout lire');
    area.append(
      title(T.title, 'Lis le texte, touche les mots pour les entendre'),
      h('div', { class: 'wc-img small' }, T.image),
      h('div', { class: 'text' }, rows.map((r) => r.row)),
      allBtn,
    );
    await waitNext(area, "J'ai lu le texte ➜");
    return null;
  },

  // 14. Compréhension
  async text_quiz({ area, step }) {
    const { text, q } = step;
    const ok = await chooseUI(area, {
      head: title('Je réponds'),
      prompt: h('div', { class: 'prompt q' },
        h('button', { class: 'bigspeaker small', type: 'button', onclick: () => sayText(q.q) }, '🔊'),
        h('div', { class: 'question' }, q.q)),
      choices: q.choices.map((c, i) => ({ correct: i === q.a, label: c, cls: 'k-sentence' })),
      cols: 1,
    });
    record(text.id, ok);
    return ok;
  },

  // 15. Association texte / image
  async text_image({ area, step }) {
    const { text, options } = step;
    const ok = await chooseUI(area, {
      head: title('Quelle image va avec le texte ?', text.title),
      prompt: h('div', { class: 'prompt' }, h('button', { class: 'btn', type: 'button', onclick: () => sayText(text.sentences.join(' ')) }, '🔊 Réécouter le texte')),
      choices: shuffle(options).map((o) => ({ correct: o === text.image, label: o, cls: 'k-img' })),
      cols: Math.min(options.length, 4),
    });
    record(text.id, ok);
    return ok;
  },

  // 16. Remettre les phrases du texte dans l'ordre
  async text_order({ area, step }) {
    const T = step.text;
    area.append(title("Remets l'histoire dans l'ordre", T.title));
    const { wrong } = await assemble(area, { pieces: T.sentences });
    record(T.id, wrong === 0);
    return wrong === 0;
  },

  // 17. Écriture au doigt
  async trace({ area, step }) {
    const it = step.item;
    const txt = it.id.startsWith('L-') ? it.lower : it.content.toLowerCase();
    const W = Math.min(340, Math.max(240, area.clientWidth - 24 || 320));
    const H = 250;
    const dpr = window.devicePixelRatio || 1;
    const canvas = h('canvas', { class: 'trace', width: W * dpr, height: H * dpr, style: `width:${W}px;height:${H}px` });
    const g = canvas.getContext('2d');
    g.scale(dpr, dpr);
    const user = document.createElement('canvas');
    user.width = W; user.height = H;
    const ug = user.getContext('2d');
    const family = () => (state.settings.writing === 'cursive' ? "'Playwrite FR', cursive" : "'Andika', sans-serif");
    let size = 170;
    const fit = () => {
      size = 190;
      g.font = `${size}px ${family()}`;
      const w = g.measureText(txt).width;
      if (w > W * 0.86) size = Math.floor(size * (W * 0.86) / w);
    };
    const setFont = (c) => { c.font = `${size}px ${family()}`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; };
    const base = Math.round(H * 0.68);
    const drawGuide = () => {
      g.clearRect(0, 0, W, H);
      g.strokeStyle = '#cdd6f4'; g.lineWidth = 2; g.setLineDash([]);
      [base - size * 0.72, base].forEach((y) => { g.beginPath(); g.moveTo(8, y); g.lineTo(W - 8, y); g.stroke(); });
      g.setLineDash([5, 6]);
      g.beginPath(); g.moveTo(8, base - size * 0.36); g.lineTo(W - 8, base - size * 0.36); g.stroke();
      g.setLineDash([]);
      setFont(g);
      g.fillStyle = '#dbe4ff';
      g.fillText(txt, W / 2, base);
      g.strokeStyle = '#5c7cfa'; g.lineWidth = 2; g.setLineDash([4, 5]);
      g.strokeText(txt, W / 2, base);
      g.setLineDash([]);
      g.drawImage(user, 0, 0, W, H, 0, 0, W, H);
    };
    const start = async () => {
      try { await Promise.race([document.fonts.load(`190px ${family()}`, txt), sleep(1200)]); } catch { /* police système */ }
      fit();
      drawGuide();
    };
    let last = null;
    let touched = false;
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) }; };
    canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); last = pos(e); touched = true; seg(last, last); });
    canvas.addEventListener('pointermove', (e) => { if (!last) return; const p = pos(e); seg(last, p); last = p; });
    ['pointerup', 'pointercancel'].forEach((ev) => canvas.addEventListener(ev, () => { last = null; }));
    const seg = (a, b) => {
      ug.strokeStyle = '#ff6b6b'; ug.lineWidth = 17; ug.lineCap = 'round'; ug.lineJoin = 'round';
      ug.beginPath(); ug.moveTo(a.x, a.y); ug.lineTo(b.x, b.y); ug.stroke();
      drawGuide();
    };
    const evaluate = () => {
      const m = document.createElement('canvas'); m.width = W; m.height = H;
      const mg = m.getContext('2d');
      setFont(mg);
      mg.fillStyle = '#000'; mg.fillText(txt, W / 2, base);
      const thin = mg.getImageData(0, 0, W, H).data;
      mg.lineWidth = 34; mg.lineJoin = 'round'; mg.strokeStyle = '#000'; mg.strokeText(txt, W / 2, base);
      const thick = mg.getImageData(0, 0, W, H).data;
      const u = ug.getImageData(0, 0, W, H).data;
      let mask = 0, hit = 0, ink = 0, stray = 0;
      for (let i = 3; i < u.length; i += 4) {
        const isMask = thin[i] > 40;
        const isInk = u[i] > 40;
        if (isMask) { mask++; if (isInk) hit++; }
        if (isInk) { ink++; if (thick[i] < 40) stray++; }
      }
      return { cover: mask ? hit / mask : 0, stray: ink ? stray / ink : 1, ink };
    };
    const msg = h('p', { class: 'trace-msg' }, 'Repasse sur la lettre avec ton doigt');
    const writing = h('div', { class: 'seg' }, [['script', 'Script'], ['cursive', 'Cursive']].map(([m, t]) => h('button', {
      type: 'button', class: 'seg-btn' + (state.settings.writing === m ? ' active' : ''),
      onclick: async (e) => {
        setSettings({ writing: m });
        writing.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === e.currentTarget));
        await start();
      },
    }, t)));
    const clear = h('button', { class: 'btn', type: 'button', onclick: () => { ug.clearRect(0, 0, W, H); touched = false; drawGuide(); msg.textContent = 'On recommence !'; } }, '↺ Recommencer');
    const ok = h('button', { class: 'btn primary', type: 'button' }, 'Valider ✅');
    area.append(
      title('J\'écris', 'Choisis ton écriture'),
      writing,
      h('div', { class: 'prompt' }, h('button', { class: 'bigspeaker small', type: 'button', onclick: () => play(it) }, '🔊')),
      h('div', { class: 'canvas-wrap' }, canvas),
      msg,
      h('div', { class: 'row' }, clear, ok),
    );
    await start();
    let tries = 0;
    await new Promise((resolve) => {
      ok.onclick = async () => {
        if (!touched) { msg.textContent = 'Écris avec ton doigt sur la lettre.'; return; }
        const r = evaluate();
        tries += 1;
        if (r.cover >= 0.5 && r.stray <= 0.45) {
          sfx.ok(); msg.textContent = rnd(PRAISE); await sleep(700); resolve();
        } else if (tries >= 3) {
          sfx.ok(); msg.textContent = 'Bien essayé ! Continue de t\'entraîner.'; await sleep(900); resolve();
        } else {
          sfx.ko(); msg.textContent = r.cover < 0.5 ? 'Repasse bien sur toute la lettre.' : 'Reste sur le modèle.';
        }
      };
    });
    return null;
  },

  // 18. Dictée : j'écoute -> je choisis les syllabes -> j'écris les lettres
  async dictee({ area, step }) {
    const W = step.item;
    const low = W.content.toLowerCase();
    const sylPieces = W.syllables.map((s) => s.toLowerCase());
    area.append(
      title("J'écoute, j'écris", 'Étape 1 : les syllabes'),
      h('div', { class: 'prompt' }, h('button', { class: 'bigspeaker', type: 'button', onclick: () => play(W) }, '🔊')),
    );
    setTimeout(() => play(W), 350);
    let wrong = 0;
    if (sylPieces.length > 1) {
      wrong += (await assemble(area, { pieces: sylPieces, extras: step.extraSyl || [] })).wrong;
      await sleep(200);
    }
    area.replaceChildren(
      title("J'écoute, j'écris", sylPieces.length > 1 ? 'Étape 2 : écris le mot lettre par lettre' : 'Écris le mot lettre par lettre'),
      h('div', { class: 'prompt' }, h('button', { class: 'bigspeaker', type: 'button', onclick: () => play(W) }, '🔊')),
    );
    wrong += (await assemble(area, { pieces: wordLetters(W), extras: step.extraLet || [], big: true })).wrong;
    area.append(h('div', { class: 'endmark' }, W.content));
    await play(W);
    void low;
    record(W.id, wrong === 0);
    return wrong === 0;
  },
};

// ---------- phrases cliquables ----------
function sentenceChips(content) {
  const out = [];
  let prev = null;
  for (const raw of content.split(' ')) {
    const word = raw.replace(/[.,!?;:]/g, '');
    if (!word) {
      if (prev) prev.el.append(h('span', { class: 'punct' }, ' ' + raw));
      continue;
    }
    const punct = raw.slice(word.length);
    const el = h('button', {
      class: 'chip', type: 'button',
      onclick: async () => { el.classList.add('speaking'); await play(say(word)); el.classList.remove('speaking'); },
    }, h('span', {}, word), punct ? h('span', { class: 'punct' }, punct) : null);
    const c = { el, word };
    out.push(c);
    prev = c;
  }
  return out;
}
async function readAloud(item, chips, row) {
  row?.classList.add('reading');
  const per = 520 / Math.max(0.5, state.settings.rate);
  const p = play(item);
  for (const c of chips) {
    c.el.classList.add('hl');
    await sleep(per);
    c.el.classList.remove('hl');
  }
  await p;
  row?.classList.remove('reading');
}
