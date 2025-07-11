import React, { useState } from 'react';
import './App.css';
import DatasetBrowser from './components/DatasetBrowser';
import DatasetDetail from './components/DatasetDetail';
import AddDatasetForm from './components/AddDatasetForm';
import { mockTomograms } from './data/mockTomograms';
import { generatePlaceholderImageCommand } from './utils/datasetUtils';

function App() {
  // State management for datasets and navigation
  const [tomograms, setTomograms] = useState(mockTomograms);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [currentView, setCurrentView] = useState('browse'); // 'browse', 'add', 'detail'

  // Handle dataset selection for detail view
  const handleDatasetClick = (tomogram) => {
    setSelectedDataset(tomogram);
    setCurrentView('detail');
  };

  // Handle navigation back to browse view
  const handleBackClick = () => {
    setSelectedDataset(null);
    setCurrentView('browse');
  };

  // Handle navigation to add dataset form
  const handleAddDatasetClick = () => {
    setCurrentView('add');
  };

  // Handle adding a new dataset
  const handleAddDataset = async (newTomogram) => {
    try {
      // Add the new tomogram to the list
      setTomograms(prevTomograms => [...prevTomograms, newTomogram]);
      
      // Generate placeholder image command (in real app, this would be handled by backend)
      const imageCommand = generatePlaceholderImageCommand(newTomogram.tomogramId);
      console.log('To generate placeholder image, run:', imageCommand);
      
      // Navigate back to browse view
      setCurrentView('browse');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding dataset:', error);
      return Promise.reject(error);
    }
  };

  // Handle canceling add dataset form
  const handleCancelAdd = () => {
    setCurrentView('browse');
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'add':
        return (
          <AddDatasetForm
            tomograms={tomograms}
            onAddDataset={handleAddDataset}
            onCancel={handleCancelAdd}
          />
        );
      
      case 'detail':
        return (
          <DatasetDetail 
            tomogram={selectedDataset} 
            onBackClick={handleBackClick}
          />
        );
      
      case 'browse':
      default:
        return (
          <DatasetBrowser 
            tomograms={tomograms} 
            onDatasetClick={handleDatasetClick}
            onAddDatasetClick={handleAddDatasetClick}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

export default App; 