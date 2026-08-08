const $=s=>document.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const watch=e=>`watch.html?anime=${encodeURIComponent(e.anime_slug)}&season=${encodeURIComponent(e.season_number||1)}&ep=${encodeURIComponent(e.episode_number||1)}`;
const details=e=>`anime-details.html?anime=${encodeURIComponent(e.slug||e.id)}`;
function latestCard(a){
  const movie=(a.type||'anime').toLowerCase()==='movie';
  const slug=a.anime_slug||a.slug;
  const title=a.anime_title||a.title;
  const status=a.status||(movie?'Movie':'Anime');
  return `<a class="card" href="anime-details.html?anime=${encodeURIComponent(slug)}">
    <img class="cover" src="${esc(a.poster||'')}" loading="lazy" alt="${esc(title)}" onerror="this.style.visibility='hidden'">
    <div class="card-body">
      <div class="card-title">${esc(title)}</div>
      <div class="card-meta">${movie?'Movie':esc(status)}</div>
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
  $('#random').innerHTML=shuffled.map(episodeCard).join('')||'<div class="state">No random episodes available.</div>';
}
function setHero(item){
  if(!item)return;
  const bg=item.banner||item.poster||'';
  if(bg)$('#hero').style.backgroundImage=`linear-gradient(rgba(8,8,13,.65),rgba(8,8,13,.85)),url(${JSON.stringify(esc(bg))})`;
  $('#heroTitle').textContent=item.title||'Watch Anime & Movies';
  const p=$('#heroDesc');
  p.textContent=item.description||'Latest updates and random episodes.';
  p.classList.remove('open');
  let btn=p.parentElement.querySelector('.see-more');
  if(!btn){
    btn=document.createElement('button');
    btn.className='see-more';
    btn.textContent='See more';
    p.parentElement.insertBefore(btn,p.nextSibling);
  }
  btn.onclick=()=>{
    const open=p.classList.toggle('open');
    btn.textContent=open?'See less':'See more';
  };
  setTimeout(()=>{
    const clamped=p.scrollHeight>p.clientHeight+1;
    btn.classList.toggle('hidden',!clamped);
    btn.textContent=p.classList.contains('open')?'See less':'See more';
  },60);
}
async function init(){
  try{
    const idxR=await fetch('data/anime-index.json',{cache:'no-cache'});
    if(!idxR.ok)throw Error('Could not load anime-index.json');
    const index=await idxR.json();
    // Latest Updates: every title in the catalog (anime + movies), newest first.
    $('#latest').innerHTML=index.slice(0,6).map(latestCard).join('')||'<div class="state">No latest updates yet.</div>';
    // Hero banner from the newest entry.
    setHero(index[0]);
    // Random Episodes: build a pool of every playable episode across the catalog.
    const loadOne=async a=>{
      const url=`data/anime/${encodeURIComponent(a.slug||a.id)}.json`;
      let d=null;
      for(let attempt=0;attempt<3;attempt++){
        try{
          const r=await fetch(url,{cache:'reload'});
          if(r.ok){d=await r.json();break;}
        }catch(err){/* keep trying */}
        if(attempt<2)await new Promise(res=>setTimeout(res,200*Math.pow(2,attempt)));
      }
      if(!d)return [];
      const eps=[];
      for(const s of (d.seasons||[])){
        for(const e of (s.episodes||[])){
          eps.push({anime_slug:d.slug||d.id,anime_title:d.title,season:s.season_number||1,episode_number:e.episode_number||1,title:e.title||'',thumbnail:e.thumbnail||d.poster,poster:d.poster});
        }
      }
      return eps;
    };
    pool=(await Promise.all(index.map(loadOne))).flat();
    shuffleRandom();
  }catch(e){
    $('#latest').innerHTML='';
    $('#random').innerHTML=`<div class="state error">${esc(e.message)}</div>`;
  }
}
$('#shuffle').onclick=shuffleRandom;
init();