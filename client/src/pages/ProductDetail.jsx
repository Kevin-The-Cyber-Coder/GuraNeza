import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingCart, Star, Minus, Plus, Truck, ShieldCheck, RotateCcw, Heart,
  Share2, Check, ChevronRight,
} from 'lucide-react';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs, Loader, ErrorState, SectionHeading, StatusBadge } from '../components/Common';
import ProductCard from '../components/ProductCard';
import { formatRWF, getImage } from '../utils/helpers';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState('description');
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setActiveImage(0);
    setQuantity(1);
    productsAPI
      .get(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data.product);
        setRelated(data.related || []);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleAdd = () => {
    if (product.stock <= 0) return toast('Sorry, this item is out of stock', 'error');
    addToCart(product, quantity);
    toast(`${quantity} × ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    handleAdd();
    navigate('/cart');
  };

  if (loading) return <div className="container page-section"><Loader label="Loading product..." /></div>;
  if (error || !product) return <div className="container page-section"><ErrorState message={error || 'Product not found'} /></div>;

  const images = product.images?.length ? product.images : [getImage(product)];
  const discount = product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="container page-section">
      <Breadcrumbs items={[{ label: 'Shop', to: '/shop' }, { label: product.category, to: `/shop?category=${encodeURIComponent(product.category)}` }, { label: product.name }]} />

      <div className="product-detail">
        <div className="product-detail__gallery">
          <div className="product-detail__main-image">
            <img src={images[activeImage]} alt={product.name} />
            {discount > 0 && <span className="product-card__discount">-{discount}%</span>}
          </div>
          {images.length > 1 && (
            <div className="product-detail__thumbs">
              {images.map((image, i) => (
                <button key={i} className={activeImage === i ? 'active' : ''} onClick={() => setActiveImage(i)}>
                  <img src={image} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail__info">
          <div className="product-detail__meta">
            <span className="product-card__category">{product.brand} · {product.category}</span>
            {product.featured && <StatusBadge status="New" />}
          </div>
          <h1>{product.name}</h1>
          <div className="product-detail__rating">
            <span className="stars">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={15} fill={s <= Math.round(product.rating) ? 'currentColor' : 'none'} />)}</span>
            <strong>{product.rating || 4.5}</strong>
            <span>({product.numReviews || 0} reviews)</span>
            <span className="dot">·</span>
            <span>{product.sold || 0} sold</span>
          </div>

          <div className="product-detail__price">
            <strong>{formatRWF(product.price)}</strong>
            {product.oldPrice > product.price && <s>{formatRWF(product.oldPrice)}</s>}
            {discount > 0 && <span className="save-tag">Save {formatRWF(product.oldPrice - product.price)}</span>}
          </div>

          <p className="product-detail__description">{product.shortDescription || product.description}</p>

          <div className="product-detail__stock">
            {product.stock > 0 ? (
              <span className="in-stock"><Check size={15} /> In stock — {product.stock} available</span>
            ) : (
              <span className="out-of-stock">Currently out of stock</span>
            )}
          </div>

          <div className="product-detail__purchase">
            <div className="quantity-control">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus size={16} /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))} aria-label="Increase quantity"><Plus size={16} /></button>
            </div>
            <button className="btn btn--primary btn--lg" onClick={handleAdd} disabled={product.stock <= 0}>
              <ShoppingCart size={19} /> Add to cart
            </button>
            <button className="btn btn--outline btn--icon-lg" aria-label="Save to wishlist" onClick={() => toast('Saved to your wishlist')}><Heart size={19} /></button>
            <button className="btn btn--outline btn--icon-lg" aria-label="Share product" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast('Product link copied!'); }}><Share2 size={18} /></button>
          </div>

          <button className="btn btn--gold btn--block" onClick={handleBuyNow} disabled={product.stock <= 0}>Buy it now <ChevronRight size={17} /></button>

          <div className="product-detail__assurances">
            <div><Truck size={20} /><span><strong>Fast delivery</strong><small>Across Kigali</small></span></div>
            <div><ShieldCheck size={20} /><span><strong>Quality assured</strong><small>Genuine products</small></span></div>
            <div><RotateCcw size={20} /><span><strong>Easy returns</strong><small>Within 7 days</small></span></div>
          </div>
        </div>
      </div>

      {/* Product information tabs */}
      <section className="product-tabs-section">
        <div className="product-tabs">
          <div className="product-tabs__nav">
            {[
              { key: 'description', label: 'Description' },
              { key: 'details', label: 'Product details' },
              { key: 'reviews', label: `Reviews (${product.numReviews || 0})` },
            ].map((t) => (
              <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>{t.label}</button>
            ))}
          </div>
          <div className="product-tabs__body">
            {tab === 'description' && (
              <div className="prose">
                <p>{product.description}</p>
                {product.tags?.length > 0 && (
                  <div className="tag-row">{product.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
                )}
              </div>
            )}
            {tab === 'details' && (
              <table className="spec-table">
                <tbody>
                  <tr><th>Brand</th><td>{product.brand}</td></tr>
                  <tr><th>Category</th><td>{product.category}</td></tr>
                  <tr><th>SKU</th><td>GN-{String(product._id).slice(-8).toUpperCase()}</td></tr>
                  <tr><th>Availability</th><td>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</td></tr>
                  <tr><th>Rating</th><td>{product.rating || 4.5} / 5</td></tr>
                </tbody>
              </table>
            )}
            {tab === 'reviews' && (
              <div className="reviews-empty">
                <Star size={30} />
                <h3>Reviews are on the way</h3>
                <p>This product is rated {product.rating || 4.5} / 5 by our customers. Be the first to share your experience after purchase.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <SectionHeading eyebrow="You may also like" title="More from this category" action={<Link to="/shop" className="text-link">View all <ChevronRight size={16} /></Link>} />
          <div className="product-grid">
            {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
