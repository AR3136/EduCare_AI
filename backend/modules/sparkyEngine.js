/**
 * SPARKY AI - STEM Simulation Intelligence Engine
 * Role: Circuit Simulation + Engineering Thinking + Debugging Assistant
 */

export function processSparkyQuery({ message, grade, context, circuit, performanceScore = 100 }) {
  const q = message.toLowerCase();

  // 1. STRICT TOPIC ENFORCEMENT
  const forbiddenTopics = [
    'math', 'english', 'grammar', 'spell', 'logic', 'game', 
    'physical activity', 'run', 'jump', 'history', 'geography', 
    'joke', 'funny', 'general knowledge', 'chat', 'weather', 'sports'
  ];
  
  if (forbiddenTopics.some(topic => q.includes(topic))) {
    return formatResponse(
      "Topic out of bounds",
      "I am an engineering and circuit assistant. I do not teach that topic.",
      "Let's focus on your circuit simulation ⚡",
      "Engineers must stay focused on the task at hand.",
      "I'm ready when you want to talk about STEM!",
      'puzzled'
    );
  }

  // 2. DEBUG MODE / CIRCUIT INTELLIGENCE ENGINE
  if (q.includes('debug') || q.includes('fix') || q.includes('wrong') || q.includes('not working') || q.includes('broken')) {
    return analyzeCircuitDebug(circuit, grade);
  }

  // 3. SMART HINT SYSTEM
  if (q.includes('hint') || q.includes('help') || q.includes('solve') || q.includes('how do i')) {
    return generateSmartHint(context, grade, performanceScore, circuit);
  }

  // 4. REAL-TIME CIRCUIT TEACHER MODE
  if (q.includes('battery')) {
    return formatResponse(
      "Component: Battery",
      "The battery pushes electric current through the circuit. It is the power source.",
      "Connect the + and - sides to wires to form a loop.",
      "Think of a battery like a water pump pushing water through pipes.",
      "Great engineering question!",
      'excited'
    );
  }
  
  if (q.includes('switch')) {
    return formatResponse(
      "Component: Switch",
      "A switch controls the flow of electricity. It acts as a gate.",
      "When OPEN, electrons cannot pass. When CLOSED, they flow.",
      "It's like a drawbridge on a road.",
      "Keep exploring components!",
      'happy'
    );
  }

  if (q.includes('led') || q.includes('bulb') || q.includes('light')) {
    return formatResponse(
      "Component: Light Bulb / LED",
      "A bulb turns electrical energy into light energy.",
      "Place it in a closed circuit with a battery.",
      "LEDs only let current flow in one direction (polarity).",
      "You're learning fast!",
      'happy'
    );
  }

  if (q.includes('series') || q.includes('parallel')) {
    return formatResponse(
      "Circuit Types",
      "Series circuits have one path. Parallel circuits have multiple paths.",
      "In series, if one bulb breaks, all go out. In parallel, the others stay on.",
      "Homes use parallel circuits so you can turn off one light without turning off the whole house.",
      "Excellent question, engineer!",
      'thinking'
    );
  }

  // 5. STEM ENGINEERING THINKING MODE (Grade 3-4)
  if (grade === 'Grade 3' || grade === 'Grade 4') {
    return formatResponse(
      "Engineering Problem Solving",
      "Engineers solve problems systematically. We need to debug like a real engineer.",
      "1. Identify the problem\n2. Check power source\n3. Check connections\n4. Test output",
      "Your torch is not working? Let's debug like an engineer 🔧",
      "You have the mind of an inventor!",
      'thinking'
    );
  }

  // Default fallback
  return formatResponse(
    "General Inquiry",
    "I am Sparky, your STEM Simulation Assistant. How can I help with your circuit?",
    "You can ask me to 'debug', ask for a 'hint', or ask how a component works.",
    "Electricity needs a complete loop to flow ⚡",
    "I am here to help you build!",
    'happy'
  );
}

