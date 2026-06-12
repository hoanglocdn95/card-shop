import type { ProductGame } from "@/types/product";

export function extractTcgplayerProductId(
  tcgPlayerUrl?: string | null,
): string | null {
  if (!tcgPlayerUrl?.trim()) return null;
  const match = tcgPlayerUrl.match(/\/product\/(\d+)/i);
  return match?.[1] ?? null;
}

/** Stable catalog id — one row per TCGplayer listing. */
export function buildStableProductId({
  game,
  tcgPlayerUrl,
  legacyId,
  cardCode,
  tcgplayerProductId,
}: {
  game: ProductGame | string;
  tcgPlayerUrl?: string | null;
  legacyId?: string | null;
  cardCode?: string | null;
  tcgplayerProductId?: string | number | null;
}): string {
  const fromColumn =
    tcgplayerProductId != null && String(tcgplayerProductId).trim() !== ""
      ? String(tcgplayerProductId).trim()
      : null;
  const fromUrl = extractTcgplayerProductId(tcgPlayerUrl);
  const tcgId = fromColumn ?? fromUrl;
  if (tcgId) return `${game}-${tcgId}`;

  const legacy = legacyId?.trim();
  if (legacy) return legacy;

  const code = (cardCode ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return code ? `${game}-${code}` : `${game}-unknown`;
}

export function normalizeProductIdentity<
  T extends {
    id: string;
    game: ProductGame;
    cardCode: string;
    tcgPlayerUrl?: string;
  },
>(product: T): T {
  return {
    ...product,
    id: buildStableProductId({
      game: product.game,
      tcgPlayerUrl: product.tcgPlayerUrl,
      legacyId: product.id,
      cardCode: product.cardCode,
    }),
  };
}
