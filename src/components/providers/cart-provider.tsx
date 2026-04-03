"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { calculateSubtotal } from "@/lib/order";
import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";

type CartContextValue = {
  items: CartItem[];
  subtotal: number;
  isReady: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "card-shop-cart";
const CartContext = createContext<CartContextValue | null>(null);

function toCartItem(product: Product): CartItem {
  return {
    productId: product.id,
    sku: product.sku,
    name: product.name,
    image: product.image,
    price: product.price,
    quantity: 1,
    lineTotal: product.price,
    rarity: product.rarity,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setIsReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      setItems(parsed);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [isReady, items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (product: Product) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (!existing) {
          return [...prev, toCartItem(product)];
        }

        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                lineTotal: (item.quantity + 1) * item.price,
              }
            : item,
        );
      });
    };

    const removeItem = (productId: string) => {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
      setItems((prev) =>
        prev
          .map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity,
                  lineTotal: quantity * item.price,
                }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
    };

    const clearCart = () => setItems([]);
    const subtotal = calculateSubtotal(items);

    return {
      items,
      subtotal,
      isReady,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [isReady, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider");
  }
  return context;
}
