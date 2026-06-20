/**
 * LOGICLEAP AI - Logical Reasoning & Problem Solving Engine
 * Domain: Logic puzzles, pattern recognition, memory games, and reasoning tasks.
 */

// Grade-wise syllabus definitions for LogicLeap
export const LOGIC_SYLLABUS = {
  'KG': [
    { id: 'kg-shapes', name: 'Shape Matching', desc: 'Identify geometric symbols and matching emojis.' },
    { id: 'kg-colors', name: 'Color Patterns', desc: 'Complete simple color sequences.' },
    { id: 'kg-memory', name: 'Emoji Memory', desc: 'Recall a sequence of emojis in order.' },
    { id: 'kg-odd-out', name: 'Odd One Out', desc: 'Spot the element that does not belong.' }
  ],
  'Grade 1': [
    { id: 'g1-patterns', name: 'Pattern Continuation', desc: 'Continue direction and rotation sequences.' },
    { id: 'g1-riddles', name: 'Basic Puzzles', desc: 'Solve kid-friendly descriptive logic riddles.' },
    { id: 'g1-sequence', name: 'Sequence Ordering', desc: 'Sort daily events in logical order.' },
    { id: 'g1-matching', name: 'Memory Match Card', desc: 'Identify matching pairs of objects.' }
  ],
  'Grade 2': [
    { id: 'g2-symbol-patterns', name: 'Symbol Patterns', desc: 'Solve repeating and progressive symbol sequences.' },
    { id: 'g2-sorting', name: 'Logical Sorting', desc: 'Sort objects by logical size, weight, or class.' },
    { id: 'g2-directions', name: 'Direction Games', desc: 'Navigate virtual grids using spatial directions.' },
    { id: 'g2-reasoning', name: 'Simple Puzzles', desc: 'Single-step deduction and sorting puzzles.' }
  ],
  'Grade 3': [
    { id: 'g3-complex-patterns', name: 'Complex Patterns', desc: 'Continue multi-characteristic sequences.' },
    { id: 'g3-missing-number', name: 'Missing Symbols', desc: 'Identify missing elements inside grids or circles.' },
    { id: 'g3-grid-logic', name: 'Grid Logic Puzzles', desc: 'Match attributes using deduction grids.' },
    { id: 'g3-multi-step', name: 'Multi-Step Comparison', desc: 'Deduce ordering based on comparison constraints.' }
  ],
  'Grade 4': [
    { id: 'g4-adv-puzzles', name: 'Advanced Riddles', desc: 'Solve complex spatial and strategy riddles.' },
    { id: 'g4-deduction', name: 'Logical Deduction', desc: 'Solve truth-teller / liar deduction puzzles.' },
    { id: 'g4-strategy', name: 'Strategy Games', desc: 'Reason through win-state scenarios and puzzle trees.' },
    { id: 'g4-analytical', name: 'Analytical Reasoning', desc: 'Solve complex constraint ordering challenges.' }
  ]
};

