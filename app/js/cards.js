// Sunset Platinum — trophy cards: one card per trophy with its official name,
// description and grade, the guide in our own words, its source, its kind and
// missable tags, and the Earn / Plan buttons. When the spoiler setting is on, a
// story trophy that is not earned yet shows a masked card until revealed.
import { categoryOf, gradeOf } from './catalog.js';

export function isMasked(trophy, spoilers, earned, revealed) {
  return spoilers && trophy.category === 'story' && !earned.has(trophy.name) && !revealed.has(trophy.id);
}

export function buildTrophyCard(trophy, ctx) {
  const { earned, planned, spoilers, revealed } = ctx;
  const masked = isMasked(trophy, spoilers, earned, revealed);
  const card = document.createElement('article');
  card.className = `card grade-${trophy.grade}${earned.has(trophy.name) ? ' earned' : ''}`;

  const head = document.createElement('div');
  head.className = 'card-head';
  const title = document.createElement('h3');
  title.textContent = masked ? 'Hidden story trophy' : trophy.name;
  const badge = document.createElement('span');
  badge.className = `grade-badge ${trophy.grade}`;
  badge.textContent = gradeOf(trophy);
  head.append(title, badge);
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
    earn.setAttribute('aria-label', earned.has(trophy.name) ? `Unmark ${trophy.name} as earned` : `Mark ${trophy.name} as earned`);
    earn.addEventListener('click', () => ctx.onToggleEarned(trophy.name));
    actions.append(earn);
    const plan = document.createElement('button');
    plan.type = 'button';
    plan.className = `plan-btn${planned.has(trophy.name) ? ' planned' : ''}`;
    plan.textContent = planned.has(trophy.name) ? '✓ Planned' : '+ Plan';
    plan.addEventListener('click', () => ctx.onTogglePlan(trophy.name));
    actions.append(plan);
  }
  card.append(actions);
  return card;
}
