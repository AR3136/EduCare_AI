import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';

// Import Models & Seed Data
import {
  StudentModel,
  ActivityModel,
  ActivitySessionModel,
  ActivitySkipModel,
  ActivityRewardModel,
  ActivityAnalyticsModel,
  SESSION_STATUS,
  SKIP_REASONS,
  REWARD_TYPES,
  REWARD_TRIGGERS
} from '../models/index.js';

import { DEFAULT_ACTIVITIES } from '../data/activities.js';

// Import Ecosystem Event Bus
import { eventBus } from '../../../shared/eventBus.js';
import { initializeTriggerEngine } from '../services/triggerEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback Local File Database setup
const DB_DIR = path.join(__dirname, '../../../data');
const DB_FILE = path.join(DB_DIR, 'physical_activity.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const defaultLocalDB = {
  students: {},
  sessions: [],
  skips: [],
  rewards: [],
  analytics: []
};

// Helper: Read Local JSON Database
const readLocalDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultLocalDB, null, 2));
      return defaultLocalDB;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local JSON DB:', err);
    return defaultLocalDB;
  }
};

// Helper: Write Local JSON Database
const writeLocalDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing local JSON DB:', err);
    return false;
  }
};

// Helper: Check if MongoDB is connected
const isMongoConnected = () => {
  return global.mongoConnected === true;
};

// ─── DOMAIN METRICS & RECOMMENDATIONS HELPERS ──────────────────

// Helper: Get or create student profile (local fallback)
const getOrCreateLocalStudent = (db, studentId, grade) => {
  if (!db.students[studentId]) {
    db.students[studentId] = {
      studentId,
      displayName: `Explorer ${studentId.split('_')[1] || ''}`,
      grade: grade || 'KG',
      currentMood: 'unknown',
      streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
      stats: { totalSessionsCompleted: 0, totalSessionsSkipped: 0, totalMinutesActive: 0, totalStarsEarned: 15, totalBadgesEarned: 0 }
    };
  } else if (grade && db.students[studentId].grade !== grade) {
    db.students[studentId].grade = grade;
  }
  return db.students[studentId];
};

// Helper: Get or create student profile (MongoDB)
const getOrCreateMongoStudent = async (studentId, grade) => {
  let student = await StudentModel.findOne({ studentId });
  if (!student) {
    student = await StudentModel.create({
      studentId,
      displayName: `Explorer ${studentId.split('_')[1] || ''}`,
      grade: grade || 'KG',
      stats: { totalStarsEarned: 15 } // Match default
    });
  } else if (grade && student.grade !== grade) {
    student.grade = grade;
    await student.save();
  }
  return student;
};

// Helper: Compute engagement score for a student in a module
const getEngagementScore = async (studentId, sourceModule) => {
  if (isMongoConnected()) {
    try {
      const stats = await ActivityAnalyticsModel.findOne({ studentId, sourceModule });
      if (stats && stats.sessionsAssigned > 0) {
        return Math.round((stats.sessionsCompleted / stats.sessionsAssigned) * 100);
      }
      
      // Fallback to calculation if no analytics record exists yet
      const total = await ActivitySessionModel.countDocuments({ studentId, sourceModule });
      if (total === 0) return 0;
      const completed = await ActivitySessionModel.countDocuments({ studentId, sourceModule, status: SESSION_STATUS.COMPLETED });
      return Math.round((completed / total) * 100);
    } catch (err) {
      console.error('Failed to compute Mongo engagement score:', err);
      return 0;
    }
  } else {
    const db = readLocalDB();
    const studentSessions = db.sessions.filter(s => s.studentId === studentId && s.sourceModule === sourceModule);
    if (studentSessions.length === 0) return 0;
    const completed = studentSessions.filter(s => s.status === SESSION_STATUS.COMPLETED).length;
    return Math.round((completed / studentSessions.length) * 100);
  }
};

// Helper: Get total reward stars for a student in a module
const getRewardPoints = async (studentId, sourceModule) => {
  if (isMongoConnected()) {
    try {
      const rewards = await ActivityRewardModel.find({ studentId, sourceModule, isVoided: false });
      const moduleStars = rewards.reduce((sum, r) => sum + r.starsEarned, 0);
      
      // Also fetch default base stars from student profile if this is the active module
      const student = await StudentModel.findOne({ studentId });
      const baseStars = student ? student.stats.totalStarsEarned : 15;
      
      return baseStars + moduleStars;
    } catch (err) {
      console.error('Failed to compute Mongo reward points:', err);
      return 15;
    }
  } else {
    const db = readLocalDB();
    const studentRewards = db.rewards.filter(r => r.studentId === studentId && r.sourceModule === sourceModule && !r.isVoided);
    const moduleStars = studentRewards.reduce((sum, r) => sum + r.starsEarned, 0);
    
    const student = db.students[studentId];
    const baseStars = student ? student.stats.totalStarsEarned : 15;
    
    return baseStars + moduleStars;
  }
};

// Helper: Get consecutive skips count
const getConsecutiveSkips = async (studentId) => {
  if (isMongoConnected()) {
    try {
      const sessions = await ActivitySessionModel.find({ studentId }).sort({ createdAt: -1 }).limit(10);
      let skipCount = 0;
      for (const s of sessions) {
        if (s.status === SESSION_STATUS.SKIPPED) {
          skipCount++;
        } else if (s.status === SESSION_STATUS.COMPLETED) {
          break;
        }
      }
      return skipCount;
    } catch (err) {
      console.error('Error fetching skips:', err);
      return 0;
    }
  } else {
    const db = readLocalDB();
    const sessions = db.sessions
      .filter(s => s.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt || b.assignedAt) - new Date(a.createdAt || a.assignedAt));
    let skipCount = 0;
    for (const s of sessions) {
      if (s.status === SESSION_STATUS.SKIPPED) {
        skipCount++;
      } else if (s.status === SESSION_STATUS.COMPLETED) {
        break;
      }
    }
    return skipCount;
  }
};

// Helper: Trigger Parent Skip Alert
const triggerParentSkipAlert = async (studentId, grade, sourceModule) => {
  console.log(`🚨 [AlertEngine] Triggered parent alert PHYSICAL_ACTIVITY_SKIP_ALERT for student ${studentId}`);
  
  eventBus.publish('PARENT_ALERT_GENERATED', {
    studentId,
    alertType: 'PHYSICAL_ACTIVITY_SKIP_ALERT',
    message: `PHYSICAL_ACTIVITY_SKIP_ALERT: Student has consecutively skipped 10 assigned physical breaks.`,
    severity: 'critical'
  });
};

