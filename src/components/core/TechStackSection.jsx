import React from 'react';
import CheckboxGroup from './CheckboxGroup';

const TechStackSection = ({ title, name, options, selectedValues, onChange, isEnabled, onToggle }) => (
  <div className="form-group">
    <div className="checkbox-head">
      <input
        type="checkbox"
        id={`${name}-head`}
        checked={isEnabled}
        onChange={onToggle}
      />
      <label htmlFor={`${name}-head`}>{title}</label>
    </div>
    <div className="checkbox-list">
      <CheckboxGroup
        options={options}
        name={name}
        selectedValues={selectedValues}
        onChange={onChange}
        disabled={!isEnabled}
      />
    </div>
  </div>
);

export default TechStackSection;
