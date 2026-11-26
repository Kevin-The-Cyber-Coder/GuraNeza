import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CustomerProfile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await authAPI.updateProfile(form);
      updateUser(data.user);
      toast('Profile updated');
    } catch (err) {
      toast(err.message || 'Could not update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-card" style={{ padding: 24, maxWidth: 760 }}>
      <span className="eyebrow">Profile</span>
      <h2 style={{ margin: '6px 0 18px' }}>Personal information</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <label className="field"><span>Full name</span><input name="name" value={form.name} onChange={onChange} required /></label>
        <label className="field"><span>Email</span><input value={user?.email || ''} disabled /></label>
        <label className="field"><span>Phone</span><input name="phone" value={form.phone} onChange={onChange} /></label>
        <label className="field"><span>Address</span><input name="address" value={form.address} onChange={onChange} /></label>
        <div><button className="btn btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button></div>
      </form>
    </div>
  );
};

export default CustomerProfile;
