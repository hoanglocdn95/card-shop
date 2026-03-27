"use client";

import { useMutation } from "@tanstack/react-query";

import { OrderPayload, OrderResponse } from "@/types/order";

async function submitOrder(payload: OrderPayload): Promise<OrderResponse> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as OrderResponse & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? "Unable to create order");
  }

  return data;
}

export function useCheckout() {
  return useMutation({
    mutationFn: submitOrder,
  });
}
