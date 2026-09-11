import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { DatasetProvider } from './context/DatasetContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DatasetProvider>
        <App />
      </DatasetProvider>
    </BrowserRouter>
  </React.StrictMode>
);
