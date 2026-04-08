'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/product/get?page=1&limit=12');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch products');
        }

        setProducts(data.products || []);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <Link href="/" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">
            Back to Home
          </Link>
        </div>

        {loading && (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">Loading products from database...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-700">No products found in database.</p>
            <p className="mt-2 text-sm text-gray-500">
              Add products to MongoDB and refresh this page.
            </p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product._id} className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-green-700">{product.category}</p>
                <h2 className="mt-2 text-xl font-semibold text-gray-900">{product.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">${product.price}</p>
                  <p className="text-xs text-gray-500">Stock: {product.stock ?? 0}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
