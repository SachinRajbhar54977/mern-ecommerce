const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName:   String,
  phone:      String,
  street:     String,
  city:       String,
  state:      String,
  postalCode: String,
  country:    String,
});

const statusHistorySchema = new mongoose.Schema({
  status:    String,
  updatedAt: { type: Date, default: Date.now },
  note:      String,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems:      [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod:   {
      type: String,
      enum: ['stripe', 'razorpay', 'cod'],
      required: true,
    },
    paymentResult: {
      id:         String,
      status:     String,
      updateTime: String,
      emailAddress: String,
    },
    coupon: {
      code:     String,
      discount: { type: Number, default: 0 },
    },
    itemsPrice:    { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice:      { type: Number, required: true, default: 0 },
    totalPrice:    { type: Number, required: true, default: 0 },
    isPaid:        { type: Boolean, default: false },
    paidAt:        Date,
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    statusHistory: [statusHistorySchema],
    isDelivered:   { type: Boolean, default: false },
    deliveredAt:   Date,
    deliveryDate:  Date,
    trackingNumber: String,
    notes: String,
  },
  { timestamps: true }
);

// Auto-push to statusHistory on status change
orderSchema.pre('save', function (next) {
  if (this.isModified('orderStatus')) {
    this.statusHistory.push({ status: this.orderStatus });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
