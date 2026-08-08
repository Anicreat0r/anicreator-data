// ==========================================================
// ANICREATOR BOOKMARKS
// LocalStorage version - no Websim dependency
// ==========================================================

const STORAGE_KEY = "anicreator_bookmarks";
const MAX_BOOKMARKS = 200;

function getBookmarks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Bookmark read error:", error);
        return [];
    }
}

function saveBookmarks(list) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(list)
    );
}

export const room = null;

export async function currentUserId() {
    return "local-user";
}

export function bookmarkId(data) {
    if (!data) return "";

    const anime =
        String(
            data.anime_slug ||
            data.anime_id ||
            ""
        ).trim();

    const season =
        String(
            data.season_number ||
            1
        ).trim();

    const episode =
        String(
            data.episode_number ||
            1
        ).trim();

    if (!anime) return "";

    return (
        anime +
        "|s" +
        season +
        "|e" +
        episode
    );
}

export async function isBookmarked(data) {
    const id = bookmarkId(data);

    if (!id) return false;

    return getBookmarks().some(
        item => item.id === id
    );
}

export async function toggleBookmark(data) {
    if (!data) return null;

    const id = bookmarkId(data);

    if (!id) {
        console.warn(
            "Bookmark: missing anime slug/id",
            data
        );
        return null;
    }

    let list = getBookmarks();

    const index =
        list.findIndex(
            item => item.id === id
        );

    // Remove
    if (index !== -1) {
        list.splice(index, 1);

        saveBookmarks(list);

        window.dispatchEvent(
            new Event("bookmarksUpdated")
        );

        return false;
    }

    // Add
    const item = {
        id,

        anime_slug:
            String(
                data.anime_slug ||
                data.anime_id ||
                ""
            ),

        anime_title:
            String(
                data.anime_title ||
                ""
            ),

        anime_image:
            String(
                data.anime_image ||
                data.poster ||
                ""
            ),

        season_number:
            Number(
                data.season_number ||
                1
            ),

        episode_number:
            Number(
                data.episode_number ||
                1
            ),

        title:
            String(
                data.title ||
                data.episode_title ||
                ""
            ),

        episode_title:
            String(
                data.episode_title ||
                data.title ||
                ""
            ),

        thumbnail:
            String(
                data.thumbnail ||
                data.episode_thumb ||
                data.anime_image ||
                data.poster ||
                ""
            ),

        episode_thumb:
            String(
                data.episode_thumb ||
                data.thumbnail ||
                data.anime_image ||
                data.poster ||
                ""
            ),

        type:
            String(
                data.type ||
                "anime"
            ).toLowerCase() === "movie"
                ? "movie"
                : "anime",

        updated_at:
            Date.now()
    };

    list.unshift(item);

    list =
        list.slice(
            0,
            MAX_BOOKMARKS
        );

    saveBookmarks(list);

    window.dispatchEvent(
        new Event("bookmarksUpdated")
    );

    return true;
}

export async function savedBookmarks() {
    return getBookmarks();
}

export function subscribeBookmarks(callback) {
    if (typeof callback !== "function") {
        return () => {};
    }

    callback(getBookmarks());

    function refresh() {
        callback(getBookmarks());
    }

    function storageRefresh(event) {
        if (
            event.key === STORAGE_KEY
        ) {
            refresh();
        }
    }

    window.addEventListener(
        "bookmarksUpdated",
        refresh
    );

    window.addEventListener(
        "storage",
        storageRefresh
    );

    return function unsubscribe() {
        window.removeEventListener(
            "bookmarksUpdated",
            refresh
        );

        window.removeEventListener(
            "storage",
            storageRefresh
        );
    };
}

export function clearBookmarks() {
    localStorage.removeItem(
        STORAGE_KEY
    );

    window.dispatchEvent(
        new Event("bookmarksUpdated")
    );
}

export async function removeBookmark(data) {
    const id =
        typeof data === "string"
            ? data
            : bookmarkId(data);

    if (!id) return false;

    const list =
        getBookmarks().filter(
            item => item.id !== id
        );

    saveBookmarks(list);

    window.dispatchEvent(
        new Event("bookmarksUpdated")
    );

    return true;
}
