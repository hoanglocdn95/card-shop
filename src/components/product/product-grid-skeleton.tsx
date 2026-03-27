type Props = {
  count?: number;
};

export function ProductGridSkeleton({ count = 8 }: Props) {
  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
        >
          <div className="aspect-[3/4] rounded-md bg-gray-200" />
          <div className="mt-3 h-4 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
          <div className="mt-3 h-9 rounded bg-gray-200" />
        </div>
      ))}
    </section>
  );
}
