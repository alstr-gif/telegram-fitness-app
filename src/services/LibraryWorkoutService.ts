import { Repository, In, Like } from 'typeorm';
import { AppDataSource } from '../config/database';
import { LibraryWorkout, WorkoutType, IntensityLevel, EquipmentNeeded } from '../entities/LibraryWorkout';
import { FitnessLevel, FitnessGoal } from '../entities/User';

export interface LibraryWorkoutFilter {
  type?: WorkoutType | WorkoutType[];
  intensity?: IntensityLevel | IntensityLevel[];
  equipmentNeeded?: EquipmentNeeded | EquipmentNeeded[];
  requiredEquipment?: string[]; // Must have all of these
  duration?: {
    min?: number;
    max?: number;
  };
  muscleGroups?: string[];
  movementDomains?: string[];
  tags?: string[];
  isBenchmark?: boolean;
  isHeroWOD?: boolean;
  excludeNames?: string[]; // Exclude specific workout names
  fitnessLevel?: FitnessLevel;
  primaryGoal?: FitnessGoal;
}

export interface LibraryWorkoutSelectionOptions {
  count?: number; // Number of workouts to return
  preferRecent?: boolean;
  preferPopular?: boolean;
  randomize?: boolean;
}

export class LibraryWorkoutService {
  private repository: Repository<LibraryWorkout>;

  constructor() {
    this.repository = AppDataSource.getRepository(LibraryWorkout);
  }

