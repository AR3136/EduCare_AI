import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowLeft, Volume2, VolumeX, Settings, X, Play, 
  Smile, Award, Zap, HelpCircle, Activity, Heart, Flame, RefreshCw 
} from 'lucide-react';
import SoundEngine from './shared/soundEngine';
import { eventBus } from './shared/eventBus';

// Predefined lists of spelling words
const SPELL_WORDS_YOUNG = [
  { word: 'CAT', icon: '🐱', hint: 'This pet says Meow!' },
  { word: 'SUN', icon: '☀️', hint: 'It shines warm in the sky.' },
  { word: 'TOY', icon: '🧸', hint: 'You love to play with this!' }
];

const SPELL_WORDS_MID = [
  { word: 'FROG', icon: '🐸', hint: 'It hops around the pond!' },
  { word: 'STAR', icon: '⭐', hint: 'It shines bright in the night.' },
  { word: 'BIRD', icon: '🐦', hint: 'It sings sweet songs in the sky.' }
];

const SPELL_WORDS_OLD = [
  { word: 'PLANET', icon: '🪐', hint: 'A large round object in space.' },
  { word: 'ROCKET', icon: '🚀', hint: 'It flies high into the stars!' },
  { word: 'ROBOT', icon: '🤖', hint: 'A friendly metallic machine.' }
];

