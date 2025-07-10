import React, { useState } from 'react';

const DatasetBrowser = ({ tomograms, loading, onDatasetClick }) => {
  const [imageErrors, setImageErrors] = useState({});

  // Handle image loading errors gracefully
  const handleImageError = (tomogramId) => {
    setImageErrors(prev => ({ ...prev, [tomogramId]: true }));
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="dataset-browser">
        <header className="database-header">
          <h1>University of Chicago Tomography Database</h1>
          <nav className="main-nav">
            <span>About</span>
            <span className="active">Browse Database</span>
            <span>Upload</span>
            <span>Contact</span>
          </nav>
        </header>
        <div className="loading-state">
          <p>Loading datasets...</p>
        </div>
      </div>
    );
  }

  // Handle empty dataset
  if (!tomograms || tomograms.length === 0) {
    return (
      <div className="dataset-browser">
        <header className="database-header">
          <h1>University of Chicago Tomography Database</h1>
          <nav className="main-nav">
            <span>About</span>
            <span className="active">Browse Database</span>
            <span>Upload</span>
            <span>Contact</span>
          </nav>
        </header>
        <div className="empty-state">
          <p>No datasets found.</p>
        </div>
      </div>
    );
  }

  // Render tomogram grid with real images
  return (
    <div className="dataset-browser">
      <header className="database-header">
        <div className="header-content">
          <h1>University of Chicago Tomography Database</h1>
          <nav className="main-nav">
            <span>About</span>
            <span className="active">Browse Database</span>
            <span>Upload</span>
            <span>Contact</span>
          </nav>
        </div>
      </header>
      
      <main className="browser-content">
        <div className="page-intro">
          <h2>Browse Database</h2>
          <p>Explore our collection of electron tomography datasets from University of Chicago research laboratories.</p>
        </div>
        
        <div className="tomogram-grid">
          {tomograms.map((tomogram) => (
            <div 
              key={tomogram.tomogramId} 
              className="tomogram-card"
              onClick={() => onDatasetClick && onDatasetClick(tomogram)}
            >
              <div className="card-image">
                {tomogram.thumbnailUrl && !imageErrors[tomogram.tomogramId] ? (
                  <img 
                    src={tomogram.thumbnailUrl} 
                    alt={tomogram.title}
                    onError={() => handleImageError(tomogram.tomogramId)}
                    className="tomogram-thumbnail"
                  />
                ) : (
                  <div className="placeholder-image">
                    <span>EM Image</span>
                    <small>{tomogram.tomogramId}</small>
                  </div>
                )}
                <div className="image-overlay">
                  <div className="overlay-content">
                    <span className="dataset-id">{tomogram.tomogramId}</span>
                    <div className="image-info">
                      <span>{tomogram.datasetSize}</span>
                      <span>{tomogram.fileTypes.length} files</span>
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
      </main>
    </div>
  );
};

export default DatasetBrowser; 