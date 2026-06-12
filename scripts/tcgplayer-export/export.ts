import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

import { TcgplayerApiClient } from "./api-client";
import { mapProductToCsvRow } from "./map-product";
import type { CatalogCsvRow, ExportCheckpoint, ExportGame } from "./types";
import { csvEscape, loadProjectEnv, parseArgs, sleep } from "./utils";

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

const GAME_MATCHERS: Record<ExportGame, RegExp> = {
  "one-piece": /one\s*piece/i,
  riftbound: /riftbound/i,
};

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

function readCheckpoint(path: string): ExportCheckpoint {
  if (!existsSync(path)) {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      games: {},
    };
  }
  return JSON.parse(readFileSync(path, "utf8")) as ExportCheckpoint;
}

function writeCheckpoint(path: string, checkpoint: ExportCheckpoint) {
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

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function discoverCategories(client: TcgplayerApiClient) {
  const categories = await client.listAllCategories();
  console.log("TCGplayer categories (tim One Piece / Riftbound):");
  for (const category of categories) {
    const label = category.displayName ?? category.name;
    const isTarget =
      GAME_MATCHERS["one-piece"].test(label) || GAME_MATCHERS.riftbound.test(label);
    if (!isTarget) continue;
    console.log(`- [${category.categoryId}] ${label}`);
  }
}

async function resolveCategoryId(
  game: ExportGame,
  client: TcgplayerApiClient,
  override?: number,
) {
  if (override && Number.isFinite(override)) return override;

  const categories = await client.listAllCategories();
  const matcher = GAME_MATCHERS[game];
  const hit = categories.find((category) => {
    const label = `${category.displayName ?? ""} ${category.name}`;
    return matcher.test(label);
  });

  if (!hit) {
    throw new Error(
      `Khong tim thay category cho game "${game}". Chay "npm run tcg:discover" va set TCGPLAYER_CATEGORY_ID_* trong .env`,
    );
  }

  return hit.categoryId;
}

async function exportGame(options: {
  game: ExportGame;
  client: TcgplayerApiClient;
  csvPath: string;
  checkpointPath: string;
  resume: boolean;
  includePricing: boolean;
  categoryIdOverride?: number;
}) {
  const {
    game,
    client,
    csvPath,
    checkpointPath,
    resume,
    includePricing,
    categoryIdOverride,
  } = options;

  const checkpoint = readCheckpoint(checkpointPath);
  const gameState = checkpoint.games[game] ?? {
    categoryId: 0,
    completedGroupIds: [],
    exportedProductIds: [],
  };

  const categoryId =
    gameState.categoryId > 0
      ? gameState.categoryId
      : await resolveCategoryId(game, client, categoryIdOverride);

  gameState.categoryId = categoryId;
  checkpoint.games[game] = gameState;
  writeCheckpoint(checkpointPath, checkpoint);

  const groups = await client.listAllCategoryGroups(categoryId);
  const exportedSet = new Set(gameState.exportedProductIds);
  const writeHeader = !existsSync(csvPath) || !resume;

  let exportedCount = 0;

  for (const group of groups) {
    if (gameState.completedGroupIds.includes(group.groupId)) {
      continue;
    }

    console.log(`[${game}] Export set: ${group.name} (${group.groupId})`);
    const products = await client.listAllGroupProducts(categoryId, group.groupId);
    const pending = products.filter((p) => !exportedSet.has(p.productId));
    const rows: CatalogCsvRow[] = [];

    if (includePricing) {
      for (const batch of chunk(pending, 80)) {
        const prices = await client.getProductPrices(
          batch.map((item) => item.productId),
        );
        const pricesByProduct = new Map<number, typeof prices>();
        for (const price of prices) {
          const list = pricesByProduct.get(price.productId) ?? [];
          list.push(price);
          pricesByProduct.set(price.productId, list);
        }

        for (const product of batch) {
          rows.push(
            mapProductToCsvRow({
              game,
              product,
              group,
              prices: pricesByProduct.get(product.productId) ?? [],
            }),
          );
          exportedSet.add(product.productId);
        }
      }
    } else {
      for (const product of pending) {
        rows.push(
          mapProductToCsvRow({
            game,
            product,
            group,
            prices: [],
          }),
        );
        exportedSet.add(product.productId);
      }
    }

    appendRows(csvPath, rows, writeHeader && exportedCount === 0);
    exportedCount += rows.length;

    gameState.completedGroupIds.push(group.groupId);
    gameState.exportedProductIds = [...exportedSet];
    writeCheckpoint(checkpointPath, checkpoint);

    console.log(
      `[${game}] Done set ${group.name}: +${rows.length} cards (total ${gameState.exportedProductIds.length})`,
    );
  }

  console.log(`[${game}] Hoan tat. Tong card da export: ${exportedCount}`);
}

async function main() {
  loadProjectEnv();
  const rawArgv = process.argv.slice(2);
  const positionalCommand = rawArgv.find((token) => !token.startsWith("--"));
  const args = parseArgs(rawArgv);

  const command = String(positionalCommand ?? args.command ?? "export");
  const gameArg = String(args.game ?? "all");
  const output = String(
    args.output ?? "data/tcgplayer-catalog.csv",
  );
  const delayMs = Number(args["delay-ms"] ?? process.env.TCGPLAYER_DELAY_MS ?? 300);
  const resume = Boolean(args.resume);
  const includePricing = !Boolean(args["skip-pricing"]);

  const publicKey = process.env.TCGPLAYER_PUBLIC_KEY ?? "";
  const privateKey = process.env.TCGPLAYER_PRIVATE_KEY ?? "";
  if (!publicKey || !privateKey) {
    throw new Error(
      "Thieu TCGPLAYER_PUBLIC_KEY / TCGPLAYER_PRIVATE_KEY. Xem scripts/tcgplayer-export/config.example.env",
    );
  }

  const cacheDir = resolve(process.cwd(), ".tcgplayer-export");
  ensureDir(cacheDir);
  ensureDir(resolve(process.cwd(), "data"));

  const client = new TcgplayerApiClient({
    publicKey,
    privateKey,
    version: process.env.TCGPLAYER_API_VERSION,
    delayMs,
    cacheDir,
  });

  if (command === "discover") {
    await discoverCategories(client);
    return;
  }

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
      throw new Error(`Game khong hop le: ${game}. Dung one-piece | riftbound | all`);
    }

    const categoryOverride = Number(
      game === "one-piece"
        ? process.env.TCGPLAYER_CATEGORY_ID_ONE_PIECE
        : process.env.TCGPLAYER_CATEGORY_ID_RIFTBOUND,
    );

    await exportGame({
      game,
      client,
      csvPath,
      checkpointPath,
      resume,
      includePricing,
      categoryIdOverride: Number.isFinite(categoryOverride)
        ? categoryOverride
        : undefined,
    });

    // Nho delay giua 2 game de tranh burst request.
    if (games.length > 1) {
      await sleep(Math.max(delayMs, 500));
    }
  }

  console.log(`CSV da luu tai: ${csvPath}`);
  console.log(`Checkpoint: ${checkpointPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
