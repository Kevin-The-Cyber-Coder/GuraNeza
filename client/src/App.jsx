import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from './components/AdminRoute';
import SellerRoute from './components/SellerRoute';
import WelcomeModal from './components/WelcomeModal';

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
import NotFound from './pages/NotFound';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminContacts from './pages/admin/AdminContacts';
import AdminSellerApplications from './pages/admin/AdminSellerApplications';

import SellerDashboard from './pages/seller/SellerDashboard';
import SellerShop from './pages/seller/SellerShop';

const StoreLayout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
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

      {/* Admin area */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/contacts" element={<AdminContacts />} />
        <Route path="/admin/seller-applications" element={<AdminSellerApplications />} />
      </Route>

      {/* Seller area */}
      <Route element={<SellerRoute />}>
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/shop" element={<SellerShop />} />
      </Route>

      <Route path="*" element={<StoreLayout><NotFound /></StoreLayout>} />
    </Routes>
  </>
);

export default App;
