'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, UserCircle, SearchIcon, Menu, LogOut, User, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import authService from '@/services/authService';

export default function Navbar({ cartCount = 0, searchTerm, onSearch }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const canUseCart = !user || user.role === 'user';
  const showCartCount = cartCount > 0;

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
              value={searchTerm ?? ''}
              onChange={(e) => onSearch?.(e.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
            />
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
