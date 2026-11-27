import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Tag } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { Loader } from '../../components/Common';
import { useToast } from '../../context/ToastContext';

const AdminCategories = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.categoriesOverview();
      setCategories(res.categories || []);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><span className="eyebrow">Marketplace</span><h1 style={{ margin: '4px 0 0' }}>Categories</h1><p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>Current product categories from the live catalog schema and product counts.</p></div>
        <button className="btn btn--outline btn--sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {loading ? <Loader label="Loading categories..." /> : (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Category</th><th>Products</th><th>Source</th></tr></thead>
            <tbody>
              {categories.length === 0 ? <tr><td colSpan="3" style={{ padding: 24, color: 'var(--muted)' }}>No categories found.</td></tr> : categories.map((c) => (
                <tr key={c.name}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 30, height: 30, borderRadius: 8, background: '#f0fdf4', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><Tag size={14} /></span><strong>{c.name}</strong></div></td>
                  <td>{c.products}</td>
                  <td><span className="status-badge status-badge--info">Product schema</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
