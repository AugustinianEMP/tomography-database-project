import React, { useState, useEffect } from 'react';
import { generateNextTomogramId, createTomogramObject } from '../utils/datasetUtils';
import { useSwipeExit } from '../utils/swipeExitHelper';

const AddDatasetForm = ({ tomograms, onAddDataset, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    species: '',
    cellType: 'Bacterial cell',
    strain: '',
    microscopeType: 'FEI Polara 300kV',
    acceleratingVoltage: 300,
    magnification: 30000,
    pixelSize: 0.68,
    tiltRange: '-60° to +60°',
    preparationMethod: 'Cryo-fixation',
    contrastMethod: 'Vitreous ice',
    fiducialType: '10nm gold beads',
    reconstructionSoftware: 'IMOD',
    binning: 4,
    reconstruction: 'weighted back-projection',
    alignment: 'fiducial-based',
    datasetSize: '',
    fileTypes: ['.mrc', '.rec', '.mod', '.tif'],
    authors: '',
    publicationDate: new Date().toISOString().split('T')[0],
    lab: 'UChicago Research Laboratory',
    cellularFeatures: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add swipe exit functionality with auto-save
  useSwipeExit(onCancel, true, formData);

  // Recovery logic for saved form data
  useEffect(() => {
    const savedData = localStorage.getItem('addDatasetFormDraft');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        // Clear the saved data after recovery
        localStorage.removeItem('addDatasetFormDraft');
        console.log('Recovered saved form data');
      } catch (error) {
        console.error('Error recovering saved form data:', error);
        localStorage.removeItem('addDatasetFormDraft');
      }
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle file types checkboxes
      setFormData(prev => ({
        ...prev,
        fileTypes: checked 
          ? [...prev.fileTypes, value]
          : prev.fileTypes.filter(ft => ft !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.species.trim()) newErrors.species = 'Species is required';
    if (!formData.strain.trim()) newErrors.strain = 'Strain is required';

    // Numeric validations
    if (formData.acceleratingVoltage < 100 || formData.acceleratingVoltage > 400) {
      newErrors.acceleratingVoltage = 'Accelerating voltage must be between 100-400 kV';
    }
    if (formData.magnification < 1000 || formData.magnification > 100000) {
      newErrors.magnification = 'Magnification must be between 1,000-100,000x';
    }
    if (formData.pixelSize < 0.1 || formData.pixelSize > 10) {
      newErrors.pixelSize = 'Pixel size must be between 0.1-10 nm';
    }
    if (formData.binning < 1 || formData.binning > 8) {
      newErrors.binning = 'Binning must be between 1-8';
    }

    // File types validation
    if (formData.fileTypes.length === 0) {
      newErrors.fileTypes = 'At least one file type must be selected';
    }

    // Dataset size validation
    if (!formData.datasetSize.trim()) {
      newErrors.datasetSize = 'Dataset size is required';
    } else if (!/^\d+(\.\d+)?\s*(GB|MB|TB)$/i.test(formData.datasetSize.trim())) {
      newErrors.datasetSize = 'Dataset size must be in format like "2.3 GB"';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Generate next available ID
      const newId = generateNextTomogramId(tomograms);
      
      // Create complete tomogram object
      const newTomogram = createTomogramObject(formData, newId);
      
      // Call parent function to add the dataset
      await onAddDataset(newTomogram);
      
      // Success - form will be closed by parent component
      console.log(`Dataset ${newId} created successfully!`);
      
    } catch (error) {
      console.error('Error adding dataset:', error);
      setErrors({ submit: 'Failed to add dataset. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableFileTypes = ['.mrc', '.rec', '.mod', '.tif', '.mp4', '.star'];
  const microscopeOptions = ['FEI Polara 300kV', 'Titan Krios 300kV'];
  const cellTypeOptions = ['Bacterial cell', 'Archaeal cell', 'Eukaryotic cell'];
  const preparationMethods = ['Cryo-fixation', 'High-pressure freezing', 'Chemical fixation'];
  const reconstructionSoftwareOptions = ['IMOD', 'AreTomo', 'cryoCARE', 'novaCTF', 'eTomo', 'RELION', 'Warp', 'SerialEM'];

  return (
    <div className="add-dataset-form">
      <div className="form-header">
        <h2>Add New Tomography Dataset</h2>
        <p>Create a new entry in the University of Chicago Tomography Database</p>
      </div>

      <form onSubmit={handleSubmit} className="dataset-form">
        {/* Basic Information */}
        <section className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? 'error' : ''}
              placeholder="e.g., Escherichia coli flagellar motor assembly"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="Detailed description of the tomography study..."
              rows="3"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
        </section>

        {/* Scientific Metadata */}
        <section className="form-section">
          <h3>Scientific Metadata</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="species">Species *</label>
              <input
                type="text"
                id="species"
                name="species"
                value={formData.species}
                onChange={handleInputChange}
                className={errors.species ? 'error' : ''}
                placeholder="e.g., Escherichia coli"
              />
              {errors.species && <span className="error-message">{errors.species}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cellType">Cell Type</label>
              <select
                id="cellType"
                name="cellType"
                value={formData.cellType}
                onChange={handleInputChange}
              >
                {cellTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="strain">Strain *</label>
              <input
                type="text"
                id="strain"
                name="strain"
                value={formData.strain}
                onChange={handleInputChange}
                className={errors.strain ? 'error' : ''}
                placeholder="e.g., MG1655"
              />
              {errors.strain && <span className="error-message">{errors.strain}</span>}
            </div>
          </div>
        </section>

        {/* Acquisition Parameters */}
        <section className="form-section">
          <h3>Acquisition Parameters</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="microscopeType">Microscope Type</label>
              <select
                id="microscopeType"
                name="microscopeType"
                value={formData.microscopeType}
                onChange={handleInputChange}
              >
                {microscopeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="acceleratingVoltage">Accelerating Voltage (kV)</label>
              <input
                type="number"
                id="acceleratingVoltage"
                name="acceleratingVoltage"
                value={formData.acceleratingVoltage}
                onChange={handleInputChange}
                className={errors.acceleratingVoltage ? 'error' : ''}
                min="100"
                max="400"
              />
              {errors.acceleratingVoltage && <span className="error-message">{errors.acceleratingVoltage}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="magnification">Magnification (x)</label>
              <input
                type="number"
                id="magnification"
                name="magnification"
                value={formData.magnification}
                onChange={handleInputChange}
                className={errors.magnification ? 'error' : ''}
                min="1000"
                max="100000"
              />
              {errors.magnification && <span className="error-message">{errors.magnification}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="pixelSize">Pixel Size (nm)</label>
              <input
                type="number"
                id="pixelSize"
                name="pixelSize"
                value={formData.pixelSize}
                onChange={handleInputChange}
                className={errors.pixelSize ? 'error' : ''}
                step="0.01"
                min="0.1"
                max="10"
              />
              {errors.pixelSize && <span className="error-message">{errors.pixelSize}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tiltRange">Tilt Range</label>
            <input
              type="text"
              id="tiltRange"
              name="tiltRange"
              value={formData.tiltRange}
              onChange={handleInputChange}
              placeholder="e.g., -60° to +60°"
            />
          </div>
        </section>

        {/* Sample Preparation */}
        <section className="form-section">
          <h3>Sample Preparation</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preparationMethod">Preparation Method</label>
              <select
                id="preparationMethod"
                name="preparationMethod"
                value={formData.preparationMethod}
                onChange={handleInputChange}
              >
                {preparationMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="contrastMethod">Contrast Method</label>
              <input
                type="text"
                id="contrastMethod"
                name="contrastMethod"
                value={formData.contrastMethod}
                onChange={handleInputChange}
                placeholder="e.g., Vitreous ice"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fiducialType">Fiducial Type</label>
              <input
                type="text"
                id="fiducialType"
                name="fiducialType"
                value={formData.fiducialType}
                onChange={handleInputChange}
                placeholder="e.g., 10nm gold beads"
              />
            </div>
          </div>
        </section>

        {/* Processing Information */}
        <section className="form-section">
          <h3>Processing Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reconstructionSoftware">Reconstruction Software</label>
              <select
                id="reconstructionSoftware"
                name="reconstructionSoftware"
                value={formData.reconstructionSoftware}
                onChange={handleInputChange}
              >
                {reconstructionSoftwareOptions.map(software => (
                  <option key={software} value={software}>{software}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="binning">Binning</label>
              <input
                type="number"
                id="binning"
                name="binning"
                value={formData.binning}
                onChange={handleInputChange}
                className={errors.binning ? 'error' : ''}
                min="1"
                max="8"
              />
              {errors.binning && <span className="error-message">{errors.binning}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reconstruction">Reconstruction Method</label>
              <input
                type="text"
                id="reconstruction"
                name="reconstruction"
                value={formData.reconstruction}
                onChange={handleInputChange}
                placeholder="e.g., weighted back-projection"
              />
            </div>

            <div className="form-group">
              <label htmlFor="alignment">Alignment Method</label>
              <input
                type="text"
                id="alignment"
                name="alignment"
                value={formData.alignment}
                onChange={handleInputChange}
                placeholder="e.g., fiducial-based"
              />
            </div>
          </div>
        </section>

        {/* Data Organization */}
        <section className="form-section">
          <h3>Data Organization</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="datasetSize">Dataset Size *</label>
              <input
                type="text"
                id="datasetSize"
                name="datasetSize"
                value={formData.datasetSize}
                onChange={handleInputChange}
                className={errors.datasetSize ? 'error' : ''}
                placeholder="e.g., 2.3 GB"
              />
              {errors.datasetSize && <span className="error-message">{errors.datasetSize}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>File Types *</label>
            <div className="checkbox-group">
              {availableFileTypes.map(fileType => (
                <label key={fileType} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={fileType}
                    checked={formData.fileTypes.includes(fileType)}
                    onChange={handleInputChange}
                  />
                  {fileType}
                </label>
              ))}
            </div>
            {errors.fileTypes && <span className="error-message">{errors.fileTypes}</span>}
          </div>
        </section>

        {/* Publication Information */}
        <section className="form-section">
          <h3>Publication Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="authors">Authors</label>
              <input
                type="text"
                id="authors"
                name="authors"
                value={formData.authors}
                onChange={handleInputChange}
                placeholder="Comma-separated list of authors"
              />
            </div>

            <div className="form-group">
              <label htmlFor="publicationDate">Publication Date</label>
              <input
                type="date"
                id="publicationDate"
                name="publicationDate"
                value={formData.publicationDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lab">Laboratory</label>
              <input
                type="text"
                id="lab"
                name="lab"
                value={formData.lab}
                onChange={handleInputChange}
                placeholder="e.g., UChicago Department of Biology"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cellularFeatures">Cellular Features</label>
            <input
              type="text"
              id="cellularFeatures"
              name="cellularFeatures"
              value={formData.cellularFeatures}
              onChange={handleInputChange}
              placeholder="Comma-separated list of features (e.g., flagella, ribosomes, membrane)"
            />
          </div>
        </section>

        {/* Form Actions */}
        <div className="form-actions">
          {errors.submit && <div className="error-message">{errors.submit}</div>}
          
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Dataset...' : 'Create Dataset'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDatasetForm; 