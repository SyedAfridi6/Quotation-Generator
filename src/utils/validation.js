import { FORM_OPTIONS } from './constants.js';

// Safe access helper
const safeMap = (array, mapFn) => {
  return Array.isArray(array) ? array.map(mapFn) : [];
};

// Main validation configuration
export const VALIDATION_CONFIG = {
  // Real-time validation settings
  realTime: {
    debounceDelay: 300, // ms
    validateOnChange: true,
    validateOnBlur: true,
    showErrorsImmediately: false,
    highlightInvalidFields: true
  },
  
  // Field validation rules
  fieldRules: {
    // Step 1: Client Information
    clientName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s\.'-]+$/,
      customValidation: validatePersonName,
      errorMessages: {
        required: 'Client name is required',
        minLength: 'Name must be at least 2 characters long',
        maxLength: 'Name cannot exceed 100 characters',
        pattern: 'Please enter a valid name (letters, spaces, dots, hyphens, apostrophes only)',
        custom: 'Please enter a proper full name'
      }
    },
    
    companyName: {
      required: true,
      minLength: 2,
      maxLength: 200,
      pattern: /^[a-zA-Z0-9\s\.\-&',()]+$/,
      errorMessages: {
        required: 'Company name is required',
        minLength: 'Company name must be at least 2 characters long',
        maxLength: 'Company name cannot exceed 200 characters',
        pattern: 'Please enter a valid company name'
      }
    },
    
    email: {
      required: true,
      pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
      customValidation: validateEmail,
      errorMessages: {
        required: 'Email address is required',
        pattern: 'Please enter a valid email address',
        custom: 'Email domain appears to be invalid'
      }
    },
    
    phone: {
      required: true,
      pattern: /^[\+]?[0-9\s\-\(\)]{10,15}$/,
      customValidation: validatePhoneNumber,
      errorMessages: {
        required: 'Phone number is required',
        pattern: 'Please enter a valid phone number (10-15 digits)',
        custom: 'Please enter a valid phone number format'
      }
    },
    
    website: {
      required: false,
      pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      customValidation: validateWebsiteUrl,
      errorMessages: {
        pattern: 'Please enter a valid website URL',
        custom: 'Website URL is not accessible'
      }
    },
    
    industry: {
      required: true,
      validOptions: safeMap(FORM_OPTIONS?.industries, i => i.value),
      errorMessages: {
        required: 'Please select an industry',
        validOptions: 'Please select a valid industry option'
      }
    },
    
    companySize: {
      required: true,
      validOptions: safeMap(FORM_OPTIONS?.companySizes, c => c.value),
      errorMessages: {
        required: 'Please select company size',
        validOptions: 'Please select a valid company size'
      }
    },
    
    // Step 2: Project Overview
    projectTitle: {
      required: true,
      minLength: 5,
      maxLength: 200,
      pattern: /^[a-zA-Z0-9\s\-_.,()&]+$/,
      errorMessages: {
        required: 'Project title is required',
        minLength: 'Project title must be at least 5 characters long',
        maxLength: 'Project title cannot exceed 200 characters',
        pattern: 'Please use only letters, numbers, and common punctuation'
      }
    },
    
    projectType: {
      required: true,
      validOptions: safeMap(FORM_OPTIONS?.projectTypes, p => p.value),
      errorMessages: {
        required: 'Please select a project type',
        validOptions: 'Please select a valid project type'
      }
    },
    
    projectGoal: {
      required: true,
      minLength: 20,
      maxLength: 1000,
      customValidation: validateProjectDescription,
      errorMessages: {
        required: 'Project goal description is required',
        minLength: 'Please provide more details (minimum 20 characters)',
        maxLength: 'Description is too long (maximum 1000 characters)',
        custom: 'Please provide a more meaningful project description'
      }
    },
    
    targetAudience: {
      required: true,
      minLength: 10,
      maxLength: 500,
      errorMessages: {
        required: 'Target audience description is required',
        minLength: 'Please provide more details about your target audience',
        maxLength: 'Description is too long (maximum 500 characters)'
      }
    },
    
    budgetRange: {
      required: true,
      validOptions: safeMap(FORM_OPTIONS?.budgetRanges, b => b.value),
      customValidation: validateBudgetCompatibility,
      errorMessages: {
        required: 'Please select a budget range',
        validOptions: 'Please select a valid budget range',
        custom: 'Selected budget may not be sufficient for this project type'
      }
    },
    
    timeline: {
      required: true,
      validOptions: safeMap(FORM_OPTIONS?.timelines, t => t.value),
      customValidation: validateTimelineFeasibility,
      errorMessages: {
        required: 'Please select a preferred timeline',
        validOptions: 'Please select a valid timeline option',
        custom: 'Selected timeline may not be feasible for this project complexity'
      }
    },
    
    // Step 3: Technical Requirements
    numberOfPages: {
      required: true,
      validOptions: ['1-5', '6-10', '11-20', '21-50', '51-100', '100+'],
      errorMessages: {
        required: 'Please specify number of pages/screens',
        validOptions: 'Please select a valid page range'
      }
    },
    
    deviceSupport: {
      required: true,
      minSelection: 1,
      validOptions: ['desktop', 'mobile', 'tablet', 'smartwatch', 'tv'],
      errorMessages: {
        required: 'Please select at least one device type',
        minSelection: 'At least one device support option must be selected'
      }
    },
    
    browserSupport: {
      required: false,
      validOptions: ['chrome', 'firefox', 'safari', 'edge', 'ie11', 'opera'],
      maxSelection: 6
    },
    
    performanceRequirements: {
      required: false,
      customValidation: validatePerformanceRequirements
    },
    
    // Step 4: Design Requirements
    designType: {
      required: true,
      validOptions: Object.keys(FORM_OPTIONS?.designTypeMultipliers || {}),
      errorMessages: {
        required: 'Please select a design approach',
        validOptions: 'Please select a valid design type'
      }
    },
    
    brandGuidelines: {
      required: false,
      validOptions: ['existing', 'partial', 'none', 'need_creation']
    },
    
    designRevisions: {
      required: true,
      validOptions: ['2', '3', '5', 'unlimited'],
      errorMessages: {
        required: 'Please specify number of design revisions',
        validOptions: 'Please select a valid revision option'
      }
    },
    
    mockupRequirements: {
      required: true,
      validOptions: ['wireframes', 'low_fidelity', 'high_fidelity', 'interactive_prototype', 'design_system'],
      errorMessages: {
        required: 'Please select mockup requirements',
        validOptions: 'Please select a valid mockup type'
      }
    },
    
    // Features validation with smart suggestions
    coreFeatures: {
      required: true,
      minSelection: 1,
      maxSelection: 12,
      validOptions: Object.keys(FORM_OPTIONS?.featurePricing || {}).filter(key => 
        ['user_authentication', 'content_management', 'search_functionality', 
         'contact_forms', 'file_management', 'user_dashboard', 'admin_panel', 'basic_ecommerce']
        .includes(key)
      ),
      customValidation: validateFeatureCompatibility,
      errorMessages: {
        required: 'Please select at least one core feature',
        minSelection: 'At least one core feature must be selected',
        maxSelection: 'Too many core features selected (maximum 12)',
        custom: 'Some selected features may conflict with each other'
      }
    }
  },
  
  // Step-specific validation groups
  stepValidation: {
    1: ['clientName', 'companyName', 'email', 'phone', 'industry', 'companySize'],
    2: ['projectTitle', 'projectType', 'projectGoal', 'targetAudience', 'budgetRange', 'timeline'],
    3: ['numberOfPages', 'deviceSupport'],
    4: ['designType', 'designRevisions', 'mockupRequirements'],
    5: [], // Technology stack - mostly optional
    6: ['coreFeatures'],
    7: [], // Content and support - mostly optional
    8: []  // Additional requirements - optional
  },
  
  // Cross-field validation rules
  crossFieldValidation: {
    budgetVsComplexity: {
      fields: ['budgetRange', 'projectType', 'coreFeatures', 'advancedFeatures'],
      validator: validateBudgetComplexityAlignment,
      errorMessage: 'Selected budget may not be sufficient for the project complexity'
    },
    
    timelineVsScope: {
      fields: ['timeline', 'projectType', 'numberOfPages', 'coreFeatures'],
      validator: validateTimelineScopeAlignment,
      errorMessage: 'Selected timeline may not be realistic for the project scope'
    },
    
    industryCompliance: {
      fields: ['industry', 'securityFeatures', 'complianceRequirements'],
      validator: validateIndustryCompliance,
      errorMessage: 'Additional compliance requirements may be needed for this industry'
    }
  }
};

