export type ProductGame = "one-piece" | "riftbound";

export const PRODUCT_GAMES: ProductGame[] = ["one-piece", "riftbound"];

export type ProductListingSource = "inventory" | "tcg";

export type ProductFulfillmentStatus = "in-stock" | "out-of-stock" | "tcg-order";

export function isProductGame(value: string | null): value is ProductGame {
  return value === "one-piece" || value === "riftbound";
}

export function isProductListingSource(
  value: string | null,
): value is ProductListingSource {
  return value === "inventory" || value === "tcg";
}

export type Product = {
  id: string;
  game: ProductGame;
  cardCode: string;
  sku: string;
  name: string;
  displayName: string;
  image: string;
  price: number;
  stock?: number;
  rarity?: string;
  cardType?: string;
  set?: string;
  subtypes?: string[];
  tcgPlayerUrl?: string;
  listingSource?: ProductListingSource;
  fulfillmentStatus?: ProductFulfillmentStatus;
};

export type ProductSort =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export type ProductsPagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type ProductsQueryResponse = {
  products: Product[];
  pagination: ProductsPagination;
  sort: ProductSort;
  source: ProductListingSource;
};
