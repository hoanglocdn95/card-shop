#!/usr/bin/env node
/**
 * Split data/tcgplayer-catalog.csv into per-game files (header preserved).
 *
 *   node scripts/split-tcgplayer-catalog.mjs
 *   node scripts/split-tcgplayer-catalog.mjs --input data/tcgplayer-catalog.csv
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const inputFlag = args.indexOf("--input");
const inputPath = resolve(
  process.cwd(),
  inputFlag >= 0 ? args[inputFlag + 1] : "data/tcgplayer-catalog.csv",
);

const raw = readFileSync(inputPath, "utf8");
const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
if (lines.length <= 1) {
  console.error("Input CSV is empty or has no data rows.");
  process.exit(1);
}

const header = lines[0];
const buckets = { "one-piece": [], riftbound: [] };

for (let i = 1; i < lines.length; i += 1) {
  const line = lines[i];
  if (line.startsWith("one-piece,")) {
    buckets["one-piece"].push(line);
  } else if (line.startsWith("riftbound,")) {
    buckets.riftbound.push(line);
  }
}

const outputs = {
  "one-piece": "data/tcgplayer-catalog-one-piece.csv",
  riftbound: "data/tcgplayer-catalog-riftbound.csv",
};

for (const [game, relativePath] of Object.entries(outputs)) {
  const outPath = resolve(process.cwd(), relativePath);
  const body = [header, ...buckets[game]].join("\n") + "\n";
  writeFileSync(outPath, body, "utf8");
  console.log(`${relativePath}: ${buckets[game].length} rows`);
}
