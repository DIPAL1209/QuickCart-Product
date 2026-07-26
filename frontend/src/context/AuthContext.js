'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = Cookies.get('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    Cookies.set('access_token', res.data.access_token, { expires: 7 });
    Cookies.set('user', JSON.stringify(res.data.user), { expires: 7 });
    setUser(res.data.user);
    return res.data;
  };

  const register = async (full_name, email, password) => {
    const res = await api.post('/auth/register', { full_name, email, password });
    return res.data;
  };

 const logout = () => {
  Cookies.remove('access_token');
  Cookies.remove('user');
  localStorage.removeItem('cart');
  setUser(null);
  window.location.href = '/';
};

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);