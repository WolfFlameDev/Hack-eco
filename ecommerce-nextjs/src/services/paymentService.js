// Stripe is optional for development. Install with: npm install stripe
let stripe = null;

try {
  const StripeModule = require('stripe');
  stripe = new StripeModule(process.env.STRIPE_SECRET_KEY);
} catch {
  console.warn('Stripe not installed. Payment processing will use mock mode.');
}

export const processPayment = async (amount) => {
  try {
    if (!stripe) {
      console.log('Processing payment in mock mode:', amount);
      return { success: true, clientSecret: 'mock_secret_' + Date.now() };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: ['card'],
    });

    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error('Payment processing error:', error);
    return { success: false, error: error.message };
  }
};