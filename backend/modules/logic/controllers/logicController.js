import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { 
  processLogicQuery, 
  generateLogicChallengeSet, 
  analyzeLogicSubmission 
} from '../services/logicEngine.js';
import { eventBus } from '../../../shared/eventBus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local DB Configuration
const DB_DIR = path.join(__dirname, '../../../data');
const DB_FILE = path.join(DB_DIR, 'logic.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const defaultProgress = {
  studentId: 'student_123',
  grade: 'KG',
  stars: 20,
  level: 1,
  badges: [],
  completedSessions: [],
  mistakeHistory: [],
  weakTopics: [],
  sessionCount: 0,
  totalQuestions: 0,
  correctQuestions: 0,
  readinessScore: 0
};

const readLocalDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return defaultProgress;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return defaultProgress;
  }
};

const writeLocalDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    return false;
  }
};

// --- CONTROLLER ACTIONS ---

/**
 * POST /logic/chat
 */
export const chatWithLogicMentor = async (req, res) => {
  const { studentId, message, grade } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing 'message' field." });
  }

  const studentGrade = grade || 'KG';
  
  // Publish Integration Hint Request Hook
  eventBus.publish('LOGIC_HINT_REQUESTED', { studentId: studentId || 'student_123', queryText: message });

  const result = processLogicQuery({ message, grade: studentGrade });
  
  res.json({
    success: true,
    ...result
  });
};

/**
 * GET /logic/progress
 */
export const getLogicProgress = async (req, res) => {
  const data = readLocalDB();
  res.json(data);
};

/**
 * POST /logic/progress
 */
export const updateLogicProgress = async (req, res) => {
  const data = readLocalDB();
  const { stars, badges, grade, level } = req.body;

  if (stars !== undefined) data.stars = stars;
  if (badges !== undefined) data.badges = badges;
  if (grade !== undefined) data.grade = grade;
  if (level !== undefined) data.level = level;

  writeLocalDB(data);
  res.json({ success: true, data });
};

/**
 * POST /logic/generate-session
 */
export const generateLogicSession = async (req, res) => {
  const { studentId, grade, mode } = req.body;
  const dbData = readLocalDB();

  const studentGrade = grade || dbData.grade || 'KG';
  
  // Calculate average performance score
  const totalQ = dbData.totalQuestions || 0;
  const correctQ = dbData.correctQuestions || 0;
  const performanceScore = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 80;

  // Generate question set using logic engine
  const sessionConfig = generateLogicChallengeSet({
    grade: studentGrade,
    performanceScore,
    mistakeHistory: dbData.mistakeHistory,
    weakTopics: dbData.weakTopics
  });

  // Save current active session questions in temporary store
  dbData.activeSession = {
    id: `session-logic-${Date.now()}`,
    mode: mode || 'practice',
    challenges: sessionConfig.questionSet,
    currentIndex: 0,
    answers: [],
    rewardPoints: sessionConfig.rewardPoints,
    startTime: new Date().toISOString()
  };
  writeLocalDB(dbData);

  // Publish Event
  eventBus.publish('LOGIC_SESSION_STARTED', {
    studentId: studentId || 'student_123',
    grade: studentGrade,
    mode: mode || 'practice',
    sessionId: dbData.activeSession.id
  });

  eventBus.publish('LOGIC_CHALLENGE_GENERATED', {
    studentId: studentId || 'student_123',
    sessionId: dbData.activeSession.id,
    challengeCount: sessionConfig.questionSet.length
  });

  res.json({
    success: true,
    sessionId: dbData.activeSession.id,
    recommendedGame: sessionConfig.recommendedGame,
    difficultyLevel: sessionConfig.difficultyLevel,
    hintLevel: sessionConfig.hintLevel,
    nextStepPath: sessionConfig.nextStepPath,
    challenges: sessionConfig.questionSet.map(c => ({
      id: c.id,
      questionText: c.questionText,
      options: c.options,
      topicId: c.topicId,
      realLifeConnection: c.realLifeConnection
    }))
  });
};

/**
 * POST /logic/submit-answer
 */
