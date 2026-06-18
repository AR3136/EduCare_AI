import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, HelpCircle, Activity, Heart, Flame } from 'lucide-react';
import { CartoonButton } from './Reusables';
import { API_BASE } from '../config';
import { eventBus } from '../shared/eventBus';

const MOTIVATIONAL_PHRASES = [
  "Let's get moving! 🚀",
  "You are doing awesome! 🌟",
  "Stretch high to the sky! 🙆",
  "Ready to earn some stars? ⭐",
  "Hydration is key! Drink some water! 💧",
];

// FUTURE INTEGRATION TAGS references:
// FITFRIEND_AI
// MAIN_INSTRUCTOR_AI
// ENGLISH_MODULE
// MATH_MODULE
// STEM_MODULE
// LOGIC_MODULE
// MOOD_ENGINE
// REWARD_ENGINE
// PARENT_DASHBOARD
// TEACHER_DASHBOARD

export default function FitFriendPanel({ 
  grade = 'KG', 
  studentId = 'student_123',
  onExit = null,
  floating = false
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [coachMood, setCoachMood] = useState('happy'); // happy, active, thinking, tired
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial welcome message
  useEffect(() => {
    let welcomeText = `Hey there, champion! I'm **FitFriend AI**, your personal physical activity coach! 🏃‍♂️💪 `;
    welcomeText += `Whenever you've been sitting too long, let me know! We can stretch, jump, do yoga, or play Simon Says. What kind of movement break do you want to do today?`;

    setMessages([
      {
        id: 1,
        sender: 'fitfriend',
        text: welcomeText,
        timestamp: new Date()
      }
    ]);
  }, [grade]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    // Add student message
    const studentMsg = {
      id: Date.now(),
      sender: 'student',
      text: queryText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, studentMsg]);
    setInput('');
    setLoading(true);
    setCoachMood('thinking');

    try {
      const response = await fetch(`${API_BASE}/activity/fitfriend/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          message: queryText,
          grade,
          moodScore: 80, // Snapshot mood
          attentionScore: 70
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'fitfriend',
          text: data.reply,
          timestamp: new Date(),
          activity: data.recommendedActivity,
          sessionId: data.sessionId,
          redirectToTutor: data.redirectToTutor
        }]);
        setCoachMood(data.redirectToTutor ? 'tired' : 'active');
      } else {
        throw new Error('API offline');
      }
    } catch (err) {
      // Offline fallback
      setTimeout(() => {
        const isAcademic = checkForAcademic(queryText);
        if (isAcademic) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'fitfriend',
            text: "Hi there! I'm **FitFriend AI**, your active movement coach! 🏃‍♂️ I only teach active exercise, stretching, and healthy habits. For help with math, reading, science, or circuits, please chat with **Sparky, the Main Instructor AI**! 🤖",
            timestamp: new Date(),
            redirectToTutor: true
          }]);
          setCoachMood('tired');
        } else {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'fitfriend',
            text: "Offline mode: Let's do a quick stretch challenge! Stretch your arms way high to the sky for 10 seconds! 🙆‍♀️",
            timestamp: new Date()
          }]);
          setCoachMood('happy');
        }
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const checkForAcademic = (msg) => {
    const q = msg.toLowerCase();
    const keywords = ['math', 'addition', 'circuit', 'led', 'resistor', 'spell', 'grammar', 'english', 'reading', 'equation', 'solve'];
    return keywords.some(k => q.includes(k));
  };

  const handleLaunchBreak = (activity, sessionId) => {
    console.log('🚀 [FitFriendPanel] Launching break session:', sessionId);
    // Publish event so App.jsx handles routing
    eventBus.publish('PHYSICAL_ACTIVITY_ASSIGNMENT', {
      studentId,
      sessionId,
      activityId: activity.activityId,
      sourceModule: 'FITFRIEND_AI',
      activityDetail: activity
    });
    setIsOpen(false);
  };

  const handleTriggerSparky = () => {
    console.log('🤖 [FitFriendPanel] Redirect requested for Sparky Tutor.');
    // Trigger custom window event that App.jsx can capture
    const event = new CustomEvent('educare_open_sparky');
    window.dispatchEvent(event);
    setIsOpen(false);
  };

  const getQuickPrompts = () => {
    return [
      "Let's Stretch! 🧘",
      "Give me a break! 🏃‍♂️",
      "Tell me a healthy habit! 🍎"
    ];
  };

  const getCoachAvatar = () => {
    switch (coachMood) {
      case 'thinking':
        return (
          <div className="relative w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-300 rounded-full flex items-center justify-center border-4 border-slate-700 animate-pulse shadow-cartoon shrink-0">
            <span className="text-2xl animate-spin">🌀</span>
          </div>
        );
      case 'active':
        return (
          <div className="relative w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center border-4 border-slate-700 animate-bounce shadow-cartoon shrink-0">
            <span className="text-2xl">💪</span>
          </div>
        );
      case 'tired':
        return (
          <div className="relative w-12 h-12 bg-gradient-to-br from-red-400 to-orange-300 rounded-full flex items-center justify-center border-4 border-slate-700 shadow-cartoon shrink-0">
            <span className="text-2xl">😮</span>
          </div>
        );
      default:
        return (
          <div className="relative w-12 h-12 bg-gradient-to-br from-orange-300 to-yellow-200 rounded-full flex items-center justify-center border-4 border-slate-700 shadow-cartoon shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-2xl">🏃‍♂️</span>
          </div>
        );
    }
  };

  const renderContent = (isPopup = false) => (
    <div className={`flex flex-col h-full overflow-hidden ${isPopup ? 'bg-white rounded-3xl border-4 border-slate-800 shadow-cartoon-xl' : 'glass border-2 border-slate-300 rounded-3xl'} p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2.5 mb-2.5 shrink-0">
        <div className="flex items-center gap-2.5 group">
          {getCoachAvatar()}
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-1 text-sm sm:text-base leading-none">
              FitFriend AI 🏃‍♂️ <span className="bg-orange-100 text-orange-800 text-[9px] px-1.5 py-0.5 rounded-full border border-orange-300">Coach</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold italic mt-1 max-w-[160px] truncate">
              "{MOTIVATIONAL_PHRASES[Math.floor(Date.now() / 60000) % MOTIVATIONAL_PHRASES.length]}"
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

      {/* Message Sandbox */}
      <div className="flex-1 overflow-y-auto mb-2 pr-1 space-y-2.5 min-h-[120px]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
          >
            <div className={`
              max-w-[85%] rounded-2xl p-2.5 border-2 text-xs leading-relaxed
              ${msg.sender === 'student'
                ? 'bg-orange-100 text-orange-950 border-orange-300 rounded-tr-none'
                : 'bg-white text-slate-800 border-slate-200 rounded-tl-none shadow-sm'
              }
            `}>
              {msg.text.split('**').map((chunk, idx) => 
                idx % 2 === 1 ? <strong key={idx} className="font-bold text-orange-700">{chunk}</strong> : chunk
              )}

              {/* Dynamic Action Trigger Card */}
              {msg.activity && msg.sessionId && (
                <div className="mt-2.5 border border-slate-200 rounded-xl p-2 bg-slate-50 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl">{msg.activity.emoji}</span>
                    <span className="text-[10px] font-black text-slate-700">{msg.activity.title}</span>
                  </div>
                  <button 
                    onClick={() => handleLaunchBreak(msg.activity, msg.sessionId)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-lg border border-slate-700 shadow-cartoon transition-transform hover:scale-102 active:translate-y-0.5 shrink-0"
                  >
                    Go! ▶
                  </button>
                </div>
              )}

              {/* Redirection Link to Sparky */}
              {msg.redirectToTutor && (
                <button
                  type="button"
                  onClick={handleTriggerSparky}
                  className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black py-1.5 rounded-lg border-b-4 border-indigo-800 shadow-sm transition-transform hover:scale-102"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Ask Sparky Tutor 🤖
                </button>
              )}
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5 px-1">
              {msg.sender === 'student' ? 'You' : 'FitFriend'}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold px-2 animate-pulse">
            <Flame className="w-3 h-3 text-orange-500 animate-spin" /> FitFriend is warming up...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions prompts */}
      <div className="flex flex-wrap gap-1 mb-2 border-t border-slate-100 pt-2 shrink-0">
        {getQuickPrompts().map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 font-bold text-slate-600 transition-all hover:scale-102 flex items-center gap-1 active:scale-98"
          >
            <HelpCircle className="w-2.5 h-2.5 text-orange-400" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Form Input */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex items-center gap-1.5 border-2 border-slate-300 bg-white rounded-xl p-0.5 shadow-sm focus-within:border-orange-400 transition-colors shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Stretch? Simon Says? Exercise? Ask me!"
          className="flex-1 px-2 py-1 text-xs text-slate-700 focus:outline-none placeholder-slate-400 font-medium"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );

  if (floating) {
    return (
      <>
        {/* Trigger Bubble in Bottom-Left */}
        {!isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-gradient-to-br from-orange-400 to-amber-300 border-4 border-slate-800 p-3.5 rounded-full shadow-cartoon hover:scale-105 active:scale-95 transition-all cursor-pointer group animate-bounce-slow"
            title="Click to chat with FitFriend AI! 🏃‍♂️"
          >
            <span className="text-3xl select-none">🏃‍♂️</span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-slate-800 font-black text-xs uppercase tracking-wider leading-none">
              FitFriend AI! 💪
            </span>
            {/* Pulsing indicator */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500"></span>
            </span>
          </div>
        )}

        {/* Floating Chat Container */}
        {isOpen && (
          <div className="fixed bottom-6 left-6 w-[310px] sm:w-[350px] h-[440px] max-h-[75vh] z-50 transition-all select-none">
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
