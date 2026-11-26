import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationsAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { Loader } from '../../components/Common';
import { useToast } from '../../context/ToastContext';

const AdminNotifications = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await notificationsAPI.mine({ limit: 50 });
      setNotifications(data.notifications || []);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const markRead = async (id) => {
    try { await notificationsAPI.markRead(id); load(); } catch (e) { toast(e.message, 'error'); }
  };
  const markAll = async () => {
    try { await notificationsAPI.markAllRead(); load(); } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><span className="eyebrow">Platform</span><h1 style={{ margin: '4px 0 0' }}>Notifications</h1></div>
        <button className="btn btn--outline btn--sm" onClick={markAll}><CheckCheck size={14} /> Mark all read</button>
      </div>
      <div className="admin-card" style={{ padding: 8 }}>
        {loading ? <Loader label="Loading notifications..." /> : notifications.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}><Bell size={24} style={{ marginBottom: 8 }} /><div>No notifications.</div></div>
        ) : notifications.map((n) => (
          <div key={n._id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', background: n.readAt ? '#fff' : '#f3faf7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '.9rem' }}>{n.title}</strong>
                <div style={{ color: 'var(--muted)', fontSize: '.84rem', marginTop: 4 }}>{n.message}</div>
                <div style={{ color: '#94a3b8', fontSize: '.74rem', marginTop: 6 }}>{formatDate(n.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              {!n.readAt && <button className="btn btn--sm btn--outline" onClick={() => markRead(n._id)}>Mark read</button>}
            </div>
          </div>
        ))}
      </div>
      <div className="admin-card" style={{ padding: 16, color: 'var(--muted)', fontSize: '.84rem' }}>
        Platform-wide broadcast notification management will be added when a broadcast workflow is implemented. This view shows real notifications for your admin account.
      </div>
    </div>
  );
};

export default AdminNotifications;
