// Sunset Platinum — filtering and ordering: one pass over the trophy list
// applying the search text, grade, kind, missable and earned-status filters
// from the checklist bar, an optional "hide earned" switch, and the sort
// order the player picked. The hour estimates below are rough planning
// numbers (a typical first-timer's pace per trophy kind), used only for the
// "time left" line — they are not part of the official trophy data.
import { GRADE_RANK, HOURS_BY_CATEGORY } from './catalog.js';

export const SORTS = {
  stage: { label: 'Roadmap order', compare: (a, b) => a.stage - b.stage || a.id - b.id },
  name: { label: 'Name A–Z', compare: (a, b) => a.name.localeCompare(b.name) },
  grade: { label: 'Grade (best first)', compare: (a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade] || a.stage - b.stage || a.id - b.id },
};

export function sortTrophies(trophies, sortKey) {
  const sort = SORTS[sortKey] ?? SORTS.stage;
  return [...trophies].sort(sort.compare);
}

export function applyFilters(trophies, filters, earned) {
  const query = (filters.query || '').trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (filters.category !== 'all' && trophy.category !== filters.category) return false;
    if (filters.missable === 'yes' && !trophy.missable) return false;
    if (filters.missable === 'no' && trophy.missable) return false;
    const hasIt = earned.has(trophy.name);
    if (filters.hideEarned && hasIt) return false;
    if (filters.earned === 'earned' && !hasIt) return false;
    if (filters.earned === 'missing' && hasIt) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

// The missable trophies a player can still lose — the ones the stats line
// and the copy-progress summary warn about.
export function openMissables(trophies, earned) {
  return trophies.filter((t) => t.missable && !earned.has(t.name));
}

export function countByGrade(trophies, earned) {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const trophy of trophies) {
    const slot = counts[trophy.grade];
    if (!slot) continue;
    slot[1] += 1;
    if (earned.has(trophy.name)) slot[0] += 1;
  }
  return counts;
}

// Rough hours still needed: every unearned trophy costs the planning figure
// for its kind. A trophy already earned costs nothing. The total is rounded
// so the stats line never promises a false precision like "37.5h".
export function estimateRemainingHours(trophies, earned) {
  let hours = 0;
  for (const trophy of trophies) {
    if (!earned.has(trophy.name)) hours += HOURS_BY_CATEGORY[trophy.category] ?? 1;
  }
  return Math.round(hours);
}

export function hoursFor(trophy) {
  return HOURS_BY_CATEGORY[trophy.category] ?? 1;
}
