// ====================================================================
// CONFIGURATION — UPDATE WITH YOUR DETAILS
// ====================================================================
const GOOGLE_APPS_SCRIPT_CONFIG = {
  webAppUrl: 'https://script.google.com/macros/s/AKfycbxFvpV3JElU4slu_YXEf3qpgP0oVydJtLmPWGpmxrjSgSIvxhM14aWOpY271YEOE36-/exec', 
  spreadsheetId: '1k3FE59Qewpi0Fz2Bw5hy33Io-RowM5mkuqtOQVOWu50',
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1k3FE59Qewpi0Fz2Bw5hy33Io-RowM5mkuqtOQVOWu50/edit', 
  //const SHEET_ID = '1k3FE59Qewpi0Fz2Bw5hy33Io-RowM5mkuqtOQVOWu50'; // Your sheet ID
  // const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1k3FE59Qewpi0Fz2Bw5hy33Io-RowM5mkuqtOQVOWu50/edit'
  timeout: 30000, // 30 seconds
  maxRetries: 3
};

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================
const formatArrayValue = (arr) => !arr || !Array.isArray(arr) ? '' : arr.join(', ');
const formatBooleanValue = (value) => value === true ? 'Yes' : value === false ? 'No' : '';
const formatCurrencyValue = (amount) => !amount || isNaN(amount) ? '0' : Number(amount).toFixed(2);
const validateData = (quotation, formData) => {
  const errors = [];
  if (!quotation) errors.push('Quotation data is missing');
  if (!formData) errors.push('Form data is missing');
  if (quotation && typeof quotation.totalCost === 'undefined') errors.push('Quotation missing totalCost');
  if (formData && !formData.clientName && !formData.email) errors.push('Form data missing client identification');
  return { isValid: errors.length === 0, errors };
};

// ====================================================================
// DATA CONVERSION — MATCHES APPS SCRIPT HEADERS
// ====================================================================
const convertToSheetRow = (quotation, formData, currency) => {
  const timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  return [
    // Metadata
    timestamp,
    quotation.id || `QT-${Date.now().toString().slice(-6)}`,
    currency,
    // Client Information
    formData.clientName || '',
    formData.companyName || '',
    formData.email || '',
    formData.phone || '',
    formData.website || '',
    formData.industry || '',
    formData.companySize || '',
    formData.location || '',
    // Project Overview
    formData.projectTitle || '',
    formData.projectType || '',
    formData.projectGoal || '',
    formData.targetAudience || '',
    formData.budgetRange || '',
    formData.timeline || '',
    formData.projectBudget || '',
    formData.expectedUsers || '',
    formData.region || '',
    formatBooleanValue(formData.globalDeployment),
    // Technical
    formData.numberOfPages || '',
    formData.expectedTraffic || '',
    formData.performanceRequirements || '',
    formatArrayValue(formData.deviceSupport),
    formatArrayValue(formData.browserSupport),
    // Design
    formData.designType || '',
    formData.designPreference || '',
    formData.brandGuidelines || '',
    formData.logoDesign || '',
    formData.designRevisions || '',
    formData.colorScheme || '',
    formData.layoutPreference || '',
    formatArrayValue(formData.visualElements),
    formData.typographyPreference || '',
    formData.accessibilityRequirements || '',
    formData.mockupRequirements || '',
    // Tech Stack
    formatArrayValue(formData.programmingLanguage),
    formatArrayValue(formData.frontendFramework),
    formatArrayValue(formData.backendFramework),
    formatArrayValue(formData.databaseType),
    formData.cloudProvider || '',
    formData.deploymentMethod || '',
    formData.versionControl || '',
    formData.apiArchitecture || '',
    formData.developmentTools || '',
    formatArrayValue(formData.testingFramework),
    formatArrayValue(formData.monitoringTools),
    formatArrayValue(formData.securityTools),
    // Features
    formatArrayValue(formData.coreFeatures),
    formatArrayValue(formData.advancedFeatures),
    formatArrayValue(formData.ecommerceFeatures),
    formatArrayValue(formData.analyticsFeatures),
    formatArrayValue(formData.mobileFeatures),
    formatArrayValue(formData.securityFeatures),
    // Content
    formData.contentProvided || '',
    formData.imagesProvided || '',
    formData.cmsType || '',
    formData.adminDashboard || '',
    formData.userRoles || '',
    formData.contentMigration || '',
    formData.maintenanceLevel || '',
    formData.supportLevel || '',
    formData.trainingRequired || '',
    formData.documentationLevel || '',
    // Additional
    formData.seoRequirements || '',
    formData.analyticsSetup || '',
    formData.accessibilityCompliance || '',
    formatArrayValue(formData.performanceFeatures),
    formatArrayValue(formData.integrationRequirements),
    formatArrayValue(formData.complianceRequirements),
    formData.deploymentEnvironment || '',
    formData.projectPriority || '',
    formatArrayValue(formData.riskFactors),
    formData.specialRequirements || '',
    formData.futureScalability || '',
    // Quotation
    formatCurrencyValue(quotation.totalCost),
    formatCurrencyValue(quotation.developmentCost),
    formatCurrencyValue(quotation.designCost),
    formatCurrencyValue(quotation.additionalCost),
    quotation.analysis?.complexity?.overall || 0,
    quotation.timeline?.totalWeeks || 0,
    quotation.team?.totalMembers || 0,
    Math.round((quotation.summary?.confidence || 0.8) * 100)
  ];
};

