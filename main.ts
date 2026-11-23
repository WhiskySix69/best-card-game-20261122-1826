// RIMBA DUEL — main.ts (Node 22, standard library saja)
// Program penyerahan entry: menyalin game/ dan screenshots/ dari folder
// tempat file ini berada ke direktori keluaran, lalu menulis dossier.json
// lewat library make.fun yang ada di vendor/.
//
// Di luar container grader, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = dirname(fileURLToPath(import.meta.url));
const target = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const name of readdirSync(src)) {
    const from = join(src, name);
    const to = join(dst, name);
    if (statSync(from).isDirectory()) copyTree(from, to);
    else writeFileSync(to, readFileSync(from));
  }
}

function stage() {
  copyTree(join(here, 'game'), join(target, 'game'));
  const shotsDir = join(here, 'screenshots');
  if (existsSync(shotsDir)) copyTree(shotsDir, join(target, 'screenshots'));
  else mkdirSync(join(target, 'screenshots'), { recursive: true });
}

stage();

// Batas-batas dari scorer (reference/gate.json): hanya text_max_bytes yang
// membentuk byte dossier; sisanya menolak entry yang scorer akan tolak
// (lebih dari 4 screenshot atau satu di atas 256 KiB; lebih dari 993 file
// di game/ atau 48 MiB file game, atau path di bawah game/ di atas 1000 byte).
const dossier = buildDossier(target, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(target, 'dossier.json'), dossier);
