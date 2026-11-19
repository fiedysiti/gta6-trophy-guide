// Sunset Platinum — a GTA 6 trophy guide entry for gta6-trophy-guide-01.
//
// main.ts (Node 22, standard library only) hands the guide in. The guide
// itself is plain static files under app/ (index.html, ES modules, CSS and
// app/data/trophies.json) plus 3-4 screenshots under screenshots/. This
// program copies both trees into the output directory and writes
// dossier.json with the vendored make.fun library, which is the summary the
// judge reads. vendor/makefun-frontend.ts is the kit's copy, unchanged.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyGuideTree(): void {
  mkdirSync(outputDir, { recursive: true });
  const appOut = join(outputDir, 'app');
  rmSync(appOut, { recursive: true, force: true });
  cpSync(join(repoRoot, 'app'), appOut, { recursive: true });
  const shotsOut = join(outputDir, 'screenshots');
  rmSync(shotsOut, { recursive: true, force: true });
  mkdirSync(shotsOut, { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), shotsOut, { recursive: true });
  }
}

function writeGuideDossier(): void {
  const dossierText = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossierText);
}

copyGuideTree();
writeGuideDossier();
console.log(`Guide handed in at ${outputDir}`);
