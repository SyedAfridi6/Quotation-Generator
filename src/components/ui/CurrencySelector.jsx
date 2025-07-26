import React from 'react';
import PropTypes from 'prop-types';
import './styles/CurrencySelector.css';

const CurrencySelector = ({ currency, onCurrencyChange }) => {
  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' }
  ];

  return (
    <div className="currency-selector">
      <label className="currency-label">
        <i className="fas fa-coins"></i>
        Currency:
      </label>
      <select
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value)}
        className="currency-select"
      >
        {currencies.map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.flag} {curr.code} - {curr.name}
          </option>
        ))}
      </select>
    </div>
  );
};

CurrencySelector.propTypes = {
  currency: PropTypes.string.isRequired,
  onCurrencyChange: PropTypes.func.isRequired
};

export default CurrencySelector;
