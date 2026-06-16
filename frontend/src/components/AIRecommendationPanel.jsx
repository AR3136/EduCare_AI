import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, BookOpen, Star, AlertCircle, Compass, HelpCircle } from 'lucide-react';
import { CartoonButton, CartoonCard } from './Reusables';
import { API_BASE } from '../config';

export default function AIRecommendationPanel({
  grade = 'KG',
  stars = 15,
  completedLessons = [],
  onStartLesson
}) {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecommendation() {
      setLoading(true);
      setError(null);
      
      // Calculate a mock 0-100 performance score based on earned stars
      const performanceScore = Math.min(Math.max(Math.round((stars / 40) * 100), 10), 100);

      try {
        const response = await fetch(`${API_BASE}/stem/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grade,
            performanceScore,
            previousLessons: completedLessons,
            completedCircuits: []
          })
        });

        if (response.ok) {
          const data = await response.json();
          setRecommendation(data);
        } else {
          throw new Error('Failed to load recommendation');
        }
      } catch (err) {
        console.warn("Recommendation engine offline. Using static local fallback.");
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendation();
  }, [grade, stars, completedLessons]);

  if (loading) {
    return (
      <CartoonCard color="white" className="animate-pulse py-8 text-center text-slate-400 font-extrabold text-sm">
        🤖 Consulting Sparky the AI Tutor... Preloading your lesson!
      </CartoonCard>
    );
  }

  // Fallback to local rendering if API is loading or fails
  const data = recommendation || {
    recommendedLesson: {
      id: 'lesson-kg-std',
      grade: 'KG',
      icon: '🔋',
      title: 'Light Up Sparky! 🔋',
      topic: 'Batteries & Bulbs',
      description: 'Oh no, Sparky the lightbulb is asleep! Can you complete the wire loop to wake him up?',
      vocab: ['Battery', 'Bulb', 'Loop']
    },
    recommendedChallenge: {
      challengeInstructions: 'Ensure you have a Battery in the left slot and a Bulb in the right slot. Connect them with a wire.'
    },
    hintLevel: 'basic',
    difficultyLevel: 'standard',
    adaptiveTip: '💡 Hint: Electric current needs a complete closed loop from the battery (+) back to (-) to flow.'
  };

  const difficultyColors = {
    standard: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    advanced: 'bg-electric-100 text-electric-600 border-electric-200 animate-pulse',
    supportive: 'bg-power-100 text-power-700 border-power-200'
  };

  return (
    <CartoonCard color="white" className="border-l-8 border-l-science-400 relative overflow-hidden bg-gradient-to-r from-sky-50 to-blue-50/50">
      <div className="absolute right-4 top-4 text-5xl opacity-10 pointer-events-none select-none">🤖</div>
      
      <div className="space-y-4">
        {/* Recommendation Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-spin-slow" />
            <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              AI Tutor Advisor
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 border rounded-full font-bold uppercase ${difficultyColors[data.difficultyLevel]}`}>
              {data.difficultyLevel} mode
            </span>
            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold">
              Hint: {data.hintLevel}
            </span>
          </div>
        </div>

        {/* Lesson Recommendation details */}
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-800 leading-snug flex items-center gap-2">
            <span className="text-2xl">{data.recommendedLesson.icon}</span> {data.recommendedLesson.title}
          </h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            {data.recommendedLesson.description}
          </p>
        </div>

        {/* Challenge Instructions */}
        <div className="bg-white/80 border border-slate-200 p-3 rounded-2xl text-[11px] text-slate-600 font-semibold leading-relaxed">
          <strong className="text-slate-700 block mb-0.5 uppercase tracking-wider text-[9px]">Challenge Mission:</strong>
          {data.recommendedChallenge.challengeInstructions}
        </div>

        {/* AI Tip block */}
        <div className="flex items-start gap-2 bg-indigo-50/50 border border-indigo-100 p-3 rounded-2xl text-[11px] text-indigo-800 leading-relaxed font-bold">
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-indigo-400 font-black">Advisor Tip:</span>
            {data.adaptiveTip}
          </div>
        </div>

        {/* Action Button */}
        <CartoonButton
          color="science"
          onClick={() => onStartLesson(data.recommendedLesson)}
          className="w-full text-sm py-2.5 mt-2 flex items-center justify-center gap-1.5"
        >
          Launch Recommended Mission <BookOpen className="w-4 h-4" />
        </CartoonButton>
      </div>
    </CartoonCard>
  );
}
