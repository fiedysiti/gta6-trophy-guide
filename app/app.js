// Sunset Platinum — app bootstrap: loads the catalogue, owns the earned / planned /
// spoiler state, wires the toolbar, tabs and filters, and renders every view.
// The app sets window.__shotReady once the first render is done so screenshots
// can be taken at a stable moment.
import { loadCatalog } from './js/catalog.js';
import { applyFilters, countByGrade } from './js/filtering.js';
import { buildTrophyCard } from './js/cards.js';
import { renderMissableList, renderPlanList, renderRoadmap } from './js/screens.js';
import {
  EARNED_KEY, PLAN_KEY, downloadProgress, loadIdSet, loadSpoilers, readProgressFile,
  saveIdSet, saveSpoilers,
} from './js/storage.js';

const $ = (id) => document.getElementById(id);
const VIEWS = ['checklist', 'roadmap', 'planner', 'missables'];

const state = {
  trophies: [],
  earned: loadIdSet(EARNED_KEY),
  planned: loadIdSet(PLAN_KEY),
  spoilers: loadSpoilers(),
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
  $('missableBadge').textContent = String(state.trophies.filter((t) => t.missable).length);
}

function renderChecklist() {
  const ctx = cardContext();
  const shown = applyFilters(state.trophies, state.filters, state.earned);
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
  renderMissableList($('missableList'), $('missableCount'), state.trophies, (t) => buildTrophyCard(t, cardContext()));
  $('spoilerToggle').checked = state.spoilers;
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

function wireToolbar() {
  $('spoilerToggle').addEventListener('change', (event) => {
    state.spoilers = event.target.checked;
    state.revealed.clear();
    saveSpoilers(state.spoilers);
    renderAll();
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
}

async function boot() {
  const doc = await loadCatalog();
  state.trophies = doc.trophies.slice().sort((a, b) => a.id - b.id);
  wireToolbar();
  wireTabsAndFilters();
  showView(startingView());
  renderAll();
  window.__shotReady = true;
}

boot().catch((error) => {
  document.getElementById('resultCount').textContent = `Could not load the trophy list: ${error.message}`;
  window.__shotReady = true;
});
