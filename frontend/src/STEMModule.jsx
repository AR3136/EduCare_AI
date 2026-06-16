import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { API_BASE } from './config';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const LessonPortal = React.lazy(() => import('./pages/LessonPortal'));
const SimulatorPage = React.lazy(() => import('./pages/SimulatorPage'));
const LessonsPage = React.lazy(() => import('./pages/LessonsPage'));
const RewardsPage = React.lazy(() => import('./pages/RewardsPage'));
const ProgressPage = React.lazy(() => import('./pages/ProgressPage'));

// Error Boundary for production robustness
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md border-4 border-rose-200">
            <h1 className="text-4xl mb-4">⚠️</h1>
            <h2 className="text-xl font-black text-slate-800 mb-2">Oops! Something went wrong.</h2>
            <p className="text-sm text-slate-500 mb-6">Our lab encountered a technical glitch.</p>
            <button onClick={() => window.location.reload()} className="bg-rose-500 text-white px-6 py-2 rounded-xl font-bold">Reload Lab</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Extracted wrapper to fix React Hook rules
const LessonWrapper = ({ lessons, stars, handleCompleteLesson, navigate }) => {
  const { id } = useParams();
  const activeLessonIndex = lessons.findIndex(l => l.id === id);
  
  useEffect(() => {
    if (activeLessonIndex === -1) {
      const t = setTimeout(() => navigate('/stem'), 2000);
      return () => clearTimeout(t);
    }
  }, [activeLessonIndex, navigate]);

  if (activeLessonIndex === -1) {
    return (
      <div className="text-center py-20 font-bold text-slate-400">
        🎒 Lesson not found! Redirecting to Dashboard...
      </div>
    );
  }

  const activeLesson = lessons[activeLessonIndex];
  const gradeLessons = lessons.filter(l => l.grade === activeLesson.grade);
  const gradeIndex = gradeLessons.findIndex(l => l.id === id);
  const nextLesson = gradeIndex >= 0 && gradeIndex + 1 < gradeLessons.length ? gradeLessons[gradeIndex + 1] : null;

  return (
    <LessonPortal
      lesson={activeLesson}
      nextLessonId={nextLesson ? nextLesson.id : null}
      stars={stars}
      onBack={() => navigate('/stem')}
      onCompleteLesson={handleCompleteLesson}
    />
  );
};

