const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { Review, Coupon } = require('../models/index');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    salesData,
    recentOrders,
    lowStockProducts,
    ordersByStatus,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }]),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Product.find({ stock: { $lte: 5 } }).select('name stock images').limit(10),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
  ]);

  // Monthly sales for chart (last 6 months)
  const monthlySales = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders:  { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: salesData[0]?.totalRevenue || 0,
    },
    recentOrders,
    lowStockProducts,
    ordersByStatus,
    monthlySales: monthlySales.reverse(),
  });
});

// @desc    Get all orders (Admin)
exports.getAllOrders = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip  = (page - 1) * limit;

  const orders = await Order.find()
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email');
  const total = await Order.countDocuments();

  res.json({ success: true, total, page, orders });
});

// @desc    Update order status (Admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, note, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ErrorResponse('Order not found', 404);

  order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (orderStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  await order.save();
  res.json({ success: true, message: 'Order status updated', order });
});

// @desc    Get all users (Admin)
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, users });
});

// @desc    Update user role / block (Admin)
exports.updateUser = asyncHandler(async (req, res) => {
  const { role, isBlocked } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, isBlocked },
    { new: true }
  );
  if (!user) throw new ErrorResponse('User not found', 404);
  res.json({ success: true, message: 'User updated', user });
});

// @desc    Delete user (Admin)
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ErrorResponse('User not found', 404);
  res.json({ success: true, message: 'User deleted' });
});

// @desc    Coupon management
exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, coupons });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});

exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    expiresAt: { $gt: Date.now() },
  });

  if (!coupon || coupon.usedCount >= coupon.usageLimit) {
    throw new ErrorResponse('Invalid or expired coupon', 400);
  }
  if (orderAmount < coupon.minOrderAmount) {
    throw new ErrorResponse(`Minimum order amount is ₹${coupon.minOrderAmount}`, 400);
  }

  const discount = coupon.discountType === 'percentage'
    ? Math.min((orderAmount * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
    : coupon.discountValue;

  res.json({ success: true, coupon, discount });
});
