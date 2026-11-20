// Sunset Platinum — app bootstrap: loads the catalogue, owns the earned / planned /
// spoiler state, wires the toolbar, tabs, filters, sort order and keyboard
// shortcuts, and renders every view. Shortcuts: "/" jumps to the search box,
// "h" toggles "hide earned". The app sets window.__shotReady once the first
// render is done so screenshots can be taken at a stable moment.
import { loadCatalog } from './js/catalog.js';
import { applyFilters, countByGrade, estimateRemainingHours, openMissables, sortTrophies } from './js/filtering.js';
import { buildTrophyCard } from './js/cards.js';
import { renderMissableList, renderPlanList, renderRoadmap } from './js/screens.js';
import {
  EARNED_KEY, PLAN_KEY, buildProgressSummary, copyProgressToClipboard,
  downloadProgress, loadHideEarned, loadIdSet, loadSort, loadSpoilers, readProgressFile,
  saveHideEarned, saveIdSet, saveSort, saveSpoilers,
} from './js/storage.js';

const $ = (id) => document.getElementById(id);
const VIEWS = ['checklist', 'roadmap', 'planner', 'missables'];

const state = {
  trophies: [],
  earned: loadIdSet(EARNED_KEY),
  planned: loadIdSet(PLAN_KEY),
  spoilers: loadSpoilers(),
  hideEarned: loadHideEarned(),
  sort: loadSort(),
  revealed: new Set(),
  view: 'checklist',
  filters: { query: '', grade: 'all', category: 'all', missable: 'all', earned: 'all' },
};

function cardContext() {
  return {
    earned: state.earned,
    planned: state.planned,
    spoilers: state.spoilers,
    revealed: state.revealed,
    onToggleEarned: (name) => {
      if (state.earned.has(name)) state.earned.delete(name);
      else state.earned.add(name);
      saveIdSet(EARNED_KEY, state.earned);
      renderAll();
    },
    onTogglePlan: (name) => {
      if (state.planned.has(name)) state.planned.delete(name);
      else state.planned.add(name);
      saveIdSet(PLAN_KEY, state.planned);
      renderAll();
    },
    onReveal: (id) => {
      state.revealed.add(id);
      renderAll();
    },
  };
}