export const submitLogicAnswer = async (req, res) => {
  const { studentId, challengeId, answer, timeTaken, attemptCount } = req.body;
  const dbData = readLocalDB();

  if (!dbData.activeSession) {
    return res.status(400).json({ error: "No active logic session found. Generate a session first." });
  }

  // Find challenge inside active session
  const activeChallenges = dbData.activeSession.challenges;
  const cIdx = activeChallenges.findIndex(c => c.id === challengeId);
  if (cIdx === -1) {
    return res.status(404).json({ error: "Challenge not found in active session." });
  }

  const challengeObj = activeChallenges[cIdx];
  const evalResult = analyzeLogicSubmission({
    challengeObj,
    answer,
    timeTaken: timeTaken || 10,
    attemptCount: attemptCount || 1
  });

  // Log statistics
  dbData.totalQuestions = (dbData.totalQuestions || 0) + 1;
  if (evalResult.isCorrect) {
    dbData.correctQuestions = (dbData.correctQuestions || 0) + 1;
  } else {
    // Record mistake in history
    dbData.mistakeHistory.push({
      challengeId,
      topicId: challengeObj.topicId,
      wrongAnswer: answer,
      timestamp: new Date().toISOString()
    });
    
    // Assign weak topic tag if repeated mistakes occur
    const topicMistakesCount = dbData.mistakeHistory.filter(m => m.topicId === challengeObj.topicId).length;
    if (topicMistakesCount >= 2 && !dbData.weakTopics.includes(challengeObj.topicId)) {
      dbData.weakTopics.push(challengeObj.topicId);
    }
  }

  // Update session answer list
  dbData.activeSession.answers.push({
    challengeId,
    answer,
    isCorrect: evalResult.isCorrect,
    timeTaken: timeTaken || 10
  });

  // Check if session is completed (5 questions)
  const isSessionEnd = dbData.activeSession.answers.length >= activeChallenges.length;
  let responsePayload = {
    isCorrect: evalResult.isCorrect,
    correctAnswer: challengeObj.correctAnswer,
    explanation: challengeObj.explanation,
    stepByStep: challengeObj.stepByStep,
    hintLevel: evalResult.attemptCount >= 2 ? evalResult.hintLevel : 1,
    hintText: evalResult.isCorrect ? '' : (attemptCount === 1 ? challengeObj.hint2 : attemptCount === 2 ? challengeObj.hint3 : challengeObj.hint4),
    earnedStars: evalResult.earnedStars,
    isSessionEnd
  };

  if (evalResult.isCorrect) {
    dbData.stars = (dbData.stars || 20) + evalResult.earnedStars;
    
    eventBus.publish('LOGIC_REWARD_GRANTED', {
      studentId: studentId || 'student_123',
      rewardType: 'correct_answer',
      starsEarned: evalResult.earnedStars
    });
  }

  if (isSessionEnd) {
    dbData.sessionCount = (dbData.sessionCount || 0) + 1;
    const sessionAnswers = dbData.activeSession.answers;
    const correctCount = sessionAnswers.filter(a => a.isCorrect).length;
    
    // Streak / perfect chain logic
    let bonusStars = 0;
    if (correctCount === activeChallenges.length) {
      bonusStars = 20; // Perfect logic chain
      responsePayload.sessionMsg = "🧠 PERFECT LOGIC CHAIN! LogicLeap AI awards you +20 Bonus Stars!";
    } else if (correctCount >= 4) {
      bonusStars = 10; // Streak bonus
      responsePayload.sessionMsg = "🎉 Outstanding thinking! LogicLeap AI awards you +10 Bonus Stars!";
    } else {
      responsePayload.sessionMsg = "Keep exercising your brain! Logic session complete.";
    }

    dbData.stars = (dbData.stars || 20) + bonusStars;
    if (bonusStars > 0) {
      eventBus.publish('LOGIC_REWARD_GRANTED', {
        studentId: studentId || 'student_123',
        rewardType: correctCount === activeChallenges.length ? 'perfect_logic_chain' : 'streak_completion',
        starsEarned: bonusStars
      });
    }

    // Award Badges Server-side
    const badgesAwarded = [];
    if (dbData.sessionCount >= 1 && !dbData.badges.includes('Logic Explorer')) {
      dbData.badges.push('Logic Explorer');
      badgesAwarded.push('Logic Explorer');
    }
    if (correctCount === activeChallenges.length && !dbData.badges.includes('Pattern Master')) {
      dbData.badges.push('Pattern Master');
      badgesAwarded.push('Pattern Master');
    }
    
    const avgTime = sessionAnswers.reduce((sum, val) => sum + val.timeTaken, 0) / sessionAnswers.length;
    if (correctCount === activeChallenges.length && avgTime <= 12 && !dbData.badges.includes('Brain Hero')) {
      dbData.badges.push('Brain Hero');
      badgesAwarded.push('Brain Hero');
    }
    
    if (dbData.grade === 'Grade 4' && correctCount >= 4 && !dbData.badges.includes('Puzzle Champion')) {
      dbData.badges.push('Puzzle Champion');
      badgesAwarded.push('Puzzle Champion');
    }

    const overallAccuracy = dbData.totalQuestions > 10 ? (dbData.correctQuestions / dbData.totalQuestions) : 0;
    if (overallAccuracy >= 0.90 && !dbData.badges.includes('Thinking Wizard')) {
      dbData.badges.push('Thinking Wizard');
      badgesAwarded.push('Thinking Wizard');
    }

    if (badgesAwarded.length > 0) {
      badgesAwarded.forEach(badge => {
        eventBus.publish('BADGE_UNLOCKED', {
          studentId: studentId || 'student_123',
          badgeId: badge.toLowerCase().replace(' ', '_'),
          badgeName: badge
        });
      });
    }

    // Update readiness score
    const completionGoal = dbData.grade === 'KG' ? 2 : 3;
    const completedCount = Math.min(completionGoal, dbData.sessionCount);
    const readinessScore = Math.round((completedCount / completionGoal) * 100);
    dbData.readinessScore = readinessScore;

    // Trigger outbound events
    eventBus.publish('LOGIC_SESSION_COMPLETED', {
      studentId: studentId || 'student_123',
      grade: dbData.grade,
      sessionId: dbData.activeSession.id,
      starsEarned: correctCount * 5 + bonusStars,
      sourceModule: 'LOGIC_APP'
    });

    eventBus.publish('LOGIC_PROGRESS_UPDATED', {
      studentId: studentId || 'student_123',
      stars: dbData.stars,
      level: dbData.level,
      readinessScore,
      badges: dbData.badges
    });

    eventBus.publish('LOGIC_SCORE_UPDATED', {
      studentId: studentId || 'student_123',
      newScore: dbData.stars
    });

    // Clear active session
    delete dbData.activeSession;
  }

  writeLocalDB(dbData);

  eventBus.publish('LOGIC_ANSWER_SUBMITTED', {
    studentId: studentId || 'student_123',
    challengeId,
    isCorrect: evalResult.isCorrect,
    timeTaken: timeTaken || 10
  });

  res.json({
    success: true,
    ...responsePayload
  });
};
