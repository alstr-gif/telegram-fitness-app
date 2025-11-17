import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { WorkoutResult } from '../entities/WorkoutResult';

export interface LogWorkoutResultDTO {
  userId: string;
  workoutName: string;
  workoutType: string;
  timeSeconds?: number;
  rounds?: number;
  reps?: number;
  weight?: number;
  additionalData?: {
    movements?: string[];
    repScheme?: string;
    rxOrScaled?: 'RX' | 'Scaled' | 'Beginner';
    notes?: string;
  };
  liked?: boolean;
  userNotes?: string;
  fullWorkoutData?: any;
}

export interface UpdateFeedbackDTO {
  liked: boolean;
}

export class WorkoutResultService {
  private resultRepository: Repository<WorkoutResult>;

  constructor() {
    this.resultRepository = AppDataSource.getRepository(WorkoutResult);
  }

  async logResult(data: LogWorkoutResultDTO): Promise<WorkoutResult> {
    const result = this.resultRepository.create(data);
    return await this.resultRepository.save(result);
  }

  async updateFeedback(resultId: string, liked: boolean): Promise<WorkoutResult> {
    const result = await this.resultRepository.findOne({ where: { id: resultId } });
    
    if (!result) {
      throw new Error('Workout result not found');
    }

    result.liked = liked;
    return await this.resultRepository.save(result);
  }

