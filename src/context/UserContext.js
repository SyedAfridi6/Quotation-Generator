/* ==========================================================================
   USER CONTEXT - USER MANAGEMENT & AUTHENTICATION
   Centralized user state management and authentication
   ========================================================================== */

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create Context
const UserContext = createContext();

// Action Types
const ACTION_TYPES = {
  // Authentication Actions
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  
  // User Profile Actions
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  UPDATE_PROFILE_SUCCESS: 'UPDATE_PROFILE_SUCCESS',
  UPDATE_PROFILE_FAILURE: 'UPDATE_PROFILE_FAILURE',
  LOAD_USER_DATA: 'LOAD_USER_DATA',
  
  // User Preferences Actions
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  SET_THEME: 'SET_THEME',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_CURRENCY_PREFERENCE: 'SET_CURRENCY_PREFERENCE',
  SET_NOTIFICATION_PREFERENCES: 'SET_NOTIFICATION_PREFERENCES',
  
  // Session Actions
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  EXTEND_SESSION: 'EXTEND_SESSION',
  
  // User Activity Actions
  TRACK_ACTIVITY: 'TRACK_ACTIVITY',
  UPDATE_LAST_SEEN: 'UPDATE_LAST_SEEN',
  
  // Saved Quotations Actions
  SAVE_QUOTATION: 'SAVE_QUOTATION',
  LOAD_SAVED_QUOTATIONS: 'LOAD_SAVED_QUOTATIONS',
  DELETE_SAVED_QUOTATION: 'DELETE_SAVED_QUOTATION',
  UPDATE_QUOTATION_METADATA: 'UPDATE_QUOTATION_METADATA',
  
  // User Settings Actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS',
  
  // Error Actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Loading Actions
  SET_LOADING: 'SET_LOADING',
  
  // Company/Organization Actions
  SET_COMPANY_INFO: 'SET_COMPANY_INFO',
  UPDATE_COMPANY_INFO: 'UPDATE_COMPANY_INFO',
  
  // Subscription Actions
  SET_SUBSCRIPTION_INFO: 'SET_SUBSCRIPTION_INFO',
  UPDATE_SUBSCRIPTION: 'UPDATE_SUBSCRIPTION'
};

// User Roles
const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user',
  PREMIUM: 'premium',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Subscription Plans
const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise'
};

// Initial State
const initialState = {
  // Authentication State
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  token: null,
  refreshToken: null,
  tokenExpiry: null,
  
  // User Information
  user: {
    id: null,
    email: '',
    firstName: '',
    lastName: '',
    fullName: '',
    avatar: null,
    role: USER_ROLES.GUEST,
    isEmailVerified: false,
    isPhoneVerified: false,
    phone: '',
    dateOfBirth: null,
    gender: '',
    timezone: 'UTC',
    createdAt: null,
    updatedAt: null,
    lastLoginAt: null
  },
  
  // Company/Organization Information
  company: {
    id: null,
    name: '',
    industry: '',
    size: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    taxId: '',
    logo: null,
    description: ''
  },
  
  // User Preferences
  preferences: {
    theme: 'light', // light, dark, auto
    language: 'en',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    timezone: 'Asia/Kolkata',
    notifications: {
      email: true,
      push: true,
      sms: false,
      quotationUpdates: true,
      marketingEmails: false,
      securityAlerts: true
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium',
      screenReader: false
    },
    dashboard: {
      defaultView: 'overview',
      showWelcomeMessage: true,
      autoSave: true,
      rememberFormData: true
    }
  },
  
  // Subscription Information
  subscription: {
    plan: SUBSCRIPTION_PLANS.FREE,
    status: 'active', // active, inactive, expired, cancelled
    startDate: null,
    endDate: null,
    autoRenew: true,
    features: [],
    limits: {
      quotationsPerMonth: 5,
      savedQuotations: 10,
      teamMembers: 1,
      apiCalls: 100,
      storageGB: 1
    },
    usage: {
      quotationsThisMonth: 0,
      savedQuotations: 0,
      teamMembers: 0,
      apiCallsThisMonth: 0,
      storageUsedGB: 0
    }
  },
  
  // Saved Quotations
  savedQuotations: [],
  quotationTemplates: [],
  recentQuotations: [],
  
  // User Activity
  activity: {
    lastSeen: null,
    sessionStartTime: null,
    totalSessions: 0,
    totalTimeSpent: 0,
    quotationsCreated: 0,
    lastQuotationDate: null,
    loginHistory: [],
    activityLog: []
  },
  
  // User Statistics
  statistics: {
    totalQuotations: 0,
    totalRevenue: 0,
    averageQuotationValue: 0,
    mostUsedFeatures: [],
    preferredIndustries: [],
    quotationsByMonth: {},
    conversionRate: 0
  },
  
  // Team/Collaboration (for future use)
  team: {
    members: [],
    permissions: {},
    invitations: []
  },
  
  // Error and Loading States
  error: null,
  loading: {
    profile: false,
    quotations: false,
    settings: false,
    general: false
  },
  
  // Session Information
  session: {
    id: null,
    ipAddress: null,
    userAgent: null,
    location: null,
    isActive: true,
    expiresAt: null
  }
};

