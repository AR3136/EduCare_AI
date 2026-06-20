/**
 * MATHMENTOR AI - Mathematics Intelligence Engine
 * Role: AI-powered adaptive math learning tutor & personalization system
 */

// Grade-wise topics and syllabus definitions
export const MATH_SYLLABUS = {
  'KG': [
    { id: 'kg-counting', name: 'Counting Objects', desc: 'Count items up to 50 with visual aids.' },
    { id: 'kg-shapes', name: 'Identifying Shapes', desc: 'Recognize circles, squares, triangles, and stars.' },
    { id: 'kg-addition', name: 'Simple Addition', desc: 'Basic addition within 10 using objects.' }
  ],
  'Grade 1': [
    { id: 'g1-numbers', name: 'Numbers 1-100', desc: 'Understanding place value and number lines.' },
    { id: 'g1-ops', name: 'Addition & Subtraction', desc: 'Adding and subtracting within 20.' },
    { id: 'g1-word-probs', name: 'Basic Word Problems', desc: 'Solving single-step word stories.' }
  ],
  'Grade 2': [
    { id: 'g2-multi-basics', name: 'Multiplication Basics', desc: 'Equal groups and repeated addition.' },
    { id: 'g2-div-basics', name: 'Division Basics', desc: 'Sharing equally among groups.' },
    { id: 'g2-time', name: 'Time & Calendar', desc: 'Reading analog clocks and calendar months.' }
  ],
  'Grade 3': [
    { id: 'g3-tables', name: 'Multiplication Tables', desc: 'Mastering tables 1 through 10.' },
    { id: 'g3-fractions', name: 'Fractions', desc: 'Parts of a whole and visual fraction bars.' },
    { id: 'g3-measurement', name: 'Length & Weight', desc: 'Measuring objects in centimeters and grams.' }
  ],
  'Grade 4': [
    { id: 'g4-decimals', name: 'Decimals', desc: 'Relating tenths and hundredths to fractions.' },
    { id: 'g4-geometry', name: 'Geometry Basics', desc: 'Identifying lines, angles, and symmetry.' },
    { id: 'g4-logic-probs', name: 'Logic Word Problems', desc: 'Solving multi-step reasoning puzzles.' }
  ]
};

