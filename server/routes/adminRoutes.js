import express from 'express';
import {
  getPendingCompanies,
  updateCompanyApproval,
  getPlatformStats,
  getAllUsers
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public platform stats for landing page & admin metrics
router.get('/stats', getPlatformStats);

// Protected admin-only routes
router.get('/pending-companies', protect, authorize('admin'), getPendingCompanies);
router.patch('/companies/:id/approve', protect, authorize('admin'), updateCompanyApproval);
router.get('/users', protect, authorize('admin'), getAllUsers);

export default router;
