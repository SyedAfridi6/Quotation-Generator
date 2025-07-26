/* ==========================================================================
   QUOTATION CONTEXT - STATE MANAGEMENT
   Centralized state management for the quotation calculator
   ========================================================================== */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { calculateProfessionalQuotation, formatCurrency } from '../utils/calculations';
import { validateStep, validateForm } from '../utils/validation';
import { FORM_OPTIONS } from '../utils/constants';

// Create Context
const QuotationContext = createContext();

// Action Types
const ACTION_TYPES = {
  // Form Data Actions
  UPDATE_FIELD: 'UPDATE_FIELD',
  UPDATE_MULTIPLE_FIELDS: 'UPDATE_MULTIPLE_FIELDS',
  RESET_FORM: 'RESET_FORM',
  LOAD_FORM_DATA: 'LOAD_FORM_DATA',
  
  // Step Navigation Actions
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  GO_TO_STEP: 'GO_TO_STEP',
  
  // Validation Actions
  SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
  CLEAR_VALIDATION_ERRORS: 'CLEAR_VALIDATION_ERRORS',
  SET_STEP_COMPLETION: 'SET_STEP_COMPLETION',
  
  // Quotation Actions
  CALCULATE_QUOTATION: 'CALCULATE_QUOTATION',
  SET_QUOTATION: 'SET_QUOTATION',
  CLEAR_QUOTATION: 'CLEAR_QUOTATION',
  
  // Currency Actions
  SET_CURRENCY: 'SET_CURRENCY',
  
  // UI State Actions
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SUCCESS_MESSAGE: 'SET_SUCCESS_MESSAGE',
  CLEAR_SUCCESS_MESSAGE: 'CLEAR_SUCCESS_MESSAGE',
  
  // Progress Actions
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  
  // Auto-save Actions
  ENABLE_AUTO_SAVE: 'ENABLE_AUTO_SAVE',
  DISABLE_AUTO_SAVE: 'DISABLE_AUTO_SAVE',
  
  // Form State Actions
  SET_FORM_DIRTY: 'SET_FORM_DIRTY',
  SET_FORM_SUBMITTED: 'SET_FORM_SUBMITTED'
};

// Initial State
const initialState = {
  // Form Data
  formData: {
    // Client Information
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    companySize: '',
    
    // Project Details
    projectTitle: '',
    projectType: '',
    projectGoal: '',
    targetAudience: '',
    budgetRange: '',
    timeline: '',
    location: '',
    
    // Technical Requirements
    numberOfPages: '',
    expectedTraffic: '',
    performanceRequirements: '',
    deviceSupport: [],
    browserSupport: [],
    
    // Design Requirements
    designType: '',
    designPreference: '',
    brandGuidelines: '',
    logoDesign: '',
    designRevisions: '',
    colorScheme: '',
    designInspiration: '',
    layoutPreference: '',
    visualElements: [],
    typographyPreference: '',
    accessibilityRequirements: '',
    mockupRequirements: '',
    
    // Technology Stack
    programmingLanguage: [],
    frontendFramework: [],
    backendFramework: [],
    databaseType: [],
    cloudProvider: '',
    deploymentMethod: '',
    versionControl: '',
    apiArchitecture: '',
    developmentTools: '',
    testingFramework: [],
    monitoringTools: [],
    securityTools: [],
    
    // Features & Functionality
    coreFeatures: [],
    advancedFeatures: [],
    ecommerceFeatures: [],
    analyticsFeatures: [],
    mobileFeatures: [],
    securityFeatures: [],
    
    // Content & Management
    contentProvided: '',
    imagesProvided: '',
    cmsType: '',
    adminDashboard: '',
    userRoles: '',
    contentMigration: '',
    
    // Maintenance & Support
    maintenanceLevel: '',
    supportLevel: '',
    trainingRequired: '',
    documentationLevel: '',
    
    // Additional Services
    seoRequirements: '',
    analyticsSetup: '',
    accessibilityCompliance: '',
    performanceFeatures: [],
    integrationRequirements: [],
    complianceRequirements: [],
    deploymentEnvironment: '',
    projectPriority: '',
    
    // Risk Factors
    riskFactors: [],
    specialRequirements: '',
    futureScalability: ''
  },
  
  // Navigation State
  currentStep: 1,
  totalSteps: 8,
  stepHistory: [1],
  canGoNext: false,
  canGoPrev: false,
  
  // Validation State
  validationErrors: {},
  stepValidation: {},
  stepCompletion: {},
  isFormValid: false,
  
  // Quotation State
  quotation: null,
  isCalculating: false,
  lastCalculated: null,
  quotationHistory: [],
  
  // Currency State
  currency: 'INR',
  exchangeRates: FORM_OPTIONS.currencyRates || {},
  
  // UI State
  loading: false,
  error: null,
  successMessage: null,
  progress: 0,
  
  // Form State
  isDirty: false,
  isSubmitted: false,
  autoSave: true,
  lastSaved: null,
  
  // Performance State
  calculationCache: new Map(),
  lastCacheKey: null
};

