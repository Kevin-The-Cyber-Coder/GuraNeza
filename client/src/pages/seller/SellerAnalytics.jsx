import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, DollarSign, ShoppingCart, Users, Package, AlertTriangle } from 'lucide-react';
import { shopsAPI } from '../../services/api';
import { formatRWF } from '../../utils/helpers';
import { Loader, ErrorState } from '../../components/Common';

const Stat = ({ icon: Icon, label, value }) => (
  <div className="admin-card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
    <span style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: '#f0fdf4', color: 'var(--primary)' }}><Icon size={20} /></span>
    <div><div style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 600 }}>{label}</div><div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink)' }}>{value}</div></div>
  </div>
);

const SellerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData((await shopsAPI.analytics()).analytics); }
    catch (e) { setError(e.message || 'Failed to load analytics'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  if (loading) return <Loader label="Loading analytics..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  const a = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><span className="eyebrow">Overview</span><h1 style={{ margin: '4px 0 0' }}>Sales Analytics</h1><p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>Real performance data for your shop.</p></div>
        <button className="btn btn--outline btn--sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <Stat icon={DollarSign} label="Revenue (your items)" value={formatRWF(a.revenue || 0)} />
        <Stat icon={ShoppingCart} label="Orders with your items" value={a.orders?.total || 0} />
        <Stat icon={Package} label="Items sold" value={a.itemsSold || 0} />
        <Stat icon={Users} label="Customers" value={a.customers || 0} />
        <Stat icon={AlertTriangle} label="Low stock products" value={a.products?.lowStock || 0} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <div className="admin-card" style={{ padding: 18 }}>
          <strong style={{ display: 'block', marginBottom: 12 }}>Orders by status</strong>
          {Object.keys(a.orders?.byStatus || {}).length === 0 ? <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>No order data yet.</div> : Object.entries(a.orders.byStatus).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line)', fontSize: '.86rem' }}><span style={{ color: 'var(--muted)' }}>{k}</span><strong>{v}</strong></div>
          ))}
        </div>
        <div className="admin-card" style={{ padding: 18 }}>
          <strong style={{ display: 'block', marginBottom: 12 }}>Top products (by sold)</strong>
          {(a.topProducts || []).length === 0 ? <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>No products yet.</div> : a.topProducts.map((p) => (
            <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line)', fontSize: '.86rem' }}><span style={{ color: 'var(--muted)' }}>{p.name}</span><strong>{p.sold} sold</strong></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
