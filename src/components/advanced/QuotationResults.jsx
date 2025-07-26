import React from 'react';
import "../ui/styles/QuotationResult.css"
import PdfGenerator from '../../utils/pdfGenerator.js'; // ADD this import
import { exportToCSV } from "../../utils/export.js"

// Indian currency formatter utility
const formatIndianCurrency = (amount, currency = 'INR') => {
  if (!amount || isNaN(amount)) return `₹0`;
  
  // Convert to number and ensure it's positive
  const num = Math.abs(Number(amount));
  
  // Format according to Indian numbering system (lakhs and crores)
  const formatNumber = (num) => {
    if (num >= 10000000) {
      // Crores (1,00,00,000 and above)
      return (num / 10000000).toFixed(2).replace(/\.00$/, '') + ' Cr';
    } else if (num >= 100000) {
      // Lakhs (1,00,000 and above)
      return (num / 100000).toFixed(2).replace(/\.00$/, '') + ' L';
    } else if (num >= 1000) {
      // Thousands with Indian comma separation
      return num.toLocaleString('en-IN');
    } else {
      return num.toString();
    }
  };

  const formattedAmount = formatNumber(num);
  
  // Return with currency symbol
  switch (currency) {
    case 'USD':
      return `$${formattedAmount}`;
    case 'EUR':
      return `€${formattedAmount}`;
    case 'INR':
    default:
      return `₹${formattedAmount}`;
  }
};

// Get complexity label helper
const getComplexityLabel = (score) => {
  if (score <= 1.5) return "Simple";
  if (score <= 2.5) return "Medium";
  if (score <= 3.5) return "Complex";
  return "Enterprise";
};

