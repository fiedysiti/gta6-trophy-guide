// Sunset Platinum — the three guide screens: the five-stage roadmap, the planned
// route, and the missable list. Each screen reuses the trophy card builder and
// sorts its trophies by roadmap stage so the order to play them is visible.
import { STAGES } from './catalog.js';

function byStageThenId(a, b) {
  return a.stage - b.stage || a.id - b.id;
}

export function renderRoadmap(container, trophies, earned) {
  container.replaceChildren();
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.stage === stage.n).sort((a, b) => a.id - b.id);
    const done = members.filter((t) => earned.has(t.name)).length;
    const box = document.createElement('div');
    box.className = 'roadmap-stage';
    const head = document.createElement('h3');
    head.textContent = stage.title;
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    const progress = document.createElement('p');
    progress.className = 'stage-progress';
    progress.textContent = `${done} / ${members.length} earned in this stage`;
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

export function renderPlanList(container, countEl, emptyEl, trophies, planned, makeCard) {
  const chosen = trophies.filter((t) => planned.has(t.name)).sort(byStageThenId);
  container.replaceChildren();
  for (const trophy of chosen) container.append(makeCard(trophy));
  countEl.textContent = chosen.length
    ? `${chosen.length} ${chosen.length === 1 ? 'trophy' : 'trophies'} in your route, in roadmap order.`
    : '';
  emptyEl.hidden = chosen.length > 0;
}

export function renderMissableList(container, countEl, trophies, makeCard) {
  const risky = trophies.filter((t) => t.missable).sort(byStageThenId);
  container.replaceChildren();
  for (const trophy of risky) container.append(makeCard(trophy));
  countEl.textContent = `${risky.length} missable trophies — clear them before the final story mission.`;
}
