import React, { useState, useEffect } from 'react';
import './App.css';
import DatasetBrowser from './components/DatasetBrowser';
import DatasetDetail from './components/DatasetDetail';
import AddDatasetForm from './components/AddDatasetForm';
import { fetchDatasets, generatePlaceholderImageCommand } from './utils/datasetUtils';

function App() {
  // State management for datasets and navigation
  const [tomograms, setTomograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [currentView, setCurrentView] = useState('browse');

  // Load datasets from Supabase on component mount
  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const datasets = await fetchDatasets();
      setTomograms(datasets);
    } catch (error) {
      console.error('Error loading datasets:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Handle adding a new dataset (refreshes data from Supabase)
  const handleAddDataset = async (newTomogram) => {
    try {
      // The dataset is already saved to Supabase by AddDatasetForm
      // Refresh the entire dataset list to ensure consistency
      await loadDatasets();
      
      // Generate placeholder image command (for future NAS integration)
      const imageCommand = generatePlaceholderImageCommand(newTomogram.tomogram_id);
      console.log('To generate placeholder image, run:', imageCommand);
      
      // Navigate back to browse view
      setCurrentView('browse');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error in handleAddDataset:', error);
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
            loading={loading}
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