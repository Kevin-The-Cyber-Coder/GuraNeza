import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { Loader } from '../../components/Common';
import { useToast } from '../../context/ToastContext';

const statuses = ['active', 'suspended', 'disabled'];

const AdminCustomers = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.users({ role: 'CUSTOMER', search, status });
      setUsers(data.users || []);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [search, status, toast]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, next) => {
    if (!window.confirm(`Change customer account status to "${next}"?`)) return;
    try {
      await adminAPI.updateUserStatus(id, next);
      toast('Customer status updated');
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><span className="eyebrow">Marketplace</span><h1 style={{ margin: '4px 0 0' }}>Customers Management</h1></div>
        <button className="btn btn--outline btn--sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-card" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220 }}>
          <Search size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px' }} />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px' }}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {loading ? <Loader label="Loading customers..." /> : (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Customer</th><th>Email</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.length === 0 ? <tr><td colSpan="5" style={{ padding: 24, color: 'var(--muted)' }}>No customers found.</td></tr> : users.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td><span className={`status-badge status-badge--${u.accountStatus === 'active' ? 'success' : u.accountStatus === 'suspended' ? 'danger' : 'warning'}`}>{u.accountStatus}</span></td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {u.accountStatus !== 'active' && <button className="btn btn--sm btn--outline" onClick={() => changeStatus(u._id, 'active')}>Activate</button>}
                    {u.accountStatus !== 'suspended' && <button className="btn btn--sm btn--outline" onClick={() => changeStatus(u._id, 'suspended')}>Suspend</button>}
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

export default AdminCustomers;
