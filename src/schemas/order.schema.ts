import { z } from "zod";

import { CUSTOMER_TIERS } from "@/lib/customer-tier";

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  cardCode: z.string().min(1),
  game: z.enum(["one-piece", "riftbound"]),
  quantity: z.number().int().positive(),
  rarity: z.string().optional(),
  source: z.enum(["inventory", "tcg"]),
});

export const orderSchema = z.object({
  facebookName: z.string().min(1, "Facebook name is required"),
  customerTier: z.enum(CUSTOMER_TIERS).optional().default("guest"),
  note: z.string().optional(),
  discountCode: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Cart must not be empty"),
});

export type OrderInput = z.infer<typeof orderSchema>;
