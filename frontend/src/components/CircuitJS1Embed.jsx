import React, { useState } from 'react';
import { ExternalLink, Info, RotateCcw, Save, Sparkles, CheckCircle2 } from 'lucide-react';
import { CartoonButton, CartoonCard } from './Reusables';
import { API_BASE } from '../config';

// CircuitJS1 text schemas encoded in base64/plain format.
// We load them by passing the plain text in url cct parameter.
const SCHEMAS = {
  BATTERY_LED: {
    name: "Battery + LED (Grade 1) 🔋",
    grade: "Grade 1",
    desc: "A basic loop circuit connecting a 5V voltage source, a 150 Ohm current-limiting resistor, and a red LED.",
    cct: `$ 1 0.000005 10.20027730826997 50 5 43\nv 80 200 80 80 0 0 40 5 0 0 0.5\nr 80 80 200 80 0 150\n162 200 80 200 200 1 1.0 0.8 0.02\nw 200 200 80 200 0\n`
  },
  OPEN_CLOSED: {
    name: "Open vs Closed Circuit (Grade 2) 🔌",
    grade: "Grade 2",
    desc: "Control the electron road! Toggle the switch gate to watch the electrons stop and start.",
    cct: `$ 1 0.000005 10.20027730826997 50 5 43\nv 80 200 80 80 0 0 40 5 0 0 0.5\nr 80 80 160 80 0 100\ns 160 80 240 80 0 1 false\n162 240 80 240 200 1 1.0 0.8 0.02\nw 240 200 80 200 0\n`
  },
  TORCH: {
    name: "Virtual Flashlight Torch (Grade 3) 🔦",
    grade: "Grade 3",
    desc: "A flashlight (torch) design using a high-power 9V battery, a switch, and a high-brightness light bulb component.",
    cct: `$ 1 0.000005 10.20027730826997 50 5 43\nv 80 200 80 80 0 0 40 9 0 0 0.5\ns 80 80 200 80 0 1 false\n160 200 80 200 200 0 10 100 0\nw 200 200 80 200 0\n`
  },
  TRAFFIC_LIGHT: {
    name: "Traffic Light System (Grade 4) 🚦",
    grade: "Grade 4",
    desc: "A parallel logic system with three switches controlling three separate LEDs: Red (top), Yellow (middle), and Green (bottom).",
    cct: `$ 1 0.000005 10.20027730826997 50 5 43\nv 80 260 80 60 0 0 40 9 0 0 0.5\nw 80 60 160 60 0\nw 80 260 300 260 0\ns 160 60 220 60 0 1 false\ns 160 120 220 120 0 1 false\ns 160 180 220 180 0 1 false\nw 160 60 160 120 0\nw 160 120 160 180 0\n162 220 60 300 60 1 1.0 0.8 0.02\n162 220 120 300 120 1 3.0 0.8 0.02\n162 220 180 300 180 1 2.0 0.8 0.02\nw 300 60 300 120 0\nw 300 120 300 180 0\n300 180 300 260 0\n`
  }
};

