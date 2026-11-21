// Sunset Platinum — the entry program for gta6-trophy-guide-01 (Node 22, standard
// library only). It hands the guide in: it copies this repository's app/ and
// screenshots/ into the output directory and writes /output/dossier.json, the
// summary the judge reads, using the vendored make.fun library. The copy is a
// plain file copy, so running it twice over the same inputs writes the same
// bytes every time. Before copying it checks the inputs the scorer would
// refuse — a missing app entry point, or a screenshot over the size cap —
// and stops with a clear error instead of handing in a broken entry.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in app/
// or 48 MiB of app files).
const DOSSIER_OPTIONS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function fail(message: string): never {
  console.error(`Sunset Platinum entry failed: ${message}`);
  process.exit(1);
}

// The app needs its entry point, and every screenshot must fit the cap the
// scorer enforces; a missing or oversized file is caught here, not by the
// judge.
function checkInputs(): void {
  if (!existsSync(join(here, 'app', 'index.html'))) fail('app/index.html is missing');
  // The round-4 feature modules must be present: the entry ships them, and
  // the app fails at runtime without them, so refuse early with a clear error.
  for (const module of ['export.js', 'roadmap.js']) {
    if (!existsSync(join(here, 'app', 'js', module))) fail(`app/js/${module} is missing`);
  }
  const shotsDir = join(here, 'screenshots');
  if (!existsSync(shotsDir)) fail('screenshots/ is missing');
  const shots = readdirSync(shotsDir).filter((name) => /\.(jpe?g|png|webp)$/i.test(name));
  if (shots.length === 0) fail('screenshots/ holds no screenshots');
  if (shots.length > DOSSIER_OPTIONS.screenshots.max) {
    fail(`${shots.length} screenshots — the cap is ${DOSSIER_OPTIONS.screenshots.max}`);
  }
  for (const shot of shots) {
    const size = statSync(join(shotsDir, shot)).size;
    if (size > DOSSIER_OPTIONS.screenshots.max_bytes) {
      fail(`${shot} is ${size} bytes — over the ${DOSSIER_OPTIONS.screenshots.max_bytes} byte cap`);
    }
  }
  console.log(`Inputs OK: app/index.html present, ${shots.length} screenshot(s) within the size cap.`);
  console.log('Inputs OK: round-4 modules app/js/export.js and app/js/roadmap.js present.');
}

function copyEntry(): void {
  mkdirSync(out, { recursive: true });
  cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
  mkdirSync(join(out, 'screenshots'), { recursive: true });
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

function writeDossier(): void {
  writeFileSync(join(out, 'dossier.json'), buildDossier(out, DOSSIER_OPTIONS));
}

checkInputs();
copyEntry();
writeDossier();
console.log(`Sunset Platinum entry written to ${out} (app/ + screenshots/ + dossier.json).`);
