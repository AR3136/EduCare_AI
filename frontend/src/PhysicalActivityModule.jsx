import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Check, Smile, Compass, Star, Award, Heart, RefreshCw, Volume2, VolumeX, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { API_BASE } from './config';
import { CartoonCard, CartoonButton } from './components/Reusables';

// Web Audio API Sound Synthesizer for Rich Interactive Feedback
const playSound = (type, muted = false) => {
  if (muted) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'start') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        g.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.4);
        o.start(ctx.currentTime + i * 0.08);
        o.stop(ctx.currentTime + i * 0.08 + 0.4);
      });
    } else if (type === 'skip') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn('Web Audio synthesis failed:', e);
  }
};

export default function PhysicalActivityModule({
  studentId = 'default_student',
  grade = 'Grade 2',
  sourceModule = 'STEM_APP',
  onProgressUpdate = null,
  onExit = null
}) {
  // Navigation / Views: 'assigned' | 'active' | 'completed' | 'skipped' | 'loading'
  const [view, setView] = useState('loading');
  const [muted, setMuted] = useState(false);
  
  // Integration Identifiers (Stored locally as requested)
  const [storedSessionId, setStoredSessionId] = useState(null);
  const [storedSourceModule, setStoredSourceModule] = useState(sourceModule);
  
  // Activity state
  const [currentActivity, setCurrentActivity] = useState(null);
  const [nextRecommended, setNextRecommended] = useState(null);
  
  // Game states
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPaused, setIsPaused] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [engagementScore, setEngagementScore] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(15);
  
  // Skip Form State
  const [skipReason, setSkipReason] = useState('NOT_INTERESTED');
  const [skipDetail, setSkipDetail] = useState('');
  
  // Completion Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackEmoji, setFeedbackEmoji] = useState('😃');
  const [feedbackComment, setFeedbackComment] = useState('');
  
  const timerRef = useRef(null);

  const synthRef = useRef(window.speechSynthesis);
  const [voice, setVoice] = useState(null);

  // Initialize Speech synthesis voice
  useEffect(() => {
    const loadVoices = () => {
      if (!synthRef.current) return;
      const voices = synthRef.current.getVoices();
      const chosenVoice = voices.find(v => v.lang.includes('en') && 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Samantha'))
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      setVoice(chosenVoice);
    };

    loadVoices();
    if (synthRef.current) {
      synthRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = (text) => {
    if (muted || !synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.pitch = 1.35;
    utterance.rate = 0.95;
    synthRef.current.speak(utterance);
  };

  // Speak descriptions on view/step transitions
  useEffect(() => {
    if (muted) {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      return;
    }
    if (!currentActivity) return;

    if (view === 'assigned') {
      speak(`Time for a break! Let's do ${currentActivity.title}. ${currentActivity.description} Click start when you are ready!`);
    } else if (view === 'active') {
      const step = currentActivity.instructions[currentStep];
      if (step) {
        speak(`Step ${currentStep + 1} of ${currentActivity.instructions.length}. ${step.description}`);
      }
    } else if (view === 'completed') {
      speak(`Fantastic job! Break completed! You earned 5 stars!`);
    } else if (view === 'skipped') {
      speak("That's okay! Let's find another activity.");
    }
  }, [view, currentStep, currentActivity, muted, voice]);

  // Load and Assign Activity on Mount
  useEffect(() => {
    fetchAssignedActivity();
    return () => clearInterval(timerRef.current);
  }, [studentId, grade]);

  // Fetch Activity API Call
  const fetchAssignedActivity = async (targetActivityId = null) => {
    setView('loading');
    try {
      const response = await fetch(`${API_BASE}/activity/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          grade,
          sourceModule: storedSourceModule,
          activityId: targetActivityId
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentActivity(data.nextRecommendedActivity || data.activity || null);
        setStoredSessionId(data.sessionId);
        setEngagementScore(data.engagementScore || 0);
        setRewardPoints(data.rewardPoints || 15);
        
        // Setup timer based on duration
        const duration = data.nextRecommendedActivity ? data.nextRecommendedActivity.durationSeconds : 60;
        setTimeLeft(duration);
        setCurrentStep(0);
        setIsPaused(true);
        setView('assigned');
        
        // Fetch next recommendation in background
        fetchNextRecommendation(data.sessionId);
      } else {
        throw new Error('Failed response');
      }
    } catch (e) {
      console.warn('API connection failed, activating client fallback...');
      setupOfflineFallback(targetActivityId);
    }
  };

  // Background Recommendation Fetch
  const fetchNextRecommendation = async (sessId) => {
    try {
      const response = await fetch(`${API_BASE}/activity/recommendation?studentId=${studentId}&grade=${grade}&sourceModule=${storedSourceModule}`);
      if (response.ok) {
        const data = await response.json();
        setNextRecommended(data.nextRecommendedActivity);
      }
    } catch (e) {
      console.log('Background recommendation fetch offline');
    }
  };

  // Offline fallback setup (guarantees plug-and-play works offline)
  const setupOfflineFallback = (targetActivityId) => {
    const fallbackCatalog = [
      {
        activityId: "act_stretching_kg_1",
        title: "Super-Stretch Reach",
        description: "Reach for the stars and touch your toes! A gentle stretching routine to wake up your body and focus your mind.",
        emoji: "🙆",
        category: "stretching",
        moodTags: ["calm", "focus"],
        gradeLevels: ["KG", "Grade 1", "Grade 2"],
        durationSeconds: 60,
        instructions: [
          { stepNumber: 1, description: "Stand up straight with your feet slightly apart. Raise your hands high above your head.", durationSeconds: 20 },
          { stepNumber: 2, description: "Slowly bend forward at your waist and reach down towards your toes. Keep knees slightly bent.", durationSeconds: 20 },
          { stepNumber: 3, description: "Roll your body up slowly and take a deep breath in. Shake out your limbs.", durationSeconds: 20 }
        ],
        starsOnCompletion: 3,
        difficultyLevel: 1
      },
      {
        activityId: "act_yoga_g1_4",
        title: "Tree Pose Balance",
        description: "Grow tall like a tree! A balance exercise to build strength in legs, improve focus, and bring calm.",
        emoji: "🌳",
        category: "yoga",
        moodTags: ["calm", "focus", "relax"],
        gradeLevels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4"],
        durationSeconds: 120,
        instructions: [
          { stepNumber: 1, description: "Stand tall. Place the sole of your right foot on the inside of your left leg, below the knee.", durationSeconds: 40 },
          { stepNumber: 2, description: "Bring hands together at your chest or extend branches high in the air. Balance.", durationSeconds: 40 },
          { stepNumber: 3, description: "Lower foot and repeat on the other side, balancing on right leg.", durationSeconds: 40 }
        ],
        starsOnCompletion: 3,
        difficultyLevel: 2
      }
    ];

    const act = fallbackCatalog.find(a => a.activityId === targetActivityId) || fallbackCatalog[0];
    setCurrentActivity(act);
    setStoredSessionId(`offline_sess_${Date.now()}`);
    setTimeLeft(act.durationSeconds);
    setCurrentStep(0);
    setIsPaused(true);
    setView('assigned');
    setNextRecommended(fallbackCatalog[1]);
  };

  // Timer Ticking Logic
  useEffect(() => {
    if (!isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleComplete(); // Auto complete on timer zero
            return 0;
          }
          playSound('tick', muted);
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused, timeLeft, muted]);

  // Button Action: START
  const handleStart = async () => {
    playSound('start', muted);
    setIsPaused(false);
    setView('active');
    
    try {
      await fetch(`${API_BASE}/activity/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          sessionId: storedSessionId,
          grade,
          sourceModule: storedSourceModule
        })
      });
    } catch (e) {
      console.log('Start logged offline');
    }
  };

  // Button Action: PAUSE
  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  // Button Action: COMPLETE
  const handleComplete = async () => {
    setIsPaused(true);
    clearInterval(timerRef.current);
    playSound('success', muted);
    setView('completed');

    try {
      const response = await fetch(`${API_BASE}/activity/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          sessionId: storedSessionId,
          grade,
          sourceModule: storedSourceModule,
          feedback: {
            rating: feedbackRating,
            emoji: feedbackEmoji,
            comment: feedbackComment
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        setRewardPoints(data.rewardPoints);
        setEngagementScore(data.engagementScore);
        if (onProgressUpdate) {
          onProgressUpdate({
            stars: data.rewardPoints,
            engagementScore: data.engagementScore
          });
        }
      }
    } catch (e) {
      // Local fallback rewards update
      const newPoints = rewardPoints + 5;
      setRewardPoints(newPoints);
      if (onProgressUpdate) {
        onProgressUpdate({ stars: newPoints, engagementScore: 75 });
      }
    }
  };

  // Submit Feedback in Completed Screen
  const submitFeedback = async () => {
    try {
      await fetch(`${API_BASE}/activity/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          sessionId: storedSessionId,
          grade,
          sourceModule: storedSourceModule,
          feedback: {
            rating: feedbackRating,
            emoji: feedbackEmoji,
            comment: feedbackComment
          }
        })
      });
    } catch (e) {
      console.log('Feedback submitted offline');
    }
    
    // Return to parent or fetch next recommended
    if (onExit) {
      onExit();
    } else {
      fetchAssignedActivity();
    }
  };

  // Button Action: SKIP
  const handleSkip = () => {
    setIsPaused(true);
    clearInterval(timerRef.current);
    playSound('skip', muted);
    setView('skipped');
  };

  // Submit Skip Reason
  const submitSkip = async () => {
    try {
      const response = await fetch(`${API_BASE}/activity/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          sessionId: storedSessionId,
          grade,
          sourceModule: storedSourceModule,
          skipReason,
          skipReasonDetail: skipDetail
        })
      });
      if (response.ok) {
        const data = await response.json();
        setNextRecommended(data.nextRecommendedActivity);
      }
    } catch (e) {
      console.log('Skip logged offline');
    }
  };

  // Load Alternative Activity after skipping
  const loadAlternative = () => {
    if (nextRecommended) {
      fetchAssignedActivity(nextRecommended.activityId);
    } else {
      fetchAssignedActivity();
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate SVG Timer Stroke Ring Progress
  const getTimerPercentage = () => {
    if (!currentActivity) return 0;
    const total = currentActivity.durationSeconds || 60;
    return ((total - timeLeft) / total) * 100;
  };

  // Step instruction slider control
  const handleNextStep = () => {
    if (currentActivity && currentStep < currentActivity.instructions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // --- SCREEN RENDERS ---

  if (view === 'loading') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-violet-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-cartoon border-4 border-slate-800">
        <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-2xl font-black tracking-wide animate-pulse">Loading Activity Break... 🏃‍♂️</h2>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 select-none">
      
      {/* Upper Module Bar */}
      <header className="flex justify-between items-center bg-slate-900 text-white border-4 border-slate-800 p-4 rounded-3xl mb-6 shadow-cartoon">
        <div className="flex items-center gap-3">
          <CartoonButton size="sm" color="gray" onClick={onExit || (() => {})} className="border-slate-700 active:border-b-0">
            <ArrowLeft className="w-4 h-4" />
          </CartoonButton>
          <div>
            <h1 className="text-lg font-black flex items-center gap-1.5">
              🏃‍♂️ Physical Activity Lab <span className="text-xs bg-indigo-500 px-2 py-0.5 rounded-full font-bold uppercase">Ready</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">EduCare AI Integration Layer</p>
          </div>
        </div>

        {/* HUD Info */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMuted(!muted)} 
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            title={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-indigo-300" />}
          </button>
          
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-2xl text-xs font-black">
            <Star className="w-4 h-4 fill-amber-300" />
            <span>{rewardPoints} Stars</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-2xl text-xs font-black">
            <Heart className="w-4 h-4 fill-emerald-300 animate-pulse" />
            <span>Focus: {engagementScore}%</span>
          </div>
        </div>
      </header>

      {/* Main Screen Container */}
      <main className="min-h-[500px]">

        {/* ─── SCREEN 1: ACTIVITY ASSIGNED ─── */}
        {view === 'assigned' && currentActivity && (
          <CartoonCard color="white" className="border-l-8 border-l-indigo-500 flex flex-col md:flex-row gap-8 items-center p-8 bg-gradient-to-r from-indigo-50/50 to-white">
            
            {/* Mascot / Emoji Avatar */}
            <div className="flex-shrink-0">
              <ActivityIllustration category={currentActivity.category} step={0} />
            </div>

            {/* Content Details */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="text-xs font-black uppercase bg-indigo-100 text-indigo-800 border-2 border-indigo-200 px-2.5 py-0.5 rounded-full">
                  {currentActivity.category}
                </span>
                <span className="text-xs font-black uppercase bg-amber-100 text-amber-800 border-2 border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  ⭐ Difficulty: {currentActivity.difficultyLevel}/5
                </span>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  ⏱️ {formatTime(currentActivity.durationSeconds)}
                </span>
              </div>

              <h2 className="text-3xl font-black text-slate-800 tracking-wide leading-tight">
                Time for a <span className="text-indigo-600">{currentActivity.title}</span> Break!
              </h2>

              <p className="text-slate-600 font-semibold text-sm leading-relaxed max-w-xl">
                {currentActivity.description}
              </p>

              {/* Source module sync tracker */}
              <div className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">
                🔗 Assigned via: <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">{storedSourceModule}</span>
              </div>

              {/* Interactive buttons */}
              <div className="flex gap-4 pt-4 justify-center md:justify-start">
                <CartoonButton color="energy" size="lg" onClick={handleStart} className="flex items-center gap-2">
                  <Play className="w-5 h-5 fill-white" /> Start Activity Break 🚀
                </CartoonButton>
                
                <CartoonButton color="gray" size="lg" onClick={handleSkip} className="flex items-center gap-1">
                  <SkipForward className="w-5 h-5" /> Skip
                </CartoonButton>
              </div>
            </div>
          </CartoonCard>
        )}

        {/* ─── SCREEN 2: ACTIVITY IN PROGRESS ─── */}
        {view === 'active' && currentActivity && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Panel: Circular Timer */}
            <div className="bg-slate-900 border-4 border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-white shadow-cartoon">
              
              {/* Circular SVG Timer Progress */}
              <div className="relative w-44 h-44 mb-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="88"
                    cy="88"
                    r="76"
                    className="stroke-slate-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Progress Indicator */}
                  <circle
                    cx="88"
                    cy="88"
                    r="76"
                    className="stroke-indigo-400 transition-all duration-1000 current-flow"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="478"
                    strokeDashoffset={478 - (478 * getTimerPercentage()) / 100}
                  />
                </svg>
                {/* Timer text */}
                <div className="absolute flex flex-col items-center select-none">
                  <span className="text-4xl font-black font-mono tracking-tight">{formatTime(timeLeft)}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-[-2px]">
                    {isPaused ? "Paused" : "Ticking"}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex gap-3 w-full">
                <CartoonButton 
                  color={isPaused ? "power" : "science"} 
                  onClick={handlePauseToggle} 
                  className="flex-1 flex justify-center items-center gap-1.5"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
                  <span>{isPaused ? "Resume" : "Pause"}</span>
                </CartoonButton>
                
                <CartoonButton 
                  color="gray" 
                  onClick={handleSkip} 
                  className="flex-1 flex justify-center items-center gap-1"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Skip</span>
                </CartoonButton>
              </div>

              {/* Reward Points potential */}
              <div className="mt-4 flex items-center gap-1 text-xs font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-xl w-full justify-center">
                <Award className="w-4 h-4" />
                <span>Completion: +5 Stars</span>
              </div>
            </div>

            {/* Right Panel: Step-by-Step Instructions */}
            <div className="md:col-span-2 bg-white border-4 border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-cartoon">
              
              {/* Step indicator */}
              <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
                <span className="text-xs font-black uppercase text-indigo-500 tracking-wider">
                  Step {currentStep + 1} of {currentActivity.instructions.length}
                </span>
                <span className="text-xs font-extrabold text-slate-400 uppercase">
                  Category: {currentActivity.category}
                </span>
              </div>

              {/* Instruction slide content */}
              <div className="py-8 flex flex-col items-center text-center space-y-4 min-h-[200px] justify-center">
                <div className="mb-2">
                  <ActivityIllustration category={currentActivity.category} step={currentStep} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 px-4 max-w-lg leading-relaxed">
                  {currentActivity.instructions[currentStep] ? currentActivity.instructions[currentStep].description : "Hold pose and stretch!"}
                </h3>
              </div>

              {/* Bottom Nav / Controls */}
              <div className="flex gap-4 items-center">
                <CartoonButton 
                  color="gray" 
                  disabled={currentStep === 0} 
                  onClick={handlePrevStep}
                  className="flex-1"
                >
                  ◀ Prev Step
                </CartoonButton>

                {currentStep < currentActivity.instructions.length - 1 ? (
                  <CartoonButton 
                    color="science" 
                    onClick={handleNextStep}
                    className="flex-1"
                  >
                    Next Step ▶
                  </CartoonButton>
                ) : (
                  <CartoonButton 
                    color="power" 
                    onClick={handleComplete}
                    className="flex-1 flex justify-center items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Complete Break! 🎉
                  </CartoonButton>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ─── SCREEN 3: ACTIVITY COMPLETE ─── */}
        {view === 'completed' && currentActivity && (
          <CartoonCard color="white" className="border-l-8 border-l-emerald-500 text-center max-w-2xl mx-auto p-8 bg-gradient-to-b from-emerald-50/30 to-white">
            
            {/* Success Mascot */}
            <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-cartoon mx-auto mb-6">
              <span className="text-6xl animate-bounce select-none">🎉</span>
            </div>

            <h2 className="text-3xl font-black text-slate-800 tracking-wide">
              Fantastic Job! Break Complete!
            </h2>
            
            <p className="text-slate-500 font-semibold text-sm mt-1 max-w-md mx-auto leading-relaxed">
              Your body is stretched, energized, and ready to learn. You earned some stars!
            </p>

            {/* Stars Awarded Animation Card */}
            <div className="my-6 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 border-4 border-slate-800 text-slate-900 px-8 py-3 rounded-2xl shadow-cartoon">
              <Star className="w-6 h-6 fill-white stroke-slate-900" />
              <span className="text-2xl font-black">+ 5 Stars Granted!</span>
            </div>

            {/* Student Feedback & Mood Selection Form */}
            <div className="border-t-2 border-slate-100 pt-6 mt-6 space-y-4 max-w-md mx-auto text-left">
              <h4 className="font-extrabold text-sm text-slate-700 uppercase tracking-wide">How are you feeling now?</h4>
              
              {/* Emoji Faces selection */}
              <div className="flex justify-between gap-2">
                {[
                  { emoji: '😃', label: 'Great!', val: 5 },
                  { emoji: '🙂', label: 'Good', val: 4 },
                  { emoji: '😐', label: 'Okay', val: 3 },
                  { emoji: '🥱', label: 'Tired', val: 2 },
                  { emoji: '😢', label: 'Sad', val: 1 }
                ].map((item) => (
                  <button
                    key={item.emoji}
                    onClick={() => {
                      setFeedbackEmoji(item.emoji);
                      setFeedbackRating(item.val);
                    }}
                    className={`flex-1 flex flex-col items-center p-3.5 rounded-2xl border-2 transition-all duration-100 hover:scale-105 ${
                      feedbackEmoji === item.emoji 
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-cartoon-hover scale-102 font-black' 
                        : 'bg-white border-slate-200 text-slate-400 font-bold hover:border-slate-300'
                    }`}
                  >
                    <span className="text-3xl mb-1">{item.emoji}</span>
                    <span className="text-[10px] tracking-tight">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Optional comments text box */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Optional Comment</label>
                <input
                  type="text"
                  placeholder="e.g., I loved this exercise!"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full border-2 border-slate-200 focus:border-indigo-400 focus:outline-none rounded-2xl px-4 py-2.5 font-semibold text-sm transition-all"
                />
              </div>

              {/* Submit / Finish */}
              <div className="pt-2 flex gap-3">
                <CartoonButton color="power" size="md" onClick={submitFeedback} className="flex-1 flex justify-center items-center gap-1">
                  <CheckCircle className="w-5 h-5" /> Finish & Submit Feedback
                </CartoonButton>
              </div>
            </div>

          </CartoonCard>
        )}

        {/* ─── SCREEN 4: ACTIVITY SKIPPED ─── */}
        {view === 'skipped' && (
          <CartoonCard color="white" className="border-l-8 border-l-rose-500 max-w-xl mx-auto p-8">
            
            {/* Warning Mascot */}
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-cartoon mb-6">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 tracking-wide">
              Activity Break Skipped
            </h2>
            
            <p className="text-slate-500 font-semibold text-sm mt-1 leading-relaxed">
              That's okay! We want breaks to feel enjoyable. Let us know why you skipped so we can suggest a better exercise next time.
            </p>

            {/* Skip Reason form */}
            <div className="my-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wide">Select Reason</label>
                <select
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  className="w-full border-2 border-slate-200 focus:border-rose-400 focus:outline-none rounded-2xl px-4 py-3 font-semibold text-sm transition-all bg-white"
                >
                  <option value="TOO_HARD">🏋️ Too difficult to perform</option>
                  <option value="TOO_EASY">🥱 Too simple / boring</option>
                  <option value="NOT_INTERESTED">🎨 Not interested in this style</option>
                  <option value="SHORT_ON_TIME">⏰ Short on time / busy</option>
                  <option value="PHYSICAL_PAIN">🤕 Feeling pain / health issue</option>
                  <option value="EQUIPMENT_MISSING">🎒 Missing room space / equipment</option>
                  <option value="OTHER">✏️ Other reason</option>
                </select>
              </div>

              {/* Free-form optional detail */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wide">Add Details (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. My knees hurt today"
                  value={skipDetail}
                  onChange={(e) => setSkipDetail(e.target.value)}
                  className="w-full border-2 border-slate-200 focus:border-rose-400 focus:outline-none rounded-2xl px-4 py-2.5 font-semibold text-sm transition-all"
                />
              </div>

              {/* Trigger skip logging and alternative lookup */}
              <CartoonButton color="energy" onClick={submitSkip} className="w-full justify-center">
                Submit & Find Alternate Activity 🔄
              </CartoonButton>
            </div>

            {/* Next Recommended preview if logged */}
            {nextRecommended ? (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex items-center justify-between mt-6">
                <div className="flex items-center gap-3">
                  <div className="text-4xl bg-white border-2 border-slate-200 w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-cartoon-hover select-none">
                    {nextRecommended.emoji || "🌳"}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm">Suggested Alternative</h5>
                    <p className="text-xs text-slate-400 font-bold uppercase">{nextRecommended.category} ({formatTime(nextRecommended.durationSeconds)})</p>
                  </div>
                </div>
                <CartoonButton size="sm" color="power" onClick={loadAlternative}>
                  Try This One! ▶
                </CartoonButton>
              </div>
            ) : (
              <div className="flex gap-3 justify-end border-t border-slate-100 pt-6">
                <CartoonButton color="gray" onClick={onExit || (() => {})}>
                  Return to Dashboard
                </CartoonButton>
              </div>
            )}

          </CartoonCard>
        )}

      </main>
      
    </div>
  );
}

function ActivityIllustration({ category = 'stretching', step = 0 }) {
  const cat = (category || 'stretching').toLowerCase();

  const animationStyles = `
    @keyframes sway {
      0%, 100% { transform: rotate(-1.5deg); }
      50% { transform: rotate(1.5deg); }
    }
    @keyframes breathe {
      0%, 100% { transform: scale(0.95); }
      50% { transform: scale(1.05); }
    }
    @keyframes raiseArms {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    @keyframes bend {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(4deg); }
    }
    @keyframes wiggle {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(-1px, 0.5px) rotate(-0.5deg); }
      75% { transform: translate(1px, -0.5px) rotate(0.5deg); }
    }
    @keyframes run {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-2px) rotate(0.5deg); }
    }
    @keyframes spinStar {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .animate-sway { animation: sway 3s ease-in-out infinite; transform-origin: center bottom; }
    .animate-breathe { animation: breathe 4s ease-in-out infinite; transform-origin: center; }
    .animate-raise { animation: raiseArms 2s ease-in-out infinite; }
    .animate-bend { animation: bend 2.5s ease-in-out infinite; transform-origin: 60px 75px; }
    .animate-wiggle { animation: wiggle 0.15s linear infinite; }
    .animate-run { animation: run 0.6s ease-in-out infinite; }
    .animate-star { animation: spinStar 10s linear infinite; transform-origin: center; }
  `;

  if (cat === 'yoga') {
    if (step === 0) {
      // Tree pose left leg stand, hands at chest
      return (
        <div className="relative w-36 h-36 bg-emerald-50/50 border-4 border-slate-800 rounded-3xl p-1 shadow-inner overflow-hidden flex items-center justify-center">
          <style>{animationStyles}</style>
          <svg viewBox="0 0 120 120" className="w-full h-full animate-sway">
            <circle cx="60" cy="60" r="45" fill="#A7F3D0" opacity="0.4" />
            <path d="M 30 95 Q 60 85 90 95" stroke="#047857" strokeWidth="2.5" fill="none" strokeDasharray="3 3" />
            {/* Head */}
            <circle cx="60" cy="35" r="12" fill="#FFA07A" stroke="#E26A4F" strokeWidth="2.5" />
            <circle cx="56" cy="33" r="1.5" fill="#2C3E50" />
            <circle cx="64" cy="33" r="1.5" fill="#2C3E50" />
            <path d="M 57 40 Q 60 43 63 40" fill="none" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" />
            {/* Body */}
            <rect x="50" y="47" width="20" height="30" rx="6" fill="#10B981" stroke="#047857" strokeWidth="2.5" />
            {/* Standing Leg (Right) */}
            <line x1="56" y1="77" x2="56" y2="105" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            <line x1="56" y1="105" x2="62" y2="105" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            {/* Bent Leg (Left) */}
            <path d="M 64 77 L 76 88 L 58 88" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Hands at chest - Prayer Pose */}
            <path d="M 42 55 Q 52 62 60 62 Q 68 62 78 55" stroke="#FFA07A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="60" cy="61" r="3" fill="#FFA07A" />
            <circle cx="35" cy="40" r="4" fill="#34D399" />
            <circle cx="85" cy="45" r="5" fill="#34D399" />
          </svg>
        </div>
      );
    } else if (step === 1) {
      // Tree pose left leg stand, branches high
      return (
        <div className="relative w-36 h-36 bg-emerald-50/50 border-4 border-slate-800 rounded-3xl p-1 shadow-inner overflow-hidden flex items-center justify-center">
          <style>{animationStyles}</style>
          <svg viewBox="0 0 120 120" className="w-full h-full animate-sway">
            <circle cx="60" cy="60" r="45" fill="#A7F3D0" opacity="0.4" />
            <path d="M 30 95 Q 60 85 90 95" stroke="#047857" strokeWidth="2.5" fill="none" strokeDasharray="3 3" />
            {/* Head */}
            <circle cx="60" cy="35" r="12" fill="#FFA07A" stroke="#E26A4F" strokeWidth="2.5" />
            <circle cx="56" cy="33" r="1.5" fill="#2C3E50" />
            <circle cx="64" cy="33" r="1.5" fill="#2C3E50" />
            <path d="M 57 40 Q 60 43 63 40" fill="none" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" />
            {/* Body */}
            <rect x="50" y="47" width="20" height="30" rx="6" fill="#10B981" stroke="#047857" strokeWidth="2.5" />
            {/* Standing Leg (Right) */}
            <line x1="56" y1="77" x2="56" y2="105" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            <line x1="56" y1="105" x2="62" y2="105" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            {/* Bent Leg (Left) */}
            <path d="M 64 77 L 76 88 L 58 88" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Branches Raised High */}
            <path d="M 48 55 Q 35 32 30 18" stroke="#FFA07A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 72 55 Q 85 32 90 18" stroke="#FFA07A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="28" cy="16" r="5" fill="#059669" />
            <circle cx="92" cy="16" r="5" fill="#059669" />
          </svg>
        </div>
      );
    } else {
      // Tree pose standing on opposite foot
      return (
        <div className="relative w-36 h-36 bg-emerald-50/50 border-4 border-slate-800 rounded-3xl p-1 shadow-inner overflow-hidden flex items-center justify-center">
          <style>{animationStyles}</style>
          <svg viewBox="0 0 120 120" className="w-full h-full animate-sway">
            <circle cx="60" cy="60" r="45" fill="#A7F3D0" opacity="0.4" />
            <path d="M 30 95 Q 60 85 90 95" stroke="#047857" strokeWidth="2.5" fill="none" strokeDasharray="3 3" />
            {/* Head */}
            <circle cx="60" cy="35" r="12" fill="#FFA07A" stroke="#E26A4F" strokeWidth="2.5" />
            <circle cx="56" cy="33" r="1.5" fill="#2C3E50" />
            <circle cx="64" cy="33" r="1.5" fill="#2C3E50" />
            <path d="M 57 40 Q 60 43 63 40" fill="none" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" />
            {/* Body */}
            <rect x="50" y="47" width="20" height="30" rx="6" fill="#10B981" stroke="#047857" strokeWidth="2.5" />
            {/* Standing Leg (Left) */}
            <line x1="64" y1="77" x2="64" y2="105" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            <line x1="64" y1="105" x2="70" y2="105" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            {/* Bent Leg (Right) */}
            <path d="M 56 77 L 44 88 L 62 88" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Branches Raised High */}
            <path d="M 48 55 Q 35 32 30 18" stroke="#FFA07A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 72 55 Q 85 32 90 18" stroke="#FFA07A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="28" cy="16" r="5" fill="#059669" />
            <circle cx="92" cy="16" r="5" fill="#059669" />
          </svg>
        </div>
      );
    }
  }

  if (cat === 'stretching') {
    if (step === 0) {
      // Stand tall, arms stretched upwards
      return (
        <div className="relative w-36 h-36 bg-amber-50/50 border-4 border-slate-800 rounded-3xl p-1 shadow-inner overflow-hidden flex items-center justify-center">
          <style>{animationStyles}</style>
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle cx="60" cy="60" r="45" fill="#FDE68A" opacity="0.4" />
            <path d="M 30 100 Q 60 92 90 100" stroke="#B45309" strokeWidth="2.5" fill="none" strokeDasharray="3 3" />
            {/* Head */}
            <circle cx="60" cy="35" r="12" fill="#FFA07A" stroke="#E26A4F" strokeWidth="2.5" />
            <circle cx="56" cy="33" r="1.5" fill="#2C3E50" />
            <circle cx="64" cy="33" r="1.5" fill="#2C3E50" />
            <path d="M 56 39 Q 60 44 64 39" fill="none" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" />
            {/* Body */}
            <rect x="50" y="47" width="20" height="32" rx="6" fill="#F59E0B" stroke="#D97706" strokeWidth="2.5" />
            {/* Legs */}
            <line x1="55" y1="79" x2="52" y2="102" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            <line x1="65" y1="79" x2="68" y2="102" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            <line x1="52" y1="102" x2="46" y2="102" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            <line x1="68" y1="102" x2="74" y2="102" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            {/* Arms Stretched High */}
            <g className="animate-raise">
              <path d="M 48 55 C 40 45 42 22 45 14" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 72 55 C 80 45 78 22 75 14" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" fill="none" />
            </g>
          </svg>
        </div>
      );
    } else if (step === 1) {
      // Bending forward at waist
      return (
        <div className="relative w-36 h-36 bg-amber-50/50 border-4 border-slate-800 rounded-3xl p-1 shadow-inner overflow-hidden flex items-center justify-center">
          <style>{animationStyles}</style>
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle cx="60" cy="60" r="45" fill="#FDE68A" opacity="0.4" />
            <path d="M 30 100 Q 60 92 90 100" stroke="#B45309" strokeWidth="2.5" fill="none" strokeDasharray="3 3" />
            {/* Legs standing straight */}
            <line x1="52" y1="75" x2="52" y2="102" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            <line x1="64" y1="75" x2="64" y2="102" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            <line x1="52" y1="102" x2="46" y2="102" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            <line x1="64" y1="102" x2="70" y2="102" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            {/* Bending Torso */}
            <g className="animate-bend">
              <rect x="36" y="58" width="32" height="18" rx="6" fill="#F59E0B" stroke="#D97706" strokeWidth="2.5" />
              <circle cx="25" cy="62" r="10" fill="#FFA07A" stroke="#E26A4F" strokeWidth="2.5" />
              <path d="M 45 68 L 22 92" stroke="#E26A4F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M 52 68 L 26 94" stroke="#E26A4F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </g>
          </svg>
        </div>
      );
    } else {
      // Shake limbs
      return (
        <div className="relative w-36 h-36 bg-amber-50/50 border-4 border-slate-800 rounded-3xl p-1 shadow-inner overflow-hidden flex items-center justify-center">
          <style>{animationStyles}</style>
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle cx="60" cy="60" r="45" fill="#FDE68A" opacity="0.4" />
            <path d="M 30 100 Q 60 92 90 100" stroke="#B45309" strokeWidth="2.5" fill="none" strokeDasharray="3 3" />
            <g className="animate-wiggle">
              <circle cx="60" cy="35" r="12" fill="#FFA07A" stroke="#E26A4F" strokeWidth="2.5" />
              <circle cx="56" cy="33" r="1.5" fill="#2C3E50" />
              <circle cx="64" cy="33" r="1.5" fill="#2C3E50" />
              <path d="M 56 39 Q 60 43 64 39" fill="none" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="50" y="47" width="20" height="32" rx="6" fill="#F59E0B" stroke="#D97706" strokeWidth="2.5" />
              <path d="M 48 55 C 38 58 26 50 20 48" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 72 55 C 82 58 94 50 100 48" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" fill="none" />
              <line x1="54" y1="79" x2="48" y2="101" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
              <line x1="66" y1="79" x2="72" y2="101" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      );
    }
  }

  if (cat === 'mindfulness' || cat === 'breathing' || cat === 'relaxation') {
    return (
      <div className="relative w-36 h-36 bg-purple-50/50 border-4 border-slate-800 rounded-3xl p-1 shadow-inner overflow-hidden flex items-center justify-center">
        <style>{animationStyles}</style>
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle cx="60" cy="60" r="45" fill="#DDD6FE" opacity="0.4" />
          <circle cx="60" cy="60" r="32" fill="#C084FC" opacity="0.25" className="animate-breathe" />
          <circle cx="60" cy="60" r="22" fill="#A855F7" opacity="0.35" className="animate-breathe" />
          {/* Head */}
          <circle cx="60" cy="42" r="10" fill="#FFA07A" stroke="#9061F9" strokeWidth="2" />
          {/* Eyes closed */}
          <path d="M 55 42 Q 57 44 58 42" stroke="#2C3E50" strokeWidth="1.2" fill="none" />
          <path d="M 62 42 Q 63 44 65 42" stroke="#2C3E50" strokeWidth="1.2" fill="none" />
          {/* Body */}
          <rect x="52" y="52" width="16" height="24" rx="5" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2.5" />
          {/* Arms crossed on lap */}
          <path d="M 52 58 Q 42 66 60 72 M 68 58 Q 78 66 60 72" stroke="#FFA07A" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 45 76 C 45 84 75 84 75 76" stroke="#6D28D9" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // Fallback: star jumps or jogging
  const isSecondHalf = step % 2 === 1;
  return (
    <div className="relative w-36 h-36 bg-indigo-50/50 border-4 border-slate-800 rounded-3xl p-1 shadow-inner overflow-hidden flex items-center justify-center">
      <style>{animationStyles}</style>
      <svg viewBox="0 0 120 120" className="w-full h-full animate-run">
        <circle cx="60" cy="60" r="45" fill="#C7D2FE" opacity="0.4" />
        <path d="M 30 100 Q 60 92 90 100" stroke="#4338CA" strokeWidth="2.5" fill="none" strokeDasharray="3 3" />
        
        {isSecondHalf ? (
          <g>
            <circle cx="60" cy="35" r="12" fill="#FFA07A" stroke="#E26A4F" strokeWidth="2.5" />
            <circle cx="56" cy="33" r="1.5" fill="#2C3E50" />
            <circle cx="64" cy="33" r="1.5" fill="#2C3E50" />
            <rect x="50" y="47" width="20" height="30" rx="6" fill="#4F46E5" stroke="#3730A3" strokeWidth="2.5" />
            <path d="M 48 53 C 35 45 25 35 15 32" stroke="#E26A4F" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 72 53 C 85 45 95 35 105 32" stroke="#E26A4F" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <line x1="53" y1="77" x2="35" y2="98" stroke="#E26A4F" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="67" y1="77" x2="85" y2="98" stroke="#E26A4F" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <circle cx="63" cy="33" r="12" fill="#FFA07A" stroke="#E26A4F" strokeWidth="2.5" />
            <circle cx="60" cy="31" r="1.5" fill="#2C3E50" />
            <circle cx="67" cy="31" r="1.5" fill="#2C3E50" />
            <rect x="52" y="45" width="20" height="32" rx="6" fill="#4F46E5" stroke="#3730A3" strokeWidth="2.5" transform="rotate(5 62 61)" />
            <path d="M 56 77 L 44 90 L 32 94" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 66 77 L 76 88 L 68 101" stroke="#E26A4F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 52 50 L 40 52 L 44 62" stroke="#E26A4F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 72 50 L 82 54 L 78 66" stroke="#E26A4F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
}