// Real-time validation class
export class RealTimeValidator {
  constructor(formData, onValidationChange) {
    this.formData = formData;
    this.onValidationChange = onValidationChange;
    this.validationState = {};
    this.debounceTimers = {};
    this.validationHistory = {};
  }
  
  // Validate single field with debouncing
  validateField(fieldName, value, immediate = false) {
    if (this.debounceTimers[fieldName]) {
      clearTimeout(this.debounceTimers[fieldName]);
    }
    
    const delay = immediate ? 0 : VALIDATION_CONFIG.realTime.debounceDelay;
    
    this.debounceTimers[fieldName] = setTimeout(() => {
      this.performFieldValidation(fieldName, value);
    }, delay);
  }
  
  // Perform actual field validation
  performFieldValidation(fieldName, value) {
    const rules = VALIDATION_CONFIG.fieldRules[fieldName];
    if (!rules) return;
    
    const validationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };
    
    // Required validation
    if (rules.required && this.isEmpty(value)) {
      validationResult.isValid = false;
      validationResult.errors.push(rules.errorMessages?.required || `${fieldName} is required`);
    }
    
    // Skip other validations if field is empty and not required
    if (this.isEmpty(value) && !rules.required) {
      this.updateValidationState(fieldName, validationResult);
      return;
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      validationResult.isValid = false;
      validationResult.errors.push(rules.errorMessages?.pattern || 'Invalid format');
    }
    
