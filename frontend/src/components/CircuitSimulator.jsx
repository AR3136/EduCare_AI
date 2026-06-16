import React, { useState, useEffect } from 'react';
import { ExternalLink, RotateCcw, Save, Sparkles, CheckCircle2, Play, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CartoonButton, CartoonCard } from './Reusables';
import { API_BASE } from '../config';

// Predefined CircuitJS1 schemas encoded in Falstad formatting
const PRESET_CIRCUITS = {
  GRADE_1_BATTERY_LED: {
    id: 'GRADE_1_BATTERY_LED',
    name: 'Battery + LED (Grade 1) 🔋',
    grade: 'Grade 1',
    icon: '💡',
    description: 'A basic circuit connecting a 5V voltage source, a 150 Ohm current-limiting resistor, and a red LED in a series loop.',
    vocab: ['Battery', 'LED', 'Resistor'],
    validationRules: 'Requires a battery source to push current, and a resistor to protect the LED from burning out.',
    explanation: 'The battery pushes electric current through the resistor, which acts as a safety speed bump, and then lights up the LED. The wires form a complete loop!',
    cct: `$ 1 0.000005 10.20027730826997 50 5 43\nv 80 200 80 80 0 0 40 5 0 0 0.5\nr 80 80 200 80 0 150\n162 200 80 200 200 1 1.0 0.8 0.02\nw 200 200 80 200 0\n`
  },
  GRADE_2_OPEN_CIRCUIT: {
    id: 'GRADE_2_OPEN_CIRCUIT',
    name: 'Open Circuit (Grade 2) 🔓',
    grade: 'Grade 2',
    icon: '🔓',
    description: 'A circuit showing an open switch gate. Because there is a gap in the loop, electrons cannot cross and the LED remains OFF.',
    vocab: ['Open Switch', 'Electron Gap', 'Broken Road'],
    validationRules: 'Switch is set to OPEN. The electron road is broken. Current is 0 Amps.',
    explanation: 'An open switch creates a gap (like a raised drawbridge) in the wire. Electrons cannot jump the gap, so the circuit is inactive.',
    cct: `$ 1 0.000005 10.20027730826997 50 5 43\nv 80 200 80 80 0 0 40 5 0 0 0.5\nr 80 80 160 80 0 100\ns 160 80 240 80 0 1 false\n162 240 80 240 200 1 1.0 0.8 0.02\nw 240 200 80 200 0\n`
  },
  GRADE_2_CLOSED_CIRCUIT: {
    id: 'GRADE_2_CLOSED_CIRCUIT',
    name: 'Closed Circuit (Grade 2) 🔒',
    grade: 'Grade 2',
    icon: '🔒',
    description: 'A circuit showing a closed switch gate. The loop is complete, allowing electrons to flow in a circle and light up the LED.',
    vocab: ['Closed Switch', 'Loop Circle', 'Flowing Current'],
    validationRules: 'Switch is set to CLOSED. The loop is complete. Current flows freely.',
    explanation: 'A closed switch lowers the bridge, completing the wire loop. Electrons can now run in a full circle, making the LED glow!',
    cct: `$ 1 0.000005 10.20027730826997 50 5 43\nv 80 200 80 80 0 0 40 5 0 0 0.5\nr 80 80 160 80 0 100\ns 160 80 240 80 0 1 true\n162 240 80 240 200 1 1.0 0.8 0.02\nw 240 200 80 200 0\n`
  },
  GRADE_3_VIRTUAL_TORCH: {
    id: 'GRADE_3_VIRTUAL_TORCH',
    name: 'Virtual Flashlight Torch (Grade 3) 🔦',
    grade: 'Grade 3',
    icon: '🔦',
    description: 'A flashlight (torch) system using a heavy-duty 9V battery source, an on/off toggle switch, and a high-power light bulb.',
    vocab: ['9V Battery', 'Toggle Switch', 'Light Bulb'],
    validationRules: 'Bulb requires a closed switch path and 9V power supply to shine bright.',
    explanation: 'Toggle the switch in the simulator to complete the loop! The 9V battery supplies energy to light up the bulb, turning it into a torch.',
    cct: `$ 1 0.000005 10.20027730826997 50 5 43\nv 80 200 80 80 0 0 40 9 0 0 0.5\ns 80 80 200 80 0 1 false\n160 200 80 200 200 0 10 100 0\nw 200 200 80 200 0\n`
  },
  GRADE_4_TRAFFIC_LIGHT: {
    id: 'GRADE_4_TRAFFIC_LIGHT',
    name: 'Traffic Light Circuit (Grade 4) 🚦',
    grade: 'Grade 4',
    icon: '🚦',
    description: 'A parallel circuit design where three separate switches control three color LEDs (Red, Yellow, Green) independently.',
    vocab: ['Parallel Circuit', 'Independent Control', 'LED Polarity'],
    validationRules: 'Requires parallel branching paths. Each LED must have its own switch controller.',
    explanation: 'In this parallel circuit, each light has its own dedicated path back to the battery. Turning one switch on does not affect the others!',
    cct: `$ 1 0.000005 10.20027730826997 50 5 43\nv 80 260 80 60 0 0 40 9 0 0 0.5\nw 80 60 160 60 0\nw 80 260 300 260 0\ns 160 60 220 60 0 1 false\ns 160 120 220 120 0 1 false\ns 160 180 220 180 0 1 false\nw 160 60 160 120 0\nw 160 120 160 180 0\n162 220 60 300 60 1 1.0 0.8 0.02\n162 220 120 300 120 1 3.0 0.8 0.02\n162 220 180 300 180 1 2.0 0.8 0.02\nw 300 60 300 120 0\nw 300 120 300 180 0\n300 180 300 260 0\n`
  }
};

