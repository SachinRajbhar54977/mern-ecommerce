import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { placeOrder } from '../store/slices/orderSlice';
import { Spinner } from '../components/common/index';
import { MdLocalShipping, MdPayment, MdCheckCircle } from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { user }  = useSelector((s) => s.auth);
  const { loading } = useSelector((s) => s.orders);

  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState({
    fullName:   user?.name || '',
    phone:      user?.phone || '',
    street:     '',
    city:       '',
    state:      '',
    postalCode: '',
    country:    'India',
  });
  const [paymentMethod,    setPaymentMethod]    = useState('cod');
  const [couponCode,       setCouponCode]       = useState('');
  const [couponDiscount,   setCouponDiscount]   = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const subtotal     = items.reduce((a, i) => a + (i.product?.finalPrice || 0) * i.quantity, 0);
  const shippingCost = subtotal > 500 ? 0 : 49;
  const tax          = Math.round(subtotal * 0.18);
  const total        = subtotal + shippingCost + tax - couponDiscount;

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingContinue = () => {
    const allFilled = Object.values(shipping).every((v) => v.trim() !== '');
    if (!allFilled) { toast.error('Please fill all address fields'); return; }
    setStep(1);
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const r = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal });
      setCouponDiscount(r.data.discount);
      toast.success(`Coupon applied! You save ₹${r.data.discount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponDiscount(0);
    } finally { setValidatingCoupon(false); }
  };

  const handlePlaceOrder = async () => {
    const result = await dispatch(placeOrder({
      shippingAddress: shipping,
      paymentMethod,
      couponCode: couponCode || undefined,
    }));
    if (!result.error) navigate(`/order-success/${result.payload._id}`);
  };

  return (
    <div className="container-app py-8 animate-fade-in">
      <h1 className="section-title mb-6">Checkout</h1>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-accent text-white' : 'bg-gray-200 text-muted'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-primary' : 'text-muted'}`}>{s}</span>
            {i < STEPS.length - 1 && (
              <div className={`w-10 h-px mx-1 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="max-w-2xl">

        {/* ── Step 0: Shipping ── */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-primary flex items-center gap-2">
              <MdLocalShipping className="text-accent" /> Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-primary/70 block mb-1.5">Full Name</label>
                <input
                  name="fullName"
                  value={shipping.fullName}
                  onChange={handleShippingChange}
                  className="input text-sm"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-primary/70 block mb-1.5">Phone Number</label>
                <input
                  name="phone"
                  value={shipping.phone}
                  onChange={handleShippingChange}
                  className="input text-sm"
                  placeholder="Phone Number"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-primary/70 block mb-1.5">Street Address</label>
                <input
                  name="street"
                  value={shipping.street}
                  onChange={handleShippingChange}
                  className="input text-sm"
                  placeholder="Street Address"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-primary/70 block mb-1.5">City</label>
                <input
                  name="city"
                  value={shipping.city}
                  onChange={handleShippingChange}
                  className="input text-sm"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-primary/70 block mb-1.5">State</label>
                <input
                  name="state"
                  value={shipping.state}
                  onChange={handleShippingChange}
                  className="input text-sm"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-primary/70 block mb-1.5">Postal Code</label>
                <input
                  name="postalCode"
                  value={shipping.postalCode}
                  onChange={handleShippingChange}
                  className="input text-sm"
                  placeholder="Postal Code"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-primary/70 block mb-1.5">Country</label>
                <input
                  name="country"
                  value={shipping.country}
                  onChange={handleShippingChange}
                  className="input text-sm"
                  placeholder="Country"
                />
              </div>
            </div>
            <button onClick={handleShippingContinue} className="btn-accent py-3 px-8">
              Continue to Payment
            </button>
          </div>
        )}

        {/* ── Step 1: Payment ── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-primary flex items-center gap-2">
              <MdPayment className="text-accent" /> Payment Method
            </h2>
            <div className="space-y-3">
              {[
                ['cod',    '💵 Cash on Delivery',    'Pay when your order arrives'],
                ['stripe', '💳 Credit / Debit Card', 'Secure payment via Stripe'],
              ].map(([val, title, desc]) => (
                <label
                  key={val}
                  className={`card p-4 flex items-center gap-4 cursor-pointer border-2 transition-all
                    ${paymentMethod === val ? 'border-accent bg-accent/5' : 'border-transparent hover:border-gray-200'}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={val}
                    checked={paymentMethod === val}
                    onChange={() => setPaymentMethod(val)}
                    className="accent-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-primary">{title}</p>
                    <p className="text-xs text-muted">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="input text-sm flex-1"
                placeholder="Coupon code (e.g. WELCOME20)"
              />
              <button
                onClick={validateCoupon}
                disabled={validatingCoupon}
                className="btn-outline py-2.5 px-4 text-sm whitespace-nowrap"
              >
                {validatingCoupon ? <Spinner size="sm" /> : 'Apply'}
              </button>
            </div>
            {couponDiscount > 0 && (
              <p className="text-green-600 text-sm font-medium">✓ Discount applied: −₹{couponDiscount}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(0)} className="btn-outline py-2.5 px-5">Back</button>
              <button onClick={() => setStep(2)} className="btn-accent py-2.5 px-8">Review Order</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Review ── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-primary flex items-center gap-2">
              <MdCheckCircle className="text-accent" /> Review Your Order
            </h2>

            <div className="card p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Shipping to</p>
              <p className="text-sm text-primary">{shipping.fullName} · {shipping.phone}</p>
              <p className="text-sm text-muted">{shipping.street}, {shipping.city}, {shipping.state} {shipping.postalCode}</p>
            </div>

            <div className="card p-4 space-y-3">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <img
                    src={item.product?.images?.[0]?.url}
                    className="w-10 h-10 object-cover rounded-lg bg-surface-alt"
                    alt={item.product?.name}
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-primary line-clamp-1">{item.product?.name}</p>
                    <p className="text-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    ₹{((item.product?.finalPrice || 0) * item.quantity).toFixed(0)}
                  </p>
                </div>
              ))}
            </div>

            <div className="card p-4 space-y-2">
              {[
                ['Subtotal',  `₹${subtotal.toFixed(0)}`],
                ['Shipping',  shippingCost === 0 ? 'Free' : `₹${shippingCost}`],
                ['GST (18%)', `₹${tax}`],
                ...(couponDiscount > 0 ? [['Coupon', `-₹${couponDiscount}`]] : []),
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-muted">{l}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-primary">
                <span>Total</span>
                <span className="text-accent text-lg">₹{total.toFixed(0)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline py-2.5 px-5">Back</button>
              <button onClick={handlePlaceOrder} disabled={loading} className="btn-accent py-2.5 px-8">
                {loading ? <Spinner size="sm" /> : `Place Order · ₹${total.toFixed(0)}`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}