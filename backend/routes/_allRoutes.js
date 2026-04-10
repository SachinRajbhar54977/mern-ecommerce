// ─── categoryRoutes.js ───────────────────────────────────────
const express = require('express');
const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');
const { ErrorResponse } = require('../middleware/errorHandler');
const catRouter = express.Router();

catRouter.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).populate('parent', 'name');
  res.json({ success: true, categories });
}));
catRouter.post('/', protect, admin, asyncHandler(async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json({ success: true, category: cat });
}));
catRouter.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, category: cat });
}));
catRouter.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
}));

// ─── cartRoutes.js ───────────────────────────────────────────
const cartRouter = express.Router();
const {
  getCart, addToCart, updateCartItem, removeFromCart, clearCart,
} = require('../controllers/shopController');
cartRouter.use(protect);
cartRouter.get('/',              getCart);
cartRouter.post('/',             addToCart);
cartRouter.put('/:itemId',       updateCartItem);
cartRouter.delete('/:itemId',    removeFromCart);
cartRouter.delete('/',           clearCart);

// ─── orderRoutes.js ──────────────────────────────────────────
const orderRouter = express.Router();
const { createOrder, getMyOrders, getOrderById } = require('../controllers/shopController');
orderRouter.use(protect);
orderRouter.post('/',      createOrder);
orderRouter.get('/mine',   getMyOrders);
orderRouter.get('/:id',    getOrderById);

// ─── reviewRoutes.js ─────────────────────────────────────────
const reviewRouter = express.Router();
const { createReview, getProductReviews, deleteReview } = require('../controllers/shopController');
reviewRouter.get('/:productId',         getProductReviews);
reviewRouter.post('/:productId', protect, createReview);
reviewRouter.delete('/:id',      protect, deleteReview);

// ─── wishlistRoutes.js ───────────────────────────────────────
const wishlistRouter = express.Router();
const { getWishlist, toggleWishlist } = require('../controllers/shopController');
wishlistRouter.use(protect);
wishlistRouter.get('/',    getWishlist);
wishlistRouter.post('/',   toggleWishlist);

// ─── couponRoutes.js ─────────────────────────────────────────
const couponRouter = express.Router();
const { validateCoupon, createCoupon, getCoupons, deleteCoupon } = require('../controllers/adminController');
couponRouter.post('/validate',        protect, validateCoupon);
couponRouter.get('/',                 protect, admin, getCoupons);
couponRouter.post('/',                protect, admin, createCoupon);
couponRouter.delete('/:id',           protect, admin, deleteCoupon);

// ─── adminRoutes.js ──────────────────────────────────────────
const adminRouter = express.Router();
const {
  getDashboardStats, getAllOrders, updateOrderStatus,
  getAllUsers, updateUser, deleteUser,
} = require('../controllers/adminController');
adminRouter.use(protect, admin);
adminRouter.get('/dashboard',            getDashboardStats);
adminRouter.get('/orders',               getAllOrders);
adminRouter.put('/orders/:id/status',    updateOrderStatus);
adminRouter.get('/users',                getAllUsers);
adminRouter.put('/users/:id',            updateUser);
adminRouter.delete('/users/:id',         deleteUser);

// ─── paymentRoutes.js ────────────────────────────────────────
const paymentRouter = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncH  = require('express-async-handler');

paymentRouter.post('/create-payment-intent', protect, asyncH(async (req, res) => {
  const { amount } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // paise
    currency: 'inr',
    metadata: { userId: req.user._id.toString() },
  });
  res.json({ success: true, clientSecret: paymentIntent.client_secret });
}));

module.exports = {
  catRouter, cartRouter, orderRouter, reviewRouter,
  wishlistRouter, couponRouter, adminRouter, paymentRouter,
};
