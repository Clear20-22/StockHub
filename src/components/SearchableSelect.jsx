import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  label = "",
  required = false,
  displayKey = "name",
  valueKey = "id",
  searchKeys = ["name"],
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true;
    return searchKeys.some(key => 
      option[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Get selected option display text
  const getSelectedText = () => {
    if (!value) return placeholder;
    const selectedOption = options.find(option => option[valueKey] === value);
    return selectedOption ? selectedOption[displayKey] : placeholder;
  };

  // Handle option selection
  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div
        className="relative w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span className={`truncate ${!value ? 'text-gray-500' : 'text-gray-900'}`}>
            {getSelectedText()}
          </span>
          <div className="flex items-center space-x-1">
            {value && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                type="button"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <ChevronDown 
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search options..."
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option[valueKey]}
                  onClick={() => handleSelect(option)}
                  className={`w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors ${
                    option[valueKey] === value ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                  }`}
                  type="button"
                >
                  <div className="truncate">{option[displayKey]}</div>
                  {/* Show additional info if available */}
                  {option.email && (
                    <div className="text-xs text-gray-500 truncate">{option.email}</div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