// Helper: AI Personalization Recommendation Engine
const getAIPersonalizedRecommendation = async ({
  studentId,
  grade,
  performanceScore = 50,
  attentionScore = 50,
  moodScore = 50,
  skipHistory,
  completedModule = 'AI_TUTOR',
  sessionDuration = 1800
}) => {
  const studentGrade = grade || 'KG';
  const consecutiveSkips = (typeof skipHistory === 'number') ? skipHistory : await getConsecutiveSkips(studentId);
  
  let catalog = DEFAULT_ACTIVITIES;
  if (isMongoConnected()) {
    try {
      const dbActs = await ActivityModel.find({ isActive: true });
      if (dbActs.length > 0) catalog = dbActs;
    } catch (err) {
      console.error(err);
    }
  }

  // 1. Filter by completedModule subject tag
  let filtered = catalog;
  let subjectTag = null;
  if (completedModule === 'ENGLISH_APP') {
    subjectTag = 'ENGLISH_ACTIVITY';
  } else if (completedModule === 'MATH_APP') {
    subjectTag = 'MATH_ACTIVITY';
  } else if (completedModule === 'STEM_APP') {
    subjectTag = 'STEM_ACTIVITY';
  } else if (completedModule === 'LOGIC_APP') {
    subjectTag = 'LOGIC_ACTIVITY';
  }

  if (subjectTag) {
    filtered = catalog.filter(a => a.subjectTag === subjectTag);
  }

  // 2. Filter by Grade level
  let gradeFiltered = filtered.filter(a => a.gradeLevels.includes(studentGrade));
  if (gradeFiltered.length === 0) {
    gradeFiltered = catalog.filter(a => a.gradeLevels.includes(studentGrade));
  }
  if (gradeFiltered.length === 0) {
    gradeFiltered = catalog;
  }

  // 3. AI Selection heuristics based on mood and attention
  let selectedActivity = null;

  let completedIds = [];
  if (isMongoConnected()) {
    try {
      completedIds = await ActivitySessionModel.distinct('activityId', { studentId, status: SESSION_STATUS.COMPLETED });
    } catch (err) {}
  } else {
    const db = readLocalDB();
    completedIds = db.sessions.filter(s => s.studentId === studentId && s.status === SESSION_STATUS.COMPLETED).map(s => s.activityId);
  }

  const uncompleted = gradeFiltered.filter(a => !completedIds.includes(a.activityId));
  const pool = uncompleted.length > 0 ? uncompleted : gradeFiltered;

  if (attentionScore < 50 || moodScore < 50) {
    const calmActs = pool.filter(a => ['focus', 'calm', 'relax', 'breathing', 'yoga', 'brain_gym', 'shape recognition', 'color recognition'].includes(a.category) || (a.moodTags && a.moodTags.some(tag => ['calm', 'focus', 'relax'].includes(tag))));
    if (calmActs.length > 0) {
      selectedActivity = calmActs[Math.floor(Math.random() * calmActs.length)];
    }
  }

  if (!selectedActivity && (performanceScore > 80 || attentionScore > 80)) {
    const energeticActs = pool.filter(a => ['cardio', 'dance', 'movement', 'fitness', 'animal movements'].includes(a.category) || (a.moodTags && a.moodTags.some(tag => ['energize', 'fun'].includes(tag))));
    if (energeticActs.length > 0) {
      selectedActivity = energeticActs[Math.floor(Math.random() * energeticActs.length)];
    }
  }

  if (!selectedActivity) {
    selectedActivity = pool[Math.floor(Math.random() * pool.length)];
  }

  // 4. Skip Adaptation Engine adjustments
  let targetDuration = selectedActivity.durationSeconds;

  if (consecutiveSkips >= 3 && consecutiveSkips < 5) {
    targetDuration = Math.max(30, Math.round(targetDuration * 0.5));
    console.log(`⚠️ [SkipAdaptation] ${consecutiveSkips} consecutive skips. Reducing duration to ${targetDuration}s.`);
  } else if (consecutiveSkips >= 5) {
    targetDuration = Math.max(30, Math.round(targetDuration * 0.5));
    console.log(`⚠️ [SkipAdaptation] ${consecutiveSkips} consecutive skips. Forcing game-based break and reducing duration.`);
    const gameActs = gradeFiltered.filter(a => ['Simon Says', 'Number Hop Game', 'Memory Walk', 'Touch Something Red', 'Find a Blue Object', 'Touch a Circle Shape', 'Simon Says (Logic Break)', 'Touch Square Objects', 'Memory Challenge', 'Pattern Walk'].includes(a.title) || ['color recognition', 'shape recognition', 'animal movements', 'memory', 'brain_gym'].includes(a.category));
    if (gameActs.length > 0) {
      selectedActivity = gameActs[Math.floor(Math.random() * gameActs.length)];
    }
  }

  const parentAlertTriggered = (consecutiveSkips >= 10);

  // Difficulty label mapping
  let diffLabel = "Easy";
  if (studentGrade === 'KG') diffLabel = "Very Easy";
  else if (studentGrade === 'Grade 1') diffLabel = "Easy";
  else if (studentGrade === 'Grade 2') diffLabel = "Easy-Medium";
  else if (studentGrade === 'Grade 3') diffLabel = "Medium";
  else if (studentGrade === 'Grade 4') diffLabel = "Medium-Hard";

  if (performanceScore > 85) {
    if (diffLabel === "Easy") diffLabel = "Easy-Medium";
    else if (diffLabel === "Easy-Medium") diffLabel = "Medium";
    else if (diffLabel === "Medium") diffLabel = "Medium-Hard";
  } else if (performanceScore < 40) {
    if (diffLabel === "Medium-Hard") diffLabel = "Medium";
    else if (diffLabel === "Medium") diffLabel = "Easy-Medium";
    else if (diffLabel === "Easy-Medium") diffLabel = "Easy";
  }

  return {
    recommendedActivity: selectedActivity,
    difficulty: diffLabel,
    duration: targetDuration,
    rewardPoints: 5,
    parentAlertTriggered
  };
};

// Helper: Get next recommended activity
const getNextRecommendedActivity = async (studentId, grade, sourceModule) => {
  let attentionScore = 50;
  let moodScore = 50;
  let performanceScore = 50;
  
  if (isMongoConnected()) {
    try {
      const student = await StudentModel.findOne({ studentId });
      if (student) {
        if (student.currentMood === 'happy' || student.currentMood === 'excited') moodScore = 80;
        else if (student.currentMood === 'sad' || student.currentMood === 'tired') moodScore = 30;
      }
    } catch (err) {}
  } else {
    const db = readLocalDB();
    const student = db.students[studentId];
    if (student) {
      if (student.currentMood === 'happy' || student.currentMood === 'excited') moodScore = 80;
      else if (student.currentMood === 'sad' || student.currentMood === 'tired') moodScore = 30;
    }
  }

  const result = await getAIPersonalizedRecommendation({
    studentId,
    grade,
    completedModule: sourceModule,
    attentionScore,
    moodScore,
    performanceScore
  });

  return result.recommendedActivity;
};

// Helper: Check and Award Badges
const checkAndAwardBadges = async (studentId, grade, sourceModule, db, isLocal) => {
  const studentGrade = grade || 'Grade 2';
  
  let completedSessions = [];
  let student = null;
  const activityMap = {};

  DEFAULT_ACTIVITIES.forEach(a => {
    activityMap[a.activityId] = a;
  });

  if (!isLocal) {
    try {
      student = await getOrCreateMongoStudent(studentId, studentGrade);
      completedSessions = await ActivitySessionModel.find({ studentId, status: SESSION_STATUS.COMPLETED });
      const dbActs = await ActivityModel.find({ isActive: true });
      dbActs.forEach(a => {
        activityMap[a.activityId] = a;
      });
    } catch (err) {
      console.error('Error fetching data for badges check:', err);
      return;
    }
  } else {
    student = getOrCreateLocalStudent(db, studentId, studentGrade);
    completedSessions = db.sessions.filter(s => s.studentId === studentId && s.status === SESSION_STATUS.COMPLETED);
  }

  if (!student.badges) {
    student.badges = [];
  }

  const badgeDefinitions = [
    {
      id: 'badge_movement_master',
      label: 'Movement Master',
      icon: '🏃‍♂️',
      check: (sessions) => sessions.length >= 3
    },
    {
      id: 'badge_energy_hero',
      label: 'Energy Hero',
      icon: '⚡',
      check: (sessions) => {
        const energyCount = sessions.filter(s => {
          const act = activityMap[s.activityId];
          return act && (act.category === 'cardio' || act.category === 'dance' || act.category === 'fitness');
        }).length;
        return energyCount >= 2;
      }
    },
    {
      id: 'badge_fitness_explorer',
      label: 'Fitness Explorer',
      icon: '🧭',
      check: (sessions) => {
        const categories = new Set();
        sessions.forEach(s => {
          const act = activityMap[s.activityId];
          if (act && act.category) {
            categories.add(act.category);
          }
        });
        return categories.size >= 3;
      }
    },
    {
      id: 'badge_focus_champion',
      label: 'Focus Champion',
      icon: '🧠',
      check: (sessions) => {
        const focusCount = sessions.filter(s => {
          const act = activityMap[s.activityId];
          return act && (act.category === 'mindfulness' || act.category === 'yoga' || act.category === 'focus' || act.category === 'brain_gym');
        }).length;
        return focusCount >= 2;
      }
    }
  ];

  for (const badge of badgeDefinitions) {
    if (badge.check(completedSessions)) {
      if (!student.badges.includes(badge.id)) {
        console.log(`🏆 [BadgeEngine] Student ${studentId} unlocked badge: ${badge.label}`);
        student.badges.push(badge.id);
        student.stats.totalBadgesEarned += 1;

        const rewardId = new mongoose.Types.ObjectId().toString();

        if (!isLocal) {
          await student.save();
          await ActivityRewardModel.create({
            studentId,
            sourceModule,
            gradeAtReward: studentGrade,
            rewardType: REWARD_TYPES.BADGE,
            rewardTrigger: REWARD_TRIGGERS.SYSTEM_GRANT,
            starsEarned: 0,
            badgeId: badge.id,
            badgeLabel: badge.label,
            badgeIcon: badge.icon,
            eventId: rewardId
          });
        } else {
          db.rewards.push({
            _id: rewardId,
            studentId,
            sourceModule,
            gradeAtReward: studentGrade,
            rewardType: REWARD_TYPES.BADGE,
            rewardTrigger: REWARD_TRIGGERS.SYSTEM_GRANT,
            starsEarned: 0,
            badgeId: badge.id,
            badgeLabel: badge.label,
            badgeIcon: badge.icon,
            createdAt: new Date().toISOString(),
            isVoided: false
          });
          writeLocalDB(db);
        }

        eventBus.publish('REWARD_GRANTED', {
          studentId,
          rewardType: REWARD_TYPES.BADGE,
          amount: 0,
          source: 'PHYSICAL_ACTIVITY_ENGINE',
          badgeId: badge.id
        });

        eventBus.publish('BADGE_UNLOCKED', {
          studentId,
          badgeId: badge.id,
          badgeLabel: badge.label,
          badgeIcon: badge.icon,
          source: 'PHYSICAL_ACTIVITY_ENGINE'
        });
      }
    }
  }
};

