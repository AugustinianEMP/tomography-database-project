// Mock data for electron tomography datasets
// University of Chicago Tomography Database

export const mockTomograms = [
  {
    tomogramId: "UCTD_001",
    title: "Vibrio cholerae cell ultrastructure",
    description: "Cryo-electron tomography of V. cholerae revealing cellular organization and chemoreceptor arrays",
    
    // Scientific metadata
    species: "Vibrio cholerae",
    cellType: "Bacterial cell",
    strain: "El Tor N16961",
    
    // Visual content - designed for easy backend migration
    thumbnailUrl: "/images/tomograms/UCTD_001_thumb.jpg",
    detailImageUrl: "/images/tomograms/UCTD_001_detail.jpg", 
    videoUrl: "/videos/tomograms/UCTD_001_reconstruction.mp4",
    imageGallery: [
      "/images/tomograms/UCTD_001_slice1.jpg",
      "/images/tomograms/UCTD_001_slice2.jpg", 
      "/images/tomograms/UCTD_001_3d.jpg"
    ],
    
    // Acquisition parameters
    microscopeType: "FEI Polara 300kV",
    acceleratingVoltage: 300,
    magnification: 31000,
    pixelSize: 0.68,
    tiltRange: "-60° to +60°",
    
    // Sample preparation
    preparationMethod: "Cryo-fixation",
    contrastMethod: "Vitreous ice",
    fiducialType: "10nm gold beads",
    
    // Processing information
    reconstructionSoftware: "IMOD",
    processingParameters: {
      binning: 4,
      reconstruction: "weighted back-projection",
      alignment: "fiducial-based"
    },
    
    // Data organization
    datasetSize: "2.3 GB",
    fileTypes: [".mrc", ".rec", ".mod", ".tif", ".mp4"],
    downloadUrls: [
      "/files/UCTD_001/raw_tilt_series.mrc",
      "/files/UCTD_001/reconstruction.rec",
      "/files/UCTD_001/segmentation.mod",
      "/files/UCTD_001/video.mp4"
    ],
    
    // Publication info
    authors: ["Structural Biology Lab", "University of Chicago"],
    publicationDate: "2023-05-15",
    lab: "UChicago Structural Biology Laboratory",
    
    // Featured content
    cellularFeatures: ["chemoreceptor arrays", "cell envelope", "cytoplasm"]
  },
  
  {
    tomogramId: "UCTD_002", 
    title: "Caulobacter crescentus division cycle",
    description: "Time-resolved cryo-ET of C. crescentus during cell division showing chromosome segregation",
    
    species: "Caulobacter crescentus",
    cellType: "Bacterial cell",
    strain: "CB15N",
    
    // Visual content
    thumbnailUrl: "/images/tomograms/UCTD_002_thumb.jpg",
    detailImageUrl: "/images/tomograms/UCTD_002_detail.jpg",
    videoUrl: "/videos/tomograms/UCTD_002_division.mp4", 
    imageGallery: [
      "/images/tomograms/UCTD_002_early.jpg",
      "/images/tomograms/UCTD_002_mid.jpg",
      "/images/tomograms/UCTD_002_late.jpg"
    ],
    
    microscopeType: "Titan Krios 300kV",
    acceleratingVoltage: 300,
    magnification: 42000,
    pixelSize: 0.54,
    tiltRange: "-70° to +70°",
    
    preparationMethod: "Cryo-fixation",
    contrastMethod: "Vitreous ice", 
    fiducialType: "15nm gold beads",
    
    reconstructionSoftware: "AreTomo",
    processingParameters: {
      binning: 2,
      reconstruction: "SART",
      alignment: "marker-free"
    },
    
    datasetSize: "4.1 GB",
    fileTypes: [".mrc", ".rec", ".star", ".mp4"],
    downloadUrls: [
      "/files/UCTD_002/tilt_series.mrc",
      "/files/UCTD_002/tomogram.rec", 
      "/files/UCTD_002/metadata.star",
      "/files/UCTD_002/division_video.mp4"
    ],
    
    authors: ["Cell Biology Research Group", "University of Chicago"],
    publicationDate: "2023-07-22",
    lab: "UChicago Cell and Molecular Biology Department",
    
    cellularFeatures: ["chromosome", "cell division machinery", "flagellum"]
  },

  {
    tomogramId: "UCTD_003",
    title: "Methanocaldococcus jannaschii archaeal cell",
    description: "Cryo-electron tomography of hyperthermophilic archaeon showing unique cellular features",
    
    species: "Methanocaldococcus jannaschii",
    cellType: "Archaeal cell", 
    strain: "DSM 2661",
    
    // Visual content
    thumbnailUrl: "/images/tomograms/UCTD_003_thumb.jpg",
    detailImageUrl: "/images/tomograms/UCTD_003_detail.jpg",
    videoUrl: "/videos/tomograms/UCTD_003_overview.mp4",
    imageGallery: [
      "/images/tomograms/UCTD_003_surface.jpg",
      "/images/tomograms/UCTD_003_interior.jpg"
    ],
    
    microscopeType: "FEI Polara 300kV",
    acceleratingVoltage: 300,
    magnification: 27500,
    pixelSize: 0.72,
    tiltRange: "-60° to +60°",
    
    preparationMethod: "Cryo-fixation",
    contrastMethod: "Vitreous ice",
    fiducialType: "10nm gold beads",
    
    reconstructionSoftware: "IMOD",
    processingParameters: {
      binning: 4,
      reconstruction: "weighted back-projection", 
      alignment: "fiducial-based"
    },
    
    datasetSize: "1.8 GB",
    fileTypes: [".mrc", ".rec", ".mod", ".tif"],
    downloadUrls: [
      "/files/UCTD_003/raw_data.mrc",
      "/files/UCTD_003/reconstruction.rec",
      "/files/UCTD_003/annotations.mod"
    ],
    
    authors: ["Microbiology Research Lab", "University of Chicago"],
    publicationDate: "2023-03-10",
    lab: "UChicago Department of Microbiology",
    
    cellularFeatures: ["S-layer", "cytoplasm", "ribosomes"]
  }
];

export const featuredCategories = [
  {
    id: "chemoreceptors",
    name: "Chemoreceptor Arrays", 
    description: "Highly ordered protein arrays that detect chemical signals in bacterial cells",
    exampleTomograms: ["UCTD_001"]
  },
  {
    id: "division",
    name: "Cell Division",
    description: "Molecular machinery orchestrating bacterial cell division processes",
    exampleTomograms: ["UCTD_002"] 
  },
  {
    id: "archaeal",
    name: "Archaeal Features",
    description: "Unique cellular structures found in extremophile archaea",
    exampleTomograms: ["UCTD_003"]
  }
]; 