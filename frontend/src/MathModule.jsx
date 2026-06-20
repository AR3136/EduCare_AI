import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, ArrowLeft, Check, Award, BookOpen, Sparkles, 
  RefreshCw, Play, CheckCircle, MessageSquare, Trophy, Star, Clock, Brain, Flame
} from 'lucide-react';
import SoundEngine from './shared/soundEngine';
import { eventBus } from './shared/eventBus';
import { API_BASE } from './config';
import { CartoonButton, CartoonCard } from './components/Reusables';

const GRADE_TOPICS = {
  'KG': ['kg-counting', 'kg-shapes', 'kg-addition'],
  'Grade 1': ['g1-numbers', 'g1-ops', 'g1-word-probs'],
  'Grade 2': ['g2-multi-basics', 'g2-div-basics', 'g2-time'],
  'Grade 3': ['g3-tables', 'g3-fractions', 'g3-measurement'],
  'Grade 4': ['g4-decimals', 'g4-geometry', 'g4-logic-probs']
};

export default function MathModule({ studentId = 'student_123', onExit }) {
  const [activeGrade, setActiveGrade] = useState(() => {
    return localStorage.getItem('educare_grade_student_123') || 'KG';
  });

  const [activeTab, setActiveTab] = useState('learn'); // learn, practice, game, test
  const [stars, setStars] = useState(15);
  const [badges, setBadges] = useState([]);
  const [readinessScore, setReadinessScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync grade from global eventBus
  useEffect(() => {
    const unsub = eventBus.subscribe('GRADE_CHANGED', (data) => {
      if (data && data.grade) setActiveGrade(data.grade);
    });
    return () => unsub();
  }, []);

  // Fetch initial progress
  const fetchProgress = async () => {
    try {
      const res = await fetch(`${API_BASE}/math/progress`);
      if (res.ok) {
        const data = await res.json();
        setStars(data.stars);
        setBadges(data.badges);
        setReadinessScore(data.readinessScore);
        setLevel(data.level);
      }
    } catch (err) {
      console.warn("Progress fetch offline.");
    }
  };

  useEffect(() => {
    fetchProgress();
    
    const unsubReward = eventBus.subscribe('MATH_PROGRESS_UPDATED', (data) => {
      setStars(data.stars);
      setBadges(data.badges);
      setReadinessScore(data.readinessScore);
      setLevel(data.level);
    });
    return () => unsubReward();
  }, []);

  const earnRewards = async (starCount, badgeId = null) => {
    const updatedStars = stars + starCount;
    const updatedBadges = [...badges];
    if (badgeId && !updatedBadges.includes(badgeId)) {
      updatedBadges.push(badgeId);
    }
    
    setStars(updatedStars);
    if (badgeId) setBadges(updatedBadges);

    try {
      await fetch(`${API_BASE}/math/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stars: updatedStars,
          badges: updatedBadges,
          grade: activeGrade
        })
      });
    } catch (err) {
      console.warn("Failed to sync rewards backend.");
    }
  };

  const handleTabChange = (tabName) => {
    if (!muted) SoundEngine.playPop();
    setActiveTab(tabName);
  };

  return (
    <div className="flex-1 bg-[#fcfaf7] min-h-screen pb-12 flex flex-col justify-between select-none">
      
      {/* Local Top Navbar */}
      <header className="glass border-b-4 border-slate-800 py-3.5 px-6 sticky top-0 z-45 shrink-0 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CartoonButton color="white" onClick={onExit} className="py-2 px-3 flex items-center gap-1.5 text-xs font-black shadow-cartoon-sm shrink-0">
              <ArrowLeft className="w-4 h-4" /> Back
            </CartoonButton>
            <div className="flex flex-col">
              <h2 className="font-black text-slate-800 text-sm sm:text-base leading-none flex items-center gap-1">
                🧮 MathMentor AI Lab
              </h2>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">
                Unified Mathematics Environment • {activeGrade}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stars Count */}
            <div className="flex items-center gap-1.5 bg-amber-100 border-2 border-amber-300 px-3 py-1 rounded-full shadow-cartoon-sm">
              <span className="text-sm">⭐</span>
              <span className="font-extrabold text-amber-800 text-xs sm:text-sm">{stars} Stars</span>
            </div>
            
            {/* Level Count */}
            <div className="hidden sm:flex items-center gap-1.5 bg-purple-100 border-2 border-purple-300 px-3 py-1 rounded-full shadow-cartoon-sm">
              <Trophy className="w-3.5 h-3.5 text-purple-700" />
              <span className="font-extrabold text-purple-800 text-xs sm:text-sm">Level {level}</span>
            </div>

            {/* Mute Toggle */}
            <button 
              onClick={() => { setMuted(!muted); SoundEngine.toggleMute(); }}
              className="bg-slate-100 hover:bg-slate-200 border-2 border-slate-700 w-8.5 h-8.5 rounded-xl flex items-center justify-center text-slate-600 shadow-cartoon active:translate-y-0.5 shrink-0"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Routing */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8 flex flex-col justify-start">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center gap-2 sm:gap-4 flex-wrap border-b-2 border-slate-200 pb-4">
          {[
            { id: 'learn', label: 'Learn Concept 📖', color: 'bg-emerald-500' },
            { id: 'practice', label: 'Practice Mode ✏️', color: 'bg-indigo-500' },
            { id: 'game', label: 'Play Games 🎮', color: 'bg-orange-500' },
            { id: 'test', label: 'Test Arena 🏆', color: 'bg-rose-500' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl font-black text-xs sm:text-sm border-2 transition-all hover:scale-102 active:scale-98 shadow-cartoon ${
                activeTab === tab.id 
                  ? `${tab.color} text-white border-slate-800 shadow-cartoon-hover` 
                  : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab View Panels */}
        <div className="flex-1">
          {activeTab === 'learn' && <LearnView grade={activeGrade} />}
          {activeTab === 'practice' && <PracticeView grade={activeGrade} studentId={studentId} earnRewards={earnRewards} muted={muted} mode="practice" />}
          {activeTab === 'game' && <GameView grade={activeGrade} earnRewards={earnRewards} muted={muted} />}
          {activeTab === 'test' && <PracticeView grade={activeGrade} studentId={studentId} earnRewards={earnRewards} muted={muted} mode="test" />}
        </div>

      </main>

    </div>
  );
}

// ==========================================
// 1. LEARN VIEW (Concept Explanation Cards)
// ==========================================
function LearnView({ grade }) {
  const getConceptData = () => {
    if (grade === 'KG') {
      return [
        { title: "Counting 1 to 50 🍎", desc: "Let's count apples together! Point to each apple and count: 1, 2, 3...", connection: "Apples in a grocery box." },
        { title: "Fun Shapes 🔴", desc: "Circles are round like a wheel. Squares have 4 equal sides. Triangles have 3 corners.", connection: "A pizza slice is a triangle!" },
        { title: "Simple Adding ➕", desc: "Adding means joining things together. If you have 2 blocks and get 1 more, you have 3 blocks!", connection: "Stacking toy blocks in a tower." }
      ];
    }
    if (grade === 'Grade 1') {
      return [
        { title: "Numbers up to 100 🔢", desc: "Place values help us count high! 10 groups of 10 make 100. We can show them on number lines.", connection: "Counting cents in a dollar." },
        { title: "Plus and Minus ➕➖", desc: "Addition is combining groups. Subtraction is taking things away. 15 plus 5 equals 20.", connection: "Giving crayons to a friend." },
        { title: "Word Stories 📝", desc: "Read math stories! Find numbers and see if they are joined together (+) or taken away (-).", connection: "Sam eating cookies from a plate." }
      ];
    }
    if (grade === 'Grade 2') {
      return [
        { title: "Multiplication Intro ✖️", desc: "Multiplication is repeated addition. 3 times 4 means adding the number 4 together three times: 4 + 4 + 4 = 12.", connection: "Buying packs of pencils." },
        { title: "Division Intro ➗", desc: "Division means sharing equally. If you divide 6 toys between 2 friends, each gets exactly 3 toys.", connection: "Sharing cupcakes equally at a party." },
        { title: "Analog Clocks ⏰", desc: "An analog clock has 12 numbers. The short hand shows hours, and the long hand shows minutes (count by 5s!).", connection: "Bedtime or dinner time schedule." }
      ];
    }
    if (grade === 'Grade 3') {
      return [
        { title: "Multiplication Tables 🎛️", desc: "Mastering tables 1 to 10 helps us multiply super fast! For example, 6 times 8 is 48.", connection: "Tiling floors in grid squares." },
        { title: "Fractions Parts 🍕", desc: "Fractions are parts of a whole object. The numerator (top) is parts we have, the denominator (bottom) is total parts.", connection: "Cutting a birthday cake in equal parts." },
        { title: "Meters & Centimeters 📏", desc: "We measure length using meters (for walls) and centimeters (for pencils). 1 meter is exactly 100 centimeters.", connection: "Measuring how tall you grow!" }
      ];
    }
    return [
      { title: "Decimals 💵", desc: "Decimals are numbers with a dot (.). The place values represent tenths ($0.1) and hundredths ($0.01).", connection: "Counting dollar bills and coins." },
      { title: "Polygons & Angles 📐", desc: "Polygons are flat shapes with straight lines. A right angle makes a square corner like a sheet of paper.", connection: "Stop signs and notebook corners." },
      { title: "Logic Word Puzzles 🧩", desc: "Logic problems require multi-step planning. Write down equations for each step to find the hidden answer.", connection: "Cracking secret codes in a logic game." }
    ];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {getConceptData().map((concept, idx) => (
        <CartoonCard key={idx} color="white" className="border-l-8 border-l-emerald-400 p-6 flex flex-col justify-between h-64 shadow-cartoon hover:scale-102 hover:shadow-cartoon-hover transition-all">
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-800">{concept.title}</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">{concept.desc}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-2xl text-[10px] text-emerald-800 leading-relaxed font-bold">
            <span className="block text-[8px] uppercase tracking-wider text-emerald-500 font-black">Real-life Connection:</span>
            💡 {concept.connection}
          </div>
        </CartoonCard>
      ))}
    </div>
  );
}

// ==========================================
// 2. PRACTICE VIEW / TEST VIEW
// ==========================================
function PracticeView({ grade, studentId, earnRewards, muted, mode = 'practice' }) {
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hintLevel, setHintLevel] = useState(1);
  const [sessionEnd, setSessionEnd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [timeRemaining, setTimeRemaining] = useState(mode === 'test' ? 45 : 0);

  const timerRef = useRef(null);
  const timeTakenRef = useRef(0);

  const startSession = async () => {
    setLoading(true);
    setSessionEnd(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setEvalResult(null);
    setAttemptCount(0);
    setHintLevel(1);

    try {
      const res = await fetch(`${API_BASE}/math/generate-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, grade, mode })
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        setSessionStats({ correct: 0, total: data.questions.length });
        timeTakenRef.current = 0;
        if (mode === 'test') {
          setTimeRemaining(45);
          startTimer();
        }
      }
    } catch (err) {
      console.warn("Session launch failed.");
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswerSubmit(''); // Submit empty on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startSession();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [grade, mode]);

  // Keep track of time taken per question
  useEffect(() => {
    const timeCounter = setInterval(() => {
      timeTakenRef.current += 1;
    }, 1000);
    return () => clearInterval(timeCounter);
  }, [currentIndex]);

  const handleAnswerSubmit = async (option) => {
    if (evalResult && evalResult.isCorrect) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(option);
    const newAttempt = attemptCount + 1;
    setAttemptCount(newAttempt);

    try {
      const activeQ = session.questions[currentIndex];
      const res = await fetch(`${API_BASE}/math/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          questionId: activeQ.id,
          answer: option,
          timeTaken: timeTakenRef.current,
          attemptCount: newAttempt
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEvalResult(data);
        setHintLevel(data.hintLevel);
        
        if (data.isCorrect) {
          if (!muted) SoundEngine.playSuccess();
          setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
          earnRewards(data.earnedStars);
        } else {
          if (!muted) SoundEngine.playSad();
        }

        if (data.isSessionEnd) {
          setSessionEnd(true);
        }
      }
    } catch (err) {
      console.warn("Answer submission failed.");
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < session.questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setEvalResult(null);
      setAttemptCount(0);
      setHintLevel(1);
      timeTakenRef.current = 0;
      if (mode === 'test') {
        setTimeRemaining(45);
        startTimer();
      }
    }
  };

  if (loading || !session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="font-extrabold text-xs tracking-wider uppercase animate-pulse">Launching Mathmentor Session...</span>
      </div>
    );
  }

  if (sessionEnd) {
    return (
      <CartoonCard color="white" className="max-w-xl mx-auto p-8 text-center space-y-6 border-b-6 border-slate-800">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-cartoon mx-auto">
          <span className="text-4xl">🏆</span>
        </div>
        <div className="space-y-1.5">
          <h3 className="font-black text-2xl text-slate-800 uppercase tracking-wide">Session Completed!</h3>
          <p className="text-slate-600 font-extrabold text-sm">{evalResult?.sessionMsg}</p>
        </div>

        <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl flex justify-around font-black">
          <div>
            <span className="block text-[10px] uppercase text-slate-400">Correct Answers</span>
            <span className="text-2xl text-emerald-600">{sessionStats.correct} / {sessionStats.total}</span>
          </div>
          <div className="border-r-2 border-slate-200"></div>
          <div>
            <span className="block text-[10px] uppercase text-slate-400">Accuracy</span>
            <span className="text-2xl text-indigo-600">{Math.round((sessionStats.correct / sessionStats.total) * 100)}%</span>
          </div>
        </div>

        <CartoonButton color="energy" onClick={startSession} className="w-full text-xs py-3.5">
          Practice Again 🚀
        </CartoonButton>
      </CartoonCard>
    );
  }

  const currentQuestion = session.questions[currentIndex];

  return (
    <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-cartoon max-w-xl mx-auto space-y-6">
      
      {/* Quiz Progress Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <span className="text-xs bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-full font-black uppercase">
          {mode === 'test' ? 'Test Arena 🏆' : 'Practice Mode ✏️'}
        </span>
        <div className="flex items-center gap-4">
          {mode === 'test' && (
            <div className={`flex items-center gap-1 font-black text-xs ${timeRemaining < 10 ? 'text-rose-600 animate-ping' : 'text-slate-500'}`}>
              <Clock className="w-4 h-4" /> {timeRemaining}s
            </div>
          )}
          <span className="text-xs font-black text-slate-500">
            Question {currentIndex + 1} of {session.questions.length}
          </span>
        </div>
      </div>

      {/* Real-life visual clue */}
      <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl text-center leading-relaxed text-sm font-black text-slate-700">
        {currentQuestion.questionText}
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 gap-3">
        {currentQuestion.options.map((option, idx) => {
          let btnColor = 'white';
          if (selectedOption === option) {
            btnColor = evalResult?.isCorrect ? 'science' : 'danger';
          }
          return (
            <CartoonButton
              key={idx}
              color={btnColor}
              onClick={() => handleAnswerSubmit(option)}
              disabled={evalResult?.isCorrect}
              className="py-3 text-left font-black text-xs sm:text-sm pl-4 flex items-center justify-between border-2 border-slate-800"
            >
              {option}
              {selectedOption === option && evalResult?.isCorrect && <CheckCircle className="w-5 h-5 text-white shrink-0" />}
            </CartoonButton>
          );
        })}
      </div>

      {/* AI tutor evaluation feedback */}
      {evalResult && (
        <div className={`border-2 p-4 rounded-2xl space-y-2 text-left ${evalResult.isCorrect ? 'bg-emerald-50 border-emerald-250 text-emerald-900' : 'bg-rose-50 border-rose-250 text-rose-900'}`}>
          <h4 className="font-black text-xs sm:text-sm uppercase tracking-wide flex items-center gap-1.5">
            <GraduationCap className="w-4.5 h-4.5" /> MathMentor AI Tutor
          </h4>
          <p className="text-xs font-semibold leading-relaxed">{evalResult.explanation}</p>
          {!evalResult.isCorrect && evalResult.hintText && (
            <div className="mt-2 bg-amber-50 border border-amber-200 p-3 rounded-xl text-[10px] text-amber-800 leading-relaxed font-bold">
              <span className="block text-[8px] uppercase tracking-wider text-amber-500 font-black mb-0.5">Scaffolding Clue (Level {hintLevel}):</span>
              💡 {evalResult.hintText}
            </div>
          )}
          {evalResult.isCorrect && (
            <p className="text-[10px] text-emerald-600 font-extrabold uppercase mt-1">
              🏆 Correct! Earned +5 Stars.
            </p>
          )}
        </div>
      )}

      {/* Next Question / Continue button */}
      {evalResult?.isCorrect && (
        <CartoonButton
          color="science"
          onClick={handleNext}
          className="w-full py-3.5 mt-2 flex items-center justify-center gap-2 text-xs font-black"
        >
          {currentIndex + 1 < session.questions.length ? 'Next Question' : 'Complete Session'} <ChevronRight className="w-4 h-4" />
        </CartoonButton>
      )}

    </div>
  );
}

// ==========================================
// 3. GAME VIEW (Pattern Matcher & Speed Challenge)
// ==========================================
function GameView({ grade, earnRewards, muted }) {
  const [activeGame, setActiveGame] = useState(null); // pattern, speed, shape
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  const startPatternMatcher = () => {
    if (!muted) SoundEngine.playPop();
    setActiveGame('pattern');
    setScore(0);
    setGameEnded(false);
  };

  const startSpeedChallenge = () => {
    if (!muted) SoundEngine.playPop();
    setActiveGame('speed');
    setScore(0);
    setGameEnded(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-center">
      
      {!activeGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CartoonCard color="white" className="border-l-8 border-l-orange-400 p-6 flex flex-col justify-between h-56 shadow-cartoon hover:scale-102 transition-all">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-slate-800">Sequence Matcher 🧩</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Analyze number patterns and logic chains (e.g. 5, 10, 15, __). Complete the missing value to win stars!
              </p>
            </div>
            <CartoonButton color="energy" onClick={规律MatcherGame} className="w-full py-3 text-xs">
              Play Sequence 🚀
            </CartoonButton>
          </CartoonCard>

          <CartoonCard color="white" className="border-l-8 border-l-rose-400 p-6 flex flex-col justify-between h-56 shadow-cartoon hover:scale-102 transition-all">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-slate-800">Speed Challenge ⏱️</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Solve as many simple math equations as you can in 30 seconds. Think fast to beat the record!
              </p>
            </div>
            <CartoonButton color="science" onClick={startSpeedChallenge} className="w-full py-3 text-xs">
              Play Speed Run 🚀
            </CartoonButton>
          </CartoonCard>
        </div>
      ) : (
        <div>
          {activeGame === 'pattern' && <PatternMatcherGame earnRewards={earnRewards} muted={muted} onExit={() => setActiveGame(null)} />}
          {activeGame === 'speed' && <SpeedChallengeGame earnRewards={earnRewards} muted={muted} onExit={() => setActiveGame(null)} />}
        </div>
      )}

    </div>
  );

  // Helper trigger to start pattern matcher
  function 规律MatcherGame() {
    startPatternMatcher();
  }
}

// ─── Sequence Matcher Game Component ───
function PatternMatcherGame({ earnRewards, muted, onExit }) {
  const [currentPattern, setCurrentPattern] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [streak, setStreak] = useState(0);

  const generatePattern = () => {
    // Math sequences: e.g. add 2, add 5, multiply by 2
    const types = ['add', 'sub', 'mult'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    const start = Math.floor(Math.random() * 10) + 1;
    const diff = Math.floor(Math.random() * 4) + 2;

    let seq = [];
    if (selectedType === 'add') {
      seq = [start, start + diff, start + diff * 2, start + diff * 3];
    } else if (selectedType === 'sub') {
      const topStart = start + diff * 3 + 5;
      seq = [topStart, topStart - diff, topStart - diff * 2, topStart - diff * 3];
    } else {
      const multVal = 2;
      seq = [start, start * multVal, start * multVal * multVal, start * multVal * multVal * multVal];
    }

    const missingIdx = 3;
    const correctAnswer = String(seq[missingIdx]);
    const displaySeq = [...seq];
    displaySeq[missingIdx] = '__';

    const options = [
      correctAnswer,
      String(Number(correctAnswer) + diff),
      String(Number(correctAnswer) - (diff === 2 ? 1 : 2))
    ].sort(() => Math.random() - 0.5);

    setCurrentPattern({
      display: displaySeq.join(', '),
      correct: correctAnswer,
      options,
      clue: selectedType === 'add' ? `Adding ${diff} each time.` : selectedType === 'sub' ? `Subtracting ${diff} each time.` : `Multiplying by 2 each time.`
    });
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  useEffect(() => {
    generatePattern();
  }, []);

  const handleChoice = (option) => {
    if (isCorrect !== null) return;
    setSelectedAnswer(option);
    const correct = option === currentPattern.correct;
    setIsCorrect(correct);

    if (correct) {
      if (!muted) SoundEngine.playSuccess();
      setStreak(streak + 1);
      // Give rewards
      earnRewards(5);
    } else {
      if (!muted) SoundEngine.playSad();
      setStreak(0);
    }
  };

  if (!currentPattern) return null;

  return (
    <CartoonCard color="white" className="p-6 border-4 border-slate-800 shadow-cartoon space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
        <span className="font-black text-xs text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full uppercase">Sequence Matcher 🧩</span>
        <span className="font-extrabold text-xs text-slate-500">Streak: 🔥 {streak}</span>
      </div>

      <div className="space-y-4">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Complete the sequence pattern:</span>
        <h2 className="text-3xl font-black text-slate-800 tracking-wider font-mono">{currentPattern.display}</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {currentPattern.options.map((opt, i) => {
          let btnColor = 'white';
          if (selectedAnswer === opt) {
            btnColor = isCorrect ? 'science' : 'danger';
          }
          return (
            <CartoonButton
              key={i}
              color={btnColor}
              onClick={() => handleChoice(opt)}
              className="py-3 font-black text-sm border-2 border-slate-850"
            >
              {opt}
            </CartoonButton>
          );
        })}
      </div>

      {isCorrect !== null && (
        <div className="space-y-4">
          <p className={`text-xs font-black uppercase tracking-wider ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isCorrect ? '🎉 Correct! +5 Stars' : `❌ Incorrect! Clue: ${currentPattern.clue}`}
          </p>
          <div className="flex gap-3">
            <CartoonButton color="white" onClick={onExit} className="flex-1 text-xs py-2.5 font-bold">
              Quit Game
            </CartoonButton>
            <CartoonButton color="energy" onClick={generatePattern} className="flex-1 text-xs py-2.5 font-black">
              Next Pattern 🚀
            </CartoonButton>
          </div>
        </div>
      )}

    </CartoonCard>
  );
}

