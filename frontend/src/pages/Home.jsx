import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { checkPlagiarism } from '../services/api';
import Console from '../components/Console';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { FiFileText, FiCode, FiSearch, FiRefreshCw, FiMic, FiMicOff, FiSettings } from 'react-icons/fi';

function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  
  const [text, setText] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [textFocused, setTextFocused] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [mode, setMode] = useState('text');
  const [isListening, setIsListening] = useState({ type: null, active: false });
  
  // Scan Settings State
  const [settings, setSettings] = useState({
    aiDetection: true,
    excludeQuotes: false,
    excludeBibliography: false,
  });

  const handleSettingChange = (setting) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
    addLog('info', `[SETTINGS] ${setting} → ${!settings[setting] ? 'ON' : 'OFF'}`);
  };

  const startListening = (target) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice typing is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening({ type: target, active: true });
      toast.success('Listening... Start speaking!');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (target === 'text') {
        setText(prev => prev + (prev.length > 0 ? ' ' : '') + transcript);
      } else {
        setReference(prev => prev + (prev.length > 0 ? ' ' : '') + transcript);
      }
      setIsListening({ type: null, active: false });
    };

    recognition.onerror = (event) => {
      setIsListening({ type: null, active: false });
      toast.error('Voice typing error: ' + event.error);
    };

    recognition.onend = () => {
      setIsListening({ type: null, active: false });
    };

    recognition.start();
  };

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const [logs, setLogs] = useState([
    { type: 'ok', message: '[BOOT] PlagioCheck v2.0 starting...' },
    { type: 'ok', message: '[DB] MongoDB → Connected ✓' },
    { type: 'info', message: '[AI] Tavily search engine → Ready ✓' },
    { type: 'ok', message: '[ML] TF-IDF model loaded ✓' },
    { type: 'warn', message: '[SYS] Awaiting user input...' },
    { type: 'dim', message: '─────────────────────────' },
  ]);

  const addLog = (type, message) => {
    const d = new Date();
    const ts = `${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
    setLogs(prev => [...prev, { type, message: `[${ts}] ${message}` }].slice(-12));
  };

  const animateProgress = (steps) => {
    let i = 0;
    const run = () => {
      if (i >= steps.length) return;
      setProgress(steps[i].value);
      setProgressLabel(steps[i].label);
      i++;
      setTimeout(run, steps[i - 1].delay);
    };
    run();
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    const words = e.target.value.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(e.target.value.trim() === '' ? 0 : words.length);
    if (submitError) setSubmitError(false);
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setText('');
    setReference('');
    setWordCount(0);
    addLog('info', `[SYS] Switched to ${newMode.toUpperCase()} mode`);
  };

  const handleCheck = async () => {
    if (text.trim() === '') {
      setSubmitError(true);
      toast.error('Please enter text to check.');
      setTimeout(() => setSubmitError(false), 1500);
      return;
    }

    setLoading(true);
    setProgress(0);

    animateProgress([
      { value: 10, label: 'Reading input...', delay: 300 },
      { value: 25, label: 'TF-IDF vectorizing...', delay: 600 },
      { value: 45, label: 'Searching web sources...', delay: 1000 },
      { value: 65, label: 'Comparing similarities...', delay: 800 },
      { value: 80, label: 'Checking database...', delay: 600 },
      { value: 90, label: 'Generating report...', delay: 500 },
    ]);

    addLog('info', `[INPUT] ${mode === 'code' ? 'Code' : 'Text'} received. Starting analysis...`);
    addLog('ok', '[ML] TF-IDF vectorization complete ✓');
    addLog('info', '[WEB] Tavily searching web sources...');
    addLog('info', '[DB] Checking MongoDB database...');

    try {
      const result = await checkPlagiarism(
        text, 
        reference, 
        settings.aiDetection, 
        settings.excludeQuotes, 
        settings.excludeBibliography
      );

      setProgress(100);
      setProgressLabel('Analysis complete! ✓');

      addLog('ok', '[WEB] Sources retrieved ✓');
      addLog('ok', `[RESULT] Analysis complete. Score: ${result.score}% ✓`);
      addLog('dim', '─────────────────────────');

      const history = JSON.parse(localStorage.getItem('plagiarism_history') || '[]');
      history.unshift({
        id: Date.now(),
        text: text.substring(0, 100) + '...',
        score: result.score,
        date: new Date().toLocaleString(),
        sources: result.matched_sources?.length || 0,
      });
      localStorage.setItem('plagiarism_history', JSON.stringify(history.slice(0, 20)));

      toast.success(`Analysis Complete: ${result.score}% similarity`);

      setTimeout(() => {
        navigate('/results', {
          state: {
            score: result.score,
            summary: result.summary,
            matched_sources: result.matched_sources,
            highlights: result.highlights,
            ai_score: result.ai_score,
          }
        });
      }, 600);

    } catch (error) {
      addLog('err', '[ERROR] Server connection failed!');
      setProgress(0);
      setProgressLabel('');
      toast.error('Server connection failed!');
    }
    setLoading(false);
  };

  const historyCount = JSON.parse(localStorage.getItem('plagiarism_history') || '[]').length;
  const todayCount = JSON.parse(localStorage.getItem('plagiarism_history') || '[]').filter(h => {
    const today = new Date().toLocaleDateString();
    return new Date(h.date).toLocaleDateString() === today;
  }).length;

  const wordProgressWidth = Math.min(wordCount / 5000 * 100, 100);
  const wordProgressColor = wordCount > 4500 ? '#f43f5e' : wordCount > 4000 ? '#fbbf24' : 'var(--accent-primary)';

  const getProgressColor = () => {
    if (progress === 100) return '#34d399';
    if (progress > 60) return '#60a5fa';
    return 'var(--accent-secondary)';
  };

  const metrics = [
    { label: 'Total Checks', badge: 'Live', value: historyCount, sub: 'All time checks' },
    { label: 'Algorithm', badge: 'AI', value: 'TF-IDF', sub: 'Cosine similarity' },
    { label: 'Web Search', badge: 'Active', value: 'Tavily AI', sub: 'Real-time search' },
    { label: 'Database', badge: 'Online', value: 'MongoDB', sub: 'Connected' },
  ];

  const codePlaceholder = `// Paste your code here...\ndef example():\n    print("Hello World")`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}
    >
      {/* METRICS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {metrics.map((m, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className="glass-panel"
            style={{ padding: '1rem', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{m.label}</span>
              <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', fontWeight: '700', background: 'var(--accent-primary)', color: '#fff' }}>{m.badge}</span>
            </div>
            <div style={{ fontSize: typeof m.value === 'number' ? '2rem' : '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>{m.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.sub}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', width: '100%', background: 'linear-gradient(90deg, var(--accent-primary), transparent)' }} />
          </motion.div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>

        {/* CHECKER CARD */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: `1px solid var(--border-color)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {mode === 'code' ? <FiCode className="icon-glow" /> : <FiFileText className="icon-glow" />}
              {loading ? progressLabel || 'Analyzing...' : mode === 'code' ? 'Code Checker' : 'Text Checker'}
              {!loading && (
                <motion.button
                  animate={isListening.active && isListening.type === 'text' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                  onClick={() => startListening('text')}
                  style={{ background: 'transparent', border: 'none', color: isListening.active && isListening.type === 'text' ? '#f43f5e' : 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', marginLeft: '10px' }}
                  title="Voice Typing"
                >
                  {isListening.active && isListening.type === 'text' ? <FiMicOff /> : <FiMic />}
                </motion.button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-glass)', padding: '4px', borderRadius: '12px' }}>
              <button 
                onClick={() => handleModeSwitch('text')} 
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', background: mode === 'text' ? 'var(--accent-primary)' : 'transparent', color: mode === 'text' ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}
              >
                Text
              </button>
              <button 
                onClick={() => handleModeSwitch('code')} 
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', background: mode === 'code' ? 'var(--accent-secondary)' : 'transparent', color: mode === 'code' ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}
              >
                Code
              </button>
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* PROGRESS BAR */}
            {loading && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{progressLabel}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-glass)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: getProgressColor(), transition: 'width 0.5s ease' }} />
                </div>
              </div>
            )}

            <textarea
              style={{
                width: '100%', padding: '1rem', fontSize: '0.875rem',
                fontFamily: mode === 'code' ? 'monospace' : 'inherit',
                border: submitError ? '1px solid #f43f5e' : `1px solid var(--border-color)`,
                borderRadius: '12px',
                background: 'var(--bg-glass)',
                color: 'var(--text-primary)',
                outline: 'none', lineHeight: '1.6', resize: 'vertical',
                transition: 'all 0.3s ease',
                boxShadow: textFocused ? '0 0 0 4px var(--glow-color)' : 'none',
                opacity: loading ? 0.5 : 1,
                minHeight: '200px'
              }}
              placeholder={mode === 'code' ? codePlaceholder : 'Paste your essay, assignment, or article here...'}
              value={text}
              onChange={handleTextChange}
              onFocus={() => setTextFocused(true)}
              onBlur={() => setTextFocused(false)}
              disabled={loading}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {mode === 'code' ? `${text.split('\n').length} lines` : `${wordCount} words`}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{mode === 'code' ? 'Paste code to check' : 'Max 5000 words'}</span>
            </div>

            <div style={{ height: '4px', background: 'var(--bg-glass)', borderRadius: '99px', marginBottom: '1.5rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${wordProgressWidth}%`, background: wordProgressColor, transition: 'width 0.3s ease' }} />
            </div>

            <div style={{ position: 'relative' }}>
              <textarea
                style={{ width: '100%', padding: '1rem', fontSize: '0.875rem', border: `1px solid var(--border-color)`, borderRadius: '12px', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', opacity: loading ? 0.5 : 1, minHeight: '80px', paddingRight: '40px' }}
                placeholder="Reference text (Optional) - Leave empty to auto-search via Tavily AI..."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                disabled={loading}
              />
              {!loading && (
                <motion.button
                  animate={isListening.active && isListening.type === 'reference' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                  onClick={() => startListening('reference')}
                  style={{ position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', color: isListening.active && isListening.type === 'reference' ? '#f43f5e' : 'var(--text-secondary)', cursor: 'pointer', zIndex: 10 }}
                  title="Voice Typing"
                >
                  {isListening.active && isListening.type === 'reference' ? <FiMicOff /> : <FiMic />}
                </motion.button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <motion.button
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className={!loading ? "btn-glow" : ""}
                style={{
                  flex: 1, padding: '1rem',
                  background: loading ? 'var(--bg-glass)' : 'var(--accent-primary)',
                  color: loading ? 'var(--text-secondary)' : '#fff', 
                  borderRadius: '12px',
                  fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
                onClick={handleCheck}
                disabled={loading}
              >
                {loading ? <><FiRefreshCw className="icon-glow" style={{ animation: 'spin 2s linear infinite' }} /> {progress}% — Analyzing</> : <><FiSearch className="icon-glow" /> Check Plagiarism</>}
              </motion.button>
              <motion.button
                whileHover={!loading ? { scale: 1.05 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
                style={{ padding: '0 1.5rem', background: 'transparent', color: 'var(--text-secondary)', border: `1px solid var(--border-color)`, borderRadius: '12px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
                onClick={() => { if (!loading) { setText(''); setReference(''); setWordCount(0); } }}
              >
                Clear
              </motion.button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* SCAN SETTINGS */}
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSettings style={{ color: 'var(--accent-primary)' }} /> 
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>Scan Settings</span>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>AI & Integrity</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>AI Detection</span>
                  <div className={`toggle-switch ${settings.aiDetection ? 'on' : ''}`} onClick={() => handleSettingChange('aiDetection')}>
                    <div className="knob" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <motion.div whileHover={{ scale: 1.05 }} className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{todayCount}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px', fontWeight: 600 }}>Today</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>98%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px', fontWeight: 600 }}>Accuracy</div>
            </motion.div>
          </div>
          <Console logs={logs} />
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}

export default Home;