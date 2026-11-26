import DashboardPlaceholder from '../../components/DashboardPlaceholder';

const CustomerPlaceholderPage = ({ title, description }) => (
  <DashboardPlaceholder
    title={title}
    description={description}
    requiredRole="CUSTOMER"
  />
);

export default CustomerPlaceholderPage;
