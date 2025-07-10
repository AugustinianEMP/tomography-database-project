# University of Chicago Tomography Database - Development Standards

## Project Overview
Building a comprehensive electron tomography database for the University of Chicago research community. This platform will serve researchers in structural biology, cell biology, and related fields by providing access to high-quality cryo-electron tomography datasets.

## Core Principles

### 1. Test-Driven Development (TDD)
**RED → GREEN → REFACTOR cycle**
- Write failing tests first (RED)
- Write minimal code to pass tests (GREEN) 
- Improve code quality while keeping tests green (REFACTOR)

### 2. Scientific Accuracy
- Accurate representation of electron tomography workflows
- Proper scientific metadata and terminology
- Support for standard EM file formats (.mrc, .rec, .mod, .star, .tif)

### 3. University of Chicago Identity
- Branded as UChicago Tomography Database
- For now, just support for my lab's research group 

### 4. Educational Accessibility
- Clear explanations for non-experts
- Progressive disclosure of technical details
- Supporting materials for students and researchers

## Technical Architecture

### Frontend Components

#### 1. **DatasetBrowser** ✅ COMPLETE
Primary interface showing all available tomography datasets
- **Props**: `tomograms`, `loading`
- **Features**: Grid layout, featured badges, metadata display
- **Test Coverage**: 7/7 tests passing

#### 2. **Dataset Detail Page** - NEXT PRIORITY
Individual dataset view with comprehensive information
- **Route**: `/dataset/:id`
- **Features**: 
  - Video player for reconstructions
  - Downloadable file management
  - Detailed acquisition parameters
  - Processing workflow information
- **Test Cases**:
  - Renders dataset details correctly
  - Video player functions properly
  - Download links work
  - Metadata is accurately displayed
  - Handles missing data gracefully

#### 3. **Search Interface**
Advanced filtering and search capabilities
- **Features**:
  - Species/organism filtering
  - Microscope type selection
  - Date range filters
  - File type filtering
  - Text search across descriptions
- **Test Cases**:
  - Filter combinations work correctly
  - Search results update dynamically
  - Clear filters functionality
  - No results state handled

#### 4. **Featured Datasets Page**
Educational showcase of interesting cellular features
- **Categories**: 
  - Chemoreceptor Arrays
  - Cell Division Machinery
  - Archaeal Features
  - Protein Complexes
- **Features**:
  - Category navigation
  - Educational descriptions
  - Related dataset suggestions

#### 5. **File Download Manager**
Handle scientific file downloads and organization
- **Supported Formats**: .mrc, .rec, .mod, .star, .tif, .mp4, .pdf
- **Features**:
  - Batch download capability
  - File size information
  - Download progress tracking
  - Metadata export

#### 6. **Video Player Component**
Specialized viewer for tomographic reconstructions
- **Features**:
  - HTML5 video with custom controls
  - Playback speed adjustment
  - Full-screen capability
  - Frame-by-frame navigation

### Data Structure

#### Research-Tomogram Record Schema
```javascript
{
  tomogramId: "UCTD_XXX",           // University of Chicago TD identifier
  title: "Descriptive title",
  description: "Detailed description",
  
  // Scientific metadata
  species: "Organism name",
  cellType: "Cell classification",
  strain: "Specific strain",
  
  // Acquisition parameters
  microscopeType: "Instrument model",
  acceleratingVoltage: 300,          // kV
  magnification: 31000,
  pixelSize: 0.68,                   // nm
  tiltRange: "Angular range",
  
  // Sample preparation
  preparationMethod: "Protocol",
  contrastMethod: "Contrast type",
  fiducialType: "Marker type",
  
  // Processing information
  reconstructionSoftware: "Software used",
  processingParameters: {
    binning: 4,
    reconstruction: "Algorithm",
    alignment: "Method"
  },
  
  // Organization
  datasetSize: "Total size",
  fileTypes: ["file", "extensions"],
  downloadUrls: ["path/to/files"],
  
  // Attribution
  authors: ["Author names"],
  publicationDate: "YYYY-MM-DD",
  lab: "UChicago Laboratory Name",
  
  // Display features
  isFeatured: boolean,
  cellularFeatures: ["feature", "list"],
  thumbnailUrl: "image/path",
  videoUrl: "video/path"
}
```

## Implementation Strategy

### Phase 1: Foundation ✅ COMPLETE
- [x] Testing framework setup
- [x] Mock data creation (3 realistic datasets)
- [x] DatasetBrowser component with full test coverage
- [x] University of Chicago branding and identity

### Phase 2: Core Features - IN PROGRESS
- [ ] Dataset Detail Page with video player
- [ ] Search and filtering interface
- [ ] Responsive navigation
- [ ] File download management

### Phase 3: Enhanced Features
- [ ] Featured datasets educational content
- [ ] Advanced search with multiple filters
- [ ] User preferences and bookmarks
- [ ] Export capabilities

### Phase 4: Integration & Deployment
- [ ] Firebase backend integration
- [ ] Authentication system
- [ ] Performance optimization
- [ ] Production deployment

## Mock Data Requirements

### Current Dataset Coverage ✅
- **UCTD_001**: V. cholerae (featured) - chemoreceptor arrays
- **UCTD_002**: C. crescentus (featured) - cell division  
- **UCTD_003**: M. jannaschii - archaeal features

### Expansion Goals
Target: 50+ realistic electron tomography entries representing:
- Various bacterial species (E. coli, B. subtilis, etc.)
- Archaeal organisms (thermophiles, halophiles)
- Different cellular features and processes
- Multiple UChicago research laboratories
- Range of acquisition parameters and processing methods

## Quality Standards

### Code Quality
- TypeScript for type safety (future upgrade)
- ESLint configuration following React best practices
- Component reusability and modularity
- Comprehensive error handling

### Testing Standards
- Minimum 80% test coverage
- Unit tests for all components
- Integration tests for user workflows
- Mock data for consistent testing

### Performance
- Lazy loading for large datasets
- Image and video optimization
- Responsive design for all devices
- Fast search and filtering

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Clear visual hierarchy

## File Organization
```
src/
├── components/           # React components
│   ├── DatasetBrowser.js ✅
│   ├── DatasetDetail.js
│   ├── SearchInterface.js
│   ├── VideoPlayer.js
│   └── __tests__/       # Component tests
├── data/
│   ├── mockTomograms.js ✅
│   └── featuredCategories.js
├── utils/               # Helper functions
├── styles/              # CSS modules
└── firebase/            # Backend configuration
```

This represents a complete, University of Chicago-specific electron tomography database following modern web development practices and scientific data management standards. 