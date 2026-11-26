import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Store, Package, PlusSquare, Boxes, ShoppingCart, BarChart3, DollarSign,
  Wallet, Users, Star, Megaphone, Ticket, MessageSquare, Bell, UserCog, Settings, User, LifeBuoy,
  LogOut, Menu, X, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/seller', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/seller/analytics', label: 'Sales Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'CATALOG',
    items: [
      { to: '/seller/shop', label: 'My Shop', icon: Store },
      { to: '/seller/products', label: 'Products', icon: Package },
      { to: '/seller/products/new', label: 'Add Product', icon: PlusSquare },
      { to: '/seller/inventory', label: 'Inventory', icon: Boxes },
    ],
  },
  {
    label: 'SALES',
    items: [
      { to: '/seller/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/seller/earnings', label: 'Earnings', icon: DollarSign },
      { to: '/seller/payouts', label: 'Payouts', icon: Wallet },
      { to: '/seller/customers', label: 'Customers', icon: Users },
      { to: '/seller/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    label: 'GROWTH',
    items: [
      { to: '/seller/promotions', label: 'Promotions', icon: Megaphone },
      { to: '/seller/coupons', label: 'Coupons', icon: Ticket },
      { to: '/seller/inquiries', label: 'Inquiries', icon: MessageSquare },
      { to: '/seller/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { to: '/seller/staff', label: 'Staff', icon: UserCog },
      { to: '/seller/settings', label: 'Shop Settings', icon: Settings },
      { to: '/seller/profile', label: 'Profile', icon: User },
      { to: '/seller/support', label: 'Support', icon: LifeBuoy },
    ],
  },
];

const SellerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <Logo to="/seller" />
          <button className="admin-sidebar__close" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        {navSections.map((section) => (
          <div key={section.label}>
            <div className="admin-sidebar__section">{section.label}</div>
            <nav className="admin-nav">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setSidebarOpen(false)}>
                    <Icon size={18} /> {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}

        <div className="admin-sidebar__section">STOREFRONT</div>
        <nav className="admin-nav">
          <Link to="/"><ExternalLink size={18} /> View website</Link>
        </nav>

        <div className="admin-sidebar__bottom">
          <div className="admin-user-card">
            <span className="admin-user-card__avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <div><strong>{user?.name}</strong><small>Seller</small></div>
          </div>
          <button onClick={handleLogout} className="admin-logout"><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-header__menu" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
          <div className="admin-header__title"><strong>Seller Dashboard</strong><span>Manage your shop on GuraNeza</span></div>
          <div className="admin-header__actions">
            <div className="admin-header__avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default SellerLayout;
