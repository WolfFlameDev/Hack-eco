import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered'],
      default: 'pending',
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    shippingAddress: {
      name: String,
      email: String,
      address: String,
      city: String,
      state: String,
      postalCode: String,
      contact: String,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created',
    },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered'],
      default: 'pending',
    },
    paymentProvider: {
      type: String,
      default: 'razorpay',
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      mode: {
        type: String,
        enum: ['live', 'test', 'mock'],
        default: 'mock',
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
