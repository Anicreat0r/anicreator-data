// bookmark.js
// Anicreator Bookmark System (Cloudflare / Static Version)

const STORAGE_KEY = "anicreator_bookmarks";

/* ===========================
   Helpers
=========================== */

function getBookmarks() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Bookmark Load Error:", e);
        return [];
    }
}

function saveBookmarks(bookmarks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

function createBookmarkId(data) {
    return `${data.anime_slug}|s${data.season_number}|e${data.episode_number}`;
}

function notify() {
    window.dispatchEvent(new Event("bookmarksUpdated"));
}

/* ===========================
   Compatibility
=========================== */

export const room = null;

export async function currentUserId() {
    return "local-user";
}

/* ===========================
   Public API
=========================== */

export async function savedBookmarks() {
    return getBookmarks();
}

export async function isBookmarked(data) {
    if (!data) return false;

    const id = createBookmarkId(data);

    return getBookmarks().some(item => item.id === id);
}

export async function toggleBookmark(data) {

    if (!data) return false;

    const bookmarks = getBookmarks();
    const id = createBookmarkId(data);

    const index = bookmarks.findIndex(item => item.id === id);

    // Remove bookmark
    if (index !== -1) {

        bookmarks.splice(index, 1);

        saveBookmarks(bookmarks);

        notify();

        return false;
    }

    // Add bookmark
    bookmarks.unshift({

        id,

        anime_slug: data.anime_slug || "",

        anime_title: data.anime_title || "",

        title: data.title || data.episode_title || "",

        poster:
            data.poster ||
            data.thumbnail ||
            data.anime_image ||
            "",

        thumbnail:
            data.thumbnail ||
            data.poster ||
            data.episode_thumb ||
            "",

        season_number: Number(data.season_number || 1),

        episode_number: Number(data.episode_number || 1),

        type: data.type || "anime",

        url:
            data.url ||
            `watch.html?id=${data.anime_slug}&season=${data.season_number}&ep=${data.episode_number}`,

        updated_at: Date.now()

    });

    saveBookmarks(bookmarks);

    notify();

    return true;
}

export function clearBookmarks() {

    localStorage.removeItem(STORAGE_KEY);

    notify();
}

export function subscribeBookmarks(callback) {

    if (typeof callback !== "function") return () => {};

    callback(getBookmarks());

    const refresh = () => callback(getBookmarks());

    window.addEventListener("storage", refresh);
    window.addEventListener("bookmarksUpdated", refresh);

    return () => {
        window.removeEventListener("storage", refresh);
        window.removeEventListener("bookmarksUpdated", refresh);
    };
}