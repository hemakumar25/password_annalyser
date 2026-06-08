import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { analyzePassword, getHistory } from '../controllers/analysisController.js';

const router = express.Router();

router.post('/', protect, analyzePassword);
router.get('/', protect, getHistory);

export default router;
