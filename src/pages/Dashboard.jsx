import React, { useState } from 'react';
import Sidebar, { CORE_FEATURES } from '../components/Sidebar';
import Workspace from './Workspace';
import { Layers, ArrowLeft } from 'lucide-react';

export default function Dashboard() {
  const [activeFeatureId, setActiveFeatureId] = useState(1);

  const activeFeature = CORE_FEATURES.find(f => f.id === activeFeatureId) || CORE_FEATURES[0];

  return (
    <div className="dashboard-container">
      {/* Persistent Left Sidebar */}
      <Sidebar 
        activeFeatureId={activeFeatureId} 
        onSelectFeature={setActiveFeatureId} 
      />

      {/* Main Content Area */}
      <main className="dashboard-main-content">
        {activeFeatureId === 1 || activeFeatureId === 2 ? (
          /* Both Feature 1 & 2 render the existing full investigation workspace */
          <Workspace />
        ) : (
          /* Features 3–7 render a clean, themed placeholder state */
          <div className="feature-placeholder-view">
            <div className="placeholder-header">
              <div className="placeholder-title-group">
                <span className="placeholder-badge">MODULE 0{activeFeature.id}</span>
                <h2 className="placeholder-title">{activeFeature.name}</h2>
              </div>
              <button 
                className="btn-placeholder-back"
                onClick={() => setActiveFeatureId(1)}
              >
                Return to Graph & Risk Score
              </button>
            </div>

            <div className="placeholder-body">
              <div className="placeholder-icon-box">
                <Layers size={32} />
              </div>
              <h3 className="placeholder-heading">{activeFeature.name}</h3>
              <p className="placeholder-desc">
                This module is scheduled for future calibration. Core analytics logic, data pipelines, and investigation views can be wired directly into this section.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
