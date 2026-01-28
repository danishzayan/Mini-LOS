import api from './api';
import { API_ENDPOINTS } from '@/utils/constants';

export const loanService = {
  // Create a new loan application
  async createLoan(data) {
    const response = await api.post(API_ENDPOINTS.CREATE_LOAN, data);
    return response.data;
  },

  // Get loan by ID
  async getLoan(id) {
    const response = await api.get(API_ENDPOINTS.GET_LOAN(id));
    return response.data;
  },

  // Get user's loans
  async getMyLoans() {
    const response = await api.get(API_ENDPOINTS.MY_LOANS);
    return response.data;
  },

  // Submit KYC
  async submitKYC(loanId) {
    const response = await api.post(API_ENDPOINTS.SUBMIT_KYC(loanId));
    return response.data;
  },

  // Run credit check
  async runCreditCheck(loanId) {
    const response = await api.post(API_ENDPOINTS.RUN_CREDIT_CHECK(loanId));
    return response.data;
  },

  // Admin: Get all loans
  async getAllLoans(params = {}) {
    const response = await api.get(API_ENDPOINTS.ALL_LOANS, { params });
    return response.data;
  },

  // Admin: Get stats
  async getStats() {
    const response = await api.get(API_ENDPOINTS.LOAN_STATS);
    return response.data;
  },
};

// Helper to dispatch auth change event
const dispatchAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('authChange'));
  }
};

export const authService = {
  // Login
  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post(API_ENDPOINTS.LOGIN, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      dispatchAuthChange();
    }
    
    return response.data;
  },

  // Register
  async register(data) {
    const response = await api.post(API_ENDPOINTS.REGISTER, data);
    return response.data;
  },

  // Get current user
  async getMe() {
    const response = await api.get(API_ENDPOINTS.ME);
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatchAuthChange();
  },
};
