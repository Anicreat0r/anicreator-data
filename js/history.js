// ==========================================================
// ANICREATOR HISTORY
// LocalStorage based watch history
// ==========================================================

const HISTORY_KEY = "anicreator_history";

const MAX_HISTORY = 100;


// ==========================================================
// GET HISTORY
// ==========================================================

function getHistory() {

    try {

        const raw =
            localStorage.getItem(
                HISTORY_KEY
            );

        if (!raw) {
            return [];
        }

        const data =
            JSON.parse(raw);

        return Array.isArray(data)
            ? data
            : [];

    }

    catch (error) {

        console.error(
            "History read error:",
            error
        );

        return [];

    }

}


// ==========================================================
// SAVE HISTORY
// ==========================================================

function saveHistory(list) {

    try {

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(list)
        );

    }

    catch (error) {

        console.error(
            "History save error:",
            error
        );

    }

}


// ==========================================================
// CREATE HISTORY ID
// ==========================================================

function historyId(data) {

    if (!data) {
        return "";
    }

    const anime =
        String(
            data.anime_slug ||
            data.anime_id ||
            ""
        ).trim();

    const season =
        String(
            data.season_number ??
            1
        ).trim();

    const episode =
        String(
            data.episode_number ??
            1
        ).trim();

    return (
        anime +
        "|s" +
        season +
        "|e" +
        episode
    );

}


// ==========================================================
// ADD HISTORY
// ==========================================================

export function addHistory(data) {

    if (!data) {
        return false;
    }


    const id =
        historyId(data);

    if (!id) {
        return false;
    }


    let list =
        getHistory();


    /*
     * Remove previous entry for
     * the same episode.
     */

    list =
        list.filter(
            item =>
                item.id !== id
        );


    /*
     * Add newest item at the top.
     */

    list.unshift({

        id: id,

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
                data.anime_poster ||
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

        episode_title:
            String(
                data.episode_title ||
                data.title ||
                ""
            ),

        episode_thumb:
            String(
                data.episode_thumb ||
                data.thumbnail ||
                data.anime_image ||
                data.anime_poster ||
                data.poster ||
                ""
            ),

        type:
            String(
                data.type ||
                "anime"
            ).toLowerCase() ===
            "movie"
                ? "movie"
                : "anime",

        watched_at:
            Date.now(),

        updated_at:
            Date.now()

    });


    /*
     * Keep only the newest
     * MAX_HISTORY entries.
     */

    if (
        list.length >
        MAX_HISTORY
    ) {

        list =
            list.slice(
                0,
                MAX_HISTORY
            );

    }


    saveHistory(list);


    /*
     * Notify History page/components.
     */

    window.dispatchEvent(
        new Event(
            "historyUpdated"
        )
    );


    return true;

}


// ==========================================================
// GET SAVED HISTORY
// ==========================================================

export function savedHistory() {

    return getHistory();

}


// ==========================================================
// GET HISTORY
// Compatibility alias
// ==========================================================

export function getSavedHistory() {

    return getHistory();

}


// ==========================================================
// SUBSCRIBE TO HISTORY CHANGES
// ==========================================================

export function subscribeHistory(
    callback
) {

    if (
        typeof callback !==
        "function"
    ) {

        return function () {};

    }


    callback(
        getHistory()
    );


    function refresh() {

        callback(
            getHistory()
        );

    }


    window.addEventListener(
        "storage",
        refresh
    );

    window.addEventListener(
        "historyUpdated",
        refresh
    );


    return function unsubscribe() {

        window.removeEventListener(
            "storage",
            refresh
        );

        window.removeEventListener(
            "historyUpdated",
            refresh
        );

    };

}


// ==========================================================
// REMOVE ONE HISTORY ITEM
// ==========================================================

export function removeHistory(
    data
) {

    const id =
        typeof data === "string"
            ? data
            : historyId(data);


    if (!id) {
        return false;
    }


    const list =
        getHistory();


    const newList =
        list.filter(
            item =>
                item.id !== id
        );


    if (
        newList.length ===
        list.length
    ) {

        return false;

    }


    saveHistory(
        newList
    );


    window.dispatchEvent(
        new Event(
            "historyUpdated"
        )
    );


    return true;

}


// ==========================================================
// CLEAR ALL HISTORY
// ==========================================================

export function clearHistory() {

    try {

        localStorage.removeItem(
            HISTORY_KEY
        );

    }

    catch (error) {

        console.error(
            "History clear error:",
            error
        );

    }


    window.dispatchEvent(
        new Event(
            "historyUpdated"
        )
    );

}


// ==========================================================
// CHECK HISTORY
// ==========================================================

export function hasHistory(
    data
) {

    const id =
        historyId(data);

    if (!id) {
        return false;
    }

    return getHistory()
        .some(
            item =>
                item.id === id
        );

}


// ==========================================================
// GET LAST WATCHED
// ==========================================================

export function getLastWatched(
    animeSlug
) {

    const slug =
        String(
            animeSlug || ""
        ).trim();


    if (!slug) {
        return null;
    }


    return (
        getHistory()
            .find(
                item =>
                    String(
                        item.anime_slug
                    ).trim() === slug
            ) ||
        null
    );

}


// ==========================================================
// DEFAULT EXPORT
// ==========================================================

export default {

    addHistory,

    savedHistory,

    getSavedHistory,

    subscribeHistory,

    removeHistory,

    clearHistory,

    hasHistory,

    getLastWatched

};
