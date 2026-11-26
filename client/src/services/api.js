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
  get: (id) => api.get(`/products/${id}`),
  meta: () => api.get('/products/meta'),
  topSelling: () => api.get('/products/top-selling'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  bulkDelete: (ids) => api.post('/products/bulk-delete', { ids }),
};

// ---- Orders ----
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  mine: () => api.get('/orders/my-orders'),
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

export default api;
