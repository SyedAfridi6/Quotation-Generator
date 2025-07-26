export const BASE_RATES = {
  development: 2500, // INR per hour
  design: 2000,      // INR per hour
  consultation: 3000, // INR per hour
  projectManagement: 1800 // INR per hour
};

export const COMPLEXITY_MULTIPLIERS = {
  1: 0.7,   // Very Simple
  2: 0.8,   // Simple  
  3: 0.9,   // Below Average
  4: 1.0,   // Average
  5: 1.1,   // Above Average
  6: 1.3,   // Complex
  7: 1.5,   // Very Complex
  8: 1.8,   // Highly Complex
  9: 2.2,   // Expert Level
  10: 2.5   // Enterprise Level
};

export const INDUSTRY_MULTIPLIERS = {
  'technology': 1.0,
  'healthcare': 1.3,
  'finance': 1.4,
  'education': 0.9,
  'retail': 1.0,
  'manufacturing': 1.1,
  'realestate': 1.0,
  'travel': 1.0,
  'media': 1.1,
  'nonprofit': 0.8,
  'consulting': 1.1,
  'automotive': 1.2,
  'food': 0.9,
  'fashion': 1.0,
  'sports': 1.0,
  'legal': 1.3,
  'government': 1.2,
  'agriculture': 0.9,
  'logistics': 1.1,
  'other': 1.0
};

export const TIMELINE_MULTIPLIERS = {
  'rush': 1.8,      // Rush delivery (1-2 weeks)
  'fast': 1.4,      // Fast track (3-4 weeks)  
  'standard': 1.0,  // Standard (6-8 weeks)
  'extended': 0.9,  // Extended (10-12 weeks)
  'flexible': 0.85  // Flexible (12+ weeks)
};

export const FEATURE_COSTS = {
  core: {
    'user_authentication': {
      name: 'User Authentication System',
      cost: 25000,
      hours: 16
    },
    'content_management': {
      name: 'Content Management System',
      cost: 35000,
      hours: 24
    },
    'search_functionality': {
      name: 'Search & Filter System',
      cost: 30000,
      hours: 20
    },
    'contact_forms': {
      name: 'Contact Forms & Communication',
      cost: 12000,
      hours: 8
    },
    'file_management': {
      name: 'File Upload & Management',
      cost: 25000,
      hours: 16
    },
    'user_dashboard': {
      name: 'User Dashboard & Profiles', 
      cost: 30000,
      hours: 20
    },
    'admin_panel': {
      name: 'Admin Panel & Controls',
      cost: 40000,
      hours: 24
    },
    'basic_ecommerce': {
      name: 'Basic E-commerce Features',
      cost: 60000,
      hours: 40
    }
  },
  
  advanced: {
    'real_time_chat': {
      name: 'Real-time Chat & Messaging',
      cost: 50000,
      hours: 32
    },
    'video_calling': {
      name: 'Video Calling & Conferencing',
      cost: 75000,
      hours: 48
    },
    'push_notifications': {
      name: 'Push Notifications System',
      cost: 35000,
      hours: 24
    },
    'api_integrations': {
      name: 'Third-party API Integrations',
      cost: 40000,
      hours: 20
    },
    'workflow_automation': {
      name: 'Workflow Automation',
      cost: 65000,
      hours: 40
    },
    'advanced_analytics': {
      name: 'Advanced Analytics & Reporting',
      cost: 55000,
      hours: 36
    },
    'ai_ml_features': {
      name: 'AI/ML Features & Chatbots',
      cost: 100000,
      hours: 60
    },
    'blockchain_integration': {
      name: 'Blockchain Integration',
      cost: 150000,
      hours: 80
    }
  },
  
  ecommerce: {
    'product_catalog': {
      name: 'Product Catalog & Management',
      cost: 40000,
      hours: 24
    },
    'shopping_cart': {
      name: 'Shopping Cart & Checkout',
      cost: 35000,
      hours: 20
    },
    'payment_processing': {
      name: 'Payment Gateway Integration',
      cost: 30000,
      hours: 16
    },
    'inventory_management': {
      name: 'Inventory Management System',
      cost: 55000,
      hours: 32
    },
    'order_management': {
      name: 'Order Processing & Tracking',
      cost: 45000,
      hours: 28
    },
    'multi_vendor': {
      name: 'Multi-vendor Marketplace',
      cost: 100000,
      hours: 60
    },
    'subscription_billing': {
      name: 'Subscription & Recurring Billing',
      cost: 70000,
      hours: 40
    }
  }
};

export const SERVICE_COSTS = {
  content: {
    'partial_creation': 15000,
    'full_creation': 40000,
    'copywriting': 25000,
    'content_strategy': 20000
  },
  
  media: {
    'stock_photos': 10000,
    'custom_photography': 35000,
    'graphic_design': 20000,
    'video_production': 50000,
    'complete_media': 80000
  },
  
  seo: {
    'basic_seo': 15000,
    'advanced_seo': 35000,
    'comprehensive_seo': 60000,
    'local_seo': 25000,
    'ecommerce_seo': 45000,
    'enterprise_seo': 80000
  },
  
  maintenance: {
    'basic_maintenance': 24000,
    'standard_maintenance': 48000,
    'premium_maintenance': 84000,
    'enterprise_maintenance': 150000
  },
  
  support: {
    'basic_support': 12000,
    'standard_support': 24000,
    'premium_support': 48000,
    'enterprise_support': 96000
  },
  
  training: {
    'basic_training': 8000,
    'comprehensive_training': 20000,
    'ongoing_training': 35000,
    'custom_training': 30000
  }
};

export const CURRENCY_RATES = {
  'USD': 0.012,  // 1 INR = 0.012 USD
  'EUR': 0.011,  // 1 INR = 0.011 EUR  
  'GBP': 0.0095, // 1 INR = 0.0095 GBP
  'CAD': 0.016,  // 1 INR = 0.016 CAD
  'AUD': 0.018,  // 1 INR = 0.018 AUD
  'INR': 1.0     // Base currency
};

export const CURRENCY_SYMBOLS = {
  'USD': '$',
  'EUR': '€', 
  'GBP': '£',
  'CAD': 'C$',
  'AUD': 'A$',
  'INR': '₹'
};
