import { FORM_OPTIONS } from './constants.js';

// 2025 Indian Market Rates for Medium Companies (Research-Based)
const MARKET_RATES = {
  // Hourly rates for different skill levels (INR)
  developer: {
    junior: 1500,
    mid: 2500,
    senior: 3500,
    lead: 4500
  },
  designer: {
    junior: 1200,
    mid: 2000,
    senior: 3000,
    lead: 4000
  },
  specialist: {
    qa: 1800,
    devops: 3000,
    pm: 2800
  }
};

// Project complexity matrix (research-based scaling)
const PROJECT_COMPLEXITY = {
  portfolio_website: {
    baseCost: 35000,
    baseHours: 25,
    complexity: 1.0,
    teamSize: 1,
    weeks: 2
  },
  business_website: {
    baseCost: 65000,
    baseHours: 45,
    complexity: 1.2,
    teamSize: 2,
    weeks: 3
  },
  blog_cms: {
    baseCost: 85000,
    baseHours: 60,
    complexity: 1.3,
    teamSize: 2,
    weeks: 4
  },
  ecommerce_platform: {
    baseCost: 250000,
    baseHours: 180,
    complexity: 2.2,
    teamSize: 3,
    weeks: 10
  },
  web_application: {
    baseCost: 320000,
    baseHours: 220,
    complexity: 2.5,
    teamSize: 3,
    weeks: 12
  },
  mobile_app: {
    baseCost: 280000,
    baseHours: 200,
    complexity: 2.3,
    teamSize: 3,
    weeks: 11
  },
  booking_system: {
    baseCost: 180000,
    baseHours: 130,
    complexity: 2.0,
    teamSize: 3,
    weeks: 8
  },
  learning_platform: {
    baseCost: 450000,
    baseHours: 300,
    complexity: 3.0,
    teamSize: 4,
    weeks: 16
  },
  marketplace: {
    baseCost: 650000,
    baseHours: 400,
    complexity: 3.5,
    teamSize: 4,
    weeks: 20
  },
  crm_system: {
    baseCost: 380000,
    baseHours: 250,
    complexity: 2.8,
    teamSize: 3,
    weeks: 14
  },
  erp_system: {
    baseCost: 850000,
    baseHours: 500,
    complexity: 4.0,
    teamSize: 5,
    weeks: 24
  },
  social_platform: {
    baseCost: 520000,
    baseHours: 350,
    complexity: 3.2,
    teamSize: 4,
    weeks: 18
  },
  real_estate: {
    baseCost: 220000,
    baseHours: 160,
    complexity: 2.1,
    teamSize: 3,
    weeks: 9
  },
  healthcare_app: {
    baseCost: 420000,
    baseHours: 280,
    complexity: 3.0,
    teamSize: 4,
    weeks: 15
  },
  fintech_app: {
    baseCost: 650000,
    baseHours: 380,
    complexity: 3.6,
    teamSize: 4,
    weeks: 18
  },
  other: {
    baseCost: 120000,
    baseHours: 80,
    complexity: 1.5,
    teamSize: 2,
    weeks: 6
  }
};

// Feature-based hour additions (realistic estimates)
const FEATURE_HOURS = {
  // Core features (8-20 hours each)
  user_authentication: 15,
  content_management: 20,
  search_functionality: 12,
  contact_forms: 8,
  file_management: 18,
  user_dashboard: 25,
  admin_panel: 30,
  basic_ecommerce: 40,
  
  // Advanced features (25-60 hours each)
  real_time_chat: 45,
  video_calling: 60,
  push_notifications: 30,
  api_integrations: 25,
  workflow_automation: 50,
  advanced_analytics: 35,
  ai_ml_features: 80,
  blockchain_integration: 90,
  
  // E-commerce features (20-50 hours each)
  product_catalog: 30,
  shopping_cart: 25,
  payment_processing: 35,
  inventory_management: 40,
  order_management: 30,
  multi_vendor: 60,
  subscription_billing: 45,
  advanced_ecommerce: 70
};

