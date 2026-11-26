import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Mail, LogOut, Menu, X, ExternalLink, Bell, Search, CheckCheck,
  Store, Users, UserCog, Tags, CreditCard, Percent, Wallet, Truck, Ticket, Star, AlertTriangle,
  BarChart3, Megaphone, Shield, FileText, Settings, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../services/api';
import Logo from '../../components/Logo';
import { formatDate } from '../../utils/helpers';

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'MARKETPLACE',
    items: [
      { to: '/admin/seller-applications', label: 'Seller Applications', icon: UserCog },
      { to: '/admin/sellers', label: 'Sellers', icon: Users },
      { to: '/admin/shops', label: 'Shops', icon: Store },
      { to: '/admin/customers', label: 'Customers', icon: Users },
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/categories', label: 'Categories', icon: Tags },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/admin/payments', label: 'Payments', icon: CreditCard },
      { to: '/admin/commissions', label: 'Commissions', icon: Percent },
      { to: '/admin/payouts', label: 'Payouts', icon: Wallet },
      { to: '/admin/delivery', label: 'Delivery', icon: Truck },
      { to: '/admin/coupons', label: 'Coupons & Promos', icon: Ticket },
      { to: '/admin/reviews', label: 'Reviews', icon: Star },
      { to: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
      { to: '/admin/contacts', label: 'Messages', icon: Mail },
    ],
  },
  {
    label: 'PLATFORM',
    items: [
      { to: '/admin/advertisements', label: 'Advertisements', icon: Megaphone },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/admin/staff', label: 'Staff & Permissions', icon: Shield },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
      { to: '/admin/security', label: 'Security Center', icon: ShieldCheck },
    ],
  },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const data = await notificationsAPI.mine({ limit: 8 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { /* non-blocking */ }
  };

  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const openNotification = async (n) => {
    try {
      if (!n.readAt) {
        const data = await notificationsAPI.markRead(n._id);
        setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, readAt: new Date().toISOString() } : x)));
        setUnreadCount(data.unreadCount ?? Math.max(0, unreadCount - 1));
      }
    } catch { /* ignore */ }
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <Logo to="/admin" />
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
            <div><strong>{user?.name}</strong><small>Super Admin</small></div>
          </div>
          <button onClick={handleLogout} className="admin-logout"><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-header__menu" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
          <div className="admin-header__title"><strong>GuraNeza Admin</strong><span>Super Admin control center</span></div>
          <div className="admin-header__actions">
            <span className="admin-header__search"><Search size={17} /> Search</span>
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="admin-header__bell" aria-label="Notifications" onClick={() => { setNotifOpen((v) => !v); if (!notifOpen) loadNotifications(); }} style={{ position: 'relative' }}>
                <Bell size={19} />
                {unreadCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 360, maxWidth: '90vw', background: '#fff', border: '1px solid var(--line)', borderRadius: 14, boxShadow: '0 18px 40px rgba(0,0,0,.12)', zIndex: 50, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                    <strong style={{ fontSize: '.9rem' }}>Notifications</strong>
                    {unreadCount > 0 && <button onClick={markAll} style={{ border: 0, background: 'none', color: 'var(--primary)', fontSize: '.75rem', fontWeight: 700, display: 'flex', gap: 4, alignItems: 'center' }}><CheckCheck size={14} /> Mark all read</button>}
                  </div>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: '.84rem' }}>No notifications yet.</div>
                    ) : notifications.map((n) => (
                      <button key={n._id} onClick={() => openNotification(n)} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 0, borderBottom: '1px solid var(--line)', background: n.readAt ? '#fff' : '#f3faf7', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                          <strong style={{ fontSize: '.82rem', color: 'var(--ink)' }}>{n.title}</strong>
                          {!n.readAt && <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--primary)', flexShrink: 0, marginTop: 5 }} />}
                        </div>
                        <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>{n.message}</div>
                        <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: 6 }}>{formatDate(n.createdAt, { hour: '2-digit', minute: '2-digit' })}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="admin-header__avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
