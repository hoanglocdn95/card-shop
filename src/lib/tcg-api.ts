import axios from "axios";

import { PRODUCT_PAGE_SIZE } from "@/constants/app";
import { productSchema } from "@/schemas/product.schema";
import { Product } from "@/types/product";
import { computeVndFromUsd, getUsdVndRateGoogleLike } from "@/lib/pricing";
import { getStockMapFromKho } from "@/lib/stock-sync";

type PokemonCardsResponse = {
  page?: number;
  pageSize?: number;
  count?: number;
  totalCount?: number;
  data: Array<{
    id: string;
    name: string;
    rarity?: string;
    subtypes?: string[];
    images?: { small?: string; large?: string };
    set?: { id?: string };
    tcgplayer?: { url?: string };
    cardmarket?: {
      prices?: {
        averageSellPrice?: number;
        trendPrice?: number;
      };
    };
  }>;
};

function getDeterministicStock(id: string) {
  const seed = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (seed * 7) % 16 === 0 ? 0 : (seed % 36) + 1;
}

type FetchProductsParams = {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
};

type FetchProductsResult = {
  products: Product[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

function mapPokemonCardToProduct({
  card,
  usdVndRate,
  stockMap,
}: {
  card: PokemonCardsResponse["data"][number];
  usdVndRate: number;
  stockMap: Record<string, number>;
}): Product {
  const sku = `${card.set?.id ?? "set"}-${card.id}`;
  const stockBySku = stockMap[sku.toUpperCase()];
  const stockById = stockMap[String(card.id).toUpperCase()];
  const resolvedStock =
    typeof stockBySku === "number"
      ? stockBySku
      : typeof stockById === "number"
        ? stockById
        : getDeterministicStock(card.id);

  const usdRaw =
    card.cardmarket?.prices?.averageSellPrice ??
    card.cardmarket?.prices?.trendPrice ??
    0;
  const subtypes = Array.isArray(card.subtypes)
    ? card.subtypes.map((s) => String(s).trim()).filter(Boolean)
    : [];

  const mapped = {
    id: card.id,
    sku,
    name: card.name,
    image: card.images?.small ?? card.images?.large ?? "",
    // Giá VND = tỷ giá USD/VND × 1,1 × giá USD (cardmarket)
    price: computeVndFromUsd({
      usd: usdRaw,
      usdVndRate,
      multiplier: 1.1,
    }),
    stock: resolvedStock,
    rarity: (card.rarity ?? "").trim() || undefined,
    cardType: "Card",
    set: card.set?.id ?? "",
    subtypes,
    tcgPlayerUrl:
      (card.tcgplayer?.url && String(card.tcgplayer.url).trim()) ||
      `https://www.tcgplayer.com/search/pokemon?q=${encodeURIComponent(
        card.name,
      )}`,
  };

  return productSchema.parse(mapped);
}

export async function fetchProducts({
  searchQuery,
  page = 1,
  pageSize = PRODUCT_PAGE_SIZE,
}: FetchProductsParams = {}): Promise<FetchProductsResult> {
  const baseUrl =
    process.env.TCG_API_BASE_URL ?? "https://api.pokemontcg.io/v2/cards";

  const params: Record<string, string | number> = {
    page,
    pageSize,
  };

  if (searchQuery?.trim()) {
    params.q = `name:*${searchQuery.trim()}*`;
  }

  const headers: Record<string, string> = {};
  if (process.env.TCG_API_KEY) {
    headers["X-Api-Key"] = process.env.TCG_API_KEY;
  }

  const usdVndRate = await getUsdVndRateGoogleLike();
  const stockMap = await getStockMapFromKho();

  const response = await axios.get<PokemonCardsResponse>(baseUrl, {
    params,
    headers,
  });

  const products = response.data.data.map((card) =>
    mapPokemonCardToProduct({ card, usdVndRate, stockMap }),
  );
  const resolvedPage = response.data.page ?? page;
  const resolvedPageSize = response.data.pageSize ?? pageSize;
  const totalCount = response.data.totalCount ?? response.data.count ?? products.length;
  const hasNextPage = resolvedPage * resolvedPageSize < totalCount;

  return {
    products,
    page: resolvedPage,
    pageSize: resolvedPageSize,
    totalCount,
    hasNextPage,
  };
}
