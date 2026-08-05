const $=s=>document.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const watch=e=>`watch.html?anime=${encodeURIComponent(e.anime_slug)}&season=${encodeURIComponent(e.season_number||1)}&ep=${encodeURIComponent(e.episode_number||1)}`;
const details=e=>`anime-details.html?anime=${encodeURIComponent(e.slug||e.id)}`;
function latestCard(a){
  const movie=(a.type||'anime').toLowerCase()==='movie';
  return `<a class="card" href="${details(a)}">
    <img class="cover" src="${esc(a.poster||'')}" loading="lazy" alt="${esc(a.title||'')}" onerror="this.style.visibility='hidden'">
    <div class="card-body">
      <div class="card-title">${esc(a.title||'Untitled')}</div>
      <div class="card-meta">${movie?'Movie':esc(a.status||'Anime')}</div>
      <span class="card-badge">${movie?'MOVIE':'ANIME'}</span>
    </div>
  </a>`;
}
function episodeCard(e){
  return `<a class="card" href="${watch(e)}">
    <img class="episode-thumb" src="${esc(e.thumbnail||e.poster||'')}" loading="lazy" alt="${esc(e.anime_title)}">
    <div class="card-body">
      <div class="card-title">${esc(e.anime_title)}</div>
      <div class="card-meta">S${e.season_number} • EP ${e.episode_number}${e.title?' • '+esc(e.title):''}</div>
    </div>
  </a>`;
}
let pool=[];
function shuffleRandom(){
  const shuffled=pool.slice().sort(()=>Math.random()-.5);
  $('#random').innerHTML=shuffled.slice(0,12).map(episodeCard).join('')||'<div class="state">No random episodes available.</div>';
}
async function init(){
  try{
    const r=await fetch('data/home.json',{cache:'no-cache'});
    if(!r.ok)throw Error('Could not load home.json');
    const d=await r.json();
    // Latest Updates contains ONLY anime/movie cards, never individual episodes.
    $('#latest').innerHTML=(d.latest||[]).slice(0,12).map(latestCard).join('')||'<div class="state">No latest updates yet.</div>';
    // Shuffle immediately on the first load.
    pool=d.random||[];
    shuffleRandom();
  }catch(e){
    $('#latest').innerHTML='';
    $('#random').innerHTML=`<div class="state error">${esc(e.message)}</div>`;
  }
}
$('#shuffle').onclick=shuffleRandom;
$('#globalSearch').onkeydown=e=>{if(e.key==='Enter'&&e.target.value.trim())location.href=`anime.html?q=${encodeURIComponent(e.target.value.trim())}`};
init();