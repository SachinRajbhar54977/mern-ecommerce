// ─── OrdersPage.jsx ──────────────────────────────────────────
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../store/slices/orderSlice';
import { Spinner } from '../components/common/index';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  packed:     'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-700',
};

export function OrdersPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="container-app py-8 animate-fade-in">
      <h1 className="section-title mb-6">My Orders</h1>

      {list.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">📦</p>
          <h2 className="font-display text-2xl font-semibold text-primary mb-2">No orders yet</h2>
          <Link to="/shop" className="btn-accent mt-4">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((order) => (
            <div key={order._id} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-sm font-mono text-primary font-semibold">#{order._id?.slice(-8).toUpperCase()}</p>
                  <span className={`badge text-xs ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'} capitalize`}>
                    {order.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p className="text-sm text-primary/70 mt-1">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-accent text-lg">₹{order.totalPrice?.toFixed(0)}</p>
                <Link to={`/orders/${order._id}`} className="text-xs text-primary/60 hover:text-accent mt-1 block">View Details →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
