import React from 'react';
import { ChevronLeft } from 'lucide-react';
import CircuitWorkspace from '../components/CircuitWorkspace';
import AITutorPanel from '../components/AITutorPanel';

export default function SimulatorPage({ 
  onBack,
  grade = 'Grade 4'
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-extrabold text-slate-600 hover:text-slate-800 transition-colors w-max"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </button>
      </div>

      {/* Simulator Workspace */}
      <div className="relative">
        <div className="animate-fade-in max-w-4xl mx-auto w-full">
          <CircuitWorkspace 
            grade={grade} 
            onChallengePassed={null}
            onSaveCircuit={(slots) => {
              alert("💾 Circuit design saved to local vault! You can access it on the Dashboard.");
            }}
          />
        </div>

        {/* Global Floating AI Tutor Companion */}
        <AITutorPanel 
          grade={grade} 
          context="sandbox-kids"
          floating={true}
        />
      </div>
    </div>
  );
}