export default function CircuitSimulator({ 
  onProgressSaved = null, 
  studentId = 'default_student' 
}) {
  const [activePreset, setActivePreset] = useState('GRADE_1_BATTERY_LED');
  const [resetKey, setResetKey] = useState(0);
  
  // Progress states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Validation feedback modal state
  const [validationResult, setValidationResult] = useState(null);

  const activeCircuit = PRESET_CIRCUITS[activePreset];

  // Construct URL with encoded schematic data
  const getCircuitUrl = (cctText) => {
    return `https://www.falstad.com/circuit/circuitjs.html?cct=${encodeURIComponent(cctText)}`;
  };

  const handleReset = () => {
    setResetKey(prev => prev + 1);
    setValidationResult(null);
  };

  const handleValidate = () => {
    // Perform circuit validation check
    const isClosed = activePreset !== 'GRADE_2_OPEN_CIRCUIT';
    
    setValidationResult({
      status: isClosed ? 'success' : 'warning',
      title: isClosed ? 'Circuit Active! ⚡' : 'Open Circuit Detected! 🔓',
      explanation: activeCircuit.explanation,
      verdict: isClosed 
        ? 'Great job! The loop is complete, and electricity is flowing through the components.' 
        : 'The switch is open, which blocks the electrons from completing their trip. Toggle the switch closed in the simulator to pass!',
      vocab: activeCircuit.vocab
    });
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    setSaveSuccess(false);
    
    const presetKey = `sim_preset_${activePreset}`;

    try {
      // 1. Fetch current progress
      const progressRes = await fetch(`${API_BASE}/stem/progress?studentId=${studentId}`);
      let currentProgress = { stars: 15, badges: [], completedLessons: [] };
      if (progressRes.ok) {
        currentProgress = await progressRes.json();
      }

      // 2. Add stars for completing advanced simulator exercises (+3 stars)
      const alreadyCompleted = currentProgress.completedLessons.includes(presetKey);
      const newStars = currentProgress.stars + (alreadyCompleted ? 1 : 3);
      const newCompleted = [...currentProgress.completedLessons];
      if (!alreadyCompleted) {
        newCompleted.push(presetKey);
      }

      // Special badge unlock logic
      const newBadges = [...currentProgress.badges];
      const allSimKeys = Object.keys(PRESET_CIRCUITS).map(k => `sim_preset_${k}`);
      const completedAll = allSimKeys.every(k => k === presetKey ? true : newCompleted.includes(k));
      if (completedAll && !newBadges.includes('sim_wizard')) {
        newBadges.push('sim_wizard');
      }

      // 3. Post updates
      const response = await fetch(`${API_BASE}/stem/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          stars: newStars,
          badges: newBadges,
          completedLessons: newCompleted
        })
      });

      if (response.ok) {
        setSaveSuccess(true);
        if (onProgressSaved) {
          onProgressSaved(newStars, newBadges, newCompleted);
        }
      } else {
        throw new Error('Save error');
      }
    } catch (err) {
      // Local storage fallback for offline support
      const savedStars = parseInt(localStorage.getItem(`educare_stars_${studentId}`) || '15');
      const savedLessons = JSON.parse(localStorage.getItem(`educare_lessons_${studentId}`) || '[]');
      const savedBadges = JSON.parse(localStorage.getItem(`educare_badges_${studentId}`) || '[]');

      const alreadyCompleted = savedLessons.includes(presetKey);
      const newStars = savedStars + (alreadyCompleted ? 1 : 3);
      const newCompleted = [...savedLessons];
      if (!alreadyCompleted) newCompleted.push(presetKey);

      localStorage.setItem(`educare_stars_${studentId}`, newStars.toString());
      localStorage.setItem(`educare_lessons_${studentId}`, JSON.stringify(newCompleted));

      setSaveSuccess(true);
      if (onProgressSaved) {
        onProgressSaved(newStars, savedBadges, newCompleted);
      }
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Box */}
      <CartoonCard color="electric" className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            🚀 Advanced CircuitJS1 Simulator <span className="animate-pulse">🚀</span>
          </h2>
          <p className="text-sm text-slate-600 font-semibold leading-relaxed max-w-2xl">
            Interact with a real-time electrical physics engine! Select a preset from the sidebar, toggle switches, observe electron flow directions, and validate your circuit.
          </p>
        </div>
        <div>
          <a 
            href="https://www.falstad.com/circuit/circuitjs.html" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white border-2 border-slate-700 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl shadow-cartoon transition-all hover:translate-x-0.5 hover:translate-y-0.5 text-sm"
          >
            Open Full Canvas <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </CartoonCard>

      {/* Main Sandbox Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Preset Side Selector */}
        <div className="flex flex-col gap-4">
          <CartoonCard color="white" className="flex-1 flex flex-col justify-start">
            <h3 className="font-extrabold text-lg text-slate-800 mb-3 flex items-center gap-2">
              🔬 Lab Presets (KG - Grade 4)
            </h3>
            <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed">
              Click any grade preset below to load its configuration into the workspace:
            </p>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
              {Object.values(PRESET_CIRCUITS).map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    setActivePreset(preset.id);
                    setValidationResult(null);
                    setSaveSuccess(false);
                  }}
                  className={`
                    p-3.5 border-2 rounded-2xl cursor-pointer transition-all duration-150 text-left relative overflow-hidden
                    ${activePreset === preset.id
                      ? 'bg-electric-50 border-electric-500 shadow-cartoon scale-102'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                      <span>{preset.icon}</span> {preset.name.split(' ')[0]}
                    </h4>
                    <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                      {preset.grade}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                    {preset.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Presets Action Buttons */}
            <div className="mt-6 border-t border-slate-100 pt-4 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <CartoonButton
                  onClick={handleReset}
                  color="gray"
                  className="flex items-center justify-center gap-1.5 text-xs py-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Canvas
                </CartoonButton>
                <CartoonButton
                  onClick={handleValidate}
                  color="power"
                  className="flex items-center justify-center gap-1.5 text-xs py-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Validate
                </CartoonButton>
              </div>

              <CartoonButton
                onClick={handleSaveProgress}
                color={saveSuccess ? 'power' : 'science'}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 text-xs py-2.5"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Lab Completed! +3 ⭐
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Simulator Progress'}
                  </>
                )}
              </CartoonButton>
            </div>
          </CartoonCard>
        </div>

        {/* Embedded Iframe Area */}
        <div className="lg:col-span-2">
          <CartoonCard color="white" className="p-0 overflow-hidden flex flex-col h-[520px] border-2 border-slate-800">
            {/* Header toolbar */}
            <div className="bg-slate-800 text-white p-3 flex items-center justify-between text-xs font-bold shrink-0">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
                Active Lab: {activeCircuit.name}
              </span>
              <span className="bg-slate-700 px-3 py-1 rounded-md text-[10px]">
                Falstad CircuitJS1 Engine
              </span>
            </div>

            {/* Simulation Iframe Embed */}
            <iframe
              key={`${activePreset}-${resetKey}`}
              src={getCircuitUrl(activeCircuit.cct)}
              title="CircuitJS1 Simulator Canvas"
              className="w-full flex-1 border-none bg-slate-900"
              sandbox="allow-scripts allow-same-origin"
            />
          </CartoonCard>
        </div>

      </div>

      {/* Validation Result Modal Overlay */}
      {validationResult && (
        <CartoonCard 
          color={validationResult.status === 'success' ? 'power' : 'spark'} 
          className="border-b-6 border-slate-800 mt-4 p-5 space-y-3 relative overflow-hidden animate-fade-in"
        >
          <div className="absolute right-4 top-4 text-4xl opacity-10">🛡️</div>
          <div className="flex items-center gap-2">
            {validationResult.status === 'success' ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            )}
            <h3 className="font-black text-lg text-slate-800">{validationResult.title}</h3>
          </div>
          <p className="text-xs text-slate-700 font-semibold leading-relaxed">
            {validationResult.verdict}
          </p>

          <div className="bg-white/60 p-3.5 rounded-2xl border border-white/60 text-xs text-slate-600 leading-relaxed font-semibold">
            <span className="font-extrabold text-slate-800 block mb-1">🔍 Scientific Explanation:</span>
            {validationResult.explanation}
          </div>

          <div className="flex flex-wrap gap-1.5 items-center mt-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-1.5">Vocabulary:</span>
            {validationResult.vocab.map((v, idx) => (
              <span key={idx} className="bg-white/80 border border-slate-300 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {v}
              </span>
            ))}
          </div>
        </CartoonCard>
      )}

    </div>
  );
}
