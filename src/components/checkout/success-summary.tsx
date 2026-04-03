"use client";

import { useState } from "react";
import Link from "next/link";

import { formatCurrency } from "@/lib/utils";

type Props = {
  orderCode: string;
  total: number;
  facebookName: string;
  createdAt: string;
};

export function SuccessSummary({
  orderCode,
  total,
  facebookName,
  createdAt,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(orderCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-[#d8f3f3] bg-[#effbfb] p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-[#046969]">Order successful</h1>
      <p className="mt-2 text-sm text-[#046969]">
        Your order has been created and saved.
      </p>
      <div className="mt-4 space-y-1 text-sm text-gray-700">
        <p className="flex items-center gap-2">
          <span className="font-semibold">Order code:</span>
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">{orderCode}</code>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs font-semibold text-(--primary) hover:text-(--primary-hover)"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </p>
        <p>
          <span className="font-semibold">Facebook:</span> {facebookName}
        </p>
        <p>
          <span className="font-semibold">Created at:</span> {createdAt}
        </p>
        <p>
          <span className="font-semibold">Total:</span> {formatCurrency(total)}
        </p>
      </div>
      <div className="mt-4 rounded-md border border-[#f7d96b] bg-[#fff9dd] p-3 text-xs text-[#7a6622]">
        Estimated response time: under 2 minutes. Need support? Contact
        support@cardshop.demo
      </div>
      <Link
        href="/"
        className="mt-5 inline-block text-sm font-semibold text-(--primary)"
      >
        Continue shopping
      </Link>
    </div>
  );
}
