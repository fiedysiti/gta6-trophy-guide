# Sunset Platinum

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/fiedysiti/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/fiedysiti/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Sunset Platinum is an offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5, dressed in a sunset over Leonida. It pairs a saveable checklist with a five-stage roadmap to the platinum, a planner for your own route, and spoiler-safe warnings for the trophies you can lock yourself out of.

## What it does

- **Checklist** — tick trophies off as you earn them; progress, a progress bar and per-grade counts update live and are saved in your browser (localStorage), with export and import as a JSON file.
- **Filters** — narrow the list by grade (platinum / gold / silver / bronze), kind (story / side / collectible / activity), missable status, earned status, or free-text search.
- **Roadmap** — five stages in play order: story first run, side strands and one-shot moments, collectibles and exploration, activities and races, then cleanup and the platinum.
- **Planner** — add any trophy to your route from its card; the plan is shown in roadmap order so you always know what to hunt next.
- **Missables** — the 12 trophies that can be missed, with a warning to clear them before the final story mission.
- **Spoiler setting** — with “Hide story spoilers” on, unrevealed story trophies stay masked until earned or tapped open.
- **Every trophy** shows its official name, description and grade, a guide written for this entry, and the source it cites (official PS5 trophy list via Exophase / PSNProfiles).

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the page, the sunset theme and the bootstrap.
- `app/js/` — one module per job: `storage.js` (localStorage, export/import), `catalog.js` (trophy data and roadmap stages), `filtering.js` (search and filters), `cards.js` (trophy cards and spoiler masking), `screens.js` (roadmap, planner, missables).
- `app/data/trophies.json` — the 55 official trophies with guides and sources.
- `main.ts` — the entry program (writes `dossier.json`); `serve.ts` — the local server (GET and HEAD only).

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
