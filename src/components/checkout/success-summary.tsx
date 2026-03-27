"use client";

import { useState } from "react";
import Link from "next/link";

import { formatCurrency } from "@/lib/utils";

type Props = {
  orderCode: string;
  total: number;
  customerName: string;
  createdAt: string;
};

export function SuccessSummary({
  orderCode,
  total,
  customerName,
  createdAt,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(orderCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-green-800">Order successful</h1>
      <p className="mt-2 text-sm text-green-700">
        Your order has been created and saved.
      </p>
      <div className="mt-4 space-y-1 text-sm text-gray-700">
        <p className="flex items-center gap-2">
          <span className="font-semibold">Order code:</span>
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">{orderCode}</code>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </p>
        <p>
          <span className="font-semibold">Customer:</span> {customerName}
        </p>
        <p>
          <span className="font-semibold">Created at:</span> {createdAt}
        </p>
        <p>
          <span className="font-semibold">Total:</span> {formatCurrency(total)}
        </p>
      </div>
      <div className="mt-4 rounded-md border border-green-200 bg-white p-3 text-xs text-gray-600">
        Estimated response time: under 2 minutes. Need support? Contact
        support@cardshop.demo
      </div>
      <Link href="/" className="mt-5 inline-block text-sm font-semibold text-indigo-600">
        Continue shopping
      </Link>
    </div>
  );
}