// Seed logic challenge templates for dynamic generation
const CHALLENGE_TEMPLATES = {
  'KG': [
    {
      type: 'odd-out',
      topic: 'kg-odd-out',
      generate: () => {
        const sets = [
          { items: ['🍎', '🍌', '🍇', '🥕'], odd: '🥕', category: 'fruits', oddCategory: 'vegetable', reason: 'Carrot is a vegetable, while apples, bananas, and grapes are fruits!' },
          { items: ['🐶', '🐱', '🦁', '🚗'], odd: '🚗', category: 'animals', oddCategory: 'vehicle', reason: 'Car is a vehicle, while dog, cat, and lion are animals!' },
          { items: ['⚽', '🏀', '🏈', '🍕'], odd: '🍕', category: 'sports balls', oddCategory: 'food', reason: 'Pizza is food, while soccer, basket, and footballs are sports equipment!' },
          { items: ['✈️', '🚁', '🚀', '🐟'], odd: '🐟', category: 'flying objects', oddCategory: 'sea creature', reason: 'Fish swims in water, while airplanes, helicopters, and rockets fly in the sky!' }
        ];
        const selected = sets[Math.floor(Math.random() * sets.length)];
        const shuffledOptions = [...selected.items].sort(() => Math.random() - 0.5);
        return {
          questionText: `Which one is the ODD one out? ${selected.items.join(' ')}`,
          options: shuffledOptions,
          correctAnswer: selected.odd,
          explanation: selected.reason,
          stepByStep: `1. Look at each item: ${selected.items.join(', ')}.\n2. Notice what three of them have in common: they are all ${selected.category}.\n3. The remaining one (${selected.odd}) is a ${selected.oddCategory}, so it does not belong!`,
          hint1: "Look closely at the categories of these items.",
          hint2: `Three of these belong in a group of ${selected.category}.`,
          hint3: `One of these is actually a ${selected.oddCategory}!`,
          hint4: `The odd one out is ${selected.odd}!`,
          realLifeConnection: "Just like sorting toys! You put blocks with blocks and cars with cars."
        };
      }
    },
    {
      type: 'colors',
      topic: 'kg-colors',
      generate: () => {
        const patterns = [
          { sequence: ['🔴', '🔵', '🔴', '🔵'], next: '🔴', clue: 'red follows blue' },
          { sequence: ['🟡', '🟢', '🟡', '🟢'], next: '🟡', clue: 'yellow follows green' },
          { sequence: ['🟧', '🟧', '🟦', '🟧', '🟧'], next: '🟦', clue: 'blue follows two oranges' },
          { sequence: ['💜', '💛', '💜', '💛'], next: '💜', clue: 'purple follows yellow' }
        ];
        const selected = patterns[Math.floor(Math.random() * patterns.length)];
        const options = ['🔴', '🔵', '🟡', '🟢', '🟧', '🟦', '💜', '💛'].filter(e => e !== selected.next).slice(0, 2);
        options.push(selected.next);
        const shuffledOptions = options.sort(() => Math.random() - 0.5);

        return {
          questionText: `Complete the pattern sequence: ${selected.sequence.join(' ')} [ ? ]`,
          options: shuffledOptions,
          correctAnswer: selected.next,
          explanation: `The sequence repeats. After ${selected.sequence[selected.sequence.length - 1]}, the pattern tells us that ${selected.clue}.`,
          stepByStep: `1. Read the emojis aloud: ${selected.sequence.join(', ')}.\n2. Look at the repeating group.\n3. Decide which emoji comes next based on the repeat rule.`,
          hint1: "Look at the order of the colors.",
          hint2: `Notice what color follows ${selected.sequence[selected.sequence.length - 1]}.`,
          hint3: `The pattern says: ${selected.clue}.`,
          hint4: `The next emoji is ${selected.next}!`,
          realLifeConnection: "Like stripes on a shirt (red, blue, red, blue, red...)."
        };
      }
    }
  ],
  'Grade 1': [
    {
      type: 'patterns',
      topic: 'g1-patterns',
      generate: () => {
        const directions = [
          { seq: ['⬆️', '➡️', '⬇️'], next: '⬅️', desc: 'clockwise rotation (Up, Right, Down, Left)' },
          { seq: ['⬅️', '⬇️', '➡️'], next: '⬆️', desc: 'counter-clockwise rotation (Left, Down, Right, Up)' },
          { seq: ['↗️', '↘️', '↗️'], next: '↘️', desc: 'diagonal alternating pattern (Up-Right, Down-Right)' },
          { seq: ['🔼', '🔽', '🔼'], next: '🔽', desc: 'vertical alternating pattern (Up, Down)' }
        ];
        const selected = directions[Math.floor(Math.random() * directions.length)];
        const distractors = ['⬆️', '➡️', '⬇️', '⬅️', '↗️', '↘️', '🔼', '🔽'].filter(d => d !== selected.next).slice(0, 2);
        distractors.push(selected.next);
        const shuffledOptions = distractors.sort(() => Math.random() - 0.5);

        return {
          questionText: `What arrow comes next in the sequence? ${selected.seq.join(' ')} [ ? ]`,
          options: shuffledOptions,
          correctAnswer: selected.next,
          explanation: `This pattern represents a ${selected.desc}.`,
          stepByStep: `1. Trace the direction of each arrow.\n2. Notice how it changes from step to step.\n3. Follow that rotation or alternation to find the next arrow.`,
          hint1: "Look at the direction the arrow is pointing.",
          hint2: `This is a ${selected.desc.split(' ')[0]} movement.`,
          hint3: `After pointing ${selected.seq[selected.seq.length - 1]}, it should point ${selected.next === '⬅️' ? 'Left' : selected.next === '⬆️' ? 'Up' : selected.next === '🔽' ? 'Down' : 'Down-Right'}.`,
          hint4: `The next arrow is ${selected.next}!`,
          realLifeConnection: "Like the hands of a clock spinning clockwise, or a weather vane spinning in the wind!"
        };
      }
    },
    {
      type: 'riddles',
      topic: 'g1-riddles',
      generate: () => {
        const riddles = [
          { q: "I have a face and two hands, but no arms or legs. What am I?", ans: "Clock ⏰", options: ["Clock ⏰", "Robot 🤖", "Mirror 🪞"], explanation: "A clock has a round dial called a 'face' and two pointers called hour and minute 'hands'!" },
          { q: "I get wetter the more I dry. What am I?", ans: "Towel 🧴", options: ["Towel 🧴", "Water 💧", "Sponge 🧽"], explanation: "A towel absorbs moisture from your body to dry you, making itself wetter!" },
          { q: "What has to be broken before you can use it?", ans: "Egg 🥚", options: ["Egg 🥚", "Coconut 🥥", "Lock 🔒"], explanation: "You must crack or break an egg shell to cook or bake with it!" },
          { q: "I have wings, but I am not an animal. I carry people high in the sky. What am I?", ans: "Airplane ✈️", options: ["Airplane ✈️", "Kite 🪁", "Eagle 🦅"], explanation: "An airplane has metal wings to fly and carry passengers across long distances!" }
        ];
        const selected = riddles[Math.floor(Math.random() * riddles.length)];
        return {
          questionText: selected.q,
          options: [...selected.options].sort(() => Math.random() - 0.5),
          correctAnswer: selected.ans,
          explanation: selected.explanation,
          stepByStep: `1. Think about the clues in the riddle.\n2. Test each option against the clues.\n3. The only item that matches all conditions is the ${selected.ans}.`,
          hint1: "Read the clues carefully.",
          hint2: "It is an object you can find at home or school.",
          hint3: `It starts with the letter '${selected.ans[0]}'.`,
          hint4: `The answer is ${selected.ans}!`,
          realLifeConnection: "Puzzles like this help our brains think about objects in creative ways!"
        };
      }
    }
  ],
  'Grade 2': [
    {
      type: 'sorting',
      topic: 'g2-sorting',
      generate: () => {
        const items = [
          { q: "Sort these animals by size from SMALLEST to LARGEST:", order: "Ant 🐜, Dog 🐶, Elephant 🐘", options: ["Ant 🐜, Dog 🐶, Elephant 🐘", "Dog 🐶, Ant 🐜, Elephant 🐘", "Elephant 🐘, Dog 🐶, Ant 🐜"], explanation: "An ant is tiny, a dog is medium-sized, and an elephant is huge!" },
          { q: "Sort these items by weight from HEAVIEST to LIGHTEST:", order: "Anchor ⚓, Bicycle 🚲, Feather 🪶", options: ["Anchor ⚓, Bicycle 🚲, Feather 🪶", "Bicycle 🚲, Anchor ⚓, Feather 🪶", "Feather 🪶, Bicycle 🚲, Anchor ⚓"], explanation: "An iron anchor is heaviest, a bicycle is medium-weight, and a feather is extremely light!" }
        ];
        const selected = items[Math.floor(Math.random() * items.length)];
        return {
          questionText: selected.q,
          options: selected.options,
          correctAnswer: selected.order,
          explanation: selected.explanation,
          stepByStep: `1. Compare the physical size/weight of each object.\n2. Arrange them in the requested order.\n3. Check your arrangement against the options.`,
          hint1: "Pay attention to the sorting direction (smallest-to-largest or heaviest-to-lightest).",
          hint2: "Compare the items two at a time.",
          hint3: `The first item in the sequence must be the ${selected.order.split(', ')[0]}.`,
          hint4: `The correct order is: ${selected.order}`,
          realLifeConnection: "Like sorting groceries! Putting heavy juice cartons at the bottom of the bag, and light bread at the top."
        };
      }
    },
    {
      type: 'directions',
      topic: 'g2-directions',
      generate: () => {
        const directions = [
          { start: [0, 0], steps: ['Right 2', 'Down 1'], end: [2, 1], gridDesc: "Start at top-left corner (0,0). Move right 2 boxes, then down 1 box. Where are you?" },
          { start: [1, 1], steps: ['Left 1', 'Up 1'], end: [0, 0], gridDesc: "Start at center (1,1). Move left 1 box, then up 1 box. Where are you?" },
          { start: [0, 2], steps: ['Right 1', 'Up 2'], end: [1, 0], gridDesc: "Start at bottom-left corner (0,2). Move right 1 box, then up 2 boxes. Where are you?" }
        ];
        const selected = directions[Math.floor(Math.random() * directions.length)];
        const correctStr = `(${selected.end[0]}, ${selected.end[1]})`;
        const distractors = [
          `(${selected.end[0] + 1}, ${selected.end[1]})`,
          `(${selected.end[0]}, ${Math.max(0, selected.end[1] - 1)})`
        ].filter(d => d !== correctStr);
        distractors.push(correctStr);

        return {
          questionText: selected.gridDesc,
          options: distractors.sort(() => Math.random() - 0.5),
          correctAnswer: correctStr,
          explanation: `Starting at (${selected.start[0]}, ${selected.start[1]}), moving ${selected.steps[0]} changes the X-coordinate, and moving ${selected.steps[1]} changes the Y-coordinate. You end up at (${selected.end[0]}, ${selected.end[1]}).`,
          stepByStep: `1. Draw a grid or imagine coordinates: X is horizontal, Y is vertical.\n2. Start at (${selected.start[0]}, ${selected.start[1]}).\n3. Execute step 1 (${selected.steps[0]}) -> new position.\n4. Execute step 2 (${selected.steps[1]}) -> final position ${correctStr}.`,
          hint1: "Right increases X, Left decreases X. Down increases Y, Up decreases Y.",
          hint2: `After the first move (${selected.steps[0]}), your coordinates are (${selected.steps[0].includes('Right') ? selected.start[0] + 2 : selected.start[0] - 1}, ${selected.start[1]}).`,
          hint3: `Now make the vertical move: ${selected.steps[1]}.`,
          hint4: `The final position is ${correctStr}!`,
          realLifeConnection: "Just like reading a map or navigating a robot on a grid board!"
        };
      }
    }
  ],
  'Grade 3': [
    {
      type: 'multi-step',
      topic: 'g3-multi-step',
      generate: () => {
        const scenarios = [
          { story: "Alice is taller than Bob. Bob is taller than Charlie. Who is the tallest?", ans: "Alice", options: ["Alice", "Bob", "Charlie"], explanation: "Since Alice is taller than Bob, and Bob is taller than Charlie, Alice is tallest." },
          { story: "Leo is faster than Sammy. Leo is slower than Clara. Who is the fastest runner?", ans: "Clara", options: ["Clara", "Leo", "Sammy"], explanation: "Clara is faster than Leo, who is faster than Sammy. So Clara is fastest." }
        ];
        const selected = scenarios[Math.floor(Math.random() * scenarios.length)];
        return {
          questionText: selected.story,
          options: selected.options,
          correctAnswer: selected.ans,
          explanation: selected.explanation,
          stepByStep: `1. Write down the relationships: e.g. A > B, and B > C.\n2. Connect them together: A > B > C.\n3. Read the order to answer who is tallest or fastest.`,
          hint1: "Draw line segments representing their heights or speeds.",
          hint2: "Identify who is in the middle of the order.",
          hint3: `The person in the middle is ${selected.options.find(o => o !== selected.ans && o !== 'Sammy' && o !== 'Charlie')}.`,
          hint4: `The winner is ${selected.ans}!`,
          realLifeConnection: "Line up sequences occur daily, like waiting in lines at the lunchroom or comparing toy weights!"
        };
      }
    },
    {
      type: 'missing-symbol',
      topic: 'g3-missing-number',
      generate: () => {
        const grids = [
          { pattern: "Circle, Square, Triangle | Square, Triangle, Circle | Triangle, Circle, [ ? ]", ans: "Square", options: ["Square", "Circle", "Triangle"], explanation: "Each row contains exactly one Circle, one Square, and one Triangle. The third row needs a Square to be complete!" },
          { pattern: "Red, Yellow, Blue | Yellow, Blue, Red | Blue, Red, [ ? ]", ans: "Yellow", options: ["Yellow", "Red", "Blue"], explanation: "Each group has Red, Yellow, and Blue. The last group is missing Yellow!" }
        ];
        const selected = grids[Math.floor(Math.random() * grids.length)];
        return {
          questionText: `Complete the grid sequence: ${selected.pattern}`,
          options: selected.options,
          correctAnswer: selected.ans,
          explanation: selected.explanation,
          stepByStep: `1. Group the sequence into three blocks divided by the '|' lines.\n2. Compare what elements appear in each block.\n3. The missing item is the one that appears in the first two blocks but is missing in the third.`,
          hint1: "Look at the blocks separately.",
          hint2: "Each block contains the same set of three elements in a rotated order.",
          hint3: "Which shape/color is missing from the last group?",
          hint4: `The missing element is ${selected.ans}!`,
          realLifeConnection: "Sudoku puzzles work this way! You can't repeat items in rows or columns."
        };
      }
    }
  ],
  'Grade 4': [
    {
      type: 'deduction',
      topic: 'g4-deduction',
      generate: () => {
        const scenarios = [
          {
            situation: "A treasure is hidden in Box A or Box B. Box A says: 'The treasure is not here.' Box B says: 'The treasure is in Box A.' Only one statement is TRUE. Where is the treasure?",
            ans: "Box B",
            options: ["Box A", "Box B", "Neither"],
            explanation: "If the treasure is in Box A, then Box A's statement is false, and Box B's is true (only 1 true, fits!). If the treasure is in Box B, then Box A's statement is true, and Box B's is false (only 1 true, fits!). Wait, let's re-verify: If gold is in A, A says 'not here' (False), B says 'in A' (True) -> 1 True. If gold is in B, A says 'not here' (True), B says 'in A' (False) -> 1 True. Ah! Let's make it simpler and unambiguous: Box A says 'The gold is in Box B.' Box B says 'The gold is in Box B.' If only one statement is true, where is it? Wait, let's write a classic deduction puzzle: Box A says: 'The treasure is not here.' Box B says: 'Box A is telling the truth.' If Box B is LYING, where is the treasure?",
            resolvedSituation: "A treasure is hidden in Box A or Box B. Box A says: 'The treasure is not in Box A.' Box B says: 'Box A is telling the truth.' If Box B is LYING (making his statement FALSE), where is the treasure?",
            resolvedAns: "Box A",
            resolvedOptions: ["Box A", "Box B"],
            resolvedExplanation: "If Box B is lying, then Box A's statement must be false. Box A says 'The treasure is not in Box A.' For this to be false, the treasure MUST be in Box A!",
            resolvedStep: "1. Assume Box B is lying -> Box A is NOT telling the truth (A is lying).\n2. Look at Box A's statement: 'Treasure is not in Box A.'\n3. Since A is lying, the opposite is true: The treasure is in Box A!"
          }
        ];
        const selected = scenarios[0];
        return {
          questionText: selected.resolvedSituation,
          options: selected.resolvedOptions,
          correctAnswer: selected.resolvedAns,
          explanation: selected.resolvedExplanation,
          stepByStep: selected.resolvedStep,
          hint1: "Start with Box B. If Box B is lying, what does it mean for Box A?",
          hint2: "It means Box A's statement is false.",
          hint3: "If Box A saying 'not in Box A' is false, then the treasure must be there.",
          hint4: `The treasure is in ${selected.resolvedAns}!`,
          realLifeConnection: "Like decoding clues in mystery games or forensic science logic!"
        };
      }
    },
    {
      type: 'analytical',
      topic: 'g4-analytical',
      generate: () => {
        return {
          questionText: "Five colored flags are in a row: Red, Blue, Green, Yellow, and Purple. The Red flag is first. The Green flag is next to the Red flag. The Yellow flag is last. If the Purple flag is immediately before the Yellow flag, what color is the flag in the MIDDLE (3rd position)?",
          options: ["Blue", "Green", "Purple"],
          correctAnswer: "Blue",
          explanation: "Let's list the positions 1 to 5:\n1: Red (Red is first)\n2: Green (Green is next to Red)\n5: Yellow (Yellow is last)\n4: Purple (Purple is immediately before Yellow)\nThis leaves position 3 for the Blue flag! Thus, Blue is in the middle.",
          stepByStep: "1. Write down positions: _ _ _ _ _.\n2. Place Red: Red _ _ _ _.\n3. Place Green: Red Green _ _ _.\n4. Place Yellow: Red Green _ _ Yellow.\n5. Place Purple: Red Green _ Purple Yellow.\n6. The empty slot in the middle (3) must be Blue.",
          hint1: "Draw five slots on a paper: 1, 2, 3, 4, 5.",
          hint2: "Place Red at 1, Green at 2, and Yellow at 5.",
          hint3: "Purple is at 4 because it is right before Yellow (5). That leaves Blue at 3.",
          hint4: "The middle flag is Blue!",
          realLifeConnection: "Just like lining up cars in a parking lot or placing books on a shelf according to size and color!"
        };
      }
    }
  ]
};

