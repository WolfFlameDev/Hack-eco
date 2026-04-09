import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // User management
  setUser(user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  removeUser() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  // Auth methods
  async login(credentials) {
    try {
      const response = await this.api.post('/api/auth/login', credentials);
      const { user, token } = response.data;

      this.setToken(token);
      this.setUser(user);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async demoLogin() {
    const user = {
      name: 'Cyber',
      email: 'cyber@demo.com',
      role: 'user',
      isVerified: true,
    };
    const token = 'demo-token-cyber-1234';

    this.setToken(token);
    this.setUser(user);

    return { user, token };
  }

  async register(userData) {
    try {
      const response = await this.api.post('/api/auth/register', userData);
      const { user, token } = response.data;

      this.setToken(token);
      this.setUser(user);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async verifyEmail(email, otp) {
    try {
      const response = await this.api.post('/api/auth/verify', { email, otp });
      const currentUser = this.getUser();
      if (currentUser) {
        currentUser.isVerified = true;
        this.setUser(currentUser);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async forgotPassword(email) {
    try {
      const response = await this.api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async resetPassword(email, otp, password) {
    try {
      const response = await this.api.post('/api/auth/reset-password', {
        email,
        otp,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  logout() {
    this.removeToken();
    this.removeUser();
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  getCurrentUser() {
    return this.getUser();
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Check if user is seller
  isSeller() {
    return this.hasRole('seller');
  }

  // Check if user is regular user
  isUser() {
    return this.hasRole('user');
  }
}

const authService = new AuthService();
export default authService;