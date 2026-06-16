import React, { useState, useEffect } from 'react';
import { ChevronLeft, Award, Sparkles, Check, ArrowRight, AlertCircle, HelpCircle } from 'lucide-react';
import { CartoonButton, CartoonCard } from '../components/Reusables';
import CircuitWorkspace from '../components/CircuitWorkspace';
import AITutorPanel from '../components/AITutorPanel';

export default function LessonPortal({ 
  lesson, 
  nextLessonId,
  stars = 15,
  onBack, 
  onCompleteLesson 
}) {
  const [success, setSuccess] = useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const [activeLesson, setActiveLesson] = useState(lesson);
  const [loading, setLoading] = useState(false);
  const [startTime] = useState(Date.now());

  // Fetch adaptive lesson data from backend on mount and when failureCount changes
  const fetchAdaptiveData = async (failures, timeSecs = 0) => {
    setLoading(true);
    try {
      const response = await fetch('/stem/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: lesson.grade,
          lessonId: lesson.id,
          stars: stars,
          failureCount: failures,
          timeTaken: timeSecs
        })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveLesson(data);
      }
    } catch (err) {
      console.warn("Offline: Using local lesson data instead of adaptive engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdaptiveData(0, 0);
  }, [lesson, stars]);

  const handleChallengePassed = () => {
    if (!success) {
      setSuccess(true);
    }
  };

  const handleFailure = () => {
    const nextFailures = failureCount + 1;
    setFailureCount(nextFailures);
    const timeElapsed = Math.round((Date.now() - startTime) / 1000);
    fetchAdaptiveData(nextFailures, timeElapsed);
  };

  const handleFinish = (goNext = false) => {
    // Determine if a badge is earned
    let badgeEarned = null;
    if (activeLesson.grade === 'KG') badgeEarned = 'spark_starter';
    else if (activeLesson.grade === 'Grade 1') badgeEarned = 'conduct_hero';
    else if (activeLesson.grade === 'Grade 2') badgeEarned = 'switch_wizard';
    else if (activeLesson.grade === 'Grade 3') badgeEarned = 'loop_master';
    else if (activeLesson.grade === 'Grade 4') badgeEarned = 'resistor_shield';

    onCompleteLesson(lesson.id, badgeEarned, goNext ? nextLessonId : null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 space-y-3 relative overflow-hidden">
      {/* Header / Back Navigation */}
      <div className="flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 font-extrabold text-slate-600 hover:text-slate-800 transition-colors text-xs"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="text-right flex items-center gap-1.5">
          <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
            Grade {activeLesson.grade} Mission
          </span>
          <span className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
            {activeLesson.difficulty || 'Standard'}
          </span>
        </div>
      </div>

      {/* Quest / Mission Banner (Horizontal) */}
      <CartoonCard color="science" className="p-3 border-b-4 border-science-700 shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce-slow shrink-0 select-none">{activeLesson.icon || '🚀'}</span>
            <div>
              <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none mb-1">
                {activeLesson.type === 'quiz' ? 'Knowledge Check:' : 'Current Goal:'}
              </h2>
              <h3 className="text-sm font-black text-science-700 leading-tight">
                {activeLesson.title}
              </h3>
              <p className="text-xs text-slate-600 font-semibold leading-snug mt-0.5">
                {activeLesson.type === 'quiz' ? activeLesson.description : activeLesson.challengeInstructions}
              </p>
              {activeLesson.realWorldApp && (
                <p className="text-[10px] text-amber-700 font-bold mt-1 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                  🌍 Real World: {activeLesson.realWorldApp}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Vocab / Hint */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 max-w-full sm:max-w-xs">
            {activeLesson.vocab && activeLesson.vocab.length > 0 && (
              <div className="bg-white/60 px-2.5 py-1 rounded-xl border border-white text-[10px] text-slate-500 font-semibold">
                <strong className="text-slate-700 mr-1">Vocab:</strong>
                {activeLesson.vocab.join(', ')}
              </div>
            )}

            {activeLesson.adaptiveHint && activeLesson.type !== 'quiz' && (
              <div className="bg-amber-100 border border-amber-200 text-amber-800 px-2 py-1 rounded-xl text-[10px] font-bold animate-pulse">
                💡 Hint: {activeLesson.adaptiveHint}
              </div>
            )}
          </div>
        </div>
      </CartoonCard>

      {/* Centered Simulator Workspace or Quiz Workspace */}
      <div className="w-full relative z-10">
        {activeLesson.type === 'quiz' ? (
          <div className="bg-white border-4 border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-inner min-h-[300px]">
            <h3 className="text-2xl font-black text-slate-800 mb-6">{activeLesson.quiz?.question}</h3>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {activeLesson.quiz?.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (idx === activeLesson.quiz.correctIndex) {
                      handleChallengePassed();
                    } else {
                      handleFailure();
                    }
                  }}
                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-2 border-indigo-200 font-bold text-lg py-4 rounded-2xl transition-all shadow-sm active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <CircuitWorkspace 
            grade={activeLesson.grade}
            challengeId={activeLesson.id}
            onChallengePassed={handleChallengePassed}
            onChallengeFailed={handleFailure}
          />
        )}
      </div>

      {/* Floating AI Tutor bubble */}
      <AITutorPanel 
        grade={activeLesson.grade} 
        context={`lesson-${activeLesson.id}`}
        floating={true}
      />


      {/* Success Modal / Confetti Animation Layer */}
      {success && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-cartoon-xl text-center space-y-6 animate-bounce-slow relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 pointer-events-none"></div>
            
            {/* Celebratory icon */}
            <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center mx-auto border-4 border-slate-800 shadow-cartoon">
              <span className="text-5xl">🏆</span>
              <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1.5 animate-spin">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-800 tracking-wide">
                Mission Completed! 🎉
              </h2>
              <p className="text-sm font-bold text-slate-500">
                Excellent engineering! You successfully built the loop and solved the puzzle!
              </p>
            </div>

            {/* Stars unlocked */}
            <div className="flex justify-center gap-1.5 py-2">
              <span className="text-3xl animate-bounce">⭐</span>
              <span className="text-3xl animate-bounce [animation-delay:0.2s]">⭐</span>
              <span className="text-3xl animate-bounce [animation-delay:0.4s]">⭐</span>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl text-xs font-bold text-slate-600 leading-relaxed">
              <span className="text-purple-600 uppercase block mb-1">Badge Earned!</span>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-800">
                <span>⚡</span>
                {activeLesson.grade === 'KG' && 'Spark Starter'}
                {activeLesson.grade === 'Grade 1' && 'Material Hero'}
                {activeLesson.grade === 'Grade 2' && 'Switch Wizard'}
                {activeLesson.grade === 'Grade 3' && 'Loop Master'}
                {activeLesson.grade === 'Grade 4' && 'Resistor Shield'}
                <span>⚡</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <CartoonButton
                color="power"
                onClick={() => handleFinish(false)}
                className="w-full py-3 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Return Home <ArrowRight className="w-5 h-5" />
              </CartoonButton>
              {nextLessonId && (
                <CartoonButton
                  color="science"
                  onClick={() => handleFinish(true)}
                  className="w-full py-3 flex items-center justify-center gap-2 text-sm sm:text-base animate-pulse"
                >
                  Next Mission <ArrowRight className="w-5 h-5" />
                </CartoonButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
