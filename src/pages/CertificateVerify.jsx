import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyCertificate } from '../utils/storage';

const CertificateVerify = () => {
  const { verifyId } = useParams();
  const cert = useMemo(() => verifyCertificate(verifyId), [verifyId]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: 'system-ui, sans-serif', padding: 24,
    }}>
      {cert ? (
        <div style={{
          maxWidth: 560, width: '100%', background: '#fff', borderRadius: 20,
          border: '3px solid #d4af37', boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          padding: 0, overflow: 'hidden',
        }}>
          {/* Gold header bar */}
          <div style={{
            background: 'linear-gradient(135deg, #d4af37, #f5d760, #d4af37)',
            padding: '20px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#5c4813', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Certificate of Completion
            </div>
          </div>

          <div style={{ padding: '32px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{'\uD83C\uDF93'}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              This is to certify that
            </div>
            <h1 style={{
              margin: '0 0 16px', fontSize: 28, fontWeight: 900, color: '#0f172a',
              borderBottom: '2px solid #d4af37', paddingBottom: 12, display: 'inline-block',
            }}>{cert.studentName}</h1>
            <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
              has successfully completed<br />
              <strong style={{ fontSize: 18, color: '#0f172a' }}>{cert.courseName}</strong>
              {cert.grade && (
                <><br />with a grade of <strong style={{ color: '#d4af37' }}>{cert.grade}</strong></>
              )}
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0',
            }}>
              <span style={{ fontSize: 18 }}>{'\u2705'}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#166534' }}>Verified Certificate</div>
                <div style={{ fontSize: 11, color: '#065f46' }}>This certificate is authentic and valid</div>
              </div>
            </div>

            <div style={{ marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
              <div>Issued by <strong style={{ color: '#475569' }}>{cert.issuerName || cert.issuer}</strong></div>
              <div>Date: {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 11, color: '#cbd5e1' }}>
                Verification ID: {cert.verifyId}
              </div>
            </div>
          </div>

          <div style={{
            background: '#f8fafc', padding: '14px 32px', borderTop: '1px solid #e2e8f0',
            textAlign: 'center', fontSize: 12, color: '#94a3b8',
          }}>
            Powered by <Link to="/" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>QuantegyAI</Link>
          </div>
        </div>
      ) : (
        <div style={{
          maxWidth: 420, textAlign: 'center', background: '#fff', borderRadius: 16,
          padding: 40, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{'\u274C'}</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Certificate Not Found</h2>
          <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            The verification ID <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{verifyId}</code> does not match any valid certificate.
          </p>
          <Link to="/" style={{
            display: 'inline-block', padding: '10px 24px', borderRadius: 10,
            background: '#2563eb', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14,
          }}>Go Home</Link>
        </div>
      )}
    </div>
  );
};

export default CertificateVerify;
