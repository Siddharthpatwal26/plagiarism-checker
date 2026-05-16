import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import { FiDownload, FiArrowLeft, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend);

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [downloading, setDownloading] = useState(false);

  const stateData = location.state || JSON.parse(localStorage.getItem('latestResult') || 'null');

  useEffect(() => {
    if (stateData) {
      const { score } = stateData;
      
      // Dynamic Theme Overrides based on Score
      const root = document.documentElement;
      
      let themeColor = '#3b82f6'; // Default Blue
      let glowColor = 'rgba(59, 130, 246, 0.2)';
      
      if (score > 50) {
        themeColor = '#f43f5e'; // Red
        glowColor = 'rgba(244, 63, 94, 0.2)';
      } else if (score > 20) {
        themeColor = '#fbbf24'; // Amber
        glowColor = 'rgba(251, 191, 36, 0.2)';
      } else {
        themeColor = '#10b981'; // Emerald
        glowColor = 'rgba(16, 185, 129, 0.2)';
      }

      root.style.setProperty('--accent-primary', themeColor);
      root.style.setProperty('--glow-color', glowColor);

      // Sound alerts
      let audioUrl = '';
      if (score > 50) {
        audioUrl = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
      } else if (score > 20) {
        audioUrl = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';
      }

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.volume = 0.3;
        audio.play().catch(e => console.log("Audio blocked:", e));
      }

      // Cleanup: Revert theme on unmount
      return () => {
        root.style.removeProperty('--accent-primary');
        root.style.removeProperty('--glow-color');
        root.style.removeProperty('--accent-secondary');
      };
    }
  }, [stateData]);

  const downloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const { score, summary, matched_sources, highlights, ai_score } = stateData;
      const orig = 100 - score;
      const date = new Date().toLocaleString();

      doc.setFillColor(6, 11, 24);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('PlagioCheck Report', 14, 18);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 180);
      doc.text(`Generated: ${date}`, 14, 28);
      doc.text('Powered by TF-IDF + Tavily AI', 14, 35);

      doc.setFillColor(20, 25, 50);
      doc.rect(0, 42, 210, 45, 'F');

      const scoreColor = score <= 20 ? [52, 211, 153] : score <= 50 ? [251, 191, 36] : [244, 63, 94];
      doc.setTextColor(...scoreColor);
      doc.setFontSize(36);
      doc.setFont('helvetica', 'bold');
      doc.text(`${score}%`, 14, 72);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(getVerdict(score), 55, 65);

      doc.setTextColor(150, 150, 180);
      doc.setFontSize(10);
      doc.text(summary || '', 55, 75);

      let y = 100;
      doc.setTextColor(150, 150, 180);
      doc.setFontSize(9);
      doc.text('PLAGIARISM', 14, y);
      doc.text('ORIGINAL', 65, y);
      doc.text('AI GENERATED', 116, y);
      doc.text('SOURCES', 167, y);

      doc.setTextColor(...scoreColor);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`${score}%`, 14, y + 10);

      doc.setTextColor(52, 211, 153);
      doc.text(`${orig}%`, 65, y + 10);

      doc.setTextColor(168, 85, 247);
      doc.text(`${ai_score || 0}%`, 116, y + 10);

      doc.setTextColor(96, 165, 250);
      doc.text(`${matched_sources?.length || 0}`, 167, y + 10);

      y = 122;
      doc.setDrawColor(40, 45, 80);
      doc.line(14, y, 196, y);

      y = 130;
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Matched Sources', 14, y);
      y += 8;

      if (matched_sources && matched_sources.length > 0) {
        matched_sources.forEach((src) => {
          if (y > 260) { doc.addPage(); y = 20; }
          const sc = src.similarity_score;
          const c = sc > 50 ? [244, 63, 94] : sc > 25 ? [251, 191, 36] : [52, 211, 153];

          doc.setFillColor(20, 25, 50);
          doc.rect(14, y, 182, 16, 'F');
          doc.setTextColor(...c);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${sc}%`, 178, y + 10, { align: 'right' });
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          const title = src.title || 'Web Source';
          doc.text(title.substring(0, 55), 18, y + 6);
          doc.setTextColor(96, 165, 250);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          if (src.url !== 'direct_comparison') {
            doc.text(src.url.substring(0, 70), 18, y + 13);
          }
          y += 20;
        });
      } else {
        doc.setTextColor(150, 150, 180);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No matched sources found.', 14, y + 6);
        y += 14;
      }

      if (highlights && highlights.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }
        y += 6;
        doc.setDrawColor(40, 45, 80);
        doc.line(14, y, 196, y);
        y += 10;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Matched Sentences', 14, y);
        y += 10;

        highlights.slice(0, 5).forEach((h) => {
          if (y > 260) { doc.addPage(); y = 20; }
          doc.setFillColor(30, 25, 10);
          doc.rect(14, y, 182, 22, 'F');
          doc.setTextColor(251, 191, 36);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(`${h.score}% similar`, 178, y + 6, { align: 'right' });
          doc.setTextColor(200, 200, 210);
          doc.setFont('helvetica', 'normal');
          doc.text(`Your text: ${h.input_sentence.substring(0, 80)}`, 18, y + 8);
          doc.setTextColor(150, 150, 180);
          doc.text(`Matched: ${h.matched_sentence.substring(0, 80)}`, 18, y + 16);
          y += 26;
        });
      }

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(6, 11, 24);
        doc.rect(0, 285, 210, 12, 'F');
        doc.setTextColor(80, 80, 120);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('PlagioCheck — AI Plagiarism Detector', 14, 292);
        doc.text(`Page ${i} of ${pageCount}`, 196, 292, { align: 'right' });
      }

      doc.save(`plagiocheck-report-${Date.now()}.pdf`);
    } catch (err) {
      alert('PDF generate error: ' + err.message);
    }
    setDownloading(false);
  };

  const getVerdict = (s) => {
    if (s <= 20) return 'Original Content';
    if (s <= 50) return 'Medium Risk';
    return 'High Risk';
  };

  if (!stateData) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ minHeight: 'calc(100vh - 54px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No results yet!</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Go to Dashboard and check your text first.</div>
        <button className="btn-glow" style={{ padding: '10px 20px', background: 'var(--accent-primary)', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }} onClick={() => navigate('/')}>
          Go to Dashboard
        </button>
      </motion.div>
    );
  }

  const { score, summary, matched_sources, highlights, ai_score } = stateData;
  const col = score <= 20 ? '#34d399' : score <= 50 ? '#fbbf24' : '#f43f5e';
  const orig = 100 - score;

  const chartData = {
    labels: ['Plagiarism', 'Original'],
    datasets: [{
      data: [score, orig],
      backgroundColor: [col, isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'],
      borderColor: [col, 'transparent'],
      borderWidth: 1,
      cutout: '80%',
    }]
  };

  const metrics = [
    { label: 'Plagiarism Score', value: `${score}%`, sub: 'Overall similarity', color: col, accentBar: col },
    { label: 'AI Probability', value: `${ai_score || 0}%`, sub: 'GPT / AI Written', color: (ai_score || 0) > 50 ? '#f43f5e' : '#a855f7', accentBar: (ai_score || 0) > 50 ? '#f43f5e' : '#a855f7' },
    { label: 'Original Content', value: `${orig}%`, sub: 'Unique text', color: '#34d399', accentBar: '#34d399' },
    { label: 'Sources Found', value: matched_sources?.length || 0, sub: 'Matched sources', color: '#60a5fa', accentBar: '#60a5fa' },
    { label: 'Verdict', value: getVerdict(score), sub: 'Final result', color: col, accentBar: col },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {metrics.map((m, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '1rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: typeof m.value === 'string' && m.value.length > 5 ? '1.25rem' : '2rem', fontWeight: '800', color: m.color, marginBottom: '4px' }}>{m.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.sub}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', width: '100%', background: `linear-gradient(90deg, ${m.accentBar}, transparent)` }} />
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        <motion.div 
          animate={score > 50 ? { 
            boxShadow: ["0 0 0px rgba(244, 63, 94, 0)", "0 0 20px rgba(244, 63, 94, 0.4)", "0 0 0px rgba(244, 63, 94, 0)"] 
          } : score > 20 ? {
            boxShadow: ["0 0 0px rgba(251, 191, 36, 0)", "0 0 20px rgba(251, 191, 36, 0.4)", "0 0 0px rgba(251, 191, 36, 0)"]
          } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="glass-panel" 
          style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
          <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '1.5rem' }}>
            <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: true } } }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: col }}>{score}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Match</div>
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: col, marginBottom: '8px' }}>{getVerdict(score)}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{summary}</div>
        </motion.div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid var(--border-color)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCheckCircle style={{ color: '#34d399' }} /> Matched Sources
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{matched_sources?.length || 0} sources</span>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {matched_sources && matched_sources.length > 0 ? matched_sources.map((src, i) => {
              const sc = src.similarity_score;
              const c = sc > 50 ? '#f43f5e' : sc > 25 ? '#fbbf24' : '#34d399';
              return (
                <motion.div key={i} whileHover={{ background: 'var(--bg-glass)' }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem 1.5rem', borderBottom: `1px solid var(--border-color)` }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>{src.title || 'Web Source'}</div>
                    {src.url !== 'direct_comparison' && (
                      <a href={src.url} target="_blank" rel="noreferrer" className="icon-glow" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{src.url}</a>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ height: '4px', background: 'var(--bg-glass)', borderRadius: '2px', overflow: 'hidden', width: '50px', marginBottom: '4px' }}>
                      <div style={{ height: '100%', width: `${sc}%`, background: c }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: c, fontWeight: 700 }}>{sc}%</div>
                  </div>
                </motion.div>
              );
            }) : (
              <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No sources matched</div>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ border: `1px solid ${isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)'}`, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid var(--border-color)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiInfo style={{ color: '#a78bfa' }} /> AI Insights
            </div>
            <span style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '700' }}>Tavily AI</span>
          </div>
          <div>
            {((ai_score || 0) <= 20 ? [
              { tag: 'AI Status', color: '#34d399', text: 'Text appears to be entirely human-written.' },
            ] : (ai_score || 0) <= 50 ? [
              { tag: 'AI Warning', color: '#fbbf24', text: 'Some portions exhibit patterns common in AI-generated text.' },
            ] : [
              { tag: 'AI Alert', color: '#f43f5e', text: 'High probability of being generated by ChatGPT or similar AI.' },
            ]).concat(score <= 20 ? [
              { tag: 'Recommendation', color: '#a78bfa', text: 'Safe for submission. Content appears original.' },
            ] : score <= 50 ? [
              { tag: 'Recommendation', color: '#a78bfa', text: 'Revise flagged sections before submission.' },
            ] : [
              { tag: 'Recommendation', color: '#fbbf24', text: 'Major rewrite required. Do not submit.' },
            ]).map((ins, i) => (
              <div key={i} style={{ padding: '1rem 1.5rem', borderBottom: `1px solid var(--border-color)` }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px', color: ins.color, marginBottom: '6px', textTransform: 'uppercase' }}>{ins.tag}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{ins.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {highlights && highlights.length > 0 && (
        <div className="glass-panel" style={{ overflow: 'hidden', marginTop: '1.5rem' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid var(--border-color)` }}>
            <div style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiAlertTriangle style={{ color: '#fbbf24' }} /> Matched Sentences
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {highlights.map((h, i) => (
              <div key={i} style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>📝 <strong>Your text:</strong> {h.input_sentence}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>🔗 <strong>Matched:</strong> {h.matched_sentence}</div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>{h.score}% similar</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-glow"
          style={{ flex: 1, padding: '1rem', background: 'var(--bg-glass)', color: 'var(--text-primary)', border: `1px solid var(--border-color)`, borderRadius: '12px', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          onClick={() => navigate('/')}
        >
          <FiArrowLeft className="icon-glow" /> Check Another Text
        </motion.button>

        <motion.button
          whileHover={!downloading ? { scale: 1.02 } : {}}
          whileTap={!downloading ? { scale: 0.98 } : {}}
          className={!downloading ? "btn-glow" : ""}
          style={{
            flex: 1, padding: '1rem',
            background: downloading ? 'var(--bg-glass)' : 'var(--accent-secondary)',
            color: downloading ? 'var(--text-secondary)' : 'white',
            border: 'none', borderRadius: '12px',
            fontSize: '1rem', fontWeight: '700',
            cursor: downloading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
          onClick={downloadPDF}
          disabled={downloading}
        >
          {downloading ? '⏳ Generating...' : <><FiDownload className="icon-glow" /> Download PDF Report</>}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default Results;