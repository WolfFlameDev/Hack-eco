import connectDB from '@/lib/db';
import { processPayment } from '@/services/paymentService';
import Order from '@/models/Order';

export default async function handler(req, res) {
  const { method } = req;
  await connectDB();

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { userDetails, cartItems, totalPrice } = req.body;
    const paymentResult = await processPayment(totalPrice);

    if (!paymentResult.success) {
      return res.status(400).json({ error: 'Payment failed' });
    }

    const order = await Order.create({
      userId: req.user?.id,
      items: cartItems,
      total: totalPrice,
      userDetails,
      paymentStatus: 'Paid',
    });

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process checkout' });
  }
}
