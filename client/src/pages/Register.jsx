import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Gift, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';

const Register = () => {
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && isAuthenticated) return <Navigate to="/" replace />;

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    if (form.password !== form.confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = await register(form);
      toast(data.message || 'Welcome to GuraNeza!');
      navigate('/', { replace: true });
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
          <span className="eyebrow eyebrow--light">Join the family</span>
          <h2>Great shopping starts right here.</h2>
          <p>Create your free account and enjoy faster checkout, order history and exclusive local deals.</p>
          <div className="auth-visual__features">
            <span><Gift size={17} /> Member-only offers</span>
            <span><Truck size={17} /> Fast Kigali delivery</span>
          </div>
        </div>
        <div className="auth-visual__pattern" />
      </div>

      <div className="auth-panel">
        <div className="auth-form-wrap auth-form-wrap--wide">
          <Link to="/" className="auth-back">← Back to shop</Link>
          <span className="eyebrow">Create account</span>
          <h1>Join GuraNeza</h1>
          <p className="auth-subtitle">It takes less than a minute.</p>

          <form onSubmit={submit} className="auth-form">
            <label className="field"><span>Full name</span><input required value={form.name} onChange={setField('name')} placeholder="Your full name" /></label>
            <label className="field"><span>Email address</span><input required type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" /></label>
            <div className="form-grid form-grid--2">
              <label className="field"><span>Phone <small>(optional)</small></span><input value={form.phone} onChange={setField('phone')} placeholder="+250 788..." /></label>
              <label className="field"><span>City</span><input value={form.address} onChange={setField('address')} placeholder="Kigali" /></label>
            </div>
            <div className="form-grid form-grid--2">
              <label className="field"><span>Password</span>
                <div className="password-field">
                  <input required type={showPassword ? 'text' : 'password'} value={form.password} onChange={setField('password')} placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </label>
              <label className="field"><span>Confirm password</span><input required type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={setField('confirmPassword')} placeholder="Repeat password" /></label>
            </div>
            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create my account'} <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
