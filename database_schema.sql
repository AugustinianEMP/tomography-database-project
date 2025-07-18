-- University of Chicago Tomography Database Schema
-- This schema matches the AddDatasetForm component structure

CREATE TABLE IF NOT EXISTS datasets (
  -- Primary identifiers
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tomogram_id VARCHAR(10) UNIQUE NOT NULL, -- UCTD_XXX format
  
  -- Basic Information
  title VARCHAR(500) NOT NULL,
  description TEXT,
  organism VARCHAR(200),
  strain VARCHAR(200),
  
  -- Scientific Metadata
  cellular_component VARCHAR(300),
  molecular_function VARCHAR(300),
  biological_process VARCHAR(300),
  keywords TEXT[] DEFAULT '{}', -- Array of keywords
  
  -- Acquisition Parameters
  microscope VARCHAR(200),
  detector VARCHAR(200),
  acceleration_voltage INTEGER, -- in kV
  magnification INTEGER,
  pixel_size DECIMAL(10,4), -- in Angstroms
  defocus_min DECIMAL(10,4), -- in micrometers
  defocus_max DECIMAL(10,4), -- in micrometers
  tilt_series_range VARCHAR(50), -- e.g., "-60 to +60"
  tilt_increment DECIMAL(5,2), -- in degrees
  total_dose DECIMAL(10,2), -- in e/Å²
  
  -- Sample Preparation
  sample_preparation TEXT,
  grid_type VARCHAR(200),
  staining VARCHAR(200),
  vitrification_method VARCHAR(200),
  cryo_protectant VARCHAR(200),
  
  -- Processing Information
  reconstruction_software VARCHAR(200),
  reconstruction_method VARCHAR(200),
  resolution DECIMAL(10,4), -- in Angstroms
  symmetry VARCHAR(50),
  processing_notes TEXT,
  
  -- Data Organization
  raw_data_path VARCHAR(1000),
  processed_data_path VARCHAR(1000),
  thumbnail_path VARCHAR(1000),
  reconstruction_path VARCHAR(1000),
  additional_files_paths TEXT[] DEFAULT '{}', -- Array of additional file paths
  image_gallery TEXT[] DEFAULT '{}', -- Array of image URLs for additional views
  
  -- Publication Information
  publication_title VARCHAR(500),
  authors TEXT,
  journal VARCHAR(200),
  publication_year INTEGER,
  doi VARCHAR(200),
  pmid VARCHAR(50),
  
  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID, -- For future user system
  
  -- Constraints
  CONSTRAINT valid_tomogram_id CHECK (tomogram_id ~ '^UCTD_\d{3}$'),
  CONSTRAINT valid_year CHECK (publication_year IS NULL OR (publication_year >= 1900 AND publication_year <= EXTRACT(YEAR FROM NOW()) + 1))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_datasets_tomogram_id ON datasets(tomogram_id);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON datasets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_datasets_organism ON datasets(organism);
CREATE INDEX IF NOT EXISTS idx_datasets_keywords ON datasets USING GIN(keywords);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_datasets_updated_at 
    BEFORE UPDATE ON datasets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for future authentication
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can restrict this later when you add auth)
CREATE POLICY "Allow all operations for now" ON datasets
    FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO datasets (
  tomogram_id,
  title,
  description,
  organism,
  strain,
  cellular_component,
  molecular_function,
  biological_process,
  keywords,
  microscope,
  detector,
  acceleration_voltage,
  magnification,
  pixel_size,
  defocus_min,
  defocus_max,
  tilt_series_range,
  tilt_increment,
  total_dose,
  sample_preparation,
  grid_type,
  staining,
  vitrification_method,
  reconstruction_software,
  reconstruction_method,
  resolution,
  processing_notes,
  raw_data_path,
  processed_data_path,
  thumbnail_path,
  reconstruction_path
) VALUES 
(
  'UCTD_001',
  'E. coli Ribosome Structure at High Resolution',
  'High-resolution cryo-electron tomography of E. coli ribosomes in their native cellular context.',
  'Escherichia coli',
  'MG1655',
  'ribosome',
  'protein synthesis',
  'translation',
  ARRAY['ribosome', 'protein synthesis', 'bacteria', 'cryo-ET'],
  'Titan Krios',
  'Gatan K3',
  300,
  81000,
  1.35,
  -2.0,
  -4.0,
  '-60 to +60',
  2.0,
  120.0,
  'Flash-frozen in liquid ethane using Vitrobot Mark IV',
  'Quantifoil R 1.2/1.3',
  'None (cryo)',
  'Plunge freezing',
  'IMOD',
  'Weighted back-projection',
  8.5,
  'Standard tomographic reconstruction with CTF correction',
  '/data/raw/UCTD_001/',
  '/data/processed/UCTD_001/',
  '/data/thumbnails/UCTD_001_thumb.jpg',
  '/data/reconstructions/UCTD_001_reconstruction.mrc'
);

-- Create a view for basic dataset information (useful for listings)
CREATE OR REPLACE VIEW datasets_summary AS
SELECT 
  tomogram_id,
  title,
  organism,
  strain,
  resolution,
  created_at,
  updated_at
FROM datasets
ORDER BY created_at DESC; 