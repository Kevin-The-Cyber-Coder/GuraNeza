import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { productsAPI } from '../../services/api';
import { formatRWF } from '../../utils/helpers';
import { Loader, ErrorState } from '../../components/Common';
import { useToast } from '../../context/ToastContext';

const SellerInventory = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setProducts((await productsAPI.mine({ limit: 100 })).products || []); }
    catch (e) { setError(e.message || 'Failed to load inventory'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  if (loading) return <Loader label="Loading inventory..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><span className="eyebrow">Catalog</span><h1 style={{ margin: '4px 0 0' }}>Inventory</h1><p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>Real stock levels from your products.</p></div>
        <button className="btn btn--outline btn--sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Product</th><th>Status</th><th>Price</th><th>Stock</th><th>Sold</th></tr></thead>
          <tbody>
            {products.length === 0 ? <tr><td colSpan="5" style={{ padding: 24, color: 'var(--muted)' }}>No products found.</td></tr> : products.map((p) => (
              <tr key={p._id}>
                <td><strong>{p.name}</strong><div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{p.category}</div></td>
                <td><span className={`status-badge status-badge--${p.status === 'published' ? 'success' : 'warning'}`}>{p.status}</span></td>
                <td>{formatRWF(p.price)}</td>
                <td>{p.stock < 10 ? <span style={{ color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} /> {p.stock}</span> : p.stock}</td>
                <td>{p.sold || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerInventory;
