'use client';
import { useEffect, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import api from '@/lib/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
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

  if (loading) return <p className="text-center py-16 text-gray-500">Loading orders...</p>;

  if (orders.length === 0)
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <PackageSearch size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>
            <div className="space-y-1">
              {order.order_items?.map((item) => (
                <p key={item.id} className="text-sm text-gray-600">
                  {item.products?.name} × {item.quantity}
                </p>
              ))}
            </div>
            <p className="text-right font-bold text-gray-900 mt-3">₹{order.total_amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}