    // Length validation
    if (rules.minLength && value.length < rules.minLength) {
      validationResult.isValid = false;
      validationResult.errors.push(rules.errorMessages?.minLength || `Minimum ${rules.minLength} characters required`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      validationResult.isValid = false;
      validationResult.errors.push(rules.errorMessages?.maxLength || `Maximum ${rules.maxLength} characters allowed`);
    }
    
    // Valid options validation
    if (rules.validOptions) {
      if (Array.isArray(value)) {
        const invalidOptions = value.filter(v => !rules.validOptions.includes(v));
        if (invalidOptions.length > 0) {
          validationResult.isValid = false;
          validationResult.errors.push(rules.errorMessages?.validOptions || 'Invalid option selected');
        }
        
        // Min/Max selection validation
        if (rules.minSelection && value.length < rules.minSelection) {
          validationResult.isValid = false;
          validationResult.errors.push(rules.errorMessages?.minSelection || `Select at least ${rules.minSelection} option(s)`);
        }
        
        if (rules.maxSelection && value.length > rules.maxSelection) {
          validationResult.isValid = false;
          validationResult.errors.push(rules.errorMessages?.maxSelection || `Select at most ${rules.maxSelection} option(s)`);
        }
      } else {
        if (!rules.validOptions.includes(value)) {
          validationResult.isValid = false;
          validationResult.errors.push(rules.errorMessages?.validOptions || 'Invalid option selected');
        }
      }
    }
    
    // Custom validation
    if (rules.customValidation) {
      try {
        const customResult = rules.customValidation(value, this.formData);
        if (customResult && !customResult.isValid) {
          validationResult.isValid = false;
          validationResult.errors.push(customResult.message || rules.errorMessages?.custom || 'Custom validation failed');
        }
        
        if (customResult && customResult.warnings) {
          validationResult.warnings.push(...customResult.warnings);
        }
        
        if (customResult && customResult.suggestions) {
          validationResult.suggestions.push(...customResult.suggestions);
        }
      } catch (error) {
        console.warn(`Custom validation error for ${fieldName}:`, error);
      }
    }
    
    this.updateValidationState(fieldName, validationResult);
  }
  
