// ─── OrderSuccessPage.jsx ────────────────────────────────────
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../store/slices/orderSlice';
import { MdCheckCircle, MdArrowForward } from 'react-icons/md';
import { Spinner } from '../components/common/index';

export function OrderSuccessPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id, dispatch]);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="container-app py-16 max-w-lg mx-auto text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <MdCheckCircle size={44} className="text-green-500" />
      </div>
      <h1 className="font-display text-3xl font-bold text-primary mb-3">Order Placed!</h1>
      <p className="text-muted mb-2">Thank you for your order. We'll send you a confirmation soon.</p>
      {order && <p className="text-sm font-mono text-accent mb-8">Order ID: #{order._id?.slice(-8).toUpperCase()}</p>}
      <div className="card p-5 text-left mb-6">
        <p className="text-sm font-semibold text-primary mb-3">Order Summary</p>
        {order?.orderItems?.map((item) => (
          <div key={item._id} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-primary/80">{item.name} × {item.quantity}</span>
            <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-bold text-primary mt-3 pt-3 border-t border-gray-100">
          <span>Total</span>
          <span className="text-accent">₹{order?.totalPrice?.toFixed(0)}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/orders" className="btn-primary py-3 px-6">Track Order</Link>
        <Link to="/shop" className="btn-outline py-3 px-6 flex items-center gap-2">Continue Shopping <MdArrowForward size={16} /></Link>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
