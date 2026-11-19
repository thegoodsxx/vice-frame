// Composition and render engine for VICE FRAME.
// Handles multi-panel layout rendering, photo pan/zoom/flip, color grading,
// GTA-style captioned lettering, and high-resolution export.

import { LAYOUTS } from './layouts.js';
import { GRADES, applyGrain } from './grades.js';

/**
 * Calculates pixel rectangle for a panel given canvas dimensions and gutter width.
 */
export function getPanelRect(panelDef, canvasWidth, canvasHeight, gutter) {
  const halfG = gutter / 2;
  const left = panelDef.x === 0 ? gutter : panelDef.x * canvasWidth + halfG;
  const top = panelDef.y === 0 ? gutter : panelDef.y * canvasHeight + halfG;
  const right = (panelDef.x + panelDef.w >= 0.999) ? canvasWidth - gutter : (panelDef.x + panelDef.w) * canvasWidth - halfG;
  const bottom = (panelDef.y + panelDef.h >= 0.999) ? canvasHeight - gutter : (panelDef.y + panelDef.h) * canvasHeight - halfG;

  const w = Math.max(10, right - left);
  const h = Math.max(10, bottom - top);

  return { x: left, y: top, w, h };
}

/**
 * Draws a single panel with its photo (cover-fit, pan, zoom, flip) or placeholder.
 */
