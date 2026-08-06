import { toggleBookmark, subscribeBookmarks } from './bookmark.js';

const $ = s => document.querySelector(s);
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const watch = b => `watch.html?anime=${encodeURIComponent(b.anime_slug)}&season=${encodeURIComponent(b.season_number || 1)}&ep=${encodeURIComponent(b.episode_number || 1)}`;

let list = [];
let all = [];

function card(b){
  return `<div class="card bmk-card">
    <a class="bmk-link" href="${watch(b)}">
      <img class="episode-thumb" src="${esc(b.thumbnail || b.poster || '')}" loading="lazy" alt="${esc(b.anime_title)}">
      <div class="card-body">
        <div class="card-title">${esc(b.anime_title)}</div>
        <div class="card-meta">S${b.season_number} • EP ${b.episode_number}${b.title ? ' • ' + esc(b.title) : ''}</div>
      </div>
    </a>
    <button class="bmk-remove" title="Remove from bookmarks">✕</button>
  </div>`;
}

function render(items){
  all = list = items || [];
  const q = String($('#search').value || '').toLowerCase().trim();
  list = all.filter(b => `${b.anime_title || ''} ${b.title || ''}`.toLowerCase().includes(q));
  $('#grid').innerHTML = list.length
    ? list.map((b, i) => card(b).replace('class="bmk-remove"', `class="bmk-remove" data-idx="${i}"`)).join('')
    : '<div class="state">No bookmarks yet. Hit ★ on any episode to save it.</div>';
  $('#count').textContent = `${list.length} ${list.length === 1 ? 'saved episode' : 'saved episodes'}`;
}

$('#grid').addEventListener('click', async function(e){
  const btn = e.target.closest('.bmk-remove');
  if(!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const item = list[Number(btn.dataset.idx)];
  if(!item) return;
  btn.disabled = true;
  const now = await toggleBookmark(item);
  if(now === false) render(list.filter((_, i) => i !== Number(btn.dataset.idx)));
  else btn.disabled = false;
});

$('#loading').classList.add('hidden');
$('#search').addEventListener('input', () => render(all));
$('#search').addEventListener('keydown', e => { if(e.key==='Enter') render(all); });
$('#searchBtn').addEventListener('click', () => render(all));
const unsub = subscribeBookmarks(render);
window.addEventListener('unload', () => unsub && unsub());