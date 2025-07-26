/* ==========================================================================
   API SERVICES - COMPREHENSIVE API COMMUNICATION LAYER
   Centralized API service for quotation calculator application
   ========================================================================== */

// Base API configuration
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://api.quotationcalculator.com',
  version: process.env.REACT_APP_API_VERSION || 'v1',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

// API endpoints configuration
const ENDPOINTS = {
  // Authentication endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification'
  },
  
  // User management endpoints
  user: {
    profile: '/user/profile',
    updateProfile: '/user/profile',
    preferences: '/user/preferences',
    avatar: '/user/avatar',
    deleteAccount: '/user/delete',
    changePassword: '/user/change-password'
  },
  
  // Quotation endpoints
  quotations: {
    calculate: '/quotations/calculate',
    save: '/quotations/save',
    list: '/quotations/list',
    get: '/quotations/:id',
    update: '/quotations/:id',
    delete: '/quotations/:id',
    duplicate: '/quotations/:id/duplicate',
    export: '/quotations/:id/export',
    share: '/quotations/:id/share',
    templates: '/quotations/templates'
  },
  
  // Project management endpoints
  projects: {
    list: '/projects',
    create: '/projects',
    get: '/projects/:id',
    update: '/projects/:id',
    delete: '/projects/:id',
    phases: '/projects/:id/phases',
    timeline: '/projects/:id/timeline',
    documents: '/projects/:id/documents'
  },
  
  // Analytics endpoints
  analytics: {
    track: '/analytics/track',
    report: '/analytics/report',
    insights: '/analytics/insights',
    conversion: '/analytics/conversion',
    usage: '/analytics/usage'
  },
  
  // Configuration endpoints
  config: {
    currencies: '/config/currencies',
    templates: '/config/templates',
    pricing: '/config/pricing',
    features: '/config/features',
    technologies: '/config/technologies'
  },
  
  // File management endpoints
  files: {
    upload: '/files/upload',
    download: '/files/:id/download',
    delete: '/files/:id',
    list: '/files'
  },
  
  // Company/Organization endpoints
  company: {
    get: '/company',
    update: '/company',
    team: '/company/team',
    invitations: '/company/invitations',
    settings: '/company/settings'
  },
  
  // Subscription endpoints
  subscription: {
    plans: '/subscription/plans',
    current: '/subscription/current',
    upgrade: '/subscription/upgrade',
    cancel: '/subscription/cancel',
    billing: '/subscription/billing',
    invoices: '/subscription/invoices'
  },
  
  // Notification endpoints
  notifications: {
    list: '/notifications',
    markRead: '/notifications/:id/read',
    markAllRead: '/notifications/read-all',
    preferences: '/notifications/preferences'
  },
  
  // Integration endpoints
  integrations: {
    list: '/integrations',
    connect: '/integrations/:provider/connect',
    disconnect: '/integrations/:provider/disconnect',
    sync: '/integrations/:provider/sync'
  }
};

class APIService {
  constructor() {
    this.baseURL = `${API_CONFIG.baseURL}/api/${API_CONFIG.version}`;
    this.timeout = API_CONFIG.timeout;
    this.retryAttempts = API_CONFIG.retryAttempts;
    this.retryDelay = API_CONFIG.retryDelay;
    this.requestQueue = new Map();
    this.cancelTokens = new Map();
    
    // Setup interceptors
    this.setupInterceptors();
    
    // Initialize offline handling
    this.initializeOfflineHandling();
  }

