import { subscribeHistory } from './history.js';

const $ = s => document.querySelector(s);
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const watch = h => `watch.html?anime=${encodeURIComponent(h.anime_slug)}&season=${encodeURIComponent(h.season_number || 1)}&ep=${encodeURIComponent(h.episode_number || 1)}`;

let all = [];
function render(items){
  if(items) all = items || [];
  const list = all.filter(h => {
    const q = String($('#search').value || '').toLowerCase().trim();
    return q ? `${h.anime_title || ''} ${h.title || ''}`.toLowerCase().includes(q) : true;
  });
  $('#grid').innerHTML = list.length
    ? list.map(h => `<a class="card" href="${watch(h)}">
        <img class="episode-thumb" src="${esc(h.thumbnail || h.poster || '')}" loading="lazy" alt="${esc(h.anime_title)}">
        <div class="card-body">
          <div class="card-title">${esc(h.anime_title)}</div>
          <div class="card-meta">S${h.season_number} • EP ${h.episode_number}${h.title ? ' • ' + esc(h.title) : ''}</div>
        </div>
      </a>`).join('')
    : '<div class="state">Nothing watched yet. Episodes you play appear here.</div>';
  $('#count').textContent = `${list.length} ${list.length === 1 ? 'episode' : 'episodes'}`;
}

$('#loading').classList.add('hidden');
$('#search').addEventListener('input', () => render());
$('#search').addEventListener('keydown', e => { if(e.key==='Enter') render(); });
$('#searchBtn').addEventListener('click', () => render());
const unsub = subscribeHistory(render);
window.addEventListener('unload', () => unsub && unsub());