  // Update validation state and notify
  updateValidationState(fieldName, validationResult) {
    this.validationState[fieldName] = validationResult;
    this.validationHistory[fieldName] = this.validationHistory[fieldName] || [];
    this.validationHistory[fieldName].push({
      timestamp: new Date(),
      result: validationResult
    });
    
    // Keep only last 5 validation results for each field
    if (this.validationHistory[fieldName].length > 5) {
      this.validationHistory[fieldName] = this.validationHistory[fieldName].slice(-5);
    }
    
    // Notify parent component
    if (this.onValidationChange) {
      this.onValidationChange(fieldName, validationResult);
    }
  }
  
  // Utility methods
  isEmpty(value) {
    return value === null || value === undefined || value === '' || 
           (Array.isArray(value) && value.length === 0);
  }
}

// Add all the missing validation functions
export const validateStep = (step, formData) => {
  const errors = {};
  
  switch (step) {
    case 1:
      return validateClientInformation(formData);
    case 2:
      return validateProjectOverview(formData);
    case 3:
      return validateTechnicalRequirements(formData);
    case 4:
      return validateDesignRequirements(formData);
    case 5:
      return validateTechnologyStack(formData);
    case 6:
      return validateFeaturesAndFunctionality(formData);
    case 7:
      return validateContentAndSupport(formData);
    case 8:
      return validateAdditionalRequirements(formData);
    default:
      return {};
  }
};

const validateClientInformation = (formData) => {
  const errors = {};
  
  if (!formData.clientName?.trim()) {
    errors.clientName = 'Client name is required';
  }
  
  if (!formData.companyName?.trim()) {
    errors.companyName = 'Company name is required';
  }
  
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!formData.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  if (!formData.industry) {
    errors.industry = 'Industry selection is required';
  }
  
  return errors;
};

const validateProjectOverview = (formData) => {
  const errors = {};
  
  if (!formData.projectTitle?.trim()) {
    errors.projectTitle = 'Project title is required';
  }
  
  if (!formData.projectType) {
    errors.projectType = 'Project type selection is required';
  }
  
  if (!formData.projectGoal?.trim()) {
    errors.projectGoal = 'Project goal description is required';
  } else if (formData.projectGoal.trim().length < 20) {
    errors.projectGoal = 'Please provide a more detailed project goal (minimum 20 characters)';
  }
  
  if (!formData.targetAudience?.trim()) {
    errors.targetAudience = 'Target audience description is required';
  } else if (formData.targetAudience.trim().length < 10) {
    errors.targetAudience = 'Please provide more details about your target audience';
  }
  
  if (!formData.timeline) {
    errors.timeline = 'Timeline selection is required';
  }
  
  return errors;
};

const validateTechnicalRequirements = (formData) => {
  const errors = {};
  
  if (!formData.numberOfPages) {
    errors.numberOfPages = 'Number of pages/screens selection is required';
  }
  
  if (!formData.deviceSupport || formData.deviceSupport.length === 0) {
    errors.deviceSupport = 'At least one device support option must be selected';
  }
  
  return errors;
};

const validateDesignRequirements = (formData) => {
  const errors = {};
  
  if (!formData.designType) {
    errors.designType = 'Design type selection is required';
  }
  
  return errors;
};

const validateTechnologyStack = (formData) => {
  const errors = {};
  return errors;
};

const validateFeaturesAndFunctionality = (formData) => {
  const errors = {};
  
  if (!formData.coreFeatures || formData.coreFeatures.length === 0) {
    errors.coreFeatures = 'At least one core feature must be selected';
  }
  
  return errors;
};

