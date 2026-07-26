'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PackageSearch, ImageOff } from 'lucide-react';
import api from '@/lib/api';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-16 text-[var(--muted)]">Loading orders...</p>;

  if (orders.length === 0)
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center bg-[var(--cloud)]">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-5">
          <PackageSearch size={32} className="text-[var(--muted)]/40" />
        </div>
        <p className="text-[var(--ink)] font-medium mb-1">No orders yet</p>
        <p className="text-[var(--muted)] text-sm mb-5">Your placed orders will show up here.</p>
        <Link href="/" className="text-[var(--accent)] font-semibold text-sm cursor-pointer">
          Start shopping →
        </Link>
      </div>
    );

  return (
    <div className="bg-[var(--cloud)] min-h-[85vh] py-8 sm:py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="font-display text-2xl font-bold mb-6 text-[var(--ink)]">My Orders</h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-[var(--muted)]">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-2 border-t border-[var(--line)] pt-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--cloud)] rounded-lg flex items-center justify-center shrink-0">
                      {item.products?.image_url ? (
                        <img src={item.products.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <ImageOff size={14} className="text-[var(--muted)]/40" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--ink)]/80 flex-1">{item.products?.name} × {item.quantity}</p>
                  </div>
                ))}
              </div>
              <p className="text-right font-bold text-[var(--ink)] mt-3 pt-3 border-t border-[var(--line)]">
                Total: ₹{order.total_amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}