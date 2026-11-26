import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Common';
import SellerLayout from '../pages/seller/SellerLayout';

const SellerRoute = () => {
  const { loading, isAuthenticated, isSeller, user } = useAuth();

  if (loading) return <Loader label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login?redirect=/seller" replace />;
  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />;
  if (!isSeller) return <Navigate to="/" replace />;

  return (
    <SellerLayout>
      <Outlet />
    </SellerLayout>
  );
};

export default SellerRoute;
