import React, { useState, useEffect } from 'react';
import { Award, Star, BookOpen, Layers, CheckCircle2, ChevronRight, Activity, Calendar } from 'lucide-react';
import { CartoonButton, CartoonCard, StarTracker } from '../components/Reusables';
import { API_BASE } from '../config';

export default function ProgressPage({
  studentId = 'default_student',
  stars = 15,
  level = 1,
  badges = [],
  completedLessons = [],
  selectedGrade = 'KG'
}) {
  const [dbProgress, setDbProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLatestProgress() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/stem/progress?studentId=${studentId}`);
        if (response.ok) {
          const data = await response.json();
          setDbProgress(data);
        }
      } catch (err) {
        console.warn("Offline: loading stats from props");
      } finally {
        setLoading(false);
      }
    }
    fetchLatestProgress();
  }, [studentId, stars, completedLessons]);

  const activeProgress = dbProgress || {
    stars,
    level,
    badges,
    completedLessons,
    readinessScore: Math.min(Math.round((completedLessons.length / 5) * 100), 100),
    completedCircuits: []
  };

  // Weekly mockup data for the growth graph (simulating stars earned each day of the week)
  const weeklyData = [
    { day: 'Mon', count: 3, label: '3 ⭐' },
    { day: 'Tue', count: 8, label: '8 ⭐' },
    { day: 'Wed', count: 5, label: '5 ⭐' },
    { day: 'Thu', count: 12, label: '12 ⭐' },
    { day: 'Fri', count: 15, label: '15 ⭐' },
    { day: 'Sat', count: 20, label: '20 ⭐' },
    { day: 'Sun', count: 25, label: '25 ⭐' }
  ];

  // SVG Chart sizing
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Max value in weeklyData to scale coordinates
  const maxVal = Math.max(...weeklyData.map(d => d.count), 1);

  // Generate SVG path for a smooth wavy line
  const points = weeklyData.map((d, index) => {
    const x = paddingX + (index / (weeklyData.length - 1)) * chartWidth;
    const y = height - paddingY - (d.count / maxVal) * chartHeight;
    return { x, y };
  });

  let pathData = '';
  if (points.length > 0) {
    pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Curve control points for standard smooth bezier
      const cpX1 = points[i-1].x + (points[i].x - points[i-1].x) / 2;
      const cpY1 = points[i-1].y;
      const cpX2 = points[i-1].x + (points[i].x - points[i-1].x) / 2;
      const cpY2 = points[i].y;
      pathData += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
  }

  // Calculate readiness description
  const getReadinessFeedback = (score) => {
    if (score >= 90) return { title: 'Master Engineer! 🧙‍♂️', desc: 'You fully understand the circuits for this grade!', color: 'text-power-600 bg-power-50' };
    if (score >= 60) return { title: 'Circuit Expert! 🛠️', desc: 'You are doing amazing. Keep going to finish the level!', color: 'text-science-600 bg-science-50' };
    if (score >= 30) return { title: 'STEM Explorer! 🧭', desc: 'You are learning fast. Try a new simulator challenge!', color: 'text-energy-600 bg-energy-50' };
    return { title: 'Curious Learner! 🐣', desc: 'Start a lesson to learn how electricity flows!', color: 'text-slate-500 bg-slate-50' };
  };

  const feedback = getReadinessFeedback(activeProgress.readinessScore || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="border-b-2 border-slate-100 pb-4">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
          📊 Learning Progress <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold">Grade {selectedGrade}</span>
        </h1>
        <p className="text-slate-500 font-semibold text-sm">Visualize your growth, completed circuits, and readiness level.</p>
      </div>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CartoonCard color="white" className="flex flex-col items-center justify-between text-center space-y-2 h-44">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Active Grade</span>
          <span className="text-4xl font-black text-indigo-600">{selectedGrade}</span>
          <div className="text-[10px] text-slate-500 font-bold bg-indigo-50 border border-indigo-100 px-3 py-0.5 rounded-full">
            Age {selectedGrade === 'KG' ? '5' : selectedGrade === 'Grade 1' ? '6' : selectedGrade === 'Grade 2' ? '7' : selectedGrade === 'Grade 3' ? '8' : '9'} Years Old
          </div>
        </CartoonCard>

        <CartoonCard color="white" className="flex flex-col items-center justify-between text-center space-y-2 h-44">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Stars Gained</span>
          <span className="text-4xl font-black text-amber-500">⭐ {activeProgress.stars}</span>
          <p className="text-[10px] text-slate-500 font-semibold leading-tight">Stars are earned by passing challenges!</p>
        </CartoonCard>

        <CartoonCard color="white" className="flex flex-col items-center justify-between text-center space-y-2 h-44">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Lessons Mastered</span>
          <span className="text-4xl font-black text-power-600">📚 {activeProgress.completedLessons ? activeProgress.completedLessons.length : 0}</span>
          <p className="text-[10px] text-slate-500 font-semibold leading-tight">Out of available curriculum pages.</p>
        </CartoonCard>

        <CartoonCard color="white" className="flex flex-col items-center justify-between text-center space-y-2 h-44">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Saved Layouts</span>
          <span className="text-4xl font-black text-science-500">💾 {activeProgress.completedCircuits ? activeProgress.completedCircuits.length : 0}</span>
          <p className="text-[10px] text-slate-500 font-semibold leading-tight">Custom designs saved in simulator.</p>
        </CartoonCard>
      </div>

      {/* Main Grid: Weekly Chart & Readiness Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly Growth SVG Chart */}
        <CartoonCard color="white" className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500 animate-pulse" /> Weekly Learning Wave
          </h3>
          <p className="text-slate-500 font-semibold text-xs leading-relaxed">
            See how many stars you gathered this week. Keep the wave high to stay supercharged! ⚡
          </p>

          <div className="w-full bg-[#fdfcfb] border-2 border-slate-200 rounded-2xl p-4 flex items-center justify-center">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              {/* Grids and background lines */}
              <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="2" strokeDasharray="4" />
              <line x1={paddingX} y1={height/2} x2={width - paddingX} y2={height/2} stroke="#f1f5f9" strokeWidth="2" strokeDasharray="4" />
              <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e2e8f0" strokeWidth="2" />

              {/* Shaded Area under the wave */}
              {points.length > 0 && (
                <path
                  d={`${pathData} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`}
                  fill="url(#grad-wave)"
                  opacity="0.3"
                />
              )}

              {/* Glow filter */}
              <defs>
                <linearGradient id="grad-wave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Wave path */}
              <path
                d={pathData}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#glow)"
              />

              {/* Dots at key days */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="6"
                    className="fill-white stroke-orange-500 stroke-[3] transition-all hover:r-8 duration-100"
                  />
                  {/* Tooltip Label */}
                  <rect
                    x={p.x - 20}
                    y={p.y - 30}
                    width="40"
                    height="18"
                    rx="5"
                    fill="#334155"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  />
                  <text
                    x={p.x}
                    y={p.y - 18}
                    fill="white"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  >
                    {weeklyData[idx].label}
                  </text>
                </g>
              ))}

              {/* Day Labels */}
              {weeklyData.map((d, index) => {
                const x = paddingX + (index / (weeklyData.length - 1)) * chartWidth;
                return (
                  <text
                    key={index}
                    x={x}
                    y={height - 8}
                    className="text-[10px] fill-slate-400 font-extrabold"
                    textAnchor="middle"
                  >
                    {d.day}
                  </text>
                );
              })}
            </svg>
          </div>
        </CartoonCard>

        {/* Readiness Circular Ring Gauge */}
        <CartoonCard color="white" className="space-y-4 flex flex-col justify-between">
          <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Grade Readiness
          </h3>

          <div className="flex flex-col items-center justify-center space-y-4 py-2">
            {/* Circular SVG Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (activeProgress.readinessScore || 0) / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-800">
                  {activeProgress.readinessScore}%
                </span>
                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                  READY
                </span>
              </div>
            </div>

            {/* AI Custom feedback label */}
            <div className={`p-3 rounded-2xl border text-center ${feedback.color} w-full`}>
              <span className="font-black text-xs block">{feedback.title}</span>
              <span className="text-[10px] font-medium leading-relaxed block mt-0.5">{feedback.desc}</span>
            </div>
          </div>
        </CartoonCard>
      </div>

      {/* Completed Lessons & Wires List */}
      <div className="space-y-4">
        <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" /> Completed Missions Timeline
        </h3>

        {activeProgress.completedLessons && activeProgress.completedLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProgress.completedLessons.map((lessonId, idx) => {
              // Extract label friendly values
              const cleanName = lessonId
                .replace('lesson-', '')
                .replace('-std', '')
                .replace('-adv', '')
                .replace('-', ' ')
                .toUpperCase();
              return (
                <CartoonCard key={idx} color="white" className="flex items-center justify-between py-4 border-l-8 border-l-emerald-400">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 border border-emerald-300 w-10 h-10 rounded-xl flex items-center justify-center text-lg text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-800">{cleanName}</h4>
                      <p className="text-[10px] font-semibold text-slate-400">Mission Unlocked & Solved successfully!</p>
                    </div>
                  </div>
                  <div className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold border border-amber-200 flex items-center gap-1 shrink-0">
                    ⭐ +5 Stars
                  </div>
                </CartoonCard>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 font-bold text-sm">
            🎒 You haven't completed any lessons yet. Head to the dashboard to start!
          </div>
        )}
      </div>
    </div>
  );
}
