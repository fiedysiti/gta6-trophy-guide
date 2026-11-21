# Sunset Platinum

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/fiedysiti/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/fiedysiti/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Sunset Platinum walks you through all 55 Grand Theft Auto VI trophies on PlayStation 5, wrapped in a sunset over Leonida. It is a checklist you can tick off, a five-stage route to the platinum, a planner for your own hunt, and a spoiler-safe warning list for the trophies you can lock yourself out of — all of it working offline in the browser.

## What you get

- **Checklist** — mark trophies earned as you go; the progress bar, the per-grade counts and the rough time-left estimate update live and are kept in your browser (localStorage), with export and import as a JSON file.
- **Sort & hide** — order the list by roadmap stage, by name, or by grade, and flip “Hide earned” (or press `h`) to see only what is still missing. Press `/` to jump straight to search. Your sort order and hide-earned choice are remembered in the browser, like the rest of your progress.
- **Filters** — narrow the list by grade (platinum / gold / silver / bronze), kind (story / side / collectible / activity), missable status, earned status, or free-text search.
- **Roadmap** — five stages in play order: story first run, side strands and one-shot moments, collectibles and exploration, activities and races, then cleanup and the platinum. Each stage shows how many hours it still holds.
- **Four-phase playthrough** — the same road grouped by kind instead of by stage: Story, Side strands, Collectibles, then Cleanup. Each phase counts its own trophies and earned ones, shows a progress bar, and warns about the missable trophies in that phase while they can still be saved. It updates live as you tick trophies off.
- **Planner** — add any trophy to your route from its card; the plan is shown in roadmap order with a total time estimate, so you always know what to hunt next.
- **Missables** — the 1 trophy that can be missed (Positive Mental Attitude — the Chapter 1 meditation), with a warning to do it before Chapter 1 ends. PowerPyx (2026-11-21) lists it as the only potentially missable trophy; every other trophy stays available in free-roam after the story.
- **Progress export & import** — Export progress downloads `sunset-platinum-progress.json`, one JSON document with the game, the export time, a format version and your progress (`{ game, exportedAt, version, progress: { earned, plan } }`). Import progress reads such a file back, checks the shape and the version, keeps only trophy names it recognises, and reports how many unknown names it skipped. A bad file is refused with a plain error instead of importing half-blind.
- **Copy progress** — one button copies a short text summary of your hunt (progress, open missables, time left) for sharing. **Copy summary** copies the one-line version instead: `Sunset Platinum — X/55 trophies (Y%) — Z missable tersisa`.
- **Spoiler setting** — with “Hide story spoilers” on, unrevealed story trophies stay masked until earned or tapped open.
- **Every trophy** shows its official name, description and grade, a guide written for this entry, its source, and a rough time estimate.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the page, the sunset theme and the bootstrap.
- `app/js/` — one module per job: `storage.js` (localStorage, export/import, copy summary), `catalog.js` (trophy data, grade ranking, time estimates, roadmap stages), `filtering.js` (search, filters, sorting, hour estimates), `cards.js` (trophy cards and spoiler masking), `screens.js` (roadmap, planner, missables), `export.js` (progress export/import file format and the one-line summary), `roadmap.js` (the four-phase playthrough, grouped by trophy kind at runtime).
- `app/data/trophies.json` — the 55 official trophies with guides and sources.
- `main.ts` — the entry program (checks inputs, then writes `dossier.json`); `serve.ts` — the local server (GET and HEAD only).

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The app is plain static files under `app/` and works with the network off; no build step, no dependencies.

To hand the entry in (writes `dossier.json` beside the copied app and screenshots):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

- Trophy names, descriptions and grades: the official PlayStation 5 list as published via Exophase / PSNProfiles (2026-11-18).
- Missable flags: PowerPyx, "GTA 6 (Grand Theft Auto VI) Trophy Guide & Roadmap" (checked 2026-11-21) — Positive Mental Attitude is the only potentially missable trophy (the Chapter 1 meditation at Jason's house); all other trophies remain available in free-roam after the story.
- Every guide on this page is written for this entry in its own words.

Built with make.fun — try it with referral code `3debkpg7`.
