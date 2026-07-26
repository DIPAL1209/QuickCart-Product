"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ImageOff, ShoppingCart, Star, ShieldCheck, Truck, RotateCcw, Heart, Plus, Minus } from 'lucide-react';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { getProductMeta } from '@/lib/productMeta';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const { cart, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 grid sm:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-white rounded-2xl border border-[var(--line)]" />
        <div className="space-y-3">
          <div className="h-4 bg-white rounded w-1/4" />
          <div className="h-8 bg-white rounded w-3/4" />
          <div className="h-6 bg-white rounded w-1/3" />
        </div>
      </div>
    );
  }

  const meta = getProductMeta(product.id, product.price);
  const cartItem = cart.find((item) => item.id === product.id);

  return (
    <div className="bg-[var(--cloud)] min-h-[85vh] py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">
          <div className="relative">
            <div className="aspect-square bg-white rounded-2xl border border-[var(--line)] flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <ImageOff size={56} className="text-[var(--muted)]/30" />
              )}
            </div>
            <button
              onClick={() => setWishlisted(!wishlisted)}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
            >
              <Heart size={18} className={wishlisted ? 'fill-[var(--danger)] text-[var(--danger)]' : 'text-[var(--muted)]'} />
            </button>
          </div>

          <div>
            {product.categories?.name && (
              <p className="text-sm text-[var(--accent)] font-semibold uppercase tracking-wide">
                {product.categories.name}
              </p>
            )}
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] mt-1.5">{product.name}</h1>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 bg-[var(--success)] text-white text-xs font-semibold px-2 py-1 rounded">
                {meta.rating} <Star size={11} className="fill-white" />
              </div>
              <span className="text-sm text-[var(--muted)]">{meta.reviewCount} ratings</span>
            </div>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <span className="font-display text-3xl font-bold text-[var(--ink)]">₹{product.price}</span>
              {meta.mrp && (
                <>
                  <span className="text-base text-[var(--muted)] line-through">₹{meta.mrp}</span>
                  <span className="text-sm text-[var(--success)] font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    {meta.discountPercent}% off
                  </span>
                </>
              )}
            </div>

            <p className="text-[var(--ink)]/80 mt-5 text-sm leading-relaxed">{product.description}</p>

            <p className={`mt-4 text-sm font-medium ${product.stock > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {product.stock > 0 ? `${product.stock} in stock — ready to ship` : 'Out of stock'}
            </p>

            {/* Ab yahan bhi wahi cart-aware pattern jo ProductCard mein hai */}
            <div className="mt-6">
              {cartItem ? (
                <div className="w-full flex items-center justify-between bg-[var(--primary)] rounded-xl overflow-hidden max-w-xs">
                  <button
                    onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                    className="text-white px-5 py-3 hover:bg-[var(--primary-dark)] transition-colors cursor-pointer"
                  >
                    <Minus size={17} />
                  </button>
                  <span className="text-white font-semibold text-base">{cartItem.quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                    disabled={cartItem.quantity >= product.stock}
                    className="text-white px-5 py-3 hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Plus size={17} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product, 1)}
                  disabled={product.stock === 0}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[var(--primary)] transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-[var(--line)]">
              <div className="flex flex-col items-center text-center gap-1.5">
                <Truck size={18} className="text-[var(--primary)]" />
                <span className="text-[11px] text-[var(--muted)]">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <RotateCcw size={18} className="text-[var(--primary)]" />
                <span className="text-[11px] text-[var(--muted)]">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <ShieldCheck size={18} className="text-[var(--primary)]" />
                <span className="text-[11px] text-[var(--muted)]">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}