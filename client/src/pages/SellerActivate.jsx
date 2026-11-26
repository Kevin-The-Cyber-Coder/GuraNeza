import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { sellerInvitationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs, Loader } from '../components/Common';

const SellerActivate = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const toast = useToast();
  const { loginWithToken } = useAuth();

  const [checking, setChecking] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('This activation link is missing a token.');
      setChecking(false);
      return;
    }

    sellerInvitationsAPI
      .validate(token)
      .then((data) => setInvitation(data.invitation))
      .catch((err) => setError(err.message || 'This activation link is invalid.'))
      .finally(() => setChecking(false));
  }, [token]);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = await sellerInvitationsAPI.activate({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      loginWithToken(data.token, data.user);
      toast(data.message || 'Your seller account is now active');
      navigate('/seller', { replace: true });
    } catch (err) {
      toast(err.message || 'Could not activate your account', 'error');
      setError(err.message || 'Could not activate your account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-section">
      <Breadcrumbs items={[{ label: 'Seller activation' }]} />

      <div style={{ maxWidth: 720, margin: '30px auto 0' }}>
        <div className="contact-form-card">
          {checking ? (
            <Loader label="Validating your activation link..." />
          ) : error && !invitation ? (
            <div className="contact-sent">
              <AlertTriangle size={52} style={{ color: 'var(--danger)' }} />
              <h2>Activation link unavailable</h2>
              <p>{error}</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/seller-application/status" className="btn btn--outline btn--sm">Check application status</Link>
                <Link to="/contact" className="btn btn--primary btn--sm">Contact support</Link>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 22 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <span className="eyebrow">Seller account</span>
                  <h2 style={{ marginBottom: 6 }}>Set your seller password</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '.86rem', lineHeight: 1.7 }}>
                    Welcome{invitation?.name ? `, ${invitation.name}` : ''}. Create a secure password to activate your GuraNeza seller account.
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 12, padding: 14, marginBottom: 20, fontSize: '.84rem' }}>
                <div><strong>Account email:</strong> {invitation?.email}</div>
                <div style={{ color: 'var(--muted)', marginTop: 4 }}>This link is single-use and expires on {invitation?.expiresAt ? new Date(invitation.expiresAt).toLocaleString() : 'the expiry time'}.</div>
              </div>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <label className="field">
                  <span>New password *</span>
                  <div style={{ position: 'relative' }}>
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={setField('password')}
                      minLength={8}
                      placeholder="At least 8 characters"
                      style={{ paddingRight: 42 }}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'none', color: 'var(--muted)' }}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>

                <label className="field">
                  <span>Confirm password *</span>
                  <input required type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={setField('confirmPassword')} minLength={8} placeholder="Re-enter your password" />
                </label>

                <div style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                  <Lock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Use at least 8 characters with uppercase, lowercase, and a number. GuraNeza will never ask you to share this password by email.
                </div>

                <button className="btn btn--primary btn--block btn--lg" disabled={submitting}>
                  <CheckCircle2 size={17} /> {submitting ? 'Activating account...' : 'Activate seller account'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerActivate;
