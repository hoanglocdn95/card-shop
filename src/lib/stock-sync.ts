import { getServerEnv } from "@/lib/env";

let cachedStockMap: { map: Record<string, number>; fetchedAt: number } | null = null;

type AppsScriptStockResponse = {
  success?: boolean;
  stocks?: Array<{ key: string; stock: number }>;
};

export async function getStockMapFromKho(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cachedStockMap && now - cachedStockMap.fetchedAt < 2 * 60 * 1000) {
    return cachedStockMap.map;
  }

  const env = getServerEnv();
  const webAppUrl = env.APPS_SCRIPT_WEB_APP_URL;
  const token = env.APPS_SCRIPT_TOKEN;
  if (!webAppUrl || !token) {
    return {};
  }

  const params = new URLSearchParams({
    action: "listInventory",
    token,
  });

  try {
    const response = await fetch(`${webAppUrl}?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) return {};
    const data = (await response.json()) as AppsScriptStockResponse;
    if (!data.success || !Array.isArray(data.stocks)) return {};

    const map = data.stocks.reduce<Record<string, number>>((acc, item) => {
      const key = String(item.key || "").trim().toUpperCase();
      if (!key) return acc;
      const stock = Number(item.stock);
      acc[key] = Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0;
      return acc;
    }, {});

    cachedStockMap = { map, fetchedAt: now };
    return map;
  } catch {
    return {};
  }
}

