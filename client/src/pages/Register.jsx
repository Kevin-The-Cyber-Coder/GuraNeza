import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Gift, Truck, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';

const Register = () => {
  const { register, isAuthenticated, loading: authLoading, isAdmin, isSeller, isCustomer } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && isAuthenticated) {
    const dest = isAdmin ? '/admin' : isSeller ? '/seller' : isCustomer ? '/account' : '/';
    return <Navigate to={dest} replace />;
  }

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = await register(form);
      toast(data.message || 'Welcome to GuraNeza!');
      navigate('/account', { replace: true });
    } catch (err) {
      toast(err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual auth-visual--register">
        <Logo wide />
        <div className="auth-visual__content">
          <span className="eyebrow eyebrow--light">Customer account</span>
          <h2>Create your GuraNeza customer account.</h2>
          <p>Shop from trusted sellers, track orders, and manage your profile. Seller accounts are created through the seller application and admin approval flow.</p>
          <div className="auth-visual__features">
            <span><Gift size={17} /> Track your orders</span>
            <span><Truck size={17} /> Fast Kigali delivery</span>
          </div>
        </div>
        <div className="auth-visual__pattern" />
      </div>

      <div className="auth-panel">
        <div className="auth-form-wrap auth-form-wrap--wide">
          <Link to="/" className="auth-back">← Back to shop</Link>
          <span className="eyebrow">Customer registration</span>
          <h1>Create account</h1>
          <p className="auth-subtitle">This form creates a customer account. Sellers should apply separately.</p>

          <form onSubmit={submit} className="auth-form">
            <label className="field"><span>Full name</span><input required value={form.name} onChange={setField('name')} placeholder="Your full name" autoComplete="name" /></label>
            <label className="field"><span>Email address</span><input required type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" autoComplete="email" /></label>
            <div className="form-grid form-grid--2">
              <label className="field"><span>Phone <small>(optional)</small></span><input value={form.phone} onChange={setField('phone')} placeholder="+250 788..." autoComplete="tel" /></label>
              <label className="field"><span>City</span><input value={form.address} onChange={setField('address')} placeholder="Kigali" autoComplete="address-level2" /></label>
            </div>
            <div className="form-grid form-grid--2">
              <label className="field"><span>Password</span>
                <div className="password-field">
                  <input required type={showPassword ? 'text' : 'password'} value={form.password} onChange={setField('password')} placeholder="Min. 8 characters" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </label>
              <label className="field"><span>Confirm password</span><input required type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={setField('confirmPassword')} placeholder="Repeat password" autoComplete="new-password" /></label>
            </div>
            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create customer account'} <ArrowRight size={17} />
            </button>
          </form>

          <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 12, background: '#f8fafc', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Store size={18} style={{ marginTop: 2, color: 'var(--primary)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '.88rem' }}>Want to sell on GuraNeza?</strong>
                <p style={{ margin: '4px 0 0', fontSize: '.82rem', color: 'var(--muted)' }}>Seller accounts require application and admin approval. <Link to="/become-a-seller">Apply as a seller</Link>.</p>
              </div>
            </div>
          </div>

          <p className="auth-switch">Already have an account? <Link to="/login?as=customer">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
