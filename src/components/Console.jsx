import React, { useEffect, useRef, useState } from 'react';

function Console({ logs, dark = true }) {
  const consoleRef = useRef(null);
  const [visibleLogs, setVisibleLogs] = useState([]);

  useEffect(() => {
    // Stream logs one by one with delay
    setVisibleLogs([]);
    logs.forEach((log, i) => {
      setTimeout(() => {
        setVisibleLogs(prev => [...prev, log]);
        if (consoleRef.current) {
          consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
      }, i * 120);
    });
  }, [logs]);

  const getColor = (type) => {
    switch(type) {
      case 'ok':   return '#34d399';
      case 'info': return '#60a5fa';
      case 'warn': return '#fbbf24';
      case 'err':  return '#f43f5e';
      case 'dim':  return 'rgba(255,255,255,0.15)';
      default:     return 'rgba(255,255,255,0.25)';
    }
  };

  const cardBg = dark ? '#080d1a' : '#f8f9fc';
  const cardBorder = dark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.2)';
  const headBg = dark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.05)';
  const headBorder = dark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.12)';
  const titleColor = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

  return (
    <div style={{
      background: cardBg,
      border: `0.5px solid ${cardBorder}`,
      borderRadius: '14px',
      overflow: 'hidden',
      height: '100%',
      transition: 'all 0.2s',
    }}>
      {/* HEADER */}
      <div style={{
        padding: '10px 14px',
        background: headBg,
        borderBottom: `0.5px solid ${headBorder}`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: '10px', color: titleColor, marginLeft: '4px' }}>
          terminal — plagiocheck v1.0
        </span>
      </div>

      {/* BODY */}
      <div
        ref={consoleRef}
        style={{
          padding: '12px 14px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          lineHeight: '1.9',
          height: '200px',
          overflowY: 'auto',
        }}
      >
        {visibleLogs.map((log, index) => (
          <div
            key={index}
            style={{
              color: getColor(log.type),
              marginBottom: '2px',
              animation: 'fadeSlideIn 0.2s ease both',
            }}
          >
            {log.message}
          </div>
        ))}

        {/* Blinking cursor */}
        <span style={{
          display: 'inline-block',
          width: '7px',
          height: '13px',
          background: '#34d399',
          borderRadius: '1px',
          verticalAlign: 'middle',
          animation: 'blink 1s infinite',
        }} />
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default Console;