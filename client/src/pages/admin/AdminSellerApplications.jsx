import { useEffect, useState } from 'react';
import { Search, Eye, CheckCircle2, XCircle, RefreshCcw, X, Copy, ExternalLink } from 'lucide-react';
import { sellerApplicationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Loader, ErrorState, EmptyState, StatusBadge, ConfirmDialog } from '../../components/Common';
import { formatDate } from '../../utils/helpers';

const STATUSES = ['all', 'pending', 'approved', 'rejected'];

const AdminSellerApplications = () => {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activationLink, setActivationLink] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    sellerApplicationsAPI
      .all({ status, search, page, limit: 10 })
      .then((data) => {
        setApplications(data.applications || []);
        setCounts(data.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
        setPages(data.pages || 1);
      })
      .catch((err) => setError(err.message || 'Failed to load applications'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, search, page]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const data = await sellerApplicationsAPI.get(id);
      setSelected(data);
      if (data.invitation?.tokenHash) {
        // raw token not available from API; only show if returned by action
      }
    } catch (err) {
      toast(err.message || 'Could not load application', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const runAction = async (id, action, successMessage) => {
    setActionLoading(action);
    try {
      const data = await action === 'approve'
        ? await sellerApplicationsAPI.approve(id)
        : await sellerApplicationsAPI.resendInvitation(id);
      toast(data.message || successMessage);
      if (data.activationUrl) {
        setActivationLink(data.activationUrl);
      } else {
        setActivationLink('');
      }
      await load();
      if (selected?.application?._id === id) await openDetail(id);
    } catch (err) {
      toast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    if (rejectReason.trim().length < 5) {
      toast('Please provide a clear rejection reason', 'error');
      return;
    }
    setActionLoading('reject');
    try {
      const data = await sellerApplicationsAPI.reject(rejectTarget._id, rejectReason.trim());
      toast(data.message || 'Application rejected');
      setRejectTarget(null);
      setRejectReason('');
      setActivationLink('');
      await load();
      if (selected?.application?._id === rejectTarget._id) await openDetail(rejectTarget._id);
    } catch (err) {
      toast(err.message || 'Could not reject application', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const copyLink = async () => {
    if (!activationLink) return;
    try {
      await navigator.clipboard.writeText(activationLink);
      toast('Activation link copied');
    } catch {
      toast('Could not copy the link', 'error');
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const app = selected?.application;
  const invitation = selected?.invitation;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">Marketplace</span>
          <h1>Seller Applications</h1>
          <p>Review, approve, reject, and resend seller activation invitations.</p>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          ['Total', counts.total || 0, 'var(--primary)'],
          ['Pending', counts.pending || 0, '#d97706'],
          ['Approved', counts.approved || 0, '#0f7a4f'],
          ['Rejected', counts.rejected || 0, '#dc2626'],
        ].map(([label, value, color]) => (
          <div className="stat-card" key={label} style={{ '--stat-color': color }}>
            <div className="stat-card__body">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>

      <section className="admin-card">
        <div className="admin-toolbar">
          <form className="admin-search" onSubmit={onSearch}>
            <Search size={17} />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search name, email, business, reference..." />
          </form>
          <div className="filter-tabs">
            {STATUSES.map((s) => (
              <button key={s} className={status === s ? 'active' : ''} onClick={() => { setStatus(s); setPage(1); }}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <span className="admin-toolbar__count">{counts.total || 0} applications</span>
        </div>

        {activationLink && (
          <div style={{ margin: '16px 0', padding: 14, border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <strong style={{ display: 'block', fontSize: '.82rem', color: '#1d4ed8' }}>Development activation link</strong>
              <div style={{ fontSize: '.76rem', color: '#334155', wordBreak: 'break-all', marginTop: 4 }}>{activationLink}</div>
            </div>
            <button className="btn btn--outline btn--sm" onClick={copyLink}><Copy size={14} /> Copy</button>
            <a className="btn btn--primary btn--sm" href={activationLink} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Open</a>
          </div>
        )}

        {loading ? <Loader label="Loading applications..." /> : error ? <ErrorState message={error} onRetry={load} /> : applications.length === 0 ? (
          <EmptyState title="No applications found" message="Try changing the filter or search." />
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Applicant</th>
                    <th>Business</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.referenceNumber}</strong></td>
                      <td>
                        <div className="admin-table__customer">
                          <span>{item.fullName?.charAt(0)?.toUpperCase()}</span>
                          <div><strong>{item.fullName}</strong><small>{item.email}</small></div>
                        </div>
                      </td>
                      <td>
                        <strong style={{ display: 'block' }}>{item.businessName || '—'}</strong>
                        <small style={{ color: 'var(--muted)' }}>{item.businessCategory}</small>
                      </td>
                      <td><StatusBadge status={item.status} /></td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => openDetail(item._id)} aria-label="View"><Eye size={16} /></button>
                          {item.status === 'pending' && (
                            <>
                              <button onClick={() => runAction(item._id, 'approve', 'Application approved')} disabled={actionLoading === 'approve'} aria-label="Approve" title="Approve"><CheckCircle2 size={16} /></button>
                              <button className="danger" onClick={() => { setRejectTarget(item); setRejectReason(''); }} aria-label="Reject" title="Reject"><XCircle size={16} /></button>
                            </>
                          )}
                          {item.status === 'approved' && (
                            <button onClick={() => runAction(item._id, 'resend', 'Invitation resent')} disabled={actionLoading === 'resend'} aria-label="Resend invitation" title="Resend invitation"><RefreshCcw size={16} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>›</button>
            </div>
          </>
        )}
      </section>

      {(selected || detailLoading) && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal modal--large">
            <div className="modal__head">
              <div><span className="eyebrow">Seller application</span><h2>{app?.referenceNumber || 'Application'}</h2></div>
              <button onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button>
            </div>
            <div className="modal__body">
              {detailLoading || !app ? <Loader label="Loading application..." /> : (
                <>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <StatusBadge status={app.status} />
                    <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Submitted {formatDate(app.createdAt)}</span>
                    {app.reviewedAt && <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Reviewed {formatDate(app.reviewedAt)}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                    {[
                      ['Full name', app.fullName],
                      ['Email', app.email],
                      ['Phone', app.phone],
                      ['Business name', app.businessName || '—'],
                      ['Location', app.businessLocation],
                      ['Category', app.businessCategory],
                    ].map(([label, value]) => (
                      <div key={label} style={{ padding: 14, border: '1px solid var(--line)', borderRadius: 12, background: 'var(--bg-soft)' }}>
                        <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
                        <div style={{ marginTop: 6, fontSize: '.86rem', fontWeight: 600 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div><strong style={{ display: 'block', marginBottom: 8 }}>Business description</strong><p style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>{app.businessDescription}</p></div>
                  <div><strong style={{ display: 'block', marginBottom: 8 }}>Reason for joining</strong><p style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>{app.reason}</p></div>
                  {app.supportingInfo && <div><strong style={{ display: 'block', marginBottom: 8 }}>Supporting information</strong><p style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>{app.supportingInfo}</p></div>}
                  {app.rejectionReason && <div style={{ padding: 14, background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 12 }}><strong style={{ display: 'block', marginBottom: 8, color: '#991b1b' }}>Rejection reason</strong><p style={{ color: '#991b1b', lineHeight: 1.7 }}>{app.rejectionReason}</p></div>}
                  {invitation && (
                    <div style={{ padding: 14, border: '1px solid var(--line)', borderRadius: 12 }}>
                      <strong style={{ display: 'block', marginBottom: 8 }}>Invitation</strong>
                      <div style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.8 }}>
                        <div>Sent: {invitation.sentAt ? formatDate(invitation.sentAt, { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                        <div>Expires: {invitation.expiresAt ? formatDate(invitation.expiresAt, { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                        <div>Used: {invitation.usedAt ? formatDate(invitation.usedAt, { hour: '2-digit', minute: '2-digit' }) : 'No'}</div>
                        <div>Revoked: {invitation.revokedAt ? formatDate(invitation.revokedAt, { hour: '2-digit', minute: '2-digit' }) : 'No'}</div>
                      </div>
                    </div>
                  )}

                  <div className="modal__footer">
                    {app.status === 'pending' && (
                      <>
                        <button className="btn btn--ghost danger" onClick={() => { setRejectTarget(app); setRejectReason(''); }}>Reject</button>
                        <button className="btn btn--primary" onClick={() => runAction(app._id, 'approve', 'Application approved')} disabled={actionLoading === 'approve'}>
                          <CheckCircle2 size={16} /> {actionLoading === 'approve' ? 'Approving...' : 'Approve & send invitation'}
                        </button>
                      </>
                    )}
                    {app.status === 'approved' && (
                      <button className="btn btn--outline" onClick={() => runAction(app._id, 'resend', 'Invitation resent')} disabled={actionLoading === 'resend'}>
                        <RefreshCcw size={16} /> {actionLoading === 'resend' ? 'Resending...' : 'Resend invitation'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject seller application"
        message={rejectTarget ? `Provide a clear reason for rejecting ${rejectTarget.fullName}'s application. The applicant will receive this reason by email.` : ''}
        confirmLabel="Reject application"
        tone="danger"
        loading={actionLoading === 'reject'}
        onCancel={() => { if (actionLoading !== 'reject') { setRejectTarget(null); setRejectReason(''); } }}
        onConfirm={submitReject}
      >
        <label className="field">
          <span>Rejection reason *</span>
          <textarea rows="4" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain what is missing or why the application cannot be approved." />
        </label>
      </ConfirmDialog>
    </div>
  );
};

export default AdminSellerApplications;
