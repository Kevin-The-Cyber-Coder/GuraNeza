import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Common';
import AdminLayout from '../pages/admin/AdminLayout';

const AdminRoute = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) return <Loader label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login?redirect=/admin" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminRoute;
