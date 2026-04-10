import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/common/index';

const STATUS_OPTIONS = ['pending','processing','packed','shipped','delivered','cancelled','refunded'];
const STATUS_COLORS  = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  packed:     'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-600',
};

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [updating, setUpdating] = useState(null);
  const LIMIT = 20;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/admin/orders?page=${page}&limit=${LIMIT}`);
      setOrders(r.data.orders);
      setTotal(r.data.total);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page]);

  const handleStatusChange = async (orderId, orderStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { orderStatus });
      toast.success('Order status updated');
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? { ...o, orderStatus } : o)
      );
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">
          Orders <span className="text-muted text-lg font-sans font-normal">({total})</span>
        </h1>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt">
              <tr>
                {['Order ID','Customer','Date','Items','Total','Payment','Status','Action'].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted">No orders found</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-surface-alt/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-primary font-semibold">
                        #{order._id?.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-primary">{order.user?.name}</p>
                      <p className="text-xs text-muted">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-muted text-center">
                      {order.orderItems?.length}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-accent">₹{order.totalPrice?.toFixed(0)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`badge text-xs ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`badge capitalize text-xs ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {updating === order._id ? (
                        <Spinner size="sm" />
                      ) : (
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-accent"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-muted">
              Page {page} of {totalPages} · {total} orders
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline py-1.5 px-3 text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-outline py-1.5 px-3 text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
