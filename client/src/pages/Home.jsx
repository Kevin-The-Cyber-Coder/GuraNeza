import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
  Wallet,
  Star,
  Quote,
  Sparkles,
  Smartphone,
  Shirt,
  Sofa,
  Coffee,
  SprayCan,
  Dumbbell,
  BookOpen,
} from 'lucide-react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { SectionHeading, Loader } from '../components/Common';
import { useToast } from '../context/ToastContext';

const categories = [
  { name: 'Electronics', icon: Smartphone, color: '#e8f3ef', tint: '#0b6b4f', count: 'Gadgets & tech' },
  { name: 'Fashion', icon: Shirt, color: '#fdf0e3', tint: '#b45309', count: 'Wear your style' },
  { name: 'Home & Living', icon: Sofa, color: '#eef0fb', tint: '#4338ca', count: 'Make it yours' },
  { name: 'Beauty', icon: SprayCan, color: '#fdeef2', tint: '#be185d', count: 'Feel your best' },
  { name: 'Groceries', icon: Coffee, color: '#f2f5e8', tint: '#3f6212', count: 'Everyday goods' },
  { name: 'Sports', icon: Dumbbell, color: '#e9f4fa', tint: '#0369a1', count: 'Stay active' },
  { name: 'Books', icon: BookOpen, color: '#f5efe8', tint: '#92400e', count: 'Feed your mind' },
  { name: 'Other', icon: Sparkles, color: '#f1f1f4', tint: '#4b5563', count: 'Discover more' },
];

const testimonials = [
  {
    name: 'Alice Uwimana',
    role: 'Customer · Kigali',
    text: 'I ordered organic coffee and a backpack in the morning and they arrived the same afternoon. The quality is excellent — GuraNeza is now my go-to shop!',
    initials: 'AU',
  },
  {
    name: 'Jean Paul N.',
    role: 'Customer · Gasabo',
    text: 'Finally an online shop that feels local and trustworthy. Paying on delivery made it so easy, and the product was exactly as described.',
    initials: 'JP',
  },
  {
    name: 'Marie Claire',
    role: 'Customer · Nyarugenge',
    text: 'Their skincare selection is amazing and delivery was super fast. Customer service answered all my questions within minutes.',
    initials: 'MC',
  },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    productsAPI
      .list({ featured: 'true', limit: 8 })
      .then((data) => { if (!cancelled) setFeatured(data.products || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const subscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast('You are subscribed! Watch your inbox for GuraNeza deals.');
    setEmail('');
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero__glow hero__glow--one" />
        <div className="hero__glow hero__glow--two" />
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="hero__eyebrow"><Sparkles size={15} /> Your neighbourhood shop, online</span>
            <h1>Good things,<br /><em>closer to you.</em></h1>
            <p>
              Discover quality products at fair prices, delivered across Kigali.
              From daily essentials to the little luxuries — shop the way you love with <strong>GuraNeza</strong>.
            </p>
            <div className="hero__actions">
              <Link to="/shop" className="btn btn--primary btn--lg">Start shopping <ArrowRight size={18} /></Link>
              <Link to="/track-order" className="btn btn--ghost btn--lg">Track an order</Link>
            </div>
            <div className="hero__trust">
              <div className="hero__avatars">
                <span>AU</span><span>JP</span><span>MC</span><span>+</span>
              </div>
              <div>
                <div className="hero__stars"><Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /></div>
                <small>Loved by 2,000+ happy shoppers in Rwanda</small>
              </div>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__image-wrap">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85"
                alt="A beautifully arranged modern shop"
              />
              <div className="hero__floating hero__floating--top">
                <span className="hero__floating-icon"><Truck size={20} /></span>
                <div><strong>Same-day delivery</strong><small>Around Kigali</small></div>
              </div>
              <div className="hero__floating hero__floating--bottom">
                <span className="hero__floating-icon hero__floating-icon--gold"><ShieldCheck size={20} /></span>
                <div><strong>Shop with confidence</strong><small>Quality guaranteed</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value bar */}
      <section className="value-bar">
        <div className="container value-bar__grid">
          <div><Truck size={24} /><div><strong>Fast local delivery</strong><span>Right to your door in Kigali</span></div></div>
          <div><Wallet size={24} /><div><strong>Flexible payments</strong><span>Cash on delivery & Mobile Money</span></div></div>
          <div><ShieldCheck size={24} /><div><strong>Quality you can trust</strong><span>Carefully selected products</span></div></div>
          <div><Headphones size={24} /><div><strong>Real human support</strong><span>We are here to help, always</span></div></div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Explore by category"
            title="Find exactly what you need"
            subtitle="Something for every part of your day."
            action={<Link to="/shop" className="text-link">View all products <ArrowRight size={16} /></Link>}
          />
          <div className="category-grid">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.name} to={`/shop?category=${encodeURIComponent(cat.name)}`} className="category-card">
                  <span className="category-card__icon" style={{ background: cat.color, color: cat.tint }}>
                    <Icon size={26} />
                  </span>
                  <strong>{cat.name}</strong>
                  <small>{cat.count}</small>
                  <ArrowRight size={15} className="category-card__arrow" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="section section--tinted">
        <div className="container">
          <SectionHeading
            eyebrow="Handpicked for you"
            title="Trending on GuraNeza"
            subtitle="The products our community is loving right now."
            center
          />
          {loading ? (
            <Loader label="Fetching the good stuff..." />
          ) : (
            <div className="product-grid">
              {featured.slice(0, 8).map((product, i) => <ProductCard key={product._id} product={product} index={i} />)}
            </div>
          )}
          <div className="section__cta"><Link to="/shop" className="btn btn--outline btn--lg">Explore the full shop <ArrowRight size={17} /></Link></div>
        </div>
      </section>

      {/* Story / promo banner */}
      <section className="section">
        <div className="container">
          <div className="promo-split">
            <div className="promo-split__image">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=85"
                alt="Friends shopping together"
              />
              <div className="promo-split__stat"><strong>2,000+</strong><span>happy customers</span></div>
            </div>
            <div className="promo-split__content">
              <span className="eyebrow">Why GuraNeza?</span>
              <h2>Shopping made simple, personal and proudly Rwandan.</h2>
              <p>
                We started GuraNeza with one idea: everyone in Kigali deserves access to great products
                without the hassle. No long queues, no uncertainty — just a smooth experience from browsing to doorstep.
              </p>
              <ul className="check-list">
                <li>Curated products from trusted local and international brands</li>
                <li>Clear prices in Rwandan Francs — no hidden surprises</li>
                <li>Easy order tracking, every step of the way</li>
                <li>Support from real people who care</li>
              </ul>
              <Link to="/contact" className="btn btn--primary">Talk to our team <ArrowRight size={17} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section section--dark">
        <div className="container">
          <SectionHeading
            eyebrow="Kind words"
            title="What our customers say"
            subtitle="Real stories from shoppers across Kigali."
            center
          />
          <div className="testimonial-grid">
            {testimonials.map((t) => (
              <article key={t.name} className="testimonial-card">
                <Quote size={26} className="testimonial-card__quote" />
                <div className="testimonial-card__stars">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="currentColor" />)}
                </div>
                <p>“{t.text}”</p>
                <div className="testimonial-card__author">
                  <span>{t.initials}</span>
                  <div><strong>{t.name}</strong><small>{t.role}</small></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section newsletter-section">
        <div className="container">
          <div className="newsletter-box">
            <div>
              <span className="eyebrow eyebrow--light">Never miss a deal</span>
              <h2>Be first to know about new arrivals & offers</h2>
              <p>Join the GuraNeza family. We promise only the good stuff.</p>
            </div>
            <form onSubmit={subscribe}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" required />
              <button className="btn btn--gold" type="submit">Subscribe <ArrowRight size={17} /></button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
