import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, HelpCircle, AlertCircle } from 'lucide-react';
import { CartoonButton } from './Reusables';
import { API_BASE } from '../config';

const SPARKLE_PHRASES = [
  "Wow! Let's explore together!",
  "Electricity is like a flowing river of tiny stars!",
  "Make sure all your puzzle pieces are connected!",
  "Don't worry, even scientists make mistakes. Let's try again!",
  "You're doing super! Ask me anything!",
];

export default function AITutorPanel({ 
  grade = 'KG', 
  context = 'dashboard', // dashboard, simulator, lesson-1, etc.
  currentCircuit = null, // details of the currently built circuit
  onUseHint = null, // callback for hints
  floating = false
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tutorMood, setTutorMood] = useState('happy'); // happy, thinking, excited, puzzled
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Set initial welcome message depending on context and grade
  useEffect(() => {
    let welcomeText = `Hi there! I'm **Sparky ** your AI Science Buddy! ⚡ `;
    if (context === 'dashboard') {
      welcomeText += `Pick a grade or click **Start Circuit Simulator** to begin building! What would you like to explore first?`;
    } else if (context.startsWith('lesson')) {
      welcomeText += `Ready for today's mission? Let's read the instructions and construct a circuit to complete the challenge! Click "Give me a hint" if you get stuck.`;
    } else {
      welcomeText += `Welcome to the Sandbox! Drag components onto the grid, wire them up, and toggle the switch. Ask me what happens when you change parts!`;
    }

    setMessages([
      {
        id: 1,
        sender: 'sparky',
        text: welcomeText,
        timestamp: new Date()
      }
    ]);
  }, [context, grade]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTutorMood('thinking');

    try {
      // Hit backend API
      const response = await fetch(`${API_BASE}/api/ai/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          grade,
          context,
          circuit: currentCircuit
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'sparky',
          text: data.reply,
          timestamp: new Date()
        }]);
        setTutorMood(data.mood || 'happy');
      } else {
        throw new Error('Server offline');
      }
    } catch (err) {
      // Fallback local engine for offline testing
      setTimeout(() => {
        const reply = getFallbackReply(queryText, grade, context, currentCircuit);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'sparky',
          text: reply,
          timestamp: new Date()
        }]);
        setTutorMood('excited');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // Predefined quick questions for kids
  const getQuickQuestions = () => {
    if (context.startsWith('lesson')) {
      return ["How do I solve this?", "What is a closed circuit?", "Show me a hint!"];
    }
    return ["What is electricity?", "What does a resistor do?", "Tell me a science joke!"];
  };

  const getSparkyAvatar = () => {
    switch (tutorMood) {
      case 'thinking':
        return (
          <div className="relative w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-full flex items-center justify-center border-4 border-slate-700 animate-pulse shadow-cartoon shrink-0">
            <span className="text-2xl">🤔</span>
          </div>
        );
      case 'excited':
        return (
          <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-300 to-amber-300 rounded-full flex items-center justify-center border-4 border-slate-700 animate-bounce shadow-cartoon shrink-0">
            <span className="text-2xl">🤩</span>
          </div>
        );
      case 'puzzled':
        return (
          <div className="relative w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-full flex items-center justify-center border-4 border-slate-700 shadow-cartoon shrink-0">
            <span className="text-2xl">😮</span>
          </div>
        );
      default: // happy
        return (
          <div className="relative w-12 h-12 bg-gradient-to-br from-amber-300 to-yellow-200 rounded-full flex items-center justify-center border-4 border-slate-700 shadow-cartoon shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-2xl">💡</span>
          </div>
        );
    }
  };

  const renderContent = (isPopup = false) => (
    <div className={`flex flex-col h-full overflow-hidden ${isPopup ? 'bg-white rounded-3xl border-4 border-slate-800 shadow-cartoon-xl' : 'glass border-2 border-slate-300 rounded-3xl'} p-4`}>
      {/* Sparky Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2.5 mb-2.5 shrink-0">
        <div className="flex items-center gap-2.5 group">
          {getSparkyAvatar()}
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-1 text-sm sm:text-base leading-none">
              Sparky 🤖 <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-full border border-amber-300">Tutor</span>
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
              max-w-[85%] rounded-2xl p-2.5 border-2 text-xs leading-relaxed
              ${msg.sender === 'user'
                ? 'bg-science-100 text-science-900 border-science-300 rounded-tr-none'
                : 'bg-white text-slate-800 border-slate-200 rounded-tl-none shadow-sm'
              }
            `}>
              {msg.text.split('**').map((chunk, idx) => 
                idx % 2 === 1 ? <strong key={idx} className="font-bold text-amber-700">{chunk}</strong> : chunk
              )}
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5 px-1">
              {msg.sender === 'user' ? 'You' : 'Sparky'}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold px-2 animate-pulse">
            <Sparkles className="w-3 h-3 text-amber-500 animate-spin" /> Sparky is thinking...
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
          placeholder="Ask Sparky a question..."
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
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-br from-amber-400 to-yellow-300 border-4 border-slate-800 p-3.5 rounded-full shadow-cartoon hover:scale-105 active:scale-95 transition-all cursor-pointer group animate-bounce"
            title="Click to chat with Sparky! ⚡"
          >
            <span className="text-3xl select-none">💡</span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-slate-800 font-black text-xs uppercase tracking-wider leading-none">
              Sparky Tutor! 🤖
            </span>
            {/* Pulsing indicator */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500"></span>
            </span>
          </div>
        )}

        {/* Floating Chat Container */}
        {isOpen && (
          <div className="fixed bottom-6 right-6 w-[310px] sm:w-[350px] h-[440px] max-h-[75vh] z-50 transition-all select-none">
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

// Local Fallback Replies for Kids
function getFallbackReply(query, grade, context, circuit) {
  const q = query.toLowerCase();

  // Jokes
  if (q.includes('joke') || q.includes('funny')) {
    const jokes = [
      "Why did the lightbulb fail the test? Because it wasn't very bright! 😂",
      "What did the wire say to the battery? 'I get a real charge out of you!' ⚡",
      "Why did the electron look sad? Because it was feeling negative! ⚛️",
      "What is a scientist's favorite dog? A lab-rador! 🐕",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // General electricity questions
  if (q.includes('what is electricity') || q.includes('how does electricity work')) {
    if (grade === 'KG' || grade === 'Grade 1') {
      return "Electricity is like a **magic river** of tiny, invisible stars called **electrons**! When they flow through wires in a loop, they light up bulbs and spin toys! 🌟";
    }
    return "Electricity is the flow of tiny charged particles called **electrons**! They need a complete, unbroken loop called a **closed circuit** to travel from a power source (like a battery) to a user (like an LED bulb or motor).";
  }

  // Conductors and insulators
  if (q.includes('conductor') || q.includes('insulator') || q.includes('metal') || q.includes('wood')) {
    return "A **conductor** (like copper, gold, or key) is a friendly helper that lets electrons pass through easily! An **insulator** (like wood, plastic, or rubber) is a blocker that stops electrons from flowing. For Grade 1, try testing different objects in our loop!";
  }

  // Switch questions
  if (q.includes('switch')) {
    return "A **switch** is like a drawbridge for our electron road! When the switch is **CLOSED** (bridge down), the electrons cross and the light turns on. When it's **OPEN** (bridge up), the road is broken, and everything turns off! 🌉";
  }

  // Series vs Parallel
  if (q.includes('series') || q.includes('parallel')) {
    return "In a **Series circuit**, components are lined up in a single line like passengers on a bus. If one steps off (unscrews), the bus stops! In a **Parallel circuit**, components have their own separate roads, so they get full power and stay bright even if one is broken! 💡💡";
  }

  // Resistor questions
  if (q.includes('resistor') || q.includes('resistance')) {
    return "A **resistor** acts like a bottleneck or speed bump on the electron road! It slows down the current so delicate things (like LEDs or buzzers) don't get too hot or burn out. It's like a shield! 🛡️";
  }

  // Lesson hints
  if (q.includes('hint') || q.includes('solve') || q.includes('how do i')) {
    if (context === 'lesson-kg') {
      return "Click the glowing wire end on the right, then click the bulb connector to create a complete loop. You got this!";
    }
    if (context === 'lesson-g1') {
      return "Try dragging the **metal key** or the **copper coin** into the blank slot. Metal objects are excellent **conductors** of electricity!";
    }
    if (context === 'lesson-g2') {
      return "Drag a **Switch** from the inventory and drop it into the gap in the wire. Then click on the switch to close it and let the current flow!";
    }
    if (context === 'lesson-g3') {
      return "Build two circuits: one where bulbs are on the *same line* (Series) and one where they are on *separate loops* (Parallel). Notice how the Parallel bulbs shine twice as bright!";
    }
    if (context === 'lesson-g4') {
      return "Connect the Battery, Switch, Resistor, and Buzzer in a loop. Click the switch to close it, and adjust the slider on the Resistor to see how it dims or silences the buzzer!";
    }
    return "Make sure you have a **Battery** to provide power, **wires** connecting all parts, and that the path loops all the way back from the battery (+) to (-). Also make sure any switches are closed!";
  }

  // Default response
  return `That is a super question! In **${grade}**, we learn that circuits need a complete path to work. Try checking if your wires are connected from one side of the battery all the way to the other! Let me know if you need another hint.`;
}