// Seeding standard question templates for dynamic generation
const QUESTION_TEMPLATES = {
  'KG': [
    {
      type: 'count',
      topic: 'kg-counting',
      emoji: '🍎',
      generate: () => {
        const count = Math.floor(Math.random() * 8) + 2;
        return {
          questionText: `Count the objects: How many apples are there? ${'🍎'.repeat(count)}`,
          options: [String(count), String(count + 1), String(count - 1)],
          correctAnswer: String(count),
          explanation: `Let's count them one by one: ${Array.from({ length: count }, (_, i) => i + 1).join(', ')}. That makes a total of ${count}.`,
          stepByStep: `1. Look at each apple.\n2. Count out loud as you point: "1, 2, 3..."\n3. The last number you say is the final count.`,
          hint1: "Count each apple one by one.",
          hint2: "Start with 1, 2, 3...",
          hint3: `There are more than ${count - 1} but fewer than ${count + 1}.`,
          hint4: `The final count is exactly ${count} apples!`,
          realLifeConnection: "Just like counting apples in a grocery basket!"
        };
      }
    },
    {
      type: 'shape',
      topic: 'kg-shapes',
      emoji: '🔴',
      generate: () => {
        const shapes = [
          { name: 'Circle', emoji: '🔴', clue: 'round like a wheel' },
          { name: 'Square', emoji: '🟦', clue: 'four equal sides' },
          { name: 'Triangle', emoji: '🔺', clue: 'three sharp corners' },
          { name: 'Star', emoji: '⭐', clue: 'five shining points' }
        ];
        const target = shapes[Math.floor(Math.random() * shapes.length)];
        const distractors = shapes.filter(s => s.name !== target.name).map(s => s.name);
        return {
          questionText: `Look at the shape: ${target.emoji}. What shape is this?`,
          options: [target.name, distractors[0], distractors[1]],
          correctAnswer: target.name,
          explanation: `This shape is a ${target.name}. It is ${target.clue}.`,
          stepByStep: `1. Examine the visual shape ${target.emoji}.\n2. Remember, a ${target.name} is ${target.clue}.`,
          hint1: `This shape is ${target.clue}.`,
          hint2: `Count the sides or corners. It has ${target.name === 'Circle' ? '0' : target.name === 'Triangle' ? '3' : target.name === 'Square' ? '4' : '5'} points.`,
          hint3: `It starts with the letter '${target.name[0]}'.`,
          hint4: `This shape is a ${target.name}!`,
          realLifeConnection: `Just like a ${target.name === 'Circle' ? 'clock face or a coin' : target.name === 'Square' ? 'wooden toy block' : target.name === 'Triangle' ? 'slice of pizza' : 'twinkling star in the sky'}!`
        };
      }
    }
  ],
  'Grade 1': [
    {
      type: 'addition',
      topic: 'g1-ops',
      emoji: '➕',
      generate: () => {
        const a = Math.floor(Math.random() * 15) + 5;
        const b = Math.floor(Math.random() * 10) + 2;
        return {
          questionText: `Solve the equation: What is ${a} + ${b}?`,
          options: [String(a + b), String(a + b + 2), String(a + b - 1)],
          correctAnswer: String(a + b),
          explanation: `Adding ${b} to ${a} gives ${a + b}.`,
          stepByStep: `1. Start at ${a} on the number line.\n2. Count forward ${b} times: ${Array.from({ length: b }, (_, i) => a + i + 1).join(', ')}.\n3. You arrive at ${a + b}.`,
          hint1: "Try counting up from the larger number.",
          hint2: `Start at ${a} and count forward ${b} steps.`,
          hint3: `The sum is close to ${Math.round((a + b) / 10) * 10}.`,
          hint4: `Add ${a} and ${b} to get ${a + b}.`,
          realLifeConnection: `If you have ${a} toy cars and get ${b} more for your birthday, you will have ${a + b} cars.`
        };
      }
    },
    {
      type: 'word-prob',
      topic: 'g1-word-probs',
      emoji: '📝',
      generate: () => {
        const total = Math.floor(Math.random() * 12) + 8;
        const eaten = Math.floor(Math.random() * 5) + 2;
        return {
          questionText: `Sam has ${total} cookies 🍪. She eats ${eaten} cookies. How many cookies are left?`,
          options: [String(total - eaten), String(total - eaten + 3), String(total + eaten)],
          correctAnswer: String(total - eaten),
          explanation: `We start with ${total} cookies and subtract the ${eaten} eaten cookies: ${total} - ${eaten} = ${total - eaten}.`,
          stepByStep: `1. Identify the starting number: ${total}.\n2. Identify how many are taken away: ${eaten}.\n3. Subtract: ${total} minus ${eaten} equals ${total - eaten}.`,
          hint1: "Eating cookies means we subtract them.",
          hint2: `Calculate ${total} minus ${eaten}.`,
          hint3: `The answer is ${total - eaten}.`,
          hint4: `Subtracting ${eaten} from ${total} leaves ${total - eaten} cookies.`,
          realLifeConnection: "Use real pennies or buttons at home to act out eating cookies!"
        };
      }
    }
  ],
  'Grade 2': [
    {
      type: 'multi-basics',
      topic: 'g2-multi-basics',
      emoji: '✖️',
      generate: () => {
        const groups = Math.floor(Math.random() * 4) + 2;
        const size = Math.floor(Math.random() * 5) + 2;
        return {
          questionText: `What is ${groups} groups of ${size} items? (Or ${groups} x ${size})`,
          options: [String(groups * size), String(groups * size + size), String(groups * size - groups)],
          correctAnswer: String(groups * size),
          explanation: `${groups} groups of ${size} is equal to adding ${size} together ${groups} times: ${Array.from({ length: groups }, () => size).join(' + ')} = ${groups * size}.`,
          stepByStep: `1. Draw ${groups} circles representing groups.\n2. Put ${size} dots in each group.\n3. Count all dots combined: ${groups} times ${size} equals ${groups * size}.`,
          hint1: "Think of this as repeated addition.",
          hint2: `Add ${size} together ${groups} times.`,
          hint3: `The answer is between ${groups * size - 5} and ${groups * size + 5}.`,
          hint4: `${groups} times ${size} is exactly ${groups * size}.`,
          realLifeConnection: `If you buy ${groups} boxes of crayons, and each box has ${size} crayons, you get ${groups * size} crayons in total.`
        };
      }
    },
    {
      type: 'time',
      topic: 'g2-time',
      emoji: '⏰',
      generate: () => {
        const hour = Math.floor(Math.random() * 12) + 1;
        const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        const minStr = minutes === 0 ? '00' : String(minutes);
        return {
          questionText: `An analog clock has the hour hand pointing to ${hour} and the minute hand pointing to the number ${minutes / 5 === 0 ? 12 : minutes / 5}. What time is it?`,
          options: [`${hour}:${minStr}`, `${hour === 12 ? 1 : hour + 1}:${minStr}`, `${hour}:${minutes === 30 ? '00' : '30'}`],
          correctAnswer: `${hour}:${minStr}`,
          explanation: `The hour hand shows the hour (${hour}) and the minute hand shows the minutes (${minutes / 5} times 5 = ${minutes} minutes). So the time is ${hour}:${minStr}.`,
          stepByStep: `1. Look at the hour hand: it is at ${hour}.\n2. Look at the minute hand: each number represents 5 minutes. Multiplying by 5 gives ${minutes} minutes.\n3. Combine them to get ${hour}:${minStr}.`,
          hint1: "The minute hand counts by 5s around the clock face.",
          hint2: `Hour is ${hour}. Minute hand at ${minutes / 5 === 0 ? 12 : minutes / 5} means ${minutes} minutes.`,
          hint3: `It is ${minutes === 0 ? 'exactly ' + hour + " o'clock" : minutes + " minutes past " + hour}.`,
          hint4: `The clock reads ${hour}:${minStr}!`,
          realLifeConnection: "Clocks tell us when it is lunchtime (12:00) or bedtime!"
        };
      }
    }
  ],
  'Grade 3': [
    {
      type: 'fractions',
      topic: 'g3-fractions',
      emoji: '🍕',
      generate: () => {
        const totalSlices = [4, 6, 8][Math.floor(Math.random() * 3)];
        const eatenSlices = Math.floor(Math.random() * (totalSlices - 2)) + 1;
        return {
          questionText: `A pizza is sliced into ${totalSlices} equal pieces. You eat ${eatenSlices} pieces. What fraction of the pizza did you eat?`,
          options: [`${eatenSlices}/${totalSlices}`, `${totalSlices - eatenSlices}/${totalSlices}`, `1/${totalSlices}`],
          correctAnswer: `${eatenSlices}/${totalSlices}`,
          explanation: `The total parts is the denominator (${totalSlices}), and the parts eaten is the numerator (${eatenSlices}). Thus, the fraction is ${eatenSlices}/${totalSlices}.`,
          stepByStep: `1. The denominator (bottom) is the total pieces: ${totalSlices}.\n2. The numerator (top) is the eaten pieces: ${eatenSlices}.\n3. Write the fraction as Numerator / Denominator: ${eatenSlices}/${totalSlices}.`,
          hint1: "The fraction is written as (part eaten) / (total parts).",
          hint2: `Top number is ${eatenSlices}, bottom number is ${totalSlices}.`,
          hint3: `You ate ${eatenSlices} out of ${totalSlices} pieces.`,
          hint4: `The fraction eaten is ${eatenSlices}/${totalSlices}.`,
          realLifeConnection: "Fractions help us share cake or pizza fairly among friends!"
        };
      }
    },
    {
      type: 'measurement',
      topic: 'g3-measurement',
      emoji: '📏',
      generate: () => {
        const meters = Math.floor(Math.random() * 5) + 2;
        return {
          questionText: `A wooden table is ${meters} meters long. How many centimeters long is it? (1 meter = 100 centimeters)`,
          options: [String(meters * 100), String(meters * 10), String(meters * 1000)],
          correctAnswer: String(meters * 100),
          explanation: `Since 1 meter is equal to 100 centimeters, a length of ${meters} meters is ${meters} x 100 = ${meters * 100} centimeters.`,
          stepByStep: `1. Recall conversion factor: 1 meter = 100 centimeters.\n2. Multiply the number of meters (${meters}) by 100.\n3. ${meters} x 100 = ${meters * 100} centimeters.`,
          hint1: "Multiply the meters by 100.",
          hint2: `Multiply ${meters} times 100.`,
          hint3: `The number has two zeros at the end.`,
          hint4: `The answer is ${meters * 100} centimeters.`,
          realLifeConnection: "Meters measure larger lengths like hallways; centimeters measure smaller items like pencils!"
        };
      }
    }
  ],
  'Grade 4': [
    {
      type: 'decimals',
      topic: 'g4-decimals',
      emoji: '💵',
      generate: () => {
        const val1 = (Math.floor(Math.random() * 50) + 10) / 100;
        const val2 = (Math.floor(Math.random() * 40) + 10) / 100;
        const sum = (val1 + val2).toFixed(2);
        return {
          questionText: `You buy a pencil for $${val1} and an eraser for $${val2}. What is the total cost in decimals?`,
          options: [`$${sum}`, `$${(val1 + val2 + 0.1).toFixed(2)}`, `$${Math.abs(val1 - val2).toFixed(2)}`],
          correctAnswer: `$${sum}`,
          explanation: `Add the two values together aligning the decimal points: ${val1} + ${val2} = ${sum}.`,
          stepByStep: `1. Align the decimal points: \n   ${val1.toFixed(2)}\n+  ${val2.toFixed(2)}\n-------\n2. Add column-by-column from right to left.\n3. The result is ${sum}.`,
          hint1: "Add the amounts just like normal addition, aligning the decimal point.",
          hint2: `Add ${val1} and ${val2}.`,
          hint3: `The sum is between $0.20 and $1.00.`,
          hint4: `The total cost is $${sum}!`,
          realLifeConnection: "Using decimal values is how we calculate dollars and cents at store registers!"
        };
      }
    },
    {
      type: 'geometry',
      topic: 'g4-geometry',
      emoji: '📐',
      generate: () => {
        const shapes = [
          { name: 'Triangle', sides: 3, sum: 180 },
          { name: 'Rectangle', sides: 4, sum: 360 },
          { name: 'Pentagon', sides: 5, sum: 540 },
          { name: 'Hexagon', sides: 6, sum: 720 }
        ];
        const target = shapes[Math.floor(Math.random() * shapes.length)];
        return {
          questionText: `A geometric polygon has exactly ${target.sides} straight sides. What is the name of this shape?`,
          options: [target.name, target.name === 'Triangle' ? 'Square' : 'Triangle', target.name === 'Hexagon' ? 'Pentagon' : 'Hexagon'],
          correctAnswer: target.name,
          explanation: `A polygon with ${target.sides} sides is called a ${target.name}.`,
          stepByStep: `1. Count the number of straight sides: ${target.sides}.\n2. Remember shape prefixes: Tri=3, Quad=4, Penta=5, Hexa=6.\n3. Therefore, the shape is a ${target.name}.`,
          hint1: "Look at the number of sides.",
          hint2: `Which shape has exactly ${target.sides} sides?`,
          hint3: `It starts with the letter '${target.name[0]}'.`,
          hint4: `A polygon with ${target.sides} sides is a ${target.name}.`,
          realLifeConnection: "Stop signs are octagons (8 sides) and honeycomb cells are hexagons (6 sides)!"
        };
      }
    }
  ]
};

