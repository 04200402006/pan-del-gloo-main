import { useState, useEffect, useCallback, useRef } from "react";
import { CartItem, Product } from "@/types/product";

const CART_STORAGE_KEY = "bakery-cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const isFirstRender = useRef(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage — skip the first render to avoid overwriting
  // the stored cart before the load effect can restore it
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const generateWhatsAppMessage = useCallback(() => {
    if (items.length === 0) return "";

    let message = "🥖 *Nuevo Pedido de Panadería*\n\n";
    message += "📋 *Detalle del pedido:*\n";
    message += "─────────────────\n";

    items.forEach((item) => {
      message += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += "─────────────────\n";
    message += `💰 *Total: $${totalPrice.toFixed(2)} MXN*\n\n`;
    message += "¡Gracias por su preferencia! 🙏";

    return encodeURIComponent(message);
  }, [items, totalPrice]);

  const sendToWhatsApp = useCallback((phoneNumber: string) => {
    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, "_blank");
  }, [generateWhatsAppMessage]);

  return {
    items,
    isOpen,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    sendToWhatsApp,
  };
}
