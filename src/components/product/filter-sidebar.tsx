"use client";

import { ProductColor } from "@/lib/product-meta";

type Props = {
  status: "all" | "in-stock" | "out-of-stock";
  onStatusChange: (value: "all" | "in-stock" | "out-of-stock") => void;
  colors: ProductColor[];
  selectedColors: ProductColor[];
  onToggleColor: (value: ProductColor) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
};

const COLOR_MAP: Record<ProductColor, string> = {
  Black: "bg-black",
  Red: "bg-red-500",
  Purple: "bg-purple-500",
  Yellow: "bg-yellow-400",
  Blue: "bg-blue-500",
  Green: "bg-green-500",
  Gold: "bg-amber-500",
};

export function FilterSidebar({
  status,
  onStatusChange,
  colors,
  selectedColors,
  onToggleColor,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: Props) {
  return (
    <aside className="space-y-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-800">Stock Status</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={status === "all"}
              onChange={() => onStatusChange("all")}
            />
            All
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={status === "in-stock"}
              onChange={() => onStatusChange("in-stock")}
            />
            In stock
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={status === "out-of-stock"}
              onChange={() => onStatusChange("out-of-stock")}
            />
            Sold out
          </label>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-800">Color</h3>
        <div className="grid grid-cols-2 gap-2">
          {colors.map((color) => {
            const selected = selectedColors.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => onToggleColor(color)}
                className={`flex items-center gap-2 rounded-md border px-2 py-1 text-xs ${
                  selected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                <span className={`h-3 w-3 rounded-full ${COLOR_MAP[color]}`} />
                {color}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-800">Price</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
            placeholder="Min"
            className="rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
          <input
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
            placeholder="Max"
            className="rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
        </div>
      </div>
    </aside>
  );
}
