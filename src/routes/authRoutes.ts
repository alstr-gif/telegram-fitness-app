import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken, authenticateTelegramWebApp } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/auth/login
 * @desc Login with Telegram credentials and get JWT token
 * @body { telegramId, username?, firstName?, lastName?, photoUrl? }
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/telegram-webapp
 * @desc Authenticate via Telegram WebApp init data
 * @header x-telegram-init-data OR body.initData
 */
router.post('/telegram-webapp', authenticateTelegramWebApp, authController.telegramWebAppAuth);

/**
 * @route GET /api/auth/verify
 * @desc Verify JWT token and get user info
 * @header Authorization: Bearer <token>
 */
router.get('/verify', authenticateToken, authController.verifyToken);

export default router;



