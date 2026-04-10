import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MdPeople, MdInventory, MdShoppingBag, MdAttachMoney, MdWarning } from 'react-icons/md';
import api from '../../services/api';
import { Spinner } from '../../components/common/index';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLORS = {
  pending:'bg-yellow-100 text-yellow-700', processing:'bg-blue-100 text-blue-700',
  shipped:'bg-indigo-100 text-indigo-700', delivered:'bg-green-100 text-green-700',
  cancelled:'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!data)   return <p className="text-red-500">Failed to load dashboard</p>;

  const { stats, recentOrders, lowStockProducts, ordersByStatus, monthlySales } = data;
  const chartData = monthlySales?.map((m) => ({
    name: MONTH_NAMES[m._id.month - 1],
    revenue: Math.round(m.revenue),
    orders:  m.orders,
  })) || [];

  const STAT_CARDS = [
    { label: 'Total Users',    value: stats.totalUsers,    Icon: MdPeople,       color: 'text-blue-500',   bg: 'bg-blue-50' },
    { label: 'Total Products', value: stats.totalProducts, Icon: MdInventory,    color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Total Orders',   value: stats.totalOrders,   Icon: MdShoppingBag,  color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Total Revenue',  value: `₹${Math.round(stats.totalRevenue).toLocaleString()}`, Icon: MdAttachMoney, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted">{label}</p>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold text-primary mb-4">Monthly Revenue</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-sm text-center py-16">No sales data yet</p>
          )}
        </div>

        {/* Order Status */}
        <div className="card p-6">
          <h2 className="font-semibold text-primary mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {ordersByStatus?.map(({ _id, count }) => (
              <div key={_id} className="flex items-center justify-between">
                <span className={`badge capitalize ${STATUS_COLORS[_id] || 'bg-gray-100 text-gray-600'}`}>{_id}</span>
                <span className="font-semibold text-primary text-sm">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-primary">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentOrders?.map((order) => (
              <div key={order._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">#{order._id?.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-muted">{order.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-accent">₹{order.totalPrice?.toFixed(0)}</p>
                  <span className={`badge text-[10px] capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100'}`}>{order.orderStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <MdWarning className="text-amber-500" size={18} />
            <h2 className="font-semibold text-primary">Low Stock Alerts</h2>
          </div>
          {lowStockProducts?.length === 0 ? (
            <p className="text-muted text-sm">All products are well stocked ✓</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts?.map((p) => (
                <div key={p._id} className="flex items-center gap-3">
                  <img src={p.images?.[0]?.url} className="w-9 h-9 rounded-lg object-cover bg-surface-alt" />
                  <p className="flex-1 text-sm text-primary line-clamp-1">{p.name}</p>
                  <span className={`badge text-xs ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                    {p.stock === 0 ? 'Out' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
