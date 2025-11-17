import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import workoutRoutes from './workoutRoutes';
import resultRoutes from './resultRoutes';
import paymentRoutes from './paymentRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Telegram Fitness App API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/workouts', workoutRoutes);
router.use('/results', resultRoutes);
router.use('/payments', paymentRoutes);

export default router;

