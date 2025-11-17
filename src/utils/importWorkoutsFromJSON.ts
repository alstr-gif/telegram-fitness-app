/**
 * Bulk Import Workouts from JSON File
 * 
 * Usage:
 *   ts-node src/utils/importWorkoutsFromJSON.ts path/to/workouts.json
 * 
 * JSON Format:
 * [
 *   {
 *     "name": "WOD Name",
 *     "type": "AMRAP",
 *     "duration": 20,
 *     "description": "Workout description",
 *     "movements": ["5 Pull-ups", "10 Push-ups", "15 Squats"],
 *     "notes": "Scaling options",
 *     "intensity": "intermediate",
 *     "equipmentNeeded": "bodyweight",
 *     "movementDomains": ["gymnastics", "cardio"],
 *     "tags": ["short", "benchmark"],
 *     "rxWeight": "43/29 kg",
 *     "targetTime": "Sub 12 minutes",
 *     "isBenchmark": false,
 *     "isHeroWOD": false
 *   }
 * ]
 */

import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../config/database';
import { LibraryWorkoutService } from '../services/LibraryWorkoutService';
import { LibraryWorkout, IntensityLevel, EquipmentNeeded, WorkoutType } from '../entities/LibraryWorkout';

interface WorkoutJSON {
  name: string;
  type: WorkoutType | string;
  duration?: number;
  description: string;
  movements: string[];
  notes?: string;
  intensity?: IntensityLevel | string;
  equipmentNeeded?: EquipmentNeeded | string;
  requiredEquipment?: string[];
  movementDomains?: string[];
  muscleGroups?: string[];
  tags?: string[];
  rxWeight?: string;
  targetTime?: string;
  isBenchmark?: boolean;
  isHeroWOD?: boolean;
  workoutStructure?: any;
}

/**
 * Validate workout data
 */
