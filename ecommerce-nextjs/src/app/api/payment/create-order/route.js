import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import { createPaymentOrder } from '@/lib/razorpay';
import { createOrderFromCart } from '@/lib/order-utils';

export const runtime = 'nodejs';

export async function POST(request) {
  const auth = await requireRole(request, ['user']);
  if (auth.error) {
    return auth.error;
  }

  try {
    await connectDB();
    const body = await request.json();
    const shippingAddress = body.shippingAddress ?? {};

    const { order, amounts } = await createOrderFromCart({
      userId: auth.user._id,
      shippingAddress,
      method: 'online',
    });

    const paymentOrder = await createPaymentOrder({
      amount: amounts.totalAmount,
      receipt: `eco-${order._id.toString().slice(-10)}`,
      notes: {
        orderId: order._id.toString(),
        userId: auth.user._id.toString(),
      },
    });

    order.paymentDetails = {
      ...order.paymentDetails,
      razorpayOrderId: paymentOrder.id,
      mode: paymentOrder.mode,
    };
    await order.save();

    return NextResponse.json({
      success: true,
      data: {
        orderId: String(order._id),
        paymentId: null,
        status: order.paymentStatus,
        amounts,
        razorpay: paymentOrder,
      },
    });
  } catch (error) {
    console.error('POST /api/payment/create-order failed:', error);
    return NextResponse.json({ success: false, message: error.message || 'Unable to create payment order.' }, { status: 400 });
  }
}
