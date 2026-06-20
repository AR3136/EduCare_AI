import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, HelpCircle, Save, Info, Sparkles } from 'lucide-react';
import { CartoonButton, CartoonCard } from './Reusables';
import { eventBus } from '../shared/eventBus';

// Component constants
export const COMPONENTS = {
  WIRE: { id: 'WIRE', name: 'Wire 🔗', icon: '➖', type: 'passive' },
  BATTERY: { id: 'BATTERY', name: 'Battery 🔋', icon: '🔋', type: 'source', voltage: 9 },
  BULB: { id: 'BULB', name: 'Light Bulb 💡', icon: '💡', type: 'consumer' },
  SWITCH: { id: 'SWITCH', name: 'Switch 🎛️', icon: '🔌', type: 'control' },
  FAN: { id: 'FAN', name: 'Fan Motor 🌀', icon: '🌀', type: 'consumer' },
  BUZZER: { id: 'BUZZER', name: 'Buzzer 🔔', icon: '🔔', type: 'consumer' },
  RESISTOR: { id: 'RESISTOR', name: 'Resistor 🛡️', icon: '🚧', type: 'passive', resistance: 10 },
  TEST_SLOT: { id: 'TEST_SLOT', name: 'Material Slot 🧪', icon: '🧫', type: 'passive' },
};

export const MATERIALS = {
  GOLD: { id: 'GOLD', name: 'Gold Coin 🪙', icon: '🪙', conductor: true },
  WOOD: { id: 'WOOD', name: 'Wood Stick 🥢', icon: '🥢', conductor: false },
  PLASTIC: { id: 'PLASTIC', name: 'Plastic Ruler 📏', icon: '📏', conductor: false },
  PAPERCLIP: { id: 'PAPERCLIP', name: 'Metal Paperclip 📎', icon: '📎', conductor: true },
};