function renderProgress() {
  const total = state.trophies.length;
  const done = state.earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  $('progressText').textContent = `${done} / ${total} earned`;
  $('progressPercent').textContent = `${pct}% to platinum`;
  $('progressFill').style.width = `${pct}%`;
  const counts = countByGrade(state.trophies, state.earned);
  $('gradeCounts').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${counts[g][0]}/${counts[g][1]} ${g}`)
    .join(' · ');
  const hoursLeft = estimateRemainingHours(state.trophies, state.earned);
  const open = openMissables(state.trophies, state.earned).length;
  $('statsLine').textContent = hoursLeft > 0
    ? `About ${hoursLeft}h of hunting left · ${open} missable ${open === 1 ? 'trophy' : 'trophies'} still open`
    : 'Every trophy earned — the platinum is yours.';
  $('missableBadge').textContent = String(state.trophies.filter((t) => t.missable).length);
}

function renderChecklist() {
  const ctx = cardContext();
  const filtered = applyFilters(state.trophies, { ...state.filters, hideEarned: state.hideEarned }, state.earned);
  const shown = sortTrophies(filtered, state.sort);
  const grid = $('cards');
  grid.replaceChildren();
  for (const trophy of shown) grid.append(buildTrophyCard(trophy, ctx));
  $('resultCount').textContent = `Showing ${shown.length} of ${state.trophies.length} trophies`;
  $('emptyNote').hidden = shown.length > 0;
}

function renderAll() {
  renderProgress();
  renderChecklist();
  renderRoadmap($('roadmap'), state.trophies, state.earned);
  renderPlanList($('planner'), $('planCount'), $('planEmpty'), state.trophies, state.planned, (t) => buildTrophyCard(t, cardContext()));
  renderMissableList($('missableList'), $('missableCount'), state.trophies, state.earned, (t) => buildTrophyCard(t, cardContext()));
  $('spoilerToggle').checked = state.spoilers;
  $('hideEarnedToggle').checked = state.hideEarned;
  $('sortSelect').value = state.sort;
}

function showView(name) {
  state.view = VIEWS.includes(name) ? name : 'checklist';
  for (const view of VIEWS) {
    $(`view-${view}`).classList.toggle('active', view === state.view);
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === state.view);
  }
  history.replaceState(null, '', `?view=${state.view}`);
}

// The starting view comes from ?view= in the URL, or from a #roadmap-style hash.
function startingView() {
  const params = new URLSearchParams(location.search);
  if (params.get('view')) return params.get('view');
  const hash = location.hash.replace('#', '');
  return VIEWS.includes(hash) ? hash : 'checklist';
}

function flashCopyButton(button, ok) {
  const original = button.textContent;
  button.textContent = ok ? '✓ Copied!' : 'Copy failed — try Export';
  button.disabled = true;
  setTimeout(() => {
    button.textContent = original;
    button.disabled = false;
  }, 1800);
}

function wireToolbar() {
  $('spoilerToggle').addEventListener('change', (event) => {
    state.spoilers = event.target.checked;
    state.revealed.clear();
    saveSpoilers(state.spoilers);
    renderAll();
  });
  $('copyBtn').addEventListener('click', async (event) => {
    const summary = buildProgressSummary({
      trophies: state.trophies,
      earned: state.earned,
      planned: state.planned,
      hoursLeft: estimateRemainingHours(state.trophies, state.earned),
    });
    try {
      await copyProgressToClipboard(summary);
      flashCopyButton(event.currentTarget, true);
    } catch {
      flashCopyButton(event.currentTarget, false);
    }
  });
  $('exportBtn').addEventListener('click', () => {
    downloadProgress('sunset-platinum-progress.json', {
      earned: [...state.earned],
      plan: [...state.planned],
    });
  });
  $('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const { earned, plan } = await readProgressFile(file);
      state.earned = new Set(earned.filter((n) => state.trophies.some((t) => t.name === n)));
      state.planned = new Set(plan.filter((n) => state.trophies.some((t) => t.name === n)));
      saveIdSet(EARNED_KEY, state.earned);
      saveIdSet(PLAN_KEY, state.planned);
      renderAll();
    } catch {
      alert('That file could not be imported — it is not a Sunset Platinum progress file.');
    }
    event.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (!confirm('Clear all earned trophies and your plan?')) return;
    state.earned.clear();
    state.planned.clear();
    state.revealed.clear();
    saveIdSet(EARNED_KEY, state.earned);
    saveIdSet(PLAN_KEY, state.planned);
    renderAll();
  });
}

function wireTabsAndFilters() {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  }
  $('searchInput').addEventListener('input', (event) => {
    state.filters.query = event.target.value;
    renderChecklist();
  });
  $('gradeFilter').addEventListener('change', (event) => {
    state.filters.grade = event.target.value;
    renderChecklist();
  });
  $('categoryFilter').addEventListener('change', (event) => {
    state.filters.category = event.target.value;
    renderChecklist();
  });
  $('missableFilter').addEventListener('change', (event) => {
    state.filters.missable = event.target.value;
    renderChecklist();
  });
  $('earnedFilter').addEventListener('change', (event) => {
    state.filters.earned = event.target.value;
    renderChecklist();
  });
  $('sortSelect').addEventListener('change', (event) => {
    state.sort = event.target.value;
    saveSort(state.sort);
    renderChecklist();
    event.currentTarget.blur();
  });
  $('hideEarnedToggle').addEventListener('change', (event) => {
    state.hideEarned = event.target.checked;
    saveHideEarned(state.hideEarned);
    renderChecklist();
    event.currentTarget.blur();
  });
}

// Keyboard shortcuts: "/" focuses the search box, "h" flips the hide-earned
// switch. Typing inside a field never triggers a shortcut.
function wireShortcuts() {
  document.addEventListener('keydown', (event) => {
    const tag = event.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === '/') {
      event.preventDefault();
      showView('checklist');
      $('searchInput').focus();
    } else if (event.key === 'h') {
      state.hideEarned = !state.hideEarned;
      saveHideEarned(state.hideEarned);
      renderAll();
    }
  });
}

async function boot() {
  const doc = await loadCatalog();
  state.trophies = doc.trophies.slice().sort((a, b) => a.id - b.id);
  wireToolbar();
  wireTabsAndFilters();
  wireShortcuts();
  showView(startingView());
  renderAll();
  window.__shotReady = true;
}

boot().catch((error) => {
  document.getElementById('resultCount').textContent = `Could not load the trophy list: ${error.message}`;
  window.__shotReady = true;
});
