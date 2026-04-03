import { z } from "zod";

export const orderItemSchema = z.object({
  productName: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  rarity: z.string().optional(),
});

export const orderSchema = z.object({
  facebookName: z.string().min(1, "Facebook name is required"),
  note: z.string().optional(),
  discountCode: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Cart must not be empty"),
});

export type OrderInput = z.infer<typeof orderSchema>;
