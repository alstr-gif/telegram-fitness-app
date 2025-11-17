import { LibraryWorkoutService } from './LibraryWorkoutService';
import { SingleWorkoutService } from './SingleWorkoutService';
import { AIWorkoutService } from './AIWorkoutService';
import { FitnessLevel, FitnessGoal } from '../entities/User';
import { LibraryWorkout } from '../entities/LibraryWorkout';
import { LibraryWorkoutSanityChecker } from './LibraryWorkoutSanityChecker';

/**
 * Hybrid Workout Selection Service
 * 
 * Decides between:
 * 1. Selecting directly from library (consistent, proven workouts)
 * 2. AI-generating new workouts (variety, personalization)
 * 
 * Strategy can be configured:
 * - Always use library
 * - Always use AI
 * - Smart hybrid (e.g., 70% library, 30% AI)
 * - Based on user preferences
 */
export interface WorkoutSelectionStrategy {
  useLibraryPercentage?: number; // 0-100, probability of using library vs AI
  preferLibraryForBenchmarks?: boolean;
  preferLibraryForHeroWODs?: boolean;
  useAIIfNoLibraryMatch?: boolean;
  minLibraryMatches?: number; // Minimum library workouts found before considering library
}

export interface SingleWorkoutSelectionRequest {
  timeChoice: 'quick' | 'classic' | 'long';
  trainingType: 'lifting' | 'gymnastics' | 'cardio' | 'mixed';
  goalType: 'strength' | 'conditioning' | 'skill' | 'balanced';
  gearType: 'bodyweight' | 'dumbbells' | 'fullgym';
  userId?: string;
  fitnessLevel?: FitnessLevel;
  strategy?: WorkoutSelectionStrategy;
}

export interface WorkoutPlanSelectionRequest {
  fitnessLevel: FitnessLevel;
  primaryGoal: FitnessGoal;
  preferredDays: string[];
  duration: number;
  availableEquipment?: string[];
  injuries?: string;
  weeksCount?: number;
  strategy?: WorkoutSelectionStrategy;
}

export class WorkoutSelectionService {
  private libraryService: LibraryWorkoutService;
  private singleWorkoutService: SingleWorkoutService;
  private aiWorkoutService: AIWorkoutService;
  private librarySanityChecker: LibraryWorkoutSanityChecker;

  constructor() {
    this.libraryService = new LibraryWorkoutService();
    this.singleWorkoutService = new SingleWorkoutService();
    this.aiWorkoutService = new AIWorkoutService();
    this.librarySanityChecker = new LibraryWorkoutSanityChecker();
  }

  /**
   * Select a single workout (hybrid approach)
   */
  async selectSingleWorkout(
    request: SingleWorkoutSelectionRequest
  ): Promise<{
    source: 'library' | 'ai';
    workout: any;
    libraryWorkout?: LibraryWorkout;
  }> {
    const strategy = request.strategy || this.getDefaultStrategy();

    // Check if we should use library
    const shouldUseLibrary = this.shouldUseLibrary(strategy, request);

    if (shouldUseLibrary) {
      // Try to find matching library workouts
      const libraryWorkouts = await this.libraryService.findForWorkoutRequest({
        timeChoice: request.timeChoice,
        trainingType: request.trainingType,
        goalType: request.goalType,
        gearType: request.gearType,
        fitnessLevel: request.fitnessLevel,
      });

      if (libraryWorkouts.length > 0) {
        // Filter workouts that match the time choice based on estimated duration
        const matchingWorkouts = libraryWorkouts.filter(workout => {
          const durationEstimate = this.estimateWorkoutDuration(workout, request.timeChoice || 'classic');
          return durationEstimate.matchesTimeChoice;
        });

        // If we have matches that fit the time choice, use them; otherwise use all matches
        const candidates = matchingWorkouts.length > 0 ? matchingWorkouts : libraryWorkouts;
        
        if (matchingWorkouts.length === 0 && libraryWorkouts.length > 0) {
          console.log(`⚠️ Found ${libraryWorkouts.length} library workouts, but none match time choice "${request.timeChoice}". Using best match.`);
        }

        // Select one randomly from candidates
        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        
        // Convert library workout to the format expected by the system
        let converted = await this.convertLibraryWorkoutToSingleWorkout(
          selected,
          request
        );

        const sanityChecked = await this.librarySanityChecker.review(converted, { request });
        if (sanityChecked) {
          converted = sanityChecked;
        }

        // Track usage
        await this.libraryService.incrementPopularity(selected.id);

        return {
          source: 'library',
          workout: converted,
          libraryWorkout: selected,
        };
      }

      // If no library matches found, log and fall back to AI
      if (libraryWorkouts.length === 0) {
        console.log('⚠️ No library matches found for preferences:', {
          timeChoice: request.timeChoice,
          trainingType: request.trainingType,
          gearType: request.gearType,
        }, '- falling back to AI generation');
      }
    }

    // Generate with AI
    const aiWorkout = await this.singleWorkoutService.generateSingleWorkout({
      timeChoice: request.timeChoice,
      trainingType: request.trainingType,
      goalType: request.goalType,
      gearType: request.gearType,
      userId: request.userId,
      fitnessLevel: request.fitnessLevel,
    });

    return {
      source: 'ai',
      workout: aiWorkout,
    };
  }

