# 🛍️ ShopLux — MERN Stack eCommerce Platform

A full-featured, production-ready eCommerce platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js), Tailwind CSS, and Redux Toolkit.

---

## ✨ Features

### Customer Side
- 🏠 **Home Page** — Hero, featured products, best sellers, new arrivals, categories, promo banner
- 🛍️ **Shop Page** — Filters (category, price, rating), search, sort, pagination
- 📦 **Product Detail** — Image gallery, specs, ratings/reviews, related products
- 🛒 **Cart** — Add/update/remove items, quantity control, order summary
- 💳 **Checkout** — 3-step flow (Shipping → Payment → Review), coupon support
- 👤 **Account** — Profile, password change, order history, order tracking
- ❤️ **Wishlist** — Save and manage favourite products
- ⭐ **Reviews** — Verified purchase badge, star ratings

### Admin Panel (`/admin`)
- 📊 **Dashboard** — Revenue chart, order stats, low stock alerts, recent orders
- 📋 **Products** — Full CRUD with image uploads (Cloudinary), discount, stock flags
- 📬 **Orders** — Status management (pending → delivered), paginated table
- 👥 **Users** — Block/unblock, role management
- 🏷️ **Categories** — Add/edit/delete with subcategory support
- 🎟️ **Coupons** — Percentage & fixed discounts, expiry, usage limits

---

## 🏗️ Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Redux Toolkit     |
| Backend    | Node.js, Express.js                             |
| Database   | MongoDB, Mongoose                               |
| Auth       | JWT (cookie + header), bcrypt                   |
| Images     | Cloudinary + Multer                             |
| Payments   | Stripe (Payment Intents)                        |
| Charts     | Recharts                                        |
| Animations | Framer Motion (optional), CSS keyframes         |

---

## 📁 Folder Structure

```
mern-ecommerce/
├── backend/
│   ├── config/          # DB & Cloudinary config
│   ├── controllers/     # authController, productController, shopController, adminController
│   ├── middleware/       # auth.js, errorHandler.js
│   ├── models/          # User, Product, Category, Order, Review, Cart, Wishlist, Coupon
│   ├── routes/          # One file per resource
│   ├── utils/           # generateToken, apiFeatures, seeder
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── common/   # Navbar, Footer, ProductCard, Skeleton, Pagination, Spinner
        │   ├── layout/   # MainLayout, AdminLayout
        │   └── cart/     # CartDrawer
        ├── pages/
        │   ├── admin/    # Dashboard, Products, Orders, Users, Categories
        │   └── ...       # All user pages
        ├── store/
        │   └── slices/   # authSlice, cartSlice, productSlice, orderSlice, wishlistSlice, uiSlice
        ├── services/     # api.js (Axios instance)
        └── App.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)
- Stripe account (for payments)

### 1. Clone & Install

```bash
# Install all dependencies
npm install          # root (installs concurrently)
npm run install:all  # installs backend + frontend deps
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Fill in your MongoDB URI, JWT secret, Cloudinary keys, Stripe key
```

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- **Admin:** `admin@shoplux.com` / `admin123`
- **User:** `user@shoplux.com` / `user123`
- 6 categories, 6 products, 2 coupons

### 4. Run in Development

```bash
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

---

## 🔌 API Reference

| Method | Endpoint                        | Description                  | Auth     |
|--------|---------------------------------|------------------------------|----------|
| POST   | `/api/auth/register`            | Register user                | Public   |
| POST   | `/api/auth/login`               | Login                        | Public   |
| GET    | `/api/auth/me`                  | Get current user             | Private  |
| GET    | `/api/products`                 | List products (with filters) | Public   |
| GET    | `/api/products/featured`        | Featured / bestsellers / new | Public   |
| GET    | `/api/products/:id`             | Single product               | Public   |
| POST   | `/api/products`                 | Create product               | Admin    |
| PUT    | `/api/products/:id`             | Update product               | Admin    |
| DELETE | `/api/products/:id`             | Delete product               | Admin    |
| GET    | `/api/cart`                     | Get cart                     | Private  |
| POST   | `/api/cart`                     | Add to cart                  | Private  |
| PUT    | `/api/cart/:itemId`             | Update quantity              | Private  |
| DELETE | `/api/cart/:itemId`             | Remove item                  | Private  |
| POST   | `/api/orders`                   | Place order                  | Private  |
| GET    | `/api/orders/mine`              | My orders                    | Private  |
| GET    | `/api/admin/dashboard`          | Dashboard stats              | Admin    |
| GET    | `/api/admin/orders`             | All orders                   | Admin    |
| PUT    | `/api/admin/orders/:id/status`  | Update order status          | Admin    |
| GET    | `/api/admin/users`              | All users                    | Admin    |

---

## 🎟️ Coupon Codes (Seeded)

| Code        | Type       | Value | Min Order |
|-------------|------------|-------|-----------|
| `WELCOME20` | 20% off    | 20%   | ₹500      |
| `FLAT100`   | Fixed      | ₹100  | ₹1,000    |

---

## 🚢 Deployment

### Backend (Railway / Render / EC2)
1. Set all env variables in the dashboard
2. `npm start` runs `node server.js`

### Frontend (Vercel / Netlify)
1. Build: `cd frontend && npm run build`
2. Set `VITE_API_URL` if deploying backend separately
3. Update `vite.config.js` proxy or point Axios base URL

---

## 📸 Design System

| Token          | Value              |
|----------------|--------------------|
| Primary color  | `#0f172a` (ink)    |
| Accent color   | `#f97316` (orange) |
| Display font   | Playfair Display   |
| Body font      | DM Sans            |
| Border radius  | `0.75rem` (xl)     |
| Shadow card    | soft 6px blur      |

---

## 📝 License

MIT — free to use for personal and commercial projects.
