const asyncHandler = require('express-async-handler');
const { Cart, Review, Wishlist, Coupon } = require('../models/index');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { ErrorResponse } = require('../middleware/errorHandler');

// ═══════════════════════════════════════════════════════════════
// CART CONTROLLER
// ═══════════════════════════════════════════════════════════════

exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images finalPrice stock');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json({ success: true, cart });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ErrorResponse('Product not found', 404);
  if (product.stock < quantity) throw new ErrorResponse('Insufficient stock', 400);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existingItem = cart.items.find((i) => i.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + quantity, product.stock);
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate('items.product', 'name images finalPrice stock');
  res.json({ success: true, message: 'Added to cart', cart });
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ErrorResponse('Cart not found', 404);

  const item = cart.items.id(req.params.itemId);
  if (!item) throw new ErrorResponse('Item not in cart', 404);

  if (quantity <= 0) {
    cart.items.pull(req.params.itemId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name images finalPrice stock');
  res.json({ success: true, cart });
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ErrorResponse('Cart not found', 404);
  cart.items.pull(req.params.itemId);
  await cart.save();
  res.json({ success: true, message: 'Item removed from cart' });
});

exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
});

// ═══════════════════════════════════════════════════════════════
// ORDER CONTROLLER
// ═══════════════════════════════════════════════════════════════

exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new ErrorResponse('Cart is empty', 400);

  // Verify stock
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new ErrorResponse(`Insufficient stock for ${item.product.name}`, 400);
    }
  }

  let discount = 0;
  let couponInfo = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiresAt: { $gt: Date.now() } });
    if (coupon && coupon.usedCount < coupon.usageLimit) {
      const itemsTotal = cart.items.reduce((acc, i) => acc + i.product.finalPrice * i.quantity, 0);
      if (itemsTotal >= coupon.minOrderAmount) {
        discount = coupon.discountType === 'percentage'
          ? Math.min((itemsTotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
          : coupon.discountValue;
        couponInfo = { code: coupon.code, discount };
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
  }

  const orderItems = cart.items.map((i) => ({
    product:  i.product._id,
    name:     i.product.name,
    image:    i.product.images[0]?.url || '',
    price:    i.product.finalPrice,
    quantity: i.quantity,
  }));

  const itemsPrice    = orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingPrice = itemsPrice > 500 ? 0 : 49;
  const taxPrice      = Math.round(itemsPrice * 0.18 * 100) / 100; // 18% GST
  const totalPrice    = itemsPrice + shippingPrice + taxPrice - discount;

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    coupon: couponInfo,
  });

  // Reduce stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json({ success: true, message: 'Order placed successfully', order });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('orderItems.product', 'name images');
  res.json({ success: true, orders });
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new ErrorResponse('Order not found', 404);
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ErrorResponse('Not authorized', 403);
  }
  res.json({ success: true, order });
});

// ═══════════════════════════════════════════════════════════════
// REVIEW CONTROLLER
// ═══════════════════════════════════════════════════════════════

exports.createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) throw new ErrorResponse('Product not found', 404);

  const alreadyReviewed = await Review.findOne({ user: req.user._id, product: req.params.productId });
  if (alreadyReviewed) throw new ErrorResponse('You have already reviewed this product', 400);

  // Check if verified purchase
  const order = await Order.findOne({
    user: req.user._id,
    'orderItems.product': req.params.productId,
    orderStatus: 'delivered',
  });

  const review = await Review.create({
    user: req.user._id,
    product: req.params.productId,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!order,
  });

  res.status(201).json({ success: true, message: 'Review added', review });
});

exports.getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.json({ success: true, reviews });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ErrorResponse('Review not found', 404);
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ErrorResponse('Not authorized', 403);
  }
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
});

// ═══════════════════════════════════════════════════════════════
// WISHLIST CONTROLLER
// ═══════════════════════════════════════════════════════════════

exports.getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name images finalPrice ratings');
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  res.json({ success: true, wishlist });
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

  const exists = wishlist.products.includes(productId);
  if (exists) {
    wishlist.products.pull(productId);
  } else {
    wishlist.products.push(productId);
  }
  await wishlist.save();
  res.json({ success: true, added: !exists, message: exists ? 'Removed from wishlist' : 'Added to wishlist' });
});
