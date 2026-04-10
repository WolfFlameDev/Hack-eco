'use client';

import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

export default function CheckoutPage() {
  const { cartItems = [], totalPrice = 0, clearCartItems } = useCart();
  const [userDetails, setUserDetails] = useState({
    name: '',
    address: '',
    contact: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    try {
      // Simulate payment processing
      alert('Processing payment...');
      // Clear cart after successful payment
      clearCartItems();
      alert('Payment successful! Order confirmed.');
    } catch (error) {
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">User Details</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={userDetails.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              value={userDetails.address}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact</label>
            <input
              type="text"
              name="contact"
              value={userDetails.contact}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </form>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
        <ul className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <li key={item.id} className="py-4 flex justify-between">
              <span>{item.name} (x{item.quantity})</span>
              <span>${item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between font-bold">
          <span>Total:</span>
          <span>${totalPrice}</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
      >
        Confirm and Pay
      </button>
    </div>
  );
}