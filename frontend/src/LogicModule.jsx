import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, ArrowLeft, Check, Award, BookOpen, Sparkles, 
  RefreshCw, Play, CheckCircle, MessageSquare, Trophy, Star, Clock, Brain, Flame, ArrowRight
} from 'lucide-react';
import SoundEngine from './shared/soundEngine';
import { eventBus } from './shared/eventBus';
import { API_BASE } from './config';
import { CartoonButton, CartoonCard } from './components/Reusables';

const GRADE_TOPICS = {
  'KG': ['kg-shapes', 'kg-colors', 'kg-memory', 'kg-odd-out'],
  'Grade 1': ['g1-patterns', 'g1-riddles', 'g1-sequence', 'g1-matching'],
  'Grade 2': ['g2-symbol-patterns', 'g2-sorting', 'g2-directions', 'g2-reasoning'],
  'Grade 3': ['g3-complex-patterns', 'g3-missing-number', 'g3-grid-logic', 'g3-multi-step'],
  'Grade 4': ['g4-adv-puzzles', 'g4-deduction', 'g4-strategy', 'g4-analytical']
};

export default function LogicModule({ studentId = 'student_123', onExit }) {
  const [activeGrade, setActiveGrade] = useState(() => {
    return localStorage.getItem('educare_grade_student_123') || 'KG';
  });

  const [activeTab, setActiveTab] = useState('learn'); // learn, practice, memory, test
  const [stars, setStars] = useState(20);
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
      const res = await fetch(`${API_BASE}/logic/progress`);
      if (res.ok) {
        const data = await res.json();
        setStars(data.stars);
        setBadges(data.badges);
        setReadinessScore(data.readinessScore || 0);
        setLevel(data.level || 1);
      }
    } catch (err) {
      console.warn("Progress fetch offline.");
    }
  };

  useEffect(() => {
    fetchProgress();
    
    const unsubReward = eventBus.subscribe('LOGIC_PROGRESS_UPDATED', (data) => {
      setStars(data.stars);
      setBadges(data.badges);
      setReadinessScore(data.readinessScore || 0);
      setLevel(data.level || 1);
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
      await fetch(`${API_BASE}/logic/progress`, {
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
    <div className="flex-1 bg-[#f0f9ff] min-h-screen pb-12 flex flex-col justify-between select-none">
      
      {/* Local Top Navbar */}
      <header className="glass border-b-4 border-slate-800 py-3.5 px-6 sticky top-0 z-45 shrink-0 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CartoonButton color="white" onClick={onExit} className="py-2 px-3 flex items-center gap-1.5 text-xs font-black shadow-cartoon-sm shrink-0">
              <ArrowLeft className="w-4 h-4" /> Back
            </CartoonButton>
            <div className="flex flex-col">
              <h2 className="font-black text-slate-800 text-sm sm:text-base leading-none flex items-center gap-1">
                🧠 LogicLeap AI Lab
              </h2>
              <span className="text-[10px] text-teal-600 font-extrabold uppercase mt-1">
                Unified Reasoning Workspace • {activeGrade}
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
            <div className="hidden sm:flex items-center gap-1.5 bg-teal-100 border-2 border-teal-300 px-3 py-1 rounded-full shadow-cartoon-sm">
              <Trophy className="w-3.5 h-3.5 text-teal-700" />
              <span className="font-extrabold text-teal-800 text-xs sm:text-sm">Level {level}</span>
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
            { id: 'learn', label: 'Learn Logic 📖', color: 'bg-emerald-500' },
            { id: 'practice', label: 'Practice Mode ✏️', color: 'bg-teal-500' },
            { id: 'memory', label: 'Brain Memory 🎮', color: 'bg-orange-500' },
            { id: 'test', label: 'Logic Challenge 🏆', color: 'bg-purple-500' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm border-2 border-slate-800 transition-all active:translate-y-1 shadow-cartoon-sm ${
                activeTab === tab.id 
                  ? `${tab.color} text-white shadow-cartoon-hover scale-102` 
                  : 'bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Components */}
        {activeTab === 'learn' && <LearnTab activeGrade={activeGrade} />}
        {activeTab === 'practice' && <PracticeTab activeGrade={activeGrade} studentId={studentId} earnRewards={earnRewards} muted={muted} />}
        {activeTab === 'memory' && <MemoryTab activeGrade={activeGrade} earnRewards={earnRewards} muted={muted} />}
        {activeTab === 'test' && <TestTab activeGrade={activeGrade} studentId={studentId} earnRewards={earnRewards} muted={muted} />}

      </main>
    </div>
  );
}

// --- TAB 1: LEARN TAB (Real-life reasoning connections) ---
function LearnTab({ activeGrade }) {
  const getConcepts = (grade) => {
    switch (grade) {
      case 'KG':
        return [
          { title: "Sorting Groceries 🍎🥦", desc: "Classification: Group apples with fruits and broccoli with vegetables. This helps us see what objects have in common!", connection: "Next time you unpack grocery bags, put all the cold things in the fridge together!" },
          { title: "Traffic Lights 🚦", desc: "Logic Rules: Red means STOP, Yellow means GET READY, Green means GO. These are simple rules that govern decisions!", connection: "Watch the lights at the street crossing and see how everyone follows the logic rules!" }
        ];
      case 'Grade 1':
        return [
          { title: "Morning Routine ⏰🪥", desc: "Sequence Ordering: Wake up -> Brush teeth -> Eat breakfast -> Go to school. Doing things in order makes our day smooth!", connection: "Draw your daily schedule on a cardboard and check off steps in order!" },
          { title: "Animal Shadows 🐕👣", desc: "Pattern Matching: Connect the shape of an animal to its shadow outline. Matching shapes trains visual logic!", connection: "Use a flashlight at night to build shadow puppets on your bedroom wall!" }
        ];
      case 'Grade 2':
        return [
          { title: "Toy Chest Sorting 🧸🚗", desc: "Logical Sorting: Sort toys by size so the heaviest toys are at the bottom and lightest are on top.", connection: "Arrange your storybooks from the tallest to the shortest on your shelf!" },
          { title: "Robot Navigator 🤖🗺️", desc: "Grid Directions: Telling a robot 'Go 2 steps forward, 1 step right' creates a logical path to a target.", connection: "Hide a toy in the room and write down arrow directions for a family member to find it!" }
        ];
      case 'Grade 3':
        return [
          { title: "Height Lineup 📏👧", desc: "Multi-Step Comparisons: Deduce who is tallest. If Alice is taller than Bob, and Bob is taller than Clara, Alice is the tallest!", connection: "Draw lines for family member heights to find out the descending height order!" },
          { title: "Sudoku Grid 🔢🧩", desc: "Grid Logic: Each column and row must have unique colors or shapes without repeating. That is constraint solving!", connection: "Play a grid color puzzle with blocks. Make sure no row has two of the same color!" }
        ];
      default:
        return [
          { title: "Truth Detectives 🕵️‍♂️💬", desc: "Logical Deduction: Analyze who tells the truth. If B is lying, then the opposite of B's statement must be true!", connection: "Play 'Two Truths and a Lie' game with friends using logical deduction." },
          { title: "Tic-Tac-Toe Win Tree ❌⭕", desc: "Strategy Games: Analyze your opponent's next move to block them and create two winning lines at once.", connection: "Play Tic-Tac-Toe and try to think two moves ahead before placing your mark!" }
        ];
    }
  };

  const concepts = getConcepts(activeGrade);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-black text-slate-800">Reasoning in Real Life 🌍</h3>
        <p className="text-sm font-bold text-slate-500">How we use logic and patterns in our everyday actions!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {concepts.map((concept, i) => (
          <CartoonCard key={i} color="white" className="p-6 space-y-4 border-l-8 border-l-emerald-500 hover:scale-101 transition-transform">
            <h4 className="font-black text-lg text-slate-850 flex items-center gap-1.5">{concept.title}</h4>
            <div className="space-y-2">
              <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg font-black inline-block">
                Concept: {concept.desc.split(':')[0]}
              </span>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">{concept.desc.split(':')[1]}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="block text-[9px] uppercase font-black text-slate-400">Try it at Home! 🏠</span>
              <p className="text-xs text-slate-700 font-bold mt-1">{concept.connection}</p>
            </div>
          </CartoonCard>
        ))}
      </div>
    </div>
  );
}

// --- TAB 2: PRACTICE TAB (Unlimited adaptive challenges) ---
function PracticeTab({ activeGrade, studentId, earnRewards, muted }) {
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(1);
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/logic/generate-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, grade: activeGrade, mode: 'practice' })
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        setCurrentIndex(0);
        setSelectedOption('');
        setSubmitted(false);
        setFeedback(null);
        setAttempts(1);
      }
    } catch (err) {
      console.warn("Failed to generate logic session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startSession();
  }, [activeGrade]);

  const handleSubmit = async () => {
    if (!selectedOption || submitted) return;
    if (!muted) SoundEngine.playClick();

    try {
      const currentQ = session.challenges[currentIndex];
      const res = await fetch(`${API_BASE}/logic/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          challengeId: currentQ.id,
          answer: selectedOption,
          timeTaken: 10,
          attemptCount: attempts
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
        if (data.isCorrect) {
          setSubmitted(true);
          earnRewards(data.earnedStars);
          if (!muted) SoundEngine.playSparkle();
        } else {
          setAttempts(prev => prev + 1);
          if (!muted) SoundEngine.playLevelUp(); // Replace with error sound if available, otherwise minor jingle
        }
      }
    } catch (err) {
      console.warn("Answer submission failed.");
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < session.challenges.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption('');
      setSubmitted(false);
      setFeedback(null);
      setAttempts(1);
      if (!muted) SoundEngine.playPop();
    } else {
      // Session finished
      setSession(null);
      if (!muted) SoundEngine.playSparkle();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400 font-bold animate-pulse text-sm">
        Generating Logic Leaps... 🧠
      </div>
    );
  }

  if (!session || !session.challenges || session.challenges.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
        <h4 className="font-black text-xl text-slate-800">Reasoning Set Completed!</h4>
        <p className="text-xs text-slate-400 font-bold">Your brain is stronger! Keep leaping forward.</p>
        <CartoonButton color="teal" onClick={startSession} className="py-2.5 px-6 text-white text-xs font-black">
          Start Next Challenge Set 🚀
        </CartoonButton>
      </div>
    );
  }

  const currentChallenge = session.challenges[currentIndex];

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      
      {/* Progress header */}
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-xs font-extrabold text-slate-400 uppercase">
          Challenge {currentIndex + 1} of {session.challenges.length}
        </span>
        <span className="text-xs font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
          Difficulty: {session.difficultyLevel}
        </span>
      </div>

      <CartoonCard color="white" className="p-6 space-y-6">
        <div className="space-y-2">
          <span className="text-[9px] uppercase font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
            Puzzle Mode
          </span>
          <h3 className="font-black text-lg text-slate-800 leading-snug">
            {currentChallenge.questionText}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentChallenge.options.map((opt) => (
            <button
              key={opt}
              disabled={submitted}
              onClick={() => setSelectedOption(opt)}
              className={`w-full text-left p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-between ${
                selectedOption === opt 
                  ? 'border-teal-500 bg-teal-50/50 text-teal-900 shadow-cartoon-sm' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>{opt}</span>
              {submitted && currentChallenge.correctAnswer === opt && (
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Actions row */}
        <div className="flex gap-4">
          {!submitted ? (
            <CartoonButton
              color="teal"
              disabled={!selectedOption}
              onClick={handleSubmit}
              className="flex-1 py-3 text-white font-black text-xs shadow-cartoon-sm disabled:opacity-40 disabled:pointer-events-none"
            >
              Verify Logic 🤖
            </CartoonButton>
          ) : (
            <CartoonButton
              color="emerald"
              onClick={handleNext}
              className="flex-1 py-3 text-white font-black text-xs shadow-cartoon-sm flex items-center justify-center gap-1"
            >
              Next Challenge <ArrowRight className="w-4 h-4" />
            </CartoonButton>
          )}
        </div>
      </CartoonCard>

      {/* Hints & Feedback */}
      {feedback && !feedback.isCorrect && (
        <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl space-y-2 animate-shake text-left">
          <span className="font-black text-rose-800 text-xs flex items-center gap-1.5">
            ❌ Opps! Not quite right. Let's try again!
          </span>
          <p className="text-xs text-rose-700 font-bold leading-relaxed">
            💡 **Hint Level {feedback.hintLevel}:** {feedback.hintText}
          </p>
        </div>
      )}

      {submitted && feedback && (
        <div className="bg-emerald-50 border-2 border-emerald-200 p-5 rounded-2xl space-y-3 animate-fade-in text-left">
          <span className="font-black text-emerald-800 text-xs flex items-center gap-1.5">
            ✅ Correct! Excellent Deduction (+{feedback.earnedStars} Stars)
          </span>
          <p className="text-xs text-emerald-700 font-bold leading-relaxed">
            {feedback.explanation}
          </p>
          <div className="text-[10px] text-slate-500 font-extrabold uppercase border-t pt-2">
            Step-by-Step Reason:\n{feedback.stepByStep}
          </div>
        </div>
      )}
    </div>
  );
}

// --- TAB 3: MEMORY TAB (Sequence recall & Odd one out games) ---
function MemoryTab({ activeGrade, earnRewards, muted }) {
  const [gameState, setGameState] = useState('idle'); // idle, playing, showing, input, failed, won
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [flashIndex, setFlashIndex] = useState(-1);
  
  const emojis = ['🐶', '🐱', '🦁', '🐵', '🐸', '🐨'];

  const startMemoryGame = () => {
    setSequence([]);
    setPlayerInput([]);
    setGameState('playing');
    nextSequenceStep([Math.floor(Math.random() * emojis.length)]);
  };

  const nextSequenceStep = (currentSeq) => {
    setSequence(currentSeq);
    setGameState('showing');
    
    // Play sequence animation
    let idx = 0;
    setFlashIndex(currentSeq[idx]);
    if (!muted) SoundEngine.playPop();

    const interval = setInterval(() => {
      idx++;
      if (idx < currentSeq.length) {
        setFlashIndex(currentSeq[idx]);
        if (!muted) SoundEngine.playPop();
      } else {
        clearInterval(interval);
        setFlashIndex(-1);
        setGameState('input');
        setPlayerInput([]);
      }
    }, 1000);
  };

  const handleInput = (emojiIdx) => {
    if (gameState !== 'input') return;
    if (!muted) SoundEngine.playClick();
    
    const newInput = [...playerInput, emojiIdx];
    setPlayerInput(newInput);

    // Verify last entered item
    const lastIdx = newInput.length - 1;
    if (sequence[lastIdx] !== emojiIdx) {
      // Failed
      setGameState('failed');
      return;
    }

    // Check if finished sequence
    if (newInput.length === sequence.length) {
      if (sequence.length >= 4) {
        // Won the game
        setGameState('won');
        earnRewards(10, 'Brain Hero');
        if (!muted) SoundEngine.playSparkle();
      } else {
        // Next step
        setTimeout(() => {
          const nextIdx = Math.floor(Math.random() * emojis.length);
          nextSequenceStep([...sequence, nextIdx]);
        }, 800);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in text-center">
      <div className="space-y-1">
        <h3 className="text-xl font-black text-slate-800">Sequence Recall 🎮</h3>
        <p className="text-xs font-bold text-slate-500">Watch the emojis flash and repeat the sequence exactly!</p>
      </div>

      <CartoonCard color="white" className="p-8 space-y-6">
        {gameState === 'idle' && (
          <div className="space-y-4 py-6">
            <Brain className="w-14 h-14 text-orange-500 mx-auto animate-pulse" />
            <p className="text-xs text-slate-600 font-bold leading-relaxed">
              Test your working memory! Complete a sequence of 4 emojis to earn +10 Stars and the **Brain Hero** badge.
            </p>
            <CartoonButton color="orange" onClick={startMemoryGame} className="py-2.5 px-6 text-white text-xs font-black">
              Start Memory Challenge ▶️
            </CartoonButton>
          </div>
        )}

        {(gameState === 'showing' || gameState === 'input') && (
          <div className="space-y-8">
            {/* Visual Flash Area */}
            <div className="h-32 bg-slate-50 border-4 border-slate-800 rounded-3xl flex items-center justify-center text-6xl select-none relative shadow-inner">
              {flashIndex !== -1 ? (
                <span className="scale-125 animate-pop">{emojis[flashIndex]}</span>
              ) : (
                <span className="text-slate-350 text-xs font-bold font-mono">
                  {gameState === 'showing' ? 'STAY FOCUSED... 👀' : 'YOUR TURN! ✏️'}
                </span>
              )}
            </div>

            {/* Input grid */}
            <div className="grid grid-cols-3 gap-3">
              {emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  disabled={gameState !== 'input'}
                  onClick={() => handleInput(idx)}
                  className={`py-3.5 rounded-2xl border-2 border-slate-800 text-3xl transition-all shadow-cartoon-sm active:translate-y-1 ${
                    gameState === 'input' 
                      ? 'bg-white hover:bg-slate-50 active:bg-orange-50' 
                      : 'bg-slate-100 opacity-60'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Sequence Length: {sequence.length} • Inputs: {playerInput.length}/{sequence.length}
            </div>
          </div>
        )}

        {gameState === 'failed' && (
          <div className="space-y-4 py-6 animate-shake">
            <span className="text-5xl">🥱</span>
            <h4 className="font-black text-rose-600 text-lg">Incorrect Sequence!</h4>
            <p className="text-xs text-slate-500 font-bold">Don't worry! Try again to stretch your memory muscles.</p>
            <CartoonButton color="orange" onClick={startMemoryGame} className="py-2.5 px-6 text-white text-xs font-black">
              Retry Challenge 🔄
            </CartoonButton>
          </div>
        )}

        {gameState === 'won' && (
          <div className="space-y-4 py-6 animate-fade-in">
            <span className="text-5xl">🏆</span>
            <h4 className="font-black text-emerald-600 text-lg">MEMORY CHAMPION!</h4>
            <p className="text-xs text-slate-500 font-bold">You successfully recalled 4 items in a row! Awarded +10 Stars.</p>
            <div className="flex justify-center gap-3">
              <CartoonButton color="white" onClick={() => setGameState('idle')} className="py-2 px-4 text-xs font-black">
                Menu
              </CartoonButton>
              <CartoonButton color="orange" onClick={startMemoryGame} className="py-2.5 px-6 text-white text-xs font-black">
                Play Again 🔄
              </CartoonButton>
            </div>
          </div>
        )}
      </CartoonCard>
    </div>
  );
}

// --- TAB 4: TEST TAB (Curriculum evaluations) ---
function TestTab({ activeGrade, studentId, earnRewards, muted }) {
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [answers, setAnswers] = useState([]);
  const [scoreMsg, setScoreMsg] = useState('');
  const [testComplete, setTestComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  // Timer per question
  const [timer, setTimer] = useState(30);
  const timerRef = useRef(null);

  const startTest = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/logic/generate-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, grade: activeGrade, mode: 'test' })
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        setCurrentIndex(0);
        setSelectedOption('');
        setAnswers([]);
        setTestComplete(false);
        setScoreMsg('');
        setTimer(30);
      }
    } catch (err) {
      console.warn("Failed to generate test.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && !testComplete) {
      setTimer(30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            // Time out - submit default wrong choice
            handleNextTest('');
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session, currentIndex, testComplete]);

  const handleNextTest = async (overrideAns) => {
    const finalAns = overrideAns !== undefined ? overrideAns : selectedOption;
    const currentQ = session.challenges[currentIndex];
    
    // Add to answers array
    const updatedAnswers = [...answers, { challengeId: currentQ.id, answer: finalAns }];
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < session.challenges.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption('');
      if (!muted) SoundEngine.playPop();
    } else {
      // Submit all and complete session
      if (timerRef.current) clearInterval(timerRef.current);
      submitTestSession(updatedAnswers);
    }
  };

  const submitTestSession = async (finalAnswers) => {
    try {
      setLoading(true);
      let totalEarned = 0;
      let corrects = 0;
      let sessionMsg = "";
      
      // Submit answers in sequence
      for (const ans of finalAnswers) {
        const res = await fetch(`${API_BASE}/logic/submit-answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            challengeId: ans.challengeId,
            answer: ans.answer,
            timeTaken: 30 - timer,
            attemptCount: 1
          })
        });
        if (res.ok) {
          const data = await res.json();
          totalEarned += data.earnedStars;
          if (data.isCorrect) corrects++;
          if (data.sessionMsg) sessionMsg = data.sessionMsg;
        }
      }

      setScoreMsg(sessionMsg || `Test complete! You answered ${corrects}/5 correct.`);
      setTestComplete(true);
      earnRewards(totalEarned);
      if (!muted) {
        if (corrects === 5) SoundEngine.playSparkle();
        else SoundEngine.playLevelUp();
      }
    } catch (err) {
      console.warn("Failed to complete test session.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400 font-bold animate-pulse text-sm">
        Analyzing Cognitive Pathways... 🧬
      </div>
    );
  }

  if (testComplete) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12 animate-fade-in">
        <Trophy className="w-16 h-16 text-purple-500 mx-auto animate-bounce" />
        <h3 className="font-black text-2xl text-slate-800">Test Complete! 🏆</h3>
        <CartoonCard color="white" className="p-6">
          <p className="text-sm font-bold text-slate-700 leading-relaxed mb-4">
            {scoreMsg}
          </p>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">
            A break activity was assigned to your dashboard! 🏃‍♂️
          </span>
        </CartoonCard>
        <div className="flex justify-center gap-3">
          <CartoonButton color="purple" onClick={startTest} className="py-2.5 px-6 text-white text-xs font-black">
            Take Another Test 🔄
          </CartoonButton>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12">
        <Award className="w-14 h-14 text-purple-500 mx-auto" />
        <h3 className="font-black text-xl text-slate-800">Logic Competency Test</h3>
        <p className="text-xs text-slate-500 font-bold leading-relaxed">
          Verify your logical reasoning abilities for **{activeGrade}**. Complete 5 adaptive puzzles against a 30-second clock.
        </p>
        <CartoonButton color="purple" onClick={startTest} className="py-2.5 px-6 text-white text-xs font-black">
          Begin Logic Test 🚀
        </CartoonButton>
      </div>
    );
  }

  const currentChallenge = session.challenges[currentIndex];

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-xs font-extrabold text-slate-400 uppercase">
          Test Question {currentIndex + 1} of 5
        </span>
        <span className="text-xs font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200 flex items-center gap-1 animate-pulse">
          <Clock className="w-3.5 h-3.5" /> {timer}s Left
        </span>
      </div>

      <CartoonCard color="white" className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="font-black text-lg text-slate-800 leading-snug">
            {currentChallenge.questionText}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentChallenge.options.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedOption(opt)}
              className={`w-full text-left p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all ${
                selectedOption === opt 
                  ? 'border-purple-500 bg-purple-50/50 text-purple-900 shadow-cartoon-sm' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <CartoonButton
          color="purple"
          disabled={!selectedOption}
          onClick={() => handleNextTest()}
          className="w-full py-3 text-white font-black text-xs shadow-cartoon-sm disabled:opacity-40 disabled:pointer-events-none"
        >
          {currentIndex === 4 ? 'Finish Test 🏁' : 'Confirm & Next'}
        </CartoonButton>
      </CartoonCard>
    </div>
  );
}