  /**
   * Get all active library workouts
   */
  async getAllActive(): Promise<LibraryWorkout[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { popularityScore: 'DESC', name: 'ASC' },
    });
  }

  /**
   * Find workouts matching user preferences
   */
  async findMatchingWorkouts(
    filter: LibraryWorkoutFilter,
    options: LibraryWorkoutSelectionOptions = {}
  ): Promise<LibraryWorkout[]> {
    const query = this.repository.createQueryBuilder('workout')
      .where('workout.isActive = :isActive', { isActive: true });

    // Filter by type
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      query.andWhere('workout.type IN (:...types)', { types });
    }

    // Filter by intensity
    if (filter.intensity) {
      const intensities = Array.isArray(filter.intensity) ? filter.intensity : [filter.intensity];
      query.andWhere('workout.intensity IN (:...intensities)', { intensities });
    }

    // Filter by fitness level (map user level to workout intensity)
    if (filter.fitnessLevel) {
      const intensityMap: Record<FitnessLevel, IntensityLevel[]> = {
        beginner: ['beginner'],
        intermediate: ['beginner', 'intermediate'],
        advanced: ['beginner', 'intermediate', 'advanced'],
      };
      const allowedIntensities = intensityMap[filter.fitnessLevel];
      query.andWhere('(workout.intensity IS NULL OR workout.intensity IN (:...allowedIntensities))', {
        allowedIntensities,
      });
    }

    // Filter by equipment
    if (filter.equipmentNeeded) {
      const equipment = Array.isArray(filter.equipmentNeeded) ? filter.equipmentNeeded : [filter.equipmentNeeded];
      
      // If user has fullgym, they can do anything
      // If user has dumbbells, they can do bodyweight + dumbbells
      // If user has bodyweight only, only bodyweight workouts
      if (equipment.includes('fullgym')) {
        // Can do all workouts
      } else if (equipment.includes('dumbbells')) {
        query.andWhere('workout.equipmentNeeded IN (:...equipment)', {
          equipment: ['bodyweight', 'dumbbells'],
        });
      } else if (equipment.includes('bodyweight')) {
        query.andWhere('workout.equipmentNeeded = :equipment', { equipment: 'bodyweight' });
      } else {
        query.andWhere('workout.equipmentNeeded IN (:...equipment)', { equipment });
      }
    }

    // Filter by required equipment (must have ALL)
    if (filter.requiredEquipment && filter.requiredEquipment.length > 0) {
      // This is a simplified approach - in production you might want more complex matching
      filter.requiredEquipment.forEach((req, index) => {
        query.andWhere(`workout.requiredEquipment LIKE :req${index}`, {
          [`req${index}`]: `%${req}%`,
        });
      });
    }

    // Filter by duration (lenient - allow NULL durations to match)
    // If duration filter is set but workout has no duration, still allow it to match
    if (filter.duration) {
      if (filter.duration.min && filter.duration.max) {
        // Use OR to allow workouts without duration to still match
        query.andWhere('(workout.duration IS NULL OR (workout.duration >= :minDuration AND workout.duration <= :maxDuration))', {
          minDuration: filter.duration.min,
          maxDuration: filter.duration.max,
        });
      } else if (filter.duration.min) {
        query.andWhere('(workout.duration IS NULL OR workout.duration >= :minDuration)', {
          minDuration: filter.duration.min,
        });
      } else if (filter.duration.max) {
        query.andWhere('(workout.duration IS NULL OR workout.duration <= :maxDuration)', {
          maxDuration: filter.duration.max,
        });
      }
    }

    // Filter by movement domains (use OR - match if any domain is present)
    if (filter.movementDomains && filter.movementDomains.length > 0) {
      // For "mixed" training type, accept workouts with multiple domains OR any single domain
      // For specific types (lifting, gymnastics, cardio), match that specific domain
      const domainConditions = filter.movementDomains.map((domain, index) => {
        return `workout.movementDomains LIKE :domain${index}`;
      }).join(' OR ');
      
      const domainParams: any = {};
      filter.movementDomains.forEach((domain, index) => {
        domainParams[`domain${index}`] = `%${domain}%`;
      });
      
      query.andWhere(`(${domainConditions})`, domainParams);
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      const tagConditions = filter.tags.map((tag, index) => {
        return `workout.tags LIKE :tag${index}`;
      }).join(' OR ');
      
      const tagParams: any = {};
      filter.tags.forEach((tag, index) => {
        tagParams[`tag${index}`] = `%${tag}%`;
      });
      
      query.andWhere(`(${tagConditions})`, tagParams);
    }

    // Filter by benchmark/Hero WOD
    if (filter.isBenchmark !== undefined) {
      query.andWhere('workout.isBenchmark = :isBenchmark', { isBenchmark: filter.isBenchmark });
    }
    if (filter.isHeroWOD !== undefined) {
      query.andWhere('workout.isHeroWOD = :isHeroWOD', { isHeroWOD: filter.isHeroWOD });
    }

    // Exclude specific workout names
    if (filter.excludeNames && filter.excludeNames.length > 0) {
      query.andWhere('workout.name NOT IN (:...excludeNames)', { excludeNames: filter.excludeNames });
    }

    // Ordering
    if (options.preferPopular) {
      query.orderBy('workout.popularityScore', 'DESC');
    } else if (options.preferRecent) {
      query.orderBy('workout.createdAt', 'DESC');
    }

    query.addOrderBy('workout.name', 'ASC');

    let results = await query.getMany();

    // Randomize if requested
    if (options.randomize && results.length > 0) {
      results = this.shuffleArray([...results]);
    }

    // Limit results
    if (options.count && options.count > 0) {
      results = results.slice(0, options.count);
    }

    return results;
  }

  /**
   * Get workouts that match specific workout preferences
   */
  async findForWorkoutRequest(request: {
    timeChoice?: 'quick' | 'classic' | 'long';
    trainingType?: 'lifting' | 'gymnastics' | 'cardio' | 'mixed';
    goalType?: 'strength' | 'conditioning' | 'skill' | 'balanced';
    gearType?: 'bodyweight' | 'dumbbells' | 'fullgym';
    fitnessLevel?: FitnessLevel;
    duration?: number;
  }): Promise<LibraryWorkout[]> {
    const filter: LibraryWorkoutFilter = {
      fitnessLevel: request.fitnessLevel,
    };

    // Map training type to movement domains (lenient - match if any domain matches)
    if (request.trainingType) {
      const domainMap = {
        lifting: ['weightlifting'],
        gymnastics: ['gymnastics'],
        cardio: ['cardio'],
        mixed: ['gymnastics', 'weightlifting', 'cardio'], // For mixed, accept any workout with multiple domains
      };
      filter.movementDomains = domainMap[request.trainingType] || [];
    }

    // Map gear type to equipment needed
    if (request.gearType) {
      const equipmentMap = {
        bodyweight: 'bodyweight' as EquipmentNeeded,
        dumbbells: 'dumbbells' as EquipmentNeeded,
        fullgym: 'fullgym' as EquipmentNeeded,
      };
      filter.equipmentNeeded = equipmentMap[request.gearType];
    }

    // Map time choice to duration (lenient - don't require exact duration match)
    // Only filter by duration if specified, but make it optional
    // Most library workouts don't have duration set, so we'll be lenient
    if (request.timeChoice && request.timeChoice !== 'classic') {
      // Only filter for quick/long to be more specific, classic is too broad
    if (request.timeChoice === 'quick') {
        filter.duration = { min: 5, max: 25 }; // Wider range
        // Don't require tags - many workouts don't have them
    } else if (request.timeChoice === 'long') {
        filter.duration = { min: 30, max: 100 }; // Wider range
        // Don't require tags - many workouts don't have them
      }
    }
    // For classic, don't filter by duration - accept any workout

    return this.findMatchingWorkouts(filter, {
      count: 20, // Get more options for variety
      randomize: true,
    });
  }

  /**
   * Get random workouts for AI inspiration
   */
  async getRandomForAI(count: number = 4): Promise<LibraryWorkout[]> {
    const selected: LibraryWorkout[] = [];
    const seenIds = new Set<string>();
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts && selected.length < count; attempt++) {
      const remaining = count - selected.length;
      const batchSize = Math.max(remaining * 3, count); // fetch extras for filtering

      const batch = await this.repository
        .createQueryBuilder('workout')
        .where('workout.isActive = :isActive', { isActive: true })
        .orderBy('RANDOM()')
        .limit(batchSize)
        .getMany();

      for (const workout of batch) {
        if (seenIds.has(workout.id)) continue;
        seenIds.add(workout.id);

        if (this.isCindyPattern(workout)) {
          continue; // resample when classic Cindy pattern is detected
        }

        selected.push(workout);
        if (selected.length === count) {
          break;
        }
      }
    }

    if (selected.length < count) {
      // As a fallback, fetch additional workouts (still skipping Cindy-style patterns)
      const fallback = await this.repository
        .createQueryBuilder('workout')
        .where('workout.isActive = :isActive', { isActive: true })
        .orderBy('RANDOM()')
        .limit(count - selected.length)
        .getMany();

      for (const workout of fallback) {
        if (selected.find(w => w.id === workout.id)) continue;
        if (this.isCindyPattern(workout)) continue;

        selected.push(workout);
        if (selected.length === count) {
          break;
        }
      }
    }

    return selected;
  }

  /**
   * Get workouts by name (exact match or similar)
   */
  async findByName(name: string): Promise<LibraryWorkout | null> {
    return this.repository.findOne({
      where: { name: Like(`%${name}%`), isActive: true },
    });
  }

  /**
   * Format library workout for AI prompt
   */
  formatForPrompt(workout: LibraryWorkout): string {
    return `
WOD: "${workout.name}" (${workout.type})
${workout.duration ? `Duration: ${workout.duration} minutes` : ''}
Intensity: ${workout.intensity || 'varies'} | Equipment: ${workout.equipmentNeeded || 'varies'}
Description: ${workout.description}
Movements:
${workout.movements.map(m => `- ${m}`).join('\n')}
${workout.notes ? `Notes: ${workout.notes}` : ''}
${workout.rxWeight ? `RX Weight: ${workout.rxWeight}` : ''}
${workout.targetTime ? `Target Time: ${workout.targetTime}` : ''}
`.trim();
  }

  /**
   * Get formatted workouts for AI prompt
   */
  async getFormattedForAI(count: number = 4): Promise<string> {
    const workouts = await this.getRandomForAI(count);
    return workouts.map(w => this.formatForPrompt(w)).join('\n\n---\n\n');
  }

  /**
   * Increment popularity score when a workout is used
   */
  async incrementPopularity(workoutId: string): Promise<void> {
    await this.repository.increment({ id: workoutId }, 'popularityScore', 1);
  }

  /**
   * Create a new library workout
   */
  async create(workout: Partial<LibraryWorkout>): Promise<LibraryWorkout> {
    const newWorkout = this.repository.create(workout);
    return this.repository.save(newWorkout);
  }

  /**
   * Bulk create workouts
   */
  async bulkCreate(workouts: Partial<LibraryWorkout>[]): Promise<LibraryWorkout[]> {
    const newWorkouts = this.repository.create(workouts);
    return this.repository.save(newWorkouts);
  }

  /**
   * Update a library workout
   */
  async update(id: string, updates: Partial<LibraryWorkout>): Promise<LibraryWorkout | null> {
    await this.repository.update(id, updates);
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Delete a library workout (soft delete by setting isActive = false)
   */
  async delete(id: string): Promise<void> {
    await this.repository.update(id, { isActive: false });
  }

  /**
   * Utility: Shuffle array randomly
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Detect classic Cindy 5-10-15 pull-up/push-up/air squat pattern
   */
  private isCindyPattern(workout: LibraryWorkout): boolean {
    if (!workout.movements || workout.movements.length === 0) {
      return false;
    }

    const normalizedMovements = workout.movements
      .filter(Boolean)
      .map(m => m.toLowerCase());

    const hasPullUps = this.hasMovementWithCount(normalizedMovements, 5, /pull[-\s]*ups?/i);
    const hasPushUps = this.hasMovementWithCount(normalizedMovements, 10, /push[-\s]*ups?/i);
    const hasAirSquats = this.hasMovementWithCount(normalizedMovements, 15, /air[-\s]*squats?/i);

    return hasPullUps && hasPushUps && hasAirSquats;
  }

  private hasMovementWithCount(
    movements: string[],
    count: number,
    movementRegex: RegExp
  ): boolean {
    return movements.some(line => {
      if (!movementRegex.test(line)) {
        return false;
      }
      const numbers = line.match(/\b\d+\b/g);
      if (!numbers) {
        return false;
      }
      return numbers.some(num => parseInt(num, 10) === count);
    });
  }
}


