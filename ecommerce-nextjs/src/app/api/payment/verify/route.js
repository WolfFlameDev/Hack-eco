import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Order from '@/models/Order';
import { finalizeOrderPayment, mapOrder } from '@/lib/order-utils';
import { sendEmail, sendOrderConfirmationEmail } from '@/lib/email';
import { verifyPaymentSignature } from '@/lib/razorpay';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

export async function POST(request) {
  const auth = await requireRole(request, ['user']);
  if (auth.error) {
    return auth.error;
  }

  try {
    await connectDB();
    const body = await request.json();
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'orderId, razorpay_order_id, razorpay_payment_id and razorpay_signature are required.' },
        { status: 400 }
      );
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const order = await Order.findOne(
      isObjectId
        ? { _id: orderId, user: auth.user._id }
        : { 'paymentDetails.razorpayOrderId': orderId, user: auth.user._id }
    );
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    const verification = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!verification.valid && verification.mode !== 'mock') {
      order.paymentStatus = 'failed';
      await order.save();
      return NextResponse.json({ success: false, message: 'Payment verification failed.' }, { status: 400 });
    }

    const populatedOrder = await finalizeOrderPayment({
      order,
      payment: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
      verificationMode: verification.mode,
      isCOD: false,
    });

    sendOrderConfirmationEmail(populatedOrder, auth.user).catch((error) =>
      console.error('Order confirmation email error:', error.message)
    );

    const orderCode = String(populatedOrder._id).slice(-8).toUpperCase();
    sendEmail(
      auth.user.email,
      `Payment Successful #${orderCode} - EcoCommerce`,
      `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafb;padding:24px;border-radius:16px">
          <h2 style="color:#1e293b">Payment Successful</h2>
          <p>Hi <strong>${auth.user.name}</strong>, your payment for order <strong>#${orderCode}</strong> was successful.</p>
          <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
          <p><strong>Status:</strong> Paid</p>
          <p><strong>Total:</strong> Rs ${Number(populatedOrder.totalAmount || 0).toFixed(2)}</p>
        </div>
      `
    ).catch((error) => console.error('Payment success email error:', error.message));

    return NextResponse.json({
      success: true,
      data: {
        ...mapOrder(populatedOrder, auth.user),
        paymentId: razorpay_payment_id,
        status: populatedOrder.paymentStatus,
      },
    });
  } catch (error) {
    console.error('POST /api/payment/verify failed:', error);
    return NextResponse.json({ success: false, message: error.message || 'Payment verification failed.' }, { status: 500 });
  }
}