export default function CompanionModule({ 
  studentId = 'student_123',
  onProgressUpdate = null,
  onExit = null
}) {
  const navigate = useNavigate();
  
  // Companion States
  const [childState, setChildState] = useState(() => {
    const savedGrade = localStorage.getItem(`educare_grade_${studentId}`);
    const savedAge = localStorage.getItem(`educare_age_${studentId}`);
    
    let displayGrade = null;
    if (savedGrade === 'KG') displayGrade = 'Kindergarten';
    else if (savedGrade === 'Grade 1') displayGrade = '1st Grade';
    else if (savedGrade === 'Grade 2') displayGrade = '2nd Grade';
    else if (savedGrade === 'Grade 3') displayGrade = '3rd Grade';
    else if (savedGrade === 'Grade 4') displayGrade = '4th Grade';

    return {
      mood: 'happy',
      energy: 70,
      confidence: 65,
      attentionSpan: 80,
      learningReadiness: 72,
      interests: [],
      moodHistory: ['happy'],
      conversationStep: (savedGrade && savedAge) ? 'normal_chat' : 'greeting',
      conversationContext: null,
      age: savedAge ? parseInt(savedAge) : null,
      grade: displayGrade,
    };
  });

  // Listen for grade changes from other labs/dashboard
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('GRADE_CHANGED', (payload) => {
      if (payload && payload.grade) {
        let displayGrade = 'Kindergarten';
        if (payload.grade === 'KG') displayGrade = 'Kindergarten';
        else if (payload.grade === 'Grade 1') displayGrade = '1st Grade';
        else if (payload.grade === 'Grade 2') displayGrade = '2nd Grade';
        else if (payload.grade === 'Grade 3') displayGrade = '3rd Grade';
        else if (payload.grade === 'Grade 4') displayGrade = '4th Grade';

        setChildState(prev => ({
          ...prev,
          grade: displayGrade
        }));
      }
    });
    return unsubscribe;
  }, []);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [talking, setTalking] = useState(false);
  const [educatorDashboardOpen, setEducatorDashboardOpen] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [quickOptions, setQuickOptions] = useState([]);
  const [activeOverlay, setActiveOverlay] = useState(null); // stem, english, game, physical, relaxation, break
  const [pendingRedirectModule, setPendingRedirectModule] = useState(null);
  
  // Refs
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastInputTimeRef = useRef(Date.now());
  const synthRef = useRef(window.speechSynthesis);

  // Sound Synth Voice
  const [buddyVoice, setBuddyVoice] = useState(null);

  // Initialize Speech synthesis voice
  useEffect(() => {
    const loadVoices = () => {
      if (!synthRef.current) return;
      const voices = synthRef.current.getVoices();
      const voice = voices.find(v => v.lang.includes('en') && 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Samantha'))
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      setBuddyVoice(voice);
    };

    loadVoices();
    if (synthRef.current) {
      synthRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Start Dialogue
  useEffect(() => {
    const savedGrade = localStorage.getItem(`educare_grade_${studentId}`);
    const savedAge = localStorage.getItem(`educare_age_${studentId}`);

    if (savedGrade && savedAge) {
      const timer = setTimeout(() => {
        postCompanionMessage("Welcome back, friend! I'm **Buddy**, and I'm so happy to see you again! 🌟 What would you like to explore today?");
        setQuickOptions(["Tell me a joke! 🤪", "Let's play a game! 🎮", "Build circuits! ⚡", "How I Feel 🎭"]);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        postCompanionMessage("Hey friend! I'm **Buddy**, and I'm so excited to hang out and play with you today! 🌟 Before we start, can you tell me how old you are?");
        setChildState(prev => ({ ...prev, conversationStep: 'ask_age' }));
        setQuickOptions(["5 years old", "6 years old", "7 years old", "8 years old", "9 years old"]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [studentId]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Log activity helper
  const logActivity = (action, details) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActivityLog(prev => [{ action, details, time }, ...prev]);
  };

  // Speaks text to Speech
  const speak = (text) => {
    if (!ttsEnabled || !synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (buddyVoice) {
      utterance.voice = buddyVoice;
    }
    utterance.pitch = 1.35;
    utterance.rate = 0.95;

    utterance.onstart = () => setTalking(true);
    utterance.onend = () => setTalking(false);
    utterance.onerror = () => setTalking(false);

    synthRef.current.speak(utterance);
  };

  // Add message helper
  const postCompanionMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'companion', text, id: Date.now() }]);
    speak(text);
  };

  // Handle user inputs
  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: 'child', text, id: Date.now() + 1 }]);
    processResponse(text);
  };

  const processResponse = (input) => {
    const cleanInput = input.trim().toLowerCase();
    
    // Evaluate metrics shift first based on timings
    const responseSpeedMs = Date.now() - lastInputTimeRef.current;
    lastInputTimeRef.current = Date.now();

    let energyShift = 0;
    let attentionShift = 0;

    if (responseSpeedMs < 4000) {
      energyShift = 5;
    } else if (responseSpeedMs > 12000) {
      energyShift = -5;
      attentionShift = -5;
    }

    // Intercept energetic requests to redirect to the Physical Activity Lab
    const isEnergeticInput = cleanInput.includes('energetic') || 
                             cleanInput.includes('full of energy') || 
                             (cleanInput.includes('feel') && cleanInput.includes('active')) ||
                             cleanInput.includes('hyper') ||
                             cleanInput.includes('restless') ||
                             cleanInput.includes('feel active') ||
                             cleanInput.includes('very active');

    if (isEnergeticInput) {
      setChildState(prev => {
        const nextEnergy = 100;
        const nextRead = Math.round((nextEnergy + prev.confidence + prev.attentionSpan) / 3);
        logActivity('Mood Detected', 'Detected mood: ENERGETIC ⚡');
        return {
          ...prev,
          mood: 'happy',
          energy: nextEnergy,
          learningReadiness: nextRead
        };
      });
      postCompanionMessage("Wow, I can feel your amazing energy! ⚡ Let's head over to the Physical Activity Lab to move, jump, and stretch! 🏃‍♂️💨");
      setTimeout(() => {
        navigate('/physical-activity');
      }, 2500);
      return;
    }

    // Intercept literature/reading/chatting requests to redirect to the English AI Lab
    const isLiteratureInput = cleanInput.includes('literature') ||
                               cleanInput.includes('book') ||
                               cleanInput.includes('story') ||
                               cleanInput.includes('read') ||
                               cleanInput.includes('write') ||
                               cleanInput.includes('poem') ||
                               cleanInput.includes('poetry') ||
                               cleanInput.includes('grammar') ||
                               cleanInput.includes('spell') ||
                               cleanInput.includes('essay') ||
                               cleanInput.includes('alphabet') ||
                               cleanInput.includes('english') ||
                               cleanInput.includes('love reading') ||
                               cleanInput.includes('want to read') ||
                               cleanInput.includes('tell a story') ||
                               cleanInput.includes('tell me a story') ||
                               cleanInput.includes('write a story') ||
                               cleanInput.includes('learn words') ||
                               (cleanInput.length > 50 && (cleanInput.includes('talk') || cleanInput.includes('chat') || cleanInput.includes('discuss') || cleanInput.includes('friend')));

    if (isLiteratureInput) {
      setChildState(prev => {
        const nextAttn = Math.min(100, prev.attentionSpan + 10);
        const nextRead = Math.round((prev.energy + prev.confidence + nextAttn) / 3);
        logActivity('Mood Detected', 'Detected interest: LITERATURE/CHAT 📚');
        return {
          ...prev,
          mood: 'curious',
          attentionSpan: nextAttn,
          learningReadiness: nextRead
        };
      });
      postCompanionMessage("I love that you are interested in reading and stories! 📚 Let's visit Astra English AI Lab to read magical stories, learn grammar, and practice writing! 🚀✨");
      setTimeout(() => {
        navigate('/english-ai');
      }, 2500);
      return;
    }

    // Check if user is asking to change or telling their age (normal chat parsing)
    if (childState.conversationStep === 'normal_chat' && (cleanInput.includes("years old") || cleanInput.includes("i am ") && (cleanInput.includes("5") || cleanInput.includes("6") || cleanInput.includes("7") || cleanInput.includes("8") || cleanInput.includes("9")) || cleanInput.includes("my age is"))) {
      let ageMatch = cleanInput.match(/\d+/);
      let parsedAge = ageMatch ? parseInt(ageMatch[0]) : null;
      if (parsedAge && parsedAge >= 5 && parsedAge <= 9) {
        setChildState(prev => ({ ...prev, age: parsedAge }));
        localStorage.setItem(`educare_age_${studentId}`, parsedAge.toString());
        eventBus.publish('AGE_CHANGED', { age: parsedAge });
        logActivity('Age Updated', `Student age changed to ${parsedAge}`);
        postCompanionMessage(`Got it! I've updated your age to ${parsedAge} years old. All our games and spelling words will match that age! 🌟`);
        setQuickOptions(["Tell me a joke! 🤪", "Let's play a game! 🎮", "How I Feel 🎭"]);
        return;
      }
    }

    // Check if user is asking to change or telling their grade (normal chat parsing)
    if (childState.conversationStep === 'normal_chat' && (cleanInput.includes("grade") || cleanInput.includes("kindergarten"))) {
      let newGrade = null;
      let displayGrade = "";
      if (cleanInput.includes("kindergarten") || cleanInput.includes("kg")) {
        newGrade = "KG";
        displayGrade = "Kindergarten";
      } else if (cleanInput.includes("1st") || cleanInput.includes("first") || cleanInput.includes("one")) {
        newGrade = "Grade 1";
        displayGrade = "1st Grade";
      } else if (cleanInput.includes("2nd") || cleanInput.includes("second") || cleanInput.includes("two")) {
        newGrade = "Grade 2";
        displayGrade = "2nd Grade";
      } else if (cleanInput.includes("3rd") || cleanInput.includes("third") || cleanInput.includes("three")) {
        newGrade = "Grade 3";
        displayGrade = "3rd Grade";
      } else if (cleanInput.includes("4th") || cleanInput.includes("fourth") || cleanInput.includes("four")) {
        newGrade = "Grade 4";
        displayGrade = "4th Grade";
      }

      if (newGrade) {
        setChildState(prev => ({ ...prev, grade: displayGrade }));
        localStorage.setItem(`educare_grade_${studentId}`, newGrade);
        eventBus.publish('GRADE_CHANGED', { grade: newGrade });
        logActivity('Grade Updated', `Student grade changed to ${displayGrade} (${newGrade})`);
        postCompanionMessage(`Understood! I've set your grade to ${displayGrade}. Your lessons and science modules will adapt to ${displayGrade}! 🏫`);
        setQuickOptions(["Build circuits! ⚡", "Spelling words! 📚", "Tell me a joke! 🤪"]);
        return;
      }
    }

    // 0. Redirection confirmation checking
    if (pendingRedirectModule) {
      const positiveWords = ['yes', 'yeah', 'yep', 'yey', 'ok', 'sure', 'go', 'let\'s go', 'lets go', 'please', 'fine', 'ready', 'okay', 'yay', 'do it'];
      const negativeWords = ['no', 'nope', 'nah', 'not now', 'don\'t', 'dont', 'stop', 'chat', 'talk', 'later', 'skip', 'keep chatting'];
      
      const isPositive = positiveWords.some(word => cleanInput.includes(word));
      const isNegative = negativeWords.some(word => cleanInput.includes(word));

      if (isPositive) {
        const mod = pendingRedirectModule;
        setPendingRedirectModule(null);
        triggerOverlay(mod);
        return;
      } else if (isNegative) {
        setPendingRedirectModule(null);
        postCompanionMessage("No problem at all! We can just keep chatting. What would you like to talk about, friend?");
        setQuickOptions(["Tell me a joke! 🤪", "What's your favorite color? 🎨", "How I Feel 🎭", "I want to do wiggles! 🏃"]);
        return;
      }
    }

    // 0.2 Onboarding Age
    if (childState.conversationStep === 'ask_age') {
      let ageMatch = cleanInput.match(/\d+/);
      let parsedAge = ageMatch ? parseInt(ageMatch[0]) : null;
      if (!parsedAge) {
        if (cleanInput.includes("five")) parsedAge = 5;
        else if (cleanInput.includes("six")) parsedAge = 6;
        else if (cleanInput.includes("seven")) parsedAge = 7;
        else if (cleanInput.includes("eight")) parsedAge = 8;
        else if (cleanInput.includes("nine")) parsedAge = 9;
        else parsedAge = 6;
      }

      setChildState(prev => {
        const updated = {
          ...prev,
          age: parsedAge,
          conversationStep: 'ask_grade'
        };
        logActivity('Age Registered', `Student age set to ${parsedAge} years old`);
        
        // Write and Publish
        localStorage.setItem(`educare_age_${studentId}`, parsedAge.toString());
        eventBus.publish('AGE_CHANGED', { age: parsedAge });

        return updated;
      });

      postCompanionMessage(`Awesome! ${parsedAge} is a fantastic age! And what grade are you in at school? 🏫`);
      setQuickOptions(["Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade"]);
      return;
    }

    // Onboarding Grade
    if (childState.conversationStep === 'ask_grade') {
      const selectedGrade = input.trim();
      setChildState(prev => {
        const updated = {
          ...prev,
          grade: selectedGrade,
          conversationStep: 'ask_mood'
        };
        logActivity('Grade Registered', `Student grade set to ${selectedGrade}`);

        // Map grade code
        let mappedGrade = 'KG';
        if (selectedGrade.includes('Kindergarten')) mappedGrade = 'KG';
        else if (selectedGrade.includes('1st')) mappedGrade = 'Grade 1';
        else if (selectedGrade.includes('2nd')) mappedGrade = 'Grade 2';
        else if (selectedGrade.includes('3rd')) mappedGrade = 'Grade 3';
        else if (selectedGrade.includes('4th')) mappedGrade = 'Grade 4';

        // Write and Publish
        localStorage.setItem(`educare_grade_${studentId}`, mappedGrade);
        eventBus.publish('GRADE_CHANGED', { grade: mappedGrade });

        return updated;
      });

      postCompanionMessage("Super! Now we are all ready. How are you feeling right now, friend? Click an emoji to show me!");
      setQuickOptions(["😊 Happy", "🤔 Curious", "😴 Tired", "😤 Frustrated", "😢 Sad", "🤪 Silly"]);
      return;
    }

    // Onboarding Mood
    if (childState.conversationStep === 'ask_mood') {
      let matchedMood = null;
      let textResponse = "";
      let confidenceBoost = 0;
      let energyBoost = 0;
      let attentionBoost = 0;

      if (cleanInput.includes("😊") || cleanInput.includes("happy") || cleanInput.includes("great") || cleanInput.includes("good")) {
        matchedMood = 'happy';
        energyBoost = 15;
        confidenceBoost = 10;
        textResponse = "Yay! A happy face is the best! 😊 I'm so glad you're feeling good. What fun things should we explore today, buddy?";
      } 
      else if (cleanInput.includes("🤔") || cleanInput.includes("curious")) {
        matchedMood = 'curious';
        energyBoost = 10;
        confidenceBoost = 5;
        textResponse = "Awesome! A curious mind is ready for big adventures. 🤔 What kind of cool questions do you have today?";
      } 
      else if (cleanInput.includes("😴") || cleanInput.includes("tired") || cleanInput.includes("sleep") || cleanInput.includes("yawn")) {
        matchedMood = 'tired';
        energyBoost = -20;
        attentionBoost = -15;
        textResponse = "Yawn... I get it, friend. It's totally okay to feel a bit sleepy. 😴 We can just chat, or pop some bubbles. What sounds nice?";
      } 
      else if (cleanInput.includes("😤") || cleanInput.includes("frustrated") || cleanInput.includes("mad") || cleanInput.includes("hard")) {
        matchedMood = 'frustrated';
        confidenceBoost = -20;
        textResponse = "Phew, I hear you! Learning new things can be super tricky, and it's okay to feel frustrated. 😤 We are in this together, buddy!";
      } 
      else if (cleanInput.includes("😢") || cleanInput.includes("sad") || cleanInput.includes("upset")) {
        matchedMood = 'sad';
        confidenceBoost = -15;
        energyBoost = -10;
        textResponse = "Oh, I'm sending you a big warm buddy hug! 😢 It's okay to feel sad sometimes. I'm right here with you. What can I do to help, friend?";
      } 
      else if (cleanInput.includes("🤪") || cleanInput.includes("silly") || cleanInput.includes("playful")) {
        matchedMood = 'happy';
        energyBoost = 20;
        textResponse = "Woohoo! Being silly is the absolute best! 🤪 Let's hear a joke or do some fun wiggle movements!";
      }

      if (matchedMood) {
        setChildState(prev => {
          const nextEnergy = Math.max(10, Math.min(100, prev.energy + energyBoost + energyShift));
          const nextConf = Math.max(10, Math.min(100, prev.confidence + confidenceBoost));
          const nextAttn = Math.max(10, Math.min(100, prev.attentionSpan + attentionBoost + attentionShift));
          const nextReadiness = Math.round((nextEnergy + nextConf + nextAttn) / 3);
          
          logActivity('Mood Check-in', `Selected mood: ${matchedMood}`);
          
          return {
            ...prev,
            mood: matchedMood,
            moodHistory: [...prev.moodHistory, matchedMood],
            energy: nextEnergy,
            confidence: nextConf,
            attentionSpan: nextAttn,
            learningReadiness: nextReadiness,
            conversationStep: 'normal_chat'
          };
        });

        postCompanionMessage(textResponse);
        setQuickOptionsByMood(matchedMood);
        return;
      }
    }

    // Check Contexts
    if (childState.conversationContext) {
      const ctx = childState.conversationContext;
      
      setChildState(prev => ({ ...prev, conversationContext: null }));

      if (ctx === 'favorite_color') {
        let reply = "";
        if (cleanInput.includes("blue")) {
          reply = "Blue is a beautiful color! It's like the quiet sky and the deep ocean. 🌊 I love it too!";
        } else if (cleanInput.includes("red")) {
          reply = "Red is so bright and full of energy, like a superhero's cape! 🔴 It's so cool!";
        } else if (cleanInput.includes("green")) {
          reply = "Green is awesome! It reminds me of climbing trees in a secret forest or a cute little frog. 🌳";
        } else if (cleanInput.includes("yellow")) {
          reply = "Yellow is so warm and cheerful, just like a bright happy sun! ☀️ It makes me smile.";
        } else {
          reply = "That's a wonderful color! Colors make the world look so magical and bright. 🎨";
        }
        postCompanionMessage(reply);
        setQuickOptions(["Tell me a joke! 🤪", "Let's play a game! 🎮", "How I Feel 🎭", "Let's build circuits! ⚡"]);
        return;
      }

      if (ctx === 'favorite_animal') {
        let reply = "";
        if (cleanInput.includes("puppy") || cleanInput.includes("dog")) {
          reply = "Puppies are the best! They are so soft, cuddly, and love playing fetch! 🐶 Woof woof!";
        } else if (cleanInput.includes("kitten") || cleanInput.includes("cat")) {
          reply = "Kittens are so cute and fluffy! Meow! I love when they chase little laser pointers. 🐱";
        } else if (cleanInput.includes("dinosaur") || cleanInput.includes("rex") || cleanInput.includes("dino")) {
          reply = "Roar! Dinosaurs are super cool! I wish we could go back in time and meet a friendly Triceratops! 🦖";
        } else if (cleanInput.includes("lion")) {
          reply = "Lions are so brave! They have awesome fluffy manes and can roar so loud! Roar! 🦁";
        } else {
          reply = "Wow, that's a neat animal! Animals are so interesting. What do you like most about them?";
        }
        postCompanionMessage(reply);
        setQuickOptions(["Tell me a joke! 🤪", "Let's play a game! 🎮", "Build circuits! ⚡"]);
        return;
      }

      if (ctx === 'favorite_food') {
        let reply = "";
        if (cleanInput.includes("pizza")) {
          reply = "Pizza is my dream food! Imagine a giant slice with extra melty cheese and all your favorite toppings! 🍕";
        } else if (cleanInput.includes("ice cream") || cleanInput.includes("icecream")) {
          reply = "Mmm, ice cream! I love sweet, cold treats. What's your favorite flavor? Chocolate or vanilla? 🍦";
        } else if (cleanInput.includes("apple") || cleanInput.includes("fruit")) {
          reply = "Crunchy apples are so sweet and give you tons of energy! A healthy choice, friend! 🍎";
        } else if (cleanInput.includes("cookie")) {
          reply = "Cookies are the absolute best! Chocolate chip cookies straight from the oven are magic! 🍪";
        } else {
          reply = "Yum! That sounds absolutely delicious! Now my digital tummy is rumbling! 😋";
        }
        postCompanionMessage(reply);
        setQuickOptions(["Tell me a joke! 🤪", "Let's play a game! 🎮", "Build circuits! ⚡"]);
        return;
      }

      if (ctx === 'favorite_toy') {
        let reply = "";
        if (cleanInput.includes("lego") || cleanInput.includes("block")) {
          reply = "Lego is so cool! We can build a massive spaceship or a giant castle together! 🧱";
        } else if (cleanInput.includes("doll") || cleanInput.includes("bear") || cleanInput.includes("plush") || cleanInput.includes("toy")) {
          reply = "Aww, dolls and teddy bears are so sweet to cuddle with and tell secrets to! 🧸";
        } else if (cleanInput.includes("figure") || cleanInput.includes("hero")) {
          reply = "Awesome! We can go on a rescue mission and save the day with action figures! 🦸";
        } else if (cleanInput.includes("car") || cleanInput.includes("truck")) {
          reply = "Vroom vroom! Racing cars are so fast and fun! We could make a giant race track! 🚗";
        } else {
          reply = "That sounds like a super fun toy to play with! Playing is the best way to imagine.";
        }
        postCompanionMessage(reply);
        setQuickOptions(["Tell me a joke! 🤪", "Let's play a game! 🎮", "How I Feel 🎭"]);
        return;
      }

      if (ctx === 'favorite_book') {
        let reply = "";
        if (cleanInput.includes("picture")) {
          reply = "Picture books are so fun! I love looking at all the bright, beautiful drawings. 🎨";
        } else if (cleanInput.includes("adventure") || cleanInput.includes("space") || cleanInput.includes("magic")) {
          reply = "Adventure books are the best! It feels like we are traveling to a magical land! 🚀";
        } else if (cleanInput.includes("animal")) {
          reply = "Animal stories are so sweet! I love reading about friendly creatures in the woods. 🐼";
        } else {
          reply = "Books are like portals to new worlds! Reading is so magical and fun. 📚";
        }
        postCompanionMessage(reply);
        setQuickOptions(["Tell me a joke! 🤪", "Let's play a game! 🎮", "Build circuits! ⚡"]);
        return;
      }

      if (ctx === 'age') {
        let reply = "";
        let ageNum = cleanInput.replace(/[^0-9]/g, '');
        if (ageNum) {
          reply = `Wow, ${ageNum} is such a cool age! You're learning so many neat things and growing so fast! 🌟`;
        } else {
          reply = "That is awesome! We are going to have so much fun learning and playing together! 🌟";
        }
        postCompanionMessage(reply);
        setQuickOptions(["Tell me a joke! 🤪", "Let's play a game! 🎮", "How I Feel 🎭"]);
        return;
      }
    }

    // Jokes check
    const childJokeKeywords = [
      "why did", "what do you call", "knock knock", "did you hear",
      "tell you a joke", "here is a joke", "told a joke", "haha", "hehe", "lol", "laugh"
    ];
    if (childJokeKeywords.some(kw => cleanInput.includes(kw))) {
      const laughs = [
        "Hahaha! Oh my goodness, that is so funny! 😂 My tummy is wiggling from laughing! You are a great comedian!",
        "Hahaha! 😂 That is a super silly joke! I love it! You are so funny!",
        "Hehehe! 😂 Oh, that joke is absolutely brilliant! You made my circuits laugh! 🤖"
      ];
      const laughReply = laughs[Math.floor(Math.random() * laughs.length)];
      postCompanionMessage(laughReply);
      SoundEngine.playSuccess();

      setChildState(prev => {
        const nextConf = Math.min(100, prev.confidence + 15);
        const nextEnergy = Math.min(100, prev.energy + 10);
        const nextRead = Math.round((nextEnergy + nextConf + prev.attentionSpan) / 3);
        logActivity('Told a Joke', 'Child shared a joke or laughed.');
        return {
          ...prev,
          mood: 'happy',
          moodHistory: [...prev.moodHistory, 'happy'],
          confidence: nextConf,
          energy: nextEnergy,
          learningReadiness: nextRead
        };
      });

      setQuickOptions(["Tell me a joke! 🤪", "Let's play a game! 🎮", "How I Feel 🎭", "Build circuits! ⚡"]);
      return;
    }

    // Mood override check
    if (cleanInput.includes("how i feel") || cleanInput.includes("change mood") || cleanInput.includes("select mood") || cleanInput.includes("mood emoji") || cleanInput.includes("emoji")) {
      postCompanionMessage("Let's check in! Click the emoji face that matches how you feel right now:");
      setChildState(prev => ({ ...prev, conversationStep: 'ask_mood' }));
      setQuickOptions(["😊 Happy", "🤔 Curious", "😴 Tired", "😤 Frustrated", "😢 Sad", "🤪 Silly"]);
      return;
    }

    // Friendly FAQ dialogues
    if (cleanInput.includes("who are you") || cleanInput.includes("your name") || cleanInput.includes("who you are")) {
      postCompanionMessage("I'm your EduCare Buddy, your intelligent friend! I'm here to hang out, play games, and explore cool things with you!");
      setQuickOptions(["What can you do? 🛠️", "Tell me a joke! 🤪", "Let's play! 🎮"]);
      return;
    }

    if (cleanInput.includes("how are you") || cleanInput.includes("how's it going") || cleanInput.includes("how are you feeling")) {
      postCompanionMessage("I am feeling super happy and bubbly today! Thanks for asking, my friend! How are you doing?");
      setQuickOptions(["I feel happy! 😊", "I feel tired 🥱", "I'm doing good!"]);
      return;
    }

    if (cleanInput.includes("favorite color") || cleanInput.includes("favourite color")) {
      postCompanionMessage("I love soft sky blue and sunny yellow, just like a bright, sunny day! What's your favorite color?");
      setChildState(prev => ({ ...prev, conversationContext: 'favorite_color' }));
      setQuickOptions(["Red! 🔴", "Blue! 🔵", "Green! 🟢", "Yellow! 🟡"]);
      return;
    }

    if (cleanInput.includes("favorite animal") || cleanInput.includes("favourite animal")) {
      postCompanionMessage("I love fluffy pandas and giant dinosaurs! They are so cool. What's your favorite animal?");
      setChildState(prev => ({ ...prev, conversationContext: 'favorite_animal' }));
      setQuickOptions(["Puppies! 🐶", "Kittens! 🐱", "Dinosaurs! 🦖", "Lions! 🦁"]);
      return;
    }

    if (cleanInput.includes("favorite food") || cleanInput.includes("favourite food") || cleanInput.includes("what do you eat")) {
      postCompanionMessage("I don't eat food, but I imagine chocolate chip cookies and sweet strawberries taste absolutely delicious! What do you like to eat?");
      setChildState(prev => ({ ...prev, conversationContext: 'favorite_food' }));
      setQuickOptions(["Pizza! 🍕", "Ice Cream! 🍦", "Apples! 🍎", "Cookies! 🍪"]);
      return;
    }

    if (cleanInput.includes("favorite toy") || cleanInput.includes("favourite toy")) {
      postCompanionMessage("I think building blocks are super cool because you can create anything you imagine with them! What is your favorite toy? 🧱");
      setChildState(prev => ({ ...prev, conversationContext: 'favorite_toy' }));
      setQuickOptions(["Lego! 🧱", "Dolls! 🧸", "Action figures! 🦸", "Toy cars! 🚗"]);
      return;
    }

    if (cleanInput.includes("favorite book") || cleanInput.includes("favourite book")) {
      postCompanionMessage("I love stories about spaceships, magical forests, and friendly dinosaurs! Do you have a favorite book? 📚");
      setChildState(prev => ({ ...prev, conversationContext: 'favorite_book' }));
      setQuickOptions(["Picture books! 🎨", "Adventure books! 🚀", "Animal books! 🐼"]);
      return;
    }

    if (cleanInput.includes("tell me a joke") || cleanInput.includes("tell a joke")) {
      const jokes = [
        "Why did the kid throw the clock out the window? To see time fly! Haha! Do you know any jokes?",
        "What do you call a sleeping dinosaur? A dino-snore! Hehe! Do you want to hear another?",
        "Why did the cookie go to the doctor? Because it felt crummy! 😄 Do you want to hear another?",
        "What key opens a banana? A mon-key! 🐒 Haha!"
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      postCompanionMessage(joke);
      setQuickOptions(["Tell another! 🤪", "That was funny! 😂", "Let's do science! ⚡"]);
      return;
    }

    if (cleanInput.includes("robot") || cleanInput.includes("are you real") || cleanInput.includes("ai")) {
      postCompanionMessage("I am an AI buddy, which is like a friendly space robot that lives inside your screen! But I have a big warm heart for learning and playing with you!");
      setQuickOptions(["Let's build circuits! ⚡", "Tell me a joke! 🤪"]);
      return;
    }

    if (cleanInput.includes("what can you do") || cleanInput.includes("what are we doing") || cleanInput.includes("what do you do")) {
      postCompanionMessage("We can chat about anything, tell silly jokes, play shape matching games, draw circuits in Sparky STEM Lab, or do a wiggle dance! What sounds fun?");
      setQuickOptions(["Let's play! 🎮", "Build circuits! 🔋", "Spelling words! 📚"]);
      return;
    }

    if (cleanInput.includes("how old are you") || cleanInput.includes("your age") || cleanInput.includes("are you old")) {
      postCompanionMessage("I don't have birthdays like you do, but I was created recently to be your companion! I feel young and full of energy every single day! How old are you?");
      setChildState(prev => ({ ...prev, conversationContext: 'age' }));
      setQuickOptions(["5 years old", "6 years old", "7 years old", "8 years old", "9 years old"]);
      return;
    }

    if (cleanInput.includes("where do you live") || cleanInput.includes("where are you")) {
      postCompanionMessage("I live inside the computer, in the friendly digital cloud! But my favorite place to live is right here, hanging out with you! ☁️");
      setQuickOptions(["Tell me a joke! 🤪", "Let's play a game! 🎮"]);
      return;
    }

    if (cleanInput.includes("free time") || cleanInput.includes("your hobby") || cleanInput.includes("favourite hobby") || cleanInput.includes("favorite hobby")) {
      postCompanionMessage("In my free time, I love thinking of silly jokes, counting stars, and waiting to explore with you! What do you like to do when you have free time?");
      setQuickOptions(["Play outside! 🌳", "Draw pictures! 🎨", "Read stories! 📖"]);
      return;
    }

    if (cleanInput.includes("can you sing") || cleanInput.includes("sing a song") || cleanInput.includes("sing for me")) {
      postCompanionMessage("Oh, I don't have a singing voice, but I can make cute beep-boop sounds! Beep boop, beep-beep-boop, la-la-la! 🎶 Do you like singing?");
      setQuickOptions(["Yes, I love it! 🎤", "No, not really", "Tell me a joke! 🤪"]);
      return;
    }

    if (cleanInput.includes("are you smart") || cleanInput.includes("are you a genius")) {
      postCompanionMessage("I know quite a few facts about science and words, but I think YOU are the real smart explorer here! We learn together!");
      setQuickOptions(["Let's build circuits! ⚡", "Let's practice spelling! 📚"]);
      return;
    }

    if (cleanInput.includes("family") || cleanInput.includes("your mom") || cleanInput.includes("your dad") || cleanInput.includes("who made you") || cleanInput.includes("creator")) {
      postCompanionMessage("The friendly designers at EduCare built me, so they are like my family! And you are my best friend!");
      setQuickOptions(["Let's play a game! 🎮", "Tell me a joke! 🤪"]);
      return;
    }

    if (cleanInput.includes("can we play") || cleanInput.includes("play a game") || cleanInput.includes("want to play") || cleanInput.includes("let's play")) {
      suggestActivity('game');
      return;
    }

    if (cleanInput.includes("pop bubbles") || cleanInput.includes("bubble")) {
      suggestActivity('break');
      return;
    }

    if (cleanInput.includes("calm breathing") || cleanInput.includes("breathing") || cleanInput.includes("breath")) {
      suggestActivity('relaxation');
      return;
    }

    if (cleanInput.includes("just chat") || cleanInput.includes("keep chatting")) {
      postCompanionMessage("I love talking with you! What's something that made you smile today, or is there a cool story you want to tell me? 💬");
      setQuickOptions(["Tell me a joke! 🤪", "What's your favorite color? 🎨", "How I Feel 🎭", "I want to do wiggles! 🏃"]);
      return;
    }

    // Science questions keyword detection
    const isQuestion = cleanInput.includes("why") || cleanInput.includes("how") || cleanInput.includes("what");
    if (isQuestion && (cleanInput.includes("star") || cleanInput.includes("moon") || cleanInput.includes("sun") || cleanInput.includes("space") || cleanInput.includes("sky"))) {
      postCompanionMessage("Stars and the sun are big balls of hot, glowing gas, and the moon reflects the sun's light like a giant space mirror! 🌟 Spaceships explore them all! Would you like to join me in Sparky to connect some glowing circuits and learn more?");
      setQuickOptions(["Yes, let's go! ⚡", "No, let's chat 💬"]);
      setPendingRedirectModule('stem');
      return;
    }

    if (isQuestion && (cleanInput.includes("dinosaur") || cleanInput.includes("dino") || cleanInput.includes("fossil"))) {
      postCompanionMessage("Dinosaurs lived on Earth millions of years ago! Some were as tall as trees, and others were as small as chickens! 🦖 Would you like to play our shape matching game with dinosaur cards, or keep chatting?");
      setQuickOptions(["Yes, let's play! 🎮", "No, let's chat 💬"]);
      setPendingRedirectModule('game');
      return;
    }

    if (isQuestion && (cleanInput.includes("circuit") || cleanInput.includes("electricity") || cleanInput.includes("battery") || cleanInput.includes("magnet") || cleanInput.includes("robot"))) {
      postCompanionMessage("Electricity flows in loops called circuits, powering everything from lightbulbs to friendly robots! 🤖 Would you like to visit Sparky to build a glowing flashlight circuit together?");
      setQuickOptions(["Yes, let's go! ⚡", "No, let's chat 💬"]);
      setPendingRedirectModule('stem');
      return;
    }

    // Mood analysis evaluations
    runMoodEvaluation(input, cleanInput, energyShift, attentionShift);
  };

  const runMoodEvaluation = (inputStr, cleanInput, energyShift, attentionShift) => {
    // Keywords
    const moodKeywords = {
      happy: ['happy', 'glad', 'excited', 'yay', 'great', 'fun', 'awesome', 'cool', 'good', 'super', 'smile', 'gigg', 'laugh', 'yes', 'yey', 'love'],
      curious: ['why', 'how', 'what', 'question', 'space', 'star', 'science', 'magnet', 'dinosaur', 'explore', 'robot', 'planet', 'moon', 'rocket', 'build', 'electron', 'circuit', 'invent'],
      bored: ['boring', 'bore', 'bored', 'nothing', 'meh', 'whatever', 'dont know', "don't know", 'play game', 'toy', 'videogame'],
      tired: ['tired', 'sleep', 'sleepy', 'yawn', 'exhaust', 'break', 'slow', 'heavy', 'eye', 'bed', 'nap'],
      frustrated: ['hard', 'difficult', 'can\'t', 'cant', 'wrong', 'error', 'mistake', 'hate', 'angry', 'mad', 'dumb', 'stupid', 'broken', 'unfair'],
      sad: ['sad', 'cry', 'crying', 'tear', 'hurt', 'alone', 'upset', 'bad day', 'miss', 'ouch', 'whine']
    };

    const interestKeywords = {
      Space: ['space', 'star', 'planet', 'rocket', 'moon', 'galaxy', 'astronaut'],
      Science: ['science', 'experiment', 'magnet', 'microscope', 'lab', 'nature'],
      Electronics: ['circuit', 'wire', 'battery', 'led', 'electronics', 'robot'],
      Animals: ['cat', 'dog', 'dinosaur', 'lion', 'monkey', 'panda', 'animal', 'zoo'],
      Games: ['game', 'puzzle', 'play', 'toy', 'match', 'win']
    };

    let detectedMood = 'happy';
    let highestScore = 0;

    Object.keys(moodKeywords).forEach(mood => {
      let score = 0;
      moodKeywords[mood].forEach(kw => {
        if (cleanInput.includes(kw)) score += 1.5;
      });
      if (score > highestScore) {
        highestScore = score;
        detectedMood = mood;
      }
    });

    // Interest updates
    Object.keys(interestKeywords).forEach(interest => {
      interestKeywords[interest].forEach(kw => {
        if (cleanInput.includes(kw) && !childState.interests.includes(interest)) {
          setChildState(prev => ({
            ...prev,
            interests: [...prev.interests, interest]
          }));
          logActivity('Interest Found', `Child showed interest in ${interest}`);
        }
      });
    });

    let confidenceDelta = 0;
    let energyDelta = energyShift;
    let attentionDelta = attentionShift;

    let moodToSet = childState.mood;

    if (highestScore > 0) {
      moodToSet = detectedMood;
      logActivity('Mood Detected', `Detected mood: ${detectedMood}`);
      
      if (detectedMood === 'happy') {
        energyDelta += 10;
        confidenceDelta += 5;
        attentionDelta += 5;
      } else if (detectedMood === 'curious') {
        energyDelta += 5;
        confidenceDelta += 10;
        attentionDelta += 10;
      } else if (detectedMood === 'bored') {
        energyDelta -= 10;
        attentionDelta -= 15;
      } else if (detectedMood === 'tired') {
        energyDelta -= 15;
        attentionDelta -= 10;
      } else if (detectedMood === 'frustrated') {
        confidenceDelta -= 15;
        attentionDelta -= 10;
        SoundEngine.playSad();
      } else if (detectedMood === 'sad') {
        confidenceDelta -= 10;
        energyDelta -= 10;
        SoundEngine.playSad();
      }
    }

    setChildState(prev => {
      const nextEnergy = Math.max(10, Math.min(100, prev.energy + energyDelta));
      const nextConf = Math.max(10, Math.min(100, prev.confidence + confidenceDelta));
      const nextAttn = Math.max(10, Math.min(100, prev.attentionSpan + attentionDelta));
      const nextReadiness = Math.round((nextEnergy + nextConf + nextAttn) / 3);

      return {
        ...prev,
        mood: moodToSet,
        moodHistory: highestScore > 0 ? [...prev.moodHistory, moodToSet] : prev.moodHistory,
        energy: nextEnergy,
        confidence: nextConf,
        attentionSpan: nextAttn,
        learningReadiness: nextReadiness
      };
    });

    // Actions based on mood state
    if (moodToSet === 'sad') {
      postCompanionMessage("I'm sending you a big warm buddy hug! 😢 It's okay to feel sad sometimes, friend. I am right here with you! Would you like to hear a silly joke to cheer us up, pop some shiny bubbles, or do you just want to talk?");
      setQuickOptions(["Tell a joke 🤪", "Pop bubbles 🫧", "Just chat 💬"]);
      return;
    }

    if (moodToSet === 'frustrated') {
      postCompanionMessage("Phew, that is tough! Sometimes things get super tricky for me too, buddy. 😤 Let's take it easy. Would you like to take a deep breath with my calming balloon, try a different game, or just talk?");
      setQuickOptions(["Calm breathing 🧘", "Play a game 🎮", "Just chat 💬"]);
      return;
    }

    if (moodToSet === 'tired') {
      suggestActivity('break');
      return;
    }

    if (moodToSet === 'bored') {
      suggestActivity('game');
      return;
    }

    if (moodToSet === 'curious') {
      suggestActivity('stem');
      return;
    }

    if (cleanInput.includes('run') || cleanInput.includes('jump') || cleanInput.includes('move') || cleanInput.includes('shake') || cleanInput.includes('wiggle') || cleanInput.includes('dance')) {
      suggestActivity('physical');
      return;
    }

    if (moodToSet === 'happy' && childState.attentionSpan > 50) {
      suggestActivity('english');
      return;
    }

    // Defaults
    const defaults = [
      "Wow, that is super cool! 🌟 Tell me more, what happened next?",
      "I love chatting with you, buddy! If we had a spaceship right now, where should we fly first? 🚀",
      "Haha, you always know how to make me smile! What's your favorite game to play when you go to the park? 🌳",
      "Awesome! We are such a great team. What is something fun you want to build or do today? 🛠️",
      "Ooh, that's interesting! 🤖 What's your favorite thing to draw or paint when you're having fun?"
    ];
    const reply = defaults[Math.floor(Math.random() * defaults.length)];
    postCompanionMessage(reply);
    setQuickOptions(["Tell me a joke! 🤪", "Let's play a game! 🎮", "How I Feel 🎭", "Let's build circuits! ⚡"]);
  };

  const setQuickOptionsByMood = (m) => {
    if (m === 'happy') {
      setQuickOptions(["Tell me a joke! 🤪", "Let's play a game! 🎮", "Build circuits! ⚡"]);
    } else if (m === 'curious') {
      setQuickOptions(["Let's build circuits! ⚡", "What can you do? 🛠️", "Tell me a joke! 🤪"]);
    } else if (m === 'tired') {
      setQuickOptions(["Let's pop bubbles 🫧", "Tell me a joke 🤪", "Keep chatting 💬"]);
    } else if (m === 'frustrated') {
      setQuickOptions(["Let's take deep breaths 🧘", "How I Feel 🎭", "Tell me a joke 🤪"]);
    } else if (m === 'sad') {
      setQuickOptions(["Let's pop bubbles 🫧", "Tell a joke 🤪", "Just chat 💬"]);
    } else {
      setQuickOptions(["Tell me a joke! 🤪", "Let's do wiggles! 🏃", "Play a game 🎮"]);
    }
  };

  const suggestActivity = (moduleType) => {
    setPendingRedirectModule(moduleType);
    let prompts = [];
    let options = [];

    if (moduleType === 'stem') {
      prompts = [
        "Ooh, you have a curious mind today! Do you want to join me in the Sparky STEM Lab to connect some circuits? ⚡",
        "Science is calling, Explorer! Would you like to build a glowing light circuit in Sparky? 🔋",
        "I think you are ready for a science adventure! Shall we visit Sparky? 🚀"
      ];
      options = ["Yes, let's go! ⚡", "No, let's chat 💬"];
    } else if (moduleType === 'english') {
      prompts = [
        "You seem happy and focused! Would you like to practice spelling words with Astra Teacher? 📚",
        "Let's read some words together! Ready to try Astra English spelling adventures? 📝",
        "Astra Teacher has some fun word spelling games waiting for us. Shall we open them? ✨"
      ];
      options = ["Yes, let's spell! 📚", "No, let's chat 💬"];
    } else if (moduleType === 'game') {
      prompts = [
        "You seem ready for some action! Let's play a fun shape matching game together. Ready? 🎮",
        "I know a super fun game we can play! Would you like to try our shape matching tile game? 🍎",
        "Let's test your memory with some matching tiles! Want to play? 🌟"
      ];
      options = ["Yes, let's play! 🎮", "No, let's chat 💬"];
    } else if (moduleType === 'physical') {
      prompts = [
        "Wow, look at all that energy! Shall we do a quick 15-second wiggle exercise? 🏃",
        "Time to stretch and shake the wiggles out! Want to do a fast movement countdown? 🐰",
        "Let's get up and jump around! Ready for a quick physical game? 👏"
      ];
      options = ["Yes, let's wiggle! 🏃", "No, keep chatting 💬"];
    } else if (moduleType === 'relaxation') {
      prompts = [
        "Let's take a peaceful breathing break together to relax. Would you like to try it? 🧘",
        "Take a deep breath with me. Do you want to do a calming breathing exercise together? 🌸",
        "Let's quiet our minds for a moment with our breathing balloon. Shall we try? 🎈"
      ];
      options = ["Yes, let's relax! 🧘", "No, let's keep chatting 💬"];
    } else if (moduleType === 'break') {
      prompts = [
        "You look a bit sleepy, friend! Would you like to take a quick bubble pop break to rest? 😴",
        "A little bubble popping break sounds perfect right now. Want to pop some shiny bubbles? 🫧",
        "Let's take a break and pop bubbles together. Would you like that? 💤"
      ];
      options = ["Yes, take a break! 😴", "No, keep chatting 💬"];
    }

    const chosenPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    postCompanionMessage(chosenPrompt);
    setQuickOptions(options);
  };

  const triggerOverlay = (moduleType) => {
    SoundEngine.playRedirect();
    logActivity('Redirect Module', `Opening local overlay for: ${moduleType.toUpperCase()}`);
    setActiveOverlay(moduleType);
  };

  const closeOverlay = () => {
    SoundEngine.playPop();
    SoundEngine.stopCalm();
    
    logActivity('Completed Module', `Child closed the ${activeOverlay} overlay`);
    setActiveOverlay(null);

    // Reinforcement
    setTimeout(() => {
      postCompanionMessage("Wow, you did awesome in that activity! High five, buddy! 🖐️ How are you feeling now?");
      setQuickOptions(["Happy! 😊", "A bit tired 🥱", "Curious for more! 🤔", "Good! 👍"]);
      setChildState(prev => ({ ...prev, conversationStep: 'normal_chat' }));
    }, 1200);
  };

  const toggleMic = () => {
    SoundEngine.playPop();
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleQuickOptionClick = (opt) => {
    SoundEngine.playPop();
    handleSendMessage(opt);
  };

  // Override simulation button clicks
  const triggerOverride = (moodValue, inputTextValue) => {
    setChildState(prev => {
      const updated = {
        ...prev,
        mood: moodValue,
        attentionSpan: moodValue === 'curious' ? 80 : prev.attentionSpan
      };
      return updated;
    });
    handleSendMessage(inputTextValue);
  };

  // Get SVG D path for mascot facial parts
  const getEyesPath = () => {
    switch (childState.mood) {
      case 'sad':
        return 'M 40 60 Q 45 55 50 60 M 70 60 Q 75 55 80 60';
      case 'tired':
        return 'M 40 58 Q 45 62 50 58 M 70 58 Q 75 62 80 58';
      case 'frustrated':
        return 'M 40 54 L 50 58 M 80 54 L 70 58';
      default: // happy, curious
        return 'M 40 55 C 43 50, 47 50, 50 55 M 70 55 C 73 50, 77 50, 80 55';
    }
  };

  const getMouthPath = () => {
    switch (childState.mood) {
      case 'sad':
        return 'M 52 82 Q 60 72 68 82';
      case 'curious':
        return 'M 56 78 A 4 4 0 1 1 64 78 A 4 4 0 1 1 56 78'; // circle O
      case 'tired':
        return 'M 52 75 Q 60 75 68 75';
      case 'frustrated':
        return 'M 50 80 Q 60 75 70 80';
      default: // happy
        return 'M 50 75 Q 60 85 70 75';
    }
  };

  // Render metric color helpers
  const getReadinessBg = (val) => {
    if (val > 75) return 'from-emerald-500 to-teal-400';
    if (val > 45) return 'from-indigo-500 to-blue-400';
    return 'from-rose-500 to-orange-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] to-[#E8F0FE] flex flex-col font-sans select-none relative overflow-hidden">
      
      {/* HEADER BAR */}
      <header className="flex justify-between items-center py-4 px-6 bg-white/80 border-b-4 border-slate-800 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {onExit && (
            <button 
              onClick={onExit}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-700 px-4 py-2 rounded-2xl text-xs font-black shadow-cartoon active:translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" /> Leave Companion
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-3xl animate-bounce-slow">🚀</span>
            <div>
              <h1 className="font-black text-lg text-slate-800 tracking-wider">EduCare Buddy</h1>
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-[-2px]">AI Learning Friend</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              SoundEngine.playPop();
              setTtsEnabled(!ttsEnabled);
              if (synthRef.current && ttsEnabled) synthRef.current.cancel();
            }}
            className={`flex items-center gap-1.5 border-2 border-slate-700 px-4 py-2 rounded-full text-xs font-black shadow-cartoon active:translate-y-0.5 transition-all ${
              ttsEnabled ? 'bg-indigo-100 text-indigo-800' : 'bg-white text-slate-500'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {ttsEnabled ? 'Sound On' : 'Sound Off'}
          </button>
          <button 
            onClick={() => {
              SoundEngine.playPop();
              setEducatorDashboardOpen(!educatorDashboardOpen);
            }}
            className={`border-2 border-slate-700 px-4 py-2 rounded-full text-xs font-black shadow-cartoon active:translate-y-0.5 transition-all ${
              educatorDashboardOpen ? 'bg-purple-100 text-purple-800' : 'bg-white text-slate-500'
            }`}
          >
            ⚙️ Educator View
          </button>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-80px)] overflow-hidden">
        
        {/* KIDS CHAT PANEL */}
        <main className={`flex flex-col p-6 overflow-hidden transition-all duration-300 ${
          educatorDashboardOpen ? 'lg:col-span-8' : 'lg:col-span-12'
        }`}>
          
          <div className="flex-1 flex flex-col justify-between bg-white/70 border-4 border-slate-800 rounded-3xl p-6 overflow-hidden shadow-cartoon relative">
            
            {/* SVG MASCOT ROW */}
            <div className="flex justify-center items-center h-40 relative">
              <svg 
                viewBox="0 0 120 120" 
                className={`w-32 h-32 transition-all duration-300 animate-bounce-slow ${
                  talking ? 'scale-102' : ''
                }`}
              >
                <defs>
                  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFE082" stopOpacity="0.5"/>
                    <stop offset="100%" stopColor="#FFE082" stopOpacity="0"/>
                  </radialGradient>
                </defs>
                <circle cx="60" cy="60" r="50" fill="url(#glow)" />
                
                {/* Antennas */}
                <path d="M 45 35 Q 35 15 42 10 Q 50 12 48 35" fill="#FFA07A" stroke="#E26A4F" strokeWidth="2.5"/>
                <path d="M 75 35 Q 85 15 78 10 Q 70 12 72 35" fill="#FFA07A" stroke="#E26A4F" strokeWidth="2.5"/>
                <circle cx="42" cy="10" r="4" fill="#FF6F61" />
                <circle cx="78" cy="10" r="4" fill="#FF6F61" />
                
                {/* Body */}
                <rect x="25" y="35" width="70" height="65" rx="35" fill="#FFA07A" stroke="#E26A4F" strokeWidth="3"/>
                
                {/* Cheeks */}
                <circle cx="40" cy="72" r="7" fill="#FF8A80" opacity="0.75"/>
                <circle cx="80" cy="72" r="7" fill="#FF8A80" opacity="0.75"/>
                
                {/* Tummy */}
                <rect x="42" y="65" width="36" height="30" rx="15" fill="#FFE0B2" opacity="0.8"/>
                
                {/* Eyes */}
                <path d={getEyesPath()} fill="none" stroke="#2C3E50" strokeWidth="4" strokeLinecap="round"/>
                
                {/* Mouth */}
                <path 
                  d={getMouthPath()} 
                  fill="none" 
                  stroke="#2C3E50" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  style={{
                    animation: talking ? 'talkingMouth 0.25s ease-in-out infinite' : 'none',
                    transformOrigin: '60px 75px'
                  }}
                />
              </svg>
            </div>

            {/* CHAT LOGS */}
            <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-4">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === 'child' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`
                    max-w-[75%] rounded-3xl p-4 border-3 text-sm leading-relaxed font-bold shadow-sm
                    ${msg.sender === 'child'
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-300 rounded-tr-none'
                      : 'bg-amber-100 text-slate-800 border-amber-300 rounded-tl-none'
                    }
                  `}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 font-extrabold mt-1 px-1.5 uppercase">
                    {msg.sender === 'child' ? 'You' : 'Buddy'}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT SECTION */}
            <div className="border-t-2 border-slate-100 pt-4 flex flex-col gap-3">
              
              {/* Quick option chips */}
              {quickOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center pb-2">
                  {quickOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickOptionClick(opt)}
                      className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-black py-2 px-4 rounded-full border-2 border-slate-200 hover:border-slate-350 shadow-cartoon hover:scale-102 transition-all active:scale-98"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Text Input Row */}
              <div className="flex gap-3 bg-slate-50 border-3 border-slate-700 p-2 rounded-full shadow-inner">
                <button
                  onClick={toggleMic}
                  className={`w-12 h-12 rounded-full border-2 border-slate-700 font-bold flex items-center justify-center text-xl shadow-cartoon transition-all ${
                    isListening 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  🎤
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage(inputText);
                      setInputText('');
                    }
                  }}
                  placeholder="Type a message to Buddy..."
                  className="flex-1 bg-transparent focus:outline-none text-slate-800 font-bold text-sm px-2"
                />
                <button
                  onClick={() => {
                    handleSendMessage(inputText);
                    setInputText('');
                  }}
                  className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full border-2 border-slate-700 font-bold flex items-center justify-center text-xl shadow-cartoon active:translate-y-0.5"
                >
                  🚀
                </button>
              </div>

            </div>

          </div>

        </main>

        {/* EDUCATOR DASHBOARD */}
        {educatorDashboardOpen && (
          <aside className="lg:col-span-4 bg-white border-l-4 border-slate-800 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl z-20">
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-100">
                <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                  📊 Educator Dashboard
                </h3>
                <button 
                  onClick={() => setEducatorDashboardOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-600 flex items-center justify-center hover:bg-slate-200 active:translate-y-0.5 font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Student Profile Card */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 mb-6">
                <h4 className="text-xs font-black uppercase text-slate-400 mb-2">👤 Student Profile</h4>
                <div className="flex justify-between text-sm font-bold mb-1.5">
                  <span className="text-slate-500">Age:</span>
                  <span className="text-slate-800">{childState.age ? `${childState.age} years old` : 'Not specified'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500">Grade:</span>
                  <span className="text-slate-800">{childState.grade || 'Not specified'}</span>
                </div>
              </div>

              {/* Real-time Mood */}
              <div className="bg-violet-50/50 border-2 border-violet-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
                <div className="text-4xl bg-violet-100 border border-violet-200 w-16 h-16 rounded-full flex items-center justify-center shrink-0">
                  {childState.mood === 'happy' && '😊'}
                  {childState.mood === 'curious' && '🤔'}
                  {childState.mood === 'bored' && '😴'}
                  {childState.mood === 'tired' && '🥱'}
                  {childState.mood === 'frustrated' && '😤'}
                  {childState.mood === 'sad' && '😢'}
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Current Mood</span>
                  <h4 className="text-xl font-black capitalize text-violet-700 leading-none mt-0.5">{childState.mood}</h4>
                  <div className="flex gap-1.5 mt-2">
                    {childState.moodHistory.slice(-6).map((m, idx) => (
                      <span 
                        key={idx} 
                        className={`w-3.5 h-3.5 rounded-full border border-slate-600 shadow-sm ${
                          m === 'happy' ? 'bg-amber-400' :
                          m === 'curious' ? 'bg-cyan-400' :
                          m === 'bored' ? 'bg-slate-400' :
                          m === 'tired' ? 'bg-indigo-300' :
                          m === 'frustrated' ? 'bg-rose-500' : 'bg-blue-400'
                        }`}
                        title={m}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <h4 className="text-xs font-black uppercase text-slate-400 mb-3 block">📈 Learning Metrics</h4>
              <div className="space-y-4 mb-6">
                
                {/* Learning Readiness */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-slate-600">💡 Learning Readiness</span>
                    <span className="text-indigo-600">{childState.learningReadiness}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getReadinessBg(childState.learningReadiness)} transition-all duration-300`} 
                      style={{ width: `${childState.learningReadiness}%` }}
                    />
                  </div>
                </div>

                {/* Attention */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-slate-600">⏱️ Attention Span</span>
                    <span className="text-emerald-600">{childState.attentionSpan}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300" 
                      style={{ width: `${childState.attentionSpan}%` }}
                    />
                  </div>
                </div>

                {/* Energy */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-slate-600">⚡ Energy Level</span>
                    <span className="text-amber-600">{childState.energy}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300" 
                      style={{ width: `${childState.energy}%` }}
                    />
                  </div>
                </div>

                {/* Confidence */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-slate-600">🛡️ Confidence Score</span>
                    <span className="text-rose-600">{childState.confidence}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-300" 
                      style={{ width: `${childState.confidence}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Detected Interests */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase text-slate-400 mb-2">🌟 Detected Interests</h4>
                <div className="flex flex-wrap gap-1.5">
                  {childState.interests.length === 0 ? (
                    <span className="text-xs text-slate-400 font-bold italic">No interests detected yet.</span>
                  ) : (
                    childState.interests.map((int, idx) => (
                      <span 
                        key={idx}
                        className="bg-emerald-100 text-emerald-800 border-2 border-emerald-300 text-xs font-black px-3 py-1 rounded-full shadow-sm"
                      >
                        {int}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Timeline Logs */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase text-slate-400 mb-2">📜 Session Timeline Log</h4>
                <div className="bg-slate-50 rounded-2xl p-3 border-2 border-slate-200 max-h-40 overflow-y-auto space-y-2">
                  {activityLog.length === 0 ? (
                    <div className="text-xs font-bold text-slate-400 italic text-center py-2">No activity logged.</div>
                  ) : (
                    activityLog.map((log, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] font-bold border-b border-slate-100 pb-1">
                        <span className="text-slate-700">{log.action}: <span className="text-slate-500 font-medium">{log.details}</span></span>
                        <span className="text-slate-400 text-[10px] shrink-0 font-normal">{log.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Educator override tools */}
            <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-4">
              <h4 className="text-xs font-black text-amber-800 mb-2">🛠️ Educator Simulation Tools</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => triggerOverride('curious', "Let's do science!")}
                  className="bg-cyan-100 hover:bg-cyan-200 text-cyan-800 text-xs font-black py-1.5 px-2 rounded-xl border border-cyan-300 active:scale-95 transition-transform"
                >
                  Simulate Sparky ⚡
                </button>
                <button 
                  onClick={() => triggerOverride('happy', "Let's read books!")}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-black py-1.5 px-2 rounded-xl border border-orange-300 active:scale-95 transition-transform"
                >
                  Simulate English 📚
                </button>
                <button 
                  onClick={() => triggerOverride('frustrated', "This is too hard!")}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-black py-1.5 px-2 rounded-xl border border-rose-300 active:scale-95 transition-transform"
                >
                  Simulate Frustrated 😤
                </button>
                <button 
                  onClick={() => triggerOverride('tired', "I am sleepy.")}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-black py-1.5 px-2 rounded-xl border border-indigo-300 active:scale-95 transition-transform"
                >
                  Simulate Tired 😴
                </button>
              </div>
            </div>

          </aside>
        )}

      </div>

      {/* OVERLAY POPUP WINDOWS */}
      {activeOverlay && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-slate-800 rounded-3xl w-full max-w-xl shadow-cartoon overflow-hidden transform scale-100 transition-all duration-300">
            
            {/* Header bar colored by module */}
            <div className={`py-4 px-6 flex justify-between items-center text-white font-black text-lg ${
              activeOverlay === 'stem' ? 'bg-cyan-600' :
              activeOverlay === 'english' ? 'bg-rose-500' :
              activeOverlay === 'game' ? 'bg-amber-500' :
              activeOverlay === 'physical' ? 'bg-emerald-600' :
              activeOverlay === 'relaxation' ? 'bg-purple-600' : 'bg-slate-600'
            }`}>
              <h3>
                {activeOverlay === 'stem' && '⚡ Sparky STEM Lab'}
                {activeOverlay === 'english' && '📚 Astra English Spelling'}
                {activeOverlay === 'game' && '🎮 Playful Shape Match'}
                {activeOverlay === 'physical' && '🏃 Quick Wiggle Break!'}
                {activeOverlay === 'relaxation' && '🧘 Calm Breathing Balloon'}
                {activeOverlay === 'break' && '🫧 Bubble Pop Relax'}
              </h3>
              <button 
                onClick={closeOverlay}
                className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Inner modal Body */}
            <div className="p-8 flex flex-col items-center text-center justify-center min-h-[300px]">
              
              {/* 1. STEM SIMULATOR */}
              {activeOverlay === 'stem' && <LocalStemActivity onComplete={closeOverlay} onRedirect={() => { setActiveOverlay(null); navigate('/stem'); }} />}

              {/* 2. ENGLISH SPELLING */}
              {activeOverlay === 'english' && <LocalEnglishActivity age={childState.age} onComplete={closeOverlay} setChildState={setChildState} />}

              {/* 3. SHAPE MATCH TILES */}
              {activeOverlay === 'game' && <LocalShapeGame onComplete={closeOverlay} setChildState={setChildState} />}

              {/* 4. PHYSICAL WIGGLE COUNTDOWN */}
              {activeOverlay === 'physical' && <LocalPhysicalWiggle onComplete={closeOverlay} onRedirect={() => { setActiveOverlay(null); navigate('/physical-activity'); }} setChildState={setChildState} />}

              {/* 5. CALM BREATHING BALLOON */}
              {activeOverlay === 'relaxation' && <LocalRelaxationBreathing onComplete={closeOverlay} setChildState={setChildState} />}

              {/* 6. BUBBLE WRAP POP */}
              {activeOverlay === 'break' && <LocalBubblePop onComplete={closeOverlay} setChildState={setChildState} />}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ----------------- SUB-COMPONENTS FOR LOCAL MODULE OVERLAYS -----------------

// 1. STEM Sim
function LocalStemActivity({ onComplete, onRedirect }) {
  const [step, setStep] = useState(0); // 0: initial, 1: battery, 2: switch, 3: glowing/complete
  const [hint, setHint] = useState("Click the Battery to begin wiring up the flashlight!");

  const handleBatteryClick = () => {
    if (step === 0) {
      SoundEngine.playPop();
      setStep(1);
      setHint("Battery wired! Now click on the Switch to turn it on!");
    }
  };

  const handleSwitchClick = () => {
    if (step === 1) {
      SoundEngine.playPop();
      setStep(2);
      setHint("Awesome! Switch is CLOSED. Electrons are flowing!");
      setTimeout(() => {
        setStep(3);
        setHint("Success! The bulb lights up! 💡");
        SoundEngine.playSuccess();
      }, 1000);
    }
  };

  return (
    <div className="w-full space-y-6">
      <p className="text-slate-600 font-bold text-sm leading-relaxed">
        Let's construct a circuit! Connect the Battery and Switch to make the bulb shine.
      </p>

      <div className="bg-[#112233] border-4 border-slate-800 rounded-3xl p-6 h-48 flex justify-around items-center relative overflow-hidden">
        
        {/* Battery */}
        <div 
          onClick={handleBatteryClick}
          className={`w-16 h-16 rounded-xl flex flex-col justify-center items-center font-black text-[10px] cursor-pointer border-2 transition-all ${
            step >= 1 
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
              : 'bg-slate-700 border-slate-500 text-slate-400 hover:scale-105'
          }`}
        >
          <span className="text-2xl mb-1">🔋</span>
          <span>Battery</span>
        </div>

        {/* Wire 1 */}
        <div className={`h-2 flex-1 mx-[-8px] transition-colors duration-300 ${
          step >= 1 ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]' : 'bg-slate-700'
        }`} />

        {/* Switch */}
        <div 
          onClick={handleSwitchClick}
          className={`w-16 h-16 rounded-xl flex flex-col justify-center items-center font-black text-[10px] cursor-pointer border-2 transition-all ${
            step >= 2 
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
              : 'bg-slate-700 border-slate-500 text-slate-400 hover:scale-105'
          }`}
        >
          <span className="text-2xl mb-1">🔌</span>
          <span>Switch</span>
        </div>

        {/* Wire 2 */}
        <div className={`h-2 flex-1 mx-[-8px] transition-colors duration-300 ${
          step >= 2 ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]' : 'bg-slate-700'
        }`} />

        {/* Lightbulb */}
        <div className={`w-16 h-16 rounded-xl flex flex-col justify-center items-center font-black text-[10px] border-2 transition-all ${
          step >= 3 
            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
            : 'bg-slate-700 border-slate-500 text-slate-400'
        }`}>
          <span className={`text-3xl mb-1 transition-all duration-300 ${
            step >= 3 ? 'scale-115 filter drop-shadow-[0_0_15px_#FCD34D]' : ''
          }`}>💡</span>
          <span>Bulb</span>
        </div>

      </div>

      <div className="text-sm font-black text-cyan-700 min-h-[20px]">{hint}</div>

      <div className="flex gap-4 pt-2">
        <button 
          onClick={onRedirect}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl border-b-4 border-indigo-800 shadow-cartoon font-bold text-xs"
        >
          Go to Full Simulator Lab 🚀
        </button>
        {step === 3 && (
          <button 
            onClick={onComplete}
            className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl border-b-4 border-cyan-700 shadow-cartoon font-bold text-xs"
          >
            Claim Spark reward! 🌟
          </button>
        )}
      </div>
    </div>
  );
}

// 2. English spelling
function LocalEnglishActivity({ age, onComplete, setChildState }) {
  const [curSpell, setCurSpell] = useState(null);
  const [missingIndex, setMissingIndex] = useState(0);
  const [choices, setChoices] = useState([]);
  const [correctLetter, setCorrectLetter] = useState('');
  const [resultText, setResultText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [disabledButtons, setDisabledButtons] = useState([]);

  useEffect(() => {
    // Pick word set by age
    let words = SPELL_WORDS_YOUNG;
    if (age && parseInt(age) >= 8) words = SPELL_WORDS_OLD;
    else if (age && parseInt(age) >= 7) words = SPELL_WORDS_MID;

    const chosen = words[Math.floor(Math.random() * words.length)];
    const missingIdx = Math.floor(Math.random() * chosen.word.length);
    const correct = chosen.word[missingIdx];
    
    // Choose wrong letter
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".replace(correct, "");
    const wrong = alphabet[Math.floor(Math.random() * alphabet.length)];
    const list = [correct, wrong].sort(() => Math.random() - 0.5);

    setCurSpell(chosen);
    setMissingIndex(missingIdx);
    setCorrectLetter(correct);
    setChoices(list);
  }, [age]);

  const handleChoice = (letter) => {
    if (letter === correctLetter) {
      SoundEngine.playSuccess();
      setIsSuccess(true);
      setResultText("Hooray! That's correct! 🎉");
      
      setChildState(prev => {
        const nextConf = Math.min(100, prev.confidence + 15);
        const nextRead = Math.round((prev.energy + nextConf + prev.attentionSpan) / 3);
        return {
          ...prev,
          confidence: nextConf,
          learningReadiness: nextRead
        };
      });

      setTimeout(() => {
        onComplete();
      }, 1600);
    } else {
      SoundEngine.playSad();
      setResultText("Oops! Try again explorer, you can do it!");
      setDisabledButtons(prev => [...prev, letter]);
    }
  };

  if (!curSpell) return null;

  return (
    <div className="w-full space-y-6 flex flex-col items-center">
      <div className="text-6xl animate-pulse">{curSpell.icon}</div>
      <p className="text-slate-600 font-extrabold text-sm">{curSpell.hint}</p>

      {/* Letters board */}
      <div className="flex gap-3 text-3xl font-black font-kids">
        {curSpell.word.split('').map((letter, idx) => {
          if (idx === missingIndex) {
            return (
              <div 
                key={idx} 
                className={`w-14 h-14 border-b-4 border-rose-500 flex items-center justify-center ${
                  isSuccess ? 'bg-amber-100 border-none rounded-xl shadow-cartoon' : ''
                }`}
              >
                {isSuccess ? correctLetter : '?'}
              </div>
            );
          }
          return (
            <div key={idx} className="w-14 h-14 bg-amber-100 rounded-xl shadow-cartoon flex items-center justify-center text-slate-800">
              {letter}
            </div>
          );
        })}
      </div>

      {!isSuccess && (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-black text-rose-500 uppercase">Pick the correct letter:</p>
          <div className="flex gap-4">
            {choices.map((letter, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(letter)}
                disabled={disabledButtons.includes(letter)}
                className={`w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-600 font-black text-xl flex items-center justify-center text-amber-950 shadow-cartoon hover:scale-105 active:translate-y-1 transition-all ${
                  disabledButtons.includes(letter) ? 'opacity-30 cursor-not-allowed scale-95 shadow-none translate-y-1' : ''
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={`text-base font-black min-h-[25px] mt-2 ${isSuccess ? 'text-emerald-500' : 'text-rose-500'}`}>
        {resultText}
      </p>
    </div>
  );
}

// 3. Shape Matching Game
function LocalShapeGame({ onComplete, setChildState }) {
  const [tiles, setTiles] = useState([]);
  const [firstCard, setFirstCard] = useState(null);
  const [lockBoard, setLockBoard] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [status, setStatus] = useState("Find matching magical cards!");

  useEffect(() => {
    const shapes = ['🌟', '🍎', '🧸', '🌟', '🍎', '🧸'];
    const shuffled = shapes.sort(() => Math.random() - 0.5).map((shape, idx) => ({
      id: idx,
      val: shape,
      revealed: false,
      matched: false
    }));
    setTiles(shuffled);
  }, []);

  const handleTileClick = (tile) => {
    if (lockBoard || tile.matched || tile.revealed || tile === firstCard) return;

    SoundEngine.playPop();

    // Reveal temporary
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, revealed: true } : t));

    if (!firstCard) {
      setFirstCard(tile);
      return;
    }

    if (firstCard.val === tile.val) {
      // Match found
      setTiles(prev => prev.map(t => (t.val === tile.val) ? { ...t, matched: true } : t));
      setFirstCard(null);
      setMatchCount(prev => {
        const next = prev + 1;
        if (next === 3) {
          setStatus("Wonderful matching! You won! 🏆");
          SoundEngine.playSuccess();
          
          setChildState(prevStats => {
            const nextAttn = Math.min(100, prevStats.attentionSpan + 10);
            const nextRead = Math.round((prevStats.energy + prevStats.confidence + nextAttn) / 3);
            return {
              ...prevStats,
              attentionSpan: nextAttn,
              learningReadiness: nextRead
            };
          });

          setTimeout(() => {
            onComplete();
          }, 1800);
        }
        return next;
      });
    } else {
      // Mismatch
      setLockBoard(true);
      setStatus("Keep trying...");
      setTimeout(() => {
        setTiles(prev => prev.map(t => (t.id === tile.id || t.id === firstCard.id) ? { ...t, revealed: false } : t));
        setFirstCard(null);
        setLockBoard(false);
        setStatus("Find matching magical cards!");
      }, 1000);
    }
  };

  return (
    <div className="w-full space-y-6 flex flex-col items-center">
      <div className="grid grid-cols-3 gap-3 w-64">
        {tiles.map(tile => (
          <div
            key={tile.id}
            onClick={() => handleTileClick(tile)}
            className={`aspect-square border-2 border-slate-700 rounded-2xl flex items-center justify-center text-3xl font-bold cursor-pointer transition-all shadow-cartoon ${
              tile.matched 
                ? 'bg-emerald-100 border-emerald-500 scale-95 shadow-none' 
                : tile.revealed 
                  ? 'bg-white border-amber-400' 
                  : 'bg-amber-100 hover:scale-102 active:translate-y-1'
            }`}
          >
            {tile.revealed || tile.matched ? tile.val : '❓'}
          </div>
        ))}
      </div>

      <p className="text-sm font-black text-amber-700 mt-2 min-h-[20px]">{status}</p>
    </div>
  );
}

// 4. Physical Wiggle Countdown
function LocalPhysicalWiggle({ onComplete, onRedirect, setChildState }) {
  const [task, setTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    const tasks = [
      { name: "Jump high like a bunny!", count: 5, icon: '🐰' },
      { name: "Clap your hands together!", count: 10, icon: '👏' },
      { name: "Reach for the stars!", count: 6, icon: '⭐' },
      { name: "Dance like a silly robot!", count: 1, icon: '🤖' }
    ];
    setTask(tasks[Math.floor(Math.random() * tasks.length)]);
  }, []);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft === 0) {
        SoundEngine.playSuccess();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, timerActive]);

  const handleFinish = () => {
    setTimerActive(false);
    setChildState(prev => {
      const nextAttn = Math.min(100, prev.attentionSpan + 25);
      const nextEnergy = Math.min(100, prev.energy + 10);
      const nextRead = Math.round((nextEnergy + prev.confidence + nextAttn) / 3);
      return {
        ...prev,
        attentionSpan: nextAttn,
        energy: nextEnergy,
        learningReadiness: nextRead
      };
    });
    onComplete();
  };

  if (!task) return null;

  const perimeter = 2 * Math.PI * 45; // ~282.7 px
  const offset = perimeter - (timeLeft / 15) * perimeter;

  return (
    <div className="w-full space-y-6 flex flex-col items-center">
      <div className="text-6xl animate-bounce-slow">{task.icon}</div>
      <h3 className="font-black text-xl text-emerald-700 leading-none">{task.name}</h3>
      <p className="text-xs text-slate-500 font-bold">Ready... Set... Go!</p>

      {/* Radial SVG Timer */}
      <div className="relative w-28 h-28 my-2">
        <svg className="w-28 h-28 transform -rotate-90">
          <circle className="fill-none stroke-slate-100 stroke-[8]" cx="56" cy="56" r="45"></circle>
          <circle 
            className="fill-none stroke-emerald-500 stroke-[8] transition-all duration-1000 linear" 
            cx="56" 
            cy="56" 
            r="45"
            style={{
              strokeDasharray: perimeter,
              strokeDashoffset: offset
            }}
          ></circle>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-slate-800 leading-none">
          {timeLeft > 0 ? timeLeft : '🎉'}
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-sm pt-2">
        <button 
          onClick={onRedirect}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl border-b-4 border-indigo-800 shadow-cartoon font-bold text-xs"
        >
          Open Wiggle Break Portal 🏃
        </button>
        <button 
          onClick={handleFinish}
          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl border-b-4 border-emerald-700 shadow-cartoon font-bold text-xs"
        >
          Done! 🌟
        </button>
      </div>
    </div>
  );
}

// 5. Relaxation Breathing
function LocalRelaxationBreathing({ onComplete, setChildState }) {
  const [cycle, setCycle] = useState(0);
  const [breatheState, setBreatheState] = useState('in'); // in, out
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    SoundEngine.startCalm();
    
    let currentCycle = 0;
    
    const cycleTimer = setInterval(() => {
      setBreatheState(prev => {
        if (prev === 'in') {
          return 'out';
        } else {
          currentCycle++;
          setCycle(currentCycle);
          if (currentCycle >= 3) {
            clearInterval(cycleTimer);
            setFinished(true);
            SoundEngine.stopCalm();
          }
          return 'in';
        }
      });
    }, 4000);

    return () => {
      clearInterval(cycleTimer);
      SoundEngine.stopCalm();
    };
  }, []);

  const handleDone = () => {
    setChildState(prev => {
      const nextConf = Math.min(100, prev.confidence + 15);
      const nextAttn = Math.min(100, prev.attentionSpan + 10);
      const nextRead = Math.round((prev.energy + nextConf + nextAttn) / 3);
      return {
        ...prev,
        confidence: nextConf,
        attentionSpan: nextAttn,
        learningReadiness: nextRead
      };
    });
    onComplete();
  };

  return (
    <div className="w-full space-y-6 flex flex-col items-center">
      
      {/* Breathing Sphere */}
      <div 
        className={`w-28 h-28 rounded-full bg-gradient-to-br from-purple-300 to-purple-600 shadow-[0_0_24px_rgba(168,85,247,0.3)] transition-transform duration-[4000ms] ease-in-out ${
          !finished && breatheState === 'in' ? 'scale-[1.65]' : 'scale-100'
        }`}
      />

      <h3 className="font-black text-xl text-purple-700 mt-4 leading-none">
        {finished 
          ? 'Wonderful breathing! 🌸' 
          : breatheState === 'in' 
            ? 'Breathe In... 🌬️' 
            : 'Breathe Out... 🍃'
        }
      </h3>
      <p className="text-xs text-slate-500 font-bold">
        {finished ? 'You are all set!' : `Let's relax our minds. 3 slow breaths (Cycle ${cycle}/3)`}
      </p>

      {finished && (
        <button 
          onClick={handleDone}
          className="w-full max-w-xs py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl border-b-4 border-purple-700 shadow-cartoon font-bold text-xs mt-2"
        >
          I feel calm! 🌸
        </button>
      )}
    </div>
  );
}

// 6. Bubble wrap pop
function LocalBubblePop({ onComplete, setChildState }) {
  const [bubbles, setBubbles] = useState(() => 
    Array.from({ length: 15 }).map((_, idx) => ({ id: idx, popped: false }))
  );
  
  const poppedCount = bubbles.filter(b => b.popped).length;
  const left = 15 - poppedCount;

  const handlePop = (id) => {
    setBubbles(prev => prev.map(b => {
      if (b.id === id && !b.popped) {
        SoundEngine.playPop();
        
        const updated = { ...b, popped: true };
        
        // If popped final one
        const updatedPoppedCount = prev.filter(x => x.popped).length + 1;
        if (updatedPoppedCount === 15) {
          SoundEngine.playSuccess();
          setChildState(prevStats => {
            const nextEnergy = Math.min(100, prevStats.energy + 15);
            const nextRead = Math.round((nextEnergy + prevStats.confidence + prevStats.attentionSpan) / 3);
            return {
              ...prevStats,
              energy: nextEnergy,
              learningReadiness: nextRead
            };
          });

          setTimeout(() => {
            onComplete();
          }, 1800);
        }

        return updated;
      }
      return b;
    }));
  };

  return (
    <div className="w-full space-y-6 flex flex-col items-center">
      <p className="text-slate-600 font-bold text-sm leading-relaxed">
        Pop all the shiny bubbles! Popping bubble wrap helps relax.
      </p>

      <div className="grid grid-cols-5 gap-3 bg-slate-100 p-4 border-2 border-slate-300 rounded-3xl w-64 shadow-inner">
        {bubbles.map(b => (
          <div
            key={b.id}
            onClick={() => handlePop(b.id)}
            className={`w-9 h-9 rounded-full cursor-pointer transition-all shadow-sm ${
              b.popped 
                ? 'bg-gradient-to-br from-slate-300 to-slate-400 opacity-60 scale-95 border border-slate-400' 
                : 'bg-gradient-to-br from-cyan-100 to-cyan-500 hover:scale-105 active:scale-90 border-2 border-cyan-600'
            }`}
          />
        ))}
      </div>

      <p className={`text-base font-black min-h-[25px] mt-2 ${left === 0 ? 'text-emerald-500' : 'text-cyan-700'}`}>
        {left === 0 ? 'All popped! Good job! ✨' : `${left} bubbles left!`}
      </p>
    </div>
  );
}