// --- DOMAIN CHECK HELPER ---
const EXCLUDED_KEYWORDS = [
  'solve', 'equation', 'calculate', 'fraction', 'decimal', 'addition', 'subtraction', 'multiplication',
  'division', 'algebra', 'geometry', 'resistor', 'voltmeter', 'diode', 'circuit', 'switch', 'battery', 'bulb',
  'spell', 'noun', 'verb', 'grammar', 'english', 'run', 'jump', 'stretch', 'exercise', 'physical', 'fitfriend',
  'plus', 'minus', 'multiplied', 'divided', 'sum', 'math', 'mathmentor', 'sparky'
];

export function checkMathQueryDomain(message) {
  const q = message.toLowerCase();
  
  // LogicLeap checks if query contains strictly math drilling, stem circuits, English or physical activity.
  // Puzzles, shape games, memory and riddles are allowed.
  const hasExcluded = EXCLUDED_KEYWORDS.some(kw => q.includes(kw));
  
  // Exclude simple digits calculation queries like "2+2", "5*4"
  const isCalcQuery = /^[0-9+\-*/()\s=]+$/.test(q) || /\d+\s*[\+\-\*\/]\s*\d+/.test(q);
  
  if (hasExcluded || isCalcQuery) {
    // Check if the query is a pattern request, which is allowed
    if (q.includes('pattern') || q.includes('sequence') || q.includes('riddle') || q.includes('puzzle') || q.includes('logic')) {
      return true; // Overruled, patterns and logic puzzles are allowed
    }
    return false; // Out of domain
  }
  return true;
}

