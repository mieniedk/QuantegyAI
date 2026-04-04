import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import { getClassesByTeacher } from '../utils/storage';
import { showAppToast } from '../utils/appToast';

/* ═══════════════════════════════════════════════════════════════
   CLASSROOM TOOLS — Timer, Random Picker, Noise Meter
   Daily-use tools for teachers
   ═══════════════════════════════════════════════════════════════ */

let _ac;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.15) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
function playAlarm() { [880,0,880,0,880].forEach((f,i) => setTimeout(() => { if (f) tone(f, 0.3, 'square', 0.2); }, i * 300)); }
function playDrum() { tone(100, 0.2, 'sine', 0.3); setTimeout(() => tone(200, 0.1, 'triangle', 0.15), 50); }

export default function ClassroomTools() {
  const [tab, setTab] = useState('timer');

  const tabs = [
    { id: 'timer', label: '⏱️ Timer', desc: 'Countdown & Stopwatch' },
    { id: 'picker', label: '🎲 Random Picker', desc: 'Pick a student' },
    { id: 'noise', label: '🔊 Noise Meter', desc: 'Monitor volume' },
  ];

  return (
    <TeacherLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, color: '#0f172a' }}>🧰 Classroom Tools</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Quick tools for everyday classroom management.</p>
        <p style={{ margin: '10px 0 0', fontSize: 14 }}>
          <Link to="/tools/place-value-lab" style={{ color: '#2563eb', fontWeight: 700 }}>Place value interactive lab</Link>
          <span style={{ color: '#94a3b8' }}> — NCTM-style triangle, base-ten builder, rename, name-collection, 100 chart</span>
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 14 }}>
          <Link to="/tools/commutativity-explorer" style={{ color: '#2563eb', fontWeight: 700 }}>Commutativity explorer</Link>
          <span style={{ color: '#94a3b8' }}> — base-ten addition, multiplication array, subtraction counterexample</span>
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 14 }}>
          <Link to="/tools/gcd-lcm-explorer" style={{ color: '#2563eb', fontWeight: 700 }}>GCD & LCM explorer</Link>
          <span style={{ color: '#94a3b8' }}> — prime factors, Venn diagram, factor and multiple number lines, a × b = GCD × LCM</span>
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 14 }}>
          <Link to="/tools/matrix-transforms-graphics" style={{ color: '#2563eb', fontWeight: 700 }}>Matrix transforms & graphics</Link>
          <span style={{ color: '#94a3b8' }}> — 2D homogeneous matrices: scale, shear, rotation, translation; vertex-style polygon</span>
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{
            padding: '10px 18px', borderRadius: 10, border: tab === t.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
            background: tab === t.id ? 'rgba(37,99,235,0.05)' : '#fff', cursor: 'pointer',
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? '#2563eb' : '#334155',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'timer' && <TimerTool />}
      {tab === 'picker' && <RandomPicker />}
      {tab === 'noise' && <NoiseMeter />}
    </TeacherLayout>
  );
}

