import React, { createContext, useContext, useState } from 'react';
import { DEMO_DATA } from '../data/demoData';

const DatasetContext = createContext(null);

export function DatasetProvider({ children }) {
  const [activeMode, setActiveMode] = useState('demo'); // 'demo' | 'uploaded'
  const [currentDataset, setCurrentDataset] = useState(DEMO_DATA);
  const [activeDossierCase, setActiveDossierCase] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Graph state & controls
  const [riskThreshold, setRiskThreshold] = useState(0); // 0-100
  const [searchAccountQuery, setSearchAccountQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [focusedNodeId, setFocusedNodeId] = useState(null);

  // Watchlist state
  const [watchlist, setWatchlist] = useState([
    { id: 'ACC-7734', type: 'Account', risk: 95, reason: 'Rapid fan-out hub in scatter-gather ring', addedAt: '2026-08-29', status: 'Freeze Pending' },
    { id: 'ACC-9081', type: 'Account', risk: 94, reason: 'Gather cash-out target on mule subnet', addedAt: '2026-08-29', status: 'Freeze Pending' },
    { id: 'DEV-CF19A3', type: 'Device', risk: 92, reason: 'Hardware fingerprint across 4 flagged accounts', addedAt: '2026-08-28', status: 'Under Surveillance' },
    { id: 'NET-10321', type: 'Subnet', risk: 96, reason: '103.21.58.0/24 historic mule proxy farm', addedAt: '2026-08-27', status: 'Blacklisted' },
    { id: 'ACC-4471', type: 'Account', risk: 65, reason: 'Velocity spike with short dwell time', addedAt: '2026-08-29', status: 'Active Monitoring' },
  ]);

  function loadDemoDataset() {
    setActiveMode('demo');
    setCurrentDataset(DEMO_DATA);
    setSelectedNode(null);
    setFocusedNodeId(null);
    setSearchAccountQuery('');
  }

  function loadUploadedDataset(model) {
    setActiveMode('uploaded');
    setCurrentDataset(model);
    setSelectedNode(null);
    setFocusedNodeId(null);
    setSearchAccountQuery('');
  }

  function openDossier(c) {
    setActiveDossierCase(c);
    setIsDossierOpen(true);
  }

  function closeDossier() {
    setIsDossierOpen(false);
  }

  function addToWatchlist(item) {
    setWatchlist(prev => {
      if (prev.some(w => w.id === item.id)) return prev;
      return [item, ...prev];
    });
  }

  function removeFromWatchlist(id) {
    setWatchlist(prev => prev.filter(w => w.id !== id));
  }

  return (
    <DatasetContext.Provider
      value={{
        activeMode,
        currentDataset,
        loadDemoDataset,
        loadUploadedDataset,
        activeDossierCase,
        isDossierOpen,
        openDossier,
        closeDossier,
        riskThreshold,
        setRiskThreshold,
        searchAccountQuery,
        setSearchAccountQuery,
        selectedNode,
        setSelectedNode,
        focusedNodeId,
        setFocusedNodeId,
        watchlist,
        addToWatchlist,
        removeFromWatchlist
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}
