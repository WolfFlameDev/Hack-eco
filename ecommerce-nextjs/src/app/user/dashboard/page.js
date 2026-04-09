'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const orders = [
  {
    id: 'ODR-1047',
    placedAt: '2026-03-28',
    status: 'Shipped',
    total: 74.98,
    items: 3,
    delivery: 'Apr 5, 2026',
  },
  {
    id: 'ODR-1039',
    placedAt: '2026-03-14',
    status: 'Delivered',
    total: 42.5,
    items: 2,
    delivery: 'Mar 20, 2026',
  },
  {
    id: 'ODR-1021',
    placedAt: '2026-02-26',
    status: 'Processing',
    total: 129.99,
    items: 5,
    delivery: 'Apr 1, 2026',
  },
];

const statusStyles = {
  Delivered: 'bg-green-100 text-green-800',
  Shipped: 'bg-blue-100 text-blue-800',
  Processing: 'bg-yellow-100 text-yellow-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function UserDashboard() {
  const { user, isAuthenticated, logout, isUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!isUser()) {
      if (user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user?.role === 'seller') {
        router.push('/seller/dashboard');
      }
    }
  }, [isAuthenticated, user, router, isUser]);

  if (!isAuthenticated || !isUser()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalOrders = orders.length;
  const activeDeliveries = orders.filter((order) => order.status !== 'Delivered').length;
  const recentOrder = orders[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Link href="/user/dashboard" className="text-2xl font-semibold text-slate-900">
                EcoCommerce
              </Link>
              <p className="mt-1 text-sm text-slate-500">Your dashboard for orders, payments, and account support.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">Hello, {user.name}</span>
              <Link href="/user/cart" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                View Cart
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-10 text-white shadow-lg shadow-slate-200/30 sm:px-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/80">User Dashboard</p>
              <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Manage your sustainable shopping with confidence.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-100/90">
                Track your recent orders, review account details, and access the tools you need to keep your eco-friendly purchases organized.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/shop" className="rounded-3xl bg-white/10 px-5 py-4 text-center text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20">
                Continue Shopping
              </Link>
              <Link href="/user/orders" className="rounded-3xl bg-white px-5 py-4 text-center text-sm font-semibold text-slate-900 hover:bg-slate-100">
                See My Orders
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">Total Orders</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{totalOrders}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">Active Deliveries</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{activeDeliveries}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">Latest Order</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{recentOrder.id}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Recent Orders</h2>
                  <p className="mt-2 text-sm text-slate-500">Monitor the latest updates for your most recent purchases.</p>
                </div>
                <Link href="/user/orders" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                  View All Orders
                </Link>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {orders.slice(0, 2).map((order) => (
                    <div key={order.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{order.placedAt}</p>
                          <p className="mt-3 text-base font-semibold text-slate-900">{order.id}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                        <span>{order.items} items</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Helpful Actions</h2>
              <p className="mt-2 text-sm text-slate-500">Quick links to the tools you use most often.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link href="/user/cart" className="block rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left hover:border-slate-300 hover:bg-slate-100">
                  <p className="font-semibold text-slate-900">Review Cart</p>
                  <p className="mt-1 text-sm text-slate-500">Complete any items waiting to checkout.</p>
                </Link>
                <Link href="/shop" className="block rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left hover:border-slate-300 hover:bg-slate-100">
                  <p className="font-semibold text-slate-900">Browse Catalog</p>
                  <p className="mt-1 text-sm text-slate-500">Find the latest eco-friendly products.</p>
                </Link>
                <Link href="/user/orders" className="block rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left hover:border-slate-300 hover:bg-slate-100">
                  <p className="font-semibold text-slate-900">Track Orders</p>
                  <p className="mt-1 text-sm text-slate-500">See all current order statuses.</p>
                </Link>
                <a href="mailto:support@eco-commerce.com" className="block rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left hover:border-slate-300 hover:bg-slate-100">
                  <p className="font-semibold text-slate-900">Contact Support</p>
                  <p className="mt-1 text-sm text-slate-500">Get help with account or order questions.</p>
                </a>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Account Summary</h2>
              <div className="mt-5 space-y-4 text-sm text-slate-600">
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span>Name</span>
                  <span className="font-medium text-slate-900">{user.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span>Email</span>
                  <span className="font-medium text-slate-900">{user.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span>Role</span>
                  <span className="font-medium text-slate-900 capitalize">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verified</span>
                  <span className={`font-medium ${user.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {user.isVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Order Insights</h2>
              <p className="mt-2 text-sm text-slate-500">Stay informed about upcoming deliveries and current shipping status.</p>
              <div className="mt-5 grid gap-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Next delivery</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{recentOrder.delivery}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Pending shipments</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{activeDeliveries}</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
