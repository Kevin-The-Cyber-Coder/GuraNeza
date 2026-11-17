import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && isAuthenticated) return <Navigate to={redirect} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login(form);
      toast(data.message || 'Welcome back!');
      navigate(data.user.role === 'admin' && redirect === '/' ? '/admin' : redirect, { replace: true });
    } catch (err) {
      toast(err.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Link to="/" className="brand brand--light"><span className="brand__mark"><ShoppingBag size={22} /></span><span className="brand__text">Gura<span>Neza</span><small>Kigali · Rwanda</small></span></Link>
        <div className="auth-visual__content">
          <span className="eyebrow eyebrow--light"><Sparkles size={14} /> Welcome back</span>
          <h2>Your next favourite thing is waiting.</h2>
          <p>Sign in to track your orders, save your details and enjoy a faster checkout every time.</p>
          <div className="auth-visual__features">
            <span><ShieldCheck size={17} /> Secure & private</span>
            <span>🇷🇼 Proudly Rwandan</span>
          </div>
        </div>
        <div className="auth-visual__pattern" />
      </div>

      <div className="auth-panel">
        <div className="auth-form-wrap">
          <Link to="/" className="auth-back">← Back to shop</Link>
          <span className="eyebrow">Sign in</span>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Enter your details to access your account.</p>

          <form onSubmit={submit} className="auth-form">
            <label className="field"><span>Email address</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
            </label>
            <label className="field"><span>Password</span>
              <div className="password-field">
                <input required type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </label>
            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'} <ArrowRight size={17} />
            </button>
          </form>

          <div className="auth-demo-hint">
            <strong>Demo accounts</strong>
            <span>Admin: admin@guraneza.rw / Admin@123</span>
            <span>Customer: demo@guraneza.rw / Demo@123</span>
          </div>

          <p className="auth-switch">New to GuraNeza? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
