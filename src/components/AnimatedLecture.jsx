import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import qbotImg from '../assets/qbot.svg';
import { formatMathHtml, speechifyForNarration } from '../utils/mathFormat';
import { sanitizeHtml } from '../utils/sanitize';

/**
 * AnimatedLecture – Single-slide “video micro-lesson”: one quick tip or key concept,
 * optional TTS, text reveal, and playback controls. No multi-slide narration.
 *
 * Props:
 *   lecture    – { title, teks, objective, keyIdea, tip, ... }
 *   compName  – Optional competency/domain display name
 *   onDone    – Called when the student finishes (clicks Continue)
 *   variant   – 'intro' | 'deep-dive' (badge label only)
 */

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const MS_PER_CHAR = 55;
const MIN_SLIDE_MS = 4000;
const MAX_SLIDE_MS = 18000;
const NARRATION_WPM = 155;
const MAX_NARRATION_MS = 45000;
const NARRATION_BUFFER_MS = 1200;

function slideDuration(text, speed) {
  const raw = Math.max(MIN_SLIDE_MS, Math.min(MAX_SLIDE_MS, text.length * MS_PER_CHAR));
  return raw / speed;
}

function narrationDuration(text, speed) {
  const words = (String(text || '').trim().match(/\S+/g) || []).length;
  if (!words) return MIN_SLIDE_MS;
  const clampedSpeed = Math.max(0.5, Number(speed) || 1);
  const spokenMs = ((words / NARRATION_WPM) * 60000) / clampedSpeed;
  return Math.min(MAX_NARRATION_MS, Math.max(MIN_SLIDE_MS, spokenMs + NARRATION_BUFFER_MS));
}

function buildSlides(lecture, variant) {
  const title = lecture.title || 'Micro-Lesson';
  const tip = (lecture.tip || '').trim();
  const keyIdea = (lecture.keyIdea || '').trim();
  const objective = (lecture.objective || '').trim();
  const stepFocus = (lecture.steps?.[0]?.content || '').trim();
  const exampleFocus = [
    (lecture.example?.problem || '').trim(),
    (lecture.example?.answer || '').trim(),
  ].filter(Boolean).join(' \u2192 ');

  // Keep one-slide format and always anchor to the same first-slide (Video A) idea.
  const introBody = keyIdea || objective || tip || stepFocus || exampleFocus || `Let\u2019s focus on ${title}.`;
  const body = introBody;

  return [{
    id: 'quick-tip',
    badge: variant === 'deep-dive' ? 'Deep dive' : 'Quick tip',
    heading: title,
    body,
    accent: '#0ea5e6',
    icon: '\uD83D\uDCA1',
  }];
}