// Reducer Function
const quotationReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.UPDATE_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.name]: action.payload.value
        },
        isDirty: true,
        error: null
      };
      
    case ACTION_TYPES.UPDATE_MULTIPLE_FIELDS:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload
        },
        isDirty: true,
        error: null
      };
      
    case ACTION_TYPES.RESET_FORM:
      return {
        ...initialState,
        currency: state.currency,
        autoSave: state.autoSave,
        quotationHistory: action.payload?.keepHistory ? state.quotationHistory : []
      };
      
    case ACTION_TYPES.LOAD_FORM_DATA:
      return {
        ...state,
        formData: {
          ...initialState.formData,
          ...action.payload
        },
        isDirty: false,
        lastSaved: new Date().toISOString()
      };
      
    case ACTION_TYPES.SET_CURRENT_STEP:
      return {
        ...state,
        currentStep: action.payload,
        canGoNext: action.payload < state.totalSteps,
        canGoPrev: action.payload > 1,
        stepHistory: state.stepHistory.includes(action.payload) 
          ? state.stepHistory 
          : [...state.stepHistory, action.payload]
      };
      
    case ACTION_TYPES.NEXT_STEP:
      const nextStep = Math.min(state.currentStep + 1, state.totalSteps);
      return {
        ...state,
        currentStep: nextStep,
        canGoNext: nextStep < state.totalSteps,
        canGoPrev: true,
        stepHistory: state.stepHistory.includes(nextStep) 
          ? state.stepHistory 
          : [...state.stepHistory, nextStep]
      };
      
    case ACTION_TYPES.PREV_STEP:
      const prevStep = Math.max(state.currentStep - 1, 1);
      return {
        ...state,
        currentStep: prevStep,
        canGoNext: true,
        canGoPrev: prevStep > 1
      };
      
    case ACTION_TYPES.GO_TO_STEP:
      return {
        ...state,
        currentStep: action.payload,
        canGoNext: action.payload < state.totalSteps,
        canGoPrev: action.payload > 1,
        stepHistory: state.stepHistory.includes(action.payload) 
          ? state.stepHistory 
          : [...state.stepHistory, action.payload]
      };
      
    case ACTION_TYPES.SET_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: action.payload,
        isFormValid: Object.keys(action.payload).length === 0
      };
      
    case ACTION_TYPES.CLEAR_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: {},
        isFormValid: true
      };
      
    case ACTION_TYPES.SET_STEP_COMPLETION:
      return {
        ...state,
        stepCompletion: {
          ...state.stepCompletion,
          [action.payload.step]: action.payload.status
        }
      };
      
    case ACTION_TYPES.CALCULATE_QUOTATION:
      return {
        ...state,
        isCalculating: true,
        error: null
      };
      
    case ACTION_TYPES.SET_QUOTATION:
      const newQuotation = action.payload;
      const newHistory = state.quotationHistory.length >= 10 
        ? [newQuotation, ...state.quotationHistory.slice(0, 9)]
        : [newQuotation, ...state.quotationHistory];
        
      return {
        ...state,
        quotation: newQuotation,
        isCalculating: false,
        lastCalculated: new Date().toISOString(),
        quotationHistory: newHistory,
        error: null,
        successMessage: 'Quotation calculated successfully!'
      };
      
    case ACTION_TYPES.CLEAR_QUOTATION:
      return {
        ...state,
        quotation: null,
        isCalculating: false,
        lastCalculated: null
      };
      
    case ACTION_TYPES.SET_CURRENCY:
      return {
        ...state,
        currency: action.payload
      };
      
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        isCalculating: false,
        successMessage: null
      };
      
    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case ACTION_TYPES.SET_SUCCESS_MESSAGE:
      return {
        ...state,
        successMessage: action.payload,
        error: null
      };
      
    case ACTION_TYPES.CLEAR_SUCCESS_MESSAGE:
      return {
        ...state,
        successMessage: null
      };
      
    case ACTION_TYPES.UPDATE_PROGRESS:
      return {
        ...state,
        progress: action.payload
      };
      
    case ACTION_TYPES.ENABLE_AUTO_SAVE:
      return {
        ...state,
        autoSave: true
      };
      
    case ACTION_TYPES.DISABLE_AUTO_SAVE:
      return {
        ...state,
        autoSave: false
      };
      
    case ACTION_TYPES.SET_FORM_DIRTY:
      return {
        ...state,
        isDirty: action.payload
      };
      
    case ACTION_TYPES.SET_FORM_SUBMITTED:
      return {
        ...state,
        isSubmitted: action.payload
      };
      
    default:
      return state;
  }
};