// Strict Topic Boundaries Check
export function checkMathQueryDomain(queryText) {
  const q = queryText.toLowerCase();
  
  // Forbidden non-math topics
  const forbiddenKeywords = [
    'english', 'grammar', 'spell', 'vocabulary', 'pronounce', 'read', 'write', 'adjective', 'noun', 'sentence',
    'circuit', 'led', 'resistor', 'battery', 'voltage', 'current', 'wire', 'switch', 'diode', 'short circuit',
    'physical activity', 'run', 'jump', 'stretch', 'yoga', 'simon says', 'exercise', 'fitfriend', 'workout',
    'history', 'geography', 'sports', 'weather', 'general knowledge', 'chat'
  ];

  // Specific check to see if the user is asking general open-ended conversational questions
  const generalGreetingKeywords = [
    'how is the weather', 'tell me a joke', 'what is your favorite', 'favorite color', 'who are you', 'how are you doing'
  ];

  // If keyword matches or query doesn't feel math-oriented (numbers, add, subtract, multiply, shapes, solve, calculate, fraction)
  const mathKeywords = [
    'math', 'mentor', 'solve', 'calculate', 'number', 'count', 'shape', 'addition', 'plus', 'add',
    'subtraction', 'minus', 'subtract', 'multiply', 'multiplication', 'divide', 'division', 'times', 'fraction',
    'decimal', 'geometry', 'angle', 'clock', 'time', 'logic', 'equation', 'sum', 'difference', 'product',
    'ratio', 'percent', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '=', '+', '-', '*', '/'
  ];

  const hasForbidden = forbiddenKeywords.some(word => q.includes(word));
  const hasGeneral = generalGreetingKeywords.some(word => q.includes(word));
  const hasMathContext = mathKeywords.some(word => q.includes(word));

  if (hasForbidden || hasGeneral || (!hasMathContext && q.length > 3)) {
    return false;
  }
  return true;
}

