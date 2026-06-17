import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { ProgressModel } from '../models/Progress.js';
import { getAdaptiveLesson, getSTEMRecommendation, SYLLABUS } from '../lessonEngine.js';
import { validateCircuit } from '../circuitValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback Local File Database setup
const DB_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DB_DIR, 'db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const defaultData = {
  studentId: 'default_student',
  grade: 'KG',
  completedLessons: [],
  completedCircuits: [],
  stars: 15,
  level: 1,
  badges: [],
  readinessScore: 0
};

const readLocalDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return defaultData;
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

// Helper to calculate score and level
function updateProgressCalculations(data) {
  const stars = data.stars || 15;
  const grade = data.grade || 'KG';
  const completedLessons = data.completedLessons || [];
  
  const level = Math.floor(completedLessons.length / 5) + 1;
  
  let totalRequirement = 2;
  let completedRequirement = 0;
  
  if (grade === 'KG') {
    completedRequirement += completedLessons.includes('lesson-kg-std') ? 1 : 0;
    completedRequirement += completedLessons.includes('lesson-kg-adv') ? 1 : 0;
    totalRequirement = 2;
  } else if (grade === 'Grade 1') {
    completedRequirement += completedLessons.includes('lesson-g1-std') ? 1 : 0;
    completedRequirement += completedLessons.includes('lesson-g1-adv') ? 1 : 0;
    completedRequirement += completedLessons.includes('sim_preset_BATTERY_LED') ? 1 : 0;
    totalRequirement = 3;
  } else if (grade === 'Grade 2') {
    completedRequirement += completedLessons.includes('lesson-g2-std') ? 1 : 0;
    completedRequirement += completedLessons.includes('lesson-g2-adv') ? 1 : 0;
    completedRequirement += completedLessons.includes('sim_preset_OPEN_CLOSED') ? 1 : 0;
    totalRequirement = 3;
  } else if (grade === 'Grade 3') {
    completedRequirement += completedLessons.includes('lesson-g3-std') ? 1 : 0;
    completedRequirement += completedLessons.includes('lesson-g3-adv') ? 1 : 0;
    completedRequirement += completedLessons.includes('sim_preset_TORCH') ? 1 : 0;
    totalRequirement = 3;
  } else if (grade === 'Grade 4') {
    completedRequirement += completedLessons.includes('lesson-g4-std') ? 1 : 0;
    completedRequirement += completedLessons.includes('lesson-g4-adv') ? 1 : 0;
    completedRequirement += completedLessons.includes('sim_preset_TRAFFIC_LIGHT') ? 1 : 0;
    totalRequirement = 3;
  }
  
  const readinessScore = Math.round((completedRequirement / totalRequirement) * 100);
  
  return {
    ...data,
    level,
    readinessScore
  };
}

// Controller Actions

// GET /stem/progress
export const getProgress = async (req, res) => {
  const useMongoDB = mongooseConnectionActive();
  if (useMongoDB) {
    try {
      let progress = await ProgressModel.findOne({ studentId: 'default_student' });
      if (!progress) {
        progress = await ProgressModel.create(defaultData);
      }
      return res.json(progress);
    } catch (err) {
      console.error('Mongo get progress failed:', err);
    }
  }
  res.json(readLocalDB());
};

// POST /stem/progress
export const updateProgress = async (req, res) => {
  const { stars, badges, completedLessons, completedCircuits, grade } = req.body;
  const rawData = { stars, badges, completedLessons, completedCircuits, grade };
  const calculated = updateProgressCalculations(rawData);
  const useMongoDB = mongooseConnectionActive();

  if (useMongoDB) {
    try {
      const progress = await ProgressModel.findOneAndUpdate(
        { studentId: 'default_student' },
        calculated,
        { new: true, upsert: true }
      );
      return res.json({ success: true, database: 'mongodb', data: progress });
    } catch (err) {
      console.error('Mongo update progress failed:', err);
    }
  }

  const ok = writeLocalDB(calculated);
  res.json({ success: ok, database: 'file-system', data: calculated });
};

// GET /stem/lessons/:grade
export const getLessons = (req, res) => {
  const { grade } = req.params;
  const list = SYLLABUS[grade] || SYLLABUS['KG'] || [];
  res.json({
    grade,
    lessons: list
  });
};

// GET /stem/curriculum
export const getCurriculum = (req, res) => {
  const allLessons = [];
  Object.values(SYLLABUS).forEach(gradeLessons => {
    allLessons.push(...gradeLessons);
  });
  res.json(allLessons);
};

// POST /stem/challenge
export const getChallenge = (req, res) => {
  const { grade, stars, failureCount, timeTaken, lessonId } = req.body;
  const challenge = getAdaptiveLesson(grade, stars || 15, failureCount || 0, timeTaken || 60, lessonId);
  res.json(challenge);
};

// POST /stem/validate-circuit
export const validateCircuitRoute = (req, res) => {
  const result = validateCircuit(req.body);
  res.json(result);
};

// GET /stem/rewards
export const getRewards = async (req, res) => {
  let stars = 15;
  let level = 1;
  let badges = [];
  const useMongoDB = mongooseConnectionActive();

  if (useMongoDB) {
    try {
      const progress = await ProgressModel.findOne({ studentId: 'default_student' });
      if (progress) {
        stars = progress.stars;
        level = progress.level;
        badges = progress.badges;
      }
    } catch (err) {
      console.error('Mongo get rewards failed:', err);
    }
  } else {
    const local = readLocalDB();
    stars = local.stars;
    level = local.level;
    badges = local.badges;
  }

  res.json({
    stars,
    level,
    badges,
    badgesCount: badges.length,
    rank: getRankDescription(stars)
  });
};

// POST /recommend
export const getRecommendationRoute = (req, res) => {
  const { grade, performanceScore, previousLessons, completedCircuits } = req.body;

  if (!grade) {
    return res.status(400).json({ error: "Missing required 'grade' parameter." });
  }

  const recommendation = getSTEMRecommendation({
    grade,
    performanceScore: typeof performanceScore === 'number' ? performanceScore : 50,
    previousLessons: Array.isArray(previousLessons) ? previousLessons : [],
    completedCircuits: Array.isArray(completedCircuits) ? completedCircuits : []
  });

  res.json(recommendation);
};


// Internal helpers
function mongooseConnectionActive() {
  return global.mongoConnected === true;
}

function getRankDescription(stars) {
  if (stars >= 50) return "Master of Magnetism 🧙‍♂️";
  if (stars >= 35) return "Circuit Engineer 🛠️";
  if (stars >= 20) return "Junior Explorer 🧭";
  return "Spark Apprentice 🐣";
}
