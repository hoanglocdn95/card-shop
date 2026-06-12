export const CUSTOMER_TIERS = ["guest", "friend", "vip"] as const;

export type CustomerTier = (typeof CUSTOMER_TIERS)[number];

export const CUSTOMER_TIER_STORAGE_KEY = "card-shop-customer-tier";

export const DEFAULT_CUSTOMER_TIER: CustomerTier = "guest";

export function isCustomerTier(value: string | null | undefined): value is CustomerTier {
  return value === "guest" || value === "friend" || value === "vip";
}

export function getClientCustomerTier(): CustomerTier {
  if (typeof window === "undefined") return DEFAULT_CUSTOMER_TIER;
  const stored = window.localStorage.getItem(CUSTOMER_TIER_STORAGE_KEY);
  return isCustomerTier(stored) ? stored : DEFAULT_CUSTOMER_TIER;
}

export function setClientCustomerTier(tier: CustomerTier) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOMER_TIER_STORAGE_KEY, tier);
}