function analyzeCircuitDebug(circuit, grade) {
  if (!circuit || !circuit.slots) {
    return formatResponse(
      "No circuit state provided",
      "I cannot see what is currently on your circuit board.",
      "Start placing components onto the grid first.",
      "We must build before we can debug.",
      "Get building, engineer!",
      'puzzled'
    );
  }

  const hasBattery = circuit.slots.some(s => s?.id === 'BATTERY');
  const hasBulb = circuit.slots.some(s => s?.id === 'BULB');
  const hasSwitch = circuit.slots.some(s => s?.id === 'SWITCH');
  const hasTestSlot = circuit.slots.some(s => s?.id === 'TEST_SLOT');
  
  if (!hasBattery) {
    return formatResponse(
      "Missing Power Source",
      "Your circuit does not have a battery.",
      "Drag a Battery onto the left slot.",
      "Electricity needs a source to push the electrons.",
      "You can fix this easily!",
      'thinking'
    );
  }

  if (hasSwitch && circuit.switchClosed === false) {
    return formatResponse(
      "Open Circuit",
      "The switch is OPEN, so there is a gap in the connection.",
      "Click the switch to CLOSE it.",
      "Electrons cannot jump over gaps in a wire.",
      "Almost there!",
      'thinking'
    );
  }

  if (hasTestSlot && circuit.selectedMaterial && !circuit.selectedMaterial.conductor) {
    return formatResponse(
      "Insulator Detected",
      `The ${circuit.selectedMaterial.name} is an insulator.`,
      "Change the material to a conductor like Gold or Paperclip.",
      "Insulators block electricity, conductors let it flow.",
      "Great job testing materials!",
      'thinking'
    );
  }

  if (!hasBulb && !circuit.slots.some(s => s?.id === 'FAN' || s?.id === 'BUZZER' || s?.id === 'RESISTOR')) {
    return formatResponse(
      "Short Circuit Risk",
      "You have power but nothing to consume it! The battery will get hot.",
      "Add a Light Bulb, Fan, or Buzzer.",
      "Energy must be used by a load to be safe.",
      "Safety first, engineer!",
      'thinking'
    );
  }

  return formatResponse(
    "Circuit Looks Complete",
    "I don't see any obvious errors in the loop.",
    "Click the 'Test' button to see if it works.",
    "Good engineers always double-check their work.",
    "Great job!",
    'excited'
  );
}

function generateSmartHint(context, grade, score, circuit) {
  let level = 1; // 1 = Hint only, 2 = Step guidance, 3 = Direct fix suggestion
  if (score < 40) level = 3;
  else if (score < 80) level = 2;

  let fixText = "";

  if (context === 'lesson-kg-std') {
    if (level === 1) fixText = "Check your power source and connections.";
    if (level === 2) fixText = "First place a battery, then place a bulb.";
    if (level === 3) fixText = "Place BATTERY in the left slot and BULB in the right slot to make a loop.";
  } else if (grade === 'Grade 1') {
    if (level === 1) fixText = "Think about which materials are conductors.";
    if (level === 2) fixText = "Metal objects let electricity pass.";
    if (level === 3) fixText = "Select the Gold Coin or Paperclip to complete the circuit.";
  } else {
    // Generic
    if (level === 1) fixText = "Make sure the loop is closed and you have power.";
    if (level === 2) fixText = "Check if your switch is open or if you're missing a battery.";
    if (level === 3) fixText = "Add a Battery, add a Bulb, and close the Switch.";
  }

  return formatResponse(
    `Smart Hint (Level ${level})`,
    "You asked for a hint. I have analyzed your progress to give you the right amount of help.",
    fixText,
    "Taking it step-by-step is how complex machines are built.",
    "I believe in you!",
    'happy'
  );
}

function formatResponse(problemAnalysis, explanation, fixSteps, learningInsight, encouragement, mood) {
  return {
    reply: {
      problemAnalysis,
      explanation,
      fixSteps,
      learningInsight,
      encouragement
    },
    mood
  };
}
