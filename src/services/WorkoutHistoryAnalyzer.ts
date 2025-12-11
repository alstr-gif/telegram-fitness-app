/**
 * Enhanced Workout History Analyzer
 * 
 * Analyzes workout history following CrossFit methodology:
 * - Time domain balance (short/medium/long)
 * - Energy system balance (phosphagen/glycolytic/oxidative)
 * - Modality balance (gymnastics/weightlifting/cardio)
 * - Movement patterns and overtraining prevention
 */

import { WorkoutResultService } from './WorkoutResultService';
import { WorkoutResult } from '../entities/WorkoutResult';

export interface CrossFitAnalysis {
  // Time domain balance (last 7 days)
  timeDomainBalance: {
    short: number;      // < 10 min (phosphagen)
    medium: number;     // 10-20 min (glycolytic)
    long: number;       // > 20 min (oxidative)
  };
  
  // Energy system balance
  energySystemBalance: {
    phosphagen: number;    // Short, explosive (sprints, heavy singles)
    glycolytic: number;    // Medium, sustained (typical WODs)
    oxidative: number;     // Long, endurance (grinders, chippers)
  };
  
  // Modality balance (movement domains)
  modalityBalance: {
    gymnastics: number;
    weightlifting: number;
    monoStructural: number; // Running, rowing, biking - "cardio"
    mixed: number;
  };
  
  // Movement pattern balance (NEW)
  movementPatternBalance: {
    pulling: number;      // Pull-ups, rows, deadlifts
    pushing: number;     // Push-ups, presses, thrusters
    lowerBody: number;   // Squats, lunges, box jumps
    core: number;        // Sit-ups, toes-to-bar, Russian twists
    fullBody: number;    // Complex movements using multiple patterns
  };
  
  // Intensity tracking (NEW)
  intensityBalance: {
    heavy: number;        // Heavy weights, low reps, strength focus
    moderate: number;    // Moderate weights/reps, balanced
    light: number;       // Light weights, high reps, conditioning focus
    skill: number;       // Skill practice, technique work
  };
  
  // Workout type distribution
  workoutTypeFrequency: { [type: string]: number };
  
  // Movement frequency
  movementFrequency: { [movement: string]: number };
  
  // Recent workout patterns
  recentWorkouts: Array<{
    workoutName: string;
    workoutType: string;
    duration?: number;
    timeDomain?: 'short' | 'medium' | 'long';
    energySystem?: 'phosphagen' | 'glycolytic' | 'oxidative';
    primaryModality?: 'gymnastics' | 'weightlifting' | 'monoStructural' | 'mixed';
    movementPatterns?: string[];  // NEW
    intensity?: 'heavy' | 'moderate' | 'light' | 'skill';  // NEW
    movements?: string[];
    liked?: boolean;
    daysAgo: number;
  }>;
  
  // Recommendations for next workout
  recommendations: {
    suggestedTimeDomain?: 'short' | 'medium' | 'long';
    suggestedEnergySystem?: 'phosphagen' | 'glycolytic' | 'oxidative';
    suggestedModality?: 'gymnastics' | 'weightlifting' | 'monoStructural' | 'mixed';
    suggestedWorkoutType?: string;
    suggestedMovementPattern?: 'pulling' | 'pushing' | 'lowerBody' | 'core' | 'fullBody';  // NEW
    suggestedIntensity?: 'heavy' | 'moderate' | 'light' | 'skill';  // NEW
    movementsToAvoid: string[];
    movementsToConsider: string[];
  };
}

export class WorkoutHistoryAnalyzer {
  private resultService: WorkoutResultService;

  constructor() {
    this.resultService = new WorkoutResultService();
  }

  /**
   * Analyze workout history with CrossFit methodology
   */
  async analyzeHistory(userId: string, days: number = 7): Promise<CrossFitAnalysis> {
    const history = await this.resultService.getRecentWorkoutHistory(userId, days);
    return this.analyzeHistoryFromData(history);
  }

