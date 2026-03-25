import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

/**
 * Breadcrumb component for navigation hierarchy.
 * @param {Array<{label: string, to?: string}>} items - Array of { label, to? }. If to is omitted, renders as current (non-link).
 */
export default function Breadcrumb({ items = [] }) {
  const location = useLocation();

  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      color: 'var(--color-text-muted)',
      marginBottom: 12,
      flexWrap: 'wrap',
    }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && (
              <span style={{ color: 'var(--color-text-subtle)', fontSize: 10 }} aria-hidden>›</span>
            )}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                style={{
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  color: isLast ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontWeight: isLast ? 700 : 500,
                }}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string,
    })
  ),
};
