'use client';
import Link from 'next/link';
import { ShoppingCart, Package, ShieldCheck, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
const itemCount = cart.length;

  return (
    <div className="sticky top-0 z-50">
      <div className="bg-[var(--primary-dark)] text-white/80 text-[11px] sm:text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 truncate">
            <Sparkles size={12} className="text-[var(--gold)] shrink-0" />
            <span className="truncate">Premium quality, honest prices</span>
          </span>
          {user && (
            <span className="hidden md:inline shrink-0 ml-2">
              Hi, <span className="font-medium text-white">{user.full_name}</span>
            </span>
          )}
        </div>
      </div>

      <nav className="bg-white border-b border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-6">
          <Link href="/" className="font-display text-xl sm:text-2xl font-extrabold text-[var(--primary)] tracking-tight cursor-pointer shrink-0">
            QuickCart
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="hidden sm:block text-[var(--ink)] hover:text-[var(--accent)] text-sm font-medium transition-colors cursor-pointer">
              Shop
            </Link>

            {user && (
              <Link href="/orders" className="flex items-center gap-1.5 text-[var(--ink)] hover:text-[var(--accent)] text-sm font-medium transition-colors cursor-pointer">
                <Package size={18} />
                <span className="hidden md:inline">My Orders</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link href="/admin" className="flex items-center gap-1.5 text-[var(--ink)] hover:text-[var(--accent)] text-sm font-medium transition-colors cursor-pointer">
                <ShieldCheck size={18} />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}

            <Link href="/cart" className="relative text-[var(--ink)] hover:text-[var(--accent)] transition-colors cursor-pointer">
              <ShoppingCart size={21} strokeWidth={1.8} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--danger)] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-medium bg-[var(--ink)] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-black transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold bg-[var(--accent)] text-white px-4 sm:px-5 py-2 rounded-lg hover:bg-[var(--primary)] transition-colors cursor-pointer shadow-sm shadow-blue-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}