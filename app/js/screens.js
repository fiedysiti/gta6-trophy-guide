// Sunset Platinum — the three guide screens: the five-stage roadmap, the planned
// route, and the missable list. Each screen reuses the trophy card builder and
// sorts its trophies by roadmap stage so the order to play them is visible.
// The roadmap also shows how much hunting time each stage still holds, and the
// planner totals the time of the route you picked.
import { STAGES, HOURS_BY_CATEGORY } from './catalog.js';
import { missableOnly } from './filtering.js';
import { renderPhaseRoadmap } from './roadmap.js';

function byStageThenId(a, b) {
  return a.stage - b.stage || a.id - b.id;
}

function stageHoursLeft(members, earned) {
  let hours = 0;
  for (const trophy of members) {
    if (!earned.has(trophy.name)) hours += HOURS_BY_CATEGORY[trophy.category] ?? 1;
  }
  return Math.round(hours);
}

export function renderRoadmap(container, trophies, earned) {
  container.replaceChildren();
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.stage === stage.n).sort((a, b) => a.id - b.id);
    const done = members.filter((t) => earned.has(t.name)).length;
    const hoursLeft = stageHoursLeft(members, earned);
    const stagePct = members.length ? Math.round((done / members.length) * 100) : 0;
    const box = document.createElement('div');
    box.className = 'roadmap-stage';
    const head = document.createElement('h3');
    head.textContent = stage.title;
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    const progress = document.createElement('p');
    progress.className = 'stage-progress';
    progress.textContent = hoursLeft > 0
      ? `${done} / ${members.length} earned in this stage (${stagePct}%) · about ${hoursLeft}h left`
      : `${done} / ${members.length} earned in this stage (${stagePct}%) · stage complete`;
    const next = members.find((t) => !earned.has(t.name));
    const nextUp = next ? document.createElement('p') : null;
    if (nextUp) {
      nextUp.className = 'stage-progress';
      nextUp.textContent = `Next up: ${next.name}`;
    }
    const list = document.createElement('ol');
    list.className = 'roadmap-list';
    for (const trophy of members) {
      const item = document.createElement('li');
      if (earned.has(trophy.name)) item.className = 'done';
      item.textContent = `${trophy.name} — ${trophy.grade}${trophy.missable ? ' ⚠ missable' : ''}`;
      list.append(item);
    }
    box.append(head, blurb, progress, ...(nextUp ? [nextUp] : []), list);
    container.append(box);
  }
}

// One call renders the whole roadmap screen: the five numbered stages above
// and the four-phase playthrough below them, both from the same live state.
export function renderRoadmapScreen(container, phasesContainer, trophies, earned) {
  renderRoadmap(container, trophies, earned);
  renderPhaseRoadmap(phasesContainer, trophies, earned);
}

export function renderPlanList(container, countEl, emptyEl, trophies, planned, makeCard) {
  const chosen = trophies.filter((t) => planned.has(t.name)).sort(byStageThenId);
  const planHours = chosen.reduce((sum, t) => sum + (HOURS_BY_CATEGORY[t.category] ?? 1), 0);
  container.replaceChildren();
  for (const trophy of chosen) container.append(makeCard(trophy));
  countEl.textContent = chosen.length
    ? `${chosen.length} ${chosen.length === 1 ? 'trophy' : 'trophies'} in your route, in roadmap order · about ${Math.round(planHours)}h of hunting.`
    : '';
  emptyEl.hidden = chosen.length > 0;
}

export function renderMissableList(container, countEl, trophies, earned, makeCard) {
  const risky = missableOnly(trophies);
  const cleared = risky.filter((t) => earned.has(t.name)).length;
  container.replaceChildren();
  for (const trophy of risky) container.append(makeCard(trophy));
  countEl.textContent = `${cleared} of ${risky.length} missable trophies cleared — do the rest in Chapter 1, before the chapter ends.`;
}
