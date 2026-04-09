import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Order from '@/models/Order';
import { sendOrderStatusEmail } from '@/lib/email';

const VALID_STATUSES = ['pending', 'shipped', 'delivered'];

export async function PATCH(request, { params }) {
  const auth = await requireRole(request, ['seller', 'admin']);
  if (auth.error) {
    return auth.error;
  }

  await connectDB();

  const body = await request.json();
  const { status, itemId } = body;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, message: 'Invalid order status.' }, { status: 400 });
  }

  const order = await Order.findById(params.id);
  if (!order) {
    return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
  }

  if (auth.user.role === 'seller') {
    const item = order.items.id(itemId);
    if (!item || item.seller.toString() !== auth.user._id.toString()) {
      return NextResponse.json({ success: false, message: 'You cannot update this order item.' }, { status: 403 });
    }

    item.status = status;
    order.status = order.items.every((entry) => entry.status === 'delivered')
      ? 'delivered'
      : order.items.some((entry) => entry.status === 'shipped' || entry.status === 'delivered')
        ? 'shipped'
        : 'pending';
  } else {
    order.status = status;
    order.items.forEach((item) => {
      item.status = status;
    });
  }

  await order.save();

  const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
  if (populatedOrder?.user?.email) {
    sendOrderStatusEmail(populatedOrder, populatedOrder.user, order.status).catch((e) =>
      console.error('Order status email error:', e.message)
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Order status updated successfully.',
  });
}
