import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';
import { 
  processMathQuery, 
  generateMathQuestionSet, 
  analyzeAnswerSubmission 
} from '../services/mathEngine.js';
import { eventBus } from '../../../shared/eventBus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local DB Config
const DB_DIR = path.join(__dirname, '../../../data');
const DB_FILE = path.join(DB_DIR, 'math.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const defaultProgress = {
  studentId: 'student_123',
  grade: 'KG',
  stars: 15,
  level: 1,
  badges: [],
  completedSessions: [],
  mistakeHistory: [],
  weakTopics: [],
  sessionCount: 0,
  answerAttempts: [],
  totalQuestions: 0,
  correctQuestions: 0,
  timeTakenHistory: []
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
 * POST /math/chat
 */
export const chatWithMathMentor = async (req, res) => {
  const { studentId, message, grade } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing 'message' field." });
  }

  const studentGrade = grade || 'KG';
  
  // Trigger EventBus
  eventBus.publish('MATH_HINT_REQUESTED', { studentId: studentId || 'student_123', queryText: message });

  const result = processMathQuery({ message, grade: studentGrade });
  
  res.json({
    success: true,
    ...result
  });
};

/**
 * GET /math/progress
 */
export const getMathProgress = async (req, res) => {
  const data = readLocalDB();
  res.json(data);
};

/**
 * POST /math/progress
 */
export const updateMathProgress = async (req, res) => {
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
 * POST /math/generate-session
 */
export const generateMathSession = async (req, res) => {
  const { studentId, grade, mode } = req.body;
  const dbData = readLocalDB();

  const studentGrade = grade || dbData.grade || 'KG';
  
  // Calculate average performance score
  const totalQ = dbData.totalQuestions || 0;
  const correctQ = dbData.correctQuestions || 0;
  const performanceScore = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 80;

  // Generate question set using personalization engine
  const sessionConfig = generateMathQuestionSet({
    grade: studentGrade,
    performanceScore,
    mistakeHistory: dbData.mistakeHistory,
    weakTopics: dbData.weakTopics
  });

  // Save current active session questions in db.json temporary store
  dbData.activeSession = {
    id: `session-math-${Date.now()}`,
    mode: mode || 'practice',
    questions: sessionConfig.questionSet,
    currentIndex: 0,
    answers: [],
    rewardPoints: sessionConfig.rewardPoints,
    startTime: new Date().toISOString()
  };
  writeLocalDB(dbData);

  // Publish Event
  eventBus.publish('MATH_SESSION_STARTED', {
    studentId: studentId || 'student_123',
    grade: studentGrade,
    mode: mode || 'practice',
    sessionId: dbData.activeSession.id
  });

  eventBus.publish('MATH_QUESTION_GENERATED', {
    studentId: studentId || 'student_123',
    sessionId: dbData.activeSession.id,
    questionCount: sessionConfig.questionSet.length
  });

  res.json({
    success: true,
    sessionId: dbData.activeSession.id,
    recommendedTopic: sessionConfig.recommendedTopic,
    difficultyLevel: sessionConfig.difficultyLevel,
    hintLevel: sessionConfig.hintLevel,
    nextStepLearningPath: sessionConfig.nextStepLearningPath,
    questions: sessionConfig.questionSet.map(q => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      topicId: q.topicId,
      realLifeConnection: q.realLifeConnection
    }))
  });
};

/**
 * POST /math/submit-answer
 */
