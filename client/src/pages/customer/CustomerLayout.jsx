import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, MapPin, Heart, Store, ShoppingCart,
  User, Bell, Star, LifeBuoy, Settings, LogOut, Menu, X, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

const navItems = [
  { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/account/orders', label: 'My Orders', icon: ShoppingBag },
  { to: '/account/track', label: 'Order Tracking', icon: MapPin },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/favorite-shops', label: 'Favorite Shops', icon: Store },
  { to: '/account/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/notifications', label: 'Notifications', icon: Bell },
  { to: '/account/reviews', label: 'Reviews', icon: Star },
  { to: '/account/support', label: 'Support', icon: LifeBuoy },
  { to: '/account/settings', label: 'Account Settings', icon: Settings },
];

const CustomerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <Logo to="/account" />
          <button className="admin-sidebar__close" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <div className="admin-sidebar__section">MY ACCOUNT</div>
        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                <Icon size={19} /> {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar__section">STOREFRONT</div>
        <nav className="admin-nav">
          <Link to="/"><ExternalLink size={19} /> View website</Link>
        </nav>

        <div className="admin-sidebar__bottom">
          <div className="admin-user-card">
            <span className="admin-user-card__avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <div><strong>{user?.name}</strong><small>Customer</small></div>
          </div>
          <button onClick={handleLogout} className="admin-logout"><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-header__menu" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
          <div className="admin-header__title"><strong>My Account</strong><span>Manage your GuraNeza experience</span></div>
          <div className="admin-header__actions">
            <div className="admin-header__avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default CustomerLayout;
