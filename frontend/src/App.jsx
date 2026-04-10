import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getMe } from './store/slices/authSlice';

// Layouts
import MainLayout  from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

// Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute     from './components/common/AdminRoute';

// User Pages
import HomePage        from './pages/HomePage';
import ShopPage        from './pages/ShopPage';
import ProductPage     from './pages/ProductPage';
import CartPage        from './pages/CartPage';
import CheckoutPage    from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';
import ProfilePage     from './pages/ProfilePage';
import OrdersPage      from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage    from './pages/WishlistPage';
import NotFoundPage    from './pages/NotFoundPage';

// Admin Pages
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminProducts    from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders      from './pages/admin/AdminOrders';
import AdminUsers       from './pages/admin/AdminUsers';
import AdminCategories  from './pages/admin/AdminCategories';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) dispatch(getMe());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public + User routes */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop"           element={<ShopPage />} />
        <Route path="product/:id"    element={<ProductPage />} />
        <Route path="login"          element={<LoginPage />} />
        <Route path="register"       element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="cart"              element={<CartPage />} />
          <Route path="checkout"          element={<CheckoutPage />} />
          <Route path="order-success/:id" element={<OrderSuccessPage />} />
          <Route path="profile"           element={<ProfilePage />} />
          <Route path="orders"            element={<OrdersPage />} />
          <Route path="orders/:id"        element={<OrderDetailPage />} />
          <Route path="wishlist"          element={<WishlistPage />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index                       element={<AdminDashboard />} />
          <Route path="products"             element={<AdminProducts />} />
          <Route path="products/new"         element={<AdminProductForm />} />
          <Route path="products/edit/:id"    element={<AdminProductForm />} />
          <Route path="orders"               element={<AdminOrders />} />
          <Route path="users"                element={<AdminUsers />} />
          <Route path="categories"           element={<AdminCategories />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
