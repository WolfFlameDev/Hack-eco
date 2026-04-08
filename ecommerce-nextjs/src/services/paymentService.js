export const processPayment = async (amount) => {
  try {
    return {
      success: true,
      clientSecret: 'test_client_secret_' + Math.random().toString(36).slice(2),
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    return { success: false, error: error.message };
  }
};