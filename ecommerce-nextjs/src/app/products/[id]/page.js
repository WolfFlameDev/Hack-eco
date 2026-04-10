'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/ecommerce/Navbar';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { getProduct } from '@/services/productService';
import { addToCart as addToCartRequest } from '@/services/cartService';
import { useDispatch } from 'react-redux';
import { setCart } from '@/redux/slices/cartSlice';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { cartCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        const data = await getProduct(params.id);
        if (!active) {
          return;
        }
        setProduct(data);
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load product');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (params.id) {
      loadProduct();
    }

    return () => {
      active = false;
    };
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'user') {
      setError('Seller accounts cannot buy products.');
      return;
    }

    try {
      setAdding(true);
      setError('');
      const cart = await addToCartRequest(product.id, 1);
      dispatch(setCart(cart.items ?? []));
    } catch (err) {
      setError(err.message || 'Failed to add product to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar cartCount={cartCount} searchTerm="" onSearch={() => {}} />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Back to shopping</Link>

        {loading ? <p className="mt-6 text-sm text-slate-500">Loading product...</p> : null}
        {error && !product ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

        {product ? (
          <section className="mt-6 grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1fr_1fr]">
            <div>
              <img
                src={product.image || 'https://via.placeholder.com/900x900?text=Product'}
                alt={product.title}
                className="w-full rounded-3xl object-cover"
                style={{ height: '28rem' }}
              />
              {product.images?.length > 1 ? (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((image, index) => (
                    <img key={`${image}-${index}`} src={image} alt={`${product.title} ${index + 1}`} className="h-20 w-full rounded-xl object-cover" />
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-600">{product.category}</p>
              <h1 className="mt-3 text-4xl font-black text-slate-900">{product.title}</h1>
              <p className="mt-4 text-lg font-black text-emerald-700">Rs {Number(product.price || 0).toLocaleString('en-IN')}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{product.description}</p>

              {product.tags?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span key={`${tag}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={handleAddToCart} disabled={adding} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('eco:open-chatbot', { detail: { query: product.title } }))}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700"
                >
                  Ask AI About This Product
                </button>
              </div>

              {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
