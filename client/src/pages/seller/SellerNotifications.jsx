import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, CheckCheck } from 'lucide-react';
import { notificationsAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { Loader } from '../../components/Common';
import { useToast } from '../../context/ToastContext';

const SellerNotifications = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems((await notificationsAPI.mine({ limit: 50 })).notifications || []); }
    catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const markAll = async () => {
    try { await notificationsAPI.markAllRead(); toast('All notifications marked as read'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><span className="eyebrow">Growth</span><h1 style={{ margin: '4px 0 0' }}>Notifications</h1></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--outline btn--sm" onClick={markAll}><CheckCheck size={14} /> Mark all read</button>
          <button className="btn btn--outline btn--sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {loading ? <Loader label="Loading notifications..." /> : items.length === 0 ? <div style={{ padding: 24, color: 'var(--muted)' }}>No notifications yet.</div> : items.map((n) => (
          <div key={n._id} style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', background: n.readAt ? '#fff' : '#f3faf7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><strong style={{ fontSize: '.88rem' }}>{n.title}</strong><span style={{ fontSize: '.74rem', color: '#94a3b8' }}>{formatDate(n.createdAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
            <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: 4 }}>{n.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerNotifications;
