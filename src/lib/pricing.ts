let cachedUsdVndRate: { rate: number; fetchedAtMs: number } | null = null;

function roundUpToNearestThousand(value: number) {
  return Math.ceil(value / 1000) * 1000;
}

async function fetchUsdVndRate() {
  // Public exchange-rate endpoint. If it fails, fallback to a safe default.
  const resp = await fetch("https://open.er-api.com/v6/latest/USD", {
    method: "GET",
    cache: "no-store",
  });
  if (!resp.ok) {
    throw new Error(`Unable to fetch USD/VND rate: HTTP ${resp.status}`);
  }

  const data = (await resp.json()) as { rates?: Record<string, number> };
  const rate = data.rates?.VND;
  if (!rate || !Number.isFinite(rate)) {
    throw new Error("USD/VND rate missing in response");
  }
  return rate;
}

export async function getUsdVndRateGoogleLike() {
  const now = Date.now();
  // Cache 30 minutes to reduce external calls.
  if (cachedUsdVndRate && now - cachedUsdVndRate.fetchedAtMs < 30 * 60 * 1000) {
    return cachedUsdVndRate.rate;
  }

  try {
    const rate = await fetchUsdVndRate();
    cachedUsdVndRate = { rate, fetchedAtMs: now };
    return rate;
  } catch {
    // Fallback keeps demo functional even if exchange API is down.
    const fallback = 25000;
    cachedUsdVndRate = { rate: fallback, fetchedAtMs: now };
    return fallback;
  }
}

export function computeVndFromUsd({
  usd,
  usdVndRate,
  multiplier = 1.1,
}: {
  usd: number;
  usdVndRate: number;
  multiplier?: number;
}) {
  const raw = usdVndRate * multiplier * usd;
  return roundUpToNearestThousand(raw);
}

export function roundUpToNearestThousandPublic(value: number) {
  return roundUpToNearestThousand(value);
}

