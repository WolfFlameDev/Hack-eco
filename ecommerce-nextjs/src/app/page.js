'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from '@/components/ecommerce/Navbar';
import CategoryBar from '@/components/ecommerce/CategoryBar';
import OfferSection from '@/components/ecommerce/OfferSection';
import ProductCard from '@/components/ProductCard';
import LoadingSkeleton from '@/components/ecommerce/LoadingSkeleton';
import { useCart } from '@/hooks/useCart';
import { addToCart } from '@/redux/slices/cartSlice';
import { getProducts } from '@/services/productService';
import Offer from './main/offer';
import Footer from './main/footer';
const categories = ['All', 'Clothes', 'Accessories', 'Electronics', 'Shoes'];

export default function HomePage() {
  const dispatch = useDispatch();
  const { items: cartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      const data = await getProducts();
      if (!active) return;
      setProducts(data);
      setLoading(false);
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, products, searchTerm]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    setToastMessage(`${product.name} added to cart`);
    setTimeout(() => setToastMessage(''), 2200);
  };

  const cartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f8fafb] text-slate-900">
      <Navbar cartCount={cartQuantity} searchTerm={searchTerm} onSearch={setSearchTerm} />
<Offer/>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
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
              <h3 className="mt-3 text-3xl font-black text-slate-900">Premium products, designed for modern living.</h3>
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
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
            )}
          </div>
        </section>
    
      </main>
    <Footer/>
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-3xl bg-slate-900 px-6 py-4 text-center text-sm font-semibold text-white shadow-2xl shadow-slate-900/20 sm:w-auto">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