  async getUserResults(userId: string): Promise<WorkoutResult[]> {
    return await this.resultRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getResultsByWorkoutName(userId: string, workoutName: string): Promise<WorkoutResult[]> {
    return await this.resultRepository.find({
      where: { userId, workoutName },
      order: { createdAt: 'ASC' },
    });
  }

  async getBenchmarkResults(userId: string): Promise<WorkoutResult[]> {
    // Get results for famous benchmark WODs
    const benchmarkNames = ['Fran', 'Murph', 'Annie', 'Helen', 'Grace', 'DT'];
    
    return await this.resultRepository
      .createQueryBuilder('result')
      .where('result.userId = :userId', { userId })
      .andWhere('result.workoutName IN (:...names)', { names: benchmarkNames })
      .orderBy('result.createdAt', 'DESC')
      .getMany();
  }

  async getUserFeedbackSummary(userId: string, limit: number = 20): Promise<{
    likedWorkouts: Array<{ name: string; weight: number }>;
    dislikedWorkouts: Array<{ name: string; weight: number }>;
    recentPreferences: any;
  }> {
    // Get more results to weight them properly (last 20)
    const recentResults = await this.resultRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Weight feedback by recency (exponential decay)
    // Recent feedback (last 1 day) = weight 2.0
    // Old feedback (7+ days) = weight 0.5
    const calculateWeight = (daysAgo: number): number => {
      if (daysAgo <= 1) return 2.0;    // Very recent: highest weight
      if (daysAgo <= 2) return 1.5;    // Recent: high weight
      if (daysAgo <= 3) return 1.2;    // Medium: medium-high weight
      if (daysAgo <= 5) return 1.0;    // Medium-old: normal weight
      if (daysAgo <= 7) return 0.8;    // Old: lower weight
      return 0.5;                       // Very old: lowest weight
    };

    // Process liked workouts with weights
    const likedMap = new Map<string, number>();
    const dislikedMap = new Map<string, number>();

    recentResults.forEach(r => {
      const daysAgo = Math.floor((now - r.createdAt.getTime()) / oneDay);
      const weight = calculateWeight(daysAgo);
      const workoutName = r.workoutName;

      if (r.liked === true) {
        const currentWeight = likedMap.get(workoutName) || 0;
        likedMap.set(workoutName, currentWeight + weight);
      } else if (r.liked === false) {
        const currentWeight = dislikedMap.get(workoutName) || 0;
        dislikedMap.set(workoutName, currentWeight + weight);
      }
    });

    // Convert to sorted arrays (by weight, highest first)
    const liked = Array.from(likedMap.entries())
      .map(([name, weight]) => ({ name, weight }))
      .sort((a, b) => b.weight - a.weight);

    const disliked = Array.from(dislikedMap.entries())
      .map(([name, weight]) => ({ name, weight }))
      .sort((a, b) => b.weight - a.weight);

    // Analyze workout data to extract patterns (weighted by recency)
    const likedWorkoutData = recentResults
      .filter(r => r.liked === true && r.fullWorkoutData)
      .map(r => {
        const daysAgo = Math.floor((now - r.createdAt.getTime()) / oneDay);
        const weight = calculateWeight(daysAgo);
        return {
          ...r.fullWorkoutData,
          weight,
          daysAgo,
        };
      })
      .sort((a, b) => b.weight - a.weight); // Sort by weight

    return {
      likedWorkouts: liked,
      dislikedWorkouts: disliked,
      recentPreferences: {
        likedWorkoutData,
        totalFeedback: recentResults.filter(r => r.liked !== null).length,
        weightedFeedback: true, // Flag to indicate weighted feedback
      },
    };
  }

  async getRecentWorkoutHistory(userId: string, days: number = 7): Promise<{
      recentWorkouts: Array<{
      workoutName: string;
      workoutType: string;
      date: Date;
      daysAgo: number;
      movements?: string[];
      focus?: string;
      liked?: boolean;
      duration?: number;
    }>;
    movementFrequency: { [movement: string]: number };
    workoutTypeFrequency: { [type: string]: number };
    totalWorkoutsInPeriod: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const results = await this.resultRepository
      .createQueryBuilder('result')
      .where('result.userId = :userId', { userId })
      .andWhere('result.createdAt >= :cutoffDate', { cutoffDate })
      .orderBy('result.createdAt', 'DESC')
      .getMany();

    // Extract movement frequency
    const movementFreq: { [movement: string]: number } = {};
    const workoutTypeFreq: { [type: string]: number } = {};

    const recentWorkouts = results.map(r => {
      const daysAgo = Math.floor((Date.now() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Extract movements from fullWorkoutData
      let movements: string[] = [];
      if (r.fullWorkoutData?.blocks) {
        r.fullWorkoutData.blocks.forEach((block: any) => {
          if (block.exercises) {
            block.exercises.forEach((ex: any) => {
              if (ex.name) {
                movements.push(ex.name);
                movementFreq[ex.name] = (movementFreq[ex.name] || 0) + 1;
              }
            });
          }
        });
      }

      // Track workout type frequency
      if (r.workoutType) {
        workoutTypeFreq[r.workoutType] = (workoutTypeFreq[r.workoutType] || 0) + 1;
      }

      // Extract duration from fullWorkoutData if available
      let duration: number | undefined = undefined;
      if (r.fullWorkoutData?.duration) {
        duration = r.fullWorkoutData.duration;
      }

      return {
        workoutName: r.workoutName,
        workoutType: r.workoutType,
        date: r.createdAt,
        daysAgo,
        movements,
        focus: r.fullWorkoutData?.focus,
        liked: r.liked,
        duration,
      };
    });

    return {
      recentWorkouts,
      movementFrequency: movementFreq,
      workoutTypeFrequency: workoutTypeFreq,
      totalWorkoutsInPeriod: results.length,
    };
  }

  async getWorkoutStats(userId: string, workoutName: string): Promise<{
    attempts: number;
    bestTime?: number;
    bestRounds?: number;
    bestWeight?: number;
    averageTime?: number;
    lastResult?: WorkoutResult;
    firstResult?: WorkoutResult;
  }> {
    const results = await this.getResultsByWorkoutName(userId, workoutName);

    if (results.length === 0) {
      return { attempts: 0 };
    }

    const times = results.filter(r => r.timeSeconds).map(r => r.timeSeconds!);
    const rounds = results.filter(r => r.rounds).map(r => r.rounds!);
    const weights = results.filter(r => r.weight).map(r => r.weight!);

    return {
      attempts: results.length,
      bestTime: times.length > 0 ? Math.min(...times) : undefined,
      bestRounds: rounds.length > 0 ? Math.max(...rounds) : undefined,
      bestWeight: weights.length > 0 ? Math.max(...weights) : undefined,
      averageTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : undefined,
      lastResult: results[0],
      firstResult: results[results.length - 1],
    };
  }
}

