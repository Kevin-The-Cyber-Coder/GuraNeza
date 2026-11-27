import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { formatDate, formatRWF } from '../../utils/helpers';
import { Loader } from '../../components/Common';
import { useToast } from '../../context/ToastContext';

const SellerOrders = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    ordersAPI.sellerMine()
      .then((d) => setOrders(d.orders || []))
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <Loader label="Loading orders..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div><span className="eyebrow">Sales</span><h1 style={{ margin: '4px 0 0' }}>Orders</h1><p style={{ color: 'var(--muted)', marginTop: 8 }}>Orders containing your products. Only your items and fulfillment-needed customer details are shown.</p></div>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Your subtotal</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {orders.length === 0 ? <tr><td colSpan="6" style={{ padding: 24, color: 'var(--muted)' }}>No orders found for your products yet.</td></tr> : orders.map((o) => (
              <tr key={o._id}>
                <td><Link to={`/seller/orders/${o._id}`} style={{ fontWeight: 700, color: 'var(--primary)' }}>#{o.orderNumber}</Link></td>
                <td>{o.customer?.name}<div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{o.customer?.phone}</div></td>
                <td>{o.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}</td>
                <td>{formatRWF(o.sellerSubtotal || 0)}</td>
                <td><span className="badge">{o.status}</span></td>
                <td>{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerOrders;
