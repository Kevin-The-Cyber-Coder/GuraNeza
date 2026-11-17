import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Truck, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { Breadcrumbs, ErrorState, Loader, StatusBadge } from '../components/Common';
import { formatDate, formatRWF, getImage } from '../utils/helpers';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersAPI.get(id)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container page-section"><Loader label="Loading order..." /></div>;
  if (error || !order) return <div className="container page-section"><ErrorState message={error || 'Order not found'} /></div>;

  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentIndex = steps.indexOf(order.status);

  return (
    <div className="container page-section">
      <Breadcrumbs items={[{ label: 'My Orders', to: '/my-orders' }, { label: order.orderNumber }]} />
      <div className="page-title-row">
        <div><span className="eyebrow">Order details</span><h1>{order.orderNumber}</h1><p>Placed on {formatDate(order.createdAt, { weekday: 'long' })}</p></div>
        <StatusBadge status={order.status} />
      </div>

      <div className="order-detail-grid">
        <div className="order-detail-main">
          <section className="detail-card">
            <h3>Order timeline</h3>
            <div className="timeline">
              {(order.timeline?.length ? order.timeline : [{ status: order.status, note: 'Order placed', date: order.createdAt }]).map((event, i) => (
                <div className="timeline__item" key={i}>
                  <span className={`timeline__dot ${i === 0 ? 'timeline__dot--active' : ''}`}><CheckCircle2 size={16} /></span>
                  <div><strong>{event.status}</strong><p>{event.note}</p><small>{formatDate(event.date, { hour: '2-digit', minute: '2-digit' })}</small></div>
                </div>
              ))}
            </div>
            {order.status === 'Cancelled' && <p className="cancelled-note">This order was cancelled. If you were charged, please contact us.</p>}
          </section>

          <section className="detail-card">
            <h3>Items in this order</h3>
            <div className="detail-items">
              {order.items.map((item, i) => (
                <div className="detail-item" key={i}>
                  <img src={getImage(item, i)} alt={item.name} />
                  <div className="detail-item__info"><strong>{item.name}</strong><small>{formatRWF(item.price)} × {item.quantity}</small></div>
                  <strong>{formatRWF(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="detail-card__totals">
              <div><span>Subtotal</span><strong>{formatRWF(order.pricing?.subtotal)}</strong></div>
              <div><span>Delivery</span><strong>{formatRWF(order.pricing?.shippingFee)}</strong></div>
              <div className="detail-card__grand"><span>Total</span><strong>{formatRWF(order.pricing?.total)}</strong></div>
            </div>
          </section>
        </div>

        <aside className="order-detail-side">
          <section className="detail-card">
            <h3><MapPin size={18} /> Delivery address</h3>
            <p><strong>{order.customer?.name}</strong><br />{order.shipping?.address}<br />{order.shipping?.district ? `${order.shipping.district}, ` : ''}{order.shipping?.city || 'Kigali'}, {order.shipping?.country || 'Rwanda'}<br />{order.customer?.phone}</p>
          </section>
          <section className="detail-card">
            <h3><CreditCard size={18} /> Payment</h3>
            <p><strong>{order.paymentMethod?.replace(/-/g, ' ')}</strong><br />Status: <StatusBadge status={order.paymentStatus} /></p>
          </section>
          <section className="detail-card">
            <h3><Truck size={18} /> Delivery progress</h3>
            <div className="progress-steps">
              {steps.map((step, i) => (
                <div key={step} className={currentIndex >= i && order.status !== 'Cancelled' ? 'done' : ''}><span />{step}</div>
              ))}
            </div>
          </section>
          <Link to="/contact" className="btn btn--outline btn--block">Need help with this order?</Link>
        </aside>
      </div>
    </div>
  );
};

export default OrderDetail;
