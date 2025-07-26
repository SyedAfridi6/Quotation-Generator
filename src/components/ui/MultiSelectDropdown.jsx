import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './styles/MultiSelectDropdown.css';

const MultiSelectDropdown = ({ 
  name, 
  value = [], 
  onChange, 
  options = [], 
  placeholder = "Select options...", 
  required = false,
  searchable = true,
  maxDisplayItems = 3
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropup, setIsDropup] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({});
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Also check if click is not inside the portal menu
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', calculatePosition, { passive: true });
      window.addEventListener('resize', calculatePosition);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isOpen]);

  // Calculate dropdown position
  const calculatePosition = useCallback(() => {
    if (dropdownRef.current && isOpen) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spaceBelow = viewportHeight - rect.bottom - 10;
      const spaceAbove = rect.top - 10;
      const dropdownHeight = 320;
      
      const shouldDropUp = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
      
      let leftPosition = rect.left;
      const dropdownWidth = Math.max(rect.width, 280);
      
      // Ensure dropdown doesn't go off-screen horizontally
      if (leftPosition + dropdownWidth > viewportWidth) {
        leftPosition = viewportWidth - dropdownWidth - 10;
      }
      if (leftPosition < 10) {
        leftPosition = 10;
      }
      
      setIsDropup(shouldDropUp);
      setDropdownPosition({
        position: 'fixed',
        top: shouldDropUp ? 'auto' : rect.bottom + 2,
        bottom: shouldDropUp ? (viewportHeight - rect.top + 2) : 'auto',
        left: leftPosition,
        width: dropdownWidth,
        zIndex: 99999
      });
    }
  }, [isOpen]);

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
      setTimeout(() => {
        calculatePosition();
      }, 10);
    }
    setIsOpen(!isOpen);
  };

  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // FIXED: Simplified option toggle without stopPropagation issues
  const handleToggle = (optionValue) => {
    console.log('Toggling option:', optionValue); // Debug log
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    console.log('New value:', newValue); // Debug log
    onChange(name, newValue);
    // Don't close dropdown when selecting multiple items
    // setIsOpen(false); // Remove this line to keep dropdown open
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length <= maxDisplayItems) {
      return value.map(v => {
        const option = options.find(opt => opt.value === v);
        return option ? option.label : v;
      }).join(', ');
    }
    return `${value.length} items selected`;
  };

  const handleSearchChange = (e) => {
    e.stopPropagation();
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = (e) => {
    e.stopPropagation();
  };

  // Render dropdown menu using portal
  const renderDropdownMenu = () => {
    if (!isOpen) return null;

    const menuContent = (
      <div 
        className={`multi-select-dropdown-portal ${isDropup ? 'dropup' : ''}`}
        style={dropdownPosition}
        ref={menuRef}
        onMouseDown={(e) => e.stopPropagation()} // Prevent closing on click inside
      >
        {searchable && (
          <div className="multi-select-search" onClick={handleSearchClick}>
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="multi-select-search-input"
              autoFocus
              onMouseDown={(e) => e.stopPropagation()}
            />
            <i className="fas fa-search multi-select-search-icon"></i>
          </div>
        )}
        
        <div className="multi-select-options">
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className={`multi-select-option ${value.includes(option.value) ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(option.value);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="option-content">
                {option.icon && <i className={`option-icon ${option.icon}`}></i>}
                <span className="option-label">{option.label}</span>
              </div>
              {value.includes(option.value) && (
                <i className="fas fa-check option-check"></i>
              )}
            </div>
          ))}
        </div>
        
        {filteredOptions.length === 0 && (
          <div className="no-options">No options found</div>
        )}
        
        {/* Add a close button for better UX */}
        <div className="dropdown-footer">
          <button 
            className="dropdown-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            type="button"
          >
            <i className="fas fa-times"></i> Close
          </button>
        </div>
      </div>
    );

    return createPortal(menuContent, document.body);
  };

  // Use effect to recalculate position when opened
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [isOpen, calculatePosition]);

  return (
    <div 
      className={`multi-select-dropdown ${isOpen ? 'open' : ''}`} 
      ref={dropdownRef}
    >
      <div className="multi-select-trigger" onClick={handleDropdownToggle}>
        <span className="multi-select-value">{getDisplayText()}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} multi-select-arrow`}></i>
      </div>
      
      {renderDropdownMenu()}
    </div>
  );
};

MultiSelectDropdown.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string
  })),
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  searchable: PropTypes.bool,
  maxDisplayItems: PropTypes.number
};

export default MultiSelectDropdown;