// Page-based scaling (realistic)
const PAGE_SCALING = {
  '1-5': { multiplier: 1.0, additionalHours: 0 },
  '6-10': { multiplier: 1.2, additionalHours: 10 },
  '11-20': { multiplier: 1.4, additionalHours: 20 },
  '21-50': { multiplier: 1.8, additionalHours: 40 },
  '51-100': { multiplier: 2.2, additionalHours: 80 },
  '100+': { multiplier: 3.0, additionalHours: 120 }
};

// Industry multipliers (medium company focused)
const INDUSTRY_MULTIPLIERS = {
  technology: 1.0,
  healthcare: 1.25,
  finance: 1.35,
  education: 0.9,
  retail: 1.0,
  manufacturing: 1.1,
  realestate: 1.05,
  travel: 1.0,
  media: 1.05,
  nonprofit: 0.8,
  consulting: 1.1,
  automotive: 1.15,
  food: 0.95,
  fashion: 1.0,
  sports: 1.0,
  legal: 1.2,
  government: 1.15,
  agriculture: 0.85,
  logistics: 1.05,
  other: 1.0
};

// Timeline multipliers (realistic urgency pricing)
const TIMELINE_MULTIPLIERS = {
  rush: 1.5,     // 50% extra for rush jobs
  fast: 1.25,    // 25% extra for fast delivery
  standard: 1.0, // Normal pricing
  extended: 0.95, // 5% discount for extended timeline
  flexible: 0.9   // 10% discount for flexible timeline
};

// Calculate total project hours
function calculateProjectHours(formData) {
  try {
    const projectData = PROJECT_COMPLEXITY[formData.projectType] || PROJECT_COMPLEXITY.other;
    let totalHours = projectData.baseHours;
    
    // Add feature hours
    const features = [
      ...(formData.coreFeatures || []),
      ...(formData.advancedFeatures || []),
      ...(formData.ecommerceFeatures || [])
    ];
    
    features.forEach(feature => {
      totalHours += FEATURE_HOURS[feature] || 10;
    });
    
    // Page scaling
    const pageData = PAGE_SCALING[formData.numberOfPages] || PAGE_SCALING['1-5'];
    totalHours = totalHours * pageData.multiplier + pageData.additionalHours;
    
    // Integration complexity
    const integrations = formData.integrationRequirements || [];
    totalHours += integrations.length * 8;
    
    // Performance features
    const performanceFeatures = formData.performanceFeatures || [];
    totalHours += performanceFeatures.length * 6;
    
    return Math.ceil(totalHours);
  } catch (error) {
    console.error('Error calculating project hours:', error);
    return 60; // Default fallback
  }
}

