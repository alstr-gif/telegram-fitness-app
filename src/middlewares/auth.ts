import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserService } from '../services/UserService';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    telegramId: string;
  };
}

/**
 * Middleware to verify JWT token
 * Adds user information to request object if token is valid
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      telegramId: string;
    };

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      telegramId: decoded.telegramId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Middleware to optionally verify JWT token
 * Continues even if no token is provided or token is invalid
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: string;
        telegramId: string;
      };

      req.user = {
        id: decoded.userId,
        telegramId: decoded.telegramId,
      };
    }

    next();
  } catch (error) {
    // Continue without user info if token is invalid
    next();
  }
};

/**
 * Middleware to verify that the authenticated user matches the telegramId in the route
 */
export const authorizeUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { telegramId } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Allow access if the telegramId matches or if it's an admin request
    if (req.user.telegramId !== telegramId) {
      res.status(403).json({ error: 'Forbidden: Cannot access other user\'s data' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Generate JWT token for a user
 */
export const generateToken = (userId: string, telegramId: string): string => {
  return jwt.sign({ userId, telegramId }, env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Middleware for Telegram Web App authentication
 * Validates Telegram WebApp init data
 */
export const authenticateTelegramWebApp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // For Telegram Mini Apps, the initData is sent in the header or body
    const initData = req.headers['x-telegram-init-data'] as string || req.body.initData;

    if (!initData) {
      res.status(401).json({ error: 'Telegram init data required' });
      return;
    }

    // Parse initData and validate
    // Note: In production, you should validate the hash using Telegram's algorithm
    // For now, we'll extract the user data
    const params = new URLSearchParams(initData);
    const userDataStr = params.get('user');

    if (!userDataStr) {
      res.status(401).json({ error: 'Invalid Telegram init data' });
      return;
    }

    const userData = JSON.parse(userDataStr);
    const telegramId = userData.id?.toString();

    if (!telegramId) {
      res.status(401).json({ error: 'Invalid user data' });
      return;
    }

    // Find or create user
    const userService = new UserService();
    let user = await userService.findByTelegramId(telegramId);

    if (!user) {
      user = await userService.createUser({
        telegramId,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        photoUrl: userData.photo_url,
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      telegramId: user.telegramId,
    };

    next();
  } catch (error) {
    console.error('Error authenticating Telegram WebApp:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

