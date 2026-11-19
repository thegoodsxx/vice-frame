// Layout definitions for GTA-style cover art panels.
// Coordinates are normalized (0.0 to 1.0) relative to total canvas dimensions.

export const LAYOUTS = {
  classic6: {
    id: 'classic6',
    name: 'Classic 6-Panel',
    description: 'Iconic GTA montage: 1 hero panel, 2 stacked side panels, 3 bottom vignettes',
    panels: [
      { id: 0, name: 'Hero', x: 0, y: 0, w: 0.5, h: 0.62 },
      { id: 1, name: 'Top Right', x: 0.5, y: 0, w: 0.5, h: 0.31 },
      { id: 2, name: 'Mid Right', x: 0.5, y: 0.31, w: 0.5, h: 0.31 },
      { id: 3, name: 'Bottom Left', x: 0, y: 0.62, w: 0.333, h: 0.38 },
      { id: 4, name: 'Bottom Mid', x: 0.333, y: 0.62, w: 0.334, h: 0.38 },
      { id: 5, name: 'Bottom Right', x: 0.667, y: 0.62, w: 0.333, h: 0.38 },
    ],
  },
  quad4: {
    id: 'quad4',
    name: 'Quad 4-Panel',
    description: 'Balanced 2x2 grid for punchy character and vehicle showcases',
    panels: [
      { id: 0, name: 'Top Left', x: 0, y: 0, w: 0.5, h: 0.5 },
      { id: 1, name: 'Top Right', x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { id: 2, name: 'Bottom Left', x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { id: 3, name: 'Bottom Right', x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  triptych3: {
    id: 'triptych3',
    name: 'Triptych 3-Panel',
    description: '3 tall vertical slices, ideal for full-body characters and palm trees',
    panels: [
      { id: 0, name: 'Left Slice', x: 0, y: 0, w: 0.3333, h: 1.0 },
      { id: 1, name: 'Center Slice', x: 0.3333, y: 0, w: 0.3334, h: 1.0 },
      { id: 2, name: 'Right Slice', x: 0.6667, y: 0, w: 0.3333, h: 1.0 },
    ],
  },
  duo2: {
    id: 'duo2',
    name: 'Duo 2-Panel',
    description: 'Side-by-side protagonist vs antagonist split',
    panels: [
      { id: 0, name: 'Left Duo', x: 0, y: 0, w: 0.5, h: 1.0 },
      { id: 1, name: 'Right Duo', x: 0.5, y: 0, w: 0.5, h: 1.0 },
    ],
  },
  cinematic5: {
    id: 'cinematic5',
    name: 'Cinematic 5-Panel',
    description: 'Widescreen hero panorama above 4 action thumbnails',
    panels: [
      { id: 0, name: 'Hero Panorama', x: 0, y: 0, w: 1.0, h: 0.56 },
      { id: 1, name: 'Thumb 1', x: 0, y: 0.56, w: 0.25, h: 0.44 },
      { id: 2, name: 'Thumb 2', x: 0.25, y: 0.56, w: 0.25, h: 0.44 },
      { id: 3, name: 'Thumb 3', x: 0.5, y: 0.56, w: 0.25, h: 0.44 },
      { id: 4, name: 'Thumb 4', x: 0.75, y: 0.56, w: 0.25, h: 0.44 },
    ],
  },
};