export default function CircuitWorkspace({ 
  grade = 'KG', 
  challengeId = null,
  targetCircuit = null, 
  onChallengePassed = null, 
  onChallengeFailed = null, 
  onSaveCircuit = null,
  studentId = 'default_student'
}) {
  // We represent a 4-slot square loop circuit:
  // Slot 0 (Left): Power Source
  // Slot 1 (Top): Control
  // Slot 2 (Right): Consumer
  // Slot 3 (Bottom): Resistor or wire
  const [slots, setSlots] = useState([
    COMPONENTS.BATTERY, // Left
    COMPONENTS.WIRE,    // Top
    COMPONENTS.BULB,    // Right
    COMPONENTS.WIRE,    // Bottom
  ]);

  const [switchClosed, setSwitchClosed] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS.GOLD);
  const [resistance, setResistance] = useState(10); // Resistor slider
  const [voltage, setVoltage] = useState(9); // Battery voltage
  const [isFlowing, setIsFlowing] = useState(false);
  const [bulbBrightness, setBulbBrightness] = useState(0);
  const [shortCircuit, setShortCircuit] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [circuitMessage, setCircuitMessage] = useState('');

  // Reset circuit on grade/challenge change
  useEffect(() => {
    resetCircuit();
  }, [grade, challengeId]);

  const resetCircuit = () => {
    setSwitchClosed(false);
    setSelectedMaterial(MATERIALS.GOLD);
    setResistance(10);
    setVoltage(9);
    setShortCircuit(false);
    setIsFlowing(false);
    setBulbBrightness(0);
    setActiveSlot(null);
    setCircuitMessage('');
    
    if (grade === 'KG') {
      setSlots([COMPONENTS.BATTERY, COMPONENTS.WIRE, COMPONENTS.BULB, COMPONENTS.WIRE]);
    } else if (grade === 'Grade 1') {
      setSlots([COMPONENTS.BATTERY, COMPONENTS.WIRE, COMPONENTS.TEST_SLOT, COMPONENTS.WIRE]);
    } else if (grade === 'Grade 2') {
      setSlots([COMPONENTS.BATTERY, COMPONENTS.SWITCH, COMPONENTS.BULB, COMPONENTS.WIRE]);
    } else if (grade === 'Grade 3') {
      setSlots([COMPONENTS.BATTERY, COMPONENTS.SWITCH, COMPONENTS.BULB, COMPONENTS.WIRE]);
    } else { // Grade 4
      setSlots([COMPONENTS.BATTERY, COMPONENTS.SWITCH, COMPONENTS.BULB, COMPONENTS.RESISTOR]);
    }

    eventBus.publish('CIRCUIT_LOADED', { studentId, grade });
  };

  // Evaluate circuit logic on update
  useEffect(() => {
    evaluateCircuit();
  }, [slots, switchClosed, selectedMaterial, resistance, voltage]);

  const evaluateCircuit = () => {
    let hasBattery = slots.some(s => s.id === 'BATTERY');
    let hasConsumer = slots.some(s => s.id === 'BULB' || s.id === 'FAN' || s.id === 'BUZZER');
    let hasSwitch = slots.some(s => s.id === 'SWITCH');
    let hasMaterialSlot = slots.some(s => s.id === 'TEST_SLOT');
    let hasResistor = slots.some(s => s.id === 'RESISTOR');

    let switchOk = !hasSwitch || switchClosed;
    let materialOk = !hasMaterialSlot || selectedMaterial.conductor;
    let circuitClosed = hasBattery && switchOk && materialOk;

    let hasLoad = hasConsumer || (hasResistor && resistance > 2) || (hasMaterialSlot && !selectedMaterial.conductor);
    if (hasBattery && circuitClosed && !hasLoad) {
      setShortCircuit(true);
      setIsFlowing(false);
      setBulbBrightness(0);
      setCircuitMessage("⚠️ SHORT CIRCUIT! Battery is too hot! Add a bulb or resistor.");
      eventBus.publish('CIRCUIT_BROKEN', { studentId, reason: 'Short Circuit' });
      return;
    } else {
      setShortCircuit(false);
    }

    if (circuitClosed && hasLoad) {
      setIsFlowing(true);
      setCircuitMessage("⚡ CLOSED! Electrons are flowing happily!");

      if (slots.some(s => s.id === 'BULB')) {
        const totalResistance = hasResistor ? resistance : 5;
        const current = voltage / totalResistance;
        const brightness = Math.min(Math.max(current * 40, 10), 100);
        setBulbBrightness(brightness);
      } else {
        setBulbBrightness(0);
      }

      checkChallengeSuccess();
    } else {
      setIsFlowing(false);
      setBulbBrightness(0);
      
      if (!hasBattery) {
        setCircuitMessage("🔋 Missing power! Add a battery.");
      } else if (hasSwitch && !switchClosed) {
        setCircuitMessage("🔌 Switch is OPEN! Click on switch to close it.");
      } else if (hasMaterialSlot && !selectedMaterial.conductor) {
        setCircuitMessage(`❌ ${selectedMaterial.name} blocks electricity!`);
      } else {
        setCircuitMessage("🔗 Connect your wire loop.");
      }
    }
  };

  const evaluateSuccessConditions = () => {
    const hasBattery = slots.some(s => s.id === 'BATTERY');
    const bulbsCount = slots.filter(s => s.id === 'BULB').length;
    const fansCount = slots.filter(s => s.id === 'FAN').length;
    const buzzersCount = slots.filter(s => s.id === 'BUZZER').length;
    const switchesCount = slots.filter(s => s.id === 'SWITCH').length;
    const resistorsCount = slots.filter(s => s.id === 'RESISTOR').length;
    const materialSlotsCount = slots.filter(s => s.id === 'TEST_SLOT').length;

    let switchOk = switchesCount === 0 || switchClosed;
    let materialOk = materialSlotsCount === 0 || selectedMaterial.conductor;
    let flowing = hasBattery && switchOk && materialOk;

    if (shortCircuit || !flowing) return false;

    if (challengeId === 'lesson-kg-std') return bulbsCount >= 1;
    if (challengeId === 'lesson-kg-adv') return bulbsCount >= 2;
    if (challengeId === 'lesson-g1-std') return materialSlotsCount >= 1 && selectedMaterial.conductor;
    if (challengeId === 'lesson-g1-adv') return slots.filter(s => s.id === 'TEST_SLOT').length >= 2 && selectedMaterial.conductor;
    if (challengeId === 'lesson-g2-std') return switchesCount >= 1 && switchClosed && bulbsCount >= 1;
    if (challengeId === 'lesson-g2-adv') return switchesCount >= 2 && switchClosed;
    if (challengeId === 'lesson-g3-std') return fansCount >= 1 && switchClosed;
    if (challengeId === 'lesson-g3-adv') return fansCount >= 1 && bulbsCount >= 1 && switchClosed;
    if (challengeId === 'lesson-g4-std') return buzzersCount >= 1 && resistorsCount >= 1 && switchClosed && resistance >= 5 && resistance <= 20;
    if (challengeId === 'lesson-g4-adv') return buzzersCount >= 1 && bulbsCount >= 1 && resistorsCount >= 1;

    if (grade === 'KG') return bulbsCount >= 1;
    if (grade === 'Grade 1') return materialSlotsCount >= 1 && selectedMaterial.conductor;
    if (grade === 'Grade 2') return switchesCount >= 1 && switchClosed && bulbsCount >= 1;
    if (grade === 'Grade 3') return fansCount >= 1 && switchClosed;
    if (grade === 'Grade 4') return buzzersCount >= 1 && resistorsCount >= 1 && switchClosed;

    return false;
  };

  const checkChallengeSuccess = () => {
    if (evaluateSuccessConditions()) {
      if (onChallengePassed) onChallengePassed();
    }
  };

  const handleTestCircuit = () => {
    evaluateCircuit();
    const passed = evaluateSuccessConditions();
    if (passed) {
      if (onChallengePassed) onChallengePassed();
    } else {
      if (onChallengeFailed) onChallengeFailed();
    }
  };

  const handleSlotClick = (index) => {
    if (slots[index] && slots[index].id === 'SWITCH') {
      setSwitchClosed(prev => !prev);
    }
    setActiveSlot(index);
  };

  const changeSlotComponent = (component) => {
    if (activeSlot === null) return;
    const newSlots = [...slots];
    newSlots[activeSlot] = component;
    setSlots(newSlots);
    setActiveSlot(null);
    eventBus.publish('COMPONENT_ADDED', { studentId, componentId: component.id, slot: activeSlot });
  };

  const getAvailableComponents = () => {
    const list = [COMPONENTS.WIRE, COMPONENTS.BATTERY];
    if (grade === 'KG') {
      list.push(COMPONENTS.BULB);
    } else if (grade === 'Grade 1') {
      list.push(COMPONENTS.BULB, COMPONENTS.TEST_SLOT);
    } else if (grade === 'Grade 2') {
      list.push(COMPONENTS.BULB, COMPONENTS.SWITCH);
    } else if (grade === 'Grade 3') {
      list.push(COMPONENTS.BULB, COMPONENTS.SWITCH, COMPONENTS.FAN);
    } else { // Grade 4
      list.push(COMPONENTS.BULB, COMPONENTS.SWITCH, COMPONENTS.FAN, COMPONENTS.BUZZER, COMPONENTS.RESISTOR);
    }
    return list;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Main Compact Workbench & Sliders */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        
        {/* SVG Circuit Board */}
        <div className="flex-1">
          <CartoonCard color="white" className="p-3 flex flex-col items-center justify-center relative overflow-hidden h-full">
            {/* Header toolbar */}
            <div className="w-full flex items-center justify-between border-b-2 border-slate-100 pb-1.5 mb-2 shrink-0">
              <span className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                🛠️ Circuit Board <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">Grade {grade}</span>
              </span>
              <div className="flex gap-1.5">
                {onChallengePassed && (
                  <CartoonButton size="sm" color="power" onClick={handleTestCircuit} className="text-[10px] py-1 px-3">
                    Test ⚡
                  </CartoonButton>
                )}
                <CartoonButton size="sm" color="gray" onClick={resetCircuit} className="text-[10px] py-1 px-2.5">
                  Reset
                </CartoonButton>
                {onSaveCircuit && (
                  <CartoonButton size="sm" color="science" onClick={() => onSaveCircuit(slots)} className="text-[10px] py-1 px-2.5">
                    Save
                  </CartoonButton>
                )}
              </div>
            </div>

            {/* Interactive SVG Display (Smaller capped height) */}
            <div className="relative w-full max-h-[220px] aspect-[4/3] flex items-center justify-center p-1">
              <div className="absolute inset-0 bg-slate-900/5 rounded-2xl border-2 border-slate-200 border-dashed m-1"></div>

              <svg viewBox="0 0 400 300" className="w-full h-full max-h-[200px] relative z-10 overflow-visible">
                <rect 
                  x="80" 
                  y="60" 
                  width="240" 
                  height="180" 
                  rx="20" 
                  fill="none" 
                  stroke="#475569" 
                  strokeWidth="10" 
                />
                {isFlowing && (
                  <rect 
                    x="80" 
                    y="60" 
                    width="240" 
                    height="180" 
                    rx="20" 
                    fill="none" 
                    stroke="#fbbf24" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    className="current-flow"
                  />
                )}

                {/* SLOT 0: LEFT */}
                <g 
                  onClick={() => handleSlotClick(0)} 
                  className={`cursor-pointer transition-transform duration-100 hover:scale-105 ${activeSlot === 0 ? 'ring-4 ring-science-400 rounded-full' : ''}`}
                >
                  {slots[0].id === 'BATTERY' ? (
                    <>
                      <rect x="55" y="120" width="50" height="60" rx="10" fill="#f97316" stroke="#475569" strokeWidth="4" />
                      <rect x="70" y="112" width="20" height="8" rx="2" fill="#334155" />
                      <text x="80" y="155" fill="white" className="text-2xl font-black" textAnchor="middle">🔋</text>
                      <text x="80" y="175" fill="white" className="text-[10px] font-bold" textAnchor="middle">{voltage}V</text>
                      <text x="80" y="138" fill="white" className="text-xs font-bold" textAnchor="middle">+</text>
                    </>
                  ) : (
                    <>
                      <circle cx="80" cy="150" r="28" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" />
                      <text x="80" y="157" className="text-xl" textAnchor="middle">❓</text>
                    </>
                  )}
                  <circle cx="80" cy="150" r="4" fill="#64748b" />
                </g>

                {/* SLOT 1: TOP */}
                <g 
                  onClick={() => handleSlotClick(1)} 
                  className={`cursor-pointer transition-transform duration-100 hover:scale-105 ${activeSlot === 1 ? 'ring-4 ring-science-400 rounded-full' : ''}`}
                >
                  {slots[1].id === 'SWITCH' ? (
                    <>
                      <rect x="170" y="35" width="60" height="50" rx="10" fill="#38bdf8" stroke="#475569" strokeWidth="4" />
                      <circle cx="185" cy="60" r="5" fill="#334155" />
                      <circle cx="215" cy="60" r="5" fill="#334155" />
                      {switchClosed ? (
                        <line x1="185" y1="60" x2="215" y2="60" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
                      ) : (
                        <line x1="185" y1="60" x2="208" y2="40" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
                      )}
                      <text x="200" y="77" fill="white" className="text-[9px] font-bold" textAnchor="middle">
                        {switchClosed ? 'CLOSED' : 'OPEN'}
                      </text>
                    </>
                  ) : slots[1].id === 'WIRE' ? (
                    <circle cx="200" cy="60" r="14" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
                  ) : (
                    <>
                      <circle cx="200" cy="60" r="28" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" />
                      <text x="200" y="67" className="text-xl" textAnchor="middle">❓</text>
                    </>
                  )}
                </g>

                {/* SLOT 2: RIGHT */}
                <g 
                  onClick={() => handleSlotClick(2)} 
                  className={`cursor-pointer transition-transform duration-100 hover:scale-105 ${activeSlot === 2 ? 'ring-4 ring-science-400 rounded-full' : ''}`}
                >
                  {slots[2].id === 'BULB' ? (
                    <>
                      <rect x="295" y="125" width="50" height="50" rx="8" fill="#e2e8f0" stroke="#475569" strokeWidth="4" />
                      {isFlowing && (
                        <circle cx="320" cy="145" r="28" fill="rgba(250, 204, 21, 0.25)" className="animate-pulse-slow" />
                      )}
                      <circle 
                        cx="320" 
                        cy="145" 
                        r="16" 
                        fill={isFlowing ? `rgba(250, 204, 21, ${bulbBrightness / 100})` : '#f1f5f9'} 
                        stroke="#475569" 
                        strokeWidth="3" 
                      />
                      <text x="320" y="152" className="text-xl" textAnchor="middle">💡</text>
                    </>
                  ) : slots[2].id === 'FAN' ? (
                    <>
                      <rect x="295" y="125" width="50" height="50" rx="8" fill="#a855f7" stroke="#475569" strokeWidth="4" />
                      <g className={isFlowing ? 'animate-spin-slow origin-[320px_145px]' : ''}>
                        <circle cx="320" cy="145" r="14" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
                        <line x1="320" y1="131" x2="320" y2="159" stroke="#334155" strokeWidth="4" />
                        <line x1="306" y1="145" x2="334" y2="145" stroke="#334155" strokeWidth="4" />
                      </g>
                      <text x="320" y="120" className="text-[8px] font-bold fill-purple-900" textAnchor="middle">FAN</text>
                    </>
                  ) : slots[2].id === 'BUZZER' ? (
                    <>
                      <rect x="295" y="125" width="50" height="50" rx="8" fill="#ef4444" stroke="#475569" strokeWidth="4" />
                      {isFlowing && (
                        <g className="animate-bounce origin-center">
                          <text x="320" y="115" className="text-[8px] font-black fill-red-600" textAnchor="middle">BZZZ!</text>
                        </g>
                      )}
                      <text x="320" y="157" className="text-2xl" textAnchor="middle">🔔</text>
                    </>
                  ) : slots[2].id === 'TEST_SLOT' ? (
                    <>
                      <rect x="290" y="115" width="60" height="70" rx="10" fill="#10b981" stroke="#475569" strokeWidth="4" />
                      <text x="320" y="145" className="text-2xl" textAnchor="middle">{selectedMaterial.icon}</text>
                      <text x="320" y="172" fill="white" className="text-[9px] font-bold" textAnchor="middle">
                        {selectedMaterial.name.split(' ')[0]}
                      </text>
                    </>
                  ) : (
                    <>
                      <circle cx="320" cy="150" r="28" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" />
                      <text x="320" y="157" className="text-xl" textAnchor="middle">❓</text>
                    </>
                  )}
                </g>

                {/* SLOT 3: BOTTOM */}
                <g 
                  onClick={() => handleSlotClick(3)} 
                  className={`cursor-pointer transition-transform duration-100 hover:scale-105 ${activeSlot === 3 ? 'ring-4 ring-science-400 rounded-full' : ''}`}
                >
                  {slots[3].id === 'RESISTOR' ? (
                    <>
                      <rect x="170" y="215" width="60" height="50" rx="10" fill="#facc15" stroke="#475569" strokeWidth="4" />
                      <line x1="185" y1="215" x2="185" y2="265" stroke="#ea580c" strokeWidth="4" />
                      <line x1="200" y1="215" x2="200" y2="265" stroke="#2563eb" strokeWidth="4" />
                      <line x1="215" y1="215" x2="215" y2="265" stroke="#16a34a" strokeWidth="4" />
                      <text x="200" y="258" fill="#451a03" className="text-[9px] font-bold" textAnchor="middle">
                        {resistance} Ω
                      </text>
                    </>
                  ) : slots[3].id === 'WIRE' ? (
                    <circle cx="200" cy="240" r="14" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
                  ) : (
                    <>
                      <circle cx="200" cy="240" r="28" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" />
                      <text x="200" y="247" className="text-xl" textAnchor="middle">❓</text>
                    </>
                  )}
                </g>
              </svg>

              {slots[1].id === 'SWITCH' && !switchClosed && (
                <div 
                  onClick={() => setSwitchClosed(true)}
                  className="absolute top-2 left-[38%] bg-amber-400 text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-xl shadow-cartoon border border-slate-800 animate-bounce cursor-pointer z-20"
                >
                  Click Switch! 🔌
                </div>
              )}
            </div>
          </CartoonCard>
        </div>

        {/* Sliders and Tester Settings (Placed next to SVG on desktop to save height) */}
        <div className="w-full lg:w-72 flex flex-col justify-between shrink-0">
          <CartoonCard color="white" className="p-3 flex-1 flex flex-col justify-center space-y-3 h-full">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Info className="w-4 h-4 text-slate-400" /> Circuit Report:
            </h4>
            <p className={`text-xs font-black leading-snug ${shortCircuit ? 'text-red-500 animate-pulse' : isFlowing ? 'text-power-600' : 'text-slate-500'}`}>
              {circuitMessage}
            </p>

            <div className="space-y-2 border-t border-slate-100 pt-2.5">
              {/* Battery voltage slider */}
              {slots.some(s => s.id === 'BATTERY') && (
                <div className="bg-orange-50/50 border border-orange-200 p-2.5 rounded-xl">
                  <label className="block text-[10px] font-extrabold text-orange-800 uppercase mb-1">
                    🔋 Battery: {voltage} Volts
                  </label>
                  <input 
                    type="range" 
                    min="3" 
                    max="18" 
                    step="3"
                    value={voltage} 
                    onChange={(e) => setVoltage(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-orange-200 rounded-lg cursor-pointer accent-orange-500"
                  />
                </div>
              )}

              {/* Resistor Ohms slider */}
              {slots.some(s => s.id === 'RESISTOR') && (
                <div className="bg-yellow-50/50 border border-yellow-200 p-2.5 rounded-xl">
                  <label className="block text-[10px] font-extrabold text-yellow-800 uppercase mb-1">
                    🚧 Resistor: {resistance} Ohms
                  </label>
                  <input 
                    type="range" 
                    min="2" 
                    max="50" 
                    value={resistance} 
                    onChange={(e) => setResistance(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-yellow-200 rounded-lg cursor-pointer accent-yellow-500"
                  />
                </div>
              )}

              {/* Materials Tester */}
              {slots.some(s => s.id === 'TEST_SLOT') && (
                <div className="bg-emerald-50/50 border border-emerald-200 p-2 rounded-xl">
                  <span className="block text-[10px] font-extrabold text-emerald-800 uppercase mb-1">
                    🧪 Test Material:
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.values(MATERIALS).map((material) => (
                      <button
                        key={material.id}
                        onClick={() => setSelectedMaterial(material)}
                        className={`
                          flex items-center gap-1 p-1 rounded-lg border text-[10px] font-bold transition-all
                          ${selectedMaterial.id === material.id
                            ? 'bg-emerald-200 border-emerald-500'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                          }
                        `}
                      >
                        <span>{material.icon}</span>
                        <span className="truncate">{material.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CartoonCard>
        </div>

      </div>

      {/* 2. Interactive Component Inventory Dock (Hotbar) */}
      <CartoonCard color="science" className="p-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-left select-none">
            <span className="font-extrabold text-sm text-slate-800 block">
              🎒 Component Bag Hotbar
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              {activeSlot === null 
                ? 'Tap any slot with a question mark ❓ on the board above first!' 
                : `Tap a component below to load it into Slot ${activeSlot === 0 ? 'Left' : activeSlot === 1 ? 'Top' : activeSlot === 2 ? 'Right' : 'Bottom'}`
              }
            </span>
          </div>

          {/* Minecraft style horizontal hotbar */}
          <div className="flex gap-2 bg-white/60 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto max-w-full">
            {activeSlot === null ? (
              <div className="text-[10px] text-slate-400 font-extrabold py-1 px-4">
                🔒 Tap a board slot to unlock inventory
              </div>
            ) : (
              getAvailableComponents().map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => changeSlotComponent(comp)}
                  className="bg-white hover:bg-slate-50 border-2 border-slate-200 active:translate-y-0.5 rounded-xl p-2 flex items-center gap-1.5 font-bold text-slate-700 text-xs shadow-sm hover:border-science-400 transition-all shrink-0"
                >
                  <span className="text-xl">{comp.icon}</span>
                  <span>{comp.name.split(' ')[0]}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </CartoonCard>

    </div>
  );
}