  /**
   * Analyze workout history from pre-fetched data (optimized - avoids duplicate query)
   */
  analyzeHistoryFromData(history: {
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
  }): CrossFitAnalysis {
    // Initialize counters
    const timeDomainBalance = { short: 0, medium: 0, long: 0 };
    const energySystemBalance = { phosphagen: 0, glycolytic: 0, oxidative: 0 };
    const modalityBalance = { gymnastics: 0, weightlifting: 0, monoStructural: 0, mixed: 0 };
    const movementPatternBalance = { pulling: 0, pushing: 0, lowerBody: 0, core: 0, fullBody: 0 };
    const intensityBalance = { heavy: 0, moderate: 0, light: 0, skill: 0 };
    const movementFrequency: { [key: string]: number } = {};
    
    // Analyze each workout
    const analyzedWorkouts = history.recentWorkouts.map(workout => {
      const workoutData = workout as any;
      
      // Extract duration from fullWorkoutData if available
      let duration: number | undefined = workoutData.duration;
      if (!duration && workoutData.fullWorkoutData?.duration) {
        duration = workoutData.fullWorkoutData.duration;
      }
      
      // Determine time domain from workout type and duration
      const timeDomain = this.categorizeTimeDomain(workout.workoutType, duration);
      
      // Determine energy system
      const energySystem = this.categorizeEnergySystem(workout.workoutType, timeDomain);
      
      // Determine primary modality
      const primaryModality = this.categorizeModality(workout.movements || []);
      
      // Determine movement patterns
      const movementPatterns = this.categorizeMovementPatterns(workout.movements || []);
      
      // Determine intensity (get goalType from workout data if available)
      const goalType = (workout as any).goalType || (workout as any).focus || undefined;
      const intensity = this.categorizeIntensity(workout.workoutType, goalType, workout.movements || []);
      
      // Track frequencies
      timeDomainBalance[timeDomain]++;
      energySystemBalance[energySystem]++;
      modalityBalance[primaryModality]++;
      
      // Track movement patterns
      movementPatterns.forEach(pattern => {
        movementPatternBalance[pattern]++;
      });
      
      // Track intensity
      intensityBalance[intensity]++;
      
      // Track movements
      (workout.movements || []).forEach(movement => {
        movementFrequency[movement] = (movementFrequency[movement] || 0) + 1;
      });
      
      return {
        ...workout,
        timeDomain,
        energySystem,
        primaryModality,
        movementPatterns,
        intensity,
      };
    });
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      timeDomainBalance,
      energySystemBalance,
      modalityBalance,
      movementPatternBalance,
      intensityBalance,
      history.workoutTypeFrequency,
      movementFrequency,
      analyzedWorkouts
    );
    