// Reducer Function
const userReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case ACTION_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        tokenExpiry: action.payload.tokenExpiry,
        user: {
          ...state.user,
          ...action.payload.user,
          lastLoginAt: new Date().toISOString()
        },
        session: {
          ...state.session,
          ...action.payload.session
        },
        error: null
      };
      
    case ACTION_TYPES.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        token: null,
        refreshToken: null,
        error: action.payload
      };
      
    case ACTION_TYPES.LOGOUT:
      return {
        ...initialState,
        isInitialized: true,
        preferences: {
          ...state.preferences,
          // Keep some preferences after logout
          theme: state.preferences.theme,
          language: state.preferences.language
        }
      };
      
    case ACTION_TYPES.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case ACTION_TYPES.REGISTER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        tokenExpiry: action.payload.tokenExpiry,
        user: {
          ...state.user,
          ...action.payload.user
        },
        error: null
      };
      
    case ACTION_TYPES.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
      
    case ACTION_TYPES.UPDATE_PROFILE:
      return {
        ...state,
        loading: {
          ...state.loading,
          profile: true
        },
        error: null
      };
      
    case ACTION_TYPES.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
          updatedAt: new Date().toISOString()
        },
        loading: {
          ...state.loading,
          profile: false
        },
        error: null
      };
      
    case ACTION_TYPES.UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          profile: false
        },
        error: action.payload
      };
      
    case ACTION_TYPES.LOAD_USER_DATA:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload.user
        },
        company: {
          ...state.company,
          ...action.payload.company
        },
        subscription: {
          ...state.subscription,
          ...action.payload.subscription
        },
        preferences: {
          ...state.preferences,
          ...action.payload.preferences
        },
        isInitialized: true
      };
      
    case ACTION_TYPES.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };
      
    case ACTION_TYPES.SET_THEME:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          theme: action.payload
        }
      };
      
    case ACTION_TYPES.SET_LANGUAGE:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          language: action.payload
        }
      };
      
    case ACTION_TYPES.SET_CURRENCY_PREFERENCE:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          currency: action.payload
        }
      };
      
    case ACTION_TYPES.SET_NOTIFICATION_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          notifications: {
            ...state.preferences.notifications,
            ...action.payload
          }
        }
      };
      
    case ACTION_TYPES.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        tokenExpiry: action.payload.tokenExpiry
      };
      
    case ACTION_TYPES.SESSION_EXPIRED:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        error: 'Session expired. Please login again.'
      };
      
    case ACTION_TYPES.EXTEND_SESSION:
      return {
        ...state,
        session: {
          ...state.session,
          expiresAt: action.payload.expiresAt
        }
      };
      
    case ACTION_TYPES.TRACK_ACTIVITY:
      return {
        ...state,
        activity: {
          ...state.activity,
          activityLog: [
            action.payload,
            ...state.activity.activityLog.slice(0, 99) // Keep last 100 activities
          ]
        }
      };
      
    case ACTION_TYPES.UPDATE_LAST_SEEN:
      return {
        ...state,
        activity: {
          ...state.activity,
          lastSeen: new Date().toISOString()
        }
      };
      
    case ACTION_TYPES.SAVE_QUOTATION:
      return {
        ...state,
        savedQuotations: [
          action.payload,
          ...state.savedQuotations
        ],
        recentQuotations: [
          action.payload,
          ...state.recentQuotations.slice(0, 9) // Keep last 10
        ],
        statistics: {
          ...state.statistics,
          totalQuotations: state.statistics.totalQuotations + 1
        }
      };
      
    case ACTION_TYPES.LOAD_SAVED_QUOTATIONS:
      return {
        ...state,
        savedQuotations: action.payload.quotations,
        quotationTemplates: action.payload.templates || [],
        loading: {
          ...state.loading,
          quotations: false
        }
      };
      
    case ACTION_TYPES.DELETE_SAVED_QUOTATION:
      return {
        ...state,
        savedQuotations: state.savedQuotations.filter(
          q => q.id !== action.payload
        ),
        recentQuotations: state.recentQuotations.filter(
          q => q.id !== action.payload
        )
      };
      
    case ACTION_TYPES.UPDATE_QUOTATION_METADATA:
      return {
        ...state,
        savedQuotations: state.savedQuotations.map(q =>
          q.id === action.payload.id
            ? { ...q, ...action.payload.updates }
            : q
        )
      };
      
    case ACTION_TYPES.UPDATE_SETTINGS:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };
      
    case ACTION_TYPES.RESET_SETTINGS:
      return {
        ...state,
        preferences: {
          ...initialState.preferences,
          // Keep language and theme
          language: state.preferences.language,
          theme: state.preferences.theme
        }
      };
      
    case ACTION_TYPES.SET_COMPANY_INFO:
      return {
        ...state,
        company: {
          ...state.company,
          ...action.payload
        }
      };
      
    case ACTION_TYPES.UPDATE_COMPANY_INFO:
      return {
        ...state,
        company: {
          ...state.company,
          ...action.payload
        }
      };
      
    case ACTION_TYPES.SET_SUBSCRIPTION_INFO:
      return {
        ...state,
        subscription: {
          ...state.subscription,
          ...action.payload
        }
      };
      
    case ACTION_TYPES.UPDATE_SUBSCRIPTION:
      return {
        ...state,
        subscription: {
          ...state.subscription,
          ...action.payload
        }
      };
      
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        loading: {
          ...state.loading,
          general: false
        }
      };
      
    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          ...action.payload
        }
      };
      
    default:
      return state;
  }
};

