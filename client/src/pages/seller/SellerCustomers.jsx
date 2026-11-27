import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { shopsAPI } from '../../services/api';
import { formatDate, formatRWF } from '../../utils/helpers';
import { Loader, ErrorState } from '../../components/Common';

const SellerCustomers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setCustomers((await shopsAPI.customers()).customers || []); }
    catch (e) { setError(e.message || 'Failed to load customers'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  if (loading) return <Loader label="Loading customers..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><span className="eyebrow">Sales</span><h1 style={{ margin: '4px 0 0' }}>Customers</h1><p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>Limited to customers who purchased your products.</p></div>
        <button className="btn btn--outline btn--sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Customer</th><th>Contact</th><th>Orders</th><th>Your revenue</th><th>Last order</th></tr></thead>
          <tbody>
            {customers.length === 0 ? <tr><td colSpan="5" style={{ padding: 24, color: 'var(--muted)' }}>No customer data yet.</td></tr> : customers.map((c) => (
              <tr key={c.email}>
                <td><strong>{c.name || '—'}</strong></td>
                <td>{c.email}<div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{c.phone || ''}</div></td>
                <td>{c.orders}</td>
                <td>{formatRWF(c.spend || 0)}</td>
                <td>{formatDate(c.lastOrderAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerCustomers;
