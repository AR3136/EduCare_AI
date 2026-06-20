import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, HelpCircle, AlertTriangle, Lightbulb, Wrench, CheckCircle } from 'lucide-react';
import { CartoonButton } from './Reusables';
import { API_BASE } from '../config';
import { eventBus } from '../shared/eventBus';

const SPARKLE_PHRASES = [
  "Engineers solve problems!",
  "Let's debug this circuit together ⚡",
  "Think like an inventor!",
  "Every mistake is a learning step.",
  "Check your connections!",
];

export default function AITutorPanel({ 
  grade = 'KG', 
  context = 'dashboard', 
  currentCircuit = null, 
  onUseHint = null, 
  floating = false,
  studentId = 'student_123'
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tutorMood, setTutorMood] = useState('happy');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Set initial welcome message depending on context and grade
  useEffect(() => {
    let welcomeText = `Hi there! I'm **Sparky**, your STEM Simulation Assistant! ⚡ `;
    if (context === 'dashboard') {
      welcomeText += `Pick a grade or click **Start Circuit Simulator** to begin building! Let's explore some engineering concepts.`;
    } else if (context.startsWith('lesson')) {
      welcomeText += `Ready for today's engineering challenge? Construct a circuit to complete the mission! Ask me to 'debug' or 'give a hint' if you get stuck.`;
    } else {
      welcomeText += `Welcome to the Sandbox! Drag components onto the grid. If it's not working, click 'Debug Circuit' and we'll troubleshoot it!`;
    }

    setMessages([
      {
        id: 1,
        sender: 'sparky',
        text: welcomeText,
        isStructured: false,
        timestamp: new Date()
      }
    ]);

    // Fire Session Started Event
    eventBus.publish('SPARKY_SESSION_STARTED', { studentId, grade, context });

  }, [context, grade, studentId]);

  // Listen for redirection event from FitFriend AI or general open
  useEffect(() => {
    const handleOpenSparky = () => setIsOpen(true);
    window.addEventListener('educare_open_sparky', handleOpenSparky);
    return () => window.removeEventListener('educare_open_sparky', handleOpenSparky);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    // Fire Hint Requested if they click a quick button for hint
    if (queryText.toLowerCase().includes('hint') || queryText.toLowerCase().includes('debug')) {
      eventBus.publish('HINT_REQUESTED', { studentId, queryText, circuit: currentCircuit });
    }

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      isStructured: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTutorMood('thinking');

    try {
      const response = await fetch(`${API_BASE}/api/ai/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          grade,
          context,
          circuit: currentCircuit,
          performanceScore: 70 // Mocked telemetry
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if structured reply
        const isStructured = typeof data.reply === 'object' && data.reply !== null;
        
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'sparky',
          text: isStructured ? '' : data.reply,
          structuredData: isStructured ? data.reply : null,
          isStructured,
          timestamp: new Date()
        }]);
        setTutorMood(data.mood || 'happy');

        // Fire Events based on response
        if (isStructured) {
          if (data.reply.problemAnalysis && data.reply.problemAnalysis.toLowerCase().includes('open') || data.reply.problemAnalysis.toLowerCase().includes('missing')) {
             eventBus.publish('SPARKY_ERROR_DETECTED', { studentId, error: data.reply.problemAnalysis });
          } else {
             eventBus.publish('SPARKY_HINT_GIVEN', { studentId, hint: data.reply.fixSteps });
          }
        }
      } else {
        throw new Error('Server offline');
      }
    } catch (err) {
      // Fallback
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'sparky',
        text: "I am having trouble connecting to my engineering database right now. Please check your circuit connections!",
        isStructured: false,
        timestamp: new Date()
      }]);
      setTutorMood('puzzled');
    } finally {
      setLoading(false);
    }
  };

  const getQuickQuestions = () => {
    return ["Debug Circuit 🔧", "Give me a Hint 💡", "How does a switch work?"];
  };

  const getSparkyAvatar = () => {
    switch (tutorMood) {
      case 'thinking':
        return (
          <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full flex items-center justify-center border-4 border-slate-700 animate-pulse shadow-cartoon shrink-0">
            <span className="text-2xl">⚙️</span>
          </div>
        );
      case 'excited':
        return (
          <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center border-4 border-slate-700 animate-bounce shadow-cartoon shrink-0">
            <span className="text-2xl">⚡</span>
          </div>
        );
      case 'puzzled':
        return (
          <div className="relative w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center border-4 border-slate-700 shadow-cartoon shrink-0">
            <span className="text-2xl">🔍</span>
          </div>
        );
      default: // happy
        return (
          <div className="relative w-12 h-12 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full flex items-center justify-center border-4 border-slate-700 shadow-cartoon shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-2xl">🤖</span>
          </div>
        );
    }
  };

  const renderMessageContent = (msg) => {
    if (!msg.isStructured) {
      return (
        <div className="text-xs leading-relaxed">
          {msg.text.split('**').map((chunk, idx) => 
            idx % 2 === 1 ? <strong key={idx} className="font-bold text-indigo-700">{chunk}</strong> : chunk
          )}
        </div>
      );
    }

    const { problemAnalysis, explanation, fixSteps, learningInsight, encouragement } = msg.structuredData;
    
    return (
      <div className="flex flex-col gap-2 text-xs">
        {problemAnalysis && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-2 rounded-lg">
            <div className="font-black flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Analysis</div>
            <div>{problemAnalysis}</div>
          </div>
        )}
        {explanation && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded-lg">
            <div className="font-black flex items-center gap-1"><Info className="w-3 h-3"/> Explanation</div>
            <div>{explanation}</div>
          </div>
        )}
        {fixSteps && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-lg">
            <div className="font-black flex items-center gap-1"><Wrench className="w-3 h-3"/> Fix Steps</div>
            <div className="whitespace-pre-line">{fixSteps}</div>
          </div>
        )}
        {learningInsight && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-lg">
            <div className="font-black flex items-center gap-1"><Lightbulb className="w-3 h-3"/> Tip</div>
            <div>{learningInsight}</div>
          </div>
        )}
        {encouragement && (
          <div className="text-slate-600 font-bold italic mt-1 text-center">
            "{encouragement}"
          </div>
        )}
      </div>
    );
  };

  // Helper Icon
  const Info = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const renderContent = (isPopup = false) => (
    <div className={`flex flex-col h-full overflow-hidden ${isPopup ? 'bg-white rounded-3xl border-4 border-slate-800 shadow-cartoon-xl' : 'glass border-2 border-slate-300 rounded-3xl'} p-4`}>
      {/* Sparky Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2.5 mb-2.5 shrink-0">
        <div className="flex items-center gap-2.5 group">
          {getSparkyAvatar()}
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-1 text-sm sm:text-base leading-none">
              Sparky 🤖 <span className="bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded-full border border-blue-300">Engineering AI</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold italic mt-1 max-w-[160px] truncate">
              "{SPARKLE_PHRASES[Math.floor(Date.now() / 60000) % SPARKLE_PHRASES.length]}"
            </p>
          </div>
        </div>
        
        {isPopup && (
          <button 
            onClick={() => setIsOpen(false)}
            className="bg-slate-100 hover:bg-slate-200 border-2 border-slate-700 w-8 h-8 rounded-xl font-black flex items-center justify-center text-slate-600 shadow-cartoon-hover active:translate-y-0.5 shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages Sandbox */}
      <div className="flex-1 overflow-y-auto mb-2 pr-1 space-y-2.5 min-h-[120px]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`
              max-w-[90%] rounded-2xl p-2.5 border-2
              ${msg.sender === 'user'
                ? 'bg-science-100 text-science-900 border-science-300 rounded-tr-none'
                : 'bg-white text-slate-800 border-slate-200 rounded-tl-none shadow-sm'
              }
            `}>
              {renderMessageContent(msg)}
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5 px-1">
              {msg.sender === 'user' ? 'You' : 'Sparky'}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold px-2 animate-pulse">
            <Sparkles className="w-3 h-3 text-indigo-500 animate-spin" /> Sparky is analyzing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions buttons */}
      <div className="flex flex-wrap gap-1 mb-2 border-t border-slate-100 pt-2 shrink-0">
        {getQuickQuestions().map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 font-bold text-slate-600 transition-all hover:scale-102 flex items-center gap-1 active:scale-98"
          >
            <HelpCircle className="w-2.5 h-2.5 text-slate-400" />
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex items-center gap-1.5 border-2 border-slate-300 bg-white rounded-xl p-0.5 shadow-sm focus-within:border-science-400 transition-colors shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Sparky for help..."
          className="flex-1 px-2 py-1 text-xs text-slate-700 focus:outline-none placeholder-slate-400 font-medium"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-science-400 hover:bg-science-500 text-white rounded-lg p-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );

  if (floating) {
    return (
      <>
        {/* Trigger Bubble */}
        {!isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-br from-indigo-400 to-blue-400 border-4 border-slate-800 p-3.5 rounded-full shadow-cartoon hover:scale-105 active:scale-95 transition-all cursor-pointer group animate-bounce"
            title="Ask Sparky the Engineering Assistant! ⚙️"
          >
            <span className="text-3xl select-none">🤖</span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-white font-black text-xs uppercase tracking-wider leading-none">
              Sparky Engine ⚙️
            </span>
            {/* Pulsing indicator */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-100"></span>
            </span>
          </div>
        )}

        {/* Floating Chat Container */}
        {isOpen && (
          <div className="fixed bottom-6 right-6 w-[310px] sm:w-[350px] h-[500px] max-h-[80vh] z-50 transition-all select-none">
            {renderContent(true)}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="h-[460px] max-h-[500px]">
      {renderContent(false)}
    </div>
  );
}
