"use client";

import { ProductColor } from "@/lib/product-meta";

type Props = {
  status: "all" | "in-stock" | "out-of-stock";
  onStatusChange: (value: "all" | "in-stock" | "out-of-stock") => void;
  colors: ProductColor[];
  selectedColors: ProductColor[];
  onToggleColor: (value: ProductColor) => void;
  rarityOptions: string[];
  selectedRarities: string[];
  onToggleRarity: (value: string) => void;
  subtypeOptions: string[];
  selectedSubtypes: string[];
  onToggleSubtype: (value: string) => void;
};

const COLOR_MAP: Record<ProductColor, string> = {
  Black: "bg-[#0f172a]",
  Red: "bg-[#FF8243]",
  Purple: "bg-[#7c3aed]",
  Yellow: "bg-[#FCE883]",
  Blue: "bg-[#2563eb]",
  Green: "bg-[#069494]",
  Gold: "bg-[#eab308]",
};

export function FilterSidebar({
  status,
  onStatusChange,
  colors,
  selectedColors,
  onToggleColor,
  rarityOptions,
  selectedRarities,
  onToggleRarity,
  subtypeOptions,
  selectedSubtypes,
  onToggleSubtype,
}: Props) {
  return (
    <aside className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
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
                    ? "border-(--accent-teal) bg-[#e7f8f8] text-[#046969]"
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
      {rarityOptions.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-800">Rarity</h3>
          <div className="max-h-40 space-y-1 overflow-y-auto text-sm text-gray-600">
            {rarityOptions.map((r) => (
              <label key={r} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRarities.includes(r)}
                  onChange={() => onToggleRarity(r)}
                />
                <span className="leading-tight">{r}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
      {subtypeOptions.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-800">Subtype(s)</h3>
          <div className="max-h-40 space-y-1 overflow-y-auto text-sm text-gray-600">
            {subtypeOptions.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSubtypes.includes(s)}
                  onChange={() => onToggleSubtype(s)}
                />
                <span className="leading-tight">{s}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
