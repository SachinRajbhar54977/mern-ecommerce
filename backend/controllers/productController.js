const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const ApiFeatures = require('../utils/apiFeatures');
const { ErrorResponse } = require('../middleware/errorHandler');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all products (with filters, search, pagination)
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const total = await Product.countDocuments();
  const features = new ApiFeatures(
    Product.find().populate('category', 'name slug'),
    req.query
  )
    .search()
    .filter()
    .sort()
    .paginate(12);

  const products = await features.query;
  const filteredCount = products.length;

  res.json({
    success: true,
    total,
    filteredCount,
    page:  features.page,
    limit: features.limit,
    products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate({ path: 'reviews', populate: { path: 'user', select: 'name avatar' } });

  if (!product) throw new ErrorResponse('Product not found', 404);
  res.json({ success: true, product });
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug')
    .populate({ path: 'reviews', populate: { path: 'user', select: 'name avatar' } });

  if (!product) throw new ErrorResponse('Product not found', 404);
  res.json({ success: true, product });
});

// @desc    Get featured / best-seller / new-arrival products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const [featured, bestSellers, newArrivals] = await Promise.all([
    Product.find({ isFeatured: true }).limit(8).populate('category', 'name'),
    Product.find({ isBestSeller: true }).limit(8).populate('category', 'name'),
    Product.find({ isNewArrival: true }).limit(8).populate('category', 'name'),
  ]);
  res.json({ success: true, featured, bestSellers, newArrivals });
});

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  // Images come from multer/cloudinary via req.files
  if (req.files && req.files.length > 0) {
    req.body.images = req.files.map((f) => ({ public_id: f.filename, url: f.path }));
  }
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, message: 'Product created', product });
});

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) throw new ErrorResponse('Product not found', 404);

  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }
    req.body.images = req.files.map((f) => ({ public_id: f.filename, url: f.path }));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: 'Product updated', product });
});

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ErrorResponse('Product not found', 404);

  for (const img of product.images) {
    await cloudinary.uploader.destroy(img.public_id);
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ErrorResponse('Product not found', 404);

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
    .limit(6)
    .populate('category', 'name');

  res.json({ success: true, products: related });
});