// ─── Speed Challenge Game Component ───
function SpeedChallengeGame({ earnRewards, muted, onExit }) {
  const [equation, setEquation] = useState(null);
  const [selectedAns, setSelectedAns] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [gameEnd, setGameEnd] = useState(false);

  const timerRef = useRef(null);

  const generateEquation = () => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    const isAddition = Math.random() > 0.5;

    const correctVal = isAddition ? a + b : a * b;
    const operator = isAddition ? '+' : 'x';

    const options = [
      String(correctVal),
      String(correctVal + 2),
      String(correctVal - 3)
    ].sort(() => Math.random() - 0.5);

    setEquation({
      text: `${a} ${operator} ${b}`,
      correct: String(correctVal),
      options
    });
    setSelectedAns(null);
    setIsCorrect(null);
  };

  const handleChoice = (opt) => {
    if (isCorrect !== null || gameEnd) return;
    setSelectedAns(opt);
    const correct = opt === equation.correct;
    setIsCorrect(correct);

    if (correct) {
      if (!muted) SoundEngine.playSuccess();
      setScore(prev => prev + 1);
      // Generate next immediately
      setTimeout(() => generateEquation(), 600);
    } else {
      if (!muted) SoundEngine.playSad();
      setTimeout(() => generateEquation(), 600);
    }
  };

  useEffect(() => {
    generateEquation();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameEnd(true);
          // Award stars based on score
          const starsEarned = score * 2;
          if (starsEarned > 0) {
            earnRewards(starsEarned);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [score]);

  if (gameEnd) {
    return (
      <CartoonCard color="white" className="p-6 border-4 border-slate-800 shadow-cartoon space-y-6 max-w-md mx-auto">
        <h3 className="font-black text-xl text-slate-800 uppercase tracking-wide">Time's Up! ⏱️</h3>
        <p className="text-slate-500 font-extrabold text-xs">You solved {score} equations correctly in 30 seconds!</p>
        
        <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl text-center font-black">
          <span className="block text-[10px] uppercase text-emerald-800">Stars Earned</span>
          <span className="text-3xl text-emerald-600">⭐ {score * 2}</span>
        </div>

        <div className="flex gap-3">
          <CartoonButton color="white" onClick={onExit} className="flex-1 text-xs py-2.5 font-bold">
            Quit to Menu
          </CartoonButton>
          <CartoonButton color="energy" onClick={() => {
            setScore(0);
            setTimeLeft(30);
            setGameEnd(false);
          }} className="flex-1 text-xs py-2.5 font-black">
            Play Again 🚀
          </CartoonButton>
        </div>
      </CartoonCard>
    );
  }

  if (!equation) return null;

  return (
    <CartoonCard color="white" className="p-6 border-4 border-slate-800 shadow-cartoon space-y-6 max-w-md mx-auto">
      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
        <span className="font-black text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full uppercase">Speed Run ⏱️</span>
        <div className="flex items-center gap-3">
          <span className="font-bold text-xs text-slate-500">Time: {timeLeft}s</span>
          <span className="font-bold text-xs text-slate-500">Score: {score}</span>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Solve quickly:</span>
        <h2 className="text-4xl font-black text-indigo-700 tracking-wider font-mono">{equation.text} = ?</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {equation.options.map((opt, i) => {
          let btnColor = 'white';
          if (selectedAns === opt) {
            btnColor = isCorrect ? 'science' : 'danger';
          }
          return (
            <CartoonButton
              key={i}
              color={btnColor}
              onClick={() => handleChoice(opt)}
              className="py-3 font-black text-sm border-2 border-slate-850"
            >
              {opt}
            </CartoonButton>
          );
        })}
      </div>

    </CartoonCard>
  );
}
