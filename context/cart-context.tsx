import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

export type CartItem = {
  id: number;
  name: string;
  price: string;
  image?: string;
  variantId?: number | null;
  variantLabel?: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  clear: () => void;
  remove: (id: number, variantId?: number | null) => void;
  toastMessage: string | null;
  showToast: (message: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }
    toastTimeout.current = setTimeout(() => setToastMessage(null), 1800);
  };

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    setItems((prev) => {
      const existing = prev.find(
        (p) => p.id === item.id && (p.variantId ?? null) === (item.variantId ?? null)
      );
      if (existing) {
        return prev.map((p) =>
          p === existing ? { ...p, quantity: p.quantity + safeQuantity } : p
        );
      }
      return [...prev, { ...item, quantity: safeQuantity }];
    });
    showToast('Added to cart');
  };

  const clear = () => setItems([]);

  const remove = (id: number, variantId?: number | null) => {
    setItems((prev) =>
      prev.filter(
        (p) => !(p.id === id && (p.variantId ?? null) === (variantId ?? null))
      )
    );
  };

  const value = useMemo(
    () => ({
      items,
      addItem,
      clear,
      remove,
      toastMessage,
      showToast,
    }),
    [items, toastMessage]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
