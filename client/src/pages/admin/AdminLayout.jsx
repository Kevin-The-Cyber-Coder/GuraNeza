import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, LayoutDashboard, Package, ShoppingCart, Mail, LogOut,
  Menu, X, ExternalLink, Bell, Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/contacts', label: 'Messages', icon: Mail },
];

const AdminLayout = ({ children }) => {
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
          <Link to="/admin" className="brand brand--light">
            <span className="brand__mark"><ShoppingBag size={21} /></span>
            <span className="brand__text">Gura<span>Neza</span><small>Admin console</small></span>
          </Link>
          <button className="admin-sidebar__close" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <div className="admin-sidebar__section">MANAGEMENT</div>
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
            <div><strong>{user?.name}</strong><small>Administrator</small></div>
          </div>
          <button onClick={handleLogout} className="admin-logout"><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-header__menu" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
          <div className="admin-header__title"><strong>GuraNeza Admin</strong><span>Kigali, Rwanda</span></div>
          <div className="admin-header__actions">
            <span className="admin-header__search"><Search size={17} /> Search console</span>
            <Link to="/admin/contacts" className="admin-header__bell" aria-label="Messages"><Bell size={19} /></Link>
            <div className="admin-header__avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
