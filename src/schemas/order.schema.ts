import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  sku: z.string().min(1),
  name: z.string().min(1),
  image: z.string().url(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  lineTotal: z.number().positive(),
});

export const orderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  note: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Cart must not be empty"),
});

export type OrderInput = z.infer<typeof orderSchema>;
