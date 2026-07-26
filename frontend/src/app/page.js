'use client';
import { useEffect, useState, useRef } from 'react';
import { Search, ChevronDown, Check, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import TrustStrip from '@/components/TrustStrip';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category_id = selectedCategory;
      const res = await api.get('/products', { params });
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/products/categories/all').then((res) => setCategories(res.data.categories));

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name || 'All Categories';

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-b from-[var(--primary)] to-[var(--primary-dark)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 pt-10 sm:pt-14 pb-12 sm:pb-16 text-center">
          <span className="inline-block bg-white/10 text-[var(--gold)] text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide">
            NEW SEASON ARRIVALS
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
            Everything You Need, One Click Away
          </h1>
          <p className="text-white/70 mt-4 text-base sm:text-lg max-w-lg mx-auto">
            Handpicked products, honest prices, delivered fast to your door.
          </p>
        </div>
      </div>

      <TrustStrip />

      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
        {/* Search + Dropdown */}
        <div className="bg-white rounded-2xl shadow-md border border-[var(--line)] p-3 flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-0 pl-10 pr-4 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 rounded-xl bg-[var(--cloud)]"
            />
          </div>

          <div className="relative sm:w-56" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[var(--ink)] bg-[var(--cloud)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 cursor-pointer"
            >
              <span className="truncate">{selectedCategoryName}</span>
              <ChevronDown size={16} className={`text-[var(--muted)] transition-transform shrink-0 ml-2 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-xl border border-[var(--line)] py-2 max-h-64 overflow-y-auto">
                <button
                  onClick={() => { setSelectedCategory(''); setDropdownOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-[var(--ink)] hover:bg-[var(--cloud)] cursor-pointer"
                >
                  All Categories
                  {selectedCategory === '' && <Check size={15} className="text-[var(--accent)]" />}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-[var(--ink)] hover:bg-[var(--cloud)] cursor-pointer"
                  >
                    <span className="truncate">{cat.name}</span>
                    {selectedCategory === cat.id && <Check size={15} className="text-[var(--accent)] shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                selectedCategory === '' ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-white text-[var(--ink)] border-[var(--line)] hover:border-[var(--accent)]'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                  selectedCategory === cat.id ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-white text-[var(--ink)] border-[var(--line)] hover:border-[var(--accent)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <h2 className="font-display text-lg sm:text-xl font-bold text-[var(--ink)] mb-5">
          {selectedCategoryName === 'All Categories' ? 'Featured Products' : selectedCategoryName}
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden animate-pulse">
                <div className="aspect-square bg-[var(--cloud)]" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[var(--cloud)] rounded w-1/3" />
                  <div className="h-4 bg-[var(--cloud)] rounded w-3/4" />
                  <div className="h-8 bg-[var(--cloud)] rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag size={44} className="text-[var(--muted)]/40 mb-4" />
            <p className="text-[var(--muted)]">No products found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}