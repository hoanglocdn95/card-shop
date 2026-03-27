"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { PRODUCT_STALE_TIME_MS } from "@/constants/app";
import { ProductsQueryResponse, ProductSort } from "@/types/product";

type UseProductsParams = {
  query?: string;
  page: number;
  pageSize: number;
  sort: ProductSort;
};

async function fetchProducts({
  query,
  page,
  pageSize,
  sort,
}: UseProductsParams): Promise<ProductsQueryResponse> {
  const params = new URLSearchParams();
  if (query?.trim()) {
    params.set("q", query.trim());
  }
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("sort", sort);

  const response = await fetch(`/api/products?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to fetch products");
  }

  return (await response.json()) as ProductsQueryResponse;
}

export function useProducts(params: UseProductsParams) {
  return useQuery({
    queryKey: ["products", params.query, params.page, params.pageSize, params.sort],
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
    staleTime: PRODUCT_STALE_TIME_MS,
    gcTime: PRODUCT_STALE_TIME_MS * 3,
  });
}
