// Sunset Platinum — trophy cards: one card per trophy with its official name,
// description and grade, the guide in our own words, its source, its kind and
// missable tags, a rough time estimate, and the Earn / Plan buttons. When the
// spoiler setting is on, a story trophy that is not earned yet shows a masked
// card until revealed.
import { categoryOf, gradeOf } from './catalog.js';
import { hoursFor } from './filtering.js';

export function isMasked(trophy, spoilers, earned, revealed) {
  return spoilers && trophy.category === 'story' && !earned.has(trophy.name) && !revealed.has(trophy.id);
}

function timeLabel(trophy) {
  const hours = hoursFor(trophy);
  return hours >= 1 ? `≈ ${hours}h` : `≈ ${Math.round(hours * 60)} min`;
}

export function buildTrophyCard(trophy, ctx) {
  const { earned, planned, spoilers, revealed } = ctx;
  const masked = isMasked(trophy, spoilers, earned, revealed);
  const card = document.createElement('article');
  card.className = `card grade-${trophy.grade}${earned.has(trophy.name) ? ' earned' : ''}`;
  card.dataset.name = trophy.name;

  const head = document.createElement('div');
  head.className = 'card-head';
  const title = document.createElement('h3');
  title.textContent = masked ? 'Hidden story trophy' : trophy.name;
  const badge = document.createElement('span');
  badge.className = `grade-badge ${trophy.grade}`;
  badge.textContent = gradeOf(trophy);
  head.append(title, badge);
  // A missable trophy gets its own badge up in the card head, not just a tag
  // below — it is the one thing a player must not scroll past. PowerPyx
  // (2026-11-21) flags only Positive Mental Attitude, so this badge is rare.
  if (trophy.missable && !masked) {
    const missableBadge = document.createElement('span');
    missableBadge.className = 'missable-badge';
    missableBadge.textContent = '⚠ Missable — do it early';
    missableBadge.title = 'This trophy can be missed — finish it before the moment passes.';
    head.append(missableBadge);
  }
  card.append(head);

  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = masked ? 'Spoiler hidden — earn this trophy or reveal it to see the details.' : trophy.description;
  card.append(desc);

  if (!masked) {
    const guide = document.createElement('p');
    guide.className = 'card-guide';
    guide.textContent = trophy.guide;
    card.append(guide);
    const source = document.createElement('p');
    source.className = 'card-source';
    source.textContent = `Source: ${trophy.source}`;
    card.append(source);
  }

  const tags = document.createElement('div');
  tags.className = 'card-tags';
  const kind = document.createElement('span');
  kind.className = 'tag';
  kind.textContent = categoryOf(trophy);
  tags.append(kind);
  const stage = document.createElement('span');
  stage.className = 'tag';
  stage.textContent = `Roadmap stage ${trophy.stage}`;
  tags.append(stage);
  const time = document.createElement('span');
  time.className = 'tag time';
  time.textContent = timeLabel(trophy);
  time.title = 'Rough planning estimate, not an official figure';
  tags.append(time);
  if (trophy.missable) {
    const miss = document.createElement('span');
    miss.className = 'tag missable';
    miss.textContent = '⚠ Missable';
    tags.append(miss);
  }
  card.append(tags);

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  if (masked) {
    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.className = 'reveal-btn';
    reveal.textContent = 'Reveal spoiler';
    reveal.addEventListener('click', () => ctx.onReveal(trophy.id));
    actions.append(reveal);
  } else {
    const earn = document.createElement('button');
    earn.type = 'button';
    earn.className = `earn-btn${earned.has(trophy.name) ? ' earned' : ''}`;
    earn.textContent = earned.has(trophy.name) ? '✓ Earned' : 'Mark earned';
    earn.setAttribute('aria-pressed', earned.has(trophy.name) ? 'true' : 'false');
    earn.setAttribute('aria-label', earned.has(trophy.name) ? `Unmark ${trophy.name} as earned` : `Mark ${trophy.name} as earned`);
    earn.addEventListener('click', () => ctx.onToggleEarned(trophy.name));
    actions.append(earn);
    const plan = document.createElement('button');
    plan.type = 'button';
    plan.className = `plan-btn${planned.has(trophy.name) ? ' planned' : ''}`;
    plan.textContent = planned.has(trophy.name) ? '✓ Planned' : '+ Plan';
    plan.setAttribute('aria-pressed', planned.has(trophy.name) ? 'true' : 'false');
    plan.addEventListener('click', () => ctx.onTogglePlan(trophy.name));
    actions.append(plan);
  }
  card.append(actions);
  return card;
}
