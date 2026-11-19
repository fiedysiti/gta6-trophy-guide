// Sunset Platinum — rendering.
//
// Every view is a function that takes the trophy list, the player's state
// and the current settings, and rebuilds its corner of the page from
// scratch. Text is set with textContent, never injected as HTML.

import { GRADE_LABELS, TOTAL_TROPHIES } from './config.js';
import { gradeCounts, psnTargetLabel, roadmapStages, roadmapStageTrophies, stageProgress } from './data.js';
import { displayDescription, displayName, isSpoilerHidden, plannerReason } from './filters.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function medalNode(grade) {
  const medal = el('span', `medal medal-${grade}`, grade.slice(0, 1).toUpperCase());
  medal.title = GRADE_LABELS[grade];
  return medal;
}

function kindTag(trophy) {
  const tags = [];
  if (trophy.kind === 'story') tags.push('Story');
  if (trophy.kind === 'collectibles') tags.push('Collectibles');
  if (trophy.kind === 'activities') tags.push('Activities');
  if (trophy.missable) tags.push('Missable');
  if (trophy.hidden) tags.push('Hidden on PSN');
  tags.push(trophy.difficulty);
  return tags;
}

export function renderProgressHeader(trophies, state) {
  const earned = new Set(state.earned);
  const earnedCount = earned.size;
  document.getElementById('earnedCount').textContent = String(earnedCount);
  document.getElementById('progressFill').style.width = `${Math.round((earnedCount / TOTAL_TROPHIES) * 100)}%`;
  const counts = gradeCounts(trophies, earned);
  document.getElementById('gradeCounts').textContent =
    `Platinum ${counts.platinum}/1 · Gold ${counts.gold}/2 · Silver ${counts.silver}/6 · Bronze ${counts.bronze}/46`;
  const remaining = TOTAL_TROPHIES - earnedCount;
  document.getElementById('nextUpLine').textContent =
    remaining === 0 ? 'Platinum earned — Leonida Legend!' : `${remaining} to go — the planner below picks your next win.`;
}

export function renderChecklist(trophies, state, settings, visible, onSelect, selectedId) {
  const list = document.getElementById('trophyList');
  list.replaceChildren();
  document.getElementById('resultLine').textContent =
    `Showing ${visible.length} of ${trophies.length} trophies · ${new Set(state.earned).size} earned`;
  for (const trophy of visible) {
    const row = el('li');
    const button = el('button', 'trophy-row');
    if (trophy.id === selectedId) button.classList.add('is-selected');
    if (new Set(state.earned).has(trophy.id)) button.classList.add('is-earned');
    button.addEventListener('click', (event) => {
      if (event.target instanceof HTMLInputElement) return;
      onSelect(trophy.id);
    });

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = new Set(state.earned).has(trophy.id);
    checkbox.setAttribute('aria-label', `Mark ${trophy.name} earned`);
    checkbox.addEventListener('change', () => {
      const { toggleEarned } = window.__sunsetActions;
      toggleEarned(trophy.id);
    });
    button.appendChild(checkbox);
    button.appendChild(medalNode(trophy.grade));

    const body = el('div');
    const name = el('div', 'trophy-name', displayName(trophy, state, settings));
    if (isSpoilerHidden(trophy, state, settings)) {
      name.appendChild(el('span', 'hidden-tag', ' (story — hidden until earned)'));
    }
    body.appendChild(name);
    body.appendChild(el('div', 'trophy-desc', displayDescription(trophy, state, settings)));
    const meta = el('div', 'trophy-meta');
    for (const tag of kindTag(trophy)) {
      meta.appendChild(el('span', tag === 'Missable' ? 'tag tag-missable' : 'tag', tag));
    }
    body.appendChild(meta);
    button.appendChild(body);

    const grade = el('div', 'trophy-grade');
    grade.appendChild(el('div', null, GRADE_LABELS[trophy.grade]));
    if (trophy.launchRatePct !== undefined) {
      grade.appendChild(el('span', 'earn-rate', `Launch night: ${trophy.launchRatePct}% earned`));
    }
    button.appendChild(grade);
    row.appendChild(button);
    list.appendChild(row);
  }
  if (visible.length === 0) {
    list.appendChild(el('li', 'detail-empty', 'No trophies match these filters. Clear the search or pick another kind.'));
  }
}

