// Main application wiring for VICE FRAME.
// Handles UI state, photo loading, canvas interaction (drag/pan, zoom, flip),
// layout switching, and one-photo-all distribution.

import { LAYOUTS } from './layouts.js';
import { drawCover, exportCover, getPanelRect } from './cover.js';
import { runShot } from './shots.js';

// Application State
export const state = {
  layoutId: 'classic6',
  gradeId: 'vice-sunset',
  grainEnabled: true,
  caption: {
    title: 'VICE FRAME',
    subtitle: 'CITY OF VICE',
    size: 1.0,
    position: 0.82,
  },
  panels: {}, // panelId -> { image, panX, panY, zoom, flipH }
  selectedPanelId: 0,
  aspectRatio: '1:1',
};

// DOM Elements
const canvas = document.getElementById('cover');
const statusMsg = document.getElementById('status');
const selectedPanelTitle = document.getElementById('selectedPanelTitle');
const panelZoom = document.getElementById('panelZoom');
const zoomValue = document.getElementById('zoomValue');
const flipPanelBtn = document.getElementById('flipPanelBtn');
const clearPanelBtn = document.getElementById('clearPanelBtn');
const panelPhotoInput = document.getElementById('panelPhotoInput');
const onePhotoInput = document.getElementById('onePhotoInput');
const onePhotoAllBtn = document.getElementById('onePhotoAllBtn');

const captionTitle = document.getElementById('captionTitle');
const captionSubtitle = document.getElementById('captionSubtitle');
const captionSize = document.getElementById('captionSize');
const captionSizeValue = document.getElementById('captionSizeValue');
const captionPos = document.getElementById('captionPos');
const captionPosValue = document.getElementById('captionPosValue');

const grainToggle = document.getElementById('grainToggle');
const layoutStrip = document.getElementById('layoutStrip');
const gradeStrip = document.getElementById('gradeStrip');

// Expose state and drawCover for headless test helpers
window.__viceFrame = {
  state,
  redraw,
  exportCover: (w, h) => exportCover(state, w, h),
};

/**
 * Loads an image from a URL or ObjectURL.
 */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Redraws the preview canvas.
 */
export function redraw() {
  const isCoverShot = document.body.classList.contains('shot-cover');
  drawCover(canvas, state, {
    isPreview: !isCoverShot,
    selectedPanelId: isCoverShot ? -1 : state.selectedPanelId,
  });
}

/**
 * Updates selected panel inspector UI controls.
 */
function updatePanelInspector() {
  const layout = LAYOUTS[state.layoutId] || LAYOUTS.classic6;
  const panelDef = layout.panels.find((p) => p.id === state.selectedPanelId) || layout.panels[0];
  const pId = panelDef ? panelDef.id : 0;
  state.selectedPanelId = pId;

  const pState = state.panels[pId] || { zoom: 1.0, panX: 0, panY: 0, flipH: false };
  if (selectedPanelTitle) {
    selectedPanelTitle.textContent = `PANEL: ${panelDef ? panelDef.name.toUpperCase() : 'HERO'} (${pId})`;
  }
  if (panelZoom) {
    panelZoom.value = pState.zoom || 1.0;
    zoomValue.textContent = `${Number(pState.zoom || 1.0).toFixed(2)}×`;
  }
}

/**
 * Sets an image for a specific panel.
 */
export function setPanelImage(panelId, img, options = {}) {
  const existing = state.panels[panelId] || {};
  state.panels[panelId] = {
    image: img,
    panX: options.panX !== undefined ? options.panX : (existing.panX || 0),
    panY: options.panY !== undefined ? options.panY : (existing.panY || 0),
    zoom: options.zoom !== undefined ? options.zoom : (existing.zoom || 1.0),
    flipH: options.flipH !== undefined ? options.flipH : (existing.flipH || false),
  };
  redraw();
}

/**
 * Distributes a single photo across every panel of the current layout with varied framing.
 */
