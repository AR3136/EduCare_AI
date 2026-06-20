import React from 'react';

// Cartoon Button with 3D press effect
export const CartoonButton = ({ 
  children, 
  onClick, 
  color = 'science', // science, spark, energy, power, electric, gray
  size = 'md', 
  className = '',
  disabled = false,
  ...props 
}) => {
  const colorClasses = {
    science: 'bg-science-400 hover:bg-science-500 text-white border-science-600',
    spark: 'bg-spark-400 hover:bg-spark-500 text-slate-800 border-spark-600',
    energy: 'bg-energy-400 hover:bg-energy-500 text-white border-energy-600',
    power: 'bg-power-400 hover:bg-power-500 text-white border-power-600',
    electric: 'bg-electric-400 hover:bg-electric-500 text-white border-electric-500',
    gray: 'bg-slate-300 hover:bg-slate-400 text-slate-700 border-slate-400',
    teal: 'bg-teal-500 hover:bg-teal-600 text-white border-teal-700',
    purple: 'bg-purple-500 hover:bg-purple-600 text-white border-purple-700',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm border-b-4',
    md: 'px-5 py-2.5 text-base border-b-4',
    lg: 'px-8 py-3.5 text-lg border-b-6',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        btn-cartoon rounded-2xl font-bold tracking-wider active:border-b-0 active:mt-[4px] active:mb-[-4px]
        transition-all duration-100 ease-in-out border-x border-t
        ${colorClasses[color]} ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Reusable card with retro cartoon shadow
export const CartoonCard = ({ 
  children, 
  color = 'white', 
  className = '',
  onClick
}) => {
  const cardColors = {
    white: 'bg-white text-slate-800 border-slate-200',
    science: 'bg-science-50 text-science-900 border-science-300',
    spark: 'bg-spark-50 text-amber-900 border-spark-300',
    energy: 'bg-energy-50 text-orange-900 border-energy-300',
    power: 'bg-power-50 text-emerald-900 border-power-300',
    electric: 'bg-electric-50 text-pink-900 border-electric-300',
  };

  return (
    <div 
      onClick={onClick}
      className={`
        border-2 rounded-3xl p-6 shadow-cartoon hover:shadow-cartoon-hover transition-all duration-150
        ${cardColors[color]}
        ${onClick ? 'cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Stars display
export const StarTracker = ({ count }) => {
  return (
    <div className="flex items-center gap-1 bg-amber-100 border-2 border-amber-300 px-4 py-1.5 rounded-full shadow-cartoon">
      <span className="text-xl animate-bounce-slow">⭐</span>
      <span className="font-bold text-amber-800 text-lg">{count}</span>
    </div>
  );
};

// Badges list
export const BadgeItem = ({ id, label, icon, earned = false }) => {
  return (
    <div className={`
      flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-300 w-24 text-center
      ${earned 
        ? 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-300 scale-100 opacity-100 shadow-cartoon' 
        : 'bg-slate-100 border-slate-200 opacity-50 grayscale scale-95'
      }
    `}>
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-xs font-semibold leading-tight text-slate-700">{label}</div>
    </div>
  );
};
