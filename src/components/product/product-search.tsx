"use client";

import { ProductSort } from "@/types/product";

type Props = {
  sort: ProductSort;
  onSortChange: (value: ProductSort) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  recentSearches: string[];
  onUseRecentSearch: (value: string) => void;
  onClearFilters: () => void;
};

export function ProductSearch({
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
  recentSearches,
  onUseRecentSearch,
  onClearFilters,
}: Props) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid w-full gap-3 md:grid-cols-[220px_140px_1fr]">
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Sort</label>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as ProductSort)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="default">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Page size
        </label>
        <select
          value={String(pageSize)}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
        </select>
      </div>
      <div className="flex items-end justify-end">
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Reset filters
        </button>
      </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {recentSearches.length > 0 ? (
            <>
              <span className="text-xs font-medium text-gray-500">Recent:</span>
              {recentSearches.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => onUseRecentSearch(keyword)}
                  className="rounded-full border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-100"
                >
                  {keyword}
                </button>
              ))}
            </>
          ) : (
            <span className="text-xs text-gray-400">
              Search history appears here.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
