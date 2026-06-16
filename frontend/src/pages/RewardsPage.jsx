import React from 'react';
import { Trophy, Star, ShieldAlert, Award, Compass, Gift } from 'lucide-react';
import { CartoonButton, CartoonCard, BadgeItem } from '../components/Reusables';

export default function RewardsPage({ 
  stars = 15,
  badges = [],
  level = 1,
  completedLessons = []
}) {
  // Available badges configuration details
  const badgeDetails = [
    { id: 'spark_starter', label: 'Spark Starter', icon: '⚡', desc: 'Successfully completed the KG introduction challenge!' },
    { id: 'conduct_hero', label: 'Material Hero', icon: '🪙', desc: 'Completed the conductors vs insulators experiment!' },
    { id: 'switch_wizard', label: 'Switch Wizard', icon: '🔌', desc: 'Wired and toggled switch gates in a circular loop!' },
    { id: 'loop_master', label: 'Loop Master', icon: '🔄', desc: 'Successfully powered rotating fan motors!' },
    { id: 'resistor_shield', label: 'Resistor Shield', icon: '🛡️', desc: 'Learned Ohm\'s law speed bumps and alert buzzers!' },
    { id: 'junior_engineer', label: 'Junior Engineer', icon: '🛠️', desc: 'Wired 2 or more circuits successfully!' },
    { id: 'circuit_master', label: 'Circuit Master', icon: '👑', desc: 'Completed all 5 core grade-specific syllabus lessons!' },
    { id: 'stem_explorer', label: 'STEM Explorer', icon: '🌍', desc: 'Reached a cumulative count of 30 or more stars!' },
    { id: 'sim_wizard', label: 'Simulator Wizard', icon: '🧙‍♂️', desc: 'Unlocked all 4 professional CircuitJS1 presets!' }
  ];

  // Achievements lock checklists
  const achievements = [
    {
      title: 'First Spark ⚡',
      desc: 'Earn your first 5 stars.',
      target: 5,
      current: stars,
      icon: '💡',
      color: 'science'
    },
    {
      title: 'Double Trouble 🛠️',
      desc: 'Complete at least 2 circuit challenges.',
      target: 2,
      current: completedLessons.length,
      icon: '🛠️',
      color: 'spark'
    },
    {
      title: 'Star Magnet 🌟',
      desc: 'Amass 30 stars to prove your knowledge.',
      target: 30,
      current: stars,
      icon: '🌟',
      color: 'energy'
    },
    {
      title: 'Lab Maestro 🧙‍♂️',
      desc: 'Complete all 5 primary grade syllabus lessons.',
      target: 5,
      current: completedLessons.filter(id => !id.startsWith('sim_')).length,
      icon: '👑',
      color: 'electric'
    }
  ];

  // User rank generator
  const getRankDescription = () => {
    if (stars >= 50) return "Master of Magnetism 🧙‍♂️";
    if (stars >= 35) return "Circuit Engineer 🛠️";
    if (stars >= 20) return "Junior Explorer 🧭";
    return "Spark Apprentice 🐣";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      
      {/* Rewards Page Title */}
      <div className="border-b-2 border-slate-100 pb-4">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
          🏆 Rewards & badges <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">Level {level}</span>
        </h1>
        <p className="text-slate-500 font-semibold text-sm">Claim prizes, view badges, and track your achievements.</p>
      </div>

      {/* Ranks & Stars Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Level Rank Card */}
        <CartoonCard color="white" className="flex items-center gap-4 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="w-16 h-16 bg-indigo-500 border-4 border-slate-800 rounded-2xl flex items-center justify-center shadow-cartoon text-3xl text-white">
            {level}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-400 text-xs uppercase tracking-wider">Current Level</h3>
            <span className="font-black text-xl text-slate-800">Level {level} Engineer</span>
            <p className="text-xs text-indigo-500 font-bold mt-0.5">{getRankDescription()}</p>
          </div>
        </CartoonCard>

        {/* Stars Counter Card */}
        <CartoonCard color="white" className="flex items-center gap-4 bg-gradient-to-br from-amber-50 to-yellow-50">
          <div className="w-16 h-16 bg-amber-400 border-4 border-slate-800 rounded-2xl flex items-center justify-center shadow-cartoon text-3xl">
            ⭐
          </div>
          <div>
            <h3 className="font-extrabold text-slate-400 text-xs uppercase tracking-wider">Earned Stars</h3>
            <span className="font-black text-xl text-slate-800">{stars} Stars</span>
            <p className="text-xs text-amber-600 font-bold mt-0.5">Collect stars to unlock ranks!</p>
          </div>
        </CartoonCard>

        {/* Badges Counter Card */}
        <CartoonCard color="white" className="flex items-center gap-4 bg-gradient-to-br from-pink-50 to-rose-50">
          <div className="w-16 h-16 bg-electric-300 border-4 border-slate-800 rounded-2xl flex items-center justify-center shadow-cartoon text-3xl">
            🏆
          </div>
          <div>
            <h3 className="font-extrabold text-slate-400 text-xs uppercase tracking-wider">Badges Won</h3>
            <span className="font-black text-xl text-slate-800">{badges.length} Unlocked</span>
            <p className="text-xs text-pink-600 font-bold mt-0.5">Show off your skills in the lab!</p>
          </div>
        </CartoonCard>

      </div>

      {/* Badges Gallery Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          🎖️ My Badges Vault
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badgeDetails.map((badge) => {
            const hasEarned = badges.includes(badge.id);
            return (
              <CartoonCard 
                key={badge.id}
                color={hasEarned ? 'white' : 'white'}
                className={`flex items-center gap-4 transition-all duration-150 ${!hasEarned ? 'opacity-40 grayscale border-dashed bg-slate-50' : 'shadow-cartoon bg-white'}`}
              >
                <div className={`
                  w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl shadow-sm
                  ${hasEarned ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-300 animate-pulse-slow' : 'bg-slate-100 border-slate-200'}
                `}>
                  {badge.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 text-sm leading-none flex items-center justify-between">
                    {badge.label}
                    {hasEarned && <span className="text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded font-black">EARNED</span>}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
                    {badge.desc}
                  </p>
                </div>
              </CartoonCard>
            );
          })}
        </div>
      </div>

      {/* Achievement Missions Checker */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          🎯 Achievement Missions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach, idx) => {
            const progressPct = Math.min(Math.round((ach.current / ach.target) * 100), 100);
            const done = progressPct === 100;
            return (
              <CartoonCard key={idx} color={ach.color} className="flex gap-4">
                <div className="text-4xl bg-white border-2 border-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  {ach.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-sm text-slate-800">{ach.title}</h4>
                      <p className="text-[10px] text-slate-500 font-bold">{ach.desc}</p>
                    </div>
                    {done ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-black">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">
                        {ach.current} / {ach.target}
                      </span>
                    )}
                  </div>
                  
                  {/* Cartoon Progress Bar */}
                  <div className="w-full bg-slate-200 border-2 border-slate-700 h-4 rounded-full overflow-hidden p-[2px]">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${done ? 'bg-emerald-400' : 'bg-indigo-400'}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </CartoonCard>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
