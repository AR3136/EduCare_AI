import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy, BookOpen, Star, HelpCircle, GraduationCap, ChevronRight } from 'lucide-react';
import { CartoonButton, CartoonCard } from './Reusables';
import { API_BASE } from '../config';
import { eventBus } from '../shared/eventBus';

const MENTOR_PHRASES = [
  "Let's play with numbers! 🔢",
  "Think like a mathematician! 📐",
  "Ready to solve some puzzles? 🧩",
  "Math is your superpower! ⚡"
];

export default function MathMentorPanel({
  floating = false,
  studentId = 'student_123',
  grade = 'KG'
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial welcome message
  useEffect(() => {
    let welcomeText = `Hi there! I'm **MathMentor AI**, your personal mathematics coach! 📊🤖 `;
    if (grade === 'KG') {
      welcomeText += `Let's count shapes, play with numbers 1 to 50, and learn simple adding. What would you like to explore today?`;
    } else if (grade === 'Grade 1') {
      welcomeText += `Ready to count up to 100, solve addition and subtraction, or work out a word story? Ask me anything!`;
    } else if (grade === 'Grade 2') {
      welcomeText += `Let's practice multiplication/division basics or learn how to read analog clocks! What is your mission today?`;
    } else if (grade === 'Grade 3') {
      welcomeText += `Ready to master multiplication tables, learn fraction parts, or measure lengths and weights? Let's count!`;
    } else {
      welcomeText += `We can solve decimal sums, identify geometry lines/angles, or solve logic word puzzles. Ready to train?`;
    }

    setMessages([
      {
        id: 1,
        sender: 'mentor',
        text: welcomeText,
        isStructured: false,
        timestamp: new Date()
      }
    ]);

    // Emit event
    eventBus.publish('MATH_SESSION_STARTED', { studentId, grade, mode: 'chat' });
  }, [grade]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Listen to open panel events
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('educare_open_math_mentor', handleOpen);
    return () => window.removeEventListener('educare_open_math_mentor', handleOpen);
  }, []);

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

    try {
      const response = await fetch(`${API_BASE}/math/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          message: queryText,
          grade
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Add AI message
        const replyMsg = {
          id: Date.now() + 1,
          sender: 'mentor',
          text: data.reply,
          isStructured: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, replyMsg]);
      } else {
        throw new Error("Tutor connection offline");
      }
    } catch (err) {
      console.warn("MathMentor AI offline. Mocking response.");
      // Local fallback reply
      const replyMsg = {
        id: Date.now() + 1,
        sender: 'mentor',
        text: {
          explanation: `Let's solve your query: "${queryText}". I can explain number concepts or help you solve arithmetic.`,
          stepByStep: "1. Focus on the numbers in the question.\n2. Apply addition, subtraction, or shapes rules.\n3. Verify your calculation.",
          hint: "Think about counting on your fingers or drawing dots!",
          finalAnswer: "Let's work it out together!",
          encouragement: "You have a great math brain! 🌟"
        },
        isStructured: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, replyMsg]);
    } finally {
      setLoading(false);
    }
  };

  const getQuickQuestions = () => {
    if (grade === 'KG') return ["What is a circle? 🔴", "Let's count! 🍎", "What is 2 + 3?"];
    if (grade === 'Grade 1') return ["What is addition? ➕", "Solve cookie story 🍪", "Subtract 10 from 25"];
    if (grade === 'Grade 2') return ["Show multiplication ✖️", "Read a clock ⏰", "What is division? ➗"];
    if (grade === 'Grade 3') return ["Explain fractions 🍕", "Table of 6", "Meters to centimeters 📏"];
    return ["Add decimals 💵", "What is a polygon? 📐", "Logic puzzle help"];
  };

  const getMentorAvatar = () => (
    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center border-2 border-slate-800 shadow-cartoon shrink-0">
      <span className="text-lg">🧮</span>
    </div>
  );

  const renderStructuredReply = (textObj) => {
    const { explanation, stepByStep, hint, finalAnswer, encouragement } = textObj;
    return (
      <div className="space-y-3 text-xs leading-relaxed font-semibold text-slate-700 text-left">
        {explanation && (
          <div className="bg-purple-50 border border-purple-200 text-purple-800 p-2.5 rounded-2xl">
            <div className="font-black flex items-center gap-1.5 mb-0.5 text-purple-900 uppercase tracking-wide text-[9px]">
              <GraduationCap className="w-3.5 h-3.5" /> Mentor Lesson
            </div>
            <div>{explanation}</div>
          </div>
        )}
        {stepByStep && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-2.5 rounded-2xl">
            <div className="font-black flex items-center gap-1.5 mb-0.5 text-indigo-900 uppercase tracking-wide text-[9px]">
              <BookOpen className="w-3.5 h-3.5" /> Step-by-Step
            </div>
            <div className="whitespace-pre-line">{stepByStep}</div>
          </div>
        )}
        {hint && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-2xl">
            <div className="font-black flex items-center gap-1.5 mb-0.5 text-amber-900 uppercase tracking-wide text-[9px]">
              <HelpCircle className="w-3.5 h-3.5" /> Clue
            </div>
            <div>{hint}</div>
          </div>
        )}
        {finalAnswer && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-2xl font-black">
            <span className="text-[9px] uppercase tracking-wide text-emerald-950 block mb-0.5">Final Solution:</span>
            {finalAnswer}
          </div>
        )}
        {encouragement && (
          <div className="text-slate-500 font-extrabold italic mt-1.5 text-center text-[10px]">
            "{encouragement}"
          </div>
        )}
      </div>
    );
  };

  const renderMessageContent = (msg) => {
    if (msg.isStructured && typeof msg.text === 'object') {
      return renderStructuredReply(msg.text);
    }
    // Handle string welcome message with bold markdown
    const parts = msg.text.split('**');
    return (
      <span className="text-xs font-semibold leading-relaxed">
        {parts.map((p, idx) => idx % 2 === 1 ? <strong key={idx} className="font-black text-purple-700">{p}</strong> : p)}
      </span>
    );
  };

  const renderContent = (isPopup = false) => (
    <div className={`flex flex-col h-full overflow-hidden ${isPopup ? 'bg-white rounded-3xl border-4 border-slate-800 shadow-cartoon-xl' : 'glass border-2 border-slate-350 rounded-3xl'} p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2.5 mb-2.5 shrink-0">
        <div className="flex items-center gap-2.5">
          {getMentorAvatar()}
          <div>
            <h3 className="font-black text-slate-800 flex items-center gap-1 text-sm sm:text-base leading-none">
              MathMentor AI 🤖 <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded-full border border-purple-300">Math Engine</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1 max-w-[160px] truncate">
              {MENTOR_PHRASES[Math.floor(Date.now() / 60000) % MENTOR_PHRASES.length]}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-2 pr-1 space-y-2.5 min-h-[120px]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`
              max-w-[90%] rounded-2xl p-3 border-2
              ${msg.sender === 'user'
                ? 'bg-purple-550/10 text-purple-900 border-purple-300 rounded-tr-none'
                : 'bg-white text-slate-850 border-slate-200 rounded-tl-none shadow-sm'
              }
            `}>
              {renderMessageContent(msg)}
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-bold">
              {msg.sender === 'user' ? 'You' : 'MathMentor'}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold px-2 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin" /> MathMentor is calculating...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-1 mb-2 border-t border-slate-100 pt-2 shrink-0">
        {getQuickQuestions().map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-[9px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 font-extrabold text-slate-600 transition-all hover:scale-102 flex items-center gap-1 active:scale-98"
          >
            <HelpCircle className="w-2.5 h-2.5 text-slate-400" />
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex items-center gap-1.5 border-2 border-slate-350 bg-white rounded-xl p-0.5 shadow-sm focus-within:border-purple-400 transition-colors shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask MathMentor a question..."
          className="flex-1 px-2 py-1 text-xs text-slate-700 focus:outline-none placeholder-slate-400 font-bold"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1 text-xs font-black transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );

  if (!floating) {
    return renderContent(false);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen ? (
        <div className="w-[340px] sm:w-[380px] h-[480px] mb-3 animate-fade-in shadow-2xl">
          {renderContent(true)}
        </div>
      ) : null}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 border-4 border-slate-800 rounded-full flex items-center justify-center shadow-cartoon active:translate-y-0.5 hover:scale-105 transition-all text-2xl"
        title="Chat with MathMentor AI! 📊"
      >
        🧮
      </button>
    </div>
  );
}
