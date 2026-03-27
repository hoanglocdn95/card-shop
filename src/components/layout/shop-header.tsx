"use client";

import { Input } from "@/components/common/input";

type Props = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export function ShopHeader({ searchValue, onSearchChange }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex items-center gap-6">
          <p className="text-lg font-black tracking-tight text-indigo-700">
            HAROKU
          </p>
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
        <div className="mx-auto w-full max-w-7xl px-4 py-3 lg:px-8">
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search products..."
            className="mx-auto h-10 max-w-xl rounded-full bg-white px-5"
          />
        </div>
      </div>
    </header>
  );
}
