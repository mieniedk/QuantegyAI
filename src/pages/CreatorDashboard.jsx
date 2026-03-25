import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getTeacherCourses, addMarketplaceCourse, updateMarketplaceCourse,
  getTeacherTransactions, getAffiliatesByOwner, createAffiliateLink,
  getCertificatesByTeacher, issueCertificate, getClassesByTeacher,
} from '../utils/storage';
import RichTextEditor from '../components/RichTextEditor';

const CreatorDashboard = () => {
  const username = localStorage.getItem('quantegy-teacher-user');
  const [tab, setTab] = useState('revenue');
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', price: 0, category: 'Math', priceModel: 'one-time' });
  const [certForm, setCertForm] = useState({ studentName: '', studentId: '', courseName: '', grade: '' });
  const [refresh, setRefresh] = useState(0);

  const courses = useMemo(() => getTeacherCourses(username), [username, refresh]);
  const transactions = useMemo(() => getTeacherTransactions(username), [username, refresh]);
  const affiliates = useMemo(() => getAffiliatesByOwner(username), [username, refresh]);
  const certificates = useMemo(() => getCertificatesByTeacher(username), [username, refresh]);
  const classes = useMemo(() => getClassesByTeacher(username), [username]);

  // Revenue calculations
  const totalRevenue = transactions.reduce((s, t) => s + (t.sellerEarning || 0), 0);
  const totalPlatformFees = transactions.reduce((s, t) => s + (t.platformFee || 0), 0);
  const totalGross = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyRevenue = thisMonth.reduce((s, t) => s + (t.sellerEarning || 0), 0);
  const totalEnrollments = courses.reduce((s, c) => s + (c.enrollments || 0), 0);
  const affiliateEarnings = affiliates.reduce((s, a) => s + (a.earned || 0), 0);
  const totalClicks = affiliates.reduce((s, a) => s + (a.clicks || 0), 0);
  const totalConversions = affiliates.reduce((s, a) => s + (a.conversions || 0), 0);

  const handleCreateCourse = () => {
    if (!newCourse.title.trim()) return;
    addMarketplaceCourse({ ...newCourse, teacher: username });
    setNewCourse({ title: '', description: '', price: 0, category: 'Math', priceModel: 'one-time' });
    setShowNewCourse(false);
    setRefresh((r) => r + 1);
  };

  const togglePublish = (courseId, published) => {
    updateMarketplaceCourse(courseId, { published: !published });
    setRefresh((r) => r + 1);
  };

  const handleCreateAffiliate = (courseId) => {
    createAffiliateLink(username, courseId);
    setRefresh((r) => r + 1);
  };

  const handleIssueCert = () => {
    if (!certForm.studentName || !certForm.courseName) return;
    issueCertificate({
      studentId: certForm.studentId || `student-${Date.now()}`,
      studentName: certForm.studentName,
      courseName: certForm.courseName,
      grade: certForm.grade,
      issuer: username,
      issuerName: username,
    });
    setCertForm({ studentName: '', studentId: '', courseName: '', grade: '' });
    setRefresh((r) => r + 1);
  };

  const tabs = [
    { id: 'revenue', label: 'Revenue', icon: '\uD83D\uDCB0' },
    { id: 'courses', label: 'My Courses', icon: '\uD83D\uDCDA' },
    { id: 'affiliates', label: 'Affiliates', icon: '\uD83D\uDD17' },
    { id: 'certificates', label: 'Certificates', icon: '\uD83C\uDF93' },
    { id: 'transactions', label: 'Transactions', icon: '\uD83D\uDCC3' },
  ];

  if (!username) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#0f172a' }}>Sign in to access Creator Dashboard</h2>
          <Link to="/teacher" style={{ color: '#2563eb', fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '32px 24px 24px', color: '#fff',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 800 }}>QuantegyAI</Link>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/marketplace" style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Marketplace</Link>
              <Link to="/teacher-dashboard" style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Teaching</Link>
            </div>
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Creator Dashboard</h1>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>Manage courses, track revenue, and grow your audience.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 60px' }}>
        {/* Stats hero */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, color: '#22c55e', bg: '#f0fdf4' },
            { label: 'This Month', value: `$${monthlyRevenue.toFixed(2)}`, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Enrollments', value: totalEnrollments, color: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Courses', value: courses.length, color: '#0891b2', bg: '#ecfeff' },
            { label: 'Platform Fees', value: `$${totalPlatformFees.toFixed(2)}`, color: '#94a3b8', bg: '#f8fafc' },
            { label: 'Affiliate Earnings', value: `$${affiliateEarnings.toFixed(2)}`, color: '#d97706', bg: '#fffbeb' },
          ].map((s) => (
            <div key={s.label} style={{
              padding: 16, borderRadius: 12, background: s.bg, border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{
              padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              border: tab === t.id ? '2px solid #1e293b' : '1px solid #e2e8f0',
              background: tab === t.id ? '#0f172a' : '#fff',
              color: tab === t.id ? '#fff' : '#475569',
              display: 'flex', alignItems: 'center', gap: 6,
            }}><span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}</button>
          ))}
        </div>

        {/* ═══ REVENUE TAB ═══ */}
        {tab === 'revenue' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Revenue Analytics</h3>

            {/* Commission breakdown */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#475569' }}>Commission Structure</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div style={{ padding: 16, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>85%</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46' }}>Creator Earnings</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>You keep 85% of every sale</div>
                </div>
                <div style={{ padding: 16, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#94a3b8' }}>15%</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Platform Fee</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Payment processing & hosting</div>
                </div>
                <div style={{ padding: 16, borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#d97706' }}>10%</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Affiliate Commission</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Paid from platform share</div>
                </div>
              </div>
            </div>

            {/* Per-course revenue */}
            <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#475569' }}>Revenue by Course</h4>
            {courses.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No courses yet. Create your first course to start earning.</p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {courses.map((c) => {
                  const courseTxns = transactions.filter((t) => t.courseId === c.id);
                  const courseRev = courseTxns.reduce((s, t) => s + (t.sellerEarning || 0), 0);
                  return (
                    <div key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                      borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{c.title}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{c.enrollments || 0} enrolled · ${c.price || 0} each</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: '#22c55e' }}>${courseRev.toFixed(2)}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>net revenue</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ MY COURSES TAB ═══ */}
        {tab === 'courses' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>My Courses</h3>
              <button type="button" onClick={() => setShowNewCourse(true)} style={{
                padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
                background: '#7c3aed', color: '#fff', cursor: 'pointer',
              }}>+ New Course</button>
            </div>

            {showNewCourse && (
              <div style={{ padding: 20, borderRadius: 12, background: '#f5f3ff', border: '1px solid #e9d5ff', marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#6d28d9' }}>Create Micro-Course</h4>
                <div style={{ display: 'grid', gap: 10 }}>
                  <input value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="Course title"
                    style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} />
                  <RichTextEditor value={newCourse.description} onChange={(val) => setNewCourse({ ...newCourse, description: val })} placeholder="Course description..." compact minHeight={60} />
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <select value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                      style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                      {['Math', 'Reading', 'Science', 'STAAR Prep', 'TExES Prep', 'Test Strategy', 'Professional Dev'].map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <select value={newCourse.priceModel} onChange={(e) => setNewCourse({ ...newCourse, priceModel: e.target.value })}
                      style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                      <option value="one-time">One-Time Purchase</option>
                      <option value="subscription">Monthly Subscription</option>
                      <option value="free">Free</option>
                    </select>
                    {newCourse.priceModel !== 'free' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontWeight: 700, color: '#475569' }}>$</span>
                        <input type="number" min="0" step="1" value={newCourse.price}
                          onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
                          style={{ width: 80, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={handleCreateCourse} style={{
                      padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, background: '#7c3aed', color: '#fff', cursor: 'pointer',
                    }}>Create Course</button>
                    <button type="button" onClick={() => setShowNewCourse(false)} style={{
                      padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600, background: '#fff', color: '#475569', cursor: 'pointer',
                    }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: 10 }}>
              {courses.map((c) => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                  borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {c.category} · ${c.price || 0}{c.priceModel === 'subscription' ? '/mo' : ''} · {c.enrollments || 0} enrolled
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: c.published ? '#dcfce7' : '#fef9c3',
                    color: c.published ? '#166534' : '#854d0e',
                  }}>{c.published ? 'Published' : 'Draft'}</span>
                  <button type="button" onClick={() => togglePublish(c.id, c.published)} style={{
                    padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600,
                    background: '#fff', color: '#475569', cursor: 'pointer',
                  }}>{c.published ? 'Unpublish' : 'Publish'}</button>
                </div>
              ))}
              {courses.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>No courses created yet.</p>}
            </div>
          </div>
        )}

        {/* ═══ AFFILIATES TAB ═══ */}
        {tab === 'affiliates' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>Affiliate Program</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Create referral links for your courses. Affiliates earn 10% commission on every sale.
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 14, borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706' }}>{totalClicks}</div>
                <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>Total Clicks</div>
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>{totalConversions}</div>
                <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>Conversions</div>
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>${affiliateEarnings.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 600 }}>Earnings</div>
              </div>
            </div>

            {/* Generate links */}
            {courses.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#475569' }}>Generate Affiliate Link</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {courses.filter((c) => c.published).map((c) => (
                    <button key={c.id} type="button" onClick={() => handleCreateAffiliate(c.id)} style={{
                      padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600,
                      background: '#fff', color: '#475569', cursor: 'pointer',
                    }}>{'\uD83D\uDD17'} {c.title}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Active links */}
            <div style={{ display: 'grid', gap: 8 }}>
              {affiliates.map((a) => {
                const course = courses.find((c) => c.id === a.courseId);
                return (
                  <div key={a.id} style={{
                    padding: '12px 16px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{course?.title || 'Unknown Course'}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>${a.earned?.toFixed(2) || '0.00'} earned</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <code style={{
                        flex: 1, padding: '6px 10px', borderRadius: 6, background: '#fff', border: '1px solid #e2e8f0',
                        fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{a.url}</code>
                      <button type="button" onClick={() => navigator.clipboard?.writeText(a.url)} style={{
                        padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11,
                        fontWeight: 600, background: '#fff', color: '#475569', cursor: 'pointer',
                      }}>Copy</button>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                      {a.clicks || 0} clicks · {a.conversions || 0} conversions · {a.commissionRate * 100}% rate
                    </div>
                  </div>
                );
              })}
              {affiliates.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 16 }}>No affiliate links yet. Create one for any published course.</p>}
            </div>
          </div>
        )}

        {/* ═══ CERTIFICATES TAB ═══ */}
        {tab === 'certificates' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>Certificate Management</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Issue verifiable certificates. Each includes a unique verification link.
            </p>

            {/* Issue form */}
            <div style={{ padding: 16, borderRadius: 12, background: '#f5f3ff', border: '1px solid #e9d5ff', marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#6d28d9' }}>Issue New Certificate</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input value={certForm.studentName} onChange={(e) => setCertForm({ ...certForm, studentName: e.target.value })}
                  placeholder="Student name" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <input value={certForm.studentId} onChange={(e) => setCertForm({ ...certForm, studentId: e.target.value })}
                  placeholder="Student ID (optional)" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <select value={certForm.courseName} onChange={(e) => setCertForm({ ...certForm, courseName: e.target.value })}
                  style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                  <option value="">Select course or class...</option>
                  {courses.map((c) => <option key={c.id} value={c.title}>{c.title} (Course)</option>)}
                  {classes.map((c) => <option key={c.id} value={c.name}>{c.name} (Class)</option>)}
                </select>
                <input value={certForm.grade} onChange={(e) => setCertForm({ ...certForm, grade: e.target.value })}
                  placeholder="Grade/Score (optional)" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              </div>
              <button type="button" onClick={handleIssueCert} disabled={!certForm.studentName || !certForm.courseName} style={{
                marginTop: 10, padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
                background: certForm.studentName && certForm.courseName ? '#6d28d9' : '#94a3b8', color: '#fff', cursor: 'pointer',
              }}>Issue Certificate</button>
            </div>

            {/* Issued certs */}
            <div style={{ display: 'grid', gap: 8 }}>
              {certificates.map((cert) => (
                <div key={cert.id} style={{
                  padding: '14px 18px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{ fontSize: 28 }}>{'\uD83C\uDF93'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{cert.studentName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{cert.courseName}{cert.grade ? ` · Grade: ${cert.grade}` : ''}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Issued {new Date(cert.issuedAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <code style={{
                      display: 'block', padding: '4px 8px', borderRadius: 4, background: '#fff', border: '1px solid #e2e8f0',
                      fontSize: 10, color: '#7c3aed', fontWeight: 600, marginBottom: 4,
                    }}>{cert.verifyId}</code>
                    <button type="button" onClick={() => navigator.clipboard?.writeText(cert.verifyUrl)} style={{
                      padding: '4px 10px', borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 10,
                      fontWeight: 600, background: '#fff', color: '#475569', cursor: 'pointer',
                    }}>Copy Verify Link</button>
                  </div>
                </div>
              ))}
              {certificates.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 16 }}>No certificates issued yet.</p>}
            </div>
          </div>
        )}

        {/* ═══ TRANSACTIONS TAB ═══ */}
        {tab === 'transactions' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, overflow: 'auto' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Transaction History</h3>
            {transactions.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>No transactions yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Date', 'Course', 'Buyer', 'Gross', 'Fee', 'Net', 'Type'].map((h) => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0', fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((t) => (
                    <tr key={t.id}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>{t.courseTitle}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>{t.buyer}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>${(t.amount || 0).toFixed(2)}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', color: '#ef4444' }}>-${(t.platformFee || 0).toFixed(2)}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#22c55e' }}>${(t.sellerEarning || 0).toFixed(2)}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                          background: t.type === 'subscription' ? '#fef3c7' : '#eff6ff',
                          color: t.type === 'subscription' ? '#92400e' : '#1d4ed8',
                        }}>{t.type || 'one-time'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Summary */}
            {transactions.length > 0 && (
              <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div><span style={{ fontSize: 12, color: '#065f46' }}>Gross Sales:</span> <strong>${totalGross.toFixed(2)}</strong></div>
                <div><span style={{ fontSize: 12, color: '#065f46' }}>Platform Fees:</span> <strong>-${totalPlatformFees.toFixed(2)}</strong></div>
                <div><span style={{ fontSize: 12, color: '#065f46' }}>Net Revenue:</span> <strong style={{ color: '#22c55e' }}>${totalRevenue.toFixed(2)}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