// Format Mathmentor AI responses following output criteria
export function formatMathResponse(explanation, stepByStep, hint, finalAnswer, encouragement) {
  return {
    reply: {
      explanation,
      stepByStep,
      hint,
      finalAnswer,
      encouragement
    },
    mood: 'happy'
  };
}

// 1. CHATBOT QUERY PROCESSOR
export function processMathQuery({ message, grade }) {
  const q = message.toLowerCase();

  // Guard domain check
  if (!checkMathQueryDomain(q)) {
    return formatMathResponse(
      "Let’s focus on your math learning 📊",
      "I am MathMentor AI, your dedicated mathematics tutor. I can only answer math questions, help you solve numerical puzzles, or explain geometry and calculation steps.",
      "Ask me a math question like 'What is a fraction?' or 'How do I add decimals?'",
      "Focus on math!",
      "I am ready to help you with numbers, equations, and math games! 🔢"
    );
  }

  // Answer basic math-related FAQs
  if (q.includes('fraction')) {
    return formatMathResponse(
      "A fraction represents a part of a whole! It consists of a numerator (top number) and a denominator (bottom number).",
      "1. Think of a pizza cut into 4 slices.\n2. If you take 1 slice, you have 1 out of 4 slices.\n3. We write this fraction as 1/4.",
      "The bottom number is the total parts, the top is how many parts you have.",
      "Fraction: Numerator / Denominator 🍕",
      "Fractions are super helpful when sharing treats with friends!"
    );
  }

  if (q.includes('decimal')) {
    return formatMathResponse(
      "Decimals are another way to write fractions or numbers that are between whole numbers. They use a decimal point (.).",
      "1. A value like $0.50 means 50 cents out of 100 (which is 1/2 of a dollar).\n2. Place value after the dot goes: Tenths, Hundredths, Thousandths.",
      "Just align the dot when adding decimals!",
      "Decimal: numbers containing a fractional point (.) 💵",
      "You use decimals every day when counting money!"
    );
  }

  if (q.includes('geometry') || q.includes('shape') || q.includes('polygon')) {
    return formatMathResponse(
      "Geometry is the study of shapes, sizes, and properties of space. A polygon is a flat shape with straight sides.",
      "1. 3 sides = Triangle\n2. 4 sides = Quad/Rectangle/Square\n3. 5 sides = Pentagon\n4. 6 sides = Hexagon",
      "Count the straight sides of any flat object.",
      "Geometry: Study of lines, shapes, and angles 📐",
      "Look around you - shapes are everywhere in your room!"
    );
  }

  if (q.includes('multiply') || q.includes('multiplication')) {
    return formatMathResponse(
      "Multiplication is like doing repeated addition. It tells you how many times to add a number to itself.",
      "1. 3 x 4 means adding the number 4 together 3 times: 4 + 4 + 4.\n2. 4 + 4 + 4 = 12.\n3. So, 3 x 4 = 12.",
      "Think of drawing groups of dots: 3 groups with 4 dots in each.",
      "Multiplication is repeated addition ✖️",
      "You are doing awesome learning your multiplication tables!"
    );
  }

  if (q.includes('divide') || q.includes('division')) {
    return formatMathResponse(
      "Division means sharing or splitting numbers into equal groups.",
      "1. If you have 6 candies and want to share them with 2 friends.\n2. Give 1 candy to each until you run out.\n3. Each friend gets exactly 3 candies. So, 6 / 2 = 3.",
      "Think of sharing cookies equally.",
      "Division is splitting into equal groups ➗",
      "Sharing equally is a great math skill to master!"
    );
  }

  // Fallback response for math queries
  return formatMathResponse(
    `Welcome! I am **MathMentor AI**, your math tutor 📊. I can explain math concepts, solve word problems, or guide you through Practice and Game modes!`,
    `Tell me what you are working on today! We support:\n- KG: Counting & Shapes\n- Grade 1: Addition & Subtraction\n- Grade 2: Clock & Multi basics\n- Grade 3: Fractions & Measurement\n- Grade 4: Decimals & Logic puzzles`,
    `You can type equations (e.g. "12 + 15" or "5 * 4") or ask "how do fractions work?".`,
    "Math is fun! 📐",
    "Let's explore numbers together! 🚀"
  );
}

