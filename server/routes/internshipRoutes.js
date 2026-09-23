import express from 'express';
import {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  getCompanyPostings
} from '../controllers/internshipController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize, requireApprovedCompany } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getInternships);
router.get('/company/my-postings', protect, authorize('company', 'admin'), getCompanyPostings);
router.get('/:id', optionalAuth, getInternshipById);
router.post('/', protect, authorize('company', 'admin'), requireApprovedCompany, createInternship);
router.put('/:id', protect, authorize('company', 'admin'), requireApprovedCompany, updateInternship);
router.delete('/:id', protect, authorize('company', 'admin'), requireApprovedCompany, deleteInternship);

export default router;
