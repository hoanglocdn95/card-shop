import { getCatalogFromTcgplayerCsv } from "@/lib/catalog-csv";
import type { ProductGame } from "@/types/product";

export function getCatalogForGame(game: ProductGame) {
  if (game === "one-piece" || game === "riftbound") {
    const fromCsv = getCatalogFromTcgplayerCsv(game);
    if (fromCsv.length > 0) {
      return fromCsv;
    }
  }
  return [];
}
