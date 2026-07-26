'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ImageOff, ShoppingCart, Plus, Minus, Heart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getProductMeta } from '@/lib/productMeta';

const badgeStyles = {
  Bestseller: 'bg-[var(--gold)] text-white',
  New: 'bg-[var(--accent)] text-white',
  Trending: 'bg-[var(--danger)] text-white',
};

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const cartItem = cart.find((item) => item.id === product.id);
  const meta = getProductMeta(product.id, product.price);

  return (
    <div className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden hover:shadow-xl hover:shadow-[var(--primary)]/10 hover:-translate-y-1 transition-all duration-300 group relative">
      {meta.badge && (
        <span className={`absolute top-3 left-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeStyles[meta.badge]}`}>
          {meta.badge}
        </span>
      )}
      <button
        onClick={() => setWishlisted(!wishlisted)}
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer"
      >
        <Heart size={15} className={wishlisted ? 'fill-[var(--danger)] text-[var(--danger)]' : 'text-[var(--muted)]'} />
      </button>

      <Link href={`/product/${product.id}`} className="cursor-pointer">
        <div className="aspect-square bg-[var(--cloud)] flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ImageOff size={36} className="text-[var(--muted)]/30" />
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.categories?.name && (
          <p className="text-[11px] text-[var(--accent)] font-semibold uppercase tracking-wide">
            {product.categories.name}
          </p>
        )}
        <Link href={`/product/${product.id}`} className="cursor-pointer">
          <h3 className="text-sm font-semibold text-[var(--ink)] truncate mt-1 hover:text-[var(--accent)] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex items-center gap-0.5 bg-[var(--success)] text-white text-[11px] font-semibold px-1.5 py-0.5 rounded">
            {meta.rating} <Star size={10} className="fill-white" />
          </div>
          <span className="text-[11px] text-[var(--muted)]">({meta.reviewCount})</span>
        </div>

        <div className="mt-2.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--ink)] text-lg">₹{product.price}</span>
            {meta.mrp && (
              <>
                <span className="text-xs text-[var(--muted)] line-through">₹{meta.mrp}</span>
                <span className="text-xs text-[var(--success)] font-semibold">{meta.discountPercent}% off</span>
              </>
            )}
          </div>
          <span className={`text-xs font-medium ${product.stock > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {product.stock > 0 ? `${product.stock} left in stock` : 'Out of stock'}
          </span>
        </div>

        {cartItem ? (
          <div className="w-full mt-3 flex items-center justify-between bg-[var(--primary)] rounded-xl overflow-hidden">
            <button
              onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
              className="text-white px-3.5 py-2 hover:bg-[var(--primary-dark)] transition-colors cursor-pointer"
            >
              <Minus size={15} />
            </button>
            <span className="text-white font-semibold text-sm">{cartItem.quantity}</span>
            <button
              onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
              disabled={cartItem.quantity >= product.stock}
              className="text-white px-3.5 py-2 hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Plus size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="w-full mt-3 flex items-center justify-center gap-1.5 bg-[var(--accent)] text-white text-sm font-semibold py-2 rounded-xl hover:bg-[var(--primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ShoppingCart size={15} />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}