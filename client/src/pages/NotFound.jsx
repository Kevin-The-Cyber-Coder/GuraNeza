import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="container page-section not-found">
    <div className="not-found__code">404</div>
    <Compass size={44} />
    <h1>We couldn't find that page</h1>
    <p>The link may be broken, or the page might have moved. Let's get you back to the good stuff.</p>
    <Link to="/" className="btn btn--primary btn--lg"><ArrowLeft size={17} /> Back to home</Link>
  </div>
);

export default NotFound;
