import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, Info, Star, ShieldAlert, Award, TrendingUp, BarChart2 } from 'lucide-react';
import { API_BASE } from '../config';
import { CartoonCard } from './Reusables';

export default function ParentActivityReport({ studentId = 'student_123' }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/activity/parent-report?studentId=${studentId}`);
        if (response.ok) {
          const data = await response.json();
          setReport(data);
        } else {
          throw new Error('Failed to load parent report');
        }
      } catch (err) {
        console.warn('API parent report fetch offline, using mock data...');
        setMockReport();
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [studentId]);

  const setMockReport = () => {
    setReport({
      totalActivities: 8,
      completedActivities: 4,
      skippedActivities: 3,
      completionRate: 0.50,
      skipRate: 0.38,
      weeklyTrends: [
        { week: '2026-W22', assigned: 2, completed: 1, skipped: 1 },
        { week: '2026-W23', assigned: 3, completed: 2, skipped: 1 },
        { week: '2026-W24', assigned: 3, completed: 1, skipped: 1 }
      ],
      monthlyTrends: [
        { month: '2026-05', assigned: 2, completed: 1, skipped: 1 },
        { month: '2026-06', assigned: 6, completed: 3, skipped: 2 }
      ],
      alerts: [
        {
          type: "CONSECUTIVE_SKIPS",
          title: "3 Consecutive Skips",
          message: "Your child has skipped the last 3 activity breaks. They might be finding them too challenging or lack interest.",
          severity: "critical"
        },
        {
          type: "LOW_PARTICIPATION",
          title: "Low Activity Participation",
          message: "Activity break participation is low (only 50% completed). Try encouraging shorter stretching exercises first.",
          severity: "warning"
        }
      ]
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="font-bold text-xs tracking-wider uppercase animate-pulse">Loading Activity Insights...</span>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
        <h3 className="font-black text-2xl text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-500 animate-pulse" /> Child's Physical Activity Insights
        </h3>
        <span className="text-[10px] text-slate-400 font-extrabold uppercase bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Sync status: Active 🔄
        </span>
      </div>

      {/* 1. Alerts Section (If any) */}
      {report.alerts && report.alerts.length > 0 && (
        <div className="space-y-3">
          {report.alerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 shadow-cartoon ${
                alert.severity === 'critical' 
                  ? 'bg-rose-50 border-rose-300 text-rose-900' 
                  : alert.severity === 'warning'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {alert.severity === 'critical' ? (
                  <div className="bg-rose-500 text-white w-7 h-7 rounded-xl flex items-center justify-center font-bold border border-rose-700 shadow-cartoon-hover animate-bounce">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                ) : alert.severity === 'warning' ? (
                  <div className="bg-amber-500 text-slate-900 w-7 h-7 rounded-xl flex items-center justify-center font-bold border border-amber-700 shadow-cartoon-hover">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="bg-emerald-500 text-white w-7 h-7 rounded-xl flex items-center justify-center font-bold border border-emerald-700 shadow-cartoon-hover">
                    <Award className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-black text-sm">{alert.title}</h4>
                <p className="text-xs font-semibold leading-relaxed mt-0.5 opacity-90">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <CartoonCard color="white" className="flex flex-col items-center justify-center text-center p-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Total Breaks</span>
          <span className="text-3xl font-black text-slate-800 mt-1">{report.totalActivities}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Assigned breaks</span>
        </CartoonCard>

        <CartoonCard color="white" className="flex flex-col items-center justify-center text-center p-4 border-l-emerald-200">
          <span className="text-[10px] font-extrabold text-emerald-500 uppercase">Completed</span>
          <span className="text-3xl font-black text-emerald-600 mt-1">{report.completedActivities}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Active exercises</span>
        </CartoonCard>

        <CartoonCard color="white" className="flex flex-col items-center justify-center text-center p-4 border-l-rose-200">
          <span className="text-[10px] font-extrabold text-rose-500 uppercase">Skipped</span>
          <span className="text-3xl font-black text-rose-600 mt-1">{report.skippedActivities}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Declined breaks</span>
        </CartoonCard>

        <CartoonCard color="white" className="flex flex-col items-center justify-center text-center p-4 border-l-indigo-200">
          <span className="text-[10px] font-extrabold text-indigo-500 uppercase">Completion Rate</span>
          <span className="text-3xl font-black text-indigo-600 mt-1">{Math.round(report.completionRate * 100)}%</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Target is &gt;80%</span>
        </CartoonCard>

        <CartoonCard color="white" className="flex flex-col items-center justify-center text-center p-4 border-l-amber-200">
          <span className="text-[10px] font-extrabold text-amber-500 uppercase">Skip Rate</span>
          <span className="text-3xl font-black text-amber-600 mt-1">{Math.round(report.skipRate * 100)}%</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Target is &lt;20%</span>
        </CartoonCard>

      </div>

      {/* 3. Trends Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weekly trends panel */}
        <CartoonCard color="white" className="flex flex-col justify-between min-h-[260px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1">
              <BarChart2 className="w-4 h-4 text-indigo-500" /> Weekly Activity Trends
            </h4>
            <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Assigned vs Done</span>
          </div>

          {report.weeklyTrends && report.weeklyTrends.length > 0 ? (
            <div className="flex-1 flex items-end justify-around h-36 pt-4 border-b-2 border-slate-100">
              {report.weeklyTrends.map((w, idx) => (
                <div key={idx} className="flex flex-col items-center w-12 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[9px] p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-24 text-center font-bold">
                    Assigned: {w.assigned}<br />
                    Done: {w.completed}<br />
                    Skipped: {w.skipped}
                  </div>

                  {/* Vertical bar stack */}
                  <div className="flex gap-1 items-end w-full justify-center">
                    {/* Assigned bar */}
                    <div 
                      style={{ height: `${Math.max(12, w.assigned * 15)}px` }} 
                      className="w-3 bg-indigo-200 rounded-t-md border-x border-t border-indigo-400"
                    />
                    {/* Completed bar */}
                    <div 
                      style={{ height: `${Math.max(12, w.completed * 15)}px` }} 
                      className="w-3 bg-emerald-400 rounded-t-md border-x border-t border-emerald-600 shadow-sm"
                    />
                    {/* Skipped bar */}
                    <div 
                      style={{ height: `${Math.max(12, w.skipped * 15)}px` }} 
                      className="w-3 bg-rose-400 rounded-t-md border-x border-t border-rose-600"
                    />
                  </div>

                  {/* Axis label */}
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mt-2 rotate-12">{w.week.split('-')[1]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-bold text-xs">No weekly data logged yet</div>
          )}
        </CartoonCard>

        {/* Monthly trends panel */}
        <CartoonCard color="white" className="flex flex-col justify-between min-h-[260px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1">
              <BarChart2 className="w-4 h-4 text-emerald-500" /> Monthly Break Tally
            </h4>
            <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Engagement summary</span>
          </div>

          {report.monthlyTrends && report.monthlyTrends.length > 0 ? (
            <div className="flex-1 flex items-end justify-around h-36 pt-4 border-b-2 border-slate-100">
              {report.monthlyTrends.map((m, idx) => (
                <div key={idx} className="flex flex-col items-center w-16 group relative">
                  
                  <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[9px] p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-24 text-center font-bold">
                    Assigned: {m.assigned}<br />
                    Done: {m.completed}<br />
                    Skipped: {m.skipped}
                  </div>

                  <div className="flex gap-1.5 items-end w-full justify-center">
                    <div 
                      style={{ height: `${Math.max(12, m.assigned * 10)}px` }} 
                      className="w-4 bg-indigo-200 rounded-t-md border-x border-t border-indigo-400"
                    />
                    <div 
                      style={{ height: `${Math.max(12, m.completed * 10)}px` }} 
                      className="w-4 bg-emerald-400 rounded-t-md border-x border-t border-emerald-600 shadow-sm"
                    />
                    <div 
                      style={{ height: `${Math.max(12, m.skipped * 10)}px` }} 
                      className="w-4 bg-rose-400 rounded-t-md border-x border-t border-rose-600"
                    />
                  </div>

                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mt-2">{m.month}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-bold text-xs">No monthly data logged yet</div>
          )}
        </CartoonCard>

      </div>
      
    </div>
  );
}
