import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverSaveProfile } from '../utils/storage';
import { TEKS_GRADES } from '../data/teks';
import { showAppToast } from '../utils/appToast';

const STATES = [
  { id: 'TX', label: 'Texas', framework: 'TEKS' },
  { id: 'CA', label: 'California', framework: 'Common Core (coming soon)' },
  { id: 'NY', label: 'New York', framework: 'Common Core (coming soon)' },
  { id: 'FL', label: 'Florida', framework: 'B.E.S.T. (coming soon)' },
  { id: 'OTHER', label: 'Other State', framework: 'Common Core (coming soon)' },
];

const TeacherOnboarding = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('quantegy-teacher-user');
  const [step, setStep] = useState(1);
  const [schoolName, setSchoolName] = useState('');
  const [state, setState] = useState('TX');
  const [grades, setGrades] = useState([]);

  const toggleGrade = (id) => {
    setGrades((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

  const handleComplete = async () => {
    if (!username) return;
    await serverSaveProfile(username, {
      schoolName,
      state,
      grades,
      onboarded: true,
    });
    navigate('/teacher-dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', fontFamily: 'system-ui, sans-serif',
      padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px 36px', maxWidth: 520, width: '100%',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
      }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: s <= step ? '#2563eb' : '#e2e8f0',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
          Step {step} of 3
        </p>

        {/* Step 1: State */}
        {step === 1 && (
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 24 }}>Welcome, {username}!</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Let's set up your profile so we can align everything to your state's standards.
            </p>
            <label style={labelStyle}>What state do you teach in?</label>
            <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              {STATES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setState(s.id)}
                  style={{
                    padding: '14px 18px', borderRadius: 10, cursor: 'pointer',
                    border: state === s.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: state === s.id ? '#eff6ff' : '#fff',
                    textAlign: 'left', fontSize: 14, fontWeight: 600,
                    color: s.id === 'TX' ? '#0f172a' : '#94a3b8',
                    transition: 'all 0.15s',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                  disabled={s.id !== 'TX'}
                >
                  <span>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 400 }}>{s.framework}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setStep(2)} style={nextBtnStyle}>
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Grade levels */}
        {step === 2 && (
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 24 }}>Grade Level(s)</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Select the grade levels you teach. This sets your default standards filter.
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              {TEKS_GRADES.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGrade(g.id)}
                  style={{
                    padding: '16px 18px', borderRadius: 10, cursor: 'pointer',
                    border: grades.includes(g.id) ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: grades.includes(g.id) ? '#eff6ff' : '#fff',
                    textAlign: 'left', fontSize: 15, fontWeight: 600, color: '#0f172a',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: 5,
                    border: grades.includes(g.id) ? '2px solid #2563eb' : '2px solid #cbd5e1',
                    background: grades.includes(g.id) ? '#2563eb' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0,
                  }}>
                    {grades.includes(g.id) && '\u2713'}
                  </span>
                  <div>
                    <span style={{ display: 'block' }}>{g.label}</span>
                    <span style={{ display: 'block', fontSize: 12, color: '#64748b', fontWeight: 400 }}>{g.subject}</span>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setStep(1)} style={backBtnStyle}>Back</button>
              <button
                type="button"
                onClick={() => {
                  if (grades.length > 0) setStep(3);
                  else showAppToast('Select at least one grade level', { type: 'warning' });
                }}
                style={nextBtnStyle}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: School name */}
        {step === 3 && (
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 24 }}>School Info</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Optional: enter your school name so we can personalize your experience.
            </p>
            <label style={labelStyle}>School Name</label>
            <input
              type="text"
              placeholder="e.g. Lincoln Elementary"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', fontSize: 15, borderRadius: 8,
                border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box',
                marginTop: 6,
              }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" onClick={() => setStep(2)} style={backBtnStyle}>Back</button>
              <button type="button" onClick={handleComplete} style={nextBtnStyle}>
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4,
};

const nextBtnStyle = {
  flex: 1, padding: '14px 0', background: '#2563eb', color: '#fff',
  border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
  cursor: 'pointer', marginTop: 24, transition: 'background 0.2s',
};

const backBtnStyle = {
  padding: '14px 24px', background: '#f1f5f9', color: '#475569',
  border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 15, fontWeight: 600,
  cursor: 'pointer', marginTop: 24,
};

export default TeacherOnboarding;
