"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CartPanel } from "@/components/cart/cart-panel";
import { ShopHeader } from "@/components/layout/shop-header";
import { Button } from "@/components/common/button";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useToast } from "@/components/providers/toast-provider";
import { FilterSidebar } from "@/components/product/filter-sidebar";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { ProductList } from "@/components/product/product-list";
import { ProductSearch } from "@/components/product/product-search";
import { useCart } from "@/hooks/use-cart";
import {
  getProductColor,
  getProductColorOptions,
  isInStock,
  ProductColor,
} from "@/lib/product-meta";
import { useProducts } from "@/hooks/use-products";
import { ProductSort, ProductsQueryResponse } from "@/types/product";

const RECENT_SEARCHES_KEY = "card-shop-recent-searches";
const MAX_RECENT_SEARCHES = 6;

function useDebouncedValue(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function ProductPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSizeParam = Number(searchParams.get("pageSize") ?? "10");
  const pageSize = [10, 20, 30].includes(pageSizeParam) ? pageSizeParam : 10;
  const sortParam = searchParams.get("sort");
  const sort: ProductSort =
    sortParam === "price-asc" || sortParam === "price-desc"
      ? sortParam
      : "default";
  const [searchInput, setSearchInput] = useState(queryFromUrl);
  const debouncedQuery = useDebouncedValue(searchInput);
  const productsQuery = useProducts({
    query: debouncedQuery,
    page,
    pageSize,
    sort,
  });
  const queryClient = useQueryClient();
  const cart = useCart();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "in-stock" | "out-of-stock"
  >("all");
  const [selectedColors, setSelectedColors] = useState<ProductColor[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
      return [];
    }
  });

  const updateUrl = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const saveRecentSearch = (value: string) => {
    const normalized = value.trim();
    if (!normalized || normalized.length < 2) return;
    setRecentSearches((prev) => {
      const next = [normalized, ...prev.filter((item) => item !== normalized)].slice(
        0,
        MAX_RECENT_SEARCHES,
      );
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (debouncedQuery === queryFromUrl) return;
    updateUrl({ q: debouncedQuery, page: 1 });
  }, [debouncedQuery, queryFromUrl, updateUrl]);

  useEffect(() => {
    const data = productsQuery.data;
    if (!data?.pagination.hasNextPage) return;

    void queryClient.prefetchQuery({
      queryKey: ["products", debouncedQuery, page + 1, pageSize, sort],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (debouncedQuery?.trim()) {
          params.set("q", debouncedQuery.trim());
        }
        params.set("page", String(page + 1));
        params.set("pageSize", String(pageSize));
        params.set("sort", sort);

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Unable to prefetch products");
        }
        return (await response.json()) as ProductsQueryResponse;
      },
      staleTime: 120_000,
    });
  }, [debouncedQuery, page, pageSize, productsQuery.data, queryClient, sort]);

  const pagination = productsQuery.data?.pagination;
  const allColorOptions = getProductColorOptions();
  const filteredProducts = useMemo(() => {
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;

    return (productsQuery.data?.products ?? []).filter((product) => {
      const stock = isInStock(product);
      const color = getProductColor(product);
      const price = product.price;

      if (statusFilter === "in-stock" && !stock) return false;
      if (statusFilter === "out-of-stock" && stock) return false;
      if (selectedColors.length > 0 && !selectedColors.includes(color)) return false;
      if (min !== undefined && Number.isFinite(min) && price < min) return false;
      if (max !== undefined && Number.isFinite(max) && price > max) return false;
      return true;
    });
  }, [maxPrice, minPrice, productsQuery.data?.products, selectedColors, statusFilter]);

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.totalCount / pagination.pageSize))
    : 1;
  const handleAddToCart = (
    product: ProductsQueryResponse["products"][number],
  ) => {
    cart.addItem(product);
    showToast("Added to cart");
  };

  return (
    <div className="space-y-6">
      <ShopHeader
        searchValue={searchInput}
        onSearchChange={(nextValue) => {
          setSearchInput(nextValue);
          saveRecentSearch(nextValue);
        }}
      />
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 lg:px-8 xl:grid-cols-[240px_minmax(0,1fr)_360px]">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <FilterSidebar
            status={statusFilter}
            onStatusChange={setStatusFilter}
            colors={allColorOptions}
            selectedColors={selectedColors}
            onToggleColor={(value) => {
              setSelectedColors((prev) =>
                prev.includes(value)
                  ? prev.filter((item) => item !== value)
                  : [...prev, value],
              );
            }}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
          />
        </div>
        <div className="space-y-4">
        <ProductSearch
          sort={sort}
          onSortChange={(nextSort) => {
            updateUrl({ sort: nextSort, page: 1 });
          }}
          pageSize={pageSize}
          onPageSizeChange={(nextPageSize) => {
            updateUrl({ pageSize: nextPageSize, page: 1 });
          }}
          recentSearches={recentSearches}
          onUseRecentSearch={(value) => {
            setSearchInput(value);
            saveRecentSearch(value);
          }}
          onClearFilters={() => {
            setStatusFilter("all");
            setSelectedColors([]);
            setMinPrice("");
            setMaxPrice("");
            setSearchInput("");
            updateUrl({
              q: undefined,
              sort: undefined,
              page: 1,
              pageSize: 10,
            });
          }}
        />
        {productsQuery.isLoading ? (
          <ProductGridSkeleton count={pageSize} />
        ) : null}
        {productsQuery.error ? (
          <ErrorState message={productsQuery.error.message} />
        ) : null}
        {!productsQuery.isLoading &&
        !productsQuery.error &&
        filteredProducts.length === 0 ? (
          <EmptyState
            title="Khong co san pham phu hop"
            message="Thu doi bo loc hoac tu khoa tim kiem."
          />
        ) : null}
        {productsQuery.data ? (
          <>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <p>
                Page {pagination?.page ?? page} / {totalPages}
              </p>
              <p>{filteredProducts.length} san pham</p>
            </div>
            {productsQuery.isFetching ? (
              <ProductGridSkeleton count={pageSize} />
            ) : (
              <ProductList products={filteredProducts} onAdd={handleAddToCart} />
            )}
            <div className="flex items-center justify-end gap-2">
              <Button
                className="bg-gray-600 hover:bg-gray-700"
                disabled={page <= 1 || productsQuery.isFetching}
                onClick={() => updateUrl({ page: Math.max(1, page - 1) })}
              >
                Previous
              </Button>
              <Button
                disabled={!pagination?.hasNextPage || productsQuery.isFetching}
                onClick={() => updateUrl({ page: page + 1 })}
              >
                Next
              </Button>
            </div>
          </>
        ) : null}
      </div>
        <div className="xl:sticky xl:top-24 xl:self-start">
          <CartPanel />
        </div>
      </section>
    </div>
  );
}
