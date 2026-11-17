import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Mail, ArrowRight, MapPin } from 'lucide-react';
import { formatRWF, formatDate } from '../utils/helpers';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="container page-section success-page">
      <div className="success-card">
        <div className="success-card__icon"><CheckCircle2 size={54} /></div>
        <span className="eyebrow">Order confirmed</span>
        <h1>Thank you for shopping with GuraNeza!</h1>
        <p>Your order has been placed successfully. We will get it ready and deliver it to you in Kigali as soon as possible.</p>

        <div className="success-card__number">
          <span>Order number</span>
          <strong>{orderNumber}</strong>
        </div>

        {order && (
          <div className="success-card__details">
            <div><Package size={19} /><span><small>Items</small><strong>{order.items?.reduce((s, i) => s + i.quantity, 0)} products</strong></span></div>
            <div><Truck size={19} /><span><small>Delivery to</small><strong>{order.shipping?.city || 'Kigali'}, Rwanda</strong></span></div>
            <div><MapPin size={19} /><span><small>Address</small><strong>{order.shipping?.address}</strong></span></div>
            <div><Mail size={19} /><span><small>Confirmation sent to</small><strong>{order.customer?.email}</strong></span></div>
          </div>
        )}

        <div className="success-card__total">
          <span>Order total</span>
          <strong>{formatRWF(order?.pricing?.total || 0)}</strong>
          <small>{order ? formatDate(order.createdAt) : ''}</small>
        </div>

        <div className="success-card__actions">
          <Link to="/track-order" className="btn btn--primary btn--lg">Track this order <ArrowRight size={17} /></Link>
          <Link to="/shop" className="btn btn--outline btn--lg">Keep shopping</Link>
        </div>
        <p className="success-card__footnote">Questions? <Link to="/contact">Contact our team</Link> and we will be happy to help.</p>
      </div>
    </div>
  );
};

export default OrderSuccess;
