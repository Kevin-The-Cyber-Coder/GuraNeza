import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle2, Truck, ArrowRight } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRWF, formatDate } from '../../utils/helpers';
import { Loader } from '../../components/Common';

const Stat = ({ icon: Icon, label, value }) => (
  <div className="admin-card" style={{ padding: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
        <div style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: 6 }}>{value}</div>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center' }}><Icon size={20} /></div>
    </div>
  </div>
);

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    ordersAPI.mine()
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading your account..." />;

  const pending = orders.filter((o) => ['Pending', 'Processing'].includes(o.status)).length;
  const delivered = orders.filter((o) => o.status === 'Delivered').length;
  const inTransit = orders.filter((o) => o.status === 'Shipped').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="admin-card" style={{ padding: 24 }}>
        <span className="eyebrow">Customer overview</span>
        <h1 style={{ margin: '6px 0 8px', fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p style={{ margin: 0, color: 'var(--muted)' }}>Track orders, manage your account, and shop securely on GuraNeza.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Stat icon={ShoppingBag} label="Total Orders" value={orders.length} />
        <Stat icon={Clock} label="Pending/Processing" value={pending} />
        <Stat icon={Truck} label="In Transit" value={inTransit} />
        <Stat icon={CheckCircle2} label="Delivered" value={delivered} />
      </div>

      <div className="admin-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Recent orders</h3>
          <Link to="/account/orders" className="btn btn--outline btn--sm">View all <ArrowRight size={14} /></Link>
        </div>
        {orders.length === 0 ? (
          <p style={{ color: 'var(--muted)', margin: 0 }}>You have not placed any orders yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.slice(0, 5).map((o) => (
              <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
                <div>
                  <strong style={{ display: 'block' }}>#{o.orderNumber}</strong>
                  <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{formatDate(o.createdAt)}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{formatRWF(o.pricing?.total || 0)}</div>
                  <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
