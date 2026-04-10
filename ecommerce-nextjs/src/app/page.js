'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ecommerce/Navbar';
import CategoryBar from '@/components/ecommerce/CategoryBar';
import OfferSection from '@/components/ecommerce/OfferSection';
import ProductCard from '@/components/ProductCard';
import LoadingSkeleton from '@/components/ecommerce/LoadingSkeleton';
import { useCart } from '@/hooks/useCart';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { setCart } from '@/redux/slices/cartSlice';
import { clearCompare, removeFromCompare } from '@/redux/slices/compareSlice';
import { getProducts } from '@/services/productService';
import { addToCart as addToCartRequest } from '@/services/cartService';
import { useAuth } from '@/hooks/useAuth';
import Offer from './main/offer';
import Footer from './main/footer';

function buildCategorySections(products = []) {
  const grouped = new Map();

  for (const product of products) {
    const category = product.category || 'Other';
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category).push(product);
  }

  return Array.from(grouped.entries()).map(([category, items]) => ({
    category,
    products: items,
  }));
}

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items: cartItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const compareItems = useSelector((state) => state.compare.items);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [recommendationSections, setRecommendationSections] = useState({
    youMayLike: [],
    trendingNow: [],
  });
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const data = await getProducts();
        if (!active) return;
        setProducts(data.products ?? []);
        setCategories(['All', ...(data.categories ?? [])]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadRecommendationSections() {
      try {
        setLoadingRecommendations(true);
        const response = await fetch('/api/recommendations/sections', {
          credentials: 'include',
          cache: 'no-store',
        });

        const payload = await response.json();
        if (!response.ok || !payload.success || !active) {
          return;
        }

        setRecommendationSections({
          youMayLike: payload.data?.youMayLike ?? [],
          trendingNow: payload.data?.trendingNow ?? [],
        });
      } finally {
        if (active) {
          setLoadingRecommendations(false);
        }
      }
    }

    loadRecommendationSections();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch =
        query.length === 0 ||
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, products, searchTerm]);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'user') {
      setToastMessage('Seller accounts cannot buy products.');
      setTimeout(() => setToastMessage(''), 2200);
      return;
    }

    try {
      setIsAdding(true);
      const cart = await addToCartRequest(product.id, 1);
      dispatch(setCart(cart.items ?? []));
      setToastMessage(`${product.title} added to cart`);
    } catch (error) {
      setToastMessage(error.message || 'Failed to add product to cart');
    } finally {
      setIsAdding(false);
      setTimeout(() => setToastMessage(''), 2200);
    }
  };

  const cartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const categorySections = useMemo(() => buildCategorySections(filteredProducts), [filteredProducts]);
  const { recentlyViewed } = useRecentlyViewed();

  return (
    <div className="min-h-screen bg-[#f8fafb] text-slate-900">
      <Navbar cartCount={cartQuantity} searchTerm={searchTerm} onSearch={setSearchTerm} />
<Offer/>
      <main className="max-w-7xl mx-auto px-4 pt-24 sm:px-6 lg:px-8 pb-20">
        <section className="pt-10">
          <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.2)] sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center rounded-full bg-green-50 px-4 py-2 text-xs font-black uppercase tracking-[0.35em] text-green-700">
                  Fresh arrivals
                </span>
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                    Modern eco shopping with a premium feel.
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                    Browse sustainable categories, find your next favorite product, and add it to cart with one tap. Designed for a clean shopping experience on every screen.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="rounded-2xl bg-slate-50 px-4 py-2">Fast delivery</span>
                  <span className="rounded-2xl bg-slate-50 px-4 py-2">Eco verified</span>
                  <span className="rounded-2xl bg-slate-50 px-4 py-2">Secure checkout</span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-4xl bg-green-600 py-12 px-8 text-white shadow-2xl shadow-green-200 sm:px-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]" />
                <div className="relative space-y-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-green-100/80">Shop the best</p>
                  <h2 className="text-4xl font-black leading-tight">Sustainable products delivered with confidence.</h2>
                  <p className="max-w-md text-base leading-7 text-green-100/90">
                    Every item on our platform is curated for low impact, strong design, and comfort-first performance.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3">
                    <div className="rounded-3xl bg-white/10 p-4 text-sm font-semibold">Quality fabrics</div>
                    <div className="rounded-3xl bg-white/10 p-4 text-sm font-semibold">Verified sellers</div>
                    <div className="rounded-3xl bg-white/10 p-4 text-sm font-semibold">Eco packaging</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Top Categories</h2>
              <p className="mt-2 text-sm text-slate-500">Tap a category to filter products instantly.</p>
            </div>
            <p className="text-sm text-slate-500">{filteredProducts.length} products found</p>
          </div>
          <CategoryBar categories={categories} activeCategory={activeCategory} onChange={setActiveCategory} />
        </section>

        <OfferSection />

        <section className="pt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-green-600">Product Collection</p>
              <h3 className="mt-3 text-3xl font-black text-slate-900">Shop by category, one row at a time.</h3>
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-4xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
                <p className="text-lg font-bold text-slate-900">No products found</p>
                <p className="mt-3 text-sm text-slate-500">Try another category or search term to find the perfect item.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {categorySections.map((section) => (
                  <section key={section.category} className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h4 className="text-2xl font-black text-slate-900">{section.category}</h4>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{section.products.length} items</p>
                    </div>
                    <div className="-mx-1 flex gap-5 overflow-x-auto px-1 pb-2">
                      {section.products.map((product) => (
                        <div key={product.id} className="min-w-[260px] max-w-[280px] flex-1">
                          <ProductCard product={product} onAddToCart={handleAddToCart} />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-600">Intelligent Picks</p>
              <h3 className="mt-2 text-3xl font-black text-slate-900">Personalized recommendations</h3>
            </div>
            <Link href="/user/recommendations" className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              Open AI Assistant
            </Link>
          </div>

          {loadingRecommendations ? (
            <LoadingSkeleton />
          ) : (
            <div className="space-y-8">
              <RecommendationRow title="You may like" items={recommendationSections.youMayLike} onAddToCart={handleAddToCart} />
              <RecommendationRow title="Trending now" items={recommendationSections.trendingNow} onAddToCart={handleAddToCart} />
            </div>
          )}
        </section>

        {/* ── Recently Viewed ──────────────────────────────────── */}
        {recentlyViewed.length > 0 && (
          <section className="pt-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Your history</p>
                <h3 className="mt-2 text-3xl font-black text-slate-900">Recently viewed</h3>
              </div>
            </div>
            <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="-mx-1 flex gap-5 overflow-x-auto px-1 pb-2">
                {recentlyViewed.map((product) => (
                  <div key={product.id} className="min-w-[260px] max-w-[280px] flex-1">
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Shop by Category Icon Grid ───────────────────────── */}
        <CategoryIconGrid categories={categories.filter((c) => c !== 'All')} onSelect={(cat) => { setActiveCategory(cat); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
    
      </main>
    <Footer/>
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-3xl bg-slate-900 px-6 py-4 text-center text-sm font-semibold text-white shadow-2xl shadow-slate-900/20 sm:w-auto">
          {isAdding ? 'Adding to cart...' : toastMessage}
        </div>
      )}

      <CompareBar
        items={compareItems}
        onRemove={(id) => dispatch(removeFromCompare(id))}
        onClear={() => dispatch(clearCompare())}
      />
    </div>
  );
}

function RecommendationRow({ title, items, onAddToCart }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-2xl font-black text-slate-900">{title}</h4>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{items.length} picks</p>
      </div>
      <div className="-mx-1 flex gap-5 overflow-x-auto px-1 pb-2">
        {items.map((product) => (
          <div key={product.id} className="min-w-[260px] max-w-[280px] flex-1">
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </section>
  );
}
// ── Category Icon Grid ────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  'Men Clothing': '👔',
  'Women Clothing': '👗',
  'Kids Clothing': '🧒',
  'Electronics': '💻',
  'Footwear': '👟',
  'Accessories': '💍',
  'Home Decor': '🏠',
  'Beauty': '💄',
  'Sports': '⚽',
  'Grocery': '🛒',
};

function CategoryIconGrid({ categories, onSelect }) {
  if (!categories?.length) return null;
  return (
    <section className="pt-14">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-green-600">Browse by interest</p>
        <h3 className="mt-2 text-3xl font-black text-slate-900">Shop by category</h3>
        <p className="mt-2 text-sm text-slate-500">Tap any category to jump straight to the products you love.</p>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:gap-4 lg:grid-cols-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className="group flex flex-col items-center gap-2 rounded-3xl border border-slate-200 bg-white px-2 py-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-lg hover:shadow-green-50"
          >
            <span className="text-3xl transition-transform group-hover:scale-110" role="img" aria-label={cat}>
              {CATEGORY_ICONS[cat] ?? '🛍️'}
            </span>
            <span className="text-[11px] font-bold leading-tight text-slate-700 group-hover:text-green-700">{cat}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ── Floating Compare Bar ─────────────────────────────────────────────────────
function CompareBar({ items, onRemove, onClear }) {
  if (!items.length) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-black text-slate-700">
            Compare ({items.length}/4):
          </span>
          {items.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-800"
            >
              {p.title?.slice(0, 20)}{p.title?.length > 20 ? '…' : ''}
              <button
                onClick={() => onRemove(p.id)}
                className="text-green-600 hover:text-red-500"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear
          </button>
          <Link
            href="/compare"
            className="rounded-xl bg-green-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-green-100 hover:bg-green-700"
          >
            Compare Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
