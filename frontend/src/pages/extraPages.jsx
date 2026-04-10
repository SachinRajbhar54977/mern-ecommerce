import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, toggleWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { fetchOrder } from '../store/slices/orderSlice';
import { Spinner } from '../components/common/index';
import { MdDelete, MdShoppingCart } from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── WishlistPage ─────────────────────────────────────────────
export function WishlistPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.wishlist);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  return (
    <div className="container-app py-8 animate-fade-in">
      <h1 className="section-title mb-6">My Wishlist <span className="text-muted text-lg font-sans font-normal">({items.length})</span></h1>
      {items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">💝</p>
          <h2 className="font-display text-2xl font-semibold text-primary mb-2">Wishlist is empty</h2>
          <Link to="/shop" className="btn-accent mt-4 inline-block">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((product) => product?._id && (
            <div key={product._id} className="card-hover group relative">
              <Link to={`/product/${product._id}`} className="block aspect-square overflow-hidden bg-surface-alt rounded-t-xl2">
                <img src={product.images?.[0]?.url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </Link>
              <div className="p-4">
                <p className="text-sm font-medium text-primary line-clamp-2 mb-2">{product.name}</p>
                <p className="font-semibold text-accent">₹{product.finalPrice?.toFixed(0)}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => dispatch(addToCart({ productId: product._id, quantity: 1 }))}
                    className="btn-primary flex-1 py-2 text-xs gap-1.5">
                    <MdShoppingCart size={14} /> Add to Cart
                  </button>
                  <button onClick={() => dispatch(toggleWishlist(product._id))}
                    className="btn-outline p-2 text-red-400 border-red-200 hover:bg-red-50">
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── NotFoundPage ─────────────────────────────────────────────
export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-9xl font-bold text-gray-100">404</p>
      <h1 className="font-display text-3xl font-bold text-primary -mt-4 mb-3">Page Not Found</h1>
      <p className="text-muted mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-accent py-3 px-8">Go Home</Link>
    </div>
  );
}

// ─── ForgotPasswordPage ───────────────────────────────────────
export function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-primary mb-2">Forgot Password</h1>
          <p className="text-muted text-sm mb-6">Enter your email and we'll send you a reset link.</p>
          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
              ✓ Reset link sent to <strong>{email}</strong>. Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="input" placeholder="your@email.com" />
              <button type="submit" disabled={loading} className="btn-accent w-full py-3">
                {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
              </button>
            </form>
          )}
          <Link to="/login" className="block text-center text-sm text-accent mt-4 hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

// ─── ResetPasswordPage ────────────────────────────────────────
export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-primary mb-6">Reset Password</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input" placeholder="New password (min. 6 chars)" />
            <button type="submit" disabled={loading} className="btn-accent w-full py-3">
              {loading ? <Spinner size="sm" /> : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── OrderDetailPage ──────────────────────────────────────────
const STATUS_STEPS  = ['pending', 'processing', 'packed', 'shipped', 'delivered'];
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
};

export function OrderDetailPage() {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id, dispatch]);

  if (loading || !order) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const statusIdx = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="container-app py-8 max-w-3xl animate-fade-in">
      <Link to="/orders" className="btn-ghost text-sm mb-4 inline-flex">← Back to Orders</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Order #{order._id?.slice(-8).toUpperCase()}</h1>
        <span className={`badge capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
          {order.orderStatus}
        </span>
      </div>

      {/* Progress */}
      {order.orderStatus !== 'cancelled' && (
        <div className="card p-5 mb-5">
          <div className="flex items-center">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                  ${i <= statusIdx ? 'bg-accent text-white' : 'bg-gray-200 text-muted'}`}>
                  {i < statusIdx ? '✓' : i + 1}
                </div>
                <div className="flex flex-col items-start ml-1 mr-1">
                  <span className="text-[10px] text-muted capitalize whitespace-nowrap">{s}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-px ${i < statusIdx ? 'bg-accent' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Shipping Address</p>
          <p className="text-sm font-medium text-primary">{order.shippingAddress?.fullName}</p>
          <p className="text-sm text-muted">{order.shippingAddress?.phone}</p>
          <p className="text-sm text-muted mt-1">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
          <p className="text-sm text-muted">{order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Payment</p>
          <p className="text-sm font-medium text-primary capitalize">{order.paymentMethod}</p>
          <span className={`badge text-xs mt-1 ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Pending'}
          </span>
          {order.trackingNumber && (
            <p className="text-xs text-muted mt-2">Tracking: <span className="font-mono">{order.trackingNumber}</span></p>
          )}
        </div>
      </div>

      <div className="card p-5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Items</p>
        {order.orderItems?.map((item) => (
          <div key={item._id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <img src={item.image} className="w-12 h-12 object-cover rounded-lg bg-surface-alt" alt={item.name} />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">{item.name}</p>
              <p className="text-xs text-muted">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold">₹{(item.price * item.quantity).toFixed(0)}</p>
          </div>
        ))}
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          {[['Subtotal', `₹${order.itemsPrice?.toFixed(0)}`],
            ['Shipping', `₹${order.shippingPrice?.toFixed(0)}`],
            ['Tax',      `₹${order.taxPrice?.toFixed(0)}`]
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span className="text-muted">{l}</span><span>{v}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-primary pt-2 border-t border-gray-100">
            <span>Total</span>
            <span className="text-accent">₹{order.totalPrice?.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
