import axios from "axios";

import { PRODUCT_PAGE_SIZE } from "@/constants/app";
import { productSchema } from "@/schemas/product.schema";
import { Product } from "@/types/product";

type PokemonCardsResponse = {
  page?: number;
  pageSize?: number;
  count?: number;
  totalCount?: number;
  data: Array<{
    id: string;
    name: string;
    images?: { small?: string; large?: string };
    set?: { id?: string };
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

function mapPokemonCardToProduct(card: PokemonCardsResponse["data"][number]): Product {
  const mapped = {
    id: card.id,
    sku: `${card.set?.id ?? "set"}-${card.id}`,
    name: card.name,
    image: card.images?.small ?? card.images?.large ?? "",
    price:
      card.cardmarket?.prices?.averageSellPrice ??
      card.cardmarket?.prices?.trendPrice ??
      1,
    stock: getDeterministicStock(card.id),
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

  const response = await axios.get<PokemonCardsResponse>(baseUrl, {
    params,
    headers,
  });

  const products = response.data.data.map(mapPokemonCardToProduct);
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
