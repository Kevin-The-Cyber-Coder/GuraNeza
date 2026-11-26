import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from './components/AdminRoute';
import SellerRoute from './components/SellerRoute';
import CustomerRoute from './components/CustomerRoute';
import WelcomeModal from './components/WelcomeModal';
import DashboardPlaceholder from './components/DashboardPlaceholder';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import TrackOrder from './pages/TrackOrder';
import Contact from './pages/Contact';
import BecomeSeller from './pages/BecomeSeller';
import SellerApplicationStatus from './pages/SellerApplicationStatus';
import SellerActivate from './pages/SellerActivate';
import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminContacts from './pages/admin/AdminContacts';
import AdminSellerApplications from './pages/admin/AdminSellerApplications';
import AdminSellers from './pages/admin/AdminSellers';
import AdminShops from './pages/admin/AdminShops';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminNotifications from './pages/admin/AdminNotifications';

import SellerDashboard from './pages/seller/SellerDashboard';
import SellerShop from './pages/seller/SellerShop';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';

import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerPlaceholderPage from './pages/customer/CustomerPlaceholderPage';

const StoreLayout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
);

const AdminPlaceholder = ({ title, description }) => (
  <DashboardPlaceholder title={title} description={description} requiredRole="SUPER_ADMIN" />
);

const SellerPlaceholder = ({ title, description }) => (
  <DashboardPlaceholder title={title} description={description} requiredRole="SELLER" />
);