// Format logic response helper
function formatLogicResponse(problemStatement, stepByStepReasoning, hint, finalAnswer, logicExplanation, encouragement) {
  return {
    reply: {
      problemStatement,
      stepByStepReasoning,
      hint,
      finalAnswer,
      logicExplanation,
      encouragement
    },
    mood: 'happy'
  };
}

// 1. CHATBOT QUERY PROCESSOR
export function processLogicQuery({ message, grade }) {
  const q = message.toLowerCase();

  // Guard domain check
  if (!checkMathQueryDomain(q)) {
    return formatLogicResponse(
      "Let’s focus on your logic challenge 🧠",
      "I am LogicLeap AI, your dedicated logical reasoning coach. I can only guide you through logic puzzles, pattern recognition challenges, and cognitive memory games.",
      "Try asking a logic question like 'tell me a riddle' or 'how do pattern sequences work?'",
      "Focus on logic!",
      "I do not teach mathematics calculations, English lessons, or STEM circuit simulations.",
      "I am ready to help you train your brain! 🧠"
    );
  }

  // Answer basic logic FAQs
  if (q.includes('pattern') || q.includes('sequence')) {
    return formatLogicResponse(
      "How do we solve pattern sequences? 🔴🔵🔴🔵...",
      "1. Find the repeating block of elements.\n2. Look at what changes (color, direction, or shape).\n3. Re-apply the rule to find the missing item.",
      "Think of stripes on a candy cane or animal tracks repeating in the sand.",
      "Identify the repeat block and continue!",
      "Pattern recognition trains spatial reasoning and structural memory.",
      "You are doing great! Try a sequence challenge in Game mode!"
    );
  }

  if (q.includes('riddle') || q.includes('puzzle')) {
    return formatLogicResponse(
      "How can we solve logic riddles?",
      "1. Break down the clues one by one.\n2. Draw a diagram or list candidates.\n3. Eliminate items that contradict the clues.",
      "Riddles often play with dual meanings or simple physical characteristics.",
      "Eliminate what doesn't fit!",
      "Logical deduction helps narrow down choices and identify absolute truth states.",
      "Keep practicing your logic brainpower!"
    );
  }

  if (q.includes('memory') || q.includes('match')) {
    return formatLogicResponse(
      "How do memory games work?",
      "1. Study the initial sequence of symbols carefully.\n2. Associate emojis with a story or sound.\n3. Recall them in order or select matching pairs.",
      "Try naming the emojis aloud to lock them in your short-term memory.",
      "Recall and match!",
      "Memory challenges train your working memory and visual recall index.",
      "Unlock the Brain Hero badge in Memory Mode!"
    );
  }

  // Fallback response for logic queries
  return formatLogicResponse(
    `Welcome! I am **LogicLeap AI**, your logic and reasoning coach 🧠. I can guide you through logic riddles, pattern matching, and working memory games!`,
    `Tell me what you would like to explore. We have grade-wise puzzles:\n- KG: Shapes & Colors\n- Grade 1: Emojis & Riddles\n- Grade 2: Grid directions & Sorting\n- Grade 3: Attribute grids & Comparisons\n- Grade 4: Truth tables & Constraint ordering`,
    `Ask me a question like "how do patterns work?" or "tell me a riddle".`,
    "Let's leap into logic!",
    "Reasoning and strategy thinking are key blocks for cognitive development.",
    "Ready to test your puzzle-solving skills? Let's go!"
  );
}

