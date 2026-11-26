import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Store, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';

const ROLE_CONFIG = {
  customer: {
    label: 'Customer',
    icon: User,
    title: 'Customer sign in',
    subtitle: 'Sign in to track orders, manage your profile, and shop securely.',
    redirect: '/account',
    registerPath: '/register',
    registerLabel: 'Create a customer account',
  },
  seller: {
    label: 'Seller',
    icon: Store,
    title: 'Seller sign in',
    subtitle: 'Sign in to manage your shop, products, and orders.',
    redirect: '/seller',
    registerPath: '/become-a-seller',
    registerLabel: 'Apply to become a seller',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    title: 'Admin sign in',
    subtitle: 'Authorized administrators only. All actions are audited.',
    redirect: '/admin',
    registerPath: null,
    registerLabel: null,
  },
};

const Login = () => {
  const { login, isAuthenticated, loading: authLoading, isAdmin, isSeller, isCustomer } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedAs = (params.get('as') || 'customer').toLowerCase();
  const roleKey = ROLE_CONFIG[requestedAs] ? requestedAs : 'customer';
  const cfg = ROLE_CONFIG[roleKey];
  const redirect = params.get('redirect') || '';
  const activated = params.get('activated') === '1';
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && isAuthenticated) {
    const fallback = isAdmin ? '/admin' : isSeller ? '/seller' : isCustomer ? '/account' : '/';
    return <Navigate to={redirect || fallback} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login(form);
      toast(data.message || 'Welcome back!');
      const role = data.user.role;
      const userIsAdmin = role === 'admin' || role === 'SUPER_ADMIN';
      const userIsSeller = role === 'seller' || role === 'SELLER';
      const userIsCustomer = role === 'customer' || role === 'CUSTOMER';
      const destination = data.user.mustChangePassword
        ? '/change-password'
        : redirect
          ? redirect
          : userIsAdmin
            ? '/admin'
            : userIsSeller
              ? '/seller'
              : userIsCustomer
                ? '/account'
                : '/';
      navigate(destination, { replace: true });
    } catch (err) {
      toast(err.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const Icon = cfg.icon;

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Logo wide />
        <div className="auth-visual__content">
          <span className="eyebrow eyebrow--light"><Icon size={14} /> {cfg.label} portal</span>
          <h2>{cfg.title}</h2>
          <p>{cfg.subtitle}</p>
          <div className="auth-visual__features">
            <span><ShieldCheck size={17} /> Secure & private</span>
            <span>Role-based access enforced on backend</span>
          </div>
        </div>
        <div className="auth-visual__pattern" />
      </div>

      <div className="auth-panel">
        <div className="auth-form-wrap">
          <Link to="/" className="auth-back">← Back to shop</Link>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {Object.entries(ROLE_CONFIG).map(([key, value]) => (
              <Link
                key={key}
                to={`/login?as=${key}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`}
                className={`btn btn--sm ${key === roleKey ? 'btn--primary' : 'btn--outline'}`}
              >
                {value.label}
              </Link>
            ))}
          </div>
          <span className="eyebrow">Sign in</span>
          <h1>{cfg.title}</h1>
          <p className="auth-subtitle">{cfg.subtitle}</p>

          {activated && (
            <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 10, background: '#e8f5ef', color: '#0b6b4f', fontSize: '.84rem', fontWeight: 600 }}>
              Your account is active. Sign in to continue.
            </div>
          )}

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

          {roleKey !== 'admin' && (
            <div className="auth-demo-hint">
              <strong>Portal access</strong>
              {roleKey === 'customer' && <span>Customers can create an account below. Sellers must be approved before activation.</span>}
              {roleKey === 'seller' && <span>Seller accounts are created after admin approval and activation. Use your approved seller credentials.</span>}
            </div>
          )}

          {cfg.registerPath && <p className="auth-switch">{roleKey === 'seller' ? 'Want to sell on GuraNeza? ' : 'New to GuraNeza? '}<Link to={cfg.registerPath}>{cfg.registerLabel}</Link></p>}
          {roleKey === 'admin' && <p className="auth-switch">Not an admin? <Link to="/login?as=customer">Go to customer login</Link></p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
