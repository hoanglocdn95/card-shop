export type Product = {
  id: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  stock?: number;
  rarity?: string;
  cardType?: string;
  set?: string;
  subtypes?: string[];
  tcgPlayerUrl?: string;
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
};