export default function AnimatedLecture({ lecture, compName, onDone, variant = 'intro' }) {
  const slides = useMemo(() => (lecture ? buildSlides(lecture, variant) : []), [lecture, variant]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [textReveal, setTextReveal] = useState(0);
  const [muted, setMuted] = useState(true);
  const timerRef = useRef(null);
  const startRef = useRef(Date.now());

  const slide = slides[idx] || slides[0];
  const total = slides.length;
  const isLast = idx === total - 1;

  const cancelTTS = useCallback(() => {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback((text, spd) => {
    cancelTTS();
    if (typeof speechSynthesis === 'undefined') return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = spd;
    utter.pitch = 1;
    utter.volume = 0.8;
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(v => /samantha|google.*us|microsoft.*mark|zira/i.test(v.name));
    if (preferred) utter.voice = preferred;
    speechSynthesis.speak(utter);
  }, [cancelTTS]);

  const goSlide = useCallback((i, autoplay = true) => {
    if (timerRef.current) clearInterval(timerRef.current);
    cancelTTS();
    const clamped = Math.max(0, Math.min(total - 1, i));
    setIdx(clamped);
    setProgress(0);
    setTextReveal(0);
    startRef.current = Date.now();
    if (autoplay) setPlaying(true);
  }, [total, cancelTTS]);

  useEffect(() => {
    if (!slide || !playing) return;

    const baseDur = slideDuration(slide.body || '', speed);
    const bodyLen = (slide.body || '').length;
    startRef.current = Date.now();

    const shouldNarrate = slide.isSummary || !muted;
    const narrationRaw = slide.isSummary && slide.body
      ? slide.body.split('\n\n')[0]
      : (slide.body || slide.heading);
    const narrationText = speechifyForNarration(String(narrationRaw || ''));
    const dur = shouldNarrate
      ? Math.max(baseDur, narrationDuration(narrationText, speed))
      : baseDur;
    if (shouldNarrate) {
      speak(narrationText, speed);
    }

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min(1, elapsed / dur);
      setProgress(pct);
      setTextReveal(Math.min(bodyLen, Math.floor(pct * bodyLen * 1.3)));
      if (pct >= 1) {
        clearInterval(timerRef.current);
        if (!isLast) {
          goSlide(idx + 1);
        } else {
          setPlaying(false);
        }
      }
    }, 60);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [idx, playing, speed, slide, isLast, goSlide, speak, muted]);

  useEffect(() => () => cancelTTS(), [cancelTTS]);

  const toggleMute = useCallback(() => {
    setMuted(m => {
      if (!m) cancelTTS();
      return !m;
    });
  }, [cancelTTS]);

  const togglePlay = useCallback(() => {
    setPlaying(p => {
      if (p) {
        cancelTTS();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      return !p;
    });
  }, [cancelTTS]);

  const cycleSpeed = useCallback(() => {
    setSpeed(s => {
      const i = SPEEDS.indexOf(s);
      return SPEEDS[(i + 1) % SPEEDS.length];
    });
  }, []);

  if (!lecture || slides.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
        Lecture content is loading...
      </div>
    );
  }

  const globalPct = ((idx + progress) / total) * 100;
  const revealedText = (slide.body || '').slice(0, textReveal || (slide.body || '').length);
  const bodyFull = slide.body || '';

  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden', background: '#0f172a',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Top progress bar */}
      <div style={{ height: 4, background: '#1e293b' }}>
        <div style={{
          height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          width: `${globalPct}%`, transition: 'width 0.1s linear', borderRadius: '0 2px 2px 0',
        }} />
      </div>

      {/* Slide area */}
      <div style={{ padding: '28px 28px 20px', minHeight: 280, display: 'flex', flexDirection: 'column' }}>
        {/* Badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: slide.isStep || slide.isSolution ? 18 : 20, fontWeight: 800, color: '#fff',
            boxShadow: `0 4px 14px ${slide.accent}44`,
            border: '2px solid rgba(255,255,255,0.15)',
          }}>
            {slide.isStep || slide.isSolution ? slide.icon : (
              <img src={qbotImg} alt="" style={{ width: 28 }} />
            )}
          </div>
          <div>
            <span style={{
              padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800,
              background: `${slide.accent}22`, color: slide.accent, letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
              {slide.badge}
            </span>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#475569' }}>
            {idx + 1} / {total}
          </span>
        </div>

        {/* Heading */}
        <h3 style={{
          margin: '0 0 14px', fontSize: 22, fontWeight: 800, color: '#f1f5f9',
          lineHeight: 1.3, animation: 'slideIn 0.35s ease-out',
        }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(slide.heading)) }}
        />

        {/* Body text with reveal effect */}
        <div style={{ flex: 1 }}>
          <p style={{
            margin: 0, fontSize: 17, lineHeight: 1.8, color: '#cbd5e1',
            whiteSpace: 'pre-wrap', fontWeight: 500,
          }}>
            <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(revealedText)) }} />
            <span style={{ color: '#334155' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(bodyFull.slice(revealedText.length))) }} />
            {playing && revealedText.length < bodyFull.length && (
              <span style={{ animation: 'blink 0.8s step-end infinite', color: slide.accent }}>|</span>
            )}
          </p>

          {/* Answer highlight on the worked example slide */}
          {slide.hasAnswer && slide.answer && (
            <div style={{
              marginTop: 16, padding: '14px 18px', borderRadius: 12,
              background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#4ade80' }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(slide.answer)) }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Controls bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 20px 16px', borderTop: '1px solid #1e293b',
        background: '#0f172a',
      }}>
        {/* Prev */}
        <button type="button" onClick={() => goSlide(idx - 1)} disabled={idx === 0}
          style={{ ...ctrlBtn, opacity: idx === 0 ? 0.3 : 1 }} aria-label="Previous slide">
          {'\u23EE'}
        </button>

        {/* Play / Pause */}
        <button type="button" onClick={togglePlay} style={{ ...ctrlBtn, fontSize: 22, width: 44, height: 44 }}
          aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? '\u23F8' : '\u25B6\uFE0F'}
        </button>

        {/* Next */}
        <button type="button" onClick={() => goSlide(idx + 1)} disabled={isLast}
          style={{ ...ctrlBtn, opacity: isLast ? 0.3 : 1 }} aria-label="Next slide">
          {'\u23ED'}
        </button>

        {/* Slide scrubber */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, margin: '0 4px' }}>
          <input
            type="range" min={0} max={total - 1} value={idx}
            onChange={e => goSlide(Number(e.target.value), false)}
            style={{ flex: 1, accentColor: '#3b82f6', cursor: 'pointer' }}
            aria-label="Slide scrubber"
          />
        </div>

        {/* Speed */}
        <button type="button" onClick={cycleSpeed}
          style={{
            ...ctrlBtn, fontSize: 11, fontWeight: 800, width: 'auto', padding: '0 10px',
            fontFamily: 'monospace',
          }}
          aria-label={`Playback speed ${speed}x`}>
          {speed}x
        </button>

        {/* Narration toggle */}
        <button type="button" onClick={toggleMute}
          style={{
            ...ctrlBtn,
            background: muted ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.25)',
            border: muted ? 'none' : '1px solid rgba(59,130,246,0.4)',
          }}
          aria-label={muted ? 'Turn on narration' : 'Mute narration'}
          title={muted ? 'Turn on narration' : 'Mute narration'}>
          {muted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}
        </button>

        {/* Replay */}
        <button type="button" onClick={() => goSlide(0)}
          style={ctrlBtn} aria-label="Replay from start">
          {'\uD83D\uDD01'}
        </button>

        {/* Continue (visible on last slide) */}
        {isLast && onDone && (
          <button type="button" onClick={onDone} style={{
            padding: '8px 18px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff',
            fontWeight: 800, fontSize: 13, cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(5,150,105,0.4)',
          }}>
            Continue {'\u2192'}
          </button>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

const ctrlBtn = {
  width: 36, height: 36, borderRadius: '50%', border: 'none',
  background: 'rgba(255,255,255,0.08)', color: '#cbd5e1',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 16, transition: 'background 0.15s',
  flexShrink: 0,
};