// Helper: Update analytics record (local fallback)
const updateLocalAnalytics = (db, studentId, sourceModule, grade, date, counters = {}) => {
  let record = db.analytics.find(a => a.studentId === studentId && a.sourceModule === sourceModule && a.date === date);
  if (!record) {
    record = {
      studentId,
      sourceModule,
      gradeLevel: grade,
      date,
      sessionsAssigned: 0,
      sessionsStarted: 0,
      sessionsCompleted: 0,
      sessionsSkipped: 0,
      sessionsExpired: 0,
      totalMinutesActive: 0,
      totalStarsEarned: 0
    };
    db.analytics.push(record);
  }
  
  // Apply counters
  Object.keys(counters).forEach(key => {
    if (record[key] !== undefined) {
      record[key] += counters[key];
    }
  });
};

// Helper: Get YYYY-MM-DD string
const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// ─── API CONTROLLERS ──────────────────────────────────────────

/**
 * POST /activity/assign
 * Body: { studentId, grade, sourceModule, activityId (optional) }
 */
// Programmatic / Internal assign helper for trigger engine
export const assignActivityInternal = async ({ studentId, grade, sourceModule, activityId }) => {
  const studentGrade = grade || 'KG';
  let selectedActivityId = activityId;
  let activityDetail = null;

  // Find or determine activity details
  if (isMongoConnected()) {
    try {
      if (selectedActivityId) {
        activityDetail = await ActivityModel.findOne({ activityId: selectedActivityId });
      }
      if (!activityDetail) {
        const recommended = await getNextRecommendedActivity(studentId, studentGrade, sourceModule);
        activityDetail = recommended;
        selectedActivityId = recommended.activityId;
      }
    } catch (err) {
      console.error('Mongoose assign error:', err);
    }
  }

  // Fallback to static seed lookup if needed
  if (!activityDetail) {
    activityDetail = DEFAULT_ACTIVITIES.find(a => a.activityId === selectedActivityId) || 
                     DEFAULT_ACTIVITIES.find(a => a.gradeLevels.includes(studentGrade)) || 
                     DEFAULT_ACTIVITIES[0];
    selectedActivityId = activityDetail.activityId;
  }

  let sessionObj = null;

  if (isMongoConnected()) {
    try {
      await getOrCreateMongoStudent(studentId, studentGrade);
      sessionObj = await ActivitySessionModel.create({
        studentId,
        activityId: selectedActivityId,
        sourceModule,
        gradeAtSession: studentGrade,
        status: SESSION_STATUS.ASSIGNED,
        plannedDurationSeconds: activityDetail.durationSeconds,
        assignedBy: 'SYSTEM',
        assignedAt: new Date()
      });
      
      // Update Analytics
      const today = getTodayString();
      await ActivityAnalyticsModel.upsertForDate(studentId, sourceModule, studentGrade, today, {
        sessionsAssigned: 1
      });
    } catch (err) {
      console.error('Mongo save session failed:', err);
    }
  }

  // Local JSON Database Fallback
  if (!sessionObj) {
    const db = readLocalDB();
    getOrCreateLocalStudent(db, studentId, studentGrade);
    
    sessionObj = {
      _id: new mongoose.Types.ObjectId().toString(),
      studentId,
      activityId: selectedActivityId,
      sourceModule,
      gradeAtSession: studentGrade,
      status: SESSION_STATUS.ASSIGNED,
      plannedDurationSeconds: activityDetail.durationSeconds,
      assignedBy: 'SYSTEM',
      assignedAt: new Date().toISOString()
    };
    
    db.sessions.push(sessionObj);
    updateLocalAnalytics(db, studentId, sourceModule, studentGrade, getTodayString(), {
      sessionsAssigned: 1
    });
    writeLocalDB(db);
  }

  // Publish Integration Outbound Event
  eventBus.publish('ACTIVITY_ASSIGNED', {
    studentId,
    activityId: selectedActivityId,
    sessionId: sessionObj._id.toString(),
    sourceModule,
    assignedAt: sessionObj.assignedAt
  });

  // Keep EVENT_ACTIVITY_ASSIGNED alias for compatibility
  eventBus.publish('EVENT_ACTIVITY_ASSIGNED', {
    studentId,
    activityId: selectedActivityId,
    sessionId: sessionObj._id.toString(),
    sourceModule,
    assignedAt: sessionObj.assignedAt
  });

  return {
    sessionId: sessionObj._id.toString(),
    activityId: selectedActivityId,
    activityDetail
  };
};

