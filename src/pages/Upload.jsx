import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkPlagiarism } from '../services/api';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import ProgressBar from '../components/ProgressBar';
// ✅ Fixed worker setup
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

  // ✅ PDF se text extract karne ka function
  const extractTextFromPDF = async (file) => {
    setExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      if (fullText.trim().length === 0) {
        alert('PDF mein koi readable text nahi mila! (Scanned image PDF nahi chalega)');
        setExtracting(false);
        return;
      }

      setText(fullText.trim());
    } catch (err) {
      alert('PDF read karne mein error aaya: ' + err.message);
    }
    setExtracting(false);
  };

  // ✅ FIX: async keyword add kiya handleFile mein
  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setText('');

    const ext = selectedFile.name.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      // ✅ PDF handling
      extractTextFromPDF(selectedFile);

    } else if (ext === 'docx') {
      // ✅ DOCX handling — await ab kaam karega
      setExtracting(true);
      try {
        const arrayBuffer = await selectedFile.arrayBuffer(); // ✅ ab error nahi aayega
        mammoth.extractRawText({ arrayBuffer })
          .then(result => {
            if (result.value.trim().length === 0) {
              alert('DOCX file empty hai!');
            } else {
              setText(result.value.trim());
            }
            setExtracting(false);
          })
          .catch(() => {
            alert('DOCX read karne mein error aaya!');
            setExtracting(false);
          });
      } catch (err) {
        alert('DOCX arrayBuffer error: ' + err.message);
        setExtracting(false);
      }

    } else {
      // ✅ Normal text files (.txt, .js, .py etc.)
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        if (content && content.trim().length > 0) {
          setText(content);
        } else {
          alert('File is empty!');
        }
      };
      reader.onerror = () => alert('Error reading file!');
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
      alert('Please upload a file first!');
      return;
    }
    setLoading(true);
    try {
      const result = await checkPlagiarism(text, null);
      localStorage.setItem('latestResult', JSON.stringify(result));

      const history = JSON.parse(localStorage.getItem('plagiarism_history') || '[]');
      history.unshift({
        id: Date.now(),
        text: text.substring(0, 100) + '...',
        score: result.score,
        date: new Date().toLocaleString(),
        sources: result.matched_sources?.length || 0,
      });
      localStorage.setItem('plagiarism_history', JSON.stringify(history.slice(0, 20)));

      navigate('/results', {
        state: {
          score: result.score,
          summary: result.summary,
          matched_sources: result.matched_sources,
          highlights: result.highlights,
        }
      });
    } catch (error) {
      alert('Server se connect nahi ho pa raha!');
    }
    setLoading(false);
  };

  const getFileIcon = () => {
    if (!file) return '📁';
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📕';
    return '✅';
  };

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

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>File Upload</h2>
        <p style={styles.sub}>Upload .txt, .pdf, .docx, .py, .js files to check for plagiarism</p>
      </div>

      {/* UPLOAD AREA */}
      <div
        style={{
          ...styles.dropZone,
          borderColor: dragOver ? '#3b82f6' : file ? '#34d399' : 'rgba(255,255,255,0.1)',
          background: dragOver ? 'rgba(59,130,246,0.05)' : file ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.02)',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div style={styles.dropIcon}>{getFileIcon()}</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={styles.dropTitle}>
            {file ? file.name : 'Drag & Drop your file here'}
          </div>
          {badge && (
            <span style={{
              background: badge.bg, color: badge.color,
              padding: '2px 8px', borderRadius: '4px',
              fontSize: '11px', fontWeight: '700'
            }}>
              {badge.label}
            </span>
          )}
        </div>

        <div style={styles.dropSub}>
          {extracting
            ? '⏳ File se text extract ho raha hai...'
            : file
            ? `File loaded — ${text.split(/\s+/).filter(w => w.length > 0).length} words`
            : 'Supports .txt, .pdf, .docx, .py, .js, .java files'}
        </div>

        <input
          type="file"
          accept=".txt,.pdf,.docx,.py,.js,.java,.cpp,.c,.cs,.html,.css"
          style={{ display: 'none' }}
          id="fileInput"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <label htmlFor="fileInput" style={styles.browseBtn}>
          Browse File
        </label>
      </div>

      {/* TEXT PREVIEW */}
      {text && (
        <div style={styles.previewCard}>
          <div style={styles.previewHead}>
            <span style={styles.previewTitle}>📄 Extracted Text Preview</span>
            <span style={styles.previewBadge}>{text.split(' ').length} words</span>
          </div>
          <div style={styles.previewText}>
            {text.substring(0, 500)}{text.length > 500 ? '...' : ''}
          </div>
        </div>
      )}
      {/* Progress Bar */}
<ProgressBar active={loading} />

      {/* CHECK BUTTON */}
      <button
        style={loading || extracting ? styles.btnLoading : styles.btn}
        onClick={handleCheck}
        // disabled={loading || !file || extracting}
      >
        {extracting ? '📄 Extracting...' : loading ? '⏳ Analyzing...' : '🔍 Check Plagiarism'}
      </button>
    </div>
  );
}

const styles = {
  page: {
    background: '#060b18',
    minHeight: 'calc(100vh - 54px)',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: { marginBottom: '20px' },
  title: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '20px', fontWeight: '800',
    color: 'white', marginBottom: '4px',
  },
  sub: { fontSize: '12px', color: 'rgba(255,255,255,0.3)' },
  dropZone: {
    border: '1.5px dashed', borderRadius: '16px',
    padding: '48px 20px', textAlign: 'center',
    transition: 'all 0.2s', marginBottom: '16px', cursor: 'pointer',
  },
  dropIcon: { fontSize: '48px', marginBottom: '16px' },
  dropTitle: {
    fontFamily: 'Syne, sans-serif', fontSize: '16px',
    fontWeight: '700', color: 'white', marginBottom: '8px',
  },
  dropSub: {
    fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px',
  },
  browseBtn: {
    display: 'inline-block', padding: '9px 20px',
    background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
    border: '0.5px solid rgba(59,130,246,0.3)', borderRadius: '8px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
  previewCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: '12px', overflow: 'hidden', marginBottom: '16px',
  },
  previewHead: {
    padding: '12px 16px',
    borderBottom: '0.5px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  previewTitle: { fontSize: '13px', fontWeight: '600', color: 'white' },
  previewBadge: {
    background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
    padding: '3px 8px', borderRadius: '5px',
    fontSize: '11px', fontWeight: '600',
  },
  previewText: {
    padding: '14px 16px', fontSize: '12px',
    color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', fontFamily: 'monospace',
  },
  btn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '14px', fontWeight: '700', cursor: 'pointer',
    fontFamily: 'Syne, sans-serif',
  },
  btnLoading: {
    width: '100%', padding: '14px',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '10px',
    fontSize: '14px', fontWeight: '700', cursor: 'not-allowed',
    fontFamily: 'Syne, sans-serif',
  },
};

export default Upload;
