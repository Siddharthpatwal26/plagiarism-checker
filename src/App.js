import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Results from './pages/Results';
import History from './pages/History';
import Upload from './pages/Upload';
import './App.css';

function App() {
  const [dark, setDark] = useState(true);

  return (
    <div className={dark ? 'theme-dark' : 'theme-light'}>
      <Router>
        <Navbar dark={dark} setDark={setDark} />
        <Routes>
          <Route path="/" element={<Home dark={dark} />} />
          <Route path="/results" element={<Results dark={dark} />} />
          <Route path="/history" element={<History />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;