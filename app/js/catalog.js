// Sunset Platinum — the trophy catalogue: loads app/data/trophies.json and holds
// the display labels and the five roadmap stages the guide is built around.
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

export const CATEGORY_LABEL = {
  story: 'Story',
  side: 'Side',
  collectible: 'Collectible',
  activity: 'Activity',
};

export const STAGES = [
  { n: 1, title: 'Stage 1 — Story first run', blurb: 'Play Chapters 1–4 and the final mission. Story trophies pop as you go, and the choices trophy counts decisions made along the way.' },
  { n: 2, title: 'Stage 2 — Side strands & one-shot moments', blurb: 'Finish every stranger strand and the one-shot moments before the finale — these are the trophies that can lock you out.' },
  { n: 3, title: 'Stage 3 — Collectibles & exploration', blurb: 'Cards, WAiNK spots, meditation places, vehicles and garages. Sweep Leonida region by region.' },
  { n: 4, title: 'Stage 4 — Activities, races & combat', blurb: 'Shooting range golds, drone and car races, stunts, robberies and the money trophies.' },
  { n: 5, title: 'Stage 5 — Cleanup & platinum', blurb: 'Check the 100% completion counter, mop up whatever is left, and the platinum pops on its own.' },
];

export function gradeOf(trophy) {
  return GRADE_LABEL[trophy.grade] ?? trophy.grade;
}

export function categoryOf(trophy) {
  return CATEGORY_LABEL[trophy.category] ?? trophy.category;
}
