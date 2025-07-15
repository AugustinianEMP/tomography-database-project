import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddDatasetForm from '../AddDatasetForm';

// Mock the utils module
jest.mock('../../utils/datasetUtils', () => ({
  generateNextTomogramId: jest.fn(() => 'UCTD_004'),
  createTomogramObject: jest.fn((formData, id) => ({
    tomogramId: id,
    title: formData.title,
    description: formData.description,
    species: formData.species,
    strain: formData.strain,
    cellType: formData.cellType || 'Bacterial cell',
    microscopeType: formData.microscopeType || 'FEI Polara 300kV',
    fileTypes: formData.fileTypes || ['.mrc', '.rec', '.mod', '.tif'],
    thumbnailUrl: `/images/tomograms/${id}_thumb.jpg`,
    // Add all required fields from the actual function
    cellularFeatures: formData.cellularFeatures ? formData.cellularFeatures.split(',').map(f => f.trim()) : [],
    acceleratingVoltage: parseInt(formData.acceleratingVoltage) || 300,
    magnification: parseInt(formData.magnification) || 30000,
    pixelSize: parseFloat(formData.pixelSize) || 0.68,
    datasetSize: formData.datasetSize || '2.0 GB',
    authors: formData.authors ? formData.authors.split(',').map(a => a.trim()) : ['University of Chicago'],
    publicationDate: formData.publicationDate || new Date().toISOString().split('T')[0]
  }))
}));

// Mock the swipe exit helper
jest.mock('../../utils/swipeExitHelper', () => ({
  useSwipeExit: jest.fn()
}));

const mockTomograms = [
  { tomogramId: 'UCTD_001', title: 'Test 1' },
  { tomogramId: 'UCTD_002', title: 'Test 2' },
  { tomogramId: 'UCTD_003', title: 'Test 3' }
];

const defaultProps = {
  tomograms: mockTomograms,
  onAddDataset: jest.fn(),
  onCancel: jest.fn()
};

