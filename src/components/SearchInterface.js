import React, { useState, useEffect, useMemo } from 'react';

const SearchInterface = ({ tomograms, filteredCount, onFilterChange }) => {
  const [searchText, setSearchText] = useState('');
  const [species, setSpecies] = useState('');
  const [microscopeType, setMicroscopeType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [fileTypes, setFileTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique values from tomograms for filter options
  const filterOptions = useMemo(() => {
    if (!tomograms) return { species: [], microscopeTypes: [], fileTypes: [] };
    
    const uniqueSpecies = [...new Set(tomograms.map(t => t.organism))];
    const uniqueMicroscopes = [...new Set(tomograms.map(t => t.microscope))];
    const allFileTypes = [...new Set(tomograms.flatMap(t => t.file_types || []))];
    
    return {
      species: uniqueSpecies,
      microscopeTypes: uniqueMicroscopes,
      fileTypes: allFileTypes
    };
  }, [tomograms]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({
        searchText,
        species,
        microscopeType,
        dateRange,
        fileTypes
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchText, species, microscopeType, dateRange, fileTypes, onFilterChange]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSpeciesChange = (e) => {
    setSpecies(e.target.value);
  };

  const handleMicroscopeChange = (e) => {
    setMicroscopeType(e.target.value);
  };

  // Helper function to check if a date is valid and complete
  const isValidCompleteDate = (dateString) => {
    if (!dateString) return true; // Empty is considered valid (no filter)
    
    // Check if it matches YYYY-MM-DD format
    const formatRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!formatRegex.test(dateString)) return false;
    
    // Check if it's a valid date
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const handleDateChange = (field, value) => {
    const input = document.getElementById(field === 'start' ? 'start-date' : 'end-date');
    const cursorPosition = input ? input.selectionStart : value.length;
    const isTypingAtEnd = cursorPosition === value.length;
    
    // Remove non-numeric chars except hyphens first
    let cleanValue = value.replace(/[^0-9-]/g, '');
    
    // Preserve manually entered hyphens in correct positions
    const hasValidManualHyphens = /^\d{4}-$/.test(cleanValue) || /^\d{4}-\d{2}-$/.test(cleanValue);
    
    // Only auto-format if user is typing at the end of the string AND no manual hyphens
    // This preserves cursor position for mid-string edits
    if (isTypingAtEnd && !hasValidManualHyphens) {
      // Remove existing hyphens to reconstruct properly for auto-formatting
      const digitsOnly = cleanValue.replace(/-/g, '');
      
      // Auto-format with hyphens only when user continues typing past year/month boundaries
      if (digitsOnly.length > 4) {
        // Add first hyphen after year when typing 5th digit
        cleanValue = digitsOnly.slice(0, 4) + '-' + digitsOnly.slice(4);
        
        if (digitsOnly.length > 6) {
          // Add second hyphen after month when typing 7th digit
          cleanValue = digitsOnly.slice(0, 4) + '-' + digitsOnly.slice(4, 6) + '-' + digitsOnly.slice(6);
        }
      } else {
        // For 4 digits or less, just use digits
        cleanValue = digitsOnly;
      }
    }
    // If not typing at end OR has manual hyphens, preserve the current format and just validate
    
    // Limit to valid date format (max 10 characters: YYYY-MM-DD)
    if (cleanValue.length <= 10) {
      // Validate format - allow partial typing
      if (cleanValue === '' || /^\d{0,4}(-\d{0,2}(-\d{0,2})?)?$/.test(cleanValue)) {
        setDateRange(prev => ({ ...prev, [field]: cleanValue }));
        
        // Restore cursor position after state update only if we didn't auto-format
        if (!isTypingAtEnd || hasValidManualHyphens) {
          setTimeout(() => {
            if (input) {
              input.setSelectionRange(cursorPosition, cursorPosition);
            }
          }, 0);
        }
      }
    }
  };

  const handleFileTypeChange = (fileType) => {
    setFileTypes(prev => 
      prev.includes(fileType) 
        ? prev.filter(ft => ft !== fileType)
        : [...prev, fileType]
    );
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSpecies('');
    setMicroscopeType('');
    setDateRange({ start: '', end: '' });
    setFileTypes([]);
  };

  // Use filteredCount prop instead of calculating from tomograms
  const resultsCount = filteredCount !== undefined ? filteredCount : (tomograms ? tomograms.length : 0);

  return (
    <div className="search-interface">
      <div className="search-header">
        <h3>Search & Filter Datasets</h3>
        <p>{resultsCount} datasets found</p>
      </div>

      {/* Text Search - Always visible */}
      <div className="search-section">
        <label htmlFor="search-input">Search datasets:</label>
        <input
          id="search-input"
          type="text"
          placeholder="Search datasets by title or description..."
          value={searchText}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Filters Toggle Button */}
      <div className="filters-toggle-section">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="filters-toggle-btn"
          aria-expanded={showFilters}
        >
          <span>Advanced Filters</span>
          <span className={`toggle-arrow ${showFilters ? 'open' : ''}`}>▼</span>
        </button>
      </div>

      {/* Collapsible Filters Section */}
      {showFilters && (
        <div className="filters-section">
          <h4>Filters</h4>
          
          {/* Species Filter */}
          <div className="filter-group">
            <label htmlFor="species-select">Species:</label>
            <select
              id="species-select"
              value={species}
              onChange={handleSpeciesChange}
              className="filter-select"
            >
              <option value="">All Species</option>
              {filterOptions.species.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Microscope Filter */}
          <div className="filter-group">
            <label htmlFor="microscope-select">Microscope:</label>
            <select
              id="microscope-select"
              value={microscopeType}
              onChange={handleMicroscopeChange}
              className="filter-select"
            >
              <option value="">All Microscopes</option>
              {filterOptions.microscopeTypes.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="filter-group">
            <label htmlFor="start-date">Start Date:</label>
            <input
              id="start-date"
              type="text"
              placeholder="YYYY-MM-DD"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className={`date-input ${dateRange.start ? (isValidCompleteDate(dateRange.start) ? 'valid' : 'invalid') : ''}`}
              pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
              title="Please enter date in YYYY-MM-DD format"
            />
            
            <label htmlFor="end-date">End Date:</label>
            <input
              id="end-date"
              type="text"
              placeholder="YYYY-MM-DD"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className={`date-input ${dateRange.end ? (isValidCompleteDate(dateRange.end) ? 'valid' : 'invalid') : ''}`}
              pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
              title="Please enter date in YYYY-MM-DD format"
            />
          </div>

          {/* File Type Filter */}
          <div className="filter-group">
            <label>File Types:</label>
            <div className="file-type-checkboxes">
              {filterOptions.fileTypes.map(fileType => (
                <label key={fileType} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={fileTypes.includes(fileType)}
                    onChange={() => handleFileTypeChange(fileType)}
                  />
                  {fileType}
                </label>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchInterface; 