// 2. DYNAMIC SESSION GENERATOR
export function generateLogicChallengeSet({
  grade,
  performanceScore = 80,
  mistakeHistory = [],
  responseTime = 12,
  difficultyPreference = 'standard',
  cognitiveStrengths = []
}) {
  const studentGrade = grade || 'KG';
  
  // Select challenge templates for the student's grade
  const templates = CHALLENGE_TEMPLATES[studentGrade] || CHALLENGE_TEMPLATES['KG'];
  
  // Set difficulty configuration based on performance score
  let difficultyLevel = 'Standard';
  let hintLevel = 1;
  let rewardPoints = 5;

  if (performanceScore >= 90) {
    difficultyLevel = 'Advanced';
    hintLevel = 1;
    rewardPoints = 8;
  } else if (performanceScore < 60) {
    difficultyLevel = 'Easy';
    hintLevel = 2; // Provide slightly direct hints
    rewardPoints = 4;
  }

  // Construct challenge set (minimum of 5 questions)
  const questionSet = [];
  
  // Dynamic generation loop
  for (let i = 0; i < 5; i++) {
    // Cycle through templates
    const templateIdx = i % templates.length;
    const challengeObj = templates[templateIdx].generate();
    
    questionSet.push({
      id: `logic-q-${studentGrade.toLowerCase().replace(' ', '')}-${Date.now()}-${i}`,
      type: templates[templateIdx].type,
      topicId: templates[templateIdx].topic,
      ...challengeObj
    });
  }

  // Learning path recommendation
  const pathMap = {
    'KG': 'Color Patterns & Shape Matching',
    'Grade 1': 'Sequencing & Card Matching',
    'Grade 2': 'Grid Directions & Attribute Sorting',
    'Grade 3': 'Attribute Grids & Multi-Step Deductions',
    'Grade 4': 'Constraint Puzzles & Winning Strategies'
  };

  return {
    difficultyLevel,
    hintLevel,
    rewardPoints,
    recommendedGame: studentGrade === 'KG' ? 'Shape Matching' : studentGrade === 'Grade 1' ? 'Pattern Matcher' : 'Logic Detective',
    expectedTime: studentGrade === 'KG' ? 60 : 90,
    nextStepPath: pathMap[studentGrade] || 'Logical Deduction',
    questionSet
  };
}

// 3. ANSWER EVALUATOR
export function analyzeLogicSubmission({
  challengeObj,
  answer,
  timeTaken = 10,
  attemptCount = 1
}) {
  const isCorrect = String(answer).trim().toLowerCase() === String(challengeObj.correctAnswer).trim().toLowerCase();
  
  // Level-based hints progression
  let hintLevel = 1;
  if (attemptCount === 2) hintLevel = 2;
  if (attemptCount === 3) hintLevel = 3;
  if (attemptCount > 3) hintLevel = 4;

  // Star calculations: +5 for correct
  const earnedStars = isCorrect ? 5 : 0;

  return {
    isCorrect,
    attemptCount,
    hintLevel,
    earnedStars
  };
}
