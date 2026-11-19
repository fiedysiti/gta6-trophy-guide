// Sunset Platinum — trophy data loading and lookups.
//
// Loads app/data/trophies.json (a local file, fetched once at boot) and
// answers the questions the views ask: which trophies belong to a roadmap
// stage, which are story trophies for the spoiler rule, and what a trophy's
// PSN tracked count is.

import { ROADMAP_STAGES } from './config.js';

let cachedTrophies = null;

export async function loadTrophies() {
  if (cachedTrophies) return cachedTrophies;
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`Could not load trophy data (${response.status})`);
  const payload = await response.json();
  cachedTrophies = Array.isArray(payload) ? payload : payload.trophies;
  return cachedTrophies;
}

export function trophyById(trophies, id) {
  return trophies.find((trophy) => trophy.id === id);
}

export function storyTrophies(trophies) {
  return trophies.filter((trophy) => trophy.kind === 'story');
}

export function missableTrophies(trophies) {
  return trophies.filter((trophy) => trophy.missable);
}

export function roadmapStageTrophies(trophies, stage) {
  return stage.trophyIds
    .map((id) => trophyById(trophies, id))
    .filter((trophy) => trophy !== undefined);
}

export function stageProgress(trophies, stage, earnedIds) {
  const members = roadmapStageTrophies(trophies, stage);
  const earned = members.filter((trophy) => earnedIds.has(trophy.id)).length;
  return { earned, total: members.length };
}

export function gradeCounts(trophies, earnedIds) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (earnedIds.has(trophy.id)) counts[trophy.grade] += 1;
  }
  return counts;
}

export function psnTargetLabel(trophy) {
  if (!trophy.target) return null;
  return `${trophy.target.label}: ${trophy.target.count}`;
}

export function roadmapStages() {
  return ROADMAP_STAGES;
}
