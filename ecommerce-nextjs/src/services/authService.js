import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/api/auth/me')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(credentials) {
    try {
      const response = await this.api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async fetchMe() {
    try {
      const response = await this.api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async logout() {
    try {
      await this.api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
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