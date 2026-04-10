const mongoose = require('mongoose');

// ─── Review ──────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title:   { type: String, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update product ratings after save/remove
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      ratings: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, { ratings: 0, numReviews: 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.product);
});
reviewSchema.post('remove', function () {
  this.constructor.calcAverageRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);

// ─── Cart ─────────────────────────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  savedForLater: { type: Boolean, default: false },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);

// ─── Wishlist ─────────────────────────────────────────────────────────────────
const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// ─── Coupon ───────────────────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: 0,
    },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount:    { type: Number },
    usageLimit:     { type: Number, default: 100 },
    usedCount:      { type: Number, default: 0 },
    isActive:       { type: Boolean, default: true },
    expiresAt:      { type: Date, required: true },
    applicableFor:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = { Review, Cart, Wishlist, Coupon };
