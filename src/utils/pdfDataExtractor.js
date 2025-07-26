// pdfDataExtractor.js - Complete data extraction service
import { useState, useEffect, useCallback } from 'react';

const usePdfDataExtractor = (formData, quotation, currency) => {
  const [extractedData, setExtractedData] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [extractionError, setExtractionError] = useState(null);

  // Complete data extraction function with all form fields
  const extractAllData = useCallback(() => {
    if (!formData || !quotation) return null;

    try {
      const pdfData = {
        // Client Information Section - Complete extraction
        clientInfo: {
          clientName: formData.clientName || '',
          companyName: formData.companyName || '',
          email: formData.email || '',
          phone: formData.phone || '',
          website: formData.website || '',
          industry: formData.industry || '',
          companySize: formData.companySize || '',
          location: formData.location || ''
        },

        // Project Overview Section - Complete extraction
        projectOverview: {
          projectTitle: formData.projectTitle || '',
          projectType: formData.projectType || '',
          projectGoal: formData.projectGoal || '',
          targetAudience: formData.targetAudience || '',
          budgetRange: formData.budgetRange || '',
          timeline: formData.timeline || '',
          projectBudget: formData.projectBudget || '',
          expectedUsers: formData.expectedUsers || '',
          region: formData.region || '',
          globalDeployment: formData.globalDeployment || false
        },

        // Technical Requirements Section - Complete extraction
        technicalRequirements: {
          numberOfPages: formData.numberOfPages || '',
          expectedTraffic: formData.expectedTraffic || '',
          performanceRequirements: formData.performanceRequirements || '',
          deviceSupport: formData.deviceSupport || [],
          browserSupport: formData.browserSupport || []
        },

        // Design Requirements Section - Complete extraction
        designRequirements: {
          designType: formData.designType || '',
          designPreference: formData.designPreference || '',
          brandGuidelines: formData.brandGuidelines || '',
          logoDesign: formData.logoDesign || '',
          designRevisions: formData.designRevisions || '',
          colorScheme: formData.colorScheme || '',
          designInspiration: formData.designInspiration || '',
          layoutPreference: formData.layoutPreference || '',
          visualElements: formData.visualElements || [],
          typographyPreference: formData.typographyPreference || '',
          accessibilityRequirements: formData.accessibilityRequirements || '',
          mockupRequirements: formData.mockupRequirements || ''
        },

        // Technology Stack Section - Complete extraction
        technologyStack: {
          programmingLanguage: formData.programmingLanguage || [],
          frontendFramework: formData.frontendFramework || [],
          backendFramework: formData.backendFramework || [],
          databaseType: formData.databaseType || [],
          cloudProvider: formData.cloudProvider || '',
          deploymentMethod: formData.deploymentMethod || '',
          versionControl: formData.versionControl || '',
          apiArchitecture: formData.apiArchitecture || '',
          developmentTools: formData.developmentTools || '',
          testingFramework: formData.testingFramework || [],
          monitoringTools: formData.monitoringTools || [],
          securityTools: formData.securityTools || []
        },

        // Features & Functionality Section - Complete extraction
        featuresAndFunctionality: {
          coreFeatures: formData.coreFeatures || [],
          advancedFeatures: formData.advancedFeatures || [],
          ecommerceFeatures: formData.ecommerceFeatures || [],
          analyticsFeatures: formData.analyticsFeatures || [],
          mobileFeatures: formData.mobileFeatures || [],
          securityFeatures: formData.securityFeatures || []
        },

        // Content & Support Section - Complete extraction
        contentAndSupport: {
          contentProvided: formData.contentProvided || '',
          imagesProvided: formData.imagesProvided || '',
          cmsType: formData.cmsType || '',
          adminDashboard: formData.adminDashboard || '',
          userRoles: formData.userRoles || '',
          contentMigration: formData.contentMigration || '',
          maintenanceLevel: formData.maintenanceLevel || '',
          supportLevel: formData.supportLevel || '',
          trainingRequired: formData.trainingRequired || '',
          documentationLevel: formData.documentationLevel || ''
        },

        // Additional Requirements Section - Complete extraction
        additionalRequirements: {
          seoRequirements: formData.seoRequirements || '',
          analyticsSetup: formData.analyticsSetup || '',
          accessibilityCompliance: formData.accessibilityCompliance || '',
          performanceFeatures: formData.performanceFeatures || [],
          integrationRequirements: formData.integrationRequirements || [],
          complianceRequirements: formData.complianceRequirements || [],
          deploymentEnvironment: formData.deploymentEnvironment || '',
          projectPriority: formData.projectPriority || '',
          riskFactors: formData.riskFactors || [],
          specialRequirements: formData.specialRequirements || '',
          futureScalability: formData.futureScalability || ''
        },

        // Quotation Results Section - Complete extraction
        quotationResults: {
          totalCost: quotation.totalCost || 0,
          currency: currency || 'INR',
          basePrice: quotation.basePrice || 0,
          
          // All multipliers from quotation calculation
          complexityMultiplier: quotation.complexityMultiplier || 1,
          featuresMultiplier: quotation.featuresMultiplier || 1,
          technologyMultiplier: quotation.technologyMultiplier || 1,
          designMultiplier: quotation.designMultiplier || 1,
          timelineMultiplier: quotation.timelineMultiplier || 1,
          locationMultiplier: quotation.locationMultiplier || 1,
          priorityMultiplier: quotation.priorityMultiplier || 1,
          riskMultiplier: quotation.riskMultiplier || 1,
          maintenanceMultiplier: quotation.maintenanceMultiplier || 1,
          supportMultiplier: quotation.supportMultiplier || 1,
          trainingMultiplier: quotation.trainingMultiplier || 1,
          
          // Detailed cost breakdown
          breakdown: {
            developmentCost: quotation.breakdown?.developmentCost || 0,
            designCost: quotation.breakdown?.designCost || 0,
            testingCost: quotation.breakdown?.testingCost || 0,
            deploymentCost: quotation.breakdown?.deploymentCost || 0,
            projectManagementCost: quotation.breakdown?.projectManagementCost || 0,
            contingencyCost: quotation.breakdown?.contingencyCost || 0,
            maintenanceCost: quotation.breakdown?.maintenanceCost || 0,
            supportCost: quotation.breakdown?.supportCost || 0,
            trainingCost: quotation.breakdown?.trainingCost || 0,
            documentationCost: quotation.breakdown?.documentationCost || 0,
            hostingCost: quotation.breakdown?.hostingCost || 0,
            licensingCost: quotation.breakdown?.licensingCost || 0,
            securityCost: quotation.breakdown?.securityCost || 0,
            integrationCost: quotation.breakdown?.integrationCost || 0,
            contentCreationCost: quotation.breakdown?.contentCreationCost || 0,
            seoOptimizationCost: quotation.breakdown?.seoOptimizationCost || 0
          },

          // Timeline information
          timeline: {
            totalDuration: quotation.timeline?.totalDuration || '',
            estimatedStartDate: quotation.timeline?.estimatedStartDate || '',
            estimatedEndDate: quotation.timeline?.estimatedEndDate || '',
            phases: quotation.phases || [],
            milestones: quotation.milestones || [],
            criticalPath: quotation.timeline?.criticalPath || [],
            dependencies: quotation.timeline?.dependencies || []
          },

          // Pricing tiers if available
          pricingTiers: quotation.pricingTiers || null,

          // Additional quotation details
          recommendations: quotation.recommendations || [],
          assumptions: quotation.assumptions || [],
          exclusions: quotation.exclusions || [],
          terms: quotation.terms || [],
          validityPeriod: quotation.validityPeriod || '',
          paymentTerms: quotation.paymentTerms || '',
          deliverables: quotation.deliverables || [],
          riskAssessment: quotation.riskAssessment || [],
          qualityAssurance: quotation.qualityAssurance || [],
          testingStrategy: quotation.testingStrategy || '',
          deploymentStrategy: quotation.deploymentStrategy || '',
          maintenancePlan: quotation.maintenancePlan || '',
          supportPlan: quotation.supportPlan || '',
          trainingPlan: quotation.trainingPlan || '',
          documentationPlan: quotation.documentationPlan || ''
        },

        // Metadata section
        metadata: {
          generationDate: new Date().toISOString(),
          generationTimestamp: Date.now(),
          quotationId: quotation.quotationId || `QUO-${Date.now()}`,
          version: '1.0',
          extractorVersion: '2.0.0',
          formCompletionPercentage: calculateFormCompletionPercentage(formData),
          dataIntegrity: validateDataIntegrity(formData, quotation),
          extractionMethod: 'hook-based',
          lastUpdated: new Date().toISOString()
        },

        // Calculated fields for convenience
        calculatedFields: {
          isFormComplete: checkFormCompleteness(formData),
          hasQuotationData: !!quotation && Object.keys(quotation).length > 0,
          totalFieldCount: getTotalFieldCount(formData),
          completedFieldCount: getCompletedFieldCount(formData),
          emptyFieldCount: getEmptyFieldCount(formData),
          arrayFieldCount: getArrayFieldCount(formData),
          booleanFieldCount: getBooleanFieldCount(formData),
          stringFieldCount: getStringFieldCount(formData)
        }
      };

      return pdfData;
    } catch (error) {
      console.error('Data extraction error:', error);
      setExtractionError(error.message);
      return null;
    }
  }, [formData, quotation, currency]);

  // Helper functions for calculated fields
  const calculateFormCompletionPercentage = useCallback((data) => {
    if (!data) return 0;
    const totalFields = Object.keys(data).length;
    const completedFields = Object.values(data).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return true;
      if (typeof value === 'string') return value.trim() !== '';
      return value != null && value !== '';
    }).length;
    return Math.round((completedFields / totalFields) * 100);
  }, []);

  const validateDataIntegrity = useCallback((formData, quotation) => {
    return {
      hasFormData: !!formData,
      hasQuotationData: !!quotation,
      formDataValid: formData && Object.keys(formData).length > 0,
      quotationDataValid: quotation && typeof quotation.totalCost !== 'undefined',
      timestamp: new Date().toISOString()
    };
  }, []);

  const checkFormCompleteness = useCallback((data) => {
    if (!data) return false;
    const requiredFields = [
      'clientName', 'companyName', 'email', 'projectType', 
      'timeline', 'numberOfPages', 'designType', 'coreFeatures'
    ];
    return requiredFields.every(field => {
      const value = data[field];
      if (Array.isArray(value)) return value.length > 0;
      return value && value.toString().trim() !== '';
    });
  }, []);

  const getTotalFieldCount = useCallback((data) => {
    return data ? Object.keys(data).length : 0;
  }, []);

  const getCompletedFieldCount = useCallback((data) => {
    if (!data) return 0;
    return Object.values(data).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return true;
      if (typeof value === 'string') return value.trim() !== '';
      return value != null && value !== '';
    }).length;
  }, []);

  const getEmptyFieldCount = useCallback((data) => {
    if (!data) return 0;
    return Object.values(data).filter(value => {
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === 'boolean') return false;
      if (typeof value === 'string') return value.trim() === '';
      return value == null || value === '';
    }).length;
  }, []);

  const getArrayFieldCount = useCallback((data) => {
    if (!data) return 0;
    return Object.values(data).filter(value => Array.isArray(value)).length;
  }, []);

  const getBooleanFieldCount = useCallback((data) => {
    if (!data) return 0;
    return Object.values(data).filter(value => typeof value === 'boolean').length;
  }, []);

  const getStringFieldCount = useCallback((data) => {
    if (!data) return 0;
    return Object.values(data).filter(value => typeof value === 'string').length;
  }, []);

  // Update extracted data when dependencies change
  useEffect(() => {
    const data = extractAllData();
    if (data) {
      setExtractedData(data);
      setIsDataReady(true);
      setExtractionError(null);
    } else {
      setIsDataReady(false);
      setExtractedData(null);
    }
  }, [extractAllData]);

  // Method to get data for PDF generation
  const getPdfData = useCallback(() => {
    return extractedData;
  }, [extractedData]);

  // Method to get specific data section
  const getDataSection = useCallback((sectionName) => {
    if (!extractedData) return null;
    return extractedData[sectionName] || null;
  }, [extractedData]);

  // Method to export data as JSON
  const exportAsJson = useCallback(() => {
    if (!extractedData) return null;
    return JSON.stringify(extractedData, null, 2);
  }, [extractedData]);

  // Method to validate required fields
  const validateRequiredFields = useCallback(() => {
    if (!extractedData) return { isValid: false, missingFields: [] };
    
    const requiredFields = [
      'clientInfo.clientName',
      'clientInfo.companyName', 
      'clientInfo.email',
      'projectOverview.projectType',
      'projectOverview.timeline',
      'technicalRequirements.numberOfPages',
      'designRequirements.designType',
      'featuresAndFunctionality.coreFeatures'
    ];
    
    const missingFields = requiredFields.filter(fieldPath => {
      const keys = fieldPath.split('.');
      let value = extractedData;
      
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined || value === null) return true;
      }
      
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === 'string') return value.trim() === '';
      
      return false;
    });
    
    return {
      isValid: missingFields.length === 0,
      missingFields: missingFields
    };
  }, [extractedData]);

  return {
    extractedData,
    isDataReady,
    extractionError,
    getPdfData,
    getDataSection,
    exportAsJson,
    validateRequiredFields,
    formCompletionPercentage: extractedData?.calculatedFields?.formCompletionPercentage || 0,
    isFormComplete: extractedData?.calculatedFields?.isFormComplete || false,
    hasQuotationData: extractedData?.calculatedFields?.hasQuotationData || false
  };
};

export default usePdfDataExtractor;
