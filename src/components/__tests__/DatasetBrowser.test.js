import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DatasetBrowser from '../DatasetBrowser';
// Mock Supabase data for testing
const mockTomograms = [
  {
    tomogram_id: 'UCTD_001',
    title: 'E. coli Ribosome Structure',
    organism: 'Escherichia coli',
    created_at: '2023-01-15T00:00:00Z',
    raw_data_path: '/data/raw/UCTD_001/',
    processed_data_path: '/data/processed/UCTD_001/',
    reconstruction_path: '/data/reconstructions/UCTD_001.mrc'
  },
  {
    tomogram_id: 'UCTD_002', 
    title: 'V. cholerae Structure',
    organism: 'Vibrio cholerae',
    created_at: '2023-02-15T00:00:00Z',
    raw_data_path: '/data/raw/UCTD_002/',
    processed_data_path: '/data/processed/UCTD_002/',
    reconstruction_path: '/data/reconstructions/UCTD_002.mrc'
  }
];

describe('DatasetBrowser Component', () => {
  const mockOnDatasetClick = jest.fn();

  beforeEach(() => {
    mockOnDatasetClick.mockClear();
  });

  // Test 1: Component renders without crashing
  test('renders dataset browser component', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Should display UChicago database heading
    expect(screen.getByText(/University of Chicago Tomography Database/i)).toBeInTheDocument();
  });

  // Test 2: Displays navigation header
  test('displays navigation header with Upload tab', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Should show navigation items - DatasetBrowser only shows Browse Database and Add Dataset
    expect(screen.getAllByText('Browse Database')).toHaveLength(2); // nav + page title
    expect(screen.getByText('+ Add Dataset')).toBeInTheDocument();
    
    // Should NOT show removed tabs
    expect(screen.queryByText('Featured Tomograms')).not.toBeInTheDocument();
    expect(screen.queryByText('Scientific Challenges')).not.toBeInTheDocument();
  });

  // Test 3: Displays tomogram grid cards
  test('displays tomogram cards in grid layout', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Should show the correct number of cards (content-agnostic)
    const cards = document.querySelectorAll('.tomogram-card');
    expect(cards).toHaveLength(mockTomograms.length);
    
    // Each card should have essential elements
    const cardTitles = document.querySelectorAll('.card-title');
    expect(cardTitles).toHaveLength(mockTomograms.length);
  });

  // Test 4: Shows essential metadata in cards (structure, not content)
  test('displays essential metadata for each tomogram card', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Should show species metadata fields (structure test)
    const speciesLabels = screen.getAllByText('Species:');
    expect(speciesLabels).toHaveLength(mockTomograms.length);
    
    // Should show date metadata fields (structure test)
    const dateLabels = screen.getAllByText('Date:');
    expect(dateLabels).toHaveLength(mockTomograms.length);
    
    // Metadata should be properly structured
    const metadataContainers = document.querySelectorAll('.card-metadata');
    expect(metadataContainers).toHaveLength(mockTomograms.length);
  });

  // Test 5: Handles empty dataset gracefully
  test('handles empty tomogram list', () => {
    render(<DatasetBrowser tomograms={[]} onDatasetClick={mockOnDatasetClick} />);
    
    expect(screen.getByText(/No datasets found/i)).toBeInTheDocument();
  });

  // Test 6: Shows loading state
  test('displays loading state when data is being fetched', () => {
    render(<DatasetBrowser tomograms={null} loading={true} onDatasetClick={mockOnDatasetClick} />);
    
    expect(screen.getByText(/Loading datasets/i)).toBeInTheDocument();
  });

  // Test 7: Shows real images with scientific overlays
  test('displays tomogram images with scientific overlays', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Should show real images
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2); // One for each tomogram (2 total in mock)
    
    // Check that images have correct alt text (src URLs will be empty in mock)
    expect(images[0]).toHaveAttribute('alt', 'E. coli Ribosome Structure');
    expect(images[1]).toHaveAttribute('alt', 'V. cholerae Structure');
    
    // Should show dataset IDs in overlays (only in overlay, not search dropdown)
    expect(screen.getAllByText('UCTD_001')).toHaveLength(1);
    expect(screen.getAllByText('UCTD_002')).toHaveLength(1);
    
    // Should show file info in overlays (using mock data values)
    expect(screen.getAllByText('2.0 GB')).toHaveLength(2); // Both datasets show 2.0 GB
    expect(screen.getAllByText('3 files')).toHaveLength(2); // Both datasets show 3 files
  });

  // Test 8: Cards are clickable and trigger navigation (behavior test)
  test('clicking on tomogram card triggers navigation', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Find and click on the first tomogram card (content-agnostic)
    const firstCard = document.querySelector('.tomogram-card');
    fireEvent.click(firstCard);
    
    // Should call the onClick handler with the correct tomogram data
    expect(mockOnDatasetClick).toHaveBeenCalledWith(mockTomograms[0]);
    expect(mockOnDatasetClick).toHaveBeenCalledTimes(1);
  });

  // Test 9: Shows page intro content
  test('displays browse database intro content', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Test the intro description instead of duplicate heading
    expect(screen.getByText(/Explore our collection of electron tomography datasets/i)).toBeInTheDocument();
    expect(screen.getByText(/University of Chicago research laboratories/i)).toBeInTheDocument();
  });

  // Test 10: Image hover effects work properly (behavior test)
  test('card hover effects display overlay information', async () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    const firstCard = document.querySelector('.tomogram-card');
    
    // Hover over the first card
    fireEvent.mouseEnter(firstCard);
    
    // Scientific overlay should become visible (test structure, not content)
    await waitFor(() => {
      const overlays = document.querySelectorAll('.image-overlay');
      expect(overlays).toHaveLength(mockTomograms.length);
      
      const datasetIds = document.querySelectorAll('.dataset-id');
      expect(datasetIds).toHaveLength(mockTomograms.length);
      
      // Check that overlay info is structured properly
      const imageInfos = document.querySelectorAll('.image-info');
      expect(imageInfos).toHaveLength(mockTomograms.length);
    });
  });

  // Test 11: Image error handling
  test('handles image loading errors gracefully', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    const images = screen.getAllByRole('img');
    
    // Simulate image load error
    fireEvent.error(images[0]);
    
    // Should still show dataset information - UCTD_001 appears only in overlay now
    expect(screen.getAllByText('UCTD_001')).toHaveLength(1);
    expect(screen.getByText('E. coli Ribosome Structure')).toBeInTheDocument();
  });

  // Test 12: File count information display
  test('displays file count information', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Should show file counts for each dataset - based on our mock data
    expect(screen.getAllByText('3 files')).toHaveLength(2); // Both datasets have 3 files in mock
  });

  // Test 3: Integration with search interface
  test('displays search interface with all filter options', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Should have search input
    expect(screen.getByPlaceholderText(/search datasets/i)).toBeInTheDocument();
    
    // Should show species names only in cards (not in dropdown since filters are hidden)
    expect(screen.getAllByText('Vibrio cholerae')).toHaveLength(1); // only in card
    expect(screen.getAllByText('Escherichia coli')).toHaveLength(1); // only in card
    
    // Should have toggle button for filters
    expect(screen.getByText(/advanced filters/i)).toBeInTheDocument();
    
    // Show filters to verify they work
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    // Should show filter dropdowns
    expect(screen.getByLabelText(/species/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/microscope/i)).toBeInTheDocument();
    
    // Should show date inputs
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  // Test 4: Dataset filtering functionality
  test('filters datasets by species', async () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    const speciesSelect = screen.getByLabelText(/species/i);
    
    // Filter by Vibrio cholerae
    fireEvent.change(speciesSelect, { target: { value: 'Vibrio cholerae' } });
    
    // Should show only Vibrio cholerae dataset
    await waitFor(() => {
      expect(screen.getByText('V. cholerae Structure')).toBeInTheDocument();
      expect(screen.queryByText('E. coli Ribosome Structure')).not.toBeInTheDocument();
    });
  });

  // Test 5: Clear filters functionality
  test('clear filters shows all datasets', async () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    const searchInput = screen.getByPlaceholderText(/search datasets/i);
    const clearButton = screen.getByText(/clear filters/i);
    
    // Apply a filter
    fireEvent.change(searchInput, { target: { value: 'cholerae' } });
    
    // Should show only 1 dataset
    await waitFor(() => {
      expect(screen.queryByText('Caulobacter crescentus division cycle')).not.toBeInTheDocument();
    });
    
    // Clear filters
    fireEvent.click(clearButton);
    
    // Should show all datasets again
    await waitFor(() => {
      expect(screen.getByText('V. cholerae Structure')).toBeInTheDocument();
      expect(screen.getByText('E. coli Ribosome Structure')).toBeInTheDocument();
    });
  });

  // Test 17: No results state when filters don't match
  test('shows no results message when no datasets match filters', async () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    const searchInput = screen.getByPlaceholderText(/search datasets/i);
    
    // Search for something that doesn't exist
    fireEvent.change(searchInput, { target: { value: 'nonexistent species' } });
    
    await waitFor(() => {
      expect(screen.getByText(/No datasets found/i)).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your search criteria/i)).toBeInTheDocument();
    });
  });
}); 