// Sunset Platinum — filtering, searching and the spoiler rule.
//
// One file, one job: given the full trophy list, the player's state and
// the toolbar's current choices, decide which trophies the checklist
// shows, and what a hidden story trophy looks like before it is earned.

import { DIFFICULTY_ORDER } from './config.js';

export function visibleTrophies(trophies, state, options) {
  const earned = new Set(state.earned);
  const query = (options.searchText || '').trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (options.kind === 'missable' && !trophy.missable) return false;
    if (options.kind && options.kind !== 'all' && options.kind !== 'missable' && trophy.kind !== options.kind) return false;
    if (options.grade && options.grade !== 'all' && trophy.grade !== options.grade) return false;
    if (options.hideEarned && earned.has(trophy.id)) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function isSpoilerHidden(trophy, state, settings) {
  if (!settings.spoilerSafe) return false;
  if (trophy.grade === 'platinum') return false;
  if (trophy.kind !== 'story') return false;
  return !new Set(state.earned).has(trophy.id);
}

export function displayName(trophy, state, settings) {
  if (isSpoilerHidden(trophy, state, settings)) return 'Hidden story trophy';
  return trophy.name;
}

export function displayDescription(trophy, state, settings) {
  if (isSpoilerHidden(trophy, state, settings)) return 'Earn this trophy to reveal its name and description.';
  return trophy.description;
}

// The Next-up planner: easiest un-earned trophies first, roadmap order
// breaking ties, so the next chase is always the cheapest win.
export function nextUpPicks(trophies, state, limit = 5) {
  const earned = new Set(state.earned);
  return trophies
    .filter((trophy) => !earned.has(trophy.id) && trophy.grade !== 'platinum')
    .sort((a, b) => {
      const byDifficulty = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      if (byDifficulty !== 0) return byDifficulty;
      return (a.roadmapOrder ?? a.id) - (b.roadmapOrder ?? b.id);
    })
    .slice(0, limit);
}

export function plannerReason(trophy) {
  if (trophy.missable) return `Missable — do it on your first pass, while the moment is in front of you. Difficulty: ${trophy.difficulty}.`;
  return `Difficulty: ${trophy.difficulty}. ${trophy.target ? `PSN tracks it to ${trophy.target.count}.` : 'A single clear step from its official description.'}`;
}
