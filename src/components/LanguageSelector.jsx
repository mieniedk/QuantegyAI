/**
 * Global Language Selector — Dropdown with search, flags, regional grouping,
 * and AI auto-translate for missing strings.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LANGUAGES, getRegions, getLangMeta, translations,
  cacheAITranslation, getAITranslationCache,
} from '../utils/translations';

export default function LanguageSelector({ compact = false }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [translating, setTranslating] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = getLangMeta(lang);
  const regions = getRegions();

  const filtered = search.trim()
    ? LANGUAGES.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.native.toLowerCase().includes(search.toLowerCase()) ||
        l.code.toLowerCase().includes(search.toLowerCase())
      )
    : LANGUAGES;

  const grouped = regions.map((region) => ({
    region,
    langs: filtered.filter((l) => l.region === region),
  })).filter((g) => g.langs.length > 0);

  const handleSelect = useCallback(async (code) => {
    setLang(code);
    setOpen(false);
    setSearch('');

    // Check if we need AI translation for missing keys
    const enKeys = Object.keys(translations.en || {});
    const existing = translations[code] || {};
    const cache = getAITranslationCache();
    const cached = cache[code] || {};
    const missing = enKeys.filter((k) => !existing[k] && !cached[k]);

    if (missing.length > 0 && missing.length < 80) {
      setTranslating(true);
      try {
        const meta = getLangMeta(code);
        const stringsToTranslate = {};
        missing.forEach((k) => { stringsToTranslate[k] = translations.en[k]; });

        const resp = await fetch('/api/auto-translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            strings: stringsToTranslate,
            targetLang: code,
            targetLangName: meta.name,
            context: 'educational math platform',
          }),
        });
        const data = await resp.json();
        if (data.translations) {
          Object.entries(data.translations).forEach(([key, val]) => {
            cacheAITranslation(code, key, val);
          });
          // Force re-render by toggling language
          setLang('en');
          setTimeout(() => setLang(code), 50);
        }
      } catch (err) {
        console.warn('Translation failed:', err);
      }
      setTranslating(false);
    }
  }, [setLang]);

  if (compact) {
    return (
      <div ref={dropRef} style={{ position: 'relative' }}>
        <button type="button" onClick={() => setOpen(!open)}
          aria-expanded={open} aria-haspopup="listbox" aria-label={`Language: ${current.native}. Click to change.`}
          style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
          borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#475569',
        }}>
          <span aria-hidden="true">{current.flag}</span>
          <span>{current.code.toUpperCase()}</span>
          <span style={{ fontSize: 8, marginLeft: 2 }} aria-hidden="true">{open ? '\u25B2' : '\u25BC'}</span>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 4,
            width: 280, maxHeight: 400, overflowY: 'auto',
            background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 9999,
          }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchLanguages')} autoFocus
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
                  fontSize: 12, boxSizing: 'border-box',
                }}
              />
            </div>

            {translating && (
              <div style={{ padding: '8px 12px', background: '#f0f9ff', fontSize: 11, color: '#0284c7', fontWeight: 600, textAlign: 'center' }}>
                {'\u2728'} AI translating interface...
              </div>
            )}

            {grouped.map((group) => (
              <div key={group.region}>
                <div style={{
                  padding: '6px 12px', fontSize: 10, fontWeight: 800, color: '#94a3b8',
                  textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f8fafc',
                }}>{group.region}</div>
                {group.langs.map((l) => (
                  <button key={l.code} type="button" onClick={() => handleSelect(l.code)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px',
                    border: 'none', background: l.code === lang ? '#eff6ff' : 'transparent',
                    cursor: 'pointer', fontSize: 13, textAlign: 'left',
                  }}>
                    <span style={{ fontSize: 16 }}>{l.flag}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: l.code === lang ? '#2563eb' : '#0f172a' }}>{l.native}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{l.name}</div>
                    </div>
                    {l.code === lang && <span style={{ fontSize: 12, color: '#2563eb' }}>{'\u2713'}</span>}
                    {l.dir === 'rtl' && <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>RTL</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full-size selector (for settings pages, etc.)
  return (
    <div ref={dropRef} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(!open)}
        aria-expanded={open} aria-haspopup="listbox" aria-label={`Language: ${current.native}. Click to change.`}
        style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
        borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
        fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#0f172a',
      }}>
        <span style={{ fontSize: 18 }} aria-hidden="true">{current.flag}</span>
        <span>{current.native}</span>
        <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }} aria-hidden="true">{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          width: 320, maxHeight: 420, overflowY: 'auto',
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 9999,
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchLanguages')} autoFocus
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
                fontSize: 13, boxSizing: 'border-box',
              }}
            />
          </div>

          {translating && (
            <div style={{ padding: '10px 14px', background: '#f0f9ff', fontSize: 12, color: '#0284c7', fontWeight: 600, textAlign: 'center' }}>
              {'\u2728'} AI is translating the interface to {getLangMeta(lang).native}...
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.region}>
              <div style={{
                padding: '8px 14px', fontSize: 10, fontWeight: 800, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.06em', background: '#f8fafc',
              }}>{group.region}</div>
              {group.langs.map((l) => (
                <button key={l.code} type="button" onClick={() => handleSelect(l.code)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px',
                  border: 'none', background: l.code === lang ? '#eff6ff' : 'transparent',
                  cursor: 'pointer', fontSize: 14, textAlign: 'left',
                }}>
                  <span style={{ fontSize: 20 }}>{l.flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: l.code === lang ? '#2563eb' : '#0f172a' }}>{l.native}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{l.name}</div>
                  </div>
                  {l.code === lang && <span style={{ color: '#2563eb', fontWeight: 700 }}>{'\u2713'}</span>}
                  {l.dir === 'rtl' && <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 3, background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>RTL</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

LanguageSelector.propTypes = {
  compact: PropTypes.bool,
};
