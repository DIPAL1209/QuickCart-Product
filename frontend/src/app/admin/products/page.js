'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, ImageOff } from 'lucide-react';
import api from '@/lib/api';

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-emerald-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProducts = () => {
    api.get('/products/admin/all').then((res) => setProducts(res.data.products)).finally(() => setLoading(false));
    // ^ agar tumhara admin list endpoint alag naam ka hai (jo is_active=false wale bhi dikhata ho), wahi use karo
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggle = async (product) => {
    setTogglingId(product.id);
    setErrorMsg('');
    try {
      await api.patch(`/products/admin/${product.id}/toggle-status`);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not update product status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {errorMsg && (
        <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Visible in Store</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className={!p.is_active ? 'opacity-50' : ''}>
                  <td className="px-5 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <ImageOff size={16} className="text-gray-300" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{p.name}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{p.categories?.name || '—'}</td>
                  <td className="px-5 py-3 text-gray-900 font-medium">₹{p.price}</td>
                  <td className="px-5 py-3">
                    <span className={p.stock > 0 ? 'text-emerald-600' : 'text-red-500'}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-3">
                    <ToggleSwitch
                      checked={p.is_active}
                      disabled={togglingId === p.id}
                      onChange={() => handleToggle(p)}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-blue-600 hover:text-blue-700 cursor-pointer">
                        <Pencil size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-center text-gray-400 py-10">No products yet.</p>}
        </div>
      )}
    </div>
  );
}