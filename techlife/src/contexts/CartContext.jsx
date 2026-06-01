import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  function addItem(product, qty = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        toast.success("Quantité mise à jour !");
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      }
      toast.success("Ajouté au panier !");
      return [...prev, { ...product, qty }];
    });
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Produit retiré");
  }

  function updateQty(id, qty) {
    if (qty < 1) return removeItem(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }

  function clearCart() { setItems([]); }

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + (i.price * i.qty), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}
