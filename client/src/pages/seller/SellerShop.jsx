import { useEffect, useState } from 'react';
import { Camera, Save, Store } from 'lucide-react';
import { shopsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Loader, ErrorState, StatusBadge } from '../../components/Common';

const SellerShop = () => {
  const toast = useToast();
  const [shop, setShop] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', phone: '', email: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    shopsAPI
      .mine()
      .then((data) => {
        setShop(data.shop);
        setForm({
          name: data.shop.name || '',
          description: data.shop.description || '',
          phone: data.shop.phone || '',
          email: data.shop.email || '',
          location: data.shop.location || '',
        });
      })
      .catch((err) => setError(err.message || 'Failed to load shop'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await shopsAPI.updateMine(form);
      setShop(data.shop);
      toast(data.message || 'Shop updated');
    } catch (err) {
      toast(err.message || 'Could not update shop', 'error');
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (kind, file) => {
    if (!file) return;
    setUploading(kind);
    try {
      const data = kind === 'logo' ? await shopsAPI.uploadLogo(file) : await shopsAPI.uploadCover(file);
      setShop(data.shop);
      toast('Image uploaded successfully');
    } catch (err) {
      toast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading('');
    }
  };

  if (loading) return <Loader label="Loading your shop..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">Seller shop</span>
          <h1>My Shop</h1>
          <p>Manage your storefront profile. This information is used across the marketplace.</p>
        </div>
        <StatusBadge status={shop?.status || 'active'} />
      </div>

      <div className="admin-grid-2">
        <section className="admin-card">
          <div className="admin-card__head">
            <div><h3>Shop profile</h3><p>Update your public shop details.</p></div>
          </div>

          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label className="field"><span>Shop name *</span><input required value={form.name} onChange={setField('name')} maxLength={120} /></label>
            <label className="field"><span>Description</span><textarea rows="5" value={form.description} onChange={setField('description')} maxLength={2000} placeholder="Tell customers what your shop offers." /></label>
            <div className="form-grid form-grid--2">
              <label className="field"><span>Phone</span><input value={form.phone} onChange={setField('phone')} placeholder="+250 788..." /></label>
              <label className="field"><span>Email</span><input type="email" value={form.email} onChange={setField('email')} placeholder="shop@example.com" /></label>
            </div>
            <label className="field"><span>Location</span><input value={form.location} onChange={setField('location')} placeholder="Kigali, Rwanda" /></label>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn--primary" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card__head">
            <div><h3>Branding</h3><p>Upload a logo and cover image. Local fallback storage is used until Cloudinary is configured.</p></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 10 }}>Cover image</div>
              <div style={{ height: 160, borderRadius: 14, border: '1px dashed var(--line)', background: 'var(--bg-soft)', overflow: 'hidden', display: 'grid', placeItems: 'center', position: 'relative' }}>
                {shop?.coverImage ? <img src={shop.coverImage} alt="Shop cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ color: 'var(--muted)', fontSize: '.82rem' }}><Store size={24} style={{ margin: '0 auto 8px' }} />No cover image</div>}
              </div>
              <label className="btn btn--outline btn--sm" style={{ marginTop: 10, cursor: 'pointer' }}>
                <Camera size={15} /> {uploading === 'cover' ? 'Uploading...' : 'Upload cover'}
                <input type="file" accept="image/*" hidden disabled={uploading === 'cover'} onChange={(e) => onUpload('cover', e.target.files?.[0])} />
              </label>
            </div>

            <div>
              <div style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 10 }}>Logo</div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 88, height: 88, borderRadius: 18, border: '1px solid var(--line)', background: 'var(--bg-soft)', overflow: 'hidden', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                  {shop?.logo ? <img src={shop.logo} alt="Shop logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={28} />}
                </div>
                <label className="btn btn--outline btn--sm" style={{ cursor: 'pointer' }}>
                  <Camera size={15} /> {uploading === 'logo' ? 'Uploading...' : 'Upload logo'}
                  <input type="file" accept="image/*" hidden disabled={uploading === 'logo'} onChange={(e) => onUpload('logo', e.target.files?.[0])} />
                </label>
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 12, background: '#fffaf0', border: '1px solid #fde68a', fontSize: '.8rem', color: '#92400e', lineHeight: 1.7 }}>
              Local uploads are stored on the server filesystem. On Render, files can be lost on redeploy. Configure Cloudinary for persistent production storage.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SellerShop;
