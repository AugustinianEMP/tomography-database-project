import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DatasetDetail from '../DatasetDetail';
// Mock Supabase data for testing
const mockTomogram = {
  tomogram_id: 'UCTD_001',
  title: 'E. coli Ribosome Structure',
  description: 'High-resolution structure of E. coli ribosomes',
  organism: 'Escherichia coli',
  strain: 'MG1655',
  created_at: '2023-01-15T00:00:00Z',
  raw_data_path: '/data/raw/UCTD_001/',
  processed_data_path: '/data/processed/UCTD_001/',
  reconstruction_path: '/data/reconstructions/UCTD_001.mrc',
  thumbnail_path: '/images/tomograms/UCTD_001_thumb.jpg',
  authors: 'University of Chicago',
  tilt_series_range: '-60 to +60',
  tilt_increment: 1,
  total_dose: 1.8,
  defocus_min: -8,
  magnification: 22500,
  microscope: 'Titan Krios',
  reconstruction_software: 'IMOD',
  // Legacy fields for testing (these would come from future media implementation)
  videoUrl: '/videos/UCTD_001_reconstruction.mp4',
  detailImageUrl: '/images/tomograms/UCTD_001_detail.jpg',
  imageGallery: [
    '/images/tomograms/UCTD_001_slice1.jpg',
    '/images/tomograms/UCTD_001_slice2.jpg',
    '/images/tomograms/UCTD_001_3d.jpg'
  ]
};

