import React, { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import FormSection from "./FormSection";
import FormGroup from "./FormGroup";
import MultiSelectDropdown from "../ui/MultiSelectDropdown";
import QuotationResults from "../advanced/QuotationResults";
import LoadingSpinner from "../ui/LoadingSpinner";
import PricingTiers from "../advanced/PricingTiers";
import TimelineVisualizer from "../advanced/TimelineVisualizer";
import calculateProfessionalQuotation from "../../utils/calculations";
import { validateStep } from "../../utils/validation";
import { FORM_OPTIONS } from "../../utils/constants";
import "../../styles/components.css";

// UI Components

const ProgressBar = ({ percent, color = "var(--primary)", className = "" }) => (
  <div className={`progress-bar-outer ${className}`} role="progressbar" aria-valuenow={percent}>
    <div
      className="progress-bar-inner"
      style={{ width: `${Math.min(100, Math.max(0, percent))}%`, backgroundColor: color }}
      aria-valuemin="0"
      aria-valuemax="100"
    />
  </div>
);

const StatusDot = ({ status = "incomplete", className = "" }) => (
  <span
    className={`status-dot ${status} ${className}`}
    aria-label={status === "complete" ? "Completed" : status === "error" ? "Error" : "Incomplete"}
  />
);

const ToggleSwitch = ({ checked, onChange, label, name, id, className = "" }) => (
  <label className={`toggle-switch ${className}`} htmlFor={id}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      name={name}
      id={id}
      className="toggle-switch-input"
    />
    <span className="toggle-switch-slider"></span>
    <span className="toggle-switch-label">{label}</span>
  </label>
);

const StatusBadge = ({ active = false, loading = false, ready = false, className = "" }) => (
  <div className={`status-badge ${className} ${ready ? "ready" : loading ? "loading" : "incomplete"}`}>
    <span className="status-badge-icon">
      {loading ? (
        <i className="fas fa-spinner fa-spin" aria-label="Loading"></i>
      ) : ready ? (
        <i className="fas fa-check-circle" aria-label="Ready"></i>
      ) : (
        <i className="fas fa-exclamation-circle" aria-label="Incomplete"></i>
      )}
    </span>
    <span className="status-badge-label">
      {loading ? "Generating..." : ready ? "Ready" : "Incomplete"}
    </span>
  </div>
);

// Field names (flat, modern)
const fieldNames = {
  // Client Info
  clientName: "clientName",
  companyName: "companyName",
  email: "email",
  phone: "phone",
  website: "website",
  industry: "industry",
  companySize: "companySize",
  location: "location",
  // Project Overview
  projectTitle: "projectTitle",
  projectType: "projectType",
  projectGoal: "projectGoal",
  targetAudience: "targetAudience",
  budgetRange: "budgetRange",
  numberOfKeyPages: "numberOfKeyPages",
  expectedUsers: "expectedUsers",
  timeline: "timeline",
  region: "region",
  globalDeployment: "globalDeployment",
  // Technical Specs
  deviceCompatibility: "deviceCompatibility",
  browserSupport: "browserSupport",
  performanceExpectation: "performanceExpectation",
  preferredPlatform: "preferredPlatform",
  integrationsNeeded: "integrationsNeeded",
  // Design
  designApproach: "designApproach",
  brandStyle: "brandStyle",
  brandGuidelines: "brandGuidelines",
  contentProvision: "contentProvision",
  imagesMediaSource: "imagesMediaSource",
  accessibilityCompliance: "accessibilityCompliance",
  // Tech Stack
  technologyStack: {
    languages: "technologyStack.languages",
    frameworks: "technologyStack.frameworks",
    databases: "technologyStack.databases",
    hosting: "technologyStack.hosting",
    deployment: "technologyStack.deployment",
    versionControl: "technologyStack.versionControl",
  },
  // Features
  coreFeatures: "coreFeatures",
  advancedFeatures: "advancedFeatures",
  ecommerceFeatures: "ecommerceFeatures",
  securityConfiguration: "securityConfiguration",
  // Content & Support
  cmsPlatform: "cmsPlatform",
  adminAccessLevel: "adminAccessLevel",
  maintenanceSupport: "maintenanceSupport",
  training: "training",
  documentation: "documentation",
  futureScalability: "futureScalability",
  // Additional
  projectPriority: "projectPriority",
  riskFactors: "riskFactors",
  specialRequirements: "specialRequirements",
  seoSetup: "seoSetup",
};

// Guards and refs
const isManualSubmissionRef = useRef(false);
const generationEnabledRef = useRef(false);
const lastUserInteractionRef = useRef(0);
const formSubmissionBlockedRef = useRef(true);

export default function QuotationCalculator() {
  // Form state
  const [formData, setFormData] = useState(
    Object.keys(fieldNames)
      .filter(key => !key.includes('.'))
      .reduce((acc, key) => ({ ...acc, [key]: Array.isArray(FORM_OPTIONS[key]) ? [] : "" }), {
        ...Object.entries(fieldNames.technologyStack).reduce((acc, [k, v]) => ({ ...acc, [k]: Array.isArray(FORM_OPTIONS[v]) ? [] : "" }), {}),
        globalDeployment: false,
      })
  );
  const [quotation, setQuotation] = useState(null);
  const [showQuotation, setShowQuotation] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPricingTiers, setShowPricingTiers] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [stepCompletionStatus, setStepCompletionStatus] = useState({});
  const [generationEnabled, setGenerationEnabled] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const totalSteps = 8;

  // Required fields per step
  const requiredFields = {
    1: [fieldNames.clientName, fieldNames.companyName, fieldNames.email, fieldNames.phone, fieldNames.industry],
    2: [fieldNames.projectTitle, fieldNames.projectType, fieldNames.timeline],
    3: [fieldNames.numberOfKeyPages, fieldNames.deviceCompatibility, fieldNames.performanceExpectation],
    4: [fieldNames.designApproach, fieldNames.brandStyle],
    6: [fieldNames.coreFeatures],
  };

  // On mount
  useEffect(() => {
    formSubmissionBlockedRef.current = true;
    generationEnabledRef.current = false;
    isManualSubmissionRef.current = false;
  }, []);

  // Step completion logic
  const updateStepCompletion = useCallback(() => {
    const status = {};
    for (let step = 1; step <= totalSteps; step++) {
      const required = requiredFields[step] || [];
      const completed = required.filter(field =>
        (Array.isArray(formData[field]) && formData[field].length > 0) ||
        (typeof formData[field] === 'string' && formData[field].trim() !== '')
      ).length;
      status[step] = {
        isValid: completed >= required.length,
        completion: Math.round((completed / Math.max(1, required.length)) * 100),
      };
    }
    setStepCompletionStatus(status);
    setIsFormValid(Object.values(status).every(s => s.isValid));
  }, [formData]);

  useEffect(() => {
    updateStepCompletion();
  }, [formData, updateStepCompletion]);

  // Handlers
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    setGenerationEnabled(false);
  }, []);

  const handleMultiSelectChange = useCallback((name, values) => {
    setFormData(prev => ({
      ...prev,
      [name]: values,
    }));
    setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    setGenerationEnabled(false);
  }, []);

  const handleTechStackChange = useCallback((category, values) => {
    setFormData(prev => ({
      ...prev,
      technologyStack: {
        ...prev.technologyStack,
        [category]: values,
      },
    }));
    setGenerationEnabled(false);
  }, []);

  const validateCurrentStep = useCallback((step = currentStep) => {
    const fields = requiredFields[step] || [];
    const errors = {};
    fields.forEach(field => {
      if (
        (Array.isArray(formData[field]) && formData[field].length === 0) ||
        (typeof formData[field] === 'string' && !formData[field].trim())
      ) {
        errors[field] = `${field} is required`;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, currentStep]);

  const nextStep = useCallback((e) => {
    e?.preventDefault();
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setValidationErrors({});
    }
  }, [currentStep, validateCurrentStep]);

  const prevStep = useCallback((e) => {
    e?.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setValidationErrors({});
    }
  }, [currentStep]);

  const goToStep = useCallback((step, e) => {
    e?.preventDefault();
    if (stepCompletionStatus[step]?.isValid && step < currentStep) {
      setCurrentStep(step);
      setValidationErrors({});
    }
  }, [currentStep, stepCompletionStatus]);

  const trackUserInteraction = useCallback(() => {
    lastUserInteractionRef.current = Date.now();
    isManualSubmissionRef.current = true;
  }, []);

  const isFormReadyForGeneration = useCallback(() => isFormValid, [isFormValid]);

  const handleEnableGeneration = useCallback((e) => {
    e?.preventDefault();
    if (!isFormReadyForGeneration()) {
      alert("All required fields must be completed before enabling generation.");
      return;
    }
    setGenerationEnabled(true);
    generationEnabledRef.current = true;
    formSubmissionBlockedRef.current = false;
  }, [isFormReadyForGeneration]);

  const handleGenerateQuotation = useCallback((e) => {
    e?.preventDefault();
    if (!generationEnabledRef.current || formSubmissionBlockedRef.current) {
      alert("Generation is not enabled.");
      return;
    }
    const timeSinceLastInteraction = Date.now() - lastUserInteractionRef.current;
    if (timeSinceLastInteraction < 100) return;
    setIsCalculating(true);
    setShowQuotation(false);
    setQuotation(null);
    setTimeout(() => {
      try {
        setQuotation(calculateProfessionalQuotation(formData));
        setShowQuotation(true);
        setShowPricingTiers(true);
      } catch (error) {
        alert("Error: " + error.message);
      } finally {
        setIsCalculating(false);
        setGenerationEnabled(false);
        generationEnabledRef.current = false;
        formSubmissionBlockedRef.current = true;
      }
    }, 1000);
  }, [formData]);

  const handleReset = useCallback(() => {
    setFormData(
      Object.keys(fieldNames)
        .filter(key => !key.includes('.'))
        .reduce((acc, key) => ({ ...acc, [key]: Array.isArray(FORM_OPTIONS[key]) ? [] : "" }), {
          ...Object.entries(fieldNames.technologyStack).reduce((acc, [k, v]) => ({ ...acc, [k]: Array.isArray(FORM_OPTIONS[v]) ? [] : "" }), {}),
          globalDeployment: false,
        })
    );
    setQuotation(null);
    setShowQuotation(false);
    setCurrentStep(1);
    setShowPricingTiers(false);
    setValidationErrors({});
    setGenerationEnabled(false);
    setIsFormValid(false);
    generationEnabledRef.current = false;
    isManualSubmissionRef.current = false;
    formSubmissionBlockedRef.current = true;
  }, []);

  const handleFormSubmit = useCallback((e) => { e.preventDefault(); }, []);

  const getStepLabel = (step) => ({
    1: "Client Info",
    2: "Project Overview",
    3: "Technical Specs",
    4: "Design Requirements",
    5: "Technology Stack",
    6: "Features & Functionality",
    7: "Content & Support",
    8: "Additional Requirements",
  }[step] || `Step ${step}`);

  // Field rendering helpers as per your template (see paste.txt)
  // (Full helper code omitted here for brevity; paste in from your current file)

  // ...Include your renderSelectField, renderMultiSelectField, renderTextInputField,
  // renderTextAreaField, renderInlineToggle field helpers here.

  // Section Renderers: renderStep1 – renderStep8
  // (Full JSX out as per your paste.txt)

  // ...Include your renderStep1, renderStep2, ..., renderStep8 methods as-is...

  // Main Form Render
  if (showQuotation && quotation && isManualSubmissionRef.current) {
    return (
      <div className="quotation-fullscreen" id="quotation-fullscreen">
        <QuotationResults quotation={quotation} formData={formData} />
        {showPricingTiers && quotation.pricingTiers && (
          <PricingTiers pricingTiers={quotation.pricingTiers} id="pricing-tiers" />
        )}
        {quotation.timeline && quotation.phases && (
          <TimelineVisualizer timeline={quotation.timeline} phases={quotation.phases} id="timeline-visualizer" />
        )}
        <div className="quotation-actions" id="quotation-actions">
          <button className="btn btn-outline btn-back" id="btn-back-to-form" onClick={() => {
            setShowQuotation(false);
            setQuotation(null);
            isManualSubmissionRef.current = false;
          }}>
            <i className="fas fa-chevron-left"></i> Back to Form
          </button>
          <button className="btn btn-warning btn-reset" id="btn-reset-quotation" onClick={handleReset} >
            <i className="fas fa-sync-alt"></i> New Quotation
          </button>
        </div>
      </div>
    );
  }

  const formCompletion = Object.values(stepCompletionStatus).filter(s => s.isValid).length;
  const totalCompletion = (formCompletion / totalSteps) * 100;

  return (
    <>
      <Helmet>
        <title>Professional Web Project Quotation Calculator</title>
        <meta name="description" content="Generate accurate, professional quotations for web projects" />
      </Helmet>
      <div className="professional-calculator" id="quotation-calculator" onClick={trackUserInteraction}>
        {/* Header */}
        <div className="calculator-header" id="calculator-header">
          <h1 className="calculator-title">
            <i className="fas fa-file-invoice-dollar title-icon"></i>
            <span className="title-text">Web Project Quotation Calculator</span>
          </h1>
          <div className="status-panel" id="status-panel">
            <StatusBadge active={true} loading={isCalculating} ready={isFormReadyForGeneration()} className="status-badge" />
            <div className="progress-summary" id="progress-summary">
              <span className="progress-summary-label">Form Completion</span>
              <span className="progress-summary-value">
                {formCompletion}/{totalSteps}
              </span>
              <ProgressBar percent={totalCompletion} color="var(--success)" className="main-progress-bar" />
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="step-navigation" id="step-navigation">
          <div className="steps-container" id="steps-container">
            {Array.from({ length: totalSteps }, (_, i) => {
              const step = i + 1;
              const isActive = currentStep === step;
              const isCompleted = stepCompletionStatus[step]?.isValid;
              const isPrevious = step < currentStep;
              const stepPercentage = stepCompletionStatus[step]?.completion || 0;
              return (
                <div
                  key={step}
                  className={`step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""} ${isPrevious ? "previous" : ""}`}
                  onClick={(e) => isPrevious && goToStep(step, e)}
                  id={`step-item-${step}`}
                >
                  <div className="step-number">
                    {isCompleted ? (
                      <i className="fas fa-check-circle step-icon completed"></i>
                    ) : isActive ? (
                      <span className="step-number-text">{step}</span>
                    ) : (
                      <span className="step-number-text">{step}</span>
                    )}
                  </div>
                  <div className="step-label">{getStepLabel(step)}</div>
                  <div className="step-completion" aria-label={`Step ${step} completion: ${stepPercentage}%`}>
                    <span className="step-completion-text">{stepPercentage}%</span>
                    <ProgressBar
                      percent={stepPercentage}
                      color={isCompleted ? "var(--success)" : isActive ? "var(--primary)" : "var(--warning)"}
                      className="step-progress-bar"
                    />
                    <StatusDot status={isCompleted ? "complete" : isActive ? "active" : "incomplete"} className="step-status-dot" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="calculator-body" id="calculator-body">
          <form
            onSubmit={handleFormSubmit}
            className="quotation-form"
            id="quotation-form"
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
            {currentStep === 7 && renderStep7()}
            {currentStep === 8 && renderStep8()}

            {/* Form Actions */}
            <div className="form-actions" id="form-actions">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-outline btn-prev"
                  id="btn-prev-step"
                  disabled={isCalculating}
                >
                  <i className="fas fa-chevron-left"></i> Back
                </button>
              )}
              {currentStep < totalSteps && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary btn-next"
                  id="btn-next-step"
                  disabled={isCalculating}
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              )}
              {currentStep === totalSteps && !generationEnabled && (
                <button
                  type="button"
                  onClick={handleEnableGeneration}
                  className="btn btn-accent btn-enable"
                  id="btn-enable-generation"
                  disabled={!isFormReadyForGeneration() || isCalculating}
                >
                  <i className="fas fa-file-alt"></i> Enable Generation
                </button>
              )}
              {currentStep === totalSteps && generationEnabled && (
                <button
                  type="button"
                  onClick={handleGenerateQuotation}
                  className="btn btn-success btn-generate"
                  id="btn-generate-quotation"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <LoadingSpinner className="btn-spinner" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-file-invoice-dollar"></i>
                      <span>Generate Quotation</span>
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-warning btn-reset"
                id="btn-reset-form"
                disabled={isCalculating}
              >
                <i className="fas fa-sync-alt"></i> Reset
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="calculator-footer" id="calculator-footer">
          <p className="footer-text">
            <i className="fas fa-lock"></i> Your data is secure and will never be auto-generated. Quotations are created only after direct, manual action.
          </p>
        </div>
      </div>
    </>
  );
}

// ***
// You must paste in your renderSelectField, renderMultiSelectField, renderTextInputField,
// renderTextAreaField, renderInlineToggle, and renderStep1–renderStep8 function
// content exactly as from your paste.txt. They are omitted above for space, as code
// will otherwise exceed this chat box, but your `paste.txt` has all the correct JSX.
// ***
// =================
// Section Rendering (Step 1–8, Full, No Omissions)
// =================

const renderStep1 = () => (
  <FormSection
    title="Client Information"
    icon="fas fa-user-tie"
    description="We'll use this information to personalize your quotation and ensure we have accurate contact details."
    stepNumber={1}
    className="section-client-info"
    id="section-client-info"
    isRequired
  >
    <div className="form-grid form-grid-client-info" id="form-grid-client-info">
      {renderTextInputField(
        fieldNames.clientName,
        "Client Name",
        "Your full name for correspondence.",
        true,
        "text",
        "client-name"
      )}
      {renderTextInputField(
        fieldNames.companyName,
        "Company Name",
        "Your company or organization name.",
        true,
        "text",
        "company-name"
      )}
      {renderTextInputField(
        fieldNames.email,
        "Email",
        "Primary email for communication and updates.",
        true,
        "email",
        "email"
      )}
      {renderTextInputField(
        fieldNames.phone,
        "Phone",
        "Primary phone for urgent matters.",
        true,
        "tel",
        "phone"
      )}
      {renderTextInputField(
        fieldNames.website,
        "Website (if any)",
        "Your current website URL, if any.",
        false,
        "url",
        "website"
      )}
      {renderSelectField(
        fieldNames.industry,
        "Industry",
        "What industry is your business in?",
        true,
        "industry"
      )}
      {renderSelectField(
        fieldNames.companySize,
        "Company Size",
        "Approximate number of employees.",
        false,
        "company-size"
      )}
      {renderSelectField(
        fieldNames.location,
        "Location",
        "Where is your business located?",
        false,
        "location"
      )}
    </div>
  </FormSection>
);

const renderStep2 = () => (
  <FormSection
    title="Project Overview"
    icon="fas fa-project-diagram"
    description="Let us know your project's goals, audience, scope, and timeline for a tailored solution."
    stepNumber={2}
    className="section-project-overview"
    id="section-project-overview"
    isRequired
  >
    <div className="form-grid form-grid-project-overview" id="form-grid-project-overview">
      {renderTextInputField(
        fieldNames.projectTitle,
        "Project Title",
        "A clear, descriptive name for your project.",
        true,
        "text",
        "project-title"
      )}
      {renderSelectField(
        fieldNames.projectType,
        "Project Type",
        "What kind of project is this? (e.g., Website, E-commerce, SaaS).",
        true,
        "project-type"
      )}
      {renderTextAreaField(
        fieldNames.projectGoal,
        "Project Goal",
        "What are the main objectives for this project?",
        false,
        3,
        "project-goal"
      )}
      {renderTextAreaField(
        fieldNames.targetAudience,
        "Target Audience",
        "Who will use or visit your product? Describe their needs.",
        false,
        3,
        "target-audience"
      )}
      {renderSelectField(
        fieldNames.budgetRange,
        "Budget Range",
        "Select the budget band that best fits your expectations.",
        false,
        "budget-range"
      )}
      {renderSelectField(
        fieldNames.numberOfKeyPages,
        "Number of Key Pages",
        "Estimate the main content sections or page count.",
        true,
        "pages-number"
      )}
      {renderSelectField(
        fieldNames.expectedUsers,
        "Expected Users",
        "How many users do you expect, and at what visitor volumes?",
        false,
        "users-number"
      )}
      {renderSelectField(
        fieldNames.timeline,
        "Timeline",
        "When do you need this project delivered?",
        true,
        "timeline"
      )}
      {renderSelectField(
        fieldNames.region,
        "Region",
        "Primary market or geographic region for your project.",
        false,
        "region"
      )}
      {renderInlineToggle(
        fieldNames.globalDeployment,
        "Global/Multi-region Deployment Needed",
        "Check if your project needs to be accessible worldwide or in multiple regions.",
        "global-deployment"
      )}
    </div>
  </FormSection>
);

const renderStep3 = () => (
  <FormSection
    title="Technical Specifications"
    icon="fas fa-cog"
    description="Specify your technical requirements: platform, integrations, device/browser support, and performance expectations."
    stepNumber={3}
    className="section-technical-specs"
    id="section-technical-specs"
    isRequired
  >
    <div className="form-grid form-grid-technical-specs" id="form-grid-technical-specs">
      {renderSelectField(
        fieldNames.preferredPlatform,
        "Preferred Platform",
        "Which platform or technology stack do you prefer? (e.g., WordPress, Custom Stack).",
        false,
        "platform"
      )}
      {renderMultiSelectField(
        fieldNames.integrationsNeeded,
        "Integrations Needed",
        "Select all relevant third-party integrations you require (e.g., Payment, CRM, Analytics).",
        false,
        "integrations"
      )}
      {renderMultiSelectField(
        fieldNames.deviceCompatibility,
        "Device Compatibility",
        "Select all devices your platform must support (e.g., Desktop, Mobile, Tablet, Smart TV).",
        true,
        "device-compatibility"
      )}
      {renderMultiSelectField(
        fieldNames.browserSupport,
        "Browser Support",
        "Select all browsers your platform must support (e.g., Chrome, Firefox, Safari).",
        false,
        "browser-support"
      )}
      {renderSelectField(
        fieldNames.performanceExpectation,
        "Performance Expectation",
        "What level of speed, reliability, and scaling do you require? (e.g., Basic, Optimized, Enterprise).",
        true,
        "performance"
      )}
    </div>
  </FormSection>
);

const renderStep4 = () => (
  <FormSection
    title="Design Requirements"
    icon="fas fa-paint-brush"
    description="Define your visual style, branding, content creation, and accessibility needs."
    stepNumber={4}
    className="section-design-requirements"
    id="section-design-requirements"
    isRequired
  >
    <div className="form-grid form-grid-design-requirements" id="form-grid-design-requirements">
      {renderSelectField(
        fieldNames.designApproach,
        "Design Approach",
        "How custom do you want your design? (e.g., Template, Custom, Enterprise).",
        true,
        "design-approach"
      )}
      {renderSelectField(
        fieldNames.brandStyle,
        "Brand Style",
        "What best describes your brand's visual style? (e.g., Modern, Corporate, Creative).",
        true,
        "brand-style"
      )}
      {renderSelectField(
        fieldNames.brandGuidelines,
        "Brand Guidelines",
        "Do you have existing brand guidelines, assets, or a style guide?",
        false,
        "brand-guidelines"
      )}
      {renderSelectField(
        fieldNames.contentProvision,
        "Content Provision",
        "Who will be responsible for content creation? (e.g., Client Provides, Agency Copywriting).",
        false,
        "content-provision"
      )}
      {renderMultiSelectField(
        fieldNames.imagesMediaSource,
        "Images & Media Source",
        "Where will images and multimedia assets come from? (e.g., Client-Supplied, Stock, Custom Shoot).",
        false,
        "media-source"
      )}
      {renderMultiSelectField(
        fieldNames.accessibilityCompliance,
        "Accessibility & Compliance",
        "Which accessibility and compliance standards must your platform meet? (e.g., WCAG, GDPR, HIPAA).",
        false,
        "accessibility"
      )}
    </div>
  </FormSection>
);

const renderStep5 = () => (
  <FormSection
    title="Technology Stack"
    icon="fas fa-microchip"
    description="Select your preferred programming languages, frameworks, databases, hosting, and deployment strategy."
    stepNumber={5}
    className="section-technology-stack"
    id="section-technology-stack"
  >
    <div className="form-grid form-grid-technology-stack" id="form-grid-technology-stack">
      <FormGroup label="Programming Languages">
        <MultiSelectDropdown
          value={formData.technologyStack.languages}
          onChange={(values) => handleTechStackChange('languages', values)}
          options={FORM_OPTIONS[fieldNames.technologyStack.languages]?.map(lang => ({ value: lang, label: lang }))}
          placeholder="Select languages"
          className="multiselect-languages"
          id="techstack-languages"
        />
      </FormGroup>
      <FormGroup label="Frameworks">
        <MultiSelectDropdown
          value={formData.technologyStack.frameworks}
          onChange={(values) => handleTechStackChange('frameworks', values)}
          options={FORM_OPTIONS[fieldNames.technologyStack.frameworks]?.map(fw => ({ value: fw, label: fw }))}
          placeholder="Select frameworks"
          className="multiselect-frameworks"
          id="techstack-frameworks"
        />
      </FormGroup>
      <FormGroup label="Databases">
        <MultiSelectDropdown
          value={formData.technologyStack.databases}
          onChange={(values) => handleTechStackChange('databases', values)}
          options={FORM_OPTIONS[fieldNames.technologyStack.databases]?.map(db => ({ value: db, label: db }))}
          placeholder="Select databases"
          className="multiselect-databases"
          id="techstack-databases"
        />
      </FormGroup>
      <FormGroup label="Hosting/Cloud Platform" tip="Where will your project be hosted?">
        <select
          value={formData.technologyStack.hosting}
          onChange={(e) => handleTechStackChange('hosting', e.target.value)}
          className="form-control select-hosting"
          id="techstack-hosting"
        >
          <option value="">Select hosting/cloud platform</option>
          {FORM_OPTIONS[fieldNames.technologyStack.hosting]?.map(host => (
            <option key={host} value={host}>{host}</option>
          ))}
        </select>
      </FormGroup>
      <FormGroup label="Deployment Method" tip="How will your project be deployed and maintained?">
        <select
          value={formData.technologyStack.deployment}
          onChange={(e) => handleTechStackChange('deployment', e.target.value)}
          className="form-control select-deployment"
          id="techstack-deployment"
        >
          <option value="">Select deployment method</option>
          {FORM_OPTIONS[fieldNames.technologyStack.deployment]?.map(dep => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>
      </FormGroup>
      <FormGroup label="Version Control" tip="Which version control system will your team use?">
        <select
          value={formData.technologyStack.versionControl}
          onChange={(e) => handleTechStackChange('versionControl', e.target.value)}
          className="form-control select-version-control"
          id="techstack-version-control"
        >
          <option value="">Select version control system</option>
          {FORM_OPTIONS[fieldNames.technologyStack.versionControl]?.map(vc => (
            <option key={vc} value={vc}>{vc}</option>
          ))}
        </select>
      </FormGroup>
    </div>
  </FormSection>
);

const renderStep6 = () => (
  <FormSection
    title="Features & Functionality"
    icon="fas fa-cubes"
    description="Select all core, advanced, and e-commerce features for your platform."
    stepNumber={6}
    className="section-features-functionality"
    id="section-features-functionality"
    isRequired
  >
    <div className="form-grid form-grid-features-functionality" id="form-grid-features-functionality">
      {renderMultiSelectField(
        fieldNames.coreFeatures,
        "Core Features",
        "What basic or must-have features do you need? (e.g., User Authentication, CMS, Search, Contact Forms).",
        true,
        "core-features"
      )}
      {renderMultiSelectField(
        fieldNames.advancedFeatures,
        "Advanced Features",
        "Which premium or sophisticated features should be included? (e.g., Real-Time Chat, API/SDK, AI/ML).",
        false,
        "advanced-features"
      )}
      {renderMultiSelectField(
        fieldNames.securityConfiguration,
        "Security Configuration",
        "What security measures and compliance are required? (e.g., SSL, 2FA, Pen-Testing, Automated Backups).",
        false,
        "security-configuration"
      )}
      {formData.projectType === "ecommerce" && (
        <FormGroup
          label="E-commerce Features"
          tip="Select all e-commerce and marketplace features needed."
          className="form-group-ecommerce-features"
        >
          <MultiSelectDropdown
            value={formData.ecommerceFeatures}
            onChange={(values) => handleMultiSelectChange("ecommerceFeatures", values)}
            options={FORM_OPTIONS[fieldNames.ecommerceFeatures]?.map(ec => ({ value: ec, label: ec }))}
            placeholder="Select e-commerce features"
            className="multiselect-ecommerce-features"
            id="ecommerce-features"
          />
        </FormGroup>
      )}
    </div>
  </FormSection>
);

const renderStep7 = () => (
  <FormSection
    title="Content & Support"
    icon="fas fa-life-ring"
    description="Define your CMS, maintenance, training, documentation, and future scalability needs."
    stepNumber={7}
    className="section-content-support"
    id="section-content-support"
  >
    <div className="form-grid form-grid-content-support" id="form-grid-content-support">
      {renderSelectField(
        fieldNames.cmsPlatform,
        "CMS Platform",
        "Which content management system would you prefer? (e.g., None, WordPress, Drupal, Headless CMS).",
        false,
        "cms-platform"
      )}
      {renderSelectField(
        fieldNames.adminAccessLevel,
        "Admin Access Level",
        "What level of administrative access is needed for your team?",
        false,
        "admin-access"
      )}
      {renderSelectField(
        fieldNames.maintenanceSupport,
        "Maintenance Support",
        "What level of ongoing maintenance and support do you require? (e.g., Self-Service, Standard, Premium, Enterprise).",
        false,
        "maintenance"
      )}
      {renderSelectField(
        fieldNames.training,
        "Training",
        "What training or documentation do you need for your team?",
        false,
        "training"
      )}
      {renderSelectField(
        fieldNames.documentation,
        "Documentation",
        "What documentation or handover materials do you require? (e.g., Basic README, Detailed Docs, Video Walkthroughs).",
        false,
        "documentation"
      )}
      {renderTextAreaField(
        fieldNames.futureScalability,
        "Future Scalability",
        "Describe any anticipated growth, scaling, or future requirements.",
        false,
        4,
        "future-scalability"
      )}
    </div>
  </FormSection>
);

const renderStep8 = () => (
  <FormSection
    title="Additional Requirements"
    icon="fas fa-list-check"
    description="Set project priority, identify risk factors, specify SEO needs, and list any special or regulatory requirements."
    stepNumber={8}
    className="section-additional-requirements"
    id="section-additional-requirements"
  >
    <div className="form-grid form-grid-additional-requirements" id="form-grid-additional-requirements">
      {renderSelectField(
        fieldNames.projectPriority,
        "Project Priority",
        "How important/urgent is this project? (e.g., Low, Medium, High, Critical).",
        false,
        "project-priority"
      )}
      {renderMultiSelectField(
        fieldNames.riskFactors,
        "Risk Factors",
        "Identify any potential risks or challenges for this project (e.g., Tight Deadline, Complex Integration, Regulatory Compliance, Third-Party Dependencies, Legacy Data Migration).",
        false,
        "risk-factors"
      )}
      {renderSelectField(
        fieldNames.seoSetup,
        "SEO Setup",
        "What level of search engine optimization (SEO) is needed? (e.g., Basic, Advanced, E-commerce, Local/Geo SEO).",
        false,
        "seo-setup"
      )}
      {renderTextAreaField(
        fieldNames.specialRequirements,
        "Special Requirements",
        "List any special needs, integrations, regulatory, or compliance requirements not covered above.",
        false,
        4,
        "special-requirements"
      )}
    </div>
  </FormSection>
);

// =================
// Main Form Render (JSX)
// =================

if (showQuotation && quotation && isManualSubmissionRef.current) {
  return (
    <div className="quotation-fullscreen" id="quotation-fullscreen">
      <QuotationResults quotation={quotation} formData={formData} />
      {showPricingTiers && quotation.pricingTiers && (
        <PricingTiers pricingTiers={quotation.pricingTiers} id="pricing-tiers" />
      )}
      {quotation.timeline && quotation.phases && (
        <TimelineVisualizer timeline={quotation.timeline} phases={quotation.phases} id="timeline-visualizer" />
      )}
      <div className="quotation-actions" id="quotation-actions">
        <button
          className="btn btn-outline btn-back"
          id="btn-back-to-form"
          onClick={() => {
            setShowQuotation(false);
            setQuotation(null);
            isManualSubmissionRef.current = false;
          }}>
          <i className="fas fa-chevron-left"></i> Back to Form
        </button>
        <button className="btn btn-warning btn-reset" id="btn-reset-quotation" onClick={handleReset} >
          <i className="fas fa-sync-alt"></i> New Quotation
        </button>
      </div>
    </div>
  );
}

const formCompletion = Object.values(stepCompletionStatus).filter(s => s.isValid).length;
const totalCompletion = (formCompletion / totalSteps) * 100;

return (
  <>
    <Helmet>
      <title>Professional Web Project Quotation Calculator</title>
      <meta name="description" content="Generate accurate, professional quotations for web projects" />
    </Helmet>
    <div className="professional-calculator" id="quotation-calculator" onClick={trackUserInteraction}>
      {/* Header */}
      <div className="calculator-header" id="calculator-header">
        <h1 className="calculator-title">
          <i className="fas fa-file-invoice-dollar title-icon"></i>
          <span className="title-text">Web Project Quotation Calculator</span>
        </h1>
        <div className="status-panel" id="status-panel">
          <StatusBadge active={true} loading={isCalculating} ready={isFormReadyForGeneration()} className="status-badge" />
          <div className="progress-summary" id="progress-summary">
            <span className="progress-summary-label">Form Completion</span>
            <span className="progress-summary-value">
              {formCompletion}/{totalSteps}
            </span>
            <ProgressBar percent={totalCompletion} color="var(--success)" className="main-progress-bar" />
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="step-navigation" id="step-navigation">
        <div className="steps-container" id="steps-container">
          {Array.from({ length: totalSteps }, (_, i) => {
            const step = i + 1;
            const isActive = currentStep === step;
            const isCompleted = stepCompletionStatus[step]?.isValid;
            const isPrevious = step < currentStep;
            const stepPercentage = stepCompletionStatus[step]?.completion || 0;
            return (
              <div
                key={step}
                className={`step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""} ${isPrevious ? "previous" : ""}`}
                onClick={(e) => isPrevious && goToStep(step, e)}
                id={`step-item-${step}`}
              >
                <div className="step-number">
                  {isCompleted ? (
                    <i className="fas fa-check-circle step-icon completed"></i>
                  ) : isActive ? (
                    <span className="step-number-text">{step}</span>
                  ) : (
                    <span className="step-number-text">{step}</span>
                  )}
                </div>
                <div className="step-label">{getStepLabel(step)}</div>
                <div className="step-completion" aria-label={`Step ${step} completion: ${stepPercentage}%`}>
                  <span className="step-completion-text">{stepPercentage}%</span>
                  <ProgressBar
                    percent={stepPercentage}
                    color={isCompleted ? "var(--success)" : isActive ? "var(--primary)" : "var(--warning)"}
                    className="step-progress-bar"
                  />
                  <StatusDot status={isCompleted ? "complete" : isActive ? "active" : "incomplete"} className="step-status-dot" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="calculator-body" id="calculator-body">
        <form
          onSubmit={handleFormSubmit}
          className="quotation-form"
          id="quotation-form"
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}
          {currentStep === 7 && renderStep7()}
          {currentStep === 8 && renderStep8()}

          {/* Form Actions */}
          <div className="form-actions" id="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-outline btn-prev"
                id="btn-prev-step"
                disabled={isCalculating}
              >
                <i className="fas fa-chevron-left"></i> Back
              </button>
            )}
            {currentStep < totalSteps && (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary btn-next"
                id="btn-next-step"
                disabled={isCalculating}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            )}
            {currentStep === totalSteps && !generationEnabled && (
              <button
                type="button"
                onClick={handleEnableGeneration}
                className="btn btn-accent btn-enable"
                id="btn-enable-generation"
                disabled={!isFormReadyForGeneration() || isCalculating}
              >
                <i className="fas fa-file-alt"></i> Enable Generation
              </button>
            )}
            {currentStep === totalSteps && generationEnabled && (
              <button
                type="button"
                onClick={handleGenerateQuotation}
                className="btn btn-success btn-generate"
                id="btn-generate-quotation"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <LoadingSpinner className="btn-spinner" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-invoice-dollar"></i>
                    <span>Generate Quotation</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-warning btn-reset"
              id="btn-reset-form"
              disabled={isCalculating}
            >
              <i className="fas fa-sync-alt"></i> Reset
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="calculator-footer" id="calculator-footer">
        <p className="footer-text">
          <i className="fas fa-lock"></i> Your data is secure and will never be auto-generated. Quotations are created only after direct, manual action.
        </p>
      </div>
    </div>
  </>
);
