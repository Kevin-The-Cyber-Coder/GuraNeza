import { Navigate } from 'react-router-dom';

const SellerAddProduct = () => <Navigate to="/seller/products" replace state={{ openCreate: true }} />;

export default SellerAddProduct;