function validateWorkout(workout: WorkoutJSON, index: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!workout.name || workout.name.trim() === '') {
    errors.push('name is required');
  }

  if (!workout.type) {
    errors.push('type is required');
  } else {
    const validTypes: WorkoutType[] = ['AMRAP', 'EMOM', 'For Time', 'Chipper', 'Rounds', 'Tabata', 'Custom'];
    if (!validTypes.includes(workout.type as WorkoutType)) {
      errors.push(`type must be one of: ${validTypes.join(', ')}`);
    }
  }

  if (!workout.description || workout.description.trim() === '') {
    errors.push('description is required');
  }

  if (!workout.movements || !Array.isArray(workout.movements) || workout.movements.length === 0) {
    errors.push('movements must be a non-empty array');
  }

  if (workout.intensity && !['beginner', 'intermediate', 'advanced'].includes(workout.intensity)) {
    errors.push('intensity must be beginner, intermediate, or advanced');
  }

  if (workout.equipmentNeeded && !['bodyweight', 'dumbbells', 'barbell', 'fullgym', 'minimal'].includes(workout.equipmentNeeded)) {
    errors.push('equipmentNeeded must be one of: bodyweight, dumbbells, barbell, fullgym, minimal');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Infer missing metadata from workout data
 */
function inferMetadata(workout: WorkoutJSON): Partial<LibraryWorkout> {
  const metadata: any = {};

  // Infer intensity if not provided
  if (!workout.intensity) {
    const name = workout.name.toLowerCase();
    const desc = workout.description.toLowerCase();
    const movements = workout.movements.join(' ').toLowerCase();

    if (workout.duration && workout.duration > 40) {
      metadata.intensity = 'advanced';
    } else if (desc.includes('100') || desc.includes('200') || desc.includes('300') || movements.includes('100') || movements.includes('200')) {
      metadata.intensity = 'advanced';
    } else if (movements.includes('air squat') && !movements.includes('barbell')) {
      metadata.intensity = 'beginner';
    } else {
      metadata.intensity = 'intermediate';
    }
  }

  // Infer equipment if not provided
  if (!workout.equipmentNeeded) {
    const movements = workout.movements.join(' ').toLowerCase();
    
    if (movements.includes('barbell') || movements.includes('clean') || movements.includes('snatch') || 
        movements.includes('deadlift') || (movements.includes('squat') && movements.includes('kg'))) {
      metadata.equipmentNeeded = 'fullgym';
    } else if (movements.includes('dumbbell') || movements.includes('kettlebell') || movements.includes('kb')) {
      metadata.equipmentNeeded = 'dumbbells';
    } else {
      metadata.equipmentNeeded = 'bodyweight';
    }
  }

  // Infer movement domains if not provided
  if (!workout.movementDomains || workout.movementDomains.length === 0) {
    const movements = workout.movements.join(' ').toLowerCase();
    const domains: string[] = [];

    if (movements.includes('clean') || movements.includes('snatch') || movements.includes('jerk') ||
        movements.includes('deadlift') || movements.includes('thruster') || 
        (movements.includes('press') && movements.includes('kg'))) {
      domains.push('weightlifting');
    }

    if (movements.includes('pull-up') || movements.includes('push-up') || movements.includes('muscle-up') ||
        movements.includes('handstand') || movements.includes('toes-to-bar')) {
      domains.push('gymnastics');
    }

    if (movements.includes('run') || movements.includes('row') || movements.includes('bike') ||
        movements.includes('burpee') || movements.includes('double-under')) {
      domains.push('cardio');
    }

    metadata.movementDomains = domains.length > 0 ? domains : ['gymnastics', 'weightlifting', 'cardio'];
  }

  // Infer tags if not provided
  if (!workout.tags || workout.tags.length === 0) {
    const tags: string[] = [];
    const name = workout.name.toLowerCase();

    if (['fran', 'murph', 'annie', 'helen', 'grace', 'diane', 'dt'].includes(name)) {
      tags.push('benchmark');
    }

    if (workout.duration) {
      if (workout.duration <= 20) {
        tags.push('short');
      } else if (workout.duration >= 40) {
        tags.push('long');
        tags.push('grinder');
      }
    }

    if (workout.type === 'AMRAP') {
      tags.push('metcon');
    }
    if (workout.type === 'For Time') {
      tags.push('for_time');
    }

    if (tags.length > 0) {
      metadata.tags = tags;
    }
  }

  return metadata;
}

/**
 * Main import function
 */
async function importWorkoutsFromJSON(filePath: string, dryRun: boolean = false) {
  console.log('🚀 Starting bulk workout import...\n');

  try {
    // Initialize database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected\n');
    }

    // Read JSON file
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }

    console.log(`📖 Reading file: ${fullPath}\n`);
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    const workouts: WorkoutJSON[] = JSON.parse(fileContent);

    if (!Array.isArray(workouts)) {
      throw new Error('JSON file must contain an array of workouts');
    }

    console.log(`📝 Found ${workouts.length} workouts to import\n`);

    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No workouts will be imported\n');
    }

    const libraryService = new LibraryWorkoutService();
    const validWorkouts: Partial<LibraryWorkout>[] = [];
    const skippedWorkouts: Array<{ index: number; workout: WorkoutJSON; errors: string[] }> = [];

    // Check for duplicates
    const existing = await libraryService.getAllActive();
    const existingNames = new Set(existing.map(w => w.name.toLowerCase()));

    // Validate and prepare workouts
    for (let i = 0; i < workouts.length; i++) {
      const workout = workouts[i];
      const validation = validateWorkout(workout, i);

      if (!validation.valid) {
        skippedWorkouts.push({
          index: i + 1,
          workout,
          errors: validation.errors,
        });
        continue;
      }

      // Check for duplicates
      if (existingNames.has(workout.name.toLowerCase())) {
        skippedWorkouts.push({
          index: i + 1,
          workout,
          errors: [`Duplicate workout: "${workout.name}" already exists in database`],
        });
        continue;
      }

      // Infer missing metadata
      const inferred = inferMetadata(workout);

      // Prepare workout data
      const workoutData: Partial<LibraryWorkout> = {
        name: workout.name.trim(),
        type: workout.type as WorkoutType,
        duration: workout.duration,
        description: workout.description.trim(),
        movements: workout.movements,
        notes: workout.notes?.trim(),
        intensity: (workout.intensity || inferred.intensity) as IntensityLevel,
        equipmentNeeded: (workout.equipmentNeeded || inferred.equipmentNeeded) as EquipmentNeeded,
        requiredEquipment: workout.requiredEquipment,
        movementDomains: workout.movementDomains || inferred.movementDomains,
        muscleGroups: workout.muscleGroups,
        tags: workout.tags || inferred.tags,
        rxWeight: workout.rxWeight,
        targetTime: workout.targetTime,
        isBenchmark: workout.isBenchmark || false,
        isHeroWOD: workout.isHeroWOD || false,
        workoutStructure: workout.workoutStructure,
        isActive: true,
        popularityScore: 0,
      };

      validWorkouts.push(workoutData);
    }

    // Report results
    console.log(`✅ Valid workouts: ${validWorkouts.length}`);
    console.log(`⚠️  Skipped workouts: ${skippedWorkouts.length}\n`);

    if (skippedWorkouts.length > 0) {
      console.log('Skipped workouts (with errors):');
      skippedWorkouts.forEach(({ index, workout, errors }) => {
        console.log(`  ${index}. "${workout.name}": ${errors.join(', ')}`);
      });
      console.log('');
    }

    if (validWorkouts.length === 0) {
      console.log('❌ No valid workouts to import');
      return;
    }

    // Import workouts
    if (!dryRun) {
      console.log(`💾 Importing ${validWorkouts.length} workouts...\n`);
      const saved = await libraryService.bulkCreate(validWorkouts);
      
      console.log(`✅ Successfully imported ${saved.length} workouts!\n`);
      console.log('📊 Summary:');
      
      const stats = {
        benchmarks: saved.filter(w => w.isBenchmark).length,
        heroWODs: saved.filter(w => w.isHeroWOD).length,
        beginner: saved.filter(w => w.intensity === 'beginner').length,
        intermediate: saved.filter(w => w.intensity === 'intermediate').length,
        advanced: saved.filter(w => w.intensity === 'advanced').length,
        bodyweight: saved.filter(w => w.equipmentNeeded === 'bodyweight').length,
        dumbbells: saved.filter(w => w.equipmentNeeded === 'dumbbells').length,
        fullgym: saved.filter(w => w.equipmentNeeded === 'fullgym').length,
      };
      
      console.log(`   - Benchmarks: ${stats.benchmarks}`);
      console.log(`   - Hero WODs: ${stats.heroWODs}`);
      console.log(`   - Beginner: ${stats.beginner}`);
      console.log(`   - Intermediate: ${stats.intermediate}`);
      console.log(`   - Advanced: ${stats.advanced}`);
      console.log(`   - Bodyweight: ${stats.bodyweight}`);
      console.log(`   - Dumbbells: ${stats.dumbbells}`);
      console.log(`   - Full Gym: ${stats.fullgym}\n`);
      
      console.log('🎉 Import complete!');
    } else {
      console.log('🔍 DRY RUN - Would import these workouts:');
      validWorkouts.slice(0, 5).forEach((w, i) => {
        console.log(`   ${i + 1}. ${w.name} (${w.type})`);
      });
      if (validWorkouts.length > 5) {
        console.log(`   ... and ${validWorkouts.length - 5} more`);
      }
      console.log('\n💡 Remove --dry-run flag to actually import');
    }

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: ts-node src/utils/importWorkoutsFromJSON.ts <json-file> [--dry-run]');
    console.log('\nExample:');
    console.log('  ts-node src/utils/importWorkoutsFromJSON.ts workouts.json');
    console.log('  ts-node src/utils/importWorkoutsFromJSON.ts workouts.json --dry-run');
    process.exit(1);
  }

  const filePath = args[0];
  const dryRun = args.includes('--dry-run');

  importWorkoutsFromJSON(filePath, dryRun)
    .then(() => {
      console.log('\n✅ Import script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Import script failed:', error);
      process.exit(1);
    });
}

export { importWorkoutsFromJSON };









