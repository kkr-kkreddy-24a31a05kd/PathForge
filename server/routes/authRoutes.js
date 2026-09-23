import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

const sensitiveAuthLimiter = authRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 });

router.post('/register', sensitiveAuthLimiter, register);
router.post('/login', sensitiveAuthLimiter, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
