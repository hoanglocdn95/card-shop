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

const FACEBOOK_NAME_KEY = "card-shop-facebook-name";
const SEARCH_DEBOUNCE_MS = 500;

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
  const pageSizeParam = Number(searchParams.get("pageSize") ?? "50");
  const pageSize = [50, 100].includes(pageSizeParam) ? pageSizeParam : 50;
  const colsParam = Number(searchParams.get("cols") ?? "4");
  const columnsPerRow: 2 | 3 | 4 = [2, 3, 4].includes(colsParam)
    ? (colsParam as 2 | 3 | 4)
    : 4;
  const sortParam = searchParams.get("sort");
  const sort: ProductSort =
    sortParam === "price-asc" ||
    sortParam === "price-desc" ||
    sortParam === "name-asc" ||
    sortParam === "name-desc" ||
    sortParam === "relevance"
      ? sortParam
      : "relevance";
  const [searchInput, setSearchInput] = useState(queryFromUrl);
  const debouncedQuery = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
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
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);

  /** Draft while typing — must NOT close the gate until user clicks Next. */
  const [facebookDraft, setFacebookDraft] = useState("");
  /** Only flips true after Next (or if a saved name already exists in localStorage). */
  const [facebookGatePassed, setFacebookGatePassed] = useState(false);
  const [isFacebookResolved, setIsFacebookResolved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(FACEBOOK_NAME_KEY);
    const saved = (raw ?? "").trim();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFacebookDraft(raw ?? "");
    if (saved) {
      setFacebookGatePassed(true);
    }
    setIsFacebookResolved(true);
  }, []);

  const showFacebookModal = isFacebookResolved && !facebookGatePassed;

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

  useEffect(() => {
    if (debouncedQuery !== queryFromUrl) {
      updateUrl({ q: debouncedQuery, page: 1 });
    }
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

  const { rarityOptions, subtypeOptions } = useMemo(() => {
    const products = productsQuery.data?.products ?? [];
    const rSet = new Set<string>();
    const sSet = new Set<string>();
    for (const p of products) {
      const r = p.rarity?.trim();
      if (r) rSet.add(r);
      for (const st of p.subtypes ?? []) {
        const t = String(st).trim();
        if (t) sSet.add(t);
      }
    }
    return {
      rarityOptions: [...rSet].sort((a, b) => a.localeCompare(b)),
      subtypeOptions: [...sSet].sort((a, b) => a.localeCompare(b)),
    };
  }, [productsQuery.data?.products]);

  const filteredProducts = useMemo(() => {
    const keyword = debouncedQuery.trim().toLowerCase();

    return (productsQuery.data?.products ?? []).filter((product) => {
      const stock = isInStock(product);
      const color = getProductColor(product);
      const rarity = product.rarity?.trim() ?? "";
      const subtypes = product.subtypes ?? [];

      if (statusFilter === "in-stock" && !stock) return false;
      if (statusFilter === "out-of-stock" && stock) return false;
      if (selectedColors.length > 0 && !selectedColors.includes(color))
        return false;
      if (
        selectedRarities.length > 0 &&
        (!rarity || !selectedRarities.includes(rarity))
      )
        return false;
      if (selectedSubtypes.length > 0) {
        const matchSubtype = selectedSubtypes.some((s) => subtypes.includes(s));
        if (!matchSubtype) return false;
      }
      if (
        keyword &&
        !product.name.toLowerCase().includes(keyword) &&
        !product.sku.toLowerCase().includes(keyword)
      )
        return false;
      return true;
    });
  }, [
    debouncedQuery,
    productsQuery.data?.products,
    selectedColors,
    selectedRarities,
    selectedSubtypes,
    statusFilter,
  ]);

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.totalCount / pagination.pageSize))
    : 1;
  const handleAddToCart = (
    product: ProductsQueryResponse["products"][number],
  ) => {
    cart.addItem(product);
    showToast("Added to cart");
  };

  if (showFacebookModal) {
    return (
      <div className="fixed inset-0 z-50 min-h-dvh bg-[var(--background)]">
        <div className="mx-auto flex min-h-dvh max-w-md items-center px-4 py-10">
          <div className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900">
                Facebook name
              </h2>
              <p className="text-sm text-gray-600">
                Please enter your Facebook name to access the shop.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Your Facebook name
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-(--accent-teal) focus:ring-2 focus:ring-[#d8f3f3]"
                value={facebookDraft}
                onChange={(e) => setFacebookDraft(e.target.value)}
                placeholder="e.g. John Smith"
                name="facebook-name"
                autoComplete="name"
              />
              <Button
                type="button"
                className="w-full bg-(--primary) hover:bg-(--primary-hover)"
                onClick={() => {
                  const trimmed = facebookDraft.trim();
                  if (!trimmed) return;
                  window.localStorage.setItem(FACEBOOK_NAME_KEY, trimmed);
                  setFacebookGatePassed(true);
                }}
                disabled={!facebookDraft.trim()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-dvh flex-col overflow-x-hidden bg-[var(--background)] xl:h-dvh xl:max-h-dvh xl:overflow-hidden">
      <div className="shrink-0">
        <ShopHeader
          searchValue={searchInput}
          onSearchChange={(nextValue) => {
            setSearchInput(nextValue);
          }}
        />
      </div>
      <section className="mx-auto grid min-h-0 w-full max-w-none flex-1 gap-4 px-4 py-3 sm:px-5 sm:py-4 lg:px-8 xl:grid-cols-[minmax(200px,260px)_minmax(0,1fr)_minmax(300px,420px)] xl:grid-rows-[minmax(0,1fr)] xl:gap-6 xl:overflow-hidden xl:py-0 xl:pb-3 xl:pt-2 2xl:px-10">
        <div className="min-h-0 overflow-y-auto overscroll-contain xl:pr-1">
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
            rarityOptions={rarityOptions}
            selectedRarities={selectedRarities}
            onToggleRarity={(value) => {
              setSelectedRarities((prev) =>
                prev.includes(value)
                  ? prev.filter((item) => item !== value)
                  : [...prev, value],
              );
            }}
            subtypeOptions={subtypeOptions}
            selectedSubtypes={selectedSubtypes}
            onToggleSubtype={(value) => {
              setSelectedSubtypes((prev) =>
                prev.includes(value)
                  ? prev.filter((item) => item !== value)
                  : [...prev, value],
              );
            }}
          />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col gap-0 overflow-hidden xl:h-full">
          <div className="sticky top-[7.5rem] z-20 shrink-0 border-b border-gray-200/80 bg-[var(--background)] pb-3 pt-1 xl:static xl:z-auto xl:border-0 xl:pb-2 xl:pt-0">
            <ProductSearch
              sort={sort}
              onSortChange={(nextSort) => {
                updateUrl({ sort: nextSort, page: 1 });
              }}
              pageSize={pageSize}
              onPageSizeChange={(nextPageSize) => {
                updateUrl({ pageSize: nextPageSize, page: 1 });
              }}
              columnsPerRow={columnsPerRow}
              onColumnsPerRowChange={(nextCols) => {
                updateUrl({ cols: nextCols });
              }}
              page={pagination?.page ?? page}
              totalPages={totalPages}
              resultCount={filteredProducts.length}
              onClearFilters={() => {
                setStatusFilter("all");
                setSelectedColors([]);
                setSelectedRarities([]);
                setSelectedSubtypes([]);
                setSearchInput("");
                updateUrl({
                  q: undefined,
                  sort: undefined,
                  page: 1,
                  pageSize: 50,
                  cols: 4,
                });
              }}
            />
          </div>

          <div className="min-h-0 space-y-4 py-4 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain xl:py-3">
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
                title="No matching products"
                message="Try adjusting your filters or search keyword."
              />
            ) : null}
            {productsQuery.data ? (
              <>
                {productsQuery.isFetching ? (
                  <ProductGridSkeleton count={pageSize} />
                ) : (
                  <ProductList
                    products={filteredProducts}
                    onAdd={handleAddToCart}
                    columnsPerRow={columnsPerRow}
                  />
                )}
              </>
            ) : null}
          </div>

          {productsQuery.data ? (
            <div className="sticky bottom-0 z-20 flex justify-end gap-2 border-t border-gray-200 bg-[var(--background)] py-3 shadow-[0_-6px_16px_-8px_rgba(15,23,42,0.12)] xl:static xl:shrink-0 xl:shadow-none">
              <Button
                className="bg-gray-600 hover:bg-gray-700"
                disabled={page <= 1 || productsQuery.isFetching}
                onClick={() => updateUrl({ page: Math.max(1, page - 1) })}
              >
                Previous
              </Button>
              <Button
                disabled={
                  !pagination?.hasNextPage || productsQuery.isFetching
                }
                onClick={() => updateUrl({ page: page + 1 })}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden xl:h-full">
          <CartPanel />
        </div>
      </section>
    </div>
  );
}