/* ── Timer Tool ── */
function TimerTool() {
  const [mode, setMode] = useState('countdown'); // countdown | stopwatch
  const [inputMin, setInputMin] = useState(5);
  const [totalSec, setTotalSec] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  const fmtTime = (s) => {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.abs(s) % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      if (mode === 'countdown') {
        setRemaining(prev => {
          if (prev <= 1) { clearInterval(intervalRef.current); setRunning(false); playAlarm(); return 0; }
          return prev - 1;
        });
      } else {
        setElapsed(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const startCountdown = () => { const secs = inputMin * 60; setTotalSec(secs); setRemaining(secs); setRunning(true); };
  const resetCountdown = () => { setRunning(false); setRemaining(totalSec); };
  const startStopwatch = () => setRunning(true);
  const resetStopwatch = () => { setRunning(false); setElapsed(0); };

  const pct = mode === 'countdown' ? (totalSec > 0 ? (remaining / totalSec) * 100 : 0) : 0;
  const urgentColor = mode === 'countdown' && remaining <= 10 && remaining > 0 ? '#ef4444' : '#2563eb';

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button type="button" onClick={() => { setMode('countdown'); setRunning(false); }} style={pillBtn(mode === 'countdown')}>Countdown</button>
        <button type="button" onClick={() => { setMode('stopwatch'); setRunning(false); }} style={pillBtn(mode === 'stopwatch')}>Stopwatch</button>
      </div>

      {mode === 'countdown' ? (
        <>
          {!running && remaining === totalSec && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[1, 2, 3, 5, 10, 15, 20, 30].map(m => (
                <button key={m} type="button" onClick={() => setInputMin(m)} style={{
                  padding: '8px 14px', borderRadius: 8, border: inputMin === m ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: inputMin === m ? 'rgba(37,99,235,0.08)' : '#fff', cursor: 'pointer',
                  fontSize: 13, fontWeight: inputMin === m ? 800 : 500, color: inputMin === m ? '#2563eb' : '#334155',
                }}>{m} min</button>
              ))}
            </div>
          )}

          {/* Big timer display */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 72, fontWeight: 900, color: urgentColor, fontVariantNumeric: 'tabular-nums', transition: 'color 0.3s' }}>
              {fmtTime(remaining)}
            </div>
            {totalSec > 0 && (
              <div style={{ height: 8, background: '#e2e8f0', borderRadius: 8, marginTop: 12, maxWidth: 400, margin: '12px auto 0' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: urgentColor, borderRadius: 8, transition: 'width 1s linear, background 0.3s' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {!running && remaining === totalSec && (
              <button type="button" onClick={startCountdown} style={actionBtn('#22c55e')}>▶ Start</button>
            )}
            {running && (
              <button type="button" onClick={() => setRunning(false)} style={actionBtn('#eab308')}>⏸ Pause</button>
            )}
            {!running && remaining < totalSec && remaining > 0 && (
              <button type="button" onClick={() => setRunning(true)} style={actionBtn('#22c55e')}>▶ Resume</button>
            )}
            {(remaining < totalSec || remaining === 0) && (
              <button type="button" onClick={resetCountdown} style={actionBtn('#64748b')}>↻ Reset</button>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 72, fontWeight: 900, color: '#2563eb', fontVariantNumeric: 'tabular-nums' }}>
              {fmtTime(elapsed)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {!running ? (
              <button type="button" onClick={startStopwatch} style={actionBtn('#22c55e')}>▶ {elapsed > 0 ? 'Resume' : 'Start'}</button>
            ) : (
              <button type="button" onClick={() => setRunning(false)} style={actionBtn('#eab308')}>⏸ Pause</button>
            )}
            {elapsed > 0 && <button type="button" onClick={resetStopwatch} style={actionBtn('#64748b')}>↻ Reset</button>}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Random Student Picker ── */
function RandomPicker() {
  const username = localStorage.getItem('quantegy-teacher-user');
  const classes = username ? getClassesByTeacher(username) : [];
  const [selectedClass, setSelectedClass] = useState('');
  const [customNames, setCustomNames] = useState('');
  const [picked, setPicked] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState([]);

  const getStudents = () => {
    if (customNames.trim()) return customNames.split('\n').map(s => s.trim()).filter(Boolean);
    const cls = classes.find(c => c.id === selectedClass);
    if (!cls) return [];
    return (cls.students || []).map(s => typeof s === 'string' ? s : s.name || s.id);
  };

  const pickRandom = () => {
    const students = getStudents();
    if (students.length === 0) return;
    setSpinning(true);
    setPicked(null);

    let count = 0;
    const interval = setInterval(() => {
      setPicked(students[Math.floor(Math.random() * students.length)]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        const final = students[Math.floor(Math.random() * students.length)];
        setPicked(final);
        setHistory(prev => [final, ...prev.slice(0, 9)]);
        setSpinning(false);
        playDrum();
      }
    }, 80);
  };

  const students = getStudents();

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#0f172a' }}>🎲 Random Student Picker</h3>

      {/* Source selection */}
      <div style={{ marginBottom: 16 }}>
        {classes.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Pick from a class:</label>
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setCustomNames(''); }} style={{ ...selectStyle, width: '100%' }}>
              <option value="">-- Choose a class --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({(c.students || []).length} students)</option>)}
            </select>
          </div>
        )}
        <div>
          <label style={labelStyle}>Or type names (one per line):</label>
          <textarea value={customNames} onChange={e => { setCustomNames(e.target.value); setSelectedClass(''); }}
            rows={4} placeholder="Alice&#10;Bob&#10;Charlie&#10;Diana"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
        </div>
      </div>

      {/* Picker display */}
      <div style={{
        textAlign: 'center', padding: '32px 20px', background: picked ? 'linear-gradient(135deg,#1e3a8a,#1e1b4b)' : '#f8fafc',
        borderRadius: 16, marginBottom: 16, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s',
      }}>
        {picked ? (
          <div style={{ animation: spinning ? 'none' : 'popIn 0.3s ease' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{picked}</div>
            {!spinning && <div style={{ fontSize: 13, color: '#93c5fd', marginTop: 8 }}>🎉 Selected!</div>}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 14 }}>
            {students.length > 0 ? `${students.length} students ready` : 'Add students above'}
          </div>
        )}
      </div>

      <button type="button" onClick={pickRandom} disabled={students.length === 0 || spinning} style={{
        ...actionBtnFull('#2563eb'), opacity: students.length === 0 || spinning ? 0.4 : 1,
      }}>
        🎲 {spinning ? 'Picking...' : 'Pick a Student'}
      </button>

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Previously picked:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {history.map((name, i) => (
              <span key={i} style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: 6, fontSize: 12, color: '#334155' }}>{name}</span>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes popIn { 0%{transform:scale(0.5);opacity:0} 100%{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
}

/* ── Noise Meter ── */
function NoiseMeter() {
  const [level, setLevel] = useState(0);
  const [active, setActive] = useState(false);
  const [threshold, setThreshold] = useState(60);
  const [warning, setWarning] = useState(false);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setActive(true);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setLevel(normalized);
        setWarning(normalized > threshold);
        rafRef.current = requestAnimationFrame(update);
      };
      update();
    } catch (e) {
      showAppToast('Microphone access is needed for the noise meter. Please allow microphone permission.', { type: 'warning' });
    }
  }, [threshold]);

  const stopListening = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(rafRef.current);
    setActive(false);
    setLevel(0);
    setWarning(false);
  }, []);

  useEffect(() => () => { stopListening(); }, [stopListening]);

  const barColor = level > threshold ? '#ef4444' : level > threshold * 0.6 ? '#eab308' : '#22c55e';
  const emoji = level > threshold ? '🔴' : level > threshold * 0.6 ? '🟡' : '🟢';

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#0f172a' }}>🔊 Noise Meter</h3>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
        Uses your device's microphone to monitor classroom noise levels. Set a threshold to show warnings.
      </p>

      {/* Level display */}
      <div style={{
        textAlign: 'center', padding: '24px 20px',
        background: warning ? 'rgba(239,68,68,0.05)' : '#f8fafc',
        borderRadius: 16, marginBottom: 16, border: warning ? '2px solid #ef4444' : '1px solid #e2e8f0',
        transition: 'all 0.3s',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{emoji}</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: barColor, fontVariantNumeric: 'tabular-nums' }}>{level}%</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{warning ? '⚠️ Too loud!' : 'Noise level OK'}</div>

        {/* Bar */}
        <div style={{ height: 16, background: '#e2e8f0', borderRadius: 10, marginTop: 16, position: 'relative', maxWidth: 400, margin: '16px auto 0' }}>
          <div style={{ height: '100%', width: `${level}%`, background: barColor, borderRadius: 10, transition: 'width 0.1s, background 0.3s' }} />
          <div style={{ position: 'absolute', left: `${threshold}%`, top: -4, bottom: -4, width: 2, background: '#ef4444', borderRadius: 2 }} />
        </div>
      </div>

      {/* Threshold */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Warning Threshold: {threshold}%</label>
        <input type="range" min={20} max={90} value={threshold} onChange={e => setThreshold(Number(e.target.value))}
          style={{ width: '100%' }} />
      </div>

      <button type="button" onClick={active ? stopListening : startListening} style={actionBtnFull(active ? '#ef4444' : '#22c55e')}>
        {active ? '⏹ Stop Listening' : '🎤 Start Listening'}
      </button>
    </div>
  );
}

/* ── Shared styles ── */
const cardStyle = { background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', maxWidth: 600 };
const labelStyle = { fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 };
const selectStyle = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff' };
function actionBtn(bg) { return { padding: '10px 20px', background: bg, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }; }
function actionBtnFull(bg) { return { ...actionBtn(bg), width: '100%' }; }
function pillBtn(active) { return { padding: '8px 16px', borderRadius: 20, border: active ? '2px solid #2563eb' : '1px solid #e2e8f0', background: active ? 'rgba(37,99,235,0.05)' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#2563eb' : '#334155' }; }
