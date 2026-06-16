import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Info, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { CartoonButton, CartoonCard } from './Reusables';

// Component toolbox types
const TOOLBOX_COMPONENTS = [
  { type: 'BATTERY', name: 'Battery 🔋', icon: '🔋', color: 'bg-orange-100 border-orange-400 text-orange-700' },
  { type: 'BULB', name: 'LED Bulb 💡', icon: '💡', color: 'bg-yellow-100 border-yellow-400 text-yellow-700' },
  { type: 'SWITCH', name: 'Switch 🎛️', icon: '🔌', color: 'bg-sky-100 border-sky-400 text-sky-700' },
  { type: 'WIRE', name: 'Wire 🔗', icon: '➖', color: 'bg-slate-100 border-slate-400 text-slate-700' },
  { type: 'RESISTOR', name: 'Resistor 🛡️', icon: '🚧', color: 'bg-amber-100 border-amber-400 text-amber-700' },
  { type: 'MOTOR', name: 'Motor Fan 🌀', icon: '🌀', color: 'bg-purple-100 border-purple-400 text-purple-700' }
];

export default function DragAndDropCircuitBuilder() {
  const [grid, setGrid] = useState({}); // key: 'r-c', value: { type, switchClosed, id }
  const [draggedType, setDraggedType] = useState(null);
  const [circuitStatus, setCircuitStatus] = useState({ status: 'incomplete', message: '🔗 Build a circle starting from the battery (+) to (-).' });

  const rows = 3;
  const cols = 4;

  // Run path-finding validation on grid change
  useEffect(() => {
    validateCircuit();
  }, [grid]);

  // Handle Drag Start
  const handleDragStart = (e, type) => {
    setDraggedType(type);
    e.dataTransfer.setData('text/plain', type);
  };

  // Drop component on grid cell
  const handleDrop = (e, r, c) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain') || draggedType;
    if (type) {
      setGrid(prev => ({
        ...prev,
        [`${r}-${c}`]: {
          type,
          id: `${type}-${Date.now()}`,
          switchClosed: false,
          resistance: 10
        }
      }));
      setDraggedType(null);
    }
  };

  // Remove component from cell
  const handleRemove = (r, c) => {
    const newGrid = { ...grid };
    delete newGrid[`${r}-${c}`];
    setGrid(newGrid);
  };

  // Clear workspace
  const handleClear = () => {
    setGrid({});
    setCircuitStatus({ status: 'incomplete', message: '🔗 Build a circle starting from the battery (+) to (-).' });
  };

  // Toggle switch gate closed/open
  const toggleSwitch = (r, c) => {
    const key = `${r}-${c}`;
    if (grid[key] && grid[key].type === 'SWITCH') {
      setGrid(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          switchClosed: !prev[key].switchClosed
        }
      }));
    }
  };

  // Connection Path-finding Validation
  const validateCircuit = () => {
    const batteries = Object.entries(grid).filter(([_, val]) => val.type === 'BATTERY');
    if (batteries.length === 0) {
      setCircuitStatus({ status: 'incomplete', message: '🔋 Missing power! Drag a battery onto the grid.' });
      return;
    }

    const adj = {};
    Object.keys(grid).forEach(key => {
      adj[key] = [];
    });

    const getNeighbors = (r, c) => {
      const neighbors = [];
      if (r > 0) neighbors.push({ r: r - 1, c, key: `${r - 1}-${c}` });
      if (r < rows - 1) neighbors.push({ r: r + 1, c, key: `${r + 1}-${c}` });
      if (c > 0) neighbors.push({ r, c: c - 1, key: `${r}-${c - 1}` });
      if (c < cols - 1) neighbors.push({ r, c: c + 1, key: `${r}-${c + 1}` });
      return neighbors;
    };

    // Add graph edges
    Object.entries(grid).forEach(([key, comp]) => {
      const [rStr, cStr] = key.split('-');
      const r = parseInt(rStr);
      const c = parseInt(cStr);

      if (comp.type === 'SWITCH' && !comp.switchClosed) {
        return;
      }

      getNeighbors(r, c).forEach(nb => {
        if (grid[nb.key]) {
          const nbComp = grid[nb.key];
          if (nbComp.type === 'SWITCH' && !nbComp.switchClosed) {
            return;
          }
          adj[key].push(nb.key);
        }
      });
    });

    let loopFound = false;
    let shortCircuit = false;
    let pathKeys = new Set();
    let activeComponents = [];

    for (const [batKey, _] of batteries) {
      const [rStr, cStr] = batKey.split('-');
      const r = parseInt(rStr);
      const c = parseInt(cStr);

      const startKey = `${r}-${c + 1}`;
      const targetKey = `${r}-${c - 1}`;

      if (!grid[startKey] || !grid[targetKey]) {
        continue;
      }

      const visited = new Set();
      const parent = {};
      const dfs = (node) => {
        visited.add(node);
        if (node === targetKey) {
          loopFound = true;
          return true;
        }
        for (const next of (adj[node] || [])) {
          if (!visited.has(next)) {
            parent[next] = node;
            if (dfs(next)) return true;
          }
        }
        return false;
      };

      visited.add(batKey);

      if (dfs(startKey)) {
        let curr = targetKey;
        pathKeys.add(batKey);
        pathKeys.add(curr);
        while (curr !== startKey) {
          curr = parent[curr];
          pathKeys.add(curr);
        }

        const pathTypes = Array.from(pathKeys).map(k => grid[k].type);
        const hasLoad = pathTypes.some(t => t === 'BULB' || t === 'MOTOR');

        if (!hasLoad) {
          shortCircuit = true;
        } else {
          Array.from(pathKeys).forEach(k => {
            if (grid[k].type === 'BULB' || grid[k].type === 'MOTOR') {
              activeComponents.push(k);
            }
          });
        }
        break;
      }
    }

    if (loopFound) {
      if (shortCircuit) {
        setCircuitStatus({
          status: 'short_circuit',
          message: '⚠️ SHORT CIRCUIT WARNING! The battery is connected directly to itself with no LED or motor. It will overheat!',
          pathKeys
        });
      } else {
        setCircuitStatus({
          status: 'success',
          message: '⚡ SUCCESS! Closed loop complete. Electricity is flowing!',
          pathKeys,
          activeComponents
        });
      }
    } else {
      const openSwitches = Object.values(grid).some(c => c.type === 'SWITCH' && !c.switchClosed);
      if (openSwitches) {
        setCircuitStatus({
          status: 'open_circuit',
          message: '🔌 Switch is OPEN! Click on switch on the grid to close it.'
        });
      } else {
        setCircuitStatus({
          status: 'incomplete',
          message: '🔗 Connect wires and components in a complete circle from the battery (+) to (-).'
        });
      }
    }
  };

  const renderVisualConnections = () => {
    const lines = [];
    const stepX = 100;
    const stepY = 100;
    const offsetX = 50;
    const offsetY = 50;

    Object.entries(grid).forEach(([key, _]) => {
      const [rStr, cStr] = key.split('-');
      const r = parseInt(rStr);
      const c = parseInt(cStr);

      const x = offsetX + c * stepX;
      const y = offsetY + r * stepY;

      const rightKey = `${r}-${c + 1}`;
      if (grid[rightKey]) {
        const active = circuitStatus.pathKeys?.has(key) && circuitStatus.pathKeys?.has(rightKey);
        lines.push(
          <line
            key={`h-${r}-${c}`}
            x1={x}
            y1={y}
            x2={x + stepX}
            y2={y}
            stroke={active ? '#fbbf24' : '#475569'}
            strokeWidth={active ? '6' : '3'}
            strokeDasharray={active ? '8 4' : 'none'}
            className={active ? 'current-flow' : ''}
          />
        );
      }

      const bottomKey = `${r + 1}-${c}`;
      if (grid[bottomKey]) {
        const active = circuitStatus.pathKeys?.has(key) && circuitStatus.pathKeys?.has(bottomKey);
        lines.push(
          <line
            key={`v-${r}-${c}`}
            x1={x}
            y1={y}
            x2={x}
            y2={y + stepY}
            stroke={active ? '#fbbf24' : '#475569'}
            strokeWidth={active ? '6' : '3'}
            strokeDasharray={active ? '8 4' : 'none'}
            className={active ? 'current-flow' : ''}
          />
        );
      }
    });

    return lines;
  };

  return (
    <div className="flex flex-col gap-3">
      
      {/* 1. Main Grid and Status Reports side-by-side */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        
        {/* Workspace Canvas (Capped Height) */}
        <div className="flex-1">
          <CartoonCard color="white" className="p-3 flex flex-col items-center justify-center relative overflow-hidden h-full">
            <div className="w-full flex items-center justify-between border-b-2 border-slate-100 pb-1.5 mb-2 shrink-0">
              <span className="font-extrabold text-sm text-slate-800">
                🎨 Drag & Drop Grid Workspace
              </span>
              <CartoonButton size="sm" color="gray" onClick={handleClear} className="text-[10px] py-1 px-2.5">
                Clear Board
              </CartoonButton>
            </div>

            {/* Grid Workspace */}
            <div className="relative w-full max-h-[220px] aspect-[4/3] flex items-center justify-center p-1 select-none">
              <svg 
                viewBox="0 0 400 300" 
                className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
              >
                {renderVisualConnections()}
              </svg>

              <div className="grid grid-cols-4 grid-rows-3 gap-2.5 h-full w-full relative z-20">
                {Array.from({ length: rows }).map((_, r) =>
                  Array.from({ length: cols }).map((_, c) => {
                    const key = `${r}-${c}`;
                    const cell = grid[key];

                    return (
                      <div
                        key={key}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, r, c)}
                        className={`
                          relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-100
                          ${cell 
                            ? 'bg-white border-slate-700 shadow-cartoon scale-100' 
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-300'
                          }
                        `}
                      >
                        {cell ? (
                          <div 
                            onClick={() => {
                              if (cell.type === 'SWITCH') toggleSwitch(r, c);
                            }}
                            className={`w-full h-full p-1 flex flex-col items-center justify-center relative group ${cell.type === 'SWITCH' ? 'cursor-pointer select-none' : ''}`}
                          >
                            <div className="relative">
                              <span className={`
                                text-3xl block select-none
                                ${cell.type === 'MOTOR' && circuitStatus.activeComponents?.includes(key) ? 'animate-spin' : ''}
                                ${cell.type === 'BULB' && circuitStatus.activeComponents?.includes(key) ? 'glow-bulb-yellow scale-110' : ''}
                              `}>
                                {cell.type === 'BATTERY' ? '🔋' :
                                 cell.type === 'BULB' ? '💡' :
                                 cell.type === 'SWITCH' ? (cell.switchClosed ? '🔒' : '🔓') :
                                 cell.type === 'WIRE' ? '🔗' :
                                 cell.type === 'RESISTOR' ? '🚧' :
                                 cell.type === 'MOTOR' ? '🌀' : '❓'}
                              </span>
                              {cell.type === 'BATTERY' && (
                                <>
                                  <span className="absolute -left-1.5 top-0 text-[8px] font-black text-red-500 bg-white border px-0.5 rounded">-</span>
                                  <span className="absolute -right-1.5 top-0 text-[8px] font-black text-emerald-600 bg-white border px-0.5 rounded">+</span>
                                </>
                              )}
                            </div>

                            <span className="text-[8px] font-black text-slate-400 uppercase mt-0.5 leading-none">
                              {cell.type.split('_')[0]}
                            </span>

                            {cell.type === 'SWITCH' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSwitch(r, c);
                                }}
                                className={`
                                  mt-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold border transition-colors leading-none
                                  ${cell.switchClosed 
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                                  }
                                `}
                              >
                                {cell.switchClosed ? 'Closed' : 'Open'}
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(r, c);
                              }}
                              className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 border border-slate-800 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[8px] text-slate-400 font-extrabold uppercase select-none">
                            Drop
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CartoonCard>
        </div>

        {/* Validation Reports Panel (Right column on desktop) */}
        <div className="w-full lg:w-72 flex flex-col justify-between shrink-0">
          <CartoonCard 
            color={
              circuitStatus.status === 'success' ? 'power' :
              circuitStatus.status === 'short_circuit' ? 'energy' : 'white'
            } 
            className="p-3 flex-1 flex flex-col justify-center space-y-3 h-full"
          >
            <h4 className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5">
              {circuitStatus.status === 'success' ? (
                <CheckCircle className="w-4 h-4 text-power-600" />
              ) : (
                <Info className="w-4 h-4 text-slate-500" />
              )}
              Validation Status:
            </h4>
            <p className="text-xs font-bold leading-normal">
              {circuitStatus.message}
            </p>

            <div className="text-[9px] text-slate-500 font-bold bg-white/50 border border-slate-200 p-2.5 rounded-xl leading-relaxed mt-2.5 select-none">
              <span className="font-extrabold text-slate-800 block mb-0.5">ℹ️ Quick Tip:</span>
              Make sure wires form a complete loop from the battery positive terminal (+) back to the negative terminal (-).
            </div>
          </CartoonCard>
        </div>

      </div>

      {/* 2. Horizontal Component Bag Hotbar (Minecraft style) */}
      <CartoonCard color="science" className="p-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-left select-none shrink-0">
            <span className="font-extrabold text-sm text-slate-800 block">
              🎒 Draggable Component Bag
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
              Drag components directly from this bag and drop them on grid cells above!
            </span>
          </div>

          <div className="flex gap-2 bg-white/60 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto max-w-full">
            {TOOLBOX_COMPONENTS.map((comp) => (
              <div
                key={comp.type}
                draggable
                onDragStart={(e) => handleDragStart(e, comp.type)}
                className={`
                  p-2 rounded-xl border-2 flex items-center gap-1.5 font-bold text-xs cursor-grab active:cursor-grabbing hover:scale-102 shadow-sm shrink-0 transition-transform
                  ${comp.color}
                `}
              >
                <span className="text-xl select-none">{comp.icon}</span>
                <span>{comp.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </CartoonCard>

    </div>
  );
}
