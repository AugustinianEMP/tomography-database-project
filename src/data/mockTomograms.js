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
  },

  {
    tomogramId: "UCTD_004",
    title: "Escherichia coli flagellar motor assembly",
    description: "High-resolution cryo-ET revealing the intricate structure of bacterial flagellar motors",
    
    species: "Escherichia coli",
    cellType: "Bacterial cell",
    strain: "MG1655",
    
    thumbnailUrl: "/images/tomograms/UCTD_004_thumb.jpg",
    detailImageUrl: "/images/tomograms/UCTD_004_detail.jpg",
    videoUrl: "/videos/tomograms/UCTD_004_motor.mp4",
    imageGallery: [
      "/images/tomograms/UCTD_004_motor1.jpg",
      "/images/tomograms/UCTD_004_motor2.jpg",
      "/images/tomograms/UCTD_004_rotor.jpg"
    ],
    
    microscopeType: "Titan Krios 300kV",
    acceleratingVoltage: 300,
    magnification: 53000,
    pixelSize: 0.42,
    tiltRange: "-60° to +60°",
    
    preparationMethod: "Cryo-fixation",
    contrastMethod: "Vitreous ice",
    fiducialType: "5nm gold beads",
    
    reconstructionSoftware: "cryoCARE",
    processingParameters: {
      binning: 1,
      reconstruction: "SIRT",
      alignment: "patch-tracking"
    },
    
    datasetSize: "3.7 GB",
    fileTypes: [".mrc", ".rec", ".star", ".tif", ".mp4"],
    downloadUrls: [
      "/files/UCTD_004/tilt_series.mrc",
      "/files/UCTD_004/tomogram.rec",
      "/files/UCTD_004/subtomograms.star",
      "/files/UCTD_004/motor_video.mp4"
    ],
    
    authors: ["Biophysics Laboratory", "University of Chicago"],
    publicationDate: "2023-09-12",
    lab: "UChicago Department of Physics",
    
    cellularFeatures: ["flagellar motor", "rotor", "stator", "export gate"]
  },

  {
    tomogramId: "UCTD_005",
    title: "Mycobacterium tuberculosis cell wall architecture",
    description: "Cryo-electron tomography of M. tuberculosis revealing complex cell wall organization",
    
    species: "Mycobacterium tuberculosis",
    cellType: "Bacterial cell",
    strain: "H37Rv",
    
    thumbnailUrl: "/images/tomograms/UCTD_005_thumb.jpg",
    detailImageUrl: "/images/tomograms/UCTD_005_detail.jpg",
    videoUrl: "/videos/tomograms/UCTD_005_cellwall.mp4",
    imageGallery: [
      "/images/tomograms/UCTD_005_wall1.jpg",
      "/images/tomograms/UCTD_005_wall2.jpg",
      "/images/tomograms/UCTD_005_lipids.jpg"
    ],
    
    microscopeType: "FEI Polara 300kV",
    acceleratingVoltage: 300,
    magnification: 39000,
    pixelSize: 0.61,
    tiltRange: "-65° to +65°",
    
    preparationMethod: "High-pressure freezing",
    contrastMethod: "Vitreous ice",
    fiducialType: "10nm gold beads",
    
    reconstructionSoftware: "IMOD",
    processingParameters: {
      binning: 3,
      reconstruction: "weighted back-projection",
      alignment: "fiducial-based"
    },
    
    datasetSize: "5.2 GB",
    fileTypes: [".mrc", ".rec", ".mod", ".tif"],
    downloadUrls: [
      "/files/UCTD_005/raw_tilt_series.mrc",
      "/files/UCTD_005/reconstruction.rec",
      "/files/UCTD_005/segmentation.mod",
      "/files/UCTD_005/annotations.tif"
    ],
    
    authors: ["Infectious Disease Research", "University of Chicago"],
    publicationDate: "2022-11-08",
    lab: "UChicago Department of Medicine",
    
    cellularFeatures: ["mycolic acid layer", "peptidoglycan", "cytoplasmic membrane"]
  },

  {
    tomogramId: "UCTD_006",
    title: "Bacillus subtilis sporulation process",
    description: "Time-course cryo-ET of B. subtilis spore formation showing membrane reorganization",
    
    species: "Bacillus subtilis",
    cellType: "Bacterial cell",
    strain: "168",
    
    thumbnailUrl: "/images/tomograms/UCTD_006_thumb.jpg",
    detailImageUrl: "/images/tomograms/UCTD_006_detail.jpg",
    videoUrl: "/videos/tomograms/UCTD_006_sporulation.mp4",
    imageGallery: [
      "/images/tomograms/UCTD_006_stage1.jpg",
      "/images/tomograms/UCTD_006_stage2.jpg",
      "/images/tomograms/UCTD_006_spore.jpg"
    ],
    
    microscopeType: "Titan Krios 300kV",
    acceleratingVoltage: 300,
    magnification: 29000,
    pixelSize: 0.69,
    tiltRange: "-70° to +70°",
    
    preparationMethod: "Cryo-fixation",
    contrastMethod: "Vitreous ice",
    fiducialType: "15nm gold beads",
    
    reconstructionSoftware: "novaCTF",
    processingParameters: {
      binning: 4,
      reconstruction: "filtered back-projection",
      alignment: "marker-free"
    },
    
    datasetSize: "6.1 GB",
    fileTypes: [".mrc", ".rec", ".star", ".mp4"],
    downloadUrls: [
      "/files/UCTD_006/timecourse.mrc",
      "/files/UCTD_006/tomograms.rec",
      "/files/UCTD_006/metadata.star",
      "/files/UCTD_006/sporulation_timelapse.mp4"
    ],
    
    authors: ["Developmental Biology Lab", "University of Chicago"],
    publicationDate: "2024-01-25",
    lab: "UChicago Department of Molecular Genetics",
    
    cellularFeatures: ["forespore", "mother cell", "spore coat", "cortex"]
  },

  {
    tomogramId: "UCTD_007",
    title: "Pseudomonas aeruginosa biofilm matrix",
    description: "Cryo-electron tomography of P. aeruginosa in biofilm showing extracellular matrix components",
    
    species: "Pseudomonas aeruginosa",
    cellType: "Bacterial cell",
    strain: "PAO1",
    
    thumbnailUrl: "/images/tomograms/UCTD_007_thumb.jpg",
    detailImageUrl: "/images/tomograms/UCTD_007_detail.jpg",
    videoUrl: "/videos/tomograms/UCTD_007_biofilm.mp4",
    imageGallery: [
      "/images/tomograms/UCTD_007_matrix1.jpg",
      "/images/tomograms/UCTD_007_matrix2.jpg",
      "/images/tomograms/UCTD_007_cells.jpg"
    ],
    
    microscopeType: "FEI Polara 300kV",
    acceleratingVoltage: 300,
    magnification: 22000,
    pixelSize: 0.91,
    tiltRange: "-60° to +60°",
    
    preparationMethod: "Cryo-fixation",
    contrastMethod: "Vitreous ice",
    fiducialType: "10nm gold beads",
    
    reconstructionSoftware: "eTomo",
    processingParameters: {
      binning: 6,
      reconstruction: "weighted back-projection",
      alignment: "fiducial-based"
    },
    
    datasetSize: "2.9 GB",
    fileTypes: [".mrc", ".rec", ".mod", ".tif", ".mp4"],
    downloadUrls: [
      "/files/UCTD_007/biofilm_series.mrc",
      "/files/UCTD_007/reconstruction.rec",
      "/files/UCTD_007/matrix_model.mod",
      "/files/UCTD_007/overview.mp4"
    ],
    
    authors: ["Environmental Microbiology", "University of Chicago"],
    publicationDate: "2023-12-14",
    lab: "UChicago Department of Geophysical Sciences",
    
    cellularFeatures: ["alginate matrix", "Psl polysaccharide", "eDNA", "type IV pili"]
  },

  {
    tomogramId: "UCTD_008",
    title: "Sulfolobus acidocaldarius S-layer structure",
    description: "High-resolution cryo-ET of archaeal S-layer protein organization in extreme thermoacidophile",
    
    species: "Sulfolobus acidocaldarius",
    cellType: "Archaeal cell",
    strain: "DSM 639",
    
    thumbnailUrl: "/images/tomograms/UCTD_008_thumb.jpg",
    detailImageUrl: "/images/tomograms/UCTD_008_detail.jpg",
    videoUrl: "/videos/tomograms/UCTD_008_slayer.mp4",
    imageGallery: [
      "/images/tomograms/UCTD_008_surface1.jpg",
      "/images/tomograms/UCTD_008_surface2.jpg",
      "/images/tomograms/UCTD_008_proteins.jpg"
    ],
    
    microscopeType: "Titan Krios 300kV",
    acceleratingVoltage: 300,
    magnification: 64000,
    pixelSize: 0.34,
    tiltRange: "-60° to +60°",
    
    preparationMethod: "Cryo-fixation",
    contrastMethod: "Vitreous ice",
    fiducialType: "5nm gold beads",
    
    reconstructionSoftware: "RELION",
    processingParameters: {
      binning: 1,
      reconstruction: "simultaneous iterative reconstruction",
      alignment: "patch-tracking"
    },
    
    datasetSize: "7.3 GB",
    fileTypes: [".mrc", ".rec", ".star", ".tif"],
    downloadUrls: [
      "/files/UCTD_008/high_res_series.mrc",
      "/files/UCTD_008/tomogram.rec",
      "/files/UCTD_008/subtomograms.star",
      "/files/UCTD_008/analysis.tif"
    ],
    
    authors: ["Extremophile Research Lab", "University of Chicago"],
    publicationDate: "2024-03-18",
    lab: "UChicago Department of Biochemistry",
    
    cellularFeatures: ["S-layer proteins", "membrane", "cytoplasm", "nucleoid"]
  },

  {
    tomogramId: "UCTD_009",
    title: "Magnetospirillum magneticum magnetosome chain",
    description: "Cryo-electron tomography of magnetotactic bacteria showing magnetosome organization and biomineralization",
    
    species: "Magnetospirillum magneticum",
    cellType: "Bacterial cell",
    strain: "AMB-1",
    
    thumbnailUrl: "/images/tomograms/UCTD_009_thumb.jpg",
    detailImageUrl: "/images/tomograms/UCTD_009_detail.jpg",
    videoUrl: "/videos/tomograms/UCTD_009_magnetosomes.mp4",
    imageGallery: [
      "/images/tomograms/UCTD_009_chain1.jpg",
      "/images/tomograms/UCTD_009_chain2.jpg",
      "/images/tomograms/UCTD_009_crystals.jpg"
    ],
    
    microscopeType: "FEI Polara 300kV",
    acceleratingVoltage: 300,
    magnification: 34000,
    pixelSize: 0.59,
    tiltRange: "-65° to +65°",
    
    preparationMethod: "Cryo-fixation",
    contrastMethod: "Vitreous ice",
    fiducialType: "10nm gold beads",
    
    reconstructionSoftware: "IMOD",
    processingParameters: {
      binning: 2,
      reconstruction: "weighted back-projection",
      alignment: "fiducial-based"
    },
    
    datasetSize: "4.6 GB",
    fileTypes: [".mrc", ".rec", ".mod", ".tif", ".mp4"],
    downloadUrls: [
      "/files/UCTD_009/magnetosome_series.mrc",
      "/files/UCTD_009/reconstruction.rec",
      "/files/UCTD_009/segmentation.mod",
      "/files/UCTD_009/rotation_video.mp4"
    ],
    
    authors: ["Geomicrobiology Lab", "University of Chicago"],
    publicationDate: "2023-06-30",
    lab: "UChicago Department of Geophysical Sciences",
    
    cellularFeatures: ["magnetosomes", "magnetite crystals", "magnetosome membrane", "filaments"]
  },

  {
    tomogramId: "UCTD_010",
    title: "Thermus thermophilus ribosome biogenesis",
    description: "Cryo-ET of ribosome assembly intermediates in thermophilic bacteria at physiological temperature",
    
    species: "Thermus thermophilus",
    cellType: "Bacterial cell",
    strain: "HB27",
    
    thumbnailUrl: "/images/tomograms/UCTD_010_thumb.jpg",
    detailImageUrl: "/images/tomograms/UCTD_010_detail.jpg",
    videoUrl: "/videos/tomograms/UCTD_010_ribosomes.mp4",
    imageGallery: [
      "/images/tomograms/UCTD_010_ribosomes1.jpg",
      "/images/tomograms/UCTD_010_ribosomes2.jpg",
      "/images/tomograms/UCTD_010_assembly.jpg"
    ],
    
    microscopeType: "Titan Krios 300kV",
    acceleratingVoltage: 300,
    magnification: 46000,
    pixelSize: 0.48,
    tiltRange: "-70° to +70°",
    
    preparationMethod: "Cryo-fixation",
    contrastMethod: "Vitreous ice",
    fiducialType: "15nm gold beads",
    
    reconstructionSoftware: "Warp",
    processingParameters: {
      binning: 2,
      reconstruction: "compressed sensing",
      alignment: "marker-free"
    },
    
    datasetSize: "8.4 GB",
    fileTypes: [".mrc", ".rec", ".star", ".tif", ".mp4"],
    downloadUrls: [
      "/files/UCTD_010/ribosome_series.mrc",
      "/files/UCTD_010/tomograms.rec",
      "/files/UCTD_010/particles.star",
      "/files/UCTD_010/assembly_analysis.tif",
      "/files/UCTD_010/biogenesis_movie.mp4"
    ],
    
    authors: ["Structural Biology Laboratory", "University of Chicago"],
    publicationDate: "2024-02-07",
    lab: "UChicago Department of Biochemistry and Molecular Biology",
    
    cellularFeatures: ["70S ribosomes", "30S subunit", "50S subunit", "ribosome assembly factors"]
  },

  {
    tomogramId: "UCTD_011",
    title: "Chlorobaculum tepidum photosynthetic apparatus",
    description: "Cryo-electron tomography of green sulfur bacteria revealing chlorosome organization and photosystem structure",
    
    species: "Chlorobaculum tepidum",
    cellType: "Bacterial cell",
    strain: "TLS",
    
    thumbnailUrl: "/images/tomograms/UCTD_011_thumb.jpg",
    detailImageUrl: "/images/tomograms/UCTD_011_detail.jpg",
    videoUrl: "/videos/tomograms/UCTD_011_photosynthesis.mp4",
    imageGallery: [
      "/images/tomograms/UCTD_011_chlorosomes1.jpg",
      "/images/tomograms/UCTD_011_chlorosomes2.jpg",
      "/images/tomograms/UCTD_011_membrane.jpg"
    ],
    
    microscopeType: "FEI Polara 300kV",
    acceleratingVoltage: 300,
    magnification: 31000,
    pixelSize: 0.68,
    tiltRange: "-60° to +60°",
    
    preparationMethod: "Cryo-fixation",
    contrastMethod: "Vitreous ice",
    fiducialType: "10nm gold beads",
    
    reconstructionSoftware: "SerialEM",
    processingParameters: {
      binning: 4,
      reconstruction: "weighted back-projection",
      alignment: "cross-correlation"
    },
    
    datasetSize: "3.2 GB",
    fileTypes: [".mrc", ".rec", ".mod", ".mp4"],
    downloadUrls: [
      "/files/UCTD_011/photosynthetic_series.mrc",
      "/files/UCTD_011/reconstruction.rec",
      "/files/UCTD_011/chlorosome_models.mod",
      "/files/UCTD_011/overview.mp4"
    ],
    
    authors: ["Photosynthesis Research Group", "University of Chicago"],
    publicationDate: "2023-08-16",
    lab: "UChicago Department of Chemistry",
    
    cellularFeatures: ["chlorosomes", "reaction centers", "cytoplasmic membrane", "bacteriochlorophyll"]
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
    exampleTomograms: ["UCTD_002", "UCTD_006"] 
  },
  {
    id: "archaeal",
    name: "Archaeal Features",
    description: "Unique cellular structures found in extremophile archaea",
    exampleTomograms: ["UCTD_003", "UCTD_008"]
  },
  {
    id: "motility",
    name: "Bacterial Motility",
    description: "Flagellar motors and chemotaxis machinery enabling bacterial movement",
    exampleTomograms: ["UCTD_004"]
  },
  {
    id: "pathogens",
    name: "Pathogenic Bacteria",
    description: "Structural features of medically important bacterial pathogens",
    exampleTomograms: ["UCTD_005", "UCTD_007"]
  },
  {
    id: "biomineralization",
    name: "Biomineralization",
    description: "Biological formation of magnetic and mineral structures",
    exampleTomograms: ["UCTD_009"]
  },
  {
    id: "ribosomes",
    name: "Protein Synthesis",
    description: "Ribosome structure and assembly in bacterial cells",
    exampleTomograms: ["UCTD_010"]
  },
  {
    id: "photosynthesis",
    name: "Photosynthetic Apparatus",
    description: "Chlorosomes and reaction centers in photosynthetic bacteria",
    exampleTomograms: ["UCTD_011"]
  }
]; 