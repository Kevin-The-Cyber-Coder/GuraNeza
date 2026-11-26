import { Loader2, PackageOpen, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Loader = ({ label = 'Loading...' }) => (
  <div className="state-block">
    <Loader2 className="spin" size={34} />
    <p>{label}</p>
  </div>
);

export const EmptyState = ({ title = 'Nothing here yet', message, action, to }) => (
  <div className="state-block state-block--empty">
    <PackageOpen size={40} />
    <h3>{title}</h3>
    {message && <p>{message}</p>}
    {action && to && <Link to={to} className="btn btn--primary btn--sm">{action}</Link>}
  </div>
);

export const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="state-block state-block--error">
    <AlertTriangle size={38} />
    <h3>We hit a small snag</h3>
    <p>{message}</p>
    {onRetry && <button className="btn btn--outline btn--sm" onClick={onRetry}>Try again</button>}
  </div>
);

export const SectionHeading = ({ eyebrow, title, subtitle, center = false, action }) => (
  <div className={`section-heading ${center ? 'section-heading--center' : ''}`}>
    <div>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const StatusBadge = ({ status }) => (
  <span className={`status-badge status-badge--${statusColorMap[status] || 'muted'}`}>{status}</span>
);

const statusColorMap = {
  Pending: 'warning',
  Processing: 'info',
  Shipped: 'purple',
  Delivered: 'success',
  Cancelled: 'danger',
  New: 'warning',
  Read: 'info',
  Replied: 'success',
  Closed: 'muted',
  paid: 'success',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  active: 'success',
  inactive: 'muted',
  suspended: 'danger',
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  loading = false,
  onConfirm,
  onCancel,
  children,
}) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onCancel?.(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__head">
          <div><h2>{title}</h2></div>
          <button onClick={onCancel} disabled={loading} aria-label="Close">×</button>
        </div>
        <div className="modal__body">
          {message && <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>{message}</p>}
          {children}
          <div className="modal__footer">
            <button className="btn btn--ghost" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
            <button className={`btn btn--${tone}`} onClick={onConfirm} disabled={loading}>
              {loading ? 'Please wait...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Breadcrumbs = ({ items = [] }) => (
  <nav className="breadcrumbs" aria-label="Breadcrumb">
    <Link to="/">Home</Link>
    {items.map((item, i) => (
      <span key={i}>
        <span className="breadcrumbs__sep">/</span>
        {item.to ? <Link to={item.to}>{item.label}</Link> : <span className="breadcrumbs__current">{item.label}</span>}
      </span>
    ))}
  </nav>
);