const App = () => (
  <>
    <ScrollToTop />
    <WelcomeModal />
    <Routes>
      {/* Public storefront */}
      <Route path="/" element={<StoreLayout><Home /></StoreLayout>} />
      <Route path="/shop" element={<StoreLayout><Shop /></StoreLayout>} />
      <Route path="/product/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
      <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />
      <Route path="/checkout" element={<StoreLayout><Checkout /></StoreLayout>} />
      <Route path="/order-success/:orderNumber" element={<StoreLayout><OrderSuccess /></StoreLayout>} />
      <Route path="/login" element={<StoreLayout><Login /></StoreLayout>} />
      <Route path="/register" element={<StoreLayout><Register /></StoreLayout>} />
      <Route path="/my-orders" element={<StoreLayout><MyOrders /></StoreLayout>} />
      <Route path="/orders/:id" element={<StoreLayout><OrderDetail /></StoreLayout>} />
      <Route path="/track-order" element={<StoreLayout><TrackOrder /></StoreLayout>} />
      <Route path="/contact" element={<StoreLayout><Contact /></StoreLayout>} />
      <Route path="/become-a-seller" element={<StoreLayout><BecomeSeller /></StoreLayout>} />
      <Route path="/seller-application/status" element={<StoreLayout><SellerApplicationStatus /></StoreLayout>} />
      <Route path="/seller/activate" element={<StoreLayout><SellerActivate /></StoreLayout>} />
      <Route path="/change-password" element={<StoreLayout><ChangePassword /></StoreLayout>} />

      {/* Admin area */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/seller-applications" element={<AdminSellerApplications />} />
        <Route path="/admin/sellers" element={<AdminSellers />} />
        <Route path="/admin/shops" element={<AdminShops />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<AdminPlaceholder title="Categories" description="Marketplace category management will appear here when the category model and APIs are implemented." />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/payments" element={<AdminPlaceholder title="Payments" description="Payment monitoring and authorized financial workflows will appear here when payment records are implemented." />} />
        <Route path="/admin/commissions" element={<AdminPlaceholder title="Commissions" description="Commission policy configuration will appear here with auditable workflows." />} />
        <Route path="/admin/payouts" element={<AdminPlaceholder title="Payouts" description="Payout review and authorization workflows will appear here when payout records are implemented." />} />
        <Route path="/admin/delivery" element={<AdminPlaceholder title="Delivery Management" description="Marketplace delivery policy management will appear here when delivery workflows are implemented." />} />
        <Route path="/admin/coupons" element={<AdminPlaceholder title="Coupons and Promotions" description="Platform coupon and promotion management will appear here when promotion APIs are implemented." />} />
        <Route path="/admin/reviews" element={<AdminPlaceholder title="Reviews and Moderation" description="Review monitoring and moderation will appear here when review workflows are implemented." />} />
        <Route path="/admin/disputes" element={<AdminPlaceholder title="Disputes" description="Dispute handling workflows will appear here when dispute records are implemented." />} />
        <Route path="/admin/analytics" element={<AdminPlaceholder title="Analytics" description="Marketplace analytics will appear here when reporting APIs are implemented." />} />
        <Route path="/admin/advertisements" element={<AdminPlaceholder title="Advertisements" description="Marketplace advertisement management will appear here when ad workflows are implemented." />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/staff" element={<AdminPlaceholder title="Staff and Permissions" description="Staff and permission management will appear here if staff accounts are enabled. No staff accounts exist yet; no mock data is shown." />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/admin/settings" element={<AdminPlaceholder title="Settings" description="Marketplace settings will appear here when configuration APIs are implemented." />} />
        <Route path="/admin/security" element={<AdminPlaceholder title="Security Center" description="Security monitoring and event review will appear here when security event APIs are implemented." />} />
        <Route path="/admin/contacts" element={<AdminContacts />} />
      </Route>

      {/* Seller area */}
      <Route element={<SellerRoute />}>
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/shop" element={<SellerShop />} />
        <Route path="/seller/products" element={<SellerProducts />} />
        <Route path="/seller/products/new" element={<SellerPlaceholder title="Add Product" description="Use the Products module to create products. A dedicated add-product flow can be added here." />} />
        <Route path="/seller/inventory" element={<SellerPlaceholder title="Inventory" description="Inventory management will appear here when dedicated inventory workflows are enabled." />} />
        <Route path="/seller/orders" element={<SellerOrders />} />
        <Route path="/seller/orders/:id" element={<SellerPlaceholder title="Order Details" description="Detailed seller order view will be added when per-order seller workflows are implemented. Current orders are visible in the Orders list." />} />
        <Route path="/seller/analytics" element={<SellerPlaceholder title="Sales Analytics" description="Shop analytics will appear here when seller analytics APIs are implemented." />} />
        <Route path="/seller/earnings" element={<SellerPlaceholder title="Earnings" description="Earnings reporting will appear here when financial reporting APIs are implemented." />} />
        <Route path="/seller/payouts" element={<SellerPlaceholder title="Payouts" description="Payout requests and history will appear here when payout APIs are implemented." />} />
        <Route path="/seller/customers" element={<SellerPlaceholder title="Customers" description="Limited customer information related to your orders will appear here when seller order APIs are implemented." />} />
        <Route path="/seller/reviews" element={<SellerPlaceholder title="Reviews" description="Review responses will appear here when review APIs are implemented." />} />
        <Route path="/seller/promotions" element={<SellerPlaceholder title="Promotions" description="Shop promotions will appear here when promotion APIs are implemented." />} />
        <Route path="/seller/coupons" element={<SellerPlaceholder title="Coupons" description="Shop coupons will appear here when coupon APIs are implemented." />} />
        <Route path="/seller/inquiries" element={<SellerPlaceholder title="Customer Inquiries" description="Customer inquiry management will appear here when inquiry APIs are implemented." />} />
        <Route path="/seller/notifications" element={<SellerPlaceholder title="Notifications" description="Seller notifications will appear here when seller notification views are enabled." />} />
        <Route path="/seller/staff" element={<SellerPlaceholder title="Staff Management" description="Seller staff management will appear here if staff accounts are enabled." />} />
        <Route path="/seller/settings" element={<SellerPlaceholder title="Shop Settings" description="Additional shop settings will appear here when settings APIs are implemented." />} />
        <Route path="/seller/profile" element={<SellerPlaceholder title="Profile" description="Seller profile management will appear here when profile APIs are enabled." />} />
        <Route path="/seller/support" element={<SellerPlaceholder title="Support" description="Support tools will appear here when support workflows are implemented." />} />
      </Route>

      {/* Customer area */}
      <Route element={<CustomerRoute />}>
        <Route path="/account" element={<CustomerDashboard />} />
        <Route path="/account/orders" element={<CustomerOrders />} />
        <Route path="/account/track" element={<CustomerPlaceholderPage title="Order Tracking" description="Track your orders here. For now, use the public Track Order page for order-number tracking." />} />
        <Route path="/account/wishlist" element={<CustomerPlaceholderPage title="Wishlist" description="Wishlist will appear here when wishlist APIs are implemented." />} />
        <Route path="/account/favorite-shops" element={<CustomerPlaceholderPage title="Favorite Shops" description="Favorite shops will appear here when shop-follow APIs are implemented." />} />
        <Route path="/account/cart" element={<CustomerPlaceholderPage title="Cart" description="Your cart is available on the storefront. A dashboard cart view will be added when server-side cart APIs are implemented." />} />
        <Route path="/account/addresses" element={<CustomerPlaceholderPage title="Addresses" description="Address management will appear here when address APIs are implemented." />} />
        <Route path="/account/profile" element={<CustomerProfile />} />
        <Route path="/account/notifications" element={<CustomerPlaceholderPage title="Notifications" description="Notifications will appear here when customer notification views are enabled." />} />
        <Route path="/account/reviews" element={<CustomerPlaceholderPage title="Reviews" description="Your reviews will appear here when review APIs are implemented." />} />
        <Route path="/account/support" element={<CustomerPlaceholderPage title="Support" description="Support requests will appear here when support workflows are implemented." />} />
        <Route path="/account/settings" element={<CustomerPlaceholderPage title="Account Settings" description="Account settings will appear here when settings workflows are implemented." />} />
      </Route>

      <Route path="*" element={<StoreLayout><NotFound /></StoreLayout>} />
    </Routes>
  </>
);

export default App;
