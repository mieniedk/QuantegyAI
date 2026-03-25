import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getPublishedCourses, addTransaction, trackAffiliateClick,
  getBuyerTransactions,
} from '../utils/storage';
import { showAppToast } from '../utils/appToast';

const CATEGORIES = ['All', 'STAAR Prep', 'TExES Prep', 'Math', 'Reading', 'Science', 'Test Strategy', 'Professional Dev'];

const Marketplace = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('popular');
  const [purchasing, setPurchasing] = useState(null);

  const username = localStorage.getItem('quantegy-teacher-user') ||
    localStorage.getItem('allen-ace-student-name') || null;

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) trackAffiliateClick(ref);
  }, [searchParams]);

  const courses = useMemo(() => getPublishedCourses(), [purchasing]);
  const purchased = useMemo(() => {
    if (!username) return new Set();
    return new Set(getBuyerTransactions(username).map((t) => t.courseId));
  }, [username, purchasing]);

  const filtered = useMemo(() => {
    let list = courses;
    if (category !== 'All') list = list.filter((c) => c.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.teacher?.toLowerCase().includes(q)
      );
    }
    if (sort === 'popular') list.sort((a, b) => (b.enrollments || 0) - (a.enrollments || 0));
    else if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === 'price-low') list.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === 'price-high') list.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [courses, category, search, sort]);

  const handlePurchase = (course) => {
    if (!username) { showAppToast('Please sign in first.', { type: 'warning' }); return; }
    if (purchased.has(course.id)) return;
    setPurchasing(course.id);
    const ref = searchParams.get('ref') || null;
    const platformFee = Math.round((course.price || 0) * 0.15 * 100) / 100;
    addTransaction({
      courseId: course.id,
      courseTitle: course.title,
      seller: course.teacher,
      buyer: username,
      amount: course.price || 0,
      platformFee,
      sellerEarning: Math.round(((course.price || 0) - platformFee) * 100) / 100,
      affiliateCode: ref,
      type: course.priceModel === 'subscription' ? 'subscription' : 'one-time',
    });
    setTimeout(() => setPurchasing(null), 500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #db2777 100%)',
        padding: '48px 24px 36px', color: '#fff',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 800 }}>QuantegyAI</Link>
            <div style={{ display: 'flex', gap: 10 }}>
              {username && <Link to="/creator-dashboard" style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Creator Dashboard</Link>}
              <Link to="/pricing" style={{ padding: '8px 16px', borderRadius: 8, background: '#fff', color: '#1e40af', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Pricing</Link>
            </div>
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em' }}>Course Marketplace</h1>
          <p style={{ margin: '0 0 24px', fontSize: 16, opacity: 0.9 }}>Discover micro-courses from expert educators. Learn at your own pace.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses, topics, or creators..."
              style={{
                flex: 1, minWidth: 240, padding: '12px 18px', borderRadius: 10, border: 'none',
                fontSize: 14, background: 'rgba(255,255,255,0.95)', color: '#0f172a',
              }}
            />
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{
              padding: '12px 14px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600,
              background: 'rgba(255,255,255,0.95)', color: '#0f172a', cursor: 'pointer',
            }}>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 60px' }}>
        {/* Categories */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button" onClick={() => setCategory(cat)} style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: category === cat ? '2px solid #7c3aed' : '1px solid #e2e8f0',
              background: category === cat ? '#f5f3ff' : '#fff',
              color: category === cat ? '#7c3aed' : '#475569',
            }}>{cat}</button>
          ))}
        </div>

        {/* Empty state with seed data prompt */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>{'\uD83D\uDCDA'}</div>
            <h3 style={{ color: '#0f172a', margin: '0 0 8px', fontSize: 18 }}>No courses yet</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>Be the first to publish a micro-course!</p>
            {username && (
              <Link to="/creator-dashboard" style={{
                display: 'inline-block', padding: '12px 24px', borderRadius: 10,
                background: '#7c3aed', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14,
              }}>Create Your First Course</Link>
            )}
          </div>
        )}

        {/* Course grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map((course) => {
            const owned = purchased.has(course.id);
            const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];
            const accent = colors[Math.abs((course.title || '').length) % colors.length];
            return (
              <div key={course.id} style={{
                background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ height: 8, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                      background: accent + '18', color: accent, textTransform: 'uppercase',
                    }}>{course.category || 'General'}</span>
                    {course.priceModel === 'subscription' && (
                      <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#92400e' }}>Subscription</span>
                    )}
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{course.title}</h3>
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description}
                  </p>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                    by <strong style={{ color: '#475569' }}>{course.teacher}</strong>
                    {course.enrollments > 0 && <span> · {course.enrollments} enrolled</span>}
                    {course.rating > 0 && <span> · {'\u2B50'} {course.rating.toFixed(1)}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: accent }}>
                      {(course.price || 0) === 0 ? 'Free' : `$${course.price}`}
                      {course.priceModel === 'subscription' && <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>/mo</span>}
                    </div>
                    <button type="button" onClick={() => handlePurchase(course)} disabled={owned || purchasing === course.id} style={{
                      padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
                      background: owned ? '#dcfce7' : purchasing === course.id ? '#94a3b8' : accent,
                      color: owned ? '#166534' : '#fff', cursor: owned ? 'default' : 'pointer',
                    }}>
                      {owned ? '\u2713 Enrolled' : purchasing === course.id ? 'Processing...' : (course.price || 0) === 0 ? 'Enroll Free' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