// Custom Hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Provider Component
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Initialize user data from localStorage on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userData');
        const storedPreferences = localStorage.getItem('userPreferences');
        
        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser);
          const preferences = storedPreferences ? JSON.parse(storedPreferences) : {};
          
          // Check if token is still valid
          const tokenExpiry = localStorage.getItem('tokenExpiry');
          if (tokenExpiry && new Date(tokenExpiry) > new Date()) {
            dispatch({
              type: ACTION_TYPES.LOAD_USER_DATA,
              payload: {
                user,
                preferences,
                token: storedToken,
                tokenExpiry
              }
            });
            
            dispatch({
              type: ACTION_TYPES.LOGIN_SUCCESS,
              payload: {
                token: storedToken,
                tokenExpiry,
                user,
                session: {
                  id: generateSessionId(),
                  isActive: true
                }
              }
            });
          } else {
            // Token expired, clear stored data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('tokenExpiry');
          }
        } else {
          // Load only preferences for guest users
          if (storedPreferences) {
            const preferences = JSON.parse(storedPreferences);
            dispatch({
              type: ACTION_TYPES.UPDATE_PREFERENCES,
              payload: preferences
            });
          }
        }
        
        dispatch({
          type: ACTION_TYPES.LOAD_USER_DATA,
          payload: { isInitialized: true }
        });
        
      } catch (error) {
        console.error('Error initializing user:', error);
        dispatch({
          type: ACTION_TYPES.SET_ERROR,
          payload: 'Failed to initialize user session'
        });
      }
    };

    initializeUser();
  }, []);

  // Auto-save preferences
  useEffect(() => {
    if (state.isInitialized) {
      localStorage.setItem('userPreferences', JSON.stringify(state.preferences));
    }
  }, [state.preferences, state.isInitialized]);

  // Track user activity
  useEffect(() => {
    if (state.isAuthenticated) {
      const interval = setInterval(() => {
        dispatch({
          type: ACTION_TYPES.UPDATE_LAST_SEEN
        });
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated]);

  // Action Creators
  const actions = {
    // Authentication Actions
    login: async (credentials) => {
      try {
        dispatch({ type: ACTION_TYPES.LOGIN_START });
        
        // Simulate API call
        const response = await mockAuthAPI.login(credentials);
        
        // Store token and user data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        localStorage.setItem('tokenExpiry', response.tokenExpiry);
        
        dispatch({
          type: ACTION_TYPES.LOGIN_SUCCESS,
          payload: response
        });
        
        return response;
      } catch (error) {
        dispatch({
          type: ACTION_TYPES.LOGIN_FAILURE,
          payload: error.message
        });
        throw error;
      }
    },

    register: async (userData) => {
      try {
        dispatch({ type: ACTION_TYPES.REGISTER_START });
        
        // Simulate API call
        const response = await mockAuthAPI.register(userData);
        
        // Store token and user data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        localStorage.setItem('tokenExpiry', response.tokenExpiry);
        
        dispatch({
          type: ACTION_TYPES.REGISTER_SUCCESS,
          payload: response
        });
        
        return response;
      } catch (error) {
        dispatch({
          type: ACTION_TYPES.REGISTER_FAILURE,
          payload: error.message
        });
        throw error;
      }
    },

    logout: () => {
      // Clear stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('quotationFormData');
      
      dispatch({ type: ACTION_TYPES.LOGOUT });
    },

    // Profile Actions
    updateProfile: async (profileData) => {
      try {
        dispatch({ type: ACTION_TYPES.UPDATE_PROFILE });
        
        // Simulate API call
        const response = await mockAuthAPI.updateProfile(profileData);
        
        // Update stored user data
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        dispatch({
          type: ACTION_TYPES.UPDATE_PROFILE_SUCCESS,
          payload: response.user
        });
        
        return response;
      } catch (error) {
        dispatch({
          type: ACTION_TYPES.UPDATE_PROFILE_FAILURE,
          payload: error.message
        });
        throw error;
      }
    },

    // Preference Actions
    updatePreferences: (preferences) => {
      dispatch({
        type: ACTION_TYPES.UPDATE_PREFERENCES,
        payload: preferences
      });
    },

    setTheme: (theme) => {
      dispatch({
        type: ACTION_TYPES.SET_THEME,
        payload: theme
      });
      
      // Apply theme immediately
      document.documentElement.setAttribute('data-theme', theme);
    },

    setLanguage: (language) => {
      dispatch({
        type: ACTION_TYPES.SET_LANGUAGE,
        payload: language
      });
    },

    setCurrencyPreference: (currency) => {
      dispatch({
        type: ACTION_TYPES.SET_CURRENCY_PREFERENCE,
        payload: currency
      });
    },

    setNotificationPreferences: (notifications) => {
      dispatch({
        type: ACTION_TYPES.SET_NOTIFICATION_PREFERENCES,
        payload: notifications
      });
    },

    // Quotation Actions
    saveQuotation: (quotationData) => {
      const quotation = {
        id: generateQuotationId(),
        ...quotationData,
        savedAt: new Date().toISOString(),
        userId: state.user.id
      };
      
      dispatch({
        type: ACTION_TYPES.SAVE_QUOTATION,
        payload: quotation
      });
      
      // Save to localStorage
      const savedQuotations = JSON.parse(localStorage.getItem('savedQuotations') || '[]');
      savedQuotations.unshift(quotation);
      localStorage.setItem('savedQuotations', JSON.stringify(savedQuotations.slice(0, 50))); // Keep last 50
      
      return quotation;
    },

    loadSavedQuotations: () => {
      try {
        const savedQuotations = JSON.parse(localStorage.getItem('savedQuotations') || '[]');
        dispatch({
          type: ACTION_TYPES.LOAD_SAVED_QUOTATIONS,
          payload: { quotations: savedQuotations }
        });
      } catch (error) {
        console.error('Error loading saved quotations:', error);
      }
    },

    deleteSavedQuotation: (quotationId) => {
      dispatch({
        type: ACTION_TYPES.DELETE_SAVED_QUOTATION,
        payload: quotationId
      });
      
      // Update localStorage
      const savedQuotations = JSON.parse(localStorage.getItem('savedQuotations') || '[]');
      const filtered = savedQuotations.filter(q => q.id !== quotationId);
      localStorage.setItem('savedQuotations', JSON.stringify(filtered));
    },

    // Activity Tracking
    trackActivity: (action, details = {}) => {
      const activity = {
        id: generateActivityId(),
        action,
        details,
        timestamp: new Date().toISOString(),
        userId: state.user.id
      };
      
      dispatch({
        type: ACTION_TYPES.TRACK_ACTIVITY,
        payload: activity
      });
    },

    // Company Actions
    updateCompanyInfo: (companyData) => {
      dispatch({
        type: ACTION_TYPES.UPDATE_COMPANY_INFO,
        payload: companyData
      });
    },

    // Utility Actions
    clearError: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
    },

    setError: (error) => {
      dispatch({
        type: ACTION_TYPES.SET_ERROR,
        payload: error
      });
    },

    // Session Management
    refreshToken: async () => {
      try {
        const response = await mockAuthAPI.refreshToken(state.refreshToken);
        
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('tokenExpiry', response.tokenExpiry);
        
        dispatch({
          type: ACTION_TYPES.REFRESH_TOKEN,
          payload: response
        });
        
        return response;
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SESSION_EXPIRED });
        throw error;
      }
    }
  };

  // Context Value
  const contextValue = {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Computed Values
    isGuest: state.user.role === USER_ROLES.GUEST,
    isPremium: [USER_ROLES.PREMIUM, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(state.user.role),
    isAdmin: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(state.user.role),
    
    fullName: `${state.user.firstName} ${state.user.lastName}`.trim() || state.user.email,
    
    canSaveQuotations: state.subscription.usage.savedQuotations < state.subscription.limits.savedQuotations,
    canCreateQuotations: state.subscription.usage.quotationsThisMonth < state.subscription.limits.quotationsPerMonth,
    
    subscriptionProgress: {
      quotations: (state.subscription.usage.quotationsThisMonth / state.subscription.limits.quotationsPerMonth) * 100,
      storage: (state.subscription.usage.storageUsedGB / state.subscription.limits.storageGB) * 100,
      savedQuotations: (state.subscription.usage.savedQuotations / state.subscription.limits.savedQuotations) * 100
    },
    
    getActivitySummary: () => {
      const today = new Date().toDateString();
      const todayActivities = state.activity.activityLog.filter(
        a => new Date(a.timestamp).toDateString() === today
      );
      
      return {
        totalToday: todayActivities.length,
        totalAllTime: state.activity.activityLog.length,
        lastActivity: state.activity.activityLog[0]?.timestamp || null,
        mostCommonAction: getMostCommonAction(state.activity.activityLog)
      };
    }
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Utility Functions
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const generateQuotationId = () => {
  return 'quot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const generateActivityId = () => {
  return 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const getMostCommonAction = (activities) => {
  const actionCounts = activities.reduce((acc, activity) => {
    acc[activity.action] = (acc[activity.action] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(actionCounts).reduce((a, b) => 
    actionCounts[a] > actionCounts[b] ? a : b, null
  );
};

// Mock API for demonstration (replace with real API)
const mockAuthAPI = {
  login: async (credentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    return {
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      user: {
        id: 'user_' + Date.now(),
        email: credentials.email,
        firstName: 'John',
        lastName: 'Doe',
        role: USER_ROLES.USER,
        isEmailVerified: true,
        createdAt: new Date().toISOString()
      },
      session: {
        id: generateSessionId(),
        isActive: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    };
  },
  
  register: async (userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      user: {
        id: 'user_' + Date.now(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: USER_ROLES.USER,
        isEmailVerified: false,
        createdAt: new Date().toISOString()
      }
    };
  },
  
  updateProfile: async (profileData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      user: {
        ...profileData,
        updatedAt: new Date().toISOString()
      }
    };
  },
  
  refreshToken: async (refreshToken) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      token: 'new_mock_jwt_token_' + Date.now(),
      tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }
};

// Export constants
export { USER_ROLES, SUBSCRIPTION_PLANS, ACTION_TYPES };

// Export the context
export { UserContext };

// Default export
export default UserProvider;
