'use client';
import { useEffect, useState } from 'react';
import { IndianRupee, ShoppingCart, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then((res) => setAnalytics(res.data.analytics));
  }, []);

  if (!analytics) return <p className="text-gray-500">Loading analytics...</p>;

  const cards = [
    { label: 'Total Sales', value: `₹${analytics.totalSales.toFixed(2)}`, icon: IndianRupee, color: 'bg-blue-50 text-blue-600' },
    { label: 'Paid Orders', value: analytics.totalOrders, icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Top Products', value: analytics.topProducts.length, icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-3">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
        {analytics.topProducts.length === 0 ? (
          <p className="text-gray-400 text-sm">No sales yet.</p>
        ) : (
          <div className="space-y-3">
            {analytics.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{p.name}</span>
                <span className="text-sm font-semibold text-blue-600">{p.totalSold} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}