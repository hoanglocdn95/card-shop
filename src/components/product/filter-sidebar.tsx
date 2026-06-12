"use client";

import { useI18n } from "@/components/providers/i18n-provider";

type Props = {
  status: "all" | "in-stock" | "out-of-stock";
  onStatusChange: (value: "all" | "in-stock" | "out-of-stock") => void;
  cardTypeOptions: string[];
  selectedCardTypes: string[];
  onToggleCardType: (value: string) => void;
  setOptions: string[];
  selectedSets: string[];
  onToggleSet: (value: string) => void;
  rarityOptions: string[];
  selectedRarities: string[];
  onToggleRarity: (value: string) => void;
  subtypeOptions: string[];
  selectedSubtypes: string[];
  onToggleSubtype: (value: string) => void;
};

function CheckboxList({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-800">{title}</h3>
      <div className="max-h-40 space-y-1 overflow-y-auto text-sm text-gray-600">
        {options.map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
            />
            <span className="leading-tight">{value}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function FilterSidebar({
  status,
  onStatusChange,
  cardTypeOptions,
  selectedCardTypes,
  onToggleCardType,
  setOptions,
  selectedSets,
  onToggleSet,
  rarityOptions,
  selectedRarities,
  onToggleRarity,
  subtypeOptions,
  selectedSubtypes,
  onToggleSubtype,
}: Props) {
  const { t } = useI18n();

  return (
    <aside className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{t("filter.title")}</h2>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-800">
          {t("filter.stockStatus")}
        </h3>
        <div className="space-y-1 text-sm text-gray-600">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={status === "all"}
              onChange={() => onStatusChange("all")}
            />
            {t("filter.all")}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={status === "in-stock"}
              onChange={() => onStatusChange("in-stock")}
            />
            {t("filter.inStock")}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={status === "out-of-stock"}
              onChange={() => onStatusChange("out-of-stock")}
            />
            {t("filter.outOfStock")}
          </label>
        </div>
      </div>
      <CheckboxList
        title={t("filter.cardType")}
        options={cardTypeOptions}
        selected={selectedCardTypes}
        onToggle={onToggleCardType}
      />
      <CheckboxList
        title={t("filter.set")}
        options={setOptions}
        selected={selectedSets}
        onToggle={onToggleSet}
      />
      <CheckboxList
        title={t("filter.rarity")}
        options={rarityOptions}
        selected={selectedRarities}
        onToggle={onToggleRarity}
      />
      <CheckboxList
        title={t("filter.subtypes")}
        options={subtypeOptions}
        selected={selectedSubtypes}
        onToggle={onToggleSubtype}
      />
    </aside>
  );
}
