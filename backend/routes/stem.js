import express from 'express';
import { 
  getProgress, 
  updateProgress, 
  getLessons, 
  getCurriculum,
  getChallenge, 
  validateCircuitRoute, 
  getRewards,
  getRecommendationRoute
} from '../controllers/stemController.js';

const router = express.Router();

router.get('/curriculum', getCurriculum);
router.get('/progress', getProgress);
router.post('/progress', updateProgress);
router.get('/lessons/:grade', getLessons);
router.post('/challenge', getChallenge);
router.post('/validate-circuit', validateCircuitRoute);
router.post('/recommend', getRecommendationRoute);
router.get('/rewards', getRewards);

export default router;

