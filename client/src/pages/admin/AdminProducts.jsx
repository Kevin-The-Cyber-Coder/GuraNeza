import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Package, UploadCloud, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Loader, ErrorState, EmptyState } from '../../components/Common';
import { formatRWF, getImage } from '../../utils/helpers';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Groceries', 'Sports', 'Books', 'Other'];
const emptyProduct = {
  name: '', description: '', price: '', oldPrice: 0, category: 'Electronics', brand: 'GuraNeza',
  stock: 0, featured: false, rating: 4.5, images: [''],
};

const AdminProducts = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyProduct);

  const load = () => {
    setLoading(true);
    setError('');
    productsAPI.mine({ search, category, page, limit: 10 })
      .then((data) => { setProducts(data.products || []); setMeta({ page: data.page, pages: data.pages, total: data.total }); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, category, page]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyProduct, images: [''] });
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || 0,
      category: product.category,
      brand: product.brand || 'GuraNeza',
      stock: product.stock,
      featured: product.featured || false,
      rating: product.rating || 4.5,
      images: product.images?.length ? [...product.images] : [''],
    });
    setModalOpen(true);
  };

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setImage = (index, value) => setForm((prev) => ({ ...prev, images: prev.images.map((img, i) => (i === index ? value : img)) }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      oldPrice: Number(form.oldPrice) || 0,
      stock: Number(form.stock),
      rating: Number(form.rating),
      images: form.images.map((s) => s.trim()).filter(Boolean),
    };
    delete payload._id;
    delete payload.slug;
    delete payload.createdAt;
    delete payload.updatedAt;
    try {
      if (editing) {
        await productsAPI.update(editing._id, payload);
        toast('Product updated successfully');
      } else {
        await productsAPI.create(payload);
        toast('Product added to the shop');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast(err.message || 'Could not save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await productsAPI.delete(product._id);
      toast('Product deleted');
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div><span className="eyebrow">Catalogue</span><h1>Products</h1><p>Manage everything available in your shop.</p></div>
        <button className="btn btn--primary" onClick={openCreate}><Plus size={17} /> Add product</button>
      </div>

      <section className="admin-card">
        <div className="admin-toolbar">
          <label className="admin-search"><Search size={17} /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." /></label>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option>All</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <span className="admin-toolbar__count">{meta.total} products</span>
        </div>

        {loading ? <Loader label="Loading products..." /> : error ? <ErrorState message={error} onRetry={load} /> : products.length === 0 ? (
          <EmptyState title="No products found" message="Try a different search or add your first product." />
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="admin-table__product">
                          <img src={getImage(product)} alt="" />
                          <div><strong>{product.name}</strong><small>{product.brand}</small></div>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td><strong>{formatRWF(product.price)}</strong></td>
                      <td><span className={product.stock <= 0 ? 'stock-badge stock-badge--out' : product.stock < 10 ? 'stock-badge stock-badge--low' : 'stock-badge'}>{product.stock}</span></td>
                      <td>{product.featured ? <span className="status-badge status-badge--purple">Featured</span> : <span className="status-badge status-badge--muted">Standard</span>}</td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => openEdit(product)} aria-label="Edit"><Pencil size={16} /></button>
                          <button onClick={() => remove(product)} className="danger" aria-label="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta.pages > 1 && (
              <div className="admin-pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
                <span>Page {page} of {meta.pages}</span>
                <button disabled={page >= meta.pages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
              </div>
            )}
          </>
        )}
      </section>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal modal--large">
            <div className="modal__head">
              <div><span className="eyebrow">{editing ? 'Edit product' : 'New product'}</span><h2>{editing ? editing.name : 'Add a product'}</h2></div>
              <button onClick={() => setModalOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="modal__body">
              <div className="form-grid form-grid--2">
                <label className="field field--full"><span>Product name *</span><input required value={form.name} onChange={setField('name')} placeholder="e.g. Studio Wireless Headphones" /></label>
                <label className="field field--full"><span>Description *</span><textarea required rows="4" value={form.description} onChange={setField('description')} placeholder="Tell customers about this product..." /></label>
                <label className="field"><span>Price (RWF) *</span><input required type="number" min="0" value={form.price} onChange={setField('price')} /></label>
                <label className="field"><span>Old price (RWF)</span><input type="number" min="0" value={form.oldPrice} onChange={setField('oldPrice')} /></label>
                <label className="field"><span>Category</span><select value={form.category} onChange={setField('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
                <label className="field"><span>Brand</span><input value={form.brand} onChange={setField('brand')} /></label>
                <label className="field"><span>Stock quantity</span><input type="number" min="0" value={form.stock} onChange={setField('stock')} /></label>
                <label className="field"><span>Rating</span><input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={setField('rating')} /></label>
              </div>

              <div className="image-input-group">
                <label><ImageIcon size={15} /> Product images (URLs)</label>
                {form.images.map((image, i) => (
                  <div className="image-input-row" key={i}>
                    <UploadCloud size={16} />
                    <input value={image} onChange={(e) => setImage(i, e.target.value)} placeholder="https://images.unsplash.com/photo-..." />
                    {form.images.length > 1 && <button type="button" onClick={() => setForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}><X size={15} /></button>}
                  </div>
                ))}
                <button type="button" className="add-image-btn" onClick={() => setForm((prev) => ({ ...prev, images: [...prev.images, ''] }))}><Plus size={14} /> Add another image</button>
                {form.images[0] && <img className="image-preview" src={form.images[0]} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />}
              </div>

              <label className="checkbox-row"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Mark as featured product</label>

              <div className="modal__footer">
                <button type="button" className="btn btn--outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}><Package size={16} /> {saving ? 'Saving...' : editing ? 'Save changes' : 'Add product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
