import express from 'express';
import {
  proposeInterview,
  confirmInterviewSlot,
  getUpcomingInterviews
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, requireApprovedCompany } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/propose', protect, authorize('company', 'admin'), requireApprovedCompany, proposeInterview);
router.patch('/:id/confirm', protect, authorize('student'), confirmInterviewSlot);
router.get('/upcoming', protect, getUpcomingInterviews);

export default router;
