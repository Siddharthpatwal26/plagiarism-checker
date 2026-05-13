import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

function Results({ dark = true }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [ringOffset, setRingOffset] = useState(283);
  const [downloading, setDownloading] = useState(false);

  const stateData = location.state || JSON.parse(localStorage.getItem('latestResult') || 'null');

  const bg = dark ? '#060b18' : '#f0f2f7';
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPrimary = dark ? '#ffffff' : '#111111';
  const textMuted = dark ? 'rgba(255,255,255,0.25)' : '#9aa0bb';
  const textLabel = dark ? 'rgba(255,255,255,0.35)' : '#5a6080';
  const sepColor = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const trackColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  useEffect(() => {
    if (stateData) {
      const circumference = 283;
      const offset = circumference - (circumference * stateData.score / 100);
      setTimeout(() => setRingOffset(offset), 200);
    }
  }, [stateData]);

  // ✅ PDF Download Function
  const downloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const { score, summary, matched_sources, highlights } = stateData;
      const orig = 100 - score;
      const date = new Date().toLocaleString();

      // ✅ Header
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

      // ✅ Score Section
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

      // ✅ Stats Row
      let y = 100;
      doc.setTextColor(150, 150, 180);
      doc.setFontSize(9);
      doc.text('PLAGIARISM', 14, y);
      doc.text('ORIGINAL', 75, y);
      doc.text('SOURCES FOUND', 136, y);

      doc.setTextColor(...scoreColor);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`${score}%`, 14, y + 10);

      doc.setTextColor(52, 211, 153);
      doc.text(`${orig}%`, 75, y + 10);

      doc.setTextColor(96, 165, 250);
      doc.text(`${matched_sources?.length || 0}`, 136, y + 10);

      // ✅ Divider
      y = 122;
      doc.setDrawColor(40, 45, 80);
      doc.line(14, y, 196, y);

      // ✅ Matched Sources
      y = 130;
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Matched Sources', 14, y);
      y += 8;

      if (matched_sources && matched_sources.length > 0) {
        matched_sources.forEach((src, i) => {
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

      // ✅ Highlights
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

        highlights.slice(0, 5).forEach((h, i) => {
          if (y > 260) { doc.addPage(); y = 20; }

          doc.setFillColor(30, 25, 10);
          doc.rect(14, y, 182, 22, 'F');

          doc.setTextColor(251, 191, 36);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(`${h.score}% similar`, 178, y + 6, { align: 'right' });

          doc.setTextColor(200, 200, 210);
          doc.setFont('helvetica', 'normal');
          const inputLine = `Your text: ${h.input_sentence.substring(0, 80)}`;
          doc.text(inputLine, 18, y + 8);

          doc.setTextColor(150, 150, 180);
          const matchLine = `Matched: ${h.matched_sentence.substring(0, 80)}`;
          doc.text(matchLine, 18, y + 16);
          y += 26;
        });
      }

      // ✅ Footer
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
      alert('PDF generate karne mein error: ' + err.message);
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
      <div style={{ background: bg, minHeight: 'calc(100vh - 54px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: textPrimary }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No results yet!</div>
        <div style={{ fontSize: '13px', color: textMuted, marginBottom: '20px' }}>Go to Dashboard and check your text first.</div>
        <button style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }} onClick={() => navigate('/')}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { score, summary, matched_sources, highlights } = stateData;
  const col = score <= 20 ? '#34d399' : score <= 50 ? '#fbbf24' : '#f43f5e';
  const orig = 100 - score;

  const metrics = [
    { label: 'Plagiarism Score', value: `${score}%`, sub: 'Overall similarity', color: col, accentBar: col },
    { label: 'Original Content', value: `${orig}%`, sub: 'Unique text', color: '#34d399', accentBar: '#34d399' },
    { label: 'Sources Found', value: matched_sources?.length || 0, sub: 'Matched sources', color: '#60a5fa', accentBar: '#60a5fa' },
    { label: 'Verdict', value: getVerdict(score), sub: 'Final result', color: col, accentBar: col },
  ];

  return (
    <div style={{ background: bg, minHeight: 'calc(100vh - 54px)', padding: '14px', transition: 'all 0.2s' }}>

      {/* METRICS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: '12px', padding: '14px 16px', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = cardBorder}
          >
            <div style={{ fontSize: '10px', color: textLabel, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>{m.label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: typeof m.value === 'string' && m.value.length > 5 ? '16px' : '24px', fontWeight: '700', color: m.color, marginBottom: '4px' }}>{m.value}</div>
            <div style={{ fontSize: '10px', color: textMuted }}>{m.sub}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', width: '100%', background: `linear-gradient(90deg, ${m.accentBar}, transparent)` }} />
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>

        {/* SCORE CARD */}
        <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: '14px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <svg width="120" height="120" viewBox="0 0 100 100" style={{ marginBottom: '14px' }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke={trackColor} strokeWidth="6" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={col} strokeWidth="6" strokeLinecap="round" strokeDasharray="283" strokeDashoffset={ringOffset} transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
            <text x="50" y="47" textAnchor="middle" fill={col} fontSize="16" fontWeight="700" fontFamily="monospace">{score}%</text>
            <text x="50" y="60" textAnchor="middle" fill={dark ? 'rgba(255,255,255,0.3)' : '#9aa0bb'} fontSize="8">plagiarism</text>
          </svg>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', color: col, marginBottom: '8px' }}>{getVerdict(score)}</div>
          <div style={{ fontSize: '12px', color: textMuted, lineHeight: '1.6', marginBottom: '16px' }}>{summary}</div>
          <div style={{ width: '100%' }}>
            {[{ label: 'Plagiarism', pct: score, color: col }, { label: 'Original', pct: orig, color: '#34d399' }].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: textMuted, width: '70px', textAlign: 'left' }}>{b.label}</span>
                <div style={{ flex: 1, height: '5px', background: trackColor, borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '3px', width: `${b.pct}%`, background: b.color, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontSize: '11px', color: textMuted, fontFamily: 'monospace', width: '30px' }}>{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* SOURCES */}
        <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `0.5px solid ${sepColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', fontWeight: '700', color: textPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              Matched Sources
            </div>
            <span style={{ fontSize: '10px', color: textMuted }}>{matched_sources?.length || 0} sources</span>
          </div>
          <div>
            {matched_sources && matched_sources.length > 0 ? matched_sources.map((src, i) => {
              const sc = src.similarity_score;
              const c = sc > 50 ? '#f43f5e' : sc > 25 ? '#fbbf24' : '#34d399';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: `0.5px solid ${sepColor}`, transition: 'background 0.15s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#60a5fa', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: textPrimary }}>{src.title || 'Web Source'}</div>
                    {src.url !== 'direct_comparison' && (
                      <a href={src.url} target="_blank" rel="noreferrer" style={{ fontSize: '10px', color: '#60a5fa', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{src.url}</a>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ height: '4px', background: trackColor, borderRadius: '2px', overflow: 'hidden', width: '50px', marginBottom: '3px' }}>
                      <div style={{ height: '100%', borderRadius: '2px', width: `${sc}%`, background: c }} />
                    </div>
                    <div style={{ fontSize: '10px', fontFamily: 'monospace', color: c }}>{sc}%</div>
                  </div>
                </div>
              );
            }) : (
              <div style={{ padding: '30px', textAlign: 'center', fontSize: '12px', color: textMuted }}>No sources matched</div>
            )}
          </div>
        </div>

        {/* AI INSIGHTS */}
        <div style={{ background: cardBg, border: `0.5px solid ${dark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.2)'}`, borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `0.5px solid ${sepColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', fontWeight: '700', color: textPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
              AI Insights
            </div>
            <span style={{ background: 'rgba(139,92,246,0.15)', border: '0.5px solid rgba(139,92,246,0.25)', color: '#a78bfa', padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '600' }}>Tavily AI</span>
          </div>
          <div>
            {(score <= 20 ? [
              { tag: '✅ Original', color: '#34d399', text: 'Content is highly original. No significant matches found.' },
              { tag: '🤖 AI Detects', color: '#60a5fa', text: 'Minor technical term overlap. Not flagged as plagiarism.' },
              { tag: '💡 Recommendation', color: '#a78bfa', text: 'Safe for submission. Content appears original.' },
            ] : score <= 50 ? [
              { tag: '⚠️ Warning', color: '#fbbf24', text: 'Medium-level matches found. Review carefully.' },
              { tag: '🤖 AI Detects', color: '#60a5fa', text: 'Paraphrased content detected. Consider rewriting.' },
              { tag: '💡 Recommendation', color: '#a78bfa', text: 'Revise flagged sections before submission.' },
            ] : [
              { tag: '🚨 Alert', color: '#f43f5e', text: 'High plagiarism detected. Multiple exact matches found.' },
              { tag: '🤖 AI Detects', color: '#f43f5e', text: 'Large portions copied from web sources.' },
              { tag: '💡 Recommendation', color: '#fbbf24', text: 'Major rewrite required. Do not submit.' },
            ]).map((ins, i) => (
              <div key={i} style={{ padding: '10px 14px', borderBottom: `0.5px solid ${sepColor}` }}>
                <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.4px', color: ins.color, marginBottom: '4px' }}>{ins.tag}</div>
                <div style={{ fontSize: '11px', color: textMuted, lineHeight: '1.55' }}>{ins.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HIGHLIGHTS */}
      {highlights && highlights.length > 0 && (
        <div style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: '14px', overflow: 'hidden', marginTop: '12px' }}>
          <div style={{ padding: '12px 16px', borderBottom: `0.5px solid ${sepColor}` }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', fontWeight: '700', color: textPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} />
              Matched Sentences
            </div>
          </div>
          <div style={{ padding: '14px 16px' }}>
            {highlights.map((h, i) => (
              <div key={i} style={{ padding: '12px', borderRadius: '8px', background: dark ? 'rgba(251,191,36,0.05)' : 'rgba(251,191,36,0.08)', border: '0.5px solid rgba(251,191,36,0.15)', marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', color: textMuted, marginBottom: '6px' }}>📝 <strong>Your text:</strong> {h.input_sentence}</div>
                <div style={{ fontSize: '12px', color: textMuted, marginBottom: '6px' }}>🔗 <strong>Matched:</strong> {h.matched_sentence}</div>
                <span style={{ fontSize: '10px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', padding: '2px 8px', borderRadius: '10px' }}>{h.score}% similar</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ BOTTOM BUTTONS */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
        <button
          style={{ flex: 1, padding: '13px', background: dark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', color: dark ? 'rgba(255,255,255,0.7)' : '#555', border: `0.5px solid ${dark ? 'rgba(255,255,255,0.1)' : '#ddd'}`, borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
          onClick={() => navigate('/')}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          ⬅️ Check Another Text
        </button>

        {/* ✅ DOWNLOAD PDF BUTTON */}
        <button
          style={{
            flex: 1, padding: '13px',
            background: downloading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#065f46,#1D9E75)',
            color: downloading ? 'rgba(255,255,255,0.4)' : 'white',
            border: 'none', borderRadius: '12px',
            fontSize: '13px', fontWeight: '700',
            cursor: downloading ? 'not-allowed' : 'pointer',
            fontFamily: 'Syne, sans-serif', transition: 'all 0.2s'
          }}
          onClick={downloadPDF}
          disabled={downloading}
          onMouseEnter={e => { if (!downloading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {downloading ? '⏳ Generating...' : '⬇️ Download PDF Report'}
        </button>
      </div>
    </div>
  );
}

export default Results;