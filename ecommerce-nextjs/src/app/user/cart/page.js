'use client';

import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useCart } from '@/hooks/useCart';
import { decrementQuantity, incrementQuantity, removeFromCart } from '@/redux/slices/cartSlice';
import CartItem from '@/components/CartItem';

export default function CartPage() {
  const dispatch = useDispatch();
  const cart = useCart();
  const cartItems = cart?.items || [];

  const totalPrice = cartItems.reduce((total, item) => total + (item?.price || 0) * (item?.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-2xl font-black text-slate-900">
              EcoCommerce
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>Guest cart</span>
              <Link href="/shop" className="text-green-600 font-semibold hover:text-green-700 transition">Continue shopping</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Shopping Cart</h1>
            <p className="mt-2 text-sm text-slate-500">Review items, update quantities, and proceed to checkout.</p>
          </div>
          <Link href="/shop" className="inline-flex items-center rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 shadow-md shadow-green-100 transition">
            Continue shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-green-600">
              <span className="text-3xl">🛒</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Your cart is empty</h2>
            <p className="mt-3 text-sm text-slate-500">Add sustainable products from the shop to start your order.</p>
            <Link href="/shop" className="mt-6 inline-flex rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 shadow-md shadow-green-100 transition">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <CartItem
                  key={item?.id}
                  item={item}
                  onIncrement={(id) => dispatch(incrementQuantity(id))}
                  onDecrement={(id) => dispatch(decrementQuantity(id))}
                  onRemove={(id) => dispatch(removeFromCart(id))}
                />
              ))}
            </div>
            <aside className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm h-fit sticky top-24">
              <h2 className="text-xl font-black text-slate-900">Order summary</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between text-lg font-black text-slate-900">
                  <span>Total</span>
                  <span className="text-green-600">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/user/checkout"
                className="mt-8 w-full rounded-full bg-green-600 px-5 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-green-100 hover:bg-green-700 transition block"
              >
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
