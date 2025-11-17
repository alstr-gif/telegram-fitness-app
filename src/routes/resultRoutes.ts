import { Router } from 'express';
import { WorkoutResultController } from '../controllers/WorkoutResultController';

const router = Router();
const resultController = new WorkoutResultController();

/**
 * @route POST /api/results/:telegramId/log
 * @desc Log a workout result
 * @body { workoutName, workoutType, timeSeconds?, rounds?, reps?, weight?, liked?, userNotes?, fullWorkoutData? }
 */
router.post('/:telegramId/log', resultController.logResult);

/**
 * @route PATCH /api/results/:resultId/feedback
 * @desc Update like/dislike feedback
 * @body { liked: boolean }
 */
router.patch('/:resultId/feedback', resultController.updateFeedback);

/**
 * @route GET /api/results/:telegramId
 * @desc Get all workout results for a user
 */
router.get('/:telegramId', resultController.getUserResults);

/**
 * @route GET /api/results/:telegramId/workout/:workoutName
 * @desc Get history for a specific workout
 */
router.get('/:telegramId/workout/:workoutName', resultController.getWorkoutHistory);

/**
 * @route GET /api/results/:telegramId/stats/:workoutName
 * @desc Get statistics for a specific workout
 */
router.get('/:telegramId/stats/:workoutName', resultController.getWorkoutStats);

/**
 * @route GET /api/results/:telegramId/benchmarks
 * @desc Get all benchmark WOD results
 */
router.get('/:telegramId/benchmarks', resultController.getBenchmarkResults);

export default router;


