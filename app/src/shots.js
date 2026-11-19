// Automated screenshot scene configuration for VICE FRAME.
// Configures layouts, photos, color grades, and captions based on ?shot= query param.

import { LAYOUTS } from './layouts.js';
import { loadImage } from './main.js';

export async function runShot(shot, query, state, redraw) {
  // Pre-load sample images
  const pier = await loadImage('./samples/pier.jpg');
  const boulevard = await loadImage('./samples/boulevard.jpg');

  if (shot === 'cover' || shot === '1-cover') {
    // 1-cover: Clean full-bleed cover export. Classic 6-panel, Vice Sunset grade
    document.body.classList.add('shot-cover');
    state.layoutId = 'classic6';
    state.gradeId = 'vice-sunset';
    state.grainEnabled = true;
    state.caption = {
      title: query.get('title') || query.get('caption') || 'VICE FRAME',
      subtitle: query.get('subtitle') || 'CITY OF VICE',
      size: 1.05,
      position: 0.82,
    };

    const layout = LAYOUTS.classic6;
    state.panels = {
      0: { image: boulevard, zoom: 1.1, panX: -0.05, panY: 0, flipH: false },
      1: { image: pier, zoom: 1.35, panX: 0.1, panY: -0.08, flipH: false },
      2: { image: boulevard, zoom: 1.45, panX: 0.22, panY: 0.12, flipH: true },
      3: { image: pier, zoom: 1.25, panX: -0.15, panY: 0.08, flipH: false },
      4: { image: boulevard, zoom: 1.3, panX: 0.05, panY: 0.14, flipH: false },
      5: { image: pier, zoom: 1.45, panX: 0.18, panY: -0.05, flipH: true },
    };

  } else if (shot === 'editor' || shot === '2-editor') {
    // 2-editor: Full desktop UI showing controls, panels, and live canvas preview
    state.layoutId = 'classic6';
    state.gradeId = 'vice-sunset';
    state.grainEnabled = true;
    state.selectedPanelId = 0;
    state.caption = {
      title: query.get('title') || 'VICE FRAME',
      subtitle: query.get('subtitle') || 'CITY OF VICE',
      size: 1.0,
      position: 0.82,
    };

    state.panels = {
      0: { image: boulevard, zoom: 1.1, panX: -0.05, panY: 0, flipH: false },
      1: { image: pier, zoom: 1.35, panX: 0.1, panY: -0.08, flipH: false },
      2: { image: boulevard, zoom: 1.4, panX: 0.2, panY: 0.1, flipH: true },
      3: { image: pier, zoom: 1.25, panX: -0.15, panY: 0.08, flipH: false },
      4: { image: boulevard, zoom: 1.3, panX: 0.05, panY: 0.12, flipH: false },
      5: { image: pier, zoom: 1.45, panX: 0.15, panY: -0.05, flipH: true },
    };

  } else if (shot === 'cover2' || shot === '3-cover2') {
    // 3-cover2: Second exported cover, Triptych 3-panel, Neon Night grade
    document.body.classList.add('shot-cover');
    state.layoutId = 'triptych3';
    state.gradeId = 'neon-night';
    state.grainEnabled = true;
    state.caption = {
      title: query.get('title') || 'NEON HEAT',
      subtitle: query.get('subtitle') || 'LEONIDA NIGHTFALL',
      size: 1.1,
      position: 0.84,
    };

    state.panels = {
      0: { image: boulevard, zoom: 1.4, panX: -0.1, panY: 0, flipH: false },
      1: { image: pier, zoom: 1.25, panX: 0, panY: -0.1, flipH: false },
      2: { image: boulevard, zoom: 1.5, panX: 0.25, panY: 0.15, flipH: true },
    };

  } else if (shot === 'editor2' || shot === '4-editor2') {
    // 4-editor2: Editor in Quad 4 layout, Golden Hour grade, caption being edited
    state.layoutId = 'quad4';
    state.gradeId = 'golden-hour';
    state.grainEnabled = true;
    state.selectedPanelId = 1;
    state.caption = {
      title: query.get('title') || 'GOLDEN STRIP',
      subtitle: query.get('subtitle') || 'VICE BEACH PATROL',
      size: 1.05,
      position: 0.80,
    };

    state.panels = {
      0: { image: pier, zoom: 1.3, panX: -0.1, panY: -0.05, flipH: false },
      1: { image: boulevard, zoom: 1.25, panX: 0.15, panY: 0.05, flipH: false },
      2: { image: boulevard, zoom: 1.4, panX: -0.2, panY: 0.1, flipH: true },
      3: { image: pier, zoom: 1.35, panX: 0.1, panY: 0, flipH: false },
    };

    // Update active chips in UI if elements exist
    const lChip = document.querySelector('.layout-chip[data-layout="quad4"]');
    if (lChip) {
      document.querySelectorAll('.layout-chip').forEach((c) => c.classList.remove('active'));
      lChip.classList.add('active');
    }
    const gChip = document.querySelector('.grade-chip[data-grade="golden-hour"]');
    if (gChip) {
      document.querySelectorAll('.grade-chip').forEach((c) => c.classList.remove('active'));
      gChip.classList.add('active');
    }
    const titleInp = document.getElementById('captionTitle');
    if (titleInp) titleInp.value = state.caption.title;
    const subInp = document.getElementById('captionSubtitle');
    if (subInp) subInp.value = state.caption.subtitle;
  }

  redraw();

  // Signal ready for headless screenshot capture
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
