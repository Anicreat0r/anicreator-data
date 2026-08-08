// ==========================================================
// ANICREATOR HISTORY
// LocalStorage version
// ==========================================================

const STORAGE_KEY = "anicreator_history";
const MAX_HISTORY = 100;


// ==========================================================
// READ
// ==========================================================

function getHistory() {

    try {

        const raw =
            localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return [];
        }

        const data =
            JSON.parse(raw);

        if (!Array.isArray(data)) {
            return [];
        }

        return data;

    } catch (error) {

        console.error(
            "History read error:",
            error
        );

        return [];

    }

}


// ==========================================================
// SAVE
// ==========================================================

function saveHistory(list) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(list)
        );

    } catch (error) {

        console.error(
            "History save error:",
            error
        );

    }

}


// ==========================================================
// ID
// ==========================================================

function makeHistoryId(data) {

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
            data.season_number ||
            1
        ).trim();

    const episode =
        String(
            data.episode_number ||
            1
        ).trim();

    if (!anime) {
        return "";
    }

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
        makeHistoryId(data);

    if (!id) {
        return false;
    }


    let history =
        getHistory();


    /*
     * Remove existing copy.
     * Re-watching an episode moves it
     * back to the top.
     */

    history =
        history.filter(
            item =>
                item.id !== id
        );


    const type =
        String(
            data.type ||
            "anime"
        )
        .trim()
        .toLowerCase() === "movie"
            ? "movie"
            : "anime";


    const item = {

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

        /*
         * Keep both names because older
         * parts of your site may use either.
         */

        title:
            String(
                data.title ||
                data.episode_title ||
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

        thumbnail:
            String(
                data.thumbnail ||
                data.episode_thumb ||
                data.anime_image ||
                data.anime_poster ||
                data.poster ||
                ""
            ),

        type: type,

        watched_at:
            Date.now(),

        updated_at:
            Date.now()

    };


    history.unshift(item);


    /*
     * Limit history size.
     */

    if (
        history.length >
        MAX_HISTORY
    ) {

        history =
            history.slice(
                0,
                MAX_HISTORY
            );

    }


    saveHistory(history);


    /*
     * Tell other components on
     * the same page that history changed.
     */

    window.dispatchEvent(
        new CustomEvent(
            "historyUpdated",
            {
                detail: history
            }
        )
    );


    return true;

}


// ==========================================================
// GET HISTORY
// ==========================================================

export function savedHistory() {

    return getHistory();

}


// Compatibility alias

export function getSavedHistory() {

    return getHistory();

}


// ==========================================================
// SUBSCRIBE
// ==========================================================

export function subscribeHistory(callback) {

    if (
        typeof callback !==
        "function"
    ) {

        return function () {};

    }


    /*
     * Render immediately.
     */

    callback(
        getHistory()
    );


    function refresh() {

        callback(
            getHistory()
        );

    }


    /*
     * Same-tab updates.
     */

    window.addEventListener(
        "historyUpdated",
        refresh
    );


    /*
     * Cross-tab updates.
     */

    window.addEventListener(
        "storage",
        function(event) {

            if (
                event.key ===
                STORAGE_KEY
            ) {

                refresh();

            }

        }
    );


    /*
     * Return unsubscribe function.
     */

    return function unsubscribe() {

        window.removeEventListener(
            "historyUpdated",
            refresh
        );

    };

}


// ==========================================================
// REMOVE ONE
// ==========================================================

export function removeHistory(data) {

    const id =
        typeof data === "string"
            ? data
            : makeHistoryId(data);

    if (!id) {
        return false;
    }


    const oldHistory =
        getHistory();


    const newHistory =
        oldHistory.filter(
            item =>
                item.id !== id
        );


    if (
        newHistory.length ===
        oldHistory.length
    ) {

        return false;

    }


    saveHistory(
        newHistory
    );


    window.dispatchEvent(
        new CustomEvent(
            "historyUpdated",
            {
                detail: newHistory
            }
        )
    );


    return true;

}


// ==========================================================
// CLEAR
// ==========================================================

export function clearHistory() {

    localStorage.removeItem(
        STORAGE_KEY
    );


    window.dispatchEvent(
        new CustomEvent(
            "historyUpdated",
            {
                detail: []
            }
        )
    );

}


// ==========================================================
// CHECK
// ==========================================================

export function hasHistory(data) {

    const id =
        makeHistoryId(data);

    if (!id) {
        return false;
    }

    return getHistory().some(
        item =>
            item.id === id
    );

}


// ==========================================================
// LAST WATCHED
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
        getHistory().find(
            item =>
                String(
                    item.anime_slug
                ).trim() === slug
        ) || null
    );

}


// ==========================================================
// EXPORT DEFAULT
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
