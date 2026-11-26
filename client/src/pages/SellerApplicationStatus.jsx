import { useState } from 'react';
import { Search, CheckCircle2, Clock3, XCircle, FileSearch } from 'lucide-react';
import { sellerApplicationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs, StatusBadge } from '../components/Common';
import { formatDate } from '../utils/helpers';

const STATUS_COPY = {
  pending: {
    icon: Clock3,
    color: 'var(--gold-dark)',
    title: 'Application under review',
    message: 'Your application has been received and is waiting for review by the GuraNeza team.',
  },
  approved: {
    icon: CheckCircle2,
    color: 'var(--primary)',
    title: 'Application approved',
    message: 'Your application was approved. Check your email for the secure activation link to set your seller password.',
  },
  rejected: {
    icon: XCircle,
    color: 'var(--danger)',
    title: 'Application not approved',
    message: 'Your application was reviewed, but it was not approved at this time.',
  },
};

const SellerApplicationStatus = () => {
  const toast = useToast();
  const [form, setForm] = useState({ referenceNumber: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState(null);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await sellerApplicationsAPI.checkStatus({
        referenceNumber: form.referenceNumber.trim(),
        email: form.email.trim(),
      });
      setApplication(data.application);
    } catch (err) {
      setApplication(null);
      toast(err.message || 'Could not find that application', 'error');
    } finally {
      setLoading(false);
    }
  };

  const status = application ? STATUS_COPY[application.status] : null;
  const Icon = status?.icon || FileSearch;

  return (
    <div className="container page-section">
      <Breadcrumbs items={[{ label: 'Become a Seller', to: '/become-a-seller' }, { label: 'Application Status' }]} />

      <div className="contact-page" style={{ alignItems: 'start' }}>
        <div className="contact-info">
          <span className="eyebrow">Seller application</span>
          <h1>Check your application status</h1>
          <p>Enter the reference number from your confirmation screen and the email address you used to apply.</p>

          <div className="contact-form-card" style={{ marginTop: 28 }}>
            <form onSubmit={submit}>
              <label className="field"><span>Reference number *</span><input required value={form.referenceNumber} onChange={setField('referenceNumber')} placeholder="SA-20261122-ABC123" /></label>
              <label className="field"><span>Email address *</span><input required type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" /></label>
              <button className="btn btn--primary btn--block" disabled={loading}>
                <Search size={17} /> {loading ? 'Checking...' : 'Check status'}
              </button>
            </form>
          </div>
        </div>

        <div className="contact-form-card">
          {!application ? (
            <div className="contact-sent" style={{ padding: '40px 10px' }}>
              <FileSearch size={52} style={{ color: 'var(--primary)', opacity: .45 }} />
              <h2>No application selected</h2>
              <p>Submit your details to see the current status of your seller application.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-soft)', display: 'grid', placeItems: 'center', color: status.color }}>
                  <Icon size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Status</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 3 }}>
                    <strong style={{ fontSize: '1.05rem' }}>{status.title}</strong>
                    <StatusBadge status={application.status} />
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--muted)', lineHeight: 1.75, marginBottom: 20 }}>{status.message}</p>

              <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                {[
                  ['Reference', application.referenceNumber],
                  ['Applicant', application.fullName],
                  ['Business', application.businessName || 'Not provided'],
                  ['Category', application.businessCategory],
                  ['Submitted', formatDate(application.submittedAt)],
                  ['Reviewed', application.reviewedAt ? formatDate(application.reviewedAt) : 'Not yet reviewed'],
                ].map(([label, value], i) => (
                  <div key={label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, padding: '12px 14px', background: i % 2 ? 'var(--bg-soft)' : '#fff', borderTop: i ? '1px solid var(--line)' : 0 }}>
                    <span style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 700 }}>{label}</span>
                    <span style={{ fontSize: '.84rem', color: 'var(--ink)' }}>{value}</span>
                  </div>
                ))}
              </div>

              {application.status === 'rejected' && application.rejectionReason && (
                <div style={{ marginTop: 18, padding: 16, borderRadius: 12, background: '#fff5f5', border: '1px solid #fecaca', color: '#991b1b' }}>
                  <strong style={{ display: 'block', marginBottom: 6, fontSize: '.82rem' }}>Reason</strong>
                  <p style={{ margin: 0, fontSize: '.84rem', lineHeight: 1.7 }}>{application.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerApplicationStatus;
