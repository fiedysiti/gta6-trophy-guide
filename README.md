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
- **Planner** — add any trophy to your route from its card; the plan is shown in roadmap order with a total time estimate, so you always know what to hunt next.
- **Missables** — the 12 trophies that can be missed, with a warning to clear them before the final story mission.
- **Copy progress** — one button copies a short text summary of your hunt (progress, open missables, time left) for sharing.
- **Spoiler setting** — with “Hide story spoilers” on, unrevealed story trophies stay masked until earned or tapped open.
- **Every trophy** shows its official name, description and grade, a guide written for this entry, its source, and a rough time estimate.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the page, the sunset theme and the bootstrap.
- `app/js/` — one module per job: `storage.js` (localStorage, export/import, copy summary), `catalog.js` (trophy data, grade ranking, time estimates, roadmap stages), `filtering.js` (search, filters, sorting, hour estimates), `cards.js` (trophy cards and spoiler masking), `screens.js` (roadmap, planner, missables).
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

## Referral

Built with make.fun — try it with referral code `3debkpg7`.