export function distributeOnePhotoToAll(img) {
  const layout = LAYOUTS[state.layoutId] || LAYOUTS.classic6;
  const offsets = [
    { panX: 0, panY: 0, zoom: 1.05, flipH: false },
    { panX: -0.22, panY: -0.18, zoom: 1.45, flipH: false },
    { panX: 0.25, panY: 0.15, zoom: 1.35, flipH: true },
    { panX: -0.3, panY: 0.12, zoom: 1.5, flipH: false },
    { panX: 0.12, panY: -0.25, zoom: 1.4, flipH: true },
    { panX: 0.3, panY: 0.1, zoom: 1.6, flipH: false },
  ];

  layout.panels.forEach((p, idx) => {
    const off = offsets[idx % offsets.length];
    setPanelImage(p.id, img, off);
  });
  redraw();
}

// --------------------------------------------------------- Canvas Interactions

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartPanX = 0;
let dragStartPanY = 0;
let activeDragPanelId = -1;

function getCanvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function findPanelAtPoint(pt) {
  const layout = LAYOUTS[state.layoutId] || LAYOUTS.classic6;
  const gutter = Math.max(6, Math.round(Math.min(canvas.width, canvas.height) * 0.012));
  for (const p of layout.panels) {
    const rect = getPanelRect(p, canvas.width, canvas.height, gutter);
    if (pt.x >= rect.x && pt.x <= rect.x + rect.w && pt.y >= rect.y && pt.y <= rect.y + rect.h) {
      return { panel: p, rect };
    }
  }
  return null;
}

canvas.addEventListener('mousedown', (e) => {
  const pt = getCanvasPoint(e);
  const hit = findPanelAtPoint(pt);
  if (!hit) return;

  state.selectedPanelId = hit.panel.id;
  updatePanelInspector();

  const pState = state.panels[hit.panel.id];
  if (pState && pState.image) {
    isDragging = true;
    dragStartX = pt.x;
    dragStartY = pt.y;
    dragStartPanX = pState.panX || 0;
    dragStartPanY = pState.panY || 0;
    activeDragPanelId = hit.panel.id;
    canvas.style.cursor = 'grabbing';
  } else {
    // If empty panel clicked, trigger photo file picker
    panelPhotoInput.click();
  }
  redraw();
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging || activeDragPanelId === -1) return;
  const pt = getCanvasPoint(e);
  const layout = LAYOUTS[state.layoutId] || LAYOUTS.classic6;
  const panelDef = layout.panels.find((p) => p.id === activeDragPanelId);
  if (!panelDef) return;

  const gutter = Math.max(6, Math.round(Math.min(canvas.width, canvas.height) * 0.012));
  const rect = getPanelRect(panelDef, canvas.width, canvas.height, gutter);

  const dx = (pt.x - dragStartX) / rect.w;
  const dy = (pt.y - dragStartY) / rect.h;

  const pState = state.panels[activeDragPanelId] || {};
  pState.panX = dragStartPanX + dx;
  pState.panY = dragStartPanY + dy;
  state.panels[activeDragPanelId] = pState;

  redraw();
});

window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    activeDragPanelId = -1;
    canvas.style.cursor = 'crosshair';
  }
});

// Mouse wheel zoom
canvas.addEventListener('wheel', (e) => {
  const pt = getCanvasPoint(e);
  const hit = findPanelAtPoint(pt);
  if (!hit) return;

  e.preventDefault();
  state.selectedPanelId = hit.panel.id;
  updatePanelInspector();

  const pState = state.panels[hit.panel.id] || { zoom: 1.0, panX: 0, panY: 0, flipH: false };
  const delta = e.deltaY < 0 ? 0.08 : -0.08;
  const newZoom = Math.min(3.5, Math.max(1.0, (pState.zoom || 1.0) + delta));
  pState.zoom = parseFloat(newZoom.toFixed(2));
  state.panels[hit.panel.id] = pState;

  if (panelZoom) {
    panelZoom.value = pState.zoom;
    zoomValue.textContent = `${pState.zoom.toFixed(2)}×`;
  }
  redraw();
}, { passive: false });

