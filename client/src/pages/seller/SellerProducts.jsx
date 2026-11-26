import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, ImagePlus } from 'lucide-react';
import { productsAPI } from '../../services/api';
import { CATEGORIES, formatRWF } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import { Loader, ErrorState, EmptyState, StatusBadge, ConfirmDialog } from '../../components/Common';

const emptyProduct = {
  name: '',
  description: '',
  shortDescription: '',
  price: '',
  oldPrice: '',
  category: 'Fashion',
  brand: '',
  stock: '',
  status: 'published',
  featured: false,
  imagesText: '',
};

const SellerProducts = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadingId, setUploadingId] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    productsAPI
      .mine({ search, page, limit: 10 })
      .then((data) => {
        setProducts(data.products || []);
        setMeta({ page: data.page, pages: data.pages, total: data.total });
      })
      .catch((err) => setError(err.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyProduct);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price ?? '',
      oldPrice: product.oldPrice ?? '',
      category: product.category || 'Fashion',
      brand: product.brand || '',
      stock: product.stock ?? '',
      status: product.status || 'published',
      featured: !!product.featured,
      imagesText: (product.images || []).join('\n'),
    });
    setModalOpen(true);
  };

  const setField = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription,
        price: Number(form.price),
        oldPrice: Number(form.oldPrice || 0),
        category: form.category,
        brand: form.brand,
        stock: Number(form.stock || 0),
        status: form.status,
        images: form.imagesText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editing) {
        await productsAPI.update(editing._id, payload);
        toast('Product updated');
      } else {
        await productsAPI.create(payload);
        toast('Product created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast(err.message || 'Could not save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productsAPI.delete(deleteTarget._id);
      toast('Product deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(err.message || 'Could not delete product', 'error');
    }
  };

  const onUpload = async (productId, files) => {
    if (!files?.length) return;
    setUploadingId(productId);
    try {
      await productsAPI.uploadImages(productId, files);
      toast('Images uploaded');
      load();
    } catch (err) {
      toast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingId('');
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">Seller catalog</span>
          <h1>My Products</h1>
          <p>Create and manage products for your shop.</p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={openCreate}><Plus size={16} /> Add product</button>
      </div>

      <section className="admin-card">
        <div className="admin-toolbar">
          <form className="admin-search" onSubmit={onSearch}>
            <Search size={17} />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search your products..." />
          </form>
          <span className="admin-toolbar__count">{meta.total} products</span>
        </div>

        {loading ? <Loader label="Loading products..." /> : error ? <ErrorState message={error} onRetry={load} /> : products.length === 0 ? (
          <EmptyState title="No products yet" message="Create your first product to start selling on GuraNeza." action={<button className="btn btn--primary btn--sm" onClick={openCreate}><Plus size={16} /> Add product</button>} />
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="admin-table__product">
                          <img src={p.images?.[0] || 'https://placehold.co/80x80?text=No+Image'} alt={p.name} />
                          <div>
                            <strong>{p.name}</strong>
                            <small>{p.category}</small>
                          </div>
                        </div>
                      </td>
                      <td>{formatRWF(p.price)}</td>
                      <td>{p.stock}</td>
                      <td><StatusBadge status={p.status || 'published'} /></td>
                      <td>
                        <div className="table-actions">
                          <label style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid var(--line)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--muted)' }} title="Upload images">
                            <ImagePlus size={16} />
                            <input type="file" accept="image/*" multiple hidden disabled={uploadingId === p._id} onChange={(e) => onUpload(p._id, e.target.files)} />
                          </label>
                          <button onClick={() => openEdit(p)} aria-label="Edit"><Pencil size={16} /></button>
                          <button className="danger" onClick={() => setDeleteTarget(p)} aria-label="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
              <span>Page {meta.page} of {meta.pages}</span>
              <button disabled={page >= meta.pages} onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}>›</button>
            </div>
          </>
        )}
      </section>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal modal--large">
            <div className="modal__head">
              <div><span className="eyebrow">Seller product</span><h2>{editing ? 'Edit product' : 'Add product'}</h2></div>
              <button onClick={() => setModalOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <form className="modal__body" onSubmit={save}>
              <div className="form-grid form-grid--2">
                <label className="field"><span>Name *</span><input required value={form.name} onChange={setField('name')} /></label>
                <label className="field"><span>Category *</span>
                  <select value={form.category} onChange={setField('category')}>
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>
              <label className="field"><span>Short description</span><input value={form.shortDescription} onChange={setField('shortDescription')} maxLength={180} /></label>
              <label className="field"><span>Description *</span><textarea required rows="4" value={form.description} onChange={setField('description')} /></label>
              <div className="form-grid form-grid--3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <label className="field"><span>Price (RWF) *</span><input required type="number" min="0" value={form.price} onChange={setField('price')} /></label>
                <label className="field"><span>Old price</span><input type="number" min="0" value={form.oldPrice} onChange={setField('oldPrice')} /></label>
                <label className="field"><span>Stock *</span><input required type="number" min="0" value={form.stock} onChange={setField('stock')} /></label>
              </div>
              <div className="form-grid form-grid--2">
                <label className="field"><span>Brand</span><input value={form.brand} onChange={setField('brand')} /></label>
                <label className="field"><span>Status</span>
                  <select value={form.status} onChange={setField('status')}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
              </div>
              <label className="field"><span>Image URLs (one per line)</span><textarea rows="3" value={form.imagesText} onChange={setField('imagesText')} placeholder="https://..." /></label>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn btn--primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete product"
        message={deleteTarget ? `Delete "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default SellerProducts;
