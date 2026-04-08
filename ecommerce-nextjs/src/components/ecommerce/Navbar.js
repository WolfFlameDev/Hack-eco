'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, UserCircle, SearchIcon } from 'lucide-react';

export default function Navbar({ cartCount = 0, searchTerm, onSearch }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showCartCount = isMounted && cartCount > 0;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-3xl bg-green-600 grid place-items-center text-white shadow-xl">
            <span className="font-black text-lg">E</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">EcoCommerce</p>
            <h1 className="text-lg font-black text-slate-900">Sustainable Store</h1>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-auto w-full">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search eco products, clothes, electronics..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
            />
          </label>
        </div>

        <div className="flex items-center gap-4 justify-end">
          <button className="relative inline-flex items-center rounded-full bg-slate-100 p-3 text-slate-700 hover:bg-slate-200 transition">
            <ShoppingCart size={20} />
            {showCartCount && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1.5 text-[11px] font-black text-white leading-none">
                {cartCount}
              </span>
            )}
          </button>
          <button className="inline-flex items-center rounded-full bg-slate-100 p-3 text-slate-700 hover:bg-slate-200 transition">
            <UserCircle size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
