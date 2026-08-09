const $ = s => document.querySelector(s);

const esc = x =>
    String(x ?? '').replace(
        /[&<>"']/g,
        c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[c])
    );

const watch = e =>
    `watch.html?anime=${encodeURIComponent(e.anime_slug)}&season=${encodeURIComponent(e.season_number || 1)}&ep=${encodeURIComponent(e.episode_number || 1)}`;

const details = e =>
    `anime-details.html?anime=${encodeURIComponent(e.slug || e.id)}`;


/* ==========================================================
   LATEST UPDATE CARD
========================================================== */

function latestCard(a) {

    const movie =
        (a.type || 'anime').toLowerCase() === 'movie';

    const slug =
        a.anime_slug || a.slug;

    const title =
        a.anime_title || a.title;

    const status =
        a.status ||
        (movie ? 'Movie' : 'Anime');

    return `
        <a
            class="card"
            href="anime-details.html?anime=${encodeURIComponent(slug)}"
        >

            <img
                class="cover"
                src="${esc(a.poster || '')}"
                loading="lazy"
                alt="${esc(title)}"
                onerror="this.style.visibility='hidden'"
            >

            <div class="card-body">

                <div class="card-title">
                    ${esc(title)}
                </div>

                <div class="card-meta">
                    ${movie ? 'Movie' : esc(status)}
                </div>

                <span class="card-badge">
                    ${movie ? 'MOVIE' : 'ANIME'}
                </span>

            </div>

        </a>
    `;
}


/* ==========================================================
   RANDOM EPISODE CARD
========================================================== */

function episodeCard(e) {

    return `
        <a
            class="card"
            href="${watch(e)}"
        >

            <img
                class="episode-thumb"
                src="${esc(e.thumbnail || e.poster || '')}"
                loading="lazy"
                alt="${esc(e.anime_title || 'Anime')}"
            >

            <div class="card-body">

                <div class="card-title">
                    ${esc(e.anime_title || 'Anime')}
                </div>

                <div class="card-meta">
                    Anicreator
                </div>

            </div>

        </a>
    `;
}


/* ==========================================================
   RANDOM EPISODE POOL
========================================================== */

let pool = [];


/* ==========================================================
   SHUFFLE RANDOM EPISODES
========================================================== */

function shuffleRandom() {

    const shuffled =
        pool
            .slice()
            .sort(
                () =>
                    Math.random() - 0.5
            );

    $('#random').innerHTML =
        shuffled
            .map(episodeCard)
            .join('') ||
        '<div class="state">No random episodes available.</div>';
}


/* ==========================================================
   HERO
========================================================== */

function setHero(item) {

    if (!item) return;

    const bg =
        item.banner ||
        item.poster ||
        '';

    if (bg) {

        $('#hero').style.backgroundImage =
            `linear-gradient(
                rgba(8,8,13,.65),
                rgba(8,8,13,.85)
            ),
            url(${JSON.stringify(esc(bg))})`;
    }

    $('#heroTitle').textContent =
        item.title ||
        'Watch Anime & Movies';

    $('#heroDesc').textContent =
        item.description ||
        'Latest updates and random episodes.';
}


/* ==========================================================
   LOAD HOME
========================================================== */

async function init() {

    try {

        const idxR =
            await fetch(
                'data/anime-index.json',
                {
                    cache: 'no-cache'
                }
            );

        if (!idxR.ok) {

            throw Error(
                'Could not load anime-index.json'
            );
        }

        const index =
            await idxR.json();


        /* ==================================================
           LATEST UPDATES

           Anime + Movies only
        ================================================== */

        $('#latest').innerHTML =
            index
                .filter(item => {

                    const type =
                        String(
                            item.type ||
                            'anime'
                        ).toLowerCase();

                    return (
                        type === 'anime' ||
                        type === 'movie'
                    );

                })
                .slice(0, 6)
                .map(latestCard)
                .join('') ||

            '<div class="state">No latest updates yet.</div>';


        /* ==================================================
           HERO
        ================================================== */

        setHero(index[0]);


        /* ==================================================
           RANDOM EPISODES

           Build a pool from every anime.
        ================================================== */

        const loadOne =
            async a => {

                const url =
                    `data/anime/${encodeURIComponent(
                        a.slug || a.id
                    )}.json`;

                let d = null;


                /* ------------------------------------------
                   Retry loading JSON
                ------------------------------------------ */

                for (
                    let attempt = 0;
                    attempt < 3;
                    attempt++
                ) {

                    try {

                        const r =
                            await fetch(
                                url,
                                {
                                    cache: 'reload'
                                }
                            );

                        if (r.ok) {

                            d =
                                await r.json();

                            break;
                        }

                    } catch (err) {

                        /* retry */

                    }


                    if (attempt < 2) {

                        await new Promise(
                            res =>
                                setTimeout(
                                    res,
                                    200 *
                                    Math.pow(
                                        2,
                                        attempt
                                    )
                                )
                        );

                    }

                }


                if (!d) return [];


                const eps = [];


                /* ------------------------------------------
                   Episodes
                ------------------------------------------ */

                for (
                    const s of
                    (d.seasons || [])
                ) {

                    for (
                        const e of
                        (s.episodes || [])
                    ) {

                        eps.push({

                            anime_slug:
                                d.slug ||
                                d.id,

                            anime_title:
                                d.title,

                            /*
                             * FIX:
                             * Use season_number instead
                             * of season.
                             */

                            season_number:
                                Number(
                                    s.season_number ||
                                    1
                                ),

                            episode_number:
                                Number(
                                    e.episode_number ||
                                    1
                                ),

                            title:
                                e.title ||
                                '',

                            thumbnail:
                                e.thumbnail ||
                                d.poster,

                            poster:
                                d.poster

                        });

                    }

                }


                return eps;

            };


        /* ==================================================
           LOAD ALL EPISODES
        ================================================== */

        pool =
            (
                await Promise.all(
                    index.map(loadOne)
                )
            ).flat();


        /* ==================================================
           FIRST LOAD = SHUFFLED
        ================================================== */

        shuffleRandom();


    } catch (e) {

        $('#latest').innerHTML = '';

        $('#random').innerHTML =
            `
                <div class="state error">
                    ${esc(e.message)}
                </div>
            `;

    }

}


/* ==========================================================
   SHUFFLE BUTTON
========================================================== */

$('#shuffle').onclick =
    shuffleRandom;


/* ==========================================================
   SEARCH
========================================================== */

const searchNow = () => {

    const v =
        $('#globalSearch')
            .value
            .trim();

    if (v) {

        location.href =
            `anime.html?q=${encodeURIComponent(v)}`;

    }

};


$('#globalSearch').onkeydown =
    e => {

        if (
            e.key === 'Enter'
        ) {

            searchNow();

        }

    };


$('#searchBtn').onclick =
    searchNow;


/* ==========================================================
   START
========================================================== */

init();
