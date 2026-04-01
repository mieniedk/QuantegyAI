import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import {
  COLOR, CARD, PAGE_WRAP, PAGE_HEADER, PAGE_SUBTITLE, SECTION_HEADING,
  BTN_PRIMARY, BTN_ACCENT, BTN_PURPLE,
} from '../utils/loopStyles';

const FONT = PAGE_WRAP.fontFamily;

const Home = () => {
  const { lang, setLang, t } = useLanguage();

  const featuredExams = [
    { to: '/texes-prep?exam=math712', label: 'TExES Math 7-12', desc: 'Domains, adaptive practice, games & full practice exams.', gradient: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, border: COLOR.blueBorder },
    { to: '/texes-prep?exam=math48', label: 'TExES Math 4-8', desc: 'All 6 domains with games, drills & mastery flows.', gradient: `linear-gradient(135deg, ${COLOR.purple}, #5b21b6)`, border: '#a78bfa' },
    { to: '/texes-prep?exam=linearAlgebra', label: 'Linear Algebra', desc: 'Vectors, matrices, transforms, eigenvalues, SVD & more.', gradient: 'linear-gradient(135deg, #059669, #047857)', border: '#34d399' },
    { to: '/texes-prep?exam=calculus', label: 'Calculus', desc: 'Limits, derivatives, integrals, series, and L\'Hospital\'s Rule.', gradient: 'linear-gradient(135deg, #d97706, #b45309)', border: '#fbbf24' },
  ];

  const certificationCards = [
    { to: '/texes-prep', labelKey: 'texesPrep', desc: 'Texas — TExES: Math 7-12, 4-8, EC-6, ELA, Science, and more.' },
    { to: '/praxis-prep', label: 'Praxis Prep', desc: 'Multi-state — Praxis Core Math & Reading.' },
    { to: '/ftce-prep', label: 'FTCE Prep', desc: 'Florida — General Knowledge Math.' },
    { to: '/nystce-prep', label: 'NYSTCE Prep', desc: 'New York — Multi-Subject, ALST.' },
    { to: '/cset-prep', label: 'CSET Prep', desc: 'California — CSET Math & ELA.' },
    { to: '/ilts-prep', label: 'ILTS Prep', desc: 'Illinois — Content Area.' },
    { to: '/mtel-prep', label: 'MTEL Prep', desc: 'Massachusetts — Comm. & Literacy.' },
    { to: '/gace-prep', label: 'GACE Prep', desc: 'Georgia — Program Admission.' },
    { to: '/oae-prep', label: 'OAE Prep', desc: 'Ohio — Content & Professional.' },
    { to: '/mttc-prep', label: 'MTTC Prep', desc: 'Michigan — Elementary Education.' },
    { to: '/west-prep', label: 'WEST Prep', desc: 'Washington — WEST-B Basic Skills.' },
    { to: '/gre-prep', label: 'GRE Prep', desc: 'Graduate — Quant & Verbal.' },
    { to: '/sat-prep', label: 'SAT Prep', desc: 'College — Math & EBRW.' },
    { to: '/actuary-prep', label: 'Actuary Prep', desc: 'SOA & CAS exams.' },
    { to: '/canada-prep', label: 'Canada Teacher Prep', desc: 'All provinces — math & professional.' },
    { to: '/accounting-prep', label: 'Accounting Exam Prep', desc: 'CPA, CMA, CIA.' },
    { to: '/england-prep', label: 'England Teacher Prep', desc: 'QTS: Numeracy, Literacy & Professional.' },
    { to: '/australia-prep', label: 'Australia Teacher Prep', desc: 'LANTITE Numeracy & Literacy.' },
    { to: '/newzealand-prep', label: 'New Zealand Prep', desc: 'Numeracy, Literacy & Professional.' },
    { to: '/southafrica-prep', label: 'South Africa Prep', desc: 'CAPS & SACE aligned.' },
    { to: '/india-prep', label: 'India Teacher Prep', desc: 'CTET Paper 1 & 2.' },
    { to: '/china-prep', label: 'China Teacher Prep', desc: '教师资格考试 style.' },
    { to: '/scotland-prep', label: 'Scotland Prep', desc: 'CfE, GTCS, GIRFEC.' },
    { to: '/wales-prep', label: 'Wales Prep', desc: 'Curriculum for Wales.' },
    { to: '/northernireland-prep', label: 'N. Ireland Prep', desc: 'GTCNI & NI Curriculum.' },
    { to: '/ireland-prep', label: 'Ireland Prep', desc: 'Teaching Council, Droichead.' },
    { to: '/nigeria-prep', label: 'Nigeria Prep', desc: 'UBE & TRCN.' },
    { to: '/kenya-prep', label: 'Kenya Prep', desc: 'CBC & TSC.' },
    { to: '/ghana-prep', label: 'Ghana Prep', desc: 'NTC & curriculum.' },
  ];

  const mainCards = [
    { to: '/teacher', emoji: '👩\u200D🏫', labelKey: 'teacherPortal', descKey: 'teacherPortalDesc' },
    { to: '/student', emoji: '🎓', labelKey: 'studentPortal', descKey: 'studentPortalDesc' },
    { to: '/parent', emoji: '👨\u200D👩\u200D👧\u200D👦', labelKey: 'parentPortal', descKey: 'parentPortalDesc' },
    { to: '/games', emoji: '🎮', labelKey: 'gamesLibrary', descKey: 'gamesLibraryDesc' },
    { to: '/staar-prep', emoji: '📋', labelKey: 'staarPrep', descKey: 'staarPrepDesc' },
    { to: '/pricing', emoji: '💳', labelKey: 'pricing', descKey: 'pricingDesc' },
  ];

  const navLinkStyle = {
    padding: '7px 14px',
    borderRadius: 10,
    border: `1px solid ${COLOR.border}`,
    background: COLOR.card,
    color: COLOR.text,
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 700,
    transition: 'background 0.15s',
  };

  const cardBaseStyle = {
    ...CARD,
    padding: '22px 20px',
    textDecoration: 'none',
    color: COLOR.text,
    textAlign: 'center',
    transition: 'transform 0.15s, box-shadow 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: COLOR.bg,
      fontFamily: FONT,
    }}>
      <header role="banner" style={{
        padding: '14px 24px',
        background: COLOR.card,
        borderBottom: `1px solid ${COLOR.border}`,
        boxShadow: CARD.boxShadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
          <div style={{
            height: 48, width: 48, borderRadius: 14,
            background: `linear-gradient(135deg, ${COLOR.blue}, ${COLOR.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: '#fff', flexShrink: 0, fontWeight: 900,
          }} aria-hidden="true">A</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLOR.text, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              QuantegyAI
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: COLOR.textSecondary, fontWeight: 500 }}>
              {t('teksAligned')}
            </p>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/status" style={navLinkStyle}>Status</Link>
          <Link to="/api-docs" style={navLinkStyle}>API Docs</Link>
          <LanguageSelector compact />
          <span style={{ fontSize: 12, color: COLOR.textMuted, fontWeight: 500 }}>{t('qbotHint')}</span>
        </div>
      </header>

      <main style={{ padding: '40px 24px 48px', maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ ...PAGE_HEADER, fontSize: 32, marginBottom: 8 }}>Pass your certification exam</h2>
          <p style={{ ...PAGE_SUBTITLE, fontSize: 16, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            {t('gamesThatTeach')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 36 }}>
          {featuredExams.map((exam) => (
            <Link
              key={exam.to}
              to={exam.to}
              style={{
                ...CARD,
                padding: '28px 24px',
                background: exam.gradient,
                border: `2px solid ${exam.border}`,
                textDecoration: 'none',
                color: '#fff',
                transition: 'transform 0.15s, box-shadow 0.2s',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, lineHeight: 1.2 }}>{exam.label}</div>
              <div style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.5, marginBottom: 16 }}>{exam.desc}</div>
              <span style={{ display: 'inline-block', padding: '8px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.2)', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                Start practicing
              </span>
            </Link>
          ))}
        </div>

        <section style={{ marginBottom: 36 }} aria-labelledby="tools-heading">
          <h2 id="tools-heading" style={{ ...SECTION_HEADING, fontSize: 12, color: COLOR.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Interactive Tools
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
          }}>
            <a
              href="/tools/VectorPlayground.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...CARD,
                padding: '22px 20px',
                textDecoration: 'none',
                color: COLOR.text,
                background: 'linear-gradient(135deg, #0a0e1a, #101828)',
                border: '2px solid #1e293b',
                transition: 'transform 0.15s, box-shadow 0.2s',
              }}
            >
              <span style={{ display: 'block', fontSize: 15, fontWeight: 800, marginBottom: 4, color: '#00e5ff' }}>Vector Playground</span>
              <span style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: 12 }}>
                Drag vectors on an interactive grid. Explore magnitude, unit vectors, components, and angles in real time.
              </span>
              <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 8, background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.3)', fontSize: 12, fontWeight: 700, color: '#00e5ff' }}>
                Open tool
              </span>
            </a>
          </div>
        </section>

        <section style={{ marginBottom: 36 }} aria-labelledby="cert-heading">
          <h2 id="cert-heading" style={{ ...SECTION_HEADING, fontSize: 12, color: COLOR.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            All certification exams
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {certificationCards.map((card) => (
              <Link
                key={card.to}
                to={card.to}
                style={{
                  ...cardBaseStyle,
                  padding: '18px 16px',
                }}
              >
                <span style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 4, color: COLOR.text }}>{card.label != null ? card.label : t(card.labelKey)}</span>
                <span style={{ display: 'block', fontSize: 12, color: COLOR.textSecondary, fontWeight: 400, lineHeight: 1.4 }}>{card.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 40 }} aria-labelledby="main-heading">
          <h2 id="main-heading" style={{ ...SECTION_HEADING, fontSize: 12, color: COLOR.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Get started
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {mainCards.map((card) => (
              <Link
                key={card.to}
                to={card.to}
                style={cardBaseStyle}
              >
                <span style={{ display: 'block', marginBottom: 8, fontSize: 28 }} aria-hidden="true">{card.emoji}</span>
                <span style={{ display: 'block', fontWeight: 700, fontSize: 15, marginBottom: 4, color: COLOR.text }}>{t(card.labelKey)}</span>
                <span style={{ display: 'block', fontSize: 13, color: COLOR.textSecondary, fontWeight: 400 }}>{card.descKey ? t(card.descKey) : card.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        <div style={{ textAlign: 'center', paddingTop: 8, borderTop: `1px solid ${COLOR.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <p style={{ fontSize: 12, color: COLOR.textMuted, margin: 0 }}>
              QuantegyAI · Aligned to Texas TEKS standards
            </p>
            <span style={{ color: COLOR.border }}>·</span>
            <Link to="/status" style={{ fontSize: 12, color: COLOR.blue, textDecoration: 'none', fontWeight: 700 }}>
              Platform Status
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/privacy" style={{ fontSize: 11, color: COLOR.textSecondary, textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ fontSize: 11, color: COLOR.textSecondary, textDecoration: 'none' }}>Terms of Service</Link>
            <Link to="/dpa" style={{ fontSize: 11, color: COLOR.textSecondary, textDecoration: 'none' }}>Data Processing Agreement</Link>
            <Link to="/security" style={{ fontSize: 11, color: COLOR.textSecondary, textDecoration: 'none' }}>Security</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
