import React, { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import FormSection from "./FormSection";
import FormGroup from "./FormGroup";
import MultiSelectDropdown from "../ui/MultiSelectDropdown";
import QuotationResults from "../advanced/QuotationResults";
import CurrencySelector from "../ui/CurrencySelector";
import LoadingSpinner from "../ui/LoadingSpinner";
import PricingTiers from "../advanced/PricingTiers";
import TimelineVisualizer from "../advanced/TimelineVisualizer";
import calculateProfessionalQuotation from "../../utils/calculations";
import { validateStep, getStepCompletionStatus } from "../../utils/validation";
import { FORM_OPTIONS } from "../../utils/constants";
import anime from 'animejs'; // ✅ Correct import
import "../../styles/components.css";

// Helper function to get step labels
const getStepLabel = (step) => {
  const labels = {
    1: "Client Info",
    2: "Project Overview",
    3: "Technical Specs",
    4: "Design Requirements",
    5: "Technology Stack",
    6: "Features & Functionality",
    7: "Content & Support",
    8: "Additional Requirements",
  };
  return labels[step] || `Step ${step}`;
};

const QuotationCalculator = () => {
  // ULTIMATE AUTO-GENERATION PREVENTION
  const isManualSubmissionRef = useRef(false);
  const generationEnabledRef = useRef(false);
  const lastUserInteractionRef = useRef(0);
  const formSubmissionBlockedRef = useRef(true);
  const stepChangeInProgressRef = useRef(false);

  const [formData, setFormData] = useState({
    clientName: "",
    companyName: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    companySize: "",
    projectTitle: "",
    projectType: "",
    projectGoal: "",
    targetAudience: "",
    budgetRange: "",
    timeline: "",
    location: "",
    projectBudget: "",
    expectedUsers: "",
    region: "",
    // globalDeployment: false,
    numberOfPages: "",
    expectedTraffic: "",
    performanceRequirements: "",
    deviceSupport: [],
    browserSupport: [],
    designType: "",
    designPreference: "",
    brandGuidelines: "",
    logoDesign: "",
    designRevisions: "",
    colorScheme: "",
    designInspiration: "",
    layoutPreference: "",
    visualElements: [],
    typographyPreference: "",
    accessibilityRequirements: "",
    mockupRequirements: "",
    programmingLanguage: [],
    frontendFramework: [],
    backendFramework: [],
    databaseType: [],
    cloudProvider: "",
    deploymentMethod: "",
    versionControl: "",
    apiArchitecture: "",
    developmentTools: "",
    testingFramework: [],
    monitoringTools: [],
    securityTools: [],
    coreFeatures: [],
    advancedFeatures: [],
    ecommerceFeatures: [],
    analyticsFeatures: [],
    mobileFeatures: [],
    securityFeatures: [],
    contentProvided: "",
    imagesProvided: "",
    cmsType: "",
    adminDashboard: "",
    userRoles: "",
    contentMigration: "",
    maintenanceLevel: "",
    supportLevel: "",
    trainingRequired: "",
    documentationLevel: "",
    seoRequirements: "",
    analyticsSetup: "",
    accessibilityCompliance: "",
    performanceFeatures: [],
    integrationRequirements: [],
    complianceRequirements: [],
    deploymentEnvironment: "",
    projectPriority: "",
    riskFactors: [],
    specialRequirements: "",
    futureScalability: "",
  });

  const [quotation, setQuotation] = useState(null);
  const [showQuotation, setShowQuotation] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currency, setCurrency] = useState("INR");
  const [showPricingTiers, setShowPricingTiers] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [stepCompletionStatus, setStepCompletionStatus] = useState({});
  const [generationEnabled, setGenerationEnabled] = useState(false);

  const totalSteps = 8;



    // Map each step to its formData keys
  const keyStepMap = {
    1: ['clientName','companyName','email','phone','website','industry','companySize'],
    2: ['projectTitle','projectType','projectGoal','targetAudience','budgetRange','timeline','location','expectedUsers','region'],
    3: ['numberOfPages','expectedTraffic','performanceRequirements','deviceSupport','browserSupport'],
    4: ['designType','designPreference','brandGuidelines','logoDesign','designRevisions','colorScheme','layoutPreference','visualElements','typographyPreference','accessibilityRequirements','mockupRequirements','designInspiration'],
    5: ['programmingLanguage','frontendFramework','backendFramework','databaseType','cloudProvider','deploymentMethod','versionControl','apiArchitecture','developmentTools','testingFramework','monitoringTools','securityTools'],
    6: ['coreFeatures','advancedFeatures','ecommerceFeatures','analyticsFeatures','mobileFeatures','securityFeatures'],
    7: ['contentProvided','imagesProvided','cmsType','adminDashboard','userRoles','contentMigration','maintenanceLevel','supportLevel','trainingRequired','documentationLevel'],
    8: ['seoRequirements','analyticsSetup','accessibilityCompliance','performanceFeatures','integrationRequirements','complianceRequirements','deploymentEnvironment','projectPriority','riskFactors','specialRequirements','futureScalability'],
  };


  // INITIALIZATION: Block all automatic submissions
  useEffect(() => {
    formSubmissionBlockedRef.current = true;
    generationEnabledRef.current = false;
    isManualSubmissionRef.current = false;
    console.log("🔒 Auto-generation permanently blocked");
  }, []);

  // COMPLETELY SAFE: Only track step completion for UI, NEVER auto-calculate
  // Update stepCompletionStatus on any form change or step change
useEffect(() => {
  if (stepChangeInProgressRef.current) return;

  const status = {};
  for (let i = 1; i <= totalSteps; i++) {
    let result;
    try {
      result = getStepCompletionStatus(i, formData);
    } catch {
      result = { isValid: false, completionPercentage: 0 };
    }

    // If none of this step's fields have values, force 0%
    const anyFilled = keyStepMap[i].some(key => {
      const val = formData[key];
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === 'boolean') return val === true;
      return val !== '' && val != null;
    });
    if (!anyFilled) {
      result.completionPercentage = 0;
    }

    status[i] = result;
  }

  setStepCompletionStatus(status);
}, [formData, currentStep]);




  // Track user interactions
  const trackUserInteraction = useCallback(() => {
    lastUserInteractionRef.current = Date.now();
    isManualSubmissionRef.current = true;
  }, []);

  // PROTECTED INPUT HANDLERS
  const handleInputChange = useCallback(
    (e) => {
      trackUserInteraction();
      const { name, value, type, checked } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      if (validationErrors[name]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [validationErrors, trackUserInteraction]
  );

  const handleMultiSelectChange = useCallback(
    (name, selectedValues) => {
      trackUserInteraction();

      setFormData((prev) => ({
        ...prev,
        [name]: selectedValues,
      }));

      if (validationErrors[name]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [validationErrors, trackUserInteraction]
  );

  // VALIDATION
  const validateCurrentStep = useCallback(() => {
    try {
      const errors = {};

      switch (currentStep) {
        case 1:
          if (!formData.clientName?.trim())
            errors.clientName = "Client name is required";
          if (!formData.companyName?.trim())
            errors.companyName = "Company name is required";
          if (!formData.email?.trim()) errors.email = "Email is required";
          if (!formData.phone?.trim())
            errors.phone = "Phone number is required";
          if (!formData.industry) errors.industry = "Industry is required";
          break;
        case 2:
          if (!formData.projectTitle?.trim())
            errors.projectTitle = "Project title is required";
          if (!formData.projectType)
            errors.projectType = "Project type is required";
          if (!formData.timeline) errors.timeline = "Timeline is required";
          break;
        case 3:
          if (!formData.numberOfPages)
            errors.numberOfPages = "Number of pages is required";
          if (!formData.deviceSupport || formData.deviceSupport.length === 0) {
            errors.deviceSupport = "Device support is required";
          }
          break;
        case 4:
          if (!formData.designType)
            errors.designType = "Design type is required";
          break;
        case 6:
          if (!formData.coreFeatures || formData.coreFeatures.length === 0) {
            errors.coreFeatures = "At least one core feature is required";
          }
          break;
        default:
          break;
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    } catch (error) {
      return true;
    }
  }, [currentStep, formData]);

  // PROTECTED NAVIGATION
  const nextStep = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      trackUserInteraction();
      stepChangeInProgressRef.current = true;

      if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1);
          setValidationErrors({});

          // SPECIAL: When entering step 8, ensure generation is disabled
          if (currentStep + 1 === 8) {
            setGenerationEnabled(false);
            generationEnabledRef.current = false;
            formSubmissionBlockedRef.current = true;
            console.log("🔒 Entered step 8 - Generation disabled");
          }
        }
      }

      setTimeout(() => {
        stepChangeInProgressRef.current = false;
      }, 100);
    },
    [currentStep, validateCurrentStep, trackUserInteraction]
  );

  const prevStep = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      trackUserInteraction();

      if (currentStep > 1) {
        stepChangeInProgressRef.current = true;
        setCurrentStep(currentStep - 1);
        setValidationErrors({});

        setTimeout(() => {
          stepChangeInProgressRef.current = false;
        }, 100);
      }
    },
    [currentStep, trackUserInteraction]
  );

  const goToStep = useCallback(
    (step, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      trackUserInteraction();

      if (step < currentStep) {
        stepChangeInProgressRef.current = true;
        setCurrentStep(step);
        setValidationErrors({});

        setTimeout(() => {
          stepChangeInProgressRef.current = false;
        }, 100);
      }
    },
    [currentStep, trackUserInteraction]
  );

  // FORM READINESS CHECK
  const isFormReadyForGeneration = useCallback(() => {
    return (
      formData.clientName?.trim() &&
      formData.companyName?.trim() &&
      formData.email?.trim() &&
      formData.projectType &&
      formData.timeline &&
      formData.numberOfPages &&
      formData.designType &&
      formData.coreFeatures &&
      formData.coreFeatures.length > 0
    );
  }, [formData]);

  // STEP 1: ENABLE GENERATION
  const handleEnableGeneration = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      trackUserInteraction();

      if (!isFormReadyForGeneration()) {
        alert(
          "Please complete all required fields before enabling generation:\n- Client Name\n- Company Name\n- Email\n- Project Type\n- Timeline\n- Number of Pages\n- Design Type\n- At least one Core Feature"
        );
        return;
      }

      setGenerationEnabled(true);
      generationEnabledRef.current = true;
      formSubmissionBlockedRef.current = false;
      console.log("✅ Generation enabled by user");
    },
    [trackUserInteraction, isFormReadyForGeneration]
  );

  // STEP 2: GENERATE QUOTATION
  const handleGenerateQuotation = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!generationEnabledRef.current) {
        alert("Please enable generation first");
        return;
      }

      if (formSubmissionBlockedRef.current) {
        alert("Generation not enabled");
        return;
      }

      const timeSinceLastInteraction =
        Date.now() - lastUserInteractionRef.current;
      if (timeSinceLastInteraction < 100) {
        console.log("🚫 BLOCKED: Click too soon after interaction");
        return;
      }

      trackUserInteraction();
      isManualSubmissionRef.current = true;

      console.log("✅ Manual quotation generation started");

      setIsCalculating(true);
      setShowQuotation(false);
      setQuotation(null);

      setTimeout(() => {
        try {
          console.log("🔄 Calling calculateProfessionalQuotation...");
          const calculatedQuotation = calculateProfessionalQuotation(formData);
          console.log("Quotation result:", calculatedQuotation);

          if (calculatedQuotation) {
            setQuotation(calculatedQuotation);
            setShowQuotation(true);
            setShowPricingTiers(true);
            console.log("✅ Quotation generated successfully");
          } else {
            alert("Error: Unable to generate quotation.");
          }
        } catch (error) {
          console.error("Calculation error:", error);
          alert(`Error: ${error.message}`);
        } finally {
          setIsCalculating(false);
          setGenerationEnabled(false);
          generationEnabledRef.current = false;
          formSubmissionBlockedRef.current = true;
        }
      }, 2000);
    },
    [formData, trackUserInteraction]
  );

  // FORM SUBMISSION BLOCKER
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🚫 Form submission blocked");
    return false;
  }, []);

  const handleReset = useCallback(() => {
    trackUserInteraction();

    setFormData({
      clientName: "",
      companyName: "",
      email: "",
      phone: "",
      website: "",
      industry: "",
      companySize: "",
      projectTitle: "",
      projectType: "",
      projectGoal: "",
      targetAudience: "",
      budgetRange: "",
      timeline: "",
      location: "",
      projectBudget: "",
      expectedUsers: "",
      region: "",
      // globalDeployment: false,
      numberOfPages: "",
      expectedTraffic: "",
      performanceRequirements: "",
      deviceSupport: [],
      browserSupport: [],
      designType: "",
      designPreference: "",
      brandGuidelines: "",
      logoDesign: "",
      designRevisions: "",
      colorScheme: "",
      designInspiration: "",
      layoutPreference: "",
      visualElements: [],
      typographyPreference: "",
      accessibilityRequirements: "",
      mockupRequirements: "",
      programmingLanguage: [],
      frontendFramework: [],
      backendFramework: [],
      databaseType: [],
      cloudProvider: "",
      deploymentMethod: "",
      versionControl: "",
      apiArchitecture: "",
      developmentTools: "",
      testingFramework: [],
      monitoringTools: [],
      securityTools: [],
      coreFeatures: [],
      advancedFeatures: [],
      ecommerceFeatures: [],
      analyticsFeatures: [],
      mobileFeatures: [],
      securityFeatures: [],
      contentProvided: "",
      imagesProvided: "",
      cmsType: "",
      adminDashboard: "",
      userRoles: "",
      contentMigration: "",
      maintenanceLevel: "",
      supportLevel: "",
      trainingRequired: "",
      documentationLevel: "",
      seoRequirements: "",
      analyticsSetup: "",
      accessibilityCompliance: "",
      performanceFeatures: [],
      integrationRequirements: [],
      complianceRequirements: [],
      deploymentEnvironment: "",
      projectPriority: "",
      riskFactors: [],
      specialRequirements: "",
      futureScalability: "",
    });

    setQuotation(null);
    setShowQuotation(false);
    setCurrentStep(1);
    setShowPricingTiers(false);
    setValidationErrors({});
    setStepCompletionStatus({});
    setGenerationEnabled(false);

    formSubmissionBlockedRef.current = true;
    generationEnabledRef.current = false;
    isManualSubmissionRef.current = false;
  }, [trackUserInteraction]);

  // FIXED: Add renderFieldError function
  // const renderFieldError = useCallback(
  //   (fieldName) => {
  //     if (validationErrors[fieldName]) {
  //       return <div className="field-error">{validationErrors[fieldName]}</div>;
  //     }
  //     return null;
  //   },
  //   [validationErrors]
  // );

  const isStepComplete = useCallback(
    (step) => {
      return stepCompletionStatus[step]?.isValid || false;
    },
    [stepCompletionStatus]
  );

  // Full-screen quotation view
  if (showQuotation && quotation && isManualSubmissionRef.current) {
    return (
      <div className="quotation-fullscreen">
        <div className="quotation-fullscreen-header">
          <h1>
            <i className="fas fa-file-invoice-dollar"></i>
            Enhanced Professional Quotation
          </h1>
          <div className="fullscreen-actions">
            <button
              onClick={() => {
                setShowQuotation(false);
                setQuotation(null);
                isManualSubmissionRef.current = false;
              }}
              className="btn btn-secondary"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Form
            </button>
            <button onClick={handleReset} className="btn btn-outline">
              <i className="fas fa-plus"></i>
              New Quotation
            </button>
          </div>
        </div>

        <div className="quotation-fullscreen-content">
          <QuotationResults
            quotation={quotation}
            currency={currency}
            formData={formData}
          />

          {showPricingTiers && quotation.pricingTiers && (
            <PricingTiers
              pricingTiers={quotation.pricingTiers}
              currency={currency}
            />
          )}

          {quotation.timeline && quotation.phases && (
            <TimelineVisualizer
              timeline={quotation.timeline}
              phases={quotation.phases}
            />
          )}
        </div>
      </div>
    );
  }

  // MAIN FORM VIEW
  return (
    <>
      <Helmet>
        <title>Enhanced Professional Quotation Calculator</title>
        <meta
          name="description"
          content="Generate professional project quotations with AI-powered calculations"
        />
      </Helmet>

      <div className="professional-calculator" onClick={trackUserInteraction}>
        <div className="calculator-header">
          <div className="header-content">
            <h1>
              <i className="fas fa-calculator"></i>
              Enhanced Professional Quotation Calculator
            </h1>
            <p>
              Quotation generation with real-time market intelligence
            </p>

            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
              <div className="progress-text">
                Step {currentStep} of {totalSteps} - {getStepLabel(currentStep)}
              </div>
            </div>
          </div>

          <div className="header-controls">
            <CurrencySelector
              currency={currency}
              onCurrencyChange={setCurrency}
            />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="step-navigation">
          <div className="steps-container">
            {Array.from({ length: totalSteps }, (_, i) => {
              const step = i + 1;
              const isActive = currentStep === step;
              const isCompleted = isStepComplete(step);
              const isPrevious = step < currentStep;

              return (
                <div
                  key={step}
                  className={`step-item ${isActive ? "active" : ""} ${
                    isCompleted ? "completed" : ""
                  } ${isPrevious ? "previous" : ""}`}
                  onClick={(e) => isPrevious && goToStep(step, e)}
                  style={{ cursor: isPrevious ? "pointer" : "default" }}
                >
                  <div className="step-number">
                    {isCompleted ? <i className="fas fa-check"></i> : step}
                  </div>
                  <div className="step-label">{getStepLabel(step)}</div>
                  {stepCompletionStatus[step] && (
                    <div className="step-completion">
                      {Math.round(
                        stepCompletionStatus[step].completionPercentage || 0
                      )}
                      %
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="calculator-body">
          <div className="form-quotation-container">
            <div className="form-section-container">
              <form onSubmit={handleFormSubmit} className="quotation-form">
                {/* Step 1: Client Information */}
                {currentStep === 1 && (
                  <FormSection
                    title="Client Information"
                    icon="fas fa-user-tie"
                    description="Provide your business details for personalized quotation"
                    stepNumber={1}
                    isRequired={true}
                  >
                    <div className="form-grid">
                      <FormGroup
                        label="Client Name"
                        required
                        error={validationErrors.clientName}
                      >
                        <input
                          type="text"
                          name="clientName"
                          value={formData.clientName}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className={validationErrors.clientName ? "error" : ""}
                        />
                        {/* {renderFieldError("clientName")} */}
                      </FormGroup>

                      <FormGroup
                        label="Company Name"
                        required
                        error={validationErrors.companyName}
                      >
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="Enter your company name"
                          className={
                            validationErrors.companyName ? "error" : ""
                          }
                        />
                        {/* {renderFieldError("companyName")} */}
                      </FormGroup>

                      <FormGroup
                        label="Email Address"
                        required
                        error={validationErrors.email}
                      >
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className={validationErrors.email ? "error" : ""}
                        />
                        {/* {renderFieldError("email")} */}
                      </FormGroup>

                      <FormGroup
                        label="Phone Number"
                        required
                        error={validationErrors.phone}
                      >
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className={validationErrors.phone ? "error" : ""}
                        />
                        {/* {renderFieldError("phone")} */}
                      </FormGroup>

                      <FormGroup label="Current Website (if any)">
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="https://yourwebsite.com"
                        />
                      </FormGroup>

                      <FormGroup
                        label="Industry"
                        required
                        error={validationErrors.industry}
                      >
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          className={`enhanced-single-select ${
                            validationErrors.industry ? "error" : ""
                          }`}
                        >
                          <option value="">Select your industry</option>
                          {FORM_OPTIONS?.industries?.map((industry) => (
                            <option key={industry.value} value={industry.value}>
                              {industry.label}
                            </option>
                          ))}
                        </select>
                        {/* {renderFieldError("industry")} */}
                      </FormGroup>

                      <FormGroup label="Company Size">
                        <select
                          name="companySize"
                          value={formData.companySize}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select company size</option>
                          {FORM_OPTIONS?.companySizes?.map((size) => (
                            <option key={size.value} value={size.value}>
                              {size.label}
                            </option>
                          ))}
                        </select>
                      </FormGroup>

                      <FormGroup label="Project Location">
                        <select
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select location</option>
                          <option value="metro">
                            🏙️ Metro Cities (Mumbai, Delhi, Bangalore)
                          </option>
                          <option value="tier1">
                            🌆 Tier 1 Cities (Pune, Hyderabad, Chennai)
                          </option>
                          <option value="tier2">
                            🏘️ Tier 2 Cities (Ahmedabad, Kolkata, Jaipur)
                          </option>
                          <option value="tier3">🏡 Other Cities</option>
                          <option value="international">
                            🌍 International
                          </option>
                        </select>
                      </FormGroup>
                    </div>
                  </FormSection>
                )}

                {/* Step 2: Project Overview */}
                {currentStep === 2 && (
                  <FormSection
                    title="Project Overview"
                    icon="fas fa-project-diagram"
                    description="Define your project scope and objectives"
                    stepNumber={2}
                    isRequired={true}
                  >
                    <div className="form-grid">
                      <FormGroup
                        label="Project Title"
                        required
                        error={validationErrors.projectTitle}
                      >
                        <input
                          type="text"
                          name="projectTitle"
                          value={formData.projectTitle}
                          onChange={handleInputChange}
                          placeholder="e.g., AI-Powered E-commerce Platform for Fashion Brand"
                          className={
                            validationErrors.projectTitle ? "error" : ""
                          }
                        />
                        {/* {renderFieldError("projectTitle")} */}
                      </FormGroup>

                      <FormGroup
                        label="Project Type"
                        required
                        error={validationErrors.projectType}
                      >
                        <select
                          name="projectType"
                          value={formData.projectType}
                          onChange={handleInputChange}
                          className={`enhanced-single-select ${
                            validationErrors.projectType ? "error" : ""
                          }`}
                        >
                          <option value="">Select project type</option>
                          {FORM_OPTIONS?.projectTypes?.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {/* {renderFieldError("projectType")} */}
                      </FormGroup>

                      <FormGroup label="Project Budget Flexibility">
                        <select
                          name="projectBudget"
                          value={formData.projectBudget}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select budget flexibility</option>
                          <option value="limited">
                            💰 Limited Budget (Cost-focused)
                          </option>
                          <option value="moderate">
                            💵 Moderate Budget (Balanced)
                          </option>
                          <option value="flexible">
                            💎 Flexible Budget (Quality-focused)
                          </option>
                          <option value="premium">
                            👑 Premium Budget (Best-in-class)
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Expected User Base">
                        <select
                          name="expectedUsers"
                          value={formData.expectedUsers}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select expected user base</option>
                          <option value="1-100">
                            👥 1-100 users (Small scale)
                          </option>
                          <option value="101-1000">
                            👥 101-1,000 users (Medium scale)
                          </option>
                          <option value="1001-10000">
                            👥 1,001-10,000 users (Large scale)
                          </option>
                          <option value="10001-100000">
                            👥 10,001-100,000 users (Enterprise)
                          </option>
                          <option value="100000+">
                            👥 100,000+ users (Global platform)
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Primary Region">
                        <select
                          name="region"
                          value={formData.region}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select primary region</option>
                          <option value="northAmerica">🇺🇸 North America</option>
                          <option value="europe">🇪🇺 Europe</option>
                          <option value="asia">🇦🇸 Asia Pacific</option>
                          <option value="india">🇮🇳 India</option>
                          <option value="middleEast">🇦🇪 Middle East</option>
                          <option value="africa">🇿🇦 Africa</option>
                          <option value="southAmerica">🇧🇷 South America</option>
                          <option value="oceania">🇦🇺 Oceania</option>
                        </select>
                      </FormGroup>

                      {/* <FormGroup label="Global Deployment">
                        <div className="checkbox-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              name="globalDeployment"
                              checked={formData.globalDeployment}
                              onChange={handleInputChange}
                            />
                            <span className="checkmark"></span>
                            Multi-region deployment required
                          </label>
                        </div>
                      </FormGroup> */}

                      <FormGroup label="Project Goal">
                        <textarea
                          name="projectGoal"
                          value={formData.projectGoal}
                          onChange={handleInputChange}
                          rows="4"
                          placeholder="Describe your project goals, business objectives, and expected outcomes..."
                        />
                      </FormGroup>

                      <FormGroup label="Target Audience">
                        <textarea
                          name="targetAudience"
                          value={formData.targetAudience}
                          onChange={handleInputChange}
                          rows="3"
                          placeholder="Describe your target audience, user personas, and market demographics..."
                        />
                      </FormGroup>

                      <FormGroup label="Budget Range">
                        <select
                          name="budgetRange"
                          value={formData.budgetRange}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select budget range</option>
                          {FORM_OPTIONS?.budgetRanges?.map((budget) => (
                            <option key={budget.value} value={budget.value}>
                              {budget.label}
                            </option>
                          ))}
                        </select>
                      </FormGroup>

                      <FormGroup
                        label="Timeline"
                        required
                        error={validationErrors.timeline}
                      >
                        <select
                          name="timeline"
                          value={formData.timeline}
                          onChange={handleInputChange}
                          className={`enhanced-single-select ${
                            validationErrors.timeline ? "error" : ""
                          }`}
                        >
                          <option value="">Select timeline</option>
                          {FORM_OPTIONS?.timelines?.map((time) => (
                            <option key={time.value} value={time.value}>
                              {time.label}
                            </option>
                          ))}
                        </select>
                        {/* {renderFieldError("timeline")} */}
                      </FormGroup>
                    </div>
                  </FormSection>
                )}

                {/* Step 3: Technical Requirements */}
                {currentStep === 3 && (
                  <FormSection
                    title="Technical Requirements"
                    icon="fas fa-code"
                    description="Specify technical specifications and requirements"
                    stepNumber={3}
                    isRequired={true}
                  >
                    <div className="form-grid">
                      <FormGroup
                        label="Number of Pages/Screens"
                        required
                        error={validationErrors.numberOfPages}
                      >
                        <select
                          name="numberOfPages"
                          value={formData.numberOfPages}
                          onChange={handleInputChange}
                          className={`enhanced-single-select ${
                            validationErrors.numberOfPages ? "error" : ""
                          }`}
                        >
                          <option value="">Select page count</option>
                          <option value="1-5">📄 1-5 Pages</option>
                          <option value="6-10">📊 6-10 Pages</option>
                          <option value="11-20">📚 11-20 Pages</option>
                          <option value="21-50">📖 21-50 Pages</option>
                          <option value="51-100">📚 51-100 Pages</option>
                          <option value="100+">📚 100+ Pages</option>
                        </select>
                        {/* {renderFieldError("numberOfPages")} */}
                      </FormGroup>

                      <FormGroup label="Expected Traffic">
                        <select
                          name="expectedTraffic"
                          value={formData.expectedTraffic}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select expected traffic</option>
                          <option value="low">
                            🐌 Low (Under 1,000 visitors/month)
                          </option>
                          <option value="medium">
                            🚶 Medium (1,000 - 10,000 visitors/month)
                          </option>
                          <option value="high">
                            🏃 High (10,000 - 100,000 visitors/month)
                          </option>
                          <option value="very_high">
                            🚀 Very High (100,000 - 1M visitors/month)
                          </option>
                          <option value="enterprise">
                            🌐 Enterprise (1M+ visitors/month)
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Performance Requirements">
                        <select
                          name="performanceRequirements"
                          value={formData.performanceRequirements}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select performance level</option>
                          <option value="basic">
                            ⚡ Basic Performance (Standard loading)
                          </option>
                          <option value="optimized">
                            🚀 Optimized Performance (Fast loading)
                          </option>
                          <option value="high_performance">
                            ⚡ High Performance (Very fast loading)
                          </option>
                          <option value="enterprise">
                            🏆 Enterprise Performance (Ultra-fast loading)
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup
                        label="Device Support"
                        required
                        error={validationErrors.deviceSupport}
                      >
                        <MultiSelectDropdown
                          name="deviceSupport"
                          value={formData.deviceSupport}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "desktop",
                              label: "💻 Desktop",
                              icon: "fas fa-desktop",
                            },
                            {
                              value: "tablet",
                              label: "📱 Tablet",
                              icon: "fas fa-tablet-alt",
                            },
                            {
                              value: "mobile",
                              label: "📱 Mobile",
                              icon: "fas fa-mobile-alt",
                            },
                            {
                              value: "smartwatch",
                              label: "⌚ Smartwatch",
                              icon: "fas fa-clock",
                            },
                            {
                              value: "tv",
                              label: "📺 Smart TV",
                              icon: "fas fa-tv",
                            },
                          ]}
                          placeholder="Select supported devices"
                        />
                        {/* {renderFieldError("deviceSupport")} */}
                      </FormGroup>

                      <FormGroup label="Browser Support">
                        <MultiSelectDropdown
                          name="browserSupport"
                          value={formData.browserSupport}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "chrome",
                              label: "🌐 Google Chrome",
                              icon: "fab fa-chrome",
                            },
                            {
                              value: "firefox",
                              label: "🦊 Mozilla Firefox",
                              icon: "fab fa-firefox",
                            },
                            {
                              value: "safari",
                              label: "🧭 Safari",
                              icon: "fab fa-safari",
                            },
                            {
                              value: "edge",
                              label: "🔷 Microsoft Edge",
                              icon: "fab fa-edge",
                            },
                            {
                              value: "opera",
                              label: "🎭 Opera",
                              icon: "fab fa-opera",
                            },
                            {
                              value: "internet_explorer",
                              label: "📜 Internet Explorer",
                              icon: "fab fa-internet-explorer",
                            },
                          ]}
                          placeholder="Select supported browsers"
                        />
                      </FormGroup>
                    </div>
                  </FormSection>
                )}

                {/* Step 4: Design Requirements */}
                {currentStep === 4 && (
                  <FormSection
                    title="Design Requirements"
                    icon="fas fa-palette"
                    description="Define your design preferences and branding needs"
                    stepNumber={4}
                    isRequired={true}
                  >
                    <div className="form-grid">
                      <FormGroup
                        label="Design Type"
                        required
                        error={validationErrors.designType}
                      >
                        <select
                          name="designType"
                          value={formData.designType}
                          onChange={handleInputChange}
                          className={`enhanced-single-select ${
                            validationErrors.designType ? "error" : ""
                          }`}
                        >
                          <option value="">Select design type</option>
                          <option value="template">
                            📋 Template Based (Cost-effective)
                          </option>
                          <option value="custom">
                            🎨 Custom Design (Tailored)
                          </option>
                          <option value="premium">
                            💎 Premium Custom (Unique)
                          </option>
                          <option value="enterprise">
                            👑 Enterprise Grade (Advanced)
                          </option>
                        </select>
                        {/* {renderFieldError("designType")} */}
                      </FormGroup>

                      <FormGroup label="Design Preference">
                        <select
                          name="designPreference"
                          value={formData.designPreference}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select design style</option>
                          <option value="modern_minimalist">
                            ✨ Modern & Minimalist
                          </option>
                          <option value="corporate_professional">
                            💼 Corporate & Professional
                          </option>
                          <option value="creative_artistic">
                            🎭 Creative & Artistic
                          </option>
                          <option value="tech_innovative">
                            🚀 Tech & Innovative
                          </option>
                          <option value="classic_elegant">
                            👑 Classic & Elegant
                          </option>
                          <option value="bold_colorful">
                            🌈 Bold & Colorful
                          </option>
                          <option value="dark_theme">🌙 Dark Theme</option>
                          <option value="material_design">
                            📱 Material Design
                          </option>
                          <option value="flat_design">⬜ Flat Design</option>
                          <option value="gradient_modern">
                            🌊 Gradient Modern
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Brand Guidelines Available?">
                        <select
                          name="brandGuidelines"
                          value={formData.brandGuidelines}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select option</option>
                          <option value="complete">
                            ✅ Complete brand guidelines available
                          </option>
                          <option value="partial">
                            ⚠️ Partial brand guidelines available
                          </option>
                          <option value="none">
                            ❌ No brand guidelines (need to create)
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Logo Design Required?">
                        <select
                          name="logoDesign"
                          value={formData.logoDesign}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select option</option>
                          <option value="no">✅ No, I have a logo</option>
                          <option value="redesign">
                            🔄 Logo redesign/refresh
                          </option>
                          <option value="new">✨ New logo design</option>
                          <option value="complete_identity">
                            🎨 Complete brand identity
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Design Revisions">
                        <select
                          name="designRevisions"
                          value={formData.designRevisions}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select revision rounds</option>
                          <option value="2">2️⃣ 2 Revision Rounds</option>
                          <option value="3">3️⃣ 3 Revision Rounds</option>
                          <option value="5">5️⃣ 5 Revision Rounds</option>
                          <option value="unlimited">
                            ♾️ Unlimited Revisions
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Color Scheme Preference">
                        <select
                          name="colorScheme"
                          value={formData.colorScheme}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select color preference</option>
                          <option value="existing">
                            🎨 Use existing brand colors
                          </option>
                          <option value="modern">✨ Modern & Trendy</option>
                          <option value="professional">
                            💼 Professional & Corporate
                          </option>
                          <option value="vibrant">
                            🌈 Vibrant & Energetic
                          </option>
                          <option value="minimal">⚪ Minimal & Clean</option>
                          <option value="warm">🔥 Warm & Friendly</option>
                          <option value="cool">❄️ Cool & Calming</option>
                          <option value="monochrome">
                            ⚫ Monochrome & Sophisticated
                          </option>
                          <option value="custom">
                            🎯 Custom color consultation
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Layout Preference">
                        <select
                          name="layoutPreference"
                          value={formData.layoutPreference}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select layout style</option>
                          <option value="single_page">
                            📄 Single Page Design
                          </option>
                          <option value="multi_page">
                            📚 Multi-Page Layout
                          </option>
                          <option value="sidebar">📌 Sidebar Navigation</option>
                          <option value="header_footer">
                            🗂️ Header/Footer Navigation
                          </option>
                          <option value="mega_menu">🗃️ Mega Menu Style</option>
                          <option value="hamburger_menu">
                            🍔 Hamburger Menu
                          </option>
                          <option value="card_layout">
                            🃏 Card-based Layout
                          </option>
                          <option value="grid_layout">⚏ Grid Layout</option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Visual Elements Needed">
                        <MultiSelectDropdown
                          name="visualElements"
                          value={formData.visualElements}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "icons",
                              label: "🎯 Custom Icons",
                              icon: "fas fa-icons",
                            },
                            {
                              value: "illustrations",
                              label: "🎨 Custom Illustrations",
                              icon: "fas fa-paint-brush",
                            },
                            {
                              value: "photography",
                              label: "📸 Professional Photography",
                              icon: "fas fa-camera",
                            },
                            {
                              value: "videos",
                              label: "🎬 Video Content",
                              icon: "fas fa-video",
                            },
                            {
                              value: "animations",
                              label: "✨ Animations & Micro-interactions",
                              icon: "fas fa-magic",
                            },
                            {
                              value: "infographics",
                              label: "📊 Infographics & Data Visualization",
                              icon: "fas fa-chart-bar",
                            },
                          ]}
                          placeholder="Select visual elements needed"
                        />
                      </FormGroup>

                      <FormGroup label="Typography Preference">
                        <select
                          name="typographyPreference"
                          value={formData.typographyPreference}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select typography style</option>
                          <option value="modern">🆕 Modern Sans-serif</option>
                          <option value="classic">📜 Classic Serif</option>
                          <option value="minimal">⚪ Minimal & Clean</option>
                          <option value="bold">💪 Bold & Impactful</option>
                          <option value="elegant">
                            👑 Elegant & Sophisticated
                          </option>
                          <option value="playful">🎈 Playful & Creative</option>
                          <option value="technical">
                            🔧 Technical & Systematic
                          </option>
                          <option value="handwritten">
                            ✍️ Handwritten & Personal
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Accessibility Requirements">
                        <select
                          name="accessibilityRequirements"
                          value={formData.accessibilityRequirements}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select accessibility level</option>
                          <option value="basic">♿ Basic Accessibility</option>
                          <option value="wcag_aa">
                            🏅 WCAG 2.1 AA Compliance
                          </option>
                          <option value="wcag_aaa">
                            🥇 WCAG 2.1 AAA Compliance
                          </option>
                          <option value="section_508">
                            🏛️ Section 508 Compliance
                          </option>
                          <option value="comprehensive">
                            🌟 Comprehensive Accessibility
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Design Mockup Requirements">
                        <select
                          name="mockupRequirements"
                          value={formData.mockupRequirements}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select mockup level</option>
                          <option value="wireframes">📐 Wireframes Only</option>
                          <option value="low_fidelity">
                            📝 Low Fidelity Mockups
                          </option>
                          <option value="high_fidelity">
                            🎨 High Fidelity Mockups
                          </option>
                          <option value="interactive_prototype">
                            🖱️ Interactive Prototype
                          </option>
                          <option value="design_system">
                            🗂️ Complete Design System
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Design Inspiration">
                        <textarea
                          name="designInspiration"
                          value={formData.designInspiration}
                          onChange={handleInputChange}
                          rows="3"
                          placeholder="Share any design inspiration, reference websites, or specific design elements you like..."
                        />
                      </FormGroup>
                    </div>
                  </FormSection>
                )}

                {/* Step 5: Technology Stack */}
                {currentStep === 5 && (
                  <FormSection
                    title="Technology Stack"
                    icon="fas fa-layer-group"
                    description="Choose your preferred technologies and platforms"
                    stepNumber={5}
                  >
                    <div className="form-grid">
                      <FormGroup label="Programming Languages">
                        <MultiSelectDropdown
                          name="programmingLanguage"
                          value={formData.programmingLanguage}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "javascript",
                              label: "🟨 JavaScript",
                              icon: "fab fa-js-square",
                            },
                            {
                              value: "typescript",
                              label: "🔷 TypeScript",
                              icon: "fab fa-js-square",
                            },
                            {
                              value: "python",
                              label: "🐍 Python",
                              icon: "fab fa-python",
                            },
                            {
                              value: "java",
                              label: "☕ Java",
                              icon: "fab fa-java",
                            },
                            {
                              value: "csharp",
                              label: "💜 C#",
                              icon: "fab fa-microsoft",
                            },
                            {
                              value: "php",
                              label: "🐘 PHP",
                              icon: "fab fa-php",
                            },
                            {
                              value: "ruby",
                              label: "💎 Ruby",
                              icon: "fab fa-gem",
                            },
                            {
                              value: "go",
                              label: "🔵 Go (Golang)",
                              icon: "fas fa-code",
                            },
                            {
                              value: "rust",
                              label: "🦀 Rust",
                              icon: "fas fa-code",
                            },
                            {
                              value: "kotlin",
                              label: "🟠 Kotlin",
                              icon: "fas fa-code",
                            },
                            {
                              value: "swift",
                              label: "🍎 Swift",
                              icon: "fab fa-apple",
                            },
                            {
                              value: "dart",
                              label: "🎯 Dart",
                              icon: "fas fa-code",
                            },
                          ]}
                          placeholder="Select programming languages"
                        />
                      </FormGroup>

                      <FormGroup label="Frontend Frameworks">
                        <MultiSelectDropdown
                          name="frontendFramework"
                          value={formData.frontendFramework}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "react",
                              label: "⚛️ React.js",
                              icon: "fab fa-react",
                            },
                            {
                              value: "vue",
                              label: "💚 Vue.js",
                              icon: "fab fa-vuejs",
                            },
                            {
                              value: "angular",
                              label: "🔴 Angular",
                              icon: "fab fa-angular",
                            },
                            {
                              value: "svelte",
                              label: "🧡 Svelte",
                              icon: "fas fa-code",
                            },
                            {
                              value: "nextjs",
                              label: "⚫ Next.js",
                              icon: "fas fa-code",
                            },
                            {
                              value: "nuxtjs",
                              label: "💚 Nuxt.js",
                              icon: "fab fa-vuejs",
                            },
                            {
                              value: "gatsby",
                              label: "🟣 Gatsby",
                              icon: "fas fa-code",
                            },
                            {
                              value: "vanilla",
                              label: "🍦 Vanilla JavaScript",
                              icon: "fab fa-js-square",
                            },
                            {
                              value: "jquery",
                              label: "💙 jQuery",
                              icon: "fas fa-code",
                            },
                            {
                              value: "alpine",
                              label: "🏔️ Alpine.js",
                              icon: "fas fa-code",
                            },
                            {
                              value: "ember",
                              label: "🔥 Ember.js",
                              icon: "fas fa-code",
                            },
                            {
                              value: "backbone",
                              label: "🦴 Backbone.js",
                              icon: "fas fa-code",
                            },
                          ]}
                          placeholder="Select frontend frameworks"
                        />
                      </FormGroup>

                      <FormGroup label="Backend Frameworks">
                        <MultiSelectDropdown
                          name="backendFramework"
                          value={formData.backendFramework}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "nodejs",
                              label: "🟢 Node.js",
                              icon: "fab fa-node-js",
                            },
                            {
                              value: "express",
                              label: "⚡ Express.js",
                              icon: "fas fa-server",
                            },
                            {
                              value: "nestjs",
                              label: "🔴 NestJS",
                              icon: "fas fa-server",
                            },
                            {
                              value: "django",
                              label: "🐍 Django",
                              icon: "fab fa-python",
                            },
                            {
                              value: "flask",
                              label: "🔥 Flask",
                              icon: "fab fa-python",
                            },
                            {
                              value: "fastapi",
                              label: "⚡ FastAPI",
                              icon: "fab fa-python",
                            },
                            {
                              value: "laravel",
                              label: "🔴 Laravel",
                              icon: "fab fa-php",
                            },
                            {
                              value: "symfony",
                              label: "🎵 Symfony",
                              icon: "fab fa-php",
                            },
                            {
                              value: "spring",
                              label: "🌱 Spring Boot",
                              icon: "fab fa-java",
                            },
                            {
                              value: "dotnet",
                              label: "💜 ASP.NET Core",
                              icon: "fab fa-microsoft",
                            },
                            {
                              value: "rails",
                              label: "💎 Ruby on Rails",
                              icon: "fab fa-gem",
                            },
                            {
                              value: "gin",
                              label: "🍸 Gin (Go)",
                              icon: "fas fa-code",
                            },
                            {
                              value: "fiber",
                              label: "🚀 Fiber (Go)",
                              icon: "fas fa-code",
                            },
                          ]}
                          placeholder="Select backend frameworks"
                        />
                      </FormGroup>

                      <FormGroup label="Database Systems">
                        <MultiSelectDropdown
                          name="databaseType"
                          value={formData.databaseType}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "mysql",
                              label: "🐬 MySQL",
                              icon: "fas fa-database",
                            },
                            {
                              value: "postgresql",
                              label: "🐘 PostgreSQL",
                              icon: "fas fa-database",
                            },
                            {
                              value: "mongodb",
                              label: "🍃 MongoDB",
                              icon: "fas fa-leaf",
                            },
                            {
                              value: "sqlite",
                              label: "📱 SQLite",
                              icon: "fas fa-database",
                            },
                            {
                              value: "redis",
                              label: "🔴 Redis",
                              icon: "fas fa-memory",
                            },
                            {
                              value: "cassandra",
                              label: "🏛️ Cassandra",
                              icon: "fas fa-database",
                            },
                            {
                              value: "elasticsearch",
                              label: "🔍 Elasticsearch",
                              icon: "fas fa-search",
                            },
                            {
                              value: "firebase",
                              label: "🔥 Firebase Firestore",
                              icon: "fab fa-google",
                            },
                            {
                              value: "supabase",
                              label: "⚡ Supabase",
                              icon: "fas fa-database",
                            },
                            {
                              value: "dynamodb",
                              label: "⚡ DynamoDB",
                              icon: "fab fa-aws",
                            },
                            {
                              value: "couchdb",
                              label: "🛋️ CouchDB",
                              icon: "fas fa-database",
                            },
                            {
                              value: "mariadb",
                              label: "🗃️ MariaDB",
                              icon: "fas fa-database",
                            },
                          ]}
                          placeholder="Select database systems"
                        />
                      </FormGroup>

                      <FormGroup label="Cloud Provider">
                        <select
                          name="cloudProvider"
                          value={formData.cloudProvider}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select cloud provider</option>
                          <option value="aws">
                            ☁️ Amazon Web Services (AWS)
                          </option>
                          <option value="azure">🔷 Microsoft Azure</option>
                          <option value="gcp">🌈 Google Cloud Platform</option>
                          <option value="digitalocean">🌊 DigitalOcean</option>
                          <option value="vultr">⚡ Vultr</option>
                          <option value="linode">🟢 Linode</option>
                          <option value="heroku">💜 Heroku</option>
                          <option value="railway">🚂 Railway</option>
                          <option value="render">🎨 Render</option>
                          <option value="fly">🪰 Fly.io</option>
                          <option value="cloudflare">🟠 Cloudflare</option>
                          <option value="oracle">🔴 Oracle Cloud</option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Deployment Method">
                        <select
                          name="deploymentMethod"
                          value={formData.deploymentMethod}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select deployment method</option>
                          <option value="traditional">
                            🏠 Traditional Hosting
                          </option>
                          <option value="containerized">
                            🐳 Containerized (Docker)
                          </option>
                          <option value="serverless">
                            ⚡ Serverless Functions
                          </option>
                          <option value="static">📄 Static Site Hosting</option>
                          <option value="jamstack">
                            🥞 JAMstack Deployment
                          </option>
                          <option value="kubernetes">
                            ☸️ Kubernetes Orchestration
                          </option>
                          <option value="microservices">
                            🔗 Microservices Architecture
                          </option>
                          <option value="edge">🌐 Edge Computing</option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Version Control">
                        <select
                          name="versionControl"
                          value={formData.versionControl}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select version control</option>
                          <option value="git">📁 Git</option>
                          <option value="github">😺 GitHub</option>
                          <option value="gitlab">🦊 GitLab</option>
                          <option value="bitbucket">🪣 Bitbucket</option>
                          <option value="azure_devops">🔷 Azure DevOps</option>
                          <option value="codecommit">☁️ AWS CodeCommit</option>
                          <option value="svn">📚 SVN</option>
                        </select>
                      </FormGroup>

                      <FormGroup label="API Architecture">
                        <select
                          name="apiArchitecture"
                          value={formData.apiArchitecture}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select API architecture</option>
                          <option value="rest">🔄 REST API</option>
                          <option value="graphql">📊 GraphQL</option>
                          <option value="grpc">⚡ gRPC</option>
                          <option value="soap">🧼 SOAP</option>
                          <option value="websocket">🔌 WebSocket</option>
                          <option value="sse">📡 Server-Sent Events</option>
                          <option value="webhook">🪝 Webhooks</option>
                          <option value="microservices">
                            🔗 Microservices API
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Development Tools">
                        <select
                          name="developmentTools"
                          value={formData.developmentTools}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select development tools</option>
                          <option value="vscode">📝 VS Code</option>
                          <option value="webstorm">🧠 WebStorm</option>
                          <option value="vim">⌨️ Vim/Neovim</option>
                          <option value="sublime">✨ Sublime Text</option>
                          <option value="atom">⚛️ Atom</option>
                          <option value="brackets">🔲 Brackets</option>
                          <option value="intellij">💡 IntelliJ IDEA</option>
                          <option value="eclipse">🌙 Eclipse</option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Testing Frameworks">
                        <MultiSelectDropdown
                          name="testingFramework"
                          value={formData.testingFramework}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "jest",
                              label: "🃏 Jest",
                              icon: "fas fa-vial",
                            },
                            {
                              value: "mocha",
                              label: "☕ Mocha",
                              icon: "fas fa-vial",
                            },
                            {
                              value: "jasmine",
                              label: "🌸 Jasmine",
                              icon: "fas fa-vial",
                            },
                            {
                              value: "cypress",
                              label: "🌲 Cypress",
                              icon: "fas fa-vial",
                            },
                            {
                              value: "playwright",
                              label: "🎭 Playwright",
                              icon: "fas fa-vial",
                            },
                            {
                              value: "selenium",
                              label: "🔬 Selenium",
                              icon: "fas fa-vial",
                            },
                            {
                              value: "testcafe",
                              label: "☕ TestCafe",
                              icon: "fas fa-vial",
                            },
                            {
                              value: "puppeteer",
                              label: "🎪 Puppeteer",
                              icon: "fas fa-vial",
                            },
                            {
                              value: "junit",
                              label: "☕ JUnit",
                              icon: "fas fa-vial",
                            },
                            {
                              value: "pytest",
                              label: "🐍 PyTest",
                              icon: "fas fa-vial",
                            },
                          ]}
                          placeholder="Select testing frameworks"
                        />
                      </FormGroup>

                      <FormGroup label="Monitoring Tools">
                        <MultiSelectDropdown
                          name="monitoringTools"
                          value={formData.monitoringTools}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "sentry",
                              label: "🛡️ Sentry",
                              icon: "fas fa-shield-alt",
                            },
                            {
                              value: "datadog",
                              label: "🐕 Datadog",
                              icon: "fas fa-chart-line",
                            },
                            {
                              value: "newrelic",
                              label: "📊 New Relic",
                              icon: "fas fa-chart-bar",
                            },
                            {
                              value: "splunk",
                              label: "🔍 Splunk",
                              icon: "fas fa-search",
                            },
                            {
                              value: "logz",
                              label: "📝 Logz.io",
                              icon: "fas fa-file-alt",
                            },
                            {
                              value: "mixpanel",
                              label: "📈 Mixpanel",
                              icon: "fas fa-analytics",
                            },
                            {
                              value: "amplitude",
                              label: "📊 Amplitude",
                              icon: "fas fa-wave-square",
                            },
                            {
                              value: "bugsnag",
                              label: "🐛 Bugsnag",
                              icon: "fas fa-bug",
                            },
                            {
                              value: "rollbar",
                              label: "🎯 Rollbar",
                              icon: "fas fa-target",
                            },
                            {
                              value: "honeybadger",
                              label: "🍯 Honeybadger",
                              icon: "fas fa-shield-alt",
                            },
                          ]}
                          placeholder="Select monitoring tools"
                        />
                      </FormGroup>

                      <FormGroup label="Security Tools">
                        <MultiSelectDropdown
                          name="securityTools"
                          value={formData.securityTools}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "snyk",
                              label: "🔒 Snyk",
                              icon: "fas fa-lock",
                            },
                            {
                              value: "sonarqube",
                              label: "🔍 SonarQube",
                              icon: "fas fa-search",
                            },
                            {
                              value: "checkmarx",
                              label: "✅ Checkmarx",
                              icon: "fas fa-check-shield",
                            },
                            {
                              value: "veracode",
                              label: "🛡️ Veracode",
                              icon: "fas fa-shield-alt",
                            },
                            {
                              value: "owasp",
                              label: "🔓 OWASP ZAP",
                              icon: "fas fa-shield-alt",
                            },
                            {
                              value: "nessus",
                              label: "🔍 Nessus",
                              icon: "fas fa-search-plus",
                            },
                            {
                              value: "qualys",
                              label: "🏅 Qualys",
                              icon: "fas fa-medal",
                            },
                            {
                              value: "fortify",
                              label: "🏰 Fortify",
                              icon: "fas fa-castle",
                            },
                            {
                              value: "whitesource",
                              label: "⚪ WhiteSource",
                              icon: "fas fa-shield",
                            },
                            {
                              value: "blackduck",
                              label: "🦆 Black Duck",
                              icon: "fas fa-shield-virus",
                            },
                          ]}
                          placeholder="Select security tools"
                        />
                      </FormGroup>
                    </div>
                  </FormSection>
                )}

                {/* Step 6: Features & Functionality */}
                {currentStep === 6 && (
                  <FormSection
                    title="Features & Functionality"
                    icon="fas fa-cogs"
                    description="Select the features you need for your project"
                    stepNumber={6}
                    isRequired={true}
                  >
                    <div className="form-grid">
                      <FormGroup
                        label="Core Features"
                        required
                        error={validationErrors.coreFeatures}
                      >
                        <MultiSelectDropdown
                          name="coreFeatures"
                          value={formData.coreFeatures}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "user_authentication",
                              label: "🔐 User Authentication & Registration",
                              icon: "fas fa-lock",
                            },
                            {
                              value: "content_management",
                              label: "📝 Content Management System",
                              icon: "fas fa-edit",
                            },
                            {
                              value: "search_functionality",
                              label: "🔍 Search & Filter System",
                              icon: "fas fa-search",
                            },
                            {
                              value: "contact_forms",
                              label: "📧 Contact Forms & Communication",
                              icon: "fas fa-envelope",
                            },
                            {
                              value: "file_management",
                              label: "📁 File Upload & Management",
                              icon: "fas fa-folder",
                            },
                            {
                              value: "user_dashboard",
                              label: "📊 User Dashboard & Profiles",
                              icon: "fas fa-tachometer-alt",
                            },
                            {
                              value: "admin_panel",
                              label: "⚙️ Admin Panel & Controls",
                              icon: "fas fa-cogs",
                            },
                            {
                              value: "basic_ecommerce",
                              label: "🛒 Basic E-commerce Features",
                              icon: "fas fa-shopping-cart",
                            },
                          ]}
                          placeholder="Select core features (required)"
                        />
                        {/* {renderFieldError("coreFeatures")} */}
                      </FormGroup>

                      <FormGroup label="Advanced Features">
                        <MultiSelectDropdown
                          name="advancedFeatures"
                          value={formData.advancedFeatures}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "real_time_chat",
                              label: "💬 Real-time Chat & Messaging",
                              icon: "fas fa-comments",
                            },
                            {
                              value: "video_calling",
                              label: "📹 Video Calling & Conferencing",
                              icon: "fas fa-video",
                            },
                            {
                              value: "push_notifications",
                              label: "🔔 Push Notifications System",
                              icon: "fas fa-bell",
                            },
                            {
                              value: "api_integrations",
                              label: "🔗 Third-party API Integrations",
                              icon: "fas fa-plug",
                            },
                            {
                              value: "workflow_automation",
                              label: "🤖 Workflow Automation",
                              icon: "fas fa-robot",
                            },
                            {
                              value: "advanced_analytics",
                              label: "📈 Advanced Analytics & Reporting",
                              icon: "fas fa-chart-line",
                            },
                            {
                              value: "ai_ml_features",
                              label: "🧠 AI/ML Features & Chatbots",
                              icon: "fas fa-brain",
                            },
                            {
                              value: "blockchain_integration",
                              label: "⛓️ Blockchain Integration",
                              icon: "fas fa-link",
                            },
                          ]}
                          placeholder="Select advanced features"
                        />
                      </FormGroup>

                      <FormGroup label="E-commerce Features">
                        <MultiSelectDropdown
                          name="ecommerceFeatures"
                          value={formData.ecommerceFeatures}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "product_catalog",
                              label: "📦 Product Catalog & Management",
                              icon: "fas fa-box",
                            },
                            {
                              value: "shopping_cart",
                              label: "🛒 Shopping Cart & Checkout",
                              icon: "fas fa-shopping-cart",
                            },
                            {
                              value: "payment_processing",
                              label: "💳 Payment Gateway Integration",
                              icon: "fas fa-credit-card",
                            },
                            {
                              value: "inventory_management",
                              label: "📊 Inventory Management System",
                              icon: "fas fa-warehouse",
                            },
                            {
                              value: "order_management",
                              label: "📋 Order Processing & Tracking",
                              icon: "fas fa-clipboard-list",
                            },
                            {
                              value: "multi_vendor",
                              label: "🏪 Multi-vendor Marketplace",
                              icon: "fas fa-store-alt",
                            },
                            {
                              value: "subscription_billing",
                              label: "🔄 Subscription & Recurring Billing",
                              icon: "fas fa-sync-alt",
                            },
                            {
                              value: "advanced_ecommerce",
                              label: "🎯 Advanced E-commerce Suite",
                              icon: "fas fa-bullseye",
                            },
                          ]}
                          placeholder="Select e-commerce features"
                        />
                      </FormGroup>

                      <FormGroup label="Analytics Features">
                        <MultiSelectDropdown
                          name="analyticsFeatures"
                          value={formData.analyticsFeatures}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "basic_analytics",
                              label: "📊 Basic Analytics (Google Analytics)",
                              icon: "fas fa-chart-pie",
                            },
                            {
                              value: "custom_dashboard",
                              label: "📈 Custom Analytics Dashboard",
                              icon: "fas fa-chart-line",
                            },
                            {
                              value: "user_behavior",
                              label: "👥 User Behavior Analysis",
                              icon: "fas fa-users",
                            },
                            {
                              value: "conversion_tracking",
                              label: "🎯 Conversion Tracking & Goals",
                              icon: "fas fa-target",
                            },
                            {
                              value: "ab_testing",
                              label: "🧪 A/B Testing Platform",
                              icon: "fas fa-flask",
                            },
                            {
                              value: "heatmaps",
                              label: "🔥 Heatmaps & User Sessions",
                              icon: "fas fa-fire",
                            },
                            {
                              value: "business_intelligence",
                              label: "📊 Business Intelligence Suite",
                              icon: "fas fa-chart-bar",
                            },
                            {
                              value: "predictive_analytics",
                              label: "🔮 Predictive Analytics",
                              icon: "fas fa-crystal-ball",
                            },
                          ]}
                          placeholder="Select analytics features"
                        />
                      </FormGroup>

                      <FormGroup label="Mobile Features">
                        <MultiSelectDropdown
                          name="mobileFeatures"
                          value={formData.mobileFeatures}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "responsive_design",
                              label: "📱 Responsive Web Design",
                              icon: "fas fa-mobile-alt",
                            },
                            {
                              value: "pwa",
                              label: "📲 Progressive Web App (PWA)",
                              icon: "fas fa-download",
                            },
                            {
                              value: "mobile_app",
                              label: "📱 Native Mobile App",
                              icon: "fas fa-mobile",
                            },
                            {
                              value: "hybrid_app",
                              label: "🔄 Hybrid Mobile App",
                              icon: "fas fa-sync",
                            },
                            {
                              value: "offline_support",
                              label: "📴 Offline Support & Caching",
                              icon: "fas fa-wifi",
                            },
                            {
                              value: "geolocation",
                              label: "🗺️ Geolocation Services",
                              icon: "fas fa-map-marker-alt",
                            },
                            {
                              value: "camera_integration",
                              label: "📷 Camera & Media Integration",
                              icon: "fas fa-camera",
                            },
                            {
                              value: "mobile_payments",
                              label: "💳 Mobile Payment Integration",
                              icon: "fas fa-mobile-alt",
                            },
                          ]}
                          placeholder="Select mobile features"
                        />
                      </FormGroup>

                      <FormGroup label="Security Features">
                        <MultiSelectDropdown
                          name="securityFeatures"
                          value={formData.securityFeatures}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "ssl_certificate",
                              label: "🔒 SSL Certificate",
                              icon: "fas fa-certificate",
                            },
                            {
                              value: "two_factor_auth",
                              label: "🔐 Two-Factor Authentication",
                              icon: "fas fa-shield-alt",
                            },
                            {
                              value: "data_encryption",
                              label: "🛡️ Data Encryption",
                              icon: "fas fa-lock",
                            },
                            {
                              value: "backup_system",
                              label: "💾 Backup System",
                              icon: "fas fa-save",
                            },
                            {
                              value: "security_monitoring",
                              label: "👁️ Security Monitoring",
                              icon: "fas fa-eye",
                            },
                            {
                              value: "penetration_testing",
                              label: "🔍 Penetration Testing",
                              icon: "fas fa-search-plus",
                            },
                          ]}
                          placeholder="Select security features"
                        />
                      </FormGroup>
                    </div>
                  </FormSection>
                )}

                {/* Step 7: Content & Support */}
                {currentStep === 7 && (
                  <FormSection
                    title="Content & Support"
                    icon="fas fa-life-ring"
                    description="Define content requirements and support needs"
                    stepNumber={7}
                  >
                    <div className="form-grid">
                      <FormGroup label="Content Creation">
                        <select
                          name="contentProvided"
                          value={formData.contentProvided}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select content option</option>
                          <option value="client_provides">
                            ✅ I'll provide all content
                          </option>
                          <option value="partial_creation">
                            ⚠️ Partial content creation needed
                          </option>
                          <option value="full_creation">
                            📝 Full content creation needed
                          </option>
                          <option value="copywriting">
                            ✍️ Professional copywriting
                          </option>
                          <option value="content_strategy">
                            📋 Content strategy & planning
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Images & Media">
                        <select
                          name="imagesProvided"
                          value={formData.imagesProvided}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select image option</option>
                          <option value="client_provides">
                            ✅ I'll provide all images
                          </option>
                          <option value="stock_photos">
                            📸 Stock photography needed
                          </option>
                          <option value="custom_photography">
                            📷 Custom photography
                          </option>
                          <option value="graphic_design">
                            🎨 Custom graphic design
                          </option>
                          <option value="video_production">
                            🎬 Video production needed
                          </option>
                          <option value="complete_media">
                            🎭 Complete media package
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Content Management System">
                        <select
                          name="cmsType"
                          value={formData.cmsType}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select CMS type</option>
                          <option value="no_cms">❌ No CMS needed</option>
                          <option value="wordpress">📝 WordPress</option>
                          <option value="drupal">🔷 Drupal</option>
                          <option value="joomla">🟠 Joomla</option>
                          <option value="custom_cms">⚙️ Custom CMS</option>
                          <option value="headless_cms">
                            🔗 Headless CMS (Contentful, Strapi)
                          </option>
                          <option value="enterprise_cms">
                            🏢 Enterprise CMS
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Admin Dashboard">
                        <select
                          name="adminDashboard"
                          value={formData.adminDashboard}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select admin dashboard</option>
                          <option value="no_dashboard">
                            ❌ No admin dashboard
                          </option>
                          <option value="basic_dashboard">
                            📊 Basic admin dashboard
                          </option>
                          <option value="advanced_dashboard">
                            📈 Advanced admin dashboard
                          </option>
                          <option value="custom_dashboard">
                            ⚙️ Custom admin interface
                          </option>
                          <option value="multi_role_dashboard">
                            👥 Multi-role dashboard
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="User Roles & Permissions">
                        <select
                          name="userRoles"
                          value={formData.userRoles}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select user roles</option>
                          <option value="single_role">
                            👤 Single user role
                          </option>
                          <option value="basic_roles">
                            👥 Basic roles (Admin, User)
                          </option>
                          <option value="multiple_roles">
                            👥 Multiple user roles
                          </option>
                          <option value="custom_permissions">
                            ⚙️ Custom permission system
                          </option>
                          <option value="enterprise_rbac">
                            🏢 Enterprise RBAC
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Content Migration">
                        <select
                          name="contentMigration"
                          value={formData.contentMigration}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select migration needs</option>
                          <option value="no_migration">
                            ❌ No migration needed
                          </option>
                          <option value="basic_migration">
                            📦 Basic content migration
                          </option>
                          <option value="complex_migration">
                            🔄 Complex migration with restructuring
                          </option>
                          <option value="data_cleanup">
                            🧹 Data cleanup and optimization
                          </option>
                          <option value="legacy_integration">
                            🔗 Legacy system integration
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Maintenance Level">
                        <select
                          name="maintenanceLevel"
                          value={formData.maintenanceLevel}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select maintenance level</option>
                          <option value="no_maintenance">
                            ❌ No maintenance needed
                          </option>
                          <option value="basic_maintenance">
                            🔧 Basic maintenance (Updates & Security)
                          </option>
                          <option value="standard_maintenance">
                            📅 Standard maintenance (Monthly updates)
                          </option>
                          <option value="premium_maintenance">
                            ⭐ Premium maintenance (Weekly updates)
                          </option>
                          <option value="enterprise_maintenance">
                            👑 Enterprise maintenance (24/7 support)
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Support Level">
                        <select
                          name="supportLevel"
                          value={formData.supportLevel}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select support level</option>
                          <option value="no_support">
                            ❌ No ongoing support
                          </option>
                          <option value="basic_support">
                            📧 Basic support (Email only)
                          </option>
                          <option value="standard_support">
                            📞 Standard support (Email + Phone)
                          </option>
                          <option value="premium_support">
                            ⭐ Premium support (Priority response)
                          </option>
                          <option value="enterprise_support">
                            👑 Enterprise support (24/7 dedicated)
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Training Required">
                        <select
                          name="trainingRequired"
                          value={formData.trainingRequired}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select training option</option>
                          <option value="no_training">
                            ❌ No training needed
                          </option>
                          <option value="basic_training">
                            📚 Basic training session
                          </option>
                          <option value="comprehensive_training">
                            🎓 Comprehensive training
                          </option>
                          <option value="ongoing_training">
                            🔄 Ongoing training support
                          </option>
                          <option value="custom_training">
                            ⚙️ Custom training program
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Documentation Level">
                        <select
                          name="documentationLevel"
                          value={formData.documentationLevel}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select documentation level</option>
                          <option value="basic_docs">
                            📄 Basic documentation
                          </option>
                          <option value="detailed_docs">
                            📚 Detailed documentation
                          </option>
                          <option value="video_tutorials">
                            🎥 Video tutorials included
                          </option>
                          <option value="comprehensive_guide">
                            📖 Comprehensive user guide
                          </option>
                          <option value="enterprise_docs">
                            🏢 Enterprise documentation suite
                          </option>
                        </select>
                      </FormGroup>
                    </div>
                  </FormSection>
                )}

                {/* Step 8: Additional Requirements */}
                {currentStep === 8 && (
                  <FormSection
                    title="Additional Requirements"
                    icon="fas fa-clipboard-check"
                    description="Final details and special requirements"
                    stepNumber={8}
                  >
                    <div className="form-grid">
                      <FormGroup label="SEO Requirements">
                        <select
                          name="seoRequirements"
                          value={formData.seoRequirements}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select SEO level</option>
                          <option value="basic_seo">🔍 Basic SEO setup</option>
                          <option value="advanced_seo">
                            📈 Advanced SEO optimization
                          </option>
                          <option value="comprehensive_seo">
                            🚀 Comprehensive SEO strategy
                          </option>
                          <option value="local_seo">📍 Local SEO focus</option>
                          <option value="ecommerce_seo">
                            🛒 E-commerce SEO
                          </option>
                          <option value="enterprise_seo">
                            👑 Enterprise SEO suite
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Analytics Setup">
                        <select
                          name="analyticsSetup"
                          value={formData.analyticsSetup}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select analytics option</option>
                          <option value="basic_analytics">
                            📊 Basic analytics (Google Analytics)
                          </option>
                          <option value="advanced_analytics">
                            📈 Advanced analytics dashboard
                          </option>
                          <option value="custom_analytics">
                            ⚙️ Custom analytics solution
                          </option>
                          <option value="ecommerce_tracking">
                            🛒 E-commerce tracking
                          </option>
                          <option value="business_intelligence">
                            📊 Business intelligence
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Accessibility Compliance">
                        <select
                          name="accessibilityCompliance"
                          value={formData.accessibilityCompliance}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select compliance level</option>
                          <option value="basic_accessibility">
                            ♿ Basic accessibility
                          </option>
                          <option value="wcag_aa">
                            🏅 WCAG 2.1 AA compliance
                          </option>
                          <option value="wcag_aaa">
                            🥇 WCAG 2.1 AAA compliance
                          </option>
                          <option value="section_508">
                            🏛️ Section 508 compliance
                          </option>
                          <option value="ada_compliance">
                            ⚖️ ADA compliance
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Performance Features">
                        <MultiSelectDropdown
                          name="performanceFeatures"
                          value={formData.performanceFeatures}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "cdn_setup",
                              label: "🌐 CDN Setup & Optimization",
                              icon: "fas fa-globe",
                            },
                            {
                              value: "caching",
                              label: "⚡ Advanced Caching System",
                              icon: "fas fa-tachometer-alt",
                            },
                            {
                              value: "image_optimization",
                              label: "🖼️ Image Optimization",
                              icon: "fas fa-image",
                            },
                            {
                              value: "lazy_loading",
                              label: "🔄 Lazy Loading Implementation",
                              icon: "fas fa-spinner",
                            },
                            {
                              value: "performance_monitoring",
                              label: "📊 Performance Monitoring",
                              icon: "fas fa-chart-bar",
                            },
                          ]}
                          placeholder="Select performance features"
                        />
                      </FormGroup>

                      <FormGroup label="Integration Requirements">
                        <MultiSelectDropdown
                          name="integrationRequirements"
                          value={formData.integrationRequirements}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "crm_integration",
                              label: "🤝 CRM Integration",
                              icon: "fas fa-handshake",
                            },
                            {
                              value: "erp_integration",
                              label: "🏢 ERP Integration",
                              icon: "fas fa-building",
                            },
                            {
                              value: "payment_gateways",
                              label: "💳 Payment Gateways",
                              icon: "fas fa-credit-card",
                            },
                            {
                              value: "social_media",
                              label: "📱 Social Media APIs",
                              icon: "fas fa-share-alt",
                            },
                            {
                              value: "email_marketing",
                              label: "📧 Email Marketing Tools",
                              icon: "fas fa-envelope",
                            },
                            {
                              value: "analytics_tools",
                              label: "📊 Analytics Tools Integration",
                              icon: "fas fa-chart-line",
                            },
                          ]}
                          placeholder="Select integration requirements"
                        />
                      </FormGroup>

                      <FormGroup label="Compliance Requirements">
                        <MultiSelectDropdown
                          name="complianceRequirements"
                          value={formData.complianceRequirements}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "gdpr",
                              label: "🇪🇺 GDPR Compliance",
                              icon: "fas fa-shield-alt",
                            },
                            {
                              value: "hipaa",
                              label: "🏥 HIPAA Compliance",
                              icon: "fas fa-user-md",
                            },
                            {
                              value: "pci_dss",
                              label: "💳 PCI DSS Compliance",
                              icon: "fas fa-credit-card",
                            },
                            {
                              value: "sox",
                              label: "📊 SOX Compliance",
                              icon: "fas fa-chart-line",
                            },
                            {
                              value: "iso_27001",
                              label: "🔒 ISO 27001 Compliance",
                              icon: "fas fa-lock",
                            },
                          ]}
                          placeholder="Select compliance requirements"
                        />
                      </FormGroup>

                      <FormGroup label="Deployment Environment">
                        <select
                          name="deploymentEnvironment"
                          value={formData.deploymentEnvironment}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">
                            Select deployment environment
                          </option>
                          <option value="shared_hosting">
                            🏠 Shared hosting
                          </option>
                          <option value="vps">☁️ VPS/Cloud server</option>
                          <option value="dedicated_server">
                            🖥️ Dedicated server
                          </option>
                          <option value="cloud_platform">
                            ☁️ Cloud platform (AWS/Azure/GCP)
                          </option>
                          <option value="containerized">
                            🐳 Containerized deployment
                          </option>
                          <option value="serverless">
                            ⚡ Serverless architecture
                          </option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Project Priority">
                        <select
                          name="projectPriority"
                          value={formData.projectPriority}
                          onChange={handleInputChange}
                          className="enhanced-single-select"
                        >
                          <option value="">Select priority level</option>
                          <option value="low">🟢 Low priority</option>
                          <option value="medium">🟡 Medium priority</option>
                          <option value="high">🟠 High priority</option>
                          <option value="urgent">🔴 Urgent priority</option>
                          <option value="critical">⚫ Critical priority</option>
                        </select>
                      </FormGroup>

                      <FormGroup label="Risk Factors">
                        <MultiSelectDropdown
                          name="riskFactors"
                          value={formData.riskFactors}
                          onChange={handleMultiSelectChange}
                          options={[
                            {
                              value: "tight_deadlines",
                              label: "⏰ Tight Deadlines",
                              icon: "fas fa-clock",
                            },
                            {
                              value: "complex_integrations",
                              label: "🔗 Complex Integrations",
                              icon: "fas fa-puzzle-piece",
                            },
                            {
                              value: "changing_requirements",
                              label: "🔄 Changing Requirements",
                              icon: "fas fa-sync",
                            },
                            {
                              value: "new_technology",
                              label: "🆕 New Technology Stack",
                              icon: "fas fa-rocket",
                            },
                            {
                              value: "regulatory_compliance",
                              label: "📋 Regulatory Compliance",
                              icon: "fas fa-clipboard-check",
                            },
                          ]}
                          placeholder="Select potential risk factors"
                        />
                      </FormGroup>

                      <FormGroup label="Special Requirements">
                        <textarea
                          name="specialRequirements"
                          value={formData.specialRequirements}
                          onChange={handleInputChange}
                          rows="4"
                          placeholder="Any special requirements, constraints, or additional information that would help us provide a more accurate quotation..."
                        />
                      </FormGroup>

                      <FormGroup label="Future Scalability Plans">
                        <textarea
                          name="futureScalability"
                          value={formData.futureScalability}
                          onChange={handleInputChange}
                          rows="3"
                          placeholder="Describe any future scaling plans, additional features you might need, or growth expectations..."
                        />
                      </FormGroup>
                    </div>
                  </FormSection>
                )}

                {/* NAVIGATION WITH TWO-STEP GENERATION */}
                <div className="form-navigation">
                  <div className="nav-left">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="btn btn-secondary"
                        onMouseDown={trackUserInteraction}
                      >
                        <i className="fas fa-chevron-left"></i> Previous
                      </button>
                    )}
                  </div>

                  <div className="nav-center">
                    <div className="step-indicator">
                      {Array.from({ length: totalSteps }, (_, i) => (
                        <div
                          key={i + 1}
                          className={`step-dot ${
                            currentStep === i + 1 ? "active" : ""
                          } ${isStepComplete(i + 1) ? "completed" : ""}`}
                        >
                          {isStepComplete(i + 1) ? (
                            <i className="fas fa-check"></i>
                          ) : (
                            i + 1
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="nav-right">
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="btn btn-primary"
                        onMouseDown={trackUserInteraction}
                      >
                        Next <i className="fas fa-chevron-right"></i>
                      </button>
                    ) : (
                      <div className="two-step-generation">
                        {!generationEnabled ? (
                          <button
                            type="button"
                            onClick={handleEnableGeneration}
                            className="btn btn-warning btn-large"
                            onMouseDown={trackUserInteraction}
                          >
                            <i className="fas fa-unlock"></i> ⚠️ Confirm Details
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleGenerateQuotation}
                            className="btn btn-success btn-large"
                            disabled={isCalculating}
                            onMouseDown={trackUserInteraction}
                          >
                            {isCalculating ? (
                              <>
                                <LoadingSpinner size="small" />
                                Generating Professional Quotation...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-brain"></i>
                                Generate Professional Quotation
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Validation Summary */}
                {Object.keys(validationErrors).length > 0 && (
                  <div className="validation-summary enhanced">
                    <div className="validation-header">
                      <i className="fas fa-exclamation-triangle"></i>
                      Please complete the following required fields:
                    </div>
                    <ul className="validation-list">
                      {Object.entries(validationErrors).map(
                        ([field, error], index) => (
                          <li key={index}>
                            <strong>
                              {field
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                              :
                            </strong>{" "}
                            {error}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* Enhanced Form Actions */}
                <div className="form-actions enhanced">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-outline"
                    onMouseDown={trackUserInteraction}
                  >
                    <i className="fas fa-redo"></i> Reset Form
                  </button>

                  <div className="form-progress">
                    <span>
                      Progress: {Math.round((currentStep / totalSteps) * 100)}%
                    </span>
                    <div className="mini-progress-bar">
                      <div
                        className="mini-progress-fill"
                        style={{
                          width: `${(currentStep / totalSteps) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="generation-status">
                    <span
                      className={`status-indicator ${
                        generationEnabled ? "confirmed" : "pending"
                      }`}
                    >
                      {generationEnabled
                        ? "✅ Ready to Generate"
                        : "⚠️ Confirm Details"}
                    </span>
                  </div>
                </div>

                {/* Required Fields Reminder */}
                {currentStep === 8 && (
                  <div className="required-fields-reminder">
                    <h4>
                      <i className="fas fa-info-circle"></i> Required Fields
                      Checklist
                    </h4>
                    <div className="checklist-grid">
                      <div
                        className={`checklist-item ${
                          formData.clientName ? "completed" : ""
                        }`}
                      >
                        <i
                          className={`fas ${
                            formData.clientName
                              ? "fa-check-circle"
                              : "fa-circle"
                          }`}
                        ></i>
                        Client Name
                      </div>
                      <div
                        className={`checklist-item ${
                          formData.companyName ? "completed" : ""
                        }`}
                      >
                        <i
                          className={`fas ${
                            formData.companyName
                              ? "fa-check-circle"
                              : "fa-circle"
                          }`}
                        ></i>
                        Company Name
                      </div>
                      <div
                        className={`checklist-item ${
                          formData.email ? "completed" : ""
                        }`}
                      >
                        <i
                          className={`fas ${
                            formData.email ? "fa-check-circle" : "fa-circle"
                          }`}
                        ></i>
                        Email Address
                      </div>
                      <div
                        className={`checklist-item ${
                          formData.projectType ? "completed" : ""
                        }`}
                      >
                        <i
                          className={`fas ${
                            formData.projectType
                              ? "fa-check-circle"
                              : "fa-circle"
                          }`}
                        ></i>
                        Project Type
                      </div>
                      <div
                        className={`checklist-item ${
                          formData.timeline ? "completed" : ""
                        }`}
                      >
                        <i
                          className={`fas ${
                            formData.timeline ? "fa-check-circle" : "fa-circle"
                          }`}
                        ></i>
                        Timeline
                      </div>
                      <div
                        className={`checklist-item ${
                          formData.numberOfPages ? "completed" : ""
                        }`}
                      >
                        <i
                          className={`fas ${
                            formData.numberOfPages
                              ? "fa-check-circle"
                              : "fa-circle"
                          }`}
                        ></i>
                        Number of Pages
                      </div>
                      <div
                        className={`checklist-item ${
                          formData.designType ? "completed" : ""
                        }`}
                      >
                        <i
                          className={`fas ${
                            formData.designType
                              ? "fa-check-circle"
                              : "fa-circle"
                          }`}
                        ></i>
                        Design Type
                      </div>
                      <div
                        className={`checklist-item ${
                          formData.coreFeatures?.length > 0 ? "completed" : ""
                        }`}
                      >
                        <i
                          className={`fas ${
                            formData.coreFeatures?.length > 0
                              ? "fa-check-circle"
                              : "fa-circle"
                          }`}
                        ></i>
                        Core Features
                      </div>
                    </div>

                    {/* Two-Step Generation Instructions */}
                    {/* <div className="generation-instructions">
                      <div className="instruction-content">
                        <i className="fas fa-shield-alt"></i>
                        <strong>Two-Step Manual Generation:</strong>
                        <ol>
                          <li>
                            Click "⚠️ Confirm Details" to unlock the quotation
                            button
                          </li>
                          <li>
                            Click "Generate Professional Quotation" to create
                            your quotation
                          </li>
                        </ol>
                        <p>
                          This prevents any accidental auto-generation and
                          ensures you have full control.
                        </p>
                      </div>
                    </div> */}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuotationCalculator;


// use this code analyze and give me the full code so that i can replace it with single paste