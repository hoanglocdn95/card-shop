import type {
  CatalogCsvRow,
  ExportGame,
  TcgCatalogProduct,
  TcgGroup,
  TcgProductPrice,
} from "./types";

function getExtendedValue(
  product: TcgCatalogProduct,
  keys: string[],
): string | undefined {
  const entries = product.extendedData ?? [];
  for (const key of keys) {
    const hit = entries.find(
      (item) =>
        item.name?.toLowerCase() === key.toLowerCase() ||
        item.displayName?.toLowerCase() === key.toLowerCase(),
    );
    const value = hit?.value?.trim();
    if (value) return value;
  }
  return undefined;
}

function pickMarketPriceUsd(prices: TcgProductPrice[]) {
  const normal = prices.find(
    (p) => p.subTypeName?.toLowerCase() === "normal" && p.marketPrice != null,
  );
  if (normal?.marketPrice != null) return normal.marketPrice;

  const anyWithMarket = prices.find((p) => p.marketPrice != null);
  if (anyWithMarket?.marketPrice != null) return anyWithMarket.marketPrice;

  const anyLow = prices.find((p) => p.lowPrice != null);
  return anyLow?.lowPrice ?? 0;
}

function toPublicProductUrl(product: TcgCatalogProduct) {
  if (product.url?.includes("tcgplayer.com")) {
    return product.url.replace("store.tcgplayer.com", "www.tcgplayer.com");
  }
  return `https://www.tcgplayer.com/product/${product.productId}`;
}

function deriveShortName(displayName: string, cleanName?: string) {
  if (cleanName?.trim()) return cleanName.trim();
  const beforeDash = displayName.split(" - ")[0]?.trim();
  return beforeDash || displayName;
}

export function mapProductToCsvRow({
  game,
  product,
  group,
  prices,
}: {
  game: ExportGame;
  product: TcgCatalogProduct;
  group: TcgGroup;
  prices: TcgProductPrice[];
}): CatalogCsvRow {
  const displayName = product.name.trim();
  const cardNumber = getExtendedValue(product, ["Number", "Card Number"]) ?? "";
  const rarity = getExtendedValue(product, ["Rarity"]) ?? "";
  const cardType =
    getExtendedValue(product, ["Card Type", "Type", "Category"]) ?? "Card";
  const subtypeRaw =
    getExtendedValue(product, ["Subtype", "Subtypes", "Trait", "Color"]) ?? "";
  const setCode = group.abbreviation?.trim() || group.name.trim();
  const cardCode = cardNumber.includes("-")
    ? cardNumber
    : cardNumber
      ? `${setCode}-${cardNumber}`
      : String(product.productId);

  const subtypes = subtypeRaw
    .split(/[,/|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join("|");

  const id = `${game}-${product.productId}`;

  return {
    game,
    id,
    cardCode,
    name: deriveShortName(displayName, product.cleanName),
    displayName,
    image: product.imageUrl ?? "",
    rarity,
    cardType,
    set: setCode,
    subtypes,
    priceUsd: pickMarketPriceUsd(prices),
    tcgPlayerUrl: toPublicProductUrl(product),
    stock: 0,
    tcgplayerProductId: product.productId,
    tcgplayerGroupId: product.groupId,
    tcgplayerCategoryId: product.categoryId,
    modifiedOn: product.modifiedOn ?? "",
  };
}

function slugFromProduct(productId: number, cardCode: string) {
  const normalized = cardCode
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || String(productId);
}
