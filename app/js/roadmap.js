// Sunset Platinum — the four-phase playthrough: a second, simpler view of
// the road to the platinum that groups the catalogue by kind at runtime
// instead of by the five numbered stages. Each phase counts its own trophies
// and its own earned ones, and warns about the missable trophies hiding in
// that phase while they can still be saved. Re-renders whenever progress
// changes, because renderAll calls it on every state change.
import { CATEGORY_LABEL, missableTrophies } from './catalog.js';

export const PHASES = [
  { key: 'story', title: 'Phase 1 — Story', blurb: 'Play the five chapters straight through. Story trophies pop as the chapters close; nothing here needs a detour.' },
  { key: 'side', title: 'Phase 2 — Side strands', blurb: 'Stranger strands, partner jobs and one-off moments. Clear them as they appear — this is where the missable trophy lives.' },
  { key: 'collectible', title: 'Phase 3 — Collectibles', blurb: 'Meditation spots, cards, WAiNK scans and the map sweep. Slow, steady work after the story is done.' },
  { key: 'activity', title: 'Phase 4 — Cleanup', blurb: 'Ranges, races, stunts and the money goals. Whatever is left after the first three phases, finish it here.' },
];

// The trophies that belong to one phase, in catalogue order.
export function phaseMembers(trophies, key) {
  return trophies.filter((t) => t.category === key).sort((a, b) => a.id - b.id);
}

// One phase's numbers, for the progress line and the bar.
export function phaseCounts(trophies, earned, key) {
  const members = phaseMembers(trophies, key);
  const done = members.filter((t) => earned.has(t.name)).length;
  return { total: members.length, done, pct: members.length ? Math.round((done / members.length) * 100) : 0 };
}

function phaseBar(pct) {
  const track = document.createElement('div');
  track.className = 'phase-track';
  const fill = document.createElement('div');
  fill.className = 'phase-fill';
  fill.style.width = `${pct}%`;
  track.append(fill);
  return track;
}

function phaseWarning(phaseMissables, earned) {
  const open = phaseMissables.filter((t) => !earned.has(t.name));
  if (!open.length) return null;
  const warn = document.createElement('p');
  warn.className = 'phase-warning';
  warn.textContent = `⚠ Do these before moving on: ${open.map((t) => t.name).join(', ')}`;
  return warn;
}

export function renderPhaseRoadmap(container, trophies, earned) {
  container.replaceChildren();
  for (const phase of PHASES) {
    const members = phaseMembers(trophies, phase.key);
    const { total, done, pct } = phaseCounts(trophies, earned, phase.key);
    const box = document.createElement('div');
    box.className = 'phase-box';
    const head = document.createElement('h4');
    head.textContent = phase.title;
    const blurb = document.createElement('p');
    blurb.className = 'phase-blurb';
    blurb.textContent = phase.blurb;
    const count = document.createElement('p');
    count.className = 'phase-count';
    count.textContent = total
      ? `${done} / ${total} ${CATEGORY_LABEL[phase.key] ?? phase.key} trophies earned (${pct}%)`
      : `No ${CATEGORY_LABEL[phase.key] ?? phase.key} trophies in this phase.`;
    const warning = phaseWarning(missableTrophies(trophies).filter((t) => t.category === phase.key), earned);
    const list = document.createElement('ol');
    list.className = 'phase-list';
    for (const trophy of members) {
      const item = document.createElement('li');
      if (earned.has(trophy.name)) item.className = 'done';
      item.textContent = `${trophy.name} — ${trophy.grade}${trophy.missable ? ' ⚠ missable' : ''}`;
      list.append(item);
    }
    box.append(head, blurb, count, phaseBar(pct), ...(warning ? [warning] : []), list);
    container.append(box);
  }
}
