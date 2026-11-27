const API_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('guraneza_token');

/**
 * Small wrapper around fetch that handles JSON, auth headers and API errors.
 */
const request = async (endpoint, options = {}) => {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = { success: false, message: 'Unable to reach the server. Please try again.' };
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (url, body) => request(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),
};

// ---- Auth ----
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ---- Products ----
export const productsAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== '') acc[k] = v;
        return acc;
      }, {})
    ).toString();
    return api.get(`/products${query ? `?${query}` : ''}`);
  },
  mine: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== '') acc[k] = v;
        return acc;
      }, {})
    ).toString();
    return api.get(`/products/mine${query ? `?${query}` : ''}`);
  },
  get: (id) => api.get(`/products/${id}`),
  meta: () => api.get('/products/meta'),
  topSelling: () => api.get('/products/top-selling'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  bulkDelete: (ids) => api.post('/products/bulk-delete', { ids }),
  uploadImages: (id, files) => {
    const form = new FormData();
    [...files].forEach((file) => form.append('images', file));
    return request(`/products/${id}/images`, { method: 'POST', body: form });
  },
  removeImage: (id, imageUrl) => api.post(`/products/${id}/images/remove`, { imageUrl }),
};

// ---- Orders ----
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  mine: () => api.get('/orders/my-orders'),
  sellerMine: () => api.get('/orders/seller/mine'),
  track: (data) => api.post('/orders/track', data),
  all: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v && v !== 'All') acc[k] = v;
        return acc;
      }, {})
    ).toString();
    return api.get(`/orders${query ? `?${query}` : ''}`);
  },
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// ---- Contacts ----
export const contactsAPI = {
  create: (data) => api.post('/contacts', data),
  all: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v && v !== 'All') acc[k] = v;
        return acc;
      }, {})
    ).toString();
    return api.get(`/contacts${query ? `?${query}` : ''}`);
  },
  get: (id) => api.get(`/contacts/${id}`),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

// ---- Dashboard ----
export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
  activity: () => api.get('/dashboard/activity'),
};

// ---- Notifications ----
export const notificationsAPI = {
  mine: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== '') acc[k] = v;
        return acc;
      }, {})
    ).toString();
    return api.get(`/notifications/me${query ? `?${query}` : ''}`);
  },
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// ---- Seller applications ----
export const sellerApplicationsAPI = {
  submit: (data) => api.post('/seller-applications', data),
  checkStatus: (data) => api.post('/seller-applications/status', data),
  all: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') acc[k] = v;
        return acc;
      }, {})
    ).toString();
    return api.get(`/seller-applications${query ? `?${query}` : ''}`);
  },
  get: (id) => api.get(`/seller-applications/${id}`),
  approve: (id) => api.patch(`/seller-applications/${id}/approve`),
  reject: (id, reason) => api.patch(`/seller-applications/${id}/reject`, { reason }),
  resendInvitation: (id) => api.post(`/seller-applications/${id}/resend-invitation`),
};

export const sellerInvitationsAPI = {
  validate: (token) => api.get(`/seller-invitations/validate?token=${encodeURIComponent(token)}`),
  activate: (data) => api.post('/seller-invitations/activate', data),
};

export const shopsAPI = {
  mine: () => api.get('/shops/me'),
  updateMine: (data) => api.put('/shops/me', data),
  uploadLogo: (file) => {
    const form = new FormData();
    form.append('logo', file);
    return request('/shops/me/logo', { method: 'POST', body: form });
  },
  uploadCover: (file) => {
    const form = new FormData();
    form.append('cover', file);
    return request('/shops/me/cover', { method: 'POST', body: form });
  },
  analytics: () => api.get('/shops/me/analytics'),
  customers: () => api.get('/shops/me/customers'),
};

export const adminAPI = {
  users: (params = {}) => {
    const query = new URLSearchParams(Object.entries(params).reduce((a, [k, v]) => { if (v) a[k] = v; return a; }, {})).toString();
    return api.get(`/admin/users${query ? `?${query}` : ''}`);
  },
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  shops: (params = {}) => {
    const query = new URLSearchParams(Object.entries(params).reduce((a, [k, v]) => { if (v) a[k] = v; return a; }, {})).toString();
    return api.get(`/admin/shops${query ? `?${query}` : ''}`);
  },
  updateShopStatus: (id, status) => api.patch(`/admin/shops/${id}/status`, { status }),
  auditLogs: (params = {}) => {
    const query = new URLSearchParams(Object.entries(params).reduce((a, [k, v]) => { if (v) a[k] = v; return a; }, {})).toString();
    return api.get(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },
  securityOverview: () => api.get('/admin/security-overview'),
  categoriesOverview: () => api.get('/admin/categories-overview'),
  platformSettings: () => api.get('/admin/settings'),
  platformAnalytics: () => api.get('/admin/analytics'),
};

export default api;
