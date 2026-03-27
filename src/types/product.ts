export type Product = {
  id: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  stock?: number;
};

export type ProductSort = "default" | "price-asc" | "price-desc";

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
