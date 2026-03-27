export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-500">
      {label}
    </div>
  );
}
