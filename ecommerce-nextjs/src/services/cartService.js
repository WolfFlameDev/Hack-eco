import axios from 'axios';

export const addToCart = async (productId, quantity) => {
  try {
    const response = await axios.post('/api/cart', { productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const fetchCart = async () => {
  try {
    const response = await axios.get('/api/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const updateCartItem = async (id, quantity) => {
  try {
    const response = await axios.put('/api/cart', { id, quantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeCartItem = async (id) => {
  try {
    await axios.delete('/api/cart', { data: { id } });
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
};

export const checkout = async (userDetails, cartItems, totalPrice) => {
  try {
    const response = await axios.post('/api/checkout', { userDetails, cartItems, totalPrice });
    return response.data;
  } catch (error) {
    console.error('Error during checkout:', error);
    throw error;
  }
};