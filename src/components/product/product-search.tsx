"use client";

import { ProductSort } from "@/types/product";

type Props = {
  sort: ProductSort;
  onSortChange: (value: ProductSort) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  columnsPerRow: 2 | 3 | 4;
  onColumnsPerRowChange: (value: 2 | 3 | 4) => void;
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
  page,
  totalPages,
  resultCount,
  onClearFilters,
}: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-xs text-gray-600 tabular-nums sm:text-sm">
          <span className="font-semibold text-gray-800">
            Page {page} / {totalPages}
          </span>
          <span className="mx-2 text-gray-300">·</span>
          <span>
            <span className="font-semibold text-gray-800">{resultCount}</span>{" "}
            products
          </span>
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="shrink-0 text-xs font-semibold text-(--accent-teal) hover:text-[#057a7a]"
        >
          Reset filters
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="min-w-0">
          <label className="mb-0.5 block text-xs font-semibold text-gray-700">
            Sort
          </label>
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as ProductSort)
            }
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none sm:text-sm focus:border-(--accent-teal) focus:ring-2 focus:ring-[#d8f3f3]"
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
        </div>
        <div className="min-w-0">
          <label className="mb-0.5 block text-xs font-semibold text-gray-700">
            Page size
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
            Card / row
          </label>
          <select
            value={String(columnsPerRow)}
            onChange={(event) =>
              onColumnsPerRowChange(Number(event.target.value) as 2 | 3 | 4)
            }
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none sm:text-sm focus:border-(--accent-teal) focus:ring-2 focus:ring-[#d8f3f3]"
          >
            <option value="2">2 cards</option>
            <option value="3">3 cards</option>
            <option value="4">4 cards</option>
          </select>
        </div>
      </div>
    </div>
  );
}