function drawPanel(ctx, rect, panelState, isSelected, showEditorGuides) {
  const { x, y, w, h } = rect;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  if (panelState && panelState.image) {
    const img = panelState.image;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    const imgAspect = imgW / imgH;
    const panelAspect = w / h;

    const zoom = Math.max(1.0, panelState.zoom || 1.0);
    let drawW, drawH;
    if (panelAspect > imgAspect) {
      drawW = w * zoom;
      drawH = (w / imgAspect) * zoom;
    } else {
      drawH = h * zoom;
      drawW = (h * imgAspect) * zoom;
    }

    const panX = panelState.panX || 0;
    const panY = panelState.panY || 0;

    // Center plus normalized user pan
    const cx = x + w / 2 + panX * w;
    const cy = y + h / 2 + panY * h;

    ctx.save();
    ctx.translate(cx, cy);
    if (panelState.flipH) {
      ctx.scale(-1, 1);
    }
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Subtle inner vignette per panel for graphic novel depth
    const innerGrad = ctx.createLinearGradient(x, y, x, y + h);
    innerGrad.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
    innerGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = innerGrad;
    ctx.fillRect(x, y, w, h);

  } else {
    // Stylized empty panel placeholder
    ctx.fillStyle = '#14121d';
    ctx.fillRect(x, y, w, h);

    // Cross pattern
    ctx.strokeStyle = '#272338';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);

    if (showEditorGuides) {
      // Plus icon
      const cx = x + w / 2;
      const cy = y + h / 2 - 10;
      const size = Math.min(24, w * 0.15);

      ctx.strokeStyle = '#ff2a85';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - size, cy);
      ctx.lineTo(cx + size, cy);
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx, cy + size);
      ctx.stroke();

      // Label
      ctx.font = `600 ${Math.max(11, Math.min(14, w * 0.08))}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#9b94ab';
      ctx.fillText('Click to add photo', cx, cy + size + 20);
    }
  }

  ctx.restore();

  // Highlight active panel in editor
  if (isSelected && showEditorGuides) {
    ctx.save();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Corner tabs
    const tab = Math.min(14, w * 0.15);
    ctx.fillStyle = '#ff2a85';
    ctx.fillRect(x, y, tab, 4);
    ctx.fillRect(x, y, 4, tab);
    ctx.fillRect(x + w - tab, y, tab, 4);
    ctx.fillRect(x + w - 4, y, 4, tab);
    ctx.fillRect(x, y + h - 4, tab, 4);
    ctx.fillRect(x, y + h - tab, 4, tab);
    ctx.fillRect(x + w - tab, y + h - 4, tab, 4);
    ctx.fillRect(x + w - 4, y + h - tab, 4, tab);
    ctx.restore();
  }
}

/**
 * Renders GTA-style captioned lettering on the cover.
 */
function drawCaption(ctx, width, height, captionState) {
  const title = (captionState.title || '').trim().toUpperCase();
  const subtitle = (captionState.subtitle || '').trim().toUpperCase();
  if (!title && !subtitle) return;

  const fontMultiplier = captionState.size || 1.0;
  const posY = captionState.position !== undefined ? captionState.position : 0.82; // 0.0 to 1.0
  let baseSize = height * 0.098 * fontMultiplier;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const anchorX = width * 0.5;
  const anchorY = height * posY;

  // Title styling: Heavy condensed font, solid thick black outline, slight drop shadow
  if (title) {
    ctx.font = `900 ${baseSize}px 'Anton', Impact, 'Arial Black', sans-serif`;
    
    // Auto-fit title if it exceeds 90% of canvas width
    let measuredWidth = ctx.measureText(title).width;
    const maxWidth = width * 0.90;
    if (measuredWidth > maxWidth) {
      baseSize = Math.max(16, baseSize * (maxWidth / measuredWidth));
      ctx.font = `900 ${baseSize}px 'Anton', Impact, 'Arial Black', sans-serif`;
    }

    const titleSize = baseSize;

    // Deep drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = Math.max(6, titleSize * 0.16);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.max(4, titleSize * 0.07);

    // Thick black stroke
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(7, titleSize * 0.17);
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.strokeText(title, anchorX, anchorY);

    // Fill with slight vertical gradient
    ctx.shadowColor = 'transparent';
    const textGrad = ctx.createLinearGradient(0, anchorY - titleSize * 0.5, 0, anchorY + titleSize * 0.5);
    textGrad.addColorStop(0, '#ffffff');
    textGrad.addColorStop(0.65, '#fffbf2');
    textGrad.addColorStop(1, '#ffd6e5');
    ctx.fillStyle = textGrad;
    ctx.fillText(title, anchorX, anchorY);
  }

  // Subtitle styling: Smaller condensed text with dark border and electric color
  if (subtitle) {
    let subSize = baseSize * 0.36;
    const subOffsetY = title ? baseSize * 0.64 : 0;
    ctx.font = `800 ${subSize}px 'Anton', Impact, 'Arial Black', sans-serif`;

    // Fit subtitle within 85% width
    let subWidth = ctx.measureText(subtitle).width;
    const maxSubWidth = width * 0.85;
    if (subWidth > maxSubWidth) {
      subSize = Math.max(12, subSize * (maxSubWidth / subWidth));
      ctx.font = `800 ${subSize}px 'Anton', Impact, 'Arial Black', sans-serif`;
    }

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = Math.max(4, subSize * 0.18);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.max(3, subSize * 0.09);

    // Solid black outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(4, subSize * 0.19);
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.strokeText(subtitle, anchorX, anchorY + subOffsetY);

    // Electric gold fill
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#ffe600';
    ctx.fillText(subtitle, anchorX, anchorY + subOffsetY);
  }

  ctx.restore();
}

/**
 * Main cover drawing function.
 * Preview canvas and export canvases call this exact same code path!
 */
export function drawCover(canvas, state, options = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const isPreview = options.isPreview ?? false;
  const selectedPanelId = options.selectedPanelId ?? -1;

  // 1. Dark canvas background (black gutters between panels)
  ctx.fillStyle = '#06050a';
  ctx.fillRect(0, 0, w, h);

  // 2. Resolve layout and grading
  const layoutDef = LAYOUTS[state.layoutId] || LAYOUTS.classic6;
  const gutter = Math.max(6, Math.round(Math.min(w, h) * 0.012));
  const gradeKey = state.gradeId || 'vice-sunset';
  const grade = GRADES[gradeKey];

  // 3. Draw each panel with color grading filter
  const panelStates = state.panels || {};
  ctx.save();
  if (grade && grade.filter) {
    ctx.filter = grade.filter;
  }
  for (const panel of layoutDef.panels) {
    const rect = getPanelRect(panel, w, h, gutter);
    const pState = panelStates[panel.id] || null;
    const isSelected = isPreview && panel.id === selectedPanelId;
    drawPanel(ctx, rect, pState, isSelected, isPreview);
  }
  ctx.restore();

  // 4. Outer border framing
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = gutter;
  ctx.strokeRect(gutter / 2, gutter / 2, w - gutter, h - gutter);

  // 5. Apply Vice City grade preset
  if (grade && grade.apply) {
    grade.apply(ctx, w, h);
  }

  // 6. Halftone / film grain texture (optional toggle)
  if (state.grainEnabled) {
    applyGrain(ctx, w, h);
  }

  // 7. Caption lettering
  if (state.caption) {
    drawCaption(ctx, w, h, state.caption);
  }
}

/**
 * Exports cover at target resolution and triggers browser download.
 * Returns a Promise that resolves when download starts.
 */
export function exportCover(state, width = 1080, height = 1080, filename = 'vice-frame-cover.png') {
  return new Promise((resolve) => {
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;

    // Render cleanly without preview selection guides
    drawCover(offscreen, state, { isPreview: false });

    offscreen.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve({ width, height, blob });
      }, 100);
    }, 'image/png');
  });
}