  /**
   * Select workouts for a plan (can mix library and AI)
   */
  async selectWorkoutPlan(
    request: WorkoutPlanSelectionRequest
  ): Promise<{
    source: 'library' | 'ai' | 'hybrid';
    plan: any;
    libraryWorkouts?: LibraryWorkout[];
  }> {
    const strategy = request.strategy || this.getDefaultStrategy();

    // For now, we'll primarily use AI for plans since they need more coordination
    // But we can improve this to intelligently mix library workouts

    const plan = await this.aiWorkoutService.generateWorkoutPlan({
      fitnessLevel: request.fitnessLevel,
      primaryGoal: request.primaryGoal,
      preferredDays: request.preferredDays,
      duration: request.duration,
      availableEquipment: request.availableEquipment,
      injuries: request.injuries,
      weeksCount: request.weeksCount,
    });

    return {
      source: 'ai',
      plan,
    };
  }

  /**
   * Estimate workout duration from description and type
   */
  private estimateWorkoutDuration(libraryWorkout: LibraryWorkout, timeChoice: string): {
    estimatedWodDuration: number;
    matchesTimeChoice: boolean;
  } {
    // If workout has duration set, use it
    if (libraryWorkout.duration) {
      const expectedDuration = this.getExpectedDurationForTimeChoice(timeChoice);
      return {
        estimatedWodDuration: libraryWorkout.duration,
        matchesTimeChoice: Math.abs(libraryWorkout.duration - expectedDuration) <= 10, // Allow 10 min variance
      };
    }

    // Analyze description and type to estimate duration
    const description = libraryWorkout.description.toLowerCase();
    const type = libraryWorkout.type.toLowerCase();
    const name = libraryWorkout.name.toLowerCase();
    
    let estimatedDuration = 25; // Default

    // Known fast benchmarks (typically < 10 minutes)
    const fastBenchmarks = ['annie', 'fran', 'grace', 'nancy', 'diane', 'elizabeth', 'jackie', 'karen'];
    if (fastBenchmarks.some(benchmark => name.includes(benchmark))) {
      estimatedDuration = 8; // Fast benchmarks are typically 5-10 minutes
    }

    // Known long workouts (typically > 45 minutes)
    const longWorkouts = ['murph', 'dt', 'filthy fifty', 'seven', 'fight gone bad'];
    if (longWorkouts.some(workout => name.includes(workout))) {
      estimatedDuration = 50; // Long workouts are typically 45-60+ minutes
    }

    // Analyze by type and description
    if (type.includes('amrap')) {
      // Extract time from description (e.g., "20 min AMRAP")
      const timeMatch = description.match(/(\d+)\s*min\s*amrap/i);
      if (timeMatch) {
        estimatedDuration = parseInt(timeMatch[1], 10);
      } else {
        // Default AMRAP durations
        if (description.includes('short') || description.includes('quick')) {
          estimatedDuration = 10;
        } else if (description.includes('long')) {
          estimatedDuration = 30;
        } else {
          estimatedDuration = 20; // Default AMRAP
        }
      }
    } else if (type.includes('emom')) {
      // Extract time from description (e.g., "12 min EMOM")
      const timeMatch = description.match(/(\d+)\s*min\s*emom/i);
      if (timeMatch) {
        estimatedDuration = parseInt(timeMatch[1], 10);
      } else {
        estimatedDuration = 16; // Default EMOM
      }
    } else if (type.includes('for time') || type.includes('chipper')) {
      // Analyze rep schemes
      if (description.includes('21-15-9') || description.includes('50-40-30-20-10')) {
        // Simple descending rep schemes are fast
        estimatedDuration = 8;
      } else if (description.match(/\d{3,}/)) {
        // High rep counts (100+, 200+, 300+) indicate longer workouts
        estimatedDuration = 40;
      } else if (description.includes('rounds')) {
        // Count rounds
        const roundsMatch = description.match(/(\d+)\s*rounds/i);
        if (roundsMatch) {
          const rounds = parseInt(roundsMatch[1], 10);
          if (rounds <= 3) {
            estimatedDuration = 15;
          } else if (rounds <= 5) {
            estimatedDuration = 25;
          } else {
            estimatedDuration = 40;
          }
        }
      } else {
        estimatedDuration = 20; // Default for time
      }
    } else if (type.includes('tabata')) {
      estimatedDuration = 16; // Typical Tabata is 4 minutes x 4 rounds
    }

    // Check target time if available
    if (libraryWorkout.targetTime) {
      const timeMatch = libraryWorkout.targetTime.match(/(\d+)/);
      if (timeMatch) {
        estimatedDuration = parseInt(timeMatch[1], 10);
      }
    }

    const expectedDuration = this.getExpectedDurationForTimeChoice(timeChoice);
    const matchesTimeChoice = Math.abs(estimatedDuration - expectedDuration) <= 15; // Allow 15 min variance

    return {
      estimatedWodDuration: estimatedDuration,
      matchesTimeChoice,
    };
  }

