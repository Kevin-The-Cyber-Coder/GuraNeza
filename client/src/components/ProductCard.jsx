import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatRWF, getImage } from '../utils/helpers';

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const toast = useToast();
  const image = getImage(product, index);
  const discount = product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return toast('This product is out of stock', 'error');
    addToCart(product, 1);
    toast(`${product.name} added to your cart`);
  };

  return (
    <article className="product-card">
      <Link to={`/product/${product.slug || product._id}`} className="product-card__image">
        <img src={image} alt={product.name} loading="lazy" />
        {discount > 0 && <span className="product-card__discount">-{discount}%</span>}
        {product.featured && <span className="product-card__flag">Featured</span>}
        {product.stock <= 0 && <span className="product-card__out">Out of stock</span>}
        <span className="product-card__quick"><Eye size={16} /> Quick view</span>
      </Link>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <Link to={`/product/${product.slug || product._id}`} className="product-card__title">{product.name}</Link>
        <div className="product-card__rating">
          <Star size={14} fill="currentColor" />
          <span>{product.rating || 4.5}</span>
          <small>({product.numReviews || 0})</small>
        </div>
        <div className="product-card__footer">
          <div className="product-card__price">
            <strong>{formatRWF(product.price)}</strong>
            {product.oldPrice > product.price && <s>{formatRWF(product.oldPrice)}</s>}
          </div>
          <button className="product-card__add" onClick={handleAdd} aria-label={`Add ${product.name} to cart`}>
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
