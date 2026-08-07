#!/usr/bin/env node
// Rebuilds data/anime-index.json (and data/home.json) from the actual files
// in data/anime/*.json so the catalog can never drift out of sync with the
// episode data. Run after adding/removing/renaming a title:
//   node tools/sync-data.mjs
//
// - Existing titles keep their relative order (newest first).
// - Titles whose episode file is missing are dropped from the index.
// - Newly added files are prepended (they become "Recently Updated").
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dataDir = new URL('../data/', import.meta.url).pathname;
const animeDir = join(dataDir, 'anime');

const clean = (v) => String(v ?? '').trim();
const normType = (t) => String(t || '').trim().toLowerCase() === 'movie' ? 'movie' : 'anime';

function entryFor(d) {
  return {
    id: d.id || d.slug || '',
    title: clean(d.title),
    slug: d.slug || d.id || '',
    description: clean(d.description),
    poster: d.poster || '',
    banner: d.banner || d.poster || '',
    genres: clean(d.genres),
    tags: clean(d.tags),
    status: clean(d.status) || 'anime',
    type: normType(d.type),
  };
}

async function main() {
  const filenames = (await readdir(animeDir)).filter((f) => f.endsWith('.json'));
  const data = new Map();
  for (const f of filenames) {
    const slug = f.slice(0, -5);
    try {
      data.set(slug, JSON.parse(await readFile(join(animeDir, f), 'utf8')));
    } catch (e) {
      console.error(`Skipping unreadable file: ${f} (${e.message})`);
    }
  }

  let existing = [];
  try {
    existing = JSON.parse(await readFile(join(dataDir, 'anime-index.json'), 'utf8'));
  } catch {}

  const seen = new Set();
  const kept = existing
    .filter((a) => {
      const slug = a.slug || a.id;
      return data.has(slug);
    })
    .map((a) => {
      const slug = a.slug || a.id;
      seen.add(slug);
      return entryFor(data.get(slug));
    });

  const fresh = [...data.entries()]
    .filter(([slug]) => !seen.has(slug))
    .map(([, d]) => entryFor(d));

  const index = [...fresh, ...kept];
  await writeFile(join(dataDir, 'anime-index.json'), JSON.stringify(index, null, 2) + '\n');

  // home.json mirrors the newest few titles (kept for compatibility).
  const latest = index.slice(0, 12);
  const random = index.slice(0, 6);
  await writeFile(join(dataDir, 'home.json'), JSON.stringify({ latest, random }, null, 2) + '\n');

  console.log(`Synced ${index.length} titles (${fresh.length} new, ${kept.length} kept).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
