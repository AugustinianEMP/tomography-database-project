import React, { useState } from 'react';
import './App.css';
import DatasetBrowser from './components/DatasetBrowser';
import DatasetDetail from './components/DatasetDetail';
import { mockTomograms } from './data/mockTomograms';

function App() {
  const [selectedDataset, setSelectedDataset] = useState(null);

  const handleDatasetClick = (tomogram) => {
    setSelectedDataset(tomogram);
  };

  const handleBackClick = () => {
    setSelectedDataset(null);
  };

  return (
    <div className="App">
      {selectedDataset ? (
        <DatasetDetail 
          tomogram={selectedDataset} 
          onBackClick={handleBackClick}
        />
      ) : (
        <DatasetBrowser 
          tomograms={mockTomograms} 
          onDatasetClick={handleDatasetClick}
        />
      )}
    </div>
  );
}

export default App; 