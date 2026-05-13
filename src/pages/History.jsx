import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('plagiarism_history') || '[]');
    setHistory(h);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('plagiarism_history');
    setHistory([]);
  };

  const getColor = (score) => {
    if (score <= 20) return '#34d399';
    if (score <= 50) return '#fbbf24';
    return '#f43f5e';
  };

  const getVerdict = (score) => {
    if (score <= 20) return 'Original';
    if (score <= 50) return 'Medium';
    return 'High Risk';
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

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Check History</h2>
          <p style={styles.sub}>All your previous plagiarism checks</p>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.totalBadge}>{history.length} total checks</span>
          {history.length > 0 && (
            <button style={styles.clearBtn} onClick={clearHistory}>
              🗑️ Clear All
            </button>
          )}
          <button style={styles.newBtn} onClick={() => navigate('/')}>
            + New Check
          </button>
        </div>
      </div>

      {/* STATS ROW */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Total Checks</div>
          <div style={styles.statVal}>{history.length}</div>
          <div style={styles.statSub}>All time</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>High Risk</div>
          <div style={{...styles.statVal, color:'#f43f5e'}}>
            {history.filter(h => h.score > 50).length}
          </div>
          <div style={styles.statSub}>Score &gt; 50%</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Medium Risk</div>
          <div style={{...styles.statVal, color:'#fbbf24'}}>
            {history.filter(h => h.score > 20 && h.score <= 50).length}
          </div>
          <div style={styles.statSub}>Score 20-50%</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Original</div>
          <div style={{...styles.statVal, color:'#34d399'}}>
            {history.filter(h => h.score <= 20).length}
          </div>
          <div style={styles.statSub}>Score &lt; 20%</div>
        </div>
      </div>

      {/* FILTER TABS */}
      {history.length > 0 && (
        <div style={styles.filterRow}>
          {['all', 'original', 'medium', 'high'].map(f => (
            <button
              key={f}
              style={filter === f ? {...styles.filterBtn, ...styles.filterBtnActive} : styles.filterBtn}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '🔍 All' : f === 'original' ? '✅ Original' : f === 'medium' ? '⚠️ Medium' : '🚨 High Risk'}
            </button>
          ))}
        </div>
      )}

      {/* HISTORY LIST */}
      {filteredHistory.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📋</div>
          <div style={styles.emptyTitle}>
            {history.length === 0 ? 'No checks yet!' : 'No results for this filter!'}
          </div>
          <div style={styles.emptyText}>
            {history.length === 0
              ? 'Run your first plagiarism check to see history here.'
              : 'Try a different filter.'}
          </div>
          {history.length === 0 && (
            <button style={styles.newBtn} onClick={() => navigate('/')}>
              Start Checking
            </button>
          )}
        </div>
      ) : (
        <div style={styles.list}>
          {filteredHistory.map((item, index) => {
            const col = getColor(item.score);
            return (
              <div key={item.id} style={{...styles.item, borderLeft: `3px solid ${col}`}}>
                <div style={styles.itemLeft}>
                  <div style={{...styles.itemNum, background: getBg(item.score), color: col}}>
                    #{index + 1}
                  </div>
                  <div style={styles.itemInfo}>
                    <div style={styles.itemText}>{item.text}</div>
                    <div style={styles.itemMeta}>
                      <span style={styles.itemDate}>🕐 {item.date}</span>
                      <span style={styles.itemSources}>🌐 {item.sources} sources checked</span>
                    </div>
                  </div>
                </div>
                <div style={styles.itemRight}>
                  <div style={styles.itemBar}>
                    <div style={{
                      ...styles.itemFill,
                      width: `${item.score}%`,
                      background: col
                    }}></div>
                  </div>
                  <div style={{...styles.itemScore, color: col}}>{item.score}%</div>
                  <div style={{
                    ...styles.itemVerdict,
                    background: getBg(item.score),
                    color: col,
                    padding: '3px 8px',
                    borderRadius: '5px',
                    fontSize: '10px',
                    fontWeight: '700',
                  }}>
                    {getVerdict(item.score)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    background: '#060b18',
    minHeight: 'calc(100vh - 54px)',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '20px',
    fontWeight: '800',
    color: 'white',
    marginBottom: '4px',
  },
  sub: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  totalBadge: {
    background: 'rgba(59,130,246,0.15)',
    border: '0.5px solid rgba(59,130,246,0.3)',
    color: '#60a5fa',
    padding: '5px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
  },
  clearBtn: {
    padding: '8px 14px',
    background: 'rgba(244,63,94,0.1)',
    color: '#f43f5e',
    border: '0.5px solid rgba(244,63,94,0.3)',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
  newBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Syne, sans-serif',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '10px',
    marginBottom: '16px',
  },
  stat: {
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '14px 16px',
  },
  statLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  statVal: {
    fontFamily: 'monospace',
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '4px',
  },
  statSub: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.25)',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  filterBtn: {
    padding: '7px 14px',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.4)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    background: 'rgba(59,130,246,0.15)',
    color: '#60a5fa',
    border: '0.5px solid rgba(59,130,246,0.3)',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '18px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: '20px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  item: {
    background: 'rgba(255,255,255,0.02)',
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  },
  itemNum: {
    width: '36px',
    height: '36px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    flexShrink: 0,
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '4px',
  },
  itemMeta: {
    display: 'flex',
    gap: '12px',
  },
  itemDate: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.25)',
  },
  itemSources: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.25)',
  },
  itemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
    flexShrink: 0,
  },
  itemBar: {
    width: '80px',
    height: '4px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  itemFill: {
    height: '100%',
    borderRadius: '2px',
  },
  itemScore: {
    fontFamily: 'monospace',
    fontSize: '16px',
    fontWeight: '700',
  },
  itemVerdict: {},
};

export default History;