import React, { useState, useMemo } from 'react';
import SearchInterface from './SearchInterface';

// Helper function to get file count from Supabase data
const getFileCount = (tomogram) => {
  const paths = [
    tomogram.raw_data_path,
    tomogram.processed_data_path,
    tomogram.reconstruction_path,
    ...(tomogram.additional_files_paths || [])
  ].filter(Boolean);
  return paths.length;
};

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
        const matchesTitle = tomogram.title?.toLowerCase().includes(searchLower) || false;
        const matchesDescription = tomogram.description?.toLowerCase().includes(searchLower) || false;
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Species filter
      if (filters.species && tomogram.organism !== filters.species) {
        return false;
      }

      // Microscope type filter
      if (filters.microscopeType && tomogram.microscope !== filters.microscopeType) {
        return false;
      }

              // Date range filter - only apply if dates are valid and complete
        if (filters.dateRange.start || filters.dateRange.end) {
          const tomogramDate = new Date(tomogram.created_at);
        
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

      // Filter by file types
      if (filters.fileTypes.length > 0) {
        const hasMatchingFileType = filters.fileTypes.some(filterType =>
          tomogram.file_types && tomogram.file_types.includes(filterType)
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
                key={tomogram.tomogram_id}
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
                      <span className="dataset-id">{tomogram.tomogram_id}</span>
                      <div className="image-info">
                        <span>2.0 GB</span>
                        <span>{getFileCount(tomogram)} files</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="card-title">{tomogram.title}</h3>
                  <div className="card-metadata">
                                                            <p><strong>Species:</strong> {tomogram.organism}</p>
                    <p><strong>Date:</strong> {tomogram.created_at?.split('T')[0]}</p>
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