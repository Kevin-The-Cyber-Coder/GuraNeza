import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs, EmptyState, ErrorState, Loader, StatusBadge } from '../components/Common';
import { formatDate, formatRWF, getImage } from '../utils/helpers';

const MyOrders = ({ embedded = false }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    ordersAPI.mine()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!authLoading && !isAuthenticated) return <Navigate to={embedded ? '/login?redirect=/account/orders' : '/login?redirect=/my-orders'} replace />;

  const content = (
    <>
      {!embedded && <Breadcrumbs items={[{ label: 'My Orders' }]} />}
      <div className="page-title-row">
        <div><span className="eyebrow">Your shopping journey</span><h1>My orders</h1><p>Track everything you have bought on GuraNeza.</p></div>
        <Link to="/shop" className="btn btn--outline btn--sm"><ShoppingBag size={15} /> Shop more</Link>
      </div>

      {loading ? <Loader label="Loading your orders..." /> : error ? <ErrorState message={error} /> : orders.length === 0 ? (
        <EmptyState title="No orders yet" message="When you place your first order, you will be able to follow it here." action="Start shopping" to="/shop" />
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className="order-card">
              <div className="order-card__head">
                <div><strong>{order.orderNumber}</strong><small>Placed {formatDate(order.createdAt)}</small></div>
                <StatusBadge status={order.status} />
              </div>
              <div className="order-card__body">
                <div className="order-card__images">
                  {order.items.slice(0, 4).map((item, i) => <img key={i} src={getImage(item, i)} alt={item.name} />)}
                </div>
                <div className="order-card__info">
                  <span>{order.items.reduce((s, i) => s + i.quantity, 0)} items · {order.paymentMethod.replace('-', ' ')}</span>
                  <strong>{formatRWF(order.pricing?.total)}</strong>
                </div>
                <ChevronRight size={19} className="order-card__arrow" />
              </div>
              <div className="order-progress">
                {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                  const orderIndex = ['Pending', 'Processing', 'Shipped', 'Delivered'].indexOf(order.status);
                  const done = order.status === 'Cancelled' ? false : i <= orderIndex;
                  return <span key={step} className={done ? 'done' : ''}><i />{step}</span>;
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );

  return embedded ? content : <div className="container page-section">{content}</div>;
};

export default MyOrders;
