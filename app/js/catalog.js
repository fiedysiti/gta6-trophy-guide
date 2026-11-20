// Sunset Platinum — the trophy catalogue: loads app/data/trophies.json and holds
// the display labels, the grade ranking (platinum first), the rough planning
// hours per trophy kind, and the five roadmap stages the guide is built around.
export async function loadCatalog() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('trophies.json failed to load');
  return response.json();
}

export const GRADE_LABEL = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

// Lower means a better grade; used to sort the checklist "best first".
export const GRADE_RANK = {
  platinum: 0,
  gold: 1,
  silver: 2,
  bronze: 3,
};

// Rough planning hours for one trophy of each kind, for a typical first
// playthrough. Collectibles take longest (sweeping the whole map); story
// trophies are the quickest because they pop while playing the missions.
export const HOURS_BY_CATEGORY = {
  story: 0.5,
  side: 1,
  collectible: 1.5,
  activity: 1,
};

export const CATEGORY_LABEL = {
  story: 'Story',
  side: 'Side',
  collectible: 'Collectible',
  activity: 'Activity',
};

export const STAGES = [
  { n: 1, title: 'Stage 1 — Story first run', blurb: 'Run Chapters 1–4 and the final mission back to back. The story trophies unlock as the chapters close, and the choices trophy is quietly counting every decision you make.' },
  { n: 2, title: 'Stage 2 — Side strands & one-shot moments', blurb: 'Clear every stranger strand and every one-shot moment before the finale — these are the trophies that can lock you out for good.' },
  { n: 3, title: 'Stage 3 — Collectibles & exploration', blurb: 'Cards, WAiNK spots, meditation places, vehicles and garages. Sweep Leonida region by region until the map is bare.' },
  { n: 4, title: 'Stage 4 — Activities, races & combat', blurb: 'Shooting range golds, drone and car races, stunts, robberies and the money trophies. The grindy, repeatable ones live here — chip at them between story beats.' },
  { n: 5, title: 'Stage 5 — Cleanup & platinum', blurb: 'Open the 100% completion counter, mop up whatever is left, and the platinum pops on its own.' },
];

export function gradeOf(trophy) {
  return GRADE_LABEL[trophy.grade] ?? trophy.grade;
}

export function categoryOf(trophy) {
  return CATEGORY_LABEL[trophy.category] ?? trophy.category;
}

export function gradeRank(grade) {
  return GRADE_RANK[grade] ?? 99;
}

export function stageTitle(n) {
  return STAGES.find((stage) => stage.n === n)?.title ?? `Stage ${n}`;
}
