// Sunset Platinum — browser persistence: earned trophies, planned route, the
// spoiler setting, the "hide earned" switch and the sort order all live in
// localStorage, and progress can be exported to a file, imported back, or
// copied to the clipboard as a short text summary. Nothing here ever touches
// the network.
export const EARNED_KEY = 'sunset-platinum-earned-v1';
export const PLAN_KEY = 'sunset-platinum-plan-v1';
export const SPOILER_KEY = 'sunset-platinum-spoilers-v1';
export const HIDE_EARNED_KEY = 'sunset-platinum-hide-earned-v1';
export const SORT_KEY = 'sunset-platinum-sort-v1';

export function loadIdSet(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveIdSet(key, set) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

export function loadSpoilers() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

export function saveSpoilers(on) {
  localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
}

export function loadHideEarned() {
  return localStorage.getItem(HIDE_EARNED_KEY) === '1';
}

export function saveHideEarned(on) {
  localStorage.setItem(HIDE_EARNED_KEY, on ? '1' : '0');
}

export function loadSort() {
  const saved = localStorage.getItem(SORT_KEY);
  return saved === 'name' || saved === 'grade' ? saved : 'stage';
}

export function saveSort(sortKey) {
  localStorage.setItem(SORT_KEY, sortKey);
}

export function downloadProgress(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

// One tidy text summary of the hunt so far — the shape the "Copy progress"
// button puts on the clipboard. Missables still open get their own line,
// because those are the trophies a player most wants to remember.
export function buildProgressSummary({ trophies, earned, planned, hoursLeft }) {
  const total = trophies.length;
  const done = earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const lines = [`Sunset Platinum — ${done}/${total} trophies (${pct}%)`];
  const openMissables = trophies.filter((t) => t.missable && !earned.has(t.name));
  if (openMissables.length) {
    lines.push(`Missables still open (${openMissables.length}): ${openMissables.map((t) => t.name).join(', ')}`);
  }
  if (planned.size) {
    const nextUp = trophies.filter((t) => planned.has(t.name)).slice(0, 3).map((t) => t.name);
    lines.push(`Planned next (${planned.size}): ${nextUp.join(', ')}${planned.size > 3 ? ', …' : ''}`);
  }
  lines.push(`Rough time left: about ${hoursLeft}h of hunting.`);
  return lines.join('\n');
}

export async function copyProgressToClipboard(summary) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(summary);
    return;
  }
  // Older browsers without the async clipboard: fall back to a hidden
  // textarea and the legacy copy command.
  const box = document.createElement('textarea');
  box.value = summary;
  box.style.position = 'fixed';
  box.style.opacity = '0';
  document.body.append(box);
  box.select();
  const copied = document.execCommand('copy');
  box.remove();
  if (!copied) throw new Error('clipboard copy failed');
}

export async function readProgressFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const earned = Array.isArray(parsed.earned) ? parsed.earned : [];
  const plan = Array.isArray(parsed.plan) ? parsed.plan : [];
  return { earned, plan };
}
