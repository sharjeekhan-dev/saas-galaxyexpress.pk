// Shared API client & auth helpers for all frontend modules
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem('erp_token');
  }

  setToken(token) {
    localStorage.setItem('erp_token', token);
  }

  getUser() {
    const raw = localStorage.getItem('erp_user');
    return raw ? JSON.parse(raw) : null;
  }

  setUser(user) {
    localStorage.setItem('erp_user', JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    window.location.href = '/';
  }

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, opts);
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}: ${text.slice(0, 100)}...`);
        }
        return text;
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }
      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        throw new Error('Network Error: Unable to reach API endpoint. Please check if API is running (502/CORS).');
      }
      throw err;
    }
  }

  get(path) { return this.request('GET', path); }
  post(path, body) { return this.request('POST', path, body); }
  put(path, body) { return this.request('PUT', path, body); }
  del(path) { return this.request('DELETE', path); }

  async login(email, password) {
    const data = await this.post('/api/auth/login', { email, password });
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }

  async register(payload) {
    const data = await this.post('/api/auth/register', payload);
    this.setToken(data.token);
    this.setUser(data.user);
    return data;
  }
}

export const api = new ApiClient();
export default api;