export const assignActivity = async (req, res) => {
  const { studentId, grade, sourceModule, activityId } = req.body;

  if (!studentId || !sourceModule) {
    return res.status(400).json({ error: "Missing required fields: 'studentId' and 'sourceModule' are required." });
  }

  try {
    const studentGrade = grade || 'KG';
    const result = await assignActivityInternal({ studentId, grade: studentGrade, sourceModule, activityId });

    const nextRec = await getNextRecommendedActivity(studentId, studentGrade, sourceModule);
    const engScore = await getEngagementScore(studentId, sourceModule);
    const rewardPts = await getRewardPoints(studentId, sourceModule);

    res.status(201).json({
      success: true,
      sessionId: result.sessionId,
      activityId: result.activityId,
      engagementScore: engScore,
      rewardPoints: rewardPts,
      nextRecommendedActivity: nextRec
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /activity/start
 * Body: { studentId, sessionId, grade, sourceModule }
 */
export const startActivity = async (req, res) => {
  const { studentId, sessionId, grade, sourceModule } = req.body;

  if (!studentId || !sessionId || !sourceModule) {
    return res.status(400).json({ error: "Missing required fields: 'studentId', 'sessionId', and 'sourceModule' are required." });
  }

  let sessionObj = null;
  const studentGrade = grade || 'KG';

  if (isMongoConnected()) {
    try {
      sessionObj = await ActivitySessionModel.findOne({ _id: sessionId, studentId });
      if (sessionObj) {
        sessionObj.status = SESSION_STATUS.STARTED;
        sessionObj.startedAt = new Date();
        await sessionObj.save();

        const today = getTodayString();
        await ActivityAnalyticsModel.upsertForDate(studentId, sourceModule, studentGrade, today, {
          sessionsStarted: 1
        });
      }
    } catch (err) {
      console.error('Mongo start activity failed:', err);
    }
  }

  // Fallback to local DB
  if (!sessionObj) {
    const db = readLocalDB();
    const idx = db.sessions.findIndex(s => s._id === sessionId && s.studentId === studentId);
    if (idx !== -1) {
      db.sessions[idx].status = SESSION_STATUS.STARTED;
      db.sessions[idx].startedAt = new Date().toISOString();
      sessionObj = db.sessions[idx];
      
      updateLocalAnalytics(db, studentId, sourceModule, studentGrade, getTodayString(), {
        sessionsStarted: 1
      });
      writeLocalDB(db);
    }
  }

  if (!sessionObj) {
    return res.status(404).json({ error: "Activity session not found." });
  }

  // Publish Integration Event
  eventBus.publish('EVENT_ACTIVITY_STARTED', {
    studentId,
    activityId: sessionObj.activityId,
    sessionId: sessionObj._id.toString(),
    sourceModule,
    startedAt: sessionObj.startedAt
  });

  const nextRec = await getNextRecommendedActivity(studentId, studentGrade, sourceModule);
  const engScore = await getEngagementScore(studentId, sourceModule);
  const rewardPts = await getRewardPoints(studentId, sourceModule);

  res.json({
    success: true,
    sessionId: sessionObj._id.toString(),
    activityId: sessionObj.activityId,
    engagementScore: engScore,
    rewardPoints: rewardPts,
    nextRecommendedActivity: nextRec
  });
};

/**
 * POST /activity/complete
 * Body: { studentId, sessionId, grade, sourceModule, feedback }
 */
export const completeActivity = async (req, res) => {
  const { studentId, sessionId, grade, sourceModule, feedback } = req.body;

  if (!studentId || !sessionId || !sourceModule) {
    return res.status(400).json({ error: "Missing required fields: 'studentId', 'sessionId', and 'sourceModule' are required." });
  }

  let sessionObj = null;
  const studentGrade = grade || 'KG';
  let activityDetail = null;
  const starsToAward = 5; // Enforce Stars: +5 Complete Activity

  if (isMongoConnected()) {
    try {
      sessionObj = await ActivitySessionModel.findOne({ _id: sessionId, studentId });
      if (sessionObj) {
        activityDetail = await ActivityModel.findOne({ activityId: sessionObj.activityId });
        
        sessionObj.status = SESSION_STATUS.COMPLETED;
        sessionObj.completedAt = new Date();
        if (sessionObj.startedAt) {
          sessionObj.actualDurationSeconds = Math.round((sessionObj.completedAt - sessionObj.startedAt) / 1000);
        } else {
          sessionObj.actualDurationSeconds = sessionObj.plannedDurationSeconds || 60;
        }

        sessionObj.starsEarned = starsToAward;
        
        if (feedback) {
          sessionObj.feedback = {
            rating: feedback.rating || null,
            emoji: feedback.emoji || null,
            comment: feedback.comment || null
          };
        }

        await sessionObj.save();

        // Update Student Profile Aggregate Stats
        const student = await getOrCreateMongoStudent(studentId, studentGrade);
        student.stats.totalSessionsCompleted += 1;
        student.stats.totalStarsEarned += starsToAward;
        student.stats.totalMinutesActive += Math.round(sessionObj.actualDurationSeconds / 60);
        await student.save();

        // Create Reward Record
        const rewardId = new mongoose.Types.ObjectId().toString();
        await ActivityRewardModel.create({
          studentId,
          activityId: sessionObj.activityId,
          sessionId: sessionObj._id,
          sourceModule,
          gradeAtReward: studentGrade,
          rewardType: REWARD_TYPES.STARS,
          rewardTrigger: REWARD_TRIGGERS.ACTIVITY_COMPLETED,
          starsEarned: starsToAward,
          eventId: rewardId
        });

        // Update Analytics
        const today = getTodayString();
        await ActivityAnalyticsModel.upsertForDate(studentId, sourceModule, studentGrade, today, {
          sessionsCompleted: 1,
          totalMinutesActive: Math.round(sessionObj.actualDurationSeconds / 60),
          totalStarsEarned: starsToAward
        });

        // Check and award badges dynamically
        await checkAndAwardBadges(studentId, studentGrade, sourceModule, null, false);
      }
    } catch (err) {
      console.error('Mongo complete activity failed:', err);
    }
  }

  // Fallback to local DB
  if (!sessionObj) {
    const db = readLocalDB();
    const idx = db.sessions.findIndex(s => s._id === sessionId && s.studentId === studentId);
    if (idx !== -1) {
      sessionObj = db.sessions[idx];
      sessionObj.status = SESSION_STATUS.COMPLETED;
      sessionObj.completedAt = new Date().toISOString();
      
      const started = sessionObj.startedAt ? new Date(sessionObj.startedAt) : null;
      const completed = new Date(sessionObj.completedAt);
      if (started) {
        sessionObj.actualDurationSeconds = Math.round((completed - started) / 1000);
      } else {
        sessionObj.actualDurationSeconds = sessionObj.plannedDurationSeconds || 60;
      }

      activityDetail = DEFAULT_ACTIVITIES.find(a => a.activityId === sessionObj.activityId) || DEFAULT_ACTIVITIES[0];
      sessionObj.starsEarned = starsToAward;

      if (feedback) {
        sessionObj.feedback = {
          rating: feedback.rating || null,
          emoji: feedback.emoji || null,
          comment: feedback.comment || null
        };
      }

      // Update Local Student
      const student = getOrCreateLocalStudent(db, studentId, studentGrade);
      student.stats.totalSessionsCompleted += 1;
      student.stats.totalStarsEarned += starsToAward;
      student.stats.totalMinutesActive += Math.round(sessionObj.actualDurationSeconds / 60);

      // Create Local Reward
      const rewardObj = {
        _id: new mongoose.Types.ObjectId().toString(),
        studentId,
        activityId: sessionObj.activityId,
        sessionId: sessionObj._id,
        sourceModule,
        gradeAtReward: studentGrade,
        rewardType: REWARD_TYPES.STARS,
        rewardTrigger: REWARD_TRIGGERS.ACTIVITY_COMPLETED,
        starsEarned: starsToAward,
        createdAt: new Date().toISOString(),
        isVoided: false
      };
      db.rewards.push(rewardObj);

      updateLocalAnalytics(db, studentId, sourceModule, studentGrade, getTodayString(), {
        sessionsCompleted: 1,
        totalMinutesActive: Math.round(sessionObj.actualDurationSeconds / 60),
        totalStarsEarned: starsToAward
      });
      writeLocalDB(db);

      // Check and award badges dynamically in local mode
      await checkAndAwardBadges(studentId, studentGrade, sourceModule, db, true);
    }
  }

  if (!sessionObj) {
    return res.status(404).json({ error: "Activity session not found." });
  }

  // Publish Upgraded Outbound Event
  eventBus.publish('ACTIVITY_COMPLETED', {
    studentId,
    activityId: sessionObj.activityId,
    sessionId: sessionObj._id.toString(),
    sourceModule,
    completedAt: sessionObj.completedAt,
    duration: sessionObj.actualDurationSeconds,
    feedback: sessionObj.feedback
  });

  // Keep older event name for compatibility
  eventBus.publish('EVENT_ACTIVITY_COMPLETED', {
    studentId,
    activityId: sessionObj.activityId,
    sessionId: sessionObj._id.toString(),
    sourceModule,
    completedAt: sessionObj.completedAt,
    duration: sessionObj.actualDurationSeconds,
    feedback: sessionObj.feedback
  });

  // Publish Upgraded Outbound Event
  eventBus.publish('REWARD_GRANTED', {
    studentId,
    rewardType: REWARD_TYPES.STARS,
    amount: starsToAward,
    source: 'PHYSICAL_ACTIVITY_ENGINE'
  });

  // Keep older event name for compatibility
  eventBus.publish('EVENT_REWARD_GRANTED', {
    studentId,
    rewardType: REWARD_TYPES.STARS,
    amount: starsToAward,
    source: 'PHYSICAL_ACTIVITY_ENGINE',
    badgeId: sessionObj.badgeEarned || null
  });

  const nextRec = await getNextRecommendedActivity(studentId, studentGrade, sourceModule);
  const engScore = await getEngagementScore(studentId, sourceModule);
  const rewardPts = await getRewardPoints(studentId, sourceModule);

  res.json({
    success: true,
    sessionId: sessionObj._id.toString(),
    activityId: sessionObj.activityId,
    engagementScore: engScore,
    rewardPoints: rewardPts,
    nextRecommendedActivity: nextRec
  });
};

/**
 * POST /activity/skip
 * Body: { studentId, sessionId, grade, sourceModule, skipReason, skipReasonDetail }
 */
export const skipActivity = async (req, res) => {
  const { studentId, sessionId, grade, sourceModule, skipReason, skipReasonDetail } = req.body;

  if (!studentId || !sessionId || !sourceModule || !skipReason) {
    return res.status(400).json({ error: "Missing required fields: 'studentId', 'sessionId', 'sourceModule', and 'skipReason' are required." });
  }

  // Verify skip reason is valid
  if (!Object.values(SKIP_REASONS).includes(skipReason)) {
    return res.status(400).json({ error: `Invalid skipReason. Valid reasons are: ${Object.values(SKIP_REASONS).join(', ')}` });
  }

  let sessionObj = null;
  const studentGrade = grade || 'KG';

  if (isMongoConnected()) {
    try {
      sessionObj = await ActivitySessionModel.findOne({ _id: sessionId, studentId });
      if (sessionObj) {
        sessionObj.status = SESSION_STATUS.SKIPPED;
        sessionObj.skippedAt = new Date();
        await sessionObj.save();

        // Create Skip Record
        await ActivitySkipModel.create({
          studentId,
          activityId: sessionObj.activityId,
          sessionId: sessionObj._id,
          sourceModule,
          gradeAtSkip: studentGrade,
          skippedAt: new Date(),
          skipReason,
          skipReasonDetail: skipReasonDetail || null,
          skippedBy: 'STUDENT'
        });

        // Update Student stats
        const student = await getOrCreateMongoStudent(studentId, studentGrade);
        student.stats.totalSessionsSkipped += 1;
        await student.save();

        // Update Analytics
        const today = getTodayString();
        await ActivityAnalyticsModel.upsertForDate(studentId, sourceModule, studentGrade, today, {
          sessionsSkipped: 1
        });
      }
    } catch (err) {
      console.error('Mongo skip activity failed:', err);
    }
  }

  // Fallback to local DB
  if (!sessionObj) {
    const db = readLocalDB();
    const idx = db.sessions.findIndex(s => s._id === sessionId && s.studentId === studentId);
    if (idx !== -1) {
      sessionObj = db.sessions[idx];
      sessionObj.status = SESSION_STATUS.SKIPPED;
      sessionObj.skippedAt = new Date().toISOString();

      const skipObj = {
        _id: new mongoose.Types.ObjectId().toString(),
        studentId,
        activityId: sessionObj.activityId,
        sessionId: sessionObj._id,
        sourceModule,
        gradeAtSkip: studentGrade,
        skippedAt: sessionObj.skippedAt,
        skipReason,
        skipReasonDetail: skipReasonDetail || null,
        skippedBy: 'STUDENT'
      };
      db.skips.push(skipObj);

      const student = getOrCreateLocalStudent(db, studentId, studentGrade);
      student.stats.totalSessionsSkipped += 1;

      updateLocalAnalytics(db, studentId, sourceModule, studentGrade, getTodayString(), {
        sessionsSkipped: 1
      });
      writeLocalDB(db);
    }
  }

  if (!sessionObj) {
    return res.status(404).json({ error: "Activity session not found." });
  }

  // Publish Integration Event
  eventBus.publish('ACTIVITY_SKIPPED', {
    studentId,
    activityId: sessionObj.activityId,
    sessionId: sessionObj._id.toString(),
    sourceModule,
    skippedAt: sessionObj.skippedAt,
    reason: skipReason
  });

  // Keep older event name for compatibility
  eventBus.publish('EVENT_ACTIVITY_SKIPPED', {
    studentId,
    activityId: sessionObj.activityId,
    sessionId: sessionObj._id.toString(),
    sourceModule,
    skippedAt: sessionObj.skippedAt,
    reason: skipReason
  });

  // Check consecutive skips for Parent Skip Alert
  const skipsCount = await getConsecutiveSkips(studentId);
  if (skipsCount >= 10) {
    await triggerParentSkipAlert(studentId, studentGrade, sourceModule);
  }

  const nextRec = await getNextRecommendedActivity(studentId, studentGrade, sourceModule);
  const engScore = await getEngagementScore(studentId, sourceModule);
  const rewardPts = await getRewardPoints(studentId, sourceModule);

  res.json({
    success: true,
    sessionId: sessionObj._id.toString(),
    activityId: sessionObj.activityId,
    engagementScore: engScore,
    rewardPoints: rewardPts,
    nextRecommendedActivity: nextRec
  });
};

/**
 * GET /activity/history
 * Query: studentId, grade, sourceModule
 */
export const getHistory = async (req, res) => {
  const { studentId, grade, sourceModule } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: "Missing required query parameter: 'studentId' is required." });
  }

  const studentGrade = grade || 'KG';
  let history = [];

  if (isMongoConnected()) {
    try {
      const filter = { studentId };
      if (sourceModule) {
        filter.sourceModule = sourceModule;
      }
      history = await ActivitySessionModel.find(filter).sort({ assignedAt: -1 }).limit(50);
    } catch (err) {
      console.error('Mongo get history failed:', err);
    }
  } else {
    const db = readLocalDB();
    history = db.sessions.filter(s => s.studentId === studentId);
    if (sourceModule) {
      history = history.filter(s => s.sourceModule === sourceModule);
    }
    // Sort descending
    history.sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
  }

  const nextRec = await getNextRecommendedActivity(studentId, studentGrade, sourceModule);
  const engScore = await getEngagementScore(studentId, sourceModule);
  const rewardPts = await getRewardPoints(studentId, sourceModule);

  res.json({
    success: true,
    history,
    engagementScore: engScore,
    rewardPoints: rewardPts,
    nextRecommendedActivity: nextRec
  });
};

/**
 * GET /activity/report
 * Query: studentId, grade, sourceModule
 */
export const getReport = async (req, res) => {
  const { studentId, grade, sourceModule } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: "Missing required query parameter: 'studentId' is required." });
  }

  const studentGrade = grade || 'KG';
  let report = {
    totalMinutesActive: 0,
    sessionsAssigned: 0,
    sessionsCompleted: 0,
    sessionsSkipped: 0,
    completionRate: 0,
    skipRate: 0,
    categoryBreakdown: {},
    skipReasonTally: {}
  };

  if (isMongoConnected()) {
    try {
      const filter = { studentId };
      if (sourceModule) {
        filter.sourceModule = sourceModule;
      }
      const analyticsRecords = await ActivityAnalyticsModel.find(filter);
      
      // Sum up everything
      analyticsRecords.forEach(rec => {
        report.sessionsAssigned += rec.sessionsAssigned;
        report.sessionsCompleted += rec.sessionsCompleted;
        report.sessionsSkipped += rec.sessionsSkipped;
        report.totalMinutesActive += rec.totalMinutesActive;

        // Tally categories
        if (rec.categoryBreakdown && Array.isArray(rec.categoryBreakdown)) {
          rec.categoryBreakdown.forEach(cat => {
            if (!report.categoryBreakdown[cat.category]) {
              report.categoryBreakdown[cat.category] = 0;
            }
            report.categoryBreakdown[cat.category] += cat.sessionsCompleted;
          });
        }

        // Tally skip reasons
        if (rec.skipReasonTally && Array.isArray(rec.skipReasonTally)) {
          rec.skipReasonTally.forEach(sr => {
            if (!report.skipReasonTally[sr.reason]) {
              report.skipReasonTally[sr.reason] = 0;
            }
            report.skipReasonTally[sr.reason] += sr.count;
          });
        }
      });

      // Recalculate rates
      if (report.sessionsAssigned > 0) {
        report.completionRate = parseFloat((report.sessionsCompleted / report.sessionsAssigned).toFixed(2));
        report.skipRate = parseFloat((report.sessionsSkipped / report.sessionsAssigned).toFixed(2));
      }
    } catch (err) {
      console.error('Mongo get report failed:', err);
    }
  } else {
    const db = readLocalDB();
    const records = db.analytics.filter(a => a.studentId === studentId && (!sourceModule || a.sourceModule === sourceModule));
    
    records.forEach(rec => {
      report.sessionsAssigned += rec.sessionsAssigned;
      report.sessionsCompleted += rec.sessionsCompleted;
      report.sessionsSkipped += rec.sessionsSkipped;
      report.totalMinutesActive += rec.totalMinutesActive;
    });

    // Tally categories from completed sessions
    let sessions = db.sessions.filter(s => s.studentId === studentId && (!sourceModule || s.sourceModule === sourceModule));
    sessions.forEach(s => {
      if (s.status === SESSION_STATUS.COMPLETED) {
        const act = DEFAULT_ACTIVITIES.find(a => a.activityId === s.activityId) || DEFAULT_ACTIVITIES[0];
        if (act) {
          report.categoryBreakdown[act.category] = (report.categoryBreakdown[act.category] || 0) + 1;
        }
      }
    });

    // Tally skip reasons from skips
    let skips = db.skips.filter(sk => sk.studentId === studentId && (!sourceModule || sk.sourceModule === sourceModule));
    skips.forEach(sk => {
      report.skipReasonTally[sk.skipReason] = (report.skipReasonTally[sk.skipReason] || 0) + 1;
    });

    // Recalculate rates
    if (report.sessionsAssigned > 0) {
      report.completionRate = parseFloat((report.sessionsCompleted / report.sessionsAssigned).toFixed(2));
      report.skipRate = parseFloat((report.sessionsSkipped / report.sessionsAssigned).toFixed(2));
    }
  }

  const nextRec = await getNextRecommendedActivity(studentId, studentGrade, sourceModule);
  const engScore = await getEngagementScore(studentId, sourceModule);
  const rewardPts = await getRewardPoints(studentId, sourceModule);

  res.json({
    success: true,
    report,
    engagementScore: engScore,
    rewardPoints: rewardPts,
    nextRecommendedActivity: nextRec
  });
};

