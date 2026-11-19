// Sunset Platinum — boot and wiring.
//
// Loads the trophy data, owns the player's state and the toolbar's
// choices, and re-renders every view whenever either changes. Tabs switch
// views; the checklist, roadmap, missables, planner and settings all read
// from the same state, so a tick in one place shows everywhere.

import { TOTAL_TROPHIES } from './config.js';
import { loadTrophies } from './data.js';
import { nextUpPicks, visibleTrophies } from './filters.js';
import {
  exportProgressFile,
  loadSettings,
  loadState,
  parseImportedProgress,
  resetAllProgress,
  saveSettings,
  saveState,
  setTrophyCounter,
  setTrophyNote,
  toggleEarned,
} from './store.js';
import {
  renderChecklist,
  renderDetailPane,
  renderMissables,
  renderPlanner,
  renderProgressHeader,
  renderRoadmap,
  renderSettingsSummary,
} from './views.js';

const toolbar = {
  kind: 'all',
  grade: 'all',
  searchText: '',
  hideEarned: false,
};

let trophies = [];
let state = loadState();
let settings = loadSettings();
let selectedId = 15;

function renderAll() {
  renderProgressHeader(trophies, state);
  const visible = visibleTrophies(trophies, state, toolbar);
  renderChecklist(trophies, state, settings, visible, selectTrophy, selectedId);
  renderDetailPane(trophies, state, settings, selectedId, saveNote, saveCounter);
  renderRoadmap(trophies, state, selectTrophy);
  renderMissables(trophies, state, settings, selectTrophy);
  renderPlanner(nextUpPicks(trophies, state, 5), state, selectTrophy);
  renderSettingsSummary(state);
  syncSpoilerToggles();
}

function selectTrophy(trophyId) {
  selectedId = trophyId;
  showView('checklist');
  renderAll();
  document.getElementById('detailPane').scrollIntoView({ block: 'nearest' });
}

function saveNote(trophyId, noteText) {
  setTrophyNote(state, trophyId, noteText);
  renderSettingsSummary(state);
}

function saveCounter(trophyId, value) {
  setTrophyCounter(state, trophyId, value);
  renderSettingsSummary(state);
}

function applyEarnedToggle(trophyId) {
  toggleEarned(state, trophyId);
  renderAll();
}

function showView(viewName) {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('is-active', tab.dataset.view === viewName);
  }
  for (const view of document.querySelectorAll('.view')) {
    view.classList.toggle('is-active', view.id === `view-${viewName}`);
  }
}

function syncSpoilerToggles() {
  for (const id of ['spoilerToggle', 'spoilerToggleSettings']) {
    const box = document.getElementById(id);
    if (box) box.checked = settings.spoilerSafe;
  }
}

function wireToolbar() {
  document.getElementById('searchInput').addEventListener('input', (event) => {
    toolbar.searchText = event.target.value;
    renderAll();
  });
  document.getElementById('gradeSelect').addEventListener('change', (event) => {
    toolbar.grade = event.target.value;
    renderAll();
  });
  document.getElementById('hideEarned').addEventListener('change', (event) => {
    toolbar.hideEarned = event.target.checked;
    renderAll();
  });
  for (const chip of document.querySelectorAll('.chip')) {
    chip.addEventListener('click', () => {
      toolbar.kind = chip.dataset.kind;
      for (const other of document.querySelectorAll('.chip')) {
        other.classList.toggle('is-active', other === chip);
      }
      renderAll();
    });
  }
  for (const id of ['spoilerToggle', 'spoilerToggleSettings']) {
    document.getElementById(id).addEventListener('change', (event) => {
      settings.spoilerSafe = event.target.checked;
      saveSettings(settings);
      renderAll();
    });
  }
}

function wireTabs() {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => {
      showView(tab.dataset.view);
      renderAll();
    });
  }
}

function wireSaveControls() {
  document.getElementById('exportBtn').addEventListener('click', () => {
    exportProgressFile(state);
    document.getElementById('importStatus').textContent = 'Progress exported — check your downloads folder.';
  });
  document.getElementById('importInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const status = document.getElementById('importStatus');
    if (!file) return;
    try {
      const imported = parseImportedProgress(await file.text());
      state = imported;
      saveState(state);
      renderAll();
      status.textContent = `Imported ${new Set(state.earned).size} earned trophies from ${file.name}.`;
    } catch (error) {
      status.textContent = `Could not import that file: ${error.message}`;
    }
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (window.confirm('Reset all progress, notes and counters?')) {
      state = resetAllProgress();
      renderAll();
    }
  });
}

async function boot() {
  // Views reach back through this one handle for checkbox toggles.
  window.__sunsetActions = { toggleEarned: applyEarnedToggle };
  try {
    trophies = await loadTrophies();
  } catch (error) {
    document.getElementById('trophyList').textContent = `Could not load the trophy list: ${error.message}`;
    return;
  }
  if (trophies.length !== TOTAL_TROPHIES) {
    document.getElementById('resultLine').textContent =
      `Warning: expected ${TOTAL_TROPHIES} trophies, loaded ${trophies.length}.`;
  }
  wireToolbar();
  wireTabs();
  wireSaveControls();
  renderAll();
}

boot();
