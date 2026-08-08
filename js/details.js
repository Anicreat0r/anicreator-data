const $=s=>document.querySelector(s);
const key=new URLSearchParams(location.search).get('anime');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

let anime,seasons=[];

function renderInfo(a){
  const movie=(a.type||'anime')==='movie';
  document.title=`${a.title||'Untitled'} - Anicreator`;
  $('#poster').src=a.poster||'';
  $('#title').textContent=a.title||'Untitled';
  const desc=$('#description');
  const msg=a.description||'No description available.';
  desc.textContent=msg;
  desc.classList.remove('open');
  const btn=$('#seeMore');
  btn.onclick=()=>{
    const open=desc.classList.toggle('open');
    btn.textContent=open?'See less':'See more';
  };
  setTimeout(()=>{
    const clamped=desc.scrollHeight>desc.clientHeight+1;
    btn.classList.toggle('hidden',!clamped);
    btn.textContent='See more';
  },60);
  $('#meta').textContent=movie?'Movie':`${a.status||'Anime'} • ${(a.seasons||[]).length} season(s)`;
  $('#genres').innerHTML=String(a.genres||'').split(/[,|]/).map(x=>x.trim()).filter(Boolean).map(x=>`<span class="chip">${esc(x)}</span>`).join('');
}

function show(){
  const s=seasons[Number($('#season').value)||0];
  const movie=(anime.type||'anime')==='movie';
  $('#heading').textContent=movie?'Movie':'Episodes';
  $('#season').classList.toggle('hidden',movie);
  const eps=[...(s?.episodes||[])].sort((a,b)=>Number(a.episode_number)-Number(b.episode_number));
  $('#episodeGrid').innerHTML=eps.length
    ? eps.map(e=>`<a class="episode" href="watch.html?anime=${encodeURIComponent(anime.slug||anime.id)}&season=${encodeURIComponent(s.season_number)}&ep=${encodeURIComponent(e.episode_number)}"><div class="epno">${movie?'MOVIE':'EPISODE '+e.episode_number}</div><div class="eptitle">${esc(e.title||'Watch')}</div></a>`).join('')
    : '<div class="state">No playable entry available.</div>';
}

async function init(){
  try{
    if(!key)throw Error('No content specified.');
    let r=await fetch(`data/anime/${encodeURIComponent(key)}.json`,{cache:'no-cache'});
    if(r.ok){
      anime=await r.json();
    }else{
      // Episode file is missing (recently-added anime not uploaded yet, or a
      // stale index). Fall back to catalog metadata instead of a dead end.
      const ir=await fetch('data/anime-index.json',{cache:'no-cache'});
      if(ir.ok){
        const found=(await ir.json()||[]).find(a=>(a.slug||a.id)===key);
        if(found){
          anime={...found,seasons:[]};
          renderInfo(found);
          $('#season').innerHTML='';
          $('#loading').classList.add('hidden');
          $('#hero').classList.remove('hidden');
          $('#episodeSection').classList.remove('hidden');
          $('#episodeGrid').innerHTML='<div class="state">Episodes coming soon. Check back later.</div>';
          return;
        }
      }
      throw Error('Content not found.');
    }
    renderInfo(anime);
    seasons=[...(anime.seasons||[])].sort((a,b)=>Number(a.season_number)-Number(b.season_number));
    $('#season').innerHTML=seasons.map((s,i)=>`<option value="${i}">Season ${Number(s.season_number)||1}</option>`).join('');
    $('#season').onchange=show;
    $('#loading').classList.add('hidden');
    $('#hero').classList.remove('hidden');
    $('#episodeSection').classList.remove('hidden');
    show();
  }catch(e){
    $('#loading').classList.add('hidden');
    $('#error').textContent=e.message;
  }
}
init();
