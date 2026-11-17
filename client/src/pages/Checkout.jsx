import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, Building2, Lock, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI } from '../services/api';
import { Breadcrumbs, EmptyState } from '../components/Common';
import { formatRWF, getImage } from '../utils/helpers';

const paymentMethods = [
  { value: 'cash-on-delivery', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: Wallet },
  { value: 'mobile-money', label: 'Mobile Money', desc: 'MTN MoMo or Airtel Money', icon: CreditCard },
  { value: 'bank-transfer', label: 'Bank Transfer', desc: 'Transfer to our account', icon: Building2 },
];

const Checkout = () => {
  const { items, subtotal, shippingFee, total, clearCart, itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: 'Kigali',
    district: '',
    notes: '',
    paymentMethod: 'cash-on-delivery',
  });

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await ordersAPI.create({
        items,
        customer: { name: form.name, email: form.email, phone: form.phone },
        shipping: { address: form.address, city: form.city, district: form.district, notes: form.notes, country: 'Rwanda' },
        paymentMethod: form.paymentMethod,
      });
      clearCart();
      toast('Order placed successfully!');
      navigate(`/order-success/${data.order.orderNumber}`, { state: { order: data.order } });
    } catch (err) {
      toast(err.message || 'Could not place your order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container page-section">
        <Breadcrumbs items={[{ label: 'Checkout' }]} />
        <EmptyState title="Nothing to check out" message="Add a few products to your cart first." action="Go shopping" to="/shop" />
      </div>
    );
  }

  return (
    <div className="container page-section">
      <Breadcrumbs items={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Secure checkout</span>
          <h1>Complete your order</h1>
          <p>Just a few details and your goodies are on the way.</p>
        </div>
        <Link to="/cart" className="btn btn--outline btn--sm"><ArrowLeft size={15} /> Back to cart</Link>
      </div>

      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-form">
          {!isAuthenticated && (
            <div className="checkout-notice">
              Shopping as a guest? You can still place your order. <Link to="/login?redirect=/checkout">Sign in</Link> to save your details and track orders easily.
            </div>
          )}

          <section className="form-card">
            <div className="form-card__head"><span className="form-card__number">1</span><div><h3>Contact information</h3><p>We will send your order confirmation here</p></div></div>
            <div className="form-grid">
              <label className="field"><span>Full name *</span><input required value={form.name} onChange={setField('name')} placeholder="e.g. Alice Uwimana" /></label>
              <label className="field"><span>Email address *</span><input required type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" /></label>
              <label className="field"><span>Phone number *</span><input required value={form.phone} onChange={setField('phone')} placeholder="+250 788 000 000" /></label>
            </div>
          </section>

          <section className="form-card">
            <div className="form-card__head"><span className="form-card__number">2</span><div><h3>Delivery address</h3><p>Where should we bring your order?</p></div></div>
            <div className="form-grid">
              <label className="field field--full"><span>Street address *</span><input required value={form.address} onChange={setField('address')} placeholder="House number, street name" /></label>
              <label className="field"><span>City</span><input value={form.city} onChange={setField('city')} /></label>
              <label className="field"><span>District</span><input value={form.district} onChange={setField('district')} placeholder="e.g. Gasabo" /></label>
              <label className="field field--full"><span>Delivery notes <small>(optional)</small></span><textarea rows="2" value={form.notes} onChange={setField('notes')} placeholder="Landmarks, gate code, preferred time..." /></label>
            </div>
          </section>

          <section className="form-card">
            <div className="form-card__head"><span className="form-card__number">3</span><div><h3>Payment method</h3><p>Choose what works best for you</p></div></div>
            <div className="payment-options">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label key={method.value} className={`payment-option ${form.paymentMethod === method.value ? 'active' : ''}`}>
                    <input type="radio" name="payment" value={method.value} checked={form.paymentMethod === method.value} onChange={setField('paymentMethod')} />
                    <Icon size={21} />
                    <span><strong>{method.label}</strong><small>{method.desc}</small></span>
                    {form.paymentMethod === method.value && <Check size={17} className="payment-option__check" />}
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="checkout-summary">
          <h3>Your order <span>({itemCount})</span></h3>
          <div className="checkout-summary__items">
            {items.map((item) => (
              <div key={item.product} className="checkout-summary__item">
                <img src={getImage(item)} alt={item.name} />
                <div><strong>{item.name}</strong><small>Qty: {item.quantity}</small></div>
                <span>{formatRWF(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="cart-summary__divider" />
          <div className="cart-summary__row"><span>Subtotal</span><strong>{formatRWF(subtotal)}</strong></div>
          <div className="cart-summary__row"><span>Delivery</span><strong>{formatRWF(shippingFee)}</strong></div>
          <div className="cart-summary__total"><span>Total</span><strong>{formatRWF(total)}</strong></div>
          <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={submitting}>
            <Lock size={16} /> {submitting ? 'Placing order...' : 'Place order'}
          </button>
          <p className="checkout-summary__note">By placing your order you agree to our terms. Your details are kept safe.</p>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
