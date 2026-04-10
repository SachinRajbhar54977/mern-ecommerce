// CartPage.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCart, removeFromCart, clearCart } from '../store/slices/cartSlice';
import { MdAdd, MdRemove, MdDelete, MdShoppingBag, MdArrowForward } from 'react-icons/md';

export function CartPage() {
  const dispatch   = useDispatch();
  const { items, loading } = useSelector((s) => s.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const subtotal     = items.reduce((a, i) => a + (i.product?.finalPrice || 0) * i.quantity, 0);
  const shipping     = subtotal > 500 ? 0 : 49;
  const tax          = Math.round(subtotal * 0.18);
  const total        = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="container-app py-24 flex flex-col items-center text-center">
        <MdShoppingBag size={64} className="text-gray-200 mb-4" />
        <h2 className="font-display text-2xl font-semibold text-primary mb-2">Your cart is empty</h2>
        <p className="text-muted mb-6">Add some products and come back!</p>
        <Link to="/shop" className="btn-accent">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8 animate-fade-in">
      <h1 className="section-title mb-6">Shopping Cart <span className="text-muted text-lg font-sans font-normal">({items.length} items)</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const p = item.product;
            const price = p?.finalPrice || p?.price || 0;
            return (
              <div key={item._id} className="card p-5 flex gap-4">
                <Link to={`/product/${p?._id}`}>
                  <img src={p?.images?.[0]?.url || 'https://placehold.co/100'} alt={p?.name}
                    className="w-24 h-24 object-cover rounded-xl bg-surface-alt flex-shrink-0" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${p?._id}`} className="text-sm font-medium text-primary hover:text-accent transition-colors line-clamp-2">
                    {p?.name}
                  </Link>
                  <p className="text-accent font-semibold mt-1">₹{price.toFixed(0)}</p>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => dispatch(updateCart({ itemId: item._id, quantity: item.quantity - 1 }))}
                        className="px-3 py-1.5 hover:bg-surface-dark transition-colors">
                        <MdRemove size={16} />
                      </button>
                      <span className="px-4 py-1.5 text-sm font-medium border-x border-gray-200">{item.quantity}</span>
                      <button onClick={() => dispatch(updateCart({ itemId: item._id, quantity: item.quantity + 1 }))}
                        className="px-3 py-1.5 hover:bg-surface-dark transition-colors">
                        <MdAdd size={16} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-primary">₹{(price * item.quantity).toFixed(0)}</span>
                    <button onClick={() => dispatch(removeFromCart(item._id))} className="ml-auto text-red-400 hover:text-red-600 p-1">
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={() => dispatch(clearCart())} className="btn-outline text-sm py-2 px-4 text-red-500 border-red-200 hover:bg-red-50">
            Clear Cart
          </button>
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-semibold text-primary text-lg mb-5">Order Summary</h2>
          <div className="space-y-3 mb-5">
            {[['Subtotal', `₹${subtotal.toFixed(0)}`],
              ['Shipping', shipping === 0 ? 'Free' : `₹${shipping}`],
              ['GST (18%)', `₹${tax.toFixed(0)}`]].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted">{label}</span>
                <span className="font-medium text-primary">{val}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 flex justify-between font-semibold text-primary mb-6">
            <span>Total</span>
            <span className="text-accent text-lg">₹{total.toFixed(0)}</span>
          </div>
          <Link to="/checkout" className="btn-accent w-full py-3.5 text-center block flex items-center justify-center gap-2">
            Proceed to Checkout <MdArrowForward size={18} />
          </Link>
          <Link to="/shop" className="btn-ghost w-full mt-3 text-center py-2.5 text-sm">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
