import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the datasetUtils module
jest.mock('../utils/datasetUtils', () => ({
  fetchDatasets: jest.fn(),
  generatePlaceholderImageCommand: jest.fn(() => 'mock-command'),
}));

// Mock the child components to focus on App logic
jest.mock('../components/DatasetBrowser', () => {
  return function MockDatasetBrowser({ tomograms, loading, onAddDatasetClick }) {
    if (loading) return <div data-testid="loading">Loading...</div>;
    return (
      <div data-testid="dataset-browser">
        <div data-testid="dataset-count">{tomograms.length} datasets</div>
        <button onClick={onAddDatasetClick} data-testid="add-button">Add Dataset</button>
      </div>
    );
  };
});

jest.mock('../components/AddDatasetForm', () => {
  return function MockAddDatasetForm({ onAddDataset, onCancel }) {
    return (
      <div data-testid="add-form">
        <button 
          onClick={() => onAddDataset({ tomogram_id: 'UCTD_TEST' })}
          data-testid="submit-form"
        >
          Submit
        </button>
        <button onClick={onCancel} data-testid="cancel-form">Cancel</button>
      </div>
    );
  };
});

const { fetchDatasets } = require('../utils/datasetUtils');

describe('App Component with Supabase Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads datasets from Supabase on mount', async () => {
    const mockDatasets = [
      { tomogram_id: 'UCTD_001', title: 'Test Dataset 1', organism: 'E. coli' },
      { tomogram_id: 'UCTD_002', title: 'Test Dataset 2', organism: 'V. cholerae' }
    ];
    
    fetchDatasets.mockResolvedValue(mockDatasets);

    render(<App />);

    // Should show loading initially
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Wait for datasets to load
    await waitFor(() => {
      expect(screen.getByTestId('dataset-browser')).toBeInTheDocument();
    });

    // Should display correct dataset count
    expect(screen.getByTestId('dataset-count')).toHaveTextContent('2 datasets');
    expect(fetchDatasets).toHaveBeenCalledTimes(1);
  });

  test('handles loading error gracefully', async () => {
    fetchDatasets.mockRejectedValue(new Error('Database connection failed'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('dataset-browser')).toBeInTheDocument();
    });

    // Should show 0 datasets when error occurs
    expect(screen.getByTestId('dataset-count')).toHaveTextContent('0 datasets');
    expect(consoleSpy).toHaveBeenCalledWith('Error loading datasets:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  test('navigates to add dataset form and back', async () => {
    fetchDatasets.mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('dataset-browser')).toBeInTheDocument();
    });

    // Click add dataset button
    const addButton = screen.getByTestId('add-button');
    await userEvent.click(addButton);

    // Should show add form
    expect(screen.getByTestId('add-form')).toBeInTheDocument();
    expect(screen.queryByTestId('dataset-browser')).not.toBeInTheDocument();

    // Cancel should go back to browser
    const cancelButton = screen.getByTestId('cancel-form');
    await userEvent.click(cancelButton);

    expect(screen.getByTestId('dataset-browser')).toBeInTheDocument();
    expect(screen.queryByTestId('add-form')).not.toBeInTheDocument();
  });

  test('refreshes datasets after adding new dataset', async () => {
    const initialDatasets = [
      { tomogram_id: 'UCTD_001', title: 'Dataset 1', organism: 'E. coli' }
    ];
    const updatedDatasets = [
      { tomogram_id: 'UCTD_002', title: 'New Dataset', organism: 'V. cholerae' },
      { tomogram_id: 'UCTD_001', title: 'Dataset 1', organism: 'E. coli' }
    ];

    fetchDatasets
      .mockResolvedValueOnce(initialDatasets)  // Initial load
      .mockResolvedValueOnce(updatedDatasets); // After adding dataset

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('dataset-count')).toHaveTextContent('1 datasets');
    });

    // Navigate to add form
    await userEvent.click(screen.getByTestId('add-button'));

    // Submit form
    await userEvent.click(screen.getByTestId('submit-form'));

    // Should refresh data and show updated count
    await waitFor(() => {
      expect(screen.getByTestId('dataset-count')).toHaveTextContent('2 datasets');
    });

    expect(fetchDatasets).toHaveBeenCalledTimes(2);
  });

  test('passes loading state to DatasetBrowser', async () => {
    fetchDatasets.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    render(<App />);

    // Should show loading
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('dataset-browser')).toBeInTheDocument();
    }, { timeout: 200 });
  });
}); 