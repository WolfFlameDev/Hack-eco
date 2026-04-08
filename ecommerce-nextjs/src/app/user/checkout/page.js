'use client';

import { useCart } from '@/hooks/useCart';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/redux/slices/cartSlice';

export default function CheckoutPage() {
  const { cartItems = [], totalPrice = 0, shippingCost = 0 } = useCart();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [userDetails, setUserDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    contact: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated) {
      toast.error('Please login to proceed');
      router.push('/auth/login?redirect=/user/checkout');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!userDetails.name.trim()) newErrors.name = 'Name is required';
    if (!userDetails.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email)) newErrors.email = 'Invalid email';
    if (!userDetails.address.trim()) newErrors.address = 'Address is required';
    if (!userDetails.city.trim()) newErrors.city = 'City is required';
    if (!userDetails.contact.trim()) newErrors.contact = 'Phone is required';
    if (!/^\d{10}$/.test(userDetails.contact.replace(/\D/g, ''))) newErrors.contact = 'Invalid phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const orderData = {
        orderNumber: `ORD-${Date.now()}`,
        items: cartItems,
        totalPrice,
        shippingCost,
        finalTotal: totalPrice + shippingCost,
        userDetails,
        timestamp: new Date().toISOString(),
        status: 'confirmed',
      };

      const existingOrders = JSON.parse(localStorage.getItem('ecoCommerceOrders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('ecoCommerceOrders', JSON.stringify(existingOrders));

      dispatch(clearCart());
      setOrderPlaced(true);
      toast.success('Order placed successfully! 🎉');

      setTimeout(() => {
        router.push(`/user/orders?orderid=${orderData.orderNumber}`);
      }, 2000);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-green-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const finalTotal = totalPrice + shippingCost;

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/user/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-green-600 transition mb-8">
            <ChevronLeft size={16} /> Back to Cart
          </Link>
          <div className="rounded-4xl border border-dashed border-slate-200 bg-white p-16 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-2xl font-black text-slate-900">No Items to Checkout</h2>
            <p className="mt-2 text-slate-500">Your cart is empty. Add items before proceeding.</p>
            <Link href="/shop" className="mt-6 inline-flex rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 shadow-md shadow-green-100 transition-transform hover:scale-105">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4"
      >
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto"
          >
            <CheckCircle2 size={40} className="text-green-600" />
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">Order Confirmed!</h1>
          <p className="text-slate-600 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
          <p className="text-sm text-slate-500 mb-8">Redirecting to your orders...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/user/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-green-600 transition mb-8">
          <ChevronLeft size={16} /> Back to Cart
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-slate-900">Checkout</h1>
          <p className="mt-2 text-slate-600">Complete your order securely</p>
        </motion.div>

        <form onSubmit={handleCheckout} className="grid gap-8 lg:grid-cols-3">
          {/* Main Form Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Delivery Information */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6">Delivery Information</h2>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userDetails.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full rounded-xl border ${errors.name ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:ring-green-50'} bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-4 ${!errors.name && 'focus:border-green-500'}`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userDetails.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:ring-green-50'} bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-4 ${!errors.email && 'focus:border-green-500'}`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={userDetails.contact}
                    onChange={handleInputChange}
                    placeholder="98765 43210"
                    className={`w-full rounded-xl border ${errors.contact ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:ring-green-50'} bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-4 ${!errors.contact && 'focus:border-green-500'}`}
                  />
                  {errors.contact && <p className="mt-1 text-xs text-red-600">{errors.contact}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    City <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={userDetails.city}
                    onChange={handleInputChange}
                    placeholder="New Delhi"
                    className={`w-full rounded-xl border ${errors.city ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:ring-green-50'} bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-4 ${!errors.city && 'focus:border-green-500'}`}
                  />
                  {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={userDetails.state}
                    onChange={handleInputChange}
                    placeholder="Delhi"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={userDetails.postalCode}
                    onChange={handleInputChange}
                    placeholder="110001"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Delivery Address <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={userDetails.address}
                    onChange={handleInputChange}
                    placeholder="Street address, apartment, suite, etc."
                    rows={3}
                    className={`w-full rounded-xl border ${errors.address ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 focus:ring-green-50'} bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-4 ${!errors.address && 'focus:border-green-500'}`}
                  />
                  {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6">Order Items ({cartItems.length})</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0">
                    <div className="flex items-center gap-4 flex-1">
                      {item.image && <img src={item.image} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />}
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-4 border-b border-slate-200 pb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold text-slate-900">₹{totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900">{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                    {shippingCost === 0 && <p className="text-xs text-green-600">✓ Free shipping</p>}
                  </div>
                </div>

                {shippingCost > 0 && totalPrice < 1000 && (
                  <div className="rounded-lg bg-blue-50 p-2 text-xs text-blue-700">
                    💡 Add ₹{(1000 - totalPrice).toFixed(2)} for free shipping!
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between text-lg">
                <span className="font-black text-slate-900">Total</span>
                <span className="text-2xl font-black text-green-600">₹{finalTotal.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="mt-8 w-full rounded-full bg-green-600 px-5 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-green-100 hover:bg-green-700 transition-all hover:shadow-xl hover:shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Place Order & Pay
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Lock size={12} /> Secure payment powered by Razorpay
              </p>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}