import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { Loader } from '../../components/Common';
import { useToast } from '../../context/ToastContext';

const AdminAuditLogs = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.auditLogs({ action, entityType, limit: 50 });
      setLogs(data.logs || []);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [action, entityType, toast]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><span className="eyebrow">Security & compliance</span><h1 style={{ margin: '4px 0 0' }}>Audit Logs</h1></div>
        <button className="btn btn--outline btn--sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-card" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Filter action..." style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', minWidth: 220 }} />
        <input value={entityType} onChange={(e) => setEntityType(e.target.value)} placeholder="Filter entity type..." style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', minWidth: 220 }} />
      </div>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {loading ? <Loader label="Loading audit logs..." /> : (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Outcome</th></tr></thead>
            <tbody>
              {logs.length === 0 ? <tr><td colSpan="5" style={{ padding: 24, color: 'var(--muted)' }}>No audit logs found.</td></tr> : logs.map((l) => (
                <tr key={l._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(l.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{l.actor?.name || 'System'}<div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{l.actor?.email || ''}</div></td>
                  <td><code style={{ fontSize: '.75rem' }}>{l.action}</code></td>
                  <td>{l.entityType}<div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{String(l.entityId || '').slice(-8)}</div></td>
                  <td><span className={`status-badge status-badge--${l.outcome === 'success' ? 'success' : l.outcome === 'failure' ? 'danger' : 'warning'}`}>{l.outcome}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
