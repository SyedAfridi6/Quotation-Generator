import React from 'react';
import PropTypes from 'prop-types';
import '../ui/styles/FormSection.css';

const FormSection = ({ 
  title, 
  icon, 
  description, 
  stepNumber, 
  isRequired = false, 
  className = '', 
  children 
}) => {
  return (
    <div className={`form-section ${className}`}>
      <div className="form-section-header">
        <div className="section-title-container">
          {icon && <i className={`section-icon ${icon}`}></i>}
          <div className="section-title-wrapper">
            <h3 className="section-title">
              {stepNumber && <span className="step-number"> Step {stepNumber}:</span>}
              {title}
              {isRequired && <span className="required-indicator">*</span>}
            </h3>
            {description && <p className="section-description">{description}</p>}
          </div>
        </div>
      </div>
      <div className="form-section-content">
        {children}
      </div>
    </div>
  );
};

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  description: PropTypes.string,
  stepNumber: PropTypes.number,
  isRequired: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default FormSection;
