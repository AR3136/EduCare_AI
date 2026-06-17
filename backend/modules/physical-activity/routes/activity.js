import express from 'express';
import {
  assignActivity,
  startActivity,
  completeActivity,
  skipActivity,
  getHistory,
  getReport,
  getRecommendation,
  recommendForInstructor,
  getSkipAnalytics,
  getParentReport,
  getTeacherAnalytics,
  grantReward,
  getRewardsList
} from '../controllers/activityController.js';

const router = express.Router();

// Lifecycle Mutation Endpoints
router.post('/assign', assignActivity);
router.post('/start', startActivity);
router.post('/complete', completeActivity);
router.post('/skip', skipActivity);
router.post('/instructor-recommend', recommendForInstructor);

// Query / Analytics Endpoints
router.get('/history', getHistory);
router.get('/report', getReport);
router.get('/recommendation', getRecommendation);
router.get('/skip-analytics', getSkipAnalytics);
router.get('/parent-report', getParentReport);
router.get('/teacher-analytics', getTeacherAnalytics);

// Rewards Engine API Endpoints
router.post('/rewards/grant', grantReward);
router.get('/rewards', getRewardsList);

export default router;
