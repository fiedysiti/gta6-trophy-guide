# Sunset Platinum — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/fiedysiti/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/fiedysiti/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline, open-source web app that guides and tracks all 55 PlayStation 5
trophies of **Grand Theft Auto VI** (released 19 November 2026): 1 platinum,
2 gold, 6 silver, 46 bronze — 28 of them hidden on PlayStation until earned,
all single-player.

## What it does

- **Checklist tracker** — every trophy with its official name, description
  and grade. Tick trophies off; progress is saved in the browser
  (localStorage) and can be exported to a file and imported back.
- **Guide for every trophy** — how to unlock it, how hard it is, and when it
  can be missed, written in our own words, with the source of each fact
  named beside the guide (Exophase for the official name/description/grade,
  PSNProfiles for PSN's tracked counts, and our own advice drawn from the
  official description where a place is not yet pinned down).
- **Filters** — by kind (story, missable, collectibles, activities), by
  grade, by earned state, plus full-text search.
- **Spoiler setting** — hides the names and descriptions of un-earned story
  trophies until you earn them.
- **Roadmap to the platinum** — the order to earn trophies in, from the
  opening mission to 100% completion, built from the official descriptions.
- **Missables page** — every trophy that can be missed, with its warning.
- **Next-up planner** — the five easiest un-earned trophies to chase next.
- **Notes & counters** — a note per trophy, and a progress counter for
  trophies PSN tracks with a count (42 Shooting Range challenges, 250
  stunts, 100 WAiNK locations, and more).
- **Fully offline** — static files only, no network request at run time, no
  Rockstar logo or official artwork. The look is our own.

## Run it

Serve `app/` with any static server, then open `index.html`:

```sh
python3 -m http.server 8080 --directory app
# or: node serve.mjs  (serves app/ on http://localhost:8080)
```

## Hand it in (make.fun)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
into the output directory and writes `dossier.json` with the vendored
`vendor/makefun-frontend.ts` library.

## Sources

- Official trophy names, descriptions and grades: the official list on
  Exophase — https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSN tracked counts (42 Shooting Range challenges, 100 WAiNK locations,
  and the rest): PSNProfiles —
  https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- Launch-night earn rates quoted in the app (638 tracked players, 19 Nov
  2026): Exophase, as recorded in the competition kit.
- Every guide sentence is our own. Where a specific place or step is not
  pinned down by a source, the guide says so instead of inventing one.

## License

MIT — see `LICENSE`.
