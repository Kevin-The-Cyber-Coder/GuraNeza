import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  UserRound,
  LogOut,
  LayoutDashboard,
  Package,
  Menu,
  X,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Logo from './Logo';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/track-order', label: 'Track Order' },
  { to: '/contact', label: 'Contact' },
];

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}` : '/shop');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdminArea = location.pathname.startsWith('/admin');

  if (isAdminArea) return null;

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <span><MapPin size={14} /> Proudly based in Kigali, Rwanda</span>
          <span>Fast local delivery · Cash on Delivery & Mobile Money</span>
        </div>
      </div>
      <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
        <div className="container site-header__inner">
          <Logo />

          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <form className="header-search" onSubmit={submitSearch}>
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
          </form>

          <div className="header-actions">
            <Link to="/cart" className="icon-btn" aria-label="Shopping cart">
              <ShoppingBag size={21} />
              {itemCount > 0 && <span className="badge-count">{itemCount}</span>}
            </Link>

            <div className="account-menu">
              <button
                className="account-trigger"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
              >
                <UserRound size={18} />
                <span className="account-name">{user?.name?.split(' ')[0] || 'Account'}</span>
                <ChevronDown size={14} />
              </button>
              {accountOpen && (
                <div className="account-dropdown">
                  {isAuthenticated ? (
                    <>
                      <div className="account-dropdown__head">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                      <Link to="/my-orders"><Package size={16} /> My Orders</Link>
                      {isAdmin && <Link to="/admin"><LayoutDashboard size={16} /> Admin Dashboard</Link>}
                      <button onClick={handleLogout}><LogOut size={16} /> Sign out</button>
                    </>
                  ) : (
                    <>
                      <div className="account-dropdown__head">
                        <strong>Welcome!</strong>
                        <span>Sign in to track your orders</span>
                      </div>
                      <Link to="/login">Sign in</Link>
                      <Link to="/register">Create account</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              className="icon-btn mobile-toggle"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mobile-menu">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>
            ))}
            <form className="mobile-search" onSubmit={submitSearch}>
              <Search size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." />
            </form>
            {!isAuthenticated && (
              <div className="mobile-auth">
                <Link to="/login" className="btn btn--outline btn--sm">Sign in</Link>
                <Link to="/register" className="btn btn--primary btn--sm">Join GuraNeza</Link>
              </div>
            )}
            {isAdmin && <Link to="/admin" className="mobile-admin">Admin Dashboard</Link>}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
