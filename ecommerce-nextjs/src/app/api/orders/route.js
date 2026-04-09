import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { sendOrderConfirmationEmail } from '@/lib/email';

const mapOrder = (order, currentUser) => {
  const items = order.items
    .filter((item) => {
      if (currentUser?.role !== 'seller') {
        return true;
      }

      return item.seller.toString() === currentUser._id.toString();
    })
    .map((item) => ({
      id: String(item._id),
      productId: String(item.product),
      sellerId: String(item.seller),
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      category: item.category,
      status: item.status,
    }));

  return {
    id: String(order._id),
    userId: String(order.user?._id ?? order.user),
    user: order.user?._id
      ? {
          id: String(order.user._id),
          name: order.user.name,
          email: order.user.email,
        }
      : null,
    items,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt,
    paymentDetails: order.paymentDetails,
  };
};

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return auth.error;
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');

  const query = {};
  if (auth.user.role === 'user' || view === 'user') {
    query.user = auth.user._id;
  } else if (auth.user.role === 'seller' || view === 'seller') {
    query['items.seller'] = auth.user._id;
  }

  const orders = await Order.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    success: true,
    data: {
      orders: orders.map((order) => mapOrder(order, auth.user)),
    },
  });
}

export async function POST(request) {
  const auth = await requireAuth(request);
    sendOrderConfirmationEmail(populatedOrder, auth.user).catch((e) =>
      console.error('Order confirmation email error:', e.message)
    );
  if (auth.error) {
    return auth.error;
  }

  if (auth.user.role !== 'user') {
    return NextResponse.json({ success: false, message: 'Only buyers can place orders.' }, { status: 403 });
  }

  await connectDB();
  const body = await request.json();
  const { orderId, payment = {} } = body;

  if (!orderId) {
    return NextResponse.json({ success: false, message: 'orderId is required.' }, { status: 400 });
  }

  const order = await Order.findOne({ _id: orderId, user: auth.user._id });
  if (!order) {
    return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
  }

  if (order.paymentStatus === 'paid') {
    return NextResponse.json({
      success: true,
      data: mapOrder(order, auth.user),
    });
  }

    const isCOD = order.paymentProvider === 'cod' || payment?.method === 'cod';
    let verification = { valid: true, mode: 'cod' };

    if (!isCOD) {
      verification = verifyPaymentSignature({
        orderId: payment.razorpay_order_id,
        paymentId: payment.razorpay_payment_id,
        signature: payment.razorpay_signature,
      });

      if (!verification.valid && verification.mode !== 'mock') {
        order.paymentStatus = 'failed';
        await order.save();
        return NextResponse.json({ success: false, message: 'Payment verification failed.' }, { status: 400 });
      }
    }

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, message: `Product ${item.title} is no longer available.` },
        { status: 400 }
      );
    }

    if (product.stock < item.quantity) {
      return NextResponse.json(
        { success: false, message: `${item.title} has insufficient stock for this order.` },
        { status: 400 }
      );
    }

    product.stock -= item.quantity;
    await product.save();
  }

  order.paymentStatus = 'paid';
  order.status = 'pending';
  order.paymentDetails = {
    ...order.paymentDetails,
      ...(isCOD
        ? { mode: 'cod' }
        : {
            razorpayOrderId: payment.razorpay_order_id ?? order.paymentDetails?.razorpayOrderId,
            razorpayPaymentId: payment.razorpay_payment_id ?? `mock_payment_${Date.now()}`,
            razorpaySignature: payment.razorpay_signature ?? 'mock_signature',
            mode: verification.mode,
          }),
  };
  await order.save();

  await Cart.findOneAndUpdate({ user: auth.user._id }, { $set: { items: [] } });

  const populatedOrder = await Order.findById(order._id).populate('user', 'name email role');
  return NextResponse.json({
    success: true,
    message: 'Order placed successfully.',
    data: mapOrder(populatedOrder, auth.user),
  });
}