/**
 * GET /activity/recommendation
 * Query: studentId, grade, sourceModule
 */
export const getRecommendation = async (req, res) => {
  const { studentId, grade, sourceModule } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: "Missing required query parameter: 'studentId' is required." });
  }

  const studentGrade = grade || 'KG';
  
  const nextRec = await getNextRecommendedActivity(studentId, studentGrade, sourceModule);
  const engScore = await getEngagementScore(studentId, sourceModule);
  const rewardPts = await getRewardPoints(studentId, sourceModule);

  res.json({
    success: true,
    activityId: nextRec ? nextRec.activityId : null,
    nextRecommendedActivity: nextRec,
    engagementScore: engScore,
    rewardPoints: rewardPts
  });
};

/**
 * POST /activity/instructor-recommend
 * Body: { studentId, grade, performanceScore, attentionScore, moodScore, sessionDuration, completedModule }
 */
export const recommendForInstructor = async (req, res) => {
  const {
    studentId,
    grade,
    performanceScore,
    attentionScore,
    moodScore,
    sessionDuration,
    completedModule
  } = req.body;

  /* MAIN_AI_INPUT */
  // Future AI model inputs telemetry check hook
  if (!studentId || !grade) {
    return res.status(400).json({ error: "Missing required fields: 'studentId' and 'grade' are required." });
  }

  const perf = typeof performanceScore === 'number' ? performanceScore : 50;
  const att = typeof attentionScore === 'number' ? attentionScore : 50;
  const mood = typeof moodScore === 'number' ? moodScore : 50;
  const sessionDur = typeof sessionDuration === 'number' ? sessionDuration : 1800;
  const sourceModule = completedModule || 'MATH_APP';

  const targetGrade = grade;
  let catalog = DEFAULT_ACTIVITIES;

  if (isMongoConnected()) {
    try {
      const dbActivities = await ActivityModel.find({ isActive: true });
      if (dbActivities.length > 0) {
        catalog = dbActivities;
      }
    } catch (err) {
      console.error('Error fetching catalog for instructor AI recommendation:', err);
    }
  }

  // Filter activities by grade
  let candidates = catalog.filter(a => a.gradeLevels.includes(targetGrade));
  if (candidates.length === 0) {
    candidates = catalog;
  }

  // Heuristics mapping inputs to category recommendations
  let selectedActivity = null;

  if (att < 50) {
    // Low attention: suggest active/dance to revive focus
    const activeActs = candidates.filter(a => ['cardio', 'dance'].includes(a.category));
    if (activeActs.length > 0) {
      selectedActivity = activeActs[Math.floor(Math.random() * activeActs.length)];
    }
  } 
  
  if (!selectedActivity && sessionDur > 1800) {
    // Long session: suggest stretching/mindfulness to ease desk fatigue
    const relaxActs = candidates.filter(a => ['stretching', 'mindfulness', 'breathing'].includes(a.category));
    if (relaxActs.length > 0) {
      selectedActivity = relaxActs[Math.floor(Math.random() * relaxActs.length)];
    }
  }

  if (!selectedActivity && mood < 50) {
    // Low mood: suggest a fun dance game
    const funActs = candidates.filter(a => ['dance', 'cardio'].includes(a.category));
    if (funActs.length > 0) {
      selectedActivity = funActs[Math.floor(Math.random() * funActs.length)];
    }
  }

  // Default fallback if no heuristics met or matched
  if (!selectedActivity) {
    selectedActivity = candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Heuristic adjustments for difficulty and duration
  let diffLevel = selectedActivity.difficultyLevel;
  if (perf > 85) {
    diffLevel = Math.min(diffLevel + 1, 5); // scale up challenge
  } else if (perf < 40) {
    diffLevel = Math.max(diffLevel - 1, 1); // scale down challenge
  }

  let actDuration = selectedActivity.durationSeconds;
  if (att < 45) {
    actDuration = Math.max(30, Math.round(actDuration * 0.7)); // keep it short
  } else if (sessionDur > 2400) {
    actDuration = actDuration + 30; // slightly longer break
  }

  /* MAIN_AI_OUTPUT */
  // Future AI model outputs prediction calculation hook
  const engagementPrediction = Math.min(100, Math.max(0, Math.round(
    (att * 0.4) + (mood * 0.4) + (perf > 60 ? 20 : 10)
  )));

  /* MAIN_AI_CALLBACK */
  // Future AI integration callback hook
  // Publish ecosystem event to update mood state in real time
  eventBus.publish('EVENT_MOOD_UPDATED', {
    studentId,
    mood: mood < 40 ? 'tired' : (mood > 70 ? 'excited' : 'calm'),
    confidence: 0.85,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    recommendedActivity: {
      ...selectedActivity.toObject ? selectedActivity.toObject() : selectedActivity,
      difficultyLevel: diffLevel,
      durationSeconds: actDuration
    },
    difficultyLevel: diffLevel,
    activityDuration: actDuration,
    engagementPrediction
  });
};

/**
 * GET /activity/skip-analytics
 * Query: studentId (optional)
 */
export const getSkipAnalytics = async (req, res) => {
  const { studentId } = req.query;
  
  let skipTrends = [];
  let mostSkippedActivities = [];
  let consecutiveSkipsCount = 0;
  let studentsWithMultipleSkips = [];

  if (isMongoConnected()) {
    try {
      // 1. Skip Trends (Group by date and reason)
      const trends = await ActivitySkipModel.aggregate([
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$skippedAt" } },
              reason: "$skipReason"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": -1 } }
      ]);
      skipTrends = trends.map(t => ({
        date: t._id.date,
        reason: t._id.reason,
        count: t.count
      }));

      // 2. Most Skipped Activities
      const skipped = await ActivitySkipModel.aggregate([
        {
          $group: {
            _id: "$activityId",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      // Map activity details
      for (const item of skipped) {
        const act = await ActivityModel.findOne({ activityId: item._id });
        mostSkippedActivities.push({
          activityId: item._id,
          title: act ? act.title : item._id,
          emoji: act ? act.emoji : "🏃",
          category: act ? act.category : "unknown",
          count: item.count
        });
      }

      // 3. Consecutive Skip Detection for a specific student
      if (studentId) {
        const recent = await ActivitySessionModel.find({ studentId })
          .sort({ assignedAt: -1 })
          .limit(10);
        for (const sess of recent) {
          if (sess.status === SESSION_STATUS.SKIPPED) {
            consecutiveSkipsCount++;
          } else if (sess.status === SESSION_STATUS.COMPLETED) {
            break;
          }
        }
      }

      // 4. Global Consecutive Skip Detection (flag students who skipped last 3 sessions)
      const allActiveSessions = await ActivitySessionModel.aggregate([
        { $sort: { studentId: 1, assignedAt: -1 } },
        {
          $group: {
            _id: "$studentId",
            sessions: { $push: "$$ROOT" }
          }
        }
      ]);
      
      allActiveSessions.forEach(group => {
        let count = 0;
        for (const sess of group.sessions) {
          if (sess.status === SESSION_STATUS.SKIPPED) {
            count++;
          } else if (sess.status === SESSION_STATUS.COMPLETED) {
            break;
          }
        }
        if (count >= 3) {
          studentsWithMultipleSkips.push({
            studentId: group._id,
            consecutiveSkips: count
          });
        }
      });

    } catch (err) {
      console.error('Mongo skip analytics failed:', err);
    }
  } else {
    // Fallback Local JSON Database
    const db = readLocalDB();
    
    // 1. Skip Trends
    const trendsMap = {};
    db.skips.forEach(sk => {
      const date = sk.skippedAt.split('T')[0];
      const key = `${date}_${sk.skipReason}`;
      trendsMap[key] = (trendsMap[key] || 0) + 1;
    });
    skipTrends = Object.keys(trendsMap).map(key => {
      const [date, reason] = key.split('_');
      return { date, reason, count: trendsMap[key] };
    });
    skipTrends.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 2. Most Skipped Activities
    const countsMap = {};
    db.skips.forEach(sk => {
      countsMap[sk.activityId] = (countsMap[sk.activityId] || 0) + 1;
    });
    const sorted = Object.keys(countsMap).map(id => ({
      activityId: id,
      count: countsMap[id]
    })).sort((a, b) => b.count - a.count).slice(0, 10);

    sorted.forEach(item => {
      const act = DEFAULT_ACTIVITIES.find(a => a.activityId === item.activityId) || DEFAULT_ACTIVITIES[0];
      mostSkippedActivities.push({
        activityId: item.activityId,
        title: act ? act.title : item.activityId,
        emoji: act ? act.emoji : "🏃",
        category: act ? act.category : "unknown",
        count: item.count
      });
    });

    // 3. Consecutive Skips for studentId
    if (studentId) {
      const recent = db.sessions
        .filter(s => s.studentId === studentId)
        .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
      for (const sess of recent) {
        if (sess.status === SESSION_STATUS.SKIPPED) {
          consecutiveSkipsCount++;
        } else if (sess.status === SESSION_STATUS.COMPLETED) {
          break;
        }
      }
    }

    // 4. Global Detection
    const studentSessMap = {};
    db.sessions.forEach(s => {
      if (!studentSessMap[s.studentId]) {
        studentSessMap[s.studentId] = [];
      }
      studentSessMap[s.studentId].push(s);
    });

    Object.keys(studentSessMap).forEach(sId => {
      const recent = studentSessMap[sId].sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
      let count = 0;
      for (const sess of recent) {
        if (sess.status === SESSION_STATUS.SKIPPED) {
          count++;
        } else if (sess.status === SESSION_STATUS.COMPLETED) {
          break;
        }
      }
      if (count >= 3) {
        studentsWithMultipleSkips.push({
          studentId: sId,
          consecutiveSkips: count
        });
      }
    });
  }

  res.json({
    success: true,
    skipTrends,
    mostSkippedActivities,
    consecutiveSkips: consecutiveSkipsCount,
    flaggedStudents: studentsWithMultipleSkips
  });
};

/**
 * GET /activity/parent-report
 * Query: studentId
 */
export const getParentReport = async (req, res) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: "Missing required query parameter: 'studentId' is required." });
  }

  let totalActivities = 0;
  let completedActivities = 0;
  let skippedActivities = 0;
  let completionRate = 0;
  let skipRate = 0;
  let weeklyTrends = [];
  let monthlyTrends = [];
  let alerts = [];

  let sessions = [];

  if (isMongoConnected()) {
    try {
      sessions = await ActivitySessionModel.find({ studentId }).sort({ assignedAt: 1 });
    } catch (err) {
      console.error('Mongo get parent report sessions failed:', err);
    }
  } else {
    const db = readLocalDB();
    sessions = db.sessions.filter(s => s.studentId === studentId);
    sessions.sort((a, b) => new Date(a.assignedAt) - new Date(b.assignedAt));
  }

  totalActivities = sessions.length;
  completedActivities = sessions.filter(s => s.status === SESSION_STATUS.COMPLETED).length;
  skippedActivities = sessions.filter(s => s.status === SESSION_STATUS.SKIPPED).length;

  if (totalActivities > 0) {
    completionRate = parseFloat((completedActivities / totalActivities).toFixed(2));
    skipRate = parseFloat((skippedActivities / totalActivities).toFixed(2));
  }

  // 1. Weekly Trends (group by week)
  const weeksMap = {};
  sessions.forEach(s => {
    const date = new Date(s.assignedAt);
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    const weekStr = `${date.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    
    if (!weeksMap[weekStr]) {
      weeksMap[weekStr] = { week: weekStr, assigned: 0, completed: 0, skipped: 0 };
    }
    weeksMap[weekStr].assigned += 1;
    if (s.status === SESSION_STATUS.COMPLETED) weeksMap[weekStr].completed += 1;
    if (s.status === SESSION_STATUS.SKIPPED) weeksMap[weekStr].skipped += 1;
  });
  weeklyTrends = Object.values(weeksMap).sort((a, b) => a.week.localeCompare(b.week));

  // 2. Monthly Trends (group by month)
  const monthsMap = {};
  sessions.forEach(s => {
    const date = new Date(s.assignedAt);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthsMap[monthStr]) {
      monthsMap[monthStr] = { month: monthStr, assigned: 0, completed: 0, skipped: 0 };
    }
    monthsMap[monthStr].assigned += 1;
    if (s.status === SESSION_STATUS.COMPLETED) monthsMap[monthStr].completed += 1;
    if (s.status === SESSION_STATUS.SKIPPED) monthsMap[monthStr].skipped += 1;
  });
  monthlyTrends = Object.values(monthsMap).sort((a, b) => a.month.localeCompare(b.month));

  // 3. Alerts Generation & Integration hooks
  // Alert A: 3 Consecutive Skips
  let consecutiveSkips = 0;
  const recentSessions = [...sessions].sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
  for (const s of recentSessions) {
    if (s.status === SESSION_STATUS.SKIPPED) {
      consecutiveSkips++;
    } else if (s.status === SESSION_STATUS.COMPLETED) {
      break;
    }
  }

  if (consecutiveSkips >= 3) {
    alerts.push({
      type: "CONSECUTIVE_SKIPS",
      title: "3 Consecutive Skips",
      message: `Your child has skipped the last ${consecutiveSkips} activity breaks. They might be finding them too challenging or lack interest.`,
      severity: "critical"
    });
    eventBus.publish('PARENT_ALERT_GENERATED', {
      studentId,
      alertType: 'CONSECUTIVE_SKIPS',
      message: `3 Consecutive Skips detected. Count: ${consecutiveSkips}`,
      severity: 'critical'
    });
  }

  // Alert B: Low Activity Participation
  if (totalActivities >= 3 && completionRate < 0.30) {
    alerts.push({
      type: "LOW_PARTICIPATION",
      title: "Low Activity Participation",
      message: `Activity break participation is low (only ${Math.round(completionRate * 100)}% completed). Try encouraging shorter stretching exercises first.`,
      severity: "warning"
    });
    eventBus.publish('PARENT_ALERT_GENERATED', {
      studentId,
      alertType: 'LOW_PARTICIPATION',
      message: `Low Activity Participation: ${Math.round(completionRate * 100)}%`,
      severity: 'warning'
    });
  }

  // Alert C: High Engagement Achievement
  if (completedActivities >= 5 && completionRate >= 0.80) {
    alerts.push({
      type: "HIGH_ENGAGEMENT",
      title: "High Engagement Achievement",
      message: `Super Explorer! Your child has completed ${completedActivities} breaks this month with an outstanding ${Math.round(completionRate * 100)}% completion rate!`,
      severity: "success"
    });
    eventBus.publish('PARENT_ALERT_GENERATED', {
      studentId,
      alertType: 'HIGH_ENGAGEMENT',
      message: `High Engagement Achievement. Completed: ${completedActivities}, Rate: ${Math.round(completionRate * 100)}%`,
      severity: 'success'
    });
  }

  // Publish Parent Dashboard Update Hook
  const metrics = {
    totalActivities,
    completedActivities,
    skippedActivities,
    completionRate,
    skipRate,
    weeklyTrends,
    monthlyTrends,
    alerts
  };

  eventBus.publish('PARENT_DASHBOARD_UPDATE', {
    studentId,
    metrics
  });

  res.json({
    success: true,
    studentId,
    ...metrics
  });
};

/**
 * GET /activity/teacher-analytics
 * Query: grade (optional)
 */
export const getTeacherAnalytics = async (req, res) => {
  const { grade } = req.query;

  let classParticipation = 0;
  let gradeParticipation = [];
  let activityTrends = [];
  let mostSkippedActivities = [];
  let mostCompletedActivities = [];
  let studentEngagementScores = [];

  let sessions = [];
  let skips = [];
  let students = [];

  if (isMongoConnected()) {
    try {
      const filter = grade ? { gradeAtSession: grade } : {};
      sessions = await ActivitySessionModel.find(filter);
      
      const skipFilter = grade ? { gradeAtSkip: grade } : {};
      skips = await ActivitySkipModel.find(skipFilter);

      const studentFilter = grade ? { grade: grade } : {};
      students = await StudentModel.find(studentFilter);
    } catch (err) {
      console.error('Mongo get teacher analytics failed:', err);
    }
  } else {
    const db = readLocalDB();
    sessions = db.sessions;
    if (grade) {
      sessions = sessions.filter(s => s.gradeAtSession === grade);
    }
    
    skips = db.skips;
    if (grade) {
      skips = skips.filter(sk => sk.gradeAtSkip === grade);
    }

    students = Object.values(db.students);
    if (grade) {
      students = students.filter(st => st.grade === grade);
    }
  }

  // 1. Class Participation
  const totalAssigned = sessions.length;
  const totalCompleted = sessions.filter(s => s.status === SESSION_STATUS.COMPLETED).length;
  if (totalAssigned > 0) {
    classParticipation = Math.round((totalCompleted / totalAssigned) * 100);
  }

  // 2. Grade Participation (KG to Grade 6)
  const gradeMap = {};
  ['KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].forEach(g => {
    gradeMap[g] = { grade: g, assigned: 0, completed: 0, skipped: 0 };
  });

  let allSessions = [];
  if (isMongoConnected()) {
    try {
      allSessions = await ActivitySessionModel.find({});
    } catch (err) {
      console.error(err);
    }
  } else {
    const db = readLocalDB();
    allSessions = db.sessions;
  }

  allSessions.forEach(s => {
    const g = s.gradeAtSession;
    if (gradeMap[g]) {
      gradeMap[g].assigned += 1;
      if (s.status === SESSION_STATUS.COMPLETED) gradeMap[g].completed += 1;
      if (s.status === SESSION_STATUS.SKIPPED) gradeMap[g].skipped += 1;
    }
  });
  gradeParticipation = Object.values(gradeMap);

  // 3. Activity Trends (Group by date)
  const dateMap = {};
  sessions.forEach(s => {
    const date = new Date(s.assignedAt).toISOString().split('T')[0];
    if (!dateMap[date]) {
      dateMap[date] = { date, assigned: 0, completed: 0, skipped: 0 };
    }
    dateMap[date].assigned += 1;
    if (s.status === SESSION_STATUS.COMPLETED) dateMap[date].completed += 1;
    if (s.status === SESSION_STATUS.SKIPPED) dateMap[date].skipped += 1;
  });
  activityTrends = Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15);

  // 4. Most Completed Activities
  const completedCounts = {};
  sessions.forEach(s => {
    if (s.status === SESSION_STATUS.COMPLETED) {
      completedCounts[s.activityId] = (completedCounts[s.activityId] || 0) + 1;
    }
  });
  mostCompletedActivities = Object.keys(completedCounts).map(id => {
    const act = DEFAULT_ACTIVITIES.find(a => a.activityId === id) || DEFAULT_ACTIVITIES[0];
    return {
      activityId: id,
      title: act ? act.title : id,
      emoji: act ? act.emoji : "🏃",
      category: act ? act.category : "unknown",
      count: completedCounts[id]
    };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  // 5. Most Skipped Activities
  const skippedCounts = {};
  sessions.forEach(s => {
    if (s.status === SESSION_STATUS.SKIPPED) {
      skippedCounts[s.activityId] = (skippedCounts[s.activityId] || 0) + 1;
    }
  });
  mostSkippedActivities = Object.keys(skippedCounts).map(id => {
    const act = DEFAULT_ACTIVITIES.find(a => a.activityId === id) || DEFAULT_ACTIVITIES[0];
    return {
      activityId: id,
      title: act ? act.title : id,
      emoji: act ? act.emoji : "🏃",
      category: act ? act.category : "unknown",
      count: skippedCounts[id]
    };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  // 6. Student Engagement Scores
  const studentSessions = {};
  sessions.forEach(s => {
    if (!studentSessions[s.studentId]) {
      studentSessions[s.studentId] = [];
    }
    studentSessions[s.studentId].push(s);
  });

  students.forEach(st => {
    const sId = st.studentId;
    const sList = studentSessions[sId] || [];
    const assigned = sList.length;
    const completed = sList.filter(s => s.status === SESSION_STATUS.COMPLETED).length;
    let score = 0;
    if (assigned > 0) {
      score = Math.round((completed / assigned) * 100);
    }
    studentEngagementScores.push({
      studentId: sId,
      displayName: st.displayName,
      completed,
      assigned,
      engagementScore: score
    });
  });

  studentEngagementScores.sort((a, b) => b.engagementScore - a.engagementScore);

  const analytics = {
    classParticipation,
    gradeParticipation,
    activityTrends,
    mostSkippedActivities,
    mostCompletedActivities,
    studentEngagementScores
  };

  // Publish Integration Hooks
  eventBus.publish('TEACHER_REPORT_UPDATE', {
    grade: grade || 'All Grades',
    analytics
  });

  eventBus.publish('CLASS_ANALYTICS_UPDATE', {
    grade: grade || 'All Grades',
    analytics
  });

  res.json({
    success: true,
    grade: grade || 'All Grades',
    ...analytics
  });
};

/**
 * POST /activity/rewards/grant
 * Exposes API for Main EduCare Rewards Engine.
 */
export const grantReward = async (req, res) => {
  const { studentId, grade, sourceModule, rewardType, starsEarned, badgeId, badgeLabel, badgeIcon } = req.body;

  if (!studentId || !sourceModule || !rewardType) {
    return res.status(400).json({ error: "Missing required fields: 'studentId', 'sourceModule', and 'rewardType' are required." });
  }

  const studentGrade = grade || 'Grade 2';
  const type = rewardType.toUpperCase();
  const rewardId = new mongoose.Types.ObjectId().toString();

  if (isMongoConnected()) {
    try {
      const student = await getOrCreateMongoStudent(studentId, studentGrade);
      
      let badgeEarned = null;
      if (type === REWARD_TYPES.BADGE || badgeId) {
        badgeEarned = badgeId || 'badge_generic';
        if (student.badges && !student.badges.includes(badgeEarned)) {
          student.badges.push(badgeEarned);
          student.stats.totalBadgesEarned += 1;
        }
      }

      const stars = typeof starsEarned === 'number' ? starsEarned : (type === REWARD_TYPES.STARS ? 5 : 0);
      student.stats.totalStarsEarned += stars;
      await student.save();

      await ActivityRewardModel.create({
        studentId,
        sourceModule,
        gradeAtReward: studentGrade,
        rewardType: type,
        rewardTrigger: REWARD_TRIGGERS.SYSTEM_GRANT,
        starsEarned: stars,
        badgeId: badgeEarned,
        badgeLabel: badgeLabel || (badgeEarned ? 'Granted Badge' : null),
        badgeIcon: badgeIcon || (badgeEarned ? '🏆' : null),
        eventId: rewardId
      });

      // Emit reward events
      eventBus.publish('REWARD_GRANTED', {
        studentId,
        rewardType: type,
        amount: stars,
        source: 'REWARD_ENGINE',
        badgeId: badgeEarned
      });

      if (badgeEarned) {
        eventBus.publish('BADGE_UNLOCKED', {
          studentId,
          badgeId: badgeEarned,
          badgeLabel: badgeLabel || 'Granted Badge',
          badgeIcon: badgeIcon || '🏆',
          source: 'REWARD_ENGINE'
        });
      }

      const totalStars = await getRewardPoints(studentId, sourceModule);

      return res.json({
        success: true,
        rewardId,
        studentId,
        stars: totalStars,
        badges: student.badges || []
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    // Local DB Fallback
    const db = readLocalDB();
    const student = getOrCreateLocalStudent(db, studentId, studentGrade);

    let badgeEarned = null;
    if (type === REWARD_TYPES.BADGE || badgeId) {
      badgeEarned = badgeId || 'badge_generic';
      if (!student.badges) student.badges = [];
      if (!student.badges.includes(badgeEarned)) {
        student.badges.push(badgeEarned);
        student.stats.totalBadgesEarned += 1;
      }
    }

    const stars = typeof starsEarned === 'number' ? starsEarned : (type === REWARD_TYPES.STARS ? 5 : 0);
    student.stats.totalStarsEarned += stars;

    const rewardObj = {
      _id: rewardId,
      studentId,
      sourceModule,
      gradeAtReward: studentGrade,
      rewardType: type,
      rewardTrigger: REWARD_TRIGGERS.SYSTEM_GRANT,
      starsEarned: stars,
      badgeId: badgeEarned,
      badgeLabel: badgeLabel || (badgeEarned ? 'Granted Badge' : null),
      badgeIcon: badgeIcon || (badgeEarned ? '🏆' : null),
      createdAt: new Date().toISOString(),
      isVoided: false
    };
    db.rewards.push(rewardObj);
    writeLocalDB(db);

    // Emit reward events
    eventBus.publish('REWARD_GRANTED', {
      studentId,
      rewardType: type,
      amount: stars,
      source: 'REWARD_ENGINE',
      badgeId: badgeEarned
    });

    if (badgeEarned) {
      eventBus.publish('BADGE_UNLOCKED', {
        studentId,
        badgeId: badgeEarned,
        badgeLabel: badgeLabel || 'Granted Badge',
        badgeIcon: badgeIcon || '🏆',
        source: 'REWARD_ENGINE'
      });
    }

    const totalStars = await getRewardPoints(studentId, sourceModule);

    return res.json({
      success: true,
      rewardId,
      studentId,
      stars: totalStars,
      badges: student.badges || []
    });
  }
};

/**
 * GET /activity/rewards
 * Fetch student stars and badges list.
 */
export const getRewardsList = async (req, res) => {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: "Missing required query parameter: 'studentId' is required." });
  }

  if (isMongoConnected()) {
    try {
      const student = await StudentModel.findOne({ studentId });
      const rewards = await ActivityRewardModel.find({ studentId, isVoided: false });
      const badges = rewards.filter(r => r.rewardType === 'BADGE' || r.badgeId).map(r => ({
        badgeId: r.badgeId,
        badgeLabel: r.badgeLabel || 'Earned Badge',
        badgeIcon: r.badgeIcon || '🏆',
        unlockedAt: r.createdAt
      }));

      // Deduplicate badges
      const uniqueBadges = [];
      const seen = new Set();
      badges.forEach(b => {
        if (b.badgeId && !seen.has(b.badgeId)) {
          seen.add(b.badgeId);
          uniqueBadges.push(b);
        }
      });

      const totalStars = student ? student.stats.totalStarsEarned : 15;

      return res.json({
        success: true,
        studentId,
        totalStars,
        badges: uniqueBadges
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const db = readLocalDB();
    const student = db.students[studentId];
    const studentRewards = db.rewards.filter(r => r.studentId === studentId && !r.isVoided);
    const badges = studentRewards.filter(r => r.rewardType === 'BADGE' || r.badgeId).map(r => ({
      badgeId: r.badgeId,
      badgeLabel: r.badgeLabel || 'Earned Badge',
      badgeIcon: r.badgeIcon || '🏆',
      unlockedAt: r.createdAt
    }));

    const uniqueBadges = [];
    const seen = new Set();
    badges.forEach(b => {
      if (b.badgeId && !seen.has(b.badgeId)) {
        seen.add(b.badgeId);
        uniqueBadges.push(b);
      }
    });

    const totalStars = student ? student.stats.totalStarsEarned : 15;

    return res.json({
      success: true,
      studentId,
      totalStars,
      badges: uniqueBadges
    });
  }
};

// Initialize Cross Application Trigger Engine
initializeTriggerEngine();
