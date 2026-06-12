"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { ContactModal } from "@/components/layout/contact-modal";
import { Input } from "@/components/common/input";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";
import { ProductGame } from "@/types/product";

type Props = {
  game: ProductGame;
  onGameChange: (value: ProductGame) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
};

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function ShopHeader({
  game,
  onGameChange,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: Props) {
  const [contactOpen, setContactOpen] = useState(false);
  const { t } = useI18n();

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit();
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-none items-center justify-between gap-3 px-4 py-2 sm:px-5 lg:px-8 2xl:px-10">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-(--accent-teal) focus-visible:ring-offset-2"
            >
              <Image
                src="/logo.png"
                alt="HAROKU"
                width={40}
                height={40}
                className="size-9 shrink-0 rounded-lg object-contain"
                priority
              />
              <span className="text-lg font-black tracking-tight text-(--primary)">
                HAROKU
              </span>
            </Link>

            <select
              value={game}
              onChange={(event) => onGameChange(event.target.value as ProductGame)}
              className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm outline-none focus:border-(--accent-teal) focus:ring-2 focus:ring-[#d8f3f3]"
              aria-label={t("header.selectGame")}
            >
              <option value="one-piece">One Piece</option>
              <option value="riftbound">Riftbound</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              className="text-sm font-semibold text-(--accent-teal) hover:text-[#057a7a]"
              onClick={() => setContactOpen(true)}
            >
              {t("header.contact")}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50/80">
          <div className="mx-auto w-full max-w-none px-4 py-3 sm:px-5 lg:px-8 2xl:px-10">
            <form
              onSubmit={handleSearchSubmit}
              className="mx-auto flex w-full max-w-3xl items-stretch gap-2"
            >
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </span>
                <Input
                  value={searchValue}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder={t("header.searchPlaceholder")}
                  className="h-10 w-full rounded-full bg-white pr-4 pl-10 focus:border-(--primary) focus:ring-[#ffe4d6]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-(--primary) px-4 text-sm font-semibold text-white transition-colors hover:bg-(--primary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-teal) focus-visible:ring-offset-2"
                aria-label={t("header.searchButton")}
              >
                <SearchIcon />
                <span className="hidden sm:inline">{t("header.searchButton")}</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