  /**
   * Get expected WOD duration for time choice
   */
  private getExpectedDurationForTimeChoice(timeChoice: string): number {
    const wodDurationMap: { [key: string]: number } = {
      quick: 15, // 10-20 min range
      classic: 25, // 20-35 min range
      long: 45, // 35-60 min range
    };
    return wodDurationMap[timeChoice] || 25;
  }

  /**
   * Convert LibraryWorkout to SingleWorkout format
   */
  private async convertLibraryWorkoutToSingleWorkout(
    libraryWorkout: LibraryWorkout,
    request: SingleWorkoutSelectionRequest
  ): Promise<any> {
    // Use stored structure if available
    if (libraryWorkout.workoutStructure?.blocks) {
      // Validate duration matches time choice
      const timeChoice = request.timeChoice || 'classic';
      const durationEstimate = this.estimateWorkoutDuration(libraryWorkout, timeChoice);
      
      // Adjust blocks if duration doesn't match
      const blocks = libraryWorkout.workoutStructure.blocks.map(block => {
        if (block.blockType === 'wod') {
          return {
            ...block,
            duration: durationEstimate.estimatedWodDuration,
          };
        }
        return block;
      });

      return {
        name: libraryWorkout.name,
        description: `${libraryWorkout.type}: ${libraryWorkout.description}`,
        duration: 60, // Always 60 minutes total session (warm-up + skill + WOD + cool-down)
        focus: request.trainingType || 'mixed',
        blocks,
      };
    }

    // Otherwise, construct from basic workout data
    const timeChoice = request.timeChoice || 'classic';
    
    // Estimate duration from workout description
    const durationEstimate = this.estimateWorkoutDuration(libraryWorkout, timeChoice);
    const wodDuration = durationEstimate.estimatedWodDuration;
    
    // Adjust skill duration based on WOD duration (shorter WOD = more skill time)
    const skillDurationMap: { [key: string]: number } = {
      quick: 20,
      classic: 15,
      long: 10,
    };
    let skillDuration = skillDurationMap[timeChoice];
    
    // If WOD is very short, add more skill time
    if (wodDuration < 15) {
      skillDuration = 25; // Extra skill time for fast WODs
    } else if (wodDuration > 40) {
      skillDuration = 5; // Minimal skill time for long WODs
    }

    // Parse movements into exercises
    const exercises = libraryWorkout.movements.map((movement, index) => {
      // Simple parsing - in production you'd want more sophisticated parsing
      const parts = movement.split(/(\d+[-–]\d+[-–]\d+|\d+)/);
      let reps = parts[1] || movement;
      let name = movement.replace(reps, '').trim();

      return {
        name: name || movement,
        description: movement,
        type: this.inferExerciseType(movement),
        reps: reps,
        weight: libraryWorkout.rxWeight || undefined,
        instructions: `${libraryWorkout.notes || ''} RX: ${libraryWorkout.rxWeight || 'bodyweight'}. Scaled: Reduce weight or modify movement. Beginner: Use easier variation.`,
        muscleGroups: libraryWorkout.muscleGroups || ['full body'],
        order: index + 1,
      };
    });

    return {
      name: libraryWorkout.name,
      description: `${libraryWorkout.type}: ${libraryWorkout.description}`,
      duration: 60,
      focus: request.trainingType || 'mixed',
      blocks: [
        {
          blockType: 'warm-up',
          blockName: 'Warm-Up',
          duration: 10,
          exercises: this.generateWarmupExercises(exercises),
        },
        {
          blockType: 'skill',
          blockName: 'Skill/Strength Work',
          duration: skillDuration,
          description: 'Practice or build strength in WOD movements',
          exercises: this.generateSkillExercises(exercises, timeChoice),
        },
        {
          blockType: 'wod',
          blockName: 'The WOD',
          duration: wodDuration, // Use estimated duration from description
          wodFormat: libraryWorkout.type,
          description: `${libraryWorkout.type}: ${libraryWorkout.description}. Complete all movements as prescribed.`,
          exercises: exercises,
        },
        {
          blockType: 'cooldown',
          blockName: 'Cool-Down & Stretching',
          duration: 10,
          exercises: this.generateCooldownExercises(exercises),
        },
      ],
    };
  }

