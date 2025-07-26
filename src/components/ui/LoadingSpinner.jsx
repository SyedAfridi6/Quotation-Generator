import React from 'react';
import PropTypes from 'prop-types';
import './styles/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', text = '' }) => {
  return (
    <div className={`loading-spinner ${size} ${color}`}>
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger']),
  text: PropTypes.string
};

export default LoadingSpinner;
