import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/api-auth';
import Order, { ORDER_STATUS_FLOW } from '@/models/Order';
import { sendOrderStatusEmail } from '@/lib/email';
import { mapOrder } from '@/lib/order-utils';
import mongoose from 'mongoose';

const VALID_STATUSES = ORDER_STATUS_FLOW;

const STATUS_INDEX = VALID_STATUSES.reduce((acc, status, index) => {
  acc[status] = index;
  return acc;
}, {});

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

export async function GET(request, { params }) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return auth.error;
  }

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ success: false, message: 'Invalid order id.' }, { status: 400 });
  }

  await connectDB();

  const baseQuery = { _id: params.id };
  if (auth.user.role === 'user') {
    baseQuery.user = auth.user._id;
  }
  if (auth.user.role === 'seller') {
    baseQuery['items.seller'] = auth.user._id;
  }

  const order = await Order.findOne(baseQuery).populate('user', 'name email role').lean();
  if (!order) {
    return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      order: mapOrder(order, auth.user),
    },
  });
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireRole(request, ['seller', 'admin']);
    if (auth.error) {
      return auth.error;
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, message: 'Invalid order id.' }, { status: 400 });
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
    const emailStatuses = ['confirmed', 'shipped', 'delivered'];
    if (emailStatuses.includes(status) && populatedOrder?.user?.email) {
      sendOrderStatusEmail(populatedOrder, populatedOrder.user, status).catch((e) =>
        console.error('[Order] Status email error:', e.message)
      );
    }

    console.log(`[Order] ${populatedOrder._id} status → ${status} by ${auth.user.role}:${auth.user._id}`);

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
