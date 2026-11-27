import { useEffect, useState } from 'react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Common';

const SellerProfile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    authAPI.me().then((d) => {
      const u = d.user || user;
      setForm({ name: u?.name || '', phone: u?.phone || '' });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      updateUser(form);
      toast('Profile updated');
    } catch (e2) { toast(e2.message, 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <Loader label="Loading profile..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      <div><span className="eyebrow">Account</span><h1 style={{ margin: '4px 0 0' }}>Profile</h1><p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>Manage your seller account information.</p></div>
      <form className="admin-card" style={{ padding: 20, display: 'grid', gap: 14 }} onSubmit={save}>
        <label className="field"><span>Name</span><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></label>
        <label className="field"><span>Email</span><input value={user?.email || ''} disabled /></label>
        <label className="field"><span>Phone</span><input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></label>
        <div><button className="btn btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button></div>
      </form>
    </div>
  );
};

export default SellerProfile;
