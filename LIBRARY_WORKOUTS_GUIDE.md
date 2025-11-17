# Library Workouts System - Expansion Guide

## Overview

This system allows you to scale from ~20 workouts to 100+ workouts while maintaining consistency and quality. The library is now stored in a **database** instead of a TypeScript file, enabling:

- ✅ **Direct selection** from proven workouts (no AI hallucination)
- ✅ **Smart filtering** by user preferences
- ✅ **Hybrid approach** (library + AI generation)
- ✅ **Better consistency** for programmed workouts
- ✅ **Easy management** (add/edit workouts via database or admin tools)

## Architecture

### Components

1. **`LibraryWorkout` Entity** (`src/entities/LibraryWorkout.ts`)
   - Database entity storing workout data
   - Rich metadata for filtering (equipment, intensity, tags, etc.)

2. **`LibraryWorkoutService`** (`src/services/LibraryWorkoutService.ts`)
   - Query and filter workouts
   - Match workouts to user preferences
   - Format workouts for AI prompts

3. **`WorkoutSelectionService`** (`src/services/WorkoutSelectionService.ts`)
   - **Hybrid selection**: Decide between library vs AI-generated
   - Configure selection strategy (e.g., 70% library, 30% AI)
   - Convert library workouts to system format

4. **Migration Script** (`src/utils/migrateWODsToDatabase.ts`)
   - Moves workouts from `crossfit-wods.ts` to database
   - Infers metadata automatically

## Setup Instructions

### Step 1: Run Migration

Migrate existing workouts from `crossfit-wods.ts` to the database:

```bash
ts-node src/utils/migrateWODsToDatabase.ts
```

This will:
- Create the `library_workouts` table
- Convert all workouts from `crossfit-wods.ts`
- Infer metadata (intensity, equipment, tags, etc.)
- Populate the database

### Step 2: Verify Migration

Check that workouts were migrated:

```bash
# In your database client or via TypeORM query
SELECT COUNT(*) FROM library_workouts;
SELECT name, type, intensity, equipment_needed FROM library_workouts LIMIT 10;
```

### Step 3: Add More Workouts

#### Option A: Via Code (Recommended for bulk)

Create a script or use TypeORM to add workouts:

```typescript
import { LibraryWorkoutService } from './src/services/LibraryWorkoutService';

const service = new LibraryWorkoutService();

await service.create({
  name: 'Your New WOD',
  type: 'AMRAP',
  duration: 20,
  description: '20 minute AMRAP',
  movements: [
    '5 Pull-ups',
    '10 Push-ups',
    '15 Air Squats',
  ],
  notes: 'Classic CrossFit triplet',
  intensity: 'intermediate',
  equipmentNeeded: 'bodyweight',
  movementDomains: ['gymnastics', 'cardio'],
  tags: ['benchmark', 'short'],
  isBenchmark: true,
  isActive: true,
});
```

#### Option B: Via Database (Direct)

Insert directly into `library_workouts` table:

```sql
INSERT INTO library_workouts (
  name, type, duration, description, movements, 
  intensity, equipment_needed, is_active
) VALUES (
  'Your WOD',
  'For Time',
  15,
  '21-15-9 reps',
  '["21-15-9 Thrusters (43/29 kg)", "21-15-9 Pull-ups"]',
  'intermediate',
  'fullgym',
  1
);
```

#### Option C: CSV Import

1. Export to CSV
2. Use a database tool to import
3. Or write a simple import script

## How It Works

### Current Behavior (After Migration)

The AI services (`AIWorkoutService`, `SingleWorkoutService`) now:

1. **Fetch library workouts** from database (4 random examples)
2. **Include them in AI prompts** as inspiration
3. **AI generates new workouts** based on examples

**Note**: The AI still generates NEW workouts, it doesn't directly select from the library yet. To change this, see "Hybrid Selection" below.

### Hybrid Selection (Recommended)

To get **direct library selection** for consistency:

1. Use `WorkoutSelectionService` instead of `SingleWorkoutService`:

```typescript
import { WorkoutSelectionService } from './src/services/WorkoutSelectionService';

const selectionService = new WorkoutSelectionService();

// This will sometimes pick from library, sometimes AI-generate
const result = await selectionService.selectSingleWorkout({
  timeChoice: 'classic',
  trainingType: 'mixed',
  goalType: 'conditioning',
  gearType: 'fullgym',
  fitnessLevel: 'intermediate',
  strategy: {
    useLibraryPercentage: 70, // 70% library, 30% AI
    preferLibraryForBenchmarks: true,
    useAIIfNoLibraryMatch: true,
  },
});

if (result.source === 'library') {
  console.log('Using library workout:', result.libraryWorkout.name);
} else {
  console.log('AI-generated workout');
}
```

2. **Configure strategy**:
   - `useLibraryPercentage: 100` → Always use library
   - `useLibraryPercentage: 0` → Always use AI
   - `useLibraryPercentage: 70` → 70% library, 30% AI

## Filtering & Matching

The `LibraryWorkoutService` provides powerful filtering:

```typescript
// Find workouts matching user preferences
const workouts = await libraryService.findMatchingWorkouts({
  intensity: 'intermediate',
  equipmentNeeded: 'bodyweight',
  duration: { min: 15, max: 25 },
  movementDomains: ['gymnastics', 'cardio'],
  tags: ['short', 'benchmark'],
  fitnessLevel: 'intermediate',
});

// Find workouts for specific request
const workouts = await libraryService.findForWorkoutRequest({
  timeChoice: 'quick',
  trainingType: 'gymnastics',
  goalType: 'skill',
  gearType: 'bodyweight',
  fitnessLevel: 'beginner',
});
```

### Filter Fields

- `type`: Workout format (AMRAP, EMOM, For Time, etc.)
- `intensity`: beginner | intermediate | advanced
- `equipmentNeeded`: bodyweight | dumbbells | fullgym
- `duration`: { min, max } in minutes
- `movementDomains`: ['gymnastics', 'weightlifting', 'cardio', 'mixed']
- `muscleGroups`: ['upper_body', 'lower_body', 'core', 'full_body']
- `tags`: ['benchmark', 'hero_wod', 'short', 'long', 'grinder', etc.]
- `isBenchmark`: true/false (famous WODs)
- `isHeroWOD`: true/false (Hero workouts)
- `fitnessLevel`: Maps to appropriate intensity

## Metadata Fields

When adding workouts, include metadata for better matching:

### Required Fields

- `name`: Workout name
- `type`: Workout format
- `description`: Brief description
- `movements`: Array of movement strings

### Recommended Fields

- `intensity`: Fitness level (beginner/intermediate/advanced)
- `equipmentNeeded`: What equipment is required
- `duration`: Estimated duration in minutes
- `movementDomains`: ['gymnastics', 'weightlifting', 'cardio', 'mixed']
- `tags`: ['benchmark', 'short', 'long', 'grinder', etc.]
- `rxWeight`: Prescribed weight (e.g., "43/29 kg")
- `targetTime`: Target completion time (e.g., "Sub 12 minutes")

### Optional Fields

- `notes`: Scaling options, modifications
- `isBenchmark`: Mark famous WODs (Fran, Murph, etc.)
- `isHeroWOD`: Mark Hero workouts
- `workoutStructure`: Full structured workout with blocks (for single sessions)
- `popularityScore`: Usage counter (auto-increments on use)

## Best Practices for 100+ Workouts

### 1. **Organize by Categories**

Use tags to organize:
- `benchmark`: Famous WODs
- `hero_wod`: Hero workouts
- `short`: < 20 min
- `long`: > 40 min
- `grinder`: Endurance-focused
- `strength`: Heavy lifting focus
- `metcon`: Metabolic conditioning

### 2. **Consistent Metadata**

