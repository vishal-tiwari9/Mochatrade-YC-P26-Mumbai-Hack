import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VideoIntro from './pages/VideoIntro';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './flow.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VideoIntro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
