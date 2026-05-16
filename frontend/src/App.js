import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Results from './pages/Results';
import History from './pages/History';
import Upload from './pages/Upload';
import Login from './pages/Login';
import AuthSuccess from './pages/AuthSuccess';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/history" element={<History />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" toastOptions={{
        className: 'glass-panel',
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
        }
      }} />
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      <Router>
        <Navbar />
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;