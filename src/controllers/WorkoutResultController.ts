import { Request, Response } from 'express';
import { WorkoutResultService } from '../services/WorkoutResultService';
import { UserService } from '../services/UserService';

export class WorkoutResultController {
  private resultService: WorkoutResultService;
  private userService: UserService;

  constructor() {
    this.resultService = new WorkoutResultService();
    this.userService = new UserService();
  }

  logResult = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId } = req.params;
      const resultData = req.body;

      const user = await this.userService.findByTelegramId(telegramId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const result = await this.resultService.logResult({
        ...resultData,
        userId: user.id,
      });

      res.status(201).json(result);
    } catch (error) {
      console.error('Error logging workout result:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to log result' 
      });
    }
  };

  updateFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { resultId } = req.params;
      const { liked } = req.body;

      if (typeof liked !== 'boolean') {
        res.status(400).json({ error: 'Liked must be a boolean' });
        return;
      }

      const result = await this.resultService.updateFeedback(resultId, liked);
      res.json(result);
    } catch (error) {
      console.error('Error updating feedback:', error);
      res.status(500).json({ error: 'Failed to update feedback' });
    }
  };

  getUserResults = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId } = req.params;
      const user = await this.userService.findByTelegramId(telegramId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const results = await this.resultService.getUserResults(user.id);
      res.json(results);
    } catch (error) {
      console.error('Error fetching results:', error);
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  };

  getWorkoutHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId, workoutName } = req.params;
      const user = await this.userService.findByTelegramId(telegramId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const results = await this.resultService.getResultsByWorkoutName(user.id, workoutName);
      res.json(results);
    } catch (error) {
      console.error('Error fetching workout history:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  };

  getWorkoutStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId, workoutName } = req.params;
      const user = await this.userService.findByTelegramId(telegramId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const stats = await this.resultService.getWorkoutStats(user.id, workoutName);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching workout stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  };

  getBenchmarkResults = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId } = req.params;
      const user = await this.userService.findByTelegramId(telegramId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const results = await this.resultService.getBenchmarkResults(user.id);
      res.json(results);
    } catch (error) {
      console.error('Error fetching benchmark results:', error);
      res.status(500).json({ error: 'Failed to fetch benchmarks' });
    }
  };
}


