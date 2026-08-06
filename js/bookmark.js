import { WebsimSocket } from '@websim/websim-socket';

export const room = new WebsimSocket();

let uid = null;
export async function currentUserId(){
  if(uid) return uid;
  try{
    const inst = window.websim.getCurrentUser || window.websim.getUser;
    const u = inst ? await inst.call(window.websim) : await window.websim.getUser();
    uid = (u && (u.id || u.user_id)) || 'anon';
  }catch(_){ uid = 'anon'; }
  return uid;
}

const col = () => room.collection('bookmark');

export function bookmarkId(userId, data){
  return `${userId}|${data.anime_slug}|s${data.season_number}|e${data.episode_number}`;
}

export async function isBookmarked(data){
  try{
    if(!data) return false;
    const id = bookmarkId(await currentUserId(), data);
    const list = await col().filter({ id }).getList();
    return !!list[0];
  }catch(_){ return false; }
}

/* returns true if now bookmarked, false if unbookmarked, null on error */
export async function toggleBookmark(data){
  try{
    const userId = await currentUserId();
    const id = bookmarkId(userId, data);
    const saved = await isBookmarked(data);
    if(saved){
      await col().delete(id);
      return false;
    }
    await col().upsert({ id, user_id: userId, ...data });
    return true;
  }catch(_){ return null; }
}

export function savedBookmarks(){
  return currentUserId().then(userId => col().filter({ user_id: userId }).getList());
}

export function subscribeBookmarks(cb){
  return currentUserId().then(() => col().filter({ user_id: uid }).subscribe(cb));
}