// Calculate realistic team composition
function calculateTeamComposition(formData, totalHours) {
  try {
    const projectData = PROJECT_COMPLEXITY[formData.projectType] || PROJECT_COMPLEXITY.other;
    const team = [];
    
    if (totalHours <= 60) {
      // Simple projects - Solo developer or small team
      team.push({
        role: 'Full Stack Developer',
        level: 'Mid',
        hours: totalHours * 0.8,
        rate: MARKET_RATES.developer.mid
      });
      
      if (formData.designType !== 'template') {
        team.push({
          role: 'UI/UX Designer',
          level: 'Mid',
          hours: totalHours * 0.3,
          rate: MARKET_RATES.designer.mid
        });
      }
    } else if (totalHours <= 200) {
      // Medium projects - Specialized team
      team.push({
        role: 'Frontend Developer',
        level: 'Senior',
        hours: totalHours * 0.4,
        rate: MARKET_RATES.developer.senior
      });
      
      team.push({
        role: 'Backend Developer',
        level: 'Mid',
        hours: totalHours * 0.5,
        rate: MARKET_RATES.developer.mid
      });
      
      team.push({
        role: 'UI/UX Designer',
        level: 'Mid',
        hours: totalHours * 0.25,
        rate: MARKET_RATES.designer.mid
      });
      
      if (totalHours > 150) {
        team.push({
          role: 'QA Engineer',
          level: 'Mid',
          hours: totalHours * 0.15,
          rate: MARKET_RATES.specialist.qa
        });
      }
    } else {
      // Complex projects - Full team
      team.push({
        role: 'Frontend Developer',
        level: 'Senior',
        hours: totalHours * 0.35,
        rate: MARKET_RATES.developer.senior
      });
      
      team.push({
        role: 'Backend Developer',
        level: 'Senior',
        hours: totalHours * 0.45,
        rate: MARKET_RATES.developer.senior
      });
      
      team.push({
        role: 'UI/UX Designer',
        level: 'Senior',
        hours: totalHours * 0.25,
        rate: MARKET_RATES.designer.senior
      });
      
      team.push({
        role: 'QA Engineer',
        level: 'Mid',
        hours: totalHours * 0.2,
        rate: MARKET_RATES.specialist.qa
      });
      
      if (totalHours > 300) {
        team.push({
          role: 'DevOps Engineer',
          level: 'Mid',
          hours: totalHours * 0.15,
          rate: MARKET_RATES.specialist.devops
        });
        
        team.push({
          role: 'Project Manager',
          level: 'Mid',
          hours: totalHours * 0.1,
          rate: MARKET_RATES.specialist.pm
        });
      }
    }
    
    // Calculate costs for each team member
    team.forEach(member => {
      member.cost = Math.round(member.hours * member.rate);
    });
    
    const totalCost = team.reduce((sum, member) => sum + member.cost, 0);
    const totalTeamHours = team.reduce((sum, member) => sum + member.hours, 0);
    
    return {
      composition: team,
      totalMembers: team.length,
      totalHours: Math.ceil(totalTeamHours),
      totalCost,
      averageRate: Math.round(totalCost / totalTeamHours)
    };
  } catch (error) {
    console.error('Error calculating team composition:', error);
    return {
      composition: [{ role: 'Full Stack Developer', level: 'Mid', hours: 60, rate: 2500, cost: 150000 }],
      totalMembers: 1,
      totalHours: 60,
      totalCost: 150000,
      averageRate: 2500
    };
  }
}

