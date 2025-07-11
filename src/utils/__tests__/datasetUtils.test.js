import { 
  generateNextTomogramId, 
  validateTomogramId, 
  tomogramIdExists, 
  createTomogramObject 
} from '../datasetUtils';

describe('datasetUtils', () => {
  describe('generateNextTomogramId', () => {
    test('should return UCTD_001 for empty array', () => {
      expect(generateNextTomogramId([])).toBe('UCTD_001');
    });

    test('should return UCTD_001 for null/undefined input', () => {
      expect(generateNextTomogramId(null)).toBe('UCTD_001');
      expect(generateNextTomogramId(undefined)).toBe('UCTD_001');
    });

    test('should increment correctly from existing IDs', () => {
      const mockTomograms = [
        { tomogramId: 'UCTD_001' },
        { tomogramId: 'UCTD_003' },
        { tomogramId: 'UCTD_002' }
      ];
      expect(generateNextTomogramId(mockTomograms)).toBe('UCTD_004');
    });

    test('should handle non-sequential IDs correctly', () => {
      const mockTomograms = [
        { tomogramId: 'UCTD_001' },
        { tomogramId: 'UCTD_010' },
        { tomogramId: 'UCTD_005' }
      ];
      expect(generateNextTomogramId(mockTomograms)).toBe('UCTD_011');
    });

    test('should handle invalid ID formats gracefully', () => {
      const mockTomograms = [
        { tomogramId: 'UCTD_001' },
        { tomogramId: 'INVALID_ID' },
        { tomogramId: 'UCTD_002' }
      ];
      expect(generateNextTomogramId(mockTomograms)).toBe('UCTD_003');
    });

    test('should pad with zeros correctly', () => {
      const mockTomograms = [
        { tomogramId: 'UCTD_099' }
      ];
      expect(generateNextTomogramId(mockTomograms)).toBe('UCTD_100');
    });
  });

  describe('validateTomogramId', () => {
    test('should validate correct format', () => {
      expect(validateTomogramId('UCTD_001')).toBe(true);
      expect(validateTomogramId('UCTD_100')).toBe(true);
      expect(validateTomogramId('UCTD_999')).toBe(true);
    });

    test('should reject incorrect formats', () => {
      expect(validateTomogramId('UCTD_01')).toBe(false);   // Too few digits
      expect(validateTomogramId('UCTD_1000')).toBe(false); // Too many digits
      expect(validateTomogramId('INVALID_001')).toBe(false); // Wrong prefix
      expect(validateTomogramId('UCTD001')).toBe(false);   // Missing underscore
      expect(validateTomogramId('UCTD_abc')).toBe(false);  // Non-numeric
    });
  });

  describe('tomogramIdExists', () => {
    const mockTomograms = [
      { tomogramId: 'UCTD_001' },
      { tomogramId: 'UCTD_002' },
      { tomogramId: 'UCTD_003' }
    ];

    test('should return true for existing IDs', () => {
      expect(tomogramIdExists('UCTD_001', mockTomograms)).toBe(true);
      expect(tomogramIdExists('UCTD_002', mockTomograms)).toBe(true);
      expect(tomogramIdExists('UCTD_003', mockTomograms)).toBe(true);
    });

    test('should return false for non-existing IDs', () => {
      expect(tomogramIdExists('UCTD_004', mockTomograms)).toBe(false);
      expect(tomogramIdExists('UCTD_999', mockTomograms)).toBe(false);
      expect(tomogramIdExists('INVALID_001', mockTomograms)).toBe(false);
    });

    test('should handle empty array', () => {
      expect(tomogramIdExists('UCTD_001', [])).toBe(false);
    });
  });

  describe('createTomogramObject', () => {
    const mockFormData = {
      title: 'Test Tomogram',
      description: 'Test description',
      species: 'Escherichia coli',
      cellType: 'Bacterial cell',
      strain: 'MG1655',
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
      datasetSize: '2.3 GB',
      fileTypes: ['.mrc', '.rec', '.mod', '.tif'],
      authors: 'John Doe, Jane Smith',
      publicationDate: '2024-01-15',
      lab: 'UChicago Research Lab',
      cellularFeatures: 'flagella, ribosomes'
    };

    test('should create complete tomogram object', () => {
      const result = createTomogramObject(mockFormData, 'UCTD_004');

      expect(result.tomogramId).toBe('UCTD_004');
      expect(result.title).toBe('Test Tomogram');
      expect(result.description).toBe('Test description');
      expect(result.species).toBe('Escherichia coli');
      expect(result.cellType).toBe('Bacterial cell');
      expect(result.strain).toBe('MG1655');
    });

    test('should handle array parsing for authors and features', () => {
      const result = createTomogramObject(mockFormData, 'UCTD_004');

      expect(result.authors).toEqual(['John Doe', 'Jane Smith']);
      expect(result.cellularFeatures).toEqual(['flagella', 'ribosomes']);
    });

    test('should use defaults for missing values', () => {
      const minimalFormData = {
        title: 'Minimal Test',
        description: 'Minimal description'
      };

      const result = createTomogramObject(minimalFormData, 'UCTD_005');

      expect(result.tomogramId).toBe('UCTD_005');
      expect(result.title).toBe('Minimal Test');
      expect(result.cellType).toBe('Bacterial cell');
      expect(result.microscopeType).toBe('FEI Polara 300kV');
      expect(result.acceleratingVoltage).toBe(300);
      expect(result.authors).toEqual(['University of Chicago']);
    });

    test('should generate correct file paths', () => {
      const result = createTomogramObject(mockFormData, 'UCTD_006');

      expect(result.thumbnailUrl).toBe('/images/tomograms/UCTD_006_thumb.jpg');
      expect(result.detailImageUrl).toBe('/images/tomograms/UCTD_006_detail.jpg');
      expect(result.videoUrl).toBe('/videos/tomograms/UCTD_006_video.mp4');
      expect(result.imageGallery).toEqual([
        '/images/tomograms/UCTD_006_slice1.jpg',
        '/images/tomograms/UCTD_006_slice2.jpg',
        '/images/tomograms/UCTD_006_3d.jpg'
      ]);
    });

    test('should handle numeric field conversion', () => {
      const formDataWithStrings = {
        ...mockFormData,
        acceleratingVoltage: '250',
        magnification: '25000',
        pixelSize: '0.75',
        binning: '2'
      };

      const result = createTomogramObject(formDataWithStrings, 'UCTD_007');

      expect(result.acceleratingVoltage).toBe(250);
      expect(result.magnification).toBe(25000);
      expect(result.pixelSize).toBe(0.75);
      expect(result.processingParameters.binning).toBe(2);
    });

    test('should set current date when no publication date provided', () => {
      const formDataNoDate = {
        ...mockFormData,
        publicationDate: undefined
      };

      const result = createTomogramObject(formDataNoDate, 'UCTD_008');
      const today = new Date().toISOString().split('T')[0];

      expect(result.publicationDate).toBe(today);
    });
  });
}); 