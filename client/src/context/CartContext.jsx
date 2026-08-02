import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "krajcara_cart";

function loadFromSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadFromSession);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addToCart(part) {
    setItems((prev) => {
      if (prev.some((p) => p.id === part.id)) return prev;
      return [
        ...prev,
        {
          id: part.id,
          name: part.name,
          internal_code: part.internal_code,
          price: part.price,
          currency: part.currency,
          image_path: part.image_path,
          vehicles: (part.vehicles || []).map((v) => ({ make: v.make, model: v.model })),
        },
      ];
    });
  }

  function removeFromCart(id) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function isInCart(id) {
    return items.some((p) => p.id === id);
  }

  function toggleCart(part) {
    if (isInCart(part.id)) {
      removeFromCart(part.id);
    } else {
      addToCart(part);
    }
  }

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, isInCart, toggleCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
