/**
 * Content Adapter — AI-powered translation and cultural adaptation
 * of educational content (lessons, quizzes, modules).
 */
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES, getLangMeta } from '../utils/translations';
import RichTextEditor from './RichTextEditor';

export default function ContentAdapter() {
  const { lang } = useLanguage();
  const [content, setContent] = useState('');
  const [targetLang, setTargetLang] = useState(lang === 'en' ? 'af' : lang);
  const [gradeLevel, setGradeLevel] = useState('Grade 3');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const targetMeta = getLangMeta(targetLang);

  const handleAdapt = async () => {
    if (!content.replace(/<[^>]*>/g, '').trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch('/api/adapt-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          contentType: 'lesson material',
          sourceLang: 'English',
          targetLang,
          targetLangName: targetMeta.name,
          targetRegion: targetMeta.region,
          gradeLevel,
        }),
      });
      const data = await resp.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to connect. ' + err.message });
    }
    setLoading(false);
  };

  const confidenceColor = { high: '#22c55e', medium: '#f59e0b', low: '#ef4444' };

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{
        padding: '16px 20px', background: 'linear-gradient(135deg, #059669, #0891b2)',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>{'\uD83C\uDF10'}</span>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Content Adapter</h3>
        </div>
        <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>
          Translate and culturally adapt lessons, quizzes, and modules for any language and region.
        </p>
      </div>

      <div style={{ padding: 20 }}>
        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>Target Language</label>
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} style={{
              width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
              fontSize: 13, background: '#fff',
            }}>
              {LANGUAGES.filter((l) => l.code !== 'en').map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.native} ({l.name})</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>Grade Level</label>
            <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} style={{
              width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
              fontSize: 13, background: '#fff',
            }}>
              {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content input */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>
            English Content (paste lesson text, quiz questions, instructions, etc.)
          </label>
          <RichTextEditor value={content} onChange={setContent}
            placeholder="Paste your lesson content, quiz questions, or instructions here..."
            compact minHeight={60} />
        </div>

        <button type="button" onClick={handleAdapt} disabled={loading || !content.replace(/<[^>]*>/g, '').trim()} style={{
          padding: '12px 24px', borderRadius: 8, border: 'none',
          background: content.replace(/<[^>]*>/g, '').trim() ? 'linear-gradient(135deg, #059669, #0891b2)' : '#e2e8f0',
          color: content.replace(/<[^>]*>/g, '').trim() ? '#fff' : '#94a3b8', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {loading ? (
            <>{'\u2728'} Translating & Adapting...</>
          ) : (
            <>{'\uD83C\uDF10'} Adapt to {targetMeta.native}</>
          )}
        </button>
      </div>

      {/* Results */}
      {result && !result.error && (
        <div style={{ borderTop: '1px solid #e2e8f0' }}>
          {/* Translated content */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>{targetMeta.flag}</span>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Adapted Content ({targetMeta.native})</h4>
              {result.confidence && (
                <span style={{
                  marginLeft: 'auto', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800,
                  background: (confidenceColor[result.confidence] || '#94a3b8') + '18',
                  color: confidenceColor[result.confidence] || '#94a3b8',
                }}>{result.confidence} confidence</span>
              )}
            </div>
            <div style={{
              padding: 14, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0',
              fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap',
              direction: targetMeta.dir || 'ltr',
            }}>
              {result.translatedContent}
            </div>
            {result.readingLevel && (
              <div style={{ marginTop: 6, fontSize: 11, color: '#64748b' }}>
                Reading level: <strong>{result.readingLevel}</strong>
              </div>
            )}
          </div>

          {/* Adaptations made */}
          {result.adaptations && result.adaptations.length > 0 && (
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#7c3aed' }}>{'\uD83D\uDD04'} Cultural Adaptations</h4>
              {result.adaptations.map((a, i) => (
                <div key={i} style={{
                  padding: 8, borderRadius: 6, background: '#f5f3ff', marginBottom: 6,
                  fontSize: 12, border: '1px solid #e9d5ff',
                }}>
                  <div style={{ color: '#ef4444', textDecoration: 'line-through', marginBottom: 2 }}>{a.original}</div>
                  <div style={{ color: '#22c55e', fontWeight: 600, marginBottom: 2 }}>{'\u2192'} {a.adapted}</div>
                  <div style={{ color: '#94a3b8', fontSize: 11 }}>{a.reason}</div>
                </div>
              ))}
            </div>
          )}

          {/* Cultural notes */}
          {result.culturalNotes && result.culturalNotes.length > 0 && (
            <div style={{ padding: '14px 20px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#0891b2' }}>{'\uD83D\uDCDD'} Cultural Notes</h4>
              {result.culturalNotes.map((note, i) => (
                <div key={i} style={{
                  fontSize: 12, color: '#1e293b', marginBottom: 4, paddingLeft: 10,
                  borderLeft: '2px solid #06b6d4',
                }}>{note}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {result?.error && (
        <div style={{ padding: 14, margin: 16, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#991b1b' }}>
          {result.error}
        </div>
      )}
    </div>
  );
}
