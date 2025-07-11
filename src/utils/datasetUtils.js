// Utility functions for dataset management
// University of Chicago Tomography Database

/**
 * Generates the next available UCTD ID based on existing datasets
 * @param {Array} existingTomograms - Array of existing tomogram objects
 * @returns {string} - Next available ID in format UCTD_XXX
 */
export const generateNextTomogramId = (existingTomograms) => {
  if (!existingTomograms || existingTomograms.length === 0) {
    return 'UCTD_001';
  }

  // Extract numeric parts from existing IDs and find the maximum
  const maxNum = existingTomograms
    .map(tomogram => {
      const idParts = tomogram.tomogramId.split('_');
      return idParts.length > 1 ? parseInt(idParts[1]) : 0;
    })
    .filter(num => !isNaN(num))
    .reduce((max, num) => Math.max(max, num), 0);

  // Generate next ID with zero-padding
  const nextNum = maxNum + 1;
  return `UCTD_${String(nextNum).padStart(3, '0')}`;
};

/**
 * Validates that a tomogram ID follows the correct format
 * @param {string} tomogramId - ID to validate
 * @returns {boolean} - True if valid format
 */
export const validateTomogramId = (tomogramId) => {
  const regex = /^UCTD_\d{3}$/;
  return regex.test(tomogramId);
};

/**
 * Checks if a tomogram ID already exists in the dataset
 * @param {string} tomogramId - ID to check
 * @param {Array} existingTomograms - Array of existing tomogram objects
 * @returns {boolean} - True if ID already exists
 */
export const tomogramIdExists = (tomogramId, existingTomograms) => {
  return existingTomograms.some(tomogram => tomogram.tomogramId === tomogramId);
};

/**
 * Creates a base tomogram object with required fields and defaults
 * @param {Object} formData - Data from the add dataset form
 * @param {string} generatedId - Auto-generated UCTD ID
 * @returns {Object} - Complete tomogram object
 */
export const createTomogramObject = (formData, generatedId) => {
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  return {
    tomogramId: generatedId,
    title: formData.title || '',
    description: formData.description || '',
    
    // Scientific metadata
    species: formData.species || '',
    cellType: formData.cellType || 'Bacterial cell',
    strain: formData.strain || '',
    
    // Visual content - placeholder URLs that can be updated later
    thumbnailUrl: `/images/tomograms/${generatedId}_thumb.jpg`,
    detailImageUrl: `/images/tomograms/${generatedId}_detail.jpg`,
    videoUrl: `/videos/tomograms/${generatedId}_video.mp4`,
    imageGallery: [
      `/images/tomograms/${generatedId}_slice1.jpg`,
      `/images/tomograms/${generatedId}_slice2.jpg`,
      `/images/tomograms/${generatedId}_3d.jpg`
    ],
    
    // Acquisition parameters
    microscopeType: formData.microscopeType || 'FEI Polara 300kV',
    acceleratingVoltage: parseInt(formData.acceleratingVoltage) || 300,
    magnification: parseInt(formData.magnification) || 30000,
    pixelSize: parseFloat(formData.pixelSize) || 0.68,
    tiltRange: formData.tiltRange || '-60° to +60°',
    
    // Sample preparation
    preparationMethod: formData.preparationMethod || 'Cryo-fixation',
    contrastMethod: formData.contrastMethod || 'Vitreous ice',
    fiducialType: formData.fiducialType || '10nm gold beads',
    
    // Processing information
    reconstructionSoftware: formData.reconstructionSoftware || 'IMOD',
    processingParameters: {
      binning: parseInt(formData.binning) || 4,
      reconstruction: formData.reconstruction || 'weighted back-projection',
      alignment: formData.alignment || 'fiducial-based'
    },
    
    // Data organization
    datasetSize: formData.datasetSize || '2.0 GB',
    fileTypes: formData.fileTypes || ['.mrc', '.rec', '.mod', '.tif'],
    downloadUrls: [
      `/files/${generatedId}/raw_data.mrc`,
      `/files/${generatedId}/reconstruction.rec`,
      `/files/${generatedId}/annotations.mod`,
      `/files/${generatedId}/overview.tif`
    ],
    
    // Publication info
    authors: formData.authors ? formData.authors.split(',').map(a => a.trim()) : ['University of Chicago'],
    publicationDate: formData.publicationDate || currentDate,
    lab: formData.lab || 'UChicago Research Laboratory',
    
    // Featured content
    cellularFeatures: formData.cellularFeatures ? formData.cellularFeatures.split(',').map(f => f.trim()) : []
  };
};

/**
 * Generates a placeholder thumbnail image for a new dataset
 * @param {string} tomogramId - UCTD ID for the dataset
 * @returns {string} - Command to generate placeholder image
 */
export const generatePlaceholderImageCommand = (tomogramId) => {
  // Generate a random color for the placeholder
  const colors = ['#8B4513', '#2F4F4F', '#228B22', '#4682B4', '#FF6347', '#9370DB', '#DC143C', '#32CD32'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return `convert -size 300x200 -background '${randomColor}' -fill white -gravity center -pointsize 24 label:'${tomogramId}_thumb' ${tomogramId}_thumb.jpg`;
}; 