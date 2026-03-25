import React from 'react';
import { Link } from 'react-router-dom';

export default function QuickGameLayout({ returnUrl, goBack, title, subtitle, children }) {
  return (
    <div style={styles.page}>
      {returnUrl ? (
        <button type="button" onClick={goBack} style={styles.topLinkBtn}>{"<- Continue"}</button>
      ) : (
        <Link to="/games" style={styles.topLink}>{"<- Games"}</Link>
      )}
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.subtitle}>{subtitle}</p>
      {children}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    color: '#0f172a',
    fontFamily: 'Inter, Segoe UI, system-ui, sans-serif',
    padding: 20,
    textAlign: 'center',
  },
  topLink: { textDecoration: 'none', color: '#2563eb', fontWeight: 700, fontSize: 13 },
  topLinkBtn: { background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  title: { margin: '10px 0 6px', fontWeight: 900 },
  subtitle: { margin: '0 0 10px', color: '#475569' },
};
