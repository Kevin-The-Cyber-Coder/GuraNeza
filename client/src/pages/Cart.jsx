import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ShieldCheck, Truck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { EmptyState, Breadcrumbs } from '../components/Common';
import { formatRWF, getImage } from '../utils/helpers';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal, shippingFee, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="container page-section">
        <Breadcrumbs items={[{ label: 'Cart' }]} />
        <EmptyState title="Your cart is empty" message="Looks like you haven't added anything yet. Let's find something you love." action="Browse the shop" to="/shop" />
      </div>
    );
  }

  return (
    <div className="container page-section">
      <Breadcrumbs items={[{ label: 'Cart' }]} />
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Almost there</span>
          <h1>Your shopping cart</h1>
          <p>{itemCount} item{itemCount === 1 ? '' : 's'} in your bag</p>
        </div>
        <Link to="/shop" className="btn btn--outline btn--sm">Continue shopping <ArrowRight size={15} /></Link>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          <div className="cart-items__head">
            <span>Product</span><span>Price</span><span>Quantity</span><span>Total</span><span />
          </div>
          {items.map((item) => (
            <div className="cart-item" key={item.product}>
              <div className="cart-item__product">
                <img src={getImage(item)} alt={item.name} />
                <div>
                  <Link to={`/product/${item.slug || item.product}`}>{item.name}</Link>
                  <small>In stock · Ready to ship</small>
                  <button className="cart-item__remove" onClick={() => removeFromCart(item.product)}><Trash2 size={14} /> Remove</button>
                </div>
              </div>
              <div className="cart-item__price">{formatRWF(item.price)}</div>
              <div className="quantity-control quantity-control--sm">
                <button onClick={() => updateQuantity(item.product, item.quantity - 1)} aria-label="Decrease"><Minus size={14} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product, item.quantity + 1)} aria-label="Increase"><Plus size={14} /></button>
              </div>
              <div className="cart-item__total">{formatRWF(item.price * item.quantity)}</div>
              <button className="cart-item__remove-icon" onClick={() => removeFromCart(item.product)} aria-label="Remove item"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h3>Order summary</h3>
          <div className="cart-summary__row"><span>Subtotal ({itemCount} items)</span><strong>{formatRWF(subtotal)}</strong></div>
          <div className="cart-summary__row"><span>Delivery (Kigali)</span><strong>{formatRWF(shippingFee)}</strong></div>
          <div className="cart-summary__row cart-summary__row--discount"><span>Discount</span><strong>{formatRWF(0)}</strong></div>
          <div className="cart-summary__divider" />
          <div className="cart-summary__total"><span>Total</span><strong>{formatRWF(total)}</strong></div>
          <Link to="/checkout" className="btn btn--primary btn--block btn--lg">Proceed to checkout <ArrowRight size={17} /></Link>
          <div className="cart-summary__perks">
            <span><Truck size={16} /> Fast local delivery</span>
            <span><ShieldCheck size={16} /> Secure & trusted checkout</span>
            <span><Tag size={16} /> Fair prices, always</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
