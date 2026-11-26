import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { shopsAPI } from '../../services/api';
import { Loader, ErrorState, StatusBadge } from '../../components/Common';

const SellerDashboard = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    shopsAPI
      .mine()
      .then((data) => setShop(data.shop))
      .catch((err) => setError(err.message || 'Failed to load your shop'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Loader label="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">Seller overview</span>
          <h1>Welcome to your seller dashboard</h1>
          <p>Manage your shop profile and get ready for marketplace sales.</p>
        </div>
        <Link to="/seller/shop" className="btn btn--primary btn--sm"><Store size={16} /> Manage shop</Link>
      </div>

      <div className="admin-grid-2">
        <section className="admin-card">
          <div className="admin-card__head">
            <div>
              <h3>Shop profile</h3>
              <p>Live information from your seller account.</p>
            </div>
            <StatusBadge status={shop?.status || 'active'} />
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: 16, background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {shop?.logo ? <img src={shop.logo} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={28} />}
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '1.15rem' }}>{shop?.name}</strong>
              <span style={{ color: 'var(--muted)', fontSize: '.83rem' }}>/{shop?.slug}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10, fontSize: '.86rem' }}>
            <div style={{ display: 'flex', gap: 10, color: 'var(--ink-soft)' }}><MapPin size={16} /> {shop?.location || 'No location added yet'}</div>
            <div style={{ display: 'flex', gap: 10, color: 'var(--ink-soft)' }}><Phone size={16} /> {shop?.phone || 'No phone added yet'}</div>
            <div style={{ display: 'flex', gap: 10, color: 'var(--ink-soft)' }}><Mail size={16} /> {shop?.email || 'No email added yet'}</div>
          </div>

          {shop?.description && <p style={{ marginTop: 18, color: 'var(--muted)', lineHeight: 1.7 }}>{shop.description}</p>}

          <div className="admin-card__cta">
            <Link to="/seller/shop" className="btn btn--outline btn--sm">Edit shop profile <ExternalLink size={14} /></Link>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card__head">
            <div>
              <h3>Next marketplace modules</h3>
              <p>These sections will be enabled as Phase 4+ modules land.</p>
            </div>
          </div>
          <div className="status-breakdown">
            {[
              ['Products', 'Seller product CRUD, stock, and images'],
              ['Orders', 'Seller suborders and fulfillment workflow'],
              ['Analytics', 'Real sales and performance metrics'],
              ['Reviews', 'Customer reviews and seller responses'],
            ].map(([title, desc]) => (
              <div key={title} style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                <strong style={{ display: 'block', fontSize: '.86rem' }}>{title}</strong>
                <span style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SellerDashboard;
