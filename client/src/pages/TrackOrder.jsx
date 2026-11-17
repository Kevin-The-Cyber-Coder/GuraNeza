import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle2, MapPin, ArrowRight } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { Breadcrumbs, StatusBadge } from '../components/Common';
import { formatDate, formatRWF, getImage } from '../utils/helpers';

const TrackOrder = () => {
  const [form, setForm] = useState({ orderNumber: '', email: '' });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const data = await ordersAPI.track(form);
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentIndex = steps.indexOf(order?.status);

  return (
    <div className="container page-section">
      <Breadcrumbs items={[{ label: 'Track Order' }]} />
      <div className="track-page">
        <div className="track-intro">
          <span className="eyebrow">Stay in the loop</span>
          <h1>Where is my order?</h1>
          <p>Enter your order number and the email address you used at checkout to see live updates on your delivery.</p>
          <div className="track-intro__note"><Package size={17} /> Ordered as a guest? This works for you too.</div>
        </div>

        <form className="track-form" onSubmit={submit}>
          <label className="field"><span>Order number</span>
            <input required value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} placeholder="GN-20261117-1234" />
          </label>
          <label className="field"><span>Email address</span>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </label>
          <button className="btn btn--primary btn--block btn--lg" disabled={loading}><Search size={17} /> {loading ? 'Searching...' : 'Track order'}</button>
          {error && <p className="form-error">{error}</p>}
        </form>
      </div>

      {order && (
        <div className="track-result">
          <div className="track-result__head">
            <div><span className="eyebrow">Status update</span><h2>{order.orderNumber}</h2><p>Placed {formatDate(order.createdAt)}</p></div>
            <StatusBadge status={order.status} />
          </div>

          <div className="track-result__steps">
            {steps.map((step, i) => (
              <div key={step} className={`track-step ${currentIndex >= i && order.status !== 'Cancelled' ? 'done' : ''}`}>
                <span className="track-step__icon">{i === 0 ? <CheckCircle2 size={19} /> : i === 2 ? <Truck size={19} /> : <Package size={19} />}</span>
                <strong>{step}</strong>
                <small>{currentIndex >= i ? 'Completed' : 'Pending'}</small>
              </div>
            ))}
          </div>

          {order.timeline?.length > 0 && (
            <div className="track-result__timeline">
              <h3>Latest updates</h3>
              {[...order.timeline].reverse().map((event, i) => (
                <div key={i} className="track-update">
                  <span />
                  <div><strong>{event.status}</strong><p>{event.note}</p></div>
                  <small>{formatDate(event.date, { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
              ))}
            </div>
          )}

          <div className="track-result__summary">
            <div className="track-result__items">
              {order.items.map((item, i) => (
                <div key={i}><img src={getImage(item, i)} alt={item.name} /><span><strong>{item.name}</strong><small>Qty {item.quantity}</small></span></div>
              ))}
            </div>
            <div className="track-result__total"><span>Total paid</span><strong>{formatRWF(order.pricing?.total)}</strong></div>
          </div>

          <div className="track-result__address"><MapPin size={17} /> Delivering to: {order.shipping?.address}, {order.shipping?.city || 'Kigali'}, Rwanda</div>
        </div>
      )}

      {!order && !loading && (
        <div className="track-help">
          <span className="track-help__icon"><Truck size={22} /></span>
          <div><strong>Delivery across Kigali</strong><p>Most orders arrive the same or next business day. We will keep you updated at every step.</p></div>
          <Link to="/shop" className="text-link">Shop more <ArrowRight size={15} /></Link>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
