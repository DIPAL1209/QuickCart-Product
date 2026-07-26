'use client';
import Link from 'next/link';
import { ImageOff, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center bg-[var(--cloud)]">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-5">
          <ShoppingBag size={32} className="text-[var(--muted)]/40" />
        </div>
        <p className="text-[var(--ink)] font-medium mb-1">Your cart is empty</p>
        <p className="text-[var(--muted)] text-sm mb-5">Looks like you haven't added anything yet.</p>
        <Link
          href="/"
          className="flex items-center gap-1.5 bg-[var(--accent)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary)] transition-colors cursor-pointer"
        >
          Continue shopping <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[var(--cloud)] min-h-[85vh] py-8 sm:py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="font-display text-2xl font-bold mb-6 text-[var(--ink)]">Your Cart ({cart.length})</h1>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-[var(--line)] shadow-sm">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--cloud)] rounded-xl flex items-center justify-center shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <ImageOff size={20} className="text-[var(--muted)]/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--ink)] truncate">{item.name}</p>
                <p className="text-sm text-[var(--muted)]">₹{item.price} each</p>
              </div>

              <div className="flex items-center gap-2 bg-[var(--cloud)] rounded-lg shrink-0">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-2 text-[var(--ink)] hover:text-[var(--accent)] cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-2 text-[var(--ink)] hover:text-[var(--accent)] cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>

              <span className="hidden sm:block text-sm font-bold text-[var(--ink)] w-16 text-right">
                ₹{(item.price * item.quantity).toFixed(0)}
              </span>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-[var(--danger)]/70 hover:text-[var(--danger)] transition-colors cursor-pointer shrink-0"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-[var(--line)] p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--muted)]">Order Total</p>
            <p className="text-xl font-bold text-[var(--ink)]">₹{total.toFixed(2)}</p>
          </div>
          <button
            onClick={handleCheckout}
            className="flex items-center gap-1.5 bg-[var(--accent)] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary)] transition-colors cursor-pointer"
          >
            Checkout <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}