import connectDB from '@/lib/db';
import { processPayment } from '@/services/paymentService';

export default async function handler(req, res) {
  const db = await connectDB();
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { userDetails, cartItems, totalPrice } = req.body;

    // Process payment
    const paymentResult = await processPayment(totalPrice);
    if (!paymentResult.success) {
      return res.status(400).json({ error: 'Payment failed' });
    }

    // Save order details
    const order = await db.order.create({
      data: {
        userId: req.user.id,
        items: cartItems,
        total: totalPrice,
        userDetails,
        paymentStatus: 'Paid',
      },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process checkout' });
  }
}