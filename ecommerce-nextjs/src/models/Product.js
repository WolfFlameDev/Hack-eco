import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
  },
  images: [{
    type: String,
    default: [],
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required'],
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  sustainability: {
    ecoFriendly: { type: Boolean, default: false },
    recyclable: { type: Boolean, default: false },
    organic: { type: Boolean, default: false },
    carbonFootprint: { type: String, default: '' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;