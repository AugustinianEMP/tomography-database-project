import React from 'react';
import { auth, db } from './firebase/config';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Tomography Database Project</h1>
        <p>Firebase is configured and ready to use!</p>
        <p>
          Edit <code>src/App.js</code> to start building your application.
        </p>
      </header>
    </div>
  );
}

export default App; 