// Drag and drop image files directly onto canvas panels
canvas.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

canvas.addEventListener('drop', async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  const pt = getCanvasPoint(e);
  const hit = findPanelAtPoint(pt);
  const targetId = hit ? hit.panel.id : state.selectedPanelId;

  try {
    const img = await loadImage(URL.createObjectURL(file));
    state.selectedPanelId = targetId;
    setPanelImage(targetId, img);
    updatePanelInspector();
    if (statusMsg) statusMsg.textContent = `Loaded photo into Panel ${targetId}`;
  } catch (err) {
    console.error(err);
  }
});

// --------------------------------------------------------- Controls Wiring

// File input for selected panel
panelPhotoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const img = await loadImage(URL.createObjectURL(file));
    setPanelImage(state.selectedPanelId, img);
    updatePanelInspector();
    if (statusMsg) statusMsg.textContent = `Updated Panel ${state.selectedPanelId}`;
  } catch (err) {
    console.error(err);
  }
  panelPhotoInput.value = '';
});

// Flip button
flipPanelBtn.addEventListener('click', () => {
  const pState = state.panels[state.selectedPanelId];
  if (pState) {
    pState.flipH = !pState.flipH;
    redraw();
  }
});

// Clear button
clearPanelBtn.addEventListener('click', () => {
  delete state.panels[state.selectedPanelId];
  redraw();
});

// Zoom slider
panelZoom.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  zoomValue.textContent = `${val.toFixed(2)}×`;
  const pState = state.panels[state.selectedPanelId] || { panX: 0, panY: 0, flipH: false };
  pState.zoom = val;
  state.panels[state.selectedPanelId] = pState;
  redraw();
});

// "One Photo, Every Panel"
onePhotoAllBtn.addEventListener('click', () => {
  onePhotoInput.click();
});

onePhotoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const img = await loadImage(URL.createObjectURL(file));
    distributeOnePhotoToAll(img);
    if (statusMsg) statusMsg.textContent = 'Distributed photo across all panels!';
  } catch (err) {
    console.error(err);
  }
  onePhotoInput.value = '';
});

// Sample Photos Quick Loaders
const loadPierBtn = document.getElementById('loadPierBtn');
const loadBoulevardBtn = document.getElementById('loadBoulevardBtn');
const mixSamplesBtn = document.getElementById('mixSamplesBtn');

let cachedPier = null;
let cachedBoulevard = null;

export async function getSamples() {
  if (!cachedPier) cachedPier = await loadImage('./samples/pier.jpg');
  if (!cachedBoulevard) cachedBoulevard = await loadImage('./samples/boulevard.jpg');
  return { pier: cachedPier, boulevard: cachedBoulevard };
}

loadPierBtn.addEventListener('click', async () => {
  const { pier } = await getSamples();
  distributeOnePhotoToAll(pier);
  if (statusMsg) statusMsg.textContent = 'Loaded Pier across panels';
});

loadBoulevardBtn.addEventListener('click', async () => {
  const { boulevard } = await getSamples();
  distributeOnePhotoToAll(boulevard);
  if (statusMsg) statusMsg.textContent = 'Loaded Boulevard across panels';
});

mixSamplesBtn.addEventListener('click', async () => {
  await loadDefaultMontage();
  if (statusMsg) statusMsg.textContent = 'Mixed sample montage loaded';
});

/**
 * Pre-fills the cover with a stunning mixed sample montage.
 */
