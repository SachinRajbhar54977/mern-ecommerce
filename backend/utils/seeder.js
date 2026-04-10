const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const bcrypt   = require('bcryptjs');
dotenv.config();

const User     = require('../models/User');
const Product  = require('../models/Product');
const Category = require('../models/Category');
const { Coupon } = require('../models/index');

const connectDB = require('../config/db');

const CATEGORIES = [
  { name: 'Electronics',  description: 'Gadgets and devices' },
  { name: 'Fashion',      description: 'Clothing and accessories' },
  { name: 'Home & Living',description: 'Furniture and decor' },
  { name: 'Beauty',       description: 'Skincare and cosmetics' },
  { name: 'Sports',       description: 'Equipment and gear' },
  { name: 'Books',        description: 'Fiction and non-fiction' },
];

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  // Create categories
  const cats = await Category.insertMany(CATEGORIES);
  console.log(`✅ ${cats.length} categories created`);

  // Create admin + test user
  // const adminPass = await bcrypt.hash('admin123', 12);
  // const userPass  = await bcrypt.hash('user123',  12);

  // await User.insertMany([
  //   { name: 'Admin User',  email: 'admin@shoplux.com', password: adminPass, role: 'admin'  },
  //   { name: 'Test User',   email: 'user@shoplux.com',  password: userPass,  role: 'user'   },
  // ]);
  const admin = new User({ email: 'admin@shoplux.com', password: 'admin123' }); // plaintext
  const user = new User({ email: 'user@shoplux.com', password: 'user123' }); // plaintext
  await admin.save(); // pre-save hook runs → bcrypt hashes it correctly
  await user.save(); // pre-save hook runs → bcrypt hashes it correctly
  console.log('✅ 2 users created');

  // Create sample products
  const electronicsId = cats.find((c) => c.name === 'Electronics')?._id;
  const fashionId     = cats.find((c) => c.name === 'Fashion')?._id;
  const homeId        = cats.find((c) => c.name === 'Home & Living')?._id;

  const PRODUCTS = [
    {
      name: 'Premium Wireless Headphones',
      description: 'High-quality over-ear headphones with active noise cancellation, 30-hour battery life, and premium sound quality.',
      brand: 'SoundPro', category: electronicsId, price: 8999, discountPercent: 20,
      finalPrice: 7199.2, stock: 50,
      images: [{ public_id: 'sample', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' }],
      isFeatured: true, isBestSeller: true, ratings: 4.5, numReviews: 128,
    },
    {
      name: 'Smart Watch Series 5',
      description: 'Advanced smartwatch with health monitoring, GPS, and 5-day battery life.',
      brand: 'TechWear', category: electronicsId, price: 12999, discountPercent: 15,
      finalPrice: 11049.15, stock: 30,
      images: [{ public_id: 'sample2', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' }],
      isFeatured: true, isNewArrival: true, ratings: 4.3, numReviews: 89,
    },
    {
      name: 'Slim Fit Cotton T-Shirt',
      description: 'Premium 100% organic cotton slim fit t-shirt. Soft, breathable, and stylish.',
      brand: 'StyleCo', category: fashionId, price: 799, discountPercent: 10,
      finalPrice: 719.1, stock: 200,
      images: [{ public_id: 'sample3', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' }],
      isBestSeller: true, ratings: 4.2, numReviews: 342,
    },
    {
      name: 'Minimalist Desk Lamp',
      description: 'LED desk lamp with adjustable color temperature and brightness, USB charging port.',
      brand: 'LightUp', category: homeId, price: 2499, discountPercent: 25,
      finalPrice: 1874.25, stock: 75,
      images: [{ public_id: 'sample4', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600' }],
      isFeatured: true, isNewArrival: true, ratings: 4.6, numReviews: 67,
    },
    {
      name: 'Mechanical Keyboard',
      description: 'TKL mechanical keyboard with blue switches, RGB backlight, and aluminum frame.',
      brand: 'KeyMaster', category: electronicsId, price: 5499, discountPercent: 0,
      finalPrice: 5499, stock: 40,
      images: [{ public_id: 'sample5', url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600' }],
      isNewArrival: true, ratings: 4.7, numReviews: 203,
    },
    {
      name: 'Yoga Mat Premium',
      description: 'Non-slip 6mm thick yoga mat with alignment lines. Eco-friendly TPE material.',
      brand: 'ZenFit', category: cats.find((c) => c.name === 'Sports')?._id,
      price: 1599, discountPercent: 5, finalPrice: 1519.05, stock: 120,
      images: [{ public_id: 'sample6', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600' }],
      isBestSeller: true, ratings: 4.4, numReviews: 156,
    },
  ];

  await Product.insertMany(PRODUCTS);
  console.log(`✅ ${PRODUCTS.length} products created`);

  // Coupons
  await Coupon.insertMany([
    {
      code: 'WELCOME20', discountType: 'percentage', discountValue: 20,
      minOrderAmount: 500, maxDiscount: 500, usageLimit: 1000,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'FLAT100', discountType: 'fixed', discountValue: 100,
      minOrderAmount: 1000, usageLimit: 500,
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log('✅ 2 coupons created');

  console.log('\n🎉 Seeding complete!');
  console.log('──────────────────────────────');
  console.log('Admin:  admin@shoplux.com / admin123');
  console.log('User:   user@shoplux.com  / user123');
  console.log('──────────────────────────────');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
