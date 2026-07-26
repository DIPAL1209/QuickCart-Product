'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-[var(--cloud)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="w-12 h-12 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={22} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Welcome back</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Login to continue shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 sm:p-7 rounded-2xl shadow-lg shadow-[var(--primary)]/5 border border-[var(--line)]">
          {error && (
            <div className="flex items-center gap-2 text-[var(--danger)] text-sm bg-red-50 p-3 rounded-xl">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">Email</label>
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-[var(--line)] rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-[var(--line)] rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <LogIn size={16} />
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-sm text-center text-[var(--muted)]">
            No account?{' '}
            <Link href="/register" className="text-[var(--accent)] font-semibold cursor-pointer">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}