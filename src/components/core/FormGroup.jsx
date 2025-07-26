import React from 'react';
import PropTypes from 'prop-types';
import '../ui/styles/FormGroup.css';

const FormGroup = ({ 
  label, 
  required = false, 
  error = null, 
  helpText = null, 
  className = '', 
  children 
}) => {
  return (
    <div className={`form-group ${className} ${error ? 'has-error' : ''}`}>
      <label className="form-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      <div className="form-control-wrapper">
        {children}
      </div>
      {error && <div className="error-message">{error}</div>}
      {helpText && !error && <div className="help-text">{helpText}</div>}
    </div>
  );
};

FormGroup.propTypes = {
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
  helpText: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default FormGroup;
