const $=s=>document.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

let all=[];
const requestedType=String(window.CONTENT_TYPE||'anime').trim().toLowerCase();

function normalizedType(item){
  const t=String(item?.type||'').trim().toLowerCase();
  return t==='movie' ? 'movie' : 'anime';
}

function filtered(q){
  q=String(q||'').toLowerCase().trim();
  return all.filter(a=>
    `${a.title||''} ${a.genres||''} ${a.tags||''}`.toLowerCase().includes(q)
  );
}

function render(list){
  $('#grid').innerHTML=list.length
    ? list.map(a=>{
        const movie=normalizedType(a)==='movie';
        return `<a class="card" href="anime-details.html?anime=${encodeURIComponent(a.slug||a.id)}">
          <img class="cover" src="${esc(a.poster||'')}" loading="lazy" alt="${esc(a.title||'')}" onerror="this.style.visibility='hidden'">
          <div class="card-body">
            <div class="card-title">${esc(a.title||'Untitled')}</div>
            <div class="card-meta">${movie?'Movie':esc(a.status||'Anime')}</div>
          </div>
        </a>`;
      }).join('')
    : '<div class="state">Nothing found.</div>';

  $('#count').textContent=`${list.length} ${requestedType==='movie'?'movies':'anime'}`;
}

function setHero(item){
  if(!item)return;
  const hero=$('#hero');
  if(!hero)return;
  const bg=item.banner||item.poster||'';
  if(!bg)return;
  hero.style.backgroundImage=`linear-gradient(rgba(8,8,13,.65),rgba(8,8,13,.85)),url(${JSON.stringify(esc(bg))})`;
  hero.style.backgroundSize='cover';
  hero.style.backgroundPosition='center';
  const h1=$('#heroTitle');
  if(h1)h1.textContent=item.title||'';
  const p=$('#heroDesc');
  if(p)p.textContent=item.description||'';
}

async function init(){
  try{
    const r=await fetch('data/anime-index.json?v=20260805',{cache:'no-cache'});
    if(!r.ok)throw Error('Could not load anime-index.json');

    const raw=await r.json();
    const index=Array.isArray(raw)?raw:[];

    // Normalize the type before filtering.
    all=index.filter(a=>normalizedType(a)===requestedType);

    // Keep newest/current entries first.
    all=all.slice().reverse();

    setHero(all[0]);

    const q=new URLSearchParams(location.search).get('q')||'';
    $('#search').value=q;

    $('#loading').classList.add('hidden');
    render(filtered(q));
  }catch(e){
    $('#loading').classList.add('hidden');
    $('#error').textContent=e.message;
  }
}

$('#search').oninput=e=>render(filtered(e.target.value));
$('#search').onkeydown=e=>{if(e.key==='Enter')render(filtered(e.target.value))};
$('#searchBtn').onclick=()=>render(filtered($('#search').value));
init();