// Calculate realistic timeline
function calculateTimeline(formData, totalHours, teamSize) {
  try {
    const projectData = PROJECT_COMPLEXITY[formData.projectType] || PROJECT_COMPLEXITY.other;
    
    // Calculate working hours per week (assuming 40 hours/week per developer)
    const hoursPerWeek = teamSize * 35; // 35 hours productive work per developer per week
    let estimatedWeeks = Math.ceil(totalHours / hoursPerWeek);
    
    // Add buffer time based on project complexity
    const complexityBuffer = projectData.complexity * 0.5;
    estimatedWeeks = Math.ceil(estimatedWeeks * (1 + complexityBuffer));
    
    // Apply timeline preference
    const timelineMultiplier = TIMELINE_MULTIPLIERS[formData.timeline] || 1.0;
    
    // For rush jobs, add more resources rather than just multiplying cost
    if (formData.timeline === 'rush') {
      estimatedWeeks = Math.max(estimatedWeeks * 0.7, 2); // Minimum 2 weeks even for rush
    } else {
      estimatedWeeks = Math.ceil(estimatedWeeks / timelineMultiplier);
    }
    
    // Realistic bounds
    estimatedWeeks = Math.max(2, Math.min(estimatedWeeks, 26)); // 2-26 weeks maximum
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (estimatedWeeks * 7));
    
    return {
      totalWeeks: estimatedWeeks,
      totalHours,
      hoursPerWeek,
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      timelineMultiplier
    };
  } catch (error) {
    console.error('Error calculating timeline:', error);
    return {
      totalWeeks: 8,
      totalHours: 200,
      hoursPerWeek: 35,
      startDate: new Date().toLocaleDateString(),
      endDate: new Date(Date.now() + (8 * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
      timelineMultiplier: 1.0
    };
  }
}

// Calculate additional costs
function calculateAdditionalCosts(formData) {
  try {
    let additionalCost = 0;
    
    // Content costs (realistic for medium companies)
    const contentCosts = {
      'client_provides': 0,
      'partial_creation': 12000,
      'full_creation': 25000,
      'copywriting': 18000,
      'content_strategy': 15000
    };
    additionalCost += contentCosts[formData.contentProvided] || 0;
    
    // Media costs
    const mediaCosts = {
      'client_provides': 0,
      'stock_photos': 3000,
      'custom_photography': 15000,
      'graphic_design': 10000,
      'video_production': 25000,
      'complete_media': 35000
    };
    additionalCost += mediaCosts[formData.imagesProvided] || 0;
    
    // SEO costs
    const seoCosts = {
      'basic_seo': 8000,
      'advanced_seo': 18000,
      'comprehensive_seo': 30000,
      'local_seo': 12000,
      'ecommerce_seo': 22000,
      'enterprise_seo': 40000
    };
    additionalCost += seoCosts[formData.seoRequirements] || 0;
    
    // Analytics costs
    const analyticsCosts = {
      'basic_analytics': 3000,
      'advanced_analytics': 12000,
      'custom_analytics': 20000,
      'ecommerce_tracking': 8000,
      'business_intelligence': 30000
    };
    additionalCost += analyticsCosts[formData.analyticsSetup] || 0;
    
    return additionalCost;
  } catch (error) {
    console.error('Error calculating additional costs:', error);
    return 5000;
  }
}

// Generate realistic pricing tiers
function generatePricingTiers(baseCost, timeline, formData) {
  try {
    return [
      {
        name: 'Essential',
        description: 'Core functionality with standard features',
        price: Math.round(baseCost * 0.85),
        timeline: Math.max(timeline.totalWeeks - 1, 2),
        revisions: '2 rounds',
        features: [
          'Core functionality',
          'Responsive design',
          'Basic testing',
          '1 month support'
        ],
        teamReduction: '80% team allocation',
        limitations: ['Limited revisions', 'Basic support'],
        recommended: false
      },
      {
        name: 'Professional',
        description: 'Complete solution with all requested features',
        price: Math.round(baseCost),
        timeline: timeline.totalWeeks,
        revisions: '3 rounds',
        features: [
          'All requested functionality',
          'Professional design',
          'Comprehensive testing',
          'Performance optimization',
          '3 months support'
        ],
        teamReduction: 'Full team allocation',
        recommended: true
      },
      {
        name: 'Premium',
        description: 'Enhanced solution with premium support',
        price: Math.round(baseCost * 1.2),
        timeline: timeline.totalWeeks + 1,
        revisions: '5 rounds',
        features: [
          'All Professional features',
          'Premium design & animations',
          'Advanced security',
          'Performance monitoring',
          '6 months support',
          'Priority maintenance'
        ],
        teamReduction: '120% team allocation',
        recommended: false
      }
    ];
  } catch (error) {
    console.error('Error generating pricing tiers:', error);
    return [];
  }
}

// Generate project phases
function generateProjectPhases(timeline) {
  try {
    const totalWeeks = timeline.totalWeeks;
    
    if (totalWeeks <= 4) {
      // Short projects
      return [
        {
          name: 'Planning & Design',
          description: 'Requirements gathering and design',
          duration: Math.ceil(totalWeeks * 0.3),
          deliverables: ['Requirements document', 'Design mockups']
        },
        {
          name: 'Development',
          description: 'Core development and implementation',
          duration: Math.ceil(totalWeeks * 0.6),
          deliverables: ['Core functionality', 'Testing']
        },
        {
          name: 'Launch',
          description: 'Final testing and deployment',
          duration: Math.ceil(totalWeeks * 0.1) || 1,
          deliverables: ['Deployment', 'Handover']
        }
      ];
    } else if (totalWeeks <= 12) {
      // Medium projects
      return [
        {
          name: 'Discovery & Planning',
          description: 'Requirements analysis and project setup',
          duration: Math.ceil(totalWeeks * 0.15),
          deliverables: ['Requirements document', 'Technical architecture', 'Project plan']
        },
        {
          name: 'Design',
          description: 'UI/UX design and prototyping',
          duration: Math.ceil(totalWeeks * 0.2),
          deliverables: ['Wireframes', 'Visual designs', 'Interactive prototype']
        },
        {
          name: 'Development',
          description: 'Core development and feature implementation',
          duration: Math.ceil(totalWeeks * 0.5),
          deliverables: ['Frontend development', 'Backend development', 'Integrations']
        },
        {
          name: 'Testing & QA',
          description: 'Testing and quality assurance',
          duration: Math.ceil(totalWeeks * 0.1),
          deliverables: ['Testing', 'Bug fixes', 'Performance optimization']
        },
        {
          name: 'Deployment',
          description: 'Launch and handover',
          duration: Math.ceil(totalWeeks * 0.05) || 1,
          deliverables: ['Production deployment', 'Documentation', 'Training']
        }
      ];
    } else {
      // Large projects
      return [
        {
          name: 'Discovery & Planning',
          description: 'Comprehensive planning and architecture',
          duration: Math.ceil(totalWeeks * 0.12),
          deliverables: ['Detailed requirements', 'System architecture', 'Project roadmap']
        },
        {
          name: 'Design & Prototyping',
          description: 'Design system and prototyping',
          duration: Math.ceil(totalWeeks * 0.18),
          deliverables: ['Design system', 'User flows', 'Interactive prototypes']
        },
        {
          name: 'Development Phase 1',
          description: 'Core functionality development',
          duration: Math.ceil(totalWeeks * 0.25),
          deliverables: ['Core features', 'Database setup', 'Basic integrations']
        },
        {
          name: 'Development Phase 2',
          description: 'Advanced features and integrations',
          duration: Math.ceil(totalWeeks * 0.25),
          deliverables: ['Advanced features', 'Third-party integrations', 'Admin panel']
        },
        {
          name: 'Testing & Optimization',
          description: 'Comprehensive testing and optimization',
          duration: Math.ceil(totalWeeks * 0.15),
          deliverables: ['Full testing suite', 'Performance optimization', 'Security testing']
        },
        {
          name: 'Deployment & Launch',
          description: 'Production deployment and launch',
          duration: Math.ceil(totalWeeks * 0.05) || 1,
          deliverables: ['Production deployment', 'Launch support', 'Documentation handover']
        }
      ];
    }
  } catch (error) {
    console.error('Error generating project phases:', error);
    return [];
  }
}

// Generate features list with costs
function generateFeaturesList(formData) {
  try {
    const features = [];
    
    // Add core features
    if (formData.coreFeatures && Array.isArray(formData.coreFeatures)) {
      formData.coreFeatures.forEach(featureKey => {
        const hours = FEATURE_HOURS[featureKey] || 10;
        features.push({
          name: getFeatureName(featureKey),
          hours,
          cost: hours * 2500, // Average rate
          category: 'Core'
        });
      });
    }
    
    // Add advanced features
    if (formData.advancedFeatures && Array.isArray(formData.advancedFeatures)) {
      formData.advancedFeatures.forEach(featureKey => {
        const hours = FEATURE_HOURS[featureKey] || 30;
        features.push({
          name: getFeatureName(featureKey),
          hours,
          cost: hours * 3000, // Higher rate for advanced features
          category: 'Advanced'
        });
      });
    }
    
    // Add e-commerce features
    if (formData.ecommerceFeatures && Array.isArray(formData.ecommerceFeatures)) {
      formData.ecommerceFeatures.forEach(featureKey => {
        const hours = FEATURE_HOURS[featureKey] || 25;
        features.push({
          name: getFeatureName(featureKey),
          hours,
          cost: hours * 2800,
          category: 'E-commerce'
        });
      });
    }
    
    if (features.length === 0) {
      features.push(
        { name: 'Basic Website Structure', hours: 20, cost: 50000, category: 'Core' },
        { name: 'Responsive Design', hours: 15, cost: 37500, category: 'Core' }
      );
    }
    
    return features;
  } catch (error) {
    console.error('Error generating features list:', error);
    return [{ name: 'Basic Website', hours: 40, cost: 100000, category: 'Core' }];
  }
}

// Helper function to get feature names
function getFeatureName(featureKey) {
  const featureNames = {
    'user_authentication': 'User Authentication & Registration',
    'content_management': 'Content Management System',
    'search_functionality': 'Search & Filter System',
    'contact_forms': 'Contact Forms & Communication',
    'file_management': 'File Upload & Management',
    'user_dashboard': 'User Dashboard & Profiles',
    'admin_panel': 'Admin Panel & Controls',
    'basic_ecommerce': 'Basic E-commerce Features',
    'real_time_chat': 'Real-time Chat & Messaging',
    'video_calling': 'Video Calling & Conferencing',
    'push_notifications': 'Push Notifications System',
    'api_integrations': 'Third-party API Integrations',
    'workflow_automation': 'Workflow Automation',
    'advanced_analytics': 'Advanced Analytics & Reporting',
    'ai_ml_features': 'AI/ML Features & Chatbots',
    'blockchain_integration': 'Blockchain Integration',
    'product_catalog': 'Product Catalog & Management',
    'shopping_cart': 'Shopping Cart & Checkout',
    'payment_processing': 'Payment Gateway Integration',
    'inventory_management': 'Inventory Management System',
    'order_management': 'Order Processing & Tracking',
    'multi_vendor': 'Multi-vendor Marketplace',
    'subscription_billing': 'Subscription & Recurring Billing',
    'advanced_ecommerce': 'Advanced E-commerce Suite'
  };
  
  return featureNames[featureKey] || featureKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Generate quotation ID
function generateQuotationId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `QUO-${timestamp}-${randomStr}`;
}

// Get complexity level
function getComplexityLevel(hours, teamSize) {
  if (hours <= 80) return "Simple";
  if (hours <= 200) return "Medium";
  if (hours <= 400) return "Complex";
  return "Enterprise";
}

// MAIN CALCULATION FUNCTION - PROFESSIONAL & REALISTIC
function calculateProfessionalQuotation(formData) {
  try {
    console.log('=== Professional Medium Company Quotation (2025) ===');
    console.log('Project Type:', formData.projectType);
    
    // Step 1: Calculate total project hours
    const totalHours = calculateProjectHours(formData);
    console.log('Total estimated hours:', totalHours);
    
    // Step 2: Calculate team composition and costs
    const team = calculateTeamComposition(formData, totalHours);
    console.log('Team composition:', team.totalMembers, 'members, Total cost:', team.totalCost);
    
    // Step 3: Calculate timeline
    const timeline = calculateTimeline(formData, totalHours, team.totalMembers);
    console.log('Timeline:', timeline.totalWeeks, 'weeks');
    
    // Step 4: Calculate additional costs
    const additionalCost = calculateAdditionalCosts(formData);
    
    // Step 5: Apply industry and timeline multipliers
    const industryMultiplier = INDUSTRY_MULTIPLIERS[formData.industry] || 1.0;
    const timelineMultiplier = timeline.timelineMultiplier;
    
    // Step 6: Calculate total cost
    const baseCost = team.totalCost + additionalCost;
    const adjustedCost = baseCost * industryMultiplier * timelineMultiplier;
    
    // Step 7: Add GST (18%)
    const taxAmount = adjustedCost * 0.18;
    const finalCost = adjustedCost + taxAmount;
    
    // Ensure realistic minimum cost for medium companies
    const minimumCost = Math.max(finalCost, 45000);
    
    console.log('Final cost breakdown:', {
      baseCost,
      industryMultiplier,
      timelineMultiplier,
      finalCost: minimumCost
    });
    
    // Generate other components
    const features = generateFeaturesList(formData);
    const pricingTiers = generatePricingTiers(minimumCost, timeline, formData);
    const phases = generateProjectPhases(timeline);
    
    // Calculate complexity score (realistic)
    const complexityScore = (totalHours / 100) + (team.totalMembers * 0.5);
    
    return {
      id: generateQuotationId(),
      
      // Core costs
      totalCost: Math.round(minimumCost),
      developmentCost: team.totalCost,
      designCost: team.composition.find(m => m.role.includes('Designer'))?.cost || 0,
      additionalCost,
      subtotal: Math.round(adjustedCost),
      taxAmount: Math.round(taxAmount),
      
      // Professional analysis
      analysis: {
        complexity: {
          overall: Math.round(complexityScore * 10) / 10,
          level: getComplexityLevel(totalHours, team.totalMembers),
          totalHours,
          averageHourlyRate: team.averageRate
        }
      },
      
      // Enhanced pricing structure
      pricing: {
        base: Math.round(baseCost),
        final: Math.round(minimumCost),
        breakdown: team.composition.map(member => ({
          role: `${member.level} ${member.role}`,
          hours: Math.round(member.hours),
          rate: member.rate,
          cost: member.cost,
          description: `${member.hours} hours @ ₹${member.rate}/hour`
        }))
      },
      
      // Team details
      team: {
        composition: team.composition.map(member => ({
          role: member.role,
          level: member.level,
          allocation: Math.round((member.hours / timeline.totalHours) * 100) / 100,
          cost: member.cost
        })),
        totalMembers: team.totalMembers,
        totalAllocation: Math.round((team.totalHours / (timeline.totalWeeks * 40)) * 10) / 10
      },
      
      // Timeline
      timeline,
      phases,
      
      // Features and pricing
      features,
      pricingTiers,
      
      // Enhanced summary
      summary: {
        confidence: Math.min(0.9, 0.7 + (complexityScore * 0.05)),
        projectCategory: getComplexityLevel(totalHours, team.totalMembers),
        recommendedTier: 'Professional',
        marketPosition: 'Medium Company Optimized'
      },
      
      // Market intelligence
      market: {
        lastUpdated: new Date().toISOString(),
        industryMultiplier,
        timelineMultiplier,
        marketSegment: 'Medium Company',
        competitiveRange: {
          min: Math.round(minimumCost * 0.8),
          max: Math.round(minimumCost * 1.3)
        }
      },
      
      // Risk assessment
      risk: {
        assessment: {
          riskScore: totalHours > 300 ? 'Medium' : totalHours > 150 ? 'Low' : 'Very Low',
          factors: [
            `${totalHours} total hours`,
            `${team.totalMembers} team members`,
            `${timeline.totalWeeks} week timeline`
          ]
        }
      },
      
      // Metadata
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      version: '2.0-MediumCompany'
    };
    
  } catch (error) {
    console.error('Error in professional quotation calculation:', error);
    
    // Realistic fallback for medium companies
    return {
      id: 'FALLBACK-' + Date.now(),
      totalCost: 125000,
      developmentCost: 100000,
      designCost: 20000,
      additionalCost: 5000,
      subtotal: 125000,
      taxAmount: 22500,
      analysis: { complexity: { overall: 2.0, level: 'Medium', totalHours: 80 } },
      pricing: { base: 125000, final: 147500, breakdown: [] },
      team: { composition: [], totalMembers: 2, totalAllocation: 1.5 },
      timeline: { totalWeeks: 8, totalHours: 80, startDate: new Date().toLocaleDateString(), endDate: new Date().toLocaleDateString() },
      phases: [],
      features: [{ name: 'Professional Website', hours: 80, cost: 125000, category: 'Complete' }],
      pricingTiers: [
        { name: 'Essential', price: 100000, timeline: 6, recommended: false },
        { name: 'Professional', price: 125000, timeline: 8, recommended: true },
        { name: 'Premium', price: 150000, timeline: 10, recommended: false }
      ],
      summary: { confidence: 0.8, projectCategory: 'Medium', recommendedTier: 'Professional' },
      market: { lastUpdated: new Date().toISOString(), marketSegment: 'Medium Company' },
      risk: { assessment: { riskScore: 'Low' } },
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      version: '2.0-MediumCompany'
    };
  }
}

// Export the main function
export default calculateProfessionalQuotation;

// Export helper functions
export {
  calculateProjectHours,
  calculateTeamComposition,
  calculateTimeline,
  calculateAdditionalCosts,
  generatePricingTiers,
  generateProjectPhases,
  generateFeaturesList,
  getFeatureName,
  generateQuotationId,
  getComplexityLevel
};
