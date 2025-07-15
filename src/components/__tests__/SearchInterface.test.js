import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchInterface from '../SearchInterface';

// Mock Supabase data for testing
const mockTomograms = [
  {
    tomogram_id: 'UCTD_001',
    title: 'E. coli Ribosome Structure',
    organism: 'Escherichia coli',
    microscope: 'Titan Krios',
    file_types: ['.mrc', '.rec', '.mod'],
    created_at: '2023-01-15T00:00:00Z'
  },
  {
    tomogram_id: 'UCTD_002',
    title: 'V. cholerae Structure',
    organism: 'Vibrio cholerae',
    microscope: 'Polara 300',
    file_types: ['.mrc', '.mp4', '.star'],
    created_at: '2023-02-15T00:00:00Z'
  },
  {
    tomogram_id: 'UCTD_003',
    title: 'Test Structure',
    organism: 'Vibrio cholerae',
    microscope: 'Titan Krios',
    file_types: ['.tif', '.rec'],
    created_at: '2023-03-15T00:00:00Z'
  }
];

describe('SearchInterface Component', () => {
  const mockOnFilterChange = jest.fn();
  const defaultProps = {
    tomograms: mockTomograms,
    filteredCount: 3,
    onFilterChange: mockOnFilterChange
  };

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  // Test 1: Component renders with search interface
  test('renders search interface with all elements', () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Should have main search elements
    expect(screen.getByText(/search & filter datasets/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search datasets/i)).toBeInTheDocument();
    expect(screen.getByText(/3 datasets found/i)).toBeInTheDocument();
    
    // Should have toggle button for filters
    expect(screen.getByText(/advanced filters/i)).toBeInTheDocument();
    
    // Filters should be hidden initially
    expect(screen.queryByLabelText(/species/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/microscope/i)).not.toBeInTheDocument();
  });

  // Test 1b: Toggle filters functionality
  test('toggles filters visibility when toggle button is clicked', () => {
    render(<SearchInterface {...defaultProps} />);
    
    const toggleButton = screen.getByText(/advanced filters/i);
    
    // Filters should be hidden initially
    expect(screen.queryByLabelText(/species/i)).not.toBeInTheDocument();
    
    // Click to show filters
    fireEvent.click(toggleButton);
    
    // Filters should now be visible
    expect(screen.getByLabelText(/species/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/microscope/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    
    // Click to hide filters again
    fireEvent.click(toggleButton);
    
    // Filters should be hidden again
    expect(screen.queryByLabelText(/species/i)).not.toBeInTheDocument();
  });

  // Test 2: Text search functionality
  test('performs text search across titles and descriptions', async () => {
    render(<SearchInterface {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search datasets/i);
    
    // Search for "cholerae" 
    fireEvent.change(searchInput, { target: { value: 'cholerae' } });
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        searchText: 'cholerae',
        species: '',
        microscopeType: '',
        dateRange: { start: '', end: '' },
        fileTypes: []
      });
    });
  });

  // Test 2: Filter by species dropdown
  test('filters by species using dropdown', async () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    const speciesSelect = screen.getByLabelText(/species/i);
    
    // Change species filter
    fireEvent.change(speciesSelect, { target: { value: 'Vibrio cholerae' } });
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        searchText: '',
        species: 'Vibrio cholerae',
        microscopeType: '',
        dateRange: { start: '', end: '' },
        fileTypes: []
      });
    });
  });

  // Test 3: Filter by microscope type
  test('filters by microscope type using dropdown', async () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    const microscopeSelect = screen.getByLabelText(/microscope/i);
    
    // Change microscope filter to match actual data
    fireEvent.change(microscopeSelect, { target: { value: 'Titan Krios' } });
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        searchText: '',
        species: '',
        microscopeType: 'Titan Krios',
        dateRange: { start: '', end: '' },
        fileTypes: []
      });
    });
  });

  // Test 4: Filter by file types with checkboxes
  test('filters by file types using checkboxes', async () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    const mrcCheckbox = screen.getByLabelText(/\.mrc/i);
    const mp4Checkbox = screen.getByLabelText(/\.mp4/i);
    
    // Check multiple file types
    fireEvent.click(mrcCheckbox);
    fireEvent.click(mp4Checkbox);
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        searchText: '',
        species: '',
        microscopeType: '',
        dateRange: { start: '', end: '' },
        fileTypes: ['.mrc', '.mp4']
      });
    });
  });

  // Test 5: Date range filtering
  test('filters by date range', async () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    
    // Set date range
    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2023-12-31' } });
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        searchText: '',
        species: '',
        microscopeType: '',
        dateRange: { start: '2023-01-01', end: '2023-12-31' },
        fileTypes: []
      });
    });
  });

  // Test 5b: Improved date input allows partial editing
  test('allows partial date editing without resetting entire date', async () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    const startDateInput = screen.getByLabelText(/start date/i);
    
    // Type a partial date
    fireEvent.change(startDateInput, { target: { value: '2023-05' } });
    
    // Should maintain the partial value
    expect(startDateInput.value).toBe('2023-05');
    
    // Continue typing
    fireEvent.change(startDateInput, { target: { value: '2023-05-15' } });
    
    // Should have the complete date
    expect(startDateInput.value).toBe('2023-05-15');
    
    // Edit just the year
    fireEvent.change(startDateInput, { target: { value: '2024-05-15' } });
    
    // Should maintain month and day while changing year
    expect(startDateInput.value).toBe('2024-05-15');
  });

  // Test 5c: Date validation prevents invalid input
  test('validates date input and prevents invalid characters', async () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    const startDateInput = screen.getByLabelText(/start date/i);
    
    // Try to enter invalid characters
    fireEvent.change(startDateInput, { target: { value: '2023abc-05-15' } });
    
    // Should clean out invalid characters
    expect(startDateInput.value).toBe('2023-05-15');
    
    // Test gradual typing
    fireEvent.change(startDateInput, { target: { value: '2' } });
    expect(startDateInput.value).toBe('2');
    
    fireEvent.change(startDateInput, { target: { value: '20' } });
    expect(startDateInput.value).toBe('20');
    
    fireEvent.change(startDateInput, { target: { value: '2023' } });
    expect(startDateInput.value).toBe('2023');
    
    fireEvent.change(startDateInput, { target: { value: '2023-' } });
    expect(startDateInput.value).toBe('2023-');
    
    fireEvent.change(startDateInput, { target: { value: '2023-0' } });
    expect(startDateInput.value).toBe('2023-0');
    
    fireEvent.change(startDateInput, { target: { value: '2023-05' } });
    expect(startDateInput.value).toBe('2023-05');
    
    fireEvent.change(startDateInput, { target: { value: '2023-05-' } });
    expect(startDateInput.value).toBe('2023-05-');
    
    fireEvent.change(startDateInput, { target: { value: '2023-05-1' } });
    expect(startDateInput.value).toBe('2023-05-1');
    
    fireEvent.change(startDateInput, { target: { value: '2023-05-15' } });
    expect(startDateInput.value).toBe('2023-05-15');
  });

  // Test 5d: Auto-hyphen insertion during date typing
  test('automatically inserts hyphens while typing dates', async () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    const startDateInput = screen.getByLabelText(/start date/i);
    
    // Test no auto-hyphen until 5th digit
    fireEvent.change(startDateInput, { target: { value: '2023' } });
    expect(startDateInput.value).toBe('2023');
    
    // Test auto-hyphen after 5th digit (year + month start)
    fireEvent.change(startDateInput, { target: { value: '20230' } });
    expect(startDateInput.value).toBe('2023-0');
    
    fireEvent.change(startDateInput, { target: { value: '202305' } });
    expect(startDateInput.value).toBe('2023-05');
    
    // Test auto-hyphen after 7th digit (year + month + day start)
    fireEvent.change(startDateInput, { target: { value: '2023051' } });
    expect(startDateInput.value).toBe('2023-05-1');
    
    fireEvent.change(startDateInput, { target: { value: '20230515' } });
    expect(startDateInput.value).toBe('2023-05-15');
    
    // Test typing all digits at once
    fireEvent.change(startDateInput, { target: { value: '' } });
    fireEvent.change(startDateInput, { target: { value: '20241225' } });
    expect(startDateInput.value).toBe('2024-12-25');
    
    // Test partial typing preserves expected behavior
    fireEvent.change(startDateInput, { target: { value: '202' } });
    expect(startDateInput.value).toBe('202');
    
    fireEvent.change(startDateInput, { target: { value: '2024' } });
    expect(startDateInput.value).toBe('2024');
    
    fireEvent.change(startDateInput, { target: { value: '20241' } });
    expect(startDateInput.value).toBe('2024-1');
    
    fireEvent.change(startDateInput, { target: { value: '202412' } });
    expect(startDateInput.value).toBe('2024-12');
    
    fireEvent.change(startDateInput, { target: { value: '2024121' } });
    expect(startDateInput.value).toBe('2024-12-1');
  });

  // Test 5e: Invalid dates don't affect filtering
  test('invalid or partial dates do not affect filtering results', async () => {
    const mockOnFilterChange = jest.fn();
    render(<SearchInterface {...defaultProps} onFilterChange={mockOnFilterChange} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    const startDateInput = screen.getByLabelText(/start date/i);
    
    // Test partial dates - should not affect filtering
    fireEvent.change(startDateInput, { target: { value: '2023' } });
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        searchText: '',
        species: '',
        microscopeType: '',
        dateRange: { start: '2023', end: '' },
        fileTypes: []
      });
    });
    
    // Test incomplete month - should not affect filtering
    fireEvent.change(startDateInput, { target: { value: '2023-1' } });
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        searchText: '',
        species: '',
        microscopeType: '',
        dateRange: { start: '2023-1', end: '' },
        fileTypes: []
      });
    });
    
    // Test complete valid date - should affect filtering
    fireEvent.change(startDateInput, { target: { value: '2023-01-15' } });
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        searchText: '',
        species: '',
        microscopeType: '',
        dateRange: { start: '2023-01-15', end: '' },
        fileTypes: []
      });
    });
  });

  // Test 6: File type filtering with checkboxes
  test('filters by file types using checkboxes', async () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    // Should show file type checkboxes
    const mrcCheckbox = screen.getByLabelText(/\.mrc/i);
    const recCheckbox = screen.getByLabelText(/\.rec/i);
    const mp4Checkbox = screen.getByLabelText(/\.mp4/i);
    
    expect(mrcCheckbox).toBeInTheDocument();
    expect(recCheckbox).toBeInTheDocument();
    expect(mp4Checkbox).toBeInTheDocument();
    
    // Check .mrc and .mp4 file types
    fireEvent.click(mrcCheckbox);
    fireEvent.click(mp4Checkbox);
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        searchText: '',
        species: '',
        microscopeType: '',
        dateRange: { start: '', end: '' },
        fileTypes: ['.mrc', '.mp4']
      });
    });
  });

  // Test 7: Clear all filters functionality
  test('clears all filters when clear button is clicked', async () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    // Set some filters first
    const searchInput = screen.getByPlaceholderText(/search datasets/i);
    const speciesSelect = screen.getByLabelText(/species/i);
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    fireEvent.change(speciesSelect, { target: { value: 'Vibrio cholerae' } });
    
    // Click clear filters button
    const clearButton = screen.getByText(/clear filters/i);
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        searchText: '',
        species: '',
        microscopeType: '',
        dateRange: { start: '', end: '' },
        fileTypes: []
      });
    });
    
    // Form should be reset
    expect(searchInput.value).toBe('');
    expect(speciesSelect.value).toBe('');
  });

  // Test 8: Combined filters work together
  test('applies multiple filters simultaneously', async () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Show filters first
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    const searchInput = screen.getByPlaceholderText(/search datasets/i);
    const speciesSelect = screen.getByLabelText(/species/i);
    const microscopeSelect = screen.getByLabelText(/microscope/i);
    
    // Set multiple filters
    fireEvent.change(searchInput, { target: { value: 'cell' } });
    fireEvent.change(speciesSelect, { target: { value: 'Vibrio cholerae' } });
    fireEvent.change(microscopeSelect, { target: { value: 'Polara 300' } });
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        searchText: 'cell',
        species: 'Vibrio cholerae',
        microscopeType: 'Polara 300',
        dateRange: { start: '', end: '' },
        fileTypes: []
      });
    });
  });

  // Test 9: Filter state persistence
  test('maintains filter state when props change', () => {
    const { rerender } = render(<SearchInterface {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search datasets/i);
    fireEvent.change(searchInput, { target: { value: 'persistent search' } });
    
    // Re-render with new props
    rerender(<SearchInterface {...defaultProps} tomograms={[mockTomograms[0]]} />);
    
    // Search input should maintain its value
    expect(searchInput.value).toBe('persistent search');
  });

  // Test 10: Results count display
  test('displays filtered results count', () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Should show total count initially
    expect(screen.getByText(/3 datasets found/i)).toBeInTheDocument();
  });

  // Test 11: Accessible form labels and structure
  test('has proper accessibility attributes', () => {
    render(<SearchInterface {...defaultProps} />);
    
    // Search should always be accessible
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    
    // Show filters to test filter accessibility
    fireEvent.click(screen.getByText(/advanced filters/i));
    
    // All form elements should have proper labels
    expect(screen.getByLabelText(/species/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/microscope/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  // Test 12: Debounced search input
  test('debounces search input to avoid excessive filtering', async () => {
    render(<SearchInterface {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search datasets/i);
    
    // Type rapidly
    fireEvent.change(searchInput, { target: { value: 'a' } });
    fireEvent.change(searchInput, { target: { value: 'ab' } });
    fireEvent.change(searchInput, { target: { value: 'abc' } });
    
    // Should debounce and only call once after delay
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    }, { timeout: 600 }); // Allow for debounce delay
  });
}); 