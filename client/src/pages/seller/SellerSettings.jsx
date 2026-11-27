import { useEffect, useState } from 'react';
import { shopsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Loader, ErrorState } from '../../components/Common';

const SellerSettings = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', phone: '', email: '', location: '' });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { shop } = await shopsAPI.mine();
      setForm({ name: shop?.name || '', description: shop?.description || '', phone: shop?.phone || '', email: shop?.email || '', location: shop?.location || '' });
    } catch (e) { setError(e.message || 'Failed to load shop settings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await shopsAPI.updateMine(form); toast('Shop settings saved'); }
    catch (e2) { toast(e2.message, 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <Loader label="Loading settings..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
      <div><span className="eyebrow">Account</span><h1 style={{ margin: '4px 0 0' }}>Shop Settings</h1><p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>Update your shop information used across the marketplace.</p></div>
      <form className="admin-card" style={{ padding: 20, display: 'grid', gap: 14 }} onSubmit={save}>
        <label className="field"><span>Shop name</span><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></label>
        <label className="field"><span>Description</span><textarea rows="4" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></label>
        <div className="form-grid form-grid--2">
          <label className="field"><span>Phone</span><input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></label>
          <label className="field"><span>Email</span><input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></label>
        </div>
        <label className="field"><span>Location</span><input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} /></label>
        <div><button className="btn btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</button></div>
      </form>
    </div>
  );
};

export default SellerSettings;
