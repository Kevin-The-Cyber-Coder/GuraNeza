import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { Loader } from '../../components/Common';
import { useToast } from '../../context/ToastContext';

const statuses = ['active', 'suspended', 'inactive'];

const AdminShops = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.shops({ search, status });
      setShops(data.shops || []);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [search, status, toast]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, next) => {
    if (!window.confirm(`Change shop status to "${next}"?`)) return;
    try {
      await adminAPI.updateShopStatus(id, next);
      toast('Shop status updated');
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><span className="eyebrow">Marketplace</span><h1 style={{ margin: '4px 0 0' }}>Shops Management</h1></div>
        <button className="btn btn--outline btn--sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-card" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220 }}>
          <Search size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shops..." style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px' }} />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px' }}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {loading ? <Loader label="Loading shops..." /> : (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Shop</th><th>Owner</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {shops.length === 0 ? <tr><td colSpan="5" style={{ padding: 24, color: 'var(--muted)' }}>No shops found.</td></tr> : shops.map((s) => (
                <tr key={s._id}>
                  <td><strong>{s.name}</strong><div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{s.slug}</div></td>
                  <td>{s.owner?.name || '—'}<div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{s.owner?.email}</div></td>
                  <td><span className={`badge badge--${s.status === 'active' ? 'success' : s.status === 'suspended' ? 'danger' : 'warning'}`}>{s.status}</span></td>
                  <td>{formatDate(s.createdAt)}</td>
                  <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {s.status !== 'active' && <button className="btn btn--sm btn--outline" onClick={() => changeStatus(s._id, 'active')}>Activate</button>}
                    {s.status !== 'suspended' && <button className="btn btn--sm btn--outline" onClick={() => changeStatus(s._id, 'suspended')}>Suspend</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminShops;