export function renderDetailPane(trophies, state, settings, selectedId, onNote, onCounter) {
  const pane = document.getElementById('detailPane');
  pane.replaceChildren();
  const trophy = trophies.find((t) => t.id === selectedId);
  if (!trophy) {
    pane.appendChild(el('p', 'detail-empty', 'Pick a trophy on the left to read its full guide, sources and missable warning.'));
    return;
  }
  pane.appendChild(el('h2', null, displayName(trophy, state, settings)));
  const sub = el('p', 'trophy-desc', `${GRADE_LABELS[trophy.grade]} trophy${trophy.hidden ? ' · hidden on PSN until earned' : ''}`);
  pane.appendChild(sub);
  if (!isSpoilerHidden(trophy, state, settings)) {
    pane.appendChild(el('p', null, trophy.description));
  }
  const diff = el('p');
  diff.appendChild(el('span', 'difficulty', `Difficulty: ${trophy.difficulty}`));
  pane.appendChild(diff);
  if (trophy.missable && trophy.missableWarning) {
    pane.appendChild(el('div', 'warning-box', `Missable — ${trophy.missableWarning}`));
  }
  const guideHeading = el('h3', null, 'How to unlock it');
  pane.appendChild(guideHeading);
  pane.appendChild(el('p', 'guide-text', trophy.guide));

  const targetLabel = psnTargetLabel(trophy);
  if (targetLabel) {
    const counterLabel = el('label', null, `Your progress — ${targetLabel}`);
    const row = el('div', 'counter-row');
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = String(trophy.target.count);
    input.value = String(state.counters[trophy.id] ?? 0);
    input.setAttribute('aria-label', `Progress towards ${targetLabel}`);
    input.addEventListener('change', () => onCounter(trophy.id, input.value));
    row.appendChild(input);
    row.appendChild(el('span', null, `of ${trophy.target.count}`));
    counterLabel.appendChild(row);
    pane.appendChild(counterLabel);
  }

  const sourcesHeading = el('h3', null, 'Sources');
  pane.appendChild(sourcesHeading);
  const sources = el('ul', 'sources');
  for (const source of trophy.sources) {
    const item = el('li');
    if (source.url) {
      const link = el('a', null, source.label);
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      item.appendChild(link);
      item.appendChild(document.createTextNode(` — ${source.note}`));
    } else {
      item.textContent = `${source.label} — ${source.note}`;
    }
    sources.appendChild(item);
  }
  pane.appendChild(sources);
  pane.appendChild(el('p', 'fineprint', 'Official trophy names and descriptions are shown as PlayStation publishes them. Guide text is our own; a source is cited, never copied.'));

  const noteLabel = el('label', null, 'Your note');
  const noteBox = document.createElement('textarea');
  noteBox.placeholder = 'e.g. best spot, loadout, what worked…';
  noteBox.value = state.notes[trophy.id] ?? '';
  noteBox.addEventListener('change', () => onNote(trophy.id, noteBox.value));
  noteLabel.appendChild(noteBox);
  pane.appendChild(noteLabel);
}

export function renderRoadmap(trophies, state, onSelect) {
  const list = document.getElementById('roadmapList');
  list.replaceChildren();
  for (const stage of roadmapStages()) {
    const item = el('li', 'roadmap-stage');
    item.appendChild(el('h3', null, stage.title));
    item.appendChild(el('p', null, stage.blurb));
    const chips = el('div', 'roadmap-trophies');
    const members = roadmapStageTrophies(trophies, stage);
    const earned = new Set(state.earned);
    for (const trophy of members) {
      const chip = el('button', 'roadmap-trophy', trophy.name);
      if (earned.has(trophy.id)) chip.classList.add('is-earned');
      chip.addEventListener('click', () => onSelect(trophy.id));
      chips.appendChild(chip);
    }
    item.appendChild(chips);
    const progress = stageProgress(trophies, stage, earned);
    item.appendChild(el('p', 'roadmap-progress', `${progress.earned} of ${progress.total} earned in this stage`));
    list.appendChild(item);
  }
}

export function renderMissables(trophies, state, settings, onSelect) {
  const list = document.getElementById('missableList');
  list.replaceChildren();
  const earned = new Set(state.earned);
  const missables = trophies
    .filter((trophy) => trophy.missable)
    .sort((a, b) => Number(earned.has(a.id)) - Number(earned.has(b.id)));
  for (const trophy of missables) {
    const row = el('li');
    const button = el('button', 'trophy-row');
    button.addEventListener('click', () => onSelect(trophy.id));
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = new Set(state.earned).has(trophy.id);
    checkbox.setAttribute('aria-label', `Mark ${trophy.name} earned`);
    checkbox.addEventListener('change', () => window.__sunsetActions.toggleEarned(trophy.id));
    button.appendChild(checkbox);
    button.appendChild(medalNode(trophy.grade));
    const body = el('div');
    body.appendChild(el('div', 'trophy-name', displayName(trophy, state, settings)));
    body.appendChild(el('div', 'trophy-desc', trophy.missableWarning ?? displayDescription(trophy, state, settings)));
    const meta = el('div', 'trophy-meta');
    meta.appendChild(el('span', 'tag tag-missable', 'Missable'));
    meta.appendChild(el('span', 'tag', trophy.difficulty));
    body.appendChild(meta);
    button.appendChild(body);
    button.appendChild(el('div', 'trophy-grade', GRADE_LABELS[trophy.grade]));
    row.appendChild(button);
    list.appendChild(row);
  }
}

export function renderPlanner(picks, state, onSelect) {
  const list = document.getElementById('plannerList');
  list.replaceChildren();
  if (picks.length === 0) {
    list.appendChild(el('li', 'detail-empty', 'Everything is earned — the platinum is yours.'));
    return;
  }
  for (const trophy of picks) {
    const item = el('li', 'planner-item');
    const body = el('div');
    body.appendChild(el('div', 'trophy-name', trophy.name));
    body.appendChild(el('div', 'trophy-desc', trophy.description));
    body.appendChild(el('div', 'why', plannerReason(trophy)));
    item.appendChild(body);
    const go = el('button', null, 'Open guide');
    go.addEventListener('click', () => onSelect(trophy.id));
    item.appendChild(go);
    list.appendChild(item);
  }
}

export function renderSettingsSummary(state) {
  const earned = new Set(state.earned).size;
  const noteCount = Object.keys(state.notes).length;
  const counterCount = Object.keys(state.counters).length;
  document.getElementById('saveSummary').textContent =
    `${earned} of 55 trophies earned · ${noteCount} note${noteCount === 1 ? '' : 's'} · ${counterCount} tracked counter${counterCount === 1 ? '' : 's'} saved in this browser.`;
}
