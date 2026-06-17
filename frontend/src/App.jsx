import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Settings, GraduationCap, Compass, BookOpen, Star, Award, LogOut, CheckCircle } from 'lucide-react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import STEMModule from './STEMModule';
import PhysicalActivityModule from './PhysicalActivityModule';
import ParentActivityReport from './components/ParentActivityReport';
import TeacherActivityAnalytics from './components/TeacherActivityAnalytics';
import { CartoonButton, CartoonCard } from './components/Reusables';
import { eventBus } from './shared/eventBus';
import { API_BASE } from './config';

export default function App() {
  const navigate = useNavigate();
  
  // Dashboard view toggle: 'parent' | 'teacher'
  const [dashboardView, setDashboardView] = useState('parent');
  
  // Parent dashboard state synchronized from sub-modules
  const [parentStats, setParentStats] = useState({
    stars: 15,
    level: 1,
    badges: [],
    readinessScore: 0
  });

  const [notification, setNotification] = useState(null);

  const handleSTEMProgressUpdate = (progressData) => {
    setParentStats({
      stars: progressData.stars,
      level: progressData.level,
      badges: progressData.badges,
      readinessScore: progressData.readinessScore
    });

    showNotification(`🔄 Parent Dashboard Synchronized: Readiness is now ${progressData.readinessScore}%! Earned ${progressData.stars} total stars.`);
  };

  const handlePhysicalActivityProgressUpdate = (progressData) => {
    setParentStats(prev => ({
      ...prev,
      stars: progressData.stars
    }));
    showNotification(`🔄 Physical Activity Synchronized: Earned ${progressData.stars} total stars!`);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Listen to Cross Application Event triggers
  useEffect(() => {
    // Listen for automatic break assignment
    const unsubscribeAssign = eventBus.subscribe('PHYSICAL_ACTIVITY_ASSIGNMENT', (data) => {
      console.log('📬 [App] Captured PHYSICAL_ACTIVITY_ASSIGNMENT trigger:', data);
      showNotification(`🏃‍♂️ Physical Break Assigned! Launching break lab...`);
      // Redirect to physical break routing portal
      navigate('/physical-activity');
    });

    // Listen for completed break to route back to origin app
    const unsubscribeComplete = eventBus.subscribe('ACTIVITY_COMPLETED', (data) => {
      console.log('📬 [App] Captured ACTIVITY_COMPLETED event:', data);
      showNotification(`🎉 Break completed! Returning to study workspace.`);
      if (data.sourceModule === 'STEM_APP') {
        navigate('/stem');
      } else {
        navigate('/');
      }
    });

    // Listen for skipped break to route back to origin app
    const unsubscribeSkip = eventBus.subscribe('ACTIVITY_SKIPPED', (data) => {
      console.log('📬 [App] Captured ACTIVITY_SKIPPED event:', data);
      showNotification(`⚠️ Break skipped. Returning to study workspace.`);
      if (data.sourceModule === 'STEM_APP') {
        navigate('/stem');
      } else {
        navigate('/');
      }
    });

    // Wildcard-like listeners for session completions across all subjects
    const handleSessionCompleted = async (data) => {
      console.log('📬 [App] Captured session completion event:', data);
      try {
        const response = await fetch(`${API_BASE}/activity/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: data.studentId,
            grade: data.grade || 'Grade 2',
            sourceModule: data.sourceModule || 'STEM_APP'
          })
        });
        if (response.ok) {
          const resData = await response.json();
          // Publish PHYSICAL_ACTIVITY_ASSIGNMENT to trigger navigation and load the break session
          eventBus.publish('PHYSICAL_ACTIVITY_ASSIGNMENT', {
            studentId: data.studentId,
            sessionId: resData.sessionId,
            activityId: resData.activityId,
            sourceModule: data.sourceModule || 'STEM_APP',
            activityDetail: resData.nextRecommendedActivity
          });
        }
      } catch (err) {
        console.error('Failed to auto-assign physical break:', err);
      }
    };

    const unsubscribeStem = eventBus.subscribe('STEM_SESSION_COMPLETED', handleSessionCompleted);
    const unsubscribeMath = eventBus.subscribe('MATH_SESSION_COMPLETED', handleSessionCompleted);
    const unsubscribeEnglish = eventBus.subscribe('ENGLISH_SESSION_COMPLETED', handleSessionCompleted);
    const unsubscribeLogic = eventBus.subscribe('LOGIC_SESSION_COMPLETED', handleSessionCompleted);

    return () => {
      unsubscribeAssign();
      unsubscribeComplete();
      unsubscribeSkip();
      unsubscribeStem();
      unsubscribeMath();
      unsubscribeEnglish();
      unsubscribeLogic();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-slate-800 font-sans selection:bg-indigo-100 flex flex-col justify-between">
      
      {/* Dynamic Sync Notification Banner */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-cartoon border-2 border-slate-700 z-50 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          {notification}
        </div>
      )}

      <Routes>
        {/* Parent Home Dashboard */}
        <Route path="/" element={
          <>
            {/* Main Parent/Teacher Header */}
            <header className="glass border-b-4 border-slate-800 py-4 px-6 shadow-sm sticky top-0 z-40">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                
                {/* Logo */}
                <div className="flex items-center gap-2.5 select-none">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-10 h-10 rounded-2xl flex items-center justify-center border-2 border-slate-800 shadow-cartoon">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <span className="font-black text-xl text-slate-800 tracking-wider flex items-center gap-1.5">
                      EduCare AI <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-md">PORTAL</span>
                    </span>
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-[-2px]">
                      Unified Learning Hub
                    </p>
                  </div>
                </div>

                {/* Dashboard View Switcher */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDashboardView('parent')}
                    className={`px-4 py-1.5 rounded-xl font-black text-xs border-2 shadow-cartoon transition-all hover:scale-102 active:scale-98 ${
                      dashboardView === 'parent' 
                        ? 'bg-indigo-600 text-white border-slate-800' 
                        : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
                    }`}
                  >
                    Parent Hub 🏠
                  </button>
                  <button 
                    onClick={() => setDashboardView('teacher')}
                    className={`px-4 py-1.5 rounded-xl font-black text-xs border-2 shadow-cartoon transition-all hover:scale-102 active:scale-98 ${
                      dashboardView === 'teacher' 
                        ? 'bg-purple-600 text-white border-slate-800' 
                        : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
                    }`}
                  >
                    Teacher Hub 🎓
                  </button>
                </div>

                {/* Stats Summary */}
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 border-2 border-indigo-200 px-3.5 py-1 rounded-full text-xs font-extrabold text-indigo-700">
                    Global Rank: Explorer 🧭
                  </div>
                  <div className="flex items-center gap-1 bg-amber-100 border-2 border-amber-300 px-3 py-1 rounded-full shadow-cartoon-hover">
                    <span className="text-sm">⭐</span>
                    <span className="font-extrabold text-amber-800 text-sm">{parentStats.stars}</span>
                  </div>
                </div>

              </div>
            </header>

            {/* Main Dashboard Portal Container */}
            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 space-y-10 w-full">
              
              {/* Main Welcome Hero */}
              <CartoonCard color="white" className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-gradient-to-r from-violet-50 to-indigo-50 border-b-6 border-slate-800">
                <div className="space-y-2 text-center md:text-left max-w-xl">
                  <h1 className="text-4xl font-black text-slate-800 tracking-wide leading-tight">
                    Welcome to <span className="text-indigo-600">EduCare AI</span> Learning Academy! 🎓
                  </h1>
                  <p className="text-slate-600 font-semibold text-sm leading-relaxed">
                    Explore personalized classrooms powered by artificial intelligence. Track progress, level up, and unlock rewards across all modules.
                  </p>
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-cartoon animate-bounce-slow">
                  <span className="text-5xl">🎒</span>
                </div>
              </CartoonCard>

              {/* Student Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <CartoonCard color="white" className="flex flex-col justify-between text-center space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">Current Level</span>
                  <span className="text-4xl font-black text-indigo-600">Lvl {parentStats.level}</span>
                  <p className="text-[10px] text-slate-500 font-semibold">Every 5 completed circuits increases level</p>
                </CartoonCard>

                <CartoonCard color="white" className="flex flex-col justify-between text-center space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">STEM Stars</span>
                  <span className="text-4xl font-black text-amber-500">⭐ {parentStats.stars}</span>
                  <p className="text-[10px] text-slate-500 font-semibold">Unlock new challenges at 25 stars</p>
                </CartoonCard>

                <CartoonCard color="white" className="flex flex-col justify-between text-center space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">Readiness Score</span>
                  <span className="text-4xl font-black text-emerald-500">{parentStats.readinessScore}%</span>
                  <p className="text-[10px] text-slate-500 font-semibold">Completed material in active grade</p>
                </CartoonCard>

                <CartoonCard color="white" className="flex flex-col justify-between text-center space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">Badges Unlocked</span>
                  <span className="text-4xl font-black text-purple-600">🏆 {parentStats.badges.length}</span>
                  <p className="text-[10px] text-slate-500 font-semibold">Earn badges for challenges and simulator presets</p>
                </CartoonCard>
              </div>

              {/* Portal Cards Grid */}
              <div className="space-y-4">
                <h3 className="font-black text-2xl text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-500" /> AI Classrooms & Labs
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  {/* 1. STEM & CIRCUITS PORTAL (Active) */}
                  <CartoonCard color="white" className="flex flex-col justify-between h-64 border-l-8 border-l-orange-400 shadow-cartoon hover:shadow-cartoon-hover hover:scale-102 transition-all group">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-3xl">🔌</span>
                        <span className="text-[10px] bg-orange-100 border border-orange-300 text-orange-800 px-2.5 py-0.5 rounded-full font-bold">
                          ACTIVE PORTAL
                        </span>
                      </div>
                      <h4 className="font-extrabold text-lg text-slate-800 group-hover:text-orange-500 transition-colors leading-snug">
                        STEM & Circuit Simulator
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold mt-1.5 leading-relaxed">
                        Construct loops, experiment with LEDs, switches, fans, buzzers, and resistors. Powered by AI struggle hints and standard vs advanced difficulty!
                      </p>
                    </div>
                    <CartoonButton 
                      color="energy" 
                      onClick={() => {
                        navigate('/stem');
                        showNotification("🔌 Loaded independent STEM & Circuit Simulator sandbox!");
                      }}
                      className="w-full"
                    >
                      Enter Simulator Lab 🚀
                    </CartoonButton>
                  </CartoonCard>

                  {/* 2. MATH LAB PORTAL (Locked) */}
                  <CartoonCard color="white" className="flex flex-col justify-between h-64 border-l-8 border-l-slate-300 opacity-60 grayscale group">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-3xl">🧮</span>
                        <span className="text-[10px] bg-slate-100 border text-slate-400 px-2.5 py-0.5 rounded-full font-bold">
                          COMING SOON
                        </span>
                      </div>
                      <h4 className="font-extrabold text-lg text-slate-400 leading-snug">
                        AI Math Lab
                      </h4>
                      <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed">
                        Explore fractions, multiplication tables, and word puzzles under the guidance of our custom AI Math wizard!
                      </p>
                    </div>
                    <CartoonButton color="gray" disabled className="w-full cursor-not-allowed">
                      Locked 🔒
                    </CartoonButton>
                  </CartoonCard>

                  {/* 3. LANGUAGE BUDDY PORTAL (Locked) */}
                  <CartoonCard color="white" className="flex flex-col justify-between h-64 border-l-8 border-l-slate-300 opacity-60 grayscale group">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-3xl">🗣️</span>
                        <span className="text-[10px] bg-slate-100 border text-slate-400 px-2.5 py-0.5 rounded-full font-bold">
                          COMING SOON
                        </span>
                      </div>
                      <h4 className="font-extrabold text-lg text-slate-400 leading-snug">
                        AI Language Buddy
                      </h4>
                      <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed">
                        Learn spellings, write descriptive essays, and participate in funny story challenges with our interactive tutor Sparky!
                      </p>
                    </div>
                    <CartoonButton color="gray" disabled className="w-full cursor-not-allowed">
                      Locked 🔒
                    </CartoonButton>
                  </CartoonCard>

                  {/* 4. PHYSICAL ACTIVITY PORTAL (Active) */}
                  <CartoonCard color="white" className="flex flex-col justify-between h-64 border-l-8 border-l-indigo-400 shadow-cartoon hover:shadow-cartoon-hover hover:scale-102 transition-all group">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-3xl">🏃‍♂️</span>
                        <span className="text-[10px] bg-indigo-100 border border-indigo-300 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">
                          ACTIVE PORTAL
                        </span>
                      </div>
                      <h4 className="font-extrabold text-lg text-slate-800 group-hover:text-indigo-500 transition-colors leading-snug">
                        Physical Activity Lab
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold mt-1.5 leading-relaxed">
                        Follow guided physical exercise, yoga, stretching, and coordination breaks. Integrated with academic learning telemetry and stars rewards!
                      </p>
                    </div>
                    <CartoonButton 
                      color="science" 
                      onClick={() => {
                        navigate('/physical-activity');
                        showNotification("🏃‍♂️ Loaded Physical Activity break workspace!");
                      }}
                      className="w-full"
                    >
                      Enter Activity Lab 🚀
                    </CartoonButton>
                  </CartoonCard>

                </div>
              </div>

              {/* Conditional Dashboards Rendering */}
              <div className="pt-4 border-t-2 border-slate-150">
                {dashboardView === 'parent' ? (
                  <ParentActivityReport studentId="student_123" />
                ) : (
                  <TeacherActivityAnalytics />
                )}
              </div>

            </main>

            {/* Parent Footer */}
            <footer className="bg-slate-900 border-t-4 border-slate-950 text-slate-400 py-6 px-6 text-center text-xs font-bold mt-12">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <span>© 2026 EduCare AI Parent System. All modules unified.</span>
                </div>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-white transition-colors">Contact Administrator</a>
                </div>
              </div>
            </footer>
          </>
        } />
        
        {/* STEM Modular Routing Subtree */}
        <Route path="/stem/*" element={
          <STEMModule 
            studentId="student_123"
            onProgressUpdate={handleSTEMProgressUpdate}
            onExit={() => {
              navigate('/');
              showNotification("🏠 Returned to Parent Hub Dashboard.");
            }}
          />
        } />

        {/* Physical Activity Modular Routing Subtree */}
        <Route path="/physical-activity/*" element={
          <PhysicalActivityModule 
            studentId="student_123"
            onProgressUpdate={handlePhysicalActivityProgressUpdate}
            onExit={() => {
              navigate('/');
              showNotification("🏠 Returned to Parent Hub Dashboard.");
            }}
          />
        } />
      </Routes>
    </div>
  );
}