export async function loadDefaultMontage() {
  const { pier, boulevard } = await getSamples();
  const layout = LAYOUTS[state.layoutId] || LAYOUTS.classic6;

  // Curate vibrant GTA crops across panels
  layout.panels.forEach((p, idx) => {
    const isHero = p.id === 0;
    const img = (idx % 2 === 0) ? boulevard : pier;
    const zooms = [1.1, 1.35, 1.4, 1.25, 1.3, 1.45];
    const pansX = [-0.05, 0.12, 0.2, -0.15, 0.05, 0.15];
    const pansY = [0, -0.08, 0.1, 0.08, 0.12, -0.05];
    const flips = [false, false, true, false, false, true];

    setPanelImage(p.id, img, {
      zoom: isHero ? 1.1 : (zooms[idx % zooms.length] || 1.2),
      panX: pansX[idx % pansX.length] || 0,
      panY: pansY[idx % pansY.length] || 0,
      flipH: flips[idx % flips.length] || false,
    });
  });

  updatePanelInspector();
  redraw();
}

// Layout Switcher
layoutStrip.addEventListener('click', (e) => {
  const btn = e.target.closest('.layout-chip');
  if (!btn) return;
  const layoutKey = btn.dataset.layout;
  if (!LAYOUTS[layoutKey]) return;

  layoutStrip.querySelectorAll('.layout-chip').forEach((c) => c.classList.remove('active'));
  btn.classList.add('active');

  state.layoutId = layoutKey;
  state.selectedPanelId = 0;
  updatePanelInspector();
  redraw();
});

// Color Grade Switcher
gradeStrip.addEventListener('click', (e) => {
  const btn = e.target.closest('.grade-chip');
  if (!btn) return;
  const gradeKey = btn.dataset.grade;

  gradeStrip.querySelectorAll('.grade-chip').forEach((c) => c.classList.remove('active'));
  btn.classList.add('active');

  state.gradeId = gradeKey;
  redraw();
});

// Grain Texture Toggle
grainToggle.addEventListener('change', (e) => {
  state.grainEnabled = e.target.checked;
  redraw();
});

// Caption Inputs
captionTitle.addEventListener('input', (e) => {
  state.caption.title = e.target.value;
  redraw();
});

captionSubtitle.addEventListener('input', (e) => {
  state.caption.subtitle = e.target.value;
  redraw();
});

captionSize.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  captionSizeValue.textContent = `${val.toFixed(2)}×`;
  state.caption.size = val;
  redraw();
});

captionPos.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  captionPosValue.textContent = `${Math.round(val * 100)}%`;
  state.caption.position = val;
  redraw();
});

// Aspect Ratio Selector
document.querySelectorAll('.aspect-pills .pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.aspect-pills .pill').forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');

    const w = parseInt(pill.dataset.w, 10);
    const h = parseInt(pill.dataset.h, 10);
    canvas.width = w;
    canvas.height = h;
    canvas.style.aspectRatio = `${w} / ${h}`;
    state.aspectRatio = pill.dataset.aspect;
    redraw();
  });
});

// Export Buttons
document.querySelectorAll('.btn-export').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const w = parseInt(btn.dataset.w, 10);
    const h = parseInt(btn.dataset.h, 10);
    btn.disabled = true;
    if (statusMsg) statusMsg.textContent = `Exporting ${w} × ${h}...`;

    await exportCover(state, w, h);

    if (statusMsg) statusMsg.textContent = `Downloaded vice-frame-cover-${w}x${h}.png!`;
    setTimeout(() => {
      btn.disabled = false;
      if (statusMsg) statusMsg.textContent = '';
    }, 2500);
  });
});

// --------------------------------------------------------- Initialization

async function init() {
  // Ensure Anton font is loaded before initial canvas render
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Fallback gracefully
    }
  }

  const urlParams = new URLSearchParams(location.search);
  const shot = urlParams.get('shot');

  if (shot) {
    await runShot(shot, urlParams, state, redraw);
  } else {
    // Normal interactive load: initialize default montage
    try {
      await loadDefaultMontage();
    } catch (e) {
      console.warn('Initial sample load deferred:', e);
      redraw();
    }
  }
}

// Trigger initial setup
init();
