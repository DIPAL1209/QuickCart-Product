'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, CheckCircle2, X } from 'lucide-react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null); // { name } | null

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);



  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setToast({ name: product.name }); // trigger popup
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const itemCount = cart.length;

  return (
  <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}

      {/* Swiggy/Zomato-style Added to Cart toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-sm">
          <div className="bg-[var(--ink,#16241C)] text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-[slideUp_0.25s_ease-out]">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{toast.name}</p>
              <p className="text-xs text-white/60">Added to cart</p>
            </div>
          <Link
  href="/cart"
  onClick={() => setToast(null)}
  className="shrink-0 bg-white text-[var(--ink,#16241C)] text-xs font-bold px-3 py-2 rounded-xl hover:bg-white/90 transition"
>
  View Cart
</Link>
            <button onClick={() => setToast(null)} className="shrink-0 text-white/50 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <style jsx>{`
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);