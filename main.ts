/**
 * VICE FRAME — make.fun gta6-cover-art-01 entry packager & dossier generator.
 *
 * Copies the offline web application (app/) and visual documentation (screenshots/)
 * to the designated output directory, then computes and writes the canonical
 * makefun dossier (dossier.json) using the vendored scorer library.
 */

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier, type DossierCaps } from './vendor/makefun-app.ts';

// Entry configuration & gate caps matching reference/gate.json
const SCORER_CAPS: DossierCaps = {
  text_max_bytes: 163840,
  screenshots: {
    max: 4,
    max_bytes: 262144, // 256 KiB limit per screenshot
  },
  app_max_files: 993,
  app_max_bytes: 50331648, // 48 MiB
  app_path_max_bytes: 1000,
};

function main(): void {
  const rootDir = fileURLToPath(new URL('.', import.meta.url));
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

  console.log(`[VICE FRAME] Packaging entry to: ${outputDir}`);

  // Ensure output directory exists
  mkdirSync(outputDir, { recursive: true });

  // 1. Copy static web application
  const appSrc = join(rootDir, 'app');
  const appDest = join(outputDir, 'app');
  console.log(`[VICE FRAME] Copying static app from ${appSrc} -> ${appDest}`);
  cpSync(appSrc, appDest, { recursive: true });

  // 2. Copy visual screenshots
  const shotsSrc = join(rootDir, 'screenshots');
  const shotsDest = join(outputDir, 'screenshots');
  mkdirSync(shotsDest, { recursive: true });
  if (existsSync(shotsSrc)) {
    console.log(`[VICE FRAME] Copying screenshots from ${shotsSrc} -> ${shotsDest}`);
    cpSync(shotsSrc, shotsDest, { recursive: true });
  }

  // 3. Generate canonical makefun dossier.json
  console.log('[VICE FRAME] Generating dossier.json via buildDossier...');
  const dossierBytes = buildDossier(outputDir, SCORER_CAPS);
  const dossierPath = join(outputDir, 'dossier.json');
  writeFileSync(dossierPath, dossierBytes);

  console.log(`[VICE FRAME] Successfully wrote dossier (${dossierBytes.length} bytes) to ${dossierPath}`);
}

main();
