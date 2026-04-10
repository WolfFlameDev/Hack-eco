'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, UserCircle, SearchIcon, Menu, LogOut, User, X, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import authService from '@/services/authService';

export default function Navbar({ cartCount = 0, searchTerm, onSearch }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchTerm ?? '');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [newArrivals, setNewArrivals] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const canUseCart = !user || user.role === 'user';
  const showCartCount = cartCount > 0;

  useEffect(() => {
    setInputValue(searchTerm ?? '');
  }, [searchTerm]);

  // Fetch new arrivals (products added in the last 24 h) to power the bell badge
  useEffect(() => {
    let active = true;
    async function fetchNewArrivals() {
      try {
        const res = await fetch('/api/products/new-arrivals', { credentials: 'include', cache: 'no-store' });
        const payload = await res.json();
        if (!active || !payload.success) return;
        setNewArrivals(payload.data ?? []);
      } catch {
        // silently ignore; bell simply shows no badge
      }
    }
    fetchNewArrivals();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const query = inputValue.trim();
    if (!query) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=6`, {
          credentials: 'include',
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'Search failed');
        }

        setSuggestions(payload.data?.products ?? []);
        setSuggestionsOpen(true);
      } catch {
        setSuggestions([]);
        setSuggestionsOpen(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleSearchChange = (value) => {
    setInputValue(value);
    onSearch?.(value);
  };

  const openSuggestion = (productId) => {
    setSuggestionsOpen(false);
    setInputValue('');
    onSearch?.('');
    router.push(`/products/${productId}`);
  };

  const openChatbot = (query) => {
    setSuggestionsOpen(false);
    window.dispatchEvent(new CustomEvent('eco:open-chatbot', { detail: { query } }));
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      setShowDropdown(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getDashboardRoute = (role) => {
    if (role === 'seller') return '/seller/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/user/dashboard';
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LEFT: Logo & Nav Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg shadow-green-200 transition-transform group-hover:scale-105">
              <span className="font-bold text-xl">E</span>
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">Eco</span>
              <span className="text-sm font-black text-slate-800 leading-none">Commerce</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {['Home', 'About', 'Contact'].map((item) => (
              <Link
                key={item}
                href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>

        {/* CENTER: Search Bar */}
        <div className="flex-1 px-4 sm:px-8 hidden lg:block">
          <div className="relative mx-auto max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (suggestions.length) {
                  setSuggestionsOpen(true);
                }
              }}
              placeholder="Search products..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
            />

            {suggestionsOpen && suggestions.length ? (
              <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {suggestions.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => openSuggestion(product.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-100">
                        {product.image ? <img src={product.image} alt={product.title} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{product.title}</p>
                        <p className="truncate text-xs text-slate-500">{product.category} | Rs {Number(product.price || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => openChatbot(product.title)}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700"
                    >
                      Ask AI
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Cart Button */}
          {canUseCart && (
            <Link
              href="/user/cart"
              className="group relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart size={22} className="group-hover:text-green-600" />
              {showCartCount && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifs((prev) => !prev);
                setShowDropdown(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
              title="New arrivals"
            >
              <Bell size={20} className={newArrivals.length > 0 ? 'text-green-600' : ''} />
              {newArrivals.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                  {newArrivals.length > 9 ? '9+' : newArrivals.length}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-black text-slate-900">New arrivals</p>
                  <button
                    type="button"
                    onClick={() => setShowNotifs(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X size={14} />
                  </button>
                </div>
                {newArrivals.length === 0 ? (
                  <p className="px-4 py-5 text-center text-sm text-slate-500">No new products in the last 24 h.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {newArrivals.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/products/${product.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                          onClick={() => setShowNotifs(false)}
                        >
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {product.image ? (
                              <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-lg">🛍️</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{product.title}</p>
                            <p className="text-xs text-slate-500">₹{Number(product.price || 0).toLocaleString('en-IN')} · {product.category}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-slate-100 px-4 py-3">
                  <Link
                    href="/"
                    className="block text-center text-xs font-semibold text-green-600 hover:text-green-700"
                    onClick={() => setShowNotifs(false)}
                  >
                    Browse all products →
                  </Link>
                </div>
              </div>
            )}
          </div>
          {/* Auth Section */}
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
            </div>
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                title={user?.name || 'Profile'}
              >
                <UserCircle size={22} className="hover:text-green-600" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{user?.name || 'Account'}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        router.replace(getDashboardRoute(user?.role));
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User size={16} className="text-green-600" />
                      Dashboard
                    </button>
                  </div>

                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-md shadow-green-100"
              >
                Login
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white md:hidden animate-in fade-in duration-200">
          <div className="space-y-1 px-4 py-3">
            <Link href="/" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
              Home
            </Link>
            <Link href="/about" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
              About
            </Link>
            <Link href="/contact" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
