// Color grading presets and film grain / halftone effects for VICE FRAME.

export const GRADES = {
  'vice-sunset': {
    id: 'vice-sunset',
    name: 'Vice Sunset',
    description: 'Iconic synthwave magenta-to-orange wash with boosted saturation',
    filter: 'contrast(1.2) saturate(1.45) brightness(1.02)',
    apply(ctx, w, h) {
      // Atmospheric sunset gradient wash
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(40, 10, 80, 0.35)');     // deep indigo sky
      grad.addColorStop(0.45, 'rgba(255, 45, 120, 0.42)'); // neon magenta mid
      grad.addColorStop(0.85, 'rgba(255, 130, 20, 0.50)'); // warm fiery orange
      grad.addColorStop(1.0, 'rgba(255, 210, 50, 0.35)');  // golden sun line

      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle bottom glow for neon punch
      const glow = ctx.createRadialGradient(w * 0.5, h, 10, w * 0.5, h, w * 0.7);
      glow.addColorStop(0, 'rgba(255, 60, 180, 0.35)');
      glow.addColorStop(1, 'rgba(255, 60, 180, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    },
  },

  'neon-night': {
    id: 'neon-night',
    name: 'Neon Night',
    description: 'Electric teal shadows with hot pink highlights and deep contrast',
    filter: 'contrast(1.3) saturate(1.35) brightness(0.95)',
    apply(ctx, w, h) {
      ctx.save();
      // Teal tone for shadows & midtones
      const tealGrad = ctx.createLinearGradient(0, 0, w, h);
      tealGrad.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
      tealGrad.addColorStop(0.5, 'rgba(10, 20, 60, 0.45)');
      tealGrad.addColorStop(1, 'rgba(255, 0, 128, 0.38)');

      ctx.globalCompositeOperation = 'color-dodge';
      ctx.fillStyle = tealGrad;
      ctx.fillRect(0, 0, w, h);

      // Soft vignette
      const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.3, w * 0.5, h * 0.5, w * 0.75);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(5, 5, 20, 0.6)');
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    },
  },

  'golden-hour': {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm Miami sun flare with rich amber tones and sunlit highlights',
    filter: 'contrast(1.15) saturate(1.35) brightness(1.08) sepia(0.18)',
    apply(ctx, w, h) {
      ctx.save();
      const goldGrad = ctx.createLinearGradient(0, 0, w * 0.7, h);
      goldGrad.addColorStop(0, 'rgba(255, 220, 100, 0.4)');
      goldGrad.addColorStop(0.6, 'rgba(255, 140, 20, 0.35)');
      goldGrad.addColorStop(1, 'rgba(180, 50, 10, 0.3)');

      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, 0, w, h);

      // Sun flare in upper corner
      const flare = ctx.createRadialGradient(w * 0.15, h * 0.15, 10, w * 0.15, h * 0.15, w * 0.5);
      flare.addColorStop(0, 'rgba(255, 245, 200, 0.45)');
      flare.addColorStop(0.4, 'rgba(255, 180, 50, 0.2)');
      flare.addColorStop(1, 'rgba(255, 180, 50, 0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = flare;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    },
  },

  'noir': {
    id: 'noir',
    name: 'Vice Noir',
    description: 'High-contrast graphic novel monochrome with deep crushed shadows',
    filter: 'grayscale(1) contrast(1.65) brightness(1.05)',
    apply(ctx, w, h) {
      ctx.save();
      // Dramatic split contrast vignette
      const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.8);
      vig.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      vig.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    },
  },

  'clean': {
    id: 'clean',
    name: 'Clean GTA',
    description: 'Crisp natural colors with subtle graphic comic punch',
    filter: 'contrast(1.1) saturate(1.15)',
    apply() {},
  },
};

/**
 * Draws a subtle film grain and comic print texture over the canvas.
 */
let cachedGrainPattern = null;
let cachedGrainSize = 0;

function getGrainPattern(ctx, size = 256) {
  if (cachedGrainPattern && cachedGrainSize === size) return cachedGrainPattern;
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const octx = off.getContext('2d');
  const imgData = octx.createImageData(size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = Math.floor(Math.random() * 255);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 22; // very subtle alpha
  }
  octx.putImageData(imgData, 0, 0);
  cachedGrainPattern = ctx.createPattern(off, 'repeat');
  cachedGrainSize = size;
  return cachedGrainPattern;
}

export function applyGrain(ctx, w, h) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = getGrainPattern(ctx, 256);
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
