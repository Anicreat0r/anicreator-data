import { WebsimSocket } from '@websim/websim-socket';

const room = new WebsimSocket();
const col = () => room.collection('history');

let uid = null;
async function currentUserId(){
  if(uid) return uid;
  try{
    const inst = window.websim.getCurrentUser || window.websim.getUser;
    const u = inst ? await inst.call(window.websim) : await window.websim.getUser();
    uid = (u && (u.id || u.user_id)) || 'anon';
  }catch(_){ uid = 'anon'; }
  return uid;
}

function entryId(userId, data){
  return `${userId}|${data.anime_slug}|s${data.season_number}|e${data.episode_number}`;
}

/* record a watch; re-watching bumps it to the top */
export async function addHistory(data){
  try{
    if(!data || !data.anime_slug) return;
    const userId = await currentUserId();
    const id = entryId(userId, data);
    try{ const prev = await col().filter({ id }).getList(); if(prev[0]) await col().delete(id); }catch(_){}
    await col().upsert({ id, user_id: userId,
      anime_slug: data.anime_slug,
      anime_title: data.anime_title || '',
      season_number: data.season_number || 1,
      episode_number: data.episode_number || 1,
      title: data.title || '',
      thumbnail: data.thumbnail || data.poster || '',
      type: data.type || 'anime'
    });
  }catch(_){}
}

export function subscribeHistory(cb){
  return currentUserId().then(() => col().filter({ user_id: uid }).subscribe(cb));
}