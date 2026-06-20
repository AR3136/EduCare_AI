import React, { useState } from 'react';
import { Play, Star, Calendar, User, BookOpen } from 'lucide-react';
import SoundEngine from '../shared/soundEngine';

export default function StudentLogin({ onLoginComplete }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('KG');
  const [error, setError] = useState('');

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let currentAge = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      currentAge--;
    }
    return currentAge.toString();
  };

  const handleDobChange = (e) => {
    setDob(e.target.value);
    const calculated = calculateAge(e.target.value);
    if (calculated !== '') {
      setAge(calculated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !dob || !age || !grade) {
      setError('Please fill out all your magical details!');
      SoundEngine.playSad();
      return;
    }

    SoundEngine.playSuccess();
    
    // Save to localStorage
    localStorage.setItem('educare_student_name', name.trim());
    localStorage.setItem('educare_student_dob', dob);
    localStorage.setItem('educare_age_student_123', age);
    localStorage.setItem('educare_grade_student_123', grade);

    // Initial stars/XP if not set
    if (!localStorage.getItem('educare_stars_student_123')) {
      localStorage.setItem('educare_stars_student_123', '15');
    }

    onLoginComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4 selection:bg-rose-200">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
        <span className="absolute top-10 left-10 text-6xl opacity-50 animate-bounce-slow">🚀</span>
        <span className="absolute top-20 right-20 text-6xl opacity-50 animate-bounce-slow" style={{animationDelay: '1s'}}>🪐</span>
        <span className="absolute bottom-20 left-1/4 text-6xl opacity-50 animate-bounce-slow" style={{animationDelay: '2s'}}>🎨</span>
        <span className="absolute bottom-10 right-10 text-6xl opacity-50 animate-bounce-slow" style={{animationDelay: '0.5s'}}>📚</span>
      </div>

      <div className="bg-white border-8 border-slate-900 rounded-[3rem] p-8 md:p-12 shadow-cartoon w-full max-w-lg relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-cartoon mx-auto mb-4 animate-bounce">
            <span className="text-5xl">🤖</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-wide">
            Welcome Explorer!
          </h1>
          <p className="text-slate-500 font-bold text-sm">
            Let's create your magical learning profile.
          </p>
        </div>

        {error && (
          <div className="bg-rose-100 border-2 border-rose-400 text-rose-800 px-4 py-3 rounded-2xl font-bold text-sm text-center mb-6 animate-pulse">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 ml-2">
              <User className="w-4 h-4" /> What's your name?
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Astro"
              className="w-full bg-slate-50 border-4 border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none rounded-2xl px-5 py-4 font-black text-slate-700 text-lg transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 ml-2">
                <Calendar className="w-4 h-4" /> Birthday
              </label>
              <input 
                type="date" 
                value={dob}
                onChange={handleDobChange}
                className="w-full bg-slate-50 border-4 border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none rounded-2xl px-4 py-4 font-black text-slate-700 text-base transition-all uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 ml-2">
                <Star className="w-4 h-4" /> Age
              </label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Years old"
                min="3" max="18"
                className="w-full bg-slate-50 border-4 border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none rounded-2xl px-5 py-4 font-black text-slate-700 text-lg transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 ml-2">
              <BookOpen className="w-4 h-4" /> Grade Level
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-slate-50 border-4 border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none rounded-2xl px-5 py-4 font-black text-slate-700 text-lg transition-all appearance-none cursor-pointer"
            >
              <option value="KG">Kindergarten (KG)</option>
              <option value="Grade 1">1st Grade</option>
              <option value="Grade 2">2nd Grade</option>
              <option value="Grade 3">3rd Grade</option>
              <option value="Grade 4">4th Grade</option>
            </select>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              onClick={() => SoundEngine.playPop()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-4 border-slate-900 py-4 px-6 rounded-2xl font-black text-xl shadow-[0_8px_0_rgb(15,23,42)] active:shadow-[0_0px_0_rgb(15,23,42)] active:translate-y-2 transition-all flex items-center justify-center gap-2"
            >
              Start Adventure! <Play className="w-6 h-6 fill-current" />
            </button>
          </div>
          
        </form>

      </div>
    </div>
  );
}