    return {
      timeDomainBalance,
      energySystemBalance,
      modalityBalance,
      movementPatternBalance,
      intensityBalance,
      workoutTypeFrequency: history.workoutTypeFrequency,
      movementFrequency,
      recentWorkouts: analyzedWorkouts,
      recommendations,
    };
  }

  /**
   * Categorize workout by time domain
   */
  private categorizeTimeDomain(
    workoutType: string,
    duration?: number
  ): 'short' | 'medium' | 'long' {
    // If we have explicit duration, use it
    if (duration) {
      if (duration < 10) return 'short';
      if (duration <= 20) return 'medium';
      return 'long';
    }
    
    // Infer from workout type
    const type = workoutType.toLowerCase();
    
    if (type.includes('for time') && (type.includes('21-15-9') || type.includes('grace') || type.includes('fran'))) {
      return 'short'; // Fast, intense
    }
    
    if (type.includes('tabata') || type.includes('short')) {
      return 'short';
    }
    
    if (type.includes('chipper') || type.includes('murph') || type.includes('long') || type.includes('grinder')) {
      return 'long';
    }
    
    // Default for most AMRAPs, EMOMs
    return 'medium';
  }

  /**
   * Categorize by energy system
   */
  private categorizeEnergySystem(
    workoutType: string,
    timeDomain: 'short' | 'medium' | 'long'
  ): 'phosphagen' | 'glycolytic' | 'oxidative' {
    if (timeDomain === 'short') return 'phosphagen';
    if (timeDomain === 'long') return 'oxidative';
    return 'glycolytic';
  }

  /**
   * Categorize by primary modality
   */
  private categorizeModality(movements: string[]): 'gymnastics' | 'weightlifting' | 'monoStructural' | 'mixed' {
    const movementStr = movements.join(' ').toLowerCase();
    
    // Check for mono-structural (cardio)
    const monoStructuralKeywords = ['run', 'row', 'bike', 'assault', 'ski', 'swim', 'jog'];
    const hasMonoStructural = monoStructuralKeywords.some(kw => movementStr.includes(kw));
    
    // Check for weightlifting
    const weightliftingKeywords = ['clean', 'snatch', 'jerk', 'squat', 'deadlift', 'thruster', 'press', 'barbell'];
    const hasWeightlifting = weightliftingKeywords.some(kw => movementStr.includes(kw));
    
    // Check for gymnastics
    const gymnasticsKeywords = ['pull-up', 'push-up', 'muscle-up', 'handstand', 'toes-to-bar', 'toes to bar', 'dips', 'ring'];
    const hasGymnastics = gymnasticsKeywords.some(kw => movementStr.includes(kw));
    
    // Count modalities
    let modalityCount = 0;
    if (hasMonoStructural) modalityCount++;
    if (hasWeightlifting) modalityCount++;
    if (hasGymnastics) modalityCount++;
    
    // If 2+ modalities, it's mixed
    if (modalityCount >= 2) return 'mixed';
    
    // Single modality preference
    if (hasWeightlifting) return 'weightlifting';
    if (hasGymnastics) return 'gymnastics';
    if (hasMonoStructural) return 'monoStructural';
    
    // Default to mixed
    return 'mixed';
  }

  /**
   * Categorize movement patterns
   */
  private categorizeMovementPatterns(movements: string[]): Array<'pulling' | 'pushing' | 'lowerBody' | 'core' | 'fullBody'> {
    const patterns: Array<'pulling' | 'pushing' | 'lowerBody' | 'core' | 'fullBody'> = [];
    const movementStr = movements.join(' ').toLowerCase();
    
    // Pulling movements
    const pullingKeywords = ['pull-up', 'pullup', 'row', 'rower', 'deadlift', 'clean', 'snatch'];
    const hasPulling = pullingKeywords.some(kw => movementStr.includes(kw));
    
    // Pushing movements
    const pushingKeywords = ['push-up', 'pushup', 'press', 'thruster', 'burpee', 'handstand push-up', 'dips'];
    const hasPushing = pushingKeywords.some(kw => movementStr.includes(kw));
    
    // Lower body
    const lowerBodyKeywords = ['squat', 'lunge', 'box jump', 'wall ball', 'step-up'];
    const hasLowerBody = lowerBodyKeywords.some(kw => movementStr.includes(kw));
    
    // Core
    const coreKeywords = ['sit-up', 'situps', 'toes-to-bar', 'knees-to-elbow', 'v-up', 'ghd', 'back extension'];
    const hasCore = coreKeywords.some(kw => movementStr.includes(kw));
    
    // Full body (complex movements)
    const fullBodyKeywords = ['thruster', 'burpee', 'clean', 'snatch', 'man maker'];
    const hasFullBody = fullBodyKeywords.some(kw => movementStr.includes(kw));
    
    if (hasPulling) patterns.push('pulling');
    if (hasPushing) patterns.push('pushing');
    if (hasLowerBody) patterns.push('lowerBody');
    if (hasCore) patterns.push('core');
    if (hasFullBody && !patterns.includes('pulling') && !patterns.includes('pushing')) {
      patterns.push('fullBody');
    }
    
    // If no patterns found, default to mixed/full body
    return patterns.length > 0 ? patterns : ['fullBody'];
  }

  /**
   * Categorize workout intensity
   */
  private categorizeIntensity(
    workoutType: string,
    goalType?: string,
    movements?: string[]
  ): 'heavy' | 'moderate' | 'light' | 'skill' {
    const type = workoutType?.toLowerCase() || '';
    const goal = goalType?.toLowerCase() || '';
    const movementStr = (movements || []).join(' ').toLowerCase();
    
    // Skill/Technique focus
    if (goal === 'skill' || type.includes('total') || type.includes('1rm') || type.includes('max')) {
      return 'skill';
    }
    
    // Heavy days (strength focus)
    if (goal === 'strength' || 
        movementStr.includes('heavy') || 
        movementStr.includes('max') ||
        movementStr.includes('1-') || 
        movementStr.includes('1 rep') ||
        (movementStr.includes('kg') && !movementStr.includes('light'))) {
      return 'heavy';
    }
    
    // Light days (conditioning focus)
    if (goal === 'conditioning' || 
        movementStr.includes('air squat') ||
        movementStr.includes('running') ||
        movementStr.includes('bodyweight') ||
        type.includes('amrap') && movementStr.includes('high rep')) {
      return 'light';
    }
    
    // Default to moderate
    return 'moderate';
  }

  /**
   * Generate recommendations for next workout based on balance
   */
  private generateRecommendations(
    timeDomainBalance: { short: number; medium: number; long: number },
    energySystemBalance: { phosphagen: number; glycolytic: number; oxidative: number },
    modalityBalance: { gymnastics: number; weightlifting: number; monoStructural: number; mixed: number },
    movementPatternBalance: { pulling: number; pushing: number; lowerBody: number; core: number; fullBody: number },
    intensityBalance: { heavy: number; moderate: number; light: number; skill: number },
    workoutTypeFrequency: { [type: string]: number },
    movementFrequency: { [movement: string]: number },
    recentWorkouts: any[]
  ): CrossFitAnalysis['recommendations'] {
    const total = recentWorkouts.length;
    
    // Find least used time domain
    const timeDomainRatios = {
      short: timeDomainBalance.short / total || 0,
      medium: timeDomainBalance.medium / total || 0,
      long: timeDomainBalance.long / total || 0,
    };
    const suggestedTimeDomain = Object.entries(timeDomainRatios)
      .sort(([, a], [, b]) => a - b)[0]?.[0] as 'short' | 'medium' | 'long' | undefined;
    
    // Find least used energy system
    const energyRatios = {
      phosphagen: energySystemBalance.phosphagen / total || 0,
      glycolytic: energySystemBalance.glycolytic / total || 0,
      oxidative: energySystemBalance.oxidative / total || 0,
    };
    const suggestedEnergySystem = Object.entries(energyRatios)
      .sort(([, a], [, b]) => a - b)[0]?.[0] as 'phosphagen' | 'glycolytic' | 'oxidative' | undefined;
    
    // Find least used modality
    const modalityRatios = {
      gymnastics: modalityBalance.gymnastics / total || 0,
      weightlifting: modalityBalance.weightlifting / total || 0,
      monoStructural: modalityBalance.monoStructural / total || 0,
      mixed: modalityBalance.mixed / total || 0,
    };
    const suggestedModality = Object.entries(modalityRatios)
      .sort(([, a], [, b]) => a - b)[0]?.[0] as 'gymnastics' | 'weightlifting' | 'monoStructural' | 'mixed' | undefined;
    
    // Find least used movement pattern
    const patternRatios = {
      pulling: movementPatternBalance.pulling / total || 0,
      pushing: movementPatternBalance.pushing / total || 0,
      lowerBody: movementPatternBalance.lowerBody / total || 0,
      core: movementPatternBalance.core / total || 0,
      fullBody: movementPatternBalance.fullBody / total || 0,
    };
    const suggestedMovementPattern = Object.entries(patternRatios)
      .sort(([, a], [, b]) => a - b)[0]?.[0] as 'pulling' | 'pushing' | 'lowerBody' | 'core' | 'fullBody' | undefined;
    
    // Find least used intensity
    const intensityRatios = {
      heavy: intensityBalance.heavy / total || 0,
      moderate: intensityBalance.moderate / total || 0,
      light: intensityBalance.light / total || 0,
      skill: intensityBalance.skill / total || 0,
    };
    const suggestedIntensity = Object.entries(intensityRatios)
      .sort(([, a], [, b]) => a - b)[0]?.[0] as 'heavy' | 'moderate' | 'light' | 'skill' | undefined;
    
    // Find least used workout type
    const typeCounts = Object.entries(workoutTypeFrequency);
    const suggestedWorkoutType = typeCounts.length > 0
      ? typeCounts.sort(([, a], [, b]) => (a as number) - (b as number))[0]?.[0]
      : undefined;
    
    // Movements to avoid (used 2+ times)
    const movementsToAvoid = Object.entries(movementFrequency)
      .filter(([, count]) => count >= 2)
      .map(([movement]) => movement);
    
    // Movements to consider (never used or used once)
    const movementsToConsider = Object.entries(movementFrequency)
      .filter(([, count]) => count <= 1)
      .sort(([, a], [, b]) => (a as number) - (b as number))
      .slice(0, 10)
      .map(([movement]) => movement);
    
    return {
      suggestedTimeDomain,
      suggestedEnergySystem,
      suggestedModality,
      suggestedMovementPattern,
      suggestedIntensity,
      suggestedWorkoutType,
      movementsToAvoid,
      movementsToConsider,
    };
  }
}

