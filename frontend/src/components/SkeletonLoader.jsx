import React from 'react';

const S = ({ w = '100%', h = 14, r = 8, mb = 0 }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: 'var(--border-color)',
    marginBottom: mb,
    animation: 'sk 1.2s ease-in-out infinite',
  }} />
);

function SkeletonLoader({ type = 'history' }) {
  return (
    <>
      <style>{`@keyframes sk { 0%,100%{opacity:.3} 50%{opacity:.7} }`}</style>
      {type === 'history' && <HistorySkeleton />}
      {type === 'dashboard' && <DashboardSkeleton />}
      {type === 'results' && <ResultsSkeleton />}
    </>
  );
}

function HistorySkeleton() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '1.25rem 1.5rem', borderRadius: '16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          marginBottom: '1rem',
        }}>
          <S w={40} h={40} r={10} />
          <div style={{ flex: 1 }}>
            <S w="50%" h={14} mb={8} />
            <S w="70%" h={10} />
          </div>
          <S w={70} h={32} r={8} />
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ padding: '1rem', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <S w="60%" h={10} mb={10} />
            <S w="40%" h={28} mb={6} />
            <S w="70%" h={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <S w="60%" h={16} mb={12} />
            <S w="80%" h={10} mb={8} />
            <S w="70%" h={10} mb={8} />
            <S w="50%" h={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkeletonLoader;