import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';

// Import Models & Constants
import {
  StudentModel,
  ActivityModel,
  ActivitySessionModel,
  ActivitySkipModel,
  ActivityRewardModel,
  ActivityAnalyticsModel,
  FitFriendChatModel,
  SESSION_STATUS,
  SKIP_REASONS,
  REWARD_TYPES,
  REWARD_TRIGGERS
} from '../models/index.js';

import { DEFAULT_ACTIVITIES } from '../data/activities.js';
import { eventBus } from '../../../shared/eventBus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback Local File Database setup
const DB_DIR = path.join(__dirname, '../../../data');
const DB_FILE = path.join(DB_DIR, 'physical_activity.json');

// Future integration hooks references
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
// SCIENCE_MODULE
// CODING_MODULE
// ROBOTICS_MODULE
// ARVR_MODULE

const readLocalDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { students: {}, sessions: [], skips: [], rewards: [], analytics: [], fitfriend_chats: [] };
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { students: {}, sessions: [], skips: [], rewards: [], analytics: [], fitfriend_chats: [] };
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

const isMongoConnected = () => {
  return global.mongoConnected === true;
};

// Helper: Check for academic keywords to redirect to Main Instructor AI (Sparky)
const checkForAcademicRedirect = (msg) => {
  const query = msg.toLowerCase();
  const mathKeywords = ['math', 'algebra', 'addition', 'subtraction', 'multiplication', 'division', 'fraction', 'number', 'count', 'geometry', 'plus', 'minus', 'solve', 'equation'];
  const englishKeywords = ['english', 'spell', 'grammar', 'vocabulary', 'read', 'write', 'alphabet', 'letter', 'sentence', 'noun', 'verb', 'adjective', 'pronounce'];
  const stemKeywords = ['circuit', 'led', 'resistor', 'battery', 'voltage', 'current', 'wire', 'switch', 'stem', 'science', 'physics', 'chemistry', 'biology', 'diode', 'transistor'];
  const logicKeywords = ['puzzle', 'logic', 'problem solving', 'code', 'coding', 'robot', 'robotics', 'programming', 'scratch'];

  const matches = (list) => list.some(word => query.includes(word));

  if (matches(mathKeywords) || matches(englishKeywords) || matches(stemKeywords) || matches(logicKeywords)) {
    return {
      redirect: true,
      reply: "Hi there! I'm **FitFriend AI**, your active movement coach! 🏃‍♂️ I only teach active exercise, stretching, and healthy habits. For help with math, reading, science, or circuits, please chat with **Sparky, the Main Instructor AI**! 🤖"
    };
  }
  return { redirect: false };
};

// Heuristic activity matching based on grade-wise support definitions
const getGradeWiseActivity = (grade, query = '') => {
  const q = query.toLowerCase();
  let category = 'cardio';

  // Determine category based on keywords
  if (q.includes('stretch') || q.includes('reach') || q.includes('flex')) category = 'stretching';
  else if (q.includes('yoga') || q.includes('pose') || q.includes('tree') || q.includes('calm')) category = 'yoga';
  else if (q.includes('balance') || q.includes('foot') || q.includes('stand')) category = 'balance';
  else if (q.includes('brain') || q.includes('focus') || q.includes('mind')) category = 'focus';
  else if (q.includes('game') || q.includes('play') || q.includes('simon')) category = 'coordination';

  let activities = DEFAULT_ACTIVITIES.filter(a => a.gradeLevels.includes(grade));
  if (activities.length === 0) activities = DEFAULT_ACTIVITIES;

  // Attempt matching by category
  let matches = activities.filter(a => a.category === category);
  if (matches.length === 0) {
    matches = activities;
  }

  // Pick one randomly
  return matches[Math.floor(Math.random() * matches.length)];
};

/**
 * POST /activity/fitfriend/chat
 */
export const chatWithFitFriend = async (req, res) => {
  const { studentId, message, grade, moodScore, attentionScore, completedModule } = req.body;

  if (!studentId || !message) {
    return res.status(400).json({ error: "Missing required fields: 'studentId' and 'message' are required." });
  }

  const studentGrade = grade || 'KG';
  
  // 1. Guard check for academic content
  const redirectCheck = checkForAcademicRedirect(message);
  if (redirectCheck.redirect) {
    return res.json({
      success: true,
      reply: redirectCheck.reply,
      redirectToTutor: true,
      tutorMood: 'puzzled'
    });
  }

  // 2. Select grade-wise active break
  const activity = getGradeWiseActivity(studentGrade, message);
  
  let encouragementMessage = "Awesome job! Let's get moving! 🚀";
  if (moodScore < 40) {
    encouragementMessage = "Feeling a bit tired? Let's do a gentle warm-up break to wake up your body! ☀️";
  } else if (attentionScore < 50) {
    encouragementMessage = "Time to refocus! Try this quick balance challenge to boost your brain! 🧠";
  }

  const output = {
    recommendedActivity: {
      activityId: activity.activityId,
      title: activity.title,
      description: activity.description,
      emoji: activity.emoji,
      category: activity.category,
      durationSeconds: activity.durationSeconds,
      instructions: activity.instructions
    },
    difficulty: studentGrade === 'KG' ? 'Very Easy' : (studentGrade === 'Grade 1' ? 'Easy' : 'Medium'),
    duration: activity.durationSeconds,
    instructions: activity.instructions.map(i => i.description),
    rewardPoints: 5,
    encouragementMessage
  };

  // 3. Save Chat Log
  if (isMongoConnected()) {
    try {
      // Save student message
      await FitFriendChatModel.create({
        studentId,
        message,
        sender: 'student',
        grade: studentGrade
      });
      // Save AI reply
      await FitFriendChatModel.create({
        studentId,
        message: encouragementMessage + ` How about trying the "${activity.title}" break?`,
        sender: 'fitfriend',
        grade: studentGrade,
        recommendedActivityId: activity.activityId
      });

      // Create an activity session automatically on assignment
      const session = await ActivitySessionModel.create({
        studentId,
        activityId: activity.activityId,
        sourceModule: completedModule || 'FITFRIEND_AI',
        gradeAtSession: studentGrade,
        status: SESSION_STATUS.ASSIGNED,
        plannedDurationSeconds: activity.durationSeconds,
        assignedBy: 'AI_TUTOR',
        assignedAt: new Date()
      });
      output.sessionId = session._id.toString();
    } catch (err) {
      console.error('Failed to log chat in MongoDB:', err);
    }
  } else {
    // Local JSON DB fallback
    const db = readLocalDB();
    if (!db.fitfriend_chats) db.fitfriend_chats = [];
    
    db.fitfriend_chats.push({
      _id: new mongoose.Types.ObjectId().toString(),
      studentId,
      message,
      sender: 'student',
      grade: studentGrade,
      timestamp: new Date().toISOString()
    });

    const sessionId = new mongoose.Types.ObjectId().toString();
    db.fitfriend_chats.push({
      _id: new mongoose.Types.ObjectId().toString(),
      studentId,
      message: encouragementMessage + ` How about trying the "${activity.title}" break?`,
      sender: 'fitfriend',
      grade: studentGrade,
      recommendedActivityId: activity.activityId,
      timestamp: new Date().toISOString()
    });

    db.sessions.push({
      _id: sessionId,
      studentId,
      activityId: activity.activityId,
      sourceModule: completedModule || 'FITFRIEND_AI',
      gradeAtSession: studentGrade,
      status: SESSION_STATUS.ASSIGNED,
      plannedDurationSeconds: activity.durationSeconds,
      assignedBy: 'AI_TUTOR',
      assignedAt: new Date().toISOString()
    });

    output.sessionId = sessionId;
    writeLocalDB(db);
  }

  // 4. Emit FitFriend API assigned event
  eventBus.publish('FIT_ACTIVITY_ASSIGNED', {
    studentId,
    activityId: activity.activityId,
    sessionId: output.sessionId,
    sourceModule: completedModule || 'FITFRIEND_AI',
    assignedAt: new Date().toISOString()
  });

  res.json({
    success: true,
    reply: `${encouragementMessage} Let's try the **${activity.title}** break!`,
    recommendedActivity: output.recommendedActivity,
    difficulty: output.difficulty,
    duration: output.duration,
    instructions: output.instructions,
    rewardPoints: output.rewardPoints,
    sessionId: output.sessionId
  });
};

/**
 * POST /activity/fitfriend/skip
 */
export const skipFitFriendActivity = async (req, res) => {
  const { studentId, sessionId, skipReason } = req.body;

  if (!studentId || !sessionId || !skipReason) {
    return res.status(400).json({ error: "Missing required fields: 'studentId', 'sessionId', and 'skipReason' are required." });
  }

  let sessionObj = null;
  let skipCount = 0;

  if (isMongoConnected()) {
    try {
      sessionObj = await ActivitySessionModel.findOne({ _id: sessionId, studentId });
      if (sessionObj) {
        sessionObj.status = SESSION_STATUS.SKIPPED;
        sessionObj.skippedAt = new Date();
        await sessionObj.save();

        await ActivitySkipModel.create({
          studentId,
          activityId: sessionObj.activityId,
          sessionId: sessionObj._id,
          sourceModule: sessionObj.sourceModule || 'FITFRIEND_AI',
          gradeAtSkip: sessionObj.gradeAtSession,
          skippedAt: new Date(),
          skipReason,
          skippedBy: 'STUDENT'
        });

        // Tally skips
        const skips = await ActivitySkipModel.find({ studentId }).sort({ skippedAt: -1 }).limit(15);
        skipCount = skips.length;
      }
    } catch (err) {
      console.error('Mongo skip action failed:', err);
    }
  }

  // File fallback
  if (!sessionObj) {
    const db = readLocalDB();
    const idx = db.sessions.findIndex(s => s._id === sessionId && s.studentId === studentId);
    if (idx !== -1) {
      sessionObj = db.sessions[idx];
      sessionObj.status = SESSION_STATUS.SKIPPED;
      sessionObj.skippedAt = new Date().toISOString();

      db.skips.push({
        _id: new mongoose.Types.ObjectId().toString(),
        studentId,
        activityId: sessionObj.activityId,
        sessionId: sessionObj._id,
        sourceModule: sessionObj.sourceModule || 'FITFRIEND_AI',
        gradeAtSkip: sessionObj.gradeAtSession,
        skippedAt: sessionObj.skippedAt,
        skipReason,
        skippedBy: 'STUDENT'
      });

      skipCount = db.skips.filter(sk => sk.studentId === studentId).length;
      writeLocalDB(db);
    }
  }

  if (!sessionObj) {
    return res.status(404).json({ error: "Session not found." });
  }

  // 1 Skip: Encourage
  let reply = "That's okay! We can move later. Stay active! 🌟";
  let offerShorter = false;
  let offerGame = false;

  // 3 Skips: Halve duration
  if (skipCount >= 3 && skipCount < 5) {
    reply = "Let's try a quicker break next time! I have customized a short 30-second breathing exercise for you. 🧘";
    offerShorter = true;
  }
  // 5 Skips: Suggest game
  else if (skipCount >= 5) {
    reply = "Let's play a fun movement game instead! How about a game of Simon Says? 🦘";
    offerGame = true;
  }

  // 10 Skips: Alert parent
  if (skipCount >= 10) {
    eventBus.publish('PARENT_ALERT_GENERATED', {
      studentId,
      alertType: 'EXCESSIVE_SKIP_ALERT',
      message: `EXCESSIVE_SKIP_ALERT: Student has skipped ${skipCount} activities consecutively.`,
      severity: 'critical'
    });
  }

  eventBus.publish('FIT_ACTIVITY_SKIPPED', {
    studentId,
    activityId: sessionObj.activityId,
    sessionId: sessionObj._id.toString(),
    skipCount,
    reason: skipReason,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    reply,
    skipCount,
    offerShorter,
    offerGame
  });
};
