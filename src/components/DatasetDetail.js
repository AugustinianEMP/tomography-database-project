import React, { useEffect, useState } from 'react';

const DatasetDetail = ({ tomogram, onBackClick }) => {
  const [imageErrors, setImageErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);

  // Add swipe gesture support for macOS trackpad
  useEffect(() => {
    let isNavigating = false;

    // Handle trackpad swipe gestures using wheel events
    const handleWheel = (e) => {
      // Prevent multiple rapid navigations
      if (isNavigating) return;

      // Check for horizontal trackpad swipe (deltaX indicates horizontal movement)
      // On macOS, trackpad swipes generate wheel events with deltaX
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && e.deltaX < -50) {
        // deltaX < -50 means swipe right (negative values for right swipe)
        e.preventDefault();
        isNavigating = true;
        
        // Add small delay to prevent accidental multiple triggers
        setTimeout(() => {
          onBackClick && onBackClick();
          isNavigating = false;
        }, 100);
      }
    };

    // Alternative: Handle using touchpad gestures through touch events
    let startX = 0;
    let startTime = 0;

    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length === 2) { // Two finger gesture
        startX = e.touches[0].clientX + e.touches[1].clientX;
        startTime = Date.now();
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length === 2) {
        const currentX = e.touches[0].clientX + e.touches[1].clientX;
        const deltaX = currentX - startX;
        const deltaTime = Date.now() - startTime;
        
        // Right swipe: positive deltaX, within reasonable time
        if (deltaX > 100 && deltaTime < 500) {
          e.preventDefault();
          onBackClick && onBackClick();
        }
      }
    };

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || (e.metaKey && e.key === 'ArrowLeft')) {
        e.preventDefault();
        onBackClick && onBackClick();
      }
    };

    // Add event listeners - wheel events are most reliable for trackpad
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBackClick]);

  const handleImageError = (imageType) => {
    setImageErrors(prev => ({ ...prev, [imageType]: true }));
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

  const currentGalleryImage = tomogram.imageGallery && tomogram.imageGallery[selectedImage];

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
            
            {/* Image Gallery */}
            {tomogram.imageGallery && tomogram.imageGallery.length > 0 && (
              <div className="image-gallery">
                <h4>Additional Views</h4>
                <div className="gallery-thumbnails">
                  {tomogram.imageGallery.map((imageUrl, index) => (
                    <div 
                      key={index}
                      className={`gallery-thumb ${selectedImage === index ? 'active' : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img 
                        src={imageUrl} 
                        alt={`View ${index + 1}`}
                        onError={() => handleImageError(`gallery_${index}`)}
                      />
                    </div>
                  ))}
                </div>
                {currentGalleryImage && !imageErrors[`gallery_${selectedImage}`] && (
                  <div className="gallery-main">
                    <img 
                      src={currentGalleryImage} 
                      alt={`Selected view ${selectedImage + 1}`}
                      className="gallery-main-image"
                    />
                  </div>
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
};

export default DatasetDetail; 