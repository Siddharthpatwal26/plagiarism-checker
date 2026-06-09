import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function History({ dark }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('plagiarism_history') || '[]');
    setHistory(h);
    setTimeout(() => setMounted(true), 100);
  }, []);

  const clearHistory = () => {
    if (window.confirm('Saari history delete karni hai?')) {
      localStorage.removeItem('plagiarism_history');
      setHistory([]);
    }
  };

  const deleteOne = (id) => {
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem('plagiarism_history', JSON.stringify(updated));
    setHistory(updated);
  };

  const getColor = (score) => {
    if (score <= 20) return '#34d399';
    if (score <= 50) return '#fbbf24';
    return '#f43f5e';
  };

  const getVerdict = (score) => {
    if (score <= 20) return { label: 'Original', emoji: '✅' };
    if (score <= 50) return { label: 'Medium', emoji: '⚠️' };
    return { label: 'High Risk', emoji: '🚨' };
  };

  const getBg = (score) => {
    if (score <= 20) return 'rgba(52,211,153,0.08)';
    if (score <= 50) return 'rgba(251,191,36,0.08)';
    return 'rgba(244,63,94,0.08)';
  };

  const filteredHistory = history.filter(h => {
    if (filter === 'original') return h.score <= 20;
    if (filter === 'medium') return h.score > 20 && h.score <= 50;
    if (filter === 'high') return h.score > 50;
    return true;
  });

  // ── Theme ──
  const bg         = dark ? '#060b18' : '#f0f2f7';
  const cardBg     = dark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const cardHover  = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';
  const textPrimary= dark ? '#ffffff' : '#111111';
  const textMuted  = dark ? 'rgba(255,255,255,0.35)' : '#888';
  const sepColor   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

  const stats = [
    { label: 'Total Checks', value: history.length,                                          color: textPrimary, sub: 'All time',     icon: '📊' },
    { label: 'High Risk',    value: history.filter(h => h.score > 50).length,                color: '#f43f5e',   sub: 'Score > 50%', icon: '🚨' },
    { label: 'Medium Risk',  value: history.filter(h => h.score > 20 && h.score <= 50).length, color: '#fbbf24', sub: '20–50%',      icon: '⚠️' },
    { label: 'Original',     value: history.filter(h => h.score <= 20).length,               color: '#34d399',   sub: 'Score < 20%', icon: '✅' },
  ];

  const filters = [
    { key: 'all',      label: '🔍 All' },
    { key: 'original', label: '✅ Original' },
    { key: 'medium',   label: '⚠️ Medium' },
    { key: 'high',     label: '🚨 High Risk' },
  ];

  return (
    <div style={{ background: bg, minHeight: 'calc(100vh - 54px)', padding: '20px', transition: 'all 0.3s', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(8px)' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '800', color: textPrimary, margin: '0 0 4px' }}>Check History</h2>
          <p style={{ fontSize: '12px', color: textMuted, margin: 0, fontFamily: 'monospace' }}>All your previous plagiarism checks</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {history.length > 0 && (
            <button onClick={clearHistory} style={{ padding: '8px 14px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '0.5px solid rgba(244,63,94,0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
            >
              🗑 Clear All
            </button>
          )}
          <button onClick={() => navigate('/')} style={{ padding: '8px 14px', background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Syne, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            + New Check
          </button>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: '12px', padding: '14px 16px', position: 'relative', overflow: 'hidden', transition: 'all 0.2s', opacity: mounted ? 1 : 0, transitionDelay: `${i * 60}ms` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = cardHover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '10px', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: '600' }}>{s.icon} {s.label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '26px', fontWeight: '800', color: s.color, marginBottom: '2px' }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: textMuted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      {history.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding: '6px 14px', background: filter === f.key ? 'linear-gradient(135deg,#1d4ed8,#7c3aed)' : cardBg, color: filter === f.key ? '#fff' : textMuted, border: `0.5px solid ${filter === f.key ? 'transparent' : cardBorder}`, borderRadius: '8px', fontSize: '11px', fontWeight: filter === f.key ? '700' : '500', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Syne, sans-serif' }}
              onMouseEnter={e => { if (filter !== f.key) { e.currentTarget.style.borderColor = cardHover; e.currentTarget.style.color = textPrimary; }}}
              onMouseLeave={e => { if (filter !== f.key) { e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.color = textMuted; }}}
            >
              {f.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: textMuted, fontFamily: 'monospace', display: 'flex', alignItems: 'center' }}>
            {filteredHistory.length} result{filteredHistory.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {filteredHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: cardBg, border: `0.5px solid ${cardBorder}`, borderRadius: '16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800', color: textPrimary, marginBottom: '8px' }}>
            {history.length === 0 ? 'No checks yet!' : 'No results for this filter!'}
          </div>
          <div style={{ fontSize: '12px', color: textMuted, marginBottom: '20px' }}>
            {history.length === 0 ? 'Run your first plagiarism check to see history here.' : 'Try a different filter.'}
          </div>
          {history.length === 0 && (
            <button onClick={() => navigate('/')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>
              + Start First Check
            </button>
          )}
        </div>
      ) : (
        /* ── HISTORY LIST ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredHistory.map((item, index) => {
            const col = getColor(item.score);
            const verdict = getVerdict(item.score);
            const itemBg = getBg(item.score);

            return (
              <div key={item.id}
                style={{ background: cardBg, border: `0.5px solid ${cardBorder}`, borderLeft: `3px solid ${col}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s', opacity: mounted ? 1 : 0, transitionDelay: `${index * 40}ms` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = col; e.currentTarget.style.background = dark ? `${itemBg}` : '#fafafa'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.background = cardBg; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderLeftColor = col; }}
              >
                {/* Index */}
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: itemBg, border: `0.5px solid ${col}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: col, flexShrink: 0, fontFamily: 'monospace' }}>
                  #{index + 1}
                </div>

                {/* Text + Meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: textPrimary, fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '5px' }}>
                    {item.text}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', color: textMuted, fontFamily: 'monospace' }}>
                      🕐 {item.date ? new Date(item.date).toLocaleString() : 'N/A'}
                    </span>
                    <span style={{ fontSize: '10px', color: textMuted, fontFamily: 'monospace' }}>
                      🌐 {item.sources || 0} sources
                    </span>
                    {item.aiScore !== undefined && (
                      <span style={{ fontSize: '10px', color: '#a855f7', fontFamily: 'monospace', fontWeight: '600' }}>
                        🤖 AI: {item.aiScore}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Score + Verdict + Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {/* Score circle */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: '800', color: col, lineHeight: 1 }}>{item.score}%</div>
                    <div style={{ fontSize: '9px', color: textMuted, marginTop: '2px' }}>score</div>
                  </div>

                  {/* Verdict badge */}
                  <div style={{ background: itemBg, color: col, border: `0.5px solid ${col}44`, padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {verdict.emoji} {verdict.label}
                  </div>

                  {/* View button */}
                  <button onClick={() => navigate('/results', { state: item })}
                    style={{ padding: '5px 12px', background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: textPrimary, border: `0.5px solid ${cardBorder}`, borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = textPrimary; e.currentTarget.style.borderColor = cardBorder; }}
                  >
                    View →
                  </button>

                  {/* Delete button */}
                  <button onClick={() => deleteOne(item.id)}
                    style={{ padding: '5px 8px', background: 'transparent', color: textMuted, border: `0.5px solid ${cardBorder}`, borderRadius: '6px', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; e.currentTarget.style.borderColor = cardBorder; }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
