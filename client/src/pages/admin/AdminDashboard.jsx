import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ShoppingCart, Package, Users, MessageSquare, AlertTriangle,
  ArrowUpRight, ArrowRight, BarChart3, Clock,
} from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { Loader, ErrorState, StatusBadge } from '../../components/Common';
import { formatShortRWF, formatRWF, formatDate } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, hint, color, to }) => (
  <Link to={to || '#'} className="stat-card" style={{ '--stat-color': color }}>
    <span className="stat-card__icon"><Icon size={21} /></span>
    <div className="stat-card__body">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
    <ArrowUpRight size={17} className="stat-card__arrow" />
  </Link>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('weekly');

  useEffect(() => {
    Promise.all([dashboardAPI.stats(), dashboardAPI.activity()])
      .then(([stats, acts]) => { setData(stats); setActivity(acts.activity || []); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Crunching the numbers..." />;
  if (error || !data) return <ErrorState message={error || 'Unable to load dashboard'} />;

  const series = data[range] || data.weekly;
  const max = Math.max(...series.map((d) => d.revenue), 1);
  const { stats, statuses } = data;

  return (
    <div className="admin-dashboard">
      <div className="admin-page-head">
        <div><span className="eyebrow">Overview</span><h1>Dashboard</h1><p>Here is what's happening with GuraNeza today.</p></div>
        <div className="admin-page-head__date">{formatDate(new Date(), { weekday: 'long' })}</div>
      </div>

      <div className="stat-grid">
        <StatCard icon={TrendingUp} label="Total revenue" value={formatShortRWF(stats.revenue)} hint="All-time sales" color="#0b6b4f" />
        <StatCard icon={ShoppingCart} label="Orders" value={stats.orders} hint={`${statuses.Pending || 0} awaiting action`} color="#2563eb" to="/admin/orders" />
        <StatCard icon={Package} label="Products" value={stats.products} hint={`${stats.lowStock} low on stock`} color="#d97706" to="/admin/products" />
        <StatCard icon={Users} label="Customers" value={stats.customers} hint="Registered shoppers" color="#7c3aed" />
        <StatCard icon={MessageSquare} label="New messages" value={stats.newMessages} hint="Need a reply" color="#db2777" to="/admin/contacts" />
      </div>

      <div className="admin-grid-2">
        <section className="admin-card chart-card">
          <div className="admin-card__head">
            <div><h3>Revenue overview</h3><p>Daily sales on GuraNeza</p></div>
            <div className="range-toggle">
              <button className={range === 'weekly' ? 'active' : ''} onClick={() => setRange('weekly')}>7 days</button>
              <button className={range === 'monthly' ? 'active' : ''} onClick={() => setRange('monthly')}>30 days</button>
            </div>
          </div>
          <div className="chart">
            <div className="chart__y">
              <span>{formatShortRWF(max)}</span><span>{formatShortRWF(max / 2)}</span><span>0</span>
            </div>
            <div className="chart__bars">
              {series.map((point) => (
                <div className="chart__bar-wrap" key={point.date} title={`${point.label}: ${formatRWF(point.revenue)} · ${point.orders} orders`}>
                  <div className="chart__bar" style={{ height: `${Math.max(3, (point.revenue / max) * 100)}%` }} />
                  {(range === 'weekly' || parseInt(point.date.slice(-2), 10) % 5 === 0) && <span>{point.label}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="chart__footer"><BarChart3 size={15} /> Peak day: {formatRWF(Math.max(...series.map((d) => d.revenue)))}</div>
        </section>

        <section className="admin-card">
          <div className="admin-card__head"><div><h3>Order status</h3><p>Where orders stand right now</p></div></div>
          <div className="status-breakdown">
            {[
              { label: 'Pending', value: statuses.Pending || 0, color: '#f59e0b' },
              { label: 'Processing', value: statuses.Processing || 0, color: '#3b82f6' },
              { label: 'Shipped', value: statuses.Shipped || 0, color: '#8b5cf6' },
              { label: 'Delivered', value: statuses.Delivered || 0, color: '#10b981' },
              { label: 'Cancelled', value: statuses.Cancelled || 0, color: '#ef4444' },
            ].map((item) => (
              <div className="status-breakdown__row" key={item.label}>
                <span className="status-breakdown__dot" style={{ background: item.color }} />
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          <div className="admin-card__cta"><Link to="/admin/orders" className="text-link">Manage all orders <ArrowRight size={15} /></Link></div>
        </section>
      </div>

      <div className="admin-grid-2">
        <section className="admin-card">
          <div className="admin-card__head"><div><h3>Recent activity</h3><p>Latest orders and messages</p></div></div>
          <div className="activity-list">
            {activity.length === 0 ? <p className="muted">No activity yet.</p> : activity.slice(0, 6).map((item) => (
              <div className="activity-item" key={`${item.type}-${item.id}`}>
                <span className={`activity-item__icon activity-item__icon--${item.type}`}>{item.type === 'order' ? <ShoppingCart size={17} /> : <MessageSquare size={17} />}</span>
                <div><strong>{item.title}</strong><small>{item.subtitle}</small></div>
                <div className="activity-item__right"><StatusBadge status={item.status} /><small>{formatDate(item.date, { month: 'short', day: 'numeric' })}</small></div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card__head"><div><h3>Quick actions</h3><p>Common tasks, one click away</p></div></div>
          <div className="quick-actions">
            <Link to="/admin/products"><span><Package size={20} /></span><div><strong>Add a new product</strong><small>Expand your catalogue</small></div><ArrowRight size={16} /></Link>
            <Link to="/admin/orders"><span><Clock size={20} /></span><div><strong>Review pending orders</strong><small>{statuses.Pending || 0} need attention</small></div><ArrowRight size={16} /></Link>
            <Link to="/admin/contacts"><span><MessageSquare size={20} /></span><div><strong>Reply to messages</strong><small>{stats.newMessages} unread</small></div><ArrowRight size={16} /></Link>
            {stats.lowStock > 0 && <Link to="/admin/products"><span><AlertTriangle size={20} /></span><div><strong>Low stock alert</strong><small>{stats.lowStock} products running low</small></div><ArrowRight size={16} /></Link>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
