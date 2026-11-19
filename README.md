# VICE FRAME

![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)
![rank](https://make.fun/badge/gta6-cover-art-01/thegoodsxx/vice-frame/rank.svg)
![reward](https://make.fun/badge/gta6-cover-art-01/thegoodsxx/vice-frame/reward.svg)

An offline cover-art maker in the spirit of GTA VI's posters, built for the
[make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01).

VICE FRAME transforms photos into iconic GTA-style multi-panel cover art posters with signature Vice City color grading presets, graphic comic borders, heavy display caption lettering, and full-resolution export across square, portrait, and widescreen formats.

Everything operates 100% locally and offline in the browser: photos are read directly on your machine through `FileReader` and object URLs, never leaving your device.

---

## Features

### 1. Multi-Panel Cover Layouts
Choose from 5 GTA cover art layout templates separated by bold black gutters:
- **Classic 6-Panel**: Iconic montage featuring 1 large hero panel, 2 stacked side panels, and 3 bottom vignettes.
- **Quad 4-Panel**: Balanced 2×2 grid for punchy character and vehicle showcases.
- **Triptych 3-Panel**: 3 tall vertical slices, ideal for full-body portraits, neon skylines, and palm trees.
- **Duo 2-Panel**: Side-by-side split for protagonist vs. antagonist framing.
- **Cinematic 5-Panel**: Widescreen hero panorama anchored above 4 action thumbnails.

### 2. Flexible Photo Loading & Composition
- **Interactive Panel Selection**: Click any panel on the canvas to select it.
- **Canvas Drag-to-Pan**: Click and drag directly on any panel to reposition its framing.
- **Zoom & Flip**: Zoom slider (1.0× to 3.5×), mouse wheel zooming over panels, and one-click horizontal flip (`⇄ Flip`).
- **Drag & Drop**: Drag image files from your desktop directly onto any panel to replace its photo.
- **One Photo, Every Panel**: Distribute a single photo across all panels with intelligent varied framing and offsets.
- **Bundled Sample Photos**: Quick-start demos with one click:
  - `🌴 Pier`
  - `🚗 Boulevard`
  - `🎲 Mix Samples` (pre-configured montage)

### 3. Vice City Color Grades
One-click canvas color grading presets applying authentic 80s synthwave lighting and contrast:
- **Vice Sunset**: Atmospheric magenta-to-orange gradient wash with boosted saturation and fiery highlights.
- **Neon Night**: Electric teal shadows, moody vignette, and vibrant magenta/fuchsia highlights.
- **Golden Hour**: Sun-drenched Miami golden-amber tones with corner sun flare bloom.
- **Vice Noir**: High-contrast graphic novel monochrome with deep crushed shadows.
- **Clean GTA**: Crisp natural color balance with subtle comic punch.
- **Comic Print Grain**: Procedural film grain and halftone texture toggle for vintage poster print authenticity.

### 4. Caption Lettering
Authentic GTA genre display typography:
- **Main Title**: Heavy condensed lettering rendered with a thick dark outline and deep drop shadow.
- **Subtitle**: Vibrant yellow/gold lettering with sharp outline and drop shadow.
- **Dynamic Sizing & Position**: Sliders for caption scale and vertical placement (top, center, or bottom).
- **Auto-Fitting**: Automatically adjusts font size so titles always fit neatly within the canvas.

### 5. High-Resolution PNG Export
Single-click export rendered at full resolution through the exact same canvas composition engine:
- **1080 × 1080** (Square 1:1)
- **1080 × 1350** (Portrait 4:5 — Instagram standard)
- **1920 × 1080** (Widescreen 16:9 — wallpaper & YouTube thumbnail)
- Downloads directly as `vice-frame-cover.png`.

---

## Quick Start

Open `app/index.html` directly in any modern desktop browser (Chrome, Firefox, Safari, Edge), or serve locally:

```bash
# Serve locally via Node 22 standard library
node serve.ts

# Visit http://localhost:8080
```

To run the dossier smoke test:

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

## Typography & Credits

The caption typeface is **Anton** by Vernon Adams (SIL Open Font License, Version 1.1).
The TTF font file is bundled locally at `app/fonts/Anton-Regular.ttf` with its license text at `app/fonts/OFL.txt`.
Fallback font stack: `Impact, 'Arial Black', sans-serif`.
Sample photos (`pier.jpg` and `boulevard.jpg`) in `app/samples/` are bundled with the make.fun starter kit.
