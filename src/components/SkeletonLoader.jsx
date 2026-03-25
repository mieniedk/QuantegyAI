import React from 'react';
import PropTypes from 'prop-types';

const shimmerStyle = {
  background: 'linear-gradient(90deg, var(--color-border-subtle) 25%, var(--color-border) 50%, var(--color-border-subtle) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
};

export default function SkeletonLoader({ variant = 'text', count = 1, width, height, style = {} }) {
  const base = {
    borderRadius: 6,
    ...shimmerStyle,
    ...style,
  };

  if (variant === 'text') {
    return (
      <>
        <style>{`
          @keyframes skeleton-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              ...base,
              height: height || 16,
              width: width || (i === count - 1 && count > 1 ? '60%' : '100%'),
              marginBottom: i < count - 1 ? 8 : 0,
            }}
            aria-hidden
          />
        ))}
      </>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <style>{`
          @keyframes skeleton-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        <div
          style={{
            ...base,
            width: width || '100%',
            height: height || 120,
            padding: 16,
          }}
          aria-hidden
        >
          <div style={{ ...base, height: 20, width: '70%', marginBottom: 12 }} />
          <div style={{ ...base, height: 14, width: '100%', marginBottom: 8 }} />
          <div style={{ ...base, height: 14, width: '85%' }} />
        </div>
      </>
    );
  }

  if (variant === 'table-row') {
    return (
      <>
        <style>{`
          @keyframes skeleton-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
          aria-hidden
        >
          <div style={{ ...base, width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ ...base, height: 14, flex: 1, maxWidth: 200 }} />
          <div style={{ ...base, height: 14, width: 60 }} />
          <div style={{ ...base, height: 14, width: 80 }} />
        </div>
      </>
    );
  }

  if (variant === 'avatar') {
    return (
      <>
        <style>{`
          @keyframes skeleton-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        <div
          style={{
            ...base,
            width: width || 40,
            height: height || 40,
            borderRadius: '50%',
          }}
          aria-hidden
        />
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ ...base, width: width || '100%', height: height || 24 }} aria-hidden />
    </>
  );
}

SkeletonLoader.propTypes = {
  variant: PropTypes.oneOf(['text', 'card', 'table-row', 'avatar']),
  count: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
};
