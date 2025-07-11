import React, { useState, useMemo } from 'react';
import SearchInterface from './SearchInterface';

const DatasetBrowser = ({ tomograms, loading, onDatasetClick, onAddDatasetClick }) => {
  const [filters, setFilters] = useState({
    searchText: '',
    species: '',
    microscopeType: '',
    dateRange: { start: '', end: '' },
    fileTypes: []
  });

  // Filter tomograms based on current filters
  const filteredTomograms = useMemo(() => {
    if (!tomograms) return [];

    return tomograms.filter(tomogram => {
      // Text search
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesTitle = tomogram.title.toLowerCase().includes(searchLower);
        const matchesDescription = tomogram.description.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Species filter
      if (filters.species && tomogram.species !== filters.species) {
        return false;
      }

      // Microscope type filter
      if (filters.microscopeType && tomogram.microscopeType !== filters.microscopeType) {
        return false;
      }

      // Date range filter - only apply if dates are valid and complete
      if (filters.dateRange.start || filters.dateRange.end) {
        const tomogramDate = new Date(tomogram.publicationDate);
        
        // Check start date
        if (filters.dateRange.start) {
          // Only apply filter if date is complete and valid (YYYY-MM-DD format)
          const isValidStartDate = /^\d{4}-\d{2}-\d{2}$/.test(filters.dateRange.start);
          if (isValidStartDate) {
            const startDate = new Date(filters.dateRange.start);
            // Additional check that the Date object is valid
            if (!isNaN(startDate.getTime()) && tomogramDate < startDate) {
              return false;
            }
          }
        }
        
        // Check end date
        if (filters.dateRange.end) {
          // Only apply filter if date is complete and valid (YYYY-MM-DD format)
          const isValidEndDate = /^\d{4}-\d{2}-\d{2}$/.test(filters.dateRange.end);
          if (isValidEndDate) {
            const endDate = new Date(filters.dateRange.end);
            // Additional check that the Date object is valid
            if (!isNaN(endDate.getTime()) && tomogramDate > endDate) {
              return false;
            }
          }
        }
      }

      // File types filter
      if (filters.fileTypes.length > 0) {
        const hasMatchingFileType = filters.fileTypes.some(filterType => 
          tomogram.fileTypes && tomogram.fileTypes.includes(filterType)
        );
        if (!hasMatchingFileType) return false;
      }

      return true;
    });
  }, [tomograms, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading datasets...</h2>
      </div>
    );
  }

  return (
    <div className="dataset-browser">
      <header className="database-header">
        <div className="header-content">
          <h1>University of Chicago Tomography Database</h1>
          <nav className="main-nav">
            <span>About</span>
            <span className="active">Browse Database</span>
            <span 
              className="add-dataset-btn"
              onClick={onAddDatasetClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onAddDatasetClick()}
            >
              + Add Dataset
            </span>
            <span>Contact</span>
          </nav>
        </div>
      </header>

      <main className="browser-content">
        <div className="page-intro">
          <h2>Browse Database</h2>
          <p>Explore our collection of electron tomography datasets from University of Chicago research laboratories.</p>
        </div>

        {/* Search Interface */}
        <SearchInterface 
          tomograms={tomograms}
          filteredCount={filteredTomograms.length}
          onFilterChange={handleFilterChange}
        />

        {/* Results Grid */}
        {filteredTomograms.length === 0 ? (
          <div className="no-results">
            <h3>No datasets found</h3>
            <p>Try adjusting your search criteria or clearing filters.</p>
          </div>
        ) : (
          <div className="tomogram-grid">
            {filteredTomograms.map((tomogram) => (
              <div 
                key={tomogram.tomogramId}
                className="tomogram-card"
                onClick={() => onDatasetClick(tomogram)}
              >
                <div className="card-image">
                  <img 
                    src={tomogram.thumbnailUrl} 
                    alt={tomogram.title}
                    className="tomogram-thumbnail"
                  />
                  
                  {/* Scientific overlay */}
                  <div className="image-overlay">
                    <div className="overlay-content">
                      <span className="dataset-id">{tomogram.tomogramId}</span>
                      <div className="image-info">
                        <span>{tomogram.datasetSize}</span>
                        <span>{tomogram.downloadUrls.length} files</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="card-title">{tomogram.title}</h3>
                  <div className="card-metadata">
                    <p><strong>Species:</strong> {tomogram.species}</p>
                    <p><strong>Date:</strong> {tomogram.publicationDate}</p>
                  </div>
                  <div className="card-arrow">→</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DatasetBrowser; 