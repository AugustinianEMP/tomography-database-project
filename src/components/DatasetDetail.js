import React, { useState } from 'react';
import { useSwipeExit } from '../utils/swipeExitHelper';

const DatasetDetail = ({ tomogram, onBackClick }) => {
  const [imageErrors, setImageErrors] = useState({});
  const [selectedAdditionalView, setSelectedAdditionalView] = useState(null); // Track which additional view is selected

  // Use shared swipe exit functionality (no auto-save for dataset detail)
  useSwipeExit(onBackClick, false);

  const handleImageError = (imageType) => {
    setImageErrors(prev => ({ ...prev, [imageType]: true }));
  };

  // Handle additional view thumbnail click
  const handleAdditionalViewClick = (index) => {
    if (selectedAdditionalView === index) {
      // If clicking the same thumbnail, deselect it (go back to main image/video)
      setSelectedAdditionalView(null);
    } else {
      // Select new additional view
      setSelectedAdditionalView(index);
    }
  };

  if (!tomogram) {
    return <div>Dataset not found</div>;
  }

  const getFileType = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    const typeMap = {
      'mrc': 'Tilt series',
      'rec': 'Reconstruction',
      'mod': 'Key movie',
      'star': 'Metadata',
      'tif': 'Key image',
      'mp4': 'Key movie'
    };
    return typeMap[extension] || extension.toUpperCase();
  };

  // Determine what to show in the main image area
  const showingAdditionalView = selectedAdditionalView !== null;
  const currentAdditionalImage = showingAdditionalView && tomogram.imageGallery 
    ? tomogram.imageGallery[selectedAdditionalView] 
    : null;

  return (
    <div className="dataset-detail">
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

      <main className="detail-content">
        <div className="detail-header">
          <button className="back-button" onClick={onBackClick}>
            ← Return to database
          </button>
          <h2 className="species-title">{tomogram.species}</h2>
        </div>

        <div className="detail-layout">
          {/* Left side - Video/Image */}
          <div className="detail-media">
            {showingAdditionalView ? (
              // Show selected additional view in main area
              <div className="image-container">
                <img 
                  src={currentAdditionalImage} 
                  alt={`Additional view ${selectedAdditionalView + 1}`}
                  className="detail-image"
                  onError={() => handleImageError(`gallery_${selectedAdditionalView}`)}
                />
                <div className="view-label">
                  {getViewLabel(selectedAdditionalView)}
                </div>
              </div>
            ) : (
              // Show main video or image
              <>
                {tomogram.videoUrl && !imageErrors.video ? (
                  <div className="video-container">
                    <video 
                      controls 
                      poster={tomogram.detailImageUrl}
                      className="tomogram-video"
                      onError={() => handleImageError('video')}
                    >
                      <source src={tomogram.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="video-info">
                      <span>Tomogram Reconstruction Video</span>
                      <span className="video-progress">Auto-play enabled</span>
                    </div>
                  </div>
                ) : (
                  <div className="image-container">
                    {tomogram.detailImageUrl && !imageErrors.detail ? (
                      <img 
                        src={tomogram.detailImageUrl} 
                        alt={tomogram.title}
                        className="detail-image"
                        onError={() => handleImageError('detail')}
                      />
                    ) : (
                      <div className="placeholder-media">
                        <span>Tomogram Image</span>
                        <p>ID: {tomogram.tomogramId}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            {/* Additional Views - Only thumbnails */}
            {tomogram.imageGallery && tomogram.imageGallery.length > 0 && (
              <div className="image-gallery">
                <h4>Additional Views</h4>
                <div className="gallery-thumbnails">
                  {tomogram.imageGallery.map((imageUrl, index) => (
                    <div 
                      key={index}
                      className={`gallery-thumb ${selectedAdditionalView === index ? 'active' : ''}`}
                      onClick={() => handleAdditionalViewClick(index)}
                      title={`Click to view ${getViewLabel(index)}`}
                    >
                      <img 
                        src={imageUrl} 
                        alt={`View ${index + 1}`}
                        onError={() => handleImageError(`gallery_${index}`)}
                      />
                      <div className="thumb-label">{getViewLabel(index)}</div>
                    </div>
                  ))}
                </div>
                {showingAdditionalView && (
                  <p className="view-instruction">
                    Click thumbnails to switch between views. Click active thumbnail to return to main view.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right side - Metadata */}
          <div className="detail-metadata">
            <div className="share-section">
              <strong>Share:</strong>
              <div className="share-buttons">
                <button className="share-btn">Link</button>
              </div>
            </div>

            <div className="metadata-grid">
              <div className="metadata-row">
                <span className="metadata-label">Tilt Series date:</span>
                <span className="metadata-value">{tomogram.publicationDate}</span>
              </div>
              
              <div className="metadata-row">
                <span className="metadata-label">Data Taken By:</span>
                <span className="metadata-value">{tomogram.authors.join(', ')}</span>
              </div>
              
              <div className="metadata-row">
                <span className="metadata-label">Species / Specimen:</span>
                <span className="metadata-value">{tomogram.species}</span>
              </div>
              
              <div className="metadata-row">
                <span className="metadata-label">Strain:</span>
                <span className="metadata-value">{tomogram.strain}</span>
              </div>
              
              <div className="metadata-row">
                <span className="metadata-label">Tilt Series Settings:</span>
                <span className="metadata-value">
                  {tomogram.tiltRange}, step 1°, constant angular increment, dosage 1.8e/Å²/s, defocus: -8μm, 
                  magnification: {tomogram.magnification}x
                </span>
              </div>
              
              <div className="metadata-row">
                <span className="metadata-label">Microscope:</span>
                <span className="metadata-value">{tomogram.microscopeType}</span>
              </div>
              
              <div className="metadata-row">
                <span className="metadata-label">Acquisition Software:</span>
                <span className="metadata-value">UCSTomo</span>
              </div>
              
              <div className="metadata-row">
                <span className="metadata-label">Processing Software Used:</span>
                <span className="metadata-value">{tomogram.reconstructionSoftware}</span>
              </div>
              
              <div className="metadata-row">
                <span className="metadata-label">Notes:</span>
                <span className="metadata-value">{tomogram.description}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom - Download Files */}
        <div className="download-section">
          <h3>Download files</h3>
          <div className="files-table">
            <div className="table-header">
              <span className="col-name">Name</span>
              <span className="col-size">Size</span>
              <span className="col-type">Type</span>
              <span className="col-download">Download</span>
            </div>
            
            {tomogram.downloadUrls.map((url, index) => {
              const fileName = url.split('/').pop();
              const fileSize = index === 0 ? '3.40 GB' : 
                             index === 1 ? '343.9 MB' : 
                             index === 2 ? '17.3 MB' : '1.04 MB';
              
              return (
                <div key={index} className="table-row">
                  <span className="col-name">{fileName}</span>
                  <span className="col-size">{fileSize}</span>
                  <span className="col-type">{getFileType(url)}</span>
                  <span className="col-download">
                    <button className="download-btn">DOWNLOAD</button>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );

  // Helper function to get view labels
  function getViewLabel(index) {
    const labels = ['Slice 1', 'Slice 2', '3D View', 'Surface View', 'Cross Section'];
    return labels[index] || `View ${index + 1}`;
  }
};

export default DatasetDetail; 