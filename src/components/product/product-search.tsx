"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { GridColumnsPerRow } from "@/components/product/product-list";
import { ProductListingSource, ProductSort } from "@/types/product";

type Props = {
  sort: ProductSort;
  onSortChange: (value: ProductSort) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  columnsPerRow: GridColumnsPerRow;
  onColumnsPerRowChange: (value: GridColumnsPerRow) => void;
  listingSource: ProductListingSource;
  onListingSourceChange: (value: ProductListingSource) => void;
  page: number;
  totalPages: number;
  resultCount: number;
  onClearFilters: () => void;
};

export function ProductSearch({
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
  columnsPerRow,
  onColumnsPerRowChange,
  listingSource,
  onListingSourceChange,
  page,
  totalPages,
  resultCount,
  onClearFilters,
}: Props) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-xs text-gray-600 tabular-nums sm:text-sm">
          <span className="font-semibold text-gray-800">
            {t("product.pageOf", { page, totalPages })}
          </span>
          <span className="mx-2 text-gray-300">·</span>
          <span>{t("product.resultCount", { count: resultCount })}</span>
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="shrink-0 text-xs font-semibold text-(--accent-teal) hover:text-[#057a7a]"
        >
          {t("product.clearFilters")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="min-w-0">
          <label className="mb-0.5 block text-xs font-semibold text-gray-700">
            {t("product.listingSource")}
          </label>
          <select
            value={listingSource}
            onChange={(event) =>
              onListingSourceChange(event.target.value as ProductListingSource)
            }
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none sm:text-sm focus:border-(--accent-teal) focus:ring-2 focus:ring-[#d8f3f3]"
          >
            <option value="inventory">{t("product.sourceInventory")}</option>
            <option value="tcg">{t("product.sourceTcg")}</option>
          </select>
        </div>
        <div className="min-w-0">
          <label className="mb-0.5 block text-xs font-semibold text-gray-700">
            {t("product.sort")}
          </label>
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as ProductSort)
            }
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none sm:text-sm focus:border-(--accent-teal) focus:ring-2 focus:ring-[#d8f3f3]"
          >
            <option value="relevance">{t("product.sortRelevance")}</option>
            <option value="price-asc">{t("product.sortPriceAsc")}</option>
            <option value="price-desc">{t("product.sortPriceDesc")}</option>
            <option value="name-asc">{t("product.sortNameAsc")}</option>
            <option value="name-desc">{t("product.sortNameDesc")}</option>
          </select>
        </div>
        <div className="min-w-0">
          <label className="mb-0.5 block text-xs font-semibold text-gray-700">
            {t("product.pageSize")}
          </label>
          <select
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none sm:text-sm focus:border-(--accent-teal) focus:ring-2 focus:ring-[#d8f3f3]"
          >
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className="min-w-0">
          <label className="mb-0.5 block text-xs font-semibold text-gray-700">
            {t("product.cardsPerRow")}
          </label>
          <select
            value={String(columnsPerRow)}
            onChange={(event) =>
              onColumnsPerRowChange(Number(event.target.value) as GridColumnsPerRow)
            }
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none sm:text-sm focus:border-(--accent-teal) focus:ring-2 focus:ring-[#d8f3f3]"
          >
            <option value="2">{t("product.cardsPerRowOption", { count: 2 })}</option>
            <option value="4">{t("product.cardsPerRowOption", { count: 4 })}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
