"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import type { Locale } from "@/i18n/types";

const OPTIONS: Locale[] = ["vi", "en"];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white p-0.5">
      <span className="sr-only">{t("language.label")}</span>
      {OPTIONS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
            locale === code
              ? "bg-(--accent-teal) text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          aria-pressed={locale === code}
        >
          {code === "vi" ? t("language.vi") : t("language.en")}
        </button>
      ))}
    </div>
  );
}