export const submitMathAnswer = async (req, res) => {
  const { studentId, questionId, answer, timeTaken, attemptCount } = req.body;
  const dbData = readLocalDB();

  if (!dbData.activeSession) {
    return res.status(400).json({ error: "No active math session found. Generate a session first." });
  }

  // Find question inside active session
  const activeQuestions = dbData.activeSession.questions;
  const qIdx = activeQuestions.findIndex(q => q.id === questionId);
  if (qIdx === -1) {
    return res.status(404).json({ error: "Question not found in active session." });
  }

  const questionObj = activeQuestions[qIdx];
  const evalResult = analyzeAnswerSubmission({
    questionObj,
    answer,
    timeTaken: timeTaken || 10,
    attemptCount: attemptCount || 1
  });

  // Log answer statistics
  dbData.totalQuestions = (dbData.totalQuestions || 0) + 1;
  if (evalResult.isCorrect) {
    dbData.correctQuestions = (dbData.correctQuestions || 0) + 1;
  } else {
    // Record mistake in history
    dbData.mistakeHistory.push({
      questionId,
      topicId: questionObj.topicId,
      wrongAnswer: answer,
      timestamp: new Date().toISOString()
    });
    
    // Assign weak topic tag if repeated mistakes occur
    const topicMistakesCount = dbData.mistakeHistory.filter(m => m.topicId === questionObj.topicId).length;
    if (topicMistakesCount >= 2 && !dbData.weakTopics.includes(questionObj.topicId)) {
      dbData.weakTopics.push(questionObj.topicId);
      
      // Trigger Event
      eventBus.publish('MATH_TOPIC_WEAKNESS_DETECTED', {
        studentId: studentId || 'student_123',
        topicId: questionObj.topicId,
        mistakeCount: topicMistakesCount
      });
    }
  }

  // Update session answer list
  dbData.activeSession.answers.push({
    questionId,
    answer,
    isCorrect: evalResult.isCorrect,
    timeTaken: timeTaken || 10
  });

  // Check if session is completed (5 questions)
  const isSessionEnd = dbData.activeSession.answers.length >= activeQuestions.length;
  let responsePayload = {
    isCorrect: evalResult.isCorrect,
    correctAnswer: questionObj.correctAnswer,
    explanation: questionObj.explanation,
    stepByStep: questionObj.stepByStep,
    hintLevel: evalResult.attemptCount >= 2 ? evalResult.hintLevel : 1,
    hintText: evalResult.isCorrect ? '' : (attemptCount === 1 ? questionObj.hint2 : attemptCount === 2 ? questionObj.hint3 : questionObj.hint4),
    earnedStars: evalResult.earnedStars,
    isSessionEnd
  };

  if (evalResult.isCorrect) {
    dbData.stars = (dbData.stars || 15) + evalResult.earnedStars;
    
    // Trigger Event
    eventBus.publish('MATH_REWARD_GRANTED', {
      studentId: studentId || 'student_123',
      rewardType: 'correct_answer',
      starsEarned: evalResult.earnedStars
    });
  }

  if (isSessionEnd) {
    // Session completion logic
    dbData.sessionCount = (dbData.sessionCount || 0) + 1;
    const sessionAnswers = dbData.activeSession.answers;
    const correctCount = sessionAnswers.filter(a => a.isCorrect).length;
    
    // Perfect quiz bonus
    let bonusStars = 0;
    if (correctCount === activeQuestions.length) {
      bonusStars = 20; // Perfect quiz bonus
      responsePayload.sessionMsg = "🌟 PERFECT SCORE! MathMentor AI awards you +20 Bonus Stars!";
    } else if (correctCount >= 4) {
      bonusStars = 10; // Streak completion bonus
      responsePayload.sessionMsg = "🎉 Great job! MathMentor AI awards you +10 Bonus Stars!";
    } else {
      responsePayload.sessionMsg = "Keep practicing! You completed the quiz. revision is suggested.";
    }

    dbData.stars = (dbData.stars || 15) + bonusStars;
    if (bonusStars > 0) {
      eventBus.publish('MATH_REWARD_GRANTED', {
        studentId: studentId || 'student_123',
        rewardType: correctCount === activeQuestions.length ? 'perfect_quiz' : 'streak_completion',
        starsEarned: bonusStars
      });
    }

    // Award Badges Server-side
    const badgesAwarded = [];
    if (dbData.sessionCount >= 1 && !dbData.badges.includes('Number Explorer')) {
      dbData.badges.push('Number Explorer');
      badgesAwarded.push('Number Explorer');
    }
    if (correctCount === activeQuestions.length && !dbData.badges.includes('Math Master')) {
      dbData.badges.push('Math Master');
      badgesAwarded.push('Math Master');
    }
    
    // Speed Solver: Average time < 10 seconds per correct question
    const avgTime = sessionAnswers.reduce((sum, val) => sum + val.timeTaken, 0) / sessionAnswers.length;
    if (correctCount === activeQuestions.length && avgTime <= 15 && !dbData.badges.includes('Speed Solver')) {
      dbData.badges.push('Speed Solver');
      badgesAwarded.push('Speed Solver');
    }
    
    // Logic Hero: Grade 4 logic word problems completion
    if (dbData.grade === 'Grade 4' && correctCount >= 4 && !dbData.badges.includes('Logic Hero')) {
      dbData.badges.push('Logic Hero');
      badgesAwarded.push('Logic Hero');
    }

    // Accuracy Champion: overall accuracy > 90% with at least 15 questions
    const overallAccuracy = dbData.totalQuestions > 10 ? (dbData.correctQuestions / dbData.totalQuestions) : 0;
    if (overallAccuracy >= 0.90 && !dbData.badges.includes('Accuracy Champion')) {
      dbData.badges.push('Accuracy Champion');
      badgesAwarded.push('Accuracy Champion');
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
    // Every grade has 3 modules, completing a session adds to completion
    const uniqueTopicsCompleted = new Set(dbData.mistakeHistory.filter(m => m.isCorrect).map(m => m.topicId));
    dbData.completedSessions.push({
      sessionId: dbData.activeSession.id,
      score: correctCount,
      total: activeQuestions.length,
      timestamp: new Date().toISOString()
    });

    const completionGoal = dbData.grade === 'KG' ? 2 : 3;
    const completedCount = Math.min(completionGoal, dbData.completedSessions.length);
    const readinessScore = Math.round((completedCount / completionGoal) * 100);
    dbData.readinessScore = readinessScore;

    // Trigger completion events
    eventBus.publish('MATH_SESSION_COMPLETED', {
      studentId: studentId || 'student_123',
      grade: dbData.grade,
      sessionId: dbData.activeSession.id,
      starsEarned: correctCount * 5 + bonusStars,
      sourceModule: 'MATH_APP'
    });

    eventBus.publish('MATH_PROGRESS_UPDATED', {
      studentId: studentId || 'student_123',
      stars: dbData.stars,
      level: dbData.level,
      readinessScore,
      badges: dbData.badges
    });

    eventBus.publish('MATH_SCORE_UPDATED', {
      studentId: studentId || 'student_123',
      newScore: dbData.stars
    });

    // Clear active session
    delete dbData.activeSession;
  }

  writeLocalDB(dbData);

  // Publish Event
  eventBus.publish('MATH_ANSWER_SUBMITTED', {
    studentId: studentId || 'student_123',
    questionId,
    isCorrect: evalResult.isCorrect,
    timeTaken: timeTaken || 10
  });

  res.json({
    success: true,
    ...responsePayload
  });
};