describe('DatasetDetail Component', () => {
  const mockOnBackClick = jest.fn();
  const sampleTomogram = mockTomogram;
  
  // Create downloadUrls the same way the component does
  const getDownloadUrls = (dataset) => {
    const urls = [];
    if (dataset.raw_data_path) urls.push(dataset.raw_data_path);
    if (dataset.processed_data_path) urls.push(dataset.processed_data_path);
    if (dataset.reconstruction_path) urls.push(dataset.reconstruction_path);
    if (dataset.additional_files_paths && Array.isArray(dataset.additional_files_paths)) {
      urls.push(...dataset.additional_files_paths);
    }
    return urls;
  };
  sampleTomogram.downloadUrls = getDownloadUrls(sampleTomogram);

  beforeEach(() => {
    mockOnBackClick.mockClear();
    // Mock window.HTMLMediaElement for video tests
    Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
      writable: true,
      value: jest.fn(),
    });
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      writable: true,
      value: jest.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
      writable: true,
      value: jest.fn(),
    });
  });

  // Test 1: Component renders without crashing
  test('renders dataset detail component', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    expect(screen.getByText(/University of Chicago Tomography Database/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Escherichia coli' })).toBeInTheDocument();
  });

  // Test 2: Navigation and header
  test('displays navigation header and back button', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    // Navigation elements - DatasetDetail only shows Browse Database
    expect(screen.getByText('Browse Database')).toBeInTheDocument();
    
    // Back button
    expect(screen.getByText('← Return to database')).toBeInTheDocument();
  });

  // Test 3: Back button functionality
  test('back button triggers onBackClick', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    const backButton = screen.getByText('← Return to database');
    fireEvent.click(backButton);
    
    expect(mockOnBackClick).toHaveBeenCalledTimes(1);
  });

  // Test 4: Video player display and functionality
  test('displays video player when video URL exists', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    // Should render video element
    const video = document.querySelector('video.tomogram-video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('controls');
    expect(video.querySelector('source')).toHaveAttribute('src', sampleTomogram.videoUrl);
    
    // Video info
    expect(screen.getByText('Tomogram Reconstruction Video')).toBeInTheDocument();
    expect(screen.getByText('Auto-play enabled')).toBeInTheDocument();
  });

  // Test 5: Image fallback when video fails
  test('falls back to image when video fails to load', async () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    const video = document.querySelector('video.tomogram-video');
    
    // Simulate video error
    fireEvent.error(video);
    
    await waitFor(() => {
      // Should show detail image instead
      const image = document.querySelector('img.detail-image');
      expect(image).toHaveAttribute('src', sampleTomogram.detailImageUrl);
      expect(image).toHaveAttribute('alt', sampleTomogram.title);
    });
  });

  // Test 6: Image gallery functionality
  test('displays and navigates image gallery', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    // Should show gallery heading
    expect(screen.getByText('Additional Views')).toBeInTheDocument();
    
    // Should show thumbnail images
    const galleryThumbs = screen.getAllByAltText(/View \d+/);
    expect(galleryThumbs).toHaveLength(sampleTomogram.imageGallery.length);
    
    // Check thumbnail sources
    galleryThumbs.forEach((thumb, index) => {
      expect(thumb).toHaveAttribute('src', sampleTomogram.imageGallery[index]);
    });
  });

  // Test 7: Gallery thumbnail selection
  test('gallery thumbnail selection updates main view', async () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    const galleryThumbs = screen.getAllByAltText(/View \d+/);
    
    // Click on second thumbnail
    fireEvent.click(galleryThumbs[1]);
    
    await waitFor(() => {
      // Should show the selected image in main gallery view
      const mainGalleryImage = screen.getByAltText('Additional view 2');
      expect(mainGalleryImage).toHaveAttribute('src', sampleTomogram.imageGallery[1]);
    });
    
    // First thumbnail should no longer be active, second should be active
    expect(galleryThumbs[0].closest('.gallery-thumb')).not.toHaveClass('active');
    expect(galleryThumbs[1].closest('.gallery-thumb')).toHaveClass('active');
  });

  // Test 8: Metadata display
  test('displays complete metadata information', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    // Check key metadata fields
    expect(screen.getByText('2023-01-15')).toBeInTheDocument(); // publication date
    expect(screen.getByText('University of Chicago')).toBeInTheDocument();
    expect(screen.getAllByText('Escherichia coli')).toHaveLength(2); // appears in title and metadata
    expect(screen.getByText('MG1655')).toBeInTheDocument(); // strain
          expect(screen.getByText(/-60 to \+60/)).toBeInTheDocument(); // tilt range (may span elements)
      expect(screen.getByText('Titan Krios')).toBeInTheDocument(); // microscope
    expect(screen.getByText('IMOD')).toBeInTheDocument(); // processing software
  });

  // Test 9: Download section
  test('displays download files section', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    // Download section heading
    expect(screen.getByText('Download files')).toBeInTheDocument();
    
    // Table headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
    
    // Download buttons for each file
    const downloadButtons = screen.getAllByText('DOWNLOAD');
    expect(downloadButtons).toHaveLength(sampleTomogram.downloadUrls.length);
  });

  // Test 10: File type recognition
  test('correctly identifies file types', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    // Should show correct file types based on extensions
    expect(screen.getByText('Tilt series')).toBeInTheDocument(); // .mrc
    // Our current files have different types - update based on actual file paths
    expect(screen.getByText('/DATA/RAW/UCTD_001/')).toBeInTheDocument(); // raw data path
    expect(screen.getByText('/DATA/PROCESSED/UCTD_001/')).toBeInTheDocument(); // processed data path
  });

  // Test 11: Keyboard navigation (ESC key)
  test('ESC key triggers back navigation', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnBackClick).toHaveBeenCalledTimes(1);
  });

  // Test 12: Keyboard navigation (Cmd+Left Arrow)
  test('Cmd+Left Arrow triggers back navigation', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    fireEvent.keyDown(document, { key: 'ArrowLeft', metaKey: true });
    
    expect(mockOnBackClick).toHaveBeenCalledTimes(1);
  });

  // Test 13: Trackpad swipe gesture
  test('right swipe gesture triggers back navigation', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    // Simulate trackpad swipe (wheel event with negative deltaX)
    fireEvent.wheel(document, { deltaX: -100, deltaY: 0 });
    
    // Should trigger navigation after timeout
    setTimeout(() => {
      expect(mockOnBackClick).toHaveBeenCalledTimes(1);
    }, 150);
  });

  // Test 14: Image error handling
  test('handles image loading errors gracefully', async () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    // Force video error first to show image
    const video = document.querySelector('video.tomogram-video');
    fireEvent.error(video);
    
    await waitFor(() => {
      const detailImage = document.querySelector('img.detail-image');
      
      // Simulate image error
      fireEvent.error(detailImage);
    });
    
    await waitFor(() => {
      // Should show placeholder
      expect(screen.getByText('Tomogram Image')).toBeInTheDocument();
      expect(screen.getByText('ID: UCTD_001')).toBeInTheDocument();
    });
  });

  // Test 15: Gallery image error handling
  test('handles gallery image errors', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    const galleryThumbs = screen.getAllByAltText(/View \d+/);
    
    // Simulate error on first gallery image
    fireEvent.error(galleryThumbs[0]);
    
    // Should still show thumbnail container
    expect(galleryThumbs[0]).toBeInTheDocument();
  });

  // Test 16: Missing tomogram handling
  test('handles missing tomogram data', () => {
    render(<DatasetDetail tomogram={null} onBackClick={mockOnBackClick} />);
    
    expect(screen.getByText('Dataset not found')).toBeInTheDocument();
  });

  // Test 17: Tomogram without video
  test('displays image when no video URL provided', () => {
    const tomogramWithoutVideo = { ...sampleTomogram, videoUrl: null };
    render(<DatasetDetail tomogram={tomogramWithoutVideo} onBackClick={mockOnBackClick} />);
    
    // Should directly show image, not video
    const image = document.querySelector('img.detail-image');
    expect(image).toHaveAttribute('src', tomogramWithoutVideo.detailImageUrl);
    expect(document.querySelector('video.tomogram-video')).not.toBeInTheDocument(); // no video
  });

  // Test 18: Share functionality
  test('displays share section', () => {
    render(<DatasetDetail tomogram={sampleTomogram} onBackClick={mockOnBackClick} />);
    
    expect(screen.getByText('Share:')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
  });
}); 