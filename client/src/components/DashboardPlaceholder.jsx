import { Construction } from 'lucide-react';

const DashboardPlaceholder = ({ title, description, requiredRole, actions = [] }) => (
  <div className="admin-card" style={{ padding: 28 }}>
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f1f5f9', color: '#475569', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Construction size={24} />
      </div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <span className="eyebrow" style={{ marginBottom: 8 }}>Module status</span>
        <h2 style={{ margin: '0 0 10px', fontSize: '1.45rem' }}>{title}</h2>
        <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.75, maxWidth: 760 }}>
          {description || 'This module is part of the GuraNeza RBAC roadmap but is not yet backed by a live data workflow. No mock data is shown.'}
        </p>
        {requiredRole && (
          <div style={{ marginTop: 14, fontSize: '.8rem', color: '#334155' }}>
            <strong>Access:</strong> {requiredRole} only, enforced by backend authorization.
          </div>
        )}
        {actions.length > 0 && (
          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default DashboardPlaceholder;
