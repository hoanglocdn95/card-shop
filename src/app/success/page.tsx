import { SuccessFooter } from "@/components/checkout/success-footer";
import { SuccessSummary } from "@/components/checkout/success-summary";

type SuccessProps = {
  searchParams: Promise<{
    orderCode?: string;
    total?: string;
    facebookName?: string;
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
        facebookName={params.facebookName ?? "-"}
        createdAt={params.createdAt ?? "-"}
      />
      <SuccessFooter />
    </main>
  );
}
