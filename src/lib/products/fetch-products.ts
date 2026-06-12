import { PRODUCT_PAGE_SIZE } from "@/constants/app";
import {
  appsScriptGet,
  AppsScriptRequestError,
  hasAppsScriptConfig,
} from "@/lib/apps-script/client";
import {
  isListProductsEnabled,
  markListProductsSupported,
  markListProductsUnsupported,
  shouldLogListProductsFallback,
} from "@/lib/apps-script/capabilities";
import { getCatalogForGame } from "@/lib/catalog";
import { normalizeProductIdentity } from "@/lib/product-id";
import { computeVndFromUsd, getUsdVndRateGoogleLike } from "@/lib/pricing";
import { productSchema } from "@/schemas/product.schema";
import {
  Product,
  ProductGame,
  ProductListingSource,
} from "@/types/product";

type FetchProductsParams = {
  searchQuery?: string;
  game?: ProductGame;
  page?: number;
  pageSize?: number;
  source?: ProductListingSource;
};

type FetchProductsResult = {
  products: Product[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  source: ProductListingSource;
};

type AppsScriptListProductsResponse = {
  products: Product[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  source?: ProductListingSource;
};

async function fetchProductsFromAppsScript({
  searchQuery,
  game = "one-piece",
  page = 1,
  pageSize = PRODUCT_PAGE_SIZE,
  source = "inventory",
}: FetchProductsParams): Promise<FetchProductsResult | null> {
  if (!hasAppsScriptConfig() || !isListProductsEnabled()) return null;

  try {
    const data = await appsScriptGet<AppsScriptListProductsResponse>("listProducts", {
      game,
      q: searchQuery?.trim() || undefined,
      page,
      pageSize,
      source,
    });

    if (!data.products?.length && data.pagination.totalCount === 0) {
      return null;
    }

    const products = data.products.map((item) =>
      productSchema.parse(normalizeProductIdentity(item)),
    );
    markListProductsSupported();
    return {
      products,
      page: data.pagination.page,
      pageSize: data.pagination.pageSize,
      totalCount: data.pagination.totalCount,
      hasNextPage: data.pagination.hasNextPage,
      source: data.source ?? source,
    };
  } catch (error) {
    if (
      error instanceof AppsScriptRequestError &&
      (error.code === "INVALID_ACTION" ||
        error.message.includes("Invalid action for GET"))
    ) {
      const logOnce = shouldLogListProductsFallback();
      markListProductsUnsupported();
      if (logOnce) {
        console.info(
          "[card-shop] Apps Script chưa có action listProducts — dùng catalog local. Hãy deploy lại code trong docs/apps-script/.",
        );
      }
      return null;
    }

    console.warn(
      "[card-shop] Apps Script listProducts failed, using local catalog.",
      error,
    );
    return null;
  }
}

async function fetchProductsFromLocalCatalog({
  searchQuery,
  game = "one-piece",
  page = 1,
  pageSize = PRODUCT_PAGE_SIZE,
  source = "inventory",
}: FetchProductsParams): Promise<FetchProductsResult> {
  const usdVndRate = await getUsdVndRateGoogleLike();
  const catalog = getCatalogForGame(game);
  const keyword = searchQuery?.trim().toLowerCase();

  const filtered = keyword
    ? catalog.filter((card) => {
        const nameHit = card.name.toLowerCase().includes(keyword);
        const displayHit = card.displayName.toLowerCase().includes(keyword);
        const codeHit = card.cardCode.toLowerCase().includes(keyword);
        return nameHit || displayHit || codeHit;
      })
    : catalog;

  const products = filtered.map((card, index) => {
    const isInventoryPick = index % 2 === 0;
    const stock =
      source === "tcg"
        ? 999
        : isInventoryPick
          ? Math.max(1, (index % 5) + 1)
          : 0;

    return productSchema.parse(
      normalizeProductIdentity({
        id: card.id,
        game,
        cardCode: card.cardCode,
        sku: card.cardCode,
        name: card.name,
        displayName: card.displayName,
        image: card.image,
        price: computeVndFromUsd({
          usd: card.priceUsd,
          usdVndRate,
          multiplier: 1.1,
        }),
        stock,
        rarity: card.rarity,
        cardType: card.cardType,
        set: card.set,
        subtypes: card.subtypes,
        tcgPlayerUrl: card.tcgPlayerUrl,
        listingSource: source,
        fulfillmentStatus:
          source === "tcg"
            ? "tcg-order"
            : stock > 0
              ? "in-stock"
              : "out-of-stock",
      }),
    );
  });

  const visible =
    source === "inventory"
      ? products
      : products;

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagedProducts = visible.slice(start, end);

  return {
    products: pagedProducts,
    page,
    pageSize,
    totalCount: visible.length,
    hasNextPage: end < visible.length,
    source,
  };
}

export async function fetchProducts(
  params: FetchProductsParams = {},
): Promise<FetchProductsResult> {
  const source = params.source ?? "inventory";
  const fromAppsScript = await fetchProductsFromAppsScript({ ...params, source });
  if (fromAppsScript) {
    return fromAppsScript;
  }
  return fetchProductsFromLocalCatalog({ ...params, source });
}
