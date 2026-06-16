import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Play, ArrowRight } from 'lucide-react';
import { CartoonButton, CartoonCard } from '../components/Reusables';
import { API_BASE } from '../config';

export default function LessonsPage({ 
  selectedGrade = 'KG',
  stars = 15,
  completedLessons = []
}) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLessons() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/stem/lessons/${encodeURIComponent(selectedGrade)}`);
        if (response.ok) {
          const data = await response.json();
          setLessons(data.lessons || []);
        }
      } catch (err) {
        console.error("Failed to load grade syllabus:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLessons();
  }, [selectedGrade]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-100 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            📚 Class syllabus <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold">Grade {selectedGrade}</span>
          </h1>
          <p className="text-slate-500 font-semibold text-sm">Step-by-step circuit adventures for your grade level.</p>
        </div>
        
        {/* Navigation shortcut to sandbox */}
        <CartoonButton 
          size="sm" 
          color="spark"
          onClick={() => navigate('/stem/simulator')}
          className="flex items-center gap-1 text-xs"
        >
          Open Free Sandbox 🧪 <ArrowRight className="w-3.5 h-3.5" />
        </CartoonButton>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 font-bold animate-pulse">
          🎒 Opening textbook... Please wait!
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed rounded-3xl text-slate-400 font-bold">
          No lessons found for this grade level. Select another grade on the dashboard!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            return (
              <CartoonCard 
                key={lesson.id} 
                color="white"
                className="flex flex-col justify-between h-56 border-l-8 border-l-science-400 group relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-3xl group-hover:scale-115 transition-transform duration-150">{lesson.icon}</span>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] text-power-600 bg-power-100 border border-power-300 px-2 py-0.5 rounded-full font-bold">
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border font-bold">
                        ⭐ 5 Stars
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-800 leading-snug group-hover:text-science-500 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed line-clamp-2">
                    {lesson.description}
                  </p>
                  {lesson.learningObjective && (
                    <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1">
                      <span className="text-[9px] font-black uppercase text-indigo-500 block mb-0.5">Objective:</span>
                      <p className="text-[10px] text-indigo-900 font-medium leading-tight">{lesson.learningObjective}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-between items-center border-t border-slate-50 pt-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Topic: {lesson.topic}</span>
                  <CartoonButton 
                    size="sm"
                    color={isCompleted ? 'gray' : 'science'}
                    onClick={() => navigate(`/stem/lessons/${lesson.id}`)}
                    className="flex items-center gap-1 text-xs"
                  >
                    {isCompleted ? 'Replay' : 'Launch 🚀'}
                  </CartoonButton>
                </div>
              </CartoonCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
