import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { formatDate, formatRWF } from '../../utils/helpers';
import { Loader, ErrorState, StatusBadge } from '../../components/Common';

const SellerOrderDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    ordersAPI.get(id)
      .then((d) => setOrder(d.order))
      .catch((e) => setError(e.message || 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading order..." />;
  if (error) return <ErrorState message={error} />;
  if (!order) return <ErrorState message="Order not found" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div><Link to="/seller/orders" className="btn btn--ghost btn--sm" style={{ marginBottom: 8 }}><ArrowLeft size={14} /> Back to orders</Link><h1 style={{ margin: '4px 0 0' }}>Order #{order.orderNumber}</h1></div>
      <div className="admin-card" style={{ padding: 20, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}><StatusBadge status={order.status} /><span style={{ color: 'var(--muted)', fontSize: '.84rem' }}>{formatDate(order.createdAt)}</span></div>
        <div><strong>Customer:</strong> {order.customer?.name} {order.customer?.phone ? `• ${order.customer.phone}` : ''}</div>
        <div><strong>Your subtotal:</strong> {formatRWF(order.sellerSubtotal || 0)}</div>
      </div>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>
            {(order.items || []).map((it, idx) => (
              <tr key={it._id || idx}><td>{it.name}</td><td>{it.quantity}</td><td>{formatRWF(it.price)}</td><td>{formatRWF(it.price * it.quantity)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerOrderDetail;
