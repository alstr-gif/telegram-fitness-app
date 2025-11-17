import { Router } from 'express';
import { WorkoutController } from '../controllers/WorkoutController';
// import { authenticateToken, authorizeUser } from '../middlewares/auth';

const router = Router();
const workoutController = new WorkoutController();

// Note: Authentication is available but not enforced by default
// To enable authentication, uncomment the middleware imports above and add them to routes
// Example: router.post('/:telegramId/generate', authenticateToken, authorizeUser, workoutController.generatePlan);

/**
 * @route POST /api/workouts/:telegramId/generate
 * @desc Generate a new AI workout plan for user
 */
router.post('/:telegramId/generate', workoutController.generatePlan);

/**
 * @route GET /api/workouts/:telegramId/plans
 * @desc Get all workout plans for user
 */
router.get('/:telegramId/plans', workoutController.getUserPlans);

/**
 * @route GET /api/workouts/:telegramId/active
 * @desc Get active workout plan for user
 */
router.get('/:telegramId/active', workoutController.getActivePlan);

/**
 * @route GET /api/workouts/:telegramId/upcoming
 * @desc Get upcoming workouts for user
 */
router.get('/:telegramId/upcoming', workoutController.getUpcomingWorkouts);

/**
 * @route GET /api/workouts/plans/:planId
 * @desc Get workout plan by ID
 */
router.get('/plans/:planId', workoutController.getPlanById);

/**
 * @route PATCH /api/workouts/plans/:planId/status
 * @desc Update workout plan status
 */
router.patch('/plans/:planId/status', workoutController.updatePlanStatus);

/**
 * @route POST /api/workouts/workout/:workoutId/complete
 * @desc Mark a workout as complete
 */
router.post('/workout/:workoutId/complete', workoutController.completeWorkout);

/**
 * @route DELETE /api/workouts/plans/:planId
 * @desc Delete a workout plan
 */
router.delete('/plans/:planId', workoutController.deletePlan);

/**
 * @route POST /api/workouts/generate-single
 * @desc Generate a single workout based on user preferences
 * @body { timeChoice, trainingType, goalType, gearType }
 */
router.post('/generate-single', workoutController.generateSingleWorkout);

export default router;