  /**
   * Generate warmup exercises based on WOD movements
   */
  private generateWarmupExercises(wodExercises: any[]): any[] {
    const movementNames = wodExercises.map(e => e.name.toLowerCase());
    const warmup = [];

    // Generic warmup
    warmup.push({
      name: 'Jump Rope',
      reps: '2 minutes',
      instructions: 'Light jumping to warm up',
      order: 1,
    });

    warmup.push({
      name: 'Dynamic Stretching',
      reps: '10 reps each',
      instructions: 'Arm circles, leg swings, torso twists',
      order: 2,
    });

    // Movement-specific prep
    if (movementNames.some(m => m.includes('pull') || m.includes('row'))) {
      warmup.push({
        name: 'Band Pull-Aparts',
        reps: '15 reps',
        instructions: 'Prepare shoulders for pulling',
        order: warmup.length + 1,
      });
    }

    if (movementNames.some(m => m.includes('squat') || m.includes('thruster'))) {
      warmup.push({
        name: 'Air Squats',
        reps: '10 reps',
        instructions: 'Prep for squatting movements',
        order: warmup.length + 1,
      });
    }

    return warmup.slice(0, 7);
  }

  /**
   * Generate skill exercises
   */
  private generateSkillExercises(wodExercises: any[], timeChoice: string): any[] {
    if (timeChoice === 'long') {
      return [
        {
          name: 'Light Movement Practice',
          reps: 'Few practice reps',
          instructions: 'Go through movements at light weight/intensity',
          order: 1,
        },
      ];
    }

    // For quick/classic, add skill work
    const skillExercises: Array<{
      name: string;
      reps: string;
      weight?: string;
      instructions: string;
      order: number;
    }> = [];
    const mainMovements = wodExercises.slice(0, 2);

    mainMovements.forEach((movement, index) => {
      skillExercises.push({
        name: `${movement.name} - Skill Work`,
        reps: '5 sets x 3-5 reps',
        weight: movement.weight || undefined,
        instructions: 'Practice form and build to working weight',
        order: index + 1,
      });
    });

    return skillExercises.slice(0, 4);
  }

  /**
   * Generate cooldown exercises
   */
  private generateCooldownExercises(wodExercises: any[]): any[] {
    return [
      {
        name: 'Quad Stretch',
        reps: '30-60 seconds each',
        instructions: 'Stretch quadriceps',
        order: 1,
      },
      {
        name: 'Shoulder Stretch',
        reps: '30-60 seconds each',
        instructions: 'Stretch shoulders and lats',
        order: 2,
      },
      {
        name: 'Hamstring Stretch',
        reps: '30-60 seconds each',
        instructions: 'Stretch hamstrings',
        order: 3,
      },
      {
        name: 'Hip Flexor Stretch',
        reps: '30-60 seconds each',
        instructions: 'Stretch hip flexors',
        order: 4,
      },
      {
        name: 'Back Stretch',
        reps: '30-60 seconds',
        instructions: 'Cat-cow or child\'s pose',
        order: 5,
      },
    ];
  }

  /**
   * Infer exercise type from movement name
   */
  private inferExerciseType(movement: string): 'strength' | 'cardio' | 'flexibility' | 'balance' {
    const lower = movement.toLowerCase();
    if (lower.includes('run') || lower.includes('row') || lower.includes('bike') || lower.includes('burpee')) {
      return 'cardio';
    }
    if (lower.includes('squat') || lower.includes('deadlift') || lower.includes('clean') || lower.includes('snatch') || lower.includes('press')) {
      return 'strength';
    }
    return 'strength'; // Default
  }

  /**
   * Decide whether to use library based on strategy
   */
  private shouldUseLibrary(
    strategy: WorkoutSelectionStrategy,
    request: SingleWorkoutSelectionRequest
  ): boolean {
    // If explicitly set to use library percentage
    if (strategy.useLibraryPercentage !== undefined) {
      return Math.random() * 100 < strategy.useLibraryPercentage;
    }

    // Default: 50% chance to use library if we have good matches
    return Math.random() < 0.5;
  }

  /**
   * Get default selection strategy
   */
  private getDefaultStrategy(): WorkoutSelectionStrategy {
    return {
      useLibraryPercentage: 45, // 45% chance to use library workouts, 55% AI-generated (custom)
      preferLibraryForBenchmarks: true,
      preferLibraryForHeroWODs: true,
      useAIIfNoLibraryMatch: true,
      minLibraryMatches: 1,
    };
  }
}