// 2. ADAPTIVE PERSONALIZATION & QUESTION GENERATION ENGINE
export function generateMathQuestionSet({ grade, performanceScore = 80, mistakeHistory = [], weakTopics = [] }) {
  // Determine difficulty level based on performance score
  let difficultyLevel = 'standard';
  let hintLevel = 1;
  let rewardPoints = 5;

  if (performanceScore >= 90) {
    difficultyLevel = 'advanced';
    hintLevel = 1; // standard hint
    rewardPoints = 8;
  } else if (performanceScore < 50) {
    difficultyLevel = 'supportive';
    hintLevel = 3; // preloaded hints
    rewardPoints = 4;
  }

  // Select question templates by grade
  const templates = QUESTION_TEMPLATES[grade] || QUESTION_TEMPLATES['KG'];
  const questions = [];

  // Generate 5 questions dynamically
  for (let i = 0; i < 5; i++) {
    // Select template randomly
    const template = templates[Math.floor(Math.random() * templates.length)];
    const qObj = template.generate();
    
    // Inject ID and tracking properties
    qObj.id = `q-${grade.toLowerCase().replace(' ', '-')}-${i + 1}-${Date.now()}`;
    qObj.topicId = template.topic;
    qObj.difficulty = difficultyLevel;
    
    // Customize questionText/variables based on difficulty
    if (difficultyLevel === 'advanced') {
      // Slightly scale numbers if it's an equation or word problem
      if (qObj.questionText.includes('+')) {
        qObj.questionText = qObj.questionText.replace('Solve the equation:', '🚀 Advanced challenge: Solve');
      }
    } else if (difficultyLevel === 'supportive') {
      qObj.questionText = `🛡️ Helper Mode: ${qObj.questionText}`;
    }

    questions.push(qObj);
  }

  // Determine recommendedTopic based on weakTopics or grade default
  let recommendedTopic = MATH_SYLLABUS[grade]?.[0]?.name || 'Numbers';
  if (weakTopics.length > 0) {
    const weakTopicObj = MATH_SYLLABUS[grade]?.find(t => weakTopics.includes(t.id));
    if (weakTopicObj) recommendedTopic = weakTopicObj.name;
  }

  const nextStepLearningPath = MATH_SYLLABUS[grade]?.[1]?.name || 'Next Concept';

  return {
    recommendedTopic,
    difficultyLevel,
    questionSet: questions,
    hintLevel,
    nextStepLearningPath,
    rewardPoints
  };
}

// 3. ERROR LEARNING SYSTEM
export function analyzeAnswerSubmission({ questionObj, answer, timeTaken, attemptCount = 1 }) {
  const isCorrect = String(answer).trim().toLowerCase() === String(questionObj.correctAnswer).trim().toLowerCase();
  
  let hintLevel = 1;
  if (!isCorrect) {
    // Scale hints dynamically based on attempts
    if (attemptCount === 1) hintLevel = 2; // Step guide
    else if (attemptCount === 2) hintLevel = 3; // Partial solution
    else hintLevel = 4; // Full explanation
  }

  let earnedStars = 0;
  if (isCorrect) {
    earnedStars = 5; // standard correct answer reward
  }

  return {
    isCorrect,
    hintLevel,
    earnedStars,
    weakTopicTag: !isCorrect ? questionObj.topicId : null,
    suggestRevision: !isCorrect && attemptCount >= 2,
    timeTakenScore: timeTaken > 45 ? 'slow' : 'normal'
  };
}
