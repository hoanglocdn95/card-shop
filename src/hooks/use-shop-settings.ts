"use client";

import { useQuery } from "@tanstack/react-query";

import { ShippingTiers } from "@/lib/shipping";

export type ShopSettings = {
  defaultShippingFee: number;
  shippingTiers: Partial<ShippingTiers>;
  source: "apps_script" | "fallback";
};

async function fetchShopSettings(): Promise<ShopSettings> {
  const response = await fetch("/api/settings");
  if (!response.ok) {
    throw new Error("Unable to load shop settings");
  }
  return response.json();
}

export function useShopSettings() {
  return useQuery({
    queryKey: ["shop-settings"],
    queryFn: fetchShopSettings,
    staleTime: 5 * 60 * 1000,
  });
}
