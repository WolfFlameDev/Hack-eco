'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Camera } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

const PRICE_FILTERS = [
  { value: 'all', label: 'All prices' },
  { value: 'under50', label: 'Under $50' },
  { value: '50-150', label: '$50 - $150' },
  { value: '150-plus', label: '$150+' },
];

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceFilter, setPriceFilter] = useState('all');
  const [isImageSearch, setIsImageSearch] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/product/get?page=1&limit=24');
        const text = await response.text();
        let data;

        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }

        if (!response.ok) {
          const errorMsg = data?.error || text || 'Failed to fetch products';
          console.error('API Error:', errorMsg);
          throw new Error(errorMsg);
        }

        setProducts(data?.products || []);
      } catch (err) {
        console.error('Product loading error:', err);
        setError(err.message || 'Unable to load products');
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleImageSearch = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      setError('');
      setIsImageSearch(true);

      const response = await fetch('/api/search/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Image Search Results:');
        console.log('Description:', data.description);
        console.log('Tags:', data.tags);
        console.log('Products found:', data.products.length);
        console.log('Full data:', data);

        // Update the search query with the description
        setSearchQuery(data.description);
        
        // Reset category filter to show all results
        setSelectedCategory('all');

        // Update products to show image search results
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setError('No products found matching this image. Try a different image.');
        }
      } else {
        console.error('Image search error:', data.error);
        setError(data.error || 'Image search failed');
        setIsImageSearch(false);
      }
    } catch (err) {
      console.error('Failed to search by image:', err);
      setError('Failed to search by image');
      setIsImageSearch(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageSearch(file);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Clear image search when user types in search
    if (e.target.value.trim() !== '') {
      setIsImageSearch(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const categories = useMemo(() => {
    const found = products.reduce((set, product) => {
      if (product.category) set.add(product.category);
      return set;
    }, new Set());
    return ['all', ...Array.from(found)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    // If we're viewing image search results, don't apply additional filters
    if (isImageSearch) {
      return products;
    }

    let active = [...products];

    if (selectedCategory !== 'all') {
      active = active.filter((product) => product.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      active = active.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    if (priceFilter !== 'all') {
      active = active.filter((product) => {
        const price = Number(product.price) || 0;
        if (priceFilter === 'under50') return price < 50;
        if (priceFilter === '50-150') return price >= 50 && price <= 150;
        if (priceFilter === '150-plus') return price > 150;
        return true;
      });
    }

    if (sortBy === 'price-low') {
      return active.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    }

    if (sortBy === 'price-high') {
      return active.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    if (sortBy === 'newest') {
      return active.sort((a, b) => {
        const createdA = new Date(a.createdAt || a.updatedAt || Date.now()).getTime();
        const createdB = new Date(b.createdAt || b.updatedAt || Date.now()).getTime();
        return createdB - createdA;
      });
    }

    return active;
  }, [products, selectedCategory, searchQuery, sortBy, priceFilter, isImageSearch]);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-green-600 p-2 shadow-sm shadow-green-100">
              <span className="block h-4 w-4 rounded-md bg-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">EcoCommerce</p>
              <p className="text-xs text-slate-500">Marketplace</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-green-600 transition-colors">Home</Link>
            <Link href="/shop" className="text-slate-900 hover:text-green-600 transition-colors">Shop</Link>
            <Link href="/auth/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-slate-900 px-5 py-2 text-white transition hover:bg-green-600"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[2rem] bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-8 shadow-sm shadow-slate-200">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-600">Shop the collection</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Sustainable products curated for your everyday life.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Discover eco-friendly essentials, filtered for quality, price, and category. Save time and find what matters most to your lifestyle.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:auto-cols-max lg:grid-flow-col">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Products</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{filteredProducts.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Categories</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{categories.length - 1}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {isImageSearch ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                  Image Search Results: {filteredProducts.length} of {products.length} products
                </span>
              ) : (
                `Showing ${filteredProducts.length} of ${products.length} products`
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="search">Search</label>
              <input
                id="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products, brands, or features"
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 sm:w-auto"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={handleCameraClick}
                className="ml-2 rounded-3xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition-colors"
                title="Search by image"
              >
                <Camera size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              {PRICE_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,_1fr)]">
          <aside className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
              <p className="mt-2 text-sm text-slate-500">Filter by product type.</p>
            </div>

            <div className="space-y-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`flex w-full items-center justify-between rounded-3xl px-4 py-3 text-left text-sm transition ${
                    selectedCategory === category
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{category === 'all' ? 'All Categories' : category}</span>
                  <span className="text-xs text-slate-500">{category === 'all' ? products.length : products.filter((product) => product.category === category).length}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-6">
            {loading ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 border-3 border-green-100 rounded-full"></div>
                    <div className="absolute inset-0 border-3 border-green-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="font-medium">Loading products...</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 shadow-sm">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 text-red-600 font-semibold text-lg">⚠</div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Unable to load products</p>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                    <p className="mt-3 text-xs text-red-600">Please try refreshing the page or contact support if the problem persists.</p>
                  </div>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-xl font-semibold text-slate-900">No products match your filters.</p>
                <p className="mt-2 text-sm text-slate-500">Try selecting a different category or clearing the filters.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