export default function STEMModule({ 
  studentId = 'default_student',
  onProgressUpdate = null, // callback to notify parent dashboard
  onExit = null // callback to return to parent Home screen
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedGrade, setSelectedGrade] = useState('KG');
  const [stars, setStars] = useState(15);
  const [badges, setBadges] = useState([]);
  const [level, setLevel] = useState(1);
  const [lessons, setLessons] = useState([]);
  
  // Gamification Overlays state
  const [levelUpData, setLevelUpData] = useState(null);
  const [unlockedBadge, setUnlockedBadge] = useState(null);

  // Sync state from server on launch (fallback to localStorage)
  useEffect(() => {
    async function loadProgress() {
      try {
        let allLessons = [];
        try {
          const currRes = await fetch(`${API_BASE}/stem/curriculum`);
          if (currRes.ok) allLessons = await currRes.json();
        } catch (e) { console.warn('Failed to load curriculum from server'); }

        const response = await fetch(`${API_BASE}/stem/progress?studentId=${studentId}`);
        if (response.ok) {
          const data = await response.json();
          setStars(data.stars || 15);
          setBadges(data.badges || []);
          setLevel(data.level || 1);
          if (data.completedLessons && allLessons.length > 0) {
            setLessons(allLessons.map(l => ({
              ...l,
              completed: data.completedLessons.includes(l.id)
            })));
          } else if (allLessons.length > 0) {
            setLessons(allLessons.map(l => ({ ...l, completed: false })));
          }
        } else {
          throw new Error('Offline');
        }
      } catch (err) {
        // LocalStorage Fallback
        const savedStars = localStorage.getItem(`educare_stars_${studentId}`);
        const savedBadges = localStorage.getItem(`educare_badges_${studentId}`);
        const savedLessons = localStorage.getItem(`educare_lessons_${studentId}`);
        const savedLevel = localStorage.getItem(`educare_level_${studentId}`);
        
        if (savedStars) setStars(parseInt(savedStars));
        if (savedBadges) setBadges(JSON.parse(savedBadges));
        if (savedLevel) setLevel(parseInt(savedLevel));
        if (savedLessons) {
          const completedIds = JSON.parse(savedLessons);
          // If we have no lessons fetched, we can't set them easily. We rely on the backend.
        }
      }
    }
    loadProgress();
  }, [studentId]);

  const saveProgressOnServer = async (newStars, newBadges, completedIds, newLevel) => {
    try {
      const response = await fetch(`${API_BASE}/stem/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          stars: newStars,
          badges: newBadges,
          completedLessons: completedIds,
          level: newLevel,
          grade: selectedGrade
        })
      });

      if (response.ok && onProgressUpdate) {
        const result = await response.json();
        // Notify parent dashboard of progress update
        onProgressUpdate({
          studentId,
          stars: newStars,
          level: newLevel,
          badges: newBadges,
          readinessScore: result.data ? result.data.readinessScore : 0
        });
      }
    } catch (err) {
      // Offline fallback
      localStorage.setItem(`educare_stars_${studentId}`, newStars.toString());
      localStorage.setItem(`educare_badges_${studentId}`, JSON.stringify(newBadges));
      localStorage.setItem(`educare_lessons_${studentId}`, JSON.stringify(completedIds));
      localStorage.setItem(`educare_level_${studentId}`, newLevel.toString());

      if (onProgressUpdate) {
        // Calculate mock readiness score
        const completedCount = completedIds.length;
        const readinessScore = Math.min(Math.round((completedCount / 5) * 100), 100);
        onProgressUpdate({
          studentId,
          stars: newStars,
          level: newLevel,
          badges: newBadges,
          readinessScore
        });
      }
    }
  };

  const handleStartLesson = (lesson) => {
    navigate(`/stem/lessons/${lesson.id}`);
  };

  const handleCompleteLesson = (lessonId, badgeEarned, nextLessonId = null) => {
    // 1. Mark lesson completed
    const updatedLessons = lessons.map(l => l.id === lessonId ? { ...l, completed: true } : l);
    setLessons(updatedLessons);

    // 2. Add stars (e.g. +5 stars)
    const isFirstTime = !lessons.find(l => l.id === lessonId)?.completed;
    const additionalStars = isFirstTime ? 5 : 2; // bonus for first time
    const newStars = stars + additionalStars;
    setStars(newStars);

    // 3. Collect completed lists
    const completedIds = updatedLessons.filter(l => l.completed).map(l => l.id);

    // 4. Level calculation: Level increases after every 5 successful circuits
    const calculatedLevel = Math.floor(completedIds.length / 5) + 1;
    let levelIncreased = false;
    let oldLevel = level;
    if (calculatedLevel > level) {
      setLevel(calculatedLevel);
      levelIncreased = true;
    }

    // 5. Unlocks badges
    const newBadges = [...badges];
    let badgeNotification = null;

    if (badgeEarned && !newBadges.includes(badgeEarned)) {
      newBadges.push(badgeEarned);
    }

    if (completedIds.length >= 2 && !newBadges.includes('junior_engineer')) {
      newBadges.push('junior_engineer');
      badgeNotification = { id: 'junior_engineer', label: 'Junior Engineer', icon: '🛠️' };
    }
    if (completedIds.length >= 5 && !newBadges.includes('circuit_master')) {
      newBadges.push('circuit_master');
      badgeNotification = { id: 'circuit_master', label: 'Circuit Master', icon: '👑' };
    }
    if (newStars >= 30 && !newBadges.includes('stem_explorer')) {
      newBadges.push('stem_explorer');
      badgeNotification = { id: 'stem_explorer', label: 'STEM Explorer', icon: '🌍' };
    }

    setBadges(newBadges);

    // 6. Save to database
    saveProgressOnServer(newStars, newBadges, completedIds, calculatedLevel);

    // 7. Trigger overlays
    if (levelIncreased) {
      setLevelUpData({ oldLevel, newLevel: calculatedLevel });
    }
    if (badgeNotification) {
      setUnlockedBadge(badgeNotification);
    }

    // 8. Navigate back to dashboard or next lesson
    if (nextLessonId) {
      navigate(`/stem/lessons/${nextLessonId}`);
    } else {
      navigate('/stem');
    }
  };

  const handleProgressSaved = (newStars, newBadges, newLessons) => {
    setStars(newStars);
    
    // Check level calculations
    const calculatedLevel = Math.floor(newLessons.length / 5) + 1;
    let levelIncreased = false;
    let oldLevel = level;
    if (calculatedLevel > level) {
      setLevel(calculatedLevel);
      levelIncreased = true;
    }

    // Check Badge unlocking triggers
    const updatedBadges = [...newBadges];
    let badgeNotification = null;

    if (newLessons.length >= 2 && !updatedBadges.includes('junior_engineer')) {
      updatedBadges.push('junior_engineer');
      badgeNotification = { id: 'junior_engineer', label: 'Junior Engineer', icon: '🛠️' };
    }
    if (newLessons.length >= 5 && !updatedBadges.includes('circuit_master')) {
      updatedBadges.push('circuit_master');
      badgeNotification = { id: 'circuit_master', label: 'Circuit Master', icon: '👑' };
    }
    if (newStars >= 30 && !updatedBadges.includes('stem_explorer')) {
      updatedBadges.push('stem_explorer');
      badgeNotification = { id: 'stem_explorer', label: 'STEM Explorer', icon: '🌍' };
    }
    if (updatedBadges.includes('sim_wizard') && !badges.includes('sim_wizard')) {
      badgeNotification = { id: 'sim_wizard', label: 'Simulator Wizard', icon: '🧙‍♂️' };
    }

    setBadges(updatedBadges);
    saveProgressOnServer(newStars, updatedBadges, newLessons, calculatedLevel);

    if (levelIncreased) {
      setLevelUpData({ oldLevel, newLevel: calculatedLevel });
    }
    if (badgeNotification) {
      setUnlockedBadge(badgeNotification);
    }
  };

  const handleStartSimulator = () => {
    navigate('/stem/simulator');
  };

  const activeGradeLessons = lessons.filter(l => l.grade === selectedGrade);

  // Removed LessonWrapper from render scope to resolve eslint hook violation

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#faf8f5]">
      {/* Standalone Sub-Header */}
      <header className="glass sticky top-0 z-40 border-b-4 border-slate-800 py-4 px-6 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo and Exit to Parent Home */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              {onExit && (
                <button 
                  onClick={onExit}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border-2 border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-cartoon-hover transition-all active:translate-y-0.5 shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Leave Lab
                </button>
              )}
              <div 
                onClick={() => navigate('/stem')}
                className="flex items-center gap-2.5 cursor-pointer hover:scale-102 transition-transform select-none"
              >
                <div className="bg-gradient-to-br from-amber-400 to-yellow-300 w-10 h-10 rounded-2xl flex items-center justify-center border-2 border-slate-800 shadow-cartoon">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <span className="font-black text-xl text-slate-800 tracking-wider flex items-center gap-1.5 leading-none">
                    EduCare AI <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-md">STEM</span>
                  </span>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-[2px]">
                    Circuit & Energy Lab
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile-only stats display */}
            <div className="flex md:hidden items-center gap-2">
              <div className="bg-indigo-100 border border-indigo-300 px-2.5 py-0.5 rounded-full font-bold text-indigo-800 text-[10px]">
                Lvl {level}
              </div>
              <div className="flex items-center gap-0.5 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full text-[10px]">
                <span>⭐</span>
                <span className="font-extrabold text-amber-800">{stars}</span>
              </div>
            </div>
          </div>

          {/* Desktop Sub Navigation Tab Link bar */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <Link 
              to="/stem" 
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${location.pathname === '/stem' || location.pathname === '/stem/' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              🏠 Dashboard
            </Link>
            <Link 
              to="/stem/lessons" 
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${location.pathname === '/stem/lessons' || location.pathname === '/stem/lessons/' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              📚 Lessons
            </Link>
            <Link 
              to="/stem/simulator" 
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${location.pathname === '/stem/simulator' || location.pathname === '/stem/simulator/' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              🧪 Simulator
            </Link>
            <Link 
              to="/stem/rewards" 
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${location.pathname === '/stem/rewards' || location.pathname === '/stem/rewards/' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              🏆 Rewards
            </Link>
            <Link 
              to="/stem/progress" 
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${location.pathname === '/stem/progress' || location.pathname === '/stem/progress/' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              📊 Progress
            </Link>
          </nav>

          {/* Desktop stats tracker */}
          <div className="hidden md:flex items-center gap-4">
            <div className="bg-indigo-100 border-2 border-indigo-300 px-3.5 py-1 rounded-full shadow-cartoon-hover font-bold text-indigo-800 text-xs">
              Lvl {level}
            </div>
            <div className="flex items-center gap-1 bg-amber-100 border-2 border-amber-300 px-3 py-1 rounded-full shadow-cartoon-hover">
              <span className="text-sm">⭐</span>
              <span className="font-extrabold text-amber-800 text-sm">{stars}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Pages Router Container */}
      <main className="flex-1 pb-20 md:pb-6">
        <ErrorBoundary>
          <React.Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-400 animate-pulse">Loading Lab...</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={
                <Dashboard
                  selectedGrade={selectedGrade}
                  setSelectedGrade={setSelectedGrade}
                  stars={stars}
                  badges={badges}
                  onStartSimulator={handleStartSimulator}
                  onStartLesson={handleStartLesson}
                  lessons={activeGradeLessons}
                />
              } />

              <Route path="/lessons" element={
                <LessonsPage
                  selectedGrade={selectedGrade}
                  stars={stars}
                  completedLessons={lessons.filter(l => l.completed).map(l => l.id)}
                />
              } />

              <Route path="/lessons/:id" element={
                <LessonWrapper 
                  lessons={lessons} 
                  stars={stars} 
                  handleCompleteLesson={handleCompleteLesson} 
                  navigate={navigate} 
                />
              } />

              <Route path="/simulator" element={
                <SimulatorPage
                  onBack={() => navigate('/stem')}
                  grade={selectedGrade}
                  onProgressSaved={handleProgressSaved}
                />
              } />

              <Route path="/rewards" element={
                <RewardsPage
                  stars={stars}
                  badges={badges}
                  level={level}
                  completedLessons={lessons.filter(l => l.completed).map(l => l.id)}
                />
              } />

              <Route path="/progress" element={
                <ProgressPage
                  studentId={studentId}
                  stars={stars}
                  level={level}
                  badges={badges}
                  completedLessons={lessons.filter(l => l.completed).map(l => l.id)}
                  selectedGrade={selectedGrade}
                />
              } />
            </Routes>
          </React.Suspense>
        </ErrorBoundary>
      </main>

      {/* Responsive Mobile Bottom Navigation Menu */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-slate-800 p-2 flex justify-around md:hidden z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Link 
          to="/stem" 
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black ${location.pathname === '/stem' || location.pathname === '/stem/' ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}
        >
          <span className="text-xl">🏠</span>
          <span>Home</span>
        </Link>
        <Link 
          to="/stem/lessons" 
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black ${location.pathname.startsWith('/stem/lessons') ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}
        >
          <span className="text-xl">📚</span>
          <span>Lessons</span>
        </Link>
        <Link 
          to="/stem/simulator" 
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black ${location.pathname === '/stem/simulator' ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}
        >
          <span className="text-xl">🧪</span>
          <span>Simulator</span>
        </Link>
        <Link 
          to="/stem/rewards" 
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black ${location.pathname === '/stem/rewards' ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}
        >
          <span className="text-xl">🏆</span>
          <span>Rewards</span>
        </Link>
        <Link 
          to="/stem/progress" 
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black ${location.pathname === '/stem/progress' ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}
        >
          <span className="text-xl">📊</span>
          <span>Progress</span>
        </Link>
      </nav>

      {/* Level Up & Badge overlays */}
      {levelUpData && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-cartoon-xl text-center space-y-6 animate-bounce-slow">
            <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto border-4 border-slate-800 shadow-cartoon">
              <span className="text-4xl">⚡</span>
            </div>
            <h2 className="text-3xl font-black text-slate-800">Level Up! 🎉</h2>
            <div className="flex items-center justify-center gap-4 bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl">
              <div>
                <span className="text-xs text-slate-400 font-extrabold uppercase">Old Level</span>
                <div className="text-2xl font-black text-slate-400">Lvl {levelUpData.oldLevel}</div>
              </div>
              <span className="text-2xl text-slate-400">➡️</span>
              <div>
                <span className="text-xs text-indigo-500 font-extrabold uppercase">New Level</span>
                <div className="text-3xl font-black text-indigo-700">Lvl {levelUpData.newLevel}</div>
              </div>
            </div>
            <button
              onClick={() => setLevelUpData(null)}
              className="w-full py-3 bg-power-400 hover:bg-power-500 text-white rounded-2xl font-bold tracking-wider border-b-4 border-power-600 shadow-cartoon"
            >
              Awesome! Continue 🚀
            </button>
          </div>
        </div>
      )}

      {unlockedBadge && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-cartoon-xl text-center space-y-6 animate-bounce-slow">
            <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center mx-auto border-4 border-slate-800 shadow-cartoon">
              <span className="text-5xl">{unlockedBadge.icon}</span>
            </div>
            <h2 className="text-2xl font-black text-amber-950 uppercase">🏆 Badge Unlocked!</h2>
            <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl">
              <span className="text-lg font-black text-amber-900 block">{unlockedBadge.label}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 block">
                {unlockedBadge.id === 'junior_engineer' && 'Successfully completed 2 circuits!'}
                {unlockedBadge.id === 'circuit_master' && 'Completed all 5 standard lessons!'}
                {unlockedBadge.id === 'stem_explorer' && 'Earned 30 or more stars!'}
                {unlockedBadge.id === 'sim_wizard' && 'Completed all CircuitJS1 lab presets!'}
              </span>
            </div>
            <button
              onClick={() => setUnlockedBadge(null)}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-800 rounded-2xl font-bold tracking-wider border-b-4 border-amber-600 shadow-cartoon"
            >
              Claim Reward! ⭐
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
