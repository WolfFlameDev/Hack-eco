import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Order, { ORDER_STATUS_FLOW } from '@/models/Order';
import { sendOrderStatusEmail } from '@/lib/email';

const VALID_STATUSES = ORDER_STATUS_FLOW;

const STATUS_INDEX = VALID_STATUSES.reduce((acc, status, index) => {
  acc[status] = index;
  return acc;
}, {});

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
    orderId: String(order._id),
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
    trackingDetails: order.trackingDetails ?? {},
    statusTimeline: order.statusTimeline ?? {},
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paymentDetails: order.paymentDetails,
  };
};

function isValidTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) {
    return true;
  }
  return STATUS_INDEX[nextStatus] === STATUS_INDEX[currentStatus] + 1;
}

function applyTimeline(order, status) {
  const now = new Date();
  const timeline = {
    ...(order.statusTimeline || {}),
  };

  if (STATUS_INDEX[status] >= STATUS_INDEX.confirmed && !timeline.confirmedAt) {
    timeline.confirmedAt = now;
  }
  if (STATUS_INDEX[status] >= STATUS_INDEX.processing && !timeline.processingAt) {
    timeline.processingAt = now;
  }
  if (STATUS_INDEX[status] >= STATUS_INDEX.shipped && !timeline.shippedAt) {
    timeline.shippedAt = now;
  }
  if (STATUS_INDEX[status] >= STATUS_INDEX.delivered && !timeline.deliveredAt) {
    timeline.deliveredAt = now;
  }

  order.statusTimeline = timeline;
}

function recomputeOrderStatus(order) {
  if (!order.items?.length) {
    return order.status;
  }

  const minIndex = Math.min(...order.items.map((entry) => STATUS_INDEX[entry.status] ?? 0));
  return VALID_STATUSES[minIndex];
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireRole(request, ['seller', 'admin']);
    if (auth.error) {
      return auth.error;
    }

    await connectDB();

    const body = await request.json();
    const { status, itemId, trackingDetails = {} } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid order status.' }, { status: 400 });
    }

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    if (auth.user.role === 'seller') {
      if (!itemId) {
        return NextResponse.json({ success: false, message: 'itemId is required for seller updates.' }, { status: 400 });
      }

      const item = order.items.id(itemId);
      if (!item || item.seller.toString() !== auth.user._id.toString()) {
        return NextResponse.json({ success: false, message: 'You cannot update this order item.' }, { status: 403 });
      }

      if (!isValidTransition(item.status, status)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid status transition. Allowed: ${item.status} -> ${VALID_STATUSES[STATUS_INDEX[item.status] + 1] ?? item.status}.`,
          },
          { status: 400 }
        );
      }

      item.status = status;
      order.status = recomputeOrderStatus(order);
    } else {
      if (!isValidTransition(order.status, status)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid status transition. Allowed: ${order.status} -> ${VALID_STATUSES[STATUS_INDEX[order.status] + 1] ?? order.status}.`,
          },
          { status: 400 }
        );
      }

      order.status = status;
      order.items.forEach((item) => {
        item.status = status;
      });
    }

    applyTimeline(order, order.status);

    if (status === 'shipped') {
      const now = new Date();
      const existing = order.trackingDetails || {};
      order.trackingDetails = {
        ...existing,
        carrier: trackingDetails.carrier ?? existing.carrier ?? '',
        trackingNumber: trackingDetails.trackingNumber ?? existing.trackingNumber ?? '',
        trackingUrl: trackingDetails.trackingUrl ?? existing.trackingUrl ?? '',
        notes: trackingDetails.notes ?? existing.notes ?? '',
        estimatedDelivery:
          trackingDetails.estimatedDelivery
            ? new Date(trackingDetails.estimatedDelivery)
            : existing.estimatedDelivery || new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        shippedAt: existing.shippedAt || now,
        lastUpdatedAt: now,
      };
    }

    if (status === 'delivered') {
      order.trackingDetails = {
        ...(order.trackingDetails || {}),
        lastUpdatedAt: new Date(),
      };
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
    if (status === 'shipped' && populatedOrder?.user?.email) {
      sendOrderStatusEmail(populatedOrder, populatedOrder.user, order.status).catch((e) =>
        console.error('Order status email error:', e.message)
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully.',
      data: {
        order: mapOrder(populatedOrder, auth.user),
        orderId: String(populatedOrder._id),
        status: populatedOrder.status,
        trackingDetails: populatedOrder.trackingDetails ?? {},
      },
    });
  } catch (error) {
    console.error('PATCH /api/orders/[id] failed:', error);
    return NextResponse.json({ success: false, message: 'Failed to update order status.' }, { status: 500 });
  }
}
