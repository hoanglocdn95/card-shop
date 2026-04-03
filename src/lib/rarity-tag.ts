/**
 * Maps Pokémon TCG-style rarity strings to tag styles (common → … → rare holo gx).
 * Order: most specific patterns first.
 */
export function getRarityTagClassName(rarity: string): string {
  const n = rarity.toLowerCase().trim();
  if (!n) return DEFAULT_CLASS;

  const hasHolo = n.includes("holo") || n.includes("holographic");
  const hasGx = n.includes("gx");

  if (hasHolo && hasGx) {
    return "border border-purple-400/60 bg-linear-to-r from-purple-700 via-amber-500 to-purple-600 text-white shadow-sm";
  }
  if (hasHolo) {
    return "border border-orange-200/80 bg-linear-to-r from-rose-200 via-orange-200 to-amber-100 text-amber-950 shadow-sm";
  }
  if (n.includes("uncommon")) {
    return "border border-slate-300 bg-linear-to-b from-slate-200 to-slate-300 text-slate-900 shadow-sm";
  }
  if (n === "common" || (n.includes("common") && !n.includes("uncommon"))) {
    return "border border-gray-800 bg-gray-900 text-white shadow-sm";
  }
  if (n.includes("rare")) {
    return "border border-amber-500/70 bg-linear-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 shadow-sm";
  }

  return DEFAULT_CLASS;
}

const DEFAULT_CLASS =
  "border border-gray-200 bg-gray-100 text-gray-800 shadow-sm";
