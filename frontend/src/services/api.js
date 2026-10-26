const API_BASE_URL = 'http://127.0.0.1:8000/api';

const TOKEN_KEY = 'katalogu_lipjan_admin_token';
const USER_KEY = 'katalogu_lipjan_admin_user';

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
  getUser() {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Accept': 'application/json',
    ...options.headers
  };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = authStorage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.message || `Kërkesa dështoi me status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Autentikimi
  auth: {
    async login(email, password) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      if (data.token) {
        authStorage.setToken(data.token);
        authStorage.setUser(data.user);
      }
      return data;
    },
    async register(userData) {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (data.token) {
        authStorage.setToken(data.token);
        authStorage.setUser(data.user);
      }
      return data;
    },
    async sendInviteCode(email) {
      return request('/auth/send-invite-code', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },
    async logout() {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        authStorage.clear();
      }
    },
    async me() {
      return request('/auth/me');
    }
  },

  // Rutat Publike
  public: {
    async directoryAssistantChat(messages, language) {
      return request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages, language })
      });
    },

    async getBusinesses(params = {}) {
      const query = new URLSearchParams();
      if (params.q) query.set('q', params.q);
      if (params.category) query.set('category', params.category);
      if (params.settlement) query.set('settlement', params.settlement);
      if (params.service) query.set('service', params.service);
      if (params.has_website) query.set('has_website', '1');
      if (params.has_hours) query.set('has_hours', '1');
      if (params.sort) query.set('sort', params.sort);
      if (params.page) query.set('page', params.page);

      const qs = query.toString();
      return request(`/businesses${qs ? `?${qs}` : ''}`);
    },

    async getBusiness(idOrSlug) {
      return request(`/businesses/${encodeURIComponent(idOrSlug)}`);
    },

    async submitBusiness(businessData) {
      return request('/businesses', {
        method: 'POST',
        body: JSON.stringify(businessData)
      });
    },

    async getCategories() {
      return request('/categories');
    },

    async getSettlements() {
      return request('/settlements');
    },

    async getServices() {
      return request('/services');
    },

    async getAdvertisements(placement) {
      const qs = placement ? `?placement=${encodeURIComponent(placement)}` : '';
      return request(`/advertisements${qs}`);
    }
  },

  // Rutat Administrative
  admin: {
    async directoryAssistantChat(messages, language) {
      return request('/admin/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages, language })
      });
    },

    // === Profili i Administratorit ===
    async getProfile() {
      return request('/admin/profile');
    },
    async updateProfile(profileData) {
      return request('/admin/profile', {
        method: 'PUT',
        body: profileData instanceof FormData ? profileData : JSON.stringify(profileData)
      });
    },
    async changePassword(passwordData) {
      const data = await request('/admin/profile/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData)
      });
      if (data.token) authStorage.setToken(data.token);
      return data;
    },

    async getStats() {
      return request('/admin/stats');
    },

    async getBusinesses(params = {}) {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.category) query.set('category', params.category);
      if (params.q) query.set('q', params.q);

      const qs = query.toString();
      return request(`/admin/businesses${qs ? `?${qs}` : ''}`);
    },

    async createBusiness(businessData) {
      return request('/admin/businesses', {
        method: 'POST',
        body: JSON.stringify(businessData)
      });
    },

    async updateBusiness(id, updateData) {
      return request(`/admin/businesses/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
    },

    async deleteBusiness(id) {
      return request(`/admin/businesses/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    },

    // Kategori
    async getCategories() {
      return request('/admin/categories');
    },
    async createCategory(catData) {
      return request('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(catData)
      });
    },
    async updateCategory(id, catData) {
      return request(`/admin/categories/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(catData)
      });
    },
    async deleteCategory(id) {
      return request(`/admin/categories/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    },

    // Vendbanime
    async getSettlements() {
      return request('/admin/settlements');
    },
    async createSettlement(settleData) {
      return request('/admin/settlements', {
        method: 'POST',
        body: JSON.stringify(settleData)
      });
    },
    async updateSettlement(id, settleData) {
      return request(`/admin/settlements/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(settleData)
      });
    },
    async deleteSettlement(id) {
      return request(`/admin/settlements/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    },

    // Reklama
    async getAdvertisements() {
      return request('/admin/advertisements');
    },
    async createAdvertisement(adData) {
      return request('/admin/advertisements', {
        method: 'POST',
        body: JSON.stringify(adData)
      });
    },
    async updateAdvertisement(id, adData) {
      return request(`/admin/advertisements/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(adData)
      });
    },
    async deleteAdvertisement(id) {
      return request(`/admin/advertisements/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    }
  }
};
