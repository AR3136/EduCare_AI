// AI-Based Adaptive Learning System for STEM Education - lessonEngine.js

import { SYLLABUS } from './data/curriculum.js';

// Advanced AI-based Adaptive Learning Engine
export function getAdaptiveLesson(grade, stars = 15, failureCount = 0, timeTaken = 60, lessonId = null) {
  const gradeSyllabus = SYLLABUS[grade] || SYLLABUS['KG'];
  
  // Find the lesson by ID, or fallback to first lesson
  let activeLesson = gradeSyllabus.find(l => l.id === lessonId) || gradeSyllabus[0];
  activeLesson = { ...activeLesson }; // copy

  // AI Adaptivity: adjust difficulty or recommended lesson based on stats
  let difficultyMode = 'standard';
  
  if (stars >= 25 || (timeTaken < 45 && failureCount === 0)) {
    difficultyMode = 'advanced';
    // Load advanced properties
    activeLesson.difficulty = 'Advanced Challenge 🚀';
    if (activeLesson.type !== 'quiz') {
      activeLesson.challengeInstructions = `Advanced Mission: ${activeLesson.challengeInstructions} (Optimize the loop with minimum components!)`;
    }
  } else if (failureCount >= 2) {
    difficultyMode = 'supportive';
    activeLesson.difficulty = 'Supportive Mode 🛡️';
    if (activeLesson.type !== 'quiz') {
      activeLesson.challengeInstructions = `Supportive Mission: We pre-configured slots for you. Just connect the remaining parts to light it up!`;
    }
  }

  // AI Hint Generation Rules
  let adaptiveHint = '';
  if (difficultyMode === 'supportive') {
    adaptiveHint = `🤝 Supportive Scaffolding Activated: Sparky pre-placed key parts. Make sure to complete the loop!`;
  } else if (failureCount === 1) {
    adaptiveHint = "💡 Hint: Electrons need a complete closed loop from the battery positive (+) back to negative (-)!";
  } else if (failureCount >= 2) {
    switch (grade) {
      case 'KG':
      case 'Grade 1':
        adaptiveHint = "🔋 Tip: Metal objects are conductors. Wood and plastic block the flow of electricity!";
        break;
      case 'Grade 2':
        adaptiveHint = "🔌 Tip: Check your switches! Click on the Switch on the board to toggle it CLOSED.";
        break;
      case 'Grade 3':
        adaptiveHint = "🌀 Tip: Swap out the bulb for a Fan Motor to spin the blades!";
        break;
      case 'Grade 4':
        adaptiveHint = "🚧 Tip: Slide the resistor slider to a safe range (5-20 Ohms) to protect the buzzer!";
        break;
      default:
        adaptiveHint = "💡 Tip: Make sure the wire paths are complete.";
    }
  }

  return {
    ...activeLesson,
    failureCount,
    timeTaken,
    starsContext: stars,
    difficultyMode,
    adaptiveHint
  };
}

export function getSTEMRecommendation(input) {
  const { grade, performanceScore, previousLessons, completedCircuits } = input;
  
  // 1. Difficulty Level & Hint Level Determination
  let difficultyLevel = 'standard';
  let hintLevel = 'basic';
  
  if (performanceScore >= 80) {
    difficultyLevel = 'advanced';
    hintLevel = 'none';
  } else if (performanceScore < 50) {
    difficultyLevel = 'supportive';
    hintLevel = 'detailed';
  }

  // 2. Select Syllabus List based on Grade
  const syllabusList = SYLLABUS[grade] || SYLLABUS['KG'];

  // 3. Recommended Lesson Selection: find first uncompleted lesson
  let recommendedLesson = syllabusList.find(lesson => !previousLessons.includes(lesson.id));

  // Fallback: If all lessons of this grade are completed, transition to next grade or loop first lesson
  if (!recommendedLesson) {
    const gradesSequence = ['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'];
    const nextIdx = gradesSequence.indexOf(grade) + 1;
    if (nextIdx < gradesSequence.length) {
      const nextGrade = gradesSequence[nextIdx];
      const nextSyllabus = SYLLABUS[nextGrade] || [];
      recommendedLesson = nextSyllabus[0];
    } else {
      // Loop back to the final lesson of Grade 4
      recommendedLesson = SYLLABUS['Grade 4'][2];
    }
  }

  // Ensure deep copy
  recommendedLesson = { ...recommendedLesson };

  // 4. Circuit Challenge selection mapping based on Grade Rules
  let recommendedChallenge = {
    challengeInstructions: recommendedLesson.challengeInstructions || recommendedLesson.description,
    circuitConfig: recommendedLesson.circuitConfig || ['BATTERY', 'WIRE', 'WIRE', 'WIRE'],
    targetConditions: recommendedLesson.targetConditions || { requiresFlowing: true }
  };

  // Adjust challenge instruction based on difficulty Level
  if (recommendedLesson.type !== 'quiz') {
    if (difficultyLevel === 'advanced') {
      recommendedChallenge.challengeInstructions = `🚀 Advanced Challenge: ${recommendedChallenge.challengeInstructions} Optimize components to minimize connections.`;
    } else if (difficultyLevel === 'supportive') {
      recommendedChallenge.challengeInstructions = `🛡️ Supportive Assistance: We pre-configured primary slots for you. Connect the remaining parts!`;
    }
  }

  // 5. Adaptive Tip based on hintLevel and Grade Rules
  let adaptiveTip = '';
  if (hintLevel === 'detailed') {
    switch(grade) {
      case 'Grade 1':
        adaptiveTip = "💡 Sparky's Clue: Drag a Battery onto the left slot, and an LED bulb onto the right. Complete the loop using wires.";
        break;
      case 'Grade 2':
        adaptiveTip = "💡 Sparky's Clue: Check your switch position! Click the switch component to toggle it CLOSED (bridge down).";
        break;
      case 'Grade 3':
        adaptiveTip = "💡 Sparky's Clue: Make sure you have a battery, switch, and light bulb connected in a complete circular ring.";
        break;
      case 'Grade 4':
        adaptiveTip = "💡 Sparky's Clue: Connect the Red, Yellow, and Green LEDs on separate parallel loop lines to control them independently!";
        break;
      default:
        adaptiveTip = "💡 Sparky's Clue: Connect components in a complete circle from positive (+) to negative (-).";
    }
  } else if (hintLevel === 'basic') {
    adaptiveTip = "💡 Hint: Electric current needs a complete closed loop from the battery (+) back to (-) to flow.";
  } else {
    adaptiveTip = "🌟 Challenge: You are doing great! Try to complete the circuit with no extra helper hints.";
  }

  return {
    recommendedLesson,
    recommendedChallenge,
    hintLevel,
    difficultyLevel,
    adaptiveTip
  };
}

export { SYLLABUS };