const validateContentAndSupport = (formData) => {
  const errors = {};
  return errors;
};

const validateAdditionalRequirements = (formData) => {
  const errors = {};
  return errors;
};

export const getStepCompletionStatus = (step, formData) => {
  const errors = validateStep(step, formData);
  const isValid = Object.keys(errors).length === 0;
  
  // Calculate completion percentage based on filled fields
  let filledFields = 0;
  let totalFields = 0;
  
  switch (step) {
    case 1:
      totalFields = 7;
      if (formData.clientName) filledFields++;
      if (formData.companyName) filledFields++;
      if (formData.email) filledFields++;
      if (formData.phone) filledFields++;
      if (formData.website) filledFields++;
      if (formData.industry) filledFields++;
      if (formData.companySize) filledFields++;
      break;
      
    case 2:
      totalFields = 6;
      if (formData.projectTitle) filledFields++;
      if (formData.projectType) filledFields++;
      if (formData.projectGoal) filledFields++;
      if (formData.targetAudience) filledFields++;
      if (formData.budgetRange) filledFields++;
      if (formData.timeline) filledFields++;
      break;
      
    // Add cases for other steps...
    default:
      totalFields = 1;
      filledFields = 1;
  }
  
  const completionPercentage = (filledFields / totalFields) * 100;
  
  return {
    isValid,
    completionPercentage,
    filledFields,
    totalFields
  };
};

// Helper functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[^\d\+]/g, '');
  return cleanPhone.length >= 10 && phoneRegex.test(cleanPhone);
};

// Custom validation functions
function validatePersonName(name) {
  const nameParts = name.trim().split(/\s+/);
  
  if (nameParts.length < 2) {
    return { isValid: false, message: 'Please enter both first and last name' };
  }
  
  if (nameParts.some(part => part.length < 2)) {
    return { isValid: false, message: 'Each name part must be at least 2 characters' };
  }
  
  return { isValid: true };
}

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  
  return { isValid: true };
}

function validatePhoneNumber(phone) {
  const cleaned = phone.replace(/[^\d\+]/g, '');
  const indianRegex = /^(\+91|91)?[6-9]\d{9}$/;
  const intlRegex = /^\+[1-9]\d{1,14}$/;
  
  if (indianRegex.test(cleaned) || intlRegex.test(cleaned)) {
    return { isValid: true };
  }
  
  return { 
    isValid: false, 
    message: 'Please enter a valid phone number with country code' 
  };
}

function validateWebsiteUrl(url) {
  if (!url) return { isValid: true };
  
  try {
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    new URL(urlWithProtocol);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      message: 'Please enter a valid website URL' 
    };
  }
}

function validateProjectDescription(description) {
  const wordCount = description.trim().split(/\s+/).length;
  
  if (wordCount < 5) {
    return { isValid: false, message: 'Please provide more detailed description (minimum 5 words)' };
  }
  
  return { isValid: true };
}

function validateBudgetCompatibility(budgetRange, formData) {
  return { isValid: true };
}

function validateTimelineFeasibility(timeline, formData) {
  return { isValid: true };
}

function validateFeatureCompatibility(features, formData) {
  if (!Array.isArray(features) || features.length === 0) {
    return { isValid: false, message: 'At least one core feature is required' };
  }
  
  return { isValid: true };
}

function validatePerformanceRequirements(requirements) {
  return { isValid: true };
}

function validateBudgetComplexityAlignment(fieldValues, formData) {
  return { isValid: true };
}

function validateTimelineScopeAlignment(fieldValues, formData) {
  return { isValid: true };
}

function validateIndustryCompliance(fieldValues, formData) {
  return { isValid: true };
}

// Export validation status constants
export const VALIDATION_STATUS = {
  VALID: 'valid',
  INVALID: 'invalid',
  WARNING: 'warning',
  PENDING: 'pending'
};

// Export field types for different validation approaches
export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  URL: 'url',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  CHECKBOX: 'checkbox',
  RADIO: 'radio'
};
