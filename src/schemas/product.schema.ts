import { z } from "zod";

export const productSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(1),
  name: z.string().min(1),
  image: z.string().url(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative().optional(),
  rarity: z.string().optional(),
  cardType: z.string().optional(),
  set: z.string().optional(),
  subtypes: z.array(z.string()).optional(),
  tcgPlayerUrl: z.string().url().optional(),
});

export const productsResponseSchema = z.object({
  products: z.array(productSchema),
});
