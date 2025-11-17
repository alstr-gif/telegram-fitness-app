import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId } = req.params;
      const user = await this.userService.findByTelegramId(telegramId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId } = req.params;
      const profileData = req.body;

      const user = await this.userService.updateProfile(telegramId, profileData);
      res.json(user);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  checkProfileComplete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId } = req.params;
      const isComplete = await this.userService.isProfileComplete(telegramId);
      
      res.json({ isComplete });
    } catch (error) {
      console.error('Error checking profile completion:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

