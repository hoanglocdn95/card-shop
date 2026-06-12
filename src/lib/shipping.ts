import {
  CustomerTier,
  DEFAULT_CUSTOMER_TIER,
} from "@/lib/customer-tier";

export const DEFAULT_SHIPPING_FEE_VND = 36000;

export type ShippingTiers = Record<CustomerTier, number>;

export const DEFAULT_SHIPPING_TIERS: ShippingTiers = {
  guest: DEFAULT_SHIPPING_FEE_VND,
  friend: 30000,
  vip: 15000,
};

export function parseShippingFee(
  value: unknown,
  fallback = DEFAULT_SHIPPING_FEE_VND,
) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
}

export function resolveShippingFeeForTier(
  tiers: Partial<ShippingTiers> | undefined,
  tier: CustomerTier,
  fallback = DEFAULT_SHIPPING_FEE_VND,
) {
  const merged: ShippingTiers = {
    ...DEFAULT_SHIPPING_TIERS,
    ...tiers,
  };
  return parseShippingFee(merged[tier], fallback);
}

export function getDefaultShippingFeeForTier(
  tier: CustomerTier = DEFAULT_CUSTOMER_TIER,
) {
  return resolveShippingFeeForTier(undefined, tier);
}
