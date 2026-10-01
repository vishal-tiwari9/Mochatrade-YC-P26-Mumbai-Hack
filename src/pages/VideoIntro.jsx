import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Share2 } from 'lucide-react';
import shortframeVideo from '../components/shortframe.mp4';

export default function VideoIntro() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/login');
  };

  return (
    <div className="video-intro-page">
      {/* Background Fullscreen Video */}
      <video
        className="intro-video-bg"
        src={shortframeVideo}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Radial Gradient Scrim Overlay */}
      <div className="video-overlay-scrim" />

      {/* Hero Content Overlay */}
      <div className="intro-content-hero">
        {/* <div className="intro-badge">
          <span className="intro-pulse-dot" />
          <span>SOC Defense Intelligence v4.2</span>
        </div> */}

        {/* <h1 className="intro-title">FraudNexus</h1>

        <p className="intro-tagline">
          Real-time Graph Neural Network & Explainable Fraud Discovery Engine for high-velocity transaction clusters.
        </p> */}

        {/* <div className="intro-features-pill-row">
          <span className="intro-pill">Autonomous Threat Graphs</span>
          <span className="intro-pill">Sub-Second Ring Isolation</span>
          <span className="intro-pill">Explainable Risk Scoring</span>
        </div> */}

        <button
          id="btn-start-fraudnexus"
          className="btn-start-fraudnexus"
          onClick={handleStart}
        >
          <span>Start FraudNexus</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
