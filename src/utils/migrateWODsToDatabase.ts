/**
 * Migration Script: Move WODs from crossfit-wods.ts to Database
 * 
 * Run this once to populate the library_workouts table with workouts
 * from the crossfit-wods.ts file.
 * 
 * Usage:
 *   ts-node src/utils/migrateWODsToDatabase.ts
 */

import { AppDataSource } from '../config/database';
import { LibraryWorkoutService } from '../services/LibraryWorkoutService';
import { crossfitWODs } from '../config/crossfit-wods';
import { LibraryWorkout, IntensityLevel, EquipmentNeeded } from '../entities/LibraryWorkout';

/**
 * Infer intensity from workout name/description
 */
function inferIntensity(wod: typeof crossfitWODs[0]): IntensityLevel | undefined {
  const name = wod.name.toLowerCase();
  const desc = wod.description.toLowerCase();

  // Known benchmarks are usually intermediate+
  if (wod.name === 'Fran' || wod.name === 'Murph' || wod.name === 'Grace' || wod.name === 'Helen') {
    return 'intermediate';
  }

  // Long workouts are usually advanced
  if (wod.duration && wod.duration > 40) {
    return 'advanced';
  }

  // High rep counts indicate advanced
  if (desc.includes('100') || desc.includes('200') || desc.includes('300') || desc.includes('50-40-30-20-10')) {
    return 'advanced';
  }

  // Simple bodyweight workouts are usually beginner-friendly
  if (name.includes('bodyweight')) {
    return 'beginner';
  }

  return 'intermediate'; // Default
}

/**
 * Infer equipment needed from movements
 */
function inferEquipment(wod: typeof crossfitWODs[0]): EquipmentNeeded {
  const movements = wod.movements.join(' ').toLowerCase();

  if (movements.includes('barbell') || movements.includes('clean') || movements.includes('snatch') || 
      movements.includes('deadlift') || movements.includes('squat') && movements.includes('kg')) {
    return 'fullgym';
  }

  if (movements.includes('dumbbell') || movements.includes('kettlebell') || movements.includes('kb')) {
    return 'dumbbells';
  }

  return 'bodyweight';
}

/**
 * Infer movement domains from movements
 */
function inferMovementDomains(wod: typeof crossfitWODs[0]): string[] {
  const movements = wod.movements.join(' ').toLowerCase();
  const domains: string[] = [];

  // Weightlifting
  if (movements.includes('clean') || movements.includes('snatch') || movements.includes('jerk') ||
      movements.includes('deadlift') || movements.includes('squat') && movements.includes('kg') ||
      movements.includes('thruster') || movements.includes('press') && movements.includes('kg')) {
    domains.push('weightlifting');
  }

  // Gymnastics
  if (movements.includes('pull-up') || movements.includes('push-up') || movements.includes('muscle-up') ||
      movements.includes('handstand') || movements.includes('toes-to-bar') || movements.includes('chest-to-bar')) {
    domains.push('gymnastics');
  }

  // Cardio
  if (movements.includes('run') || movements.includes('row') || movements.includes('bike') ||
      movements.includes('burpee') || movements.includes('double-under') || movements.includes('air squat')) {
    domains.push('cardio');
  }

  // If we have multiple domains, it's mixed
  if (domains.length > 1) {
    return ['gymnastics', 'weightlifting', 'cardio']; // Mixed
  }

  return domains.length > 0 ? domains : ['gymnastics', 'weightlifting', 'cardio'];
}

/**
 * Infer tags from workout
 */
function inferTags(wod: typeof crossfitWODs[0]): string[] {
  const tags: string[] = [];
  const name = wod.name.toLowerCase();

  // Benchmark WODs
  if (['fran', 'murph', 'annie', 'helen', 'grace', 'diane', 'dt'].includes(name)) {
    tags.push('benchmark');
  }

  // Hero WODs
  if (wod.name === 'Murph' || name.includes('hero')) {
    tags.push('hero_wod');
    tags.push('benchmark');
  }

  // Duration tags
  if (wod.duration) {
    if (wod.duration <= 20) {
      tags.push('short');
    } else if (wod.duration >= 40) {
      tags.push('long');
      tags.push('grinder');
    }
  }

  // Type-specific tags
  if (wod.type === 'AMRAP') {
    tags.push('metcon');
  }
  if (wod.type === 'For Time') {
    tags.push('for_time');
  }

  return tags;
}

