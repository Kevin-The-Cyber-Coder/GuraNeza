import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, Grid2X2, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Breadcrumbs, EmptyState, ErrorState, Loader } from '../components/Common';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Groceries', 'Sports', 'Books', 'Other'];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || 'All';
  const keyword = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);
  const featured = searchParams.get('featured') === 'true';
  const maxPrice = searchParams.get('maxPrice') || '';
  const [searchInput, setSearchInput] = useState(keyword);

  useEffect(() => setSearchInput(keyword), [keyword]);

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (!value || value === 'All' || value === 1 && key === 'page') next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    productsAPI
      .list({ category, keyword, sort, page, featured: featured ? 'true' : '', maxPrice, limit: 12 })
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products || []);
        setMeta({ page: data.page, pages: data.pages, total: data.total });
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category, keyword, sort, page, featured, maxPrice]);

  const activeFilters = [category !== 'All', !!keyword, featured, !!maxPrice].filter(Boolean).length;

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  return (
    <div className="container page-section">
      <Breadcrumbs items={[{ label: 'Shop' }]} />

      <div className="shop-header">
        <div>
          <span className="eyebrow">Our catalogue</span>
          <h1>{keyword ? `Results for “${keyword}”` : category !== 'All' ? category : 'Explore the shop'}</h1>
          <p>{meta.total} product{meta.total === 1 ? '' : 's'} waiting for you</p>
        </div>
        <button className="btn btn--outline btn--sm shop-filter-toggle" onClick={() => setFiltersOpen((v) => !v)}>
          <SlidersHorizontal size={16} /> Filters {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
        </button>
      </div>

      <div className="shop-layout">
        <aside className={`shop-sidebar ${filtersOpen ? 'shop-sidebar--open' : ''}`}>
          <div className="shop-sidebar__head">
            <h3>Filters</h3>
            {activeFilters > 0 && <button onClick={clearFilters}>Clear all</button>}
          </div>

          <form className="shop-search" onSubmit={(e) => { e.preventDefault(); updateParams({ search: searchInput, page: 1 }); }}>
            <Search size={17} />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products" />
            <button type="submit" aria-label="Search"><ChevronRight size={17} /></button>
          </form>

          <div className="filter-group">
            <h4>Category</h4>
            <div className="filter-categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={category === cat ? 'active' : ''}
                  onClick={() => updateParams({ category: cat, page: 1 })}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Max price</h4>
            <div className="price-options">
              {[
                { label: 'Any price', value: '' },
                { label: 'Under 25,000 RWF', value: '25000' },
                { label: 'Under 50,000 RWF', value: '50000' },
                { label: 'Under 100,000 RWF', value: '100000' },
              ].map((opt) => (
                <button key={opt.value} className={maxPrice === opt.value ? 'active' : ''} onClick={() => updateParams({ maxPrice: opt.value, page: 1 })}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Options</h4>
            <label className="checkbox-row">
              <input type="checkbox" checked={featured} onChange={(e) => updateParams({ featured: e.target.checked ? 'true' : '', page: 1 })} />
              Featured products only
            </label>
          </div>

          <div className="shop-sidebar__promo">
            <strong>Need help choosing?</strong>
            <p>Our team is happy to recommend the right product for you.</p>
            <a href="/contact">Ask us anything →</a>
          </div>
        </aside>

        <div className="shop-main">
          <div className="shop-toolbar">
            <span className="shop-toolbar__count">Showing {products.length ? (meta.page - 1) * 12 + 1 : 0}–{Math.min(meta.page * 12, meta.total)} of {meta.total}</span>
            <div className="shop-toolbar__right">
              <label className="sort-select">
                <span>Sort by:</span>
                <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}>
                  <option value="newest">Newest</option>
                  <option value="popular">Best selling</option>
                  <option value="rating">Top rated</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="name">Name A–Z</option>
                </select>
              </label>
              <div className="view-toggle">
                <button className="active" aria-label="Grid view"><Grid2X2 size={17} /></button>
                <button aria-label="List view"><LayoutGrid size={17} /></button>
              </div>
            </div>
          </div>

          {activeFilters > 0 && (
            <div className="active-chips">
              {category !== 'All' && <button onClick={() => updateParams({ category: 'All' })}>{category} <X size={13} /></button>}
              {keyword && <button onClick={() => updateParams({ search: '' })}>“{keyword}” <X size={13} /></button>}
              {maxPrice && <button onClick={() => updateParams({ maxPrice: '' })}>Under {Number(maxPrice).toLocaleString()} RWF <X size={13} /></button>}
              {featured && <button onClick={() => updateParams({ featured: '' })}>Featured <X size={13} /></button>}
            </div>
          )}

          {loading ? (
            <Loader label="Loading products..." />
          ) : error ? (
            <ErrorState message={error} onRetry={() => updateParams({ page })} />
          ) : products.length === 0 ? (
            <EmptyState title="No products found" message="Try adjusting your filters or search terms." action="Clear filters" to="/shop" />
          ) : (
            <>
              <div className="product-grid product-grid--shop">
                {products.map((product, i) => <ProductCard key={product._id} product={product} index={i} />)}
              </div>
              {meta.pages > 1 && (
                <div className="pagination">
                  <button disabled={page <= 1} onClick={() => updateParams({ page: page - 1 })}><ChevronLeft size={17} /></button>
                  {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
                    <button key={p} className={p === page ? 'active' : ''} onClick={() => updateParams({ page: p })}>{p}</button>
                  ))}
                  <button disabled={page >= meta.pages} onClick={() => updateParams({ page: page + 1 })}><ChevronRight size={17} /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