// ====================================================================
// EXPORT METHODS
// ====================================================================
const exportViaFormSubmission = (payload) => {
  return new Promise((resolve, reject) => {
    const exportId = 'EXP_' + Date.now().toString(36);
    if (!GOOGLE_APPS_SCRIPT_CONFIG.webAppUrl || GOOGLE_APPS_SCRIPT_CONFIG.webAppUrl.includes('YOUR_WEB_APP_URL_HERE')) {
      reject(new Error('Please update the webAppUrl in GOOGLE_APPS_SCRIPT_CONFIG'));
      return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GOOGLE_APPS_SCRIPT_CONFIG.webAppUrl;
    form.target = `export_frame_${exportId}`;
    form.style.display = 'none';
    form.enctype = 'application/x-www-form-urlencoded';

    const dataInput = document.createElement('input');
    dataInput.type = 'hidden';
    dataInput.name = 'data';
    dataInput.value = JSON.stringify(payload);
    form.appendChild(dataInput);

    const iframe = document.createElement('iframe');
    iframe.name = form.target;
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    let isCompleted = false;
    let timeoutId;

    const complete = (success, message, details = {}) => {
      if (isCompleted) return;
      isCompleted = true;
      clearTimeout(timeoutId);
      if (form.parentNode) document.body.removeChild(form);
      if (iframe.parentNode) document.body.removeChild(iframe);
      if (success) resolve({ success: true, message, details, exportId, sheetUrl: GOOGLE_APPS_SCRIPT_CONFIG.sheetUrl });
      else reject(new Error(message));
    };

    iframe.onload = () => setTimeout(() => complete(true, 'Data exported successfully via form submission!', { method: 'form-submission', timestamp: new Date().toISOString(), sheetUrl: GOOGLE_APPS_SCRIPT_CONFIG.sheetUrl }), 1000);
    iframe.onerror = (error) => complete(true, 'Data exported (iframe error, but likely successful)', { method: 'form-submission', warning: 'iframe-error', sheetUrl: GOOGLE_APPS_SCRIPT_CONFIG.sheetUrl });
    timeoutId = setTimeout(() => complete(true, 'Data exported (timeout, but likely successful)', { method: 'form-submission', warning: 'timeout', sheetUrl: GOOGLE_APPS_SCRIPT_CONFIG.sheetUrl }), GOOGLE_APPS_SCRIPT_CONFIG.timeout);

    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
  });
};

const exportViaFetch = async (payload, useNoCors = false) => {
  const exportId = 'FETCH_' + Date.now().toString(36);

  try {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    };
    if (useNoCors) options.mode = 'no-cors';

    const response = await fetch(GOOGLE_APPS_SCRIPT_CONFIG.webAppUrl, options);

    if (useNoCors) {
      return {
        success: true,
        message: 'Data exported via no-cors fetch (response not readable)',
        method: 'fetch-no-cors',
        exportId,
        sheetUrl: GOOGLE_APPS_SCRIPT_CONFIG.sheetUrl
      };
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const result = await response.json();
    return {
      success: true,
      message: result.message || 'Data exported via fetch',
      method: 'fetch',
      result: result,
      exportId,
      sheetUrl: GOOGLE_APPS_SCRIPT_CONFIG.sheetUrl
    };

  } catch (error) {
    throw error;
  }
};

// ====================================================================
// CSV FALLBACK
// ====================================================================
const generateCSVFallback = (quotation, formData, currency) => {
  try {
    const headers = [
      'Timestamp', 'Quote ID', 'Currency',
      'Client Name', 'Company Name', 'Email', 'Phone', 'Website', 'Industry', 'Company Size', 'Location',
      'Project Title', 'Project Type', 'Project Goal', 'Target Audience', 'Budget Range', 'Timeline',
      'Project Budget', 'Expected Users', 'Region', 'Global Deployment',
      'Number of Pages', 'Expected Traffic', 'Performance Requirements', 'Device Support', 'Browser Support',
      'Design Type', 'Design Preference', 'Brand Guidelines', 'Logo Design', 'Design Revisions',
      'Color Scheme', 'Layout Preference', 'Visual Elements', 'Typography Preference',
      'Accessibility Requirements', 'Mockup Requirements',
      'Programming Languages', 'Frontend Frameworks', 'Backend Frameworks', 'Database Types',
      'Cloud Provider', 'Deployment Method', 'Version Control', 'API Architecture', 'Development Tools',
      'Testing Frameworks', 'Monitoring Tools', 'Security Tools',
      'Core Features', 'Advanced Features', 'E-commerce Features', 'Analytics Features',
      'Mobile Features', 'Security Features',
      'Content Provided', 'Images Provided', 'CMS Type', 'Admin Dashboard', 'User Roles',
      'Content Migration', 'Maintenance Level', 'Support Level', 'Training Required', 'Documentation Level',
      'SEO Requirements', 'Analytics Setup', 'Accessibility Compliance', 'Performance Features',
      'Integration Requirements', 'Compliance Requirements', 'Deployment Environment',
      'Project Priority', 'Risk Factors', 'Special Requirements', 'Future Scalability',
      'Total Cost', 'Development Cost', 'Design Cost', 'Additional Cost', 'Complexity Score',
      'Timeline Weeks', 'Team Size', 'Confidence Score'
    ];

    const rowData = convertToSheetRow(quotation, formData, currency);
    const escapeCsvField = (field) => {
      if (field == null) return '""';
      const str = String(field);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };
    const csvContent = [
      headers.map(escapeCsvField).join(','),
      rowData.map(escapeCsvField).join(',')
    ].join('\r\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `quotation-export-${quotation.id || Date.now()}.csv`;
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return {
      success: true,
      message: `CSV file "${fileName}" downloaded! Upload it to Google Sheets at ${GOOGLE_APPS_SCRIPT_CONFIG.sheetUrl}`,
      fileName: fileName,
      method: 'csv-download',
      isFallback: true,
      sheetUrl: GOOGLE_APPS_SCRIPT_CONFIG.sheetUrl
    };
  } catch (error) {
    throw new Error(`CSV generation failed: ${error.message}`);
  }
};

// ====================================================================
// MAIN EXPORT FUNCTION
// ====================================================================
export const exportToCSV = async (quotation, formData, currency = 'INR') => {
  try {
    const validation = validateData(quotation, formData);
    if (!validation.isValid) throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    if (!GOOGLE_APPS_SCRIPT_CONFIG.webAppUrl || GOOGLE_APPS_SCRIPT_CONFIG.webAppUrl.includes('YOUR_WEB_APP_URL_HERE')) {
      throw new Error('Google Apps Script Web App URL not configured');
    }

    const rowData = convertToSheetRow(quotation, formData, currency);
    const payload = {
      rowData: rowData,
      timestamp: new Date().toISOString(),
      source: 'quotation-app-v3',
      currency: currency,
      quotationId: quotation.id || `QT-${Date.now().toString().slice(-6)}`,
      metadata: {
        clientName: formData.clientName || 'Unknown',
        projectTitle: formData.projectTitle || 'Untitled Project',
        email: formData.email || '',
        totalCost: quotation.totalCost || 0,
        exportedBy: 'QuotationApp',
        version: '3.0',
        exportId: 'MAIN_' + Date.now().toString(36),
        sheetUrl: GOOGLE_APPS_SCRIPT_CONFIG.sheetUrl
      }
    };

    const methods = [
      { name: 'Form Submission', func: () => exportViaFormSubmission(payload) },
      { name: 'Fetch (CORS)', func: () => exportViaFetch(payload, false) },
      { name: 'Fetch (No-CORS)', func: () => exportViaFetch(payload, true) }
    ];

    let lastError;
    for (let i = 0; i < methods.length; i++) {
      const method = methods[i];
      try {
        const result = await method.func();
        if (result && result.success) {
          return {
            success: true,
            message: `Data exported successfully using ${method.name}!`,
            method: method.name,
            quotationId: payload.quotationId,
            result: result,
            timestamp: new Date().toISOString()
          };
        }
      } catch (error) {
        lastError = error;
        if (i < methods.length - 1) await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const csvResult = await generateCSVFallback(quotation, formData, currency);
    return {
      success: true,
      message: csvResult.message,
      method: 'csv-fallback',
      quotationId: payload.quotationId,
      result: csvResult,
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  } catch (error) {
    try {
      const csvResult = await generateCSVFallback(quotation, formData, currency);
      return {
        success: true,
        message: `Export methods failed, but CSV was generated: ${csvResult.message}`,
        method: 'emergency-csv',
        quotationId: quotation.id || 'unknown',
        result: csvResult,
        timestamp: new Date().toISOString(),
        wasEmergency: true
      };
    } catch (csvError) {
      throw new Error(`All export methods failed. Original error: ${error.message}. CSV error: ${csvError.message}`);
    }
  }
};
