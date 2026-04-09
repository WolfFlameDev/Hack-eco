import crypto from 'crypto';

const RAZORPAY_ORDERS_URL = 'https://api.razorpay.com/v1/orders';

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return { keyId, keySecret };
};

export async function createPaymentOrder({ amount, receipt, notes }) {
  const razorpay = getRazorpayConfig();
  const normalizedAmount = Math.round(Number(amount) * 100);

  if (!razorpay) {
    return {
      id: `mock_order_${Date.now()}`,
      amount: normalizedAmount,
      currency: 'INR',
      receipt,
      notes,
      mode: 'mock',
      key: 'mock_key',
    };
  }

  const authHeader = Buffer.from(`${razorpay.keyId}:${razorpay.keySecret}`).toString('base64');
  const response = await fetch(RAZORPAY_ORDERS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: normalizedAmount,
      currency: 'INR',
      receipt,
      notes,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to create Razorpay order: ${errorBody}`);
  }

  const data = await response.json();
  return {
    ...data,
    mode: 'test',
    key: razorpay.keyId,
  };
}

export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const razorpay = getRazorpayConfig();

  if (!razorpay) {
    return { valid: true, mode: 'mock' };
  }

  const expected = crypto
    .createHmac('sha256', razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return {
    valid: expected === signature,
    mode: 'test',
  };
}
