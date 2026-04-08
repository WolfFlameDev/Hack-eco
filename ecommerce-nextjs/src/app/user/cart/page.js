'use client';

import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useCart } from '@/hooks/useCart';
import { decrementQuantity, incrementQuantity, removeFromCart } from '@/redux/slices/cartSlice';
import CartItem from '@/components/CartItem';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const dispatch = useDispatch();
  const cart = useCart();
  const cartItems = cart?.items || [];
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalPrice = cartItems.reduce((total, item) => total + (item?.price || 0) * (item?.quantity || 0), 0);

  const handleIncrement = (id) => {
    dispatch(incrementQuantity(id));
    toast.success('Quantity updated');
  };

  const handleDecrement = (id) => {
    dispatch(decrementQuantity(id));
    toast.success('Quantity updated');
  };

  const handleRemove = (id, title) => {
    dispatch(removeFromCart(id));
    toast.success(`${title} removed from cart`);
  };

  const shippingCost = totalPrice > 1000 ? 0 : 50;
  const totalWithShipping = totalPrice + shippingCost;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
<motion.div
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  className="mb-10"
>
  {/* Back to Shop */}
  <Link
    href="/shop"
    className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-green-600 transition-all duration-300 mb-6"
  >
    <span className="p-2 rounded-full bg-slate-100 group-hover:bg-green-100 transition">
      <ChevronLeft
        size={16}
        className="group-hover:-translate-x-1 transition-transform duration-300"
      />
    </span>
    Continue Shopping
  </Link>

  {/* Heading Section */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    
    {/* Title */}
    <div>
      <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
        Shopping Cart
      </h1>

      <p className="mt-2 text-slate-500 text-sm md:text-base">
        You have{" "}
        <span className="font-semibold text-green-600">
          {cartItems.length}
        </span>{" "}
        {cartItems.length === 1 ? "item" : "items"} in your cart
      </p>
    </div>

    {/* Badge */}
    <div className="self-start md:self-auto">
      <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold shadow-sm">
        🛒 Active Cart
      </span>
    </div>
  </div>
</motion.div>
        {cartItems.length === 0 ? (
          // Empty Cart State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-4xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50">
              <ShoppingBag size={48} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Your cart is empty</h2>
            <p className="mt-3 text-slate-600">Add sustainable products from the shop to start your order.</p>
            <Link
              href="/shop"
              className="mt-8 inline-flex rounded-full bg-green-600 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white hover:bg-green-700 shadow-lg shadow-green-100 transition-transform hover:scale-105"
            >
              Browse Products
            </Link>
          </motion.div>
        ) : (
          // Cart Items
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-8 lg:grid-cols-[1fr_360px]"
          >
            {/* Cart Items List */}
            <motion.div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item?.id}
                  variants={itemVariants}
                  custom={index}
                >
                  <CartItem
                    item={item}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    onRemove={() => handleRemove(item.id, item.title)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Order Summary Sidebar */}
            <motion.aside
              variants={itemVariants}
              className="sticky top-24 h-fit rounded-4xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-4 border-b border-slate-200 pb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900">{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                    {shippingCost === 0 && (
                      <p className="text-xs text-green-600 mt-1">✓ Free shipping</p>
                    )}
                  </div>
                </div>

                {shippingCost > 0 && (
                  <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                    Add ₹{(1000 - totalPrice).toFixed(2)} more for free shipping!
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between text-lg">
                <span className="font-black text-slate-900">Total</span>
                <span className="text-2xl font-black text-green-600">₹{totalWithShipping.toFixed(2)}</span>
              </div>

              <Link
                href="/user/checkout"
                className="mt-8 block w-full rounded-full bg-green-600 px-5 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-green-100 hover:bg-green-700 transition-all hover:shadow-xl hover:shadow-green-200"
              >
                Proceed to Checkout
              </Link>

              <p className="mt-4 text-center text-xs text-slate-500">Secure & encrypted checkout</p>
            </motion.aside>
          </motion.div>
        )}
      </div>
    </div>
  );
}

