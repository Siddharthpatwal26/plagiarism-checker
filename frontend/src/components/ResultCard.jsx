import React from 'react';

function ResultCard({ score, summary, matched_sources, highlights }) {

  const getColor = () => {
    if (score <= 20) return '#27ae60';
    if (score <= 50) return '#f39c12';
    return '#e74c3c';
  };

  const getBg = () => {
    if (score <= 20) return '#e8f8f0';
    if (score <= 50) return '#fef9e7';
    return '#fdecea';
  };

  const getMessage = () => {
    if (score <= 20) return '✅ Original Content!';
    if (score <= 50) return '⚠️ Medium Plagiarism!';
    return '❌ High Plagiarism!';
  };

  return (
    <div style={styles.wrapper}>

      {/* Score Card */}
      <div style={{ ...styles.scoreCard, background: getBg(), border: `2px solid ${getColor()}` }}>
        <div style={styles.scoreTop}>
          <div style={{ ...styles.scoreCircle, border: `5px solid ${getColor()}` }}>
            <span style={{ ...styles.scoreNum, color: getColor() }}>{score}%</span>
            <span style={styles.scoreLabel}>plagiarism</span>
          </div>
          <div style={styles.scoreInfo}>
            <h2 style={{ ...styles.status, color: getColor() }}>{getMessage()}</h2>
            <p style={styles.summary}>{summary}</p>
            <div style={styles.bars}>
              <div style={styles.barRow}>
                <span style={styles.barLabel}>Plagiarism</span>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: `${score}%`, background: getColor() }}></div>
                </div>
                <span style={styles.barPct}>{score}%</span>
              </div>
              <div style={styles.barRow}>
                <span style={styles.barLabel}>Original</span>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: `${100 - score}%`, background: '#27ae60' }}></div>
                </div>
                <span style={styles.barPct}>{100 - score}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matched Sources */}
      {matched_sources && matched_sources.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🌐 Matched Sources</h3>
          {matched_sources.map((source, index) => (
            <div key={index} style={styles.sourceCard}>
              <div style={styles.sourceTop}>
                <span style={styles.sourceTitle}>{source.title || 'Source'}</span>
                <span style={{ ...styles.sourceBadge, background: source.similarity_score > 50 ? '#fdecea' : '#fef9e7', color: source.similarity_score > 50 ? '#e74c3c' : '#f39c12' }}>
                  {source.similarity_score}% match
                </span>
              </div>
              {source.url !== 'direct_comparison' && (
                <a href={source.url} target="_blank" rel="noreferrer" style={styles.sourceUrl}>
                  {source.url}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔦 Matched Sentences</h3>
          {highlights.map((h, index) => (
            <div key={index} style={styles.highlightCard}>
              <p style={styles.highlightInput}>📝 <strong>Your text:</strong> {h.input_sentence}</p>
              <p style={styles.highlightMatch}>🔗 <strong>Matched:</strong> {h.matched_sentence}</p>
              <span style={styles.highlightScore}>{h.score}% similar</span>
            </div>
          ))}
        </div>
      )}

      {/* Check Again Button */}
      <button style={styles.button} onClick={() => window.location.href = '/'}>
        ⬅️ Check Another Text
      </button>

    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: '850px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  scoreCard: {
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '24px',
  },
  scoreTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    flexWrap: 'wrap',
  },
  scoreCircle: {
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white',
    flexShrink: 0,
  },
  scoreNum: {
    fontSize: '32px',
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: '11px',
    color: '#999',
  },
  scoreInfo: {
    flex: 1,
  },
  status: {
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  summary: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '16px',
  },
  bars: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  barLabel: {
    fontSize: '12px',
    color: '#666',
    width: '70px',
  },
  barTrack: {
    flex: 1,
    height: '8px',
    background: '#eee',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 1s ease',
  },
  barPct: {
    fontSize: '12px',
    color: '#666',
    width: '35px',
  },
  section: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: '16px',
  },
  sourceCard: {
    padding: '12px',
    borderRadius: '8px',
    background: '#f8f9fa',
    marginBottom: '10px',
    border: '1px solid #e9ecef',
  },
  sourceTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  sourceTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  sourceBadge: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  sourceUrl: {
    fontSize: '12px',
    color: '#1565c0',
    textDecoration: 'none',
  },
  highlightCard: {
    padding: '14px',
    borderRadius: '8px',
    background: '#fff8e1',
    marginBottom: '10px',
    border: '1px solid #ffe082',
  },
  highlightInput: {
    fontSize: '13px',
    color: '#333',
    marginBottom: '6px',
  },
  highlightMatch: {
    fontSize: '13px',
    color: '#555',
    marginBottom: '6px',
  },
  highlightScore: {
    fontSize: '11px',
    background: '#fff3cd',
    color: '#856404',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #1a237e, #1565c0)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default ResultCard;