import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { generateToken } from '../middlewares/auth';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Login with Telegram credentials
   * Creates or retrieves user and returns JWT token
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId, username, firstName, lastName, photoUrl } = req.body;

      if (!telegramId) {
        res.status(400).json({ error: 'Telegram ID is required' });
        return;
      }

      // Find or create user
      let user = await this.userService.findByTelegramId(telegramId);

      if (!user) {
        user = await this.userService.createUser({
          telegramId,
          username,
          firstName,
          lastName,
          photoUrl,
        });
      } else {
        // Update user info if needed
        user = await this.userService.createUser({
          telegramId,
          username,
          firstName,
          lastName,
          photoUrl,
        });
      }

      // Generate JWT token
      const token = generateToken(user.id, user.telegramId);

      res.json({
        token,
        user: {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
        },
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Verify token and return user info
   */
  verifyToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json({ error: 'Token required' });
        return;
      }

      // Token verification is handled by the authenticateToken middleware
      // If we reach here, token is valid and user is attached to request
      const user = (req as any).user;

      const userDetails = await this.userService.findById(user.id);

      if (!userDetails) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        user: {
          id: userDetails.id,
          telegramId: userDetails.telegramId,
          username: userDetails.username,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          photoUrl: userDetails.photoUrl,
          fitnessLevel: userDetails.fitnessLevel,
          primaryGoal: userDetails.primaryGoal,
        },
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Telegram WebApp authentication
   * Validates Telegram init data and returns JWT token
   */
  telegramWebAppAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      // User is already authenticated and created by authenticateTelegramWebApp middleware
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'Authentication failed' });
        return;
      }

      const userDetails = await this.userService.findById(user.id);

      if (!userDetails) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Generate JWT token
      const token = generateToken(userDetails.id, userDetails.telegramId);

      res.json({
        token,
        user: {
          id: userDetails.id,
          telegramId: userDetails.telegramId,
          username: userDetails.username,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          photoUrl: userDetails.photoUrl,
          fitnessLevel: userDetails.fitnessLevel,
          primaryGoal: userDetails.primaryGoal,
        },
      });
    } catch (error) {
      console.error('Error in Telegram WebApp auth:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}



