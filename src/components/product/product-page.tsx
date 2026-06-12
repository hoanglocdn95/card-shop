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
import { GridColumnsPerRow, ProductList } from "@/components/product/product-list";
import { ProductSearch } from "@/components/product/product-search";
import { useI18n } from "@/components/providers/i18n-provider";
import { useCart } from "@/hooks/use-cart";
import { isInStock } from "@/lib/product-meta";
import { useProducts } from "@/hooks/use-products";
import {
  isProductGame,
  isProductListingSource,
  ProductGame,
  ProductListingSource,
  ProductSort,
  ProductsQueryResponse,
} from "@/types/product";

const FACEBOOK_NAME_KEY = "card-shop-facebook-name";

export function ProductPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gameParam = searchParams.get("game");
  const game: ProductGame = isProductGame(gameParam) ? gameParam : "one-piece";
  const queryFromUrl = searchParams.get("q") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSizeParam = Number(searchParams.get("pageSize") ?? "50");
  const pageSize = [50, 100].includes(pageSizeParam) ? pageSizeParam : 50;
  const colsParam = Number(searchParams.get("cols") ?? "4");
  const columnsPerRow: GridColumnsPerRow = colsParam === 2 ? 2 : 4;
  const sourceParam = searchParams.get("source");
  const listingSource: ProductListingSource = isProductListingSource(sourceParam)
    ? sourceParam
    : "inventory";
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
  const productsQuery = useProducts({
    game,
    query: queryFromUrl,
    page,
    pageSize,
    sort,
    source: listingSource,
  });
  const queryClient = useQueryClient();
  const cart = useCart();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "in-stock" | "out-of-stock"
  >("all");
  const [selectedCardTypes, setSelectedCardTypes] = useState<string[]>([]);
  const [selectedSets, setSelectedSets] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);
  const [facebookDraft, setFacebookDraft] = useState("");
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
    setSearchInput(queryFromUrl);
  }, [queryFromUrl]);

  const submitSearch = useCallback(() => {
    const nextQuery = searchInput.trim();
    updateUrl({ q: nextQuery || undefined, page: 1 });
  }, [searchInput, updateUrl]);

  useEffect(() => {
    const data = productsQuery.data;
    if (!data?.pagination.hasNextPage) return;

    void queryClient.prefetchQuery({
      queryKey: [
        "products",
        game,
        listingSource,
        queryFromUrl,
        page + 1,
        pageSize,
        sort,
      ],
      queryFn: async () => {
        const params = new URLSearchParams();
        params.set("game", game);
        if (queryFromUrl?.trim()) {
          params.set("q", queryFromUrl.trim());
        }
        params.set("page", String(page + 1));
        params.set("pageSize", String(pageSize));
        params.set("sort", sort);
        params.set("source", listingSource);

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error(t("product.prefetchError"));
        }
        return (await response.json()) as ProductsQueryResponse;
      },
      staleTime: 120_000,
    });
  }, [
    queryFromUrl,
    game,
    listingSource,
    page,
    pageSize,
    productsQuery.data,
    queryClient,
    sort,
    t,
  ]);

  const pagination = productsQuery.data?.pagination;

  const { cardTypeOptions, setOptions, rarityOptions, subtypeOptions } =
    useMemo(() => {
      const products = productsQuery.data?.products ?? [];
      const cardTypeSet = new Set<string>();
      const setSet = new Set<string>();
      const raritySet = new Set<string>();
      const subtypeSet = new Set<string>();
      for (const p of products) {
        const cardType = p.cardType?.trim();
        const cardSet = p.set?.trim();
        const rarity = p.rarity?.trim();
        if (cardType) cardTypeSet.add(cardType);
        if (cardSet) setSet.add(cardSet);
        if (rarity) raritySet.add(rarity);
        for (const st of p.subtypes ?? []) {
          const subtype = String(st).trim();
          if (subtype) subtypeSet.add(subtype);
        }
      }
      return {
        cardTypeOptions: [...cardTypeSet].sort((a, b) => a.localeCompare(b)),
        setOptions: [...setSet].sort((a, b) => a.localeCompare(b)),
        rarityOptions: [...raritySet].sort((a, b) => a.localeCompare(b)),
        subtypeOptions: [...subtypeSet].sort((a, b) => a.localeCompare(b)),
      };
    }, [productsQuery.data?.products]);

  const filteredProducts = useMemo(() => {
    return (productsQuery.data?.products ?? []).filter((product) => {
      const stock = isInStock(product);
      const cardType = product.cardType?.trim() ?? "";
      const set = product.set?.trim() ?? "";
      const rarity = product.rarity?.trim() ?? "";
      const subtypes = product.subtypes ?? [];

      if (statusFilter === "in-stock" && !stock) return false;
      if (statusFilter === "out-of-stock" && stock) return false;
      if (selectedCardTypes.length > 0 && !selectedCardTypes.includes(cardType))
        return false;
      if (selectedSets.length > 0 && !selectedSets.includes(set)) return false;
      if (
        selectedRarities.length > 0 &&
        (!rarity || !selectedRarities.includes(rarity))
      ) {
        return false;
      }
      if (selectedSubtypes.length > 0) {
        const matchSubtype = selectedSubtypes.some((s) => subtypes.includes(s));
        if (!matchSubtype) return false;
      }
      return true;
    });
  }, [
    productsQuery.data?.products,
    selectedCardTypes,
    selectedRarities,
    selectedSets,
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
    showToast(t("product.addedToCart"));
  };

  if (showFacebookModal) {
    return (
      <div className="fixed inset-0 z-50 min-h-dvh bg-[var(--background)]">
        <div className="mx-auto flex min-h-dvh max-w-md items-center px-4 py-10">
          <div className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900">
                {t("facebook.title")}
              </h2>
              <p className="text-sm text-gray-600">{t("facebook.description")}</p>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-gray-900">
                {t("facebook.label")}
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-(--accent-teal) focus:ring-2 focus:ring-[#d8f3f3]"
                value={facebookDraft}
                onChange={(e) => setFacebookDraft(e.target.value)}
                placeholder={t("facebook.placeholder")}
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
                {t("facebook.continue")}
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
          game={game}
          onGameChange={(nextGame) => {
            updateUrl({ game: nextGame, page: 1, q: undefined });
            setSearchInput("");
          }}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={submitSearch}
        />
      </div>
      <section className="mx-auto grid min-h-0 w-full max-w-none flex-1 gap-4 px-4 py-3 sm:px-5 sm:py-4 lg:px-8 xl:grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(300px,420px)] xl:grid-rows-[minmax(0,1fr)] xl:gap-6 xl:overflow-hidden xl:py-0 xl:pb-3 xl:pt-2 2xl:px-10">
        <div className="min-h-0 overflow-y-auto overscroll-contain xl:pr-1">
          <FilterSidebar
            status={statusFilter}
            onStatusChange={setStatusFilter}
            cardTypeOptions={cardTypeOptions}
            selectedCardTypes={selectedCardTypes}
            onToggleCardType={(value) => {
              setSelectedCardTypes((prev) =>
                prev.includes(value)
                  ? prev.filter((item) => item !== value)
                  : [...prev, value],
              );
            }}
            setOptions={setOptions}
            selectedSets={selectedSets}
            onToggleSet={(value) => {
              setSelectedSets((prev) =>
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
              listingSource={listingSource}
              onListingSourceChange={(nextSource) => {
                updateUrl({ source: nextSource, page: 1 });
              }}
              page={pagination?.page ?? page}
              totalPages={totalPages}
              resultCount={filteredProducts.length}
              onClearFilters={() => {
                setStatusFilter("all");
                setSelectedCardTypes([]);
                setSelectedSets([]);
                setSelectedRarities([]);
                setSelectedSubtypes([]);
                setSearchInput("");
                updateUrl({
                  q: undefined,
                  sort: undefined,
                  source: "inventory",
                  page: 1,
                  pageSize: 50,
                  cols: 4,
                });
              }}
            />
          </div>

          <div className="min-h-0 space-y-4 py-4 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain xl:py-3">
            {productsQuery.isLoading ? (
              <ProductGridSkeleton
                count={pageSize}
                columnsPerRow={columnsPerRow}
              />
            ) : null}
            {productsQuery.error ? (
              <ErrorState message={productsQuery.error.message} />
            ) : null}
            {!productsQuery.isLoading &&
            !productsQuery.error &&
            filteredProducts.length === 0 ? (
              <EmptyState
                title={t("product.notFoundTitle")}
                message={t("product.notFoundMessage")}
              />
            ) : null}
            {productsQuery.data ? (
              <>
                {productsQuery.isFetching ? (
                  <ProductGridSkeleton
                    count={pageSize}
                    columnsPerRow={columnsPerRow}
                  />
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
                {t("product.prevPage")}
              </Button>
              <Button
                disabled={!pagination?.hasNextPage || productsQuery.isFetching}
                onClick={() => updateUrl({ page: page + 1 })}
              >
                {t("product.nextPage")}
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
