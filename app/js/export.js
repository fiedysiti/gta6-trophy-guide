// Sunset Platinum — progress export, import and the short share summary.
// This module owns the file format the Export / Import buttons speak: one
// JSON document with the game, the export time, a format version and the
// progress itself ({ earned, plan } as trophy names). It leans on storage.js
// for the actual localStorage keys, the download and the clipboard, and on
// filtering.js to count the missable trophies still open.
import {
  EARNED_KEY, PLAN_KEY, STORAGE_VERSION, copyProgressToClipboard,
  downloadProgress, loadIdSet, replaceProgress,
} from './storage.js';
import { openMissables } from './filtering.js';

export const EXPORT_FILENAME = 'sunset-platinum-progress.json';
export const EXPORT_GAME = 'Grand Theft Auto VI';

// The payload an export writes: the earned and planned trophy names in
// catalogue order, so a file stays readable and diffable by hand.
export function buildExportPayload(trophies, earned, planned) {
  const namesInOrder = (set) => trophies.filter((t) => set.has(t.name)).map((t) => t.name);
  return {
    game: EXPORT_GAME,
    exportedAt: new Date().toISOString(),
    version: STORAGE_VERSION,
    progress: {
      earned: namesInOrder(earned),
      plan: namesInOrder(planned),
    },
  };
}

// Build the payload from the live state and trigger the file download.
// Returns the payload so the toolbar can report what was written.
export function exportProgress(trophies, earned, planned) {
  const payload = buildExportPayload(trophies, earned, planned);
  downloadProgress(EXPORT_FILENAME, payload);
  return payload;
}

// Read one export file and turn it back into sets the app can use. Anything
// that is not a Sunset Platinum export — wrong shape, unknown version,
// progress that is not a list of trophy names — is refused with a plain
// error message instead of silently dropping trophies.
export async function importProgress(file, trophies) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('That file is not a Sunset Platinum progress export.');
  }
  if (typeof parsed.version !== 'number') {
    throw new Error('That file has no format version — it is not a progress export.');
  }
  const progress = parsed.progress;
  if (!progress || typeof progress !== 'object') {
    throw new Error('That file has no progress in it.');
  }
  const known = new Set(trophies.map((t) => t.name));
  const kept = { earned: [], plan: [] };
  let skipped = 0;
  for (const slot of ['earned', 'plan']) {
    const names = progress[slot];
    if (names !== undefined && !Array.isArray(names)) {
      throw new Error(`The "${slot}" list in that file is not a list of trophy names.`);
    }
    for (const name of names ?? []) {
      if (typeof name === 'string' && known.has(name)) kept[slot].push(name);
      else skipped += 1;
    }
  }
  replaceProgress(kept.earned, kept.plan);
  return {
    earned: loadIdSet(EARNED_KEY),
    plan: loadIdSet(PLAN_KEY),
    skipped,
  };
}

// The one-line hunt summary: "Sunset Platinum — X/55 trophies (Y%) —
// Z missable tersisa". Short enough to paste anywhere.
export function buildSummaryText(trophies, earned) {
  const total = trophies.length;
  const done = earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const open = openMissables(trophies, earned).length;
  return `Sunset Platinum — ${done}/${total} trophies (${pct}%) — ${open} missable tersisa`;
}

// Copy the short summary to the clipboard and hand the text back so the
// toolbar can show it in the status line.
export async function copySummary(trophies, earned) {
  const text = buildSummaryText(trophies, earned);
  await copyProgressToClipboard(text);
  return text;
}
