import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

import type { CatalogCsvRow, ExportGame } from "../tcgplayer-export/types";
import {
  csvEscape,
  loadProjectEnv,
  parseArgs,
  sleep,
} from "../tcgplayer-export/utils";
import { MpSearchClient, resolveMpfev } from "./client";
import { MP_GAMES } from "./games";
import { mapMpProductToCsvRow } from "./map-product";
import type { MpExportCheckpoint, MpGameCheckpoint } from "./types";

const CSV_HEADERS: Array<keyof CatalogCsvRow> = [
  "game",
  "id",
  "cardCode",
  "name",
  "displayName",
  "image",
  "rarity",
  "cardType",
  "set",
  "subtypes",
  "priceUsd",
  "tcgPlayerUrl",
  "stock",
  "tcgplayerProductId",
  "tcgplayerGroupId",
  "tcgplayerCategoryId",
  "modifiedOn",
];

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

function readCheckpoint(path: string): MpExportCheckpoint {
  if (!existsSync(path)) {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      games: {},
    };
  }
  return JSON.parse(readFileSync(path, "utf8")) as MpExportCheckpoint;
}

function writeCheckpoint(path: string, checkpoint: MpExportCheckpoint) {
  checkpoint.updatedAt = new Date().toISOString();
  writeFileSync(path, JSON.stringify(checkpoint, null, 2), "utf8");
}

function appendRows(csvPath: string, rows: CatalogCsvRow[], writeHeader: boolean) {
  if (rows.length === 0) return;
  const lines: string[] = [];
  if (writeHeader) {
    lines.push(CSV_HEADERS.join(","));
  }
  for (const row of rows) {
    lines.push(CSV_HEADERS.map((key) => csvEscape(row[key])).join(","));
  }
  appendFileSync(csvPath, `${lines.join("\n")}\n`, "utf8");
}

async function exportGame(options: {
  game: ExportGame;
  client: MpSearchClient;
  csvPath: string;
  checkpointPath: string;
  resume: boolean;
  pageSize: number;
  inStockOnly: boolean;
  shippingCountry: string;
  maxPages?: number;
}) {
  const {
    game,
    client,
    csvPath,
    checkpointPath,
    resume,
    pageSize,
    inStockOnly,
    shippingCountry,
    maxPages,
  } = options;

  const config = MP_GAMES[game];
  const checkpoint = readCheckpoint(checkpointPath);
  const gameState: MpGameCheckpoint = checkpoint.games[game] ?? {
    productLineName: config.productLineName,
    from: 0,
    totalResults: 0,
    exportedProductIds: [],
    done: false,
  };

  if (gameState.done) {
    console.log(`[${game}] Da export xong (checkpoint.done=true), bo qua.`);
    return;
  }

  const exportedIds = new Set(gameState.exportedProductIds);
  let from = gameState.from;
  let totalResults = gameState.totalResults;
  let writeHeader = !existsSync(csvPath) || !resume;
  let pages = 0;

  console.log(
    `[${game}] Bat dau crawl ${config.label} (${config.productLineName}), from=${from}`,
  );

  while (true) {
    if (maxPages != null && pages >= maxPages) {
      console.log(`[${game}] Dat gioi han --max-pages=${maxPages}, dung.`);
      break;
    }

    const page = await client.searchPage({
      productLineName: config.productLineName,
      from,
      size: pageSize,
      inStockOnly,
      shippingCountry,
    });

    if (totalResults === 0) {
      totalResults = page.totalResults;
      console.log(`[${game}] Tong ket qua: ${totalResults}`);
    }

    const rows: CatalogCsvRow[] = [];
    for (const product of page.results) {
      if (exportedIds.has(product.productId)) continue;
      rows.push(mapMpProductToCsvRow(game, product));
      exportedIds.add(product.productId);
    }

    appendRows(csvPath, rows, writeHeader);
    writeHeader = false;

    from += page.results.length;
    pages += 1;

    gameState.from = from;
    gameState.totalResults = totalResults;
    gameState.exportedProductIds = [...exportedIds];
    gameState.done = from >= totalResults || page.results.length === 0;
    checkpoint.games[game] = gameState;
    writeCheckpoint(checkpointPath, checkpoint);

    console.log(
      `[${game}] Trang ${pages}: +${rows.length} (offset ${from}/${totalResults})`,
    );

    if (gameState.done) {
      console.log(`[${game}] Hoan tat. Da export ${exportedIds.size} san pham.`);
      break;
    }
  }
}

async function main() {
  loadProjectEnv();
  loadEnvFile(resolve(process.cwd(), "scripts/mp-search-crawl/.env"));

  const rawArgv = process.argv.slice(2);
  const positionalCommand = rawArgv.find((token) => !token.startsWith("--"));
  const args = parseArgs(rawArgv);

  const command = String(positionalCommand ?? "export");
  if (command !== "export") {
    throw new Error(`Lenh khong hop le: ${command}. Dung: npm run mp:export`);
  }

  const gameArg = String(args.game ?? "all");
  const output = String(args.output ?? "data/tcgplayer-catalog.csv");
  const delayMs = Number(args["delay-ms"] ?? process.env.TCG_MP_DELAY_MS ?? 400);
  const pageSize = Number(args["page-size"] ?? process.env.TCG_MP_PAGE_SIZE ?? 50);
  const resume = Boolean(args.resume);
  const inStockOnly = !Boolean(args["all-stock"]);
  const shippingCountry = String(
    args.country ?? process.env.TCG_MP_SHIPPING_COUNTRY ?? "VN",
  );
  const maxPagesRaw = args["max-pages"];
  const maxPages =
    maxPagesRaw != null ? Number(maxPagesRaw) : undefined;

  const cacheDir = resolve(process.cwd(), ".mp-search-crawl");
  ensureDir(cacheDir);
  ensureDir(resolve(process.cwd(), "data"));

  const client = new MpSearchClient({
    delayMs,
    mpfev: resolveMpfev(),
    cookie: process.env.TCG_MP_COOKIE,
  });

  const csvPath = resolve(process.cwd(), output);
  const checkpointPath = resolve(cacheDir, "checkpoint.json");

  if (!resume && existsSync(csvPath)) {
    writeFileSync(csvPath, "", "utf8");
    writeCheckpoint(checkpointPath, {
      version: 1,
      updatedAt: new Date().toISOString(),
      games: {},
    });
  }

  const games: ExportGame[] =
    gameArg === "all" ? ["one-piece", "riftbound"] : [gameArg as ExportGame];

  for (const game of games) {
    if (game !== "one-piece" && game !== "riftbound") {
      throw new Error(
        `Game khong hop le: ${game}. Dung one-piece | riftbound | all`,
      );
    }

    await exportGame({
      game,
      client,
      csvPath,
      checkpointPath,
      resume,
      pageSize,
      inStockOnly,
      shippingCountry,
      maxPages: Number.isFinite(maxPages) ? maxPages : undefined,
    });

    if (games.length > 1) {
      await sleep(Math.max(delayMs, 500));
    }
  }

  console.log(`CSV da luu tai: ${csvPath}`);
  console.log(`Checkpoint: ${checkpointPath}`);
}

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