// Custom Hooks
export const useQuotation = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error('useQuotation must be used within a QuotationProvider');
  }
  return context;
};

// Provider Component
export const QuotationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(quotationReducer, initialState);

  // Auto-calculate quotation when form data changes
  useEffect(() => {
    const calculateQuotationDebounced = setTimeout(() => {
      if (state.formData.clientName && state.formData.projectType && state.formData.timeline) {
        try {
          const cacheKey = JSON.stringify({
            projectType: state.formData.projectType,
            timeline: state.formData.timeline,
            features: state.formData.coreFeatures,
            designType: state.formData.designType
          });
          
          // Check cache first
          if (state.calculationCache.has(cacheKey) && state.lastCacheKey === cacheKey) {
            return;
          }
          
          dispatch({ type: ACTION_TYPES.CALCULATE_QUOTATION });
          
          const calculatedQuotation = calculateProfessionalQuotation(state.formData);
          
          // Cache the result
          state.calculationCache.set(cacheKey, calculatedQuotation);
          state.lastCacheKey = cacheKey;
          
          dispatch({ 
            type: ACTION_TYPES.SET_QUOTATION, 
            payload: calculatedQuotation 
          });
        } catch (error) {
          console.error('Error calculating quotation:', error);
          dispatch({ 
            type: ACTION_TYPES.SET_ERROR, 
            payload: 'Failed to calculate quotation. Please check your inputs.' 
          });
        }
      }
    }, 500); // Debounce calculation

    return () => clearTimeout(calculateQuotationDebounced);
  }, [state.formData, state.calculationCache, state.lastCacheKey]);

  // Auto-save functionality
  useEffect(() => {
    if (state.autoSave && state.isDirty && !state.isCalculating) {
      const saveData = setTimeout(() => {
        try {
          localStorage.setItem('quotationFormData', JSON.stringify({
            formData: state.formData,
            currentStep: state.currentStep,
            currency: state.currency,
            timestamp: new Date().toISOString()
          }));
          
          dispatch({ type: ACTION_TYPES.SET_FORM_DIRTY, payload: false });
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(saveData);
    }
  }, [state.formData, state.autoSave, state.isDirty, state.isCalculating]);

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('quotationFormData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const timeDiff = new Date() - new Date(parsed.timestamp);
        
        // Only load if saved within last 24 hours
        if (timeDiff < 24 * 60 * 60 * 1000) {
          dispatch({ type: ACTION_TYPES.LOAD_FORM_DATA, payload: parsed.formData });
          dispatch({ type: ACTION_TYPES.SET_CURRENT_STEP, payload: parsed.currentStep });
          dispatch({ type: ACTION_TYPES.SET_CURRENCY, payload: parsed.currency });
        }
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  }, []);

  // Update step completion status
  useEffect(() => {
    for (let step = 1; step <= state.totalSteps; step++) {
      const errors = validateStep(step, state.formData);
      const isValid = Object.keys(errors).length === 0;
      
      // Calculate completion percentage
      let totalFields = 0;
      let filledFields = 0;
      
      // This would be expanded based on actual step requirements
      switch (step) {
        case 1: // Client Information
          totalFields = 7;
          if (state.formData.clientName) filledFields++;
          if (state.formData.companyName) filledFields++;
          if (state.formData.email) filledFields++;
          if (state.formData.phone) filledFields++;
          if (state.formData.website) filledFields++;
          if (state.formData.industry) filledFields++;
          if (state.formData.companySize) filledFields++;
          break;
        // Add other cases as needed
        default:
          totalFields = 1;
          filledFields = 1;
      }
      
      const completionPercentage = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
      
      dispatch({
        type: ACTION_TYPES.SET_STEP_COMPLETION,
        payload: {
          step,
          status: {
            isValid,
            completionPercentage,
            filledFields,
            totalFields,
            errors
          }
        }
      });
    }
  }, [state.formData, state.totalSteps]);

  // Calculate overall progress
  useEffect(() => {
    const completedSteps = Object.values(state.stepCompletion).filter(
      status => status.isValid
    ).length;
    const progress = (completedSteps / state.totalSteps) * 100;
    
    dispatch({ type: ACTION_TYPES.UPDATE_PROGRESS, payload: progress });
  }, [state.stepCompletion, state.totalSteps]);

  // Action Creators
  const actions = {
    // Form Data Actions
    updateField: (name, value) => {
      dispatch({ 
        type: ACTION_TYPES.UPDATE_FIELD, 
        payload: { name, value } 
      });
    },
    
    updateMultipleFields: (fields) => {
      dispatch({ 
        type: ACTION_TYPES.UPDATE_MULTIPLE_FIELDS, 
        payload: fields 
      });
    },
    
    resetForm: (keepHistory = false) => {
      dispatch({ 
        type: ACTION_TYPES.RESET_FORM, 
        payload: { keepHistory } 
      });
    },
    
    loadFormData: (data) => {
      dispatch({ 
        type: ACTION_TYPES.LOAD_FORM_DATA, 
        payload: data 
      });
    },
    
    // Navigation Actions
    setCurrentStep: (step) => {
      dispatch({ 
        type: ACTION_TYPES.SET_CURRENT_STEP, 
        payload: step 
      });
    },
    
    nextStep: () => {
      const errors = validateStep(state.currentStep, state.formData);
      if (Object.keys(errors).length === 0) {
        dispatch({ type: ACTION_TYPES.NEXT_STEP });
        dispatch({ type: ACTION_TYPES.CLEAR_VALIDATION_ERRORS });
      } else {
        dispatch({ 
          type: ACTION_TYPES.SET_VALIDATION_ERRORS, 
          payload: errors 
        });
      }
    },
    
    prevStep: () => {
      dispatch({ type: ACTION_TYPES.PREV_STEP });
      dispatch({ type: ACTION_TYPES.CLEAR_VALIDATION_ERRORS });
    },
    
    goToStep: (step) => {
      dispatch({ 
        type: ACTION_TYPES.GO_TO_STEP, 
        payload: step 
      });
      dispatch({ type: ACTION_TYPES.CLEAR_VALIDATION_ERRORS });
    },
    
    // Validation Actions
    validateCurrentStep: () => {
      const errors = validateStep(state.currentStep, state.formData);
      dispatch({ 
        type: ACTION_TYPES.SET_VALIDATION_ERRORS, 
        payload: errors 
      });
      return Object.keys(errors).length === 0;
    },
    
    validateForm: () => {
      const validation = validateForm(state.formData);
      dispatch({ 
        type: ACTION_TYPES.SET_VALIDATION_ERRORS, 
        payload: validation.errors 
      });
      return validation.isValid;
    },
    
    clearValidationErrors: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_VALIDATION_ERRORS });
    },
    
    // Quotation Actions
    calculateQuotation: async () => {
      try {
        dispatch({ type: ACTION_TYPES.CALCULATE_QUOTATION });
        
        const calculatedQuotation = calculateProfessionalQuotation(state.formData);
        
        dispatch({ 
          type: ACTION_TYPES.SET_QUOTATION, 
          payload: calculatedQuotation 
        });
        
        return calculatedQuotation;
      } catch (error) {
        dispatch({ 
          type: ACTION_TYPES.SET_ERROR, 
          payload: 'Failed to calculate quotation: ' + error.message 
        });
        throw error;
      }
    },
    
    clearQuotation: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_QUOTATION });
    },
    
    // Currency Actions
    setCurrency: (currency) => {
      dispatch({ 
        type: ACTION_TYPES.SET_CURRENCY, 
        payload: currency 
      });
    },
    
    // UI State Actions
    setLoading: (loading) => {
      dispatch({ 
        type: ACTION_TYPES.SET_LOADING, 
        payload: loading 
      });
    },
    
    setError: (error) => {
      dispatch({ 
        type: ACTION_TYPES.SET_ERROR, 
        payload: error 
      });
    },
    
    clearError: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
    },
    
    setSuccessMessage: (message) => {
      dispatch({ 
        type: ACTION_TYPES.SET_SUCCESS_MESSAGE, 
        payload: message 
      });
    },
    
    clearSuccessMessage: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_SUCCESS_MESSAGE });
    },
    
    // Auto-save Actions
    enableAutoSave: () => {
      dispatch({ type: ACTION_TYPES.ENABLE_AUTO_SAVE });
    },
    
    disableAutoSave: () => {
      dispatch({ type: ACTION_TYPES.DISABLE_AUTO_SAVE });
    },
    
    // Utility Actions
    exportFormData: () => {
      return {
        formData: state.formData,
        quotation: state.quotation,
        currency: state.currency,
        exportedAt: new Date().toISOString()
      };
    },
    
    importFormData: (data) => {
      if (data.formData) {
        dispatch({ 
          type: ACTION_TYPES.LOAD_FORM_DATA, 
          payload: data.formData 
        });
      }
      if (data.currency) {
        dispatch({ 
          type: ACTION_TYPES.SET_CURRENCY, 
          payload: data.currency 
        });
      }
    },
    
    // Analytics Actions
    getFormAnalytics: () => {
      const completedSteps = Object.values(state.stepCompletion).filter(
        status => status.isValid
      ).length;
      
      const totalFields = Object.values(state.stepCompletion).reduce(
        (total, status) => total + (status.totalFields || 0), 0
      );
      
      const filledFields = Object.values(state.stepCompletion).reduce(
        (total, status) => total + (status.filledFields || 0), 0
      );
      
      return {
        completedSteps,
        totalSteps: state.totalSteps,
        completionPercentage: (completedSteps / state.totalSteps) * 100,
        totalFields,
        filledFields,
        fieldCompletionPercentage: totalFields > 0 ? (filledFields / totalFields) * 100 : 0,
        hasQuotation: !!state.quotation,
        currency: state.currency,
        lastCalculated: state.lastCalculated,
        timeSpent: state.stepHistory.length * 30, // Rough estimate
        isDirty: state.isDirty
      };
    }
  };

  // Context Value
  const contextValue = {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Computed Values
    isStepValid: (step) => {
      return state.stepCompletion[step]?.isValid || false;
    },
    
    isStepCompleted: (step) => {
      return state.stepCompletion[step]?.completionPercentage === 100;
    },
    
    canNavigateToStep: (step) => {
      // Can navigate to visited steps or next unvisited step
      return state.stepHistory.includes(step) || step === Math.max(...state.stepHistory) + 1;
    },
    
    getFieldError: (fieldName) => {
      return state.validationErrors[fieldName] || null;
    },
    
    hasFieldError: (fieldName) => {
      return !!state.validationErrors[fieldName];
    },
    
    getFormattedCurrency: (amount) => {
      return formatCurrency(amount, state.currency);
    },
    
    getTotalProgress: () => {
      return state.progress;
    },
    
    getStepProgress: (step) => {
      return state.stepCompletion[step]?.completionPercentage || 0;
    }
  };

  return (
    <QuotationContext.Provider value={contextValue}>
      {children}
    </QuotationContext.Provider>
  );
};

// Export the context for advanced usage
export { QuotationContext, ACTION_TYPES };

// Default export
export default QuotationProvider;
