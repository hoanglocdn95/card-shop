export function formatCurrency(value: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** VND text for Google Sheets cells (UI và sheet thống nhất). */
export function formatVndForSheet(value: number): string {
  return formatCurrency(value, "VND");
}

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