export default function CircuitJS1Embed({ onProgressSaved }) {
  const [activePreset, setActivePreset] = useState('BATTERY_LED');
  const [resetKey, setResetKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const getCircuitUrl = (cctText) => {
    // Construct Falstad simulation URL with encoded schematic data
    return `https://www.falstad.com/circuit/circuitjs.html?cct=${encodeURIComponent(cctText)}`;
  };

  const handleReset = () => {
    // Incrementing key re-mounts the iframe, resetting it completely
    setResetKey(prev => prev + 1);
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    setSaveSuccess(false);

    const presetName = SCHEMAS[activePreset].name;
    const gradeLevel = SCHEMAS[activePreset].grade;

    try {
      // 1. Fetch current progress
      const progressRes = await fetch(`${API_BASE}/stem/progress`);
      let currentProgress = { stars: 15, badges: [], completedLessons: [] };
      if (progressRes.ok) {
        currentProgress = await progressRes.json();
      }

      // 2. Add stars for completing advanced simulator exercises (+3 stars)
      const experienceKey = `sim_preset_${activePreset}`;
      const alreadyCompleted = currentProgress.completedLessons.includes(experienceKey);
      
      const newStars = currentProgress.stars + (alreadyCompleted ? 1 : 3);
      const newCompleted = [...currentProgress.completedLessons];
      if (!alreadyCompleted) {
        newCompleted.push(experienceKey);
      }

      // Add special badge if all 4 simulator modules are complete
      const newBadges = [...currentProgress.badges];
      const allSimKeys = Object.keys(SCHEMAS).map(k => `sim_preset_${k}`);
      const completedAllSims = allSimKeys.every(k => k === experienceKey ? true : newCompleted.includes(k));
      const simWizardBadge = 'sim_wizard';
      if (completedAllSims && !newBadges.includes(simWizardBadge)) {
        newBadges.push(simWizardBadge);
      }

      // 3. Post to backend
      const response = await fetch(`${API_BASE}/stem/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stars: newStars,
          badges: newBadges,
          completedLessons: newCompleted
        })
      });

      if (response.ok) {
        setSaveSuccess(true);
        // Call parent trigger to update state
        if (onProgressSaved) {
          onProgressSaved(newStars, newBadges, newCompleted);
        }
      } else {
        throw new Error('Save error');
      }
    } catch (err) {
      // Offline fallback
      const savedStars = parseInt(localStorage.getItem('educare_stars') || '15');
      const savedBadges = JSON.parse(localStorage.getItem('educare_badges') || '[]');
      const savedLessons = JSON.parse(localStorage.getItem('educare_lessons') || '[]');
      
      const experienceKey = `sim_preset_${activePreset}`;
      const alreadyCompleted = savedLessons.includes(experienceKey);
      
      const newStars = savedStars + (alreadyCompleted ? 1 : 3);
      const newCompleted = [...savedLessons];
      if (!alreadyCompleted) newCompleted.push(experienceKey);
      
      localStorage.setItem('educare_stars', newStars.toString());
      localStorage.setItem('educare_lessons', JSON.stringify(newCompleted));

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
      {/* Introduction Card */}
      <CartoonCard color="electric" className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            🚀 Advanced CircuitJS1 Simulator <span className="animate-pulse">🚀</span>
          </h2>
          <p className="text-sm text-slate-600 font-semibold leading-relaxed max-w-2xl">
            Experiment with authentic electrical components! Toggle preset schematics, inspect current flow speeds, and save your progress to earn bonus stars.
          </p>
        </div>
        <div>
          <a 
            href="https://www.falstad.com/circuit/circuitjs.html" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white border-2 border-slate-700 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl shadow-cartoon transition-all hover:translate-x-0.5 hover:translate-y-0.5 text-sm"
          >
            Full Page <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </CartoonCard>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Preset Selector Panel */}
        <div className="flex flex-col gap-4">
          <CartoonCard color="white" className="flex-1 flex flex-col justify-start">
            <h3 className="font-extrabold text-lg text-slate-800 mb-3 flex items-center gap-1.5">
              🔬 Load Lab Preset
            </h3>
            <p className="text-xs text-slate-500 font-semibold mb-4">
              Select one of the child-appropriate configurations below to preload the physics engine:
            </p>

            <div className="space-y-3 flex-1">
              {Object.entries(SCHEMAS).map(([key, preset]) => (
                <div 
                  key={key}
                  onClick={() => {
                    setActivePreset(key);
                    setSaveSuccess(false);
                  }}
                  className={`
                    p-4 border-2 rounded-2xl cursor-pointer transition-all duration-150 text-left
                    ${activePreset === key 
                      ? 'bg-electric-50 border-electric-500 shadow-cartoon scale-102' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:scale-[1.01]'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-800">{preset.name}</h4>
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border font-bold">
                      {preset.grade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    {preset.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Controller Actions: Reset & Save */}
            <div className="mt-6 border-t border-slate-100 pt-4 space-y-3">
              <CartoonButton 
                onClick={handleReset}
                color="gray"
                className="w-full flex items-center justify-center gap-2 text-sm"
              >
                <RotateCcw className="w-4 h-4" /> Reset Simulator Canvas
              </CartoonButton>

              <CartoonButton
                onClick={handleSaveProgress}
                color={saveSuccess ? 'power' : 'science'}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 text-sm"
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

            {/* Quick guide notes */}
            <div className="mt-4 bg-slate-50 border-2 border-slate-200 p-3.5 rounded-2xl">
              <h4 className="font-extrabold text-xs text-slate-700 flex items-center gap-1 mb-1">
                💡 Mini Instructions:
              </h4>
              <ul className="text-[10px] text-slate-500 font-semibold space-y-1 list-disc pl-4">
                <li>Click <strong>switches 🔌</strong> on the screen to open/close gates.</li>
                <li>Moving yellow dots show electron flow direction and speed.</li>
                <li>Need more space? Double-click components to edit properties.</li>
              </ul>
            </div>
          </CartoonCard>
        </div>

        {/* Embedded Iframe */}
        <div className="lg:col-span-2">
          <CartoonCard color="white" className="p-0 overflow-hidden flex flex-col h-[550px] border-2 border-slate-800">
            {/* Custom Iframe Header */}
            <div className="bg-slate-800 text-white p-3 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
                Active Lab: {SCHEMAS[activePreset].name}
              </span>
              <span className="bg-slate-700 px-3 py-1 rounded-md text-[10px]">
                Physics Engine Running
              </span>
            </div>

            {/* The Simulation Iframe */}
            <iframe
              key={`${activePreset}-${resetKey}`}
              src={getCircuitUrl(SCHEMAS[activePreset].cct)}
              title="CircuitJS1 Simulator"
              className="w-full flex-1 border-none"
              sandbox="allow-scripts allow-same-origin"
            />
          </CartoonCard>
        </div>
      </div>
    </div>
  );
}
