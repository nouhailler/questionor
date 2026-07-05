'use strict';

/* ---------------------------------------------------------------
   La question du jour — PWA (vanilla JS)
   Données statiques + calcul de date déterministe. Pas de backend.
----------------------------------------------------------------*/

const CATS = {
  animaux: { label: 'Animaux',         emoji: '🐰', color: '#F9DBD9', ink: '#9A544F' },
  nature:  { label: 'Nature',          emoji: '🌿', color: '#DCEDD5', ink: '#54744A' },
  ciel:    { label: 'Ciel & espace',   emoji: '🌙', color: '#DCE6F5', ink: '#4E6299' },
  corps:   { label: 'Mon corps',       emoji: '🖐️', color: '#FBE6CC', ink: '#966C36' },
  meteo:   { label: 'Eau & météo',     emoji: '☁️', color: '#D8EFED', ink: '#3B7671' },
  objets:  { label: 'Objets & maison', emoji: '💡', color: '#EAE0F4', ink: '#6F5394' },
  manger:  { label: 'À table',         emoji: '🍓', color: '#F7ECC8', ink: '#86722B' },
  gens:    { label: 'Gens & cœurs',    emoji: '💛', color: '#F6DCE9', ink: '#9C4E77' }
};

const FAVS_KEY = 'qdj-favs';
const EPOCH = new Date(2026, 6, 1); // 1er juillet 2026 = jour 0
const DAY_MS = 86400000;

const state = {
  data: [],
  loading: true,
  tab: 'jour',
  surpriseIdx: null,
  favs: []
};

/* ---------- persistence ---------- */
function loadFavs() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAVS_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : [];
  } catch (e) { return []; }
}
function saveFavs() {
  try { localStorage.setItem(FAVS_KEY, JSON.stringify(state.favs)); } catch (e) {}
}
function toggleFav(idx) {
  const p = state.favs.indexOf(idx);
  if (p >= 0) state.favs.splice(p, 1);
  else state.favs.push(idx);
  saveFavs();
  render();
}

/* ---------- date / selection ---------- */
function dayNum() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((today - EPOCH) / DAY_MS));
}
function idxForDay(d) {
  const n = state.data.length;
  if (!n) return 0;
  const stride = (n % 373 === 0) ? 1 : 373;
  return ((d * stride) % n + n) % n;
}
function dateLabel(d) {
  const dt = new Date(EPOCH.getTime() + d * DAY_MS);
  return dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}
function catFor(q) {
  return CATS[q && q.c] || CATS.animaux;
}

/* ---------- DOM helpers ---------- */
function el(tag, opts, children) {
  const node = document.createElement(tag);
  if (opts) {
    if (opts.class) node.className = opts.class;
    if (opts.text != null) node.textContent = opts.text;
    if (opts.attrs) for (const k in opts.attrs) node.setAttribute(k, opts.attrs[k]);
    if (opts.style) node.setAttribute('style', opts.style);
    if (opts.onClick) node.addEventListener('click', opts.onClick);
    if (opts.aria) for (const k in opts.aria) node.setAttribute('aria-' + k, opts.aria[k]);
  }
  if (children) for (const c of children) if (c) node.appendChild(c);
  return node;
}

function chip(cat, small) {
  const c = el('span', {
    class: 'chip' + (small ? ' chip--sm' : ''),
    style: `background:${cat.color};color:${cat.ink};`
  });
  c.appendChild(el('span', { text: cat.emoji }));
  c.appendChild(el('span', { text: cat.label }));
  return c;
}

function starButton(idx, plain) {
  const isFav = state.favs.indexOf(idx) >= 0;
  return el('button', {
    class: plain ? 'star-btn--plain' : 'star-btn',
    text: isFav ? '⭐' : '☆',
    attrs: { type: 'button', title: isFav ? 'Retirer des préférées' : 'Ajouter aux préférées' },
    aria: { pressed: String(isFav), label: isFav ? 'Retirer des préférées' : 'Ajouter aux préférées' },
    onClick: () => toggleFav(idx)
  });
}

