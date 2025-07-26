/* ==========================================================================
   PROPOSAL GENERATOR COMPONENT
   Professional project proposal generation with customization options
   ========================================================================== */

import React, { useState, useRef, useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { useUser } from '../../context/UserContext';
import { generateProposalPDF, downloadProposalPDF } from '../../utils/pdfGenerator';
import { formatCurrency } from '../../utils/calculations';
import { trackConversion, analytics } from '../../utils/analytics';
import LoadingSpinner from '../ui/LoadingSpinner';
import '../../styles/features/proposal-generator.css';

const ProposalGenerator = ({ quotationData, formData, onClose }) => {
  const { currency } = useQuotation();
  const { user, company } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Proposal customization state
  const [proposalData, setProposalData] = useState({
    // Basic Information
    title: `${formData.projectTitle || 'Web Development Project'} - Project Proposal`,
    subtitle: 'Professional Development Services',
    proposalNumber: `PROP-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleDateString(),
    validUntil: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString(),
    
    // Company Information
    companyName: company.name || 'TechQuote Pro',
    companyAddress: company.address || {
      street: '123 Business Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400001'
    },
    companyPhone: company.phone || '+91 98765 43210',
    companyEmail: company.email || 'info@techquotepro.com',
    companyWebsite: company.website || 'www.techquotepro.com',
    
    // Executive Summary
    executiveSummary: {
      projectOverview: '',
      businessObjectives: '',
      proposedSolution: '',
      keyBenefits: [],
      timeline: '',
      investment: ''
    },
    
    // Scope of Work
    scopeOfWork: {
      included: [],
      excluded: [],
      deliverables: [],
      assumptions: []
    },
    
    // Technical Approach
    technicalApproach: {
      methodology: 'Agile Development',
      technologies: [],
      architecture: '',
      qualityAssurance: '',
      security: ''
    },
    
    // Team & Resources
    team: {
      projectManager: { name: '', role: 'Project Manager', experience: '' },
      leadDeveloper: { name: '', role: 'Lead Developer', experience: '' },
      designer: { name: '', role: 'UI/UX Designer', experience: '' },
      qaEngineer: { name: '', role: 'QA Engineer', experience: '' }
    },
    
    // Risk Management
    riskManagement: {
      identifiedRisks: [],
      mitigationStrategies: [],
      contingencyPlan: ''
    },
    
    // Success Metrics
    successMetrics: {
      technicalMetrics: [],
      businessMetrics: [],
      userExperienceMetrics: []
    },
    
    // Terms & Conditions
    terms: {
      paymentSchedule: 'As per quotation',
      intellectualProperty: 'Standard IP transfer upon full payment',
      warranty: '6 months warranty on developed software',
      support: '30 days free support post-delivery',
      changeRequests: 'Additional changes will be quoted separately',
      termination: 'Either party may terminate with 30 days notice'
    },
    
    // Customization Options
    includeCompanyBranding: true,
    includeTeamProfiles: true,
    includeDetailedTimeline: true,
    includeRiskAssessment: true,
    includeSuccessMetrics: true,
    includeAppendices: true,
    
    // Styling Options
    colorScheme: 'professional', // professional, modern, minimal, corporate
    template: 'comprehensive', // comprehensive, executive, technical
    logoPosition: 'header' // header, sidebar, footer
  });

  const totalSteps = 5;

  useEffect(() => {
    // Auto-populate proposal data from quotation and form data
    populateProposalData();
    
    // Track proposal generator access
    analytics.trackEvent({
      type: 'proposal_generator_opened',
      projectType: formData.projectType,
      quotationValue: quotationData.totals?.totalCost
    });
  }, [quotationData, formData]);

  const populateProposalData = () => {
    const updatedData = { ...proposalData };
    
    // Executive Summary
    updatedData.executiveSummary = {
      projectOverview: `We are pleased to present this comprehensive proposal for ${formData.projectTitle || 'your web development project'}. This ${formData.projectType || 'custom solution'} will be designed to meet your specific business requirements and deliver exceptional user experience.`,
      
      businessObjectives: formData.projectGoal || 'Enhance digital presence and streamline business operations through innovative web solutions.',
      
      proposedSolution: `Our team will develop a ${formData.projectType || 'custom web application'} using modern technologies including ${(formData.frontendFramework || []).join(', ')} for frontend and ${(formData.backendFramework || []).join(', ')} for backend development.`,
      
      keyBenefits: [
        'Modern, responsive design optimized for all devices',
        'Scalable architecture for future growth',
        'Enhanced user experience and engagement',
        'Improved operational efficiency',
        'Professional maintenance and support'
      ],
      
      timeline: quotationData.timeline?.totalDuration || '8-12 weeks',
      investment: formatCurrency(quotationData.totals?.totalCost || 0, currency)
    };

    // Scope of Work
    updatedData.scopeOfWork = {
      included: [
        'Project discovery and requirement analysis',
        'UI/UX design and prototyping',
        'Frontend and backend development',
        'Database design and implementation',
        'Quality assurance and testing',
        'Deployment and go-live support',
        'Documentation and training',
        '30 days post-launch support'
      ],
      excluded: [
        'Third-party licensing costs',
        'Ongoing hosting and maintenance (quoted separately)',
        'Content creation and copywriting',
        'Marketing and SEO services',
        'Hardware procurement'
      ],
      deliverables: quotationData.phases?.map(phase => ({
        name: phase.name,
        description: phase.description,
        timeline: phase.duration
      })) || [],
      assumptions: [
        'Client will provide necessary content and assets on time',
        'Client has necessary licenses for required third-party services',
        'Project requirements will remain stable during development',
        'Client will provide timely feedback during review cycles'
      ]
    };

    // Technical Approach
    updatedData.technicalApproach = {
      methodology: 'Agile Development with Scrum framework',
      technologies: [
        ...(formData.programmingLanguage || []),
        ...(formData.frontendFramework || []),
        ...(formData.backendFramework || []),
        ...(formData.databaseType || [])
      ],
      architecture: `We will implement a ${formData.designType || 'modern'} architecture ensuring scalability, security, and maintainability.`,
      qualityAssurance: 'Comprehensive testing including unit tests, integration tests, and user acceptance testing.',
      security: 'Implementation of industry-standard security practices including data encryption, secure authentication, and regular security audits.'
    };

    setProposalData(updatedData);
  };

  const handleInputChange = (section, field, value) => {
    setProposalData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section, field, index, value) => {
    setProposalData(prev => {
      const newArray = [...prev[section][field]];
      newArray[index] = value;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const addArrayItem = (section, field, defaultValue = '') => {
    setProposalData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], defaultValue]
      }
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setProposalData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1: // Basic Information
        if (!proposalData.title.trim()) {
          newErrors.title = 'Proposal title is required';
        }
        if (!proposalData.companyName.trim()) {
          newErrors.companyName = 'Company name is required';
        }
        break;
      case 2: // Executive Summary
        if (!proposalData.executiveSummary.projectOverview.trim()) {
          newErrors.projectOverview = 'Project overview is required';
        }
        break;
      case 3: // Scope & Technical
        if (proposalData.scopeOfWork.included.length === 0) {
          newErrors.scopeIncluded = 'At least one included item is required';
        }
        break;
      case 4: // Team & Terms
        // Optional validation
        break;
      case 5: // Review & Generate
        // Final validation
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const generateProposal = async (downloadOnly = false) => {
    setIsGenerating(true);
    
    try {
      // Track proposal generation
      analytics.trackEvent({
        type: 'proposal_generated',
        template: proposalData.template,
        colorScheme: proposalData.colorScheme,
        includeTeamProfiles: proposalData.includeTeamProfiles
      });

      const pdfDoc = await generateProposalPDF(proposalData, quotationData, formData, currency);
      
      if (downloadOnly) {
        const filename = `${proposalData.title.replace(/[^a-z0-9]/gi, '_')}_${proposalData.proposalNumber}.pdf`;
        pdfDoc.save(filename);
        
        // Track download
        trackConversion('proposal_downloaded', quotationData.totals?.totalCost);
      } else {
        // Preview mode
        const pdfBlob = pdfDoc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      }
      
    } catch (error) {
      console.error('Error generating proposal:', error);
      setErrors({ generation: 'Failed to generate proposal. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInformation();
      case 2:
        return renderExecutiveSummary();
      case 3:
        return renderScopeAndTechnical();
      case 4:
        return renderTeamAndTerms();
      case 5:
        return renderReviewAndGenerate();
      default:
        return null;
    }
  };

  const renderBasicInformation = () => (
    <div className="proposal-step">
      <div className="step-header">
        <h3><i className="fas fa-info-circle"></i> Basic Information</h3>
        <p>Configure the basic details for your proposal</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label>Proposal Title *</label>
          <input
            type="text"
            value={proposalData.title}
            onChange={(e) => setProposalData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter proposal title"
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>
        
        <div className="form-group">
          <label>Subtitle</label>
          <input
            type="text"
            value={proposalData.subtitle}
            onChange={(e) => setProposalData(prev => ({ ...prev, subtitle: e.target.value }))}
            placeholder="Enter subtitle"
          />
        </div>
        
        <div className="form-group">
          <label>Company Name *</label>
          <input
            type="text"
            value={proposalData.companyName}
            onChange={(e) => setProposalData(prev => ({ ...prev, companyName: e.target.value }))}
            placeholder="Enter company name"
            className={errors.companyName ? 'error' : ''}
          />
          {errors.companyName && <div className="error-message">{errors.companyName}</div>}
        </div>
        
        <div className="form-group">
          <label>Valid Until</label>
          <input
            type="date"
            value={new Date(proposalData.validUntil).toISOString().split('T')[0]}
            onChange={(e) => setProposalData(prev => ({ ...prev, validUntil: new Date(e.target.value).toLocaleDateString() }))}
          />
        </div>
        
        <div className="form-group">
          <label>Template Style</label>
          <select
            value={proposalData.template}
            onChange={(e) => setProposalData(prev => ({ ...prev, template: e.target.value }))}
          >
            <option value="comprehensive">📄 Comprehensive</option>
            <option value="executive">📋 Executive Summary</option>
            <option value="technical">⚙️ Technical Focus</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Color Scheme</label>
          <select
            value={proposalData.colorScheme}
            onChange={(e) => setProposalData(prev => ({ ...prev, colorScheme: e.target.value }))}
          >
            <option value="professional">💼 Professional Blue</option>
            <option value="modern">✨ Modern Purple</option>
            <option value="minimal">⚪ Minimal Gray</option>
            <option value="corporate">🏢 Corporate Navy</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderExecutiveSummary = () => (
    <div className="proposal-step">
      <div className="step-header">
        <h3><i className="fas fa-chart-line"></i> Executive Summary</h3>
        <p>Craft a compelling executive summary for your proposal</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group full-width">
          <label>Project Overview *</label>
          <textarea
            value={proposalData.executiveSummary.projectOverview}
            onChange={(e) => handleInputChange('executiveSummary', 'projectOverview', e.target.value)}
            rows="4"
            placeholder="Provide a high-level overview of the project..."
            className={errors.projectOverview ? 'error' : ''}
          />
          {errors.projectOverview && <div className="error-message">{errors.projectOverview}</div>}
        </div>
        
        <div className="form-group full-width">
          <label>Business Objectives</label>
          <textarea
            value={proposalData.executiveSummary.businessObjectives}
            onChange={(e) => handleInputChange('executiveSummary', 'businessObjectives', e.target.value)}
            rows="3"
            placeholder="Describe the business objectives this project will achieve..."
          />
        </div>
        
        <div className="form-group full-width">
          <label>Proposed Solution</label>
          <textarea
            value={proposalData.executiveSummary.proposedSolution}
            onChange={(e) => handleInputChange('executiveSummary', 'proposedSolution', e.target.value)}
            rows="4"
            placeholder="Describe your proposed solution approach..."
          />
        </div>
        
        <div className="form-group full-width">
          <label>Key Benefits</label>
          <div className="dynamic-list">
            {proposalData.executiveSummary.keyBenefits.map((benefit, index) => (
              <div key={index} className="list-item">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleArrayChange('executiveSummary', 'keyBenefits', index, e.target.value)}
                  placeholder="Enter key benefit"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('executiveSummary', 'keyBenefits', index)}
                  className="remove-btn"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('executiveSummary', 'keyBenefits', '')}
              className="add-btn"
            >
              <i className="fas fa-plus"></i> Add Benefit
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScopeAndTechnical = () => (
    <div className="proposal-step">
      <div className="step-header">
        <h3><i className="fas fa-cogs"></i> Scope & Technical Approach</h3>
        <p>Define project scope and technical methodology</p>
      </div>
      
      <div className="scope-technical-grid">
        <div className="scope-section">
          <h4>Scope of Work</h4>
          
          <div className="form-group">
            <label>Included Services *</label>
            <div className="dynamic-list">
              {proposalData.scopeOfWork.included.map((item, index) => (
                <div key={index} className="list-item">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('scopeOfWork', 'included', index, e.target.value)}
                    placeholder="Enter included service"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('scopeOfWork', 'included', index)}
                    className="remove-btn"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('scopeOfWork', 'included', '')}
                className="add-btn"
              >
                <i className="fas fa-plus"></i> Add Service
              </button>
            </div>
            {errors.scopeIncluded && <div className="error-message">{errors.scopeIncluded}</div>}
          </div>
          
          <div className="form-group">
            <label>Excluded Services</label>
            <div className="dynamic-list">
              {proposalData.scopeOfWork.excluded.map((item, index) => (
                <div key={index} className="list-item">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('scopeOfWork', 'excluded', index, e.target.value)}
                    placeholder="Enter excluded service"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('scopeOfWork', 'excluded', index)}
                    className="remove-btn"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('scopeOfWork', 'excluded', '')}
                className="add-btn"
              >
                <i className="fas fa-plus"></i> Add Exclusion
              </button>
            </div>
          </div>
        </div>
        
        <div className="technical-section">
          <h4>Technical Approach</h4>
          
          <div className="form-group">
            <label>Development Methodology</label>
            <select
              value={proposalData.technicalApproach.methodology}
              onChange={(e) => handleInputChange('technicalApproach', 'methodology', e.target.value)}
            >
              <option value="Agile Development">Agile Development</option>
              <option value="Waterfall">Waterfall</option>
              <option value="Scrum">Scrum</option>
              <option value="Kanban">Kanban</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Architecture Overview</label>
            <textarea
              value={proposalData.technicalApproach.architecture}
              onChange={(e) => handleInputChange('technicalApproach', 'architecture', e.target.value)}
              rows="3"
              placeholder="Describe the technical architecture..."
            />
          </div>
          
          <div className="form-group">
            <label>Quality Assurance</label>
            <textarea
              value={proposalData.technicalApproach.qualityAssurance}
              onChange={(e) => handleInputChange('technicalApproach', 'qualityAssurance', e.target.value)}
              rows="2"
              placeholder="Describe QA processes..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamAndTerms = () => (
    <div className="proposal-step">
      <div className="step-header">
        <h3><i className="fas fa-users"></i> Team & Terms</h3>
        <p>Configure team information and project terms</p>
      </div>
      
      <div className="team-terms-grid">
        <div className="team-section">
          <h4>Project Team</h4>
          <div className="team-toggle">
            <label>
              <input
                type="checkbox"
                checked={proposalData.includeTeamProfiles}
                onChange={(e) => setProposalData(prev => ({ ...prev, includeTeamProfiles: e.target.checked }))}
              />
              Include team profiles in proposal
            </label>
          </div>
          
          {proposalData.includeTeamProfiles && (
            <div className="team-members">
              {Object.entries(proposalData.team).map(([key, member]) => (
                <div key={key} className="team-member">
                  <h5>{member.role}</h5>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      team: {
                        ...prev.team,
                        [key]: { ...member, name: e.target.value }
                      }
                    }))}
                    placeholder="Enter team member name"
                  />
                  <textarea
                    value={member.experience}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      team: {
                        ...prev.team,
                        [key]: { ...member, experience: e.target.value }
                      }
                    }))}
                    rows="2"
                    placeholder="Enter experience and qualifications"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="terms-section">
          <h4>Terms & Conditions</h4>
          
          <div className="form-group">
            <label>Payment Schedule</label>
            <textarea
              value={proposalData.terms.paymentSchedule}
              onChange={(e) => handleInputChange('terms', 'paymentSchedule', e.target.value)}
              rows="2"
              placeholder="Describe payment terms..."
            />
          </div>
          
          <div className="form-group">
            <label>Warranty Period</label>
            <input
              type="text"
              value={proposalData.terms.warranty}
              onChange={(e) => handleInputChange('terms', 'warranty', e.target.value)}
              placeholder="e.g., 6 months warranty"
            />
          </div>
          
          <div className="form-group">
            <label>Support Period</label>
            <input
              type="text"
              value={proposalData.terms.support}
              onChange={(e) => handleInputChange('terms', 'support', e.target.value)}
              placeholder="e.g., 30 days free support"
            />
          </div>
        </div>
      </div>
      
      <div className="proposal-options">
        <h4>Proposal Options</h4>
        <div className="options-grid">
          <label className="option-item">
            <input
              type="checkbox"
              checked={proposalData.includeDetailedTimeline}
              onChange={(e) => setProposalData(prev => ({ ...prev, includeDetailedTimeline: e.target.checked }))}
            />
            <span>Include detailed timeline</span>
          </label>
          
          <label className="option-item">
            <input
              type="checkbox"
              checked={proposalData.includeRiskAssessment}
              onChange={(e) => setProposalData(prev => ({ ...prev, includeRiskAssessment: e.target.checked }))}
            />
            <span>Include risk assessment</span>
          </label>
          
          <label className="option-item">
            <input
              type="checkbox"
              checked={proposalData.includeSuccessMetrics}
              onChange={(e) => setProposalData(prev => ({ ...prev, includeSuccessMetrics: e.target.checked }))}
            />
            <span>Include success metrics</span>
          </label>
          
          <label className="option-item">
            <input
              type="checkbox"
              checked={proposalData.includeAppendices}
              onChange={(e) => setProposalData(prev => ({ ...prev, includeAppendices: e.target.checked }))}
            />
            <span>Include appendices</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderReviewAndGenerate = () => (
    <div className="proposal-step">
      <div className="step-header">
        <h3><i className="fas fa-check-circle"></i> Review & Generate</h3>
        <p>Review your proposal configuration and generate the document</p>
      </div>
      
      <div className="proposal-summary">
        <div className="summary-section">
          <h4>Proposal Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Title:</span>
              <span className="value">{proposalData.title}</span>
            </div>
            <div className="summary-item">
              <span className="label">Template:</span>
              <span className="value">{proposalData.template}</span>
            </div>
            <div className="summary-item">
              <span className="label">Color Scheme:</span>
              <span className="value">{proposalData.colorScheme}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Value:</span>
              <span className="value highlight">{formatCurrency(quotationData.totals?.totalCost || 0, currency)}</span>
            </div>
          </div>
        </div>
        
        <div className="included-sections">
          <h4>Included Sections</h4>
          <div className="sections-list">
            <div className="section-item">
              <i className="fas fa-check"></i>
              <span>Executive Summary</span>
            </div>
            <div className="section-item">
              <i className="fas fa-check"></i>
              <span>Scope of Work</span>
            </div>
            <div className="section-item">
              <i className="fas fa-check"></i>
              <span>Technical Approach</span>
            </div>
            <div className="section-item">
              <i className="fas fa-check"></i>
              <span>Project Timeline</span>
            </div>
            <div className="section-item">
              <i className="fas fa-check"></i>
              <span>Investment & Terms</span>
            </div>
            {proposalData.includeTeamProfiles && (
              <div className="section-item">
                <i className="fas fa-check"></i>
                <span>Team Profiles</span>
              </div>
            )}
            {proposalData.includeRiskAssessment && (
              <div className="section-item">
                <i className="fas fa-check"></i>
                <span>Risk Assessment</span>
              </div>
            )}
            {proposalData.includeSuccessMetrics && (
              <div className="section-item">
                <i className="fas fa-check"></i>
                <span>Success Metrics</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {errors.generation && (
        <div className="error-message global-error">
          <i className="fas fa-exclamation-triangle"></i>
          {errors.generation}
        </div>
      )}
      
      <div className="generation-actions">
        <button
          type="button"
          onClick={() => generateProposal(false)}
          className="btn btn-secondary"
          disabled={isGenerating}
        >
          <i className="fas fa-eye"></i>
          Preview Proposal
        </button>
        
        <button
          type="button"
          onClick={() => generateProposal(true)}
          className="btn btn-primary"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" />
              Generating...
            </>
          ) : (
            <>
              <i className="fas fa-download"></i>
              Download Proposal
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="proposal-generator-overlay">
      <div className="proposal-generator">
        <div className="proposal-header">
          <div className="header-content">
            <h2>
              <i className="fas fa-file-contract"></i>
              Proposal Generator
            </h2>
            <p>Create a professional project proposal from your quotation</p>
          </div>
          
          <button onClick={onClose} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="proposal-progress">
          <div className="progress-steps">
            {Array.from({ length: totalSteps }, (_, i) => {
              const step = i + 1;
              return (
                <div
                  key={step}
                  className={`progress-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                  onClick={() => currentStep > step && setCurrentStep(step)}
                >
                  <div className="step-number">
                    {currentStep > step ? <i className="fas fa-check"></i> : step}
                  </div>
                  <div className="step-label">
                    {getStepLabel(step)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="proposal-content">
          {renderStepContent()}
        </div>
        
        <div className="proposal-navigation">
          <div className="nav-left">
            {currentStep > 1 && (
              <button onClick={prevStep} className="btn btn-secondary">
                <i className="fas fa-arrow-left"></i>
                Previous
              </button>
            )}
          </div>
          
          <div className="nav-center">
            <span className="step-info">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          
          <div className="nav-right">
            {currentStep < totalSteps ? (
              <button onClick={nextStep} className="btn btn-primary">
                Next
                <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <button onClick={onClose} className="btn btn-success">
                <i className="fas fa-check"></i>
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getStepLabel = (step) => {
  const labels = {
    1: 'Basic Info',
    2: 'Executive Summary',
    3: 'Scope & Technical',
    4: 'Team & Terms',
    5: 'Review & Generate'
  };
  return labels[step];
};

export default ProposalGenerator;
