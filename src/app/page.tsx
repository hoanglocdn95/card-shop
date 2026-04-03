import { Suspense } from "react";

import { ProductPage } from "@/components/product/product-page";

export default function Home() {
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<div className="text-sm text-gray-500">Loading shop...</div>}>
        <ProductPage />
      </Suspense>
    </main>
  );
}