/* ---------- views ---------- */
function viewToday() {
  const isSurprise = state.surpriseIdx !== null;
  const curIdx = isSurprise ? state.surpriseIdx : idxForDay(dayNum());
  const cur = state.data[curIdx] || {};
  const cat = catFor(cur);

  const card = el('div', { class: 'card' });

  // top row
  const top = el('div', { class: 'card__top' }, [
    chip(cat, false),
    starButton(curIdx, false)
  ]);
  card.appendChild(top);

  if (isSurprise) {
    card.appendChild(el('div', { class: 'surprise-eyebrow', text: 'Question surprise' }));
  }

  card.appendChild(el('h2', { class: 'question', text: cur.q || '' }));
  card.appendChild(el('div', { class: 'divider' }));
  card.appendChild(el('div', { class: 'label', text: 'La réponse' }));
  card.appendChild(el('p', { class: 'answer', text: cur.a || '' }));

  // "pour papoter" box
  const box = el('div', { class: 'chat-box', style: `background:${cat.color};` });
  box.appendChild(el('div', {
    class: 'chat-box__label',
    text: 'Pour papoter',
    style: `color:${cat.ink};`
  }));
  box.appendChild(el('div', {
    class: 'chat-box__text',
    text: cur.r || '',
    style: `color:${cat.ink};`
  }));
  card.appendChild(box);

  // actions
  const actions = el('div', { class: 'actions' });
  actions.appendChild(el('button', {
    class: 'btn-primary',
    text: 'Une autre question !',
    attrs: { type: 'button' },
    onClick: () => {
      if (!state.data.length) return;
      let r = Math.floor(Math.random() * state.data.length);
      if (r === curIdx) r = (r + 1) % state.data.length;
      state.surpriseIdx = r;
      render();
    }
  }));
  if (isSurprise) {
    actions.appendChild(el('button', {
      class: 'btn-link',
      text: 'Revenir à la question du jour',
      attrs: { type: 'button' },
      onClick: () => { state.surpriseIdx = null; render(); }
    }));
  }

  return el('div', { class: 'today' }, [card, actions]);
}

function listCard(idx, dLabel) {
  const q = state.data[idx] || {};
  const cat = catFor(q);
  const card = el('div', { class: 'list-card' });

  const head = el('div', { class: 'list-card__head' });
  if (dLabel) head.appendChild(el('div', { class: 'list-card__date', text: dLabel }));
  const meta = el('div', { class: 'list-card__meta' }, [
    chip(cat, true),
    starButton(idx, true)
  ]);
  head.appendChild(meta);
  card.appendChild(head);

  card.appendChild(el('div', { class: 'list-card__q', text: q.q || '' }));
  card.appendChild(el('div', { class: 'list-card__a', text: q.a || '' }));
  return card;
}

function viewPast() {
  const d = dayNum();
  const items = [];
  for (let k = d - 1; k >= 0 && items.length < 30; k--) {
    items.push(listCard(idxForDay(k), dateLabel(k)));
  }
  if (items.length === 0) {
    const box = el('div', { class: 'empty' });
    box.appendChild(document.createTextNode("C'est ton tout premier jour !"));
    box.appendChild(el('br'));
    box.appendChild(document.createTextNode('Les questions passées apparaîtront ici.'));
    return box;
  }
  return el('div', { class: 'list' }, items);
}

function viewFavs() {
  const favs = state.favs.slice().reverse();
  if (favs.length === 0) {
    const box = el('div', { class: 'empty' });
    box.appendChild(document.createTextNode("Touche l'étoile ⭐ sur une question"));
    box.appendChild(el('br'));
    box.appendChild(document.createTextNode('pour la garder ici.'));
    return box;
  }
  return el('div', { class: 'list' }, favs.map((i) => listCard(i, '')));
}

/* ---------- render ---------- */
function render() {
  // header date
  document.getElementById('todayLabel').textContent =
    new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  // tabs active state
  document.querySelectorAll('.tab').forEach((btn) => {
    const active = btn.dataset.tab === state.tab;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  const view = document.getElementById('view');
  view.replaceChildren();

  if (state.loading) {
    view.appendChild(el('div', { class: 'loading', text: 'Je prépare ta question…' }));
  } else if (state.tab === 'jour') {
    view.appendChild(viewToday());
  } else if (state.tab === 'passees') {
    view.appendChild(viewPast());
  } else {
    view.appendChild(viewFavs());
  }

  document.getElementById('footer').textContent =
    state.loading ? '' : state.data.length + ' questions pour grandir';
}

/* ---------- bootstrap ---------- */
function initTabs() {
  document.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.tab = btn.dataset.tab;
      render();
    });
  });
}

function loadData() {
  const files = [];
  for (let i = 1; i <= 16; i++) files.push('data/q' + String(i).padStart(2, '0') + '.json');
  Promise.all(files.map((f) =>
    fetch(f).then((r) => (r.ok ? r.json() : [])).catch(() => [])
  )).then((parts) => {
    state.data = [].concat.apply([], parts);
    state.loading = false;
    render();
  });
}

state.favs = loadFavs();
initTabs();
render();
loadData();

/* ---------- service worker ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
