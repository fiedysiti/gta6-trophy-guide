// Sunset Platinum — browser persistence: earned trophies, planned route and the
// spoiler setting all live in localStorage, and progress can be exported to a
// file and imported back. Nothing here ever touches the network.
export const EARNED_KEY = 'sunset-platinum-earned-v1';
export const PLAN_KEY = 'sunset-platinum-plan-v1';
export const SPOILER_KEY = 'sunset-platinum-spoilers-v1';

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

export function downloadProgress(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function readProgressFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const earned = Array.isArray(parsed.earned) ? parsed.earned : [];
  const plan = Array.isArray(parsed.plan) ? parsed.plan : [];
  return { earned, plan };
}