describe('AddDatasetForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render form with all sections', () => {
      render(<AddDatasetForm {...defaultProps} />);

      // Check header
      expect(screen.getByText('Add New Tomography Dataset')).toBeInTheDocument();
      expect(screen.getByText('Create a new entry in the University of Chicago Tomography Database')).toBeInTheDocument();

      // Check all form sections
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Scientific Metadata')).toBeInTheDocument();
      expect(screen.getByText('Acquisition Parameters')).toBeInTheDocument();
      expect(screen.getByText('Sample Preparation')).toBeInTheDocument();
      expect(screen.getByText('Processing Information')).toBeInTheDocument();
      expect(screen.getByText('Data Organization')).toBeInTheDocument();
      expect(screen.getByText('Publication Information')).toBeInTheDocument();
    });

    test('should render all required form fields', () => {
      render(<AddDatasetForm {...defaultProps} />);

      // Required fields should have asterisks
      expect(screen.getByLabelText(/Title \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Species \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Strain \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Dataset Size \*/)).toBeInTheDocument();
      expect(screen.getByText(/File Types \*/)).toBeInTheDocument();
    });

    test('should render form buttons', () => {
      render(<AddDatasetForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Dataset' })).toBeInTheDocument();
    });
  });

  describe('Default Values', () => {
    test('should have correct default values', () => {
      render(<AddDatasetForm {...defaultProps} />);

      // Check default selections
      expect(screen.getByDisplayValue('Bacterial cell')).toBeInTheDocument();
      expect(screen.getByDisplayValue('FEI Polara 300kV')).toBeInTheDocument();
      expect(screen.getByDisplayValue('300')).toBeInTheDocument(); // accelerating voltage
      expect(screen.getByDisplayValue('30000')).toBeInTheDocument(); // magnification
      expect(screen.getByDisplayValue('0.68')).toBeInTheDocument(); // pixel size
      expect(screen.getByDisplayValue('Cryo-fixation')).toBeInTheDocument();
      expect(screen.getByDisplayValue('IMOD')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4')).toBeInTheDocument(); // binning
    });

    test('should have current date as default publication date', () => {
      render(<AddDatasetForm {...defaultProps} />);
      
      const today = new Date().toISOString().split('T')[0];
      expect(screen.getByDisplayValue(today)).toBeInTheDocument();
    });

    test('should have default file types checked', () => {
      render(<AddDatasetForm {...defaultProps} />);

      expect(screen.getByRole('checkbox', { name: '.mrc' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: '.rec' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: '.mod' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: '.tif' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: '.mp4' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: '.star' })).not.toBeChecked();
    });
  });

  describe('Form Validation', () => {
    test('should show required field errors on empty submission', async () => {
      const user = userEvent.setup();
      render(<AddDatasetForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: 'Create Dataset' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('Description is required')).toBeInTheDocument();
        expect(screen.getByText('Species is required')).toBeInTheDocument();
        expect(screen.getByText('Strain is required')).toBeInTheDocument();
        expect(screen.getByText('Dataset size is required')).toBeInTheDocument();
      });

      expect(defaultProps.onAddDataset).not.toHaveBeenCalled();
    });

    test('should validate numeric field ranges', async () => {
      const user = userEvent.setup();
      render(<AddDatasetForm {...defaultProps} />);

      // Test invalid accelerating voltage
      const voltageInput = screen.getByLabelText(/Accelerating Voltage/);
      await user.clear(voltageInput);
      await user.type(voltageInput, '50'); // Below minimum

      const submitButton = screen.getByRole('button', { name: 'Create Dataset' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Accelerating voltage must be between 100-400 kV')).toBeInTheDocument();
      });
    });

    test('should validate dataset size format', async () => {
      const user = userEvent.setup();
      render(<AddDatasetForm {...defaultProps} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/Title \*/), 'Test Dataset');
      await user.type(screen.getByLabelText(/Description \*/), 'Test description');
      await user.type(screen.getByLabelText(/Species \*/), 'E. coli');
      await user.type(screen.getByLabelText(/Strain \*/), 'MG1655');

      // Invalid dataset size
      await user.type(screen.getByLabelText(/Dataset Size \*/), 'invalid size');

      const submitButton = screen.getByRole('button', { name: 'Create Dataset' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Dataset size must be in format like "2.3 GB"')).toBeInTheDocument();
      });
    });

    test('should validate that at least one file type is selected', async () => {
      const user = userEvent.setup();
      render(<AddDatasetForm {...defaultProps} />);

      // Uncheck all default file types
      await user.click(screen.getByRole('checkbox', { name: '.mrc' }));
      await user.click(screen.getByRole('checkbox', { name: '.rec' }));
      await user.click(screen.getByRole('checkbox', { name: '.mod' }));
      await user.click(screen.getByRole('checkbox', { name: '.tif' }));

      const submitButton = screen.getByRole('button', { name: 'Create Dataset' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('At least one file type must be selected')).toBeInTheDocument();
      });
    });

    test('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(<AddDatasetForm {...defaultProps} />);

      // Trigger validation errors
      const submitButton = screen.getByRole('button', { name: 'Create Dataset' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });

      // Start typing in title field
      const titleInput = screen.getByLabelText(/Title \*/);
      await user.type(titleInput, 'Test');

      // Error should be cleared
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('should handle text input changes', async () => {
      const user = userEvent.setup();
      render(<AddDatasetForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/Title \*/);
      await user.type(titleInput, 'New Dataset Title');

      expect(titleInput).toHaveValue('New Dataset Title');
    });

    test('should handle dropdown changes', async () => {
      const user = userEvent.setup();
      render(<AddDatasetForm {...defaultProps} />);

      const cellTypeSelect = screen.getByLabelText(/Cell Type/);
      await user.selectOptions(cellTypeSelect, 'Eukaryotic cell');

      expect(cellTypeSelect).toHaveValue('Eukaryotic cell');
    });

    test('should handle checkbox changes for file types', async () => {
      const user = userEvent.setup();
      render(<AddDatasetForm {...defaultProps} />);

      const mp4Checkbox = screen.getByRole('checkbox', { name: '.mp4' });
      expect(mp4Checkbox).not.toBeChecked();

      await user.click(mp4Checkbox);
      expect(mp4Checkbox).toBeChecked();

      await user.click(mp4Checkbox);
      expect(mp4Checkbox).not.toBeChecked();
    });

    test('should handle numeric input changes', async () => {
      const user = userEvent.setup();
      render(<AddDatasetForm {...defaultProps} />);

      const magnificationInput = screen.getByLabelText(/Magnification/);
      await user.clear(magnificationInput);
      await user.type(magnificationInput, '25000');

      expect(magnificationInput).toHaveValue(25000);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      // Reset call history but keep implementations
      defaultProps.onAddDataset.mockClear();
      defaultProps.onCancel.mockClear();
      
      // Restore the mock implementations
      const { generateNextTomogramId, createTomogramObject } = require('../../utils/datasetUtils');
      generateNextTomogramId.mockReturnValue('UCTD_004');
      createTomogramObject.mockImplementation((formData, id) => ({
        tomogramId: id,
        title: formData.title,
        description: formData.description,
        species: formData.species,
        strain: formData.strain,
        cellType: formData.cellType || 'Bacterial cell',
        microscopeType: formData.microscopeType || 'FEI Polara 300kV',
        fileTypes: formData.fileTypes || ['.mrc', '.rec', '.mod', '.tif'],
        thumbnailUrl: `/images/tomograms/${id}_thumb.jpg`,
        cellularFeatures: formData.cellularFeatures ? formData.cellularFeatures.split(',').map(f => f.trim()) : [],
        acceleratingVoltage: parseInt(formData.acceleratingVoltage) || 300,
        magnification: parseInt(formData.magnification) || 30000,
        pixelSize: parseFloat(formData.pixelSize) || 0.68,
        datasetSize: formData.datasetSize || '2.0 GB',
        authors: formData.authors ? formData.authors.split(',').map(a => a.trim()) : ['University of Chicago'],
        publicationDate: formData.publicationDate || new Date().toISOString().split('T')[0]
      }));
    });

    test('should submit valid form successfully', async () => {
      const user = userEvent.setup();
      defaultProps.onAddDataset.mockResolvedValue();

      render(<AddDatasetForm {...defaultProps} />);

      // Fill all required fields
      await user.type(screen.getByLabelText(/Title \*/), 'Test Dataset');
      await user.type(screen.getByLabelText(/Description \*/), 'Test description');
      await user.type(screen.getByLabelText(/Species \*/), 'Escherichia coli');
      await user.type(screen.getByLabelText(/Strain \*/), 'MG1655');
      await user.type(screen.getByLabelText(/Dataset Size \*/), '2.5 GB');

      const submitButton = screen.getByRole('button', { name: 'Create Dataset' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onAddDataset).toHaveBeenCalledTimes(1);
      });

      // Check that it was called with the right object structure
      const calledWith = defaultProps.onAddDataset.mock.calls[0][0];
      expect(calledWith).toEqual(
        expect.objectContaining({
          tomogramId: 'UCTD_004',
          title: 'Test Dataset',
          description: 'Test description',
          species: 'Escherichia coli',
          strain: 'MG1655'
        })
      );
    });

    test('should show loading state during submission', async () => {
      const user = userEvent.setup();
      defaultProps.onAddDataset.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<AddDatasetForm {...defaultProps} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/Title \*/), 'Test Dataset');
      await user.type(screen.getByLabelText(/Description \*/), 'Test description');
      await user.type(screen.getByLabelText(/Species \*/), 'E. coli');
      await user.type(screen.getByLabelText(/Strain \*/), 'MG1655');
      await user.type(screen.getByLabelText(/Dataset Size \*/), '2.5 GB');

      const submitButton = screen.getByRole('button', { name: 'Create Dataset' });
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: 'Creating Dataset...' })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('should handle submission errors', async () => {
      const user = userEvent.setup();
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      defaultProps.onAddDataset.mockRejectedValue(new Error('Network error'));

      render(<AddDatasetForm {...defaultProps} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/Title \*/), 'Test Dataset');
      await user.type(screen.getByLabelText(/Description \*/), 'Test description');
      await user.type(screen.getByLabelText(/Species \*/), 'E. coli');
      await user.type(screen.getByLabelText(/Strain \*/), 'MG1655');
      await user.type(screen.getByLabelText(/Dataset Size \*/), '2.5 GB');

      const submitButton = screen.getByRole('button', { name: 'Create Dataset' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to add dataset. Please try again.')).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });
  });

  describe('Navigation', () => {
    test('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<AddDatasetForm {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    test('should disable buttons during submission', async () => {
      const user = userEvent.setup();
      defaultProps.onAddDataset.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<AddDatasetForm {...defaultProps} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/Title \*/), 'Test Dataset');
      await user.type(screen.getByLabelText(/Description \*/), 'Test description');
      await user.type(screen.getByLabelText(/Species \*/), 'E. coli');
      await user.type(screen.getByLabelText(/Strain \*/), 'MG1655');
      await user.type(screen.getByLabelText(/Dataset Size \*/), '2.5 GB');

      const submitButton = screen.getByRole('button', { name: 'Create Dataset' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels and associations', () => {
      render(<AddDatasetForm {...defaultProps} />);

      // Check that labels are properly associated with inputs
      expect(screen.getByLabelText(/Title \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description \*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Species \*/)).toBeInTheDocument();

      // Check that error messages are properly associated
      const titleInput = screen.getByLabelText(/Title \*/);
      expect(titleInput).toHaveAccessibleName();
    });

    test('should support keyboard navigation for buttons', () => {
      render(<AddDatasetForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: 'Create Dataset' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(cancelButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Auto-save functionality', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
      // Mock console.log to avoid cluttering test output
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      localStorage.clear();
      jest.restoreAllMocks();
    });

    test('should recover saved form data from localStorage on mount', async () => {
      const savedFormData = {
        title: 'Saved Dataset Title',
        description: 'Saved description',
        species: 'Saved Species',
        strain: 'Saved Strain',
        cellType: 'Bacterial cell',
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
        datasetSize: '2.5 GB',
        fileTypes: ['.mrc', '.rec'],
        authors: 'Test Author',
        publicationDate: '2024-01-15',
        cellularFeatures: 'test features'
      };

      // Pre-populate localStorage with saved data
      localStorage.setItem('addDatasetFormDraft', JSON.stringify(savedFormData));

      render(<AddDatasetForm {...defaultProps} />);

      // Wait for the useEffect to run and recover data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Saved Dataset Title')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('Saved description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Saved Species')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Saved Strain')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2.5 GB')).toBeInTheDocument();

      // Verify localStorage was cleared after recovery
      expect(localStorage.getItem('addDatasetFormDraft')).toBeNull();
      expect(console.log).toHaveBeenCalledWith('Recovered saved form data');
    });

    test('should handle corrupted localStorage data gracefully', async () => {
      // Set invalid JSON in localStorage
      localStorage.setItem('addDatasetFormDraft', 'invalid json data');

      render(<AddDatasetForm {...defaultProps} />);

      // Should not crash and should clear the corrupted data
      await waitFor(() => {
        expect(localStorage.getItem('addDatasetFormDraft')).toBeNull();
      });

      expect(console.error).toHaveBeenCalledWith(
        'Error recovering saved form data:',
        expect.any(Error)
      );

      // Form should render normally with default values
      expect(screen.getByLabelText(/title/i)).toHaveValue(''); // Title field should be empty
    });

    test('should not recover data if localStorage is empty', () => {
      render(<AddDatasetForm {...defaultProps} />);

      // All form fields should have their default values
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionTextarea = screen.getByLabelText(/description/i);
      
      expect(titleInput.value).toBe('');
      expect(descriptionTextarea.value).toBe('');
      expect(localStorage.getItem('addDatasetFormDraft')).toBeNull();
    });

    test('should save form data when swipe exit is triggered', async () => {
      const user = userEvent.setup();
      const { useSwipeExit } = require('../../utils/swipeExitHelper');

      render(<AddDatasetForm {...defaultProps} />);

      // Fill in some form data
      await user.type(screen.getByLabelText(/title/i), 'Test Dataset');
      await user.type(screen.getByLabelText(/description/i), 'Test description');
      await user.type(screen.getByLabelText(/species/i), 'Test Species');

      // Verify useSwipeExit was called with the right parameters
      expect(useSwipeExit).toHaveBeenCalledWith(
        defaultProps.onCancel,
        true,
        expect.objectContaining({
          title: 'Test Dataset',
          description: 'Test description',
          species: 'Test Species'
        })
      );

      // Simulate the swipe exit by calling onCancel directly (since hook is mocked)
      const onCancelCallback = useSwipeExit.mock.calls[0][0];
      onCancelCallback();

      // Verify onCancel was called
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    test('should preserve form state between mounts with auto-save', async () => {
      const user = userEvent.setup();

      // First render - fill in data
      const { unmount } = render(<AddDatasetForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/title/i), 'Persistent Dataset');
      await user.type(screen.getByLabelText(/species/i), 'Persistent Species');

      // Manually save to localStorage (simulating swipe exit)
      const formData = {
        title: 'Persistent Dataset',
        description: '',
        species: 'Persistent Species',
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
        cellularFeatures: ''
      };
      localStorage.setItem('addDatasetFormDraft', JSON.stringify(formData));

      unmount();

      // Second render - should recover the data
      render(<AddDatasetForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Persistent Dataset')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Persistent Species')).toBeInTheDocument();
      });
    });
  });
}); 