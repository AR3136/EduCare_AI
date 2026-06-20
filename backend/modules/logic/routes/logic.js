import express from 'express';
import { 
  chatWithLogicMentor, 
  getLogicProgress, 
  updateLogicProgress, 
  generateLogicSession, 
  submitLogicAnswer 
} from '../controllers/logicController.js';

const router = express.Router();

router.post('/chat', chatWithLogicMentor);
router.get('/progress', getLogicProgress);
router.post('/progress', updateLogicProgress);
router.post('/generate-session', generateLogicSession);
router.post('/submit-answer', submitLogicAnswer);

export default router;