  // Core HTTP methods
  async request(method, endpoint, data = null, options = {}) {
    const config = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers
      },
      timeout: options.timeout || this.timeout,
      ...options
    };

    // Add request body for POST, PUT, PATCH
    if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
      config.body = JSON.stringify(data);
    }

    // Handle URL parameters
    const url = this.buildURL(endpoint, options.params);
    
    // Create abort controller for request cancellation
    const abortController = new AbortController();
    config.signal = abortController.signal;
    
    // Store cancel token
    const requestId = this.generateRequestId();
    this.cancelTokens.set(requestId, abortController);

    try {
      // Check for duplicate requests
      if (options.deduplication !== false) {
        const existingRequest = this.checkDuplicateRequest(method, url, data);
        if (existingRequest) {
          return existingRequest;
        }
      }

      // Execute request with retry logic
      const response = await this.executeWithRetry(() => 
        this.fetchWithTimeout(url, config)
      );

      // Process response
      const result = await this.processResponse(response);
      
      // Cache successful requests
      if (options.cache && response.ok) {
        this.cacheResponse(method, url, data, result);
      }

      // Track API usage
      this.trackAPIUsage(method, endpoint, response.status);

      return result;

    } catch (error) {
      // Handle and transform errors
      throw this.handleError(error, method, endpoint);
    } finally {
      // Cleanup
      this.cancelTokens.delete(requestId);
      this.cleanupRequest(method, url, data);
    }
  }

  async get(endpoint, params = null, options = {}) {
    return this.request('GET', endpoint, null, { ...options, params });
  }

  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  async put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  async patch(endpoint, data, options = {}) {
    return this.request('PATCH', endpoint, data, options);
  }

  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }

  // Authentication API methods
  async login(credentials) {
    try {
      const response = await this.post(ENDPOINTS.auth.login, credentials);
      
      if (response.token) {
        this.setAuthToken(response.token);
        this.setRefreshToken(response.refreshToken);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      return response;
    } catch (error) {
      throw this.transformAuthError(error);
    }
  }

  async register(userData) {
    try {
      const response = await this.post(ENDPOINTS.auth.register, userData);
      
      if (response.token) {
        this.setAuthToken(response.token);
        localStorage.setItem('authToken', response.token);
      }
      
      return response;
    } catch (error) {
      throw this.transformAuthError(error);
    }
  }

  async logout() {
    try {
      await this.post(ENDPOINTS.auth.logout);
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearAuthTokens();
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
    }
  }

  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.post(ENDPOINTS.auth.refreshToken, {
        refreshToken
      });

      if (response.token) {
        this.setAuthToken(response.token);
        localStorage.setItem('authToken', response.token);
      }

      return response;
    } catch (error) {
      this.clearAuthTokens();
      throw error;
    }
  }

  async forgotPassword(email) {
    return this.post(ENDPOINTS.auth.forgotPassword, { email });
  }

  async resetPassword(token, newPassword) {
    return this.post(ENDPOINTS.auth.resetPassword, { token, newPassword });
  }

  // User API methods
  async getUserProfile() {
    return this.get(ENDPOINTS.user.profile, null, { cache: true });
  }

  async updateUserProfile(profileData) {
    return this.put(ENDPOINTS.user.updateProfile, profileData);
  }

  async updateUserPreferences(preferences) {
    return this.put(ENDPOINTS.user.preferences, preferences);
  }

  async uploadAvatar(avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    return this.request('POST', ENDPOINTS.user.avatar, formData, {
      headers: {
        // Remove Content-Type to let browser set it with boundary
        'Content-Type': undefined
      }
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.post(ENDPOINTS.user.changePassword, {
      currentPassword,
      newPassword
    });
  }

  // Quotation API methods
  async calculateQuotation(formData) {
    return this.post(ENDPOINTS.quotations.calculate, formData, {
      timeout: 15000 // Longer timeout for calculations
    });
  }

  async saveQuotation(quotationData) {
    return this.post(ENDPOINTS.quotations.save, quotationData);
  }

  async getQuotations(filters = {}) {
    return this.get(ENDPOINTS.quotations.list, filters, { cache: true });
  }

  async getQuotation(quotationId) {
    const endpoint = ENDPOINTS.quotations.get.replace(':id', quotationId);
    return this.get(endpoint, null, { cache: true });
  }

  async updateQuotation(quotationId, updates) {
    const endpoint = ENDPOINTS.quotations.update.replace(':id', quotationId);
    return this.put(endpoint, updates);
  }

  async deleteQuotation(quotationId) {
    const endpoint = ENDPOINTS.quotations.delete.replace(':id', quotationId);
    return this.delete(endpoint);
  }

  async duplicateQuotation(quotationId) {
    const endpoint = ENDPOINTS.quotations.duplicate.replace(':id', quotationId);
    return this.post(endpoint);
  }

  async exportQuotation(quotationId, format = 'pdf') {
    const endpoint = ENDPOINTS.quotations.export.replace(':id', quotationId);
    return this.get(endpoint, { format }, {
      responseType: 'blob',
      timeout: 30000
    });
  }

  async shareQuotation(quotationId, shareData) {
    const endpoint = ENDPOINTS.quotations.share.replace(':id', quotationId);
    return this.post(endpoint, shareData);
  }

  async getQuotationTemplates() {
    return this.get(ENDPOINTS.quotations.templates, null, { cache: true });
  }

  // Analytics API methods
  async trackEvent(eventData) {
    return this.post(ENDPOINTS.analytics.track, eventData, {
      timeout: 5000,
      retry: false // Don't retry analytics events
    });
  }

  async getAnalyticsReport(filters = {}) {
    return this.get(ENDPOINTS.analytics.report, filters, { cache: true });
  }

  async getInsights(timeframe = '30d') {
    return this.get(ENDPOINTS.analytics.insights, { timeframe }, { cache: true });
  }

  async getConversionData(filters = {}) {
    return this.get(ENDPOINTS.analytics.conversion, filters, { cache: true });
  }

  async getUsageStatistics() {
    return this.get(ENDPOINTS.analytics.usage, null, { cache: true });
  }

  // Configuration API methods
  async getCurrencies() {
    return this.get(ENDPOINTS.config.currencies, null, { 
      cache: true,
      cacheTime: 24 * 60 * 60 * 1000 // Cache for 24 hours
    });
  }

  async getPricingConfig() {
    return this.get(ENDPOINTS.config.pricing, null, { cache: true });
  }

  async getFeatureConfig() {
    return this.get(ENDPOINTS.config.features, null, { cache: true });
  }

  async getTechnologies() {
    return this.get(ENDPOINTS.config.technologies, null, { cache: true });
  }

  // File management API methods
  async uploadFile(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.metadata) {
      Object.keys(options.metadata).forEach(key => {
        formData.append(key, options.metadata[key]);
      });
    }

    return this.request('POST', ENDPOINTS.files.upload, formData, {
      headers: {
        'Content-Type': undefined // Let browser set multipart boundary
      },
      onUploadProgress: options.onProgress,
      timeout: 60000 // 1 minute for file uploads
    });
  }

  async downloadFile(fileId) {
    const endpoint = ENDPOINTS.files.download.replace(':id', fileId);
    return this.get(endpoint, null, {
      responseType: 'blob',
      timeout: 60000
    });
  }

  async deleteFile(fileId) {
    const endpoint = ENDPOINTS.files.delete.replace(':id', fileId);
    return this.delete(endpoint);
  }

  async getFiles(filters = {}) {
    return this.get(ENDPOINTS.files.list, filters);
  }

  // Company API methods
  async getCompanyInfo() {
    return this.get(ENDPOINTS.company.get, null, { cache: true });
  }

  async updateCompanyInfo(companyData) {
    return this.put(ENDPOINTS.company.update, companyData);
  }

  async getTeamMembers() {
    return this.get(ENDPOINTS.company.team, null, { cache: true });
  }

  async sendTeamInvitation(invitationData) {
    return this.post(ENDPOINTS.company.invitations, invitationData);
  }

  // Subscription API methods
  async getSubscriptionPlans() {
    return this.get(ENDPOINTS.subscription.plans, null, { cache: true });
  }

  async getCurrentSubscription() {
    return this.get(ENDPOINTS.subscription.current, null, { cache: true });
  }

  async upgradeSubscription(planData) {
    return this.post(ENDPOINTS.subscription.upgrade, planData);
  }

  async cancelSubscription(reason = '') {
    return this.post(ENDPOINTS.subscription.cancel, { reason });
  }

  async getBillingHistory() {
    return this.get(ENDPOINTS.subscription.billing, null, { cache: true });
  }

  // Notification API methods
  async getNotifications(filters = {}) {
    return this.get(ENDPOINTS.notifications.list, filters);
  }

  async markNotificationRead(notificationId) {
    const endpoint = ENDPOINTS.notifications.markRead.replace(':id', notificationId);
    return this.post(endpoint);
  }

  async markAllNotificationsRead() {
    return this.post(ENDPOINTS.notifications.markAllRead);
  }

  async updateNotificationPreferences(preferences) {
    return this.put(ENDPOINTS.notifications.preferences, preferences);
  }

  // Utility methods
  buildURL(endpoint, params = null) {
    let url = `${this.baseURL}${endpoint}`;
    
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    
    return url;
  }

  getAuthHeaders() {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getAuthToken() {
    return localStorage.getItem('authToken') || this.authToken;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken') || this.refreshToken;
  }

  setRefreshToken(token) {
    this.refreshToken = token;
  }

  clearAuthTokens() {
    this.authToken = null;
    this.refreshToken = null;
  }

  async fetchWithTimeout(url, config) {
    const timeoutId = setTimeout(() => {
      if (config.signal) {
        config.signal.controller?.abort();
      }
    }, config.timeout);

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async executeWithRetry(requestFn, attempt = 1) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.executeWithRetry(requestFn, attempt + 1);
      }
      throw error;
    }
  }

  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return (
      !error.response || 
      error.response.status >= 500 ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT_ERROR'
    );
  }

  async processResponse(response) {
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      
      try {
        const errorData = await response.json();
        error.data = errorData;
        error.message = errorData.message || error.message;
      } catch (e) {
        // Response is not JSON
      }
      
      throw error;
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else if (contentType && contentType.includes('text/')) {
      return response.text();
    } else {
      return response.blob();
    }
  }

  handleError(error, method, endpoint) {
    // Log error for debugging
    console.error(`API Error [${method} ${endpoint}]:`, error);

    // Transform error for consistent handling
    const apiError = {
      message: error.message || 'An unexpected error occurred',
      status: error.status || 0,
      code: error.code || 'UNKNOWN_ERROR',
      data: error.data || null,
      timestamp: new Date().toISOString(),
      endpoint: endpoint,
      method: method
    };

    // Handle specific error cases
    if (error.status === 401) {
      apiError.code = 'UNAUTHORIZED';
      this.handleUnauthorizedError();
    } else if (error.status === 403) {
      apiError.code = 'FORBIDDEN';
    } else if (error.status === 404) {
      apiError.code = 'NOT_FOUND';
    } else if (error.status === 422) {
      apiError.code = 'VALIDATION_ERROR';
    } else if (error.status === 429) {
      apiError.code = 'RATE_LIMITED';
    } else if (error.status >= 500) {
      apiError.code = 'SERVER_ERROR';
    } else if (error.name === 'AbortError') {
      apiError.code = 'REQUEST_CANCELLED';
    } else if (!navigator.onLine) {
      apiError.code = 'OFFLINE';
    }

    return apiError;
  }

  transformAuthError(error) {
    if (error.status === 401) {
      return {
        ...error,
        message: 'Invalid credentials. Please check your email and password.',
        code: 'INVALID_CREDENTIALS'
      };
    } else if (error.status === 422) {
      return {
        ...error,
        message: 'Please check your input and try again.',
        code: 'VALIDATION_ERROR'
      };
    }
    return error;
  }

  handleUnauthorizedError() {
    // Try to refresh token
    if (this.getRefreshToken()) {
      this.refreshToken().catch(() => {
        // Refresh failed, redirect to login
        this.redirectToLogin();
      });
    } else {
      this.redirectToLogin();
    }
  }

  redirectToLogin() {
    this.clearAuthTokens();
    localStorage.clear();
    window.location.href = '/login';
  }

  setupInterceptors() {
    // Setup request/response interceptors if needed
    // This can be extended for specific requirements
  }

  initializeOfflineHandling() {
    window.addEventListener('online', () => {
      console.log('Connection restored');
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost');
    });
  }

  processOfflineQueue() {
    // Process any queued requests when connection is restored
    // Implementation depends on offline strategy
  }

  // Request deduplication
  checkDuplicateRequest(method, url, data) {
    const key = this.generateRequestKey(method, url, data);
    return this.requestQueue.get(key);
  }

  cacheResponse(method, url, data, response) {
    const key = this.generateRequestKey(method, url, data);
    this.requestQueue.set(key, Promise.resolve(response));
    
    // Auto-cleanup cache after 5 minutes
    setTimeout(() => {
      this.requestQueue.delete(key);
    }, 5 * 60 * 1000);
  }

  cleanupRequest(method, url, data) {
    const key = this.generateRequestKey(method, url, data);
    this.requestQueue.delete(key);
  }

  generateRequestKey(method, url, data) {
    return `${method}:${url}:${JSON.stringify(data)}`;
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Analytics tracking
  trackAPIUsage(method, endpoint, status) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Usage: ${method} ${endpoint} - ${status}`);
    }
    
    // Send to analytics service
    this.trackEvent({
      type: 'api_usage',
      method,
      endpoint,
      status,
      timestamp: Date.now()
    }).catch(() => {
      // Silently fail analytics tracking
    });
  }

  // Request cancellation
  cancelRequest(requestId) {
    const controller = this.cancelTokens.get(requestId);
    if (controller) {
      controller.abort();
      this.cancelTokens.delete(requestId);
    }
  }

  cancelAllRequests() {
    this.cancelTokens.forEach(controller => {
      controller.abort();
    });
    this.cancelTokens.clear();
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // API status
  getAPIStatus() {
    return {
      baseURL: this.baseURL,
      isOnline: navigator.onLine,
      activeRequests: this.cancelTokens.size,
      cachedRequests: this.requestQueue.size
    };
  }
}

// Create singleton instance
const apiService = new APIService();

// Export specific service methods for easy access
export const authAPI = {
  login: (credentials) => apiService.login(credentials),
  register: (userData) => apiService.register(userData),
  logout: () => apiService.logout(),
  refreshToken: () => apiService.refreshToken(),
  forgotPassword: (email) => apiService.forgotPassword(email),
  resetPassword: (token, password) => apiService.resetPassword(token, password)
};

export const userAPI = {
  getProfile: () => apiService.getUserProfile(),
  updateProfile: (data) => apiService.updateUserProfile(data),
  updatePreferences: (preferences) => apiService.updateUserPreferences(preferences),
  uploadAvatar: (file) => apiService.uploadAvatar(file),
  changePassword: (current, newPassword) => apiService.changePassword(current, newPassword)
};

export const quotationAPI = {
  calculate: (formData) => apiService.calculateQuotation(formData),
  save: (quotationData) => apiService.saveQuotation(quotationData),
  list: (filters) => apiService.getQuotations(filters),
  get: (id) => apiService.getQuotation(id),
  update: (id, updates) => apiService.updateQuotation(id, updates),
  delete: (id) => apiService.deleteQuotation(id),
  duplicate: (id) => apiService.duplicateQuotation(id),
  export: (id, format) => apiService.exportQuotation(id, format),
  share: (id, shareData) => apiService.shareQuotation(id, shareData),
  getTemplates: () => apiService.getQuotationTemplates()
};

export const analyticsAPI = {
  track: (eventData) => apiService.trackEvent(eventData),
  getReport: (filters) => apiService.getAnalyticsReport(filters),
  getInsights: (timeframe) => apiService.getInsights(timeframe),
  getConversion: (filters) => apiService.getConversionData(filters),
  getUsage: () => apiService.getUsageStatistics()
};

export const configAPI = {
  getCurrencies: () => apiService.getCurrencies(),
  getPricing: () => apiService.getPricingConfig(),
  getFeatures: () => apiService.getFeatureConfig(),
  getTechnologies: () => apiService.getTechnologies()
};

export const fileAPI = {
  upload: (file, options) => apiService.uploadFile(file, options),
  download: (id) => apiService.downloadFile(id),
  delete: (id) => apiService.deleteFile(id),
  list: (filters) => apiService.getFiles(filters)
};

export const companyAPI = {
  get: () => apiService.getCompanyInfo(),
  update: (data) => apiService.updateCompanyInfo(data),
  getTeam: () => apiService.getTeamMembers(),
  inviteTeamMember: (data) => apiService.sendTeamInvitation(data)
};

export const subscriptionAPI = {
  getPlans: () => apiService.getSubscriptionPlans(),
  getCurrent: () => apiService.getCurrentSubscription(),
  upgrade: (planData) => apiService.upgradeSubscription(planData),
  cancel: (reason) => apiService.cancelSubscription(reason),
  getBilling: () => apiService.getBillingHistory()
};

export const notificationAPI = {
  list: (filters) => apiService.getNotifications(filters),
  markRead: (id) => apiService.markNotificationRead(id),
  markAllRead: () => apiService.markAllNotificationsRead(),
  updatePreferences: (preferences) => apiService.updateNotificationPreferences(preferences)
};

// Export utility functions
export const cancelRequest = (requestId) => apiService.cancelRequest(requestId);
export const cancelAllRequests = () => apiService.cancelAllRequests();
export const getAPIStatus = () => apiService.getAPIStatus();
export const healthCheck = () => apiService.healthCheck();

// Export main service instance
export default apiService;

// Export configuration for testing/debugging
export { API_CONFIG, ENDPOINTS };
