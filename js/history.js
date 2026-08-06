// history.js
// Cloudflare / Static Site version using localStorage

const STORAGE_KEY = "anicreator_history";

/* ---------- Helpers ---------- */

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function entryId(data) {
  return `${data.anime_slug}|s${data.season_number}|e${data.episode_number}`;
}

/* ---------- Compatibility ---------- */

export async function currentUserId() {
  return "local-user";
}

/* ---------- API ---------- */

export async function addHistory(data) {

  if (!data || !data.anime_slug) return;

  let list = getHistory();

  const id = entryId(data);

  // Remove previous occurrence
  list = list.filter(item => item.id !== id);

  // Add newest to top
  list.unshift({
    id,
    anime_slug: data.anime_slug,
    anime_title: data.anime_title || "",
    season_number: data.season_number || 1,
    episode_number: data.episode_number || 1,
    title: data.title || "",
    thumbnail: data.thumbnail || data.poster || "",
    type: data.type || "anime",
    updated_at: Date.now()
  });

  // Keep latest 100 entries
  if (list.length > 100) {
    list = list.slice(0, 100);
  }

  saveHistory(list);

  window.dispatchEvent(new Event("historyUpdated"));
}

export async function getHistoryList() {
  return getHistory();
}

export function subscribeHistory(callback) {

  callback(getHistory());

  function refresh() {
    callback(getHistory());
  }

  window.addEventListener("storage", refresh);
  window.addEventListener("historyUpdated", refresh);

  return () => {
    window.removeEventListener("storage", refresh);
    window.removeEventListener("historyUpdated", refresh);
  };
}

export function clearHistory() {

  localStorage.removeItem(STORAGE_KEY);

  window.dispatchEvent(new Event("historyUpdated"));
}