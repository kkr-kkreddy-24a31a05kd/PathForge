import express from 'express';
import { getAdminAnalytics, getCompanyAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/admin', protect, authorize('admin'), getAdminAnalytics);
router.get('/company', protect, authorize('company', 'admin'), getCompanyAnalytics);

export default router;
