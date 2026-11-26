import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, ShieldCheck, BarChart3, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { sellerApplicationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/Common';

const CATEGORIES = [
  'Fashion & Clothing',
  'Electronics',
  'Home & Living',
  'Beauty & Care',
  'Food & Groceries',
  'Sports & Outdoors',
  'Books & Stationery',
  'Services',
  'Other',
];

const INITIAL = {
  fullName: '',
  email: '',
  phone: '',
  businessName: '',
  businessLocation: '',
  businessDescription: '',
  businessCategory: '',
  reason: '',
  supportingInfo: '',
};

const BecomeSeller = () => {
  const toast = useToast();
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await sellerApplicationsAPI.submit(form);
      setResult(data.application);
      setForm(INITIAL);
      toast(data.message || 'Application submitted');
    } catch (err) {
      toast(err.message || 'Could not submit your application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-section">
      <Breadcrumbs items={[{ label: 'Become a Seller' }]} />

      <div className="contact-page" style={{ alignItems: 'start' }}>
        <div className="contact-info">
          <span className="eyebrow">Sell on GuraNeza</span>
          <h1>Grow your business with a trusted marketplace</h1>
          <p>
            GuraNeza connects local sellers with customers across Kigali and Rwanda. Apply once,
            get reviewed by our team, and activate your seller account through a secure email link.
          </p>

          <div className="contact-info__cards">
            <div><span><Store size={20} /></span><div><strong>Your own shop</strong><p>Create a branded storefront and manage your products.</p></div></div>
            <div><span><ShieldCheck size={20} /></span><div><strong>Secure onboarding</strong><p>Approval and activation links protect your account.</p></div></div>
            <div><span><BarChart3 size={20} /></span><div><strong>Real insights</strong><p>Track orders, stock, and performance from your dashboard.</p></div></div>
            <div><span><Truck size={20} /></span><div><strong>Reach customers</strong><p>Sell to customers who already trust GuraNeza.</p></div></div>
          </div>

          <div style={{ marginTop: 28, padding: 20, border: '1px solid var(--line)', borderRadius: 14, background: 'var(--bg-soft)' }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>Already applied?</strong>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: 12 }}>Check your application status with your reference number and email.</p>
            <Link to="/seller-application/status" className="btn btn--outline btn--sm">Check application status</Link>
          </div>
        </div>

        <div className="contact-form-card">
          {result ? (
            <div className="contact-sent">
              <CheckCircle2 size={52} />
              <h2>Application received</h2>
              <p>Thank you for applying to sell on GuraNeza. Our team will review your application and email you the next steps.</p>
              <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 12, padding: 16, margin: '0 0 20px', textAlign: 'left' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700 }}>Reference number</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>{result.referenceNumber}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 6 }}>Save this number to check your application status.</div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/seller-application/status" className="btn btn--primary btn--sm">Check status</Link>
                <button className="btn btn--outline btn--sm" onClick={() => setResult(null)}>Submit another application</button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2>Seller application</h2>
              <p className="contact-form-card__sub">Tell us about you and your business. Fields marked with * are required.</p>

              <div className="form-grid form-grid--2">
                <label className="field"><span>Full name *</span><input required value={form.fullName} onChange={setField('fullName')} placeholder="Your full name" /></label>
                <label className="field"><span>Email address *</span><input required type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" /></label>
                <label className="field"><span>Phone number *</span><input required value={form.phone} onChange={setField('phone')} placeholder="+250 788..." /></label>
                <label className="field"><span>Business name <small>(optional)</small></span><input value={form.businessName} onChange={setField('businessName')} placeholder="Your business or shop name" /></label>
              </div>

              <div className="form-grid form-grid--2">
                <label className="field"><span>Business location *</span><input required value={form.businessLocation} onChange={setField('businessLocation')} placeholder="Kigali, Gasabo" /></label>
                <label className="field"><span>Business category *</span>
                  <select required value={form.businessCategory} onChange={setField('businessCategory')}>
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>

              <label className="field"><span>Business description *</span><textarea required rows="4" minLength={20} value={form.businessDescription} onChange={setField('businessDescription')} placeholder="What do you sell, who do you serve, and what makes your business special?" /></label>
              <label className="field"><span>Why do you want to sell on GuraNeza? *</span><textarea required rows="4" minLength={20} value={form.reason} onChange={setField('reason')} placeholder="Tell us your goals for joining the marketplace." /></label>
              <label className="field"><span>Supporting information <small>(optional)</small></span><textarea rows="3" value={form.supportingInfo} onChange={setField('supportingInfo')} placeholder="TIN, registration, website, social media, or anything helpful." /></label>

              <button className="btn btn--primary btn--block btn--lg" disabled={submitting}>
                {submitting ? 'Submitting application...' : <>Submit application <ArrowRight size={17} /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;
