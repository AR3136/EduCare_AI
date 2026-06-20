import express from 'express';
import {
  chatWithMathMentor,
  getMathProgress,
  updateMathProgress,
  generateMathSession,
  submitMathAnswer
} from '../controllers/mathController.js';

const router = express.Router();

router.post('/chat', chatWithMathMentor);
router.get('/progress', getMathProgress);
router.post('/progress', updateMathProgress);
router.post('/generate-session', generateMathSession);
router.post('/submit-answer', submitMathAnswer);

export default router;
