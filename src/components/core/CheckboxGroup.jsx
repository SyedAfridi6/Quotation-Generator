import React from 'react';

const CheckboxGroup = ({ options, name, selectedValues, onChange, disabled = false }) => (
  <div className="checkbox-grid">
    {options.map(option => (
      <div key={option.value} className="checkbox-group">
        <input
          type="checkbox"
          id={`${name}-${option.value}`}
          name={name}
          value={option.value}
          checked={selectedValues.includes(option.value)}
          onChange={onChange}
          disabled={disabled}
        />
        <label htmlFor={`${name}-${option.value}`}>{option.label}</label>
      </div>
    ))}
  </div>
);

export default CheckboxGroup;
