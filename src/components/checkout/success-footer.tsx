"use client";

import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";

export function SuccessFooter() {
  const { t } = useI18n();

  return (
    <>
      <p className="mt-3 text-xs text-gray-500">{t("success.sheetDelayNote")}</p>
      <Link href="/" className="mt-1 inline-block text-xs text-(--primary)">
        {t("success.backToShop")}
      </Link>
    </>
  );
}
