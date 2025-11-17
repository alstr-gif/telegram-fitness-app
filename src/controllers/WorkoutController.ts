import { Request, Response } from 'express';
import { WorkoutPlanService } from '../services/WorkoutPlanService';
import { UserService } from '../services/UserService';
import { SingleWorkoutService } from '../services/SingleWorkoutService';
import { WorkoutSelectionService } from '../services/WorkoutSelectionService';
import { PlanStatus } from '../entities/WorkoutPlan';

export class WorkoutController {
  private workoutPlanService: WorkoutPlanService;
  private userService: UserService;
  private singleWorkoutService: SingleWorkoutService;
  private workoutSelectionService: WorkoutSelectionService;

  constructor() {
    this.workoutPlanService = new WorkoutPlanService();
    this.userService = new UserService();
    this.singleWorkoutService = new SingleWorkoutService();
    this.workoutSelectionService = new WorkoutSelectionService();
  }

  generatePlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId } = req.params;
      const { weeksCount = 2 } = req.body;

      const user = await this.userService.findByTelegramId(telegramId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const plan = await this.workoutPlanService.generateAIPlan(user, weeksCount);
      res.status(201).json(plan);
    } catch (error) {
      console.error('Error generating workout plan:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  };

  getUserPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId } = req.params;
      const user = await this.userService.findByTelegramId(telegramId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const plans = await this.workoutPlanService.getUserPlans(user.id);
      res.json(plans);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getActivePlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId } = req.params;
      const user = await this.userService.findByTelegramId(telegramId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const plan = await this.workoutPlanService.getActivePlan(user.id);
      
      if (!plan) {
        res.status(404).json({ error: 'No active workout plan found' });
        return;
      }

      res.json(plan);
    } catch (error) {
      console.error('Error fetching active plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getPlanById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planId } = req.params;
      const plan = await this.workoutPlanService.findById(planId);
      res.json(plan);
    } catch (error) {
      console.error('Error fetching workout plan:', error);
      res.status(404).json({ 
        error: error instanceof Error ? error.message : 'Workout plan not found' 
      });
    }
  };

  updatePlanStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planId } = req.params;
      const { status } = req.body;

      if (!Object.values(PlanStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid plan status' });
        return;
      }

      const plan = await this.workoutPlanService.updatePlanStatus(planId, status);
      res.json(plan);
    } catch (error) {
      console.error('Error updating plan status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getUpcomingWorkouts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { telegramId } = req.params;
      const limit = parseInt(req.query.limit as string) || 7;

      const user = await this.userService.findByTelegramId(telegramId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const workouts = await this.workoutPlanService.getUpcomingWorkouts(user.id, limit);
      res.json(workouts);
    } catch (error) {
      console.error('Error fetching upcoming workouts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  completeWorkout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workoutId } = req.params;
      const workout = await this.workoutPlanService.markWorkoutComplete(workoutId);
      res.json(workout);
    } catch (error) {
      console.error('Error completing workout:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  };

  deletePlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planId } = req.params;
      await this.workoutPlanService.deletePlan(planId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  generateSingleWorkout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { timeChoice, trainingType, goalType, gearType, telegramId, fitnessLevel } = req.body;

      if (!timeChoice || !trainingType || !goalType || !gearType) {
        res.status(400).json({ error: 'All workout preferences are required' });
        return;
      }

      // Get user ID and fitness level if telegramId provided
      let userId;
      let userFitnessLevel;
      if (telegramId) {
        const user = await this.userService.findByTelegramId(telegramId);
        userId = user?.id;
        userFitnessLevel = user?.fitnessLevel;
      }

      // Use WorkoutSelectionService with 45% library strategy (55% AI-generated custom, 45% library)
      const result = await this.workoutSelectionService.selectSingleWorkout({
        timeChoice,
        trainingType,
        goalType,
        gearType,
        userId,
        fitnessLevel: fitnessLevel || userFitnessLevel,
        strategy: {
          useLibraryPercentage: 45, // 45% library, 55% AI-generated (custom)
          preferLibraryForBenchmarks: true,
          preferLibraryForHeroWODs: true,
          useAIIfNoLibraryMatch: true,
          minLibraryMatches: 1,
        },
      });

      // Return workout with source information
      const response: any = {
        ...result.workout,
        source: result.source, // 'library' or 'ai'
      };

      // Include library workout info if it came from library
      if (result.source === 'library' && result.libraryWorkout) {
        response.libraryWorkout = {
          id: result.libraryWorkout.id,
          name: result.libraryWorkout.name,
          type: result.libraryWorkout.type,
          isBenchmark: result.libraryWorkout.isBenchmark,
          isHeroWOD: result.libraryWorkout.isHeroWOD,
        };
      }

      console.log(`✅ Generated workout from ${result.source === 'library' ? 'LIBRARY' : 'AI'}: ${result.workout.name}`);

      res.status(200).json(response);
    } catch (error) {
      console.error('Error generating single workout:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to generate workout' 
      });
    }
  };
}
