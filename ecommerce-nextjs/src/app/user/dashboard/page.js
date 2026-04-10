'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/ecommerce/Navbar';
import { getOrders } from '@/services/orderService';
import { getDashboardProfile } from '@/services/profileService';

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
  const router = useRouter();
  const { initialized, isAuthenticated, user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/auth/login?redirect=/user/dashboard');
      return;
    }

    if (user?.role !== 'user') {
      router.replace(user?.role === 'seller' ? '/seller/dashboard' : '/admin/dashboard');
    }
  }, [initialized, isAuthenticated, router, user?.role]);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError('');
        const [data, profileData] = await Promise.all([getOrders('user'), getDashboardProfile()]);
        if (!active) {
          return;
        }

        setOrders(data.orders ?? []);
        setProfile(profileData);
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err.message || 'Failed to fetch orders');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (isAuthenticated && user?.role === 'user') {
      loadOrders();
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    if (!(isAuthenticated && user?.role === 'user')) {
      return;
    }

    const timer = setInterval(async () => {
      try {
        const [data, profileData] = await Promise.all([getOrders('user'), getDashboardProfile()]);
        setOrders(data.orders ?? []);
        setProfile(profileData);
      } catch {
        // ignore transient poll errors, next cycle retries
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [isAuthenticated, user?.role]);

  const summary = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.total += order.totalAmount || 0;
        if (order.status === 'delivered') {
          acc.delivered += 1;
        }
        if (order.status === 'pending') {
          acc.pending += 1;
        }
        return acc;
      },
      { total: 0, delivered: 0, pending: 0 }
    );
  }, [orders]);

  const totalOrders = orders.length;
  const activeDeliveries = orders.filter((order) => order.status !== 'Delivered').length;
  const recentOrder = orders[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar searchTerm="" onSearch={() => {}} cartCount={0} />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">{profile?.user?.name ? `${profile.user.name}'s Dashboard` : 'My Dashboard'}</h1>
            <p className="mt-1 text-sm text-slate-600">Track your orders and recent purchases.</p>
            <p className="mt-2 text-sm text-slate-500">
              {profile?.user?.email || user?.email || 'No email'}
              {' · '}
              {profile?.metrics?.phone || profile?.user?.phone || 'No phone added'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile/edit"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Edit Profile
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Continue Shopping
            </Link>
            <Link
              href="/user/recommendations"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
            >
              AI Recommendations
            </Link>
            <button
              onClick={logout}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Total Orders" value={profile?.metrics?.orders ?? orders.length} />
          <StatCard label="Delivered" value={summary.delivered} />
          <StatCard label="Total Spent" value={`Rs ${(profile?.metrics?.totalSpent ?? summary.total).toFixed(2)}`} />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">My Orders</h2>

          {loading ? <p className="mt-4 text-sm text-slate-500">Loading orders...</p> : null}
          {!loading && error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          {!loading && !error && orders.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-slate-600">No orders yet. Start shopping to place your first order.</p>
            </div>
          ) : null}

          {!loading && !error && orders.length > 0 ? (
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <StatusBadge label={order.status} />
                    <PaymentBadge label={order.paymentStatus} />
                    <span className="font-semibold text-slate-900">Rs {(order.totalAmount ?? 0).toFixed(2)}</span>
                  </div>

                  <div className="mt-4">
                    <OrderTimeline status={order.status} timeline={order.statusTimeline} />
                  </div>

                  {order.trackingDetails?.trackingNumber || order.trackingDetails?.trackingUrl ? (
                    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
                      <p className="font-semibold">Shipping</p>
                      <p>Tracking Number: {order.trackingDetails.trackingNumber || 'Not provided'}</p>
                      <p>Carrier: {order.trackingDetails.carrier || 'Not provided'}</p>
                      <p>
                        Estimated Delivery:{' '}
                        {order.trackingDetails.estimatedDelivery
                          ? new Date(order.trackingDetails.estimatedDelivery).toLocaleDateString()
                          : 'Not provided'}
                      </p>
                      {order.trackingDetails.trackingUrl ? (
                        <a
                          href={order.trackingDetails.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block font-semibold text-blue-700 hover:text-blue-900"
                        >
                          Track Shipment
                        </a>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-2">
                    {(order.items ?? []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{item.title} x {item.quantity}</span>
                        <span className="font-medium text-slate-900">Rs {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ label }) {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-cyan-100 text-cyan-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[label] ?? 'bg-slate-100 text-slate-700'}`}>
      {label}
    </span>
  );
}

function PaymentBadge({ label }) {
  const map = {
    created: 'bg-slate-100 text-slate-700',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[label] ?? 'bg-slate-100 text-slate-700'}`}>
      payment: {label}
    </span>
  );
}

function OrderTimeline({ status, timeline = {} }) {
  const steps = [
    { key: 'pending', label: 'Pending', date: null },
    { key: 'confirmed', label: 'Confirmed', date: timeline.confirmedAt },
    { key: 'processing', label: 'Processing', date: timeline.processingAt },
    { key: 'shipped', label: 'Shipped', date: timeline.shippedAt },
    { key: 'delivered', label: 'Delivered', date: timeline.deliveredAt },
  ];

  const indexMap = steps.reduce((acc, step, idx) => {
    acc[step.key] = idx;
    return acc;
  }, {});

  const currentIndex = indexMap[status] ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Order timeline</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-5">
        {steps.map((step, idx) => {
          const completed = idx <= currentIndex;
          return (
            <div
              key={step.key}
              className={`rounded-lg border px-2 py-2 text-center ${completed ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em]">{step.label}</p>
              <p className="mt-1 text-[10px]">
                {step.date ? new Date(step.date).toLocaleDateString('en-IN') : completed ? 'Updated' : 'Pending'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
