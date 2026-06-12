import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildStableProductId } from "@/lib/product-id";
import type { ProductGame } from "@/types/product";

export type CatalogCard = {
  id: string;
  cardCode: string;
  name: string;
  displayName: string;
  image: string;
  rarity?: string;
  cardType: string;
  set: string;
  subtypes: string[];
  priceUsd: number;
  tcgPlayerUrl: string;
  stock: number;
};

const CSV_GAMES = ["one-piece", "riftbound"] as const satisfies ProductGame[];

const DEFAULT_CATALOG_PATHS: Record<(typeof CSV_GAMES)[number], string> = {
  "one-piece": "data/tcgplayer-catalog-one-piece.csv",
  riftbound: "data/tcgplayer-catalog-riftbound.csv",
};

const LEGACY_COMBINED_CSV = "data/tcgplayer-catalog.csv";

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  fields.push(current);
  return fields;
}

function rowToCatalogCard(row: string[]): CatalogCard | null {
  if (row.length < 13) return null;

  const [
    gameRaw,
    legacyId,
    cardCode,
    name,
    displayName,
    image,
    rarity,
    cardType,
    set,
    subtypesRaw,
    priceUsdRaw,
    tcgPlayerUrl,
    stockRaw,
    tcgplayerProductId,
  ] = row;

  const game = gameRaw.trim();
  const priceUsd = Number(priceUsdRaw);
  if (!Number.isFinite(priceUsd)) return null;

  const stock = Number(stockRaw);
  const subtypes = subtypesRaw
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    id: buildStableProductId({
      game,
      tcgPlayerUrl,
      legacyId,
      cardCode,
      tcgplayerProductId,
    }),
    cardCode: cardCode.trim(),
    name: name.trim(),
    displayName: displayName.trim(),
    image: image.trim(),
    rarity:
      rarity.trim() && rarity.trim() !== "None" ? rarity.trim() : undefined,
    cardType: cardType.trim() || "Card",
    set: set.trim(),
    subtypes,
    priceUsd,
    tcgPlayerUrl: tcgPlayerUrl.trim(),
    stock: Number.isFinite(stock) ? stock : 0,
  };
}

function rowToCatalogEntry(
  row: string[],
): { game: ProductGame; card: CatalogCard } | null {
  if (row.length < 13) return null;

  const game = row[0].trim();
  if (game !== "one-piece" && game !== "riftbound") return null;

  const card = rowToCatalogCard(row);
  if (!card) return null;

  return { game, card };
}

function readCsvLines(relativePath: string): string[] {
  const absolutePath = resolve(
    /* turbopackIgnore: true */
    process.cwd(),
    relativePath,
  );
  if (!existsSync(absolutePath)) {
    return [];
  }

  const raw = readFileSync(absolutePath, "utf8");
  return raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
}

function loadCatalogCardsFromFile(relativePath: string): CatalogCard[] {
  const lines = readCsvLines(relativePath);
  if (lines.length <= 1) return [];

  const cards: CatalogCard[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const card = rowToCatalogCard(parseCsvLine(lines[i]));
    if (card) cards.push(card);
  }
  return cards;
}

function loadCatalogBucketsFromCombined(relativePath: string): Partial<
  Record<ProductGame, CatalogCard[]>
> {
  const lines = readCsvLines(relativePath);
  if (lines.length <= 1) return {};

  const buckets: Partial<Record<ProductGame, CatalogCard[]>> = {
    "one-piece": [],
    riftbound: [],
  };

  for (let i = 1; i < lines.length; i += 1) {
    const entry = rowToCatalogEntry(parseCsvLine(lines[i]));
    if (!entry) continue;
    buckets[entry.game]?.push(entry.card);
  }

  return buckets;
}

function resolveCatalogPath(game: (typeof CSV_GAMES)[number]): string {
  if (game === "one-piece") {
    return (
      process.env.ONE_PIECE_CATALOG_CSV?.trim() ||
      DEFAULT_CATALOG_PATHS["one-piece"]
    );
  }
  return (
    process.env.RIFTBOUND_CATALOG_CSV?.trim() ||
    DEFAULT_CATALOG_PATHS.riftbound
  );
}

let catalogByGame: Partial<Record<ProductGame, CatalogCard[]>> | null = null;
let catalogLoaded = false;

function getCatalogByGame(): Partial<Record<ProductGame, CatalogCard[]>> {
  if (catalogLoaded) {
    return catalogByGame ?? {};
  }

  catalogLoaded = true;
  catalogByGame = {};

  for (const game of CSV_GAMES) {
    const cards = loadCatalogCardsFromFile(resolveCatalogPath(game));
    if (cards.length > 0) {
      catalogByGame[game] = cards;
    }
  }

  const hasSplitData = CSV_GAMES.some(
    (game) => (catalogByGame?.[game]?.length ?? 0) > 0,
  );
  if (!hasSplitData) {
    const combinedPath =
      process.env.TCGPLAYER_CATALOG_CSV?.trim() || LEGACY_COMBINED_CSV;
    catalogByGame = loadCatalogBucketsFromCombined(combinedPath);
  }

  return catalogByGame;
}

export function getCatalogFromTcgplayerCsv(game: ProductGame): CatalogCard[] {
  if (!CSV_GAMES.includes(game as (typeof CSV_GAMES)[number])) {
    return [];
  }
  return getCatalogByGame()[game] ?? [];
}
