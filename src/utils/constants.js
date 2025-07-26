export const FORM_OPTIONS = {
  industries: [
    { value: 'technology', label: '🖥️ Technology & Software' },
    { value: 'healthcare', label: '🏥 Healthcare & Medical' },
    { value: 'finance', label: '💰 Finance & Banking' },
    { value: 'education', label: '🎓 Education & E-learning' },
    { value: 'retail', label: '🛍️ Retail & E-commerce' },
    { value: 'manufacturing', label: '🏭 Manufacturing & Industrial' },
    { value: 'realestate', label: '🏠 Real Estate & Property' },
    { value: 'travel', label: '✈️ Travel & Hospitality' },
    { value: 'media', label: '📺 Media & Entertainment' },
    { value: 'nonprofit', label: '🤝 Non-profit & NGO' },
    { value: 'consulting', label: '💼 Consulting & Services' },
    { value: 'automotive', label: '🚗 Automotive' },
    { value: 'food', label: '🍽️ Food & Beverage' },
    { value: 'fashion', label: '👔 Fashion & Lifestyle' },
    { value: 'sports', label: '⚽ Sports & Fitness' },
    { value: 'legal', label: '⚖️ Legal Services' },
    { value: 'government', label: '🏛️ Government' },
    { value: 'agriculture', label: '🌾 Agriculture' },
    { value: 'logistics', label: '🚚 Logistics & Supply Chain' },
    { value: 'other', label: '🔧 Other' }
  ],

  // ADD MISSING COMPANY SIZES
  companySizes: [
    { value: 'startup', label: '👥 Startup (1-10 employees)' },
    { value: 'small', label: '🏢 Small Business (11-50 employees)' },
    { value: 'medium', label: '🏬 Medium Business (51-200 employees)' },
    { value: 'large', label: '🏭 Large Business (201-1000 employees)' },
    { value: 'enterprise', label: '🌐 Enterprise (1000+ employees)' }
  ],

  projectTypes: [
    { value: 'business_website', label: '🏢 Business Website', complexity: 1, basePrice: 50000 },
    { value: 'ecommerce_platform', label: '🛒 E-commerce Platform', complexity: 3, basePrice: 150000 },
    { value: 'web_application', label: '💻 Web Application', complexity: 4, basePrice: 200000 },
    { value: 'mobile_app', label: '📱 Mobile Application', complexity: 4, basePrice: 250000 },
    { value: 'portfolio_website', label: '🎨 Portfolio Website', complexity: 1, basePrice: 30000 },
    { value: 'booking_system', label: '📅 Booking & Reservation System', complexity: 3, basePrice: 120000 },
    { value: 'learning_platform', label: '📚 Learning Management System', complexity: 4, basePrice: 300000 },
    { value: 'marketplace', label: '🏪 Marketplace Platform', complexity: 5, basePrice: 400000 },
    { value: 'blog_cms', label: '📝 Blog/CMS Platform', complexity: 2, basePrice: 80000 },
    { value: 'crm_system', label: '📊 CRM System', complexity: 4, basePrice: 250000 },
    { value: 'erp_system', label: '🏭 ERP System', complexity: 5, basePrice: 500000 },
    { value: 'social_platform', label: '👥 Social Media Platform', complexity: 5, basePrice: 350000 },
    { value: 'real_estate', label: '🏠 Real Estate Platform', complexity: 3, basePrice: 180000 },
    { value: 'healthcare_app', label: '🏥 Healthcare Application', complexity: 4, basePrice: 280000 },
    { value: 'fintech_app', label: '💳 Fintech Application', complexity: 5, basePrice: 400000 },
    { value: 'other', label: '⚙️ Other', complexity: 2, basePrice: 100000 }
  ],

  // ADD MISSING TIMELINES
  timelines: [
    { value: 'rush', label: '⚡ Rush (1-2 weeks)' },
    { value: 'fast', label: '🚀 Fast Track (3-4 weeks)' },
    { value: 'standard', label: '⏰ Standard (6-8 weeks)' },
    { value: 'extended', label: '📅 Extended (10-12 weeks)' },
    { value: 'flexible', label: '🌱 Flexible (12+ weeks)' }
  ],

  // ADD MISSING BUDGET RANGES
  budgetRanges: [
    { value: 'under_1L', label: '💵 Under ₹1,00,000' },
    { value: '1L_3L', label: '💰 ₹1,00,000 - ₹3,00,000' },
    { value: '3L_5L', label: '💎 ₹3,00,000 - ₹5,00,000' },
    { value: '5L_10L', label: '💍 ₹5,00,000 - ₹10,00,000' },
    { value: '10L_20L', label: '👑 ₹10,00,000 - ₹20,00,000' },
    { value: '20L_50L', label: '💸 ₹20,00,000 - ₹50,00,000' },
    { value: 'above_50L', label: '🏆 Above ₹50,00,000' }
  ],

  timelineMultipliers: {
    rush: 2.5,
    fast: 1.8,
    standard: 1.0,
    extended: 0.8,
    flexible: 0.7
  },

  complexityMultipliers: {
    1: 1.0,    // Simple
    2: 1.5,    // Basic
    3: 2.0,    // Moderate
    4: 3.0,    // Complex
    5: 4.5     // Enterprise
  },

  designTypeMultipliers: {
    template: 1.0,
    custom: 1.8,
    premium: 2.5,
    enterprise: 3.5
  },

  featurePricing: {
    // Core Features
    user_authentication: 15000,
    content_management: 25000,
    search_functionality: 20000,
    contact_forms: 8000,
    file_management: 18000,
    user_dashboard: 30000,
    admin_panel: 35000,
    basic_ecommerce: 50000,

    // Advanced Features
    real_time_chat: 40000,
    video_calling: 80000,
    push_notifications: 25000,
    api_integrations: 30000,
    workflow_automation: 60000,
    advanced_analytics: 45000,
    ai_ml_features: 100000,
    blockchain_integration: 150000,

    // E-commerce Features
    product_catalog: 35000,
    shopping_cart: 25000,
    payment_processing: 40000,
    inventory_management: 50000,
    order_management: 35000,
    multi_vendor: 80000,
    subscription_billing: 60000,
    advanced_ecommerce: 100000,

    // Security Features
    ssl_certificate: 5000,
    two_factor_auth: 15000,
    data_encryption: 20000,
    backup_system: 12000,
    security_monitoring: 25000,
    penetration_testing: 40000
  },

  currencyRates: {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    CAD: 0.016,
    AUD: 0.018
  },

  currencySymbols: {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$'
  }
};

