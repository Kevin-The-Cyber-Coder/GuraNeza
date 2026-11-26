/** Product categories shared by the storefront and dashboard forms. */
export const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty',
  'Groceries',
  'Sports',
  'Books',
  'Other',
];

/** Format a number as Rwandan Francs. */
export const formatRWF = (value) =>
  `${new Intl.NumberFormat('en-RW').format(Math.round(Number(value) || 0))} RWF`;

export const formatShortRWF = (value) => {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M RWF`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}k RWF`;
  return formatRWF(n);
};

export const formatDate = (value, options = {}) =>
  new Date(value).toLocaleDateString('en-RW', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });

export const truncate = (text, max = 100) =>
  text?.length > max ? `${text.slice(0, max).trim()}…` : text || '';

export const statusColor = (status) => {
  const map = {
    Pending: 'warning',
    Processing: 'info',
    Shipped: 'purple',
    Delivered: 'success',
    Cancelled: 'danger',
    New: 'warning',
    Read: 'info',
    Replied: 'success',
    Closed: 'muted',
    paid: 'success',
    pending: 'warning',
    failed: 'danger',
  };
  return map[status] || 'muted';
};

export const getImage = (product, fallbackIndex = 0) => {
  const fallbacks = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  ];
  return product?.images?.[0] || product?.image || fallbacks[fallbackIndex % fallbacks.length];
};
