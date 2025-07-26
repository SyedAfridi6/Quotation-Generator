import { CURRENCY_RATES, CURRENCY_SYMBOLS } from './pricing.js';

export const formatCurrency = (amount, currencyCode = 'INR', locale = 'en-IN') => {
  if (!amount && amount !== 0) return 'N/A';
  
  const convertedAmount = convertCurrency(amount, 'INR', currencyCode);
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  
  // Format based on currency
  switch (currencyCode) {
    case 'INR':
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(convertedAmount);
      
    case 'USD':
    case 'CAD':
    case 'AUD':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(convertedAmount);
      
    case 'EUR':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(convertedAmount);
      
    case 'GBP':
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(convertedAmount);
      
    default:
      return `${symbol}${Math.round(convertedAmount).toLocaleString()}`;
  }
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to INR first if not already
  let inrAmount = amount;
  if (fromCurrency !== 'INR') {
    inrAmount = amount / CURRENCY_RATES[fromCurrency];
  }
  
  // Convert from INR to target currency
  if (toCurrency === 'INR') {
    return inrAmount;
  }
  
  return inrAmount * CURRENCY_RATES[toCurrency];
};

export const formatPercentage = (value, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatDuration = (weeks) => {
  if (weeks === 1) return '1 week';
  if (weeks < 4) return `${weeks} weeks`;
  
  const months = Math.floor(weeks / 4);
  const remainingWeeks = weeks % 4;
  
  let result = '';
  if (months > 0) {
    result += `${months} month${months > 1 ? 's' : ''}`;
  }
  if (remainingWeeks > 0) {
    if (result) result += ' ';
    result += `${remainingWeeks} week${remainingWeeks > 1 ? 's' : ''}`;
  }
  
  return result;
};

export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-IN');
    case 'medium':
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    case 'long':
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    default:
      return d.toLocaleDateString('en-IN');
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
};

export const capitalizeFirst = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatPhoneNumber = (phone) => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Indian phone numbers
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  // Format with country code
  if (cleaned.length > 10) {
    const countryCode = cleaned.slice(0, -10);
    const number = cleaned.slice(-10);
    return `+${countryCode} ${number.slice(0, 5)} ${number.slice(5)}`;
  }
  
  return phone; // Return as-is if can't format
};
