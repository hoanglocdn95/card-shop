"use client";

import Image from "next/image";
import Link from "next/link";

import { Input } from "@/components/common/input";

type Props = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export function ShopHeader({ searchValue, onSearchChange }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-none items-center justify-between px-4 sm:px-5 lg:px-8 2xl:px-10">
        <div className="flex items-center gap-6">
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
          <nav className="hidden items-center gap-4 text-sm text-gray-600 md:flex">
            <a href="#" className="hover:text-gray-900">
              Collections
            </a>
            <a href="#" className="hover:text-gray-900">
              All products
            </a>
            <a href="#" className="hover:text-gray-900">
              Contact
            </a>
          </nav>
        </div>
        <div className="hidden text-xs text-gray-500 md:block">
          Welcome to HAROKU
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50/80">
        <div className="mx-auto w-full max-w-none px-4 py-3 sm:px-5 lg:px-8 2xl:px-10">
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search products..."
            className="mx-auto h-10 w-full max-w-3xl rounded-full bg-white px-5 focus:border-(--primary) focus:ring-[#ffe4d6]"
          />
        </div>
      </div>
    </header>
  );
}
