// PdfGenerator.js - Professional Template System with Dynamic Content Display
import React, { useCallback, useState } from 'react';
import html2pdf from "html2pdf.js";
import usePdfDataExtractor from './pdfDataExtractor';

const PdfGenerator = ({ formData, quotation, currency }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);

  const { 
    extractedData, 
    isDataReady, 
    extractionError,
    getPdfData, 
    getDataSection,
    exportAsJson,
    validateRequiredFields,
    formCompletionPercentage,
    isFormComplete,
    hasQuotationData
  } = usePdfDataExtractor(formData, quotation, currency);

  // Helper function to safely get array data as string
  const getArrayAsString = (arr, fallback = 'Not specified') => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return fallback;
    return arr.join(', ');
  };

  // Helper function to format currency
  const formatCurrency = (amount, curr = "INR") => {
    if (!amount || isNaN(amount)) return curr === "USD" ? "$0" : curr === "EUR" ? "€0" : "₹0";
    const num = Math.abs(Number(amount));
    const formattedAmount = num.toLocaleString("en-IN");
    switch (curr) {
      case "USD": return `$${formattedAmount}`;
      case "EUR": return `€${formattedAmount}`;
      case "INR":
      default: return `₹${formattedAmount}`;
    }
  };

  // Professional Content Templates Based on Form Options
  const generateProfessionalContent = (pdfData) => {
    const projectType = pdfData.projectOverview?.projectType || 'website';
    const industry = pdfData.clientInfo?.industry || 'technology';
    const designType = pdfData.designRequirements?.designType || 'custom';
    const coreFeatures = pdfData.featuresAndFunctionality?.coreFeatures || [];
    const techStack = pdfData.technologyStack?.programmingLanguage || [];
    const numberOfPages = pdfData.technicalRequirements?.numberOfPages || '1-5';
    const timeline = pdfData.projectOverview?.timeline || '30-45';
    const expectedTraffic = pdfData.technicalRequirements?.expectedTraffic || 'medium';

    // Dynamic content sections based on selections
    let contentSections = [];

    // 1. Project Overview Section (Always included)
    contentSections.push({
      title: `${getProjectTypeDisplay(projectType)} PARTICULARS`,
      type: 'feature-list',
      content: generateProjectFeatures(pdfData, projectType, designType, numberOfPages)
    });

    // 2. Industry-Specific Requirements (if industry selected)
    if (industry && industry !== 'technology') {
      contentSections.push({
        title: `${getIndustryDisplay(industry)} SPECIFIC REQUIREMENTS`,
        type: 'grid-content',
        content: generateIndustryRequirements(industry, pdfData)
      });
    }

    // 3. Technical Architecture (if advanced tech stack selected)
    if (techStack.length > 1 || (techStack.length === 1 && techStack[0] !== 'javascript')) {
      contentSections.push({
        title: 'TECHNICAL ARCHITECTURE & INFRASTRUCTURE',
        type: 'technical-grid',
        content: generateTechnicalArchitecture(pdfData)
      });
    }

    // 4. Design & User Experience (if custom design or premium selected)
    if (designType === 'custom' || designType === 'premium') {
      contentSections.push({
        title: 'DESIGN & USER EXPERIENCE SPECIFICATIONS',
        type: 'design-showcase',
        content: generateDesignSpecs(pdfData)
      });
    }

    // 5. Advanced Features (if multiple core features or advanced features selected)
    if (coreFeatures.length > 3 || (pdfData.featuresAndFunctionality?.advancedFeatures?.length > 0)) {
      contentSections.push({
        title: 'ADVANCED FEATURES & FUNCTIONALITY',
        type: 'feature-categories',
        content: generateAdvancedFeatures(pdfData)
      });
    }

    // 6. Performance & Scalability (if high traffic or enterprise selected)
    if (expectedTraffic === 'high' || expectedTraffic === 'very_high' || expectedTraffic === 'enterprise') {
      contentSections.push({
        title: 'PERFORMANCE & SCALABILITY OPTIMIZATION',
        type: 'performance-metrics',
        content: generatePerformanceSpecs(pdfData)
      });
    }

    // 7. Security & Compliance (if security features or compliance requirements)
    if (pdfData.featuresAndFunctionality?.securityFeatures?.length > 0 || 
        pdfData.additionalRequirements?.complianceRequirements?.length > 0) {
      contentSections.push({
        title: 'SECURITY & COMPLIANCE FRAMEWORK',
        type: 'security-grid',
        content: generateSecuritySpecs(pdfData)
      });
    }

    // 8. Content Management & Support (if CMS or support selected)
    if (pdfData.contentAndSupport?.cmsType && pdfData.contentAndSupport.cmsType !== 'no_cms') {
      contentSections.push({
        title: 'CONTENT MANAGEMENT & SUPPORT SERVICES',
        type: 'support-grid',
        content: generateSupportSpecs(pdfData)
      });
    }

    return contentSections;
  };

  // Content Generation Functions
  const generateProjectFeatures = (pdfData, projectType, designType, numberOfPages) => {
    const baseFeatures = [
      `✓ ${getProjectTypeDisplay(projectType)} with ${numberOfPages} professional pages`,
      `✓ ${getDesignTypeDisplay(designType)} Website Design & UI/UX`,
      `✓ Frontend & Backend Development`,
      `✓ Mobile-responsive design across all devices`,
      `✓ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)`,
      `✓ Basic SEO & Performance Optimizations`,
      `✓ Comprehensive Testing & Quality Assurance`
    ];

    // Add features based on core features selected
    const coreFeatures = pdfData.featuresAndFunctionality?.coreFeatures || [];
    coreFeatures.forEach(feature => {
      baseFeatures.push(`✓ ${getFeatureDisplay(feature)}`);
    });

    // Add device support features
    const deviceSupport = pdfData.technicalRequirements?.deviceSupport || [];
    if (deviceSupport.length > 2) {
      baseFeatures.push(`✓ Multi-device optimization (${deviceSupport.join(', ')})`);
    }

    // Add performance features
    const performanceReq = pdfData.technicalRequirements?.performanceRequirements;
    if (performanceReq && performanceReq !== 'basic') {
      baseFeatures.push(`✓ ${getPerformanceDisplay(performanceReq)} Performance Optimization`);
    }

    return baseFeatures;
  };

  const generateIndustryRequirements = (industry, pdfData) => {
    const requirements = {
      healthcare: [
        { label: 'HIPAA Compliance', value: 'Healthcare data protection standards' },
        { label: 'Patient Portal', value: 'Secure patient information access' },
        { label: 'Appointment System', value: 'Online booking and scheduling' },
        { label: 'Telemedicine Ready', value: 'Video consultation integration' }
      ],
      finance: [
        { label: 'Security Standards', value: 'Bank-level encryption and security' },
        { label: 'PCI DSS Compliance', value: 'Payment card industry standards' },
        { label: 'Financial Reporting', value: 'Advanced analytics and reporting' },
        { label: 'Multi-factor Auth', value: 'Enhanced security protocols' }
      ],
      ecommerce: [
        { label: 'Payment Gateway', value: 'Multiple payment options integration' },
        { label: 'Inventory Management', value: 'Real-time stock tracking' },
        { label: 'Order Processing', value: 'Automated order fulfillment' },
        { label: 'Customer Analytics', value: 'Behavior tracking and insights' }
      ],
      education: [
        { label: 'Learning Management', value: 'Course creation and management' },
        { label: 'Student Portal', value: 'Grade tracking and submissions' },
        { label: 'Virtual Classroom', value: 'Online learning capabilities' },
        { label: 'Progress Tracking', value: 'Performance analytics' }
      ],
      realestate: [
        { label: 'Property Listings', value: 'Advanced search and filtering' },
        { label: 'Virtual Tours', value: '360° property visualization' },
        { label: 'Lead Management', value: 'Customer relationship tracking' },
        { label: 'Market Analytics', value: 'Property value insights' }
      ]
    };

    return requirements[industry] || [
      { label: 'Industry Standards', value: 'Compliance with sector requirements' },
      { label: 'Custom Features', value: 'Tailored to business needs' },
      { label: 'Integration Ready', value: 'Third-party system compatibility' },
      { label: 'Scalable Architecture', value: 'Growth-ready infrastructure' }
    ];
  };

  const generateTechnicalArchitecture = (pdfData) => {
    const techStack = {
      frontend: pdfData.technologyStack?.frontendFramework || ['React'],
      backend: pdfData.technologyStack?.backendFramework || ['Node.js'],
      database: pdfData.technologyStack?.databaseType || ['MySQL'],
      languages: pdfData.technologyStack?.programmingLanguage || ['JavaScript']
    };

    return [
      { 
        category: 'Frontend Technologies',
        items: techStack.frontend.map(tech => getFrameworkDisplay(tech, 'frontend'))
      },
      { 
        category: 'Backend Infrastructure',
        items: techStack.backend.map(tech => getFrameworkDisplay(tech, 'backend'))
      },
      { 
        category: 'Database Systems',
        items: techStack.database.map(tech => getFrameworkDisplay(tech, 'database'))
      },
      { 
        category: 'Development Languages',
        items: techStack.languages.map(tech => getFrameworkDisplay(tech, 'language'))
      }
    ];
  };

  const generateDesignSpecs = (pdfData) => {
    const designReqs = pdfData.designRequirements || {};
    return {
      designApproach: designReqs.designPreference || 'modern',
      colorScheme: designReqs.colorScheme || 'professional',
      typography: designReqs.typographyPreference || 'clean',
      accessibility: designReqs.accessibilityRequirements || 'wcag_aa',
      mockups: designReqs.mockupRequirements || 'high_fidelity',
      revisions: designReqs.designRevisions || '3 rounds'
    };
  };

  const generateAdvancedFeatures = (pdfData) => {
    const features = pdfData.featuresAndFunctionality || {};
    return {
      core: features.coreFeatures || [],
      advanced: features.advancedFeatures || [],
      ecommerce: features.ecommerceFeatures || [],
      analytics: features.analyticsFeatures || [],
      mobile: features.mobileFeatures || [],
      security: features.securityFeatures || []
    };
  };

  const generatePerformanceSpecs = (pdfData) => {
    return [
      { metric: 'Page Load Speed', target: '< 3 seconds', description: 'Optimized for fast loading' },
      { metric: 'Uptime Guarantee', target: '99.9%', description: 'Reliable hosting infrastructure' },
      { metric: 'Concurrent Users', target: '10,000+', description: 'High traffic handling capacity' },
      { metric: 'CDN Integration', target: 'Global', description: 'Worldwide content delivery' },
      { metric: 'Caching Strategy', target: 'Multi-level', description: 'Advanced performance optimization' },
      { metric: 'Mobile Performance', target: 'Optimized', description: 'Mobile-first approach' }
    ];
  };

  const generateSecuritySpecs = (pdfData) => {
    const securityFeatures = pdfData.featuresAndFunctionality?.securityFeatures || [];
    const complianceReqs = pdfData.additionalRequirements?.complianceRequirements || [];
    
    return {
      security: securityFeatures,
      compliance: complianceReqs,
      standards: ['SSL Certificate', 'Data Encryption', 'Regular Backups', 'Security Monitoring']
    };
  };

  const generateSupportSpecs = (pdfData) => {
    const support = pdfData.contentAndSupport || {};
    return [
      { service: 'Content Management', level: support.cmsType || 'Standard CMS' },
      { service: 'Maintenance Support', level: support.maintenanceLevel || 'Basic' },
      { service: 'Technical Support', level: support.supportLevel || 'Standard' },
      { service: 'Training Provided', level: support.trainingRequired || 'Basic' },
      { service: 'Documentation', level: support.documentationLevel || 'Standard' }
    ];
  };

  // Display Helper Functions
  const getProjectTypeDisplay = (type) => {
    const displays = {
      website: 'BUSINESS WEBSITE',
      ecommerce: 'E-COMMERCE PLATFORM',
      webapp: 'WEB APPLICATION',
      mobileapp: 'MOBILE APPLICATION',
      customsoftware: 'CUSTOM SOFTWARE SOLUTION',
      cms: 'CONTENT MANAGEMENT SYSTEM',
      erp: 'ERP SYSTEM',
      crm: 'CRM PLATFORM',
      api: 'API DEVELOPMENT',
      saas: 'SAAS PLATFORM',
      portfolio: 'PORTFOLIO WEBSITE',
      blog: 'BLOG PLATFORM',
      forum: 'COMMUNITY FORUM',
      booking: 'BOOKING SYSTEM',
      learning: 'LEARNING MANAGEMENT SYSTEM',
      inventory: 'INVENTORY MANAGEMENT',
      pos: 'POINT OF SALE SYSTEM',
      marketplace: 'ONLINE MARKETPLACE'
    };
    return displays[type] || 'WEBSITE DEVELOPMENT';
  };

  const getIndustryDisplay = (industry) => {
    const displays = {
      healthcare: 'HEALTHCARE & MEDICAL',
      finance: 'BANKING & FINANCE',
      ecommerce: 'E-COMMERCE & RETAIL',
      education: 'EDUCATION & LEARNING',
      realestate: 'REAL ESTATE & PROPERTY',
      manufacturing: 'MANUFACTURING & INDUSTRIAL',
      hospitality: 'HOSPITALITY & TOURISM',
      technology: 'TECHNOLOGY & SOFTWARE'
    };
    return displays[industry] || 'BUSINESS';
  };

  const getDesignTypeDisplay = (type) => {
    const displays = {
      template: 'Template-based',
      custom: 'Custom',
      premium: 'Premium Custom',
      redesign: 'Redesign'
    };
    return displays[type] || 'Custom';
  };

  const getFeatureDisplay = (feature) => {
    const displays = {
      responsive: 'Responsive Design',
      seo: 'SEO Optimization',
      cms: 'Content Management System',
      blog: 'Blog Integration',
      contact: 'Contact Forms',
      gallery: 'Image Gallery',
      testimonials: 'Customer Testimonials',
      newsletter: 'Newsletter Signup',
      social: 'Social Media Integration',
      maps: 'Google Maps Integration',
      analytics: 'Analytics Integration',
      search: 'Advanced Search Functionality',
      multilingual: 'Multi-language Support',
      chat: 'Live Chat Integration',
      calendar: 'Event Calendar',
      booking: 'Online Booking System',
      payment: 'Payment Gateway Integration',
      reviews: 'Reviews & Ratings System',
      notifications: 'Push Notifications',
      membership: 'User Membership System'
    };
    return displays[feature] || feature;
  };

  const getPerformanceDisplay = (level) => {
    const displays = {
      basic: 'Standard',
      optimized: 'Enhanced',
      high_performance: 'High-Performance',
      enterprise: 'Enterprise-Grade'
    };
    return displays[level] || 'Standard';
  };

  const getFrameworkDisplay = (tech, category) => {
    const displays = {
      frontend: {
        react: '⚛️ React.js - Modern component-based architecture',
        vue: '💚 Vue.js - Progressive framework',
        angular: '🅰️ Angular - Full-featured framework',
        nextjs: '⚫ Next.js - Full-stack React framework',
        nuxtjs: '💚 Nuxt.js - Vue.js framework'
      },
      backend: {
        nodejs: '💚 Node.js - JavaScript runtime',
        express: '🚀 Express.js - Web application framework',
        laravel: '🔴 Laravel - PHP framework',
        django: '💚 Django - Python framework',
        flask: '🔵 Flask - Lightweight Python framework'
      },
      database: {
        mysql: '🐬 MySQL - Relational database',
        postgresql: '🐘 PostgreSQL - Advanced SQL database',
        mongodb: '🍃 MongoDB - NoSQL document database',
        redis: '🔴 Redis - In-memory data store'
      },
      language: {
        javascript: '🟨 JavaScript - Modern web development',
        python: '🐍 Python - Versatile programming language',
        php: '🐘 PHP - Server-side scripting',
        typescript: '🔷 TypeScript - Type-safe JavaScript'
      }
    };
    return displays[category]?.[tech] || tech;
  };

  

  // Complete HTML template with professional dynamic content
  const generatePDFHTML = (pdfData) => {
    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
    const validDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });

    // Calculate costs
    const basePrice = pdfData.quotationResults?.basePrice || 100000;
    const totalCost = pdfData.quotationResults?.totalCost || 295000;
    const gstAmount = Math.round(totalCost * 0.18);
    const finalAmount = totalCost + gstAmount;

    // Generate professional content sections
    const contentSections = generateProfessionalContent(pdfData);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Professional Quotation</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 10px; 
            line-height: 1.4; 
            color: #2d3748; 
            background: white; 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .quotation-container { 
            width: 100%; 
            max-width: 210mm; 
            margin: 0 auto; 
            padding: 8mm; 
            background: white;
          }
          
          /* Header Styles */
          .header { 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 12px; 
            margin-bottom: 16px; 
          }
          .quotation-title { 
            text-align: center; 
            font-size: 20px; 
            font-weight: bold; 
            color: #2563eb; 
            text-transform: uppercase; 
            margin-bottom: 6px; 
            letter-spacing: 2px;
          }
          .quotation-ref { 
            text-align: center; 
            font-size: 11px; 
            color: #64748b; 
            margin-bottom: 14px; 
          }
          .header-info { 
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
          }
          .info-section { }
          .info-label { 
            font-weight: bold; 
            font-size: 10px; 
            margin-bottom: 4px; 
            color: #2563eb; 
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
          }
          .info-content { 
            font-size: 9px; 
            line-height: 1.4; 
            color: #374151; 
          }
          
          /* Subject Styles */
          .subject { 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 12px; 
            margin-bottom: 16px; 
            border-left: 4px solid #2563eb; 
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .subject-title { 
            font-size: 11px; 
            font-weight: bold; 
            margin-bottom: 6px; 
            color: #2563eb; 
          }
          .subject-text { 
            font-size: 9px; 
            line-height: 1.4; 
            color: #475569; 
          }
          
          /* Content Section Styles */
          .content-section { 
            margin-bottom: 18px;
            page-break-inside: avoid;
          }
          .section-title { 
            font-size: 12px; 
            font-weight: bold; 
            color: #1e293b; 
            background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
            color: white;
            padding: 8px 12px;
            margin-bottom: 10px; 
            text-transform: uppercase;
            letter-spacing: 1px;
            border-radius: 4px;
          }
          
          /* Feature List Styles */
          .feature-list { 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            font-size: 8px; 
            line-height: 1.5; 
          }
          .feature-item { 
            padding: 4px 8px;
            background: #f8fafc;
            border-left: 3px solid #10b981;
            margin-bottom: 3px;
            border-radius: 3px;
          }
          
          /* Grid Content Styles */
          .grid-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .grid-item {
            padding: 8px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          .grid-item-label {
            font-weight: bold;
            font-size: 8px;
            color: #2563eb;
            margin-bottom: 3px;
          }
          .grid-item-value {
            font-size: 7px;
            color: #64748b;
            line-height: 1.3;
          }
          
          /* Technical Grid Styles */
          .technical-category {
            margin-bottom: 12px;
          }
          .category-title {
            font-weight: bold;
            font-size: 9px;
            color: #2563eb;
            margin-bottom: 6px;
            padding: 4px 8px;
            background: #eff6ff;
            border-radius: 4px;
          }
          .tech-items {
            display: grid;
            grid-template-columns: 1fr;
            gap: 3px;
            padding-left: 12px;
          }
          .tech-item {
            font-size: 7px;
            color: #475569;
            padding: 2px 0;
          }
          
          /* Design Showcase Styles */
          .design-showcase {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
          }
          .design-aspect {
            text-align: center;
            padding: 10px;
            background: #fefefe;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
          }
          .design-aspect-title {
            font-weight: bold;
            font-size: 8px;
            color: #2563eb;
            margin-bottom: 4px;
          }
          .design-aspect-value {
            font-size: 7px;
            color: #64748b;
          }
          
          /* Feature Categories Styles */
          .feature-categories {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .feature-category {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
          }
          .feature-category-header {
            background: #2563eb;
            color: white;
            padding: 6px 10px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .feature-category-content {
            padding: 8px;
          }
          .feature-category-item {
            font-size: 7px;
            color: #475569;
            margin-bottom: 3px;
            padding: 2px 0;
            border-bottom: 1px dotted #e2e8f0;
          }
          
          /* Performance Metrics Styles */
          .performance-metrics {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
          }
          .metric-card {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 8px;
            text-align: center;
          }
          .metric-title {
            font-size: 7px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 3px;
          }
          .metric-value {
            font-size: 9px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 2px;
          }
          .metric-description {
            font-size: 6px;
            color: #64748b;
          }
          
          /* Security Grid Styles */
          .security-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .security-category {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 10px;
          }
          .security-category-title {
            font-size: 8px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 6px;
          }
          
          /* Support Grid Styles */
          .support-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .support-item {
            display: flex;
            justify-content: space-between;
            padding: 6px 10px;
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 4px;
            font-size: 8px;
          }
          .support-service {
            font-weight: bold;
            color: #2563eb;
          }
          .support-level {
            color: #64748b;
          }
          
          /* Table Styles */
          .data-table {
            width: 100%; 
            border-collapse: collapse; 
            margin: 12px 0; 
            font-size: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .data-table th { 
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: white; 
            padding: 8px 6px; 
            text-align: left; 
            font-weight: bold; 
            border: 1px solid #2563eb; 
            font-size: 8px;
            text-transform: uppercase;
          }
          .data-table td { 
            padding: 8px 6px; 
            border: 1px solid #e2e8f0; 
            vertical-align: top; 
            font-size: 8px;
            background: #fafafa;
          }
          .data-table tbody tr:nth-child(even) td {
            background: #f8fafc;
          }
          .amount { 
            text-align: right; 
            font-weight: bold; 
            font-family: 'Courier New', monospace;
            color: #059669;
          }
          .total-row { 
            background: #eff6ff !important; 
            font-weight: bold; 
          }
          .grand-total { 
            background: #dbeafe !important; 
            font-weight: bold; 
            font-size: 9px;
          }
          
          /* Terms Styles */
          .terms-section { 
            background: #fef7ed; 
            padding: 12px; 
            margin-top: 16px; 
            border: 2px solid #fed7aa; 
            border-radius: 8px; 
          }
          .terms-title { 
            font-size: 11px; 
            font-weight: bold; 
            color: #c2410c; 
            margin-bottom: 10px; 
            text-transform: uppercase;
            text-align: center;
          }
          .terms-list { 
            font-size: 8px; 
            line-height: 1.5; 
          }
          .term-item { 
            margin-bottom: 6px;
            padding: 4px 0;
            border-bottom: 1px dotted #fed7aa;
          }
          .term-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 2px;
          }
          .term-details {
            margin-left: 12px;
            color: #78350f;
          }
          
          /* Signature Styles */
          .signature { 
            margin-top: 20px; 
            text-align: right;
            border-top: 2px solid #e2e8f0;
            padding-top: 16px;
          }
          .signature-text { 
            font-size: 9px; 
            margin-bottom: 20px; 
            font-weight: bold; 
            color: #2563eb;
          }
          .signature-line { 
            border-bottom: 2px solid #2563eb; 
            width: 100px; 
            margin-left: auto; 
            margin-bottom: 8px; 
          }
          .signature-name { 
            font-size: 8px; 
            line-height: 1.4; 
            color: #64748b;
          }
          
          /* Utility Classes */
          .dynamic-field {
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: bold;
          }
          
          .page-break { page-break-before: always; }
          
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .quotation-container { margin: 0; padding: 5mm; }
          }
        </style>
      </head>
      <body>
        <div class="quotation-container">
          <!-- Header -->
          <div class="header">
            <div class="quotation-title">PROFESSIONAL QUOTATION</div>
            <div class="quotation-ref">Reference: ${pdfData.metadata?.quotationId || `QUO-${Date.now()}`}</div>
            
            <div class="header-info">
              <div class="info-section">
                <div class="info-label">From</div>
                <div class="info-content">
                  <strong>IRA Media Concepts</strong><br/>
                  Hyderabad, India<br/>
                  Contact: Prashanth Nampelli<br/>
                  Phone: 9966774248<br/>
                  Email: info@iramedia.com
                </div>
              </div>
              
              <div class="info-section">
                <div class="info-label">To</div>
                <div class="info-content">
                  Name: <strong class="dynamic-field">${pdfData.clientInfo?.clientName || 'Valued Client'}</strong><br/>
                  Company Name: <span class="dynamic-field">${pdfData.clientInfo?.companyName || 'Your Company'}</span><br/>
                  Industry: <span class="dynamic-field">${getIndustryDisplay(pdfData.clientInfo?.industry) || 'Industry'}</span><br/>
                  Phone: <span class="dynamic-field">${pdfData.clientInfo?.phone || 'Phone Number'}</span><br/>
                  Email: <span class="dynamic-field">${pdfData.clientInfo?.email || 'client@email.com'}</span><br/>
                  ${pdfData.clientInfo?.website ? `Website: <span class="dynamic-field">${pdfData.clientInfo.website}</span><br/>` : ''}
                </div>
              </div>
              
              <div class="info-section">
                <div class="info-label">Date</div>
                <div class="info-content">${currentDate}</div>
                <br/>
                <div class="info-label">Valid Until</div>
                <div class="info-content">${validDate}</div>
                <br/>
                <div class="info-label">Project</div>
                <div class="info-content"><span class="dynamic-field">${getProjectTypeDisplay(pdfData.projectOverview?.projectType)}</span></div>
              </div>
            </div>
          </div>

          <!-- Subject -->
          <div class="subject">
            <div class="subject-title">
              Subject: <span class="dynamic-field">${pdfData.projectOverview?.projectTitle || 'Project Development'}</span> - Development Services
            </div>
            <div class="subject-text">
              We are pleased to submit our comprehensive quotation for <span class="dynamic-field">${getProjectTypeDisplay(pdfData.projectOverview?.projectType)}</span> services for <span class="dynamic-field">${pdfData.clientInfo?.companyName || 'your organization'}</span>. 
              ${pdfData.projectOverview?.projectGoal ? `<br/>Project Goal: <span class="dynamic-field">${pdfData.projectOverview.projectGoal}</span>` : ''}
              ${pdfData.projectOverview?.targetAudience ? `<br/>Target Audience: <span class="dynamic-field">${pdfData.projectOverview.targetAudience}</span>` : ''}
            </div>
          </div>

          <!-- Dynamic Content Sections -->
          ${contentSections.map(section => {
            switch(section.type) {
              case 'feature-list':
                return `
                  <div class="content-section">
                    <div class="section-title">${section.title}</div>
                    <div class="feature-list">
                      ${section.content.map(feature => `<div class="feature-item">${feature}</div>`).join('')}
                    </div>
                  </div>
                `;
              
              case 'grid-content':
                return `
                  <div class="content-section">
                    <div class="section-title">${section.title}</div>
                    <div class="grid-content">
                      ${section.content.map(item => `
                        <div class="grid-item">
                          <div class="grid-item-label">${item.label}</div>
                          <div class="grid-item-value">${item.value}</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              
              case 'technical-grid':
                return `
                  <div class="content-section">
                    <div class="section-title">${section.title}</div>
                    ${section.content.map(category => `
                      <div class="technical-category">
                        <div class="category-title">${category.category}</div>
                        <div class="tech-items">
                          ${category.items.map(item => `<div class="tech-item">${item}</div>`).join('')}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                `;
              
              case 'design-showcase':
                return `
                  <div class="content-section">
                    <div class="section-title">${section.title}</div>
                    <div class="design-showcase">
                      <div class="design-aspect">
                        <div class="design-aspect-title">Design Approach</div>
                        <div class="design-aspect-value">${section.content.designApproach}</div>
                      </div>
                      <div class="design-aspect">
                        <div class="design-aspect-title">Color Scheme</div>
                        <div class="design-aspect-value">${section.content.colorScheme}</div>
                      </div>
                      <div class="design-aspect">
                        <div class="design-aspect-title">Typography</div>
                        <div class="design-aspect-value">${section.content.typography}</div>
                      </div>
                      <div class="design-aspect">
                        <div class="design-aspect-title">Accessibility</div>
                        <div class="design-aspect-value">${section.content.accessibility}</div>
                      </div>
                      <div class="design-aspect">
                        <div class="design-aspect-title">Mockup Quality</div>
                        <div class="design-aspect-value">${section.content.mockups}</div>
                      </div>
                      <div class="design-aspect">
                        <div class="design-aspect-title">Design Revisions</div>
                        <div class="design-aspect-value">${section.content.revisions}</div>
                      </div>
                    </div>
                  </div>
                `;
              
              case 'feature-categories':
                return `
                  <div class="content-section">
                    <div class="section-title">${section.title}</div>
                    <div class="feature-categories">
                      ${Object.keys(section.content).filter(key => section.content[key].length > 0).map(key => `
                        <div class="feature-category">
                          <div class="feature-category-header">${key.charAt(0).toUpperCase() + key.slice(1)} Features</div>
                          <div class="feature-category-content">
                            ${section.content[key].map(feature => `
                              <div class="feature-category-item">✓ ${getFeatureDisplay(feature)}</div>
                            `).join('')}
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              
              case 'performance-metrics':
                return `
                  <div class="content-section">
                    <div class="section-title">${section.title}</div>
                    <div class="performance-metrics">
                      ${section.content.map(metric => `
                        <div class="metric-card">
                          <div class="metric-title">${metric.metric}</div>
                          <div class="metric-value">${metric.target}</div>
                          <div class="metric-description">${metric.description}</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              
              case 'security-grid':
                return `
                  <div class="content-section">
                    <div class="section-title">${section.title}</div>
                    <div class="security-grid">
                      ${section.content.security.length > 0 ? `
                        <div class="security-category">
                          <div class="security-category-title">Security Features</div>
                          ${section.content.security.map(feature => `<div class="feature-category-item">🔒 ${getFeatureDisplay(feature)}</div>`).join('')}
                        </div>
                      ` : ''}
                      ${section.content.standards.length > 0 ? `
                        <div class="security-category">
                          <div class="security-category-title">Security Standards</div>
                          ${section.content.standards.map(standard => `<div class="feature-category-item">✅ ${standard}</div>`).join('')}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `;
              
              case 'support-grid':
                return `
                  <div class="content-section">
                    <div class="section-title">${section.title}</div>
                    <div class="support-grid">
                      ${section.content.map(item => `
                        <div class="support-item">
                          <span class="support-service">${item.service}</span>
                          <span class="support-level">${item.level}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              
              default:
                return '';
            }
          }).join('')}

          <!-- Investment Breakdown -->
          <div class="content-section">
            <div class="section-title">Investment Breakdown</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 8%;">S.No.</th>
                  <th style="width: 60%;">Description</th>
                  <th style="width: 12%;">Type</th>
                  <th style="width: 20%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td><strong>Development Cost</strong><br/>Complete ${getProjectTypeDisplay(pdfData.projectOverview?.projectType)} package as specified</td>
                  <td>One-time</td>
                  <td class="amount">${formatCurrency(pdfData.quotationResults?.breakdown?.developmentCost || basePrice, currency)}</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td><strong>Design Cost</strong><br/>${getDesignTypeDisplay(pdfData.designRequirements?.designType)} design implementation</td>
                  <td>One-time</td>
                  <td class="amount">${formatCurrency(pdfData.quotationResults?.breakdown?.designCost || 50000, currency)}</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td><strong>Testing & QA</strong><br/>Comprehensive testing and quality assurance</td>
                  <td>One-time</td>
                  <td class="amount">${formatCurrency(pdfData.quotationResults?.breakdown?.testingCost || 25000, currency)}</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td><strong>Deployment</strong><br/>Production deployment and setup</td>
                  <td>One-time</td>
                  <td class="amount">${formatCurrency(pdfData.quotationResults?.breakdown?.deploymentCost || 15000, currency)}</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td><strong>Project Management</strong><br/>Project coordination and management</td>
                  <td>One-time</td>
                  <td class="amount">${formatCurrency(pdfData.quotationResults?.breakdown?.projectManagementCost || 25000, currency)}</td>
                </tr>
                ${pdfData.quotationResults?.breakdown?.maintenanceCost && pdfData.quotationResults.breakdown.maintenanceCost > 0 ? `
                  <tr>
                    <td>6</td>
                    <td><strong>Maintenance</strong><br/>${pdfData.contentAndSupport?.maintenanceLevel || 'Standard'} maintenance and updates</td>
                    <td>Annual</td>
                    <td class="amount">${formatCurrency(pdfData.quotationResults.breakdown.maintenanceCost, currency)}</td>
                  </tr>
                ` : ''}
                <tr class="total-row">
                  <td colspan="3"><strong>Sub Total</strong></td>
                  <td class="amount">${formatCurrency(totalCost, currency)}</td>
                </tr>
                <tr>
                  <td colspan="3"><strong>GST @ 18%</strong></td>
                  <td class="amount">${formatCurrency(gstAmount, currency)}</td>
                </tr>
                <tr class="grand-total">
                  <td colspan="3"><strong>Final Amount</strong></td>
                  <td class="amount">${formatCurrency(finalAmount, currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Project Timeline -->
          <div class="content-section">
            <div class="section-title">Project Timeline (${pdfData.quotationResults?.timeline?.totalDuration || pdfData.projectOverview?.timeline || '60 days'})</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Phase</th>
                  <th>Deliverable</th>
                  <th>Duration</th>
                  <th>Timeline</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Phase I</strong></td>
                  <td>Project Setup & Analysis</td>
                  <td>7 Days</td>
                  <td>From project start</td>
                </tr>
                <tr>
                  <td><strong>Phase II</strong></td>
                  <td>Design & Development</td>
                  <td>30 Days</td>
                  <td>From Phase I completion</td>
                </tr>
                <tr>
                  <td><strong>Phase III</strong></td>
                  <td>Testing & Integration</td>
                  <td>15 Days</td>
                  <td>From Phase II completion</td>
                </tr>
                <tr>
                  <td><strong>Phase IV</strong></td>
                  <td>Deployment & Launch</td>
                  <td>8 Days</td>
                  <td>From Phase III completion</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Terms & Conditions -->
          <div class="terms-section">
            <div class="terms-title">Commercial Terms & Conditions</div>
            <div class="terms-list">
              <div class="term-item">
                <div class="term-title">1. Payment Schedule:</div>
                <div class="term-details">• 50% advance payment to start the project</div>
                <div class="term-details">• 30% after design approval</div>
                <div class="term-details">• 20% on final delivery</div>
              </div>
              
              <div class="term-item">
                <div class="term-title">2. GST:</div>
                <div class="term-details">18% extra as applicable</div>
              </div>
              
              <div class="term-item">
                <div class="term-title">3. Maintenance:</div>
                <div class="term-details">${pdfData.contentAndSupport?.maintenanceLevel !== 'no_maintenance' ? `${pdfData.contentAndSupport?.maintenanceLevel || 'Basic'} maintenance included` : 'Post-launch maintenance will be charged separately'}</div>
              </div>
              
              <div class="term-item">
                <div class="term-title">4. Support:</div>
                <div class="term-details">${pdfData.contentAndSupport?.supportLevel !== 'no_support' ? `${pdfData.contentAndSupport?.supportLevel || 'Standard'} support included` : 'Technical support available on request'}</div>
              </div>
              
              <div class="term-item">
                <div class="term-title">5. Revisions:</div>
                <div class="term-details">${pdfData.designRequirements?.designRevisions ? `Up to ${pdfData.designRequirements.designRevisions} rounds of revisions included` : 'Standard revision rounds included'}</div>
              </div>
              
              <div class="term-item">
                <div class="term-title">6. Content:</div>
                <div class="term-details">${pdfData.contentAndSupport?.contentProvided === 'client_provides' ? 'Client to provide all content and materials' : 'Content creation as specified in requirements'}</div>
              </div>
              
              <div class="term-item">
                <div class="term-title">7. Validity:</div>
                <div class="term-details">This quotation is valid for 30 days from the date mentioned</div>
              </div>
            </div>
          </div>

          <!-- Signature -->
          <div class="signature">
            <div class="signature-text"><strong>For IRA Media Concepts</strong></div>
            <div class="signature-line"></div>
            <div class="signature-name">Prashanth Nampelli<br/>Contact: 9966774248<br/>Generated on: ${new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Generate PDF function (keeping the existing implementation)
  const generatePDF = useCallback(async () => {
    if (!isDataReady) {
      setGenerationError('Data not ready for PDF generation');
      return;
    }

    const validation = validateRequiredFields();
    if (!validation.isValid) {
      setGenerationError(`Missing required fields: ${validation.missingFields.join(', ')}`);
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const pdfData = getPdfData();
      
      console.log('=== PROFESSIONAL PDF GENERATION ===');
      console.log('Generated Content Sections:', generateProfessionalContent(pdfData));
      
      const htmlTemplate = generatePDFHTML(pdfData);
      
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 210mm;
        background: white;
        font-family: 'Segoe UI', Arial, sans-serif;
      `;
      
      tempContainer.innerHTML = htmlTemplate;
      document.body.appendChild(tempContainer);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const options = {
        margin: [5, 5, 5, 5],
        filename: `Professional_Quotation_${(pdfData.clientInfo?.companyName || "Client").replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: {
          scale: 4,
          dpi: 300,
          letterRendering: true,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#FFFFFF",
          logging: false,
          removeContainer: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: true,
          precision: 16
        }
      };

      const element = tempContainer.querySelector('.quotation-container') || tempContainer;
      
      await html2pdf()
        .from(element)
        .set(options)
        .save();

      document.body.removeChild(tempContainer);
      
      setGeneratedPdfUrl(`/generated-pdf-${Date.now()}.pdf`);
      console.log('✅ Professional PDF Generated Successfully');
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
      setGenerationError(error.message);
    } finally {
      setIsGenerating(false);
    }
  }, [isDataReady, getPdfData, validateRequiredFields, currency]);

  // Rest of the component remains the same...
  const downloadDataAsJson = useCallback(() => {
    if (!isDataReady) return;
    
    const jsonData = exportAsJson();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotation-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [isDataReady, exportAsJson]);

  if (extractionError) {
    return (
      <div className="pdf-generator-error">
        <h3>Data Extraction Error</h3>
        <p>{extractionError}</p>
      </div>
    );
  }

  return (
    <div className="pdf-generator" style={{ display: 'inline-flex', gap: '10px', alignItems: 'center' }}>
      <button 
        onClick={generatePDF}
        disabled={!isDataReady || isGenerating}
        className="btn btn-primary pdf-download-btn"
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          cursor: isDataReady && !isGenerating ? 'pointer' : 'not-allowed',
          opacity: isDataReady && !isGenerating ? 1 : 0.6,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 'bold',
          fontSize: '14px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
        }}
      >
        {isGenerating ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            Generating Professional PDF...
          </>
        ) : (
          <>
            <i className="fas fa-file-pdf"></i>
            Download Professional PDF
          </>
        )}
      </button>

      {extractedData && (
        <div className="data-preview" style={{ 
          fontSize: '12px', 
          color: '#64748b',
          background: '#f8fafc',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          <i className="fas fa-chart-pie" style={{ marginRight: '6px', color: '#2563eb' }}></i>
          Form: {formCompletionPercentage}% | Status: {isFormComplete ? '✅ Ready' : '⏳ In Progress'}
        </div>
      )}

      {generationError && (
        <div className="error-message" style={{ 
          color: '#dc2626', 
          fontSize: '12px',
          background: '#fef2f2',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid #fecaca'
        }}>
          <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }}></i>
          Error: {generationError}
        </div>
      )}
    </div>
  );
};

export default PdfGenerator;
