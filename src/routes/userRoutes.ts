import { Router } from 'express';
import { UserController } from '../controllers/UserController';
// import { authenticateToken, authorizeUser, optionalAuth } from '../middlewares/auth';

const router = Router();
const userController = new UserController();

// Note: Authentication is available but not enforced by default
// To enable authentication, uncomment the middleware imports above and add them to routes
// Example: router.get('/:telegramId', authenticateToken, authorizeUser, userController.getProfile);

/**
 * @route GET /api/users/:telegramId
 * @desc Get user profile by Telegram ID
 * @access Public (or add authenticateToken, authorizeUser for private)
 */
router.get('/:telegramId', userController.getProfile);

/**
 * @route PUT /api/users/:telegramId
 * @desc Update user profile
 * @access Public (or add authenticateToken, authorizeUser for private)
 */
router.put('/:telegramId', userController.updateProfile);

/**
 * @route GET /api/users/:telegramId/complete
 * @desc Check if user profile is complete
 * @access Public (or add optionalAuth for enhanced features)
 */
router.get('/:telegramId/complete', userController.checkProfileComplete);

/**
 * @route GET /api/users
 * @desc Get all users (admin only in production)
 * @access Public (should add admin authentication in production)
 */
router.get('/', userController.getAllUsers);

export default router;

