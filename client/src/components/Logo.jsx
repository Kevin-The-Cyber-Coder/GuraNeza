import { Link } from 'react-router-dom';

/**
 * Shared brand logo. Every placement (header, footer, auth pages, admin)
 * uses the same image from /public so the branding stays consistent.
 */
const Logo = ({ to = '/', wide = false, className = '' }) => {
  const classes = ['brand', wide && 'brand--wide', className].filter(Boolean).join(' ');
  const image = <img className="brand__logo" src="/logo.png" alt="GuraNeza" width="2170" height="725" />;

  if (!to) return <span className={classes}>{image}</span>;

  return (
    <Link to={to} className={classes} aria-label="GuraNeza home">
      {image}
    </Link>
  );
};

export default Logo;
