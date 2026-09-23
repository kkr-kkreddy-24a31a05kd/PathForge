import express from 'express';
import {
  applyForInternship,
  getStudentApplications,
  getInternshipApplicants,
  updateApplicationStatus,
  checkResumeScore
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/apply/:internshipId', protect, authorize('student'), applyForInternship);
router.get('/my-applications', protect, authorize('student'), getStudentApplications);
router.get('/internship/:internshipId/applicants', protect, authorize('company', 'admin'), getInternshipApplicants);
router.patch('/:id/status', protect, authorize('company', 'admin'), updateApplicationStatus);
router.post('/check-resume-score', protect, checkResumeScore);

export default router;
