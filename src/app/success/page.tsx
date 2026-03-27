import Link from "next/link";

import { SuccessSummary } from "@/components/checkout/success-summary";

type SuccessProps = {
  searchParams: Promise<{
    orderCode?: string;
    total?: string;
    customerName?: string;
    createdAt?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessProps) {
  const params = await searchParams;
  const total = Number(params.total ?? 0);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <SuccessSummary
        orderCode={params.orderCode ?? "-"}
        total={total}
        customerName={params.customerName ?? "-"}
        createdAt={params.createdAt ?? "-"}
      />
      <p className="mt-3 text-xs text-gray-500">
        If the order does not appear in Sheets within 2 minutes, contact support.
      </p>
      <Link href="/" className="mt-1 inline-block text-xs text-indigo-600">
        Back to product list
      </Link>
    </main>
  );
}
