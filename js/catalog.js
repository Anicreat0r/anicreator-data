/* ==========================================================
   ANICREATOR CATALOG
   Anime + Movie Static Catalog
   Cloudflare Pages compatible
========================================================== */

(function () {

    "use strict";

    /* ======================================================
       HELPERS
    ====================================================== */

    const $ = selector => document.querySelector(selector);

    const esc = value => {
        return String(value ?? "").replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character])
        );
    };


    /* ======================================================
       PAGE TYPE
    ====================================================== */

    const requestedType =
        String(
            window.CONTENT_TYPE || "anime"
        )
        .trim()
        .toLowerCase() === "movie"
            ? "movie"
            : "anime";


    /* ======================================================
       DATA
    ====================================================== */

    let all = [];


    /* ======================================================
       TYPE NORMALIZATION
    ====================================================== */

    function normalizedType(item) {

        if (!item) {
            return "anime";
        }

        const type =
            String(
                item.type || ""
            )
            .trim()
            .toLowerCase();

        return type === "movie"
            ? "movie"
            : "anime";
    }


    /* ======================================================
       SEARCH
    ====================================================== */

    function filtered(query) {

        const q =
            String(query || "")
                .trim()
                .toLowerCase();

        if (!q) {
            return all.slice();
        }

        return all.filter(item => {

            const text = [

                item.title,

                item.slug,

                item.genres,

                item.tags,

                item.description

            ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

            return text.includes(q);

        });

    }


    /* ======================================================
       RENDER
    ====================================================== */

    function render(list) {

        const grid = $("#grid");

        if (!grid) {
            return;
        }

        if (!list.length) {

            grid.innerHTML =
                `<div class="state">
                    No ${requestedType === "movie"
                        ? "movies"
                        : "anime"} found.
                </div>`;

        } else {

            grid.innerHTML =
                list.map(item => {

                    const movie =
                        normalizedType(item) === "movie";

                    const slug =
                        item.slug || item.id || "";

                    return `
                        <a
                            class="card"
                            href="anime-details.html?anime=${encodeURIComponent(slug)}"
                        >

                            <img
                                class="cover"
                                src="${esc(item.poster || "")}"
                                loading="lazy"
                                alt="${esc(item.title || "")}"
                                onerror="this.style.visibility='hidden'"
                            >

                            <div class="card-body">

                                <div class="card-title">
                                    ${esc(item.title || "Untitled")}
                                </div>

                                <div class="card-meta">
                                    ${
                                        movie
                                            ? "Movie"
                                            : esc(item.status || "Anime")
                                    }
                                </div>

                            </div>

                        </a>
                    `;

                }).join("");

        }


        const count = $("#count");

        if (count) {

            count.textContent =
                `${list.length} ${
                    requestedType === "movie"
                        ? list.length === 1
                            ? "movie"
                            : "movies"
                        : list.length === 1
                            ? "anime"
                            : "anime"
                }`;

        }

    }


    /* ======================================================
       HERO
    ====================================================== */

    function setHero(item) {

        if (!item) {
            return;
        }

        const hero = $("#hero");

        if (!hero) {
            return;
        }

        const background =
            item.banner ||
            item.poster ||
            "";

        if (background) {

            hero.style.backgroundImage =
                `linear-gradient(
                    rgba(8,8,13,.65),
                    rgba(8,8,13,.85)
                ),
                url("${String(background).replace(/"/g, '\\"')}")`;

            hero.style.backgroundSize =
                "cover";

            hero.style.backgroundPosition =
                "center";

        }


        const title =
            $("#heroTitle");

        if (title) {

            title.textContent =
                item.title ||
                (
                    requestedType === "movie"
                        ? "Movies"
                        : "Anime"
                );

        }


        const description =
            $("#heroDesc");

        if (!description) {
            return;
        }

        description.textContent =
            item.description ||
            (
                requestedType === "movie"
                    ? "Browse movies and standalone releases."
                    : "Browse the anime library."
            );

        description.classList.remove("open");


        let button =
            description.parentElement
                ?.querySelector(".see-more");


        if (!button) {

            button =
                document.createElement("button");

            button.className =
                "see-more";

            button.textContent =
                "See more";

            description.parentElement
                ?.insertBefore(
                    button,
                    description.nextSibling
                );

        }


        if (button) {

            button.onclick = function () {

                const open =
                    description.classList.toggle(
                        "open"
                    );

                button.textContent =
                    open
                        ? "See less"
                        : "See more";

            };


            setTimeout(function () {

                const clamped =
                    description.scrollHeight >
                    description.clientHeight + 1;

                button.classList.toggle(
                    "hidden",
                    !clamped
                );

                button.textContent =
                    description.classList.contains(
                        "open"
                    )
                        ? "See less"
                        : "See more";

            }, 60);

        }

    }


    /* ======================================================
       HIDE LOADING
    ====================================================== */

    function hideLoading() {

        const loading =
            $("#loading");

        if (loading) {

            loading.classList.add(
                "hidden"
            );

        }

    }


    /* ======================================================
       SHOW ERROR
    ====================================================== */

    function showError(message) {

        hideLoading();

        const error =
            $("#error");

        if (error) {

            error.textContent =
                message || "Unable to load catalog.";

        }

    }


    /* ======================================================
       LOAD JSON WITH TIMEOUT
    ====================================================== */

    async function fetchJSON(url) {

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                10000
            );


        try {

            const response =
                await fetch(
                    url,
                    {
                        cache: "no-cache",
                        signal: controller.signal
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `${response.status} ${response.statusText}`
                );

            }


            return await response.json();

        }

        catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                throw new Error(
                    `Request timed out while loading ${url}`
                );

            }

            throw error;

        }

        finally {

            clearTimeout(timeout);

        }

    }


    /* ======================================================
       LOAD CATALOG
    ====================================================== */

    async function loadCatalog() {

        const sources = [

            "data/anime-index.json",

            "./data/anime-index.json",

            "/data/anime-index.json"

        ];


        let lastError = null;


        for (
            const source of sources
        ) {

            try {

                const data =
                    await fetchJSON(
                        source
                    );


                if (
                    Array.isArray(data)
                ) {

                    return data;

                }


                if (
                    data &&
                    Array.isArray(
                        data.anime
                    )
                ) {

                    return data.anime;

                }


                if (
                    data &&
                    Array.isArray(
                        data.items
                    )
                ) {

                    return data.items;

                }


                throw new Error(
                    "anime-index.json does not contain an array."
                );

            }

            catch (error) {

                lastError =
                    error;

            }

        }


        throw (
            lastError ||
            new Error(
                "Could not load anime-index.json"
            )
        );

    }


    /* ======================================================
       INIT
    ====================================================== */

    async function init() {

        try {

            hideLoading();

            /*
             * Temporarily hide the grid while
             * loading.
             */

            const grid =
                $("#grid");

            if (grid) {

                grid.innerHTML =
                    `<div class="state">
                        Loading...
                    </div>`;

            }


            const index =
                await loadCatalog();


            /*
             * Normalize records.
             */

            all =
                index
                    .filter(Boolean)
                    .map(item => ({

                        ...item,

                        id:
                            String(
                                item.id || ""
                            ),

                        title:
                            String(
                                item.title || ""
                            ),

                        slug:
                            String(
                                item.slug ||
                                item.id ||
                                ""
                            ),

                        type:
                            normalizedType(
                                item
                            )

                    }))
                    .filter(
                        item =>
                            normalizedType(item) ===
                            requestedType
                    );


            /*
             * Newest first.
             *
             * Your publisher already writes
             * anime-index.json newest first,
             * but sorting here makes the site
             * independent of that assumption.
             */

            all.sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.updated_at ||
                            a.created_at ||
                            0
                        ).getTime();

                    const dateB =
                        new Date(
                            b.updated_at ||
                            b.created_at ||
                            0
                        ).getTime();

                    return dateB - dateA;

                }
            );


            /*
             * Hero
             */

            setHero(
                all[0]
            );


            /*
             * Search query
             */

            const params =
                new URLSearchParams(
                    window.location.search
                );

            const query =
                params.get("q") ||
                "";


            const search =
                $("#search");

            if (search) {

                search.value =
                    query;

            }


            /*
             * Render
             */

            render(
                filtered(query)
            );


            /*
             * Loading finished
             */

            hideLoading();


            /*
             * Clear error
             */

            const error =
                $("#error");

            if (error) {

                error.textContent =
                    "";

            }

        }

        catch (error) {

            console.error(
                "Anicreator catalog error:",
                error
            );


            showError(
                error.message ||
                "Unable to load catalog."
            );

        }

    }


    /* ======================================================
       SEARCH EVENTS
    ====================================================== */

    const search =
        $("#search");

    const searchButton =
        $("#searchBtn");


    if (search) {

        search.addEventListener(
            "input",
            function () {

                render(
                    filtered(
                        search.value
                    )
                );

            }
        );


        search.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    render(
                        filtered(
                            search.value
                        )
                    );

                }

            }
        );

    }


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            function () {

                if (!search) {
                    return;
                }

                render(
                    filtered(
                        search.value
                    )
                );

            }
        );

    }


    /* ======================================================
       START
    ====================================================== */

    init();

})();
