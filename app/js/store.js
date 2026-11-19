// Sunset Platinum — saved progress.
//
// Everything the player ticks, writes or counts is kept in localStorage
// under one key, so the guide works offline and remembers the player.
// Export downloads that state as a JSON file; import reads such a file
// back. Nothing ever leaves the machine.

import { SETTINGS_KEY, STORAGE_KEY } from './config.js';

export function blankState() {
  return { earned: [], notes: {}, counters: {} };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((id) => Number.isInteger(id)) : [],
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
    };
  } catch {
    return blankState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function earnedIdSet(state) {
  return new Set(state.earned);
}

export function toggleEarned(state, trophyId) {
  const earned = earnedIdSet(state);
  if (earned.has(trophyId)) earned.delete(trophyId);
  else earned.add(trophyId);
  state.earned = [...earned].sort((a, b) => a - b);
  saveState(state);
  return state;
}

export function setTrophyNote(state, trophyId, noteText) {
  if (noteText.trim() === '') delete state.notes[trophyId];
  else state.notes[trophyId] = noteText;
  saveState(state);
}

export function setTrophyCounter(state, trophyId, value) {
  const amount = Math.max(0, Math.floor(Number(value) || 0));
  if (amount === 0) delete state.counters[trophyId];
  else state.counters[trophyId] = amount;
  saveState(state);
}

export function resetAllProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return blankState();
}

export function exportProgressFile(state) {
  const payload = JSON.stringify({ app: 'sunset-platinum', version: 1, ...state }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a progress file.');
  const state = blankState();
  if (Array.isArray(parsed.earned)) state.earned = parsed.earned.filter((id) => Number.isInteger(id));
  if (parsed.notes && typeof parsed.notes === 'object') state.notes = parsed.notes;
  if (parsed.counters && typeof parsed.counters === 'object') state.counters = parsed.counters;
  return state;
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { spoilerSafe: false };
    return { spoilerSafe: Boolean(JSON.parse(raw).spoilerSafe) };
  } catch {
    return { spoilerSafe: false };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
