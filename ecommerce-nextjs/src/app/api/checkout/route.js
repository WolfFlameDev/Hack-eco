import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import User from '@/models/User';
import { createPaymentOrder } from '@/lib/razorpay';

void User;

const SHIPPING_THRESHOLD = 1000;
const STANDARD_SHIPPING = 50;

export async function POST(request) {
  const auth = await requireRole(request, ['user']);
  if (auth.error) {
    return auth.error;
  }

  await connectDB();

  const body = await request.json();
  const shippingAddress = body.shippingAddress ?? {};
    const isCOD = body.method === 'cod';

  const cart = await Cart.findOne({ user: auth.user._id }).populate({
    path: 'items.product',
    populate: { path: 'seller', select: 'name email role' },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ success: false, message: 'Your cart is empty.' }, { status: 400 });
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isActive) {
      return NextResponse.json({ success: false, message: 'One of the products is no longer available.' }, { status: 400 });
    }

    if (item.quantity > product.stock) {
      return NextResponse.json(
        { success: false, message: `${product.title} has only ${product.stock} item(s) left in stock.` },
        { status: 400 }
      );
    }

    subtotal += product.price * item.quantity;
    orderItems.push({
      product: product._id,
      seller: product.seller._id ?? product.seller,
      title: product.title,
      price: product.price,
      quantity: item.quantity,
      image: product.images?.[0] ?? '',
      category: product.category,
      status: 'pending',
    });
  }

  const shippingFee = subtotal > SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const totalAmount = subtotal + shippingFee;

  const order = await Order.create({
    user: auth.user._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    shippingFee,
    totalAmount,
    paymentStatus: 'created',
      paymentProvider: isCOD ? 'cod' : 'razorpay',
  });

    let razorpayData = null;
    if (!isCOD) {
      const paymentOrder = await createPaymentOrder({
        amount: totalAmount,
        receipt: `eco-${order._id.toString().slice(-10)}`,
        notes: {
          orderId: order._id.toString(),
          userId: auth.user._id.toString(),
        },
      });
      order.paymentDetails = { razorpayOrderId: paymentOrder.id, mode: paymentOrder.mode };
      razorpayData = paymentOrder;
    } else {
      order.paymentDetails = { mode: 'cod' };
    }
    await order.save();

  return NextResponse.json({
    success: true,
    data: {
      orderId: String(order._id),
      amounts: {
        subtotal,
        shippingFee,
        totalAmount,
      },
        cod: isCOD,
        razorpay: razorpayData,
    },
  });
}
