import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DatasetBrowser from '../DatasetBrowser';
import { mockTomograms } from '../../data/mockTomograms';

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
    
    // Should show navigation items with new Upload tab
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getAllByText('Browse Database')).toHaveLength(2); // nav + page title
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    
    // Should NOT show removed tabs
    expect(screen.queryByText('Featured Tomograms')).not.toBeInTheDocument();
    expect(screen.queryByText('Scientific Challenges')).not.toBeInTheDocument();
  });

  // Test 3: Displays tomogram grid cards
  test('displays tomogram cards in grid layout', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Should show all tomogram titles in cards
    expect(screen.getByText('Vibrio cholerae cell ultrastructure')).toBeInTheDocument();
    expect(screen.getByText('Caulobacter crescentus division cycle')).toBeInTheDocument();
    expect(screen.getByText('Methanocaldococcus jannaschii archaeal cell')).toBeInTheDocument();
  });

  // Test 4: Shows essential metadata in cards (species and date only)
  test('displays essential metadata for each tomogram card', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Should show species names only in cards (dropdown is hidden by default)
    expect(screen.getAllByText('Vibrio cholerae')).toHaveLength(1); // only in card
    expect(screen.getAllByText('Caulobacter crescentus')).toHaveLength(1); // only in card  
    expect(screen.getAllByText('Methanocaldococcus jannaschii')).toHaveLength(1); // only in card
    
    // Should show publication dates
    expect(screen.getByText('2023-05-15')).toBeInTheDocument();
    expect(screen.getByText('2023-07-22')).toBeInTheDocument();
    expect(screen.getByText('2023-03-10')).toBeInTheDocument();
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
    expect(images).toHaveLength(11); // One for each tomogram (11 total now)
    
    // Check that images have correct src URLs
    expect(images[0]).toHaveAttribute('src', '/images/tomograms/UCTD_001_thumb.jpg');
    expect(images[1]).toHaveAttribute('src', '/images/tomograms/UCTD_002_thumb.jpg');
    expect(images[2]).toHaveAttribute('src', '/images/tomograms/UCTD_003_thumb.jpg');
    
    // Should show dataset IDs in overlays (only in overlay, not search dropdown)
    expect(screen.getAllByText('UCTD_001')).toHaveLength(1);
    expect(screen.getAllByText('UCTD_002')).toHaveLength(1);
    expect(screen.getAllByText('UCTD_003')).toHaveLength(1);
    
    // Should show file info in overlays
    expect(screen.getByText('2.3 GB')).toBeInTheDocument();
    expect(screen.getByText('4.1 GB')).toBeInTheDocument();
    expect(screen.getByText('1.8 GB')).toBeInTheDocument();
  });

  // Test 8: Cards are clickable and trigger navigation
  test('clicking on tomogram card triggers navigation', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Find and click on the first tomogram card
    const firstCard = screen.getByText('Vibrio cholerae cell ultrastructure').closest('.tomogram-card');
    fireEvent.click(firstCard);
    
    // Should call the onClick handler with the correct tomogram
    expect(mockOnDatasetClick).toHaveBeenCalledWith(mockTomograms[0]);
  });

  // Test 9: Shows page intro content
  test('displays browse database intro content', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Test the intro description instead of duplicate heading
    expect(screen.getByText(/Explore our collection of electron tomography datasets/i)).toBeInTheDocument();
    expect(screen.getByText(/University of Chicago research laboratories/i)).toBeInTheDocument();
  });

  // Test 10: Image hover effects work properly
  test('card hover effects display overlay information', async () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    const firstCard = screen.getByText('Vibrio cholerae cell ultrastructure').closest('.tomogram-card');
    
    // Hover over the first card
    fireEvent.mouseEnter(firstCard);
    
    // Scientific overlay should become visible - UCTD_001 appears once in search header and once in overlay
    await waitFor(() => {
      expect(screen.getAllByText('UCTD_001')).toHaveLength(1); // Only in overlay now
      expect(screen.getByText('2.3 GB')).toBeVisible();
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
    expect(screen.getByText('Vibrio cholerae cell ultrastructure')).toBeInTheDocument();
  });

  // Test 12: File count information display
  test('displays file count information', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Should show file counts for each dataset - based on actual counts
    expect(screen.getAllByText('4 files')).toHaveLength(9); // 9 datasets have 4 files
    expect(screen.getAllByText('3 files')).toHaveLength(1); // UCTD_003 has 3 files
    expect(screen.getAllByText('5 files')).toHaveLength(1); // UCTD_010 has 5 files
  });

  // Test 3: Integration with search interface
  test('displays search interface with all filter options', () => {
    render(<DatasetBrowser tomograms={mockTomograms} onDatasetClick={mockOnDatasetClick} />);
    
    // Should have search input
    expect(screen.getByPlaceholderText(/search datasets/i)).toBeInTheDocument();
    
    // Should show species names only in cards (not in dropdown since filters are hidden)
    expect(screen.getAllByText('Vibrio cholerae')).toHaveLength(1); // only in card
    expect(screen.getAllByText('Caulobacter crescentus')).toHaveLength(1); // only in card  
    expect(screen.getAllByText('Methanocaldococcus jannaschii')).toHaveLength(1); // only in card
    expect(screen.getAllByText('Escherichia coli')).toHaveLength(1); // new dataset
    
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
      expect(screen.getByText('Vibrio cholerae cell ultrastructure')).toBeInTheDocument();
      expect(screen.queryByText('Caulobacter crescentus division cycle')).not.toBeInTheDocument();
      expect(screen.queryByText('Methanocaldococcus jannaschii archaeal cell')).not.toBeInTheDocument();
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
      expect(screen.getByText('Vibrio cholerae cell ultrastructure')).toBeInTheDocument();
      expect(screen.getByText('Caulobacter crescentus division cycle')).toBeInTheDocument();
      expect(screen.getByText('Methanocaldococcus jannaschii archaeal cell')).toBeInTheDocument();
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