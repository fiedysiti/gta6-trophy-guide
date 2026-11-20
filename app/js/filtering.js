// Sunset Platinum — filtering: one pass over the trophy list applying the search
// text, grade, kind, missable and earned-status filters from the checklist bar.
export function applyFilters(trophies, filters, earned) {
  const query = (filters.query || '').trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (filters.category !== 'all' && trophy.category !== filters.category) return false;
    if (filters.missable === 'yes' && !trophy.missable) return false;
    if (filters.missable === 'no' && trophy.missable) return false;
    const hasIt = earned.has(trophy.name);
    if (filters.earned === 'earned' && !hasIt) return false;
    if (filters.earned === 'missing' && hasIt) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
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
