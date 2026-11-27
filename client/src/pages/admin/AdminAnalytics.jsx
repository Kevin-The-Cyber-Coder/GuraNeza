import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, DollarSign, ShoppingCart, Users, Package, Store } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { formatRWF } from '../../utils/helpers';
import { Loader } from '../../components/Common';
import { useToast } from '../../context/ToastContext';

const Stat = ({ icon: Icon, label, value }) => (
  <div className="admin-card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
    <span style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: '#f0fdf4', color: 'var(--primary)' }}><Icon size={20} /></span>
    <div><div style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 600 }}>{label}</div><div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink)' }}>{value}</div></div>
  </div>
);

const Breakdown = ({ title, rows, labelKey = '_id', valueKey = 'count' }) => (
  <div className="admin-card" style={{ padding: 18 }}>
    <strong style={{ display: 'block', marginBottom: 12 }}>{title}</strong>
    {rows.length === 0 ? <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>No data.</div> : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r) => (
          <div key={String(r[labelKey])} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '.86rem' }}>
            <span style={{ color: 'var(--muted)' }}>{String(r[labelKey] || 'unknown')}</span>
            <strong>{r[valueKey]}{r.total !== undefined ? ` / ${formatRWF(r.total)}` : ''}</strong>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AdminAnalytics = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.platformAnalytics();
      setData(res.analytics || null);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader label="Loading analytics..." />;
  const a = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><span className="eyebrow">Platform</span><h1 style={{ margin: '4px 0 0' }}>Analytics</h1><p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>Live marketplace aggregates from real orders, users, shops, and products.</p></div>
        <button className="btn btn--outline btn--sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <Stat icon={DollarSign} label="Revenue (non-cancelled)" value={formatRWF(a.revenue || 0)} />
        <Stat icon={ShoppingCart} label="Orders (non-cancelled)" value={a.orders || 0} />
        <Stat icon={Users} label="Users" value={(a.usersByRole || []).reduce((s, r) => s + (r.count || 0), 0)} />
        <Stat icon={Store} label="Shops" value={(a.shopsByStatus || []).reduce((s, r) => s + (r.count || 0), 0)} />
        <Stat icon={Package} label="Products" value={(a.productsByStatus || []).reduce((s, r) => s + (r.count || 0), 0)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <Breakdown title="Users by role" rows={a.usersByRole || []} />
        <Breakdown title="Shops by status" rows={a.shopsByStatus || []} />
        <Breakdown title="Products by status" rows={a.productsByStatus || []} />
        <Breakdown title="Orders by status" rows={a.ordersByStatus || []} />
      </div>
    </div>
  );
};

export default AdminAnalytics;
