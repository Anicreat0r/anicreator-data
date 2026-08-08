// ==========================================================
// ANICREATOR BOOKMARK PAGE
// ==========================================================

import {
    toggleBookmark,
    subscribeBookmarks
} from "./bookmark.js";

const $ =
    selector =>
        document.querySelector(
            selector
        );

const esc =
    value =>
        String(
            value ?? ""
        ).replace(
            /[&<>"']/g,
            character =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                }[character])
        );

let list = [];

function watchURL(item) {

    return (
        "watch.html" +
        "?anime=" +
        encodeURIComponent(
            item.anime_slug || ""
        ) +
        "&season=" +
        encodeURIComponent(
            item.season_number || 1
        ) +
        "&ep=" +
        encodeURIComponent(
            item.episode_number || 1
        )
    );
}

function card(item, index) {

    const image =
        item.thumbnail ||
        item.episode_thumb ||
        item.anime_image ||
        item.poster ||
        "";

    const title =
        item.anime_title ||
        "Unknown Anime";

    const episodeTitle =
        item.episode_title ||
        item.title ||
        "";

    const isMovie =
        String(
            item.type ||
            "anime"
        ).toLowerCase() ===
        "movie";

    return `
        <div
            class="card bmk-card"
            data-index="${index}"
        >

            <a
                class="bmk-link"
                href="${watchURL(item)}"
            >

                <img
                    class="episode-thumb"
                    src="${esc(image)}"
                    loading="lazy"
                    alt="${esc(title)}"
                    onerror="
                        this.style.display='none';
                    "
                >

                <div class="card-body">

                    <div class="card-title">
                        ${esc(title)}
                    </div>

                    <div class="card-meta">

                        ${
                            isMovie
                                ? "Movie"
                                : "S" +
                                  esc(
                                      item.season_number ||
                                      1
                                  ) +
                                  " • EP " +
                                  esc(
                                      item.episode_number ||
                                      1
                                  )
                        }

                    </div>

                    ${
                        episodeTitle
                            ? `
                                <div class="card-meta">
                                    ${esc(
                                        episodeTitle
                                    )}
                                </div>
                            `
                            : ""
                    }

                </div>

            </a>

            <button
                class="bmk-remove"
                type="button"
                data-index="${index}"
                title="Remove from bookmarks"
                aria-label="Remove from bookmarks"
            >
                ✕
            </button>

        </div>
    `;
}

function render(items) {

    list =
        Array.isArray(items)
            ? items
            : [];

    const grid =
        $("#grid");

    const count =
        $("#count");

    if (!grid) {
        console.error(
            "Bookmarks: #grid not found."
        );
        return;
    }

    if (!list.length) {

        grid.innerHTML = `
            <div class="state">
                No bookmarks yet.
                <br>
                Hit ★ on any episode to save it.
            </div>
        `;

    } else {

        grid.innerHTML =
            list
                .map(
                    (item, index) =>
                        card(
                            item,
                            index
                        )
                )
                .join("");

    }

    if (count) {

        count.textContent =
            `${list.length} ${
                list.length === 1
                    ? "saved episode"
                    : "saved episodes"
            }`;

    }

    const loading =
        $("#loading");

    if (loading) {
        loading.classList.add(
            "hidden"
        );
    }
}

const grid =
    $("#grid");

if (grid) {

    grid.addEventListener(
        "click",
        async function(event) {

            const button =
                event.target.closest(
                    ".bmk-remove"
                );

            if (!button) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const index =
                Number(
                    button.dataset.index
                );

            const item =
                list[index];

            if (!item) {
                return;
            }

            button.disabled =
                true;

            try {

                const result =
                    await toggleBookmark(
                        item
                    );

                if (
                    result === false
                ) {

                    /*
                     * subscribeBookmarks will
                     * normally refresh this,
                     * but render immediately too.
                     */

                    list =
                        list.filter(
                            (_, i) =>
                                i !== index
                        );

                    render(list);

                } else {

                    button.disabled =
                        false;

                }

            } catch (error) {

                console.error(
                    "Bookmark remove error:",
                    error
                );

                button.disabled =
                    false;

            }

        }
    );

}

const unsubscribe =
    subscribeBookmarks(
        render
    );

window.addEventListener(
    "beforeunload",
    function() {

        if (
            typeof unsubscribe ===
            "function"
        ) {

            unsubscribe();

        }

    }
);
