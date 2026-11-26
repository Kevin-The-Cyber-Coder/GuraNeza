import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/Common';

const ChangePassword = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', password: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.mustChangePassword) {
    const isAdmin = user?.role === 'admin' || user?.role === 'SUPER_ADMIN';
    const isSeller = user?.role === 'seller' || user?.role === 'SELLER';
    const dest = isAdmin ? '/admin' : isSeller ? '/seller' : '/';
    return <Navigate to={dest} replace />;
  }

  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast('Passwords do not match', 'error');
    setSaving(true);
    try {
      const data = await authAPI.updateProfile({
        currentPassword: form.currentPassword,
        password: form.password,
      });
      updateUser({ ...data.user, mustChangePassword: false });
      toast('Password updated successfully');
      const isAdmin = user.role === 'admin' || user.role === 'SUPER_ADMIN';
      const isSeller = user.role === 'seller' || user.role === 'SELLER';
      navigate(isAdmin ? '/admin' : isSeller ? '/seller' : '/', { replace: true });
    } catch (err) {
      toast(err.message || 'Could not update password', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container page-section">
      <Breadcrumbs items={[{ label: 'Change password' }]} />
      <div style={{ maxWidth: 640, margin: '30px auto 0' }} className="contact-form-card">
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 22 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff7ed', color: '#c2410c', display: 'grid', placeItems: 'center' }}><ShieldCheck size={24} /></div>
          <div>
            <span className="eyebrow">Security required</span>
            <h2 style={{ marginBottom: 6 }}>Change your temporary password</h2>
            <p style={{ color: 'var(--muted)', fontSize: '.86rem', lineHeight: 1.7 }}>Your account was approved with temporary credentials. Set a new password before continuing.</p>
          </div>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <label className="field"><span>Current temporary password *</span>
            <div style={{ position: 'relative' }}>
              <input required type={show ? 'text' : 'password'} value={form.currentPassword} onChange={setField('currentPassword')} style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShow((v) => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'none', color: 'var(--muted)' }}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
          </label>
          <label className="field"><span>New password *</span><input required type={show ? 'text' : 'password'} value={form.password} onChange={setField('password')} minLength={8} /></label>
          <label className="field"><span>Confirm new password *</span><input required type={show ? 'text' : 'password'} value={form.confirmPassword} onChange={setField('confirmPassword')} minLength={8} /></label>
          <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}><Lock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Use at least 8 characters with uppercase, lowercase, and a number.</div>
          <button className="btn btn--primary btn--block" disabled={saving}>{saving ? 'Updating...' : 'Update password'}</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