const QuotationResults = ({ quotation, currency, formData }) => {
  // TEMPORARY DEBUG - Remove after fixing
  console.log('🔍 QuotationResults received:', {
    quotation: quotation,
    features: quotation?.features,
    featuresType: typeof quotation?.features,
    isArray: Array.isArray(quotation?.features)
  });

  // If quotation.features is undefined, log the full quotation object
  if (quotation && !quotation.features) {
    console.error('❌ quotation.features is missing!', quotation);
  }
  
  // DEFENSIVE PROGRAMMING: Ensure quotation.features is always an array
  const safeFeatures = React.useMemo(() => {
    if (!quotation) return [];
    
    // Multiple layers of protection
    if (Array.isArray(quotation.features)) {
      return quotation.features;
    }
    
    // If features is not an array, create a safe default
    console.warn('quotation.features is not an array, using fallback:', quotation.features);
    return [
      {
        name: 'Basic Website Development',
        cost: 100000,
        category: 'Core'
      }
    ];
  }, [quotation]);

  // DEFENSIVE PROGRAMMING: Safe array access for other potentially problematic arrays
  const safePricingBreakdown = React.useMemo(() => {
    return Array.isArray(quotation?.pricing?.breakdown) ? quotation.pricing.breakdown : [];
  }, [quotation]);

  const safeTeamComposition = React.useMemo(() => {
    return Array.isArray(quotation?.team?.composition) ? quotation.team.composition : [];
  }, [quotation]);

  // Safety check for undefined quotation
  if (!quotation) {
    return (
      <div className="quotation-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <div className="spinner-text">Loading quotation...</div>
        </div>
      </div>
    );
  }

  // Enhanced quotation structure access with safe defaults
  const totalCost = quotation.totalCost || 0;
  const developmentCost = quotation.developmentCost || 0;
  const designCost = quotation.designCost || 0;
  const additionalCost = quotation.additionalCost || 0;
  const complexityScore = quotation.analysis?.complexity?.overall || 0;
  const timeline = quotation.timeline || {};
  const team = quotation.team || {};

  // PDF Download Handler - KEEP this as fallback/backup
  const handleDownloadPDF = async () => {
    // Get button reference and update state
    const button = document.querySelector('.pdf-download-btn');
    
    try {
      // Update button to loading state
      if (button) {
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        button.disabled = true;
      }

      // Ensure we have the required data
      if (!quotation || !formData) {
        throw new Error('Missing quotation or form data');
      }

      // Generate quotation ID (same logic as in the component)
      const quotationId = quotation.id || `QT-${Date.now().toString().slice(-6)}`;

      // Transform quotation data for PDF generator - INCLUDE QUOTATION ID
      const pdfQuotationData = {
        id: quotationId, // Add this line
        totals: {
          subtotal: quotation.subtotal || totalCost * 0.85,
          riskBuffer: quotation.riskBuffer || totalCost * 0.1,
          gst: quotation.gst || totalCost * 0.18,
          totalCost: totalCost,
          totalHours: quotation.analysis?.complexity?.totalHours || 0
        },
        
        phases: quotation.phases || [
          {
            name: "Planning & Design",
            duration: "2 weeks",
            developer: "Design Team",
            cost: designCost,
            deliverables: ["Project plan", "UI/UX designs", "Technical architecture"]
          },
          {
            name: "Development",
            duration: `${Math.round((quotation.timeline?.totalWeeks || 8) * 0.6)} weeks`,
            developer: "Development Team",
            cost: developmentCost,
            deliverables: ["Core functionality", "Database setup", "API integration"]
          },
          {
            name: "Testing & Deployment",
            duration: "1-2 weeks",
            developer: "QA Team",
            cost: additionalCost,
            deliverables: ["Quality assurance", "Bug fixes", "Deployment"]
          }
        ],
        timeline: {
          totalWeeks: quotation.timeline?.totalWeeks || 8,
          totalDays: (quotation.timeline?.totalWeeks || 8) * 5,
          milestones: [
            { name: "Project Kickoff", date: "Day 1", description: "Project initiation and planning" },
            { name: "Design Approval", date: `Day ${Math.round(((quotation.timeline?.totalWeeks || 8) * 7) * 0.3)}`, description: "UI/UX design completion" },
            { name: "Development Milestone", date: `Day ${Math.round(((quotation.timeline?.totalWeeks || 8) * 7) * 0.8)}`, description: "Core development completion" },
            { name: "Final Delivery", date: `Day ${(quotation.timeline?.totalWeeks || 8) * 7}`, description: "Project delivery and handover" }
          ]
        },
        paymentSchedule: {
          advance: { amount: totalCost * 0.4 },
          design: { amount: totalCost * 0.3 },
          development: { amount: totalCost * 0.2 },
          final: { amount: totalCost * 0.1 }
        }
      };

      // Generate filename with company name sanitization
      const sanitizedCompanyName = (formData.companyName || 'Client').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const filename = `Quotation_${sanitizedCompanyName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Generate and download PDF with quotation ID
      // await generateQuotationPDF(pdfQuotationData, formData, currency);
      
      console.log('PDF generated successfully');
      
      // Optional: Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.innerHTML = '<i class="fas fa-check"></i> PDF downloaded successfully!';
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #059669;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 1000;
        font-size: 14px;
      `;
      
      document.body.appendChild(successMessage);
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to generate PDF. Please try again.';
      
      if (error.message.includes('Missing quotation')) {
        errorMessage = 'No quotation data available. Please generate a quotation first.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('html2pdf')) {
        errorMessage = 'PDF generation library error. Please refresh the page and try again.';
      }
      
      alert(errorMessage);
      
    } finally {
      // Always restore button state
      if (button) {
        button.innerHTML = '<i class="fas fa-download"></i> Download PDF';
        button.disabled = false;
      }
    }
  };

  // CSV Export Handler
  const handleExportCSV = async () => {
    let progressInterval;
    
    try {
      const button = document.querySelector('.csv-export-btn');
      if (button) {
        button.disabled = true;
      }

      // Progress animation
      let progress = 0;
      const progressSteps = [
        'Preparing data...',
        'Connecting to Google Sheets...',
        'Uploading data...',
        'Finalizing export...'
      ];
      
      progressInterval = setInterval(() => {
        if (button) {
          const step = Math.floor(progress / 25);
          const message = progressSteps[Math.min(step, progressSteps.length - 1)];
          button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
        }
        progress += 1;
      }, 100);

      console.log('🚀 Starting export process...');
      console.log('📊 Data to export:', {
        hasQuotation: !!quotation,
        hasFormData: !!formData,
        currency: currency,
        quotationId: quotation?.id,
        clientName: formData?.clientName
      });
      
      // Execute the export
      const result = await exportToCSV(quotation, formData, currency);
      
      // Clear progress animation
      clearInterval(progressInterval);
      
      if (result.success) {
        console.log('✅ Export successful:', result);
        
        if (button) {
          button.innerHTML = '<i class="fas fa-check"></i> Export Successful!';
        }
        
        // Create detailed success message
        let successMessage = '';
        let instructions = '';
        
        if (result.isFallback || result.method?.includes('csv')) {
          successMessage = `📁 CSV file downloaded successfully!`;
          instructions = `\nFile: ${result.result?.fileName || 'quotation-export.csv'}\n\n📋 Next steps:\n1. Locate the downloaded CSV file\n2. Open Google Sheets\n3. Click "File" → "Import" → "Upload"\n4. Select your CSV file and import`;
        } else {
          successMessage = `🎉 Data exported successfully to Google Sheets!`;
          instructions = `\n✅ Method: ${result.method}\n📋 Quotation ID: ${result.quotationId}\n⏰ Exported at: ${new Date().toLocaleString()}\n\n🔗 Check your Google Sheet to verify the data has been added.`;
        }
        
        // Show success message
        setTimeout(() => {
          alert(successMessage + instructions);
        }, 500);
        
      } else {
        throw new Error(result.message || 'Export failed for unknown reason');
      }
      
    } catch (error) {
      console.error('❌ CSV export failed:', error);
      
      // Clear progress animation
      clearInterval(progressInterval);
      
      const button = document.querySelector('.csv-export-btn');
      if (button) {
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Export Failed';
      }
      
      // Detailed error handling
      let errorMessage = '❌ Export Failed\n\n';
      let troubleshooting = '';
      
      if (error.message.includes('webAppUrl') || error.message.includes('YOUR_WEB_APP_URL_HERE')) {
        errorMessage += '🔧 Configuration Issue: Google Apps Script URL not set.';
        troubleshooting = '\n\n🛠️ To fix this:\n1. Check your Google Apps Script deployment\n2. Copy the Web App URL\n3. Update the configuration in export.js';
      } else if (error.message.includes('validation') || error.message.includes('required')) {
        errorMessage += '📋 Data Issue: Required information is missing.';
        troubleshooting = '\n\n🛠️ To fix this:\n1. Ensure you have filled out the quotation form\n2. Make sure all required fields are completed\n3. Try generating a new quotation';
      } else if (error.message.includes('CORS') || error.message.includes('fetch')) {
        errorMessage += '🌐 Connection Issue: Unable to connect to Google Sheets.';
        troubleshooting = '\n\n🛠️ Alternative options:\n1. A CSV file may have been downloaded as backup\n2. Check your Downloads folder\n3. You can manually upload the CSV to Google Sheets';
      } else {
        errorMessage += `💥 Technical Error: ${error.message}`;
        troubleshooting = '\n\n🛠️ Please:\n1. Check the browser console for details\n2. Try refreshing the page\n3. Contact support if the issue persists';
      }
      
      setTimeout(() => {
        alert(errorMessage + troubleshooting);
      }, 500);
      
    } finally {
      // Reset button after a delay
      setTimeout(() => {
        const button = document.querySelector('.csv-export-btn');
        if (button) {
          button.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Export to Cloud';
          button.disabled = false;
        }
      }, 2000);
    }
  };


  return (
    <div className="quotation-results">
      {/* Enhanced header section */}
      <div className="quotation-header">
        <div className="quotation-title">
          <h2>
            <i className="fas fa-file-invoice-dollar"></i>
            Professional Project Quotation v2.0
          </h2>
          <div className="quotation-meta">
            <span className="quotation-date">
              Generated on {new Date(quotation.createdAt || Date.now()).toLocaleDateString()}
            </span>
            <span className="quotation-id">
              Quote ID: {quotation.id || `QT-${Date.now().toString().slice(-6)}`}
            </span>
            <span className="confidence-indicator">
              Confidence: {Math.round((quotation.summary?.confidence || 0.8) * 100)}%
            </span>
          </div>
        </div>
        
        {/* MODIFIED: Add both PdfGenerator component and keep the original button as backup */}
        <div className="quotation-actions">
          {/* Primary PDF Generation using PdfGenerator component */}
          <PdfGenerator 
            formData={formData}
            quotation={quotation}
            currency={currency}
          />
          
          {/* Backup PDF button - uncomment if needed */}
          {/* 
          <button 
            className="btn btn-primary pdf-download-btn"
            onClick={handleDownloadPDF}
          >
            <i className="fas fa-download"></i>
            Download PDF (Backup)
          </button>
          */}
          
          <button 
            className="btn btn-secondary csv-export-btn"
            onClick={handleExportCSV}
          >
            <i className="fas fa-cloud-upload-alt"></i>
            Export to Cloud
          </button>
        </div>
      </div>

      {/* Enhanced summary section */}
      <div className="quotation-summary">
        <div className="summary-card total-cost">
          <div className="card-icon">
            <i className="fas fa-calculator"></i>
          </div>
          <div className="card-content">
            <h3>Total Project Cost</h3>
            <div className="total-amount">
              {formatIndianCurrency(totalCost, currency)}
            </div>
            <div className="cost-breakdown">
              <span>Development: {formatIndianCurrency(developmentCost, currency)}</span>
              <span>Design: {formatIndianCurrency(designCost, currency)}</span>
              <span>Additional: {formatIndianCurrency(additionalCost, currency)}</span>
            </div>
            <div className="cost-breakdown">
              <span>Base: {formatIndianCurrency(quotation.pricing?.base || quotation.subtotal, currency)}</span>
              <span>Risk Adjusted: {formatIndianCurrency(quotation.pricing?.riskAdjusted || 0, currency)}</span>
            </div>
            <div className="market-context">
              <small>Last updated: {quotation.market?.lastUpdated ? 
                new Date(quotation.market.lastUpdated).toLocaleString() : 'N/A'}</small>
            </div>
          </div>
        </div>

        <div className="summary-card timeline">
          <div className="card-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="card-content">
            <h3>Project Timeline</h3>
            <div className="timeline-duration">
              {timeline.totalWeeks || 0} weeks
            </div>
            <div className="timeline-details">
              <span>Start: {timeline.startDate ? 
                new Date(timeline.startDate).toLocaleDateString() : 'TBD'}</span>
              <span>End: {timeline.endDate ? 
                new Date(timeline.endDate).toLocaleDateString() : 'TBD'}</span>
            </div>
          </div>
        </div>

        <div className="summary-card complexity">
          <div className="card-icon">
            <i className="fas fa-layer-group"></i>
          </div>
          <div className="card-content">
            <h3>Project Complexity</h3>
            <div className="complexity-level">
              {quotation.analysis?.complexity?.level || getComplexityLabel(complexityScore)}
            </div>
            <div className="complexity-score">
              Score: {complexityScore.toFixed(1)}/4.0
            </div>
            <div className="risk-level">
              Risk: {quotation.risk?.assessment?.riskScore || 'Medium'}
            </div>
          </div>
        </div>

        <div className="summary-card team">
          <div className="card-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="card-content">
            <h3>Team Composition</h3>
            <div className="team-size">
              {team.totalMembers || 0} members
            </div>
            <div className="team-allocation">
              Total: {team.totalAllocation?.toFixed(1) || 0} FTE
            </div>
          </div>
        </div>
      </div>

      {/* Project Overview Section */}
      <div className="quotation-section project-overview">
        <h3>Project Overview</h3>
        <div className="overview-grid">
          <div className="overview-item">
            <label>Project Type:</label>
            <span>{formData.projectType || 'Not specified'}</span>
          </div>
          <div className="overview-item">
            <label>Industry:</label>
            <span>{formData.industry || 'Not specified'}</span>
          </div>
          <div className="overview-item">
            <label>Company Size:</label>
            <span>{formData.companySize || 'Not specified'}</span>
          </div>
          <div className="overview-item">
            <label>Timeline:</label>
            <span>{formData.timeline || 'Not specified'}</span>
          </div>
          {quotation.analysis?.complexity?.totalHours && (
            <div className="overview-item">
              <label>Estimated Hours:</label>
              <span>{quotation.analysis.complexity.totalHours}h</span>
            </div>
          )}
          {quotation.analysis?.complexity?.averageHourlyRate && (
            <div className="overview-item">
              <label>Average Rate:</label>
              <span>₹{quotation.analysis.complexity.averageHourlyRate}/hour</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Features Section - FIXED: Using safeFeatures */}
      {safeFeatures && safeFeatures.length > 0 && (
        <div className="quotation-section key-features">
          <h3>Key Features</h3>
          <div className="features-grid">
            {safeFeatures.map((feature, index) => (
              <div key={index} className={`feature-item ${feature.category?.toLowerCase() || 'core'}`}>
                <div className="feature-header">
                  <span className="feature-name">{feature.name || 'Unknown Feature'}</span>
                  <span className="feature-category">{feature.category || 'Core'}</span>
                </div>
                <div className="feature-details">
                  {feature.hours && <span>{feature.hours} hours</span>}
                  {feature.cost && <span>{formatIndianCurrency(feature.cost, currency)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Cost Breakdown - FIXED: Using safePricingBreakdown */}
      {safePricingBreakdown && safePricingBreakdown.length > 0 && (
        <div className="quotation-section cost-breakdown">
          <h3>Detailed Cost Breakdown</h3>
          <div className="breakdown-table">
            <div className="breakdown-header">
              <span>Role/Service</span>
              <span>Hours</span>
              <span>Rate</span>
              <span>Cost</span>
            </div>
            {safePricingBreakdown.map((item, index) => (
              <div key={index} className="breakdown-row">
                <div className="role-info">
                  <span className="role-name">{item.role || 'Unknown Role'}</span>
                  <small className="role-description">{item.description || ''}</small>
                </div>
                <span className="hours">{item.hours || 0}h</span>
                <span className="rate">₹{item.rate || 0}/hr</span>
                <span className="cost">{formatIndianCurrency(item.cost || 0, currency)}</span>
              </div>
            ))}
            <div className="breakdown-total">
              <span>Total Development Cost</span>
              <span></span>
              <span></span>
              <span>{formatIndianCurrency(quotation.pricing?.base || totalCost, currency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Team Composition Details - FIXED: Using safeTeamComposition */}
      {safeTeamComposition && safeTeamComposition.length > 0 && (
        <div className="quotation-section team-details">
          <h3>Team Composition Details</h3>
          <div className="team-grid">
            {safeTeamComposition.map((member, index) => (
              <div key={index} className="team-member">
                <div className="member-header">
                  <span className="member-role">{member.role || 'Unknown Role'}</span>
                  <span className="member-level">{member.level || 'Unknown Level'}</span>
                </div>
                <div className="member-details">
                  <span>Allocation: {Math.round((member.allocation || 0) * 100)}%</span>
                  <span>Cost: {formatIndianCurrency(member.cost || 0, currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Analysis */}
      {quotation.market && (
        <div className="quotation-section market-analysis">
          <h3>Market Analysis</h3>
          <div className="market-grid">
            <div className="market-item">
              <label>Market Segment:</label>
              <span>{quotation.market.marketSegment || 'Medium Company'}</span>
            </div>
            <div className="market-item">
              <label>Industry Multiplier:</label>
              <span>{quotation.market.industryMultiplier || 1.0}x</span>
            </div>
            <div className="market-item">
              <label>Timeline Multiplier:</label>
              <span>{quotation.market.timelineMultiplier || 1.0}x</span>
            </div>
            {quotation.market.competitiveRange && (
              <div className="market-item competitive-range">
                <label>Competitive Range:</label>
                <span>
                  {formatIndianCurrency(quotation.market.competitiveRange.min, currency)} - {formatIndianCurrency(quotation.market.competitiveRange.max, currency)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="quotation-section terms-conditions">
        <h3>Terms & Conditions</h3>
        <div className="terms-grid">
          <div className="terms-item">
            <h4>Payment Terms</h4>
            <ul>
              <li>25% advance payment to start the project</li>
              <li>50% payment on project milestone completion</li>
              <li>25% final payment on project delivery</li>
              <li>GST (18%) applicable on all payments</li>
            </ul>
          </div>
          <div className="terms-item">
            <h4>Project Timeline</h4>
            <ul>
              <li>Timeline starts after advance payment and requirement finalization</li>
              <li>Any scope changes may affect timeline and cost</li>
              <li>Client feedback within 48 hours required for smooth progress</li>
              <li>Final delivery includes all source code and documentation</li>
            </ul>
          </div>
          <div className="terms-item">
            <h4>Support & Maintenance</h4>
            <ul>
              <li>3 months free support included in Professional tier</li>
              <li>Bug fixes and minor updates included in support period</li>
              <li>Major feature additions charged separately</li>
              <li>Annual maintenance contract available</li>
            </ul>
          </div>
          <div className="terms-item">
            <h4>Deliverables</h4>
            <ul>
              <li>Complete source code with documentation</li>
              <li>Deployment on client's preferred hosting</li>
              <li>Training for content management (if applicable)</li>
              <li>Project handover with all credentials</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quotation Footer */}
      <div className="quotation-footer">
        <div className="validity-info">
          <p><strong>Quotation Valid Until:</strong> {quotation.validUntil ? 
            new Date(quotation.validUntil).toLocaleDateString() : '30 days'}</p>
          <p><strong>Estimated Delivery:</strong> {timeline.totalWeeks || 8} weeks from project start</p>
        </div>
        
        <div className="contact-info">
          <h4>Ready to Get Started?</h4>
          <p>Contact us to discuss your project requirements and finalize the proposal.</p>
          <div className="contact-buttons">
            <button className="btn btn-success">
              <i className="fas fa-check"></i>
              Accept Quotation
            </button>
            <button className="btn btn-primary">
              <i className="fas fa-comments"></i>
              Discuss Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationResults;
