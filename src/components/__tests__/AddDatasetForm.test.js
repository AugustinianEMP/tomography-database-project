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
    publicationDate: formData.publicationDate || new Date().toISOString().split('T')[0],
    lab: formData.lab || 'UChicago Research Laboratory'
  }))
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
}); 