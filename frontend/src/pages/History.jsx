import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiTrash2, FiPlus } from 'react-icons/fi';

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

  const filteredHistory = history.filter(h => {
    if (filter === 'original') return h.score <= 20;
    if (filter === 'medium') return h.score > 20 && h.score <= 50;
    if (filter === 'high') return h.score > 50;
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Check History</h2>
          <p style={{ color: 'var(--text-secondary)' }}>All your previous plagiarism checks</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)', padding: '6px 14px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '700' }}>{history.length} total checks</span>
          {history.length > 0 && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-glow" style={{ padding: '8px 16px', background: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={clearHistory}>
              <FiTrash2 className="icon-glow" /> Clear All
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-glow" style={{ padding: '8px 16px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/')}>
            <FiPlus className="icon-glow" /> New Check
          </motion.button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>Total Checks</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>{history.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All time</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>High Risk</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f43f5e', marginBottom: '4px' }}>{history.filter(h => h.score > 50).length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score &gt; 50%</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>Medium Risk</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fbbf24', marginBottom: '4px' }}>{history.filter(h => h.score > 20 && h.score <= 50).length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score 20-50%</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>Original</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#34d399', marginBottom: '4px' }}>{history.filter(h => h.score <= 20).length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score &lt; 20%</div>
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
          {['all', 'original', 'medium', 'high'].map(f => (
            <button
              key={f}
              className={filter === f ? "btn-glow" : ""}
              style={{ padding: '8px 16px', background: filter === f ? 'var(--accent-primary)' : 'var(--bg-glass)', color: filter === f ? '#fff' : 'var(--text-secondary)', border: `1px solid ${filter === f ? 'transparent' : 'var(--border-color)'}`, borderRadius: '10px', fontSize: '0.875rem', fontWeight: filter === f ? '700' : '600', transition: 'all 0.2s' }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '🔍 All' : f === 'original' ? '✅ Original' : f === 'medium' ? '⚠️ Medium' : '🚨 High Risk'}
            </button>
          ))}
        </div>
      )}

      {filteredHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {history.length === 0 ? 'No checks yet!' : 'No results for this filter!'}
          </div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {history.length === 0 ? 'Run your first plagiarism check to see history here.' : 'Try a different filter.'}
          </div>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredHistory.map((item, index) => {
            const col = getColor(item.score);
            return (
              <motion.div key={item.id} variants={itemVariants} className="glass-panel" whileHover={{ scale: 1.01 }} style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderLeft: `4px solid ${col}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: '700', color: col, flexShrink: 0 }}>
                    #{index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '6px', fontWeight: 500 }}>{item.text}</div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><FiClock /> {item.date}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>🌐 {item.sources} sources checked</span>
                      {item.aiScore !== undefined && (
                        <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 600 }}>🤖 AI: {item.aiScore}%</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: '800', color: col }}>{item.score}%</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ background: 'var(--bg-glass)', color: col, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>
                      {getVerdict(item.score)}
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      className="glass-button" 
                      style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', height: '24px', display: 'flex', alignItems: 'center' }}
                      onClick={() => navigate('/results', { state: item })}
                    >
                      View
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

export default History;