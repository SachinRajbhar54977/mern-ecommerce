import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { closeCartDrawer } from '../../store/slices/uiSlice';
import { updateCart, removeFromCart } from '../../store/slices/cartSlice';
import { MdClose, MdAdd, MdRemove, MdDelete, MdShoppingBag } from 'react-icons/md';

export default function CartDrawer() {
  const dispatch    = useDispatch();
  const { cartDrawerOpen } = useSelector((s) => s.ui);
  const cartItems   = useSelector((s) => s.cart.items);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.finalPrice ?? item.product?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);

  if (!cartDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => dispatch(closeCartDrawer())}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-display text-lg font-semibold text-primary">
            Cart <span className="text-sm font-sans text-muted ml-1">({cartItems.length} items)</span>
          </h2>
          <button onClick={() => dispatch(closeCartDrawer())} className="btn-ghost p-1.5 rounded-lg">
            <MdClose size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MdShoppingBag size={48} className="text-gray-200 mb-3" />
              <p className="text-muted font-medium">Your cart is empty</p>
              <Link
                to="/shop"
                onClick={() => dispatch(closeCartDrawer())}
                className="btn-accent mt-4 py-2.5 px-5 text-sm"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            cartItems.map((item) => {
              const product = item.product;
              const price   = product?.finalPrice ?? product?.price ?? 0;
              return (
                <div key={item._id} className="flex gap-3">
                  <img
                    src={product?.images?.[0]?.url || 'https://placehold.co/80x80?text=?'}
                    alt={product?.name}
                    className="w-16 h-16 object-cover rounded-xl bg-surface-alt flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary leading-tight line-clamp-2">
                      {product?.name}
                    </p>
                    <p className="text-sm font-semibold text-accent mt-1">₹{price.toFixed(0)}</p>

                    {/* Quantity */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => dispatch(updateCart({ itemId: item._id, quantity: item.quantity - 1 }))}
                        className="w-6 h-6 rounded-lg bg-surface-dark flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <MdRemove size={14} />
                      </button>
                      <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateCart({ itemId: item._id, quantity: item.quantity + 1 }))}
                        className="w-6 h-6 rounded-lg bg-surface-dark flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <MdAdd size={14} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="text-red-400 hover:text-red-600 p-1 self-start transition-colors"
                  >
                    <MdDelete size={17} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="font-semibold text-primary">₹{subtotal.toFixed(0)}</span>
            </div>
            <p className="text-xs text-muted">Shipping & taxes calculated at checkout</p>
            <Link
              to="/checkout"
              onClick={() => dispatch(closeCartDrawer())}
              className="btn-accent w-full py-3 text-center block"
            >
              Checkout
            </Link>
            <Link
              to="/cart"
              onClick={() => dispatch(closeCartDrawer())}
              className="btn-outline w-full py-2.5 text-center block text-sm"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
