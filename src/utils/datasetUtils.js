// Enhanced utility functions for dataset management
// University of Chicago Tomography Database - Now with Supabase integration

import { supabase } from '../supabase/client';

/**
 * Generate the next sequential tomogram ID from Supabase
 * @returns {Promise<string>} Next UCTD_XXX ID
 */
export async function generateNextTomogramId() {
  try {
    // Get ALL existing IDs from Supabase to find the highest number
    const { data, error } = await supabase
      .from('datasets')
      .select('tomogram_id');

    if (error) {
      console.error('Error fetching latest ID:', error);
      return 'UCTD_001'; // Default if query fails
    }

    if (!data || data.length === 0) {
      return 'UCTD_001'; // First dataset
    }

    // Extract numbers from all IDs and find the maximum
    let maxNumber = 0;
    data.forEach(row => {
      const match = row.tomogram_id.match(/^UCTD_(\d+)$/);
      if (match) {
        const number = parseInt(match[1]);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    return `UCTD_${nextNumber.toString().padStart(3, '0')}`;
    
  } catch (error) {
    console.error('Error generating next ID:', error);
    return 'UCTD_001';
  }
}

/**
 * Validates that a tomogram ID follows the correct format
 * @param {string} tomogramId - ID to validate
 * @returns {boolean} - True if valid format
 */
export const validateTomogramId = (tomogramId) => {
  if (!tomogramId || typeof tomogramId !== 'string') return false;
  return /^UCTD_\d{3}$/.test(tomogramId);
};

/**
 * Check if a tomogram ID already exists in Supabase
 * @param {string} tomogramId - ID to check
 * @returns {Promise<boolean>} True if ID exists
 */
export async function tomogramIdExists(tomogramId) {
  try {
    const { data, error } = await supabase
      .from('datasets')
      .select('tomogram_id')
      .eq('tomogram_id', tomogramId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking ID existence:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking ID existence:', error);
    return false;
  }
}

/**
 * Creates a complete dataset object from form data, ready for Supabase
 * @param {Object} formData - Data from the add dataset form
 * @param {string} generatedId - Auto-generated UCTD ID
 * @returns {Object} - Complete dataset object matching Supabase schema
 */
export const createTomogramObject = (formData, generatedId) => {
  return {
    // Primary identifier
    tomogram_id: generatedId,
    
    // Basic Information
    title: formData.title || '',
    description: formData.description || '',
    organism: formData.organism || formData.species || '', // backwards compatibility
    strain: formData.strain || '',
    
    // Scientific Metadata
    cellular_component: formData.cellularComponent || formData.cellType || '',
    molecular_function: formData.molecularFunction || '',
    biological_process: formData.biologicalProcess || '',
    keywords: formData.keywords ? 
      (Array.isArray(formData.keywords) ? formData.keywords : formData.keywords.split(',').map(k => k.trim())) 
      : [],
    
    // File Types - crucial for search filtering
    file_types: formData.fileTypes || ['.mrc', '.rec', '.mod', '.tif'],
    
    // Acquisition Parameters
    microscope: formData.microscope || formData.microscopeType || 'FEI Polara 300kV',
    detector: formData.detector || '',
    acceleration_voltage: parseInt(formData.accelerationVoltage || formData.acceleratingVoltage) || 300,
    magnification: parseInt(formData.magnification) || 30000,
    pixel_size: parseFloat(formData.pixelSize) || 0.68,
    defocus_min: parseFloat(formData.defocusMin) || null,
    defocus_max: parseFloat(formData.defocusMax) || null,
    tilt_series_range: formData.tiltSeriesRange || formData.tiltRange || '-60° to +60°',
    tilt_increment: parseFloat(formData.tiltIncrement) || null,
    total_dose: parseFloat(formData.totalDose) || null,
    
    // Sample Preparation
    sample_preparation: formData.samplePreparation || formData.preparationMethod || 'Cryo-fixation',
    grid_type: formData.gridType || '',
    staining: formData.staining || formData.contrastMethod || 'Vitreous ice',
    vitrification_method: formData.vitrificationMethod || '',
    cryo_protectant: formData.cryoProtectant || '',
    
    // Processing Information
    reconstruction_software: formData.reconstructionSoftware || 'IMOD',
    reconstruction_method: formData.reconstructionMethod || 'weighted back-projection',
    resolution: parseFloat(formData.resolution) || null,
    symmetry: formData.symmetry || '',
    processing_notes: formData.processingNotes || '',
    
    // Data Organization - Create placeholder paths
    raw_data_path: `/data/raw/${generatedId}/`,
    processed_data_path: `/data/processed/${generatedId}/`,
    thumbnail_path: `/images/tomograms/${generatedId}_thumb.jpg`,
    reconstruction_path: `/data/reconstructions/${generatedId}_reconstruction.mrc`,
    additional_files_paths: formData.additionalFiles ? 
      (Array.isArray(formData.additionalFiles) ? formData.additionalFiles : [formData.additionalFiles])
      : [],
    
    // Publication Information
    publication_title: formData.publicationTitle || '',
    authors: formData.authors || 'University of Chicago',
    journal: formData.journal || '',
    publication_year: parseInt(formData.publicationYear) || null,
    doi: formData.doi || '',
    pmid: formData.pmid || ''
  };
};

/**
 * Create a new dataset in Supabase
 * @param {Object} datasetData - Dataset information
 * @returns {Promise<Object>} Created dataset or error
 */
export async function createDataset(datasetData) {
  try {
    const { data, error } = await supabase
      .from('datasets')
      .insert([datasetData])
      .select()
      .single();

    if (error) {
      console.error('Error creating dataset:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating dataset:', error);
    return { success: false, error };
  }
}

/**
 * Transform database data to frontend format
 * @param {Object} dataset - Raw dataset from database
 * @returns {Object} - Transformed dataset for frontend
 */
export const transformDatasetForFrontend = (dataset) => {
  return {
    ...dataset,
    // Map snake_case to camelCase for frontend compatibility
    imageGallery: dataset.image_gallery || [],
    // Add other mappings as needed
  };
};

/**
 * Fetch all datasets from Supabase
 * @returns {Promise<Array>} Array of datasets
 */
export async function fetchDatasets() {
  try {
    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching datasets:', error);
      return [];
    }

    // Transform data for frontend compatibility
    return (data || []).map(transformDatasetForFrontend);
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return [];
  }
}

/**
 * Fetch a single dataset by ID
 * @param {string} id - Dataset ID
 * @returns {Promise<Object|null>} Dataset or null
 */
export async function fetchDatasetById(id) {
  try {
    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .eq('tomogram_id', id)
      .single();

    if (error) {
      console.error('Error fetching dataset:', error);
      return null;
    }

    // Transform data for frontend compatibility
    return transformDatasetForFrontend(data);
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return null;
  }
}

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

/**
 * Convert legacy local data format to Supabase format (for migration)
 * @param {Object} legacyData - Old format data
 * @returns {Object} - Supabase-compatible format
 */
export const convertLegacyToSupabase = (legacyData) => {
  return {
    tomogram_id: legacyData.tomogramId,
    title: legacyData.title,
    description: legacyData.description,
    organism: legacyData.species,
    strain: legacyData.strain,
    cellular_component: legacyData.cellType,
    keywords: legacyData.cellularFeatures || [],
    microscope: legacyData.microscopeType,
    acceleration_voltage: legacyData.acceleratingVoltage,
    magnification: legacyData.magnification,
    pixel_size: legacyData.pixelSize,
    tilt_series_range: legacyData.tiltRange,
    sample_preparation: legacyData.preparationMethod,
    staining: legacyData.contrastMethod,
    reconstruction_software: legacyData.reconstructionSoftware,
    raw_data_path: legacyData.downloadUrls?.[0] || '',
    thumbnail_path: legacyData.thumbnailUrl,
    authors: Array.isArray(legacyData.authors) ? legacyData.authors.join(', ') : legacyData.authors
  };
}; 