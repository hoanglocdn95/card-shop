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
import { Product, ProductListingSource } from "@/types/product";

function lineSourceOf(product: Product): ProductListingSource {
  return product.listingSource ?? "inventory";
}

function isSameCartLine(
  item: CartItem,
  productId: string,
  source: ProductListingSource,
) {
  return item.productId === productId && item.source === source;
}

type CartContextValue = {
  items: CartItem[];
  subtotal: number;
  isReady: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string, source: ProductListingSource) => void;
  updateQuantity: (
    productId: string,
    source: ProductListingSource,
    quantity: number,
  ) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "card-shop-cart";
const CartContext = createContext<CartContextValue | null>(null);

function toCartItem(product: Product): CartItem {
  return {
    productId: product.id,
    game: product.game,
    cardCode: product.cardCode,
    sku: product.sku,
    name: product.name,
    displayName: product.displayName,
    image: product.image,
    price: product.price,
    quantity: 1,
    lineTotal: product.price,
    rarity: product.rarity,
    source: lineSourceOf(product),
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
      const normalized: CartItem[] = parsed.map((item) => ({
        ...item,
        game: item.game === "riftbound" ? "riftbound" : "one-piece",
        cardCode: item.cardCode ?? item.sku ?? item.productId,
        displayName: item.displayName ?? item.name,
        source: item.source === "tcg" ? "tcg" : "inventory",
      }));
      setItems(normalized);
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
      const source = lineSourceOf(product);
      setItems((prev) => {
        const existing = prev.find((item) =>
          isSameCartLine(item, product.id, source),
        );
        if (!existing) {
          return [...prev, toCartItem(product)];
        }

        return prev.map((item) =>
          isSameCartLine(item, product.id, source)
            ? {
                ...item,
                quantity: item.quantity + 1,
                lineTotal: (item.quantity + 1) * item.price,
              }
            : item,
        );
      });
    };

    const removeItem = (productId: string, source: ProductListingSource) => {
      setItems((prev) =>
        prev.filter((item) => !isSameCartLine(item, productId, source)),
      );
    };

    const updateQuantity = (
      productId: string,
      source: ProductListingSource,
      quantity: number,
    ) => {
      setItems((prev) =>
        prev
          .map((item) =>
            isSameCartLine(item, productId, source)
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
