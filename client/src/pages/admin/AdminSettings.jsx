import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { Loader } from '../../components/Common';
import { useToast } from '../../context/ToastContext';

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
    <span style={{ color: 'var(--muted)', fontSize: '.88rem' }}>{label}</span>
    <strong style={{ fontSize: '.88rem', textAlign: 'right', wordBreak: 'break-word' }}>{value}</strong>
  </div>
);

const Bool = ({ ok }) => ok ? <span style={{ color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={15} /> Configured</span> : <span style={{ color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: 6 }}><XCircle size={15} /> Not configured</span>;

const AdminSettings = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.platformSettings();
      setSettings(res.settings || null);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><span className="eyebrow">Platform</span><h1 style={{ margin: '4px 0 0' }}>Settings</h1><p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>Read-only view of active platform configuration. Secrets are never exposed.</p></div>
        <button className="btn btn--outline btn--sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-card" style={{ padding: 20 }}>
        {loading ? <Loader label="Loading settings..." /> : !settings ? <div style={{ color: 'var(--muted)' }}>Settings unavailable.</div> : (
          <div>
            <Row label="Environment" value={settings.nodeEnv} />
            <Row label="Client URL" value={settings.clientUrl} />
            <Row label="App URL" value={settings.appUrl} />
            <Row label="JWT expiry" value={settings.jwtExpiresIn} />
            <Row label="Seller invite TTL (hours)" value={String(settings.sellerInviteTtlHours)} />
            <Row label="Upload max (MB)" value={String(settings.uploadMaxMb)} />
            <Row label="Email (Resend)" value={<Bool ok={settings.emailConfigured} />} />
            <Row label="Cloudinary" value={<Bool ok={settings.cloudinaryConfigured} />} />
            <Row label="CORS origins" value={<Bool ok={settings.corsOriginsConfigured} />} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
