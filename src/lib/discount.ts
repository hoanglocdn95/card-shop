export type DiscountResult =
  | { type: "none"; value: 0 }
  | { type: "percent"; value: number }
  | { type: "fixed"; value: number };

// Heuristic parsing for demo:
// - "10%" or "15%" => percent
// - "VIP10" => percent 10
// - "OFF50000" => fixed 50000 VND
export function parseDiscountCode(code?: string): DiscountResult {
  const normalized = (code ?? "").trim().toUpperCase();
  if (!normalized) return { type: "none", value: 0 };

  const percentMatch = normalized.match(/^(\d{1,3})%$/);
  if (percentMatch) {
    const value = Number(percentMatch[1]);
    if (Number.isFinite(value) && value > 0) return { type: "percent", value };
  }

  const vipMatch = normalized.match(/^VIP(\d{1,3})$/);
  if (vipMatch) {
    const value = Number(vipMatch[1]);
    if (Number.isFinite(value) && value > 0) return { type: "percent", value };
  }

  const offMatch = normalized.match(/^OFF(\d{1,9})$/);
  if (offMatch) {
    const value = Number(offMatch[1]);
    if (Number.isFinite(value) && value > 0) return { type: "fixed", value };
  }

  return { type: "none", value: 0 };
}