Always fill:
- `intensity` (helps filter by fitness level)
- `equipmentNeeded` (critical for matching)
- `movementDomains` (helps match training type)
- `duration` (helps match time preferences)

### 3. **Quality Over Quantity**

For library workouts:
- Only add proven, well-tested workouts
- Include proper scaling notes
- Specify RX weight clearly
- Add target times for benchmarks

### 4. **Regular Reviews**

- Track popularity scores
- Disable (set `isActive = false`) workouts users don't like
- Update metadata as needed

### 5. **Bulk Import Process**

For adding 100+ workouts:

1. **Prepare CSV/JSON**:
```json
[
  {
    "name": "WOD Name",
    "type": "AMRAP",
    "duration": 20,
    "description": "...",
    "movements": ["..."],
    "intensity": "intermediate",
    "equipmentNeeded": "bodyweight",
    ...
  }
]
```

2. **Create import script**:
```typescript
import { LibraryWorkoutService } from './src/services/LibraryWorkoutService';
import workouts from './workouts-to-import.json';

const service = new LibraryWorkoutService();
await service.bulkCreate(workouts);
```

3. **Verify imports**: Check counts, test filtering

## Migration from crossfit-wods.ts

The old `crossfit-wods.ts` file will continue to work but is now deprecated. After migration:

1. ✅ **Database is the source of truth** for library workouts
2. ✅ **AI services automatically use database** instead of the file
3. ⚠️ **Old file can be kept** for reference but won't be used

To fully deprecate:
- Remove `getWODExamplesForAI()` calls (already updated)
- Keep file for reference if needed
- All new workouts go to database

## API Integration

To integrate with your API:

### Direct Library Selection

```typescript
import { LibraryWorkoutService } from './services/LibraryWorkoutService';

// In your controller
const libraryService = new LibraryWorkoutService();
const matching = await libraryService.findForWorkoutRequest({
  timeChoice: req.body.timeChoice,
  trainingType: req.body.trainingType,
  ...
});

if (matching.length > 0) {
  // Use library workout
} else {
  // Fall back to AI
}
```

### Hybrid Selection

```typescript
import { WorkoutSelectionService } from './services/WorkoutSelectionService';

const selectionService = new WorkoutSelectionService();
const result = await selectionService.selectSingleWorkout(userRequest);

// result.source === 'library' | 'ai'
// result.workout contains the workout
```

## Troubleshooting

### No workouts found?

1. **Check database**: Verify workouts exist
   ```sql
   SELECT COUNT(*) FROM library_workouts WHERE is_active = 1;
   ```

2. **Check filters**: Your filters might be too strict
   - Try removing filters one by one
   - Check if equipment/fitness level matches

3. **Migration status**: Ensure migration ran successfully

### AI still generating instead of using library?

- Make sure you're using `WorkoutSelectionService` (not just `SingleWorkoutService`)
- Check your strategy settings (`useLibraryPercentage`)
- Verify library workouts match user preferences

### Metadata missing?

- Re-run migration (if using crossfit-wods.ts)
- Manually update metadata via database
- Use the `LibraryWorkoutService.update()` method

## Next Steps

1. ✅ Run migration
2. ✅ Verify database populated
3. ✅ Add more workouts (aim for 100+)
4. ✅ Integrate `WorkoutSelectionService` for hybrid selection
5. ✅ Monitor which workouts users prefer
6. ✅ Build admin interface for managing workouts (optional)

## Summary

**The best solution for 100+ workouts:**

1. ✅ **Database storage** - Scalable, queryable, manageable
2. ✅ **Rich metadata** - Filter by equipment, intensity, duration, etc.
3. ✅ **Hybrid selection** - Mix library (consistency) + AI (variety)
4. ✅ **Smart filtering** - Match workouts to user preferences
5. ✅ **Easy expansion** - Add workouts via database, scripts, or admin tools

This gives you **control** (library workouts) + **variety** (AI generation) + **scalability** (database)!










