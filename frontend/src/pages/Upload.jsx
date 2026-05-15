import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { checkPlagiarism } from '../services/api';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import ProgressBar from '../components/ProgressBar';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiSearch, FiFileText, FiSettings, FiCheckCircle, FiTrash2, FiEdit3, FiZap } from 'react-icons/fi';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [extracting, setExtracting] = useState(false);
  
  // Settings State
  const [activeTab, setActiveTab] = useState('plagiarism'); // 'plagiarism', 'ai_detector'
  const [settings, setSettings] = useState({
    aiDetection: true,
    excludeQuotes: false,
    excludeBibliography: false,
    deepScan: false, // Keeping key for now but disabled
  });

  const handleSettingChange = (setting) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const extractTextFromPDF = async (file) => {
    setExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n';
      }
      if (fullText.trim().length === 0) {
        toast.error('No readable text found in PDF. Scanned images are not supported.');
      } else {
        setText(fullText.trim());
        toast.success('PDF text extracted successfully!');
      }
    } catch (err) {
      toast.error('Error reading PDF: ' + err.message);
    }
    setExtracting(false);
  };

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setText('');
    const ext = selectedFile.name.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      extractTextFromPDF(selectedFile);
    } else if (ext === 'docx') {
      setExtracting(true);
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        mammoth.extractRawText({ arrayBuffer })
          .then(result => {
            if (result.value.trim().length === 0) toast.error('DOCX file is empty!');
            else {
              setText(result.value.trim());
              toast.success('DOCX text extracted successfully!');
            }
            setExtracting(false);
          })
          .catch(() => {
            toast.error('Error reading DOCX!');
            setExtracting(false);
          });
      } catch (err) {
        toast.error('DOCX Error: ' + err.message);
        setExtracting(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        if (content && content.trim().length > 0) {
          setText(content);
          toast.success('File read successfully!');
        } else toast.error('File is empty!');
      };
      reader.onerror = () => toast.error('Error reading file!');
      reader.readAsText(selectedFile, 'UTF-8');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleCheck = async () => {
    if (!text.trim()) {
      toast.error('Please enter text or upload a file!');
      return;
    }
    
    // In AI Detector tab, force AI detection to true
    const shouldCheckAI = activeTab === 'ai_detector' ? true : settings.aiDetection;

    setLoading(true);
    toast.loading('Analyzing document...', { id: 'analysis' });
    try {
      const result = await checkPlagiarism(
        text, 
        null, 
        shouldCheckAI, 
        settings.excludeQuotes, 
        settings.excludeBibliography
      );
      localStorage.setItem('latestResult', JSON.stringify(result));

      const history = JSON.parse(localStorage.getItem('plagiarism_history') || '[]');
      history.unshift({
        id: Date.now(),
        text: text.substring(0, 100) + '...',
        score: result.score,
        aiScore: result.ai_score,
        date: new Date().toLocaleString(),
        sources: result.matched_sources?.length || 0,
      });
      localStorage.setItem('plagiarism_history', JSON.stringify(history.slice(0, 20)));

      toast.success(`Analysis Complete!`, { id: 'analysis' });
      navigate('/results', {
        state: {
          score: result.score,
          summary: result.summary,
          matched_sources: result.matched_sources,
          highlights: result.highlights,
          ai_score: result.ai_score
        }
      });
    } catch (error) {
      toast.error('Failed to connect to the server.', { id: 'analysis' });
    }
    setLoading(false);
  };

  const clearAll = () => {
    setText('');
    setFile(null);
  }

  const getFileBadge = () => {
    if (!file) return null;
    const ext = file.name.split('.').pop().toLowerCase();
    const colors = {
      pdf:  { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', label: 'PDF'  },
      txt:  { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', label: 'TXT'  },
      docx: { bg: 'rgba(52,211,153,0.15)',  color: '#34d399', label: 'DOCX' },
      py:   { bg: 'rgba(234,179,8,0.15)',   color: '#fbbf24', label: 'PY'   },
      js:   { bg: 'rgba(234,179,8,0.15)',   color: '#fbbf24', label: 'JS'   },
    };
    return colors[ext] || { bg: 'rgba(52,211,153,0.15)', color: '#34d399', label: ext.toUpperCase() };
  };

  const badge = getFileBadge();
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const maxWords = 10000;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}
    >
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {activeTab === 'plagiarism' ? 'Plagiarism Checker' : 'AI Content Detector'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {activeTab === 'plagiarism' 
            ? 'Ensure every word is your own with our advanced AI-powered plagiarism checker.'
            : 'Detect if your content was generated by ChatGPT, Claude, or other AI models.'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-glass)', borderRadius: '12px', padding: '6px', display: 'inline-flex', gap: '8px', border: '1px solid var(--border-color)' }}>
          <button 
            className={`btn-glow ${activeTab === 'plagiarism' ? 'active' : ''}`}
            onClick={() => setActiveTab('plagiarism')}
            style={{ 
              padding: '10px 24px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', border: 'none', cursor: 'pointer', transition: 'all 0.3s',
              background: activeTab === 'plagiarism' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'plagiarism' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <FiSearch style={{ marginRight: '8px' }} /> Plagiarism Checker
          </button>
          <button 
            className={`btn-glow ${activeTab === 'ai_detector' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai_detector')}
            style={{ 
              padding: '10px 24px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', border: 'none', cursor: 'pointer', transition: 'all 0.3s',
              background: activeTab === 'ai_detector' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'ai_detector' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <FiZap style={{ marginRight: '8px' }} /> AI Detector
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Text Input & Upload */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
          {/* Editor Header */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
             <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><FiEdit3 /> Text Editor</span>
             </div>
             {text && (
                <button onClick={clearAll} style={{ background: 'transparent', border: 'none', color: '#f43f5e', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiTrash2 /> Clear
                </button>
             )}
          </div>
          
          {/* Text Area */}
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type, paste, or upload your text here..."
              style={{
                width: '100%', height: '100%', minHeight: '350px', padding: '1.5rem', background: 'transparent', border: 'none', 
                color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.6', resize: 'none', outline: 'none'
              }}
            />
            {extracting && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>
                ⏳ Extracting text from document...
              </div>
            )}
          </div>

          {/* Editor Footer / Upload */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input
                type="file"
                accept=".txt,.pdf,.docx,.py,.js,.java,.cpp,.c,.cs,.html,.css"
                style={{ display: 'none' }}
                id="fileInput"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              <label htmlFor="fileInput" className="btn-glow" style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                background: 'var(--bg-glass)', color: 'var(--text-primary)',
                border: '1px solid var(--border-color)', borderRadius: '8px',
                fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <FiUploadCloud /> Upload Document
              </label>
              
              {badge && (
                <span style={{ background: badge.bg, color: badge.color, padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                  {file.name}
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.8rem', color: wordCount > maxWords ? '#f43f5e' : 'var(--text-secondary)', fontWeight: '600' }}>
              {wordCount} / {maxWords} words
            </div>
          </div>
        </div>

        {/* Right Column: Scan Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSettings style={{ color: 'var(--accent-primary)' }} /> 
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>Scan Settings</span>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* General Rules */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>General Rules</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>Exclude Quotes</span>
                  <div className={`toggle-switch ${settings.excludeQuotes ? 'on' : ''}`} onClick={() => handleSettingChange('excludeQuotes')}>
                    <div className="knob" />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>Exclude Bibliography</span>
                  <div className={`toggle-switch ${settings.excludeBibliography ? 'on' : ''}`} onClick={() => handleSettingChange('excludeBibliography')}>
                    <div className="knob" />
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border-color)' }} />

              {/* AI & Integrity */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>AI & Integrity</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: activeTab === 'ai_detector' ? 0.5 : 1 }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>AI Detection</span>
                  <div className={`toggle-switch ${activeTab === 'ai_detector' || settings.aiDetection ? 'on' : ''}`} onClick={() => { if(activeTab !== 'ai_detector') handleSettingChange('aiDetection'); }}>
                    <div className="knob" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <ProgressBar active={loading} />

          <motion.button
            whileHover={!loading && !extracting ? { scale: 1.02 } : {}}
            whileTap={!loading && !extracting ? { scale: 0.98 } : {}}
            className={!loading && !extracting ? "btn-glow" : ""}
            style={{
              width: '100%', padding: '1.25rem',
              background: loading || extracting ? 'var(--bg-glass)' : 'var(--accent-primary)',
              color: loading || extracting ? 'var(--text-secondary)' : '#fff',
              border: 'none', borderRadius: '12px',
              fontSize: '1.1rem', fontWeight: '800', cursor: loading || extracting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: !loading && !extracting ? '0 10px 25px -5px rgba(139, 92, 246, 0.4)' : 'none'
            }}
            onClick={handleCheck}
            disabled={loading || extracting}
          >
            {extracting ? '📄 Extracting...' : loading ? '⏳ Analyzing...' : <><FiCheckCircle /> Scan for {activeTab === 'plagiarism' ? 'Plagiarism' : 'AI Content'}</>}
          </motion.button>
          
        </div>
      </div>

    </motion.div>
  );
}

export default Upload;