export const VALIDATION_RULES = {
  required: ['clientName', 'companyName', 'email', 'phone', 'industry', 'projectType', 'timeline', 'numberOfPages', 'deviceSupport', 'designType', 'coreFeatures'],
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[0-9\s\-\(\)]{10,}$/,
  minLength: {
    clientName: 2,
    companyName: 2,
    projectGoal: 10,
    targetAudience: 10
  },

  projectBudgets: [
    { value: 'limited', label: '💰 Limited Budget' },
    { value: 'moderate', label: '💵 Moderate Budget' },
    { value: 'flexible', label: '💎 Flexible Budget' },
    { value: 'premium', label: '👑 Premium Budget' }
  ],

  // Expected users for scalability
  expectedUsers: [
    { value: '1-100', label: '👥 1-100 users' },
    { value: '101-1000', label: '👥 101-1,000 users' },
    { value: '1001-10000', label: '👥 1,001-10,000 users' },
    { value: '10001-100000', label: '👥 10,001-100,000 users' },
    { value: '100000+', label: '👥 100,000+ users' }
  ],

  regions: [
    { value: 'northAmerica', label: '🇺🇸 North America' },
    { value: 'europe', label: '🇪🇺 Europe' },
    { value: 'asia', label: '🇦🇸 Asia' },
    { value: 'oceania', label: '🇦🇺 Oceania' },
    { value: 'southAmerica', label: '🇧🇷 South America' },
    { value: 'africa', label: '🇿🇦 Africa' }
  ]

};
