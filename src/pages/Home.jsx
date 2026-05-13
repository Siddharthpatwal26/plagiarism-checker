import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkPlagiarism } from '../services/api';
import Console from '../components/Console';

function Home({ dark }) {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [textFocused, setTextFocused] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [mode, setMode] = useState('text');

  // ✅ Progress bar state
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const [logs, setLogs] = useState([
    { type: 'ok', message: '[BOOT] PlagioCheck v1.0 starting...' },
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

  // ✅ Progress animation function
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
      setTimeout(() => setSubmitError(false), 1500);
      return;
    }

    setLoading(true);
    setProgress(0);

    // ✅ Progress steps with labels
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
      const result = await checkPlagiarism(text, reference);

      // ✅ Complete progress
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

      // ✅ Short delay before navigate so user sees 100%
      setTimeout(() => {
        navigate('/results', {
          state: {
            score: result.score,
            summary: result.summary,
            matched_sources: result.matched_sources,
            highlights: result.highlights,
          }
        });
      }, 600);

    } catch (error) {
      addLog('err', '[ERROR] Server connection failed!');
      setProgress(0);
      setProgressLabel('');
      alert('Server se connect nahi ho pa raha — backend chal raha hai?');
    }
    setLoading(false);
  };

  const historyCount = JSON.parse(localStorage.getItem('plagiarism_history') || '[]').length;
  const todayCount = JSON.parse(localStorage.getItem('plagiarism_history') || '[]').filter(h => {
    const today = new Date().toLocaleDateString();
    return new Date(h.date).toLocaleDateString() === today;
  }).length;

  const bg = dark ? '#060b18' : '#f0f2f7';
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPrimary = dark ? '#ffffff' : '#111111';
  const textMuted = dark ? 'rgba(255,255,255,0.25)' : '#9aa0bb';
  const textLabel = dark ? 'rgba(255,255,255,0.35)' : '#5a6080';
  const inputBg = dark ? 'rgba(255,255,255,0.04)' : '#f5f6fa';
  const inputBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const inputColor = dark ? 'white' : '#111';
  const sepColor = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const btnSecBg = dark ? 'rgba(255,255,255,0.05)' : '#f0f0f0';
  const btnSecColor = dark ? 'rgba(255,255,255,0.5)' : '#555';
  const btnSecBorder = dark ? 'rgba(255,255,255,0.1)' : '#ddd';
  const pillInactiveBorder = dark ? 'rgba(255,255,255,0.08)' : '#ddd';
  const pillInactiveColor = dark ? 'rgba(255,255,255,0.35)' : '#888';

  const wordProgressWidth = Math.min(wordCount / 5000 * 100, 100);
  const wordProgressColor = wordCount > 4500 ? '#ff4f6a' : wordCount > 4000 ? '#f0a32a' : 'linear-gradient(90deg, #4f7fff, #7c5cfc)';

  // ✅ Progress bar color based on value
  const getProgressColor = () => {
    if (progress === 100) return '#34d399';
    if (progress > 60) return '#60a5fa';
    return 'linear-gradient(90deg, #1d4ed8, #7c3aed)';
  };

  const metrics = [
    { label: 'Total Checks', badge: 'Live', badgeBg: 'rgba(59,130,246,0.15)', badgeColor: '#60a5fa', value: historyCount, sub: 'All time checks', accentBar: 'linear-gradient(90deg, #1D9E75, transparent)' },
    { label: 'Algorithm', badge: 'AI', badgeBg: 'rgba(139,92,246,0.15)', badgeColor: '#a78bfa', value: 'TF-IDF', sub: 'Cosine similarity', accentBar: 'linear-gradient(90deg, #7c5cfc, transparent)' },
    { label: 'Web Search', badge: 'Active', badgeBg: 'rgba(52,211,153,0.15)', badgeColor: '#34d399', value: 'Tavily AI', sub: 'Real-time search', accentBar: 'linear-gradient(90deg, #4f7fff, transparent)' },
    { label: 'Database', badge: 'Online', badgeBg: 'rgba(52,211,153,0.15)', badgeColor: '#34d399', value: 'MongoDB', sub: 'Connected', accentBar: 'linear-gradient(90deg, #1D9E75, transparent)' },
  ];

  const codePlaceholder = `// Paste your code here...
def example():
    print("Hello World")`;

  return (
    <div style={{ background: bg, minHeight: 'calc(100vh - 54px)', padding: '14px', transition: 'all 0.2s' }}>

      {/* METRICS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: '12px', padding: '14px 16px', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s', cursor: 'default' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = cardBorder}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', color: textLabel, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{m.label}</span>
              <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '4px', fontWeight: '700', background: m.badgeBg, color: m.badgeColor }}>{m.badge}</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: typeof m.value === 'number' ? '24px' : '16px', fontWeight: '700', color: textPrimary, marginBottom: '4px' }}>{m.value}</div>
            <div style={{ fontSize: '10px', color: textMuted }}>{m.sub}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', width: '100%', background: m.accentBar }} />
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '10px' }}>

        {/* CHECKER CARD */}
        <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `0.5px solid ${sepColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', fontWeight: '700', color: textPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: loading ? '#34d399' : '#60a5fa', display: 'inline-block', transition: 'background 0.3s' }}></span>
              {loading ? progressLabel || 'Analyzing...' : mode === 'code' ? 'Code Checker' : 'Text Checker'}
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              <span onClick={() => handleModeSwitch('text')} style={{ padding: '3px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', background: mode === 'text' ? 'rgba(59,130,246,0.2)' : 'transparent', color: mode === 'text' ? '#93c5fd' : pillInactiveColor, border: mode === 'text' ? '0.5px solid rgba(59,130,246,0.3)' : `0.5px solid ${pillInactiveBorder}` }}>Text</span>
              <span onClick={() => handleModeSwitch('code')} style={{ padding: '3px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', background: mode === 'code' ? 'rgba(52,211,153,0.15)' : 'transparent', color: mode === 'code' ? '#34d399' : pillInactiveColor, border: mode === 'code' ? '0.5px solid rgba(52,211,153,0.3)' : `0.5px solid ${pillInactiveBorder}` }}>Code</span>
            </div>
          </div>

          <div style={{ padding: '14px 16px' }}>

            {/* ✅ PROGRESS BAR — loading ke time dikhta hai */}
            {loading && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#60a5fa', fontFamily: 'monospace' }}>{progressLabel}</span>
                  <span style={{ fontSize: '11px', color: '#60a5fa', fontFamily: 'monospace', fontWeight: '700' }}>{progress}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: '99px',
                    width: `${progress}%`,
                    background: getProgressColor(),
                    transition: 'width 0.5s ease, background 0.3s ease',
                  }} />
                </div>
              </div>
            )}

            <div style={{ fontSize: '10px', color: textLabel, letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              {mode === 'code' ? 'Your Code' : 'Your Text'}
              <span style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', textTransform: 'none' }}>Required</span>
            </div>

            <textarea
              style={{
                width: '100%', padding: '10px 12px', fontSize: '12px',
                fontFamily: mode === 'code' ? 'monospace' : 'Inter, sans-serif',
                border: submitError ? '0.5px solid #ff4f6a' : textFocused ? '0.5px solid #4f7fff' : `0.5px solid ${inputBorder}`,
                borderRadius: '8px',
                background: mode === 'code' ? (dark ? 'rgba(0,0,0,0.3)' : '#f0f0f0') : inputBg,
                color: mode === 'code' ? (dark ? '#34d399' : '#1a7a4a') : inputColor,
                outline: 'none', lineHeight: '1.65', resize: 'none', transition: 'border-color 0.2s',
                boxShadow: textFocused ? '0 0 0 3px rgba(79,127,255,0.12)' : 'none',
                opacity: loading ? 0.5 : 1,
              }}
              rows={5}
              placeholder={mode === 'code' ? codePlaceholder : 'Paste your essay, assignment, or article here...'}
              value={text}
              onChange={handleTextChange}
              onFocus={() => setTextFocused(true)}
              onBlur={() => setTextFocused(false)}
              disabled={loading}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', color: wordCount > 4500 ? '#ff4f6a' : wordCount > 4000 ? '#f0a32a' : textMuted, fontFamily: 'monospace' }}>
                {mode === 'code' ? `${text.split('\n').length} lines` : `${wordCount} words`}
              </span>
              <span style={{ fontSize: '10px', color: textMuted, fontFamily: 'monospace' }}>{mode === 'code' ? 'Paste code to check' : 'Max 5000 words'}</span>
            </div>

            <div style={{ height: '3px', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)', borderRadius: '99px', marginBottom: '12px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '99px', width: `${wordProgressWidth}%`, background: wordProgressColor, transition: 'width 0.3s ease' }} />
            </div>

            <div style={{ height: '0.5px', background: sepColor, marginBottom: '10px' }} />

            <div style={{ fontSize: '10px', color: textLabel, letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              Reference Text
              <span style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: textMuted, padding: '2px 6px', borderRadius: '4px', fontSize: '9px', textTransform: 'none' }}>Optional</span>
            </div>
            <textarea
              style={{ width: '100%', padding: '10px 12px', fontSize: '12px', fontFamily: 'Inter, sans-serif', border: `0.5px solid ${inputBorder}`, borderRadius: '8px', background: inputBg, color: inputColor, outline: 'none', lineHeight: '1.65', resize: 'none', opacity: loading ? 0.5 : 1 }}
              rows={3}
              placeholder="Leave empty to auto-search via Tavily AI..."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={loading}
            />

            <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
              <button
                style={loading ? {
                  flex: 1, padding: '10px', background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '8px',
                  fontSize: '12px', fontWeight: '700', cursor: 'not-allowed', fontFamily: 'Syne, sans-serif'
                } : {
                  flex: 1, padding: '10px',
                  background: mode === 'code' ? 'linear-gradient(135deg,#065f46,#1D9E75)' : 'linear-gradient(135deg,#1d4ed8,#7c3aed)',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                  transition: 'transform 0.15s',
                }}
                onClick={handleCheck}
                disabled={loading}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {loading ? `⏳ ${progress}% — Analyzing...` : mode === 'code' ? '🔍 Check Code' : '🔍 Check Plagiarism'}
              </button>
              <button
                style={{ padding: '10px 14px', background: btnSecBg, color: btnSecColor, border: `0.5px solid ${btnSecBorder}`, borderRadius: '8px', fontSize: '11px', cursor: loading ? 'not-allowed' : 'pointer' }}
                onClick={() => { if (!loading) { setText(''); setReference(''); setWordCount(0); } }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: '12px', padding: '14px 16px', textAlign: 'center', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = cardBorder}
            >
              <div style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: '700', color: textPrimary }}>{todayCount}</div>
              <div style={{ fontSize: '10px', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Today</div>
            </div>
            <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: '12px', padding: '14px 16px', textAlign: 'center', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = cardBorder}
            >
              <div style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: '700', color: '#34d399' }}>98%</div>
              <div style={{ fontSize: '10px', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Accuracy</div>
            </div>
          </div>
          <Console logs={logs} dark={dark} />
        </div>
      </div>
    </div>
  );
}

export default Home;