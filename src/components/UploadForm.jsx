import React, { useState } from 'react';

function UploadForm({ onCheck }) {
  const [text, setText] = useState('');
  const [reference, setReference] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const handleTextChange = (e) => {
    setText(e.target.value);
    const words = e.target.value.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(e.target.value.trim() === '' ? 0 : words.length);
  };

  const handleSubmit = () => {
    if (text.trim() === '') {
      alert('Please enter some text!');
      return;
    }
    onCheck(text, reference);
  };

  return (
    <div>
      <div style={styles.fieldLabel}>
        Your Text
        <span style={styles.reqBadge}>Required</span>
      </div>
      <textarea
        style={styles.textarea}
        rows={5}
        placeholder="Paste your essay, assignment, or article here..."
        value={text}
        onChange={handleTextChange}
      />
      <div style={styles.wcRow}>
        <span style={styles.wc}>{wordCount} words</span>
        <span style={styles.wc}>Max 5000 words</span>
      </div>
      <div style={styles.sep}></div>
      <div style={styles.fieldLabel}>
        Reference Text
        <span style={styles.optBadge}>Optional</span>
      </div>
      <textarea
        style={styles.textarea}
        rows={3}
        placeholder="Leave empty to auto-search via Tavily AI..."
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />
      <div style={styles.btnRow}>
        <button style={styles.btnMain} onClick={handleSubmit}>
          🔍 Check Plagiarism
        </button>
        <button style={styles.btnSec} onClick={() => { setText(''); setReference(''); setWordCount(0); }}>
          Clear
        </button>
      </div>
    </div>
  );
}

const styles = {
  fieldLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
    marginBottom: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reqBadge: {
    background: 'rgba(59,130,246,0.15)',
    color: '#93c5fd',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '9px',
    textTransform: 'none',
  },
  optBadge: {
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.3)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '9px',
    textTransform: 'none',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '12px',
    fontFamily: 'Inter, sans-serif',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.04)',
    color: 'white',
    outline: 'none',
    lineHeight: '1.65',
    resize: 'none',
  },
  wcRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
    marginBottom: '10px',
  },
  wc: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.2)',
    fontFamily: 'monospace',
  },
  sep: {
    height: '0.5px',
    background: 'rgba(255,255,255,0.05)',
    marginBottom: '10px',
  },
  btnRow: { display: 'flex', gap: '6px', marginTop: '10px' },
  btnMain: {
    flex: 1,
    padding: '10px',
    background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Syne, sans-serif',
  },
  btnSec: {
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.5)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '11px',
    cursor: 'pointer',
  },
};

export default UploadForm;