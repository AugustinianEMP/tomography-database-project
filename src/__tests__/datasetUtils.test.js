import {
  generateNextTomogramId,
  validateTomogramId,
  tomogramIdExists,
  createTomogramObject,
  createDataset,
  fetchDatasets,
  fetchDatasetById
} from '../utils/datasetUtils';

// Mock the Supabase client
jest.mock('../supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => ({ data: null, error: null }))
        })),
        eq: jest.fn(() => ({
          single: jest.fn(() => ({ data: null, error: null }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({ data: null, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: null }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null }))
      }))
    }))
  }
}));

const { supabase } = require('../supabase/client');

describe('Dataset Utils - Supabase Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateNextTomogramId', () => {
    test('returns UCTD_001 for empty database', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          data: [],
          error: null
        })
      });

      const result = await generateNextTomogramId();
      expect(result).toBe('UCTD_001');
      expect(supabase.from).toHaveBeenCalledWith('datasets');
    });

    test('finds highest numerical ID correctly', async () => {
      const mockData = [
        { tomogram_id: 'UCTD_001' },
        { tomogram_id: 'UCTD_003' },
        { tomogram_id: 'UCTD_002' },
        { tomogram_id: 'UCTD_010' }
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          data: mockData,
          error: null
        })
      });

      const result = await generateNextTomogramId();
      expect(result).toBe('UCTD_011');
    });

    test('handles database error gracefully', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          data: null,
          error: { message: 'Connection failed' }
        })
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await generateNextTomogramId();
      expect(result).toBe('UCTD_001');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('handles malformed IDs gracefully', async () => {
      const mockData = [
        { tomogram_id: 'UCTD_001' },
        { tomogram_id: 'INVALID_ID' },
        { tomogram_id: 'UCTD_002' }
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          data: mockData,
          error: null
        })
      });

      const result = await generateNextTomogramId();
      expect(result).toBe('UCTD_003');
    });
  });

  describe('validateTomogramId', () => {
    test('validates correct format', () => {
      expect(validateTomogramId('UCTD_001')).toBe(true);
      expect(validateTomogramId('UCTD_999')).toBe(true);
      expect(validateTomogramId('UCTD_123')).toBe(true);
    });

    test('rejects invalid formats', () => {
      expect(validateTomogramId('UCTD_1')).toBe(false);
      expect(validateTomogramId('UCTD_1234')).toBe(false);
      expect(validateTomogramId('INVALID_001')).toBe(false);
      expect(validateTomogramId('uctd_001')).toBe(false);
      expect(validateTomogramId('')).toBe(false);
      expect(validateTomogramId(null)).toBe(false);
      expect(validateTomogramId(undefined)).toBe(false);
    });
  });

  describe('tomogramIdExists', () => {
    test('returns true when ID exists', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            data: { tomogram_id: 'UCTD_001' },
            error: null
          })
        })
      });

      supabase.from.mockReturnValue({ select: mockSelect });

      const result = await tomogramIdExists('UCTD_001');
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('datasets');
    });

    test('returns false when ID does not exist', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            data: null,
            error: { code: 'PGRST116' } // Not found error
          })
        })
      });

      supabase.from.mockReturnValue({ select: mockSelect });

      const result = await tomogramIdExists('UCTD_999');
      expect(result).toBe(false);
    });

    test('handles database errors', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            data: null,
            error: { code: 'OTHER_ERROR', message: 'Database error' }
          })
        })
      });

      supabase.from.mockReturnValue({ select: mockSelect });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await tomogramIdExists('UCTD_001');
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('createTomogramObject', () => {
    test('creates proper Supabase object from form data', () => {
      const formData = {
        title: 'Test Dataset',
        description: 'Test description',
        organism: 'E. coli',
        strain: 'MG1655',
        microscope: 'Titan Krios',
        accelerationVoltage: 300,
        magnification: 81000,
        pixelSize: 1.35,
        keywords: 'ribosome,protein synthesis'
      };

      const result = createTomogramObject(formData, 'UCTD_001');

      expect(result).toEqual({
        tomogram_id: 'UCTD_001',
        title: 'Test Dataset',
        description: 'Test description',
        organism: 'E. coli',
        strain: 'MG1655',
        cellular_component: '',
        molecular_function: '',
        biological_process: '',
        keywords: ['ribosome', 'protein synthesis'],
        microscope: 'Titan Krios',
        detector: '',
        acceleration_voltage: 300,
        magnification: 81000,
        pixel_size: 1.35,
        defocus_min: null,
        defocus_max: null,
        tilt_series_range: '-60° to +60°',
        tilt_increment: null,
        total_dose: null,
        sample_preparation: 'Cryo-fixation',
        grid_type: '',
        staining: 'Vitreous ice',
        vitrification_method: '',
        cryo_protectant: '',
        reconstruction_software: 'IMOD',
        reconstruction_method: 'weighted back-projection',
        resolution: null,
        symmetry: '',
        processing_notes: '',
        raw_data_path: '/data/raw/UCTD_001/',
        processed_data_path: '/data/processed/UCTD_001/',
        thumbnail_path: '/images/tomograms/UCTD_001_thumb.jpg',
        reconstruction_path: '/data/reconstructions/UCTD_001_reconstruction.mrc',
        additional_files_paths: [],
        publication_title: '',
        authors: 'University of Chicago',
        journal: '',
        publication_year: null,
        doi: '',
        pmid: ''
      });
    });

    test('handles array keywords correctly', () => {
      const formData = {
        title: 'Test',
        keywords: ['ribosome', 'bacteria']
      };

      const result = createTomogramObject(formData, 'UCTD_001');
      expect(result.keywords).toEqual(['ribosome', 'bacteria']);
    });
  });

  describe('createDataset', () => {
    test('creates dataset successfully', async () => {
      const mockDataset = { tomogram_id: 'UCTD_001', title: 'Test' };
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            data: mockDataset,
            error: null
          })
        })
      });

      supabase.from.mockReturnValue({ insert: mockInsert });

      const result = await createDataset(mockDataset);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDataset);
      expect(mockInsert).toHaveBeenCalledWith([mockDataset]);
    });

    test('handles creation error', async () => {
      const mockDataset = { tomogram_id: 'UCTD_001' };
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            data: null,
            error: { message: 'Duplicate key' }
          })
        })
      });

      supabase.from.mockReturnValue({ insert: mockInsert });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await createDataset(mockDataset);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('fetchDatasets', () => {
    test('fetches datasets successfully', async () => {
      const mockDatasets = [
        { tomogram_id: 'UCTD_001', title: 'Dataset 1' },
        { tomogram_id: 'UCTD_002', title: 'Dataset 2' }
      ];

      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          data: mockDatasets,
          error: null
        })
      });

      supabase.from.mockReturnValue({ select: mockSelect });

      const result = await fetchDatasets();
      
      expect(result).toEqual(mockDatasets);
      expect(supabase.from).toHaveBeenCalledWith('datasets');
    });

    test('handles fetch error', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          data: null,
          error: { message: 'Connection failed' }
        })
      });

      supabase.from.mockReturnValue({ select: mockSelect });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await fetchDatasets();
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
}); 