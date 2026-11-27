import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ShieldAlert, ShieldX, UserX, Store } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { Loader } from '../../components/Common';
import { useToast } from '../../context/ToastContext';

const Stat = ({ icon: Icon, label, value, tone }) => (
  <div className="admin-card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
    <span style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: tone.bg, color: tone.fg }}><Icon size={20} /></span>
    <div><div style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 600 }}>{label}</div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)' }}>{value}</div></div>
  </div>
);

const AdminSecurity = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.securityOverview();
      setData(res);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader label="Loading security overview..." />;
  const stats = data?.stats || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><span className="eyebrow">Platform</span><h1 style={{ margin: '4px 0 0' }}>Security Center</h1><p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>Real security signals from audit logs and account status.</p></div>
        <button className="btn btn--outline btn--sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <Stat icon={ShieldX} label="Denied actions" value={stats.deniedCount ?? 0} tone={{ bg: '#fee2e2', fg: '#dc2626' }} />
        <Stat icon={ShieldAlert} label="Failed actions" value={stats.failureCount ?? 0} tone={{ bg: '#fef3c7', fg: '#b45309' }} />
        <Stat icon={UserX} label="Suspended/disabled users" value={stats.suspendedUsers ?? 0} tone={{ bg: '#e0e7ff', fg: '#4338ca' }} />
        <Stat icon={Store} label="Suspended/inactive shops" value={stats.suspendedShops ?? 0} tone={{ bg: '#dcfce7', fg: '#15803d' }} />
      </div>

      <div className="admin-card" style={{ overflowX: 'auto' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)' }}><strong>Recent denied/failed events</strong></div>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Outcome</th></tr></thead>
          <tbody>
            {(data?.recentEvents || []).length === 0 ? (
              <tr><td colSpan="5" style={{ padding: 24, color: 'var(--muted)' }}>No denied or failed security events recorded.</td></tr>
            ) : data.recentEvents.map((l) => (
              <tr key={l._id}>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDate(l.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td>{l.actor?.name || 'System'}<div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{l.actor?.email || ''}</div></td>
                <td><code style={{ fontSize: '.75rem' }}>{l.action}</code></td>
                <td>{l.entityType}</td>
                <td><span className={`status-badge status-badge--${l.outcome === 'failure' ? 'danger' : 'warning'}`}>{l.outcome}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSecurity;
