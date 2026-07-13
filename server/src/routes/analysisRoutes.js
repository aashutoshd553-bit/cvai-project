import express from 'express';
import {
  analyzeResume,
  getHistory,
  getAnalysisById,
  deleteAnalysis,
  generateCoverLetterForAnalysis,
  generateSummaryFromResumeData
} from '../controllers/analysisController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/analyze', protect, upload.single('file'), analyzeResume);
router.get('/history', protect, getHistory);
router.get('/history/:id', protect, getAnalysisById);
router.delete('/history/:id', protect, deleteAnalysis);
router.post('/cover-letter', protect, generateCoverLetterForAnalysis);
router.post('/generate-summary', protect, generateSummaryFromResumeData);

export default router;
