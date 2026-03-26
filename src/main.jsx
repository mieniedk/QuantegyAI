import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useSearchParams } from "react-router-dom";
import "./index.css";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";
import ProGate from "./components/ProGate.jsx";
import Qbot from "./components/Qbot.jsx";
import QBotFloating from "./components/QBotFloating.jsx";
import CommandBar from "./components/CommandBar.jsx";
import { LTIProvider } from "./contexts/LTIContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { SocketProvider } from "./contexts/SocketContext.jsx";
import LTIBanner from "./components/LTIBanner.jsx";
import StudentLayout from "./components/StudentLayout.jsx";
import GlobalLoopCalculator from "./components/GlobalLoopCalculator.jsx";
import AppToaster from "./components/AppToaster.jsx";
import { migrateBrandStorageKeys } from "./utils/storageKeyMigration.js";
import { practiceLoopInstanceKey } from "./utils/practiceLoopScope.js";

migrateBrandStorageKeys();

function PracticeLoopKeyed() {
  const [params] = useSearchParams();
  return <PracticeLoop key={practiceLoopInstanceKey(params)} />;
}

function lazyWithPreload(loader) {
  const Component = React.lazy(loader);
  Component.preload = loader;
  return Component;
}

const Home = lazyWithPreload(() => import("./pages/Home.jsx"));
const Teacher = React.lazy(() => import("./pages/Teacher.jsx"));
const TeacherOnboarding = React.lazy(() => import("./pages/TeacherOnboarding.jsx"));
const TeacherHome = React.lazy(() => import("./pages/TeacherHome.jsx"));
const TeacherClasses = React.lazy(() => import("./pages/TeacherClasses.jsx"));
const ClassWizard = React.lazy(() => import("./pages/ClassWizard.jsx"));
const ClassView = React.lazy(() => import("./pages/ClassView.jsx"));
const TeacherDashboard = React.lazy(() => import("./pages/TeacherDashboard.jsx"));
const TeacherCopilot = React.lazy(() => import("./pages/TeacherCopilot.jsx"));
const Student = React.lazy(() => import("./pages/Student.jsx"));
const Games = React.lazy(() => import("./pages/Games.jsx"));
const MathMatch = React.lazy(() => import("./pages/MathMatch.jsx"));
const MathSprint = React.lazy(() => import("./pages/MathSprint.jsx"));
const AlgebraSprint = React.lazy(() => import("./pages/AlgebraSprint.jsx"));
const QBlocks = React.lazy(() => import("./pages/QBlocks.jsx"));
const TeksCrush = React.lazy(() => import("./pages/TeksCrush.jsx"));
const MathJeopardy = React.lazy(() => import("./pages/MathJeopardy.jsx"));
const MathBingo = React.lazy(() => import("./pages/MathBingo.jsx"));
const MathMillionaire = React.lazy(() => import("./pages/MathMillionaire.jsx"));
const NumberLineNinja = React.lazy(() => import("./pages/NumberLineNinja.jsx"));
const MathMaze = React.lazy(() => import("./pages/MathMaze.jsx"));
const EscapeRoom = React.lazy(() => import("./pages/EscapeRoom.jsx"));
const ScavengerHunt = React.lazy(() => import("./pages/ScavengerHunt.jsx"));
const EquationBalance = React.lazy(() => import("./pages/EquationBalance.jsx"));
const SpeedBuilder = React.lazy(() => import("./pages/SpeedBuilder.jsx"));
const FractionPizza = React.lazy(() => import("./pages/FractionPizza.jsx"));
const CrossesKnots = React.lazy(() => import("./pages/CrossesKnots.jsx"));
const MathMemory = React.lazy(() => import("./pages/MathMemory.jsx"));
const QBotShop = React.lazy(() => import("./pages/QBotShop.jsx"));
const TimeTraveler = React.lazy(() => import("./pages/TimeTraveler.jsx"));
const GraphExplorer = React.lazy(() => import("./pages/GraphExplorer.jsx"));
const CoordinateCommander = React.lazy(() => import("./pages/CoordinateCommander.jsx"));
const IntegerIsland = React.lazy(() => import("./pages/IntegerIsland.jsx"));
const PercentHeist = React.lazy(() => import("./pages/PercentHeist.jsx"));
const ProbabilityLab = React.lazy(() => import("./pages/ProbabilityLab.jsx"));
const RatioRace = React.lazy(() => import("./pages/RatioRace.jsx"));
const FunctionMachineFrenzy = React.lazy(() => import("./pages/FunctionMachineFrenzy.jsx"));
const UnitRateRally = React.lazy(() => import("./pages/UnitRateRally.jsx"));
const SlopeShowdown = React.lazy(() => import("./pages/SlopeShowdown.jsx"));
const LinearLockpick = React.lazy(() => import("./pages/LinearLockpick.jsx"));
const EquationErrorLab = React.lazy(() => import("./pages/EquationErrorLab.jsx"));
const InequalitySprint = React.lazy(() => import("./pages/InequalitySprint.jsx"));
const ProportionRescue = React.lazy(() => import("./pages/ProportionRescue.jsx"));
const ExponentExpedition = React.lazy(() => import("./pages/ExponentExpedition.jsx"));
const DataDetective = React.lazy(() => import("./pages/DataDetective.jsx"));
const AreaBuilder = React.lazy(() => import("./pages/AreaBuilder.jsx"));
const FractionFaceoff = React.lazy(() => import("./pages/FractionFaceoff.jsx"));
const DecimalDrift = React.lazy(() => import("./pages/DecimalDrift.jsx"));
const PercentPop = React.lazy(() => import("./pages/PercentPop.jsx"));
const AngleArcade = React.lazy(() => import("./pages/AngleArcade.jsx"));
const StatisticsSorter = React.lazy(() => import("./pages/StatisticsSorter.jsx"));
const ProbabilitySpinnerLab = React.lazy(() => import("./pages/ProbabilitySpinnerLab.jsx"));
const GeometryNetNinja = React.lazy(() => import("./pages/GeometryNetNinja.jsx"));
const CoordinateCapture = React.lazy(() => import("./pages/CoordinateCapture.jsx"));
const IntegerOpsArena = React.lazy(() => import("./pages/IntegerOpsArena.jsx"));
const SurfaceAreaScramble = React.lazy(() => import("./pages/SurfaceAreaScramble.jsx"));
const OrderOfOperationsDash = React.lazy(() => import("./pages/OrderOfOperationsDash.jsx"));
const TransformTracker = React.lazy(() => import("./pages/TransformTracker.jsx"));
const VolumeVault = React.lazy(() => import("./pages/VolumeVault.jsx"));
const ShapeShifter = React.lazy(() => import("./pages/ShapeShifter.jsx"));
const FractionFrenzy = React.lazy(() => import("./pages/FractionFrenzy.jsx"));
const STAARPrep = React.lazy(() => import("./pages/STAARPrep.jsx"));
const TexesPrep = lazyWithPreload(() => import("./pages/TexesPrep.jsx"));
const GrePrep = React.lazy(() => import("./pages/GrePrep.jsx"));
const SatPrep = React.lazy(() => import("./pages/SatPrep.jsx"));
const PraxisPrep = React.lazy(() => import("./pages/PraxisPrep.jsx"));
const FtcePrep = React.lazy(() => import("./pages/FtcePrep.jsx"));
const NystcePrep = React.lazy(() => import("./pages/NystcePrep.jsx"));
const CsetPrep = React.lazy(() => import("./pages/CsetPrep.jsx"));
const IltsPrep = React.lazy(() => import("./pages/IltsPrep.jsx"));
const MtelPrep = React.lazy(() => import("./pages/MtelPrep.jsx"));
const GacePrep = React.lazy(() => import("./pages/GacePrep.jsx"));
const OaePrep = React.lazy(() => import("./pages/OaePrep.jsx"));
const MttcPrep = React.lazy(() => import("./pages/MttcPrep.jsx"));
const WestPrep = React.lazy(() => import("./pages/WestPrep.jsx"));
const ActuaryPrep = React.lazy(() => import("./pages/ActuaryPrep.jsx"));
const CanadaPrep = React.lazy(() => import("./pages/CanadaPrep.jsx"));
const AccountingPrep = React.lazy(() => import("./pages/AccountingPrep.jsx"));
const EnglandPrep = React.lazy(() => import("./pages/EnglandPrep.jsx"));
const AustraliaPrep = React.lazy(() => import("./pages/AustraliaPrep.jsx"));
const NewZealandPrep = React.lazy(() => import("./pages/NewZealandPrep.jsx"));
const SouthAfricaPrep = React.lazy(() => import("./pages/SouthAfricaPrep.jsx"));
const IndiaPrep = React.lazy(() => import("./pages/IndiaPrep.jsx"));
const ChinaPrep = React.lazy(() => import("./pages/ChinaPrep.jsx"));
const ScotlandPrep = React.lazy(() => import("./pages/ScotlandPrep.jsx"));
const WalesPrep = React.lazy(() => import("./pages/WalesPrep.jsx"));
const NorthernIrelandPrep = React.lazy(() => import("./pages/NorthernIrelandPrep.jsx"));
const IrelandPrep = React.lazy(() => import("./pages/IrelandPrep.jsx"));
const NigeriaPrep = React.lazy(() => import("./pages/NigeriaPrep.jsx"));
const KenyaPrep = React.lazy(() => import("./pages/KenyaPrep.jsx"));
const GhanaPrep = React.lazy(() => import("./pages/GhanaPrep.jsx"));
const VideoStudio = React.lazy(() => import("./pages/VideoStudio.jsx"));
const ConceptMap = React.lazy(() => import("./pages/ConceptMap.jsx"));
const Printables = React.lazy(() => import("./pages/Printables.jsx"));
const ClassroomTools = React.lazy(() => import("./pages/ClassroomTools.jsx"));
const PacingGuide = React.lazy(() => import("./pages/PacingGuide.jsx"));
const CalendarView = React.lazy(() => import("./pages/CalendarView.jsx"));
const ParentPortal = React.lazy(() => import("./pages/ParentPortal.jsx"));
const LiveGame = React.lazy(() => import("./pages/LiveGame.jsx"));
const Gradebook = React.lazy(() => import("./pages/Gradebook.jsx"));
const StudentGrades = React.lazy(() => import("./pages/StudentGrades.jsx"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard.jsx"));
const NotificationPrefs = React.lazy(() => import("./components/NotificationPrefs.jsx"));
const Quiz = React.lazy(() => import("./pages/Quiz.jsx"));
const TakeAssessment = React.lazy(() => import("./pages/TakeAssessment.jsx"));
const Pricing = React.lazy(() => import("./pages/Pricing.jsx"));
const Checkout = React.lazy(() => import("./pages/Checkout.jsx"));
const Marketplace = React.lazy(() => import("./pages/Marketplace.jsx"));
const CreatorDashboard = React.lazy(() => import("./pages/CreatorDashboard.jsx"));
const CertificateVerify = React.lazy(() => import("./pages/CertificateVerify.jsx"));
const Inbox = React.lazy(() => import("./pages/Inbox.jsx"));
const FileManager = React.lazy(() => import("./pages/FileManager.jsx"));
const WarmUp = React.lazy(() => import("./pages/WarmUp.jsx"));
const PracticeLoop = lazyWithPreload(() => import("./pages/PracticeLoop.jsx"));
const Math712LearningPath = lazyWithPreload(() => import("./pages/Math712LearningPath.jsx"));
const ConceptExplorer = React.lazy(() => import("./pages/ConceptExplorer.jsx"));
const Portfolio = React.lazy(() => import("./pages/Portfolio.jsx"));
const LTILaunch = React.lazy(() => import("./pages/LTILaunch.jsx"));
const LTIAdmin = React.lazy(() => import("./pages/LTIAdmin.jsx"));
const AccessibilityAudit = React.lazy(() => import("./components/AccessibilityAudit.jsx"));
const BlueprintManager = React.lazy(() => import("./components/BlueprintManager.jsx"));
const Commons = React.lazy(() => import("./pages/Commons.jsx"));
const StatusPage = React.lazy(() => import("./pages/StatusPage.jsx"));
const APIDocs = React.lazy(() => import("./pages/APIDocs.jsx"));
const WikiPages = React.lazy(() => import("./pages/WikiPages.jsx"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy.jsx"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService.jsx"));
const DataProcessingAgreement = React.lazy(() => import("./pages/DataProcessingAgreement.jsx"));
const SecurityDocs = React.lazy(() => import("./pages/SecurityDocs.jsx"));
const Domains = lazyWithPreload(() => import("./pages/Domains.jsx"));

const ROUTE_PRELOADERS = {
  '/': () => Home.preload?.(),
  '/texes-prep': () => TexesPrep.preload?.(),
  '/practice-loop': () => PracticeLoop.preload?.(),
  '/math-712-learning-path': () => Math712LearningPath.preload?.(),
  '/domains': () => Domains.preload?.(),
};

function resolvePreloader(pathname) {
  if (ROUTE_PRELOADERS[pathname]) return ROUTE_PRELOADERS[pathname];
  if (pathname.startsWith('/practice-loop')) return ROUTE_PRELOADERS['/practice-loop'];
  if (pathname.startsWith('/math-712-learning-path')) return ROUTE_PRELOADERS['/math-712-learning-path'];
  if (pathname.startsWith('/texes-prep')) return ROUTE_PRELOADERS['/texes-prep'];
  return null;
}

function RoutePrefetcher() {
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
    const warmed = new Set();
    const warm = (path) => {
      if (!path || warmed.has(path)) return;
      const loader = resolvePreloader(path);
      if (!loader) return;
      warmed.add(path);
      loader().catch(() => {});
    };

    // Warm key routes shortly after first paint, without blocking interaction.
    const idleId = window.requestIdleCallback
      ? window.requestIdleCallback(() => {
        warm('/texes-prep');
        warm('/practice-loop');
      }, { timeout: 1800 })
      : window.setTimeout(() => {
        warm('/texes-prep');
        warm('/practice-loop');
      }, 900);

    const maybeWarmFromEvent = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest?.('a[href]');
      if (!anchor) return;
      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        warm(url.pathname);
      } catch {
        // ignore malformed href
      }
    };

    document.addEventListener('mouseover', maybeWarmFromEvent, { passive: true });
    document.addEventListener('focusin', maybeWarmFromEvent, { passive: true });
    document.addEventListener('touchstart', maybeWarmFromEvent, { passive: true });

    return () => {
      if (window.cancelIdleCallback && typeof idleId === 'number') window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      document.removeEventListener('mouseover', maybeWarmFromEvent);
      document.removeEventListener('focusin', maybeWarmFromEvent);
      document.removeEventListener('touchstart', maybeWarmFromEvent);
    };
  }, []);
  return null;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('React ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: 24,
        }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              We ran into a problem
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: '0 0 8px' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5, margin: '0 0 20px' }}>
              Try refreshing the page or going back home. If this keeps happening, check your connection or try again later.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); }}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: '#2563eb', color: '#fff', fontWeight: 700,
                  fontSize: 14, cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{
                  padding: '10px 24px', borderRadius: 10,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#334155', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("Root element #root not found");
} else {
  try {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <ErrorBoundary>
          <ThemeProvider>
          <LanguageProvider>
          <SocketProvider>
          <LTIProvider>
      <BrowserRouter>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <LTIBanner />
        <RoutePrefetcher />
        <QBotFloating />
        <CommandBar />
        <GlobalLoopCalculator />
        <AppToaster />
        <main id="main-content" tabIndex={-1} role="main">
        <React.Suspense fallback={<div style={{ maxWidth: 560, margin: '24px auto', padding: '16px 20px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontSize: 14, fontWeight: 600 }}>Loading...</div>}>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<><Qbot /><Home /></>} />
          <Route path="/student" element={<StudentLayout><Student /></StudentLayout>} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/math-match" element={<ErrorBoundary><MathMatch /></ErrorBoundary>} />
          <Route path="/games/math-sprint" element={<ErrorBoundary><MathSprint /></ErrorBoundary>} />
          <Route path="/games/algebra-sprint" element={<ErrorBoundary><AlgebraSprint /></ErrorBoundary>} />
          <Route path="/games/q-blocks" element={<ErrorBoundary><QBlocks /></ErrorBoundary>} />
          <Route path="/games/teks-crush" element={<ErrorBoundary><TeksCrush /></ErrorBoundary>} />
          <Route path="/games/math-jeopardy" element={<ErrorBoundary><MathJeopardy /></ErrorBoundary>} />
          <Route path="/games/math-bingo" element={<ErrorBoundary><MathBingo /></ErrorBoundary>} />
          <Route path="/games/math-millionaire" element={<ErrorBoundary><MathMillionaire /></ErrorBoundary>} />
          <Route path="/games/number-line-ninja" element={<ErrorBoundary><NumberLineNinja /></ErrorBoundary>} />
          <Route path="/games/math-maze" element={<ErrorBoundary><MathMaze /></ErrorBoundary>} />
          <Route path="/games/escape-room" element={<ErrorBoundary><EscapeRoom /></ErrorBoundary>} />
          <Route path="/games/scavenger-hunt" element={<ErrorBoundary><ScavengerHunt /></ErrorBoundary>} />
          <Route path="/games/equation-balance" element={<ErrorBoundary><EquationBalance /></ErrorBoundary>} />
          <Route path="/games/speed-builder" element={<ErrorBoundary><SpeedBuilder /></ErrorBoundary>} />
          <Route path="/games/fraction-pizza" element={<ErrorBoundary><FractionPizza /></ErrorBoundary>} />
          <Route path="/games/crosses-knots" element={<ErrorBoundary><CrossesKnots /></ErrorBoundary>} />
          <Route path="/games/math-memory" element={<ErrorBoundary><MathMemory /></ErrorBoundary>} />
          <Route path="/games/qbot-shop" element={<ErrorBoundary><QBotShop /></ErrorBoundary>} />
          <Route path="/games/time-traveler" element={<ErrorBoundary><TimeTraveler /></ErrorBoundary>} />
          <Route path="/games/graph-explorer" element={<ErrorBoundary><GraphExplorer /></ErrorBoundary>} />
          <Route path="/games/coordinate-commander" element={<ErrorBoundary><CoordinateCommander /></ErrorBoundary>} />
          <Route path="/games/integer-island" element={<ErrorBoundary><IntegerIsland /></ErrorBoundary>} />
          <Route path="/games/percent-heist" element={<ErrorBoundary><PercentHeist /></ErrorBoundary>} />
          <Route path="/games/probability-lab" element={<ErrorBoundary><ProbabilityLab /></ErrorBoundary>} />
          <Route path="/games/ratio-race" element={<ErrorBoundary><RatioRace /></ErrorBoundary>} />
          <Route path="/games/function-machine-frenzy" element={<ErrorBoundary><FunctionMachineFrenzy /></ErrorBoundary>} />
          <Route path="/games/unit-rate-rally" element={<ErrorBoundary><UnitRateRally /></ErrorBoundary>} />
          <Route path="/games/slope-showdown" element={<ErrorBoundary><SlopeShowdown /></ErrorBoundary>} />
          <Route path="/games/linear-lockpick" element={<ErrorBoundary><LinearLockpick /></ErrorBoundary>} />
          <Route path="/games/equation-error-lab" element={<ErrorBoundary><EquationErrorLab /></ErrorBoundary>} />
          <Route path="/games/inequality-sprint" element={<ErrorBoundary><InequalitySprint /></ErrorBoundary>} />
          <Route path="/games/proportion-rescue" element={<ErrorBoundary><ProportionRescue /></ErrorBoundary>} />
          <Route path="/games/exponent-expedition" element={<ErrorBoundary><ExponentExpedition /></ErrorBoundary>} />
          <Route path="/games/data-detective" element={<ErrorBoundary><DataDetective /></ErrorBoundary>} />
          <Route path="/games/area-builder" element={<ErrorBoundary><AreaBuilder /></ErrorBoundary>} />
          <Route path="/games/fraction-faceoff" element={<ErrorBoundary><FractionFaceoff /></ErrorBoundary>} />
          <Route path="/games/decimal-drift" element={<ErrorBoundary><DecimalDrift /></ErrorBoundary>} />
          <Route path="/games/percent-pop" element={<ErrorBoundary><PercentPop /></ErrorBoundary>} />
          <Route path="/games/angle-arcade" element={<ErrorBoundary><AngleArcade /></ErrorBoundary>} />
          <Route path="/games/statistics-sorter" element={<ErrorBoundary><StatisticsSorter /></ErrorBoundary>} />
          <Route path="/games/probability-spinner-lab" element={<ErrorBoundary><ProbabilitySpinnerLab /></ErrorBoundary>} />
          <Route path="/games/geometry-net-ninja" element={<ErrorBoundary><GeometryNetNinja /></ErrorBoundary>} />
          <Route path="/games/coordinate-capture" element={<ErrorBoundary><CoordinateCapture /></ErrorBoundary>} />
          <Route path="/games/integer-ops-arena" element={<ErrorBoundary><IntegerOpsArena /></ErrorBoundary>} />
          <Route path="/games/surface-area-scramble" element={<ErrorBoundary><SurfaceAreaScramble /></ErrorBoundary>} />
          <Route path="/games/order-of-operations-dash" element={<ErrorBoundary><OrderOfOperationsDash /></ErrorBoundary>} />
          <Route path="/games/transform-tracker" element={<ErrorBoundary><TransformTracker /></ErrorBoundary>} />
          <Route path="/games/volume-vault" element={<ErrorBoundary><VolumeVault /></ErrorBoundary>} />
          <Route path="/games/shape-shifter" element={<ErrorBoundary><ShapeShifter /></ErrorBoundary>} />
          <Route path="/games/fraction-frenzy" element={<ErrorBoundary><FractionFrenzy /></ErrorBoundary>} />
          <Route path="/staar-prep" element={<ErrorBoundary><STAARPrep /></ErrorBoundary>} />
          <Route path="/texes-prep" element={<StudentLayout><ErrorBoundary><TexesPrep /></ErrorBoundary></StudentLayout>} />
          <Route path="/domains" element={<StudentLayout><ErrorBoundary><Domains /></ErrorBoundary></StudentLayout>} />
          <Route path="/gre-prep" element={<ErrorBoundary><GrePrep /></ErrorBoundary>} />
          <Route path="/sat-prep" element={<ErrorBoundary><SatPrep /></ErrorBoundary>} />
          <Route path="/praxis-prep" element={<ErrorBoundary><PraxisPrep /></ErrorBoundary>} />
          <Route path="/ftce-prep" element={<ErrorBoundary><FtcePrep /></ErrorBoundary>} />
          <Route path="/nystce-prep" element={<ErrorBoundary><NystcePrep /></ErrorBoundary>} />
          <Route path="/cset-prep" element={<ErrorBoundary><CsetPrep /></ErrorBoundary>} />
          <Route path="/ilts-prep" element={<ErrorBoundary><IltsPrep /></ErrorBoundary>} />
          <Route path="/mtel-prep" element={<ErrorBoundary><MtelPrep /></ErrorBoundary>} />
          <Route path="/gace-prep" element={<ErrorBoundary><GacePrep /></ErrorBoundary>} />
          <Route path="/oae-prep" element={<ErrorBoundary><OaePrep /></ErrorBoundary>} />
          <Route path="/mttc-prep" element={<ErrorBoundary><MttcPrep /></ErrorBoundary>} />
          <Route path="/west-prep" element={<ErrorBoundary><WestPrep /></ErrorBoundary>} />
          <Route path="/actuary-prep" element={<ErrorBoundary><ActuaryPrep /></ErrorBoundary>} />
          <Route path="/canada-prep" element={<ErrorBoundary><CanadaPrep /></ErrorBoundary>} />
          <Route path="/accounting-prep" element={<ErrorBoundary><AccountingPrep /></ErrorBoundary>} />
          <Route path="/england-prep" element={<ErrorBoundary><EnglandPrep /></ErrorBoundary>} />
          <Route path="/australia-prep" element={<ErrorBoundary><AustraliaPrep /></ErrorBoundary>} />
          <Route path="/newzealand-prep" element={<ErrorBoundary><NewZealandPrep /></ErrorBoundary>} />
          <Route path="/southafrica-prep" element={<ErrorBoundary><SouthAfricaPrep /></ErrorBoundary>} />
          <Route path="/india-prep" element={<ErrorBoundary><IndiaPrep /></ErrorBoundary>} />
          <Route path="/china-prep" element={<ErrorBoundary><ChinaPrep /></ErrorBoundary>} />
          <Route path="/scotland-prep" element={<ErrorBoundary><ScotlandPrep /></ErrorBoundary>} />
          <Route path="/wales-prep" element={<ErrorBoundary><WalesPrep /></ErrorBoundary>} />
          <Route path="/northernireland-prep" element={<ErrorBoundary><NorthernIrelandPrep /></ErrorBoundary>} />
          <Route path="/ireland-prep" element={<ErrorBoundary><IrelandPrep /></ErrorBoundary>} />
          <Route path="/nigeria-prep" element={<ErrorBoundary><NigeriaPrep /></ErrorBoundary>} />
          <Route path="/kenya-prep" element={<ErrorBoundary><KenyaPrep /></ErrorBoundary>} />
          <Route path="/ghana-prep" element={<ErrorBoundary><GhanaPrep /></ErrorBoundary>} />
          <Route path="/video-studio" element={<ErrorBoundary><VideoStudio /></ErrorBoundary>} />
          <Route path="/concept-map" element={<ErrorBoundary><ConceptMap /></ErrorBoundary>} />
          <Route path="/printables" element={<ErrorBoundary><Printables /></ErrorBoundary>} />
          <Route path="/classroom-tools" element={<ErrorBoundary><ClassroomTools /></ErrorBoundary>} />
          <Route path="/pacing-guide" element={<ErrorBoundary><PacingGuide /></ErrorBoundary>} />
          <Route path="/calendar" element={<ErrorBoundary><CalendarView /></ErrorBoundary>} />
          <Route path="/parent" element={<ErrorBoundary><ParentPortal /></ErrorBoundary>} />
          <Route path="/live-game" element={<ErrorBoundary><LiveGame /></ErrorBoundary>} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/assessment/:assessmentId" element={<TakeAssessment />} />
          <Route path="/warmup" element={<WarmUp />} />
          <Route path="/practice-loop" element={<StudentLayout><ErrorBoundary><PracticeLoopKeyed /></ErrorBoundary></StudentLayout>} />
          <Route path="/math-712-learning-path" element={<StudentLayout><ErrorBoundary><Math712LearningPath /></ErrorBoundary></StudentLayout>} />
          <Route path="/concept-explorer" element={<ErrorBoundary><ConceptExplorer /></ErrorBoundary>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/creator-dashboard" element={<CreatorDashboard />} />
          <Route path="/verify/:verifyId" element={<CertificateVerify />} />

          {/* Teacher auth */}
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/teacher-onboarding" element={<TeacherOnboarding />} />

          {/* Teacher portal (new guided flow) */}
          <Route path="/teacher-dashboard" element={<TeacherHome />} />
          <Route path="/teacher-classes" element={<TeacherClasses />} />
          <Route path="/teacher-class-new" element={<ClassWizard />} />
          <Route path="/teacher-class/:classId" element={<ErrorBoundary><ClassView /></ErrorBoundary>} />
          <Route path="/teacher-analytics" element={<ProGate featureName="Analytics Dashboard"><TeacherDashboard /></ProGate>} />
          <Route path="/teacher-copilot" element={<ErrorBoundary><TeacherCopilot /></ErrorBoundary>} />
          <Route path="/blueprints" element={<ErrorBoundary><BlueprintManager /></ErrorBoundary>} />
          <Route path="/commons" element={<ErrorBoundary><Commons /></ErrorBoundary>} />

          <Route path="/inbox" element={<Inbox />} />
          <Route path="/files" element={<FileManager />} />
          <Route path="/notification-settings" element={<NotificationPrefs />} />

          {/* LTI integration */}
          <Route path="/lti-launch" element={<LTILaunch />} />
          <Route path="/lti-admin" element={<LTIAdmin />} />

          {/* Admin dashboard */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/accessibility-audit" element={<div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}><AccessibilityAudit /></div>} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/api-docs" element={<APIDocs />} />
          <Route path="/wiki/:classId" element={<WikiPages />} />
          <Route path="/wiki/:classId/:pageId" element={<WikiPages />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/dpa" element={<DataProcessingAgreement />} />
          <Route path="/security" element={<SecurityDocs />} />

          {/* Legacy gradebook route (redirects to class-level view) */}
          <Route path="/gradebook" element={<ProGate featureName="Gradebook"><Gradebook /></ProGate>} />
          <Route path="/student-grades" element={<StudentLayout><StudentGrades /></StudentLayout>} />
          <Route path="/student-grades/:classId" element={<StudentLayout><StudentGrades /></StudentLayout>} />

          {/* ePortfolio */}
          <Route path="/portfolio" element={<StudentLayout><Portfolio /></StudentLayout>} />
          <Route path="/portfolio/:studentId" element={<StudentLayout><Portfolio /></StudentLayout>} />

          {/* Catch-all: unknown paths show a simple "Page not found" with link home */}
          <Route path="*" element={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24, fontFamily: 'system-ui, sans-serif', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Page not found</h1>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 15 }}>The link may be broken or the page was moved.</p>
              <Link to="/" style={{ padding: '12px 24px', background: 'var(--color-accent)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>Go to Home</Link>
            </div>
          } />
        </Routes>
        </React.Suspense>
        </main>
      </BrowserRouter>
          </LTIProvider>
          </SocketProvider>
          </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
  </React.StrictMode>
    );
  } catch (err) {
    console.error("App failed to mount:", err);
    rootEl.innerHTML = `<div style="padding:40px;font-family:system-ui;max-width:600px;margin:0 auto"><h2 style="color:#dc2626">Failed to load app</h2><pre style="background:#fef2f2;padding:16px;border-radius:8px;overflow:auto;font-size:13px">${String(err.message)}\n\n${err.stack || ""}</pre><button onclick="location.reload()" style="margin-top:12px;padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Reload</button></div>`;
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations?.().then(regs => regs.forEach(r => r.unregister()));
    } else {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  });
}
