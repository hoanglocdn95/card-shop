import type { CatalogCsvRow, ExportGame } from "../tcgplayer-export/types";
import { slugify } from "../tcgplayer-export/utils";
import type { MpSearchProduct } from "./types";

function productImageUrl(productId: number) {
  return `https://product-images.tcgplayer.com/fit-in/437x437/${productId}.jpg`;
}

function productPageUrl(product: MpSearchProduct) {
  const slug = slugify(product.productUrlName || product.productName);
  return `https://www.tcgplayer.com/product/${product.productId}/${slug}`;
}

function buildDisplayName(product: MpSearchProduct) {
  const number = product.customAttributes?.number?.trim();
  if (number) {
    return `${product.productName} (${number}) - ${product.setName}`;
  }
  return `${product.productName} - ${product.setName}`;
}

function buildCardCode(product: MpSearchProduct) {
  const number = product.customAttributes?.number?.trim();
  if (number) return number;
  const setCode = product.setCode?.trim();
  if (setCode) return setCode;
  return String(product.productId);
}

function buildSubtypes(product: MpSearchProduct) {
  const parts = [
    ...(product.customAttributes?.subtypes ?? []),
    ...(product.customAttributes?.color ?? []),
  ]
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set(parts)].join("|");
}

function buildCardType(product: MpSearchProduct) {
  const fromAttrs = product.customAttributes?.cardType?.[0]?.trim();
  if (fromAttrs) return fromAttrs;
  if (product.sealed) return "Sealed Product";
  return "Card";
}

export function mapMpProductToCsvRow(
  game: ExportGame,
  product: MpSearchProduct,
): CatalogCsvRow {
  const cardCode = buildCardCode(product);
  const displayName = buildDisplayName(product);
  const id = `${game}-${product.productId}`;

  return {
    game,
    id,
    cardCode,
    name: product.productName.trim(),
    displayName,
    image: productImageUrl(product.productId),
    rarity: product.rarityName?.trim() || "",
    cardType: buildCardType(product),
    set: product.setCode?.trim() || product.setName?.trim() || "",
    subtypes: buildSubtypes(product),
    priceUsd: product.marketPrice ?? product.lowestPrice ?? 0,
    tcgPlayerUrl: productPageUrl(product),
    stock: 0,
    tcgplayerProductId: product.productId,
    tcgplayerGroupId: product.setId,
    tcgplayerCategoryId: product.productLineId,
    modifiedOn: product.customAttributes?.releaseDate ?? "",
  };
}
