import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Common';
import CustomerLayout from '../pages/customer/CustomerLayout';

const CustomerRoute = () => {
  const { loading, isAuthenticated, isCustomer, user } = useAuth();

  if (loading) return <Loader label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login?redirect=/account" replace />;
  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />;
  if (!isCustomer) return <Navigate to="/" replace />;

  return (
    <CustomerLayout>
      <Outlet />
    </CustomerLayout>
  );
};

export default CustomerRoute;
