import { createContext, useContext, useState, useEffect, useCallback } from "react";

const QuoteContext = createContext();

export function QuoteProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("energica_quote");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("energica_quote", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
      return;
    }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);

  return (
    <QuoteContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount, isDrawerOpen, setIsDrawerOpen }}>
      {children}
    </QuoteContext.Provider>
  );
}

export const useQuote = () => useContext(QuoteContext);