/**
 * Extract RX weight from movements
 */
function extractRxWeight(wod: typeof crossfitWODs[0]): string | undefined {
  const movements = wod.movements.join(' ');
  const weightMatch = movements.match(/(\d+\/\d+)\s*kg/i);
  if (weightMatch) {
    return weightMatch[1] + ' kg';
  }
  return undefined;
}

/**
 * Extract target time from notes
 */
function extractTargetTime(wod: typeof crossfitWODs[0]): string | undefined {
  if (!wod.notes) return undefined;
  const timeMatch = wod.notes.match(/(?:target|goal|time):\s*(sub\s*)?(\d+)/i);
  if (timeMatch) {
    return timeMatch[1] ? `Sub ${timeMatch[2]} minutes` : `${timeMatch[2]} minutes`;
  }
  return undefined;
}

/**
 * Main migration function
 */
async function migrateWODsToDatabase() {
  console.log('🚀 Starting WOD migration to database...\n');

  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }

    const libraryService = new LibraryWorkoutService();

    // Check existing workouts
    const existing = await libraryService.getAllActive();
    console.log(`📊 Found ${existing.length} existing library workouts`);

    if (existing.length > 0) {
      console.log('⚠️  Library workouts already exist. Skipping migration.');
      console.log('   To re-migrate, clear the library_workouts table first.');
      return;
    }

    // Convert and save workouts
    console.log(`\n📝 Converting ${crossfitWODs.length} workouts...\n`);

    const libraryWorkouts: Partial<LibraryWorkout>[] = crossfitWODs.map((wod) => {
      const intensity = inferIntensity(wod);
      const equipment = inferEquipment(wod);
      const domains = inferMovementDomains(wod);
      const tags = inferTags(wod);
      const rxWeight = extractRxWeight(wod);
      const targetTime = extractTargetTime(wod);

      return {
        name: wod.name,
        type: wod.type as any,
        duration: wod.duration,
        description: wod.description,
        movements: wod.movements,
        notes: wod.notes,
        intensity,
        equipmentNeeded: equipment,
        movementDomains: domains,
        tags,
        isBenchmark: tags.includes('benchmark'),
        isHeroWOD: tags.includes('hero_wod'),
        rxWeight,
        targetTime,
        popularityScore: 0,
        isActive: true,
      };
    });

    // Save to database
    const saved = await libraryService.bulkCreate(libraryWorkouts);

    console.log(`✅ Successfully migrated ${saved.length} workouts to database!\n`);
    console.log('📋 Summary:');
    console.log(`   - Benchmarks: ${saved.filter(w => w.isBenchmark).length}`);
    console.log(`   - Hero WODs: ${saved.filter(w => w.isHeroWOD).length}`);
    console.log(`   - Beginner: ${saved.filter(w => w.intensity === 'beginner').length}`);
    console.log(`   - Intermediate: ${saved.filter(w => w.intensity === 'intermediate').length}`);
    console.log(`   - Advanced: ${saved.filter(w => w.intensity === 'advanced').length}`);
    console.log(`   - Bodyweight: ${saved.filter(w => w.equipmentNeeded === 'bodyweight').length}`);
    console.log(`   - Dumbbells: ${saved.filter(w => w.equipmentNeeded === 'dumbbells').length}`);
    console.log(`   - Full Gym: ${saved.filter(w => w.equipmentNeeded === 'fullgym').length}\n`);

    console.log('🎉 Migration complete! You can now add more workouts to the database directly.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrateWODsToDatabase()
    .then(() => {
      console.log('\n✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateWODsToDatabase };









